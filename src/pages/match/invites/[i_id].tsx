import { useAsyncFunction, useNavbarTitle } from '@/hooks';
import Head from 'next/head';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { HTTPError } from 'ky';
import { Card, Container, Group, Text, Alert } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

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
type inviteCardProps = {
  invite: m
}

function InviteCard({invite}: inviteCardProps)
{
  let router = useRouter();

  return(
    <Card padding="lg"  pb='xl' bg="#D6EAF8" radius="lg" mb='xs' shadow='sm'>
      <Group justify='space-between'>
        <Group>
          <IconUser/>
          <Text fw={500}>User{invite.User_id}</Text>
        </Group>
      </Group>
      <Text size="lg" m='md' fw='600'>{invite.Name}</Text>
      <Text ml="xl" mr='lg' size='md' fw={500} style={{whiteSpace: 'pre-wrap'}}>{invite.Content}</Text>
      <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>地點 : {invite.Place}</Text>
      <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>日期時間 : {invite.DateTime}</Text>
      <Text ml="xl" mr='lg' size='md' fw={500} mt="md" style={{whiteSpace: 'pre-wrap'}}>補充 : {invite.Other }</Text>

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

  const title = '夥伴配對';
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
