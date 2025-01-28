/*
  # Initial Schema for Tech Shop Management System

  1. New Tables
    - users (auth.users extension)
    - customers
      - Basic customer information
    - devices
      - Device tracking and management
    - service_orders
      - Service order management
    - inventory_items
      - Inventory/parts management
    - inventory_movements
      - Track inventory changes
    - financial_transactions
      - Track income and expenses
    - device_history
      - Track device status changes
    
  2. Security
    - RLS enabled on all tables
    - Policies for authenticated users
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text,
  phone text,
  document_number text, -- CPF/CNPJ
  address text,
  notes text
);

-- Devices table
CREATE TABLE devices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  customer_id uuid REFERENCES customers(id),
  type text NOT NULL, -- computer, notebook, phone, printer, etc
  brand text NOT NULL,
  model text NOT NULL,
  serial_number text,
  status text NOT NULL DEFAULT 'pending_analysis', -- pending_analysis, in_repair, waiting_parts, ready, delivered
  reported_issues text,
  technical_notes text
);

-- Service Orders table
CREATE TABLE service_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  device_id uuid REFERENCES devices(id),
  customer_id uuid REFERENCES customers(id),
  technician_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'open',
  description text NOT NULL,
  technical_report text,
  estimated_completion_date timestamptz,
  completion_date timestamptz,
  total_amount decimal(10,2),
  parts_cost decimal(10,2),
  labor_cost decimal(10,2)
);

-- Inventory Items table
CREATE TABLE inventory_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  supplier text,
  quantity integer NOT NULL DEFAULT 0,
  minimum_quantity integer NOT NULL DEFAULT 5,
  unit_price decimal(10,2) NOT NULL,
  location text
);

-- Inventory Movements table
CREATE TABLE inventory_movements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  item_id uuid REFERENCES inventory_items(id),
  type text NOT NULL, -- in, out
  quantity integer NOT NULL,
  reference_id uuid, -- Can reference a service order
  notes text,
  user_id uuid REFERENCES auth.users(id)
);

-- Financial Transactions table
CREATE TABLE financial_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  type text NOT NULL, -- income, expense
  category text NOT NULL,
  amount decimal(10,2) NOT NULL,
  description text,
  reference_id uuid, -- Can reference a service order
  payment_method text,
  status text NOT NULL DEFAULT 'pending', -- pending, completed, cancelled
  due_date timestamptz,
  payment_date timestamptz
);

-- Device History table
CREATE TABLE device_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  device_id uuid REFERENCES devices(id),
  service_order_id uuid REFERENCES service_orders(id),
  status text NOT NULL,
  notes text,
  user_id uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read access" ON customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON devices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON service_orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON inventory_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON inventory_movements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON financial_transactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON device_history
  FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX idx_devices_customer_id ON devices(customer_id);
CREATE INDEX idx_service_orders_device_id ON service_orders(device_id);
CREATE INDEX idx_service_orders_customer_id ON service_orders(customer_id);
CREATE INDEX idx_inventory_movements_item_id ON inventory_movements(item_id);
CREATE INDEX idx_device_history_device_id ON device_history(device_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at
    BEFORE UPDATE ON service_orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();