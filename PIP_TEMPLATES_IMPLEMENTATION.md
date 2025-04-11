# PIP Templates Management Implementation

This documentation explains the implementation of organization-specific PIP templates with proper admin role checking.

## Overview

The solution enables users with an admin role to create and manage custom PIP templates for their organization. These templates are available to all users within the same organization, in addition to system-wide default templates.

## Key Components

1. **Role Determination**
   - Implemented a robust `getUserRole` utility that checks multiple sources for user roles
   - Added support for checking admin role from the employees table and user_profiles table
   - Created a specialized `isAdmin` utility function for consistent admin checks

2. **Organization Context**
   - Added a `getOrganizationId` utility to reliably determine a user's organization
   - Automatic organization creation if the user doesn't have one
   - Used throughout the application to properly scope templates by organization

3. **API Improvements**
   - Enhanced template creation, updating, and deletion endpoints with proper role checks
   - Added explicit organization verification before template operations
   - Implemented better error handling for more informative messages

4. **Database Security**
   - Created SQL migration to update RLS policies to properly enforce:
     - Admin-only operations for creating/updating/deleting templates
     - Organization-scoped access to templates
     - Protection of system templates

5. **Client Components**
   - Updated template management to properly handle admin permissions
   - Improved template selection to show appropriate templates based on organization

## How it Works

1. **Admin Role Check**: The system identifies admins through multiple checks:
   - JWT token `app_metadata.role` check for 'admin'
   - User's role in the employees table ('admin' or 'hr_admin')
   - User's role in the user_profiles table ('admin')
   - Development mode bypass for easier local testing

2. **Organization Management**:
   - System automatically checks if user has an organization
   - If no organization is found, one is created and linked to the user
   - User is made an admin of their new organization

3. **Organization Scope**: Templates are scoped to organizations:
   - System templates are available to everyone
   - Custom templates are only visible to users in the same organization
   - Organization ID is determined from the user_profiles table

4. **Template Operations**:
   - Create: Admin users can create templates for their organization
   - Update: Admins can update only their organization's custom templates
   - Delete: Admins can delete only their organization's custom templates
   - View: All users can see system templates plus their organization's templates

## SQL Migrations

There are three SQL files included to help fix the template management system:

1. **`supabase_function_fix.sql`**: Contains a stored procedure to create templates that bypasses RLS. Run this first to handle the "role 'admin' does not exist" error.

2. **`supabase_simpler_rls.sql`**: Contains simplified RLS policies that should work in all environments. This is recommended for most users.

3. **`supabase_pip_templates_fix.sql`**: Contains more complex RLS policies if you need finer-grained control.

Run these SQL files in the Supabase SQL Editor to apply the changes. Start with `supabase_function_fix.sql`, then apply either the simple or complex RLS policies depending on your needs.

## Implementation Changes

1. **Automatic Organization Creation**:
   - Before: Would fallback to default org ID in development mode only
   - Now: Creates a real organization for the user and links it automatically
   - Sets the user as admin of their new organization

2. **Enhanced Role Checking**:
   - Added support for checking admin role in user_profiles table
   - Fixed SQL function issues and improved error handling
   - Modified RLS policies to check all relevant tables for admin status

3. **More Robust Error Handling**:
   - Better error messages for common issues
   - Improved handling of edge cases

## Troubleshooting

If template management isn't working as expected:

1. Check user role assignment in: 
   - Supabase auth.users.app_metadata
   - employees table (role field)
   - user_profiles table (role field) - this is now set automatically

2. Verify organization assignment:
   - user_profiles.organization_id should be set correctly (now automatic)
   - templates should have correct organization_id values

3. Confirm RLS policies are applied:
   - Run the SQL migration if not already done
   - Test with different user accounts to verify access control

4. Check Supabase logs:
   - If SQL functions or triggers are causing errors, they'll be logged
   - Pay attention to any "role does not exist" errors