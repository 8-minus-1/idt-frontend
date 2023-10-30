import { useNavbarTitle, useUser } from '@/hooks';
import { Alert, Card, Center, Divider, Group, Stack, Text } from '@mantine/core';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import useSWR from 'swr';

type Chat = {
  id: number;
  name: string;
  lastMessage: {
    senderName: string;
    type: number;
    content: string | null;
    createdAt: number;
  };
};

const MessageType = {
  Message: 0,
  InviteCreated: 1,
  UserJoined: 2,
};

function formatMessage(type: number, content: string | null) {
  if (type === MessageType.Message) {
    return ': ' + content;
  }
  if (type === MessageType.InviteCreated) {
    return '已發起邀約';
  }
  if (type === MessageType.UserJoined) {
    return '已加入邀約';
  }
  return '';
}

function sameYear(date: Date, other: Date) {
  return date.getFullYear() === other.getFullYear();
}

function sameDate(date: Date, other: Date) {
  return (
    date.getFullYear() === other.getFullYear() &&
    date.getMonth() === other.getMonth() &&
    date.getDate() === other.getDate()
  );
}

function formatTime(time: number) {
  let d = new Date(time);
  let today = new Date();
  if (sameDate(d, today)) {
    let h = d.getHours();
    let m = d.getMinutes();
    let amPm = h >= 12 ? '下午' : '上午';
    h %= 12;
    if (h === 0) h = 12;
    return `${amPm} ${h}:${String(m).padStart(2, '0')}`;
  }
  let y = sameYear(d, today) ? '' : `${d.getFullYear()}/`;
  return `${y}${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ChatListPage() {
  const title = '所有對話';
  useNavbarTitle(title);

  const { user } = useUser();
  const {
    data: chats,
    isLoading,
    error,
    mutate,
  } = useSWR<Chat[]>('chats', null, { revalidateOnMount: true });

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      {!user && (
        <Center style={{ flex: 1 }}>
          <Alert color="blue" fw="500">
            登入後即可使用配對功能！前往
            <Link href="/signin"> 註冊/登入</Link>
          </Alert>
        </Center>
      )}
      {user && !chats && isLoading && (
        <Center style={{ flex: 1 }}>
          <Alert color="blue" fw="500">
            正在載入對話
          </Alert>
        </Center>
      )}
      {user && !chats && !isLoading && error && (
        <Center style={{ flex: 1 }}>
          <Alert variant="light" color="red" fw="500">
            無法載入對話。
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                mutate();
              }}
            >
              點選重試
            </a>
          </Alert>
        </Center>
      )}
      {chats && !chats.length && (
        <Center style={{ flex: 1 }}>
          <Alert color="blue" fw="500">
            加入邀約後就能聊天囉！
          </Alert>
        </Center>
      )}
      {chats && !!chats.length && (
        <main>
          {chats.map((chat, i) => (
            <React.Fragment key={chat.id}>
              {i > 0 && <Divider />}
              <Link href={`/match/chats/${chat.id}`}>
                <Card radius="0">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap="xs">
                      <Text lineClamp={1}>{chat.name}</Text>
                      <Text size="sm" lineClamp={1}>
                        {chat.lastMessage.senderName}
                        {formatMessage(chat.lastMessage.type, chat.lastMessage.content)}
                      </Text>
                    </Stack>
                    <Text size="sm" style={{ flexShrink: 0 }}>
                      {formatTime(chat.lastMessage.createdAt)}
                    </Text>
                  </Group>
                </Card>
              </Link>
            </React.Fragment>
          ))}
        </main>
      )}
    </>
  );
}
