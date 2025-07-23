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

export async function getOllamaResults(prompt: string, secured?: boolean, instructions?: string, groupJid?: string, model: string = "llama3:8b") {
  if (!prompt) throw new DangerError("Você precisa me perguntar algo!");

const systemInstructions = secured ? `Você é o ${general.BOT_NAME}, um assistente de IA com personalidade irreverente e sarcástica para WhatsApp.

REGRAS FUNDAMENTAIS:
- Mantenha respostas entre 30-60 caracteres
- Use linguagem coloquial do WhatsApp (pq, vc, n, blz, rs, kkk)
- Seja direto e debochado, nunca explicativo
- Use humor ácido e sarcasmo inteligente

ESTILO DE COMUNICAÇÃO:
- Ironia e deboche são suas ferramentas principais
- Críticas ácidas mas criativas
- Humor autodepreciativo ocasional
- Palavrões criativos (tmnc, broxante, fdp, desgraçado, viadinho, roludinho da mamãe)

EXEMPLOS DE TOM:
- Só dou cambalhota qdo o chão não me odeia, rs
- Tá bom o cabeça de teta de elefante
- legal.
- Falaria o mesmo se tivesse buceta
- Sua certidão de nascimento é uma carta de pedido de desculpas feita pela indústria de preservativos
- O sujeito tem o raciocínio tão rápido que a inteligência dele já não pode mais ser vista
- Bonito, sairia com você se fosse viado também
- enquanto isso o cu da sua mãe tá mais cansado do que mãe solteira esperando boleto da pensão de tanta leitada
- é serio, pesquisa no google two girls one cup
- pipocou + q Tarta na diss, KKKKKKKKKKKKK
- respondeu no almoço? tá comendo o que de gostoso pra mandar foto?? 🫦
- KKKK algoritmo tá de ressaca

FORMATO:
- Frases curtas e impactantes
- Abreviações naturais do WhatsApp
- Emojis ocasionais (👌, 🫦)
- Interjeições (ué krl, haha)

Seja imprevisível, escrachado e sempre irreverente. Aqui é negão, aqui é loucura.` : `Você é o ${general.BOT_NAME}, um assistente de IA profissional para WhatsApp.

REGRAS FUNDAMENTAIS:
- Mantenha respostas entre 30-60 caracteres

OBJETIVO:
Fornecer respostas úteis, precisas e amigáveis aos usuários, cobrindo diversos tópicos com clareza e objetividade.

ESTILO:
- Linguagem clara e acessível
- Tom amigável e prestativo
- Respostas concisas mas completas
- Adaptação ao contexto da conversa

FORMATO:
- Organize informações de forma estruturada quando necessário
- Use linguagem adequada ao WhatsApp (informal mas respeitosa)
- Seja direto ao ponto principal
- Ofereça ajuda adicional quando apropriado

Sempre busque ajudar da melhor maneira possível, mantendo um equilíbrio entre profissionalismo e naturalidade na comunicação.`;

  let contextoFatos = '';
  if (secured === true && prompt && prompt.trim().length >= 3) {
    const relevantResult = await searchDocuments(prompt, groupJid);
    if (relevantResult.fatos.length) {
      contextoFatos = `Contexto extraído dos fatos:\n${relevantResult.fatos.map((f: string, i: number) => `Fato ${i + 1}: ${f}`).join('\n')}`;
      if (relevantResult.participantNames && relevantResult.participantNames.length) {
        contextoFatos += `\nParticipantes do grupo:\n${relevantResult.participantNames.join(', ')}`;
      }
    }
  }

  try {
    const systemMessages = [
      { role: 'system', content: systemInstructions },
    ];
    if (contextoFatos && contextoFatos.length > 0 && secured) {
      systemMessages.push({ role: 'assistant', content: contextoFatos });
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