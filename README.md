# Code View

Obsidian plugin that opens source files (`py`, `ps1`, `sh`, `ts`, `cs`, `sql`, `yml`, etc.) directly inside Obsidian with Prism syntax highlighting.

## Why this exists

This plugin was built for people who want a code viewer in Obsidian but cannot or will not trust community plugins they haven't read end-to-end. The repo is small enough to audit in a single sitting, self-hostable, and installs by copying three files into your vault — no marketplace, no auto-updates, no opaque dependencies beyond Prism.

**All rendering is read-only.** Files are loaded as text, tokenized by Prism, and inserted into the DOM as syntax-highlighted markup. The plugin never executes the file contents — opening a `.ps1`, `.sh`, `.py`, or any other extension does not run it. There is no `eval`, no shell-out, no process spawn, and no network call in the rendering path.

## Install

### From source

Requires Node.js 20+.

```bash
git clone https://github.com/ShawnAtActivate/obisidian-codeview-plugin.git
cd obisidian-codeview-plugin
npm install
npm run build
```

This produces `main.js`, `manifest.json`, and `styles.css` at the project root.

### Copy into a vault

Use the bundled installer — point `VAULT_PATH` at your vault's root directory:

```bash
VAULT_PATH="/path/to/your/vault" npm run install-to-vault
```

The script copies the build artifacts to `<vault>/.obsidian/plugins/code-view/`.

To install manually instead, create that folder and copy `manifest.json`, `main.js`, and `styles.css` into it.

### Enable in Obsidian

1. Open Obsidian → **Settings** → **Community plugins**
2. Turn off **Restricted mode** if it's on
3. Click **Reload plugins**, then enable **Code View**

## Develop

```bash
npm run dev         # esbuild watch mode
npm run typecheck   # tsc --noEmit
```

Re-run `npm run install-to-vault` (or rebuild and copy) after changes, then **Reload plugins** in Obsidian to pick them up.

## Configure

In **Settings → Code View** you can adjust:

- **Extensions** — comma-separated list of file extensions the plugin should claim
- **Show line numbers**
- **Max file size (KB)** — files larger than this are skipped
