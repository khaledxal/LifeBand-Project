// js/layout.js — LifeBand v3
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function injectLayout() {
    const lang  = localStorage.getItem('preferred_lang') || 'ar';
    const isAr  = lang === 'ar';
    const theme = localStorage.getItem('theme') || 'light';

    // Apply theme + lang immediately
    document.body.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
    document.documentElement.lang = lang;
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';

    // ── NAVBAR HTML ──
    const navHTML = `
    <nav class="navbar" id="mainNavbar">

        <!-- Brand (right on RTL) -->
        <a href="index.html" class="nav-brand">
            <div class="nav-brand-icon">⚕</div>
            LifeBand
        </a>

        <!-- Center links — absolute positioned for true centering -->
        <div class="nav-links">
            <a href="index.html"  class="nav-item" data-page="index.html">🏠 ${isAr?'الرئيسية':'Home'}</a>
            <a href="tips.html"   class="nav-item" data-page="tips.html">💡 ${isAr?'نصائح طبية':'Medical Tips'}</a>
            <div class="dropdown">
                <button class="nav-item">🌿 ${isAr?'للمختصين':'Specialists'} <span class="chevron">▾</span></button>
                <div class="dropdown-content">
                    <a href="volunteering.html">🤝 ${isAr?'التطوع الصحي':'Volunteering'}</a>
                    <a href="innovation.html">🚀 ${isAr?'الابتكار':'Innovation'}</a>
                </div>
            </div>
            <div id="dynamic-links" style="display:contents;"></div>
        </div>

        <!-- Actions (left on RTL) -->
        <div class="nav-actions">
            <span id="auth-zone" style="display:flex;align-items:center;gap:6px;"></span>
            <button id="langBtn"  class="lang-toggle"  title="Switch language">${isAr?'EN':'AR'}</button>
            <button id="themeBtn" class="theme-toggle" title="Toggle theme">${theme==='dark'?'☀️':'🌙'}</button>
            <button id="hamburger" class="nav-hamburger" aria-label="Menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <!-- Mobile overlay + drawer -->
    <div id="drawerOverlay" class="nav-drawer-overlay"></div>
    <div id="navDrawer" class="nav-drawer">
        <div class="drawer-header">
            <a href="index.html" class="nav-brand" style="font-size:18px;">⚕ LifeBand</a>
            <button id="drawerClose" class="drawer-close">✕</button>
        </div>
        <span class="drawer-section-label">${isAr?'القائمة':'Navigation'}</span>
        <a href="index.html"        class="drawer-item"><span class="drawer-icon">🏠</span>${isAr?'الرئيسية':'Home'}</a>
        <a href="tips.html"         class="drawer-item"><span class="drawer-icon">💡</span>${isAr?'نصائح طبية':'Medical Tips'}</a>
        <a href="volunteering.html" class="drawer-item"><span class="drawer-icon">🤝</span>${isAr?'التطوع الصحي':'Volunteering'}</a>
        <a href="innovation.html"   class="drawer-item"><span class="drawer-icon">🚀</span>${isAr?'الابتكار':'Innovation'}</a>
        <div class="drawer-divider"></div>
        <span class="drawer-section-label">${isAr?'حسابي':'Account'}</span>
        <div id="drawer-auth"></div>
        <div class="drawer-divider"></div>
        <div style="display:flex;gap:8px;padding:4px 12px;">
            <button id="drawerTheme" style="flex:1;padding:11px;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-surface);color:var(--text-body);cursor:pointer;font-size:13px;font-weight:700;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;">
                ${theme==='dark'?'☀️':'🌙'} ${isAr?(theme==='dark'?'فاتح':'داكن'):(theme==='dark'?'Light':'Dark')}
            </button>
            <button id="drawerLang" style="flex:1;padding:11px;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-surface);color:var(--text-body);cursor:pointer;font-size:13px;font-weight:700;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;">
                🌐 ${isAr?'EN':'AR'}
            </button>
        </div>
    </div>

    <!-- Decorative blobs -->
    <div class="bg-blob bg-blob-1" aria-hidden="true"></div>
    <div class="bg-blob bg-blob-2" aria-hidden="true"></div>`;

    // ── FOOTER HTML ──
    const footerHTML = `
    <footer class="site-footer">
        <div class="footer-inner">
            <div>
                <div class="footer-brand">⚕ LifeBand</div>
                <p class="footer-tagline">${isAr
                    ? 'نظام طبي ذكي يربط ملفك الصحي بتقنية NFC لضمان الرعاية الفورية عند الطوارئ.'
                    : 'A smart medical system linking your health file via NFC for instant emergency care.'}</p>
            </div>
            <div class="footer-col">
                <h4>${isAr?'روابط سريعة':'Quick Links'}</h4>
                <a href="index.html">${isAr?'الرئيسية':'Home'}</a>
                <a href="tips.html">${isAr?'نصائح طبية':'Medical Tips'}</a>
                <a href="volunteering.html">${isAr?'التطوع':'Volunteering'}</a>
            </div>
            <div class="footer-col">
                <h4>${isAr?'للمسعفين':'For Rescuers'}</h4>
                <a href="active-reports.html">${isAr?'البلاغات النشطة':'Active Reports'}</a>
                <a href="history.html">${isAr?'سجل الحالات':'Case History'}</a>
                <a href="rewards.html">${isAr?'المكافآت':'Rewards'}</a>
            </div>
            <div class="footer-col">
                <h4>${isAr?'الحساب':'Account'}</h4>
                <a href="register.html">${isAr?'إنشاء حساب':'Register'}</a>
                <a href="login.html">${isAr?'تسجيل دخول':'Login'}</a>
            </div>
        </div>
        <div class="footer-inner" style="display:block;">
            <div class="footer-bottom">© 2026 LifeBand · ${isAr?'جميع الحقوق محفوظة':'All rights reserved'}</div>
        </div>
    </footer>`;

    // Inject before container and after
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    const container = document.querySelector('.container') || document.querySelector('#main-layout');
    if (container) container.insertAdjacentHTML('afterend', footerHTML);
    else document.body.insertAdjacentHTML('beforeend', footerHTML);

    // Add page-body padding to container
    if (container) container.classList.add('page-body');

    // Mark active page
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item[data-page]').forEach(a => {
        if (a.getAttribute('data-page') === page) a.classList.add('active');
    });

    _initEvents();
    _initAuth();
}

