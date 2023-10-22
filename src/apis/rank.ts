import { HTTPError } from 'ky';
import { client } from './common';

export async function addRank(ID : number, Rank: number)
{
  console.log(ID, Rank)
  await client.post("map/addRank", {
    json: {
      ID,
      Rank
    },
  });
}
