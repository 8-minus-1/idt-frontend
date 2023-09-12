import styles from '@/styles/app.module.css';
import { createContext, useContext } from 'react';

export type NavbarTitleContextValue = [(newTitle: string) => void, string];

export const NavbarTitleContext = createContext<NavbarTitleContextValue>([
  (newTitle: string) => {},
  '',
]);

export default function TopNavbar() {
  let [_, title] = useContext(NavbarTitleContext);

  return (
    <nav className={styles.topNav}>
      <div>{/* 返回按鈕 */}</div>
      <div>{title}</div>
      <div>{/* placeholder */}</div>
    </nav>
  );
}
