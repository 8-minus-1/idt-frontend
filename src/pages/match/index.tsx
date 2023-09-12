import { NavbarTitleContext } from '@/components/app/TopNavbar';
import Head from 'next/head';
import { useContext, useEffect } from 'react';

export default function MatchPage() {
  let title = '夥伴配對';

  let [setTitle] = useContext(NavbarTitleContext);

  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>配對</main>
    </>
  );
}
