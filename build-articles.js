const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const CONTENT_DIR = path.join(__dirname, 'articles', 'content');
const OUTPUT_DIR = path.join(__dirname, 'articles');

// カテゴリー名マッピング
const categoryMap = {
  '技術・開発': 'tech',
  'キャリア・資格': 'career',
  'データサイエンス': 'datascience',
  '雑記': 'misc'
};

// カテゴリー別のデフォルト画像
const categoryImages = {
  '技術・開発': '../images/tech-default.svg',
  'キャリア・資格': '../images/career-default.svg',
  'データサイエンス': '../images/datascience-default.svg',
  '雑記': '../images/misc-default.svg'
};

// 日付フォーマット関数
function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// HTMLテンプレート生成関数
function generateHTML(data, content, filename) {
  const { title, date, category, description, keywords, thumbnail } = data;
  const slug = filename.replace('.md', '');
  const htmlFilename = `${slug}.html`;
  const formattedDate = formatDate(date);
  const isoDate = new Date(date).toISOString().split('T')[0];
  const categorySlug = categoryMap[category] || 'misc';
  const heroImage = thumbnail || categoryImages[category] || '../images/misc-default.svg';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <title>${title} | MechaToraのブログ</title>
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../styles.css">

    <!-- 構造化データ -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${title}",
        "description": "${description}",
        "author": {
            "@type": "Person",
            "name": "MechaTora"
        },
        "datePublished": "${isoDate}",
        "dateModified": "${isoDate}"
    }
    </script>

    <!-- Google Analytics (準備完了 - GA4測定IDを設定してください) -->
    <!-- <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    </script> -->

    <!-- パンくずリスト構造化データ -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "ホーム",
                "item": "https://blog.mechatora.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "記事一覧",
                "item": "https://blog.mechatora.com/articles.html"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "${title}",
                "item": "https://blog.mechatora.com/articles/${htmlFilename}"
            }
        ]
    }
    </script>
