import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "./CurrencyInput";
import { IconPicker, SelectedIcon, SelectedIconSmall } from "./IconPicker";
import { CATEGORY_COLORS } from "@/lib/db";
import { formatCents, formatDate, MONTHS, todayISO } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Category, Entry, Scope } from "@/lib/types";
import { toast } from "sonner";
import { ArrowDownRight, ArrowUpRight, Check, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { suggestIcon } from "@/lib/icons";

interface BaseProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (v: string) => void;
  categories: Category[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 rounded-2xl bg-secondary/60">
        <SelectValue placeholder="Selecione a categoria" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <SelectedIconSmall name={c.icon} />
              {c.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* --------------------------- Renda --------------------------- */

export function IncomeDialog({ open, onOpenChange, scope }: BaseProps & { scope: Scope }) {
  const { categories, addIncome } = useStore();
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());

  const save = () => {
    if (!amount || !categoryId) {
      toast.error("Informe valor e categoria");
      return;
    }
    addIncome({ scope, categoryId, description, amount, date });
    toast.success("Renda cadastrada");
    setAmount(0);
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <ArrowUpRight className="size-4" />
              </span>
              Nova renda
            </span>
          </DialogTitle>
          <DialogDescription>{scope === "empresa" ? "Empresa" : "Pessoal"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Valor">
            <CurrencyInput value={amount} onChange={setAmount} autoFocus />
          </Field>
          <Field label="Categoria">
            <CategorySelect value={categoryId} onChange={setCategoryId} categories={categories} />
          </Field>
          <Field label="Descrição (opcional)">
            <Input
              className="h-12 rounded-2xl bg-secondary/60"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field label="Data">
            <Input
              type="date"
              className="h-12 rounded-2xl bg-secondary/60"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button className="h-12 w-full rounded-2xl text-base" onClick={save}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Despesa --------------------------- */

export function ExpenseDialog({ open, onOpenChange, scope }: BaseProps & { scope: Scope }) {
  const { categories, addExpense } = useStore();
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [installments, setInstallments] = useState(1);
  const [fixed, setFixed] = useState(false);
  const [dueDate, setDueDate] = useState(todayISO());

  const save = () => {
    if (!amount || !categoryId) {
      toast.error("Informe valor e categoria");
      return;
    }
    addExpense({
      scope,
      categoryId,
      description,
      amount,
      installments: fixed ? 1 : installments,
      fixed,
      dueDate,
    });
    toast.success(
      fixed
        ? "Despesa fixa criada para todos os meses do ano"
        : installments > 1
          ? `${installments} parcelas criadas`
          : "Despesa cadastrada",
    );
    setAmount(0);
    setDescription("");
    setInstallments(1);
    setFixed(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
                <ArrowDownRight className="size-4" />
              </span>
              Nova despesa
            </span>
          </DialogTitle>
          <DialogDescription>{scope === "empresa" ? "Empresa" : "Pessoal"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Valor total">
            <CurrencyInput value={amount} onChange={setAmount} autoFocus />
          </Field>
          <Field label="Categoria">
            <CategorySelect value={categoryId} onChange={setCategoryId} categories={categories} />
          </Field>
          <Field label="Descrição (opcional)">
            <Input
              className="h-12 rounded-2xl bg-secondary/60"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field label="Número de parcelas">
            <Input
              type="number"
              min={1}
              max={120}
              disabled={fixed}
              className="h-12 rounded-2xl bg-secondary/60"
              value={installments}
              onChange={(e) => setInstallments(Math.max(1, Number(e.target.value) || 1))}
            />
            {!fixed && installments > 1 && amount > 0 && (
              <p className="text-xs text-destructive">
                {installments}x de {formatCents(Math.floor(amount / installments))}
              </p>
            )}
          </Field>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3">
            <Checkbox checked={fixed} onCheckedChange={(v) => setFixed(Boolean(v))} />
            <span className="text-sm">
              Despesa fixa
              <span className="block text-xs text-muted-foreground">
                Repete em todos os meses do ano
              </span>
            </span>
          </label>
          <Field label="Data de vencimento">
            <Input
              type="date"
              className="h-12 rounded-2xl bg-secondary/60"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            className="h-12 w-full rounded-2xl text-base"
            onClick={save}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Reserva --------------------------- */

export function ReserveDepositDialog({ open, onOpenChange }: BaseProps) {
  const { reserveDeposit } = useStore();
  const [amount, setAmount] = useState(0);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar à reserva</DialogTitle>
        </DialogHeader>
        <Field label="Valor">
          <CurrencyInput value={amount} onChange={setAmount} autoFocus />
        </Field>
        <DialogFooter>
          <Button
            className="h-12 w-full rounded-2xl"
            onClick={() => {
              if (!amount) {
                toast.error("Informe o valor");
                return;
              }
              reserveDeposit(amount);
              toast.success("Reserva atualizada");
              setAmount(0);
              onOpenChange(false);
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReserveWithdrawDialog({ open, onOpenChange }: BaseProps) {
  const { reserveWithdraw, reserve } = useStore();
  const [amount, setAmount] = useState(0);
  const [destination, setDestination] = useState("");
  const [scope, setScope] = useState<Scope>("pessoal");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
                <Minus className="size-4" />
              </span>
              Retirar da reserva
            </span>
          </DialogTitle>
          <DialogDescription>
            Disponível: {formatCents(reserve)} — gera uma despesa com o destino informado, sem
            alterar o saldo principal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Valor">
            <CurrencyInput value={amount} onChange={setAmount} autoFocus />
          </Field>
          <Field label="Destino">
            <Input
              className="h-12 rounded-2xl bg-secondary/60"
              placeholder="Ex.: conserto do carro"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </Field>
          <Field label="Lançar em">
            <Select value={scope} onValueChange={(v) => setScope(v as Scope)}>
              <SelectTrigger className="h-12 rounded-2xl bg-secondary/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pessoal">Pessoal</SelectItem>
                <SelectItem value="empresa">Empresa</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            className="h-12 w-full rounded-2xl"
            onClick={() => {
              if (!amount || !destination.trim()) {
                toast.error("Informe valor e destino");
                return;
              }
              reserveWithdraw(amount, destination.trim(), scope);
              toast.success("Retirada registrada");
              setAmount(0);
              setDestination("");
              onOpenChange(false);
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Categorias --------------------------- */

export function CategoriesDialog({ open, onOpenChange }: BaseProps) {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Tag");
  const [iconTouched, setIconTouched] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("Tag");

  const applyNameSuggestion = (raw: string) => {
    setName(raw);
    if (!iconTouched) setIcon(suggestIcon(raw));
  };

  const onPick = (i: string) => {
    setIcon(i);
    setIconTouched(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Categorias</DialogTitle>
          <DialogDescription>Usadas em rendas, despesas, filtros e relatórios.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              className="h-12 rounded-2xl bg-secondary/60"
              placeholder="Nova categoria"
              value={name}
              onChange={(e) => applyNameSuggestion(e.target.value)}
            />
            <Button
              size="icon"
              className="size-12 shrink-0 rounded-2xl"
              onClick={() => {
                if (!name.trim()) return;
                addCategory(name.trim(), icon);
                setName("");
                setIcon("Tag");
                setIconTouched(false);
              }}
            >
              <Plus />
            </Button>
          </div>
          <IconPicker value={icon} onChange={onPick} name={name} />
        </div>
        <div className="space-y-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="space-y-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-xl"
                  style={{ backgroundColor: `${c.color}22`, color: c.color }}
                >
                  <SelectedIcon name={c.icon} />
                </span>
                {editing === c.id ? (
                  <Input
                    className="h-9 flex-1 rounded-xl"
                    value={editName}
                    autoFocus
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => {
                      if (editName.trim()) updateCategory(c.id, { name: editName.trim() });
                    }}
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
                )}
                <button
                  className="text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => {
                    if (editing === c.id) {
                      setEditing(null);
                      return;
                    }
                    setEditing(c.id);
                    setEditName(c.name);
                    setEditIcon(c.icon ?? "Tag");
                  }}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  onClick={() => {
                    deleteCategory(c.id);
                    toast.success("Categoria excluída");
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {editing === c.id && (
                <IconPicker
                  value={editIcon}
                  onChange={(i) => {
                    setEditIcon(i);
                    updateCategory(c.id, { icon: i });
                  }}
                  name={editName}
                />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Editar categoria --------------------------- */

export function CategoryEditDialog({
  open,
  onOpenChange,
  category,
}: BaseProps & { category: Category | null }) {
  const { updateCategory } = useStore();
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color ?? "#34d399");
  const [icon, setIcon] = useState(category?.icon ?? "Tag");

  const save = () => {
    if (!category) return;
    if (!name.trim()) {
      toast.error("Informe o nome");
      return;
    }
    updateCategory(category.id, { name: name.trim(), color, icon });
    toast.success("Categoria atualizada");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Editar categoria</DialogTitle>
          <DialogDescription>
            {category ? `${category.name} • ${category.id}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Nome">
            <Input
              className="h-12 rounded-2xl bg-secondary/60"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="Cor">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Cor ${c}`}
                  className={cn(
                    "size-9 rounded-full transition-transform hover:scale-110",
                    color === c && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </Field>
          <Field label="Ícone">
            <IconPicker value={icon} onChange={setIcon} name={name} />
          </Field>
        </div>
        <DialogFooter>
          <Button className="h-12 w-full rounded-2xl" onClick={save}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Relatórios --------------------------- */

export function ReportDialog({
  open,
  onOpenChange,
  kind,
  scope,
  onGenerate,
}: BaseProps & {
  kind: "monthly" | "annual";
  scope: Scope;
  onGenerate: (value: string) => void;
}) {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));
  const years = Array.from({ length: 7 }, (_, i) => String(now.getFullYear() - 3 + i));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{kind === "monthly" ? "Relatório mensal" : "Relatório anual"}</DialogTitle>
          <DialogDescription>
            {scope === "empresa" ? "Empresa" : "Pessoal"} • exportação em PDF
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {kind === "monthly" && (
            <Field label="Mês">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-12 rounded-2xl bg-secondary/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1).padStart(2, "0")}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Ano">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="h-12 rounded-2xl bg-secondary/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button
            className="h-12 w-full rounded-2xl"
            onClick={() => {
              onGenerate(kind === "monthly" ? `${year}-${month}` : year);
              onOpenChange(false);
            }}
          >
            Gerar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Edição / Detalhe / Pagamentos --------------------------- */

export function EditEntryDialog({
  open,
  onOpenChange,
  entry,
}: BaseProps & { entry: Entry | null }) {
  const { categories, updateEntry, deleteEntry } = useStore();
  const [draft, setDraft] = useState<Entry | null>(entry);

  if (draft?.id !== entry?.id) setDraft(entry);
  if (!draft) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Editar lançamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Valor">
            <CurrencyInput
              value={draft.amount}
              onChange={(v) => setDraft({ ...draft, amount: v })}
            />
          </Field>
          <Field label="Valor já pago">
            <CurrencyInput value={draft.paid} onChange={(v) => setDraft({ ...draft, paid: v })} />
          </Field>
          <Field label="Categoria">
            <CategorySelect
              value={draft.categoryId}
              onChange={(v) => setDraft({ ...draft, categoryId: v })}
              categories={categories}
            />
          </Field>
          <Field label="Descrição">
            <Input
              className="h-12 rounded-2xl bg-secondary/60"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </Field>
          <Field label="Vencimento">
            <Input
              type="date"
              className="h-12 rounded-2xl bg-secondary/60"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </Field>
          <Field label="Painel">
            <Select
              value={draft.scope}
              onValueChange={(v) => setDraft({ ...draft, scope: v as Scope })}
            >
              <SelectTrigger className="h-12 rounded-2xl bg-secondary/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empresa">Empresa</SelectItem>
                <SelectItem value="pessoal">Pessoal</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button
            variant="ghost"
            className="h-12 rounded-2xl text-destructive"
            onClick={() => {
              deleteEntry(draft.id);
              toast.success("Lançamento excluído");
              onOpenChange(false);
            }}
          >
            <Trash2 />
          </Button>
          <Button
            className="h-12 flex-1 rounded-2xl"
            onClick={() => {
              updateEntry(draft.id, draft);
              toast.success("Lançamento atualizado");
              onOpenChange(false);
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DetailDialog({
  open,
  onOpenChange,
  category,
  scope,
  entries,
}: BaseProps & {
  category: Category | null;
  scope: Scope;
  entries: Entry[];
}) {
  const total = entries.reduce((acc, e) => acc + e.amount, 0);
  const paid = entries.reduce((acc, e) => acc + e.paid, 0);
  const pending = total - paid;
  const color = category?.color ?? "#34d399";

  const labelOf = (e: Entry) =>
    e.description ||
    (e.installmentCount ? `Parcela ${e.installmentIndex}/${e.installmentCount}` : "Lançamento");

  const statusOf = (e: Entry): "Pago" | "Parcial" | "Em aberto" =>
    e.paid >= e.amount ? "Pago" : e.paid > 0 ? "Parcial" : "Em aberto";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2.5">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-xl"
                style={{ backgroundColor: `${color}22`, color }}
              >
                <SelectedIcon name={category?.icon} />
              </span>
              {category?.name ?? "Sem categoria"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {scope === "empresa" ? "Empresa" : "Pessoal"} • {entries.length} lançamento(s)
          </DialogDescription>
        </DialogHeader>

        {/* Resumo da categoria */}
        <div className="grid grid-cols-3 gap-2">
          <DetailSummary label="Total" value={formatCents(total)} tone="negative" />
          <DetailSummary label="Pago" value={formatCents(paid)} tone="positive" />
          <DetailSummary
            label="Pendente"
            value={formatCents(pending)}
            tone={pending > 0 ? "negative" : "positive"}
          />
        </div>

        {/* Cabeçalho da tabela (desktop) */}
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Data</span>
          <span>Descrição</span>
          <span>Vencimento</span>
          <span className="text-right">Valor</span>
          <span className="text-right">Status</span>
        </div>

        {entries.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum lançamento nesta categoria.
          </p>
        )}

        <div className="space-y-2">
          {entries.map((e) => {
            const status = statusOf(e);
            return (
              <div
                key={e.id}
                className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-3"
              >
                {/* Mobile */}
                <div className="sm:hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{labelOf(e)}</span>
                    <DetailStatus status={status} />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="tabular-nums">{formatDate(e.date)}</span>
                    <span className="font-display text-sm font-semibold tabular-nums text-foreground">
                      {formatCents(e.amount)}
                    </span>
                  </div>
                </div>
                {/* Desktop */}
                <span className="hidden text-sm tabular-nums sm:block">{formatDate(e.date)}</span>
                <span className="hidden truncate text-sm sm:block">{labelOf(e)}</span>
                <span className="hidden text-sm tabular-nums sm:block">{formatDate(e.date)}</span>
                <span className="hidden text-right font-display text-sm font-semibold tabular-nums sm:block">
                  {formatCents(e.amount)}
                </span>
                <span className="hidden justify-self-end sm:block">
                  <DetailStatus status={status} />
                </span>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailSummary({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 px-3 py-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-base font-bold tabular-nums",
          tone === "positive" && "text-primary",
          tone === "negative" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DetailStatus({ status }: { status: "Pago" | "Parcial" | "Em aberto" }) {
  const styles =
    status === "Pago"
      ? "bg-primary/15 text-primary"
      : status === "Parcial"
        ? "bg-warning/15 text-warning"
        : "bg-destructive/15 text-destructive";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        styles,
      )}
    >
      {status}
    </span>
  );
}

export function PaidConfirmation({ detail }: { detail?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="grid size-16 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
        <Check className="size-8" strokeWidth={3} />
      </span>
      <p className="font-display text-2xl font-bold tracking-tight">PAGO</p>
      {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
    </div>
  );
}

export function PartialPaymentDialog({
  open,
  onOpenChange,
  entry,
}: BaseProps & { entry: Entry | null }) {
  const { payPartial } = useStore();
  const [amount, setAmount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setDone(false);
      setAmount(0);
    }
  }, [open]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => onOpenChange(false), 1400);
    return () => clearTimeout(t);
  }, [done, onOpenChange]);

  if (!entry) return null;
  const remaining = entry.amount - entry.paid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        {done ? (
          <PaidConfirmation detail={`${formatCents(amount)} aplicados neste lançamento.`} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pagamento parcial</DialogTitle>
              <DialogDescription>
                Restam {formatCents(remaining)} — vencimento {formatDate(entry.date)}
              </DialogDescription>
            </DialogHeader>
            <Field label="Valor">
              <CurrencyInput value={amount} onChange={setAmount} autoFocus />
            </Field>
            <DialogFooter>
              <Button
                variant="destructive"
                className="h-12 w-full rounded-2xl"
                onClick={() => {
                  if (!amount) {
                    toast.error("Informe o valor");
                    return;
                  }
                  payPartial(entry.id, amount);
                  toast.success("Pagamento registrado");
                  setDone(true);
                }}
              >
                <Check className="size-4" /> Pagar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
