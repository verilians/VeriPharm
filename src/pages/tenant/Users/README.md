# User Management Component Architecture

This directory contains a properly separated and modular user management system for the VeriPharm application.

## Component Structure

### Core Components

1. **`index.tsx`** - Main Users component that provides the UserProvider context and renders the UsersContent
2. **`UserContext.tsx`** - Context provider that manages all user-related state and business logic
3. **`types.ts`** - TypeScript type definitions and constants

### UI Components

4. **`UserFilters.tsx`** - Search and filter controls for users
5. **`UserGrid.tsx`** - Grid layout container for user cards
6. **`UserCard.tsx`** - Individual user card component
7. **`UserModal.tsx`** - Add/Edit user modal form
8. **`UserDetailModal.tsx`** - User detail view and actions modal (includes sales modal)
9. **`DeletedUsersPanel.tsx`** - Collapsible panel showing deleted users
10. **`DeleteConfirmModal.tsx`** - Confirmation dialog for user deletion

### Helper Files

11. **`components.ts`** - Barrel export file for easy imports
12. **`mockUsers.ts`** - Mock data (existing file)

## Key Features

### Separation of Concerns
- **State Management**: All state is centralized in UserContext
- **Business Logic**: Complex operations are handled in context methods
- **UI Components**: Pure components that receive props and trigger callbacks
- **Type Safety**: Strong TypeScript typing throughout

### Integration with Branch System
- Dynamically loads available branches from BranchContext
- Ensures users can only be assigned to existing branches
- Maintains referential integrity

### Enhanced User Experience
- Proper form validation with HTML5 input types
- Consistent styling maintained from original design
- Loading states and error handling built-in
- Accessible modals with proper ARIA labels

### Data Flow
```
UserProvider (context)
├── UsersContent (main layout)
│   ├── UserFilters (search/filter)
│   ├── UserGrid
│   │   └── UserCard (individual users)
│   └── DeletedUsersPanel
├── UserModal (add/edit)
├── UserDetailModal (view/actions)
│   └── SalesModal (embedded)
└── DeleteConfirmModal
```

## Usage

```tsx
import Users from './pages/tenant/Users';

// Or for individual components
import { UserCard, useUsers } from './pages/tenant/Users/components';
```

## Benefits

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be used independently
3. **Testability**: Isolated components are easier to test
4. **Performance**: Better optimization through smaller components
5. **Developer Experience**: Clear structure and type safety
