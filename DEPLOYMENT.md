# Deploying ISRA to Vercel

Follow these steps to deploy your application to Vercel.

## 1. Prepare your Project locally

I have already configured your project for secure deployment:

- **Environment Variables**: Moved hardcoded keys to `.env`.
- **Git Ignore**: Created `.gitignore` to prevent sensitive keys from being uploaded.

## 2. Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new) named `isra-dashboard`.
2. Open your terminal in the project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/isra-dashboard.git
   git push -u origin main
   ```

## 3. Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** > **"Project"**.
2. Select your `isra-dashboard` repository and click **Import**.
3. In the **Configure Project** screen:
   - **Framework Preset**: Vite (should be auto-detected)
   - **Environment Variables**: Expand this section and add the keys from your local `.env` file:
     - `VITE_FIREBASE_API_KEY`: (Copy value from .env)
     - `VITE_FIREBASE_AUTH_DOMAIN`: (Copy value from .env)
     - `VITE_FIREBASE_PROJECT_ID`: (Copy value from .env)
     - `VITE_FIREBASE_STORAGE_BUCKET`: (Copy value from .env)
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`: (Copy value from .env)
     - `VITE_FIREBASE_APP_ID`: (Copy value from .env)
4. Click **Deploy**.

## 4. Final Security Check (Important!)

Your Firestore rules are currently in "Test Mode". For production, go to the [Firebase Console](https://console.firebase.google.com/u/0/project/isra-2663e/firestore/rules) and update your rules to be more secure, for example:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // WARNING: Change this if you implement Auth later!
    }
  }
}
```

_Note: Since we removed the auth login, blocking write access might break the survey submission. Keep it open or implement strict validation rules if public access is a concern._
