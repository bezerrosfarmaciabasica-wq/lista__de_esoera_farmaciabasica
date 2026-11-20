# Farmácia Básica · Lista de Espera de Insumos

Next.js 14 + Tailwind CSS + Supabase, instalável como PWA.

## Estrutura

```
supabase/schema.sql              tabela, regras de prioridade e segurança (RLS)
public/logo.png                  logomarca (troque o arquivo para mudar a logo)
public/manifest.json, sw.js      PWA
public/icons/                    ícones 192, 512 e maskable
src/app/login/                   tela de login
src/app/(app)/dashboard/         indicadores
src/app/(app)/lista/             lista de espera (busca, filtros, ações)
src/components/PatientModal.tsx  cadastro e edição
src/lib/                         supabase, constantes de prioridade, validações
```

## 1. Banco de dados (uma vez só)

1. Supabase > **SQL Editor** > cole o conteúdo de `supabase/schema.sql` > **Run**.
2. Supabase > **Authentication > Users > Add user** > e-mail `bezerrosfarmaciabasica@gmail.com`, defina uma senha e marque **Auto Confirm User**.
3. Em **Authentication > Sign In / Providers**, desative **Allow new users to sign up** (só o usuário master deve existir).

## 2. Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000. O arquivo `.env.local` já vem com as credenciais (veja `.env.example`).

## 3. Publicar no GitHub

```bash
git init
git add .
git commit -m "Sistema de lista de espera da Farmácia Básica"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/farmacia-basica-fila.git
git push -u origin main
```

## 4. Publicar no GitHub Pages (automático)

O repositório já tem o workflow `.github/workflows/deploy.yml`.

1. No GitHub, abra o repositório > **Settings > Pages** > em **Source** escolha **GitHub Actions**.
2. Faça o `git push` (passo 3). A aba **Actions** mostra o build; quando ficar verde, o site está no ar.
3. O endereço será `https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/` e abre direto na tela de login.

Obs.: repositório privado só publica no Pages em planos pagos do GitHub; no plano gratuito o repositório precisa ser público. O código não contém senhas (a chave `publishable` do Supabase é pública por design e os dados são protegidos pelo login e pelas regras RLS do `schema.sql`).

## 5. Instalar como aplicativo

- **Windows/Mac (Chrome ou Edge):** ícone de instalar na barra de endereço.
- **Android (Chrome):** menu ⋮ > Instalar aplicativo.
- **iPhone/iPad (Safari):** Compartilhar > Adicionar à Tela de Início.
- atualizado
