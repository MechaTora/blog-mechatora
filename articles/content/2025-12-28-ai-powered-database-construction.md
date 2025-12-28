---
title: AI活用でデータベース構築｜ChatGPT/Claude活用術と実践ノウハウ
date: 2025-12-28T11:00:00+09:00
category: 技術・開発
description: 生成AIを使ったデータベース構築の実践ガイド。ChatGPTとClaudeでデータ収集・整形・検証を自動化し、開発時間を10分の1に短縮した方法を詳しく解説します。
keywords: AI,ChatGPT,Claude,データベース,自動化,スクレイピング,データ整形,プロンプトエンジニアリング
---

## はじめに：AIがデータベース構築を変えた

「3,500件のデータを手作業で整形する...想像しただけで気が遠くなる」

日本酒データベースサイトを開発した際、最初はそう思っていました。しかし、ChatGPTとClaudeを活用することで、**作業時間を10分の1以下**に短縮できました。

この記事では、生成AIを使ったデータベース構築の実践ノウハウを、実際のプロジェクトを基に詳しく解説します。

## AIでできること・できないこと

### AIが得意なこと

1. **データの整形・変換**
   - CSV → JSON変換
   - 表形式データの構造化
   - 不揃いなデータの正規化

2. **スクリプト生成**
   - Pythonスクレイピングコード
   - データクレンジングスクリプト
   - バリデーションコード

3. **パターン認識**
   - データの異常値検出
   - 重複データの発見
   - カテゴリ分類

### AIが苦手なこと

1. **最新情報の取得**
   - リアルタイムデータの取得
   - Webサイトの最新情報

2. **大量データの一括処理**
   - 10,000件以上のデータ
   - 複雑な依存関係のあるデータ

3. **判断を伴う作業**
   - データの信頼性評価
   - ビジネスロジックの決定

## 実践1: データ収集の自動化

### ChatGPTでスクレイピングコード生成

**プロンプト例**:
```
Pythonで以下のWebサイトから日本酒の情報を取得するスクレイピングコードを書いてください：

URL: [対象サイトのURL]
取得したい情報:
- 銘柄名
- 酒蔵名
- 都道府県
- アルコール度数

BeautifulSoupを使用し、エラーハンドリングも含めてください。
```

**生成されたコード**:
```python
import requests
from bs4 import BeautifulSoup
import json
import time

def scrape_sake_data(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')
        sake_list = []

        # テーブルから情報を抽出
        table = soup.find('table', class_='sake-table')
        if not table:
            print(f"テーブルが見つかりません: {url}")
            return []

        rows = table.find_all('tr')[1:]  # ヘッダー行をスキップ

        for row in rows:
            cells = row.find_all('td')
            if len(cells) >= 4:
                sake = {
                    '銘柄名': cells[0].text.strip(),
                    '酒蔵名': cells[1].text.strip(),
                    '都道府県': cells[2].text.strip(),
                    'アルコール度数': cells[3].text.strip()
                }
                sake_list.append(sake)

        return sake_list

    except requests.exceptions.RequestException as e:
        print(f"エラー: {url} - {e}")
        return []
    except Exception as e:
        print(f"予期しないエラー: {e}")
        return []

# 実行例
urls = [
    'https://example.com/sake/hokkaido',
    'https://example.com/sake/aomori',
    # ... 47都道府県分
]

all_sake = []
for url in urls:
    print(f"取得中: {url}")
    data = scrape_sake_data(url)
    all_sake.extend(data)
    time.sleep(1)  # サーバー負荷軽減

# JSONとして保存
with open('sake_data.json', 'w', encoding='utf-8') as f:
    json.dump(all_sake, ensure_ascii=False, indent=2, f)

print(f"完了: {len(all_sake)}件のデータを取得")
```

**このコードの優れた点**:
- エラーハンドリング完備
- User-Agent設定（ブロック対策）
- サーバー負荷軽減（sleep）
- 日本語対応（ensure_ascii=False）

