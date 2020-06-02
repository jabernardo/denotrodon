# Denotrodon

Bare Minimum Command-Line (CLI) Application Skeleton

## Usage

```ts

import { Denotrodon, Command } from "https://deno.land/x/denotrodon/mod.ts";

```

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

## Learn more!

### Examples

We have few examples provided, that could be found [here](https://github.com/jabernardo/denotrodon/tree/master/example).

## TODO

- [x] Default command
- [x] Extra arguments check
- [x] Help generator for specific command `app help command`
- [x] Clean-up
- [ ] Example for command
- [ ] Command completion on Bash
- [ ] Test files


## Contibuting to Denotrodon!
To contribute to Denotrodon! Make sure to give a star and forked this repository.

Alternatively see the GitHub documentation on [creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

## License
The `Denotrodon` is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
