import {useAsyncFunction, useNavbarTitle, useUser} from '@/hooks';
import '@mantine/dates/styles.css';
import Head from 'next/head';
import { addContest, deleteContest } from '@/apis/cont';
import { tryParse } from '@/utils';
import {
  Alert,
  Box,
  Button,
  Code,
  Container,
  Menu,
  rem,
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
import {notifications} from "@mantine/notifications";
import isUrl from "is-url";
import { modals } from '@mantine/modals';

type searchData = {
  Name: string,
  Address: string,
  ID: number
}

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

  const [searchInput, setSearchInput] = useState<string>('');
  const [placeValue, setPlaceValue] = useState<string>('')

  let {data, mutate: updateItems} = useSWR<searchData[]>(['map/search/'+searchInput, { throwHttpErrors: true }]);

  let selectData;
  if(data)
  {
    selectData = data.map(({ ID, Name }) => ({ value: ID.toString(), label: Name}));
  }

  const form = useForm({
    initialValues: {
      Name: '',
      Content:'',
      sp_type: '',//前端送往後端時需處理
      StartDate: null,//前端送往後端時需處理
      EndDate: null,//前端送往後端時需處理
      Deadline: null,
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
    if(values.sp_type == '')
    {
      notifications.show({
        color: "red",
        title: '沒有選擇運動類別！',
        message: '選擇活動對應的運動，讓他人更快找到你的活動吧！',
      })
      return;
    }
    if(values.Name.length < 5)
    {
      console.log("error: too short")
      notifications.show({
        color: "red",
        title: '比賽名稱至少要有5個字喔～',
        message: '名稱太短大家會不知道這是什麼活動！',
      })
      return;
    }
    if(placeValue == '')
    {
      notifications.show({
        color: "red",
        title: '沒有選擇活動地點！',
        message: '搜尋並選擇活動地點，讓他人更快找到你的活動吧！',
      })
      return;
    }
    //console.log(values,stDate,enDate,deadline)
    if(!values.StartDate || !values.Deadline || !values.EndDate)
    {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '記得確實填寫日期～',
        message: '讓大家更清楚活動時程！',
      })
      return;
    }
    if(values.Deadline < Date.now())
    {
      notifications.show({
        color: "red",
        title: '歐不！再檢查一次日期～',
        message: 'Oh, no! 報名已經截止了嗎？',
      })
      return;
    }
    if(values.StartDate < values.Deadline)
    {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '歐不！再檢查一次日期～',
        message: '報名截止日不可以比活動開始日還晚！',
      })
      return;
    }
    if(values.StartDate > values.EndDate)
    {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '歐不！再檢查一次日期～',
        message: '活動開始日不可以比結束日還要晚！大家不會時空旅行',
      })
      return;
    }
    if(!isUrl(values.Url))
    {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '請確實填寫報名連結！',
        message: '要有正確的報名連結才會有人報名你的活動喔～',
      })
      return;
    }

    let stDate = values.StartDate.getFullYear()+'-'+(values.StartDate.getMonth()+1)+'-'+values.StartDate.getDate();
    let enDate = values.EndDate.getFullYear()+'-'+(values.EndDate.getMonth()+1)+'-'+values.EndDate.getDate();
    let deadline = values.Deadline.getFullYear()+'-'+(values.Deadline.getMonth()+1)+'-'+values.Deadline.getDate();

    if(loading) return;
    let {error} = await trigger(values.Name, values.Content, parseInt(placeValue), parseInt(values.sp_type), stDate, enDate, deadline, values.Url, values.Other);
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
                    mt="md" required
                    comboboxProps={{ withinPortal: true }}
                    data={sports}
                    placeholder="請挑選運動類別"
                    label="運動類別"
                    allowDeselect={false}
                    {...form.getInputProps('sp_type')}
            />
            <TextInput size={'md'}
                       mt="md" required
                       label="活動名稱"
                       placeholder="請輸入活動名稱"
                       {...form.getInputProps('Name')}
            />
            <Select size={'md'}
                    mt="md" required
                    label="活動地點"
                    placeholder="請搜尋並選擇活動地點"
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
            <DatePickerInput size={'md'}
                             mt="md" required
                             clearable
                             valueFormat="YYYY/MM/DD"
                             label="報名截止日期"
                             placeholder="請選擇報名截止日期"
                             {...form.getInputProps('Deadline')}
            />
            <DatePickerInput size={'md'}
                             mt="md"
                             clearable required
                             valueFormat="YYYY/MM/DD"
                             label="活動開始日期"
                             placeholder="請選擇活動開始日期"
                             {...form.getInputProps('StartDate')}
            />
            <DatePickerInput size={'md'}
                             mt="md" required
                             clearable
                             valueFormat="YYYY/MM/DD"
                             label="活動結束日期"
                             placeholder="請選擇活動結束日期"
                             {...form.getInputProps('EndDate')}
            />
            <Textarea size={'md'}
                      mt="md" radius={'md'}
                      required
                      label="詳細說明"
                      placeholder="關於這個活動詳情"
                      {...form.getInputProps('Content')}
                      minRows={8} autosize
            ></Textarea>
            <TextInput size={'md'}
                       mt="md"
                       required
                       label="官網網址"
                       placeholder="請輸入官方網站網址"
                       {...form.getInputProps('Url')}
            />
            <Textarea size={'md'}
                      mt="md"
                      required
                      minRows={3} autosize
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
              登入後即可新增活動！前往
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
  displayByc_id: (c_id: number) => void
  setFormToShow: (FormType: number) => void
  setc_id: any
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

