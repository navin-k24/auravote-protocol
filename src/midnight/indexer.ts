/**
 * Midnight Indexer Client
 * Queries the Midnight Network GraphQL Indexer for deployed contract state, proposals, tallies, and audit events
 */

import { MIDNIGHT_CONFIG } from "./config";
import { Proposal, OnChainLedgerState, OnChainTransactionAudit } from "./types";

export class MidnightIndexerClient {
  private indexerUrl: string;
  private contractAddress: string;

  constructor(indexerUrl?: string, contractAddress?: string) {
    this.indexerUrl = indexerUrl || MIDNIGHT_CONFIG.indexerUrl;
    this.contractAddress = contractAddress || MIDNIGHT_CONFIG.contractAddress;
  }

  /**
   * Fetch current ledger state of the deployed PrivateVoting contract from the Midnight indexer
   */
  public async fetchLedgerState(): Promise<OnChainLedgerState | null> {
    const query = `
      query GetContractLedgerState($contractAddress: String!) {
        contract(address: $contractAddress) {
          address
          blockHeight
          state {
            admin
            voterRegistryRoot
            totalProposalsCount
            totalShieldedVotesCast
            nullifiers
            proposals {
              id
              title
              description
              category
              options {
                id
                label
                voteCount
              }
              totalVotes
              voterRegistryRoot
              deadline
              createdAt
              status
              creator
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(this.indexerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: { contractAddress: this.contractAddress }
        })
      });

      if (!response.ok) {
        throw new Error(`Indexer HTTP Error: ${response.statusText}`);
      }

      const json = await response.json();
      if (json.data?.contract?.state) {
        const rawState = json.data.contract.state;
        const proposalsMap: Record<string, Proposal> = {};
        for (const p of rawState.proposals || []) {
          proposalsMap[p.id] = p;
        }

        return {
          admin: rawState.admin,
          voterRegistryRoot: rawState.voterRegistryRoot,
          totalProposalsCount: Number(rawState.totalProposalsCount || 0),
          totalShieldedVotesCast: Number(rawState.totalShieldedVotesCast || 0),
          nullifiers: rawState.nullifiers || [],
          proposals: proposalsMap,
          currentBlockHeight: json.data.contract.blockHeight || 142100
        };
      }
      return null;
    } catch (err) {
      // In standalone or offline development mode, return null to let contractClient provide runtime state
      return null;
    }
  }

  /**
   * Fetch transaction audit trail for the contract from indexer
   */
  public async fetchAuditTrail(): Promise<OnChainTransactionAudit[]> {
    const query = `
      query GetContractAuditTrail($contractAddress: String!) {
        transactions(filter: { contractAddress: $contractAddress }, limit: 50, order: DESC) {
          txId
          blockHeight
          timestamp
          circuitName
          proposalId
          nullifier
          proofHash
          status
        }
      }
    `;

    try {
      const response = await fetch(this.indexerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: { contractAddress: this.contractAddress }
        })
      });

      if (!response.ok) return [];
      const json = await response.json();
      return json.data?.transactions || [];
    } catch {
      return [];
    }
  }
}

export const midnightIndexer = new MidnightIndexerClient();
