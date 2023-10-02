import { NavbarTitleContext } from '@/components/app/TopNavbar';
import { Card, Container, Divider, Flex, Space, Text } from '@mantine/core';
import { IconChevronRight, IconMessage, IconShield, IconUser } from '@tabler/icons-react';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import { useContext, useEffect } from 'react';

export default function MorePage() {
  let title = '數據與更多';

  let [setTitle] = useContext(NavbarTitleContext);

  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <Container m="lg">
          <Link href="/signin">
            <Card p="xl" bg="#edfdff" radius="md">
              <Flex gap="xl">
                <IconUser />
                <Text fw={500}>登入/註冊</Text>
                <IconChevronRight style={{ marginLeft: 'auto' }} />
              </Flex>
            </Card>
          </Link>
          <Text size="sm" my="sm">
            登入後即可參與論壇討論及使用配對交友功能！
          </Text>
        </Container>
        <Space h="xl" />
        {[
          [IconShield, '隱私權政策', '/privacy'],
          [IconMessage, '聯絡我們', '/contact'],
        ].map(([Icon, label, href], i) => (
          <React.Fragment key={i}>
            {i > 0 && <Divider />}
            <Card component={Link} href={href as string} radius={0}>
              <Flex gap="xl">
                <Icon />
                <Text fw={500}>{label as string}</Text>
                <IconChevronRight style={{ marginLeft: 'auto' }} />
              </Flex>
            </Card>
          </React.Fragment>
        ))}
      </main>
    </>
  );
}
