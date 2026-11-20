export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function maskCpf(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function maskSus(v: string) {
  const d = onlyDigits(v).slice(0, 15);
  return d.replace(/^(\d{3})(\d)/, "$1 $2").replace(/^(\d{3}) (\d{4})(\d)/, "$1 $2 $3").replace(/^(\d{3}) (\d{4}) (\d{4})(\d)/, "$1 $2 $3 $4");
}

export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function validaCpf(cpf: string) {
  const d = onlyDigits(cpf);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export function idadeEm(dataNasc: string, ref = new Date()) {
  const [y, m, d] = dataNasc.split("-").map(Number);
  let idade = ref.getFullYear() - y;
  if (ref.getMonth() + 1 < m || (ref.getMonth() + 1 === m && ref.getDate() < d)) idade--;
  return idade;
}

// Regra da Glargina: idosos acima de 70 anos OU crianças entre 2 e 18 anos
export const elegivelGlargina = (dataNasc: string) => {
  const i = idadeEm(dataNasc);
  return i > 70 || (i >= 2 && i <= 18);
};

export function fmtData(iso: string | null) {
  if (!iso) return "—";
  const d = iso.length === 10 ? new Date(iso + "T00:00:00") : new Date(iso);
  return d.toLocaleDateString("pt-BR");
}
