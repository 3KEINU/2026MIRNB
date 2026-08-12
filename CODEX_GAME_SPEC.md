# CODEX GAME SPEC
## Project: ESCAPE FROM THIRTIES
Version: 0.1 / 2026-08-12

> この文書は、Codex にブラウザゲームの初期実装を依頼するための実装仕様書。
> 現段階では「完成版を一度に作る」のではなく、仮素材で遊べるMVPを作り、
> その後ユーザー制作のドット絵・背景・UI素材へ差し替えることを最優先とする。

---

## 0. Codexへの最初の依頼

この仕様書を読み、まず **MVP（仮素材版）** を実装すること。

優先順位は以下。

1. スマホ縦画面で正しく動く
2. 自動走行・JUMP・BOOST・障害物・3ライフ・スコア・ゴールが成立する
3. 操作感を後から容易に調整できる
4. 画像素材を後から差し替えやすい
5. コードを必要以上に複雑にしない
6. 本番アートは作らず、明確な仮素材だけを使う

最初から豪華な演出、ランキング、サーバー、アカウント、複雑なアニメーション等を追加しない。

---

# 1. 目的

古川未鈴 生誕2026「古川未鈴30代からの脱出!!」を元にした、
ファン制作の短時間ブラウザランゲーム。

ユーザーはURLをスマートフォンで開き、そのまま縦持ちで遊べる。

想定プレイ時間：
- 通常プレイ：約50～60秒
- BOOSTを積極的に使用：約40～50秒
- 厳密な時間制限は設けない

ゲームの主目的：
- 初見でも完走しやすい
- BOOSTを使うことでスコアアタックに深みが出る
- 1周が短く、もう一度遊びやすい

---

# 2. 技術方針

## 2.1 必須
- ブラウザで動作
- スマホ縦画面を最優先
- iOS Safari / Android Chrome を主対象
- PCブラウザでもデバッグ・プレイ可能
- インストール不要
- 静的ホスティングだけで公開可能
- バックエンド不要のMVP

## 2.2 実装方式
シンプルさを最優先する。

推奨：
- HTML
- CSS
- Vanilla JavaScript
- Canvas 2D でゲームフィールドを描画
- 操作ボタンやメニューはDOMでも可

ビルドツールを使う場合も静的成果物だけで公開できる構成にする。
React等の大型フレームワークは、明確な必要性がない限り使用しない。

## 2.3 公開
MVPは静的サイトとして公開可能な構成にする。
Cloudflare Pages / GitHub Pages / Netlify 等へ置けること。

---

# 3. 画面設計

## 3.1 基本
- Portrait / 縦画面
- 横向きへの回転を要求しない
- 1画面内にゲーム画面＋2ボタンが収まる
- スマホのブラウザUIがあっても操作できる余白を確保
- safe-area-inset を考慮する

## 3.2 レイアウト目安
上部 約65～70%：
- ゲームフィールド
- SCORE
- LIFE
- 必要ならBOOST倍率表示

下部 約30～35%：
- 左：大きな JUMP ボタン
- 右：大きな BOOST ボタン

ゲームボーイのA/Bボタンのように、
親指で迷わず押せる大きさを優先する。

ボタンは視覚的に明確に分離する。

## 3.3 Touch
- スクロールを誤発動しない
- pinch zoom やブラウザの選択操作をゲーム中に誘発しない
- 複雑なジェスチャーは使わない
- 二本指タップは使わない

---

# 4. 画面フロー

## 4.1 Title
表示：
- 仮タイトルロゴ
- START ボタン：中央、最も目立つ
- STORY ボタン：画面端に小さく配置

## 4.2 Story
STORY を押すと長文テキスト画面を開く。

要件：
- 本文は後から簡単に差し替え可能
- 外部テキスト / JSON / JS定数など、編集しやすい形にする
- スクロール可能
- BACK でタイトルへ戻れる
- ゲーム攻略上は読む必要なし

MVPでは仮文章でよい。
本番は「ゲーム内容に対して異常に長く冗長」というギャグにする。

