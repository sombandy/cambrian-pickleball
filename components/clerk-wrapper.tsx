"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const hasClerkKeys = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const ClerkProviderLazy = hasClerkKeys
  ? dynamic(
      () =>
        import("@clerk/nextjs").then((mod) => {
          const Wrapper = ({ children }: { children: ReactNode }) => (
            <mod.ClerkProvider>{children}</mod.ClerkProvider>
          );
          Wrapper.displayName = "ClerkProviderWrapper";
          return Wrapper;
        }),
      { ssr: false }
    )
  : null;

export function ClerkWrapper({ children }: { children: ReactNode }) {
  if (ClerkProviderLazy) {
    return <ClerkProviderLazy>{children}</ClerkProviderLazy>;
  }
  return <>{children}</>;
}
