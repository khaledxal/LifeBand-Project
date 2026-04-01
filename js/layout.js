// js/layout.js — LifeBand v4 (Heltro Style)
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function injectLayout() {
    const lang  = localStorage.getItem('preferred_lang') || 'ar';
    const isAr  = lang === 'ar';
    const theme = localStorage.getItem('theme') || 'light';

    // ── Apply theme + lang immediately (no flash) ──
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.lang = lang;
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';

    // ── TOP BAR ──
    const topbarHTML = `
    <div class="lb-topbar" id="lbTopbar">
        <div class="lb-topbar-inner">
            <span class="lb-topbar-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
            </span>
            <span class="lb-topbar-sep">·</span>
            <span class="lb-topbar-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.19-1.16a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
                <a href="tel:911">${isAr ? 'طوارئ: 911' : 'Emergency: 911'}</a>
            </span>
            <span class="lb-topbar-sep">·</span>
            <span class="lb-topbar-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${isAr ? 'متاح ٢٤/٧' : 'Available 24/7'}
            </span>
        </div>
    </div>`;

    // ── NAVBAR ──
    const navHTML = `
    <nav class="lb-nav" id="mainNavbar">
        <div class="lb-nav-inner">

            <!-- Brand -->
            <a href="index.html" class="lb-brand">
                <div class="lb-brand-icon">⚕</div>
                <span>LifeBand</span>
            </a>

            <!-- Center links -->
            <div class="lb-nav-links">
                <a href="index.html"  class="lb-nav-link" data-page="index.html">${isAr ? 'الرئيسية' : 'Home'}</a>
                <a href="tips.html"   class="lb-nav-link" data-page="tips.html">${isAr ? 'نصائح طبية' : 'Medical Tips'}</a>
                <div class="lb-dropdown">
                    <button class="lb-nav-link lb-dropdown-btn">
                        ${isAr ? 'للمختصين' : 'Specialists'}
                        <svg class="lb-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="lb-dropdown-menu">
                        <a href="volunteering.html" class="lb-dropdown-item">
                            <span class="lb-dropdown-icon">🤝</span>
                            <div>
                                <div class="lb-dropdown-title">${isAr ? 'التطوع الصحي' : 'Volunteering'}</div>
                                <div class="lb-dropdown-sub">${isAr ? 'انضم كمسعف متطوع' : 'Join as a rescuer'}</div>
                            </div>
                        </a>
                        <a href="innovation.html" class="lb-dropdown-item">
                            <span class="lb-dropdown-icon">🚀</span>
                            <div>
                                <div class="lb-dropdown-title">${isAr ? 'الابتكار التقني' : 'Innovation'}</div>
                                <div class="lb-dropdown-sub">${isAr ? 'تقنية NFC والذكاء الاصطناعي' : 'NFC & AI technology'}</div>
                            </div>
                        </a>
                    </div>
                </div>
                <div id="lb-dynamic-links" style="display:contents;"></div>
            </div>

            <!-- Actions -->
            <div class="lb-nav-actions">
                <div id="lb-auth-zone" style="display:flex;align-items:center;gap:8px;"></div>
                <button id="langBtn" class="lb-icon-btn" title="${isAr ? 'Switch to English' : 'التبديل للعربية'}">
                    ${isAr ? 'EN' : 'AR'}
                </button>
                <button id="themeBtn" class="lb-icon-btn lb-theme-btn" title="${isAr ? 'تبديل الوضع' : 'Toggle theme'}">
                    ${theme === 'dark'
                        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
                        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`
                    }
                </button>
                <button id="lb-bell-btn" class="lb-icon-btn" title="${isAr ? 'الإشعارات' : 'Notifications'}" style="position:relative;display:none;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                    <span id="lb-bell-badge" style="display:none;position:absolute;top:4px;right:4px;width:8px;height:8px;background:#ef4444;border-radius:50%;"></span>
                </button>
                <!-- Notifications dropdown -->
                <div id="lb-notif-dropdown" style="display:none;position:absolute;top:56px;${isAr?'left:16px':'right:16px'};width:300px;background:var(--lb-surface,#fff);border:1px solid var(--lb-border,#e5e7eb);border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.12);z-index:999;overflow:hidden;">
                    <div style="padding:14px 16px;border-bottom:1px solid var(--lb-border,#e5e7eb);font-weight:700;font-size:14px;">${isAr?'الإشعارات':'Notifications'}</div>
                    <div id="lb-notif-list" style="max-height:300px;overflow-y:auto;padding:8px;"></div>
                </div>
                <button id="lb-hamburger" class="lb-hamburger" aria-label="Menu">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>

    <!-- Mobile drawer overlay -->
    <div id="lb-overlay" class="lb-overlay"></div>

    <!-- Mobile drawer -->
    <div id="lb-drawer" class="lb-drawer">
        <div class="lb-drawer-head">
            <a href="index.html" class="lb-brand" style="font-size:17px;">⚕ LifeBand</a>
            <button id="lb-drawer-close" class="lb-drawer-close">✕</button>
        </div>

        <div class="lb-drawer-section-label">${isAr ? 'التنقل' : 'Navigation'}</div>
        <a href="index.html"        class="lb-drawer-link"><span>🏠</span>${isAr ? 'الرئيسية' : 'Home'}</a>
        <a href="tips.html"         class="lb-drawer-link"><span>💡</span>${isAr ? 'نصائح طبية' : 'Medical Tips'}</a>
        <a href="volunteering.html" class="lb-drawer-link"><span>🤝</span>${isAr ? 'التطوع الصحي' : 'Volunteering'}</a>
        <a href="innovation.html"   class="lb-drawer-link"><span>🚀</span>${isAr ? 'الابتكار' : 'Innovation'}</a>

        <div class="lb-drawer-divider"></div>
        <div class="lb-drawer-section-label">${isAr ? 'حسابي' : 'Account'}</div>
        <div id="lb-drawer-auth"></div>

        <div class="lb-drawer-divider"></div>
        <div class="lb-drawer-controls">
            <button id="lb-drawer-theme" class="lb-drawer-ctrl-btn">
                ${theme === 'dark'
                    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg> ${isAr ? 'وضع فاتح' : 'Light mode'}`
                    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> ${isAr ? 'وضع داكن' : 'Dark mode'}`
                }
            </button>
            <button id="lb-drawer-lang" class="lb-drawer-ctrl-btn">
                🌐 ${isAr ? 'English' : 'العربية'}
            </button>
        </div>
    </div>`;

    // ── FOOTER ──
    const footerHTML = `
    <footer class="lb-footer">
        <div class="lb-footer-top">
            <div class="lb-footer-brand-col">
                <div class="lb-footer-brand">⚕ LifeBand</div>
                <p class="lb-footer-tagline">${isAr
                    ? 'نظام طبي ذكي يربط ملفك الصحي بتقنية NFC لضمان الرعاية الفورية عند الطوارئ.'
                    : 'A smart medical system linking your health file via NFC for instant emergency care.'}</p>
                <div class="lb-footer-contact">
                    <a href="tel:911">📞 ${isAr ? 'طوارئ: 911' : 'Emergency: 911'}</a>
                    <a href="mailto:info@lifeband.sa">✉️ info@lifeband.sa</a>
                </div>
            </div>
            <div class="lb-footer-col">
                <h4>${isAr ? 'روابط سريعة' : 'Quick Links'}</h4>
                <a href="index.html">${isAr ? 'الرئيسية' : 'Home'}</a>
                <a href="tips.html">${isAr ? 'نصائح طبية' : 'Medical Tips'}</a>
                <a href="volunteering.html">${isAr ? 'التطوع' : 'Volunteering'}</a>
                <a href="innovation.html">${isAr ? 'الابتكار' : 'Innovation'}</a>
            </div>
            <div class="lb-footer-col">
                <h4>${isAr ? 'للمسعفين' : 'For Rescuers'}</h4>
                <a href="active-reports.html">${isAr ? 'البلاغات النشطة' : 'Active Reports'}</a>
                <a href="history.html">${isAr ? 'سجل الحالات' : 'Case History'}</a>
                <a href="rewards.html">${isAr ? 'المكافآت' : 'Rewards'}</a>
            </div>
            <div class="lb-footer-col">
                <h4>${isAr ? 'الحساب' : 'Account'}</h4>
                <a href="register.html">${isAr ? 'إنشاء حساب' : 'Register'}</a>
                <a href="login.html">${isAr ? 'تسجيل دخول' : 'Login'}</a>
                <a href="profile.html">${isAr ? 'ملفي الطبي' : 'My Profile'}</a>
            </div>
        </div>
        <div class="lb-footer-bottom">
            <span>© 2026 LifeBand · ${isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</span>
            <span class="lb-footer-badge">${isAr ? 'صُنع بـ ❤️ للمملكة' : 'Made with ❤️ for KSA'}</span>
        </div>
    </footer>`;

    // ── INJECT ──
    document.body.insertAdjacentHTML('afterbegin', topbarHTML + navHTML);

    const container = document.querySelector('.container') || document.querySelector('#main-layout');
    if (container) {
        container.insertAdjacentHTML('afterend', footerHTML);
        container.classList.add('lb-page-body');
    } else {
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    // ── Mark active page ──
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.lb-nav-link[data-page]').forEach(a => {
        if (a.getAttribute('data-page') === page) a.classList.add('active');
    });

    _initEvents();
    _initAuth();
}

// ─────────────────────────────────────────────
function _initEvents() {
    const navbar = document.getElementById('mainNavbar');

    // ── Dropdown click toggle (fix disappearing on scroll) ──
    document.querySelectorAll('.lb-dropdown-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = btn.nextElementSibling;
            const isOpen = menu.style.display === 'block';
            // Close all dropdowns first
            document.querySelectorAll('.lb-dropdown-menu').forEach(m => m.style.display = 'none');
            menu.style.display = isOpen ? 'none' : 'block';
        });
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.lb-dropdown')) {
            document.querySelectorAll('.lb-dropdown-menu').forEach(m => m.style.display = 'none');
        }
        if (!e.target.closest('#lb-notif-dropdown') && !e.target.closest('#lb-bell-btn')) {
            const nd = document.getElementById('lb-notif-dropdown');
            if (nd) nd.style.display = 'none';
        }
    });

    // ── Bell notification toggle ──
    document.getElementById('lb-bell-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const nd = document.getElementById('lb-notif-dropdown');
        if (nd) nd.style.display = nd.style.display === 'none' ? 'block' : 'none';
        document.getElementById('lb-bell-badge').style.display = 'none';
    });

    // Scroll shadow
    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });

    // ── Theme toggle ──
    const applyTheme = (t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        const isDark = t === 'dark';
        const sunSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
        const moonSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
        const isAr = (localStorage.getItem('preferred_lang') || 'ar') === 'ar';

        const btn = document.getElementById('themeBtn');
        if (btn) btn.innerHTML = isDark ? sunSVG : moonSVG;

        const dBtn = document.getElementById('lb-drawer-theme');
        if (dBtn) dBtn.innerHTML = isDark
            ? `${sunSVG} ${isAr ? 'وضع فاتح' : 'Light mode'}`
            : `${moonSVG} ${isAr ? 'وضع داكن' : 'Dark mode'}`;
    };

    document.getElementById('themeBtn')?.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
    document.getElementById('lb-drawer-theme')?.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(cur === 'dark' ? 'light' : 'dark');
    });

    // ── Lang toggle ──
    const switchLang = () => {
        const cur = localStorage.getItem('preferred_lang') || 'ar';
        localStorage.setItem('preferred_lang', cur === 'ar' ? 'en' : 'ar');
        location.reload();
    };
    document.getElementById('langBtn')?.addEventListener('click', switchLang);
    document.getElementById('lb-drawer-lang')?.addEventListener('click', switchLang);

    // ── Mobile drawer ──
    const drawer  = document.getElementById('lb-drawer');
    const overlay = document.getElementById('lb-overlay');
    const burger  = document.getElementById('lb-hamburger');
    const close   = document.getElementById('lb-drawer-close');

    const openDrawer  = () => { drawer?.classList.add('open'); overlay?.classList.add('open'); burger?.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const closeDrawer = () => { drawer?.classList.remove('open'); overlay?.classList.remove('open'); burger?.classList.remove('open'); document.body.style.overflow = ''; };

    burger?.addEventListener('click', openDrawer);
    close?.addEventListener('click', closeDrawer);
    overlay?.addEventListener('click', closeDrawer);
}

// ─────────────────────────────────────────────
function _initAuth() {
    onAuthStateChanged(auth, async user => {
        const dynamicLinks = document.getElementById('lb-dynamic-links');
        const authZone     = document.getElementById('lb-auth-zone');
        const drawerAuth   = document.getElementById('lb-drawer-auth');
        const lang         = localStorage.getItem('preferred_lang') || 'ar';
        const isAr         = lang === 'ar';
        const adminIn      = localStorage.getItem('adminLoggedIn') === 'true';

        if (adminIn) {
            _set(dynamicLinks, `<a href="admin.html" class="lb-nav-link">🛡️ ${isAr ? 'لوحة التحكم' : 'Admin'}</a>`);
            _set(authZone, `<button id="lb-logout" class="lb-btn-danger">${isAr ? 'خروج' : 'Logout'}</button>`);
            _set(drawerAuth, `
                <a href="admin.html" class="lb-drawer-link"><span>🛡️</span>${isAr ? 'لوحة التحكم' : 'Admin'}</a>
                <button id="lb-drawer-logout" class="lb-drawer-link" style="color:var(--lb-danger);border:none;background:none;font-family:inherit;cursor:pointer;width:100%;text-align:${isAr?'right':'left'};">
                    <span>⬅</span>${isAr ? 'خروج' : 'Logout'}
                </button>`);
            const lo = () => { localStorage.removeItem('adminLoggedIn'); location.href = 'index.html'; };
            document.getElementById('lb-logout')?.addEventListener('click', lo);
            document.getElementById('lb-drawer-logout')?.addEventListener('click', lo);
            return;
        }

        if (user) {
            try {
                const snap = await get(ref(db, 'users/' + user.uid));
                const data = snap.val();
                const isRescuer = data?.role === 'rescuer';

                _set(dynamicLinks, isRescuer ? `
                    <a href="active-reports.html" class="lb-nav-link lb-nav-danger">🚨 ${isAr ? 'البلاغات' : 'Reports'}</a>
                    <a href="history.html"  class="lb-nav-link">📋 ${isAr ? 'السجل' : 'History'}</a>
                    <a href="rewards.html"  class="lb-nav-link">🏆 ${isAr ? 'المكافآت' : 'Rewards'}</a>
                ` : `
                    <a href="profile.html?id=${user.uid}" class="lb-nav-link">👤 ${isAr ? 'ملفي' : 'My File'}</a>
                `);

                _set(authZone, `<button id="lb-logout" class="lb-btn-danger">${isAr ? 'خروج' : 'Logout'}</button>`);

                _set(drawerAuth, (isRescuer ? `
                    <a href="active-reports.html" class="lb-drawer-link" style="color:var(--lb-danger);"><span>🚨</span>${isAr ? 'البلاغات' : 'Reports'}</a>
                    <a href="history.html" class="lb-drawer-link"><span>📋</span>${isAr ? 'السجل' : 'History'}</a>
                    <a href="rewards.html" class="lb-drawer-link"><span>🏆</span>${isAr ? 'المكافآت' : 'Rewards'}</a>
                ` : `
                    <a href="profile.html?id=${user.uid}" class="lb-drawer-link"><span>👤</span>${isAr ? 'ملفي الطبي' : 'My Profile'}</a>
                `) + `<button id="lb-drawer-logout" class="lb-drawer-link" style="color:var(--lb-danger);border:none;background:none;font-family:inherit;cursor:pointer;width:100%;text-align:${isAr?'right':'left'};"><span>⬅</span>${isAr ? 'تسجيل الخروج' : 'Logout'}</button>`);

                const logout = () => confirm(isAr ? 'هل تريد الخروج؟' : 'Logout?') && signOut(auth).then(() => location.href = 'index.html');
                document.getElementById('lb-logout')?.addEventListener('click', logout);
                document.getElementById('lb-drawer-logout')?.addEventListener('click', logout);

                // ── Notifications listener ──
                const { onValue: _onValue, ref: _ref } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
                const bellBtn = document.getElementById('lb-bell-btn');
                const bellBadge = document.getElementById('lb-bell-badge');
                const notifList = document.getElementById('lb-notif-list');
                if (bellBtn) bellBtn.style.display = 'flex';

                _onValue(_ref(db, 'notifications'), (snap) => {
                    const items = [];
                    snap.forEach(child => {
                        const d = child.val();
                        // Show to all or to specific user
                        if (!d.targetUid || d.targetUid === user.uid) {
                            items.push(d);
                        }
                    });
                    if (notifList) {
                        if (items.length === 0) {
                            notifList.innerHTML = `<p style="text-align:center;opacity:0.5;padding:16px;font-size:13px;">${isAr?'لا توجد إشعارات':'No notifications'}</p>`;
                        } else {
                            notifList.innerHTML = items.reverse().map(d => {
                                const date = d.sentAt ? new Date(d.sentAt).toLocaleString(isAr?'ar-SA':'en-US') : '';
                                return `<div style="padding:12px 14px;border-radius:10px;margin-bottom:8px;background:var(--lb-bg,#f9fafb);border:1px solid var(--lb-border,#e5e7eb);">
                                    <div style="font-weight:700;font-size:13px;margin-bottom:5px;">${d.title||'إشعار'}</div>
                                    <div style="font-size:13px;line-height:1.6;margin-bottom:6px;">${d.body||''}</div>
                                    <div style="font-size:11px;opacity:0.5;">${date}</div>
                                </div>`;
                            }).join('');
                            if (bellBadge) bellBadge.style.display = 'block';
                        }
                    }
                });

            } catch (e) { console.error(e); }
        } else {
            _set(authZone, `
                <a href="login.html"    class="lb-nav-link">${isAr ? 'دخول' : 'Login'}</a>
                <a href="register.html" class="lb-btn-primary" style="text-decoration:none;">${isAr ? 'إنشاء حساب' : 'Register'}</a>`);
            _set(drawerAuth, `
                <a href="login.html"    class="lb-drawer-link"><span>🔑</span>${isAr ? 'تسجيل دخول' : 'Login'}</a>
                <a href="register.html" class="lb-drawer-link"><span>✨</span>${isAr ? 'إنشاء حساب' : 'Register'}</a>`);
        }
    });
}

function _set(el, html) { if (el) el.innerHTML = html; }