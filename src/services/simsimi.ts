import axios from "axios";

export default async function (args: string) {
  const text = args;
  const simsimiUrl: string = "https://api.simsimi.vn/v2/simtalk"

  const requestBody = new URLSearchParams({
    text: text,
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

    return response?.data?.message;
  } catch (error: any) {
    if (error.response && error.response.status === 411) {
      return error?.response?.data?.message;
    }
    console.error(error);
    throw new Error(error);
  }
}
