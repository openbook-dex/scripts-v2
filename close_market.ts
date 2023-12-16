import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { authority } from "./utils";
import { RPC, programId } from "./utils";
import {
  OpenBookV2Client,
  PlaceOrderArgs,
  Side,
} from "@openbook-dex/openbook-v2";
import { MintUtils } from "./mint_utils";

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider);

  const marketPublicKey = new PublicKey(
    "BLr5UmvkfoVC4yth5CX2jBT5X75Z61gkLPMbJRNxiRqa"
  );
  const market = await client.getMarketAccount(marketPublicKey);
  if (!market) {
    throw "No market";
  }

  const eventHeap = await client.getEventHeap(market.eventHeap);
  if (!eventHeap) {
    throw "No event heap";
  }
  console.log("event heap length", eventHeap.header.count);

  if (eventHeap.header.count > 0) {
    const accounts = await client.getAccountsToConsume(market);
    if (accounts) {
      console.log("accounts lenght", accounts.length);

      const tx1 = await client.consumeEvents(
        marketPublicKey,
        market,
        new BN(8),
        accounts
      );
      console.log("Consumed events ", tx1);
    }
  }

  //   //   const tx2= await client.pruneOrders(marketPublicKey, market, openOrdersPublicKey, 5, wallet.payer)

    const tx = await client.closeMarket(
      marketPublicKey,
      market,
      wallet.publicKey,
      wallet.payer
    );
    console.log("Closed market ", tx);
}

main();
