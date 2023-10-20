import { HTTPError } from 'ky';
import { client } from './common';

export async function getPlaceByID(p_id: string)
{
  let results = await client.get('map/getInfo?id='+p_id).json();
  return results;
}
