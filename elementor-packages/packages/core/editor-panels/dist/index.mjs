// src/init.ts
import { injectIntoTop } from "@elementor/editor";
import { __registerSlice } from "@elementor/store";

// src/components/internal/panels.tsx
import * as React2 from "react";

// src/hooks/use-open-panel-injection.ts
import { useMemo } from "react";
import { __useSelector as useSelector } from "@elementor/store";

// src/location.ts
import { createLocation } from "@elementor/locations";
var { inject: injectIntoPanels, useInjections: usePanelsInjections } = createLocation();

// src/store/selectors.ts
var selectOpenId = (state) => state.panels.openId;

// src/store/slice.ts
import { __createSlice } from "@elementor/store";
var initialState = {
  openId: null
};
var slice_default = __createSlice({
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
  const openId = useSelector(selectOpenId);
  return useMemo(() => injections.find((injection) => openId === injection.id), [injections, openId]);
}

// src/components/internal/portal.tsx
import * as React from "react";
import { useRef } from "react";
import { Portal as BasePortal } from "@elementor/ui";

// src/sync.ts
import {
  __privateIsRouteActive as isRouteActive,
  __privateListenTo as listenTo,
  __privateOpenRoute as openRoute,
  __privateRegisterRoute as registerRoute,
  routeCloseEvent,
  routeOpenEvent,
  windowEvent
} from "@elementor/editor-v1-adapters";
import { __dispatch, __getState, __subscribe as originalSubscribe } from "@elementor/store";
var V2_PANEL = "panel/v2";
function getPortalContainer() {
  return document.querySelector("#elementor-panel-inner");
}
function sync() {
  listenTo(windowEvent("elementor/panel/init"), () => registerRoute(V2_PANEL));
  listenTo(routeOpenEvent(V2_PANEL), () => {
    getV1PanelElements().forEach((el) => {
      el.setAttribute("hidden", "hidden");
      el.setAttribute("inert", "true");
    });
  });
  listenTo(routeCloseEvent(V2_PANEL), () => selectOpenId(__getState()) && __dispatch(slice_default.actions.close()));
  listenTo(routeCloseEvent(V2_PANEL), () => {
    getV1PanelElements().forEach((el) => {
      el.removeAttribute("hidden");
      el.removeAttribute("inert");
    });
  });
  listenTo(
    windowEvent("elementor/panel/init"),
    () => subscribe({
      on: (state) => selectOpenId(state),
      when: ({ prev, current }) => !!(!prev && current),
      // is panel opened
      callback: () => openRoute(V2_PANEL)
    })
  );
  listenTo(
    windowEvent("elementor/panel/init"),
    () => subscribe({
      on: (state) => selectOpenId(state),
      when: ({ prev, current }) => !!(!current && prev),
      // is panel closed
      callback: () => isRouteActive(V2_PANEL) && openRoute(getDefaultRoute())
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
  originalSubscribe(() => {
    const current = on(__getState());
    if (when({ prev, current })) {
      callback({ prev, current });
    }
    prev = current;
  });
}

// src/components/internal/portal.tsx
function Portal(props) {
  const containerRef = useRef(getPortalContainer);
  if (!containerRef.current) {
    return null;
  }
  return /* @__PURE__ */ React.createElement(BasePortal, { container: containerRef.current, ...props });
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
  __registerSlice(slice_default);
  injectIntoTop({ id: "panels", component: Panels });
}

// src/api.ts
import { __privateUseRouteStatus as useRouteStatus } from "@elementor/editor-v1-adapters";
import { __useDispatch as useDispatch, __useSelector as useSelector2 } from "@elementor/store";
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
    const openPanelId = useSelector2(selectOpenId);
    const v1PanelStatus = useRouteStatus(V2_PANEL, options);
    return {
      isOpen: openPanelId === id && v1PanelStatus.isActive,
      isBlocked: v1PanelStatus.isBlocked
    };
  };
}
function createUseActions(id, useStatus, options = {}) {
  let stateSnapshot = null;
  return () => {
    const dispatch = useDispatch();
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
import * as React3 from "react";
import { Drawer } from "@elementor/ui";
function Panel({ children, sx, ...props }) {
  return /* @__PURE__ */ React3.createElement(
    Drawer,
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
import * as React4 from "react";
import { Box, styled } from "@elementor/ui";
var Header = styled(Box)(({ theme }) => ({
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
import * as React5 from "react";
import { styled as styled2, Typography as TypographySource } from "@elementor/ui";
var Typography = styled2(TypographySource)(({ theme, variant = "body1" }) => {
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
import * as React6 from "react";
import { Box as Box2 } from "@elementor/ui";
function PanelBody({ children, sx, ...props }) {
  return /* @__PURE__ */ React6.createElement(
    Box2,
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
import * as React7 from "react";
import { Box as Box3, Divider } from "@elementor/ui";
function PanelFooter({ children, sx, ...props }) {
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(Divider, null), /* @__PURE__ */ React7.createElement(
    Box3,
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
export {
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  PanelHeaderTitle,
  createPanel as __createPanel,
  registerPanel as __registerPanel,
  init
};
//# sourceMappingURL=index.mjs.map