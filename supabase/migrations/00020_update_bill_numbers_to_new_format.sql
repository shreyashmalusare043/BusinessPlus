-- Migration to update existing bill numbers from old format (BILL-0001) to new format (PREFIX/001/YEAR)
-- WARNING: This changes historical data. Only run if you want to update existing bills.

-- Function to generate company prefix from company name
CREATE OR REPLACE FUNCTION get_company_prefix(company_name_input text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  words text[];
  prefix text;
BEGIN
  -- Default prefix if no company name
  IF company_name_input IS NULL OR trim(company_name_input) = '' THEN
    RETURN 'CO';
  END IF;
  
  -- Split company name into words
  words := string_to_array(trim(company_name_input), ' ');
  
  -- Remove empty strings
  words := array_remove(words, '');
  
  -- Generate prefix based on number of words
  IF array_length(words, 1) >= 2 THEN
    -- Two or more words: first letter of first two words
    prefix := upper(substring(words[1], 1, 1) || substring(words[2], 1, 1));
  ELSIF array_length(words, 1) = 1 AND length(words[1]) >= 2 THEN
    -- Single word with 2+ letters: first two letters
    prefix := upper(substring(words[1], 1, 2));
  ELSIF array_length(words, 1) = 1 AND length(words[1]) = 1 THEN
    -- Single letter: use it twice
    prefix := upper(words[1] || words[1]);
  ELSE
    -- Fallback
    prefix := 'CO';
  END IF;
  
  RETURN prefix;
END;
$$;

-- Update bills table with new format
-- Format: PREFIX/NNN/YEAR
DO $$
DECLARE
  bill_record RECORD;
  company_prefix text;
  serial_num integer;
  bill_year integer;
  new_bill_no text;
  user_counter integer;
BEGIN
  -- Loop through each user
  FOR bill_record IN 
    SELECT DISTINCT user_id FROM bills ORDER BY user_id
  LOOP
    -- Get company prefix for this user
    SELECT get_company_prefix(c.company_name) INTO company_prefix
    FROM companies c
    WHERE c.user_id = bill_record.user_id;
    
    -- If no company found, use default
    IF company_prefix IS NULL THEN
      company_prefix := 'CO';
    END IF;
    
    -- Reset counter for this user
    user_counter := 1;
    
    -- Update bills for this user in chronological order
    FOR bill_record IN 
      SELECT id, bill_no, bill_date, created_at
      FROM bills
      WHERE user_id = bill_record.user_id
        AND bill_no ~ '^BILL-[0-9]+$'  -- Only update old format bills
      ORDER BY created_at ASC
    LOOP
      -- Extract year from bill date
      bill_year := EXTRACT(YEAR FROM bill_record.bill_date);
      
      -- Generate new bill number
      new_bill_no := company_prefix || '/' || lpad(user_counter::text, 3, '0') || '/' || bill_year::text;
      
      -- Update the bill
      UPDATE bills
      SET bill_no = new_bill_no,
          updated_at = now()
      WHERE id = bill_record.id;
      
      -- Increment counter
      user_counter := user_counter + 1;
      
      RAISE NOTICE 'Updated bill % to %', bill_record.bill_no, new_bill_no;
    END LOOP;
  END LOOP;
END;
$$;

-- Update purchase_orders table with new format
-- Format: PREFIX/PNNN/YEAR
DO $$
DECLARE
  po_record RECORD;
  company_prefix text;
  serial_num integer;
  po_year integer;
  new_po_no text;
  user_counter integer;
BEGIN
  -- Loop through each user
  FOR po_record IN 
    SELECT DISTINCT user_id FROM purchase_orders ORDER BY user_id
  LOOP
    -- Get company prefix for this user
    SELECT get_company_prefix(c.company_name) INTO company_prefix
    FROM companies c
    WHERE c.user_id = po_record.user_id;
    
    -- If no company found, use default
    IF company_prefix IS NULL THEN
      company_prefix := 'CO';
    END IF;
    
    -- Reset counter for this user
    user_counter := 1;
    
    -- Update POs for this user in chronological order
    FOR po_record IN 
      SELECT id, po_no, po_date, created_at
      FROM purchase_orders
      WHERE user_id = po_record.user_id
        AND po_no ~ '^PO-[0-9]+$'  -- Only update old format POs
      ORDER BY created_at ASC
    LOOP
      -- Extract year from PO date
      po_year := EXTRACT(YEAR FROM po_record.po_date);
      
      -- Generate new PO number
      new_po_no := company_prefix || '/P' || lpad(user_counter::text, 3, '0') || '/' || po_year::text;
      
      -- Update the PO
      UPDATE purchase_orders
      SET po_no = new_po_no,
          updated_at = now()
      WHERE id = po_record.id;
      
      -- Increment counter
      user_counter := user_counter + 1;
      
      RAISE NOTICE 'Updated PO % to %', po_record.po_no, new_po_no;
    END LOOP;
  END LOOP;
END;
$$;

-- Update delivery_challans table with new format
-- Format: PREFIX/DCNNN/YEAR
DO $$
DECLARE
  challan_record RECORD;
  company_prefix text;
  serial_num integer;
  challan_year integer;
  new_challan_no text;
  user_counter integer;
BEGIN
  -- Loop through each user
  FOR challan_record IN 
    SELECT DISTINCT user_id FROM delivery_challans ORDER BY user_id
  LOOP
    -- Get company prefix for this user
    SELECT get_company_prefix(c.company_name) INTO company_prefix
    FROM companies c
    WHERE c.user_id = challan_record.user_id;
    
    -- If no company found, use default
    IF company_prefix IS NULL THEN
      company_prefix := 'CO';
    END IF;
    
    -- Reset counter for this user
    user_counter := 1;
    
    -- Update challans for this user in chronological order
    FOR challan_record IN 
      SELECT id, challan_no, challan_date, created_at
      FROM delivery_challans
      WHERE user_id = challan_record.user_id
        AND challan_no ~ '^DC-[0-9]+$'  -- Only update old format challans
      ORDER BY created_at ASC
    LOOP
      -- Extract year from challan date
      challan_year := EXTRACT(YEAR FROM challan_record.challan_date);
      
      -- Generate new challan number
      new_challan_no := company_prefix || '/DC' || lpad(user_counter::text, 3, '0') || '/' || challan_year::text;
      
      -- Update the challan
      UPDATE delivery_challans
      SET challan_no = new_challan_no,
          updated_at = now()
      WHERE id = challan_record.id;
      
      -- Increment counter
      user_counter := user_counter + 1;
      
      RAISE NOTICE 'Updated challan % to %', challan_record.challan_no, new_challan_no;
    END LOOP;
  END LOOP;
END;
$$;

-- Drop the helper function
DROP FUNCTION IF EXISTS get_company_prefix(text);

-- Add comment
COMMENT ON TABLE bills IS 'Bills table - bill_no format updated to PREFIX/NNN/YEAR';
COMMENT ON TABLE purchase_orders IS 'Purchase orders table - po_no format updated to PREFIX/PNNN/YEAR';
COMMENT ON TABLE delivery_challans IS 'Delivery challans table - challan_no format updated to PREFIX/DCNNN/YEAR';
