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
  documentOptionsMenu: () => documentOptionsMenu,
  init: () => init16,
  injectIntoPageIndication: () => injectIntoPageIndication,
  injectIntoPrimaryAction: () => injectIntoPrimaryAction,
  injectIntoResponsive: () => injectIntoResponsive,
  integrationsMenu: () => integrationsMenu,
  mainMenu: () => mainMenu,
  toolsMenu: () => toolsMenu,
  utilitiesMenu: () => utilitiesMenu
});
module.exports = __toCommonJS(index_exports);

// src/locations.ts
var import_locations = require("@elementor/locations");
var import_menus = require("@elementor/menus");

// src/components/actions/action.tsx
var React4 = __toESM(require("react"));

// src/contexts/menu-context.tsx
var React = __toESM(require("react"));
var import_react = require("react");
var MenuContext = (0, import_react.createContext)({
  type: "toolbar"
});
function MenuContextProvider({ type, popupState, children }) {
  return /* @__PURE__ */ React.createElement(MenuContext.Provider, { value: { type, popupState } }, children);
}
function useMenuContext() {
  return (0, import_react.useContext)(MenuContext);
}

// src/components/ui/popover-menu-item.tsx
var React2 = __toESM(require("react"));
var import_icons = require("@elementor/icons");
var import_ui = require("@elementor/ui");
var DirectionalArrowIcon = (0, import_ui.withDirection)(import_icons.ArrowUpRightIcon);
var DirectionalChevronIcon = (0, import_ui.withDirection)(import_icons.ChevronRightIcon);
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
    import_ui.MenuItem,
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
    /* @__PURE__ */ React2.createElement(import_ui.ListItemIcon, null, icon),
    /* @__PURE__ */ React2.createElement(import_ui.ListItemText, { primary: text }),
    isExternalLink && /* @__PURE__ */ React2.createElement(DirectionalArrowIcon, null),
    isGroupParent && /* @__PURE__ */ React2.createElement(DirectionalChevronIcon, null)
  );
}

