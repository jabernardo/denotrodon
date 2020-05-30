# Denotrodon

Bare Minimum Command-Line (CLI) Application Skeleton

## Example

```ts
import { Denotrodon, Command } from "../mod.ts";

const app: Denotrodon = new Denotrodon();

/**
 * Stack Parameters
 *
 * @run
 *  deno run .\example\app.ts test -q --name=John -n Aldrich
 *
 * @output
 *  { name: [ "John", "Aldrich" ], quiet: true }
 */
const commandTest = new Command(function (this: Denotrodon) {
  console.log(this.options);
})
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

app.command("test", commandTest);

await app.run();

```

## TODO

- [ ] Default command
- [ ] Extra arguments check
- [ ] Help generator for specific command `app help command`
