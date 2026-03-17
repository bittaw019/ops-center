export type UserRole = "ADMIN" | "OPERATOR" | "READ_ONLY";

export type SessionPayload = {
  sub: string;
  role: UserRole;
  email: string;
  name: string;
};
