import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { OpenBookV2Client } from "@openbook-dex/openbook-v2";
import { RPC, authority, programId } from "./utils";

const createIndexer = true;
async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider);

  const market = new PublicKey("C3YPL3kYCSYKsmHcHrPWx1632GUXGqi2yMXJbfeCc57q");
  const accountIndex = new BN(1);
  const openOrdersIndexer = new PublicKey(
    "3zfApGWevn9t5Bu46WHQm8KNHCd8VwXfzeEmY1ANhEAB"
  );

  const tx = await client.createOpenOrders(
    wallet.payer,
    market,
    accountIndex,
    "name"
  );
  console.log("created open orders acc", tx);
}
main();
