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
  { id: "cat-mercado", name: "Mercado", color: "#34d399" },
  { id: "cat-aluguel", name: "Aluguel", color: "#38bdf8" },
  { id: "cat-luz", name: "Luz", color: "#f59e0b" },
  { id: "cat-vestuario", name: "Vestuário", color: "#f472b6" },
  { id: "cat-insumos", name: "Insumos", color: "#a78bfa" },
  { id: "cat-salario", name: "Salário", color: "#84cc16" },
  { id: "cat-servicos", name: "Serviços", color: "#22d3ee" },
  { id: "cat-outros", name: "Outros", color: "#fb923c" },
];
