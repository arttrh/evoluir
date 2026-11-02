import { useEffect, useState } from "react";
import { templateFor } from "../catalog";
import type { LessonGuideData } from "../lesson-guides";
export function LessonGuide({
  course,
  title,
  exercise,
  criteria,
}: {
  course: string;
  title: string;
  exercise: string;
  criteria: string;
}) {
  const [guide, setGuide] = useState<LessonGuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    import("../lesson-guides")
      .then((module) => {
        if (alive)
          setGuide(
            module.lessonGuides[`${templateFor(course)}::${title}`] || null,
          );
      })
      .catch(() => {
        if (alive) setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [course, title, attempt]);
  const summary = (
    <>
      <div className="topic-label">Prática</div>
      <p>{exercise}</p>
      <div className="topic-label">Critérios de conclusão</div>
      <p>{criteria}</p>
    </>
  );
  if (loading)
    return (
      <>
        <p className="muted small" role="status">
          Abrindo roteiro da aula…
        </p>
        {summary}
      </>
    );
  if (error)
    return (
      <>
        <div className="planning-note" role="status">
          Não foi possível abrir o roteiro. A prática e as referências continuam
          abaixo.{" "}
          <button
            className="text-button"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Tentar novamente
          </button>
        </div>
        {summary}
      </>
    );
  if (!guide) return summary;
  return (
    <section className="lesson-guide" aria-label={`Roteiro de ${title}`}>
      <div className="lesson-meta">
        <span>Aula guiada</span>
        <span>Prática estimada: {guide.minutes} min</span>
      </div>
      <h4>Entenda antes de implementar</h4>
      {guide.explanation.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {guide.example && (
        <pre tabIndex={0} role="region" aria-label="Exemplo de código da aula">
          <code>{guide.example}</code>
        </pre>
      )}
      <h4>Laboratório passo a passo</h4>
      <ol>
        {guide.practice.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <div className="lesson-pitfall">
        <h4>Falha para investigar</h4>
        <p>{guide.pitfall}</p>
      </div>
      <h4>Evidência para avançar</h4>
      <p>{guide.evidence}</p>
      {(guide.practice.join(" ") !== exercise ||
        guide.evidence !== criteria) && (
        <div className="lesson-personal">
          <h4>Seu registro personalizado</h4>
          {summary}
        </div>
      )}
      <p className="lesson-project">Projeto em evolução: {guide.project}</p>
      <p className="muted small">
        A estimativa inclui prática e investigação. Divida a aula em sessões;
        assistir ao vídeo é uma parte do estudo.
      </p>
    </section>
  );
}
