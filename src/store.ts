import { useEffect, useState } from "react";
import { dataSchema, emptyData, parseBackup, type Data } from "./model";
const KEY = "evoluir.data.v1";
function read() {
  const raw = localStorage.getItem(KEY);
  return raw ? parseBackup(raw) : emptyData();
}
export function download(content: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadRecovery() {
  download(localStorage.getItem(KEY) || "{}", "evoluir-recuperacao.json");
}
export function useData() {
  const [data, setData] = useState<Data>(emptyData);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const load = () => {
      try {
        setData(read());
        setError("");
      } catch {
        setError(
          "Não foi possível ler seus dados. Eles foram preservados. Baixe uma cópia para recuperação.",
        );
      } finally {
        setReady(true);
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  function update(change: (current: Data) => Data) {
    const next = dataSchema.parse(change(read()));
    const serialized = JSON.stringify(next);
    if (serialized.length > 2_000_000)
      throw new Error(
        "Seus registros atingiram o limite de 2 MB. Exporte um backup e reduza os registros antes de continuar.",
      );
    try {
      localStorage.setItem(KEY, serialized);
    } catch {
      throw new Error(
        "Não foi possível salvar. O armazenamento está cheio ou indisponível. Exporte um backup antes de continuar.",
      );
    }
    setData(next);
  }
  function restore(next: Data) {
    const current = localStorage.getItem(KEY);
    dataSchema.parse(next);
    if (current) localStorage.setItem("evoluir.before-import", current);
    localStorage.setItem(KEY, JSON.stringify(next));
    setData(next);
    setError("");
  }
  return { data, update, restore, error, ready };
}
