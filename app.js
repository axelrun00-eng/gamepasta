const CLOUD_URL = 'https://npoint.io';

function applySiteTheme(mode) {
  const isMod = (mode === 'modernic');
  document.body.classList.toggle('modernic', isMod);
  const btn = document.getElementById('themeToggleBtn');
  const sub = document.getElementById('themeSubtitle');
  if (btn) btn.textContent = isMod ? '[ Стиль: Modernic ]' : '[ Стиль: OldSchool ]';
  if (sub) sub.textContent = isMod
    ? 'Modernic Dark Gaming Edition • Cloud Sync'
    : 'Windows XP Olive Edition • Cloud Sync';
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
let isSaving = false;

const defaultTopics = {
  news: {
    title: 'Новости',
    posts: [{ owner: 'Основатель', author: 'Основатель', ava: '', text: 'Добро пожаловать на форум GamePasta.ru!', status: '' }]
  },
  rules: {
    title: 'Правила',
    posts: [{
      owner: 'Основатель', author: 'Основатель', ava: '', status: '',
      text:
        '<b>1.1.</b> Запрещено участвовать в мошеннических, провоцирующих, экстремистских и эксплойтных схемах.<br>' +
        '<b>2.1.</b> Проверка проводится только при наличии хотя бы 1 мелкого доказательства.<br>' +
        '<b>2.2.</b> Места: сайт gamepasta.ru в ЛС, ВК, Teams, Telegram, MAX, KakaoTalk.<br>' +
        '<b>3.1.</b> Админка: 14+, стаж в CS > полгода, спокойствие, грамотность.<br>' +
        '<b>3.2.</b> Запрещено писать на почту и выпрашивать пароли.<br>' +
        '<b>3.3.1.</b> Админу запрещено использовать <span class="term-tip">читы<span class="tip-box">Постороннее ПО, макросы, которое не было предусмотрено Верхом Сервера</span></span> и <span class="term-tip">крашеры<span class="tip-box">ПО для краша сервера</span></span>.<br>' +
        '<b>3.4.</b> Статус «На проверке» (10 дней / подозрение / 2 из 3 предов): проверка только в ЛС на сайте (фото и чат).'
    }]
  },
  players: {
    title: 'Жалоба на обычных игроков',
    posts: [{ owner: 'Lakar', author: 'Lakar [Админ]', ava: '', text: 'Игрок Shadow_X забанен за ВХ.', status: 'Одобрено' }]
  },
  admins: {
    title: 'Жалоба на админов',
    posts: [{ owner: 'Гражданин Москвы', author: 'Гражданин Москвы', ava: '', text: 'Админ отменил ЛР при 2 игроках.', status: 'Жалоба рассматривается' }]
  },
  faq: {
    title: 'Вопросы и ответы',
    posts: [{ owner: 'Модератор', author: 'Модератор', ava: '', text: 'Задавайте вопросы по форуму здесь.', status: '' }]
  }
};

let topicsData = defaultTopics;
let keysCache = { adm: ['GP-ADM-2026-MOSCOW'], mod: ['GP-MOD-9999-BOSS'] };
let pmsCache = {};
let usersCache = ['Lakar', 'Модератор', 'Основатель', 'Философ'];
let socialCache = {};
let bansCache = { ids: ['STEAM_0:0:7771337'], ips: ['185.12.44.90'] };
let serversCache = [];
let serversStatus = {};

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
  } catch (e) {}
}

