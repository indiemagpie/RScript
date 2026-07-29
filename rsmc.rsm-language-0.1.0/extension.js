const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const DECL_KEYWORDS = [
    'dialogAnswer', 'dialogMsg', 'dialog', 'state', 'star', 'planet',
    'group', 'place', 'item', 'ether', 'constellation', 'globalVar', 'localVar'
];

const DECL_RE = new RegExp(
    '\\b(' + DECL_KEYWORDS.join('|') + ')\\s*\\(\\s*"((?:[^"\\\\]|\\\\.)*)"',
    'g'
);

async function collectRsmUris(currentUri) {
    const seen = new Set([currentUri.fsPath]);
    const uris = [currentUri];

    try {
        const found = await vscode.workspace.findFiles('**/*.rsm', '**/node_modules/**');
        for (const uri of found) {
            if (!seen.has(uri.fsPath)) {
                seen.add(uri.fsPath);
                uris.push(uri);
            }
        }
    } catch (e) {
        console.error('rsm-language: workspace.findFiles failed', e);
    }

    try {
        const dir = path.dirname(currentUri.fsPath);
        const entries = await fs.promises.readdir(dir);
        for (const entry of entries) {
            if (!entry.toLowerCase().endsWith('.rsm')) continue;
            const fp = path.join(dir, entry);
            if (!seen.has(fp)) {
                seen.add(fp);
                uris.push(vscode.Uri.file(fp));
            }
        }
    } catch (e) {
        console.error('rsm-language: directory scan failed', e);
    }

    return uris;
}

class RsmDefinitionProvider {
    async provideDefinition(document, position) {
        const wordRange = document.getWordRangeAtPosition(position, /[A-Za-z_][A-Za-z0-9_]*/);
        if (!wordRange) return undefined;
        const name = document.getText(wordRange);
        if (!name) return undefined;

        const locations = [];
        const uris = await collectRsmUris(document.uri);
        for (const uri of uris) {
            let doc;
            try {
                doc = uri.fsPath === document.uri.fsPath ? document : await vscode.workspace.openTextDocument(uri);
            } catch (e) {
                console.error('rsm-language: could not open', uri.fsPath, e);
                continue;
            }
            const text = doc.getText();
            DECL_RE.lastIndex = 0;
            let m;
            while ((m = DECL_RE.exec(text)) !== null) {
                if (m[2] === name) {
                    const start = doc.positionAt(m.index);
                    const end = doc.positionAt(m.index + m[0].length);
                    locations.push(new vscode.Location(uri, new vscode.Range(start, end)));
                }
            }
        }
        return locations.length > 0 ? locations : undefined;
    }
}

function activate(context) {
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider({ language: 'rsm' }, new RsmDefinitionProvider())
    );
}

function deactivate() {}

module.exports = { activate, deactivate };
