# MemoMind Plugin Ideas, Feasibility & Roadmap

Synthesis of three research documents (read them for evidence and citations):

- [`memomind-glasses.md`](memomind-glasses.md) — the product, its features, ecosystem and shortcomings
- [`competitive-landscape.md`](competitive-landscape.md) — other smart glasses, what users want, emerging ideas
- [`../sdk/SDK_OVERVIEW.md`](../sdk/SDK_OVERVIEW.md) — what the SDK actually exposes (file:line evidence)

Date: 2026-11-01. SDK reference: `memomind-open/plugin-open-platform` @ `171098b`.

> Method note: this is product/market research, not an academic project, so the formal
> research-superpowers phases (design doc → pre-registered plan → BibTeX library) were
> deliberately skipped. Every factual claim lives, with a source, in the three documents above;
> this file is opinion and planning built on them. Where an idea from the competitor research
> conflicts with the SDK's real limits, the SDK wins and the idea is corrected here.

---

## 1. The platform in one page

**MemoMind One** (XGIMI spin-off, CES 2026, $399 street / $599 list): 46.6 g, binocular
monochrome-green micro-LED waveguide, **600×350 4-bit greyscale @ 30 Hz**, 25° FOV, 2,000 nits,
3 mics, speakers, 6-axis IMU, one button, ~16 h battery. **No camera, no Wi-Fi, no GPS.**
Tethered to the phone over Bluetooth.

Two plugin types, which can pair over app-defined Bluetooth channels:

| | Phone **Web plugin** (`.mmpkg`) | Glasses **native plugin** (`.gmp`) |
| --- | --- | --- |
| Runs on | Official App's WebView (iOS/Android) | 32-bit RISC-V MCU (WuQi WQ7036), from Flash |
| Language | HTML / JS (any bundler, vanilla or framework) | C (gnu99, `-Werror`, no libc, no C++) |
| Can use | Internet (`fetch`), phone GPS, **glasses mic (Opus 16 kHz)**, storage + files, button / IMU events, draw on HUD (via `web_bridge`) | LVGL subset, raw framebuffer, button, IMU (raw + gestures), BLE HID accessories (ring, gamepad, keyboard), battery, wear sensor |
| Can't use | Background execution, notifications, contacts/calendar, speaker routing, raw BLE | Mic, speaker, network, persistent storage, wall clock, threads |
| Limits | 10 MB package, foreground only | ≤500 KiB code, <100 KiB static RAM, 1 KiB stack frame, 1 plugin at a time |

Distribution today: **sideload only**, via Desktop Studio (Windows/macOS only — no Linux binary)
→ QR code → App › Memo Lab › Developer Workbench. Developer Workspace is allowlist-only (App
1.3.81). No marketplace, no signing yet. Every glasses build also escrows encrypted source for
MemoMind review.

### The four facts that shape every idea

1. **Intelligence lives on the phone/cloud.** Audio only reaches the Web plugin; the MCU cannot
   hear. Any speech, sound or AI feature = phone-side JS + cloud/WASM, glasses = display.
2. **Foreground only.** Web plugins stop when the App is hidden. "Always-on ambient" features
   are fragile until MemoMind adds background execution.
3. **No camera.** Anything visual-recognition (faces, objects, OCR of the world, ASL recognition)
   is out. That is also the privacy selling point.
4. **Input is scarce.** One button + head gestures, or a BLE ring/gamepad. Design every
   interaction for ≤4 inputs; nod/shake for yes/no is a natural fit.

---

## 2. Built-in features vs. gaps

| Area | MemoMind ships | Gap / complaint → opportunity |
| --- | --- | --- |
| AI assistant | "Hi Memo", undisclosed multi-LLM | Slow, unreliable wake word, no model choice → **bring-your-own assistant** (Claude/GPT/Gemini) plugin. Community already hacks Gemini Live in via Tasker. |
| Captions | Live captions | No speaker labels (diarization), struggles in groups → **diarized captions** |
| Translation | 26–53 languages, lag, censors profanity | → configurable engine, uncensored mode, phrasebook/learning overlay |
| Memory (Memo+ $19.99/mo) | Moments, Wishes, long-term search | "Creepy", inaccurate attribution, no recording indicator, subscription fatigue → **privacy-first, user-owned memory** (opt-in, push-to-capture, local/own-cloud storage) |
| Teleprompter | Basic | → voice-tracked scrolling, talking points from docs, pace meter |
| Navigation | Started only from the phone | No transit, coarse → **walking + transit boards** via phone GPS in a Web plugin |
| Notifications | Mirrored, 4 lines | No triage, no replies; plugins can't read notifications → only via service-specific APIs (Slack, Gmail, Matrix) |
| Dashboard | Head-tilt widgets, RSS, calendar | No third-party widgets → custom dashboard plugin |
| Agents | Memo Agent, OpenClaw | → generic **MCP bridge / agent HUD** |
| Controls | Single button, misclicks | → ring/gamepad support everywhere, nod/shake confirmation patterns |

