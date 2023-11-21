import { PublicKey, Connection } from "@solana/web3.js";
import {
  AnchorProvider,
  BN,
  Wallet,
  BorshCoder,
} from "@coral-xyz/anchor";
import { RPC, programId } from "./utils";

import { authority } from "./utils";
import {
  OpenBookV2Client,
  PlaceOrderArgs,
  Side,
  IDL,
} from "@openbook-dex/openbook-v2";

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider);

  const txId =
    "64uAnfXqUHTrTPYTPzyU11bu38dqDPj1owXvLH3j6WRK35dRBvVwaD5S2KoqSQwNCxpapdvzPNyT9MN79TSP7QLD";
  // Get transaction from its signature
  const tx = await client.connection.getTransaction(txId, {
    commitment: "confirmed",
  });
  let borshCoder = new BorshCoder(IDL);

  if (tx && tx.meta?.logMessages) {
    for (const logs of tx.meta?.logMessages) {
      const event = extractEventData(logs.toString());
      if (event) {
        console.log(borshCoder.events.decode(event));
      }
    }
  }
}
function extractEventData(input: string): string | null {
  const prefix = "Program data: ";

  if (input.startsWith(prefix)) {
    return input.substring(prefix.length);
  }

  return null;
}

main();
