import { exec } from "child_process";
import * as path from "path";
import * as fs from "fs";

export async function compile(input: string, output: string) {
  const files = fs.readdirSync(path.resolve(input));

  await new Promise((resolve, reject) => {
    const cmd = `npx -p typescript tsc "${path.resolve(
      input
    )}" --rootDir --outDir "${path.resolve(output)}"`;

    console.log(cmd);
    exec(cmd, (error) => {
      console.log(error);
      if (error) return reject(error);
      resolve();
    });
  });
}
