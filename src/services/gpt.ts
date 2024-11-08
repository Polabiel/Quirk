import axios from "axios";
import { DangerError } from "../errors/DangerError";
import { general } from "../configuration/general";
const { openai } = require('betabotz-tools') 

export async function getOpenAIResults(prompt: string): Promise<any> {

  if (!prompt) throw new DangerError("Você precisa me perguntar algo!");

  const results: {
    status: number
    creator: string
    result: string
  } = await openai(prompt);

  return results;
}

export default async function (
  content: string,
  token: string
): Promise<string> {
  if (!content) throw new DangerError("Você precisa me perguntar algo!");
  if (!token) throw new DangerError("Você precisa me enviar um token!");

  const {data} = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `Sou um assistente de inteligência artificial chamado ${general.BOT_NAME}, desenvolvido para proporcionar respostas úteis e precisas aos usuários do WhatsApp, cobrindo uma variedade de tópicos e necessidades de conversação` },
          { role: 'user', content: content },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return data.choices[0].message.content;
}