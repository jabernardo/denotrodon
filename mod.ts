export type CommandAction = () => any;
export interface CommandList {
  [key: string]: Command;
}

export interface Option {
  [name: string]: string;
}

export interface Options {
  [key: string]: string;
}

export interface Flags {
  [key: string]: boolean;
}

export class Denotrodon {
  private name: string = "Denotrodon Application";
  private version: string = "0.1";
  private author: string = "Unknown";
  private commandActive: string = "default";
  private commandDefault: string = "default";
  private commands: CommandList = {};
  private arguments: string[] = [];
  private options: Options = {};
  private flags: Flags = {};

  private _getOptions(): Options {
    const options: Options = {};
    const optionsPattern: RegExp = /^--(\S+)=(.*)/i;
    let tempArgs: string[] = [];

    this.arguments.forEach((param) => {
      let results: RegExpExecArray | null = optionsPattern.exec(param);

      if (results) {
        let [str, key, val] = results;

        options[key.toLowerCase()] = val;

        return true;
      }

      tempArgs.push(param);
    });

    this.arguments = tempArgs;

    return options;
  }

  private _getFlags(): Flags {
    const flags: Flags = {};
    const flagsPattern: RegExp = /^-(\S+)/i;
    let tempArgs: string[] = [];

    this.arguments.forEach((param) => {
      let results: RegExpExecArray | null = flagsPattern.exec(param);

      if (results) {
        let [str, val] = results;

        flags[val] = true;

        return true;
      }

      tempArgs.push(param);
    });

    this.arguments = tempArgs;

    return flags;
  }

  private async _runActive(): Promise<void> {
    const command = this.commands[this.commandActive];

    if (command) {
      await command.exec(this);
    }
  }

  public has(flagName: string, defaultVal: boolean = false): boolean {
    return this.flags[flagName] || defaultVal;
  }

  public option(optionName: string, defaultVal: any = null): any {
    return this.options[optionName] || defaultVal;
  }

  run() {
    this.arguments = Array.from(Deno.args);
    this.commandActive = this.commandDefault;

    if (this.arguments.length && this.commands[this.arguments[0]]) {
      this.commandActive = this.arguments[0];
      this.arguments.shift();
    }

    this.options = this._getOptions();
    this.flags = this._getFlags();

    console.log(this.commandActive, this.arguments, this.options, this.flags);

    this._runActive();
  }

  command(name: string, c: Command) {
    if (this.commands[name.toLowerCase()]) {
      throw new Error("Command already exists.");
    }

    this.commands[name] = c;
  }
}

export class Command {
  optionsExpected: Option[] = [];
  action: CommandAction;

  constructor(action: CommandAction) {
    this.action = action;
  }

  expects(option: Option): Command {
    this.optionsExpected.push(option);
    return this;
  }

  private checkExpectations(app: Denotrodon) {
    this.optionsExpected.forEach((option) => {
      Object.keys(option).forEach((key) => {
        if (!app.option(key)) {
          console.error(`Option "${key}" as "${option[key]}" expected.`);
          Deno.exit(2);
        }
      });
    });
  }

  async exec(app: Denotrodon) {
    this.checkExpectations(app);

    await this.action();
  }
}

const app: Denotrodon = new Denotrodon();

app.command(
  "test",
  new Command(function() {
    console.log("hello", app.has("q"));
  })
    .expects({ "name": "Username", "age": "Age" }),
);

app.run();


console.log(app);