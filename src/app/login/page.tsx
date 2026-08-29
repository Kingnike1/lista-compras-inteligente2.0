"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function signInWithGoogle() {
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (authError) { setError("Não foi possível iniciar o acesso com Google. Tente novamente."); setLoading(false); }
  }
  return <main className="login-shell">
    <section className="login-brand-panel">
      <div className="login-brand"><span className="brand-mark large">L</span><b>Lista Inteligente</b></div>
      <div className="login-copy"><span className="eyebrow light">COMPRAS MAIS SIMPLES</span><h1>Sua casa organizada. Sua compra mais inteligente.</h1><p>Controle o estoque, monte sua lista, compare mercados e descubra onde economizar — tudo em um só lugar.</p></div>
      <div className="benefit-row"><span>✓ Estoque organizado</span><span>✓ Lista inteligente</span><span>✓ Comparação de preços</span></div>
    </section>
    <section className="login-action-panel"><div className="login-box"><div className="mobile-login-brand"><span className="brand-mark">L</span><b>Lista Inteligente</b></div><span className="eyebrow">BEM-VINDO</span><h2>Entre na sua conta</h2><p>Use sua conta Google para acessar sua casa, listas e histórico de compras.</p>{error&&<div className="notice" role="alert">{error}</div>}<button className="google-button" type="button" onClick={signInWithGoogle} disabled={loading}><span className="google-g">G</span>{loading?"Conectando…":"Continuar com Google"}</button><small className="login-privacy">Ao continuar, você acessa apenas os dados da sua própria casa.</small></div></section>
  </main>;
}
