import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function PlaceInfoPage() {
  const { query } = useRouter();

  useNavbarTitle('場館資訊');

  return (
    <>
      <Head>
        <title>場館資訊</title>
      </Head>
      <main>{query.id}</main>
    </>
  );
}
