const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { BigQuery } = require("@google-cloud/bigquery");
const cors = require('cors')({ origin: true });

// Initialize both Firebase Admin and BigQuery clients
admin.initializeApp();
const bigquery = new BigQuery();

async function ensureClientTable(datasetId, tableId, schema) {
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(tableId);
  const [exists] = await table.exists();
  if (!exists) {
    await table.create({ schema });
  }
  return table;
}

async function ensureMasterTable(tableId, schema) {
  const datasetId = "master_data";
  let dataset = bigquery.dataset(datasetId);
  const [datasetExists] = await dataset.exists();
  if (!datasetExists) {
    await bigquery.createDataset(datasetId, { location: "US" });
    dataset = bigquery.dataset(datasetId);
  }
  const table = dataset.table(tableId);
  const [exists] = await table.exists();
  if (!exists) {
    await table.create({ schema });
  }
  return table;
}

/**
 * Creates a new client account and provisions their resources.
 * Converted to an HTTP function so we can easily log the request body
 * and return detailed error messages.
 */
exports.createClient = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    console.log('createClient triggered');
    console.log('Request body:', req.body);
    functions.logger.info('Received create client request with data:', req.body);
    try {
      const data = req.body;

    // --- Authentication Check (Placeholder) ---
    // In a real app, we would check if the user calling this function is a Super Admin.
    // For now, we will skip this to keep it simple.
    // if (!context.auth || !context.auth.token.superAdmin) {
    //   throw new functions.https.HttpsError(
    //     "permission-denied",
    //     "You must be a Super Admin to create a new client."
    //   );
    // }

    const {
      companyName,
      contactFullName,
      contactEmail,
    } = data;

  // 1. Create a user for the client's primary contact
  const userRecord = await admin.auth().createUser({
    email: contactEmail,
    displayName: contactFullName,
  });

  // 2. Provision a BigQuery dataset for this client
  const datasetId = `client_${userRecord.uid}`;
  try {
    await bigquery.createDataset(datasetId, { location: "US" });
  } catch (err) {
    if (!err.message.includes("Already Exists")) {
      throw err;
    }
  }

  // ensure default tables inside the client dataset
  await ensureClientTable(datasetId, "campaigns", [
    { name: "campaignId", type: "STRING" },
    { name: "name", type: "STRING" },
    { name: "callNumber", type: "STRING" },
    { name: "createdAt", type: "TIMESTAMP" },
  ]);
  await ensureClientTable(datasetId, "numbers", [
    { name: "id", type: "INT64" },
    { name: "number", type: "STRING" },
    { name: "createdAt", type: "TIMESTAMP" },
  ]);
  await ensureClientTable(datasetId, "members", [
    { name: "memberId", type: "STRING" },
    { name: "firstName", type: "STRING" },
    { name: "lastName", type: "STRING" },
    { name: "phone", type: "STRING" },
    { name: "email", type: "STRING" },
  ]);
  await ensureClientTable(datasetId, "leads", [
    { name: "leadId", type: "STRING" },
    { name: "phoneNumber", type: "STRING" },
    { name: "campaignId", type: "STRING" },
    { name: "disposition", type: "STRING" },
    { name: "createdAt", type: "TIMESTAMP" },
  ]);

  // 3. Record the new client in the shared master_data dataset
  const clientsTable = await ensureMasterTable("clients", [
    { name: "clientId", type: "STRING" },
    { name: "companyName", type: "STRING" },
    { name: "contactEmail", type: "STRING" },
    { name: "contactFullName", type: "STRING" },
    { name: "createdAt", type: "TIMESTAMP" },
  ]);
  await clientsTable.insert({
    clientId: userRecord.uid,
    companyName,
    contactEmail,
    contactFullName,
    createdAt: new Date().toISOString(),
  });

    res.json({
      status: "success",
      message: `Client "${companyName}" created successfully.`,
      clientId: userRecord.uid,
    });
  } catch (e) {
    console.error('Error in createClient:', e);
    res.status(500).send('Failed to create client: ' + e.message);
  }
  });
});

/**
 * Creates a new campaign for a client and records it in BigQuery.
 */
