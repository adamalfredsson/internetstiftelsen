import { QdrantClient } from "@qdrant/js-client-rest";

const main = async () => {
  // ladda upp vektordatabasen
  const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  const result = await qdrant.recreateCollection("content", {
    vectors: {
      size: 1536,
      distance: "Cosine",
    },
  });

  console.log(result);
};

void main();
