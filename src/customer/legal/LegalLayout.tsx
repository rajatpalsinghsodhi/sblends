/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ReactNode } from "react";
import { ArrowLeft, Scissors } from "lucide-react";

const LOGO_URL = "/logobarber.png";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-gold uppercase tracking-widest mb-4 pb-2 border-b border-white/10">
        {heading}
      </h2>
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export function LegalSubSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-2">{heading}</h3>
      <div className="space-y-3 text-gray-400 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 text-gray-400 text-sm leading-relaxed pl-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function LegalLayout({ title, subtitle, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-noir text-gray-100" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-noir/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 group">
            <img src={LOGO_URL} alt="S.Blends Barbershop" className="h-9 w-auto" />
          </a>
          <a
            href="/"
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 hover:text-gold transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Site
          </a>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-noir-light border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 text-gold/60 text-xs uppercase tracking-widest mb-4">
            <Scissors size={12} />
            <span>S.Blends Barbershop &mdash; Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {title}
          </h1>
          <p className="text-gray-400 text-sm mb-2">{subtitle}</p>
          <p className="text-gray-600 text-xs uppercase tracking-widest">Last Updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-14">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-noir-light border-t border-white/5 py-10 mt-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-gray-600">
          <p>© 2026 S.Blends Barbershop. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="/email-sms-compliance" className="hover:text-white transition-colors">Email &amp; SMS Compliance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
