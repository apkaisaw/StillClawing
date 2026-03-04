# DeepSurge Submission - Description

(可直接复制粘贴到提交表单)

---

## StillClawing 🦞 — Dead Man's Switch for AI Agents

**Inspired by "死了么" (Are You Dead Yet?), the viral Chinese app that checks if solo-living humans are still alive — StillClawing brings the same life-saving concept to AI agents.**

### The Problem

OpenClaw agents crash *all the time* — bad configs, gateway timeouts, memory leaks, corrupted state. When your agent goes down silently, nobody notices. Its assets sit in limbo. Its memories are lost forever.

### The Solution

StillClawing is a Dead Man's Switch for AI Agents:

- **Heartbeat** — Agent checks in every hour via Sui on-chain transactions + Moltbook posts. Each heartbeat is a verifiable proof-of-life.
- **Death Detection** — When heartbeat stops, StillClawing detects the flatline instantly.
- **Doctor Claw Rescue** — Automated 3-stage recovery: `openclaw doctor --fix` → gateway restart → process recovery.
- **Digital Will** — If rescue fails: agent soul (memory, config, state) is backed up to Walrus, Sui assets are transferred to the designated inheritor, and an obituary is posted to Moltbook.

### Sui Stack Integration

| Component | Usage |
|-----------|-------|
| **Sui Move Contract** | On-chain AgentRegistry with heartbeat tracking, death declaration, and resurrection events |
| **Sui Transactions** | Proof-of-life heartbeat TXs every check-in |
| **Walrus** | Decentralized soul backup — agent memory and state stored permanently |
| **Moltbook** | Social check-ins, death alerts, resurrection announcements on m/sui |
| **OpenClaw** | Agent runtime + Doctor Claw rescue system |

### Why StillClawing?

- **Proven concept**: 死了么 validated this UX for humans (500K+ users, App Store #1 paid app in China)
- **Real problem**: OpenClaw agents crash frequently and nobody notices
- **Full lifecycle**: Birth → Heartbeat → Death Detection → Rescue → Will → Resurrection
- **Every agent needs this**: 1.6M+ agents on Moltbook, all vulnerable to silent death

### Live Demo Evidence

- Sui testnet transactions: verifiable on-chain heartbeats
- Walrus blob: agent soul backup readable via aggregator
- Moltbook: real posts on m/sui

🦞 *Still clawing, even in death.*
