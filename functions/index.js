const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');
const crypto = require('crypto');

admin.initializeApp();

const bigquery = new BigQuery();
const datasetId = 'crm';
const projectId = process.env.GCLOUD_PROJECT;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Authentication middleware using Firebase ID tokens
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).send('Unauthorized');
  }
  try {
    req.user = await admin.auth().verifyIdToken(match[1]);
    next();
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
});

function table(name) {
  return bigquery.dataset(datasetId).table(name);
}

function generateId() {
  return crypto.randomUUID();
}

app.get('/clients', async (req, res) => {
  const [rows] = await bigquery.query({
    query: `SELECT id, company_name, contact_id FROM \`${projectId}.${datasetId}.clients\``,
  });
  res.json(
    rows.map(r => ({
      id: r.id,
      companyName: r.company_name,
      contactId: r.contact_id,
    }))
  );
});

app.post('/clients', async (req, res) => {
  const { companyName, members = [], contactId } = req.body;
  const id = generateId();
  await bigquery.query({
    query: `INSERT \`${projectId}.${datasetId}.clients\` (id, company_name, contact_id) VALUES (@id, @companyName, @contactId)`,
    params: { id, companyName, contactId: contactId || null },
  });
  if (members.length) await insertMembers(id, members);
  res.json({ id });
});

app.get('/clients/:id', async (req, res) => {
  const id = req.params.id;
  const [clientRows] = await bigquery.query({
    query: `SELECT id, company_name, contact_id FROM \`${projectId}.${datasetId}.clients\` WHERE id=@id`,
    params: { id },
  });
  if (!clientRows.length) return res.status(404).send('Not found');
  const client = {
    id: clientRows[0].id,
    companyName: clientRows[0].company_name,
    contactId: clientRows[0].contact_id,
  };
  const [memberRows] = await bigquery.query({
    query: `SELECT id, first_name, last_name, email, phone FROM \`${projectId}.${datasetId}.members\` WHERE client_id=@id`,
    params: { id },
  });
  client.members = memberRows.map(r => ({
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    phone: r.phone,
  }));
  const [campaignRows] = await bigquery.query({
    query: `SELECT id, name FROM \`${projectId}.${datasetId}.campaigns\` WHERE client_id=@id`,
    params: { id },
  });
  client.campaigns = campaignRows.map(r => ({ id: r.id, name: r.name }));
  const [numberRows] = await bigquery.query({
    query: `SELECT id, number FROM \`${projectId}.${datasetId}.phone_numbers\` WHERE client_id=@id`,
    params: { id },
  });
  client.numbers = numberRows.map(r => ({ id: r.id, number: r.number }));
  res.json(client);
});

app.put('/clients/:id', async (req, res) => {
  const id = req.params.id;
  const { companyName, members = [], contactId } = req.body;
  await bigquery.query({
    query: `UPDATE \`${projectId}.${datasetId}.clients\` SET company_name=@companyName, contact_id=@contactId WHERE id=@id`,
    params: { companyName, contactId: contactId || null, id },
  });
  await bigquery.query({
    query: `DELETE FROM \`${projectId}.${datasetId}.members\` WHERE client_id=@id`,
    params: { id },
  });
  if (members.length) await insertMembers(id, members);
  res.sendStatus(204);
});

app.post('/clients/:id/campaigns', async (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  const cid = generateId();
  await bigquery.query({
    query: `INSERT \`${projectId}.${datasetId}.campaigns\` (id, client_id, name) VALUES (@cid, @id, @name)`,
    params: { cid, id, name },
  });
  res.json({ id: cid, name });
});

app.delete('/clients/:id/campaigns/:cid', async (req, res) => {
  const { id, cid } = req.params;
  await bigquery.query({
    query: `DELETE FROM \`${projectId}.${datasetId}.campaigns\` WHERE client_id=@id AND id=@cid`,
    params: { id, cid },
  });
  res.sendStatus(204);
});

app.post('/clients/:id/phoneNumbers', async (req, res) => {
  const id = req.params.id;
  const { number } = req.body;
  const nid = generateId();
  await bigquery.query({
    query: `INSERT \`${projectId}.${datasetId}.phone_numbers\` (id, client_id, number) VALUES (@nid, @id, @number)`,
    params: { nid, id, number },
  });
  res.json({ id: nid, number });
});

app.delete('/clients/:id/phoneNumbers/:nid', async (req, res) => {
  const { id, nid } = req.params;
  await bigquery.query({
    query: `DELETE FROM \`${projectId}.${datasetId}.phone_numbers\` WHERE client_id=@id AND id=@nid`,
    params: { id, nid },
  });
  res.sendStatus(204);
});

async function insertMembers(clientId, members) {
  const rows = members.map(m => ({
    id: m.id || generateId(),
    client_id: clientId,
    first_name: m.firstName,
    last_name: m.lastName,
    email: m.email,
    phone: m.phone,
  }));
  const tableRef = table('members');
  await tableRef.insert(rows);
}

exports.api = functions.region('us-central1').https.onRequest(app);
