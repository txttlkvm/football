import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ url: "http://localhost:4102/graphql", token: "undefined", queries,  });
export default client;
  