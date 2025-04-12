-- Create a function to get PIPs for a specific user
CREATE OR REPLACE FUNCTION get_user_pips(user_id UUID)
RETURNS SETOF public.pips AS $$
BEGIN
  -- Simple function that returns PIPs for a specific user ID
  -- This bypasses RLS by running with SECURITY DEFINER privileges
  RETURN QUERY 
    SELECT * FROM public.pips 
    WHERE created_by = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to create a new PIP
CREATE OR REPLACE FUNCTION create_pip(pip_data JSON)
RETURNS SETOF public.pips AS $$
DECLARE
  new_pip public.pips;
  user_id UUID;
BEGIN
  -- Extract the user_id from the JSON data
  user_id := (pip_data->>'created_by')::UUID;
  
  -- Insert the new PIP
  INSERT INTO public.pips (
    employee_name,
    start_date,
    end_date,
    objectives,
    improvements_needed,
    success_metrics,
    status,
    generated_content,
    created_by
  ) VALUES (
    (pip_data->>'employee_name'),
    (pip_data->>'start_date')::DATE,
    (pip_data->>'end_date')::DATE,
    (pip_data->>'objectives'),
    (pip_data->>'improvements_needed'),
    (pip_data->>'success_metrics'),
    (pip_data->>'status'),
    (pip_data->>'generated_content'),
    user_id
  ) RETURNING * INTO new_pip;
  
  RETURN QUERY SELECT * FROM public.pips WHERE id = new_pip.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 