// src/create-location.tsx
import * as React3 from "react";

// src/injections.tsx
import * as React2 from "react";
import { useMemo } from "react";

// src/components/injected-component-wrapper.tsx
import * as React from "react";
import { Suspense } from "react";

// src/components/error-boundary.tsx
import { Component } from "react";
var ErrorBoundary = class extends Component {
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
  return /* @__PURE__ */ React.createElement(ErrorBoundary, { fallback: null }, /* @__PURE__ */ React.createElement(Suspense, { fallback: null }, children));
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
  return () => useMemo(() => getInjections(), []);
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
import * as React4 from "react";
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
export {
  flushAllInjections as __flushAllInjections,
  createLocation,
  createReplaceableLocation
};
//# sourceMappingURL=index.mjs.map