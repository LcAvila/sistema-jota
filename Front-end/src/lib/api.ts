"use client";
import { Role } from "@/store/session";
import { API_BASE } from "@/lib/config";

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered";

export type OrderItem = {
  id: number;
  productId: number;
  name: string;
  qty: number;
  unitPrice: number;
};

export type Order = {
  id: number;
  clientName: string;
  sellerName: string;
  storeName: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  total: number;
};

export type Notification = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

// --- Real API integration ---
export async function authLogin(email: string, password: string): Promise<{ token: string; user: { id: number; name: string; email: string; role: Role; storeId?: number } }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    let message = "Falha no login";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    if (res.status === 401) message = "Credenciais inválidas";
    if (res.status === 403) message = "Acesso negado";
    if (res.status === 429) message = "Muitas tentativas. Tente novamente mais tarde";
    throw new Error(message);
  }
  const data = await res.json();
  return data;
}

// Tenta enviar um e-mail de recuperação de senha.
// ATENÇÃO: ajuste o endpoint abaixo conforme seu backend (ex.: /api/auth/forgot, /api/auth/password/forgot, etc.).
export async function requestPasswordReset(email: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    let message = "Não foi possível iniciar a recuperação";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    if (res.status === 404) message = "E-mail não encontrado";
    if (res.status === 429) message = "Muitas tentativas. Tente novamente mais tarde";
    throw new Error(message);
  }
  const data = await res.json().catch(() => ({}));
  return { ok: true, message: data?.message || "Se existir uma conta para este e-mail, enviaremos instruções." };
}

export async function listOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error((await res.json()).message || "Falha ao carregar pedidos");
  const data = await res.json();
  return data.map(mapApiOrderToOrder);
}

export async function changeOrderStatus(orderId: number, toStatus: OrderStatus, token: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ toStatus })
  });
  if (!res.ok) throw new Error((await res.json()).message || "Falha ao mudar status");
  const data = await res.json();
  return mapApiOrderToOrder(data);
}

function mapApiOrderToOrder(o: any): Order {
  return {
    id: o.id,
    clientName: o.client?.name || "Cliente",
    sellerName: o.seller?.name || "",
    storeName: o.store?.name || "",
    status: o.status,
    createdAt: o.createdAt,
    items: (o.items || []).map((it: any) => ({
      id: it.id,
      productId: it.productId,
      name: it.product?.name || String(it.productId),
      qty: it.qty,
      unitPrice: Number(it.unitPrice)
    })),
    total: Number(o.total ?? (o.items || []).reduce((s: number, it: any) => s + Number(it.unitPrice) * it.qty, 0)),
  };
}

let NOTIFICATIONS: Notification[] = [
  { id: 1, title: "Novo pedido", message: "Pedido #1 criado", createdAt: new Date().toISOString(), read: false },
  { id: 2, title: "Atualização", message: "Pedido #2 está em preparação", createdAt: new Date(Date.now()-1000*60*5).toISOString(), read: false },
];

// keep local notifications mock for now

// remove createOrderMock for now; when backend create order is ready, we can add it here

export function groupOrdersByStatus(orders: Order[]) {
  return {
    pending: orders.filter(o => o.status === "pending"),
    preparing: orders.filter(o => o.status === "preparing"),
    ready: orders.filter(o => o.status === "ready"),
    delivered: orders.filter(o => o.status === "delivered"),
  };
}

export async function listNotifications(): Promise<Notification[]> {
  await delay(150);
  return JSON.parse(JSON.stringify(NOTIFICATIONS));
}

export async function markNotificationRead(id: number): Promise<void> {
  await delay(80);
  const idx = NOTIFICATIONS.findIndex(n => n.id === id);
  if (idx !== -1) NOTIFICATIONS[idx].read = true;
}

function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }
