import { HTTPError } from 'ky';
import { client } from './common';
import exp from 'constants';

export async function addContest(Name : string,
                                 Content : string,
                                 Place : number,
                                 sp_type : number,
                                 StartDate :string,
                                 EndDate:string,
                                 Deadline:string,
                                 Url:string,
                                 Other:string)
{
  await client.post("cont/contests",{
    json:{
      Name,
      Content,
      Place,
      sp_type,
      StartDate,
      EndDate,
      Deadline,
      Url,
      Other
    },
  });
}

export async function deleteContest(c_id:number)
{
  await client.delete("cont/contests/"+c_id);
}

export async function editContest(c_id: number,
/*  Name : string,
  Content : string,
  Place : number,
  sp_type : number,
  StartDate :string,
  EndDate:string,
  Deadline:string,
  Url:string,
  Other:string*/)
{
  await client.put("cont/contests/modify?c_id="+c_id,{
    json:{
      Name,
      Content,
      Place,
      sp_type,
      StartDate,
      EndDate,
      Deadline,
      Url,
      Other
    }
  });
}
