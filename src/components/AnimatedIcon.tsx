import { LordIcon } from "@lordicon/react";

const files = {
  Hoje: "63-home",
  Corrida: "18-location-pin",
  Estudos: "4092-book",
  Emprego: "187-briefcase",
  Semana: "364-calendar-dots",
  Notícias: "362-article",
  Voz: "188-microphone",
  Busca: "19-magnifier",
} as const;

export function AnimatedIcon({
  name,
  active = false,
  motion = true,
  size = 24,
}: {
  name: keyof typeof files;
  active?: boolean;
  motion?: boolean;
  size?: number;
}) {
  const src = `/icons/lordicon/${files[name]}`;
  return (
    <LordIcon
      className="app-icon"
      src={`${src}.json`}
      trigger={motion ? (active ? "loop(3000)" : "hover") : undefined}
      intro={active && motion ? "hover-pinch" : undefined}
      target="button, label"
      currentColor
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <img src={`${src}.svg`} width={size} height={size} alt="" />
    </LordIcon>
  );
}
