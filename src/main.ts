import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  TextFileView,
  WorkspaceLeaf,
  Notice,
} from "obsidian";
import Prism from "./prism";

interface CodeViewSettings {
  extensions: string;
  showLineNumbers: boolean;
  maxFileSizeKb: number;
}

const DEFAULT_SETTINGS: CodeViewSettings = {
  extensions:
    "py,ps1,psm1,sh,bash,zsh,fish,ts,tsx,js,jsx,mjs,cjs,cs,cpp,cc,c,h,hpp,sql,yml,yaml,toml,rs,go,lua,gd,gdshader,bat,cmd,rb,php,pl,r,dart,kt,swift,vue,svelte,ini,conf,env,xml,html,css,scss,less,json5,jsonc,tf,tfvars,hcl,proto,graphql,gql",
  showLineNumbers: true,
  maxFileSizeKb: 2048,
};

const VIEW_TYPE_CODE = "code-view";

const EXT_TO_LANG: Record<string, string> = {
  py: "python",
  ps1: "powershell",
  psm1: "powershell",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  fish: "bash",
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  mjs: "javascript",
  cjs: "javascript",
  cs: "csharp",
  cpp: "cpp",
  cc: "cpp",
  c: "c",
  h: "c",
  hpp: "cpp",
  sql: "sql",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  rs: "rust",
  go: "go",
  lua: "lua",
  gd: "gdscript",
  gdshader: "glsl",
  bat: "batch",
  cmd: "batch",
  rb: "ruby",
  php: "php",
  pl: "perl",
  r: "r",
  dart: "dart",
  kt: "kotlin",
  swift: "swift",
  vue: "markup",
  svelte: "markup",
  ini: "ini",
  conf: "ini",
  env: "bash",
  dockerfile: "docker",
  makefile: "makefile",
  cmake: "cmake",
  xml: "markup",
  html: "markup",
  css: "css",
  scss: "scss",
  less: "less",
  json: "json",
  json5: "json5",
  jsonc: "json",
  tf: "hcl",
  tfvars: "hcl",
  hcl: "hcl",
  proto: "protobuf",
  graphql: "graphql",
  gql: "graphql",
};

function languageFor(ext: string): string {
  return EXT_TO_LANG[ext.toLowerCase()] ?? "text";
}

function parseExtensions(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[\s,]+/)) {
    const trimmed = part.trim().toLowerCase().replace(/^\./, "");
    if (!trimmed || trimmed === "md" || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

class CodeView extends TextFileView {
  private codeRoot: HTMLElement | null = null;
  private headerEl: HTMLElement | null = null;
  private plugin: CodeViewPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: CodeViewPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_CODE;
  }

  getDisplayText(): string {
    return this.file?.basename ?? "Code";
  }

  getIcon(): string {
    return "file-code-2";
  }

  getViewData(): string {
    return this.data;
  }

  setViewData(data: string, _clear: boolean): void {
    this.data = data;
    this.render();
  }

  clear(): void {
    this.data = "";
    if (this.codeRoot) this.codeRoot.empty();
  }

  async onOpen(): Promise<void> {
    this.contentEl.empty();
    this.contentEl.addClass("code-view-host");

    this.headerEl = this.contentEl.createDiv({ cls: "code-view-header" });
    this.codeRoot = this.contentEl.createDiv({ cls: "code-view-container" });
  }

  private render(): void {
    if (!this.codeRoot || !this.headerEl) return;
    this.codeRoot.empty();
    this.headerEl.empty();

    const ext = this.file?.extension ?? "txt";
    const lang = languageFor(ext);

    this.headerEl.createSpan({
      cls: "code-view-lang",
      text: `${lang} · .${ext}`,
    });
    this.headerEl.createSpan({
      cls: "code-view-readonly-badge",
      text: "read-only",
    });

    const sizeKb = (this.data?.length ?? 0) / 1024;
    if (sizeKb > this.plugin.settings.maxFileSizeKb) {
      this.codeRoot.createEl("p", {
        text: `File is ${sizeKb.toFixed(0)} KB — exceeds limit (${this.plugin.settings.maxFileSizeKb} KB). Open in an external editor or raise the limit in plugin settings.`,
      });
      return;
    }

    const wrap = this.codeRoot.createDiv({ cls: "code-view-wrap" });

    const lines = this.data.split("\n");

    if (this.plugin.settings.showLineNumbers) {
      const gutter = wrap.createDiv({ cls: "code-view-gutter" });
      const width = String(lines.length).length;
      for (let i = 1; i <= lines.length; i++) {
        gutter.createDiv({ text: String(i).padStart(width, " ") });
      }
    }

    const pre = wrap.createEl("pre", { cls: `language-${lang}` });
    const code = pre.createEl("code", { cls: `language-${lang}` });

    const grammar = Prism.languages[lang];
    if (grammar) {
      try {
        code.innerHTML = Prism.highlight(this.data, grammar, lang);
      } catch {
        console.warn(`[code-view] Prism highlighting failed for ${lang}`);
        code.textContent = this.data;
      }
    } else {
      code.textContent = this.data;
    }
  }
}

export default class CodeViewPlugin extends Plugin {
  settings: CodeViewSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_CODE,
      (leaf) => new CodeView(leaf, this),
    );

    this.registerExtensionsSafe(parseExtensions(this.settings.extensions));

    this.addSettingTab(new CodeViewSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    const loaded: Partial<CodeViewSettings> | null = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...(loaded ?? {}) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  // Register one extension at a time so a single conflict (extension already
  // claimed by core or another plugin) does not skip the rest.
  registerExtensionsSafe(exts: string[]): void {
    const failed: string[] = [];
    for (const ext of exts) {
      try {
        this.registerExtensions([ext], VIEW_TYPE_CODE);
      } catch {
        failed.push(ext);
      }
    }
    if (failed.length) {
      console.warn(
        `[code-view] could not register: ${failed.join(", ")} (already claimed by core or another plugin)`,
      );
    }
  }

  // Obsidian's public API has no unregister hook for registerExtensions, so a
  // settings change cannot be applied live — surface a reload prompt instead.
  notifyReloadRequired(): void {
    new Notice(
      "Code View: extension list changed. Reload Obsidian (Ctrl+R) to apply.",
      5000,
    );
  }
}

class CodeViewSettingTab extends PluginSettingTab {
  plugin: CodeViewPlugin;

  constructor(app: App, plugin: CodeViewPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("File extensions")
      .setDesc(
        "Comma- or whitespace-separated list of file extensions to open with Code View. Leading dots optional. Reload Obsidian after changing.",
      )
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.extensions)
          .onChange(async (value) => {
            this.plugin.settings.extensions = value;
            await this.plugin.saveSettings();
            this.plugin.notifyReloadRequired();
          });
        text.inputEl.rows = 6;
        text.inputEl.cols = 60;
      });

    new Setting(containerEl)
      .setName("Show line numbers")
      .setDesc("Render a gutter with line numbers next to the code.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showLineNumbers)
          .onChange(async (value) => {
            this.plugin.settings.showLineNumbers = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Max file size (KB)")
      .setDesc(
        "Files above this size show a warning instead of rendering. Prism highlighting is expensive on very large files.",
      )
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.maxFileSizeKb))
          .onChange(async (value) => {
            const n = Number(value);
            if (!Number.isFinite(n) || n <= 0) return;
            this.plugin.settings.maxFileSizeKb = Math.floor(n);
            await this.plugin.saveSettings();
          }),
      );
  }
}
