const MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID; // ex: G-XXXXXXX
const API_SECRET = process.env.GA_API_SECRET; // criado no Admin do GA4

export type GA4Item = {
  item_id: string | number;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
};

export async function sendPurchaseEvent({
  clientId,
  transaction_id,
  value,
  currency = 'BRL',
  items,
}: {
  clientId: string; // client_id exigido pelo Measurement Protocol
  transaction_id: string;
  value: number;
  currency?: string;
  items: GA4Item[];
}): Promise<void> {
  if (!MEASUREMENT_ID || !API_SECRET) {
    // Sem credenciais, não envia
    return;
  }
  try {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;
    const body = {
      client_id: clientId,
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id,
            value,
            currency,
            items,
          },
        },
      ],
    };
    const fetchAny: any = (global as any).fetch;
    if (!fetchAny) return; // fetch indisponível
    await fetchAny(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('GA4 sendPurchaseEvent error', err);
  }
}
