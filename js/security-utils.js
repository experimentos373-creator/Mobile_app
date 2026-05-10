/**
 * EduHub Brasil - Security Utilities
 * DOM-based sanitization for app templates plus strict sanitization for
 * user-generated / AI-generated rich content.
 */

const APP_FORBIDDEN_TAGS = new Set(["script", "iframe", "object", "embed", "meta", "base"]);
const INLINE_EVENT_ATTRS = new Set(["onclick", "onerror"]);
const INLINE_EVENT_PREFIXES = [
  "Router.navigate",
  "Router.back",
  "handlePlanSelect",
  "App.",
  "AppState.",
  "SoundManager.",
  "event.stopPropagation",
  "if(event.target===this)",
  "window.openExamDatePicker",
  "window.location.reload",
  "window.open",
  "history.back",
  "window.history.back",
  "document.dispatchEvent",
  "if(!this.src.includes"
];
const INLINE_EVENT_BLOCKLIST = /(?:\b(?:eval|Function|import)\b|<|>|`|\\x|\\u00)/i;
const RICH_ALLOWED_TAGS = [
  "h1", "h2", "h3", "div", "p", "span", "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td",
  "strong", "em", "code", "pre", "hr", "br"
];
const RICH_ALLOWED_ATTR = ["class", "colspan", "rowspan", "aria-hidden"];

function splitTopLevel(input, separator) {
  const out = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let escapeNext = false;
  let parenDepth = 0;
  let braceDepth = 0;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (escapeNext) {
      current += ch;
      escapeNext = false;
      continue;
    }
    if (ch === "\\") {
      current += ch;
      escapeNext = true;
      continue;
    }
    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
      current += ch;
      continue;
    }
    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
      current += ch;
      continue;
    }
    if (inSingle || inDouble) {
      current += ch;
      continue;
    }
    if (ch === "(") parenDepth += 1;
    if (ch === ")") parenDepth = Math.max(0, parenDepth - 1);
    if (ch === "{") braceDepth += 1;
    if (ch === "}") braceDepth = Math.max(0, braceDepth - 1);

    if (ch === separator && parenDepth === 0 && braceDepth === 0) {
      out.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  if (current.trim()) out.push(current.trim());
  return out;
}

function parseQuotedString(token) {
  const quote = token[0];
  const body = token.slice(1, -1);
  if (quote === "'") {
    return body
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\");
  }
  return body
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function safePathGet(path, ctx) {
  if (!path) return undefined;
  if (path === "this") return ctx.element;
  if (path === "event") return ctx.event;
  if (Object.prototype.hasOwnProperty.call(ctx.locals, path)) return ctx.locals[path];

  const parts = path.split(".");
  let root = null;

  if (parts[0] === "window") {
    root = window;
    parts.shift();
  } else if (parts[0] === "document") {
    root = document;
    parts.shift();
  } else if (parts[0] === "this") {
    root = ctx.element;
    parts.shift();
  } else if (parts[0] === "event") {
    root = ctx.event;
    parts.shift();
  } else if (Object.prototype.hasOwnProperty.call(ctx.locals, parts[0])) {
    root = ctx.locals[parts[0]];
    parts.shift();
  } else {
    root = window[parts[0]];
    parts.shift();
  }

  let value = root;
  for (const part of parts) {
    if (value == null) return undefined;
    value = value[part];
  }
  return value;
}

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
          if (
            INLINE_EVENT_ATTRS.has(attrName) &&
            this.isSafeInlineAction(value, attrName)
          ) {
            el.setAttribute(`data-inline-${attrName}`, value);
          }
          el.removeAttribute(attr.name);
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

  isSafeInlineAction(value, attrName = "onclick") {
    const action = String(value || "").trim();
    if (!action || INLINE_EVENT_BLOCKLIST.test(action)) return false;
    if (attrName === "onerror") {
      return (
        action.startsWith("if(!this.src.includes") ||
        action.startsWith("document.getElementById")
      );
    }
    return INLINE_EVENT_PREFIXES.some((prefix) => action.startsWith(prefix));
  },

  bindInlineHandlers(root = document) {
    if (window.__eduhubInlineDelegationBound === "1") return;
    window.__eduhubInlineDelegationBound = "1";

    document.addEventListener("click", (event) => {
      const origin = event.target;
      if (!(origin instanceof Element)) return;
      const el = origin.closest("[data-inline-onclick]");
      if (!el) return;

      const action = String(el.getAttribute("data-inline-onclick") || "").trim();
      if (!action) return;
      this.executeInlineAction(action, { event, element: el });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const origin = event.target;
      if (!(origin instanceof Element)) return;
      const el = origin.closest("[data-inline-onclick]");
      if (!el || el.getAttribute("role") !== "button") return;

      const action = String(el.getAttribute("data-inline-onclick") || "").trim();
      if (!action) return;
      event.preventDefault();
      this.executeInlineAction(action, { event, element: el });
    });

    // `error` does not bubble, so we listen in capture phase.
    document.addEventListener(
      "error",
      (event) => {
        const origin = event.target;
        if (!(origin instanceof Element)) return;
        const action = String(origin.getAttribute("data-inline-onerror") || "").trim();
        if (!action) return;
        this.executeInlineAction(action, { event, element: origin });
      },
      true
    );
  },

  executeInlineAction(action, context) {
    const code = String(action || "").trim();
    if (!code || !this.isSafeInlineAction(code, context?.event?.type === "error" ? "onerror" : "onclick")) {
      return;
    }

    const ctx = {
      event: context?.event || null,
      element: context?.element || null,
      locals: {}
    };

    try {
      // Common overlay close pattern.
      if (code === "if(event.target===this){this.classList.remove('active')}") {
        if (ctx.event && ctx.event.target === ctx.element) {
          ctx.element.classList.remove("active");
        }
        return;
      }

      // Common dark-mode toggle sequence in profile settings.
      if (
        code.startsWith("App.toggleDark();") &&
        code.includes("const knob=this.querySelector('div')")
      ) {
        if (window.App && typeof window.App.toggleDark === "function") {
          window.App.toggleDark();
        }
        if (ctx.element) {
          ctx.element.classList.toggle("bg-emerald-500");
          ctx.element.classList.toggle("bg-slate-700");
          const knob = ctx.element.querySelector("div");
          if (knob) {
            knob.classList.toggle("left-7");
            knob.classList.toggle("left-1");
          }
        }
        return;
      }

      // Explicit async sync pattern used in profile page.
      if (code.startsWith("AppState.syncFull().then(")) {
        if (window.AppState && typeof window.AppState.syncFull === "function") {
          window.AppState.syncFull().then(() => {
            if (window.SoundManager && typeof window.SoundManager.play === "function") {
              window.SoundManager.play("success");
            }
            if (window.Router && typeof window.Router.navigate === "function") {
              window.Router.navigate("/progresso", false, true);
            }
          });
        }
        return;
      }

      // Fallback thumbnail handler.
      if (code.startsWith("if(!this.src.includes('mqdefault')) this.src='")) {
        const match = code.match(/^if\(!this\.src\.includes\('mqdefault'\)\)\s*this\.src='([^']+)'$/);
        if (match && ctx.element) {
          if (!String(ctx.element.src || "").includes("mqdefault")) {
            ctx.element.src = match[1];
          }
        }
        return;
      }

      // Simulado image hide handler.
      if (code.startsWith("document.getElementById('simulado-image-container').classList.add('hidden')")) {
        const target = document.getElementById("simulado-image-container");
        if (target) target.classList.add("hidden");
        return;
      }

      const statements = splitTopLevel(code, ";");
      for (const statement of statements) {
        if (!statement) continue;
        this._executeStatement(statement, ctx);
      }
    } catch (error) {
      console.warn("[Security] Inline action blocked:", error?.message || error);
    }
  },

  _executeStatement(statement, ctx) {
    const stmt = String(statement || "").trim();
    if (!stmt) return;

    if (stmt.startsWith("if(")) {
      const match = stmt.match(/^if\((.+)\)\{([\s\S]+)\}$/);
      if (match && this._evaluateCondition(match[1], ctx)) {
        const nested = splitTopLevel(match[2], ";");
        nested.forEach((line) => {
          if (line) this._executeStatement(line, ctx);
        });
      }
      return;
    }

    if (stmt.includes("&&")) {
      const parts = stmt.split("&&").map((p) => p.trim());
      if (parts.length === 2) {
        const left = this._evaluateValue(parts[0], ctx);
        if (left) this._executeStatement(parts[1], ctx);
      }
      return;
    }

    if (stmt.startsWith("const ")) {
      const match = stmt.match(/^const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(.+)$/);
      if (match) {
        ctx.locals[match[1]] = this._evaluateValue(match[2], ctx);
      }
      return;
    }

    if (stmt.includes("=") && !stmt.includes("===")) {
      const assign = stmt.match(/^([A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*)\s*=\s*(.+)$/);
      if (assign) {
        this._assignPath(assign[1], this._evaluateValue(assign[2], ctx), ctx);
        return;
      }
    }

    this._executeCall(stmt, ctx);
  },

  _assignPath(path, value, ctx) {
    const parts = path.split(".");
    if (parts.length < 2) return;
    const prop = parts.pop();
    const root = safePathGet(parts.join("."), ctx);
    if (root && prop) {
      root[prop] = value;
    }
  },

  _evaluateCondition(raw, ctx) {
    const condition = String(raw || "").trim();
    if (condition === "event.target===this") {
      return Boolean(ctx.event && ctx.element && ctx.event.target === ctx.element);
    }
    if (condition === "!this.src.includes('mqdefault')") {
      return Boolean(ctx.element && !String(ctx.element.src || "").includes("mqdefault"));
    }
    return Boolean(this._evaluateValue(condition, ctx));
  },

  _evaluateValue(raw, ctx) {
    const token = String(raw || "").trim();
    if (!token) return "";
    if (token === "true") return true;
    if (token === "false") return false;
    if (token === "null") return null;
    if (token === "event") return ctx.event;
    if (token === "this") return ctx.element;
    if (/^-?\d+(\.\d+)?$/.test(token)) return Number(token);
    if (
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith('"') && token.endsWith('"'))
    ) {
      return parseQuotedString(token);
    }

    const plusParts = splitTopLevel(token, "+");
    if (plusParts.length > 1) {
      return plusParts
        .map((part) => this._evaluateValue(part, ctx))
        .join("");
    }

    const enc = token.match(/^encodeURIComponent\(([\s\S]+)\)$/);
    if (enc) {
      return encodeURIComponent(String(this._evaluateValue(enc[1], ctx)));
    }

    const value = safePathGet(token, ctx);
    if (value !== undefined) return value;
    return token;
  },

  _executeCall(raw, ctx) {
    const call = String(raw || "").trim();
    const match = call.match(/^([A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*)\(([\s\S]*)\)$/);
    if (!match) return;

    const fnPath = match[1];
    const argsRaw = match[2].trim();

    const allowedCallPrefixes = [
      "Router.navigate",
      "Router.back",
      "App.toggleDark",
      "App.logout",
      "App.startPredictor",
      "App.showUpgradeModal",
      "App.switchPlan",
      "AppState.syncFull",
      "SoundManager.play",
      "window.open",
      "window.openExamDatePicker",
      "window.location.reload",
      "handlePlanSelect",
      "event.stopPropagation",
      "document.dispatchEvent",
      "this.classList.toggle",
      "this.classList.remove"
    ];

    if (!allowedCallPrefixes.some((prefix) => fnPath === prefix || fnPath.startsWith(`${prefix}.`))) {
      return;
    }

    const argTokens = argsRaw ? splitTopLevel(argsRaw, ",") : [];
    const args = argTokens.map((token) => this._evaluateValue(token, ctx));

    if (fnPath === "window.location.reload") {
      window.location.reload();
      return;
    }

    if (fnPath === "document.dispatchEvent") {
      const eventExpr = argTokens[0] ? String(argTokens[0]).trim() : "";
      const customMatch = eventExpr.match(
        /^new\s+CustomEvent\(\s*(['"])([^'"]+)\1\s*,\s*\{\s*detail:\s*(['"])([\s\S]*?)\3\s*\}\s*\)$/
      );
      if (customMatch) {
        document.dispatchEvent(new CustomEvent(customMatch[2], { detail: customMatch[4] }));
        return;
      }
      const basicMatch = eventExpr.match(/^new\s+Event\(\s*(['"])([^'"]+)\1\s*\)$/);
      if (basicMatch) {
        document.dispatchEvent(new Event(basicMatch[2]));
      }
      return;
    }

    const fn = safePathGet(fnPath, ctx);
    if (typeof fn !== "function") return;

    const thisPath = fnPath.includes(".") ? fnPath.slice(0, fnPath.lastIndexOf(".")) : "";
    const thisArg = thisPath ? safePathGet(thisPath, ctx) : window;
    fn.apply(thisArg || window, args);
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
