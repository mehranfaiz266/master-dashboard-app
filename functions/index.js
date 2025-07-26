const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();

exports.helloWorld = functions.region('us-central1').https.onRequest((req, res) => {
  res.json({ message: 'Hello from Firebase!' });
});
