// src/controls/image-control.tsx
import * as React13 from "react";
import { imagePropTypeUtil } from "@elementor/editor-props";
import { Grid, Stack as Stack3 } from "@elementor/ui";
import { __ as __2 } from "@wordpress/i18n";

// src/bound-prop-context/prop-context.tsx
import * as React from "react";
import { createContext, useContext } from "react";

// src/bound-prop-context/errors.ts
import { createError } from "@elementor/utils";
var MissingPropTypeError = createError({
  code: "missing_prop_provider_prop_type",
  message: "Prop type is missing"
});
var UnsupportedParentError = createError({
  code: "unsupported_prop_provider_prop_type",
  message: "Parent prop type is not supported"
});
var HookOutsideProviderError = createError({
  code: "hook_outside_provider",
  message: "Hook used outside of provider"
});

// src/bound-prop-context/prop-context.tsx
var PropContext = createContext(null);
var PropProvider = ({
  children,
  value,
  setValue,
  propType,
  placeholder,
  isDisabled
}) => {
  return /* @__PURE__ */ React.createElement(
    PropContext.Provider,
    {
      value: {
        value,
        propType,
        setValue,
        placeholder,
        isDisabled
      }
    },
    children
  );
};
var usePropContext = () => {
  const context = useContext(PropContext);
  if (!context) {
    throw new HookOutsideProviderError({
      context: {
        hook: "usePropContext",
        provider: "PropProvider"
      }
    });
  }
  return context;
};

// src/bound-prop-context/prop-key-context.tsx
import * as React2 from "react";
import { createContext as createContext2, useContext as useContext2 } from "react";
var PropKeyContext = createContext2(null);
var PropKeyProvider = ({ children, bind }) => {
  const { propType } = usePropContext();
  if (!propType) {
    throw new MissingPropTypeError({ context: { bind } });
  }
  if (propType.kind === "array") {
    return /* @__PURE__ */ React2.createElement(ArrayPropKeyProvider, { bind }, children);
  }
  if (propType.kind === "object") {
    return /* @__PURE__ */ React2.createElement(ObjectPropKeyProvider, { bind }, children);
  }
  throw new UnsupportedParentError({ context: { propType } });
};
var ObjectPropKeyProvider = ({ children, bind }) => {
  const context = usePropContext();
  const { path } = useContext2(PropKeyContext) ?? {};
  const setValue = (value2, options, meta) => {
    const newValue = {
      ...context.value,
      [bind]: value2
    };
    return context?.setValue(newValue, options, { ...meta, bind });
  };
  const value = context.value?.[bind];
  const placeholder = context.placeholder?.[bind];
  const propType = context.propType.shape[bind];
  return /* @__PURE__ */ React2.createElement(
    PropKeyContext.Provider,
    {
      value: { ...context, value, setValue, placeholder, bind, propType, path: [...path ?? [], bind] }
    },
    children
  );
};
var ArrayPropKeyProvider = ({ children, bind }) => {
  const context = usePropContext();
  const { path } = useContext2(PropKeyContext) ?? {};
  const setValue = (value2, options) => {
    const newValue = [...context.value ?? []];
    newValue[Number(bind)] = value2;
    return context?.setValue(newValue, options, { bind });
  };
  const value = context.value?.[Number(bind)];
  const propType = context.propType.item_prop_type;
  return /* @__PURE__ */ React2.createElement(
    PropKeyContext.Provider,
    {
      value: { ...context, value, setValue, bind, propType, path: [...path ?? [], bind] }
    },
    children
  );
};
var usePropKeyContext = () => {
  const context = useContext2(PropKeyContext);
  if (!context) {
    throw new HookOutsideProviderError({
      context: { hook: "usePropKeyContext", provider: "PropKeyProvider" }
    });
  }
  return context;
};

// src/bound-prop-context/use-bound-prop.ts
import { useState } from "react";
function useBoundProp(propTypeUtil) {
  const propKeyContext = usePropKeyContext();
  const { isValid, validate, restoreValue } = useValidation(propKeyContext.propType);
  const disabled = propKeyContext.isDisabled?.(propKeyContext.propType);
  const resetValue = () => {
    propKeyContext.setValue(propKeyContext.propType.initial_value ?? null);
  };
  if (!propTypeUtil) {
    return {
      ...propKeyContext,
      disabled,
      resetValue
    };
  }
  function setValue(value2, options, meta) {
    if (!validate(value2, meta?.validation)) {
      return;
    }
    if (value2 === null) {
      return propKeyContext?.setValue(null, options, meta);
    }
    return propKeyContext?.setValue(propTypeUtil?.create(value2, options), {}, meta);
  }
  const propType = resolveUnionPropType(propKeyContext.propType, propTypeUtil.key);
  const value = propTypeUtil.extract(propKeyContext.value ?? propType.default ?? null);
  const placeholder = propTypeUtil.extract(propKeyContext.placeholder ?? null);
  return {
    ...propKeyContext,
    propType,
    setValue,
    value: isValid ? value : null,
    restoreValue,
    placeholder,
    disabled,
    resetValue
  };
}
var useValidation = (propType) => {
  const [isValid, setIsValid] = useState(true);
  const validate = (value, validation) => {
    let valid = true;
    if (propType.settings.required && value === null) {
      valid = false;
    }
    if (validation && !validation(value)) {
      valid = false;
    }
    setIsValid(valid);
    return valid;
  };
  const restoreValue = () => setIsValid(true);
  return {
    isValid,
    setIsValid,
    validate,
    restoreValue
  };
};
var resolveUnionPropType = (propType, key) => {
  let resolvedPropType = propType;
  if (propType.kind === "union") {
    resolvedPropType = propType.prop_types[key];
  }
  if (!resolvedPropType) {
    throw new MissingPropTypeError({ context: { key } });
  }
  return resolvedPropType;
};

// src/components/control-form-label.tsx
import * as React3 from "react";
import { FormLabel } from "@elementor/ui";
var ControlFormLabel = (props) => {
  return /* @__PURE__ */ React3.createElement(FormLabel, { size: "tiny", ...props });
};

// src/components/control-label.tsx
import * as React6 from "react";
import { Stack } from "@elementor/ui";

// src/control-adornments/control-adornments.tsx
import * as React5 from "react";

// src/control-adornments/control-adornments-context.tsx
import * as React4 from "react";
import { createContext as createContext3, useContext as useContext3 } from "react";
var Context = createContext3(null);
var ControlAdornmentsProvider = ({ children, items: items2 }) => /* @__PURE__ */ React4.createElement(Context.Provider, { value: { items: items2 } }, children);
var useControlAdornments = () => {
  const context = useContext3(Context);
  return context?.items ?? [];
};

// src/control-adornments/control-adornments.tsx
function ControlAdornments({
  customContext
}) {
  const items2 = useControlAdornments();
  if (items2?.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React5.createElement(React5.Fragment, null, items2.map(({ Adornment, id }) => /* @__PURE__ */ React5.createElement(Adornment, { key: id, customContext })));
}

// src/components/control-label.tsx
var ControlLabel = ({ children, ...props }) => {
  return /* @__PURE__ */ React6.createElement(Stack, { direction: "row", alignItems: "center", justifyItems: "start", gap: 0.25 }, /* @__PURE__ */ React6.createElement(ControlFormLabel, { ...props }, children), /* @__PURE__ */ React6.createElement(ControlAdornments, null));
};

// src/create-control.tsx
import * as React8 from "react";
import { ErrorBoundary } from "@elementor/ui";

// src/control-replacements.tsx
import * as React7 from "react";
import { createContext as createContext4, useContext as useContext4 } from "react";
var ControlReplacementContext = createContext4([]);
var ControlReplacementsProvider = ({ replacements, children }) => {
  return /* @__PURE__ */ React7.createElement(ControlReplacementContext.Provider, { value: replacements }, children);
};
var useControlReplacement = (OriginalComponent) => {
  const { value, placeholder } = useBoundProp();
  const replacements = useContext4(ControlReplacementContext);
  try {
    const replacement = replacements.find((r) => r.condition({ value, placeholder }));
    return {
      ControlToRender: replacement?.component ?? OriginalComponent,
      OriginalControl: OriginalComponent,
      isReplaced: !!replacement
    };
  } catch {
    return { ControlToRender: OriginalComponent, OriginalControl: OriginalComponent };
  }
};
var createControlReplacementsRegistry = () => {
  const controlReplacements = [];
  function registerControlReplacement2(replacement) {
    controlReplacements.push(replacement);
  }
  function getControlReplacements2() {
    return controlReplacements;
  }
  return { registerControlReplacement: registerControlReplacement2, getControlReplacements: getControlReplacements2 };
};
var { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

// src/create-control.tsx
function createControl(Control5) {
  return ((props) => {
    const { ControlToRender, OriginalControl, isReplaced } = useControlReplacement(Control5);
    const controlProps = isReplaced ? { ...props, OriginalControl } : props;
    return /* @__PURE__ */ React8.createElement(ErrorBoundary, { fallback: null }, /* @__PURE__ */ React8.createElement(ControlToRender, { ...controlProps }));
  });
}

// src/hooks/use-unfiltered-files-upload.ts
import { useMutation, useQuery, useQueryClient } from "@elementor/query";

// src/api.ts
import { httpService } from "@elementor/http-client";
var ELEMENTOR_SETTING_URL = "elementor/v1/settings";
var apiClient = {
  getElementorSetting: (key) => httpService().get(`${ELEMENTOR_SETTING_URL}/${key}`).then((res) => formatSettingResponse(res.data)),
  updateElementorSetting: (key, value) => httpService().put(`${ELEMENTOR_SETTING_URL}/${key}`, { value })
};
var formatSettingResponse = (response) => response.data.value;

// src/hooks/use-unfiltered-files-upload.ts
var UNFILTERED_FILES_UPLOAD_KEY = "elementor_unfiltered_files_upload";
var unfilteredFilesQueryKey = {
  queryKey: [UNFILTERED_FILES_UPLOAD_KEY]
};
var useUnfilteredFilesUpload = () => useQuery({
  ...unfilteredFilesQueryKey,
  queryFn: () => apiClient.getElementorSetting(UNFILTERED_FILES_UPLOAD_KEY).then((res) => {
    return formatResponse(res);
  }),
  staleTime: Infinity
});
function useUpdateUnfilteredFilesUpload() {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: ({ allowUnfilteredFilesUpload }) => apiClient.updateElementorSetting(
      UNFILTERED_FILES_UPLOAD_KEY,
      allowUnfilteredFilesUpload ? "1" : "0"
    ),
    onSuccess: () => queryClient.invalidateQueries(unfilteredFilesQueryKey)
  });
  return mutate;
}
var formatResponse = (response) => {
  return Boolean(response === "1");
};

// src/controls/image-media-control.tsx
import * as React11 from "react";
import { imageSrcPropTypeUtil } from "@elementor/editor-props";
import { UploadIcon } from "@elementor/icons";
import { Button, Card, CardMedia, CardOverlay, CircularProgress, Stack as Stack2 } from "@elementor/ui";
import { useWpMediaAttachment, useWpMediaFrame } from "@elementor/wp-media";
import { __ } from "@wordpress/i18n";

// src/control-actions/control-actions.tsx
import * as React10 from "react";
import { FloatingActionsBar } from "@elementor/editor-ui";

// src/control-actions/control-actions-context.tsx
import * as React9 from "react";
import { createContext as createContext5, useContext as useContext5 } from "react";
var Context2 = createContext5(null);
var ControlActionsProvider = ({ children, items: items2 }) => /* @__PURE__ */ React9.createElement(Context2.Provider, { value: { items: items2 } }, children);
var useControlActions = () => {
  const context = useContext5(Context2);
  if (!context) {
    throw new Error("useControlActions must be used within a ControlActionsProvider");
  }
  return context;
};

// src/control-actions/control-actions.tsx
function ControlActions({ children }) {
  const { items: items2 } = useControlActions();
  const { disabled } = useBoundProp();
  if (items2.length === 0 || disabled) {
    return children;
  }
  const menuItems = items2.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React10.createElement(MenuItem2, { key: id }));
  return /* @__PURE__ */ React10.createElement(FloatingActionsBar, { actions: menuItems }, children);
}

// src/controls/image-media-control.tsx
var ImageMediaControl = createControl(({ mediaTypes = ["image"] }) => {
  const { value, setValue, propType } = useBoundProp(imageSrcPropTypeUtil);
  const { id, url } = value ?? {};
  const { data: attachment, isFetching } = useWpMediaAttachment(id?.value || null);
  const src = attachment?.url ?? url?.value ?? null;
  const { open } = useWpMediaFrame({
    mediaTypes,
    multiple: false,
    selected: id?.value || null,
    onSelect: (selectedAttachment) => {
      setValue({
        id: {
          $$type: "image-attachment-id",
          value: selectedAttachment.id
        },
        url: null
      });
    }
  });
  return /* @__PURE__ */ React11.createElement(ControlActions, null, /* @__PURE__ */ React11.createElement(Card, { variant: "outlined" }, /* @__PURE__ */ React11.createElement(CardMedia, { image: src, sx: { height: propType.meta.isDynamic ? 134 : 150 } }, isFetching ? /* @__PURE__ */ React11.createElement(Stack2, { justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }, /* @__PURE__ */ React11.createElement(CircularProgress, null)) : /* @__PURE__ */ React11.createElement(React11.Fragment, null)), /* @__PURE__ */ React11.createElement(CardOverlay, null, /* @__PURE__ */ React11.createElement(Stack2, { gap: 1 }, /* @__PURE__ */ React11.createElement(
    Button,
    {
      size: "tiny",
      color: "inherit",
      variant: "outlined",
      onClick: () => open({ mode: "browse" })
    },
    __("Select image", "elementor")
  ), /* @__PURE__ */ React11.createElement(
    Button,
    {
      size: "tiny",
      variant: "text",
      color: "inherit",
      startIcon: /* @__PURE__ */ React11.createElement(UploadIcon, null),
      onClick: () => open({ mode: "upload" })
    },
    __("Upload", "elementor")
  )))));
});

// src/controls/select-control.tsx
import * as React12 from "react";
import { stringPropTypeUtil } from "@elementor/editor-props";
import { MenuListItem } from "@elementor/editor-ui";
import { Select, Typography } from "@elementor/ui";
var DEFAULT_MENU_PROPS = {
  MenuListProps: {
    sx: {
      maxHeight: "160px"
    }
  }
};
var SelectControl = createControl(
  ({ options, onChange, MenuProps = DEFAULT_MENU_PROPS, ariaLabel }) => {
    const { value, setValue, disabled, placeholder } = useBoundProp(stringPropTypeUtil);
    const handleChange = (event) => {
      const newValue = event.target.value || null;
      onChange?.(newValue, value);
      setValue(newValue);
    };
    const isDisabled = disabled || options.length === 0;
    return /* @__PURE__ */ React12.createElement(ControlActions, null, /* @__PURE__ */ React12.createElement(
      Select,
      {
        sx: { overflow: "hidden" },
        displayEmpty: true,
        size: "tiny",
        MenuProps,
        "aria-label": ariaLabel || placeholder,
        renderValue: (selectedValue) => {
          const findOptionByValue = (searchValue) => options.find((opt) => opt.value === searchValue);
          if (!selectedValue || selectedValue === "") {
            if (placeholder) {
              const placeholderOption = findOptionByValue(placeholder);
              const displayText = placeholderOption?.label || placeholder;
              return /* @__PURE__ */ React12.createElement(Typography, { component: "span", variant: "caption", color: "text.tertiary" }, displayText);
            }
            return "";
          }
          const option = findOptionByValue(selectedValue);
          return option?.label || selectedValue;
        },
        value: value ?? "",
        onChange: handleChange,
        disabled: isDisabled,
        fullWidth: true
      },
      options.map(({ label, ...props }) => /* @__PURE__ */ React12.createElement(MenuListItem, { key: props.value, ...props, value: props.value ?? "" }, label))
    ));
  }
);

// src/controls/image-control.tsx
var ImageControl = createControl(({ sizes, label = __2("Image", "elementor") }) => {
  const propContext = useBoundProp(imagePropTypeUtil);
  return /* @__PURE__ */ React13.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React13.createElement(Stack3, { gap: 1.5 }, /* @__PURE__ */ React13.createElement(ControlLabel, null, label), /* @__PURE__ */ React13.createElement(ImageSrcControl, null), /* @__PURE__ */ React13.createElement(Grid, { container: true, gap: 1.5, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React13.createElement(Grid, { item: true, xs: 6 }, /* @__PURE__ */ React13.createElement(ControlFormLabel, null, __2("Resolution", "elementor"))), /* @__PURE__ */ React13.createElement(Grid, { item: true, xs: 6, sx: { overflow: "hidden" } }, /* @__PURE__ */ React13.createElement(ImageSizeControl, { sizes })))));
});
var ImageSrcControl = () => {
  const { data: allowSvgUpload } = useUnfilteredFilesUpload();
  const mediaTypes = allowSvgUpload ? ["image", "svg"] : ["image"];
  return /* @__PURE__ */ React13.createElement(PropKeyProvider, { bind: "src" }, /* @__PURE__ */ React13.createElement(ImageMediaControl, { mediaTypes }));
};
var ImageSizeControl = ({ sizes }) => {
  return /* @__PURE__ */ React13.createElement(PropKeyProvider, { bind: "size" }, /* @__PURE__ */ React13.createElement(SelectControl, { options: sizes }));
};

// src/controls/text-control.tsx
import * as React14 from "react";
import { stringPropTypeUtil as stringPropTypeUtil2 } from "@elementor/editor-props";
import { TextField } from "@elementor/ui";
var TextControl = createControl(
  ({
    placeholder,
    error,
    inputValue,
    inputDisabled,
    helperText,
    sx,
    ariaLabel
  }) => {
    const { value, setValue, disabled } = useBoundProp(stringPropTypeUtil2);
    const handleChange = (event) => setValue(event.target.value);
    return /* @__PURE__ */ React14.createElement(ControlActions, null, /* @__PURE__ */ React14.createElement(
      TextField,
      {
        size: "tiny",
        fullWidth: true,
        disabled: inputDisabled ?? disabled,
        value: inputValue ?? value ?? "",
        onChange: handleChange,
        placeholder,
        error,
        helperText,
        sx,
        inputProps: {
          ...ariaLabel ? { "aria-label": ariaLabel } : {}
        }
      }
    ));
  }
);

// src/controls/text-area-control.tsx
import * as React15 from "react";
import { stringPropTypeUtil as stringPropTypeUtil3 } from "@elementor/editor-props";
import { TextField as TextField2 } from "@elementor/ui";
var TextAreaControl = createControl(({ placeholder, ariaLabel }) => {
  const { value, setValue, disabled } = useBoundProp(stringPropTypeUtil3);
  const handleChange = (event) => {
    setValue(event.target.value);
  };
  return /* @__PURE__ */ React15.createElement(ControlActions, null, /* @__PURE__ */ React15.createElement(
    TextField2,
    {
      size: "tiny",
      multiline: true,
      fullWidth: true,
      minRows: 5,
      disabled,
      value: value ?? "",
      onChange: handleChange,
      placeholder,
      inputProps: {
        ...ariaLabel ? { "aria-label": ariaLabel } : {}
      }
    }
  ));
});

// src/controls/size-control.tsx
import * as React20 from "react";
import { useEffect as useEffect4, useMemo as useMemo2 } from "react";
import { sizePropTypeUtil as sizePropTypeUtil2 } from "@elementor/editor-props";
import { useActiveBreakpoint } from "@elementor/editor-responsive";
import { usePopupState as usePopupState2 } from "@elementor/ui";

// src/components/size-control/size-input.tsx
import * as React18 from "react";
import { MathFunctionIcon } from "@elementor/icons";
import { Box, InputAdornment as InputAdornment2 } from "@elementor/ui";

// src/hooks/use-typing-buffer.ts
import { useEffect, useRef } from "react";
function useTypingBuffer(options = {}) {
  const { limit = 3, timeout = 600 } = options;
  const inputBufferRef = useRef("");
  const timeoutRef = useRef(null);
  const appendKey = (key) => {
    inputBufferRef.current = (inputBufferRef.current + key).slice(-limit);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      inputBufferRef.current = "";
      timeoutRef.current = null;
    }, timeout);
    return inputBufferRef.current;
  };
  const startsWith = (haystack, needle) => {
    if (3 < haystack.length && 2 > needle.length) {
      return false;
    }
    return haystack.startsWith(needle);
  };
  useEffect(() => {
    return () => {
      inputBufferRef.current = "";
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);
  return {
    buffer: inputBufferRef.current,
    appendKey,
    startsWith
  };
}

// src/utils/size-control.ts
var lengthUnits = ["px", "%", "em", "rem", "vw", "vh", "ch"];
var angleUnits = ["deg", "rad", "grad", "turn"];
var timeUnits = ["s", "ms"];
var defaultExtendedOptions = ["auto", "custom"];
var DEFAULT_UNIT = "px";
var DEFAULT_SIZE = NaN;
function isUnitExtendedOption(unit) {
  return defaultExtendedOptions.includes(unit);
}

// src/components/size-control/text-field-inner-selection.tsx
import * as React17 from "react";
import { forwardRef as forwardRef2, useId } from "react";
import { sizePropTypeUtil } from "@elementor/editor-props";
import { MenuListItem as MenuListItem2 } from "@elementor/editor-ui";
import {
  bindMenu,
  bindTrigger,
  Button as Button2,
  InputAdornment,
  Menu,
  styled,
  usePopupState
} from "@elementor/ui";

// src/components/number-input.tsx
import * as React16 from "react";
import { forwardRef, useState as useState2 } from "react";
import { TextField as TextField3 } from "@elementor/ui";
var RESTRICTED_INPUT_KEYS = ["e", "E", "+"];
var NumberInput = forwardRef((props, ref) => {
  const [key, setKey] = useState2(0);
  const handleKeyDown = (event) => {
    blockRestrictedKeys(event, props.inputProps?.min);
    props.onKeyDown?.(event);
  };
  const handleBlur = (event) => {
    props.onBlur?.(event);
    const { valid } = event.target.validity;
    if (!valid) {
      setKey((prev) => prev + 1);
    }
  };
  return /* @__PURE__ */ React16.createElement(TextField3, { ...props, ref, key, onKeyDown: handleKeyDown, onBlur: handleBlur });
});
function blockRestrictedKeys(event, min) {
  const restrictedInputKeys = [...RESTRICTED_INPUT_KEYS];
  if (min >= 0) {
    restrictedInputKeys.push("-");
  }
  if (restrictedInputKeys.includes(event.key)) {
    event.preventDefault();
  }
}

// src/components/size-control/text-field-inner-selection.tsx
var TextFieldInnerSelection = forwardRef2(
  ({
    placeholder,
    type,
    value,
    onChange,
    onBlur,
    onKeyDown,
    onKeyUp,
    InputProps,
    inputProps,
    disabled,
    isPopoverOpen,
    id
  }, ref) => {
    const { placeholder: boundPropPlaceholder } = useBoundProp(sizePropTypeUtil);
    const getCursorStyle2 = () => ({
      input: { cursor: InputProps.readOnly ? "default !important" : void 0 }
    });
    return /* @__PURE__ */ React17.createElement(
      NumberInput,
      {
        ref,
        sx: getCursorStyle2(),
        size: "tiny",
        fullWidth: true,
        type,
        value,
        onInput: onChange,
        onKeyDown,
        onKeyUp,
        disabled,
        onBlur,
        focused: isPopoverOpen ? true : void 0,
        placeholder: placeholder ?? (String(boundPropPlaceholder?.size ?? "") || void 0),
        InputProps,
        inputProps,
        id
      }
    );
  }
);
var SelectionEndAdornment = ({
  options,
  alternativeOptionLabels = {},
  onClick,
  value,
  menuItemsAttributes = {},
  disabled
}) => {
  const popupState = usePopupState({
    variant: "popover",
    popupId: useId()
  });
  const handleMenuItemClick = (index) => {
    onClick(options[index]);
    popupState.close();
  };
  const { placeholder, showPrimaryColor } = useUnitPlaceholder(value);
  const itemStyles = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  };
  return /* @__PURE__ */ React17.createElement(InputAdornment, { position: "end" }, /* @__PURE__ */ React17.createElement(
    StyledButton,
    {
      isPrimaryColor: showPrimaryColor,
      size: "small",
      disabled,
      ...bindTrigger(popupState)
    },
    placeholder ?? alternativeOptionLabels[value] ?? value
  ), /* @__PURE__ */ React17.createElement(Menu, { MenuListProps: { dense: true }, ...bindMenu(popupState) }, options.map((option, index) => /* @__PURE__ */ React17.createElement(
    MenuListItem2,
    {
      key: option,
      onClick: () => handleMenuItemClick(index),
      ...menuItemsAttributes?.[option],
      primaryTypographyProps: {
        variant: "caption",
        sx: {
          ...itemStyles,
          lineHeight: "1"
        }
      },
      menuItemTextProps: {
        sx: itemStyles
      }
    },
    alternativeOptionLabels[option] ?? option.toUpperCase()
  ))));
};
function useUnitPlaceholder(value) {
  const { value: externalValue, placeholder } = useBoundProp(sizePropTypeUtil);
  const size = externalValue?.size;
  const unit = externalValue?.unit;
  const isCustomUnitWithSize = value === "custom" && Boolean(size);
  const isAutoUnit = value === "auto";
  const showPrimaryColor = isAutoUnit || isCustomUnitWithSize || Boolean(size);
  if (!placeholder) {
    return {
      placeholder: null,
      showPrimaryColor
    };
  }
  const isMissingUnit = !unit;
  const showPlaceholder = isMissingUnit && value === DEFAULT_UNIT;
  return {
    placeholder: showPlaceholder ? placeholder.unit : void 0,
    showPrimaryColor
  };
}
var StyledButton = styled(Button2, {
  shouldForwardProp: (prop) => prop !== "isPrimaryColor"
})(({ isPrimaryColor, theme }) => ({
  color: isPrimaryColor ? theme.palette.text.primary : theme.palette.text.tertiary,
  font: "inherit",
  minWidth: "initial",
  textTransform: "uppercase"
}));

// src/components/size-control/size-input.tsx
var SizeInput = ({
  units: units2,
  handleUnitChange,
  handleSizeChange,
  placeholder,
  startIcon,
  onBlur,
  onFocus,
  onClick,
  size,
  unit,
  popupState,
  disabled,
  min,
  id,
  ariaLabel
}) => {
  const { appendKey, startsWith } = useTypingBuffer();
  const inputType = isUnitExtendedOption(unit) ? "text" : "number";
  const inputValue = !isUnitExtendedOption(unit) && Number.isNaN(size) ? "" : size ?? "";
  const handleKeyDown = (event) => {
    const { key, altKey, ctrlKey, metaKey } = event;
    if (altKey || ctrlKey || metaKey) {
      return;
    }
    if (isUnitExtendedOption(unit) && !isNaN(Number(key))) {
      const defaultUnit = units2?.[0];
      if (defaultUnit) {
        handleUnitChange(defaultUnit);
      }
      return;
    }
    if (!/^[a-zA-Z%]$/.test(key)) {
      return;
    }
    event.preventDefault();
    const newChar = key.toLowerCase();
    const updatedBuffer = appendKey(newChar);
    const matchedUnit = units2.find((u) => startsWith(u, updatedBuffer));
    if (matchedUnit) {
      handleUnitChange(matchedUnit);
    }
  };
  const popupAttributes = {
    "aria-controls": popupState.isOpen ? popupState.popupId : void 0,
    "aria-haspopup": true
  };
  const menuItemsAttributes = units2.includes("custom") ? {
    custom: popupAttributes
  } : void 0;
  const alternativeOptionLabels = {
    custom: /* @__PURE__ */ React18.createElement(MathFunctionIcon, { fontSize: "tiny" })
  };
  const InputProps = {
    ...popupAttributes,
    readOnly: isUnitExtendedOption(unit),
    autoComplete: "off",
    onClick,
    onFocus,
    startAdornment: startIcon ? /* @__PURE__ */ React18.createElement(InputAdornment2, { position: "start", disabled }, startIcon) : void 0,
    endAdornment: /* @__PURE__ */ React18.createElement(
      SelectionEndAdornment,
      {
        disabled,
        options: units2,
        onClick: handleUnitChange,
        value: unit,
        alternativeOptionLabels,
        menuItemsAttributes
      }
    )
  };
  return /* @__PURE__ */ React18.createElement(ControlActions, null, /* @__PURE__ */ React18.createElement(Box, null, /* @__PURE__ */ React18.createElement(
    TextFieldInnerSelection,
    {
      disabled,
      placeholder,
      type: inputType,
      value: inputValue,
      onChange: handleSizeChange,
      onKeyDown: handleKeyDown,
      onBlur,
      InputProps,
      inputProps: { min, step: "any", "aria-label": ariaLabel },
      isPopoverOpen: popupState.isOpen,
      id
    }
  )));
};

// src/components/text-field-popover.tsx
import * as React19 from "react";
import { useEffect as useEffect2, useRef as useRef2 } from "react";
import { PopoverHeader } from "@elementor/editor-ui";
import { MathFunctionIcon as MathFunctionIcon2 } from "@elementor/icons";
import { bindPopover, Popover, TextField as TextField4 } from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";
var SIZE = "tiny";
var TextFieldPopover = (props) => {
  const { popupState, restoreValue, anchorRef, value, onChange } = props;
  const inputRef = useRef2(null);
  useEffect2(() => {
    if (popupState.isOpen) {
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    }
  }, [popupState.isOpen]);
  const handleKeyPress = (event) => {
    if (event.key.toLowerCase() === "enter") {
      handleClose();
    }
  };
  const handleClose = () => {
    restoreValue();
    popupState.close();
  };
  return /* @__PURE__ */ React19.createElement(
    Popover,
    {
      disablePortal: true,
      slotProps: {
        paper: {
          sx: {
            borderRadius: 2,
            width: anchorRef.current?.offsetWidth + "px"
          }
        }
      },
      ...bindPopover(popupState),
      anchorOrigin: { vertical: "bottom", horizontal: "center" },
      transformOrigin: { vertical: "top", horizontal: "center" },
      onClose: handleClose
    },
    /* @__PURE__ */ React19.createElement(
      PopoverHeader,
      {
        title: __3("CSS function", "elementor"),
        onClose: handleClose,
        icon: /* @__PURE__ */ React19.createElement(MathFunctionIcon2, { fontSize: SIZE })
      }
    ),
    /* @__PURE__ */ React19.createElement(
      TextField4,
      {
        value,
        onChange,
        onKeyPress: handleKeyPress,
        size: "tiny",
        type: "text",
        fullWidth: true,
        inputProps: {
          ref: inputRef
        },
        sx: { pt: 0, pr: 1.5, pb: 1.5, pl: 1.5 }
      }
    )
  );
};

// src/hooks/use-size-extended-options.ts
import { useMemo } from "react";
function useSizeExtendedOptions(options, disableCustom) {
  return useMemo(() => {
    const extendedOptions = [...options];
    if (!disableCustom && !extendedOptions.includes("custom")) {
      extendedOptions.push("custom");
    } else if (options.includes("custom")) {
      extendedOptions.splice(extendedOptions.indexOf("custom"), 1);
    }
    return extendedOptions;
  }, [options, disableCustom]);
}

// src/hooks/use-sync-external-state.tsx
import { useEffect as useEffect3, useState as useState3 } from "react";
var useSyncExternalState = ({
  external,
  setExternal,
  persistWhen,
  fallback
}) => {
  function toExternal(internalValue) {
    if (persistWhen(internalValue)) {
      return internalValue;
    }
    return null;
  }
  function toInternal(externalValue, internalValue) {
    if (!externalValue) {
      return fallback(internalValue);
    }
    return externalValue;
  }
  const [internal, setInternal] = useState3(toInternal(external, null));
  useEffect3(() => {
    setInternal((prevInternal) => toInternal(external, prevInternal));
  }, [external]);
  const setInternalValue = (setter, options, meta) => {
    const setterFn = typeof setter === "function" ? setter : () => setter;
    const updated = setterFn(internal);
    setInternal(updated);
    setExternal(toExternal(updated), options, meta);
  };
  return [internal, setInternalValue];
};

// src/controls/size-control.tsx
var defaultSelectedUnit = {
  length: "px",
  angle: "deg",
  time: "ms"
};
var defaultUnits = {
  length: [...lengthUnits],
  angle: [...angleUnits],
  time: [...timeUnits]
};
var CUSTOM_SIZE_LABEL = "fx";
var SizeControl = createControl(
  ({
    variant = "length",
    defaultUnit,
    units: units2,
    placeholder,
    startIcon,
    anchorRef,
    extendedOptions,
    disableCustom,
    min = 0,
    enablePropTypeUnits = false,
    id,
    ariaLabel
  }) => {
    const {
      value: sizeValue,
      setValue: setSizeValue,
      disabled,
      restoreValue,
      placeholder: externalPlaceholder,
      propType
    } = useBoundProp(sizePropTypeUtil2);
    const actualDefaultUnit = defaultUnit ?? externalPlaceholder?.unit ?? defaultSelectedUnit[variant];
    const activeBreakpoint = useActiveBreakpoint();
    const actualExtendedOptions = useSizeExtendedOptions(extendedOptions || [], disableCustom ?? false);
    const actualUnits = resolveUnits(propType, enablePropTypeUnits, variant, units2, actualExtendedOptions);
    const popupState = usePopupState2({ variant: "popover" });
    const memorizedExternalState = useMemo2(
      () => createStateFromSizeProp(sizeValue, actualDefaultUnit),
      [sizeValue, actualDefaultUnit]
    );
    const [state, setState] = useSyncExternalState({
      external: memorizedExternalState,
      setExternal: (newState, options, meta) => setSizeValue(extractValueFromState(newState), options, meta),
      persistWhen: (newState) => !!extractValueFromState(newState),
      fallback: (newState) => ({
        unit: newState?.unit ?? actualDefaultUnit,
        numeric: newState?.numeric ?? DEFAULT_SIZE,
        custom: newState?.custom ?? ""
      })
    });
    const { size: controlSize = DEFAULT_SIZE, unit: controlUnit = actualDefaultUnit } = extractValueFromState(state, true) || {};
    const handleUnitChange = (newUnit) => {
      if (newUnit === "custom") {
        popupState.open(anchorRef?.current);
      }
      setState((prev) => ({ ...prev, unit: newUnit }));
    };
    const handleSizeChange = (event) => {
      const size = event.target.value;
      const isInputValid = event.target.validity.valid;
      if (controlUnit === "auto") {
        setState((prev) => ({ ...prev, unit: controlUnit }));
        return;
      }
      setState(
        (prev) => ({
          ...prev,
          [controlUnit === "custom" ? "custom" : "numeric"]: formatSize(size, controlUnit),
          unit: controlUnit
        }),
        void 0,
        { validation: () => isInputValid }
      );
    };
    const onInputClick = (event) => {
      if (event.target.closest("input") && "custom" === state.unit) {
        popupState.open(anchorRef?.current);
      }
    };
    const maybeClosePopup = React20.useCallback(() => {
      if (popupState && popupState.isOpen) {
        popupState.close();
      }
    }, [popupState]);
    useEffect4(() => {
      maybeClosePopup();
    }, [activeBreakpoint]);
    return /* @__PURE__ */ React20.createElement(React20.Fragment, null, /* @__PURE__ */ React20.createElement(
      SizeInput,
      {
        disabled,
        size: controlSize,
        unit: controlUnit,
        units: [...actualUnits],
        placeholder,
        startIcon,
        handleSizeChange,
        handleUnitChange,
        onBlur: restoreValue,
        onClick: onInputClick,
        popupState,
        min,
        id,
        ariaLabel
      }
    ), anchorRef?.current && popupState.isOpen && /* @__PURE__ */ React20.createElement(
      TextFieldPopover,
      {
        popupState,
        anchorRef,
        restoreValue,
        value: controlSize,
        onChange: handleSizeChange
      }
    ));
  }
);
function resolveUnits(propType, enablePropTypeUnits, variant, externalUnits, actualExtendedOptions) {
  const fallback = [...defaultUnits[variant]];
  if (!enablePropTypeUnits) {
    return [...externalUnits ?? fallback, ...actualExtendedOptions || []];
  }
  return propType.settings?.available_units ?? fallback;
}
function formatSize(size, unit) {
  if (isUnitExtendedOption(unit)) {
    return unit === "auto" ? "" : String(size ?? "");
  }
  return size || size === 0 ? Number(size) : NaN;
}
function createStateFromSizeProp(sizeValue, defaultUnit, defaultSize = "", customState = "") {
  const unit = sizeValue?.unit ?? defaultUnit;
  const size = sizeValue?.size ?? defaultSize;
  return {
    numeric: !isUnitExtendedOption(unit) && !isNaN(Number(size)) && (size || size === 0) ? Number(size) : DEFAULT_SIZE,
    custom: unit === "custom" ? String(size) : customState,
    unit
  };
}
function extractValueFromState(state, allowEmpty = false) {
  if (!state) {
    return null;
  }
  if (!state?.unit) {
    return { size: DEFAULT_SIZE, unit: DEFAULT_UNIT };
  }
  const { unit } = state;
  if (unit === "auto") {
    return { size: "", unit };
  }
  if (unit === "custom") {
    return { size: state.custom ?? "", unit: "custom" };
  }
  const numeric = state.numeric;
  if (!allowEmpty && (numeric === void 0 || numeric === null || Number.isNaN(numeric))) {
    return null;
  }
  return {
    size: numeric,
    unit
  };
}

// src/controls/stroke-control.tsx
import * as React23 from "react";
import { forwardRef as forwardRef3, useRef as useRef3 } from "react";
import { strokePropTypeUtil } from "@elementor/editor-props";
import { Grid as Grid2 } from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";

// src/components/section-content.tsx
import * as React21 from "react";
import { Stack as Stack4 } from "@elementor/ui";
var SectionContent = ({ gap = 0.5, sx, children }) => /* @__PURE__ */ React21.createElement(Stack4, { gap, sx: { ...sx } }, children);

