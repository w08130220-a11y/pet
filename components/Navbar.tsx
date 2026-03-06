"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Benefits", href: "/benefits" },
  { label: "Specifications", href: "/specifications" },
  { label: "How-to", href: "/howto" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const basePath = process.env.NODE_ENV === "production" ? "/beautyWeb" : "";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-olive-100/80 backdrop-blur-md border-b border-olive-200/50">
        <div className="section-container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo - minimalist figure icon */}
            <svg
              width="28"
              height="36"
              viewBox="0 0 28 36"
              fill="none"
              className="text-gray-900"
            >
              <circle cx="14" cy="6" r="4" fill="currentColor" />
              <path
                d="M14 12C14 12 8 16 8 22C8 26 10 30 14 34"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M14 12C14 12 20 16 20 22C20 26 18 30 14 34"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xl font-bold tracking-tight">Area</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-olive-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/contact" className="btn-primary text-sm">
              Learn More →
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-0.5 bg-gray-900 transition-transform duration-300 ${open ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`w-6 h-0.5 bg-gray-900 transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`w-6 h-0.5 bg-gray-900 transition-transform duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full px-8 pt-6">
          <div className="flex items-center justify-between mb-10">
            <span className="text-2xl font-bold tracking-tight">Area</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="border-t border-gray-200 pt-6 flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-lg font-medium text-gray-800 hover:text-olive-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-auto pb-10">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="btn-primary w-full justify-center"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
