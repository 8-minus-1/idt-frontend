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
import { IconDots, IconUser, IconTrash, IconChevronLeft, IconSend } from '@tabler/icons-react';
import useSWR from 'swr';
import { Alert } from '@mantine/core';
import { useRouter } from 'next/router';
import { HTTPError } from 'ky';
import { addAnswer } from '@/apis/qa';
import { notifications } from '@mantine/notifications';

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

type questionCardProps = {
  question: q
}

function ShowAnswers({answers}:any)
{
  return(
    <>
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
            <Text ml={'xl'} mt={'lg'} style={{whiteSpace: 'pre-wrap'}}>{answer.a_content}</Text>
          </Paper>
        )
      }
    </>
  )
}

function AddAnswerPage({setPageStatus, q_id ,refreshAnswer}:any)
{
  const [a_content, set_a_content] = useState("");
  let {trigger, error, loading} = useAsyncFunction(addAnswer);

  function validateLength(): boolean
  {
    return a_content.length >= 10;
  }

  async function handleSendAnswer(q_id:number, a_content: string)
  {
    if(!validateLength())
    {
      console.log("error: too short")
      notifications.show({
        color: "red",
        title: '至少要有10個字喔～',
        message: '再新增一些內容，讓你的回答更豐富！',
      })
      return;
    }
    if(loading) return;
    let {error} = await trigger(q_id, a_content);
    if(error) return console.error(error);
    notifications.show({
      color: "green",
      title: '你成功回答了這個問題～',
      message: '謝謝您在社群做出貢獻！',
    })
    refreshAnswer()
    setPageStatus(0);
  }

  return(
    <>
      <Textarea
        minRows={6} radius={"lg"} mt={"xl"} mb={"sm"} autosize size={'lg'}
        label={"輸入您的回答（至少10字）："} required value={a_content} onChange={(event)=>(set_a_content(event.currentTarget.value))}
      ></Textarea>

      <Group justify={"space-evenly"}>
        <Button
          　onClick={()=>(setPageStatus(0))}
            leftSection={<IconChevronLeft />}
            w={"45%"}
        >
          取消
        </Button>
        <Button
          onClick={()=>handleSendAnswer(q_id, a_content)}
          variant="gradient"
          gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
          rightSection={<IconSend />}
          w={"45%"} loading={loading}
        >
          送出
        </Button>
      </Group>
    </>
  )
}

function QuestionCard({question}: questionCardProps)
{
  return(
    <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xs' shadow='sm'>
      <Group justify='space-between'>
        <Group>
          <IconUser />
          <Text fw={500}>User{question.user_id}</Text>
        </Group>
      </Group>
      <Text size="lg" m='md' fw='600'>Q: {question.q_title}</Text>
      <Text ml="xl" mr='lg' size='md' fw={500} style={{whiteSpace: 'pre-wrap'}}>{question.q_content}</Text>
      <Link href={"forums/questions/"+question.q_id}>
      </Link>
    </Card>
  )
}

export default function QuestionPage(){
  const router = useRouter();
  const q_id = router.query.q_id;
  const { user, mutate: refreshUser } = useUser();

  // 0: display, 1: new, 2: edit
  const [pageStatus, setPageStatus] = useState(0);

  let { data, error, mutate: refreshAnswer } = useSWR(['qa/questions/'+q_id+'/answers', { throwHttpErrors: true }]);

  if(error instanceof HTTPError && error.response.status === 404)
  {
    router.replace('/error');
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
          { error &&
            <Alert variant="light" color="red" my="md">
              暫時無法取得資料
            </Alert>
          }
          { !error &&
            <>
              <QuestionCard question={question}></QuestionCard>
              { pageStatus === 0 &&
                <>
                  { !! user &&
                    <Button
                      variant="gradient"
                      gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
                      fullWidth radius={'md'} onClick={()=>(setPageStatus(1))}
                    >
                      新增回答
                    </Button>
                  }
                  { !user &&
                    <Text size="md" my="xl" ta="center" fw={600}>
                      登入後即可回答！前往<Link style={{marginLeft: rem(5), textDecoration: "underline"}} href={"/signin"}>註冊/登入</Link>
                    </Text>
                  }
                  <ShowAnswers answers={answers}></ShowAnswers>
                </>
              }
              {
                pageStatus === 1 &&
                <>
                  <AddAnswerPage setPageStatus={setPageStatus} q_id={q_id} refreshAnswer={refreshAnswer}></AddAnswerPage>
                </>
              }
            </>
          }
        </Container>
      </main>
    </>
  );
}
