import { useNavbarTitle } from '@/hooks';
import { Text, Title } from '@mantine/core';
import Head from 'next/head';

export default function PrivacyPolicyPage() {
  const title = '隱私權政策';
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <Title order={3} p="md">隱私權政策</Title>
        <Text px="md">更新時間：2023/11/1</Text>
        <Text px="md" pt="xs">正文</Text>
      </main>
    </>
  );
}
