# VeriPharm - Project Documentation

## 🏗️ Project Overview
VeriPharm is a multi-tenant pharmacy management system built with React, TypeScript, Vite, and Supabase.

## 🔐 User Roles & Hierarchy

### Role Structure
1. **Owner** - Tenant administrator with full access
2. **Manager** - Branch manager with branch-level administrative access
3. **Cashier** - Point-of-sale operator with transaction access
4. **Pharmacist** - Pharmacy staff with medication management focus
5. **Staff** - Basic branch staff with limited access

### Access Control
- Routes are protected using role-based access control in `src/routes/index.tsx`
- Authentication state managed in `src/stores/authStore.ts`
- Role permissions defined in `src/utils/authHelpers.ts`

## 🗂️ Key Directory Structure

```
src/
├── components/          # Reusable UI components
├── pages/
│   ├── auth/           # Authentication pages
│   ├── branch/         # Branch-level functionality
│   └── tenant/         # Tenant-level functionality (ready for integration)
├── routes/             # Routing configuration
├── services/           # API service functions
├── stores/             # State management (Zustand)
├── types/              # TypeScript type definitions
└── utils/              # Helper functions and utilities
```

## 🚀 Getting Started

### Development Setup
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Access developer setup at `/dev-setup` to create test users

### User Creation Workflow
1. **Tenant Owner**: Public signup creates tenant + owner user
2. **Branch Manager**: Created by owner through tenant dashboard
3. **Salesperson/Staff**: Created by managers through branch dashboard

## 🔧 Configuration Files
- **Database Schema**: `scripts/Schemas.txt`
- **Navigation Config**: `src/routes/navigation.config.ts` 
- **Route Protection**: `src/routes/index.tsx`
- **Auth Helpers**: `src/utils/authHelpers.ts`

## 🎯 Ready for Integration
- All `/tenant/*` routes are configured and ready
- Role-based navigation system implemented
- User management framework prepared
- Authentication flow optimized for multi-tenant structure

---
*Last updated: January 2025*
