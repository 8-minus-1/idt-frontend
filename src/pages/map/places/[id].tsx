import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '@mantine/dates/styles.css';
import useSWR from 'swr';
import { addRank } from '@/apis/rank';
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
  IconPencil
} from '@tabler/icons-react';
import { IconExternalLink } from '@tabler/icons-react';
import { Alert } from '@mantine/core';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { deletePosition } from '@/apis/map';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { HTTPError } from 'ky';

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

export default function PlaceInfoPage() {
  const { query } = useRouter();
  const [StarValue, setValue] = useState(0);
  const [Comment, setComment] = useState('');
  const [RankState,setRankState] = useState(0);
  const [Ranked, set_Ranked] = useState(0);
  const id = query.id;
  let { data, error:infoError } = useSWR(['map/getInfo?id='+id, { throwHttpErrors: true }]);
  let fabContainer = useContext(FABContainerContext);
  let { data:RankInfo, error:rankError, mutate: refresh } = useSWR(['map/RankByUser?id='+id, { throwHttpErrors: true }]);
  let { data:allRank, error:allRankError, mutate: refreshRank } = useSWR(['map/RankByPlace?id='+id, { throwHttpErrors: true }]);

  useNavbarTitle('場館資訊');
  const { user, mutate: refreshUser } = useUser();
  let { trigger, error, loading } = useAsyncFunction(addRank);
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
    set_Ranked(1);
  }

  return (
    <>
      <Head>
        <title>場館資訊</title>
      </Head>
      <main>
        {data &&
          < Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='md' shadow='sm'>
            <Group justify='space-between'>
              <Group>
                <IconHome />
                <Text fw={700}>場地名稱 : {data.Name}</Text>
              </Group>
            </Group>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconMap />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>地址：{data.City}{data.Town}{data.address}</Text>
            </Flex>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconClock />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>營業時間：{data.OpenTime} ~ {data.CloseTime}</Text>
            </Flex>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconReportMoney />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>價格：{data.Price}</Text>
            </Flex>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconMap2 />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>停車資訊：{data.Parking}</Text>
            </Flex>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconFileDescription />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>官方網址：<Link href={data.Url}>{data.Url}</Link></Text>
            </Flex>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconPhone />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>聯絡資訊：{data.Phone}</Text>
            </Flex>
            <Flex ml={'xl'} mt='md' justify={'flex-start'}>
              <IconPencil />
              <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>由User{data.User}在{data.Renew}更新</Text>
            </Flex>
            <Flex c="blue" mt="md" justify="right">
              <Text fw={600} size="md">
                <Link href={`/events/place/`+data.ID}>查看場館活動</Link>
              </Text>
              <IconChevronRight />
            </Flex>
          </Card>
        }
        {rankError instanceof HTTPError && rankError.response.status === 404 && Ranked ===0 &&
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
        {RankInfo && {Ranked} &&
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
                      //onClick={()=>handleDelete(RankInfo.a_id)}
                    >
                      編輯此評論
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                      color="red"
                      //onClick={()=>handleDelete(RankInfo.a_id)}
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
      </main>
    </>
  );
}
