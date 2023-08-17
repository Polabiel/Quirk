import axios from "axios";
import { general } from "../configuration/general";
import { DangerError } from "../errors/DangerError";

export default async function(content: string) {
  if (!general.OPENAI_API_KEY) {
    throw new DangerError(
      "É necessário configurar a variável de ambiente OPENAI_API_KEY com o seu token da OpenAI"
    );
  }

  const { data } = await axios.post(
    `https://api.openai.com/v1/chat/completions`,
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${general.OPENAI_API_KEY}`,
      },
    }
  );

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return data.choices[0].message.content;
};
