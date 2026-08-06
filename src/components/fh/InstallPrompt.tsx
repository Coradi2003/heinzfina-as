import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}
const DISMISSED_KEY = "fh:install-prompt-dismissed-at";
const DISMISS_DAYS = 7;

function isAndroid() {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}

function isInstalled() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function wasRecentlyDismissed() {
  const value = localStorage.getItem(DISMISSED_KEY);
  if (!value) return false;
  const elapsed = Date.now() - Number(value);
  return Number.isFinite(elapsed) && elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAndroid() || isInstalled() || wasRecentlyDismissed()) return;

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const handleInstalled = () => {
      setVisible(false);
      setInstallEvent(null);
      localStorage.removeItem(DISMISSED_KEY);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    setVisible(false);
    if (choice.outcome === "dismissed") {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }
  };

  if (!visible || !installEvent) return null;

  return (
    <aside className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[100] mx-auto max-w-md animate-in slide-in-from-bottom-6 fade-in duration-300">
      <div className="rounded-3xl border border-primary/25 bg-background/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Smartphone className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-bold">Instale o Família Heinz</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Acesse suas finanças rapidamente direto pela tela inicial do celular.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="grid size-8 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Agora não"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-[1fr_1.4fr] gap-2">
          <Button variant="secondary" className="rounded-2xl" onClick={dismiss}>
            Agora não
          </Button>
          <Button className="rounded-2xl" onClick={() => void install()}>
            <Download className="size-4" /> Instalar agora
          </Button>
        </div>
      </div>
    </aside>
  );
}
