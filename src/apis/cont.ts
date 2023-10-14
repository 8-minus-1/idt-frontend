import { HTTPError } from 'ky';
import { client } from './common';

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
