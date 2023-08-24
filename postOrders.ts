import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { authority } from "./utils";
import { RPC, programId } from "./utils";
import { OpenBookV2Client, PlaceOrderArgs, Side } from "@openbook-dex/openbook-v2";
import { MintUtils } from "./mint_utils";

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(programId, provider);

  const openOrdersPublicKey = new PublicKey(
    "EuaUfzypbyh5xtKD2nfHEfpQiTr8QSqu4VeRtLrfTF1c"
  );
  const marketPublicKey = new PublicKey(
    "CwHc9CZ9UCZFayz4eBekuhhKsHapLDPYfX4tGFJrnTRt"
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

  const nbOrders: number = 10;
  for (let i = 0; i < nbOrders; ++i) {
    let side = Side.Bid;
    let placeOrder = { limit: {} };
    let selfTradeBehavior = { decrementTake: {} };

    let args: PlaceOrderArgs = {
      side,
      priceLots: new BN(1000 - 1 - i),
      maxBaseLots: new BN(10),
      maxQuoteLotsIncludingFees: new BN(1000000),
      clientOrderId: new BN(i),
      orderType: placeOrder,
      expiryTimestamp: new BN(0),
      selfTradeBehavior: selfTradeBehavior,
      limit: 255,
    };

    const tx = await client.placeOrder(
      openOrdersPublicKey,
      marketPublicKey,
      market,
      userQuoteAcc.address,
      null,
      args
    );
    console.log("Placed order ", tx);
  }

  for (let i = 0; i < nbOrders; ++i) {
    let side = Side.Ask;
    let placeOrder = { limit: {} };
    let selfTradeBehavior = { decrementTake: {} };

    let args: PlaceOrderArgs = {
      side,
      priceLots: new BN(1000 + 1 + i),
      maxBaseLots: new BN(10000),
      maxQuoteLotsIncludingFees: new BN(1000000),
      clientOrderId: new BN(i + nbOrders + 1),
      orderType: placeOrder,
      expiryTimestamp: new BN(0),
      selfTradeBehavior: selfTradeBehavior,
      limit: 255,
    };
    const tx = await client.placeOrder(
      openOrdersPublicKey,
      marketPublicKey,
      market,
      userBaseAcc.address,
      null,
      args
    );
    console.log("Placed order ", tx);
  }
}

main();
