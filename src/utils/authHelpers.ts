/**
 * Authentication helper functions
 */

export type UserRole = "owner" | "manager" | "cashier" | "staff";

/**
 * Get the default route for a user based on their role
 */
export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "owner":
      return "/tenant/dashboard";
    case "manager":
      return "/branch/dashboard";
    case "cashier":
    case "staff":
      return "/branch/sales/pos";
    default:
      return "/login";
  }
}

/**
 * Check if a user role has access to a specific route
 */
export function hasRouteAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Get user-friendly role name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "manager":
      return "Manager";
    case "cashier":
      return "Cashier";
    case "staff":
      return "Staff";
    default:
      return role;
  }
}