---

## 3. What we can and can't build

### ✅ Can build today
- Text-first glanceable apps of any kind (dashboards, readers, timers, checklists, flashcards).
- Anything driven by phone internet + phone GPS (weather, transit, sports, stocks, Home Assistant, Notion/Obsidian/Todoist, RSS, calendars via their web APIs).
- Speech features using glasses mic → phone → cloud STT/LLM (captions, translation, assistants, meeting notes, coaching, teleprompter tracking).
- Native C games and UIs with LVGL or raw framebuffer (Tetris/DOOM-class already exist).
- IMU-driven interaction (head gestures, posture, head-pointer cursor, motion games).
- BLE accessory input (KiWear ring, gamepads, keyboards, clickers) to native plugins.
- Images/animations streamed from phone as LZ4 GRAY_4 tiles (QR codes, charts, maps as images, simple video-ish animation).
- Third-party native clients speaking the public BLE business protocols (HUD text, teleprompter, mic Opus stream, HOGP) — e.g. a desktop app that drives the HUD directly.

### ⚠️ Partially / with workarounds
- **Always-on/ambient** features — only while the App's plugin is in the foreground.
- **Audio output** — no TTS/playback API; browser `<audio>`/Web Speech may route over HFP, OS decides. Treat audio feedback as best-effort.
- **On-device (offline) speech** — Whisper/Vosk via WASM in a WebView is possible but heavy on phone battery; cloud is the practical default.
- **Wall-clock time on glasses** — must be sent from the phone.
- **Persisting glasses state** — store on phone (`gm.storage`) and resync on load.
- **Navigation maps** — render as image tiles from the phone; turn-by-turn arrows are easy, real maps are bandwidth-heavy.
- **Sharing plugins with others** — LAN sideload via Studio; no store until MemoMind ships one.

### ❌ Can't build (blocked by hardware or SDK)
- Camera anything: face recognition, object ID, visual OCR, ASL recognition, photo capture.
- Reading phone notifications/SMS/contacts/call control from a plugin.
- Replacing the "Hi Memo" wake word or firmware behaviours; OTA, power, charging control.
- Mic access or on-MCU audio ML in a `.gmp` (mic is phone-only).
- Haptics/vibration (none found).
- Running multiple plugins concurrently / background widgets on glasses.
- Colour graphics.
- Installing to glasses without the official App (install wire protocol is withheld).
- Running/simulating `.gmp` on Linux with the official Studio (Windows/macOS only).

---

## 4. Tech stacks

**Phone side (Web plugin)**
- Vanilla JS or TypeScript + esbuild/Vite producing a static bundle; keep it small (10 MB cap). PhoneSDK ships `gm-plugin-web-sdk.esm.js`.
- UI on phone: plain HTML/CSS, Preact/Lit/Svelte (light frameworks suit the WebView).
- HUD rendering: `gm.display.updateText` for ≤16 text objects; for rich layouts render to an offscreen `<canvas>` → quantise to 4-bit grey → LZ4 → `updateFrameImageLz4` tiles. A shared **HUD-canvas helper** is worth building once.
- Speech-to-text: Deepgram / AssemblyAI / Speechmatics (streaming + diarization), OpenAI or Gemini realtime; offline fallback whisper.cpp-WASM / Vosk-WASM.
- Opus handling: PhoneSDK `opusRecordingToOgg`; for streaming decode, `opus-decoder` (WASM) → PCM if the STT needs PCM.
- LLM: Claude API (latest Claude models) for summarisation, assistants, coaching; tool use/MCP for agent features.
- Secrets: never put API keys in the `.mmpkg`. Use a tiny proxy (Cloudflare Workers / Vercel functions) or let users paste their own key into `gm.storage`.

