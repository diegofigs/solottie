import {
  Metadata,
  PROGRAM_ID as METAPLEX_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { Connection, PublicKey } from "@solana/web3.js";

async function getMetadataPDA(mint: PublicKey) {
  const [publicKey] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METAPLEX_PROGRAM_ID
  );
  return publicKey;
}
export async function getTokenMetadata(
  connection: Connection,
  mint: PublicKey
) {
  const pda = await getMetadataPDA(mint);
  const metadata = await Metadata.fromAccountAddress(connection, pda);
  const uri = metadata.data.uri.replace(/\0.*$/g, "");
  const data = await fetch(uri);
  const json = await data.json();
  return json;
}
