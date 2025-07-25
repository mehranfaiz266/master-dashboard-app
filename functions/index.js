const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { BigQuery } = require("@google-cloud/bigquery");

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
 * This is an HTTP callable function, which means our React app can call it directly.
 */
exports.createClient = functions.https.onCall(async (data, context) => {
  // Log the data we received from the frontend.
  functions.logger.info("Received create client request with data:", data);

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

  return {
    status: "success",
    message: `Client "${companyName}" created successfully.`,
    clientId: userRecord.uid,
  };
});

/**
 * Creates a new campaign for a client and records it in BigQuery.
 */
exports.createCampaign = functions.https.onCall(async (data, context) => {
  functions.logger.info("Received create campaign request with data:", data);

  const { clientId, name, callNumber } = data;

  // Campaign records live inside the client's dataset under a `campaigns` table
  const datasetId = `client_${clientId}`;
  const campaignsTable = await ensureClientTable(datasetId, "campaigns", [
    { name: "campaignId", type: "STRING" },
    { name: "name", type: "STRING" },
    { name: "callNumber", type: "STRING" },
    { name: "createdAt", type: "TIMESTAMP" },
  ]);
  const campaignId = `campaign_${Date.now()}`;

  try {
    await campaignsTable.insert({
      campaignId,
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
    campaignId,
  };
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
