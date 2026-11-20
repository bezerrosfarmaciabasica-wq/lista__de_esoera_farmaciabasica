"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { INSUMOS, INSUMO_LABEL, Paciente } from "@/lib/constants";

export default function DashboardPage() {
  const [dados, setDados] = useState<Paciente[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.from("pacientes").select("*").then(({ data, error }) => {
      if (error) setErro("Não foi possível carregar os dados. Confira se o script SQL foi executado no Supabase.");
      else setDados((data as Paciente[]) ?? []);
      setCarregando(false);
    });
  }, []);

  const m = useMemo(() => {
    const espera = dados.filter((p) => p.status === "Aguardando");
    const entregues = dados.filter((p) => p.status === "Entregue");
    const porInsumo = INSUMOS.map((i) => ({
      insumo: i,
      espera: espera.filter((p) => p.tipo_insumo === i).length,
      entregues: entregues.filter((p) => p.tipo_insumo === i).length,
      p1: espera.filter((p) => p.tipo_insumo === i && p.prioridade === 1).length,
    }));
    const diab = (t: string) => espera.filter((p) => p.tipo_diabetes === t).length;
    const mesAtual = new Date().toISOString().slice(0, 7);
    const entreguesMes = entregues.filter((p) => p.entregue_em?.slice(0, 7) === mesAtual).length;
    const unidades = Object.entries(
      espera.reduce<Record<string, number>>((acc, p) => ((acc[p.unidade_saude] = (acc[p.unidade_saude] || 0) + 1), acc), {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { espera: espera.length, entregues: entregues.length, entreguesMes, porInsumo, t1: diab("Tipo I"), t2: diab("Tipo II"), unidades };
  }, [dados]);

  if (carregando) return <p className="text-emerald-100/70">Carregando indicadores...</p>;
  if (erro) return <p role="alert" className="rounded-lg bg-red-500/10 p-4 text-red-200">{erro}</p>;

  const maxUn = Math.max(1, ...m.unidades.map((u) => u[1]));
  const totalDiab = Math.max(1, m.t1 + m.t2);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-emerald-100/70">Situação atual das listas de espera</p>
        </div>
        <Link href="/lista" className="btn-ouro">Abrir lista de espera</Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Totais">
        <div className="painel border-ouro-500/40">
          <p className="text-sm text-emerald-100/70">Aguardando insumo</p>
          <p className="mt-1 text-4xl font-bold text-ouro-400">{m.espera}</p>
        </div>
        <div className="painel">
          <p className="text-sm text-emerald-100/70">Entregues (total)</p>
          <p className="mt-1 text-4xl font-bold text-esmeralda-400">{m.entregues}</p>
        </div>
        <div className="painel">
          <p className="text-sm text-emerald-100/70">Entregues neste mês</p>
          <p className="mt-1 text-4xl font-bold text-white">{m.entreguesMes}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Por insumo">
        {m.porInsumo.map((x) => (
          <div key={x.insumo} className="painel">
            <h2 className="font-semibold text-white">{INSUMO_LABEL[x.insumo]}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-emerald-100/70">Em espera</dt><dd className="font-bold text-ouro-400">{x.espera}</dd></div>
              <div className="flex justify-between"><dt className="text-emerald-100/70">Prioridade 1 em espera</dt><dd className="font-semibold">{x.p1}</dd></div>
              <div className="flex justify-between"><dt className="text-emerald-100/70">Entregues</dt><dd className="font-semibold text-esmeralda-400">{x.entregues}</dd></div>
            </dl>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="painel">
          <h2 className="font-semibold text-white">Em espera por tipo de diabetes</h2>
          <div className="mt-4 space-y-3 text-sm">
            {[["Tipo I", m.t1], ["Tipo II", m.t2]].map(([nome, n]) => (
              <div key={nome as string}>
                <div className="mb-1 flex justify-between"><span>{nome}</span><span className="font-semibold">{n as number}</span></div>
                <div className="h-2.5 rounded-full bg-floresta-800"><div className="h-2.5 rounded-full bg-esmeralda-500" style={{ width: `${((n as number) / totalDiab) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="painel">
          <h2 className="font-semibold text-white">Unidades de saúde com mais pessoas em espera</h2>
          {m.unidades.length === 0 ? (
            <p className="mt-4 text-sm text-emerald-100/70">Nenhum cadastro aguardando.</p>
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              {m.unidades.map(([nome, n]) => (
                <div key={nome}>
                  <div className="mb-1 flex justify-between gap-2"><span className="truncate">{nome}</span><span className="font-semibold">{n}</span></div>
                  <div className="h-2.5 rounded-full bg-floresta-800"><div className="h-2.5 rounded-full bg-ouro-500" style={{ width: `${(n / maxUn) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
