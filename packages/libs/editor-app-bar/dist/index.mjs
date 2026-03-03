// src/locations.ts
import { createLocation } from "@elementor/locations";
import { createMenu } from "@elementor/menus";

// src/components/actions/action.tsx
import * as React4 from "react";

// src/contexts/menu-context.tsx
import * as React from "react";
import { createContext, useContext } from "react";
var MenuContext = createContext({
  type: "toolbar"
});
function MenuContextProvider({ type, popupState, children }) {
  return /* @__PURE__ */ React.createElement(MenuContext.Provider, { value: { type, popupState } }, children);
}
function useMenuContext() {
  return useContext(MenuContext);
}

// src/components/ui/popover-menu-item.tsx
import * as React2 from "react";
import { ArrowUpRightIcon, ChevronRightIcon } from "@elementor/icons";
import { ListItemIcon, ListItemText, MenuItem, withDirection } from "@elementor/ui";
var DirectionalArrowIcon = withDirection(ArrowUpRightIcon);
var DirectionalChevronIcon = withDirection(ChevronRightIcon);
function PopoverMenuItem({
  text,
  icon,
  onClick,
  href,
  target,
  disabled,
  isGroupParent,
  showExternalLinkIcon,
  ...props
}) {
  const isExternalLink = href && target === "_blank" && showExternalLinkIcon;
  return /* @__PURE__ */ React2.createElement(
    MenuItem,
    {
      ...props,
      disabled,
      onClick,
      component: href ? "a" : "div",
      href,
      target,
      sx: {
        "&:hover": {
          color: "text.primary"
          // Overriding global CSS from the editor.
        }
      }
    },
    /* @__PURE__ */ React2.createElement(ListItemIcon, null, icon),
    /* @__PURE__ */ React2.createElement(ListItemText, { primary: text }),
    isExternalLink && /* @__PURE__ */ React2.createElement(DirectionalArrowIcon, null),
    isGroupParent && /* @__PURE__ */ React2.createElement(DirectionalChevronIcon, null)
  );
}

// src/components/ui/toolbar-menu-item.tsx
import * as React3 from "react";
import { Box, IconButton, Tooltip as BaseTooltip } from "@elementor/ui";
function ToolbarMenuItem({ title, ...props }) {
  return /* @__PURE__ */ React3.createElement(Tooltip, { title }, /* @__PURE__ */ React3.createElement(Box, { component: "span", "aria-label": void 0 }, /* @__PURE__ */ React3.createElement(
    IconButton,
    {
      ...props,
      "aria-label": title,
      size: "medium",
      sx: {
        "& svg": {
          fontSize: "1.25rem",
          height: "1em",
          width: "1em"
        },
        "&:hover": {
          color: "text.primary"
        }
      }
    }
  )));
}
function Tooltip(props) {
  return /* @__PURE__ */ React3.createElement(
    BaseTooltip,
    {
      PopperProps: {
        sx: {
          "&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom": {
            mt: 2
          }
        }
      },
      ...props
    }
  );
}

// src/components/actions/action.tsx
function Action({ icon: Icon, title, visible = true, ...props }) {
  const { type } = useMenuContext();
  if (!visible) {
    return null;
  }
  return type === "toolbar" ? /* @__PURE__ */ React4.createElement(ToolbarMenuItem, { title, ...props }, /* @__PURE__ */ React4.createElement(Icon, null)) : /* @__PURE__ */ React4.createElement(PopoverMenuItem, { ...props, text: title, icon: /* @__PURE__ */ React4.createElement(Icon, null) });
}

// src/components/actions/link.tsx
import * as React5 from "react";
function Link({ icon: Icon, title, visible = true, showExternalLinkIcon = false, ...props }) {
  const { type } = useMenuContext();
  if (!visible) {
    return null;
  }
  return type === "toolbar" ? /* @__PURE__ */ React5.createElement(ToolbarMenuItem, { title, ...props }, /* @__PURE__ */ React5.createElement(Icon, null)) : /* @__PURE__ */ React5.createElement(PopoverMenuItem, { ...props, text: title, icon: /* @__PURE__ */ React5.createElement(Icon, null), showExternalLinkIcon });
}

// src/components/actions/toggle-action.tsx
import * as React7 from "react";

// src/components/ui/toolbar-menu-toggle-item.tsx
import * as React6 from "react";
import { Box as Box2, ToggleButton, Tooltip as Tooltip2 } from "@elementor/ui";
function ToolbarMenuToggleItem({ title, onClick, ...props }) {
  return /* @__PURE__ */ React6.createElement(Tooltip2, { title }, /* @__PURE__ */ React6.createElement(Box2, { component: "span", "aria-label": void 0 }, /* @__PURE__ */ React6.createElement(
    ToggleButton,
    {
      ...props,
      onChange: onClick,
      "aria-label": title,
      size: "small",
      sx: {
        border: 0,
        // Temp fix until the style of the ToggleButton component will be decided.
        "&.Mui-disabled": {
          border: 0
          // Temp fix until the style of the ToggleButton component will be decided.
        },
        "& svg": {
          fontSize: "1.25rem",
          height: "1em",
          width: "1em"
        }
      }
    }
  )));
}

// src/components/actions/toggle-action.tsx
function ToggleAction({ icon: Icon, title, value, visible = true, ...props }) {
  const { type } = useMenuContext();
  if (!visible) {
    return null;
  }
  return type === "toolbar" ? /* @__PURE__ */ React7.createElement(ToolbarMenuToggleItem, { value: value || title, title, ...props }, /* @__PURE__ */ React7.createElement(Icon, null)) : /* @__PURE__ */ React7.createElement(PopoverMenuItem, { ...props, text: title, icon: /* @__PURE__ */ React7.createElement(Icon, null) });
}

// src/locations.ts
var { inject: injectIntoPageIndication, Slot: PageIndicationSlot } = createLocation();
var { inject: injectIntoResponsive, Slot: ResponsiveSlot } = createLocation();
var { inject: injectIntoPrimaryAction, Slot: PrimaryActionSlot } = createLocation();
var components = {
  Action,
  ToggleAction,
  Link
};
var mainMenu = createMenu({
  groups: ["help", "exits"],
  components
});
var toolsMenu = createMenu({ components });
var utilitiesMenu = createMenu({ components });
var integrationsMenu = createMenu({ components });

// src/extensions/documents-save/locations.ts
import { createMenu as createMenu2 } from "@elementor/menus";
var documentOptionsMenu = createMenu2({
  groups: ["save"],
  components: {
    Action,
    ToggleAction,
    Link
  }
});

// src/init.ts
import { injectIntoTop as injectIntoTop2 } from "@elementor/editor";

// src/components/app-bar.tsx
import * as React20 from "react";
import { __useActiveDocument as useActiveDocument } from "@elementor/editor-documents";
import { AppBar as BaseAppBar, Box as Box3, Divider as Divider2, Grid, ThemeProvider as ThemeProvider2, Toolbar } from "@elementor/ui";

// src/components/locations/main-menu-location.tsx
import * as React10 from "react";
import { bindMenu, bindTrigger, Divider, Stack, usePopupState } from "@elementor/ui";

// src/components/ui/popover-menu.tsx
import * as React8 from "react";
import { Menu } from "@elementor/ui";
function PopoverMenu({ children, popupState, ...props }) {
  return /* @__PURE__ */ React8.createElement(MenuContextProvider, { type: "popover", popupState }, /* @__PURE__ */ React8.createElement(
    Menu,
    {
      PaperProps: {
        sx: { mt: 1.5 }
      },
      ...props,
      MenuListProps: {
        component: "div",
        dense: true
      }
    },
    children
  ));
}

