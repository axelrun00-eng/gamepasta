const MQTT_BROKER = 'wss://broker.emqx.io:8084/mqtt';
const MQTT_TOPIC = 'gamepasta/axelrun00/sync_db_v1';
let mqttClient = null;

const WIN7_ICONS = {
  news:
    '<svg class="win7-ico" viewBox="0 0 32 32">' +
    '<defs><linearGradient id="w7n" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#8cd3ff"/><stop offset="50%" stop-color="#2b88d8"/><stop offset="100%" stop-color="#104e8b"/>' +
    '</linearGradient></defs>' +
    '<rect x="4" y="3" width="24" height="26" rx="3" fill="url(#w7n)" stroke="#0c3766" stroke-width="1.5"/>' +
    '<path d="M5 4h22v10c-7 2-15 2-22 0V4z" fill="#fff" fill-opacity="0.35"/>' +
    '<rect x="8" y="8" width="16" height="3.5" rx="1" fill="#fff"/>' +
    '<rect x="8" y="14" width="10" height="2.5" rx="1" fill="#dff2ff"/>' +
    '<rect x="8" y="19" width="16" height="2.5" rx="1" fill="#dff2ff"/>' +
    '<rect x="8" y="23.5" width="13" height="2.5" rx="1" fill="#dff2ff"/></svg>',
  shield:
    '<svg class="win7-ico" viewBox="0 0 32 32">' +
    '<defs><linearGradient id="w7sb" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#6ec3ff"/><stop offset="100%" stop-color="#1458a6"/></linearGradient>' +
    '<linearGradient id="w7sy" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#fff078"/><stop offset="100%" stop-color="#e09b00"/></linearGradient></defs>' +
    '<path d="M16 2L5 6v9c0 7.4 4.6 13.8 11 15.5C22.4 28.8 27 22.4 27 15V6L16 2z" fill="#d9e4f0" stroke="#2c3e50" stroke-width="1.5"/>' +
    '<path d="M16 4v11H7V7.5L16 4z" fill="url(#w7sy)"/>' +
    '<path d="M16 4l9 3.5V15h-9V4z" fill="url(#w7sb)"/>' +
    '<path d="M7 15h9v13.2C10.8 26.6 7 21.3 7 15z" fill="url(#w7sb)"/>' +
    '<path d="M16 15h9c0 6.3-3.8 11.6-9 13.2V15z" fill="url(#w7sy)"/>' +
    '<path d="M6 7l10-3.5L26 7v7c-6 2-14 2-20 0V7z" fill="#fff" fill-opacity="0.3"/></svg>',
  warn:
    '<svg class="win7-ico" viewBox="0 0 32 32">' +
    '<defs><linearGradient id="w7w" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#fff48f"/><stop offset="55%" stop-color="#ffd014"/><stop offset="100%" stop-color="#d48800"/>' +
    '</linearGradient></defs>' +
    '<path d="M16 3L2 28h28L16 3z" fill="url(#w7w)" stroke="#7a5200" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<rect x="14.5" y="11" width="3" height="9" rx="1.2" fill="#222"/>' +
    '<circle cx="16" cy="23.5" r="1.8" fill="#222"/></svg>',
  alert:
    '<svg class="win7-ico" viewBox="0 0 32 32">' +
    '<defs><linearGradient id="w7a" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#ff857a"/><stop offset="50%" stop-color="#d92b1c"/><stop offset="100%" stop-color="#871107"/>' +
    '</linearGradient></defs>' +
    '<path d="M16 2L5 6v9c0 7.4 4.6 13.8 11 15.5C22.4 28.8 27 22.4 27 15V6L16 2z" fill="url(#w7a)" stroke="#5c0b04" stroke-width="1.5"/>' +
    '<path d="M11.5 11.5l9 9M20.5 11.5l-9 9" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
  help:
    '<svg class="win7-ico" viewBox="0 0 32 32">' +
    '<defs><radialGradient id="w7h" cx="40%" cy="30%" r="70%">' +
    '<stop offset="0%" stop-color="#9ee0ff"/><stop offset="55%" stop-color="#1c7ed6"/><stop offset="100%" stop-color="#0b3d75"/>' +
    '</radialGradient></defs>' +
    '<circle cx="16" cy="16" r="13" fill="url(#w7h)" stroke="#09305c" stroke-width="1.5"/>' +
    '<text x="16" y="22.5" text-anchor="middle" fill="#fff" font-size="18" font-weight="bold">?</text></svg>',
  folder:
    '<svg class="win7-ico" viewBox="0 0 32 32">' +
    '<defs><linearGradient id="w7fb" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#ffe57f"/><stop offset="100%" stop-color="#d99b16"/></linearGradient>' +
    '<linearGradient id="w7ff" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#fff3a1"/><stop offset="45%" stop-color="#ffd54f"/><stop offset="100%" stop-color="#eba917"/></linearGradient></defs>' +
    '<path d="M3 7c0-1.1.9-2 2-2h7l2.5 2.5H27c1.1 0 2 .9 2 2V25c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7z" fill="url(#w7fb)" stroke="#9c6d08" stroke-width="1.3"/>' +
    '<rect x="6" y="9.5" width="20" height="12" rx="1" fill="#fff"/>' +
    '<path d="M2.5 13h27l-1.2 12.2c-.1 1-.9 1.8-1.9 1.8H5.6c-1 0-1.8-.8-1.9-1.8L2.5 13z" fill="url(#w7ff)" stroke="#9c6d08" stroke-width="1.3"/></svg>',
  gear:
    '<svg class="win7-ico" viewBox="0 0 32 32">' +
    '<circle cx="16" cy="16" r="11" fill="#94a3b8" stroke="#1e293b" stroke-width="2.5"/>' +
    '<circle cx="16" cy="16" r="5" fill="#ece9d8" stroke="#1e293b" stroke-width="1.5"/></svg>'
};

const ICON_CYCLE = ['folder', 'news', 'shield', 'warn', 'alert', 'help', 'gear'];
function getWin7Icon(type) { return WIN7_ICONS[type] || WIN7_ICONS.folder; }
function applySiteTheme(mode) {
  const isMod = (mode === 'modernic');
  document.body.classList.toggle('modernic', isMod);
  const btn = document.getElementById('themeToggleBtn');
  const sub = document.getElementById('themeSubtitle');
  if (btn) btn.textContent = isMod ? '[ Стиль: Modernic ]' : '[ Стиль: OldSchool ]';
  if (sub) sub.textContent = isMod
    ? 'Modernic Dark Gaming Edition • Live Sync'
    : 'Windows XP / 7 Olive Edition • Live Sync';
}

function toggleSiteTheme() {
  const next = document.body.classList.contains('modernic') ? 'oldschool' : 'modernic';
  localStorage.setItem('gp_site_theme', next);
  applySiteTheme(next);
}

applySiteTheme(localStorage.getItem('gp_site_theme') || 'oldschool');

const DEFAULT_AVA =
  'data:image/svg+xml;utf8,' +
  '<svg xmlns="http://w3.org" width="64" height="64">' +
  '<rect width="64" height="64" fill="%23dce4cc"/>' +
  '<circle cx="32" cy="24" r="12" fill="%2359752d"/>' +
  '<path d="M12,58 C12,42 52,42 52,58" fill="%2359752d"/></svg>';

