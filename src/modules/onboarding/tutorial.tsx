"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "lista-compras-inteligente:tutorial:v1";

const steps = [
  {
    eyebrow: "Passo 1 de 4 · Minha Casa",
    title: "Comece pelo retrato da sua casa",
    description:
      "Informe seu nome, o nome da casa e a cidade. Esses dados deixam a experiência mais pessoal e ajudam a filtrar mercados e filiais próximas.",
    tip: "Você pode alterar essas informações a qualquer momento na área Casa.",
    target: "Perfil da casa",
  },
  {
    eyebrow: "Passo 2 de 4 · Estoque",
    title: "Registre o que você já tem",
    description:
      "Cadastre produtos como Arroz e Feijão, informe a embalagem e a quantidade atual. Use + e − para manter o estoque atualizado.",
    tip: "Quando um produto acabar, marque “Acabou”. A quantidade será zerada para evitar confusão.",
    target: "Estoque",
  },
  {
    eyebrow: "Passo 3 de 4 · Lista de compras",
    title: "Monte a próxima compra",
    description:
      "Adicione produtos à lista, defina quantidade, prioridade, preço previsto e orçamento. O sistema calcula o total e o saldo automaticamente.",
    tip: "Se você adicionar um produto que já está na lista, a quantidade é somada em vez de criar uma duplicata.",
    target: "Lista de compras",
  },
  {
    eyebrow: "Passo 4 de 4 · Mercados",
    title: "Compare preços reais por filial",
    description:
      "Cadastre mercados, registre preços observados e escolha onde fazer a compra. Preços ausentes ou vencidos não são inventados.",
    tip: "Prefira comparações com cobertura completa: só elas podem ser identificadas como a opção mais barata.",
    target: "Preços e mercados",
  },
] as const;

type TutorialState = {
  dismissed: boolean;
  completed: number[];
};

const emptyState: TutorialState = { dismissed: false, completed: [] };

export function Tutorial({ compact = false }: { compact?: boolean }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<TutorialState>(emptyState);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<TutorialState>;
        const nextState = {
          dismissed: Boolean(parsed.dismissed),
          completed: Array.isArray(parsed.completed) ? parsed.completed.filter(Number.isInteger) : [],
        };
        setState(nextState);
        setOpen(!nextState.dismissed);
      } else {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    } finally {
      setHydrated(true);
    }
  }, []);

  function persist(nextState: TutorialState) {
    setState(nextState);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // O tutor continua funcionando mesmo se o navegador bloquear o armazenamento local.
    }
  }

  function closeTutorial() {
    persist({ ...state, dismissed: true });
    setOpen(false);
  }

  function completeCurrentStep() {
    const completed = Array.from(new Set([...state.completed, step]));
    const nextState = { ...state, completed };
    persist(nextState);
    if (step < steps.length - 1) {
      setStep(current => current + 1);
    } else {
      const finishedState = { ...nextState, dismissed: true };
      persist(finishedState);
      setOpen(false);
    }
  }

  function reopenTutorial() {
    setStep(0);
    setOpen(true);
    persist({ ...state, dismissed: false });
  }

  if (!hydrated) return null;

  return (
    <>
      <button className={`tutorial-trigger ${compact ? "tutorial-trigger-compact" : ""}`} type="button" onClick={reopenTutorial} aria-label="Abrir guia de primeiros passos">
        <span aria-hidden="true">?</span>
        <span>{compact ? "Ajuda" : "Como funciona"}</span>
      </button>

      {open && (
        <div className="tutorial-backdrop" role="presentation">
          <section className="tutorial-dialog" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
            <div className="tutorial-progress" aria-label={`Progresso: ${step + 1} de ${steps.length}`}>
              {steps.map((item, index) => (
                <span key={item.target} className={index <= step ? "is-active" : ""} />
              ))}
            </div>
            <div className="tutorial-dialog-header">
              <span className="badge">Guia de primeiros passos</span>
              <button className="icon-button" type="button" onClick={closeTutorial} aria-label="Fechar guia">×</button>
            </div>
            <p className="tutorial-eyebrow">{steps[step].eyebrow}</p>
            <h2 id="tutorial-title">{steps[step].title}</h2>
            <p className="tutorial-description">{steps[step].description}</p>
            <div className="tutorial-tip"><strong>Dica</strong><span>{steps[step].tip}</span></div>
            <div className="tutorial-target"><span className="tutorial-target-dot" aria-hidden="true" />Você vai encontrar isso em <strong>{steps[step].target}</strong></div>
            <div className="tutorial-actions">
              <button className="button secondary" type="button" onClick={closeTutorial}>Pular por enquanto</button>
              <div className="tutorial-step-actions">
                {step > 0 && <button className="button secondary" type="button" onClick={() => setStep(current => current - 1)}>Voltar</button>}
                <button className="button" type="button" onClick={completeCurrentStep}>{step === steps.length - 1 ? "Concluir guia" : "Próximo passo"}</button>
              </div>
            </div>
            <p className="tutorial-footer">Você poderá abrir este guia novamente pelo botão “Como funciona”.</p>
          </section>
        </div>
      )}
    </>
  );
}