// src/components/ui/toolbar-logo.tsx
import * as React9 from "react";
import { useState } from "react";
import { styled, SvgIcon, ToggleButton as ToggleButton2 } from "@elementor/ui";
import { __ } from "@wordpress/i18n";
var ElementorLogo = (props) => {
  return /* @__PURE__ */ React9.createElement(SvgIcon, { viewBox: "0 0 32 32", ...props }, /* @__PURE__ */ React9.createElement("g", null, /* @__PURE__ */ React9.createElement("circle", { cx: "16", cy: "16", r: "16" }), /* @__PURE__ */ React9.createElement("path", { d: "M11.7 9H9V22.3H11.7V9Z" }), /* @__PURE__ */ React9.createElement("path", { d: "M22.4 9H9V11.7H22.4V9Z" }), /* @__PURE__ */ React9.createElement("path", { d: "M22.4 14.4004H9V17.1004H22.4V14.4004Z" }), /* @__PURE__ */ React9.createElement("path", { d: "M22.4 19.6992H9V22.3992H22.4V19.6992Z" })));
};
var StyledToggleButton = styled(ToggleButton2)(({ theme }) => ({
  padding: 0,
  border: 0,
  color: theme.palette.text.primary,
  "&.MuiToggleButton-root:hover": {
    backgroundColor: "initial"
  },
  "&.MuiToggleButton-root.Mui-selected": {
    backgroundColor: "initial"
  }
}));
var StyledElementorLogo = styled(ElementorLogo, {
  shouldForwardProp: (prop) => prop !== "showMenuIcon"
})(({ theme, showMenuIcon }) => ({
  "& path": {
    fill: theme.palette.background.default,
    transition: "all 0.2s linear",
    transformOrigin: "bottom left",
    "&:first-of-type": {
      transitionDelay: !showMenuIcon && "0.2s",
      transform: showMenuIcon && "translateY(-9px) scaleY(0)"
    },
    "&:not(:first-of-type)": {
      // Emotion automatically change 4 to -4 in RTL mode.
      transform: !showMenuIcon && `translateX(${theme.direction === "rtl" ? "4" : "9"}px) scaleX(0.6)`
    },
    "&:nth-of-type(2)": {
      transitionDelay: showMenuIcon ? "0" : "0.2s"
    },
    "&:nth-of-type(3)": {
      transitionDelay: "0.1s"
    },
    "&:nth-of-type(4)": {
      transitionDelay: showMenuIcon ? "0.2s" : "0"
    }
  }
}));
function ToolbarLogo(props) {
  const [isHoverState, setIsHoverState] = useState(false);
  const showMenuIcon = props.selected || isHoverState;
  return /* @__PURE__ */ React9.createElement(
    StyledToggleButton,
    {
      ...props,
      value: "selected",
      size: "large",
      onMouseEnter: () => setIsHoverState(true),
      onMouseLeave: () => setIsHoverState(false)
    },
    /* @__PURE__ */ React9.createElement(
      StyledElementorLogo,
      {
        fontSize: "large",
        showMenuIcon,
        titleAccess: __("Elementor Logo", "elementor")
      }
    )
  );
}

// src/components/locations/main-menu-location.tsx
var { useMenuItems } = mainMenu;
function MainMenuLocation() {
  const menuItems = useMenuItems();
  const popupState = usePopupState({
    variant: "popover",
    popupId: "elementor-v2-app-bar-main-menu"
  });
  const toolbarLogoProps = bindTrigger(popupState);
  const onToolbarClick = (e) => {
    const extendedWindow2 = window;
    const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
    if (config) {
      extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.elementorLogoDropdown, {
        location: config.locations.topBar,
        secondaryLocation: config.secondaryLocations.eLogoMenu,
        trigger: config.triggers.dropdownClick,
        element: config.elements.buttonIcon
      });
    }
    toolbarLogoProps.onClick(e);
  };
  return /* @__PURE__ */ React10.createElement(Stack, { sx: { paddingInlineStart: 3 }, direction: "row", alignItems: "center" }, /* @__PURE__ */ React10.createElement(ToolbarLogo, { ...toolbarLogoProps, onClick: onToolbarClick, selected: popupState.isOpen }), /* @__PURE__ */ React10.createElement(PopoverMenu, { onClick: popupState.close, ...bindMenu(popupState), marginThreshold: 8 }, menuItems.default.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React10.createElement(MenuItem2, { key: id })), /* @__PURE__ */ React10.createElement(Divider, null), menuItems.help.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React10.createElement(MenuItem2, { key: id })), menuItems.exits.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React10.createElement(MenuItem2, { key: id }))));
}

// src/components/locations/page-indication-location.tsx
import * as React11 from "react";
function PageIndicationLocation() {
  return /* @__PURE__ */ React11.createElement(PageIndicationSlot, null);
}

// src/components/locations/primary-action-location.tsx
import * as React12 from "react";
function PrimaryActionLocation() {
  return /* @__PURE__ */ React12.createElement(PrimaryActionSlot, null);
}

// src/components/locations/responsive-location.tsx
import * as React13 from "react";
function ResponsiveLocation() {
  return /* @__PURE__ */ React13.createElement(ResponsiveSlot, null);
}

// src/components/locations/tools-menu-location.tsx
import * as React18 from "react";

// src/components/ui/toolbar-menu.tsx
import * as React14 from "react";
import { Stack as Stack2 } from "@elementor/ui";
function ToolbarMenu({ children, ...props }) {
  return /* @__PURE__ */ React14.createElement(MenuContextProvider, { type: "toolbar" }, /* @__PURE__ */ React14.createElement(Stack2, { sx: { px: 1.5 }, spacing: 1.5, direction: "row", alignItems: "center", ...props }, children));
}

// src/components/ui/toolbar-menu-more.tsx
import * as React15 from "react";
import { DotsVerticalIcon } from "@elementor/icons";
import { bindMenu as bindMenu2, bindTrigger as bindTrigger2, usePopupState as usePopupState2 } from "@elementor/ui";
import { __ as __2 } from "@wordpress/i18n";
function ToolbarMenuMore({ children, id }) {
  const popupState = usePopupState2({
    variant: "popover",
    popupId: id
  });
  return /* @__PURE__ */ React15.createElement(React15.Fragment, null, /* @__PURE__ */ React15.createElement(ToolbarMenuItem, { ...bindTrigger2(popupState), title: __2("More", "elementor") }, /* @__PURE__ */ React15.createElement(DotsVerticalIcon, null)), /* @__PURE__ */ React15.createElement(PopoverMenu, { onClick: popupState.close, ...bindMenu2(popupState) }, children));
}

