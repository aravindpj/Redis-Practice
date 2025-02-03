import { intilizeRedisClient } from "../utils/client.js";
import { bloomKey } from "../utils/key.js";


async function createBloomFilter() {
  const client = await intilizeRedisClient();
  await Promise.all([
    client.del(bloomKey),
    client.bf.reserve(bloomKey, 0.0001, 1000000),
  ]);
}

await createBloomFilter();
process.exit();