// Version: $Id:  $
// 
// 

// Commentary:
// 
// 

// Changelog:
// 
// 

// 
// Code starts here
// /////////////////////////////////////////////////////////////////////////////

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const regenerateCommand = vscode.commands.registerCommand('codet.regenerate', async () => {
        vscode.window.showInformationMessage(
            'Dynamic theme generation is not available in VS Code for the web. ' +
            'Theme files are pre-generated and included with the extension.',
            'OK'
        );
    });

    const configChangeListener = vscode.workspace.onDidChangeConfiguration(async (event) => {
        if (event.affectsConfiguration('codet.accent')) {
            const config = vscode.workspace.getConfiguration('codet');
            const accentColor = config.get<string>('accent', '#A68AF9');

            vscode.window.showInformationMessage(
                `Accent color changed to ${accentColor}. ` +
                'In VS Code for the web, themes cannot be dynamically regenerated. ' +
                'The default theme files will be used.',
                'OK'
            );
        }
    });

    context.subscriptions.push(regenerateCommand);
    context.subscriptions.push(configChangeListener);
}

export function deactivate() {

}

// /////////////////////////////////////////////////////////////////////////////
// Code ends here