// src/components/locations/integrations-menu-location.tsx
import * as React16 from "react";
import { PlugIcon } from "@elementor/icons";
import { bindMenu as bindMenu3, bindTrigger as bindTrigger3, usePopupState as usePopupState3 } from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";
var { useMenuItems: useMenuItems2 } = integrationsMenu;
function IntegrationsMenuLocation() {
  const menuItems = useMenuItems2();
  const popupState = usePopupState3({
    variant: "popover",
    popupId: "elementor-v2-app-bar-integrations"
  });
  if (menuItems.default.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React16.createElement(React16.Fragment, null, /* @__PURE__ */ React16.createElement(ToolbarMenuItem, { ...bindTrigger3(popupState), title: __3("Integrations", "elementor") }, /* @__PURE__ */ React16.createElement(PlugIcon, null)), /* @__PURE__ */ React16.createElement(
    PopoverMenu,
    {
      onClick: popupState.close,
      ...bindMenu3(popupState),
      marginThreshold: 8,
      open: popupState.isOpen
    },
    menuItems.default.map(({ MenuItem: IntegrationsMenuItem, id }) => /* @__PURE__ */ React16.createElement(IntegrationsMenuItem, { key: id }))
  ));
}

// src/components/locations/send-feedback-popup-location.tsx
import * as React17 from "react";
import { useEffect, useState as useState2 } from "react";
import { ThemeProvider } from "@elementor/editor-ui";
import { isExperimentActive } from "@elementor/editor-v1-adapters";
import { useMixpanel } from "@elementor/events";
import { httpService } from "@elementor/http-client";
import { AlertCircleIcon, CheckIcon } from "@elementor/icons";
import {
  bindDialog,
  Button,
  CloseButton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Popover,
  Stack as Stack3,
  TextField,
  usePopupState as usePopupState4
} from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";

// src/extensions/feedback/feedback-consts.ts
var EXPERIMENT_NAME = "in_editor_feedback";
var FEEDBACK_TOGGLE_EVENT = "elementor/open-feedback";

// src/components/locations/send-feedback-popup-location.tsx
var checkIfUserIsConnected = () => {
  const extendedWindow2 = window;
  return extendedWindow2?.elementorCommon?.config.library_connect.is_connected || extendedWindow2?.elementorPro?.config.isActive;
};
function SendFeedbackPopupLocation() {
  const isActive = isExperimentActive(EXPERIMENT_NAME);
  const extendedWindow2 = window;
  const [isUserConnected, setIsUserConnected] = useState2(checkIfUserIsConnected());
  const connectUrl = extendedWindow2?.elementor?.config.user.top_bar.connect_url;
  const [feedbackContent, setFeedbackContent] = useState2("");
  const [feedbackResult, setFeedbackResult] = useState2(null);
  const [submitDisabled, setSubmitDisabled] = useState2(true);
  const { dispatchEvent: trackEvent = (...args) => void args } = useMixpanel();
  const popupState = usePopupState4({
    variant: "dialog",
    popupId: FEEDBACK_TOGGLE_EVENT
  });
  const [isFetching, setIsFetching] = useState2(false);
  useEffect(() => {
    const handler = () => {
      popupState.toggle();
      setIsUserConnected(checkIfUserIsConnected());
      setFeedbackResult(null);
      trackEvent("feedback_modal_opened", {
        source: "top_bar",
        context: "v4_beta"
      });
    };
    window.addEventListener(FEEDBACK_TOGGLE_EVENT, handler);
    return () => {
      window.removeEventListener(FEEDBACK_TOGGLE_EVENT, handler);
    };
  }, [popupState, trackEvent]);
  useEffect(() => {
    setSubmitDisabled(feedbackContent.trim().length < 10 || !isUserConnected || isFetching);
  }, [feedbackContent, feedbackResult, isUserConnected, isFetching]);
  const handleClose = () => {
    popupState.close();
    trackEvent("feedback_modal_closed", {
      feedback_text: feedbackContent
    });
  };
  const handleStartAntoher = () => {
    setFeedbackContent("");
    setFeedbackResult(null);
  };
  const submitFeedback = () => {
    setIsFetching(true);
    httpService().post("elementor/v1/feedback/submit", {
      description: feedbackContent.trim()
    }).then((response) => {
      setFeedbackResult({
        message: response.data.message,
        success: response.data.success
      });
      if (!response.data.success && response.data.code.toString() === "401" || response.data.code.toString() === "403") {
        setIsUserConnected(false);
      }
      trackEvent(response.data.success ? "feedback_submitted" : "feedback_error", {
        feedback_length: feedbackContent.length,
        error_type: response.data.success ? void 0 : "server",
        error_message: response.data.success ? void 0 : response.data.message
      });
    }).finally(() => setIsFetching(false));
  };
  if (!isActive) {
    return null;
  }
  return /* @__PURE__ */ React17.createElement(ThemeProvider, null, /* @__PURE__ */ React17.createElement(Popover, { ...bindDialog(popupState), onClose: () => handleClose() }, /* @__PURE__ */ React17.createElement(Dialog, { open: popupState.isOpen }, /* @__PURE__ */ React17.createElement(DialogHeader, { style: { width: "100%", minWidth: "35rem" } }, /* @__PURE__ */ React17.createElement(DialogTitle, { style: { width: "100%" } }, /* @__PURE__ */ React17.createElement(
    Stack3,
    {
      display: "flex",
      direction: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%"
    },
    __4("Submit Feedback", "elementor"),
    /* @__PURE__ */ React17.createElement(CloseButton, { onClick: popupState.close })
  ))), /* @__PURE__ */ React17.createElement(DialogContent, null, /* @__PURE__ */ React17.createElement(Stack3, { direction: "column", gap: 2 }, isUserConnected ? /* @__PURE__ */ React17.createElement(React17.Fragment, null, /* @__PURE__ */ React17.createElement(
    TextField,
    {
      autofocus: true,
      placeholder: __4(
        "E.g. Can you add ABC features? I want to do ABC and it\u2019s important because \u2026",
        "elementor"
      ),
      fullwith: true,
      label: __4("Your Feedback", "elementor"),
      multiline: true,
      id: "elementor-feedback-usercontent",
      rows: 6,
      cols: 80,
      disabled: isFetching || feedbackResult?.success,
      onChange: (event) => setFeedbackContent(event.target.value),
      value: feedbackContent
    }
  ), /* @__PURE__ */ React17.createElement(Stack3, { direction: "row", justifyContent: "flex-end", alignItems: "center", gap: 2 }, feedbackResult && /* @__PURE__ */ React17.createElement(React17.Fragment, null, feedbackResult.success ? /* @__PURE__ */ React17.createElement(CheckIcon, { color: "success" }) : /* @__PURE__ */ React17.createElement(AlertCircleIcon, { color: "error" }), feedbackResult.message), feedbackResult?.success ? /* @__PURE__ */ React17.createElement(Button, { variant: "text", onClick: () => handleStartAntoher() }, __4("Submit Another Feedback", "elementor")) : /* @__PURE__ */ React17.createElement(
    Button,
    {
      disabled: submitDisabled,
      onClick: submitFeedback,
      variant: "contained",
      color: "primary",
      size: "small"
    },
    __4("Submit", "elementor")
  ))) : /* @__PURE__ */ React17.createElement(React17.Fragment, null, /* @__PURE__ */ React17.createElement(
    Button,
    {
      variant: "contained",
      color: "primary",
      size: "large",
      href: connectUrl,
      target: "_blank",
      rel: "noopener",
      onClick: popupState.close
    },
    __4("Connect to Elementor", "elementor")
  )))))));
}

// src/components/locations/tools-menu-location.tsx
var MAX_TOOLBAR_ACTIONS = 5;
var { useMenuItems: useMenuItems3 } = toolsMenu;
function ToolsMenuLocation() {
  const menuItems = useMenuItems3();
  const toolbarMenuItems = menuItems.default.slice(0, MAX_TOOLBAR_ACTIONS);
  const popoverMenuItems = menuItems.default.slice(MAX_TOOLBAR_ACTIONS);
  return /* @__PURE__ */ React18.createElement(ToolbarMenu, null, toolbarMenuItems.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React18.createElement(MenuItem2, { key: id })), /* @__PURE__ */ React18.createElement(SendFeedbackPopupLocation, null), /* @__PURE__ */ React18.createElement(IntegrationsMenuLocation, null), popoverMenuItems.length > 0 && /* @__PURE__ */ React18.createElement(ToolbarMenuMore, { id: "elementor-editor-app-bar-tools-more" }, popoverMenuItems.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React18.createElement(MenuItem2, { key: id }))));
}

// src/components/locations/utilities-menu-location.tsx
import * as React19 from "react";
import { Fragment as Fragment4 } from "react";
var MAX_TOOLBAR_ACTIONS2 = 4;
var { useMenuItems: useMenuItems4 } = utilitiesMenu;
function UtilitiesMenuLocation() {
  const menuItems = useMenuItems4();
  const shouldUsePopover = menuItems.default.length > MAX_TOOLBAR_ACTIONS2 + 1;
  const toolbarMenuItems = shouldUsePopover ? menuItems.default.slice(0, MAX_TOOLBAR_ACTIONS2) : menuItems.default;
  const popoverMenuItems = shouldUsePopover ? menuItems.default.slice(MAX_TOOLBAR_ACTIONS2) : [];
  return /* @__PURE__ */ React19.createElement(ToolbarMenu, null, toolbarMenuItems.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React19.createElement(Fragment4, { key: id }, /* @__PURE__ */ React19.createElement(MenuItem2, null))), popoverMenuItems.length > 0 && /* @__PURE__ */ React19.createElement(ToolbarMenuMore, { id: "elementor-editor-app-bar-utilities-more" }, popoverMenuItems.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React19.createElement(MenuItem2, { key: id }))));
}

