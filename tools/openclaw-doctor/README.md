# OpenClaw Doctor

A small Node CLI for MemoMind One owners whose glasses can't reach their
[OpenClaw](https://openclaw.ai) gateway. It does two things:

- **`doctor`** runs read-only checks and tells you what's wrong in plain language.
  It also prints the exact values to type into **Memo Lab → OpenClaw** in the
  MemoMind app.
- **`proxy`** is a tiny pass-through that makes multi-agent gateways work with the
  app. It rewrites `model: "openclaw"` to `"openclaw/main"` and forwards everything
  else.

These are the two most common OpenClaw problems in the official MemoMind Discord,
and the app has no setting for either. The fixes come from community members who
solved them. Staff haven't confirmed them (see
[`discord-kb` FIXES.md](https://github.com/dvreno/memomind-dev-kb)).

No dependencies. Node 18 or newer.

## Quick start

Run it on the machine where the OpenClaw gateway runs:

```sh
cd tools/openclaw-doctor
OPENCLAW_TOKEN='<your gateway token>' node bin/openclaw-doctor.js doctor
```

To install it as a command, run `npm link` here, then `openclaw-doctor doctor`.

If the doctor reports **Multi-agent gateway**, start the proxy it suggests and
leave it running:

```sh
openclaw-doctor proxy --listen 100.x.y.z --upstream http://127.0.0.1:18789 --agent main
```

Then set the app's **SSE chat URL** to `http://100.x.y.z:18795/v1/chat/completions`.
Leave the Gateway WS URL and Access Token as they are.

## What `doctor` checks

| # | Check | How |
|---|---|---|
| 1 | Gateway reachable on this machine | TCP connect to `--gateway` (default `http://127.0.0.1:18789`) |
| 2 | Gateway reachable over Tailscale, the way the phone sees it | TCP connect to this machine's Tailscale IP (from `tailscale status --json`, or `--tailscale-ip`) |
| 3 | Phone is online in the tailnet | iOS/Android peers in `tailscale status --json` and their `Online` flag |
| 4 | `/v1/chat/completions` answers | One streaming POST with `model: "openclaw"`, like the app sends. It reads the first chunk, then hangs up. Detects `400 Multiple agents are configured…`, 401/403 and 404 |
| 5 | Pending device and node approvals | Runs `openclaw devices list` and `openclaw nodes pending`, then prints `openclaw devices approve <requestId>` and `openclaw nodes approve <nodeRequestId>` for you to run |
| 6 | App settings | Prints the Gateway WS URL and SSE chat URL to use (the proxy URL when needed) |

The exit code is `1` if any check fails and `0` otherwise.

**Read-only.** The doctor only runs *list* commands. It never approves a device,
changes the gateway config, or starts anything. Check 4 can cost one very short
agent turn (`max_tokens: 8`). Skip it with `--no-chat`.

### Options

```
doctor  --gateway <url>  --tailscale-ip <ip>  --token <t> (or OPENCLAW_TOKEN)
        --agent <id>  --proxy-port <n>  --no-chat  --no-cli  --no-tailscale
proxy   --listen <ip> (required)  --port <n> (18795)  --upstream <url>
        --agent <id> (main)  --allow-all-interfaces
```

## Troubleshooting

| What you see | Likely cause | Fix |
|---|---|---|
| Test Connection: **"Initialization returned false"** | The phone isn't approved on the gateway yet | On the gateway, run `openclaw devices list`, then `openclaw devices approve <requestId>`. Then run `openclaw nodes pending`, then `openclaw nodes approve <nodeRequestId>`. The node ID is a **different** ID. `doctor` prints both commands. |
| "Initialization returned false" with a `100.x` or `*.ts.net` address | **Tailscale is off on the phone**, so the address never resolves | Turn Tailscale on in the phone app and keep it on. A Wi-Fi ⇄ cellular switch can drop the link for about 45 s. `doctor` flags phones that show as offline. |
| Gateway logs say "node command surface withheld" | The device is approved but the node isn't | `openclaw nodes pending`, then `openclaw nodes approve <nodeRequestId>` |
| Your words show on the glasses but **no answer arrives** | Multi-agent gateway: the app sends `model: "openclaw"` and gets `400 Multiple agents are configured, but this operation has no explicit owner.` The app hides the error. | Run `openclaw-doctor proxy` and point the **SSE chat URL** at it. The proxy rewrites the model to `openclaw/<agent>`. |
| `doctor`: reachable locally but **not on the Tailscale IP** | The gateway listens on localhost only | Change the gateway's bind address to your LAN or tailnet, or publish it with Tailscale Serve (`wss://…ts.net`) |
| `doctor`: `/v1/chat/completions` returns 401/403 | Wrong token | Use the gateway's auth token or password, the same one as the app's Access Token |
| `doctor`: `/v1/chat/completions` returns 404 | The gateway's OpenAI-compatible HTTP endpoint is off | Enable it in your OpenClaw config (see the OpenClaw docs) |
| The proxy says **"Refusing to bind 0.0.0.0"** | This is on purpose. The proxy forwards your token to the gateway. | Pass your Tailscale `100.x` IP (or LAN IP) to `--listen` |
| Proxy log shows `502 upstream error` | The proxy can't reach the gateway | Check `--upstream` (default `http://127.0.0.1:18789`) and that the gateway is running |
| Chat messages never reach OpenClaw, with no HTTP request at all | Unknown. Reported in Discord with no staff answer. | Check that **Enable OpenClaw** is on and that the SSE URL ends in `/v1/chat/completions`. Then send in-app feedback with logs (Profile → Feedback → Upload Logs). |
| You downgraded OpenClaw and it can't open its data | Database schema mismatch | Don't downgrade. 2026.10.4 is reported to work. |

## Proxy details

- Forwards only paths under `/v1/` (anything else gets 404).
- Rewrites only `model === "openclaw"`. A model like `openclaw/other` passes through unchanged.
- Passes `Authorization` and other headers through. Streams SSE back without buffering it.
- **Never logs secrets.** Each request gets one log line: time, method, path, status,
  duration, and whether the model was rewritten. Headers and bodies are never logged.
- Binds only to the `--listen` address you give it. It won't bind `0.0.0.0`/`::`
  unless you pass `--allow-all-interfaces`.

## Caveats

- `openclaw` wasn't installed while this was written, so the CLI commands come from
  the Discord, not from `openclaw --help`. The tool passes no extra flags.
  Request IDs are pulled from the plain-text output heuristically, so the raw
  output is always printed too.
- The `*.ts.net` / Tailscale Serve path (`wss://`) is handled by passing
  `--gateway https://<host>.ts.net`. It was tested only with mocks.

## Tests

```sh
npm test
```

The tests use a mock gateway (`test/mock-gateway.js`) that returns the real
`400 Multiple agents are configured…` error for `model: "openclaw"` and streams
SSE for `openclaw/<agent>`. They check the doctor's diagnosis and that the proxy
fixes it. They also check that tokens never show up in output or logs, that the
doctor never runs an approve command, and that the proxy won't bind 0.0.0.0.
