# Foxgram Image

Instagram の画像を Firefox の右クリックメニューから保存する軽量アドオン。

## 方針

- Instagram の DOM / オーバーレイは変更しない
- 右クリック座標の下にある `<img>` を検出して URL を取る
- 可能なら `srcset` の最大幅候補を使う

## 開発用インストール

1. Firefox で `about:debugging#/runtime/this-firefox` を開く
2. 「一時的なアドオンを読み込む」
3. このフォルダの `manifest.json` を選ぶ
4. **すでに開いている Instagram のタブを再読み込みする**
5. 画像の上で右クリック
   - Instagram 画像を保存
   - Instagram 画像を新しいタブで開く

一時アドオンは Firefox 終了で消えます。

## ファイル

- `manifest.json`
- `background.js`
- `content.js`

## 注意

インストール直後は content script が入っていないため、Instagram をリロードする必要があります。
画像本体は `cdninstagram.com` / `fbcdn.net` にあるため、そのホスト権限がないと `downloads` が失敗することがあります。
