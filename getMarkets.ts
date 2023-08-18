import { Connection, PublicKey } from "@solana/web3.js";
import { getProvider, Program } from "@coral-xyz/anchor";
import { RPC, getKeypairFromFile, programId } from "./utils";
import * as os from "os";
import {
  OpenBookV2Client,
  IDL,
  type OpenbookV2,
  findAllMarkets,
} from "@openbook-dex/openbook-v2";

async function main() {
  const connection = new Connection(RPC, "confirmed");

  let markets = await findAllMarkets(connection, programId);

  console.log(markets);
}

main();
