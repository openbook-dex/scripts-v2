import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import {
  PublicKey,
  Connection,
  AddressLookupTableProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { authority } from "./utils";
import { RPC } from "./utils";
import { OpenBookV2Client } from "@openbook-dex/openbook-v2";

const LOOKUP_TABLE_ADDRESS = new PublicKey("89PiVrPT2LRdQncErZxPSAKfB6WXqZdX9Hx8UBTzbfN8");

const addressesToAdd = [new PublicKey("")];

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider);

  const addAddressesInstruction = AddressLookupTableProgram.extendLookupTable({
    payer: wallet.publicKey,
    authority: wallet.publicKey,
    lookupTable: LOOKUP_TABLE_ADDRESS,
    addresses: addressesToAdd,
  });

  let latestBlockhash = await client.connection.getLatestBlockhash("finalized");
  console.log(
    "   ✅ - Fetched latest blockhash. Last valid height:",
    latestBlockhash.lastValidBlockHeight
  );
  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: [addAddressesInstruction],
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
  console.log(
    `Lookup Table Entries: `,
    `https://explorer.solana.com/address/${LOOKUP_TABLE_ADDRESS.toString()}/entries?cluster=devnet`
  );
}

main();
