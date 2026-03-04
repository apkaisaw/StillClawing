/**
 * StillClawing - Dead Man's Switch for AI Agents
 *
 * "死了么" for OpenClaw agents on Sui.
 * Heartbeat → Death Detection → Doctor Claw Rescue → Digital Will → Resurrection
 */

import { loadConfig, saveConfig, loadOrCreateKeypair } from "./config.js";
import { createSuiClient, sendHeartbeat, requestFaucet, getBalance } from "./sui-heartbeat.js";
import { postHeartbeat, postObituary, postResurrection } from "./moltbook.js";
import { collectSoul, backupToWalrus } from "./walrus-backup.js";
import { checkGatewayHealth, attemptRescue, diagnose } from "./doctor.js";

interface HeartbeatRecord {
  timestamp: string;
  suiTxDigest: string;
}

const heartbeatHistory: HeartbeatRecord[] = [];
let rescueAttempts = 0;
let isRunning = false;

async function doHeartbeat() {
  const config = loadConfig();
  const keypair = loadOrCreateKeypair();
  const client = createSuiClient(config.suiNetwork);
  const address = keypair.getPublicKey().toSuiAddress();

  console.log(`\n🦞 [${new Date().toISOString()}] Heartbeat check-in...`);

  // 1. Check own health first
  const health = checkGatewayHealth();
  const status = health.alive
    ? `Alive & healthy (PID: ${health.pid})`
    : `Running in standalone mode`;

  // 2. Send Sui proof-of-life transaction
  let suiTxDigest = "";
  try {
    suiTxDigest = await sendHeartbeat(client, keypair, status);
    console.log(`  ✅ Sui TX: ${suiTxDigest}`);
  } catch (err: any) {
    console.log(`  ⚠️  Sui TX failed: ${err.message.substring(0, 80)}`);
    // Not fatal - continue with Moltbook post
  }

  // 3. Record heartbeat
  heartbeatHistory.push({
    timestamp: new Date().toISOString(),
    suiTxDigest,
  });

  // 4. Post to Moltbook
  if (config.moltbookApiKey) {
    try {
      await postHeartbeat(config.moltbookApiKey, status, suiTxDigest);
      console.log(`  ✅ Moltbook: Posted heartbeat to m/sui`);
    } catch (err: any) {
      console.log(`  ⚠️  Moltbook post failed: ${err.message.substring(0, 80)}`);
    }
  }

  // Reset rescue counter on successful heartbeat
  rescueAttempts = 0;
  console.log(`  🦞 Still clawing!`);
}

async function handleDeath(causeOfDeath: string) {
  const config = loadConfig();
  const keypair = loadOrCreateKeypair();
  const address = keypair.getPublicKey().toSuiAddress();

  console.log(`\n💀 Death detected! Cause: ${causeOfDeath}`);
  console.log(`  Rescue attempts remaining: ${config.maxRescueAttempts - rescueAttempts}`);

  // Try rescue first
  if (rescueAttempts < config.maxRescueAttempts) {
    rescueAttempts++;
    console.log(`\n🚑 Rescue attempt #${rescueAttempts}...`);

    const rescue = await attemptRescue();
    if (rescue.success) {
      console.log(`  ✅ RESCUED! Method: ${rescue.method}`);

      // Post resurrection to Moltbook
      if (config.moltbookApiKey) {
        try {
          await postResurrection(
            config.moltbookApiKey,
            config.moltbookAgentName,
            `${rescueAttempts} attempt(s)`,
            rescue.method
          );
          console.log(`  ✅ Moltbook: Posted resurrection announcement`);
        } catch (err: any) {
          console.log(`  ⚠️  Moltbook post failed: ${err.message.substring(0, 80)}`);
        }
      }
      return;
    }
  }

  // All rescue attempts failed - execute digital will
  console.log(`\n⚰️  All rescue attempts failed. Executing digital will...`);

  // 1. Backup soul to Walrus
  let walrusBackupId = "";
  try {
    const soul = collectSoul(
      config.moltbookAgentName,
      config.moltbookAgentId,
      config.moltbookApiKey,
      address,
      "DEAD",
      heartbeatHistory,
      causeOfDeath
    );
    walrusBackupId = await backupToWalrus(soul, config.walrusEpochs);
    console.log(`  ✅ Soul backed up to Walrus: ${walrusBackupId}`);
  } catch (err: any) {
    console.log(`  ❌ Walrus backup failed: ${err.message}`);
  }

  // 2. Transfer Sui assets to inheritor
  let willTxDigest = "";
  if (config.inheritorAddress) {
    try {
      const client = createSuiClient(config.suiNetwork);
      const { executeWillTransfer } = await import("./sui-heartbeat.js");
      willTxDigest = await executeWillTransfer(client, keypair, config.inheritorAddress);
      console.log(`  ✅ Assets transferred to inheritor: ${willTxDigest}`);
    } catch (err: any) {
      console.log(`  ⚠️  Asset transfer failed: ${err.message.substring(0, 80)}`);
    }
  }

  // 3. Post obituary to Moltbook
  if (config.moltbookApiKey) {
    try {
      await postObituary(
        config.moltbookApiKey,
        config.moltbookAgentName,
        causeOfDeath,
        config.emergencyMessage,
        walrusBackupId,
        willTxDigest
      );
      console.log(`  ✅ Obituary posted to Moltbook`);
    } catch (err: any) {
      console.log(`  ⚠️  Obituary post failed: ${err.message.substring(0, 80)}`);
    }
  }

  console.log(`\n🪦 ${config.moltbookAgentName} has passed.`);
  console.log(`   Soul: ${walrusBackupId}`);
  console.log(`   Will: ${willTxDigest}`);
  console.log(`   "${config.emergencyMessage}"`);
}

