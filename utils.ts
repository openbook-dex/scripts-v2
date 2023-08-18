import * as fs from "fs";
import { OpenBookV2Client, IDL, type OpenbookV2 } from "@openbook-dex/openbook-v2";

import {
  Connection,
  Keypair,
  PublicKey,
  ComputeBudgetProgram,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program, getProvider } from "@coral-xyz/anchor";
import * as os from "os";
import { createAccount } from "./solana_utils";
import { MintUtils } from "./mint_utils";

// export const RPC = "http://127.0.0.1:8899";
export const RPC = "https://api.devnet.solana.com";
// export const RPC= "https://api.testnet.solana.com";

export const programId = new PublicKey(
  "opnbkNkqux64GppQhwbyEVc3axhssFhVYuwar8rDHCu"
);

export const authorityFile = `${os.homedir()}/.config/solana/id.json`;
export const authority = getKeypairFromFile(authorityFile);
export const connection = new Connection(RPC, {
  commitment: "finalized",
  confirmTransactionInitialTimeout: 30000,
});
export const program = new Program<OpenbookV2>(IDL, programId, getProvider());

export function getKeypairFromFile(filePath: String): Keypair {
  return Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(
        process.env.KEYPAIR || fs.readFileSync(filePath.toString(), "utf-8")
      )
    )
  );
}
