# MemoMind Smart Glasses: Research Brief

_Compiled 2026-11-01. Every claim has an inline citation [n] that points to the Sources list at the end._

**Confidence overall: medium-high.** The product is new (shown at CES in January 2026, shipping since roughly Q3/Q4 2026), but it has had a lot of press coverage. The official spec page and a public SDK repo let us check many details directly. The weak spots are the chip/SoC, which LLMs the assistant uses, retail shipping status after the Kickstarter cancellation, and actual Reddit or user discussion. We could only read search-result excerpts of the Reddit threads, not the threads themselves.

Legend: **[UNVERIFIED]** means only one secondary source or only a search snippet supports it. **[CONTRADICTORY]** means sources disagree.

---

## 1. Company and product line

### Who makes it
- MemoMind is an AI-hardware brand **incubated by XGIMI**, the Chinese projector maker. Its press releases are datelined Shenzhen [10][11]. XGIMI introduced the brand at **CES 2026 (January)** [1][3].
- The iOS app's publisher is **Shenzhen Qinglai Innovation Intelligent Technology Co., Ltd.** [9][25]. This is presumably the operating entity; we found no document that spells out its legal relationship to XGIMI.
- The SDK source mentions an "XGIMI path" in its Bluetooth implementation notes, which also points to XGIMI engineering [27b].
- It is an XGIMI venture, not a separate "Chinese AR company". The user's guess is **confirmed**.

### Models
| Model | Display | Weight | Status / price | Sources |
|---|---|---|---|---|
| **MemoMind One** (sometimes "Memo One") | Binocular (dual-eye) green micro-LED waveguide | 45–47 g (official: 46.6 g) | Shipping. $599 list, **$399** launch/promo price. Rx version $499 promo / $749 list. "Custom Edition" from $449 | [1][3][4][6][7][8][10] |
| **MemoMind Air Display** | Monocular (one eye) | ~28.9–29 g | Announced. Ubergizmo (Mar 2026) expected "late 2026". Price not announced, "lower than One" | [1][2] |
| **MemoMind Air** (no screen) | None, audio-only | TBA | Announced. Ubergizmo (Mar 2026) expected late 2026 | [2] |
- At CES, Notebookcheck described a "third model in development" designed to look more like ordinary glasses, possibly with no display [1]. That is probably the screenless Air later named at MWC [2].
- A Reddit search excerpt mentions a post "Calling for early tester for MemoMind Air Display" [26c]. **[UNVERIFIED]**: we saw the excerpt only.
- Note: a Notebookcheck URL slug says "MemoMind Two", but the article itself covers only One and Air Display [1]. **No product called "MemoMind Two" exists.**
- Frame styles for the One: **Nomad** (wayfarer/square-round), **Gotham** (clubmaster/square), **Archive** (panto/round). Frames are magnesium-aluminium alloy and β-titanium [4][7][9]. Road to VR reports seven colour options [3]. A sunglasses clip-on is sold separately [8].

### Launch timeline
- **Jan 2026**: brand and models revealed at CES [1][3].
- **Mar 2026**: shown at MWC Barcelona. Ubergizmo then expected One pre-orders in April [2]. That date slipped.
- **18–30 Jun 2026**: first reviews published (Engadget 18 Jun [4], BGR 30 Jun [5], TechRadar 30 Jun [13]).
- **28 Jun 2026**: Kickstarter launched with a goal of HK$80,000 (~US$10k) [3][14]. It passed US$500k within days [3] and passed US$1M with more than 2,000 backers by about mid-August [6].
- **11 Aug 2026**: Even Realities received two US design patents (D1,140,996 and D1,140,997). It then sent cease-and-desist letters (~20 Aug), obtained a Düsseldorf ex parte preliminary injunction (18 Aug) covering its EU designs, and sued in E.D.N.Y. (25 Aug). MemoMind **paused EU shipments** [16]. **[UNVERIFIED]**: these details come from a search summary of a Steptoe law-firm blog. We could not open the page itself (HTTP 403).
- **27 Aug 2026**: **Kickstarter cancelled the campaign.** Kicktraq shows "Cancelled by Kickstarter" with HK$10,444,593 (~US$1.34M) from 2,788 backers. The campaign ran 28 Jun–27 Aug [14]. Geeky Gadgets attributes the cancellation to the patent dispute and says backers were refunded automatically [15]. Neither source says what happened next for backers, e.g. whether they could re-order on memo-mind.com.
- **Sep–Oct 2026**: sold directly at **memo-mind.com** for $399 ($599 list) [8][10]. On 1 Oct, mixed-news reported shipping estimates of October for Gotham/Archive and **December for Nomad** [9]. That is later than the "end of August" date promised during the campaign [5][6].
- **5 Nov 2026**: MemoMind lists an upcoming NYC event [8].

