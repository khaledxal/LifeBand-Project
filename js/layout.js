// js/layout.js — LifeBand Unified Layout v2
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function injectLayout() {
    const lang  = localStorage.getItem('preferred_lang') || 'ar';
    const isAr  = lang === 'ar';
    const theme = localStorage.getItem('theme') || 'light';

    // Apply theme immediately
    document.body.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
    document.documentElement.lang = lang;
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';

    /* ── NAV ITEMS (center links — static) ── */
    const staticLinks = `
        <a href="index.html"        class="nav-item" data-page="index">
            🏠 ${isAr ? 'الرئيسية' : 'Home'}
        </a>
        <a href="tips.html"         class="nav-item" data-page="tips">
            💡 ${isAr ? 'نصائح طبية' : 'Medical Tips'}
        </a>
        <div class="dropdown">
            <button class="nav-item dropdown-trigger">
                🌿 ${isAr ? 'للمختصين' : 'Specialists'}
                <span class="chevron">▾</span>
            </button>
            <div class="dropdown-content">
                <a href="volunteering.html">🤝 ${isAr ? 'التطوع الصحي' : 'Volunteering'}</a>
                <a href="innovation.html">🚀 ${isAr ? 'الابتكار' : 'Innovation'}</a>
            </div>
        </div>
        <div id="dynamic-links" style="display:contents;"></div>
    `;

    /* ── DRAWER (mobile) ── */
    const drawerHTML = `
    <div id="navDrawerOverlay" class="nav-drawer-overlay"></div>
    <nav id="navDrawer" class="nav-drawer">
        <div class="drawer-header">
            <span class="nav-brand">LifeBand</span>
            <button class="drawer-close" id="drawerClose">✕</button>
        </div>
        <span class="drawer-section-label">${isAr ? 'القائمة الرئيسية' : 'Main Menu'}</span>
        <a href="index.html"        class="drawer-item"><span class="drawer-icon">🏠</span>${isAr ? 'الرئيسية' : 'Home'}</a>
        <a href="tips.html"         class="drawer-item"><span class="drawer-icon">💡</span>${isAr ? 'نصائح طبية' : 'Medical Tips'}</a>
        <a href="volunteering.html" class="drawer-item"><span class="drawer-icon">🤝</span>${isAr ? 'التطوع الصحي' : 'Volunteering'}</a>
        <a href="innovation.html"   class="drawer-item"><span class="drawer-icon">🚀</span>${isAr ? 'الابتكار' : 'Innovation'}</a>
        <div class="drawer-divider"></div>
        <span class="drawer-section-label">${isAr ? 'حسابي' : 'Account'}</span>
        <div id="drawer-auth"></div>
        <div class="drawer-divider"></div>
        <div style="display:flex; gap:8px; padding:8px 12px;">
            <button id="drawerThemeBtn" class="nav-icon-btn" style="flex:1; width:auto; border-radius:10px; gap:6px; font-size:13px; font-weight:700;">
                ${theme === 'dark' ? '☀️' : '🌙'} ${isAr ? (theme==='dark'?'فاتح':'داكن') : (theme==='dark'?'Light':'Dark')}
            </button>
            <button id="drawerLangBtn" class="nav-icon-btn" style="flex:1; width:auto; border-radius:10px; gap:6px; font-size:13px; font-weight:700;">
                🌐 ${isAr ? 'EN' : 'AR'}
            </button>
        </div>
    </nav>`;

    /* ── HEADER ── */
    const headerHTML = `
    <header class="navbar" id="mainNavbar">
        <a href="index.html" class="nav-brand">LifeBand</a>

        <nav class="nav-links" aria-label="main navigation">
            ${staticLinks}
            <span id="auth-zone"></span>
        </nav>

        <div class="nav-actions">
            <button id="langBtn"   class="lang-toggle"  title="${isAr?'Switch to English':'التبديل للعربية'}">${isAr ? 'EN' : 'AR'}</button>
            <button id="themeBtn"  class="theme-toggle" title="${isAr?'تغيير المظهر':'Toggle theme'}">${theme === 'dark' ? '☀️' : '🌙'}</button>
            <button id="hamburger" class="nav-hamburger" aria-label="menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </header>
    ${drawerHTML}`;

    /* ── FOOTER ── */
    const footerHTML = `
    <footer class="site-footer">
        <div class="footer-inner">
            <div>
                <div class="footer-brand">⚕ LifeBand</div>
                <p class="footer-tagline">${isAr
                    ? 'نظام طبي ذكي يربط ملفك الصحي بتقنية NFC لضمان الرعاية الفورية.'
                    : 'A smart medical system linking your health file via NFC for instant emergency care.'}</p>
            </div>
            <div class="footer-col">
                <h4>${isAr ? 'روابط سريعة' : 'Quick Links'}</h4>
                <a href="index.html">${isAr ? 'الرئيسية' : 'Home'}</a>
                <a href="tips.html">${isAr ? 'نصائح طبية' : 'Medical Tips'}</a>
                <a href="volunteering.html">${isAr ? 'التطوع' : 'Volunteering'}</a>
            </div>
            <div class="footer-col">
                <h4>${isAr ? 'للمسعفين' : 'For Rescuers'}</h4>
                <a href="active-reports.html">${isAr ? 'البلاغات النشطة' : 'Active Reports'}</a>
                <a href="history.html">${isAr ? 'سجل الحالات' : 'Case History'}</a>
                <a href="rewards.html">${isAr ? 'المكافآت' : 'Rewards'}</a>
            </div>
            <div class="footer-col">
                <h4>${isAr ? 'الحساب' : 'Account'}</h4>
                <a href="register.html">${isAr ? 'إنشاء حساب' : 'Register'}</a>
                <a href="login.html">${isAr ? 'تسجيل دخول' : 'Login'}</a>
            </div>
        </div>
        <div class="footer-inner" style="display:block;">
            <div class="footer-bottom">
                <span>© 2026 LifeBand.</span>
                <span>·</span>
                <span>${isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</span>
            </div>
        </div>
    </footer>`;

    /* ── INJECT ── */
    const container = document.querySelector('.container') || document.querySelector('#main-layout');
    if (container) {
        container.insertAdjacentHTML('beforebegin', headerHTML);
        container.insertAdjacentHTML('afterend', footerHTML);
    } else {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    // Mark active page
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item[data-page]').forEach(a => {
        if (a.getAttribute('href') === page) a.classList.add('active');
    });

    initEvents();
    initAuth();
}

