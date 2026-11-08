# Smart-Glasses Competitive Landscape (2025–2026) and Portable Feature Ideas for MemoMind

*Research date: 2026-11-01. Scope: display-equipped and adjacent smart glasses, their developer ecosystems, user demand, recurring shortcomings, and emerging ideas, filtered for portability to MemoMind (HUD display, mic, speaker, IMU, touch input; on-glasses plugins in C on a RISC-V MCU; phone-side JavaScript web plugins; BLE tether; assumed no camera).*

> Method note: claims are taken from vendor pages, developer docs, reviews, and papers cited inline as [n]. Several products are pre-release or crowdfunded, and spec/price figures conflict between sources; where they do, that is flagged. Reddit could not be queried directly, so user-demand evidence relies on reviews, forums (HearingTracker, Meta community forums), subreddit snapshots, and what community developers actually build.

---

## 1. Feature comparison

Legend: ● shipped/first-party · ◐ beta, limited, or third-party/community · ○ absent · ? unconfirmed/pre-release

| Product (status) | Display | Camera | Captions | Translation | Teleprompter | Navigation | Notifications/Dashboard | AI assistant | Proactive / context AI | Memory / notes | Input | Battery (claimed) | Dev platform |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Even Realities G2** (shipping, $599) | Dual 576×288 mono green micro-LED [1] | ○ [3] | ● "Conversate" live transcript [3]; speaker labels planned [7] | ● 35 languages [3] | ● voice-tracking scroll [3] | ● walking/cycling, no transit [4][6] | ● widget dashboard (Health, QuickList, Calendar, Stocks, News) [4] | ● "Hey Even" [3] | ● Conversate AI cues/bios; Prep Notes talking points from uploaded docs [3][5] | ● AI summary saved in app [3] | Temple touchpads + optional R1 ring ($249) [1][6] | Up to 2 days; case +7 charges [4] | Even Hub: TypeScript web app in phone WebView, `.ehpk` packages, app store [1][5] |
| **Even Realities G1** (legacy) | Mono green HUD | ○ | ● | ● | ● | ● | ● | ● | ◐ | ◐ | Touch | — | Community BLE SDKs/reverse engineering; supported by MentraOS [2][8] |
| **Mentra Live** (shipping, $299) | ○ none [11] | ● | ◐ (camera-first device) [10] | ● | — | — | ● | ● | ● (Merge app) [9] | ● Notes, Recorder [9] | Voice/buttons | — | MentraOS (Apache-2.0), MiniApp Store, TypeScript SDK in beta [8][10] |
| **Meta Ray-Ban Display + Neural Band** (US, $799) | 600×600 full-colour, right eye only [13][15] | ● | ● beam-formed to speaker; also on WhatsApp/Messenger calls [13][14] | ● EN/ES/FR/IT [13] | ◐ | ● walking, beta, 32 cities [14] | ● Meta apps; "handful of apps" [15] | ● Meta AI | ◐ | ○ | EMG wristband gestures + neural handwriting [14][15] | ~6 h glasses; band 18 h [16] | Device Access Toolkit (Swift/Kotlin) + web apps (HTML/JS) dev preview, May 2026 [17][18] |
| **Brilliant Labs Halo** (shipping, $299→$399) | Colour micro-OLED, no prism [20][21] | ● optical sensor [21] | ◐ | ● [20] | — | — | ◐ | ● Noa | ● ambient context [20] | ● "Narrative" agentic memory [20] | Voice, IMU [21] | Up to 14 h [20] | Zephyr + on-glasses Lua VM over BLE; "vibe mode" voice app-building; Noa+ $19.99/mo [19][21] |
| **Brilliant Labs Frame** (legacy) | Colour micro-OLED | ● | ◐ | ● | — | — | — | ● Noa | — | — | Tap/IMU | — | Phone/PC host app + on-glasses Lua; Python/Flutter SDKs; Noa open source [22] |
| **Rokid Glasses** ($499–$599) | Dual micro-LED green [24] | ● 12 MP [24] | ● | ● 89 languages, cloud-dependent [23][24] | ● (visible to audience) [23] | ● [24] | ● | ● | ◐ | ◐ | Touch, voice | Up to 8 h [24] | CXR-M (phone) / CXR-S (glasses) SDKs, app store, no-code AIUI Studio, 500+ agents [25][26] |
| **Halliday** ($489 retail) | "DigiWindow" near-eye module, invisible to others [27][28] | ○ | ● | ● | ● | ● | ● | ● | ● proactive conversation listener, fact-checking [28][63] | ◐ | Ring + voice | — | Closed |
| **Vuzix Z100** | Mono green waveguide, 36–38 g [30][31] | ○ | ◐ via apps (e.g. TranscribeGlass) [54] | ◐ companion app [30] | ● companion app [30] | ◐ | ● selectable app alerts [30] | ◐ | — | — | Temple touchpad | Up to 48 h [30] | Ultralite SDK (Android/iOS, licence-gated) [29][62]; MentraOS support [8] |
| **RayNeo X3 Pro** | Binocular colour micro-LED, up to 6,000 nits [34] | ● | ● | ● | ● | ● | ● | ● Gemini Live [33] | ◐ | ◐ | Touch, voice | "alarming" short battery [34] | Android-based; "app virtual machine"; ADB sideloading is hard [33] |
| **INMO Go 2 / Go 3 / Air 3** | Mono/colour HUD | Go: ○ | ● | ● (11–40+ languages, conflicting) [36] | ● with ring [36] | ● (Go 3) [35] | ● | ● | — | ● "AI Flash Notes" summaries [36] | Ring, touch | Go 3 ~3 h translation [35] | Mostly closed |
| **Xreal One Pro / Project Aura** | Birdbath virtual screen / 70° optical see-through (Aura) [32] | Aura ● | — | — | — | — | — | Gemini (Aura) [32] | — | — | Puck touchpad + hand tracking [32] | Tethered | Android XR (Aura) [32] |
| **Samsung/Google Android XR glasses** (fall 2026) | ○ first gen; display later [37] | ● | ? | ● [37] | ? | ● [37] | ● | ● Gemini | ● multimodal | ? | Voice, touch | Up to 9 h [37] | Android XR |
| **Apple "N50"** (rumoured, late 2027) | ○ first version [38] | ● two cameras [38] | ? | ? | ? | ? | ? | Apple Intelligence | ? | ? | ? | ? | — |
| **Snap Specs** (consumer 2026, ~$2,500 reported) | Full AR | ● | ? | ● [39] | ? | ? | ? | Gemini/OpenAI [39] | ? | ? | Hand gestures [39] | ? | Snap OS 2.0, Lenses, WebXR [39] |

