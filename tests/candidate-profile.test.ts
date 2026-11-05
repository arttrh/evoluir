import { expect, it } from "vitest";
import { candidateSchema, digest, maskedCandidate, openPrivate, sealPrivate } from "../server/candidate-profile";
const key = "1".repeat(64);
it("valida documentos e valores monetários sem inventar dados ausentes", () => {
  expect(candidateSchema.parse({})).toMatchObject({ cpf: "", motherName: "", salaryJunior: "" });
  for (const input of [{ cpf: "11111111111" }, { cpf: "12345678900" }, { salaryJunior: "-1" }, { salaryIntern: "2000,50" }, { salaryJunior: "100000.01" }, { secret: "ignored" }])
    expect(candidateSchema.safeParse(input).success).toBe(false);
  expect(candidateSchema.parse({ cpf: "52998224725", salaryJunior: "2500.50" }).salaryJunior).toBe("2500.50");
});
it("cifra com nonce aleatório, autentica o contexto e rejeita adulteração", () => {
  const candidate = candidateSchema.parse({ cpf: "52998224725", motherName: "Dado privado de teste" });
  const sealed = sealPrivate(candidate, key, "candidate");
  expect(openPrivate(sealed, key, "candidate")).toEqual(candidate);
  expect(sealPrivate(candidate, key, "candidate")).not.toEqual(sealed);
  expect(JSON.stringify(sealed)).not.toContain(candidate.cpf);
  expect(() => openPrivate(sealed, key, "draft:other")).toThrow();
  expect(() => openPrivate(sealed, "2".repeat(64), "candidate")).toThrow();
  expect(() => openPrivate({ ...sealed, tag: "0".repeat(32) }, key, "candidate")).toThrow();
  expect(maskedCandidate(candidate)).not.toContain(candidate.cpf);
  expect(maskedCandidate(candidate)).not.toContain(candidate.motherName);
  expect(digest({ b: 2, a: 1 })).toBe(digest({ a: 1, b: 2 }));
});