### Regions
- The US is the main market. ZEISS prescription lenses are offered **only in the US**, and other regions use other suppliers [7].
- EU shipments were paused because of the German injunction [16] **[UNVERIFIED]**. We found no statement about whether that has been resolved.
- The Engadget, BGR and Irish Examiner reviews suggest a UK/IE presence, but we found no official list of regions.

### Subscription (Memo+)
- **$19.99/month** [4][5][7].
- **Free core features:** Memo AI, AI Translator, AI Recorder, AI Captions, AI Teleprompter, Maps, Calendar, Idea Notes [7].
- **Memo+ adds:** Moments (AI journal), Up Next (to-dos and "wishes" pulled from conversations), Memo AI+ (search across captured conversations and meetings) [7].
- **Promos:** buyers who paid a deposit got 12 months free and Kickstarter backers got 6 months [3]. The official page says "your first year is on us" without defining terms [7].

---

## 2. Hardware specs (MemoMind One)

Most of this comes from the official spec page [7], checked against the SDK and reviews.

| Spec | Value | Notes / sources |
|---|---|---|
| Display | Dual micro-LED projectors into a binocular waveguide, **monochrome green** | [6][7][9] |
| Resolution | **640×350** (official, per eye per mixed-news) | [7][9]. **[CONTRADICTORY]**: the SDK targets a **600×350, 4-bit greyscale (GRAY_4, 16 levels)** framebuffer [19][20]. The usable canvas may be smaller than the panel, or the marketing figure may be rounded. Developers should use 600×350 |
| Brightness | 2,000 nits | [3][7]. BGR found it unreadable in bright sunlight [5] |
| FOV | 25° | [7][9] |
| Refresh | 30 Hz | [7][9] |
| Focal distance | Adjustable 1–5 m (default ~2.5 m) | [7] |
| Waveguide transparency | 98% in non-display areas | [7] |
| Weight | 46.6 g | [7]. Engadget/vr.org say 47 g [4][6]. Notebookcheck/Ubergizmo say ~45 g (CES/MWC prototypes) [1][2] |
| Battery | "16+ h mixed use". Standby 3+ days connected, 10+ days disconnected | [7]. Engadget said the battery held up under heavy use [4]. BGR got several days of real use [5] |
| Charging | USB-C via a clip-on adapter at the right temple tip. **No charging case** | [4][5] |
| Chip / SoC | **Not disclosed.** The plugin runtime is **RV32 (32-bit RISC-V)** position-independent code. Plugin code/constants are limited to ≤500 KiB of flash and static RAM to <100 KiB | [7] (not listed), [22][27a]. This points to an MCU-class RISC-V core, not an application processor. Exact part **unknown** |
| OS | Proprietary firmware with **LVGL** UI. Plugins call a versioned Host API. Not Android | [19][22] |
| Microphones | 3 ("triple directional mics"). Front-facing vs omnidirectional pickup selectable since the Sep 2026 update | [7][9][10] |
| Speakers | Open-ear, "Harman AudioEFX", in the temples | [4][7]. TechRadar called the audio "disappointing" [13] |
| Camera | **None.** This is the core marketing point | [4][7][8] |
| IMU | Yes: gyroscope and accelerometer (raw access exposed in the SDK). Used for head-tilt UI | [19], SDK IMU example [18]. Not listed on the spec page [7] |
| Controls | **One physical button** on the right temple (tap / double-click / long-press), head-tilt selection, "Hi Memo" wake word. Third-party BLE rings via HID/HOGP (e.g. KiWear) | [4][5][10][11][27] |
| Touchpad | Not mentioned on the official page. Reviews describe a button, not a touch surface [4][5]. The SDK has "touch events", but those come from HOGP accessories [11][19] | |
| Prescription | Yes. ZEISS lenses (US only). Plano lenses are PC protective lenses | [7] |
| Durability | Splash-resistant, not waterproof. No IP rating published | [7] |
| Connectivity | Bluetooth LE to the phone (GATT business protocol, Opus microphone stream) plus HFP for call and speaker audio. **No Wi-Fi or cellular mentioned.** BT version not published | [7][18][19] |
| Phone requirement | Requires the MemoMind app on iOS (15.6+) or Android | [7][25] |

