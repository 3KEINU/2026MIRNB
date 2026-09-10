# UI Assets

MVPではDOM/CSSでUIを描画しています。

ボタン画像などを追加する場合は `assets.js` の `ui` にパスを追加してから利用してください。

裏モードのクリア報酬は `secret_clear_reward_0.png` → `secret_clear_reward_1.png` → `secret_clear_reward_2.png` の順で8fps（各125ms）でループ表示します。原画像は1280×1280pxで保存し、画面上では正方形のまま縮小します。

操作ボタン画像は `button_bdash.png`（360×720px）と `button_jump.png`（1080×720px）です。元PNGは保持し、`index.html` のSVG `viewBox`で透明な余白を詰めて表示します。画像を差し替えて絵の位置が変わる場合は、この表示範囲も調整してください。
