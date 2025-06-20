// src/dispatchers/utils.ts
function isJQueryDeferred(value) {
  return !!value && "object" === typeof value && Object.hasOwn(value, "promise") && Object.hasOwn(value, "then") && Object.hasOwn(value, "fail");
}
function promisifyJQueryDeferred(deferred) {
  return new Promise((resolve, reject) => {
    deferred.then(resolve, reject);
  });
}

// src/dispatchers/dispatchers.ts
async function runCommand(command, args, { internal = false } = {}) {
  const result = runCommandSync(command, args, { internal });
  if (result instanceof Promise) {
    return result;
  }
  if (isJQueryDeferred(result)) {
    return promisifyJQueryDeferred(result);
  }
  return Promise.resolve(result);
}
function runCommandSync(command, args, { internal = false } = {}) {
  const extendedWindow = window;
  const run = internal ? extendedWindow.$e?.internal : extendedWindow.$e?.run;
  if (!run) {
    const runnerName = internal ? "$e.internal" : "$e.run";
    throw new Error(`\`${runnerName}()\` is not available`);
  }
  return run(command, args);
}
function openRoute(route) {
  const extendedWindow = window;
  if (!extendedWindow.$e?.route) {
    return Promise.reject("`$e.route()` is not available");
  }
  try {
    return Promise.resolve(extendedWindow.$e.route(route));
  } catch (e) {
    return Promise.reject(e);
  }
}
function registerRoute(route) {
  const extendedWindow = window;
  if (!extendedWindow.$e?.routes?.register) {
    return Promise.reject("`$e.routes.register()` is not available");
  }
  const routeParts = route.split("/");
  if (routeParts.length < 2) {
    return Promise.reject(`\`${route}\` is an invalid route`);
  }
  const componentRoute = routeParts.pop();
  const component = routeParts.join("/");
  try {
    return Promise.resolve(extendedWindow.$e.routes.register(component, componentRoute, () => null));
  } catch (e) {
    return Promise.reject(e);
  }
}

// src/listeners/event-creators.ts
var commandStartEvent = (command) => {
  return {
    type: "command",
    name: command,
    state: "before"
  };
};
var commandEndEvent = (command) => {
  return {
    type: "command",
    name: command,
    state: "after"
  };
};
var routeOpenEvent = (route) => {
  return {
    type: "route",
    name: route,
    state: "open"
  };
};
var routeCloseEvent = (route) => {
  return {
    type: "route",
    name: route,
    state: "close"
  };
};
var windowEvent = (event) => {
  return {
    type: "window-event",
    name: event
  };
};
var v1ReadyEvent = () => {
  return windowEvent("elementor/initialized");
};

// src/listeners/is-ready.ts
var ready = false;
function isReady() {
  return ready;
}
function setReady(value) {
  ready = value;
}

// src/listeners/utils.ts
function dispatchReadyEvent() {
  return getV1LoadingPromise().then(() => {
    setReady(true);
    window.dispatchEvent(new CustomEvent("elementor/initialized"));
  });
}
function getV1LoadingPromise() {
  const v1LoadingPromise = window.__elementorEditorV1LoadingPromise;
  if (!v1LoadingPromise) {
    return Promise.reject("Elementor Editor V1 is not loaded");
  }
  return v1LoadingPromise;
}
function normalizeEvent(e) {
  if (e instanceof CustomEvent && e.detail?.command) {
    return {
      type: "command",
      command: e.detail.command,
      args: e.detail.args,
      originalEvent: e
    };
  }
  if (e instanceof CustomEvent && e.detail?.route) {
    return {
      type: "route",
      route: e.detail.route,
      originalEvent: e
    };
  }
  return {
    type: "window-event",
    event: e.type,
    originalEvent: e
  };
}

