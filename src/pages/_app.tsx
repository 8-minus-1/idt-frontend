import '@mantine/core/styles.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import styles from '@/styles/app.module.css';
import TopNavbar, { NavbarTitleContext, NavbarTitleContextValue } from '@/components/app/TopNavbar';
import BottomNavbar from '@/components/app/BottomNavbar';
import { useState } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { SWRConfig } from 'swr';
import { client } from '@/apis/common';
import { Options as KyOptions } from 'ky';

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

  return (
    <NavbarTitleContext.Provider value={navbarTitleContextValue}>
      <div className={styles.appShell}>
        <TopNavbar />
        <div className={styles.page}>
          <Component {...pageProps} />
        </div>
        {!shouldHideBottomNav && <BottomNavbar />}
      </div>
    </NavbarTitleContext.Provider>
  );
}

export default function App(appProps: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <MantineProvider theme={theme}>
        <SWRConfig
          value={{
            shouldRetryOnError: false,
            fetcher: defaultFetcher,
          }}
        >
          <AppInner {...appProps} />
        </SWRConfig>
      </MantineProvider>
    </>
  );
}
