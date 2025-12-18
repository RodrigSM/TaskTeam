// ================= TOAST NOTIFICATION SYSTEM =================
// Beautiful toast notifications to replace alert()

const ToastTypes = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Create toast container if it doesn't exist
function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    return container;
}

// Show toast notification
function showToast(message, type = ToastTypes.INFO, duration = 4000) {
    const container = getToastContainer();

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };

    const colors = {
        success: { bg: 'rgba(0, 170, 0, 0.95)', border: '#00cc00' },
        error: { bg: 'rgba(204, 0, 0, 0.95)', border: '#ff3333' },
        warning: { bg: 'rgba(204, 136, 0, 0.95)', border: '#ffaa00' },
        info: { bg: 'rgba(51, 51, 51, 0.95)', border: '#666' }
    };

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        background: ${colors[type].bg};
        border-left: 4px solid ${colors[type].border};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        pointer-events: auto;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        backdrop-filter: blur(10px);
    `;

    toast.innerHTML = `
        <span style="font-size: 20px; font-weight: bold;">${icons[type]}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; opacity: 0.7;">&times;</button>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
    });

    // Auto remove
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);

    return toast;
}

// Convenience functions
function showSuccess(message, duration) {
    return showToast(message, ToastTypes.SUCCESS, duration);
}

function showError(message, duration) {
    return showToast(message, ToastTypes.ERROR, duration);
}

function showWarning(message, duration) {
    return showToast(message, ToastTypes.WARNING, duration);
}

function showInfo(message, duration) {
    return showToast(message, ToastTypes.INFO, duration);
}
