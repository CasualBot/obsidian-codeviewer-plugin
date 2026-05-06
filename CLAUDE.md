# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build                                      # production bundle → main.js
npm run dev                                        # esbuild watch mode (inline sourcemaps)
npm run typecheck                                  # tsc --noEmit, strict
VAULT_PATH="/path/to/vault" npm run install-to-vault   # copy manifest.json/main.js/styles.css to <vault>/.obsidian/plugins/code-view/
```

There is no test suite and no linter wired up. Type errors are the only static check — run `npm run typecheck` before considering work done.

## Commits

Do not add `Co-Authored-By` trailers to commit messages.

After installing into a vault, Obsidian must **Reload plugins** (or Ctrl+R) to pick up changes. Settings changes that touch the extension list also require a full Obsidian reload — see "Extension registration" below.

## Architecture

**Single-plugin Obsidian extension.** All plugin logic lives in `src/main.ts`; Prism language registration is isolated in `src/prism.ts`. esbuild bundles them into a single CommonJS `main.js` at the repo root, alongside the hand-written `manifest.json` and `styles.css` — those three files together are the plugin artifact Obsidian loads.

### `src/main.ts` — three concerns in one file

1. **`CodeViewPlugin`** (default export, extends `Plugin`) — owns settings load/save and registers the custom view + file extensions on `onload`.
2. **`CodeView`** (extends `TextFileView`) — the read-only renderer. Receives file content via `setViewData`, splits on `\n`, optionally renders a line-number gutter, then runs `Prism.highlight` against the grammar resolved by `EXT_TO_LANG`. Files larger than `maxFileSizeKb` show a warning instead of rendering (Prism is expensive on large input).
3. **`CodeViewSettingTab`** — the settings UI.

The extension → Prism-language mapping (`EXT_TO_LANG`) and the user-configurable extension list (`DEFAULT_SETTINGS.extensions`) are **two separate sources of truth**. Adding a new language requires updating both, plus importing its Prism component in `src/prism.ts`.

### `src/prism.ts` — bundled grammars

Prism components are imported for their side effects (they self-register on the global `Prism` object). **Import order matters**: components that extend others must come after their base — `cpp` after `c`, `tsx` after `typescript`+`jsx`, etc. The file groups imports by family with comments noting the dependency chain.

GDScript has no upstream Prism grammar. It's hand-extended from `prism-python` at the bottom of the file with GDScript's keyword and builtin sets — good enough for a read-only browse view, not a full grammar.

### Two non-obvious constraints

- **Extension registration is one-shot.** Obsidian's public API exposes `registerExtensions` but no unregister hook, so a settings change to the extension list cannot be applied live. `notifyReloadRequired()` surfaces a Notice prompting the user to reload. Don't try to "fix" this by tearing down and re-registering — the API isn't there.
- **Conflicts are per-extension, not all-or-nothing.** `registerExtensionsSafe` registers each extension in its own try/catch so that one conflict (e.g. core or another plugin already claims `.html`) doesn't skip every later extension in the list. Failed extensions are logged with `console.warn`, not surfaced to the user.

### Build pipeline

`esbuild.config.mts` bundles `src/main.ts` to `main.js` (CJS, ES2020, browser platform). `obsidian` and `electron` are marked external — they're provided by the host. Production builds drop sourcemaps; dev mode uses inline sourcemaps and watch.

`scripts/install-to-vault.mts` is a thin copy script — it reads `VAULT_PATH`, ensures `<vault>/.obsidian/plugins/code-view/` exists, and copies the three artifact files. It does not run the build; run `npm run build` first (or run it after `npm run dev` has produced an artifact).
