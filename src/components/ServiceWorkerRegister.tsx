"use client";
import { useEffect } from "react";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {});
    }
  }, []);
  return null;
}