exports.createCampaign = functions.https.onCall(async (data) => {
  functions.logger.info("Received create campaign request with data:", data);

  const { clientId, name, callNumber } = data;

  const clientDataset = `client_${clientId}`;
  const clientCampaigns = await ensureClientTable(clientDataset, "campaigns", [
    { name: "campaignId", type: "STRING" },
    { name: "name", type: "STRING" },
    { name: "callNumber", type: "STRING" },
    { name: "createdAt", type: "TIMESTAMP" },
  ]);

  const masterCampaigns = await ensureMasterTable("campaigns", [
    { name: "id", type: "INT64" },
    { name: "name", type: "STRING" },
    { name: "clientId", type: "INT64" },
    { name: "callNumber", type: "STRING" },
  ]);

  const [existing] = await masterCampaigns.getRows();
  if (existing.some(r => r.callNumber === callNumber && String(r.clientId) !== String(clientId))) {
    throw new functions.https.HttpsError("already-exists", "Call number already assigned to another campaign.");
  }

  const id = Date.now();

  try {
    await masterCampaigns.insert({ id, name, clientId: parseInt(clientId, 10), callNumber });
    await clientCampaigns.insert({
      campaignId: `campaign_${id}`,
      name,
      callNumber,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    throw new functions.https.HttpsError("internal", err.message);
  }

  return {
    status: "success",
    message: `Campaign "${name}" for client ${clientId} created successfully.`,
    campaignId: id,
  };
});

/**
 * Creates a new call number and assigns it to a client.
 */
exports.createCallNumber = functions.https.onCall(async (data) => {
  const { clientId, number } = data;

  if (!clientId || !number) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "clientId and number are required"
    );
  }

  const numbersTable = await ensureMasterTable("call_numbers", [
    { name: "id", type: "INT64" },
    { name: "number", type: "STRING" },
    { name: "clientId", type: "INT64" },
  ]);

  const [existing] = await numbersTable.getRows();
  if (existing.some((r) => r.number === number)) {
    throw new functions.https.HttpsError(
      "already-exists",
      "Number already exists"
    );
  }

  const id = Date.now();

  const clientDataset = `client_${clientId}`;
  const clientNumbers = await ensureClientTable(clientDataset, "numbers", [
    { name: "id", type: "INT64" },
    { name: "number", type: "STRING" },
    { name: "createdAt", type: "TIMESTAMP" },
  ]);

  try {
    await numbersTable.insert({ id, number, clientId: parseInt(clientId, 10) });
    await clientNumbers.insert({
      id,
      number,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    throw new functions.https.HttpsError("internal", err.message);
  }

  return { status: "success", id };
});

/**
 * Fetch dashboard data from BigQuery. If the dataset or tables do not exist
 * they will be created on the fly. The function returns all clients, call
 * numbers and campaigns.
 */
exports.getMasterData = functions.https.onCall(async () => {
  // Ensure the shared dataset exists
  const datasetId = "master_data";
  let dataset = bigquery.dataset(datasetId);
  const [datasetExists] = await dataset.exists();
  if (!datasetExists) {
    await bigquery.createDataset(datasetId, { location: "US" });
    dataset = bigquery.dataset(datasetId);
  }

  // Helper to ensure a table exists with a given schema
  async function ensureTable(tableId, schema) {
    const table = dataset.table(tableId);
    const [exists] = await table.exists();
    if (!exists) {
      await table.create({ schema });
    }
    return table;
  }

  const clientsTable = await ensureTable("clients", [
    { name: "clientId", type: "STRING" },
    { name: "companyName", type: "STRING" },
    { name: "contactEmail", type: "STRING" },
    { name: "contactFullName", type: "STRING" },
    { name: "createdAt", type: "TIMESTAMP" },
  ]);

  const numbersTable = await ensureTable("call_numbers", [
    { name: "id", type: "INT64" },
    { name: "number", type: "STRING" },
    { name: "clientId", type: "INT64" },
  ]);

  const campaignsTable = await ensureTable("campaigns", [
    { name: "id", type: "INT64" },
    { name: "name", type: "STRING" },
    { name: "clientId", type: "INT64" },
    { name: "callNumber", type: "STRING" },
  ]);

  const leadsTable = await ensureTable("leads", [
    { name: "id", type: "INT64" },
    { name: "phoneNumber", type: "STRING" },
    { name: "clientId", type: "INT64" },
    { name: "campaignId", type: "STRING" },
    { name: "disposition", type: "STRING" },
    { name: "createdAt", type: "TIMESTAMP" },
  ]);

  // Fetch the rows from each table
  const [clients] = await clientsTable.getRows();
  const [callNumbers] = await numbersTable.getRows();
  const [campaigns] = await campaignsTable.getRows();
  const [leads] = await leadsTable.getRows();

  return { clients, callNumbers, campaigns, leads };
});

exports.getGlobalKpis = functions.https.onCall(async () => {
  const masterDataset = bigquery.dataset("master_data");
  const clientsTable = masterDataset.table("clients");
  const leadsTable = masterDataset.table("leads");

  const [clients] = await clientsTable.getRows();
  const [leads] = await leadsTable.getRows();

  return {
    totalCalls: leads.length,
    totalLeads: leads.length,
    activeClients: clients.length,
    systemHealth: "Normal",
  };
});

// Test BigQuery connection and optionally create a dataset
exports.testBigQueryConnection = functions.https.onCall(async (data) => {
  const datasetId = data?.datasetId || "test_dataset";
  try {
    let dataset = bigquery.dataset(datasetId);
    const [exists] = await dataset.exists();
    if (!exists) {
      await bigquery.createDataset(datasetId, { location: "US" });
      dataset = bigquery.dataset(datasetId);
    }
    await dataset.getMetadata();
    return { status: "success", datasetId };
  } catch (err) {
    throw new functions.https.HttpsError("internal", err.message);
  }
});
