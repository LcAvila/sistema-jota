export type GAItem = {
  item_id: number | string;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
};

export function trackEvent(event: string, params: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, params);
  }
}

export function trackPurchase({
  transaction_id,
  value,
  currency = 'BRL',
  items,
}: { transaction_id: string; value: number; currency?: string; items: GAItem[] }) {
  trackEvent('purchase', {
    transaction_id,
    value,
    currency,
    items,
  });
}