---

## 3. Built-in features and the companion app

### Features (official list plus reviews)
- **Memo AI assistant**: started by long-pressing the button or saying "Hi Memo" [4][27].
  - **LLM: not disclosed.** Ubergizmo and hifi.fan describe a "multi-LLM hybrid" backend without naming models [2][12].
  - Engadget found the answers good and current [4].
  - TechRadar called the AI "slow" [13]. A Gizmodo review, as summarised by a third-party site, found "Hi Memo" slow and unreliable [27] **[UNVERIFIED secondhand]**.
- **AI Translator**: listen-in and dialog modes [7].
  - **[CONTRADICTORY]** language count: early materials said 26+ [3][5]. The 30 Sep press release said 53. On 1 Oct the product page still said 26 [9]. The product page now says **53** [7].
  - Engadget noted translation lag and found it censors profanity with asterisks [4].
- **AI Recorder / meeting minutes**: transcripts, summaries and to-do suggestions [5][7][25]. App 1.3.81 added search-and-replace for recordings and summary editing [25].
- **AI Captions** (live subtitles) [4][7].
- **AI Teleprompter** [3][7].
- **Maps / turn-by-turn navigation**: navigation could only be started from the phone app [5]. Engadget could not test it at the time of review [4].
- **Notifications**: mirrored from phone apps such as Messages and WhatsApp, up to four lines since September [5][10]. BGR found iPhone integration limited because the AI cannot reach Apple's own apps [5].
- **Dashboard and widgets** via head tilt: calendar, to-do list, ideas, stocks, news, notes, lyrics [4]. Since September there are custom RSS 2.0/Atom feeds and two-way calendar sync [10].
- **"Second brain" / memory features (Memo+)** [4][7]:
  - **Moments**: an AI daily/weekly journal built from always-on microphone capture.
  - **Up Next / Wishes**: logs intentions and wishes, including ones heard from other people or TV.
  - **Memo AI+**: long-term search across captured conversations.
- **Memo Agent** (Sep 2026): view and lightly control a coding agent from the glasses [9][10].
- **OpenClaw integration**: the official page says "Open platform with OpenClaw built in" [7]. An OpenClaw plugin maps agent commands to glasses functions: volume, brightness, translation, teleprompter, DND, captions, meeting minutes, recording, auto-brightness [23].
- **Privacy controls** (Sep 2026): calendar privacy settings and "Card Lock" for sensitive content [10].

### Companion app ("MemoMind")
- iOS v1.3.81, released 16 Oct 2026, rated 4.25★ from only 8 US ratings, requires iOS 15.6+ [25].
- An Android build 1.3.81 also exists, according to a community repo [24].
- **App 1.3.81 release notes** [25]:
  - AI conversation speed controls
  - meeting to-do suggestions
  - better Bluetooth stability
  - call echo fix
  - "**Developer Workspace (allowlist only)**"
- **What the app does**: setup, quick-launch slot configuration, dashboard layout (cloud-synced since Sep), translation transcripts, starting navigation, notification forwarding, and Memo Lab > Developer Workbench for sideloading plugins [4][5][10][20][24].

---

## 4. Plugin ecosystem

### Official announcements
- **1 Sep 2026: "Developer Access" Phase One announced** [11].
  - Publishes the BLE protocol with docs, demos and sample code.
  - Lets developers push text and graphics to the HUD, receive button and touch events, and access the microphone audio stream.
  - **KiWear** (smart ring) is the first SDK ecosystem partner. HID support was added because the community asked for ring control.
  - Later phases, with no dates: a packaged SDK, full docs, R&D support, and an **app marketplace** [11].
