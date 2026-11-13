"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Home, Menu, X } from "lucide-react";

import {
  RANKINGS_PATH,
  TOURNAMENT_FEEDBACK_PATH,
  TOURNAMENT_INDEX_PATH,
} from "@/lib/constants";

const navItems: { label: string; href: string }[] = [
  { label: "Tournaments", href: TOURNAMENT_INDEX_PATH },
  { label: "Rankings", href: RANKINGS_PATH },
  { label: "Tournament Feedback", href: TOURNAMENT_FEEDBACK_PATH },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Site-wide account control: a Sign in link when signed out, the Clerk avatar menu (with Sign out) when signed in.
function AccountControl({ pathname }: { pathname: string | null }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (isSignedIn) {
    return (
      <UserButton
        appearance={{ elements: { userButtonAvatarBox: "h-10 w-10" } }}
      />
    );
  }
  if (pathname?.startsWith("/sign-")) return null;
  return (
    <Link
      href={`/sign-in?redirect_url=${encodeURIComponent(pathname ?? "/")}`}
      className="secondary-button rounded-full px-4 py-2.5 text-sm font-medium"
    >
      Sign in
    </Link>
  );
}

export function SiteHeader({ accountEnabled }: { accountEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-outline/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="Home"
          className="soft-button inline-flex h-10 w-10 items-center justify-center rounded-full"
        >
          <Home className="h-[18px] w-[18px]" />
        </Link>

        <div className="flex items-center gap-3">
          {accountEnabled ? <AccountControl pathname={pathname} /> : null}
          <div className="relative">
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-haspopup="menu"
              onClick={() => setOpen((value) => !value)}
              className="soft-button inline-flex h-10 w-10 items-center justify-center rounded-full"
            >
              {open ? (
                <X className="h-[18px] w-[18px]" />
              ) : (
                <Menu className="h-[18px] w-[18px]" />
              )}
            </button>

            {open ? (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-10 cursor-default bg-transparent"
                />
                <nav
                  role="menu"
                  aria-label="Site navigation"
                  className="absolute right-0 top-12 z-20 w-60 overflow-hidden rounded-2xl border border-outline/80 bg-white/96 shadow-[0_28px_50px_-30px_rgba(30,38,19,0.32)] backdrop-blur"
                >
                  <ul className="grid">
                    {navItems.map((item) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            role="menuitem"
                            aria-current={active ? "page" : undefined}
                            onClick={() => setOpen(false)}
                            className={`block px-4 py-3 text-[0.98rem] font-medium transition hover:bg-court-soft/70 ${
                              active
                                ? "bg-court-soft/60 text-court"
                                : "text-ink"
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
