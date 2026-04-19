// ============================================================
// EduHub Brasil - Client-Side Router
// Hash-based SPA with tab caching, slide animations, back stack
// ============================================================

const Router = {
  routes: {},
  currentPage: null,
  currentPageName: null,
  history: [],
  _isBack: false,
  _animating: false,

  // Main tab routes that preserve state (DOM cached)
  TAB_ROUTES: new Set(["/home", "/simulados", "/pomodoro", "/videos", "/progresso"]),

  // Cached scroll positions per tab
  _scrollCache: {},

  // Track which tabs have been rendered
  _renderedTabs: new Set(),

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(path, pushHistory = true, force = false) {
    if (this._animating && !force) {
      console.warn("Router: Navigation blocked (animating)");
      return;
    }
    const cleanPath = path.split("?")[0];
    if (cleanPath === this.currentPage && !force) return;

    const isTabSwitch = this.TAB_ROUTES.has(path) && this.TAB_ROUTES.has(this.currentPage);
    if (pushHistory && this.currentPage && !isTabSwitch) {
      this.history.push(this.currentPage);
    }
    this._isBack = false;

    // If already on the hash, hash change won't fire, so trigger manually if forced
    if (window.location.hash === "#" + path && force) {
      this._handleRoute();
    } else {
      window.location.hash = path;
    }
  },

  back(fallback = null) {
    if (this._animating) return;
    this._isBack = true;
    if (this.history.length > 0) {
      const prev = this.history.pop();
      window.location.hash = prev;
    } else if (fallback && typeof fallback === "string") {
      window.location.hash = fallback;
    } else if (this.currentPage !== "/home") {
      window.location.hash = "/home";
    }
  },

  _handleRoute() {
    this._animating = false; // Emergency reset on hash change
    const hash = window.location.hash.slice(1) || "/home";
    const path = hash.split("?")[0];
    const params = {};

    const onboardingRoutes = new Set(["/onboarding", "/onboarding-loading"]);
    const canForceOnboarding =
      typeof App !== "undefined" &&
      App &&
      App._hasSession &&
      typeof App.needsOnboarding === "function";

    // Hard guard: authenticated users with incomplete profile cannot enter app tabs/home.
    if (canForceOnboarding && App.needsOnboarding() && !onboardingRoutes.has(path)) {
      this.navigate("/onboarding", false, true);
      return;
    }

    // Parse query params from hash
    const queryStr = hash.split("?")[1];
    if (queryStr) {
      queryStr.split("&").forEach(p => {
        const [k, v] = p.split("=");
        params[k] = decodeURIComponent(v);
      });
    }

    // Try exact match first
    if (this.routes[path]) {
      this._transition(path, params);
      return;
    }

    // Try pattern match (e.g., /materia/:id)
    for (const route of Object.keys(this.routes)) {
      if (route.includes(":")) {
        const routeParts = route.split("/");
        const pathParts = path.split("/");
        if (routeParts.length === pathParts.length) {
          let match = true;
          const routeParams = {};
          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(":")) {
              routeParams[routeParts[i].slice(1)] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            Object.assign(params, routeParams);
            this._transition(route, params);
            return;
          }
        }
      }
    }

    // Fallback to home
    this._isBack = false;
    this.navigate("/home", false);
  },

  _getPageName(routeKey) {
    // Extract page name from route key (e.g., "/home" -> "home", "/materia/:id" -> "materia")
    return routeKey.replace("/", "").split("/")[0].split(":")[0];
  },

  _transition(routeKey, params) {
    const container = document.getElementById("app-pages");
    const newPageName = this._getPageName(routeKey);
    const fullPath = window.location.hash.slice(1) || "/home";
    const isTab = this.TAB_ROUTES.has("/" + newPageName);
    const prevPage = this.currentPage;
    const prevPageName = this.currentPageName;
    const wasTab = prevPageName ? this.TAB_ROUTES.has("/" + prevPageName) : false;
    const isTabSwitch = isTab && wasTab;

    // Save scroll position of previous page if it was a tab
    if (prevPageName && this.TAB_ROUTES.has("/" + prevPageName)) {
      const prevEl = document.getElementById("page-" + prevPageName);
      if (prevEl) {
        const scrollArea = prevEl.querySelector("main.scroll-area");
        if (scrollArea) {
          this._scrollCache[prevPageName] = scrollArea.scrollTop;
        }
      }
    }

    // Get or create the page element
    let page = document.getElementById("page-" + newPageName);
    const alreadyRendered = isTab && this._renderedTabs.has(newPageName);

    if (!page) {
      page = document.createElement("div");
      page.id = "page-" + newPageName;
      page.className = "page";
      container.appendChild(page);
    }

    // Render content if needed
    if (!alreadyRendered) {
      // Call the App.showPage which handles rendering and events
      this.currentPage = fullPath;
      this.currentPageName = newPageName;
      this.routes[routeKey](params);

      if (isTab) {
        this._renderedTabs.add(newPageName);
      }
    } else {
      // Tab is already rendered, just show it
      this.currentPage = fullPath;
      this.currentPageName = newPageName;
    }

    // Animate transition
    const prevEl = prevPageName ? document.getElementById("page-" + prevPageName) : null;

    if (prevEl && prevPageName !== newPageName) {
      this._animating = true;

      // Determine animation type
      if (isTabSwitch) {
        // Tab switch: use fade
        prevEl.classList.add("page-fade-out");
        page.classList.remove("page-hidden");
        page.classList.add("page-active", "page-fade-in");

        setTimeout(() => {
          prevEl.classList.remove("page-active", "page-fade-out");
          prevEl.classList.add("page-hidden");
          page.classList.remove("page-fade-in");
          this._animating = false;
          this._cleanupAnimClasses(prevEl);
        }, 200);
      } else if (this._isBack) {
        // Going back: slide from left
        page.classList.remove("page-hidden");
        page.classList.add("page-active", "page-slide-in-left");
        prevEl.classList.add("page-slide-out-right");

        setTimeout(() => {
          prevEl.classList.remove("page-active", "page-slide-out-right");
          prevEl.classList.add("page-hidden");
          page.classList.remove("page-slide-in-left");
          this._animating = false;
          this._cleanupAnimClasses(prevEl);
        }, 250);
      } else {
        // Going forward: slide from right
        page.classList.remove("page-hidden");
        page.classList.add("page-active", "page-slide-in-right");
        prevEl.classList.add("page-slide-out-left");

        setTimeout(() => {
          prevEl.classList.remove("page-active", "page-slide-out-left");
          prevEl.classList.add("page-hidden");
          
          // CRITICAL: Clean up non-tab content to prevent "Ghost DOM" interaction
          if (!wasTab) {
            prevEl.innerHTML = "";
          }
          
          this._animating = false;
          this._cleanupAnimClasses(prevEl);
        }, 250);
      }
    } else if (!prevEl) {
      // First load, no animation
      container.querySelectorAll(".page").forEach(p => {
        if (p !== page) {
          p.classList.remove("page-active");
          p.classList.add("page-hidden");
        }
      });
      page.classList.remove("page-hidden");
      page.classList.add("page-active");
    }

    // Safety check: ensure at least the current page is visible if animations were skipped or failed
    if (page.classList.contains("page-hidden")) {
      page.classList.remove("page-hidden");
      page.classList.add("page-active");
    }

    // Show the target page
    if (!prevEl || prevPageName === newPageName) {
      container.querySelectorAll(".page").forEach(p => {
        if (p !== page) {
          p.classList.remove("page-active");
          p.classList.add("page-hidden");
        }
      });
      page.classList.remove("page-hidden");
      page.classList.add("page-active");
    }

    // Restore scroll position for cached tabs
    if (alreadyRendered && this._scrollCache[newPageName] !== undefined) {
      requestAnimationFrame(() => {
        const scrollArea = page.querySelector("main.scroll-area");
        if (scrollArea) {
          scrollArea.scrollTop = this._scrollCache[newPageName];
        }
      });
    } else if (!isTab) {
      // Non-tab pages scroll to top
      requestAnimationFrame(() => {
        const scrollArea = page.querySelector("main.scroll-area");
        if (scrollArea) scrollArea.scrollTop = 0;
      });
    }

    // Update bottom nav active state
    this._updateNav("/" + newPageName);
    this._isBack = false;
  },

  _cleanupAnimClasses(el) {
    el.classList.remove(
      "page-slide-in-right", "page-slide-out-left",
      "page-slide-in-left", "page-slide-out-right",
      "page-fade-in", "page-fade-out"
    );
  },

  _updateNav(path) {
    const nav = document.getElementById("bottom-nav");
    if (nav) {
      // IA Tutor and other full-screen pages should hide the nav
      const hideNavPages = ["/onboarding", "/login", "/cadastro", "/ia-tutor", "/onboarding-loading", "/simulado", "/simulado-runner", "/quiz-builder", "/video", "/materia", "/resultados", "/flashcards", "/redacao-ai", "/ranking"];
      const shouldHide = hideNavPages.some(p => path === p || path.startsWith(p + "/"));
      
      if (shouldHide) {
        nav.classList.add("hidden");
        nav.style.display = "none";
      } else {
        nav.classList.remove("hidden");
        nav.style.display = "";
      }
    }

    const navItems = document.querySelectorAll("#bottom-nav a");
    navItems.forEach(item => {
      const href = item.getAttribute("data-route");
      const icon = item.querySelector(".material-symbols-outlined");
      const label = item.querySelector("span:last-child");
      const isActive = href === path || (path.startsWith(href) && href !== "/home");

      if (isActive) {
        item.className = "flex flex-col items-center gap-0.5 text-emerald-500 transition-colors cursor-pointer nav-active";
        if (icon) icon.style.fontVariationSettings = "'FILL' 1";
        if (label) label.className = "text-[10px] font-bold";
      } else {
        item.className = "flex flex-col items-center gap-0.5 text-slate-400 hover:text-primary transition-colors cursor-pointer";
        if (icon) icon.style.fontVariationSettings = "'FILL' 0";
        if (label) label.className = "text-[10px] font-medium";
      }
    });
  },

  // Invalidate a tab cache (force re-render next time)
  invalidateTab(pageName) {
    this._renderedTabs.delete(pageName);
    this._scrollCache[pageName] = undefined;
    const el = document.getElementById("page-" + pageName);
    if (el && this.currentPageName !== pageName) {
      el.remove();
    }
  },

  init() {
    window.addEventListener("hashchange", () => this._handleRoute());

    // Handle Android back button (Cordova/Capacitor)
    document.addEventListener("backbutton", (e) => {
      e.preventDefault();
      this.back();
    });

    // Handle browser back/forward buttons
    window.addEventListener("popstate", (e) => {
      // The hashchange event will handle the actual navigation
      // We just set the back flag
      if (this.history.length > 0) {
        this._isBack = true;
      }
    });

    // Initial route
    this._handleRoute();
  }
};
