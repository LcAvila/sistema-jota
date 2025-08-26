"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Cookie } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie_consent_v1");
      if (!consent) setVisible(true);
    } catch (e) {
      console.error("Failed to check cookie consent from localStorage", e);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem("cookie_consent_v1", JSON.stringify({ acceptedAt: Date.now() }));
    } catch (e) {
      console.error("Failed to set cookie consent in localStorage", e);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 inset-x-4 z-[100] p-4 bg-white rounded-lg shadow-2xl border border-green-100 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <Cookie className="h-8 w-8 text-green-600 flex-shrink-0" />
        <p className="text-sm text-gray-700 flex-1">
          Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa{" "}
          <Link href="/politica-de-cookies" className="underline hover:text-green-600 transition-colors">Política de Cookies</Link> e{" "}
          <Link href="/politica-de-privacidade" className="underline hover:text-green-600 transition-colors">Política de Privacidade</Link>.
        </p>
      </div>
      <Button
        onClick={accept}
        aria-label="Aceitar e continuar"
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-6"
      >
        Aceitar
      </Button>
    </div>
  );
}
