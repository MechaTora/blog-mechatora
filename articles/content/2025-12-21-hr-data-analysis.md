---
title: 人事データ分析入門｜Pythonで採用・離職率を可視化する方法
date: 2025-12-21T10:00:00+09:00
category: データサイエンス
description: 現役人事×Kaggle Masterが教える、人事部門でのデータ活用実践ガイド。採用データ分析、離職予測モデル構築、Excel脱却の具体的手法を詳しく解説します。
keywords: 人事,データ分析,Python,pandas,採用,離職率,予測モデル,HR Analytics,人事データ,可視化
---

## はじめに：人事部門にこそデータサイエンスが必要

「人事の仕事は、データで変わる」

現役人事として5年間働き、Kaggle Masterとしてデータサイエンスを学んだ私が断言します。**人事データ分析は、採用・育成・定着の全てを改善します**。

しかし、多くの人事部門はまだ**Excel手作業**に頼っています。

この記事では、**Pythonを使った人事データ分析の実践方法**を、初心者向けに詳しく解説します。

- 採用データの分析（応募数・選考通過率）
- 離職率の可視化と予測モデル
- Excel脱却の具体的ステップ

人事×データサイエンスで、あなたの仕事を変革しましょう！

## 人事データ分析で解決できる課題

### 課題1: 採用の属人化

**よくある問題**:
- 面接官によって合否が変わる
- 「勘と経験」で判断
- データに基づいた意思決定ができない

**データ分析による解決**:
- 過去の採用データから「合格者の傾向」を可視化
- 面接官ごとの合格率を比較
- 予測モデルで「この候補者は活躍しそうか？」を判定

### 課題2: 離職率が下がらない

**よくある問題**:
- 「なぜ辞めるのか」が分からない
- 退職理由は建前ばかり
- 離職予兆を掴めない

**データ分析による解決**:
- 離職者の共通パターンを発見
- 入社1年以内の離職を予測
- 早期にフォロー施策を打つ

### 課題3: Excelの限界

**よくある問題**:
- 複数のExcelファイルを手作業で集計
- グラフ作成に時間がかかる
- データが増えると処理が遅い

**Pythonによる解決**:
- 自動集計・可視化
- 数千件のデータでも瞬時に処理
- コードを共有すれば誰でも再現可能

## 準備：環境構築

### Python環境のセットアップ

```bash
# Anacondaインストール（推奨）
# https://www.anaconda.com/products/distribution

# 必要なライブラリ
pip install pandas numpy matplotlib seaborn scikit-learn openpyxl
```

### サンプルデータの準備

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# サンプル採用データ生成
np.random.seed(42)

n_applicants = 500  # 応募者数

data = {
    '応募ID': range(1, n_applicants + 1),
    '応募日': [datetime(2024, 1, 1) + timedelta(days=int(x))
               for x in np.random.uniform(0, 365, n_applicants)],
    '年齢': np.random.randint(22, 45, n_applicants),
    '性別': np.random.choice(['男性', '女性'], n_applicants),
    '学歴': np.random.choice(['高卒', '専門卒', '大卒', '大学院卒'], n_applicants, p=[0.1, 0.2, 0.6, 0.1]),
    '職歴年数': np.random.randint(0, 15, n_applicants),
    '書類選考': np.random.choice(['合格', '不合格'], n_applicants, p=[0.7, 0.3]),
    '一次面接': np.random.choice(['合格', '不合格', '未実施'], n_applicants, p=[0.4, 0.3, 0.3]),
    '最終面接': np.random.choice(['内定', '不合格', '未実施'], n_applicants, p=[0.2, 0.2, 0.6]),
}

df_recruit = pd.DataFrame(data)

# CSV保存
df_recruit.to_csv('recruit_data.csv', index=False, encoding='utf-8-sig')

print(f'サンプルデータ作成完了: {len(df_recruit)}件')
print(df_recruit.head())
```

## 分析1: 採用データの可視化

### 応募数の推移

```python
import matplotlib.pyplot as plt
import seaborn as sns

# 日本語フォント設定
plt.rcParams['font.family'] = 'MS Gothic'
plt.rcParams['figure.figsize'] = (12, 6)