**Glasses side (native plugin)**
- C gnu99, xPack `riscv-none-elf-gcc` 15.2.0-1 (auto-downloaded by `build.py`), CMake + Ninja, PyNaCl.
- Firmware LVGL subset (labels, arcs, lines, 4-bit images, frame animation, 2 fonts) or raw framebuffer slices.
- Fixed-point/float (`rv32imafc` has single-precision FPU), static allocation, no blocking.

**Backend (optional)**
- Cloudflare Workers + Durable Objects (WebSocket relay for agents/MCP), or Vercel/Supabase. Storage for user-owned memory: Supabase/Postgres+pgvector, or user's own Notion/Obsidian.

**Dev environment**
- This cloud container: can build Web plugins and (after installing PyNaCl + toolchain) `.gmp` files.
- To preview/install `.gmp`: Windows or macOS machine with Desktop Studio + glasses + App (allowlisted Developer Workspace).

---

## 5. Big list of ideas

Legend — **Arch**: W = Web plugin, G = glasses native, W+G = paired, +C = needs a cloud service.
**Feas**: ✅ now · ⚠️ with caveats · 🔒 blocked until MemoMind adds an API. **Effort**: S (days) · M (1–3 weeks) · L (month+).

### A. Communication & accessibility
| # | Idea | Arch | Feas | Effort |
|---|---|---|---|---|
| 1 | **Diarized live captions** — speaker tags ("A:", "B:", or learned names), confidence fade, nod = rewind 30 s | W+C | ✅ | M |
| 2 | Captions + translation side-by-side, uncensored mode, pick engine | W+C | ✅ | M |
| 3 | Sound-awareness alerts (doorbell, alarm, baby, name called) via phone-side audio classifier (YAMNet-WASM) | W | ⚠️ foreground | M |
| 4 | Text → ASL fingerspelling / gloss slides for learners | W | ✅ | S |
| 5 | Conversation "lost the thread" recap: tap → last 60 s summarised | W+C | ✅ | S |
| 6 | Accent/fast-speaker slow-down: captions with key-term highlighting | W+C | ✅ | M |
| 7 | Silent reply: dictate → refine with LLM → copy/send via web APIs (Slack, Telegram bot, Matrix) | W+C | ✅ | M |
| 8 | Lecture mode: captions + glossary of technical terms + exportable notes | W+C | ✅ | M |

### B. AI assistants & agents
| # | Idea | Arch | Feas | Effort |
|---|---|---|---|---|
| 9 | **Bring-your-own assistant** (Claude/GPT/Gemini): button push-to-talk → answer on HUD, optional browser TTS | W+C | ✅ (no wake word) | S–M |
| 10 | **Glasses MCP bridge**: cloud relay exposes `hud.show`, `hud.ask(yes/no)`, `mic.listen` as MCP tools to any agent | W+C | ✅ | M |
| 11 | **Agent approval HUD**: Claude Code / CI / deploy prompts appear; nod = approve, shake = deny | W+C (+G optional) | ✅ | S–M |
| 12 | Conversation context assistant: definitions, names, follow-up questions only on pauses | W+C | ✅ | M |
| 13 | Meeting copilot: live action-item extraction, "you were asked a question" alert | W+C | ✅ | M |
| 14 | Proactive "interruptibility" scheduler: queue non-urgent cards until IMU says you're still and nobody is speaking | W(+G) | ✅ | M |
| 15 | Voice-to-plugin generator: describe a mini-app, LLM generates a Web plugin from the starter template | W+C (dev tool) | ⚠️ sideload | L |
| 16 | Personal research assistant: ask about your own notes/library (RAG over Zotero/Obsidian export) | W+C | ✅ | M |

### C. Memory & productivity
| # | Idea | Arch | Feas | Effort |
|---|---|---|---|---|
| 17 | **Privacy-first memory** — push-to-capture only, visible "REC" on HUD, user-owned storage (own Notion/Obsidian/Supabase), auto-expiry | W+C | ✅ | M |
| 18 | Voice "who is this / what did we last discuss" from your own tagged notes (no face/voiceprint by default) | W+C | ✅ | M |
| 19 | Teleprompter Pro: voice-tracked scroll, talking points from uploaded docs, WPM pace meter, slide-cue sync | W+C (+G) | ✅ | M |
| 20 | Markdown/Obsidian/Notion reader with head-tracked scroll | W (+G) | ✅ | S |
| 21 | Todoist/Things/Notion task HUD: next task, nod to complete | W+C | ✅ | S |
| 22 | Calendar "next up" card + leave-now alerts (from web calendar APIs) | W+C | ✅ | S |
| 23 | Recipe / procedure stepper (cooking, lab protocols, repair guides) with head-nod next | W (+G) | ✅ | S |
| 24 | Checklist runner (pre-flight, packing, lab safety) | G or W | ✅ | S |
| 25 | Clipboard / TOTP code viewer (2FA) | W | ✅ | S |
| 26 | Quick capture: button → voice note → transcribed to inbox (Obsidian/Notion/email) | W+C | ✅ | S |

