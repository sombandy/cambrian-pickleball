import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { clerkEnabled } from "@/lib/clerk-enabled";

export function ClerkWrapper({ children }: { children: ReactNode }) {
  if (!clerkEnabled) {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}