**Closest analogues to MemoMind:** Even Realities G1/G2 (camera-less mono HUD, BLE, phone WebView apps, touch + ring), Vuzix Z100 (camera-less mono HUD, phone SDK), and Halo (MCU-class glasses with on-device scripting over BLE). Halo's Zephyr + Lua VM on a Cortex-M55 [21] is the nearest parallel to MemoMind's C-on-RISC-V plugins; Even Hub's WebView model [1] is the nearest parallel to MemoMind's phone-side JS plugins.

---

## 2. Developer ecosystems

### Even Realities (Even Hub, G2)
- **Model:** apps are web pages running in a WebView inside the Even phone app, which relays calls over BLE. SDK is the npm package `@evenrealities/even_hub_sdk` with typed display, input, audio, device-info and storage methods; apps must `await waitForEvenAppBridge()` before any call or calls silently no-op. Manifest `app.json`; packages are `.ehpk` [1].
- **Store:** Even Hub launched March 2026 alongside Prep Notes [5].
- **Community scale:** the *awesome-even-realities-g2* list catalogues roughly 300 open-source projects across productivity, navigation/transit, smart home/car, fitness, finance, speech, games, media, streaming and AI-agent integrations [2]. Notable community tooling: simulators (`even-dev`), pixel-accurate text measurement (`even-toolkit`), a 24×24 1-bit icon studio, a phone-sensor bridge (`appsbridge`) that exposes magnetometer/steps/GPS the WebView lacks, a push-to-talk STT shim, a tile-diff framebuffer library (`Glyph`), custom firmware with compressed image transfer (`g2flash`), and a damage-batching window manager that packs per-frame screen changes into one BLE message [2].
- **Cross-device SDK:** `xg-glass-sdk` offers one API across G2, Rokid, Meta Ray-Ban, Frame, RayNeo and INMO [2].

