# BITE VIBES (BV)

食事の意思決定プラットフォーム。ルーレット形式で今日のメニューを決めよう！

## 機能

### コア機能

- **ルーレット**: 物理エンジンベースのリアルなルーレット回転
- **メニュー管理**: メニューの追加・編集・削除・有効/無効切り替え
- **プリセット切り替え**: シーンに合わせた複数のメニューセット管理
- **ランチ/ディナー分離**: 時間帯で自動切り替え。各プリセットにランチ/ディナータグ
- **サウンド & 演出**: Web Audio API、Vibration API、Confettiエフェクト
- **データ永続化**: LocalStorage + クラウド同期（Firebase対応時）

### Step 1: クラウドストレージ

- Firebase Firestore によるメニューデータのクラウド保存
- 匿名認証によるセキュアなアクセス
- 食事履歴の保存
- ブラウザを閉じてもデータを復元

### Step 2: 共有機能

- URLベースのプリセット共有（Firebase不要）
- Web Share API対応（モバイルのネイティブ共有）
- ワンタップでリンクコピー
- 共有されたプリセットのインポート

### Step 3: リアルタイム同期

- ルーム作成・参加（6文字のルームコード）
- Firestoreリアルタイムリスナーによるルーレット同期
- 複数人で同じルーレットを回す「グループ・バイブス」

### モバイル完全対応

- ボトムナビゲーション（タブバー）
- セーフエリア対応（ノッチ、ホームインジケーター）
- 44px最小タッチターゲット
- iOS自動ズーム防止（16px入力フィールド）
- PWA対応（ホーム画面追加）

## 技術スタック

- **Frontend**: React + Tailwind CSS v4
- **Build**: Vite
- **Backend/Storage**: Cloud Firestore (NoSQL)
- **Auth**: Firebase Anonymous Auth
- **Icons**: Lucide React
- **Effects**: Canvas API / Web Audio API / canvas-confetti

## セットアップ

```bash
npm install
npm run dev
```

### Firebase設定（オプション）

クラウド保存・リアルタイム同期機能を利用する場合:

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクト作成
2. Firestore Database を有効化
3. Authentication で匿名認証を有効化
4. `.env.example` を `.env` にコピーして設定値を記入

```bash
cp .env.example .env
```

## フォルダ構成

```text
src/
├── components/          # 共通UIコンポーネント
│   ├── Layout/          # Header, BottomNav
│   └── ui/              # MealTypeToggle 等
├── features/            # 機能別モジュール
│   ├── roulette/        # ルーレット機能（コア）
│   ├── menu/            # メニュー管理機能
│   ├── cloud/           # クラウドストレージ機能
│   ├── share/           # 共有機能
│   ├── realtime/        # リアルタイム同期機能
│   └── ai/              # AI連携機能（Step 4予定）
├── hooks/               # カスタムフック
├── utils/               # ユーティリティ関数
├── App.jsx
├── main.jsx
└── index.css
```

## ロードマップ

- [x] **Step 1**: クラウド保存の実装
- [x] **Step 2**: 共有機能の実装
- [x] **Step 3**: リアルタイム同期の実装
- [ ] **Step 4**: AI連携（Gemini 2.5 Flash）
