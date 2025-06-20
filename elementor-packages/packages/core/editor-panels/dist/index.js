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
  Panel: () => Panel,
  PanelBody: () => PanelBody,
  PanelFooter: () => PanelFooter,
  PanelHeader: () => PanelHeader,
  PanelHeaderTitle: () => PanelHeaderTitle,
  __createPanel: () => createPanel,
  __registerPanel: () => registerPanel,
  init: () => init
});
module.exports = __toCommonJS(index_exports);

// src/init.ts
var import_editor = require("@elementor/editor");
var import_store6 = require("@elementor/store");

// src/components/internal/panels.tsx
var React2 = __toESM(require("react"));

// src/hooks/use-open-panel-injection.ts
var import_react = require("react");
var import_store2 = require("@elementor/store");

// src/location.ts
var import_locations = require("@elementor/locations");
var { inject: injectIntoPanels, useInjections: usePanelsInjections } = (0, import_locations.createLocation)();

// src/store/selectors.ts
var selectOpenId = (state) => state.panels.openId;

// src/store/slice.ts
var import_store = require("@elementor/store");
var initialState = {
  openId: null
};
var slice_default = (0, import_store.__createSlice)({
  name: "panels",
  initialState,
  reducers: {
    open(state, action) {
      state.openId = action.payload;
    },
    close(state, action) {
      if (!action.payload || state.openId === action.payload) {
        state.openId = null;
      }
    }
  }
});

// src/hooks/use-open-panel-injection.ts
function useOpenPanelInjection() {
  const injections = usePanelsInjections();
  const openId = (0, import_store2.__useSelector)(selectOpenId);
  return (0, import_react.useMemo)(() => injections.find((injection) => openId === injection.id), [injections, openId]);
}

// src/components/internal/portal.tsx
var React = __toESM(require("react"));
var import_react2 = require("react");
var import_ui = require("@elementor/ui");

// src/sync.ts
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var import_store4 = require("@elementor/store");
var V2_PANEL = "panel/v2";
function getPortalContainer() {
  return document.querySelector("#elementor-panel-inner");
}
function sync() {
  (0, import_editor_v1_adapters.__privateListenTo)((0, import_editor_v1_adapters.windowEvent)("elementor/panel/init"), () => (0, import_editor_v1_adapters.__privateRegisterRoute)(V2_PANEL));
  (0, import_editor_v1_adapters.__privateListenTo)((0, import_editor_v1_adapters.routeOpenEvent)(V2_PANEL), () => {
    getV1PanelElements().forEach((el) => {
      el.setAttribute("hidden", "hidden");
      el.setAttribute("inert", "true");
    });
  });
  (0, import_editor_v1_adapters.__privateListenTo)((0, import_editor_v1_adapters.routeCloseEvent)(V2_PANEL), () => selectOpenId((0, import_store4.__getState)()) && (0, import_store4.__dispatch)(slice_default.actions.close()));
  (0, import_editor_v1_adapters.__privateListenTo)((0, import_editor_v1_adapters.routeCloseEvent)(V2_PANEL), () => {
    getV1PanelElements().forEach((el) => {
      el.removeAttribute("hidden");
      el.removeAttribute("inert");
    });
  });
  (0, import_editor_v1_adapters.__privateListenTo)(
    (0, import_editor_v1_adapters.windowEvent)("elementor/panel/init"),
    () => subscribe({
      on: (state) => selectOpenId(state),
      when: ({ prev, current }) => !!(!prev && current),
      // is panel opened
      callback: () => (0, import_editor_v1_adapters.__privateOpenRoute)(V2_PANEL)
    })
  );
  (0, import_editor_v1_adapters.__privateListenTo)(
    (0, import_editor_v1_adapters.windowEvent)("elementor/panel/init"),
    () => subscribe({
      on: (state) => selectOpenId(state),
      when: ({ prev, current }) => !!(!current && prev),
      // is panel closed
      callback: () => (0, import_editor_v1_adapters.__privateIsRouteActive)(V2_PANEL) && (0, import_editor_v1_adapters.__privateOpenRoute)(getDefaultRoute())
    })
  );
}
function getV1PanelElements() {
  const v1ElementsSelector = [
    "#elementor-panel-header-wrapper",
    "#elementor-panel-content-wrapper",
    "#elementor-panel-state-loading",
    "#elementor-panel-footer"
  ].join(", ");
  return document.querySelectorAll(v1ElementsSelector);
}
function getDefaultRoute() {
  const defaultRoute = window?.elementor?.documents?.getCurrent?.()?.config?.panel?.default_route;
  return defaultRoute || "panel/elements/categories";
}
function subscribe({
  on,
  when,
  callback
}) {
  let prev;
  (0, import_store4.__subscribe)(() => {
    const current = on((0, import_store4.__getState)());
    if (when({ prev, current })) {
      callback({ prev, current });
    }
    prev = current;
  });
}

