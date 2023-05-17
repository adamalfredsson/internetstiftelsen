import { QdrantClient } from "@qdrant/js-client-rest";
import fs from "fs/promises";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Configuration, OpenAIApi } from "openai";
import { join } from "path";

const main = async () => {
  const storagePath = join(__dirname, "../../storage/datasets/default");
  const fileNames = await fs.readdir(storagePath);

  const fileContents = await Promise.all(
    fileNames.map(async (fileName) => {
      const file = await fs.readFile(join(storagePath, fileName));
      return JSON.parse(file.toString()) as unknown;
    })
  );

  // splitta upp i chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  // göra vektorer
  const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY! })
  );

  const data = await Promise.all(
    fileContents.slice(0, 5).map(async (page: any, index) => {
      const chunks = await splitter.splitText(page.content);

      return Promise.all(
        chunks.map(async (chunk) => {
          const embedding = await openai.createEmbedding({
            input: chunk,
            model: "text-embedding-ada-002",
          });
          return {
            vector: embedding.data.data[0].embedding, // ...,
            payload: {
              url: page.url,
              title: page.title,
              chunk,
            },
          };
        })
      );
    })
  );

  // ladda upp vektordatabasen
  const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  const result = await qdrant.upsert("content", {
    points: data.flat().map(({ vector, payload }, index) => ({
      id: index,
      vector,
      payload,
    })),
  });

  console.log(result);
};

void main();
