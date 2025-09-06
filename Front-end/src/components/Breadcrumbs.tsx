"use client";
import Link from "next/link";
import React from "react";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm mb-3">
      <ol className="flex items-center gap-2 text-slate-500">
        {items.map((c, i) => (
          <li key={i} className="inline-flex items-center gap-2">
            {c.href ? (
              <Link href={c.href} className="hover:text-[var(--brand)]">
                {c.label}
              </Link>
            ) : (
              <span className="text-slate-700">{c.label}</span>
            )}
            {i < items.length - 1 && <span className="opacity-60">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}