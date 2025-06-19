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
  ...props
}) {
  const isExternalLink = href && target === "_blank";
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
function Link({ icon: Icon, title, visible = true, ...props }) {
  const { type } = useMenuContext();
  if (!visible) {
    return null;
  }
  return type === "toolbar" ? /* @__PURE__ */ React5.createElement(ToolbarMenuItem, { title, ...props }, /* @__PURE__ */ React5.createElement(Icon, null)) : /* @__PURE__ */ React5.createElement(PopoverMenuItem, { ...props, text: title, icon: /* @__PURE__ */ React5.createElement(Icon, null) });
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
  groups: ["exits"],
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
import * as React19 from "react";
import { __useActiveDocument as useActiveDocument } from "@elementor/editor-documents";
import { AppBar as BaseAppBar, Box as Box3, Divider as Divider3, Grid, ThemeProvider, Toolbar } from "@elementor/ui";

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
    const extendedWindow = window;
    const config = extendedWindow?.elementor?.editorEvents?.config;
    if (config) {
      extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.elementorLogoDropdown, {
        location: config.locations.topBar,
        secondaryLocation: config.secondaryLocations.elementorLogo,
        trigger: config.triggers.dropdownClick,
        element: config.elements.buttonIcon
      });
    }
    toolbarLogoProps.onClick(e);
  };
  return /* @__PURE__ */ React10.createElement(Stack, { sx: { paddingInlineStart: 3 }, direction: "row", alignItems: "center" }, /* @__PURE__ */ React10.createElement(ToolbarLogo, { ...toolbarLogoProps, onClick: onToolbarClick, selected: popupState.isOpen }), /* @__PURE__ */ React10.createElement(PopoverMenu, { onClick: popupState.close, ...bindMenu(popupState), marginThreshold: 8 }, menuItems.default.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React10.createElement(MenuItem2, { key: id })), menuItems.exits.length > 0 && /* @__PURE__ */ React10.createElement(Divider, null), menuItems.exits.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React10.createElement(MenuItem2, { key: id }))));
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
import * as React17 from "react";

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

// src/components/locations/tools-menu-location.tsx
var MAX_TOOLBAR_ACTIONS = 5;
var { useMenuItems: useMenuItems3 } = toolsMenu;
function ToolsMenuLocation() {
  const menuItems = useMenuItems3();
  const toolbarMenuItems = menuItems.default.slice(0, MAX_TOOLBAR_ACTIONS);
  const popoverMenuItems = menuItems.default.slice(MAX_TOOLBAR_ACTIONS);
  return /* @__PURE__ */ React17.createElement(ToolbarMenu, null, toolbarMenuItems.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React17.createElement(MenuItem2, { key: id })), /* @__PURE__ */ React17.createElement(IntegrationsMenuLocation, null), popoverMenuItems.length > 0 && /* @__PURE__ */ React17.createElement(ToolbarMenuMore, { id: "elementor-editor-app-bar-tools-more" }, popoverMenuItems.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React17.createElement(MenuItem2, { key: id }))));
}

// src/components/locations/utilities-menu-location.tsx
import * as React18 from "react";
import { Fragment as Fragment3 } from "react";
import { Divider as Divider2 } from "@elementor/ui";
var MAX_TOOLBAR_ACTIONS2 = 4;
var { useMenuItems: useMenuItems4 } = utilitiesMenu;
function UtilitiesMenuLocation() {
  const menuItems = useMenuItems4();
  const shouldUsePopover = menuItems.default.length > MAX_TOOLBAR_ACTIONS2 + 1;
  const toolbarMenuItems = shouldUsePopover ? menuItems.default.slice(0, MAX_TOOLBAR_ACTIONS2) : menuItems.default;
  const popoverMenuItems = shouldUsePopover ? menuItems.default.slice(MAX_TOOLBAR_ACTIONS2) : [];
  return /* @__PURE__ */ React18.createElement(ToolbarMenu, null, toolbarMenuItems.map(({ MenuItem: MenuItem2, id }, index) => /* @__PURE__ */ React18.createElement(Fragment3, { key: id }, index === 0 && /* @__PURE__ */ React18.createElement(Divider2, { orientation: "vertical" }), /* @__PURE__ */ React18.createElement(MenuItem2, null))), popoverMenuItems.length > 0 && /* @__PURE__ */ React18.createElement(ToolbarMenuMore, { id: "elementor-editor-app-bar-utilities-more" }, popoverMenuItems.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React18.createElement(MenuItem2, { key: id }))));
}

