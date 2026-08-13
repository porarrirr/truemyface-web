# TrueMyFace Web

English | [日本語](README.ja.md)

The public website for TrueMyFace, an iOS app that guides the user through a facial scan and presents the resulting analysis. This repository provides the product introduction, support information, privacy policy, and terms required for the app's public presence.

## Published content

- `index.html` — product landing page
- `support.html` — support and frequently asked questions
- `privacy.html` — privacy policy
- `terms.html` — terms of use
- `app-ads.txt` — authorized digital-seller information for AdMob

The site uses the same dark navy, neo-brutalist visual direction as the app.

## Local preview

```bash
cd Web
python3 -m http.server 8765
```

Then open http://localhost:8765/index.html.
