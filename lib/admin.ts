import { clerkClient } from "@clerk/nextjs/server";

import {
  getAdminBootstrapEmails,
  getPrimaryEmail,
  isBootstrapAdminUser,
  normalizeEmail,
} from "@/lib/admin-bootstrap";
import type { AdminUserRecord } from "@/lib/types";
import { getDisplayName } from "@/lib/utils";

function toAdminRecord(user: {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: Array<{ emailAddress?: string | null }>;
}) {
  return {
    id: user.id,
    name: getDisplayName(user),
    email: getPrimaryEmail(user),
    isAdmin: true,
  } satisfies AdminUserRecord;
}

export async function listAdmins() {
  const client = await clerkClient();
  const adminMap = new Map<string, AdminUserRecord>();
  const limit = 100;
  let offset = 0;
  let totalCount = 0;

  do {
    const response = await client.users.getUserList({
      limit,
      offset,
    });

    totalCount = response.totalCount;
    offset += limit;

    for (const user of response.data) {
      if (user.privateMetadata?.is_admin === true) {
        adminMap.set(user.id, toAdminRecord(user));
      }
    }
  } while (offset < totalCount);

  const bootstrapEmails = getAdminBootstrapEmails();

  for (let index = 0; index < bootstrapEmails.length; index += 100) {
    const chunk = bootstrapEmails.slice(index, index + 100);
    const response = await client.users.getUserList({
      emailAddress: chunk,
      limit: chunk.length,
    });

    for (const user of response.data) {
      adminMap.set(user.id, toAdminRecord(user));
    }
  }

  return [...adminMap.values()].sort((left, right) => left.name.localeCompare(right.name));
}

export async function grantAdminByEmail(email: string) {
  const client = await clerkClient();
  const response = await client.users.getUserList({
    emailAddress: [normalizeEmail(email)],
    limit: 1,
  });

  const user = response.data[0];

  if (!user) {
    return null;
  }

  await client.users.updateUserMetadata(user.id, {
    privateMetadata: {
      ...user.privateMetadata,
      is_admin: true,
    },
  });

  return user.id;
}

export async function revokeAdmin(clerkId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkId);

  if (isBootstrapAdminUser(user)) {
    throw new Error(
      "This admin is granted through ADMIN_BOOTSTRAP_EMAILS. Remove the email from that env variable first.",
    );
  }

  await client.users.updateUserMetadata(user.id, {
    privateMetadata: {
      ...user.privateMetadata,
      is_admin: false,
    },
  });
}
