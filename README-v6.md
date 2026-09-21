# 🎯 Focus Edition — finish the documents you've been avoiding

Focus Edition turns long, boring documents into short, completable **missions** for ADHD brains: time estimate up front, clear ending, unique quiz + flashcards per mission, progress that saves automatically.

- **Live demo v6 (latest, no spam + unique Q&A):** https://focus-edition-v2.netlify.app/
- **Previous demos:** https://access-to-work-edition.netlify.app/ | https://focus-edition.netlify.app/

![Focus Edition logo](assets/logo.png)

## What v6 fixes (Sep 2026)

- ✅ **Missions open guaranteed** — triple fallback: row click + Open button + delegation, searches all editions if selectedEdition null
- ✅ **No toast spam** — removed "Opened: ..." toasts on navigation
- ✅ **Unique Q&A per mission** — 20 seed missions each have own quiz + flashcards, uploaded docs generate 5 unique templates
- ✅ **TTS toggle** — Listen button: first click reads aloud, second click stops (was restarting before)
- ✅ **Focus mode exit obvious** — big pill top-center + ESC key
- ✅ **Unique mission IDs** — `atw_m1`, `pip_m1`, `uni_m1` etc, no more `m1` collisions across editions

## The demo

The DWP Access to Work factsheet — the dense, official kind nobody reads for fun — re-cut into **13 missions**. Each mission has:
- 3-5 min estimate
- Unique body (not same text)
- Unique quiz (e.g. "What is Access to Work?" vs "Will AtW pay for reasonable adjustments?")
- Unique flashcards (Equipment, Travel, UTR, Cap 2026, Relay UK...)
- Mark done, Listen toggle, Prev/Next, Focus mode

Open it and try one: about a minute to feel the difference.

![Demo mission on a phone](assets/demo-screenshot.png)

## Try it

1. Open https://focus-edition-v2.netlify.app/
2. Click "Use demo account (1 click)"
3. My Editions → click any edition card (no toast)
4. Click any mission row → opens mission detail
5. Check quiz: "unique to this mission" — different per mission
6. Flashcards: different per mission
7. Listen → click again to stop

## Tech

Deliberately boring tech: **one HTML file, zero dependencies, zero backend, zero build step.** Works offline, on any device, no account, no app store.

```bash
# run it locally
python3 -m http.server 8000
# open http://localhost:8000
```

Or just double-click `index.html`.

- Tailwind CDN for styling
- localStorage for editions + prefs (v6 keys: fe_auth_v6, fe_editions_v6, fe_prefs_v6)
- Web Speech API for TTS
- Vanilla JS — no framework

## Features

- Dashboard with progress + focus timer (15/25/35/50 min)
- My Editions with search/filter
- Upload New: drop file, photo, sample, or paste text → <5 min conversion → 5 unique missions
- Library templates
- Settings: 5 fonts (Inter, Lexend, OpenDyslexic, Atkinson, Verdana), size/line/letter spacing, Bionic reading with fixation/opacity sliders + live preview, reading ruler, focus mode, high contrast, reduced motion, dark mode
- Edition detail: progress bar, mark all, mission rows with checkbox + Listen + Open
- Mission detail: back, mark done, Listen toggle, focus, unique quiz (2 options, B is correct), unique flashcards (tap to flip), prev/next

## Roadmap

- [x] Access to Work demo edition (13 missions) — v1
- [x] Full-stack app with upload — v2-v4
- [x] Missions open guaranteed + TTS toggle — v4
- [x] Unique missions + no ID collision — v5
- [x] No spam toasts + unique Q&A per mission — v6 (current)
- [x] Landing page + email list
- [ ] PWA packaging (installable, offline-first)
- [ ] Edition-builder engine (convert documents faster, better parsing)
- [ ] Completion analytics (Plausible)
- [ ] Native app wrapper
- [ ] New editions (suggest a document: aa_fitness@outlook.com)

## Contribute / co-found

Looking for a **technical co-founder** (web/mobile) to turn this prototype into an engine + app — equity with vesting. If that interests you, email aa_fitness@outlook.com with something you've shipped.

Bug reports and pull requests welcome. Please keep the zero-dependency, single-file spirit unless there's a strong reason.

## Licences

- **Code:** MIT — see [LICENSE](LICENSE).
- **Access to Work content:** © Crown copyright, reused under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). This is an unofficial adaptation; check GOV.UK for the authoritative text.

## About this repo

Boring documents rebuilt as 4-minute missions for ADHD brains. One HTML file, zero backend, works offline.

Live: https://focus-edition-v2.netlify.app/
