const access = document.querySelector('#access');
const form = document.querySelector('#candidate-form');
const saveStatus = document.querySelector('#save-status');
let data;
let activeView = 'profile';
async function api(path, options = {}) {
  const response = await fetch(path, { ...options, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, redirect: 'error' });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Não foi possível concluir. Tente novamente.');
  return body;
}
function view(name) {
  activeView = name;
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === name)));
  document.querySelector('#profile').hidden = !data || name !== 'profile';
  document.querySelector('#reviews').hidden = !data || name !== 'reviews';
  document.querySelector('#title').textContent = name === 'profile' ? 'Cadastro privado' : 'Revisões e etapas';
  document.querySelector('#intro').textContent = name === 'profile' ? 'Dados salvos uma vez. Cada candidatura passa pela sua revisão.' : 'Confira o destino e os dados antes de autorizar no Telegram.';
}
function element(tag, text, className) {
  const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node;
}
const labels = { profile: 'Dados pessoais', firstName: 'Nome', lastName: 'Sobrenome', email: 'E-mail', birthDate: 'Nascimento', identificationDocument: 'CPF ou documento', mobileNumber: 'Celular', phoneNumber: 'Telefone', personalWebsite: 'Site pessoal', linkedinProfileUrl: 'LinkedIn', address: 'Endereço', city: 'Cidade', country: 'País', state: 'Estado', street: 'Rua', number: 'Número', zipCode: 'CEP', education: 'Formação', higherEducation: 'Ensino superior', highSchool: 'Ensino médio', course: 'Curso', institution: 'Instituição', academicLevel: 'Nível', completion: 'Situação', start: 'Início', end: 'Término', achievement: 'Conquistas', name: 'Nome', description: 'Descrição', language: 'Idiomas', level: 'Nível', workExperience: 'Experiência profissional', companyName: 'Empresa', role: 'Cargo', motherName: 'Nome da mãe', identityCardNumber: 'RG', salary_expectation: 'Pretensão salarial mensal', applicationFieldsValues: 'Dados da vaga', slug: 'Campo', value: 'Valor', isRequired: 'Obrigatório', required: 'Obrigatório', visible: 'Solicitado', personalInfo: 'Dados pessoais', additionalInfo: 'Informações adicionais', isCompanyEmployee: 'Trabalha nesta empresa', corporateEmail: 'E-mail corporativo', isIndicated: 'Possui indicação', isIndicatedBy: 'Pessoa que indicou', howDidYouHearAboutUs: 'Como conheceu a empresa', howDidYouHearAboutUsDescription: 'Origem da candidatura', candidateId: 'Identificador na Gupy', gender: 'Gênero', genderIdentity: 'Identidade de gênero', genderPronoun: 'Pronome', sexualOrientation: 'Orientação sexual', raceColor: 'Raça ou cor', hasDisabilities: 'Possui deficiência', disabilities: 'Deficiências', countryOfOrigin: 'País de origem', cityOfOrigin: 'Cidade de origem', stateOfOrigin: 'Estado de origem' };
function readable(value) {
  if (value === null || value === undefined || value === '') return element('span', 'Não informado');
  if (typeof value === 'boolean') return element('span', value ? 'Sim' : 'Não');
  if (typeof value !== 'object') return element('span', labels[value] || String(value));
  if (Array.isArray(value)) {
    const list = element('div', '', 'review-list');
    if (!value.length) list.append(element('span', 'Nenhum item'));
    value.forEach(item => list.append(readable(item))); return list;
  }
  const list = element('dl');
  Object.entries(value).forEach(([key, item]) => {
    list.append(element('dt', labels[key] || key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')));
    const content = element('dd'); content.append(readable(item)); list.append(content);
  });
  if (!Object.keys(value).length) list.append(element('dd', 'Nenhum campo retornado.'));
  return list;
}
function details(title, value) {
  const node = element('details'); const content = element('div', '', 'review-data'); content.append(readable(value));
  node.append(element('summary', title), content); return node;
}
function officialLink(text, url) {
  const link = element('a', text); const target = new URL(url);
  if (target.protocol === 'https:' && /^[a-z0-9-]+\.gupy\.io$/.test(target.hostname)) { link.href = target.href; link.rel = 'noreferrer'; link.target = '_blank'; }
  return link;
}
function renderReviews() {
  const drafts = document.querySelector('#drafts'); drafts.replaceChildren();
  if (!data.drafts.length) drafts.append(element('p', 'Nenhuma revisão aberta. No Telegram, use /candidaturas e escolha Preparar candidatura.'));
  data.drafts.forEach(draft => {
    const article = element('article', '', 'draft');
    article.append(element('h2', draft.title), element('p', draft.phase === 'start' ? 'Autorizar o início cria uma inscrição nesta empresa. Depois haverá uma nova revisão para concluir.' : 'Esta revisão autoriza enviar os dados abaixo e tentar concluir o cadastro. A Gupy pode exigir respostas adicionais.'));
    article.append(details('Currículo atual na Gupy · dados que a plataforma utiliza', draft.preview.curriculum));
    if (draft.additional) article.append(details('Dados adicionais exatos para esta empresa', draft.additional));
    article.append(details('Campos solicitados pela empresa', draft.registration?.schema || draft.preview.fields));
    if (draft.registration?.questions?.length) article.append(details('Perguntas da empresa e respostas já preenchidas', draft.registration.questions));
    if (draft.missing.length) article.append(element('p', `Falta preencher: ${draft.missing.join(', ')}. Salve no cadastro e prepare uma nova revisão pelo Telegram.`, 'error'));
    const label = element('label', '', 'check'); const check = document.createElement('input'); check.type = 'checkbox';
    label.append(check, document.createTextNode('Revisei o currículo e os dados desta candidatura.'));
    const button = element('button', 'Continuar aprovação no Telegram', 'primary'); button.type = 'button'; button.disabled = true;
    const status = element('p'); status.setAttribute('role', 'status');
    check.addEventListener('change', () => { button.disabled = !check.checked || draft.missing.length > 0; });
    button.addEventListener('click', async () => {
      button.disabled = true; status.textContent = 'Registrando revisão…';
      try {
        await api('/private/review', { method: 'POST', body: JSON.stringify({ id: draft.id, hash: draft.hash, acknowledged: true }) });
        status.textContent = 'Revisão registrada. Volte ao Telegram e confirme no botão enviado pelo bot.';
      } catch (error) { status.textContent = error.message; button.disabled = false; }
    });
    article.append(label, button, status); drafts.append(article);
  });
  const applications = document.querySelector('#applications'); applications.replaceChildren();
  if (!data.applications.length) applications.append(element('p', 'Nenhuma inscrição iniciada pelo bot.'));
  data.applications.forEach(application => {
    const article = element('article', '', 'application'); article.append(element('h3', application.title), element('p', application.status), officialLink('Abrir candidatura na Gupy', application.url));
    application.tasks.forEach(task => {
      const row = element('div', '', 'task'); row.append(officialLink(task.name, task.url), element('p', `Estado na Gupy: ${task.status}`)); article.append(row);
    });
    if (application.checkedAt) article.append(element('p', `Consultado em ${new Date(application.checkedAt).toLocaleString('pt-BR')}`));
    applications.append(article);
  });
}
async function load() {
  data = await api('/private/profile');
  Object.entries(data.candidate).forEach(([name, value]) => { const input = form.elements.namedItem(name); if (input) input.value = value; });
  renderReviews(); access.textContent = ''; view(activeView);
}
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => view(button.dataset.view)));
document.querySelector('#show-documents').addEventListener('change', event => {
  ['cpf', 'rg', 'motherName'].forEach(name => { form.elements.namedItem(name).type = event.target.checked ? 'text' : 'password'; });
});
form.addEventListener('submit', async event => {
  event.preventDefault(); const button = form.querySelector('[type=submit]'); button.disabled = true; saveStatus.textContent = 'Salvando…';
  try {
    const candidate = Object.fromEntries(new FormData(form));
    await api('/private/profile', { method: 'POST', body: JSON.stringify({ candidate, version: data.version }) });
    await load(); saveStatus.textContent = 'Cadastro salvo. Prepare uma nova revisão em /candidaturas no Telegram.';
  } catch (error) { saveStatus.textContent = error.message; }
  finally { button.disabled = false; }
});
document.querySelector('#erase').addEventListener('click', async () => {
  if (!confirm('Apagar documentos, contato, salários e respostas deste cadastro? O currículo e a conta Gupy permanecem.')) return;
  try { await api('/private/profile', { method: 'DELETE' }); await load(); saveStatus.textContent = 'Dados privados apagados.'; }
  catch (error) { saveStatus.textContent = error.message; }
});
document.querySelector('#logout').addEventListener('click', async () => {
  try { await api('/private/logout', { method: 'POST', body: '{}' }); data = undefined; form.reset(); document.querySelector('#drafts').replaceChildren(); document.querySelector('#applications').replaceChildren(); view('profile'); access.textContent = 'Acesso encerrado. Para voltar, use /cadastro no Telegram.'; }
  catch (error) { saveStatus.textContent = error.message; }
});
(async () => {
  const token = location.hash.slice(1); history.replaceState(null, '', '/cadastro');
  try {
    if (token) await api('/private/session', { method: 'POST', body: JSON.stringify({ token }) });
    await load();
    if (data.drafts.length) view('reviews');
  } catch (error) { access.textContent = error.message; }
})();
