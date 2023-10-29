import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '@mantine/dates/styles.css';
import useSWR from 'swr';
import { addRank, deleteRank, editRank } from '@/apis/rank';
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
  Button,
  Textarea,
  Rating,
  Center,
  Space, Paper,
} from '@mantine/core';
import Link from 'next/link';
import {
  IconDots,
  IconUser,
  IconPlus,
  IconBallBasketball,
  IconChevronRight,
  IconCalendarOff,
  IconCalendarCheck,
  IconCalendarX,
  IconCheck,
  IconMap2,
  IconEdit,
  IconTrash,
  IconScoreboard,
  IconFileDescription,
  IconBulb,
  IconMap,
  IconHome,
  IconCalendar,
  IconReportMoney,
  IconPhone,
  IconClock,
  IconPencil,
  IconChevronLeft,
  IconSend,
  IconFriends,
  IconHeartHandshake,
  IconRun,
  IconCup,
  IconTrophy,
  IconChevronDown,
} from '@tabler/icons-react';
import { IconExternalLink } from '@tabler/icons-react';
import { Alert } from '@mantine/core';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import React, { Fragment, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { deletePosition } from '@/apis/map';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { HTTPError } from 'ky';
import { useForm } from '@mantine/form';

type r = {
  Rank:number,
  Comment:string,
  User:number
}
function ShowAllRank({allRank,refreshAllRank}:any){
  let {user} = useUser();
  let count =1;
  return(
    <>
      { !allRank &&
        <Text size="md" my="xl" ta="center" fw={600}>
          目前沒有人評論喔～當第一個熱心ㄉ人吧！
        </Text>
      }
      {!!allRank && !((allRank.length === 1) && (allRank[0].User  === user?.id)) &&
        <Text size="md" mt="xl" mb='md' fw={600}>
          所有評論：
        </Text>
      }
      {!!allRank &&
        allRank.map( (rank:r)=>(!(rank.User  === user?.id) &&
            <Paper withBorder p={'lg'} key={count++}>
              <Group justify='space-between'>
                <Group>
                  <IconUser />
                  <Text fw={500}>User{rank.User}</Text>
                </Group>

              </Group>
              <Rating value={rank.Rank} fractions={10} readOnly />
              <Text ml={'xl'} mt={'lg'} style={{whiteSpace: 'pre-wrap'}}>{rank.Comment}</Text>
            </Paper>
          )
        )
      }</>
  );
}

function Edit({data,set_edit,refresh,id}:any){
  const form = useForm({
     initialValues: {
       Rank : data.Rank,
       Comment : data.Comment
     },
  });
  let { trigger, error, loading } = useAsyncFunction(editRank);
  async function handleEdit(values:any)
  {
    console.log(values.Comment)
    console.log(values.Rank)
    if (values.Comment == '') {
      console.log("error: 評論不可為空！")
      notifications.show({
        color: "red",
        title: '尚未評論！',
        message: '評論不可為空！',
      })
      return;
    }
    if(loading) return;
    let { error } = await trigger(parseInt(id as string), parseInt(values.Rank as string), values.Comment);
    if (error) return console.error(error);
    notifications.show({
      color: "green",
      title: '已成功修改您的評論～',
      message: '期待您隨時來評論！',
    });
    refresh()
    set_edit(0)
  }

  return (
    <>
      <main>
        {data &&
        <form onSubmit={form.onSubmit((values) => handleEdit(values))}>
        <Flex justify={'center'}>
          <Rating size={"xl"} {...form.getInputProps('Rank')} />
        </Flex>
        <Textarea
          minRows={6} radius={"lg"} mt={"sm"} autosize size={'md'}  required {...form.getInputProps('Comment') }
        ></Textarea>
        <Group justify={"space-evenly"} my={'lg'}>
          <Button
            onClick={()=>set_edit(0)}
            leftSection={<IconChevronLeft />}
            w={"45%"}
          >
            取消
          </Button>
          <Button
            type={'submit'}
            variant="gradient"
            gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
            rightSection={<IconSend />}
            w={"45%"} /*loading={loading}*/
          >
            送出
          </Button>
        </Group>
        </form>}
      </main>
    </>
  )
}

export default function PlaceInfoPage() {
  const { query } = useRouter();
  const [StarValue, setValue] = useState(0);
  const [Comment, setComment] = useState('');
  const [RankState,setRankState] = useState(0);
  const [EditStatus, set_edit] = useState(0);
  const [TimeStatus, setTime] = useState(0);
  const id = query.id;
  console.log(id)
  let { data, error:infoError } = useSWR(['map/getInfo?id='+id, { throwHttpErrors: true }]);
  let fabContainer = useContext(FABContainerContext);
  let { data:RankInfo, error:rankError, mutate: refresh } = useSWR(['map/RankByUser?id='+id, { throwHttpErrors: true }]);

  let { data:allRank, error:allRankError, mutate: refreshRank } = useSWR(['map/RankByPlace?id='+id, { throwHttpErrors: true }]);

  let{ data:OpenTime, error:OpenTimeError} = useSWR(['map/getInfo/OpenTime?id='+id, { throwHttpErrors: true }]);
  //if(RankInfo)set_Ranked(1);
  useNavbarTitle('場館資訊');
  const { user, mutate: refreshUser } = useUser();
  let { trigger, error, loading } = useAsyncFunction(addRank);
  let { trigger:Dtrigger, error:Derror, loading:Dloading } = useAsyncFunction(deleteRank);


  async function handlePostRank() {
    if (StarValue == 0) {
      console.log("error: 沒有填些星級")
      notifications.show({
        color: "red",
        title: '未選擇星級！',
        message: '評價不可為0喔！',
      })
      return;
    }
    if (Comment == '') {
      console.log("error: 評論不可為空！")
      notifications.show({
        color: "red",
        title: '尚未評論！',
        message: '評論不可為空！',
      })
      return;
    }
    if (loading) return;
    let { error } = await trigger(parseInt(id as string), StarValue, Comment);
    if (error) return console.error(error);
    notifications.show({
      color: "green",
      title: '新增Rank成功～',
      message: '隨時關注，以獲得最新資訊！',
    })
    refresh()
    refreshRank()
  }

  async function handleDelete(r_id:number)
  {
    if(Dloading) return;
    modals.openConfirmModal({
      title: '您確定要刪除這個評論嗎？',
      centered: true,
      children: (
        <Text size="sm">
          請注意，以上動作沒有辦法復原
        </Text>
      ),
      labels: { confirm: '是的，我非常確定', cancel: "不，請返回" },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await Dtrigger(r_id);
        notifications.show({
          color: "green",
          title: '已成功刪除您的評論～',
          message: '期待您隨時來評論！',
        });
        refresh(null)
      },
    });
  }

  let getTimeNum = 0;
  if (TimeStatus == 0)
    getTimeNum = 1;
  else if (TimeStatus == 1)
    getTimeNum = 0;

  return (
    <>
      <Head>
        <title>場館資訊</title>
      </Head>
      <main>
        <Container p='lg'>
          {data && OpenTime &&
            < Card padding="md" bg="#D6EAF8" radius="lg" mb='md' shadow='sm'>
              <Text size="xl" ml={'sm'} mt='sm' fw='700'>
                {data.Name}
              </Text>
              <Flex ml={'md'} mt='md' justify={'flex-start'}>
                <IconMap />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>地址：{data.Address}</Text>
              </Flex>
              <Flex ml={'md'} mt='md' justify={'flex-start'}>
                <IconClock />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
                  營業時間：
                </Text>
              </Flex>
              <Flex mt={'xs'} onClick={()=>setTime(getTimeNum)}>
                <Text ml={'sm'} pl={'xl'} size='md' fw={700} >
                  星期一 {(OpenTime.Mon_OpenTime).split(':')[0]+':'+(OpenTime.Mon_OpenTime).split(':')[1]} ~ {(OpenTime.Mon_CloseTime).split(':')[0] + ':' + (OpenTime.Mon_CloseTime).split(':')[1] }
                </Text>
                <IconChevronDown/>
              </Flex>
              {TimeStatus === 1 &&
                <>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期二 {(OpenTime.Tue_OpenTime).split(':')[0]+':'+(OpenTime.Tue_OpenTime).split(':')[1]} ~ {(OpenTime.Tue_CloseTime).split(':')[0] + ':' + (OpenTime.Tue_CloseTime).split(':')[1] }
                    </Text>
                  </Flex>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期三 {(OpenTime.Wed_OpenTime).split(':')[0]+':'+(OpenTime.Wed_OpenTime).split(':')[1]} ~ {(OpenTime.Wed_CloseTime).split(':')[0] + ':' + (OpenTime.Wed_CloseTime).split(':')[1] }
                    </Text>
                  </Flex>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期四 {(OpenTime.Thu_OpenTime).split(':')[0]+':'+(OpenTime.Thu_OpenTime).split(':')[1]} ~ {(OpenTime.Thu_CloseTime).split(':')[0] + ':' + (OpenTime.Thu_CloseTime).split(':')[1] }
                    </Text>
                  </Flex>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期五 {(OpenTime.Fri_OpenTime).split(':')[0]+':'+(OpenTime.Fri_OpenTime).split(':')[1]} ~ {(OpenTime.Fri_CloseTime).split(':')[0] + ':' + (OpenTime.Fri_CloseTime).split(':')[1] }
                    </Text>
                  </Flex>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期六 {(OpenTime.Sat_OpenTime).split(':')[0]+':'+(OpenTime.Sat_OpenTime).split(':')[1]} ~ {(OpenTime.Sat_CloseTime).split(':')[0] + ':' + (OpenTime.Sat_CloseTime).split(':')[1] }
                    </Text>
                  </Flex>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期日 {(OpenTime.Sun_OpenTime).split(':')[0]+':'+(OpenTime.Sun_OpenTime).split(':')[1]} ~ {(OpenTime.Sun_CloseTime).split(':')[0] + ':' + (OpenTime.Sun_CloseTime).split(':')[1] }
                    </Text>
                  </Flex>
                </>
              }
              <Flex ml={'md'} mt='md' justify={'flex-start'}>
                <IconReportMoney />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>價格：{data.Price}</Text>
              </Flex>
              <Flex ml={'md'} mt='md' justify={'flex-start'}>
                <IconMap2 />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>停車資訊：{data.Parking}</Text>
              </Flex>
              <Flex ml={'md'} mt='md' justify={'flex-start'}>
                <IconFileDescription />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
                  官方網址：
                </Text>
              </Flex>
              <Text mt={'xs'} mr={'xl'} ml={'sm'} pl={'xl'} size='sm' fw={700} style={{wordBreak: 'break-all'}}>
                <Link target={'_blank'} href={data.Url}>{data.Url}</Link>
              </Text>
              <Flex ml={'md'} mt='md' justify={'flex-start'}>
                <IconPhone />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>聯絡資訊：{data.Phone}</Text>
              </Flex>
              <Flex ml={'md'} mt='md' justify={'flex-start'}>
                <IconPencil />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>由User{data.User}在{data.Renew}更新</Text>
              </Flex>
              <Flex mt={'lg'} mb={'sm'} justify={'center'}>
                <Group justify={'space-evenly'}>
                  <Link href={`/match/place/`+data.ID} >
                    <Button
                      variant="gradient" w={'100%'}
                      gradient={{ from: 'blue.3', to: 'blue.6', deg: 90 }}
                      leftSection={<IconHeartHandshake/>}
                    >
                      場館公開邀請
                    </Button>
                  </Link>
                  <Link href={`/events/place/`+data.ID}>
                    <Button
                      variant="gradient" w={'100%'}
                      gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
                      leftSection={<IconTrophy />}
                    >
                      場館活動列表
                    </Button>
                  </Link>
                </Group>
              </Flex>
            </Card>
          }
          {rankError instanceof HTTPError && rankError.response.status === 404 && !RankInfo &&
            <>
              <Flex justify={'center'}>
                <Rating size={"xl"} value={StarValue} onChange={setValue} />
              </Flex>
              <Textarea
              minRows={6} radius={"lg"} mt={"sm"} autosize size={'md'} placeholder="新增相關評論吧！" required onChange={(event) => (setComment(event.currentTarget.value))}
              ></Textarea>
              <Button variant="gradient" gradient={{ from: 'yellow', to: 'orange', deg: 90 }} rightSection={<IconCheck />} mt="md" fullWidth onClick={()=>handlePostRank()}>送出評論</Button>
            </>
          }
          {RankInfo && EditStatus === 0 &&
            <>
              <Text size="md" mt="xl" mb='md' fw={600}>
                你的評論：
              </Text>
              <Paper withBorder p={'lg'} key={RankInfo[0].ID} >
                <Group justify='space-between'>
                  <Group>
                    <IconUser />
                    <Text fw={500}>User{RankInfo[0].User}</Text>
                  </Group>

                  <Menu withinPortal position="bottom-end" shadow="sm">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDots style={{ width: rem(16), height: rem(16) }} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                        color="black"
                        onClick={()=>set_edit(1)}
                      >
                        編輯此評論
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                        color="red"
                        onClick={()=>handleDelete(RankInfo[0].ID)}
                      >
                        刪除此評論
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
                <Rating value={RankInfo[0].Rank} fractions={10} readOnly />
                <Text ml={'xl'} mt={'md'} style={{whiteSpace: 'pre-wrap'}}>{RankInfo[0].Comment}</Text>
              </Paper>
            </>
          }{EditStatus == 1 &&
            <Edit data={RankInfo[0]} set_edit={set_edit} refresh={refresh} id={id}></Edit>
          }
          <ShowAllRank allRank={allRank} refreshAllRank={refreshRank}></ShowAllRank>
          {infoError instanceof HTTPError && infoError.response.status === 404 &&
            <Alert variant="light" color="red" my="md">
              錯誤：PAGE NOT FOUND
            </Alert>
          }
          {infoError && (!(error instanceof HTTPError) || (infoError instanceof HTTPError && infoError.response.status !== 404)) &&
            <Alert variant="light" color="red" my="md">
              暫時無法取得資料
            </Alert>
          }
        </Container>
      </main>
    </>
  );
}
