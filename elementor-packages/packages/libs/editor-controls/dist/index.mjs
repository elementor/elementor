// src/controls/image-control.tsx
import * as React10 from "react";
import { imagePropTypeUtil } from "@elementor/editor-props";
import { Grid, Stack as Stack2 } from "@elementor/ui";
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
  disabled
}) => {
  return /* @__PURE__ */ React.createElement(
    PropContext.Provider,
    {
      value: {
        value,
        propType,
        setValue,
        placeholder,
        disabled
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
  if (!propTypeUtil) {
    return propKeyContext;
  }
  function setValue(value2, options, meta) {
    if (!validate(value2)) {
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
    placeholder
  };
}
var useValidation = (propType) => {
  const [isValid, setIsValid] = useState(true);
  const validate = (value) => {
    let valid = true;
    if (propType.settings.required && value === null) {
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

// src/create-control.tsx
import * as React5 from "react";
import { ErrorBoundary } from "@elementor/ui";

// src/control-replacements.tsx
import * as React4 from "react";
import { createContext as createContext3, useContext as useContext3 } from "react";
var ControlReplacementContext = createContext3([]);
var ControlReplacementsProvider = ({ replacements, children }) => {
  return /* @__PURE__ */ React4.createElement(ControlReplacementContext.Provider, { value: replacements }, children);
};
var useControlReplacement = (OriginalComponent) => {
  const { value } = useBoundProp();
  const replacements = useContext3(ControlReplacementContext);
  try {
    const replacement = replacements.find((r) => r.condition({ value }));
    return replacement?.component ?? OriginalComponent;
  } catch {
    return OriginalComponent;
  }
};
var createControlReplacementsRegistry = () => {
  const controlReplacements = [];
  function registerControlReplacement(replacement) {
    controlReplacements.push(replacement);
  }
  function getControlReplacements() {
    return controlReplacements;
  }
  return { registerControlReplacement, getControlReplacements };
};

// src/create-control.tsx
var brandSymbol = Symbol("control");
function createControl(Control5) {
  return (props) => {
    const Component = useControlReplacement(Control5);
    return /* @__PURE__ */ React5.createElement(ErrorBoundary, { fallback: null }, /* @__PURE__ */ React5.createElement(Component, { ...props }));
  };
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
import * as React8 from "react";
import { imageSrcPropTypeUtil } from "@elementor/editor-props";
import { UploadIcon } from "@elementor/icons";
import { Button, Card, CardMedia, CardOverlay, CircularProgress, Stack } from "@elementor/ui";
import { useWpMediaAttachment, useWpMediaFrame } from "@elementor/wp-media";
import { __ } from "@wordpress/i18n";

// src/control-actions/control-actions.tsx
import * as React7 from "react";
import { styled, UnstableFloatingActionBar } from "@elementor/ui";

// src/control-actions/control-actions-context.tsx
import * as React6 from "react";
import { createContext as createContext4, useContext as useContext4 } from "react";
var Context = createContext4(null);
var ControlActionsProvider = ({ children, items }) => /* @__PURE__ */ React6.createElement(Context.Provider, { value: { items } }, children);
var useControlActions = () => {
  const context = useContext4(Context);
  if (!context) {
    throw new Error("useControlActions must be used within a ControlActionsProvider");
  }
  return context;
};

// src/control-actions/control-actions.tsx
var FloatingBarContainer = styled("span")`
	display: contents;

	.MuiFloatingActionBar-popper:has( .MuiFloatingActionBar-actions:empty ) {
		display: none;
	}

	.MuiFloatingActionBar-popper {
		z-index: 1000;
	}
`;
function ControlActions({ children }) {
  const { items } = useControlActions();
  const { disabled } = useBoundProp();
  if (items.length === 0 || disabled) {
    return children;
  }
  const menuItems = items.map(({ MenuItem: MenuItem2, id }) => /* @__PURE__ */ React7.createElement(MenuItem2, { key: id }));
  return /* @__PURE__ */ React7.createElement(FloatingBarContainer, null, /* @__PURE__ */ React7.createElement(UnstableFloatingActionBar, { actions: menuItems }, children));
}

// src/controls/image-media-control.tsx
var ImageMediaControl = createControl(({ mediaTypes = ["image"] }) => {
  const { value, setValue } = useBoundProp(imageSrcPropTypeUtil);
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
  return /* @__PURE__ */ React8.createElement(ControlActions, null, /* @__PURE__ */ React8.createElement(Card, { variant: "outlined" }, /* @__PURE__ */ React8.createElement(CardMedia, { image: src, sx: { height: 150 } }, isFetching ? /* @__PURE__ */ React8.createElement(Stack, { justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }, /* @__PURE__ */ React8.createElement(CircularProgress, null)) : /* @__PURE__ */ React8.createElement(React8.Fragment, null)), /* @__PURE__ */ React8.createElement(CardOverlay, null, /* @__PURE__ */ React8.createElement(Stack, { gap: 1 }, /* @__PURE__ */ React8.createElement(
    Button,
    {
      size: "tiny",
      color: "inherit",
      variant: "outlined",
      onClick: () => open({ mode: "browse" })
    },
    __("Select image", "elementor")
  ), /* @__PURE__ */ React8.createElement(
    Button,
    {
      size: "tiny",
      variant: "text",
      color: "inherit",
      startIcon: /* @__PURE__ */ React8.createElement(UploadIcon, null),
      onClick: () => open({ mode: "upload" })
    },
    __("Upload", "elementor")
  )))));
});

// src/controls/select-control.tsx
import * as React9 from "react";
import { stringPropTypeUtil } from "@elementor/editor-props";
import { MenuListItem } from "@elementor/editor-ui";
import { Select } from "@elementor/ui";
var SelectControl = createControl(({ options, onChange }) => {
  const { value, setValue, disabled } = useBoundProp(stringPropTypeUtil);
  const handleChange = (event) => {
    const newValue = event.target.value || null;
    onChange?.(newValue, value);
    setValue(newValue);
  };
  return /* @__PURE__ */ React9.createElement(ControlActions, null, /* @__PURE__ */ React9.createElement(
    Select,
    {
      sx: { overflow: "hidden" },
      displayEmpty: true,
      size: "tiny",
      value: value ?? "",
      onChange: handleChange,
      disabled,
      fullWidth: true
    },
    options.map(({ label, ...props }) => /* @__PURE__ */ React9.createElement(MenuListItem, { key: props.value, ...props, value: props.value ?? "" }, label))
  ));
});

// src/controls/image-control.tsx
var ImageControl = createControl(
  ({ sizes, resolutionLabel = __2("Image resolution", "elementor"), showMode = "all" }) => {
    const propContext = useBoundProp(imagePropTypeUtil);
    const { data: allowSvgUpload } = useUnfilteredFilesUpload();
    const mediaTypes = allowSvgUpload ? ["image", "svg"] : ["image"];
    return /* @__PURE__ */ React10.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React10.createElement(Stack2, { gap: 1.5 }, ["all", "media"].includes(showMode) ? /* @__PURE__ */ React10.createElement(PropKeyProvider, { bind: "src" }, /* @__PURE__ */ React10.createElement(ControlFormLabel, null, __2("Image", "elementor")), /* @__PURE__ */ React10.createElement(ImageMediaControl, { mediaTypes })) : null, ["all", "sizes"].includes(showMode) ? /* @__PURE__ */ React10.createElement(PropKeyProvider, { bind: "size" }, /* @__PURE__ */ React10.createElement(Grid, { container: true, gap: 1.5, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React10.createElement(Grid, { item: true, xs: 6 }, /* @__PURE__ */ React10.createElement(ControlFormLabel, null, resolutionLabel)), /* @__PURE__ */ React10.createElement(Grid, { item: true, xs: 6, sx: { overflow: "hidden" } }, /* @__PURE__ */ React10.createElement(SelectControl, { options: sizes })))) : null));
  }
);

// src/controls/text-control.tsx
import * as React11 from "react";
import { stringPropTypeUtil as stringPropTypeUtil2 } from "@elementor/editor-props";
import { TextField } from "@elementor/ui";
var TextControl = createControl(({ placeholder }) => {
  const { value, setValue, disabled } = useBoundProp(stringPropTypeUtil2);
  const handleChange = (event) => setValue(event.target.value);
  return /* @__PURE__ */ React11.createElement(ControlActions, null, /* @__PURE__ */ React11.createElement(
    TextField,
    {
      size: "tiny",
      fullWidth: true,
      disabled,
      value: value ?? "",
      onChange: handleChange,
      placeholder
    }
  ));
});

// src/controls/text-area-control.tsx
import * as React12 from "react";
import { stringPropTypeUtil as stringPropTypeUtil3 } from "@elementor/editor-props";
import { TextField as TextField2 } from "@elementor/ui";
var TextAreaControl = createControl(({ placeholder }) => {
  const { value, setValue, disabled } = useBoundProp(stringPropTypeUtil3);
  const handleChange = (event) => {
    setValue(event.target.value);
  };
  return /* @__PURE__ */ React12.createElement(ControlActions, null, /* @__PURE__ */ React12.createElement(
    TextField2,
    {
      size: "tiny",
      multiline: true,
      fullWidth: true,
      minRows: 5,
      disabled,
      value: value ?? "",
      onChange: handleChange,
      placeholder
    }
  ));
});

// src/controls/size-control.tsx
import * as React16 from "react";
import { useEffect as useEffect2, useState as useState3 } from "react";
import { sizePropTypeUtil } from "@elementor/editor-props";
import { useActiveBreakpoint } from "@elementor/editor-responsive";
import { usePopupState as usePopupState2 } from "@elementor/ui";

// src/components/size-control/size-input.tsx
import * as React14 from "react";
import { useRef } from "react";
import { PencilIcon } from "@elementor/icons";
import { Box, InputAdornment as InputAdornment2 } from "@elementor/ui";

// src/utils/size-control.ts
var defaultUnits = ["px", "%", "em", "rem", "vw", "vh"];
var defaultExtendedOptions = ["auto", "custom"];
function isUnitExtendedOption(unit) {
  return defaultExtendedOptions.includes(unit);
}

// src/components/size-control/text-field-inner-selection.tsx
import * as React13 from "react";
import { forwardRef, useId } from "react";
import { MenuListItem as MenuListItem2 } from "@elementor/editor-ui";
import {
  bindMenu,
  bindTrigger,
  Button as Button2,
  InputAdornment,
  Menu,
  TextField as TextField3,
  usePopupState
} from "@elementor/ui";
var TextFieldInnerSelection = forwardRef(
  ({
    placeholder,
    type,
    value,
    onChange,
    onBlur,
    onKeyDown,
    onKeyUp,
    shouldBlockInput = false,
    inputProps,
    disabled
  }, ref) => {
    return /* @__PURE__ */ React13.createElement(
      TextField3,
      {
        ref,
        sx: { input: { cursor: shouldBlockInput ? "default !important" : void 0 } },
        size: "tiny",
        fullWidth: true,
        type: shouldBlockInput ? void 0 : type,
        value,
        onChange: shouldBlockInput ? void 0 : onChange,
        onKeyDown: shouldBlockInput ? void 0 : onKeyDown,
        onKeyUp: shouldBlockInput ? void 0 : onKeyUp,
        disabled,
        onBlur,
        placeholder,
        InputProps: inputProps
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
  return /* @__PURE__ */ React13.createElement(InputAdornment, { position: "end" }, /* @__PURE__ */ React13.createElement(
    Button2,
    {
      size: "small",
      color: "secondary",
      disabled,
      sx: { font: "inherit", minWidth: "initial", textTransform: "uppercase" },
      ...bindTrigger(popupState)
    },
    alternativeOptionLabels[value] ?? value
  ), /* @__PURE__ */ React13.createElement(Menu, { MenuListProps: { dense: true }, ...bindMenu(popupState) }, options.map((option, index) => /* @__PURE__ */ React13.createElement(
    MenuListItem2,
    {
      key: option,
      onClick: () => handleMenuItemClick(index),
      ...menuItemsAttributes?.[option]
    },
    alternativeOptionLabels[option] ?? option.toUpperCase()
  ))));
};

// src/components/size-control/size-input.tsx
var RESTRICTED_INPUT_KEYS = ["e", "E", "+", "-"];
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
  disabled
}) => {
  const unitInputBufferRef = useRef("");
  const inputType = isUnitExtendedOption(unit) ? "text" : "number";
  const inputValue = !isUnitExtendedOption(unit) && Number.isNaN(size) ? "" : size ?? "";
  const handleKeyUp = (event) => {
    const { key } = event;
    if (!/^[a-zA-Z%]$/.test(key)) {
      return;
    }
    event.preventDefault();
    const newChar = key.toLowerCase();
    const updatedBuffer = (unitInputBufferRef.current + newChar).slice(-3);
    unitInputBufferRef.current = updatedBuffer;
    const matchedUnit = units2.find((u) => u.includes(updatedBuffer)) || units2.find((u) => u.startsWith(newChar)) || units2.find((u) => u.includes(newChar));
    if (matchedUnit) {
      handleUnitChange(matchedUnit);
    }
  };
  const popupAttributes = {
    "aria-controls": popupState.isOpen ? popupState.popupId : void 0,
    "aria-haspopup": true
  };
  const inputProps = {
    ...popupAttributes,
    autoComplete: "off",
    onClick,
    onFocus,
    startAdornment: startIcon ? /* @__PURE__ */ React14.createElement(InputAdornment2, { position: "start", disabled }, startIcon) : void 0,
    endAdornment: /* @__PURE__ */ React14.createElement(
      SelectionEndAdornment,
      {
        disabled,
        options: units2,
        onClick: handleUnitChange,
        value: unit,
        alternativeOptionLabels: {
          custom: /* @__PURE__ */ React14.createElement(PencilIcon, { fontSize: "small" })
        },
        menuItemsAttributes: units2.includes("custom") ? {
          custom: popupAttributes
        } : void 0
      }
    )
  };
  return /* @__PURE__ */ React14.createElement(ControlActions, null, /* @__PURE__ */ React14.createElement(Box, null, /* @__PURE__ */ React14.createElement(
    TextFieldInnerSelection,
    {
      disabled,
      placeholder,
      type: inputType,
      value: inputValue,
      onChange: handleSizeChange,
      onKeyDown: (event) => {
        if (RESTRICTED_INPUT_KEYS.includes(event.key)) {
          event.preventDefault();
        }
      },
      onKeyUp: handleKeyUp,
      onBlur,
      shouldBlockInput: isUnitExtendedOption(unit),
      inputProps
    }
  )));
};

// src/components/text-field-popover.tsx
import * as React15 from "react";
import { bindPopover, Paper, Popover, TextField as TextField4 } from "@elementor/ui";
var TextFieldPopover = (props) => {
  const { popupState, restoreValue, anchorRef, value, onChange } = props;
  return /* @__PURE__ */ React15.createElement(
    Popover,
    {
      disablePortal: true,
      ...bindPopover(popupState),
      anchorOrigin: { vertical: "bottom", horizontal: "center" },
      transformOrigin: { vertical: "top", horizontal: "center" },
      onClose: () => {
        restoreValue();
        popupState.close();
      }
    },
    /* @__PURE__ */ React15.createElement(
      Paper,
      {
        sx: {
          width: anchorRef.current?.offsetWidth + "px",
          borderRadius: 2,
          p: 1.5
        }
      },
      /* @__PURE__ */ React15.createElement(
        TextField4,
        {
          value,
          onChange,
          size: "tiny",
          type: "text",
          fullWidth: true,
          inputProps: {
            autoFocus: true
          }
        }
      )
    )
  );
};

// src/hooks/use-size-extended-options.ts
import { useMemo } from "react";
import { isExperimentActive } from "@elementor/editor-v1-adapters";
var EXPERIMENT_ID = "e_v_3_30";
function useSizeExtendedOptions(options, disableCustom) {
  return useMemo(() => {
    const isVersion330Active = isExperimentActive(EXPERIMENT_ID);
    const shouldDisableCustom = !isVersion330Active || disableCustom;
    const extendedOptions = [...options];
    if (!shouldDisableCustom && !extendedOptions.includes("custom")) {
      extendedOptions.push("custom");
    } else if (options.includes("custom")) {
      extendedOptions.splice(extendedOptions.indexOf("custom"), 1);
    }
    return extendedOptions;
  }, [options, disableCustom]);
}

// src/hooks/use-sync-external-state.tsx
import { useEffect, useState as useState2 } from "react";
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
  const [internal, setInternal] = useState2(toInternal(external, null));
  useEffect(() => {
    setInternal((prevInternal) => toInternal(external, prevInternal));
  }, [external]);
  const setInternalValue = (setter) => {
    const setterFn = typeof setter === "function" ? setter : () => setter;
    const updated = setterFn(internal);
    setInternal(updated);
    setExternal(toExternal(updated));
  };
  return [internal, setInternalValue];
};

// src/controls/size-control.tsx
var DEFAULT_UNIT = "px";
var DEFAULT_SIZE = NaN;
var SizeControl = createControl((props) => {
  const defaultUnit = props.defaultUnit ?? DEFAULT_UNIT;
  const { units: units2 = [...defaultUnits], placeholder, startIcon, anchorRef } = props;
  const { value: sizeValue, setValue: setSizeValue, disabled, restoreValue } = useBoundProp(sizePropTypeUtil);
  const [internalState, setInternalState] = useState3(createStateFromSizeProp(sizeValue, defaultUnit));
  const activeBreakpoint = useActiveBreakpoint();
  const extendedOptions = useSizeExtendedOptions(props.extendedOptions || [], props.disableCustom ?? false);
  const popupState = usePopupState2({ variant: "popover" });
  const [state, setState] = useSyncExternalState({
    external: internalState,
    setExternal: (newState) => setSizeValue(extractValueFromState(newState)),
    persistWhen: (newState) => {
      if (!newState?.unit) {
        return false;
      }
      if (isUnitExtendedOption(newState.unit)) {
        return newState.unit === "auto" ? true : !!newState.custom;
      }
      return !!newState?.numeric || newState?.numeric === 0;
    },
    fallback: (newState) => ({
      unit: newState?.unit ?? props.defaultUnit ?? DEFAULT_UNIT,
      numeric: newState?.numeric ?? DEFAULT_SIZE,
      custom: newState?.custom ?? ""
    })
  });
  const { size: controlSize = DEFAULT_SIZE, unit: controlUnit = DEFAULT_UNIT } = extractValueFromState(state) || {};
  const handleUnitChange = (newUnit) => {
    if (newUnit === "custom") {
      popupState.open(anchorRef?.current);
    }
    setState((prev) => ({ ...prev, unit: newUnit }));
  };
  const handleSizeChange = (event) => {
    const { value: size } = event.target;
    if (controlUnit === "auto") {
      setState((prev) => ({ ...prev, unit: controlUnit }));
      return;
    }
    setState((prev) => ({
      ...prev,
      [controlUnit === "custom" ? "custom" : "numeric"]: formatSize(size, controlUnit),
      unit: controlUnit
    }));
  };
  const onInputFocus = (event) => {
    if (isUnitExtendedOption(state.unit)) {
      event.target?.blur();
    }
  };
  const onInputClick = (event) => {
    if (event.target.closest("input") && "custom" === state.unit) {
      popupState.open(anchorRef?.current);
    }
  };
  useEffect2(() => {
    const newState = createStateFromSizeProp(sizeValue, defaultUnit);
    const currentUnit = isUnitExtendedOption(state.unit) ? "custom" : "numeric";
    const mergedStates = { ...state, [currentUnit]: newState[currentUnit] };
    if (mergedStates.unit !== "auto" && areStatesEqual(state, mergedStates)) {
      return;
    }
    if (state.unit === newState.unit) {
      setInternalState(mergedStates);
      return;
    }
    setState(newState);
  }, [sizeValue]);
  useEffect2(() => {
    const newState = createStateFromSizeProp(sizeValue, defaultUnit);
    if (activeBreakpoint && !areStatesEqual(newState, state)) {
      setState(newState);
    }
  }, [activeBreakpoint]);
  return /* @__PURE__ */ React16.createElement(React16.Fragment, null, /* @__PURE__ */ React16.createElement(
    SizeInput,
    {
      disabled,
      size: controlSize,
      unit: controlUnit,
      units: [...units2, ...extendedOptions || []],
      placeholder,
      startIcon,
      handleSizeChange,
      handleUnitChange,
      onBlur: restoreValue,
      onFocus: onInputFocus,
      onClick: onInputClick,
      popupState
    }
  ), anchorRef?.current && /* @__PURE__ */ React16.createElement(
    TextFieldPopover,
    {
      popupState,
      anchorRef,
      restoreValue,
      value: controlSize,
      onChange: handleSizeChange
    }
  ));
});
function formatSize(size, unit) {
  if (isUnitExtendedOption(unit)) {
    return unit === "auto" ? "" : String(size ?? "");
  }
  return size || size === 0 ? Number(size) : NaN;
}
function createStateFromSizeProp(sizeValue, defaultUnit) {
  const unit = sizeValue?.unit ?? defaultUnit;
  const size = sizeValue?.size ?? "";
  return {
    numeric: !isUnitExtendedOption(unit) && !isNaN(Number(size)) && (size || size === 0) ? Number(size) : DEFAULT_SIZE,
    custom: unit === "custom" ? String(size) : "",
    unit
  };
}
function extractValueFromState(state) {
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
  return {
    size: state[unit === "custom" ? "custom" : "numeric"],
    unit
  };
}
function areStatesEqual(state1, state2) {
  if (state1.unit !== state2.unit || state1.custom !== state2.custom) {
    return false;
  }
  if (isUnitExtendedOption(state1.unit)) {
    return state1.custom === state2.custom;
  }
  return state1.numeric === state2.numeric || isNaN(state1.numeric) && isNaN(state2.numeric);
}

// src/controls/stroke-control.tsx
import * as React19 from "react";
import { forwardRef as forwardRef2, useRef as useRef2 } from "react";
import { strokePropTypeUtil } from "@elementor/editor-props";
import { Grid as Grid2 } from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";

// src/components/section-content.tsx
import * as React17 from "react";
import { Stack as Stack3 } from "@elementor/ui";
var SectionContent = ({ gap = 2, sx, children }) => /* @__PURE__ */ React17.createElement(Stack3, { gap, sx: { ...sx } }, children);

// src/controls/color-control.tsx
import * as React18 from "react";
import { colorPropTypeUtil } from "@elementor/editor-props";
import { UnstableColorField } from "@elementor/ui";
var ColorControl = createControl(
  ({ propTypeUtil = colorPropTypeUtil, anchorEl, slotProps = {}, ...props }) => {
    const { value, setValue, disabled } = useBoundProp(propTypeUtil);
    const handleChange = (selectedColor) => {
      setValue(selectedColor || null);
    };
    return /* @__PURE__ */ React18.createElement(ControlActions, null, /* @__PURE__ */ React18.createElement(
      UnstableColorField,
      {
        size: "tiny",
        fullWidth: true,
        value: value ?? "",
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
  const rowRef = useRef2(null);
  return /* @__PURE__ */ React19.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React19.createElement(SectionContent, null, /* @__PURE__ */ React19.createElement(Control, { bind: "width", label: __3("Stroke width", "elementor"), ref: rowRef }, /* @__PURE__ */ React19.createElement(SizeControl, { units, anchorRef: rowRef })), /* @__PURE__ */ React19.createElement(Control, { bind: "color", label: __3("Stroke color", "elementor") }, /* @__PURE__ */ React19.createElement(ColorControl, null))));
});
var Control = forwardRef2(({ bind, label, children }, ref) => /* @__PURE__ */ React19.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React19.createElement(Grid2, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap", ref }, /* @__PURE__ */ React19.createElement(Grid2, { item: true, xs: 6 }, /* @__PURE__ */ React19.createElement(ControlFormLabel, null, label)), /* @__PURE__ */ React19.createElement(Grid2, { item: true, xs: 6 }, children))));

// src/controls/box-shadow-repeater-control.tsx
import * as React26 from "react";
import { useRef as useRef3 } from "react";
import { boxShadowPropTypeUtil, shadowPropTypeUtil } from "@elementor/editor-props";
import { FormLabel as FormLabel2, Grid as Grid4, UnstableColorIndicator } from "@elementor/ui";
import { __ as __5 } from "@wordpress/i18n";

// src/components/popover-content.tsx
import * as React20 from "react";
import { Stack as Stack4 } from "@elementor/ui";
var PopoverContent = ({ gap = 1.5, children, ...props }) => /* @__PURE__ */ React20.createElement(Stack4, { ...props, gap }, children);

// src/components/popover-grid-container.tsx
import { forwardRef as forwardRef3 } from "react";
import * as React21 from "react";
import { Grid as Grid3 } from "@elementor/ui";
var PopoverGridContainer = forwardRef3(
  ({ gap = 1.5, alignItems = "center", flexWrap = "nowrap", children }, ref) => /* @__PURE__ */ React21.createElement(Grid3, { container: true, gap, alignItems, flexWrap, ref }, children)
);

// src/components/repeater.tsx
import * as React25 from "react";
import { useEffect as useEffect3, useState as useState4 } from "react";
import { CopyIcon, EyeIcon, EyeOffIcon, PlusIcon, XIcon } from "@elementor/icons";
import {
  bindPopover as bindPopover2,
  bindTrigger as bindTrigger2,
  Box as Box2,
  IconButton,
  Popover as Popover2,
  Stack as Stack5,
  Tooltip,
  Typography,
  UnstableTag,
  usePopupState as usePopupState3
} from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";

// src/control-adornments/control-adornments.tsx
import * as React23 from "react";

// src/control-adornments/control-adornments-context.tsx
import * as React22 from "react";
import { createContext as createContext5, useContext as useContext5 } from "react";
var Context2 = createContext5(null);
var ControlAdornmentsProvider = ({ children, items }) => /* @__PURE__ */ React22.createElement(Context2.Provider, { value: { items } }, children);
var useControlAdornments = () => {
  const context = useContext5(Context2);
  return context?.items ?? [];
};

// src/control-adornments/control-adornments.tsx
function ControlAdornments() {
  const items = useControlAdornments();
  if (items?.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React23.createElement(React23.Fragment, null, items.map(({ Adornment, id }) => /* @__PURE__ */ React23.createElement(Adornment, { key: id })));
}

// src/locations.ts
import { createReplaceableLocation } from "@elementor/locations";
var { Slot: RepeaterItemIconSlot, inject: injectIntoRepeaterItemIcon } = createReplaceableLocation();
var { Slot: RepeaterItemLabelSlot, inject: injectIntoRepeaterItemLabel } = createReplaceableLocation();

// src/components/sortable.tsx
import * as React24 from "react";
import { GripVerticalIcon } from "@elementor/icons";
import {
  Divider,
  List,
  ListItem,
  styled as styled2,
  UnstableSortableItem,
  UnstableSortableProvider
} from "@elementor/ui";
var SortableProvider = (props) => {
  return /* @__PURE__ */ React24.createElement(List, { sx: { p: 0, my: -0.5, mx: 0 } }, /* @__PURE__ */ React24.createElement(UnstableSortableProvider, { restrictAxis: true, disableDragOverlay: false, variant: "static", ...props }));
};
var SortableItem = ({ id, children, disabled }) => {
  return /* @__PURE__ */ React24.createElement(
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
        return /* @__PURE__ */ React24.createElement(StyledListItem, { ...itemProps, style: itemStyle }, !disabled && /* @__PURE__ */ React24.createElement(SortableTrigger, { ...triggerProps, style: triggerStyle }), children, showDropIndication && /* @__PURE__ */ React24.createElement(StyledDivider, { style: dropIndicationStyle }));
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

	&:hover {
		& .class-item-sortable-trigger {
			visibility: visible;
		}
	}
`;
var SortableTrigger = (props) => /* @__PURE__ */ React24.createElement("div", { ...props, role: "button", className: "class-item-sortable-trigger" }, /* @__PURE__ */ React24.createElement(GripVerticalIcon, { fontSize: "tiny" }));
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

// src/components/repeater.tsx
var SIZE = "tiny";
var EMPTY_OPEN_ITEM = -1;
var Repeater = ({
  label,
  itemSettings,
  disabled = false,
  openOnAdd = false,
  addToBottom = false,
  values: repeaterValues = [],
  setValues: setRepeaterValues,
  showDuplicate = true,
  showToggle = true,
  isSortable = true
}) => {
  const [openItem, setOpenItem] = useState4(EMPTY_OPEN_ITEM);
  const [items, setItems] = useSyncExternalState({
    external: repeaterValues,
    // @ts-expect-error - as long as persistWhen => true, value will never be null
    setExternal: setRepeaterValues,
    persistWhen: () => true
  });
  const [uniqueKeys, setUniqueKeys] = useState4(items.map((_, index) => index));
  const generateNextKey = (source) => {
    return 1 + Math.max(0, ...source);
  };
  const addRepeaterItem = () => {
    const newItem = structuredClone(itemSettings.initialValues);
    const newKey = generateNextKey(uniqueKeys);
    if (addToBottom) {
      setItems([...items, newItem]);
      setUniqueKeys([...uniqueKeys, newKey]);
    } else {
      setItems([newItem, ...items]);
      setUniqueKeys([newKey, ...uniqueKeys]);
    }
    if (openOnAdd) {
      setOpenItem(newKey);
    }
  };
  const duplicateRepeaterItem = (index) => {
    const newItem = structuredClone(items[index]);
    const newKey = generateNextKey(uniqueKeys);
    const atPosition = 1 + index;
    setItems([...items.slice(0, atPosition), newItem, ...items.slice(atPosition)]);
    setUniqueKeys([...uniqueKeys.slice(0, atPosition), newKey, ...uniqueKeys.slice(atPosition)]);
  };
  const removeRepeaterItem = (index) => {
    setUniqueKeys(
      uniqueKeys.filter((_, pos) => {
        return pos !== index;
      })
    );
    setItems(
      items.filter((_, pos) => {
        return pos !== index;
      })
    );
  };
  const toggleDisableRepeaterItem = (index) => {
    setItems(
      items.map((value, pos) => {
        if (pos === index) {
          const { disabled: propDisabled, ...rest } = value;
          return { ...rest, ...propDisabled ? {} : { disabled: true } };
        }
        return value;
      })
    );
  };
  const onChangeOrder = (reorderedKeys) => {
    setUniqueKeys(reorderedKeys);
    setItems((prevItems) => {
      return reorderedKeys.map((keyValue) => {
        const index = uniqueKeys.indexOf(keyValue);
        return prevItems[index];
      });
    });
  };
  return /* @__PURE__ */ React25.createElement(SectionContent, null, /* @__PURE__ */ React25.createElement(
    Stack5,
    {
      direction: "row",
      justifyContent: "start",
      alignItems: "center",
      gap: 1,
      sx: { marginInlineEnd: -0.75 }
    },
    /* @__PURE__ */ React25.createElement(Typography, { component: "label", variant: "caption", color: "text.secondary" }, label),
    /* @__PURE__ */ React25.createElement(ControlAdornments, null),
    /* @__PURE__ */ React25.createElement(
      IconButton,
      {
        size: SIZE,
        sx: { ml: "auto" },
        disabled,
        onClick: addRepeaterItem,
        "aria-label": __4("Add item", "elementor")
      },
      /* @__PURE__ */ React25.createElement(PlusIcon, { fontSize: SIZE })
    )
  ), 0 < uniqueKeys.length && /* @__PURE__ */ React25.createElement(SortableProvider, { value: uniqueKeys, onChange: onChangeOrder }, uniqueKeys.map((key, index) => {
    const value = items[index];
    if (!value) {
      return null;
    }
    return /* @__PURE__ */ React25.createElement(SortableItem, { id: key, key: `sortable-${key}`, disabled: !isSortable }, /* @__PURE__ */ React25.createElement(
      RepeaterItem,
      {
        disabled,
        propDisabled: value?.disabled,
        label: /* @__PURE__ */ React25.createElement(RepeaterItemLabelSlot, { value }, /* @__PURE__ */ React25.createElement(itemSettings.Label, { value })),
        startIcon: /* @__PURE__ */ React25.createElement(RepeaterItemIconSlot, { value }, /* @__PURE__ */ React25.createElement(itemSettings.Icon, { value })),
        removeItem: () => removeRepeaterItem(index),
        duplicateItem: () => duplicateRepeaterItem(index),
        toggleDisableItem: () => toggleDisableRepeaterItem(index),
        openOnMount: openOnAdd && openItem === key,
        onOpen: () => setOpenItem(EMPTY_OPEN_ITEM),
        showDuplicate,
        showToggle
      },
      (props) => /* @__PURE__ */ React25.createElement(itemSettings.Content, { ...props, value, bind: String(index) })
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
  disabled
}) => {
  const [anchorEl, setAnchorEl] = useState4(null);
  const { popoverState, popoverProps, ref, setRef } = usePopover(openOnMount, onOpen);
  const duplicateLabel = __4("Duplicate", "elementor");
  const toggleLabel = propDisabled ? __4("Show", "elementor") : __4("Hide", "elementor");
  const removeLabel = __4("Remove", "elementor");
  return /* @__PURE__ */ React25.createElement(React25.Fragment, null, /* @__PURE__ */ React25.createElement(
    UnstableTag,
    {
      disabled,
      label,
      showActionsOnHover: true,
      fullWidth: true,
      ref: setRef,
      variant: "outlined",
      "aria-label": __4("Open item", "elementor"),
      ...bindTrigger2(popoverState),
      startIcon,
      actions: /* @__PURE__ */ React25.createElement(React25.Fragment, null, showDuplicate && /* @__PURE__ */ React25.createElement(Tooltip, { title: duplicateLabel, placement: "top" }, /* @__PURE__ */ React25.createElement(IconButton, { size: SIZE, onClick: duplicateItem, "aria-label": duplicateLabel }, /* @__PURE__ */ React25.createElement(CopyIcon, { fontSize: SIZE }))), showToggle && /* @__PURE__ */ React25.createElement(Tooltip, { title: toggleLabel, placement: "top" }, /* @__PURE__ */ React25.createElement(IconButton, { size: SIZE, onClick: toggleDisableItem, "aria-label": toggleLabel }, propDisabled ? /* @__PURE__ */ React25.createElement(EyeOffIcon, { fontSize: SIZE }) : /* @__PURE__ */ React25.createElement(EyeIcon, { fontSize: SIZE }))), /* @__PURE__ */ React25.createElement(Tooltip, { title: removeLabel, placement: "top" }, /* @__PURE__ */ React25.createElement(IconButton, { size: SIZE, onClick: removeItem, "aria-label": removeLabel }, /* @__PURE__ */ React25.createElement(XIcon, { fontSize: SIZE }))))
    }
  ), /* @__PURE__ */ React25.createElement(
    Popover2,
    {
      disablePortal: true,
      slotProps: {
        paper: {
          ref: setAnchorEl,
          sx: { mt: 0.5, width: ref?.getBoundingClientRect().width }
        }
      },
      anchorOrigin: { vertical: "bottom", horizontal: "left" },
      ...popoverProps,
      anchorEl: ref
    },
    /* @__PURE__ */ React25.createElement(Box2, null, children({ anchorEl }))
  ));
};
var usePopover = (openOnMount, onOpen) => {
  const [ref, setRef] = useState4(null);
  const popoverState = usePopupState3({ variant: "popover" });
  const popoverProps = bindPopover2(popoverState);
  useEffect3(() => {
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

// src/controls/box-shadow-repeater-control.tsx
var BoxShadowRepeaterControl = createControl(() => {
  const { propType, value, setValue, disabled } = useBoundProp(boxShadowPropTypeUtil);
  return /* @__PURE__ */ React26.createElement(PropProvider, { propType, value, setValue, disabled }, /* @__PURE__ */ React26.createElement(
    Repeater,
    {
      openOnAdd: true,
      disabled,
      values: value ?? [],
      setValues: setValue,
      label: __5("Box shadow", "elementor"),
      itemSettings: {
        Icon: ItemIcon,
        Label: ItemLabel,
        Content: ItemContent,
        initialValues: initialShadow
      }
    }
  ));
});
var ItemIcon = ({ value }) => /* @__PURE__ */ React26.createElement(UnstableColorIndicator, { size: "inherit", component: "span", value: value.value.color?.value });
var ItemContent = ({ anchorEl, bind }) => {
  return /* @__PURE__ */ React26.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React26.createElement(Content, { anchorEl }));
};
var Content = ({ anchorEl }) => {
  const context = useBoundProp(shadowPropTypeUtil);
  const rowRef = [useRef3(null), useRef3(null)];
  return /* @__PURE__ */ React26.createElement(PropProvider, { ...context }, /* @__PURE__ */ React26.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React26.createElement(PopoverGridContainer, null, /* @__PURE__ */ React26.createElement(Control2, { bind: "color", label: __5("Color", "elementor") }, /* @__PURE__ */ React26.createElement(ColorControl, { anchorEl })), /* @__PURE__ */ React26.createElement(Control2, { bind: "position", label: __5("Position", "elementor"), sx: { overflow: "hidden" } }, /* @__PURE__ */ React26.createElement(
    SelectControl,
    {
      options: [
        { label: __5("Inset", "elementor"), value: "inset" },
        { label: __5("Outset", "elementor"), value: null }
      ]
    }
  ))), /* @__PURE__ */ React26.createElement(PopoverGridContainer, { ref: rowRef[0] }, /* @__PURE__ */ React26.createElement(Control2, { bind: "hOffset", label: __5("Horizontal", "elementor") }, /* @__PURE__ */ React26.createElement(SizeControl, { anchorRef: rowRef[0] })), /* @__PURE__ */ React26.createElement(Control2, { bind: "vOffset", label: __5("Vertical", "elementor") }, /* @__PURE__ */ React26.createElement(SizeControl, { anchorRef: rowRef[0] }))), /* @__PURE__ */ React26.createElement(PopoverGridContainer, { ref: rowRef[1] }, /* @__PURE__ */ React26.createElement(Control2, { bind: "blur", label: __5("Blur", "elementor") }, /* @__PURE__ */ React26.createElement(SizeControl, { anchorRef: rowRef[1] })), /* @__PURE__ */ React26.createElement(Control2, { bind: "spread", label: __5("Spread", "elementor") }, /* @__PURE__ */ React26.createElement(SizeControl, { anchorRef: rowRef[1] })))));
};
var Control2 = ({
  label,
  bind,
  children,
  sx
}) => /* @__PURE__ */ React26.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React26.createElement(Grid4, { item: true, xs: 6, sx }, /* @__PURE__ */ React26.createElement(Grid4, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React26.createElement(Grid4, { item: true, xs: 12 }, /* @__PURE__ */ React26.createElement(FormLabel2, { size: "tiny" }, label)), /* @__PURE__ */ React26.createElement(Grid4, { item: true, xs: 12 }, children))));
var ItemLabel = ({ value }) => {
  const { position, hOffset, vOffset, blur, spread } = value.value;
  const { size: blurSize = "", unit: blurUnit = "" } = blur?.value || {};
  const { size: spreadSize = "", unit: spreadUnit = "" } = spread?.value || {};
  const { size: hOffsetSize = "unset", unit: hOffsetUnit = "" } = hOffset?.value || {};
  const { size: vOffsetSize = "unset", unit: vOffsetUnit = "" } = vOffset?.value || {};
  const positionLabel = position?.value || "outset";
  const sizes = [
    hOffsetSize + hOffsetUnit,
    vOffsetSize + vOffsetUnit,
    blurSize + blurUnit,
    spreadSize + spreadUnit
  ].join(" ");
  return /* @__PURE__ */ React26.createElement("span", { style: { textTransform: "capitalize" } }, positionLabel, ": ", sizes);
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

// src/controls/filter-repeater-control.tsx
import * as React28 from "react";
import { useRef as useRef4 } from "react";
import {
  blurFilterPropTypeUtil,
  brightnessFilterPropTypeUtil,
  filterPropTypeUtil
} from "@elementor/editor-props";
import { MenuListItem as MenuListItem3 } from "@elementor/editor-ui";
import { Box as Box3, Grid as Grid5, Select as Select2 } from "@elementor/ui";
import { __ as __6 } from "@wordpress/i18n";

// src/components/control-label.tsx
import * as React27 from "react";
import { Stack as Stack6 } from "@elementor/ui";
var ControlLabel = ({ children }) => {
  return /* @__PURE__ */ React27.createElement(Stack6, { direction: "row", alignItems: "center", justifyItems: "start", gap: 0.25 }, /* @__PURE__ */ React27.createElement(ControlFormLabel, null, children), /* @__PURE__ */ React27.createElement(ControlAdornments, null));
};

// src/controls/filter-repeater-control.tsx
var DEFAULT_FILTER_KEY = "blur";
var filterConfig = {
  blur: {
    defaultValue: { $$type: "radius", radius: { $$type: "size", value: { size: 0, unit: "px" } } },
    name: __6("Blur", "elementor"),
    valueName: __6("Radius", "elementor"),
    propType: blurFilterPropTypeUtil
  },
  brightness: {
    defaultValue: { $$type: "amount", amount: { $$type: "size", value: { size: 100, unit: "%" } } },
    name: __6("Brightness", "elementor"),
    valueName: __6("Amount", "elementor"),
    propType: brightnessFilterPropTypeUtil,
    units: ["%"]
  }
};
var filterKeys = Object.keys(filterConfig);
var singleSizeFilterNames = filterKeys.filter((name) => {
  const filter = filterConfig[name].defaultValue;
  return filter[filter.$$type].$$type === "size";
});
var FilterRepeaterControl = createControl(() => {
  const { propType, value: filterValues, setValue, disabled } = useBoundProp(filterPropTypeUtil);
  return /* @__PURE__ */ React28.createElement(PropProvider, { propType, value: filterValues, setValue }, /* @__PURE__ */ React28.createElement(
    Repeater,
    {
      openOnAdd: true,
      disabled,
      values: filterValues ?? [],
      setValues: setValue,
      label: __6("Filter", "elementor"),
      itemSettings: {
        Icon: ItemIcon2,
        Label: ItemLabel2,
        Content: ItemContent2,
        initialValues: {
          $$type: DEFAULT_FILTER_KEY,
          value: filterConfig[DEFAULT_FILTER_KEY].defaultValue
        }
      }
    }
  ));
});
var ItemIcon2 = () => /* @__PURE__ */ React28.createElement(React28.Fragment, null);
var ItemLabel2 = (props) => {
  const { $$type } = props.value;
  return singleSizeFilterNames.includes($$type) && /* @__PURE__ */ React28.createElement(SingleSizeItemLabel, { value: props.value });
};
var SingleSizeItemLabel = ({ value }) => {
  const { $$type, value: sizeValue } = value;
  const { $$type: key } = filterConfig[$$type].defaultValue;
  const defaultUnit = filterConfig[$$type].defaultValue[key].value.unit;
  const { unit, size } = sizeValue[key]?.value ?? { unit: defaultUnit, size: 0 };
  const label = /* @__PURE__ */ React28.createElement(Box3, { component: "span", style: { textTransform: "capitalize" } }, value.$$type, ":");
  return /* @__PURE__ */ React28.createElement(Box3, { component: "span" }, label, unit !== "custom" ? ` ${size ?? 0}${unit ?? defaultUnit}` : size);
};
var ItemContent2 = ({ bind }) => {
  const { value: filterValues, setValue } = useBoundProp(filterPropTypeUtil);
  const itemIndex = parseInt(bind, 10);
  const item = filterValues?.[itemIndex];
  const handleChange = (e) => {
    const newFilterValues = [...filterValues];
    const filterType = e.target.value;
    newFilterValues[itemIndex] = {
      $$type: filterType,
      value: filterConfig[filterType].defaultValue
    };
    setValue(newFilterValues);
  };
  return /* @__PURE__ */ React28.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React28.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React28.createElement(PopoverGridContainer, null, /* @__PURE__ */ React28.createElement(Grid5, { item: true, xs: 6 }, /* @__PURE__ */ React28.createElement(ControlLabel, null, __6("Filter", "elementor"))), /* @__PURE__ */ React28.createElement(Grid5, { item: true, xs: 6 }, /* @__PURE__ */ React28.createElement(
    Select2,
    {
      sx: { overflow: "hidden" },
      size: "tiny",
      value: item?.$$type ?? DEFAULT_FILTER_KEY,
      onChange: handleChange,
      fullWidth: true
    },
    filterKeys.map((filterKey) => /* @__PURE__ */ React28.createElement(MenuListItem3, { key: filterKey, value: filterKey }, filterConfig[filterKey].name))
  ))), /* @__PURE__ */ React28.createElement(Content2, { filterType: item?.$$type })));
};
var Content2 = ({ filterType }) => {
  return singleSizeFilterNames.includes(filterType) && /* @__PURE__ */ React28.createElement(SingleSizeItemContent, { filterType });
};
var SingleSizeItemContent = ({ filterType }) => {
  const { propType, valueName, defaultValue, units: units2 } = filterConfig[filterType];
  const { $$type } = defaultValue;
  const context = useBoundProp(propType);
  const rowRef = useRef4(null);
  return /* @__PURE__ */ React28.createElement(PropProvider, { ...context }, /* @__PURE__ */ React28.createElement(PropKeyProvider, { bind: $$type }, /* @__PURE__ */ React28.createElement(PopoverGridContainer, { ref: rowRef }, /* @__PURE__ */ React28.createElement(Grid5, { item: true, xs: 6 }, /* @__PURE__ */ React28.createElement(ControlLabel, null, valueName)), /* @__PURE__ */ React28.createElement(Grid5, { item: true, xs: 6 }, /* @__PURE__ */ React28.createElement(SizeControl, { anchorRef: rowRef, units: units2 })))));
};

// src/controls/toggle-control.tsx
import * as React31 from "react";
import { stringPropTypeUtil as stringPropTypeUtil4 } from "@elementor/editor-props";

// src/components/control-toggle-button-group.tsx
import * as React30 from "react";
import { useEffect as useEffect4, useMemo as useMemo2, useRef as useRef5, useState as useState5 } from "react";
import { ChevronDownIcon } from "@elementor/icons";
import {
  ListItemText,
  Menu as Menu2,
  MenuItem,
  styled as styled3,
  ToggleButton,
  ToggleButtonGroup,
  Typography as Typography2,
  useTheme
} from "@elementor/ui";

// src/components/conditional-tooltip.tsx
import * as React29 from "react";
import { Tooltip as Tooltip2 } from "@elementor/ui";
var ConditionalTooltip = ({
  showTooltip,
  children,
  label
}) => {
  return showTooltip && label ? /* @__PURE__ */ React29.createElement(Tooltip2, { title: label, disableFocusListener: true, placement: "top" }, children) : children;
};

// src/components/control-toggle-button-group.tsx
var StyledToggleButtonGroup = styled3(ToggleButtonGroup)`
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
var ControlToggleButtonGroup = ({
  justify = "end",
  size = "tiny",
  value,
  onChange,
  items,
  maxItems,
  exclusive = false,
  fullWidth = false,
  disabled
}) => {
  const shouldSliceItems = exclusive && maxItems !== void 0 && items.length > maxItems;
  const menuItems = shouldSliceItems ? items.slice(maxItems - 1) : [];
  const fixedItems = shouldSliceItems ? items.slice(0, maxItems - 1) : items;
  const isRtl = "rtl" === useTheme().direction;
  const handleChange = (_, newValue) => {
    onChange(newValue);
  };
  const getGridTemplateColumns = useMemo2(() => {
    const isOffLimits = menuItems?.length;
    const itemsCount = isOffLimits ? fixedItems.length + 1 : fixedItems.length;
    const templateColumnsSuffix = isOffLimits ? "auto" : "";
    return `repeat(${itemsCount}, minmax(0, 25%)) ${templateColumnsSuffix}`;
  }, [menuItems?.length, fixedItems.length]);
  return /* @__PURE__ */ React30.createElement(ControlActions, null, /* @__PURE__ */ React30.createElement(
    StyledToggleButtonGroup,
    {
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
    fixedItems.map(({ label, value: buttonValue, renderContent: Content5, showTooltip }) => /* @__PURE__ */ React30.createElement(
      ConditionalTooltip,
      {
        key: buttonValue,
        label,
        showTooltip: showTooltip || false
      },
      /* @__PURE__ */ React30.createElement(ToggleButton, { value: buttonValue, "aria-label": label, size, fullWidth }, /* @__PURE__ */ React30.createElement(Content5, { size }))
    )),
    menuItems.length && exclusive && /* @__PURE__ */ React30.createElement(
      SplitButtonGroup,
      {
        size,
        value: value || null,
        onChange,
        items: menuItems,
        fullWidth
      }
    )
  ));
};
var SplitButtonGroup = ({
  size = "tiny",
  onChange,
  items,
  fullWidth,
  value
}) => {
  const previewButton = usePreviewButton(items, value);
  const [isMenuOpen, setIsMenuOpen] = useState5(false);
  const menuButtonRef = useRef5(null);
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
  return /* @__PURE__ */ React30.createElement(React30.Fragment, null, /* @__PURE__ */ React30.createElement(
    ToggleButton,
    {
      value: previewButton.value,
      "aria-label": previewButton.label,
      size,
      fullWidth,
      onClick: (ev) => {
        ev.preventDefault();
        onMenuItemClick(previewButton.value);
      },
      ref: menuButtonRef
    },
    previewButton.renderContent({ size })
  ), /* @__PURE__ */ React30.createElement(
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
    /* @__PURE__ */ React30.createElement(ChevronDownIcon, { fontSize: size })
  ), /* @__PURE__ */ React30.createElement(
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
    items.map(({ label, value: buttonValue }) => /* @__PURE__ */ React30.createElement(
      MenuItem,
      {
        key: buttonValue,
        selected: buttonValue === value,
        onClick: () => onMenuItemClick(buttonValue)
      },
      /* @__PURE__ */ React30.createElement(ListItemText, null, /* @__PURE__ */ React30.createElement(Typography2, { sx: { fontSize: "14px" } }, label))
    ))
  ));
};
var usePreviewButton = (items, value) => {
  const [previewButton, setPreviewButton] = useState5(
    items.find((item) => item.value === value) ?? items[0]
  );
  useEffect4(() => {
    const selectedButton = items.find((item) => item.value === value);
    if (selectedButton) {
      setPreviewButton(selectedButton);
    }
  }, [items, value]);
  return previewButton;
};

// src/controls/toggle-control.tsx
var ToggleControl = createControl(
  ({
    options,
    fullWidth = false,
    size = "tiny",
    exclusive = true,
    maxItems
  }) => {
    const { value, setValue, placeholder, disabled } = useBoundProp(stringPropTypeUtil4);
    const exclusiveValues = options.filter((option) => option.exclusive).map((option) => option.value);
    const handleNonExclusiveToggle = (selectedValues) => {
      const newSelectedValue = selectedValues[selectedValues.length - 1];
      const isNewSelectedValueExclusive = exclusiveValues.includes(newSelectedValue);
      const updatedValues = isNewSelectedValueExclusive ? [newSelectedValue] : selectedValues?.filter((val) => !exclusiveValues.includes(val));
      setValue(updatedValues?.join(" ") || null);
    };
    const toggleButtonGroupProps = {
      items: options,
      maxItems,
      fullWidth,
      size
    };
    return exclusive ? /* @__PURE__ */ React31.createElement(
      ControlToggleButtonGroup,
      {
        ...toggleButtonGroupProps,
        value: value ?? placeholder ?? null,
        onChange: setValue,
        disabled,
        exclusive: true
      }
    ) : /* @__PURE__ */ React31.createElement(
      ControlToggleButtonGroup,
      {
        ...toggleButtonGroupProps,
        value: (value ?? placeholder)?.split(" ") ?? [],
        onChange: handleNonExclusiveToggle,
        disabled,
        exclusive: false
      }
    );
  }
);

// src/controls/number-control.tsx
import * as React32 from "react";
import { numberPropTypeUtil } from "@elementor/editor-props";
import { TextField as TextField5 } from "@elementor/ui";
var isEmptyOrNaN = (value) => value === null || value === void 0 || value === "" || Number.isNaN(Number(value));
var RESTRICTED_INPUT_KEYS2 = ["e", "E", "+", "-"];
var NumberControl = createControl(
  ({
    placeholder,
    max = Number.MAX_VALUE,
    min = -Number.MAX_VALUE,
    step = 1,
    shouldForceInt = false
  }) => {
    const { value, setValue, disabled } = useBoundProp(numberPropTypeUtil);
    const handleChange = (event) => {
      const eventValue = event.target.value;
      if (isEmptyOrNaN(eventValue)) {
        setValue(null);
        return;
      }
      const formattedValue = shouldForceInt ? +parseInt(eventValue) : Number(eventValue);
      setValue(Math.min(Math.max(formattedValue, min), max));
    };
    return /* @__PURE__ */ React32.createElement(ControlActions, null, /* @__PURE__ */ React32.createElement(
      TextField5,
      {
        size: "tiny",
        type: "number",
        fullWidth: true,
        disabled,
        value: isEmptyOrNaN(value) ? "" : value,
        onChange: handleChange,
        placeholder,
        inputProps: { step },
        onKeyDown: (event) => {
          if (RESTRICTED_INPUT_KEYS2.includes(event.key)) {
            event.preventDefault();
          }
        }
      }
    ));
  }
);

// src/controls/equal-unequal-sizes-control.tsx
import * as React33 from "react";
import { useId as useId2, useRef as useRef6 } from "react";
import { sizePropTypeUtil as sizePropTypeUtil2 } from "@elementor/editor-props";
import { isExperimentActive as isExperimentActive2 } from "@elementor/editor-v1-adapters";
import { bindPopover as bindPopover3, bindToggle, Grid as Grid6, Popover as Popover3, Stack as Stack7, ToggleButton as ToggleButton2, Tooltip as Tooltip3, usePopupState as usePopupState4 } from "@elementor/ui";
import { __ as __7 } from "@wordpress/i18n";
var isEqualSizes = (propValue, items) => {
  const values = Object.values(propValue);
  if (values.length !== items.length) {
    return false;
  }
  const [firstValue, ...restValues] = values;
  return restValues.every(
    (value) => value?.value?.size === firstValue?.value?.size && value?.value?.unit === firstValue?.value?.unit
  );
};
function EqualUnequalSizesControl({
  label,
  icon,
  tooltipLabel,
  items,
  multiSizePropTypeUtil
}) {
  const popupId = useId2();
  const popupState = usePopupState4({ variant: "popover", popupId });
  const {
    propType: multiSizePropType,
    value: multiSizeValue,
    setValue: setMultiSizeValue,
    disabled: multiSizeDisabled
  } = useBoundProp(multiSizePropTypeUtil);
  const { value: sizeValue, setValue: setSizeValue } = useBoundProp(sizePropTypeUtil2);
  const rowRefs = [useRef6(null), useRef6(null)];
  const splitEqualValue = () => {
    if (!sizeValue) {
      return null;
    }
    return items.reduce(
      (acc, { bind }) => ({ ...acc, [bind]: sizePropTypeUtil2.create(sizeValue) }),
      {}
    );
  };
  const setNestedProp = (newValue) => {
    const newMappedValues = {
      ...multiSizeValue ?? splitEqualValue(),
      ...newValue
    };
    const isEqual = isEqualSizes(newMappedValues, items);
    if (isEqual) {
      return setSizeValue(Object.values(newMappedValues)[0]?.value);
    }
    setMultiSizeValue(newMappedValues);
  };
  const getMultiSizeValues = () => {
    if (multiSizeValue) {
      return multiSizeValue;
    }
    return splitEqualValue() ?? null;
  };
  const isShowingGeneralIndicator = !isExperimentActive2("e_v_3_30") || !popupState.isOpen;
  const isMixed = !!multiSizeValue;
  return /* @__PURE__ */ React33.createElement(React33.Fragment, null, /* @__PURE__ */ React33.createElement(Grid6, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap", ref: rowRefs[0] }, /* @__PURE__ */ React33.createElement(Grid6, { item: true, xs: 6 }, !isShowingGeneralIndicator ? /* @__PURE__ */ React33.createElement(ControlFormLabel, null, label) : /* @__PURE__ */ React33.createElement(ControlLabel, null, label)), /* @__PURE__ */ React33.createElement(Grid6, { item: true, xs: 6 }, /* @__PURE__ */ React33.createElement(Stack7, { direction: "row", alignItems: "center", gap: 1 }, /* @__PURE__ */ React33.createElement(
    SizeControl,
    {
      placeholder: isMixed ? __7("Mixed", "elementor") : void 0,
      anchorRef: rowRefs[0]
    }
  ), /* @__PURE__ */ React33.createElement(Tooltip3, { title: tooltipLabel, placement: "top" }, /* @__PURE__ */ React33.createElement(
    ToggleButton2,
    {
      size: "tiny",
      value: "check",
      sx: { marginLeft: "auto" },
      ...bindToggle(popupState),
      selected: popupState.isOpen,
      "aria-label": tooltipLabel
    },
    icon
  ))))), /* @__PURE__ */ React33.createElement(
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
    /* @__PURE__ */ React33.createElement(
      PropProvider,
      {
        propType: multiSizePropType,
        value: getMultiSizeValues(),
        setValue: setNestedProp,
        disabled: multiSizeDisabled
      },
      /* @__PURE__ */ React33.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React33.createElement(PopoverGridContainer, { ref: rowRefs[1] }, /* @__PURE__ */ React33.createElement(MultiSizeValueControl, { item: items[0], rowRef: rowRefs[1] }), /* @__PURE__ */ React33.createElement(MultiSizeValueControl, { item: items[1], rowRef: rowRefs[1] })), /* @__PURE__ */ React33.createElement(PopoverGridContainer, { ref: rowRefs[2] }, /* @__PURE__ */ React33.createElement(MultiSizeValueControl, { item: items[2], rowRef: rowRefs[2] }), /* @__PURE__ */ React33.createElement(MultiSizeValueControl, { item: items[3], rowRef: rowRefs[2] })))
    )
  ));
}
var MultiSizeValueControl = ({ item, rowRef }) => {
  const isUsingNestedProps = isExperimentActive2("e_v_3_30");
  return /* @__PURE__ */ React33.createElement(PropKeyProvider, { bind: item.bind }, /* @__PURE__ */ React33.createElement(Grid6, { item: true, xs: 6 }, /* @__PURE__ */ React33.createElement(Grid6, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React33.createElement(Grid6, { item: true, xs: 12 }, isUsingNestedProps ? /* @__PURE__ */ React33.createElement(ControlLabel, null, item.label) : /* @__PURE__ */ React33.createElement(ControlFormLabel, null, item.label)), /* @__PURE__ */ React33.createElement(Grid6, { item: true, xs: 12 }, /* @__PURE__ */ React33.createElement(SizeControl, { startIcon: item.icon, anchorRef: rowRef })))));
};

// src/controls/linked-dimensions-control.tsx
import * as React34 from "react";
import { useRef as useRef7 } from "react";
import { dimensionsPropTypeUtil, sizePropTypeUtil as sizePropTypeUtil3 } from "@elementor/editor-props";
import { isExperimentActive as isExperimentActive3 } from "@elementor/editor-v1-adapters";
import { DetachIcon, LinkIcon, SideBottomIcon, SideLeftIcon, SideRightIcon, SideTopIcon } from "@elementor/icons";
import { Grid as Grid7, Stack as Stack8, ToggleButton as ToggleButton3, Tooltip as Tooltip4 } from "@elementor/ui";
import { __ as __8 } from "@wordpress/i18n";
var LinkedDimensionsControl = createControl(
  ({
    label,
    isSiteRtl = false,
    extendedOptions
  }) => {
    const { value: sizeValue, setValue: setSizeValue, disabled: sizeDisabled } = useBoundProp(sizePropTypeUtil3);
    const gridRowRefs = [useRef7(null), useRef7(null)];
    const {
      value: dimensionsValue,
      setValue: setDimensionsValue,
      propType,
      disabled: dimensionsDisabled
    } = useBoundProp(dimensionsPropTypeUtil);
    const isLinked = !dimensionsValue && !sizeValue ? true : !!sizeValue;
    const isUsingNestedProps = isExperimentActive3("e_v_3_30");
    const onLinkToggle = () => {
      if (!isLinked) {
        setSizeValue(dimensionsValue["block-start"]?.value ?? null);
        return;
      }
      const value = sizeValue ? sizePropTypeUtil3.create(sizeValue) : null;
      setDimensionsValue({
        "block-start": value,
        "block-end": value,
        "inline-start": value,
        "inline-end": value
      });
    };
    const tooltipLabel = label.toLowerCase();
    const LinkedIcon = isLinked ? LinkIcon : DetachIcon;
    const linkedLabel = __8("Link %s", "elementor").replace("%s", tooltipLabel);
    const unlinkedLabel = __8("Unlink %s", "elementor").replace("%s", tooltipLabel);
    const disabled = sizeDisabled || dimensionsDisabled;
    return /* @__PURE__ */ React34.createElement(
      PropProvider,
      {
        propType,
        value: dimensionsValue,
        setValue: setDimensionsValue,
        disabled
      },
      /* @__PURE__ */ React34.createElement(Stack8, { direction: "row", gap: 2, flexWrap: "nowrap" }, isUsingNestedProps ? /* @__PURE__ */ React34.createElement(ControlFormLabel, null, label) : /* @__PURE__ */ React34.createElement(ControlLabel, null, label), /* @__PURE__ */ React34.createElement(Tooltip4, { title: isLinked ? unlinkedLabel : linkedLabel, placement: "top" }, /* @__PURE__ */ React34.createElement(
        ToggleButton3,
        {
          "aria-label": isLinked ? unlinkedLabel : linkedLabel,
          size: "tiny",
          value: "check",
          selected: isLinked,
          sx: { marginLeft: "auto" },
          onChange: onLinkToggle,
          disabled
        },
        /* @__PURE__ */ React34.createElement(LinkedIcon, { fontSize: "tiny" })
      ))),
      getCssMarginProps(isSiteRtl).map((row, index) => /* @__PURE__ */ React34.createElement(Stack8, { direction: "row", gap: 2, flexWrap: "nowrap", key: index, ref: gridRowRefs[index] }, row.map(({ icon, ...props }) => /* @__PURE__ */ React34.createElement(Grid7, { container: true, gap: 0.75, alignItems: "center", key: props.bind }, /* @__PURE__ */ React34.createElement(Grid7, { item: true, xs: 12 }, /* @__PURE__ */ React34.createElement(Label, { ...props })), /* @__PURE__ */ React34.createElement(Grid7, { item: true, xs: 12 }, /* @__PURE__ */ React34.createElement(
        Control3,
        {
          bind: props.bind,
          startIcon: icon,
          isLinked,
          extendedOptions,
          anchorRef: gridRowRefs[index]
        }
      ))))))
    );
  }
);
var Control3 = ({
  bind,
  startIcon,
  isLinked,
  extendedOptions,
  anchorRef
}) => {
  if (isLinked) {
    return /* @__PURE__ */ React34.createElement(SizeControl, { startIcon, extendedOptions, anchorRef });
  }
  return /* @__PURE__ */ React34.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React34.createElement(SizeControl, { startIcon, extendedOptions, anchorRef }));
};
var Label = ({ label, bind }) => {
  const isUsingNestedProps = isExperimentActive3("e_v_3_30");
  if (!isUsingNestedProps) {
    return /* @__PURE__ */ React34.createElement(ControlFormLabel, null, label);
  }
  return /* @__PURE__ */ React34.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React34.createElement(ControlLabel, null, label));
};
function getCssMarginProps(isSiteRtl) {
  return [
    [
      {
        bind: "block-start",
        label: __8("Top", "elementor"),
        icon: /* @__PURE__ */ React34.createElement(SideTopIcon, { fontSize: "tiny" })
      },
      {
        bind: "inline-end",
        label: isSiteRtl ? __8("Left", "elementor") : __8("Right", "elementor"),
        icon: isSiteRtl ? /* @__PURE__ */ React34.createElement(SideLeftIcon, { fontSize: "tiny" }) : /* @__PURE__ */ React34.createElement(SideRightIcon, { fontSize: "tiny" })
      }
    ],
    [
      {
        bind: "block-end",
        label: __8("Bottom", "elementor"),
        icon: /* @__PURE__ */ React34.createElement(SideBottomIcon, { fontSize: "tiny" })
      },
      {
        bind: "inline-start",
        label: isSiteRtl ? __8("Right", "elementor") : __8("Left", "elementor"),
        icon: isSiteRtl ? /* @__PURE__ */ React34.createElement(SideRightIcon, { fontSize: "tiny" }) : /* @__PURE__ */ React34.createElement(SideLeftIcon, { fontSize: "tiny" })
      }
    ]
  ];
}

// src/controls/font-family-control/font-family-control.tsx
import * as React36 from "react";
import { stringPropTypeUtil as stringPropTypeUtil5 } from "@elementor/editor-props";
import { ChevronDownIcon as ChevronDownIcon2 } from "@elementor/icons";
import { bindPopover as bindPopover4, bindTrigger as bindTrigger3, Popover as Popover4, UnstableTag as UnstableTag2, usePopupState as usePopupState5 } from "@elementor/ui";

// src/components/font-family-selector.tsx
import * as React35 from "react";
import { useEffect as useEffect5, useState as useState6 } from "react";
import { PopoverHeader, PopoverMenuList, PopoverScrollableContent, PopoverSearch } from "@elementor/editor-ui";
import { TextIcon } from "@elementor/icons";
import { Box as Box4, Divider as Divider2, Link, Stack as Stack9, Typography as Typography3 } from "@elementor/ui";
import { debounce } from "@elementor/utils";
import { __ as __9 } from "@wordpress/i18n";

// src/controls/font-family-control/enqueue-font.tsx
var enqueueFont = (fontFamily, context = "editor") => {
  const extendedWindow = window;
  return extendedWindow.elementor?.helpers?.enqueueFont?.(fontFamily, context) ?? null;
};

// src/hooks/use-filtered-font-families.ts
var useFilteredFontFamilies = (fontFamilies, searchValue) => {
  return fontFamilies.reduce((acc, category) => {
    const filteredFonts = category.fonts.filter(
      (font) => font.toLowerCase().includes(searchValue.toLowerCase())
    );
    if (filteredFonts.length) {
      acc.push({ type: "category", value: category.label });
      filteredFonts.forEach((font) => {
        acc.push({ type: "font", value: font });
      });
    }
    return acc;
  }, []);
};

// src/components/font-family-selector.tsx
var SIZE2 = "tiny";
var FontFamilySelector = ({
  fontFamilies,
  fontFamily,
  onFontFamilyChange,
  onClose,
  sectionWidth
}) => {
  const [searchValue, setSearchValue] = useState6("");
  const filteredFontFamilies = useFilteredFontFamilies(fontFamilies, searchValue);
  const handleSearch = (value) => {
    setSearchValue(value);
  };
  const handleClose = () => {
    setSearchValue("");
    onClose();
  };
  return /* @__PURE__ */ React35.createElement(Stack9, null, /* @__PURE__ */ React35.createElement(
    PopoverHeader,
    {
      title: __9("Font Family", "elementor"),
      onClose: handleClose,
      icon: /* @__PURE__ */ React35.createElement(TextIcon, { fontSize: SIZE2 })
    }
  ), /* @__PURE__ */ React35.createElement(
    PopoverSearch,
    {
      value: searchValue,
      onSearch: handleSearch,
      placeholder: __9("Search", "elementor")
    }
  ), /* @__PURE__ */ React35.createElement(Divider2, null), filteredFontFamilies.length > 0 ? /* @__PURE__ */ React35.createElement(
    FontList,
    {
      fontListItems: filteredFontFamilies,
      setFontFamily: onFontFamilyChange,
      handleClose,
      fontFamily,
      sectionWidth
    }
  ) : /* @__PURE__ */ React35.createElement(PopoverScrollableContent, { width: sectionWidth }, /* @__PURE__ */ React35.createElement(
    Stack9,
    {
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      p: 2.5,
      gap: 1.5,
      overflow: "hidden"
    },
    /* @__PURE__ */ React35.createElement(TextIcon, { fontSize: "large" }),
    /* @__PURE__ */ React35.createElement(Box4, { sx: { maxWidth: 160, overflow: "hidden" } }, /* @__PURE__ */ React35.createElement(Typography3, { align: "center", variant: "subtitle2", color: "text.secondary" }, __9("Sorry, nothing matched", "elementor")), /* @__PURE__ */ React35.createElement(
      Typography3,
      {
        variant: "subtitle2",
        color: "text.secondary",
        sx: {
          display: "flex",
          width: "100%",
          justifyContent: "center"
        }
      },
      /* @__PURE__ */ React35.createElement("span", null, "\u201C"),
      /* @__PURE__ */ React35.createElement("span", { style: { maxWidth: "80%", overflow: "hidden", textOverflow: "ellipsis" } }, searchValue),
      /* @__PURE__ */ React35.createElement("span", null, "\u201D.")
    )),
    /* @__PURE__ */ React35.createElement(
      Typography3,
      {
        align: "center",
        variant: "caption",
        color: "text.secondary",
        sx: { display: "flex", flexDirection: "column" }
      },
      __9("Try something else.", "elementor"),
      /* @__PURE__ */ React35.createElement(
        Link,
        {
          color: "secondary",
          variant: "caption",
          component: "button",
          onClick: () => setSearchValue("")
        },
        __9("Clear & try again", "elementor")
      )
    )
  )));
};
var FontList = ({ fontListItems, setFontFamily, handleClose, fontFamily, sectionWidth }) => {
  const selectedItem = fontListItems.find((item) => item.value === fontFamily);
  const debouncedVirtualizeChange = useDebounce(({ getVirtualIndexes }) => {
    getVirtualIndexes().forEach((index) => {
      const item = fontListItems[index];
      if (item && item.type === "font") {
        enqueueFont(item.value);
      }
    });
  }, 100);
  return /* @__PURE__ */ React35.createElement(
    PopoverMenuList,
    {
      items: fontListItems,
      selectedValue: selectedItem?.value,
      onChange: debouncedVirtualizeChange,
      onSelect: setFontFamily,
      onClose: handleClose,
      itemStyle: (item) => ({ fontFamily: item.value }),
      "data-testid": "font-list",
      width: sectionWidth
    }
  );
};
var useDebounce = (fn, delay) => {
  const [debouncedFn] = useState6(() => debounce(fn, delay));
  useEffect5(() => () => debouncedFn.cancel(), [debouncedFn]);
  return debouncedFn;
};

// src/controls/font-family-control/font-family-control.tsx
var SIZE3 = "tiny";
var FontFamilyControl = createControl(({ fontFamilies, sectionWidth }) => {
  const { value: fontFamily, setValue: setFontFamily, disabled } = useBoundProp(stringPropTypeUtil5);
  const popoverState = usePopupState5({ variant: "popover" });
  return /* @__PURE__ */ React36.createElement(React36.Fragment, null, /* @__PURE__ */ React36.createElement(ControlActions, null, /* @__PURE__ */ React36.createElement(
    UnstableTag2,
    {
      variant: "outlined",
      label: fontFamily,
      endIcon: /* @__PURE__ */ React36.createElement(ChevronDownIcon2, { fontSize: SIZE3 }),
      ...bindTrigger3(popoverState),
      fullWidth: true,
      disabled
    }
  )), /* @__PURE__ */ React36.createElement(
    Popover4,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      sx: { my: 1.5 },
      ...bindPopover4(popoverState)
    },
    /* @__PURE__ */ React36.createElement(
      FontFamilySelector,
      {
        fontFamilies,
        fontFamily,
        onFontFamilyChange: setFontFamily,
        onClose: popoverState.close,
        sectionWidth
      }
    )
  ));
});

// src/controls/url-control.tsx
import * as React37 from "react";
import { urlPropTypeUtil } from "@elementor/editor-props";
import { TextField as TextField6 } from "@elementor/ui";
var UrlControl = createControl(({ placeholder }) => {
  const { value, setValue, disabled } = useBoundProp(urlPropTypeUtil);
  const handleChange = (event) => setValue(event.target.value);
  return /* @__PURE__ */ React37.createElement(ControlActions, null, /* @__PURE__ */ React37.createElement(
    TextField6,
    {
      size: "tiny",
      fullWidth: true,
      value: value ?? "",
      disabled,
      onChange: handleChange,
      placeholder
    }
  ));
});

// src/controls/link-control.tsx
import * as React39 from "react";
import { useMemo as useMemo3, useState as useState7 } from "react";
import { getLinkInLinkRestriction, selectElement } from "@elementor/editor-elements";
import {
  booleanPropTypeUtil,
  linkPropTypeUtil,
  numberPropTypeUtil as numberPropTypeUtil2,
  stringPropTypeUtil as stringPropTypeUtil6,
  urlPropTypeUtil as urlPropTypeUtil2
} from "@elementor/editor-props";
import { InfoTipCard } from "@elementor/editor-ui";
import { httpService as httpService2 } from "@elementor/http-client";
import { AlertTriangleIcon, MinusIcon, PlusIcon as PlusIcon2 } from "@elementor/icons";
import { useSessionStorage } from "@elementor/session";
import { Box as Box6, Collapse, Grid as Grid8, IconButton as IconButton3, Infotip, Stack as Stack10, Switch } from "@elementor/ui";
import { debounce as debounce2 } from "@elementor/utils";
import { __ as __10 } from "@wordpress/i18n";

// src/components/autocomplete.tsx
import * as React38 from "react";
import { forwardRef as forwardRef4 } from "react";
import { XIcon as XIcon2 } from "@elementor/icons";
import {
  Autocomplete as AutocompleteBase,
  Box as Box5,
  IconButton as IconButton2,
  InputAdornment as InputAdornment3,
  TextField as TextField7
} from "@elementor/ui";
var Autocomplete = forwardRef4((props, ref) => {
  const {
    options,
    onOptionChange,
    onTextChange,
    allowCustomValues = false,
    placeholder = "",
    minInputLength = 2,
    value = "",
    ...restProps
  } = props;
  const optionKeys = _factoryFilter(value, options, minInputLength).map(({ id }) => id);
  const allowClear = !!value;
  const muiWarningPreventer = allowCustomValues || !!value?.toString()?.length;
  const isOptionEqualToValue = muiWarningPreventer ? void 0 : () => true;
  const isValueFromOptions = typeof value === "number" && !!findMatchingOption(options, value);
  return /* @__PURE__ */ React38.createElement(
    AutocompleteBase,
    {
      ...restProps,
      ref,
      forcePopupIcon: false,
      disableClearable: true,
      freeSolo: allowCustomValues,
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
      renderOption: (optionProps, optionId) => /* @__PURE__ */ React38.createElement(Box5, { component: "li", ...optionProps, key: optionProps.id }, findMatchingOption(options, optionId)?.label ?? optionId),
      renderInput: (params) => /* @__PURE__ */ React38.createElement(
        TextInput,
        {
          params,
          handleChange: (newValue) => onTextChange?.(newValue),
          allowClear,
          placeholder,
          hasSelectedValue: isValueFromOptions
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
  hasSelectedValue
}) => {
  const onChange = (event) => {
    handleChange(event.target.value);
  };
  return /* @__PURE__ */ React38.createElement(
    TextField7,
    {
      ...params,
      placeholder,
      onChange,
      sx: {
        "& .MuiInputBase-input": {
          cursor: hasSelectedValue ? "default" : void 0
        }
      },
      InputProps: {
        ...params.InputProps,
        endAdornment: /* @__PURE__ */ React38.createElement(ClearButton, { params, allowClear, handleChange })
      }
    }
  );
};
var ClearButton = ({
  allowClear,
  handleChange,
  params
}) => /* @__PURE__ */ React38.createElement(InputAdornment3, { position: "end" }, allowClear && /* @__PURE__ */ React38.createElement(IconButton2, { size: params.size, onClick: () => handleChange(null), sx: { cursor: "pointer" } }, /* @__PURE__ */ React38.createElement(XIcon2, { fontSize: params.size })));
function findMatchingOption(options, optionId = null) {
  const formattedOption = (optionId || "").toString();
  return options.find(({ id }) => formattedOption === id.toString());
}
function isCategorizedOptionPool(options) {
  return options.every((option) => "groupLabel" in option);
}
function _factoryFilter(newValue, options, minInputLength) {
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

// src/controls/link-control.tsx
var SIZE4 = "tiny";
var learnMoreButton = {
  label: __10("Learn More", "elementor"),
  href: "https://go.elementor.com/element-link-inside-link-infotip"
};
var LinkControl = createControl((props) => {
  const { value, path, setValue, ...propContext } = useBoundProp(linkPropTypeUtil);
  const [linkSessionValue, setLinkSessionValue] = useSessionStorage(path.join("/"));
  const [isActive, setIsActive] = useState7(!!value);
  const {
    allowCustomValues,
    queryOptions: { endpoint = "", requestParams = {} },
    placeholder,
    minInputLength = 2,
    context: { elementId }
  } = props || {};
  const [linkInLinkRestriction, setLinkInLinkRestriction] = useState7(getLinkInLinkRestriction(elementId));
  const [options, setOptions] = useState7(
    generateFirstLoadedOption(value)
  );
  const shouldDisableAddingLink = !isActive && linkInLinkRestriction.shouldRestrict;
  const onEnabledChange = () => {
    setLinkInLinkRestriction(getLinkInLinkRestriction(elementId));
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
  const onOptionChange = (newValue) => {
    const valueToSave = newValue ? {
      ...value,
      destination: numberPropTypeUtil2.create(newValue),
      label: stringPropTypeUtil6.create(findMatchingOption(options, newValue)?.label || null)
    } : null;
    onSaveNewValue(valueToSave);
  };
  const onTextChange = (newValue) => {
    newValue = newValue?.trim() || "";
    const valueToSave = newValue ? {
      ...value,
      destination: urlPropTypeUtil2.create(newValue),
      label: stringPropTypeUtil6.create("")
    } : null;
    onSaveNewValue(valueToSave);
    updateOptions(newValue);
  };
  const onSaveNewValue = (newValue) => {
    setValue(newValue);
    setLinkSessionValue({ ...linkSessionValue, value: newValue });
  };
  const updateOptions = (newValue) => {
    setOptions([]);
    if (!newValue || !endpoint || newValue.length < minInputLength) {
      return;
    }
    debounceFetch({ ...requestParams, term: newValue });
  };
  const debounceFetch = useMemo3(
    () => debounce2(
      (params) => fetchOptions(endpoint, params).then((newOptions) => {
        setOptions(formatOptions(newOptions));
      }),
      400
    ),
    [endpoint]
  );
  return /* @__PURE__ */ React39.createElement(PropProvider, { ...propContext, value, setValue }, /* @__PURE__ */ React39.createElement(Stack10, { gap: 1.5 }, /* @__PURE__ */ React39.createElement(
    Stack10,
    {
      direction: "row",
      sx: {
        justifyContent: "space-between",
        alignItems: "center",
        marginInlineEnd: -0.75
      }
    },
    /* @__PURE__ */ React39.createElement(ControlFormLabel, null, __10("Link", "elementor")),
    /* @__PURE__ */ React39.createElement(ConditionalInfoTip, { isVisible: !isActive, linkInLinkRestriction }, /* @__PURE__ */ React39.createElement(
      ToggleIconControl,
      {
        disabled: shouldDisableAddingLink,
        active: isActive,
        onIconClick: onEnabledChange,
        label: __10("Toggle link", "elementor")
      }
    ))
  ), /* @__PURE__ */ React39.createElement(Collapse, { in: isActive, timeout: "auto", unmountOnExit: true }, /* @__PURE__ */ React39.createElement(Stack10, { gap: 1.5 }, /* @__PURE__ */ React39.createElement(PropKeyProvider, { bind: "destination" }, /* @__PURE__ */ React39.createElement(ControlActions, null, /* @__PURE__ */ React39.createElement(
    Autocomplete,
    {
      options,
      allowCustomValues,
      placeholder,
      value: value?.destination?.value?.settings?.label || value?.destination?.value,
      onOptionChange,
      onTextChange,
      minInputLength
    }
  ))), /* @__PURE__ */ React39.createElement(PropKeyProvider, { bind: "isTargetBlank" }, /* @__PURE__ */ React39.createElement(SwitchControl, { disabled: propContext.disabled || !value }))))));
});
var ToggleIconControl = ({ disabled, active, onIconClick, label }) => {
  return /* @__PURE__ */ React39.createElement(IconButton3, { size: SIZE4, onClick: onIconClick, "aria-label": label, disabled }, active ? /* @__PURE__ */ React39.createElement(MinusIcon, { fontSize: SIZE4 }) : /* @__PURE__ */ React39.createElement(PlusIcon2, { fontSize: SIZE4 }));
};
var SwitchControl = ({ disabled }) => {
  const { value = false, setValue } = useBoundProp(booleanPropTypeUtil);
  const onClick = () => {
    setValue(!value);
  };
  const inputProps = disabled ? {
    style: {
      opacity: 0
    }
  } : {};
  return /* @__PURE__ */ React39.createElement(Grid8, { container: true, alignItems: "center", flexWrap: "nowrap", justifyContent: "space-between" }, /* @__PURE__ */ React39.createElement(Grid8, { item: true }, /* @__PURE__ */ React39.createElement(ControlFormLabel, null, __10("Open in a new tab", "elementor"))), /* @__PURE__ */ React39.createElement(Grid8, { item: true, sx: { marginInlineEnd: -1 } }, /* @__PURE__ */ React39.createElement(Switch, { checked: value, onClick, disabled, inputProps })));
};
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
  const value = unionValue?.destination?.value;
  const label = unionValue?.label?.value;
  const type = unionValue?.destination?.$$type || "url";
  return value && label && type === "number" ? [
    {
      id: value.toString(),
      label
    }
  ] : [];
}
var ConditionalInfoTip = ({ linkInLinkRestriction, isVisible, children }) => {
  const { shouldRestrict, reason, elementId } = linkInLinkRestriction;
  const handleTakeMeClick = () => {
    if (elementId) {
      selectElement(elementId);
    }
  };
  return shouldRestrict && isVisible ? /* @__PURE__ */ React39.createElement(
    Infotip,
    {
      placement: "right",
      content: /* @__PURE__ */ React39.createElement(
        InfoTipCard,
        {
          content: INFOTIP_CONTENT[reason],
          svgIcon: /* @__PURE__ */ React39.createElement(AlertTriangleIcon, null),
          learnMoreButton,
          ctaButton: {
            label: __10("Take me there", "elementor"),
            onClick: handleTakeMeClick
          }
        }
      )
    },
    /* @__PURE__ */ React39.createElement(Box6, null, children)
  ) : /* @__PURE__ */ React39.createElement(React39.Fragment, null, children);
};
var INFOTIP_CONTENT = {
  descendant: /* @__PURE__ */ React39.createElement(React39.Fragment, null, __10("To add a link to this container,", "elementor"), /* @__PURE__ */ React39.createElement("br", null), __10("first remove the link from the elements inside of it.", "elementor")),
  ancestor: /* @__PURE__ */ React39.createElement(React39.Fragment, null, __10("To add a link to this element,", "elementor"), /* @__PURE__ */ React39.createElement("br", null), __10("first remove the link from its parent container.", "elementor"))
};

// src/controls/gap-control.tsx
import * as React40 from "react";
import { useRef as useRef8 } from "react";
import { layoutDirectionPropTypeUtil, sizePropTypeUtil as sizePropTypeUtil4 } from "@elementor/editor-props";
import { DetachIcon as DetachIcon2, LinkIcon as LinkIcon2 } from "@elementor/icons";
import { Grid as Grid9, Stack as Stack11, ToggleButton as ToggleButton4, Tooltip as Tooltip5 } from "@elementor/ui";
import { __ as __11 } from "@wordpress/i18n";
var GapControl = createControl(({ label }) => {
  const {
    value: directionValue,
    setValue: setDirectionValue,
    propType,
    disabled: directionDisabled
  } = useBoundProp(layoutDirectionPropTypeUtil);
  const stackRef = useRef8(null);
  const { value: sizeValue, setValue: setSizeValue, disabled: sizeDisabled } = useBoundProp(sizePropTypeUtil4);
  const isLinked = !directionValue && !sizeValue ? true : !!sizeValue;
  const onLinkToggle = () => {
    if (!isLinked) {
      setSizeValue(directionValue?.column?.value ?? null);
      return;
    }
    const value = sizeValue ? sizePropTypeUtil4.create(sizeValue) : null;
    setDirectionValue({
      row: value,
      column: value
    });
  };
  const tooltipLabel = label.toLowerCase();
  const LinkedIcon = isLinked ? LinkIcon2 : DetachIcon2;
  const linkedLabel = __11("Link %s", "elementor").replace("%s", tooltipLabel);
  const unlinkedLabel = __11("Unlink %s", "elementor").replace("%s", tooltipLabel);
  const disabled = sizeDisabled || directionDisabled;
  return /* @__PURE__ */ React40.createElement(PropProvider, { propType, value: directionValue, setValue: setDirectionValue }, /* @__PURE__ */ React40.createElement(Stack11, { direction: "row", gap: 2, flexWrap: "nowrap" }, /* @__PURE__ */ React40.createElement(ControlLabel, null, label), /* @__PURE__ */ React40.createElement(Tooltip5, { title: isLinked ? unlinkedLabel : linkedLabel, placement: "top" }, /* @__PURE__ */ React40.createElement(
    ToggleButton4,
    {
      "aria-label": isLinked ? unlinkedLabel : linkedLabel,
      size: "tiny",
      value: "check",
      selected: isLinked,
      sx: { marginLeft: "auto" },
      onChange: onLinkToggle,
      disabled
    },
    /* @__PURE__ */ React40.createElement(LinkedIcon, { fontSize: "tiny" })
  ))), /* @__PURE__ */ React40.createElement(Stack11, { direction: "row", gap: 2, flexWrap: "nowrap", ref: stackRef }, /* @__PURE__ */ React40.createElement(Grid9, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React40.createElement(Grid9, { item: true, xs: 12 }, /* @__PURE__ */ React40.createElement(ControlFormLabel, null, __11("Column", "elementor"))), /* @__PURE__ */ React40.createElement(Grid9, { item: true, xs: 12 }, /* @__PURE__ */ React40.createElement(Control4, { bind: "column", isLinked, anchorRef: stackRef }))), /* @__PURE__ */ React40.createElement(Grid9, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React40.createElement(Grid9, { item: true, xs: 12 }, /* @__PURE__ */ React40.createElement(ControlFormLabel, null, __11("Row", "elementor"))), /* @__PURE__ */ React40.createElement(Grid9, { item: true, xs: 12 }, /* @__PURE__ */ React40.createElement(Control4, { bind: "row", isLinked, anchorRef: stackRef })))));
});
var Control4 = ({
  bind,
  isLinked,
  anchorRef
}) => {
  if (isLinked) {
    return /* @__PURE__ */ React40.createElement(SizeControl, { anchorRef });
  }
  return /* @__PURE__ */ React40.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React40.createElement(SizeControl, { anchorRef }));
};

// src/controls/aspect-ratio-control.tsx
import * as React41 from "react";
import { useEffect as useEffect6, useState as useState8 } from "react";
import { stringPropTypeUtil as stringPropTypeUtil7 } from "@elementor/editor-props";
import { MenuListItem as MenuListItem4 } from "@elementor/editor-ui";
import { ArrowsMoveHorizontalIcon, ArrowsMoveVerticalIcon } from "@elementor/icons";
import { Grid as Grid10, Select as Select3, Stack as Stack12, TextField as TextField8 } from "@elementor/ui";
import { __ as __12 } from "@wordpress/i18n";
var RATIO_OPTIONS = [
  { label: __12("Auto", "elementor"), value: "auto" },
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
  const { value: aspectRatioValue, setValue: setAspectRatioValue, disabled } = useBoundProp(stringPropTypeUtil7);
  const isCustomSelected = aspectRatioValue && !RATIO_OPTIONS.some((option) => option.value === aspectRatioValue);
  const [initialWidth, initialHeight] = isCustomSelected ? aspectRatioValue.split("/") : ["", ""];
  const [isCustom, setIsCustom] = useState8(isCustomSelected);
  const [customWidth, setCustomWidth] = useState8(initialWidth);
  const [customHeight, setCustomHeight] = useState8(initialHeight);
  const [selectedValue, setSelectedValue] = useState8(
    isCustomSelected ? CUSTOM_RATIO : aspectRatioValue || ""
  );
  useEffect6(() => {
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
  return /* @__PURE__ */ React41.createElement(ControlActions, null, /* @__PURE__ */ React41.createElement(Stack12, { direction: "column", gap: 2 }, /* @__PURE__ */ React41.createElement(Grid10, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React41.createElement(Grid10, { item: true, xs: 6 }, /* @__PURE__ */ React41.createElement(ControlLabel, null, label)), /* @__PURE__ */ React41.createElement(Grid10, { item: true, xs: 6 }, /* @__PURE__ */ React41.createElement(
    Select3,
    {
      size: "tiny",
      displayEmpty: true,
      sx: { overflow: "hidden" },
      disabled,
      value: selectedValue,
      onChange: handleSelectChange,
      fullWidth: true
    },
    [...RATIO_OPTIONS, { label: __12("Custom", "elementor"), value: CUSTOM_RATIO }].map(
      ({ label: optionLabel, ...props }) => /* @__PURE__ */ React41.createElement(MenuListItem4, { key: props.value, ...props, value: props.value ?? "" }, optionLabel)
    )
  ))), isCustom && /* @__PURE__ */ React41.createElement(Grid10, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React41.createElement(Grid10, { item: true, xs: 6 }, /* @__PURE__ */ React41.createElement(
    TextField8,
    {
      size: "tiny",
      type: "number",
      fullWidth: true,
      disabled,
      value: customWidth,
      onChange: handleCustomWidthChange,
      InputProps: {
        startAdornment: /* @__PURE__ */ React41.createElement(ArrowsMoveHorizontalIcon, { fontSize: "tiny" })
      }
    }
  )), /* @__PURE__ */ React41.createElement(Grid10, { item: true, xs: 6 }, /* @__PURE__ */ React41.createElement(
    TextField8,
    {
      size: "tiny",
      type: "number",
      fullWidth: true,
      disabled,
      value: customHeight,
      onChange: handleCustomHeightChange,
      InputProps: {
        startAdornment: /* @__PURE__ */ React41.createElement(ArrowsMoveVerticalIcon, { fontSize: "tiny" })
      }
    }
  )))));
});

// src/controls/svg-media-control.tsx
import * as React43 from "react";
import { useState as useState10 } from "react";
import { imageSrcPropTypeUtil as imageSrcPropTypeUtil2 } from "@elementor/editor-props";
import { UploadIcon as UploadIcon2 } from "@elementor/icons";
import { Button as Button4, Card as Card2, CardMedia as CardMedia2, CardOverlay as CardOverlay2, CircularProgress as CircularProgress3, Stack as Stack13, styled as styled4 } from "@elementor/ui";
import { useWpMediaAttachment as useWpMediaAttachment2, useWpMediaFrame as useWpMediaFrame2 } from "@elementor/wp-media";
import { __ as __14 } from "@wordpress/i18n";

// src/components/enable-unfiltered-modal.tsx
import * as React42 from "react";
import { useState as useState9 } from "react";
import { useCurrentUserCapabilities } from "@elementor/editor-current-user";
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
import { __ as __13 } from "@wordpress/i18n";
var ADMIN_TITLE_TEXT = __13("Enable Unfiltered Uploads", "elementor");
var ADMIN_CONTENT_TEXT = __13(
  "Before you enable unfiltered files upload, note that such files include a security risk. Elementor does run a process to remove possible malicious code, but there is still risk involved when using such files.",
  "elementor"
);
var NON_ADMIN_TITLE_TEXT = __13("Sorry, you can't upload that file yet", "elementor");
var NON_ADMIN_CONTENT_TEXT = __13(
  "This is because this file type may pose a security risk. To upload them anyway, ask the site administrator to enable unfiltered file uploads.",
  "elementor"
);
var ADMIN_FAILED_CONTENT_TEXT_PT1 = __13("Failed to enable unfiltered files upload.", "elementor");
var ADMIN_FAILED_CONTENT_TEXT_PT2 = __13(
  "You can try again, if the problem persists, please contact support.",
  "elementor"
);
var WAIT_FOR_CLOSE_TIMEOUT_MS = 300;
var EnableUnfilteredModal = (props) => {
  const { mutateAsync, isPending } = useUpdateUnfilteredFilesUpload();
  const { canUser } = useCurrentUserCapabilities();
  const [isError, setIsError] = useState9(false);
  const canManageOptions = canUser("manage_options");
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
  return canManageOptions ? /* @__PURE__ */ React42.createElement(AdminDialog, { ...dialogProps }) : /* @__PURE__ */ React42.createElement(NonAdminDialog, { ...dialogProps });
};
var AdminDialog = ({ open, onClose, handleEnable, isPending, isError }) => /* @__PURE__ */ React42.createElement(Dialog, { open, maxWidth: "sm", onClose: () => onClose(false) }, /* @__PURE__ */ React42.createElement(DialogHeader, { logo: false }, /* @__PURE__ */ React42.createElement(DialogTitle, null, ADMIN_TITLE_TEXT)), /* @__PURE__ */ React42.createElement(Divider3, null), /* @__PURE__ */ React42.createElement(DialogContent, null, /* @__PURE__ */ React42.createElement(DialogContentText, null, isError ? /* @__PURE__ */ React42.createElement(React42.Fragment, null, ADMIN_FAILED_CONTENT_TEXT_PT1, " ", /* @__PURE__ */ React42.createElement("br", null), " ", ADMIN_FAILED_CONTENT_TEXT_PT2) : ADMIN_CONTENT_TEXT)), /* @__PURE__ */ React42.createElement(DialogActions, null, /* @__PURE__ */ React42.createElement(Button3, { size: "medium", color: "secondary", onClick: () => onClose(false) }, __13("Cancel", "elementor")), /* @__PURE__ */ React42.createElement(
  Button3,
  {
    size: "medium",
    onClick: () => handleEnable(),
    variant: "contained",
    color: "primary",
    disabled: isPending
  },
  isPending ? /* @__PURE__ */ React42.createElement(CircularProgress2, { size: 24 }) : __13("Enable", "elementor")
)));
var NonAdminDialog = ({ open, onClose }) => /* @__PURE__ */ React42.createElement(Dialog, { open, maxWidth: "sm", onClose: () => onClose(false) }, /* @__PURE__ */ React42.createElement(DialogHeader, { logo: false }, /* @__PURE__ */ React42.createElement(DialogTitle, null, NON_ADMIN_TITLE_TEXT)), /* @__PURE__ */ React42.createElement(Divider3, null), /* @__PURE__ */ React42.createElement(DialogContent, null, /* @__PURE__ */ React42.createElement(DialogContentText, null, NON_ADMIN_CONTENT_TEXT)), /* @__PURE__ */ React42.createElement(DialogActions, null, /* @__PURE__ */ React42.createElement(Button3, { size: "medium", onClick: () => onClose(false), variant: "contained", color: "primary" }, __13("Got it", "elementor"))));

// src/controls/svg-media-control.tsx
var TILE_SIZE = 8;
var TILE_WHITE = "transparent";
var TILE_BLACK = "#c1c1c1";
var TILES_GRADIENT_FORMULA = `linear-gradient(45deg, ${TILE_BLACK} 25%, ${TILE_WHITE} 0, ${TILE_WHITE} 75%, ${TILE_BLACK} 0, ${TILE_BLACK})`;
var StyledCard = styled4(Card2)`
	background-color: white;
	background-image: ${TILES_GRADIENT_FORMULA}, ${TILES_GRADIENT_FORMULA};
	background-size: ${TILE_SIZE}px ${TILE_SIZE}px;
	background-position:
		0 0,
		${TILE_SIZE / 2}px ${TILE_SIZE / 2}px;
	border: none;
`;
var StyledCardMediaContainer = styled4(Stack13)`
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
  const [unfilteredModalOpenState, setUnfilteredModalOpenState] = useState10(false);
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
  return /* @__PURE__ */ React43.createElement(Stack13, { gap: 1 }, /* @__PURE__ */ React43.createElement(EnableUnfilteredModal, { open: unfilteredModalOpenState, onClose: onCloseUnfilteredModal }), /* @__PURE__ */ React43.createElement(ControlFormLabel, null, " ", __14("SVG", "elementor"), " "), /* @__PURE__ */ React43.createElement(ControlActions, null, /* @__PURE__ */ React43.createElement(StyledCard, { variant: "outlined" }, /* @__PURE__ */ React43.createElement(StyledCardMediaContainer, null, isFetching ? /* @__PURE__ */ React43.createElement(CircularProgress3, { role: "progressbar" }) : /* @__PURE__ */ React43.createElement(
    CardMedia2,
    {
      component: "img",
      image: src,
      alt: __14("Preview SVG", "elementor"),
      sx: { maxHeight: "140px", width: "50px" }
    }
  )), /* @__PURE__ */ React43.createElement(
    CardOverlay2,
    {
      sx: {
        "&:hover": {
          backgroundColor: "rgba( 0, 0, 0, 0.75 )"
        }
      }
    },
    /* @__PURE__ */ React43.createElement(Stack13, { gap: 1 }, /* @__PURE__ */ React43.createElement(
      Button4,
      {
        size: "tiny",
        color: "inherit",
        variant: "outlined",
        onClick: () => handleClick(MODE_BROWSE)
      },
      __14("Select SVG", "elementor")
    ), /* @__PURE__ */ React43.createElement(
      Button4,
      {
        size: "tiny",
        variant: "text",
        color: "inherit",
        startIcon: /* @__PURE__ */ React43.createElement(UploadIcon2, null),
        onClick: () => handleClick(MODE_UPLOAD)
      },
      __14("Upload", "elementor")
    ))
  ))));
});

// src/controls/background-control/background-control.tsx
import * as React50 from "react";
import { backgroundPropTypeUtil } from "@elementor/editor-props";
import { isExperimentActive as isExperimentActive4 } from "@elementor/editor-v1-adapters";
import { Grid as Grid16 } from "@elementor/ui";
import { __ as __20 } from "@wordpress/i18n";

// src/controls/background-control/background-overlay/background-overlay-repeater-control.tsx
import * as React49 from "react";
import {
  backgroundColorOverlayPropTypeUtil as backgroundColorOverlayPropTypeUtil2,
  backgroundImageOverlayPropTypeUtil as backgroundImageOverlayPropTypeUtil2,
  backgroundOverlayPropTypeUtil,
  colorPropTypeUtil as colorPropTypeUtil3
} from "@elementor/editor-props";
import { Box as Box7, CardMedia as CardMedia3, Grid as Grid15, styled as styled5, Tab, TabPanel, Tabs, UnstableColorIndicator as UnstableColorIndicator2 } from "@elementor/ui";
import { useWpMediaAttachment as useWpMediaAttachment3 } from "@elementor/wp-media";
import { __ as __19 } from "@wordpress/i18n";

// src/env.ts
import { parseEnv } from "@elementor/env";
var { env } = parseEnv("@elementor/editor-controls");

// src/controls/background-control/background-gradient-color-control.tsx
import * as React44 from "react";
import {
  backgroundGradientOverlayPropTypeUtil,
  colorPropTypeUtil as colorPropTypeUtil2,
  colorStopPropTypeUtil,
  gradientColorStopPropTypeUtil,
  numberPropTypeUtil as numberPropTypeUtil3,
  stringPropTypeUtil as stringPropTypeUtil8
} from "@elementor/editor-props";
import { UnstableGradientBox } from "@elementor/ui";
var BackgroundGradientColorControl = createControl(() => {
  const { value, setValue } = useBoundProp(backgroundGradientOverlayPropTypeUtil);
  const handleChange = (newValue) => {
    const transformedValue = createTransformableValue(newValue);
    if (transformedValue.positions) {
      transformedValue.positions = stringPropTypeUtil8.create(newValue.positions.join(" "));
    }
    setValue(transformedValue);
  };
  const createTransformableValue = (newValue) => ({
    ...newValue,
    type: stringPropTypeUtil8.create(newValue.type),
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
      angle: angle.value,
      stops: stops.value.map(({ value: { color, offset } }) => ({
        color: color.value,
        offset: offset.value
      })),
      positions: positions?.value.split(" ")
    };
  };
  return /* @__PURE__ */ React44.createElement(ControlActions, null, /* @__PURE__ */ React44.createElement(
    UnstableGradientBox,
    {
      sx: { width: "auto", padding: 1.5 },
      value: normalizeValue(),
      onChange: handleChange
    }
  ));
});
var initialBackgroundGradientOverlay = backgroundGradientOverlayPropTypeUtil.create({
  type: stringPropTypeUtil8.create("linear"),
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
import * as React45 from "react";
import { PinIcon, PinnedOffIcon } from "@elementor/icons";
import { Grid as Grid11 } from "@elementor/ui";
import { __ as __15 } from "@wordpress/i18n";
var attachmentControlOptions = [
  {
    value: "fixed",
    label: __15("Fixed", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(PinIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "scroll",
    label: __15("Scroll", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(PinnedOffIcon, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlayAttachment = () => {
  return /* @__PURE__ */ React45.createElement(PopoverGridContainer, null, /* @__PURE__ */ React45.createElement(Grid11, { item: true, xs: 6 }, /* @__PURE__ */ React45.createElement(ControlFormLabel, null, __15("Attachment", "elementor"))), /* @__PURE__ */ React45.createElement(Grid11, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end", overflow: "hidden" } }, /* @__PURE__ */ React45.createElement(ToggleControl, { options: attachmentControlOptions })));
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-position.tsx
import * as React46 from "react";
import { useRef as useRef9 } from "react";
import { backgroundImagePositionOffsetPropTypeUtil, stringPropTypeUtil as stringPropTypeUtil9 } from "@elementor/editor-props";
import { MenuListItem as MenuListItem5 } from "@elementor/editor-ui";
import { LetterXIcon, LetterYIcon } from "@elementor/icons";
import { Grid as Grid12, Select as Select4 } from "@elementor/ui";
import { __ as __16 } from "@wordpress/i18n";
var backgroundPositionOptions = [
  { label: __16("Center center", "elementor"), value: "center center" },
  { label: __16("Center left", "elementor"), value: "center left" },
  { label: __16("Center right", "elementor"), value: "center right" },
  { label: __16("Top center", "elementor"), value: "top center" },
  { label: __16("Top left", "elementor"), value: "top left" },
  { label: __16("Top right", "elementor"), value: "top right" },
  { label: __16("Bottom center", "elementor"), value: "bottom center" },
  { label: __16("Bottom left", "elementor"), value: "bottom left" },
  { label: __16("Bottom right", "elementor"), value: "bottom right" },
  { label: __16("Custom", "elementor"), value: "custom" }
];
var BackgroundImageOverlayPosition = () => {
  const backgroundImageOffsetContext = useBoundProp(backgroundImagePositionOffsetPropTypeUtil);
  const stringPropContext = useBoundProp(stringPropTypeUtil9);
  const isCustom = !!backgroundImageOffsetContext.value;
  const rowRef = useRef9(null);
  const handlePositionChange = (event) => {
    const value = event.target.value || null;
    if (value === "custom") {
      backgroundImageOffsetContext.setValue({ x: null, y: null });
    } else {
      stringPropContext.setValue(value);
    }
  };
  return /* @__PURE__ */ React46.createElement(Grid12, { container: true, spacing: 1.5 }, /* @__PURE__ */ React46.createElement(Grid12, { item: true, xs: 12 }, /* @__PURE__ */ React46.createElement(PopoverGridContainer, null, /* @__PURE__ */ React46.createElement(Grid12, { item: true, xs: 6 }, /* @__PURE__ */ React46.createElement(ControlFormLabel, null, __16("Position", "elementor"))), /* @__PURE__ */ React46.createElement(Grid12, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end", overflow: "hidden" } }, /* @__PURE__ */ React46.createElement(
    Select4,
    {
      fullWidth: true,
      size: "tiny",
      onChange: handlePositionChange,
      disabled: stringPropContext.disabled,
      value: (backgroundImageOffsetContext.value ? "custom" : stringPropContext.value) ?? ""
    },
    backgroundPositionOptions.map(({ label, value }) => /* @__PURE__ */ React46.createElement(MenuListItem5, { key: value, value: value ?? "" }, label))
  )))), isCustom ? /* @__PURE__ */ React46.createElement(PropProvider, { ...backgroundImageOffsetContext }, /* @__PURE__ */ React46.createElement(Grid12, { item: true, xs: 12 }, /* @__PURE__ */ React46.createElement(Grid12, { container: true, spacing: 1.5, ref: rowRef }, /* @__PURE__ */ React46.createElement(Grid12, { item: true, xs: 6 }, /* @__PURE__ */ React46.createElement(PropKeyProvider, { bind: "x" }, /* @__PURE__ */ React46.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React46.createElement(LetterXIcon, { fontSize: "tiny" }),
      anchorRef: rowRef
    }
  ))), /* @__PURE__ */ React46.createElement(Grid12, { item: true, xs: 6 }, /* @__PURE__ */ React46.createElement(PropKeyProvider, { bind: "y" }, /* @__PURE__ */ React46.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React46.createElement(LetterYIcon, { fontSize: "tiny" }),
      anchorRef: rowRef
    }
  )))))) : null);
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-repeat.tsx
import * as React47 from "react";
import { DotsHorizontalIcon, DotsVerticalIcon, GridDotsIcon, XIcon as XIcon3 } from "@elementor/icons";
import { Grid as Grid13 } from "@elementor/ui";
import { __ as __17 } from "@wordpress/i18n";
var repeatControlOptions = [
  {
    value: "repeat",
    label: __17("Repeat", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(GridDotsIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "repeat-x",
    label: __17("Repeat-x", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(DotsHorizontalIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "repeat-y",
    label: __17("Repeat-y", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(DotsVerticalIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "no-repeat",
    label: __17("No-repeat", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(XIcon3, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlayRepeat = () => {
  return /* @__PURE__ */ React47.createElement(PopoverGridContainer, null, /* @__PURE__ */ React47.createElement(Grid13, { item: true, xs: 6 }, /* @__PURE__ */ React47.createElement(ControlFormLabel, null, __17("Repeat", "elementor"))), /* @__PURE__ */ React47.createElement(Grid13, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React47.createElement(ToggleControl, { options: repeatControlOptions })));
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-size.tsx
import * as React48 from "react";
import { useRef as useRef10 } from "react";
import { backgroundImageSizeScalePropTypeUtil, stringPropTypeUtil as stringPropTypeUtil10 } from "@elementor/editor-props";
import {
  ArrowBarBothIcon,
  ArrowsMaximizeIcon,
  ArrowsMoveHorizontalIcon as ArrowsMoveHorizontalIcon2,
  ArrowsMoveVerticalIcon as ArrowsMoveVerticalIcon2,
  LetterAIcon,
  PencilIcon as PencilIcon2
} from "@elementor/icons";
import { Grid as Grid14 } from "@elementor/ui";
import { __ as __18 } from "@wordpress/i18n";
var sizeControlOptions = [
  {
    value: "auto",
    label: __18("Auto", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(LetterAIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "cover",
    label: __18("Cover", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(ArrowsMaximizeIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "contain",
    label: __18("Contain", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(ArrowBarBothIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "custom",
    label: __18("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(PencilIcon2, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlaySize = () => {
  const backgroundImageScaleContext = useBoundProp(backgroundImageSizeScalePropTypeUtil);
  const stringPropContext = useBoundProp(stringPropTypeUtil10);
  const isCustom = !!backgroundImageScaleContext.value;
  const rowRef = useRef10(null);
  const handleSizeChange = (size) => {
    if (size === "custom") {
      backgroundImageScaleContext.setValue({ width: null, height: null });
    } else {
      stringPropContext.setValue(size);
    }
  };
  return /* @__PURE__ */ React48.createElement(Grid14, { container: true, spacing: 1.5 }, /* @__PURE__ */ React48.createElement(Grid14, { item: true, xs: 12 }, /* @__PURE__ */ React48.createElement(PopoverGridContainer, null, /* @__PURE__ */ React48.createElement(Grid14, { item: true, xs: 6 }, /* @__PURE__ */ React48.createElement(ControlFormLabel, null, __18("Size", "elementor"))), /* @__PURE__ */ React48.createElement(Grid14, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React48.createElement(
    ControlToggleButtonGroup,
    {
      exclusive: true,
      items: sizeControlOptions,
      onChange: handleSizeChange,
      disabled: stringPropContext.disabled,
      value: backgroundImageScaleContext.value ? "custom" : stringPropContext.value
    }
  )))), isCustom ? /* @__PURE__ */ React48.createElement(PropProvider, { ...backgroundImageScaleContext }, /* @__PURE__ */ React48.createElement(Grid14, { item: true, xs: 12, ref: rowRef }, /* @__PURE__ */ React48.createElement(PopoverGridContainer, null, /* @__PURE__ */ React48.createElement(Grid14, { item: true, xs: 6 }, /* @__PURE__ */ React48.createElement(PropKeyProvider, { bind: "width" }, /* @__PURE__ */ React48.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React48.createElement(ArrowsMoveHorizontalIcon2, { fontSize: "tiny" }),
      extendedOptions: ["auto"],
      anchorRef: rowRef
    }
  ))), /* @__PURE__ */ React48.createElement(Grid14, { item: true, xs: 6 }, /* @__PURE__ */ React48.createElement(PropKeyProvider, { bind: "height" }, /* @__PURE__ */ React48.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React48.createElement(ArrowsMoveVerticalIcon2, { fontSize: "tiny" }),
      extendedOptions: ["auto"],
      anchorRef: rowRef
    }
  )))))) : null);
};

// src/controls/background-control/background-overlay/use-background-tabs-history.ts
import { useRef as useRef11 } from "react";
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
  const valuesHistory = useRef11({
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
  { label: __19("Thumbnail - 150 x 150", "elementor"), value: "thumbnail" },
  { label: __19("Medium - 300 x 300", "elementor"), value: "medium" },
  { label: __19("Large 1024 x 1024", "elementor"), value: "large" },
  { label: __19("Full", "elementor"), value: "full" }
];
var BackgroundOverlayRepeaterControl = createControl(() => {
  const { propType, value: overlayValues, setValue, disabled } = useBoundProp(backgroundOverlayPropTypeUtil);
  return /* @__PURE__ */ React49.createElement(PropProvider, { propType, value: overlayValues, setValue, disabled }, /* @__PURE__ */ React49.createElement(
    Repeater,
    {
      openOnAdd: true,
      disabled,
      values: overlayValues ?? [],
      setValues: setValue,
      label: __19("Overlay", "elementor"),
      itemSettings: {
        Icon: ItemIcon3,
        Label: ItemLabel3,
        Content: ItemContent3,
        initialValues: getInitialBackgroundOverlay()
      }
    }
  ));
});
var ItemContent3 = ({ anchorEl = null, bind }) => {
  return /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React49.createElement(Content3, { anchorEl }));
};
var Content3 = ({ anchorEl }) => {
  const { getTabsProps, getTabProps, getTabPanelProps } = useBackgroundTabsHistory({
    image: getInitialBackgroundOverlay().value,
    color: initialBackgroundColorOverlay.value,
    gradient: initialBackgroundGradientOverlay.value
  });
  return /* @__PURE__ */ React49.createElement(Box7, { sx: { width: "100%" } }, /* @__PURE__ */ React49.createElement(Box7, { sx: { borderBottom: 1, borderColor: "divider" } }, /* @__PURE__ */ React49.createElement(
    Tabs,
    {
      size: "small",
      variant: "fullWidth",
      ...getTabsProps(),
      "aria-label": __19("Background Overlay", "elementor")
    },
    /* @__PURE__ */ React49.createElement(Tab, { label: __19("Image", "elementor"), ...getTabProps("image") }),
    /* @__PURE__ */ React49.createElement(Tab, { label: __19("Gradient", "elementor"), ...getTabProps("gradient") }),
    /* @__PURE__ */ React49.createElement(Tab, { label: __19("Color", "elementor"), ...getTabProps("color") })
  )), /* @__PURE__ */ React49.createElement(TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("image") }, /* @__PURE__ */ React49.createElement(PopoverContent, null, /* @__PURE__ */ React49.createElement(ImageOverlayContent, null))), /* @__PURE__ */ React49.createElement(TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("gradient") }, /* @__PURE__ */ React49.createElement(BackgroundGradientColorControl, null)), /* @__PURE__ */ React49.createElement(TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("color") }, /* @__PURE__ */ React49.createElement(PopoverContent, null, /* @__PURE__ */ React49.createElement(ColorOverlayContent, { anchorEl }))));
};
var ItemIcon3 = ({ value }) => {
  switch (value.$$type) {
    case "background-image-overlay":
      return /* @__PURE__ */ React49.createElement(ItemIconImage, { value });
    case "background-color-overlay":
      return /* @__PURE__ */ React49.createElement(ItemIconColor, { value });
    case "background-gradient-overlay":
      return /* @__PURE__ */ React49.createElement(ItemIconGradient, { value });
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
  return /* @__PURE__ */ React49.createElement(StyledUnstableColorIndicator, { size: "inherit", component: "span", value: color });
};
var ItemIconImage = ({ value }) => {
  const { imageUrl } = useImage(value);
  return /* @__PURE__ */ React49.createElement(
    CardMedia3,
    {
      image: imageUrl,
      sx: (theme) => ({
        height: "1em",
        width: "1em",
        borderRadius: `${theme.shape.borderRadius / 2}px`,
        outline: `1px solid ${theme.palette.action.disabled}`
      })
    }
  );
};
var ItemIconGradient = ({ value }) => {
  const gradient = getGradientValue(value);
  return /* @__PURE__ */ React49.createElement(StyledUnstableColorIndicator, { size: "inherit", component: "span", value: gradient });
};
var ItemLabel3 = ({ value }) => {
  switch (value.$$type) {
    case "background-image-overlay":
      return /* @__PURE__ */ React49.createElement(ItemLabelImage, { value });
    case "background-color-overlay":
      return /* @__PURE__ */ React49.createElement(ItemLabelColor, { value });
    case "background-gradient-overlay":
      return /* @__PURE__ */ React49.createElement(ItemLabelGradient, { value });
    default:
      return null;
  }
};
var ItemLabelColor = ({ value: prop }) => {
  const color = extractColorFrom(prop);
  return /* @__PURE__ */ React49.createElement("span", null, color);
};
var ItemLabelImage = ({ value }) => {
  const { imageTitle } = useImage(value);
  return /* @__PURE__ */ React49.createElement("span", null, imageTitle);
};
var ItemLabelGradient = ({ value }) => {
  if (value.value.type.value === "linear") {
    return /* @__PURE__ */ React49.createElement("span", null, __19("Linear Gradient", "elementor"));
  }
  return /* @__PURE__ */ React49.createElement("span", null, __19("Radial Gradient", "elementor"));
};
var ColorOverlayContent = ({ anchorEl }) => {
  const propContext = useBoundProp(backgroundColorOverlayPropTypeUtil2);
  return /* @__PURE__ */ React49.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "color" }, /* @__PURE__ */ React49.createElement(ColorControl, { anchorEl })));
};
var ImageOverlayContent = () => {
  const propContext = useBoundProp(backgroundImageOverlayPropTypeUtil2);
  return /* @__PURE__ */ React49.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "image" }, /* @__PURE__ */ React49.createElement(Grid15, { container: true, spacing: 1, alignItems: "center" }, /* @__PURE__ */ React49.createElement(Grid15, { item: true, xs: 12 }, /* @__PURE__ */ React49.createElement(
    ImageControl,
    {
      resolutionLabel: __19("Resolution", "elementor"),
      sizes: backgroundResolutionOptions
    }
  )))), /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "position" }, /* @__PURE__ */ React49.createElement(BackgroundImageOverlayPosition, null)), /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "repeat" }, /* @__PURE__ */ React49.createElement(BackgroundImageOverlayRepeat, null)), /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "size" }, /* @__PURE__ */ React49.createElement(BackgroundImageOverlaySize, null)), /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "attachment" }, /* @__PURE__ */ React49.createElement(BackgroundImageOverlayAttachment, null)));
};
var StyledUnstableColorIndicator = styled5(UnstableColorIndicator2)(({ theme }) => ({
  borderRadius: `${theme.shape.borderRadius / 2}px`
}));
var useImage = (image) => {
  let imageTitle, imageUrl = null;
  const imageSrc = image?.value.image.value?.src.value;
  const { data: attachment } = useWpMediaAttachment3(imageSrc.id?.value || null);
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
var BackgroundControl = createControl(() => {
  const propContext = useBoundProp(backgroundPropTypeUtil);
  const isUsingNestedProps = isExperimentActive4("e_v_3_30");
  const colorLabel = __20("Color", "elementor");
  return /* @__PURE__ */ React50.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React50.createElement(PropKeyProvider, { bind: "background-overlay" }, /* @__PURE__ */ React50.createElement(BackgroundOverlayRepeaterControl, null)), /* @__PURE__ */ React50.createElement(PropKeyProvider, { bind: "color" }, /* @__PURE__ */ React50.createElement(Grid16, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React50.createElement(Grid16, { item: true, xs: 6 }, isUsingNestedProps ? /* @__PURE__ */ React50.createElement(ControlLabel, null, colorLabel) : /* @__PURE__ */ React50.createElement(ControlFormLabel, null, colorLabel)), /* @__PURE__ */ React50.createElement(Grid16, { item: true, xs: 6 }, /* @__PURE__ */ React50.createElement(ColorControl, null)))));
});

// src/controls/switch-control.tsx
import * as React51 from "react";
import { booleanPropTypeUtil as booleanPropTypeUtil2 } from "@elementor/editor-props";
import { Switch as Switch2 } from "@elementor/ui";
var SwitchControl2 = createControl(() => {
  const { value, setValue, disabled } = useBoundProp(booleanPropTypeUtil2);
  const handleChange = (event) => {
    setValue(event.target.checked);
  };
  return /* @__PURE__ */ React51.createElement("div", { style: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React51.createElement(Switch2, { checked: !!value, onChange: handleChange, size: "small", disabled }));
});

// src/controls/repeatable-control.tsx
import * as React52 from "react";
import { useMemo as useMemo4 } from "react";
import { createArrayPropUtils } from "@elementor/editor-props";
import { Box as Box8 } from "@elementor/ui";

// src/hooks/use-repeatable-control-context.ts
import { createContext as createContext6, useContext as useContext6 } from "react";
var RepeatableControlContext = createContext6(void 0);
var useRepeatableControlContext = () => {
  const context = useContext6(RepeatableControlContext);
  if (!context) {
    throw new Error("useRepeatableControlContext must be used within RepeatableControl");
  }
  return context;
};

// src/controls/repeatable-control.tsx
var RepeatableControl = createControl(
  ({
    repeaterLabel,
    childControlConfig,
    showDuplicate,
    showToggle,
    initialValues,
    patternLabel,
    placeholder
  }) => {
    const { propTypeUtil: childPropTypeUtil } = childControlConfig;
    if (!childPropTypeUtil) {
      return null;
    }
    const childArrayPropTypeUtil = useMemo4(
      () => createArrayPropUtils(childPropTypeUtil.key, childPropTypeUtil.schema),
      [childPropTypeUtil.key, childPropTypeUtil.schema]
    );
    const { propType, value, setValue } = useBoundProp(childArrayPropTypeUtil);
    const ItemLabel4 = ({ value: itemValue }) => {
      const pattern = patternLabel || "";
      const finalLabel = interpolate(pattern, itemValue.value);
      if (finalLabel) {
        return /* @__PURE__ */ React52.createElement("span", null, finalLabel);
      }
      return /* @__PURE__ */ React52.createElement(Box8, { component: "span", color: "text.tertiary" }, placeholder);
    };
    return /* @__PURE__ */ React52.createElement(PropProvider, { propType, value, setValue }, /* @__PURE__ */ React52.createElement(RepeatableControlContext.Provider, { value: childControlConfig }, /* @__PURE__ */ React52.createElement(
      Repeater,
      {
        openOnAdd: true,
        values: value ?? [],
        setValues: setValue,
        label: repeaterLabel,
        isSortable: false,
        itemSettings: {
          Icon: ItemIcon4,
          Label: ItemLabel4,
          Content: ItemContent4,
          initialValues: childPropTypeUtil.create(initialValues || null)
        },
        showDuplicate,
        showToggle
      }
    )));
  }
);
var ItemContent4 = ({ bind }) => {
  return /* @__PURE__ */ React52.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React52.createElement(Content4, null));
};
var ItemIcon4 = () => /* @__PURE__ */ React52.createElement(React52.Fragment, null);
var Content4 = () => {
  const { component: ChildControl, props = {} } = useRepeatableControlContext();
  return /* @__PURE__ */ React52.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React52.createElement(PopoverGridContainer, null, /* @__PURE__ */ React52.createElement(ChildControl, { ...props })));
};
var interpolate = (template, data) => {
  if (Object.values(data).some((value) => value.value === "" || value === "")) {
    return null;
  }
  return new Function(...Object.keys(data), `return \`${template}\`;`)(...Object.values(data));
};

// src/controls/key-value-control.tsx
import * as React53 from "react";
import { useMemo as useMemo5, useState as useState11 } from "react";
import { keyValuePropTypeUtil } from "@elementor/editor-props";
import { FormHelperText, FormLabel as FormLabel3, Grid as Grid17, TextField as TextField9 } from "@elementor/ui";
import { __ as __21 } from "@wordpress/i18n";
var KeyValueControl = createControl((props = {}) => {
  const { value, setValue } = useBoundProp(keyValuePropTypeUtil);
  const [keyError, setKeyError] = useState11(null);
  const [valueError, setValueError] = useState11(null);
  const [sessionState, setSessionState] = useState11({
    key: value?.key?.value || "",
    value: value?.value?.value || ""
  });
  const keyLabel = props.keyName || __21("Key", "elementor");
  const valueLabel = props.valueName || __21("Value", "elementor");
  const [keyRegex, valueRegex, errMsg] = useMemo5(
    () => [
      props.regexKey ? new RegExp(props.regexKey) : void 0,
      props.regexValue ? new RegExp(props.regexValue) : void 0,
      props.validationErrorMessage || __21("Invalid Format", "elementor")
    ],
    [props.regexKey, props.regexValue, props.validationErrorMessage]
  );
  const validate = (newValue, fieldType) => {
    if (fieldType === "key" && keyRegex) {
      const isValid = keyRegex.test(newValue);
      setKeyError(isValid ? null : errMsg);
      return isValid;
    } else if (fieldType === "value" && valueRegex) {
      const isValid = valueRegex.test(newValue);
      setValueError(isValid ? null : errMsg);
      return isValid;
    }
    return true;
  };
  const handleChange = (event, fieldType) => {
    const newValue = event.target.value;
    setSessionState((prev) => ({
      ...prev,
      [fieldType]: newValue
    }));
    if (validate(newValue, fieldType)) {
      setValue({
        ...value,
        [fieldType]: {
          value: newValue,
          $$type: "string"
        }
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
  const isKeyInvalid = keyError !== null;
  const isValueInvalid = valueError !== null;
  return /* @__PURE__ */ React53.createElement(ControlActions, null, /* @__PURE__ */ React53.createElement(Grid17, { container: true, gap: 1.5 }, /* @__PURE__ */ React53.createElement(Grid17, { item: true, xs: 12 }, /* @__PURE__ */ React53.createElement(FormLabel3, { size: "tiny" }, keyLabel), /* @__PURE__ */ React53.createElement(
    TextField9,
    {
      autoFocus: true,
      sx: { pt: 1 },
      size: "tiny",
      fullWidth: true,
      value: sessionState.key,
      onChange: (e) => handleChange(e, "key"),
      error: isKeyInvalid
    }
  ), isKeyInvalid && /* @__PURE__ */ React53.createElement(FormHelperText, { error: true }, keyError)), /* @__PURE__ */ React53.createElement(Grid17, { item: true, xs: 12 }, /* @__PURE__ */ React53.createElement(FormLabel3, { size: "tiny" }, valueLabel), /* @__PURE__ */ React53.createElement(
    TextField9,
    {
      sx: { pt: 1 },
      size: "tiny",
      fullWidth: true,
      value: sessionState.value,
      onChange: (e) => handleChange(e, "value"),
      disabled: isKeyInvalid,
      error: isValueInvalid
    }
  ), isValueInvalid && /* @__PURE__ */ React53.createElement(FormHelperText, { error: true }, valueError))));
});

// src/controls/position-control.tsx
import * as React54 from "react";
import { useMemo as useMemo6 } from "react";
import { positionPropTypeUtil, stringPropTypeUtil as stringPropTypeUtil11 } from "@elementor/editor-props";
import { MenuListItem as MenuListItem6 } from "@elementor/editor-ui";
import { isExperimentActive as isExperimentActive5 } from "@elementor/editor-v1-adapters";
import { LetterXIcon as LetterXIcon2, LetterYIcon as LetterYIcon2 } from "@elementor/icons";
import { Grid as Grid18, Select as Select5 } from "@elementor/ui";
import { __ as __22 } from "@wordpress/i18n";
var positionOptions = [
  { label: __22("Center center", "elementor"), value: "center center" },
  { label: __22("Center left", "elementor"), value: "center left" },
  { label: __22("Center right", "elementor"), value: "center right" },
  { label: __22("Top center", "elementor"), value: "top center" },
  { label: __22("Top left", "elementor"), value: "top left" },
  { label: __22("Top right", "elementor"), value: "top right" },
  { label: __22("Bottom center", "elementor"), value: "bottom center" },
  { label: __22("Bottom left", "elementor"), value: "bottom left" },
  { label: __22("Bottom right", "elementor"), value: "bottom right" }
];
var PositionControl = () => {
  const positionContext = useBoundProp(positionPropTypeUtil);
  const stringPropContext = useBoundProp(stringPropTypeUtil11);
  const isVersion331Active = isExperimentActive5("e_v_3_31");
  const isCustom = !!positionContext.value && isVersion331Active;
  const availablePositionOptions = useMemo6(() => {
    const options = [...positionOptions];
    if (isVersion331Active) {
      options.push({ label: __22("Custom", "elementor"), value: "custom" });
    }
    return options;
  }, [isVersion331Active]);
  const handlePositionChange = (event) => {
    const value = event.target.value || null;
    if (value === "custom" && isVersion331Active) {
      positionContext.setValue({ x: null, y: null });
    } else {
      stringPropContext.setValue(value);
    }
  };
  return /* @__PURE__ */ React54.createElement(Grid18, { container: true, spacing: 1.5 }, /* @__PURE__ */ React54.createElement(Grid18, { item: true, xs: 12 }, /* @__PURE__ */ React54.createElement(Grid18, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React54.createElement(Grid18, { item: true, xs: 6 }, /* @__PURE__ */ React54.createElement(ControlFormLabel, null, __22("Object position", "elementor"))), /* @__PURE__ */ React54.createElement(Grid18, { item: true, xs: 6, sx: { overflow: "hidden" } }, /* @__PURE__ */ React54.createElement(
    Select5,
    {
      size: "tiny",
      disabled: stringPropContext.disabled,
      value: (positionContext.value ? "custom" : stringPropContext.value) ?? "",
      onChange: handlePositionChange,
      fullWidth: true
    },
    availablePositionOptions.map(({ label, value }) => /* @__PURE__ */ React54.createElement(MenuListItem6, { key: value, value: value ?? "" }, label))
  )))), isCustom && /* @__PURE__ */ React54.createElement(PropProvider, { ...positionContext }, /* @__PURE__ */ React54.createElement(Grid18, { item: true, xs: 12 }, /* @__PURE__ */ React54.createElement(Grid18, { container: true, spacing: 1.5 }, /* @__PURE__ */ React54.createElement(Grid18, { item: true, xs: 6 }, /* @__PURE__ */ React54.createElement(PropKeyProvider, { bind: "x" }, /* @__PURE__ */ React54.createElement(SizeControl, { startIcon: /* @__PURE__ */ React54.createElement(LetterXIcon2, { fontSize: "tiny" }) }))), /* @__PURE__ */ React54.createElement(Grid18, { item: true, xs: 6 }, /* @__PURE__ */ React54.createElement(PropKeyProvider, { bind: "y" }, /* @__PURE__ */ React54.createElement(SizeControl, { startIcon: /* @__PURE__ */ React54.createElement(LetterYIcon2, { fontSize: "tiny" }) })))))));
};
export {
  AspectRatioControl,
  BackgroundControl,
  BoxShadowRepeaterControl,
  ColorControl,
  ControlActionsProvider,
  ControlAdornments,
  ControlAdornmentsProvider,
  ControlFormLabel,
  ControlReplacementsProvider,
  ControlToggleButtonGroup,
  EqualUnequalSizesControl,
  FilterRepeaterControl,
  FontFamilyControl,
  FontFamilySelector,
  GapControl,
  ImageControl,
  KeyValueControl,
  LinkControl,
  LinkedDimensionsControl,
  NumberControl,
  PopoverContent,
  PositionControl,
  PropKeyProvider,
  PropProvider,
  RepeatableControl,
  SelectControl,
  SizeControl,
  StrokeControl,
  SvgMediaControl,
  SwitchControl2 as SwitchControl,
  TextAreaControl,
  TextControl,
  ToggleControl,
  UrlControl,
  createControlReplacementsRegistry,
  injectIntoRepeaterItemIcon,
  injectIntoRepeaterItemLabel,
  useBoundProp,
  useControlActions,
  useSyncExternalState
};
//# sourceMappingURL=index.mjs.map