import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: "/home/user/football/site/tina/__generated__/.cache/1791269222070", url: "http://localhost:4001/graphql", token: "undefined", queries,  });
export default client;
  