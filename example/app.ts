import { Denotrodon, Command } from "../mod.ts";

const app: Denotrodon = new Denotrodon();

/**
 * Default command
 *
 * @run
 *  deno run .\example\app.ts test -q -n John -n Aldrich
 *
 */
const commandDefault = new Command(function (this: Denotrodon) {
  console.log(this);
})
  .describe("Home screen");

/**
 * Stack Parameters
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

app.command("default", commandDefault);
app.command("test", commandTest);

await app.run();
