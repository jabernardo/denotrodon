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

app.command("test", commandTest);

await app.run();

```

## Auto Generated Help Screen

### Top Level Help
```sh
$ deno run ./example/app.ts help

Denotrodon Application 0.1
by Unknown

default    Home screen
test       Test command
async      Async test
help
```

### Command Specific Help
```sh
$ deno run --allow-net ./example/app.ts help test

Test command

--msg      -m        Message (Required)
--name     -n        User name (Required)
--quiet    -q        Be quiet
```

## TODO

- [x] Default command
- [x] Extra arguments check
- [x] Help generator for specific command `app help command`
- [x] Clean-up
- [ ] Command completion on Bash
- [ ] Test files
