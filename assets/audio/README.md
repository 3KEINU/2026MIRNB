# Audio Placeholders

本番用の音声ファイルをここへ配置します。

SE:

- `se/start.mp3`: START時
- `se/jump.mp3`: JUMP時
- `se/goal.mp3`: ゴール時

BGM:

- `bgm/title_loop.mp3`: タイトル・ストーリー・リザルト用ループ
- `bgm/play_loop.mp3`: プレイ中ループ
- 隠しモード専用BGMを使う場合は `assets.js` の `audio.bgm.titleSecret` / `audio.bgm.playSecret` にパスを設定

ファイル形式や名前を変える場合は `assets.js` の `audio` を更新してください。
スマホブラウザでは自動再生制限があるため、ユーザー操作後に再生開始します。
