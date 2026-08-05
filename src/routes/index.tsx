import { createFileRoute } from "@tanstack/react-router";
import { StoreProvider } from "@/lib/store";
import { Dashboard } from "@/components/fh/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Família Heinz — Controle Financeiro" },
      {
        name: "description",
        content:
          "App financeiro da Família Heinz: saldo, entradas, saídas, reserva, despesas parceladas e relatórios em PDF para empresa e pessoal.",
      },
      { property: "og:title", content: "Família Heinz — Controle Financeiro" },
      {
        property: "og:description",
        content:
          "Saldo em tempo real, reserva independente, despesas parceladas e fixas, filtros inteligentes e relatórios mensais e anuais em PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  );
}
