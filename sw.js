// Bateria Score — funciona sem internet depois da primeira abertura.
// Ao publicar uma versão nova, mude o número abaixo.
const CACHE = 'bateria-score-v19';
const FILES = ['./index.html', './manifest.json', './lame.min.js',
  './kit-estudio.json', './kit-estudio.mp3', './kit-perc.json', './kit-perc.mp3',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Página: tenta a rede (pega atualizações), cai para o cache se estiver offline.
// Demais arquivos (sons, ícones): cache primeiro; o que for baixado depois (outro timbre) fica guardado.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put('./index.html', copy));
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