// src/controls/color-control.tsx
import * as React22 from "react";
import { colorPropTypeUtil } from "@elementor/editor-props";
import { UnstableColorField } from "@elementor/ui";
var ColorControl = createControl(
  ({ propTypeUtil = colorPropTypeUtil, anchorEl, slotProps = {}, id, ...props }) => {
    const { value, setValue, placeholder: boundPropPlaceholder, disabled } = useBoundProp(propTypeUtil);
    const placeholder = props.placeholder ?? boundPropPlaceholder;
    const handleChange = (selectedColor) => {
      setValue(selectedColor || null);
    };
    return /* @__PURE__ */ React22.createElement(ControlActions, null, /* @__PURE__ */ React22.createElement(
      UnstableColorField,
      {
        id,
        size: "tiny",
        fullWidth: true,
        value: value ?? "",
        placeholder: placeholder ?? "",
        onChange: handleChange,
        ...props,
        disabled,
        slotProps: {
          ...slotProps,
          colorPicker: {
            anchorEl,
            anchorOrigin: {
              vertical: "top",
              horizontal: "right"
            },
            transformOrigin: {
              vertical: "top",
              horizontal: -10
            },
            slotProps: {
              colorIndicator: {
                value: value ?? placeholder ?? ""
              },
              colorBox: {
                value: value ?? placeholder ?? ""
              }
            }
          }
        }
      }
    ));
  }
);

// src/controls/stroke-control.tsx
var units = ["px", "em", "rem"];
var StrokeControl = createControl(() => {
  const propContext = useBoundProp(strokePropTypeUtil);
  const rowRef = useRef3(null);
  return /* @__PURE__ */ React23.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React23.createElement(SectionContent, null, /* @__PURE__ */ React23.createElement(Control, { bind: "width", label: __4("Stroke width", "elementor"), ref: rowRef }, /* @__PURE__ */ React23.createElement(SizeControl, { units, anchorRef: rowRef })), /* @__PURE__ */ React23.createElement(Control, { bind: "color", label: __4("Stroke color", "elementor") }, /* @__PURE__ */ React23.createElement(ColorControl, null))));
});
var Control = forwardRef3(({ bind, label, children }, ref) => /* @__PURE__ */ React23.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React23.createElement(Grid2, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap", ref }, /* @__PURE__ */ React23.createElement(Grid2, { item: true, xs: 6 }, /* @__PURE__ */ React23.createElement(ControlFormLabel, null, label)), /* @__PURE__ */ React23.createElement(Grid2, { item: true, xs: 6 }, children))));

// src/controls/box-shadow-repeater-control.tsx
import * as React39 from "react";
import { useRef as useRef4 } from "react";
import { boxShadowPropTypeUtil, shadowPropTypeUtil } from "@elementor/editor-props";
import { FormLabel as FormLabel2, Grid as Grid4, styled as styled3, UnstableColorIndicator } from "@elementor/ui";
import { __ as __11 } from "@wordpress/i18n";

// src/components/control-repeater/actions/tooltip-add-item-action.tsx
import * as React25 from "react";
import { PlusIcon } from "@elementor/icons";
import { Box as Box2, IconButton, Infotip } from "@elementor/ui";
import { __ as __5, sprintf } from "@wordpress/i18n";

// src/components/control-repeater/context/repeater-context.tsx
import * as React24 from "react";
import { createContext as createContext7, useMemo as useMemo3, useState as useState4 } from "react";
import { usePopupState as usePopupState3 } from "@elementor/ui";

// src/services/event-bus.ts
var EventBus = class {
  listeners = /* @__PURE__ */ new Map();
  subscribe(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, /* @__PURE__ */ new Set());
    }
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.add(callback);
    }
  }
  unsubscribe(eventName, callback) {
    const eventListeners = this.listeners.get(eventName);
    if (!eventListeners) {
      return;
    }
    eventListeners.delete(callback);
    if (eventListeners.size === 0) {
      this.listeners.delete(eventName);
    }
  }
  emit(eventName, data) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }
  clearAll() {
    this.listeners.clear();
  }
};
var eventBus = new EventBus();

// src/components/control-repeater/context/item-context.tsx
import { createContext as createContext6 } from "react";
var ItemContext = createContext6({
  index: -1,
  value: {}
});

// src/components/control-repeater/context/repeater-context.tsx
var RepeaterContext = createContext7(null);
var EMPTY_OPEN_ITEM = -1;
var useRepeaterContext = () => {
  const context = React24.useContext(RepeaterContext);
  const itemContext = React24.useContext(ItemContext);
  if (!context) {
    throw new Error("useRepeaterContext must be used within a RepeaterContextProvider");
  }
  return { ...context, ...itemContext };
};
var RepeaterContextProvider = ({
  children,
  initial,
  propTypeUtil,
  isItemDisabled: isItemDisabled2 = () => false
}) => {
  const { value: repeaterValues, setValue: setRepeaterValues } = useBoundProp(propTypeUtil);
  const [items2, setItems] = useSyncExternalState({
    external: repeaterValues,
    fallback: () => [],
    setExternal: setRepeaterValues,
    persistWhen: () => true
  });
  const [uniqueKeys, setUniqueKeys] = useState4(() => {
    return items2?.map(() => generateUniqueKey()) ?? [];
  });
  React24.useEffect(() => {
    const nextLength = items2?.length ?? 0;
    setUniqueKeys((prev) => {
      const prevLength = prev.length;
      if (prevLength === nextLength) {
        return prev;
      }
      if (prevLength > nextLength) {
        return prev.slice(0, nextLength);
      }
      return [...prev, ...Array.from({ length: nextLength - prevLength }, generateUniqueKey)];
    });
  }, [items2?.length]);
  const itemsWithKeys = useMemo3(
    () => uniqueKeys.map((key, index) => ({
      key,
      item: items2[index]
    })).filter(({ item }) => item !== void 0),
    [uniqueKeys, items2]
  );
  const handleSetItems = (newItemsWithKeys) => {
    setItems(newItemsWithKeys.map(({ item }) => item));
  };
  const [openItemIndex, setOpenItemIndex] = useState4(EMPTY_OPEN_ITEM);
  const [rowRef, setRowRef] = useState4(null);
  const isOpen = openItemIndex !== EMPTY_OPEN_ITEM;
  const popoverState = usePopupState3({ variant: "popover" });
  const addItem = (ev, config) => {
    const item = config?.item ?? { ...initial };
    const newIndex = config?.index ?? items2.length;
    const newKey = generateUniqueKey();
    const newItems = [...items2];
    newItems.splice(newIndex, 0, item);
    setItems(newItems);
    setUniqueKeys([...uniqueKeys.slice(0, newIndex), newKey, ...uniqueKeys.slice(newIndex)]);
    setOpenItemIndex(newIndex);
    popoverState.open(rowRef ?? ev);
    eventBus.emit(`${propTypeUtil.key}-item-added`, {
      itemValue: initial.value
    });
  };
  const removeItem = (index) => {
    const itemToRemove = items2[index];
    setItems(items2.filter((_, pos) => pos !== index));
    setUniqueKeys(uniqueKeys.filter((_, pos) => pos !== index));
    eventBus.emit(`${propTypeUtil.key}-item-removed`, {
      itemValue: itemToRemove?.value
    });
  };
  const updateItem = (updatedItem, index) => {
    const newItems = [...items2.slice(0, index), updatedItem, ...items2.slice(index + 1)];
    setItems(newItems);
  };
  return /* @__PURE__ */ React24.createElement(
    RepeaterContext.Provider,
    {
      value: {
        isOpen,
        openItemIndex,
        setOpenItemIndex,
        items: itemsWithKeys ?? [],
        setItems: handleSetItems,
        popoverState,
        initial,
        updateItem,
        addItem,
        removeItem,
        rowRef,
        setRowRef,
        isItemDisabled: (index) => isItemDisabled2(itemsWithKeys[index].item)
      }
    },
    children
  );
};
var generateUniqueKey = () => {
  return Date.now() + Math.floor(Math.random() * 1e6);
};

// src/components/control-repeater/actions/tooltip-add-item-action.tsx
var SIZE2 = "tiny";
var TooltipAddItemAction = ({
  disabled = false,
  enableTooltip = false,
  tooltipContent = null,
  newItemIndex,
  ariaLabel
}) => {
  const { addItem } = useRepeaterContext();
  const onClick = (ev) => addItem(ev, { index: newItemIndex });
  return /* @__PURE__ */ React25.createElement(ConditionalToolTip, { content: tooltipContent, enable: enableTooltip }, /* @__PURE__ */ React25.createElement(Box2, { component: "span", sx: { cursor: disabled ? "not-allowed" : "pointer" } }, /* @__PURE__ */ React25.createElement(
    IconButton,
    {
      size: SIZE2,
      disabled,
      onClick,
      "aria-label": sprintf(__5("Add %s item", "elementor"), ariaLabel?.toLowerCase())
    },
    /* @__PURE__ */ React25.createElement(PlusIcon, { fontSize: SIZE2 })
  )));
};
var ConditionalToolTip = ({
  children,
  enable,
  content
}) => enable && content ? /* @__PURE__ */ React25.createElement(Infotip, { placement: "right", color: "secondary", content }, children) : children;

// src/components/control-repeater/items/items-container.tsx
import * as React27 from "react";

// src/components/repeater/sortable.tsx
import * as React26 from "react";
import { GripVerticalIcon } from "@elementor/icons";
import {
  Divider,
  List,
  ListItem,
  styled as styled2,
  UnstableSortableItem,
  UnstableSortableProvider
} from "@elementor/ui";
import { __ as __6 } from "@wordpress/i18n";
var SortableProvider = (props) => {
  return /* @__PURE__ */ React26.createElement(List, { sx: { p: 0, my: -0.5, mx: 0 } }, /* @__PURE__ */ React26.createElement(UnstableSortableProvider, { restrictAxis: true, disableDragOverlay: false, variant: "static", ...props }));
};
var SortableItem = ({ id, children, disabled }) => {
  return /* @__PURE__ */ React26.createElement(
    UnstableSortableItem,
    {
      id,
      disabled,
      render: ({
        itemProps,
        triggerProps,
        itemStyle,
        triggerStyle,
        showDropIndication,
        dropIndicationStyle
      }) => {
        return /* @__PURE__ */ React26.createElement(StyledListItem, { ...itemProps, style: itemStyle, tabIndex: -1 }, !disabled && /* @__PURE__ */ React26.createElement(SortableTrigger, { ...triggerProps, style: triggerStyle }), children, showDropIndication && /* @__PURE__ */ React26.createElement(StyledDivider, { style: dropIndicationStyle }));
      }
    }
  );
};
var StyledListItem = styled2(ListItem)`
	position: relative;
	margin-inline: 0px;
	padding-inline: 0px;
	padding-block: ${({ theme }) => theme.spacing(0.5)};

	& .class-item-sortable-trigger {
		color: ${({ theme }) => theme.palette.action.active};
		height: 100%;
		display: flex;
		align-items: center;
		visibility: hidden;
		position: absolute;
		top: 50%;
		padding-inline-end: ${({ theme }) => theme.spacing(0.5)};
		transform: translate( -75%, -50% );
	}

	&[aria-describedby=''] > .MuiTag-root {
		background-color: ${({ theme }) => theme.palette.background.paper};
		box-shadow: ${({ theme }) => theme.shadows[3]};
	}

	&:hover,
	&:focus-within {
		& .class-item-sortable-trigger {
			visibility: visible;
		}
	}
`;
var SortableTrigger = (props) => /* @__PURE__ */ React26.createElement(
  "div",
  {
    ...props,
    role: "button",
    className: "class-item-sortable-trigger",
    tabIndex: 0,
    "aria-label": __6("Drag item", "elementor")
  },
  /* @__PURE__ */ React26.createElement(GripVerticalIcon, { fontSize: "tiny" })
);
var StyledDivider = styled2(Divider)`
	height: 0px;
	border: none;
	overflow: visible;

	&:after {
		--height: 2px;
		content: '';
		display: block;
		width: 100%;
		height: var( --height );
		margin-block: calc( -1 * var( --height ) / 2 );
		border-radius: ${({ theme }) => theme.spacing(0.5)};
		background-color: ${({ theme }) => theme.palette.text.primary};
	}
`;

// src/components/control-repeater/items/items-container.tsx
var ItemsContainer = ({
  isSortable = true,
  children
}) => {
  const { items: items2, setItems } = useRepeaterContext();
  const keys = items2.map(({ key }) => key);
  if (!children) {
    return null;
  }
  const onChangeOrder = (newKeys) => {
    setItems(
      newKeys.map((key) => {
        const index = items2.findIndex((item) => item.key === key);
        return items2[index];
      })
    );
  };
  return /* @__PURE__ */ React27.createElement(React27.Fragment, null, /* @__PURE__ */ React27.createElement(SortableProvider, { value: keys, onChange: onChangeOrder }, keys.map((key, index) => {
    const value = items2[index].item;
    return /* @__PURE__ */ React27.createElement(SortableItem, { id: key, key: `sortable-${key}`, disabled: !isSortable }, /* @__PURE__ */ React27.createElement(ItemContext.Provider, { value: { index, value } }, children));
  })));
};

// src/components/control-repeater/items/item.tsx
import * as React29 from "react";
import { bindTrigger as bindTrigger2 } from "@elementor/ui";
import { __ as __7 } from "@wordpress/i18n";

// src/hooks/use-repeatable-control-context.ts
import { createContext as createContext8, useContext as useContext7 } from "react";
var RepeatableControlContext = createContext8(void 0);
var useRepeatableControlContext = () => {
  const context = useContext7(RepeatableControlContext);
  if (!context) {
    throw new Error("useRepeatableControlContext must be used within RepeatableControl");
  }
  return context;
};

// src/components/repeater/repeater-tag.tsx
import * as React28 from "react";
import { forwardRef as forwardRef4 } from "react";
import { UnstableTag } from "@elementor/ui";
var RepeaterTag = forwardRef4((props, ref) => {
  return /* @__PURE__ */ React28.createElement(
    UnstableTag,
    {
      ref,
      fullWidth: true,
      showActionsOnHover: true,
      variant: "outlined",
      sx: { minHeight: (theme) => theme.spacing(3.5) },
      ...props
    }
  );
});

// src/components/control-repeater/locations.ts
import { createLocation, createReplaceableLocation } from "@elementor/locations";
var { Slot: RepeaterItemIconSlot, inject: injectIntoRepeaterItemIcon } = createReplaceableLocation();
var { Slot: RepeaterItemLabelSlot, inject: injectIntoRepeaterItemLabel } = createReplaceableLocation();
var { Slot: RepeaterItemActionsSlot, inject: injectIntoRepeaterItemActions } = createLocation();

// src/components/control-repeater/items/item.tsx
var Item = ({ Label: Label3, Icon, actions }) => {
  const {
    popoverState,
    setRowRef,
    openItemIndex,
    setOpenItemIndex,
    index = -1,
    value,
    isItemDisabled: isItemDisabled2
  } = useRepeaterContext();
  const repeatableContext = React29.useContext(RepeatableControlContext);
  const disableOpen = !!repeatableContext?.props?.readOnly;
  const triggerProps = bindTrigger2(popoverState);
  const onClick = (ev) => {
    if (disableOpen || isItemDisabled2(index)) {
      return;
    }
    triggerProps.onClick(ev);
    setOpenItemIndex(index);
  };
  const setRef = (ref) => {
    if (!ref || openItemIndex !== index || ref === popoverState.anchorEl) {
      return;
    }
    setRowRef(ref);
    popoverState.setAnchorEl(ref);
  };
  return /* @__PURE__ */ React29.createElement(
    RepeaterTag,
    {
      ref: setRef,
      label: /* @__PURE__ */ React29.createElement(RepeaterItemLabelSlot, { value }, /* @__PURE__ */ React29.createElement(Label3, { value })),
      "aria-label": __7("Open item", "elementor"),
      ...triggerProps,
      onClick,
      startIcon: /* @__PURE__ */ React29.createElement(RepeaterItemIconSlot, { value }, /* @__PURE__ */ React29.createElement(Icon, { value })),
      sx: {
        minHeight: (theme) => theme.spacing(3.5),
        ...isItemDisabled2(index) && {
          '[role="button"]': {
            cursor: "not-allowed"
          }
        }
      },
      actions: /* @__PURE__ */ React29.createElement(React29.Fragment, null, /* @__PURE__ */ React29.createElement(RepeaterItemActionsSlot, { index: index ?? -1 }), actions)
    }
  );
};

// src/components/control-repeater/control-repeater.tsx
import * as React30 from "react";
var ControlRepeater = ({
  children,
  initial,
  propTypeUtil,
  isItemDisabled: isItemDisabled2
}) => {
  return /* @__PURE__ */ React30.createElement(SectionContent, null, /* @__PURE__ */ React30.createElement(
    RepeaterContextProvider,
    {
      initial,
      propTypeUtil,
      isItemDisabled: isItemDisabled2
    },
    children
  ));
};

// src/components/control-repeater/actions/disable-item-action.tsx
import * as React31 from "react";
import { EyeIcon, EyeOffIcon } from "@elementor/icons";
import { IconButton as IconButton2, Tooltip } from "@elementor/ui";
import { __ as __8 } from "@wordpress/i18n";
var SIZE3 = "tiny";
var DisableItemAction = () => {
  const { items: items2, updateItem, index = -1 } = useRepeaterContext();
  if (index === -1) {
    return null;
  }
  const propDisabled = items2[index].item.disabled ?? false;
  const toggleLabel = propDisabled ? __8("Show", "elementor") : __8("Hide", "elementor");
  const onClick = () => {
    const self = structuredClone(items2[index].item);
    self.disabled = !self.disabled;
    if (!self.disabled) {
      delete self.disabled;
    }
    updateItem(self, index);
  };
  return /* @__PURE__ */ React31.createElement(Tooltip, { title: toggleLabel, placement: "top" }, /* @__PURE__ */ React31.createElement(IconButton2, { size: SIZE3, onClick, "aria-label": toggleLabel }, propDisabled ? /* @__PURE__ */ React31.createElement(EyeOffIcon, { fontSize: SIZE3 }) : /* @__PURE__ */ React31.createElement(EyeIcon, { fontSize: SIZE3 })));
};

// src/components/control-repeater/actions/duplicate-item-action.tsx
import * as React32 from "react";
import { CopyIcon } from "@elementor/icons";
import { IconButton as IconButton3, Tooltip as Tooltip2 } from "@elementor/ui";
import { __ as __9 } from "@wordpress/i18n";
var SIZE4 = "tiny";
var DuplicateItemAction = () => {
  const { items: items2, addItem, index = -1, isItemDisabled: isItemDisabled2 } = useRepeaterContext();
  if (index === -1) {
    return null;
  }
  const duplicateLabel = __9("Duplicate", "elementor");
  const item = items2[index]?.item;
  const onClick = (ev) => {
    const newItem = structuredClone(item);
    addItem(ev, { item: newItem, index: index + 1 });
  };
  return /* @__PURE__ */ React32.createElement(Tooltip2, { title: duplicateLabel, placement: "top" }, /* @__PURE__ */ React32.createElement(
    IconButton3,
    {
      size: SIZE4,
      onClick,
      "aria-label": duplicateLabel,
      disabled: isItemDisabled2(index)
    },
    /* @__PURE__ */ React32.createElement(CopyIcon, { fontSize: SIZE4 })
  ));
};

// src/components/control-repeater/actions/remove-item-action.tsx
import * as React33 from "react";
import { XIcon } from "@elementor/icons";
import { IconButton as IconButton4, Tooltip as Tooltip3 } from "@elementor/ui";
import { __ as __10 } from "@wordpress/i18n";
var SIZE5 = "tiny";
var RemoveItemAction = () => {
  const { removeItem, index = -1 } = useRepeaterContext();
  if (index === -1) {
    return null;
  }
  const removeLabel = __10("Remove", "elementor");
  const onClick = () => removeItem(index);
  return /* @__PURE__ */ React33.createElement(Tooltip3, { title: removeLabel, placement: "top" }, /* @__PURE__ */ React33.createElement(IconButton4, { size: SIZE5, onClick, "aria-label": removeLabel }, /* @__PURE__ */ React33.createElement(XIcon, { fontSize: SIZE5 })));
};

// src/components/control-repeater/items/edit-item-popover.tsx
import * as React35 from "react";
import { bindPopover as bindPopover2, Box as Box3 } from "@elementor/ui";

// src/components/repeater/repeater-popover.tsx
import * as React34 from "react";
import { Popover as Popover2 } from "@elementor/ui";
var RepeaterPopover = ({ children, width, ...props }) => {
  return /* @__PURE__ */ React34.createElement(
    Popover2,
    {
      disablePortal: true,
      disableEnforceFocus: true,
      anchorOrigin: { vertical: "bottom", horizontal: "left" },
      slotProps: {
        paper: {
          sx: { marginBlockStart: 0.5, width, overflow: "visible" }
        }
      },
      ...props
    },
    children
  );
};

// src/components/control-repeater/items/edit-item-popover.tsx
var EditItemPopover = ({ children }) => {
  const { popoverState, openItemIndex, isOpen, rowRef, setOpenItemIndex, setRowRef } = useRepeaterContext();
  if (!isOpen || !rowRef) {
    return null;
  }
  const onClose = () => {
    setRowRef(null);
    popoverState.setAnchorEl(null);
    setOpenItemIndex(EMPTY_OPEN_ITEM);
  };
  return /* @__PURE__ */ React35.createElement(RepeaterPopover, { width: rowRef.offsetWidth, ...bindPopover2(popoverState), onClose }, /* @__PURE__ */ React35.createElement(PropKeyProvider, { bind: String(openItemIndex) }, /* @__PURE__ */ React35.createElement(Box3, null, children)));
};

// src/components/popover-content.tsx
import * as React36 from "react";
import { Stack as Stack5 } from "@elementor/ui";
var PopoverContent = ({ gap = 1.5, children, ...props }) => /* @__PURE__ */ React36.createElement(Stack5, { ...props, gap }, children);

// src/components/popover-grid-container.tsx
import { forwardRef as forwardRef5 } from "react";
import * as React37 from "react";
import { Grid as Grid3 } from "@elementor/ui";
var PopoverGridContainer = forwardRef5(
  ({ gap = 1.5, alignItems = "center", flexWrap = "nowrap", children }, ref) => /* @__PURE__ */ React37.createElement(Grid3, { container: true, gap, alignItems, flexWrap, ref }, children)
);

// src/components/repeater/repeater-header.tsx
import * as React38 from "react";
import { forwardRef as forwardRef6 } from "react";
import { Box as Box4, Stack as Stack6, Typography as Typography2 } from "@elementor/ui";
var RepeaterHeader = forwardRef6(
  ({
    label,
    children,
    adornment: Adornment = ControlAdornments
  }, ref) => {
    return /* @__PURE__ */ React38.createElement(
      Stack6,
      {
        direction: "row",
        alignItems: "center",
        gap: 1,
        sx: { marginInlineEnd: -0.75, py: 0.25 },
        ref
      },
      /* @__PURE__ */ React38.createElement(Box4, { display: "flex", alignItems: "center", gap: 1, sx: { flexGrow: 1 } }, /* @__PURE__ */ React38.createElement(Typography2, { component: "label", variant: "caption", color: "text.secondary", sx: { lineHeight: 1 } }, label), /* @__PURE__ */ React38.createElement(Adornment, null)),
      children
    );
  }
);

// src/controls/box-shadow-repeater-control.tsx
var BoxShadowRepeaterControl = createControl(() => {
  const { propType, value, setValue, disabled } = useBoundProp(boxShadowPropTypeUtil);
  return /* @__PURE__ */ React39.createElement(PropProvider, { propType, value, setValue, isDisabled: () => disabled }, /* @__PURE__ */ React39.createElement(ControlRepeater, { initial: initialShadow, propTypeUtil: boxShadowPropTypeUtil }, /* @__PURE__ */ React39.createElement(RepeaterHeader, { label: __11("Box shadow", "elementor") }, /* @__PURE__ */ React39.createElement(TooltipAddItemAction, { newItemIndex: 0, disabled, ariaLabel: "Box shadow" })), /* @__PURE__ */ React39.createElement(ItemsContainer, null, /* @__PURE__ */ React39.createElement(
    Item,
    {
      Icon: ItemIcon,
      Label: ItemLabel,
      actions: /* @__PURE__ */ React39.createElement(React39.Fragment, null, /* @__PURE__ */ React39.createElement(DuplicateItemAction, null), /* @__PURE__ */ React39.createElement(DisableItemAction, null), /* @__PURE__ */ React39.createElement(RemoveItemAction, null))
    }
  )), /* @__PURE__ */ React39.createElement(EditItemPopover, null, /* @__PURE__ */ React39.createElement(Content, null))));
});
var StyledUnstableColorIndicator = styled3(UnstableColorIndicator)(({ theme }) => ({
  height: "1rem",
  width: "1rem",
  borderRadius: `${theme.shape.borderRadius / 2}px`
}));
var ItemIcon = ({ value }) => /* @__PURE__ */ React39.createElement(StyledUnstableColorIndicator, { size: "inherit", component: "span", value: value.value.color?.value });
var Content = () => {
  const context = useBoundProp(shadowPropTypeUtil);
  const rowRef = [useRef4(null), useRef4(null)];
  const { rowRef: anchorEl } = useRepeaterContext();
  return /* @__PURE__ */ React39.createElement(PropProvider, { ...context }, /* @__PURE__ */ React39.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React39.createElement(PopoverGridContainer, null, /* @__PURE__ */ React39.createElement(Control2, { bind: "color", label: __11("Color", "elementor") }, /* @__PURE__ */ React39.createElement(ColorControl, { anchorEl })), /* @__PURE__ */ React39.createElement(Control2, { bind: "position", label: __11("Position", "elementor"), sx: { overflow: "hidden" } }, /* @__PURE__ */ React39.createElement(
    SelectControl,
    {
      options: [
        { label: __11("Inset", "elementor"), value: "inset" },
        { label: __11("Outset", "elementor"), value: null }
      ]
    }
  ))), /* @__PURE__ */ React39.createElement(PopoverGridContainer, { ref: rowRef[0] }, /* @__PURE__ */ React39.createElement(Control2, { bind: "hOffset", label: __11("Horizontal", "elementor") }, /* @__PURE__ */ React39.createElement(SizeControl, { anchorRef: rowRef[0] })), /* @__PURE__ */ React39.createElement(Control2, { bind: "vOffset", label: __11("Vertical", "elementor") }, /* @__PURE__ */ React39.createElement(SizeControl, { anchorRef: rowRef[0] }))), /* @__PURE__ */ React39.createElement(PopoverGridContainer, { ref: rowRef[1] }, /* @__PURE__ */ React39.createElement(Control2, { bind: "blur", label: __11("Blur", "elementor") }, /* @__PURE__ */ React39.createElement(SizeControl, { anchorRef: rowRef[1] })), /* @__PURE__ */ React39.createElement(Control2, { bind: "spread", label: __11("Spread", "elementor") }, /* @__PURE__ */ React39.createElement(SizeControl, { anchorRef: rowRef[1] })))));
};
var Control2 = ({
  label,
  bind,
  children,
  sx
}) => /* @__PURE__ */ React39.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React39.createElement(Grid4, { item: true, xs: 6, sx }, /* @__PURE__ */ React39.createElement(Grid4, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React39.createElement(Grid4, { item: true, xs: 12 }, /* @__PURE__ */ React39.createElement(FormLabel2, { size: "tiny" }, label)), /* @__PURE__ */ React39.createElement(Grid4, { item: true, xs: 12 }, children))));
var ItemLabel = ({ value }) => {
  const { position, hOffset, vOffset, blur, spread } = value.value;
  const { size: blurSize = "", unit: blurUnit = "" } = blur?.value || {};
  const { size: spreadSize = "", unit: spreadUnit = "" } = spread?.value || {};
  const { size: hOffsetSize = "unset", unit: hOffsetUnit = "" } = hOffset?.value || {};
  const { size: vOffsetSize = "unset", unit: vOffsetUnit = "" } = vOffset?.value || {};
  const positionLabel = position?.value || "outset";
  const sizes = [
    [hOffsetSize, hOffsetUnit],
    [vOffsetSize, vOffsetUnit],
    [blurSize, blurUnit],
    [spreadSize, spreadUnit]
  ].map(([size, unit]) => {
    if (unit !== "custom") {
      return size + unit;
    }
    return !size ? CUSTOM_SIZE_LABEL : size;
  }).join(" ");
  return /* @__PURE__ */ React39.createElement("span", { style: { textTransform: "capitalize" } }, positionLabel, ": ", sizes);
};
var initialShadow = {
  $$type: "shadow",
  value: {
    hOffset: {
      $$type: "size",
      value: { unit: "px", size: 0 }
    },
    vOffset: {
      $$type: "size",
      value: { unit: "px", size: 0 }
    },
    blur: {
      $$type: "size",
      value: { unit: "px", size: 10 }
    },
    spread: {
      $$type: "size",
      value: { unit: "px", size: 0 }
    },
    color: {
      $$type: "color",
      value: "rgba(0, 0, 0, 1)"
    },
    position: null
  }
};

// src/controls/filter-control/filter-repeater-control.tsx
import * as React48 from "react";
import {
  backdropFilterPropTypeUtil,
  filterPropTypeUtil
} from "@elementor/editor-props";
import { __ as __16 } from "@wordpress/i18n";

// src/controls/filter-control/context/filter-config-context.tsx
import * as React40 from "react";
import { createContext as createContext9, useContext as useContext9, useMemo as useMemo4 } from "react";
import { cssFilterFunctionPropUtil } from "@elementor/editor-props";

// src/controls/filter-control/utils.ts
import { __ as __13 } from "@wordpress/i18n";

// src/controls/filter-control/configs.ts
import { __ as __12 } from "@wordpress/i18n";
var FILTERS_BY_GROUP = {
  blur: {
    blur: {
      name: __12("Blur", "elementor"),
      valueName: __12("Radius", "elementor")
    }
  },
  intensity: {
    brightness: { name: __12("Brightness", "elementor") },
    contrast: { name: __12("Contrast", "elementor") },
    saturate: { name: __12("Saturate", "elementor") }
  },
  "hue-rotate": {
    "hue-rotate": {
      name: __12("Hue Rotate", "elementor"),
      valueName: __12("Angle", "elementor")
    }
  },
  "color-tone": {
    grayscale: { name: __12("Grayscale", "elementor") },
    invert: { name: __12("Invert", "elementor") },
    sepia: { name: __12("Sepia", "elementor") }
  },
  "drop-shadow": {
    "drop-shadow": { name: __12("Drop shadow", "elementor"), valueName: __12("Drop-shadow", "elementor") }
  }
};

// src/controls/filter-control/utils.ts
var AMOUNT_VALUE_NAME = __13("Amount", "elementor");
var DEFAULT_FACTORIES = {
  "drop-shadow": (propType) => buildDropShadowDefault(propType)
};
function buildFilterConfig(cssFilterPropType) {
  function createEntry(filterFunctionGroup, filterFunction, { name, valueName }) {
    const propType = extractPropType(cssFilterPropType, filterFunctionGroup);
    const value = DEFAULT_FACTORIES[filterFunction]?.(propType) ?? buildSizeDefault(propType);
    const defaultValue = createDefaultValue({
      filterFunction,
      filterFunctionGroup,
      value
    });
    return [
      filterFunction,
      {
        name,
        valueName: valueName ?? AMOUNT_VALUE_NAME,
        defaultValue,
        filterFunctionGroup
      }
    ];
  }
  const entries = Object.entries(FILTERS_BY_GROUP).flatMap(
    ([filterFunctionGroup, group]) => Object.entries(group).map(
      ([filterFunction, meta]) => createEntry(filterFunctionGroup, filterFunction, meta)
    )
  );
  return Object.fromEntries(entries);
}
function createDefaultValue({ filterFunction, filterFunctionGroup, value }) {
  return {
    $$type: "css-filter-func",
    value: {
      func: { $$type: "string", value: filterFunction },
      args: {
        $$type: filterFunctionGroup,
        value
      }
    }
  };
}
function buildSizeDefault(propType) {
  const sizePropType = propType?.shape?.size;
  return {
    size: sizePropType?.default
  };
}
function buildDropShadowDefault(propType) {
  const dropShadowPropType = propType.shape;
  return {
    blur: dropShadowPropType?.blur?.default,
    xAxis: dropShadowPropType?.xAxis?.default,
    yAxis: dropShadowPropType?.yAxis?.default,
    color: dropShadowPropType?.color?.default ?? (dropShadowPropType?.color).prop_types.color.default
  };
}
function extractPropType(propType, filterFunctionGroup) {
  return propType.shape?.args?.prop_types[filterFunctionGroup];
}

// src/controls/filter-control/context/filter-config-context.tsx
var FilterConfigContext = createContext9(null);
function FilterConfigProvider({ children }) {
  const propContext = useBoundProp(cssFilterFunctionPropUtil);
  const contextValue = useMemo4(() => {
    const config = buildFilterConfig(propContext.propType.item_prop_type);
    const filterOptions = Object.entries(config).map(([key, conf]) => ({
      value: key,
      label: conf.name
    }));
    return {
      config,
      filterOptions,
      getFilterFunctionConfig: (filterFunction) => config[filterFunction],
      getInitialValue: () => config.blur.defaultValue
    };
  }, [propContext.propType]);
  return /* @__PURE__ */ React40.createElement(FilterConfigContext.Provider, { value: contextValue }, children);
}
function useFilterConfig() {
  const context = useContext9(FilterConfigContext);
  if (!context) {
    throw new Error("useFilterConfig must be used within FilterConfigProvider");
  }
  return context;
}

// src/controls/filter-control/filter-content.tsx
import * as React43 from "react";
import {
  cssFilterFunctionPropUtil as cssFilterFunctionPropUtil2
} from "@elementor/editor-props";
import { Grid as Grid7 } from "@elementor/ui";
import { __ as __15 } from "@wordpress/i18n";

// src/controls/filter-control/drop-shadow/drop-shadow-item-content.tsx
import * as React41 from "react";
import { useRef as useRef5 } from "react";
import { dropShadowFilterPropTypeUtil } from "@elementor/editor-props";
import { Grid as Grid5 } from "@elementor/ui";
import { __ as __14 } from "@wordpress/i18n";
var items = [
  {
    bind: "xAxis",
    label: __14("X-axis", "elementor"),
    rowIndex: 0
  },
  {
    bind: "yAxis",
    label: __14("Y-axis", "elementor"),
    rowIndex: 0
  },
  {
    bind: "blur",
    label: __14("Blur", "elementor"),
    rowIndex: 1
  },
  {
    bind: "color",
    label: __14("Color", "elementor"),
    rowIndex: 1
  }
];
var DropShadowItemContent = ({ anchorEl }) => {
  const context = useBoundProp(dropShadowFilterPropTypeUtil);
  const rowRefs = [useRef5(null), useRef5(null)];
  return /* @__PURE__ */ React41.createElement(PropProvider, { ...context }, items.map((item) => /* @__PURE__ */ React41.createElement(PopoverGridContainer, { key: item.bind, ref: rowRefs[item.rowIndex] ?? null }, /* @__PURE__ */ React41.createElement(PropKeyProvider, { bind: item.bind }, /* @__PURE__ */ React41.createElement(Grid5, { item: true, xs: 6 }, /* @__PURE__ */ React41.createElement(ControlFormLabel, null, item.label)), /* @__PURE__ */ React41.createElement(Grid5, { item: true, xs: 6 }, item.bind === "color" ? /* @__PURE__ */ React41.createElement(ColorControl, { anchorEl }) : /* @__PURE__ */ React41.createElement(
    SizeControl,
    {
      anchorRef: rowRefs[item.rowIndex],
      enablePropTypeUnits: true,
      min: item.bind === "blur" ? 0 : -Number.MAX_SAFE_INTEGER,
      defaultUnit: "px"
    }
  ))))));
};

// src/controls/filter-control/single-size/single-size-item-content.tsx
import { useRef as useRef6 } from "react";
import * as React42 from "react";
import {
  blurFilterPropTypeUtil,
  colorToneFilterPropTypeUtil,
  hueRotateFilterPropTypeUtil,
  intensityFilterPropTypeUtil
} from "@elementor/editor-props";
import { Grid as Grid6 } from "@elementor/ui";
var propTypeMap = {
  blur: blurFilterPropTypeUtil,
  intensity: intensityFilterPropTypeUtil,
  "hue-rotate": hueRotateFilterPropTypeUtil,
  "color-tone": colorToneFilterPropTypeUtil
};
var SingleSizeItemContent = ({ filterFunc }) => {
  const rowRef = useRef6(null);
  const { getFilterFunctionConfig } = useFilterConfig();
  const { valueName, filterFunctionGroup } = getFilterFunctionConfig(filterFunc);
  const context = useBoundProp(propTypeMap[filterFunctionGroup]);
  return /* @__PURE__ */ React42.createElement(PropProvider, { ...context }, /* @__PURE__ */ React42.createElement(PropKeyProvider, { bind: filterFunctionGroup }, /* @__PURE__ */ React42.createElement(PropKeyProvider, { bind: "size" }, /* @__PURE__ */ React42.createElement(PopoverGridContainer, { ref: rowRef }, /* @__PURE__ */ React42.createElement(Grid6, { item: true, xs: 6 }, /* @__PURE__ */ React42.createElement(ControlFormLabel, null, valueName)), /* @__PURE__ */ React42.createElement(Grid6, { item: true, xs: 6 }, /* @__PURE__ */ React42.createElement(SizeControl, { anchorRef: rowRef, enablePropTypeUnits: true }))))));
};

