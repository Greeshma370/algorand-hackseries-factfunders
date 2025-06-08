import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { CURRENT_NETWORK, APP_ID } from "./config";
import { ProposalContractClient } from "../contracts/ProposalContractClient";

let algorandClient: AlgorandClient;

if (CURRENT_NETWORK === "testnet") {
  algorandClient = AlgorandClient.testNet();
} else if (CURRENT_NETWORK === "mainnet") {
  algorandClient = AlgorandClient.mainNet();
} else {
  algorandClient = AlgorandClient.defaultLocalNet();
}

const appClient = new ProposalContractClient({ algorand: algorandClient, appId: BigInt(APP_ID) });

const syncTimeOffsetInLocalNet = async () => {
  if (CURRENT_NETWORK === "localnet") {
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const currentRound = await algorandClient.client.algod.status().do();
    console.log("currentRound", currentRound.lastRound);
    const roundTime = await algorandClient.client.algod.block(currentRound.lastRound).do();
    console.log("roundTime", roundTime);
    const timeOffset = BigInt(currentTimeInSeconds) - roundTime.block.header.timestamp;
    console.log("timeOffset", timeOffset);
    await algorandClient.client.algod.setBlockOffsetTimestamp(timeOffset).do();
  }
};

export { algorandClient, appClient, syncTimeOffsetInLocalNet };
