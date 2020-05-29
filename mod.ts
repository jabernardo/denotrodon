export type Command = (app: Denotrodon) => any;
export interface CommandList {
  [key: string]: Command;
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
  private silent: boolean = false;

  private _getOptions(): Options {
    const options: Options = {};
    const optionsPattern: RegExp = /^--(\S+)=(.*)/i;
    let tempArgs: string[] = [];

    this.arguments.forEach(param => {
      let results: RegExpExecArray | null = optionsPattern.exec(param);

      if (results) {
        let [ str, key, val ] = results;

        options[key] = val;

        return true;
      }

      tempArgs.push(param);
    })

    this.arguments = tempArgs;

    return options;
  }

  private _getFlags(): Flags {
    const flags: Flags = {};
    const flagsPattern: RegExp = /^-(\S+)/i;
    let tempArgs: string[] = [];

    this.arguments.forEach(param => {
      let results: RegExpExecArray | null = flagsPattern.exec(param);

      if (results) {
        let [ str, val ] = results;

        flags[val] = true;

        return true;
      }

      tempArgs.push(param);
    })

    this.arguments = tempArgs;

    return flags;
  }

  constructor() {
    this.arguments = Array.from(Deno.args);
    this.commandActive = "default";

    if (this.arguments.length && !this.commands[this.arguments[0]]) {
      console.error("Command not found.");
      // Deno.exit(1);
    }

    this.commandActive = this.arguments[0] || "default";
    this.arguments.shift();

    this.options = this._getOptions();
    this.flags = this._getFlags();

    console.log(this.commandActive, this.arguments, this.options, this.flags);
  }
}


const app: Denotrodon = new Denotrodon();
