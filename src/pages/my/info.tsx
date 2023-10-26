import { useState } from 'react';
import { useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import React from 'react';
import { Alert, Box, Button, Checkbox, Container, Flex, rem, Space, Text } from '@mantine/core';
import Link from 'next/link';
import { IconArrowRight, IconForms } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

function SurveyPage()
{
  const [qnum, setQnum] = useState(0);
  const [privacyCheck, setPrivacyCheck] = useState(false);

  function handleNextQ()
  {
    switch (qnum)
    {
      case 0:
        if(privacyCheck)
        {
          setQnum(qnum+1);
        }
        else
        {
          notifications.show({
            color: "red",
            title: '請詳閱隱私群政策！',
            message: '閱讀完記得勾選方框表示同意喔～'
          })
        }
    }
  }

  return (
    <Container m={'lg'}>
      { qnum === 0 &&
        <><Alert variant="light" color="yellow" my="md">
          您還沒有填過問卷～
        </Alert>
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          height: '65vh',
        }}>
          <Text size={'xl'} fw={'1000'}>使用者個人資料設定及註冊問卷</Text>
          <Space h={'lg'}></Space>
          <Text fw={700}>此問卷資料攸關本平台後續各項功能運行之準確性</Text>
          <Text fw={700}>也會用於數據分析、改善平台功能等目的</Text>
          <Text fw={700}>請您如實填寫，謝謝！</Text>
          <Space h={'xl'}></Space>
          <Checkbox
            checked={privacyCheck} onChange={(event)=>setPrivacyCheck(event.currentTarget.checked)}
            label={<Text size={'sm'}>我們注重您的隱私，請先詳閱我們的 <Link style={{textDecoration: 'underline'}} href={'/privacy'}>隱私權政策</Link></Text>}
          ></Checkbox>
          <Button
            onClick={()=>{handleNextQ()}}
            variant={'gradient'} leftSection={<IconForms />}
            gradient={{ from: 'blue.3', to: 'blue.6', deg: 90 }}
            w={'70%'} mt={'xl'} rightSection={<IconArrowRight />}
          >
            我已知悉以上資訊，前往填寫
          </Button>
        </Box></>
      }
      { qnum === 1 &&
        <>1</>
      }
    </Container>
  );
}

function ProfilePage()
{
  return (
    <></>
  );
}

export default function InfoPage()
{
  const { user, mutate: refreshUser } = useUser();

  let title = "使用者的個人資料";
  if(!user?.profileCompleted)
    title = "註冊問卷";

  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        { !user &&
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70vh',
          }}>
            {(
              <>
                <Alert
                  color="blue" fw={500}>
                  看起來您還沒登入喔！前往
                  <Link href = '/signin'> 註冊/登入</Link>
                </Alert>
              </>
            )}
          </Box>
        }
        { !!user &&
          <>
            { !!user.profileCompleted &&
              <ProfilePage></ProfilePage>
            }
            { !user.profileCompleted &&
              <SurveyPage></SurveyPage>
            }
          </>
        }
      </main>
    </>
  );
}
