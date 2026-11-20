import { INSUMOS, INSUMO_LABEL, Insumo, Paciente, prioridadeLabel } from "@/lib/constants";
import { fmtData, maskCpf, maskPhone } from "@/lib/utils";

export type Situacao = "Aguardando" | "Entregue" | "Ambos";
export interface PrintConfig { insumo: Insumo | "todos"; situacao: Situacao }

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

function Tabela({ itens, entregue }: { itens: Paciente[]; entregue: boolean }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Nº</th><th>Nome</th><th>CPF</th><th>Cartão SUS</th><th>Nascimento</th><th>Telefone</th>
          <th>Unidade de saúde</th><th>Diabetes</th><th>Prioridade</th><th>Cadastro</th>{entregue && <th>Entregue em</th>}
        </tr>
      </thead>
      <tbody>
        {itens.map((p, i) => (
          <tr key={p.id}>
            <td>{i + 1}</td><td>{p.nome}</td><td>{maskCpf(p.cpf)}</td><td>{p.sus}</td>
            <td>{fmtData(p.data_nascimento)}</td><td>{maskPhone(p.telefone)}</td><td>{p.unidade_saude}</td>
            <td>{p.tipo_diabetes}</td><td>{prioridadeLabel(p.tipo_insumo, p.prioridade)}</td>
            <td>{fmtData(p.criado_em)}</td>{entregue && <td>{fmtData(p.entregue_em)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PrintSheet({ dados, config }: { dados: Paciente[]; config: PrintConfig }) {
  const insumos = config.insumo === "todos" ? INSUMOS : [config.insumo];
  const hoje = new Date().toLocaleDateString("pt-BR");
  const prio = (p: Paciente) => p.prioridade ?? 99;

  return (
    <div className="print-only">
      {insumos.map((ins) => {
        const doInsumo = dados.filter((p) => p.tipo_insumo === ins);
        const espera = doInsumo.filter((p) => p.status === "Aguardando")
          .sort((a, b) => prio(a) - prio(b) || a.criado_em.localeCompare(b.criado_em));
        const entregues = doInsumo.filter((p) => p.status === "Entregue")
          .sort((a, b) => (a.entregue_em ?? "").localeCompare(b.entregue_em ?? ""));
        return (
          <section key={ins} className="print-secao">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${base}/logo.png`} alt="" width={44} height={44} />
              <div>
                <h1 style={{ fontSize: "14pt", fontWeight: 700 }}>Farmácia Básica · {INSUMO_LABEL[ins]}</h1>
                <p style={{ fontSize: "9pt" }}>Emitido em {hoje}</p>
              </div>
            </div>
            {config.situacao !== "Entregue" && (
              <>
                <h2 style={{ fontSize: "11pt", fontWeight: 700, margin: "6px 0" }}>Lista de espera ({espera.length})</h2>
                {espera.length ? <Tabela itens={espera} entregue={false} /> : <p style={{ fontSize: "9pt" }}>Nenhum cadastro aguardando.</p>}
              </>
            )}
            {config.situacao !== "Aguardando" && (
              <>
                <h2 style={{ fontSize: "11pt", fontWeight: 700, margin: "12px 0 6px" }}>Já receberam ({entregues.length})</h2>
                {entregues.length ? <Tabela itens={entregues} entregue /> : <p style={{ fontSize: "9pt" }}>Nenhuma entrega registrada.</p>}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