## 4.3 Game
START → ゲーム開始。

## 4.4 Result
完走：
- ESCAPED / CLEAR 等の表示
- TOTAL SCORE
- 残りLIFE
- 取得アイテム数（必要なら）
- RETRY
- TITLE

ゲームオーバー：
- GAME OVER
- SCORE
- RETRY
- TITLE

「40」という数字をゴール・年齢表示として使用しない。

---

# 5. プレイヤー

## 5.1 MVP
本番キャラクター画像は未完成。

仮素材：
- 単純な色付き矩形、または明確に仮だと分かる簡易ドットキャラ
- 本番デザインを勝手に生成・完成させない

本番想定：
- 古川未鈴さんをデフォルメしたドット絵
- 2026年生誕衣装
- 48×48px または 64×64px程度
- 最終サイズ未決定

## 5.2 Animation slots
最低限、後から以下を差し替えられる構造にする。

- run: 4 frames 目安
- jump: 1 frame 以上
- damage: 1 frame 以上

フレーム数は設定で変更可能にするか、少なくともコード上で変更しやすくする。

## 5.3 Hitbox
画像全体を当たり判定にしない。

プレイヤーのヒットボックスはスプライトより小さく設定できるようにする。
本番衣装はスカート等が横に広がるため、
見た目どおりの矩形判定にすると理不尽になりやすい。

hitbox width / height / offset を設定値として分離する。

---

# 6. 基本ゲームループ

1. キャラクターが自動走行
2. 地面上の障害物が右から左へ流れる
3. JUMPで回避
4. アイテムを取得して加点
5. 必要に応じてBOOSTを押し続ける
6. BOOST中は速度と得点効率が上がる
7. 障害物に衝突するとLIFE減少
8. LIFEが0ならGAME OVER
9. コース終端まで到達すればCLEAR
10. 残りLIFEボーナスを加算してResult

---

# 7. JUMP

## 7.1 操作
スマホ：
- 左下 JUMP ボタンのtap

PC：
- Space または ArrowUp
- JUMPボタンのクリックでも動作

## 7.2 挙動
- 1回押すと毎回同じ基本ジャンプ
- 長押しによるジャンプ高変更なし
- 二段ジャンプなし
- 空中で再入力しても追加ジャンプしない
- 地面に接地している時のみ発動

ジャンプ高さ・滞空時間・重力は設定値として調整可能にする。

注意：
「ジャンプ幅一定」は、入力時間によって変化しない固定ジャンプという意味。
BOOST中はスクロール速度が上がるため、
画面上で障害物を越えるタイミング感が変化してよい。
もし試遊で不自然なら調整する。

---

# 8. BOOST

## 8.1 操作
スマホ：
- 右下 BOOST ボタンを press-and-hold
- 離したら通常速度へ戻る

PC：
- Shift press-and-hold
- BOOSTボタンのマウス長押しでも動作

## 8.2 MVP仕様
- ゲージ消費なし
- クールダウンなし
- 押している間は常時使用可能
- BOOSTのコストは「速度が上がり、反応時間が短くなること」

## 8.3 効果
BOOST中：
- world scroll speed を上昇
- passive score の倍率を上昇
- item score も倍率対象にしてよい（設定で切替可能にするのが望ましい）

倍率・速度上昇量は config から変更できるようにする。

例：
normal speed = 1.0
boost speed = 1.4～1.8
boost score multiplier = 1.5～3.0

数値は仮値であり、試遊して変更する。

---

# 9. LIFE / Collision

## 9.1 LIFE
初期値：3

障害物と衝突：
- LIFE -1

LIFE == 0：
- GAME OVER

## 9.2 衝突後
MVP推奨：
- 0.8～1.5秒程度の短い無敵時間
- 無敵中は点滅等で分かるようにする
- 同じ障害物で複数回連続被弾しない
- BOOSTは解除してもよい

これらは調整用設定にする。

---

# 10. SCORE

