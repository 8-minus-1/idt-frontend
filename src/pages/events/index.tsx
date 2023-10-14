import {useAsyncFunction, useNavbarTitle, useUser} from '@/hooks';
import '@mantine/dates/styles.css';
import Head from 'next/head';
import {addContest } from '@/apis/cont';
import { tryParse } from '@/utils';
import {
  Alert,
  Box,
  Button,
  Code,
  Container,
  PasswordInput,
  Text,
  TextInput,
  Checkbox,
  Group,
  Select,
  Notification,
  Card,
  Flex,
  ActionIcon,
  Textarea,
} from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { DateInput, DateInputProps, DatePickerInput } from '@mantine/dates';
import { HTTPError } from 'ky';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import useSWR from 'swr';
import {
  IconDots,
  IconUser,
  IconTrash,
  IconChevronRight,
  IconEdit,
  IconAdjustments,
  IconPlus,
  IconChevronLeft, IconSend,
} from '@tabler/icons-react';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import { createPortal } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import submit = Simulate.submit;
import {addQuestion} from "@/apis/qa";
import {notifications} from "@mantine/notifications";
import isUrl from "is-url";

function AddContestPage({setFormToShow}: any)
{
  const {user, mutate: refreshUser}=useUser();
  let {trigger, error, loading} = useAsyncFunction(addContest);

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

  const places = [
    { value: "1", label: "元智大學體育館" },
    { value: "2", label: "中原大學體育館" },
    { value: "3", label: "元智大學室外排球場" },
  ];

  const form = useForm({
    initialValues: {
      Name: '',
      Content:'',
      Place:'',
      sp_type:'',//前端送往後端時需處理
      StartDate: new Date(),//前端送往後端時需處理
      EndDate: new Date(),//前端送往後端時需處理
      Deadline: new Date(),
      Url:'',
      Other:''
    },
  });

  const dateParser: DateInputProps['dateParser'] = (input) => {
    if (input === 'WW2') {
      return new Date(1939, 8, 1);
    }
    return new Date(input);
  };

  async function handleSubmit(values: any)
  {
    let stDate = values.StartDate.getFullYear()+'-'+(values.StartDate.getMonth()+1)+'-'+values.StartDate.getDate();
    let enDate = values.EndDate.getFullYear()+'-'+(values.EndDate.getMonth()+1)+'-'+values.EndDate.getDate();
    let deadline = values.Deadline.getFullYear()+'-'+(values.Deadline.getMonth()+1)+'-'+values.Deadline.getDate();
    //console.log(values,stDate,enDate,deadline)
    if(values.Name.length < 2)
    {
      console.log("error: too short")
      notifications.show({
        color: "red",
        title: '比賽名稱至少要有2個字喔～',
        message: '比賽名稱只有一個字是只有盃嗎????',
      })
      return;
    }
    if(values.StartDate < values.Deadline)
    {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '時間錯誤',
        message: '開始比了還可以報名是怎麼樣????',
      })
      return;
    }
    if(values.StartDate > values.EndDate)
    {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '時間錯誤',
        message: '開始時間怎麼會比結束時間長，時間旅行嗎????',
      })
      return;
    }
    if(!isUrl(values.Url))
    {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '報名連結錯誤',
        message: '報名網址錯誤喔，請確認清楚否則沒人會報名你的比賽，可憐!!',
      })
      return;
    }

    if(loading) return;
    let {error} = await trigger(values.Name,values.Content, parseInt(values.Place),parseInt(values.sp_type),stDate, enDate,deadline,values.Url,values.Other);
    if(error) return console.error(error);
    notifications.show({
      color: "green",
      title: '新增比賽成功～',
      message: '隨時關注，以獲得最新資訊！',
    })
    setFormToShow(FormType.showContestForm);
  }

  return(
    <main>
      {!!user &&
        <Box m="xl">
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Select size={'md'}
              mt="md"
              comboboxProps={{ withinPortal: true }}
              data={sports}
              placeholder="請挑選運動類別"
              label="運動類別"
              {...form.getInputProps('sp_type')}
            />
            <TextInput size={'md'}
              mt="md"
              withAsterisk
              label="活動名稱"
              placeholder="請輸入活動名稱"
              {...form.getInputProps('Name')}
            />
            <Select size={'md'}
              mt="md"
              comboboxProps={{ withinPortal: true }}
              data={places}
              placeholder="請挑選地點"
              label="地點選擇"
              {...form.getInputProps('Place')}
            />
            <DatePickerInput size={'md'}
              mt="md"
              withAsterisk
              clearable required
              valueFormat="YYYY/MM/DD"
              label="活動開始日期"
              placeholder="請選擇活動開始日期"
              {...form.getInputProps('StartDate')}
            />
            <DateInput size={'md'}
              mt="md"
              withAsterisk
              clearable
              dateParser={dateParser}
              valueFormat="YYYY/MM/DD"
              label="活動結束日期"
              placeholder="請選擇活動結束日期"
              {...form.getInputProps('EndDate')}
            />
            <DateInput size={'md'}
              mt="md"
              withAsterisk
              clearable
              dateParser={dateParser}
              valueFormat="YYYY/MM/DD"
              label="報名截止日期"
              placeholder="請選擇報名截止日期"
              {...form.getInputProps('Deadline')}
            />
            <Textarea size={'md'}
              mt="md" radius={'md'}
              withAsterisk
              label="詳細說明"
              placeholder="關於這個活動詳情"
              {...form.getInputProps('Content')}
              minRows={8} autosize
            ></Textarea>
            <TextInput size={'md'}
              mt="md"
              withAsterisk
              label="官網網址"
              placeholder="請輸入官方網站網址"
              {...form.getInputProps('Url')}
            />
            <TextInput size={'md'}
              mt="md"
              withAsterisk
              label="其他"
              placeholder="關於這個活動的其他資訊"
              {...form.getInputProps('Other')}
            />
            <Group justify={"space-evenly"} my={'lg'}>
              <Button
                onClick={()=>setFormToShow(FormType.showContestForm)}
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
          </form>
        </Box>
      }{!user &&
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
  )
}

