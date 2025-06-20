// src/components/ellipsis-with-tooltip.tsx
import * as React from "react";
import { useEffect, useState } from "react";
import { Box, Tooltip } from "@elementor/ui";
var EllipsisWithTooltip = ({
  maxWidth,
  title,
  as,
  ...props
}) => {
  const [setRef, isOverflowing] = useIsOverflowing();
  if (isOverflowing) {
    return /* @__PURE__ */ React.createElement(Tooltip, { title, placement: "top" }, /* @__PURE__ */ React.createElement(Content, { maxWidth, ref: setRef, as, ...props }, title));
  }
  return /* @__PURE__ */ React.createElement(Content, { maxWidth, ref: setRef, as, ...props }, title);
};
var Content = React.forwardRef(
  ({ maxWidth, as: Component = Box, ...props }, ref) => /* @__PURE__ */ React.createElement(
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
  const [el, setEl] = useState(null);
  const [isOverflowing, setIsOverflown] = useState(false);
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
import * as React2 from "react";
import { forwardRef as forwardRef2 } from "react";
import { Box as Box2, styled, Tooltip as Tooltip2 } from "@elementor/ui";
var EditableField = forwardRef2(
  ({ value, error, as = "span", sx, ...props }, ref) => {
    return /* @__PURE__ */ React2.createElement(Tooltip2, { title: error, open: !!error, placement: "top" }, /* @__PURE__ */ React2.createElement(StyledField, { ref, component: as, ...props }, value));
  }
);
var StyledField = styled(Box2)`
	width: 100%;
	&:focus {
		outline: none;
	}
`;

// src/components/introduction-modal.tsx
import * as React3 from "react";
import { useState as useState2 } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogHeader,
  DialogTitle,
  Fade,
  FormControlLabel,
  Typography
} from "@elementor/ui";
import { __ } from "@wordpress/i18n";
var IntroductionModal = ({ open, handleClose, title, children }) => {
  const [shouldShowAgain, setShouldShowAgain] = useState2(true);
  return /* @__PURE__ */ React3.createElement(Dialog, { open, onClose: handleClose, maxWidth: "sm", TransitionComponent: Transition }, title && /* @__PURE__ */ React3.createElement(DialogHeader, { logo: false }, /* @__PURE__ */ React3.createElement(DialogTitle, null, title)), children, /* @__PURE__ */ React3.createElement(DialogActions, null, /* @__PURE__ */ React3.createElement(
    FormControlLabel,
    {
      sx: { marginRight: "auto" },
      control: /* @__PURE__ */ React3.createElement(
        Checkbox,
        {
          checked: !shouldShowAgain,
          onChange: () => setShouldShowAgain(!shouldShowAgain)
        }
      ),
      label: /* @__PURE__ */ React3.createElement(Typography, { variant: "body2" }, __("Don't show this again", "elementor"))
    }
  ), /* @__PURE__ */ React3.createElement(
    Button,
    {
      size: "medium",
      variant: "contained",
      sx: { minWidth: "135px" },
      onClick: () => handleClose(shouldShowAgain)
    },
    __("Got it", "elementor")
  )));
};
var Transition = React3.forwardRef((props, ref) => /* @__PURE__ */ React3.createElement(
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
import * as React4 from "react";
import { ThemeProvider as ThemeProviderBase } from "@elementor/ui";

// src/hooks/use-color-scheme.ts
import { useEffect as useEffect2, useState as useState3 } from "react";
import {
  __privateListenTo as listenTo,
  commandEndEvent,
  v1ReadyEvent
} from "@elementor/editor-v1-adapters";
function useColorScheme() {
  const [colorScheme, setColorScheme] = useState3(() => getV1ColorScheme());
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
  return /* @__PURE__ */ React4.createElement(ThemeProviderBase, { colorScheme, palette: EDITOR_PALLETTE }, children);
}

// src/components/menu-item.tsx
import * as React6 from "react";
import { forwardRef as forwardRef4 } from "react";
import { Infotip, MenuItem, MenuItemText } from "@elementor/ui";

// src/components/info-alert.tsx
import * as React5 from "react";
import { InfoCircleFilledIcon } from "@elementor/icons";
import { Alert } from "@elementor/ui";
var InfoAlert = (props) => /* @__PURE__ */ React5.createElement(
  Alert,
  {
    icon: /* @__PURE__ */ React5.createElement(InfoCircleFilledIcon, { fontSize: "small", color: "secondary" }),
    variant: "standard",
    color: "secondary",
    elevation: 0,
    size: "small",
    ...props
  }
);

// src/components/menu-item.tsx
var MenuListItem = ({ children, ...props }) => {
  return /* @__PURE__ */ React6.createElement(
    MenuItem,
    {
      dense: true,
      ...props,
      sx: {
        ...props.sx ?? {}
      }
    },
    /* @__PURE__ */ React6.createElement(
      MenuItemText,
      {
        primary: children,
        primaryTypographyProps: {
          variant: "caption"
        }
      }
    )
  );
};
var MenuItemInfotip = forwardRef4(
  ({ showInfoTip = false, children, content }, ref) => {
    if (!showInfoTip) {
      return /* @__PURE__ */ React6.createElement(React6.Fragment, null, children);
    }
    return /* @__PURE__ */ React6.createElement(
      Infotip,
      {
        ref,
        placement: "right",
        arrow: false,
        content: /* @__PURE__ */ React6.createElement(InfoAlert, { sx: { maxWidth: 325 } }, content)
      },
      /* @__PURE__ */ React6.createElement("div", { style: { pointerEvents: "initial", width: "100%" }, onClick: (e) => e.stopPropagation() }, children)
    );
  }
);

// src/components/infotip-card.tsx
import * as React7 from "react";
import { Box as Box3, Button as Button2, Card, CardActions, CardContent, SvgIcon, Typography as Typography2 } from "@elementor/ui";
var InfoTipCard = ({ content, svgIcon, learnMoreButton, ctaButton }) => {
  return /* @__PURE__ */ React7.createElement(Card, { elevation: 0, sx: { width: 320 } }, /* @__PURE__ */ React7.createElement(CardContent, { sx: { pb: 0 } }, /* @__PURE__ */ React7.createElement(Box3, { display: "flex", alignItems: "start" }, /* @__PURE__ */ React7.createElement(SvgIcon, { fontSize: "tiny", sx: { mr: 0.5 } }, svgIcon), /* @__PURE__ */ React7.createElement(Typography2, { variant: "body2" }, content))), (ctaButton || learnMoreButton) && /* @__PURE__ */ React7.createElement(CardActions, null, learnMoreButton && /* @__PURE__ */ React7.createElement(Button2, { size: "small", color: "warning", href: learnMoreButton.href, target: "_blank" }, learnMoreButton.label), ctaButton && /* @__PURE__ */ React7.createElement(Button2, { size: "small", color: "warning", variant: "contained", onClick: ctaButton.onClick }, ctaButton.label)));
};

// src/components/warning-infotip.tsx
import { forwardRef as forwardRef5 } from "react";
import * as React8 from "react";
import { Alert as Alert2, AlertTitle, Infotip as Infotip2 } from "@elementor/ui";
var WarningInfotip = forwardRef5(
  ({ children, open, title, text, placement, width, offset }, ref) => {
    return /* @__PURE__ */ React8.createElement(
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
        content: /* @__PURE__ */ React8.createElement(Alert2, { color: "error", severity: "warning", variant: "standard", size: "small" }, title ? /* @__PURE__ */ React8.createElement(AlertTitle, null, title) : null, text)
      },
      children
    );
  }
);

// src/components/popover/header.tsx
import * as React9 from "react";
import { isExperimentActive } from "@elementor/editor-v1-adapters";
import { CloseButton, Stack, Typography as Typography3 } from "@elementor/ui";
var SIZE = "tiny";
var isVersion330Active = isExperimentActive("e_v_3_30");
var PopoverHeader = ({ title, onClose, icon, actions }) => {
  const paddingAndSizing = isVersion330Active ? {
    pl: 2,
    pr: 1,
    py: 1.5,
    maxHeight: 36
  } : {
    pl: 1.5,
    pr: 0.5,
    py: 1.5
  };
  return /* @__PURE__ */ React9.createElement(Stack, { direction: "row", alignItems: "center", ...paddingAndSizing, sx: { columnGap: 0.5 } }, icon, /* @__PURE__ */ React9.createElement(
    Typography3,
    {
      variant: "subtitle2",
      sx: isVersion330Active ? {
        fontSize: "12px",
        mt: 0.25
      } : void 0
    },
    title
  ), /* @__PURE__ */ React9.createElement(Stack, { direction: "row", sx: { ml: "auto" } }, actions, /* @__PURE__ */ React9.createElement(CloseButton, { slotProps: { icon: { fontSize: SIZE } }, sx: { ml: "auto" }, onClick: onClose })));
};

// src/components/popover/menu-list.tsx
import * as React11 from "react";
import { useMemo, useRef } from "react";
import { isExperimentActive as isExperimentActive3 } from "@elementor/editor-v1-adapters";
import { MenuList, MenuSubheader, styled as styled2 } from "@elementor/ui";
import { useVirtualizer } from "@tanstack/react-virtual";

// src/hooks/use-scroll-to-selected.ts
import { useEffect as useEffect3 } from "react";
var useScrollToSelected = ({
  selectedValue,
  items,
  virtualizer
}) => {
  useEffect3(() => {
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
import { useEffect as useEffect4, useState as useState4 } from "react";
var useScrollTop = ({ containerRef }) => {
  const [scrollTop, setScrollTop] = useState4(0);
  useEffect4(() => {
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

// src/components/popover/scrollable-content.tsx
import * as React10 from "react";
import { isExperimentActive as isExperimentActive2 } from "@elementor/editor-v1-adapters";
import { Box as Box4 } from "@elementor/ui";
var SECTION_PADDING_INLINE = 32;
var DEFAULT_POPOVER_WIDTH = 220;
var isVersion330Active2 = isExperimentActive2("e_v_3_30");
var PopoverScrollableContent = React10.forwardRef(
  ({ children, height = 260, width = DEFAULT_POPOVER_WIDTH }, ref) => {
    return /* @__PURE__ */ React10.createElement(
      Box4,
      {
        ref,
        sx: {
          overflowY: "auto",
          height,
          width: `${isVersion330Active2 ? width - SECTION_PADDING_INLINE : DEFAULT_POPOVER_WIDTH}px`,
          maxWidth: 496
        }
      },
      children
    );
  }
);

// src/components/popover/menu-list.tsx
var isVersion330Active3 = isExperimentActive3("e_v_3_30");
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
  noResultsComponent,
  menuListTemplate: CustomMenuList,
  width
}) => {
  const containerRef = useRef(null);
  const scrollTop = useScrollTop({ containerRef });
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
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: LIST_ITEMS_BUFFER,
    rangeExtractor: getActiveItemIndices,
    onChange
  });
  useScrollToSelected({ selectedValue, items, virtualizer });
  return /* @__PURE__ */ React11.createElement(PopoverScrollableContent, { ref: containerRef, width }, items.length === 0 && noResultsComponent ? noResultsComponent : /* @__PURE__ */ React11.createElement(
    MenuListComponent,
    {
      role: "listbox",
      style: { height: `${virtualizer.getTotalSize()}px` },
      "data-testid": dataTestId
    },
    virtualizer.getVirtualItems().map((virtualRow) => {
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
        return /* @__PURE__ */ React11.createElement(
          MenuSubheader,
          {
            key: virtualRow.key,
            style: shouldStick ? {} : menuSubHeaderAbsoluteStyling(virtualRow.start),
            sx: isVersion330Active3 ? { fontWeight: "400", color: "text.tertiary" } : void 0
          },
          item.label || item.value
        );
      }
      return /* @__PURE__ */ React11.createElement(
        "li",
        {
          key: virtualRow.key,
          role: "option",
          "aria-selected": isSelected,
          onClick: (e) => {
            if (e.target.closest("button")) {
              return;
            }
            onSelect(item.value);
            onClose();
          },
          onKeyDown: (event) => {
            if (event.key === "Enter") {
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
          style: {
            transform: `translateY(${virtualRow.start + MENU_LIST_PADDING_TOP}px)`,
            ...itemStyle ? itemStyle(item) : {}
          }
        },
        menuItemContentTemplate ? menuItemContentTemplate(item) : item.label || item.value
      );
    })
  ));
};
var StyledMenuList = styled2(MenuList)(({ theme }) => ({
  "& > li": {
    height: ITEM_HEIGHT,
    width: "100%",
    display: "flex",
    alignItems: "center"
  },
  '& > [role="option"]': {
    ...theme.typography.caption,
    lineHeight: "inherit",
    padding: theme.spacing(0.75, 2, 0.75, 4),
    "&:hover, &:focus": {
      backgroundColor: theme.palette.action.hover
    },
    '&[aria-selected="true"]': {
      backgroundColor: theme.palette.action.selected
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

// src/components/popover/search.tsx
import * as React12 from "react";
import { useRef as useRef2 } from "react";
import { isExperimentActive as isExperimentActive4 } from "@elementor/editor-v1-adapters";
import { SearchIcon, XIcon } from "@elementor/icons";
import { Box as Box5, IconButton, InputAdornment, TextField } from "@elementor/ui";
import { __ as __2 } from "@wordpress/i18n";
var isVersion330Active4 = isExperimentActive4("e_v_3_30");
var SIZE2 = "tiny";
var PopoverSearch = ({ value, onSearch, placeholder }) => {
  const inputRef = useRef2(null);
  const handleClear = () => {
    onSearch("");
    inputRef.current?.focus();
  };
  const handleInputChange = (event) => {
    onSearch(event.target.value);
  };
  const padding = isVersion330Active4 ? {
    px: 2,
    pb: 1.5
  } : {
    px: 1.5,
    pb: 1
  };
  return /* @__PURE__ */ React12.createElement(Box5, { ...padding }, /* @__PURE__ */ React12.createElement(
    TextField,
    {
      autoFocus: true,
      fullWidth: true,
      size: SIZE2,
      value,
      inputRef,
      onChange: handleInputChange,
      placeholder,
      InputProps: {
        startAdornment: /* @__PURE__ */ React12.createElement(InputAdornment, { position: "start" }, /* @__PURE__ */ React12.createElement(SearchIcon, { fontSize: SIZE2 })),
        endAdornment: value && /* @__PURE__ */ React12.createElement(IconButton, { size: SIZE2, onClick: handleClear, "aria-label": __2("Clear", "elementor") }, /* @__PURE__ */ React12.createElement(XIcon, { color: "action", fontSize: SIZE2 }))
      }
    }
  ));
};

// src/hooks/use-editable.ts
import { useEffect as useEffect5, useRef as useRef3, useState as useState5 } from "react";
var useEditable = ({ value, onSubmit, validation, onClick, onError }) => {
  const [isEditing, setIsEditing] = useState5(false);
  const [error, setError] = useState5(null);
  const ref = useSelection(isEditing);
  const isDirty = (newValue) => newValue !== value;
  const openEditMode = () => {
    setIsEditing(true);
  };
  const closeEditMode = () => {
    ref.current?.blur();
    setError(null);
    onError?.(null);
    setIsEditing(false);
  };
  const submit = (newValue) => {
    if (!isDirty(newValue)) {
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
      return submit(event.target.innerText);
    }
  };
  const handleClick = (event) => {
    if (isEditing) {
      event.stopPropagation();
    }
    onClick?.(event);
  };
  const listeners = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onInput: onChange,
    onBlur: closeEditMode
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
  const ref = useRef3(null);
  useEffect5(() => {
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
  EditableField,
  EllipsisWithTooltip,
  ITEM_HEIGHT,
  InfoAlert,
  InfoTipCard,
  IntroductionModal,
  MenuItemInfotip,
  MenuListItem,
  PopoverHeader,
  PopoverMenuList,
  PopoverScrollableContent,
  PopoverSearch,
  StyledMenuList,
  ThemeProvider,
  WarningInfotip,
  useEditable
};
//# sourceMappingURL=index.mjs.map