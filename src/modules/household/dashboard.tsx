"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_UNITS, type HouseholdProduct, type InventoryStatus, type ProductUnit, type ShoppingProfile } from "./types";

const statusLabel: Record<InventoryStatus, string> = { in_stock: "Em casa", low: "Acabando", out: "Acabou" };

export function HouseholdDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [houseName, setHouseName] = useState("Minha Casa");
  const [city, setCity] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [shoppingProfile, setShoppingProfile] = useState<ShoppingProfile>("balanced");
  const [products, setProducts] = useState<HouseholdProduct[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: profile, error: profileError } = await supabase.from("user_profiles").select("household_id,city,display_name,shopping_profile").single();
    if (profileError || !profile?.household_id) { setMessage("Não foi possível carregar seu perfil."); setLoading(false); return; }
    setHouseholdId(profile.household_id);
    setCity(profile.city ?? "");
    setDisplayName(profile.display_name ?? "");
    setShoppingProfile(profile.shopping_profile as ShoppingProfile);
    const [{ data: house }, { data: productRows, error: productsError }] = await Promise.all([
      supabase.from("households").select("name,city").eq("id", profile.household_id).single(),
      supabase.from("products").select("id,name,brand,package_quantity,package_unit,locked,inventory_items(id,registered_quantity,estimated_quantity,unit,status)").eq("household_id", profile.household_id).order("name"),
    ]);
    if (house) { setHouseName(house.name); if (!profile.city) setCity(house.city ?? ""); }
    if (productsError) setMessage("Não foi possível carregar os produtos."); else setProducts((productRows ?? []) as HouseholdProduct[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  async function saveHouse(event: FormEvent) {
    event.preventDefault(); if (!householdId) return;
    const cleanCity = city.trim();
    const { error: houseError } = await supabase.from("households").update({ name: houseName.trim() || "Minha Casa", city: cleanCity || null }).eq("id", householdId);
    const { error: profileError } = await supabase.from("user_profiles").update({ display_name: displayName.trim() || null, city: cleanCity || null, shopping_profile: shoppingProfile }).eq("household_id", householdId);
    setMessage(houseError || profileError ? "Não foi possível salvar seus dados." : "Casa e preferências salvas.");
  }

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!householdId) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("name") ?? "").trim();
    const brand = String(form.get("brand") ?? "").trim();
    const unit = String(form.get("unit") ?? "unit") as ProductUnit;
    const packageQuantity = Number(form.get("packageQuantity") ?? 1);
    const stock = Number(form.get("stock") ?? 0);
    if (!name || packageQuantity <= 0 || stock < 0) { setMessage("Revise nome e quantidades do produto."); return; }

    const { data: product, error } = await supabase.from("products").insert({ household_id: householdId, name, brand: brand || null, package_quantity: packageQuantity, package_unit: unit }).select("id,name,brand,package_quantity,package_unit,locked").single();
    if (error || !product) { setMessage("Não foi possível cadastrar o produto."); return; }

    const { data: inventory, error: inventoryError } = await supabase.from("inventory_items").insert({ household_id: householdId, product_id: product.id, registered_quantity: stock, estimated_quantity: stock, unit }).select("id,registered_quantity,estimated_quantity,unit,status").single();
    if (inventoryError || !inventory) { await supabase.from("products").delete().eq("id", product.id); setMessage("Não foi possível criar o estoque do produto."); return; }

    const newProduct = { ...product, inventory_items: [inventory] } as HouseholdProduct;
    setProducts(current => [...current, newProduct].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
    formElement.reset();
    setMessage("Produto adicionado à Minha Casa.");
  }

  async function changeStock(product: HouseholdProduct, delta: number) {
    const inventory = product.inventory_items[0]; if (!inventory) return;
    const previous = Number(inventory.registered_quantity);
    const next = Math.max(0, previous + delta);
    const nextStatus: InventoryStatus = next <= 0 ? "out" : inventory.status === "out" ? "in_stock" : inventory.status;

    setProducts(current => current.map(item => item.id === product.id ? { ...item, inventory_items: [{ ...inventory, registered_quantity: next, estimated_quantity: next, status: nextStatus }] } : item));
    const { error } = await supabase.from("inventory_items").update({ registered_quantity: next, estimated_quantity: next }).eq("id", inventory.id);
    if (error) {
      setProducts(current => current.map(item => item.id === product.id ? product : item));
      setMessage("Não foi possível alterar o estoque.");
      return;
    }
    setMessage("Estoque atualizado.");
  }

  async function setStatus(product: HouseholdProduct, status: InventoryStatus) {
    const inventory = product.inventory_items[0]; if (!inventory) return;
    const nextInventory = status === "out" ? { ...inventory, status, registered_quantity: 0, estimated_quantity: 0 } : { ...inventory, status };
    setProducts(current => current.map(item => item.id === product.id ? { ...item, inventory_items: [nextInventory] } : item));
    const patch = status === "out" ? { status, registered_quantity: 0, estimated_quantity: 0 } : { status };
    const { error } = await supabase.from("inventory_items").update(patch).eq("id", inventory.id);
    if (error) {
      setProducts(current => current.map(item => item.id === product.id ? product : item));
      setMessage("Não foi possível alterar o status.");
      return;
    }
    setMessage("Status atualizado.");
  }

  async function removeProduct(product: HouseholdProduct) {
    if (!window.confirm(`Remover ${product.name} da sua casa?`)) return;
    setProducts(current => current.filter(item => item.id !== product.id));
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      setProducts(current => [...current, product].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
      setMessage("Não foi possível remover o produto.");
      return;
    }
    setMessage("Produto removido.");
  }

  async function signOut() { await supabase.auth.signOut(); window.location.href = "/login"; }

  if (loading) return <main className="app-shell"><p>Carregando Minha Casa…</p></main>;

  return <main className="app-shell"><header className="topbar"><div><span className="badge">Sprint 1</span><h1>Minha Casa</h1><p>Produtos e estoque que realmente existem na sua casa.</p></div><button className="button secondary" onClick={signOut}>Sair</button></header>{message && <div className="notice" role="status">{message}</div>}<section className="grid two"><form className="card" onSubmit={saveHouse}><h2>Perfil da casa</h2><label>Seu nome<input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Como quer ser chamado" /></label><label>Nome da casa<input value={houseName} onChange={e=>setHouseName(e.target.value)} /></label><label>Cidade<input value={city} onChange={e=>setCity(e.target.value)} placeholder="Ex.: Goiânia" /></label><label>Perfil de compra<select value={shoppingProfile} onChange={e=>setShoppingProfile(e.target.value as ShoppingProfile)}><option value="economic">Econômico</option><option value="balanced">Equilibrado</option><option value="practical">Prático</option></select></label><button className="button" type="submit">Salvar</button></form><form className="card" onSubmit={addProduct}><h2>Adicionar produto</h2><label>Produto<input name="name" required placeholder="Arroz" /></label><label>Marca<input name="brand" placeholder="Opcional" /></label><div className="row"><label>Embalagem<input name="packageQuantity" type="number" min="0.001" step="0.001" defaultValue="1" required /></label><label>Unidade<select name="unit" defaultValue="unit">{PRODUCT_UNITS.map(unit=><option key={unit} value={unit}>{unit}</option>)}</select></label></div><label>Quantidade em casa<input name="stock" type="number" min="0" step="0.001" defaultValue="0" required /></label><button className="button" type="submit">Adicionar à casa</button></form></section><section className="card inventory"><div className="section-title"><div><h2>Estoque</h2><p>{products.length} produto(s) cadastrado(s)</p></div></div>{products.length===0 ? <div className="empty">Sua casa ainda está vazia. Cadastre o primeiro produto acima.</div> : <div className="product-list">{products.map(product=>{const inv=product.inventory_items[0]; return <article className="product" key={product.id}><div className="product-main"><strong>{product.name}</strong><span>{product.brand || "Sem marca"} · {product.package_quantity ?? "—"} {product.package_unit ?? ""}</span></div><div className="stock"><button onClick={()=>changeStock(product,-1)} aria-label={`Diminuir ${product.name}`}>−</button><b>{inv?.registered_quantity ?? 0} {inv?.unit ?? ""}</b><button onClick={()=>changeStock(product,1)} aria-label={`Aumentar ${product.name}`}>+</button></div><select className={`status ${inv?.status ?? "out"}`} value={inv?.status ?? "out"} onChange={e=>setStatus(product,e.target.value as InventoryStatus)}>{Object.entries(statusLabel).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button className="danger-link" onClick={()=>removeProduct(product)}>Remover</button></article>})}</div>}</section></main>;
}