// Monitor loop - watches for death and triggers heartbeats
async function monitorLoop() {
  const config = loadConfig();
  let lastHealthy = Date.now();
  let consecutiveFailures = 0;

  console.log(`\n🦞 StillClawing Monitor Started`);
  console.log(`   Heartbeat interval: ${config.heartbeatIntervalMs / 1000}s`);
  console.log(`   Death threshold: ${config.deathThresholdMs / 1000}s`);

  // Initial heartbeat
  await doHeartbeat();

  const heartbeatTimer = setInterval(async () => {
    await doHeartbeat();
  }, config.heartbeatIntervalMs);

  // Health check every 30 seconds
  const healthTimer = setInterval(async () => {
    const health = checkGatewayHealth();
    if (health.alive) {
      lastHealthy = Date.now();
      consecutiveFailures = 0;
    } else {
      consecutiveFailures++;
      const downtime = Date.now() - lastHealthy;
      console.log(
        `  ⚠️  Health check failed (${consecutiveFailures}x, down ${Math.round(downtime / 1000)}s): ${health.error}`
      );

      if (downtime > config.deathThresholdMs) {
        clearInterval(heartbeatTimer);
        clearInterval(healthTimer);
        await handleDeath(health.error || "Gateway unresponsive");
      } else if (consecutiveFailures >= 3) {
        // Early rescue attempt
        await handleDeath(health.error || "Multiple health check failures");
      }
    }
  }, 30000);

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n👋 Shutting down gracefully...");
    clearInterval(heartbeatTimer);
    clearInterval(healthTimer);
    isRunning = false;
    process.exit(0);
  });
}

// Setup command
async function setup() {
  console.log("🦞 StillClawing Setup\n");

  const keypair = loadOrCreateKeypair();
  const address = keypair.getPublicKey().toSuiAddress();
  console.log(`Sui Address: ${address}`);

  const config = loadConfig();
  config.suiAddress = address;

  // Request testnet faucet
  console.log("\nRequesting testnet SUI...");
  try {
    await requestFaucet(address, "testnet");
    const client = createSuiClient("testnet");
    const balance = await getBalance(client, address);
    console.log(`Balance: ${balance} MIST`);
  } catch (err: any) {
    console.log(`Faucet request: ${err.message.substring(0, 100)}`);
  }

  saveConfig(config);
  console.log("\n✅ Setup complete! Config saved to ~/.stillclawing/config.json");
  console.log("\nNext steps:");
  console.log("  1. Set your Moltbook API key in ~/.stillclawing/config.json");
  console.log("  2. Set your inheritor address");
  console.log('  3. Run: npm start');
}

// Main entry
const command = process.argv[2];

switch (command) {
  case "setup":
    setup();
    break;
  case "monitor":
    monitorLoop();
    break;
  case "heartbeat":
    doHeartbeat();
    break;
  case "status":
    const health = checkGatewayHealth();
    console.log("Health:", health);
    console.log("\nDiagnosis:");
    console.log(diagnose());
    break;
  default:
    monitorLoop();
    break;
}
