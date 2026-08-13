# TrueMyFace Web

[English](README.md) | 日本語

顔のスキャンを案内し、その分析結果を表示するiOSアプリ「TrueMyFace」の公開サイトです。製品紹介、サポート情報、プライバシーポリシー、利用規約を公開するためのリポジトリです。

## 公開内容

- `index.html` — 製品ランディングページ
- `support.html` — サポート・よくある質問
- `privacy.html` — プライバシーポリシー
- `terms.html` — 利用規約
- `app-ads.txt` — AdMobの認定販売者情報

サイトは、アプリと共通の濃紺・ネオブルータリズムのビジュアル方針で作られています。

## ローカルプレビュー

```bash
cd Web
python3 -m http.server 8765
```

起動後、http://localhost:8765/index.html を開きます。
