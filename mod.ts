export type Command = () => any;
export interface CommandList {
  [key: string]: Command;
}

export interface KeyVal {
  [key: string]: any;
}

export class Denotrodon {
  private name: string = "Denotrodon Application";
  private version: string = "0.1";
  private author: string = "Unknown";
  private commandDefault: string = "default";
  private commands: CommandList = {};
  private arguments: string[] = [];
  private silent: boolean = false;

  private _getOptions(): KeyVal {
    const options: KeyVal = {};
    const optionsPattern: RegExp = /^--(\S+)=(.*)/i;

    Deno.args.forEach(param => {
      let results: RegExpExecArray | null = optionsPattern.exec(param);

      if (results) {
        let [ str, key, val ] = results;

        options[key] = val;
      }
    })

    return options;
  }

  constructor() {
    this.silent = false;

    console.log(this._getOptions());
  }
}


const app: Denotrodon = new Denotrodon();
