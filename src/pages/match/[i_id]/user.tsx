import { useRouter } from 'next/router';
import useSWR from 'swr';
import { HTTPError } from 'ky';
import { Alert, Avatar, Card, Container, Flex, Paper, rem, Text } from '@mantine/core';
import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';
import {
  IconCake,
  IconClock,
  IconFriends,
  IconKarate,
  IconMapPinStar,
  IconPingPong,
  IconX,
} from '@tabler/icons-react';
import {
  Badminton,
  BaseballBat,
  Basketball,
  Bowling,
  Football,
  PlayBasketball,
  Rollerskates,
  Soccer,
  Softball,
  SwimmingPool,
  Tennis,
  Volleyball,
} from '@icon-park/react';

export default function UserPage()
{
  const router = useRouter();

  let i_id = router.query.i_id;

  let {data: user_detail, error} = useSWR(['invite/'+i_id+'/user', {throwHTTPErrors: true}]);

  let title = '發起者基本資訊';

  useNavbarTitle(title);

  const icons = [
    <></>,
    <Basketball theme="outline" size="24" fill="#333" key={1}/>,
    <Volleyball theme="outline" size="24" fill="#333" key={2}/>,
    <Badminton theme="outline" size="24" fill="#333" key={3}/>,
    <Tennis theme="outline" size="24" fill="#333" key={4}/>,
    <SwimmingPool theme="outline" size="24" fill="#333" key={5}/>,
    <Rollerskates theme="outline" size="24" fill="#333" key={6}/>,
    <Football theme="outline" size="24" fill="#333" key={7}/>,
    <IconPingPong key={8}/>,
    <BaseballBat theme="outline" size="24" fill="#333" key={9}/>,
    <Softball theme="outline" size="24" fill="#333" key={10} />,
    <PlayBasketball theme="outline" size="24" fill="#333" key={11}/>,
    <IconKarate key={12}/>,
    <Soccer theme="outline" size="24" fill="#333" key={13}/>,
    <Bowling theme="outline" size="24" fill="#333" key={14}/>
  ]

  return (
    <>
    <Head>
      <title>{title}</title>
    </Head>
     <main>
       <Container m={'md'}>
       { !!user_detail &&
          <>
            <Card padding="xl" bg="#FDEBD0" radius="lg" mb='md' shadow='sm'>
              <Flex gap={'lg'}>
                <Avatar size={'lg'} color={'gray'}></Avatar>
                <Flex direction={'column'} justify={'center'}>
                  <Text fw={700} size={'xl'}>{user_detail.nickname} 的個人檔案</Text>
                  <Text fw={500} size={'md'}>於 {new Date(user_detail.created_at).toLocaleDateString()} 加入我們！</Text>
                </Flex>
              </Flex>
              <Flex mt={'xl'} ml={'md'}>
                <IconCake />
                <Text fw={700} ml={'xs'} pt={rem(2)}>出生日期：{new Date(user_detail.birthday).toLocaleDateString()}</Text>
              </Flex>
              <Flex mt={'sm'} ml={'md'}>
                <IconFriends />
                <Text fw={700} ml={'xs'} pt={rem(2)}>生理性別：{user_detail.gender}</Text>
              </Flex>
              <Flex mt={'sm'} ml={'md'} >
                <IconMapPinStar />
                <Text  fw={700} ml={'xs'} pt={rem(2)}>生活地區：
                { user_detail.cities.map( (item: any, index: number) => (
                  <span key={index}>{index !== 0 && '、'}{item.c_name + item.d_name}</span>
                ))}
                </Text>
              </Flex>
            </Card>
            <Paper p={'lg'}>
              <Text fw={700} mb={'xs'}>有興趣的運動：</Text>
              { user_detail.interests.map( (item:any, index: number) => (
                  <Flex mt={'xs'} ml={'xs'} key={index}>
                    {icons[item.sp_type]}
                    <Text fw={700} ml={'xs'} pt={rem(2)}>{item.sp_name + "（自評：" +item.level+"）"}</Text>
                  </Flex>
              ))}
            </Paper>
            <Paper p={'lg'} mt={'md'}>
              <Text fw={700} mb={'xs'}>習慣的運動時段：</Text>
              { user_detail.habit.map( (item:string, index: number) => (
                <Flex mt={'xs'} ml={'xs'} key={index}>
                  <IconClock />
                  <Text fw={700} ml={'xs'} pt={rem(2)}>{item}</Text>
                </Flex>
              ))}
            </Paper>
            <Paper p={'lg'} mt={'md'}>
              <Text fw={700} mb={'xs'}>平台配對戰績：</Text>
                <Flex mt={'xs'} ml={'xs'}>
                  <IconX />
                  <Text fw={700} ml={'xs'} pt={rem(2)}>目前沒有資料</Text>
                </Flex>
            </Paper>
          </>
       }
       { error instanceof HTTPError && error.response.status === 404 &&
         <Alert variant="light" color="red" my="md">
           錯誤：PAGE NOT FOUND
         </Alert>
       }
       { error instanceof HTTPError && error.response.status === 403 &&
         <Alert variant="light" color="red" my="md">
            錯誤：沒有權限瀏覽此資料（邀約可能已經過期）
         </Alert>
       }
       { error && ( !(error instanceof HTTPError) || (error instanceof HTTPError && error.response.status !== 404) ) &&
         <Alert variant="light" color="red" my="md">
           暫時無法取得資料
         </Alert>
       }
       </Container>
     </main>
    </>
  )
}