// src/controls/filter-control/filter-content.tsx
var FilterContent = () => {
  const propContext = useBoundProp(cssFilterFunctionPropUtil2);
  const { filterOptions, getFilterFunctionConfig } = useFilterConfig();
  const handleValueChange = (value, _, meta) => {
    let newValue = structuredClone(value);
    const funcConfig = getFilterFunctionConfig(newValue?.func.value);
    if (meta?.bind === "func") {
      newValue = funcConfig.defaultValue.value;
    }
    if (!newValue.args) {
      return;
    }
    propContext.setValue(newValue);
  };
  return /* @__PURE__ */ React43.createElement(PropProvider, { ...propContext, setValue: handleValueChange }, /* @__PURE__ */ React43.createElement(PropKeyProvider, { bind: "css-filter-func" }, /* @__PURE__ */ React43.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React43.createElement(PopoverGridContainer, null, /* @__PURE__ */ React43.createElement(Grid7, { item: true, xs: 6 }, /* @__PURE__ */ React43.createElement(ControlFormLabel, null, __15("Filter", "elementor"))), /* @__PURE__ */ React43.createElement(Grid7, { item: true, xs: 6 }, /* @__PURE__ */ React43.createElement(PropKeyProvider, { bind: "func" }, /* @__PURE__ */ React43.createElement(SelectControl, { options: filterOptions })))), /* @__PURE__ */ React43.createElement(PropKeyProvider, { bind: "args" }, /* @__PURE__ */ React43.createElement(FilterValueContent, null)))));
};
var FilterValueContent = () => {
  const { openItemIndex, items: items2 } = useRepeaterContext();
  const currentItem = items2[openItemIndex];
  const filterFunc = currentItem.item.value.func.value;
  const isDropShadow = filterFunc === "drop-shadow";
  if (isDropShadow) {
    return /* @__PURE__ */ React43.createElement(DropShadowItemContent, null);
  }
  return /* @__PURE__ */ React43.createElement(SingleSizeItemContent, { filterFunc });
};

// src/controls/filter-control/filter-icon.tsx
import * as React44 from "react";
import { styled as styled4, UnstableColorIndicator as UnstableColorIndicator2 } from "@elementor/ui";
var FilterIcon = ({ value }) => {
  if (value.value.func.value !== "drop-shadow") {
    return null;
  }
  return /* @__PURE__ */ React44.createElement(
    StyledUnstableColorIndicator2,
    {
      size: "inherit",
      component: "span",
      value: value.value.args.value?.color.value
    }
  );
};
var StyledUnstableColorIndicator2 = styled4(UnstableColorIndicator2)(({ theme }) => ({
  borderRadius: `${theme.shape.borderRadius / 2}px`
}));

// src/controls/filter-control/filter-label.tsx
import * as React47 from "react";

// src/controls/filter-control/drop-shadow/drop-shadow-item-label.tsx
import * as React45 from "react";
import { Box as Box5 } from "@elementor/ui";
var DropShadowItemLabel = ({ value }) => {
  const values = value.value.args.value;
  const keys = ["xAxis", "yAxis", "blur"];
  const labels = keys.map(
    (key) => values[key]?.value?.unit !== "custom" ? `${values[key]?.value?.size ?? 0}${values[key]?.value?.unit ?? "px"}` : values[key]?.value?.size || CUSTOM_SIZE_LABEL
  );
  return /* @__PURE__ */ React45.createElement(Box5, { component: "span" }, /* @__PURE__ */ React45.createElement(Box5, { component: "span", style: { textTransform: "capitalize" } }, "Drop shadow:"), ` ${labels.join(" ")}`);
};

// src/controls/filter-control/single-size/single-size-item-label.tsx
import * as React46 from "react";
import { Box as Box6 } from "@elementor/ui";
var SingleSizeItemLabel = ({ value }) => {
  const { func, args } = value.value;
  const { getFilterFunctionConfig } = useFilterConfig();
  const { defaultValue } = getFilterFunctionConfig(func.value ?? "");
  const defaultUnit = defaultValue.value.args.value?.size?.value?.unit ?? lengthUnits[0];
  const { unit, size } = args.value.size?.value ?? { unit: defaultUnit, size: 0 };
  const label = /* @__PURE__ */ React46.createElement(Box6, { component: "span", style: { textTransform: "capitalize" } }, func.value ?? "", ":");
  return /* @__PURE__ */ React46.createElement(Box6, { component: "span" }, label, " " + (unit !== "custom" ? `${size ?? 0}${unit ?? defaultUnit}` : size || CUSTOM_SIZE_LABEL));
};

// src/controls/filter-control/filter-label.tsx
var FilterLabel = ({ value }) => {
  if (value.value.func.value === "drop-shadow") {
    return /* @__PURE__ */ React47.createElement(DropShadowItemLabel, { value });
  }
  return /* @__PURE__ */ React47.createElement(SingleSizeItemLabel, { value });
};

// src/controls/filter-control/filter-repeater-control.tsx
var FILTER_CONFIG = {
  filter: {
    propTypeUtil: filterPropTypeUtil,
    label: __16("Filters", "elementor")
  },
  "backdrop-filter": {
    propTypeUtil: backdropFilterPropTypeUtil,
    label: __16("Backdrop filters", "elementor")
  }
};
var FilterRepeaterControl = createControl(({ filterPropName = "filter" }) => {
  const { propTypeUtil, label } = ensureFilterConfig(filterPropName);
  const { propType, value: filterValues, setValue } = useBoundProp(propTypeUtil);
  return /* @__PURE__ */ React48.createElement(FilterConfigProvider, null, /* @__PURE__ */ React48.createElement(PropProvider, { propType, value: filterValues, setValue }, /* @__PURE__ */ React48.createElement(
    Repeater,
    {
      propTypeUtil,
      label,
      filterPropName
    }
  )));
});
var Repeater = ({ propTypeUtil, label, filterPropName }) => {
  const { getInitialValue: getInitialValue2 } = useFilterConfig();
  return /* @__PURE__ */ React48.createElement(ControlRepeater, { initial: getInitialValue2(), propTypeUtil }, /* @__PURE__ */ React48.createElement(RepeaterHeader, { label }, /* @__PURE__ */ React48.createElement(
    TooltipAddItemAction,
    {
      newItemIndex: 0,
      ariaLabel: filterPropName === "backdrop-filter" ? "backdrop filter" : "filter"
    }
  )), /* @__PURE__ */ React48.createElement(ItemsContainer, null, /* @__PURE__ */ React48.createElement(
    Item,
    {
      Label: FilterLabel,
      Icon: FilterIcon,
      actions: /* @__PURE__ */ React48.createElement(React48.Fragment, null, /* @__PURE__ */ React48.createElement(DuplicateItemAction, null), /* @__PURE__ */ React48.createElement(DisableItemAction, null), /* @__PURE__ */ React48.createElement(RemoveItemAction, null))
    }
  )), /* @__PURE__ */ React48.createElement(EditItemPopover, null, /* @__PURE__ */ React48.createElement(FilterContent, null)));
};
function ensureFilterConfig(name) {
  if (name && name in FILTER_CONFIG) {
    return FILTER_CONFIG[name];
  }
  return FILTER_CONFIG.filter;
}

// src/controls/select-control-wrapper.tsx
import * as React49 from "react";
import { useEffect as useEffect6, useState as useState5 } from "react";
var getOffCanvasElements = () => {
  const extendedWindow = window;
  const documentId = extendedWindow.elementor.config.document.id;
  const offCanvasElements = extendedWindow.elementor.$previewContents[0].querySelectorAll(
    `[data-elementor-id="${documentId}"] .elementor-widget-off-canvas.elementor-element-edit-mode`
  );
  return Array.from(offCanvasElements).map((offCanvasElement) => {
    return {
      label: offCanvasElement.querySelector(".e-off-canvas")?.getAttribute("aria-label") ?? "",
      value: offCanvasElement.dataset.id
    };
  });
};
var collectionMethods = {
  "off-canvas": getOffCanvasElements
};
var useDynamicOptions = (collectionId, initialOptions) => {
  const [options, setOptions] = useState5(initialOptions ?? []);
  useEffect6(() => {
    if (!collectionId || !collectionMethods[collectionId]) {
      setOptions(initialOptions ?? []);
      return;
    }
    setOptions(collectionMethods[collectionId]());
  }, [collectionId, initialOptions]);
  return options;
};
var SelectControlWrapper = createControl(
  ({ collectionId, options, ...props }) => {
    const actualOptions = useDynamicOptions(collectionId, options);
    return /* @__PURE__ */ React49.createElement(SelectControl, { options: actualOptions, ...props });
  }
);

// src/controls/chips-control.tsx
import * as React50 from "react";
import { stringArrayPropTypeUtil, stringPropTypeUtil as stringPropTypeUtil4 } from "@elementor/editor-props";
import { Autocomplete, Chip, TextField as TextField5 } from "@elementor/ui";
var SIZE6 = "tiny";
var ChipsControl = createControl(({ options }) => {
  const { value, setValue, disabled } = useBoundProp(stringArrayPropTypeUtil);
  const selectedValues = (value || []).map((item) => stringPropTypeUtil4.extract(item)).filter((val) => val !== null);
  const selectedOptions = selectedValues.map((val) => options.find((opt) => opt.value === val)).filter((opt) => opt !== void 0);
  const handleChange = (_, newValue) => {
    const values = newValue.map((option) => stringPropTypeUtil4.create(option.value));
    setValue(values.length > 0 ? values : null);
  };
  return /* @__PURE__ */ React50.createElement(ControlActions, null, /* @__PURE__ */ React50.createElement(
    Autocomplete,
    {
      fullWidth: true,
      multiple: true,
      size: SIZE6,
      disabled,
      value: selectedOptions,
      onChange: handleChange,
      options,
      getOptionLabel: (option) => option.label,
      isOptionEqualToValue: (option, val) => option.value === val.value,
      renderInput: (params) => /* @__PURE__ */ React50.createElement(TextField5, { ...params }),
      renderTags: (values, getTagProps) => values.map((option, index) => {
        const { key, ...chipProps } = getTagProps({ index });
        return /* @__PURE__ */ React50.createElement(Chip, { key, size: "tiny", label: option.label, ...chipProps });
      })
    }
  ));
});

// src/controls/toggle-control.tsx
import * as React54 from "react";
import { stringPropTypeUtil as stringPropTypeUtil5 } from "@elementor/editor-props";

// src/components/control-toggle-button-group.tsx
import * as React52 from "react";
import { useEffect as useEffect7, useMemo as useMemo5, useRef as useRef7, useState as useState6 } from "react";
import { ChevronDownIcon } from "@elementor/icons";
import {
  ListItemText,
  Menu as Menu2,
  MenuItem,
  styled as styled5,
  ToggleButton,
  ToggleButtonGroup,
  Typography as Typography3,
  useTheme
} from "@elementor/ui";

// src/components/conditional-tooltip.tsx
import * as React51 from "react";
import { Tooltip as Tooltip4 } from "@elementor/ui";
var ConditionalTooltip = ({
  showTooltip,
  children,
  label
}) => {
  return showTooltip && label ? /* @__PURE__ */ React51.createElement(Tooltip4, { title: label, disableFocusListener: true, placement: "top" }, children) : children;
};

// src/components/control-toggle-button-group.tsx
var StyledToggleButtonGroup = styled5(ToggleButtonGroup)`
	${({ justify }) => `justify-content: ${justify};`}
	button:not( :last-of-type ) {
		border-start-end-radius: 0;
		border-end-end-radius: 0;
	}
	button:not( :first-of-type ) {
		border-start-start-radius: 0;
		border-end-start-radius: 0;
	}
	button:last-of-type {
		border-start-end-radius: 8px;
		border-end-end-radius: 8px;
	}
`;
var StyledToggleButton = styled5(ToggleButton, {
  shouldForwardProp: (prop) => prop !== "isPlaceholder"
})`
	${({ theme, isPlaceholder }) => isPlaceholder && `
		color: ${theme.palette.text.tertiary};
		background-color: ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)"};

		&:hover {
			background-color: ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"};
		}
	`}
`;
var ToggleButtonGroupUi = React52.forwardRef(
  ({
    justify = "end",
    size = "tiny",
    value,
    onChange,
    items: items2,
    maxItems,
    exclusive = false,
    fullWidth = false,
    disabled,
    placeholder
  }, ref) => {
    const shouldSliceItems = exclusive && maxItems !== void 0 && items2.length > maxItems;
    const menuItems = shouldSliceItems ? items2.slice(maxItems - 1) : [];
    const fixedItems = shouldSliceItems ? items2.slice(0, maxItems - 1) : items2;
    const theme = useTheme();
    const isRtl = "rtl" === theme.direction;
    const handleChange = (_, newValue) => {
      onChange(newValue);
    };
    const getGridTemplateColumns = useMemo5(() => {
      const isOffLimits = menuItems?.length;
      const itemsCount = isOffLimits ? fixedItems.length + 1 : fixedItems.length;
      const templateColumnsSuffix = isOffLimits ? "auto" : "";
      if (fullWidth) {
        return `repeat(${itemsCount}, 1fr) ${templateColumnsSuffix}`;
      }
      return `repeat(${itemsCount}, minmax(0, 25%)) ${templateColumnsSuffix}`;
    }, [menuItems?.length, fixedItems.length, fullWidth]);
    const shouldShowExclusivePlaceholder = exclusive && (value === null || value === void 0 || value === "");
    const nonExclusiveSelectedValues = !exclusive && Array.isArray(value) ? value.map((v) => typeof v === "string" ? v : "").join(" ").trim().split(/\s+/).filter(Boolean) : [];
    const shouldShowNonExclusivePlaceholder = !exclusive && nonExclusiveSelectedValues.length === 0;
    const getPlaceholderArray = (placeholderValue) => {
      if (Array.isArray(placeholderValue)) {
        return placeholderValue.flatMap((p) => {
          if (typeof p === "string") {
            return p.trim().split(/\s+/).filter(Boolean);
          }
          return [];
        });
      }
      if (typeof placeholderValue === "string") {
        return placeholderValue.trim().split(/\s+/).filter(Boolean);
      }
      return [];
    };
    const placeholderArray = getPlaceholderArray(placeholder);
    return /* @__PURE__ */ React52.createElement(
      StyledToggleButtonGroup,
      {
        ref,
        justify,
        value,
        onChange: handleChange,
        exclusive,
        disabled,
        sx: {
          direction: isRtl ? "rtl /* @noflip */" : "ltr /* @noflip */",
          display: "grid",
          gridTemplateColumns: getGridTemplateColumns,
          width: `100%`
        }
      },
      fixedItems.map(
        ({
          label,
          value: buttonValue,
          renderContent: Content3,
          showTooltip,
          disabled: optionDisabled = false
        }) => {
          const isPlaceholder = placeholderArray.length > 0 && placeholderArray.includes(buttonValue) && (shouldShowExclusivePlaceholder || shouldShowNonExclusivePlaceholder);
          return /* @__PURE__ */ React52.createElement(
            ConditionalTooltip,
            {
              key: buttonValue,
              label,
              showTooltip: showTooltip || false
            },
            /* @__PURE__ */ React52.createElement(
              StyledToggleButton,
              {
                value: buttonValue,
                "aria-label": label,
                size,
                fullWidth,
                isPlaceholder,
                disabled: optionDisabled
              },
              /* @__PURE__ */ React52.createElement(Content3, { size })
            )
          );
        }
      ),
      menuItems.length && exclusive && /* @__PURE__ */ React52.createElement(
        SplitButtonGroup,
        {
          size,
          value: value || null,
          onChange,
          items: menuItems,
          fullWidth
        }
      )
    );
  }
);
var ControlToggleButtonGroup = (props) => {
  return /* @__PURE__ */ React52.createElement(ControlActions, null, /* @__PURE__ */ React52.createElement(ToggleButtonGroupUi, { ...props }));
};
var SplitButtonGroup = ({
  size = "tiny",
  onChange,
  items: items2,
  fullWidth,
  value
}) => {
  const previewButton = usePreviewButton(items2, value);
  const [isMenuOpen, setIsMenuOpen] = useState6(false);
  const menuButtonRef = useRef7(null);
  const onMenuToggle = (ev) => {
    setIsMenuOpen((prev) => !prev);
    ev.preventDefault();
  };
  const onMenuItemClick = (newValue) => {
    setIsMenuOpen(false);
    onToggleItem(newValue);
  };
  const onToggleItem = (newValue) => {
    const shouldRemove = newValue === value;
    onChange(shouldRemove ? null : newValue);
  };
  return /* @__PURE__ */ React52.createElement(React52.Fragment, null, /* @__PURE__ */ React52.createElement(
    ToggleButton,
    {
      value: previewButton.value,
      "aria-label": previewButton.label,
      size,
      fullWidth,
      onClick: (ev) => {
        ev.preventDefault();
        onMenuItemClick(previewButton.value);
      }
    },
    previewButton.renderContent({ size })
  ), /* @__PURE__ */ React52.createElement(
    ToggleButton,
    {
      size,
      "aria-expanded": isMenuOpen ? "true" : void 0,
      "aria-haspopup": "menu",
      "aria-pressed": void 0,
      onClick: onMenuToggle,
      ref: menuButtonRef,
      value: "__chevron-icon-button__"
    },
    /* @__PURE__ */ React52.createElement(ChevronDownIcon, { fontSize: size })
  ), /* @__PURE__ */ React52.createElement(
    Menu2,
    {
      open: isMenuOpen,
      onClose: () => setIsMenuOpen(false),
      anchorEl: menuButtonRef.current,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right"
      },
      sx: {
        mt: 0.5
      }
    },
    items2.map(({ label, value: buttonValue }) => /* @__PURE__ */ React52.createElement(
      MenuItem,
      {
        key: buttonValue,
        selected: buttonValue === value,
        onClick: () => onMenuItemClick(buttonValue)
      },
      /* @__PURE__ */ React52.createElement(ListItemText, null, /* @__PURE__ */ React52.createElement(Typography3, { sx: { fontSize: "14px" } }, label))
    ))
  ));
};
var usePreviewButton = (items2, value) => {
  const [previewButton, setPreviewButton] = useState6(
    items2.find((item) => item.value === value) ?? items2[0]
  );
  useEffect7(() => {
    const selectedButton = items2.find((item) => item.value === value);
    if (selectedButton) {
      setPreviewButton(selectedButton);
    }
  }, [items2, value]);
  return previewButton;
};

// src/utils/convert-toggle-options-to-atomic.tsx
import * as React53 from "react";
import * as Icons from "@elementor/icons";
var convertToggleOptionsToAtomic = (options) => {
  return options.map((option) => {
    const iconName = option.icon;
    const IconComponent = Icons[iconName];
    return {
      value: option.value,
      label: option.label,
      renderContent: ({ size }) => {
        if (IconComponent) {
          return /* @__PURE__ */ React53.createElement(IconComponent, { fontSize: size });
        }
        return option.label;
      },
      showTooltip: option.showTooltip,
      exclusive: option.exclusive
    };
  });
};

// src/controls/toggle-control.tsx
var ToggleControl = createControl(
  ({
    options,
    fullWidth = false,
    size = "tiny",
    exclusive = true,
    maxItems,
    convertOptions = false
  }) => {
    const { value, setValue, placeholder, disabled } = useBoundProp(stringPropTypeUtil5);
    const processedOptions = convertOptions ? convertToggleOptionsToAtomic(options) : options;
    const exclusiveValues = processedOptions.filter((option) => option.exclusive).map((option) => option.value);
    const handleNonExclusiveToggle = (selectedValues) => {
      const newSelectedValue = selectedValues[selectedValues.length - 1];
      const isNewSelectedValueExclusive = exclusiveValues.includes(newSelectedValue);
      const updatedValues = isNewSelectedValueExclusive ? [newSelectedValue] : selectedValues?.filter((val) => !exclusiveValues.includes(val));
      setValue(updatedValues?.join(" ") || null);
    };
    const toggleButtonGroupProps = {
      items: processedOptions,
      maxItems,
      fullWidth,
      size,
      placeholder
    };
    return exclusive ? /* @__PURE__ */ React54.createElement(
      ControlToggleButtonGroup,
      {
        ...toggleButtonGroupProps,
        value: value ?? null,
        onChange: setValue,
        disabled,
        exclusive: true
      }
    ) : /* @__PURE__ */ React54.createElement(
      ControlToggleButtonGroup,
      {
        ...toggleButtonGroupProps,
        value: value?.split(" ") ?? [],
        onChange: handleNonExclusiveToggle,
        disabled,
        exclusive: false
      }
    );
  }
);

// src/controls/number-control.tsx
import * as React55 from "react";
import { numberPropTypeUtil } from "@elementor/editor-props";
import { InputAdornment as InputAdornment3 } from "@elementor/ui";
var isEmptyOrNaN = (value) => value === null || value === void 0 || value === "" || Number.isNaN(Number(value));
var renderSuffix = (propType) => {
  if (propType.meta?.suffix) {
    return /* @__PURE__ */ React55.createElement(InputAdornment3, { position: "end" }, propType.meta.suffix);
  }
  return /* @__PURE__ */ React55.createElement(React55.Fragment, null);
};
var NumberControl = createControl(
  ({
    placeholder: labelPlaceholder,
    max = Number.MAX_SAFE_INTEGER,
    min = -Number.MAX_SAFE_INTEGER,
    step = 1,
    shouldForceInt = false,
    startIcon
  }) => {
    const { value, setValue, placeholder, disabled, restoreValue, propType } = useBoundProp(numberPropTypeUtil);
    const handleChange = (event) => {
      const {
        value: eventValue,
        validity: { valid: isInputValid }
      } = event.target;
      let updatedValue;
      if (isEmptyOrNaN(eventValue)) {
        updatedValue = null;
      } else {
        const formattedValue = shouldForceInt ? +parseInt(eventValue) : Number(eventValue);
        updatedValue = Math.min(
          Math.max(formattedValue, min ?? Number.MIN_SAFE_INTEGER),
          max ?? Number.MAX_SAFE_INTEGER
        );
      }
      setValue(updatedValue, void 0, { validation: () => isInputValid });
    };
    return /* @__PURE__ */ React55.createElement(ControlActions, null, /* @__PURE__ */ React55.createElement(
      NumberInput,
      {
        size: "tiny",
        type: "number",
        fullWidth: true,
        disabled,
        value: isEmptyOrNaN(value) ? "" : value,
        onInput: handleChange,
        onBlur: restoreValue,
        placeholder: labelPlaceholder ?? (isEmptyOrNaN(placeholder) ? "" : String(placeholder)),
        inputProps: { step, min },
        InputProps: {
          startAdornment: startIcon ? /* @__PURE__ */ React55.createElement(InputAdornment3, { position: "start", disabled }, startIcon) : void 0,
          endAdornment: renderSuffix(propType)
        }
      }
    ));
  }
);

// src/controls/equal-unequal-sizes-control.tsx
import * as React56 from "react";
import { useId as useId2, useRef as useRef8 } from "react";
import { bindPopover as bindPopover3, bindToggle, Box as Box7, Grid as Grid8, Popover as Popover3, Stack as Stack7, Tooltip as Tooltip5, usePopupState as usePopupState4 } from "@elementor/ui";
import { __ as __17 } from "@wordpress/i18n";
function EqualUnequalSizesControl({
  label,
  icon,
  tooltipLabel,
  items: items2,
  multiSizePropTypeUtil
}) {
  const popupId = useId2();
  const popupState = usePopupState4({ variant: "popover", popupId });
  const rowRefs = [useRef8(null), useRef8(null)];
  const { propType: multiSizePropType, disabled: multiSizeDisabled } = useBoundProp(multiSizePropTypeUtil);
  const { value: masterValue, setValue: setMasterValue, placeholder: masterPlaceholder } = useBoundProp();
  const getMultiSizeValues = (sourceValue) => {
    if (multiSizePropTypeUtil.isValid(sourceValue)) {
      return sourceValue.value;
    }
    const propValue = {};
    items2.forEach((item) => {
      propValue[item.bind] = sourceValue;
    });
    const derived = multiSizePropTypeUtil.create(propValue);
    return derived?.value;
  };
  const isShowingGeneralIndicator = !popupState.isOpen;
  const derivedValue = getMultiSizeValues(masterValue);
  const derivedPlaceholder = getMultiSizeValues(masterPlaceholder);
  const isEqualValues = (values) => {
    if (!values) {
      return true;
    }
    const multiSizeValue = multiSizePropTypeUtil.create(values);
    const propValue = {};
    items2.forEach((item) => {
      propValue[item.bind] = multiSizeValue?.value?.[item.bind] ?? null;
    });
    const allValues = Object.values(propValue).map((value) => JSON.stringify(value));
    return allValues.every((value) => value === allValues[0]);
  };
  const isMixedPlaceholder = !masterValue && !isEqualValues(derivedPlaceholder);
  const isMixed = isMixedPlaceholder || !isEqualValues(derivedValue);
  const applyMultiSizeValue = (newValue) => {
    if (!isEqualValues(newValue)) {
      setMasterValue(multiSizePropTypeUtil.create(newValue));
      return;
    }
    setMasterValue(Object.values(newValue)?.pop() ?? null);
  };
  return /* @__PURE__ */ React56.createElement(React56.Fragment, null, /* @__PURE__ */ React56.createElement(Grid8, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap", ref: rowRefs[0] }, /* @__PURE__ */ React56.createElement(Grid8, { item: true, xs: 6 }, !isShowingGeneralIndicator ? /* @__PURE__ */ React56.createElement(ControlFormLabel, null, label) : /* @__PURE__ */ React56.createElement(ControlLabel, null, label)), /* @__PURE__ */ React56.createElement(Grid8, { item: true, xs: 6 }, /* @__PURE__ */ React56.createElement(Stack7, { direction: "row", alignItems: "center", gap: 1 }, /* @__PURE__ */ React56.createElement(Box7, { flexGrow: 1 }, /* @__PURE__ */ React56.createElement(
    SizeControl,
    {
      placeholder: isMixed ? __17("Mixed", "elementor") : void 0,
      enablePropTypeUnits: !isMixed || !isMixedPlaceholder,
      anchorRef: rowRefs[0]
    }
  )), /* @__PURE__ */ React56.createElement(Tooltip5, { title: tooltipLabel, placement: "top" }, /* @__PURE__ */ React56.createElement(
    StyledToggleButton,
    {
      size: "tiny",
      value: "check",
      sx: { marginLeft: "auto" },
      ...bindToggle(popupState),
      selected: popupState.isOpen,
      isPlaceholder: isMixedPlaceholder,
      "aria-label": tooltipLabel
    },
    icon
  ))))), /* @__PURE__ */ React56.createElement(
    Popover3,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right"
      },
      ...bindPopover3(popupState),
      slotProps: {
        paper: { sx: { mt: 0.5, width: rowRefs[0].current?.getBoundingClientRect().width } }
      }
    },
    /* @__PURE__ */ React56.createElement(
      PropProvider,
      {
        propType: multiSizePropType,
        value: derivedValue,
        placeholder: derivedPlaceholder,
        setValue: applyMultiSizeValue,
        isDisabled: () => multiSizeDisabled
      },
      /* @__PURE__ */ React56.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React56.createElement(PopoverGridContainer, { ref: rowRefs[1] }, /* @__PURE__ */ React56.createElement(MultiSizeValueControl, { item: items2[0], rowRef: rowRefs[1] }), /* @__PURE__ */ React56.createElement(MultiSizeValueControl, { item: items2[1], rowRef: rowRefs[1] })), /* @__PURE__ */ React56.createElement(PopoverGridContainer, { ref: rowRefs[2] }, /* @__PURE__ */ React56.createElement(MultiSizeValueControl, { item: items2[2], rowRef: rowRefs[2] }), /* @__PURE__ */ React56.createElement(MultiSizeValueControl, { item: items2[3], rowRef: rowRefs[2] })))
    )
  ));
}
var MultiSizeValueControl = ({ item, rowRef }) => {
  const { bind, label, icon, ariaLabel } = item;
  return /* @__PURE__ */ React56.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React56.createElement(Grid8, { item: true, xs: 6 }, /* @__PURE__ */ React56.createElement(Grid8, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React56.createElement(Grid8, { item: true, xs: 12 }, /* @__PURE__ */ React56.createElement(ControlLabel, null, label)), /* @__PURE__ */ React56.createElement(Grid8, { item: true, xs: 12 }, /* @__PURE__ */ React56.createElement(SizeControl, { startIcon: icon, ariaLabel, anchorRef: rowRef })))));
};

// src/controls/linked-dimensions-control.tsx
import * as React57 from "react";
import { useLayoutEffect, useRef as useRef9, useState as useState7 } from "react";
import { dimensionsPropTypeUtil, sizePropTypeUtil as sizePropTypeUtil3 } from "@elementor/editor-props";
import { useActiveBreakpoint as useActiveBreakpoint2 } from "@elementor/editor-responsive";
import { DetachIcon, LinkIcon, SideBottomIcon, SideLeftIcon, SideRightIcon, SideTopIcon } from "@elementor/icons";
import { Grid as Grid9, Stack as Stack8, Tooltip as Tooltip6 } from "@elementor/ui";
import { __ as __18, sprintf as sprintf2 } from "@wordpress/i18n";
var LinkedDimensionsControl = ({ label, isSiteRtl = false, extendedOptions, min }) => {
  const gridRowRefs = [useRef9(null), useRef9(null)];
  const { disabled: sizeDisabled } = useBoundProp(sizePropTypeUtil3);
  const {
    value: dimensionsValue,
    setValue: setDimensionsValue,
    propType,
    placeholder: dimensionsPlaceholder,
    disabled: dimensionsDisabled
  } = useBoundProp(dimensionsPropTypeUtil);
  const { value: masterValue, placeholder: masterPlaceholder, setValue: setMasterValue } = useBoundProp();
  const inferIsLinked = () => {
    if (dimensionsPropTypeUtil.isValid(masterValue)) {
      return false;
    }
    if (!masterValue && dimensionsPropTypeUtil.isValid(masterPlaceholder)) {
      return false;
    }
    return true;
  };
  const [isLinked, setIsLinked] = useState7(() => inferIsLinked());
  const activeBreakpoint = useActiveBreakpoint2();
  useLayoutEffect(() => {
    setIsLinked(inferIsLinked);
  }, [activeBreakpoint]);
  const onLinkToggle = () => {
    setIsLinked((prev) => !prev);
    if (!dimensionsPropTypeUtil.isValid(masterValue)) {
      const value = masterValue ? masterValue : null;
      if (!value) {
        setMasterValue(null);
        return;
      }
      setMasterValue(
        dimensionsPropTypeUtil.create({
          "block-start": value,
          "block-end": value,
          "inline-start": value,
          "inline-end": value
        })
      );
      return;
    }
    const sizeValue = dimensionsValue?.["block-start"] ?? dimensionsValue?.["inline-end"] ?? dimensionsValue?.["block-end"] ?? dimensionsValue?.["inline-start"] ?? null;
    if (!sizeValue) {
      setMasterValue(null);
      return;
    }
    setMasterValue(sizeValue);
  };
  const tooltipLabel = label.toLowerCase();
  const LinkedIcon = isLinked ? LinkIcon : DetachIcon;
  const linkedLabel = __18("Link %s", "elementor").replace("%s", tooltipLabel);
  const unlinkedLabel = __18("Unlink %s", "elementor").replace("%s", tooltipLabel);
  const disabled = sizeDisabled || dimensionsDisabled;
  const propProviderProps = {
    propType,
    value: dimensionsValue,
    placeholder: dimensionsPlaceholder,
    setValue: setDimensionsValue,
    isDisabled: () => dimensionsDisabled
  };
  const hasPlaceholders = !masterValue && (dimensionsPlaceholder || masterPlaceholder);
  return /* @__PURE__ */ React57.createElement(PropProvider, { ...propProviderProps }, /* @__PURE__ */ React57.createElement(Stack8, { direction: "row", gap: 2, flexWrap: "nowrap" }, /* @__PURE__ */ React57.createElement(ControlFormLabel, null, label), /* @__PURE__ */ React57.createElement(Tooltip6, { title: isLinked ? unlinkedLabel : linkedLabel, placement: "top" }, /* @__PURE__ */ React57.createElement(
    StyledToggleButton,
    {
      "aria-label": isLinked ? unlinkedLabel : linkedLabel,
      size: "tiny",
      value: "check",
      selected: isLinked,
      sx: { marginLeft: "auto" },
      onChange: onLinkToggle,
      disabled,
      isPlaceholder: hasPlaceholders
    },
    /* @__PURE__ */ React57.createElement(LinkedIcon, { fontSize: "tiny" })
  ))), getCssDimensionProps(label, isSiteRtl).map((row, index) => /* @__PURE__ */ React57.createElement(Stack8, { direction: "row", gap: 2, flexWrap: "nowrap", key: index, ref: gridRowRefs[index] }, row.map(({ icon, ...props }) => /* @__PURE__ */ React57.createElement(Grid9, { container: true, gap: 0.75, alignItems: "center", key: props.bind }, /* @__PURE__ */ React57.createElement(Grid9, { item: true, xs: 12 }, /* @__PURE__ */ React57.createElement(Label, { ...props })), /* @__PURE__ */ React57.createElement(Grid9, { item: true, xs: 12 }, /* @__PURE__ */ React57.createElement(
    Control3,
    {
      bind: props.bind,
      ariaLabel: props.ariaLabel,
      startIcon: icon,
      isLinked,
      extendedOptions,
      anchorRef: gridRowRefs[index],
      min
    }
  )))))));
};
var Control3 = ({
  bind,
  ariaLabel,
  startIcon,
  isLinked,
  extendedOptions,
  anchorRef,
  min
}) => {
  if (isLinked) {
    return /* @__PURE__ */ React57.createElement(
      SizeControl,
      {
        ariaLabel,
        startIcon,
        extendedOptions,
        anchorRef,
        min
      }
    );
  }
  return /* @__PURE__ */ React57.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React57.createElement(
    SizeControl,
    {
      ariaLabel,
      startIcon,
      extendedOptions,
      anchorRef,
      min
    }
  ));
};
var Label = ({ label, bind }) => {
  return /* @__PURE__ */ React57.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React57.createElement(ControlLabel, null, label));
};
function getCssDimensionProps(label, isSiteRtl) {
  return [
    [
      {
        bind: "block-start",
        label: __18("Top", "elementor"),
        /* translators: %s is the name of the main group (margin or padding) */
        ariaLabel: sprintf2(__18("%s top", "elementor"), label),
        icon: /* @__PURE__ */ React57.createElement(SideTopIcon, { fontSize: "tiny" })
      },
      {
        bind: "inline-end",
        label: isSiteRtl ? __18("Left", "elementor") : __18("Right", "elementor"),
        ariaLabel: isSiteRtl ? (
          /* translators: %s is the name of the main group (margin or padding) */
          sprintf2(__18("%s left", "elementor"), label)
        ) : (
          /* translators: %s is the name of the main group (margin or padding) */
          sprintf2(__18("%s right", "elementor"), label)
        ),
        icon: isSiteRtl ? /* @__PURE__ */ React57.createElement(SideLeftIcon, { fontSize: "tiny" }) : /* @__PURE__ */ React57.createElement(SideRightIcon, { fontSize: "tiny" })
      }
    ],
    [
      {
        bind: "block-end",
        label: __18("Bottom", "elementor"),
        /* translators: %s is the name of the main group (margin or padding) */
        ariaLabel: sprintf2(__18("%s bottom", "elementor"), label),
        icon: /* @__PURE__ */ React57.createElement(SideBottomIcon, { fontSize: "tiny" })
      },
      {
        bind: "inline-start",
        label: isSiteRtl ? __18("Right", "elementor") : __18("Left", "elementor"),
        ariaLabel: isSiteRtl ? (
          /* translators: %s is the name of the main group (margin or padding) */
          sprintf2(__18("%s right", "elementor"), label)
        ) : (
          /* translators: %s is the name of the main group (margin or padding) */
          sprintf2(__18("%s left", "elementor"), label)
        ),
        icon: isSiteRtl ? /* @__PURE__ */ React57.createElement(SideRightIcon, { fontSize: "tiny" }) : /* @__PURE__ */ React57.createElement(SideLeftIcon, { fontSize: "tiny" })
      }
    ]
  ];
}

// src/controls/font-family-control/font-family-control.tsx
import * as React59 from "react";
import { stringPropTypeUtil as stringPropTypeUtil6 } from "@elementor/editor-props";
import { ChevronDownIcon as ChevronDownIcon2, TextIcon } from "@elementor/icons";
import { bindPopover as bindPopover4, bindTrigger as bindTrigger3, Popover as Popover4, UnstableTag as UnstableTag2, usePopupState as usePopupState5 } from "@elementor/ui";
import { __ as __20 } from "@wordpress/i18n";

// src/components/item-selector.tsx
import * as React58 from "react";
import { useCallback as useCallback2, useEffect as useEffect8, useState as useState8 } from "react";
import { PopoverBody, PopoverHeader as PopoverHeader2, PopoverMenuList, SearchField } from "@elementor/editor-ui";
import { Box as Box8, Divider as Divider2, Link, Stack as Stack9, Typography as Typography4 } from "@elementor/ui";
import { debounce } from "@elementor/utils";
import { __ as __19 } from "@wordpress/i18n";

// src/hooks/use-filtered-items-list.ts
var useFilteredItemsList = (itemsList, searchValue, disabledItems) => {
  return itemsList.reduce((acc, category) => {
    const filteredItems = category.items.filter(
      (item) => item.toLowerCase().includes(searchValue.toLowerCase())
    );
    if (filteredItems.length) {
      acc.push({ type: "category", value: category.label });
      filteredItems.forEach((item) => {
        acc.push({ type: "item", value: item, disabled: disabledItems?.includes(item) ?? false });
      });
    }
    return acc;
  }, []);
};