// src/components/ui/toolbar-menu-item.tsx
var React3 = __toESM(require("react"));
var import_ui2 = require("@elementor/ui");
function ToolbarMenuItem({ title, ...props }) {
  return /* @__PURE__ */ React3.createElement(Tooltip, { title }, /* @__PURE__ */ React3.createElement(import_ui2.Box, { component: "span", "aria-label": void 0 }, /* @__PURE__ */ React3.createElement(
    import_ui2.IconButton,
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
    import_ui2.Tooltip,
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
var React5 = __toESM(require("react"));
function Link({ icon: Icon, title, visible = true, ...props }) {
  const { type } = useMenuContext();
  if (!visible) {
    return null;
  }
  return type === "toolbar" ? /* @__PURE__ */ React5.createElement(ToolbarMenuItem, { title, ...props }, /* @__PURE__ */ React5.createElement(Icon, null)) : /* @__PURE__ */ React5.createElement(PopoverMenuItem, { ...props, text: title, icon: /* @__PURE__ */ React5.createElement(Icon, null) });
}

// src/components/actions/toggle-action.tsx
var React7 = __toESM(require("react"));

// src/components/ui/toolbar-menu-toggle-item.tsx
var React6 = __toESM(require("react"));
var import_ui3 = require("@elementor/ui");
function ToolbarMenuToggleItem({ title, onClick, ...props }) {
  return /* @__PURE__ */ React6.createElement(import_ui3.Tooltip, { title }, /* @__PURE__ */ React6.createElement(import_ui3.Box, { component: "span", "aria-label": void 0 }, /* @__PURE__ */ React6.createElement(
    import_ui3.ToggleButton,
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
var { inject: injectIntoPageIndication, Slot: PageIndicationSlot } = (0, import_locations.createLocation)();
var { inject: injectIntoResponsive, Slot: ResponsiveSlot } = (0, import_locations.createLocation)();
var { inject: injectIntoPrimaryAction, Slot: PrimaryActionSlot } = (0, import_locations.createLocation)();
var components = {
  Action,
  ToggleAction,
  Link
};
var mainMenu = (0, import_menus.createMenu)({
  groups: ["exits"],
  components
});
var toolsMenu = (0, import_menus.createMenu)({ components });
var utilitiesMenu = (0, import_menus.createMenu)({ components });
var integrationsMenu = (0, import_menus.createMenu)({ components });

// src/extensions/documents-save/locations.ts
var import_menus2 = require("@elementor/menus");
var documentOptionsMenu = (0, import_menus2.createMenu)({
  groups: ["save"],
  components: {
    Action,
    ToggleAction,
    Link
  }
});

// src/init.ts
var import_editor2 = require("@elementor/editor");

// src/components/app-bar.tsx
var React19 = __toESM(require("react"));
var import_editor_documents = require("@elementor/editor-documents");
var import_ui11 = require("@elementor/ui");

// src/components/locations/main-menu-location.tsx
var React10 = __toESM(require("react"));
var import_ui6 = require("@elementor/ui");

// src/components/ui/popover-menu.tsx
var React8 = __toESM(require("react"));
var import_ui4 = require("@elementor/ui");
function PopoverMenu({ children, popupState, ...props }) {
  return /* @__PURE__ */ React8.createElement(MenuContextProvider, { type: "popover", popupState }, /* @__PURE__ */ React8.createElement(
    import_ui4.Menu,
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
var React9 = __toESM(require("react"));
var import_react2 = require("react");
var import_ui5 = require("@elementor/ui");
var import_i18n = require("@wordpress/i18n");
var ElementorLogo = (props) => {
  return /* @__PURE__ */ React9.createElement(import_ui5.SvgIcon, { viewBox: "0 0 32 32", ...props }, /* @__PURE__ */ React9.createElement("g", null, /* @__PURE__ */ React9.createElement("circle", { cx: "16", cy: "16", r: "16" }), /* @__PURE__ */ React9.createElement("path", { d: "M11.7 9H9V22.3H11.7V9Z" }), /* @__PURE__ */ React9.createElement("path", { d: "M22.4 9H9V11.7H22.4V9Z" }), /* @__PURE__ */ React9.createElement("path", { d: "M22.4 14.4004H9V17.1004H22.4V14.4004Z" }), /* @__PURE__ */ React9.createElement("path", { d: "M22.4 19.6992H9V22.3992H22.4V19.6992Z" })));
};
var StyledToggleButton = (0, import_ui5.styled)(import_ui5.ToggleButton)(({ theme }) => ({
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
var StyledElementorLogo = (0, import_ui5.styled)(ElementorLogo, {
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
  const [isHoverState, setIsHoverState] = (0, import_react2.useState)(false);
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
        titleAccess: (0, import_i18n.__)("Elementor Logo", "elementor")
      }
    )
  );
}

// src/components/locations/main-menu-location.tsx
var { useMenuItems } = mainMenu;
function MainMenuLocation() {
  const menuItems = useMenuItems();
  const popupState = (0, import_ui6.usePopupState)({
    variant: "popover",
    popupId: "elementor-v2-app-bar-main-menu"
  });
  const toolbarLogoProps = (0, import_ui6.bindTrigger)(popupState);
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
  return /* @__PURE__ */ React10.createElement(import_ui6.Stack, { sx: { paddingInlineStart: 3 }, direction: "row", alignItems: "center" }, /* @__PURE__ */ React10.createElement(ToolbarLogo, { ...toolbarLogoProps, onClick: onToolbarClick, selected: popupState.isOpen }), /* @__PURE__ */ React10.createElement(PopoverMenu, { onClick: popupState.close, ...(0, import_ui6.bindMenu)(popupState), marginThreshold: 8 }, menuItems.default.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React10.createElement(MenuItem2, { key: id })), menuItems.exits.length > 0 && /* @__PURE__ */ React10.createElement(import_ui6.Divider, null), menuItems.exits.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React10.createElement(MenuItem2, { key: id }))));
}

// src/components/locations/page-indication-location.tsx
var React11 = __toESM(require("react"));
function PageIndicationLocation() {
  return /* @__PURE__ */ React11.createElement(PageIndicationSlot, null);
}

// src/components/locations/primary-action-location.tsx
var React12 = __toESM(require("react"));
function PrimaryActionLocation() {
  return /* @__PURE__ */ React12.createElement(PrimaryActionSlot, null);
}

// src/components/locations/responsive-location.tsx
var React13 = __toESM(require("react"));
function ResponsiveLocation() {
  return /* @__PURE__ */ React13.createElement(ResponsiveSlot, null);
}

// src/components/locations/tools-menu-location.tsx
var React17 = __toESM(require("react"));

// src/components/ui/toolbar-menu.tsx
var React14 = __toESM(require("react"));
var import_ui7 = require("@elementor/ui");
function ToolbarMenu({ children, ...props }) {
  return /* @__PURE__ */ React14.createElement(MenuContextProvider, { type: "toolbar" }, /* @__PURE__ */ React14.createElement(import_ui7.Stack, { sx: { px: 1.5 }, spacing: 1.5, direction: "row", alignItems: "center", ...props }, children));
}

// src/components/ui/toolbar-menu-more.tsx
var React15 = __toESM(require("react"));
var import_icons2 = require("@elementor/icons");
var import_ui8 = require("@elementor/ui");
var import_i18n2 = require("@wordpress/i18n");
function ToolbarMenuMore({ children, id }) {
  const popupState = (0, import_ui8.usePopupState)({
    variant: "popover",
    popupId: id
  });
  return /* @__PURE__ */ React15.createElement(React15.Fragment, null, /* @__PURE__ */ React15.createElement(ToolbarMenuItem, { ...(0, import_ui8.bindTrigger)(popupState), title: (0, import_i18n2.__)("More", "elementor") }, /* @__PURE__ */ React15.createElement(import_icons2.DotsVerticalIcon, null)), /* @__PURE__ */ React15.createElement(PopoverMenu, { onClick: popupState.close, ...(0, import_ui8.bindMenu)(popupState) }, children));
}

// src/components/locations/integrations-menu-location.tsx
var React16 = __toESM(require("react"));
var import_icons3 = require("@elementor/icons");
var import_ui9 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");
var { useMenuItems: useMenuItems2 } = integrationsMenu;
function IntegrationsMenuLocation() {
  const menuItems = useMenuItems2();
  const popupState = (0, import_ui9.usePopupState)({
    variant: "popover",
    popupId: "elementor-v2-app-bar-integrations"
  });
  if (menuItems.default.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React16.createElement(React16.Fragment, null, /* @__PURE__ */ React16.createElement(ToolbarMenuItem, { ...(0, import_ui9.bindTrigger)(popupState), title: (0, import_i18n3.__)("Integrations", "elementor") }, /* @__PURE__ */ React16.createElement(import_icons3.PlugIcon, null)), /* @__PURE__ */ React16.createElement(
    PopoverMenu,
    {
      onClick: popupState.close,
      ...(0, import_ui9.bindMenu)(popupState),
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
var React18 = __toESM(require("react"));
var import_react3 = require("react");
var import_ui10 = require("@elementor/ui");
var MAX_TOOLBAR_ACTIONS2 = 4;
var { useMenuItems: useMenuItems4 } = utilitiesMenu;
function UtilitiesMenuLocation() {
  const menuItems = useMenuItems4();
  const shouldUsePopover = menuItems.default.length > MAX_TOOLBAR_ACTIONS2 + 1;
  const toolbarMenuItems = shouldUsePopover ? menuItems.default.slice(0, MAX_TOOLBAR_ACTIONS2) : menuItems.default;
  const popoverMenuItems = shouldUsePopover ? menuItems.default.slice(MAX_TOOLBAR_ACTIONS2) : [];
  return /* @__PURE__ */ React18.createElement(ToolbarMenu, null, toolbarMenuItems.map(({ MenuItem: MenuItem2, id }, index) => /* @__PURE__ */ React18.createElement(import_react3.Fragment, { key: id }, index === 0 && /* @__PURE__ */ React18.createElement(import_ui10.Divider, { orientation: "vertical" }), /* @__PURE__ */ React18.createElement(MenuItem2, null))), popoverMenuItems.length > 0 && /* @__PURE__ */ React18.createElement(ToolbarMenuMore, { id: "elementor-editor-app-bar-utilities-more" }, popoverMenuItems.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React18.createElement(MenuItem2, { key: id }))));
}

// src/components/app-bar.tsx
function AppBar() {
  const document2 = (0, import_editor_documents.__useActiveDocument)();
  return /* @__PURE__ */ React19.createElement(import_ui11.ThemeProvider, { colorScheme: "dark" }, /* @__PURE__ */ React19.createElement(import_ui11.AppBar, { position: "sticky" }, /* @__PURE__ */ React19.createElement(import_ui11.Toolbar, { disableGutters: true, variant: "dense" }, /* @__PURE__ */ React19.createElement(import_ui11.Box, { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", flexGrow: 1 }, /* @__PURE__ */ React19.createElement(import_ui11.Grid, { container: true, flexWrap: "nowrap" }, /* @__PURE__ */ React19.createElement(MainMenuLocation, null), document2?.permissions?.allowAddingWidgets && /* @__PURE__ */ React19.createElement(ToolsMenuLocation, null)), /* @__PURE__ */ React19.createElement(import_ui11.Grid, { container: true, justifyContent: "center" }, /* @__PURE__ */ React19.createElement(ToolbarMenu, { spacing: 1.5 }, /* @__PURE__ */ React19.createElement(import_ui11.Divider, { orientation: "vertical" }), /* @__PURE__ */ React19.createElement(PageIndicationLocation, null), /* @__PURE__ */ React19.createElement(import_ui11.Divider, { orientation: "vertical" }), /* @__PURE__ */ React19.createElement(ResponsiveLocation, null), /* @__PURE__ */ React19.createElement(import_ui11.Divider, { orientation: "vertical" }))), /* @__PURE__ */ React19.createElement(import_ui11.Grid, { container: true, justifyContent: "flex-end", flexWrap: "nowrap" }, /* @__PURE__ */ React19.createElement(UtilitiesMenuLocation, null), /* @__PURE__ */ React19.createElement(PrimaryActionLocation, null))))));
}

// src/extensions/documents-indicator/components/settings-button.tsx
var React20 = __toESM(require("react"));
var import_editor_documents2 = require("@elementor/editor-documents");
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var import_icons4 = require("@elementor/icons");
var import_ui12 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");
function SettingsButton() {
  const activeDocument = (0, import_editor_documents2.__useActiveDocument)();
  const hostDocument = (0, import_editor_documents2.__useHostDocument)();
  const document2 = activeDocument && activeDocument.type.value !== "kit" ? activeDocument : hostDocument;
  const { isActive, isBlocked } = (0, import_editor_v1_adapters.__privateUseRouteStatus)("panel/page-settings");
  if (!document2) {
    return null;
  }
  const title = (0, import_i18n4.__)("%s Settings", "elementor").replace("%s", document2.type.label);
  return /* @__PURE__ */ React20.createElement(Tooltip3, { title }, /* @__PURE__ */ React20.createElement(import_ui12.Box, { component: "span", "aria-label": void 0 }, /* @__PURE__ */ React20.createElement(
    import_ui12.ToggleButton,
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
        (0, import_editor_v1_adapters.__privateOpenRoute)("panel/page-settings/settings");
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
    /* @__PURE__ */ React20.createElement(import_icons4.SettingsIcon, { fontSize: "small" })
  )));
}
function Tooltip3(props) {
  return /* @__PURE__ */ React20.createElement(
    import_ui12.Tooltip,
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
var import_editor_documents3 = require("@elementor/editor-documents");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
var import_icons5 = require("@elementor/icons");
var import_i18n5 = require("@wordpress/i18n");
function useActionProps() {
  const document2 = (0, import_editor_documents3.__useActiveDocument)();
  return {
    icon: import_icons5.EyeIcon,
    title: (0, import_i18n5.__)("Preview Changes", "elementor"),
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
        (0, import_editor_v1_adapters2.__privateRunCommand)("editor/documents/preview", {
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
var React22 = __toESM(require("react"));
var import_editor_documents4 = require("@elementor/editor-documents");
var import_editor_v1_adapters3 = require("@elementor/editor-v1-adapters");
var import_icons6 = require("@elementor/icons");
var import_ui14 = require("@elementor/ui");
var import_i18n6 = require("@wordpress/i18n");

// src/extensions/documents-save/components/primary-action-menu.tsx
var React21 = __toESM(require("react"));
var import_ui13 = require("@elementor/ui");
var { useMenuItems: useMenuItems5 } = documentOptionsMenu;
var StyledPopoverMenu = (0, import_ui13.styled)(PopoverMenu)`
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
      index > 0 && /* @__PURE__ */ React21.createElement(import_ui13.Divider, { key: `${id}-divider` }),
      /* @__PURE__ */ React21.createElement(MenuItem2, { key: id })
    ]),
    saveActions.length > 0 && defaultActions.length > 0 && /* @__PURE__ */ React21.createElement(import_ui13.Divider, null),
    defaultActions.map(({ MenuItem: MenuItem2, id }, index) => [
      index > 0 && /* @__PURE__ */ React21.createElement(import_ui13.Divider, { key: `${id}-divider` }),
      /* @__PURE__ */ React21.createElement(MenuItem2, { key: id })
    ])
  );
}

// src/extensions/documents-save/components/primary-action.tsx
function PrimaryAction() {
  const document2 = (0, import_editor_documents4.__useActiveDocument)();
  const { save } = (0, import_editor_documents4.__useActiveDocumentActions)();
  const editMode = (0, import_editor_v1_adapters3.useEditMode)();
  const isEditMode = editMode === "edit";
  const popupState = (0, import_ui14.usePopupState)({
    variant: "popover",
    popupId: "document-save-options"
  });
  if (!document2) {
    return null;
  }
  const isPublishDisabled = !isEditMode || !isPublishEnabled(document2);
  const isSaveOptionsDisabled = !isEditMode || document2.type.value === "kit";
  const shouldShowSpinner = document2.isSaving && !isPublishDisabled;
  return /* @__PURE__ */ React22.createElement(React22.Fragment, null, /* @__PURE__ */ React22.createElement(import_ui14.ButtonGroup, { size: "large", variant: "contained" }, /* @__PURE__ */ React22.createElement(
    import_ui14.Button,
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
    shouldShowSpinner ? /* @__PURE__ */ React22.createElement(import_ui14.CircularProgress, { color: "inherit", size: "1.5em" }) : getLabel(document2)
  ), /* @__PURE__ */ React22.createElement(
    import_ui14.Tooltip,
    {
      title: (0, import_i18n6.__)("Save Options", "elementor"),
      PopperProps: {
        sx: {
          "&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom": {
            mt: 1,
            mr: 0.25
          }
        }
      }
    },
    /* @__PURE__ */ React22.createElement(import_ui14.Box, { component: "span", "aria-label": void 0 }, /* @__PURE__ */ React22.createElement(
      import_ui14.Button,
      {
        size: "small",
        ...(0, import_ui14.bindTrigger)(popupState),
        sx: { px: 0, height: "100%", borderRadius: 0 },
        disabled: isSaveOptionsDisabled,
        "aria-label": (0, import_i18n6.__)("Save Options", "elementor")
      },
      /* @__PURE__ */ React22.createElement(import_icons6.ChevronDownIcon, null)
    ))
  )), /* @__PURE__ */ React22.createElement(PrimaryActionMenu, { ...(0, import_ui14.bindMenu)(popupState), onClick: popupState.close }));
}
function getLabel(document2) {
  return document2.userCan.publish ? (0, import_i18n6.__)("Publish", "elementor") : (0, import_i18n6.__)("Submit", "elementor");
}
function isPublishEnabled(document2) {
  if (document2.type.value === "kit") {
    return false;
  }
  return document2.isDirty || document2.status.value === "draft";
}

// src/extensions/documents-save/hooks/use-document-copy-and-share-props.ts
var import_editor_documents5 = require("@elementor/editor-documents");
var import_icons7 = require("@elementor/icons");
var import_i18n7 = require("@wordpress/i18n");
function useDocumentCopyAndShareProps() {
  const document2 = (0, import_editor_documents5.__useActiveDocument)();
  const { copyAndShare } = (0, import_editor_documents5.__useActiveDocumentActions)();
  return {
    icon: import_icons7.LinkIcon,
    title: (0, import_i18n7.__)("Copy and Share", "elementor"),
    onClick: copyAndShare,
    disabled: !document2 || document2.isSaving || document2.isSavingDraft || !("publish" === document2.status.value),
    visible: document2?.permissions?.showCopyAndShare
  };
}

// src/extensions/documents-save/hooks/use-document-save-draft-props.ts
var import_editor_documents6 = require("@elementor/editor-documents");
var import_icons8 = require("@elementor/icons");
var import_i18n8 = require("@wordpress/i18n");
function useDocumentSaveDraftProps() {
  const document2 = (0, import_editor_documents6.__useActiveDocument)();
  const { saveDraft } = (0, import_editor_documents6.__useActiveDocumentActions)();
  return {
    icon: import_icons8.FileReportIcon,
    title: (0, import_i18n8.__)("Save Draft", "elementor"),
    onClick: saveDraft,
    disabled: !document2 || document2.isSaving || document2.isSavingDraft || !document2.isDirty
  };
}

// src/extensions/documents-save/hooks/use-document-save-template-props.ts
var import_editor_documents7 = require("@elementor/editor-documents");
var import_icons9 = require("@elementor/icons");
var import_i18n9 = require("@wordpress/i18n");
function useDocumentSaveTemplateProps() {
  const { saveTemplate } = (0, import_editor_documents7.__useActiveDocumentActions)();
  return {
    icon: import_icons9.FolderIcon,
    title: (0, import_i18n9.__)("Save as Template", "elementor"),
    onClick: saveTemplate
  };
}

// src/extensions/documents-save/hooks/use-document-view-page-props.ts
var import_editor_documents8 = require("@elementor/editor-documents");
var import_editor_v1_adapters4 = require("@elementor/editor-v1-adapters");
var import_icons10 = require("@elementor/icons");
var import_i18n10 = require("@wordpress/i18n");
function useDocumentViewPageProps() {
  const document2 = (0, import_editor_documents8.__useActiveDocument)();
  return {
    icon: import_icons10.EyeIcon,
    title: (0, import_i18n10.__)("View Page", "elementor"),
    onClick: () => document2?.id && (0, import_editor_v1_adapters4.__privateRunCommand)("editor/documents/view", {
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
var import_editor_v1_adapters5 = require("@elementor/editor-v1-adapters");
var import_icons11 = require("@elementor/icons");
var import_i18n11 = require("@wordpress/i18n");
function useActionProps2() {
  const { isActive, isBlocked } = (0, import_editor_v1_adapters5.__privateUseRouteStatus)("panel/elements");
  return {
    title: (0, import_i18n11.__)("Add Element", "elementor"),
    icon: import_icons11.PlusIcon,
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
      (0, import_editor_v1_adapters5.__privateOpenRoute)("panel/elements/categories");
    },
    selected: isActive,
    disabled: isBlocked
  };
}

// src/extensions/elements/sync/sync-panel-title.ts
var import_editor_v1_adapters6 = require("@elementor/editor-v1-adapters");
var import_i18n12 = require("@wordpress/i18n");
function syncPanelTitle() {
  const panelTitle = (0, import_i18n12.__)("Elements", "elementor");
  const tabTitle = (0, import_i18n12.__)("Widgets", "elementor");
  (0, import_editor_v1_adapters6.__privateListenTo)((0, import_editor_v1_adapters6.routeOpenEvent)("panel/elements"), () => {
    setPanelTitle(panelTitle);
    setTabTitle(tabTitle);
  });
  (0, import_editor_v1_adapters6.__privateListenTo)((0, import_editor_v1_adapters6.v1ReadyEvent)(), () => {
    if ((0, import_editor_v1_adapters6.__privateIsRouteActive)("panel/elements")) {
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
var import_editor_v1_adapters7 = require("@elementor/editor-v1-adapters");
var import_icons12 = require("@elementor/icons");
var import_i18n13 = require("@wordpress/i18n");
function useActionProps3() {
  return {
    title: (0, import_i18n13.__)("Finder", "elementor"),
    icon: import_icons12.SearchIcon,
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
      (0, import_editor_v1_adapters7.__privateRunCommand)("finder/toggle");
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
var import_icons13 = require("@elementor/icons");
var import_i18n14 = require("@wordpress/i18n");
function init6() {
  utilitiesMenu.registerLink({
    id: "open-help-center",
    priority: 25,
    // After Finder.
    useProps: () => {
      return {
        title: (0, import_i18n14.__)("Help", "elementor"),
        href: "https://go.elementor.com/editor-top-bar-learn/",
        icon: import_icons13.HelpIcon,
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
var import_editor_v1_adapters8 = require("@elementor/editor-v1-adapters");
var import_icons14 = require("@elementor/icons");
var import_i18n15 = require("@wordpress/i18n");
function useActionProps4() {
  const { isActive, isBlocked } = (0, import_editor_v1_adapters8.__privateUseRouteStatus)("panel/history");
  return {
    title: (0, import_i18n15.__)("History", "elementor"),
    icon: import_icons14.HistoryIcon,
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
      (0, import_editor_v1_adapters8.__privateOpenRoute)("panel/history/actions");
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
var import_editor_v1_adapters9 = require("@elementor/editor-v1-adapters");
var import_icons15 = require("@elementor/icons");
var import_i18n16 = require("@wordpress/i18n");
function useActionProps5() {
  return {
    icon: import_icons15.KeyboardIcon,
    title: (0, import_i18n16.__)("Keyboard Shortcuts", "elementor"),
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
      (0, import_editor_v1_adapters9.__privateRunCommand)("shortcuts/open");
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
var React23 = __toESM(require("react"));
var import_editor_responsive = require("@elementor/editor-responsive");
var import_icons16 = require("@elementor/icons");
var import_ui15 = require("@elementor/ui");
var import_i18n17 = require("@wordpress/i18n");
function BreakpointsSwitcher() {
  const breakpoints = (0, import_editor_responsive.useBreakpoints)();
  const activeBreakpoint = (0, import_editor_responsive.useActiveBreakpoint)();
  const activateBreakpoint = (0, import_editor_responsive.useActivateBreakpoint)();
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
    import_ui15.Tabs,
    {
      textColor: "inherit",
      indicatorColor: "secondary",
      value: activeBreakpoint,
      onChange,
      "aria-label": (0, import_i18n17.__)("Switch Device", "elementor"),
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
        import_ui15.Tab,
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
    import_ui15.Tooltip,
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
  widescreen: import_icons16.WidescreenIcon,
  desktop: import_icons16.DesktopIcon,
  laptop: import_icons16.LaptopIcon,
  tablet_extra: import_icons16.TabletLandscapeIcon,
  tablet: import_icons16.TabletPortraitIcon,
  mobile_extra: import_icons16.MobileLandscapeIcon,
  mobile: import_icons16.MobilePortraitIcon
};
var labelsMap = {
  default: "%s",
  // translators: %s: Breakpoint label, %d: Breakpoint size.
  "min-width": (0, import_i18n17.__)("%s (%dpx and up)", "elementor"),
  // translators: %s: Breakpoint label, %d: Breakpoint size.
  "max-width": (0, import_i18n17.__)("%s (up to %dpx)", "elementor")
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
var import_editor = require("@elementor/editor");

// src/extensions/site-settings/components/portalled-primary-action.tsx
var React26 = __toESM(require("react"));

// src/extensions/site-settings/components/portal.tsx
var React24 = __toESM(require("react"));
var import_editor_v1_adapters10 = require("@elementor/editor-v1-adapters");
var import_ui16 = require("@elementor/ui");
function Portal(props) {
  const containerRef = (0, import_editor_v1_adapters10.__privateUseListenTo)(
    [(0, import_editor_v1_adapters10.routeOpenEvent)("panel/global"), (0, import_editor_v1_adapters10.routeCloseEvent)("panel/global")],
    getContainerRef
  );
  if (!containerRef.current) {
    return null;
  }
  return /* @__PURE__ */ React24.createElement(import_ui16.Portal, { container: containerRef.current, ...props });
}
function getContainerRef() {
  return (0, import_editor_v1_adapters10.__privateIsRouteActive)("panel/global") ? { current: document.querySelector("#elementor-panel-inner") } : { current: null };
}

// src/extensions/site-settings/components/primary-action.tsx
var React25 = __toESM(require("react"));
var import_editor_documents9 = require("@elementor/editor-documents");
var import_ui17 = require("@elementor/ui");
var import_i18n18 = require("@wordpress/i18n");
function PrimaryAction2() {
  const document2 = (0, import_editor_documents9.__useActiveDocument)();
  const { save } = (0, import_editor_documents9.__useActiveDocumentActions)();
  return /* @__PURE__ */ React25.createElement(
    import_ui17.Paper,
    {
      sx: {
        px: 5,
        py: 4,
        borderTop: 1,
        borderColor: "divider"
      }
    },
    /* @__PURE__ */ React25.createElement(
      import_ui17.Button,
      {
        variant: "contained",
        disabled: !document2 || !document2.isDirty,
        size: "medium",
        sx: { width: "100%" },
        onClick: () => document2 && !document2.isSaving ? save() : null
      },
      document2?.isSaving ? /* @__PURE__ */ React25.createElement(import_ui17.CircularProgress, null) : (0, import_i18n18.__)("Save Changes", "elementor")
    )
  );
}

// src/extensions/site-settings/components/portalled-primary-action.tsx
function PortalledPrimaryAction() {
  return /* @__PURE__ */ React26.createElement(Portal, null, /* @__PURE__ */ React26.createElement(PrimaryAction2, null));
}

// src/extensions/site-settings/hooks/use-action-props.ts
var import_editor_v1_adapters11 = require("@elementor/editor-v1-adapters");
var import_icons17 = require("@elementor/icons");
var import_i18n19 = require("@wordpress/i18n");
function useActionProps6() {
  const { isActive, isBlocked } = (0, import_editor_v1_adapters11.__privateUseRouteStatus)("panel/global", {
    blockOnKitRoutes: false
  });
  return {
    title: (0, import_i18n19.__)("Site Settings", "elementor"),
    icon: import_icons17.AdjustmentsHorizontalIcon,
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
        (0, import_editor_v1_adapters11.__privateRunCommand)("panel/global/close");
      } else {
        (0, import_editor_v1_adapters11.__privateRunCommand)("panel/global/open");
      }
    },
    selected: isActive,
    disabled: isBlocked
  };
}

// src/extensions/site-settings/index.ts
function init10() {
  (0, import_editor.injectIntoTop)({
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
var import_editor_v1_adapters12 = require("@elementor/editor-v1-adapters");
var import_icons18 = require("@elementor/icons");
var import_i18n20 = require("@wordpress/i18n");
function useActionProps7() {
  const { isActive, isBlocked } = (0, import_editor_v1_adapters12.__privateUseRouteStatus)("navigator");
  return {
    title: (0, import_i18n20.__)("Structure", "elementor"),
    icon: import_icons18.StructureIcon,
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
      (0, import_editor_v1_adapters12.__privateRunCommand)("navigator/toggle");
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
var import_editor_v1_adapters13 = require("@elementor/editor-v1-adapters");
var import_icons19 = require("@elementor/icons");
var import_i18n21 = require("@wordpress/i18n");
function useActionProps8() {
  return {
    icon: import_icons19.ThemeBuilderIcon,
    title: (0, import_i18n21.__)("Theme Builder", "elementor"),
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
      (0, import_editor_v1_adapters13.__privateRunCommand)("app/open");
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
var import_editor_v1_adapters14 = require("@elementor/editor-v1-adapters");
var import_icons20 = require("@elementor/icons");
var import_i18n22 = require("@wordpress/i18n");
function useActionProps9() {
  const { isActive, isBlocked } = (0, import_editor_v1_adapters14.__privateUseRouteStatus)("panel/editor-preferences");
  return {
    icon: import_icons20.ToggleRightIcon,
    title: (0, import_i18n22.__)("User Preferences", "elementor"),
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
      (0, import_editor_v1_adapters14.__privateOpenRoute)("panel/editor-preferences");
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
var import_editor_documents10 = require("@elementor/editor-documents");
var import_icons21 = require("@elementor/icons");
var import_i18n23 = require("@wordpress/i18n");
function init14() {
  mainMenu.registerLink({
    id: "exit-to-wordpress",
    group: "exits",
    useProps: () => {
      const document2 = (0, import_editor_documents10.__useActiveDocument)();
      return {
        title: (0, import_i18n23.__)("Exit to WordPress", "elementor"),
        href: document2?.links?.platformEdit,
        icon: import_icons21.WordpressIcon,
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
var import_editor_v1_adapters15 = require("@elementor/editor-v1-adapters");
function redirectOldMenus() {
  (0, import_editor_v1_adapters15.__privateListenTo)((0, import_editor_v1_adapters15.routeOpenEvent)("panel/menu"), () => {
    (0, import_editor_v1_adapters15.__privateOpenRoute)("panel/elements/categories");
  });
}

// src/init.ts
function init16() {
  redirectOldMenus();
  init15();
  (0, import_editor2.injectIntoTop)({
    id: "app-bar",
    component: AppBar
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  documentOptionsMenu,
  init,
  injectIntoPageIndication,
  injectIntoPrimaryAction,
  injectIntoResponsive,
  integrationsMenu,
  mainMenu,
  toolsMenu,
  utilitiesMenu
});
//# sourceMappingURL=index.js.map