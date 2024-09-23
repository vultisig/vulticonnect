export interface RpcPayload {
  method: string;
  params: any[];
  jsonrpc?: string;
  id?: number;
}

export interface RpcResponse {
  id: number;
  result: string | null;
  error: RpcError | null;
}

export interface RpcError {
  code: number;
  message: string;
}


export interface Coin {
  address: string;
  isNativeToken: boolean;
  contractAddress?: string;
}
