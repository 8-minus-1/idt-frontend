import { client } from './common';
//
export async function addInvite(Name : string, Place : number, sp_type : number,
                                DateTime :number, Other:string)
{
  await client.post("invite/invitation",{
    json:{
      Name,
      Place,
      sp_type,
      DateTime,
      Other
    },
  });
}

export async function deleteInvite(i_id:number)
{
  await client.delete("invite/invitation/"+i_id);
}

export async function editInvite(i_id:number, Name : string, Place : number,
                                 sp_type : number, DateTime :number, Other:string) {
  await client.put("invite/invitation/EditInvite/" + i_id, {
    json: {
      Name,
      Place,
      sp_type,
      DateTime,
      Other
    },
  });
}

export async function signupPublicInv(i_id: number)
{
   await client.post("invite/signup/"+i_id);
}
