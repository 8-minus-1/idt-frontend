import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '@mantine/dates/styles.css';
import useSWR from 'swr';
import { addRank, deleteRank, editRank } from '@/apis/rank';
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Menu,
  Paper,
  Rating,
  rem,
  Text,
  Textarea,
} from '@mantine/core';
import Link from 'next/link';
import {
  IconCaretDown,
  IconCheck,
  IconChevronLeft,
  IconClock,
  IconDots,
  IconEdit,
  IconFileDescription,
  IconHeartHandshake,
  IconKarate,
  IconMap,
  IconMap2,
  IconPencil,
  IconPhone,
  IconPingPong,
  IconReportMoney,
  IconRun,
  IconSend,
  IconTrash,
  IconTrophy,
  IconUser,
} from '@tabler/icons-react';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import React, { Fragment, useContext, useState } from 'react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { HTTPError } from 'ky';
import { useForm } from '@mantine/form';
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
  //console.log(id)
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

  let getOpen = 0;
  let Now = new Date().getDay();
  let NowTime = new Date(new Date(Date.now()).toString());
  if(OpenTime)
  {
    let open_str = OpenTime[(Now*2-1)+''].split(':');
    let close_str = OpenTime[(Now*2)+''].split(':');
    let open = new Date();
    let close=new Date();
    open.setHours(parseInt(open_str[0]), parseInt(open_str[1]),parseInt(open_str[2]));
    close.setHours(parseInt(close_str[0]), parseInt(close_str[1]),parseInt(close_str[2]));

    console.log(open);
    console.log(close);
    if(open > NowTime || close < NowTime)
      getOpen = 0;//close
    else if(open < NowTime && close > NowTime)
      getOpen = 1;//open
    console.log(getOpen);
  }

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
              <Flex ml={'md'} mt='md' justify={'flex-start'} onClick={()=>setTime(getTimeNum)}>
                <IconClock />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700} >
                  營業時間：今天 {(OpenTime[(Now*2-1)+'']).split(':')[0]+':'+(OpenTime[(Now*2-1)+'']).split(':')[1]} ~ {(OpenTime[(Now*2)+'']).split(':')[0] + ':' + (OpenTime[(Now*2)+'']).split(':')[1] }
                  {getOpen === 0 &&
                    <>（已打烊）</>
                  }
                  {getOpen === 1 &&
                    <>（營業中）</>
                  }
                </Text>
                <IconCaretDown/>
              </Flex>
              {TimeStatus === 1 &&
                <>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700} >
                      星期一 {(OpenTime["1"]).split(':')[0]+':'+(OpenTime["1"]).split(':')[1]} ~ {(OpenTime["2"]).split(':')[0] + ':' + (OpenTime["2"]).split(':')[1] }
                    </Text>
                  </Flex>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期二 {(OpenTime["3"]).split(':')[0]+':'+(OpenTime["3"]).split(':')[1]} ~ {(OpenTime["4"]).split(':')[0] + ':' + (OpenTime["4"]).split(':')[1] }
                    </Text>
                  </Flex>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期三 {(OpenTime["5"]).split(':')[0]+':'+(OpenTime["5"]).split(':')[1]} ~ {(OpenTime["6"]).split(':')[0] + ':' + (OpenTime["6"]).split(':')[1] }
                    </Text>
                  </Flex>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期四 {(OpenTime["7"]).split(':')[0]+':'+(OpenTime["7"]).split(':')[1]} ~ {(OpenTime["8"]).split(':')[0] + ':' + (OpenTime["8"]).split(':')[1] }
                    </Text>
                  </Flex>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期五 {(OpenTime["9"]).split(':')[0]+':'+(OpenTime["9"]).split(':')[1]} ~ {(OpenTime["10"]).split(':')[0] + ':' + (OpenTime["10"]).split(':')[1] }
                    </Text>
                  </Flex>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期六 {(OpenTime["11"]).split(':')[0]+':'+(OpenTime["11"]).split(':')[1]} ~ {(OpenTime["12"]).split(':')[0] + ':' + (OpenTime["12"]).split(':')[1] }
                    </Text>
                  </Flex>
                  <Flex mt={rem(6)}>
                    <Text ml={'sm'} pl={'xl'} size='md' fw={700}>
                      星期日 {(OpenTime["13"]).split(':')[0]+':'+(OpenTime["13"]).split(':')[1]} ~ {(OpenTime["14"]).split(':')[0] + ':' + (OpenTime["14"]).split(':')[1] }
                    </Text>
                  </Flex>
                </>
              }
              <Flex ml={'md'} mt='md' justify={'flex-start'}>
                <IconRun />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>提供運動：</Text>
                {data.sports.map( (item:any, index: number) => (
                  <Flex ml={'xs'} key={index}>
                    { index !== 0 && '、'}
                    {icons[item.sp_type]}
                    <Text fw={700} ml={'xs'} pt={rem(2)} size={'md'}>{item.sp_name}</Text>
                  </Flex>
                ))}
              </Flex>
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
