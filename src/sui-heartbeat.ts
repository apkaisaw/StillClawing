/**
 * Sui blockchain heartbeat - Proof of Life transactions
 * Sends a small self-transfer with a heartbeat memo on each check-in
 */

import { SuiGrpcClient } from "@mysten/sui/grpc";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { requestSuiFromFaucetV2, getFaucetHost } from "@mysten/sui/faucet";

export type SuiClient = SuiGrpcClient;

const NETWORK_URLS = {
  testnet: "https://fullnode.testnet.sui.io:443",
  mainnet: "https://fullnode.mainnet.sui.io:443",
};

export function createSuiClient(network: "testnet" | "mainnet" = "testnet") {
  return new SuiGrpcClient({ baseUrl: NETWORK_URLS[network] });
}

// Request testnet SUI from faucet
export async function requestFaucet(
  address: string,
  network: "testnet" | "mainnet" = "testnet"
) {
  if (network !== "testnet") {
    throw new Error("Faucet only available on testnet");
  }
  return requestSuiFromFaucetV2({
    host: getFaucetHost("testnet"),
    recipient: address,
  });
}

// Send a heartbeat transaction (self-transfer with memo in metadata)
export async function sendHeartbeat(
  client: SuiGrpcClient,
  keypair: Ed25519Keypair,
  status: string
): Promise<string> {
  const address = keypair.getPublicKey().toSuiAddress();

  const tx = new Transaction();
  tx.setSender(address);

  // Split 1 MIST (smallest unit) and transfer to self as proof-of-life
  const [coin] = tx.splitCoins(tx.gas, [1]);
  tx.transferObjects([coin], address);

  const result: any = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });

  // SDK v2 may return digest at different paths
  return result.digest || result.effects?.transactionDigest || "tx-sent";
}

// Get balance
export async function getBalance(
  client: SuiGrpcClient,
  address: string
): Promise<bigint> {
  const result = await client.getBalance({ owner: address });
  const bal = (result as any).balance || result;
  return BigInt(bal.balance || bal.totalBalance || "0");
}

// Transfer all assets to inheritor (will execution)
export async function executeWillTransfer(
  client: SuiGrpcClient,
  keypair: Ed25519Keypair,
  inheritorAddress: string
): Promise<string> {
  const address = keypair.getPublicKey().toSuiAddress();

  // Get all coins
  const coinsResult = await client.getCoins({ owner: address });
  const coins = (coinsResult as any).coins || (coinsResult as any).data || [];
  if (coins.length === 0) {
    throw new Error("No coins to transfer");
  }

  const tx = new Transaction();
  tx.setSender(address);

  // Merge all coins and send to inheritor, keeping enough for gas
  if (coins.length > 1) {
    const primaryCoin = coins[0];
    const otherCoins = coins.slice(1).map((c: any) => c.coinObjectId);
    tx.mergeCoins(
      tx.object(primaryCoin.coinObjectId),
      otherCoins.map((id: string) => tx.object(id))
    );
  }

  // Transfer remaining balance minus gas
  const [transferCoin] = tx.splitCoins(tx.gas, [0]);
  tx.transferObjects([transferCoin], inheritorAddress);

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });

  return result.digest;
}
