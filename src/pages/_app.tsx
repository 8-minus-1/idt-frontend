import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import styles from '@/styles/app.module.css';
import TopNavbar, { NavbarTitleContext, NavbarTitleContextValue } from '@/components/app/TopNavbar';
import BottomNavbar from '@/components/app/BottomNavbar';
import React, { useState } from 'react';
import { MantineProvider, createTheme, rem } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { SWRConfig } from 'swr';
import { client } from '@/apis/common';
import { Options as KyOptions } from 'ky';
import { useUser } from '@/hooks';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import { NavbarRightSlotContext } from '@/contexts/NavbarRightSlotContext';

const theme = createTheme({});

type FetcherKey = string;
const defaultFetcher = (key: [FetcherKey, KyOptions?] | FetcherKey) => {
  if (Array.isArray(key)) {
    return client(key[0], key[1]).json();
  }
  return client(key).json();
};

function AppInner({ Component, pageProps }: AppProps) {
  let [navbarTitle, setNavbarTitle] = useState('');
  let navbarTitleContextValue: NavbarTitleContextValue = [setNavbarTitle, navbarTitle];
  let shouldHideBottomNav = !!(Component as any).hideBottomNav;
  let [fabContainer, setFabContainer] = useState<HTMLDivElement | null>(null);
  let [navbarRightSlot, setNavbarRightSlot] = useState<HTMLDivElement | null>(null);

  // Preload
  let user = useUser();

  return (
    <FABContainerContext.Provider value={fabContainer}>
      <NavbarTitleContext.Provider value={navbarTitleContextValue}>
        <NavbarRightSlotContext.Provider value={navbarRightSlot}>
          <div className={styles.appShell}>
            <TopNavbar
              rightSlot={
                <div ref={(element) => setNavbarRightSlot(element)} style={{ height: '100%' }} />
              }
            />
            <div className={styles.page}>
              <Component {...pageProps} />
            </div>
            <div ref={(element) => setFabContainer(element)} className={styles.fabContainer} />
            {!shouldHideBottomNav && <BottomNavbar />}
          </div>
        </NavbarRightSlotContext.Provider>
      </NavbarTitleContext.Provider>
    </FABContainerContext.Provider>
  );
}

export default function App(appProps: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <SWRConfig
            value={{
              shouldRetryOnError: false,
              fetcher: defaultFetcher,
            }}
          >
            <AppInner {...appProps} />
          </SWRConfig>
          <Notifications
            position={'bottom-center'}
            style={{ position: 'absolute', bottom: rem(100) }}
          />
        </ModalsProvider>
      </MantineProvider>
    </>
  );
}
