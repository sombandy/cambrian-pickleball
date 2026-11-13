// Who may enter and change Tournament 12 scores. Add one email per line and
// deploy. A person can edit only when signed in to the site with an account
// that has verified one of these emails; everyone else can view but not save.
// Matching ignores case and surrounding spaces. An empty list denies all edits.
import { normalizeEmail } from "../admin-bootstrap";

export const EDITOR_EMAILS: string[] = [
  // Organizers
  "somnath.banerjee@gmail.com",
  "rangaprabhu@gmail.com",
  "shivesh83@gmail.com",
  // Team captains
  "ankitragarwal@gmail.com",
  "kaushikspec@gmail.com",
  "jaynesh1984@gmail.com",
  "rajasekar87.ra@gmail.com",
  "arun.venkatesan@gmail.com",
  "balaji.rengarajan@gmail.com",
];

export function editorAllowed(
  verifiedEmails: readonly string[],
  allowed: readonly string[] = EDITOR_EMAILS,
) {
  const list = new Set(allowed.map(normalizeEmail).filter(Boolean));
  return verifiedEmails.some((email) => list.has(normalizeEmail(email)));
}
