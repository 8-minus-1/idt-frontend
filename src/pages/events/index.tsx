import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';

export default function EventsPage() {
  const title = '比賽活動';
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>比賽活動</main>
    </>
  );
}
