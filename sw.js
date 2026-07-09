const CACHE_NAME = 'rutero-v1';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      // Si algún archivo del "shell" falla (p. ej. el icono aún no subido),
      // no bloquea la instalación del resto.
      return Promise.all(
        APP_SHELL.map(function(url){
          return cache.add(url).catch(function(){});
        })
      );
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event){
  const url = new URL(event.request.url);
  // Las llamadas a Overpass y a las teselas del mapa van siempre directas a
  // la red: nunca se cachean ni se interceptan.
  if(url.origin !== self.location.origin){
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request);
    })
  );
});
