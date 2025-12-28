const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(__dirname, 'articles', 'content');
const METADATA_FILE = path.join(__dirname, 'articles-metadata.json');
const OUTPUT_FILE = path.join(__dirname, 'feed.xml');
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
        title: data.title,
        filename: htmlFilename,
        description: data.description,
        date: new Date(data.date).toISOString().split('T')[0]
      });
    }
  }

  return articles;
}

// RSS 2.0フィード生成
function generateRSS() {
  const articles = getAllArticles();
  const now = new Date().toUTCString();

  // 最新20記事のみ
  const latestArticles = articles
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MechaToraのブログ</title>
    <link>${BASE_URL}/</link>
    <description>社労士×エンジニアのMechaToraが、Web開発・技術・キャリア・データサイエンスについて発信するブログ</description>
    <language>ja</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>

`;

  for (const article of latestArticles) {
    const articleDate = new Date(article.date).toUTCString();
    const articleUrl = `${BASE_URL}/articles/${article.filename}`;

    rss += `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid>${articleUrl}</guid>
      <description>${escapeXml(article.description)}</description>
      <pubDate>${articleDate}</pubDate>
    </item>

`;
  }

  rss += `  </channel>
</rss>`;

  fs.writeFileSync(OUTPUT_FILE, rss, 'utf-8');
  console.log(`✓ feed.xml を生成しました (最新${latestArticles.length}記事)`);
}

// XML特殊文字エスケープ
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

generateRSS();
