# Code View

Obsidian plugin that provides **read-only** syntax-highlighted viewing for the most common development and developer-centric file types — `py`, `ps1`, `sh`, `ts`, `cs`, `sql`, `yml`, and many more. Never executes file contents.

The goal is to make developer files first-class citizens inside an Obsidian vault. A common use case is storing AI agent harness files — prompts, tool configs, `CLAUDE.md` instructions, memory files, and similar artifacts — directly in your vault so they're browsable, searchable, and linkable alongside your notes. Any plain-text source file you'd normally only open in an editor can instead be read from within Obsidian without leaving your knowledge base.

End users install through Obsidian's **Settings → Community plugins → Browse**, or download the artifacts from the [latest GitHub release](https://github.com/CasualBot/obsidian-codeviewer-plugin/releases/latest).

## Repo layout

- `src/main.ts` — plugin entry: `CodeViewPlugin`, `CodeView` (extends `TextFileView`), `CodeViewSettingTab`. Render path uses `Prism.tokenize` + a DOM walker (no `innerHTML`).
- `src/prism.ts` — Prism component imports + GDScript grammar extension. Import order matters — components that extend others must load after their bases.
- `styles.css` — token classes (`.token.comment`, `.token.keyword`, …) mapped to Obsidian CSS variables.
- `manifest.json`, `versions.json` — kept in lockstep by `scripts/version-bump.mts` (run automatically by `npm version`).
- `.github/workflows/release.yml` — manual `workflow_dispatch` release workflow, gated to `CasualBot`.

See [`CLAUDE.md`](./CLAUDE.md) for the architectural details, non-obvious constraints, and release-flow internals.

## Develop

Requires Node.js 20+.

```bash
npm install
npm run dev         # esbuild watch mode (inline sourcemaps)
npm run typecheck   # tsc --noEmit (only static check)
npm run build       # production bundle → main.js
```

Sideload a build into a test vault:

```bash
VAULT_PATH="/path/to/your/vault" npm run install-to-vault
```

This copies `manifest.json`, `main.js`, and `styles.css` to `<vault>/.obsidian/plugins/code-view/`. After each rebuild, **Reload plugins** in Obsidian (or Ctrl+R) to pick up changes.

## Release

Releases are produced exclusively by the **Release Obsidian plugin** workflow (Actions tab → Run workflow → choose `patch | minor | major`). The workflow bumps the version, syncs `manifest.json` + `versions.json` via the `version` lifecycle hook, builds, tags (no `v` prefix — Obsidian rejects it), and publishes a GitHub release with `main.js` + `manifest.json` + `styles.css` attached.

Never edit the version in `manifest.json`, `versions.json`, or `package.json` by hand — always go through `npm version` (or the workflow).

---

## Obsidian developer policy compliance

This plugin complies with all [Obsidian developer policies](https://docs.obsidian.md/Developer+policies):

- **No network use.** The plugin operates entirely offline. No data leaves the device.
- **No telemetry.** No client-side or server-side analytics of any kind.
- **No payment or account required.** Fully free and open source under the MIT license.
- **No ads.** No banners, pop-ups, or any promotional content.
- **No obfuscation.** Source is published in full.
- **No self-update mechanism.** Updates are distributed exclusively through the Obsidian community plugin directory and GitHub releases.
- **License file included.** See [`LICENSE`](./LICENSE) (MIT).
- **Third-party attribution.** Syntax highlighting is provided by [Prism.js](https://prismjs.com/) (MIT License, Copyright © 2012 Lea Verou), bundled in `main.js` per its license terms.
