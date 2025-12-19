// ================= SUPABASE CONFIG =================
// Use CONFIG if available (from config.js), otherwise define locally
const supabaseUrl = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_URL)
    ? CONFIG.SUPABASE_URL
    : 'https://gsdnkuierbrzqalxnfkd.supabase.co';
const supabaseKey = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_KEY)
    ? CONFIG.SUPABASE_KEY
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZG5rdWllcmJyenFhbHhuZmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTYwNzIsImV4cCI6MjA4MTIzMjA3Mn0.RTi_uWRYtpjct9jCOztNDlCXNHMAax69omknyZN8fxg';

// Only create client if not already created
var supabaseClient = null;
try {
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        
    }
} catch (e) {
    console.warn('Supabase not available in main.js');
}

// ================= AUTENTICAÇÃO - BTN-LOGIN (Navbar) =================
document.addEventListener('DOMContentLoaded', function () {
    

    // Attach listeners to login and logout buttons
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginBtn) {
        
        loginBtn.addEventListener('click', handleBtnLoginClick);
    }

    if (logoutBtn) {
        
        logoutBtn.addEventListener('click', handleBtnLogoutClick);
    }

    // Verificar estado de login simples (localStorage)
    updateSimpleAuthUI();

    // Inicializa outros componentes
    initModalLogin();
    initNavigation();
    initScrollEffects();
    initAnimations();
    initForms();
    setActiveNavLink();
    addBackToTopButton();
    initPageSpecific();

    // Carrega produtos se estiver na página da loja
    if (window.location.pathname.endsWith('loja.html') || window.location.pathname.includes('loja')) {
        
        fetchProducts();
    }

    // Atualizar UI de autenticação simples
    updateSimpleAuthUI();

    // Atualizar contador do carrinho
    updateCartCount();

    // Event listener para botão do carrinho - ABRE DROPDOWN
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCartDropdown();
        });
    }

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('cart-dropdown');
        const cartBtn = document.getElementById('cart-btn');
        if (dropdown && dropdown.style.display === 'block') {
            if (!dropdown.contains(e.target) && !cartBtn.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        }
    });

    
});

// ================= SISTEMA DE LOGIN SIMPLES (SEM SUPABASE) =================
function updateSimpleAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');

    const user = localStorage.getItem('taskteam_user');

    if (user) {
        try {
            const userData = JSON.parse(user);
            

            // Toggle buttons
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');

            // Show user avatar
            if (userInfo) {
                const firstLetter = userData.email.charAt(0).toUpperCase();
                userInfo.innerHTML = `<div style="width: 35px; height: 35px; border-radius: 50%; background: linear-gradient(135deg, #FF3333, #CC0000); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; cursor: pointer;" onclick="window.location.href='perfil.html'">${firstLetter}</div>`;
                userInfo.style.display = 'flex';
            }
        } catch (e) {
            console.error('Erro ao ler dados do utilizador:', e);
            localStorage.removeItem('taskteam_user');
        }
    } else {
        

        // Toggle buttons
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');

        // Hide user info
        if (userInfo) {
            userInfo.innerHTML = '';
            userInfo.style.display = 'none';
        }
    }
}


function handleBtnLoginClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    window.location.href = 'login-simples.html';
}

function handleBtnLogoutClick(e) {
    e.preventDefault();
    e.stopPropagation();
    

    if (confirm('Tem a certeza que deseja sair?')) {
        localStorage.removeItem('taskteam_user');
        updateSimpleAuthUI();
        window.location.reload();
    }
}

function updateBtnLogin(session) {
    const btnLogin = document.getElementById('btn-login') || document.getElementById('login-btn');
    if (!btnLogin) return;

    if (session && session.user) {
        btnLogin.textContent = 'Logout';
        
    } else {
        btnLogin.textContent = 'Login';
        
    }
}

// ================= MODAL LOGIN =================
function initModalLogin() {
    

    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const closeModal = document.getElementById('close-login-modal');
    const loginForm = document.getElementById('login-form');
    const googleBtn = document.getElementById('google-login');

    // Botão para abrir modal
    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginModal);
        
    }

    // Botão de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            
            await supabase.auth.signOut();
            updateAuthUI();
        });
        
    }

    // Fechar modal
    if (closeModal) {
        closeModal.addEventListener('click', hideLoginModal);
    }

    // Login com email/password
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            

            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const errorDiv = document.getElementById('login-error');

            if (!emailInput || !passwordInput) {
                console.error('Email or password input not found');
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    console.error('Login error:', error.message);
                    if (errorDiv) {
                        errorDiv.textContent = '❌ ' + error.message;
                    }
                } else {
                    
                    if (errorDiv) errorDiv.textContent = '';
                    hideLoginModal();
                    updateAuthUI();
                    showNotification('Login realizado com sucesso! Bem-vindo!', 'success');
                }
            } catch (err) {
                console.error('Login exception:', err);
                if (errorDiv) {
                    errorDiv.textContent = '❌ Erro ao fazer login: ' + err.message;
                }
            }
        });
        
    } else {
        console.warn('Login form not found');
    }

    // Google OAuth
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            
            const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
            if (error) {
                console.error('Google OAuth error:', error.message);
                document.getElementById('login-error').textContent = error.message;
            }
        });
    }

    // NOTA: Não usar updateAuthUI() aqui porque usa Supabase Auth
    // e o website usa login simples via localStorage
    // updateAuthUI() e onAuthStateChange() estão desativados
    // O estado do login é gerido por updateSimpleAuthUI() no início do ficheiro
}

