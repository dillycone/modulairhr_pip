-- Supabase SQL migration to fix PIP templates access issues
-- Run this SQL in the Supabase SQL Editor to update the RLS policies

-- First, let's drop existing problematic RLS policies
DROP POLICY IF EXISTS "Allow admins to insert templates for their organization" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Allow admins to delete templates for their organization" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Allow authenticated users read access" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Allow admins to update templates for their organization" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Allow read access to system or own org templates" ON "public"."pip_templates";
DROP POLICY IF EXISTS "Access pip_templates policy" ON "public"."pip_templates";

-- Now create new, improved policies

-- Policy to allow any authenticated user to read system templates or templates in their organization
CREATE POLICY "Read templates policy" ON "public"."pip_templates"
FOR SELECT
TO authenticated
USING (
  (is_system_template = true) OR 
  (organization_id = get_my_organization_id())
);

-- Policy to allow admins to insert templates for their organization
CREATE POLICY "Admin insert templates policy" ON "public"."pip_templates"
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow insertion if:
  -- 1. The user has admin role in app_metadata OR
  -- 2. The user's role in employees table is 'admin' or 'hr_admin' OR
  -- 3. The user's role in user_profiles is 'admin'
  -- 4. And ensuring the template being inserted isn't marked as a system template
  (
    (
      ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text OR
      EXISTS (
        SELECT 1 FROM employees 
        WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'hr_admin')
      ) OR
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    ) AND
    is_system_template = false AND
    organization_id = get_my_organization_id()
  )
);

-- Policy to allow admins to update templates in their organization (excluding system templates)
CREATE POLICY "Admin update templates policy" ON "public"."pip_templates"
FOR UPDATE
TO authenticated
USING (
  (
    (
      ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text OR
      EXISTS (
        SELECT 1 FROM employees 
        WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'hr_admin')
      ) OR
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    ) AND
    is_system_template = false AND
    organization_id = get_my_organization_id()
  )
);

-- Policy to allow admins to delete templates in their organization (excluding system templates)
CREATE POLICY "Admin delete templates policy" ON "public"."pip_templates"
FOR DELETE
TO authenticated
USING (
  (
    (
      ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text OR
      EXISTS (
        SELECT 1 FROM employees 
        WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'hr_admin')
      ) OR
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    ) AND
    is_system_template = false AND
    organization_id = get_my_organization_id()
  )
);

-- Add function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(
      (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text = 'admin'::text,
      FALSE
    ) OR
    COALESCE(
      EXISTS (
        SELECT 1 FROM public.employees
        WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'hr_admin')
      ),
      FALSE
    ) OR
    COALESCE(
      EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
      ),
      FALSE
    );
$$;

-- Recommend setting up a trigger to ensure created_by is set
CREATE OR REPLACE FUNCTION handle_new_pip_template() 
RETURNS TRIGGER AS $$
BEGIN
  -- Set the created_by to the current user if not specified
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  
  -- Set updated_at value
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_template_defaults_trigger'
  ) THEN
    CREATE TRIGGER set_template_defaults_trigger
    BEFORE INSERT OR UPDATE ON pip_templates
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_pip_template();
  END IF;
END
$$;