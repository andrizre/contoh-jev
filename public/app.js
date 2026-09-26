'use strict';
/* Soal Pilihan Ganda: guru menulis pernyataan + pilihan dinamis (2 sampai 8).
   Jev menjawab satu choice: probabilitas tiap opsi, pemenang = paling tepat. */
var $ = function (id) { return document.getElementById(id); };
var qEl = $('q'), optsEl = $('opts'), addBtn = $('add');
var form = $('form'), goBtn = $('go'), errEl = $('err');
var emptyEl = $('empty'), loadEl = $('loading'), resEl = $('result');
var winnerEl = $('winner'), confEl = $('conf'), barsEl = $('bars'), noteEl = $('note');
var histEl = $('hist'), histTable = $('hist-table'), histEmpty = $('hist-empty');
var dotEl = $('dot'), modeText = $('modeText');

var MAX_OPTS = 8, MIN_OPTS = 2;
var hist = [];
try { hist = JSON.parse(localStorage.getItem('jev_history') || '[]'); } catch (e) { hist = []; }

fetch('/api/health').then(function (r) { return r.json(); }).then(function (h) {
  var live = h && h.mode === 'live-ready';
  dotEl.classList.toggle('live', live);
  modeText.textContent = live ? 'Live: Jev 1.13-free' : 'Demo lokal: isi kunci API untuk live';
}).catch(function () {
  modeText.textContent = 'Demo lokal: isi kunci API untuk live';
});

function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function pct(x) { return Math.round(x * 100) + '%'; }
function letter(i) { return String.fromCharCode(65 + i); }

/* Daftar pilihan dinamis. */
function addOption(value) {
  var rows = optsEl.querySelectorAll('.opt-row');
  if (rows.length >= MAX_OPTS) return;
  var i = rows.length;
  var row = document.createElement('div');
  row.className = 'opt-row';
  row.innerHTML = '<span class="opt-letter" aria-hidden="true">' + letter(i) + '</span>' +
    '<label class="sr" for="opt-' + i + '">Pilihan ' + letter(i) + '</label>' +
    '<input id="opt-' + i + '" maxlength="200" placeholder="Tulis pilihan ' + letter(i) + '" />' +
    '<button type="button" class="opt-del" aria-label="Hapus pilihan ' + letter(i) + '">Hapus</button>';
  row.querySelector('input').value = value || '';
  row.querySelector('.opt-del').addEventListener('click', function () {
    if (optsEl.querySelectorAll('.opt-row').length <= MIN_OPTS) return;
    row.remove();
    relabel();
  });
  optsEl.appendChild(row);
  relabel();
}
function relabel() {
  var rows = optsEl.querySelectorAll('.opt-row');
  for (var i = 0; i < rows.length; i++) {
    rows[i].querySelector('.opt-letter').textContent = letter(i);
    var inp = rows[i].querySelector('input');
    inp.id = 'opt-' + i;
    inp.placeholder = 'Tulis pilihan ' + letter(i);
    var lab = rows[i].querySelector('label');
    lab.htmlFor = 'opt-' + i;
    lab.textContent = 'Pilihan ' + letter(i);
    var del = rows[i].querySelector('.opt-del');
    del.setAttribute('aria-label', 'Hapus pilihan ' + letter(i));
    del.disabled = rows.length <= MIN_OPTS;
  }
  addBtn.disabled = rows.length >= MAX_OPTS;
}
addBtn.addEventListener('click', function () {
  addOption('');
  var rows = optsEl.querySelectorAll('.opt-row');
  rows[rows.length - 1].querySelector('input').focus();
});
addOption('Tokyo'); addOption('Osaka'); addOption('');

var chips = document.querySelectorAll('[data-ex]');
for (var c = 0; c < chips.length; c++) {
  chips[c].addEventListener('click', function () {
    var p = this.getAttribute('data-ex').split('|');
    qEl.value = p[0] || '';
    optsEl.innerHTML = '';
    for (var k = 1; k < p.length && k <= MAX_OPTS; k++) addOption(p[k] || '');
    while (optsEl.querySelectorAll('.opt-row').length < MIN_OPTS) addOption('');
    qEl.focus();
  });
}

function postJev(state, questions) {
  return fetch('/api/jev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: state, questions: questions })
  }).then(function (r) {
    var ct = r.headers.get('content-type') || '';
    if (ct.indexOf('application/json') === -1) {
      throw new Error('Server menjawab halaman, bukan data. Restart server: hentikan (Ctrl+C) lalu jalankan lagi node server.js.');
    }
    return r.json().then(function (d) { return { status: r.status, body: d }; });
  }).then(function (out) {
    if (out.status !== 200 || !out.body.ok) throw new Error(out.body.message || 'Penilaian gagal.');
    return out.body;
  });
}

function renderHist() {
  if (!hist.length) { histTable.hidden = true; histEmpty.hidden = false; return; }
  histTable.hidden = false; histEmpty.hidden = true;
  histEl.innerHTML = '';
  for (var i = 0; i < Math.min(hist.length, 10); i++) {
    var h = hist[i];
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><strong>' + esc(h.win) + '</strong> ' + esc(h.winText).slice(0, 60) + '</td>' +
      '<td class="num">' + esc(h.tepat) + '</td>' +
      '<td class="num">' + esc(h.mutlak || '-') + '</td>' +
      '<td>' + esc(h.soal).slice(0, 80) + '</td>' +
      '<td>' + (h.mode === 'live' ? 'live' : 'demo') + '</td>';
    histEl.appendChild(tr);
  }
}
$('clear').addEventListener('click', function () {
  hist = [];
  try { localStorage.removeItem('jev_history'); } catch (e) { /* abaikan */ }
  renderHist();
});
renderHist();

