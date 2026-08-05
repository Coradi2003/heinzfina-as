/** Utilidades de máscara monetária (valores sempre em centavos). */

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatCompact(cents: number): string {
  const v = cents / 100;
  if (Math.abs(v) >= 1000) {
    return `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  }
  return formatCents(cents);
}

/** Converte o que o usuário digitou (só dígitos) em máscara "R$ 45,50". */
export function maskCurrency(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 13);
  const cents = digits ? parseInt(digits, 10) : 0;
  return formatCents(cents);
}

export function parseCurrency(masked: string): number {
  const digits = masked.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Adiciona meses a uma data ISO mantendo o dia (limitado ao fim do mês). */
export function addMonths(iso: string, months: number): string {
  const parts = iso.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const base = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0),
  ).getUTCDate();
  base.setUTCDate(Math.min(d, last));
  return base.toISOString().slice(0, 10);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}
