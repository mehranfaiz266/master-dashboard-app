const { BigQuery } = require('@google-cloud/bigquery');

async function main() {
  const bigquery = new BigQuery();
  try {
    const [datasets] = await bigquery.getDatasets();
    console.log(`BigQuery connection successful. Found ${datasets.length} datasets.`);
  } catch (err) {
    console.error('Unable to connect to BigQuery:', err.message);
    process.exitCode = 1;
  }
}

main();
