import { signOut } from '@/apis/auth';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import { useNavbarTitle, useUser } from '@/hooks';
import { Button, Card, Container, Divider, Flex, Group, Space, Text } from '@mantine/core';
import { IconChevronRight, IconMessage, IconShield, IconUser } from '@tabler/icons-react';
import Head from 'next/head';
import Link from 'next/link';
import React, { useContext } from 'react';
import { createPortal } from 'react-dom';

export default function MorePage() {
  const title = '數據與更多';
  useNavbarTitle(title);
  const { user, mutate: refreshUser } = useUser();
  let fabContainer = useContext(FABContainerContext);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <Container m="lg">
          {!user && (
            <>
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
            </>
          )}
          {!!user && (
            <>
              <Card p="xl" bg="#edfdff" radius="md">
                <Flex gap="xl">
                  <IconUser />
                  <Text fw={500}>{user.email}</Text>
                  <IconChevronRight style={{ marginLeft: 'auto' }} />
                </Flex>
              </Card>
              <Group justify="flex-end" mt="sm">
                <Button
                  onClick={() => {
                    signOut().then(() => {
                      refreshUser();
                    });
                  }}
                >
                  登出
                </Button>
              </Group>
            </>
          )}
        </Container>
        <Space h="xl" />
        <Space h="30em" />
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
        {fabContainer && createPortal(<Button>新增東東</Button>, fabContainer)}
      </main>
    </>
  );
}
