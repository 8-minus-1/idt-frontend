import { HTTPError } from 'ky';
import { client } from './common';

export async function addAnswer( q_id: number, a_content: string)
{
    await client.post("qa/questions/"+q_id+"/answers", {
      json: {
        a_content
      },
    });
}