// src/components/app-bar.tsx
function AppBar() {
  const document2 = useActiveDocument();
  return /* @__PURE__ */ React20.createElement(ThemeProvider2, { colorScheme: "dark" }, /* @__PURE__ */ React20.createElement(BaseAppBar, { position: "sticky" }, /* @__PURE__ */ React20.createElement(Toolbar, { disableGutters: true, variant: "dense" }, /* @__PURE__ */ React20.createElement(Box3, { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", flexGrow: 1 }, /* @__PURE__ */ React20.createElement(Grid, { container: true, flexWrap: "nowrap" }, /* @__PURE__ */ React20.createElement(MainMenuLocation, null), document2?.permissions?.allowAddingWidgets && /* @__PURE__ */ React20.createElement(ToolsMenuLocation, null)), /* @__PURE__ */ React20.createElement(Grid, { container: true, justifyContent: "center" }, /* @__PURE__ */ React20.createElement(ToolbarMenu, { spacing: 1.5 }, /* @__PURE__ */ React20.createElement(Divider2, { orientation: "vertical" }), /* @__PURE__ */ React20.createElement(PageIndicationLocation, null), /* @__PURE__ */ React20.createElement(Divider2, { orientation: "vertical" }), /* @__PURE__ */ React20.createElement(ResponsiveLocation, null), /* @__PURE__ */ React20.createElement(Divider2, { orientation: "vertical" }))), /* @__PURE__ */ React20.createElement(Grid, { container: true, justifyContent: "flex-end", flexWrap: "nowrap" }, /* @__PURE__ */ React20.createElement(UtilitiesMenuLocation, null), /* @__PURE__ */ React20.createElement(PrimaryActionLocation, null))))));
}

// src/extensions/connect/hooks/use-connect-link-config.tsx
import { useCallback } from "react";
import { UserIcon } from "@elementor/icons";
import { __ as __5 } from "@wordpress/i18n";
var dispatchConnectClickEvent = (eventName) => {
  try {
    const extendedWindow2 = window;
    const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
    if (config) {
      extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar[eventName], {
        location: config.locations.topBar,
        secondaryLocation: config.secondaryLocations.eLogoMenu,
        trigger: config.triggers.dropdownClick,
        element: config.elements.buttonIcon
      });
    }
  } catch (error) {
    console.warn(error);
  }
};
function useConnectLinkConfig() {
  const extendedWindow2 = window;
  let isUserConnected = false;
  const isPro = extendedWindow2?.elementor?.helpers.hasPro();
  let target = "_blank";
  if (isPro) {
    isUserConnected = extendedWindow2?.elementorPro?.config.isActive ?? false;
  } else {
    isUserConnected = extendedWindow2?.elementorCommon?.config.library_connect.is_connected ?? false;
    target = "_self";
  }
  const handleConnectClick = useCallback(
    (event) => {
      event.preventDefault();
      if (extendedWindow2.jQuery && extendedWindow2.jQuery.fn?.elementorConnect) {
        const connectUrl = extendedWindow2?.elementor?.config.user.top_bar.connect_url;
        const $tempButton = extendedWindow2.jQuery("<a>");
        $tempButton?.attr("href", connectUrl)?.attr("target", "_blank")?.attr("rel", "opener")?.css("display", "none")?.appendTo("body");
        $tempButton.elementorConnect({
          success: () => {
            dispatchConnectClickEvent("accountConnected");
            setTimeout(() => {
              extendedWindow2.location.reload();
            }, 200);
          }
        });
        $tempButton[0].click();
        dispatchConnectClickEvent("connectAccount");
        setTimeout(() => {
          $tempButton.remove();
        }, 1e3);
      }
    },
    [extendedWindow2]
  );
  return isUserConnected ? {
    title: __5("My Elementor", "elementor"),
    href: extendedWindow2?.elementor?.config.user.top_bar.my_elementor_url,
    icon: UserIcon,
    target: "_blank"
  } : {
    title: __5("Connect my account", "elementor"),
    href: extendedWindow2?.elementor?.config.user.top_bar.connect_url,
    icon: UserIcon,
    target,
    onClick: handleConnectClick
  };
}

// src/extensions/connect/index.ts
function init() {
  mainMenu.registerLink({
    id: "app-bar-connect",
    group: "exits",
    priority: 10,
    useProps: useConnectLinkConfig
  });
}

// src/extensions/documents-preview/hooks/use-action-props.ts
import { __useActiveDocument as useActiveDocument2 } from "@elementor/editor-documents";
import { __privateRunCommand as runCommand } from "@elementor/editor-v1-adapters";
import { EyeIcon } from "@elementor/icons";
import { __ as __6 } from "@wordpress/i18n";
function useActionProps() {
  const document2 = useActiveDocument2();
  return {
    icon: EyeIcon,
    title: __6("Preview Changes", "elementor"),
    onClick: () => {
      const extendedWindow2 = window;
      const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
      if (config) {
        extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.previewPage, {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations["preview-page"],
          trigger: config.triggers.click,
          element: config.elements.buttonIcon
        });
      }
      if (document2) {
        runCommand("editor/documents/preview", {
          id: document2.id,
          force: true
        });
      }
    }
  };
}

// src/extensions/documents-preview/index.ts
function init2() {
  utilitiesMenu.registerAction({
    id: "document-preview-button",
    priority: 30,
    useProps: useActionProps
  });
}

// src/extensions/documents-save/components/primary-action.tsx
import * as React22 from "react";
import {
  __useActiveDocument as useActiveDocument3,
  __useActiveDocumentActions as useActiveDocumentActions
} from "@elementor/editor-documents";
import { useEditMode } from "@elementor/editor-v1-adapters";
import { ChevronDownIcon } from "@elementor/icons";
import {
  bindMenu as bindMenu4,
  bindTrigger as bindTrigger4,
  Box as Box4,
  Button as Button2,
  ButtonGroup,
  CircularProgress,
  Tooltip as Tooltip3,
  usePopupState as usePopupState5
} from "@elementor/ui";
import { __ as __7 } from "@wordpress/i18n";

// src/extensions/documents-save/components/primary-action-menu.tsx
import * as React21 from "react";
import { Divider as Divider3, styled as styled2 } from "@elementor/ui";
var { useMenuItems: useMenuItems5 } = documentOptionsMenu;
var StyledPopoverMenu = styled2(PopoverMenu)`
	& > .MuiPopover-paper > .MuiList-root {
		& > .MuiDivider-root {
			display: none;
		}

		& > *:not( .MuiDivider-root ):not( :last-of-type ) + .MuiDivider-root {
			display: block;
		}
	}
`;
function PrimaryActionMenu(props) {
  const { save: saveActions, default: defaultActions } = useMenuItems5();
  return /* @__PURE__ */ React21.createElement(
    StyledPopoverMenu,
    {
      ...props,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right"
      },
      marginThreshold: 4,
      PaperProps: {
        sx: { mt: 0.5 }
      }
    },
    saveActions.map(({ MenuItem: MenuItem2, id }, index) => [
      index > 0 && /* @__PURE__ */ React21.createElement(Divider3, { key: `${id}-divider` }),
      /* @__PURE__ */ React21.createElement(MenuItem2, { key: id })
    ]),
    saveActions.length > 0 && defaultActions.length > 0 && /* @__PURE__ */ React21.createElement(Divider3, null),
    defaultActions.map(({ MenuItem: MenuItem2, id }, index) => [
      index > 0 && /* @__PURE__ */ React21.createElement(Divider3, { key: `${id}-divider` }),
      /* @__PURE__ */ React21.createElement(MenuItem2, { key: id })
    ])
  );
}

// src/extensions/documents-save/components/primary-action.tsx
function PrimaryAction() {
  const document2 = useActiveDocument3();
  const { save } = useActiveDocumentActions();
  const editMode = useEditMode();
  const isEditMode = editMode === "edit";
  const popupState = usePopupState5({
    variant: "popover",
    popupId: "document-save-options"
  });
  if (!document2) {
    return null;
  }
  const isPublishDisabled = !isEditMode || !isPublishEnabled(document2);
  const isSaveOptionsDisabled = !isEditMode || document2.type.value === "kit";
  const shouldShowSpinner = document2.isSaving && !isPublishDisabled;
  return /* @__PURE__ */ React22.createElement(React22.Fragment, null, /* @__PURE__ */ React22.createElement(ButtonGroup, { size: "large", variant: "contained" }, /* @__PURE__ */ React22.createElement(
    Button2,
    {
      onClick: () => {
        const extendedWindow2 = window;
        const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
        if (config) {
          extendedWindow2.elementorCommon.eventsManager.dispatchEvent(
            config.names.topBar.publishButton,
            {
              location: config.locations.topBar,
              secondaryLocation: config.secondaryLocations["publish-button"],
              trigger: config.triggers.click,
              element: config.elements.mainCta
            }
          );
        }
        if (!document2.isSaving) {
          save();
        }
      },
      sx: {
        height: "100%",
        borderRadius: 0,
        maxWidth: "158px",
        "&.MuiButtonBase-root.MuiButtonGroup-grouped": {
          minWidth: "110px"
        }
      },
      disabled: isPublishDisabled
    },
    shouldShowSpinner ? /* @__PURE__ */ React22.createElement(CircularProgress, { color: "inherit", size: "1.5em" }) : getLabel(document2)
  ), /* @__PURE__ */ React22.createElement(
    Tooltip3,
    {
      title: __7("Save Options", "elementor"),
      PopperProps: {
        sx: {
          "&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom": {
            mt: 1,
            mr: 0.25
          }
        }
      }
    },
    /* @__PURE__ */ React22.createElement(Box4, { component: "span", "aria-label": void 0 }, /* @__PURE__ */ React22.createElement(
      Button2,
      {
        size: "small",
        ...bindTrigger4(popupState),
        sx: { px: 0, height: "100%", borderRadius: 0 },
        disabled: isSaveOptionsDisabled,
        "aria-label": __7("Save Options", "elementor")
      },
      /* @__PURE__ */ React22.createElement(ChevronDownIcon, null)
    ))
  )), /* @__PURE__ */ React22.createElement(PrimaryActionMenu, { ...bindMenu4(popupState), onClick: popupState.close }));
}
function getLabel(document2) {
  return document2.userCan.publish ? __7("Publish", "elementor") : __7("Submit", "elementor");
}
function isPublishEnabled(document2) {
  if (document2.type.value === "kit") {
    return false;
  }
  return document2.isDirty || document2.status.value === "draft";
}

// src/extensions/documents-save/hooks/use-document-copy-and-share-props.ts
import {
  __useActiveDocument as useActiveDocument4,
  __useActiveDocumentActions as useActiveDocumentActions2
} from "@elementor/editor-documents";
import { useMixpanel as useMixpanel2 } from "@elementor/events";
import { LinkIcon } from "@elementor/icons";
import { __ as __8 } from "@wordpress/i18n";
function useDocumentCopyAndShareProps() {
  const document2 = useActiveDocument4();
  const { copyAndShare } = useActiveDocumentActions2();
  const { dispatchEvent: dispatchEvent2, config } = useMixpanel2();
  return {
    icon: LinkIcon,
    title: __8("Copy and Share", "elementor"),
    onClick: () => {
      const eventName = config?.names?.editorOne?.topBarPublishDropdown;
      if (eventName) {
        dispatchEvent2?.(eventName, {
          app_type: config?.appTypes?.editor,
          window_name: config?.appTypes?.editor,
          interaction_type: config?.triggers?.click?.toLowerCase(),
          target_type: config?.targetTypes?.dropdownItem,
          target_name: config?.targetNames?.publishDropdown?.copyAndShare,
          interaction_result: config?.interactionResults?.actionSelected,
          target_location: config?.locations?.topBar?.replace(/\s+/g, "_").toLowerCase(),
          location_l1: config?.secondaryLocations?.publishDropdown?.replace(/\s+/g, "_").toLowerCase(),
          location_l2: config?.targetTypes?.dropdownItem
        });
      }
      copyAndShare();
    },
    disabled: !document2 || document2.isSaving || document2.isSavingDraft || !("publish" === document2.status.value),
    visible: document2?.permissions?.showCopyAndShare
  };
}

// src/extensions/documents-save/hooks/use-document-save-draft-props.ts
import {
  __useActiveDocument as useActiveDocument5,
  __useActiveDocumentActions as useActiveDocumentActions3
} from "@elementor/editor-documents";
import { useMixpanel as useMixpanel3 } from "@elementor/events";
import { FileReportIcon } from "@elementor/icons";
import { __ as __9 } from "@wordpress/i18n";
function useDocumentSaveDraftProps() {
  const document2 = useActiveDocument5();
  const { saveDraft } = useActiveDocumentActions3();
  const { dispatchEvent: dispatchEvent2, config } = useMixpanel3();
  return {
    icon: FileReportIcon,
    title: __9("Save Draft", "elementor"),
    onClick: () => {
      const eventName = config?.names?.editorOne?.topBarPublishDropdown;
      if (eventName) {
        dispatchEvent2?.(eventName, {
          app_type: config?.appTypes?.editor,
          window_name: config?.appTypes?.editor,
          interaction_type: config?.triggers?.click?.toLowerCase(),
          target_type: config?.targetTypes?.dropdownItem,
          target_name: config?.targetNames?.publishDropdown?.saveDraft,
          interaction_result: config?.interactionResults?.actionSelected,
          target_location: config?.locations?.topBar?.replace(/\s+/g, "_").toLowerCase(),
          location_l1: config?.secondaryLocations?.publishDropdown?.replace(/\s+/g, "_").toLowerCase(),
          location_l2: config?.targetTypes?.dropdownItem
        });
      }
      saveDraft();
    },
    disabled: !document2 || document2.isSaving || document2.isSavingDraft || !document2.isDirty
  };
}

// src/extensions/documents-save/hooks/use-document-save-template-props.ts
import { __useActiveDocumentActions as useActiveDocumentActions4 } from "@elementor/editor-documents";
import { useMixpanel as useMixpanel4 } from "@elementor/events";
import { FolderIcon } from "@elementor/icons";
import { __ as __10 } from "@wordpress/i18n";
function useDocumentSaveTemplateProps() {
  const { saveTemplate } = useActiveDocumentActions4();
  const { dispatchEvent: dispatchEvent2, config } = useMixpanel4();
  return {
    icon: FolderIcon,
    title: __10("Save as Template", "elementor"),
    onClick: () => {
      const eventName = config?.names?.editorOne?.topBarPublishDropdown;
      if (eventName) {
        dispatchEvent2?.(eventName, {
          app_type: config?.appTypes?.editor,
          window_name: config?.appTypes?.editor,
          interaction_type: config?.triggers?.click?.toLowerCase(),
          target_type: config?.targetTypes?.dropdownItem,
          target_name: config?.targetNames?.publishDropdown?.saveAsTemplate,
          interaction_result: config?.interactionResults?.actionSelected,
          target_location: config?.locations?.topBar?.replace(/\s+/g, "_").toLowerCase(),
          location_l1: config?.secondaryLocations?.publishDropdown?.replace(/\s+/g, "_").toLowerCase(),
          location_l2: config?.targetTypes?.dropdownItem
        });
      }
      saveTemplate();
    }
  };
}

// src/extensions/documents-save/hooks/use-document-view-page-props.ts
import { __useActiveDocument as useActiveDocument6 } from "@elementor/editor-documents";
import { __privateRunCommand as runCommand2 } from "@elementor/editor-v1-adapters";
import { useMixpanel as useMixpanel5 } from "@elementor/events";
import { EyeIcon as EyeIcon2 } from "@elementor/icons";
import { __ as __11 } from "@wordpress/i18n";
function useDocumentViewPageProps() {
  const document2 = useActiveDocument6();
  const { dispatchEvent: dispatchEvent2, config } = useMixpanel5();
  return {
    icon: EyeIcon2,
    title: __11("View Page", "elementor"),
    onClick: () => {
      const eventName = config?.names?.editorOne?.topBarPublishDropdown;
      if (eventName) {
        dispatchEvent2?.(eventName, {
          app_type: config?.appTypes?.editor,
          window_name: config?.appTypes?.editor,
          interaction_type: config?.triggers?.click?.toLowerCase(),
          target_type: config?.targetTypes?.dropdownItem,
          target_name: config?.targetNames?.publishDropdown?.viewPage,
          interaction_result: config?.interactionResults?.actionSelected,
          target_location: config?.locations?.topBar?.replace(/\s+/g, "_").toLowerCase(),
          location_l1: config?.secondaryLocations?.publishDropdown?.replace(/\s+/g, "_").toLowerCase(),
          location_l2: config?.targetTypes?.dropdownItem
        });
      }
      if (document2?.id) {
        runCommand2("editor/documents/view", {
          id: document2.id
        });
      }
    }
  };
}

// src/extensions/documents-save/index.ts
function init3() {
  injectIntoPrimaryAction({
    id: "document-primary-action",
    component: PrimaryAction
  });
  documentOptionsMenu.registerAction({
    group: "save",
    id: "document-save-draft",
    priority: 10,
    useProps: useDocumentSaveDraftProps
  });
  documentOptionsMenu.registerAction({
    group: "save",
    id: "document-save-as-template",
    priority: 20,
    useProps: useDocumentSaveTemplateProps
  });
  documentOptionsMenu.registerAction({
    id: "document-copy-and-share",
    priority: 10,
    useProps: useDocumentCopyAndShareProps
  });
  documentOptionsMenu.registerAction({
    id: "document-view-page",
    priority: 50,
    useProps: useDocumentViewPageProps
  });
}

// src/extensions/documents-settings/hooks/use-action-props.ts
import {
  __useActiveDocument as useActiveDocument7,
  __useHostDocument as useHostDocument
} from "@elementor/editor-documents";
import {
  __privateOpenRoute as openRoute,
  __privateUseRouteStatus as useRouteStatus
} from "@elementor/editor-v1-adapters";
import { FileSettingsIcon } from "@elementor/icons";
import { __ as __12 } from "@wordpress/i18n";
function useActionProps2() {
  const activeDocument = useActiveDocument7();
  const hostDocument = useHostDocument();
  const { isActive, isBlocked } = useRouteStatus("panel/page-settings");
  const document2 = activeDocument && activeDocument.type.value !== "kit" ? activeDocument : hostDocument;
  const ButtonTitle = document2 ? (
    /* translators: %s: Post type label. */
    __12("%s Settings", "elementor").replace("%s", document2.type.label)
  ) : __12("Document Settings", "elementor");
  return {
    title: ButtonTitle,
    icon: FileSettingsIcon,
    onClick: () => {
      if (!document2) {
        return;
      }
      const extendedWindow2 = window;
      const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
      if (config) {
        extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.documentSettings, {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations["document-settings"],
          trigger: config.triggers.click,
          element: config.elements.buttonIcon
        });
      }
      openRoute("panel/page-settings/settings");
    },
    selected: isActive,
    disabled: isBlocked || !document2
  };
}

// src/extensions/documents-settings/index.ts
function init4() {
  toolsMenu.registerToggleAction({
    id: "document-settings-button",
    priority: 2,
    useProps: useActionProps2
  });
}

// src/extensions/elements/hooks/use-action-props.ts
import {
  __privateOpenRoute as openRoute2,
  __privateUseRouteStatus as useRouteStatus2
} from "@elementor/editor-v1-adapters";
import { PlusIcon } from "@elementor/icons";
import { __ as __13 } from "@wordpress/i18n";
function useActionProps3() {
  const { isActive, isBlocked } = useRouteStatus2("panel/elements");
  return {
    title: __13("Add Element", "elementor"),
    icon: PlusIcon,
    onClick: () => {
      const extendedWindow2 = window;
      const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
      if (config) {
        extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.widgetPanel, {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations["widget-panel"],
          trigger: config.triggers.toggleClick,
          element: config.elements.buttonIcon
        });
      }
      openRoute2("panel/elements/categories");
    },
    selected: isActive,
    disabled: isBlocked
  };
}

