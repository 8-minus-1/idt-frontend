import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Rating, Textarea, Button } from '@mantine/core';
import React from 'react';
import { IconCheck } from '@tabler/icons-react';
export default function PlaceInfoPage() {
  const { query } = useRouter();

  useNavbarTitle('場館資訊');

  return (
    <>
      <Head>
        <title>場館資訊</title>
      </Head>
      <main>
        {query.id}
        <Rating size={"xl"} />
        <Textarea
          minRows={6} radius={"lg"} mt={"sm"}  autosize size={'md'} placeholder="新增相關評論吧！"
        ></Textarea>
        <Button variant="gradient" gradient={{ from: 'yellow', to: 'orange', deg: 90 }} rightSection={<IconCheck />} mt="md" fullWidth>送出評論</Button>
      </main>
    </>
  );
}
