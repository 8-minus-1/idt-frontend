import '@mantine/core/styles.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import styles from '@/styles/app.module.css';
import TopNavbar, { NavbarTitleContext, NavbarTitleContextValue } from '@/components/app/TopNavbar';
import BottomNavbar from '@/components/app/BottomNavbar';
import { useState } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({});

export default function App({ Component, pageProps }: AppProps) {
  let [navbarTitle, setNavbarTitle] = useState('');
  let navbarTitleContextValue: NavbarTitleContextValue = [setNavbarTitle, navbarTitle];
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <MantineProvider theme={theme}>
      <NavbarTitleContext.Provider value={navbarTitleContextValue}>
        <div className={styles.appShell}>
          <TopNavbar />
          <div className={styles.page}>
            <Component {...pageProps} />
          </div>
          <BottomNavbar />
        </div>
      </NavbarTitleContext.Provider>
      </MantineProvider>
    </>
  );
}
