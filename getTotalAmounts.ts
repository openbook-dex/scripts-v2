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

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider);

  const marketPubkey = new PublicKey(
    "C3YPL3kYCSYKsmHcHrPWx1632GUXGqi2yMXJbfeCc57q"
  );
  const owner = new PublicKey("EaaK2PxkpA7mmtpWYaPYJWPBZ6pnYeiEQpywWcibWjW4");

  const market = await client.getMarketAccount(marketPubkey);

  if (market === null) {
    throw "No market";
  }
  const openorders = await client.findOpenOrdersForMarket(owner, marketPubkey);
  let totalQuoteBids = 0;

  for (const openOrderPubkey of openorders) {
    const openOrder = await client.getOpenOrders(openOrderPubkey);

    if (openOrder) {
      console.log("bidsBaseLots", openOrder.position.bidsBaseLots.toNumber());
      console.log("asksBaseLots", openOrder.position.asksBaseLots.toNumber());
    }
    const booksideBids = await client.getBookSide(market.bids);
    if (booksideBids === null) {
      throw "No booksideBids";
    }
    const bids = await client.getLeafNodes(booksideBids);

    for (const bid of bids) {
      if (openOrderPubkey.toString() !== bid.owner.toString()) {
        continue;
      }
      console.log(bid);
      console.log(
        "price: ",
        priceData(bid.key),
        "bid.quantity:",
        bid.quantity.toNumber(),
        "priceData(bid.key) * bid.quantity.toNumber():",
        priceData(bid.key) * bid.quantity.toNumber()
      );
      totalQuoteBids +=
        priceData(bid.key) *
        bid.quantity.toNumber() *
        market.quoteLotSize.toNumber();
    }
  }

  console.log("totalQuoteBidsNative", totalQuoteBids);
}

function priceData(key: BN) {
  const shiftedValue = key.shrn(64); // Shift right by 64 bits
  return shiftedValue.toNumber(); // Convert BN to a regular number
}

main();
