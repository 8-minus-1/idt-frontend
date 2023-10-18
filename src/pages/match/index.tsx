import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import '@mantine/dates/styles.css';
import {
  Card,
  Container,
  Flex,
  Group,
  Select,
  Text,
  Alert,
  rem,
  Button,
  Box,
  Textarea,
} from '@mantine/core';
import React, { useContext, useState } from 'react';
import { Simulate } from 'react-dom/test-utils';
import error = Simulate.error;
import useSWR from 'swr';
import Link from 'next/link';
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import { createPortal } from 'react-dom';
import { DateTimePicker } from '@mantine/dates';
import { addQuestion } from '@/apis/qa';
import { addInvite } from '@/apis/invite';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

type m = {
  "User_id": number,
  "Name": string,
  "Content": string,
  "Place": string,
  "sp_type": number,
  "DateTime": string,
  "Time": string,
  "Other": string,
  "i_id": number,
}

type searchData = {
  Name: string,
  Address: string,
  ID: number
}

function MListPage()
{
  const [sp_type, setSp_type] = useState<string>('0');

  let { data, error }  = useSWR(['invite/invitation/InviteType?sp_type='+sp_type, { throwHttpErrors: true }]);
  if(error) console.log("error: ",error);

  console.log(sp_type);

  const method =[
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
              data={method} allowDeselect={false}
              defaultValue={method[0].value}
              pb='xl'
              w={"30%"}
            />
            <Select
              label="運動類別篩選"
              data={sports} allowDeselect={false}
              defaultValue={sports[0].value}
              pb='xl'
              w={"30%"}
              value={sp_type}
              onChange={(value:string)=>(setSp_type(value))}
            />
          </Group>
          { error &&
            <Alert variant="light" color="red" my="md">
              暫時無法取得資料
            </Alert>
          }
          {data &&
            data.map((invite:m)=>
              <Link href={"match/invites/"+invite.i_id} key={invite.i_id}>
                <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm'>
                  <Group justify='space-between'>
                    <Group>
                      <IconUser/>
                      <Text fw={500}>User{invite.User_id}</Text>
                    </Group>
                  </Group>
                  <Text size="lg" m='md' fw='600'>{invite.Name}</Text>
                  <Text ml="xl" mr='lg' size='md' fw={500} lineClamp={3}>{invite.Content}</Text>
                  <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3} >日期 : {new Date(invite.DateTime).toISOString().split('T')[0]}</Text>
                  <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3} >時間 : {new Date(invite.DateTime).getHours() + ':' + new Date(invite.DateTime).getMinutes()}</Text>
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
  const [Content, set_Content]=useState("");
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

  // const form = useForm({
  //   initialValues: {
  //     Name: '',
  //     Content:'',
  //     sp_type: '',
  //     DateTime: null,
  //     Other:''
  //   },
  // });

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
    if(!sp_type) return;
    if(!Datetime) return;
    //let DT = values.DateTime.getFullYear()+'-'+(values.DateTime.getMonth()+1)+'-'+values.DateTime.getDate()+' '+values.DateTime.getHours()+':'+values.DateTime.getMinutes();
    if(loading) return;
    let {error} = await trigger(Name, Content, parseInt(placeValue), parseInt(sp_type), Datetime.getTime(), Other);
    if(error) return console.error(error);
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
                //{...form.getInputProps('sp_type')}
                value = {sp_type}
                onChange={(value:string)=>(set_sp_type(value))}
                allowDeselect={false}
              />
              <Textarea
                label="標題 :"
                placeholder="請輸入邀請標題名稱"
                autosize size={'md'}
                mt="md"
                withAsterisk
                //{...form.getInputProps('Name')}
                required value = {Name}
                onChange={(event)=>(set_Name(event.currentTarget.value))}
              />
              <DateTimePicker
                label="日期、時間："
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
                label="地點："
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
                label="詳細說明（至少10字）:"
                placeholder="關於此邀請的詳情"
                minRows={6} autosize size={'md'}
                mt="md"
                withAsterisk
                //{...form.getInputProps('Content')}
                required value = {Content}
                onChange={(event)=>(set_Content(event.currentTarget.value))}
              />
              <Textarea
                label="其他:"
                placeholder="關於此邀請的其他資訊"
                minRows={3} autosize size={'md'}
                mt="md"
                //{...form.getInputProps('Other')}
                value = {Other}
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
                  登入後即可發問！前往
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
