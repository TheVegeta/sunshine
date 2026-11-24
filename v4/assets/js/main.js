/* Sunshine Jewellery — shared interactions
   Every block is opt-in: a page initialises only the markup it contains.
   Native <dialog>, <details> and radio groups carry the accessibility. */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  const menuToggle = $(".menu-toggle");
  const mobileNav = $("[data-mobile-nav]");
  if (menuToggle && mobileNav) {
    const setMenu = (open) => {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileNav.hidden = !open;
      // The panel carries Tailwind's `hidden` class as well as the hidden
      // attribute; both have to change or it never becomes visible.
      mobileNav.classList.toggle("hidden", !open);
    };
    menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
    $$("a", mobileNav).forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuToggle.focus();
      }
    });
    const desktop = window.matchMedia("(min-width: 1024px)");
    const resetOnDesktop = (event) => { if (event.matches) setMenu(false); };
    if (typeof desktop.addEventListener === "function") desktop.addEventListener("change", resetOnDesktop);
    else desktop.addListener(resetOnDesktop);
  }

  /* ---------- Dialog helpers ---------- */
  // Lock scrolling only while at least one dialog is actually open, so a
  // closing dialog cannot unlock the page underneath a newly opened one.
  const dialogTimers = new WeakMap();
  const syncDialogLock = () => {
    document.body.classList.toggle("dialog-open", $$("dialog[open]").length > 0);
  };

  const openDialog = (dialog) => {
    if (!dialog) return;
    window.clearTimeout(dialogTimers.get(dialog));
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    requestAnimationFrame(() => dialog.classList.add("is-open"));
    syncDialogLock();
  };

  const closeDialog = (dialog) => {
    if (!dialog) return;
    dialog.classList.remove("is-open");
    window.clearTimeout(dialogTimers.get(dialog));
    const timer = window.setTimeout(
      () => {
        if (!dialog.classList.contains("is-open") && dialog.open) dialog.close();
        syncDialogLock();
      },
      reduced ? 0 : 360
    );
    dialogTimers.set(dialog, timer);
  };

  $$("[data-open-dialog]").forEach((button) => {
    button.addEventListener("click", () => openDialog(document.getElementById(button.dataset.openDialog)));
  });
  // The bag trigger carries aria-controls but no data attribute; wire it here.
  $$(".bag-trigger").forEach((button) => {
    button.addEventListener("click", () =>
      openDialog(document.getElementById(button.dataset.openDialog || "bag-drawer"))
    );
  });
  $$("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(button.closest("dialog")));
  });
  $$("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog); // click on the backdrop
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog(dialog);
    });
  });

  /* ---------- Shopping bag (persisted locally) ---------- */
  const BAG_KEY = "sunshine-bag-v1";
  const bagCount = $("[data-bag-count]");
  const bagItems = $("[data-bag-items]");
  const bagTotal = $("[data-bag-total]");
  const bagEmpty = $("[data-bag-empty]");
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

  // Storage can hold stale or hand-edited data; only keep well-formed lines.
  const readBag = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(BAG_KEY) || "[]");
      if (!Array.isArray(stored)) return [];
      return stored
        .filter((item) => item && item.name && item.image && Number.isFinite(Number(item.qty)))
        .map((item) => ({
          id: String(item.id || item.name),
          name: String(item.name),
          image: String(item.image),
          detail: String(item.detail || "One size"),
          qty: Math.max(1, Math.trunc(Number(item.qty))),
        }));
    } catch (_) {
      return [];
    }
  };
  let bag = readBag();

  const renderBag = () => {
    const count = bag.reduce((sum, item) => sum + item.qty, 0);
    if (bagCount) {
      bagCount.textContent = String(count);
      const trigger = $(".bag-trigger");
      if (trigger) trigger.setAttribute("aria-label", `Open shopping bag, ${count} ${count === 1 ? "item" : "items"}`);
    }
    if (!bagItems) return;

    bagItems.innerHTML = bag
      .map(
        (item, index) => `
      <li class="flex gap-4 border-b border-sand py-5">
        <img src="${esc(item.image)}" alt="${esc(item.name)}" class="arched h-24 w-20 object-cover" loading="lazy">
        <div class="min-w-0 flex-1">
          <p class="font-display text-xl leading-tight">${esc(item.name)}</p>
          <p class="mt-1 text-xs text-[#6b645c]">${esc(item.detail)}</p>
          <div class="mt-3 flex items-center gap-3 text-xs">
            <button type="button" data-qty="-1" data-index="${index}" aria-label="Decrease quantity of ${esc(item.name)}" class="border border-sand px-2 py-1">&#8722;</button>
            <span>${item.qty}</span>
            <button type="button" data-qty="1" data-index="${index}" aria-label="Increase quantity of ${esc(item.name)}" class="border border-sand px-2 py-1">+</button>
            <button type="button" data-remove="${index}" class="ml-auto underline underline-offset-4">Remove</button>
          </div>
        </div>
      </li>`
      )
      .join("");

    if (bagEmpty) bagEmpty.hidden = bag.length > 0;
    if (bagTotal) bagTotal.textContent = "On request"; // no client price list supplied
  };

  const writeBag = () => {
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(bag));
    } catch (_) {
      /* storage unavailable */
    }
    renderBag();
  };

  renderBag();

  document.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add-bag]");
    if (add) {
      const scope = add.closest("form") || document;
      const metal = add.dataset.metal || $('input[name="metal"]:checked', scope)?.value || "18k Yellow Gold";
      const size = add.dataset.size || $('input[name="size"]:checked', scope)?.value || "One size";
      const item = {
        id: add.dataset.id || add.dataset.name,
        name: add.dataset.name,
        image: add.dataset.image,
        detail: `${metal} · ${size}`,
        qty: 1,
      };
      const existing = bag.find((entry) => entry.id === item.id && entry.detail === item.detail);
      if (existing) existing.qty += 1;
      else bag.push(item);
      writeBag();
      // If the add came from quick view, dismiss it before showing the bag.
      const sourceDialog = add.closest("dialog");
      if (sourceDialog && sourceDialog.id !== "bag-drawer") {
        window.clearTimeout(dialogTimers.get(sourceDialog));
        sourceDialog.classList.remove("is-open");
        if (sourceDialog.open) sourceDialog.close();
      }
      openDialog($("#bag-drawer"));
      return;
    }

    const remove = event.target.closest("[data-remove]");
    if (remove) {
      bag.splice(Number(remove.dataset.remove), 1);
      writeBag();
      return;
    }

    const qty = event.target.closest("[data-qty]");
    if (qty) {
      const item = bag[Number(qty.dataset.index)];
      if (item) {
        item.qty = Math.max(1, Number(item.qty) + Number(qty.dataset.qty));
        writeBag();
      }
    }
  });

  /* ---------- Pointer parallax on the hero frame only ---------- */
  if (!reduced) {
    $$("[data-parallax]").forEach((frame) => {
      frame.addEventListener("pointermove", (event) => {
        const rect = frame.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;
        frame.style.setProperty("--px", `${x.toFixed(1)}px`);
        frame.style.setProperty("--py", `${y.toFixed(1)}px`);
      });
      frame.addEventListener("pointerleave", () => {
        frame.style.setProperty("--px", "0px");
        frame.style.setProperty("--py", "0px");
      });
    });
  }

  /* ---------- Collection filters ---------- */
  const filters = $$("[data-filter]");
  if (filters.length) {
    const cards = $$("[data-product-card]");
    const resultCount = $("[data-result-count]");
    filters.forEach((pill) =>
      pill.addEventListener("click", () => {
        const filter = pill.dataset.filter;
        let shown = 0;
        filters.forEach((other) => other.setAttribute("aria-pressed", String(other === pill)));
        cards.forEach((card) => {
          const visible = filter === "all" || card.dataset.category === filter;
          card.hidden = !visible;
          if (visible) shown += 1;
        });
        if (resultCount) resultCount.textContent = `Showing ${shown} ${shown === 1 ? "piece" : "pieces"}`;
      })
    );
  }

  /* ---------- Quick view ---------- */
  const quickView = $("#quick-view");
  if (quickView) {
    $$("[data-quick-view]").forEach((button) =>
      button.addEventListener("click", () => {
        const card = button.closest("[data-product-card]");
        if (!card) return;
        $("[data-qv-name]").textContent = card.dataset.name;
        $("[data-qv-price]").textContent = card.dataset.price || "Price on request";
        $("[data-qv-desc]").textContent = card.dataset.desc || "";
        const image = $("[data-qv-image]");
        image.src = card.dataset.image;
        image.alt = card.dataset.name;
        const add = $("[data-qv-add]");
        add.dataset.id = card.dataset.id;
        add.dataset.name = card.dataset.name;
        add.dataset.image = card.dataset.image;
        openDialog(quickView);
      })
    );
  }

  /* ---------- Product gallery and metal preview ---------- */
  const mainImage = $("[data-main-image]");
  if (mainImage) {
    $$("[data-thumb]").forEach((thumb) =>
      thumb.addEventListener("click", () => {
        mainImage.src = thumb.dataset.thumb;
        mainImage.alt = thumb.dataset.alt || mainImage.alt;
        $$("[data-thumb]").forEach((other) => other.setAttribute("aria-pressed", String(other === thumb)));
      })
    );
    $$('input[name="metal"]').forEach((radio) =>
      radio.addEventListener("change", () => {
        if (!radio.checked || !radio.dataset.image) return;
        mainImage.src = radio.dataset.image;
        mainImage.alt = `${radio.value} Solstice ring`;
        const label = $("[data-metal-label]");
        if (label) label.textContent = radio.value;
      })
    );
  }

  /* ---------- Validation with inline, per-field errors ---------- */
  $$("form[data-validate]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;
      let firstInvalid = null;

      $$("[data-field]", form).forEach((wrapper) => {
        const input = $("input, select, textarea", wrapper);
        const error = $(".field__error", wrapper);
        let message = "";
        if (input.required && !input.value.trim())
          message = input.dataset.requiredMessage || "Please complete this field.";
        else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value))
          message = "Write an email address with an @, like name@example.com.";

        input.setAttribute("aria-invalid", message ? "true" : "false");
        if (error) {
          error.textContent = message;
          error.hidden = !message;
        }
        if (message) {
          valid = false;
          firstInvalid = firstInvalid || input;
        }
      });

      if (!valid) {
        firstInvalid.focus();
        return;
      }

      const status = $("[data-form-status]", form);
      if (form.action.startsWith("mailto:")) {
        const body = $$("[data-field]", form)
          .map((wrapper) => {
            const input = $("input, select, textarea", wrapper);
            const label = $("label", wrapper);
            return `${label ? label.textContent.trim() : input.name}: ${input.value}`;
          })
          .join("\n");
        const subject = encodeURIComponent(form.dataset.subject || "Sunshine Jewellery enquiry");
        window.location.href = `${form.action}?subject=${subject}&body=${encodeURIComponent(body)}`;
        if (status) status.textContent = "Your email app is opening with the request.";
      } else if (status) {
        status.textContent = "Your request is in. We reply within one working day.";
      }
      form.reset();
    });
  });
})();

// Footer year, matching the other layouts.
const yearTarget = document.querySelector("[data-year]");
if (yearTarget) yearTarget.textContent = String(new Date().getFullYear());
