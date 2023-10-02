import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';

export default function SignInPage() {
  const title = '登入/註冊';
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main></main>
    </>
  );
}
