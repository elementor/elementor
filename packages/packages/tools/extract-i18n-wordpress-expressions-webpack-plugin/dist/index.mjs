// src/plugin.ts
import * as fs2 from "fs";
import * as path from "path";

// src/utils.ts
import * as fs from "fs";
import { glob } from "glob";
var COMMENTS_REGEXPS = [
  // Matches translators comment block: `/* translators: %s */`.
  /\/\*[\t ]*translators:.*\*\//gm,
  // Matches translators inline comment: `// translators: %s`.
  /(\/\/)[\t ]*translators:[^\r\n]*/gm
];
var TRANSLATIONS_REGEXPS = [
  // Matches translation functions: `__('Hello', 'elementor')`, `_n('Me', 'Us', 2, 'elementor-pro')`.
  /\b_(?:_|n|nx|x)\(.*?,\s*(?<c>['"`])[\w-]+\k<c>\s*?\)/gs
];
function createStringsFilePath(path2, suffix = ".strings.js") {
  return path2.replace(/(\.min)?\.js$/i, suffix);
}
function getFilesPaths(pattern) {
  return glob(pattern, {
    ignore: {
      ignored: (p) => !/\.(js|ts|jsx|tsx)$/.test(p.name),
      childrenIgnored: (p) => p.isNamed("__tests__") || p.isNamed("__mocks__")
    },
    /**
     * Fix for Windows paths escaping.
     * Note: This means we don't support paths with special character (like `*`,`?`, etc.)
     * and only allow patterns that are constructed using `path.join()` or `path.resolve()`.
     *
     * @see https://github.com/isaacs/node-glob#options
     * @see https://github.com/isaacs/node-glob#windows
     * @see https://github.com/isaacs/node-glob/issues/212#issuecomment-1449062925
     */
    windowsPathsNoEscape: true
  });
}
function getFilesContents(paths) {
  return Promise.all(paths.map((filePath) => fs.promises.readFile(filePath, "utf-8")));
}
function generateStringsFileContent(contents) {
  return contents.map((content) => extractExpressions(content)).flat().map((expr) => `${expr.value}${expr.type === "comment" ? "" : ";"}`).join("\n");
}
function extractExpressions(content) {
  const expressions = [];
  [...TRANSLATIONS_REGEXPS, ...COMMENTS_REGEXPS].forEach((regexp) => {
    [...content.matchAll(regexp)].forEach((res) => {
      expressions.push({
        type: COMMENTS_REGEXPS.includes(regexp) ? "comment" : "call-expression",
        index: res.index || 0,
        value: res[0]
      });
    });
  });
  return expressions.sort((a, b) => a.index - b.index);
}

// src/plugin.ts
var ExtractI18nWordpressExpressionsWebpackPlugin = class {
  options;
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise(this.constructor.name, async (compilation) => {
      const entries = this.getEntries(compilation);
      await Promise.all(
        entries.map(async (entry) => {
          const fileContents = await getFilesContents(await getFilesPaths(entry.pattern));
          const entryContent = generateStringsFileContent(fileContents);
          await fs2.promises.writeFile(entry.path, entryContent);
        })
      );
    });
  }
  getEntries(compilation) {
    return [...compilation.entrypoints].map(([id, entrypoint]) => {
      const chunk = entrypoint.chunks.find(({ name }) => name === id);
      if (!chunk) {
        return null;
      }
      const chunkJSFile = [...chunk.files].find((f) => /\.(js|ts)$/i.test(f));
      if (!chunkJSFile) {
        return null;
      }
      const { path: basePath } = compilation.options.output;
      if (!basePath) {
        return null;
      }
      const filePath = createStringsFilePath(compilation.getPath("[file]", { filename: chunkJSFile }));
      return {
        id,
        chunk,
        path: path.join(basePath, filePath),
        pattern: this.options.pattern(path.resolve(process.cwd(), entrypoint.origins[0].request), id)
      };
    }).filter(Boolean);
  }
};
export {
  ExtractI18nWordpressExpressionsWebpackPlugin
};
//# sourceMappingURL=index.mjs.map