import "./deps.ts";

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
  required?: boolean;
}

export interface OptionValue {
  [n: string]: any;
}

/**
 * Command Action
 */
export type Action = () => any;

export class Denotrodon {
  private _name: string = "Denotrodon Application";
  private _version: string = "0.1";
  private _author: string = "Unknown";
  private _commandActive: string = "default";
  private _commandDefault: string = "default";
  private _commands: CommandList = {};
  private _arguments: string[] = [];
  private _options: OptionValue = {};

  /**
   * New Denotrodon Application
   *
   * @param {string}  name    Application name
   * @param {string}  version Version
   * @param {string}  author  Author
   */
  constructor(
    name: string = "Denotrodon Application",
    version: string = "0.1",
    author: string = "Unknown",
  ) {
    this._name = name;
    this._version = version;
    this._author = author;
  }

  /**
   * Stack items to array
   *
   * @param   {string|string[]}   origin  Stack
   * @param   {string}            push    Hay
   * @return  {string[]}          New stack
   */
  private _stack(origin: string | string[], push: string): string[] {
    const stack = [];

    if (Array.isArray(origin)) {
      origin.forEach((data) => {
        if (data) stack.push(data);
      });
    } else {
      if (origin) stack.push(origin);
    }

    stack.push(push);

    return stack;
  }

  /**
   * Check if option is in arguments
   *
   * @param   {Option}  opt Option
   * @return  {Option}  Detailed Option
   */
  private _inArgs(opt: Option): Option {
    const optionsPattern: RegExp = new RegExp(`^--${opt.name}=(.*)`);
    const flagsPattern: RegExp = new RegExp(`^-${opt?.flag || ""}`);

    let flagActive: Option | null = null;

    this._arguments.forEach((param) => {
      if (flagActive?.name) {
        flagActive.val = flagActive.type?.toLowerCase() === "array"
          ? this._stack(flagActive.val, param)
          : param;
        flagActive = null;

        return true;
      }

      let resOptions: RegExpExecArray | null = optionsPattern.exec(param);

      if (resOptions) {
        let [str, val] = resOptions;

        opt.val = opt.type?.toLowerCase() === "array"
          ? this._stack(opt.val, val)
          : val;

        return true;
      }

      if (opt.flag === "*") {
        opt.val = opt.type?.toLowerCase() === "array"
          ? this._stack(opt.val, param)
          : param;

        return true;
      }

      let resFlag: RegExpExecArray | null = flagsPattern.exec(param);

      if (resFlag && opt.type?.toLowerCase() === "boolean") {
        opt.val = true;
        return true;
      }

      if (resFlag) {
        flagActive = opt;
        return true;
      }
    });

    if (typeof opt.val === "undefined") {
      opt.val = opt.type?.toLowerCase() === "boolean"
        ? opt.default || false
        : opt.default || undefined;
    }

    return opt;
  }

  /**
   * Run active command
   *
   * @return {Promise<void>}
   *
   */
  private async _runActive(): Promise<void> {
    const command = this._commands[this._commandActive] ||
      this._commands["help"];

    if (command) {
      await command.exec(this);
    }
  }

  /**
   * Parse configured arguments
   *
   * @param   {option[]}  configuredOptions Configured options
   * @return  {void}
   */
  read(configuredOptions: Option[]): Denotrodon {
    configuredOptions.forEach((param) => {
      let option: Option = this._inArgs(param);

      if (typeof option.val !== "undefined") {
        this._options[option.name] = option.val;

        return true;
      }

      if (option.required) {
        console.error(
          `Expects "${option.name.yellow()}" as parameter.\n`.red(),
        );
        Deno.exit(2);
      }
    });

    return this;
  }

  /**
   * Help String
   *
   * @param   {string}  cmd   Command
   * @return  {string}
   *
   */
  help(cmd?: string): string {
    let helpScreen = `${this._name.green()} ${this._version}
by ${this._author.cyan()}

${
      Object.keys(this._commands).map((cmd) => {
        return `${cmd.padEnd(10).yellow()} ${
          this._commands[cmd].description
        }\n`;
      }).join("")
    }
    `;

    return helpScreen;
  }

