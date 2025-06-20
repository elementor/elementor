// src/init.ts
import { injectIntoTop } from "@elementor/editor";
import { __registerSlice as registerSlice } from "@elementor/store";

// src/components/notifications.tsx
import * as React2 from "react";
import { forwardRef } from "react";
import { SnackbarProvider } from "notistack";
import { __getStore as getStore, __useDispatch as useDispatch2, __useSelector as useSelector } from "@elementor/store";
import { SnackbarContent, ThemeProvider } from "@elementor/ui";

// src/hooks/use-enqueue-notifications.tsx
import { Fragment, useEffect } from "react";
import * as React from "react";
import { closeSnackbar, useSnackbar } from "notistack";
import { __useDispatch as useDispatch } from "@elementor/store";
import { Button, CloseButton } from "@elementor/ui";

// src/slice.ts
import { __createSlice as createSlice } from "@elementor/store";
var notificationsSlice = createSlice({
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
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  useEffect(() => {
    Object.values(notifications).forEach((notification) => {
      const Action = () => /* @__PURE__ */ React.createElement(Fragment, { key: notification.id }, notification.additionalActionProps?.map((additionalAction, index) => /* @__PURE__ */ React.createElement(Button, { key: `${index}`, ...additionalAction })), /* @__PURE__ */ React.createElement(
        CloseButton,
        {
          "aria-label": "close",
          color: "inherit",
          onClick: () => {
            closeSnackbar(notification.id);
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
var DefaultCustomSnackbar = forwardRef((props, ref) => {
  const filteredProps = getFilteredSnackbarProps(props);
  const panelWidth = getEditingPanelWidth();
  return /* @__PURE__ */ React2.createElement(ThemeProvider, { palette: "unstable" }, /* @__PURE__ */ React2.createElement(
    SnackbarContent,
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
  const notifications = useSelector((state) => state.notifications);
  useEnqueueNotification(notifications);
  return null;
};
var Wrapper = () => {
  return /* @__PURE__ */ React2.createElement(
    SnackbarProvider,
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
  const store = getStore();
  store?.dispatch(notifyAction(notification));
}
function NotifyReact(notification) {
  const dispatch = useDispatch2();
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
  registerSlice(notificationsSlice);
  injectIntoTop({
    id: "notifications",
    component: notifications_default
  });
}
export {
  NotifyReact,
  init,
  notify
};
//# sourceMappingURL=index.mjs.map