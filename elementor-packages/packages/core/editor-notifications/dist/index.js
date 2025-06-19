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
  NotifyReact: () => NotifyReact,
  init: () => init,
  notify: () => notify
});
module.exports = __toCommonJS(index_exports);

// src/init.ts
var import_editor = require("@elementor/editor");
var import_store4 = require("@elementor/store");

// src/components/notifications.tsx
var React2 = __toESM(require("react"));
var import_react2 = require("react");
var import_notistack2 = require("notistack");
var import_store3 = require("@elementor/store");
var import_ui2 = require("@elementor/ui");

// src/hooks/use-enqueue-notifications.tsx
var import_react = require("react");
var React = __toESM(require("react"));
var import_notistack = require("notistack");
var import_store2 = require("@elementor/store");
var import_ui = require("@elementor/ui");

// src/slice.ts
var import_store = require("@elementor/store");
var notificationsSlice = (0, import_store.__createSlice)({
  name: "notifications",
  initialState: {},
  reducers: {
    notifyAction: (state, action) => {
      const newState = { ...state };
      if (!newState[action.payload.id]) {
        newState[action.payload.id] = action.payload;
      }
      return newState;
    },
    clearAction: (state, action) => {
      const newState = { ...state };
      if (newState[action.payload.id]) {
        delete newState[action.payload.id];
      }
      return newState;
    }
  }
});
var { notifyAction, clearAction } = notificationsSlice.actions;

// src/hooks/use-enqueue-notifications.tsx
var useEnqueueNotification = (notifications) => {
  const { enqueueSnackbar } = (0, import_notistack.useSnackbar)();
  const dispatch = (0, import_store2.__useDispatch)();
  (0, import_react.useEffect)(() => {
    Object.values(notifications).forEach((notification) => {
      const Action = () => /* @__PURE__ */ React.createElement(import_react.Fragment, { key: notification.id }, notification.additionalActionProps?.map((additionalAction, index) => /* @__PURE__ */ React.createElement(import_ui.Button, { key: `${index}`, ...additionalAction })), /* @__PURE__ */ React.createElement(
        import_ui.CloseButton,
        {
          "aria-label": "close",
          color: "inherit",
          onClick: () => {
            (0, import_notistack.closeSnackbar)(notification.id);
            dispatch(clearAction({ id: notification.id }));
          }
        }
      ));
      enqueueSnackbar(notification.message, {
        persist: true,
        variant: notification.type,
        key: notification.id,
        onClose: () => dispatch(clearAction({ id: notification.id })),
        preventDuplicate: true,
        action: /* @__PURE__ */ React.createElement(Action, null)
      });
    });
  }, [notifications, enqueueSnackbar, dispatch]);
};

// src/sync/get-editing-panel-width.ts
function getEditingPanelWidth() {
  return document.querySelector(".elementor-panel")?.clientWidth || 0;
}

// src/components/notifications.tsx
var DefaultCustomSnackbar = (0, import_react2.forwardRef)((props, ref) => {
  const filteredProps = getFilteredSnackbarProps(props);
  const panelWidth = getEditingPanelWidth();
  return /* @__PURE__ */ React2.createElement(import_ui2.ThemeProvider, { palette: "unstable" }, /* @__PURE__ */ React2.createElement(
    import_ui2.SnackbarContent,
    {
      ref,
      ...filteredProps,
      sx: {
        "&.MuiPaper-root": { minWidth: "max-content" },
        ml: panelWidth + "px"
      }
    }
  ));
});
var muiToEuiMapper = {
  default: DefaultCustomSnackbar
};
var Handler = () => {
  const notifications = (0, import_store3.__useSelector)((state) => state.notifications);
  useEnqueueNotification(notifications);
  return null;
};
var Wrapper = () => {
  return /* @__PURE__ */ React2.createElement(
    import_notistack2.SnackbarProvider,
    {
      maxSnack: 3,
      autoHideDuration: 8e3,
      anchorOrigin: { horizontal: "center", vertical: "bottom" },
      Components: muiToEuiMapper
    },
    /* @__PURE__ */ React2.createElement(Handler, null)
  );
};
function notify(notification) {
  const store = (0, import_store3.__getStore)();
  store?.dispatch(notifyAction(notification));
}
function NotifyReact(notification) {
  const dispatch = (0, import_store3.__useDispatch)();
  dispatch(notifyAction(notification));
}
function getFilteredSnackbarProps(props) {
  const forbiddenProps = ["autoHideDuration", "persist", "hideIconVariant", "iconVariant", "anchorOrigin"];
  return Object.entries(props).reduce(
    (filteredProps, [key, value]) => {
      if (!forbiddenProps.includes(key)) {
        filteredProps[key] = value;
      }
      return filteredProps;
    },
    {}
  );
}
var notifications_default = Wrapper;

// src/init.ts
function init() {
  (0, import_store4.__registerSlice)(notificationsSlice);
  (0, import_editor.injectIntoTop)({
    id: "notifications",
    component: notifications_default
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NotifyReact,
  init,
  notify
});
//# sourceMappingURL=index.js.map