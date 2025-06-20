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
import { useContext as useContext2, useEffect, useState } from "react";

// src/session-storage-context.tsx
import * as React from "react";
import { createContext, useContext } from "react";
var Context = createContext(null);
function SessionStorageProvider({ children, prefix }) {
  const contextPrefix = useContext(Context)?.prefix ?? "";
  const chainedPrefix = contextPrefix ? `${contextPrefix}/${prefix}` : prefix;
  return /* @__PURE__ */ React.createElement(Context.Provider, { value: { prefix: chainedPrefix } }, children);
}

// src/use-session-storage.ts
var useSessionStorage = (key) => {
  const prefix = useContext2(Context)?.prefix ?? "";
  const prefixedKey = `${prefix}/${key}`;
  const [value, setValue] = useState();
  useEffect(() => {
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
export {
  Context,
  SessionStorageProvider,
  getSessionStorageItem,
  removeSessionStorageItem,
  setSessionStorageItem,
  useSessionStorage
};
//# sourceMappingURL=index.mjs.map