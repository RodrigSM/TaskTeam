// ================= LOADING HELPERS =================
// Functions for showing loading states

// Show skeleton cards while loading products
function showProductSkeletons(container, count = 6) {
    if (!container) return;

    let skeletonHTML = '';
    for (let i = 0; i < count; i++) {
        skeletonHTML += `
            <div class="skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-price"></div>
                <div class="skeleton skeleton-button"></div>
            </div>
        `;
    }
    container.innerHTML = skeletonHTML;
}

// Show loading overlay
function showLoadingOverlay(message = 'A carregar...') {
    let overlay = document.getElementById('loading-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner large"></div>
            <div class="loading-text">${message}</div>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('.loading-text').textContent = message;
        overlay.style.display = 'flex';
    }

    return overlay;
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Add loading state to button
function setButtonLoading(button, isLoading, originalText = null) {
    if (!button) return;

    if (isLoading) {
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span class="loading-spinner"></span>';
        button.classList.add('btn-loading');
        button.disabled = true;
    } else {
        button.innerHTML = originalText || button.dataset.originalText || 'Submit';
        button.classList.remove('btn-loading');
        button.disabled = false;
    }
}