### Claudeでデータ検証コード生成

スクレイピングしたデータの品質チェックもAIに任せます。

**プロンプト例**:
```
以下のJSON形式の日本酒データに対して、データ品質をチェックするPythonコードを書いてください：

チェック項目:
1. 必須フィールド（銘柄名、酒蔵名）が空でないか
2. アルコール度数が数値として妥当か（5-20度）
3. 重複データがないか
4. 都道府県名が正しいか（47都道府県）

問題があるデータはエラーレポートとして出力してください。
```

**生成されたコード**:
```python
import json
from typing import List, Dict

VALID_PREFECTURES = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    # ... 全47都道府県
]

def validate_sake_data(data: List[Dict]) -> Dict:
    """日本酒データを検証する"""
    errors = {
        'missing_fields': [],
        'invalid_alcohol': [],
        'duplicates': [],
        'invalid_prefecture': []
    }

    seen = set()

    for i, sake in enumerate(data):
        # 必須フィールドチェック
        if not sake.get('銘柄名') or not sake.get('酒蔵名'):
            errors['missing_fields'].append({
                'index': i,
                'data': sake
            })

        # アルコール度数チェック
        alcohol = sake.get('アルコール度数', '')
        try:
            alcohol_num = float(alcohol.replace('度', '').replace('%', ''))
            if not (5 <= alcohol_num <= 20):
                errors['invalid_alcohol'].append({
                    'index': i,
                    'value': alcohol,
                    'data': sake
                })
        except (ValueError, AttributeError):
            errors['invalid_alcohol'].append({
                'index': i,
                'value': alcohol,
                'data': sake
            })

        # 重複チェック
        key = f"{sake.get('銘柄名')}_{sake.get('酒蔵名')}"
        if key in seen:
            errors['duplicates'].append({
                'index': i,
                'key': key,
                'data': sake
            })
        seen.add(key)

        # 都道府県チェック
        prefecture = sake.get('都道府県')
        if prefecture not in VALID_PREFECTURES:
            errors['invalid_prefecture'].append({
                'index': i,
                'value': prefecture,
                'data': sake
            })

    return errors

# 実行例
with open('sake_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

errors = validate_sake_data(data)

# エラーレポート出力
print("=== データ検証レポート ===")
print(f"総データ数: {len(data)}件")
print(f"必須フィールド欠損: {len(errors['missing_fields'])}件")
print(f"不正なアルコール度数: {len(errors['invalid_alcohol'])}件")
print(f"重複データ: {len(errors['duplicates'])}件")
print(f"不正な都道府県名: {len(errors['invalid_prefecture'])}件")

# 詳細をファイルに出力
with open('error_report.json', 'w', encoding='utf-8') as f:
    json.dump(errors, f, ensure_ascii=False, indent=2)
```

## 実践2: データ整形の自動化

### 不揃いなデータの正規化

実際にスクレイピングしたデータは、こんな感じでバラバラでした：

```json
[
  {"銘柄": "国士無双", "度数": "16度"},
  {"name": "田酒", "alcohol": "16%"},
  {"銘柄名": "八海山", "アルコール": "15.5"}
]
```

**ChatGPTへのプロンプト**:
```
以下のJSONデータを統一フォーマットに変換してください：

統一フォーマット:
{
  "銘柄名": "string",
  "アルコール度数": "数値（単位なし）"
}

入力データ:
[JSONデータ]

変換ルール:
- キー名を統一
- 数値から単位（度、%）を削除
- 数値型に変換
```

**AIが生成した変換コード**:
```python
def normalize_sake_data(raw_data):
    """不揃いなデータを統一フォーマットに変換"""
    normalized = []

    for item in raw_data:
        sake = {}

        # 銘柄名の正規化
        sake['銘柄名'] = (
            item.get('銘柄名') or
            item.get('銘柄') or
            item.get('name') or
            ''
        )

        # アルコール度数の正規化
        alcohol_raw = (
            item.get('アルコール度数') or
            item.get('度数') or
            item.get('alcohol') or
            item.get('アルコール') or
            '0'
        )

        # 数値抽出
        alcohol_clean = alcohol_raw.replace('度', '').replace('%', '').strip()
        try:
            sake['アルコール度数'] = float(alcohol_clean)
        except ValueError:
            sake['アルコール度数'] = None

        normalized.append(sake)

    return normalized
```

