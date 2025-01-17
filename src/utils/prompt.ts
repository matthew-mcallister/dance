import * as vscode from "vscode";

export function prompt(opts: vscode.InputBoxOptions, cancellationToken?: vscode.CancellationToken) {
  return vscode.window.showInputBox(opts, cancellationToken);
}

export function promptRegex(flags?: string, cancellationToken?: vscode.CancellationToken) {
  return prompt(
    {
      prompt: "Selection RegExp",
      validateInput(input: string) {
        try {
          new RegExp(input);

          return undefined;
        } catch {
          return "Invalid ECMA RegExp.";
        }
      },
    },
    cancellationToken,
  ).then((x) => x === undefined ? undefined : new RegExp(x, flags));
}

export function keypress(
  cancellationToken?: vscode.CancellationToken,
): Thenable<string | undefined> {
  return new Promise((resolve, reject) => {
    try {
      let done = false;
      const subscription = vscode.commands.registerCommand("type", ({ text }: { text: string }) => {
        if (!done) {
          subscription.dispose();
          done = true;

          resolve(text);
        }
      });

      cancellationToken?.onCancellationRequested(() => {
        if (!done) {
          subscription.dispose();
          done = true;

          resolve(undefined);
        }
      });
    } catch {
      reject(new Error("Unable to listen to keyboard events; is an extension "
                      + 'overriding the "type" command (e.g VSCodeVim)?'));
    }
  });
}

export function promptInList(
  canPickMany: true,
  items: [string, string][],
  cancellationToken?: vscode.CancellationToken,
): Thenable<undefined | number[]>;
export function promptInList(
  canPickMany: false,
  items: [string, string][],
  cancellationToken?: vscode.CancellationToken,
): Thenable<undefined | number>;

export function promptInList(
  canPickMany: boolean,
  items: [string, string][],
  cancellationToken?: vscode.CancellationToken,
): Thenable<undefined | number | number[]> {
  return new Promise<undefined | number | number[]>((resolve) => {
    const quickPick = vscode.window.createQuickPick(),
          quickPickItems = [] as vscode.QuickPickItem[];

    let isCaseSignificant = false;

    for (let i = 0; i < items.length; i++) {
      const [label, description] = items[i];

      quickPickItems.push({ label, description });
      isCaseSignificant = isCaseSignificant || label.toLowerCase() !== label;
    }

    quickPick.title = "Object";
    quickPick.items = quickPickItems;
    quickPick.placeholder = "Press one of the below keys.";
    quickPick.onDidChangeValue((key) => {
      if (!isCaseSignificant) {
        key = key.toLowerCase();
      }

      const index = items.findIndex((x) => x[0].split(", ").includes(key));

      quickPick.dispose();

      if (canPickMany) {
        resolve(index === -1 ? undefined : [index]);
      } else {
        resolve(index === -1 ? undefined : index);
      }
    });

    quickPick.onDidAccept(() => {
      let picked = quickPick.selectedItems;

      if (picked !== undefined && picked.length === 0) {
        picked = quickPick.activeItems;
      }

      quickPick.dispose();

      if (picked === undefined) {
        resolve(undefined);
      }

      if (canPickMany) {
        resolve(picked.map((x) => items.findIndex((item) => item[1] === x.description)));
      } else {
        resolve(items.findIndex((x) => x[1] === picked[0].description));
      }
    });

    cancellationToken?.onCancellationRequested(() => {
      quickPick.dispose();

      resolve(undefined);
    });

    quickPick.show();
  });
}
