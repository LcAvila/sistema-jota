import { Role } from "@/store/session";
import { OrderStatus } from "@/lib/api";

// Lista de transições permitidas por role
const ALLOWED: Record<Role, Array<[from: OrderStatus, to: OrderStatus]>> = {
  admin: [
    ["pending", "preparing"],
    ["preparing", "ready"],
    ["ready", "delivered"],
  ],
  supervisor: [
    ["pending", "preparing"],
    ["preparing", "ready"],
    ["ready", "delivered"],
  ],
  kitchen: [
    ["pending", "preparing"],
    ["preparing", "ready"],
  ],
  delivery: [
    ["ready", "delivered"],
  ],
  seller: []
};

export function canMove(role: Role | undefined, from: OrderStatus, to: OrderStatus): boolean {
  if (!role) return false;
  const rules = ALLOWED[role] || [];
  return rules.some(([f, t]) => f === from && t === to);
}

export function canAdvance(role: Role | undefined, from: OrderStatus, to: OrderStatus | null): boolean {
  if (!to) return false;
  return canMove(role, from, to);
}