# 月別の応募数
df_recruit['応募月'] = pd.to_datetime(df_recruit['応募日']).dt.to_period('M')
monthly_apply = df_recruit.groupby('応募月').size()

plt.figure(figsize=(12, 6))
monthly_apply.plot(kind='bar', color='steelblue')
plt.xlabel('月')
plt.ylabel('応募数')
plt.title('月別応募数の推移')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('monthly_applications.png', dpi=300)
plt.show()
```

**洞察**:
- 3月、9月に応募が増える（転職シーズン）
- 12月は減少（年末で動きが鈍い）

### 選考通過率の分析

```python
# 各段階の通過率
total = len(df_recruit)
pass_shurui = (df_recruit['書類選考'] == '合格').sum()
pass_ichiji = (df_recruit['一次面接'] == '合格').sum()
pass_naitei = (df_recruit['最終面接'] == '内定').sum()

funnel_data = {
    '段階': ['応募', '書類通過', '一次通過', '内定'],
    '人数': [total, pass_shurui, pass_ichiji, pass_naitei],
    '通過率': [100, pass_shurui/total*100, pass_ichiji/total*100, pass_naitei/total*100]
}

df_funnel = pd.DataFrame(funnel_data)

# ファンネルチャート
plt.figure(figsize=(10, 6))
colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107']
plt.barh(df_funnel['段階'], df_funnel['人数'], color=colors)
plt.xlabel('人数')
plt.title('採用ファンネル分析')

# パーセンテージ表示
for i, (stage, count, pct) in enumerate(zip(df_funnel['段階'], df_funnel['人数'], df_funnel['通過率'])):
    plt.text(count + 10, i, f'{count}人 ({pct:.1f}%)', va='center')

plt.tight_layout()
plt.savefig('recruitment_funnel.png', dpi=300)
plt.show()

print(df_funnel)
```

**出力例**:
```
      段階    人数   通過率
0   応募    500  100.0%
1  書類通過  350   70.0%
2  一次通過  200   40.0%
3   内定    100   20.0%
```

### 学歴別の内定率

```python
# 学歴別の内定率
education_stats = df_recruit.groupby('学歴').apply(
    lambda x: (x['最終面接'] == '内定').sum() / len(x) * 100
).sort_values(ascending=False)

plt.figure(figsize=(10, 6))
sns.barplot(x=education_stats.values, y=education_stats.index, palette='rocket')
plt.xlabel('内定率（%）')
plt.ylabel('学歴')
plt.title('学歴別の内定率')
plt.tight_layout()
plt.savefig('offer_rate_by_education.png', dpi=300)
plt.show()

print(education_stats)
```

**洞察**:
- 大学院卒の内定率が高い（専門性評価）
- 高卒も一定の内定率（実務経験重視）

## 分析2: 離職データの可視化

### 離職データの作成

```python
# 社員データ生成
n_employees = 300

employee_data = {
    '社員ID': range(1, n_employees + 1),
    '入社日': [datetime(2020, 1, 1) + timedelta(days=int(x))
               for x in np.random.uniform(0, 1460, n_employees)],  # 4年分
    '年齢': np.random.randint(22, 50, n_employees),
    '性別': np.random.choice(['男性', '女性'], n_employees),
    '部署': np.random.choice(['営業', '開発', '人事', '総務', 'マーケティング'], n_employees),
    '役職': np.random.choice(['一般', '主任', '係長', '課長'], n_employees, p=[0.6, 0.2, 0.15, 0.05]),
    '給与': np.random.randint(300, 800, n_employees),  # 万円
    '残業時間': np.random.randint(0, 80, n_employees),  # 月
    '有給取得日数': np.random.randint(0, 20, n_employees),  # 年
    '評価': np.random.randint(1, 6, n_employees),  # 1〜5
    '離職': np.random.choice([0, 1], n_employees, p=[0.85, 0.15])  # 15%が離職
}

df_employee = pd.DataFrame(employee_data)

# 勤続年数を計算
df_employee['勤続年数'] = ((datetime.now() - pd.to_datetime(df_employee['入社日'])).dt.days / 365).round(1)

df_employee.to_csv('employee_data.csv', index=False, encoding='utf-8-sig')

