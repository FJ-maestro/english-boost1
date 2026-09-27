const VOCAB = [{"en": "Global warming", "fr": "le réchauffement climatique"}, {"en": "Climate change", "fr": "le changement climatique"}, {"en": "A climatologist", "fr": "un climatologue"}, {"en": "The planet is heating up", "fr": "la planète se réchauffe"}, {"en": "A major shift in the climate", "fr": "un bouleversement climatique"}, {"en": "To alter weather patterns", "fr": "modifier les tendances climatiques"}, {"en": "To be caused by human activities", "fr": "être causé par l’activité humaine"}, {"en": "Ozone depletion", "fr": "la diminution de la couche d’ozone"}, {"en": "Greenhouse gas emissions", "fr": "des émissions de gaz à effet de serre"}, {"en": "To emit carbon dioxide", "fr": "rejeter du gaz carbonique"}, {"en": "The melting of the ice caps", "fr": "la fonte des calottes glaciaires"}, {"en": "Polar ice is thinning", "fr": "la glace polaire s’amenuise"}, {"en": "Coastal flooding", "fr": "des inondations côtières"}, {"en": "The sea level is rising", "fr": "le niveau de la mer augmente"}, {"en": "The Kyoto protocol", "fr": "le protocole de Kyoto"}, {"en": "To meet a target", "fr": "atteindre un objectif"}, {"en": "To make polluters pay", "fr": "faire payer les pollueurs"}, {"en": "To cut one’s emissions", "fr": "réduire ses émissions de CO₂"}, {"en": "Fossil fuels", "fr": "des énergies non renouvelables"}, {"en": "To trap / to store CO₂ in the subsoil / in the seas", "fr": "stocker le CO₂ dans le sous-sol / la mer"}, {"en": "To dispose of the nuclear waste", "fr": "se débarrasser des déchets nucléaires"}, {"en": "To bury", "fr": "enfouir"}];

let mode = 'qcm';
let dir = 'en-fr';
let deck = [];
let index = 0;
let good = 0;
let locked = false;

const byId = id => document.getElementById(id);
const all = sel => Array.from(document.querySelectorAll(sel));

function safeGet(key) {
  try { return localStorage.getItem(key); } catch(e) { return null; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, val); } catch(e) {}
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function show(which) {
  ['home','quiz','result'].forEach(id => byId(id).classList.toggle('hidden', id !== which));
}
function qText(item) { return dir === 'en-fr' ? item.en : item.fr; }
function aText(item) { return dir === 'en-fr' ? item.fr : item.en; }

function updateHome() {
  const q = safeGet('englishboost_qcm');
  const h = safeGet('englishboost_hard');
  if (q) {
    try { byId('homeQcm').textContent = JSON.parse(q).pct + '%'; } catch(e) {}
  }
  if (h) {
    try { byId('homeHard').textContent = JSON.parse(h).pct + '%'; } catch(e) {}
  }
}

function startQuiz() {
  deck = shuffle(VOCAB);
  index = 0;
  good = 0;
  show('quiz');
  renderQuestion();
}

function renderQuestion() {
  locked = false;
  const item = deck[index];
  byId('count').textContent = (index + 1) + ' / ' + deck.length;
  byId('score').textContent = (index ? Math.round(good / index * 100) : 0) + '%';
  byId('barFill').style.width = (index / deck.length * 100) + '%';
  byId('label').textContent = dir === 'en-fr' ? 'Traduis en français' : 'Traduis en anglais';
  byId('question').textContent = qText(item);

  byId('qcmBlock').classList.toggle('hidden', mode !== 'qcm');
  byId('hardBlock').classList.toggle('hidden', mode !== 'hard');
  byId('feedback').className = 'feedback hidden';
  byId('next').classList.add('hidden');
  byId('revealed').classList.add('hidden');
  byId('selfButtons').classList.add('hidden');
  byId('revealBtn').classList.remove('hidden');

  if (mode === 'qcm') {
    const correct = aText(item);
    const wrongs = shuffle(VOCAB.filter(v => v !== item).map(aText)).slice(0,3);
    const options = shuffle([correct, ...wrongs]);
    const box = byId('answers');
    box.innerHTML = '';
    options.forEach(text => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'answer';
      b.textContent = text;
      b.addEventListener('click', () => answerQcm(b, text, correct));
      box.appendChild(b);
    });
  }
}

function answerQcm(button, chosen, correct) {
  if (locked) return;
  locked = true;
  const ok = chosen === correct;
  if (ok) good++;
  all('.answer').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) b.classList.add('correct');
  });
  if (!ok) button.classList.add('wrong');
  const fb = byId('feedback');
  fb.className = 'feedback ' + (ok ? 'good' : 'bad');
  fb.textContent = ok ? '✓ Bonne réponse !' : '✕ Bonne réponse : ' + correct;
  byId('score').textContent = Math.round(good / (index + 1) * 100) + '%';
  byId('next').classList.remove('hidden');
}

function advance() {
  index++;
  if (index >= deck.length) finish();
  else renderQuestion();
}

function finish() {
  const pct = Math.round(good / deck.length * 100);
  safeSet('englishboost_' + mode, JSON.stringify({pct:pct, good:good, total:deck.length}));
  byId('bigScore').textContent = pct + '%';
  byId('resultText').textContent = good + ' bonnes réponses sur ' + deck.length;
  byId('resultMode').textContent = (mode === 'qcm' ? 'Mode QCM' : 'Mode difficile') + ' • ' + (dir === 'en-fr' ? 'Anglais → Français' : 'Français → Anglais');
  show('result');
  updateHome();
}

document.addEventListener('DOMContentLoaded', () => {
  all('[data-mode]').forEach(btn => btn.addEventListener('click', () => {
    mode = btn.dataset.mode;
    all('[data-mode]').forEach(x => x.classList.toggle('active', x === btn));
  }));

  all('[data-dir]').forEach(btn => btn.addEventListener('click', () => {
    dir = btn.dataset.dir;
    all('[data-dir]').forEach(x => x.classList.toggle('active', x === btn));
  }));

  byId('start').addEventListener('click', startQuiz);
  byId('next').addEventListener('click', advance);
  byId('back').addEventListener('click', () => { show('home'); updateHome(); });
  byId('restart').addEventListener('click', startQuiz);
  byId('homeBtn').addEventListener('click', () => { show('home'); updateHome(); });

  byId('revealBtn').addEventListener('click', () => {
    byId('revealed').textContent = aText(deck[index]);
    byId('revealed').classList.remove('hidden');
    byId('selfButtons').classList.remove('hidden');
    byId('revealBtn').classList.add('hidden');
  });
  byId('knew').addEventListener('click', () => { good++; advance(); });
  byId('nope').addEventListener('click', advance);

  updateHome();
});