// src/components/item-selector.tsx
var ItemSelector = ({
  itemsList,
  selectedItem,
  onItemChange,
  onClose,
  sectionWidth,
  title,
  itemStyle = () => ({}),
  onDebounce = () => {
  },
  icon,
  disabledItems,
  id = "item-selector",
  footer,
  categoryItemContentTemplate
}) => {
  const [searchValue, setSearchValue] = useState8("");
  const filteredItemsList = useFilteredItemsList(itemsList, searchValue, disabledItems);
  const IconComponent = icon;
  const handleSearch = (value) => {
    setSearchValue(value);
  };
  const handleClose = () => {
    setSearchValue("");
    onClose();
  };
  return /* @__PURE__ */ React58.createElement(PopoverBody, { width: sectionWidth, id }, /* @__PURE__ */ React58.createElement(PopoverHeader2, { title, onClose: handleClose, icon: /* @__PURE__ */ React58.createElement(IconComponent, { fontSize: "tiny" }) }), /* @__PURE__ */ React58.createElement(
    SearchField,
    {
      value: searchValue,
      onSearch: handleSearch,
      placeholder: __19("Search", "elementor"),
      id: id + "-search"
    }
  ), /* @__PURE__ */ React58.createElement(Divider2, null), /* @__PURE__ */ React58.createElement(Box8, { sx: { flex: 1, overflow: "auto", minHeight: 0 } }, filteredItemsList.length > 0 ? /* @__PURE__ */ React58.createElement(
    ItemList,
    {
      itemListItems: filteredItemsList,
      setSelectedItem: onItemChange,
      handleClose,
      selectedItem,
      itemStyle,
      onDebounce,
      categoryItemContentTemplate
    }
  ) : /* @__PURE__ */ React58.createElement(
    Stack9,
    {
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      p: 2.5,
      gap: 1.5,
      overflow: "hidden"
    },
    /* @__PURE__ */ React58.createElement(IconComponent, { fontSize: "large" }),
    /* @__PURE__ */ React58.createElement(Box8, { sx: { maxWidth: 160, overflow: "hidden" } }, /* @__PURE__ */ React58.createElement(Typography4, { align: "center", variant: "subtitle2", color: "text.secondary" }, __19("Sorry, nothing matched", "elementor")), /* @__PURE__ */ React58.createElement(
      Typography4,
      {
        variant: "subtitle2",
        color: "text.secondary",
        sx: { display: "flex", width: "100%", justifyContent: "center" }
      },
      /* @__PURE__ */ React58.createElement("span", null, "\u201C"),
      /* @__PURE__ */ React58.createElement(
        Box8,
        {
          component: "span",
          sx: { maxWidth: "80%", overflow: "hidden", textOverflow: "ellipsis" }
        },
        searchValue
      ),
      /* @__PURE__ */ React58.createElement("span", null, "\u201D.")
    )),
    /* @__PURE__ */ React58.createElement(
      Typography4,
      {
        align: "center",
        variant: "caption",
        color: "text.secondary",
        sx: { display: "flex", flexDirection: "column" }
      },
      __19("Try something else.", "elementor"),
      /* @__PURE__ */ React58.createElement(
        Link,
        {
          color: "secondary",
          variant: "caption",
          component: "button",
          onClick: () => setSearchValue("")
        },
        __19("Clear & try again", "elementor")
      )
    )
  )), footer);
};
var ItemList = ({
  itemListItems,
  setSelectedItem,
  handleClose,
  selectedItem,
  itemStyle = () => ({}),
  onDebounce = () => {
  },
  categoryItemContentTemplate
}) => {
  const selectedItemFound = itemListItems.find((item) => item.value === selectedItem);
  const debouncedVirtualizeChange = useDebounce((visibleItems) => {
    visibleItems.forEach((item) => {
      if (item && item.type === "item") {
        onDebounce(item.value);
      }
    });
  }, 100);
  const memoizedItemStyle = useCallback2((item) => itemStyle(item), [itemStyle]);
  return /* @__PURE__ */ React58.createElement(
    PopoverMenuList,
    {
      items: itemListItems,
      selectedValue: selectedItemFound?.value,
      onChange: debouncedVirtualizeChange,
      onSelect: setSelectedItem,
      onClose: handleClose,
      itemStyle: memoizedItemStyle,
      "data-testid": "item-list",
      categoryItemContentTemplate
    }
  );
};
var useDebounce = (fn, delay) => {
  const [debouncedFn] = useState8(() => debounce(fn, delay));
  useEffect8(() => () => debouncedFn.cancel(), [debouncedFn]);
  return debouncedFn;
};

// src/controls/font-family-control/enqueue-font.tsx
var enqueueFont = (fontFamily, context = "editor") => {
  const extendedWindow = window;
  return extendedWindow.elementor?.helpers?.enqueueFont?.(fontFamily, context) ?? null;
};

// src/controls/font-family-control/font-family-control.tsx
var FontFamilyControl = createControl(
  ({ fontFamilies, sectionWidth, ariaLabel }) => {
    const {
      value: fontFamily,
      setValue: setFontFamily,
      disabled,
      placeholder
    } = useBoundProp(stringPropTypeUtil6);
    const popoverState = usePopupState5({ variant: "popover" });
    const isShowingPlaceholder = !fontFamily && placeholder;
    const mapFontSubs = React59.useMemo(() => {
      return fontFamilies.map(({ label, fonts }) => ({
        label,
        items: fonts
      }));
    }, [fontFamilies]);
    return /* @__PURE__ */ React59.createElement(React59.Fragment, null, /* @__PURE__ */ React59.createElement(ControlActions, null, /* @__PURE__ */ React59.createElement(
      UnstableTag2,
      {
        id: "font-family-control",
        variant: "outlined",
        label: fontFamily || placeholder,
        endIcon: /* @__PURE__ */ React59.createElement(ChevronDownIcon2, { fontSize: "tiny" }),
        ...bindTrigger3(popoverState),
        fullWidth: true,
        disabled,
        "aria-label": ariaLabel,
        sx: isShowingPlaceholder ? {
          "& .MuiTag-label": {
            color: (theme) => theme.palette.text.tertiary
          },
          textTransform: "capitalize"
        } : void 0
      }
    )), /* @__PURE__ */ React59.createElement(
      Popover4,
      {
        disablePortal: true,
        disableScrollLock: true,
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
        transformOrigin: { vertical: "top", horizontal: "right" },
        sx: { my: 1.5 },
        ...bindPopover4(popoverState)
      },
      /* @__PURE__ */ React59.createElement(
        ItemSelector,
        {
          id: "font-family-selector",
          itemsList: mapFontSubs,
          selectedItem: fontFamily,
          onItemChange: setFontFamily,
          onClose: popoverState.close,
          sectionWidth,
          title: __20("Font family", "elementor"),
          itemStyle: (item) => ({ fontFamily: item.value }),
          onDebounce: enqueueFont,
          icon: TextIcon
        }
      )
    ));
  }
);

// src/controls/url-control.tsx
import * as React60 from "react";
import { urlPropTypeUtil } from "@elementor/editor-props";
import { TextField as TextField6 } from "@elementor/ui";
var UrlControl = createControl(
  ({ placeholder, ariaLabel }) => {
    const { value, setValue, disabled } = useBoundProp(urlPropTypeUtil);
    const handleChange = (event) => setValue(event.target.value);
    return /* @__PURE__ */ React60.createElement(ControlActions, null, /* @__PURE__ */ React60.createElement(
      TextField6,
      {
        size: "tiny",
        fullWidth: true,
        value: value ?? "",
        disabled,
        onChange: handleChange,
        placeholder,
        inputProps: {
          ...ariaLabel ? { "aria-label": ariaLabel } : {}
        }
      }
    ));
  }
);

// src/controls/link-control.tsx
import * as React65 from "react";
import { useEffect as useEffect9, useMemo as useMemo8, useState as useState10 } from "react";
import { getLinkInLinkRestriction } from "@elementor/editor-elements";
import { linkPropTypeUtil } from "@elementor/editor-props";
import { MinusIcon, PlusIcon as PlusIcon2 } from "@elementor/icons";
import { useSessionStorage } from "@elementor/session";
import { Collapse, Grid as Grid10, IconButton as IconButton6, Stack as Stack10 } from "@elementor/ui";
import { debounce as debounce3 } from "@elementor/utils";
import { __ as __23 } from "@wordpress/i18n";

// src/components/restricted-link-infotip.tsx
import * as React61 from "react";
import { selectElement } from "@elementor/editor-elements";
import { InfoCircleFilledIcon } from "@elementor/icons";
import { Alert, AlertAction, AlertTitle, Box as Box9, Infotip as Infotip2, Link as Link2 } from "@elementor/ui";
import { __ as __21 } from "@wordpress/i18n";
var learnMoreButton = {
  label: __21("Learn More", "elementor"),
  href: "https://go.elementor.com/element-link-inside-link-infotip"
};
var INFOTIP_CONTENT = {
  descendant: __21(
    "To add a link or action to this element, first remove the link or action from the elements inside of it.",
    "elementor"
  ),
  ancestor: __21(
    "To add a link or action to this container, first remove the link or action from its parent container.",
    "elementor"
  )
};
var RestrictedLinkInfotip = ({
  linkInLinkRestriction,
  isVisible,
  children
}) => {
  const { shouldRestrict, reason, elementId } = linkInLinkRestriction;
  const handleTakeMeClick = () => {
    if (elementId) {
      selectElement(elementId);
    }
  };
  const content = /* @__PURE__ */ React61.createElement(
    Alert,
    {
      color: "secondary",
      icon: /* @__PURE__ */ React61.createElement(InfoCircleFilledIcon, null),
      action: /* @__PURE__ */ React61.createElement(
        AlertAction,
        {
          sx: { width: "fit-content" },
          variant: "contained",
          color: "secondary",
          onClick: handleTakeMeClick
        },
        __21("Take me there", "elementor")
      )
    },
    /* @__PURE__ */ React61.createElement(AlertTitle, null, __21("Nested links", "elementor")),
    /* @__PURE__ */ React61.createElement(Box9, { component: "span" }, INFOTIP_CONTENT[reason ?? "descendant"], " ", /* @__PURE__ */ React61.createElement(Link2, { href: learnMoreButton.href, target: "_blank", color: "info.main" }, learnMoreButton.label))
  );
  return shouldRestrict && isVisible ? /* @__PURE__ */ React61.createElement(
    Infotip2,
    {
      placement: "right",
      content,
      color: "secondary",
      slotProps: { popper: { sx: { width: 300 } } }
    },
    /* @__PURE__ */ React61.createElement(Box9, null, children)
  ) : /* @__PURE__ */ React61.createElement(React61.Fragment, null, children);
};

// src/controls/query-control.tsx
import * as React63 from "react";
import { useMemo as useMemo7, useState as useState9 } from "react";
import { numberPropTypeUtil as numberPropTypeUtil2, stringPropTypeUtil as stringPropTypeUtil7, urlPropTypeUtil as urlPropTypeUtil2 } from "@elementor/editor-props";
import { httpService as httpService2 } from "@elementor/http-client";
import { SearchIcon } from "@elementor/icons";
import { debounce as debounce2 } from "@elementor/utils";
import { __ as __22 } from "@wordpress/i18n";

// src/components/autocomplete.tsx
import * as React62 from "react";
import { forwardRef as forwardRef8 } from "react";
import { XIcon as XIcon2 } from "@elementor/icons";
import {
  Autocomplete as AutocompleteBase,
  Box as Box10,
  IconButton as IconButton5,
  InputAdornment as InputAdornment4,
  TextField as TextField7
} from "@elementor/ui";
var Autocomplete2 = forwardRef8((props, ref) => {
  const {
    options,
    onOptionChange,
    onTextChange,
    allowCustomValues = false,
    placeholder = "",
    minInputLength = 2,
    value = "",
    startAdornment,
    disablePortal = true,
    inputProps,
    ...restProps
  } = props;
  const optionKeys = factoryFilter(value, options, minInputLength).map(({ id }) => id);
  const allowClear = !!value;
  const muiWarningPreventer = allowCustomValues || !!value?.toString()?.length;
  const isOptionEqualToValue = muiWarningPreventer ? void 0 : () => true;
  const isValueFromOptions = typeof value === "number" && !!findMatchingOption(options, value);
  const valueLength = value?.toString()?.length ?? 0;
  const meetsMinLength = valueLength >= minInputLength;
  const shouldOpen = meetsMinLength && (allowCustomValues ? optionKeys.length > 0 : true);
  return /* @__PURE__ */ React62.createElement(
    AutocompleteBase,
    {
      ...restProps,
      ref,
      forcePopupIcon: false,
      disablePortal,
      disableClearable: true,
      freeSolo: allowCustomValues,
      openOnFocus: false,
      open: shouldOpen,
      value: value?.toString() || "",
      size: "tiny",
      onChange: (_, newValue) => onOptionChange(Number(newValue)),
      readOnly: isValueFromOptions,
      options: optionKeys,
      getOptionKey: (optionId) => findMatchingOption(options, optionId)?.id || optionId,
      getOptionLabel: (optionId) => findMatchingOption(options, optionId)?.label || optionId.toString(),
      groupBy: isCategorizedOptionPool(options) ? (optionId) => findMatchingOption(options, optionId)?.groupLabel || optionId : void 0,
      isOptionEqualToValue,
      filterOptions: () => optionKeys,
      renderOption: (optionProps, optionId) => /* @__PURE__ */ React62.createElement(Box10, { component: "li", ...optionProps, key: optionProps.id }, findMatchingOption(options, optionId)?.label ?? optionId),
      renderInput: (params) => /* @__PURE__ */ React62.createElement(
        TextInput,
        {
          params,
          handleChange: (newValue) => onTextChange?.(newValue),
          allowClear,
          placeholder,
          hasSelectedValue: isValueFromOptions,
          startAdornment,
          extraInputProps: inputProps
        }
      )
    }
  );
});
var TextInput = ({
  params,
  allowClear,
  placeholder,
  handleChange,
  hasSelectedValue,
  startAdornment,
  extraInputProps
}) => {
  const onChange = (event) => {
    handleChange(event.target.value);
  };
  return /* @__PURE__ */ React62.createElement(
    TextField7,
    {
      ...params,
      placeholder,
      onChange,
      inputProps: { ...params.inputProps ?? {}, ...extraInputProps ?? {} },
      sx: {
        "& .MuiInputBase-input": {
          cursor: hasSelectedValue ? "default" : void 0
        }
      },
      InputProps: {
        ...params.InputProps,
        startAdornment: startAdornment || params.InputProps.startAdornment,
        endAdornment: /* @__PURE__ */ React62.createElement(ClearButton, { params, allowClear, handleChange })
      }
    }
  );
};
var ClearButton = ({
  allowClear,
  handleChange,
  params
}) => /* @__PURE__ */ React62.createElement(InputAdornment4, { position: "end" }, allowClear && /* @__PURE__ */ React62.createElement(IconButton5, { size: params.size, onClick: () => handleChange(null), sx: { cursor: "pointer" } }, /* @__PURE__ */ React62.createElement(XIcon2, { fontSize: params.size })));
function findMatchingOption(options, optionId = null) {
  const formattedOption = (optionId || "").toString();
  return options.find(({ id }) => formattedOption === id.toString());
}
function isCategorizedOptionPool(options) {
  if (options.length <= 1) {
    return false;
  }
  const uniqueGroupLabels = new Set(options.map((option) => option.groupLabel));
  return uniqueGroupLabels.size > 1;
}
function factoryFilter(newValue, options, minInputLength) {
  if (null === newValue) {
    return options;
  }
  const formattedValue = String(newValue || "")?.toLowerCase();
  if (formattedValue.length < minInputLength) {
    return new Array(0);
  }
  return options.filter(
    (option) => String(option.id).toLowerCase().includes(formattedValue) || option.label.toLowerCase().includes(formattedValue)
  );
}

// src/controls/query-control.tsx
var QueryControl = createControl((props) => {
  const { value, setValue } = useBoundProp();
  const {
    allowCustomValues = true,
    queryOptions: { url, params = {} },
    placeholder,
    minInputLength = 2,
    onSetValue,
    ariaLabel
  } = props || {};
  const normalizedPlaceholder = placeholder || __22("Search", "elementor");
  const [options, setOptions] = useState9(
    generateFirstLoadedOption(value?.value)
  );
  const onOptionChange = (newValue) => {
    if (newValue === null) {
      setValue(null);
      onSetValue?.(null);
      return;
    }
    const valueToSave = {
      $$type: "query",
      value: {
        id: numberPropTypeUtil2.create(newValue),
        label: stringPropTypeUtil7.create(findMatchingOption(options, newValue)?.label || null)
      }
    };
    setValue(valueToSave);
    onSetValue?.(valueToSave);
  };
  const onTextChange = (newValue) => {
    if (!newValue) {
      setValue(null);
      onSetValue?.(null);
      return;
    }
    const newLinkValue = newValue?.trim() || "";
    const valueToSave = newLinkValue ? urlPropTypeUtil2.create(newLinkValue) : null;
    setValue(valueToSave);
    onSetValue?.(valueToSave);
    updateOptions(newValue);
  };
  const updateOptions = (newValue) => {
    setOptions([]);
    if (!newValue || !url || newValue.length < minInputLength) {
      return;
    }
    debounceFetch({ ...params, term: newValue });
  };
  const debounceFetch = useMemo7(
    () => debounce2(
      (queryParams) => fetchOptions(url, queryParams).then((newOptions) => {
        setOptions(formatOptions(newOptions));
      }),
      400
    ),
    [url]
  );
  return /* @__PURE__ */ React63.createElement(ControlActions, null, /* @__PURE__ */ React63.createElement(
    Autocomplete2,
    {
      options,
      allowCustomValues,
      placeholder: normalizedPlaceholder,
      startAdornment: /* @__PURE__ */ React63.createElement(SearchIcon, { fontSize: "tiny" }),
      value: value?.value?.id?.value || value?.value,
      onOptionChange,
      onTextChange,
      minInputLength,
      disablePortal: false,
      inputProps: {
        ...ariaLabel ? { "aria-label": ariaLabel } : {}
      }
    }
  ));
});
async function fetchOptions(ajaxUrl, params) {
  if (!params || !ajaxUrl) {
    return [];
  }
  try {
    const { data: response } = await httpService2().get(ajaxUrl, { params });
    return response.data.value;
  } catch {
    return [];
  }
}
function formatOptions(options) {
  const compareKey = isCategorizedOptionPool(options) ? "groupLabel" : "label";
  return options.sort(
    (a, b) => a[compareKey] && b[compareKey] ? a[compareKey].localeCompare(b[compareKey]) : 0
  );
}
function generateFirstLoadedOption(unionValue) {
  const value = unionValue?.id?.value;
  const label = unionValue?.label?.value;
  const type = unionValue?.id?.$$type || "url";
  return value && label && type === "number" ? [
    {
      id: value.toString(),
      label
    }
  ] : [];
}

// src/controls/switch-control.tsx
import * as React64 from "react";
import { booleanPropTypeUtil } from "@elementor/editor-props";
import { Box as Box11, Switch } from "@elementor/ui";
var SwitchControl = createControl(() => {
  const { value, setValue, disabled } = useBoundProp(booleanPropTypeUtil);
  const handleChange = (event) => {
    setValue(event.target.checked);
  };
  return /* @__PURE__ */ React64.createElement(Box11, { sx: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React64.createElement(
    Switch,
    {
      checked: !!value,
      onChange: handleChange,
      size: "small",
      disabled,
      inputProps: {
        ...disabled ? { style: { opacity: 0 } } : {}
      }
    }
  ));
});

// src/controls/link-control.tsx
var SIZE7 = "tiny";
var LinkControl = createControl((props) => {
  const { value, path, setValue, ...propContext } = useBoundProp(linkPropTypeUtil);
  const [linkSessionValue, setLinkSessionValue] = useSessionStorage(path.join("/"));
  const [isActive, setIsActive] = useState10(!!value);
  const {
    allowCustomValues = true,
    queryOptions,
    placeholder,
    minInputLength = 2,
    context: { elementId },
    label = __23("Link", "elementor"),
    ariaLabel
  } = props || {};
  const [linkInLinkRestriction, setLinkInLinkRestriction] = useState10(
    getLinkInLinkRestriction(elementId, value)
  );
  const shouldDisableAddingLink = !isActive && linkInLinkRestriction.shouldRestrict;
  const debouncedCheckRestriction = useMemo8(
    () => debounce3(() => {
      const newRestriction = getLinkInLinkRestriction(elementId, value);
      if (newRestriction.shouldRestrict && isActive) {
        setIsActive(false);
      }
      setLinkInLinkRestriction(newRestriction);
    }, 300),
    [elementId, isActive, value]
  );
  useEffect9(() => {
    debouncedCheckRestriction();
    const handleInlineLinkChanged = (event) => {
      const customEvent = event;
      if (customEvent.detail.elementId === elementId) {
        debouncedCheckRestriction();
      }
    };
    window.addEventListener("elementor:inline-link-changed", handleInlineLinkChanged);
    return () => {
      window.removeEventListener("elementor:inline-link-changed", handleInlineLinkChanged);
      debouncedCheckRestriction.cancel();
    };
  }, [elementId, debouncedCheckRestriction]);
  const onEnabledChange = () => {
    setLinkInLinkRestriction(getLinkInLinkRestriction(elementId, value));
    if (linkInLinkRestriction.shouldRestrict && !isActive) {
      return;
    }
    const newState = !isActive;
    setIsActive(newState);
    if (!newState && value !== null) {
      setValue(null);
    }
    if (newState && linkSessionValue?.value) {
      setValue(linkSessionValue.value);
    }
    setLinkSessionValue({
      value: linkSessionValue?.value,
      meta: { isEnabled: newState }
    });
  };
  const onSaveValueToSession = (newValue) => {
    const valueToSave = newValue ? {
      ...value,
      destination: newValue
    } : null;
    setLinkSessionValue({ ...linkSessionValue, value: valueToSave });
  };
  return /* @__PURE__ */ React65.createElement(PropProvider, { ...propContext, value, setValue }, /* @__PURE__ */ React65.createElement(Stack10, { gap: 1.5 }, /* @__PURE__ */ React65.createElement(
    Stack10,
    {
      direction: "row",
      sx: {
        justifyContent: "space-between",
        alignItems: "center",
        marginInlineEnd: -0.75
      }
    },
    /* @__PURE__ */ React65.createElement(ControlLabel, null, label),
    /* @__PURE__ */ React65.createElement(RestrictedLinkInfotip, { isVisible: !isActive, linkInLinkRestriction }, /* @__PURE__ */ React65.createElement(
      ToggleIconControl,
      {
        disabled: shouldDisableAddingLink,
        active: isActive,
        onIconClick: onEnabledChange,
        label: __23("Toggle link", "elementor")
      }
    ))
  ), /* @__PURE__ */ React65.createElement(Collapse, { in: isActive, timeout: "auto", unmountOnExit: true }, /* @__PURE__ */ React65.createElement(Stack10, { gap: 1.5 }, /* @__PURE__ */ React65.createElement(PropKeyProvider, { bind: "destination" }, /* @__PURE__ */ React65.createElement(
    QueryControl,
    {
      queryOptions,
      allowCustomValues,
      minInputLength,
      placeholder,
      onSetValue: onSaveValueToSession,
      ariaLabel: ariaLabel || label
    }
  )), /* @__PURE__ */ React65.createElement(PropKeyProvider, { bind: "isTargetBlank" }, /* @__PURE__ */ React65.createElement(Grid10, { container: true, alignItems: "center", flexWrap: "nowrap", justifyContent: "space-between" }, /* @__PURE__ */ React65.createElement(Grid10, { item: true }, /* @__PURE__ */ React65.createElement(ControlFormLabel, null, __23("Open in a new tab", "elementor"))), /* @__PURE__ */ React65.createElement(Grid10, { item: true, sx: { marginInlineEnd: -1 } }, /* @__PURE__ */ React65.createElement(SwitchControl, null))))))));
});
var ToggleIconControl = ({ disabled, active, onIconClick, label }) => {
  return /* @__PURE__ */ React65.createElement(IconButton6, { size: SIZE7, onClick: onIconClick, "aria-label": label, disabled }, active ? /* @__PURE__ */ React65.createElement(MinusIcon, { fontSize: SIZE7 }) : /* @__PURE__ */ React65.createElement(PlusIcon2, { fontSize: SIZE7 }));
};

// src/controls/html-tag-control.tsx
import * as React67 from "react";
import { getElementLabel } from "@elementor/editor-elements";
import { stringPropTypeUtil as stringPropTypeUtil8 } from "@elementor/editor-props";
import { MenuListItem as MenuListItem3 } from "@elementor/editor-ui";
import { Select as Select2, styled as styled6, Typography as Typography5 } from "@elementor/ui";
import { __ as __24 } from "@wordpress/i18n";

// src/components/conditional-control-infotip.tsx
import * as React66 from "react";
import { InfoAlert } from "@elementor/editor-ui";
import { AlertTitle as AlertTitle2, Box as Box12, Infotip as Infotip3, useTheme as useTheme2 } from "@elementor/ui";
import { DirectionProvider } from "@elementor/ui";
var DEFAULT_COLOR = "secondary";
var ConditionalControlInfotip = React66.forwardRef(
  ({ children, title, description, alertProps, infotipProps, ...props }, ref) => {
    const theme = useTheme2();
    const isUiRtl = "rtl" === theme.direction;
    const isEnabled = props.isEnabled && (title || description);
    return /* @__PURE__ */ React66.createElement(Box12, { ref }, isEnabled ? /* @__PURE__ */ React66.createElement(DirectionProvider, { rtl: isUiRtl }, /* @__PURE__ */ React66.createElement(
      Infotip3,
      {
        placement: "right",
        color: DEFAULT_COLOR,
        slotProps: {
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, 10]
                }
              }
            ]
          }
        },
        ...infotipProps,
        content: /* @__PURE__ */ React66.createElement(
          InfoAlert,
          {
            color: DEFAULT_COLOR,
            sx: { width: 300, px: 1.5, py: 2 },
            ...alertProps
          },
          /* @__PURE__ */ React66.createElement(Box12, { sx: { flexDirection: "column", display: "flex", gap: 0.5 } }, /* @__PURE__ */ React66.createElement(AlertTitle2, null, title), /* @__PURE__ */ React66.createElement(Box12, null, description))
        )
      },
      children
    )) : children);
  }
);

// src/controls/html-tag-control.tsx
var StyledSelect = styled6(Select2)(() => ({ ".MuiSelect-select.Mui-disabled": { cursor: "not-allowed" } }));
var HtmlTagControl = createControl(({ options, onChange, fallbackLabels = {} }) => {
  const { value, setValue, disabled, placeholder } = useBoundProp(stringPropTypeUtil8);
  const handleChange = (event) => {
    const newValue = event.target.value || null;
    onChange?.(newValue, value);
    setValue(newValue);
  };
  const elementLabel = getElementLabel() ?? "element";
  const infoTipProps = {
    title: __24("HTML Tag", "elementor"),
    /* translators: %s is the element name. */
    description: __24(
      `The tag is locked to 'a' tag because this %s has a link. To pick a different tag, remove the link first.`,
      "elementor"
    ).replace("%s", elementLabel),
    isEnabled: !!disabled
  };
  const renderValue = (selectedValue) => {
    if (selectedValue) {
      return findOptionByValue(selectedValue)?.label || fallbackLabels[selectedValue] || selectedValue;
    }
    if (!placeholder) {
      return "";
    }
    const placeholderOption = findOptionByValue(placeholder);
    const displayText = placeholderOption?.label || placeholder;
    return /* @__PURE__ */ React67.createElement(Typography5, { component: "span", variant: "caption", color: "text.tertiary" }, displayText);
  };
  const findOptionByValue = (searchValue) => options.find((opt) => opt.value === searchValue);
  return /* @__PURE__ */ React67.createElement(ControlActions, null, /* @__PURE__ */ React67.createElement(ConditionalControlInfotip, { ...infoTipProps }, /* @__PURE__ */ React67.createElement(
    StyledSelect,
    {
      sx: { overflow: "hidden", cursor: disabled ? "not-allowed" : void 0 },
      displayEmpty: true,
      size: "tiny",
      renderValue,
      value: value ?? "",
      onChange: handleChange,
      disabled,
      fullWidth: true
    },
    options.map(({ label, ...props }) => /* @__PURE__ */ React67.createElement(MenuListItem3, { key: props.value, ...props, value: props.value ?? "" }, label))
  )));
});

// src/controls/gap-control.tsx
import * as React68 from "react";
import { useLayoutEffect as useLayoutEffect2, useRef as useRef10, useState as useState11 } from "react";
import { layoutDirectionPropTypeUtil, sizePropTypeUtil as sizePropTypeUtil4 } from "@elementor/editor-props";
import { useActiveBreakpoint as useActiveBreakpoint3 } from "@elementor/editor-responsive";
import { DetachIcon as DetachIcon2, LinkIcon as LinkIcon2 } from "@elementor/icons";
import { Grid as Grid11, Stack as Stack11, Tooltip as Tooltip7 } from "@elementor/ui";
import { __ as __25 } from "@wordpress/i18n";
var GapControl = ({ label }) => {
  const stackRef = useRef10(null);
  const { disabled: sizeDisabled } = useBoundProp(sizePropTypeUtil4);
  const {
    value: directionValue,
    setValue: setDirectionValue,
    propType,
    placeholder: directionPlaceholder,
    disabled: directionDisabled
  } = useBoundProp(layoutDirectionPropTypeUtil);
  const { value: masterValue, setValue: setMasterValue, placeholder: masterPlaceholder } = useBoundProp();
  const inferIsLinked = () => {
    if (layoutDirectionPropTypeUtil.isValid(masterValue)) {
      return false;
    }
    if (!masterValue && layoutDirectionPropTypeUtil.isValid(masterPlaceholder)) {
      return false;
    }
    return true;
  };
  const [isLinked, setIsLinked] = useState11(() => inferIsLinked());
  const activeBreakpoint = useActiveBreakpoint3();
  useLayoutEffect2(() => {
    setIsLinked(inferIsLinked());
  }, [activeBreakpoint]);
  const onLinkToggle = () => {
    setIsLinked((prev) => !prev);
    if (!layoutDirectionPropTypeUtil.isValid(masterValue)) {
      const currentValue2 = masterValue ? masterValue : null;
      if (!currentValue2) {
        setMasterValue(null);
        return;
      }
      setMasterValue(
        layoutDirectionPropTypeUtil.create({
          row: currentValue2,
          column: currentValue2
        })
      );
      return;
    }
    const currentValue = directionValue?.column ?? directionValue?.row ?? null;
    setMasterValue(currentValue);
  };
  const tooltipLabel = label.toLowerCase();
  const LinkedIcon = isLinked ? LinkIcon2 : DetachIcon2;
  const linkedLabel = __25("Link %s", "elementor").replace("%s", tooltipLabel);
  const unlinkedLabel = __25("Unlink %s", "elementor").replace("%s", tooltipLabel);
  const disabled = sizeDisabled || directionDisabled;
  const propProviderProps = {
    propType,
    value: directionValue,
    setValue: setDirectionValue,
    placeholder: directionPlaceholder
  };
  const hasPlaceholders = !masterValue && (directionPlaceholder || masterPlaceholder);
  return /* @__PURE__ */ React68.createElement(PropProvider, { ...propProviderProps }, /* @__PURE__ */ React68.createElement(Stack11, { direction: "row", gap: 2, flexWrap: "nowrap" }, /* @__PURE__ */ React68.createElement(ControlLabel, null, label), /* @__PURE__ */ React68.createElement(Tooltip7, { title: isLinked ? unlinkedLabel : linkedLabel, placement: "top" }, /* @__PURE__ */ React68.createElement(
    StyledToggleButton,
    {
      "aria-label": isLinked ? unlinkedLabel : linkedLabel,
      size: "tiny",
      value: "check",
      selected: isLinked,
      sx: { marginLeft: "auto" },
      onChange: onLinkToggle,
      disabled,
      isPlaceholder: hasPlaceholders
    },
    /* @__PURE__ */ React68.createElement(LinkedIcon, { fontSize: "tiny" })
  ))), /* @__PURE__ */ React68.createElement(Stack11, { direction: "row", gap: 2, flexWrap: "nowrap", ref: stackRef }, /* @__PURE__ */ React68.createElement(Grid11, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React68.createElement(Grid11, { item: true, xs: 12 }, /* @__PURE__ */ React68.createElement(ControlFormLabel, null, __25("Column", "elementor"))), /* @__PURE__ */ React68.createElement(Grid11, { item: true, xs: 12 }, /* @__PURE__ */ React68.createElement(
    Control4,
    {
      bind: "column",
      ariaLabel: __25("Column gap", "elementor"),
      isLinked,
      anchorRef: stackRef
    }
  ))), /* @__PURE__ */ React68.createElement(Grid11, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React68.createElement(Grid11, { item: true, xs: 12 }, /* @__PURE__ */ React68.createElement(ControlFormLabel, null, __25("Row", "elementor"))), /* @__PURE__ */ React68.createElement(Grid11, { item: true, xs: 12 }, /* @__PURE__ */ React68.createElement(
    Control4,
    {
      bind: "row",
      ariaLabel: __25("Row gap", "elementor"),
      isLinked,
      anchorRef: stackRef
    }
  )))));
};
var Control4 = ({
  bind,
  ariaLabel,
  isLinked,
  anchorRef
}) => {
  if (isLinked) {
    return /* @__PURE__ */ React68.createElement(SizeControl, { anchorRef, ariaLabel });
  }
  return /* @__PURE__ */ React68.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React68.createElement(SizeControl, { anchorRef, ariaLabel }));
};

// src/controls/aspect-ratio-control.tsx
import * as React69 from "react";
import { useEffect as useEffect10, useState as useState12 } from "react";
import { stringPropTypeUtil as stringPropTypeUtil9 } from "@elementor/editor-props";
import { MenuListItem as MenuListItem4 } from "@elementor/editor-ui";
import { ArrowsMoveHorizontalIcon, ArrowsMoveVerticalIcon } from "@elementor/icons";
import { Grid as Grid12, Select as Select3, Stack as Stack12, TextField as TextField8 } from "@elementor/ui";
import { __ as __26 } from "@wordpress/i18n";
var RATIO_OPTIONS = [
  { label: __26("Auto", "elementor"), value: "auto" },
  { label: "1/1", value: "1/1" },
  { label: "4/3", value: "4/3" },
  { label: "3/4", value: "3/4" },
  { label: "16/9", value: "16/9" },
  { label: "9/16", value: "9/16" },
  { label: "3/2", value: "3/2" },
  { label: "2/3", value: "2/3" }
];
var CUSTOM_RATIO = "custom";
var AspectRatioControl = createControl(({ label }) => {
  const {
    value: currentPropValue,
    setValue: setAspectRatioValue,
    disabled,
    placeholder: externalPlaceholder
  } = useBoundProp(stringPropTypeUtil9);
  const aspectRatioValue = currentPropValue ?? externalPlaceholder;
  const isCustomSelected = aspectRatioValue && !RATIO_OPTIONS.some((option) => option.value === aspectRatioValue);
  const [initialWidth, initialHeight] = isCustomSelected ? aspectRatioValue.split("/") : ["", ""];
  const [isCustom, setIsCustom] = useState12(isCustomSelected);
  const [customWidth, setCustomWidth] = useState12(initialWidth);
  const [customHeight, setCustomHeight] = useState12(initialHeight);
  const [selectedValue, setSelectedValue] = useState12(
    isCustomSelected ? CUSTOM_RATIO : aspectRatioValue || ""
  );
  useEffect10(() => {
    const isCustomValue = aspectRatioValue && !RATIO_OPTIONS.some((option) => option.value === aspectRatioValue);
    if (isCustomValue) {
      const [width, height] = aspectRatioValue.split("/");
      setCustomWidth(width || "");
      setCustomHeight(height || "");
      setSelectedValue(CUSTOM_RATIO);
      setIsCustom(true);
    } else {
      setSelectedValue(aspectRatioValue || "");
      setIsCustom(false);
      setCustomWidth("");
      setCustomHeight("");
    }
  }, [aspectRatioValue]);
  const handleSelectChange = (event) => {
    const newValue = event.target.value;
    const isCustomRatio = newValue === CUSTOM_RATIO;
    setIsCustom(isCustomRatio);
    setSelectedValue(newValue);
    if (isCustomRatio) {
      return;
    }
    setAspectRatioValue(newValue);
  };
  const handleCustomWidthChange = (event) => {
    const newWidth = event.target.value;
    setCustomWidth(newWidth);
    if (newWidth && customHeight) {
      setAspectRatioValue(`${newWidth}/${customHeight}`);
    }
  };
  const handleCustomHeightChange = (event) => {
    const newHeight = event.target.value;
    setCustomHeight(newHeight);
    if (customWidth && newHeight) {
      setAspectRatioValue(`${customWidth}/${newHeight}`);
    }
  };
  const lookup = currentPropValue ?? externalPlaceholder;
  const selectedOption = RATIO_OPTIONS.find((option) => option.value === lookup);
  return /* @__PURE__ */ React69.createElement(ControlActions, null, /* @__PURE__ */ React69.createElement(Stack12, { direction: "column", gap: 2 }, /* @__PURE__ */ React69.createElement(Grid12, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React69.createElement(Grid12, { item: true, xs: 6 }, /* @__PURE__ */ React69.createElement(ControlLabel, null, label)), /* @__PURE__ */ React69.createElement(Grid12, { item: true, xs: 6 }, /* @__PURE__ */ React69.createElement(
    Select3,
    {
      size: "tiny",
      displayEmpty: true,
      sx: { overflow: "hidden" },
      disabled,
      value: selectedValue,
      onChange: handleSelectChange,
      renderValue: isCustomSelected ? void 0 : () => selectedOption?.label,
      fullWidth: true
    },
    [...RATIO_OPTIONS, { label: __26("Custom", "elementor"), value: CUSTOM_RATIO }].map(
      ({ label: optionLabel, ...props }) => /* @__PURE__ */ React69.createElement(MenuListItem4, { key: props.value, ...props, value: props.value ?? "" }, optionLabel)
    )
  ))), isCustom && /* @__PURE__ */ React69.createElement(Grid12, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React69.createElement(Grid12, { item: true, xs: 6 }, /* @__PURE__ */ React69.createElement(
    TextField8,
    {
      size: "tiny",
      type: "number",
      fullWidth: true,
      disabled,
      value: customWidth,
      onChange: handleCustomWidthChange,
      InputProps: {
        startAdornment: /* @__PURE__ */ React69.createElement(ArrowsMoveHorizontalIcon, { fontSize: "tiny" })
      }
    }
  )), /* @__PURE__ */ React69.createElement(Grid12, { item: true, xs: 6 }, /* @__PURE__ */ React69.createElement(
    TextField8,
    {
      size: "tiny",
      type: "number",
      fullWidth: true,
      disabled,
      value: customHeight,
      onChange: handleCustomHeightChange,
      InputProps: {
        startAdornment: /* @__PURE__ */ React69.createElement(ArrowsMoveVerticalIcon, { fontSize: "tiny" })
      }
    }
  )))));
});

