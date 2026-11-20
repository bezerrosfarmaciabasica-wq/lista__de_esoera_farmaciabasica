"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, MASTER_EMAIL } from "@/lib/supabase";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user.email?.toLowerCase() === MASTER_EMAIL) router.replace("/dashboard");
    });
  }, [router]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (email.trim().toLowerCase() !== MASTER_EMAIL) {
      setErro("Este e-mail não tem acesso ao sistema.");
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={entrar} className="painel w-full max-w-sm space-y-5 border-ouro-500/30 p-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size={120} />
          <div>
            <h1 className="text-xl font-bold text-white">Farmácia Básica</h1>
            <p className="text-sm text-emerald-100/70">Lista de espera de insumos</p>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="rotulo">E-mail</label>
          <input id="email" type="email" autoComplete="username" required className="campo"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="senha" className="rotulo">Senha</label>
          <input id="senha" type="password" autoComplete="current-password" required className="campo"
            value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>

        {erro && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{erro}</p>}

        <button type="submit" disabled={carregando} className="btn-ouro w-full">
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
