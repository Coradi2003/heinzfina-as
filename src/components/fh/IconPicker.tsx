import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { ICONS, suggestIcon } from "@/lib/icons";
import { Search, Sparkles, Tag } from "lucide-react";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  name?: string;
}

/** Seletor visual de ícones com busca e sugestão automática pelo nome. */
export function IconPicker({ value, onChange, name }: IconPickerProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(false);
  const suggested = useMemo(() => (name ? suggestIcon(name) : "Tag"), [name]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (gridRef.current && !gridRef.current.contains(e.target as Node)) {
        setActive(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICONS;
    return ICONS.filter((i) => i.name.toLowerCase().includes(q));
  }, [query]);

  const pick = (icon: string) => {
    onChange(icon);
    setActive(false);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setActive((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-left transition-colors hover:bg-secondary/70"
      >
        <span className="flex items-center gap-2.5 text-sm">
          <span className="grid size-8 place-items-center rounded-xl bg-background text-foreground">
            <SelectedIcon name={value} />
          </span>
          {value || "Ícone"}
        </span>
        <span className="text-xs text-muted-foreground">Trocar</span>
      </button>

      {name && suggested && (
        <button
          type="button"
          onClick={() => pick(suggested)}
          className="flex w-full items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary transition-colors hover:bg-primary/20"
        >
          <Sparkles className="size-3.5" />
          Sugerido: <SelectedIconSmall name={suggested} /> {suggested}
        </button>
      )}

      {active && (
        <div ref={gridRef} className="rounded-2xl border border-border bg-background p-3 shadow-lg">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 rounded-xl pl-9"
              placeholder="Buscar ícone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto sm:grid-cols-10">
            {filtered.map((i) => {
              const Icon = i.Icon;
              const selected = i.name === value;
              return (
                <button
                  key={i.name}
                  type="button"
                  title={i.name}
                  onClick={() => pick(i.name)}
                  className={`grid aspect-square place-items-center rounded-lg transition-colors ${
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="py-3 text-center text-xs text-muted-foreground">
              Nenhum ícone encontrado
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function SelectedIcon({ name }: { name: string | null | undefined }) {
  const Icon = selectedIcon(name);
  return <Icon className="size-4" />;
}

export function SelectedIconSmall({ name }: { name: string | null | undefined }) {
  const Icon = selectedIcon(name);
  return <Icon className="size-3.5" />;
}

function selectedIcon(name?: string | null) {
  const found = ICONS.find((i) => i.name === name);
  return found?.Icon ?? Tag;
}
