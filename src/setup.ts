/**
 * StillClawing Setup Script
 * Creates Sui keypair, requests faucet, and initializes config
 */

import { loadConfig, saveConfig, loadOrCreateKeypair } from "./config.js";
import { createSuiClient, requestFaucet, getBalance } from "./sui-heartbeat.js";

async function setup() {
  console.log("🦞 StillClawing - Setup\n");
  console.log('  "死了么" for AI Agents on Sui\n');

  // Step 1: Create or load keypair
  console.log("Step 1: Sui Wallet");
  const keypair = loadOrCreateKeypair();
  const address = keypair.getPublicKey().toSuiAddress();
  console.log(`  Address: ${address}`);

  // Step 2: Request faucet
  console.log("\nStep 2: Testnet Faucet");
  try {
    await requestFaucet(address, "testnet");
    const client = createSuiClient("testnet");
    const balance = await getBalance(client, address);
    console.log(`  Balance: ${balance} MIST ✅`);
  } catch (err: any) {
    console.log(`  Faucet: ${err.message.substring(0, 100)}`);
    console.log("  (You may need to manually request from https://faucet.testnet.sui.io)");
  }

  // Step 3: Save config
  console.log("\nStep 3: Configuration");
  const config = loadConfig();
  config.suiAddress = address;
  saveConfig(config);
  console.log("  Config saved to ~/.stillclawing/config.json ✅");

  // Step 4: Instructions
  console.log("\n" + "─".repeat(50));
  console.log("Setup complete! Next steps:\n");
  console.log("  1. (Optional) Register on Moltbook and add API key:");
  console.log('     Edit ~/.stillclawing/config.json → "moltbookApiKey"');
  console.log("\n  2. (Optional) Set your inheritor Sui address:");
  console.log('     Edit ~/.stillclawing/config.json → "inheritorAddress"');
  console.log("\n  3. Run the demo:");
  console.log("     npm run demo");
  console.log("\n  4. Start monitoring:");
  console.log("     npm start");
  console.log("\n🦞 Still clawing!");
}

setup().catch(console.error);
