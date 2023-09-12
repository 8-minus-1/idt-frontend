import { NavbarTitleContext } from '@/components/app/TopNavbar';
import Head from 'next/head';
import { useContext, useEffect } from 'react';

export default function EventsPage() {
  let title = '比賽活動';

  let [setTitle] = useContext(NavbarTitleContext);

  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>比賽活動</main>
    </>
  );
}
