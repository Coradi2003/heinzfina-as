import { get, set } from "idb-keyval";
import type { Category, Entry, Meta } from "./types";

/**
 * Camada de persistência. Hoje usa IndexedDB (local, offline).
 * A interface abaixo foi desenhada para que a migração futura para o Supabase
 * exija apenas uma nova implementação de `Repository`.
 */
export interface Repository {
  loadEntries(): Promise<Entry[]>;
  saveEntries(entries: Entry[]): Promise<void>;
  loadCategories(): Promise<Category[] | null>;
  saveCategories(categories: Category[]): Promise<void>;
  loadMeta(): Promise<Meta | null>;
  saveMeta(meta: Meta): Promise<void>;
}

const KEYS = {
  entries: "fh:entries",
  categories: "fh:categories",
  meta: "fh:meta",
};

export const indexedDbRepository: Repository = {
  async loadEntries() {
    return (await get<Entry[]>(KEYS.entries)) ?? [];
  },
  async saveEntries(entries) {
    await set(KEYS.entries, entries);
  },
  async loadCategories() {
    return (await get<Category[]>(KEYS.categories)) ?? null;
  },
  async saveCategories(categories) {
    await set(KEYS.categories, categories);
  },
  async loadMeta() {
    return (await get<Meta>(KEYS.meta)) ?? null;
  },
  async saveMeta(meta) {
    await set(KEYS.meta, meta);
  },
};

export const CATEGORY_COLORS = [
  "#34d399",
  "#f59e0b",
  "#ef4444",
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
  "#22d3ee",
  "#84cc16",
  "#fb923c",
  "#e879f9",
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-casa", name: "Casa", color: "#38bdf8", icon: "Home" },
  { id: "cat-aluguel", name: "Aluguel", color: "#818cf8", icon: "Building2" },
  { id: "cat-empresa", name: "Empresa", color: "#f97316", icon: "Building" },
  { id: "cat-trabalho", name: "Trabalho", color: "#a78bfa", icon: "Briefcase" },
  { id: "cat-salario", name: "Salário", color: "#34d399", icon: "Wallet" },
  { id: "cat-banco", name: "Banco", color: "#fbbf24", icon: "Landmark" },
  { id: "cat-cartao", name: "Cartão", color: "#fb7185", icon: "CreditCard" },
  { id: "cat-mercado", name: "Mercado", color: "#22c55e", icon: "ShoppingCart" },
  { id: "cat-compras", name: "Compras", color: "#e879f9", icon: "ShoppingBag" },
  { id: "cat-alimentacao", name: "Alimentação", color: "#f59e0b", icon: "Utensils" },
  { id: "cat-restaurante", name: "Restaurante", color: "#ef4444", icon: "UtensilsCrossed" },
  { id: "cat-combustivel", name: "Combustível", color: "#14b8a6", icon: "Fuel" },
  { id: "cat-carro", name: "Carro", color: "#3b82f6", icon: "Car" },
  { id: "cat-viagem", name: "Viagem", color: "#06b6d4", icon: "Plane" },
  { id: "cat-lazer", name: "Lazer", color: "#ec4899", icon: "Gamepad2" },
  { id: "cat-celular", name: "Celular", color: "#6366f1", icon: "Smartphone" },
  { id: "cat-internet", name: "Internet", color: "#8b5cf6", icon: "Wifi" },
  { id: "cat-energia", name: "Energia", color: "#eab308", icon: "Zap" },
  { id: "cat-agua", name: "Água", color: "#0ea5e9", icon: "Droplets" },
  { id: "cat-impostos", name: "Impostos", color: "#dc2626", icon: "Receipt" },
  { id: "cat-publicacao", name: "Publicação", color: "#f43f5e", icon: "Megaphone" },
  { id: "cat-insumos", name: "Insumos", color: "#84cc16", icon: "Boxes" },
  { id: "cat-farmacia", name: "Farmácia", color: "#10b981", icon: "Pill" },
  { id: "cat-saude", name: "Saúde", color: "#f87171", icon: "HeartPulse" },
  { id: "cat-educacao", name: "Educação", color: "#60a5fa", icon: "GraduationCap" },
  { id: "cat-pets", name: "Pets", color: "#d946ef", icon: "PawPrint" },
];