// src/components/app-bar.tsx
function AppBar() {
  const document2 = useActiveDocument();
  return /* @__PURE__ */ React19.createElement(ThemeProvider, { colorScheme: "dark" }, /* @__PURE__ */ React19.createElement(BaseAppBar, { position: "sticky" }, /* @__PURE__ */ React19.createElement(Toolbar, { disableGutters: true, variant: "dense" }, /* @__PURE__ */ React19.createElement(Box3, { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", flexGrow: 1 }, /* @__PURE__ */ React19.createElement(Grid, { container: true, flexWrap: "nowrap" }, /* @__PURE__ */ React19.createElement(MainMenuLocation, null), document2?.permissions?.allowAddingWidgets && /* @__PURE__ */ React19.createElement(ToolsMenuLocation, null)), /* @__PURE__ */ React19.createElement(Grid, { container: true, justifyContent: "center" }, /* @__PURE__ */ React19.createElement(ToolbarMenu, { spacing: 1.5 }, /* @__PURE__ */ React19.createElement(Divider3, { orientation: "vertical" }), /* @__PURE__ */ React19.createElement(PageIndicationLocation, null), /* @__PURE__ */ React19.createElement(Divider3, { orientation: "vertical" }), /* @__PURE__ */ React19.createElement(ResponsiveLocation, null), /* @__PURE__ */ React19.createElement(Divider3, { orientation: "vertical" }))), /* @__PURE__ */ React19.createElement(Grid, { container: true, justifyContent: "flex-end", flexWrap: "nowrap" }, /* @__PURE__ */ React19.createElement(UtilitiesMenuLocation, null), /* @__PURE__ */ React19.createElement(PrimaryActionLocation, null))))));
}

// src/extensions/documents-indicator/components/settings-button.tsx
import * as React20 from "react";
import {
  __useActiveDocument as useActiveDocument2,
  __useHostDocument as useHostDocument
} from "@elementor/editor-documents";
import {
  __privateOpenRoute as openRoute,
  __privateUseRouteStatus as useRouteStatus
} from "@elementor/editor-v1-adapters";
import { SettingsIcon } from "@elementor/icons";
import { Box as Box4, ToggleButton as ToggleButton3, Tooltip as BaseTooltip2 } from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";
function SettingsButton() {
  const activeDocument = useActiveDocument2();
  const hostDocument = useHostDocument();
  const document2 = activeDocument && activeDocument.type.value !== "kit" ? activeDocument : hostDocument;
  const { isActive, isBlocked } = useRouteStatus("panel/page-settings");
  if (!document2) {
    return null;
  }
  const title = __4("%s Settings", "elementor").replace("%s", document2.type.label);
  return /* @__PURE__ */ React20.createElement(Tooltip3, { title }, /* @__PURE__ */ React20.createElement(Box4, { component: "span", "aria-label": void 0 }, /* @__PURE__ */ React20.createElement(
    ToggleButton3,
    {
      value: "document-settings",
      selected: isActive,
      disabled: isBlocked,
      onChange: () => {
        const extendedWindow = window;
        const config = extendedWindow?.elementor?.editorEvents?.config;
        if (config) {
          extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.documentSettings, {
            location: config.locations.topBar,
            secondaryLocation: config.secondaryLocations["document-settings"],
            trigger: config.triggers.click,
            element: config.elements.buttonIcon
          });
        }
        openRoute("panel/page-settings/settings");
      },
      "aria-label": title,
      size: "small",
      sx: {
        border: 0,
        // Temp fix until the style of the ToggleButton component will be decided.
        "&.Mui-disabled": {
          border: 0
          // Temp fix until the style of the ToggleButton component will be decided.
        }
      }
    },
    /* @__PURE__ */ React20.createElement(SettingsIcon, { fontSize: "small" })
  )));
}
function Tooltip3(props) {
  return /* @__PURE__ */ React20.createElement(
    BaseTooltip2,
    {
      PopperProps: {
        sx: {
          "&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom": {
            mt: 1.7
          }
        }
      },
      ...props
    }
  );
}

// src/extensions/documents-indicator/index.ts
function init() {
  injectIntoPageIndication({
    id: "document-settings-button",
    component: SettingsButton,
    options: {
      priority: 20
      // After document indicator.
    }
  });
}

// src/extensions/documents-preview/hooks/use-action-props.ts
import { __useActiveDocument as useActiveDocument3 } from "@elementor/editor-documents";
import { __privateRunCommand as runCommand } from "@elementor/editor-v1-adapters";
import { EyeIcon } from "@elementor/icons";
import { __ as __5 } from "@wordpress/i18n";
function useActionProps() {
  const document2 = useActiveDocument3();
  return {
    icon: EyeIcon,
    title: __5("Preview Changes", "elementor"),
    onClick: () => {
      const extendedWindow = window;
      const config = extendedWindow?.elementor?.editorEvents?.config;
      if (config) {
        extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.previewPage, {
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
    // After help.
    useProps: useActionProps
  });
}

// src/extensions/documents-save/components/primary-action.tsx
import * as React22 from "react";
import {
  __useActiveDocument as useActiveDocument4,
  __useActiveDocumentActions as useActiveDocumentActions
} from "@elementor/editor-documents";
import { useEditMode } from "@elementor/editor-v1-adapters";
import { ChevronDownIcon } from "@elementor/icons";
import {
  bindMenu as bindMenu4,
  bindTrigger as bindTrigger4,
  Box as Box5,
  Button,
  ButtonGroup,
  CircularProgress,
  Tooltip as Tooltip4,
  usePopupState as usePopupState4
} from "@elementor/ui";
import { __ as __6 } from "@wordpress/i18n";

// src/extensions/documents-save/components/primary-action-menu.tsx
import * as React21 from "react";
import { Divider as Divider4, styled as styled2 } from "@elementor/ui";
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
      index > 0 && /* @__PURE__ */ React21.createElement(Divider4, { key: `${id}-divider` }),
      /* @__PURE__ */ React21.createElement(MenuItem2, { key: id })
    ]),
    saveActions.length > 0 && defaultActions.length > 0 && /* @__PURE__ */ React21.createElement(Divider4, null),
    defaultActions.map(({ MenuItem: MenuItem2, id }, index) => [
      index > 0 && /* @__PURE__ */ React21.createElement(Divider4, { key: `${id}-divider` }),
      /* @__PURE__ */ React21.createElement(MenuItem2, { key: id })
    ])
  );
}

// src/extensions/documents-save/components/primary-action.tsx
function PrimaryAction() {
  const document2 = useActiveDocument4();
  const { save } = useActiveDocumentActions();
  const editMode = useEditMode();
  const isEditMode = editMode === "edit";
  const popupState = usePopupState4({
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
    Button,
    {
      onClick: () => {
        const extendedWindow = window;
        const config = extendedWindow?.elementor?.editorEvents?.config;
        if (config) {
          extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.publishButton, {
            location: config.locations.topBar,
            secondaryLocation: config.secondaryLocations["publish-button"],
            trigger: config.triggers.click,
            element: config.elements.mainCta
          });
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
    Tooltip4,
    {
      title: __6("Save Options", "elementor"),
      PopperProps: {
        sx: {
          "&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom": {
            mt: 1,
            mr: 0.25
          }
        }
      }
    },
    /* @__PURE__ */ React22.createElement(Box5, { component: "span", "aria-label": void 0 }, /* @__PURE__ */ React22.createElement(
      Button,
      {
        size: "small",
        ...bindTrigger4(popupState),
        sx: { px: 0, height: "100%", borderRadius: 0 },
        disabled: isSaveOptionsDisabled,
        "aria-label": __6("Save Options", "elementor")
      },
      /* @__PURE__ */ React22.createElement(ChevronDownIcon, null)
    ))
  )), /* @__PURE__ */ React22.createElement(PrimaryActionMenu, { ...bindMenu4(popupState), onClick: popupState.close }));
}
function getLabel(document2) {
  return document2.userCan.publish ? __6("Publish", "elementor") : __6("Submit", "elementor");
}
function isPublishEnabled(document2) {
  if (document2.type.value === "kit") {
    return false;
  }
  return document2.isDirty || document2.status.value === "draft";
}

// src/extensions/documents-save/hooks/use-document-copy-and-share-props.ts
import {
  __useActiveDocument as useActiveDocument5,
  __useActiveDocumentActions as useActiveDocumentActions2
} from "@elementor/editor-documents";
import { LinkIcon } from "@elementor/icons";
import { __ as __7 } from "@wordpress/i18n";
function useDocumentCopyAndShareProps() {
  const document2 = useActiveDocument5();
  const { copyAndShare } = useActiveDocumentActions2();
  return {
    icon: LinkIcon,
    title: __7("Copy and Share", "elementor"),
    onClick: copyAndShare,
    disabled: !document2 || document2.isSaving || document2.isSavingDraft || !("publish" === document2.status.value),
    visible: document2?.permissions?.showCopyAndShare
  };
}

// src/extensions/documents-save/hooks/use-document-save-draft-props.ts
import {
  __useActiveDocument as useActiveDocument6,
  __useActiveDocumentActions as useActiveDocumentActions3
} from "@elementor/editor-documents";
import { FileReportIcon } from "@elementor/icons";
import { __ as __8 } from "@wordpress/i18n";
function useDocumentSaveDraftProps() {
  const document2 = useActiveDocument6();
  const { saveDraft } = useActiveDocumentActions3();
  return {
    icon: FileReportIcon,
    title: __8("Save Draft", "elementor"),
    onClick: saveDraft,
    disabled: !document2 || document2.isSaving || document2.isSavingDraft || !document2.isDirty
  };
}

// src/extensions/documents-save/hooks/use-document-save-template-props.ts
import { __useActiveDocumentActions as useActiveDocumentActions4 } from "@elementor/editor-documents";
import { FolderIcon } from "@elementor/icons";
import { __ as __9 } from "@wordpress/i18n";
function useDocumentSaveTemplateProps() {
  const { saveTemplate } = useActiveDocumentActions4();
  return {
    icon: FolderIcon,
    title: __9("Save as Template", "elementor"),
    onClick: saveTemplate
  };
}

// src/extensions/documents-save/hooks/use-document-view-page-props.ts
import { __useActiveDocument as useActiveDocument7 } from "@elementor/editor-documents";
import { __privateRunCommand as runCommand2 } from "@elementor/editor-v1-adapters";
import { EyeIcon as EyeIcon2 } from "@elementor/icons";
import { __ as __10 } from "@wordpress/i18n";
function useDocumentViewPageProps() {
  const document2 = useActiveDocument7();
  return {
    icon: EyeIcon2,
    title: __10("View Page", "elementor"),
    onClick: () => document2?.id && runCommand2("editor/documents/view", {
      id: document2.id
    })
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

// src/extensions/elements/hooks/use-action-props.ts
import {
  __privateOpenRoute as openRoute2,
  __privateUseRouteStatus as useRouteStatus2
} from "@elementor/editor-v1-adapters";
import { PlusIcon } from "@elementor/icons";
import { __ as __11 } from "@wordpress/i18n";
function useActionProps2() {
  const { isActive, isBlocked } = useRouteStatus2("panel/elements");
  return {
    title: __11("Add Element", "elementor"),
    icon: PlusIcon,
    onClick: () => {
      const extendedWindow = window;
      const config = extendedWindow?.elementor?.editorEvents?.config;
      if (config) {
        extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.widgetPanel, {
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
import { __ as __12 } from "@wordpress/i18n";
function syncPanelTitle() {
  const panelTitle = __12("Elements", "elementor");
  const tabTitle = __12("Widgets", "elementor");
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
function init4() {
  syncPanelTitle();
  toolsMenu.registerToggleAction({
    id: "open-elements-panel",
    priority: 1,
    useProps: useActionProps2
  });
}

// src/extensions/finder/hooks/use-action-props.ts
import { __privateRunCommand as runCommand3 } from "@elementor/editor-v1-adapters";
import { SearchIcon } from "@elementor/icons";
import { __ as __13 } from "@wordpress/i18n";
function useActionProps3() {
  return {
    title: __13("Finder", "elementor"),
    icon: SearchIcon,
    onClick: () => {
      const extendedWindow = window;
      const config = extendedWindow?.elementor?.editorEvents?.config;
      if (config) {
        extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.finder, {
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
function init5() {
  utilitiesMenu.registerAction({
    id: "toggle-finder",
    priority: 15,
    // Before Preview.
    useProps: useActionProps3
  });
}

// src/extensions/help/index.ts
import { HelpIcon } from "@elementor/icons";
import { __ as __14 } from "@wordpress/i18n";
function init6() {
  utilitiesMenu.registerLink({
    id: "open-help-center",
    priority: 25,
    // After Finder.
    useProps: () => {
      return {
        title: __14("Help", "elementor"),
        href: "https://go.elementor.com/editor-top-bar-learn/",
        icon: HelpIcon,
        target: "_blank",
        onClick: () => {
          const extendedWindow = window;
          const config = extendedWindow?.elementor?.editorEvents?.config;
          if (config) {
            extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.help, {
              location: config.locations.topBar,
              secondaryLocation: config.secondaryLocations.help,
              trigger: config.triggers.click,
              element: config.elements.buttonIcon
            });
          }
        }
      };
    }
  });
}

// src/extensions/history/hooks/use-action-props.ts
import {
  __privateOpenRoute as openRoute3,
  __privateUseRouteStatus as useRouteStatus3
} from "@elementor/editor-v1-adapters";
import { HistoryIcon } from "@elementor/icons";
import { __ as __15 } from "@wordpress/i18n";
function useActionProps4() {
  const { isActive, isBlocked } = useRouteStatus3("panel/history");
  return {
    title: __15("History", "elementor"),
    icon: HistoryIcon,
    onClick: () => {
      const extendedWindow = window;
      const config = extendedWindow?.elementor?.editorEvents?.config;
      if (config) {
        extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.history, {
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
function init7() {
  mainMenu.registerToggleAction({
    id: "open-history",
    priority: 20,
    useProps: useActionProps4
  });
}

// src/extensions/keyboard-shortcuts/hooks/use-action-props.ts
import { __privateRunCommand as runCommand4 } from "@elementor/editor-v1-adapters";
import { KeyboardIcon } from "@elementor/icons";
import { __ as __16 } from "@wordpress/i18n";
function useActionProps5() {
  return {
    icon: KeyboardIcon,
    title: __16("Keyboard Shortcuts", "elementor"),
    onClick: () => {
      const extendedWindow = window;
      const config = extendedWindow?.elementor?.editorEvents?.config;
      if (config) {
        extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.keyboardShortcuts, {
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
function init8() {
  mainMenu.registerAction({
    id: "open-keyboard-shortcuts",
    group: "default",
    priority: 40,
    // After user preferences.
    useProps: useActionProps5
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
import { Tab, Tabs, Tooltip as BaseTooltip3 } from "@elementor/ui";
import { __ as __17 } from "@wordpress/i18n";
function BreakpointsSwitcher() {
  const breakpoints = useBreakpoints();
  const activeBreakpoint = useActiveBreakpoint();
  const activateBreakpoint = useActivateBreakpoint();
  if (!breakpoints.length || !activeBreakpoint) {
    return null;
  }
  const onChange = (_, value) => {
    const extendedWindow = window;
    const config = extendedWindow?.elementor?.editorEvents?.config;
    if (config) {
      extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.responsiveControls, {
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
      "aria-label": __17("Switch Device", "elementor"),
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
          icon: /* @__PURE__ */ React23.createElement(Tooltip5, { title }, /* @__PURE__ */ React23.createElement(Icon, null)),
          sx: { minWidth: "auto" },
          "data-testid": `switch-device-to-${id}`
        }
      );
    })
  );
}
function Tooltip5(props) {
  return /* @__PURE__ */ React23.createElement(
    BaseTooltip3,
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
  "min-width": __17("%s (%dpx and up)", "elementor"),
  // translators: %s: Breakpoint label, %d: Breakpoint size.
  "max-width": __17("%s (up to %dpx)", "elementor")
};

// src/extensions/responsive/index.ts
function init9() {
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
import { Button as Button2, CircularProgress as CircularProgress2, Paper } from "@elementor/ui";
import { __ as __18 } from "@wordpress/i18n";
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
      Button2,
      {
        variant: "contained",
        disabled: !document2 || !document2.isDirty,
        size: "medium",
        sx: { width: "100%" },
        onClick: () => document2 && !document2.isSaving ? save() : null
      },
      document2?.isSaving ? /* @__PURE__ */ React25.createElement(CircularProgress2, null) : __18("Save Changes", "elementor")
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
import { AdjustmentsHorizontalIcon } from "@elementor/icons";
import { __ as __19 } from "@wordpress/i18n";
function useActionProps6() {
  const { isActive, isBlocked } = useRouteStatus4("panel/global", {
    blockOnKitRoutes: false
  });
  return {
    title: __19("Site Settings", "elementor"),
    icon: AdjustmentsHorizontalIcon,
    onClick: () => {
      const extendedWindow = window;
      const config = extendedWindow?.elementor?.editorEvents?.config;
      if (config) {
        extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.siteSettings, {
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
function init10() {
  injectIntoTop({
    id: "site-settings-primary-action-portal",
    component: PortalledPrimaryAction
  });
  toolsMenu.registerToggleAction({
    id: "toggle-site-settings",
    priority: 2,
    useProps: useActionProps6
  });
}

// src/extensions/structure/hooks/use-action-props.ts
import {
  __privateRunCommand as runCommand6,
  __privateUseRouteStatus as useRouteStatus5
} from "@elementor/editor-v1-adapters";
import { StructureIcon } from "@elementor/icons";
import { __ as __20 } from "@wordpress/i18n";
function useActionProps7() {
  const { isActive, isBlocked } = useRouteStatus5("navigator");
  return {
    title: __20("Structure", "elementor"),
    icon: StructureIcon,
    onClick: () => {
      const extendedWindow = window;
      const config = extendedWindow?.elementor?.editorEvents?.config;
      if (config) {
        extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.structure, {
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
function init11() {
  toolsMenu.registerToggleAction({
    id: "toggle-structure-view",
    priority: 3,
    useProps: useActionProps7
  });
}

// src/extensions/theme-builder/hooks/use-action-props.ts
import { __privateRunCommand as runCommand7 } from "@elementor/editor-v1-adapters";
import { ThemeBuilderIcon } from "@elementor/icons";
import { __ as __21 } from "@wordpress/i18n";
function useActionProps8() {
  return {
    icon: ThemeBuilderIcon,
    title: __21("Theme Builder", "elementor"),
    onClick: () => {
      const extendedWindow = window;
      const config = extendedWindow?.elementor?.editorEvents?.config;
      if (config) {
        extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.themeBuilder, {
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
function init12() {
  mainMenu.registerAction({
    id: "open-theme-builder",
    useProps: useActionProps8
  });
}

// src/extensions/user-preferences/hooks/use-action-props.ts
import {
  __privateOpenRoute as openRoute4,
  __privateUseRouteStatus as useRouteStatus6
} from "@elementor/editor-v1-adapters";
import { ToggleRightIcon } from "@elementor/icons";
import { __ as __22 } from "@wordpress/i18n";
function useActionProps9() {
  const { isActive, isBlocked } = useRouteStatus6("panel/editor-preferences");
  return {
    icon: ToggleRightIcon,
    title: __22("User Preferences", "elementor"),
    onClick: () => {
      const extendedWindow = window;
      const config = extendedWindow?.elementor?.editorEvents?.config;
      if (config) {
        extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.userPreferences, {
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
function init13() {
  mainMenu.registerToggleAction({
    id: "open-user-preferences",
    priority: 30,
    // After history.
    useProps: useActionProps9
  });
}

// src/extensions/wordpress/index.ts
import { __useActiveDocument as useActiveDocument9 } from "@elementor/editor-documents";
import { WordpressIcon } from "@elementor/icons";
import { __ as __23 } from "@wordpress/i18n";
function init14() {
  mainMenu.registerLink({
    id: "exit-to-wordpress",
    group: "exits",
    useProps: () => {
      const document2 = useActiveDocument9();
      return {
        title: __23("Exit to WordPress", "elementor"),
        href: document2?.links?.platformEdit,
        icon: WordpressIcon,
        onClick: () => {
          const extendedWindow = window;
          const config = extendedWindow?.elementor?.editorEvents?.config;
          if (config) {
            extendedWindow.elementor.editorEvents.dispatchEvent(config.names.topBar.exitToWordpress, {
              location: config.locations.topBar,
              secondaryLocation: config.secondaryLocations.elementorLogo,
              trigger: config.triggers.click,
              element: config.elements.link
            });
          }
        }
      };
    }
  });
}

// src/extensions/index.ts
function init15() {
  init();
  init2();
  init3();
  init4();
  init5();
  init6();
  init7();
  init8();
  init9();
  init10();
  init11();
  init12();
  init13();
  init14();
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
function init16() {
  redirectOldMenus();
  init15();
  injectIntoTop2({
    id: "app-bar",
    component: AppBar
  });
}
export {
  documentOptionsMenu,
  init16 as init,
  injectIntoPageIndication,
  injectIntoPrimaryAction,
  injectIntoResponsive,
  integrationsMenu,
  mainMenu,
  toolsMenu,
  utilitiesMenu
};
//# sourceMappingURL=index.mjs.map