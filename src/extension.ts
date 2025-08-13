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
import { generateThemes } from './generator';

export function activate(context: vscode.ExtensionContext) {

    const regenerateCommand = vscode.commands.registerCommand('codet.regenerate', async () => {
        try {
            const config = vscode.workspace.getConfiguration('codet');
            const accentColor = config.get<string>('accent', '#A68AF9');

            vscode.window.showInformationMessage('Regenerating themes...');
            generateThemes(accentColor);

            const reload = await vscode.window.showInformationMessage(
                'Themes regenerated successfully! Reload VS Code to apply changes?',
                'Reload',
                'Later'
            );

            if (reload === 'Reload') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to regenerate themes: ${error}`);
        }
    });

    const configChangeListener = vscode.workspace.onDidChangeConfiguration(async (event) => {
        if (event.affectsConfiguration('codet.accent')) {
            const config = vscode.workspace.getConfiguration('codet');
            const accentColor = config.get<string>('accent', '#A68AF9');

            try {
                generateThemes(accentColor);

                const reload = await vscode.window.showInformationMessage(
                    `Accent color changed to ${accentColor}. Themes regenerated!`,
                    'Reload VS Code',
                    'Later'
                );

                if (reload === 'Reload VS Code') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to regenerate themes: ${error}`);
            }
        }
    });

    const config = vscode.workspace.getConfiguration('codet');
    const accentColor = config.get<string>('accent', '#A68AF9');

    try {
        generateThemes(accentColor);
    } catch (error) {
        console.error('Failed to generate themes on activation:', error);
    }

    context.subscriptions.push(regenerateCommand);
    context.subscriptions.push(configChangeListener);
}

export function deactivate() {

}

// /////////////////////////////////////////////////////////////////////////////
// Code ends here
