export const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'ops_admin', label: 'Ops Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'operator', label: 'Operator' },
  { value: 'viewer', label: 'Viewer' },
];

export const ROLE_COLORS = {
  admin: "bg-red-100 text-red-800 border-red-200",
  ops_admin: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  manager: "bg-purple-100 text-purple-800 border-purple-200",
  operator: "bg-blue-100 text-blue-800 border-blue-200",
  viewer: "bg-slate-100 text-slate-800 border-slate-200",
};

/**
 * Returns the Tailwind CSS classes for a given role.
 * @param {string} roleValue - The role identifier (e.g., 'admin', 'viewer').
 * @returns {string} The corresponding CSS classes.
 */
export const getRoleColor = (roleValue) => {
  return ROLE_COLORS[roleValue] || ROLE_COLORS.viewer;
};