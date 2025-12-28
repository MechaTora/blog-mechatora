const fs = require('fs-extra');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, 'articles');
const OUTPUT_FILE = path.join(__dirname, 'articles-metadata.json');

// HTMLファイルからメタデータを抽出
function extractMetadata(htmlContent, filename) {
  // タイトル抽出（記事本文内のh1を取得、ヘッダーのロゴは除外）
  const articleSection = htmlContent.split('<article>')[1] || htmlContent;
  const titleMatch = articleSection.match(/<h1>(.*?)<\/h1>/);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : filename.replace('.html', '');

  // 日付抽出
  const dateMatch = htmlContent.match(/<time datetime="([\d-]+)">/);
  const date = dateMatch ? dateMatch[1] : '2025-01-01';

  // カテゴリ抽出
  const categoryMatch = htmlContent.match(/<span class="article-category">(.*?)<\/span>/);
  const category = categoryMatch ? categoryMatch[1] : '技術・開発';

  // 説明抽出（metaタグから）
  const descMatch = htmlContent.match(/<meta name="description" content="(.*?)"/);
  const description = descMatch ? descMatch[1] : '';

  // サムネイル抽出
  const thumbnailMatch = htmlContent.match(/<img src="(\.\.\/images\/.*?)" alt=/);
  const thumbnail = thumbnailMatch ? thumbnailMatch[1] : '../images/tech-default.svg';

  return {
    title,
    date,
    category,
    description,
    filename,
    thumbnail
  };
}

// すべてのHTMLファイルを処理
function extractAllMetadata() {
  const htmlFiles = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.html'));
  const metadata = [];

  for (const file of htmlFiles) {
    const filePath = path.join(ARTICLES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const meta = extractMetadata(content, file);
    metadata.push(meta);
  }

  // 日付順でソート
  metadata.sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`✓ ${metadata.length}記事のメタデータを抽出しました`);
}

extractAllMetadata();
