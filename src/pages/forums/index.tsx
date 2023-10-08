import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';
import React, { useState } from 'react';
import { Card, Container, Text, Menu, Group, ActionIcon, rem, } from '@mantine/core';
import Link from 'next/link';
import { IconDots, IconUser, IconTrash } from '@tabler/icons-react';
import useSWR from 'swr';

// mantine: xs, sm, md lg, xl

// TODO: 下拉選單選Type (sp_type)
// TODO: 點擊進入某一個問題（displayState = 1, setQ_id）
// TODO: 顯示單一問題 ！！！或是Dynamic Routing！！！
// TODO: 新增問題


type QListPage = {
  displayByQ_id: (q_id: number) => void
};

type q = {
  user_id: number
  sp_type: number,
  q_title: string,
  q_content: string,
  timestamp: bigint,
  last_edit: bigint,
  q_id: 3
}

function QListPage({displayByQ_id}: QListPage)
{
  const [sp_type, setSp_type] = useState(0);

  let { data, mutate } = useSWR(['qa/questions', { throwHttpErrors: false }]);
  if(data) console.log(data[0].q_title);

  return(
    <>
      <main>
        <Container m='lg'>
          {data && data.map((question:q ,i:number)=>
            <React.Fragment key={i}>
              <Card padding="lg" pb='xl' bg="#edfdff" radius="lg" mb='xl'>
                <Group justify='space-between'>
                  <Group>
                    <IconUser />
                    <Text fw={500}>User{question.user_id}</Text>
                  </Group>
                  <Menu withinPortal position="bottom-end" shadow="sm">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDots style={{ width: rem(16), height: rem(16) }} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconTrash/>}
                        color="red"
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
                <Text size="lg" m='md' fw='600'>Q: {question.q_title}</Text>
                <Text ml="xl" mr='lg' size='md' fw={500} lineClamp={3}>{question.q_content}</Text>
              </Card>
            </React.Fragment>
          )}
        </Container>
      </main>
    </>
  );
}

export default function ForumsPage(){
  const [displayState, setDisplayState] = useState(0);
  const [q_id, setQ_id] = useState<number|null>(null);
  const title = '運動論壇';

  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        { displayState === 0 && (
          <QListPage
            displayByQ_id = {(q_id) =>  {
               setQ_id(q_id);
               setDisplayState(1);
            }}
          />
          )
        }
      </main>
    </>
  );
}
