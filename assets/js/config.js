// ================= CONFIG =================
// Centralized configuration for API keys and settings
// NOTE: These keys are still visible in client-side code
// For production, use server-side environment variables

const CONFIG = {
    SUPABASE_URL: 'https://gsdnkuierbrzqalxnfkd.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZG5rdWllcmJyenFhbHhuZmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTYwNzIsImV4cCI6MjA4MTIzMjA3Mn0.RTi_uWRYtpjct9jCOztNDlCXNHMAax69omknyZN8fxg',

    // Rate limiting settings
    LOGIN_MAX_ATTEMPTS: 5,
    LOGIN_LOCKOUT_MINUTES: 30,

    // App settings
    CURRENCY: '€',
    LOCALE: 'pt-PT',

    // Email settings
    ADMIN_EMAIL: 'taskteamoficial@gmail.com',
    SENDER_EMAIL: 'taskteamoficial@gmail.com',
    CONTACT_EMAIL: 'taskteamoficial@gmail.com'
};

// Rate limiting helper
const RateLimiter = {
    getAttempts: function () {
        const data = localStorage.getItem('login_attempts');
        if (!data) return { count: 0, lockoutUntil: null };
        return JSON.parse(data);
    },

    recordAttempt: function () {
        const data = this.getAttempts();
        data.count++;

        if (data.count >= CONFIG.LOGIN_MAX_ATTEMPTS) {
            data.lockoutUntil = Date.now() + (CONFIG.LOGIN_LOCKOUT_MINUTES * 60 * 1000);
        }

        localStorage.setItem('login_attempts', JSON.stringify(data));
        return data;
    },

    clearAttempts: function () {
        localStorage.removeItem('login_attempts');
    },

    isLockedOut: function () {
        const data = this.getAttempts();
        if (data.lockoutUntil && Date.now() < data.lockoutUntil) {
            const remaining = Math.ceil((data.lockoutUntil - Date.now()) / 60000);
            return { locked: true, minutesRemaining: remaining };
        }
        if (data.lockoutUntil && Date.now() >= data.lockoutUntil) {
            this.clearAttempts();
        }
        return { locked: false };
    },

    getRemainingAttempts: function () {
        const data = this.getAttempts();
        return Math.max(0, CONFIG.LOGIN_MAX_ATTEMPTS - data.count);
    }
};

// Offline detection
const OfflineDetector = {
    init: function () {
        window.addEventListener('online', () => this.updateStatus(true));
        window.addEventListener('offline', () => this.updateStatus(false));
        this.updateStatus(navigator.onLine);
    },

    updateStatus: function (isOnline) {
        let banner = document.getElementById('offline-banner');

        if (!isOnline) {
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'offline-banner';
                banner.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #cc0000, #990000);
                    color: white;
                    text-align: center;
                    padding: 12px;
                    z-index: 99999;
                    font-family: 'Inter', sans-serif;
                    font-weight: 600;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                `;
                banner.innerHTML = '⚠️ Sem ligação à internet. Algumas funcionalidades podem não funcionar.';
                document.body.prepend(banner);
            }
        } else if (banner) {
            banner.remove();
            if (typeof showSuccess === 'function') {
                showSuccess('Ligação restabelecida!');
            }
        }
    },

    isOnline: function () {
        return navigator.onLine;
    }
};

// Initialize offline detection when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    OfflineDetector.init();
});
