import styles from '@/styles/app.module.css';
import {
  IconMap,
  IconMessage2,
  IconReportAnalytics,
  IconSpeakerphone,
  IconUsers,
  TablerIconsProps,
} from '@tabler/icons-react';
import cn from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const items: [string, string, (props: TablerIconsProps) => React.JSX.Element][] = [
  ['場館地圖', '/map', IconMap],
  ['比賽活動', '/events', IconSpeakerphone],
  ['運動論壇', '/forums', IconMessage2],
  ['夥伴配對', '/match', IconUsers],
  ['數據與更多', '/more', IconReportAnalytics],
];

export default function BottomNavbar() {
  let router = useRouter();
  let [k, setK] = useState(0);
  useEffect(() => {
    if (router.isReady) {
      setK((k) => k + 1);
    }
  }, [router.isReady]);

  return (
    <nav className={styles.bottomNav} key={k}>
      {items.map(([label, path, Icon]) => {
        let active = false;
        if (router.isReady) {
          let pathToCheck = router.asPath.split('#')[0].split('?')[0];
          if (pathToCheck === path || pathToCheck.startsWith(path + '/')) {
            active = true;
          }
        }
        return (
          <Link
            href={path}
            className={cn(styles.item, { [styles.active]: active })}
            key={path}
            suppressHydrationWarning
          >
            <Icon className={styles.icon} />
            <div className={styles.label}>{label}</div>
          </Link>
        );
      })}
    </nav>
  );
}
