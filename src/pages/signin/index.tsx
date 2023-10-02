import { NavbarTitleContext } from '@/components/app/TopNavbar';
import Head from 'next/head';
import { useContext, useEffect } from 'react';

export default function SignInPage() {
  let [setTitle] = useContext(NavbarTitleContext);
  let title = '登入/註冊';

  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main></main>
    </>
  );
}
