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
  const client = new OpenBookV2Client(provider);

  const marketPublicKey = new PublicKey(
    "2Hj72s8LRTs532YBDSU7R95DgHw2bSSN5nmwzeYwgJr3"
  );

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
  mintUtils.mintTo(market?.quoteMint, userQuoteAcc.address);
  mintUtils.mintTo(market?.baseMint, userBaseAcc.address);

  let args: PlaceOrderArgs = {
    side: Side.Bid,
    priceLots: new BN(1000 + 1000),
    maxBaseLots: new BN(1000),
    maxQuoteLotsIncludingFees: new BN(100000000),
    clientOrderId: new BN(105),
    orderType: OrderType.Market,
    expiryTimestamp: new BN(0),
    selfTradeBehavior: SelfTradeBehavior.DecrementTake,
    limit: 255,
  };
  let remainings = new Array<PublicKey>();
  const [ix, signers] = await client.placeTakeOrderIx(
    marketPublicKey,
    market,
    userBaseAcc.address,
    userQuoteAcc.address,
    null,
    args,
    remainings
  );
  const tx = await client.sendAndConfirmTransaction([ix], {
    additionalSigners: [signers],
  });
  console.log("Take order ", tx);
}

main();