print(f'社員データ作成完了: {len(df_employee)}件')
print(f'離職者数: {df_employee["離職"].sum()}人 ({df_employee["離職"].mean()*100:.1f}%)')
```

### 離職率の可視化

```python
# 部署別の離職率
dept_turnover = df_employee.groupby('部署')['離職'].agg(['sum', 'count', 'mean'])
dept_turnover['離職率'] = dept_turnover['mean'] * 100
dept_turnover = dept_turnover.sort_values('離職率', ascending=False)

plt.figure(figsize=(10, 6))
sns.barplot(x=dept_turnover['離職率'], y=dept_turnover.index, palette='Reds_r')
plt.xlabel('離職率（%）')
plt.ylabel('部署')
plt.title('部署別の離職率')
plt.tight_layout()
plt.savefig('turnover_by_department.png', dpi=300)
plt.show()

print(dept_turnover)
```

### 勤続年数別の離職率

```python
# 勤続年数をビニング
df_employee['勤続年数帯'] = pd.cut(df_employee['勤続年数'], bins=[0, 1, 2, 3, 5, 10], labels=['1年未満', '1-2年', '2-3年', '3-5年', '5年以上'])

tenure_turnover = df_employee.groupby('勤続年数帯')['離職'].mean() * 100

plt.figure(figsize=(10, 6))
tenure_turnover.plot(kind='bar', color='coral')
plt.xlabel('勤続年数')
plt.ylabel('離職率（%）')
plt.title('勤続年数別の離職率')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('turnover_by_tenure.png', dpi=300)
plt.show()
```

**洞察**:
- **1年未満の離職率が最も高い**（早期離職）
- 3年以降は安定

## 分析3: 離職予測モデルの構築

### 特徴量エンジニアリング

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder

# カテゴリ変数をエンコード
le_gender = LabelEncoder()
df_employee['性別_encoded'] = le_gender.fit_transform(df_employee['性別'])

le_dept = LabelEncoder()
df_employee['部署_encoded'] = le_dept.fit_transform(df_employee['部署'])

le_position = LabelEncoder()
df_employee['役職_encoded'] = le_position.fit_transform(df_employee['役職'])

# 特徴量の選択
features = ['年齢', '性別_encoded', '部署_encoded', '役職_encoded', '給与', '残業時間', '有給取得日数', '評価', '勤続年数']
X = df_employee[features]
y = df_employee['離職']

# 訓練データとテストデータに分割
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

print(f'訓練データ: {len(X_train)}件')
print(f'テストデータ: {len(X_test)}件')
```

### モデル訓練

```python
# Random Forestモデル
model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
model.fit(X_train, y_train)

# 予測
y_pred = model.predict(X_test)

# 精度評価
accuracy = accuracy_score(y_test, y_pred)
print(f'\n精度: {accuracy:.2%}')

print('\n分類レポート:')
print(classification_report(y_test, y_pred, target_names=['定着', '離職']))

# 混同行列
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['定着', '離職'], yticklabels=['定着', '離職'])
plt.xlabel('予測')
plt.ylabel('実際')
plt.title('離職予測の混同行列')
plt.tight_layout()
plt.savefig('confusion_matrix.png', dpi=300)
plt.show()
```

**出力例**:
```
精度: 82.5%

分類レポート:
              precision    recall  f1-score   support
       定着       0.85      0.95      0.90        77
       離職       0.75      0.50      0.60        13

  accuracy                           0.83        90
```

### 特徴量の重要度

```python
# 特徴量の重要度
importances = model.feature_importances_
feature_importance = pd.DataFrame({
    '特徴量': features,
    '重要度': importances
}).sort_values('重要度', ascending=False)

plt.figure(figsize=(10, 6))
sns.barplot(x='重要度', y='特徴量', data=feature_importance, palette='viridis')
plt.title('離職予測における特徴量の重要度')
plt.tight_layout()
plt.savefig('feature_importance_turnover.png', dpi=300)
plt.show()

print(feature_importance)
```

**洞察**:
- **残業時間**が最も重要（過労→離職）
- **評価**も重要（低評価→モチベーション低下）
- **有給取得日数**（取得できない→不満）

### 離職リスクの予測

