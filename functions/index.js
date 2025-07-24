const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { BigQuery } = require("@google-cloud/bigquery");

// Initialize both Firebase Admin and BigQuery clients
admin.initializeApp();
const bigquery = new BigQuery();

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
    // Ignore "Already Exists" errors so function is idempotent
    if (!err.message.includes('Already Exists')) {
      throw err;
    }
  }

  // 3. Record the new client in the shared master_data dataset
  const masterDataset = bigquery.dataset("master_data");
  const clientsTable = masterDataset.table("clients");
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
  const campaignsTable = bigquery.dataset(datasetId).table("campaigns");
  const campaignId = `campaign_${Date.now()}`;

  await campaignsTable.insert({
    campaignId,
    name,
    callNumber,
    createdAt: new Date().toISOString(),
  });

  return {
    status: "success",
    message: `Campaign "${name}" for client ${clientId} created successfully.`,
    campaignId,
  };
});
