import { NetworkId } from "@txnlab/use-wallet-react";

if (
  !import.meta.env.VITE_CURRENT_NETWORK ||
  (import.meta.env.VITE_CURRENT_NETWORK !== "localnet" &&
  import.meta.env.VITE_CURRENT_NETWORK !== "testnet" &&
  import.meta.env.VITE_CURRENT_NETWORK !== "mainnet")
) {
  throw new Error("VITE_CURRENT_NETWORK is not set correctly");
}

const CURRENT_NETWORK: "localnet" | "testnet" | "mainnet" = import.meta.env.VITE_CURRENT_NETWORK as "localnet" | "testnet" | "mainnet";

if (!import.meta.env.VITE_APP_ID) {
  throw new Error("VITE_APP_ID is not set correctly");
}

if (!import.meta.env.VITE_APP_ADDRESS) {
  throw new Error("VITE_APP_ADDRESS is not set correctly");
}

const APP_ADDRESS = import.meta.env.VITE_APP_ADDRESS; 

const APP_ID = parseInt(import.meta.env.VITE_APP_ID);

let USE_WALLET_NETWORK_ID = NetworkId.TESTNET;

if (CURRENT_NETWORK === "testnet") {
  USE_WALLET_NETWORK_ID = NetworkId.TESTNET;
} else if (CURRENT_NETWORK === "mainnet") {
  USE_WALLET_NETWORK_ID = NetworkId.MAINNET;
} else {
  USE_WALLET_NETWORK_ID = NetworkId.LOCALNET;
}

const VOTING_TIME = 120; // 172800; // 2 days
const EXPIRATION_TIME = 600; // 7776000; // 3 months

export { CURRENT_NETWORK, USE_WALLET_NETWORK_ID, APP_ID, APP_ADDRESS, VOTING_TIME, EXPIRATION_TIME };
