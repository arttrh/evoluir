import { expect, it } from "vitest";
import { assembleSpeech } from "../src/speech";
it("reúne todos os resultados finais e parciais sem perder frases após pausas", () => {
  const first = {
    0: { transcript: "Corri cinco quilômetros" },
    1: { transcript: "Corri seis quilômetros" },
    isFinal: true,
  };
  const interim = { 0: { transcript: "em trinta" }, isFinal: false };
  expect(assembleSpeech([first, interim]).text).toBe(
    "Corri cinco quilômetros em trinta",
  );
  const final = {
    0: { transcript: "em trinta e cinco minutos" },
    isFinal: true,
  };
  expect(assembleSpeech([first, final])).toEqual({
    text: "Corri cinco quilômetros em trinta e cinco minutos",
    final: "Corri cinco quilômetros em trinta e cinco minutos",
    alternatives: [
      "Corri cinco quilômetros em trinta e cinco minutos",
      "Corri seis quilômetros em trinta e cinco minutos",
    ],
  });
  expect(assembleSpeech([final], "Corri cinco quilômetros").text).toBe(
    "Corri cinco quilômetros em trinta e cinco minutos",
  );
});
