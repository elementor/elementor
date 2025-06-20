// src/hooks/use-breakpoints.ts
import { __privateUseListenTo as useListenTo, v1ReadyEvent } from "@elementor/editor-v1-adapters";

// src/sync/utils/get-breakpoints-by-widths.ts
import { __ } from "@wordpress/i18n";
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
    { id: "desktop", label: __("Desktop", "elementor") }
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
  return useListenTo(v1ReadyEvent(), getBreakpoints);
}

// src/hooks/use-active-breakpoint.ts
import { __privateUseListenTo as useListenTo2, windowEvent } from "@elementor/editor-v1-adapters";
function useActiveBreakpoint() {
  return useListenTo2(windowEvent("elementor/device-mode/change"), getActiveBreakpoint);
}
function getActiveBreakpoint() {
  const extendedWindow = window;
  return extendedWindow.elementor?.channels?.deviceMode?.request?.("currentMode") || null;
}

// src/hooks/use-activate-breakpoint.ts
import { useCallback } from "react";
import { __privateRunCommand as runCommand } from "@elementor/editor-v1-adapters";
function useActivateBreakpoint() {
  return useCallback((breakpoint) => {
    return runCommand("panel/change-device-mode", { device: breakpoint });
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
export {
  getBreakpoints,
  getBreakpointsTree,
  useActivateBreakpoint,
  useActiveBreakpoint,
  useBreakpoints,
  useBreakpointsMap
};
//# sourceMappingURL=index.mjs.map