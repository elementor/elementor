// src/index.ts
var globalEnv = null;
function initEnv(env) {
  globalEnv = env;
}
function __resetEnv() {
  globalEnv = null;
}
function parseEnv(key, parseFn = (rawSettings) => rawSettings) {
  let parsedEnv = {};
  let isParsed = false;
  const proxiedEnv = new Proxy(parsedEnv, {
    get(target, property) {
      if (!isParsed) {
        parse();
      }
      return parsedEnv[property];
    },
    ownKeys() {
      if (!isParsed) {
        parse();
      }
      return Reflect.ownKeys(parsedEnv);
    },
    getOwnPropertyDescriptor() {
      return {
        configurable: true,
        enumerable: true
      };
    }
  });
  const parse = () => {
    try {
      const env = globalEnv?.[key];
      if (!env) {
        throw new InvalidEnvError(`Settings object not found`);
      }
      if (typeof env !== "object") {
        throw new InvalidEnvError(`Expected settings to be \`object\`, but got \`${typeof env}\``);
      }
      parsedEnv = parseFn(env);
    } catch (e) {
      if (e instanceof InvalidEnvError) {
        console.warn(`${key} - ${e.message}`);
        parsedEnv = {};
      } else {
        throw e;
      }
    } finally {
      isParsed = true;
    }
  };
  return {
    validateEnv: parse,
    env: proxiedEnv
  };
}
var InvalidEnvError = class extends Error {
};
export {
  InvalidEnvError,
  __resetEnv,
  initEnv,
  parseEnv
};
//# sourceMappingURL=index.mjs.map