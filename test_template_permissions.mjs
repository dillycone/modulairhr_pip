// Template Permissions Test Script
// Run with: node test_template_permissions.mjs

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

// Basic validation
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(chalk.red('Error: Supabase URL and Anon Key are required.'));
  console.log('Please set these environment variables in a .env file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key');
  console.log('TEST_ADMIN_EMAIL=admin@example.com');
  console.log('TEST_ADMIN_PASSWORD=adminpassword');
  console.log('TEST_USER_EMAIL=user@example.com');
  console.log('TEST_USER_PASSWORD=userpassword');
  process.exit(1);
}

// Test cases
const testCases = [
  { 
    name: 'Admin can create a template',
    role: 'admin',
    operation: 'create',
    expectSuccess: true 
  },
  { 
    name: 'Admin can view templates',
    role: 'admin',
    operation: 'read',
    expectSuccess: true 
  },
  { 
    name: 'Admin can update their own template',
    role: 'admin',
    operation: 'update',
    expectSuccess: true 
  },
  { 
    name: 'Admin can delete their own template',
    role: 'admin',
    operation: 'delete',
    expectSuccess: true 
  },
  { 
    name: 'Regular user cannot create a template',
    role: 'user',
    operation: 'create',
    expectSuccess: false 
  },
  { 
    name: 'Regular user can view templates',
    role: 'user',
    operation: 'read',
    expectSuccess: true 
  },
  { 
    name: 'Regular user cannot update templates',
    role: 'user',
    operation: 'update',
    expectSuccess: false 
  },
  { 
    name: 'Regular user cannot delete templates',
    role: 'user',
    operation: 'delete',
    expectSuccess: false 
  }
];

// Helper function to create a template
async function createTemplate(supabase, name) {
  const { data, error } = await supabase
    .from('pip_templates')
    .insert({
      name,
      content: 'Test template content',
      is_system_template: false,
    })
    .select()
    .single();
  
  return { data, error };
}

// Helper function to read templates
async function readTemplates(supabase) {
  const { data, error } = await supabase
    .from('pip_templates')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
}

