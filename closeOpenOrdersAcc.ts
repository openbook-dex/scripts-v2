import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { OpenBookV2Client } from "@openbook-dex/openbook-v2";
import { RPC, authority, programId } from "./utils";

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider);

  const openOrdersPublicKey = new PublicKey(
    "6ERLqk3FTiDanviaeCQichY4ntEoDXABGrX99pcji6Hs"
  );

  const [ix, signers] = await client.closeOpenOrdersAccountIx(
    wallet.payer,
    openOrdersPublicKey
  );

  const tx = await client.sendAndConfirmTransaction([ix], {
    additionalSigners: signers,
  });
  console.log("close open orders acc", tx);
}
main();
