import { forwardRef } from "react";
import { maskCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (cents: number) => void;
  className?: string;
  autoFocus?: boolean;
  id?: string;
}

/** Campo monetário com máscara automática: usuário digita 4550 -> R$ 45,50 */
export const CurrencyInput = forwardRef<HTMLInputElement, Props>(
  function CurrencyInput({ value, onChange, className, autoFocus, id }, ref) {
    return (
      <input
        id={id}
        ref={ref}
        autoFocus={autoFocus}
        inputMode="numeric"
        value={maskCurrency(String(value))}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
          onChange(digits ? parseInt(digits, 10) : 0);
        }}
        className={cn(
          "h-14 w-full rounded-2xl border border-input bg-secondary/60 px-4 text-2xl font-semibold tracking-tight text-foreground outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/30 font-display",
          className,
        )}
      />
    );
  },
);
