import { Denotrodon, Command } from "./mod.ts";
import { assertEquals } from "./deps.ts";

const app = new Denotrodon("Denotrodon", "v1", "John");

const command = new Command(function(this: Denotrodon) {
  return "Hello World!";
}).describe("Sample Command");

Deno.test("[app: test]", async function appTest(): Promise<void> {
  assertEquals(app.name, "Denotrodon");
  assertEquals(app.version, "v1");
  assertEquals(app.author, "John");
});

Deno.test("[command: test]", async function commandTest(): Promise<void> {
  assertEquals(command.description, "Sample Command");
  assertEquals(await command.exec(app), "Hello World!");
});
