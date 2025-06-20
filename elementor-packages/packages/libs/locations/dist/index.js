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
  __flushAllInjections: () => flushAllInjections,
  createLocation: () => createLocation,
  createReplaceableLocation: () => createReplaceableLocation
});
module.exports = __toCommonJS(index_exports);

// src/create-location.tsx
var React3 = __toESM(require("react"));

// src/injections.tsx
var React2 = __toESM(require("react"));
var import_react3 = require("react");

// src/components/injected-component-wrapper.tsx
var React = __toESM(require("react"));
var import_react2 = require("react");

// src/components/error-boundary.tsx
var import_react = require("react");
var ErrorBoundary = class extends import_react.Component {
  state = {
    hasError: false
  };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
};

// src/components/injected-component-wrapper.tsx
function InjectedComponentWrapper({ children }) {
  return /* @__PURE__ */ React.createElement(ErrorBoundary, { fallback: null }, /* @__PURE__ */ React.createElement(import_react2.Suspense, { fallback: null }, children));
}

// src/injections.tsx
var DEFAULT_PRIORITY = 10;
var flushInjectionsFns = [];
function flushAllInjections() {
  flushInjectionsFns.forEach((flush) => flush());
}
function createGetInjections(injections) {
  return () => [...injections.values()].sort((a, b) => a.priority - b.priority);
}
function createUseInjections(getInjections) {
  return () => (0, import_react3.useMemo)(() => getInjections(), []);
}
function wrapInjectedComponent(Component2) {
  return (props) => /* @__PURE__ */ React2.createElement(InjectedComponentWrapper, null, /* @__PURE__ */ React2.createElement(Component2, { ...props }));
}

// src/create-location.tsx
function createLocation() {
  const injections = /* @__PURE__ */ new Map();
  const getInjections = createGetInjections(injections);
  const useInjections = createUseInjections(getInjections);
  const Slot = createSlot(useInjections);
  const inject = createInject(injections);
  flushInjectionsFns.push(() => injections.clear());
  return {
    inject,
    getInjections,
    useInjections,
    Slot
  };
}
function createSlot(useInjections) {
  return (props) => {
    const injections = useInjections();
    return /* @__PURE__ */ React3.createElement(React3.Fragment, null, injections.map(({ id, component: Component2 }) => /* @__PURE__ */ React3.createElement(Component2, { ...props, key: id })));
  };
}
function createInject(injections) {
  return ({ component, id, options = {} }) => {
    if (injections.has(id) && !options?.overwrite) {
      console.warn(
        `An injection with the id "${id}" already exists. Did you mean to use "options.overwrite"?`
      );
      return;
    }
    injections.set(id, {
      id,
      component: wrapInjectedComponent(component),
      priority: options.priority ?? DEFAULT_PRIORITY
    });
  };
}

// src/create-replaceable-location.tsx
var React4 = __toESM(require("react"));
function createReplaceableLocation() {
  const injections = /* @__PURE__ */ new Map();
  const getInjections = createGetInjections(injections);
  const useInjections = createUseInjections(getInjections);
  const Slot = createReplaceable(useInjections);
  const inject = createRegister(injections);
  flushInjectionsFns.push(() => injections.clear());
  return {
    getInjections,
    useInjections,
    inject,
    Slot
  };
}
function createReplaceable(useInjections) {
  return (props) => {
    const injections = useInjections();
    const { component: Component2 } = injections.find(({ condition }) => condition?.(props)) ?? {};
    if (!Component2) {
      return props.children;
    }
    return /* @__PURE__ */ React4.createElement(Component2, { ...props });
  };
}
function createRegister(injections) {
  return ({ component, id, condition = () => true, options = {} }) => {
    injections.set(id, {
      id,
      component: wrapInjectedComponent(component),
      condition,
      priority: options.priority ?? DEFAULT_PRIORITY
    });
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  __flushAllInjections,
  createLocation,
  createReplaceableLocation
});
//# sourceMappingURL=index.js.map