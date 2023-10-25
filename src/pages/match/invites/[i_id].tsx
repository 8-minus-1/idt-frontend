import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { HTTPError } from 'ky';
import {
  Card,
  Container,
  Group,
  Text,
  Alert,
  Flex,
  rem,
  Menu,
  ActionIcon,
  Button,
  Box, Select, Textarea, Paper,
} from '@mantine/core';
import {
  IconBulb,
  IconCalendarCheck, IconCheck, IconChevronLeft,
  IconDots, IconEdit,
  IconMap2, IconSend,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { approveSignup, deleteInvite, editInvite, signupPublicInv } from '@/apis/invite';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { DateTimePicker } from '@mantine/dates';
import '@mantine/dates/styles.css';

type m = {
  "User_id": number,
  "Name": string,
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

//signup
type s =
{
  i_id: number,
  user_id: number,
  timestamp: number,
  approved: boolean,
  s_id: number
}

function InviteCard({invite, setPageStatus}: any)
{
  let {user} = useUser();
  let router = useRouter();

  let {trigger, loading} = useAsyncFunction(deleteInvite);

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

  async function handleDelete(i_id:number)
  {
    if(loading) return;
    modals.openConfirmModal({
      title: '您確定要刪除這則邀約嗎？',
      centered: true,
      children:(
        <Text size="sm">
          請注意，以上動作沒有辦法復原
        </Text>
      ),
      labels: { confirm: '是的，我非常確定', cancel: "不，請返回" },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await trigger(i_id);
        router.replace('/match');
        notifications.show({
          color: "green",
          title: '已成功刪除您的邀約～',
          message: '期待您隨時來新增邀約！',
        })
      },
    });
  }

  let p_id = invite.Place
  let { data: placeInfo, error: placeInfoError } = useSWR(['map/getInfo?id='+p_id, { throwHttpErrors: true }]);

  let place = '';
  if(placeInfo)
  {
    place = placeInfo.Name;
  }

  let {trigger: signup, loading: signupLoading, error } = useAsyncFunction(signupPublicInv);

  let {trigger: approve, loading: approveLoading} = useAsyncFunction(approveSignup);

  let {data: signupStatus, mutate: refreshStatus} = useSWR(['invite/signup/status/'+invite.i_id, { throwHttpErrors: false }])

  let {data: signupList, mutate: refreshList} = useSWR([ (invite.User_id === user?.id)? 'invite/signupList/'+invite.i_id : null, { throwHttpErrors: false }]);
  async function handleSignup()
  {
    if(signupLoading) return;
    else {
      modals.openConfirmModal({
        title: '您確定要報名這則邀約嗎？',
        centered: true,
        children:(
          <Text size="sm">
            請注意，報名後無法收回，必須準時赴約
          </Text>
        ),
        labels: { confirm: '是的，我非常確定', cancel: "不，請返回" },
        confirmProps: { color: 'red' },
        onConfirm: async () => {
          let {error} = await signup(invite.i_id);
          if(error) console.log(error);
          else
          {
            notifications.show({
              color: "green",
              title: '已成功報名這個公開邀請～',
              message: '待對方同意後就算配對成功囉！',
            });
            refreshStatus();
          }
        },
      });
    }
  }

  async function approveSignupHandler(s_id: number)
  {
    if(approveLoading) return;
    let {error} = await approve(s_id);
    if(error) console.log(error)
    else
    {
      notifications.show({
        color: "green",
        title: '已同意此報名請求～',
        message: '雙方配對成功囉！依照時間準時赴約吧～',
      });
      refreshList();
    }
  }

  return(
    <main>
    <Card padding="lg"  pb='xl' bg="#D6EAF8" radius="lg" mb='xs' shadow='sm'>
      <Group justify='space-between'>
        <Group>
          <IconUser/>
          <Text fw={500}>User{invite.User_id}</Text>
        </Group>

        { invite.User_id === user?.id &&
          <Menu withinPortal position="bottom-end" shadow="sm">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots  style={{ width: rem(16), height: rem(16) }} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                color="black"
                onClick={()=>setPageStatus(1)}
              >
                編輯此邀約
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                color="red"
                onClick={()=>handleDelete(invite.i_id)}
              >
                刪除此邀約
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      </Group>
      <Text size="xl" ml={'lg'} mt='lg' fw='700'>{'【 '+ sports[invite.sp_type-1].label+' 】' + invite.Name}</Text>
      <Flex ml={'xl'} mt='md' justify={'flex-start'}>
        <IconCalendarCheck />
        <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
          邀約日期 : {new Date(invite.DateTime).toLocaleDateString()}
        </Text>
      </Flex>
      <Flex ml={'xl'} mt='md' justify={'flex-start'}>
        <IconCalendarCheck />
        <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
          邀約時間 :
          {new Date(invite.DateTime).toLocaleTimeString().split(':')[0] + ':' + new Date(invite.DateTime).toLocaleTimeString().split(':')[1]}
        </Text>
      </Flex>
      <Flex ml={'xl'} mt='md' justify={'flex-start'}>
        <IconMap2/>
        <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
          邀約地點 : {place}
        </Text>
      </Flex>
      <Flex ml={'xl'} mt='md' justify={'flex-start'}>
        <IconBulb />
        <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
          更多資訊（內容） :
        </Text>
      </Flex>
      <Text mt={'sm'} ml={'xl'} pl={'xl'} size='md' fw={700} style={{whiteSpace: 'pre-wrap'}}>
        {invite.Other}
      </Text>
    </Card>
    {!user &&
      <Text size="md" my="xl" ta="center" fw={600}>
        登入後即可報名！前往<Link style={{marginLeft: rem(5), textDecoration: "underline"}} href={"/signin"}>註冊/登入</Link>
      </Text>
    }
    { !!user &&
      <>
        {user.id !== invite.User_id &&
          <>
            <Button mt={'md'}
                    variant="gradient"
                    gradient={{ from: 'blue.3', to: 'blue.6', deg: 90 }}
                    fullWidth radius={'md'}
            >
              查看發起者基本資料
            </Button>
            {!!signupStatus &&
              <Button mt={'xs'} disabled={signupStatus.status}
              variant="gradient" loading={signupLoading}
              gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
              fullWidth radius={'md'} onClick={handleSignup}
              >
            { signupStatus.status &&
              <>您已經報名過了～等待對方同意吧！</>
            }
            { !signupStatus.status &&
              <>送出報名請求</>
            }
              </Button>
            }
          </>
        }
        { user.id === invite.User_id && !!signupList &&
          <>
            { !signupList.length &&
              <Text size="md" my="xl" ta="center" fw={600}>
                目前沒有人報名喔～再等一會兒吧！
              </Text>
            }
            { !!signupList.length &&
              <>
                <Text fw={700} mt={'lg'} mb={'sm'}>報名此邀約的人：</Text>
                { signupList.map( (record:s) =>
                  <Paper withBorder p={'lg'} key={record.s_id} >
                    <Flex justify='space-between'>
                      <Group>
                        <IconUser />
                        <Text fw={500}>User{record.user_id}</Text>
                      </Group>
                      <Text>{new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString()}</Text>
                    </Flex>
                    <Button mt={'lg'}
                            variant="gradient"
                            gradient={{ from: 'blue.3', to: 'blue.6', deg: 90 }}
                            fullWidth radius={'md'}
                    >
                      查看報名者基本資料
                    </Button>
                    { !record.approved &&
                      <Group justify={"space-evenly"} mt={'xs'}>
                        <Button
                          //onClick={()=>(setPageStatus(0))}
                          leftSection={<IconTrash />}
                          w={"48%"} radius={'md'}
                          color={'red.5'}
                        >
                          不同意並刪除
                        </Button>
                        <Button
                          onClick={()=>approveSignupHandler(record.s_id)}
                          color={'green.6'}
                          rightSection={<IconCheck />}
                          w={"48%"} loading={approveLoading} radius={'md'}
                        >
                          同意
                        </Button>
                      </Group>
                    }
                    { !!record.approved &&
                      <Text size="md" mt="md" ta="center" fw={600}>
                        您已同意此請求，記得準時赴約！
                      </Text>
                    }
                  </Paper>
                )
                }
              </>
            }
          </>
        }
      </>
    }
    </main>
  )
}

type searchData = {
  Name: string,
  Address: string,
  ID: number
}
function ModifyInvitePage({invite, i_id, setPageStatus, refreshInvite}: any)
{
  let {user} = useUser();
  let {trigger, error, loading} = useAsyncFunction(editInvite);
  const [sp_type, set_sp_type] = useState<string|null>(invite.sp_type);
  const [Name, set_Name] = useState(invite.Name);
  const [Other, set_Other]=useState(invite.Other);
  const [Datetime, set_Datetime]=useState<Date|null>(new Date(invite.DateTime));

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

  let { data: placeInfo, error:placeInfoError } = useSWR(['map/getInfo?id='+invite.Place, { throwHttpErrors: true }]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [placeValue, setPlaceValue] = useState<string>('')

  let { data:s_data, mutate: updateItems} = useSWR<searchData[]>(['map/search/'+searchInput, { throwHttpErrors: true }]);

  let selectData: any[] = [];
  if(s_data)
  {
    selectData = s_data.map(({ ID, Name }) => ({ value: ID.toString(), label: Name}));
  }

  let defaultSelected = '';
  if(placeInfo)
  {
    if(!selectData.length) selectData.push({ value: String(placeInfo.ID), label: "原："+placeInfo.Name});
    defaultSelected = selectData[0].value;
    console.log(defaultSelected);
  }

  async function handleEditInvite()
  {
    if(sp_type === null)
    {
      notifications.show({
        color: "red",
        title: '沒有選擇問題類別！',
        message: '選擇邀約對應的運動，讓他人更快找到你的邀約吧！',
      })
      return;
    }
    if(Name.length < 5)
    {
      console.log("error: too short")
      notifications.show({
        color: "red",
        title: '邀約名稱至少要有5個字喔～',
        message: '把名稱寫清楚，吸引更多人參加吧！',
      })
      return;
    }
    if(Name.length > 30)
    {
      console.log("error: too long")
      notifications.show({
        color: "red",
        title: '邀約名稱太長了！',
        message: '請將名稱簡約概述，讓它更一目了然～',
      })
      return;
    }
    if(placeValue === '')
    {
      notifications.show({
        color: "red",
        title: '沒有選擇邀約地點！',
        message: '搜尋並選擇邀約的地點，以提高報名的意願吧！',
      })
      return;
    }
    if(Other.length < 1)
    {
      console.log("error: too short")
      notifications.show({
        color: "red",
        title: '尚未填寫資訊內容～',
        message: '把內容寫得更清楚，吸引更多人參加吧！',
      })
      return;
    }
    if(!Datetime) return;
    if(loading) return;
    let {error} = await trigger(i_id, Name, parseInt(placeValue), parseInt(sp_type), Datetime.getTime(), Other);
    if(error) return console.error(error);
    refreshInvite()
    setPageStatus(0)
  }

  return(
    <main>
      {invite &&
        <Box m = "xl" component="form">
          <Select
            label="運動類別 :"
            data={sports}
            defaultValue={""}
            placeholder="請挑選運動類別"
            size={'md'} required
            mt="md"
            value = {sp_type}
            onChange={(value:string)=>(set_sp_type(value))}
            allowDeselect={false}
          />
          <Textarea
            label="邀約名稱 :"
            placeholder="設定個吸引人的名稱吧！可以包含地點、人數等資訊"
            autosize size={'md'}
            mt="md"
            withAsterisk
            required value = {Name}
            onChange={(event)=>(set_Name(event.currentTarget.value))}
          />
          <DateTimePicker
            label="邀約日期 & 時間："
            placeholder="請選擇邀請時間及日期"
            valueFormat={'YYYY/MM/DD hh:mm'}
            dropdownType={'modal'}
            minDate={new Date(Date.now())}
            size={'md'}
            mt="md"
            required value={Datetime}
            onChange={set_Datetime}
          />
          <Select
            label="活動地點"
            placeholder="請搜尋並選擇活動地點"
            size={'md'}
            mt="md" required
            data={selectData} clearable
            searchable nothingFoundMessage={"查無地點"}
            searchValue={searchInput}
            onSearchChange={(value)=>{
              console.log(value.length , searchInput.length - 1)
              if(value.length === searchInput.length - 1)
              {
                setPlaceValue('');
              }
              setSearchInput(value);
            }}
            value={placeValue} onChange={(value:string)=>setPlaceValue((value)? value: '')}
          />
          <Textarea
            label="更多資訊（內容）:"
            minRows={3} autosize size={'md'}
            mt="md"
            required value = {Other}
            onChange={(event)=>(set_Other(event.currentTarget.value))}
          />
          <Group justify="space-evenly" mt="md">
            <Button
              onClick={()=>(setPageStatus(0))}
              leftSection={<IconChevronLeft />}
              w={"45%"}
            >
              取消
            </Button>
            <Button
              onClick={handleEditInvite}
              variant="gradient"
              gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
              rightSection={<IconCheck />}
              w={"45%"} loading={loading}>
              確定
            </Button>
          </Group>
        </Box>
      }
    </main>
  )
}

export default function InvitePage() {
  const router = useRouter();
  const i_id = router.query.i_id;

  const [pageStatus, setPageStatus] = useState(0);

  let { data, error, mutate: refreshInvite } = useSWR(['invite/invitation/'+i_id, { throwHttpErrors: true }]);
  console.log(data)

  if(error instanceof HTTPError && error.response.status === 404)
  {
    router.replace('/error');
  }

  const title = '邀約詳細資訊';
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
              { pageStatus === 0 &&
                <>
                  <InviteCard invite={data[0]}  setPageStatus={setPageStatus}></InviteCard>
                </>
              }
              { pageStatus === 1 && (
                <ModifyInvitePage invite={data[0]} i_id={i_id as string} setPageStatus={setPageStatus} refreshInvite={refreshInvite}></ModifyInvitePage>
              )}
            </>
          }
        </Container>
      </main>
    </>
  );
}
