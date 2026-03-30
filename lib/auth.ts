import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { isBootstrapAdminUser } from "@/lib/admin-bootstrap";

type SessionClaimsShape = {
  metadata?: {
    is_admin?: boolean;
  };
};

function getAdminClaim(sessionClaims: unknown) {
  const typedClaims = sessionClaims as SessionClaimsShape | null | undefined;

  if (typeof typedClaims?.metadata?.is_admin === "boolean") {
    return typedClaims.metadata.is_admin;
  }

  return null;
}

export async function getViewerAuth() {
  const authState = await auth();
  const claimValue = getAdminClaim(authState.sessionClaims);

  if (!authState.userId) {
    return {
      userId: null,
      isSignedIn: false,
      isAdmin: false,
    };
  }

  if (claimValue === true) {
    return {
      userId: authState.userId,
      isSignedIn: true,
      isAdmin: true,
    };
  }

  const user = await currentUser();

  return {
    userId: authState.userId,
    isSignedIn: true,
    isAdmin:
      user?.privateMetadata?.is_admin === true ||
      (user ? isBootstrapAdminUser(user) : false),
  };
}

export async function requireAdminPage() {
  const authState = await auth();

  if (!authState.userId) {
    return authState.redirectToSignIn();
  }

  const viewer = await getViewerAuth();

  if (!viewer.isAdmin) {
    redirect("/");
  }

  return viewer;
}

export async function getSignedInUserId() {
  const authState = await auth();
  return authState.userId;
}
