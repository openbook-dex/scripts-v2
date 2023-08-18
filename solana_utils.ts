import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

export async function createAccount(
  connection: Connection,
  authority: Keypair,
  size: number,
  owner: PublicKey
): Promise<PublicKey> {
  const lamports = await connection.getMinimumBalanceForRentExemption(size);
  let address = Keypair.generate();

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: authority.publicKey,
      newAccountPubkey: address.publicKey,
      lamports,
      space: size,
      programId: owner,
    })
  );

  transaction.feePayer = authority.publicKey;
  let hash = await connection.getRecentBlockhash();
  transaction.recentBlockhash = hash.blockhash;
  // Sign transaction, broadcast, and confirm
  await sendAndConfirmTransaction(
    connection,
    transaction,
    [authority, address],
    { commitment: "confirmed" }
  );
  return address.publicKey;
}
