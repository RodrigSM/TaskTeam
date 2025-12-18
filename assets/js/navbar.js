// ================= SHARED NAVBAR COMPONENT =================
// This file generates the navbar HTML dynamically for all pages
// Single source of truth - no more sync issues!

function createNavbar(activePage = '') {
    const navLinks = [
        { href: 'index.html', text: 'Início', id: 'home' },
        { href: 'index.html#about', text: 'Sobre', id: 'about' },
        { href: 'team.html', text: 'Equipa', id: 'team' },
        { href: 'loja.html', text: 'Loja', id: 'loja' },
        { href: 'index.html#contact', text: 'Contacto', id: 'contact' }
    ];

    const navLinksHTML = navLinks.map(link => {
        const isActive = link.id === activePage ? ' active' : '';
        return `<li class="nav-item"><a href="${link.href}" class="nav-link${isActive}">${link.text}</a></li>`;
    }).join('\n                ');

    return `
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-logo" style="text-decoration: none; cursor: pointer; position: relative; z-index: 9999;">
                <img src="assets/images/tt-logo.png" alt="TaskTeam Logo" class="logo-img">
                <span class="logo-text">TaskTeam</span>
            </a>
            <ul class="nav-menu">
                ${navLinksHTML}
                <li class="nav-item">
                    <button id="cart-btn" style="position: relative; background: transparent; border: none; color: #fff; font-size: 24px; cursor: pointer;">
                        <i class="fas fa-shopping-cart"></i>
                        <span id="cart-count" style="position: absolute; top: -8px; right: -8px; background: #FF3333; color: #fff; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; display: none; align-items: center; justify-content: center; font-weight: bold;">0</span>
                    </button>
                    <!-- Cart Dropdown -->
                    <div id="cart-dropdown" class="cart-dropdown" style="display: none;">
                        <div class="cart-header">
                            <h3>Carrinho</h3>
                            <button class="close-cart" onclick="document.getElementById('cart-dropdown').style.display='none'">&times;</button>
                        </div>
                        <div class="cart-items" id="cart-items"></div>
                        <div class="cart-footer">
                            <div class="cart-total">
                                <span>Total:</span>
                                <span id="cart-total-price">€0.00</span>
                            </div>
                            <a href="carrinho.html" class="btn-checkout">Ver Carrinho Completo</a>
                        </div>
                    </div>
                </li>
                <li class="nav-item" id="user-info" style="display:none; color: white; margin-right: 15px;"></li>
                <li class="nav-item">
                    <button id="login-btn" class="btn-login">Login</button>
                    <button id="logout-btn" class="btn-login hidden" style="background: #333;">Logout</button>
                </li>
            </ul>
            <div class="hamburger">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>`;
}

// Inject navbar into page
function injectNavbar(activePage = '') {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = createNavbar(activePage);
    }
}

// Auto-detect active page and inject
document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;
    let activePage = 'home';

    if (path.includes('team')) activePage = 'team';
    else if (path.includes('loja')) activePage = 'loja';
    else if (path.includes('perfil')) activePage = 'perfil';
    else if (path.includes('carrinho')) activePage = 'carrinho';
    else if (path.includes('pagamento')) activePage = 'pagamento';

    injectNavbar(activePage);
});
