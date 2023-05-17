// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { QdrantClient } from "@qdrant/js-client-rest";
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { createTextFragment } from "../../utils/text-fragment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const question = req.body.question;

  const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY! })
  );

  const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  const documents = await qdrant.search("content", {
    vector: await openai
      .createEmbedding({
        input: question,
        model: "text-embedding-ada-002",
      })
      .then((embedding) => embedding.data.data[0].embedding),
    limit: 4,
  });

  const response = await openai.createChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "Du är en chattbot som ger svar på internetstiftelsens rapport om hur svenskarna använder internet. Svara alltid i markdown-format.",
      },
      {
        role: "user",
        content: `
          Använd källorna här för att svara på frågan:

          ${documents.map((doc) => doc.payload!.content).join("\n\n")}

          Fråga: ${question}
          `,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  const answer = response.data.choices[0].message?.content;

  const sources = documents.map((doc) => {
    return {
      title: doc.payload!.title,
      content: doc.payload!.chunk,
      url: `${doc.payload!.url}${createTextFragment(
        doc.payload!.title as string
      )}`,
    };
  });

  res.status(200).json({
    answer,
    sources,
  });
}
