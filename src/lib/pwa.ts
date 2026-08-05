/**
 * Registro do service worker com guardas: nunca registra em dev,
 * dentro de iframe, nos previews da Lovable ou com ?sw=off.
 */
const BLOCKED_SUFFIXES = [
  ".lovableproject.com",
  ".lovableproject-dev.com",
  ".beta.lovable.dev",
];
const BLOCKED_HOSTS = [
  "lovableproject.com",
  "lovableproject-dev.com",
  "beta.lovable.dev",
];

function shouldRegister(): boolean {
  if (typeof window === "undefined") return false;
  if (!import.meta.env.PROD) return false;
  if (window.self !== window.top) return false;
  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return false;
  if (BLOCKED_HOSTS.includes(host)) return false;
  if (BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) return false;
  if (new URLSearchParams(window.location.search).has("sw")) return false;
  return true;
}

async function unregisterAppWorker() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => (r.active?.scriptURL ?? "").endsWith("/sw.js"))
      .map((r) => r.unregister()),
  );
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (!shouldRegister()) {
    void unregisterAppWorker();
    return;
  }
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js", { scope: "/" });
  });
}
