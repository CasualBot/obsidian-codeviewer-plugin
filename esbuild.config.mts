import esbuild, { type BuildOptions } from "esbuild";

const prod: boolean = process.argv[2] === "production";

const options: BuildOptions = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian", "electron"],
  format: "cjs",
  target: "es2020",
  platform: "browser",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
};

const ctx = await esbuild.context(options);

if (prod) {
  await ctx.rebuild();
  await ctx.dispose();
} else {
  await ctx.watch();
}