- **30 Sep 2026 update** [10]. Phase One is live on GitHub in two tracks:
  - (a) **One Glass SDK**: native C plugins on the glasses and/or web plugins on the phone.
  - (b) **BLE Input Protocol** for rings, bands and remotes, with a desktop Studio simulator and examples (Breakout, 2048).
  - **Phase Two**: an **App Workspace closed beta in October 2026**, by whitelist invitation with community sign-up [9][10].
  - App 1.3.81 (16 Oct) shipped "Developer Workspace (allowlist only)", so the beta appears to have **started** [25].
- **Plugin store / marketplace: does not exist yet.** It is promised for a later phase with no date [11]. The developer docs do not describe a store, a review process for public distribution, or sign-up steps [17].

### Official repo: `memomind-open/plugin-open-platform` [18]
Last commit 15 Oct 2026.

**Contents** [18]:
- **GlassSDK**: C, compiled to RV32 PIC `.gmp` packages. A pinned xPack RISC-V GCC 15.2 toolchain downloads automatically.
- **PhoneSDK**: JS/HTML web plugins packaged as `.mmpkg`, running in the app's WebView over "Bridge 2.0". Includes a Node-based Browser Studio.
- **Prebuilt Desktop "MemoMind Plugin Studio"** for Windows x64, Linux x64 and macOS Universal. Its source is closed.

**Three plugin types** [17]:
- **Phone-only web plugin**: uses the built-in bridge GMP.
- **Glasses-only C plugin**.
- **Paired web + C plugin**: one ZIP.

**Rendering** [19]:
- UI goes through the firmware's shared **LVGL**, or directly to a 600×350 GRAY_4 framebuffer.
- Glasses plugins get no mic or speaker PCM. Phone plugins with the `audio.capture` permission receive the native Opus mic stream.
- Phone plugins can also request foreground location (`location.foreground`).
- Persistent KV storage is "not yet exposed".

**Installation (sideload only)** [20]:
- Studio serves a ZIP over the **LAN** and shows a QR code.
- In the app: Settings > Memo Lab > Developer Workbench > "Scan to open app".
- The app transfers the GMP to the glasses over BLE and caches it in flash.

**Security caveats, stated by the vendor** [21]:
- GMPs run as **trusted native code with no MPU sandbox and no package signature**.
- LAN download has **no TLS and no publisher signature**.
- The docs say: "install only `.gmp` files from a trusted source."
- Studio can export a "review ZIP" with source encrypted to MemoMind's public key, which suggests a future review pipeline for distribution [18].

**Known gaps** [27b]:
- Source review found "release gaps" in the BLE recording GATT path and MTU negotiation.
- The README says executable GMP delivery/installation wire transactions are deliberately withheld from the public docs, which means third parties cannot install plugins without the official app [18].

**Built-in AI tooling** [18]:
- The repo ships `AGENTS.md` and `.agents/skills/` (e.g. `memomind-example-app`) for AI-assisted plugin development.

**SDK example plugins** [18]:
- Games: Breakout, Tetris, Snake, 2048, Sokoban, Jet Runner, Fighter Arena.
- Other: novel reader, image viewer and animation, IMU debugger, LVGL UI, talking pet.
- Phone side: weather, life-desk, counter, permission debugger.

### Other official or semi-official
- `memo-mind/memomind-openclaw-plugin`: OpenClaw agent plugin, `@memomind/memomind-glasses` [23]. It is under a `memo-mind` org, which is probably official given the memo-mind.com domain. **[UNVERIFIED ownership]**
- The website links a Developer Platform (open-platform.memo-mind.com), documentation, and a **Discord** developer channel [8][17].

### Community / third-party projects (GitHub, Oct 2026) [28]
- **hemge-dynag**: about 17 repos, several in French. Examples:
  - games and timers: quiz, flashcards, pomodoro, interval timer, Space Invaders
  - health and wellbeing: breathing, posture, mood, workout, cardio (Polar H10 BLE heart rate shown on the HUD), run/hike GPS
  - utilities: recipe, shopping list, coin flip
  - Home Assistant dashboard, and "memomind-subtext" (live conversation analysis with an LLM on the phone) [28][29]
