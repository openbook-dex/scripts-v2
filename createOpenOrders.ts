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

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(programId, provider);

  const market = new PublicKey("6VPvuktraw1AfHcUAtsfTnouUt8Epa1bfbwTRk6PmqWk");
  const accountIndex = new BN(3);
  const openOrdersIndexer = new PublicKey(
    "6hA4V9ftEfopqXFEHmoBtJUpFtfZft5HgKncNkJ4ydyN"
  );
  const tx = await client.createOpenOrders(
    market,
    accountIndex,
    openOrdersIndexer
  );
  console.log("created open orders acc", tx);
}
// GieBM592ZxXW7KX7asyWMi585QtPWLEV8RVCLDc6F8Yx
// 8fFsnzPv4Pp7W4y7PSq1iHa7Bvmm9vN2AQM8n8281386
main();
