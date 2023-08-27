import axios from "axios";
import { DangerError } from "../errors/DangerError";

export default async function (content: string, token: string) {
  if (!content) throw new DangerError("Você precisa me perguntar algo!");
  if (!token) throw new DangerError("Você precisa me enviar um token!");

  const { data } = await axios.post(
    `https://api.openai.com/v1/chat/completions`,
    {
      messages: [{ role: "user", content }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return data.choices[0].message.content;
}