// src/extensions/elements/sync/sync-panel-title.ts
import {
  __privateIsRouteActive as isRouteActive,
  __privateListenTo as listenTo,
  routeOpenEvent,
  v1ReadyEvent
} from "@elementor/editor-v1-adapters";
import { __ as __14 } from "@wordpress/i18n";
function syncPanelTitle() {
  const panelTitle = __14("Elements", "elementor");
  const tabTitle = __14("Widgets", "elementor");
  listenTo(routeOpenEvent("panel/elements"), () => {
    setPanelTitle(panelTitle);
    setTabTitle(tabTitle);
  });
  listenTo(v1ReadyEvent(), () => {
    if (isRouteActive("panel/elements")) {
      setPanelTitle(panelTitle);
      setTabTitle(tabTitle);
    }
  });
}
function setPanelTitle(title) {
  window.elementor?.getPanelView?.()?.getHeaderView?.()?.setTitle?.(title);
}
function setTabTitle(title) {
  const tab = document.querySelector('.elementor-component-tab[data-tab="categories"]');
  if (tab) {
    tab.textContent = title;
  }
}

// src/extensions/elements/index.ts
function init5() {
  syncPanelTitle();
  toolsMenu.registerToggleAction({
    id: "open-elements-panel",
    priority: 1,
    useProps: useActionProps3
  });
}

