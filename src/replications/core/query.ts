import fetch from "node-fetch";
import { readFileSync } from "fs";

export async function query(query, variables) {
  return await fetch("https://hasura.test.novitus.devticon.com/v1/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: readFileSync(`${__dirname}/../${query}.graphql`).toString(),
      variables: variables
    })
  }).then(res => res.json());
}
