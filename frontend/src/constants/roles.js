/**
 * Role definitions matching the backend Role enum.
 * Each role has a value (sent to API) and a human-readable label.
 */
export const ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'PROCUREMENT', label: 'Procurement Officer' },
  { value: 'FINANCE', label: 'Finance Officer' },
  { value: 'SUPPLIER', label: 'Supplier' },
];

/**
 * Map of role values to badge colour classes (Tailwind).
 */
export const ROLE_COLORS = {
  ADMIN: 'bg-blue-100 text-blue-700',
  EMPLOYEE: 'bg-slate-100 text-slate-700',
  MANAGER: 'bg-violet-100 text-violet-700',
  PROCUREMENT: 'bg-amber-100 text-amber-700',
  FINANCE: 'bg-emerald-100 text-emerald-700',
  SUPPLIER: 'bg-cyan-100 text-cyan-700',
};