// src/extensions/feedback/index.ts
import { isExperimentActive as isExperimentActive2 } from "@elementor/editor-v1-adapters";
import { MessageLinesIcon } from "@elementor/icons";
import { __ as __15 } from "@wordpress/i18n";
function init6() {
  const isActive = isExperimentActive2(EXPERIMENT_NAME);
  if (!isActive) {
    return;
  }
  mainMenu.registerAction({
    id: "open-send-feedback",
    group: "help",
    priority: 20,
    useProps: () => {
      return {
        icon: MessageLinesIcon,
        title: __15("Send Feedback", "elementor"),
        onClick: () => {
          dispatchEvent(new CustomEvent(FEEDBACK_TOGGLE_EVENT));
        }
      };
    }
  });
}

// src/extensions/finder/hooks/use-action-props.ts
import { __privateRunCommand as runCommand3 } from "@elementor/editor-v1-adapters";
import { SearchIcon } from "@elementor/icons";
import { __ as __16 } from "@wordpress/i18n";
function useActionProps4() {
  return {
    title: __16("Finder", "elementor"),
    icon: SearchIcon,
    onClick: () => {
      const extendedWindow2 = window;
      const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
      if (config) {
        extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.finder, {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations.finder,
          trigger: config.triggers.toggleClick,
          element: config.elements.buttonIcon
        });
      }
      runCommand3("finder/toggle");
    }
  };
}

// src/extensions/finder/index.ts
function init7() {
  utilitiesMenu.registerAction({
    id: "toggle-finder",
    priority: 15,
    useProps: useActionProps4
  });
}

// src/extensions/help/hooks/use-action-props.ts
import { HelpIcon } from "@elementor/icons";
import { __ as __17 } from "@wordpress/i18n";
function useActionProps5() {
  return {
    title: __17("Help Center", "elementor"),
    href: "https://go.elementor.com/editor-top-bar-learn/",
    icon: HelpIcon,
    target: "_blank",
    onClick: () => {
      const extendedWindow2 = window;
      const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
      if (config) {
        extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.help, {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations.help,
          trigger: config.triggers.click,
          element: config.elements.buttonIcon
        });
      }
    }
  };
}

// src/extensions/help/index.ts
function init8() {
  mainMenu.registerLink({
    id: "open-help-center",
    group: "help",
    priority: 10,
    useProps: useActionProps5
  });
}

// src/extensions/history/hooks/use-action-props.ts
import {
  __privateOpenRoute as openRoute3,
  __privateUseRouteStatus as useRouteStatus3
} from "@elementor/editor-v1-adapters";
import { HistoryIcon } from "@elementor/icons";
import { __ as __18 } from "@wordpress/i18n";
function useActionProps6() {
  const { isActive, isBlocked } = useRouteStatus3("panel/history");
  return {
    title: __18("History", "elementor"),
    icon: HistoryIcon,
    onClick: () => {
      const extendedWindow2 = window;
      const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
      if (config) {
        extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.history, {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations.elementorLogo,
          trigger: config.triggers.click,
          element: config.elements.link
        });
      }
      openRoute3("panel/history/actions");
    },
    selected: isActive,
    disabled: isBlocked
  };
}

