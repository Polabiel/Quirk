import axios from "axios";

export default async function (content: string): Promise<string> {
  if (!content || content.length < 1) throw new Error("Invalid text");
  const simsimiUrl: string = "https://api.simsimi.vn/v2/simtalk";

  const requestBody = new URLSearchParams({
    text: content,
    lc: "pt",
    cf: false as unknown as string,
  }).toString();

  const contentLength = Buffer.byteLength(requestBody, "utf8");

  try {
    const response = await axios.post(simsimiUrl, requestBody, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": contentLength,
      },
    });

    if (!response?.data?.message) {
      throw new Error("Invalid response");
    }
    return response?.data?.message;
  } catch (error: any) {
    if (error?.response?.data?.message!) {
      return error?.response?.data?.message as string;
    }
    console.error(error);
    throw new Error(error);
  }
}
