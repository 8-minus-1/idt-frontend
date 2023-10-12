import { useAsyncFunction, useNavbarTitle } from '@/hooks';
import Head from 'next/head';
import React, { useState, useContext } from 'react';
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
  Select, Button, Textarea, TextInput,
} from '@mantine/core';
import Link from 'next/link';
import {
  IconDots,
  IconUser,
  IconTrash,
  IconChevronRight,
  IconEdit,
  IconChevronLeft,
  IconCheck, IconSend,
} from '@tabler/icons-react';
import useSWR from 'swr';
import { Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { addAnswer, addQuestion } from '@/apis/qa';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import { createPortal } from 'react-dom';
import { router } from 'next/client';
import { notifications } from '@mantine/notifications';

// mantine: xs, sm, md, lg, xl

// TODO: 點擊進入某一個問題（displayState = 1, setQ_id）
// TODO: 顯示單一問題 ！！！或是Dynamic Routing！！！
// TODO: 新增問題
// TODO: 顯示日期時間

type q = {
  user_id: number
  sp_type: number,
  q_title: string,
  q_content: string,
  timestamp: bigint,
  last_edit: bigint,
  q_id: number
}

function QListPage()
{
  const [sp_type, setSp_type] = useState<string>('0');

  let { data, error } = useSWR(['qa/questions?sp_type='+sp_type, { throwHttpErrors: true }]);
  //if(data && data.length) console.log(data[0].q_title);
  if(error) console.log("error: ",error);

  console.log(sp_type);

  const sports = [
    { value: "0", label: "顯示全部問題" },
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
        <Container p="lg">
          <Select
            label="運動類別篩選"
            data={sports}
            defaultValue={sports[0].label}
            pb='xl'
            value={sp_type}
            onChange={(value:string)=>(setSp_type(value))}
            allowDeselect={false}
          />
          { error &&
            <Alert variant="light" color="red" my="md">
              暫時無法取得資料
            </Alert>
          }
          {data &&
            data.map((question:q)=>
            <Link href={"forums/questions/"+question.q_id} key={question.q_id}>
              <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm'>
                <Group justify='space-between'>
                  <Group>
                    <IconUser />
                    <Text fw={500}>User{question.user_id}</Text>
                  </Group>
                </Group>
                <Text size="lg" m='md' fw='600'>Q: {question.q_title}</Text>
                <Text ml="xl" mr='lg' size='md' fw={500} lineClamp={3}>{question.q_content}</Text>
                <Link href={"forums/questions/"+question.q_id}>
                  <Flex mt='md' justify='right'>
                    <Text fw={600} size='md'>查看詳細內容</Text>
                    <IconChevronRight/>
                  </Flex>
                </Link>
              </Card>
            </Link>
          )}
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

function PostQuestion({setDisplayState, refreshQuestion}:any){
  let {trigger, error, loading} = useAsyncFunction(addQuestion);
  const [sp_type, set_sp_type] = useState<string>('0');
  const [q_title, set_q_title]=useState("");
  const [q_content, set_q_content]=useState("");

  function validateLength(): boolean
  {
    return q_content.length >= 10;
  }

  async function ifSuccess(sp_type: string, q_title: string, q_content: string) {
    if(!validateLength())
    {
      console.log("error: too short")
      notifications.show({
        color: "red",
        title: '內容至少要有10個字喔～',
        message: '再新增一些內容，讓他人更好理解你的問題吧！',
      })
      return;
    }
    if(loading) return;
    let {error} = await trigger(parseInt(sp_type), q_title, q_content);
    if(error) return console.error(error);
    notifications.show({
      color: "green",
      title: '新增問題成功～',
      message: '隨時關注，已獲得更多資訊！',
    })
    refreshQuestion()
    setDisplayState(0)

  }

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

  return(
    <>
      <main>
        <Box m = "xl" component="form">
          <Select
            label="類別 :"
            data={sports}
            defaultValue={""}
            placeholder="請挑選問題類別"
            size={'md'}
            required
            mt="md"
            value = {sp_type}
            onChange={(value:string)=>(set_sp_type(value))}
          />
          <Textarea
            label="標題 :"
            placeholder="請輸入問題標題"
            autosize size={'md'}
            mt="md"
            withAsterisk
            required value = {q_title}
            onChange={(event)=>(set_q_title(event.currentTarget.value))}
          />
          <Textarea
            label="內容（至少10字）:"
            placeholder="請輸入問題內容"
            minRows={6} autosize size={'md'}
            mt="md"
            withAsterisk
            required value = {q_content}
            onChange={(event)=>(set_q_content(event.currentTarget.value))}
          />
          <Group justify="space-evenly" mt="md">
            <Button
              onClick={()=>(setDisplayState(0))}
              leftSection={<IconChevronLeft />}
              w={"45%"}
            >
              取消
            </Button>
            <Button
              onClick={()=>ifSuccess(sp_type, q_title, q_content)}
              variant="gradient"
              gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
              rightSection={<IconCheck />}
              w={"45%"} loading={loading}>
              確定
            </Button>
          </Group>
        </Box>
      </main>
    </>
  );
}

export default function ForumsPage(){
  const [displayState, setDisplayState] = useState(0);
  const title = '運動論壇';
  let {mutate: refreshQuestion}=useSWR(['qa/questions',{ throwHttpErrors: true }])

  let fabContainer = useContext(FABContainerContext);

  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        { displayState === 0 &&
          <>
            <QListPage />
            { fabContainer && createPortal(
              <Button leftSection={<IconEdit size={20} />} mr={'xl'} mb='xl'
                      style={({ "box-shadow": 'silver 2px 2px 20px', })} size={'lg'} radius={'xl'} c={"black"} color={'#F8D6D8'} onClick={() => (setDisplayState(1))}>
              新增問題
            </Button>, fabContainer)}
          </>
        }
        { displayState === 1 &&(
          <PostQuestion setDisplayState={setDisplayState} refreshQuestion={refreshQuestion}/>
        )}
      </main>
    </>
  );
}
