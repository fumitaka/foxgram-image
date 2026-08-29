# Foxgram Image

<table>
  <thead>
    <tr>
      <th style="text-align:center"><a href="README.md">English</a></th>
      <th style="text-align:center">日本語</th>
    </tr>
  </thead>
</table>

Instagram の画像を Firefox の右クリックメニューから保存する軽量アドオンです。

## 方針

- Instagram の DOM / オーバーレイは変更しません
- 右クリック座標の下にある `<img>` を検出して URL を取得します
- 可能な場合は `srcset` の最大幅候補を使用します

## 開発用インストール

1. Firefox で `about:debugging#/runtime/this-firefox` を開きます
2. **一時的なアドオンを読み込む** をクリックします
3. このリポジトリの `manifest.json` を選びます
4. **すでに開いている Instagram のタブを再読み込みします**
5. 画像の上で右クリックし、次のメニューを選びます
   - **Instagram 画像を保存**
   - **Instagram 画像を新しいタブで開く**

一時アドオンは Firefox を終了すると削除されます。

## ファイル

- `manifest.json`
- `background.js`
- `content.js`

## 注意

インストール直後は content script がページに注入されていないため、Instagram の再読み込みが必要です。

画像本体は通常 `cdninstagram.com` / `fbcdn.net` から配信されるため、ダウンロードを許可する目的でこれらのホスト権限を設定しています。

保存したコンテンツの著作権や利用条件には十分ご注意ください。
