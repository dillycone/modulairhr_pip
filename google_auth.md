The error indicates that Google authentication isn't enabled in your Supabase project. To fix this:
Go to your Supabase dashboard (https://app.supabase.com)
Select your project
Navigate to Authentication → Providers
Find Google in the list and enable it
Add your Google OAuth credentials (Client ID and Client Secret)
Save changes
If you don't have Google OAuth credentials yet, you'll need to:
Create them in the Google Cloud Console (https://console.cloud.google.com)
Set up an OAuth consent screen
Create OAuth client ID credentials with the redirect URI: https://axixiggyambwgfcfhyld.supabase.co/auth/v1/callback 