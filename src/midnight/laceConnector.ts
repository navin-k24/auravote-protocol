/**
 * Official Midnight Lace DApp Connector Integration
 * Interacts with window.midnight.mnLace browser extension
 */

import { MidnightLaceAPI, MidnightLaceSession, WalletState } from "./types";
import { MIDNIGHT_CONFIG } from "./config";

declare global {
  interface Window {
    midnight?: {
      mnLace?: MidnightLaceAPI;
    };
  }
}

export class MidnightLaceConnector {
  private session: MidnightLaceSession | null = null;

  /**
   * Check if the Midnight Lace wallet extension is installed
   */
  public isInstalled(): boolean {
    return typeof window !== "undefined" && Boolean(window.midnight?.mnLace);
  }

  /**
   * Request connection & authorization from Midnight Lace wallet
   */
  public async connect(): Promise<WalletState> {
    if (!this.isInstalled()) {
      throw new Error(
        "Midnight Lace Wallet extension not detected. Please install the Midnight Lace extension to connect."
      );
    }

    const lace = window.midnight!.mnLace!;

    try {
      this.session = await lace.enable();
      const state = await this.session.state();

      // Convert lovelace balance to tDUST
      const tDustBalance = state.balance ? Number(state.balance) / 1_000_000 : 1000;

      return {
        isConnected: true,
        isLaceInstalled: true,
        address: state.address,
        networkId: state.networkId || MIDNIGHT_CONFIG.networkId,
        balance: tDustBalance,
        publicKey: state.publicKey || null,
        activeAccountName: "Midnight Lace Account"
      };
    } catch (err: any) {
      throw new Error(err.message || "Failed to connect to Midnight Lace Wallet.");
    }
  }

  /**
   * Check if already authorized
   */
  public async checkAuthorization(): Promise<boolean> {
    if (!this.isInstalled()) return false;
    try {
      return await window.midnight!.mnLace!.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Sign a transaction or zero-knowledge witness authorization with Midnight Lace
   */
  public async signTransaction(payload: any): Promise<{ signature: string; txHash: string }> {
    if (!this.session) {
      throw new Error("No active Midnight Lace session. Please connect wallet first.");
    }
    return await this.session.signTransaction(payload);
  }

  /**
   * Submit transaction to Midnight Network through Lace session
   */
  public async submitTransaction(signedTx: any): Promise<{ txHash: string; blockHeight: number }> {
    if (!this.session) {
      throw new Error("No active Midnight Lace session. Please connect wallet first.");
    }
    return await this.session.submitTransaction(signedTx);
  }

  /**
   * Disconnect the current session
   */
  public disconnect(): void {
    this.session = null;
  }
}

export const laceConnector = new MidnightLaceConnector();
