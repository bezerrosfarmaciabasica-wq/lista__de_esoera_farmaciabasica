"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { INSUMOS, INSUMO_LABEL, PRIORIDADES, Insumo, Paciente, TipoDiabetes } from "@/lib/constants";
import { elegivelGlargina, maskCpf, maskPhone, maskSus, onlyDigits, validaCpf } from "@/lib/utils";

interface Props {
  aberto: boolean;
  paciente: Paciente | null; // null = novo cadastro
  onFechar: () => void;
  onSalvo: () => void;
}

const vazio = {
  nome: "", cpf: "", sus: "", data_nascimento: "", telefone: "", unidade_saude: "",
  tipo_diabetes: "" as TipoDiabetes | "", tipo_insumo: "" as Insumo | "", prioridade: "" as number | "",
};

export default function PatientModal({ aberto, paciente, onFechar, onSalvo }: Props) {
  const [f, setF] = useState(vazio);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setErros({}); setErroGeral("");
    setF(paciente ? {
      nome: paciente.nome, cpf: maskCpf(paciente.cpf), sus: maskSus(paciente.sus),
      data_nascimento: paciente.data_nascimento, telefone: maskPhone(paciente.telefone),
      unidade_saude: paciente.unidade_saude, tipo_diabetes: paciente.tipo_diabetes,
      tipo_insumo: paciente.tipo_insumo, prioridade: paciente.prioridade ?? "",
    } : vazio);
  }, [aberto, paciente]);

  if (!aberto) return null;

  const set = <K extends keyof typeof vazio>(k: K, v: (typeof vazio)[K]) => setF((s) => ({ ...s, [k]: v }));
  const prioridades = f.tipo_insumo ? PRIORIDADES[f.tipo_insumo] : [];
  // Glargina: prioridade 1 automática (acima de 70 anos ou de 2 a 18 anos); fora disso, fica sem prioridade
  const ehGlargina = f.tipo_insumo === "Glargina";
  const glargEleg = ehGlargina && !!f.data_nascimento && elegivelGlargina(f.data_nascimento);
  const prioridadeFinal: number | null = ehGlargina ? (glargEleg ? 1 : null) : f.prioridade || null;

  function validar() {
    const e: Record<string, string> = {};
    if (f.nome.trim().length < 5 || !f.nome.trim().includes(" ")) e.nome = "Informe o nome completo.";
    if (!validaCpf(f.cpf)) e.cpf = "CPF inválido.";
    if (onlyDigits(f.sus).length !== 15) e.sus = "O Cartão SUS tem 15 dígitos.";
    if (!f.data_nascimento) e.data_nascimento = "Informe a data de nascimento.";
    else if (new Date(f.data_nascimento) > new Date()) e.data_nascimento = "A data não pode ser futura.";
    const tel = onlyDigits(f.telefone);
    if (tel.length < 10 || tel.length > 11) e.telefone = "Telefone com DDD, 10 ou 11 dígitos.";
    if (!f.unidade_saude.trim()) e.unidade_saude = "Informe a unidade de saúde.";
    if (!f.tipo_diabetes) e.tipo_diabetes = "Selecione o tipo de diabetes.";
    if (!f.tipo_insumo) e.tipo_insumo = "Selecione o insumo.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function salvar(ev: React.FormEvent) {
    ev.preventDefault();
    setErroGeral("");
    if (!validar()) return;
    setSalvando(true);
    const registro = {
      nome: f.nome.trim().replace(/\s+/g, " "),
      cpf: onlyDigits(f.cpf), sus: onlyDigits(f.sus),
      data_nascimento: f.data_nascimento, telefone: onlyDigits(f.telefone),
      unidade_saude: f.unidade_saude.trim(),
      tipo_diabetes: f.tipo_diabetes, tipo_insumo: f.tipo_insumo, prioridade: prioridadeFinal,
    };
    const { error } = paciente
      ? await supabase.from("pacientes").update(registro).eq("id", paciente.id)
      : await supabase.from("pacientes").insert(registro);
    setSalvando(false);
    if (error) {
      setErroGeral(error.code === "23505" ? "Este CPF já está cadastrado nesta lista de espera." : `Erro ao salvar: ${error.message}`);
      return;
    }
    onSalvo();
  }

  const Erro = ({ k }: { k: string }) => (erros[k] ? <p className="erro">{erros[k]}</p> : null);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
      <form onSubmit={salvar} noValidate className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-floresta-700 bg-floresta-900 p-5 sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="titulo-modal" className="text-lg font-bold text-white">{paciente ? "Editar cadastro" : "Adicionar usuário"}</h2>
          <button type="button" onClick={onFechar} className="btn-sec px-3 py-1.5" aria-label="Fechar">Fechar</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nome" className="rotulo">Nome completo</label>
            <input id="nome" className="campo" value={f.nome} onChange={(e) => set("nome", e.target.value)} />
            <Erro k="nome" />
          </div>
          <div>
            <label htmlFor="cpf" className="rotulo">CPF</label>
            <input id="cpf" inputMode="numeric" className="campo" placeholder="000.000.000-00" value={f.cpf} onChange={(e) => set("cpf", maskCpf(e.target.value))} />
            <Erro k="cpf" />
          </div>
          <div>
            <label htmlFor="sus" className="rotulo">Cartão SUS</label>
            <input id="sus" inputMode="numeric" className="campo" placeholder="000 0000 0000 0000" value={f.sus} onChange={(e) => set("sus", maskSus(e.target.value))} />
            <Erro k="sus" />
          </div>
          <div>
            <label htmlFor="nasc" className="rotulo">Data de nascimento</label>
            <input id="nasc" type="date" className="campo" value={f.data_nascimento} onChange={(e) => set("data_nascimento", e.target.value)} />
            <Erro k="data_nascimento" />
          </div>
          <div>
            <label htmlFor="tel" className="rotulo">Telefone</label>
            <input id="tel" inputMode="tel" className="campo" placeholder="(81) 90000-0000" value={f.telefone} onChange={(e) => set("telefone", maskPhone(e.target.value))} />
            <Erro k="telefone" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="unidade" className="rotulo">Unidade de saúde</label>
            <input id="unidade" className="campo" value={f.unidade_saude} onChange={(e) => set("unidade_saude", e.target.value)} />
            <Erro k="unidade_saude" />
          </div>
          <div>
            <label htmlFor="diab" className="rotulo">Tipo de diabetes</label>
            <select id="diab" className="campo" value={f.tipo_diabetes} onChange={(e) => set("tipo_diabetes", e.target.value as TipoDiabetes)}>
              <option value="">Selecione</option><option>Tipo I</option><option>Tipo II</option>
            </select>
            <Erro k="tipo_diabetes" />
          </div>
          <div>
            <label htmlFor="insumo" className="rotulo">Insumo desejado</label>
            <select id="insumo" className="campo" value={f.tipo_insumo}
              onChange={(e) => setF((s) => ({ ...s, tipo_insumo: e.target.value as Insumo, prioridade: "" }))}>
              <option value="">Selecione</option>
              {INSUMOS.map((i) => <option key={i} value={i}>{INSUMO_LABEL[i]}</option>)}
            </select>
            <Erro k="tipo_insumo" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="prio" className="rotulo">Prioridade <span className="font-normal text-emerald-100/60">(opcional)</span></label>
            <select id="prio" className="campo" disabled={!f.tipo_insumo || ehGlargina}
              value={ehGlargina ? (glargEleg ? 1 : "") : f.prioridade}
              onChange={(e) => set("prioridade", e.target.value ? Number(e.target.value) : "")}>
              <option value="">{f.tipo_insumo ? "Sem prioridade" : "Escolha o insumo primeiro"}</option>
              {prioridades.map((p) => <option key={p.valor} value={p.valor}>{p.label}</option>)}
            </select>
            {ehGlargina && (
              <p className="mt-1 text-xs text-emerald-100/60">
                {!f.data_nascimento
                  ? "Definida automaticamente pela data de nascimento (acima de 70 anos ou de 2 a 18 anos)."
                  : glargEleg
                    ? "Prioridade 1: idoso acima de 70 anos ou criança de 2 a 18 anos."
                    : "Fora da faixa de prioridade: será cadastrado sem prioridade."}
              </p>
            )}
          </div>
        </div>

        {erroGeral && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{erroGeral}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onFechar} className="btn-sec">Cancelar</button>
          <button type="submit" disabled={salvando} className="btn-ouro">{salvando ? "Salvando..." : "Salvar cadastro"}</button>
        </div>
      </form>
    </div>
  );
}