type ListContestPage = {
  displayByc_id: (c_id: number) =>  void
  setFormToShow: (FormType: number) => void
};

type Contests = {
  User_id: number,
  Name: string,
  Place: string,
  Content: string,
  sp_type: number,
  StartDate: any,
  EndDate: any,
  Deadline: any,
  Url: string,
  Other: string,
  c_id: number
}

function ListContestPage({displayByc_id, setFormToShow, setc_id}: ListContestPage)
{
  const [sp_type, setSp_type] = useState<string|null>('0');
  let str = (sp_type === '0') ? 'cont/contests' : 'cont/contests/SelectType?sp_type=' + sp_type;
  let { data, error } = useSWR([str, { throwHttpErrors: true }]);
  if(data && data.length) console.log(data[0]);
  if(error) console.log("error: ",error);

  const sports = [
    { value: "0", label: "顯示全部活動" },
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
        <Container p="lg">
          <Select
            label="運動類別篩選"
            data={sports}
            defaultValue={sports[0].label}
            pb='xl'
            value={sp_type}
            onChange={(value)=>(setSp_type(value))}
          />
          {data && data.map((contest: Contests) =>
            <Link href={"events/contests/"+contest.c_id} key={contest.c_id}>
              <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm'>
                <Group justify='space-between'>
                  <Group>
                    <IconUser />
                    <Text fw={500} >User{contest.User_id}</Text>
                  </Group>

                    <Flex mt='md' justify='right'>
                      <Button fw={600}
                              style={{fontSize: '25px'}}
                              bg='#D6EAF8'
                              onClick={()=>(setFormToShow(3), displayByc_id(contest.c_id))}>...</Button>
                    </Flex>

                </Group>
                <Text size="lg" m='md' fw='600'>{contest.Name}</Text>
                <Text ml="xl" mr='lg' size='md' fw={500} lineClamp={3}>{contest.Content}</Text>
                <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3} >報名截止日期 : {contest.Deadline.split("T")[0]}</Text>
                <Link href={contest.Url}>
                  <Flex mt='md' justify='right'>
                    <Text fw={600} size='md'>查看詳細內容</Text>
                    <IconChevronRight/>
                  </Flex>
                </Link>
              </Card>
            </Link>
          )}
          {error &&
            <Alert variant="light" color="red" my="md">
            錯誤
            </Alert>
          }
        </Container>
      </main>
    </>
  );
}

type ModifyContestPage ={
  setContestByc_id: (c_id: number) =>  void
}

