"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPurchaseEvent = sendPurchaseEvent;
const MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID; // ex: G-XXXXXXX
const API_SECRET = process.env.GA_API_SECRET; // criado no Admin do GA4
async function sendPurchaseEvent({ clientId, transaction_id, value, currency = 'BRL', items, }) {
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
        const fetchAny = global.fetch;
        if (!fetchAny)
            return; // fetch indisponível
        await fetchAny(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    }
    catch (err) {
        console.error('GA4 sendPurchaseEvent error', err);
    }
}
