import { Timer, Route, CalendarCheck2 } from "lucide-react";
import { type Run, duration, pace } from "../model";
export function RunInsights({ runs, date }: { runs: Run[]; date: string }) {
  const month = runs.filter((r) => r.date.startsWith(date.slice(0, 7)));
  const km = month.reduce((s, r) => s + r.distance, 0);
  const seconds = month.reduce((s, r) => s + r.seconds, 0);
  return (
    <section className="run-insights">
      <div className="section-heading">
        <h2>Seu mês, em movimento</h2>
        <span>Registros manuais</span>
      </div>
      <div className="insight-grid">
        {[
          [
            Route,
            `${km.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`,
            "Distância",
          ],
          [Timer, duration(seconds), "Tempo correndo"],
          [CalendarCheck2, String(month.length), "Corridas realizadas"],
        ].map(([Icon, value, label]) => {
          const I = Icon as typeof Route;
          return (
            <div key={String(label)}>
              <I size={17} />
              <strong>{String(value)}</strong>
              <span>{String(label)}</span>
            </div>
          );
        })}
      </div>
      <p className="muted small">
        {month.length
          ? `Ritmo médio ponderado: ${pace(seconds, km)} /km. Compare a sua própria evolução, sem pressão por velocidade.`
          : "Seu primeiro registro começa a contar essa história. Planeje um treino que caiba no seu dia."}
      </p>
    </section>
  );
}