function ModifyContestPage({setContestByc_id}: ModifyContestPage)
{
  const [c_id, setc_id] = useState<number|null>(0);
  let { data, error } = useSWR(['cont/contests/'+c_id, { throwHttpErrors: true }]);
  if(error) console.log("error: ",error);
  console.log(typeof(data));

  const sports = [
    { value: "0", label: "顯示全部活動" },
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

  const form = useForm({
    initialValues: {
      Name: '',
      Content:'',
      Place:'',
      sp_type:'',//前端送往後端時需處理
      StartDate: new Date(),//前端送往後端時需處理
      EndDate:'',//前端送往後端時需處理
      Deadline:'',
      Url:'',
      Other:''
    },
  });

  form.setFieldValue('Name', data.Name);
  form.setFieldValue('Content', data.Content);
  form.setFieldValue('Place', data.Place);
  form.setFieldValue('sp_type', data.sp_type);
  form.setFieldValue('StartDate', data.StartDate);
  form.setFieldValue('EndDate', data.EndDate);
  form.setFieldValue('Deadline', data.Deadline);
  form.setFieldValue('Url', data.Url);
  form.setFieldValue('Other', data.Other);

  return(
    <>
      <main>
      <Box maw={500} mx="auto">
        <form onSubmit={data}>
          <Select
            mt="md"
            comboboxProps={{ withinPortal: true }}
            label="運動類別"
            data={sports}
            {...form.getInputProps('sp_type')}
          />
          <TextInput
            mt="md"
            withAsterisk
            label="活動名稱"
            {...form.getInputProps('Name')}
          />
          <TextInput
          mt="md"
            withAsterisk
            label="地點"
            {...form.getInputProps('Place')}
          />
          <DateInput
            mt="md"
            withAsterisk
            clearable defaultValue={new Date()}
            dateParser={data.StartDate}
            valueFormat="YYYY/MM/DD"
            label="開始日期"
            {...form.getInputProps('StartDate')}
          />
          <DateInput
            mt="md"
            withAsterisk
            clearable defaultValue={new Date()}
            dateParser={data.EndDate}
            valueFormat="YYYY/MM/DD"
            label="結束日期"
            {...form.getInputProps('EndData')}
          />
          <DateInput
            mt="md"
            withAsterisk
            clearable defaultValue={new Date()}
            dateParser={data.Deadline}
            valueFormat="YYYY/MM/DD"
            label="截止日期"
            {...form.getInputProps('Deadline')}
          />
          <TextInput
            mt="md"
            withAsterisk
            label="內容"
            {...form.getInputProps('Content')}
          />
          <TextInput
            mt="md"
            withAsterisk
            label="報名連結"
            {...form.getInputProps('Url')}
          />
          <TextInput
            mt="md"
            withAsterisk
            label="其他"
            {...form.getInputProps('Other')}
          />
        <Group justify={"space-evenly"} my={'lg'}>
          <Button
            onClick={()=>{window.location.href='/event'}}
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
        </form>
          </Box>
      </main>
    </>
  )
}


enum FormType {
  showContestForm,
  unSignInForm,
  addContestForm,
  modifyContestForm,
}
export default function EventsPage() {
  const [formToShow, setFormToShow] = useState(FormType.showContestForm);

  const titles = {
    [FormType.showContestForm]: '全部活動',
    [FormType.addContestForm]: '新增活動',
    [FormType.modifyContestForm]: '更改活動資訊',
    [FormType.unSignInForm]: '請先登入'
  };

  const [c_id, setc_id] = useState<number|null>(null);
  const title = titles[formToShow];
  useNavbarTitle(title);

  let fabContainer = useContext(FABContainerContext);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        {formToShow === FormType.showContestForm && (
          <Box mx="auto">
            <ListContestPage
              displayByc_id = {(c_id) => {
                setc_id(c_id);
              }}
              setFormToShow = {(FormType) => {
                  setFormToShow(FormType);
              }}
            />
            { fabContainer && createPortal(
              <Button leftSection={<IconPlus size={20} />} mr={'xl'} mb='xl'
                      style={({ "box-shadow": 'silver 2px 2px 20px', })} size={'lg'} radius={'xl'} c={"black"} color={'#F8D6D8'} onClick={() => (setFormToShow(FormType.addContestForm))}>
                新增活動
              </Button>
              , fabContainer)
            }
          </Box>
        )}

        {formToShow === FormType.addContestForm &&(
          <AddContestPage setFormToShow={setFormToShow}></AddContestPage>
        )}

        {formToShow === FormType.modifyContestForm && (
          <ModifyContestPage setContestByc_id={setc_id} ></ModifyContestPage>
        )}
        {formToShow === FormType.unSignInForm && (
          <Box style={{
            textAlign: "center",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70vh',
          }}>
          <>
            <Alert color="blue">
              未登入系統，請先登入後再新增活動！
            <Link href = '/signin'>按此前往登入頁面</Link>
            </Alert>
          </>
          </Box>
        )}
      </main>
    </>
  );
}
