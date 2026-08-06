import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Minus,
  PiggyBank,
  Plus,
  Sparkles,
  Tags,
  User,
  Wallet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCents, formatDate, MONTHS, monthKey } from "@/lib/money";
import { globalTotals, scopeTotals, useStore } from "@/lib/store";
import { annualReportPdf, monthlyReportPdf } from "@/lib/pdf";
import type { Category, Entry, Scope } from "@/lib/types";
import {
  CategoriesDialog,
  DetailDialog,
  EditEntryDialog,
  ExpenseDialog,
  IncomeDialog,
  PaidConfirmation,
  PartialPaymentDialog,
  ReportDialog,
  ReserveDepositDialog,
  ReserveWithdrawDialog,
} from "./dialogs";
import { DonutChart } from "./DonutChart";
import { SelectedIcon, SelectedIconSmall } from "./IconPicker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type StatusFilter = "pago" | "apagar";

function Bubble({
  label,
  value,
  icon,
  tone = "default",
  children,
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "default" | "positive" | "negative";
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "surface relative flex flex-col justify-between rounded-3xl p-4 transition-transform duration-300 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-secondary/70 text-primary">
          {icon}
        </span>
        <span className="min-w-0 truncate text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-3 font-display text-xl font-bold tracking-tight tabular-nums sm:text-2xl",
          tone === "positive" && "text-primary",
          tone === "negative" && "text-destructive",
        )}
      >
        {value}
      </p>
      {children}
    </div>
  );
}