// src/controls/svg-media-control.tsx
import * as React71 from "react";
import { useState as useState14 } from "react";
import { useCurrentUserCapabilities } from "@elementor/editor-current-user";
import { imageSrcPropTypeUtil as imageSrcPropTypeUtil2 } from "@elementor/editor-props";
import { UploadIcon as UploadIcon2 } from "@elementor/icons";
import { Button as Button4, Card as Card2, CardMedia as CardMedia2, CardOverlay as CardOverlay2, CircularProgress as CircularProgress3, Stack as Stack13, styled as styled7, ThemeProvider } from "@elementor/ui";
import { useWpMediaAttachment as useWpMediaAttachment2, useWpMediaFrame as useWpMediaFrame2 } from "@elementor/wp-media";
import { __ as __28 } from "@wordpress/i18n";

// src/components/enable-unfiltered-modal.tsx
import * as React70 from "react";
import { useState as useState13 } from "react";
import {
  Button as Button3,
  CircularProgress as CircularProgress2,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogHeader,
  DialogTitle,
  Divider as Divider3
} from "@elementor/ui";
import { __ as __27 } from "@wordpress/i18n";
var ADMIN_TITLE_TEXT = __27("Enable Unfiltered Uploads", "elementor");
var ADMIN_CONTENT_TEXT = __27(
  "Before you enable unfiltered files upload, note that such files include a security risk. Elementor does run a process to remove possible malicious code, but there is still risk involved when using such files.",
  "elementor"
);
var ADMIN_FAILED_CONTENT_TEXT_PT1 = __27("Failed to enable unfiltered files upload.", "elementor");
var ADMIN_FAILED_CONTENT_TEXT_PT2 = __27(
  "You can try again, if the problem persists, please contact support.",
  "elementor"
);
var WAIT_FOR_CLOSE_TIMEOUT_MS = 300;
var EnableUnfilteredModal = (props) => {
  const { mutateAsync, isPending } = useUpdateUnfilteredFilesUpload();
  const [isError, setIsError] = useState13(false);
  const onClose = (enabled) => {
    props.onClose(enabled);
    setTimeout(() => setIsError(false), WAIT_FOR_CLOSE_TIMEOUT_MS);
  };
  const handleEnable = async () => {
    try {
      const response = await mutateAsync({ allowUnfilteredFilesUpload: true });
      if (response?.data?.success === false) {
        setIsError(true);
      } else {
        props.onClose(true);
      }
    } catch {
      setIsError(true);
    }
  };
  const dialogProps = { ...props, isPending, handleEnable, isError, onClose };
  return /* @__PURE__ */ React70.createElement(AdminDialog, { ...dialogProps });
};
var AdminDialog = ({ open, onClose, handleEnable, isPending, isError }) => /* @__PURE__ */ React70.createElement(Dialog, { open, maxWidth: "sm", onClose: () => onClose(false) }, /* @__PURE__ */ React70.createElement(DialogHeader, { logo: false }, /* @__PURE__ */ React70.createElement(DialogTitle, null, ADMIN_TITLE_TEXT)), /* @__PURE__ */ React70.createElement(Divider3, null), /* @__PURE__ */ React70.createElement(DialogContent, null, /* @__PURE__ */ React70.createElement(DialogContentText, null, isError ? /* @__PURE__ */ React70.createElement(React70.Fragment, null, ADMIN_FAILED_CONTENT_TEXT_PT1, " ", /* @__PURE__ */ React70.createElement("br", null), " ", ADMIN_FAILED_CONTENT_TEXT_PT2) : ADMIN_CONTENT_TEXT)), /* @__PURE__ */ React70.createElement(DialogActions, null, /* @__PURE__ */ React70.createElement(Button3, { size: "medium", color: "secondary", onClick: () => onClose(false) }, __27("Cancel", "elementor")), /* @__PURE__ */ React70.createElement(
  Button3,
  {
    size: "medium",
    onClick: () => handleEnable(),
    variant: "contained",
    color: "primary",
    disabled: isPending
  },
  isPending ? /* @__PURE__ */ React70.createElement(CircularProgress2, { size: 24 }) : __27("Enable", "elementor")
)));

// src/controls/svg-media-control.tsx
var TILE_SIZE = 8;
var TILE_WHITE = "transparent";
var TILE_BLACK = "#c1c1c1";
var TILES_GRADIENT_FORMULA = `linear-gradient(45deg, ${TILE_BLACK} 25%, ${TILE_WHITE} 0, ${TILE_WHITE} 75%, ${TILE_BLACK} 0, ${TILE_BLACK})`;
var StyledCard = styled7(Card2)`
	background-color: white;
	background-image: ${TILES_GRADIENT_FORMULA}, ${TILES_GRADIENT_FORMULA};
	background-size: ${TILE_SIZE}px ${TILE_SIZE}px;
	background-position:
		0 0,
		${TILE_SIZE / 2}px ${TILE_SIZE / 2}px;
	border: none;
`;
var StyledCardMediaContainer = styled7(Stack13)`
	position: relative;
	height: 140px;
	object-fit: contain;
	padding: 5px;
	justify-content: center;
	align-items: center;
	background-color: rgba( 255, 255, 255, 0.37 );
`;
var MODE_BROWSE = { mode: "browse" };
var MODE_UPLOAD = { mode: "upload" };
var SvgMediaControl = createControl(() => {
  const { value, setValue } = useBoundProp(imageSrcPropTypeUtil2);
  const { id, url } = value ?? {};
  const { data: attachment, isFetching } = useWpMediaAttachment2(id?.value || null);
  const src = attachment?.url ?? url?.value ?? null;
  const { data: allowSvgUpload } = useUnfilteredFilesUpload();
  const [unfilteredModalOpenState, setUnfilteredModalOpenState] = useState14(false);
  const { isAdmin } = useCurrentUserCapabilities();
  const { open } = useWpMediaFrame2({
    mediaTypes: ["svg"],
    multiple: false,
    selected: id?.value || null,
    onSelect: (selectedAttachment) => {
      setValue({
        id: {
          $$type: "image-attachment-id",
          value: selectedAttachment.id
        },
        url: null
      });
    }
  });
  const onCloseUnfilteredModal = (enabled) => {
    setUnfilteredModalOpenState(false);
    if (enabled) {
      open(MODE_UPLOAD);
    }
  };
  const handleClick = (openOptions) => {
    if (!allowSvgUpload && openOptions === MODE_UPLOAD) {
      setUnfilteredModalOpenState(true);
    } else {
      open(openOptions);
    }
  };
  const infotipProps = {
    title: __28("Sorry, you can't upload that file yet.", "elementor"),
    description: /* @__PURE__ */ React71.createElement(React71.Fragment, null, __28("To upload them anyway, ask the site administrator to enable unfiltered", "elementor"), /* @__PURE__ */ React71.createElement("br", null), __28("file uploads.", "elementor")),
    isEnabled: !isAdmin
  };
  return /* @__PURE__ */ React71.createElement(Stack13, { gap: 1, "aria-label": "SVG Control" }, /* @__PURE__ */ React71.createElement(EnableUnfilteredModal, { open: unfilteredModalOpenState, onClose: onCloseUnfilteredModal }), /* @__PURE__ */ React71.createElement(ControlActions, null, /* @__PURE__ */ React71.createElement(StyledCard, { variant: "outlined" }, /* @__PURE__ */ React71.createElement(StyledCardMediaContainer, null, isFetching ? /* @__PURE__ */ React71.createElement(CircularProgress3, { role: "progressbar" }) : /* @__PURE__ */ React71.createElement(
    CardMedia2,
    {
      component: "img",
      image: src,
      alt: __28("Preview SVG", "elementor"),
      sx: { maxHeight: "140px", width: "50px" }
    }
  )), /* @__PURE__ */ React71.createElement(
    CardOverlay2,
    {
      sx: {
        "&:hover": {
          backgroundColor: "rgba( 0, 0, 0, 0.75 )"
        }
      }
    },
    /* @__PURE__ */ React71.createElement(Stack13, { gap: 1 }, /* @__PURE__ */ React71.createElement(
      Button4,
      {
        size: "tiny",
        color: "inherit",
        variant: "outlined",
        onClick: () => handleClick(MODE_BROWSE),
        "aria-label": "Select SVG"
      },
      __28("Select SVG", "elementor")
    ), /* @__PURE__ */ React71.createElement(ConditionalControlInfotip, { ...infotipProps }, /* @__PURE__ */ React71.createElement("span", null, /* @__PURE__ */ React71.createElement(ThemeProvider, { colorScheme: isAdmin ? "light" : "dark" }, /* @__PURE__ */ React71.createElement(
      Button4,
      {
        size: "tiny",
        variant: "text",
        color: "inherit",
        startIcon: /* @__PURE__ */ React71.createElement(UploadIcon2, null),
        disabled: !isAdmin,
        onClick: () => isAdmin && handleClick(MODE_UPLOAD),
        "aria-label": "Upload SVG"
      },
      __28("Upload", "elementor")
    )))))
  ))));
});

// src/controls/video-media-control.tsx
import * as React72 from "react";
import { videoSrcPropTypeUtil } from "@elementor/editor-props";
import { UploadIcon as UploadIcon3 } from "@elementor/icons";
import { Button as Button5, Card as Card3, CardMedia as CardMedia3, CardOverlay as CardOverlay3, CircularProgress as CircularProgress4, Stack as Stack14 } from "@elementor/ui";
import { useWpMediaAttachment as useWpMediaAttachment3, useWpMediaFrame as useWpMediaFrame3 } from "@elementor/wp-media";
import { __ as __29 } from "@wordpress/i18n";
var PLACEHOLDER_IMAGE = window.elementorCommon?.config?.urls?.assets + "/shapes/play-triangle.svg";
var VideoMediaControl = createControl(() => {
  const { value, setValue } = useBoundProp(videoSrcPropTypeUtil);
  const { id, url } = value ?? {};
  const { data: attachment, isFetching } = useWpMediaAttachment3(id?.value || null);
  const videoUrl = attachment?.url ?? url?.value ?? null;
  const { open } = useWpMediaFrame3({
    mediaTypes: ["video"],
    multiple: false,
    selected: id?.value || null,
    onSelect: (selectedAttachment) => {
      setValue({
        id: {
          $$type: "video-attachment-id",
          value: selectedAttachment.id
        },
        url: null
      });
    }
  });
  return /* @__PURE__ */ React72.createElement(ControlActions, null, /* @__PURE__ */ React72.createElement(Card3, { variant: "outlined" }, /* @__PURE__ */ React72.createElement(
    CardMedia3,
    {
      sx: {
        height: 140,
        backgroundColor: "white",
        backgroundSize: "8px 8px",
        backgroundPosition: "0 0, 4px 4px",
        backgroundRepeat: "repeat",
        backgroundImage: `${TILES_GRADIENT_FORMULA}, ${TILES_GRADIENT_FORMULA}`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }
    },
    /* @__PURE__ */ React72.createElement(VideoPreview, { isFetching, videoUrl })
  ), /* @__PURE__ */ React72.createElement(CardOverlay3, null, /* @__PURE__ */ React72.createElement(Stack14, { gap: 1 }, /* @__PURE__ */ React72.createElement(
    Button5,
    {
      size: "tiny",
      color: "inherit",
      variant: "outlined",
      onClick: () => open({ mode: "browse" })
    },
    __29("Select video", "elementor")
  ), /* @__PURE__ */ React72.createElement(
    Button5,
    {
      size: "tiny",
      variant: "text",
      color: "inherit",
      startIcon: /* @__PURE__ */ React72.createElement(UploadIcon3, null),
      onClick: () => open({ mode: "upload" })
    },
    __29("Upload", "elementor")
  )))));
});
var VideoPreview = ({ isFetching = false, videoUrl }) => {
  if (isFetching) {
    return /* @__PURE__ */ React72.createElement(CircularProgress4, null);
  }
  if (videoUrl) {
    return /* @__PURE__ */ React72.createElement(
      "video",
      {
        src: videoUrl,
        muted: true,
        preload: "metadata",
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none"
        }
      }
    );
  }
  return /* @__PURE__ */ React72.createElement("img", { src: PLACEHOLDER_IMAGE, alt: "No video selected" });
};

// src/controls/background-control/background-control.tsx
import * as React79 from "react";
import { backgroundPropTypeUtil } from "@elementor/editor-props";
import { Grid as Grid17 } from "@elementor/ui";
import { __ as __35 } from "@wordpress/i18n";

// src/controls/background-control/background-overlay/background-overlay-repeater-control.tsx
import * as React78 from "react";
import {
  backgroundColorOverlayPropTypeUtil as backgroundColorOverlayPropTypeUtil2,
  backgroundImageOverlayPropTypeUtil as backgroundImageOverlayPropTypeUtil2,
  backgroundOverlayPropTypeUtil,
  colorPropTypeUtil as colorPropTypeUtil3
} from "@elementor/editor-props";
import { Box as Box13, CardMedia as CardMedia4, styled as styled8, Tab, TabPanel, Tabs, UnstableColorIndicator as UnstableColorIndicator3 } from "@elementor/ui";
import { useWpMediaAttachment as useWpMediaAttachment4 } from "@elementor/wp-media";
import { __ as __34 } from "@wordpress/i18n";

// src/env.ts
import { parseEnv } from "@elementor/env";
var { env } = parseEnv("@elementor/editor-controls");

// src/controls/background-control/background-gradient-color-control.tsx
import * as React73 from "react";
import {
  backgroundGradientOverlayPropTypeUtil,
  colorPropTypeUtil as colorPropTypeUtil2,
  colorStopPropTypeUtil,
  gradientColorStopPropTypeUtil,
  numberPropTypeUtil as numberPropTypeUtil3,
  stringPropTypeUtil as stringPropTypeUtil10
} from "@elementor/editor-props";
import { UnstableGradientBox } from "@elementor/ui";
var BackgroundGradientColorControl = createControl(() => {
  const { value, setValue } = useBoundProp(backgroundGradientOverlayPropTypeUtil);
  const handleChange = (newValue) => {
    const transformedValue = createTransformableValue(newValue);
    if (transformedValue.positions) {
      transformedValue.positions = stringPropTypeUtil10.create(newValue.positions.join(" "));
    }
    setValue(transformedValue);
  };
  const createTransformableValue = (newValue) => ({
    ...newValue,
    type: stringPropTypeUtil10.create(newValue.type),
    angle: numberPropTypeUtil3.create(newValue.angle),
    stops: gradientColorStopPropTypeUtil.create(
      newValue.stops.map(
        ({ color, offset }) => colorStopPropTypeUtil.create({
          color: colorPropTypeUtil2.create(color),
          offset: numberPropTypeUtil3.create(offset)
        })
      )
    )
  });
  const normalizeValue = () => {
    if (!value) {
      return;
    }
    const { type, angle, stops, positions } = value;
    return {
      type: type.value,
      angle: angle?.value || 0,
      stops: stops.value.map(({ value: { color, offset } }) => ({
        color: color.value,
        offset: offset.value
      })),
      positions: positions?.value.split(" ")
    };
  };
  return /* @__PURE__ */ React73.createElement(
    UnstableGradientBox,
    {
      sx: { width: "auto", padding: 1.5 },
      value: normalizeValue(),
      onChange: handleChange
    }
  );
});
var initialBackgroundGradientOverlay = backgroundGradientOverlayPropTypeUtil.create({
  type: stringPropTypeUtil10.create("linear"),
  angle: numberPropTypeUtil3.create(180),
  stops: gradientColorStopPropTypeUtil.create([
    colorStopPropTypeUtil.create({
      color: colorPropTypeUtil2.create("rgb(0,0,0)"),
      offset: numberPropTypeUtil3.create(0)
    }),
    colorStopPropTypeUtil.create({
      color: colorPropTypeUtil2.create("rgb(255,255,255)"),
      offset: numberPropTypeUtil3.create(100)
    })
  ])
});

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-attachment.tsx
import * as React74 from "react";
import { PinIcon, PinnedOffIcon } from "@elementor/icons";
import { Grid as Grid13 } from "@elementor/ui";
import { __ as __30 } from "@wordpress/i18n";
var attachmentControlOptions = [
  {
    value: "fixed",
    label: __30("Fixed", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React74.createElement(PinIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "scroll",
    label: __30("Scroll", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React74.createElement(PinnedOffIcon, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlayAttachment = () => {
  return /* @__PURE__ */ React74.createElement(PopoverGridContainer, null, /* @__PURE__ */ React74.createElement(Grid13, { item: true, xs: 6 }, /* @__PURE__ */ React74.createElement(ControlFormLabel, null, __30("Attachment", "elementor"))), /* @__PURE__ */ React74.createElement(Grid13, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end", overflow: "hidden" } }, /* @__PURE__ */ React74.createElement(ToggleControl, { options: attachmentControlOptions })));
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-position.tsx
import * as React75 from "react";
import { useRef as useRef11 } from "react";
import { backgroundImagePositionOffsetPropTypeUtil, stringPropTypeUtil as stringPropTypeUtil11 } from "@elementor/editor-props";
import { MenuListItem as MenuListItem5 } from "@elementor/editor-ui";
import { LetterXIcon, LetterYIcon } from "@elementor/icons";
import { Grid as Grid14, Select as Select4 } from "@elementor/ui";
import { __ as __31 } from "@wordpress/i18n";
var backgroundPositionOptions = [
  { label: __31("Center center", "elementor"), value: "center center" },
  { label: __31("Center left", "elementor"), value: "center left" },
  { label: __31("Center right", "elementor"), value: "center right" },
  { label: __31("Top center", "elementor"), value: "top center" },
  { label: __31("Top left", "elementor"), value: "top left" },
  { label: __31("Top right", "elementor"), value: "top right" },
  { label: __31("Bottom center", "elementor"), value: "bottom center" },
  { label: __31("Bottom left", "elementor"), value: "bottom left" },
  { label: __31("Bottom right", "elementor"), value: "bottom right" },
  { label: __31("Custom", "elementor"), value: "custom" }
];
var BackgroundImageOverlayPosition = () => {
  const backgroundImageOffsetContext = useBoundProp(backgroundImagePositionOffsetPropTypeUtil);
  const stringPropContext = useBoundProp(stringPropTypeUtil11);
  const isCustom = !!backgroundImageOffsetContext.value;
  const rowRef = useRef11(null);
  const handlePositionChange = (event) => {
    const value = event.target.value || null;
    if (value === "custom") {
      backgroundImageOffsetContext.setValue({ x: null, y: null });
    } else {
      stringPropContext.setValue(value);
    }
  };
  return /* @__PURE__ */ React75.createElement(Grid14, { container: true, spacing: 1.5 }, /* @__PURE__ */ React75.createElement(Grid14, { item: true, xs: 12 }, /* @__PURE__ */ React75.createElement(PopoverGridContainer, null, /* @__PURE__ */ React75.createElement(Grid14, { item: true, xs: 6 }, /* @__PURE__ */ React75.createElement(ControlFormLabel, null, __31("Position", "elementor"))), /* @__PURE__ */ React75.createElement(Grid14, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end", overflow: "hidden" } }, /* @__PURE__ */ React75.createElement(ControlActions, null, /* @__PURE__ */ React75.createElement(
    Select4,
    {
      fullWidth: true,
      size: "tiny",
      onChange: handlePositionChange,
      disabled: stringPropContext.disabled,
      value: (backgroundImageOffsetContext.value ? "custom" : stringPropContext.value) ?? ""
    },
    backgroundPositionOptions.map(({ label, value }) => /* @__PURE__ */ React75.createElement(MenuListItem5, { key: value, value: value ?? "" }, label))
  ))))), isCustom ? /* @__PURE__ */ React75.createElement(PropProvider, { ...backgroundImageOffsetContext }, /* @__PURE__ */ React75.createElement(Grid14, { item: true, xs: 12 }, /* @__PURE__ */ React75.createElement(Grid14, { container: true, spacing: 1.5, ref: rowRef }, /* @__PURE__ */ React75.createElement(Grid14, { item: true, xs: 6 }, /* @__PURE__ */ React75.createElement(PropKeyProvider, { bind: "x" }, /* @__PURE__ */ React75.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React75.createElement(LetterXIcon, { fontSize: "tiny" }),
      anchorRef: rowRef,
      min: -Number.MAX_SAFE_INTEGER
    }
  ))), /* @__PURE__ */ React75.createElement(Grid14, { item: true, xs: 6 }, /* @__PURE__ */ React75.createElement(PropKeyProvider, { bind: "y" }, /* @__PURE__ */ React75.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React75.createElement(LetterYIcon, { fontSize: "tiny" }),
      anchorRef: rowRef,
      min: -Number.MAX_SAFE_INTEGER
    }
  )))))) : null);
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-repeat.tsx
import * as React76 from "react";
import { DotsHorizontalIcon, DotsVerticalIcon, GridDotsIcon, XIcon as XIcon3 } from "@elementor/icons";
import { Grid as Grid15 } from "@elementor/ui";
import { __ as __32 } from "@wordpress/i18n";
var repeatControlOptions = [
  {
    value: "repeat",
    label: __32("Repeat", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React76.createElement(GridDotsIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "repeat-x",
    label: __32("Repeat-x", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React76.createElement(DotsHorizontalIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "repeat-y",
    label: __32("Repeat-y", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React76.createElement(DotsVerticalIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "no-repeat",
    label: __32("No-repeat", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React76.createElement(XIcon3, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlayRepeat = () => {
  return /* @__PURE__ */ React76.createElement(PopoverGridContainer, null, /* @__PURE__ */ React76.createElement(Grid15, { item: true, xs: 6 }, /* @__PURE__ */ React76.createElement(ControlFormLabel, null, __32("Repeat", "elementor"))), /* @__PURE__ */ React76.createElement(Grid15, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React76.createElement(ToggleControl, { options: repeatControlOptions })));
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-size.tsx
import * as React77 from "react";
import { useRef as useRef12 } from "react";
import { backgroundImageSizeScalePropTypeUtil, stringPropTypeUtil as stringPropTypeUtil12 } from "@elementor/editor-props";
import {
  ArrowBarBothIcon,
  ArrowsMaximizeIcon,
  ArrowsMoveHorizontalIcon as ArrowsMoveHorizontalIcon2,
  ArrowsMoveVerticalIcon as ArrowsMoveVerticalIcon2,
  LetterAIcon,
  PencilIcon
} from "@elementor/icons";
import { Grid as Grid16 } from "@elementor/ui";
import { __ as __33 } from "@wordpress/i18n";
var sizeControlOptions = [
  {
    value: "auto",
    label: __33("Auto", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(LetterAIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "cover",
    label: __33("Cover", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(ArrowsMaximizeIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "contain",
    label: __33("Contain", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(ArrowBarBothIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "custom",
    label: __33("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(PencilIcon, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlaySize = () => {
  const backgroundImageScaleContext = useBoundProp(backgroundImageSizeScalePropTypeUtil);
  const stringPropContext = useBoundProp(stringPropTypeUtil12);
  const isCustom = !!backgroundImageScaleContext.value;
  const rowRef = useRef12(null);
  const handleSizeChange = (size) => {
    if (size === "custom") {
      backgroundImageScaleContext.setValue({ width: null, height: null });
    } else {
      stringPropContext.setValue(size);
    }
  };
  return /* @__PURE__ */ React77.createElement(Grid16, { container: true, spacing: 1.5 }, /* @__PURE__ */ React77.createElement(Grid16, { item: true, xs: 12 }, /* @__PURE__ */ React77.createElement(PopoverGridContainer, null, /* @__PURE__ */ React77.createElement(Grid16, { item: true, xs: 6 }, /* @__PURE__ */ React77.createElement(ControlFormLabel, null, __33("Size", "elementor"))), /* @__PURE__ */ React77.createElement(Grid16, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React77.createElement(
    ControlToggleButtonGroup,
    {
      exclusive: true,
      items: sizeControlOptions,
      onChange: handleSizeChange,
      disabled: stringPropContext.disabled,
      value: backgroundImageScaleContext.value ? "custom" : stringPropContext.value
    }
  )))), isCustom ? /* @__PURE__ */ React77.createElement(PropProvider, { ...backgroundImageScaleContext }, /* @__PURE__ */ React77.createElement(Grid16, { item: true, xs: 12, ref: rowRef }, /* @__PURE__ */ React77.createElement(PopoverGridContainer, null, /* @__PURE__ */ React77.createElement(Grid16, { item: true, xs: 6 }, /* @__PURE__ */ React77.createElement(PropKeyProvider, { bind: "width" }, /* @__PURE__ */ React77.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React77.createElement(ArrowsMoveHorizontalIcon2, { fontSize: "tiny" }),
      extendedOptions: ["auto"],
      anchorRef: rowRef
    }
  ))), /* @__PURE__ */ React77.createElement(Grid16, { item: true, xs: 6 }, /* @__PURE__ */ React77.createElement(PropKeyProvider, { bind: "height" }, /* @__PURE__ */ React77.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React77.createElement(ArrowsMoveVerticalIcon2, { fontSize: "tiny" }),
      extendedOptions: ["auto"],
      anchorRef: rowRef
    }
  )))))) : null);
};

// src/controls/background-control/background-overlay/use-background-tabs-history.ts
import { useRef as useRef13 } from "react";
import {
  backgroundColorOverlayPropTypeUtil,
  backgroundGradientOverlayPropTypeUtil as backgroundGradientOverlayPropTypeUtil2,
  backgroundImageOverlayPropTypeUtil
} from "@elementor/editor-props";
import { useTabs } from "@elementor/ui";
var useBackgroundTabsHistory = ({
  color: initialBackgroundColorOverlay2,
  image: initialBackgroundImageOverlay,
  gradient: initialBackgroundGradientOverlay2
}) => {
  const { value: imageValue, setValue: setImageValue } = useBoundProp(backgroundImageOverlayPropTypeUtil);
  const { value: colorValue, setValue: setColorValue } = useBoundProp(backgroundColorOverlayPropTypeUtil);
  const { value: gradientValue, setValue: setGradientValue } = useBoundProp(backgroundGradientOverlayPropTypeUtil2);
  const getCurrentOverlayType = () => {
    if (colorValue) {
      return "color";
    }
    if (gradientValue) {
      return "gradient";
    }
    return "image";
  };
  const { getTabsProps, getTabProps, getTabPanelProps } = useTabs(getCurrentOverlayType());
  const valuesHistory = useRef13({
    image: initialBackgroundImageOverlay,
    color: initialBackgroundColorOverlay2,
    gradient: initialBackgroundGradientOverlay2
  });
  const saveToHistory = (key, value) => {
    if (value) {
      valuesHistory.current[key] = value;
    }
  };
  const onTabChange = (e, tabName) => {
    switch (tabName) {
      case "image":
        setImageValue(valuesHistory.current.image);
        saveToHistory("color", colorValue);
        saveToHistory("gradient", gradientValue);
        break;
      case "gradient":
        setGradientValue(valuesHistory.current.gradient);
        saveToHistory("color", colorValue);
        saveToHistory("image", imageValue);
        break;
      case "color":
        setColorValue(valuesHistory.current.color);
        saveToHistory("image", imageValue);
        saveToHistory("gradient", gradientValue);
    }
    return getTabsProps().onChange(e, tabName);
  };
  return {
    getTabProps,
    getTabPanelProps,
    getTabsProps: () => ({ ...getTabsProps(), onChange: onTabChange })
  };
};

// src/controls/background-control/background-overlay/background-overlay-repeater-control.tsx
var DEFAULT_BACKGROUND_COLOR_OVERLAY_COLOR = "#00000033";
var initialBackgroundColorOverlay = backgroundColorOverlayPropTypeUtil2.create(
  {
    color: colorPropTypeUtil3.create(DEFAULT_BACKGROUND_COLOR_OVERLAY_COLOR)
  }
);
var getInitialBackgroundOverlay = () => ({
  $$type: "background-image-overlay",
  value: {
    image: {
      $$type: "image",
      value: {
        src: {
          $$type: "image-src",
          value: {
            url: {
              $$type: "url",
              value: env.background_placeholder_image
            },
            id: null
          }
        },
        size: {
          $$type: "string",
          value: "large"
        }
      }
    }
  }
});
var backgroundResolutionOptions = [
  { label: __34("Thumbnail - 150 x 150", "elementor"), value: "thumbnail" },
  { label: __34("Medium - 300 x 300", "elementor"), value: "medium" },
  { label: __34("Large 1024 x 1024", "elementor"), value: "large" },
  { label: __34("Full", "elementor"), value: "full" }
];
var BackgroundOverlayRepeaterControl = createControl(() => {
  const { propType, value: overlayValues, setValue } = useBoundProp(backgroundOverlayPropTypeUtil);
  return /* @__PURE__ */ React78.createElement(PropProvider, { propType, value: overlayValues, setValue }, /* @__PURE__ */ React78.createElement(
    ControlRepeater,
    {
      initial: getInitialBackgroundOverlay(),
      propTypeUtil: backgroundOverlayPropTypeUtil
    },
    /* @__PURE__ */ React78.createElement(RepeaterHeader, { label: __34("Overlay", "elementor") }, /* @__PURE__ */ React78.createElement(TooltipAddItemAction, { newItemIndex: 0 })),
    /* @__PURE__ */ React78.createElement(ItemsContainer, null, /* @__PURE__ */ React78.createElement(
      Item,
      {
        Icon: ItemIcon2,
        Label: ItemLabel2,
        actions: /* @__PURE__ */ React78.createElement(React78.Fragment, null, /* @__PURE__ */ React78.createElement(DuplicateItemAction, null), /* @__PURE__ */ React78.createElement(DisableItemAction, null), /* @__PURE__ */ React78.createElement(RemoveItemAction, null))
      }
    )),
    /* @__PURE__ */ React78.createElement(EditItemPopover, null, /* @__PURE__ */ React78.createElement(ItemContent, null))
  ));
});
var ItemContent = () => {
  const { getTabsProps, getTabProps, getTabPanelProps } = useBackgroundTabsHistory({
    image: getInitialBackgroundOverlay().value,
    color: initialBackgroundColorOverlay.value,
    gradient: initialBackgroundGradientOverlay.value
  });
  const { rowRef } = useRepeaterContext();
  return /* @__PURE__ */ React78.createElement(Box13, { sx: { width: "100%" } }, /* @__PURE__ */ React78.createElement(Box13, { sx: { borderBottom: 1, borderColor: "divider" } }, /* @__PURE__ */ React78.createElement(
    Tabs,
    {
      size: "small",
      variant: "fullWidth",
      ...getTabsProps(),
      "aria-label": __34("Background Overlay", "elementor")
    },
    /* @__PURE__ */ React78.createElement(Tab, { label: __34("Image", "elementor"), ...getTabProps("image") }),
    /* @__PURE__ */ React78.createElement(Tab, { label: __34("Gradient", "elementor"), ...getTabProps("gradient") }),
    /* @__PURE__ */ React78.createElement(Tab, { label: __34("Color", "elementor"), ...getTabProps("color") })
  )), /* @__PURE__ */ React78.createElement(TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("image") }, /* @__PURE__ */ React78.createElement(PopoverContent, null, /* @__PURE__ */ React78.createElement(ImageOverlayContent, null))), /* @__PURE__ */ React78.createElement(TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("gradient") }, /* @__PURE__ */ React78.createElement(BackgroundGradientColorControl, null)), /* @__PURE__ */ React78.createElement(TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("color") }, /* @__PURE__ */ React78.createElement(PopoverContent, null, /* @__PURE__ */ React78.createElement(ColorOverlayContent, { anchorEl: rowRef }))));
};
var ItemIcon2 = ({ value }) => {
  switch (value.$$type) {
    case "background-image-overlay":
      return /* @__PURE__ */ React78.createElement(ItemIconImage, { value });
    case "background-color-overlay":
      return /* @__PURE__ */ React78.createElement(ItemIconColor, { value });
    case "background-gradient-overlay":
      return /* @__PURE__ */ React78.createElement(ItemIconGradient, { value });
    default:
      return null;
  }
};
var extractColorFrom = (prop) => {
  if (prop?.value?.color?.value) {
    return prop.value.color.value;
  }
  return "";
};
var ItemIconColor = ({ value: prop }) => {
  const color = extractColorFrom(prop);
  return /* @__PURE__ */ React78.createElement(StyledUnstableColorIndicator3, { size: "inherit", component: "span", value: color });
};
var ItemIconImage = ({ value }) => {
  const { imageUrl } = useImage(value);
  return /* @__PURE__ */ React78.createElement(
    CardMedia4,
    {
      image: imageUrl,
      sx: (theme) => ({
        height: "1rem",
        width: "1rem",
        borderRadius: `${theme.shape.borderRadius / 2}px`,
        outline: `1px solid ${theme.palette.action.disabled}`
      })
    }
  );
};
var ItemIconGradient = ({ value }) => {
  const gradient = getGradientValue(value);
  return /* @__PURE__ */ React78.createElement(StyledUnstableColorIndicator3, { size: "inherit", component: "span", value: gradient });
};
var ItemLabel2 = ({ value }) => {
  switch (value.$$type) {
    case "background-image-overlay":
      return /* @__PURE__ */ React78.createElement(ItemLabelImage, { value });
    case "background-color-overlay":
      return /* @__PURE__ */ React78.createElement(ItemLabelColor, { value });
    case "background-gradient-overlay":
      return /* @__PURE__ */ React78.createElement(ItemLabelGradient, { value });
    default:
      return null;
  }
};
var ItemLabelColor = ({ value: prop }) => {
  const color = extractColorFrom(prop);
  return /* @__PURE__ */ React78.createElement("span", null, color);
};
var ItemLabelImage = ({ value }) => {
  const { imageTitle } = useImage(value);
  return /* @__PURE__ */ React78.createElement("span", null, imageTitle);
};
var ItemLabelGradient = ({ value }) => {
  if (value.value.type.value === "linear") {
    return /* @__PURE__ */ React78.createElement("span", null, __34("Linear Gradient", "elementor"));
  }
  return /* @__PURE__ */ React78.createElement("span", null, __34("Radial Gradient", "elementor"));
};
var ColorOverlayContent = ({ anchorEl }) => {
  const propContext = useBoundProp(backgroundColorOverlayPropTypeUtil2);
  return /* @__PURE__ */ React78.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "color" }, /* @__PURE__ */ React78.createElement(ColorControl, { anchorEl })));
};
var ImageOverlayContent = () => {
  const propContext = useBoundProp(backgroundImageOverlayPropTypeUtil2);
  return /* @__PURE__ */ React78.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "image" }, /* @__PURE__ */ React78.createElement(ImageControl, { sizes: backgroundResolutionOptions })), /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "position" }, /* @__PURE__ */ React78.createElement(BackgroundImageOverlayPosition, null)), /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "repeat" }, /* @__PURE__ */ React78.createElement(BackgroundImageOverlayRepeat, null)), /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "size" }, /* @__PURE__ */ React78.createElement(BackgroundImageOverlaySize, null)), /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "attachment" }, /* @__PURE__ */ React78.createElement(BackgroundImageOverlayAttachment, null)));
};
var StyledUnstableColorIndicator3 = styled8(UnstableColorIndicator3)(({ theme }) => ({
  height: "1rem",
  width: "1rem",
  borderRadius: `${theme.shape.borderRadius / 2}px`
}));
var useImage = (image) => {
  let imageTitle, imageUrl = null;
  const imageSrc = image?.value.image.value?.src.value;
  const { data: attachment } = useWpMediaAttachment4(imageSrc.id?.value || null);
  if (imageSrc.id) {
    const imageFileTypeExtension = getFileExtensionFromFilename(attachment?.filename);
    imageTitle = `${attachment?.title}${imageFileTypeExtension}` || null;
    imageUrl = attachment?.url || null;
  } else if (imageSrc.url) {
    imageUrl = imageSrc.url.value;
    imageTitle = imageUrl?.substring(imageUrl.lastIndexOf("/") + 1) || null;
  }
  return { imageTitle, imageUrl };
};
var getFileExtensionFromFilename = (filename) => {
  if (!filename) {
    return "";
  }
  const extension = filename.substring(filename.lastIndexOf(".") + 1);
  return `.${extension}`;
};
var getGradientValue = (value) => {
  const gradient = value.value;
  const stops = gradient.stops.value?.map(({ value: { color, offset } }) => `${color.value} ${offset.value ?? 0}%`)?.join(",");
  if (gradient.type.value === "linear") {
    return `linear-gradient(${gradient.angle.value}deg, ${stops})`;
  }
  return `radial-gradient(circle at ${gradient.positions.value}, ${stops})`;
};

// src/controls/background-control/background-control.tsx
var clipOptions = [
  { label: __35("Full element", "elementor"), value: "border-box" },
  { label: __35("Padding edges", "elementor"), value: "padding-box" },
  { label: __35("Content edges", "elementor"), value: "content-box" },
  { label: __35("Text", "elementor"), value: "text" }
];
var colorLabel = __35("Color", "elementor");
var clipLabel = __35("Clipping", "elementor");
var BackgroundControl = createControl(() => {
  const propContext = useBoundProp(backgroundPropTypeUtil);
  return /* @__PURE__ */ React79.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React79.createElement(PropKeyProvider, { bind: "background-overlay" }, /* @__PURE__ */ React79.createElement(BackgroundOverlayRepeaterControl, null)), /* @__PURE__ */ React79.createElement(BackgroundColorField, null), /* @__PURE__ */ React79.createElement(BackgroundClipField, null));
});
var BackgroundColorField = () => {
  return /* @__PURE__ */ React79.createElement(PropKeyProvider, { bind: "color" }, /* @__PURE__ */ React79.createElement(Grid17, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React79.createElement(Grid17, { item: true, xs: 6 }, /* @__PURE__ */ React79.createElement(ControlLabel, null, colorLabel)), /* @__PURE__ */ React79.createElement(Grid17, { item: true, xs: 6 }, /* @__PURE__ */ React79.createElement(ColorControl, null))));
};
var BackgroundClipField = () => {
  return /* @__PURE__ */ React79.createElement(PropKeyProvider, { bind: "clip" }, /* @__PURE__ */ React79.createElement(Grid17, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React79.createElement(Grid17, { item: true, xs: 6 }, /* @__PURE__ */ React79.createElement(ControlLabel, null, clipLabel)), /* @__PURE__ */ React79.createElement(Grid17, { item: true, xs: 6 }, /* @__PURE__ */ React79.createElement(SelectControl, { options: clipOptions }))));
};

// src/controls/repeatable-control.tsx
import * as React80 from "react";
import { useMemo as useMemo9 } from "react";
import { createArrayPropUtils } from "@elementor/editor-props";
import { Box as Box14 } from "@elementor/ui";
var PLACEHOLDER_REGEX = /\$\{([^}]+)\}/g;
var RepeatableControl = createControl(
  ({
    repeaterLabel,
    childControlConfig,
    showDuplicate,
    showToggle,
    initialValues,
    patternLabel,
    placeholder,
    propKey,
    addItemTooltipProps
  }) => {
    const { propTypeUtil: childPropTypeUtil, isItemDisabled: isItemDisabled2 } = childControlConfig;
    if (!childPropTypeUtil) {
      return null;
    }
    const childArrayPropTypeUtil2 = useMemo9(
      () => createArrayPropUtils(childPropTypeUtil.key, childPropTypeUtil.schema, propKey),
      [childPropTypeUtil.key, childPropTypeUtil.schema, propKey]
    );
    const contextValue = useMemo9(
      () => ({
        ...childControlConfig,
        placeholder: placeholder || "",
        patternLabel: patternLabel || ""
      }),
      [childControlConfig, placeholder, patternLabel]
    );
    const { propType, value, setValue } = useBoundProp(childArrayPropTypeUtil2);
    return /* @__PURE__ */ React80.createElement(PropProvider, { propType, value, setValue }, /* @__PURE__ */ React80.createElement(RepeatableControlContext.Provider, { value: contextValue }, /* @__PURE__ */ React80.createElement(
      ControlRepeater,
      {
        initial: childPropTypeUtil.create(initialValues || null),
        propTypeUtil: childArrayPropTypeUtil2,
        isItemDisabled: isItemDisabled2
      },
      /* @__PURE__ */ React80.createElement(RepeaterHeader, { label: repeaterLabel }, /* @__PURE__ */ React80.createElement(
        TooltipAddItemAction,
        {
          ...addItemTooltipProps,
          newItemIndex: 0,
          ariaLabel: repeaterLabel
        }
      )),
      /* @__PURE__ */ React80.createElement(ItemsContainer, { isSortable: false }, /* @__PURE__ */ React80.createElement(
        Item,
        {
          Icon: ItemIcon3,
          Label: ItemLabel3,
          actions: /* @__PURE__ */ React80.createElement(React80.Fragment, null, showDuplicate && /* @__PURE__ */ React80.createElement(DuplicateItemAction, null), showToggle && /* @__PURE__ */ React80.createElement(DisableItemAction, null), /* @__PURE__ */ React80.createElement(RemoveItemAction, null))
        }
      )),
      /* @__PURE__ */ React80.createElement(EditItemPopover, null, /* @__PURE__ */ React80.createElement(Content2, null))
    )));
  }
);
var ItemIcon3 = () => /* @__PURE__ */ React80.createElement(React80.Fragment, null);
var Content2 = () => {
  const { component: ChildControl, props = {} } = useRepeatableControlContext();
  return /* @__PURE__ */ React80.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React80.createElement(PopoverGridContainer, null, /* @__PURE__ */ React80.createElement(ChildControl, { ...props })));
};
var interpolate = (template, data) => {
  if (!data) {
    return template;
  }
  return template.replace(PLACEHOLDER_REGEX, (_, path) => {
    const value = getNestedValue(data, path);
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      if ("name" in value && value.name) {
        return value.name;
      }
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return String(value ?? "");
  });
};
var getNestedValue = (obj, path) => {
  let parentObj = {};
  const pathKeys = path.split(".");
  const key = pathKeys.slice(-1)[0];
  let value = pathKeys.reduce((current, currentKey, currentIndex) => {
    if (currentIndex === pathKeys.length - 2) {
      parentObj = current;
    }
    if (current && typeof current === "object") {
      return current[currentKey];
    }
    return {};
  }, obj);
  value = !!value ? value : "";
  const propType = parentObj?.$$type;
  const propValue = parentObj?.value;
  const doesValueRepresentCustomSize = key === "unit" && propType === "size" && propValue?.unit === "custom";
  if (!doesValueRepresentCustomSize) {
    return value;
  }
  return propValue?.size ? "" : CUSTOM_SIZE_LABEL;
};
var isEmptyValue = (val) => {
  if (typeof val === "string") {
    return val.trim() === "";
  }
  if (Number.isNaN(val)) {
    return true;
  }
  if (Array.isArray(val)) {
    return val.length === 0;
  }
  if (typeof val === "object" && val !== null) {
    return Object.keys(val).length === 0;
  }
  return false;
};
var shouldShowPlaceholder = (pattern, data) => {
  const propertyPaths = getAllProperties(pattern);
  const values = propertyPaths.map((path) => getNestedValue(data, path));
  if (values.length === 0) {
    return false;
  }
  if (values.some((value) => value === null || value === void 0)) {
    return true;
  }
  if (values.every(isEmptyValue)) {
    return true;
  }
  return false;
};
var getTextColor = (isReadOnly, showPlaceholder) => {
  if (isReadOnly) {
    return "text.disabled";
  }
  return showPlaceholder ? "text.tertiary" : "text.primary";
};
var ItemLabel3 = ({ value }) => {
  const { placeholder, patternLabel, props: childProps } = useRepeatableControlContext();
  const showPlaceholder = shouldShowPlaceholder(patternLabel, value);
  const label = showPlaceholder ? placeholder : interpolate(patternLabel, value);
  const isReadOnly = !!childProps?.readOnly;
  const color = getTextColor(isReadOnly, showPlaceholder);
  return /* @__PURE__ */ React80.createElement(Box14, { component: "span", color }, label);
};
var getAllProperties = (pattern) => {
  const properties = pattern.match(PLACEHOLDER_REGEX)?.map((match) => match.slice(2, -1)) || [];
  return properties;
};

