"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HouseholdProduct } from "@/modules/household/types";

type Store = { id: string; name: string };
type StoreLocation = { id: string; store_id: string; city: string; label: string | null; address: string | null };
type PriceRow = { id: string; product_id: string; store_location_id: string; price: number; observed_at: string; valid_until: string };
type ListItem = { product_id: string; quantity: number };
type ActiveList = { id: string; selected_store_location_id: string | null };

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function PricingPanel({ householdId, products, city }: { householdId: string; products: HouseholdProduct[]; city: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [stores, setStores] = useState<Store[]>([]);
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [list, setList] = useState<ActiveList | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const productIds = products.map(product => product.id);
    const [{ data: storeRows, error: storeError }, { data: locationRows, error: locationError }, { data: listRow, error: listError }] = await Promise.all([
      supabase.from("stores").select("id,name").order("name"),
      city.trim()
        ? supabase.from("store_locations").select("id,store_id,city,label,address").eq("city", city.trim()).order("label")
        : supabase.from("store_locations").select("id,store_id,city,label,address").order("city"),
      supabase.from("shopping_lists").select("id,selected_store_location_id").eq("household_id", householdId).in("status", ["draft", "active"]).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (storeError || locationError || listError) {
      setMessage("Não foi possível carregar os preços e mercados.");
      setLoading(false);
      return;
    }

    setStores((storeRows ?? []) as Store[]);
    setLocations((locationRows ?? []) as StoreLocation[]);
    setList((listRow as ActiveList | null) ?? null);

    if (listRow?.id) {
      const { data: itemRows } = await supabase.from("shopping_list_items").select("product_id,quantity").eq("shopping_list_id", listRow.id);
      setItems((itemRows ?? []) as ListItem[]);
    } else {
      setItems([]);
    }

    if (productIds.length > 0) {
      const now = new Date().toISOString();
      const { data: priceRows, error: priceError } = await supabase
        .from("prices")
        .select("id,product_id,store_location_id,price,observed_at,valid_until")
        .in("product_id", productIds)
        .gte("valid_until", now)
        .order("observed_at", { ascending: false });
      if (priceError) setMessage("Não foi possível carregar os preços válidos.");
      setPrices((priceRows ?? []) as PriceRow[]);
    } else {
      setPrices([]);
    }
    setLoading(false);
  }, [city, householdId, products, supabase]);

  useEffect(() => { void load(); }, [load]);

  async function addMarket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("marketName") ?? "").trim();
    const marketCity = String(form.get("marketCity") ?? "").trim();
    const label = String(form.get("label") ?? "").trim();
    const address = String(form.get("address") ?? "").trim();
    if (!name || !marketCity) { setMessage("Informe o mercado e a cidade da filial."); return; }

    let storeId = stores.find(store => store.name.localeCompare(name, "pt-BR", { sensitivity: "base" }) === 0)?.id;
    if (!storeId) {
      const { data: store, error } = await supabase.from("stores").insert({ name }).select("id,name").single();
      if (error || !store) { setMessage("Não foi possível cadastrar o mercado."); return; }
      storeId = store.id;
    }

    const { error: locationError } = await supabase.from("store_locations").insert({ store_id: storeId, city: marketCity, label: label || null, address: address || null });
    if (locationError) { setMessage("Não foi possível cadastrar a filial."); return; }
    formElement.reset();
    setMessage("Mercado e filial cadastrados.");
    await load();
  }

  async function addPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const productId = String(form.get("productId") ?? "");
    const locationId = String(form.get("locationId") ?? "");
    const price = Number(form.get("price") ?? -1);
    if (!productId || !locationId || price < 0) { setMessage("Revise produto, filial e preço."); return; }

    const product = products.find(item => item.id === productId);
    const packageQuantity = Number(product?.package_quantity ?? 0);
    const unitPrice = packageQuantity > 0 ? price / packageQuantity : null;
    const observedAt = new Date();
    const validUntil = new Date(observedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const { error } = await supabase.from("prices").insert({
      product_id: productId,
      store_location_id: locationId,
      price,
      unit_price: unitPrice,
      source_type: "manual",
      confidence: 1,
      observed_at: observedAt.toISOString(),
      valid_until: validUntil.toISOString(),
    });
    if (error) { setMessage("Não foi possível registrar o preço."); return; }
    formElement.reset();
    setMessage("Preço registrado e válido por 7 dias.");
    await load();
  }

  async function chooseMarket(locationId: string) {
    if (!list) { setMessage("Crie uma lista de compras antes de escolher o mercado."); return; }
    const { error } = await supabase.from("shopping_lists").update({ selected_store_location_id: locationId }).eq("id", list.id);
    if (error) { setMessage("Não foi possível selecionar esse mercado."); return; }
    setList(current => current ? { ...current, selected_store_location_id: locationId } : current);
    setMessage("Mercado selecionado para esta compra.");
  }

  const storeMap = useMemo(() => new Map(stores.map(store => [store.id, store])), [stores]);
  const latestByLocationProduct = useMemo(() => {
    const map = new Map<string, PriceRow>();
    for (const row of prices) {
      const key = `${row.store_location_id}:${row.product_id}`;
      if (!map.has(key)) map.set(key, row);
    }
    return map;
  }, [prices]);

  const comparison = useMemo(() => locations.map(location => {
    let total = 0;
    let covered = 0;
    for (const item of items) {
      const row = latestByLocationProduct.get(`${location.id}:${item.product_id}`);
      if (!row) continue;
      covered += 1;
      total += Number(row.price) * Number(item.quantity);
    }
    return { location, total, covered, complete: items.length > 0 && covered === items.length };
  }).filter(row => row.covered > 0).sort((a, b) => {
    if (a.complete !== b.complete) return a.complete ? -1 : 1;
    if (a.covered !== b.covered) return b.covered - a.covered;
    return a.total - b.total;
  }), [items, latestByLocationProduct, locations]);

  const latestPrices = useMemo(() => products.map(product => {
    const rows = locations.map(location => ({ location, row: latestByLocationProduct.get(`${location.id}:${product.id}`) })).filter(entry => entry.row);
    return { product, rows };
  }).filter(entry => entry.rows.length > 0), [latestByLocationProduct, locations, products]);

  if (loading) return <section className="card pricing-card"><p>Carregando preços…</p></section>;

  return <section className="card pricing-card">
    <div className="section-title"><div><span className="badge">Sprint 3</span><h2>Preços e mercados</h2><p>Compare preços reais por filial. Valores manuais expiram em 7 dias.</p></div></div>
    {message && <div className="notice" role="status">{message}</div>}
    <div className="grid two pricing-forms">
      <form onSubmit={addMarket}><h3>Cadastrar mercado</h3><label>Mercado<input name="marketName" required placeholder="Ex.: Atacadão" /></label><div className="row"><label>Cidade<input name="marketCity" required defaultValue={city} placeholder="Ex.: Goiânia" /></label><label>Filial<input name="label" placeholder="Ex.: Setor Bueno" /></label></div><label>Endereço<input name="address" placeholder="Opcional" /></label><button className="button" type="submit">Cadastrar filial</button></form>
      <form onSubmit={addPrice}><h3>Registrar preço</h3><label>Produto<select name="productId" required defaultValue=""><option value="" disabled>Selecione</option>{products.map(product => <option key={product.id} value={product.id}>{product.name}{product.brand ? ` · ${product.brand}` : ""}</option>)}</select></label><label>Filial<select name="locationId" required defaultValue=""><option value="" disabled>Selecione</option>{locations.map(location => <option key={location.id} value={location.id}>{storeMap.get(location.store_id)?.name ?? "Mercado"} · {location.label || location.city}</option>)}</select></label><label>Preço da embalagem (R$)<input name="price" type="number" min="0" step="0.01" required placeholder="Ex.: 24,90" /></label><button className="button" type="submit">Registrar preço</button></form>
    </div>

    <div className="pricing-section"><h3>Comparação da lista</h3>{items.length === 0 ? <div className="empty">Adicione produtos à lista de compras para comparar os mercados.</div> : comparison.length === 0 ? <div className="empty">Ainda não há preços válidos para os produtos da lista.</div> : <div className="market-grid">{comparison.map(({ location, total, covered, complete }) => { const store = storeMap.get(location.store_id); const selected = list?.selected_store_location_id === location.id; return <article className={`market-card ${selected ? "selected" : ""}`} key={location.id}><div><strong>{store?.name ?? "Mercado"}</strong><span>{location.label || location.city}{location.address ? ` · ${location.address}` : ""}</span></div><div className="market-total"><span>{complete ? "Total da lista" : `${covered}/${items.length} itens com preço`}</span><b>{money(total)}</b></div><button className={`button ${selected ? "secondary" : ""}`} type="button" onClick={() => chooseMarket(location.id)}>{selected ? "Selecionado" : "Escolher mercado"}</button></article>; })}</div>}</div>

    <div className="pricing-section"><h3>Últimos preços válidos</h3>{latestPrices.length === 0 ? <div className="empty">Nenhum preço válido registrado ainda.</div> : <div className="price-list">{latestPrices.map(({ product, rows }) => <article className="price-product" key={product.id}><div className="product-main"><strong>{product.name}</strong><span>{product.brand || "Sem marca"}</span></div><div className="price-observations">{rows.map(({ location, row }) => <span key={location.id}>{storeMap.get(location.store_id)?.name ?? "Mercado"} · {location.label || location.city}: <b>{money(Number(row!.price))}</b></span>)}</div></article>)}</div>}</div>
  </section>;
}
