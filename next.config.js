// Exportação estática para o GitHub Pages.
// NEXT_PUBLIC_BASE_PATH é definido pelo workflow com o nome do repositório (ex.: /farmacia-basica-fila).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};