let currentTopic = '';
let activeFriend = '';
let activeConfId = '';
let pollTargetScope = 'home';
let isSaving = false;
let lastSyncTs = 0;
const strictRulesHtml =
  '<b>РАЗДЕЛ 1. ОБЩИЕ ПОЛОЖЕНИЯ</b><br>' +
  '<b>1.1.</b> Запрещено участвовать в мошеннических, провоцирующих, экстремистских и эксплойтных схемах. <i>(Перманентный бан по ID и IP).</i><br>' +
  '<b>1.2.</b> Запрещено выпрашивать пароли и коды доступа, а также сливать личные данные. <i>(Бан навсегда).</i><br>' +
  '<b>1.3.</b> Обход бана через второй аккаунт или смену IP запрещён.<br><br>' +
  '<b>РАЗДЕЛ 2. ИГРОВОЙ ПРОЦЕСС (CS:S И MINECRAFT)</b><br>' +
  '<b>2.1.</b> Запрещены любые <span class="term-tip">читы<span class="tip-box">Постороннее ПО, макросы, WH, Aim, X-Ray</span></span>, макросы и <span class="term-tip">крашеры<span class="tip-box">ПО для краша сервера</span></span>. <i>(Перманентный бан).</i><br>' +
  '<b>2.2.</b> Запрещено срывать ЛР, фрикиллить, мешать союзникам и гриферить постройки.<br>' +
  '<b>2.3.</b> Запрещены оскорбления родных, спам, флуд и реклама сторонних серверов.<br><br>' +
  '<b>РАЗДЕЛ 3. РЕГЛАМЕНТ ПРОВЕРОК</b><br>' +
  '<b>3.1.</b> Проверка проводится <b>только</b> при наличии хотя бы 1 мелкого доказательства.<br>' +
  '<b>3.2.</b> Официальные места проверки: сайт <b>gamepasta.ru в ЛС</b>, ВК, Teams, Telegram, MAX, KakaoTalk.<br>' +
  '<b>3.3.</b> Отказ от проверки или выход из игры = перманентный бан.<br><br>' +
  '<b>РАЗДЕЛ 4. ФОРУМ, КЛАНЫ И КОНФЕРЕНЦИИ</b><br>' +
  '<b>4.1.</b> Простой аккаунт не может писать жалобы на админов, в ЛС, вступать в кланы и голосовать.<br>' +
  '<b>4.2.</b> Запрещено создавать кланы с матом или тегами администрации ([ADM], [MOD]).<br><br>' +
  '<b>РАЗДЕЛ 5. РЕГЛАМЕНТ АДМИНИСТРАЦИИ</b><br>' +
  '<b>5.1.</b> Админка: строго <b>14+</b>, стаж в игре > полгода, спокойствие, грамотность.<br>' +
  '<b>5.2.</b> Админу и модератору категорически запрещено использовать читы и крашеры.<br>' +
  '<b>5.3.</b> Статус <b>«На проверке»</b> (10 дней / подозрение / 2 из 3 предов): проверка проходит <b>только в ЛС на сайте</b>.';

const defaultTopics = {
  news: { title: 'Новости', icon: 'news', posts: [{ owner: 'Основатель', author: 'Основатель', ava: '', text: 'Добро пожаловать на форум GamePasta.ru!', status: '' }] },
  rules: { title: 'Правила', icon: 'shield', posts: [{ owner: 'Основатель', author: 'Основатель', ava: '', status: '', text: strictRulesHtml }] },
  players: { title: 'Жалоба на обычных игроков', icon: 'warn', posts: [{ owner: 'Lakar', author: 'Lakar [Админ]', ava: '', text: 'Игрок Shadow_X забанен за ВХ.', status: 'Одобрено' }] },
  admins: { title: 'Жалоба на админов', icon: 'alert', posts: [{ owner: 'Гражданин Москвы', author: 'Гражданин Москвы', ava: '', text: 'Админ отменил ЛР при 2 игроках.', status: 'Жалоба рассматривается' }] },
  faq: { title: 'Вопросы и ответы', icon: 'help', posts: [{ owner: 'Модератор', author: 'Модератор', ava: '', text: 'Задавайте вопросы по форуму здесь.', status: '' }] }
};
let topicsData = defaultTopics;
let keysCache = { adm: ['GP-ADM-2026-MOSCOW'], mod: ['GP-MOD-9999-BOSS'] };
let pmsCache = {};
let usersCache = ['Lakar', 'Модератор', 'Основатель', 'Философ'];
let socialCache = {};
let bansCache = { ids: ['STEAM_0:0:7771337'], ips: ['185.12.44.90'] };
let serversCache = [];
let serversStatus = {};
let confsCache = [];
let pollsCache = [];
let clansCache = [];

const localBackup = localStorage.getItem('gp_cloud_backup_v4');
if (localBackup) {
  try {
    const b = JSON.parse(localBackup);
    if (b.topics) topicsData = b.topics;
    if (b.keys) keysCache = b.keys;
    if (b.pms) pmsCache = b.pms;
    if (b.users) usersCache = b.users;
    if (b.social) socialCache = b.social;
    if (b.bans) bansCache = b.bans;
    if (Array.isArray(b.servers)) serversCache = b.servers;
    if (Array.isArray(b.confs)) confsCache = b.confs;
    if (Array.isArray(b.polls)) pollsCache = b.polls;
    if (Array.isArray(b.clans)) clansCache = b.clans;
    if (b.ts) lastSyncTs = b.ts;
  } catch (e) {}
}

function saveLocalBackup() {
  localStorage.setItem('gp_cloud_backup_v4', JSON.stringify({
    ts: lastSyncTs, topics: topicsData, keys: keysCache, pms: pmsCache,
    users: usersCache, social: socialCache, bans: bansCache,
    servers: serversCache, confs: confsCache, polls: pollsCache, clans: clansCache
  }));
}
async function checkOneMcServer(ipRaw) {
  const clean = ipRaw.trim();
  const start = Date.now();
  const enc = encodeURIComponent(clean);
  const t = Date.now();
  const urls = [
    `https://mcsrvstat.us{enc}?t=${t}`,
    `https://mcsrvstat.us{enc}?t=${t}`,
    `https://mcstatus.io{enc}`,
    `https://mcstatus.io{enc}`
  ];
  const results = await Promise.all(
    urls.map(u => fetch(u).then(r => r.json()).catch(() => null))
  );
  for (const d of results) {
    if (d && d.online) {
      return {
        online: true,
        ms: Date.now() - start,
        now: d.players ? d.players.online : 0,
        max: d.players ? d.players.max : 20
      };
    }
  }
  return { online: false };
}

async function checkServersPing() {
  for (let i = 0; i < serversCache.length; i++) {
    const s = serversCache.at(i);
    if (!s.ip || s.ip === 'Скоро запуск') {
      serversStatus[i] = { online: false };
      continue;
    }
    if (s.type === 'mc' || s.ip.includes('aternos.me')) {
      serversStatus[i] = await checkOneMcServer(s.ip);
    } else {
      const start = Date.now();
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2000);
      try {
        await fetch('http://' + s.ip, { mode: 'no-cors', signal: ctrl.signal });
        clearTimeout(timer);
        serversStatus[i] = { online: true, ms: Date.now() - start, now: 0, max: s.max };
      } catch (e) {
        clearTimeout(timer);
        serversStatus[i] = { online: false };
      }
    }
  }
  renderServers();
}
function setCloudBadge(txt) {
  const el = document.getElementById('cloudSyncBtn');
  if (el) el.textContent = txt;
}

