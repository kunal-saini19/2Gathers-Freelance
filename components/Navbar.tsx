"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const guestLinks = [
  { href: "/jobs", label: "Jobs" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
];

const memberLinks = [
  { href: "/jobs", label: "Jobs" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wallet", label: "Wallet" },
  { href: "/chatbot", label: "AI Assistant" },
];

function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = user ? memberLinks : guestLinks;
  const navTone = scrolled ? "border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm" : "border-transparent bg-transparent";
  const textTone = scrolled ? "text-slate-700 hover:text-slate-900" : "text-slate-200 hover:text-white";

  return (
    <header className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${navTone}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-sm font-black text-white">2G</span>
          </div>
          <span className={`text-base font-bold transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}>2Gathers</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href} className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${active ? "bg-slate-900 text-white" : textTone}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <div className={`rounded-full px-3 py-1.5 text-sm font-medium ${scrolled ? "bg-slate-100 text-slate-700" : "bg-white/10 text-slate-200"}`}>
                {user.username}
              </div>
              <button
                type="button"
                onClick={logout}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${scrolled ? "text-slate-500 hover:bg-rose-50 hover:text-rose-600" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`rounded-lg px-4 py-2 text-sm font-medium transition ${textTone}`}>
                Sign in
              </Link>
              <Link href="/register" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={`rounded-lg p-2 transition md:hidden ${scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <div className="space-y-1 px-4 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    Sign in
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block rounded-lg bg-primary-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary-700">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export { Navbar };
export default Navbar;
