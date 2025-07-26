# Dashboard with BigQuery

This project is a simple CRM-style dashboard built with React and Firebase Authentication. All data for clients, members, campaigns and phone numbers is stored in **BigQuery** and accessed through Firebase Cloud Functions.

## Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project
- A BigQuery dataset named `crm` with the following tables:
  - `clients` (`id` STRING, `company_name` STRING, `contact_id` STRING)
  - `members` (`id` STRING, `client_id` STRING, `first_name` STRING, `last_name` STRING, `email` STRING, `phone` STRING)
  - `campaigns` (`id` STRING, `client_id` STRING, `name` STRING)
  - `phone_numbers` (`id` STRING, `client_id` STRING, `number` STRING)

## Setup

1. Install dependencies
   ```bash
   npm install
   npm --prefix functions install
   ```
2. Create a `.env.local` file in the project root with your Firebase config and API URL
   ```
   REACT_APP_FIREBASE_API_KEY=your_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_API_URL=https://us-central1-your_project_id.cloudfunctions.net/api
   ```
3. Make sure your Firebase service account has access to the BigQuery dataset.

## Development

Start the React app
```bash
npm start
```

Run the Cloud Functions emulator (requires BigQuery credentials on your machine)
```bash
npm --prefix functions run serve
```

Run tests
```bash
npm test -- --watchAll=false --passWithNoTests
```

## Deployment

Build and deploy the application
```bash
npm run build
firebase deploy
```
