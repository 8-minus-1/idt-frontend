import { NavbarTitleContext } from '@/components/app/TopNavbar';
import Head from 'next/head';
import { useContext, useEffect } from 'react';

export default function FourmsPage() {
  let title = '運動論壇';

  let [setTitle] = useContext(NavbarTitleContext);

  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>論壇</main>
    </>
  );
}
