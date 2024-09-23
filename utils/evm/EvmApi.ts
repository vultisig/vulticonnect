import { ChainKey } from "~utils/constants";
import { type RpcPayload, type RpcResponse, type Coin } from "./models";
import { ethers, formatUnits } from "ethers";

export class EvmApi {
  private rpcUrl: string;
  constructor(chain: ChainKey) {
    this.rpcUrl = this.getRpcUrl(chain);
  }

  private getRpcUrl(chain: ChainKey): string {
    switch (chain) {
      case ChainKey.ETHEREUM:
        return "https://ethereum-rpc.publicnode.com";
      case ChainKey.BSCCHAIN:
        return "https://bsc-rpc.publicnode.com";
      case ChainKey.AVALANCHE:
        return "https://avalanche-c-chain-rpc.publicnode.com";
      case ChainKey.POLYGON:
        return "https://polygon-bor-rpc.publicnode.com";
      case ChainKey.CRONOSCHAIN:
        return "https://cronos-evm-rpc.publicnode.com";
      case ChainKey.BLAST:
        return "https://rpc.ankr.com/blast";
      case ChainKey.BASE:
        return "https://base-rpc.publicnode.com";
      case ChainKey.ARBITRUM:
        return "https://arbitrum-one-rpc.publicnode.com";
      case ChainKey.ZKSYNC:
        return "https://mainnet.era.zksync.io";
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }

  public async getNonce(address: string): Promise<bigint> {
    try {
      const payload = {
        jsonrpc: "2.0",
        method: "eth_getTransactionCount",
        params: [address, "latest"],
        id: 1,
      };
      const rpcResp: RpcResponse = await this.fetch<RpcResponse>(payload);
      if (rpcResp.error) {
        console.error(
          `Error fetching nonce for address ${address}: ${rpcResp.error.message}`
        );
        return BigInt(0);
      }
      return BigInt(rpcResp.result ? rpcResp.result.replace(/^0x/, "") : "0");
    } catch (error) {
      console.error(`Exception fetching nonce for address ${address}:`, error);
      return BigInt(0);
    }
  }

  public async getGasPrice(): Promise<bigint> {
    try {
      const payload = {
        jsonrpc: "2.0",
        method: "eth_gasPrice",
        params: [],
        id: 1,
      };
      const rpcResp: RpcResponse = await this.fetch<RpcResponse>(payload);

      if (rpcResp.error) {
        console.error(`Error fetching gas price: ${rpcResp.error.message}`);
        return BigInt(0);
      }
      return BigInt(rpcResp.result ? rpcResp.result : "0");
    } catch (error) {
      console.error(`Exception fetching gas price:`, error);
      return BigInt(0);
    }
  }

  public async getMaxPriorityFeePerGas(): Promise<bigint> {
    try {
      const payload = {
        jsonrpc: "2.0",
        method: "eth_maxPriorityFeePerGas",
        params: [],
        id: 1,
      };
      const rpcResp: RpcResponse = await this.fetch<RpcResponse>(payload);

      if (rpcResp.error) {
        console.error(
          `Error fetching max priority fee per gas: ${rpcResp.error.message}`
        );
        return BigInt(0);
      }
      return BigInt(rpcResp.result ? rpcResp.result.replace(/^0x/, "") : "0");
    } catch (error) {
      console.error(`Exception fetching max priority fee per gas:`, error);
      return BigInt(0);
    }
  }
  public async getBaseFeePerGas(): Promise<bigint> {
    try {
      const payload = {
        jsonrpc: "2.0",
        method: "eth_feeHistory",
        params: ["0x1", "latest", []],
        id: 1,
      };
      const rpcResp: RpcResponse = await this.fetch<RpcResponse>(payload);

      if (rpcResp.error) {
        console.error(
          `Error fetching base fee per gas: ${rpcResp.error.message}`
        );
        return BigInt(0);
      }

      const baseFeePerGasHex = (rpcResp.result as any).baseFeePerGas?.[0];
      console.log("baseFeePerGasHex:", baseFeePerGasHex);

      return BigInt(baseFeePerGasHex ? baseFeePerGasHex : "0");
    } catch (error) {
      console.error(`Exception fetching base fee per gas:`, error);
      return BigInt(0);
    }
  }
  public async estimateTransactionFee(): Promise<string> {
    try {
      const [baseFeePerGas, maxPriorityFeePerGas, gasLimit] = await Promise.all(
        [
          this.getBaseFeePerGas(),
          this.getMaxPriorityFeePerGas(),
          BigInt(this.getGasLimit()),
        ]
      );
      const totalFeePerGas = baseFeePerGas + maxPriorityFeePerGas;
      const estimatedFeeInWei = totalFeePerGas * gasLimit;
      console.log("estimatedFeeInWei:", estimatedFeeInWei);

      const estimatedFeeInGwei =formatUnits(estimatedFeeInWei, "gwei");

      console.log(
        `Estimated Transaction Fee in Gwei: ${estimatedFeeInGwei} Gwei`
      );
      return estimatedFeeInGwei;
    } catch (error) {
      console.error(`Error estimating transaction fee:`, error);
      return "0";
    }
  }
  public getGasLimit() {
    // return coin.isNativeToken
    //   ? chain == ChainKey.ARBITRUM
    //     ? "120000"
    //     : "2300"
    //   : "120000";
    return 2300;
  }

  private async fetch<T>(payload: RpcPayload): Promise<T> {
    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  }
}
