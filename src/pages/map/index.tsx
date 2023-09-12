import { NavbarTitleContext } from '@/components/app/TopNavbar';
import Head from 'next/head';
import { useContext, useEffect } from 'react';

export default function MapPage() {
  let title = '場館地圖';

  let [setTitle] = useContext(NavbarTitleContext);

  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>我是地圖</main>
    </>
  );
}
