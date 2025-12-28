const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(__dirname, 'articles', 'content');
const METADATA_FILE = path.join(__dirname, 'articles-metadata.json');
const OUTPUT_FILE = path.join(__dirname, 'articles.html');

// カテゴリー名マッピング
const categoryMap = {
  '技術・開発': 'tech',
  'キャリア・資格': 'career',
  'データサイエンス': 'datascience',
  '雑記': 'misc'
};

// 日付フォーマット関数
function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 全記事を取得
async function getAllArticles() {
  const articles = [];

  // 既存HTML記事のメタデータを読み込み
  if (fs.existsSync(METADATA_FILE)) {
    const existingArticles = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
    articles.push(...existingArticles.map(article => ({
      ...article,
      isMarkdown: false
    })));
  }

  // Markdown記事を読み込み
  if (fs.existsSync(CONTENT_DIR)) {
    const mdFiles = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));

    for (const file of mdFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContent);

      const htmlFilename = file.replace('.md', '.html');
      const categorySlug = categoryMap[data.category] || 'misc';

      articles.push({
        title: data.title,
        date: new Date(data.date).toISOString().split('T')[0],
        category: data.category,
        description: data.description,
        filename: htmlFilename,
        thumbnail: data.thumbnail || `../images/${categorySlug}-default.svg`,
        isMarkdown: true
      });
    }
  }

  // 日付順でソート（新しい順）
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  return articles;
}

// カテゴリー別に記事を分類
function groupByCategory(articles) {
  return {
    tech: articles.filter(a => a.category === '技術・開発'),
    career: articles.filter(a => a.category === 'キャリア・資格'),
    datascience: articles.filter(a => a.category === 'データサイエンス'),
    misc: articles.filter(a => a.category === '雑記')
  };
}

// 記事カードHTML生成
function generateArticleCard(article) {
  const formattedDate = formatDate(article.date);
  const categorySlug = categoryMap[article.category] || 'misc';

  return `                <article class="article-card-grid">
                    <a href="articles/${article.filename}" style="text-decoration: none; color: inherit; display: block;">
                        <div class="article-thumbnail">
                            <img src="${article.thumbnail}" alt="${article.title}">
                        </div>
                        <div class="article-card-content">
                            <div class="article-meta">
                                <span class="article-category">${article.category}</span>
                                <time datetime="${article.date}">${formattedDate}</time>
                            </div>
                            <h3 class="article-title">${article.title}</h3>
                            <p class="article-excerpt">${article.description}</p>
                            <span class="read-more">続きを読む →</span>
                        </div>
                    </a>
                </article>`;
}

