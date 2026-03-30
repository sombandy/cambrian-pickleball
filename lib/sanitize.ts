import sanitizeHtml from "sanitize-html";

export function sanitizeRichText(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["p", "ul", "ol", "li", "strong", "em", "b", "i", "br"],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}
