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
