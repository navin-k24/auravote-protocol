/**
 * Midnight Network Configuration & Environment Endpoints
 * Supports Midnight Devnet-Halo, Testnet, and Local Standalone Node
 */

export interface MidnightNetworkConfig {
  networkId: "devnet-halo" | "testnet" | "local";
  nodeUrl: string;
  indexerUrl: string;
  indexerWsUrl: string;
  proofServerUrl: string;
  contractAddress: string;
  explorerUrl: string;
}

const env = typeof import.meta !== "undefined" && (import.meta as any).env ? (import.meta as any).env : {};

export const MIDNIGHT_CONFIG: MidnightNetworkConfig = {
  networkId: "devnet-halo",
  nodeUrl: env.VITE_MIDNIGHT_NODE_URL || "https://rpc.devnet.midnight.network",
  indexerUrl: env.VITE_MIDNIGHT_INDEXER_URL || "https://indexer.devnet.midnight.network/api/v1/graphql",
  indexerWsUrl: env.VITE_MIDNIGHT_INDEXER_WS || "wss://indexer.devnet.midnight.network/api/v1/graphql",
  proofServerUrl: env.VITE_MIDNIGHT_PROOF_SERVER_URL || "http://localhost:6300",
  contractAddress: env.VITE_MIDNIGHT_CONTRACT_ADDRESS || "0x7a2c4e69b018d9f523c10a47f89d0234a1b3c5e789a0b1c2d3e4f5a6b7c8d9e0",
  explorerUrl: env.VITE_MIDNIGHT_EXPLORER_URL || "https://explorer.devnet.midnight.network"
};

export const getMidnightConfig = (): MidnightNetworkConfig => {
  return MIDNIGHT_CONFIG;
};
