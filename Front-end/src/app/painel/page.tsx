"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PainelIndexPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/painel/pedidos"); }, [router]);
  return null;
}
