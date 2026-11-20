/* Substitua public/logo.png para trocar a logomarca em todo o sistema. */
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Logo({ size = 48, className = "" }: { size?: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${base}/logo.png`} alt="Logomarca" width={size} height={size} className={`rounded-xl ${className}`} />;
}