function initMqttSync() {
  if (typeof mqtt === 'undefined') {
    setCloudBadge('[ Облако: Нет модуля ]');
    return;
  }
  if (mqttClient) return;

  setCloudBadge('[ Облако: Подключение... ]');
  mqttClient = mqtt.connect(MQTT_BROKER, {
    clientId: 'gp_' + Math.random().toString(16).slice(2, 10),
    clean: true,
    reconnectPeriod: 3000
  });

  mqttClient.on('connect', () => {
    setCloudBadge('[ Облако: OK ]');
    mqttClient.subscribe(MQTT_TOPIC);
  });

  mqttClient.on('error', () => {
    setCloudBadge('[ Облако: Ошибка сети ]');
  });

  mqttClient.on('message', (topic, message) => {
    if (isSaving) return;
    try {
      const d = JSON.parse(message.toString());
      if (d && d.topics && (!d.ts || d.ts > lastSyncTs)) {
        lastSyncTs = d.ts || Date.now();
        topicsData = d.topics;
        if (d.keys) keysCache = d.keys;
        if (d.pms) pmsCache = d.pms;
        if (d.users) usersCache = d.users;
        if (d.social) socialCache = d.social;
        if (d.bans) bansCache = d.bans;
        if (Array.isArray(d.servers)) serversCache = d.servers;
        if (Array.isArray(d.confs)) confsCache = d.confs;
        if (Array.isArray(d.polls)) pollsCache = d.polls;
        if (Array.isArray(d.clans)) clansCache = d.clans;
        saveLocalBackup();

        renderHomeTopics();
        if (currentTopic && topicsData[currentTopic]) renderPosts();
        if (activeFriend) renderChat();
        if (document.getElementById('cabinetView').style.display === 'block') {
          renderFriends();
          renderFoes();
          renderConferences();
        }
      }
    } catch (e) {}
  });
}
function forceSyncNow() {
  setCloudBadge('[ Облако: Отправка... ]');
  saveAll();
}

function syncFromCloud() {
  initMqttSync();
  renderHomeTopics();
}

function saveAll() {
  lastSyncTs = Date.now();
  saveLocalBackup();
  if (!mqttClient || !mqttClient.connected) {
    initMqttSync();
    return;
  }
  isSaving = true;
  const cleanTopics = {};
  Object.keys(topicsData).forEach(k => {
    cleanTopics[k] = {
      title: topicsData[k].title,
      icon: topicsData[k].icon || 'folder',
      desc: topicsData[k].desc || '',
      posts: topicsData[k].posts.map(p => ({ ...p, ava: '' }))
    };
  });

  const payload = JSON.stringify({
    ts: lastSyncTs,
    topics: cleanTopics,
    keys: keysCache,
    pms: pmsCache,
    users: usersCache,
    social: socialCache,
    bans: bansCache,
    servers: serversCache,
    confs: confsCache,
    polls: pollsCache,
    clans: clansCache
  });

  mqttClient.publish(MQTT_TOPIC, payload, { retain: true, qos: 1 }, (err) => {
    setCloudBadge(err ? '[ Облако: Ошибка ]' : '[ Облако: Сохранено ]');
    isSaving = false;
  });
}
function getUserClan(username) {
  if (!username) return null;
  return clansCache.find(c => c.members.some(m => m.toLowerCase() === username.toLowerCase())) || null;
}

function openClanModal() {
  const u = getUser();
  if (!u || u.isSimple) return;
  if (getUserClan(u.name)) {
    alert('Вы уже состоите в клане!');
    return;
  }
  document.getElementById('clanModal').style.display = 'flex';
}

function closeClanModal() {
  document.getElementById('clanModal').style.display = 'none';
}

document.getElementById('createClanForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const u = getUser();
  if (!u || u.isSimple || getUserClan(u.name)) return;
  const name = document.getElementById('clanNameInput').value.trim();
  const tag = document.getElementById('clanTagInput').value.trim().toUpperCase();
  const desc = document.getElementById('clanDescInput').value.trim();
  if (!name || !tag) return;

  clansCache.forEach(c => {
    c.requests = (c.requests || []).filter(r => r.toLowerCase() !== u.name.toLowerCase());
  });
  clansCache.push({
    id: 'clan_' + Date.now(),
    name, tag, desc,
    leader: u.name,
    members: [u.name],
    requests: []
  });

  document.getElementById('clanNameInput').value = '';
  document.getElementById('clanTagInput').value = '';
  document.getElementById('clanDescInput').value = '';
  closeClanModal();
  renderClans();
  saveAll();
});

function renderClans() {
  const tbody = document.getElementById('clansTableBody');
  const createBar = document.getElementById('userCreateClanBar');
  if (!tbody) return;
  const u = getUser();
  const myClan = u ? getUserClan(u.name) : null;
  if (createBar) {
    createBar.style.display = (u && !u.isSimple && !myClan) ? 'inline-block' : 'none';
  }
  if (!clansCache || clansCache.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#666;">Кланы пока не созданы.</td></tr>';
    return;
  }

  tbody.innerHTML = clansCache.map(c => {
    const isLeader = u && c.leader.toLowerCase() === u.name.toLowerCase();
    const isMember = u && c.members.some(m => m.toLowerCase() === u.name.toLowerCase());
    const hasReq = u && (c.requests || []).some(r => r.toLowerCase() === u.name.toLowerCase());
    let act = '';
    if (u && !u.isSimple) {
      if (isLeader) act += `<button class="del-btn" onclick="disbandClan('${c.id}')">[Распустить]</button>`;
      else if (isMember) act += `<button class="logout-btn" onclick="leaveClan('${c.id}')">[Покинуть]</button>`;
      else if (!myClan) {
        act += hasReq
          ? '<span class="badge badge-wait">Заявка отправлена</span>'
          : `<button class="btn-small" onclick="applyToClan('${c.id}')">[Подать заявку]</button>`;
      }
      if (u.isMod && !isLeader) act += `<button class="del-btn" onclick="disbandClan('${c.id}')">[X]</button>`;
    }
    let reqs = '';
    if (isLeader && c.requests && c.requests.length > 0) {
      reqs = '<div style="margin-top:5px; padding:4px; border:1px dashed #59752d; font-size:10px;"><b>Заявки:</b> ' +
        c.requests.map(r =>
          `<span class="key-tag">${r} ` +
          `<b style="color:#22c55e; cursor:pointer;" onclick="handleClanReq('${c.id}', '${r}', true)">[✔]</b> ` +
          `<b style="color:#ef4444; cursor:pointer;" onclick="handleClanReq('${c.id}', '${r}', false)">[✖]</b></span>`
        ).join('') + '</div>';
    }
    return `<tr class="topic-row">` +
      `<td><b>[${c.tag}] ${c.name}</b><div class="topic-desc">${c.desc}</div>` +
      `<div class="topic-desc"><i>Участники: ${c.members.join(', ')}</i></div></td>` +
      `<td><b>${c.leader}</b></td>` +
      `<td style="text-align:center;">${c.members.length} чел.</td>` +
      `<td style="text-align:center;">${act || '—'}${reqs}</td></tr>`;
  }).join('');
}
function applyToClan(clanId) {
  const u = getUser();
  if (!u || u.isSimple || getUserClan(u.name)) return;
  const c = clansCache.find(x => x.id === clanId);
  if (!c) return;
  if (!c.requests) c.requests = [];
  if (!c.requests.some(r => r.toLowerCase() === u.name.toLowerCase())) {
    c.requests.push(u.name);
  }
  renderClans();
  saveAll();
}

