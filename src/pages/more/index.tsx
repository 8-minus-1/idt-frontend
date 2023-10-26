import { signOut } from '@/apis/auth';
import { useNavbarTitle, useUser } from '@/hooks';
import { Button, Card, Container, Divider, Flex, Group, rem, Space, Text } from '@mantine/core';
import { IconChevronRight, IconMessage, IconShield, IconUser,  IconId    } from '@tabler/icons-react';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

export default function MorePage() {
  const title = '數據與更多';
  useNavbarTitle(title);
  const { user, mutate: refreshUser } = useUser();

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
              <Link href={'/my/info'}>
              <Card p="xl" bg="#edfdff" radius="md">
                <Flex gap="xl">
                  <Flex align={'center'}>
                    <IconUser />
                  </Flex>
                  <Flex direction={'column'}>
                    <Text fw={500}>{user.email}</Text>
                    <Text size={rem(13)} fw={500}>
                      {!user.profileCompleted &&
                       <>尚未完成個人資料設定及註冊問卷！點此進行填寫～</>
                      }
                      { !!user.profileCompleted &&
                        <>點此查看、修改個人資料！</>
                      }
                    </Text>
                  </Flex>
                  <Flex direction={'row'} align={'center'} style={{ marginLeft: 'auto' }}>
                    <IconChevronRight />
                  </Flex>
                </Flex>
              </Card>
              </Link>
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
        {[
          [IconId, '我ㄉ', '/my'],
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
