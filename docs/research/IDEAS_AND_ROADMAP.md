# MemoMind Plugin Ideas, Feasibility & Roadmap

Date: **2026-11-09**. This replaces the 2026-11-01 version, which was written before we had the full
history of the official Memomind Discord. That version is still in git history (`git log -- docs/research/IDEAS_AND_ROADMAP.md`).

Sources:
- **Memomind Discord knowledge base:** private repo `dvreno/memomind-dev-kb`, local copy at
  `../../../discord-kb`. It has staff answers, bugs and fixes, community projects and the
  official changelog, each tagged with date and author. It refreshes daily.
- [`../sdk/SDK_OVERVIEW.md`](../sdk/SDK_OVERVIEW.md): what the SDK exposes, with file:line evidence.
- [`memomind-glasses.md`](memomind-glasses.md) and [`competitive-landscape.md`](competitive-landscape.md):
  product and market research.

Where these disagree, **staff statements in Discord win over the SDK docs, which win over market
research**. Discord facts below cite `(date, author)`. Details are in the KB.

---

## 1. The platform in one page (corrected)

**MemoMind One:** a binocular monochrome-green HUD at **600×350, 4-bit (16 levels)**, rendered with
**LVGL** on the glasses. Both lenses show the same image; there's no 3D or parallax API
(2026-10-23, memo fly fish). It has 3 mics, speakers, a 6-axis IMU and one button. There's **no
camera** (and none planned for App Workspace v1), no Wi-Fi, no GPS, and no eye or blink sensors. It
connects to the phone over Bluetooth (Classic SPP for recording and the companion link, BLE for
other things).

| | Phone **Web plugin** (`.mmpkg`) | Glasses **native plugin** (`.gmp`) |
| --- | --- | --- |
| Runs on | Official app's WebView (iOS/Android) | RISC-V MCU, from Flash |
| Language | HTML / JS | C (gnu99, no libc) |
| Can use | `fetch`, phone GPS (**foreground only**), glasses mic (raw **Opus**) via `gm.audio.openCapture/openRecording` (`audio.capture` permission, noise-reduction modes), storage, button/IMU events, HUD text + LZ4 4-bit images via the Web Bridge, H5 `<audio>` playback | LVGL subset, framebuffer, button, IMU, **HOGP** HID input (rings, remotes, keyboards), battery, wear sensor, TLV data from the phone plugin |
| Can't use | **Memo AI** (by design), notifications/SMS/contacts, raw BLE to other devices, RSSI, camera | Mic, network, persistent storage, wall clock |
| Limits | 10 MB package | **500 KiB Flash** (else `Import failed: Operation failed`), <100 KiB RAM, 1 plugin at a time |

**What changed since the old version** (all from Discord):
- **Background works better than we thought.** The WebView keeps running when the app is
  backgrounded, and `suspended` is only a lifecycle notice, not a stop signal (2026-10-27, memo fly
  fish).
- iOS background audio was fixed in app **1.3.82**. Android background mic with the screen off
  (`PERMISSION_DENIED`) is getting its fix in the next app version, due the week of 2026-11-09
  (MemoMind-aiwen). Until then, open the mic while the screen is on and keep it open.
- **Plugins can't call Memo AI.** MemoMind exposes the hardware, and you bring your own AI. When you
  use the SDK audio API, no speech-to-text happens on MemoMind's side (2026-09-30, Memo William).
- **Bluetooth bandwidth is the limit.** Expect about 200–500 ms per frame; real-time video won't
  work. Staff's recipe: pack two pixels per byte, compress with LZ4, send only the tiles that
  changed, and draw text and shapes on the glasses. Measured: 105 KB per frame drops to 1.5–8 KB,
  about 2 fps. The simulator isn't rate-limited, so always test on hardware.
- **Input is HOGP only.** Proprietary BLE controllers don't work. Known to work: D06 / D06 Pro ring
  mice, an XGIMI remote, the KiWear ring. No cursor X/Y stream yet.
