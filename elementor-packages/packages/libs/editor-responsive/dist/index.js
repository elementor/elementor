"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  getBreakpoints: () => getBreakpoints,
  getBreakpointsTree: () => getBreakpointsTree,
  useActivateBreakpoint: () => useActivateBreakpoint,
  useActiveBreakpoint: () => useActiveBreakpoint,
  useBreakpoints: () => useBreakpoints,
  useBreakpointsMap: () => useBreakpointsMap
});
module.exports = __toCommonJS(index_exports);

// src/hooks/use-breakpoints.ts
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");

// src/sync/utils/get-breakpoints-by-widths.ts
var import_i18n = require("@wordpress/i18n");
function getBreakpointsByWidths() {
  const { breakpoints } = window.elementor?.config?.responsive || {};
  if (!breakpoints || Object.entries(breakpoints).length === 0) {
    return {
      minWidth: [],
      defaults: [],
      maxWidth: []
    };
  }
  const minWidth = [];
  const maxWidth = [];
  const defaults = [
    // Desktop breakpoint is not included in V1 config.
    { id: "desktop", label: (0, import_i18n.__)("Desktop", "elementor") }
  ];
  Object.entries(breakpoints).forEach(([id, v1Breakpoint]) => {
    if (!v1Breakpoint.is_enabled) {
      return;
    }
    const breakpoint = {
      id,
      label: v1Breakpoint.label,
      width: v1Breakpoint.value,
      type: v1Breakpoint.direction === "min" ? "min-width" : "max-width"
    };
    if (!breakpoint.width) {
      defaults.push(breakpoint);
    } else if (breakpoint.type === "min-width") {
      minWidth.push(breakpoint);
    } else if (breakpoint.type === "max-width") {
      maxWidth.push(breakpoint);
    }
  });
  const byWidth = (a, b) => {
    return a.width && b.width ? b.width - a.width : 0;
  };
  return {
    minWidth: minWidth.sort(byWidth),
    defaults,
    maxWidth: maxWidth.sort(byWidth)
  };
}

// src/sync/get-breakpoints.ts
function getBreakpoints() {
  const { minWidth, defaults, maxWidth } = getBreakpointsByWidths();
  return [...minWidth, ...defaults, ...maxWidth];
}

// src/hooks/use-breakpoints.ts
function useBreakpoints() {
  return (0, import_editor_v1_adapters.__privateUseListenTo)((0, import_editor_v1_adapters.v1ReadyEvent)(), getBreakpoints);
}

// src/hooks/use-active-breakpoint.ts
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
function useActiveBreakpoint() {
  return (0, import_editor_v1_adapters2.__privateUseListenTo)((0, import_editor_v1_adapters2.windowEvent)("elementor/device-mode/change"), getActiveBreakpoint);
}
function getActiveBreakpoint() {
  const extendedWindow = window;
  return extendedWindow.elementor?.channels?.deviceMode?.request?.("currentMode") || null;
}

// src/hooks/use-activate-breakpoint.ts
var import_react = require("react");
var import_editor_v1_adapters3 = require("@elementor/editor-v1-adapters");
function useActivateBreakpoint() {
  return (0, import_react.useCallback)((breakpoint) => {
    return (0, import_editor_v1_adapters3.__privateRunCommand)("panel/change-device-mode", { device: breakpoint });
  }, []);
}

// src/hooks/use-breakpoints-map.ts
function useBreakpointsMap() {
  const breakpoints = useBreakpoints();
  const entries = breakpoints.map((breakpoint) => [breakpoint.id, breakpoint]);
  return Object.fromEntries(entries);
}

// src/sync/get-breakpoints-tree.ts
function getBreakpointsTree() {
  const { minWidth, defaults, maxWidth } = getBreakpointsByWidths();
  const [rootBreakpoint] = defaults;
  const rootNode = {
    ...rootBreakpoint,
    children: []
  };
  const buildBranch = (breakpoints) => {
    let last = rootNode;
    breakpoints.forEach((breakpoint) => {
      const newNode = {
        ...breakpoint,
        children: []
      };
      last.children.push(newNode);
      last = newNode;
    });
  };
  buildBranch(minWidth);
  buildBranch(maxWidth);
  return rootNode;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getBreakpoints,
  getBreakpointsTree,
  useActivateBreakpoint,
  useActiveBreakpoint,
  useBreakpoints,
  useBreakpointsMap
});
//# sourceMappingURL=index.js.map