import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';

export default function MatchPage() {
  const title = '夥伴配對';
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>配對</main>
    </>
  );
}
