import { Denotrodon, Command } from "../mod.ts";

const app: Denotrodon = new Denotrodon();

/**
 * Default command
 *
 * @type {Command}
 *
 * @run
 *  deno run .\example\app.ts test -q -n John -n Aldrich
 *
 */
const commandDefault = new Command(function (this: Denotrodon) {
  console.log("Welcome to Denotrodon!\n");
})
  .describe("Home screen");

/**
 * Stack Parameters
 *
 * @type {Command}
 *
 * @run
 *  deno run .\example\app.ts test -q --name=John -n Aldrich -m "Hello Deno!"
 *
 * @output
 *  { name: [ "John", "Aldrich" ], quiet: true }
 */
const commandTest = new Command(function (this: Denotrodon) {
  console.log(this.options);
})
  .describe("Test command")
  .expects({ name: "msg", flag: "m", desc: "Message" })
  .expects({ name: "name", flag: "n", desc: "User name", type: "array" })
  .optional(
    {
      name: "quiet",
      flag: "q",
      type: "boolean",
      desc: "Be quiet",
      default: false,
    },
  );

/**
 * Async Test Command
 *
 * @type {Command}
 *
 * @run
 *  deno run --allow-net .\example\app.ts async
 *
 * @output
 *  {...}
 *
 */
const commandAsync = new Command(async function (this: Denotrodon) {
  let data = await fetch(
    "https://hacker-news.firebaseio.com/v0/item/2921983.json?print=pretty",
  );
  let json = await data.json();
  console.log(json);
})
  .describe("Async test");

app.command("default", commandDefault);
app.command("test", commandTest);
app.command("async", commandAsync);

await app.run();
