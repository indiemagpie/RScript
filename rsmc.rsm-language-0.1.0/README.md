# Ranger Script Module (.rsm) — VS Code syntax highlighting + go-to-definition

Grammar extension for `.rsm` format.

## Install

1. Copy this whole folder straight into your VS Code extensions directory - no renaming:
   `%USERPROFILE%\.vscode\extensions\rsmc.rsm-language-0.1.0\`
2. Fully restart VS Code (a "Reload Window" doesn't always rescan for freshly-added extension
   folders).
3. Open any `.rsm` file — it should show as "Ranger Script Module" in the language picker
   (bottom-right status bar) with highlighting, and with no JS-engine squiggles.

This is highlighting + go-to-definition, not a full language server: no diagnostics, no
autocomplete, no find-all-references, no rename.