### D. Navigation, travel & outdoors
| # | Idea | Arch | Feas | Effort |
|---|---|---|---|---|
| 27 | Walking turn-by-turn arrows + distance (OSRM/Mapbox, phone GPS) | W+C | ⚠️ foreground | M |
| 28 | Live transit departure board for nearest stop (GTFS-RT, Transitland, local APIs) | W+C | ✅ | S–M |
| 29 | Travel phrasebook + live translation for signs you read aloud | W+C | ✅ | S |
| 30 | Hiking: bearing to waypoint, elevation, sunset countdown | W | ⚠️ foreground | M |
| 31 | Cycling/running HUD: pace, distance, BLE heart-rate (via phone Web Bluetooth where supported) | W | ⚠️ | M |
| 32 | Flight/train status card for your booked trips | W+C | ✅ | S |

### E. Health, focus & wellbeing
| # | Idea | Arch | Feas | Effort |
|---|---|---|---|---|
| 33 | **Focus kit (ADHD-friendly)**: single-task HUD, Pomodoro, gentle re-focus nudges, time-blindness visual timer | G (+W) | ✅ | S–M |
| 34 | IMU posture coach (head-forward detection) | G | ✅ | S |
| 35 | 20-20-20 eye-break / screen-fatigue reminders using wear sensor | G | ✅ | S |
| 36 | Breathing / box-breathing visual guide | G | ✅ | S |
| 37 | Speech coach: filler-word counter, pace, volume (phone-side audio) | W+C | ✅ | M |
| 38 | Medication / hydration reminders (phone-scheduled while App open) | W | ⚠️ foreground | S |
| 39 | Workout interval timer with rep counter via IMU | G | ✅ | S |

### F. Home, work & integrations
| # | Idea | Arch | Feas | Effort |
|---|---|---|---|---|
| 40 | Home Assistant HUD: state cards, nod to toggle scenes | W+C | ✅ | S–M |
| 41 | Now playing + synced lyrics (Spotify/LRCLIB) | W+C | ✅ | S |
| 42 | Dev dashboard: CI status, PR reviews, on-call alerts (GitHub/PagerDuty webhooks via relay) | W+C | ✅ | S–M |
| 43 | Stock/crypto/sports live ticker | W+C | ✅ | S |
| 44 | Presentation remote: ring/button advances slides on laptop + notes on HUD | W+C | ✅ | M |
| 45 | Desktop companion (native BLE client): show laptop notifications / build output on HUD without the phone | native desktop app | ✅ via public BLE protocol | M–L |
| 46 | Warehouse/field-work pick list with ring scanner input | W+G | ✅ | M |

### G. Learning
| # | Idea | Arch | Feas | Effort |
|---|---|---|---|---|
| 47 | FSRS spaced-repetition flashcards (Anki deck import), nod = know / shake = again | W+G | ✅ | M |
| 48 | Language immersion: overheard words → glossary + quiz later | W+C | ✅ | M |
| 49 | Kanji/vocab ambient trainer | G (+W) | ✅ | S |
| 50 | Reading companion: audiobook/podcast transcript sync on HUD | W+C | ⚠️ audio routing | M |

### H. Games & fun (native showcase)
| # | Idea | Arch | Feas | Effort |
|---|---|---|---|---|
| 51 | Head-steered games (IMU tilt) — racer, maze, balance | G | ✅ | S–M |
| 52 | Chess vs. engine (phone Stockfish-WASM) or vs. friend online | W+G | ✅ | M |
| 53 | Multiplayer trivia/party game across several glasses wearers (cloud lobby) | W+C | ✅ | M |
| 54 | Interactive fiction / text adventure with voice commands | W+C | ✅ | S–M |
| 55 | "Codec call" stylised call UI (community request) | G | ⚠️ no call data | S |

