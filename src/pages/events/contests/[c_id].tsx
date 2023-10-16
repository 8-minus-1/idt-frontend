import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import React, { useState } from 'react';
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
  Select, Paper, Button, Textarea,
} from '@mantine/core';
import Link from 'next/link';
import { IconDots, IconUser, IconTrash, IconChevronLeft, IconSend, IconChevronRight} from '@tabler/icons-react';
import useSWR from 'swr';
import { Alert } from '@mantine/core';
import { useRouter } from 'next/router';
import { HTTPError } from 'ky';
import { notifications } from '@mantine/notifications';

// pink F8D6D8
// yellow FFE55B

type Contests = {
    User_id: number,
    Name: string,
    Place: string,
    Content: string,
    sp_type: number,
    StartDate: string,
    EndDate: string,
    Deadline: string,
    Url: string,
    Other: string,
    c_id: number
  }

export default function ContestPage(){
  const router = useRouter();
  const c_id = router.query.c_id;

  // 0: display, 1: new, 2: edit
  const [pageStatus, setPageStatus] = useState(0);

  let { data, error } = useSWR(['cont/contests/'+c_id, { throwHttpErrors: true }]);
  console.log(data)

  if(error instanceof HTTPError && error.response.status === 404)
  {
    router.replace('/error');
  }

  return (
    <>
      <Head>
        <title>{}</title>
      </Head>
      <main>
        <Container p='lg'>
            {data && data.map((contest: Contests) =>
                <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm' key={contest.c_id}>
                    <Group justify='space-between'>
                    <Group>
                        <IconUser />
                        <Text fw={500}>User{contest.User_id}</Text>
                    </Group>
                    </Group>
                    <Text size="lg" m='md' fw='600'>{contest.Name}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} style={{whiteSpace: 'pre-wrap'}}>{contest.Content}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" style={{whiteSpace: 'pre-wrap'}}>{contest.Other}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>地點 : {contest.Place}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>時間 : {contest.StartDate.split("T")[0] +" ~ "+ contest.EndDate.split("T")[0]}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>報名截止日期 : {contest.Deadline.split("T")[0]}</Text>
                    <Link href={contest.Url} target={'_blank'}>
                    <Flex mt='md' justify='right'>
                        <Text fw={600} size='md'>我要報名</Text>
                        <IconChevronRight/>
                    </Flex>
                    </Link>
                </Card>
            )}
            { error &&
            <Alert variant="light" color="red" my="md">
              暫時無法取得資料
            </Alert>
          }
          { !error }
        </Container>
      </main>
    </>
  );
}
