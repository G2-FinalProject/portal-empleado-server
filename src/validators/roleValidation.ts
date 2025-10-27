/**
 * ✅ Validaciones para Roles
 * 
 * Aquí centralizamos toda la lógica de validación de datos
 * usada por el RoleController.
 */

export function validateRoleData(role_name: any): string | null {
  if (!role_name) return "El nombre del rol es obligatorio.";
  if (typeof role_name !== "string") return "El nombre del rol debe ser texto.";
  if (role_name.trim().length < 3)
    return "El nombre del rol debe tener al menos 3 caracteres.";
  if (role_name.trim().length > 50)
    return "El nombre del rol no puede exceder 50 caracteres.";
  return null;
}

export function validateAssignData(userId: any, roleId: any): string | null {
  if (!userId || !roleId)
    return "Faltan campos obligatorios: userId y roleId.";
  if (isNaN(Number(userId)) || isNaN(Number(roleId)))
    return "Los IDs deben ser numéricos.";
  return null;
}
