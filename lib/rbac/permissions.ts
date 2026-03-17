import { RoleName } from "@prisma/client";

const viewRoles = new Set<RoleName>([RoleName.ADMIN, RoleName.OPERATOR, RoleName.READ_ONLY]);
const writeRoles = new Set<RoleName>([RoleName.ADMIN, RoleName.OPERATOR]);
const adminRoles = new Set<RoleName>([RoleName.ADMIN]);

export function canView(role: RoleName) {
  return viewRoles.has(role);
}

export function canWrite(role: RoleName) {
  return writeRoles.has(role);
}

export function isAdmin(role: RoleName) {
  return adminRoles.has(role);
}
