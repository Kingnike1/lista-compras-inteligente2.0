"use client";

import { useEffect, useRef, useState } from "react";

type TutorialProps = {
  storageScope: string;
  autoOpen?: boolean;
  compact?: boolean;
};

type TutorialState = {
  completed: boolean;
  dismissed: boolean;
};

const steps = [
  {
    eyebrow: "Passo 1 de 4 · Minha Casa",
    title: "Comece pelo retrato da sua casa",
    description: "Defina seu nome, a cidade e o perfil de compra. Isso deixa a experiência mais pessoal e ajuda a organizar mercados e recomendações.",
    tip: "Você pode alterar essas informações a qualquer momento.",
  },
  {
    eyebrow: "Passo 2 de 4 · Estoque",
    title: "Registre o que você já tem",
    description: "Cadastre produtos, informe a embalagem e quantas embalagens existem em casa. Use + e − para atualizar rapidamente.",
    tip: "Ao marcar um produto como Acabou, o estoque vai para zero e ele pode entrar nas recomendações de reposição.",
  },
  {
    eyebrow: "Passo 3 de 4 · Lista",
    title: "Monte a próxima compra",
    description: "Adicione os produtos à lista, informe quantidade e orçamento. O sistema calcula o total previsto e ajuda a acompanhar o saldo.",
    tip: "Se um produto já estiver na lista, a quantidade pode ser atualizada sem criar uma duplicação incoerente.",
  },
  {
    eyebrow: "Passo 4 de 4 · Mercados e compra",
    title: "Compare e finalize com confiança",
    description: "Registre preços reais por filial, escolha o mercado e use o Modo compra para informar os preços reais e finalizar a compra.",
    tip: "Preços ausentes nunca são inventados. A comparação só usa os dados que realmente existem.",
  },
] as const;

export function Tutorial({ storageScope, autoOpen = false, compact = false }: TutorialProps) {
  const storageKey = `lista-compras-inteligente:tutorial:v2:${storageScope}`;
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<TutorialState>({ completed: false, dismissed: false });
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<TutorialState>;
        const next = { completed: Boolean(parsed.completed), dismissed: Boolean(parsed.dismissed) };
        setState(next);
        setOpen(autoOpen && !next.completed && !next.dismissed);
      } else {
        setOpen(autoOpen);
      }
    } catch {
      setOpen(autoOpen);
    } finally {
      setHydrated(true);
    }
  }, [autoOpen, storageKey]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => dialogRef.current?.focus());
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function persist(next: TutorialState) {
    setState(next);
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  }

  function close(markDismissed: boolean) {
    if (markDismissed) persist({ ...state, dismissed: true });
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function nextStep() {
    if (step < steps.length - 1) {
      setStep(current => current + 1);
      return;
    }
    persist({ completed: true, dismissed: false });
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function reopen() {
    setStep(0);
    setOpen(true);
  }

  if (!hydrated) return null;

  return <>
    <button ref={triggerRef} className={`tutorial-trigger ${compact ? "tutorial-trigger-compact" : ""}`} type="button" onClick={reopen} aria-haspopup="dialog">
      <span aria-hidden="true">?</span><span>{compact ? "Ajuda" : "Como funciona"}</span>
    </button>
    {open && <div className="tutorial-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close(false); }}>
      <section ref={dialogRef} className="tutorial-dialog" role="dialog" aria-modal="true" aria-labelledby="tutorial-title" aria-describedby="tutorial-description" tabIndex={-1}>
        <div className="tutorial-progress" aria-label={`Passo ${step + 1} de ${steps.length}`}>{steps.map((_, index) => <span key={index} className={index <= step ? "is-active" : ""} />)}</div>
        <div className="tutorial-dialog-header"><span className="badge">Guia de primeiros passos</span><button className="tutorial-close" type="button" onClick={() => close(false)} aria-label="Fechar guia">×</button></div>
        <p className="tutorial-eyebrow">{steps[step].eyebrow}</p>
        <h2 id="tutorial-title">{steps[step].title}</h2>
        <p id="tutorial-description" className="tutorial-description">{steps[step].description}</p>
        <div className="tutorial-tip"><strong>Dica</strong><span>{steps[step].tip}</span></div>
        <div className="tutorial-actions"><button className="button secondary" type="button" onClick={() => close(true)}>Não mostrar automaticamente</button><div className="tutorial-step-actions">{step > 0 && <button className="button secondary" type="button" onClick={() => setStep(current => current - 1)}>Voltar</button>}<button className="button" type="button" onClick={nextStep}>{step === steps.length - 1 ? "Concluir guia" : "Próximo"}</button></div></div>
        <p className="tutorial-footer">Você pode abrir este guia novamente pelo botão Ajuda.</p>
      </section>
    </div>}
  </>;
}