### I. Developer tooling & platform (high leverage — everyone benefits)
| # | Idea | Arch | Feas | Effort |
|---|---|---|---|---|
| 56 | **Open-source `.gmp` host emulator for Linux/macOS/Windows** — implement the host/LVGL tables against SDL so plugins compile and run on desktop | tooling | ✅ (host build is plain C) | L |
| 57 | **HUD-canvas library**: draw with Canvas2D/HTML → 4-bit dither → LZ4 tiles → diff updates | W lib | ✅ | M |
| 58 | Text layout & pagination library for 600×350 (word wrap, CJK, scroll, ellipsis) | W + G lib | ✅ | M |
| 59 | Widget kit for the LVGL subset (list, menu, button-focus model, toast, progress) | G lib | ✅ | M |
| 60 | Community plugin index / "awesome-memomind" with build-and-QR pipeline (until the official store exists) | site | ✅ | S |
| 61 | GitHub Action: build `.gmp` + `.mmpkg`, ABI check, attach to releases | CI | ✅ | S |
| 62 | Input abstraction: same plugin works with button, head gestures, ring, gamepad | G + W lib | ✅ | S–M |
| 63 | Cloud relay template (Workers + Durable Objects) for push-to-glasses from any webhook | +C | ✅ | S–M |

---

## 6. Standout ideas worth building

These combine a real, documented gap with something the SDK allows today:

1. **Glasses MCP bridge + agent approval HUD (#10, #11).** Makes MemoMind a "head-up terminal" for
   any AI agent: agents push status, ask yes/no, and you nod. Almost nobody has done this for
   MemoMind; there are ~25 equivalents on Even G2, which proves demand. Small to build, and every
   later AI plugin can reuse it.
2. **Diarized, privacy-first captions (#1, #17).** Fixes MemoMind's two loudest criticisms at once:
   captions that fall apart in groups, and "creepy" always-on recording. Push-to-capture, a visible
   REC indicator, and data stored where the user chooses.
3. **Bring-your-own assistant (#9).** The built-in AI gets called slow, and the community is already
   hacking Gemini in. A clean, sanctioned Claude/GPT/Gemini plugin is an easy win.
4. **`.gmp` desktop emulator + HUD-canvas library (#56, #57).** Developer tools that remove the
   Windows/macOS-only Studio bottleneck and the hardest rendering work. High community value, and
   good portfolio work.
5. **Interruptibility scheduler (#14).** Uses IMU stillness, speech activity and calendar context to
   time proactive cards, based on research such as ProMemAssist (UIST '25). It can sit under any
   dashboard or assistant plugin.

## 7. What might suit you specifically

Based on your environment (academic-research tooling, Hugging Face, coding agents), these look
like the best personal fits. Correct me if your use-case differs:

- **Research companion (#16, #8, #26):** voice-query your own notes/library, lecture captions with
  glossary, and quick voice capture into your notes inbox.
- **Agent HUD (#10, #11, #42):** keep an eye on Claude Code / CI runs while away from the screen.
- **Reader + teleprompter (#19, #20):** read papers/notes or give talks hands-free.

## 8. Platform improvements to request from MemoMind

Issues worth filing (or contributing upstream) because they unlock many ideas:

1. Background execution for Web plugins (ambient captions, nav, reminders).
2. Notification access API (read/filter/reply) with user consent.
3. Audio playback/TTS API with explicit speaker routing.
4. Persistent KV storage for `.gmp` (already on their list).
5. Linux Desktop Studio build (or open-source the `.gmp` simulator).
6. Wall-clock/time-zone in the native ABI.
7. More LVGL widgets/fonts, custom font loading (CJK, icons).
8. Network permission scoping by domain (privacy) — currently unscoped.
9. A bystander-visible recording indicator (hardware) — the top privacy complaint.
10. Public plugin signing + marketplace timeline.

## 9. Suggested next steps

0. Follow [`../GETTING_STARTED.md`](../GETTING_STARTED.md): run GM Breakout in Studio, then on
   your glasses. Note that Studio refuses QR delivery without the `.review*` sidecars ("Missing
   build review snapshot"), so builds must go through `build.py` with PyNaCl. Installed plugins
   persist as saved entries in the App.
1. **Pick 1–2 first projects** from §6 or §7.
2. Set up the build in this repo: copy a starter from the SDK's `memomind-example-app` skill and get
   `./build.py web` green here. Add the toolchain + PyNaCl for `glass` builds.
3. Join the **Developer Workspace allowlist** (App ≥1.3.81) so you can install on your glasses.
4. If you're on Linux, arrange a Windows/macOS machine for Desktop Studio, or build idea #56 first.
5. Add CI (#61) so every push produces installable packages.
