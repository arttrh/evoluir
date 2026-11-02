export type SpeechResult = {
  isFinal: boolean;
  length?: number;
  [index: number]: { transcript: string; confidence?: number };
};
export function assembleSpeech(results: ArrayLike<SpeechResult>, prefix = "") {
  const parts = Array.from(results);
  const join = (items: string[]) =>
    [prefix, ...items]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");
  const text = join(parts.map((r) => r[0]?.transcript || ""));
  const final = join(
    parts.filter((r) => r.isFinal).map((r) => r[0]?.transcript || ""),
  );
  const alternatives = [text];
  for (let n = 1; n < 3; n++) {
    const value = join(
      parts.map((r) => r[n]?.transcript || r[0]?.transcript || ""),
    );
    if (value && !alternatives.includes(value)) alternatives.push(value);
  }
  return { text, final, alternatives };
}
