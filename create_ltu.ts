import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  AddressLookupTableProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { authority } from "./utils";
import { RPC } from "./utils";
import { OpenBookV2Client } from "@openbook-dex/openbook-v2";

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider);

  // Step 1 - Get a lookup table address and create lookup table instruction
  const [txInstructions, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      recentSlot: await client.connection.getSlot(),
    });

  // Step 2 - Log Lookup Table Address
  console.log("Lookup Table Address:", lookupTableAddress.toBase58());

  let latestBlockhash = await client.connection.getLatestBlockhash("finalized");

  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: [txInstructions],
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messageV0);
  transaction.sign([wallet.payer]);

  const txid = await client.connection.sendTransaction(transaction, {
    maxRetries: 5,
  });

  const confirmation = await client.connection.confirmTransaction({
    signature: txid,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });
  if (confirmation.value.err) {
    throw new Error("   ❌ - Transaction not confirmed.");
  }
  console.log(
    "🎉 Transaction succesfully confirmed!",
    "\n",
    `https://explorer.solana.com/tx/${txid}?cluster=devnet`
  );
}

main();
