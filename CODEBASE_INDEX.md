# VeriPharm Codebase Index

## 🏗️ Project Overview

**VeriPharm** is a multi-tenant pharmacy management system built with modern web technologies:

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Routing**: React Router DOM
- **Charts**: Recharts
- **PDF Generation**: jsPDF + html2pdf.js

## 📁 Project Structure

```
VeriPharm/
├── frontend/                    # Main React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components organized by role
│   │   ├── lib/               # Core libraries and utilities
│   │   ├── stores/            # State management (Zustand)
│   │   ├── routes/            # Routing configuration
│   │   ├── services/          # API service functions
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Helper functions
│   ├── supabase/              # Database migrations and functions
│   ├── scripts/               # Database schemas and utilities
│   └── public/                # Static assets
└── src/                       # Additional source files
```

## 🔐 Authentication & Authorization

### User Roles Hierarchy
1. **Owner** - Tenant administrator with full access
2. **Manager** - Branch manager with branch-level administrative access  
3. **Cashier** - Point-of-sale operator with transaction access
4. **Pharmacist** - Pharmacy staff with medication management focus
5. **Staff** - Basic branch staff with limited access

### Key Files
- `src/stores/authStore.ts` - Authentication state management
- `src/utils/authHelpers.ts` - Role-based access control
- `src/routes/index.tsx` - Protected route configuration
- `src/lib/supabase/supabaseClient.ts` - Supabase client configuration

## 🗂️ Core Architecture

