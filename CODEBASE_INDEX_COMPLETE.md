# VeriPharm Frontend - Complete Codebase Index

## Overview
VeriPharm is a comprehensive multi-tenant pharmacy management system built with React, TypeScript, and Supabase. It provides complete point-of-sale, inventory management, customer relationship management, and business analytics capabilities for pharmacy operations.

## Tech Stack
- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 7.0.4
- **Database**: Supabase (PostgreSQL with real-time features)
- **Styling**: Tailwind CSS 4.1.11
- **State Management**: Zustand 4.5.2
- **Routing**: React Router DOM 6.22.3
- **UI Components**: Lucide React, React Icons
- **Charts**: Recharts 3.1.0
- **PDF Generation**: jsPDF, html2pdf.js
- **Animation**: Framer Motion, GSAP

## Architecture Overview

### Multi-Tenant Structure
The system supports a hierarchical multi-tenant architecture:
1. **Owner Level** (`/tenant/*`) - Tenant-wide management and oversight
2. **Manager Level** (`/branch/*`) - Branch-specific operations and management
3. **Staff Level** - Limited access to specific functions (POS, inventory viewing)

### Authentication & Authorization
- **Auth Store**: `src/stores/authStore.ts` - Zustand-based authentication management
- **Role-Based Access**: Owner, Manager, Cashier, Staff with granular permissions
- **Protected Routes**: Role-based route protection with automatic redirects
- **Session Management**: Persistent sessions with auto-refresh tokens

## Core Features & Modules

### 1. Point of Sale (POS) System
**Location**: `src/pages/branch/Sales/POS.tsx`

**Key Features**:
- Real-time product search and selection
- Shopping cart management with price editing
- Customer selection and management
- Multiple payment methods (cash, card, etc.)
- Transaction completion with automatic inventory updates
- Receipt generation
- Real-time stock level checking

**Components**:
- Product grid with category filtering
- Cart management with quantity/price adjustments
- Customer search and selection
- Payment processing interface
- Toast notifications for user feedback

### 2. Inventory Management
**Location**: `src/pages/branch/Stock/`

**Key Features**:
- Product catalog management (`Inventory.tsx`)
- Add/Edit products (`AddProduct.tsx`, `EditProduct.tsx`)
- Stock level monitoring with alerts
- Category management
- Stock movement tracking
- Barcode support
- Expiry date tracking
- Cost price and selling price management

**Components**:
- Product cards with stock status indicators
- Stock statistics dashboard
- Low stock alerts
- Product search and filtering
- Bulk operations support

### 3. Customer Management
**Location**: `src/pages/branch/Customers/`

**Key Features**:
- Customer profiles (`CustomerDetails.tsx`)
- Purchase history tracking
- Loyalty points system (`LoyaltyPointsManager.tsx`)
- Customer segmentation
- Communication preferences
- Birthday and demographic tracking

**Services**:
- Customer CRUD operations
- Loyalty points transactions
- Customer analytics and reporting

### 4. Sales Management
**Location**: `src/pages/branch/Sales/`

**Key Features**:
- Sales history (`SalesHistory.tsx`)
- Transaction details and receipts
- Refund processing (`Refunds.tsx`)
- Sale editing capabilities
- Payment tracking
- Sales analytics

### 5. Supplier Management
**Location**: `src/pages/branch/Suppliers/`

**Key Features**:
- Supplier profiles and contact management
- Purchase order creation and tracking
- Supplier performance analytics
- Payment terms management
- Order history and relationship tracking

### 6. Purchase Management
**Location**: `src/pages/branch/Purchases/`

**Key Features**:
- Purchase order creation (`EditPurchaseOrder.tsx`)
- Order tracking and fulfillment
- Supplier integration
- Cost management
- Receiving and inventory updates

### 7. Reporting & Analytics
**Location**: `src/pages/branch/Reports/`

**Key Features**:
- Sales reports and trends
- Inventory analytics
- Customer behavior analysis
- Financial summaries
- Export capabilities (PDF, Excel)
- Custom date range filtering

### 8. Stock Auditing
**Location**: `src/pages/branch/Audits/`

**Key Features**:
- Comprehensive stock audits (`StockAudit.tsx`)
- Variance tracking and reporting
- Audit history and compliance
- Discrepancy management

## Navigation & Layout System

### Layouts
1. **BranchDashboardLayout**: `src/components/Layout/BranchDashboardLayout.tsx`
   - Responsive sidebar navigation
   - Real-time notifications
   - User profile management
   - Search functionality
   - Mobile-optimized menu

2. **DashboardLayout**: Generic layout wrapper
3. **TenantDashboardLayout**: Owner-level layout for tenant management

### Navigation Configuration
**File**: `src/routes/navigation.config.ts`

