import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { HTTPError } from 'ky';
import { Card, Container, Group, Text, Alert, Flex, rem } from '@mantine/core';
import { IconBulb, IconCalendarCheck, IconMap2, IconUser } from '@tabler/icons-react';

type m = {
  "User_id": number,
  "Name": string,
  "Place": string,
  "sp_type": number,
  "DateTime": string,
  "Time": string,
  "Other": string,
  "i_id": number,
}
type inviteCardProps = {
  invite: m
}

function InviteCard({invite}: inviteCardProps)
{
  let {user} = useUser();
  let router = useRouter();

  const sports = [
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

  let p_id = invite.Place
  let { data: placeInfo, error: placeInfoError } = useSWR(['map/getInfo?id='+p_id, { throwHttpErrors: true }]);

  let place = '';
  if(placeInfo)
  {
    place = placeInfo.Name;
  }

  return(
    <Card padding="lg"  pb='xl' bg="#D6EAF8" radius="lg" mb='xs' shadow='sm'>
      <Group justify='space-between'>
        <Group>
          <IconUser/>
          <Text fw={500}>User{invite.User_id}</Text>
        </Group>
      </Group>
      <Text size="xl" ml={'lg'} mt='lg' fw='700'>{'【 '+ sports[invite.sp_type].label+' 】' + invite.Name}</Text>
      <Flex ml={'xl'} mt='md' justify={'flex-start'}>
        <IconCalendarCheck />
        <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
          邀約日期 : {new Date(invite.DateTime).toLocaleDateString()}
        </Text>
      </Flex>
      <Flex ml={'xl'} mt='md' justify={'flex-start'}>
        <IconCalendarCheck />
        <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
          邀約時間 :
          {new Date(invite.DateTime).toLocaleTimeString().split(':')[0] + ':' + new Date(invite.DateTime).toLocaleTimeString().split(':')[1]}
        </Text>
      </Flex>
      <Flex ml={'xl'} mt='md' justify={'flex-start'}>
        <IconMap2/>
        <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
          邀約地點 : {place}
        </Text>
      </Flex>
      <Flex ml={'xl'} mt='md' justify={'flex-start'}>
        <IconBulb />
        <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
          更多資訊（內容） :
        </Text>
      </Flex>
      <Text mt={'sm'} ml={'xl'} pl={'xl'} size='md' fw={700} style={{whiteSpace: 'pre-wrap'}}>
        {invite.Other}
      </Text>

    </Card>
  )
}
export default function InvitePage() {
  const router = useRouter();
  const i_id = router.query.i_id;

  const [pageStatus, setPageStatus] = useState(0);

  let { data, error } = useSWR(['invite/invitation/'+i_id, { throwHttpErrors: true }]);
  console.log(data)

  if(error instanceof HTTPError && error.response.status === 404)
  {
    router.replace('/error');
  }

  const title = '邀約詳細資訊';
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <Container p='lg'>
          { error &&
            <Alert variant="light" color="red" my="md">
              暫時無法取得資料
            </Alert>
          }
          { !error && !!data &&
            <>
              <InviteCard invite={data[0]}></InviteCard>
            </>
          }
        </Container>
      </main>
    </>
  );
}