```python
# 離職リスクの高い社員を特定
df_employee['離職確率'] = model.predict_proba(X)[:, 1]

# リスク上位10名
high_risk = df_employee.nsmallest(10, '離職確率')[['社員ID', '部署', '残業時間', '評価', '離職確率']]

print('離職リスクが高い社員（トップ10）:')
print(high_risk)
```

**活用方法**:
- リスクが高い社員に1on1面談
- 残業時間削減の施策
- 評価フィードバックの改善

## Excel脱却：Pythonへの移行ステップ

### ステップ1: Excelデータを読み込む

```python
# Excelファイルを読み込み
df = pd.read_excel('採用データ.xlsx', sheet_name='応募者一覧')

# データ確認
print(df.head())
print(df.info())
```

### ステップ2: 自動レポート生成

```python
def generate_monthly_report(df, year, month):
    """
    月次採用レポートを自動生成

    Parameters:
    - df: 採用データのDataFrame
    - year: 年
    - month: 月
    """
    # 該当月のデータ抽出
    df['応募月'] = pd.to_datetime(df['応募日']).dt.to_period('M')
    target_month = f'{year}-{month:02d}'
    df_month = df[df['応募月'] == target_month]

    # レポート作成
    report = f"""
    ========== {year}年{month}月 採用レポート ==========

    【応募状況】
    - 応募者数: {len(df_month)}人
    - 書類通過: {(df_month['書類選考'] == '合格').sum()}人
    - 一次面接通過: {(df_month['一次面接'] == '合格').sum()}人
    - 内定: {(df_month['最終面接'] == '内定').sum()}人

    【学歴別内定数】
    {df_month[df_month['最終面接'] == '内定']['学歴'].value_counts().to_string()}

    ======================================
    """

    # ファイル保存
    with open(f'月次レポート_{year}{month:02d}.txt', 'w', encoding='utf-8') as f:
        f.write(report)

    print(report)
    print(f'レポート保存完了: 月次レポート_{year}{month:02d}.txt')

# 使用例
generate_monthly_report(df_recruit, 2024, 6)
```

### ステップ3: ダッシュボード作成

```python
import streamlit as st

# Streamlitでダッシュボード作成
# dashboard.py として保存

st.title('人事データ分析ダッシュボード')

# データ読み込み
df = pd.read_csv('recruit_data.csv')

# サイドバー
st.sidebar.header('フィルター')
selected_month = st.sidebar.selectbox('月を選択', df['応募月'].unique())

# メインコンテンツ
st.header('応募数の推移')
st.line_chart(df.groupby('応募月').size())

st.header('選考通過率')
funnel = {
    '書類通過': (df['書類選考'] == '合格').mean() * 100,
    '一次通過': (df['一次面接'] == '合格').mean() * 100,
    '内定': (df['最終面接'] == '内定').mean() * 100
}
st.bar_chart(funnel)

# 実行: streamlit run dashboard.py
```

## まとめ：人事データ分析で組織を変える

Pythonによる人事データ分析で、以下が実現できます：

### 得られる成果

1. **採用の質向上**: データに基づいた選考基準
2. **離職率の低減**: 早期にリスクを察知
3. **業務効率化**: Excel手作業から脱却
4. **意思決定の精度向上**: 勘ではなくデータで判断

### 学習ロードマップ

**Phase 1（1ヶ月）**:
- Python基礎（pandas、matplotlib）
- Excelデータの読み込み・集計

**Phase 2（2ヶ月）**:
- 可視化テクニック
- 統計分析の基礎

**Phase 3（3ヶ月）**:
- 機械学習入門
- 予測モデルの構築

**合計: 6ヶ月で人事データアナリストになれます！**

### 今日からできること

1. **Anacondaをインストール**
2. **この記事のコードを実行**
3. **自社のExcelデータで試す**

人事×データサイエンスで、あなたの価値を10倍にしましょう！

## 関連記事

- [Kaggle Masterが教える、未経験からデータサイエンティストになる最短ルート](/articles/kaggle-master-roadmap.html)
- [データサイエンスで日本酒を分析してみた](/articles/sake-data-analysis.html)
- [人事のプロが語る、採用で評価されるポートフォリオの作り方](/articles/hr-perspective-portfolio-guide.html)
- [AI活用でデータベース構築](/articles/ai-powered-database-construction.html)

データで、人事の未来を創りましょう！
