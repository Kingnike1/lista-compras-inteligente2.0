"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HouseholdProduct } from "@/modules/household/types";
import type { ShoppingList, ShoppingListItem, ShoppingPriority } from "./types";

const priorityLabels: Record<ShoppingPriority, string> = {
  essential: "Essencial",
  necessary: "Necessário",
  desirable: "Desejável",
  optional: "Opcional",
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ShoppingListPanel({ householdId, products }: { householdId: string; products: HouseholdProduct[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("id,household_id,budget,planned_days,status,shopping_list_items(id,shopping_list_id,product_id,quantity,unit,priority,expected_price,actual_price,checked,products(id,name,brand,package_quantity,package_unit))")
      .eq("household_id", householdId)
      .in("status", ["draft", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setMessage("Não foi possível carregar a lista de compras.");
      setLoading(false);
      return;
    }

    if (data) {
      const raw = data as unknown as ShoppingList & {
        shopping_list_items: Array<ShoppingListItem & { products: ShoppingListItem["products"] | ShoppingListItem["products"][] }>;
      };
      const shopping_list_items: ShoppingListItem[] = raw.shopping_list_items.map(item => ({
        ...item,
        products: Array.isArray(item.products) ? item.products[0] ?? null : item.products,
      }));
      setList({ ...raw, shopping_list_items });
      setLoading(false);
      return;
    }

    const { data: created, error: createError } = await supabase
      .from("shopping_lists")
      .insert({ household_id: householdId, status: "draft" })
      .select("id,household_id,budget,planned_days,status")
      .single();

    if (createError || !created) {
      setMessage("Não foi possível criar sua lista de compras.");
      setLoading(false);
      return;
    }

    setList({ ...(created as Omit<ShoppingList, "shopping_list_items">), shopping_list_items: [] });
    setLoading(false);
  }, [householdId, supabase]);

  useEffect(() => { void load(); }, [load]);

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!list) return;
    const form = new FormData(event.currentTarget);
    const budgetValue = String(form.get("budget") ?? "").trim();
    const daysValue = String(form.get("plannedDays") ?? "").trim();
    const budget = budgetValue === "" ? null : Number(budgetValue);
    const plannedDays = daysValue === "" ? null : Number(daysValue);
    if ((budget !== null && budget < 0) || (plannedDays !== null && plannedDays < 1)) {
      setMessage("Revise o orçamento e os dias planejados.");
      return;
    }
    const { error } = await supabase.from("shopping_lists").update({ budget, planned_days: plannedDays }).eq("id", list.id);
    if (error) { setMessage("Não foi possível salvar o planejamento."); return; }
    setList(current => current ? { ...current, budget, planned_days: plannedDays } : current);
    setMessage("Planejamento salvo.");
  }

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!list) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const productId = String(form.get("productId") ?? "");
    const quantity = Number(form.get("quantity") ?? 1);
    const priority = String(form.get("priority") ?? "necessary") as ShoppingPriority;
    const expectedPriceRaw = String(form.get("expectedPrice") ?? "").trim();
    const expectedPrice = expectedPriceRaw === "" ? null : Number(expectedPriceRaw);
    const product = products.find(item => item.id === productId);
    if (!product || quantity <= 0 || (expectedPrice !== null && expectedPrice < 0)) {
      setMessage("Revise o produto, a quantidade e o preço previsto.");
      return;
    }

    const existing = list.shopping_list_items.find(item => item.product_id === productId);
    if (existing) {
      const nextQuantity = Number(existing.quantity) + quantity;
      const { error } = await supabase.from("shopping_list_items").update({ quantity: nextQuantity, priority, expected_price: expectedPrice ?? existing.expected_price }).eq("id", existing.id);
      if (error) { setMessage("Não foi possível atualizar esse item."); return; }
      setList(current => current ? { ...current, shopping_list_items: current.shopping_list_items.map(item => item.id === existing.id ? { ...item, quantity: nextQuantity, priority, expected_price: expectedPrice ?? item.expected_price } : item) } : current);
    } else {
      const { data, error } = await supabase.from("shopping_list_items").insert({ shopping_list_id: list.id, product_id: productId, quantity, unit: product.package_unit, priority, expected_price: expectedPrice }).select("id,shopping_list_id,product_id,quantity,unit,priority,expected_price,actual_price,checked").single();
      if (error || !data) { setMessage("Não foi possível adicionar o produto à lista."); return; }
      const newItem: ShoppingListItem = { ...(data as Omit<ShoppingListItem, "products">), products: { id: product.id, name: product.name, brand: product.brand, package_quantity: product.package_quantity, package_unit: product.package_unit } };
      setList(current => current ? { ...current, shopping_list_items: [...current.shopping_list_items, newItem] } : current);
    }
    formElement.reset();
    setMessage("Produto adicionado à lista.");
  }

  async function toggleChecked(item: ShoppingListItem) {
    const checked = !item.checked;
    const { error } = await supabase.from("shopping_list_items").update({ checked }).eq("id", item.id);
    if (error) { setMessage("Não foi possível atualizar o item."); return; }
    setList(current => current ? { ...current, shopping_list_items: current.shopping_list_items.map(row => row.id === item.id ? { ...row, checked } : row) } : current);
  }

  async function removeItem(item: ShoppingListItem) {
    const { error } = await supabase.from("shopping_list_items").delete().eq("id", item.id);
    if (error) { setMessage("Não foi possível remover o item."); return; }
    setList(current => current ? { ...current, shopping_list_items: current.shopping_list_items.filter(row => row.id !== item.id) } : current);
  }

  async function activateList() {
    if (!list) return;
    const { error } = await supabase.from("shopping_lists").update({ status: "active" }).eq("id", list.id);
    if (error) { setMessage("Não foi possível iniciar a compra."); return; }
    setList(current => current ? { ...current, status: "active" } : current);
    setMessage("Lista pronta para comprar.");
  }

  const expectedTotal = (list?.shopping_list_items ?? []).reduce((sum, item) => sum + (Number(item.expected_price ?? 0) * Number(item.quantity)), 0);
  const budget = Number(list?.budget ?? 0);
  const remaining = budget - expectedTotal;

  if (loading) return <section className="card shopping-card"><p>Carregando lista de compras…</p></section>;
  if (!list) return <section className="card shopping-card"><p>{message || "Lista indisponível."}</p></section>;

  return <section className="card shopping-card"><div className="section-title"><div><span className="badge">Sprint 2</span><h2>Lista de compras</h2><p>Planeje a compra e acompanhe o orçamento sem estimativas escondidas.</p></div><button className="button secondary" type="button" onClick={activateList}>{list.status === "active" ? "Compra ativa" : "Começar compra"}</button></div>{message && <div className="notice" role="status">{message}</div>}<div className="shopping-summary"><div><span>Previsto</span><strong>{money(expectedTotal)}</strong></div><div><span>Orçamento</span><strong>{list.budget == null ? "Não definido" : money(budget)}</strong></div><div><span>Saldo previsto</span><strong className={list.budget != null && remaining < 0 ? "negative" : ""}>{list.budget == null ? "—" : money(remaining)}</strong></div></div><div className="grid two shopping-forms"><form onSubmit={savePlan}><h3>Planejamento</h3><label>Orçamento (R$)<input name="budget" type="number" min="0" step="0.01" defaultValue={list.budget ?? ""} placeholder="Ex.: 350,00" /></label><label>Dias planejados<input name="plannedDays" type="number" min="1" step="1" defaultValue={list.planned_days ?? ""} placeholder="Ex.: 30" /></label><button className="button" type="submit">Salvar planejamento</button></form><form onSubmit={addItem}><h3>Adicionar à lista</h3><label>Produto<select name="productId" required defaultValue=""><option value="" disabled>Selecione</option>{products.map(product=><option value={product.id} key={product.id}>{product.name}{product.brand ? ` · ${product.brand}` : ""}</option>)}</select></label><div className="row"><label>Quantidade<input name="quantity" type="number" min="0.001" step="0.001" defaultValue="1" required /></label><label>Prioridade<select name="priority" defaultValue="necessary">{Object.entries(priorityLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label></div><label>Preço previsto por unidade (R$)<input name="expectedPrice" type="number" min="0" step="0.01" placeholder="Opcional" /></label><button className="button" type="submit">Adicionar</button></form></div>{list.shopping_list_items.length === 0 ? <div className="empty">Sua lista está vazia.</div> : <div className="shopping-items">{list.shopping_list_items.map(item => <article className={`shopping-item ${item.checked ? "checked" : ""}`} key={item.id}><button className="check-button" type="button" onClick={()=>toggleChecked(item)} aria-label={item.checked ? "Desmarcar item" : "Marcar item"}>{item.checked ? "✓" : "○"}</button><div className="product-main"><strong>{item.products?.name ?? "Produto"}</strong><span>{item.products?.brand || "Sem marca"} · {item.quantity} {item.unit ?? "un"} · {priorityLabels[item.priority]}</span></div><div className="item-price">{item.expected_price == null ? "Sem preço" : money(Number(item.expected_price) * Number(item.quantity))}</div><button className="danger-link" type="button" onClick={()=>removeItem(item)}>Remover</button></article>)}</div>}</section>;
}
