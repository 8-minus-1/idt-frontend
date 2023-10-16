import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';
import { Card, Container, Flex, Group, Select, Text, Alert, rem, Button } from '@mantine/core';
import React, { useState } from 'react';
import { Simulate } from 'react-dom/test-utils';
import error = Simulate.error;
import useSWR from 'swr';
import Link from 'next/link';
import { IconChevronRight, IconUser } from '@tabler/icons-react';

type m = {
  "User_id": number,
  "Name": string,
  "Content": string,
  "Place": string,
  "sp_type": number,
  "DateTime": string,
  "Time": string,
  "Other": string,
  "i_id": number,
}

function MListPage()
{
  const [sp_type, setSp_type] = useState<string>('0');

  let { data, error }  = useSWR(['invite/invitation/InviteType?sp_type='+sp_type, { throwHttpErrors: true }]);
  if(error) console.log("error: ",error);

  console.log(sp_type);

  const method =[
    { value: "0", label: "公開邀請" },
    { value: "1", label: "私人配對" },
  ];
  const sports = [
    { value: "0", label: "顯示全部邀請" },
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

  return(
    <>
      <main>
        <Container>
          <Group mt="md">
            <Select
              label="配對方式"
              data={method} allowDeselect={false}
              defaultValue={method[0].value}
              pb='xl'
              w={"30%"}
            />
            <Select
              label="運動類別篩選"
              data={sports} allowDeselect={false}
              defaultValue={sports[0].value}
              pb='xl'
              w={"30%"}
              value={sp_type}
              onChange={(value:string)=>(setSp_type(value))}
            />
          </Group>
          { error &&
            <Alert variant="light" color="red" my="md">
              暫時無法取得資料
            </Alert>
          }
          {data &&
            data.map((invite:m)=>
              <Link href={"match/invites/"+invite.i_id} key={invite.i_id}>
                <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm'>
                  <Group justify='space-between'>
                    <Group>
                      <IconUser/>
                      <Text fw={500}>User{invite.User_id}</Text>
                    </Group>
                  </Group>
                  <Text size="lg" m='md' fw='600'>{invite.Name}</Text>
                  <Text ml="xl" mr='lg' size='md' fw={500} lineClamp={3}>{invite.Content}</Text>
                  <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3} >日期時間 : {invite.DateTime}</Text>
                  <Flex c={'blue'} mt='md' justify='right'>
                    <Text style={{textDecoration: "underline", textDecorationThickness: rem(2)}} fw={600} size='md'>查看詳細內容</Text>
                    <IconChevronRight/>
                  </Flex>
                </Card>
              </Link>
            )
          }
          { data && !data.length &&
            <Alert variant="light" color="yellow" my="md">
              目前沒有可以顯示的內容QQ
            </Alert>
          }
        </Container>
      </main>
    </>
  );
}
export default function MatchPage() {
  const [displayState, setDisplayState] = useState(0);
  const title = '夥伴配對';
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        {displayState === 0 &&
          <>
            <MListPage/>
          </>
        }
      </main>
    </>
  );
}