// src/extensions/history/index.ts
function init9() {
  toolsMenu.registerToggleAction({
    id: "open-history",
    priority: 15,
    useProps: useActionProps6
  });
}

// src/extensions/keyboard-shortcuts/hooks/use-action-props.ts
import { __privateRunCommand as runCommand4 } from "@elementor/editor-v1-adapters";
import { KeyboardIcon } from "@elementor/icons";
import { __ as __19 } from "@wordpress/i18n";
function useActionProps7() {
  return {
    icon: KeyboardIcon,
    title: __19("Keyboard Shortcuts", "elementor"),
    onClick: () => {
      const extendedWindow2 = window;
      const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
      if (config) {
        extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.keyboardShortcuts, {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations.elementorLogo,
          trigger: config.triggers.click,
          element: config.elements.link
        });
      }
      runCommand4("shortcuts/open");
    }
  };
}

// src/extensions/keyboard-shortcuts/index.ts
function init10() {
  mainMenu.registerAction({
    id: "open-keyboard-shortcuts",
    group: "default",
    priority: 40,
    useProps: useActionProps7
  });
}

// src/extensions/responsive/components/breakpoints-switcher.tsx
import * as React23 from "react";
import {
  useActivateBreakpoint,
  useActiveBreakpoint,
  useBreakpoints
} from "@elementor/editor-responsive";
import {
  DesktopIcon,
  LaptopIcon,
  MobileLandscapeIcon,
  MobilePortraitIcon,
  TabletLandscapeIcon,
  TabletPortraitIcon,
  WidescreenIcon
} from "@elementor/icons";
import { Tab, Tabs, Tooltip as BaseTooltip2 } from "@elementor/ui";
import { __ as __20 } from "@wordpress/i18n";
function BreakpointsSwitcher() {
  const breakpoints = useBreakpoints();
  const activeBreakpoint = useActiveBreakpoint();
  const activateBreakpoint = useActivateBreakpoint();
  if (!breakpoints.length || !activeBreakpoint) {
    return null;
  }
  const onChange = (_, value) => {
    const extendedWindow2 = window;
    const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
    if (config) {
      extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.responsiveControls, {
        location: config.locations.topBar,
        secondaryLocation: config.secondaryLocations.responsiveControls,
        trigger: config.triggers.click,
        element: config.elements.buttonIcon,
        mode: value
      });
    }
    activateBreakpoint(value);
  };
  return /* @__PURE__ */ React23.createElement(
    Tabs,
    {
      textColor: "inherit",
      indicatorColor: "secondary",
      value: activeBreakpoint,
      onChange,
      "aria-label": __20("Switch Device", "elementor"),
      sx: {
        "& .MuiTabs-indicator": {
          backgroundColor: "text.primary"
        }
      }
    },
    breakpoints.map(({ id, label, type, width }) => {
      const Icon = iconsMap[id];
      const title = labelsMap[type || "default"].replace("%s", label).replace("%d", width?.toString() || "");
      return /* @__PURE__ */ React23.createElement(
        Tab,
        {
          value: id,
          key: id,
          "aria-label": title,
          icon: /* @__PURE__ */ React23.createElement(Tooltip4, { title }, /* @__PURE__ */ React23.createElement(Icon, null)),
          sx: { minWidth: "auto" },
          "data-testid": `switch-device-to-${id}`
        }
      );
    })
  );
}
function Tooltip4(props) {
  return /* @__PURE__ */ React23.createElement(
    BaseTooltip2,
    {
      PopperProps: {
        sx: {
          "&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom": {
            mt: 2.5
          }
        }
      },
      ...props
    }
  );
}
var iconsMap = {
  widescreen: WidescreenIcon,
  desktop: DesktopIcon,
  laptop: LaptopIcon,
  tablet_extra: TabletLandscapeIcon,
  tablet: TabletPortraitIcon,
  mobile_extra: MobileLandscapeIcon,
  mobile: MobilePortraitIcon
};
var labelsMap = {
  default: "%s",
  // translators: %s: Breakpoint label, %d: Breakpoint size.
  "min-width": __20("%s (%dpx and up)", "elementor"),
  // translators: %s: Breakpoint label, %d: Breakpoint size.
  "max-width": __20("%s (up to %dpx)", "elementor")
};

// src/extensions/responsive/index.ts
function init11() {
  injectIntoResponsive({
    id: "responsive-breakpoints-switcher",
    component: BreakpointsSwitcher,
    options: {
      priority: 20
      // After document indication.
    }
  });
}

// src/extensions/site-settings/index.ts
import { injectIntoTop } from "@elementor/editor";

// src/extensions/site-settings/components/portalled-primary-action.tsx
import * as React26 from "react";

// src/extensions/site-settings/components/portal.tsx
import * as React24 from "react";
import {
  __privateIsRouteActive as isRouteActive2,
  __privateUseListenTo as useListenTo,
  routeCloseEvent,
  routeOpenEvent as routeOpenEvent2
} from "@elementor/editor-v1-adapters";
import { Portal as BasePortal } from "@elementor/ui";
function Portal(props) {
  const containerRef = useListenTo(
    [routeOpenEvent2("panel/global"), routeCloseEvent("panel/global")],
    getContainerRef
  );
  if (!containerRef.current) {
    return null;
  }
  return /* @__PURE__ */ React24.createElement(BasePortal, { container: containerRef.current, ...props });
}
function getContainerRef() {
  return isRouteActive2("panel/global") ? { current: document.querySelector("#elementor-panel-inner") } : { current: null };
}

// src/extensions/site-settings/components/primary-action.tsx
import * as React25 from "react";
import {
  __useActiveDocument as useActiveDocument8,
  __useActiveDocumentActions as useActiveDocumentActions5
} from "@elementor/editor-documents";
import { Button as Button3, CircularProgress as CircularProgress2, Paper } from "@elementor/ui";
import { __ as __21 } from "@wordpress/i18n";
function PrimaryAction2() {
  const document2 = useActiveDocument8();
  const { save } = useActiveDocumentActions5();
  return /* @__PURE__ */ React25.createElement(
    Paper,
    {
      sx: {
        px: 5,
        py: 4,
        borderTop: 1,
        borderColor: "divider"
      }
    },
    /* @__PURE__ */ React25.createElement(
      Button3,
      {
        variant: "contained",
        disabled: !document2 || !document2.isDirty,
        size: "medium",
        sx: { width: "100%" },
        onClick: () => document2 && !document2.isSaving ? save() : null
      },
      document2?.isSaving ? /* @__PURE__ */ React25.createElement(CircularProgress2, null) : __21("Save Changes", "elementor")
    )
  );
}

// src/extensions/site-settings/components/portalled-primary-action.tsx
function PortalledPrimaryAction() {
  return /* @__PURE__ */ React26.createElement(Portal, null, /* @__PURE__ */ React26.createElement(PrimaryAction2, null));
}

// src/extensions/site-settings/hooks/use-action-props.ts
import {
  __privateRunCommand as runCommand5,
  __privateUseRouteStatus as useRouteStatus4
} from "@elementor/editor-v1-adapters";
import { SettingsIcon } from "@elementor/icons";
import { __ as __22 } from "@wordpress/i18n";
function useActionProps8() {
  const { isActive, isBlocked } = useRouteStatus4("panel/global", {
    blockOnKitRoutes: false
  });
  return {
    title: __22("Site Settings", "elementor"),
    icon: SettingsIcon,
    onClick: () => {
      const extendedWindow2 = window;
      const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
      if (config) {
        extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.siteSettings, {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations.siteSettings,
          trigger: config.triggers.toggleClick,
          element: config.elements.buttonIcon
        });
      }
      if (isActive) {
        runCommand5("panel/global/close");
      } else {
        runCommand5("panel/global/open");
      }
    },
    selected: isActive,
    disabled: isBlocked
  };
}

// src/extensions/site-settings/index.ts
function init12() {
  injectIntoTop({
    id: "site-settings-primary-action-portal",
    component: PortalledPrimaryAction
  });
  mainMenu.registerToggleAction({
    id: "toggle-site-settings",
    group: "default",
    priority: 1,
    useProps: useActionProps8
  });
}