  /**
   * Get options
   *
   * @return {OptionValue}
   */
  get options(): OptionValue {
    return this._options;
  }

  /**
   * Run application
   *
   * @return  {void}
   *
   */
  async run() {
    this._arguments = Array.from(Deno.args);
    this._commandActive = this._commandDefault;

    // Ensure help
    if (!this._commands["help"]) {
      this.command("help", helpCommand);
    }

    if (this._arguments.length && this._commands[this._arguments[0]]) {
      this._commandActive = this._arguments[0];
      this._arguments.shift();
    }

    await this._runActive();
  }

  /**
   * Add command
   *
   * @param   {string}  name  Command name
   * @param   {Command} c     Command Action
   * @return  {void}
   *
   */
  command(name: string, c: Command) {
    if (this._commands[name.toLowerCase()]) {
      throw new Error("Command already exists.");
    }

    this._commands[name] = c;
  }

  /**
   * Get commands
   *
   * @return {CommandList}
   *
   */
  get commands(): CommandList {
    return this._commands;
  }
}

export class Command {
  private _options: Option[] = [];
  private _action: Action;
  private _description: string = "";

  /**
   * New command
   *
   * @param {Action}  action  Command action
   */
  constructor(action: Action) {
    this._action = action;
  }

  /**
   * Get options
   *
   * @return  {Option[]}
   */
  get options(): Option[] {
    return this._options;
  }

  /**
   * Get command specific help
   *
   * @return   {string}
   *
   */
  get help(): string {
    return `${this.description.yellow()}\n\n` + this._options.map((option) => {
      let commandName = (option.flag !== "*"
        ? `--${option.name}`
        : `${option.name}...`).padEnd(10).green();
      let commandFlg = option.flag !== "*"
        ? `-${(option.flag || "").padEnd(8).green()}`
        : "";
      let commandDesc = option.desc || "";
      let commandRequired = option.required
        ? "(Required)".red()
        : "";

      return `${commandName} ${commandFlg} ${commandDesc} ${commandRequired}\n`;
    }).join("");
  }

  /**
   * Describe command
   *
   * @param   {string}  info  Command description
   * @return  {Command} Command instance
   *
   */
  describe(info: string): Command {
    this._description = info;

    return this;
  }

  /**
   * Get command description
   *
   * @return {string}
   *
   */
  get description(): string {
    return this._description;
  }

  /**
   * Add expected options
   *
   * @param   {Option|Option[]}  option   Option(s) to be added
   * @return  {Command} Command instance
   */
  expects(option: Option | Option[]): Command {
    if (Array.isArray(option)) {
      option.forEach((opt) => {
        opt.required = true;
        this._options.push(opt);
      });

      return this;
    }

    option.required = true;
    this._options.push(option);

    return this;
  }

  /**
   * Add optional options
   *
   * @param {Option|Option[]}  option   Option(s) to be added
   */
  optional(option: Option | Option[]): Command {
    if (Array.isArray(option)) {
      option.forEach((opt) => {
        opt.required = false;
        this._options.push(opt);
      });

      return this;
    }

    option.required = false;

    this._options.push(option);
    return this;
  }

  /**
   * Execute command
   *
   * @param   {Denotrodon}  app Parent application
   * @return  {void}
   */
  async exec(app: Denotrodon) {
    await this._action.bind(app.read(this._options))();
  }
}

/**
 * Help Command
 *
 * @type  {Command}
 *
 */
export const helpCommand: Command = new Command(function (this: Denotrodon) {
  if (this.options?.cmd) {
    let command = this.commands[this.options.cmd];

    if (command) {
      console.log(command.help);
    } else {
      console.error(
        `Command "${this.options.cmd.yellow()}" not found.\n`.red(),
      );
    }

    return true;
  }

  console.log(this.help());
  return true;
}).optional({ name: "cmd", flag: "*", desc: "Command" });
