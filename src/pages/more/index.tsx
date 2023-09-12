import { NavbarTitleContext } from '@/components/app/TopNavbar';
import Head from 'next/head';
import { useContext, useEffect } from 'react';

export default function MorePage() {
  let title = '數據與更多';

  let [setTitle] = useContext(NavbarTitleContext);

  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>數據與更多（審核、資料管理什麼的）</main>
    </>
  );
}