/* ── EVENTS ── */
function initEvents() {
    const themeBtn       = document.getElementById('themeBtn');
    const langBtn        = document.getElementById('langBtn');
    const hamburger      = document.getElementById('hamburger');
    const drawer         = document.getElementById('navDrawer');
    const overlay        = document.getElementById('navDrawerOverlay');
    const drawerClose    = document.getElementById('drawerClose');
    const drawerThemeBtn = document.getElementById('drawerThemeBtn');
    const drawerLangBtn  = document.getElementById('drawerLangBtn');

    /* Theme */
    function applyTheme(t) {
        document.body.setAttribute('data-theme', t === 'dark' ? 'dark' : '');
        if (themeBtn) themeBtn.innerText = t === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', t);
    }

    if (themeBtn) themeBtn.onclick = () => {
        const nt = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(nt);
    };
    if (drawerThemeBtn) drawerThemeBtn.onclick = () => {
        const nt = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(nt);
        const isAr = (localStorage.getItem('preferred_lang')||'ar') === 'ar';
        drawerThemeBtn.innerHTML = `${nt==='dark'?'☀️':'🌙'} ${isAr?(nt==='dark'?'فاتح':'داكن'):(nt==='dark'?'Light':'Dark')}`;
    };

    /* Lang */
    function switchLang() {
        const cur = localStorage.getItem('preferred_lang') || 'ar';
        localStorage.setItem('preferred_lang', cur === 'ar' ? 'en' : 'ar');
        location.reload();
    }
    if (langBtn)        langBtn.onclick        = switchLang;
    if (drawerLangBtn)  drawerLangBtn.onclick  = switchLang;

    /* Drawer */
    function openDrawer()  { drawer?.classList.add('open'); overlay?.classList.add('open'); hamburger?.classList.add('open'); document.body.style.overflow='hidden'; }
    function closeDrawer() { drawer?.classList.remove('open'); overlay?.classList.remove('open'); hamburger?.classList.remove('open'); document.body.style.overflow=''; }

    if (hamburger)   hamburger.onclick   = openDrawer;
    if (drawerClose) drawerClose.onclick = closeDrawer;
    if (overlay)     overlay.onclick     = closeDrawer;

    /* Navbar scroll shadow */
    const navbar = document.getElementById('mainNavbar');
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        navbar.style.boxShadow = window.scrollY > 20
            ? '0 8px 32px rgba(0,0,0,0.15)'
            : '';
    }, { passive: true });
}

