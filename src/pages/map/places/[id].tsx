import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Rating, Textarea, Button, Flex } from '@mantine/core';
import React, { useState }from 'react';
import { IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { addRank } from '@/apis/rank';
export default function PlaceInfoPage() {
  const { query } = useRouter();
  const [StarValue, setValue] = useState(0);
  const [Comment, setComment] = useState('');
  useNavbarTitle('場館資訊');
  const {user, mutate: refreshUser}=useUser();
  let {trigger, error, loading} = useAsyncFunction(addRank);
  async function handlePostRank() {
      if(StarValue==0){
        console.log("error: 沒有填些星級")
        notifications.show({
          color: "red",
          title: '未選擇星級！',
          message: '評價不可為0喔！',
        })
        return;
      }
    if(loading) return;
    if(query.id)
    {
      let {error} = await trigger(parseInt(query.id[0]), StarValue);
      if(error) return console.error(error);
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
        {query.id}
        <Flex justify={'center'}>
          <Rating size={"xl"} value={StarValue} onChange={setValue}/>
        </Flex>
        <Textarea
          minRows={6} radius={"lg"} mt={"sm"}  autosize size={'md'} placeholder="新增相關評論吧！" required onChange={(event)=>(setComment(event.currentTarget.value))}
        ></Textarea>
        <Button variant="gradient" gradient={{ from: 'yellow', to: 'orange', deg: 90 }} rightSection={<IconCheck />} mt="md" fullWidth onClick={handlePostRank}>送出評論</Button>
      </main>
    </>
  );
}