// Helper function to update a template
async function updateTemplate(supabase, id, newName) {
  const { data, error } = await supabase
    .from('pip_templates')
    .update({ name: newName })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

// Helper function to delete a template
async function deleteTemplate(supabase, id) {
  const { error } = await supabase
    .from('pip_templates')
    .delete()
    .eq('id', id);
  
  return { data: error ? null : true, error };
}

// Main test function
async function runTests() {
  console.log(chalk.blue('=== Starting PIP Template Permissions Tests ==='));
  
  // Initialize results
  let passed = 0;
  let failed = 0;
  
  try {
    // Test with admin user
    if (TEST_ADMIN_EMAIL && TEST_ADMIN_PASSWORD) {
      const adminSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { error: adminSignInError } = await adminSupabase.auth.signInWithPassword({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
      });
      
      if (adminSignInError) {
        console.error(chalk.red(`Error signing in as admin: ${adminSignInError.message}`));
        process.exit(1);
      }
      
      console.log(chalk.green(`Signed in as admin user: ${TEST_ADMIN_EMAIL}`));
      
      // Create a test template as admin
      console.log(chalk.blue('Creating a test template...'));
      const { data: adminTemplate, error: createError } = await createTemplate(
        adminSupabase, 
        `Admin Test Template ${Date.now()}`
      );
      
      if (createError) {
        console.error(chalk.red(`Error creating test template: ${createError.message}`));
      } else {
        console.log(chalk.green(`Created template: ${adminTemplate.name} (ID: ${adminTemplate.id})`));
        
        // Run admin tests
        for (const testCase of testCases.filter(t => t.role === 'admin')) {
          console.log(chalk.blue(`\nRunning test: ${testCase.name}`));
          
          try {
            let result;
            
            switch (testCase.operation) {
              case 'create':
                result = await createTemplate(
                  adminSupabase, 
                  `Admin Create Test ${Date.now()}`
                );
                break;
              case 'read':
                result = await readTemplates(adminSupabase);
                break;
              case 'update':
                result = await updateTemplate(
                  adminSupabase, 
                  adminTemplate.id, 
                  `Admin Updated Template ${Date.now()}`
                );
                break;
              case 'delete':
                // For delete test, create another template first
                const tempTemplate = await createTemplate(
                  adminSupabase, 
                  `Admin Delete Test ${Date.now()}`
                );
                if (tempTemplate.error) {
                  throw new Error(`Failed to create template for delete test: ${tempTemplate.error.message}`);
                }
                result = await deleteTemplate(adminSupabase, tempTemplate.data.id);
                break;
            }
            
            const success = !result.error;
            
            if (success === testCase.expectSuccess) {
              console.log(chalk.green(`✓ PASSED: ${testCase.name}`));
              passed++;
            } else {
              console.log(chalk.red(`✗ FAILED: ${testCase.name}`));
              console.log(chalk.red(`  Expected: ${testCase.expectSuccess ? 'success' : 'failure'}`));
              console.log(chalk.red(`  Got: ${success ? 'success' : 'failure'}`));
              if (result.error) {
                console.log(chalk.red(`  Error: ${result.error.message}`));
              }
              failed++;
            }
          } catch (error) {
            console.log(chalk.red(`✗ FAILED: ${testCase.name} (Exception)`));
            console.log(chalk.red(`  Error: ${error.message}`));
            failed++;
          }
        }
      }
    } else {
      console.log(chalk.yellow('Skipping admin tests (no credentials provided)'));
    }
    
    // Test with regular user
    if (TEST_USER_EMAIL && TEST_USER_PASSWORD) {
      const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { error: userSignInError } = await userSupabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });
      
      if (userSignInError) {
        console.error(chalk.red(`Error signing in as regular user: ${userSignInError.message}`));
        process.exit(1);
      }
      
      console.log(chalk.green(`\nSigned in as regular user: ${TEST_USER_EMAIL}`));
      
      // Run regular user tests
      for (const testCase of testCases.filter(t => t.role === 'user')) {
        console.log(chalk.blue(`\nRunning test: ${testCase.name}`));
        
        try {
          let result;
          
          switch (testCase.operation) {
            case 'create':
              result = await createTemplate(
                userSupabase, 
                `User Create Test ${Date.now()}`
              );
              break;
            case 'read':
              result = await readTemplates(userSupabase);
              break;
            case 'update':
              // Try to update the first template we find
              const templates = await readTemplates(userSupabase);
              if (templates.error || !templates.data.length) {
                throw new Error('No templates found to test update operation');
              }
              result = await updateTemplate(
                userSupabase, 
                templates.data[0].id, 
                `User Updated Template ${Date.now()}`
              );
              break;
            case 'delete':
              // Try to delete the first template we find
              const templatesToDelete = await readTemplates(userSupabase);
              if (templatesToDelete.error || !templatesToDelete.data.length) {
                throw new Error('No templates found to test delete operation');
              }
              result = await deleteTemplate(userSupabase, templatesToDelete.data[0].id);
              break;
          }
          
          const success = !result.error;
          
          if (success === testCase.expectSuccess) {
            console.log(chalk.green(`✓ PASSED: ${testCase.name}`));
            passed++;
          } else {
            console.log(chalk.red(`✗ FAILED: ${testCase.name}`));
            console.log(chalk.red(`  Expected: ${testCase.expectSuccess ? 'success' : 'failure'}`));
            console.log(chalk.red(`  Got: ${success ? 'success' : 'failure'}`));
            if (result.error) {
              console.log(chalk.red(`  Error: ${result.error.message}`));
            }
            failed++;
          }
        } catch (error) {
          console.log(chalk.red(`✗ FAILED: ${testCase.name} (Exception)`));
          console.log(chalk.red(`  Error: ${error.message}`));
          failed++;
        }
      }
    } else {
      console.log(chalk.yellow('Skipping regular user tests (no credentials provided)'));
    }
    
  } catch (error) {
    console.error(chalk.red(`Test suite error: ${error.message}`));
    process.exit(1);
  }
  
  // Summary
  console.log(chalk.blue('\n=== Test Results ==='));
  console.log(`Total tests: ${passed + failed}`);
  console.log(chalk.green(`Passed: ${passed}`));
  console.log(chalk.red(`Failed: ${failed}`));
  
  if (failed === 0) {
    console.log(chalk.green('\n✓ All tests passed!'));
  } else {
    console.log(chalk.yellow('\n⚠ Some tests failed. Review the output above for details.'));
  }
}

// Run the tests
runTests();