function _initEvents() {
    // Navbar scroll shadow
    const navbar = document.getElementById('mainNavbar');
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive:true });

    // Theme
    const applyTheme = t => {
        document.body.setAttribute('data-theme', t==='dark'?'dark':'');
        localStorage.setItem('theme', t);
        const btn = document.getElementById('themeBtn');
        const dBtn = document.getElementById('drawerTheme');
        const isAr = (localStorage.getItem('preferred_lang')||'ar')==='ar';
        if(btn)  btn.innerText  = t==='dark'?'☀️':'🌙';
        if(dBtn) dBtn.innerHTML = `${t==='dark'?'☀️':'🌙'} ${isAr?(t==='dark'?'فاتح':'داكن'):(t==='dark'?'Light':'Dark')}`;
    };

    document.getElementById('themeBtn')?.addEventListener('click', () => {
        const nt = document.body.getAttribute('data-theme')==='dark'?'light':'dark';
        applyTheme(nt);
    });
    document.getElementById('drawerTheme')?.addEventListener('click', () => {
        const nt = document.body.getAttribute('data-theme')==='dark'?'light':'dark';
        applyTheme(nt);
    });

    // Lang
    const switchLang = () => {
        const cur = localStorage.getItem('preferred_lang')||'ar';
        localStorage.setItem('preferred_lang', cur==='ar'?'en':'ar');
        location.reload();
    };
    document.getElementById('langBtn')?.addEventListener('click', switchLang);
    document.getElementById('drawerLang')?.addEventListener('click', switchLang);

    // Drawer
    const drawer  = document.getElementById('navDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const burger  = document.getElementById('hamburger');
    const close   = document.getElementById('drawerClose');

    const openDrawer  = () => { drawer?.classList.add('open'); overlay?.classList.add('open'); burger?.classList.add('open'); document.body.style.overflow='hidden'; };
    const closeDrawer = () => { drawer?.classList.remove('open'); overlay?.classList.remove('open'); burger?.classList.remove('open'); document.body.style.overflow=''; };

    burger?.addEventListener('click', openDrawer);
    close?.addEventListener('click',  closeDrawer);
    overlay?.addEventListener('click', closeDrawer);
}

