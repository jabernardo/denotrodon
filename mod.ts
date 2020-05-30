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

export type CommandAction = () => any;

export class Denotrodon {
  private _name: string = "Denotrodon Application";
  private _version: string = "0.1";
  private _author: string = "Unknown";
  private _commandActive: string = "default";
  private _commandDefault: string = "default";
  private _commands: CommandList = {};
  private _arguments: string[] = [];
  private _options: Options = {};
  private _flags: Flags = {};

  private _getOptions(): Options {
    const options: Options = {};
    const optionsPattern: RegExp = /^--(\S+)=(.*)/i;
    let tempArgs: string[] = [];

    this._arguments.forEach((param) => {
      let results: RegExpExecArray | null = optionsPattern.exec(param);

      if (results) {
        let [str, key, val] = results;

        options[key.toLowerCase()] = val;

        return true;
      }

      tempArgs.push(param);
    });

    this._arguments = tempArgs;

    return options;
  }

  private _getFlags(): Flags {
    const flags: Flags = {};
    const flagsPattern: RegExp = /^-(\S+)/i;
    let tempArgs: string[] = [];

    this._arguments.forEach((param) => {
      let results: RegExpExecArray | null = flagsPattern.exec(param);

      if (results) {
        let [str, val] = results;

        flags[val] = true;

        return true;
      }

      tempArgs.push(param);
    });

    this._arguments = tempArgs;

    return flags;
  }

  private async _runActive(): Promise<void> {
    const command = this._commands[this._commandActive];

    if (command) {
      await command.exec(this);
    }
  }

  public has(flagName: string, defaultVal: boolean = false): boolean {
    return this._flags[flagName] || defaultVal;
  }

  public option(optionName: string, defaultVal: any = null): any {
    return this._options[optionName] || defaultVal;
  }

  get options(): Options {
    return this._options;
  }

  get flags(): Flags {
    return this._flags;
  }

  run() {
    this._arguments = Array.from(Deno.args);
    this._commandActive = this._commandDefault;

    if (this._arguments.length && this._commands[this._arguments[0]]) {
      this._commandActive = this._arguments[0];
      this._arguments.shift();
    }

    this._options = this._getOptions();
    this._flags = this._getFlags();

    // console.log(this.commandActive, this.arguments, this.options, this.flags);

    this._runActive();
  }

  command(name: string, c: Command) {
    if (this._commands[name.toLowerCase()]) {
      throw new Error("Command already exists.");
    }

    this._commands[name] = c;
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

  private checkExpectations(options: Options) {
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
    this.checkExpectations(app.options);

    await this.action.bind(app)();
  }
}

const app: Denotrodon = new Denotrodon();

app.command(
  "test",
  new Command(function(this: Denotrodon) {
    console.log(this.options);
    // console.log("hello", app.has("q"));
  })
    .expects({ "name": "Username", "age": "Age" }),
);

app.run();
