import { useContext, useEffect } from 'react';
import { NavbarTitleContext } from './components/app/TopNavbar';

export function useNavbarTitle(title: string) {
  let [setTitle] = useContext(NavbarTitleContext);

  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);
}
