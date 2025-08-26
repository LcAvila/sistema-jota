export interface Sale {
  id: number;
  client: { id: number; name: string };
  seller: { id: number; name: string };
  total: number;
  status: 'Concluído' | 'Pendente' | 'Cancelado';
  channel: 'app' | 'pos' | 'delivery';
  createdAt: string; // ISO 8601 format
  items: { productId: number; name: string; quantity: number; unitPrice: number }[];
  payments: { method: 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro'; amount: number }[];
}

export const mockSales: Sale[] = [
  {
    id: 1,
    client: { id: 101, name: 'João Silva' },
    seller: { id: 1, name: 'Maria Santos' },
    total: 150.50,
    status: 'Concluído',
    channel: 'app',
    createdAt: '2025-08-20T10:30:00Z',
    items: [
      { productId: 1, name: 'Cerveja Brahma 600ml', quantity: 2, unitPrice: 12.00 },
      { productId: 2, name: 'Refrigerante Coca-Cola 2L', quantity: 1, unitPrice: 8.50 },
      { productId: 3, name: 'Salgadinho Elma Chips 150g', quantity: 5, unitPrice: 23.60 }
    ],
    payments: [{ method: 'Cartão de Crédito', amount: 150.50 }],
  },
  {
    id: 2,
    client: { id: 102, name: 'Ana Costa' },
    seller: { id: 2, name: 'João Oliveira' },
    total: 89.99,
    status: 'Concluído',
    channel: 'pos',
    createdAt: '2025-08-20T14:20:00Z',
    items: [
      { productId: 4, name: 'Whisky Red Label 750ml', quantity: 1, unitPrice: 89.99 },
    ],
    payments: [{ method: 'Pix', amount: 89.99 }],
  },
  {
    id: 3,
    client: { id: 103, name: 'Carlos Lima' },
    seller: { id: 1, name: 'Maria Santos' },
    total: 234.75,
    status: 'Pendente',
    channel: 'delivery',
    createdAt: '2025-08-19T16:45:00Z',
    items: [
      { productId: 5, name: 'Vodka Absolut 1L', quantity: 1, unitPrice: 95.00 },
      { productId: 6, name: 'Cerveja Heineken 330ml', quantity: 6, unitPrice: 7.50 },
      { productId: 7, name: 'Vinho Tinto Suave 750ml', quantity: 2, unitPrice: 47.375 },
    ],
    payments: [{ method: 'Cartão de Débito', amount: 234.75 }],
  },
  {
    id: 4,
    client: { id: 104, name: 'Lucia Ferreira' },
    seller: { id: 3, name: 'Pedro Silva' },
    total: 67.30,
    status: 'Cancelado',
    channel: 'app',
    createdAt: '2025-08-18T09:15:00Z',
    items: [
      { productId: 8, name: 'Cerveja Skol 350ml', quantity: 12, unitPrice: 4.50 },
      { productId: 9, name: 'Água Tônica 350ml', quantity: 2, unitPrice: 6.65 },
    ],
    payments: [{ method: 'Dinheiro', amount: 67.30 }],
  },
    {
    id: 5,
    client: { id: 101, name: 'João Silva' },
    seller: { id: 2, name: 'João Oliveira' },
    total: 45.00,
    status: 'Concluído',
    channel: 'pos',
    createdAt: '2025-07-25T11:00:00Z',
    items: [
      { productId: 6, name: 'Cerveja Heineken 330ml', quantity: 6, unitPrice: 7.50 },
    ],
    payments: [{ method: 'Pix', amount: 45.00 }],
  },
];