**Most representative community apps (all [2]):**
| Category | Examples |
|---|---|
| Speech & captions | `G2 Captions` (AssemblyAI/OpenAI Realtime), `soniox-translate`, `Convo Exchange` (keyword detection), `speechcoach-g2` (pacing coach with VU meter), `PitchBeam` (teleprompter + pace feedback), `Lingua Franca` / `lingua-lens` (language coach that suggests phrases only when you stall) |
| AI & agents | `Cue` (live conversation coach, Deepgram + Claude), `even-g2-agentic-app` (MCP tools + widgets), `men-g2-ble-gateway` (G2 exposed over HTTP/WebSocket/MCP), ~25 Claude Code / Codex remote-control HUDs (approve prompts by tap, dictate commands), local-LLM assistants (Ollama/Whisper) |
| Memory | `Even Reality Memory System` (ambient memory, meeting transcription with on-lens cues), `Cue (ambient memory)` (local voiceprints + speaker context via Resemblyzer/Whisper) |
| Productivity | Obsidian (`g2sidian`, `even-g2-obsidian`), Notion, Todoist, Google Keep, Gmail, Matrix/Telegram readers with voice reply, `powerslides` (slide control + speaker notes), `Pulse`/`Glance` dashboards, Pomodoro, TOTP authenticator, EPUB/PDF readers, `Nutshell` (AI summaries of articles) |
| Navigation/transit | Mapbox driving nav, motorcycle HUDs, live transit boards (NYC, DC, BART, Paris, Helsinki, NS), compass, geocaching, peak radar, point-of-interest storytelling |
| Smart home/car | Home Assistant, HomeKit bridge, Tesla, Hyundai/Kia, Bambu 3D printer, MacroDroid triggers |
| Fitness/health | Hevy workouts, running pace, golf caddie, `EyeFit` (IMU-driven eye exercises), `BreakMate` break reminders, quit-smoking tap logger |
| Audio-sensing | `Birdie` (ambient bird ID), `MuSe` (song ID), guitar/multi-instrument tuners, `Applied Resonance` (learns a healthy machine's sound and warns on change), `Taraweeh Companion` (recitation tracking) |
| Games & learning | Chess (Stockfish WASM), Solitaire, Tetris, Snake, Pong, raycaster dungeon, card packs, FSRS spaced-repetition flashcards (Anki import), `gloss` (text → ASL slides) |

### Mentra (MentraOS, formerly AugmentOS)
- Apache-2.0 open-source OS; "write once, run on any smart glasses" across Mentra Live, Even G1/G2, Vuzix Z100 and NIMO. Apps run on the phone inside the Mentra Runtime, and **multiple apps run simultaneously** through one shared glasses connection (captions + notes + notifications + dashboard + AI together) [8]. SDK is in beta [10]; backend can be self-hosted [8].
- **MiniApp Store first-party apps:** Captions, Livestreamer, Mentra AI, Mentra Call (Zoom/Meet/Teams), Mentra Maps, Mentra Notes, Merge ("answers, definitions, and context as your conversations unfold"), Recorder, Teleprompter, Translation [9].

### Meta (Ray-Ban Display)
- Developer preview (May 2026): **Device Access Toolkit** for iOS/Android adds session-based display output to existing phone apps over BLE (one display per session) [17]; **Web Apps** in HTML/CSS/JS run on the glasses without a companion app; input via touch and Neural Band EMG gestures; distribution through password-protected URLs or test channels of up to 100 testers [18]. Third-party agent tooling has appeared, e.g. an MCP server that helps coding agents add Meta glasses capabilities to apps [56].

### Brilliant Labs (Frame, Halo)
- Frame: phone/PC host app talks BLE to on-glasses Lua; Python and Flutter SDKs; Noa's Flutter source is published as a reference [22]. Halo: Zephyr OS + Lua VM on an Alif Balletto (Cortex-M55 + Ethos-U55 NPU); display draws are immediate (no double buffer); scripting/remote access over BLE without proprietary tools [21]; voice "vibe mode" app creation [20].

### Rokid
- CXR-M (phone) + CXR-S (glasses, YodaOS-Sprite) SDK pair, an app store, a no-code AIUI Studio; Rokid reports ~35,000 developers and 500+ agents in its Agent Store [25]; community list at *awesome-rokid* [26].

### Vuzix
- Ultralite SDK for Android (JitPack, Android 12+, needs Vuzix Connect) and iOS (SwiftPM), behind a licence/confidentiality agreement, with public sample apps [29][62].

**Takeaways for MemoMind's ecosystem:** (a) the winning pattern is phone-side web apps with a thin glasses runtime [1][8][18]; (b) developers repeatedly build bridges for missing phone capabilities (GPS, compass, media session, STT) [2], so MemoMind's JS host should expose these first-class; (c) concurrency of multiple apps (Mentra) [8] and a glanceable dashboard with pinnable widgets (Even) [4] are differentiators; (d) a simulator, pixel-accurate text measurement and an icon tool are table stakes for developer adoption [2]; (e) an MCP bridge to the glasses is already a community pattern [2][56].

---

## 3. User demand: most-loved and most-requested features

| Feature | Evidence of demand | Notes / gaps users report |
|---|---|---|
| **Live captions** (DHH accessibility) | Reviewers call Meta's captions "genuinely transformative for hard-of-hearing users" [13]; Conversate repeatedly cited as G2's standout feature [3]; dedicated products (XRAI, TranscribeGlass on Z100 with <300 ms claimed latency, Captify) exist for this alone [53][54][55] | Struggle with noise, accents, lag and multiple speakers [51]; lack of speaker labels (Even says planned) [7]; HearingTracker users feel Even emphasises translation/AI over captioning [7] |
| **Translation** | Headline feature on nearly every display glasses (Even 35 langs, Rokid 89, Meta 4, INMO, Halliday) [3][13][23][36] | Cloud dependency causes lag [23]; language lists vary [36] |
| **Teleprompter / speaker notes** | First-party on Even, Mentra, Rokid, INMO, Vuzix [3][9][23][30][36]; Even extended it into Prep Notes (talking points from uploaded docs) [5]; community builds pace coaches and slide-note readers [2] | Some displays leak light so audience can see text [23] |
| **Navigation** | Present on Even, Meta, Rokid, Mentra, INMO [4][14][24][9][35]; many community transit/nav apps [2] | No public-transit routing on Even or Meta [6][13]; limited city coverage [14]; phone still needed for map context [51] |
| **Notifications & dashboard** | Most common feature across categories [51]; Even dashboard widgets [4]; Z100 per-app filtering [30] | Message replies "wonky" on Meta [15]; filtering/prioritisation matters |
| **AI assistant (voice Q&A)** | Universal ("Hey Even", Meta AI, Noa, Gemini) [3][20][33] | Value perceived as weaker than glanceable utilities in one long-term review [6] |
| **Proactive conversation context** | Halliday's pitch [28], Even Conversate/Prep Notes [3][5], Mentra Merge [9], many community "coach" apps [2] | Some reviewers find it "nosey" [28]; Halliday's proactive demo was not ready at CES [27] |
| **Memory aid / face-name recall** | Halo's Narrative memory [20]; community ambient-memory and voiceprint apps [2]; research prototypes for cognitive decline [47] | No shipped mainstream face-recall product; privacy concerns [20] |
| **Fitness / health** | Even Health widget [4]; Z100 fitness [30]; community workout, running, golf, break-reminder apps [2] | |
| **ADHD / focus aids** | Pomodoro, break reminders, task-focus HUDs built by community [2]; ADHD-specific glasses remain concepts [47] | Under-served niche |
| **Hands-free input** | Meta's Neural Band is the most praised input in reviews [15]; G2's R1 ring called "clutch" by a daily user [6] | |
| **Community wishlist signals** | r/EvenRealities (~9k members) feature requests include a "MGS-style codec" call UI and a Kanji study app [52]; Meta forum has a dedicated feature-request/UX thread for Display + Neural Band [59] | |

---

## 4. Common shortcomings and workarounds

| Shortcoming | Evidence | How products work around it | Implication for MemoMind |
|---|---|---|---|
| **Battery life** | Top adoption blocker in 2026 coverage [49]; RayNeo X3 Pro "alarming" [34]; Meta Display ~6 h plus separate band charging [16]; Meta Display 45 min–6 h in one long-term test [50] | Drop the camera (Even's camera-less G2 lasts far longer, up to 2 days [4][6]); mono micro-LED; charging cases (+7 charges) [4]; push compute to phone/cloud [1][8] | Keep the MCU plugin layer event-driven; render only diffs; let the phone do STT/LLM |
| **Display legibility** | Meta Display struggles in direct sun per one review [50]; RayNeo reaches 6,000 nits [34]; small 576×288 mono canvases force careful typography [1] | Pixel-accurate text measurement and pagination libraries [2]; high-nit micro-LED [34]; sunglass clip-ons [33] | Ship a text-layout/pagination helper and glanceable widget templates |
| **Latency / BLE bandwidth** | Community firmware adds compressed image transfer and batches screen damage into one BLE message to cut latency [2]; slow image handling fixed by mods [2] | Tile-diff rendering (`Glyph`), compressed images, text-first UIs [2] | Favour text and vector primitives on-glasses; diff-based framebuffer updates over BLE |
| **Input friction** | Neural Band has a learning curve [13]; G2 needs a $249 ring for comfortable control [6]; X3 Pro "far from easy to use" [33] | EMG band [15]; ring with same gestures as temples [1]; voice; IMU head gestures (e.g. `EyeFit`) [2] | Design every plugin for 4 gestures (tap, double-tap, swipe up/down) + optional IMU nod/tilt |
| **Privacy / social acceptance** | Privacy and social reactions follow battery as top complaints, especially for cameras [49]; Apple delaying to refine privacy message [38] | Camera-less design marketed as privacy-first (Even) [3]; Conversate processes audio without storing it [3] | No-camera is a selling point; offer on-device/opt-in audio retention and visible recording indicators |
| **Phone dependence / missing APIs** | Even WebView lacks GPS/compass, prompting bridge apps [2]; Halo/Frame rely on host apps [21][22] | Phone-sensor bridges [2]; standalone web apps on Meta [18] | Expose GPS, compass, step count, media session, calendar and notifications to JS plugins natively |
| **App scarcity / closed platforms** | Meta Display works with "a handful of apps" at launch [15]; Vuzix SDK licence-gated [29] | Open SDKs, app stores and community lists (Even Hub, MentraOS) [1][8] | Open SDK + simulator + store are competitive levers |
| **Captions quality in groups** | Noise, accents, multiple speakers [51]; no diarization yet on Even [7] | Beam-forming mics toward the person in front [13]; directional mics (Captify) [53] | Diarized, directional captions are a gap to fill |
| **Weight / comfort / monocular strain** | Meta Display 69 g "too chunky" and monocular display strains eyes [15] | Lightweight frames (Halo ~40 g, Z100 36–38 g) [21][31] | — |

---

## 5. Novel and emerging ideas

| Idea | Source | Fit for MemoMind (no camera) |
|---|---|---|
| **Proactive timing based on cognitive load** — ProMemAssist models the user's working memory from sensor signals to decide *when* to interrupt [44] | UIST '25 [44]; AI4Service framing of reactive→proactive glasses [58] | High: an "interruptibility" scheduler using IMU motion, speech activity and calendar |
| **Interest-driven glanceable visualisations** shown without explicit request (weather, traffic) [45] | Memento [45] | High: proactive dashboard cards |
| **Always-on agents with task delegation by speech** [46] | VisionClaw on Ray-Ban Meta [46] | Medium–High (audio-only variant) |
| **MCP-connected glasses** — glasses exposed as MCP tools; agents push widgets to the HUD [2][56] | `even-g2-agentic-app`, `men-g2-ble-gateway` [2]; Extentos MCP [56] | High: phone-side MCP server exposing `display.show`, `notify`, `ask_user` |
| **Coding-agent HUD** — approve/deny Claude Code or Codex prompts by tap, dictate commands [2] | ~25 community projects [2] | High, very cheap to build |
| **Conversation coaching** — sales objection cues, language-learning phrase prompts that appear only when you stall, speech pacing [2] | `SalesEye`, `lingua-lens`, `speechcoach-g2` [2] | High |
| **Social cue coaching for autism** | Brain Power smartglasses well tolerated by 91% of 21 participants [43] | Medium (audio prosody/turn-taking cues only, no face reading) |
| **Sound awareness visualisation for DHH users** — sound identity + direction + captions [40]; user-authored sound-reactive interfaces via natural language [41]; HMD sound-viz design probes [42] | HoloSound [40], SonoCraftAR (ISMAR '25) [41], GlassEar [42] | High: on-MCU sound classifier (doorbell, alarm, name called) with direction if mic array allows |
| **Speaker-diarized subtitles** | Speaker transitions flagged as a key problem in group conversations [42]; diarization planned but not shipped on Even [7]; voiceprint-based community memory app [2] | High differentiator |
| **Sign language** — camera-based ASL→English (SignGlass) [48]; speech/text→ASL slides on HUD [2] | SignGlass [48]; `gloss` [2] | Text→ASL fingerspelling/gloss slides feasible; ASL recognition needs a camera |
| **Face/person memory for cognitive decline** [47] | Hackathon prototype [47] | Voice-only variant (voiceprint + conversation history) [2] |
| **Acoustic anomaly detection** (machine health), ambient bird/song ID [2] | Community apps [2] | High for on-device audio ML |
| **Voice "vibe-coding" of mini-apps on the glasses** [20] | Halo vibe mode [20] | Medium: LLM generates JS plugin from a spoken description |

---

## 6. Top portable feature ideas for MemoMind (ranked)

1. **Diarized live captions + translation** with speaker tags, confidence fade, and a "rewind last 30 s" gesture (phone-side STT; MCU renders a scrolling caption buffer). Fills a stated gap [7][42][51].
2. **Glanceable dashboard with pinnable widgets** (time, next event, weather, tasks, battery, unread count) and a proactive card slot driven by an interruptibility scheduler [4][44][45].
3. **Teleprompter / Prep Notes**: voice-tracked script scrolling plus talking points from uploaded documents, with a speech-pace meter [3][5][2].
4. **Conversation context assistant ("Merge"-style)**: definitions, names, follow-up questions surfaced only on pauses [9][28][2].
5. **Voice-first memory**: ambient notes, meeting summaries, and voiceprint-based "who is this / what did we last discuss" recall, with on-device retention controls [2][20][47].
6. **Sound awareness for DHH users**: on-MCU classifier for alarms, doorbells, name-called, with HUD icons and haptic/audio cues [40][41].
7. **Notification triage**: per-app filters, priority, and quick voice/canned replies [30][15].
8. **Navigation and transit**: arrow-and-distance turn-by-turn plus live departure boards, using phone GPS/compass bridged to JS plugins [2][6].
9. **MCP bridge + agent HUD**: expose the glasses as MCP tools; approve agent actions by tap [2][56].
10. **Focus/ADHD and wellbeing kit**: Pomodoro, break reminders, IMU posture/eye-exercise prompts, single-task focus HUD [2][47].
11. **Integrations people keep building**: Home Assistant, Obsidian/Notion/Todoist, media now-playing + synced lyrics, TOTP, live sports scores [2].
12. **Light games and learning on-MCU**: chess, solitaire, Snake, FSRS flashcards — good showcases for the C plugin SDK [2].

---

## Sources

1. Even Hub developer docs – installation/SDK overview. https://hub.evenrealities.com/docs/getting-started/installation
2. awesome-even-realities-g2 (community catalogue of G2/G1 apps, tooling, and firmware). https://github.com/pangoleen/awesome-even-realities-g2
3. Even Realities – smart glasses product page (Conversate, Translate, Teleprompt, Even AI). https://www.evenrealities.com/smart-glasses
4. Even Realities – HUD glasses page (battery, dashboard widgets). https://www.evenrealities.com/en-DE/hud-glasses ; review: https://www.theshortcut.com/p/even-realities-g2-review
5. Android Authority – Even G2 Prep Notes and Even Hub launch (2026-03-26). https://www.androidauthority.com/even-realities-g2-smart-glasses-update-3652190/
6. MobileSyrup – "Even Realities G2s are my new daily smartglasses; the R1 ring is clutch" (2026-10-19). https://mobilesyrup.com/2026/10/19/even-realities-g2s-are-my-new-daily-smartglasses-the-r1-ring-is-clutch/
7. HearingTracker forum – Even Realities review thread. https://forum.hearingtracker.com/t/even-realities-review/111040
8. MentraOS README. https://raw.githubusercontent.com/Mentra-Community/MentraOS/dev/README.md
9. Mentra MiniApp Store. https://apps.mentraglass.com
10. Mentra developer docs – getting started. https://docs.mentraglass.com/app-devs/getting-started
11. Gizmodo – Mentra Live launch. https://gizmodo.com/smart-glasses-for-onlyfans-live-streaming-have-arrived-2000710780
12. Meta – Ray-Ban Display product page. https://www.meta.com/ai-glasses/meta-ray-ban-display/
13. Road to VR – Meta Ray-Ban Display & Neural Band hands-on. https://roadtovr.com/hands-on-meta-ray-ban-display-glasses-neural-band-offer-a-glimpse-of-future-ar-glasses/ ; MobileSyrup hands-on: https://mobilesyrup.com/2025/09/18/meta-ray-ban-display-hands-on/ ; Gadget Scout review: https://www.gadgetscout.co.uk/articles/meta-ray-ban-display-glasses-review-2026.html
14. Pulse 2.0 – Meta neural handwriting, captions, expanded navigation update. https://pulse2.com/meta-neural-handwriting-display-recording-live-captions-expanded-navigation-and-developer-tools-roll-out-on-ray-ban-display/
15. Engadget – Meta Ray-Ban Display review. https://engadget.com/wearables/meta-ray-ban-display-review-chunky-frames-with-impressive-abilities-193127070.html
16. Meta Help – Battery life on Ray-Ban Display and Neural Band. https://www.meta.com/help/ai-glasses/1116302600085081/
17. Meta Wearables developer docs – Display access overview. https://wearables.developer.meta.com/docs/develop/dat/display-overview/
18. Shopifreaks – Meta opens Ray-Ban Display to developers (mobile + web SDKs, Neural Band gestures). https://www.shopifreaks.com/meta-gives-developers-access-to-ray-ban-display-glasses-with-new-mobile-and-web-app-sdks-and-neural-band-gesture-controls/
19. Brilliant Labs – Halo product page. https://brilliant.xyz/products/halo
20. Wareable – Brilliant Labs Halo (Narrative memory, 14 h battery). https://www.wareable.com/wearable-tech/brilliant-labs-halo-smart-glasses-ai-release-date-price
21. Brilliant Labs – Halo hardware manual. https://docs.brilliant.xyz/halo/hardware/
22. Brilliant Labs – Frame SDK docs. https://docs.brilliant.xyz/frame/frame-sdk/
23. EFTM – Rokid Glasses review (2026-06). https://eftm.com/2026/06/rokid-glasses-review-are-these-the-perfect-smart-glasses-translate-prompter-navigation-screen-photos-video-277332
24. Techlicious – Rokid smart glasses. https://www.techlicious.com/blog/rokid-smart-glasses-promise-accessibility-breakthroughs/ ; Notebookcheck: https://www.notebookcheck.net/Rokid-Glasses-are-lightweight-AR-smart-glasses-with-Micro-LED-displays-and-a-499-price-tag.1098756.0.html
25. Android Central – Rokid wants anyone to build AI agents for its glasses. https://www.androidcentral.com/gaming/virtual-reality/rokid-wants-anyone-to-build-ai-agents-for-its-smart-glasses
26. awesome-rokid. https://github.com/Anezium/awesome-rokid
27. TechCrunch – Halliday's $489 smart glasses. https://techcrunch.com/2025/01/08/hallidays-489-smart-glasses-beam-a-tiny-screen-to-your-eye
28. TechRadar – Halliday hands-on ("nosey AI"). https://www.techradar.com/computing/virtual-reality-augmented-reality/i-cant-decide-if-i-love-or-hate-halliday-smart-glasses-with-its-ultra-tiny-display-and-nosey-ai
29. Vuzix support – Ultralite SDK for Android. https://support.vuzix.com/docs/sdk-for-android.md
30. Vuzix – Z100 general availability press release. https://ir.vuzix.com/news-events/press-releases/detail/2104/vuzix-announces-general-availability-of-z100-smart-glasses
31. Mixed News – Vuzix Z100 36 g. https://mixed-news.com/en/the-new-vuzix-z100-are-rugged-36g-smart-glasses-designed-to-streamline-workflow/
32. Engadget – Xreal Project Aura hands-on. https://engadget.com/2177998/android-xr-xreal-project-aura-hands-on/ ; Xreal blog: https://www.xreal.com/de/blog/aura-25-tas-release-en
33. TechRadar – RayNeo X3 Pro review. https://www.techradar.com/pro/rayneo-x3-pro-ai-ar-smart-glasses-review
34. Tom's Hardware – RayNeo X3 Pro review ("alarming battery life"). https://www.tomshardware.com/peripherals/wearable-tech/rayneo-x3-pro-ar-glasses-review ; Virtual Reality News: https://virtual.reality.news/news/rayneo-x3-pro-review-ar-glasses-with-fatal-battery-flaw/
35. The Gadgeteer – INMO Go3 (2026-06-10). https://the-gadgeteer.com/2026/06/10/inmo-go3-smart-glasses-ai-translation-kickstarter-2026/
36. INMO support – Go2 features. https://support.inmoxr.com/go2/guides/features/ ; product page: https://www.inmoxr.com/pages/inmo-go2
37. Android Authority – Samsung/Google Android XR glasses with Warby Parker and Gentle Monster (I/O 2026). https://www.androidauthority.com/samsung-google-android-xr-glasses-warby-parker-gentle-monster-google-io-2026-3668380/
38. Engadget – Apple smart glasses not until end of 2027. https://engadget.com/2184438/apple-smart-glasses-reportedly-wont-make-their-debut-until-end-of-2027 ; Tom's Guide: https://tomsguide.com/computing/smart-glasses/apple-smart-glasses-report-reveals-new-details-as-meta-races-ahead
39. UploadVR – Snap OS 2.0 and consumer Specs. https://www.uploadvr.com/snap-os-2-0-spectacles-specs-consumer-ar ; TechRadar: https://www.techradar.com/computing/virtual-reality-augmented-reality/goodbye-spectacles-reimagined-snap-specs-now-set-to-launch-in-2026-with-a-ton-of-new-features-and-openai-and-gemini-integration ; price report: https://ppc.land/snap-specs-ar-glasses-set-for-fall-2026-launch-at-2-500/
40. Guo et al., HoloSound (ASSETS 2020). https://soundability.eecs.umich.edu/img/portfolio/Guo_HoloSound_ASSETS2020.pdf
41. SonoCraftAR (ISMAR 2025 adjunct). https://arxiv.org/abs/2508.17597v1
42. GlassEar / HMD sound visualisation (CHI 2015). https://makeabilitylab.cs.washington.edu/project/glassear
43. Sahin et al., Social communication coaching smartglasses for autism (JMIR mHealth 2017). https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5629347/
44. ProMemAssist (UIST 2025). https://arxiv.org/abs/2507.21378v1
45. Memento – proactive context-aware AR assistant. https://arxiv.org/pdf/2601.17622v3
46. VisionClaw – always-on AI agents through smart glasses (2026). https://www.alphaxiv.org/abs/2604.03486
47. Memory Recall Assistant (Qualcomm × Meta ExecuTorch hackathon). https://lablab.ai/ai-hackathons/qualcomm-x-meta-executorch-hackathon/synapse-riders/memory-recall-assistant ; LensSmart ADHD concept: https://cardiffjournalism.co.uk/immersivemedialab/?p=505
48. SignGlass – first-person ASL translation (Penn State). https://pure.psu.edu/en/publications/signglass-first-person-view-comprehensive-and-generalizable-asl-t/
49. Remio – smart glasses adoption stalls over battery life and social friction. https://www.remio.ai/post/smart-glasses-adoption-stalls-over-battery-life-and-social-friction
50. Geeky Gadgets – Meta Ray-Ban Display 9-month review. https://www.geeky-gadgets.com/meta-ray-ban-display-9-month-review/
51. Even Realities buyer's guide – what do smart glasses do. https://www.evenrealities.com/blogs/buyers-guide/what-do-smart-glasses-do
52. GummySearch snapshot – r/EvenRealities. https://gummysearch.com/r/EvenRealities/
53. Scientific American – glasses that transcribe speech in real time. https://www.scientificamerican.com/article/new-glasses-can-transcribe-speech-in-real-time/ ; Captify Glass: https://apps.apple.com/pg/app/captify-glass/id6748929504
54. Notebookcheck – TranscribeGlass on Vuzix Z100. https://www.notebookcheck.net/TranscribeGlass-AI-smart-glasses-generate-live-transcriptions-of-conversations-for-the-hearing-impaired.969548.0.html
55. HearingTracker – captioning glasses state of market, Jan 2026. https://forum.hearingtracker.com/t/captioning-glasses-e-g-xrai-state-of-market-as-of-jan-26/110090
56. Extentos MCP server for Meta glasses apps. https://socket.dev/npm/package/@extentos/mcp-server/overview/0.11.42
57. (reserved)
58. AI for Service: Proactive Assistance with AI Glasses. https://arxiv.org/abs/2510.14359v1
59. Meta Community Forums – Feature requests & UX feedback: Ray-Ban Display + Neural Band. https://communityforums.atmeta.com/captures-21/feature-requests-ux-feedback-meta-ray-ban-display-neural-band-ecosystem-178998
60. (reserved)
61. (reserved)
62. Vuzix ultralite-sdk-android (GitHub). https://github.com/Vuzix/ultralite-sdk-android
63. CNX Software – Halliday proactive AI glasses. https://www.cnx-software.com/2025/01/halliday-proactive-ai-smart-glasses/