function handleClanReq(clanId, nick, accept) {
  const u = getUser();
  const c = clansCache.find(x => x.id === clanId);
  if (!u || !c || c.leader.toLowerCase() !== u.name.toLowerCase()) return;
  c.requests = (c.requests || []).filter(r => r.toLowerCase() !== nick.toLowerCase());
  if (accept && !getUserClan(nick)) {
    c.members.push(nick);
  }
  renderClans();
  saveAll();
}

function leaveClan(clanId) {
  const u = getUser();
  const c = clansCache.find(x => x.id === clanId);
  if (!u || !c) return;
  c.members = c.members.filter(m => m.toLowerCase() !== u.name.toLowerCase());
  renderClans();
  saveAll();
}

function disbandClan(clanId) {
  clansCache = clansCache.filter(c => c.id !== clanId);
  renderClans();
  saveAll();
}
function openPollModal(scope) {
  const u = getUser();
  if (!u || (!u.isAdm && !u.isMod)) return;
  pollTargetScope = scope;
  document.getElementById('pollModal').style.display = 'flex';
}

function closePollModal() {
  document.getElementById('pollModal').style.display = 'none';
}

document.getElementById('createPollForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const u = getUser();
  if (!u || (!u.isAdm && !u.isMod)) return;
  const q = document.getElementById('pollQuestionInput').value.trim();
  const rawOpts = document.getElementById('pollOptionsInput').value
    .split('\n').map(x => x.trim()).filter(Boolean);
  if (!q || rawOpts.length < 2) {
    alert('Введите вопрос и минимум 2 варианта ответа!');
    return;
  }

  let targetId = 'home';
  if (pollTargetScope === 'topic') targetId = 'topic:' + currentTopic;
  if (pollTargetScope === 'conf') targetId = 'conf:' + activeConfId;

  pollsCache.push({
    id: 'poll_' + Date.now(),
    target: targetId,
    author: u.name,
    question: q,
    anon: document.getElementById('pollAnonCheck').checked,
    multi: document.getElementById('pollMultiCheck').checked,
    allowCustom: document.getElementById('pollCustomCheck').checked,
    options: rawOpts.map(txt => ({ text: txt, voters: [] }))
  });

  document.getElementById('pollQuestionInput').value = '';
  document.getElementById('pollOptionsInput').value = '';
  document.getElementById('pollAnonCheck').checked = false;
  document.getElementById('pollMultiCheck').checked = false;
  document.getElementById('pollCustomCheck').checked = false;
  closePollModal();
  renderAllPolls();
  saveAll();
});

function renderAllPolls() {
  renderPollsForTarget('home', 'homePollsContainer');
  if (currentTopic) renderPollsForTarget('topic:' + currentTopic, 'topicPollsContainer');
  if (activeConfId) renderPollsForTarget('conf:' + activeConfId, 'confPollsContainer');
}
function renderPollsForTarget(targetId, containerId) {
  const box = document.getElementById(containerId);
  if (!box) return;
  const u = getUser();
  const list = pollsCache.filter(p => p.target === targetId);
  if (list.length === 0) {
    box.innerHTML = '';
    return;
  }

  box.innerHTML = list.map(p => {
    const totalVotes = p.options.reduce((sum, o) => sum + o.voters.length, 0);
    const userVotedAny = u && p.options.some(o => o.voters.includes(u.name));
    const canVote = u && !u.isSimple && !(p.anon && userVotedAny);
    const delBtn = (u && (u.isAdm || u.isMod))
      ? `<button class="del-btn" onclick="deletePoll('${p.id}')">[Удалить опрос]</button>` : '';
    const tags = [
      p.anon ? 'Аноним-режим' : 'Открытый',
      p.multi ? 'Несколько вариантов' : 'Один вариант',
      p.allowCustom ? 'Можно свой вариант' : ''
    ].filter(Boolean).join(' • ');

    const optsHtml = p.options.map((o, idx) => {
      const isMine = u && o.voters.includes(u.name);
      const pct = totalVotes > 0 ? Math.round((o.voters.length / totalVotes) * 100) : 0;
      const stats = p.anon
        ? (isMine ? ' <b>[Ваш голос учтён]</b>' : '')
        : ` — <b>${o.voters.length}</b> (${pct}%)`;
      const clickAttr = canVote ? `onclick="votePoll('${p.id}', ${idx})"` : '';
      const cursor = canVote ? 'cursor:pointer;' : 'opacity:0.85;';
      return `<div ${clickAttr} style="padding:5px 8px; margin:4px 0; border:1px solid #799452; background:${isMine ? '#dce8c8' : 'rgba(128,128,128,0.1)'}; ${cursor}">` +
        `<span>${isMine ? '☑ ' : '☐ '}${o.text}</span>${stats}</div>`;
    }).join('');

    const customHtml = (p.allowCustom && u && !u.isSimple && !(p.anon && userVotedAny))
      ? `<div style="margin-top:6px; display:flex; gap:5px;">` +
        `<input type="text" id="customOpt_${p.id}" placeholder="Написать свой вариант..." style="flex:1;">` +
        `<button class="logout-btn" onclick="addCustomPollOption('${p.id}')">+ Добавить</button></div>`
      : '';
    const anonNote = (p.anon && userVotedAny)
      ? '<div style="font-size:10px; color:#22c55e; margin-top:4px;">Вы проголосовали в анонимном опросе.</div>'
      : '';

    return `<div class="post-box"><div class="post-header">` +
      `<span><b>ОПРОС:</b> ${p.question} <span style="font-size:10px; opacity:0.8;">(${tags})</span></span>` +
      `<span>Автор: ${p.author}${delBtn}</span></div><div>${optsHtml}</div>${customHtml}${anonNote}</div>`;
  }).join('');
}

function votePoll(pollId, optIdx) {
  const u = getUser();
  if (!u || u.isSimple) return;
  const p = pollsCache.find(x => x.id === pollId);
  if (!p || (p.anon && p.options.some(o => o.voters.includes(u.name)))) return;
  const targetOpt = p.options.at(optIdx);
  if (!targetOpt) return;

  if (p.multi) {
    const pos = targetOpt.voters.indexOf(u.name);
    if (pos >= 0) targetOpt.voters.splice(pos, 1);
    else targetOpt.voters.push(u.name);
  } else {
    p.options.forEach(o => {
      const pos = o.voters.indexOf(u.name);
      if (pos >= 0) o.voters.splice(pos, 1);
    });
    targetOpt.voters.push(u.name);
  }
  renderAllPolls();
  saveAll();
}

function addCustomPollOption(pollId) {
  const u = getUser();
  if (!u || u.isSimple) return;
  const inp = document.getElementById('customOpt_' + pollId);
  if (!inp || !inp.value.trim()) return;
  const p = pollsCache.find(x => x.id === pollId);
  if (!p || !p.allowCustom) return;
  p.options.push({ text: inp.value.trim(), voters: [u.name] });
  renderAllPolls();
  saveAll();
}

