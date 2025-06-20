"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Context: () => Context,
  SessionStorageProvider: () => SessionStorageProvider,
  getSessionStorageItem: () => getSessionStorageItem,
  removeSessionStorageItem: () => removeSessionStorageItem,
  setSessionStorageItem: () => setSessionStorageItem,
  useSessionStorage: () => useSessionStorage
});
module.exports = __toCommonJS(index_exports);

// src/session-storage.ts
var getSessionStorageItem = (key) => {
  return JSON.parse(sessionStorage.getItem(key) || "{}")?.item;
};
var setSessionStorageItem = (key, item) => {
  sessionStorage.setItem(key, JSON.stringify({ item }));
  window.dispatchEvent(
    new StorageEvent("storage", {
      key,
      storageArea: sessionStorage
    })
  );
};
var removeSessionStorageItem = (key) => {
  sessionStorage.removeItem(key);
  window.dispatchEvent(
    new StorageEvent("storage", {
      key,
      storageArea: sessionStorage
    })
  );
};

// src/use-session-storage.ts
var import_react2 = require("react");

// src/session-storage-context.tsx
var React = __toESM(require("react"));
var import_react = require("react");
var Context = (0, import_react.createContext)(null);
function SessionStorageProvider({ children, prefix }) {
  const contextPrefix = (0, import_react.useContext)(Context)?.prefix ?? "";
  const chainedPrefix = contextPrefix ? `${contextPrefix}/${prefix}` : prefix;
  return /* @__PURE__ */ React.createElement(Context.Provider, { value: { prefix: chainedPrefix } }, children);
}

// src/use-session-storage.ts
var useSessionStorage = (key) => {
  const prefix = (0, import_react2.useContext)(Context)?.prefix ?? "";
  const prefixedKey = `${prefix}/${key}`;
  const [value, setValue] = (0, import_react2.useState)();
  (0, import_react2.useEffect)(() => {
    return subscribeToSessionStorage(prefixedKey, (newValue) => {
      setValue(newValue ?? null);
    });
  }, [prefixedKey]);
  const saveValue = (newValue) => {
    setSessionStorageItem(prefixedKey, newValue);
  };
  const removeValue = () => {
    removeSessionStorageItem(prefixedKey);
  };
  return [value, saveValue, removeValue];
};
var subscribeToSessionStorage = (key, subscriber) => {
  subscriber(getSessionStorageItem(key));
  const abortController = new AbortController();
  window.addEventListener(
    "storage",
    (e) => {
      if (e.key !== key || e.storageArea !== sessionStorage) {
        return;
      }
      subscriber(getSessionStorageItem(key));
    },
    { signal: abortController.signal }
  );
  return () => {
    abortController.abort();
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Context,
  SessionStorageProvider,
  getSessionStorageItem,
  removeSessionStorageItem,
  setSessionStorageItem,
  useSessionStorage
});
//# sourceMappingURL=index.js.map