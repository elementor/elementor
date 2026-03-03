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
  CollapseIcon: () => CollapseIcon,
  CollapsibleContent: () => CollapsibleContent,
  ConfirmationDialog: () => ConfirmationDialog,
  CtaButton: () => CtaButton,
  EditableField: () => EditableField,
  EllipsisWithTooltip: () => EllipsisWithTooltip,
  FloatingActionsBar: () => FloatingActionsBar,
  Form: () => Form,
  GlobalDialog: () => GlobalDialog,
  ITEM_HEIGHT: () => ITEM_HEIGHT,
  InfoAlert: () => InfoAlert,
  InfoTipCard: () => InfoTipCard,
  IntroductionModal: () => IntroductionModal,
  MenuItemInfotip: () => MenuItemInfotip,
  MenuListItem: () => MenuListItem,
  PopoverAction: () => PopoverAction,
  PopoverBody: () => PopoverBody,
  PopoverHeader: () => PopoverHeader,
  PopoverMenuList: () => PopoverMenuList,
  PromotionAlert: () => PromotionAlert,
  PromotionChip: () => PromotionChip,
  PromotionInfotip: () => PromotionInfotip,
  PromotionPopover: () => PromotionPopover,
  SaveChangesDialog: () => SaveChangesDialog,
  SearchField: () => SearchField,
  SectionPopoverBody: () => SectionPopoverBody,
  SectionRefContext: () => SectionRefContext,
  StyledMenuList: () => StyledMenuList,
  ThemeProvider: () => ThemeProvider,
  WarningInfotip: () => WarningInfotip,
  closeDialog: () => closeDialog,
  getCollapsibleValue: () => getCollapsibleValue,
  openDialog: () => openDialog,
  useCanvasClickHandler: () => useCanvasClickHandler,
  useDialog: () => useDialog,
  useEditable: () => useEditable,
  useFloatingActionsBar: () => useFloatingActionsBar,
  useSectionWidth: () => useSectionWidth,
  useTextFieldAutoSelect: () => useTextFieldAutoSelect
});
module.exports = __toCommonJS(index_exports);

// src/components/collapse-icon.tsx
var import_icons = require("@elementor/icons");
var import_ui = require("@elementor/ui");
var CollapseIcon = (0, import_ui.styled)(import_icons.ChevronDownIcon, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "disabled"
})(({ theme, open, disabled = false }) => ({
  transform: open ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.standard
  }),
  opacity: disabled ? 0.4 : 1
}));

// src/components/collapsible-content.tsx
var React = __toESM(require("react"));
var import_react = require("react");
var import_ui2 = require("@elementor/ui");
var import_i18n = require("@wordpress/i18n");
var IndicatorsWrapper = (0, import_ui2.styled)("div")`
	position: absolute;
	top: 0;
	right: ${({ theme }) => theme.spacing(3)};
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;
var CollapsibleContent = ({ children, defaultOpen = false, titleEnd = null }) => {
  const [open, setOpen] = (0, import_react.useState)(defaultOpen);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  return /* @__PURE__ */ React.createElement(import_ui2.Stack, null, /* @__PURE__ */ React.createElement(import_ui2.Stack, { sx: { position: "relative" } }, /* @__PURE__ */ React.createElement(
    import_ui2.Button,
    {
      fullWidth: true,
      size: "small",
      color: "secondary",
      variant: "outlined",
      onClick: handleToggle,
      endIcon: /* @__PURE__ */ React.createElement(CollapseIcon, { open }),
      sx: { my: 0.5 },
      "aria-label": open ? "Show less" : "Show more"
    },
    open ? (0, import_i18n.__)("Show less", "elementor") : (0, import_i18n.__)("Show more", "elementor")
  ), titleEnd && /* @__PURE__ */ React.createElement(IndicatorsWrapper, null, getCollapsibleValue(titleEnd, open))), /* @__PURE__ */ React.createElement(import_ui2.Collapse, { in: open, timeout: "auto", unmountOnExit: true }, children));
};
function getCollapsibleValue(value, isOpen) {
  if (typeof value === "function") {
    return value(isOpen);
  }
  return value;
}

// src/components/ellipsis-with-tooltip.tsx
var React2 = __toESM(require("react"));
var import_react2 = require("react");
var import_ui3 = require("@elementor/ui");
var EllipsisWithTooltip = ({
  maxWidth,
  title,
  as,
  ...props
}) => {
  const [setRef, isOverflowing] = useIsOverflowing();
  if (isOverflowing) {
    return /* @__PURE__ */ React2.createElement(import_ui3.Tooltip, { title, placement: "top" }, /* @__PURE__ */ React2.createElement(Content, { maxWidth, ref: setRef, as, ...props }, title));
  }
  return /* @__PURE__ */ React2.createElement(Content, { maxWidth, ref: setRef, as, ...props }, title);
};
var Content = React2.forwardRef(
  ({ maxWidth, as: Component = import_ui3.Box, ...props }, ref) => /* @__PURE__ */ React2.createElement(
    Component,
    {
      ref,
      position: "relative",
      ...props,
      style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth }
    }
  )
);
var useIsOverflowing = () => {
  const [el, setEl] = (0, import_react2.useState)(null);
  const [isOverflowing, setIsOverflown] = (0, import_react2.useState)(false);
  (0, import_react2.useEffect)(() => {
    const observer = new ResizeObserver(([{ target }]) => {
      setIsOverflown(target.scrollWidth > target.clientWidth);
    });
    if (el) {
      observer.observe(el);
    }
    return () => {
      observer.disconnect();
    };
  }, [el]);
  return [setEl, isOverflowing];
};

// src/components/editable-field.tsx
var React3 = __toESM(require("react"));
var import_react3 = require("react");
var import_ui4 = require("@elementor/ui");
var EditableField = (0, import_react3.forwardRef)(
  ({ value, error, as = "span", sx, ...props }, ref) => {
    return /* @__PURE__ */ React3.createElement(import_ui4.Tooltip, { title: error, open: !!error, placement: "top" }, /* @__PURE__ */ React3.createElement(StyledField, { ref, component: as, ...props }, value));
  }
);
var StyledField = (0, import_ui4.styled)(import_ui4.Box)`
	width: 100%;
	&:focus {
		outline: none;
	}
