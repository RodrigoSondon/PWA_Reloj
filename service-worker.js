/* =========================================================
   service-worker.js – Service Worker · PWA Reloj
   =========================================================
   Estrategia: Cache-First con actualización en red.
     1. Al instalarse, pre-cachea todos los archivos de la app.
     2. Al activarse, elimina cachés obsoletas.
     3. Al interceptar peticiones, responde desde caché primero;
        si no está en caché, va a la red y guarda la respuesta.
   ========================================================= */

/* ---------------------------------------------------------
   Configuración del caché
   --------------------------------------------------------- */

/** Nombre único del caché. Incluye versión para facilitar
 *  la invalidación cuando se actualice la aplicación. */
const NOMBRE_CACHE  = 'pwa-reloj-v1';

/** Lista de recursos que se pre-cachearán al instalar el SW */
const ARCHIVOS_A_CACHEAR = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.png'
];

/* ---------------------------------------------------------
   Evento: install
   Descripción: Se dispara cuando el Service Worker se
                instala por primera vez. Pre-cachea todos
                los recursos de la aplicación.
   --------------------------------------------------------- */
self.addEventListener('install', function (evento) {
  console.log('[SW] Instalando Service Worker...');

  evento.waitUntil(
    caches.open(NOMBRE_CACHE)
      .then(function (cache) {
        console.log('[SW] Pre-cacheando archivos de la aplicación');
        return cache.addAll(ARCHIVOS_A_CACHEAR);
      })
      .then(function () {
        // Activa el SW inmediatamente sin esperar a que se cierre la pestaña
        return self.skipWaiting();
      })
      .catch(function (error) {
        console.error('[SW] Error durante la pre-caché:', error);
      })
  );
});

/* ---------------------------------------------------------
   Evento: activate
   Descripción: Se dispara cuando el SW toma el control.
                Elimina cachés antiguas para liberar espacio.
   --------------------------------------------------------- */
self.addEventListener('activate', function (evento) {
  console.log('[SW] Activando Service Worker...');

  evento.waitUntil(
    caches.keys()
      .then(function (nombresCaches) {
        // Filtra y elimina cachés que no correspondan a la versión actual
        const cachesSobrant = nombresCaches.filter(function (nombre) {
          return nombre !== NOMBRE_CACHE;
        });

        return Promise.all(
          cachesSobrant.map(function (nombreObsoleto) {
            console.log('[SW] Eliminando caché obsoleta:', nombreObsoleto);
            return caches.delete(nombreObsoleto);
          })
        );
      })
      .then(function () {
        // Toma control de todas las pestañas abiertas inmediatamente
        return self.clients.claim();
      })
  );
});

/* ---------------------------------------------------------
   Evento: fetch
   Descripción: Intercepta todas las peticiones de red.
                Estrategia Cache-First:
                  1. Busca el recurso en caché.
                  2. Si existe, lo devuelve desde caché.
                  3. Si NO existe, lo descarga de la red,
                     lo guarda en caché y lo devuelve.
   --------------------------------------------------------- */
self.addEventListener('fetch', function (evento) {
  // Solo interceptar peticiones GET
  if (evento.request.method !== 'GET') return;

  evento.respondWith(
    caches.match(evento.request)
      .then(function (respuestaCacheada) {

        // ── Caso 1: Recurso encontrado en caché ──────────────
        if (respuestaCacheada) {
          return respuestaCacheada;
        }

        // ── Caso 2: Recurso NO en caché → Ir a la red ────────
        return fetch(evento.request)
          .then(function (respuestaRed) {
            // Verificar que la respuesta sea válida antes de cachear
            if (!respuestaRed || respuestaRed.status !== 200 ||
                respuestaRed.type === 'opaque') {
              return respuestaRed;
            }

            // Clonar la respuesta porque es un stream de un solo uso
            const respuestaClonada = respuestaRed.clone();

            caches.open(NOMBRE_CACHE)
              .then(function (cache) {
                cache.put(evento.request, respuestaClonada);
              });

            return respuestaRed;
          })
          .catch(function () {
            // Sin conexión y sin caché: devolver página HTML principal
            return caches.match('./index.html');
          });
      })
  );
});
