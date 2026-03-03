// src/components/collapse-icon.tsx
import { ChevronDownIcon } from "@elementor/icons";
import { styled } from "@elementor/ui";
var CollapseIcon = styled(ChevronDownIcon, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "disabled"
})(({ theme, open, disabled = false }) => ({
  transform: open ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.standard
  }),
  opacity: disabled ? 0.4 : 1
}));

// src/components/collapsible-content.tsx
import * as React from "react";
import { useState } from "react";
import { Button, Collapse, Stack, styled as styled2 } from "@elementor/ui";
import { __ } from "@wordpress/i18n";
var IndicatorsWrapper = styled2("div")`
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
  const [open, setOpen] = useState(defaultOpen);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  return /* @__PURE__ */ React.createElement(Stack, null, /* @__PURE__ */ React.createElement(Stack, { sx: { position: "relative" } }, /* @__PURE__ */ React.createElement(
    Button,
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
    open ? __("Show less", "elementor") : __("Show more", "elementor")
  ), titleEnd && /* @__PURE__ */ React.createElement(IndicatorsWrapper, null, getCollapsibleValue(titleEnd, open))), /* @__PURE__ */ React.createElement(Collapse, { in: open, timeout: "auto", unmountOnExit: true }, children));
};
function getCollapsibleValue(value, isOpen) {
  if (typeof value === "function") {
    return value(isOpen);
  }
  return value;
}

// src/components/ellipsis-with-tooltip.tsx
import * as React2 from "react";
import { useEffect, useState as useState2 } from "react";
import { Box, Tooltip } from "@elementor/ui";
var EllipsisWithTooltip = ({
  maxWidth,
  title,
  as,
  ...props
}) => {
  const [setRef, isOverflowing] = useIsOverflowing();
  if (isOverflowing) {
    return /* @__PURE__ */ React2.createElement(Tooltip, { title, placement: "top" }, /* @__PURE__ */ React2.createElement(Content, { maxWidth, ref: setRef, as, ...props }, title));
  }
  return /* @__PURE__ */ React2.createElement(Content, { maxWidth, ref: setRef, as, ...props }, title);
};
var Content = React2.forwardRef(
  ({ maxWidth, as: Component = Box, ...props }, ref) => /* @__PURE__ */ React2.createElement(
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
  const [el, setEl] = useState2(null);
  const [isOverflowing, setIsOverflown] = useState2(false);
  useEffect(() => {
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
import * as React3 from "react";
import { forwardRef as forwardRef2 } from "react";
import { Box as Box2, styled as styled3, Tooltip as Tooltip2 } from "@elementor/ui";
var EditableField = forwardRef2(
  ({ value, error, as = "span", sx, ...props }, ref) => {
    return /* @__PURE__ */ React3.createElement(Tooltip2, { title: error, open: !!error, placement: "top" }, /* @__PURE__ */ React3.createElement(StyledField, { ref, component: as, ...props }, value));
  }
);
var StyledField = styled3(Box2)`
	width: 100%;
	&:focus {
		outline: none;
	}
