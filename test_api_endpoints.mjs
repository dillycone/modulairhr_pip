// API Endpoints Test Script
// Run with: node test_api_endpoints.mjs

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

// Test cases
const testCases = [
  {
    name: 'Admin can create a template via API',
    role: 'admin',
    method: 'POST',
    endpoint: '/pip-templates',
    body: {
      name: `API Test Template ${Date.now()}`,
      description: 'Test description',
      content: 'Test content for the template with some minimum content length.',
    },
    expectStatus: 201,
  },
  {
    name: 'Admin can view templates via API',
    role: 'admin',
    method: 'GET',
    endpoint: '/pip-templates',
    expectStatus: 200,
  },
  {
    name: 'Regular user cannot create a template via API',
    role: 'user',
    method: 'POST',
    endpoint: '/pip-templates',
    body: {
      name: `User API Test Template ${Date.now()}`,
      description: 'Test description',
      content: 'Test content for the template with some minimum content length.',
    },
    expectStatus: 403,
  },
  {
    name: 'Regular user can view templates via API',
    role: 'user',
    method: 'GET',
    endpoint: '/pip-templates',
    expectStatus: 200,
  },
];

// Helper function to get admin auth cookie
async function getAuthCookie(email, password) {
  // This is a placeholder - in a real test you'd need to implement proper authentication
  // and cookie retrieval based on your auth setup (like Next.js Auth.js or Supabase auth)
  console.log(chalk.yellow(`Would authenticate as ${email}`));
  console.log(chalk.yellow('This is a placeholder - implement actual auth for your app'));
  
  return 'your-auth-cookie'; // Placeholder
}

// Helper function to make API requests
async function makeRequest(endpoint, method, body, authCookie) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookie || '',
    },
  };
  
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const status = response.status;
    let data;
    
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
    
    return { status, data };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return { status: 0, data: null, error: error.message };
  }
}

// Main test function
async function runApiTests() {
  console.log(chalk.blue('=== Starting API Endpoint Tests ==='));
  console.log(chalk.yellow('NOTE: These tests require a running local server and proper auth setup.'));
  console.log(chalk.yellow('You may need to customize this script for your specific auth mechanism.'));
  
  let passed = 0;
  let failed = 0;
  const createdIds = [];

  try {
    // Get auth cookies
    const adminCookie = TEST_ADMIN_EMAIL ? await getAuthCookie(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD) : null;
    const userCookie = TEST_USER_EMAIL ? await getAuthCookie(TEST_USER_EMAIL, TEST_USER_PASSWORD) : null;

    // Run tests
    for (const testCase of testCases) {
      console.log(chalk.blue(`\nRunning test: ${testCase.name}`));
      
      // Skip tests if we don't have auth for that role
      if ((testCase.role === 'admin' && !adminCookie) || 
          (testCase.role === 'user' && !userCookie)) {
        console.log(chalk.yellow(`Skipping (no ${testCase.role} credentials provided)`));
        continue;
      }
      
      const cookie = testCase.role === 'admin' ? adminCookie : userCookie;
      
      try {
        const result = await makeRequest(
          testCase.endpoint,
          testCase.method,
          testCase.body,
          cookie
        );
        
        if (result.status === testCase.expectStatus) {
          console.log(chalk.green(`✓ PASSED: ${testCase.name}`));
          passed++;
          
          // Save created template ID for later tests
          if (testCase.method === 'POST' && result.data && result.data.id) {
            createdIds.push(result.data.id);
            console.log(chalk.blue(`Created template ID: ${result.data.id}`));
          }
        } else {
          console.log(chalk.red(`✗ FAILED: ${testCase.name}`));
          console.log(chalk.red(`  Expected status: ${testCase.expectStatus}`));
          console.log(chalk.red(`  Got status: ${result.status}`));
          if (result.data) {
            console.log(chalk.red(`  Response: ${JSON.stringify(result.data)}`));
          }
          failed++;
        }
      } catch (error) {
        console.log(chalk.red(`✗ FAILED: ${testCase.name} (Exception)`));
        console.log(chalk.red(`  Error: ${error.message}`));
        failed++;
      }
    }
    
    // Additional tests for update/delete with created IDs
    if (createdIds.length > 0 && adminCookie) {
      const testId = createdIds[0];
      
      // Test update
      console.log(chalk.blue(`\nRunning update test for template ID: ${testId}`));
      const updateResult = await makeRequest(
        `/pip-templates/${testId}`,
        'PUT',
        {
          name: `Updated API Test Template ${Date.now()}`,
          description: 'Updated test description',
          content: 'Updated test content for the template with some minimum content length.',
        },
        adminCookie
      );
      
      if (updateResult.status === 200) {
        console.log(chalk.green('✓ PASSED: Admin can update a template via API'));
        passed++;
      } else {
        console.log(chalk.red('✗ FAILED: Admin can update a template via API'));
        console.log(chalk.red(`  Expected status: 200`));
        console.log(chalk.red(`  Got status: ${updateResult.status}`));
        failed++;
      }
      
      // Test delete
      console.log(chalk.blue(`\nRunning delete test for template ID: ${testId}`));
      const deleteResult = await makeRequest(
        `/pip-templates/${testId}`,
        'DELETE',
        null,
        adminCookie
      );
      
      if (deleteResult.status === 204) {
        console.log(chalk.green('✓ PASSED: Admin can delete a template via API'));
        passed++;
      } else {
        console.log(chalk.red('✗ FAILED: Admin can delete a template via API'));
        console.log(chalk.red(`  Expected status: 204`));
        console.log(chalk.red(`  Got status: ${deleteResult.status}`));
        failed++;
      }
    }
    
  } catch (error) {
    console.error(chalk.red(`Test suite error: ${error.message}`));
  }
  
  // Summary
  console.log(chalk.blue('\n=== API Test Results ==='));
  console.log(`Total tests: ${passed + failed}`);
  console.log(chalk.green(`Passed: ${passed}`));
  console.log(chalk.red(`Failed: ${failed}`));
  
  if (failed === 0) {
    console.log(chalk.green('\n✓ All API tests passed!'));
  } else {
    console.log(chalk.yellow('\n⚠ Some API tests failed. Review the output above for details.'));
  }
}

// Run the tests
runApiTests();