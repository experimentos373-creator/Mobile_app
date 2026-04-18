/**
 * EduHub Brasil - Security Utilities
 * DOM-based sanitization for app templates plus strict sanitization for
 * user-generated / AI-generated rich content.
 */

const APP_FORBIDDEN_TAGS = new Set(["script", "iframe", "object", "embed", "meta", "base"]);
const INLINE_EVENT_PREFIXES = [
  "Router.navigate",
  "Router.back",
  "App.",
  "AppState.",
  "SoundManager.",
  "window.open",
  "history.back",
  "window.history.back",
  "document.dispatchEvent"
];
const INLINE_EVENT_BLOCKLIST = /(?:\b(?:eval|Function|import)\b|<|>|`|\\x|\\u00)/i;
const RICH_ALLOWED_TAGS = [
  "h1", "h2", "h3", "div", "p", "span", "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td",
  "strong", "em", "code", "pre", "hr", "br"
];
const RICH_ALLOWED_ATTR = ["class", "colspan", "rowspan", "aria-hidden"];

const Security = {
  sanitize(html) {
    if (!html) return "";

    const template = document.createElement("template");
    template.innerHTML = String(html);

    const elements = template.content.querySelectorAll("*");
    elements.forEach((el) => {
      const tagName = el.tagName.toLowerCase();
      if (APP_FORBIDDEN_TAGS.has(tagName)) {
        el.remove();
        return;
      }

      Array.from(el.attributes).forEach((attr) => {
        const attrName = attr.name.toLowerCase();
        const value = attr.value || "";

        if (attrName.startsWith("on")) {
          if (attrName !== "onclick" || !this.isSafeInlineAction(value)) {
            el.removeAttribute(attr.name);
          }
          return;
        }

        if (attrName === "href" || attrName === "src" || attrName === "xlink:href") {
          if (!this.isSafeUrl(value, tagName)) {
            el.removeAttribute(attr.name);
          }
          return;
        }

        if (attrName === "style" && this.hasUnsafeCss(value)) {
          el.removeAttribute(attr.name);
          return;
        }

        if (attrName === "srcdoc") {
          el.removeAttribute(attr.name);
        }
      });
    });

    return template.innerHTML;
  },

  sanitizeRichHTML(html) {
    if (!html) return "";

    if (window.DOMPurify) {
      return window.DOMPurify.sanitize(String(html), {
        ALLOWED_TAGS: RICH_ALLOWED_TAGS,
        ALLOWED_ATTR: RICH_ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
        ALLOW_ARIA_ATTR: true,
        FORBID_ATTR: ["style"],
        KEEP_CONTENT: true
      });
    }

    return this.escapeHTML(String(html));
  },

  sanitizeRichInlineHTML(html) {
    return this.sanitizeRichHTML(html);
  },

  isSafeInlineAction(value) {
    const action = String(value || "").trim();
    if (!action || INLINE_EVENT_BLOCKLIST.test(action)) return false;
    return INLINE_EVENT_PREFIXES.some((prefix) => action.startsWith(prefix));
  },

  isSafeUrl(value, tagName = "") {
    const url = String(value || "").trim();
    if (!url) return true;

    if (
      url.startsWith("#") ||
      url.startsWith("/") ||
      url.startsWith("./") ||
      url.startsWith("../")
    ) {
      return true;
    }

    if (/^data:/i.test(url)) {
      return tagName === "img" || tagName === "audio" || tagName === "video";
    }

    if (/^blob:/i.test(url)) return true;
    if (/^(https?:|mailto:|tel:)/i.test(url)) return true;
    if (/^(javascript:|vbscript:)/i.test(url)) return false;

    return !/^[a-zA-Z][a-zA-Z\d+\-.]*:/i.test(url);
  },

  hasUnsafeCss(value) {
    return /expression\s*\(|javascript:|url\s*\(\s*['"]?\s*javascript:/i.test(String(value || ""));
  },

  escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }
};

window.Security = Security;
