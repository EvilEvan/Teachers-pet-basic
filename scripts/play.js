window.addEventListener('load', () => {
    // Auto-redirect to student information page after a brief delay
    setTimeout(() => {
        window.location.href = 'student-information.html';
    }, 1000);

    // Register service worker for PWA/offline capability
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('pwa/service-worker.js')
            .catch((err) => console.error('Service Worker registration failed:', err));
    }
});