// src/extensions/structure/hooks/use-action-props.ts
import {
  __privateRunCommand as runCommand6,
  __privateUseRouteStatus as useRouteStatus5
} from "@elementor/editor-v1-adapters";
import { __ as __24 } from "@wordpress/i18n";

// src/extensions/structure/hooks/structure-icon-with-popup.tsx
import * as React27 from "react";
import { useEffect as useEffect2, useState as useState3 } from "react";
import { StructureIcon } from "@elementor/icons";
import { Button as Button4, Card, CardActions, CardContent, Infotip, Typography } from "@elementor/ui";
import { __ as __23 } from "@wordpress/i18n";
var extendedWindow = window;
var StructurePopupContent = ({ onClose }) => {
  const handleDismiss = async () => {
    onClose();
    extendedWindow.elementorCommon?.ajax?.addRequest?.("structure_popup_dismiss").catch(() => {
    });
  };
  const stopEventPropagation = (event) => {
    event.stopPropagation();
  };
  return /* @__PURE__ */ React27.createElement(Card, { elevation: 0, sx: { maxWidth: 300 }, onClick: stopEventPropagation }, /* @__PURE__ */ React27.createElement(CardContent, null, /* @__PURE__ */ React27.createElement(Typography, { variant: "subtitle2", sx: { mb: 2 } }, __23("Refreshed Top Bar layout!", "elementor")), /* @__PURE__ */ React27.createElement(Typography, { variant: "body2" }, __23("We\u2019ve fine-tuned the Top Bar to make navigation faster and smoother.", "elementor"))), /* @__PURE__ */ React27.createElement(CardActions, { sx: { pt: 0 } }, /* @__PURE__ */ React27.createElement(
    Button4,
    {
      size: "small",
      color: "secondary",
      href: "https://go.elementor.com/editor-top-bar-learn/",
      target: "_blank"
    },
    __23("Learn More", "elementor")
  ), /* @__PURE__ */ React27.createElement(Button4, { size: "small", variant: "contained", onClick: handleDismiss }, __23("Got it", "elementor"))));
};
var StructureIconWithPopup = () => {
  const [showPopup, setShowPopup] = useState3(false);
  useEffect2(() => {
    if (extendedWindow.elementorShowInfotip?.shouldShow === "1") {
      setShowPopup(true);
    }
  }, []);
  const handleClosePopup = () => {
    setShowPopup(false);
  };
  if (extendedWindow.elementorShowInfotip?.shouldShow !== "1") {
    return /* @__PURE__ */ React27.createElement(StructureIcon, null);
  }
  return /* @__PURE__ */ React27.createElement(
    Infotip,
    {
      placement: "bottom",
      arrow: false,
      content: /* @__PURE__ */ React27.createElement(StructurePopupContent, { onClose: handleClosePopup }),
      open: showPopup,
      PopperProps: {
        modifiers: [
          {
            name: "offset",
            options: { offset: [-16, 12] }
          }
        ]
      }
    },
    /* @__PURE__ */ React27.createElement(StructureIcon, null)
  );
};

// src/extensions/structure/hooks/use-action-props.ts
function useActionProps9() {
  const { isActive, isBlocked } = useRouteStatus5("navigator");
  return {
    title: __24("Structure", "elementor"),
    icon: StructureIconWithPopup,
    onClick: () => {
      const extendedWindow2 = window;
      const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
      if (config) {
        extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.structure, {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations.structure,
          trigger: config.triggers.toggleClick,
          element: config.elements.buttonIcon
        });
      }
      runCommand6("navigator/toggle");
    },
    selected: isActive,
    disabled: isBlocked
  };
}

// src/extensions/structure/index.ts
function init13() {
  utilitiesMenu.registerToggleAction({
    id: "toggle-structure-view",
    priority: 25,
    useProps: useActionProps9
  });
}

// src/extensions/theme-builder/hooks/use-action-props.ts
import { __privateRunCommand as runCommand7 } from "@elementor/editor-v1-adapters";
import { ThemeBuilderIcon } from "@elementor/icons";
import { __ as __25 } from "@wordpress/i18n";
function useActionProps10() {
  return {
    icon: ThemeBuilderIcon,
    title: __25("Theme Builder", "elementor"),
    onClick: () => {
      const extendedWindow2 = window;
      const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
      if (config) {
        extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.themeBuilder, {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations.elementorLogo,
          trigger: config.triggers.click,
          element: config.elements.link
        });
      }
      runCommand7("app/open");
    }
  };
}

// src/extensions/theme-builder/index.ts
function init14() {
  mainMenu.registerAction({
    id: "open-theme-builder",
    group: "default",
    priority: 10,
    useProps: useActionProps10
  });
}

// src/extensions/user-preferences/hooks/use-action-props.ts
import {
  __privateOpenRoute as openRoute4,
  __privateUseRouteStatus as useRouteStatus6
} from "@elementor/editor-v1-adapters";
import { ToggleRightIcon } from "@elementor/icons";
import { __ as __26 } from "@wordpress/i18n";
function useActionProps11() {
  const { isActive, isBlocked } = useRouteStatus6("panel/editor-preferences");
  return {
    icon: ToggleRightIcon,
    title: __26("User Preferences", "elementor"),
    onClick: () => {
      const extendedWindow2 = window;
      const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
      if (config) {
        extendedWindow2.elementorCommon.eventsManager.dispatchEvent(config.names.topBar.userPreferences, {
          location: config.locations.topBar,
          secondaryLocation: config.secondaryLocations.elementorLogo,
          trigger: config.triggers.click,
          element: config.elements.link
        });
      }
      openRoute4("panel/editor-preferences");
    },
    selected: isActive,
    disabled: isBlocked
  };
}

// src/extensions/user-preferences/index.ts
function init15() {
  mainMenu.registerToggleAction({
    id: "open-user-preferences",
    group: "default",
    priority: 30,
    useProps: useActionProps11
  });
}

// src/extensions/wordpress/index.ts
import { __useActiveDocument as useActiveDocument9 } from "@elementor/editor-documents";
import { WordpressIcon } from "@elementor/icons";
import { __ as __27 } from "@wordpress/i18n";
function init16() {
  mainMenu.registerLink({
    id: "exit-to-wordpress",
    group: "exits",
    priority: 20,
    useProps: () => {
      const document2 = useActiveDocument9();
      return {
        title: __27("Exit to WordPress", "elementor"),
        href: document2?.links?.platformEdit,
        icon: WordpressIcon,
        onClick: () => {
          const extendedWindow2 = window;
          const config = extendedWindow2?.elementorCommon?.eventsManager?.config;
          if (config) {
            extendedWindow2.elementorCommon.eventsManager.dispatchEvent(
              config.names.topBar.exitToWordpress,
              {
                location: config.locations.topBar,
                secondaryLocation: config.secondaryLocations.elementorLogo,
                trigger: config.triggers.click,
                element: config.elements.link
              }
            );
          }
        }
      };
    }
  });
}

// src/extensions/index.ts
function init17() {
  init2();
  init3();
  init4();
  init5();
  init7();
  init8();
  init9();
  init10();
  init11();
  init12();
  init6();
  init13();
  init14();
  init15();
  init16();
  init();
}

// src/sync/redirect-old-menus.ts
import {
  __privateListenTo as listenTo2,
  __privateOpenRoute as openRoute5,
  routeOpenEvent as routeOpenEvent3
} from "@elementor/editor-v1-adapters";
function redirectOldMenus() {
  listenTo2(routeOpenEvent3("panel/menu"), () => {
    openRoute5("panel/elements/categories");
  });
}

// src/init.ts
function init18() {
  redirectOldMenus();
  init17();
  injectIntoTop2({
    id: "app-bar",
    component: AppBar
  });
}
export {
  documentOptionsMenu,
  init18 as init,
  injectIntoPageIndication,
  injectIntoPrimaryAction,
  injectIntoResponsive,
  integrationsMenu,
  mainMenu,
  toolsMenu,
  utilitiesMenu
};
//# sourceMappingURL=index.mjs.map