// src/listeners/listeners.ts
var callbacksByEvent = /* @__PURE__ */ new Map();
var abortController = new AbortController();
function listenTo(eventDescriptors, callback) {
  if (!Array.isArray(eventDescriptors)) {
    eventDescriptors = [eventDescriptors];
  }
  const cleanups = eventDescriptors.map((event) => {
    const { type, name } = event;
    switch (type) {
      case "command":
        return registerCommandListener(name, event.state, callback);
      case "route":
        return registerRouteListener(name, event.state, callback);
      case "window-event":
        return registerWindowEventListener(name, callback);
    }
  });
  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
function flushListeners() {
  abortController.abort();
  callbacksByEvent.clear();
  setReady(false);
  abortController = new AbortController();
}
function registerCommandListener(command, state, callback) {
  return registerWindowEventListener(`elementor/commands/run/${state}`, (e) => {
    const shouldRunCallback = e.type === "command" && e.command === command;
    if (shouldRunCallback) {
      callback(e);
    }
  });
}
function registerRouteListener(route, state, callback) {
  return registerWindowEventListener(`elementor/routes/${state}`, (e) => {
    const shouldRunCallback = e.type === "route" && e.route.startsWith(route);
    if (shouldRunCallback) {
      callback(e);
    }
  });
}
function registerWindowEventListener(event, callback) {
  const isFirstListener = !callbacksByEvent.has(event);
  if (isFirstListener) {
    callbacksByEvent.set(event, []);
    addListener(event);
  }
  callbacksByEvent.get(event)?.push(callback);
  return () => {
    const callbacks = callbacksByEvent.get(event);
    if (!callbacks?.length) {
      return;
    }
    const filtered = callbacks.filter((cb) => cb !== callback);
    callbacksByEvent.set(event, filtered);
  };
}
function addListener(event) {
  window.addEventListener(event, makeEventHandler(event), { signal: abortController.signal });
}
function makeEventHandler(event) {
  return (e) => {
    if (!isReady()) {
      return;
    }
    const normalizedEvent = normalizeEvent(e);
    callbacksByEvent.get(event)?.forEach((callback) => {
      callback(normalizedEvent);
    });
  };
}

// src/readers/index.ts
function isRouteActive(route) {
  const extendedWindow = window;
  return !!extendedWindow.$e?.routes?.isPartOf(route);
}
var isExperimentActive = (experiment) => {
  const extendedWindow = window;
  return !!extendedWindow.elementorCommon?.config?.experimentalFeatures?.[experiment];
};

// src/hooks/use-listen-to.ts
import { useEffect, useState } from "react";
function useListenTo(event, getSnapshot, deps = []) {
  const [snapshot, setSnapshot] = useState(() => getSnapshot());
  useEffect(() => {
    const updateState = () => setSnapshot(getSnapshot());
    updateState();
    return listenTo(event, updateState);
  }, deps);
  return snapshot;
}

// src/hooks/use-is-route-active.ts
function useIsRouteActive(route) {
  return useListenTo([routeOpenEvent(route), routeCloseEvent(route)], () => isRouteActive(route), [
    route
  ]);
}

// src/edit-mode.ts
function useEditMode() {
  return useListenTo(windowEvent("elementor/edit-mode/change"), getCurrentEditMode);
}
function getCurrentEditMode() {
  const extendedWindow = window;
  return extendedWindow.elementor.channels.dataEditMode.request("activeMode");
}
function changeEditMode(newMode) {
  const extendedWindow = window;
  return extendedWindow.elementor.changeEditMode(newMode);
}

// src/hooks/use-route-status.ts
function useRouteStatus(route, { blockOnKitRoutes = true, allowedEditModes = ["edit"] } = {}) {
  const isRouteActive2 = useIsRouteActive(route);
  const isKitRouteActive = useIsRouteActive("panel/global");
  const currentEditMode = useEditMode();
  const isBlockedByEditMode = !allowedEditModes.includes(currentEditMode);
  const isBlockedByKit = blockOnKitRoutes && isKitRouteActive;
  const isActive = isRouteActive2 && !isBlockedByEditMode;
  const isBlocked = isBlockedByEditMode || isBlockedByKit;
  return {
    isActive,
    isBlocked
  };
}

// src/undoable/get-history-manager.ts
import { createError } from "@elementor/utils";
var HistoryManagerNotAvailable = createError({
  code: "history_manager_not_available",
  message: "Cannot access History manager."
});
function getHistoryManager() {
  const extendedWindow = window;
  const historyManger = extendedWindow.elementor?.documents?.getCurrent?.()?.history;
  if (!historyManger) {
    throw new HistoryManagerNotAvailable();
  }
  return historyManger;
}

// src/undoable/undoable.ts
function undoable(actions, options) {
  actions.redo ??= actions.do;
  return (payload) => {
    const _payload = payload;
    const _actions = actions;
    const history = getHistoryManager();
    let result = _actions.do(_payload);
    history.addItem({
      title: normalizeToGenerator(options.title)(_payload, result),
      subTitle: normalizeToGenerator(options.subtitle)(_payload, result),
      type: "",
      restore: (_, isRedo) => {
        if (isRedo) {
          result = _actions.redo(_payload, result);
          return;
        }
        _actions.undo(_payload, result);
      }
    });
    return result;
  };
}
function normalizeToGenerator(value) {
  return typeof value === "function" ? value : () => value ?? "";
}

// src/data-hooks/register-data-hook.ts
var hookId = 0;
function registerDataHook(type, command, callback) {
  const eWindow = window;
  const hooksClasses = eWindow.$e?.modules?.hookData;
  const hooksMap = {
    after: hooksClasses?.After,
    dependency: hooksClasses?.Dependency
  };
  const HookClass = hooksMap[type];
  if (!HookClass) {
    throw new Error(`Data hook '${type}' is not available`);
  }
  const currentHookId = ++hookId;
  const hook = new class extends HookClass {
    getCommand() {
      return command;
    }
    getId() {
      return `${command}--data--${currentHookId}`;
    }
    apply(args) {
      return callback(args);
    }
  }();
  hook.register();
  return hook;
}

// src/data-hooks/block-command.ts
function blockCommand({ command, condition }) {
  return registerDataHook("dependency", command, (args) => {
    const shouldBlock = condition(args);
    return !shouldBlock;
  });
}
export {
  dispatchReadyEvent as __privateDispatchReadyEvent,
  flushListeners as __privateFlushListeners,
  isRouteActive as __privateIsRouteActive,
  listenTo as __privateListenTo,
  openRoute as __privateOpenRoute,
  registerRoute as __privateRegisterRoute,
  runCommand as __privateRunCommand,
  runCommandSync as __privateRunCommandSync,
  setReady as __privateSetReady,
  useIsRouteActive as __privateUseIsRouteActive,
  useListenTo as __privateUseListenTo,
  useRouteStatus as __privateUseRouteStatus,
  blockCommand,
  changeEditMode,
  commandEndEvent,
  commandStartEvent,
  isExperimentActive,
  registerDataHook,
  routeCloseEvent,
  routeOpenEvent,
  undoable,
  useEditMode,
  v1ReadyEvent,
  windowEvent
};
//# sourceMappingURL=index.mjs.map