function deletePoll(pollId) {
  pollsCache = pollsCache.filter(x => x.id !== pollId);
  renderAllPolls();
  saveAll();
}
function renderServers() {
  const tbody = document.getElementById('serversMonitorBody');
  const srvBar = document.getElementById('modAddServerBar');
  if (!tbody) return;
  const u = getUser();
  if (srvBar) srvBar.style.display = (u && u.isMod) ? 'inline-block' : 'none';

  if (!serversCache || serversCache.length === 0) {
    tbody.innerHTML = '<tr><td><b>Серверы не добавлены</b></td><td>—</td>' +
      '<td style="text-align:center;">0/0</td>' +
      '<td style="text-align:center; color:#ef4444; font-weight:bold;">No running</td></tr>';
    return;
  }

  tbody.innerHTML = serversCache.map((s, idx) => {
    const st = serversStatus[idx];
    const isUp = st && st.online;
    const pingText = isUp
      ? `<span style="color:#22c55e; font-weight:bold;">Online (${st.ms} ms)</span>`
      : '<span style="color:#ef4444; font-weight:bold;">No running</span>';
    const players = isUp ? `${st.now}/${st.max || s.max}` : `0/${s.max}`;
    const delBtn = (u && u.isMod) ? `<button class="del-btn" onclick="deleteServer(${idx})">[X]</button>` : '';
    return `<tr class="topic-row"><td><b>${s.name}</b></td>` +
      `<td style="font-family:monospace;">${s.ip}</td>` +
      `<td style="text-align:center;">${players}</td>` +
      `<td style="text-align:center;">${pingText}${delBtn}</td></tr>`;
  }).join('');
}

function openServerModal() { document.getElementById('addServerModal').style.display = 'flex'; }
function closeServerModal() { document.getElementById('addServerModal').style.display = 'none'; }

document.getElementById('createServerForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const u = getUser();
  if (!u || !u.isMod) return;
  serversCache.push({
    type: document.getElementById('srvType').value,
    name: document.getElementById('srvName').value.trim(),
    ip: document.getElementById('srvIp').value.trim(),
    max: document.getElementById('srvMax').value.trim() || '20'
  });
  document.getElementById('srvName').value = '';
  document.getElementById('srvIp').value = '';
  closeServerModal();
  renderServers();
  saveAll();
  checkServersPing();
});

function deleteServer(idx) {
  serversCache.splice(idx, 1);
  renderServers();
  saveAll();
}
function getRoomId(u1, u2) { return [u1.toLowerCase(), u2.toLowerCase()].sort().join('__'); }

function cycleTopicIcon(key) {
  const u = getUser();
  if (!u || !u.isMod || !topicsData[key]) return;
  const cur = topicsData[key].icon || 'folder';
  topicsData[key].icon = ICON_CYCLE.at((ICON_CYCLE.indexOf(cur) + 1) % ICON_CYCLE.length);
  renderHomeTopics();
  saveAll();
}

function renderHomeTopics() {
  renderServers();
  renderClans();
  renderAllPolls();
  const tbody = document.getElementById('dynamicTopicsBody');
  if (!tbody) return;
  const u = getUser();
  const pollBar = document.getElementById('staffHomePollBar');
  if (pollBar) pollBar.style.display = (u && (u.isAdm || u.isMod)) ? 'block' : 'none';

  const newsCell = document.getElementById('staticRow-news');
  if (newsCell && topicsData.news) {
    const ico = getWin7Icon(topicsData.news.icon || 'news');
    const chg = (u && u.isMod)
      ? `<button class="logout-btn" style="margin-left:6px; padding:1px 5px; font-size:10px;" onclick="cycleTopicIcon('news')">[Значок]</button>`
      : '';
    newsCell.innerHTML = `${ico}<a class="topic-title" onclick="openTopic('news')">Новости</a>${chg}` +
      '<div class="topic-desc">Обновления серверов и события.</div>';
  }
  const rulesCell = document.getElementById('staticRow-rules');
  if (rulesCell && topicsData.rules) {
    const ico = getWin7Icon(topicsData.rules.icon || 'shield');
    const chg = (u && u.isMod)
      ? `<button class="logout-btn" style="margin-left:6px; padding:1px 5px; font-size:10px;" onclick="cycleTopicIcon('rules')">[Значок]</button>`
      : '';
    rulesCell.innerHTML = `${ico}<a class="topic-title" onclick="openTopic('rules')">Правила</a>${chg}` +
      '<div class="topic-desc">Строгий устав сервера и регламент проверок.</div>';
  }

  tbody.innerHTML = '';
  const descs = {
    players: 'Читы, фрикиллы и реклама серверов.',
    admins: 'Нарушения регламента администраторами.',
    faq: 'Помощь новичкам и заявки на админку.'
  };
  const defIcons = { players: 'warn', admins: 'alert', faq: 'help' };

  Object.keys(topicsData).forEach(key => {
    if (key === 'news' || key === 'rules') return;
    const t = topicsData[key];
    const ico = getWin7Icon(t.icon || defIcons[key] || 'folder');
    const chg = (u && u.isMod)
      ? `<button class="logout-btn" style="margin-left:6px; padding:1px 5px; font-size:10px;" onclick="cycleTopicIcon('${key}')">[Значок]</button>`
      : '';
    const delBtn = (u && u.isMod && !['players', 'admins', 'faq'].includes(key))
      ? `<button class="del-btn" onclick="deleteCustomTopic('${key}')">[Удалить тему]</button>`
      : '';
    tbody.innerHTML += `<tr class="topic-row"><td>${ico}<a class="topic-title" onclick="openTopic('${key}')">${t.title}</a>${chg}${delBtn}` +
      `<div class="topic-desc">${t.desc || descs[key] || 'Обсуждение темы.'}</div></td>` +
      `<td style="text-align:center;" id="count-${key}">${t.posts.length}</td></tr>`;
  });
  if (topicsData.news) document.getElementById('count-news').textContent = topicsData.news.posts.length;
  if (topicsData.rules) document.getElementById('count-rules').textContent = topicsData.rules.posts.length;
}

function openNewTopicModal() { document.getElementById('newTopicModal').style.display = 'flex'; }
function closeNewTopicModal() { document.getElementById('newTopicModal').style.display = 'none'; }

document.getElementById('createTopicForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const u = getUser();
  if (!u || !u.isMod) return;
  const title = document.getElementById('newTopicTitle').value.trim();
  const icon = document.getElementById('newTopicIcon').value || 'folder';
  const desc = document.getElementById('newTopicDesc').value.trim();
  const text = document.getElementById('newTopicFirstPost').value.trim();
  if (!title || !text) return;
  const clan = getUserClan(u.name);
  topicsData['topic_' + Date.now()] = {
    title, icon, desc,
    posts: [{ owner: u.name, author: `${clan ? `[${clan.tag}] ` : ''}${u.name} [${u.role}]`, ava: u.ava || '', text, status: '' }]
  };
  document.getElementById('newTopicTitle').value = '';
  document.getElementById('newTopicDesc').value = '';
  document.getElementById('newTopicFirstPost').value = '';
  closeNewTopicModal();
  renderHomeTopics();
  saveAll();
});

function deleteCustomTopic(key) { delete topicsData[key]; renderHomeTopics(); saveAll(); }

