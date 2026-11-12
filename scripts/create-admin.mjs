#!/usr/bin/env node
/**
 * Creates the administrator credentials for Jain Classes.
 *   npm run admin:create
 * Prints ADMIN_PASSWORD_HASH (Argon2id) and a fresh AUTH_SECRET.
 * The password itself is never stored anywhere.
 */
import { randomBytes } from "node:crypto";
import readline from "node:readline";
import { argon2id } from "hash-wasm";

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (text) => {
        if (text.includes(question)) rl.output.write(text);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const fromEnv = process.env.ADMIN_PASSWORD; // optional, for non-interactive use
const password = fromEnv ?? (await ask("Choose an admin password (min 12 characters): ", true));
if (typeof password !== "string" || password.length < 12) {
  console.error("Password must be at least 12 characters long.");
  process.exit(1);
}
if (!fromEnv) {
  const again = await ask("Type the password again: ", true);
  if (again !== password) {
    console.error("The passwords do not match.");
    process.exit(1);
  }
}

// OWASP-recommended Argon2id parameters: 19 MiB memory, 2 iterations, 1 lane.
const hash = await argon2id({
  password,
  salt: randomBytes(16),
  parallelism: 1,
  iterations: 2,
  memorySize: 19456,
  hashLength: 32,
  outputType: "encoded",
});

console.log("\nAdd these to .env.local (local) and to Vercel > Settings > Environment Variables:\n");
console.log(`ADMIN_PASSWORD_HASH=b64:${Buffer.from(hash).toString("base64")}`);
console.log(`AUTH_SECRET=${randomBytes(32).toString("base64")}`);
console.log("\nKeep both values private. Run this script again any time to change the password.");
