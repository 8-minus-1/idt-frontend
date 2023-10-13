import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Center } from '@mantine/core';
import 'leaflet/dist/leaflet.css';

const MapPage = dynamic(() => import('@/components/map/MapPage'), {
  ssr: false,
  loading: () => <Center h="100%">正在載入地圖…</Center>,
});

export default function MapPageWrapper() {
  const title = '場館地圖';
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main style={{ height: 'calc(100vh - 48px - 64px)' }}>
        <MapPage />
      </main>
    </>
  );
}
