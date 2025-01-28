/*
  # Update Customer Table Policies

  1. Changes
    - Add RLS policies for INSERT, UPDATE, and DELETE operations
    - Keep existing SELECT policy

  2. Security
    - Authenticated users can perform all operations on customers
    - Maintains data security while allowing necessary operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON customers;

-- Create comprehensive policies for all operations
CREATE POLICY "Allow authenticated users full access" ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);