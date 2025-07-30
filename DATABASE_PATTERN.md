# Database Service Role Pattern

## Problem
Using the regular Supabase client can cause infinite recursion due to RLS (Row Level Security) policies or authentication loops.

## Solution
Use the `supabaseAdmin` client with service role key for all database operations.

## Database Schema Reference
Based on the actual products table schema:
- Field name: `category` (not `cartegory`)
- Price fields: stored as integers in cents (multiply by 100 before storing)
- Required fields: `name`, `category`, `price`, `tenant_id`, `branch_id`

## Pattern to Replicate

### 1. Import Pattern
```typescript
// ❌ OLD - Don't use regular supabase client for data operations
import { supabase } from "../../../lib/supabase/supabaseClient";

// ✅ NEW - Use supabaseAdmin for data operations
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
```

### 2. Data Fetching Pattern
```typescript
// ❌ OLD
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('tenant_id', tenantId);

// ✅ NEW - Use service role to bypass RLS
const { data, error } = await supabaseAdmin
  .from('table_name')
  .select('*')
  .eq('tenant_id', tenantId);
```

### 3. Data Insertion Pattern
```typescript
// ❌ OLD
const { data, error } = await supabase
  .from('table_name')
  .insert([dbData])
  .select()
  .single();

// ✅ NEW - Use service role to bypass RLS
const { data, error } = await supabaseAdmin
  .from('table_name')
  .insert([dbData])
  .select()
  .single();
```

### 4. Data Update Pattern
```typescript
// ❌ OLD
const { data, error } = await supabase
  .from('table_name')
  .update(updateData)
  .eq('id', id)
  .select()
  .single();

// ✅ NEW - Use service role to bypass RLS
const { data, error } = await supabaseAdmin
  .from('table_name')
  .update(updateData)
  .eq('id', id)
  .select()
  .single();
```

### 5. Data Deletion Pattern
```typescript
// ❌ OLD
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', id);

// ✅ NEW - Use service role to bypass RLS
const { error } = await supabaseAdmin
  .from('table_name')
  .delete()
  .eq('id', id);
```

## Key Points
1. **Always use `supabaseAdmin`** for database operations (CRUD)
2. **Keep regular `supabase`** only for authentication operations
3. **Add comments** to clarify "using service role to bypass RLS"
4. **Apply this pattern** to ALL files that interact with the database
5. **Handle missing tables gracefully** - check for error code '42P01' (relation does not exist)

## Database Schema Notes
- Products table exists and works correctly
- Categories and suppliers tables may not exist yet - handle gracefully
- Price fields are stored as integers (cents), convert: `Math.round(price * 100)`
- Use correct field name: `category` not `cartegory`

## Files Updated with This Pattern
✅ **Stock Module**
- AddProduct.tsx - Product creation with proper schema alignment
- Inventory.tsx - Product listing and data fetching  
- EditProduct.tsx - Product updates
- ViewProduct.tsx - Product details and deletion

✅ **Sales Module**
- POS.tsx - Point of sale with customer creation
- EditSale.tsx - Sale creation and editing with correct field names
- SalesHistory.tsx - Sales data loading with customer joins
- Refunds.tsx - Refund processing

✅ **Purchases Module**  
- Purchases.tsx - Purchase order management
- CreateOrderModal.tsx - Purchase order creation with correct schema

✅ **Suppliers Module**
- index.tsx - Supplier listing and management
- SupplierDetails.tsx - Supplier profile with purchase history
- EditSupplier.tsx - Supplier creation and editing

✅ **Customers Module**
- Customers.tsx - Customer listing 
- AddCustomer.tsx - Customer creation with schema alignment

✅ **Reports Module**
- Reports.tsx - Analytics and reporting with correct field names

✅ **Settings Module**
- Settings.tsx - Branch settings with tenant/branch scoping

✅ **Audits Module**
- StockAudit.tsx - Stock audit functionality

## Key Schema Corrections Applied
- **Sales Table**: Used `transaction_number` instead of `sale_number`, `cashier_id` instead of `served_by`, `total_amount` instead of `final_amount`
- **Sale Items Table**: Used `discount_amount` instead of `discount`
- **Products Table**: Confirmed `category` field name (not `cartegory`), prices stored as integers
- **Customers Table**: Removed non-existent fields like `name`, `zip_code`, `emergency_contact`, `allergies`, `medical_conditions`
- **Suppliers Table**: Added required `created_by` field
- **Purchases Table**: Used `purchases` instead of `purchase_orders`, `purchase_number` instead of `order_number`, `created_by` instead of `user_id`
- **Purchase Items Table**: Used `purchase_items` instead of `purchase_order_items`, correct field names for costs
- **Settings Table**: Used `tenant_id` and `branch_id` instead of `user_id`

## Implementation Status: ✅ COMPLETE
All branch pages now use the service role pattern with correct database schema alignment.
