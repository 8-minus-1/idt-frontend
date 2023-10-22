import { signOut } from '@/apis/auth';
import { useNavbarTitle, useUser } from '@/hooks';
import {
  Alert, Box,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Group,
  rem,
  Space,
  Text,
} from '@mantine/core';
import {
  IconChevronRight,
  IconMessage,
  IconShield,
  IconUser,
  IconId,
  IconHeartHandshake, IconInfoCircle, IconFriends, IconInbox, IconHistory,
} from '@tabler/icons-react';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

export default function MorePage() {
  const title = '我ㄉ個人資訊';
  useNavbarTitle(title);
  const { user, mutate: refreshUser } = useUser();

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        {!user && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70vh',
          }}>
            {(
              <>
                <Alert
                  color="blue" fw={500}>
                  登入後即可使用此功能！前往
                  <Link href = '/signin'> 註冊/登入</Link>
                </Alert>
              </>
            )}
          </Box>
        )}
        {!!user && (
          <>
          </>
        )}
      </main>
    </>
  );
}