function showLoginModal() {
    
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
        modal.style.display = 'flex';
        

        // Limpar mensagem de erro anterior
        const errorMsg = document.getElementById('login-error');
        if (errorMsg) errorMsg.textContent = '';
    } else {
        console.error('Modal #login-modal not found in DOM!');
    }
}

function hideLoginModal() {
    
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

async function updateAuthUI() {
    
    const { data: { user } } = await supabase.auth.getUser();

    const userInfo = document.getElementById('user-info');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (user) {
        
        if (userInfo) userInfo.textContent = user.email || user.user_metadata.full_name || 'Utilizador';
        if (loginBtn) loginBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
        
        if (userInfo) userInfo.textContent = '';
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
}

// ================= LOJA DINÂMICA =================
async function fetchProducts() {
    
    try {
        const { data, error } = await supabase.from('products').select('id, name, price, image_url, description');
        if (error) throw error;

        

        const container = document.querySelector('.features-preview');
        if (!container) {
            console.warn('Products container not found');
            return;
        }

        container.innerHTML = '';
        data.forEach(product => {
            const item = document.createElement('div');
            item.className = 'feature-item';

            const img = document.createElement('img');
            img.src = product.image_url;
            img.alt = product.name;
            img.style.width = '100%';
            img.style.maxHeight = '180px';
            img.style.objectFit = 'contain';

            const h3 = document.createElement('h3');
            h3.textContent = product.name;

            const p = document.createElement('p');
            p.textContent = `€${product.price.toFixed(2)}`;
            p.style.fontSize = '1.5rem';
            p.style.fontWeight = 'bold';
            p.style.color = '#FF3333';
            p.style.margin = '10px 0';

            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho';
            btn.style.width = '100%';
            btn.style.marginTop = '10px';
            btn.onclick = () => addToCart(product);

            item.append(img, h3, p, btn);
            container.appendChild(item);
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        showNotification('Erro ao carregar produtos: ' + err.message, 'error');
    }
}

// ================= PAGAMENTO EUPAGO =================
async function comprarProduto(productId, value) {
    
    try {
        const { data, error } = await supabase.functions.invoke('create-payment', {
            body: { product_id: productId, value }
        });
        if (error) throw error;
        mostrarModalPagamento(data.referencia);
    } catch (err) {
        console.error('Payment error:', err);
        alert('Erro ao criar pagamento: ' + err.message);
    }
}

function mostrarModalPagamento(referencia) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Pagamento</h2>
            <p>Sua referência Multibanco/MB Way:</p>
            <pre>${referencia}</pre>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// ================= NAVIGATION =================
function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage ||
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === 'index.html' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function addBackToTopButton() {
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border: none;
        border-radius: 50%;
        background: var(--primary-red);
        color: white;
        font-size: 18px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(backToTopButton);

    backToTopButton.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
        if (window.scrollY > 500) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });
}

function initPageSpecific() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'team.html') {
        const recruitmentForm = document.querySelector('#recruitment-form');
        if (recruitmentForm) {
            recruitmentForm.addEventListener('submit', function (e) {
                e.preventDefault();
                alert('Candidatura enviada! Entraremos em contacto em breve.');
                recruitmentForm.reset();
            });
        }
    }

    if (currentPage === 'loja.html') {
        const notifyForm = document.querySelector('#notify-form');
        if (notifyForm) {
            notifyForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const email = e.target.email.value;
                alert(`Obrigado! Iremos notificar ${email} quando a loja abrir.`);
                notifyForm.reset();
            });
        }
    }
}

function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        document.addEventListener('click', function (event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
                navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            } else {
                navbar.classList.remove('scrolled');
                navbar.style.background = 'rgba(0, 0, 0, 0.9)';
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            

            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                } else {
                    
                }
            }
        });
    });
}

function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.streamer-card, .contact-method, .stat-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        const heroElements = document.querySelectorAll('.floating-element');
        heroElements.forEach((element, index) => {
            const speed = (index + 1) * 0.2;
            element.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });
}

function initAnimations() {
    const heroLogo = document.querySelector('.hero-logo');
    if (heroLogo) {
        heroLogo.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.1) rotate(5deg)';
        });

        heroLogo.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    }

    const streamerCards = document.querySelectorAll('.streamer-card');
    streamerCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function initForms() {
    const contactForm = document.querySelector('.contact-form .form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleContactForm(this);
        });
    }

    const notifyForm = document.querySelector('.notify-form');
    if (notifyForm) {
        notifyForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleNewsletterForm(this);
        });
    }
}

function handleContactForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const submitBtn = form.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    setTimeout(() => {
        showNotification('Mensagem enviada com sucesso! Entraremos em contacto em breve.', 'success');
        form.reset();

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

function handleNewsletterForm(form) {
    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('.btn');

    if (!emailInput.value || !isValidEmail(emailInput.value)) {
        showNotification('Por favor, insira um email válido.', 'error');
        return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registando...';
    submitBtn.disabled = true;

    setTimeout(() => {
        showNotification('Email registado com sucesso! Serás notificado quando a loja abrir.', 'success');
        emailInput.value = '';

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    `;

    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    notification.querySelector('.notification-close').addEventListener('click', () => {
        hideNotification(notification);
    });

    setTimeout(() => {
        if (document.body.contains(notification)) {
            hideNotification(notification);
        }
    }, 5000);
}

function hideNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
        }
    }, 300);
}

document.addEventListener('click', function (e) {
    if (e.target.closest('.social-link')) {
        const link = e.target.closest('.social-link');

        if (!link.href || link.href === '#' || link.href === '' || link.href === window.location.href + '#') {
            e.preventDefault();
            const platform = getSocialPlatform(link);
            showNotification(`Link do ${platform} ainda não disponível. Segue-nos para futuras atualizações!`, 'info');
        }
    }
});

function getSocialPlatform(link) {
    const icon = link.querySelector('i');
    if (!icon) return 'rede social';

    const classes = icon.className;
    if (classes.includes('instagram')) return 'Instagram';
    if (classes.includes('tiktok')) return 'TikTok';
    if (classes.includes('discord')) return 'Discord';
    if (classes.includes('twitch')) return 'Twitch';
    if (classes.includes('x-twitter')) return 'X (Twitter)';
    if (classes.includes('youtube')) return 'YouTube';

    return 'rede social';
}

let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', function (e) {
    konamiCode.push(e.keyCode);

    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }

    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        activateEasterEgg();
        konamiCode = [];
    }
});

function activateEasterEgg() {
    document.body.style.animation = 'rainbow 2s infinite';

    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    showNotification('🎮 Easter Egg ativado! TaskTeam rocks! 🚀', 'success');

    setTimeout(() => {
        document.body.style.animation = '';
        style.remove();
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

const optimizedScrollHandler = throttle(() => {
    // Scroll-based animations here
}, 16);

window.addEventListener('scroll', optimizedScrollHandler);

function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                
            })
            .catch(registrationError => {
                
            });
    });
}


// ================= CARRINHO DE COMPRAS =================
function addToCart(product) {
    // Verificar se esta logado
    const user = localStorage.getItem('taskteam_user');

    if (!user) {
        if (confirm('Precisas fazer login para adicionar produtos ao carrinho!\n\nQueres fazer login agora?')) {
            window.location.href = 'login-simples.html';
        }
        return;
    }

    // Obter carrinho atual
    let cart = JSON.parse(localStorage.getItem('taskteam_cart') || '[]');

    // Verificar se produto ja existe no carrinho
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex >= 0) {
        // Aumentar quantidade
        cart[existingIndex].quantity += 1;
    } else {
        // Adicionar novo produto
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            description: product.description,
            quantity: 1
        });
    }

    // Guardar no localStorage
    localStorage.setItem('taskteam_cart', JSON.stringify(cart));

    // Atualizar contador
    updateCartCount();

    // Feedback visual
    showNotification('✅ ' + product.name + ' adicionado ao carrinho!', 'success');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('taskteam_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('taskteam_cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('taskteam_cart', JSON.stringify(cart));
    updateCartCount();
}

function clearCart() {
    localStorage.removeItem('taskteam_cart');
    updateCartCount();
}

// ================= CART DROPDOWN =================
function toggleCartDropdown() {
    const dropdown = document.getElementById('cart-dropdown');
    if (!dropdown) {
        console.error('Dropdown do carrinho não encontrado!');
        return;
    }

    

    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        renderCartDropdown();
        dropdown.style.display = 'block';
    }
}

function renderCartDropdown() {
    const cart = JSON.parse(localStorage.getItem('taskteam_cart') || '[]');
    const itemsContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total-price');

    if (!itemsContainer || !totalElement) {
        console.error('Elementos do dropdown não encontrados!');
        return;
    }

    

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<div class="cart-dropdown-empty"><i class="fas fa-shopping-cart"></i><p>Carrinho vazio</p></div>';
        totalElement.textContent = '€0.00';
        return;
    }

    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = '€' + total.toFixed(2);

    // Renderizar items
    itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-dropdown-item">
            <img src="${item.image_url}" alt="${item.name}">
            <div class="cart-dropdown-item-info">
                <h4>${item.name}</h4>
                <p>Qtd: ${item.quantity}</p>
            </div>
            <div class="cart-dropdown-item-price">
                €${(item.price * item.quantity).toFixed(2)}
            </div>
        </div>
    `).join('');
}