</head>
<body>
    <!-- ヘッダー -->
    <header>
        <div class="container">
            <div class="header-content">
                <a href="../index.html" class="logo">
                    <span>🐱</span>
                    <span>MechaToraのブログ</span>
                </a>
                <nav>
                    <ul>
                        <li><a href="../index.html">ホーム</a></li>
                        <li><a href="../articles.html">記事一覧</a></li>
                        <li><a href="../about.html">運営者情報</a></li>
                        <li><a href="../contact.html">お問い合わせ</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <!-- パンくずリスト -->
    <div class="container">
        <nav class="breadcrumb">
            <ul>
                <li><a href="../index.html">ホーム</a></li>
                <li><a href="../articles.html">記事一覧</a></li>
                <li><a href="../articles.html#${categorySlug}">${category}</a></li>
                <li>${title}</li>
            </ul>
        </nav>
    </div>

    <!-- メインコンテンツ -->
    <main>
        <div class="container">
            <div class="content-wrapper">
                <article>
                    <!-- 記事メタ情報 -->
                    <div class="article-meta" style="margin-bottom: 2rem;">
                        <span class="article-category">${category}</span>
                        <time datetime="${isoDate}">${formattedDate}</time>
                        <span style="margin-left: 1rem; color: var(--text-secondary);">更新日: ${formattedDate}</span>
                    </div>

                    <!-- 記事タイトル -->
                    <h1>${title}</h1>

                    <!-- 日付表示 -->
                    <div class="article-date" style="margin: 1.5rem 0; padding: 1rem; background: var(--bg-secondary); border-left: 4px solid var(--primary-color); font-size: 0.875rem; color: var(--text-secondary);">
                        <span style="margin-right: 1rem;">📅 公開日: ${formattedDate}</span>
                        <span>🔄 最終更新: ${formattedDate}</span>
                    </div>

                    <!-- ヒーロー画像 -->
                    <div class="article-hero" style="margin: 2rem 0; border-radius: 8px; overflow: hidden;">
                        <img src="${heroImage}" alt="${title}" style="width: 100%; height: auto; display: block;">
                    </div>

                    <!-- 本文 -->
                    ${content}

                    <!-- SNSシェアボタン -->
                    <div style="margin: 3rem 0; padding: 2rem; background: var(--bg-secondary); border-radius: 8px; text-align: center;">
                        <p style="font-weight: 500; margin-bottom: 1rem; color: var(--text-primary);">この記事をシェアする</p>
                        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                            <a href="https://twitter.com/intent/tweet?url=https://blog.mechatora.com/articles/${htmlFilename}&text=${encodeURIComponent(title)}" target="_blank" rel="noopener" style="display: inline-block; padding: 0.75rem 1.5rem; background: #1DA1F2; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
                                𝕏でシェア
                            </a>
                            <a href="https://www.facebook.com/sharer/sharer.php?u=https://blog.mechatora.com/articles/${htmlFilename}" target="_blank" rel="noopener" style="display: inline-block; padding: 0.75rem 1.5rem; background: #1877F2; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
                                Facebookでシェア
                            </a>
                            <a href="https://b.hatena.ne.jp/entry/https://blog.mechatora.com/articles/${htmlFilename}" target="_blank" rel="noopener" style="display: inline-block; padding: 0.75rem 1.5rem; background: #00A4DE; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
                                はてブに追加
                            </a>
                        </div>
                    </div>

                    <!-- 著者情報 -->
                    <div style="margin: 3rem 0; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
                        <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem;">✍️ この記事を書いた人</h3>
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <div style="font-size: 4rem;">🐱</div>
                            <div>
                                <p style="font-weight: 600; font-size: 1.125rem; margin: 0 0 0.5rem 0;">MechaTora</p>
                                <p style="margin: 0; opacity: 0.95; line-height: 1.6;">
                                    社会保険労務士 × Web開発エンジニア × データサイエンティスト。<br>
                                    人事労務の専門知識とプログラミングスキルを活かして、実務に役立つツールやコンテンツを開発・発信しています。
                                </p>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </main>

    <!-- フッター -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>MechaToraのブログ</h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">
                        社労士×エンジニアのMechaToraが運営する技術ブログです。
                    </p>
                </div>
                <div class="footer-section">
                    <h3>カテゴリー</h3>
                    <ul>
                        <li><a href="../articles.html#tech">技術・開発</a></li>
                        <li><a href="../articles.html#career">キャリア・資格</a></li>
                        <li><a href="../articles.html#datascience">データサイエンス</a></li>
                        <li><a href="../articles.html#misc">雑記</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>サイト情報</h3>
                    <ul>
                        <li><a href="../about.html">運営者情報</a></li>
                        <li><a href="../privacy.html">プライバシーポリシー</a></li>
                        <li><a href="../contact.html">お問い合わせ</a></li>
                        <li><a href="https://mechatora.com" target="_blank" rel="noopener">MechaTora（開発ツール）</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 MechaTora. All rights reserved.</p>
            </div>
        </div>
    </footer>
    <script src="../cookie-banner.js"></script>
</body>
</html>`;
}

// メイン処理
async function buildArticles() {
  try {
    // articles/content フォルダが存在するか確認
    if (!fs.existsSync(CONTENT_DIR)) {
      console.log('articles/content フォルダが存在しません。作成します...');
      fs.ensureDirSync(CONTENT_DIR);
      console.log('✓ articles/content フォルダを作成しました');
      return;
    }

    // .mdファイルを取得
    const files = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));

    if (files.length === 0) {
      console.log('変換する Markdown ファイルがありません');
      return;
    }

    console.log(`${files.length} 件のMarkdownファイルを変換します...\n`);

    for (const file of files) {
      const filePath = path.join(CONTENT_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      // Front Matterをパース
      const { data, content } = matter(fileContent);

      // MarkdownをHTMLに変換
      const htmlContent = md.render(content);

      // 完全なHTMLを生成
      const fullHTML = generateHTML(data, htmlContent, file);

      // HTMLファイルとして保存
      const outputFilename = file.replace('.md', '.html');
      const outputPath = path.join(OUTPUT_DIR, outputFilename);
      fs.writeFileSync(outputPath, fullHTML, 'utf-8');

      console.log(`✓ ${file} → ${outputFilename}`);
    }

    console.log(`\n完了！ ${files.length} 件の記事を生成しました`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

buildArticles();
