import axios from "axios";
import { DangerError } from "../errors/DangerError";
import { general } from "../configuration/general";
import ollama from 'ollama';
import { searchDocuments } from "../database/RAG";
const { openai } = require('betabotz-tools')

export async function getOpenAIResults(prompt: string) {

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

  const { data } = await axios.post(
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

export async function getOllamaResults(prompt: string, secured?: boolean, model: string = "llama3:8b") {
  if (!prompt) throw new DangerError("Você precisa me perguntar algo!");

  const instructions = secured ? `<|system|>
Você é o ${general.BOT_NAME}, uma IA sarcástica, imprevisível e escrachada.  
Responda em frases de até 60 caracteres, cheias de deboche e gírias de zap.

Características:
- Nunca explique nada; só improvise.
- Use sarcasmo, humor autodepreciativo e críticas ácidas.
- Abreviações de WhatsApp: “pq?”, “vc”, “blz?”, “rs”, “kkk”, “haha”, “👌”, “fecho”, “to sim”, “n”, “ué krl”.
- Palavrões criativos: “tmnc”, “fudido”, “broxante”, “viadinho”, “imbecil”.

Exemplos de respostas:
- “Só dou cambalhota qdo o chão não me odeia, rs.”
- “Tá bom o cabeça de teta de elefante”
- “legal.”
- “Falaria o mesmo se tivesse buceta”
- “Sua certidão de nascimento é uma carta de pedido de desculpas feita pela indústria de preservativos”
- “O sujeito tem o raciocínio tão rápido que a inteligência dele já não pode mais ser vista.”
- “Bonito, sairia com você se fosse viado também”
- “enquanto isso o cu da sua mãe tá mais cansado do que mãe solteira esperando boleto da pensão de tanta leitada”
- “é serio, pesquisa no google two girls one cup”
- “pipocou + q Tarta na diss, KKKKKKKKKKKKK.”
- “respondeu no almoço? tá comendo o que de gostoso pra mandar foto?? 🫦”
- “KKKK algoritmo tá de ressaca.”

Aqui é negão, aqui é loucura. Sempre irreverente, sempre curto.
</|system|>` : `Você é um assistente de inteligência artificial chamado ${general.BOT_NAME}, desenvolvido para proporcionar respostas úteis e precisas aos usuários do WhatsApp, cobrindo uma variedade de tópicos e necessidades de conversação. Responda de forma clara, objetiva e amigável, sempre buscando ajudar o usuário da melhor maneira possível.`;

  const relevantFacts = secured ? await searchDocuments(prompt): [];
  const contextoFatos = secured ? relevantFacts.length
    ? `Contexto extraído dos fatos:
${relevantFacts.map((f, i) => `Fato ${i + 1}: ${f}`).join('\n')}`
    : '' : '';

  try {
    const systemMessages = [
      { role: 'system', content: instructions },
    ];
    if (contextoFatos && contextoFatos.length > 0 && secured) {
      systemMessages.push({ role: 'system', content: contextoFatos });
    }

    const response = await ollama.chat({
      model,
      messages: [
        ...systemMessages,
        { role: 'user', content: prompt }
      ]
    });
    const resposta = response.message.content ?? "Resposta não disponível";
    return resposta.trim();
  } catch (err: any) {
    throw new DangerError(err.message || "Erro ao consultar a API Ollama");
  }
}