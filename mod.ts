export interface CommandList {
  [key: string]: Command;
}

export interface Option {
  name: string;
  desc?: string;
  val?: any;
  flag?: string;
  default?: any;
  type?: string;
  stack?: boolean;
  required?: boolean;
}

export interface OptionValue {
  [n: string]: any;
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
  private _options: OptionValue = {};

  private _inArgs(opt: Option): Option {
    const optionsPattern: RegExp = new RegExp(`^--${opt.name}=(.*)`);
    const flagsPattern: RegExp = new RegExp(`^-${opt?.flag || ""}`);

    let flagActive: Option | null = null;

    this._arguments.forEach((param) => {
      if (flagActive) {
        flagActive.val = param;
        flagActive = null;
        return true;
      }

      let resOptions: RegExpExecArray | null = optionsPattern.exec(param);

      if (resOptions) {
        let [str, val] = resOptions;

        opt.val = val;
        return true;
      }

      let resFlag: RegExpExecArray | null = flagsPattern.exec(param);

      if (resFlag && opt.type === "boolean") {
        opt.val = true;
        return true;
      }

      if (resFlag) {
        flagActive = opt;
        return true;
      }
    });

    if (typeof opt.val === "undefined") {
      opt.val = opt.type === "boolean" ? false : opt?.default || undefined;
    }

    return opt;
  }

  private _parseArgs(configuredOptions: Option[]) {
    configuredOptions.forEach(param => {
      let option: Option = this._inArgs(param);

      if (typeof option.val !== "undefined") {
        this._options[option.name] = option.val;

        return true;
      }

      if (option.required) {
        console.error(`Expects "${option.name}" as parameter.`);
        Deno.exit(2);
      }
    });
  }

  read(configuredOptions: Option[]): Denotrodon {
    this._parseArgs(configuredOptions);

    return this;
  }

  private async _runActive(): Promise<void> {
    const command = this._commands[this._commandActive];

    if (command) {
      await command.exec(this);
    }
  }

  // public option(optionName: string, defaultVal: any = null): any {
  //   return this._options[optionName] || defaultVal;
  // }

  get options(): OptionValue {
    return this._options;
  }

  async run() {
    this._arguments = Array.from(Deno.args);
    this._commandActive = this._commandDefault;

    if (this._arguments.length && this._commands[this._arguments[0]]) {
      this._commandActive = this._arguments[0];
      this._arguments.shift();
    }

    // this._options = this._parseArgs();
    // this._flags = this._getFlags();

    // console.log(this.commandActive, this.arguments, this.options, this.flags);

    await this._runActive();
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
    option.required = true;

    this.optionsExpected.push(option);
    return this;
  }

  finds(option: Option): Command {
    option.required = false;

    this.optionsExpected.push(option);
    return this;
  }

  async exec(app: Denotrodon) {
    await this.action.bind(app.read(this.optionsExpected))();
  }
}

const app: Denotrodon = new Denotrodon();

app.command(
  "test",
  new Command(function(this: Denotrodon) {
    console.log(this.options);
    // console.log("hello", app.has("q"));
  })
    .expects({ name: "name", flag: "n", desc: "User name" })
    .finds({ name: "quiet", flag: "q", type: "boolean", desc: "Be quiet" })
);

await app.run();
