"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProductRef = { name: string; brand: string | null };
type PurchaseListItem = {
  id: string;
  product_id: string;
  quantity: number;
  unit: string | null;
  expected_price: number | null;
  actual_price: number | null;
  checked: boolean;
  products: ProductRef | null;
};
type ActiveList = {
  id: string;
  budget: number | null;
  selected_store_location_id: string | null;
  shopping_list_items: PurchaseListItem[];
};
type PurchaseHistoryItem = {
  id: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  total_price: number;
  products: ProductRef | null;
};
type PurchaseHistory = {
  id: string;
  total: number;
  purchased_at: string;
  store_location_id: string | null;
  purchase_items: PurchaseHistoryItem[];
};
type Location = { id: string; label: string | null; city: string; store_id: string };
type Store = { id: string; name: string };

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function normalizeProduct(value: ProductRef | ProductRef[] | null | undefined): ProductRef | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function PurchasePanel({ householdId }: { householdId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [list, setList] = useState<ActiveList | null>(null);
  const [history, setHistory] = useState<PurchaseHistory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [actualPrices, setActualPrices] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: listRow, error: listError }, { data: historyRows, error: historyError }, { data: locationRows }, { data: storeRows }] = await Promise.all([
      supabase
        .from("shopping_lists")
        .select("id,budget,selected_store_location_id,shopping_list_items(id,product_id,quantity,unit,expected_price,actual_price,checked,products(name,brand))")
        .eq("household_id", householdId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("purchases")
        .select("id,total,purchased_at,store_location_id,purchase_items(id,quantity,unit,unit_price,total_price,products(name,brand))")
        .eq("household_id", householdId)
        .order("purchased_at", { ascending: false })
        .limit(5),
      supabase.from("store_locations").select("id,label,city,store_id"),
      supabase.from("stores").select("id,name"),
    ]);

    if (listError || historyError) {
      setMessage("Não foi possível carregar o modo de compra.");
      setLoading(false);
      return;
    }

    setLocations((locationRows ?? []) as Location[]);
    setStores((storeRows ?? []) as Store[]);

    const normalizedHistory = ((historyRows ?? []) as unknown as Array<PurchaseHistory & {
      purchase_items: Array<PurchaseHistoryItem & { products: ProductRef | ProductRef[] | null }>;
    }>).map(row => ({
      ...row,
      purchase_items: row.purchase_items.map(item => ({ ...item, products: normalizeProduct(item.products) })),
    }));
    setHistory(normalizedHistory);

    if (!listRow) {
      setList(null);
      setActualPrices({});
      setLoading(false);
      return;
    }

    const raw = listRow as unknown as ActiveList & {
      shopping_list_items: Array<PurchaseListItem & { products: ProductRef | ProductRef[] | null }>;
    };
    const items = raw.shopping_list_items.map(item => ({ ...item, products: normalizeProduct(item.products) }));
    const normalizedList: ActiveList = { ...raw, shopping_list_items: items };
    setList(normalizedList);

    const defaults: Record<string, string> = {};
    for (const item of items) {
      if (item.actual_price != null) defaults[item.id] = String(item.actual_price);
    }

    if (raw.selected_store_location_id && items.length > 0) {
      const now = new Date().toISOString();
      const { data: priceRows } = await supabase
        .from("prices")
        .select("product_id,price,observed_at")
        .eq("store_location_id", raw.selected_store_location_id)
        .in("product_id", items.map(item => item.product_id))
        .gte("valid_until", now)
        .order("observed_at", { ascending: false });
      const latest = new Map<string, number>();
      for (const row of priceRows ?? []) if (!latest.has(row.product_id)) latest.set(row.product_id, Number(row.price));
      for (const item of items) if (!defaults[item.id] && latest.has(item.product_id)) defaults[item.id] = String(latest.get(item.product_id));
    }

    setActualPrices(defaults);
    setLoading(false);
  }, [householdId, supabase]);

  useEffect(() => { void load(); }, [load]);

  async function toggleChecked(item: PurchaseListItem) {
    const checked = !item.checked;
    const { error } = await supabase.from("shopping_list_items").update({ checked }).eq("id", item.id);
    if (error) { setMessage("Não foi possível atualizar o item."); return; }
    setList(current => current ? { ...current, shopping_list_items: current.shopping_list_items.map(row => row.id === item.id ? { ...row, checked } : row) } : current);
  }

  async function finishPurchase() {
    if (!list || finishing) return;
    if (!list.selected_store_location_id) { setMessage("Escolha um mercado na comparação da Sprint 3 antes de finalizar."); return; }
    const checked = list.shopping_list_items.filter(item => item.checked);
    if (checked.length === 0) { setMessage("Marque pelo menos um item comprado."); return; }
    const prices = checked.map(item => ({ item_id: item.id, unit_price: Number(actualPrices[item.id] ?? 0) }));
    if (prices.some(item => !Number.isFinite(item.unit_price) || item.unit_price <= 0)) {
      setMessage("Informe o preço real positivo de todos os itens marcados.");
      return;
    }
    setFinishing(true);
    const { data, error } = await supabase.rpc("complete_purchase", {
      p_shopping_list_id: list.id,
      p_actual_prices: prices,
    });
    setFinishing(false);
    if (error) { setMessage(`Não foi possível finalizar a compra: ${error.message}`); return; }
    const total = Number((data as Array<{ total: number }> | null)?.[0]?.total ?? actualTotal);
    setMessage(`Compra finalizada em ${money(total)}. Uma nova lista poderá ser criada para a próxima compra.`);
    await load();
  }

  const checkedItems = list?.shopping_list_items.filter(item => item.checked) ?? [];
  const actualTotal = checkedItems.reduce((sum, item) => sum + Number(item.quantity) * Number(actualPrices[item.id] || 0), 0);
  const budget = Number(list?.budget ?? 0);
  const difference = budget - actualTotal;
  const locationMap = useMemo(() => new Map(locations.map(row => [row.id, row])), [locations]);
  const storeMap = useMemo(() => new Map(stores.map(row => [row.id, row])), [stores]);

  function marketName(locationId: string | null) {
    if (!locationId) return "Mercado não informado";
    const location = locationMap.get(locationId);
    if (!location) return "Mercado";
    return `${storeMap.get(location.store_id)?.name ?? "Mercado"} · ${location.label || location.city}`;
  }

  if (loading) return <section className="card purchase-card"><p>Carregando modo de compra…</p></section>;

  return <section className="card purchase-card">
    <div className="section-title"><div><span className="badge">Sprint 4</span><h2>Modo compra</h2><p>Marque o que entrou no carrinho, informe o preço real e feche a compra com total determinístico.</p></div></div>
    {message && <div className="notice" role="status">{message}</div>}

    {!list ? <div className="empty">Nenhuma compra ativa. Na lista de compras, clique em “Começar compra” para iniciar uma nova ida ao mercado.</div> : <>
      <div className="purchase-summary">
        <div><span>Mercado</span><strong>{marketName(list.selected_store_location_id)}</strong></div>
        <div><span>Total real</span><strong>{money(actualTotal)}</strong></div>
        <div><span>Saldo do orçamento</span><strong className={list.budget != null && difference < 0 ? "negative" : ""}>{list.budget == null ? "—" : money(difference)}</strong></div>
      </div>

      <div className="purchase-items">{list.shopping_list_items.map(item => <article className={`purchase-item ${item.checked ? "checked" : ""}`} key={item.id}>
        <button className="check-button" type="button" onClick={() => toggleChecked(item)} aria-label={item.checked ? "Desmarcar comprado" : "Marcar comprado"}>{item.checked ? "✓" : "○"}</button>
        <div className="product-main"><strong>{item.products?.name ?? "Produto"}</strong><span>{item.products?.brand || "Sem marca"} · {item.quantity} {item.unit ?? "un"}</span></div>
        <label className="actual-price">Preço real por embalagem (R$)<input type="number" min="0.01" step="0.01" value={actualPrices[item.id] ?? ""} onChange={event => setActualPrices(current => ({ ...current, [item.id]: event.target.value }))} placeholder="0,00" /></label>
        <strong className="item-price">{item.checked && Number(actualPrices[item.id]) > 0 ? money(Number(item.quantity) * Number(actualPrices[item.id])) : "—"}</strong>
      </article>)}</div>

      <button className="button finish-purchase" type="button" disabled={finishing} onClick={finishPurchase}>{finishing ? "Finalizando…" : "Finalizar compra"}</button>
    </>}

    <div className="purchase-history"><h3>Histórico de compras</h3>{history.length === 0 ? <div className="empty">Nenhuma compra finalizada ainda.</div> : history.map(purchase => <article className="history-card" key={purchase.id}>
      <div className="history-head"><div><strong>{marketName(purchase.store_location_id)}</strong><span>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(purchase.purchased_at))}</span></div><b>{money(Number(purchase.total))}</b></div>
      <div className="history-items">{purchase.purchase_items.map(item => <span key={item.id}>{item.products?.name ?? "Produto"}: {item.quantity} × {money(Number(item.unit_price))} = <b>{money(Number(item.total_price))}</b></span>)}</div>
    </article>)}</div>
  </section>;
}
