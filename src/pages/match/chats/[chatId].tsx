import { client } from '@/apis/common';
import { useNavbarTitle, useUser } from '@/hooks';
import { Alert, Center, Flex, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { HTTPError } from 'ky';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import styles from '@/styles/ChatPage.module.css';
import classNames from 'classnames';
import { useWindowScroll } from '@mantine/hooks';
import { MessageType } from '@/constants';
import React from 'react';
import Link from 'next/link';

type Message = {
  id: number;
  from: {
    id: number;
    nickname: string;
  };
  createdAt: number;
  type: number;
  content: string | null;
};

type Invitation = {
  User_id: number;
  Name: string;
  Place: number;
  sp_type: number;
  DateTime: number;
  Other: string;
  i_id: number;
};

type Place = {
  ID: number;
  Name: string;
  Latitude: number;
  Longitude: number;
  Address: string;
  OpenTime: string;
  Close: string;
  Url: string;
  Phone: string;
  Renew: string;
  User: number;
  Rank: number;
};

function formatTime(time: number) {
  let d = new Date(time);
  let h = d.getHours();
  let m = d.getMinutes();
  let amPm = h >= 12 ? '下午' : '上午';
  h %= 12;
  if (h === 0) h = 12;
  return `${amPm} ${h}:${String(m).padStart(2, '0')}`;
}

function formatServiceMessage(m: Message) {
  if (m.type === MessageType.InviteCreated) {
    return m.from.nickname + '已發起邀約';
  }
  if (m.type === MessageType.UserJoined) {
    return m.from.nickname + '已加入邀約';
  }
}

function sameYear(date: Date, other: Date) {
  return date.getFullYear() === other.getFullYear();
}

function formatDate(d: Date) {
  let today = new Date();
  let y = sameYear(d, today) ? '' : `${d.getFullYear()}/`;
  return `${y}${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateTime(d: number) {
  return formatDate(new Date(d)) + ' ' + formatTime(d);
}

function getDateHeaders(messages: Message[]) {
  const headers: Record<string, string> = {};
  let lastDate = '';
  messages.forEach((m, i) => {
    let date = formatDate(new Date(m.createdAt));
    if (date !== lastDate) {
      lastDate = date;
      headers[i] = date;
    }
  });
  return headers;
}

function useMessages(chatId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [messages, setMessages] = useState<Message[] | null>(null);

  useEffect(() => {
    if (!chatId) return;

    let canceled = false;
    async function go() {
      let sinceId = 0;
      if (messages && messages.length) {
        sinceId = messages[messages.length - 1].id;
      }
      setIsLoading(true);
      setError(null);
      try {
        const m = (await client
          .get(`chats/${chatId}/messages?sinceId=${sinceId}`)
          .json()) as Message[];
        if (canceled) return;
        if (!messages || m.length) {
          setMessages((oldM) => (oldM ? oldM.concat(m) : m));
        }
      } catch (e) {
        console.error(e);
        setError(e);
      }
      setIsLoading(false);
    }
    go();
    return () => {
      canceled = true;
    };
  }, [chatId, reloadCounter]);

  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setReloadCounter((c) => c + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  return {
    isLoading,
    messages,
    error,
    reload() {
      setReloadCounter((c) => c + 1);
    },
  };
}

export default function ChatPage() {
  const router = useRouter();
  const { chatId } = router.query;

  const { user } = useUser();
  const { data: invitationInfo } = useSWR<Invitation[]>(
    chatId ? `invite/invitation/${chatId}` : null
  );
  const { data: place } = useSWR<Place>(
    invitationInfo ? `map/getInfo?id=${invitationInfo[0].Place}` : null
  );
  const { messages, isLoading, error, reload } = useMessages(chatId as string);
  const lastMessageId = messages?.length ? messages[messages.length - 1].id : 0;
  const dateHeaders = messages ? getDateHeaders(messages) : {};

  const [composingMessage, setComposingMessage] = useState('');

  let title = '聊天';
  if (invitationInfo) {
    title = invitationInfo[0].Name;
  }

  useNavbarTitle(title);
  useEffect(() => {
    if (error instanceof HTTPError && error.response.status === 401) {
      router.replace('/match/chats');
    }
  }, [error]);
  const [firstScroll, setFirstScroll] = useState(true);
  const scrollEl = typeof window !== 'undefined' ? document.scrollingElement : null;
  const [pos] = useWindowScroll();
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastAutoScrolledMessageId, setLastAutoScrolledMessageId] = useState(-1);

  useEffect(() => {
    if (!firstScroll) return;
    if (!messages) return;
    if (isLoading) return;
    if (!scrollEl) return;
    setFirstScroll(false);
    const maxScrollTop = scrollEl.scrollHeight - scrollEl.clientHeight;
    window.scrollTo({ top: maxScrollTop });
  }, [firstScroll, messages, isLoading]);

  useEffect(() => {
    if (!scrollEl) return;
    const maxScrollTop = scrollEl.scrollHeight - scrollEl.clientHeight;
    setAutoScroll(maxScrollTop - scrollEl.scrollTop < 64);
  }, [pos]);

  useEffect(() => {
    if (!autoScroll) return;
    if (!scrollEl) return;
    if (lastMessageId === lastAutoScrolledMessageId) return;
    setLastAutoScrolledMessageId(lastMessageId);
    const maxScrollTop = scrollEl.scrollHeight - scrollEl.clientHeight;
    window.scrollTo({ top: maxScrollTop });
  }, [lastMessageId, autoScroll, lastAutoScrolledMessageId]);

  const [isSendingMessage, setIsSendingMessage] = useState(false);

  async function send() {
    if (isSendingMessage) return;
    setIsSendingMessage(true);
    try {
      await client.post(`chats/${chatId}/messages`, {
        json: {
          content: composingMessage,
        },
      });
      setAutoScroll(true);
      reload();
      setComposingMessage('');
    } catch (e) {
      console.error(e);
    }
    setIsSendingMessage(false);
  }

  function handleKeyDown(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (
      !(ev.nativeEvent.isComposing || ev.keyCode === 229) &&
      ev.key === 'Enter' &&
      !!composingMessage.trim()
    ) {
      send();
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.messages}>
          {invitationInfo && place && (
            <Link
              className={styles.invitationInfo}
              href={`/match/invites/${invitationInfo[0].i_id}`}
            >
              <Stack gap="0">
                <Text size="sm">時間：{formatDateTime(invitationInfo[0].DateTime)}</Text>
                <Text size="sm">地點：{place.Name}</Text>
              </Stack>
            </Link>
          )}
          {!messages && !isLoading && error && (
            <Center style={{ flex: '1' }}>
              <Alert variant="light" color="red" fw="500">
                無法載入訊息，請稍後再試。
              </Alert>
            </Center>
          )}
          {!messages && isLoading && (
            <Center style={{ flex: '1' }}>
              <Alert color="blue" fw="500">
                正在載入訊息
              </Alert>
            </Center>
          )}
          {messages &&
            messages.map((m, i) => {
              let isSelf = m.from.id === user?.id;
              let isService = m.type !== 0;
              return (
                <React.Fragment key={m.id}>
                  {dateHeaders[i] && (
                    <Center py="lg">
                      <div className={styles.date}>{dateHeaders[i]}</div>
                    </Center>
                  )}
                  <div
                    className={classNames(
                      styles.message,
                      isSelf && styles.self,
                      isService && styles.service
                    )}
                  >
                    {!isService && (
                      <>
                        {!isSelf && <div className={styles.name}>{m.from.nickname}</div>}
                        <div className={styles.bubbleWrapper}>
                          <div className={styles.bubble}>{m.content}</div>
                          <div className={styles.time}>{formatTime(m.createdAt)}</div>
                        </div>
                      </>
                    )}
                    {isService && (
                      <div className={styles.serviceMessage}>
                        {formatServiceMessage(m)}
                        <br />
                        {formatTime(m.createdAt)}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
        </div>
        <Flex h="48px" className={styles.messageInput}>
          <input
            disabled={isSendingMessage}
            value={composingMessage}
            onInput={(e) => setComposingMessage(e.currentTarget.value)}
            onKeyDown={(e) => handleKeyDown(e)}
            placeholder="輸入訊息..."
          />
          <UnstyledButton bg="white" px="sm" lh="1" onClick={send} disabled={isSendingMessage}>
            <IconSend />
          </UnstyledButton>
        </Flex>
      </div>
    </>
  );
}
