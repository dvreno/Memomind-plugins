# Memomind-plugins

Plugins and research for the **MemoMind One** smart glasses, built on the official
[MemoMind Plugin Open Platform](https://github.com/memomind-open/plugin-open-platform).

## Plugins

| Plugin | What it does | Status |
| --- | --- | --- |
| [Agent Dashboard](plugins/agent-dashboard/) | Claude Code activity on the HUD; nod/shake to answer permission prompts | Phases 1–2 built; simulator-tested, awaiting glasses |

## Documentation

| Document | What's in it |
| --- | --- |
| [docs/research/IDEAS_AND_ROADMAP.md](docs/research/IDEAS_AND_ROADMAP.md) | **Start here.** Feasibility summary, what we can and can't build, tech stacks, 63 plugin ideas, standout ideas and next steps |
| [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) | Condensed official onboarding: toolkit layout, prerequisites, running examples in Studio and on glasses, troubleshooting |
| [docs/sdk/SDK_OVERVIEW.md](docs/sdk/SDK_OVERVIEW.md) | Technical overview of the SDK: architecture, hardware limits, full API surface, build/install pipeline, constraints (with file:line references) |
| [docs/research/memomind-glasses.md](docs/research/memomind-glasses.md) | The product: company, specs, built-in features, plugin ecosystem, reviews, shortcomings, roadmap (sourced) |
| [docs/research/competitive-landscape.md](docs/research/competitive-landscape.md) | Other smart glasses, developer ecosystems, user demand, common shortcomings, emerging ideas (sourced) |

## SDK

The SDK isn't vendored here. Clone it next to this repo:

```sh
git clone --depth 1 https://github.com/memomind-open/plugin-open-platform
```
