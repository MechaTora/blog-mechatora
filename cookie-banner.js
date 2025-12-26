// Cookie同意バナー
(function() {
    // すでに同意済みかチェック
    if (localStorage.getItem('cookie-consent') === 'accepted') {
        return;
    }

    // バナーHTML
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; box-shadow: 0 -4px 6px rgba(0,0,0,0.1); z-index: 10000; animation: slideUp 0.3s ease-out;';

    banner.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px;">
                <p style="margin: 0; font-size: 0.875rem; line-height: 1.6;">
                    🍪 当サイトではCookieを使用して、サイトの利便性向上とアクセス解析を行っています。
                    <a href="privacy.html" style="color: white; text-decoration: underline;">プライバシーポリシー</a>
                </p>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button id="cookie-accept" style="padding: 0.75rem 2rem; background: white; color: #667eea; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; transition: transform 0.2s;">
                    同意する
                </button>
                <button id="cookie-decline" style="padding: 0.75rem 1.5rem; background: transparent; color: white; border: 2px solid white; border-radius: 6px; cursor: pointer; transition: opacity 0.2s;">
                    拒否
                </button>
            </div>
        </div>
    `;

    // アニメーション
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    // ページに追加
    document.body.appendChild(banner);

    // ボタンイベント
    document.getElementById('cookie-accept').addEventListener('click', function() {
        localStorage.setItem('cookie-consent', 'accepted');
        banner.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => banner.remove(), 300);
    });

    document.getElementById('cookie-decline').addEventListener('click', function() {
        localStorage.setItem('cookie-consent', 'declined');
        banner.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => banner.remove(), 300);
    });

    // ホバー効果
    document.getElementById('cookie-accept').addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.05)';
    });
    document.getElementById('cookie-accept').addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
})();