- **Distribution:** you need the whitelist (rounds 1–2 were in October; round 3 is "later in
  November") and app ≥ 1.3.81. Plugins launch **only** from Settings → Memo Lab → Developer
  Workbench, not from Quick Launch or the glasses. There's no store and no sharing. No Linux
  Studio.

### What shapes every idea
1. **Intelligence lives on your phone or your own cloud.** Glasses are display plus input.
   Bring your own speech-to-text, LLM and TTS.
2. **Bandwidth, not pixels, is the budget.** Design for text and small changes, not full-frame
   redraws.
3. **Input is scarce.** Plan for 3–4 buttons (single button, head nod/shake, or a HOGP ring).
4. **Glances, not sessions.** The community's lessons: design for ~15-second looks, use dense
   notation (P:34, 1-for-4), and put a brightness control on every screen because of glare.
   Head-motion navigation causes neck strain, so prefer the ring or arrow keys.
5. **Launch friction is real.** It takes several taps to reach a plugin. Plugins that run all day
   and get started once beat plugins you open many times a day.

---

## 2. What already exists (don't duplicate; reuse or coordinate)

From the Discord showcase and dev channels:

| Area | Existing community work |
|---|---|
| Agents | Agent Mirror (therealharpreet, one agent on the lens, nod or ring to pick; to be open-sourced), memomind-terminal-hermes, Hermes agent apps, Memo Agent / Terminal Mode (official) |
| Captions / conversation | IRIS (live conversation assistant), "Encyclopedia" (detects questions and shows answers) |
| Navigation | Navigaze (turn-by-turn), Wayfinder HUD, HelmHud (boating) |
| Productivity | PomoTime and other Pomodoro apps, Matrix client, smart replies, a sports/fantasy ticker (Sleeper API) |
| Home | Home Assistant integrations (dynag; George's HA + OpenClaw + Claude) |
| Clients | gm_glasses_flutter (native BLE client), custom APKs replacing the companion app (AI Bridge, Alfred) |
| Korean community | GLOW OS Plus and its forks (launcher-style suites) |
| Games | Step-based pixel RPG, voice wizard duel, chess and Game Boy emulator concepts |

The gaps are mostly **plumbing** that every one of these projects rebuilt by hand, plus a few
long-standing complaints nobody has fixed.

---

## 3. Ranked: plugins and tools the community needs

**Need** is 1–5, based on how often it comes up in Discord. **Feasibility** is 1–5 against
today's SDK. **Effort**: S ≈ 1–3 days, M ≈ 1–2 weeks, L longer.

| Rank | Idea | Need | Feas. | Effort | Evidence / reasoning |
|---|---|---|---|---|---|
| 1 | **OpenClaw Doctor + routing proxy:** checks reachability, approval state and the Tailscale path; explains "Initialization returned false" and prints the `openclaw devices/nodes approve` commands; rewrites `model: "openclaw"` → `"openclaw/main"` for multi-agent gateways | 5 | 5 | S | The most repeated unsolved dev-support thread. The fix is a hand-rolled ~25-line proxy and the app has no setting for it. It's a companion CLI, not a glasses plugin. |
| 2 | **HUD render kit (JS library):** Canvas/HTML → 4-bit green → LZ4 → changed tiles; text layout for 600×350; an asset loader that sends images over Bluetooth after launch | 5 | 5 | M | Every visual plugin rebuilds staff's recipe, and the post-launch asset path avoids the 500 KiB `Import failed` error. |
| 3 | **Voice I/O kit:** mic driver that stays open (works around `PERMISSION_DENIED`), Opus → PCM, a pluggable streaming STT adapter, H5 TTS playback, push-to-talk on button or ring | 5 | 4 → 5 once the background-capture update ships | M | No speech-to-text or TTS for plugins, Memo AI is off-limits, and the mic is the top dev-support topic. |
| 4 | **Controller tester + input abstraction:** shows live which HID buttons a device sends and whether it's HOGP; one API covering button, head gestures and rings | 5 | 4 | S | "Will my remote work?" comes up all the time (Galaxy Watch, WowMouse, 8BitDo, R08, Chromecast remote) and nothing answers it. |
| 5 | **"Next Up" calendar card** from a private iCal / CalDAV feed, with multiple accounts | 4 | 5 | S | Google linking is broken for some users, events go missing on the glasses, and only one Google account is allowed. |
| 6 | **Paged agent reader:** scrollback, ring paging, an LLM summary of long output, and "what's it waiting for?" | 4 | 4 | M | The top Terminal Mode complaints (too fast, no scrollback). Ship it as a library and coordinate with Agent Mirror. |
| 7 | **Community plugin index:** repo template, GitHub Action building `.gmp` / `.mmpkg`, QR install pages | 4 | 4 | S–M | There's no store, showcase posts share no source, and Discord CDN links expire. Installing still needs the whitelist. |
| 8 | **Upstream fixes to the SDK repo:** `check_pair.py` accepting gm-review v3, a clear error for oversize packages, documenting the 500 KiB limit | 3 | 5 | S | Open bugs with no staff reply. Cheap and builds goodwill. |
| 9 | **Desktop `.gmp` emulator** (Linux/macOS/Windows, SDL) with **real Bluetooth throttling** | 3 | 4 | L | There's no Linux Studio, and Studio isn't rate-limited, so it hides real performance. |
| 10 | Find-my-phone / link-strength card | 3 | 2 | M | Requested, but there's no RSSI and no BLE bridge. Staff suggested sending a Bluetooth packet to the phone, and the API for that is unclear. |

**Blocked: request these from MemoMind instead of building them**
- A custom launcher, a Quick Launch entry, or auto-starting plugins: you can't launch other apps from a plugin.
- Reading or triaging notifications (no API).
- A cursor X/Y stream ("underway").
- Camera access ("future update").
- A `bluetooth.ble` bridge and RSSI.
- An agent/model field on the OpenClaw config page.
- A Linux Studio.
- Publishing and sharing plugins.

---

## 4. Ranked: bespoke plugins for you

These are inferred from this Mac: the Agent Dashboard plugin and MemoMind MCP server, VREMS
Zendesk/Statuspage work, Claude Code over Tailscale, ComfyUI, and RP and streaming Discord
communities. Re-rank if the inferences are off.

| Rank | Idea | Need | Feas. | Effort | Notes |
|---|---|---|---|---|---|
| 1 | **Agent Dashboard phase 4:** native `.gmp` with icons, **history scrolling and ring support**. This is the paged reader (community #6). | 5 | 4 | M | Phases 1–3 and 5 are done (status feed, nod/shake approvals, MCP `glasses_notify/ask/converse`, voice via audio.cpp, remote MCP connector). Phase 4 fixes exactly what people dislike about Terminal Mode and makes the project worth showing off. Needs the HUD kit (#2) and input abstraction (#4). |
| 2 | **Help-desk HUD (Zendesk + Statuspage):** new urgent or escalated tickets, SLA countdowns, queue counts by view, an active-incident banner; ring cycles through cards, nod claims a ticket | 4–5 | 4 | M | Uses the Zendesk API through your own relay. **Show only ticket number, priority, subject and SLA, never voter or requester data.** Check your agency's IT/security policy before connecting work systems to a personal device or relay. |
| 3 | **Long-job pinger:** ComfyUI queue done or failed, Claude sessions finished or blocked, the nightly KB update result, as one glanceable card each | 3 | 5 | S | Mostly hooks around the `glasses_notify` MCP tool you already have. Quick win. |
| 4 | **Pocket KB lookup:** push-to-talk "why does import fail?" → search discord-kb (FIXES.md first) → answer card | 3 | 4 | S–M | Tests the voice kit (#3) and is useful while you develop. |
| 5 | **RP second screen:** 10-code, penal-code and callsign lookup, a call timer, a quick-notes card | 3 | 3 | M | Lookups work anywhere. Live dispatch or MDT data only works on servers you run, since most RP servers ban client mods. |
| 6 | **Stream companion:** chat highlights, follows and subs, a stream-health card | 2–3 | 5 | S | Only if you stream regularly (Twitch EventSub / YouTube). |

---

## 5. Recommended sequence

1. **OpenClaw Doctor (#C1).** Two days, high goodwill, no glasses needed.
2. **HUD render kit + input abstraction (#C2, #C4)**, extracted while building **Agent Dashboard
   phase 4 (#B1)**. Open-source the kit.
3. **Voice I/O kit (#C3)**, once the background-capture app update ships. Use it for the
   **Pocket KB lookup (#B4)**.
4. **Help-desk HUD (#B2)** on top of the kit, after the policy check.
5. **Long-job pinger (#B3)** whenever you have an hour.
6. Plugin index + CI (#C7) once you have two or three plugins to list.

Each bespoke plugin produces one of the community libraries, so building for yourself also fills
the community's top gaps.

## 6. Tech stack notes (still valid)

- **Phone side:** vanilla JS/TS + esbuild/Vite, using PhoneSDK `gm-plugin-web-sdk.esm.js`. Never
  ship API keys in `.mmpkg`; use a small relay (Cloudflare Workers / your Tailscale Mac) or a
  user-entered key in `gm.storage`.
- **STT:** Deepgram / AssemblyAI / OpenAI realtime, or whisper.cpp / audio.cpp locally (already
  used in Agent Dashboard phase 5). Opus → PCM with `opus-decoder` (WASM) or `opusRecordingToOgg`.
- **Glasses side:** C gnu99, xPack `riscv-none-elf-gcc`, CMake + Ninja, PyNaCl for review
  sidecars. Static allocation, no blocking, stay well under 500 KiB.
- **Relay:** Cloudflare Workers + Durable Objects, or the Tailscale-reachable Mac (already used by
  memomind-terminal).