`;

// src/components/introduction-modal.tsx
var React4 = __toESM(require("react"));
var import_react4 = require("react");
var import_ui5 = require("@elementor/ui");
var import_i18n2 = require("@wordpress/i18n");
var IntroductionModal = ({ open, handleClose, title, children }) => {
  const [shouldShowAgain, setShouldShowAgain] = (0, import_react4.useState)(true);
  return /* @__PURE__ */ React4.createElement(import_ui5.Dialog, { open, onClose: handleClose, maxWidth: "sm", TransitionComponent: Transition }, title && /* @__PURE__ */ React4.createElement(import_ui5.DialogHeader, { logo: false }, /* @__PURE__ */ React4.createElement(import_ui5.DialogTitle, null, title)), children, /* @__PURE__ */ React4.createElement(import_ui5.DialogActions, null, /* @__PURE__ */ React4.createElement(
    import_ui5.FormControlLabel,
    {
      sx: { marginRight: "auto" },
      control: /* @__PURE__ */ React4.createElement(
        import_ui5.Checkbox,
        {
          checked: !shouldShowAgain,
          onChange: () => setShouldShowAgain(!shouldShowAgain)
        }
      ),
      label: /* @__PURE__ */ React4.createElement(import_ui5.Typography, { variant: "body2" }, (0, import_i18n2.__)("Don't show this again", "elementor"))
    }
  ), /* @__PURE__ */ React4.createElement(
    import_ui5.Button,
    {
      size: "medium",
      variant: "contained",
      sx: { minWidth: "135px" },
      "aria-label": (0, import_i18n2.__)("Got it introduction", "elementor"),
      onClick: () => handleClose(shouldShowAgain)
    },
    (0, import_i18n2.__)("Got it", "elementor")
  )));
};
var Transition = React4.forwardRef((props, ref) => /* @__PURE__ */ React4.createElement(
  import_ui5.Fade,
  {
    ref,
    ...props,
    timeout: {
      enter: 1e3,
      exit: 200
    }
  }
));

// src/components/theme-provider.tsx
var React5 = __toESM(require("react"));
var import_ui6 = require("@elementor/ui");

// src/hooks/use-color-scheme.ts
var import_react5 = require("react");
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
function useColorScheme() {
  const [colorScheme, setColorScheme] = (0, import_react5.useState)(() => getV1ColorScheme());
  (0, import_react5.useEffect)(() => {
    return (0, import_editor_v1_adapters.__privateListenTo)((0, import_editor_v1_adapters.v1ReadyEvent)(), () => setColorScheme(getV1ColorScheme()));
  }, []);
  (0, import_react5.useEffect)(() => {
    return (0, import_editor_v1_adapters.__privateListenTo)((0, import_editor_v1_adapters.commandEndEvent)("document/elements/settings"), (e) => {
      const event = e;
      const isColorScheme = event.args?.settings && "ui_theme" in event.args.settings;
      if (isColorScheme) {
        setColorScheme(getV1ColorScheme());
      }
    });
  }, []);
  return colorScheme;
}
function getV1ColorScheme() {
  return window.elementor?.getPreferences?.("ui_theme") || "auto";
}

// src/components/theme-provider.tsx
var EDITOR_PALLETTE = "unstable";
function ThemeProvider({ children }) {
  const colorScheme = useColorScheme();
  return /* @__PURE__ */ React5.createElement(import_ui6.ThemeProvider, { colorScheme, palette: EDITOR_PALLETTE }, children);
}

// src/components/menu-item.tsx
var React7 = __toESM(require("react"));
var import_react6 = require("react");
var import_ui8 = require("@elementor/ui");

// src/components/info-alert.tsx
var React6 = __toESM(require("react"));
var import_icons2 = require("@elementor/icons");
var import_ui7 = require("@elementor/ui");
var InfoAlert = (props) => /* @__PURE__ */ React6.createElement(
  import_ui7.Alert,
  {
    icon: /* @__PURE__ */ React6.createElement(import_icons2.InfoCircleFilledIcon, { fontSize: "small", color: "secondary" }),
    variant: "standard",
    color: "secondary",
    elevation: 0,
    size: "small",
    ...props
  }
);

// src/components/menu-item.tsx
var MenuListItem = ({
  children,
  menuItemTextProps,
  primaryTypographyProps = { variant: "caption" },
  ...props
}) => {
  return /* @__PURE__ */ React7.createElement(
    import_ui8.MenuItem,
    {
      dense: true,
      ...props,
      sx: {
        ...props.sx ?? {}
      }
    },
    /* @__PURE__ */ React7.createElement(
      import_ui8.MenuItemText,
      {
        primary: children,
        primaryTypographyProps,
        ...menuItemTextProps
      }
    )
  );
};
var MenuItemInfotip = (0, import_react6.forwardRef)(
  ({ showInfoTip = false, children, content }, ref) => {
    if (!showInfoTip) {
      return /* @__PURE__ */ React7.createElement(React7.Fragment, null, children);
    }
    return /* @__PURE__ */ React7.createElement(
      import_ui8.Infotip,
      {
        ref,
        placement: "right",
        arrow: false,
        content: /* @__PURE__ */ React7.createElement(InfoAlert, { sx: { maxWidth: 325 } }, content)
      },
      /* @__PURE__ */ React7.createElement("div", { style: { pointerEvents: "initial", width: "100%" }, onClick: (e) => e.stopPropagation() }, children)
    );
  }
);

// src/components/infotip-card.tsx
var React8 = __toESM(require("react"));
var import_ui9 = require("@elementor/ui");
var InfoTipCard = ({ content, svgIcon, learnMoreButton, ctaButton }) => {
  return /* @__PURE__ */ React8.createElement(import_ui9.Card, { elevation: 0, sx: { width: 320 } }, /* @__PURE__ */ React8.createElement(import_ui9.CardContent, { sx: { pb: 0 } }, /* @__PURE__ */ React8.createElement(import_ui9.Box, { display: "flex", alignItems: "start" }, /* @__PURE__ */ React8.createElement(import_ui9.SvgIcon, { fontSize: "tiny", sx: { mr: 0.5 } }, svgIcon), /* @__PURE__ */ React8.createElement(import_ui9.Typography, { variant: "body2" }, content, learnMoreButton && /* @__PURE__ */ React8.createElement(React8.Fragment, null, "\xA0", /* @__PURE__ */ React8.createElement(import_ui9.Link, { color: "info.main", href: learnMoreButton.href, target: "_blank" }, learnMoreButton.label))))), ctaButton && /* @__PURE__ */ React8.createElement(import_ui9.CardActions, { sx: { justifyContent: "flex-start" } }, /* @__PURE__ */ React8.createElement(
    import_ui9.Button,
    {
      size: "small",
      color: "secondary",
      variant: "contained",
      onClick: ctaButton.onClick,
      sx: { marginInlineStart: "1rem" }
    },
    ctaButton.label
  )));
};

// src/components/warning-infotip.tsx
var import_react7 = require("react");
var React9 = __toESM(require("react"));
var import_ui10 = require("@elementor/ui");
var WarningInfotip = (0, import_react7.forwardRef)(
  ({ children, open, title, text, placement, width, offset, hasError = true }, ref) => {
    return /* @__PURE__ */ React9.createElement(
      import_ui10.Infotip,
      {
        ref,
        open,
        placement,
        PopperProps: {
          sx: {
            width: width ? width : "initial",
            ".MuiTooltip-tooltip": { marginLeft: 0, marginRight: 0 }
          },
          modifiers: offset ? [{ name: "offset", options: { offset } }] : []
        },
        arrow: false,
        content: /* @__PURE__ */ React9.createElement(
          import_ui10.Alert,
          {
            color: hasError ? "error" : "secondary",
            severity: "warning",
            variant: "standard",
            size: "small"
          },
          title ? /* @__PURE__ */ React9.createElement(import_ui10.AlertTitle, null, title) : null,
          text
        )
      },
      children
    );
  }
);

// src/components/global-dialog/components/global-dialog.tsx
var import_react8 = require("react");
var React10 = __toESM(require("react"));
var import_ui11 = require("@elementor/ui");

// src/components/global-dialog/subscribers.ts
var currentDialogState = null;
var stateSubscribers = /* @__PURE__ */ new Set();
var subscribeToDialogState = (callback) => {
  stateSubscribers.add(callback);
  callback(currentDialogState);
  return () => stateSubscribers.delete(callback);
};
var notifySubscribers = () => {
  stateSubscribers.forEach((callback) => callback(currentDialogState));
};
var openDialog = ({ component }) => {
  currentDialogState = { component };
  notifySubscribers();
};
var closeDialog = () => {
  currentDialogState = null;
  notifySubscribers();
};

// src/components/global-dialog/components/global-dialog.tsx
var GlobalDialog = () => {
  const [content, setContent] = (0, import_react8.useState)(null);
  (0, import_react8.useEffect)(() => {
    const unsubscribe = subscribeToDialogState(setContent);
    return () => {
      unsubscribe();
    };
  }, []);
  if (!content) {
    return null;
  }
  return /* @__PURE__ */ React10.createElement(ThemeProvider, null, /* @__PURE__ */ React10.createElement(import_ui11.Dialog, { role: "dialog", open: true, onClose: closeDialog, maxWidth: "sm", fullWidth: true }, content.component));
};

// src/components/search-field.tsx
var React11 = __toESM(require("react"));
var import_react9 = require("react");
var import_icons3 = require("@elementor/icons");
var import_ui12 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");
var SIZE = "tiny";
var SearchField = ({ value, onSearch, placeholder, id, sx }) => {
  const inputRef = (0, import_react9.useRef)(null);
  const handleClear = () => {
    onSearch("");
    inputRef.current?.focus();
  };
  const handleInputChange = (event) => {
    onSearch(event.target.value);
  };
  return /* @__PURE__ */ React11.createElement(import_ui12.Box, { sx: { px: 2, pb: 1.5, ...sx } }, /* @__PURE__ */ React11.createElement(
    import_ui12.TextField,
    {
      autoFocus: true,
      fullWidth: true,
      id,
      size: SIZE,
      value,
      inputRef,
      onChange: handleInputChange,
      placeholder,
      InputProps: {
        startAdornment: /* @__PURE__ */ React11.createElement(import_ui12.InputAdornment, { position: "start" }, /* @__PURE__ */ React11.createElement(import_icons3.SearchIcon, { fontSize: SIZE })),
        endAdornment: value && /* @__PURE__ */ React11.createElement(import_ui12.IconButton, { size: SIZE, onClick: handleClear, "aria-label": (0, import_i18n3.__)("Clear", "elementor") }, /* @__PURE__ */ React11.createElement(import_icons3.XIcon, { color: "action", fontSize: SIZE }))
      }
    }
  ));
};

// src/components/form.tsx
var React12 = __toESM(require("react"));
var import_react10 = require("react");
var Form = ({ children, onSubmit, "data-testid": dataTestId }) => {
  const formRef = (0, import_react10.useRef)(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };
  const handleKeyDown = (e) => {
    const { target } = e;
    if (e.key === "Enter" && target instanceof HTMLInputElement && target.type !== "submit") {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    /* @__PURE__ */ React12.createElement(
      "form",
      {
        onSubmit: handleSubmit,
        ref: formRef,
        onKeyDown: handleKeyDown,
        ...dataTestId ? { "data-testid": dataTestId } : {}
      },
      children
    )
  );
};

// src/components/cta-button.tsx
var React13 = __toESM(require("react"));
var import_icons4 = require("@elementor/icons");
var import_ui13 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");
var CtaButton = ({ href, children, showIcon = true, ...props }) => /* @__PURE__ */ React13.createElement(
  import_ui13.Button,
  {
    variant: "contained",
    color: "promotion",
    href,
    target: "_blank",
    startIcon: showIcon ? /* @__PURE__ */ React13.createElement(import_icons4.CrownFilledIcon, null) : void 0,
    ...props
  },
  children ?? (0, import_i18n4.__)("Upgrade Now", "elementor")
);

// src/components/promotions/promotion-infotip.tsx
var React14 = __toESM(require("react"));
var import_ui14 = require("@elementor/ui");

// src/hooks/use-scroll-to-selected.ts
var import_react11 = require("react");
var useScrollToSelected = ({
  selectedValue,
  items,
  virtualizer
}) => {
  (0, import_react11.useEffect)(() => {
    if (!selectedValue || items.length === 0) {
      return;
    }
    const selectedIndex = items.findIndex((item) => item.value === selectedValue);
    if (selectedIndex !== -1) {
      virtualizer.scrollToIndex(selectedIndex, { align: "center" });
    }
  }, [selectedValue, items, virtualizer]);
};

// src/hooks/use-scroll-top.ts
var import_react12 = require("react");
var useScrollTop = ({ containerRef }) => {
  const [scrollTop, setScrollTop] = (0, import_react12.useState)(0);
  (0, import_react12.useEffect)(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef]);
  return scrollTop;
};

// src/hooks/use-text-field-auto-select.ts
var import_react13 = require("react");
var useTextFieldAutoSelect = () => {
  const inputRef = (0, import_react13.useRef)(null);
  (0, import_react13.useEffect)(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);
  return inputRef;
};

// src/hooks/use-canvas-click-handler.tsx
var import_react14 = require("react");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
var useCanvasClickHandler = (isActive, onClickAway) => {
  (0, import_react14.useEffect)(() => {
    const canvasDocument = isActive ? (0, import_editor_v1_adapters2.getCanvasIframeDocument)() : null;
    if (!canvasDocument) {
      return;
    }
    canvasDocument.addEventListener("mousedown", onClickAway);
    return () => canvasDocument.removeEventListener("mousedown", onClickAway);
  }, [isActive, onClickAway]);
};

// src/components/promotions/promotion-infotip.tsx
var PromotionInfotip = ({ children, open, onClose, ...cardProps }) => {
  useCanvasClickHandler(!!open, onClose);
  return /* @__PURE__ */ React14.createElement(import_ui14.Infotip, { placement: "right", content: /* @__PURE__ */ React14.createElement(InfotipCard, { onClose, ...cardProps }), open }, children);
};
function InfotipCard({ title, content, assetUrl, ctaUrl, onClose }) {
  return /* @__PURE__ */ React14.createElement(
    import_ui14.ClickAwayListener,
    {
      disableReactTree: true,
      mouseEvent: "onMouseDown",
      touchEvent: "onTouchStart",
      onClickAway: onClose
    },
    /* @__PURE__ */ React14.createElement(import_ui14.Card, { elevation: 0, sx: { maxWidth: 296 } }, /* @__PURE__ */ React14.createElement(
      import_ui14.CardHeader,
      {
        title,
        action: /* @__PURE__ */ React14.createElement(import_ui14.CloseButton, { slotProps: { icon: { fontSize: "tiny" } }, onClick: onClose })
      }
    ), /* @__PURE__ */ React14.createElement(import_ui14.CardMedia, { component: "img", image: assetUrl, alt: "", sx: { width: "100%", aspectRatio: "16 / 9" } }), /* @__PURE__ */ React14.createElement(import_ui14.CardContent, null, /* @__PURE__ */ React14.createElement(import_ui14.Typography, { variant: "body2", color: "text.secondary" }, content)), /* @__PURE__ */ React14.createElement(import_ui14.CardActions, { sx: { justifyContent: "flex-start" } }, /* @__PURE__ */ React14.createElement(CtaButton, { href: ctaUrl })))
  );
}

// src/components/promotions/promotion-popover.tsx
var React15 = __toESM(require("react"));
var import_icons5 = require("@elementor/icons");
var import_ui15 = require("@elementor/ui");
var PromotionPopover = ({
  children,
  open,
  placement = "right",
  slotProps,
  anchorRef,
  ...cardProps
}) => {
  const anchorEl = anchorRef?.current;
  const defaultSlotProps = {
    popper: {
      ...anchorEl && { anchorEl },
      modifiers: [
        {
          name: "offset",
          options: {
            offset: anchorRef ? [0, 4] : [0, 10]
          }
        }
      ]
    }
  };
  return /* @__PURE__ */ React15.createElement(
    import_ui15.Infotip,
    {
      placement,
      arrow: false,
      content: /* @__PURE__ */ React15.createElement(PopoverAlert, { ...cardProps }),
      open,
      slotProps: slotProps || defaultSlotProps
    },
    children
  );
};
function PopoverAlert({ title, content, ctaUrl, ctaText, onClose }) {
  return /* @__PURE__ */ React15.createElement(
    import_ui15.ClickAwayListener,
    {
      disableReactTree: true,
      mouseEvent: "onMouseDown",
      touchEvent: "onTouchStart",
      onClickAway: onClose
    },
    /* @__PURE__ */ React15.createElement(
      import_ui15.Alert,
      {
        variant: "standard",
        color: "promotion",
        icon: /* @__PURE__ */ React15.createElement(import_icons5.CrownFilledIcon, { fontSize: "tiny" }),
        onClose,
        onMouseDown: (e) => e.stopPropagation(),
        role: "dialog",
        "aria-label": "promotion-popover-title",
        action: /* @__PURE__ */ React15.createElement(
          import_ui15.AlertAction,
          {
            variant: "contained",
            color: "promotion",
            href: ctaUrl,
            target: "_blank",
            rel: "noopener noreferrer"
          },
          ctaText
        ),
        sx: { maxWidth: 296 }
      },
      /* @__PURE__ */ React15.createElement(import_ui15.Box, { sx: { gap: 0.5, display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React15.createElement(import_ui15.AlertTitle, null, title), /* @__PURE__ */ React15.createElement(import_ui15.Typography, { variant: "body2" }, content))
    )
  );
}

// src/components/promotions/promotion-chip.tsx
var React16 = __toESM(require("react"));
var import_icons6 = require("@elementor/icons");
var import_ui16 = require("@elementor/ui");
var PromotionChip = React16.forwardRef(({ ...props }, ref) => {
  return /* @__PURE__ */ React16.createElement(
    import_ui16.Chip,
    {
      "aria-label": "Promotion chip",
      ref,
      size: "tiny",
      color: "promotion",
      variant: "standard",
      icon: /* @__PURE__ */ React16.createElement(import_icons6.CrownFilledIcon, null),
      sx: {
        ml: 1,
        width: "20px",
        "& .MuiChip-label": {
          display: "none"
        }
      },
      ...props
    }
  );
});

// src/components/promotions/promotion-alert.tsx
var React17 = __toESM(require("react"));
var import_icons7 = require("@elementor/icons");
var import_ui17 = require("@elementor/ui");
var import_i18n5 = require("@wordpress/i18n");
var PromotionAlert = ({ message, upgradeUrl }) => /* @__PURE__ */ React17.createElement(
  import_ui17.Alert,
  {
    variant: "standard",
    color: "promotion",
    icon: false,
    role: "dialog",
    "aria-label": "promotion-alert",
    size: "small",
    sx: { m: 2, mt: 1, pt: 0.5, pb: 0.5 }
  },
  message,
  /* @__PURE__ */ React17.createElement(
    import_ui17.Button,
    {
      size: "tiny",
      variant: "text",
      color: "promotion",
      target: "_blank",
      href: upgradeUrl,
      rel: "noopener noreferrer",
      startIcon: /* @__PURE__ */ React17.createElement(import_icons7.CrownFilledIcon, { fontSize: "tiny" })
    },
    (0, import_i18n5.__)("Upgrade now", "elementor")
  )
);

// src/components/floating-bar.tsx
var React18 = __toESM(require("react"));
var import_react15 = require("react");
var import_ui18 = require("@elementor/ui");
var FloatingBarContainer = (0, import_ui18.styled)("span")`
	display: contents;

	.MuiFloatingActionBar-popper:has( .MuiFloatingActionBar-actions:empty ) {
		display: none;
	}

	.MuiFloatingActionBar-popper {
		z-index: 1000;
	}
