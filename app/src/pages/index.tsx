import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Lottie: Home</title>
        <meta name="description" content="A Lottery Protocol on Solana" />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
