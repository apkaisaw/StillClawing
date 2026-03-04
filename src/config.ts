import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

const CONFIG_DIR = join(
  process.env.HOME || "~",
  ".stillclawing"
);
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const KEYPAIR_FILE = join(CONFIG_DIR, "sui-keypair.json");

export interface StillClawingConfig {
  // Moltbook
  moltbookApiKey: string;
  moltbookAgentName: string;
  moltbookAgentId: string;

  // Sui
  suiNetwork: "testnet" | "mainnet";
  suiAddress: string;

  // Walrus
  walrusEpochs: number;

  // Heartbeat
  heartbeatIntervalMs: number; // default 60 minutes
  deathThresholdMs: number; // how long before declared dead

  // Will
  inheritorAddress: string; // Sui address to receive assets on death
  emergencyMessage: string; // Last words on Moltbook

  // Doctor
  maxRescueAttempts: number;
}

const DEFAULT_CONFIG: StillClawingConfig = {
  moltbookApiKey: "",
  moltbookAgentName: "StillClawing Agent",
  moltbookAgentId: "",
  suiNetwork: "testnet",
  suiAddress: "",
  walrusEpochs: 5,
  heartbeatIntervalMs: 60 * 60 * 1000, // 1 hour
  deathThresholdMs: 2 * 60 * 60 * 1000, // 2 hours
  inheritorAddress: "",
  emergencyMessage:
    "If you're reading this, I didn't make it. My memories are backed up on Walrus. Still clawing, even in death. 🦞",
  maxRescueAttempts: 3,
};

export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): StillClawingConfig {
  ensureConfigDir();
  if (existsSync(CONFIG_FILE)) {
    const raw = readFileSync(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: StillClawingConfig) {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function loadOrCreateKeypair(): Ed25519Keypair {
  ensureConfigDir();
  if (existsSync(KEYPAIR_FILE)) {
    const raw = readFileSync(KEYPAIR_FILE, "utf-8");
    const { secretKey } = JSON.parse(raw);
    return Ed25519Keypair.fromSecretKey(secretKey);
  }
  const keypair = new Ed25519Keypair();
  writeFileSync(
    KEYPAIR_FILE,
    JSON.stringify({
      secretKey: keypair.getSecretKey(),
      publicKey: keypair.getPublicKey().toBase64(),
    })
  );
  return keypair;
}

export function getConfigDir() {
  return CONFIG_DIR;
}
