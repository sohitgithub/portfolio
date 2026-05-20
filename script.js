const glow1 = document.querySelector(".glow1");
const glow2 = document.querySelector(".glow2");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");
const navBackdrop = document.querySelector("#nav-backdrop");
const yearEl = document.querySelector("#year");
const contactForm = document.querySelector("#contact-form");
const contactToast = document.querySelector("#contact-toast");

if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Scroll reveal
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
if (!prefersReducedMotion) {
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  for (const el of revealEls) io.observe(el);
} else {
  document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("reveal-in"));
}

function setNavOpen(open) {
  if (!siteNav || !navToggle) return;
  siteNav.classList.toggle("open", open);
  navToggle.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("nav-open", open);
  if (navBackdrop) {
    navBackdrop.classList.toggle("is-visible", open);
    navBackdrop.hidden = !open;
    navBackdrop.setAttribute("aria-hidden", String(!open));
  }
}

// Mobile menu
if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    setNavOpen(!siteNav.classList.contains("open"));
  });

  if (navBackdrop) {
    navBackdrop.addEventListener("click", () => setNavOpen(false));
  }

  siteNav.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement && siteNav.classList.contains("open")) {
      setNavOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && siteNav.classList.contains("open")) {
      setNavOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820 && siteNav.classList.contains("open")) {
      setNavOpen(false);
    }
  });
}

// Active nav state
const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
const sectionIds = navLinks
  .map((a) => a.getAttribute("href"))
  .filter(Boolean)
  .map((h) => h.slice(1))
  .filter((id) => id && document.getElementById(id));

function setActiveLink(id) {
  for (const a of navLinks) {
    const target = a.getAttribute("href")?.slice(1);
    a.classList.toggle("active", target === id);
  }
}

if (sectionIds.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const top = visible[0];
      if (top?.target?.id) setActiveLink(top.target.id);
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: [0.1, 0.2, 0.35, 0.5] }
  );
  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  }
}

function showContactToast(message, variant = "success") {
  if (!contactToast) return;
  const msgEl = contactToast.querySelector(".toast-message");
  if (msgEl) msgEl.textContent = message;

  window.clearTimeout(showContactToast._hide);
  window.clearTimeout(showContactToast._hideHidden);

  contactToast.classList.remove("toast--success", "toast--error");
  contactToast.classList.add(variant === "error" ? "toast--error" : "toast--success");

  contactToast.setAttribute("role", variant === "error" ? "alert" : "status");
  contactToast.setAttribute("aria-live", variant === "error" ? "assertive" : "polite");

  contactToast.removeAttribute("hidden");
  contactToast.classList.add("show");
  showContactToast._hide = window.setTimeout(() => {
    contactToast.classList.remove("show");
    showContactToast._hideHidden = window.setTimeout(() => contactToast.setAttribute("hidden", ""), 320);
  }, 4500);
}

// Contact form → Formspree (JSON response, no redirect)
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const endpoint = contactForm.getAttribute("action");
    if (!endpoint) return;

    if (submitBtn) submitBtn.disabled = true;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });
      const data = res.ok ? null : await res.json().catch(() => null);
      if (res.ok) {
        showContactToast("Thanks! Your message was sent.");
        contactForm.reset();
      } else {
        const errMsg =
          data && typeof data.error === "string"
            ? data.error
            : "Could not send your message. Please try again.";
        showContactToast(errMsg, "error");
      }
    } catch {
      showContactToast("Network error. Please try again.", "error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Glows follow pointer (reduced motion friendly)
if (glow1 && glow2 && !prefersReducedMotion) {
  const heroEl = document.querySelector(".hero");
  let mouseX = window.innerWidth * 0.35;
  let mouseY = window.innerHeight * 0.4;
  let posX1 = mouseX;
  let posY1 = mouseY;
  let posX2 = mouseX;
  let posY2 = mouseY;

  function centerGlowOnHero() {
    if (!heroEl) return;
    const rect = heroEl.getBoundingClientRect();
    mouseX = rect.left + rect.width * 0.5;
    mouseY = rect.top + rect.height * 0.38;
    posX1 = mouseX;
    posY1 = mouseY;
    posX2 = mouseX;
    posY2 = mouseY;
  }

  centerGlowOnHero();
  window.addEventListener("resize", centerGlowOnHero);

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      if (t) {
        mouseX = t.clientX;
        mouseY = t.clientY;
      }
    },
    { passive: true }
  );

  function animate() {
    posX1 += (mouseX - posX1) * 0.05;
    posY1 += (mouseY - posY1) * 0.05;

    posX2 += (mouseX - posX2) * 0.02;
    posY2 += (mouseY - posY2) * 0.02;

    glow1.style.transform = `translate(${posX1}px, ${posY1}px)`;
    glow2.style.transform = `translate(${posX2}px, ${posY2}px)`;

    requestAnimationFrame(animate);
  }

  animate();
}