import { useNavbarTitle } from '@/hooks';
import { Text, Title, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy } from '@tabler/icons-react';
import Head from 'next/head';

export default function ContactPage() {
  const title = '聯絡我們';
  const email = 'contact@yzu8minus1.com';
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <Title order={3} p="md">
          聯絡我們
        </Title>
        <Text px="md">
          如需任何協助，歡迎來信至 <a href={`mailto:${email}`}>{email}</a>
          <UnstyledButton
            onClick={() => {
              navigator.clipboard.writeText(email);
              notifications.show({
                message: '已複製電子郵件位址至剪貼簿',
              });
            }}
            ml="4px"
            style={{ border: '1px solid #aaa', borderRadius: '4px', padding: '2px 4px 2px 6px' }}
          >
            <IconCopy size="24" style={{ verticalAlign: 'bottom' }} />
            <span style={{ fontSize: '12px' }}>複製</span>
          </UnstyledButton>
          。
        </Text>
      </main>
    </>
  );
}
