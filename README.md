# Dashboard Example

This is a simple React + Firebase project showing a basic dashboard. After logging in you can manage clients along with their campaigns and phone numbers. Data is stored in Firestore and a sample Cloud Function is included.

## Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project

## Setup

1. Install dependencies:
   ```bash
   npm install
   npm --prefix functions install
   ```
2. Create a `.env.local` file in the project root with your Firebase config:
   ```
   REACT_APP_FIREBASE_API_KEY=your_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

## Development

Start the React app:
```bash
npm start
```

You can emulate Cloud Functions and Firestore locally:
```bash
firebase emulators:start --only functions,firestore
```

Run tests (none exist yet):
```bash
npm test -- --watchAll=false --passWithNoTests
```

## Deployment

Build and deploy using the Firebase CLI:
```bash
npm run build
firebase deploy
```
