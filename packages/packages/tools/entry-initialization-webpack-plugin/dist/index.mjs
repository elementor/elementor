// src/plugin.ts
import { BannerPlugin, Compilation } from "webpack";

// src/kebab-to-camel-case.ts
function kebabToCamelCase(kebabCase) {
  return kebabCase.replace(/-(\w)/g, (_, w) => w.toUpperCase());
}

// src/plugin.ts
var EntryInitializationWebpackPlugin = class {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    new BannerPlugin({
      banner: (args) => {
        const { name } = args.chunk;
        if (!name) {
          return "";
        }
        if (!/\.js$/.test(args.filename)) {
          return "";
        }
        return this.options.initializer({
          ...args,
          entryName: kebabToCamelCase(name)
        });
      },
      raw: true,
      footer: true,
      entryOnly: true,
      stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
    }).apply(compiler);
  }
};
export {
  EntryInitializationWebpackPlugin
};
//# sourceMappingURL=index.mjs.map