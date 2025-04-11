-- Supabase SQL migration to fix pip_templates issues
-- Run this first before the RLS policies

-- 1. Add a stored procedure to create templates (avoid RLS issues)
CREATE OR REPLACE FUNCTION create_pip_template(
  template_name TEXT,
  template_description TEXT,
  template_content TEXT, 
  template_org_id UUID,
  template_creator_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  template_id UUID;
BEGIN
  INSERT INTO pip_templates (
    name, 
    description, 
    content,
    organization_id,
    created_by,
    is_system_template
  ) 
  VALUES (
    template_name,
    template_description,
    template_content,
    template_org_id,
    template_creator_id,
    false
  )
  RETURNING id INTO template_id;
  
  RETURN template_id;
END;
$$;

-- 2. Add a function to check if current user is admin (without using roles)
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_user_admin BOOLEAN;
BEGIN
  -- Check app_metadata
  IF (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text = 'admin'::text THEN
    RETURN TRUE;
  END IF;
  
  -- Check employees table
  SELECT EXISTS (
    SELECT 1 FROM employees
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role = 'hr_admin')
  ) INTO is_user_admin;
  
  IF is_user_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check user_profiles table
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) INTO is_user_admin;
  
  RETURN is_user_admin;
END;
$$;