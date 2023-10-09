import { useNavbarTitle } from '@/hooks';
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
  Select, Paper,
} from '@mantine/core';
import Link from 'next/link';
import { IconDots, IconUser, IconTrash, IconChevronRight } from '@tabler/icons-react';
import useSWR from 'swr';
import { Alert } from '@mantine/core';
import { useRouter } from 'next/router';
import { HTTPError } from 'ky';

// pink F8D6D8
// yellow FFE55B

type q = {
  user_id: number
  sp_type: number,
  q_title: string,
  q_content: string,
  timestamp: bigint,
  last_edit: bigint,
  q_id: number
}

type a = {
  user_id: number,
  a_id: number,
  q_id: number,
  a_content: string,
  timestamp: bigint,
  last_edit: bigint,
}

export default function QuestionPage(){
  const router = useRouter();
  const q_id = router.query.q_id;

  let { data, error } = useSWR(['qa/questions/'+q_id+'/answers', { throwHttpErrors: true }]);
  if(error instanceof HTTPError && error.response.status === 404)
  {
    router.replace('/404');
  }

  let question = {} as q, answers = [];
  if(data)
  {
    question = data.question;
    answers = data.answers;
    console.log(question, answers);
  }

  let title = (question.q_title)? "Q: "+question.q_title : "運動論壇";
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <Container p='lg'>
        <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm'>
          <Group justify='space-between'>
            <Group>
              <IconUser />
              <Text fw={500}>User{question.user_id}</Text>
            </Group>
          </Group>
          <Text size="lg" m='md' fw='600'>Q: {question.q_title}</Text>
          <Text ml="xl" mr='lg' size='md' fw={500}>{question.q_content}</Text>
          <Link href={"forums/questions/"+question.q_id}>
          </Link>
        </Card>
          { !answers.length &&
            <Text size="md" my="xl" ta="center" fw={600}>
            目前沒有人回答喔～當第一個熱心ㄉ人吧！
            </Text>
          }
          {!!answers.length &&
            <Text size="md" mt="xl" mb='md' fw={600}>
              所有回應：
            </Text>
          }
          { !!answers.length &&
            answers.map( (answer:a)=>
              <Paper withBorder p={'lg'} key={answer.a_id} >
                <Group justify='space-between'>
                  <Group>
                    <IconUser />
                    <Text fw={500}>User{answer.user_id}</Text>
                  </Group>
                </Group>
                <Text ml={'xl'} mt={'lg'}>{answer.a_content}</Text>
              </Paper>
            )
          }
        </Container>
      </main>
    </>
  );
}
