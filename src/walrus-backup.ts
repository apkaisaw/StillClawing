/**
 * Walrus decentralized storage integration
 * Backs up agent state ("soul") and provides restore functionality
 */

import { execSync } from "child_process";
import { writeFileSync, readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { getConfigDir } from "./config.js";

interface AgentSoul {
  agentName: string;
  timestamp: string;
  // Agent memory / state
  memories: Record<string, any>;
  // OpenClaw configuration snapshot
  openclawConfig?: any;
  // Moltbook identity
  moltbookAgentId: string;
  moltbookApiKey: string;
  // Sui address
  suiAddress: string;
  // Last known status
  lastStatus: string;
  // Cause of death (if applicable)
  causeOfDeath?: string;
  // Heartbeat history
  heartbeatHistory: Array<{
    timestamp: string;
    suiTxDigest: string;
  }>;
}

// Collect agent state into a "soul" object
export function collectSoul(
  agentName: string,
  moltbookAgentId: string,
  moltbookApiKey: string,
  suiAddress: string,
  lastStatus: string,
  heartbeatHistory: Array<{ timestamp: string; suiTxDigest: string }>,
  causeOfDeath?: string
): AgentSoul {
  // Try to read OpenClaw config
  let openclawConfig: any = null;
  const openclawConfigPath = join(
    process.env.HOME || "~",
    ".openclaw",
    "openclaw.json"
  );
  if (existsSync(openclawConfigPath)) {
    try {
      openclawConfig = JSON.parse(readFileSync(openclawConfigPath, "utf-8"));
      // Redact sensitive fields
      if (openclawConfig.apiKeys) {
        openclawConfig.apiKeys = "[REDACTED]";
      }
    } catch {
      // ignore
    }
  }

  return {
    agentName,
    timestamp: new Date().toISOString(),
    memories: loadMemories(),
    openclawConfig,
    moltbookAgentId,
    moltbookApiKey,
    suiAddress,
    lastStatus,
    causeOfDeath,
    heartbeatHistory,
  };
}

// Load any saved memories/notes from the config dir
function loadMemories(): Record<string, any> {
  const memoriesDir = join(getConfigDir(), "memories");
  const memories: Record<string, any> = {};
  if (existsSync(memoriesDir)) {
    for (const file of readdirSync(memoriesDir)) {
      try {
        memories[file] = readFileSync(join(memoriesDir, file), "utf-8");
      } catch {
        // ignore
      }
    }
  }
  return memories;
}

// Backup soul to Walrus - tries HTTP publisher first, then CLI
export async function backupToWalrus(
  soul: AgentSoul,
  epochs: number = 2
): Promise<string> {
  const tmpFile = join(getConfigDir(), "soul-backup.json");
  const soulJson = JSON.stringify(soul, null, 2);
  writeFileSync(tmpFile, soulJson);

  // Try HTTP publisher API first (most reliable)
  try {
    const publisherUrl = "https://publisher.walrus-testnet.walrus.space";
    const res = await fetch(`${publisherUrl}/v1/blobs?epochs=${epochs}`, {
      method: "PUT",
      body: soulJson,
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      const blobId =
        data?.newlyCreated?.blobObject?.blobId ||
        data?.alreadyCertified?.blobId ||
        data?.blobId;
      if (blobId) return blobId;
    }
  } catch {
    // HTTP failed, try CLI
  }

  // Fallback: CLI
  try {
    const output = execSync(
      `walrus store "${tmpFile}" --epochs ${epochs} 2>&1`,
      { encoding: "utf-8", timeout: 60000 }
    );
    const blobIdMatch =
      output.match(/Blob ID:\s*(\S+)/i) ||
      output.match(/blob[_ ]id[:\s]+(\S+)/i);
    if (blobIdMatch) return blobIdMatch[1];
  } catch {
    // CLI also failed
  }

  // Last resort: local backup
  const localBackup = join(getConfigDir(), `soul-backup-${Date.now()}.json`);
  writeFileSync(localBackup, soulJson);
  return `local:${localBackup}`;
}

// Restore soul from Walrus
export async function restoreFromWalrus(blobId: string): Promise<AgentSoul> {
  const tmpFile = join(getConfigDir(), "soul-restore.json");

  try {
    execSync(`walrus read "${blobId}" -o "${tmpFile}" --context testnet 2>&1`, {
      encoding: "utf-8",
      timeout: 60000,
    });
    const raw = readFileSync(tmpFile, "utf-8");
    return JSON.parse(raw);
  } catch (err: any) {
    throw new Error(`Failed to restore soul from Walrus: ${err.message}`);
  }
}
