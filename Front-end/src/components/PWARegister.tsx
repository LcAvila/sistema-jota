"use client";
import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          // console.log('SW registrado', reg);
        } catch (e) {
          // console.error('SW falhou', e);
        }
      };
      register();
    }
  }, []);
  return null;
}
