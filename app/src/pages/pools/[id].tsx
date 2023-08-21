import Head from "next/head";
import type {
  InferGetStaticPropsType,
  GetStaticProps,
  GetStaticPaths,
} from "next";
import { getLotteryPoolIds } from "core/getLotteryPoolIds";
import { getLotteryPool } from "core/getLotteryPool";
import { LotteryPool, LotteryPoolJSON } from "program/accounts";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { LotteryPoolCard } from "components/LotteryPoolCard";
import { StakeCard } from "components/StakeCard";
// import { MintBsol } from "components/MintBsol";
import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";
import Link from "next/link";

export const getStaticPaths: GetStaticPaths = async () => {
  const pools = await getLotteryPoolIds();
  const paths = pools.map((id) => ({ params: { id: id.toString() } }));
  return {
    paths,
    fallback: true, // false or "blocking"
  };
};

export const getStaticProps: GetStaticProps<{
  pool: LotteryPoolJSON;
  id: string;
}> = async ({ params }) => {
  const id = params.id as string;
  const pool = await getLotteryPool(new PublicKey(id));
  return {
    props: { pool, id },
  };
};

export default function Pool({
  pool,
  id,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data } = useQuery({
    queryKey: ["lotteryPool", id],
    queryFn: () => getLotteryPool(new PublicKey(id)),
    initialData: pool,
  });
  const { networkConfiguration } = useNetworkConfiguration();
  const lotteryPool = LotteryPool.fromJSON(data);
  return (
    <div>
      <Head>
        <title>Lottie: Pool {id}</title>
        <meta name="description" content="A Lottery Protocol on Solana" />
      </Head>
      <div className="md:hero mx-auto p-2">
        <div className="md:hero-content flex flex-col">
          <div className="max-w-screen-lg w-full">
            <div className="flex items-center gap-2 my-2">
              <Link href="/pools" className="text-primary text-lg underline">
                Back to Pools
              </Link>
              {
                //networkConfiguration === "localnet" && <MintBsol />
              }
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-2">
              <div className="col-span-1 md:col-span-4">
                <StakeCard pool={lotteryPool} id={new PublicKey(id)} />
              </div>
              <div className="col-span-1 md:col-span-3">
                <LotteryPoolCard pool={lotteryPool} crank />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
