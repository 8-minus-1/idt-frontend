import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';

export default function FourmsPage() {
  const title = '運動論壇';
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>論壇</main>
    </>
  );
}
