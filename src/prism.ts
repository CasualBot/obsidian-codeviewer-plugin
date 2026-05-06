/**
 * Bundled Prism instance with all languages we support.
 *
 * Import order matters — components that extend others (e.g. cpp extends c,
 * tsx extends typescript+jsx) must load after their bases. The ordering below
 * follows the dependency chains documented in prismjs/components.json.
 */
import Prism from "prismjs";

// Templating + clike base — many languages extend these
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-clike";

// C family
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-glsl";

// JVM + Apple
import "prismjs/components/prism-java";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-swift";

// Other clike-derived
import "prismjs/components/prism-dart";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-protobuf";

// JavaScript family — order: js → ts/jsx → tsx
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

// Scripting
import "prismjs/components/prism-python";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-perl";
import "prismjs/components/prism-r";
import "prismjs/components/prism-lua";
import "prismjs/components/prism-php";
import "prismjs/components/prism-powershell";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-batch";

// Data / config
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-toml";
import "prismjs/components/prism-ini";
import "prismjs/components/prism-json";
import "prismjs/components/prism-json5";
import "prismjs/components/prism-hcl";

// Query / IDL
import "prismjs/components/prism-graphql";
import "prismjs/components/prism-sql";

// Build systems
import "prismjs/components/prism-makefile";
import "prismjs/components/prism-cmake";
import "prismjs/components/prism-docker";

// Stylesheets
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-less";

/**
 * GDScript — Prism does not ship a grammar for it. GDScript is Python-adjacent,
 * so we extend the Python grammar with GDScript's keyword set. Good enough for
 * read-only browse view.
 */
if (Prism.languages.python && !Prism.languages.gdscript) {
  Prism.languages.gdscript = Prism.languages.extend("python", {
    keyword:
      /\b(?:and|as|assert|await|break|breakpoint|class|class_name|const|continue|elif|else|enum|export|extends|for|func|if|in|is|master|mastersync|match|not|null|onready|or|pass|preload|puppet|puppetsync|remote|remotesync|return|self|setget|signal|static|tool|var|void|while|yield)\b/,
    "builtin":
      /\b(?:Vector2|Vector3|Color|Rect2|Transform|Transform2D|Basis|Quat|AABB|Plane|NodePath|RID|Dictionary|Array|PoolByteArray|PoolIntArray|PoolRealArray|PoolStringArray|PoolVector2Array|PoolVector3Array|PoolColorArray|bool|int|float|String)\b/,
  });
}

export default Prism;
