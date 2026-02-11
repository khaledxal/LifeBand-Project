

// يمكنك أيضاً إضافة دالة للفوتر هنا بنفس الطريقة
// js/layout.js
export function injectLayout() {
    const lang = localStorage.getItem('preferred_lang') || 'ar';
    const isAr = lang === 'ar';

    // 1. الهيدر (Navbar)
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
            <span id="auth-zone"></span>
            <button id="langBtn" class="lang-toggle">${isAr ? 'EN' : 'AR'}</button>
            <button id="themeBtn" class="theme-toggle">🌙</button>
        </div>
    </header>`;

    // 2. الفوتر (Footer)
    const footerHTML = `
    <footer style="margin-top: 50px; padding: 40px 20px; background: var(--glass); border-radius: 40px 40px 0 0;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px;">
            <div>
                <h3 style="color: var(--primary); margin-bottom: 15px;">LifeBand</h3>
                <p style="font-size: 14px; opacity: 0.8; line-height: 1.6;">
                    ${isAr ? 'نظام صحي مبتكر لتعزيز الأمان الطبي والارتقاء بجودة الحياة.' : 'An innovative health system to enhance medical safety and quality of life.'}
                </p>
            </div>
            <div>
                <h3 style="color: var(--primary); margin-bottom: 15px;">${isAr ? 'خدمة الطوارئ' : 'Emergency Service'}</h3>
                <p style="font-size: 14px; line-height: 1.6;">${isAr ? 'نعمل على مدار 24 ساعة طوال أيام الأسبوع.' : 'We work 24/7 to provide high-quality services.'}</p>
                <p style="margin-top: 10px; font-weight: bold;">📞 911 | 🏥 92002656</p>
            </div>
        </div>
        <div style="text-align: center; margin-top: 40px; opacity: 0.5; font-size: 0.8rem; border-top: 1px solid var(--glass-border); padding-top: 20px;">
            © 2026 ${isAr ? 'جميع الحقوق محفوظة لمشروع LifeBand.' : 'All rights reserved to LifeBand project.'}
        </div>
    </footer>`;

    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', headerHTML); // وضع الهيدر في البداية
        container.insertAdjacentHTML('beforeend', footerHTML);  // وضع الفوتر في النهاية
    }
}