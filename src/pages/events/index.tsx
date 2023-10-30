import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import '@mantine/dates/styles.css';
import Head from 'next/head';
import { addContest } from '@/apis/cont';
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
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import useSWR from 'swr';
import {
  IconCalendarCheck,
  IconCalendarOff,
  IconChevronLeft,
  IconChevronRight,
  IconMap2,
  IconPlus,
  IconScoreboard,
  IconSend,
  IconUser,
} from '@tabler/icons-react';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import { createPortal } from 'react-dom';
import { notifications } from '@mantine/notifications';
import isUrl from 'is-url';
import { getPlaceByID } from '@/apis/map';

type searchData = {
  Name: string,
  Address: string,
  ID: number
}

function AddContestPage({ setFormToShow }: any) {
  const { user, mutate: refreshUser } = useUser();
  let { trigger, error, loading } = useAsyncFunction(addContest);

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
  const [placeValue, setPlaceValue] = useState<string>('');

  let { data, mutate: updateItems } = useSWR<searchData[]>(['map/search/' + searchInput, { throwHttpErrors: true }]);

  let selectData;
  if (data) {
    selectData = data.map(({ ID, Name }) => ({ value: ID.toString(), label: Name }));
  }

  const form = useForm({
    initialValues: {
      Name: '',
      Organizer: '',
      Content: '',
      sp_type: '',//前端送往後端時需處理
      StartDate: null,//前端送往後端時需處理
      EndDate: null,//前端送往後端時需處理
      Deadline: null,
      Url: '',
      Other: ''
    },
  });

  async function handleSubmit(values: any) {
    if (values.sp_type == '') {
      notifications.show({
        color: "red",
        title: '沒有選擇運動類別！',
        message: '選擇活動對應的運動，讓他人更快找到你的活動吧！',
      })
      return;
    }
    if (values.Name.length < 5) {
      console.log("error: too short")
      notifications.show({
        color: "red",
        title: '比賽名稱至少要有5個字喔～',
        message: '名稱太短大家會不知道這是什麼活動！',
      })
      return;
    }
    if (placeValue == '') {
      notifications.show({
        color: "red",
        title: '沒有選擇活動地點！',
        message: '搜尋並選擇活動地點，讓他人更快找到你的活動吧！',
      })
      return;
    }
    //console.log(values,stDate,enDate,deadline)
    if (!values.StartDate || !values.Deadline || !values.EndDate) {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '記得確實填寫日期～',
        message: '讓大家更清楚活動時程！',
      })
      return;
    }
    if (values.Deadline < Date.now()) {
      notifications.show({
        color: "red",
        title: '歐不！再檢查一次日期～',
        message: 'Oh, no! 報名已經截止了嗎？',
      })
      return;
    }
    if (values.StartDate < values.Deadline) {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '歐不！再檢查一次日期～',
        message: '報名截止日不可以比活動開始日還晚！',
      })
      return;
    }
    if (values.StartDate > values.EndDate) {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '歐不！再檢查一次日期～',
        message: '活動開始日不可以比結束日還要晚！大家不會時空旅行',
      })
      return;
    }
    if (!isUrl(values.Url)) {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '請確實填寫報名連結！',
        message: '要有正確的報名連結才會有人報名你的活動喔～',
      })
      return;
    }

    let tz_offset = (new Date()).getTimezoneOffset() * 60000;
    let stDate = (new Date(values.StartDate - tz_offset)).toISOString().split('T')[0];
    let enDate = (new Date(values.EndDate - tz_offset)).toISOString().split('T')[0];
    let deadline = (new Date(values.Deadline - tz_offset)).toISOString().split('T')[0];

    if (loading) return;
    let { error } = await trigger(values.Name, values.Organizer, values.Content, parseInt(placeValue), parseInt(values.sp_type), stDate, enDate, deadline, values.Url, values.Other);
    if (error) return console.error(error);
    notifications.show({
      color: "green",
      title: '新增比賽成功～',
      message: '隨時關注，以獲得最新資訊！',
    })
    setFormToShow(FormType.showContestForm);
  }

  return (
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
            <TextInput size={'md'}
              mt="md" required
              label="主辦單位"
              placeholder="輸入主辦單位（多個請用頓號隔開）"
              {...form.getInputProps('Organizer')}
            />
            <Select size={'md'}
              mt="md" required
              label="活動地點"
              placeholder="請搜尋並選擇活動地點"
              data={selectData} clearable
              searchable nothingFoundMessage={"查無地點"}
              searchValue={searchInput}
              onSearchChange={(value) => {
                console.log(value.length, searchInput.length - 1)
                if (value.length === searchInput.length - 1) {
                  setPlaceValue('');
                }
                setSearchInput(value);
              }}
              value={placeValue} onChange={(value: string) => setPlaceValue((value) ? value : '')}
            />
            <DatePickerInput
              mt="md" required size={'md'}
              clearable dropdownType={'modal'}
              minDate={new Date(Date.now())}
              valueFormat="YYYY/MM/DD"
              label="報名截止日期"
              placeholder="請選擇報名截止日期"
              {...form.getInputProps('Deadline')}
            />
            <DatePickerInput
              mt="md" size={'md'}
              clearable required dropdownType={'modal'}
              minDate={new Date(Date.now())}
              valueFormat="YYYY/MM/DD"
              label="活動開始日期"
              placeholder="請選擇活動開始日期"
              {...form.getInputProps('StartDate')}
            />
            <DatePickerInput
              mt="md" required size={'md'}
              clearable dropdownType={'modal'}
              minDate={new Date(Date.now())}
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
                onClick={() => setFormToShow(FormType.showContestForm)}
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
                <Link href='/signin'> 註冊/登入</Link>
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
  Organizer: string,
  Place: string,
  Content: string,
  sp_type: number,
  StartDate: any,
  EndDate: any,
  Deadline: any,
  Url: string,
  Other: string,
  c_id: number,
  nickname: string
}