form.addEventListener('submit', function (ev) {
  ev.preventDefault();
  errEl.hidden = true;
  var q = qEl.value.trim();
  if (q.length < 3) return showErr('Pernyataan minimal 3 karakter.');
  var inputs = optsEl.querySelectorAll('input');
  var criteria = {}, texts = [], ids = [];
  for (var i = 0; i < inputs.length; i++) {
    var v = inputs[i].value.trim();
    if (!v) continue;
    var id = letter(ids.length);
    ids.push(id); texts.push(v); criteria[id] = v;
  }
  if (ids.length < MIN_OPTS) return showErr('Isi minimal 2 pilihan jawaban.');

  emptyEl.hidden = true; resEl.hidden = true; loadEl.hidden = false;
  goBtn.disabled = true; goBtn.textContent = 'Menilai…';

  /* Logika: satu choice untuk porsi relatif (total 100 persen) ditambah satu noul
     per pilihan untuk kebenaran mutlak. Keduanya independen: dua pilihan bisa
     sama-sama 80 persen benar secara mutlak, tapi porsi relatifnya tetap terbagi. */
  var questions = {
    jawaban: {
      type: 'choice',
      instructions: 'Manakah jawaban yang paling tepat untuk pernyataan ini? Pilih satu.',
      criteria: criteria
    }
  };
  for (var j = 0; j < ids.length; j++) {
    questions['benar_' + ids[j].toLowerCase()] = {
      type: 'noul',
      instructions: 'Apakah pilihan ' + ids[j] + ' ("' + texts[j].slice(0, 160) + '") tepat untuk pernyataan ini? Nilai sendiri, abaikan pilihan lain.'
    };
  }

  postJev(q, questions).then(function (d) {
    showResult(d, ids, texts);
    var win = d.answers.jawaban.choice;
    var p = d.answers.jawaban.probabilities[win] || 0;
    var wi = ids.indexOf(win);
    var key = 'benar_' + String(win).toLowerCase();
    var abs = d.answers[key] ? Math.round(d.answers[key].noul * 100) + '% mutlak' : '';
    hist.unshift({ win: win, winText: (wi >= 0 ? texts[wi] : win), tepat: pct(p), mutlak: abs, soal: q, mode: d.mode });
    hist = hist.slice(0, 20);
    try { localStorage.setItem('jev_history', JSON.stringify(hist)); } catch (e) { /* abaikan */ }
    renderHist();
  }).catch(function (e) {
    showErr(e.message || 'Terjadi kesalahan. Coba lagi.');
    emptyEl.hidden = false;
  }).then(function () {
    loadEl.hidden = true;
    goBtn.disabled = false; goBtn.textContent = 'Nilai pilihan';
  });
});

function showResult(d, ids, texts) {
  resEl.hidden = false;
  var a = d.answers.jawaban;
  var order = ids.slice().sort(function (x, y) { return (a.probabilities[y] || 0) - (a.probabilities[x] || 0); });
  var win = a.choice, p = a.probabilities[win] || 0;
  var wi = ids.indexOf(win);
  var winKey = 'benar_' + String(win).toLowerCase();
  var winAbs = d.answers[winKey] ? pct(d.answers[winKey].noul) : null;
  winnerEl.innerHTML = '<span class="win-letter">' + esc(win) + '</span> ' + esc(wi >= 0 ? texts[wi] : win) +
    ' <span class="win-pct">' + pct(p) + ' relatif' + (winAbs ? ', ' + winAbs + ' mutlak' : '') + '</span>';
  confEl.textContent = 'keyakinan: ' + pct(a.confidence || 0) + ', model: ' + (d.model || '-');
  barsEl.innerHTML = '';
  for (var i = 0; i < order.length; i++) {
    var id = order[i], v = a.probabilities[id] || 0;
    var ti = ids.indexOf(id);
    var akey = 'benar_' + String(id).toLowerCase();
    var av = d.answers[akey] ? d.answers[akey].noul : null;
    var tag = (id === win) ? ' (pemenang)' : (av !== null && av >= 0.5 ? ' (mungkin benar)' : '');
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><strong>' + esc(id) + '</strong> ' + esc(ti >= 0 ? texts[ti] : '') + tag + '</td>' +
      '<td><div class="track"><div class="fill' + (id === win ? '' : ' is-dim') + '"></div></div></td>' +
      '<td class="num">' + pct(v) + '</td>' +
      '<td class="num">' + (av === null ? '-' : pct(av)) + '</td>';
    barsEl.appendChild(tr);
    (function (row, val) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { row.querySelector('.fill').style.width = (val * 100) + '%'; });
      });
    })(tr, v);
  }
  noteEl.textContent = d.mode === 'demo'
    ? 'Catatan: ' + (d.note || 'hasil demo lokal.')
    : 'Penilaian live via OpenCode Zen (' + (d.model || '') + ').' +
      (d.usage ? ' Token: ' + (d.usage.input_tokens != null ? d.usage.input_tokens : '?') + ' masuk.' : '');
}

function showErr(m) { errEl.textContent = m; errEl.hidden = false; }