// articles.html生成
async function generateArticlesPage() {
  const articles = await getAllArticles();
  const grouped = groupByCategory(articles);

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="MechaToraのブログ記事一覧。技術・開発、キャリア・資格、データサイエンス、雑記など幅広いトピックを発信中。">
    <meta name="keywords" content="ブログ,技術記事,プログラミング,社労士,データサイエンス">
    <title>記事一覧 | MechaToraのブログ</title>
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="styles.css">
    <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <a href="index.html" class="logo">
                    <span>🐱</span>
                    <span>MechaToraのブログ</span>
                </a>
                <nav>
                    <ul>
                        <li><a href="index.html">ホーム</a></li>
                        <li><a href="articles.html">記事一覧</a></li>
                        <li><a href="about.html">運営者情報</a></li>
                        <li><a href="contact.html">お問い合わせ</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <main>
        <div class="container">
            <h1 class="section-title">📝 記事一覧</h1>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 3rem;">
                全${articles.length}記事を公開中
            </p>

            <!-- 技術・開発 -->
            <section id="tech" style="margin-bottom: 4rem;">
                <h2 class="section-title">💻 技術・開発 (${grouped.tech.length}記事)</h2>
                <div class="articles-grid">
${grouped.tech.map(generateArticleCard).join('\n')}
                </div>
            </section>

            <!-- キャリア・資格 -->
            <section id="career" style="margin-bottom: 4rem;">
                <h2 class="section-title">👔 キャリア・資格 (${grouped.career.length}記事)</h2>
                <div class="articles-grid">
${grouped.career.map(generateArticleCard).join('\n')}
                </div>
            </section>

            <!-- データサイエンス -->
            <section id="datascience" style="margin-bottom: 4rem;">
                <h2 class="section-title">📊 データサイエンス (${grouped.datascience.length}記事)</h2>
                <div class="articles-grid">
${grouped.datascience.map(generateArticleCard).join('\n')}
                </div>
            </section>

            <!-- 雑記 -->
            ${grouped.misc.length > 0 ? `
            <section id="misc" style="margin-bottom: 4rem;">
                <h2 class="section-title">📝 雑記 (${grouped.misc.length}記事)</h2>
                <div class="articles-grid">
${grouped.misc.map(generateArticleCard).join('\n')}
                </div>
            </section>
            ` : ''}
        </div>
    </main>

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
                        <li><a href="articles.html#tech">技術・開発</a></li>
                        <li><a href="articles.html#career">キャリア・資格</a></li>
                        <li><a href="articles.html#datascience">データサイエンス</a></li>
                        <li><a href="articles.html#misc">雑記</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>サイト情報</h3>
                    <ul>
                        <li><a href="about.html">運営者情報</a></li>
                        <li><a href="privacy.html">プライバシーポリシー</a></li>
                        <li><a href="contact.html">お問い合わせ</a></li>
                        <li><a href="https://mechatora.com" target="_blank" rel="noopener">MechaTora（開発ツール）</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 MechaTora. All rights reserved.</p>
            </div>
        </div>
    </footer>
    <script src="cookie-banner.js"></script>
</body>
</html>`;

  fs.writeFileSync(OUTPUT_FILE, html, 'utf-8');
  console.log(`✓ articles.html を生成しました (${articles.length}記事)`);
}

// index.htmlの最新記事セクション生成
function generateLatestArticleCard(article, index) {
  const formattedDate = formatDate(article.date);
  const excerpt = article.description.substring(0, 150) + '...';

  return `                <!-- 記事カード${index + 1} -->
                <article class="article-card">
                    <div class="article-meta">
                        <span class="article-category">${article.category}</span>
                        <time datetime="${article.date}">${formattedDate}</time>
                    </div>
                    <h3 class="article-title">
                        <a href="articles/${article.filename}">${article.title}</a>
                    </h3>
                    <p class="article-excerpt">
                        ${excerpt}
                    </p>
                    <a href="articles/${article.filename}" class="read-more">続きを読む →</a>
                </article>`;
}

async function updateIndexPage() {
  const articles = await getAllArticles();
  const latestArticles = articles.slice(0, 5);

  const indexPath = path.join(__dirname, 'index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf-8');

  // 最新記事セクションを生成
  const latestArticlesHTML = latestArticles.map(generateLatestArticleCard).join('\n\n');

  // index.htmlの最新記事セクションを置き換え
  const sectionStart = '            <!-- 最新記事セクション -->';
  const sectionEnd = '            <!-- カテゴリーセクション -->';

  const startIndex = indexContent.indexOf(sectionStart);
  const endIndex = indexContent.indexOf(sectionEnd);

  if (startIndex !== -1 && endIndex !== -1) {
    const newSection = `            <!-- 最新記事セクション -->
            <section>
                <h2 class="section-title">📝 最新記事</h2>

${latestArticlesHTML}

            </section>

            `;

    indexContent = indexContent.substring(0, startIndex) + newSection + indexContent.substring(endIndex);
    fs.writeFileSync(indexPath, indexContent, 'utf-8');
    console.log(`✓ index.html を更新しました (最新${latestArticles.length}記事)`);
  } else {
    console.log('⚠ index.htmlの最新記事セクションが見つかりませんでした');
  }
}

async function main() {
  await generateArticlesPage();
  await updateIndexPage();
}

main().catch(console.error);
