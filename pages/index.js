import Head from 'next/head';
import styles from '../styles/Home.module.css';
import SideBar from '../Components/SideBar';
import GoldContainer from '../Components/GoldContainer';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Prototype</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GoldContainer />
      <SideBar />
    </div>
  );
}