function renderBans() {
  document.getElementById('bannedIdsList').innerHTML = bansCache.ids.map((item, i) =>
    `<span class="key-tag">${item} <b style="color:#ef4444; cursor:pointer;" onclick="removeBan('id', ${i})">[X]</b></span>`
  ).join('') || '<span style="color:#666;">Нет банов</span>';
  document.getElementById('bannedIpsList').innerHTML = bansCache.ips.map((item, i) =>
    `<span class="key-tag">${item} <b style="color:#ef4444; cursor:pointer;" onclick="removeBan('ip', ${i})">[X]</b></span>`
  ).join('') || '<span style="color:#666;">Нет банов</span>';
}

function addBan(type) {
  const inp = document.getElementById(type === 'id' ? 'banIdInput' : 'banIpInput');
  const val = inp.value.trim();
  if (!val) return;
  if (type === 'id' && !bansCache.ids.includes(val)) bansCache.ids.push(val);
  if (type === 'ip' && !bansCache.ips.includes(val)) bansCache.ips.push(val);
  inp.value = '';
  renderBans();
  saveAll();
}

function removeBan(type, idx) {
  if (type === 'id') bansCache.ids.splice(idx, 1);
  else bansCache.ips.splice(idx, 1);
  renderBans();
  saveAll();
}
function createConference() {
  const u = getUser();
  if (!u || !u.isMod) return;
  const inp = document.getElementById('newConfNameInput');
  const title = inp.value.trim();
  if (!title) return;
  const id = 'conf_' + Date.now();
  confsCache.push({
    id, title, owner: u.name, members: [u.name],
    messages: [`<i>Модератор <b>${u.name}</b> создал конференцию «${title}»</i>`]
  });
  inp.value = '';
  activeConfId = id;
  renderConferences();
  saveAll();
}

function renderConferences() {
  const u = getUser();
  const listBox = document.getElementById('confListBox');
  const createBar = document.getElementById('modCreateConfBar');
  if (!listBox || !u) return;
  if (createBar) createBar.style.display = u.isMod ? 'block' : 'none';

  const visibleConfs = confsCache.filter(c =>
    u.isMod || c.members.some(m => m.toLowerCase() === u.name.toLowerCase())
  );
  listBox.innerHTML = visibleConfs.map(c => {
    const cls = (c.id === activeConfId) ? 'friend-item friend-active' : 'friend-item';
    const del = u.isMod
      ? `<span onclick="event.stopPropagation(); deleteConference('${c.id}')" style="color:#ef4444; font-weight:bold;">[X]</span>`
      : '';
    return `<div class="${cls}" onclick="selectConference('${c.id}')"><span># ${c.title}</span>${del}</div>`;
  }).join('') || '<span style="color:#777;">Нет конференций</span>';

  const active = confsCache.find(c => c.id === activeConfId);
  const titleEl = document.getElementById('confActiveTitle');
  const memEl = document.getElementById('confMembersBox');
  const invBar = document.getElementById('modInviteConfBar');
  const sendArea = document.getElementById('confSendArea');
  const pollBtn = document.getElementById('staffConfPollBtn');
  const logEl = document.getElementById('confChatLog');

  if (!active) {
    titleEl.textContent = 'Выберите конференцию слева';
    memEl.innerHTML = '';
    invBar.style.display = 'none';
    sendArea.style.display = 'none';
    pollBtn.style.display = 'none';
    logEl.innerHTML = '';
    document.getElementById('confPollsContainer').innerHTML = '';
    return;
  }

  titleEl.textContent = `Конференция: ${active.title}`;
  memEl.innerHTML = '<b>Участники:</b> ' + active.members.map(m => `<span class="key-tag">${m}</span>`).join('');
  invBar.style.display = u.isMod ? 'block' : 'none';
  sendArea.style.display = 'block';
  pollBtn.style.display = (u.isAdm || u.isMod) ? 'inline-block' : 'none';
  renderPollsForTarget('conf:' + active.id, 'confPollsContainer');
  logEl.innerHTML = active.messages.map(m => `<div style="margin-bottom:4px;">${m}</div>`).join('');
  logEl.scrollTop = logEl.scrollHeight;
}

function selectConference(id) { activeConfId = id; renderConferences(); }
function deleteConference(id) {
  confsCache = confsCache.filter(c => c.id !== id);
  if (activeConfId === id) activeConfId = '';
  renderConferences();
  saveAll();
}

function inviteToConference() {
  const u = getUser();
  if (!u || !u.isMod || !activeConfId) return;
  const inp = document.getElementById('inviteConfNickInput');
  const nick = inp.value.trim();
  const conf = confsCache.find(c => c.id === activeConfId);
  if (!nick || !conf) return;
  if (!conf.members.some(m => m.toLowerCase() === nick.toLowerCase())) {
    conf.members.push(nick);
    conf.messages.push(`<i><b>${u.name}</b> пригласил участника <b>${nick}</b></i>`);
  }
  inp.value = '';
  renderConferences();
  saveAll();
}

