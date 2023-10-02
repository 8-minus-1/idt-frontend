import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';

export default function MapPage() {
  const title = '場館地圖';
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>我是地圖</main>
    </>
  );
}
