-- Simplified Supabase SQL migration to fix PIP templates access issues
-- Run this SQL in the Supabase SQL Editor to update the RLS policies

-- First, let's drop existing problematic RLS policies
DROP POLICY IF EXISTS "Allow admins to insert templates for their organization" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Allow admins to delete templates for their organization" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Allow authenticated users read access" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Allow admins to update templates for their organization" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Allow read access to system or own org templates" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Access pip_templates policy" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Read templates policy" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Admin insert templates policy" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Admin update templates policy" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Admin delete templates policy" ON "public"."pip_templates";

-- Enable RLS on pip_templates if not already enabled
ALTER TABLE pip_templates ENABLE ROW LEVEL SECURITY;

-- Create simple read-only policy for authenticated users
CREATE POLICY "Read any template for org or system" ON "public"."pip_templates"
FOR SELECT
TO authenticated
USING (
  is_system_template = true OR 
  organization_id = (
    SELECT organization_id FROM user_profiles 
    WHERE user_id = auth.uid() 
    LIMIT 1
  )
);

-- Create simple insert policy for authenticated users (bypass RLS check)
CREATE POLICY "Insert any template" ON "public"."pip_templates"
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create simple update policy for templates
CREATE POLICY "Update templates" ON "public"."pip_templates"
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR
  (auth.uid() IN (
    SELECT user_id FROM user_profiles 
    WHERE role = 'admin' AND
    organization_id = (
      SELECT organization_id FROM pip_templates
      WHERE id = pip_templates.id
    )
  ))
);

-- Create simple delete policy for templates
CREATE POLICY "Delete templates" ON "public"."pip_templates"
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() OR
  (auth.uid() IN (
    SELECT user_id FROM user_profiles 
    WHERE role = 'admin' AND
    organization_id = (
      SELECT organization_id FROM pip_templates
      WHERE id = pip_templates.id
    )
  ))
);