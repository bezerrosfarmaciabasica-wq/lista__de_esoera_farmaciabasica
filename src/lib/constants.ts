export type Insumo = "NPH/Regular" | "Glicosímetro" | "Glargina";
export type TipoDiabetes = "Tipo I" | "Tipo II";
export type Status = "Aguardando" | "Entregue";

export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  sus: string;
  data_nascimento: string;
  telefone: string;
  unidade_saude: string;
  tipo_diabetes: TipoDiabetes;
  tipo_insumo: Insumo;
  prioridade: number | null;
  status: Status;
  entregue_em: string | null;
  criado_em: string;
}

export const INSUMOS: Insumo[] = ["NPH/Regular", "Glicosímetro", "Glargina"];

export const INSUMO_LABEL: Record<Insumo, string> = {
  "NPH/Regular": "Canetas NPH / Regular",
  Glicosímetro: "Glicosímetro",
  Glargina: "Insulina Glargina",
};

export const PRIORIDADES: Record<Insumo, { valor: number; label: string }[]> = {
  "NPH/Regular": [
    { valor: 1, label: "1 - Paciente inicial em tratamento" },
    { valor: 2, label: "2 - Nunca recebeu" },
    { valor: 3, label: "3 - Quebra ou peça de caneta" },
  ],
  Glicosímetro: [
    { valor: 1, label: "1 - Gestantes" },
    { valor: 2, label: "2 - Usuário de insulina" },
  ],
  Glargina: [{ valor: 1, label: "1 - Idosos acima de 70 anos e crianças de 2 a 18 anos" }],
};

export const SEM_PRIORIDADE = "Sem prioridade";

export function prioridadeLabel(insumo: Insumo, valor: number | null) {
  if (valor == null) return SEM_PRIORIDADE;
  return PRIORIDADES[insumo]?.find((p) => p.valor === valor)?.label ?? String(valor);
}
