// js/layout.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function injectLayout() {
    const lang = localStorage.getItem('preferred_lang') || 'ar';
    const isAr = lang === 'ar';

    // 1. الهيدر (Navbar) الأساسي
    const headerHTML = `
    <header class="navbar">
        <a href="index.html" class="nav-brand">LifeBand</a>
        <div class="nav-links">
            <a href="index.html" class="nav-item" data-i18n="nav_home">${isAr ? 'الرئيسية' : 'Home'}</a> 
            <a href="tips.html" class="nav-item" data-i18n="nav_tips">${isAr ? 'نصائح طبية' : 'Medical Tips'}</a>
            
            <div class="dropdown">
                <button class="nav-item" style="background:none; border:none; cursor:pointer; font-family: inherit;">
                    ${isAr ? 'للمختصين ▼' : 'Specialists ▼'}
                </button>
                <div class="dropdown-content">
                    <a href="volunteering.html">${isAr ? 'التطوع الصحي' : 'Volunteering'}</a>
                    <a href="innovation.html">${isAr ? 'الابتكار' : 'Innovation'}</a>
                </div>
            </div>

            <div id="dynamic-links" style="display: flex; gap: 10px;"></div>
            
            <span id="auth-zone"></span>
            <button id="langBtn" class="lang-toggle">${isAr ? 'EN' : 'AR'}</button>
            <button id="themeBtn" class="theme-toggle">🌙</button>
        </div>
    </header>`;

    // 2. الفوتر
    const footerHTML = `
    <footer style="margin-top: 50px; padding: 40px 20px; background: var(--glass); border-radius: 40px 40px 0 0;">
        <div style="text-align: center; opacity: 0.5; font-size: 0.8rem;">
            © 2026 ${isAr ? 'جميع الحقوق محفوظة لمشروع LifeBand.' : 'All rights reserved to LifeBand project.'}
        </div>
    </footer>`;

    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', headerHTML);
        container.insertAdjacentHTML('beforeend', footerHTML);
        
        // تفعيل الأزرار (اللغة والثيم)
        initLayoutEvents();
        // تفعيل نظام الحسابات (المتطوعين ضد المرضى)
        initAuthSystem();
    }
}

function initAuthSystem() {
    onAuthStateChanged(auth, async (user) => {
        const dynamicLinks = document.getElementById('dynamic-links');
        const authZone = document.getElementById('auth-zone');
        const lang = localStorage.getItem('preferred_lang') || 'ar';
        const isAr = lang === 'ar';

        if (user) {
            try {
                const snapshot = await get(ref(db, 'users/' + user.uid));
                const userData = snapshot.val();

                // --- إذا كان المستخدم متطوع (Rescuer) ---
                if (userData && userData.role === 'rescuer') {
                    dynamicLinks.innerHTML = `
                        <a href="active-reports.html" class="nav-item" style="color: var(--secondary);">${isAr ? 'البلاغات' : 'Reports'}</a>
                        <a href="history.html" class="nav-item">${isAr ? 'سجل العمليات' : 'History'}</a>
                        <a href="rewards.html" class="nav-item">${isAr ? 'المكافآت' : 'Rewards'}</a>
                    `;
                } 
                // --- إذا كان مستخدم عادي (Patient) ---
                else {
                    dynamicLinks.innerHTML = `
                        <a href="profile.html?id=${user.uid}" class="nav-item">${isAr ? 'ملفي الطبي' : 'Medical File'}</a>
                    `;
                }

                // زر تسجيل الخروج
                authZone.innerHTML = `
                    <button id="logoutBtn" class="nav-item" style="background:none; border:none; cursor:pointer; color: #ef4444;">
                        ${isAr ? 'خروج' : 'Logout'}
                    </button>
                `;
                document.getElementById('logoutBtn').onclick = () => {
                    if(confirm(isAr ? "هل تريد تسجيل الخروج؟" : "Logout?")) signOut(auth).then(() => location.href="index.html");
                };

            } catch (e) { console.error("Error fetching user role", e); }
        } else {
            // إذا لم يسجل دخول
            authZone.innerHTML = `
                <a href="login.html" class="nav-item">${isAr ? 'دخول' : 'Login'}</a>
            `;
        }
    });
}

function initLayoutEvents() {
    // تفعيل اللغة
    document.getElementById('langBtn').onclick = () => {
        const current = localStorage.getItem('preferred_lang') || 'ar';
        localStorage.setItem('preferred_lang', current === 'ar' ? 'en' : 'ar');
        window.location.reload();
    };

    // تفعيل الثيم
    const themeBtn = document.getElementById('themeBtn');
    const applyTheme = (theme) => {
        document.body.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
        themeBtn.innerText = theme === 'dark' ? '☀️' : '🌙';
    };
    applyTheme(localStorage.getItem('theme') || 'light');
    themeBtn.onclick = () => {
        const nt = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', nt);
        applyTheme(nt);
    };
}