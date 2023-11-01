import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import '@mantine/dates/styles.css';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Container,
  Flex,
  Group,
  Paper,
  rem,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import React, { useContext, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import {
  IconArrowRight,
  IconCake,
  IconCalendarCheck,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconFriends,
  IconMap2,
  IconMapPinStar,
  IconUser,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import { createPortal } from 'react-dom';
import { DateTimePicker } from '@mantine/dates';
import { addInvite } from '@/apis/invite';
import { notifications } from '@mantine/notifications';
import { getPlaceByID } from '@/apis/map';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/router';
import { Volleyball } from '@icon-park/react';

type m = {
  "User_id": number,
  "Name": string,
  "Place": string,
  "sp_type": number,
  "DateTime": string,
  "Time": string,
  "Other": string,
  "i_id": number,
  nickname: string
}

type searchData = {
  Name: string,
  Address: string,
  ID: number
}

function PublicPage( { sp_type, sports }: any )
{
  let { data, error }  = useSWR(['invite/invitation/InviteType?sp_type='+sp_type, { throwHttpErrors: true }]);
  if(error) console.log("error: ",error);

  const [placeNames, setPlaceNames] = useState<any[]|null>(null);
  if( (data && !placeNames) || ( data && placeNames!=null && (data.length != placeNames.length)) )
  {
    (async() =>{
      let results = await Promise.all(
        data.map((item:m)=>{
          return getPlaceByID(item.Place);
        })
      );
      setPlaceNames(results);
    })()
    console.log('callback')
  }

  return(
    <>
      { error &&
        <Alert variant="light" color="red" my="md">
          暫時無法取得資料
        </Alert>
      }
      {!!data && !!placeNames && (data.length == placeNames.length) &&
        data.map((invite:m, index:number)=>
          <Link href={"match/invites/"+invite.i_id} key={invite.i_id}>
            <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm'>
              <Group justify='space-between'>
                <Group>
                  <IconUser/>
                  <Text fw={700} pt={rem(5)}>{invite.nickname}</Text>
                </Group>
              </Group>
              <Text size="lg" mx={'lg'} mt='lg' mb={'sm'} fw='600'>{'【 '+sports[invite.sp_type].label+' 】' + invite.Name }</Text>
              <Flex ml={'xl'} mt='md' justify={'flex-start'}>
                <IconCalendarCheck />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
                  邀約日期：{new Date(invite.DateTime).toLocaleDateString()}
                </Text>
              </Flex>
              <Flex ml={'xl'} mt='md' justify={'flex-start'}>
                <IconCalendarCheck />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
                  邀約時間：
                  {new Date(invite.DateTime).toLocaleTimeString().split(':')[0] + ':' + new Date(invite.DateTime).toLocaleTimeString().split(':')[1]}
                </Text>
              </Flex>
              <Flex ml={'xl'} mt='md' justify={'flex-start'}>
                <IconMap2 />
                <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>邀約地點：{placeNames[index].Name}</Text>
              </Flex>
              <Flex c={'blue'} mt='md' justify='right'>
                <Text style={{textDecoration: "underline", textDecorationThickness: rem(2)}} fw={600} size='md'>查看詳細內容</Text>
                <IconChevronRight/>
              </Flex>
            </Card>
          </Link>
        )
      }
      { data && !data.length &&
        <Alert variant="light" color="yellow" my="md">
          目前沒有可以顯示的內容QQ
        </Alert>
      }
    </>
  )
}

function PrivatePage()
{
  const [shouldShowExample, setShouldShowExample] = useState(false);
  const [selectedPersonIndex, setSelectedPersonIndex] = useState(0);
  const people = [
    { name: '亦努馬奇・托癸', dob: '2001/10/23' },
    { name: '果久・薩托陸', dob: '1989/12/7' },
  ];
  const person = people[selectedPersonIndex];

  if (shouldShowExample) {
    return (
      <>
        <Link href="#" onClick={(ev) => {
          ev.preventDefault();
          setShouldShowExample(false);
        }}>
          <Group gap="4px" display="inline-flex" py="xs">
            <IconX /><Text size="sm">關閉預覽</Text>
          </Group>
        </Link>
        <Title order={4} mb="md">你的配對候選</Title>
        <Flex align="flex-start" justify="center" gap="sm" mb="xl">
          <Stack gap="0">
            <Card px="0" py="md" bg="#FDEBD0" radius="lg" mb='md' shadow='sm'>
              <Stack gap="lg" mx="auto" px="xs" align="center">
                <Avatar size="lg" color="gray" />
                <Flex direction="column" justify="center">
                  <Text fw={700} size="xl">{person.name}</Text>
                </Flex>
              </Stack>
              <Flex mt="md" mx="sm">
                <IconCake style={{ flexShrink: 0 }} />
                <Flex ml="xs" pt={rem(2)} columnGap="xs" align="baseline" wrap="wrap">
                  <Text fw={700}>出生日期</Text>
                  {person.dob}
                </Flex>
              </Flex>
              <Flex mt="sm" mx="sm">
                <IconFriends style={{ flexShrink: 0 }} />
                <Flex ml="xs" pt={rem(2)} columnGap="xs" align="baseline" wrap="wrap">
                  <Text fw={700}>生理性別</Text>
                  男
                </Flex>
              </Flex>
              <Flex mt="sm" mx="sm" >
                <IconMapPinStar style={{ flexShrink: 0 }} />
                <Flex ml="xs" pt={rem(2)} columnGap="xs" align="baseline" wrap="wrap">
                  <Text fw={700}>生活地區</Text>
                  台中市北屯區
                </Flex>
              </Flex>
            </Card>
            <Group justify="center">
              <Button>拒絕</Button>
              <Button>接受</Button>
            </Group>
          </Stack>
          <Stack gap="0">
            <Paper p="lg">
              <Text fw={700} mb="xs">有興趣的運動：</Text>
              <Flex mt="xs" ml="xs">
                <Volleyball theme="outline" size="24" fill="#333" />
                <Text fw={700} ml="xs" pt={rem(2)}>排球（自評：技巧中規中矩）</Text>
              </Flex>
            </Paper>
            <Paper p="lg" mt="md">
              <Text fw={700} mb="xs">習慣的運動時段：</Text>
              <Flex mt="xs" ml="xs">
                <IconClock />
                <Text fw={700} ml="xs" pt={rem(2)}>下午2:00 ～ 下午4:00</Text>
              </Flex>
              <Flex mt="xs" ml="xs">
                <IconClock />
                <Text fw={700} ml="xs" pt={rem(2)}>上午2:00 ～ 上午4:00</Text>
              </Flex>
            </Paper>
            <Paper p="lg" mt="md">
              <Text fw={700} mb="xs">平台配對戰績：</Text>
              <Flex mt="xs" ml="xs">
                <IconX />
                <Text fw={700} ml="xs" pt={rem(2)}>目前沒有資料</Text>
              </Flex>
            </Paper>
          </Stack>
        </Flex>
      </>
    );
  }

  return (
    <>
      <Center>
        <Stack mt="6rem">
          <Text size="md">目前還沒有配對候選，過一陣子再來看看吧！</Text>
          <Alert mt="lg">
            好奇出現配對候選會是什麼樣子嗎？<br />
            <Flex w="100%" justify="flex-end">
              <Link href="#" onClick={(ev) => {
                ev.preventDefault();
                setSelectedPersonIndex(Math.floor(Math.random() * people.length));
                setShouldShowExample(true);
              }}>
                <Group gap="xs" mt="md">
                  <IconArrowRight />點選預覽
                </Group>
              </Link>
            </Flex>
          </Alert>
        </Stack>
      </Center>
    </>
  )
}

function MListPage({
  method, setMethod,
}: {
  method: string;
  setMethod: (m: string) => void;
})
{
  const [sp_type, setSp_type] = useState<string>('0');

  const methods =[
    { value: "0", label: "公開邀請" },
    { value: "1", label: "私人配對" },
  ];
  const sports = [
    { value: "0", label: "顯示全部邀請" },
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
        <Container>
          <Group mt="md">
            <Select
              label="配對方式"
              data={methods} allowDeselect={false}
              defaultValue={methods[0].value}
              pb='xl'
              w={"30%"}
              value={method} onChange={(value:string)=>(setMethod(value))}
            />
            { method === '0' && (
              <Select
                label="運動類別篩選"
                data={sports} allowDeselect={false}
                defaultValue={sports[0].value}
                pb='xl'
                w={"30%"}
                value={sp_type}
                onChange={(value:string)=>(setSp_type(value))}
              />
            )}
          </Group>
          { method === '0' &&
            <PublicPage sp_type={sp_type} sports={sports}></PublicPage>
          }
          { method === '1' &&
            <PrivatePage></PrivatePage>
          }
        </Container>
      </main>
    </>
  );
}

function PostInvite({setDisplayState, refreshInvite}:any){
  const {user, mutate: refreshUser} = useUser();
  let {trigger, error, loading} = useAsyncFunction(addInvite);
  const [sp_type, set_sp_type] = useState<string|null>(null);
  const [Name, set_Name] = useState("");
  const [Other, set_Other]=useState("");
  const [Datetime, set_Datetime]=useState<Date|null>(new Date(Date.now() + 86400000));

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

  const [searchInput, setSearchInput] = useState<string>('');
  const [placeValue, setPlaceValue] = useState<string>('')

  let {data, mutate: updateItems} = useSWR<searchData[]>(['map/search/'+searchInput, { throwHttpErrors: true }]);

  let selectData;
  if(data)
  {
    selectData = data.map(({ ID, Name }) => ({ value: ID.toString(), label: Name}));
  }

  async function handlePostInvite()
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
    console.log(placeValue)
    if(!Datetime) return;
    if(loading) return;
    let {error} = await trigger(Name, parseInt(placeValue), parseInt(sp_type), Datetime.getTime(), Other);
    if(error) return console.error(error);
    else
    {
      notifications.show({
        color: "green",
        title: '成功發送公開邀請～',
        message: '相信你的邀請一定會有很多人來報名的！',
      })
    }
    refreshInvite()
    setDisplayState(0)
  }

  return(
      <main>
        {!!user &&
          <Box m = "xl" component="form">
              <Select
                label="運動類別 :"
                clearable={false}
                data={sports}
                defaultValue={""}
                placeholder="請挑選運動類別"
                size={'md'}
                required
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
                label="邀約地點："
                placeholder="請搜尋並選擇邀請地點"
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
                placeholder="關於此邀請的其他資訊（無則填寫「無」）"
                minRows={3} autosize size={'md'}
                mt="md"
                required value = {Other}
                onChange={(event)=>(set_Other(event.currentTarget.value))}
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
                  //type={'submit'}
                  onClick={handlePostInvite}
                  variant="gradient"
                  gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
                  rightSection={<IconCheck />}
                  w={"45%"} loading={loading}>
                  確定
                </Button>
              </Group>
          </Box>
        }
        {!user &&
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
                  登入後即可發起公開邀請！前往
                  <Link href = '/signin'> 註冊/登入</Link>
                </Alert>
              </>
            )}
          </Box>
        }
      </main>
  );
}