`;

// src/components/introduction-modal.tsx
import * as React4 from "react";
import { useState as useState3 } from "react";
import {
  Button as Button2,
  Checkbox,
  Dialog,
  DialogActions,
  DialogHeader,
  DialogTitle,
  Fade,
  FormControlLabel,
  Typography
} from "@elementor/ui";
import { __ as __2 } from "@wordpress/i18n";
var IntroductionModal = ({ open, handleClose, title, children }) => {
  const [shouldShowAgain, setShouldShowAgain] = useState3(true);
  return /* @__PURE__ */ React4.createElement(Dialog, { open, onClose: handleClose, maxWidth: "sm", TransitionComponent: Transition }, title && /* @__PURE__ */ React4.createElement(DialogHeader, { logo: false }, /* @__PURE__ */ React4.createElement(DialogTitle, null, title)), children, /* @__PURE__ */ React4.createElement(DialogActions, null, /* @__PURE__ */ React4.createElement(
    FormControlLabel,
    {
      sx: { marginRight: "auto" },
      control: /* @__PURE__ */ React4.createElement(
        Checkbox,
        {
          checked: !shouldShowAgain,
          onChange: () => setShouldShowAgain(!shouldShowAgain)
        }
      ),
      label: /* @__PURE__ */ React4.createElement(Typography, { variant: "body2" }, __2("Don't show this again", "elementor"))
    }
  ), /* @__PURE__ */ React4.createElement(
    Button2,
    {
      size: "medium",
      variant: "contained",
      sx: { minWidth: "135px" },
      "aria-label": __2("Got it introduction", "elementor"),
      onClick: () => handleClose(shouldShowAgain)
    },
    __2("Got it", "elementor")
  )));
};
var Transition = React4.forwardRef((props, ref) => /* @__PURE__ */ React4.createElement(
  Fade,
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
import * as React5 from "react";
import { ThemeProvider as ThemeProviderBase } from "@elementor/ui";

// src/hooks/use-color-scheme.ts
import { useEffect as useEffect2, useState as useState4 } from "react";
import {
  __privateListenTo as listenTo,
  commandEndEvent,
  v1ReadyEvent
} from "@elementor/editor-v1-adapters";
function useColorScheme() {
  const [colorScheme, setColorScheme] = useState4(() => getV1ColorScheme());
  useEffect2(() => {
    return listenTo(v1ReadyEvent(), () => setColorScheme(getV1ColorScheme()));
  }, []);
  useEffect2(() => {
    return listenTo(commandEndEvent("document/elements/settings"), (e) => {
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
  return /* @__PURE__ */ React5.createElement(ThemeProviderBase, { colorScheme, palette: EDITOR_PALLETTE }, children);
}

// src/components/menu-item.tsx
import * as React7 from "react";
import { forwardRef as forwardRef4 } from "react";
import {
  Infotip,
  MenuItem,
  MenuItemText
} from "@elementor/ui";

// src/components/info-alert.tsx
import * as React6 from "react";
import { InfoCircleFilledIcon } from "@elementor/icons";
import { Alert } from "@elementor/ui";
var InfoAlert = (props) => /* @__PURE__ */ React6.createElement(
  Alert,
  {
    icon: /* @__PURE__ */ React6.createElement(InfoCircleFilledIcon, { fontSize: "small", color: "secondary" }),
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
    MenuItem,
    {
      dense: true,
      ...props,
      sx: {
        ...props.sx ?? {}
      }
    },
    /* @__PURE__ */ React7.createElement(
      MenuItemText,
      {
        primary: children,
        primaryTypographyProps,
        ...menuItemTextProps
      }
    )
  );
};
var MenuItemInfotip = forwardRef4(
  ({ showInfoTip = false, children, content }, ref) => {
    if (!showInfoTip) {
      return /* @__PURE__ */ React7.createElement(React7.Fragment, null, children);
    }
    return /* @__PURE__ */ React7.createElement(
      Infotip,
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
import * as React8 from "react";
import { Box as Box3, Button as Button3, Card, CardActions, CardContent, Link, SvgIcon, Typography as Typography2 } from "@elementor/ui";
var InfoTipCard = ({ content, svgIcon, learnMoreButton, ctaButton }) => {
  return /* @__PURE__ */ React8.createElement(Card, { elevation: 0, sx: { width: 320 } }, /* @__PURE__ */ React8.createElement(CardContent, { sx: { pb: 0 } }, /* @__PURE__ */ React8.createElement(Box3, { display: "flex", alignItems: "start" }, /* @__PURE__ */ React8.createElement(SvgIcon, { fontSize: "tiny", sx: { mr: 0.5 } }, svgIcon), /* @__PURE__ */ React8.createElement(Typography2, { variant: "body2" }, content, learnMoreButton && /* @__PURE__ */ React8.createElement(React8.Fragment, null, "\xA0", /* @__PURE__ */ React8.createElement(Link, { color: "info.main", href: learnMoreButton.href, target: "_blank" }, learnMoreButton.label))))), ctaButton && /* @__PURE__ */ React8.createElement(CardActions, { sx: { justifyContent: "flex-start" } }, /* @__PURE__ */ React8.createElement(
    Button3,
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
import { forwardRef as forwardRef5 } from "react";
import * as React9 from "react";
import { Alert as Alert2, AlertTitle, Infotip as Infotip2 } from "@elementor/ui";
var WarningInfotip = forwardRef5(
  ({ children, open, title, text, placement, width, offset, hasError = true }, ref) => {
    return /* @__PURE__ */ React9.createElement(
      Infotip2,
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
          Alert2,
          {
            color: hasError ? "error" : "secondary",
            severity: "warning",
            variant: "standard",
            size: "small"
          },
          title ? /* @__PURE__ */ React9.createElement(AlertTitle, null, title) : null,
          text
        )
      },
      children
    );
  }
);

// src/components/global-dialog/components/global-dialog.tsx
import { useEffect as useEffect3, useState as useState5 } from "react";
import * as React10 from "react";
import { Dialog as Dialog2 } from "@elementor/ui";

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
  const [content, setContent] = useState5(null);
  useEffect3(() => {
    const unsubscribe = subscribeToDialogState(setContent);
    return () => {
      unsubscribe();
    };
  }, []);
  if (!content) {
    return null;
  }
  return /* @__PURE__ */ React10.createElement(ThemeProvider, null, /* @__PURE__ */ React10.createElement(Dialog2, { role: "dialog", open: true, onClose: closeDialog, maxWidth: "sm", fullWidth: true }, content.component));
};

// src/components/search-field.tsx
import * as React11 from "react";
import { useRef } from "react";
import { SearchIcon, XIcon } from "@elementor/icons";
import { Box as Box4, IconButton, InputAdornment, TextField } from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";
var SIZE = "tiny";
var SearchField = ({ value, onSearch, placeholder, id, sx }) => {
  const inputRef = useRef(null);
  const handleClear = () => {
    onSearch("");
    inputRef.current?.focus();
  };
  const handleInputChange = (event) => {
    onSearch(event.target.value);
  };
  return /* @__PURE__ */ React11.createElement(Box4, { sx: { px: 2, pb: 1.5, ...sx } }, /* @__PURE__ */ React11.createElement(
    TextField,
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
        startAdornment: /* @__PURE__ */ React11.createElement(InputAdornment, { position: "start" }, /* @__PURE__ */ React11.createElement(SearchIcon, { fontSize: SIZE })),
        endAdornment: value && /* @__PURE__ */ React11.createElement(IconButton, { size: SIZE, onClick: handleClear, "aria-label": __3("Clear", "elementor") }, /* @__PURE__ */ React11.createElement(XIcon, { color: "action", fontSize: SIZE }))
      }
    }
  ));
};

// src/components/form.tsx
import * as React12 from "react";
import { useRef as useRef2 } from "react";
var Form = ({ children, onSubmit, "data-testid": dataTestId }) => {
  const formRef = useRef2(null);
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
import * as React13 from "react";
import { CrownFilledIcon } from "@elementor/icons";
import { Button as Button4 } from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";
var CtaButton = ({ href, children, showIcon = true, ...props }) => /* @__PURE__ */ React13.createElement(
  Button4,
  {
    variant: "contained",
    color: "promotion",
    href,
    target: "_blank",
    startIcon: showIcon ? /* @__PURE__ */ React13.createElement(CrownFilledIcon, null) : void 0,
    ...props
  },
  children ?? __4("Upgrade Now", "elementor")
);

// src/components/promotions/promotion-infotip.tsx
import * as React14 from "react";
import {
  Card as Card2,
  CardActions as CardActions2,
  CardContent as CardContent2,
  CardHeader,
  CardMedia,
  ClickAwayListener,
  CloseButton,
  Infotip as Infotip3,
  Typography as Typography3
} from "@elementor/ui";

// src/hooks/use-scroll-to-selected.ts
import { useEffect as useEffect4 } from "react";
var useScrollToSelected = ({
  selectedValue,
  items,
  virtualizer
}) => {
  useEffect4(() => {
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
import { useEffect as useEffect5, useState as useState6 } from "react";
var useScrollTop = ({ containerRef }) => {
  const [scrollTop, setScrollTop] = useState6(0);
  useEffect5(() => {
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
import { useEffect as useEffect6, useRef as useRef3 } from "react";
var useTextFieldAutoSelect = () => {
  const inputRef = useRef3(null);
  useEffect6(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);
  return inputRef;
};

// src/hooks/use-canvas-click-handler.tsx
import { useEffect as useEffect7 } from "react";
import { getCanvasIframeDocument } from "@elementor/editor-v1-adapters";
var useCanvasClickHandler = (isActive, onClickAway) => {
  useEffect7(() => {
    const canvasDocument = isActive ? getCanvasIframeDocument() : null;
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
  return /* @__PURE__ */ React14.createElement(Infotip3, { placement: "right", content: /* @__PURE__ */ React14.createElement(InfotipCard, { onClose, ...cardProps }), open }, children);
};
function InfotipCard({ title, content, assetUrl, ctaUrl, onClose }) {
  return /* @__PURE__ */ React14.createElement(
    ClickAwayListener,
    {
      disableReactTree: true,
      mouseEvent: "onMouseDown",
      touchEvent: "onTouchStart",
      onClickAway: onClose
    },
    /* @__PURE__ */ React14.createElement(Card2, { elevation: 0, sx: { maxWidth: 296 } }, /* @__PURE__ */ React14.createElement(
      CardHeader,
      {
        title,
        action: /* @__PURE__ */ React14.createElement(CloseButton, { slotProps: { icon: { fontSize: "tiny" } }, onClick: onClose })
      }
    ), /* @__PURE__ */ React14.createElement(CardMedia, { component: "img", image: assetUrl, alt: "", sx: { width: "100%", aspectRatio: "16 / 9" } }), /* @__PURE__ */ React14.createElement(CardContent2, null, /* @__PURE__ */ React14.createElement(Typography3, { variant: "body2", color: "text.secondary" }, content)), /* @__PURE__ */ React14.createElement(CardActions2, { sx: { justifyContent: "flex-start" } }, /* @__PURE__ */ React14.createElement(CtaButton, { href: ctaUrl })))
  );
}

// src/components/promotions/promotion-popover.tsx
import * as React15 from "react";
import { CrownFilledIcon as CrownFilledIcon2 } from "@elementor/icons";
import {
  Alert as Alert3,
  AlertAction,
  AlertTitle as AlertTitle2,
  Box as Box5,
  ClickAwayListener as ClickAwayListener2,
  Infotip as Infotip4,
  Typography as Typography4
} from "@elementor/ui";
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
    Infotip4,
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
    ClickAwayListener2,
    {
      disableReactTree: true,
      mouseEvent: "onMouseDown",
      touchEvent: "onTouchStart",
      onClickAway: onClose
    },
    /* @__PURE__ */ React15.createElement(
      Alert3,
      {
        variant: "standard",
        color: "promotion",
        icon: /* @__PURE__ */ React15.createElement(CrownFilledIcon2, { fontSize: "tiny" }),
        onClose,
        onMouseDown: (e) => e.stopPropagation(),
        role: "dialog",
        "aria-label": "promotion-popover-title",
        action: /* @__PURE__ */ React15.createElement(
          AlertAction,
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
      /* @__PURE__ */ React15.createElement(Box5, { sx: { gap: 0.5, display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React15.createElement(AlertTitle2, null, title), /* @__PURE__ */ React15.createElement(Typography4, { variant: "body2" }, content))
    )
  );
}

// src/components/promotions/promotion-chip.tsx
import * as React16 from "react";
import { CrownFilledIcon as CrownFilledIcon3 } from "@elementor/icons";
import { Chip } from "@elementor/ui";
var PromotionChip = React16.forwardRef(({ ...props }, ref) => {
  return /* @__PURE__ */ React16.createElement(
    Chip,
    {
      "aria-label": "Promotion chip",
      ref,
      size: "tiny",
      color: "promotion",
      variant: "standard",
      icon: /* @__PURE__ */ React16.createElement(CrownFilledIcon3, null),
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
import * as React17 from "react";
import { CrownFilledIcon as CrownFilledIcon4 } from "@elementor/icons";
import { Alert as Alert4, Button as Button5 } from "@elementor/ui";
import { __ as __5 } from "@wordpress/i18n";
var PromotionAlert = ({ message, upgradeUrl }) => /* @__PURE__ */ React17.createElement(
  Alert4,
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
    Button5,
    {
      size: "tiny",
      variant: "text",
      color: "promotion",
      target: "_blank",
      href: upgradeUrl,
      rel: "noopener noreferrer",
      startIcon: /* @__PURE__ */ React17.createElement(CrownFilledIcon4, { fontSize: "tiny" })
    },
    __5("Upgrade now", "elementor")
  )
);

// src/components/floating-bar.tsx
import * as React18 from "react";
import { createContext, useContext, useState as useState7 } from "react";
import { styled as styled4, UnstableFloatingActionBar } from "@elementor/ui";
var FloatingBarContainer = styled4("span")`
	display: contents;

	.MuiFloatingActionBar-popper:has( .MuiFloatingActionBar-actions:empty ) {
		display: none;
	}

	.MuiFloatingActionBar-popper {
		z-index: 1000;
	}
