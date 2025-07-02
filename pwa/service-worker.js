const CACHE_NAME = 'teacherpet-v1';
const urlsToCache = [
    '/',
    '/Play.html',
    '/student-information.html',
    '/Subjects.html',
    '/styles/play.css',
    '/scripts/play.js',
    '/styles/student.css',
    '/styles/subjects.css',
    '/scripts/student.js',
    '/scripts/subjects.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});