function Indicator({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-secondary/50 px-1.5 py-3 sm:px-3">
      <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[11px]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 whitespace-nowrap font-display text-xs font-semibold tabular-nums sm:text-base",
          tone === "positive" && "text-primary",
          tone === "negative" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "border-primary/50 bg-primary/15 text-primary glow"
          : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Menu da linha da tabela que só abre com duplo toque (evita abrir sem querer
 * ao rolar a página). O primeiro toque apenas "prepara"; o segundo, em até
 * 350ms, abre o menu.
 */
function RowMenu({ trigger, content }: { trigger: ReactNode; content: ReactNode }) {
  const [open, setOpen] = useState(false);
  const lastTap = useRef(0);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-end gap-2 sm:col-span-3 sm:grid sm:grid-cols-3"
          onPointerDown={(e) => e.preventDefault()}
          onDoubleClick={(e) => e.preventDefault()}
          onClick={() => {
            const now = Date.now();
            if (now - lastTap.current < 350) {
              lastTap.current = 0;
              setOpen(true);
            } else {
              lastTap.current = now;
            }
          }}
          title="Duplo toque para abrir as opções"
        >
          {trigger}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl">
        {content}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Dashboard() {
  const store = useStore();
  const { entries, categories, reserve } = store;

  const now = new Date();
  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );

  const [scopeFilter, setScopeFilter] = useState<Scope[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter[]>([]);
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [dialog, setDialog] = useState<string | null>(null);
  const [dialogScope, setDialogScope] = useState<Scope>("empresa");
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
  const [detailGroup, setDetailGroup] = useState<{
    category: Category;
    scope: Scope;
    entries: Entry[];
  } | null>(null);
  const [confirmPay, setConfirmPay] = useState<Entry[] | null>(null);
  const [payDone, setPayDone] = useState(false);
  const [payDoneTotal, setPayDoneTotal] = useState(0);

  const totals = useMemo(() => globalTotals(entries, month), [entries, month]);
  const empresa = useMemo(() => scopeTotals(entries, "empresa", month), [entries, month]);
  const pessoal = useMemo(() => scopeTotals(entries, "pessoal", month), [entries, month]);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Sem categoria";
  const catColor = (id: string) => categories.find((c) => c.id === id)?.color ?? "#34d399";
  const catIcon = (id: string) => categories.find((c) => c.id === id)?.icon;

  const groups = useMemo(() => {
    const filtered = entries.filter((e) => {
      if (e.type !== "expense") return false;
      if (scopeFilter.length && !scopeFilter.includes(e.scope)) return false;
      if (catFilter.length && !catFilter.includes(e.categoryId)) return false;
      if (statusFilter.length) {
        const paidOff = e.paid >= e.amount;
        const wantPago = statusFilter.includes("pago");
        const wantAPagar = statusFilter.includes("apagar");
        if (paidOff && !wantPago) return false;
        if (!paidOff && !wantAPagar) return false;
      }
      return true;
    });

    const map = new Map<string, Entry[]>();
    for (const e of filtered) {
      if (monthKey(e.date) !== month) continue;
      const key = `${e.scope}|${e.categoryId}`;
      const list = map.get(key);
      if (list) list.push(e);
      else map.set(key, [e]);
    }

    return [...map.entries()]
      .map(([key, list]) => {
        const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
        const pending = sorted.filter((e) => e.paid < e.amount);
        const nextDue = (pending[0] ?? sorted[0])!.date;
        const parcelSum = sorted.reduce((acc, e) => acc + e.amount, 0);
        const hasInstallment = sorted.some((e) => e.installmentCount);
        const hasFixed = sorted.some((e) => e.fixed);
        const totalValue = hasInstallment
          ? [
              ...new Set(
                sorted
                  .filter((e) => e.groupId && e.totalAmount)
                  .map((e) => `${e.groupId}:${e.totalAmount}`),
              ),
            ].reduce((acc, s) => acc + Number(s.split(":")[1] ?? 0), 0)
          : 0;
        const [scope, categoryId] = key.split("|") as [Scope, string];
        return {
          key,
          scope,
          categoryId,
          entries: sorted,
          pending,
          nextDue,
          parcelSum,
          totalLabel: hasInstallment ? formatCents(totalValue) : hasFixed ? "Fixa" : "—",
        };
      })
      .sort((a, b) => a.nextDue.localeCompare(b.nextDue));
  }, [entries, scopeFilter, statusFilter, catFilter, month]);

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const shiftMonth = (delta: number) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1 + delta, 1));
    setMonth(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  };

  const openScopeDialog = (name: string, scope: Scope) => {
    setDialogScope(scope);
    setDialog(name);
  };

  const ScopePanel = ({ scope }: { scope: Scope }) => {
    const t = scope === "empresa" ? empresa : pessoal;
    const isCompany = scope === "empresa";
    return (
      <section className="surface rounded-3xl p-5">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
              {isCompany ? <Building2 className="size-5" /> : <User className="size-5" />}
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-display text-lg font-bold">
                {isCompany ? "Empresa" : "Pessoal"}
              </h2>
              <p className="truncate text-xs text-muted-foreground">
                {MONTHS[Number(month.slice(5, 7)) - 1]} de {month.slice(0, 4)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl"
              onClick={() => openScopeDialog("report-monthly", scope)}
            >
              <FileText className="size-4" />
              <span className="hidden sm:inline">Mensal</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl"
              onClick={() => openScopeDialog("report-annual", scope)}
            >
              <CalendarClock className="size-4" />
              <span className="hidden sm:inline">Anual</span>
            </Button>
          </div>
        </header>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Indicator label="Dívida mensal" value={formatCents(t.total)} tone="negative" />
          <Indicator label="Total pago" value={formatCents(t.paid)} tone="positive" />
          <Indicator
            label="A pagar"
            value={formatCents(t.due)}
            tone={t.due > 0 ? "negative" : "positive"}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button className="h-11 rounded-2xl" onClick={() => openScopeDialog("income", scope)}>
            <ArrowUpRight className="size-4" /> Renda
          </Button>
          <Button
            variant="destructive"
            className="h-11 rounded-2xl"
            onClick={() => openScopeDialog("expense", scope)}
          >
            <ArrowDownRight className="size-4" /> Despesa
          </Button>
        </div>
      </section>
    );
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/favicon.png"
            alt="Brasão da Família Heinz"
            className="size-11 shrink-0 rounded-2xl object-cover ring-1 ring-primary/30"
          />
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-bold tracking-tight">
              Família Heinz
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Controle financeiro • Tradição e amor
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 rounded-xl"
          onClick={() => setDialog("categories")}
        >
          <Tags className="size-4" />
          <span className="hidden sm:inline">Categorias</span>
        </Button>
      </header>

      {/* Bolhas */}
      <section className="mt-5 grid grid-cols-2 gap-3">
        <Bubble
          className="col-span-2"
          label="Saldo (empresa + pessoal)"
          value={formatCents(totals.balance)}
          tone={totals.balance >= 0 ? "positive" : "negative"}
          icon={<Wallet className="size-4" />}
        >
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>
              Entradas <b className="text-primary tabular-nums">{formatCents(totals.income)}</b>
            </span>
            <span>
              Saídas <b className="text-destructive tabular-nums">{formatCents(totals.outcome)}</b>
            </span>
          </div>
        </Bubble>
        <Bubble
          label="Entradas"
          value={formatCents(totals.income)}
          tone="positive"
          icon={<ArrowUpRight className="size-4" />}
        />
        <Bubble
          label="Saídas"
          value={formatCents(totals.outcome)}
          tone="negative"
          icon={<ArrowDownRight className="size-4" />}
        />
        <Bubble
          className="col-span-2"
          label="Reserva"
          value={formatCents(reserve)}
          icon={<PiggyBank className="size-4" />}
        >
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              className="h-10 flex-1 rounded-2xl"
              onClick={() => setDialog("reserve-in")}
            >
              <Plus className="size-4" /> Adicionar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-10 flex-1 rounded-2xl"
              onClick={() => setDialog("reserve-out")}
            >
              <Minus className="size-4" /> Retirar
            </Button>
          </div>
        </Bubble>
      </section>

      {/* Seletor de mês */}
      <div className="surface mt-5 flex items-center justify-between rounded-3xl px-3 py-2">
        <button
          className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          onClick={() => shiftMonth(-1)}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="font-display text-sm font-semibold">
          {MONTHS[Number(month.slice(5, 7)) - 1]} {month.slice(0, 4)}
        </span>
        <button
          className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          onClick={() => shiftMonth(1)}
          aria-label="Próximo mês"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Gráfico donut */}
      <DonutChart
        entries={entries}
        categories={categories}
        month={month}
        scopeFilter={scopeFilter}
      />

      <div className="mt-5 grid gap-4">
        <ScopePanel scope="empresa" />
        <ScopePanel scope="pessoal" />
      </div>

      {/* Filtros */}
      <section className="mt-6">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex w-full items-center gap-2 text-left text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          <Sparkles className="size-3.5" /> Filtros
          {scopeFilter.length + statusFilter.length + catFilter.length > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary tabular-nums">
              {scopeFilter.length + statusFilter.length + catFilter.length}
            </span>
          )}
          <ChevronDown
            className={cn(
              "ml-auto size-4 transition-transform duration-200",
              filtersOpen && "rotate-180",
            )}
          />
        </button>
        {filtersOpen && (
          <>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              <FilterChip
                active={scopeFilter.includes("empresa")}
                onClick={() => toggle(scopeFilter, "empresa", setScopeFilter)}
              >
                Empresa
              </FilterChip>
              <FilterChip
                active={scopeFilter.includes("pessoal")}
                onClick={() => toggle(scopeFilter, "pessoal", setScopeFilter)}
              >
                Pessoal
              </FilterChip>
              <FilterChip
                active={statusFilter.includes("pago")}
                onClick={() => toggle(statusFilter, "pago", setStatusFilter)}
              >
                Pago
              </FilterChip>
              <FilterChip
                active={statusFilter.includes("apagar")}
                onClick={() => toggle(statusFilter, "apagar", setStatusFilter)}
              >
                A pagar
              </FilterChip>
            </div>
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <FilterChip
                  key={c.id}
                  active={catFilter.includes(c.id)}
                  onClick={() => toggle(catFilter, c.id, setCatFilter)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <SelectedIconSmall name={c.icon} />
                    {c.name}
                  </span>
                </FilterChip>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Lista principal */}
      <section className="surface mt-4 overflow-hidden rounded-3xl">
        <div className="grid grid-cols-[minmax(0,1.4fr)_auto] items-center gap-2 border-b border-border px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <span>Categoria</span>
          <span className="hidden sm:block">Vencimento</span>
          <span className="text-right">Parcela</span>
          <span className="hidden text-right sm:block">Total</span>
        </div>

        {groups.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhum lançamento encontrado com os filtros atuais.
          </p>
        )}

        {groups.map((g) => {
          const detailCategory: Category = {
            id: g.categoryId,
            name: catName(g.categoryId),
            color: catColor(g.categoryId),
            icon: catIcon(g.categoryId) ?? "Tag",
          };
          const openDetail = () => {
            setDetailGroup({
              category: detailCategory,
              scope: g.scope,
              entries: entries.filter(
                (e) => e.type === "expense" && e.scope === g.scope && e.categoryId === g.categoryId,
              ),
            });
            setDialog("detail");
          };
          return (
            <div
              key={g.key}
              className="grid w-full grid-cols-[minmax(0,1.4fr)_auto] items-center gap-2 border-b border-border/60 px-4 py-4 transition-colors last:border-0 hover:bg-secondary/40 sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]"
            >
              <button
                onClick={openDetail}
                title="Ver lançamentos da categoria"
                className="relative z-10 flex min-w-0 items-center gap-3 text-left"
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-xl"
                  style={{
                    backgroundColor: `${catColor(g.categoryId)}22`,
                    color: catColor(g.categoryId),
                  }}
                >
                  <SelectedIcon name={catIcon(g.categoryId)} />
                </span>
                <span className="min-w-0 flex items-center gap-2">
                  <span className="block truncate text-sm font-medium">
                    {catName(g.categoryId)}
                  </span>
                </span>
              </button>
              <RowMenu
                trigger={
                  <>
                    <span className="hidden text-sm text-muted-foreground sm:block">
                      {formatDate(g.nextDue)}
                    </span>
                    <span className="text-right font-display text-sm font-semibold tabular-nums text-destructive">
                      {formatCents(g.parcelSum)}
                    </span>
                    <span className="hidden text-right text-sm text-destructive/70 tabular-nums sm:block">
                      {g.totalLabel}
                    </span>
                  </>
                }
                content={
                  <>
                    <DropdownMenuLabel>{catName(g.categoryId)}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => {
                        setActiveEntry(g.pending[0] ?? g.entries[0] ?? null);
                        setDialog("edit");
                      }}
                    >
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => openDetail()}>Detalhar</DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        const target = g.pending[0];
                        if (!target) {
                          toast.info("Não há parcelas em aberto");
                          return;
                        }
                        setActiveEntry(target);
                        setDialog("partial");
                      }}
                    >
                      Pagamento parcial
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        if (g.pending.length === 0) {
                          toast.info("Tudo já está pago");
                          return;
                        }
                        setConfirmPay(g.pending);
                      }}
                    >
                      Pagamento total
                    </DropdownMenuItem>
                  </>
                }
              />
            </div>
          );
        })}
      </section>

      {/* Dialogs */}
      <IncomeDialog
        open={dialog === "income"}
        onOpenChange={(v) => setDialog(v ? "income" : null)}
        scope={dialogScope}
      />
      <ExpenseDialog
        open={dialog === "expense"}
        onOpenChange={(v) => setDialog(v ? "expense" : null)}
        scope={dialogScope}
      />
      <ReserveDepositDialog
        open={dialog === "reserve-in"}
        onOpenChange={(v) => setDialog(v ? "reserve-in" : null)}
      />
      <ReserveWithdrawDialog
        open={dialog === "reserve-out"}
        onOpenChange={(v) => setDialog(v ? "reserve-out" : null)}
      />
      <CategoriesDialog
        open={dialog === "categories"}
        onOpenChange={(v) => setDialog(v ? "categories" : null)}
      />
      <ReportDialog
        open={dialog === "report-monthly"}
        onOpenChange={(v) => setDialog(v ? "report-monthly" : null)}
        kind="monthly"
        scope={dialogScope}
        onGenerate={(value) => {
          monthlyReportPdf(entries, categories, dialogScope, value);
          toast.success("Relatório gerado");
        }}
      />
      <ReportDialog
        open={dialog === "report-annual"}
        onOpenChange={(v) => setDialog(v ? "report-annual" : null)}
        kind="annual"
        scope={dialogScope}
        onGenerate={(value) => {
          annualReportPdf(entries, categories, dialogScope, value);
          toast.success("Relatório gerado");
        }}
      />
      <EditEntryDialog
        open={dialog === "edit"}
        onOpenChange={(v) => setDialog(v ? "edit" : null)}
        entry={activeEntry}
      />
      <PartialPaymentDialog
        open={dialog === "partial"}
        onOpenChange={(v) => setDialog(v ? "partial" : null)}
        entry={activeEntry}
      />
      <DetailDialog
        open={dialog === "detail"}
        onOpenChange={(v) => setDialog(v ? "detail" : null)}
        category={detailGroup?.category ?? null}
        scope={detailGroup?.scope ?? "empresa"}
        entries={detailGroup?.entries ?? []}
        onEdit={(entry) => {
          setActiveEntry(entry);
          setDialog("edit");
        }}
      />
      <AlertDialog
        open={Boolean(confirmPay) || payDone}
        onOpenChange={(v) => {
          if (!v) {
            setConfirmPay(null);
            setPayDone(false);
          }
        }}
      >
        <AlertDialogContent className="rounded-3xl">
          {payDone ? (
            <PaidConfirmation detail={`${payDoneTotal} lançamento(s) marcados como pagos.`} />
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar pagamento total?</AlertDialogTitle>
                <AlertDialogDescription>
                  {confirmPay?.length} lançamento(s) serão marcados como pagos, no total de{" "}
                  {formatCents((confirmPay ?? []).reduce((a, e) => a + (e.amount - e.paid), 0))}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-2xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="rounded-2xl"
                  onClick={() => {
                    const list = confirmPay ?? [];
                    store.payFull(list.map((e) => e.id));
                    setPayDoneTotal(list.length);
                    setConfirmPay(null);
                    setPayDone(true);
                    toast.success("Pagamento registrado");
                  }}
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <footer className="mt-10 text-center text-xs text-muted-foreground">
        Dados sincronizados com a nuvem • {monthKey(new Date().toISOString())}
      </footer>
    </main>
  );
}
