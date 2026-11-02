# しろくまのオリジナルゲーム

ダークネイビー＋ブルー・パープルの静的サイトです。サイト本体はビルド不要。3Dゲームは同梱のThree.jsを使用します。GitHub Pagesで公開できます。

## 現在の状態

- GitHub Pagesで公開中です。
- 忘れんぼうダンジョンの3Dベータ版を掲載しています。完成版ではなく、調整中の作品です。
- ロゴ・メイン画像には、前の会話から取得した赤い蝶ネクタイのしろくま原画を使用しています。別途生成された完成ロゴは取得できていません。
- 新着・おすすめカルーセルは作品登録後に機能します。0件では準備中表示、収まる件数では矢印を無効にします。自動再生はありません。

## プレビュー

`index.html` をブラウザーで開くか、このフォルダーで `node scripts/serve.mjs` を実行して http://127.0.0.1:4173 を開きます。停止は Ctrl+C。

## GitHubに接続して公開

1. GitHub連携を追加し、GitHubアカウントを認証して対象リポジトリへのアクセスを許可します。続けて作業する場合はリポジトリURLをチャットで共有してください。
2. GitHubで新しいリポジトリ（例：`shirokuma-games`）を作成します。無料プランでの公開はPublicリポジトリを使用してください。Publicではソースと画像も公開されます。
3. このフォルダーの**中身**をリポジトリの直下にアップロードして、`main` にコミットします。ZIPのままではなく展開してアップロードしてください。`index.html` がリポジトリ直下になるようにします。
4. リポジトリの **Settings → Pages → Build and deployment** で **Source: Deploy from a branch / Branch: main / Folder: /(root)** を選び、Saveします。
5. GitHubのデプロイ完了後、Pages画面に表示されたURLを開きます。通常は `https://ユーザー名.github.io/リポジトリ名/` です。

公式手順：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

既存リポジトリへ入れる場合は既存ファイルを確認してから統合してください。画像・CSS・JSには相対パスを使い、プロジェクト配下のURLにも対応しています。

## ゲームを追加する

`data/games.js` の配列に1作品ずつ追加します。以下は説明用で、実作品ではありません。実際の情報に置き換えるまで `draft` のままにしてください。

```js
window.SHIROKUMA_GAMES = [
  {
    id: 'your-game',
    title: '実際のゲーム名',
    description: '作品の短い紹介文',
    genre: 'パズル',
    status: 'draft',
    releaseDate: '2026-10-31',
    url: 'games/your-game/index.html',
    thumbnail: 'assets/your-game.jpg',
    recommendedOrder: 1
  }
];
```

- `status: 'published'` で、タイトル・有効なリンク・過去または当日の公開日がある作品だけを表示します。リンク先の存在は公開前に必ず確認してください。
- `releaseDate`: YYYY-MM-DD形式。新着欄は日付の降順です。公開判定は閲覧端末の時計を使います。厳密な予約公開機能ではありません。
- `recommendedOrder`: 小さい数からおすすめ欄に表示。おすすめにしない場合はこの項目を削除します。
- `genre`: 1作品1ジャンル。新しいジャンルはフィルターに自動追加します。
- `thumbnail`: 推奨16:9。省略・読み込み失敗時は代替デザインを表示します。
- `url`: 同じリポジトリのゲームには `games/your-game/index.html` のような相対パス、外部ゲームには `https://...` を指定します。
- ゲーム本体を同梱する場合は `games/your-game/` に必要なファイルを置いてください。3Dベータ版を同梱しています。
- お知らせは `index.html` の `id="news"`、原画は `assets/shirokuma.jpg` を編集・交換できます。

## 確認ポイント

公開前にPC・スマホで表示、ジャンル絞り込み、作品リンク、横スクロールと左右矢印、キーボード操作を確認してください。将来作品を追加した際も、公開日とリンク先の実在を確認してください。

## 今回の検証結果
JavaScript構文、空状態、未公開・未来日付・不正URLの除外、新着・おすすめの順序、ジャンル絞り込み、リポジトリ配下の相対URLをコード上で検証しました。ローカル接続制限によりブラウザー表示とスマホ実機操作は未確認です。

