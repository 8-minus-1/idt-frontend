import { HTTPError } from 'ky';
import { client } from './common';
import exp from 'constants';

export async function addRank(ID : any,Rank:any)
{
  await client.post("map/addRank?ID="+ID+"&Rank="+Rank);
}
