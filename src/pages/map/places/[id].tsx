import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '@mantine/dates/styles.css';
import useSWR from 'swr';
import { addRank } from '@/apis/rank';
import {
  Card,
  Container,
  Text,
  Menu,
  Group,
  ActionIcon,
  rem,
  Flex,
  Box,
  Button,
  Textarea,
  Rating,
  Center,
  Space
} from '@mantine/core';
import Link from 'next/link';
import {
  IconDots,
  IconUser,
  IconPlus,
  IconBallBasketball,
  IconChevronRight,
  IconCalendarOff,
  IconCalendarCheck,
  IconCalendarX,
  IconCheck,
  IconMap2,
  IconEdit,
  IconTrash,
  IconScoreboard,
  IconFileDescription,
  IconBulb
} from '@tabler/icons-react';
import { IconExternalLink } from '@tabler/icons-react';
import { Alert } from '@mantine/core';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { deletePosition } from '@/apis/map';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

export default function PlaceInfoPage() {
  const { query } = useRouter();
  const [StarValue, setValue] = useState(0);
  const [Comment, setComment] = useState('');
  const id = query.id;
  let { data, error: infoError } = useSWR(['map/getInfo?id=' + id, { throwHttpErrors: true }]);
  let fabContainer = useContext(FABContainerContext);

  useNavbarTitle('場館資訊');
  const { user, mutate: refreshUser } = useUser();
  let { trigger, error, loading } = useAsyncFunction(addRank);
  async function handlePostRank() {
    if (StarValue == 0) {
      console.log("error: 沒有填些星級")
      notifications.show({
        color: "red",
        title: '未選擇星級！',
        message: '評價不可為0喔！',
      })
      return;
    }
    if (loading) return;
    if (query.id) {
      let { error } = await trigger(parseInt(query.id[0]), StarValue);
      if (error) return console.error(error);
      notifications.show({
        color: "green",
        title: '新增Rank成功～',
        message: '隨時關注，以獲得最新資訊！',
      })
    }
  }

  return (
    <>
      <Head>
        <title>場館資訊</title>
      </Head>
      <main>
        {data &&
          < Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='md' shadow='sm'>
            <Group justify='space-between'>
              <Group>
                <IconUser />
                <Text fw={500}>User{data.Name}</Text>
              </Group>
            </Group>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconCalendarCheck />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>地址：{data.City}{data.Town}{data.address}</Text>
            </Flex>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconCalendarX />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>營業時間：{data.OpenTime} ~ {data.CloseTime}</Text>
            </Flex>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconCalendarOff />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>價格：{data.Price}</Text>
            </Flex>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconMap2 />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>停車資訊：{data.Parking}</Text>
            </Flex>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconFileDescription />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>官方網址：</Text>
            </Flex>
            <Text mt={'sm'} ml={'xl'} pl={'xl'} size='md' fw={700} style={{ whiteSpace: 'pre-wrap' }}>{data.Url}</Text>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconBulb />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>聯絡資訊：</Text>
            </Flex>
            <Text mt={'sm'} ml={'xl'} pl={'xl'} size='md' fw={700} style={{ whiteSpace: 'pre-wrap' }}>{data.Phone}</Text>
          </Card>
        }
        <Flex justify={'center'}>
          <Rating size={"xl"} value={StarValue} onChange={setValue} />
        </Flex>
        <Textarea
          minRows={6} radius={"lg"} mt={"sm"} autosize size={'md'} placeholder="新增相關評論吧！" required onChange={(event) => (setComment(event.currentTarget.value))}
        ></Textarea>
        <Button variant="gradient" gradient={{ from: 'yellow', to: 'orange', deg: 90 }} rightSection={<IconCheck />} mt="md" fullWidth onClick={handlePostRank}>送出評論</Button>
        {infoError && !data &&
          <Alert variant="light" color="red" my="md">
            錯誤：暫時無法取得資料
          </Alert>
        }

        {!data &&
          <Alert variant="light" color="yellow" my="md">
            目前沒有可以顯示的東西QQ
          </Alert>
        }
      </main>
    </>
  );
}