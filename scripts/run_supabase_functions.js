/**
 * This script demonstrates how to run the SQL functions we created
 * using the Supabase JavaScript client.
 * 
 * You need to run these functions via the Supabase Dashboard SQL Editor
 * or set up Supabase CLI for migrations.
 * 
 * Execute the SQL commands from supabase/migrations/20230505000000_create_pips_functions.sql
 * directly in the Supabase Dashboard SQL Editor.
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Demo function for getting a user's PIPs using the RPC function
 */
async function getUserPips(userId) {
  try {
    const { data, error } = await supabase.rpc('get_user_pips', {
      user_id: userId
    });

    if (error) {
      throw error;
    }

    console.log('User PIPs:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user PIPs:', error);
    return null;
  }
}

/**
 * Demo function for creating a PIP using the RPC function
 */
async function createPip(pipData) {
  try {
    const { data, error } = await supabase.rpc('create_pip', {
      pip_data: pipData
    });

    if (error) {
      throw error;
    }

    console.log('Created PIP:', data);
    return data;
  } catch (error) {
    console.error('Error creating PIP:', error);
    return null;
  }
}

async function main() {
  // Example: Replace with an actual user ID from your system
  const userId = 'replace-with-actual-user-id';
  
  // Example: Create a new PIP
  const pipData = {
    employee_name: 'John Doe',
    start_date: '2023-06-01',
    end_date: '2023-09-01',
    objectives: 'Complete project on time',
    improvements_needed: 'Improve communication',
    success_metrics: 'Meeting all deadlines',
    status: 'draft',
    created_by: userId
  };
  
  // Uncomment these lines to test the functions
  // await createPip(pipData);
  // await getUserPips(userId);
}

// Run the main function
// main().catch(console.error);

console.log(`
To execute the SQL functions:

1. Go to the Supabase Dashboard
2. Navigate to the SQL Editor
3. Paste and execute the content of supabase/migrations/20230505000000_create_pips_functions.sql
4. This will create the get_user_pips and create_pip functions

Then, you can use these functions in your API as shown in this script.
`); 