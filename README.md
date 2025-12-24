# MechaToraのブログ - セットアップガイド

## 📁 作成されたファイル

```
blog-mechatora/
├── index.html              # トップページ（最新記事5件表示）
├── articles.html           # 記事一覧ページ
├── about.html              # 運営者情報ページ
├── privacy.html            # プライバシーポリシー
├── contact.html            # お問い合わせページ
├── styles.css              # 共通スタイルシート
└── README.md               # このファイル
```

## ✅ 次にやること

### 1. Googleフォームの作成と埋め込み

contact.htmlにお問い合わせフォームを埋め込みます。

**手順:**
1. https://forms.google.com にアクセス
2. 新しいフォームを作成
3. 以下の質問項目を追加：
   - お名前（短文回答）
   - メールアドレス（短文回答）
   - お問い合わせ種別（選択式：質問/記事リクエスト/仕事の依頼/不具合報告/その他）
   - お問い合わせ内容（長文回答）
4. 「送信」→「<>」（埋め込み）からHTMLコードをコピー
5. contact.htmlの「<!-- Googleフォーム埋め込みエリア -->」部分に貼り付け

### 2. articlesフォルダの作成

記事を格納するフォルダを作成します。

```bash
mkdir articles
```

### 3. 既存11記事の移行

mechatora.com/blog.htmlから以下の記事を移行：

#### 優先度高（すでにindex.htmlで参照）
1. github-pages-guide.html
2. qualification-calendar-dev.html
3. cook-suggest-development.html
4. earthquake-monitor-tech.html
5. r-tidyverse-intro.html

#### その他
6. domain-registration.html
7. 30s-programming.html
8. free-webapp-guide.html
9. sharoushi-pass.html
10. claude-code-experience.html
11. hr-to-developer.html

### 4. 新規19記事の作成

以下のテーマで記事を作成（各2000文字以上）：

**ツール開発ストーリー系（8記事）**
- X投稿文ジェネレーター開発秘話
- フラッシュカード学習ツールの技術選定
- 社保ニュース整理サービスで学んだスクレイピング技術
- （その他開発中のツール5つ）

**技術チュートリアル系（6記事）**
- GitHub Actionsで自動デプロイ環境を作る
- PWA対応で学んだService Worker実装
- APIレート制限対策の実装パターン
- レスポンシブデザイン実装の基本
- JavaScriptでのエラーハンドリングベストプラクティス
- セキュリティ対策チェックリスト

**キャリア・学習系（5記事）**
- 社労士資格が今の業務に役立っている話
- 働きながら独学で学び続ける時間管理術
- 複数のスキルを持つことのメリット
- 技術書の効率的な読み方・選び方
- ポートフォリオサイトの作り方完全ガイド

### 5. サブドメインの設定

**GitHub Pages + カスタムドメインの設定:**

1. GitHubリポジトリ作成
   ```bash
   git init
   git add .
   git commit -m "Initial commit: blog.mechatora.com"
   ```

2. GitHub Pagesの有効化
   - リポジトリ Settings → Pages
   - Source: main branch
   - Custom domain: blog.mechatora.com

3. DNS設定（mechatora.comのDNS管理画面で）
   ```
   Type: CNAME
   Name: blog
   Value: [GitHubユーザー名].github.io
   ```

### 6. Google Analytics & AdSense準備

**Google Analytics:**
1. https://analytics.google.com でプロパティ作成
2. トラッキングコードを全ページの</head>直前に追加

**Google AdSense（記事30件到達後）:**
1. https://www.google.com/adsense で申請
2. 審査用コードを</head>直前に追加
3. 審査通過後、広告ユニット作成

## 🎨 デザインのカスタマイズ

styles.cssの`:root`セクションで色を変更できます：

```css
:root {
    --primary-color: #2563eb;  /* メインカラー */
    --primary-dark: #1e40af;
    --primary-light: #3b82f6;
}
```

## 📊 AdSense審査に向けたチェックリスト

- [x] 独自ドメイン（blog.mechatora.com）
- [x] プライバシーポリシーページ
- [x] 運営者情報ページ（詳細版）
- [x] お問い合わせページ
- [ ] 記事30件以上（各2000文字以上）
- [ ] Google Analytics設置
- [ ] 内部リンク切れチェック
- [ ] モバイル表示確認
- [ ] 全ページ表示確認（404エラーなし）

## 🚀 公開手順

1. 全ファイルをGitHubにプッシュ
2. GitHub Pagesで公開
3. blog.mechatora.com にアクセスして表示確認
4. Google Search Consoleにサイトマップ送信
5. 記事30件到達後、AdSense申請

## 💡 記事作成のコツ

### 成功するブログ記事の特徴
- **実体験ベース**: 自分が実際に経験したことを書く
- **具体性**: 抽象論ではなく、具体的な手順・数字を示す
- **問題解決**: 読者の悩みを解決する内容
- **オリジナリティ**: 自分にしか書けない視点・経験

### 記事構成のテンプレート
1. 導入（問題提起）
2. 解決策の提示
3. 具体的な手順・方法
4. 実例・結果
5. まとめ

### 文字数の目安
- 最低2000文字
- 理想は3000〜5000文字
- 無理に増やさず、価値ある内容を書く

## 📞 質問・不明点

このREADMEについて不明点があれば、遠慮なく聞いてください！
