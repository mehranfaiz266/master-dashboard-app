const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

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
    subscriptionPlan,
  } = data;

  // --- TODO: Add logic here to: ---
  // 1. Create a user in Firebase Authentication using admin.auth().createUser()
  // 2. Create a new dataset in BigQuery using the BigQuery Node.js client library.
  // 3. Add the new client's details to the `clients` table in the master_data dataset.

  // For now, just return a success message.
  return {
    status: "success",
    message: `Client "${companyName}" created successfully (simulation).`,
    clientId: `simulated-id-${Date.now()}`, // Return a simulated new client ID
  };
});
