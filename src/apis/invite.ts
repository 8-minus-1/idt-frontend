import { client } from './common';
//
export async function addInvite(Name : string, Content : string,
                                Place : number, sp_type : number,
                                DateTime :number, Other:string)
{
  await client.post("invite/invitation",{
    json:{
      Name,
      Content,
      Place,
      sp_type,
      DateTime,
      Other
    },
  });
}
