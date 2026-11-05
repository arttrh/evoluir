import { z } from "zod";
import { openGupySession } from "./gupy-session.js";
import { gupyVacancySchema } from "./gupy-jobs.js";
import { readBounded } from "./http.js";

const id = z.number().int().positive();
const stepSchema = z.object({
  id, name: z.string().max(200), type: z.string().optional(), category: z.string().optional(),
  applicationStep: z.object({ id, status: z.string().max(60) }).nullish(),
});
export const applicationDetailsSchema = z.object({
  registrationComplete: z.boolean(),
  job: z.object({ id, jobSteps: z.array(stepSchema).max(100) }),
});
export class GupyRequestError extends Error {
  constructor(readonly status: number) { super("A Gupy não confirmou a operação."); }
}

export function gupyTarget(input: unknown) {
  const vacancy = gupyVacancySchema.parse(input);
  const url = new URL(vacancy.url);
  const numeric = /^\/jobs\/(\d+)$/.exec(url.pathname);
  const token = /^\/job\/([^/]+)$/.exec(url.pathname);
  const jobId = id.parse(numeric ? Number(numeric[1]) : token ? JSON.parse(Buffer.from(token[1], "base64").toString("utf8")).jobId : null);
  return { jobId, origin: url.origin, title: vacancy.title };
}

export class GupyApplications {
  readonly headers: Record<string, string>;
  constructor(session: unknown, key: string) {
    const credentials = openGupySession(session, key);
    this.headers = { Accept: "application/json", Origin: "https://login.gupy.io", Referer: "https://login.gupy.io/" };
    if (credentials.authorization) this.headers.Authorization = credentials.authorization;
    if (credentials.cookie) this.headers.Cookie = credentials.cookie;
    if (credentials.userAgent) this.headers["User-Agent"] = credentials.userAgent;
  }

  private async request(path: string, method = "GET", body?: unknown) {
    // shortcut: contrato observado no cliente oficial da Gupy; bloquear o envio se a plataforma mudar a resposta.
    const response = await fetch(`https://private-api.gupy.io${path}`, {
      method, headers: { ...this.headers, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(15000), redirect: "error",
    });
    if (!response.ok) throw new GupyRequestError(response.status);
    if (response.status === 204) return null;
    return JSON.parse(await readBounded(response, 500000));
  }

  async preview(jobId: number) {
    id.parse(jobId);
    const [job, curriculum, fields] = await Promise.all([
      this.request(`/job-publication/public/jobs/${jobId}`),
      this.request("/curriculum-management/candidate/curriculum"),
      this.request(`/job-application-fields/public/${jobId}`),
    ]);
    const checkedJob = z.object({ id, status: z.string(), name: z.string(), company: z.object({ subdomain: z.string() }) }).passthrough().parse(job);
    if (checkedJob.id !== jobId || checkedJob.status !== "published") throw new Error("A vaga não está disponível para inscrição.");
    z.object({ candidateId: id, profile: z.object({ firstName: z.string(), lastName: z.string(), email: z.email() }) }).parse(curriculum);
    z.object({ fields: z.array(z.object({ slug: z.string(), isRequired: z.boolean().optional() }).passthrough()).max(100) }).parse(fields);
    return { job: checkedJob, curriculum, fields };
  }

  async start(jobId: number) {
    return z.object({ applicationId: id, registerStepId: id }).parse(
      await this.request("/selection-process/candidate/application", "POST", { jobId: id.parse(jobId), partnerName: "gupy_portal" }));
  }

  async details(applicationId: number) {
    return applicationDetailsSchema.parse(await this.request(`/selection-process/candidate/application/${id.parse(applicationId)}/step`));
  }

  async registration(applicationId: number, applicationStepId: number, jobStepId: number) {
    const [schema, additional] = await Promise.all([
      this.request(`/curriculum-step-activity/candidate/curriculum-schema/${id.parse(applicationId)}`),
      this.request(`/curriculum-management/candidate/curriculum/${id.parse(applicationId)}/additional-info`),
    ]);
    let form;
    try { form = await this.request(`/question-forms/candidates/applications/${id.parse(applicationId)}/steps/${id.parse(applicationStepId)}/forms`); }
    catch (error) { if (error instanceof GupyRequestError && error.status === 404) form = { questionForm: { questions: [] } }; else throw error; }
    let questions = z.object({ questionForm: z.object({ questions: z.array(z.record(z.string(), z.unknown())).max(100) }) }).parse(form).questionForm.questions;
    if (!questions.length) {
      const legacy = await this.request(`/form-step-activity/candidate/form/${id.parse(applicationId)}/${id.parse(jobStepId)}`);
      questions = z.object({ questions: z.array(z.record(z.string(), z.unknown())).max(100) }).parse(legacy).questions;
    }
    z.record(z.string(), z.unknown()).parse(schema);
    return { schema, questions, additional: z.object({ additionalInfo: z.record(z.string(), z.unknown()) }).parse(additional).additionalInfo };
  }

  async saveAdditional(applicationId: number, values: Record<string, unknown>) {
    return this.request(`/curriculum-management/candidate/curriculum/${id.parse(applicationId)}/additional-info`, "PUT", values);
  }

  async complete(applicationId: number, stepId: number) {
    return this.request(`/selection-process/candidate/application/${id.parse(applicationId)}/${id.parse(stepId)}/complete`, "PATCH");
  }
}
