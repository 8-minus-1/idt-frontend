import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import React, { useContext, useState } from 'react';
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
Button
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
IconCalendarX, IconMap2, IconScoreboard,
} from '@tabler/icons-react';
import useSWR from 'swr';
import { Alert } from '@mantine/core';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import { createPortal } from 'react-dom';
import { Router, useRouter } from 'next/router';
import { HTTPError } from 'ky';

type Contests = {
  User_id: number,
  Name: string,
  Organizer: string,
  Place: string,
  Content: string,
  sp_type: number,
  StartDate: any,
  EndDate: any,
  Deadline: any,
  Url: string,
  Other: string,
  c_id: number,
  nickname: string
}

export default function EventsPage() {
  const router = useRouter();
  let p_id:number = parseInt(router.query.p_id as string);
  let str = 'cont/contests/place/' + p_id;
  let title = "活動列表";

  let { data, error, mutate:refreshList } = useSWR([str, { throwHttpErrors: true }]);
  console.log(data);
  if (data && data.length) console.log(data[0]);
  if (error) console.log("error: ", error);

  let { data: placeInfo, error: placeInfoError } = useSWR(['map/getInfo?id='+p_id, { throwHttpErrors: true }]);
  let place = '';
  if(placeInfo)
  {
    place = placeInfo.Name;
    title = "活動列表："+place;
  }

  const sports = [
    { value: "0", label: "顯示全部活動" },
    { value: "1", label: "籃球" },
    { value: "2", label: "排球" },
    { value: "3", label: "羽球" },
    { value: "4", label: "網球" },
    { value: "5", label: "游泳" },
    { value: "6", label: "直排輪" },
    { value: "7", label: "足球" },
    { value: "8", label: "桌球" },
    { value: "9", label: "棒球" },
    { value: "10", label: "壘球" },
    { value: "11", label: "躲避球" },
    { value: "12", label: "跆拳道" },
    { value: "13", label: "巧固球" },
    { value: "14", label: "保齡球" },
    { value: "15", label: "其他" },
  ];

  useNavbarTitle(title);

  let tz_offset = (new Date()).getTimezoneOffset() * 60000;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <Container p="lg">
          {!!data && data.map((contest: Contests) =>(
            <Link href={"/events/contests/" + contest.c_id} key={contest.c_id}>
              <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm'>
                <Group justify='space-between'>
                  <Group>
                    <IconUser />
                    <Text fw={700} pt={rem(5)} >{contest.nickname}</Text>
                  </Group>
                </Group>
                <Text size="xl" ml={'lg'} mt='lg' fw='600'>{'【 '+sports[contest.sp_type].label+' 】' + contest.Name}</Text>
                <Flex ml={'xl'} mt='md' justify={'flex-start'}>
                  <IconMap2 />
                  <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>活動地點：{place}</Text>
                </Flex>
                <Flex ml={'xl'} mt='md' justify={'flex-start'}>
                  <IconScoreboard />
                  <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>主辦單位：{contest.Organizer}</Text>
                </Flex>
                <Flex ml={'xl'} mt='md' justify={'flex-start'}>
                  <IconCalendarCheck />
                  <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
                    活動日期：
                    {new Date(contest.StartDate).toLocaleDateString() + " ～ " + new Date(contest.EndDate).toLocaleDateString() }
                  </Text>
                </Flex>
                <Flex ml={'xl'} mt='md' justify={'flex-start'}>
                  <IconCalendarOff />
                  <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>報名截止日期：{new Date(contest.Deadline).toLocaleDateString()}</Text>
                </Flex>
                <Flex mt='md' justify='right' c={'blue'}>
                  <Text style={{textDecoration: "underline", textDecorationThickness: rem(2)}} fw={600} size='md'>查看詳細內容</Text>
                  <IconChevronRight />
                </Flex>
              </Card>
            </Link>)
          )}
          { error instanceof HTTPError && error.response.status === 404 &&
            <Alert variant="light" color="red" my="md">
              錯誤：PAGE NOT FOUND
            </Alert>
          }
          { error && ( !(error instanceof HTTPError) || (error instanceof HTTPError && error.response.status !== 404) ) &&
            <Alert variant="light" color="red" my="md">
              暫時無法取得資料
            </Alert>
          }
          { data && !data.length &&
            <Alert variant="light" color="yellow" my="md">
              目前沒有可以顯示的東西QQ
            </Alert>
          }
        </Container>
      </main>
    </>
  );
}
