import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatCents, MONTHS, monthKey } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Category, Entry, Scope } from "@/lib/types";

type Mode = "despesas" | "receitas";

interface Slice {
  categoryId: string;
  name: string;
  color: string;
  value: number;
}

export function DonutChart({
  entries,
  categories,
  month,
  scopeFilter,
}: {
  entries: Entry[];
  categories: Category[];
  month: string;
  scopeFilter: Scope[];
}) {
  const [mode, setMode] = useState<Mode>("despesas");
  const [selected, setSelected] = useState<string | null>(null);

  const data = useMemo<Slice[]>(() => {
    const wantExpense = mode === "despesas";
    const sums = new Map<string, number>();
    for (const e of entries) {
      if (e.type !== (wantExpense ? "expense" : "income")) continue;
      if (monthKey(e.date) !== month) continue;
      if (scopeFilter.length && !scopeFilter.includes(e.scope)) continue;
      sums.set(e.categoryId, (sums.get(e.categoryId) ?? 0) + e.amount);
    }
    return [...sums.entries()]
      .map(([id, value]) => {
        const c = categories.find((cat) => cat.id === id);
        return {
          categoryId: id,
          name: c?.name ?? "Sem categoria",
          color: c?.color ?? "#34d399",
          value,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [entries, categories, month, scopeFilter, mode]);

  const total = useMemo(() => data.reduce((acc, s) => acc + s.value, 0), [data]);
  const isExpense = mode === "despesas";
  const selectedSlice = selected ? (data.find((s) => s.categoryId === selected) ?? null) : null;

  const pct = (value: number) => {
    if (!total) return "0%";
    return (value / total).toLocaleString("pt-BR", {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
  };

  const toggleSlice = (id: string) => setSelected((prev) => (prev === id ? null : id));

  const switchMode = (next: Mode) => {
    setMode(next);
    setSelected(null);
  };

  const monthLabel = `${MONTHS[Number(month.slice(5, 7)) - 1] ?? ""} de ${month.slice(0, 4)}`;

  return (
    <section className="surface mt-5 rounded-3xl p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold">Distribuição por categoria</h2>
          <p className="text-xs text-muted-foreground">{monthLabel}</p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-1 rounded-2xl border border-border bg-secondary/40 p-1">
          <button
            onClick={() => switchMode("despesas")}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-all duration-200",
              isExpense
                ? "bg-destructive/15 text-destructive"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ArrowDownRight className="size-4" />
            Despesas
          </button>
          <button
            onClick={() => switchMode("receitas")}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-all duration-200",
              !isExpense
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ArrowUpRight className="size-4" />
            Receitas
          </button>
        </div>
      </header>

      {data.length === 0 ? (
        <div className="mx-auto mt-4 flex h-56 max-w-72 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-secondary/30 px-6 text-center">
          <p className="text-sm font-medium text-foreground">
            {isExpense ? "Sem despesas" : "Sem receitas"} no período
          </p>
          <p className="text-xs text-muted-foreground">
            Cadastre lançamentos ou ajuste o mês e os filtros.
          </p>
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-4 h-56 w-full max-w-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={74}
                  outerRadius={104}
                  paddingAngle={2}
                  cornerRadius={8}
                  strokeWidth={0}
                  animationDuration={700}
                  animationEasing="ease-out"
                  onClick={(_entry, index) => {
                    const slice = data[index];
                    if (slice) toggleSlice(slice.categoryId);
                  }}
                >
                  {data.map((s) => (
                    <Cell
                      key={s.categoryId}
                      fill={s.color}
                      fillOpacity={!selected || selected === s.categoryId ? 1 : 0.22}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <p
                className={cn(
                  "font-display text-2xl font-bold tabular-nums",
                  isExpense ? "text-destructive" : "text-primary",
                )}
              >
                {formatCents(total)}
              </p>
              <p className="text-xs text-muted-foreground">
                {isExpense ? "Total de despesas" : "Total de receitas"}
              </p>
            </div>
          </div>

          {selectedSlice && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: selectedSlice.color }}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {selectedSlice.name}
              </span>
              <span
                className={cn(
                  "font-display text-sm font-semibold tabular-nums",
                  isExpense ? "text-destructive" : "text-primary",
                )}
              >
                {formatCents(selectedSlice.value)}
              </span>
              <span
                className={cn(
                  "text-sm tabular-nums",
                  isExpense ? "text-destructive" : "text-primary",
                )}
              >
                {pct(selectedSlice.value)}
              </span>
            </div>
          )}

          <div className="mt-4 space-y-1">
            {data.map((s) => (
              <button
                key={s.categoryId}
                onClick={() => toggleSlice(s.categoryId)}
                className={cn(
                  "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors duration-200",
                  selected === s.categoryId ? "bg-secondary" : "hover:bg-secondary/50",
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="truncate text-sm">{s.name}</span>
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-display text-sm font-semibold tabular-nums",
                      isExpense ? "text-destructive" : "text-primary",
                    )}
                  >
                    {formatCents(s.value)}
                  </span>
                  <span className="min-w-14 text-right text-xs text-muted-foreground tabular-nums">
                    {pct(s.value)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