- **nicognaW/memo-doom**: DOOM / Freedoom Phase 1 on the glasses with phone controls [28].
- **cahorton/Memomind-MD-Reader**: Obsidian-style Markdown reader with head-tracked scrolling [28].
- **tropicalstream/pomotime**: Pomodoro / HIIT / EMOM timer, native `.gmp` [28].
- **adamjamesrees-cmyk/memomind-gemini-live**: an unofficial hack. Saying "Hi Memo" launches **Google Gemini Live** through Tasker + Shizuku by watching the app's logcat. It shows demand to swap in a different assistant [24].
- **Reddit:** r/MemomindAI exists, and r/SmartGlasses has many threads [26]. We found no third-party store or community plugin index.
- Several unrelated GitHub repos are also named "MemoMind" (note-taking apps, a Claude Code memory system by 24kchengYe, etc.). **Ignore them.**

---

## 5. Reviews and shortcomings

### Professional reviews
| Outlet | Date | Verdict | Key points |
|---|---|---|---|
| Engadget | 18 Jun 2026 | 7.4/10 | Light and comfortable, useful second screen, good battery. Single button causes misclicks; head-tilt is "mostly" reliable; Moments is "creepy" and inaccurate (attributed other people's events to the reviewer); one weekly recap arrived in Simplified Chinese; translation lag; possible skin irritation from the charging contact; should cost ≥$100 less [4] |
| BGR | 30 Jun 2026 | Positive overall | Looks like normal glasses, comfortable, no eye-crossing, generous free features. Hard to read in bright sun; eye fatigue/dizziness on long use (focal distance); no recording indicator; no charging case; weak iPhone integration; Memo+ "probably isn't worth it" [5] |
| TechRadar (Hamish Hector) | 30 Jun 2026 | Negative (opinion) | "Slow AI, lack of a camera, disappointing audio"; "I don't need more mediocre smart glasses" [13]. We read only the headline and metadata |
| Gizmodo (via secondhand summary) | — | Mixed | Always-on recording with no LED indicator is a consent problem; "Hi Memo" slow/unreliable; subscription needed for memos [27] **[UNVERIFIED]** |
| Tom's Guide, Android Central (×2), Irish Examiner, Expert Reviews, Geeky Gadgets | various | — | Found in search, but the pages could not be fetched. The Tom's Guide headline ("I think I'm seeing double") hints at a binocular alignment issue **[UNVERIFIED]** |

### Recurring complaints
1. **Privacy of always-on microphones**:
   - Moments and Wishes record everyone nearby [4][6].
   - There is no recording indicator light [5][6][27].
   - vr.org notes all-party-consent laws in about 12 US states [6].
   - The "no camera = private" pitch is undercut by audio capture.
2. **Controls**: a single button plus head tilt; wake-word reliability [4][27].
3. **Outdoor visibility**: 2,000 nits is not enough in direct sun [5].
4. **AI quality and latency**: slow responses [13], wrong attributions in summaries, wrong language in a recap [4], undisclosed LLMs [2][12].
5. **Audio quality** called disappointing [13]. Audio was good at moderate volume per BGR [5]. **[CONTRADICTORY]**
6. **Subscription fatigue**: $19.99/month for the memory features [4][5].
7. **Comfort over time**: generally praised for light weight [4][5]. Eye fatigue and dizziness on long sessions [5]. Possible skin irritation [4].
8. **No charging case** [5]. **iPhone limitations** [5].
9. **Business risk**:
   - Kickstarter cancelled [14][15].
   - Design-patent litigation from Even Realities, with an EU shipment pause [16] **[UNVERIFIED detail]**.
   - Shipping slipped from August to October/December [6][9].
   - Inconsistent marketing claims (26 vs 53 languages) [9].
10. **Developer platform**: no sandbox or signing yet, LAN-only sideload, no marketplace [11][20][21].

### Users (Reddit, excerpts only)
- Positive comparisons appear in thread titles and excerpts: more comfortable than Rokid; adjustable nose pads compared favourably with Meta Ray-Ban Display; described as "the most complete camera-free display package with good speakers" [26].
- Several Reddit reviews were by **beta testers who received free units from MemoMind** (a neurodivergent student, a visually impaired user). **Treat them as potentially biased** [26].
- We could not read thread bodies or comments; reddit.com was blocked for both fetch tools.
- We found **no Amazon reviews**. hifi.fan said the product was not listed at major US retailers [12].

---

## 6. Roadmap hints and announced upcoming items
- **Developer platform phases** [10][11]:
  - Phase 2 App Workspace closed beta (Oct 2026; apparently started per app 1.3.81 [25]).
  - Later: packaged SDK, comprehensive docs, R&D support, **app marketplace**. No dates given.
- **SDK-level items** [19][21][27b]:
  - persistent KV storage for plugins
  - package signature verification and a production trust policy
  - resolving the BLE recording/MTU release gaps
  - possible native iOS build targets
- **Hardware**: MemoMind Air Display (monocular, ~29 g) and screenless MemoMind Air. Both were expected "late 2026" as of March [2]. We found no launch confirmation as of 1 Nov 2026. An Air Display early-tester call appeared on Reddit [26c].
- **Frames**: at CES, XGIMI said it planned 8 frame styles and 5 interchangeable temples [5]. Only 3 styles have shipped [7].
- **Software (Memo+)**: BGR mentions "upcoming to-do and chat-based items" [5]. Up Next has since been listed on the official page [7].
- **Event**: MemoMind NYC event on 5 Nov 2026 [8]. It may bring announcements.

---

## Gaps and things we could not verify
- Chip/SoC part number, Bluetooth version, battery mAh, charge time, IP rating.
- Which LLM providers power Memo AI.
- Whether the 640×350 vs 600×350 discrepancy is panel size vs canvas size.
- What happened to Kickstarter backers after the cancellation, and the current status of the Even Realities lawsuit and the EU shipments.
- Full text of the TechRadar, Tom's Guide, Android Central and Reddit discussions.
- Launch dates and prices for Air Display and Air.

---

## Sources
1. Notebookcheck, "Xgimi MemoMind … launching soon with navigation and live translation" (5 Jan 2026): https://www.notebookcheck.net/Xgimi-MemoMind-Two-AI-powered-AR-glasses-launching-soon-with-navigation-and-live-translation.1196423.0.html
2. Ubergizmo, "XGIMI MemoMind at MWC 2026" (Mar 2026): https://www.ubergizmo.com/2026/03/xgimi-memomind-mwc-2026/
3. Road to VR, "'MemoMind One' Display Smart Glasses Blast Past $500K Crowdfunding Mark" (3 Jul 2026): https://roadtovr.com/memomind-one-smart-glasses-kickstarter-release/
4. Engadget, "XGIMI MemoMind One review: Smart glasses, creepy AI" (18 Jun 2026): https://engadget.com/2196666/xgimi-memomind-one-review
5. BGR, "MemoMind One Review" (30 Jun 2026): https://www.bgr.com/2205340/memomind-one-review/
6. vr.org, "MemoMind One Kickstarter $1 million, camera-free, always-on mic" (Aug 2026): https://vr.org/articles/memomind-one-kickstarter-1-million-camera-free-always-on-mic-2026
7. MemoMind official product/spec page: https://www.memo-mind.com/pages/memomind-one
8. MemoMind official homepage: https://memo-mind.com
9. Mixed News, "MemoMind says its glasses translate 53 languages, and its spec page says 26" (1 Oct 2026): https://mixed-news.com/en/?p=34901
10. TNGlobal / PRNewswire, "MemoMind One Rolls Out New Features and Prepares for a New Stage of Developer Access" (30 Sep 2026): https://technode.global/prnasia/memomind-one-rolls-out-new-features-and-prepares-for-a-new-stage-of-developer-access/
11. Thailand Business News / PRNewswire, "MemoMind One opens developer access, announces KiWear as first SDK partner" (1 Sep 2026): https://www.thailand-business-news.com/pr-news/memomind-one-opens-developer-access-announces-kiwear-as-first-sdk-partner
12. hifi.fan, XGIMI Memo One overview: https://hifi.fan/xgimi-memo-one/about
13. TechRadar, "48 hours with the MemoMind One XR glasses…" (30 Jun 2026; headline/metadata only): https://www.techradar.com/tech/48-hours-with-the-memomind-one-xr-glasses-a-slow-ai-lack-of-a-camera-and-disappointing-audio-left-me-desperate-for-more
14. Kicktraq, MemoMind One campaign tracker (shows "Cancelled by Kickstarter"): https://www.kicktraq.com/projects/1963472698/memomind-one-the-most-natural-ai-display-glasses/
15. Geeky Gadgets, "MemoMind 1 Kickstarter suspended" (27 Aug 2026): https://www.geeky-gadgets.com/memomind-1-kickstarter-suspended/
16. Steptoe "Step Into IP" blog, "The line between ordinary and ornamental in the smart-glasses comeback era" (via search summary; page returned 403): https://www.steptoe.com/en/news-publications/step-into-ip-blog/the-line-between-ordinary-and-ornamental-in-the-smart-glasses-comeback-era2.html
17. MemoMind Open Platform docs, Get Started overview: https://open-platform.memo-mind.com/docs/get-started/overview/?lang=en
18. GitHub, memomind-open/plugin-open-platform (README, examples, AGENTS.md): https://github.com/memomind-open/plugin-open-platform
19. GlassSDK Capability Matrix / Graphics docs: https://github.com/memomind-open/plugin-open-platform/blob/main/GlassSDK/docs/CAPABILITY_MATRIX.md
20. GlassSDK Installation guide (Developer Workbench, LAN install, 600×350 virtual display): https://github.com/memomind-open/plugin-open-platform/blob/main/GlassSDK/docs/INSTALLATION.md
21. GlassSDK Security doc: https://github.com/memomind-open/plugin-open-platform/blob/main/GlassSDK/docs/SECURITY.md
22. GlassSDK README (RV32 `.gmp`, RISC-V toolchain): https://github.com/memomind-open/plugin-open-platform/blob/main/GlassSDK/README.md
23. GitHub, memo-mind/memomind-openclaw-plugin: https://github.com/memo-mind/memomind-openclaw-plugin
24. GitHub, adamjamesrees-cmyk/memomind-gemini-live: https://github.com/adamjamesrees-cmyk/memomind-gemini-live
25. Apple App Store, MemoMind app (v1.3.81, 16 Oct 2026): https://apps.apple.com/us/app/memomind/id6758686625
26. Reddit threads (search excerpts only):
    - (a) https://www.reddit.com/r/SmartGlasses/comments/1v5dkpl/the_memomind_one_experience_from_a_smartglass/
    - (b) https://www.reddit.com/r/SmartGlasses/comments/1tozfdd/lived_with_meta_rayban_display_and_memomind_one/
    - (c) https://www.reddit.com/r/SmartGlasses/comments/1snmizz/first_look_memomind_smart_glasses_just_arrived/
    - (d) https://www.reddit.com/r/MemomindAI/
    - (e) https://www.reddit.com/r/augmentedreality/comments/1tboczr/a_neurodivergent_students_review_of_the_memomind/
    - (f) https://www.reddit.com/r/MemomindAI/comments/1ua6tcx/memomind_one_smart_glasses_review_a_visually/
    - (g) https://www.reddit.com/r/SmartGlasses/comments/1vz1cuc/just_got_this_memomind/
    - (h) https://www.reddit.com/r/SmartGlasses/comments/1trch53/memomind_one_what_would_you_like_yo_know/
27. st-hakky summary of Gizmodo review (secondhand): https://book.st-hakky.com/en/news/xgimi-memomind-one-recording-questions
    - 27a. GlassSDK ABI doc (500 KiB flash / <100 KiB RAM limits): https://github.com/memomind-open/plugin-open-platform/blob/main/GlassSDK/docs/ABI.md
    - 27b. GlassSDK Protocol Coverage doc (release gaps, "XGIMI path"): https://github.com/memomind-open/plugin-open-platform/blob/main/GlassSDK/docs/PROTOCOL_COVERAGE.md
28. GitHub community repos:
    - https://github.com/hemge-dynag (memomind-* repos)
    - https://github.com/nicognaW/memo-doom
    - https://github.com/cahorton/Memomind-MD-Reader
    - https://github.com/tropicalstream/pomotime
    - https://github.com/hemge-dynag/memomind-cardio
    - https://github.com/hemge-dynag/memomind-subtext
29. GitHub, hemge-dynag/memomind-quiz (example paired plugin with binary protocol): https://github.com/hemge-dynag/memomind-quiz