// src/controls/key-value-control.tsx
import * as React81 from "react";
import { useMemo as useMemo10, useState as useState15 } from "react";
import {
  isTransformable,
  keyValuePropTypeUtil,
  stringPropTypeUtil as stringPropTypeUtil13
} from "@elementor/editor-props";
import { FormHelperText, FormLabel as FormLabel3, Grid as Grid18 } from "@elementor/ui";
import { __ as __36 } from "@wordpress/i18n";

// src/utils/escape-html-attr.ts
var escapeHtmlAttr = (value) => {
  const specialChars = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  };
  return value.replace(/[&<>'"]/g, (char) => specialChars[char] || char);
};

// src/controls/key-value-control.tsx
var getInitialFieldValue = (fieldValue) => {
  const transformableValue = fieldValue;
  if (!fieldValue || typeof fieldValue !== "object" || transformableValue.$$type === "dynamic") {
    return "";
  }
  return transformableValue.value || "";
};
var KeyValueControl = createControl((props = {}) => {
  const { value, setValue, ...propContext } = useBoundProp(keyValuePropTypeUtil);
  const [keyError, setKeyError] = useState15("");
  const [valueError, setValueError] = useState15("");
  const [sessionState, setSessionState] = useState15({
    key: getInitialFieldValue(value?.key),
    value: getInitialFieldValue(value?.value)
  });
  const keyLabel = props.keyName || __36("Key", "elementor");
  const valueLabel = props.valueName || __36("Value", "elementor");
  const { keyHelper, valueHelper } = props.getHelperText?.(sessionState.key, sessionState.value) || {
    keyHelper: void 0,
    valueHelper: void 0
  };
  const [keyRegex, valueRegex, errMsg] = useMemo10(
    () => [
      props.regexKey ? new RegExp(props.regexKey) : void 0,
      props.regexValue ? new RegExp(props.regexValue) : void 0,
      props.validationErrorMessage || __36("Invalid Format", "elementor")
    ],
    [props.regexKey, props.regexValue, props.validationErrorMessage]
  );
  const validate = (newValue, fieldType) => {
    if (fieldType === "key" && keyRegex) {
      const isValid = keyRegex.test(newValue);
      setKeyError(isValid ? "" : errMsg);
      return isValid;
    } else if (fieldType === "value" && valueRegex) {
      const isValid = valueRegex.test(newValue);
      setValueError(isValid ? "" : errMsg);
      return isValid;
    }
    return true;
  };
  const handleChange = (newValue, options, meta) => {
    const fieldType = meta?.bind;
    if (!fieldType) {
      return;
    }
    const newChangedValue = newValue[fieldType];
    if (isTransformable(newChangedValue) && newChangedValue.$$type === "dynamic") {
      setValue({
        ...value,
        [fieldType]: newChangedValue
      });
      return;
    }
    const extractedValue = stringPropTypeUtil13.extract(newChangedValue);
    setSessionState((prev) => ({
      ...prev,
      [fieldType]: extractedValue
    }));
    if (extractedValue && validate(extractedValue, fieldType)) {
      setValue({
        ...value,
        [fieldType]: newChangedValue
      });
    } else {
      setValue({
        ...value,
        [fieldType]: {
          value: "",
          $$type: "string"
        }
      });
    }
  };
  return /* @__PURE__ */ React81.createElement(PropProvider, { ...propContext, value, setValue: handleChange }, /* @__PURE__ */ React81.createElement(Grid18, { container: true, gap: 1.5 }, /* @__PURE__ */ React81.createElement(Grid18, { item: true, xs: 12, display: "flex", flexDirection: "column" }, /* @__PURE__ */ React81.createElement(FormLabel3, { size: "tiny", sx: { pb: 1 } }, keyLabel), /* @__PURE__ */ React81.createElement(PropKeyProvider, { bind: "key" }, /* @__PURE__ */ React81.createElement(
    TextControl,
    {
      inputValue: props.escapeHtml ? escapeHtmlAttr(sessionState.key) : sessionState.key,
      error: !!keyError,
      helperText: keyHelper
    }
  )), !!keyError && /* @__PURE__ */ React81.createElement(FormHelperText, { error: true }, keyError)), /* @__PURE__ */ React81.createElement(Grid18, { item: true, xs: 12, display: "flex", flexDirection: "column" }, /* @__PURE__ */ React81.createElement(FormLabel3, { size: "tiny", sx: { pb: 1 } }, valueLabel), /* @__PURE__ */ React81.createElement(PropKeyProvider, { bind: "value" }, /* @__PURE__ */ React81.createElement(
    TextControl,
    {
      inputValue: props.escapeHtml ? escapeHtmlAttr(sessionState.value) : sessionState.value,
      error: !!valueError,
      inputDisabled: !!keyError,
      helperText: valueHelper
    }
  )), !!valueError && /* @__PURE__ */ React81.createElement(FormHelperText, { error: true }, valueError))));
});

// src/controls/position-control.tsx
import * as React82 from "react";
import { positionPropTypeUtil, stringPropTypeUtil as stringPropTypeUtil14 } from "@elementor/editor-props";
import { MenuListItem as MenuListItem6 } from "@elementor/editor-ui";
import { LetterXIcon as LetterXIcon2, LetterYIcon as LetterYIcon2 } from "@elementor/icons";
import { Grid as Grid19, Select as Select5 } from "@elementor/ui";
import { __ as __37 } from "@wordpress/i18n";
var positionOptions = [
  { label: __37("Center center", "elementor"), value: "center center" },
  { label: __37("Center left", "elementor"), value: "center left" },
  { label: __37("Center right", "elementor"), value: "center right" },
  { label: __37("Top center", "elementor"), value: "top center" },
  { label: __37("Top left", "elementor"), value: "top left" },
  { label: __37("Top right", "elementor"), value: "top right" },
  { label: __37("Bottom center", "elementor"), value: "bottom center" },
  { label: __37("Bottom left", "elementor"), value: "bottom left" },
  { label: __37("Bottom right", "elementor"), value: "bottom right" },
  { label: __37("Custom", "elementor"), value: "custom" }
];
var PositionControl = () => {
  const positionContext = useBoundProp(positionPropTypeUtil);
  const stringPropContext = useBoundProp(stringPropTypeUtil14);
  const isCustom = !!positionContext.value;
  const handlePositionChange = (event) => {
    const value = event.target.value || null;
    if (value === "custom") {
      positionContext.setValue({ x: null, y: null });
    } else {
      stringPropContext.setValue(value);
    }
  };
  return /* @__PURE__ */ React82.createElement(Grid19, { container: true, spacing: 1.5 }, /* @__PURE__ */ React82.createElement(Grid19, { item: true, xs: 12 }, /* @__PURE__ */ React82.createElement(Grid19, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React82.createElement(Grid19, { item: true, xs: 6 }, /* @__PURE__ */ React82.createElement(ControlFormLabel, null, __37("Object position", "elementor"))), /* @__PURE__ */ React82.createElement(Grid19, { item: true, xs: 6, sx: { overflow: "hidden" } }, /* @__PURE__ */ React82.createElement(
    Select5,
    {
      size: "tiny",
      disabled: stringPropContext.disabled,
      value: (positionContext.value ? "custom" : stringPropContext.value) ?? "",
      onChange: handlePositionChange,
      fullWidth: true
    },
    positionOptions.map(({ label, value }) => /* @__PURE__ */ React82.createElement(MenuListItem6, { key: value, value: value ?? "" }, label))
  )))), isCustom && /* @__PURE__ */ React82.createElement(PropProvider, { ...positionContext }, /* @__PURE__ */ React82.createElement(Grid19, { item: true, xs: 12 }, /* @__PURE__ */ React82.createElement(Grid19, { container: true, spacing: 1.5 }, /* @__PURE__ */ React82.createElement(Grid19, { item: true, xs: 6 }, /* @__PURE__ */ React82.createElement(PropKeyProvider, { bind: "x" }, /* @__PURE__ */ React82.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React82.createElement(LetterXIcon2, { fontSize: "tiny" }),
      min: -Number.MAX_SAFE_INTEGER
    }
  ))), /* @__PURE__ */ React82.createElement(Grid19, { item: true, xs: 6 }, /* @__PURE__ */ React82.createElement(PropKeyProvider, { bind: "y" }, /* @__PURE__ */ React82.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React82.createElement(LetterYIcon2, { fontSize: "tiny" }),
      min: -Number.MAX_SAFE_INTEGER
    }
  )))))));
};

// src/controls/transform-control/transform-repeater-control.tsx
import * as React95 from "react";
import { useRef as useRef21 } from "react";
import { transformFunctionsPropTypeUtil, transformPropTypeUtil } from "@elementor/editor-props";
import { AdjustmentsIcon as AdjustmentsIcon2, InfoCircleFilledIcon as InfoCircleFilledIcon2 } from "@elementor/icons";
import { bindTrigger as bindTrigger4, Box as Box18, IconButton as IconButton7, Tooltip as Tooltip8, Typography as Typography6, usePopupState as usePopupState6 } from "@elementor/ui";
import { __ as __47 } from "@wordpress/i18n";

// src/controls/transform-control/initial-values.ts
import {
  numberPropTypeUtil as numberPropTypeUtil4,
  rotateTransformPropTypeUtil,
  scaleTransformPropTypeUtil,
  skewTransformPropTypeUtil
} from "@elementor/editor-props";
var TransformFunctionKeys = {
  move: "transform-move",
  scale: "transform-scale",
  rotate: "transform-rotate",
  skew: "transform-skew"
};
var defaultValues = {
  move: {
    size: 0,
    unit: "px"
  },
  scale: 1,
  rotate: {
    size: 0,
    unit: "deg"
  },
  skew: {
    size: 0,
    unit: "deg"
  }
};
var initialTransformValue = {
  $$type: TransformFunctionKeys.move,
  value: {
    x: { $$type: "size", value: { size: defaultValues.move.size, unit: defaultValues.move.unit } },
    y: { $$type: "size", value: { size: defaultValues.move.size, unit: defaultValues.move.unit } },
    z: { $$type: "size", value: { size: defaultValues.move.size, unit: defaultValues.move.unit } }
  }
};
var initialScaleValue = scaleTransformPropTypeUtil.create({
  x: numberPropTypeUtil4.create(defaultValues.scale),
  y: numberPropTypeUtil4.create(defaultValues.scale),
  z: numberPropTypeUtil4.create(defaultValues.scale)
});
var initialRotateValue = rotateTransformPropTypeUtil.create({
  x: { $$type: "size", value: { size: defaultValues.rotate.size, unit: defaultValues.rotate.unit } },
  y: { $$type: "size", value: { size: defaultValues.rotate.size, unit: defaultValues.rotate.unit } },
  z: { $$type: "size", value: { size: defaultValues.rotate.size, unit: defaultValues.rotate.unit } }
});
var initialSkewValue = skewTransformPropTypeUtil.create({
  x: { $$type: "size", value: { size: defaultValues.skew.size, unit: defaultValues.skew.unit } },
  y: { $$type: "size", value: { size: defaultValues.skew.size, unit: defaultValues.skew.unit } }
});

// src/controls/transform-control/transform-content.tsx
import * as React89 from "react";
import { Box as Box15, Tab as Tab2, TabPanel as TabPanel2, Tabs as Tabs2 } from "@elementor/ui";
import { __ as __42 } from "@wordpress/i18n";

// src/controls/transform-control/functions/move.tsx
import * as React84 from "react";
import { useRef as useRef14 } from "react";
import { moveTransformPropTypeUtil } from "@elementor/editor-props";
import { ArrowDownLeftIcon, ArrowDownSmallIcon, ArrowRightIcon } from "@elementor/icons";
import { Grid as Grid21 } from "@elementor/ui";
import { __ as __38 } from "@wordpress/i18n";

// src/controls/transform-control/functions/axis-row.tsx
import * as React83 from "react";
import { Grid as Grid20 } from "@elementor/ui";
var AxisRow = ({ label, bind, startIcon, anchorRef, units: units2, variant = "angle" }) => {
  const safeId = label.replace(/\s+/g, "-").toLowerCase();
  return /* @__PURE__ */ React83.createElement(Grid20, { item: true, xs: 12 }, /* @__PURE__ */ React83.createElement(PopoverGridContainer, { ref: anchorRef }, /* @__PURE__ */ React83.createElement(Grid20, { item: true, xs: 6 }, /* @__PURE__ */ React83.createElement(ControlLabel, { htmlFor: safeId }, label)), /* @__PURE__ */ React83.createElement(Grid20, { item: true, xs: 6 }, /* @__PURE__ */ React83.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React83.createElement(
    SizeControl,
    {
      anchorRef,
      startIcon,
      units: units2,
      variant,
      min: -Number.MAX_SAFE_INTEGER,
      id: safeId
    }
  )))));
};

// src/controls/transform-control/functions/move.tsx
var moveAxisControls = [
  {
    label: __38("Move X", "elementor"),
    bind: "x",
    startIcon: /* @__PURE__ */ React84.createElement(ArrowRightIcon, { fontSize: "tiny" }),
    units: ["px", "%", "em", "rem", "vw"]
  },
  {
    label: __38("Move Y", "elementor"),
    bind: "y",
    startIcon: /* @__PURE__ */ React84.createElement(ArrowDownSmallIcon, { fontSize: "tiny" }),
    units: ["px", "%", "em", "rem", "vh"]
  },
  {
    label: __38("Move Z", "elementor"),
    bind: "z",
    startIcon: /* @__PURE__ */ React84.createElement(ArrowDownLeftIcon, { fontSize: "tiny" }),
    units: ["px", "%", "em", "rem", "vw", "vh"]
  }
];
var Move = () => {
  const context = useBoundProp(moveTransformPropTypeUtil);
  const rowRefs = [useRef14(null), useRef14(null), useRef14(null)];
  return /* @__PURE__ */ React84.createElement(Grid21, { container: true, spacing: 1.5 }, /* @__PURE__ */ React84.createElement(PropProvider, { ...context }, /* @__PURE__ */ React84.createElement(PropKeyProvider, { bind: TransformFunctionKeys.move }, moveAxisControls.map((control, index) => /* @__PURE__ */ React84.createElement(
    AxisRow,
    {
      key: control.bind,
      ...control,
      anchorRef: rowRefs[index],
      units: control.units,
      variant: "length"
    }
  )))));
};

// src/controls/transform-control/functions/rotate.tsx
import * as React85 from "react";
import { useRef as useRef15 } from "react";
import { rotateTransformPropTypeUtil as rotateTransformPropTypeUtil2 } from "@elementor/editor-props";
import { Arrow360Icon, RotateClockwiseIcon } from "@elementor/icons";
import { Grid as Grid22 } from "@elementor/ui";
import { __ as __39 } from "@wordpress/i18n";
var rotateAxisControls = [
  {
    label: __39("Rotate X", "elementor"),
    bind: "x",
    startIcon: /* @__PURE__ */ React85.createElement(Arrow360Icon, { fontSize: "tiny" })
  },
  {
    label: __39("Rotate Y", "elementor"),
    bind: "y",
    startIcon: /* @__PURE__ */ React85.createElement(Arrow360Icon, { fontSize: "tiny", style: { transform: "scaleX(-1) rotate(-90deg)" } })
  },
  {
    label: __39("Rotate Z", "elementor"),
    bind: "z",
    startIcon: /* @__PURE__ */ React85.createElement(RotateClockwiseIcon, { fontSize: "tiny" })
  }
];
var rotateUnits = ["deg", "rad", "grad", "turn"];
var Rotate = () => {
  const context = useBoundProp(rotateTransformPropTypeUtil2);
  const rowRefs = [useRef15(null), useRef15(null), useRef15(null)];
  return /* @__PURE__ */ React85.createElement(Grid22, { container: true, spacing: 1.5 }, /* @__PURE__ */ React85.createElement(PropProvider, { ...context }, /* @__PURE__ */ React85.createElement(PropKeyProvider, { bind: TransformFunctionKeys.rotate }, rotateAxisControls.map((control, index) => /* @__PURE__ */ React85.createElement(
    AxisRow,
    {
      key: control.bind,
      ...control,
      anchorRef: rowRefs[index],
      units: rotateUnits
    }
  )))));
};

// src/controls/transform-control/functions/scale.tsx
import * as React87 from "react";
import { useRef as useRef16 } from "react";
import { scaleTransformPropTypeUtil as scaleTransformPropTypeUtil2 } from "@elementor/editor-props";
import { ArrowDownLeftIcon as ArrowDownLeftIcon2, ArrowDownSmallIcon as ArrowDownSmallIcon2, ArrowRightIcon as ArrowRightIcon2 } from "@elementor/icons";
import { Grid as Grid24 } from "@elementor/ui";
import { __ as __40 } from "@wordpress/i18n";

// src/controls/transform-control/functions/scale-axis-row.tsx
import * as React86 from "react";
import { Grid as Grid23 } from "@elementor/ui";
var ScaleAxisRow = ({ label, bind, startIcon, anchorRef }) => {
  return /* @__PURE__ */ React86.createElement(Grid23, { item: true, xs: 12 }, /* @__PURE__ */ React86.createElement(PopoverGridContainer, { ref: anchorRef }, /* @__PURE__ */ React86.createElement(Grid23, { item: true, xs: 6 }, /* @__PURE__ */ React86.createElement(ControlLabel, null, label)), /* @__PURE__ */ React86.createElement(Grid23, { item: true, xs: 6 }, /* @__PURE__ */ React86.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React86.createElement(NumberControl, { step: 0.1, placeholder: "1", startIcon })))));
};

// src/controls/transform-control/functions/scale.tsx
var scaleAxisControls = [
  {
    label: __40("Scale X", "elementor"),
    bind: "x",
    startIcon: /* @__PURE__ */ React87.createElement(ArrowRightIcon2, { fontSize: "tiny" })
  },
  {
    label: __40("Scale Y", "elementor"),
    bind: "y",
    startIcon: /* @__PURE__ */ React87.createElement(ArrowDownSmallIcon2, { fontSize: "tiny" })
  },
  {
    label: __40("Scale Z", "elementor"),
    bind: "z",
    startIcon: /* @__PURE__ */ React87.createElement(ArrowDownLeftIcon2, { fontSize: "tiny" })
  }
];
var Scale = () => {
  const context = useBoundProp(scaleTransformPropTypeUtil2);
  const rowRefs = [useRef16(null), useRef16(null), useRef16(null)];
  return /* @__PURE__ */ React87.createElement(Grid24, { container: true, spacing: 1.5 }, /* @__PURE__ */ React87.createElement(PropProvider, { ...context }, /* @__PURE__ */ React87.createElement(PropKeyProvider, { bind: TransformFunctionKeys.scale }, scaleAxisControls.map((control, index) => /* @__PURE__ */ React87.createElement(ScaleAxisRow, { key: control.bind, ...control, anchorRef: rowRefs[index] })))));
};

// src/controls/transform-control/functions/skew.tsx
import * as React88 from "react";
import { useRef as useRef17 } from "react";
import { skewTransformPropTypeUtil as skewTransformPropTypeUtil2 } from "@elementor/editor-props";
import { ArrowLeftIcon, ArrowRightIcon as ArrowRightIcon3 } from "@elementor/icons";
import { Grid as Grid25 } from "@elementor/ui";
import { __ as __41 } from "@wordpress/i18n";
var skewAxisControls = [
  {
    label: __41("Skew X", "elementor"),
    bind: "x",
    startIcon: /* @__PURE__ */ React88.createElement(ArrowRightIcon3, { fontSize: "tiny" })
  },
  {
    label: __41("Skew Y", "elementor"),
    bind: "y",
    startIcon: /* @__PURE__ */ React88.createElement(ArrowLeftIcon, { fontSize: "tiny", style: { transform: "scaleX(-1) rotate(-90deg)" } })
  }
];
var skewUnits = ["deg", "rad", "grad", "turn"];
var Skew = () => {
  const context = useBoundProp(skewTransformPropTypeUtil2);
  const rowRefs = [useRef17(null), useRef17(null), useRef17(null)];
  return /* @__PURE__ */ React88.createElement(Grid25, { container: true, spacing: 1.5 }, /* @__PURE__ */ React88.createElement(PropProvider, { ...context }, /* @__PURE__ */ React88.createElement(PropKeyProvider, { bind: TransformFunctionKeys.skew }, skewAxisControls.map((control, index) => /* @__PURE__ */ React88.createElement(
    AxisRow,
    {
      key: control.bind,
      ...control,
      anchorRef: rowRefs[index],
      units: skewUnits
    }
  )))));
};

// src/controls/transform-control/use-transform-tabs-history.tsx
import { useRef as useRef18 } from "react";
import {
  moveTransformPropTypeUtil as moveTransformPropTypeUtil2,
  rotateTransformPropTypeUtil as rotateTransformPropTypeUtil3,
  scaleTransformPropTypeUtil as scaleTransformPropTypeUtil3,
  skewTransformPropTypeUtil as skewTransformPropTypeUtil3
} from "@elementor/editor-props";
import { useTabs as useTabs2 } from "@elementor/ui";
var useTransformTabsHistory = ({
  move: initialMove,
  scale: initialScale,
  rotate: initialRotate,
  skew: initialSkew
}) => {
  const { value: moveValue, setValue: setMoveValue } = useBoundProp(moveTransformPropTypeUtil2);
  const { value: scaleValue, setValue: setScaleValue } = useBoundProp(scaleTransformPropTypeUtil3);
  const { value: rotateValue, setValue: setRotateValue } = useBoundProp(rotateTransformPropTypeUtil3);
  const { value: skewValue, setValue: setSkewValue } = useBoundProp(skewTransformPropTypeUtil3);
  const { openItemIndex, items: items2 } = useRepeaterContext();
  const getCurrentTransformType = () => {
    switch (true) {
      case !!scaleValue:
        return TransformFunctionKeys.scale;
      case !!rotateValue:
        return TransformFunctionKeys.rotate;
      case !!skewValue:
        return TransformFunctionKeys.skew;
      default:
        return TransformFunctionKeys.move;
    }
  };
  const { getTabsProps, getTabProps, getTabPanelProps } = useTabs2(getCurrentTransformType());
  const valuesHistory = useRef18({
    move: initialMove,
    scale: initialScale,
    rotate: initialRotate,
    skew: initialSkew
  });
  const saveToHistory = (key, value) => {
    if (value) {
      valuesHistory.current[key] = value;
    }
  };
  const onTabChange = (e, tabName) => {
    switch (tabName) {
      case TransformFunctionKeys.move:
        setMoveValue(valuesHistory.current.move);
        saveToHistory("scale", scaleValue);
        saveToHistory("rotate", rotateValue);
        saveToHistory("skew", skewValue);
        break;
      case TransformFunctionKeys.scale:
        setScaleValue(valuesHistory.current.scale);
        saveToHistory("move", moveValue);
        saveToHistory("rotate", rotateValue);
        saveToHistory("skew", skewValue);
        break;
      case TransformFunctionKeys.rotate:
        setRotateValue(valuesHistory.current.rotate);
        saveToHistory("move", moveValue);
        saveToHistory("scale", scaleValue);
        saveToHistory("skew", skewValue);
        break;
      case TransformFunctionKeys.skew:
        setSkewValue(valuesHistory.current.skew);
        saveToHistory("move", moveValue);
        saveToHistory("scale", scaleValue);
        saveToHistory("rotate", rotateValue);
        break;
    }
    return getTabsProps().onChange(e, tabName);
  };
  const isTabDisabled = (tabKey) => {
    return !!items2.find(({ item: { $$type: key } }, pos) => tabKey === key && pos !== openItemIndex);
  };
  return {
    getTabProps: (value) => ({
      ...getTabProps(value),
      disabled: isTabDisabled(value)
    }),
    getTabPanelProps,
    getTabsProps: () => ({ ...getTabsProps(), onChange: onTabChange })
  };
};

// src/controls/transform-control/transform-content.tsx
var TransformContent = () => {
  const { getTabsProps, getTabProps, getTabPanelProps } = useTransformTabsHistory({
    move: initialTransformValue.value,
    scale: initialScaleValue.value,
    rotate: initialRotateValue.value,
    skew: initialSkewValue.value
  });
  return /* @__PURE__ */ React89.createElement(PopoverContent, null, /* @__PURE__ */ React89.createElement(Box15, { sx: { width: "100%" } }, /* @__PURE__ */ React89.createElement(Box15, { sx: { borderBottom: 1, borderColor: "divider" } }, /* @__PURE__ */ React89.createElement(
    Tabs2,
    {
      size: "small",
      variant: "fullWidth",
      sx: {
        "& .MuiTab-root": {
          minWidth: "62px"
        }
      },
      ...getTabsProps(),
      "aria-label": __42("Transform", "elementor")
    },
    /* @__PURE__ */ React89.createElement(Tab2, { label: __42("Move", "elementor"), ...getTabProps(TransformFunctionKeys.move) }),
    /* @__PURE__ */ React89.createElement(Tab2, { label: __42("Scale", "elementor"), ...getTabProps(TransformFunctionKeys.scale) }),
    /* @__PURE__ */ React89.createElement(Tab2, { label: __42("Rotate", "elementor"), ...getTabProps(TransformFunctionKeys.rotate) }),
    /* @__PURE__ */ React89.createElement(Tab2, { label: __42("Skew", "elementor"), ...getTabProps(TransformFunctionKeys.skew) })
  )), /* @__PURE__ */ React89.createElement(TabPanel2, { sx: { p: 1.5 }, ...getTabPanelProps(TransformFunctionKeys.move) }, /* @__PURE__ */ React89.createElement(Move, null)), /* @__PURE__ */ React89.createElement(TabPanel2, { sx: { p: 1.5 }, ...getTabPanelProps(TransformFunctionKeys.scale) }, /* @__PURE__ */ React89.createElement(Scale, null)), /* @__PURE__ */ React89.createElement(TabPanel2, { sx: { p: 1.5 }, ...getTabPanelProps(TransformFunctionKeys.rotate) }, /* @__PURE__ */ React89.createElement(Rotate, null)), /* @__PURE__ */ React89.createElement(TabPanel2, { sx: { p: 1.5 }, ...getTabPanelProps(TransformFunctionKeys.skew) }, /* @__PURE__ */ React89.createElement(Skew, null))));
};

// src/controls/transform-control/transform-icon.tsx
import * as React90 from "react";
import { ArrowAutofitHeightIcon, ArrowsMaximizeIcon as ArrowsMaximizeIcon2, RotateClockwise2Icon, SkewXIcon } from "@elementor/icons";
var TransformIcon = ({ value }) => {
  switch (value.$$type) {
    case TransformFunctionKeys.move:
      return /* @__PURE__ */ React90.createElement(ArrowsMaximizeIcon2, { fontSize: "tiny" });
    case TransformFunctionKeys.scale:
      return /* @__PURE__ */ React90.createElement(ArrowAutofitHeightIcon, { fontSize: "tiny" });
    case TransformFunctionKeys.rotate:
      return /* @__PURE__ */ React90.createElement(RotateClockwise2Icon, { fontSize: "tiny" });
    case TransformFunctionKeys.skew:
      return /* @__PURE__ */ React90.createElement(SkewXIcon, { fontSize: "tiny" });
    default:
      return null;
  }
};

// src/controls/transform-control/transform-label.tsx
import * as React91 from "react";
import { Box as Box16 } from "@elementor/ui";
import { __ as __43 } from "@wordpress/i18n";
var orderedAxis = ["x", "y", "z"];
var formatLabel = (value, functionType) => {
  return orderedAxis.map((axisKey) => {
    const axis = value[axisKey];
    if (functionType === "scale") {
      return axis?.value || defaultValues[functionType];
    }
    const defaults = defaultValues[functionType];
    const size = axis?.value?.size ?? defaults.size;
    const unit = axis?.value?.unit ?? defaults.unit;
    return unit === "custom" ? size || CUSTOM_SIZE_LABEL : `${size}${unit}`;
  }).join(", ");
};
var TransformLabel = (props) => {
  const { $$type, value } = props.value;
  switch ($$type) {
    case TransformFunctionKeys.move:
      return /* @__PURE__ */ React91.createElement(Label2, { label: __43("Move", "elementor"), value: formatLabel(value, "move") });
    case TransformFunctionKeys.scale:
      return /* @__PURE__ */ React91.createElement(Label2, { label: __43("Scale", "elementor"), value: formatLabel(value, "scale") });
    case TransformFunctionKeys.rotate:
      return /* @__PURE__ */ React91.createElement(Label2, { label: __43("Rotate", "elementor"), value: formatLabel(value, "rotate") });
    case TransformFunctionKeys.skew:
      return /* @__PURE__ */ React91.createElement(Label2, { label: __43("Skew", "elementor"), value: formatLabel(value, "skew") });
    default:
      return "";
  }
};
var Label2 = ({ label, value }) => {
  return /* @__PURE__ */ React91.createElement(Box16, { component: "span" }, label, ": ", value);
};

// src/controls/transform-control/transform-settings-control.tsx
import * as React94 from "react";
import { PopoverHeader as PopoverHeader3 } from "@elementor/editor-ui";
import { AdjustmentsIcon } from "@elementor/icons";
import { bindPopover as bindPopover5, Box as Box17, Divider as Divider4, Popover as Popover5 } from "@elementor/ui";
import { __ as __46 } from "@wordpress/i18n";

// src/controls/transform-control/transform-base-controls/children-perspective-control.tsx
import * as React92 from "react";
import { perspectiveOriginPropTypeUtil } from "@elementor/editor-props";
import { Grid as Grid26, Stack as Stack15 } from "@elementor/ui";
import { __ as __44 } from "@wordpress/i18n";
var ORIGIN_UNITS = ["px", "%", "em", "rem"];
var PERSPECTIVE_CONTROL_FIELD = {
  label: __44("Perspective", "elementor"),
  bind: "perspective",
  units: ["px", "em", "rem", "vw", "vh"]
};
var CHILDREN_PERSPECTIVE_FIELDS = [
  {
    label: __44("Origin X", "elementor"),
    bind: "x",
    units: ORIGIN_UNITS
  },
  {
    label: __44("Origin Y", "elementor"),
    bind: "y",
    units: ORIGIN_UNITS
  }
];
var ChildrenPerspectiveControl = () => {
  return /* @__PURE__ */ React92.createElement(Stack15, { direction: "column", spacing: 1.5 }, /* @__PURE__ */ React92.createElement(ControlFormLabel, null, __44("Children perspective", "elementor")), /* @__PURE__ */ React92.createElement(PerspectiveControl, null), /* @__PURE__ */ React92.createElement(PerspectiveOriginControl, null));
};
var PerspectiveControl = () => /* @__PURE__ */ React92.createElement(PropKeyProvider, { bind: "perspective" }, /* @__PURE__ */ React92.createElement(ControlFields, { control: PERSPECTIVE_CONTROL_FIELD, key: PERSPECTIVE_CONTROL_FIELD.bind }));
var PerspectiveOriginControl = () => /* @__PURE__ */ React92.createElement(PropKeyProvider, { bind: "perspective-origin" }, /* @__PURE__ */ React92.createElement(PerspectiveOriginControlProvider, null));
var PerspectiveOriginControlProvider = () => {
  const context = useBoundProp(perspectiveOriginPropTypeUtil);
  return /* @__PURE__ */ React92.createElement(PropProvider, { ...context }, CHILDREN_PERSPECTIVE_FIELDS.map((control) => /* @__PURE__ */ React92.createElement(PropKeyProvider, { bind: control.bind, key: control.bind }, /* @__PURE__ */ React92.createElement(ControlFields, { control }))));
};
var ControlFields = ({ control }) => {
  const rowRef = React92.useRef(null);
  return /* @__PURE__ */ React92.createElement(PopoverGridContainer, { ref: rowRef }, /* @__PURE__ */ React92.createElement(Grid26, { item: true, xs: 6 }, /* @__PURE__ */ React92.createElement(ControlFormLabel, null, control.label)), /* @__PURE__ */ React92.createElement(Grid26, { item: true, xs: 6 }, /* @__PURE__ */ React92.createElement(SizeControl, { variant: "length", units: control.units, anchorRef: rowRef, disableCustom: true })));
};