function saveLocalBackup() {
  localStorage.setItem('gp_cloud_backup_v4', JSON.stringify({
    topics: topicsData,
    keys: keysCache,
    pms: pmsCache,
    users: usersCache,
    social: socialCache,
    bans: bansCache,
    servers: serversCache
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

async function forceSyncNow() {
  setCloudBadge('[ Облако: Отправка... ]');
  await saveAll();
}

async function syncFromCloud() {
  if (isSaving) return;
  try {
    const res = await fetch(CLOUD_URL);
    if (!res.ok) {
      setCloudBadge('[ Облако: Ошибка ' + res.status + ' ]');
      return;
    }
    const d = await res.json();
    if (isSaving) return;
    if (d && d.topics) {
      topicsData = d.topics;
      if (d.keys) keysCache = d.keys;
      if (d.pms) pmsCache = d.pms;
      if (d.users) usersCache = d.users;
      if (d.social) socialCache = d.social;
      if (d.bans) bansCache = d.bans;
      if (Array.isArray(d.servers)) serversCache = d.servers;
      saveLocalBackup();
      setCloudBadge('[ Облако: OK ]');
    } else {
      await saveAll();
    }
    renderHomeTopics();
    checkServersPing();
    if (currentTopic && topicsData[currentTopic]) renderPosts();
    if (activeFriend) renderChat();
    if (document.getElementById('cabinetView').style.display === 'block') {
      renderFriends();
      renderFoes();
    }
  } catch (e) {
    setCloudBadge('[ Облако: Ошибка сети ]');
  }
}

async function saveAll() {
  saveLocalBackup();
  isSaving = true;
  try {
    const res = await fetch(CLOUD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topics: topicsData,
        keys: keysCache,
        pms: pmsCache,
        users: usersCache,
        social: socialCache,
        bans: bansCache,
        servers: serversCache
      })
    });
    setCloudBadge(res.ok ? '[ Облако: Сохранено ]' : '[ Облако: Ошибка ' + res.status + ' ]');
  } catch (e) {
    setCloudBadge('[ Облако: Ошибка сети ]');
  }
  isSaving = false;
}
function renderServers() {
  const tbody = document.getElementById('serversMonitorBody');
  const srvBar = document.getElementById('modAddServerBar');
  if (!tbody) return;
  const u = getUser();
  if (srvBar) srvBar.style.display = (u && u.isMod) ? 'inline-block' : 'none';

  if (!serversCache || serversCache.length === 0) {
    tbody.innerHTML =
      `<tr><td><b>Серверы не добавлены</b></td><td>—</td>` +
      `<td style="text-align:center;">0/0</td>` +
      `<td style="text-align:center; color:#ef4444; font-weight:bold;">No running</td></tr>`;
    return;
  }

  tbody.innerHTML = serversCache.map((s, idx) => {
    const st = serversStatus[idx];
    const isUp = st && st.online;
    const pingText = isUp
      ? `<span style="color:#22c55e; font-weight:bold;">Online (${st.ms} ms)</span>`
      : `<span style="color:#ef4444; font-weight:bold;">No running</span>`;
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

document.getElementById('createServerForm').addEventListener('submit', async function(e) {
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
  await saveAll();
  checkServersPing();
});

async function deleteServer(idx) {
  serversCache.splice(idx, 1);
  renderServers();
  await saveAll();
}

function getRoomId(u1, u2) {
  return [u1.toLowerCase(), u2.toLowerCase()].sort().join('__');
}

function renderHomeTopics() {
  renderServers();
  const tbody = document.getElementById('dynamicTopicsBody');
  if (!tbody) return;
  const u = getUser();
  tbody.innerHTML = '';

  const descs = {
    players: 'Читы, фрикиллы и реклама серверов.',
    admins: 'Нарушения регламента администраторами.',
    faq: 'Помощь новичкам и заявки на админку.'
  };

  Object.keys(topicsData).forEach(key => {
    if (key === 'news' || key === 'rules') return;
    const t = topicsData[key];
    const desc = t.desc || descs[key] || 'Обсуждение темы.';
    let delBtn = '';
    if (u && u.isMod && !['players', 'admins', 'faq'].includes(key)) {
      delBtn = `<button class="del-btn" onclick="deleteCustomTopic('${key}')">[Удалить тему]</button>`;
    }
    tbody.innerHTML +=
      `<tr class="topic-row"><td>` +
      `<a class="topic-title" onclick="openTopic('${key}')">${t.title}</a>${delBtn}` +
      `<div class="topic-desc">${desc}</div></td>` +
      `<td style="text-align:center;" id="count-${key}">${t.posts.length}</td></tr>`;
  });

  if (topicsData.news) document.getElementById('count-news').textContent = topicsData.news.posts.length;
  if (topicsData.rules) document.getElementById('count-rules').textContent = topicsData.rules.posts.length;
}

function openNewTopicModal() { document.getElementById('newTopicModal').style.display = 'flex'; }
function closeNewTopicModal() { document.getElementById('newTopicModal').style.display = 'none'; }

document.getElementById('createTopicForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const u = getUser();
  if (!u || !u.isMod) return;
  const title = document.getElementById('newTopicTitle').value.trim();
  const desc = document.getElementById('newTopicDesc').value.trim();
  const text = document.getElementById('newTopicFirstPost').value.trim();
  if (!title || !text) return;

  const newId = 'topic_' + Date.now();
  topicsData[newId] = {
    title: title,
    desc: desc,
    posts: [{ owner: u.name, author: `${u.name} [${u.role}]`, ava: u.ava || '', text: text, status: '' }]
  };

  document.getElementById('newTopicTitle').value = '';
  document.getElementById('newTopicDesc').value = '';
  document.getElementById('newTopicFirstPost').value = '';
  closeNewTopicModal();
  renderHomeTopics();
  await saveAll();
});

async function deleteCustomTopic(key) {
  delete topicsData[key];
  renderHomeTopics();
  await saveAll();
}

function renderBans() {
  const idBox = document.getElementById('bannedIdsList');
  const ipBox = document.getElementById('bannedIpsList');
  idBox.innerHTML = bansCache.ids.map((item, i) =>
    `<span class="key-tag">${item} <b style="color:#ef4444; cursor:pointer;" onclick="removeBan('id', ${i})">[X]</b></span>`
  ).join('') || '<span style="color:#666;">Нет банов</span>';

  ipBox.innerHTML = bansCache.ips.map((item, i) =>
    `<span class="key-tag">${item} <b style="color:#ef4444; cursor:pointer;" onclick="removeBan('ip', ${i})">[X]</b></span>`
  ).join('') || '<span style="color:#666;">Нет банов</span>';
}

async function addBan(type) {
  const inp = document.getElementById(type === 'id' ? 'banIdInput' : 'banIpInput');
  const val = inp.value.trim();
  if (!val) return;
  if (type === 'id' && !bansCache.ids.includes(val)) bansCache.ids.push(val);
  if (type === 'ip' && !bansCache.ips.includes(val)) bansCache.ips.push(val);
  inp.value = '';
  renderBans();
  await saveAll();
}

async function removeBan(type, idx) {
  if (type === 'id') bansCache.ids.splice(idx, 1);
  else bansCache.ips.splice(idx, 1);
  renderBans();
  await saveAll();
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

async function createNewKey(type) {
  const num = Math.floor(1000 + Math.random() * 9000);
  const code = `GP-${type}-${num}-KEY`;
  if (type === 'ADM') keysCache.adm.push(code);
  else keysCache.mod.push(code);
  renderKeysList();
  alert(`Создан ключ (${type}): ${code}`);
  await saveAll();
}

async function deleteKey(type, idx) {
  if (type === 'ADM') keysCache.adm.splice(idx, 1);
  else keysCache.mod.splice(idx, 1);
  renderKeysList();
  await saveAll();
}

function renderKeysList() {
  const box = document.getElementById('keysListDisplay');
  let html = '<div><b>Админ:</b> ';
  keysCache.adm.forEach((k, i) => {
    html += `<span class="key-tag">${k} <b style="color:#ef4444; cursor:pointer;" onclick="deleteKey('ADM', ${i})">[X]</b></span>`;
  });
  html += '</div><div style="margin-top:4px;"><b>Модер:</b> ';
  keysCache.mod.forEach((k, i) => {
    html += `<span class="key-tag">${k} <b style="color:#ef4444; cursor:pointer;" onclick="deleteKey('MOD', ${i})">[X]</b></span>`;
  });
  box.innerHTML = html + '</div>';
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
    const st = u.hideStatus ? ' [Невидимка]' : ' [Онлайн]';
    const ava = u.ava || DEFAULT_AVA;
    document.getElementById('savedUserText').innerHTML =
      `<img src="${ava}" class="ava-mini">` +
      `<span>Ник: <b>${u.name}</b> • Группа: <b>${u.role}</b>${st}</span>`;
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

document.getElementById('authForm').addEventListener('submit', async function(e) {
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
    await saveAll();
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

async function saveSocialData(friendsArr, foesArr) {
  const u = getUser();
  if (!u) return;
  socialCache[u.name.toLowerCase()] = { friends: friendsArr, foes: foesArr };
  await saveAll();
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
  const st = u.hideStatus ? 'Скрыт (Невидимка)' : 'Виден всем (Онлайн)';
  document.getElementById('cabProfileInfo').innerHTML = `<b>Ник:</b> ${u.name}<br><b>Группа:</b> ${u.role}<br><b>Статус:</b> ${st}`;
  document.getElementById('userBioInput').value = u.bio || '';

  const isStaff = (u.isAdm || u.isMod);
  document.getElementById('adminBanPanel').style.display = isStaff ? 'block' : 'none';
  if (isStaff) renderBans();

  document.getElementById('keygenPanel').style.display = u.isMod ? 'block' : 'none';
  if (u.isMod) renderKeysList();

  document.getElementById('avaUploadBlock').style.display = u.isSimple ? 'none' : 'block';
  document.getElementById('bioBlock').style.display = u.isSimple ? 'none' : 'block';
  document.getElementById('cabSimpleBlocked').style.display = u.isSimple ? 'block' : 'none';
  document.getElementById('cabContent').style.display = u.isSimple ? 'none' : 'flex';

  if (!u.isSimple) { renderFriends(); renderFoes(); }
  syncFromCloud();
}

function renderFriends() {
  const box = document.getElementById('friendsListBox');
  if (!box) return;
  box.innerHTML = '';
  getFriends().forEach((f, idx) => {
    const cls = (f === activeFriend) ? 'friend-item friend-active' : 'friend-item';
    box.innerHTML +=
      `<div class="${cls}" onclick="selectFriend('${f}')"><span>${f}</span>` +
      `<span onclick="event.stopPropagation(); delFriend(${idx})" style="color:#ef4444; font-weight:bold;">[X]</span></div>`;
  });
}

function renderFoes() {
  const box = document.getElementById('foesListBox');
  if (!box) return;
  box.innerHTML = '';
  getFoes().forEach((f, idx) => {
    box.innerHTML +=
      `<div class="foe-item"><span>${f}</span>` +
      `<span onclick="delFoe(${idx})" style="color:#ef4444; font-weight:bold; cursor:pointer;">[X]</span></div>`;
  });
}

function setStatusText(elId, msg, isErr) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.style.color = isErr ? '#ef4444' : '#22c55e';
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 3000);
}

async function addFriend() {
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
    await saveSocialData(list, getFoes());
  } else {
    inp.value = '';
    setStatusText('friendStatusMsg', 'Уже в друзьях', true);
  }
}

async function addFoe() {
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
    await saveSocialData(newFriends, foes);
  } else {
    inp.value = '';
  }
}
async function delFriend(idx) {
  const list = getFriends();
  if (list[idx] === activeFriend) {
    activeFriend = '';
    document.getElementById('pmSendArea').style.display = 'none';
    document.getElementById('chatWithTitle').textContent = 'Выберите друга для ЛС';
  }
  list.splice(idx, 1);
  renderFriends();
  await saveSocialData(list, getFoes());
}

async function delFoe(idx) {
  const list = getFoes();
  list.splice(idx, 1);
  renderFoes();
  await saveSocialData(getFriends(), list);
}

function selectFriend(name) {
  activeFriend = name;
  document.getElementById('chatWithTitle').textContent = `ЛС с: ${name}`;
  document.getElementById('pmSendArea').style.display = 'block';
  renderFriends();
  syncFromCloud();
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

async function sendPM() {
  const u = getUser();
  const inp = document.getElementById('pmInput');
  const txt = inp.value.trim();
  if (!txt || !activeFriend || !u) return;
  const room = getRoomId(u.name, activeFriend);
  if (!pmsCache[room]) pmsCache[room] = [];
  pmsCache[room].push(`<b>${u.name}:</b> ${txt}`);
  inp.value = '';
  renderChat();
  await saveAll();
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

  const warn = document.getElementById('simpleWarnText');
  const area = document.getElementById('postText');
  const box = document.getElementById('replyBox');

  if ((id === 'news' || id === 'rules') && (!u || !u.isMod)) {
    box.style.display = 'none';
  } else {
    box.style.display = 'block';
    warn.style.display = (u && u.isSimple && id === 'admins') ? 'block' : 'none';
    area.disabled = (u && u.isSimple && id === 'admins');
  }
  renderPosts();
  syncFromCloud();
}

function renderPosts() {
  const t = topicsData[currentTopic];
  const u = getUser();
  const foes = getFoes();
  const c = document.getElementById('postsContainer');
  c.innerHTML = '';

  t.posts.forEach((p, idx) => {
    if (foes.includes(p.owner)) {
      c.innerHTML += `<div class="post-box" style="background:#f5d6d6; color:#800000;">Сообщение от <b>${p.owner}</b> скрыто (в недругах).</div>`;
      return;
    }
    let badge = '';
    if (p.status === 'Жалоба рассматривается') badge = `<div class="badge badge-wait">${p.status}</div>`;
    if (p.status === 'Одобрено') badge = `<div class="badge badge-ok">${p.status}</div>`;
    const del = (u && (u.name === p.owner || u.isMod)) ? `<button class="del-btn" onclick="delPost(${idx})">[Удалить]</button>` : '';
    let mod = '';
    if (u && u.isMod && (currentTopic === 'players' || currentTopic === 'admins')) {
      mod = `<div style="margin-top:6px;"><button class="logout-btn" onclick="setSt(${idx}, 'Жалоба рассматривается')">На рассмотрение</button> <button class="logout-btn" onclick="setSt(${idx}, 'Одобрено')">Одобрено</button></div>`;
    }
    const bioLine = p.bio ? `<div style="font-size:10px; color:#888; margin-top:4px; border-top:1px dotted #444; padding-top:2px;"><i>${p.bio}</i></div>` : '';
    c.innerHTML +=
      `<div class="post-box"><div class="post-header">` +
      `<span>Автор: <b>${p.author}</b></span><span>#${idx + 1}${del}</span>` +
      `</div><div class="post-body-wrap"><img src="${p.ava || DEFAULT_AVA}" class="ava-post">` +
      `<div style="flex:1;"><div>${p.text}</div>${bioLine}${badge}${mod}</div></div></div>`;
  });
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

  const st = (currentTopic === 'players' || currentTopic === 'admins') ? 'Жалоба рассматривается' : '';
  topicsData[currentTopic].posts.push({
    owner: u.name, author: `${u.name} [${u.role}]`, ava: u.ava || '', bio: u.bio || '', text: text, status: st
  });
  document.getElementById('postText').value = '';
  document.getElementById('count-' + currentTopic).textContent = topicsData[currentTopic].posts.length;
  renderPosts();
  saveAll();
}

renderUser();
syncFromCloud();
setInterval(syncFromCloud, 4000);
