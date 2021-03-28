import * as vscode from "vscode";

import { Command, CommandFlags, InputKind, registerCommand } from ".";
import { getMenu, executeMenuItem } from "./goto";


// TODO: Do not record this command.
registerCommand(
  Command.view,
  CommandFlags.None,
  InputKind.ListOneItemOrCount,
  getMenu("view"),
  (editorState, state) => {
    console.log('hello');
    if (state.input !== null) {
      return executeMenuItem(editorState, "view", state.input);
    } else {
      return;
    }
  },
);

async function viewToCenter() {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) { return; }
  let currentLineNumber = activeEditor.selection.start.line;
  await vscode.commands.executeCommand("revealLine", {
    lineNumber: currentLineNumber,
    at: "center"
  });
}

registerCommand(
  Command.viewCenter,
  CommandFlags.None,
  viewToCenter,
);