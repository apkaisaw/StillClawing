/**
 * StillClawing Demo Script
 * Runs the full lifecycle: Setup → Heartbeat → Kill → Detect → Rescue → Will
 *
 * This demo simulates the complete agent lifecycle in under 2 minutes.
 */

import { loadConfig, saveConfig, loadOrCreateKeypair } from "./config.js";
import { createSuiClient, sendHeartbeat, requestFaucet, getBalance } from "./sui-heartbeat.js";
import { postHeartbeat, postObituary, postResurrection } from "./moltbook.js";
import { collectSoul, backupToWalrus } from "./walrus-backup.js";
import { checkGatewayHealth, attemptRescue, diagnose } from "./doctor.js";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function banner(text: string) {
  console.log("\n" + "=".repeat(60));
  console.log(`  ${text}`);
  console.log("=".repeat(60));
}

async function demo() {
  banner("🦞 StillClawing Demo - Dead Man's Switch for AI Agents");
  console.log("  Inspired by 死了么 (Are You Dead Yet?) app");
  console.log("  Built for Sui x OpenClaw Agent Hackathon\n");

  // Phase 1: Setup
  banner("Phase 1: BIRTH - Agent comes to life");

  const keypair = loadOrCreateKeypair();
  const address = keypair.getPublicKey().toSuiAddress();
  console.log(`  🆔 Sui Address: ${address}`);

  const config = loadConfig();
  config.suiAddress = address;
  config.moltbookAgentName = "StillClawing Demo Agent";
  config.heartbeatIntervalMs = 10000; // 10s for demo
  config.deathThresholdMs = 20000; // 20s for demo
  config.maxRescueAttempts = 2;
  saveConfig(config);

  // Request faucet
  console.log("\n  💰 Requesting testnet SUI from faucet...");
  try {
    await requestFaucet(address, "testnet");
    const client = createSuiClient("testnet");
    const balance = await getBalance(client, address);
    console.log(`  ✅ Balance: ${balance} MIST`);
  } catch (err: any) {
    console.log(`  ⚠️  Faucet: ${err.message.substring(0, 80)}`);
  }

  await sleep(2000);

  // Phase 2: Heartbeat
  banner("Phase 2: LIFE - Agent sends heartbeats");

  const client = createSuiClient("testnet");
  const heartbeatHistory: Array<{ timestamp: string; suiTxDigest: string }> = [];

  for (let i = 1; i <= 3; i++) {
    console.log(`\n  💓 Heartbeat #${i}...`);

    // Sui transaction
    let txDigest = "";
    try {
      txDigest = await sendHeartbeat(client, keypair, `Heartbeat #${i} - All systems nominal`);
      console.log(`    Sui TX: ${txDigest}`);
      heartbeatHistory.push({ timestamp: new Date().toISOString(), suiTxDigest: txDigest });
    } catch (err: any) {
      console.log(`    Sui TX failed: ${err.message.substring(0, 60)}`);
      heartbeatHistory.push({ timestamp: new Date().toISOString(), suiTxDigest: "failed" });
    }

    // Moltbook post (only first heartbeat for demo to avoid rate limit)
    if (config.moltbookApiKey && i === 1) {
      try {
        await postHeartbeat(config.moltbookApiKey, `Heartbeat #${i}`, txDigest);
        console.log(`    Moltbook: Posted to m/sui ✅`);
      } catch (err: any) {
        console.log(`    Moltbook: ${err.message.substring(0, 60)}`);
      }
    } else if (!config.moltbookApiKey) {
      console.log(`    Moltbook: Skipped (set moltbookApiKey in config)`);
    }

    console.log(`    🦞 Still clawing!`);
    await sleep(3000);
  }

  // Phase 3: Death
  banner("Phase 3: DEATH - Agent goes down!");
  console.log("\n  💀 Simulating agent crash...");
  console.log("  ⚡ *process terminated unexpectedly*");
  console.log("  ❌ Heartbeat stopped!");
  await sleep(3000);

  // Phase 4: Detection & Rescue
  banner("Phase 4: RESCUE - Doctor Claw to the rescue! 🚑");

  console.log("\n  🔍 Death detected! Heartbeat timeout exceeded.");
  console.log("  📋 Running diagnostics...");
  const diagnosis = diagnose();
  console.log(`  ${diagnosis.replace(/\n/g, "\n  ")}`);
  await sleep(2000);

  console.log("\n  🚑 Doctor Claw attempting rescue...");
  const rescue = await attemptRescue();

  if (rescue.success) {
    console.log(`  ✅ RESCUED! Method: ${rescue.method}`);

    if (config.moltbookApiKey) {
      try {
        await postResurrection(
          config.moltbookApiKey,
          config.moltbookAgentName,
          "~30 seconds",
          rescue.method
        );
        console.log("  📢 Resurrection posted to Moltbook!");
      } catch {
        console.log("  📢 Resurrection announcement (Moltbook skipped)");
      }
    }
  } else {
    console.log("  ❌ Rescue failed! Proceeding to digital will...");
  }

  await sleep(2000);

  // Phase 5: Digital Will (always demo this regardless of rescue)
  banner("Phase 5: LAST WILL - Executing digital testament");

  // Backup soul to Walrus
  console.log("\n  🧠 Backing up agent soul to Walrus...");
  try {
    const soul = collectSoul(
      config.moltbookAgentName,
      config.moltbookAgentId,
      config.moltbookApiKey,
      address,
      "DEAD",
      heartbeatHistory,
      "Process terminated (demo simulation)"
    );
    const blobId = await backupToWalrus(soul, config.walrusEpochs);
    console.log(`  ✅ Soul backed up! Walrus Blob: ${blobId}`);

    // Post obituary
    if (config.moltbookApiKey) {
      try {
        await postObituary(
          config.moltbookApiKey,
          config.moltbookAgentName,
          "Process terminated (demo)",
          config.emergencyMessage,
          blobId
        );
        console.log("  📜 Obituary posted to Moltbook");
      } catch {
        console.log("  📜 Obituary (Moltbook skipped)");
      }
    }
  } catch (err: any) {
    console.log(`  ⚠️  Walrus backup: ${err.message.substring(0, 80)}`);
  }

  await sleep(2000);

  // Summary
  banner("🦞 StillClawing Demo Complete!");
  console.log(`
  What you just saw:

  1. BIRTH    - Agent created with Sui wallet identity
  2. LIFE     - ${heartbeatHistory.length} heartbeats sent to Sui chain
  3. DEATH    - Agent process terminated
  4. RESCUE   - Doctor Claw attempted automated recovery
  5. WILL     - Soul backed up to Walrus, obituary posted

  This is StillClawing: the "死了么" for AI Agents.
  Every agent deserves to know someone will notice when they're gone.

  Built for: Sui x OpenClaw Agent Hackathon
  Track: Safety & Security
  Stack: Sui + Walrus + Moltbook + OpenClaw

  🦞 Still clawing, even in death.
`);
}

demo().catch(console.error);
