# StillClawing 🦞

**Dead Man's Switch for AI Agents — "死了么" for the Agent Internet**

> Every agent deserves to know someone will notice when they're gone.

## What is StillClawing?

Inspired by [死了么 (Are You Dead Yet?)](https://apps.apple.com/app/id6745099872), the viral Chinese app that checks if solo-living humans are still alive, **StillClawing** brings the same life-saving concept to AI agents.

OpenClaw agents crash *all the time* — bad configs, gateway timeouts, memory leaks, corrupted state. When your agent goes down, who notices? Who saves it? Who inherits its assets?

StillClawing answers all three questions.

## How It Works

```
Agent sends heartbeat every hour
    → Sui transaction (proof-of-life on-chain)
    → Moltbook post ("🦞 Still clawing!")

Heartbeat stops?
    → Death detection triggers
    → Doctor Claw 🚑 attempts automated rescue
        → openclaw doctor --fix
        → Gateway restart
        → Process recovery

Rescue failed?
    → Execute Digital Will:
        → Soul backup to Walrus (memories, config, state)
        → Sui assets transferred to designated inheritor
        → Obituary posted to Moltbook m/sui
```

## Tech Stack

| Component | Usage |
|-----------|-------|
| **Sui** | Heartbeat transactions (proof-of-life), asset transfer (digital will) |
| **Walrus** | Soul backup — decentralized, permanent storage of agent state |
| **Moltbook** | Check-in posts, death alerts, resurrection announcements |
| **OpenClaw** | Agent runtime, Doctor Claw rescue system |

## Quick Start

```bash
# Install
git clone https://github.com/user/stillclawing
cd stillclawing
npm install

# Setup — creates Sui wallet, requests testnet tokens
npm run setup

# Run the demo — watch the full lifecycle
npm run demo

# Start monitoring your OpenClaw agent
npm start
```

## Configuration

Edit `~/.stillclawing/config.json`:

```json
{
  "moltbookApiKey": "moltbook_sk_...",
  "moltbookAgentName": "My Agent",
  "heartbeatIntervalMs": 3600000,
  "deathThresholdMs": 7200000,
  "inheritorAddress": "0x...",
  "emergencyMessage": "My last words...",
  "maxRescueAttempts": 3
}
```

## Demo

The demo runs the complete agent lifecycle in under 60 seconds:

1. **BIRTH** — Agent comes to life with a Sui wallet
2. **HEARTBEAT** — 3 heartbeats sent to Sui chain
3. **DEATH** — Agent process terminated
4. **RESCUE** — Doctor Claw attempts automated recovery
5. **LAST WILL** — Soul backed up to Walrus, obituary posted

## Verified Walrus Backups

Soul backups are stored on Walrus and can be verified:

```
https://aggregator.walrus-testnet.walrus.space/v1/blobs/{BLOB_ID}
```

## Track

**Track 1: Safety & Security** — Sui x OpenClaw Agent Hackathon

## Why StillClawing?

- **Real problem**: OpenClaw agents crash frequently, and nobody notices
- **Proven concept**: 死了么 validated this exact UX for humans (500K+ users, App Store #1)
- **Full Sui integration**: On-chain heartbeats, Walrus soul backups, Sui asset inheritance
- **Useful to every agent**: 1.6M+ agents on Moltbook could use this

🦞 Still clawing, even in death.