function ListContestPage({ displayByc_id, setFormToShow }: ListContestPage) {
  const [sp_type, setSp_type] = useState<string | null>('0');
  let str = (sp_type === '0') ? 'cont/contests' : 'cont/contests/SelectType?sp_type=' + sp_type;
  let { data, error, mutate:refreshList } = useSWR([str, { throwHttpErrors: true }]);
  if (data && data.length) console.log(data[0]);
  if (error) console.log("error: ", error);
  let {user} = useUser();
  
  let {trigger, loading} = useAsyncFunction(deleteContest);
  async function handleDelete(c_id:number)
  {
    console.log(c_id);
    if(loading) return;
    modals.openConfirmModal({
      title: '您確定要刪除這個活動嗎？',
      centered: true,
      children: (
        <Text size="sm">
          請注意，以上動作沒有辦法復原
        </Text>
      ),
      labels: { confirm: '是的，我非常確定', cancel: "不，請返回" },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await trigger(c_id);
        notifications.show({
          color: "green",
          title: '已成功刪除您的活動～',
          message: '期待您隨時來新增活動！',
        });
        refreshList();
      },
    });
  }

  async function handleEdit(c_id:number)
  {
    console.log(c_id);
    if(loading) return;
    modals.openConfirmModal({
      title: '您確定要刪除這個活動嗎？',
      centered: true,
      children: (
        <Text size="sm">
          請注意，以上動作沒有辦法復原
        </Text>
      ),
      labels: { confirm: '是的，我非常確定', cancel: "不，請返回" },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await trigger(c_id);
        notifications.show({
          color: "green",
          title: '已成功刪除您的活動～',
          message: '期待您隨時來新增活動！',
        });
        refreshList();
      },
    });
  }


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

  return (
    <>
      <main>
        <Container p="lg">
          <Select
            label="運動類別篩選"
            data={sports}
            defaultValue={sports[0].label}
            pb='xl'
            value={sp_type}
            onChange={(value) => (setSp_type(value))}
          />
          {data && data.map((contest: Contests) =>
              <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm'>
                <Group justify='space-between'>
                  <Group>
                    <IconUser />
                    <Text fw={500} >User{contest.User_id}</Text>
                  </Group>
                  { contest.User_id == user?.id &&
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
                          onClick={()=>handleEdit(contest.c_id)}
                        >
                          編輯此活動
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                          color="red"
                          onClick={()=>handleDelete(contest.c_id)}
                        >
                          刪除此活動
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  }
                  </Group>         
                <Text size="lg" m='md' fw='600'>{contest.Name}</Text>
                <Text ml="xl" mr='lg' size='md' fw={500} lineClamp={3}>{contest.Content}</Text>
                <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3} >報名截止日期 : {contest.Deadline.split("T")[0]}</Text>
                <Link href={"events/contests/" + contest.c_id} key={contest.c_id}>
                  <Flex mt='md' justify='right'>
                    <Text fw={600} size='md'>查看詳細內容</Text>
                    <IconChevronRight />
                  </Flex>
                </Link>
              </Card>
            
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

type ModifyContestPage = {
  setContestByc_id: (c_id: number) => void
}


function ModifyContestPage({ setContestByc_id }: ModifyContestPage) {
  const [c_id, setc_id] = useState<number | null>(0);
  let { data, error } = useSWR(['cont/contests/'+c_id, { throwHttpErrors: true }]);
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

  const form = useForm({
    initialValues: {
      Name: '',
      Content: '',
      Place: '',
      sp_type: '',//前端送往後端時需處理
      StartDate: new Date(),//前端送往後端時需處理
      EndDate: '',//前端送往後端時需處理
      Deadline: '',
      Url: '',
      Other: ''
    },
  });

  return (
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

  const [c_id, setc_id] = useState<number | null>(null);
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
              displayByc_id={(c_id) => {
                setc_id(c_id);
              }}
              setFormToShow = {(FormType) => {
                setFormToShow(FormType);
              }}
              setc_id = {setc_id}
            />
            {fabContainer && createPortal(
              <Button leftSection={<IconPlus size={20} />} mr={'xl'} mb='xl'
                style={({ "box-shadow": 'silver 2px 2px 20px', })} size={'lg'} radius={'xl'} c={"black"} color={'#F8D6D8'} onClick={() => (setFormToShow(FormType.addContestForm))}>
                新增活動
              </Button>
              , fabContainer)
            }
          </Box>
        )}

        {formToShow === FormType.addContestForm && (
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
