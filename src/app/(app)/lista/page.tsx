"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { INSUMOS, INSUMO_LABEL, Insumo, Paciente, PRIORIDADES, prioridadeLabel, Status } from "@/lib/constants";
import { fmtData, idadeEm, maskCpf, maskPhone, onlyDigits } from "@/lib/utils";
import PatientModal from "@/components/PatientModal";
import PrintSheet, { PrintConfig } from "@/components/PrintSheet";

export default function ListaPage() {
  const [dados, setDados] = useState<Paciente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [fInsumo, setFInsumo] = useState<Insumo | "">("");
  const [fPrio, setFPrio] = useState<string>(""); // "", "sem" ou número
  const [imprimirAberto, setImprimirAberto] = useState(false);
  const [cfgImp, setCfgImp] = useState<PrintConfig>({ insumo: "todos", situacao: "Ambos" });
  const [imprimindo, setImprimindo] = useState(false);
  const [fStatus, setFStatus] = useState<Status>("Aguardando");
  const [modal, setModal] = useState<{ aberto: boolean; paciente: Paciente | null }>({ aberto: false, paciente: null });

  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from("pacientes").select("*").order("criado_em", { ascending: true });
    if (error) setErro("Não foi possível carregar a lista: " + error.message);
    else {
      setErro("");
      // Fila: prioridade (sem prioridade por último) e, dentro dela, ordem de cadastro
      const ord = [...((data as Paciente[]) ?? [])].sort((a, b) => (a.prioridade ?? 99) - (b.prioridade ?? 99) || a.criado_em.localeCompare(b.criado_em));
      setDados(ord);
    }
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const qd = onlyDigits(busca);
    return dados.filter((p) => {
      if (p.status !== fStatus) return false;
      if (fInsumo && p.tipo_insumo !== fInsumo) return false;
      if (fPrio === "sem" && p.prioridade !== null) return false;
      if (fPrio && fPrio !== "sem" && p.prioridade !== Number(fPrio)) return false;
      if (!q) return true;
      return p.nome.toLowerCase().includes(q) || p.unidade_saude.toLowerCase().includes(q) ||
        (qd.length > 0 && (p.cpf.includes(qd) || p.sus.includes(qd)));
    });
  }, [dados, busca, fInsumo, fPrio, fStatus]);

  // Posição na fila: ordem de prioridade e, em seguida, ordem de cadastro, dentro de cada insumo
  const posicao = useMemo(() => {
    const m = new Map<string, number>();
    INSUMOS.forEach((i) => dados.filter((p) => p.tipo_insumo === i && p.status === "Aguardando")
      .forEach((p, idx) => m.set(p.id, idx + 1)));
    return m;
  }, [dados]);

  async function entregar(p: Paciente) {
    if (!confirm(`Confirmar entrega de ${INSUMO_LABEL[p.tipo_insumo]} para ${p.nome}?`)) return;
    const { error } = await supabase.from("pacientes").update({ status: "Entregue", entregue_em: new Date().toISOString() }).eq("id", p.id);
    if (error) alert("Erro: " + error.message); else carregar();
  }
  async function reabrir(p: Paciente) {
    if (!confirm(`Devolver ${p.nome} para a fila de espera?`)) return;
    const { error } = await supabase.from("pacientes").update({ status: "Aguardando" }).eq("id", p.id);
    if (error) alert("Erro: " + error.message); else carregar();
  }
  async function excluir(p: Paciente) {
    if (!confirm(`Excluir o cadastro de ${p.nome}? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("pacientes").delete().eq("id", p.id);
    if (error) alert("Erro: " + error.message); else carregar();
  }

  const prioOpcoes = fInsumo ? PRIORIDADES[fInsumo] : [];

  useEffect(() => {
    if (!imprimindo) return;
    const t = setTimeout(() => window.print(), 200);
    const fim = () => setImprimindo(false);
    window.addEventListener("afterprint", fim);
    return () => { clearTimeout(t); window.removeEventListener("afterprint", fim); };
  }, [imprimindo]);

  return (
    <>
    <div className="no-print space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Lista de espera</h1>
          <p className="text-sm text-emerald-100/70">{lista.length} {lista.length === 1 ? "cadastro" : "cadastros"} {fStatus === "Aguardando" ? "na fila" : "no histórico de entregas"}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-sec" onClick={() => setImprimirAberto(true)}>Imprimir listas</button>
          <button className="btn-ouro" onClick={() => setModal({ aberto: true, paciente: null })}>Adicionar usuário</button>
        </div>
      </div>

      <div className="painel grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="busca" className="rotulo">Buscar</label>
          <input id="busca" className="campo" placeholder="Nome, CPF, Cartão SUS ou unidade" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div>
          <label htmlFor="fi" className="rotulo">Insumo</label>
          <select id="fi" className="campo" value={fInsumo} onChange={(e) => { setFInsumo(e.target.value as Insumo | ""); setFPrio(""); }}>
            <option value="">Todos</option>
            {INSUMOS.map((i) => <option key={i} value={i}>{INSUMO_LABEL[i]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="fp" className="rotulo">Prioridade</label>
          <select id="fp" className="campo" value={fPrio} onChange={(e) => setFPrio(e.target.value)}>
            <option value="">Todas</option>
            <option value="sem">Sem prioridade</option>
            {prioOpcoes.map((p) => <option key={p.valor} value={p.valor}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="fs" className="rotulo">Situação</label>
          <select id="fs" className="campo" value={fStatus} onChange={(e) => setFStatus(e.target.value as Status)}>
            <option value="Aguardando">Aguardando</option>
            <option value="Entregue">Entregues (histórico)</option>
          </select>
        </div>
      </div>

      {erro && <p role="alert" className="rounded-lg bg-red-500/10 p-4 text-red-200">{erro}</p>}

      <div className="overflow-x-auto rounded-2xl border border-floresta-700">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-floresta-800 text-ouro-300">
            <tr>
              {[fStatus === "Aguardando" ? "Fila" : "Entrega", "Nome", "CPF", "Cartão SUS", "Nascimento", "Telefone", "Unidade", "Diabetes", "Insumo e prioridade", "Ações"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-floresta-700 bg-floresta-900/60">
            {carregando && <tr><td colSpan={10} className="p-6 text-center text-emerald-100/70">Carregando...</td></tr>}
            {!carregando && lista.length === 0 && (
              <tr><td colSpan={10} className="p-8 text-center text-emerald-100/70">
                {dados.length === 0 ? "Nenhum cadastro ainda. Use “Adicionar usuário” para começar." : "Nenhum cadastro encontrado com estes filtros."}
              </td></tr>
            )}
            {lista.map((p) => (
              <tr key={p.id} className="align-top hover:bg-floresta-800/60">
                <td className="px-3 py-3 font-bold text-ouro-400">{p.status === "Aguardando" ? `${posicao.get(p.id)}º` : fmtData(p.entregue_em)}</td>
                <td className="px-3 py-3 font-medium text-white">{p.nome}<span className="block text-xs font-normal text-emerald-100/60">{idadeEm(p.data_nascimento)} anos</span></td>
                <td className="whitespace-nowrap px-3 py-3">{maskCpf(p.cpf)}</td>
                <td className="whitespace-nowrap px-3 py-3">{p.sus}</td>
                <td className="whitespace-nowrap px-3 py-3">{fmtData(p.data_nascimento)}</td>
                <td className="whitespace-nowrap px-3 py-3">{maskPhone(p.telefone)}</td>
                <td className="px-3 py-3">{p.unidade_saude}</td>
                <td className="whitespace-nowrap px-3 py-3">{p.tipo_diabetes}</td>
                <td className="px-3 py-3">
                  <span className="font-medium text-white">{INSUMO_LABEL[p.tipo_insumo]}</span>
                  <span className="block text-xs text-emerald-100/70">{prioridadeLabel(p.tipo_insumo, p.prioridade)}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    {p.status === "Aguardando"
                      ? <button className="btn-verde px-3 py-1.5" onClick={() => entregar(p)}>Marcar como entregue</button>
                      : <button className="btn-sec px-3 py-1.5" onClick={() => reabrir(p)}>Voltar à fila</button>}
                    <button className="btn-sec px-3 py-1.5" onClick={() => setModal({ aberto: true, paciente: p })}>Editar</button>
                    <button className="btn-perigo px-3 py-1.5" onClick={() => excluir(p)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PatientModal aberto={modal.aberto} paciente={modal.paciente}
        onFechar={() => setModal({ aberto: false, paciente: null })}
        onSalvo={() => { setModal({ aberto: false, paciente: null }); carregar(); }} />

      {imprimirAberto && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-imp">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-floresta-700 bg-floresta-900 p-6">
            <h2 id="titulo-imp" className="text-lg font-bold text-white">Imprimir listas</h2>
            <div>
              <label htmlFor="imp-lista" className="rotulo">Lista</label>
              <select id="imp-lista" className="campo" value={cfgImp.insumo} onChange={(e) => setCfgImp({ ...cfgImp, insumo: e.target.value as PrintConfig["insumo"] })}>
                <option value="todos">Todas as listas</option>
                {INSUMOS.map((i) => <option key={i} value={i}>{INSUMO_LABEL[i]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="imp-sit" className="rotulo">Incluir</label>
              <select id="imp-sit" className="campo" value={cfgImp.situacao} onChange={(e) => setCfgImp({ ...cfgImp, situacao: e.target.value as PrintConfig["situacao"] })}>
                <option value="Ambos">Em espera e já entregues</option>
                <option value="Aguardando">Somente em espera</option>
                <option value="Entregue">Somente quem já recebeu</option>
              </select>
            </div>
            <p className="text-xs text-emerald-100/60">Na janela de impressão, escolha “Salvar como PDF” se quiser gerar um arquivo.</p>
            <div className="flex justify-end gap-3">
              <button className="btn-sec" onClick={() => setImprimirAberto(false)}>Cancelar</button>
              <button className="btn-ouro" onClick={() => { setImprimirAberto(false); setImprimindo(true); }}>Imprimir</button>
            </div>
          </div>
        </div>
      )}
    </div>
    {imprimindo && <PrintSheet dados={dados} config={cfgImp} />}
    </>
  );
}
