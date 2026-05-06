#!/usr/bin/env node
/**
 * Copies built artifacts (manifest.json, main.js, styles.css) into the
 * Obsidian vault's plugins directory.
 *
 * Set the VAULT_PATH env var to your vault's root directory before running:
 *   VAULT_PATH="/path/to/your/vault" npm run install-to-vault
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

const PLUGIN_ID = "code-view";

const vaultPath: string | undefined = process.env.VAULT_PATH;

if (!vaultPath) {
  console.error("VAULT_PATH env var is not set.");
  console.error('Example: VAULT_PATH="/path/to/your/vault" npm run install-to-vault');
  process.exit(1);
}

if (!existsSync(vaultPath)) {
  console.error(`Vault path does not exist: ${vaultPath}`);
  process.exit(1);
}

const pluginsDir: string = join(vaultPath, ".obsidian", "plugins", PLUGIN_ID);
mkdirSync(pluginsDir, { recursive: true });

const FILES = ["manifest.json", "main.js", "styles.css"] as const;

for (const f of FILES) {
  const src: string = join(projectRoot, f);
  if (!existsSync(src)) {
    console.error(`Missing build artifact: ${f}. Run 'npm run build' first.`);
    process.exit(1);
  }
  const dst: string = join(pluginsDir, f);
  copyFileSync(src, dst);
  const size: number = statSync(dst).size;
  console.log(`  copied ${f} (${size} bytes)`);
}

console.log(`\nInstalled to: ${pluginsDir}`);
console.log("Enable in Obsidian: Settings → Community plugins → Code View.");
