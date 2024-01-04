import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { PublicKey, Connection, Transaction } from "@solana/web3.js";
import { authority } from "./utils";
import { RPC, programId } from "./utils";
import {
  OpenBookV2Client,
  PlaceOrderArgs,
  Side,
  OrderType,
  SelfTradeBehavior,
  PlaceMultipleOrdersArgs,
} from "@openbook-dex/openbook-v2";
import { MintUtils } from "./mint_utils";

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider);

  const marketPublicKey = new PublicKey(
    "C3YPL3kYCSYKsmHcHrPWx1632GUXGqi2yMXJbfeCc57q"
  );
  const ooa = await client.findOpenOrdersForMarket(
    wallet.publicKey,
    marketPublicKey
  );

  if (ooa === null || ooa.length < 1) {
    throw "No ooa";
  }
  const openOrdersPublicKey = ooa[0];

  const market = await client.deserializeMarketAccount(marketPublicKey);
  if (!market) {
    throw "No market";
  }

  let mintUtils = new MintUtils(provider.connection, authority);

  const userQuoteAcc = await mintUtils.getOrCreateTokenAccount(
    market?.quoteMint,
    authority,
    client.walletPk
  );

  const userBaseAcc = await mintUtils.getOrCreateTokenAccount(
    market?.baseMint,
    authority,
    client.walletPk
  );

  const nbOrders: number = 14;
  let bids: PlaceMultipleOrdersArgs[] = [];
  for (let i = 0; i < nbOrders; ++i) {
    bids.push({
      priceLots: new BN(100 - 1 - i),
      maxQuoteLotsIncludingFees: new BN(1000),
      expiryTimestamp: new BN(0),
    });
  }
  let asks: PlaceMultipleOrdersArgs[] = [];
  for (let i = 0; i < nbOrders; ++i) {
    asks.push({
      priceLots: new BN(100 + 1 + i),
      maxQuoteLotsIncludingFees: new BN(1000),
      expiryTimestamp: new BN(0),
    });
  }

  const [ix, signers] = await client.cancelAllAndPlaceOrdersIx(
    openOrdersPublicKey,
    marketPublicKey,
    market,
    userBaseAcc.address,
    userQuoteAcc.address,
    null,
    OrderType.ImmediateOrCancel,
    bids,
    asks
  );
  const tx = await client.sendAndConfirmTransaction([ix], {
    additionalSigners: [signers],
  });

  console.log("Cancel and place order ", tx);
}

main();
