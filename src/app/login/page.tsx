"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/`,
      },
    });
  }

  return (
    <main>
      <h1>Entrar</h1>
      <p>Use sua conta Google para acessar sua casa e suas compras.</p>
      <button type="button" onClick={signInWithGoogle}>
        Continuar com Google
      </button>
    </main>
  );
}
