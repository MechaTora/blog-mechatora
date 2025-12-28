---
title: 日本酒データベースサイト開発秘話｜全国の地酒を一元管理する技術
date: 2025-12-27T10:00:00+09:00
category: 技術・開発
description: 47都道府県の日本酒データを収録したデータベースサイトの開発プロセスを詳しく解説。データ収集、DB設計、検索機能の実装まで、個人開発の全貌を公開します。
keywords: 日本酒,データベース,Web開発,個人開発,JavaScript,検索機能,データ収集,スクレイピング
---

## はじめに：「あの日本酒、どこの酒蔵？」という疑問から

「この日本酒、美味しいな。どこで造られているんだろう？」

居酒屋で地酒を飲むたびに、そんな疑問を抱いていました。スマホで調べても、情報がバラバラ。公式サイトがない酒蔵も多く、詳細な情報にたどり着くのに苦労します。

「だったら、全国の日本酒を一元管理できるデータベースを作ろう」

そう思い立ったのが、このプロジェクトの始まりでした。

**完成したサイト**: [日本酒データベース](https://sake-nihonshu.mechatora.com)
**参考記事**: [Note記事](https://note.com/crt03/n/n21ae5129e98f)も合わせてご覧ください。

## プロジェクト概要

### 作ったもの

**日本酒データベースサイト**
- 47都道府県の地酒データを収録
- 都道府県別の検索機能
- 銘柄名・酒蔵名・精米歩合・アルコール度数などの詳細情報
- レスポンシブ対応（スマホでも快適）

### 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript（Vanilla JS）
- **データ収集**: Python（BeautifulSoup, Requests）
- **データ形式**: JSON
- **ホスティング**: GitHub Pages
- **ドメイン**: お名前.com（サブドメイン設定）

### 開発期間

- **Phase 1**: データ収集（2週間）
- **Phase 2**: DB設計（3日）
- **Phase 3**: フロントエンド開発（1週間）
- **Phase 4**: デバッグ・公開（3日）

**合計: 約3週間**

## Phase 1: データ収集の苦労

### 最初の壁：データがない

日本酒のデータベースを作ろうとして、最初にぶつかった壁が「データがない」ということでした。

**想定していたこと**:
- どこかに日本酒の一覧データがある
- APIで取得できる
- CSVでダウンロードできる

**現実**:
- 統一されたデータベースは存在しない
- 各酒蔵のWebサイトに情報が散在
- サイトがない酒蔵も多数

### データ収集戦略

結局、以下の方法でデータを集めました：

#### 方法1: 公的機関のWebサイトからスクレイピング

```python
import requests
from bs4 import BeautifulSoup
import json

# 日本酒の銘柄情報を取得
def scrape_sake_info(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    sake_list = []
    # テーブルから情報を抽出
    for row in soup.find_all('tr'):
        cells = row.find_all('td')
        if len(cells) >= 4:
            sake = {
                '銘柄名': cells[0].text.strip(),
                '酒蔵名': cells[1].text.strip(),
                '所在地': cells[2].text.strip(),
                '種類': cells[3].text.strip()
            }
            sake_list.append(sake)

    return sake_list
```

#### 方法2: 酒造組合のリストを参照

各都道府県の酒造組合が公開している酒蔵リストを手動で収集。

#### 方法3: 手動入力

どうしても自動取得できない情報（精米歩合、アルコール度数など）は、個別に調査して手動入力。

### データ収集で学んだこと

1. **完璧を求めない**: 100%のデータを集めるのは不可能。70%でリリース。
2. **段階的に拡充**: 最初は主要銘柄のみ。徐々に追加。
3. **ユーザーからのフィードバック**: 公開後に修正依頼を受け付ける仕組み。

### 収集したデータ量

- **酒蔵数**: 約1,200蔵
- **銘柄数**: 約3,500銘柄
- **データ項目**: 銘柄名、酒蔵名、都道府県、住所、種類、精米歩合、アルコール度数、特徴

## Phase 2: データベース設計

### JSON形式を採用した理由

最初はMySQLなどのRDBMSを検討しましたが、以下の理由でJSON形式を採用：

**JSON形式のメリット**:
- サーバー不要（静的サイトで完結）
- 軽量（ファイルサイズが小さい）
- JavaScriptから直接読み込める
- 無料ホスティング（GitHub Pages）で運用可能

**デメリット**:
- 大量データには不向き（数万件以上）
- 複雑な検索は苦手

今回は3,500銘柄程度なので、JSON形式で十分でした。

### データ構造の設計

```json
{
  "北海道": [
    {
      "id": "hokkaido-001",
      "銘柄名": "国士無双",
      "酒蔵名": "高砂酒造",
      "住所": "旭川市宮下通17丁目",
      "種類": "純米大吟醸",
      "精米歩合": "40%",
      "アルコール度数": "16度",
      "特徴": "淡麗辛口、フルーティーな香り"
    },
    ...
  ],
  "青森県": [...],
  ...
}
```

### 正規化の工夫

**問題**: 同じ酒蔵が複数の銘柄を持つ場合、データが重複する

**解決策**: 酒蔵情報と銘柄情報を分離

```json
{
  "brewery": {
    "hokkaido-takasago": {
      "name": "高砂酒造",
      "address": "旭川市宮下通17丁目",
      "established": "1899年",
      "website": "https://..."
    }
  },
  "sake": {
    "hokkaido-001": {
      "name": "国士無双",
      "brewery_id": "hokkaido-takasago",
      "type": "純米大吟醸",
      "rice_polishing": "40%",
      "alcohol": "16%"
    }
  }
}
```

これにより、データサイズが**約30%削減**できました。

## Phase 3: フロントエンド開発

### 検索機能の実装

最も重要な機能が「検索」です。以下の検索方法を実装：

#### 1. 都道府県別検索

```javascript
function filterByPrefecture(prefecture) {
  const sakeList = sakeData[prefecture];
  displayResults(sakeList);
}
```

#### 2. キーワード検索

```javascript
function searchByKeyword(keyword) {
  const results = [];

  for (const prefecture in sakeData) {
    sakeData[prefecture].forEach(sake => {
      if (
        sake.銘柄名.includes(keyword) ||
        sake.酒蔵名.includes(keyword) ||
        sake.特徴.includes(keyword)
      ) {
        results.push(sake);
      }
    });
  }

  displayResults(results);
}
```

#### 3. フィルター機能

- 種類（純米、吟醸、大吟醸など）
- 精米歩合（50%以下、50〜60%など）
- アルコール度数（15度以下、15〜17度など）

```javascript
function filterResults(filters) {
  let results = getAllSake();

  if (filters.type) {
    results = results.filter(s => s.種類 === filters.type);
  }

  if (filters.polishing) {
    results = results.filter(s => {
      const polishing = parseInt(s.精米歩合);
      return polishing <= filters.polishing;
    });
  }

  displayResults(results);
}
```

### パフォーマンス最適化

3,500件のデータを扱うため、パフォーマンスが課題でした。

#### 最適化1: 遅延読み込み

```javascript
// 最初は100件だけ表示
let displayedCount = 100;

function loadMore() {
  displayedCount += 100;
  renderResults(results.slice(0, displayedCount));
}

// スクロール時に自動読み込み
window.addEventListener('scroll', () => {
  if (isNearBottom()) {
    loadMore();
  }
});
```

#### 最適化2: デバウンス処理

```javascript
// 検索入力のデバウンス（連続入力時の負荷軽減）
let searchTimeout;

searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchByKeyword(e.target.value);
  }, 300);
});
```

これにより、検索のレスポンスが**劇的に改善**しました。

### UI/UXの工夫

#### 1. カード型デザイン

各銘柄をカード形式で表示。視覚的に見やすい。

```html
<div class="sake-card">
  <h3 class="sake-name">国士無双</h3>
  <p class="brewery-name">高砂酒造</p>
  <div class="sake-details">
    <span class="tag">純米大吟醸</span>
    <span class="tag">精米歩合40%</span>
  </div>
  <p class="sake-description">淡麗辛口、フルーティーな香り</p>
</div>
```

#### 2. 都道府県マップ

日本地図をクリックすると、その都道府県の日本酒が表示される。

```javascript
const prefectureMap = document.querySelector('.japan-map');

prefectureMap.addEventListener('click', (e) => {
  const prefecture = e.target.dataset.prefecture;
  if (prefecture) {
    filterByPrefecture(prefecture);
    highlightPrefecture(prefecture);
  }
});
```

#### 3. レスポンシブ対応

スマホでの利用を想定し、完全レスポンシブ化。

```css
@media (max-width: 768px) {
  .sake-grid {
    grid-template-columns: 1fr;
  }

  .sake-card {
    width: 100%;
  }
}
```

## Phase 4: デバッグと公開

### デバッグで見つかった問題

#### 問題1: 検索結果が0件になる

**原因**: 全角・半角の違い

**解決**:
```javascript
function normalizeText(text) {
  return text
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s =>
      String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    )
    .toLowerCase();
}
```

#### 問題2: 表示が遅い

**原因**: 全データを一度にレンダリング

**解決**: 仮想スクロール実装（前述の遅延読み込み）

### 公開後の反応

**Twitter（X）での反応**:
- 「これ便利！」
- 「旅行先の日本酒探しに使える」
- 「データ間違ってるよ」（修正依頼）

**アクセス数**:
- 公開1週間: 500PV
- 公開1ヶ月: 3,000PV
- 公開3ヶ月: 10,000PV

## 技術的な学び

### 1. データが全て

どんなに優れたUIでも、データが貧弱では価値がない。**データ収集に最も時間をかけるべき**。

### 2. 完璧主義は敵

70%の完成度でリリースし、ユーザーのフィードバックで改善する方が早い。

### 3. パフォーマンスは重要

3,500件のデータでも、最適化しないと遅い。ユーザー体験を損なわない工夫が必須。

### 4. 静的サイトの可能性

サーバーレスでも、十分に高機能なWebアプリが作れる。コストを抑えられるメリットは大きい。

## 今後の展望

### 追加予定の機能

1. **ユーザー登録**: お気に入り機能、レビュー投稿
2. **AI推薦**: 好みに合った日本酒をレコメンド
3. **購入リンク**: Amazonや楽天へのリンク
4. **イベント情報**: 酒蔵イベント、試飲会の情報

### データ拡充

- 現在3,500銘柄 → 目標10,000銘柄
- ユーザーからの情報提供機能
- クラウドソーシングでデータ収集

## まとめ

日本酒データベースサイトの開発を通じて、以下を学びました：

1. **データ収集の重要性**: 良質なデータがサービスの価値を決める
2. **シンプルな技術選択**: 複雑な技術は不要。Vanilla JSで十分
3. **ユーザー視点**: 自分が欲しいものを作る
4. **継続的改善**: リリースしてからが本番

個人開発は楽しい。自分の「あったらいいな」を形にできる喜びは、何物にも代えがたいものです。

## 関連記事

- [CookSuggestアプリ開発秘話｜1000レシピDBをどう構築したか](/articles/cook-suggest-development.html)
- [完全無料でWebアプリを公開する方法](/articles/free-webapp-guide.html)
- [GitHub Pagesで無料サイト公開](/articles/github-pages-guide.html)

**参考**: この記事は筆者の[Note記事](https://note.com/crt03/n/n21ae5129e98f)を基に、技術的な詳細を追加したものです。

**完成したサイト**: [日本酒データベース](https://sake-nihonshu.mechatora.com)
