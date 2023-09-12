import { GetStaticProps } from 'next';
import Head from 'next/head';

export const getStaticProps: GetStaticProps = () => ({
  redirect: {
    permanent: false,
    destination: '/map',
  },
});

export default function Index() {
  return (
    <>
      <Head>
        <title>平台</title>
      </Head>
    </>
  );
}