/* ── AUTH ── */
function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        const dynamicLinks = document.getElementById('dynamic-links');
        const authZone     = document.getElementById('auth-zone');
        const drawerAuth   = document.getElementById('drawer-auth');
        const lang         = localStorage.getItem('preferred_lang') || 'ar';
        const isAr         = lang === 'ar';
        const adminIn      = localStorage.getItem('adminLoggedIn') === 'true';

        /* Admin */
        if (adminIn) {
            if (dynamicLinks) dynamicLinks.innerHTML = `
                <a href="admin.html" class="nav-item">🛡️ ${isAr?'لوحة التحكم':'Admin Panel'}</a>`;
            if (authZone) authZone.innerHTML = `
                <button id="logoutBtn" class="nav-item" style="color:var(--danger);background:none;border:none;cursor:pointer;font-family:inherit;">
                    ⬅ ${isAr?'خروج':'Logout'}
                </button>`;
            if (drawerAuth) drawerAuth.innerHTML = `
                <a href="admin.html" class="drawer-item"><span class="drawer-icon">🛡️</span>${isAr?'لوحة التحكم':'Admin Panel'}</a>
                <button class="drawer-item" id="drawerLogoutAdmin" style="color:var(--danger);">
                    <span class="drawer-icon">⬅</span>${isAr?'خروج':'Logout'}
                </button>`;
            document.getElementById('logoutBtn')?.addEventListener('click', () => {
                localStorage.removeItem('adminLoggedIn'); location.href='index.html';
            });
            document.getElementById('drawerLogoutAdmin')?.addEventListener('click', () => {
                localStorage.removeItem('adminLoggedIn'); location.href='index.html';
            });
            return;
        }

        if (user) {
            try {
                const snap = await get(ref(db, 'users/' + user.uid));
                const data = snap.val();
                const isRescuer = data?.role === 'rescuer';

                if (dynamicLinks) dynamicLinks.innerHTML = isRescuer ? `
                    <a href="active-reports.html" class="nav-item" style="color:var(--danger);">
                        🚨 ${isAr?'البلاغات':'Reports'}
                    </a>
                    <a href="history.html"  class="nav-item">📋 ${isAr?'السجل':'History'}</a>
                    <a href="rewards.html"  class="nav-item">🏆 ${isAr?'المكافآت':'Rewards'}</a>
                ` : `
                    <a href="profile.html?id=${user.uid}" class="nav-item">👤 ${isAr?'ملفي الطبي':'My File'}</a>
                `;

                const userLabel = data?.name ? data.name.split(' ')[0] : (isAr?'حسابي':'Account');
                if (authZone) authZone.innerHTML = `
                    <button id="logoutBtn" class="nav-item" style="color:var(--danger);background:none;border:none;cursor:pointer;font-family:inherit;">
                        ⬅ ${isAr?'خروج':'Logout'}
                    </button>`;

                if (drawerAuth) drawerAuth.innerHTML = `
                    ${isRescuer ? `
                    <a href="active-reports.html" class="drawer-item" style="color:var(--danger);"><span class="drawer-icon">🚨</span>${isAr?'البلاغات النشطة':'Active Reports'}</a>
                    <a href="history.html"        class="drawer-item"><span class="drawer-icon">📋</span>${isAr?'سجل الحالات':'Case History'}</a>
                    <a href="rewards.html"        class="drawer-item"><span class="drawer-icon">🏆</span>${isAr?'المكافآت':'Rewards'}</a>
                    ` : `
                    <a href="profile.html?id=${user.uid}" class="drawer-item"><span class="drawer-icon">👤</span>${isAr?'ملفي الطبي':'My Medical File'}</a>
                    `}
                    <button class="drawer-item" id="drawerLogout" style="color:var(--danger);">
                        <span class="drawer-icon">⬅</span>${isAr?'تسجيل الخروج':'Logout'}
                    </button>`;

                const logout = () => {
                    if(confirm(isAr?'هل تريد الخروج؟':'Logout?'))
                        signOut(auth).then(() => location.href='index.html');
                };
                document.getElementById('logoutBtn')?.addEventListener('click', logout);
                document.getElementById('drawerLogout')?.addEventListener('click', logout);

            } catch(e) { console.error('Auth error', e); }
        } else {
            if (authZone) authZone.innerHTML = `
                <a href="login.html"    class="nav-item">🔑 ${isAr?'دخول':'Login'}</a>
                <a href="register.html" class="main-btn btn-auto btn-sm" style="text-decoration:none;">
                    ${isAr?'إنشاء حساب':'Register'}
                </a>`;
            if (drawerAuth) drawerAuth.innerHTML = `
                <a href="login.html"    class="drawer-item"><span class="drawer-icon">🔑</span>${isAr?'تسجيل دخول':'Login'}</a>
                <a href="register.html" class="drawer-item"><span class="drawer-icon">✨</span>${isAr?'إنشاء حساب':'Register'}</a>`;
        }
    });
}