`;
var FloatingActionsContext = (0, import_react15.createContext)(null);
function FloatingActionsBar({ actions, children }) {
  const [open, setOpen] = (0, import_react15.useState)(false);
  return /* @__PURE__ */ React18.createElement(FloatingActionsContext.Provider, { value: { open, setOpen } }, /* @__PURE__ */ React18.createElement(FloatingBarContainer, null, /* @__PURE__ */ React18.createElement(import_ui18.UnstableFloatingActionBar, { actions, open: open || void 0 }, children)));
}
function useFloatingActionsBar() {
  const context = (0, import_react15.useContext)(FloatingActionsContext);
  if (!context) {
    throw new Error("useFloatingActions must be used within a FloatingActionsBar");
  }
  return context;
}

// src/components/popover/body.tsx
var React19 = __toESM(require("react"));
var import_ui19 = require("@elementor/ui");
var SECTION_PADDING_INLINE = 32;
var DEFAULT_POPOVER_HEIGHT = 348;
var FALLBACK_POPOVER_WIDTH = 220;
var PopoverBody = ({ children, height = DEFAULT_POPOVER_HEIGHT, width, id }) => {
  return /* @__PURE__ */ React19.createElement(
    import_ui19.Box,
    {
      display: "flex",
      flexDirection: "column",
      sx: {
        height,
        overflow: "hidden",
        width: `${width ? width - SECTION_PADDING_INLINE : FALLBACK_POPOVER_WIDTH}px`,
        maxWidth: 496
      },
      id
    },
    children
  );
};

// src/components/popover/section-popover-body.tsx
var React20 = __toESM(require("react"));

// src/contexts/section-context.tsx
var import_react16 = require("react");
var FALLBACK_SECTION_WIDTH = 320;
var SectionRefContext = (0, import_react16.createContext)(null);
var useSectionRef = () => (0, import_react16.useContext)(SectionRefContext);
var useSectionWidth = () => {
  const sectionRef = useSectionRef();
  return sectionRef?.current?.offsetWidth ?? FALLBACK_SECTION_WIDTH;
};

// src/components/popover/section-popover-body.tsx
var SectionPopoverBody = (props) => {
  const sectionWidth = useSectionWidth();
  return /* @__PURE__ */ React20.createElement(PopoverBody, { ...props, width: sectionWidth });
};

// src/components/popover/header.tsx
var React21 = __toESM(require("react"));
var import_ui20 = require("@elementor/ui");
var SIZE2 = "tiny";
var PopoverHeader = ({ title, onClose, icon, actions }) => {
  const paddingAndSizing = {
    pl: 2,
    pr: 1,
    py: 1.5,
    maxHeight: 36
  };
  return /* @__PURE__ */ React21.createElement(import_ui20.Stack, { direction: "row", alignItems: "center", ...paddingAndSizing, sx: { columnGap: 0.5 } }, icon, /* @__PURE__ */ React21.createElement(import_ui20.Typography, { variant: "subtitle2", sx: { fontSize: "12px", mt: 0.25 } }, title), /* @__PURE__ */ React21.createElement(import_ui20.Stack, { direction: "row", sx: { ml: "auto" } }, actions, /* @__PURE__ */ React21.createElement(import_ui20.CloseButton, { slotProps: { icon: { fontSize: SIZE2 } }, sx: { ml: "auto" }, onClick: onClose })));
};

// src/components/popover/menu-list.tsx
var React22 = __toESM(require("react"));
var import_react17 = require("react");
var import_ui21 = require("@elementor/ui");
var import_react_virtual = require("@tanstack/react-virtual");
var ITEM_HEIGHT = 32;
var LIST_ITEMS_BUFFER = 6;
var MENU_LIST_PADDING_TOP = 8;
var menuSubHeaderAbsoluteStyling = (start) => ({
  position: "absolute",
  transform: `translateY(${start + MENU_LIST_PADDING_TOP}px)`
});
var getAdjacentStickyIndices = (stickyIndices, range) => {
  const previousTwoStickyIndices = stickyIndices.filter((stickyIndex) => stickyIndex < range.startIndex).slice(-2);
  const nextTwoStickyIndices = stickyIndices.filter((stickyIndex) => stickyIndex > range.endIndex).slice(0, 2);
  return [...previousTwoStickyIndices, ...nextTwoStickyIndices];
};
var PopoverMenuList = ({
  items,
  onSelect,
  onClose,
  selectedValue,
  itemStyle,
  onChange,
  "data-testid": dataTestId,
  menuItemContentTemplate,
  categoryItemContentTemplate,
  noResultsComponent,
  menuListTemplate: CustomMenuList
}) => {
  const containerRef = (0, import_react17.useRef)(null);
  const scrollTop = useScrollTop({ containerRef });
  const theme = (0, import_ui21.useTheme)();
  const MenuListComponent = CustomMenuList || StyledMenuList;
  const stickyIndices = (0, import_react17.useMemo)(
    () => items.reduce((categoryIndices, item, index) => {
      if (item.type === "category") {
        categoryIndices.push(index);
      }
      return categoryIndices;
    }, []),
    [items]
  );
  const getActiveItemIndices = (range) => {
    const visibleAndStickyIndexes = [];
    for (let i = range.startIndex; i <= range.endIndex; i++) {
      visibleAndStickyIndexes.push(i);
    }
    const stickyIndicesToShow = getAdjacentStickyIndices(stickyIndices, range);
    stickyIndicesToShow.forEach((stickyIndex) => {
      if (!visibleAndStickyIndexes.includes(stickyIndex)) {
        visibleAndStickyIndexes.push(stickyIndex);
      }
    });
    return visibleAndStickyIndexes.sort((a, b) => a - b);
  };
  const onChangeCallback = ({ getVirtualIndexes }) => {
    const visibleItems = getVirtualIndexes().map((index) => items[index]);
    onChange?.(visibleItems);
  };
  const virtualizer = (0, import_react_virtual.useVirtualizer)({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: LIST_ITEMS_BUFFER,
    rangeExtractor: getActiveItemIndices,
    onChange: onChangeCallback
  });
  (0, import_react17.useEffect)(() => {
    onChangeCallback(virtualizer);
  }, [items]);
  useScrollToSelected({ selectedValue, items, virtualizer });
  const virtualItems = virtualizer.getVirtualItems();
  return /* @__PURE__ */ React22.createElement(import_ui21.Box, { ref: containerRef, sx: { height: "100%", overflowY: "auto" } }, items.length === 0 && noResultsComponent ? noResultsComponent : /* @__PURE__ */ React22.createElement(
    MenuListComponent,
    {
      role: "listbox",
      style: { height: `${virtualizer.getTotalSize()}px` },
      "data-testid": dataTestId
    },
    virtualItems.map((virtualRow) => {
      const item = items[virtualRow.index];
      const isLast = virtualRow.index === items.length - 1;
      const isFirst = items[0]?.type === "category" ? virtualRow.index === 1 : virtualRow.index === 0;
      const isSelected = selectedValue === item.value;
      const tabIndexFallback = !selectedValue ? 0 : -1;
      if (!item) {
        return null;
      }
      if (item.type === "category") {
        const shouldStick = virtualRow.start + MENU_LIST_PADDING_TOP <= scrollTop;
        return /* @__PURE__ */ React22.createElement(
          import_ui21.MenuSubheader,
          {
            key: virtualRow.key,
            style: shouldStick ? {} : menuSubHeaderAbsoluteStyling(virtualRow.start),
            sx: { fontWeight: "400", color: "text.tertiary" }
          },
          categoryItemContentTemplate ? categoryItemContentTemplate(item) : item.label || item.value
        );
      }
      const isDisabled = item.disabled;
      return /* @__PURE__ */ React22.createElement(
        import_ui21.ListItem,
        {
          key: virtualRow.key,
          role: "option",
          "aria-selected": isSelected,
          "aria-disabled": isDisabled,
          onClick: isDisabled ? void 0 : (e) => {
            if (e.target.closest("button")) {
              return;
            }
            onSelect(item.value);
            onClose();
          },
          onKeyDown: (event) => {
            if (event.key === "Enter" && !isDisabled) {
              onSelect(item.value);
              onClose();
            }
            if (event.key === "ArrowDown" && isLast) {
              event.preventDefault();
              event.stopPropagation();
            }
            if (event.key === "ArrowUp" && isFirst) {
              event.preventDefault();
              event.stopPropagation();
            }
          },
          tabIndex: isSelected ? 0 : tabIndexFallback,
          sx: {
            transform: `translateY(${virtualRow.start + MENU_LIST_PADDING_TOP}px)`,
            ...theme.typography.caption,
            ...itemStyle ? itemStyle(item) : {}
          }
        },
        menuItemContentTemplate ? menuItemContentTemplate(item) : item.label || item.value
      );
    })
  ));
};
var StyledMenuList = (0, import_ui21.styled)(import_ui21.MenuList)(({ theme }) => ({
  "& > li": {
    height: ITEM_HEIGHT,
    width: "100%",
    display: "flex",
    alignItems: "center"
  },
  '& > [role="option"]': {
    lineHeight: "inherit",
    padding: theme.spacing(0.75, 2, 0.75, 4),
    "&:hover, &:focus": {
      backgroundColor: theme.palette.action.hover
    },
    '&[aria-selected="true"]': {
      backgroundColor: theme.palette.action.selected
    },
    '&[aria-disabled="true"]': {
      color: theme.palette.text.disabled
    },
    cursor: "pointer",
    textOverflow: "ellipsis",
    position: "absolute",
    top: 0,
    left: 0
  },
  width: "100%",
  position: "relative"
}));

// src/components/popover/popover-action.tsx
var React23 = __toESM(require("react"));
var import_ui22 = require("@elementor/ui");
var SIZE3 = "tiny";
function PopoverAction({ title, visible = true, icon: Icon, content: PopoverContent }) {
  const { popupState, triggerProps, popoverProps } = useFloatingActionsPopover();
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React23.createElement(React23.Fragment, null, /* @__PURE__ */ React23.createElement(import_ui22.Tooltip, { placement: "top", title }, /* @__PURE__ */ React23.createElement(import_ui22.IconButton, { "aria-label": title, size: SIZE3, ...triggerProps }, /* @__PURE__ */ React23.createElement(Icon, { fontSize: SIZE3 }))), /* @__PURE__ */ React23.createElement(
    import_ui22.Popover,
    {
      disableScrollLock: true,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right"
      },
      PaperProps: {
        sx: { my: 2.5 }
      },
      ...popoverProps
    },
    /* @__PURE__ */ React23.createElement(PopoverContent, { close: popupState.close })
  ));
}
function useFloatingActionsPopover() {
  const { setOpen } = useFloatingActionsBar();
  const popupState = (0, import_ui22.usePopupState)({ variant: "popover" });
  const triggerProps = (0, import_ui22.bindTrigger)(popupState);
  const popoverProps = (0, import_ui22.bindPopover)(popupState);
  const onClick = (e) => {
    triggerProps.onClick(e);
    setOpen(true);
  };
  const onClose = () => {
    popoverProps.onClose();
    setOpen(false);
  };
  const close = () => {
    popupState.close();
    setOpen(false);
  };
  return {
    popupState: { ...popupState, close },
    triggerProps: { ...triggerProps, onClick },
    popoverProps: { ...popoverProps, onClose }
  };
}

// src/components/save-changes-dialog.tsx
var React24 = __toESM(require("react"));
var import_react18 = require("react");
var import_icons8 = require("@elementor/icons");
var import_ui23 = require("@elementor/ui");
var TITLE_ID = "save-changes-dialog";
var SaveChangesDialog = ({ children, onClose }) => /* @__PURE__ */ React24.createElement(import_ui23.Dialog, { open: true, onClose, "aria-labelledby": TITLE_ID, maxWidth: "xs" }, children);
var SaveChangesDialogTitle = ({ children, onClose }) => /* @__PURE__ */ React24.createElement(
  import_ui23.DialogTitle,
  {
    id: TITLE_ID,
    display: "flex",
    alignItems: "center",
    gap: 1,
    sx: { lineHeight: 1, justifyContent: "space-between" }
  },
  /* @__PURE__ */ React24.createElement(import_ui23.Stack, { direction: "row", alignItems: "center", gap: 1 }, /* @__PURE__ */ React24.createElement(import_icons8.AlertTriangleFilledIcon, { color: "secondary" }), children),
  onClose && /* @__PURE__ */ React24.createElement(import_ui23.IconButton, { onClick: onClose, size: "small" }, /* @__PURE__ */ React24.createElement(import_icons8.XIcon, null))
);
var SaveChangesDialogContent = ({ children }) => /* @__PURE__ */ React24.createElement(import_ui23.DialogContent, null, children);
var SaveChangesDialogContentText = (props) => /* @__PURE__ */ React24.createElement(import_ui23.DialogContentText, { variant: "body2", color: "textPrimary", display: "flex", flexDirection: "column", ...props });
var SaveChangesDialogActions = ({ actions }) => {
  const [isConfirming, setIsConfirming] = (0, import_react18.useState)(false);
  const { cancel, confirm, discard } = actions;
  const onConfirm = async () => {
    setIsConfirming(true);
    await confirm.action();
    setIsConfirming(false);
  };
  return /* @__PURE__ */ React24.createElement(import_ui23.DialogActions, null, cancel && /* @__PURE__ */ React24.createElement(import_ui23.Button, { variant: "text", color: "secondary", onClick: cancel.action }, cancel.label), discard && /* @__PURE__ */ React24.createElement(import_ui23.Button, { variant: "text", color: "secondary", onClick: discard.action }, discard.label), /* @__PURE__ */ React24.createElement(import_ui23.Button, { variant: "contained", color: "secondary", onClick: onConfirm, loading: isConfirming }, confirm.label));
};
SaveChangesDialog.Title = SaveChangesDialogTitle;
SaveChangesDialog.Content = SaveChangesDialogContent;
SaveChangesDialog.ContentText = SaveChangesDialogContentText;
SaveChangesDialog.Actions = SaveChangesDialogActions;
var useDialog = () => {
  const [isOpen, setIsOpen] = (0, import_react18.useState)(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, open, close };
};

// src/components/confirmation-dialog.tsx
var React25 = __toESM(require("react"));
var import_react19 = require("react");
var import_icons9 = require("@elementor/icons");
var import_ui24 = require("@elementor/ui");
var import_i18n6 = require("@wordpress/i18n");
var TITLE_ID2 = "confirmation-dialog";
var ConfirmationDialog = ({ open, onClose, children }) => /* @__PURE__ */ React25.createElement(import_ui24.Dialog, { open, onClose, "aria-labelledby": TITLE_ID2, maxWidth: "sm" }, children);
var ConfirmationDialogTitle = ({
  children,
  icon: Icon = import_icons9.AlertOctagonFilledIcon,
  iconColor = "error"
}) => /* @__PURE__ */ React25.createElement(import_ui24.DialogTitle, { id: TITLE_ID2, display: "flex", alignItems: "center", gap: 1, sx: { lineHeight: 1 } }, /* @__PURE__ */ React25.createElement(Icon, { color: iconColor }), children);
var ConfirmationDialogContent = ({ children }) => /* @__PURE__ */ React25.createElement(import_ui24.DialogContent, { sx: { mt: 2 } }, children);
var ConfirmationDialogContentText = (props) => /* @__PURE__ */ React25.createElement(import_ui24.DialogContentText, { variant: "body2", color: "secondary", ...props });
var ConfirmationDialogActions = ({
  onClose,
  onConfirm,
  cancelLabel,
  confirmLabel,
  color = "error",
  onSuppressMessage,
  suppressLabel = (0, import_i18n6.__)("Don't show this again", "elementor")
}) => {
  const [dontShowAgain, setDontShowAgain] = (0, import_react19.useState)(false);
  const handleConfirm = () => {
    if (dontShowAgain && onSuppressMessage) {
      onSuppressMessage();
    }
    onConfirm();
  };
  return /* @__PURE__ */ React25.createElement(import_ui24.DialogActions, { sx: onSuppressMessage ? { justifyContent: "space-between", alignItems: "center" } : void 0 }, onSuppressMessage && /* @__PURE__ */ React25.createElement(
    import_ui24.FormControlLabel,
    {
      control: /* @__PURE__ */ React25.createElement(
        import_ui24.Checkbox,
        {
          checked: dontShowAgain,
          onChange: (event) => setDontShowAgain(event.target.checked),
          size: "medium",
          color: "secondary"
        }
      ),
      label: /* @__PURE__ */ React25.createElement(import_ui24.Typography, { variant: "body2", color: "text.secondary" }, suppressLabel)
    }
  ), /* @__PURE__ */ React25.createElement("div", null, /* @__PURE__ */ React25.createElement(import_ui24.Button, { color: "secondary", onClick: onClose }, cancelLabel ?? (0, import_i18n6.__)("Not now", "elementor")), /* @__PURE__ */ React25.createElement(import_ui24.Button, { autoFocus: true, variant: "contained", color, onClick: handleConfirm, sx: { ml: 1 } }, confirmLabel ?? (0, import_i18n6.__)("Delete", "elementor"))));
};
ConfirmationDialog.Title = ConfirmationDialogTitle;
ConfirmationDialog.Content = ConfirmationDialogContent;
ConfirmationDialog.ContentText = ConfirmationDialogContentText;
ConfirmationDialog.Actions = ConfirmationDialogActions;

// src/hooks/use-editable.ts
var import_react20 = require("react");
var useEditable = ({ value, onSubmit, validation, onClick, onError }) => {
  const [isEditing, setIsEditing] = (0, import_react20.useState)(false);
  const [error, setError] = (0, import_react20.useState)(null);
  const ref = useSelection(isEditing);
  const isDirty = (newValue) => newValue !== value;
  const openEditMode = () => {
    setIsEditing(true);
  };
  const closeEditMode = () => {
    setError(null);
    onError?.(null);
    setIsEditing(false);
  };
  const submit = (newValue) => {
    if (!isDirty(newValue)) {
      closeEditMode();
      return;
    }
    if (!error) {
      try {
        onSubmit(newValue);
      } finally {
        closeEditMode();
      }
    }
  };
  const onChange = (event) => {
    const { innerText: newValue } = event.target;
    if (validation) {
      const updatedError = isDirty(newValue) ? validation(newValue) : null;
      setError(updatedError);
      onError?.(updatedError);
    }
  };
  const handleKeyDown = (event) => {
    event.stopPropagation();
    if (["Escape"].includes(event.key)) {
      return closeEditMode();
    }
    if (["Enter"].includes(event.key)) {
      event.preventDefault();
      if (!error) {
        ref.current?.blur();
      }
    }
  };
  const handleClick = (event) => {
    if (isEditing) {
      event.stopPropagation();
    }
    onClick?.(event);
  };
  const handleBlur = () => {
    if (error) {
      closeEditMode();
      return;
    }
    submit(ref.current.innerText);
  };
  const listeners = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onInput: onChange,
    onBlur: handleBlur
  };
  const attributes = {
    value,
    role: "textbox",
    contentEditable: isEditing,
    ...isEditing && {
      suppressContentEditableWarning: true
    }
  };
  return {
    ref,
    isEditing,
    openEditMode,
    closeEditMode,
    value,
    error,
    getProps: () => ({ ...listeners, ...attributes })
  };
};
var useSelection = (isEditing) => {
  const ref = (0, import_react20.useRef)(null);
  (0, import_react20.useEffect)(() => {
    if (isEditing) {
      selectAll(ref.current);
    }
  }, [isEditing]);
  return ref;
};
var selectAll = (el) => {
  const selection = getSelection();
  if (!selection || !el) {
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CollapseIcon,
  CollapsibleContent,
  ConfirmationDialog,
  CtaButton,
  EditableField,
  EllipsisWithTooltip,
  FloatingActionsBar,
  Form,
  GlobalDialog,
  ITEM_HEIGHT,
  InfoAlert,
  InfoTipCard,
  IntroductionModal,
  MenuItemInfotip,
  MenuListItem,
  PopoverAction,
  PopoverBody,
  PopoverHeader,
  PopoverMenuList,
  PromotionAlert,
  PromotionChip,
  PromotionInfotip,
  PromotionPopover,
  SaveChangesDialog,
  SearchField,
  SectionPopoverBody,
  SectionRefContext,
  StyledMenuList,
  ThemeProvider,
  WarningInfotip,
  closeDialog,
  getCollapsibleValue,
  openDialog,
  useCanvasClickHandler,
  useDialog,
  useEditable,
  useFloatingActionsBar,
  useSectionWidth,
  useTextFieldAutoSelect
});
//# sourceMappingURL=index.js.map