function ListContestPage({ displayByc_id, setFormToShow }: ListContestPage) {
  const [sp_type, setSp_type] = useState<string | null>('0');
  let str = 'cont/contests/SelectType?sp_type=' + sp_type;
  let { data, error, mutate: refreshList } = useSWR([str, { throwHttpErrors: true }]);
  if (data && data.length) console.log(data[0]);
  if (error) console.log("error: ", error);

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

  let title = "全部"
  if (sp_type && sp_type !== "0")
    title = sports[parseInt(sp_type)].label;
  title += "活動"
  useNavbarTitle(title);

  const [placeNames, setPlaceNames] = useState<any[] | null>(null);

  if ((data && !placeNames) || (data && placeNames != null && (data.length != placeNames.length))) {
    (async () => {
      let results = await Promise.all(
        data.map((item: Contests) => {
          return getPlaceByID(item.Place);
        })
      );
      setPlaceNames(results);
    })()
    console.log('callback')
  }

  let tz_offset = (new Date()).getTimezoneOffset() * 60000;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <Container p="lg">
          <Select
            label="運動類別篩選"
            data={sports} allowDeselect={false}
            defaultValue={sports[0].label}
            pb='xl'
            value={sp_type}
            onChange={(value) => (setSp_type(value))}
          />
          {!!data && !!placeNames && (data.length == placeNames.length) && data.map((contest: Contests, index: number) => (
            <Link href={"events/contests/" + contest.c_id} key={contest.c_id}>
              <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm'>
                <Group justify='space-between'>
                  <Group>
                    <IconUser />
                    <Text fw={700} pt={rem(5)}>{contest.nickname}</Text>
                  </Group>
                </Group>
                <Text size="xl" ml={'lg'} mt='lg' fw='600'>{'【 ' + sports[contest.sp_type].label + ' 】' + contest.Name}</Text>
                <Flex ml={'xl'} mt='md' justify={'flex-start'}>
                  <IconMap2 />
                  <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>活動地點：{placeNames[index].Name}</Text>
                </Flex>
                <Flex ml={'xl'} mt='md' justify={'flex-start'}>
                  <IconScoreboard />
                  <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>主辦單位：{contest.Organizer}</Text>
                </Flex>
                <Flex ml={'xl'} mt='md' justify={'flex-start'}>
                  <IconCalendarCheck />
                  <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>
                    活動日期：
                    {new Date(contest.StartDate).toLocaleDateString() + " ～ " + new Date(contest.EndDate).toLocaleDateString()}
                  </Text>
                </Flex>
                <Flex ml={'xl'} mt='md' justify={'flex-start'}>
                  <IconCalendarOff />
                  <Text ml={rem(2)} pt={rem(2)} size='md' fw={700}>報名截止日期：{new Date(contest.Deadline).toLocaleDateString()}</Text>
                </Flex>
                <Flex mt='md' justify='right' c={'blue'}>
                  <Text style={{ textDecoration: "underline", textDecorationThickness: rem(2) }} fw={600} size='md'>查看詳細內容</Text>
                  <IconChevronRight />
                </Flex>
              </Card>
            </Link>)
          )}
          {error &&
            <Alert variant="light" color="red" my="md">
              錯誤：暫時無法取得資料
            </Alert>
          }
          {data && !data.length &&
            <Alert variant="light" color="yellow" my="md">
              目前沒有可以顯示的東西QQ
            </Alert>
          }
        </Container>
      </main>
    </>
  );
}

enum FormType {
  showContestForm,
  unSignInForm,
  addContestForm,
}
export default function EventsPage() {
  const [formToShow, setFormToShow] = useState(FormType.showContestForm);

  const titles = {
    [FormType.showContestForm]: '全部活動',
    [FormType.addContestForm]: '新增活動',
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
              setFormToShow={(FormType) => {
                setFormToShow(FormType);
              }}
              setc_id={setc_id}
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
                <Link href='/signin'>按此前往登入頁面</Link>
              </Alert>
            </>
          </Box>
        )}
      </main>
    </>
  );
}
