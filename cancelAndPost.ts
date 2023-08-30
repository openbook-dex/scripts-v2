import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { authority } from "./utils";
import { RPC, programId } from "./utils";
import {
  OpenBookV2Client,
  PlaceOrderArgs,
  Side,
  OrderType,
  SelfTradeBehavior,
} from "@openbook-dex/openbook-v2";
import { MintUtils } from "./mint_utils";

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(programId, provider);

  const marketPublicKey = new PublicKey(
    "2Hj72s8LRTs532YBDSU7R95DgHw2bSSN5nmwzeYwgJr3"
  );
  const openOrdersPublicKey = new PublicKey(
    "GvVVsRo3LjNw3kz5hhJDgE87s5HMa2xLUhJ3qcyS9x8Q"
  );

  const market = await client.getMarket(marketPublicKey);
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
  mintUtils.mintTo(market?.quoteMint, userQuoteAcc.address);
  mintUtils.mintTo(market?.baseMint, userBaseAcc.address);

  const nbOrders: number = 7;
  let args: PlaceOrderArgs[] = [];
  for (let i = 0; i < nbOrders; ++i) {
    args.push({
      side: Side.Bid,
      priceLots: new BN(1000 - 1 - i),
      maxBaseLots: new BN(10),
      maxQuoteLotsIncludingFees: new BN(1000000),
      clientOrderId: new BN(i),
      orderType: OrderType.PostOnly,
      expiryTimestamp: new BN(0),
      selfTradeBehavior: SelfTradeBehavior.DecrementTake,
      limit: 255,
    });
  }
  for (let i = 0; i < nbOrders; ++i) {
    args.push({
      side: Side.Ask,
      priceLots: new BN(1000 + 1 + i),
      maxBaseLots: new BN(10),
      maxQuoteLotsIncludingFees: new BN(1000000),
      clientOrderId: new BN(i),
      orderType: OrderType.PostOnly,
      expiryTimestamp: new BN(0),
      selfTradeBehavior: SelfTradeBehavior.DecrementTake,
      limit: 255,
    });
  }

  const tx = await client.cancelAndPlaceOrders(
    openOrdersPublicKey,
    marketPublicKey,
    market,
    userBaseAcc.address,
    userQuoteAcc.address,
    null,
    [],
    args
  );
  console.log("Cancel and place order ", tx);
}

main();