**Features**:
- Role-based menu items
- Hierarchical navigation structure
- Permission-based visibility
- Icon and description mapping
- Route access control

## Data Layer Architecture

### API Services
**Location**: `src/lib/api/`

**Structure**:
- **Branches API**: Branch management and operations
- **Users API**: User creation, authentication, and management
- **Tenant API**: Multi-tenant operations

### Custom Hooks
**Location**: `src/lib/hooks/`

**Key Hooks**:
- `useSupabaseQuery.ts`: Generic data fetching with caching
- `useTenantCurrency.ts`: Currency formatting and localization
- Page-specific hooks for data management

### Database Client
**File**: `src/lib/supabase/supabaseClient.ts`

**Features**:
- Dual client setup (user + admin)
- Session persistence
- Auto-refresh tokens
- RLS policy bypass for admin operations

## UI Components Library

### Core Components
**Location**: `src/components/UI/`

**Components**:
- `ContentCard`: Reusable card wrapper
- `DashboardCard`: Metrics and KPI display
- `FilterBar`: Advanced filtering interface
- `ConfirmationModal`: User confirmation dialogs
- `PasswordInput`: Secure password entry
- `WorkflowSummary`: Process step visualization

### Form Components
- Validated input fields
- Date pickers
- Select dropdowns
- File upload interfaces
- Search and autocomplete

## Business Logic & Services

### Sales Service
**Location**: `src/pages/branch/Sales/services/salesService.ts`

**Capabilities**:
- Transaction processing
- Payment handling
- Receipt generation
- Refund processing
- Sales analytics

### Stock Service
**Location**: `src/pages/branch/Stock/services/stockService.ts`

**Capabilities**:
- Inventory tracking
- Stock movements
- Audit management
- Low stock alerts
- Cost calculations

### Customer Service
**Location**: `src/pages/branch/Customers/services/customerService.ts`

**Capabilities**:
- Customer lifecycle management
- Loyalty points processing
- Purchase history tracking
- Communication management

## Routing System

### Route Structure
**File**: `src/routes/index.tsx`

**Route Hierarchy**:
```
/tenant/* - Owner-level routes
/branch/* - Branch-level routes
/auth/* - Authentication routes
/landing - Public landing page
```

**Protection Levels**:
- Public routes (login, signup)
- Owner-only routes (tenant management)
- Manager+ routes (branch operations)
- Staff-accessible routes (limited functionality)

## State Management

### Auth Store
**File**: `src/stores/authStore.ts`

**Features**:
- User session management
- Role-based permissions
- Automatic token refresh
- Session persistence
- Login/logout handling

### Local State Patterns
- React hooks for component state
- Context providers for shared state
- Real-time subscriptions for live data

## Key Configuration Files

### Build Configuration
- `vite.config.ts`: Build and development configuration
- `tsconfig.json`: TypeScript configuration
- `eslint.config.js`: Code quality rules
- `tailwind.config.js`: Styling configuration

### Package Management
- `package.json`: Dependencies and scripts
- Development tools: ESLint, Prettier, TypeScript

## Security Features

### Row Level Security (RLS)
- Tenant isolation at database level
- User-based data access control
- Admin client for system operations

### Authentication Security
- Secure session management
- Role-based route protection
- API access control
- Password security requirements

## Performance Optimizations

### Code Splitting
- Lazy loading for route components
- Dynamic imports for heavy components
- Optimized bundle sizes

### Caching Strategy
- React Query for server state
- Local storage for preferences
- Optimistic updates for better UX

## Mobile Responsiveness

### Adaptive Design
- Mobile-first approach
- Responsive navigation
- Touch-optimized interfaces
- Progressive web app features

## Development Features

### Development Tools
- Hot module replacement
- TypeScript error checking
- ESLint code quality
- Prettier code formatting

### Testing Infrastructure
- Component testing setup
- E2E testing capabilities
- Mock data for development

## Deployment & Environment

### Environment Configuration
- Development, staging, production configs
- Supabase environment management
- API endpoint configuration

### Build Process
- TypeScript compilation
- Asset optimization
- Bundle analysis tools
- Production deployment scripts

## Integration Points

### External Services
- Supabase for backend services
- Authentication providers
- Payment processing (configurable)
- SMS/Email services (for notifications)

### API Endpoints
- RESTful API design
- Real-time subscriptions
- File upload handling
- Export/import capabilities

## Documentation Structure

### Code Documentation
- TypeScript interfaces for type safety
- Component props documentation
- API service documentation
- Database schema references

### Project Documentation
- Setup and installation guides
- Deployment instructions
- Feature documentation
- API reference guides

This codebase represents a production-ready, scalable pharmacy management system with comprehensive features for modern pharmacy operations, multi-tenant architecture, and enterprise-grade security and performance characteristics.
