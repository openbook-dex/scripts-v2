import { PublicKey, Connection } from "@solana/web3.js";
import { AnchorProvider, BN, Wallet, BorshCoder } from "@coral-xyz/anchor";
import { RPC, programId } from "./utils";

import { authority } from "./utils";
import {
  OpenBookV2Client,
  PlaceOrderArgs,
  Side,
  IDL,
} from "@openbook-dex/openbook-v2";
import { toUiDecimals } from "@openbook-dex/openbook-v2";
import { quoteLotsToUi } from "@openbook-dex/openbook-v2";

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider);

  const marketPubkey = new PublicKey(
    "C3YPL3kYCSYKsmHcHrPWx1632GUXGqi2yMXJbfeCc57q"
  );
  const owner = new PublicKey("J9zjCmmGBfv6wDSwmRW43vVJ6vooCftXjQYtc7uhETdr");

  const market = await client.deserializeMarketAccount(marketPubkey);

  if (market === null) {
    throw "No market";
  }
  const openorders = await client.findOpenOrdersForMarket(owner, marketPubkey);
  let totalQuoteBids = 0;

  for (const openOrderPubkey of openorders) {
    const openOrder = await client.deserializeOpenOrderAccount(openOrderPubkey);

    if (openOrder) {
      if (openOrder.version != 1){
        throw "using an old open orders account, please close it"
      }
      console.log("bidsQuoteLots", openOrder.position.bidsQuoteLots.toNumber());
      console.log("asksBaseLots", openOrder.position.asksBaseLots.toNumber());
    }
  }

  console.log("totalQuoteBidsNative", totalQuoteBids);
}

function priceData(key: BN) {
  const shiftedValue = key.shrn(64); // Shift right by 64 bits
  return shiftedValue.toNumber(); // Convert BN to a regular number
}

main();