**Before**（3,500件を手作業で整形）: 推定50時間
**After**（AIで自動変換）: 30分

**時間短縮率: 99%**

## 実践3: プロンプトエンジニアリングのコツ

### コツ1: 具体例を示す

**❌ 悪い例**:
```
データを整形してください
```

**✅ 良い例**:
```
以下のデータを整形してください：

入力例:
{"name": "国士無双", "deg": "16度"}

期待される出力:
{"銘柄名": "国士無双", "アルコール度数": 16}

変換ルール:
- nameキーを銘柄名に変更
- degキーをアルコール度数に変更し、数値のみ抽出
```

### コツ2: エラーハンドリングを指示

**プロンプト例**:
```
スクレイピングコードを生成してください。

必須要件:
- try-exceptでエラーハンドリング
- タイムアウト設定（10秒）
- 404エラー時はスキップして次へ
- 最大リトライ回数: 3回
```

### コツ3: 出力形式を明示

**プロンプト例**:
```
以下のデータをJSON形式で出力してください。

出力フォーマット:
{
  "data": [...],
  "summary": {
    "total": 数値,
    "valid": 数値,
    "errors": 数値
  }
}
```

## 実践4: ChatGPT vs Claude の使い分け

### ChatGPT 4が得意なこと

1. **コード生成**
   - Pythonスクリプト
   - 複雑なロジック
   - ライブラリの使い方

2. **データ変換**
   - フォーマット変換
   - 大量データの処理提案

### Claudeが得意なこと

1. **長文の理解**
   - 複雑な要件の整理
   - 仕様書の作成

2. **データ分析**
   - 異常値の発見
   - パターンの抽出

3. **コードレビュー**
   - バグの指摘
   - 改善提案

### 実際の使い分け

**私の開発フロー**:
1. **ChatGPT**: 初期コード生成
2. **Claude**: コードレビュー
3. **ChatGPT**: 修正コード生成
4. **Claude**: 最終チェック

## 実践5: AI活用の落とし穴と対策

### 落とし穴1: AIの出力を盲信する

**問題**: 生成されたコードにバグがある

**対策**:
- 必ずテストデータで動作確認
- エッジケースを試す
- 段階的に本番データで検証

### 落とし穴2: プロンプトが曖昧

**問題**: 期待と違う出力が返ってくる

**対策**:
- 具体例を3つ以上示す
- 期待する出力形式を明示
- 制約条件を箇条書きで列挙

### 落とし穴3: AI依存しすぎる

**問題**: 基本的なコーディング力が低下

**対策**:
- 生成されたコードを理解する
- 自分でも書けるレベルを維持
- AIは「アシスタント」として使う

## まとめ: AIで10倍速の開発を

生成AIを活用することで、データベース構築の開発時間を劇的に短縮できました：

**従来の開発時間（推定）**:
- データ収集: 20時間
- データ整形: 50時間
- 検証コード作成: 10時間
- **合計: 80時間**

**AI活用後**:
- データ収集: 2時間
- データ整形: 30分
- 検証コード作成: 1時間
- **合計: 3.5時間**

**短縮率: 95%**

ただし、AIは万能ではありません。**人間の判断とAIの効率を組み合わせる**ことが、最も効果的な開発スタイルです。

## 関連記事

- [日本酒データベースサイト開発秘話](/articles/sake-database-development-story.html)
- [Claude Code使用レビュー](/articles/claude-code-experience.html)
- [CookSuggestアプリ開発秘話](/articles/cook-suggest-development.html)

AI時代の個人開発、楽しんでいきましょう！