export default function MatchPage() {
  const [displayState, setDisplayState] = useState(0);
  const [method, setMethod] = useState('0');

  let {user} = useUser();
  const router = useRouter();
  const title = '夥伴配對';
  let {mutate: refreshInvite}=useSWR(['invite/invitation',{ throwHttpErrors: true }])

  let fabContainer = useContext(FABContainerContext);
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        {displayState === 0 &&
          <>
            <MListPage {...{method, setMethod}}/>
            { fabContainer && method === '0' && createPortal(
              <Button leftSection={<IconUsersGroup size={20} />} mr={'xl'} mb='xl'
                      style={({ boxShadow: 'silver 2px 2px 20px', })} size={'lg'} radius={'xl'} c={"black"} color={'#F8D6D8'}
                      onClick={() => {
                        if(user && !user?.profileCompleted)
                        {
                          modals.openConfirmModal({
                            title: '您尚未設定個人資料及填寫註冊問卷！',
                            centered: true,
                            children:(
                              <Text size="sm">
                                必須先填寫再建立公開邀請～大家才可以查看您的個人資訊！
                              </Text>
                            ),
                            labels: { confirm: '馬上前往', cancel: "再考慮一下" },
                            confirmProps: { color: 'green' },
                            onConfirm:  ()=> {
                              router.replace('/my/info');
                              modals.closeAll();
                            },
                            onCancel() {
                              modals.closeAll();
                            }
                          });
                        }
                        else
                          setDisplayState(1);
                      }}>
                建立配對邀請
              </Button>, fabContainer)}
          </>
        }
        {displayState === 1 &&(
          <PostInvite setDisplayState={setDisplayState} refreshInvite={refreshInvite}/>
        )}
      </main>
    </>
  );
}