// src/controls/transform-control/transform-base-controls/transform-origin-control.tsx
import * as React93 from "react";
import { transformOriginPropTypeUtil } from "@elementor/editor-props";
import { Grid as Grid27, Stack as Stack16 } from "@elementor/ui";
import { __ as __45 } from "@wordpress/i18n";
var TRANSFORM_ORIGIN_UNITS = ["px", "%", "em", "rem"];
var TRANSFORM_ORIGIN_UNITS_Z_AXIS = TRANSFORM_ORIGIN_UNITS.filter((unit) => unit !== "%");
var TRANSFORM_ORIGIN_FIELDS = [
  {
    label: __45("Origin X", "elementor"),
    bind: "x",
    units: TRANSFORM_ORIGIN_UNITS
  },
  {
    label: __45("Origin Y", "elementor"),
    bind: "y",
    units: TRANSFORM_ORIGIN_UNITS
  },
  {
    label: __45("Origin Z", "elementor"),
    bind: "z",
    units: TRANSFORM_ORIGIN_UNITS_Z_AXIS
  }
];
var TransformOriginControl = () => {
  return /* @__PURE__ */ React93.createElement(Stack16, { direction: "column", spacing: 1.5 }, /* @__PURE__ */ React93.createElement(ControlFormLabel, null, __45("Transform", "elementor")), TRANSFORM_ORIGIN_FIELDS.map((control) => /* @__PURE__ */ React93.createElement(ControlFields2, { control, key: control.bind })));
};
var ControlFields2 = ({ control }) => {
  const context = useBoundProp(transformOriginPropTypeUtil);
  const rowRef = React93.useRef(null);
  return /* @__PURE__ */ React93.createElement(PropProvider, { ...context }, /* @__PURE__ */ React93.createElement(PropKeyProvider, { bind: control.bind }, /* @__PURE__ */ React93.createElement(PopoverGridContainer, { ref: rowRef }, /* @__PURE__ */ React93.createElement(Grid27, { item: true, xs: 6 }, /* @__PURE__ */ React93.createElement(ControlFormLabel, null, control.label)), /* @__PURE__ */ React93.createElement(Grid27, { item: true, xs: 6 }, /* @__PURE__ */ React93.createElement(SizeControl, { variant: "length", units: control.units, anchorRef: rowRef, disableCustom: true })))));
};

// src/controls/transform-control/transform-settings-control.tsx
var SIZE8 = "tiny";
var TransformSettingsControl = ({
  popupState,
  anchorRef,
  showChildrenPerspective
}) => {
  const popupProps = bindPopover5({
    ...popupState,
    anchorEl: anchorRef.current ?? void 0
  });
  return /* @__PURE__ */ React94.createElement(
    Popover5,
    {
      disablePortal: true,
      anchorOrigin: { vertical: "bottom", horizontal: "left" },
      slotProps: {
        paper: {
          sx: {
            width: (anchorRef.current?.offsetWidth || 0) - 6 + "px",
            mt: 0.5
          }
        }
      },
      ...popupProps
    },
    /* @__PURE__ */ React94.createElement(
      PopoverHeader3,
      {
        title: __46("Transform settings", "elementor"),
        onClose: popupState.close,
        icon: /* @__PURE__ */ React94.createElement(AdjustmentsIcon, { fontSize: SIZE8 })
      }
    ),
    /* @__PURE__ */ React94.createElement(Divider4, null),
    /* @__PURE__ */ React94.createElement(PopoverContent, { sx: { px: 2, py: 1.5 } }, /* @__PURE__ */ React94.createElement(PropKeyProvider, { bind: "transform-origin" }, /* @__PURE__ */ React94.createElement(TransformOriginControl, null)), showChildrenPerspective && /* @__PURE__ */ React94.createElement(React94.Fragment, null, /* @__PURE__ */ React94.createElement(Box17, { sx: { my: 0.5 } }, /* @__PURE__ */ React94.createElement(Divider4, null)), /* @__PURE__ */ React94.createElement(ChildrenPerspectiveControl, null)))
  );
};

// src/controls/transform-control/transform-repeater-control.tsx
var SIZE9 = "tiny";
var TransformRepeaterControl = createControl(
  ({ showChildrenPerspective }) => {
    const context = useBoundProp(transformPropTypeUtil);
    const headerRef = useRef21(null);
    const popupState = usePopupState6({ variant: "popover" });
    return /* @__PURE__ */ React95.createElement(PropProvider, { ...context }, /* @__PURE__ */ React95.createElement(
      TransformSettingsControl,
      {
        popupState,
        anchorRef: headerRef,
        showChildrenPerspective
      }
    ), /* @__PURE__ */ React95.createElement(PropKeyProvider, { bind: "transform-functions" }, /* @__PURE__ */ React95.createElement(Repeater2, { headerRef, propType: context.propType, popupState })));
  }
);
var ToolTip = /* @__PURE__ */ React95.createElement(
  Box18,
  {
    component: "span",
    "aria-label": void 0,
    sx: { display: "flex", gap: 0.5, p: 2, width: 320, borderRadius: 1 }
  },
  /* @__PURE__ */ React95.createElement(InfoCircleFilledIcon2, { sx: { color: "secondary.main" } }),
  /* @__PURE__ */ React95.createElement(Typography6, { variant: "body2", color: "text.secondary", fontSize: "14px" }, __47("You can use each kind of transform only once per element.", "elementor"))
);
var Repeater2 = ({
  headerRef,
  propType,
  popupState
}) => {
  const transformFunctionsContext = useBoundProp(transformFunctionsPropTypeUtil);
  const availableValues = [initialTransformValue, initialScaleValue, initialRotateValue, initialSkewValue];
  const { value: transformValues, bind } = transformFunctionsContext;
  const getInitialValue2 = () => {
    return availableValues.find((value) => !transformValues?.some((item) => item.$$type === value.$$type));
  };
  const shouldDisableAddItem = !getInitialValue2();
  return /* @__PURE__ */ React95.createElement(PropProvider, { ...transformFunctionsContext }, /* @__PURE__ */ React95.createElement(
    ControlRepeater,
    {
      initial: getInitialValue2() ?? initialTransformValue,
      propTypeUtil: transformFunctionsPropTypeUtil
    },
    /* @__PURE__ */ React95.createElement(
      RepeaterHeader,
      {
        label: __47("Transform", "elementor"),
        adornment: () => /* @__PURE__ */ React95.createElement(ControlAdornments, { customContext: { path: ["transform"], propType } }),
        ref: headerRef
      },
      /* @__PURE__ */ React95.createElement(TransformBasePopoverTrigger, { popupState, repeaterBindKey: bind }),
      /* @__PURE__ */ React95.createElement(
        TooltipAddItemAction,
        {
          disabled: shouldDisableAddItem,
          tooltipContent: ToolTip,
          enableTooltip: shouldDisableAddItem,
          ariaLabel: "transform"
        }
      )
    ),
    /* @__PURE__ */ React95.createElement(ItemsContainer, null, /* @__PURE__ */ React95.createElement(
      Item,
      {
        Icon: TransformIcon,
        Label: TransformLabel,
        actions: /* @__PURE__ */ React95.createElement(React95.Fragment, null, /* @__PURE__ */ React95.createElement(DisableItemAction, null), /* @__PURE__ */ React95.createElement(RemoveItemAction, null))
      }
    )),
    /* @__PURE__ */ React95.createElement(EditItemPopover, null, /* @__PURE__ */ React95.createElement(TransformContent, null))
  ));
};
var TransformBasePopoverTrigger = ({
  popupState,
  repeaterBindKey
}) => {
  const { bind } = useBoundProp();
  const titleLabel = __47("Transform settings", "elementor");
  return bind !== repeaterBindKey ? null : /* @__PURE__ */ React95.createElement(Tooltip8, { title: titleLabel, placement: "top" }, /* @__PURE__ */ React95.createElement(IconButton7, { size: SIZE9, "aria-label": titleLabel, ...bindTrigger4(popupState) }, /* @__PURE__ */ React95.createElement(AdjustmentsIcon2, { fontSize: SIZE9 })));
};

// src/controls/transition-control/transition-repeater-control.tsx
import * as React98 from "react";
import { useEffect as useEffect11, useMemo as useMemo13, useState as useState16 } from "react";
import {
  createArrayPropUtils as createArrayPropUtils2,
  selectionSizePropTypeUtil as selectionSizePropTypeUtil2
} from "@elementor/editor-props";
import { InfoCircleFilledIcon as InfoCircleFilledIcon3 } from "@elementor/icons";
import { Alert as Alert2, AlertTitle as AlertTitle3, Box as Box20, Typography as Typography7 } from "@elementor/ui";
import { __ as __50 } from "@wordpress/i18n";

// src/controls/selection-size-control.tsx
import * as React96 from "react";
import { useMemo as useMemo11, useRef as useRef22 } from "react";
import { selectionSizePropTypeUtil } from "@elementor/editor-props";
import { Grid as Grid28 } from "@elementor/ui";
var SelectionSizeControl = createControl(
  ({ selectionLabel, sizeLabel, selectionConfig, sizeConfigMap }) => {
    const { value, setValue, propType } = useBoundProp(selectionSizePropTypeUtil);
    const rowRef = useRef22(null);
    const sizeFieldId = sizeLabel.replace(/\s+/g, "-").toLowerCase();
    const currentSizeConfig = useMemo11(() => {
      switch (value.selection.$$type) {
        case "key-value":
          return sizeConfigMap[value?.selection?.value.value.value || ""];
        case "string":
          return sizeConfigMap[value?.selection?.value || ""];
        default:
          return null;
      }
    }, [value, sizeConfigMap]);
    const SelectionComponent = selectionConfig.component;
    return /* @__PURE__ */ React96.createElement(PropProvider, { value, setValue, propType }, /* @__PURE__ */ React96.createElement(Grid28, { container: true, spacing: 1.5, ref: rowRef }, /* @__PURE__ */ React96.createElement(Grid28, { item: true, xs: 6, sx: { display: "flex", alignItems: "center" } }, /* @__PURE__ */ React96.createElement(ControlFormLabel, null, selectionLabel)), /* @__PURE__ */ React96.createElement(Grid28, { item: true, xs: 6 }, /* @__PURE__ */ React96.createElement(PropKeyProvider, { bind: "selection" }, /* @__PURE__ */ React96.createElement(SelectionComponent, { ...selectionConfig.props }))), currentSizeConfig && /* @__PURE__ */ React96.createElement(React96.Fragment, null, /* @__PURE__ */ React96.createElement(Grid28, { item: true, xs: 6, sx: { display: "flex", alignItems: "center" } }, /* @__PURE__ */ React96.createElement(ControlFormLabel, { htmlFor: sizeFieldId }, sizeLabel)), /* @__PURE__ */ React96.createElement(Grid28, { item: true, xs: 6 }, /* @__PURE__ */ React96.createElement(PropKeyProvider, { bind: "size" }, /* @__PURE__ */ React96.createElement(
      SizeControl,
      {
        anchorRef: rowRef,
        variant: currentSizeConfig.variant,
        units: currentSizeConfig.units,
        defaultUnit: currentSizeConfig.defaultUnit,
        id: sizeFieldId
      }
    ))))));
  }
);

// src/controls/transition-control/data.ts
import { hasProInstalled, isVersionGreaterOrEqual } from "@elementor/utils";
import { __ as __48 } from "@wordpress/i18n";
var initialTransitionValue = {
  selection: {
    $$type: "key-value",
    value: {
      key: { value: __48("All properties", "elementor"), $$type: "string" },
      value: { value: "all", $$type: "string" }
    }
  },
  size: { $$type: "size", value: { size: 200, unit: "ms" } }
};
var MIN_PRO_VERSION = "3.35";
var getIsSiteRtl = () => {
  return !!window.elementorFrontend?.config?.is_rtl;
};
var shouldExtendTransitionProperties = () => {
  if (!hasProInstalled()) {
    return false;
  }
  const proVersion = window.elementorPro?.config?.version;
  if (!proVersion) {
    return false;
  }
  return isVersionGreaterOrEqual(proVersion, MIN_PRO_VERSION);
};
var createTransitionPropertiesList = () => {
  const isSiteRtl = getIsSiteRtl();
  const baseProperties = [
    {
      label: __48("Default", "elementor"),
      type: "category",
      properties: [{ label: __48("All properties", "elementor"), value: "all" }]
    },
    {
      label: __48("Margin", "elementor"),
      type: "category",
      properties: [
        { label: __48("Margin (all)", "elementor"), value: "margin", isDisabled: true },
        { label: __48("Margin bottom", "elementor"), value: "margin-block-end", isDisabled: true },
        {
          label: isSiteRtl ? __48("Margin right", "elementor") : __48("Margin left", "elementor"),
          value: "margin-inline-start",
          isDisabled: true
        },
        {
          label: isSiteRtl ? __48("Margin left", "elementor") : __48("Margin right", "elementor"),
          value: "margin-inline-end",
          isDisabled: true
        },
        { label: __48("Margin top", "elementor"), value: "margin-block-start", isDisabled: true }
      ]
    },
    {
      label: __48("Padding", "elementor"),
      type: "category",
      properties: [
        { label: __48("Padding (all)", "elementor"), value: "padding", isDisabled: true },
        { label: __48("Padding bottom", "elementor"), value: "padding-block-end", isDisabled: true },
        {
          label: isSiteRtl ? __48("Padding right", "elementor") : __48("Padding left", "elementor"),
          value: "padding-inline-start",
          isDisabled: true
        },
        {
          label: isSiteRtl ? __48("Padding left", "elementor") : __48("Padding right", "elementor"),
          value: "padding-inline-end",
          isDisabled: true
        },
        { label: __48("Padding top", "elementor"), value: "padding-block-start", isDisabled: true }
      ]
    },
    {
      label: __48("Flex", "elementor"),
      type: "category",
      properties: [
        { label: __48("Flex (all)", "elementor"), value: "flex", isDisabled: true },
        { label: __48("Flex grow", "elementor"), value: "flex-grow", isDisabled: true },
        { label: __48("Flex shrink", "elementor"), value: "flex-shrink", isDisabled: true },
        { label: __48("Flex basis", "elementor"), value: "flex-basis", isDisabled: true }
      ]
    },
    {
      label: __48("Size", "elementor"),
      type: "category",
      properties: [
        { label: __48("Width", "elementor"), value: "width", isDisabled: true },
        { label: __48("Height", "elementor"), value: "height", isDisabled: true },
        { label: __48("Max height", "elementor"), value: "max-height", isDisabled: true },
        { label: __48("Max width", "elementor"), value: "max-width", isDisabled: true },
        { label: __48("Min height", "elementor"), value: "min-height", isDisabled: true },
        { label: __48("Min width", "elementor"), value: "min-width", isDisabled: true }
      ]
    },
    {
      label: __48("Position", "elementor"),
      type: "category",
      properties: [
        { label: __48("Top", "elementor"), value: "inset-block-start", isDisabled: true },
        {
          label: isSiteRtl ? __48("Right", "elementor") : __48("Left", "elementor"),
          value: "inset-inline-start",
          isDisabled: true
        },
        {
          label: isSiteRtl ? __48("Left", "elementor") : __48("Right", "elementor"),
          value: "inset-inline-end",
          isDisabled: true
        },
        { label: __48("Bottom", "elementor"), value: "inset-block-end", isDisabled: true },
        { label: __48("Z-index", "elementor"), value: "z-index", isDisabled: true }
      ]
    },
    {
      label: __48("Typography", "elementor"),
      type: "category",
      properties: [
        { label: __48("Font color", "elementor"), value: "color", isDisabled: true },
        { label: __48("Font size", "elementor"), value: "font-size", isDisabled: true },
        { label: __48("Line height", "elementor"), value: "line-height", isDisabled: true },
        { label: __48("Letter spacing", "elementor"), value: "letter-spacing", isDisabled: true },
        { label: __48("Word spacing", "elementor"), value: "word-spacing", isDisabled: true },
        { label: __48("Font variations", "elementor"), value: "font-variation-settings", isDisabled: true },
        { label: __48("Text stroke color", "elementor"), value: "-webkit-text-stroke-color", isDisabled: true }
      ]
    },
    {
      label: __48("Background", "elementor"),
      type: "category",
      properties: [
        { label: __48("Background color", "elementor"), value: "background-color", isDisabled: true },
        { label: __48("Background position", "elementor"), value: "background-position", isDisabled: true },
        { label: __48("Box shadow", "elementor"), value: "box-shadow", isDisabled: true }
      ]
    },
    {
      label: __48("Border", "elementor"),
      type: "category",
      properties: [
        { label: __48("Border (all)", "elementor"), value: "border", isDisabled: true },
        { label: __48("Border radius", "elementor"), value: "border-radius", isDisabled: true },
        { label: __48("Border color", "elementor"), value: "border-color", isDisabled: true },
        { label: __48("Border width", "elementor"), value: "border-width", isDisabled: true }
      ]
    },
    {
      label: __48("Effects", "elementor"),
      type: "category",
      properties: [
        { label: __48("Opacity", "elementor"), value: "opacity", isDisabled: true },
        { label: __48("Transform (all)", "elementor"), value: "transform", isDisabled: true },
        { label: __48("Filter (all)", "elementor"), value: "filter", isDisabled: true }
      ]
    }
  ];
  return shouldExtendTransitionProperties() ? baseProperties : [baseProperties[0]];
};
var transitionProperties = createTransitionPropertiesList();
var transitionsItemsList = transitionProperties.map((category) => ({
  label: category.label,
  items: category.properties.map((property) => property.label)
}));

// src/controls/transition-control/trainsition-events.ts
import { getSelectedElements } from "@elementor/editor-elements";
import { trackEvent } from "@elementor/events";
var transitionRepeaterMixpanelEvent = {
  eventName: "click_added_transition",
  location: "V4 Style Tab",
  secondaryLocation: "Transition control",
  trigger: "click"
};
function subscribeToTransitionEvent() {
  eventBus.subscribe("transition-item-added", (data) => {
    const payload = data;
    const value = payload?.itemValue?.selection?.value?.value?.value;
    const selectedElements = getSelectedElements();
    const widgetType = selectedElements[0]?.type ?? null;
    trackEvent({
      transition_type: value ?? "unknown",
      ...transitionRepeaterMixpanelEvent,
      widget_type: widgetType
    });
  });
}

// src/controls/transition-control/transition-selector.tsx
import * as React97 from "react";
import { useMemo as useMemo12, useRef as useRef23 } from "react";
import { keyValuePropTypeUtil as keyValuePropTypeUtil2 } from "@elementor/editor-props";
import { PromotionAlert, PromotionChip } from "@elementor/editor-ui";
import { ChevronDownIcon as ChevronDownIcon3, VariationsIcon } from "@elementor/icons";
import { bindPopover as bindPopover6, bindTrigger as bindTrigger5, Box as Box19, Popover as Popover6, UnstableTag as UnstableTag3, usePopupState as usePopupState7 } from "@elementor/ui";
import { __ as __49 } from "@wordpress/i18n";
var toTransitionSelectorValue = (label) => {
  for (const category of transitionProperties) {
    const property = category.properties.find((prop) => prop.label === label);
    if (property) {
      return {
        key: { value: property.label, $$type: "string" },
        value: { value: property.value, $$type: "string" }
      };
    }
  }
  return null;
};
function getTransitionPropertyByValue(item) {
  if (!item?.value) {
    return null;
  }
  for (const category of transitionProperties) {
    for (const property of category.properties) {
      if (property.value === item.value) {
        return property;
      }
    }
  }
  return null;
}
var includeCurrentValueInOptions = (value, disabledItems) => {
  return disabledItems.filter((item) => {
    return item !== value.key.value;
  });
};
var PRO_UPGRADE_URL = "https://go.elementor.com/go-pro-transitions-modal/";
var TransitionSelector = ({
  recentlyUsedList = [],
  disabledItems = [],
  showPromotion = false
}) => {
  const { value, setValue } = useBoundProp(keyValuePropTypeUtil2);
  const {
    key: { value: transitionLabel }
  } = value;
  const defaultRef = useRef23(null);
  const popoverState = usePopupState7({ variant: "popover" });
  const disabledCategories = useMemo12(() => {
    return new Set(
      transitionProperties.filter((cat) => cat.properties.some((prop) => prop.isDisabled)).map((cat) => cat.label)
    );
  }, []);
  const getItemList = () => {
    const recentItems = recentlyUsedList.map((item) => getTransitionPropertyByValue({ value: item, $$type: "string" })?.label).filter((item) => !!item);
    const filteredItems = transitionsItemsList.map((category) => {
      return {
        ...category,
        items: category.items.filter((item) => !recentItems.includes(item))
      };
    });
    if (recentItems.length === 0) {
      return filteredItems;
    }
    const [first, ...rest] = filteredItems;
    return [
      first,
      {
        label: __49("Recently Used", "elementor"),
        items: recentItems
      },
      ...rest
    ];
  };
  const handleTransitionPropertyChange = (newLabel) => {
    const newValue = toTransitionSelectorValue(newLabel);
    if (!newValue) {
      return;
    }
    setValue(newValue);
    popoverState.close();
  };
  const getAnchorPosition = () => {
    if (!defaultRef.current) {
      return void 0;
    }
    const rect = defaultRef.current.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.right + 36
    };
  };
  return /* @__PURE__ */ React97.createElement(Box19, { ref: defaultRef }, /* @__PURE__ */ React97.createElement(ControlActions, null, /* @__PURE__ */ React97.createElement(
    UnstableTag3,
    {
      variant: "outlined",
      label: transitionLabel,
      endIcon: /* @__PURE__ */ React97.createElement(ChevronDownIcon3, { fontSize: "tiny" }),
      ...bindTrigger5(popoverState),
      fullWidth: true
    }
  )), /* @__PURE__ */ React97.createElement(
    Popover6,
    {
      disablePortal: true,
      disableScrollLock: true,
      ...bindPopover6(popoverState),
      anchorReference: "anchorPosition",
      anchorPosition: getAnchorPosition(),
      anchorOrigin: { vertical: "top", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "left" }
    },
    /* @__PURE__ */ React97.createElement(
      ItemSelector,
      {
        itemsList: getItemList(),
        selectedItem: transitionLabel,
        onItemChange: handleTransitionPropertyChange,
        onClose: popoverState.close,
        sectionWidth: 268,
        title: __49("Transition Property", "elementor"),
        icon: VariationsIcon,
        disabledItems: includeCurrentValueInOptions(value, disabledItems),
        categoryItemContentTemplate: (item) => /* @__PURE__ */ React97.createElement(
          Box19,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%"
            }
          },
          /* @__PURE__ */ React97.createElement("span", null, item.value),
          showPromotion && disabledCategories.has(item.value) && /* @__PURE__ */ React97.createElement(PromotionChip, null)
        ),
        footer: showPromotion ? /* @__PURE__ */ React97.createElement(
          PromotionAlert,
          {
            message: __49(
              "Upgrade to customize transition properties and control effects.",
              "elementor"
            ),
            upgradeUrl: PRO_UPGRADE_URL
          }
        ) : null
      }
    )
  ));
};

// src/controls/transition-control/transition-repeater-control.tsx
var DURATION_CONFIG = {
  variant: "time",
  units: ["s", "ms"],
  defaultUnit: "ms"
};
var childArrayPropTypeUtil = createArrayPropUtils2(
  selectionSizePropTypeUtil2.key,
  selectionSizePropTypeUtil2.schema,
  "transition"
);
subscribeToTransitionEvent();
var areAllPropertiesUsed = (value = []) => {
  return value?.length ? transitionProperties.every((category) => {
    return category.properties.every((property) => {
      return property.isDisabled || !!value?.find((item) => {
        return item.value?.selection?.value?.value?.value === property.value;
      });
    });
  }) : false;
};
var getSelectionSizeProps = (recentlyUsedList, disabledItems, showPromotion) => {
  return {
    selectionLabel: __50("Type", "elementor"),
    sizeLabel: __50("Duration", "elementor"),
    selectionConfig: {
      component: TransitionSelector,
      props: {
        recentlyUsedList,
        disabledItems,
        showPromotion
      }
    },
    sizeConfigMap: {
      ...transitionProperties.reduce(
        (acc, category) => {
          category.properties.forEach((property) => {
            acc[property.value] = DURATION_CONFIG;
          });
          return acc;
        },
        {}
      )
    }
  };
};
var isItemDisabled = (item) => {
  const property = getTransitionPropertyByValue(item.value.selection.value?.value);
  return !property ? false : !!property.isDisabled;
};
var getChildControlConfig = (recentlyUsedList, disabledItems, showPromotion) => {
  return {
    propTypeUtil: selectionSizePropTypeUtil2,
    component: SelectionSizeControl,
    props: getSelectionSizeProps(recentlyUsedList, disabledItems, showPromotion),
    isItemDisabled
  };
};
var isPropertyUsed = (value, property) => {
  return (value ?? []).some((item) => {
    return item?.value?.selection?.value?.value?.value === property.value;
  });
};
var getDisabledItemLabels = (values = []) => {
  const selectedLabels = (values || []).map(
    (item) => item.value?.selection?.value?.key?.value
  );
  const proDisabledLabels = [];
  transitionProperties.forEach((category) => {
    const disabledProperties = category.properties.filter((property) => property.isDisabled && !selectedLabels.includes(property.label)).map((property) => property.label);
    proDisabledLabels.push(...disabledProperties);
  });
  return {
    allDisabled: [...selectedLabels, ...proDisabledLabels],
    proDisabled: proDisabledLabels
  };
};
var getInitialValue = (values = []) => {
  if (!values?.length) {
    return initialTransitionValue;
  }
  for (const category of transitionProperties) {
    for (const property of category.properties) {
      if (isPropertyUsed(values, property)) {
        continue;
      }
      return {
        ...initialTransitionValue,
        selection: {
          $$type: "key-value",
          value: {
            key: { value: property.label, $$type: "string" },
            value: { value: property.value, $$type: "string" }
          }
        }
      };
    }
  }
  return initialTransitionValue;
};
var disableAddItemTooltipContent = /* @__PURE__ */ React98.createElement(
  Alert2,
  {
    sx: {
      width: 280,
      gap: 0.5
    },
    color: "secondary",
    icon: /* @__PURE__ */ React98.createElement(InfoCircleFilledIcon3, null)
  },
  /* @__PURE__ */ React98.createElement(AlertTitle3, null, __50("Transitions", "elementor")),
  /* @__PURE__ */ React98.createElement(Box20, { component: "span" }, /* @__PURE__ */ React98.createElement(Typography7, { variant: "body2" }, __50("Switch to 'Normal' state to add a transition.", "elementor")))
);
var TransitionRepeaterControl = createControl(
  ({
    recentlyUsedListGetter,
    currentStyleState
  }) => {
    const currentStyleIsNormal = currentStyleState === null;
    const [recentlyUsedList, setRecentlyUsedList] = useState16([]);
    const { value, setValue } = useBoundProp(childArrayPropTypeUtil);
    const { allDisabled: disabledItems, proDisabled: proDisabledItems } = useMemo13(
      () => getDisabledItemLabels(value),
      [value]
    );
    const allowedTransitionSet = useMemo13(() => {
      const set = /* @__PURE__ */ new Set();
      transitionProperties.forEach((category) => {
        category.properties.forEach((prop) => set.add(prop.value));
      });
      return set;
    }, []);
    useEffect11(() => {
      if (!value || value.length === 0) {
        return;
      }
      const sanitized = value.filter((item) => {
        const selectionValue = item?.value?.selection?.value?.value?.value ?? "";
        return allowedTransitionSet.has(selectionValue);
      });
      if (sanitized.length !== value.length) {
        setValue(sanitized);
      }
    }, [allowedTransitionSet]);
    useEffect11(() => {
      recentlyUsedListGetter().then(setRecentlyUsedList);
    }, [recentlyUsedListGetter]);
    const allPropertiesUsed = useMemo13(() => areAllPropertiesUsed(value), [value]);
    const isAddItemDisabled = !currentStyleIsNormal || allPropertiesUsed;
    return /* @__PURE__ */ React98.createElement(
      RepeatableControl,
      {
        label: __50("Transitions", "elementor"),
        repeaterLabel: __50("Transitions", "elementor"),
        patternLabel: "${value.selection.value.key.value}: ${value.size.value.size}${value.size.value.unit}",
        placeholder: __50("Empty Transition", "elementor"),
        showDuplicate: false,
        showToggle: true,
        initialValues: getInitialValue(value),
        childControlConfig: getChildControlConfig(
          recentlyUsedList,
          disabledItems,
          proDisabledItems.length > 0
        ),
        propKey: "transition",
        addItemTooltipProps: {
          disabled: isAddItemDisabled,
          enableTooltip: !currentStyleIsNormal,
          tooltipContent: disableAddItemTooltipContent
        }
      }
    );
  }
);

// src/controls/date-time-control.tsx
import * as React99 from "react";
import * as dayjs from "dayjs";
import { isTransformable as isTransformable2, stringPropTypeUtil as stringPropTypeUtil15 } from "@elementor/editor-props";
import { DateTimePropTypeUtil } from "@elementor/editor-props";
import { Box as Box21, DatePicker, LocalizationProvider, TimePicker } from "@elementor/ui";
var DATE_FORMAT = "YYYY-MM-DD";
var TIME_FORMAT = "HH:mm";
var DateTimeControl = createControl(({ inputDisabled }) => {
  const { value, setValue, ...propContext } = useBoundProp(DateTimePropTypeUtil);
  const handleChange = (newValue, meta) => {
    const field = meta.bind;
    const fieldValue = newValue[field];
    if (isTransformable2(fieldValue)) {
      return setValue({ ...value, [field]: fieldValue });
    }
    let formattedValue = "";
    if (fieldValue) {
      const dayjsValue = fieldValue;
      formattedValue = field === "date" ? dayjsValue.format(DATE_FORMAT) : dayjsValue.format(TIME_FORMAT);
    }
    setValue({
      ...value,
      [field]: {
        $$type: "string",
        value: formattedValue
      }
    });
  };
  const parseDateValue = (dateStr) => {
    if (!dateStr) {
      return null;
    }
    const d = dayjs.default(dateStr);
    return d && typeof d.isValid === "function" && d.isValid() ? d : null;
  };
  const parseTimeValue = (timeStr) => {
    if (!timeStr) {
      return null;
    }
    const [hours, minutes] = timeStr.split(":");
    const h = Number.parseInt(hours ?? "", 10);
    const m = Number.parseInt(minutes ?? "", 10);
    if (Number.isNaN(h) || Number.isNaN(m)) {
      return null;
    }
    const base = dayjs.default();
    return base.hour(h).minute(m).second(0).millisecond(0);
  };
  return /* @__PURE__ */ React99.createElement(PropProvider, { ...propContext, value, setValue }, /* @__PURE__ */ React99.createElement(ControlActions, null, /* @__PURE__ */ React99.createElement(LocalizationProvider, null, /* @__PURE__ */ React99.createElement(Box21, { display: "flex", gap: 1, alignItems: "center" }, /* @__PURE__ */ React99.createElement(PropKeyProvider, { bind: "date" }, /* @__PURE__ */ React99.createElement(
    DatePicker,
    {
      value: parseDateValue(stringPropTypeUtil15.extract(value?.date)),
      onChange: (v) => handleChange({ date: v }, { bind: "date" }),
      disabled: inputDisabled,
      slotProps: {
        textField: { size: "tiny" },
        openPickerButton: { size: "tiny" },
        openPickerIcon: { fontSize: "tiny" }
      }
    }
  )), /* @__PURE__ */ React99.createElement(PropKeyProvider, { bind: "time" }, /* @__PURE__ */ React99.createElement(
    TimePicker,
    {
      value: parseTimeValue(stringPropTypeUtil15.extract(value?.time)),
      onChange: (v) => handleChange({ time: v }, { bind: "time" }),
      disabled: inputDisabled,
      slotProps: {
        textField: { size: "tiny" },
        openPickerButton: { size: "tiny" },
        openPickerIcon: { fontSize: "tiny" }
      }
    }
  ))))));
});

// src/controls/inline-editing-control.tsx
import * as React101 from "react";
import { useCallback as useCallback3, useEffect as useEffect13, useMemo as useMemo14 } from "react";
import { htmlV3PropTypeUtil, parseHtmlChildren, stringPropTypeUtil as stringPropTypeUtil16 } from "@elementor/editor-props";
import { Box as Box23 } from "@elementor/ui";
import { debounce as debounce4 } from "@elementor/utils";

// src/components/inline-editor.tsx
import * as React100 from "react";
import {
  useEffect as useEffect12,
  useRef as useRef24
} from "react";
import { Box as Box22, ClickAwayListener } from "@elementor/ui";
import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import Italic from "@tiptap/extension-italic";
import Link3 from "@tiptap/extension-link";
import Paragraph from "@tiptap/extension-paragraph";
import Strike from "@tiptap/extension-strike";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Text from "@tiptap/extension-text";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";

// src/utils/inline-editing.ts
function isEmpty(value = "") {
  if (!value) {
    return true;
  }
  const pseudoElement = document.createElement("div");
  pseudoElement.innerHTML = value;
  return !pseudoElement.textContent?.length;
}

// src/components/inline-editor.tsx
var ITALIC_KEYBOARD_SHORTCUT = "i";
var BOLD_KEYBOARD_SHORTCUT = "b";
var UNDERLINE_KEYBOARD_SHORTCUT = "u";
var InlineEditor = React100.forwardRef((props, ref) => {
  const {
    value,
    setValue,
    editorProps = {},
    elementClasses = "",
    autofocus = false,
    sx = {},
    onBlur = void 0,
    expectedTag = null,
    onEditorCreate,
    wrapperClassName,
    onSelectionEnd
  } = props;
  const containerRef = useRef24(null);
  const documentContentSettings = !!expectedTag ? "block+" : "inline*";
  const onUpdate = ({ editor: updatedEditor }) => {
    const newValue = updatedEditor.getHTML();
    setValue(isEmpty(newValue) ? null : newValue);
  };
  const onKeyDown = (_, event) => {
    if (event.key === "Escape") {
      onBlur?.();
    }
    if (!event.metaKey && !event.ctrlKey || event.altKey) {
      return;
    }
    if ([ITALIC_KEYBOARD_SHORTCUT, BOLD_KEYBOARD_SHORTCUT, UNDERLINE_KEYBOARD_SHORTCUT].includes(event.key)) {
      event.stopPropagation();
    }
  };
  const editedElementAttributes = (HTMLAttributes) => ({
    ...HTMLAttributes,
    class: elementClasses
  });
  const editor = useEditor({
    extensions: [
      Document.extend({
        content: documentContentSettings
      }),
      Paragraph.extend({
        renderHTML({ HTMLAttributes }) {
          const tag = expectedTag ?? "p";
          return [tag, editedElementAttributes(HTMLAttributes), 0];
        }
      }),
      Heading.extend({
        renderHTML({ node, HTMLAttributes }) {
          if (expectedTag) {
            return [expectedTag, editedElementAttributes(HTMLAttributes), 0];
          }
          const level = this.options.levels.includes(node.attrs.level) ? node.attrs.level : this.options.levels[0];
          return [`h${level}`, editedElementAttributes(HTMLAttributes), 0];
        }
      }).configure({
        levels: [1, 2, 3, 4, 5, 6]
      }),
      Link3.configure({
        openOnClick: false
      }),
      Text,
      Bold,
      Italic,
      Strike,
      Superscript,
      Subscript,
      Underline,
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            Enter: () => this.editor.commands.setHardBreak()
          };
        }
      })
    ],
    content: value,
    onUpdate,
    autofocus,
    editorProps: {
      ...editorProps,
      handleDOMEvents: {
        keydown: onKeyDown
      },
      attributes: {
        ...editorProps.attributes ?? {},
        role: "textbox"
      }
    },
    onCreate: onEditorCreate ? ({ editor: mountedEditor }) => onEditorCreate(mountedEditor) : void 0,
    onSelectionUpdate: onSelectionEnd ? ({ editor: updatedEditor }) => onSelectionEnd(updatedEditor.view) : void 0
  });
  useOnUpdate(() => {
    if (!editor) {
      return;
    }
    const currentContent = editor.getHTML();
    if (currentContent !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);
  return /* @__PURE__ */ React100.createElement(React100.Fragment, null, /* @__PURE__ */ React100.createElement(
    Wrapper,
    {
      containerRef,
      editor,
      sx,
      onBlur,
      className: wrapperClassName
    },
    /* @__PURE__ */ React100.createElement(EditorContent, { ref, editor })
  ));
});
var Wrapper = ({ children, containerRef, editor, sx, onBlur, className }) => {
  const wrappedChildren = /* @__PURE__ */ React100.createElement(Box22, { ref: containerRef, ...sx, className }, children);
  return onBlur ? /* @__PURE__ */ React100.createElement(
    ClickAwayListener,
    {
      onClickAway: (event) => {
        if (containerRef.current?.contains(event.target) || editor.view.dom.contains(event.target)) {
          return;
        }
        onBlur?.();
      }
    },
    wrappedChildren
  ) : /* @__PURE__ */ React100.createElement(React100.Fragment, null, wrappedChildren);
};
var useOnUpdate = (callback, dependencies) => {
  const hasMounted = useRef24(false);
  useEffect12(() => {
    if (hasMounted.current) {
      callback();
    } else {
      hasMounted.current = true;
    }
  }, dependencies);
};