function _initAuth() {
    onAuthStateChanged(auth, async user => {
        const dynamicLinks = document.getElementById('dynamic-links');
        const authZone     = document.getElementById('auth-zone');
        const drawerAuth   = document.getElementById('drawer-auth');
        const lang         = localStorage.getItem('preferred_lang')||'ar';
        const isAr         = lang==='ar';
        const adminIn      = localStorage.getItem('adminLoggedIn')==='true';

        if (adminIn) {
            _setLinks(dynamicLinks, `<a href="admin.html" class="nav-item">🛡️ ${isAr?'لوحة التحكم':'Admin'}</a>`);
            _setLinks(authZone, `<button id="logoutBtn" class="main-btn btn-auto btn-sm btn-danger" style="font-size:13px;">${isAr?'خروج':'Logout'}</button>`);
            _setLinks(drawerAuth, `<a href="admin.html" class="drawer-item"><span class="drawer-icon">🛡️</span>${isAr?'لوحة التحكم':'Admin'}</a><button class="drawer-item" id="dLogout" style="color:var(--danger);"><span class="drawer-icon">⬅</span>${isAr?'خروج':'Logout'}</button>`);
            document.getElementById('logoutBtn')?.addEventListener('click',()=>{ localStorage.removeItem('adminLoggedIn'); location.href='index.html'; });
            document.getElementById('dLogout')?.addEventListener('click',()=>{ localStorage.removeItem('adminLoggedIn'); location.href='index.html'; });
            return;
        }

        if (user) {
            try {
                const snap = await get(ref(db,'users/'+user.uid));
                const data = snap.val();
                const isRescuer = data?.role==='rescuer';

                _setLinks(dynamicLinks, isRescuer ? `
                    <a href="active-reports.html" class="nav-item" style="color:var(--danger);">🚨 ${isAr?'البلاغات':'Reports'}</a>
                    <a href="history.html"  class="nav-item">📋 ${isAr?'السجل':'History'}</a>
                    <a href="rewards.html"  class="nav-item">🏆 ${isAr?'المكافآت':'Rewards'}</a>
                ` : `
                    <a href="profile.html?id=${user.uid}" class="nav-item">👤 ${isAr?'ملفي الطبي':'My File'}</a>
                `);

                _setLinks(authZone, `<button id="logoutBtn" class="main-btn btn-auto btn-sm btn-danger" style="font-size:13px;">⬅ ${isAr?'خروج':'Logout'}</button>`);

                _setLinks(drawerAuth, (isRescuer?`
                    <a href="active-reports.html" class="drawer-item" style="color:var(--danger);"><span class="drawer-icon">🚨</span>${isAr?'البلاغات':'Reports'}</a>
                    <a href="history.html" class="drawer-item"><span class="drawer-icon">📋</span>${isAr?'السجل':'History'}</a>
                    <a href="rewards.html" class="drawer-item"><span class="drawer-icon">🏆</span>${isAr?'المكافآت':'Rewards'}</a>
                `:`
                    <a href="profile.html?id=${user.uid}" class="drawer-item"><span class="drawer-icon">👤</span>${isAr?'ملفي الطبي':'My File'}</a>
                `)+`<button class="drawer-item" id="dLogout" style="color:var(--danger);"><span class="drawer-icon">⬅</span>${isAr?'تسجيل الخروج':'Logout'}</button>`);

                const logout = () => confirm(isAr?'هل تريد الخروج؟':'Logout?') && signOut(auth).then(()=>location.href='index.html');
                document.getElementById('logoutBtn')?.addEventListener('click', logout);
                document.getElementById('dLogout')?.addEventListener('click', logout);

            } catch(e){ console.error(e); }
        } else {
            _setLinks(authZone, `
                <a href="login.html"    class="nav-item">🔑 ${isAr?'دخول':'Login'}</a>
                <a href="register.html" class="main-btn btn-auto btn-sm" style="text-decoration:none;font-size:13px;">${isAr?'إنشاء حساب':'Register'}</a>`);
            _setLinks(drawerAuth, `
                <a href="login.html"    class="drawer-item"><span class="drawer-icon">🔑</span>${isAr?'تسجيل دخول':'Login'}</a>
                <a href="register.html" class="drawer-item"><span class="drawer-icon">✨</span>${isAr?'إنشاء حساب':'Register'}</a>`);
        }
    });
}

function _setLinks(el, html) { if(el) el.innerHTML = html; }