## 10.1 構成
TOTAL SCORE =
- run score
- item score
- clear life bonus

## 10.2 Run score
走行中に少量ずつ加点。

BOOSTでコース完走時間が短くなるため、
「経過秒数」より「進んだ距離/world advance」を基準にすることを推奨。

BOOST中は距離加点へ倍率をかける。

## 10.3 Item score
ステージ上に配置されたアイテムを取ると加点。

アイテムごとに得点値を持てるようにする。

MVP例：
common = 100
valuable = 300
rare = 500

最終値は未決定。

## 10.4 Life bonus
ゴール時の残りLIFEに応じて加算。

例：
1 life = +500
2 lives = +1000
3 lives = +1500

値は仮。

## 10.5 High Score
MVPで実装してよい：
- localStorage に自己ベストを保存

オンラインランキングはMVPに含めない。

---

# 11. Course

## 11.1 長さ
- 通常走行で約50～60秒
- BOOSTを多用すると約40～50秒目安

## 11.2 Difficulty
前半：
- 単独障害物中心
- 初見でジャンプタイミングを理解できる

中盤：
- 障害物の間隔を少し狭める
- アイテム取得とジャンプの判断を組み合わせる

後半：
- やや難しい配置
- ただし安全ルートでは完走しやすくする
- 高得点アイテムを取ろうとすると難しくなる配置が望ましい

## 11.3 Randomness
MVPは固定コースを推奨。

理由：
- スコア比較が公平
- 難度調整が容易
- バグ再現が容易

将来、必要ならseed式/ランダム生成を追加する。

---

# 12. Obstacles

## 12.1 アート方針
障害物は、
抽象的な「数字」「年齢」「固定観念」ではなく、
2026年生誕ビジュアルに登場する機材／オブジェクトを元にする。

候補例：
- CRT monitor
- speaker
- retro telephone
- cable / equipment object
- その他、元ビジュアルから読みやすいもの

重要：
48～64px程度でも一瞬で「物体」と分かること。

本番絵はユーザーが後から制作する。
MVPでは同じ当たり判定サイズの色付きbox等で代用する。

## 12.2 Obstacle data
各障害物はデータ化する。

最低：
- type
- x
- width
- height
- hitbox
- sprite key

コース配列を編集するだけで配置変更できるようにする。

---

# 13. Collectible Items

## 13.1 意味
「未鈴さんらしいもの」をモチーフにする。

候補は未確定。
例：
- game / controller
- PC gaming
- rhythm game
- microphone / music
- streaming
- ZINE
- Cookmart-related motif

「40」をアイテムやゴールにはしない。

## 13.2 Data
最低：
- type
- x
- y
- scoreValue
- sprite key

取得時：
- 軽い視覚フィードバック
- SCORE加算
- sprite消去

---

# 14. Art / Asset Pipeline

## 14.1 最重要
**本番アートは後から差し替える。**

Codexは完成版のキャラクターや背景を勝手に作らない。
MVPは仮素材で成立させる。

## 14.2 推奨ディレクトリ
/assets
  /player
  /obstacles
  /items
  /background
  /ui

例：
assets/player/run.png
assets/player/jump.png
assets/player/damage.png

ただし本番スプライトシート形式は後で決定可能。

## 14.3 Asset configuration
ファイル名やフレームサイズをコードに散在させない。
asset manifest または config へ集約する。

---

# 15. Visual Direction

- pixel art
- portrait mobile
- dark / deep-colored background
- 2026 birthday outfit の赤・白・青が目立つ
- retro electronic / game-like world
- 背景は細かく描き込みすぎない
- 小さい画面での可読性を優先
- UIもドットゲームの世界観に合わせる

MVPは色付きの簡単な仮表示でよい。

---

# 16. Story UI

ゲーム内容に対して不釣り合いに長いSTORYを読めること自体がギャグ。

MVP実装：
- Titleの端にSTORYボタン
- Story screen/modal
- 長文スクロール
- Back

本番テキストは未作成。

