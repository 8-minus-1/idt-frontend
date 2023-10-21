import styles from '@/styles/app.module.css';
import { UnstyledButton } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { createContext, useContext } from 'react';

export type NavbarTitleContextValue = [(newTitle: string) => void, string];

export const NavbarTitleContext = createContext<NavbarTitleContextValue>([
  (newTitle: string) => {},
  '',
]);

const isBrowser = typeof window !== 'undefined';
const initialHistoryLength = isBrowser ? window.history.length : 0;
const topLevelNavDestinations = ['/events', '/forums', '/map', '/match', '/more'];

export default function TopNavbar({ rightSlot }: { rightSlot: React.JSX.Element }) {
  let [_, title] = useContext(NavbarTitleContext);
  let router = useRouter();
  let isTopLevelNavDestination = topLevelNavDestinations.includes(router.pathname);
  let canGoBack = isBrowser ? window.history.length > initialHistoryLength : false;

  function handleNavigateBack() {
    if (canGoBack) router.back();
    else router.push('/');
  }

  return (
    <nav className={styles.topNav}>
      <div className={styles.backButtonContainer}>
        {!isTopLevelNavDestination && (
          <UnstyledButton style={{ lineHeight: 1 }} px="sm" onClick={handleNavigateBack}>
            <IconArrowLeft />
          </UnstyledButton>
        )}
      </div>
      <div>{title}</div>
      {rightSlot}
    </nav>
  );
}