// src/components/internal/portal.tsx
function Portal(props) {
  const containerRef = (0, import_react2.useRef)(getPortalContainer);
  if (!containerRef.current) {
    return null;
  }
  return /* @__PURE__ */ React.createElement(import_ui.Portal, { container: containerRef.current, ...props });
}

// src/components/internal/panels.tsx
function Panels() {
  const openPanel = useOpenPanelInjection();
  const Component = openPanel?.component ?? null;
  if (!Component) {
    return null;
  }
  return /* @__PURE__ */ React2.createElement(Portal, null, /* @__PURE__ */ React2.createElement(Component, null));
}

// src/init.ts
function init() {
  sync();
  (0, import_store6.__registerSlice)(slice_default);
  (0, import_editor.injectIntoTop)({ id: "panels", component: Panels });
}

// src/api.ts
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
var import_store8 = require("@elementor/store");
function createPanel({
  id,
  component,
  onOpen,
  onClose,
  allowedEditModes,
  blockOnKitRoutes
}) {
  const usePanelStatus = createUseStatus(id, {
    allowedEditModes,
    blockOnKitRoutes
  });
  const usePanelActions = createUseActions(id, usePanelStatus, {
    onOpen,
    onClose
  });
  return {
    panel: {
      id,
      component
    },
    usePanelStatus,
    usePanelActions
  };
}
function registerPanel({ id, component }) {
  injectIntoPanels({
    id,
    component
  });
}
function createUseStatus(id, options = {}) {
  return () => {
    const openPanelId = (0, import_store8.__useSelector)(selectOpenId);
    const v1PanelStatus = (0, import_editor_v1_adapters2.__privateUseRouteStatus)(V2_PANEL, options);
    return {
      isOpen: openPanelId === id && v1PanelStatus.isActive,
      isBlocked: v1PanelStatus.isBlocked
    };
  };
}
function createUseActions(id, useStatus, options = {}) {
  let stateSnapshot = null;
  return () => {
    const dispatch = (0, import_store8.__useDispatch)();
    const { isBlocked } = useStatus();
    return {
      open: async () => {
        if (isBlocked) {
          return;
        }
        dispatch(slice_default.actions.open(id));
        stateSnapshot = options.onOpen?.() ?? null;
      },
      close: async () => {
        if (isBlocked) {
          return;
        }
        dispatch(slice_default.actions.close(id));
        options.onClose?.(stateSnapshot);
      }
    };
  };
}

// src/components/external/panel.tsx
var React3 = __toESM(require("react"));
var import_ui2 = require("@elementor/ui");
function Panel({ children, sx, ...props }) {
  return /* @__PURE__ */ React3.createElement(
    import_ui2.Drawer,
    {
      open: true,
      variant: "persistent",
      anchor: "left",
      PaperProps: {
        sx: {
          position: "relative",
          width: "100%",
          bgcolor: "background.default",
          border: "none"
        }
      },
      sx: { height: "100%", ...sx },
      ...props
    },
    children
  );
}

// src/components/external/panel-header.tsx
var React4 = __toESM(require("react"));
var import_ui3 = require("@elementor/ui");
var Header = (0, import_ui3.styled)(import_ui3.Box)(({ theme }) => ({
  height: theme?.spacing(6) || "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme?.spacing(0.5) || "4px"
}));
function PanelHeader({ children, ...props }) {
  return /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(Header, { component: "header", ...props }, children));
}

// src/components/external/panel-header-title.tsx
var React5 = __toESM(require("react"));
var import_ui4 = require("@elementor/ui");
var Typography = (0, import_ui4.styled)(import_ui4.Typography)(({ theme, variant = "body1" }) => {
  if (variant === "inherit") {
    return {};
  }
  return {
    "&.MuiTypography-root": {
      ...theme.typography[variant]
    }
  };
});
function PanelHeaderTitle({ children, ...props }) {
  return /* @__PURE__ */ React5.createElement(Typography, { component: "h2", variant: "subtitle1", ...props }, children);
}

// src/components/external/panel-body.tsx
var React6 = __toESM(require("react"));
var import_ui5 = require("@elementor/ui");
function PanelBody({ children, sx, ...props }) {
  return /* @__PURE__ */ React6.createElement(
    import_ui5.Box,
    {
      component: "main",
      sx: {
        overflowY: "auto",
        height: "100%",
        ...sx
      },
      ...props
    },
    children
  );
}

// src/components/external/panel-footer.tsx
var React7 = __toESM(require("react"));
var import_ui6 = require("@elementor/ui");
function PanelFooter({ children, sx, ...props }) {
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(import_ui6.Divider, null), /* @__PURE__ */ React7.createElement(
    import_ui6.Box,
    {
      component: "footer",
      sx: {
        display: "flex",
        position: "sticky",
        bottom: 0,
        px: 2,
        py: 1.5
      },
      ...props
    },
    children
  ));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  PanelHeaderTitle,
  __createPanel,
  __registerPanel,
  init
});
//# sourceMappingURL=index.js.map