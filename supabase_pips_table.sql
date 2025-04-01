-- Create the pips table
CREATE TABLE public.pips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  objectives TEXT NOT NULL,
  improvements_needed TEXT NOT NULL,
  success_metrics TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.pips ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own PIPs
CREATE POLICY "Users can view their own PIPs" 
  ON public.pips 
  FOR SELECT 
  USING (auth.uid() = created_by);

-- Create policy for users to insert their own PIPs
CREATE POLICY "Users can insert their own PIPs" 
  ON public.pips 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Create policy for users to update their own PIPs
CREATE POLICY "Users can update their own PIPs" 
  ON public.pips 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create policy for users to delete their own PIPs
CREATE POLICY "Users can delete their own PIPs" 
  ON public.pips 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Create an updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update the updated_at column
CREATE TRIGGER update_pips_updated_at
BEFORE UPDATE ON public.pips
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 