ストーリーは任意閲覧。
読んでいなくてもゲーム操作やルールが理解できること。

---

# 17. Configuration

調整値を1か所へ集約する。

例：
- BASE_SPEED
- BOOST_SPEED
- BOOST_SCORE_MULTIPLIER
- GRAVITY
- JUMP_VELOCITY
- MAX_LIFE
- INVINCIBLE_MS
- RUN_SCORE_RATE
- LIFE_BONUS
- PLAYER_HITBOX
- COURSE_LENGTH
- animation fps

`config.js` 等へ集約し、
ゲームコードを触らなくても調整しやすくする。

---

# 18. Accessibility / Usability

- ボタンは十分大きく
- 文字サイズを小さくしすぎない
- 色だけでLIFEや状態を判別させない
- BOOST中は色 + エフェクト + 倍率表示など複数のフィードバック
- Touch / mouse / keyboard で最低限操作可能
- ページスクロールとゲーム操作を競合させない

---

# 19. Performance

- 低～中程度のスマホでも滑らかに動くこと
- requestAnimationFrame を使用
- devicePixelRatio を考慮してCanvasを設定
- 画像を毎フレーム新規生成しない
- 不要なDOM更新を避ける
- 大量のオブジェクト生成をしない

---

# 20. MVP Definition of Done

以下を満たしたら「仮素材版MVP完成」。

- [ ] スマホ縦画面でタイトルが表示される
- [ ] STARTでゲーム開始
- [ ] STORYボタンで長文画面へ移動できる
- [ ] プレイヤーが自動走行
- [ ] JUMPボタンで固定ジャンプ
- [ ] BOOST長押しで速度上昇
- [ ] BOOST中に得点効率が上がる
- [ ] 障害物との当たり判定がある
- [ ] LIFEが3あり、被弾で減る
- [ ] LIFE 0でGAME OVER
- [ ] アイテム取得でスコア加算
- [ ] 固定コースにゴールがある
- [ ] ゴールでResult表示
- [ ] 残りLIFEボーナスが加算される
- [ ] RETRYできる
- [ ] 主要ゲーム調整値がconfig化されている
- [ ] 本番画像をファイル差し替えで導入しやすい
- [ ] 「40」を年齢／ゴール表現として使用していない
- [ ] 静的ファイルとしてビルド／公開できる

---

# 21. MVPに入れないもの

現段階では以下を実装しない。

- オンラインランキング
- ユーザーアカウント
- サーバーDB
- 課金
- 複数ステージ
- 複雑なストーリーイベント
- ボス戦
- 二段ジャンプ
- 可変ジャンプ
- 複雑なBOOSTゲージ
- 本番アートの自動生成
- 大量のサウンド演出
- SNSシェア機能（後から検討）

---

# 22. 未決定事項 / TODO

ユーザーと相談して後で決める。

- [ ] player sprite: 48×48 or 64×64
- [ ] player head/body ratio
- [ ] exact obstacle set
- [ ] exact collectible set
- [ ] background location / scenery
- [ ] BASE_SPEED
- [ ] BOOST_SPEED
- [ ] BOOST multiplier
- [ ] jump height / duration
- [ ] obstacle spacing
- [ ] score values
- [ ] life bonus
- [ ] course length
- [ ] result screen design
- [ ] audio
- [ ] story text
- [ ] final logo
- [ ] local high-score display design

---

# 23. 実装後、Codexに必ず報告してほしいこと

MVPを作成したら、以下を簡潔に報告する。

1. 作成したファイル一覧
2. ローカルで起動する方法
3. ゲーム調整値があるファイル
4. キャラスプライト差し替え方法
5. 障害物画像差し替え方法
6. アイテム画像差し替え方法
7. 背景画像差し替え方法
8. コース配置の編集方法
9. 現時点で未実装のもの
10. 実機スマホ確認が必要なポイント

また、ユーザーが自分で本番ドット絵を制作する前提なので、
必要な画像サイズ・フレーム構成・透明PNGの仕様を、
MVP完成時点で明確に提示すること。
