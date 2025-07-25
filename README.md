# Master Dashboard App

This project is a small React + Firebase prototype for managing clients and leads.

## Features
- Firebase email/password login
- Dashboard with three main sections:
  - **Client Management** – view, create and edit clients. Creating a client calls a Firebase Cloud Function that provisions BigQuery resources.
  - **Campaign Management** – list campaigns and associated call numbers.
  - **Lead Management** – search by phone number and filter by client or campaign.
  - Firebase Cloud Functions `createClient`, `createCampaign` and `getGlobalKpis` manage and return live data from BigQuery.

## Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Run tests (none included yet). Make sure dependencies are installed with
   `npm install` first. If you don't have any test files, use the
   `--passWithNoTests` flag so the command exits successfully:
   ```bash
   npm test -- --watchAll=false --passWithNoTests
   ```

This repo is intended as a starting point and uses Tailwind CSS for styling. The dashboard now loads all data directly from BigQuery via Cloud Functions and no longer relies on mock objects.
The Cloud Functions expect credentials with access to BigQuery. Deploy using a service account that has permission to create datasets and tables.

### Cloud Functions runtime

Cloud Functions need a supported Node.js version to deploy successfully.
The `functions/package.json` file specifies the version under the `engines` key.
Make sure it is set to `"18"` (or another supported version) before running
`firebase deploy`.

### Using BigQuery for live data

1. Create a Google Cloud service account with permissions to manage BigQuery datasets and tables.
2. Download its JSON key file and set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of this file when running the Firebase functions locally or deploying.
3. The `getMasterData` Cloud Function will automatically create the `master_data` dataset and the `clients`, `call_numbers`, `campaigns` and `leads` tables if they do not exist.
4. When the React app loads it calls this function along with `getGlobalKpis` to pull the latest data from BigQuery.

## Updating your local copy

If you already cloned the project in VS Code, fetch the latest code and start the dev server:

```bash
git pull
npm install
npm start
```

This pulls the newest version and installs any dependencies.