### 1. State Management (Zustand)
```typescript
// src/stores/authStore.ts
interface AuthState {
  user: UserProfile | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### 2. Database Pattern
**Service Role Pattern**: Uses `supabaseAdmin` client for all database operations to bypass RLS policies and prevent infinite recursion.

```typescript
// ✅ Correct pattern
import { supabaseAdmin } from "../lib/supabase/supabaseClient";
const { data, error } = await supabaseAdmin.from('table').select('*');
```

### 3. Routing Structure
- `/auth/*` - Authentication pages
- `/branch/*` - Branch-level functionality  
- `/tenant/*` - Tenant-level functionality (ready for integration)

## 📊 Database Schema

### Core Tables
1. **tenants** - Multi-tenant organization data
2. **users** - User profiles with role-based access
3. **branches** - Branch locations within tenants
4. **products** - Inventory items with pricing
5. **customers** - Customer management
6. **suppliers** - Supplier management
7. **sales** - Sales transactions
8. **purchases** - Purchase orders
9. **stock_audits** - Inventory auditing
10. **settings** - Application configuration

### Key Schema Features
- **Multi-tenancy**: All tables include `tenant_id` and `branch_id`
- **Audit trails**: `created_at`, `updated_at`, `created_by` fields
- **Status tracking**: Active/inactive status fields
- **Pricing**: Stored as integers (cents) for precision

## 🎯 Module Breakdown

### 1. Authentication Module (`/auth`)
- **Login.tsx** - User authentication
- **CreateTenant.tsx** - Tenant registration
- **ResetPassword.tsx** - Password recovery
- **DeveloperSetup.tsx** - Development environment setup

### 2. Branch Management (`/branch`)

#### Sales Module (`/branch/sales`)
- **POS.tsx** - Point of sale interface
- **SalesHistory.tsx** - Transaction history
- **EditSale.tsx** - Sale editing
- **Refunds.tsx** - Refund processing

#### Inventory Module (`/branch/stock`)
- **Inventory.tsx** - Product listing
- **AddProduct.tsx** - Product creation
- **EditProduct.tsx** - Product editing
- **ViewProduct.tsx** - Product details

#### Customer Management (`/branch/customers`)
- **Customers.tsx** - Customer listing
- **AddCustomer.tsx** - Customer creation
- **EditCustomer.tsx** - Customer editing
- **CustomerDetails.tsx** - Customer profiles

#### Supplier Management (`/branch/suppliers`)
- **index.tsx** - Supplier listing
- **SupplierDetails.tsx** - Supplier profiles
- **EditSupplier.tsx** - Supplier editing

#### Purchases Module (`/branch/purchases`)
- **Purchases.tsx** - Purchase order management
- **EditPurchaseOrder.tsx** - Order editing
- **PurchaseOrderDetails.tsx** - Order details

#### Reports Module (`/branch/reports`)
- **Reports.tsx** - Analytics dashboard
- **FinancialSummary.tsx** - Financial reports
- **SalesReportChart.tsx** - Sales analytics

#### Settings Module (`/branch/settings`)
- **Settings.tsx** - Branch configuration
- **GeneralSettingsForm.tsx** - General settings
- **SalesSettingsForm.tsx** - Sales settings
- **SecuritySettingsForm.tsx** - Security settings

#### Audits Module (`/branch/audits`)
- **StockAudit.tsx** - Inventory auditing
- **EditStockAudit.tsx** - Audit editing

### 3. Tenant Management (`/tenant`) - Ready for Integration

#### Dashboard (`/tenant/dashboard`)
- **ManagerDashboard.tsx** - Tenant overview
- **TenantDashboardLayout.tsx** - Layout wrapper

#### Branch Management (`/tenant/branches`)
- **BranchesWithProvider.tsx** - Branch listing
- **CreateBranchWorkflow.tsx** - Branch creation
- **BranchDetails.tsx** - Branch details

#### User Management (`/tenant/users`)
- **UsersWithProvider.tsx** - User listing
- **UserModal.tsx** - User creation/editing
- **UserDetailModal.tsx** - User details

#### Reports (`/tenant/reports`)
- **index.tsx** - Consolidated reporting

## 🧩 Component Architecture

### Layout Components (`/components/Layout`)
- **AppLayout.tsx** - Main application layout
- **DashboardLayout.tsx** - Dashboard layout wrapper
- **BranchDashboardLayout.tsx** - Branch-specific layout
- **Header.tsx** - Application header

### UI Components (`/components/UI`)
- **ContentCard.tsx** - Content wrapper
- **DashboardCard.tsx** - Dashboard card component
- **FilterBar.tsx** - Data filtering interface
- **ConfirmationModal.tsx** - Confirmation dialogs
- **PasswordInput.tsx** - Password input field
- **WorkflowSummary.tsx** - Workflow status display

### Navigation (`/components/Navigation`)
- **Sidebar.tsx** - Application sidebar

## 🔧 Configuration Files

### Package Management
- **package.json** - Dependencies and scripts
- **vite.config.ts** - Vite build configuration
- **tsconfig.json** - TypeScript configuration
- **eslint.config.js** - ESLint rules

### Database Configuration
- **scripts/Schemas.txt** - Complete database schema
- **supabase/tenant-setup.sql** - Initial tenant setup
- **supabase/simple-rls-policies.sql** - Row-level security policies

### Navigation & Routing
- **src/routes/navigation.config.ts** - Navigation structure
- **src/routes/index.tsx** - Route protection and routing logic

## 🚀 Development Workflow

### Setup Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Key Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Code linting
- `npm run setup:testdata` - Setup test data

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📈 Key Features

### Multi-Tenant Architecture
- Isolated tenant data with RLS policies
- Role-based access control
- Branch-level data scoping

### Pharmacy Management
- Point of sale (POS) system
- Inventory management
- Customer management
- Supplier management
- Purchase order processing
- Sales reporting and analytics

### Security Features
- Row-level security (RLS)
- Role-based permissions
- Secure authentication flow
- Service role pattern for data operations

### User Experience
- Responsive design with Tailwind CSS
- Modern UI with shadcn/ui components
- Real-time data updates
- PDF generation for reports
- Chart visualizations with Recharts

## 🔍 Development Patterns

### 1. Service Role Pattern
All database operations use `supabaseAdmin` client to bypass RLS and prevent authentication loops.

### 2. Modular Architecture
- Separate logic, views, services, and types
- Reusable components
- Clear separation of concerns

### 3. TypeScript Best Practices
- Explicit types and interfaces
- No `any` types
- Proper type definitions

### 4. State Management
- Zustand for global state
- React hooks for local state
- Proper error handling

## 🎯 Ready for Production

### Completed Features
✅ Authentication and authorization
✅ Multi-tenant architecture
✅ Role-based access control
✅ Branch-level functionality
✅ Sales and POS system
✅ Inventory management
✅ Customer management
✅ Supplier management
✅ Purchase order system
✅ Reporting and analytics
✅ Settings and configuration

### Integration Ready
✅ Tenant-level dashboard
✅ User management framework
✅ Branch management system
✅ Consolidated reporting
✅ Advanced analytics

## 📚 Documentation

- **PROJECT_DOCS.md** - Project overview and setup
- **DATABASE_PATTERN.md** - Database service role pattern
- **CODEBASE_INDEX.md** - This comprehensive index

---

*Last Updated: January 2025*
*Version: 0.2.0* 