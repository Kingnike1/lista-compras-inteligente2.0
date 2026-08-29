"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HouseholdProduct, ShoppingProfile } from "@/modules/household/types";

const priorityByStatus = { out: "essential", low: "necessary", in_stock: "optional" } as const;

function suggestedQuantity(status: HouseholdProduct["inventory_items"][number]["status"], profile: ShoppingProfile) {
  if (status === "out") return profile === "economic" ? 1 : profile === "practical" ? 3 : 2;
  if (status === "low") return profile === "practical" ? 2 : 1;
  return 0;
}

export function RecommendationPanel({ householdId, products, shoppingProfile }: { householdId: string; products: HouseholdProduct[]; shoppingProfile: ShoppingProfile }) {
  const supabase = useMemo(() => createClient(), []);
  const [purchaseCounts, setPurchaseCounts] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");

  const loadHistory = useCallback(async () => {
    const { data: purchases } = await supabase.from("purchases").select("id").eq("household_id", householdId).order("purchased_at", { ascending: false }).limit(10);
    const ids = (purchases ?? []).map(item => item.id);
    if (!ids.length) { setPurchaseCounts({}); return; }
    const { data: items } = await supabase.from("purchase_items").select("product_id").in("purchase_id", ids);
    const counts: Record<string, number> = {};
    for (const item of items ?? []) counts[item.product_id] = (counts[item.product_id] ?? 0) + 1;
    setPurchaseCounts(counts);
  }, [householdId, supabase]);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

  const recommendations = useMemo(() => products.map(product => {
    const inventory = product.inventory_items[0];
    const status = inventory?.status ?? "out";
    const stock = Number(inventory?.registered_quantity ?? 0);
    const history = purchaseCounts[product.id] ?? 0;
    const quantity = suggestedQuantity(status, shoppingProfile);
    const reasons: string[] = [];
    if (status === "out" || stock <= 0) reasons.push("acabou em casa");
    else if (status === "low") reasons.push("estoque acabando");
    if (history >= 2) reasons.push(`comprado ${history} vezes recentemente`);
    if (shoppingProfile === "economic") reasons.push("perfil econômico: quantidade conservadora");
    if (shoppingProfile === "practical" && status !== "in_stock") reasons.push("perfil prático: pequena reserva sugerida");
    return { product, status, history, quantity, reasons };
  }).filter(item => item.quantity > 0).sort((a, b) => Number(a.status !== "out") - Number(b.status !== "out") || b.history - a.history), [products, purchaseCounts, shoppingProfile]);

  async function addToList(product: HouseholdProduct, quantity: number) {
    setMessage("");
    let { data: list } = await supabase.from("shopping_lists").select("id,status").eq("household_id", householdId).in("status", ["draft", "active"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!list) {
      const created = await supabase.from("shopping_lists").insert({ household_id: householdId, status: "draft" }).select("id,status").single();
      if (created.error || !created.data) { setMessage("Não foi possível preparar a lista de compras."); return; }
      list = created.data;
    }
    const existing = await supabase.from("shopping_list_items").select("id,quantity").eq("shopping_list_id", list.id).eq("product_id", product.id).maybeSingle();
    const priority = priorityByStatus[product.inventory_items[0]?.status ?? "out"];
    if (existing.data) {
      const { error } = await supabase.from("shopping_list_items").update({ quantity: Math.max(Number(existing.data.quantity), quantity), priority }).eq("id", existing.data.id);
      setMessage(error ? "Não foi possível atualizar a sugestão na lista." : `${product.name} atualizado na lista.`);
      return;
    }
    const { error } = await supabase.from("shopping_list_items").insert({ shopping_list_id: list.id, product_id: product.id, quantity, unit: "package", priority });
    setMessage(error ? "Não foi possível adicionar a sugestão." : `${product.name} adicionado à lista.`);
  }

  return <section className="card recommendation-card">
    <div className="section-title"><div><h2>Recomendações inteligentes</h2><p>Sugestões determinísticas pelo estoque, perfil da casa e histórico. Nada é adicionado sem sua confirmação.</p></div></div>
    {message && <div className="notice" role="status">{message}</div>}
    {recommendations.length === 0 ? <div className="empty">Nenhuma reposição necessária agora. Seu estoque está em dia.</div> : <div className="recommendation-list">{recommendations.map(({ product, quantity, reasons }) => <article className="recommendation" key={product.id}><div className="product-main"><strong>{product.name}</strong><span>{product.brand || "Sem marca"} · embalagem de {product.package_quantity ?? 1} {product.package_unit ?? "unidade"}</span><small>{reasons.join(" · ")}</small></div><div className="recommendation-action"><b>{quantity} {quantity === 1 ? "embalagem" : "embalagens"}</b><button className="button" type="button" onClick={() => addToList(product, quantity)}>Adicionar à lista</button></div></article>)}</div>}
  </section>;
}
