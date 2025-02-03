import { SchemaFieldTypes } from "redis";
import { intilizeRedisClient } from "../utils/client.js";
import { getKeyName, indexKey } from "../utils/key.js";

async function createIndex() {
  const client = await intilizeRedisClient()

  try {
    await client.ft.dropIndex(indexKey);
  } catch (err) {
    console.log("No existing index to delete");
  }

  await client.ft.create(
    indexKey,
    {
      id: {
        type: SchemaFieldTypes.TEXT,
        AS: "id",
      },
      name: {
        type: SchemaFieldTypes.TEXT,
        AS: "name",
      },
      avgStars: {
        type: SchemaFieldTypes.NUMERIC,
        AS: "avgStars",
        SORTABLE: true,
      },
    },
    {
      ON: "HASH",
      PREFIX: getKeyName("restaurants"),
    }
  );
}

await createIndex()
process.exit();