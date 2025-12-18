// Service Worker básico para TaskTeam
// Este ficheiro é necessário para evitar erros 404 no console

const CACHE_NAME = 'taskteam-v1';

self.addEventListener('install', (event) => {
    console.log('ServiceWorker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('ServiceWorker ativado');
});

self.addEventListener('fetch', (event) => {
    // Não fazer cache por enquanto, apenas passar os pedidos
    event.respondWith(fetch(event.request));
});
