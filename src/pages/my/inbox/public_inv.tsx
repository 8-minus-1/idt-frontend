import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import '@mantine/dates/styles.css';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Group,
  rem,
  Select,
  Text,
  Textarea,
} from '@mantine/core';
import React, { useContext, useState } from 'react';
import { Simulate } from 'react-dom/test-utils';
import useSWR from 'swr';
import Link from 'next/link';
import {
  IconCalendarCheck,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconMap2,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import { createPortal } from 'react-dom';
import { DateTimePicker } from '@mantine/dates';
import { addInvite } from '@/apis/invite';
import { notifications } from '@mantine/notifications';
import { getPlaceByID } from '@/apis/map';

type m = {
  User_id: number,
  Name: string,
  Place: string,
  sp_type: number,
  DateTime: string,
  Time: string,
  Other: string,
  i_id: number,
  signupCount: number,
  expired: boolean
}

type searchData = {
  Name: string,
  Address: string,
  ID: number
}

function MListPage()
{
  let { data, error }  = useSWR(['invite/my', { throwHttpErrors: true }]);
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

  let {user} = useUser();

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
        <Container mt={'xl'}>
          <>
            { error &&
              <Alert variant="light" color="red" my="md">
                暫時無法取得資料
              </Alert>
            }
            {!!data && !!placeNames && (data.length == placeNames.length) &&
              data.map((invite:m, index:number)=>
                <Link href={"/match/invites/"+invite.i_id} key={invite.i_id}>
                  <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm'>
                    <Group justify='space-between'>
                      <Group>
                        <IconUser/>
                        <Text fw={500}>{user?.nickname}</Text>
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
                      <Text style={{textDecoration: "underline", textDecorationThickness: rem(2)}} fw={600} size='md'>
                        { !!invite.expired && <>此邀約已經過期</> }
                        { !invite.expired && <>目前有 {invite.signupCount} 人報名</> }
                      </Text>
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
        </Container>
      </main>
    </>
  );
}

function PostInvite({setDisplayState, refreshInvite}:any){
  const {user, mutate: refreshUser}=useUser();
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
  const title = '我ㄉ公開邀請';
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
            <MListPage/>
            { fabContainer && createPortal(
              <Button leftSection={<IconUsersGroup size={20} />} mr={'xl'} mb='xl'
                      style={({ boxShadow: 'silver 2px 2px 20px', })} size={'lg'} radius={'xl'} c={"black"} color={'#F8D6D8'} onClick={() => (setDisplayState(1))}>
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