`;
var FloatingActionsContext = createContext(null);
function FloatingActionsBar({ actions, children }) {
  const [open, setOpen] = useState7(false);
  return /* @__PURE__ */ React18.createElement(FloatingActionsContext.Provider, { value: { open, setOpen } }, /* @__PURE__ */ React18.createElement(FloatingBarContainer, null, /* @__PURE__ */ React18.createElement(UnstableFloatingActionBar, { actions, open: open || void 0 }, children)));
}
function useFloatingActionsBar() {
  const context = useContext(FloatingActionsContext);
  if (!context) {
    throw new Error("useFloatingActions must be used within a FloatingActionsBar");
  }
  return context;
}

// src/components/popover/body.tsx
import * as React19 from "react";
import { Box as Box6 } from "@elementor/ui";
var SECTION_PADDING_INLINE = 32;
var DEFAULT_POPOVER_HEIGHT = 348;
var FALLBACK_POPOVER_WIDTH = 220;
var PopoverBody = ({ children, height = DEFAULT_POPOVER_HEIGHT, width, id }) => {
  return /* @__PURE__ */ React19.createElement(
    Box6,
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
import * as React20 from "react";

// src/contexts/section-context.tsx
import { createContext as createContext2, useContext as useContext2 } from "react";
var FALLBACK_SECTION_WIDTH = 320;
var SectionRefContext = createContext2(null);
var useSectionRef = () => useContext2(SectionRefContext);
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
import * as React21 from "react";
import { CloseButton as CloseButton2, Stack as Stack2, Typography as Typography5 } from "@elementor/ui";
var SIZE2 = "tiny";
var PopoverHeader = ({ title, onClose, icon, actions }) => {
  const paddingAndSizing = {
    pl: 2,
    pr: 1,
    py: 1.5,
    maxHeight: 36
  };
  return /* @__PURE__ */ React21.createElement(Stack2, { direction: "row", alignItems: "center", ...paddingAndSizing, sx: { columnGap: 0.5 } }, icon, /* @__PURE__ */ React21.createElement(Typography5, { variant: "subtitle2", sx: { fontSize: "12px", mt: 0.25 } }, title), /* @__PURE__ */ React21.createElement(Stack2, { direction: "row", sx: { ml: "auto" } }, actions, /* @__PURE__ */ React21.createElement(CloseButton2, { slotProps: { icon: { fontSize: SIZE2 } }, sx: { ml: "auto" }, onClick: onClose })));
};

// src/components/popover/menu-list.tsx
import * as React22 from "react";
import { useEffect as useEffect8, useMemo, useRef as useRef4 } from "react";
import { Box as Box7, ListItem, MenuList, MenuSubheader, styled as styled5, useTheme } from "@elementor/ui";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  const containerRef = useRef4(null);
  const scrollTop = useScrollTop({ containerRef });
  const theme = useTheme();
  const MenuListComponent = CustomMenuList || StyledMenuList;
  const stickyIndices = useMemo(
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
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: LIST_ITEMS_BUFFER,
    rangeExtractor: getActiveItemIndices,
    onChange: onChangeCallback
  });
  useEffect8(() => {
    onChangeCallback(virtualizer);
  }, [items]);
  useScrollToSelected({ selectedValue, items, virtualizer });
  const virtualItems = virtualizer.getVirtualItems();
  return /* @__PURE__ */ React22.createElement(Box7, { ref: containerRef, sx: { height: "100%", overflowY: "auto" } }, items.length === 0 && noResultsComponent ? noResultsComponent : /* @__PURE__ */ React22.createElement(
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
          MenuSubheader,
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
        ListItem,
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
var StyledMenuList = styled5(MenuList)(({ theme }) => ({
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
import * as React23 from "react";
import { bindPopover, bindTrigger, IconButton as IconButton2, Popover, Tooltip as Tooltip3, usePopupState } from "@elementor/ui";
var SIZE3 = "tiny";
function PopoverAction({ title, visible = true, icon: Icon, content: PopoverContent }) {
  const { popupState, triggerProps, popoverProps } = useFloatingActionsPopover();
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React23.createElement(React23.Fragment, null, /* @__PURE__ */ React23.createElement(Tooltip3, { placement: "top", title }, /* @__PURE__ */ React23.createElement(IconButton2, { "aria-label": title, size: SIZE3, ...triggerProps }, /* @__PURE__ */ React23.createElement(Icon, { fontSize: SIZE3 }))), /* @__PURE__ */ React23.createElement(
    Popover,
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
  const popupState = usePopupState({ variant: "popover" });
  const triggerProps = bindTrigger(popupState);
  const popoverProps = bindPopover(popupState);
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
import * as React24 from "react";
import { useState as useState8 } from "react";
import { AlertTriangleFilledIcon, XIcon as XIcon2 } from "@elementor/icons";
import {
  Button as Button6,
  Dialog as Dialog3,
  DialogActions as DialogActions2,
  DialogContent,
  DialogContentText,
  DialogTitle as DialogTitle2,
  IconButton as IconButton3,
  Stack as Stack3
} from "@elementor/ui";
var TITLE_ID = "save-changes-dialog";
var SaveChangesDialog = ({ children, onClose }) => /* @__PURE__ */ React24.createElement(Dialog3, { open: true, onClose, "aria-labelledby": TITLE_ID, maxWidth: "xs" }, children);
var SaveChangesDialogTitle = ({ children, onClose }) => /* @__PURE__ */ React24.createElement(
  DialogTitle2,
  {
    id: TITLE_ID,
    display: "flex",
    alignItems: "center",
    gap: 1,
    sx: { lineHeight: 1, justifyContent: "space-between" }
  },
  /* @__PURE__ */ React24.createElement(Stack3, { direction: "row", alignItems: "center", gap: 1 }, /* @__PURE__ */ React24.createElement(AlertTriangleFilledIcon, { color: "secondary" }), children),
  onClose && /* @__PURE__ */ React24.createElement(IconButton3, { onClick: onClose, size: "small" }, /* @__PURE__ */ React24.createElement(XIcon2, null))
);
var SaveChangesDialogContent = ({ children }) => /* @__PURE__ */ React24.createElement(DialogContent, null, children);
var SaveChangesDialogContentText = (props) => /* @__PURE__ */ React24.createElement(DialogContentText, { variant: "body2", color: "textPrimary", display: "flex", flexDirection: "column", ...props });
var SaveChangesDialogActions = ({ actions }) => {
  const [isConfirming, setIsConfirming] = useState8(false);
  const { cancel, confirm, discard } = actions;
  const onConfirm = async () => {
    setIsConfirming(true);
    await confirm.action();
    setIsConfirming(false);
  };
  return /* @__PURE__ */ React24.createElement(DialogActions2, null, cancel && /* @__PURE__ */ React24.createElement(Button6, { variant: "text", color: "secondary", onClick: cancel.action }, cancel.label), discard && /* @__PURE__ */ React24.createElement(Button6, { variant: "text", color: "secondary", onClick: discard.action }, discard.label), /* @__PURE__ */ React24.createElement(Button6, { variant: "contained", color: "secondary", onClick: onConfirm, loading: isConfirming }, confirm.label));
};
SaveChangesDialog.Title = SaveChangesDialogTitle;
SaveChangesDialog.Content = SaveChangesDialogContent;
SaveChangesDialog.ContentText = SaveChangesDialogContentText;
SaveChangesDialog.Actions = SaveChangesDialogActions;
var useDialog = () => {
  const [isOpen, setIsOpen] = useState8(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, open, close };
};

// src/components/confirmation-dialog.tsx
import * as React25 from "react";
import { useState as useState9 } from "react";
import { AlertOctagonFilledIcon } from "@elementor/icons";
import {
  Button as Button7,
  Checkbox as Checkbox2,
  Dialog as Dialog4,
  DialogActions as DialogActions3,
  DialogContent as DialogContent2,
  DialogContentText as DialogContentText2,
  DialogTitle as DialogTitle3,
  FormControlLabel as FormControlLabel2,
  Typography as Typography6
} from "@elementor/ui";
import { __ as __6 } from "@wordpress/i18n";
var TITLE_ID2 = "confirmation-dialog";
var ConfirmationDialog = ({ open, onClose, children }) => /* @__PURE__ */ React25.createElement(Dialog4, { open, onClose, "aria-labelledby": TITLE_ID2, maxWidth: "sm" }, children);
var ConfirmationDialogTitle = ({
  children,
  icon: Icon = AlertOctagonFilledIcon,
  iconColor = "error"
}) => /* @__PURE__ */ React25.createElement(DialogTitle3, { id: TITLE_ID2, display: "flex", alignItems: "center", gap: 1, sx: { lineHeight: 1 } }, /* @__PURE__ */ React25.createElement(Icon, { color: iconColor }), children);
var ConfirmationDialogContent = ({ children }) => /* @__PURE__ */ React25.createElement(DialogContent2, { sx: { mt: 2 } }, children);
var ConfirmationDialogContentText = (props) => /* @__PURE__ */ React25.createElement(DialogContentText2, { variant: "body2", color: "secondary", ...props });
var ConfirmationDialogActions = ({
  onClose,
  onConfirm,
  cancelLabel,
  confirmLabel,
  color = "error",
  onSuppressMessage,
  suppressLabel = __6("Don't show this again", "elementor")
}) => {
  const [dontShowAgain, setDontShowAgain] = useState9(false);
  const handleConfirm = () => {
    if (dontShowAgain && onSuppressMessage) {
      onSuppressMessage();
    }
    onConfirm();
  };
  return /* @__PURE__ */ React25.createElement(DialogActions3, { sx: onSuppressMessage ? { justifyContent: "space-between", alignItems: "center" } : void 0 }, onSuppressMessage && /* @__PURE__ */ React25.createElement(
    FormControlLabel2,
    {
      control: /* @__PURE__ */ React25.createElement(
        Checkbox2,
        {
          checked: dontShowAgain,
          onChange: (event) => setDontShowAgain(event.target.checked),
          size: "medium",
          color: "secondary"
        }
      ),
      label: /* @__PURE__ */ React25.createElement(Typography6, { variant: "body2", color: "text.secondary" }, suppressLabel)
    }
  ), /* @__PURE__ */ React25.createElement("div", null, /* @__PURE__ */ React25.createElement(Button7, { color: "secondary", onClick: onClose }, cancelLabel ?? __6("Not now", "elementor")), /* @__PURE__ */ React25.createElement(Button7, { autoFocus: true, variant: "contained", color, onClick: handleConfirm, sx: { ml: 1 } }, confirmLabel ?? __6("Delete", "elementor"))));
};
ConfirmationDialog.Title = ConfirmationDialogTitle;
ConfirmationDialog.Content = ConfirmationDialogContent;
ConfirmationDialog.ContentText = ConfirmationDialogContentText;
ConfirmationDialog.Actions = ConfirmationDialogActions;

// src/hooks/use-editable.ts
import { useEffect as useEffect9, useRef as useRef5, useState as useState10 } from "react";
var useEditable = ({ value, onSubmit, validation, onClick, onError }) => {
  const [isEditing, setIsEditing] = useState10(false);
  const [error, setError] = useState10(null);
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
  const ref = useRef5(null);
  useEffect9(() => {
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
export {
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
};
//# sourceMappingURL=index.mjs.map