function sendConfMsg() {
  const u = getUser();
  if (!u || u.isSimple || !activeConfId) return;
  const inp = document.getElementById('confMsgInput');
  const txt = inp.value.trim();
  const conf = confsCache.find(c => c.id === activeConfId);
  if (!txt || !conf) return;
  conf.messages.push(`<b>${u.name}:</b> ${txt}`);
  inp.value = '';
  renderConferences();
  saveAll();
}
function uploadAvatar(event) {
  const file = event.target.files.item(0);
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      canvas.getContext('2d').drawImage(img, 0, 0, 64, 64);
      const u = getUser();
      if (u) {
        u.ava = canvas.toDataURL('image/jpeg', 0.75);
        localStorage.setItem('gamepasta_user', JSON.stringify(u));
        renderUser();
        openCabinet();
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function resetAvatar() {
  const u = getUser();
  if (!u) return;
  u.ava = '';
  localStorage.setItem('gamepasta_user', JSON.stringify(u));
  renderUser();
  openCabinet();
}

function createNewKey(type) {
  const code = `GP-${type}-${Math.floor(1000 + Math.random() * 9000)}-KEY`;
  if (type === 'ADM') keysCache.adm.push(code);
  else keysCache.mod.push(code);
  renderKeysList();
  alert(`Создан ключ (${type}): ${code}`);
  saveAll();
}

function deleteKey(type, idx) {
  if (type === 'ADM') keysCache.adm.splice(idx, 1);
  else keysCache.mod.splice(idx, 1);
  renderKeysList();
  saveAll();
}

function renderKeysList() {
  let html = '<div><b>Админ:</b> ' + keysCache.adm.map((k, i) =>
    `<span class="key-tag">${k} <b style="color:#ef4444; cursor:pointer;" onclick="deleteKey('ADM', ${i})">[X]</b></span>`
  ).join('') + '</div>';
  html += '<div style="margin-top:4px;"><b>Модер:</b> ' + keysCache.mod.map((k, i) =>
    `<span class="key-tag">${k} <b style="color:#ef4444; cursor:pointer;" onclick="deleteKey('MOD', ${i})">[X]</b></span>`
  ).join('') + '</div>';
  document.getElementById('keysListDisplay').innerHTML = html;
}

function openModal() { document.getElementById('loginModal').style.display = 'flex'; }
function closeModal() { document.getElementById('loginModal').style.display = 'none'; }

function toggleSimple() {
  const s = document.getElementById('simpleAccCheck').checked;
  document.getElementById('email').disabled = s;
  document.getElementById('email').required = !s;
  document.getElementById('password').disabled = s;
  document.getElementById('password').required = !s;
  document.getElementById('noCodeCheck').checked = true;
  document.getElementById('noCodeCheck').disabled = s;
  toggleAdmin();
  document.getElementById('modCheck').checked = false;
  document.getElementById('modCheck').disabled = s;
  toggleMod();
  document.getElementById('linkCheck').checked = false;
  document.getElementById('linkCheck').disabled = s;
  toggleLink();
  document.getElementById('hideStatusCheck').checked = s;
  document.getElementById('hideStatusCheck').disabled = s;
}

function toggleAdmin() { document.getElementById('adminCode').disabled = document.getElementById('noCodeCheck').checked; }
function toggleMod() { document.getElementById('modBox').style.display = document.getElementById('modCheck').checked ? 'block' : 'none'; }
function toggleLink() { document.getElementById('linkBox').style.display = document.getElementById('linkCheck').checked ? 'block' : 'none'; }
function getUser() {
  const r = localStorage.getItem('gamepasta_user');
  return r ? JSON.parse(r) : null;
}

function renderUser() {
  const u = getUser();
  const p = document.getElementById('savedUserPanel');
  const b = document.getElementById('openLoginBtn');
  const bar = document.getElementById('modCreateTopicBar');
  if (u) {
    const clan = getUserClan(u.name);
    const clanBadge = clan ? ` • Клан: <b>[${clan.tag}] ${clan.name}</b>` : '';
    document.getElementById('savedUserText').innerHTML =
      `<img src="${u.ava || DEFAULT_AVA}" class="ava-mini">` +
      `<span>Ник: <b>${u.name}</b> • Группа: <b>${u.role}</b>${clanBadge}${u.hideStatus ? ' [Невидимка]' : ' [Онлайн]'}</span>`;
    p.style.display = 'flex';
    b.textContent = '[ Сменить ник ]';
    if (bar) bar.style.display = u.isMod ? 'block' : 'none';
  } else {
    p.style.display = 'none';
    b.textContent = '[ Вход / Регистрация ]';
    if (bar) bar.style.display = 'none';
  }
  renderHomeTopics();
}

function logoutUser() {
  localStorage.removeItem('gamepasta_user');
  renderUser();
  showHome();
}

document.getElementById('authForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('username').value.trim();
  const isSimple = document.getElementById('simpleAccCheck').checked;
  const noCode = document.getElementById('noCodeCheck').checked;
  const admVal = document.getElementById('adminCode').value.trim();
  const isModCheck = document.getElementById('modCheck').checked;
  const modVal = document.getElementById('modCode').value.trim();
  const hideStatus = document.getElementById('hideStatusCheck').checked;
  let isAdm = false;
  let isMod = false;

  if (!isSimple && !noCode) {
    if (!keysCache.adm.includes(admVal)) { alert('ОШИБКА: Неверный код администрации!'); return; }
    isAdm = true;
  }
  if (!isSimple && isModCheck) {
    if (!keysCache.mod.includes(modVal)) { alert('ОШИБКА: Неверный код модератора!'); return; }
    isMod = true;
  }

  let role = 'Обычный игрок';
  if (isSimple) role = 'Простой аккаунт';
  else if (isAdm && isMod) role = 'Главный Админ-Модератор';
  else if (isMod) role = 'Админ-модератор';
  else if (isAdm) role = 'Админ-игрок [На проверке]';

  const old = getUser();
  const ava = (old && old.name === name && !isSimple) ? (old.ava || '') : '';
  const bio = (old && old.name === name && !isSimple) ? (old.bio || '') : '';
  localStorage.setItem('gamepasta_user', JSON.stringify({ name, role, isSimple, isAdm, isMod, hideStatus, ava, bio }));

  if (!isSimple && !usersCache.some(u => u.toLowerCase() === name.toLowerCase())) {
    usersCache.push(name);
    saveAll();
  }
  renderUser();
  closeModal();
  if (currentTopic) openTopic(currentTopic);
});

function showHome() {
  currentTopic = '';
  activeFriend = '';
  document.getElementById('homeView').style.display = 'block';
  document.getElementById('topicView').style.display = 'none';
  document.getElementById('cabinetView').style.display = 'none';
  document.getElementById('breadcrumbs').innerHTML = '<a onclick="showHome()">Список форумов</a> &raquo; Главное меню';
  syncFromCloud();
}

function getUserSocial() {
  const u = getUser();
  if (!u) return { friends: ['Lakar', 'Модератор'], foes: [] };
  const key = u.name.toLowerCase();
  if (!socialCache[key]) socialCache[key] = { friends: ['Lakar', 'Модератор'], foes: [] };
  return socialCache[key];
}

function getFriends() { return getUserSocial().friends; }
function getFoes() { return getUserSocial().foes; }

function saveSocialData(friendsArr, foesArr) {
  const u = getUser();
  if (!u) return;
  socialCache[u.name.toLowerCase()] = { friends: friendsArr, foes: foesArr };
  saveAll();
}

function saveBio() {
  const u = getUser();
  if (!u || u.isSimple) return;
  u.bio = document.getElementById('userBioInput').value.trim();
  localStorage.setItem('gamepasta_user', JSON.stringify(u));
  const note = document.getElementById('bioSavedNote');
  note.textContent = ' Сохранено!';
  setTimeout(() => { note.textContent = ''; }, 2500);
}

function openCabinet() {
  const u = getUser();
  if (!u) { openModal(); return; }
  currentTopic = '';
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('topicView').style.display = 'none';
  document.getElementById('cabinetView').style.display = 'block';
  document.getElementById('breadcrumbs').innerHTML = '<a onclick="showHome()">Список форумов</a> &raquo; Личный раздел';

  document.getElementById('cabAvatarImg').src = u.ava || DEFAULT_AVA;
  document.getElementById('cabProfileInfo').innerHTML =
    `<b>Ник:</b> ${u.name}<br><b>Группа:</b> ${u.role}<br><b>Статус:</b> ${u.hideStatus ? 'Скрыт (Невидимка)' : 'Виден всем (Онлайн)'}`;
  const clan = getUserClan(u.name);
  document.getElementById('cabClanInfo').innerHTML = clan
    ? `<b>Клан:</b> [${clan.tag}] ${clan.name} (${clan.leader === u.name ? 'Лидер' : 'Участник'})`
    function renderFriends() {
  const box = document.getElementById('friendsListBox');
  if (!box) return;
  box.innerHTML = getFriends().map((f, idx) => {
    const cls = (f === activeFriend) ? 'friend-item friend-active' : 'friend-item';
    return `<div class="${cls}" onclick="selectFriend('${f}')">` +
      `<span>${f}</span>` +
      `<span onclick="event.stopPropagation(); delFriend(${idx})" style="color:#ef4444; font-weight:bold;">[X]</span></div>`;
  }).join('');
}

function renderFoes() {
  const box = document.getElementById('foesListBox');
  if (!box) return;
  box.innerHTML = getFoes().map((f, idx) =>
    `<div class="foe-item"><span>${f}</span>` +
    `<span onclick="delFoe(${idx})" style="color:#ef4444; font-weight:bold; cursor:pointer;">[X]</span></div>`
  ).join('');
}

function setStatusText(elId, msg, isErr) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.style.color = isErr ? '#ef4444' : '#22c55e';
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 3000);
}

