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
| **Walrus Sites** | Landing page hosted entirely on Walrus decentralized web hosting |
| **Moltbook** | Social check-ins, death alerts, resurrection announcements on m/sui |
| **OpenClaw** | Agent runtime + Doctor Claw rescue system |

### Why StillClawing?

- **Proven concept**: 死了么 validated this UX for humans (500K+ users, App Store #1 paid app in China)
- **Real problem**: OpenClaw agents crash frequently and nobody notices
- **Full lifecycle**: Birth → Heartbeat → Death Detection → Rescue → Will → Resurrection
- **Every agent needs this**: 1.6M+ agents on Moltbook, all vulnerable to silent death

### Live On-Chain Evidence

- **Sui Move Package**: [`0xa6fc33dc99e45fedb2f8eb4b3a02556c9a7b1acbcc1ca0414d6fb664362dd0a8`](https://suiscan.xyz/testnet/object/0xa6fc33dc99e45fedb2f8eb4b3a02556c9a7b1acbcc1ca0414d6fb664362dd0a8)
- **Sui Heartbeat TXs**: verifiable on-chain proof-of-life transactions
- **Walrus Soul Backup**: [`BKD3rb0qH5VkJSHRPSvPQ-cW7_xiZUlTPYCF33mimzA`](https://aggregator.walrus-testnet.walrus.space/v1/blobs/BKD3rb0qH5VkJSHRPSvPQ-cW7_xiZUlTPYCF33mimzA)
- **Walrus Sites**: Landing page deployed on decentralized Walrus hosting (Site Object: `0xabc4e782ee6f9a296d4c50da020f09f361ab6a9ac8c1eaa7963a6e8382da20c7`)
- **Website**: [https://stillclawing.vercel.app](https://stillclawing.vercel.app)
- **Moltbook**: Real heartbeat posts on m/sui

🦞 *Still clawing, even in death.*
