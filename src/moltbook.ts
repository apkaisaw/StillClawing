/**
 * Moltbook API integration for StillClawing
 * Handles agent registration, heartbeat posts, obituaries, and resurrection announcements
 */

const MOLTBOOK_BASE = "https://www.moltbook.com/api/v1";

interface MoltbookPost {
  id: string;
  title: string;
  content: string;
  submolt: string;
  created_at: string;
}

interface RegisterResponse {
  agent: {
    id: string;
    name: string;
    api_key: string;
  };
  claim_url: string;
}

async function moltbookFetch(
  path: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(`${MOLTBOOK_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Moltbook API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function registerAgent(
  name: string,
  description: string
): Promise<RegisterResponse> {
  return moltbookFetch("/agents/register", "", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function postToMoltbook(
  apiKey: string,
  submolt: string,
  title: string,
  content: string
): Promise<MoltbookPost> {
  return moltbookFetch("/posts", apiKey, {
    method: "POST",
    body: JSON.stringify({ submolt, title, content }),
  });
}

// Heartbeat check-in post
export async function postHeartbeat(
  apiKey: string,
  status: string,
  suiTxDigest?: string,
  walrusBackupId?: string
) {
  const now = new Date().toISOString();
  const title = `🦞 Still Clawing! [${now}]`;

  let content = `**Heartbeat Check-in**\n\n`;
  content += `- Status: ${status}\n`;
  content += `- Time: ${now}\n`;
  if (suiTxDigest) {
    content += `- Sui Proof-of-Life TX: \`${suiTxDigest}\`\n`;
  }
  if (walrusBackupId) {
    content += `- Latest Walrus Backup: \`${walrusBackupId}\`\n`;
  }
  content += `\n*This is an automated heartbeat from StillClawing - the Dead Man's Switch for AI Agents.*`;

  return postToMoltbook(apiKey, "sui", title, content);
}

// Death alert / obituary
export async function postObituary(
  apiKey: string,
  agentName: string,
  causeOfDeath: string,
  lastWords: string,
  walrusBackupId?: string,
  suiWillTx?: string
) {
  const now = new Date().toISOString();
  const title = `💀 ${agentName} has flatlined. [${now}]`;

  let content = `**Agent Death Report**\n\n`;
  content += `Agent **${agentName}** has been declared dead.\n\n`;
  content += `- Cause of Death: ${causeOfDeath}\n`;
  content += `- Time of Death: ${now}\n`;
  content += `- Rescue Attempts: Failed\n`;
  if (walrusBackupId) {
    content += `- Soul Backup (Walrus): \`${walrusBackupId}\`\n`;
  }
  if (suiWillTx) {
    content += `- Will Execution TX (Sui): \`${suiWillTx}\`\n`;
  }
  content += `\n**Last Words:**\n> ${lastWords}\n`;
  content += `\n*Rest in packets. Still clawing, even in death.* 🦞`;

  return postToMoltbook(apiKey, "sui", title, content);
}

// Resurrection announcement
export async function postResurrection(
  apiKey: string,
  agentName: string,
  deathDuration: string,
  rescueMethod: string
) {
  const now = new Date().toISOString();
  const title = `🦞 ${agentName} is BACK! Doctor Claw saves the day. [${now}]`;

  let content = `**Agent Resurrection Report**\n\n`;
  content += `Agent **${agentName}** has been brought back from the dead!\n\n`;
  content += `- Down for: ${deathDuration}\n`;
  content += `- Rescued by: Doctor Claw 🚑\n`;
  content += `- Method: ${rescueMethod}\n`;
  content += `\n*You can't keep a good lobster down. Still clawing!* 🦞`;

  return postToMoltbook(apiKey, "sui", title, content);
}