function addFriend() {
  const inp = document.getElementById('newFriendInput');
  const raw = inp.value.trim();
  if (!raw) return;
  const me = getUser();
  if (me && me.name.toLowerCase() === raw.toLowerCase()) {
    setStatusText('friendStatusMsg', 'Нельзя добавить себя', true);
    return;
  }
  const existing = usersCache.find(u => u.toLowerCase() === raw.toLowerCase());
  const friendName = existing || raw;
  if (!existing) usersCache.push(friendName);

  const list = getFriends();
  if (!list.some(x => x.toLowerCase() === friendName.toLowerCase())) {
    list.push(friendName);
    inp.value = '';
    renderFriends();
    setStatusText('friendStatusMsg', `Добавлен: ${friendName}`, false);
    saveSocialData(list, getFoes());
  } else {
    inp.value = '';
    setStatusText('friendStatusMsg', 'Уже в друзьях', true);
  }
}

function addFoe() {
  const inp = document.getElementById('newFoeInput');
  const raw = inp.value.trim();
  if (!raw) return;
  const me = getUser();
  if (me && me.name.toLowerCase() === raw.toLowerCase()) {
    setStatusText('foeStatusMsg', 'Нельзя добавить себя', true);
    return;
  }
  const existing = usersCache.find(u => u.toLowerCase() === raw.toLowerCase());
  const foeName = existing || raw;
  const foes = getFoes();
  if (!foes.some(x => x.toLowerCase() === foeName.toLowerCase())) {
    foes.push(foeName);
    const newFriends = getFriends().filter(x => x.toLowerCase() !== foeName.toLowerCase());
    inp.value = '';
    renderFriends();
    renderFoes();
    setStatusText('foeStatusMsg', `В ЧС: ${foeName}`, false);
    saveSocialData(newFriends, foes);
  } else {
    inp.value = '';
  }
}

function delFriend(idx) {
  const list = getFriends();
  if (list[idx] === activeFriend) {
    activeFriend = '';
    document.getElementById('pmSendArea').style.display = 'none';
    document.getElementById('chatWithTitle').textContent = 'Выберите друга для ЛС';
  }
  list.splice(idx, 1);
  renderFriends();
  saveSocialData(list, getFoes());
}

function delFoe(idx) {
  const list = getFoes();
  list.splice(idx, 1);
  renderFoes();
  saveSocialData(getFriends(), list);
}

function selectFriend(name) {
  activeFriend = name;
  document.getElementById('chatWithTitle').textContent = `ЛС с: ${name}`;
  document.getElementById('pmSendArea').style.display = 'block';
  renderFriends();
  renderChat();
}

function renderChat() {
  const u = getUser();
  if (!u || !activeFriend) return;
  const msgs = pmsCache[getRoomId(u.name, activeFriend)] || [];
  const log = document.getElementById('pmChatLog');
  log.innerHTML = msgs.length
    ? msgs.map(m => `<div style="margin-bottom:4px;">${m}</div>`).join('')
    : '<span style="color:#777;">Сообщений нет.</span>';
  log.scrollTop = log.scrollHeight;
}

function sendPM() {
  const u = getUser();
  const inp = document.getElementById('pmInput');
  const txt = inp.value.trim();
  if (!txt || !activeFriend || !u) return;
  const room = getRoomId(u.name, activeFriend);
  if (!pmsCache[room]) pmsCache[room] = [];
  pmsCache[room].push(`<b>${u.name}:</b> ${txt}`);
  inp.value = '';
  renderChat();
  saveAll();
}

function openTopic(id) {
  currentTopic = id;
  activeFriend = '';
  const t = topicsData[id];
  const u = getUser();
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('cabinetView').style.display = 'none';
  document.getElementById('topicView').style.display = 'block';
  document.getElementById('topicHeaderTitle').textContent = t.title;
  document.getElementById('breadcrumbs').innerHTML = `<a onclick="showHome()">Список форумов</a> &raquo; ${t.title}`;

  const pollBtn = document.getElementById('staffTopicPollBtn');
  if (pollBtn) pollBtn.style.display = (u && (u.isAdm || u.isMod)) ? 'inline-block' : 'none';
  const box = document.getElementById('replyBox');
  if ((id === 'news' || id === 'rules') && (!u || !u.isMod)) {
    box.style.display = 'none';
  } else {
    box.style.display = 'block';
    document.getElementById('simpleWarnText').style.display = (u && u.isSimple && id === 'admins') ? 'block' : 'none';
    document.getElementById('postText').disabled = (u && u.isSimple && id === 'admins');
  }
  renderPollsForTarget('topic:' + id, 'topicPollsContainer');
  renderPosts();
}

function renderPosts() {
  const t = topicsData[currentTopic];
  const u = getUser();
  const foes = getFoes();
  document.getElementById('postsContainer').innerHTML = t.posts.map((p, idx) => {
    if (foes.includes(p.owner)) {
      return `<div class="post-box" style="background:#f5d6d6; color:#800000;">Сообщение от <b>${p.owner}</b> скрыто (в недругах).</div>`;
    }
    const badge = p.status === 'Жалоба рассматривается'
      ? `<div class="badge badge-wait">${p.status}</div>`
      : (p.status === 'Одобрено' ? `<div class="badge badge-ok">${p.status}</div>` : '');
    const del = (u && (u.name === p.owner || u.isMod))
      ? `<button class="del-btn" onclick="delPost(${idx})">[Удалить]</button>` : '';
    const mod = (u && u.isMod && (currentTopic === 'players' || currentTopic === 'admins'))
      ? `<div style="margin-top:6px;"><button class="logout-btn" onclick="setSt(${idx}, 'Жалоба рассматривается')">На рассмотрение</button> <button class="logout-btn" onclick="setSt(${idx}, 'Одобрено')">Одобрено</button></div>`
      : '';
    const bioLine = p.bio
      ? `<div style="font-size:10px; color:#888; margin-top:4px; border-top:1px dotted #444; padding-top:2px;"><i>${p.bio}</i></div>`
      : '';
    return `<div class="post-box"><div class="post-header"><span>Автор: <b>${p.author}</b></span><span>#${idx + 1}${del}</span></div>` +
      `<div class="post-body-wrap"><img src="${p.ava || DEFAULT_AVA}" class="ava-post"><div style="flex:1;"><div>${p.text}</div>${bioLine}${badge}${mod}</div></div></div>`;
  }).join('');
}

function delPost(idx) {
  topicsData[currentTopic].posts.splice(idx, 1);
  document.getElementById('count-' + currentTopic).textContent = topicsData[currentTopic].posts.length;
  renderPosts();
  saveAll();
}

function setSt(idx, st) {
  topicsData[currentTopic].posts[idx].status = st;
  renderPosts();
  saveAll();
}

function addPost() {
  const u = getUser();
  if (!u) { openModal(); return; }
  if (u.isSimple && currentTopic === 'admins') return;
  const text = document.getElementById('postText').value.trim();
  if (!text) return;
  const clan = getUserClan(u.name);
  const st = (currentTopic === 'players' || currentTopic === 'admins') ? 'Жалоба рассматривается' : '';
  topicsData[currentTopic].posts.push({
    owner: u.name,
    author: `${clan ? `[${clan.tag}] ` : ''}${u.name} [${u.role}]`,
    ava: u.ava || '',
    bio: u.bio || '',
    text,
    status: st
  });
  document.getElementById('postText').value = '';
  document.getElementById('count-' + currentTopic).textContent = topicsData[currentTopic].posts.length;
  renderPosts();
  saveAll();
}

renderUser();
syncFromCloud();
checkServersPing();

