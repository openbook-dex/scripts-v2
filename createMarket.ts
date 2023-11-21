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
import { OpenBookV2Client } from "@openbook-dex/openbook-v2";
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

  // const nbMints = 2;
  // let mintUtils = new MintUtils(provider.connection, authority);
  // let mints = await mintUtils.createMints(nbMints);
  // console.log("Mints created");
  // console.log("Mint 0", mints[0].toString());
  // console.log("Mint 1", mints[1].toString());
  // await delay(300);
  // const baseMint = mints[1];
  // const quoteMint = mints[0];
  

  const baseMint = new PublicKey(
    "CEcLT3615yru4tLZfrPSQ9cJmYGtqtXMd25AjfnumPtQ"
  );
  const quoteMint = new PublicKey(
    "FLSJqDK2zGsA9r2qU6mUjJ1xq2eQXW8H2u8W2ekZ1T81"
  );

  const oracleAId = null;
  const oracleBId = null;

  // let [oracleAId, _tmp1] = PublicKey.findProgramAddressSync(
  //   [
  //     Buffer.from("StubOracle"),
  //     adminKp.publicKey.toBytes(),
  //     baseMint.toBytes(),
  //   ],
  //   programId
  // );

  // let [oracleBId, _tmp3] = PublicKey.findProgramAddressSync(
  //   [
  //     Buffer.from("StubOracle"),
  //     adminKp.publicKey.toBytes(),
  //     quoteMint.toBytes(),
  //   ],
  //   programId
  // );

  // let price = getRandomInt(1000);

  // if ((await anchorProvider.connection.getAccountInfo(oracleAId)) == null) {
  //   await program.methods
  //     .stubOracleCreate({ val: new BN(1) })
  //     .accounts({
  //       payer: adminKp.publicKey,
  //       oracle: oracleAId,
  //       mint: baseMint,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .signers([adminKp])
  //     .rpc();
  // }
  // if ((await anchorProvider.connection.getAccountInfo(oracleBId)) == null) {
  //   await program.methods
  //     .stubOracleCreate({ val: new BN(1) })
  //     .accounts({
  //       payer: adminKp.publicKey,
  //       oracle: oracleBId,
  //       mint: quoteMint,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .signers([adminKp])
  //     .rpc();
  // }

  // await program.methods
  //   .stubOracleSet({
  //     val: new BN(price),
  //   })
  //   .accounts({
  //     owner: adminKp.publicKey,
  //     oracle: oracleAId,
  //   })
  //   .signers([adminKp])
  //   .rpc();

  // await program.methods
  //   .stubOracleSet({
  //     val: new BN(price),
  //   })
  //   .accounts({
  //     owner: adminKp.publicKey,
  //     oracle: oracleBId,
  //   })
  //   .signers([adminKp])
  //   .rpc();

  const name = "RND-USDC";

  const tx = await client.createMarket(
    authority,
    name,
    quoteMint,
    baseMint,
    new BN(1),
    new BN(1000000),
    new BN(0),
    new BN(0),
    new BN(0),
    oracleAId,
    oracleBId,
    null,
    null,
    null
  );

  console.log("created market", tx);
  console.log(
    "finished with balance: ",
    await connection.getBalance(authority.publicKey)
  );
}

main();
