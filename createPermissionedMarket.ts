import {
  Keypair,
  PublicKey,
  ComputeBudgetProgram,
  SystemProgram,
  Transaction,
  Connection,
} from "@solana/web3.js";
import {
  AnchorProvider,
  BN,
  Program,
  Wallet,
  getProvider,
} from "@coral-xyz/anchor";

import { createAccount } from "./solana_utils";
import { MintUtils } from "./mint_utils";
import {
  OpenBookV2Client,
  type OracleConfigParams,
} from "@openbook-dex/openbook-v2";
import { RPC, authority, connection, programId } from "./utils";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider, programId);

  console.log(
    "starting with balance: ",
    await provider.connection.getBalance(authority.publicKey)
  );

  // WSOL
  const baseMint = new PublicKey("So11111111111111111111111111111111111111112");
  // USDC
  const quoteMint = new PublicKey(
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  );

  // Sol/USD
  const oracleAId = new PublicKey(
    "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG"
  );
  // USDC/USD
  const oracleBId = new PublicKey(
    "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD"
  );

  const name = "SOL-USDC";

  // expiricy in 10 days
  const expiry = Math.floor(Date.now() / 1000) + 10 * 86400;

  const oracleConfigParams: OracleConfigParams = {
    confFilter: 0.1,
    maxStalenessSlots: 100,
  };
  const tx = await client.createMarket(
    authority,
    name,
    quoteMint,
    baseMint,
    new BN(1),
    new BN(1000000),
    new BN(0),
    new BN(0),
    new BN(expiry),
    oracleAId,
    oracleBId,
    null,
    null,
    wallet.publicKey,
    oracleConfigParams
  );

  console.log("created market", tx);
  console.log(
    "finished with balance: ",
    await connection.getBalance(authority.publicKey)
  );
}

main();
