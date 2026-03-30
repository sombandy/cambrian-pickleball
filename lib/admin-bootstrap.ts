type UserEmailShape = {
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: Array<{ emailAddress?: string | null }>;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAdminBootstrapEmails() {
  return (process.env.ADMIN_BOOTSTRAP_EMAILS ?? "")
    .split(/[,\n]/)
    .map((email) => email.trim())
    .filter(Boolean)
    .map(normalizeEmail);
}

export function getUserEmails(user: UserEmailShape) {
  const emails = [
    user.primaryEmailAddress?.emailAddress ?? null,
    ...(user.emailAddresses?.map((entry) => entry.emailAddress ?? null) ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeEmail);

  return [...new Set(emails)];
}

export function getPrimaryEmail(user: UserEmailShape) {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress ??
    "No email available"
  );
}

export function isBootstrapAdminUser(user: UserEmailShape) {
  const bootstrapEmails = new Set(getAdminBootstrapEmails());

  if (bootstrapEmails.size === 0) {
    return false;
  }

  return getUserEmails(user).some((email) => bootstrapEmails.has(email));
}
