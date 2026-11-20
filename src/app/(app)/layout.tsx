"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase, MASTER_EMAIL } from "@/lib/supabase";
import Logo from "@/components/Logo";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lista", label: "Lista de espera" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function checar() {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user.email?.toLowerCase();
      if (email !== MASTER_EMAIL) {
        if (data.session) await supabase.auth.signOut();
        router.replace("/login");
        return;
      }
      if (ativo) setPronto(true);
    }
    checar();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/login");
    });
    return () => { ativo = false; sub.subscription.unsubscribe(); };
  }, [router]);

  if (!pronto) {
    return <div className="flex min-h-screen items-center justify-center text-emerald-100/70">Carregando...</div>;
  }

  return (
    <div>
      <header className="no-print sticky top-0 z-30 border-b border-floresta-700 bg-floresta-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5">
          <Logo size={40} />
          <nav className="flex flex-1 gap-1" aria-label="Principal">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === l.href ? "bg-ouro-500 text-floresta-950" : "text-emerald-100 hover:bg-floresta-800"}`}>
                {l.label}
              </Link>
            ))}
          </nav>
          <button className="btn-sec px-3 py-2" onClick={async () => { await supabase.auth.signOut(); router.replace("/login"); }}>
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4 sm:p-6 print:p-0">{children}</main>
    </div>
  );
}
