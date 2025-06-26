# Google OAuth Setup for Doraemon Chat Bot

This guide explains how to set up Google OAuth for the Doraemon Chat Bot application.

## Setting Up Google OAuth

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "OAuth consent screen"
   - Set up the consent screen (External or Internal)
   - Add required scopes (email, profile)
   - Add test users if needed

2. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add a name for your OAuth client
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production domain (if applicable)
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - Your production callback URL (if applicable)
   - Click "Create"
   - Note your Client ID and Client Secret

3. **Update Environment Variables**
   - Open your `.env` file in the server directory
   - Update the Google OAuth credentials:
     ```
     GOOGLE_CLIENT_ID=your-client-id
     GOOGLE_CLIENT_SECRET=your-client-secret
     ```

## How Google Authentication Works

1. **Frontend**:
   - Users click "Sign in with Google" button which links to `/api/auth/google`
   - After successful authentication, they are redirected to `/auth/google/success` with a token

2. **Backend**:
   - When users visit `/api/auth/google`, they are redirected to Google's authentication page
   - After successful authentication, Google redirects back to `/api/auth/google/callback`
   - The server verifies the authentication, creates or finds the user, and issues a JWT token
   - The user is redirected back to the frontend with the token

3. **Linking Accounts**:
   - If a user signs up with Google and their email matches an existing account, the accounts are linked
   - This allows users to log in with either their password or Google

## Testing Google Authentication

To test the Google authentication:

1. Set up your Google OAuth credentials in the `.env` file
2. Start your server and client applications
3. Visit the login page and click the "Sign in with Google" button
4. Complete the Google authentication flow
5. You should be redirected back to your application and logged in

## Troubleshooting

- **Redirect URI Mismatch**: Ensure that the callback URL in your Google Cloud Console matches the one in your application
- **Invalid Client ID**: Verify that your Client ID in the `.env` file is correct
- **Invalid Client Secret**: Check that your Client Secret in the `.env` file is correct
- **CORS Issues**: Make sure your CORS settings allow requests from your client application
- **JWT Token Issues**: Verify that the JWT_SECRET in your `.env` file is set correctly 