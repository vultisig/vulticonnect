import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN",
  run_at: "document_start",
};

const customEthereumProvider = {
  isMetaMask: false,
  selectedAddress: null, // Mock account address
  chainId: "0x1", // Mock chain ID (Mainnet)

  // Internal storage for event listeners
  _events: {},

  // Handle the 'enable' method for older dApps
  enable: async () => {
    return customEthereumProvider.request({
      method: "eth_requestAccounts",
      params: {},
    });
  },

  // Core request handler for the Ethereum Provider
  request: async ({ method, params }) => {
    console.log("Ethereum provider request:", method, params);

    switch (method) {
      case "eth_requestAccounts":
        // Return the mock selected address
        if (!customEthereumProvider.selectedAddress) {
          customEthereumProvider.selectedAddress =
            "0x1234567890abcdef1234567890abcdef12345678";

          // Emit 'accountsChanged' event
          customEthereumProvider._emit("accountsChanged", [
            customEthereumProvider.selectedAddress,
          ]);
        }
        return [customEthereumProvider.selectedAddress];

      case "eth_chainId":
        // Return the current chain ID (as a hex string)
        return customEthereumProvider.chainId;

      case "net_version":
        // Return the network ID (Mainnet ID is 1)
        return parseInt(customEthereumProvider.chainId, 16).toString();

      case "eth_accounts":
        // Return the mock account
        return customEthereumProvider.selectedAddress
          ? [customEthereumProvider.selectedAddress]
          : [];

      case "eth_sendTransaction":
        // Simulate sending a transaction and return a mock transaction hash
        console.log("Simulating eth_sendTransaction:", params);

        // Emit 'message' event with transaction details
        customEthereumProvider._emit("message", {
          type: "eth_sendTransaction",
          data: params,
        });

        return "0xMockTransactionHash";

      case "eth_sign":
        // Mock signature of a message
        console.log("Signing message:", params);
        return "0xMockSignature";

      case "eth_signTypedData_v4":
        // Mock signing typed data (EIP-712)
        console.log("Signing typed data v4:", params);
        return "0xMockTypedDataSignature";

      case "personal_sign":
        // Mock signing a personal message
        console.log("Signing personal message:", params);
        return "0xMockPersonalMessageSignature";

      case "eth_call":
        // Simulate a call to a smart contract
        console.log("Simulating eth_call:", params);
        return "0x";

      case "eth_getBalance":
        // Return a mock balance (in wei)
        console.log("Fetching balance for:", params);
        return "0xDE0B6B3A7640000"; // 1 Ether in wei (hex)

      case "eth_blockNumber":
        // Return a mock block number
        return "0x10D4F"; // 69007 in hex

      default:
        console.error(`Unsupported method: ${method}`);

        // Emit 'error' event
        customEthereumProvider._emit(
          "error",
          new Error(`Unsupported method: ${method}`)
        );

        throw new Error(`Unsupported method: ${method}`);
    }
  },

  // Event subscriptions (such as for account and chain changes)
  on: (event, callback) => {
    console.log(`Event subscribed: ${event} , ${callback}`);
    if (!customEthereumProvider._events[event]) {
      customEthereumProvider._events[event] = [];
    }
    customEthereumProvider._events[event].push(callback);

    return;

    customEthereumProvider._events[event].push(callback);

    // For 'connect' event, emit immediately if connected
    if (event === "connect" && customEthereumProvider.isConnected()) {
      callback({ chainId: customEthereumProvider.chainId });
    }
  },

  removeListener: (event, callback) => {
    console.log(`Event listener removed: ${event}`);

    const listeners = customEthereumProvider._events[event];
    if (!listeners) return;

    customEthereumProvider._events[event] = listeners.filter(
      (listener) => listener !== callback
    );
  },

  // Additional properties (optional)
  isConnected: () => true, // Simulate that the provider is always connected

  // Handle method for older dApps (pre EIP-1193)
  send: async (methodOrPayload, callbackOrArgs) => {
    console.log("Ethereum provider send:", methodOrPayload, callbackOrArgs);

    if (typeof methodOrPayload === "string") {
      // 'send' method with (method, params)
      return customEthereumProvider.request({
        method: methodOrPayload,
        params: callbackOrArgs,
      });
    } else if (
      typeof methodOrPayload === "object" &&
      typeof callbackOrArgs === "function"
    ) {
      // 'send' method with (payload, callback)
      const payload = methodOrPayload;
      const callback = callbackOrArgs;

      customEthereumProvider
        .request(payload)
        .then((result) => {
          callback(null, { id: payload.id, jsonrpc: payload.jsonrpc, result });
        })
        .catch((error) => {
          callback(error, null);
        });
    } else {
      throw new Error("Invalid arguments for send method");
    }
  },

  // Internal method to emit events
  _emit: (event, data) => {
    const listeners = customEthereumProvider._events[event];
    console.log(`Emitting ${event} event`);
    if (listeners && listeners.length > 0) {
      listeners.forEach((callback) => {
        try {
          console.log(`Emitting ${event} event`);
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error);
        }
      });
    }
  },

  // Simulate connect and disconnect events
  _connect: () => {
    console.log("Simulating connect event");
    customEthereumProvider._emit("connect", {
      chainId: customEthereumProvider.chainId,
    });
  },

  _disconnect: (error) => {
    console.log("Simulating disconnect event");
    customEthereumProvider._emit(
      "disconnect",
      error || { code: 4900, message: "Provider disconnected" }
    );
  },
};

// Inject the custom Ethereum provider into window.ethereum
window.ethereum = customEthereumProvider;

// Simulate the connect event when the provider is initialized
customEthereumProvider._connect();