// src/controls/inline-editing-control.tsx
var CHILDREN_PARSE_DEBOUNCE_MS = 300;
var InlineEditingControl = createControl(
  ({
    sx,
    attributes,
    props
  }) => {
    const { value, setValue } = useBoundProp(htmlV3PropTypeUtil);
    const content = stringPropTypeUtil16.extract(value?.content ?? null) ?? "";
    const debouncedParse = useMemo14(
      () => debounce4((html) => {
        const parsed = parseHtmlChildren(html);
        setValue({
          content: parsed.content ? stringPropTypeUtil16.create(parsed.content) : null,
          children: parsed.children
        });
      }, CHILDREN_PARSE_DEBOUNCE_MS),
      [setValue]
    );
    const handleChange = useCallback3(
      (newValue) => {
        const html = newValue ?? "";
        setValue({
          content: html ? stringPropTypeUtil16.create(html) : null,
          children: value?.children ?? []
        });
        debouncedParse(html);
      },
      [setValue, value?.children, debouncedParse]
    );
    useEffect13(() => () => debouncedParse.cancel(), [debouncedParse]);
    return /* @__PURE__ */ React101.createElement(ControlActions, null, /* @__PURE__ */ React101.createElement(
      Box23,
      {
        sx: {
          p: 0.8,
          border: "1px solid",
          borderColor: "grey.200",
          borderRadius: "8px",
          transition: "border-color .2s ease, box-shadow .2s ease",
          "&:hover": {
            borderColor: "black"
          },
          "&:focus-within": {
            borderColor: "black",
            boxShadow: "0 0 0 1px black"
          },
          "& .ProseMirror:focus": {
            outline: "none"
          },
          "& .ProseMirror": {
            minHeight: "70px",
            fontSize: "12px",
            "& a": {
              color: "inherit"
            },
            "& .elementor-inline-editor-reset": {
              margin: 0,
              padding: 0
            }
          },
          ".strip-styles *": {
            all: "unset"
          },
          ...sx
        },
        ...attributes,
        ...props
      },
      /* @__PURE__ */ React101.createElement(InlineEditor, { value: content, setValue: handleChange })
    ));
  }
);

// src/controls/email-form-action-control.tsx
import * as React102 from "react";
import { emailPropTypeUtil } from "@elementor/editor-props";
import { CollapsibleContent } from "@elementor/editor-ui";
import { Box as Box24, Divider as Divider5, Grid as Grid29, Stack as Stack17 } from "@elementor/ui";
import { __ as __51 } from "@wordpress/i18n";
var EmailField = ({ bind, label, placeholder }) => /* @__PURE__ */ React102.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React102.createElement(Grid29, { container: true, direction: "column", gap: 0.5 }, /* @__PURE__ */ React102.createElement(Grid29, { item: true }, /* @__PURE__ */ React102.createElement(ControlFormLabel, null, label)), /* @__PURE__ */ React102.createElement(Grid29, { item: true }, /* @__PURE__ */ React102.createElement(TextControl, { placeholder }))));
var SendToField = () => /* @__PURE__ */ React102.createElement(
  EmailField,
  {
    bind: "to",
    label: __51("Send To", "elementor"),
    placeholder: __51("Where should we send new submissions?", "elementor")
  }
);
var SubjectField = () => /* @__PURE__ */ React102.createElement(
  EmailField,
  {
    bind: "subject",
    label: __51("Email Subject", "elementor"),
    placeholder: __51("New form submission", "elementor")
  }
);
var MessageField = () => /* @__PURE__ */ React102.createElement(PropKeyProvider, { bind: "message" }, /* @__PURE__ */ React102.createElement(Grid29, { container: true, direction: "column", gap: 0.5 }, /* @__PURE__ */ React102.createElement(Grid29, { item: true }, /* @__PURE__ */ React102.createElement(ControlFormLabel, null, __51("Message", "elementor"))), /* @__PURE__ */ React102.createElement(Grid29, { item: true }, /* @__PURE__ */ React102.createElement(
  TextAreaControl,
  {
    placeholder: __51(
      "By default, all form fields are sent via [all-fields] shortcode.",
      "elementor"
    )
  }
))));
var FromEmailField = () => /* @__PURE__ */ React102.createElement(
  EmailField,
  {
    bind: "from",
    label: __51("From email", "elementor"),
    placeholder: __51("What email address should appear as the sender?", "elementor")
  }
);
var FromNameField = () => /* @__PURE__ */ React102.createElement(
  EmailField,
  {
    bind: "from-name",
    label: __51("From name", "elementor"),
    placeholder: __51("What name should appear as the sender?", "elementor")
  }
);
var ReplyToField = () => /* @__PURE__ */ React102.createElement(EmailField, { bind: "reply-to", label: __51("Reply-to", "elementor") });
var CcField = () => /* @__PURE__ */ React102.createElement(EmailField, { bind: "cc", label: __51("Cc", "elementor") });
var BccField = () => /* @__PURE__ */ React102.createElement(EmailField, { bind: "bcc", label: __51("Bcc", "elementor") });
var MetaDataField = () => /* @__PURE__ */ React102.createElement(PropKeyProvider, { bind: "meta-data" }, /* @__PURE__ */ React102.createElement(Stack17, { gap: 0.5 }, /* @__PURE__ */ React102.createElement(ControlLabel, null, __51("Meta data", "elementor")), /* @__PURE__ */ React102.createElement(
  ChipsControl,
  {
    options: [
      { label: __51("Date", "elementor"), value: "date" },
      { label: __51("Time", "elementor"), value: "time" },
      { label: __51("Page URL", "elementor"), value: "page-url" },
      { label: __51("User agent", "elementor"), value: "user-agent" },
      { label: __51("Credit", "elementor"), value: "credit" }
    ]
  }
)));
var SendAsField = () => /* @__PURE__ */ React102.createElement(PropKeyProvider, { bind: "send-as" }, /* @__PURE__ */ React102.createElement(Grid29, { container: true, direction: "column", gap: 0.5 }, /* @__PURE__ */ React102.createElement(Grid29, { item: true }, /* @__PURE__ */ React102.createElement(ControlFormLabel, null, __51("Send as", "elementor"))), /* @__PURE__ */ React102.createElement(Grid29, { item: true }, /* @__PURE__ */ React102.createElement(
  SelectControl,
  {
    options: [
      { label: __51("HTML", "elementor"), value: "html" },
      { label: __51("Plain Text", "elementor"), value: "plain" }
    ]
  }
))));
var AdvancedSettings = () => /* @__PURE__ */ React102.createElement(CollapsibleContent, { defaultOpen: false }, /* @__PURE__ */ React102.createElement(Box24, { sx: { pt: 2 } }, /* @__PURE__ */ React102.createElement(Stack17, { gap: 2 }, /* @__PURE__ */ React102.createElement(FromNameField, null), /* @__PURE__ */ React102.createElement(ReplyToField, null), /* @__PURE__ */ React102.createElement(CcField, null), /* @__PURE__ */ React102.createElement(BccField, null), /* @__PURE__ */ React102.createElement(Divider5, null), /* @__PURE__ */ React102.createElement(MetaDataField, null), /* @__PURE__ */ React102.createElement(SendAsField, null))));
var EmailFormActionControl = createControl(() => {
  const { value, setValue, ...propContext } = useBoundProp(emailPropTypeUtil);
  return /* @__PURE__ */ React102.createElement(PropProvider, { ...propContext, value, setValue }, /* @__PURE__ */ React102.createElement(Stack17, { gap: 2 }, /* @__PURE__ */ React102.createElement(ControlFormLabel, null, __51("Email settings", "elementor")), /* @__PURE__ */ React102.createElement(SendToField, null), /* @__PURE__ */ React102.createElement(SubjectField, null), /* @__PURE__ */ React102.createElement(MessageField, null), /* @__PURE__ */ React102.createElement(FromEmailField, null), /* @__PURE__ */ React102.createElement(AdvancedSettings, null)));
});

// src/components/promotions/display-conditions-control.tsx
import * as React104 from "react";
import { useRef as useRef25 } from "react";
import { SitemapIcon } from "@elementor/icons";
import { IconButton as IconButton8, Stack as Stack18, Tooltip as Tooltip9 } from "@elementor/ui";
import { __ as __52 } from "@wordpress/i18n";

// src/components/promotions/promotion-trigger.tsx
import * as React103 from "react";
import { forwardRef as forwardRef11, useImperativeHandle, useState as useState17 } from "react";
import { PromotionChip as PromotionChip2, PromotionInfotip } from "@elementor/editor-ui";
import { Box as Box25 } from "@elementor/ui";
function getV4Promotion(key) {
  return window.elementor?.config?.v4Promotions?.[key];
}
var PromotionTrigger = forwardRef11(
  ({ promotionKey, children }, ref) => {
    const [isOpen, setIsOpen] = useState17(false);
    const promotion = getV4Promotion(promotionKey);
    const toggle = () => setIsOpen((prev) => !prev);
    useImperativeHandle(ref, () => ({ toggle }), []);
    return /* @__PURE__ */ React103.createElement(React103.Fragment, null, promotion && /* @__PURE__ */ React103.createElement(
      PromotionInfotip,
      {
        title: promotion.title,
        content: promotion.content,
        assetUrl: promotion.image,
        ctaUrl: promotion.ctaUrl,
        open: isOpen,
        onClose: (e) => {
          e.stopPropagation();
          setIsOpen(false);
        }
      },
      /* @__PURE__ */ React103.createElement(
        Box25,
        {
          onClick: (e) => {
            e.stopPropagation();
            toggle();
          },
          sx: { cursor: "pointer", display: "inline-flex" }
        },
        children ?? /* @__PURE__ */ React103.createElement(PromotionChip2, null)
      )
    ));
  }
);

// src/components/promotions/display-conditions-control.tsx
var ARIA_LABEL = __52("Display Conditions", "elementor");
var DisplayConditionsControl = createControl(() => {
  const triggerRef = useRef25(null);
  return /* @__PURE__ */ React104.createElement(
    Stack18,
    {
      direction: "row",
      spacing: 2,
      sx: {
        justifyContent: "flex-end",
        alignItems: "center"
      }
    },
    /* @__PURE__ */ React104.createElement(PromotionTrigger, { ref: triggerRef, promotionKey: "displayConditions" }),
    /* @__PURE__ */ React104.createElement(Tooltip9, { title: ARIA_LABEL, placement: "top" }, /* @__PURE__ */ React104.createElement(
      IconButton8,
      {
        size: "tiny",
        "aria-label": ARIA_LABEL,
        "data-behavior": "display-conditions",
        onClick: () => triggerRef.current?.toggle(),
        sx: {
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1
        }
      },
      /* @__PURE__ */ React104.createElement(SitemapIcon, { fontSize: "tiny", color: "disabled" })
    ))
  );
});

// src/components/promotions/attributes-control.tsx
import * as React105 from "react";
import { useRef as useRef26 } from "react";
import { PlusIcon as PlusIcon3 } from "@elementor/icons";
import { Stack as Stack19, Tooltip as Tooltip10 } from "@elementor/ui";
import { __ as __53 } from "@wordpress/i18n";
var ARIA_LABEL2 = __53("Attributes", "elementor");
var AttributesControl = createControl(() => {
  const triggerRef = useRef26(null);
  return /* @__PURE__ */ React105.createElement(
    Stack19,
    {
      direction: "row",
      spacing: 2,
      sx: {
        justifyContent: "flex-end",
        alignItems: "center"
      }
    },
    /* @__PURE__ */ React105.createElement(PromotionTrigger, { ref: triggerRef, promotionKey: "attributes" }),
    /* @__PURE__ */ React105.createElement(Tooltip10, { title: ARIA_LABEL2, placement: "top" }, /* @__PURE__ */ React105.createElement(
      PlusIcon3,
      {
        "aria-label": ARIA_LABEL2,
        fontSize: "tiny",
        color: "disabled",
        onClick: () => triggerRef.current?.toggle(),
        sx: { cursor: "pointer" }
      }
    ))
  );
});

// src/components/icon-buttons/clear-icon-button.tsx
import * as React106 from "react";
import { BrushBigIcon } from "@elementor/icons";
import { IconButton as IconButton9, styled as styled9, Tooltip as Tooltip11 } from "@elementor/ui";
var CustomIconButton = styled9(IconButton9)(({ theme }) => ({
  width: theme.spacing(2.5),
  height: theme.spacing(2.5)
}));
var ClearIconButton = ({ tooltipText, onClick, disabled, size = "tiny" }) => /* @__PURE__ */ React106.createElement(Tooltip11, { title: tooltipText, placement: "top", disableInteractive: true }, /* @__PURE__ */ React106.createElement(CustomIconButton, { "aria-label": tooltipText, size, onClick, disabled }, /* @__PURE__ */ React106.createElement(BrushBigIcon, { fontSize: size })));

// src/components/repeater/repeater.tsx
import * as React107 from "react";
import { useEffect as useEffect14, useState as useState18 } from "react";
import { CopyIcon as CopyIcon2, EyeIcon as EyeIcon2, EyeOffIcon as EyeOffIcon2, PlusIcon as PlusIcon4, XIcon as XIcon4 } from "@elementor/icons";
import {
  bindPopover as bindPopover7,
  bindTrigger as bindTrigger6,
  Box as Box26,
  IconButton as IconButton10,
  Infotip as Infotip4,
  Tooltip as Tooltip12,
  usePopupState as usePopupState8
} from "@elementor/ui";
import { __ as __54 } from "@wordpress/i18n";
var SIZE10 = "tiny";
var EMPTY_OPEN_ITEM2 = -1;
var Repeater3 = ({
  label,
  itemSettings,
  disabled = false,
  openOnAdd = false,
  values: items2 = [],
  setValues: setItems,
  showDuplicate = true,
  showToggle = true,
  showRemove = true,
  disableAddItemButton = false,
  addButtonInfotipContent,
  openItem: initialOpenItem = EMPTY_OPEN_ITEM2,
  isSortable = true
}) => {
  const [openItem, setOpenItem] = useState18(initialOpenItem);
  const uniqueKeys = items2.map(
    (item, index) => isSortable && "getId" in itemSettings ? itemSettings.getId({ item, index }) : String(index)
  );
  const addRepeaterItem = () => {
    const newItem = structuredClone(itemSettings.initialValues);
    const newIndex = items2.length;
    setItems(
      [...items2, newItem],
      {},
      {
        action: { type: "add", payload: [{ index: newIndex, item: newItem }] }
      }
    );
    if (openOnAdd) {
      setOpenItem(newIndex);
    }
  };
  const duplicateRepeaterItem = (index) => {
    const newItem = structuredClone(items2[index]);
    const atPosition = 1 + index;
    setItems(
      [...items2.slice(0, atPosition), newItem, ...items2.slice(atPosition)],
      {},
      {
        action: { type: "duplicate", payload: [{ index, item: newItem }] }
      }
    );
  };
  const removeRepeaterItem = (index) => {
    const removedItem = items2[index];
    setItems(
      items2.filter((_, pos) => {
        return pos !== index;
      }),
      {},
      { action: { type: "remove", payload: [{ index, item: removedItem }] } }
    );
  };
  const toggleDisableRepeaterItem = (index) => {
    setItems(
      items2.map((value, pos) => {
        if (pos === index) {
          const { disabled: propDisabled, ...rest } = value;
          return { ...rest, ...propDisabled ? {} : { disabled: true } };
        }
        return value;
      }),
      {},
      { action: { type: "toggle-disable" } }
    );
  };
  const onChangeOrder = (reorderedKeys, meta) => {
    setItems(
      reorderedKeys.map((id) => {
        return items2[uniqueKeys.indexOf(id)];
      }),
      {},
      { action: { type: "reorder", payload: { ...meta } } }
    );
  };
  const isButtonDisabled = disabled || disableAddItemButton;
  const shouldShowInfotip = isButtonDisabled && addButtonInfotipContent;
  const addButton = /* @__PURE__ */ React107.createElement(
    IconButton10,
    {
      size: SIZE10,
      sx: {
        ml: "auto"
      },
      disabled: isButtonDisabled,
      onClick: addRepeaterItem,
      "aria-label": __54("Add item", "elementor")
    },
    /* @__PURE__ */ React107.createElement(PlusIcon4, { fontSize: SIZE10 })
  );
  return /* @__PURE__ */ React107.createElement(SectionContent, { gap: 2 }, /* @__PURE__ */ React107.createElement(RepeaterHeader, { label, adornment: ControlAdornments }, shouldShowInfotip ? /* @__PURE__ */ React107.createElement(
    Infotip4,
    {
      placement: "right",
      content: addButtonInfotipContent,
      color: "secondary",
      slotProps: { popper: { sx: { width: 300 } } }
    },
    /* @__PURE__ */ React107.createElement(Box26, { sx: { ...isButtonDisabled ? { cursor: "not-allowed" } : {} } }, addButton)
  ) : addButton), 0 < uniqueKeys.length && /* @__PURE__ */ React107.createElement(SortableProvider, { value: uniqueKeys, onChange: onChangeOrder }, uniqueKeys.map((key) => {
    const index = uniqueKeys.indexOf(key);
    const value = items2[index];
    if (!value) {
      return null;
    }
    return /* @__PURE__ */ React107.createElement(SortableItem, { id: key, key: `sortable-${key}`, disabled: !isSortable }, /* @__PURE__ */ React107.createElement(
      RepeaterItem,
      {
        disabled,
        propDisabled: value?.disabled,
        label: /* @__PURE__ */ React107.createElement(RepeaterItemLabelSlot, { value }, /* @__PURE__ */ React107.createElement(itemSettings.Label, { value, index })),
        startIcon: /* @__PURE__ */ React107.createElement(RepeaterItemIconSlot, { value }, /* @__PURE__ */ React107.createElement(itemSettings.Icon, { value })),
        removeItem: () => removeRepeaterItem(index),
        duplicateItem: () => duplicateRepeaterItem(index),
        toggleDisableItem: () => toggleDisableRepeaterItem(index),
        openOnMount: openOnAdd && openItem === index,
        onOpen: () => setOpenItem(EMPTY_OPEN_ITEM2),
        showDuplicate,
        showToggle,
        showRemove,
        actions: itemSettings.actions,
        value
      },
      (props) => /* @__PURE__ */ React107.createElement(
        itemSettings.Content,
        {
          ...props,
          value,
          bind: String(index),
          index
        }
      )
    ));
  })));
};
var RepeaterItem = ({
  label,
  propDisabled,
  startIcon,
  children,
  removeItem,
  duplicateItem,
  toggleDisableItem,
  openOnMount,
  onOpen,
  showDuplicate,
  showToggle,
  showRemove,
  disabled,
  actions,
  value
}) => {
  const { popoverState, popoverProps, ref, setRef } = usePopover(openOnMount, onOpen);
  const duplicateLabel = __54("Duplicate", "elementor");
  const toggleLabel = propDisabled ? __54("Show", "elementor") : __54("Hide", "elementor");
  const removeLabel = __54("Remove", "elementor");
  return /* @__PURE__ */ React107.createElement(React107.Fragment, null, /* @__PURE__ */ React107.createElement(
    RepeaterTag,
    {
      disabled,
      label,
      ref: setRef,
      "aria-label": __54("Open item", "elementor"),
      ...bindTrigger6(popoverState),
      startIcon,
      actions: /* @__PURE__ */ React107.createElement(React107.Fragment, null, showDuplicate && /* @__PURE__ */ React107.createElement(Tooltip12, { title: duplicateLabel, placement: "top" }, /* @__PURE__ */ React107.createElement(IconButton10, { size: SIZE10, onClick: duplicateItem, "aria-label": duplicateLabel }, /* @__PURE__ */ React107.createElement(CopyIcon2, { fontSize: SIZE10 }))), showToggle && /* @__PURE__ */ React107.createElement(Tooltip12, { title: toggleLabel, placement: "top" }, /* @__PURE__ */ React107.createElement(IconButton10, { size: SIZE10, onClick: toggleDisableItem, "aria-label": toggleLabel }, propDisabled ? /* @__PURE__ */ React107.createElement(EyeOffIcon2, { fontSize: SIZE10 }) : /* @__PURE__ */ React107.createElement(EyeIcon2, { fontSize: SIZE10 }))), actions?.(value), showRemove && /* @__PURE__ */ React107.createElement(Tooltip12, { title: removeLabel, placement: "top" }, /* @__PURE__ */ React107.createElement(IconButton10, { size: SIZE10, onClick: removeItem, "aria-label": removeLabel }, /* @__PURE__ */ React107.createElement(XIcon4, { fontSize: SIZE10 }))))
    }
  ), /* @__PURE__ */ React107.createElement(RepeaterPopover, { width: ref?.getBoundingClientRect().width, ...popoverProps, anchorEl: ref }, /* @__PURE__ */ React107.createElement(Box26, null, children({ anchorEl: ref }))));
};
var usePopover = (openOnMount, onOpen) => {
  const [ref, setRef] = useState18(null);
  const popoverState = usePopupState8({ variant: "popover" });
  const popoverProps = bindPopover7(popoverState);
  useEffect14(() => {
    if (openOnMount && ref) {
      popoverState.open(ref);
      onOpen?.();
    }
  }, [ref]);
  return {
    popoverState,
    ref,
    setRef,
    popoverProps
  };
};

// src/components/inline-editor-toolbar.tsx
import * as React109 from "react";
import { useMemo as useMemo15, useRef as useRef28, useState as useState19 } from "react";
import { getContainer, getElementSetting } from "@elementor/editor-elements";
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon as LinkIcon3,
  MinusIcon as MinusIcon2,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon
} from "@elementor/icons";
import {
  Box as Box27,
  IconButton as IconButton11,
  ToggleButton as ToggleButton3,
  ToggleButtonGroup as ToggleButtonGroup2,
  toggleButtonGroupClasses,
  Tooltip as Tooltip14,
  usePopupState as usePopupState9
} from "@elementor/ui";
import { useEditorState } from "@tiptap/react";
import { __ as __56 } from "@wordpress/i18n";

// src/components/url-popover.tsx
import * as React108 from "react";
import { useEffect as useEffect15, useRef as useRef27 } from "react";
import { ExternalLinkIcon } from "@elementor/icons";
import { bindPopover as bindPopover8, Popover as Popover7, Stack as Stack20, TextField as TextField9, ToggleButton as ToggleButton2, Tooltip as Tooltip13 } from "@elementor/ui";
import { __ as __55 } from "@wordpress/i18n";
var UrlPopover = ({
  popupState,
  restoreValue,
  anchorRef,
  value,
  onChange,
  openInNewTab,
  onToggleNewTab
}) => {
  const inputRef = useRef27(null);
  useEffect15(() => {
    if (popupState.isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [popupState.isOpen]);
  const handleClose = () => {
    restoreValue();
    popupState.close();
  };
  return /* @__PURE__ */ React108.createElement(
    Popover7,
    {
      slotProps: {
        paper: { sx: { borderRadius: "16px", width: anchorRef.current?.offsetWidth + "px", marginTop: -1 } }
      },
      ...bindPopover8(popupState),
      anchorOrigin: { vertical: "top", horizontal: "left" },
      transformOrigin: { vertical: "top", horizontal: "left" },
      onClose: handleClose
    },
    /* @__PURE__ */ React108.createElement(Stack20, { direction: "row", alignItems: "center", gap: 1, sx: { p: 1.5 } }, /* @__PURE__ */ React108.createElement(
      TextField9,
      {
        value,
        onChange,
        size: "tiny",
        fullWidth: true,
        placeholder: __55("Type a URL", "elementor"),
        inputProps: { ref: inputRef },
        color: "secondary",
        InputProps: { sx: { borderRadius: "8px" } },
        onKeyUp: (event) => event.key === "Enter" && handleClose()
      }
    ), /* @__PURE__ */ React108.createElement(Tooltip13, { title: __55("Open in a new tab", "elementor") }, /* @__PURE__ */ React108.createElement(
      ToggleButton2,
      {
        size: "tiny",
        value: "newTab",
        selected: openInNewTab,
        onClick: onToggleNewTab,
        "aria-label": __55("Open in a new tab", "elementor"),
        sx: { borderRadius: "8px" }
      },
      /* @__PURE__ */ React108.createElement(ExternalLinkIcon, { fontSize: "tiny" })
    )))
  );
};

// src/components/inline-editor-toolbar.tsx
var InlineEditorToolbar = ({ editor, elementId, sx = {} }) => {
  const [urlValue, setUrlValue] = useState19("");
  const [openInNewTab, setOpenInNewTab] = useState19(false);
  const toolbarRef = useRef28(null);
  const linkPopupState = usePopupState9({ variant: "popover" });
  const isElementClickable = elementId ? checkIfElementIsClickable(elementId) : false;
  const editorState = useEditorState({
    editor,
    selector: (ctx) => possibleFormats.filter((format) => ctx.editor.isActive(format))
  });
  const formatButtonsList = useMemo15(() => {
    const buttons = Object.values(formatButtons);
    if (isElementClickable) {
      return buttons.filter((button) => button.action !== "link");
    }
    return buttons;
  }, [isElementClickable]);
  const handleLinkClick = () => {
    const linkAttrs = editor.getAttributes("link");
    setUrlValue(linkAttrs.href || "");
    setOpenInNewTab(linkAttrs.target === "_blank");
    linkPopupState.open(toolbarRef.current);
  };
  const handleUrlChange = (event) => {
    setUrlValue(event.target.value);
  };
  const handleToggleNewTab = () => {
    setOpenInNewTab(!openInNewTab);
  };
  const handleUrlSubmit = () => {
    if (urlValue) {
      editor.chain().focus().setLink({
        href: urlValue,
        target: openInNewTab ? "_blank" : "_self"
      }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    if (elementId) {
      window.dispatchEvent(
        new CustomEvent("elementor:inline-link-changed", {
          detail: { elementId }
        })
      );
    }
    linkPopupState.close();
  };
  React109.useEffect(() => {
    editor?.commands?.focus();
  }, [editor]);
  return /* @__PURE__ */ React109.createElement(
    Box27,
    {
      ref: toolbarRef,
      sx: {
        display: "inline-flex",
        gap: 0.5,
        padding: 0.5,
        borderRadius: "8px",
        backgroundColor: "background.paper",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        alignItems: "center",
        visibility: linkPopupState.isOpen ? "hidden" : "visible",
        pointerEvents: linkPopupState.isOpen ? "none" : "all",
        ...sx
      }
    },
    /* @__PURE__ */ React109.createElement(Tooltip14, { title: clearButton.label, placement: "top", sx: { borderRadius: "8px" } }, /* @__PURE__ */ React109.createElement(IconButton11, { "aria-label": clearButton.label, onClick: () => clearButton.method(editor), size: "tiny" }, clearButton.icon)),
    /* @__PURE__ */ React109.createElement(
      ToggleButtonGroup2,
      {
        value: editorState,
        size: "tiny",
        sx: {
          display: "flex",
          gap: 0.5,
          border: "none",
          [`& .${toggleButtonGroupClasses.firstButton}, & .${toggleButtonGroupClasses.middleButton}, & .${toggleButtonGroupClasses.lastButton}`]: {
            borderRadius: "8px",
            border: "none",
            marginLeft: 0,
            "&.Mui-selected": {
              marginLeft: 0
            },
            "& + &.Mui-selected": {
              marginLeft: 0
            }
          }
        }
      },
      formatButtonsList.map((button) => /* @__PURE__ */ React109.createElement(Tooltip14, { title: button.label, key: button.action, placement: "top" }, /* @__PURE__ */ React109.createElement(
        ToggleButton3,
        {
          value: button.action,
          "aria-label": button.label,
          size: "tiny",
          onClick: () => {
            if (button.action === "link") {
              handleLinkClick();
            } else {
              button.method?.(editor);
            }
            editor?.commands?.focus();
          }
        },
        button.icon
      )))
    ),
    /* @__PURE__ */ React109.createElement(
      UrlPopover,
      {
        popupState: linkPopupState,
        anchorRef: toolbarRef,
        restoreValue: handleUrlSubmit,
        value: urlValue,
        onChange: handleUrlChange,
        openInNewTab,
        onToggleNewTab: handleToggleNewTab
      }
    )
  );
};
var checkIfElementIsClickable = (elementId) => {
  const container = getContainer(elementId);
  const type = container?.model.get("widgetType");
  const isButton = type === "e-button";
  const hasLink = !!getElementSetting(elementId, "link")?.value?.destination;
  return isButton || hasLink;
};
var toolbarButtons = {
  clear: {
    label: __56("Clear", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(MinusIcon2, { fontSize: "tiny" }),
    action: "clear",
    method: (editor) => {
      editor.chain().focus().clearNodes().unsetAllMarks().run();
    }
  },
  bold: {
    label: __56("Bold", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(BoldIcon, { fontSize: "tiny" }),
    action: "bold",
    method: (editor) => {
      editor.chain().focus().toggleBold().run();
    }
  },
  italic: {
    label: __56("Italic", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(ItalicIcon, { fontSize: "tiny" }),
    action: "italic",
    method: (editor) => {
      editor.chain().focus().toggleItalic().run();
    }
  },
  underline: {
    label: __56("Underline", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(UnderlineIcon, { fontSize: "tiny" }),
    action: "underline",
    method: (editor) => {
      editor.chain().focus().toggleUnderline().run();
    }
  },
  strike: {
    label: __56("Strikethrough", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(StrikethroughIcon, { fontSize: "tiny" }),
    action: "strike",
    method: (editor) => {
      editor.chain().focus().toggleStrike().run();
    }
  },
  superscript: {
    label: __56("Superscript", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(SuperscriptIcon, { fontSize: "tiny" }),
    action: "superscript",
    method: (editor) => {
      editor.chain().focus().toggleSuperscript().run();
    }
  },
  subscript: {
    label: __56("Subscript", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(SubscriptIcon, { fontSize: "tiny" }),
    action: "subscript",
    method: (editor) => {
      editor.chain().focus().toggleSubscript().run();
    }
  },
  link: {
    label: __56("Link", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(LinkIcon3, { fontSize: "tiny" }),
    action: "link",
    method: null
  }
};
var { clear: clearButton, ...formatButtons } = toolbarButtons;
var possibleFormats = Object.keys(formatButtons);

// src/components/size/unstable-size-field.tsx
import * as React112 from "react";
import { InputAdornment as InputAdornment5 } from "@elementor/ui";

// src/hooks/use-size-value.ts
var DEFAULT_UNIT2 = "px";
var DEFAULT_SIZE2 = "";
var useSizeValue = (externalValue, onChange, defaultUnit) => {
  const [sizeValue, setSizeValue] = useSyncExternalState({
    external: externalValue,
    setExternal: (newState) => {
      if (newState !== null) {
        onChange(newState);
      }
    },
    persistWhen: (newState) => differsFromExternal(newState, externalValue),
    fallback: () => ({ size: DEFAULT_SIZE2, unit: defaultUnit ?? DEFAULT_UNIT2 })
  });
  const setSize = (value) => {
    const newState = {
      ...sizeValue,
      size: value.trim() === "" ? null : Number(value)
    };
    setSizeValue(newState);
  };
  const setUnit = (unit) => {
    const newState = {
      ...sizeValue,
      unit
    };
    setSizeValue(newState);
  };
  return {
    size: sizeValue.size,
    unit: sizeValue.unit,
    setSize,
    setUnit
  };
};
var differsFromExternal = (newState, externalState) => {
  return newState?.size !== externalState?.size || newState?.unit !== externalState?.unit;
};

// src/components/size/unit-select.tsx
import * as React110 from "react";
import { useId as useId3 } from "react";
import { MenuListItem as MenuListItem7 } from "@elementor/editor-ui";
import { bindMenu as bindMenu2, bindTrigger as bindTrigger7, Button as Button6, Menu as Menu3, styled as styled10, usePopupState as usePopupState10 } from "@elementor/ui";
var menuItemContentStyles = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};
var UnitSelect = ({ value, showPrimaryColor, onClick, options }) => {
  const popupState = usePopupState10({
    variant: "popover",
    popupId: useId3()
  });
  const handleMenuItemClick = (index) => {
    onClick(options[index]);
    popupState.close();
  };
  return /* @__PURE__ */ React110.createElement(React110.Fragment, null, /* @__PURE__ */ React110.createElement(StyledButton2, { isPrimaryColor: showPrimaryColor, size: "small", ...bindTrigger7(popupState) }, value), /* @__PURE__ */ React110.createElement(Menu3, { MenuListProps: { dense: true }, ...bindMenu2(popupState) }, options.map((option, index) => /* @__PURE__ */ React110.createElement(
    MenuListItem7,
    {
      key: option,
      onClick: () => handleMenuItemClick(index),
      primaryTypographyProps: {
        variant: "caption",
        sx: {
          ...menuItemContentStyles,
          lineHeight: "1"
        }
      },
      menuItemTextProps: {
        sx: menuItemContentStyles
      }
    },
    option.toUpperCase()
  ))));
};
var StyledButton2 = styled10(Button6, {
  shouldForwardProp: (prop) => prop !== "isPrimaryColor"
})(({ isPrimaryColor, theme }) => ({
  color: isPrimaryColor ? theme.palette.text.primary : theme.palette.text.tertiary,
  font: "inherit",
  minWidth: "initial",
  textTransform: "uppercase"
}));

// src/components/size/unstable-size-input.tsx
import * as React111 from "react";
import { forwardRef as forwardRef12 } from "react";
var UnstableSizeInput = forwardRef12(
  ({ type, value, onChange, onKeyDown, onKeyUp, InputProps, onBlur, focused, disabled }, ref) => {
    return /* @__PURE__ */ React111.createElement(
      NumberInput,
      {
        ref,
        size: "tiny",
        fullWidth: true,
        type,
        value,
        onKeyUp,
        focused,
        disabled,
        onKeyDown,
        onInput: onChange,
        onBlur,
        InputProps,
        sx: getCursorStyle(InputProps?.readOnly ?? false)
      }
    );
  }
);
var getCursorStyle = (readOnly) => ({
  input: { cursor: readOnly ? "default !important" : void 0 }
});

// src/components/size/unstable-size-field.tsx
var UnstableSizeField = ({
  value,
  InputProps,
  onChange,
  onBlur,
  units: units2,
  defaultUnit,
  startIcon
}) => {
  const { size, unit, setSize, setUnit } = useSizeValue(value, onChange, defaultUnit);
  const shouldHighlightUnit = () => {
    return hasValue(size);
  };
  return /* @__PURE__ */ React112.createElement(
    UnstableSizeInput,
    {
      type: "number",
      value: size ?? "",
      onBlur,
      onChange: (event) => setSize(event.target.value),
      InputProps: {
        ...InputProps,
        startAdornment: startIcon && /* @__PURE__ */ React112.createElement(InputAdornment5, { position: "start" }, startIcon),
        endAdornment: /* @__PURE__ */ React112.createElement(InputAdornment5, { position: "end" }, /* @__PURE__ */ React112.createElement(
          UnitSelect,
          {
            options: units2,
            value: unit,
            onClick: setUnit,
            showPrimaryColor: shouldHighlightUnit()
          }
        ))
      }
    }
  );
};
var hasValue = (value) => {
  return value !== null && value !== "";
};

// src/hooks/use-font-families.ts
import { useMemo as useMemo16 } from "react";
import { getElementorConfig } from "@elementor/editor-v1-adapters";
import { __ as __57 } from "@wordpress/i18n";
var supportedCategories = {
  system: __57("System", "elementor"),
  custom: __57("Custom Fonts", "elementor"),
  googlefonts: __57("Google Fonts", "elementor")
};
var getFontFamilies = () => {
  const { controls } = getElementorConfig();
  const options = controls?.font?.options;
  if (!options) {
    return null;
  }
  return options;
};
var useFontFamilies = () => {
  const fontFamilies = getFontFamilies();
  return useMemo16(() => {
    const categoriesOrder = ["system", "custom", "googlefonts"];
    return Object.entries(fontFamilies || {}).reduce((acc, [font, category]) => {
      if (!supportedCategories[category]) {
        return acc;
      }
      const categoryIndex = categoriesOrder.indexOf(category);
      if (!acc[categoryIndex]) {
        acc[categoryIndex] = {
          label: supportedCategories[category],
          fonts: []
        };
      }
      acc[categoryIndex].fonts.push(font);
      return acc;
    }, []).filter(Boolean);
  }, [fontFamilies]);
};
export {
  AspectRatioControl,
  AttributesControl,
  BackgroundControl,
  BoxShadowRepeaterControl,
  ChipsControl,
  ClearIconButton,
  ColorControl,
  ControlActionsProvider,
  ControlAdornments,
  ControlAdornmentsProvider,
  ControlFormLabel,
  ControlReplacementsProvider,
  ControlToggleButtonGroup,
  DateTimeControl,
  DisplayConditionsControl,
  EmailFormActionControl,
  EqualUnequalSizesControl,
  FilterRepeaterControl,
  FontFamilyControl,
  GapControl,
  HtmlTagControl,
  ImageControl,
  InlineEditingControl,
  InlineEditor,
  InlineEditorToolbar,
  ItemSelector,
  KeyValueControl,
  LinkControl,
  LinkedDimensionsControl,
  NumberControl,
  NumberInput,
  PopoverContent,
  PopoverGridContainer,
  PositionControl,
  PromotionTrigger,
  PropKeyProvider,
  PropProvider,
  QueryControl,
  RepeatableControl,
  Repeater3 as Repeater,
  SelectControl,
  SelectControlWrapper,
  SizeControl,
  StrokeControl,
  SvgMediaControl,
  SwitchControl,
  TextAreaControl,
  TextControl,
  ToggleButtonGroupUi,
  ToggleControl,
  TransformRepeaterControl,
  TransformSettingsControl,
  TransitionRepeaterControl,
  UnstableSizeField,
  UrlControl,
  VideoMediaControl,
  createControl,
  createControlReplacementsRegistry,
  enqueueFont,
  getControlReplacements,
  injectIntoRepeaterItemActions,
  injectIntoRepeaterItemIcon,
  injectIntoRepeaterItemLabel,
  isUnitExtendedOption,
  registerControlReplacement,
  transitionProperties,
  transitionsItemsList,
  useBoundProp,
  useControlActions,
  useControlReplacement,
  useFontFamilies,
  useSyncExternalState,
  useTypingBuffer
};
//# sourceMappingURL=index.mjs.map