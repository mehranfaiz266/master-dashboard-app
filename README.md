# Master Dashboard App

This project is a small React + Firebase prototype for managing clients and leads.

## Features
- Firebase email/password login
- Dashboard with three main sections:
  - **Client Management** – view, create and edit clients. Creating a client calls a Firebase Cloud Function that provisions BigQuery resources.
  - **Campaign Management** – list campaigns and associated call numbers.
  - **Lead Management** – search by phone number and filter by client or campaign.
- Firebase Cloud Functions `createClient` and `createCampaign` provision BigQuery datasets and tables. The dashboard calls these functions when onboarding a new client.

## Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Run tests (none included yet). If you don't have any test files, use
   the `--passWithNoTests` flag so the command exits successfully:
   ```bash
   npm test -- --watchAll=false --passWithNoTests
   ```

This repo is intended as a starting point and uses Tailwind CSS for styling. The backend functions are left as TODOs for further expansion.
The Cloud Functions expect credentials with access to BigQuery. Deploy using a service account that has permission to create datasets and tables.

## Updating your local copy

If you already cloned the project in VS Code, fetch the latest code and start the dev server:

```bash
git pull
npm install
npm start
```

This pulls the newest version and installs any dependencies.
