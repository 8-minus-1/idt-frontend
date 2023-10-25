import { HTTPError } from 'ky';
import { client } from './common';

export async function addRank(ID : number, Rank: number,Comment:string)
{
  console.log(ID, Rank,Comment)
  await client.post("map/addRank", {
    json: {
      ID,
      Rank,
      Comment
    },
  });
}

export async function deleteRank(r_id:number)
{
  await client.delete("map/deleteRank?id="+r_id);
}

export async function editRank(ID:number,Rank:number,Comment:string)
{
  await client.put("map/editRank",{
    json:{
      ID,
      Rank,
      Comment
    }
  });
}
