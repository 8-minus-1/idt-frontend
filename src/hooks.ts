import { useContext, useEffect, useState } from 'react';
import { NavbarTitleContext } from './components/app/TopNavbar';
import useSWR from 'swr';

export function useNavbarTitle(title: string) {
  let [setTitle] = useContext(NavbarTitleContext);

  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);
}

export type User = {
  id: number;
  email: string;
  phone?: string;
  profileCompleted: boolean;
  nickname?: string;
};

export function useUser(): { user: User | null; mutate: () => void } {
  let { data: user, mutate } = useSWR(['auth/status', { throwHttpErrors: false }]);
  return { user, mutate };
}

export function useAsyncFunction<Fn extends (...args: any[]) => any>(fn: Fn) {
  let [data, setData] = useState<any>(null);
  let [error, setError] = useState<any>(null);
  let [loading, setLoading] = useState(false);

  return {
    loading,
    data,
    error,
    async trigger(...args: Parameters<Fn>): Promise<{
      data?: Awaited<ReturnType<Fn>>;
      error?: any;
    }> {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        let d = await fn(...args);
        setData(d);
        return { data: d };
      } catch (e) {
        setError(e);
        return { error: e };
      } finally {
        setLoading(false);
      }
    },
  };
}
