const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(__dirname, 'articles', 'content');
const METADATA_FILE = path.join(__dirname, 'articles-metadata.json');
const OUTPUT_FILE = path.join(__dirname, 'sitemap.xml');
const BASE_URL = 'https://blog.mechatora.com';

// 全記事を取得
function getAllArticles() {
  const articles = [];

  // 既存HTML記事のメタデータ
  if (fs.existsSync(METADATA_FILE)) {
    const existingArticles = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
    articles.push(...existingArticles);
  }

  // Markdown記事
  if (fs.existsSync(CONTENT_DIR)) {
    const mdFiles = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));

    for (const file of mdFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContent);

      const htmlFilename = file.replace('.md', '.html');
      articles.push({
        filename: htmlFilename,
        date: new Date(data.date).toISOString().split('T')[0]
      });
    }
  }

  return articles;
}

// sitemap.xml生成
function generateSitemap() {
  const articles = getAllArticles();
  const today = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

    <!-- メインページ -->
    <url>
        <loc>${BASE_URL}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>

    <!-- 記事一覧 -->
    <url>
        <loc>${BASE_URL}/articles.html</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>

    <!-- 運営者情報 -->
    <url>
        <loc>${BASE_URL}/about.html</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>

    <!-- お問い合わせ -->
    <url>
        <loc>${BASE_URL}/contact.html</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>

    <!-- プライバシーポリシー -->
    <url>
        <loc>${BASE_URL}/privacy.html</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>

`;

  // 記事を日付順でソート
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 各記事のURL
  for (const article of articles) {
    sitemap += `    <!-- 記事 -->
    <url>
        <loc>${BASE_URL}/articles/${article.filename}</loc>
        <lastmod>${article.date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>

`;
  }

  sitemap += `</urlset>`;

  fs.writeFileSync(OUTPUT_FILE, sitemap, 'utf-8');
  console.log(`✓ sitemap.xml を生成しました (${articles.length + 5}ページ)`);
}

generateSitemap();
