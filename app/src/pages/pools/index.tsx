import { CreateLotteryForm } from "components/CreateLotteryForm";
import { LotteryPoolList } from "components/LotteryPoolList";
import Modal from "components/Modal";
import { getAllLotteryPools } from "core/getAllLotteryPools";
import type { InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";

export async function getStaticProps() {
  const pools = await getAllLotteryPools();
  return {
    props: { pools },
  };
}

const Pools: NextPage = ({
  pools,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <div>
      <Head>
        <title>Lottie: Pools</title>
        <meta name="description" content="A Lottery Protocol on Solana" />
      </Head>
      <div className="md:hero mx-auto p-2">
        <div className="md:hero-content flex flex-col">
          <div className="flex justify-between gap-2 p-2 my-2">
            <Modal title="Create Lottery">
              <CreateLotteryForm />
            </Modal>
          </div>
          <LotteryPoolList pools={pools} />
        </div>
      </div>
    </div>
  );
};

export default Pools;
