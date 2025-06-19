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
  AspectRatioControl: () => AspectRatioControl,
  BackgroundControl: () => BackgroundControl,
  BoxShadowRepeaterControl: () => BoxShadowRepeaterControl,
  ColorControl: () => ColorControl,
  ControlActionsProvider: () => ControlActionsProvider,
  ControlAdornments: () => ControlAdornments,
  ControlAdornmentsProvider: () => ControlAdornmentsProvider,
  ControlFormLabel: () => ControlFormLabel,
  ControlReplacementsProvider: () => ControlReplacementsProvider,
  ControlToggleButtonGroup: () => ControlToggleButtonGroup,
  EqualUnequalSizesControl: () => EqualUnequalSizesControl,
  FilterRepeaterControl: () => FilterRepeaterControl,
  FontFamilyControl: () => FontFamilyControl,
  FontFamilySelector: () => FontFamilySelector,
  GapControl: () => GapControl,
  ImageControl: () => ImageControl,
  KeyValueControl: () => KeyValueControl,
  LinkControl: () => LinkControl,
  LinkedDimensionsControl: () => LinkedDimensionsControl,
  NumberControl: () => NumberControl,
  PopoverContent: () => PopoverContent,
  PositionControl: () => PositionControl,
  PropKeyProvider: () => PropKeyProvider,
  PropProvider: () => PropProvider,
  RepeatableControl: () => RepeatableControl,
  SelectControl: () => SelectControl,
  SizeControl: () => SizeControl,
  StrokeControl: () => StrokeControl,
  SvgMediaControl: () => SvgMediaControl,
  SwitchControl: () => SwitchControl2,
  TextAreaControl: () => TextAreaControl,
  TextControl: () => TextControl,
  ToggleControl: () => ToggleControl,
  UrlControl: () => UrlControl,
  createControlReplacementsRegistry: () => createControlReplacementsRegistry,
  injectIntoRepeaterItemIcon: () => injectIntoRepeaterItemIcon,
  injectIntoRepeaterItemLabel: () => injectIntoRepeaterItemLabel,
  useBoundProp: () => useBoundProp,
  useControlActions: () => useControlActions,
  useSyncExternalState: () => useSyncExternalState
});
module.exports = __toCommonJS(index_exports);

// src/controls/image-control.tsx
var React10 = __toESM(require("react"));
var import_editor_props3 = require("@elementor/editor-props");
var import_ui6 = require("@elementor/ui");
var import_i18n2 = require("@wordpress/i18n");

// src/bound-prop-context/prop-context.tsx
var React = __toESM(require("react"));
var import_react = require("react");

// src/bound-prop-context/errors.ts
var import_utils = require("@elementor/utils");
var MissingPropTypeError = (0, import_utils.createError)({
  code: "missing_prop_provider_prop_type",
  message: "Prop type is missing"
});
var UnsupportedParentError = (0, import_utils.createError)({
  code: "unsupported_prop_provider_prop_type",
  message: "Parent prop type is not supported"
});
var HookOutsideProviderError = (0, import_utils.createError)({
  code: "hook_outside_provider",
  message: "Hook used outside of provider"
});

// src/bound-prop-context/prop-context.tsx
var PropContext = (0, import_react.createContext)(null);
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
  const context = (0, import_react.useContext)(PropContext);
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
var React2 = __toESM(require("react"));
var import_react2 = require("react");
var PropKeyContext = (0, import_react2.createContext)(null);
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
  const { path } = (0, import_react2.useContext)(PropKeyContext) ?? {};
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
  const { path } = (0, import_react2.useContext)(PropKeyContext) ?? {};
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
  const context = (0, import_react2.useContext)(PropKeyContext);
  if (!context) {
    throw new HookOutsideProviderError({
      context: { hook: "usePropKeyContext", provider: "PropKeyProvider" }
    });
  }
  return context;
};

// src/bound-prop-context/use-bound-prop.ts
var import_react3 = require("react");
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
  const [isValid, setIsValid] = (0, import_react3.useState)(true);
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
var React3 = __toESM(require("react"));
var import_ui = require("@elementor/ui");
var ControlFormLabel = (props) => {
  return /* @__PURE__ */ React3.createElement(import_ui.FormLabel, { size: "tiny", ...props });
};

// src/create-control.tsx
var React5 = __toESM(require("react"));
var import_ui2 = require("@elementor/ui");

// src/control-replacements.tsx
var React4 = __toESM(require("react"));
var import_react4 = require("react");
var ControlReplacementContext = (0, import_react4.createContext)([]);
var ControlReplacementsProvider = ({ replacements, children }) => {
  return /* @__PURE__ */ React4.createElement(ControlReplacementContext.Provider, { value: replacements }, children);
};
var useControlReplacement = (OriginalComponent) => {
  const { value } = useBoundProp();
  const replacements = (0, import_react4.useContext)(ControlReplacementContext);
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
    return /* @__PURE__ */ React5.createElement(import_ui2.ErrorBoundary, { fallback: null }, /* @__PURE__ */ React5.createElement(Component, { ...props }));
  };
}

// src/hooks/use-unfiltered-files-upload.ts
var import_query = require("@elementor/query");

// src/api.ts
var import_http_client = require("@elementor/http-client");
var ELEMENTOR_SETTING_URL = "elementor/v1/settings";
var apiClient = {
  getElementorSetting: (key) => (0, import_http_client.httpService)().get(`${ELEMENTOR_SETTING_URL}/${key}`).then((res) => formatSettingResponse(res.data)),
  updateElementorSetting: (key, value) => (0, import_http_client.httpService)().put(`${ELEMENTOR_SETTING_URL}/${key}`, { value })
};
var formatSettingResponse = (response) => response.data.value;

// src/hooks/use-unfiltered-files-upload.ts
var UNFILTERED_FILES_UPLOAD_KEY = "elementor_unfiltered_files_upload";
var unfilteredFilesQueryKey = {
  queryKey: [UNFILTERED_FILES_UPLOAD_KEY]
};
var useUnfilteredFilesUpload = () => (0, import_query.useQuery)({
  ...unfilteredFilesQueryKey,
  queryFn: () => apiClient.getElementorSetting(UNFILTERED_FILES_UPLOAD_KEY).then((res) => {
    return formatResponse(res);
  }),
  staleTime: Infinity
});
function useUpdateUnfilteredFilesUpload() {
  const queryClient = (0, import_query.useQueryClient)();
  const mutate = (0, import_query.useMutation)({
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
var React8 = __toESM(require("react"));
var import_editor_props = require("@elementor/editor-props");
var import_icons = require("@elementor/icons");
var import_ui4 = require("@elementor/ui");
var import_wp_media = require("@elementor/wp-media");
var import_i18n = require("@wordpress/i18n");

// src/control-actions/control-actions.tsx
var React7 = __toESM(require("react"));
var import_ui3 = require("@elementor/ui");

// src/control-actions/control-actions-context.tsx
var React6 = __toESM(require("react"));
var import_react5 = require("react");
var Context = (0, import_react5.createContext)(null);
var ControlActionsProvider = ({ children, items }) => /* @__PURE__ */ React6.createElement(Context.Provider, { value: { items } }, children);
var useControlActions = () => {
  const context = (0, import_react5.useContext)(Context);
  if (!context) {
    throw new Error("useControlActions must be used within a ControlActionsProvider");
  }
  return context;
};

// src/control-actions/control-actions.tsx
var FloatingBarContainer = (0, import_ui3.styled)("span")`
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
  return /* @__PURE__ */ React7.createElement(FloatingBarContainer, null, /* @__PURE__ */ React7.createElement(import_ui3.UnstableFloatingActionBar, { actions: menuItems }, children));
}

// src/controls/image-media-control.tsx
var ImageMediaControl = createControl(({ mediaTypes = ["image"] }) => {
  const { value, setValue } = useBoundProp(import_editor_props.imageSrcPropTypeUtil);
  const { id, url } = value ?? {};
  const { data: attachment, isFetching } = (0, import_wp_media.useWpMediaAttachment)(id?.value || null);
  const src = attachment?.url ?? url?.value ?? null;
  const { open } = (0, import_wp_media.useWpMediaFrame)({
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
  return /* @__PURE__ */ React8.createElement(ControlActions, null, /* @__PURE__ */ React8.createElement(import_ui4.Card, { variant: "outlined" }, /* @__PURE__ */ React8.createElement(import_ui4.CardMedia, { image: src, sx: { height: 150 } }, isFetching ? /* @__PURE__ */ React8.createElement(import_ui4.Stack, { justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }, /* @__PURE__ */ React8.createElement(import_ui4.CircularProgress, null)) : /* @__PURE__ */ React8.createElement(React8.Fragment, null)), /* @__PURE__ */ React8.createElement(import_ui4.CardOverlay, null, /* @__PURE__ */ React8.createElement(import_ui4.Stack, { gap: 1 }, /* @__PURE__ */ React8.createElement(
    import_ui4.Button,
    {
      size: "tiny",
      color: "inherit",
      variant: "outlined",
      onClick: () => open({ mode: "browse" })
    },
    (0, import_i18n.__)("Select image", "elementor")
  ), /* @__PURE__ */ React8.createElement(
    import_ui4.Button,
    {
      size: "tiny",
      variant: "text",
      color: "inherit",
      startIcon: /* @__PURE__ */ React8.createElement(import_icons.UploadIcon, null),
      onClick: () => open({ mode: "upload" })
    },
    (0, import_i18n.__)("Upload", "elementor")
  )))));
});

// src/controls/select-control.tsx
var React9 = __toESM(require("react"));
var import_editor_props2 = require("@elementor/editor-props");
var import_editor_ui = require("@elementor/editor-ui");
var import_ui5 = require("@elementor/ui");
var SelectControl = createControl(({ options, onChange }) => {
  const { value, setValue, disabled } = useBoundProp(import_editor_props2.stringPropTypeUtil);
  const handleChange = (event) => {
    const newValue = event.target.value || null;
    onChange?.(newValue, value);
    setValue(newValue);
  };
  return /* @__PURE__ */ React9.createElement(ControlActions, null, /* @__PURE__ */ React9.createElement(
    import_ui5.Select,
    {
      sx: { overflow: "hidden" },
      displayEmpty: true,
      size: "tiny",
      value: value ?? "",
      onChange: handleChange,
      disabled,
      fullWidth: true
    },
    options.map(({ label, ...props }) => /* @__PURE__ */ React9.createElement(import_editor_ui.MenuListItem, { key: props.value, ...props, value: props.value ?? "" }, label))
  ));
});

// src/controls/image-control.tsx
var ImageControl = createControl(
  ({ sizes, resolutionLabel = (0, import_i18n2.__)("Image resolution", "elementor"), showMode = "all" }) => {
    const propContext = useBoundProp(import_editor_props3.imagePropTypeUtil);
    const { data: allowSvgUpload } = useUnfilteredFilesUpload();
    const mediaTypes = allowSvgUpload ? ["image", "svg"] : ["image"];
    return /* @__PURE__ */ React10.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React10.createElement(import_ui6.Stack, { gap: 1.5 }, ["all", "media"].includes(showMode) ? /* @__PURE__ */ React10.createElement(PropKeyProvider, { bind: "src" }, /* @__PURE__ */ React10.createElement(ControlFormLabel, null, (0, import_i18n2.__)("Image", "elementor")), /* @__PURE__ */ React10.createElement(ImageMediaControl, { mediaTypes })) : null, ["all", "sizes"].includes(showMode) ? /* @__PURE__ */ React10.createElement(PropKeyProvider, { bind: "size" }, /* @__PURE__ */ React10.createElement(import_ui6.Grid, { container: true, gap: 1.5, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React10.createElement(import_ui6.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React10.createElement(ControlFormLabel, null, resolutionLabel)), /* @__PURE__ */ React10.createElement(import_ui6.Grid, { item: true, xs: 6, sx: { overflow: "hidden" } }, /* @__PURE__ */ React10.createElement(SelectControl, { options: sizes })))) : null));
  }
);

// src/controls/text-control.tsx
var React11 = __toESM(require("react"));
var import_editor_props4 = require("@elementor/editor-props");
var import_ui7 = require("@elementor/ui");
var TextControl = createControl(({ placeholder }) => {
  const { value, setValue, disabled } = useBoundProp(import_editor_props4.stringPropTypeUtil);
  const handleChange = (event) => setValue(event.target.value);
  return /* @__PURE__ */ React11.createElement(ControlActions, null, /* @__PURE__ */ React11.createElement(
    import_ui7.TextField,
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
var React12 = __toESM(require("react"));
var import_editor_props5 = require("@elementor/editor-props");
var import_ui8 = require("@elementor/ui");
var TextAreaControl = createControl(({ placeholder }) => {
  const { value, setValue, disabled } = useBoundProp(import_editor_props5.stringPropTypeUtil);
  const handleChange = (event) => {
    setValue(event.target.value);
  };
  return /* @__PURE__ */ React12.createElement(ControlActions, null, /* @__PURE__ */ React12.createElement(
    import_ui8.TextField,
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
var React16 = __toESM(require("react"));
var import_react10 = require("react");
var import_editor_props6 = require("@elementor/editor-props");
var import_editor_responsive = require("@elementor/editor-responsive");
var import_ui12 = require("@elementor/ui");

// src/components/size-control/size-input.tsx
var React14 = __toESM(require("react"));
var import_react7 = require("react");
var import_icons2 = require("@elementor/icons");
var import_ui10 = require("@elementor/ui");

// src/utils/size-control.ts
var defaultUnits = ["px", "%", "em", "rem", "vw", "vh"];
var defaultExtendedOptions = ["auto", "custom"];
function isUnitExtendedOption(unit) {
  return defaultExtendedOptions.includes(unit);
}

// src/components/size-control/text-field-inner-selection.tsx
var React13 = __toESM(require("react"));
var import_react6 = require("react");
var import_editor_ui2 = require("@elementor/editor-ui");
var import_ui9 = require("@elementor/ui");
var TextFieldInnerSelection = (0, import_react6.forwardRef)(
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
      import_ui9.TextField,
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
  const popupState = (0, import_ui9.usePopupState)({
    variant: "popover",
    popupId: (0, import_react6.useId)()
  });
  const handleMenuItemClick = (index) => {
    onClick(options[index]);
    popupState.close();
  };
  return /* @__PURE__ */ React13.createElement(import_ui9.InputAdornment, { position: "end" }, /* @__PURE__ */ React13.createElement(
    import_ui9.Button,
    {
      size: "small",
      color: "secondary",
      disabled,
      sx: { font: "inherit", minWidth: "initial", textTransform: "uppercase" },
      ...(0, import_ui9.bindTrigger)(popupState)
    },
    alternativeOptionLabels[value] ?? value
  ), /* @__PURE__ */ React13.createElement(import_ui9.Menu, { MenuListProps: { dense: true }, ...(0, import_ui9.bindMenu)(popupState) }, options.map((option, index) => /* @__PURE__ */ React13.createElement(
    import_editor_ui2.MenuListItem,
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
  const unitInputBufferRef = (0, import_react7.useRef)("");
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
    startAdornment: startIcon ? /* @__PURE__ */ React14.createElement(import_ui10.InputAdornment, { position: "start", disabled }, startIcon) : void 0,
    endAdornment: /* @__PURE__ */ React14.createElement(
      SelectionEndAdornment,
      {
        disabled,
        options: units2,
        onClick: handleUnitChange,
        value: unit,
        alternativeOptionLabels: {
          custom: /* @__PURE__ */ React14.createElement(import_icons2.PencilIcon, { fontSize: "small" })
        },
        menuItemsAttributes: units2.includes("custom") ? {
          custom: popupAttributes
        } : void 0
      }
    )
  };
  return /* @__PURE__ */ React14.createElement(ControlActions, null, /* @__PURE__ */ React14.createElement(import_ui10.Box, null, /* @__PURE__ */ React14.createElement(
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
var React15 = __toESM(require("react"));
var import_ui11 = require("@elementor/ui");
var TextFieldPopover = (props) => {
  const { popupState, restoreValue, anchorRef, value, onChange } = props;
  return /* @__PURE__ */ React15.createElement(
    import_ui11.Popover,
    {
      disablePortal: true,
      ...(0, import_ui11.bindPopover)(popupState),
      anchorOrigin: { vertical: "bottom", horizontal: "center" },
      transformOrigin: { vertical: "top", horizontal: "center" },
      onClose: () => {
        restoreValue();
        popupState.close();
      }
    },
    /* @__PURE__ */ React15.createElement(
      import_ui11.Paper,
      {
        sx: {
          width: anchorRef.current?.offsetWidth + "px",
          borderRadius: 2,
          p: 1.5
        }
      },
      /* @__PURE__ */ React15.createElement(
        import_ui11.TextField,
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
var import_react8 = require("react");
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var EXPERIMENT_ID = "e_v_3_30";
function useSizeExtendedOptions(options, disableCustom) {
  return (0, import_react8.useMemo)(() => {
    const isVersion330Active = (0, import_editor_v1_adapters.isExperimentActive)(EXPERIMENT_ID);
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
var import_react9 = require("react");
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
  const [internal, setInternal] = (0, import_react9.useState)(toInternal(external, null));
  (0, import_react9.useEffect)(() => {
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
  const { value: sizeValue, setValue: setSizeValue, disabled, restoreValue } = useBoundProp(import_editor_props6.sizePropTypeUtil);
  const [internalState, setInternalState] = (0, import_react10.useState)(createStateFromSizeProp(sizeValue, defaultUnit));
  const activeBreakpoint = (0, import_editor_responsive.useActiveBreakpoint)();
  const extendedOptions = useSizeExtendedOptions(props.extendedOptions || [], props.disableCustom ?? false);
  const popupState = (0, import_ui12.usePopupState)({ variant: "popover" });
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
  (0, import_react10.useEffect)(() => {
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
  (0, import_react10.useEffect)(() => {
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
var React19 = __toESM(require("react"));
var import_react11 = require("react");
var import_editor_props8 = require("@elementor/editor-props");
var import_ui15 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");

// src/components/section-content.tsx
var React17 = __toESM(require("react"));
var import_ui13 = require("@elementor/ui");
var SectionContent = ({ gap = 2, sx, children }) => /* @__PURE__ */ React17.createElement(import_ui13.Stack, { gap, sx: { ...sx } }, children);

// src/controls/color-control.tsx
var React18 = __toESM(require("react"));
var import_editor_props7 = require("@elementor/editor-props");
var import_ui14 = require("@elementor/ui");
var ColorControl = createControl(
  ({ propTypeUtil = import_editor_props7.colorPropTypeUtil, anchorEl, slotProps = {}, ...props }) => {
    const { value, setValue, disabled } = useBoundProp(propTypeUtil);
    const handleChange = (selectedColor) => {
      setValue(selectedColor || null);
    };
    return /* @__PURE__ */ React18.createElement(ControlActions, null, /* @__PURE__ */ React18.createElement(
      import_ui14.UnstableColorField,
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
  const propContext = useBoundProp(import_editor_props8.strokePropTypeUtil);
  const rowRef = (0, import_react11.useRef)(null);
  return /* @__PURE__ */ React19.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React19.createElement(SectionContent, null, /* @__PURE__ */ React19.createElement(Control, { bind: "width", label: (0, import_i18n3.__)("Stroke width", "elementor"), ref: rowRef }, /* @__PURE__ */ React19.createElement(SizeControl, { units, anchorRef: rowRef })), /* @__PURE__ */ React19.createElement(Control, { bind: "color", label: (0, import_i18n3.__)("Stroke color", "elementor") }, /* @__PURE__ */ React19.createElement(ColorControl, null))));
});
var Control = (0, import_react11.forwardRef)(({ bind, label, children }, ref) => /* @__PURE__ */ React19.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React19.createElement(import_ui15.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap", ref }, /* @__PURE__ */ React19.createElement(import_ui15.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React19.createElement(ControlFormLabel, null, label)), /* @__PURE__ */ React19.createElement(import_ui15.Grid, { item: true, xs: 6 }, children))));

// src/controls/box-shadow-repeater-control.tsx
var React26 = __toESM(require("react"));
var import_react15 = require("react");
var import_editor_props9 = require("@elementor/editor-props");
var import_ui20 = require("@elementor/ui");
var import_i18n5 = require("@wordpress/i18n");

// src/components/popover-content.tsx
var React20 = __toESM(require("react"));
var import_ui16 = require("@elementor/ui");
var PopoverContent = ({ gap = 1.5, children, ...props }) => /* @__PURE__ */ React20.createElement(import_ui16.Stack, { ...props, gap }, children);

// src/components/popover-grid-container.tsx
var import_react12 = require("react");
var React21 = __toESM(require("react"));
var import_ui17 = require("@elementor/ui");
var PopoverGridContainer = (0, import_react12.forwardRef)(
  ({ gap = 1.5, alignItems = "center", flexWrap = "nowrap", children }, ref) => /* @__PURE__ */ React21.createElement(import_ui17.Grid, { container: true, gap, alignItems, flexWrap, ref }, children)
);

// src/components/repeater.tsx
var React25 = __toESM(require("react"));
var import_react14 = require("react");
var import_icons4 = require("@elementor/icons");
var import_ui19 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");

// src/control-adornments/control-adornments.tsx
var React23 = __toESM(require("react"));

// src/control-adornments/control-adornments-context.tsx
var React22 = __toESM(require("react"));
var import_react13 = require("react");
var Context2 = (0, import_react13.createContext)(null);
var ControlAdornmentsProvider = ({ children, items }) => /* @__PURE__ */ React22.createElement(Context2.Provider, { value: { items } }, children);
var useControlAdornments = () => {
  const context = (0, import_react13.useContext)(Context2);
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
var import_locations = require("@elementor/locations");
var { Slot: RepeaterItemIconSlot, inject: injectIntoRepeaterItemIcon } = (0, import_locations.createReplaceableLocation)();
var { Slot: RepeaterItemLabelSlot, inject: injectIntoRepeaterItemLabel } = (0, import_locations.createReplaceableLocation)();

// src/components/sortable.tsx
var React24 = __toESM(require("react"));
var import_icons3 = require("@elementor/icons");
var import_ui18 = require("@elementor/ui");
var SortableProvider = (props) => {
  return /* @__PURE__ */ React24.createElement(import_ui18.List, { sx: { p: 0, my: -0.5, mx: 0 } }, /* @__PURE__ */ React24.createElement(import_ui18.UnstableSortableProvider, { restrictAxis: true, disableDragOverlay: false, variant: "static", ...props }));
};
var SortableItem = ({ id, children, disabled }) => {
  return /* @__PURE__ */ React24.createElement(
    import_ui18.UnstableSortableItem,
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
var StyledListItem = (0, import_ui18.styled)(import_ui18.ListItem)`
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
var SortableTrigger = (props) => /* @__PURE__ */ React24.createElement("div", { ...props, role: "button", className: "class-item-sortable-trigger" }, /* @__PURE__ */ React24.createElement(import_icons3.GripVerticalIcon, { fontSize: "tiny" }));
var StyledDivider = (0, import_ui18.styled)(import_ui18.Divider)`
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
  const [openItem, setOpenItem] = (0, import_react14.useState)(EMPTY_OPEN_ITEM);
  const [items, setItems] = useSyncExternalState({
    external: repeaterValues,
    // @ts-expect-error - as long as persistWhen => true, value will never be null
    setExternal: setRepeaterValues,
    persistWhen: () => true
  });
  const [uniqueKeys, setUniqueKeys] = (0, import_react14.useState)(items.map((_, index) => index));
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
    import_ui19.Stack,
    {
      direction: "row",
      justifyContent: "start",
      alignItems: "center",
      gap: 1,
      sx: { marginInlineEnd: -0.75 }
    },
    /* @__PURE__ */ React25.createElement(import_ui19.Typography, { component: "label", variant: "caption", color: "text.secondary" }, label),
    /* @__PURE__ */ React25.createElement(ControlAdornments, null),
    /* @__PURE__ */ React25.createElement(
      import_ui19.IconButton,
      {
        size: SIZE,
        sx: { ml: "auto" },
        disabled,
        onClick: addRepeaterItem,
        "aria-label": (0, import_i18n4.__)("Add item", "elementor")
      },
      /* @__PURE__ */ React25.createElement(import_icons4.PlusIcon, { fontSize: SIZE })
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
  const [anchorEl, setAnchorEl] = (0, import_react14.useState)(null);
  const { popoverState, popoverProps, ref, setRef } = usePopover(openOnMount, onOpen);
  const duplicateLabel = (0, import_i18n4.__)("Duplicate", "elementor");
  const toggleLabel = propDisabled ? (0, import_i18n4.__)("Show", "elementor") : (0, import_i18n4.__)("Hide", "elementor");
  const removeLabel = (0, import_i18n4.__)("Remove", "elementor");
  return /* @__PURE__ */ React25.createElement(React25.Fragment, null, /* @__PURE__ */ React25.createElement(
    import_ui19.UnstableTag,
    {
      disabled,
      label,
      showActionsOnHover: true,
      fullWidth: true,
      ref: setRef,
      variant: "outlined",
      "aria-label": (0, import_i18n4.__)("Open item", "elementor"),
      ...(0, import_ui19.bindTrigger)(popoverState),
      startIcon,
      actions: /* @__PURE__ */ React25.createElement(React25.Fragment, null, showDuplicate && /* @__PURE__ */ React25.createElement(import_ui19.Tooltip, { title: duplicateLabel, placement: "top" }, /* @__PURE__ */ React25.createElement(import_ui19.IconButton, { size: SIZE, onClick: duplicateItem, "aria-label": duplicateLabel }, /* @__PURE__ */ React25.createElement(import_icons4.CopyIcon, { fontSize: SIZE }))), showToggle && /* @__PURE__ */ React25.createElement(import_ui19.Tooltip, { title: toggleLabel, placement: "top" }, /* @__PURE__ */ React25.createElement(import_ui19.IconButton, { size: SIZE, onClick: toggleDisableItem, "aria-label": toggleLabel }, propDisabled ? /* @__PURE__ */ React25.createElement(import_icons4.EyeOffIcon, { fontSize: SIZE }) : /* @__PURE__ */ React25.createElement(import_icons4.EyeIcon, { fontSize: SIZE }))), /* @__PURE__ */ React25.createElement(import_ui19.Tooltip, { title: removeLabel, placement: "top" }, /* @__PURE__ */ React25.createElement(import_ui19.IconButton, { size: SIZE, onClick: removeItem, "aria-label": removeLabel }, /* @__PURE__ */ React25.createElement(import_icons4.XIcon, { fontSize: SIZE }))))
    }
  ), /* @__PURE__ */ React25.createElement(
    import_ui19.Popover,
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
    /* @__PURE__ */ React25.createElement(import_ui19.Box, null, children({ anchorEl }))
  ));
};
var usePopover = (openOnMount, onOpen) => {
  const [ref, setRef] = (0, import_react14.useState)(null);
  const popoverState = (0, import_ui19.usePopupState)({ variant: "popover" });
  const popoverProps = (0, import_ui19.bindPopover)(popoverState);
  (0, import_react14.useEffect)(() => {
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
  const { propType, value, setValue, disabled } = useBoundProp(import_editor_props9.boxShadowPropTypeUtil);
  return /* @__PURE__ */ React26.createElement(PropProvider, { propType, value, setValue, disabled }, /* @__PURE__ */ React26.createElement(
    Repeater,
    {
      openOnAdd: true,
      disabled,
      values: value ?? [],
      setValues: setValue,
      label: (0, import_i18n5.__)("Box shadow", "elementor"),
      itemSettings: {
        Icon: ItemIcon,
        Label: ItemLabel,
        Content: ItemContent,
        initialValues: initialShadow
      }
    }
  ));
});
var ItemIcon = ({ value }) => /* @__PURE__ */ React26.createElement(import_ui20.UnstableColorIndicator, { size: "inherit", component: "span", value: value.value.color?.value });
var ItemContent = ({ anchorEl, bind }) => {
  return /* @__PURE__ */ React26.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React26.createElement(Content, { anchorEl }));
};
var Content = ({ anchorEl }) => {
  const context = useBoundProp(import_editor_props9.shadowPropTypeUtil);
  const rowRef = [(0, import_react15.useRef)(null), (0, import_react15.useRef)(null)];
  return /* @__PURE__ */ React26.createElement(PropProvider, { ...context }, /* @__PURE__ */ React26.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React26.createElement(PopoverGridContainer, null, /* @__PURE__ */ React26.createElement(Control2, { bind: "color", label: (0, import_i18n5.__)("Color", "elementor") }, /* @__PURE__ */ React26.createElement(ColorControl, { anchorEl })), /* @__PURE__ */ React26.createElement(Control2, { bind: "position", label: (0, import_i18n5.__)("Position", "elementor"), sx: { overflow: "hidden" } }, /* @__PURE__ */ React26.createElement(
    SelectControl,
    {
      options: [
        { label: (0, import_i18n5.__)("Inset", "elementor"), value: "inset" },
        { label: (0, import_i18n5.__)("Outset", "elementor"), value: null }
      ]
    }
  ))), /* @__PURE__ */ React26.createElement(PopoverGridContainer, { ref: rowRef[0] }, /* @__PURE__ */ React26.createElement(Control2, { bind: "hOffset", label: (0, import_i18n5.__)("Horizontal", "elementor") }, /* @__PURE__ */ React26.createElement(SizeControl, { anchorRef: rowRef[0] })), /* @__PURE__ */ React26.createElement(Control2, { bind: "vOffset", label: (0, import_i18n5.__)("Vertical", "elementor") }, /* @__PURE__ */ React26.createElement(SizeControl, { anchorRef: rowRef[0] }))), /* @__PURE__ */ React26.createElement(PopoverGridContainer, { ref: rowRef[1] }, /* @__PURE__ */ React26.createElement(Control2, { bind: "blur", label: (0, import_i18n5.__)("Blur", "elementor") }, /* @__PURE__ */ React26.createElement(SizeControl, { anchorRef: rowRef[1] })), /* @__PURE__ */ React26.createElement(Control2, { bind: "spread", label: (0, import_i18n5.__)("Spread", "elementor") }, /* @__PURE__ */ React26.createElement(SizeControl, { anchorRef: rowRef[1] })))));
};
var Control2 = ({
  label,
  bind,
  children,
  sx
}) => /* @__PURE__ */ React26.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React26.createElement(import_ui20.Grid, { item: true, xs: 6, sx }, /* @__PURE__ */ React26.createElement(import_ui20.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React26.createElement(import_ui20.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React26.createElement(import_ui20.FormLabel, { size: "tiny" }, label)), /* @__PURE__ */ React26.createElement(import_ui20.Grid, { item: true, xs: 12 }, children))));
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
var React28 = __toESM(require("react"));
var import_react16 = require("react");
var import_editor_props10 = require("@elementor/editor-props");
var import_editor_ui3 = require("@elementor/editor-ui");
var import_ui22 = require("@elementor/ui");
var import_i18n6 = require("@wordpress/i18n");

// src/components/control-label.tsx
var React27 = __toESM(require("react"));
var import_ui21 = require("@elementor/ui");
var ControlLabel = ({ children }) => {
  return /* @__PURE__ */ React27.createElement(import_ui21.Stack, { direction: "row", alignItems: "center", justifyItems: "start", gap: 0.25 }, /* @__PURE__ */ React27.createElement(ControlFormLabel, null, children), /* @__PURE__ */ React27.createElement(ControlAdornments, null));
};

// src/controls/filter-repeater-control.tsx
var DEFAULT_FILTER_KEY = "blur";
var filterConfig = {
  blur: {
    defaultValue: { $$type: "radius", radius: { $$type: "size", value: { size: 0, unit: "px" } } },
    name: (0, import_i18n6.__)("Blur", "elementor"),
    valueName: (0, import_i18n6.__)("Radius", "elementor"),
    propType: import_editor_props10.blurFilterPropTypeUtil
  },
  brightness: {
    defaultValue: { $$type: "amount", amount: { $$type: "size", value: { size: 100, unit: "%" } } },
    name: (0, import_i18n6.__)("Brightness", "elementor"),
    valueName: (0, import_i18n6.__)("Amount", "elementor"),
    propType: import_editor_props10.brightnessFilterPropTypeUtil,
    units: ["%"]
  }
};
var filterKeys = Object.keys(filterConfig);
var singleSizeFilterNames = filterKeys.filter((name) => {
  const filter = filterConfig[name].defaultValue;
  return filter[filter.$$type].$$type === "size";
});
var FilterRepeaterControl = createControl(() => {
  const { propType, value: filterValues, setValue, disabled } = useBoundProp(import_editor_props10.filterPropTypeUtil);
  return /* @__PURE__ */ React28.createElement(PropProvider, { propType, value: filterValues, setValue }, /* @__PURE__ */ React28.createElement(
    Repeater,
    {
      openOnAdd: true,
      disabled,
      values: filterValues ?? [],
      setValues: setValue,
      label: (0, import_i18n6.__)("Filter", "elementor"),
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
  const label = /* @__PURE__ */ React28.createElement(import_ui22.Box, { component: "span", style: { textTransform: "capitalize" } }, value.$$type, ":");
  return /* @__PURE__ */ React28.createElement(import_ui22.Box, { component: "span" }, label, unit !== "custom" ? ` ${size ?? 0}${unit ?? defaultUnit}` : size);
};
var ItemContent2 = ({ bind }) => {
  const { value: filterValues, setValue } = useBoundProp(import_editor_props10.filterPropTypeUtil);
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
  return /* @__PURE__ */ React28.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React28.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React28.createElement(PopoverGridContainer, null, /* @__PURE__ */ React28.createElement(import_ui22.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React28.createElement(ControlLabel, null, (0, import_i18n6.__)("Filter", "elementor"))), /* @__PURE__ */ React28.createElement(import_ui22.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React28.createElement(
    import_ui22.Select,
    {
      sx: { overflow: "hidden" },
      size: "tiny",
      value: item?.$$type ?? DEFAULT_FILTER_KEY,
      onChange: handleChange,
      fullWidth: true
    },
    filterKeys.map((filterKey) => /* @__PURE__ */ React28.createElement(import_editor_ui3.MenuListItem, { key: filterKey, value: filterKey }, filterConfig[filterKey].name))
  ))), /* @__PURE__ */ React28.createElement(Content2, { filterType: item?.$$type })));
};
var Content2 = ({ filterType }) => {
  return singleSizeFilterNames.includes(filterType) && /* @__PURE__ */ React28.createElement(SingleSizeItemContent, { filterType });
};
var SingleSizeItemContent = ({ filterType }) => {
  const { propType, valueName, defaultValue, units: units2 } = filterConfig[filterType];
  const { $$type } = defaultValue;
  const context = useBoundProp(propType);
  const rowRef = (0, import_react16.useRef)(null);
  return /* @__PURE__ */ React28.createElement(PropProvider, { ...context }, /* @__PURE__ */ React28.createElement(PropKeyProvider, { bind: $$type }, /* @__PURE__ */ React28.createElement(PopoverGridContainer, { ref: rowRef }, /* @__PURE__ */ React28.createElement(import_ui22.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React28.createElement(ControlLabel, null, valueName)), /* @__PURE__ */ React28.createElement(import_ui22.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React28.createElement(SizeControl, { anchorRef: rowRef, units: units2 })))));
};

// src/controls/toggle-control.tsx
var React31 = __toESM(require("react"));
var import_editor_props11 = require("@elementor/editor-props");

// src/components/control-toggle-button-group.tsx
var React30 = __toESM(require("react"));
var import_react17 = require("react");
var import_icons5 = require("@elementor/icons");
var import_ui24 = require("@elementor/ui");

// src/components/conditional-tooltip.tsx
var React29 = __toESM(require("react"));
var import_ui23 = require("@elementor/ui");
var ConditionalTooltip = ({
  showTooltip,
  children,
  label
}) => {
  return showTooltip && label ? /* @__PURE__ */ React29.createElement(import_ui23.Tooltip, { title: label, disableFocusListener: true, placement: "top" }, children) : children;
};

// src/components/control-toggle-button-group.tsx
var StyledToggleButtonGroup = (0, import_ui24.styled)(import_ui24.ToggleButtonGroup)`
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
  const isRtl = "rtl" === (0, import_ui24.useTheme)().direction;
  const handleChange = (_, newValue) => {
    onChange(newValue);
  };
  const getGridTemplateColumns = (0, import_react17.useMemo)(() => {
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
      /* @__PURE__ */ React30.createElement(import_ui24.ToggleButton, { value: buttonValue, "aria-label": label, size, fullWidth }, /* @__PURE__ */ React30.createElement(Content5, { size }))
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
  const [isMenuOpen, setIsMenuOpen] = (0, import_react17.useState)(false);
  const menuButtonRef = (0, import_react17.useRef)(null);
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
    import_ui24.ToggleButton,
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
    import_ui24.ToggleButton,
    {
      size,
      "aria-expanded": isMenuOpen ? "true" : void 0,
      "aria-haspopup": "menu",
      "aria-pressed": void 0,
      onClick: onMenuToggle,
      ref: menuButtonRef,
      value: "__chevron-icon-button__"
    },
    /* @__PURE__ */ React30.createElement(import_icons5.ChevronDownIcon, { fontSize: size })
  ), /* @__PURE__ */ React30.createElement(
    import_ui24.Menu,
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
      import_ui24.MenuItem,
      {
        key: buttonValue,
        selected: buttonValue === value,
        onClick: () => onMenuItemClick(buttonValue)
      },
      /* @__PURE__ */ React30.createElement(import_ui24.ListItemText, null, /* @__PURE__ */ React30.createElement(import_ui24.Typography, { sx: { fontSize: "14px" } }, label))
    ))
  ));
};
var usePreviewButton = (items, value) => {
  const [previewButton, setPreviewButton] = (0, import_react17.useState)(
    items.find((item) => item.value === value) ?? items[0]
  );
  (0, import_react17.useEffect)(() => {
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
    const { value, setValue, placeholder, disabled } = useBoundProp(import_editor_props11.stringPropTypeUtil);
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
var React32 = __toESM(require("react"));
var import_editor_props12 = require("@elementor/editor-props");
var import_ui25 = require("@elementor/ui");
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
    const { value, setValue, disabled } = useBoundProp(import_editor_props12.numberPropTypeUtil);
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
      import_ui25.TextField,
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
var React33 = __toESM(require("react"));
var import_react18 = require("react");
var import_editor_props13 = require("@elementor/editor-props");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
var import_ui26 = require("@elementor/ui");
var import_i18n7 = require("@wordpress/i18n");
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
  const popupId = (0, import_react18.useId)();
  const popupState = (0, import_ui26.usePopupState)({ variant: "popover", popupId });
  const {
    propType: multiSizePropType,
    value: multiSizeValue,
    setValue: setMultiSizeValue,
    disabled: multiSizeDisabled
  } = useBoundProp(multiSizePropTypeUtil);
  const { value: sizeValue, setValue: setSizeValue } = useBoundProp(import_editor_props13.sizePropTypeUtil);
  const rowRefs = [(0, import_react18.useRef)(null), (0, import_react18.useRef)(null)];
  const splitEqualValue = () => {
    if (!sizeValue) {
      return null;
    }
    return items.reduce(
      (acc, { bind }) => ({ ...acc, [bind]: import_editor_props13.sizePropTypeUtil.create(sizeValue) }),
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
  const isShowingGeneralIndicator = !(0, import_editor_v1_adapters2.isExperimentActive)("e_v_3_30") || !popupState.isOpen;
  const isMixed = !!multiSizeValue;
  return /* @__PURE__ */ React33.createElement(React33.Fragment, null, /* @__PURE__ */ React33.createElement(import_ui26.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap", ref: rowRefs[0] }, /* @__PURE__ */ React33.createElement(import_ui26.Grid, { item: true, xs: 6 }, !isShowingGeneralIndicator ? /* @__PURE__ */ React33.createElement(ControlFormLabel, null, label) : /* @__PURE__ */ React33.createElement(ControlLabel, null, label)), /* @__PURE__ */ React33.createElement(import_ui26.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React33.createElement(import_ui26.Stack, { direction: "row", alignItems: "center", gap: 1 }, /* @__PURE__ */ React33.createElement(
    SizeControl,
    {
      placeholder: isMixed ? (0, import_i18n7.__)("Mixed", "elementor") : void 0,
      anchorRef: rowRefs[0]
    }
  ), /* @__PURE__ */ React33.createElement(import_ui26.Tooltip, { title: tooltipLabel, placement: "top" }, /* @__PURE__ */ React33.createElement(
    import_ui26.ToggleButton,
    {
      size: "tiny",
      value: "check",
      sx: { marginLeft: "auto" },
      ...(0, import_ui26.bindToggle)(popupState),
      selected: popupState.isOpen,
      "aria-label": tooltipLabel
    },
    icon
  ))))), /* @__PURE__ */ React33.createElement(
    import_ui26.Popover,
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
      ...(0, import_ui26.bindPopover)(popupState),
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
  const isUsingNestedProps = (0, import_editor_v1_adapters2.isExperimentActive)("e_v_3_30");
  return /* @__PURE__ */ React33.createElement(PropKeyProvider, { bind: item.bind }, /* @__PURE__ */ React33.createElement(import_ui26.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React33.createElement(import_ui26.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React33.createElement(import_ui26.Grid, { item: true, xs: 12 }, isUsingNestedProps ? /* @__PURE__ */ React33.createElement(ControlLabel, null, item.label) : /* @__PURE__ */ React33.createElement(ControlFormLabel, null, item.label)), /* @__PURE__ */ React33.createElement(import_ui26.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React33.createElement(SizeControl, { startIcon: item.icon, anchorRef: rowRef })))));
};

// src/controls/linked-dimensions-control.tsx
var React34 = __toESM(require("react"));
var import_react19 = require("react");
var import_editor_props14 = require("@elementor/editor-props");
var import_editor_v1_adapters3 = require("@elementor/editor-v1-adapters");
var import_icons6 = require("@elementor/icons");
var import_ui27 = require("@elementor/ui");
var import_i18n8 = require("@wordpress/i18n");
var LinkedDimensionsControl = createControl(
  ({
    label,
    isSiteRtl = false,
    extendedOptions
  }) => {
    const { value: sizeValue, setValue: setSizeValue, disabled: sizeDisabled } = useBoundProp(import_editor_props14.sizePropTypeUtil);
    const gridRowRefs = [(0, import_react19.useRef)(null), (0, import_react19.useRef)(null)];
    const {
      value: dimensionsValue,
      setValue: setDimensionsValue,
      propType,
      disabled: dimensionsDisabled
    } = useBoundProp(import_editor_props14.dimensionsPropTypeUtil);
    const isLinked = !dimensionsValue && !sizeValue ? true : !!sizeValue;
    const isUsingNestedProps = (0, import_editor_v1_adapters3.isExperimentActive)("e_v_3_30");
    const onLinkToggle = () => {
      if (!isLinked) {
        setSizeValue(dimensionsValue["block-start"]?.value ?? null);
        return;
      }
      const value = sizeValue ? import_editor_props14.sizePropTypeUtil.create(sizeValue) : null;
      setDimensionsValue({
        "block-start": value,
        "block-end": value,
        "inline-start": value,
        "inline-end": value
      });
    };
    const tooltipLabel = label.toLowerCase();
    const LinkedIcon = isLinked ? import_icons6.LinkIcon : import_icons6.DetachIcon;
    const linkedLabel = (0, import_i18n8.__)("Link %s", "elementor").replace("%s", tooltipLabel);
    const unlinkedLabel = (0, import_i18n8.__)("Unlink %s", "elementor").replace("%s", tooltipLabel);
    const disabled = sizeDisabled || dimensionsDisabled;
    return /* @__PURE__ */ React34.createElement(
      PropProvider,
      {
        propType,
        value: dimensionsValue,
        setValue: setDimensionsValue,
        disabled
      },
      /* @__PURE__ */ React34.createElement(import_ui27.Stack, { direction: "row", gap: 2, flexWrap: "nowrap" }, isUsingNestedProps ? /* @__PURE__ */ React34.createElement(ControlFormLabel, null, label) : /* @__PURE__ */ React34.createElement(ControlLabel, null, label), /* @__PURE__ */ React34.createElement(import_ui27.Tooltip, { title: isLinked ? unlinkedLabel : linkedLabel, placement: "top" }, /* @__PURE__ */ React34.createElement(
        import_ui27.ToggleButton,
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
      getCssMarginProps(isSiteRtl).map((row, index) => /* @__PURE__ */ React34.createElement(import_ui27.Stack, { direction: "row", gap: 2, flexWrap: "nowrap", key: index, ref: gridRowRefs[index] }, row.map(({ icon, ...props }) => /* @__PURE__ */ React34.createElement(import_ui27.Grid, { container: true, gap: 0.75, alignItems: "center", key: props.bind }, /* @__PURE__ */ React34.createElement(import_ui27.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React34.createElement(Label, { ...props })), /* @__PURE__ */ React34.createElement(import_ui27.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React34.createElement(
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
  const isUsingNestedProps = (0, import_editor_v1_adapters3.isExperimentActive)("e_v_3_30");
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
        label: (0, import_i18n8.__)("Top", "elementor"),
        icon: /* @__PURE__ */ React34.createElement(import_icons6.SideTopIcon, { fontSize: "tiny" })
      },
      {
        bind: "inline-end",
        label: isSiteRtl ? (0, import_i18n8.__)("Left", "elementor") : (0, import_i18n8.__)("Right", "elementor"),
        icon: isSiteRtl ? /* @__PURE__ */ React34.createElement(import_icons6.SideLeftIcon, { fontSize: "tiny" }) : /* @__PURE__ */ React34.createElement(import_icons6.SideRightIcon, { fontSize: "tiny" })
      }
    ],
    [
      {
        bind: "block-end",
        label: (0, import_i18n8.__)("Bottom", "elementor"),
        icon: /* @__PURE__ */ React34.createElement(import_icons6.SideBottomIcon, { fontSize: "tiny" })
      },
      {
        bind: "inline-start",
        label: isSiteRtl ? (0, import_i18n8.__)("Right", "elementor") : (0, import_i18n8.__)("Left", "elementor"),
        icon: isSiteRtl ? /* @__PURE__ */ React34.createElement(import_icons6.SideRightIcon, { fontSize: "tiny" }) : /* @__PURE__ */ React34.createElement(import_icons6.SideLeftIcon, { fontSize: "tiny" })
      }
    ]
  ];
}

// src/controls/font-family-control/font-family-control.tsx
var React36 = __toESM(require("react"));
var import_editor_props15 = require("@elementor/editor-props");
var import_icons8 = require("@elementor/icons");
var import_ui29 = require("@elementor/ui");

// src/components/font-family-selector.tsx
var React35 = __toESM(require("react"));
var import_react20 = require("react");
var import_editor_ui4 = require("@elementor/editor-ui");
var import_icons7 = require("@elementor/icons");
var import_ui28 = require("@elementor/ui");
var import_utils2 = require("@elementor/utils");
var import_i18n9 = require("@wordpress/i18n");

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
  const [searchValue, setSearchValue] = (0, import_react20.useState)("");
  const filteredFontFamilies = useFilteredFontFamilies(fontFamilies, searchValue);
  const handleSearch = (value) => {
    setSearchValue(value);
  };
  const handleClose = () => {
    setSearchValue("");
    onClose();
  };
  return /* @__PURE__ */ React35.createElement(import_ui28.Stack, null, /* @__PURE__ */ React35.createElement(
    import_editor_ui4.PopoverHeader,
    {
      title: (0, import_i18n9.__)("Font Family", "elementor"),
      onClose: handleClose,
      icon: /* @__PURE__ */ React35.createElement(import_icons7.TextIcon, { fontSize: SIZE2 })
    }
  ), /* @__PURE__ */ React35.createElement(
    import_editor_ui4.PopoverSearch,
    {
      value: searchValue,
      onSearch: handleSearch,
      placeholder: (0, import_i18n9.__)("Search", "elementor")
    }
  ), /* @__PURE__ */ React35.createElement(import_ui28.Divider, null), filteredFontFamilies.length > 0 ? /* @__PURE__ */ React35.createElement(
    FontList,
    {
      fontListItems: filteredFontFamilies,
      setFontFamily: onFontFamilyChange,
      handleClose,
      fontFamily,
      sectionWidth
    }
  ) : /* @__PURE__ */ React35.createElement(import_editor_ui4.PopoverScrollableContent, { width: sectionWidth }, /* @__PURE__ */ React35.createElement(
    import_ui28.Stack,
    {
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      p: 2.5,
      gap: 1.5,
      overflow: "hidden"
    },
    /* @__PURE__ */ React35.createElement(import_icons7.TextIcon, { fontSize: "large" }),
    /* @__PURE__ */ React35.createElement(import_ui28.Box, { sx: { maxWidth: 160, overflow: "hidden" } }, /* @__PURE__ */ React35.createElement(import_ui28.Typography, { align: "center", variant: "subtitle2", color: "text.secondary" }, (0, import_i18n9.__)("Sorry, nothing matched", "elementor")), /* @__PURE__ */ React35.createElement(
      import_ui28.Typography,
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
      import_ui28.Typography,
      {
        align: "center",
        variant: "caption",
        color: "text.secondary",
        sx: { display: "flex", flexDirection: "column" }
      },
      (0, import_i18n9.__)("Try something else.", "elementor"),
      /* @__PURE__ */ React35.createElement(
        import_ui28.Link,
        {
          color: "secondary",
          variant: "caption",
          component: "button",
          onClick: () => setSearchValue("")
        },
        (0, import_i18n9.__)("Clear & try again", "elementor")
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
    import_editor_ui4.PopoverMenuList,
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
  const [debouncedFn] = (0, import_react20.useState)(() => (0, import_utils2.debounce)(fn, delay));
  (0, import_react20.useEffect)(() => () => debouncedFn.cancel(), [debouncedFn]);
  return debouncedFn;
};

// src/controls/font-family-control/font-family-control.tsx
var SIZE3 = "tiny";
var FontFamilyControl = createControl(({ fontFamilies, sectionWidth }) => {
  const { value: fontFamily, setValue: setFontFamily, disabled } = useBoundProp(import_editor_props15.stringPropTypeUtil);
  const popoverState = (0, import_ui29.usePopupState)({ variant: "popover" });
  return /* @__PURE__ */ React36.createElement(React36.Fragment, null, /* @__PURE__ */ React36.createElement(ControlActions, null, /* @__PURE__ */ React36.createElement(
    import_ui29.UnstableTag,
    {
      variant: "outlined",
      label: fontFamily,
      endIcon: /* @__PURE__ */ React36.createElement(import_icons8.ChevronDownIcon, { fontSize: SIZE3 }),
      ...(0, import_ui29.bindTrigger)(popoverState),
      fullWidth: true,
      disabled
    }
  )), /* @__PURE__ */ React36.createElement(
    import_ui29.Popover,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      sx: { my: 1.5 },
      ...(0, import_ui29.bindPopover)(popoverState)
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
var React37 = __toESM(require("react"));
var import_editor_props16 = require("@elementor/editor-props");
var import_ui30 = require("@elementor/ui");
var UrlControl = createControl(({ placeholder }) => {
  const { value, setValue, disabled } = useBoundProp(import_editor_props16.urlPropTypeUtil);
  const handleChange = (event) => setValue(event.target.value);
  return /* @__PURE__ */ React37.createElement(ControlActions, null, /* @__PURE__ */ React37.createElement(
    import_ui30.TextField,
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
var React39 = __toESM(require("react"));
var import_react22 = require("react");
var import_editor_elements = require("@elementor/editor-elements");
var import_editor_props17 = require("@elementor/editor-props");
var import_editor_ui5 = require("@elementor/editor-ui");
var import_http_client2 = require("@elementor/http-client");
var import_icons10 = require("@elementor/icons");
var import_session = require("@elementor/session");
var import_ui32 = require("@elementor/ui");
var import_utils3 = require("@elementor/utils");
var import_i18n10 = require("@wordpress/i18n");

// src/components/autocomplete.tsx
var React38 = __toESM(require("react"));
var import_react21 = require("react");
var import_icons9 = require("@elementor/icons");
var import_ui31 = require("@elementor/ui");
var Autocomplete = (0, import_react21.forwardRef)((props, ref) => {
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
    import_ui31.Autocomplete,
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
      renderOption: (optionProps, optionId) => /* @__PURE__ */ React38.createElement(import_ui31.Box, { component: "li", ...optionProps, key: optionProps.id }, findMatchingOption(options, optionId)?.label ?? optionId),
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
    import_ui31.TextField,
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
}) => /* @__PURE__ */ React38.createElement(import_ui31.InputAdornment, { position: "end" }, allowClear && /* @__PURE__ */ React38.createElement(import_ui31.IconButton, { size: params.size, onClick: () => handleChange(null), sx: { cursor: "pointer" } }, /* @__PURE__ */ React38.createElement(import_icons9.XIcon, { fontSize: params.size })));
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
  label: (0, import_i18n10.__)("Learn More", "elementor"),
  href: "https://go.elementor.com/element-link-inside-link-infotip"
};
var LinkControl = createControl((props) => {
  const { value, path, setValue, ...propContext } = useBoundProp(import_editor_props17.linkPropTypeUtil);
  const [linkSessionValue, setLinkSessionValue] = (0, import_session.useSessionStorage)(path.join("/"));
  const [isActive, setIsActive] = (0, import_react22.useState)(!!value);
  const {
    allowCustomValues,
    queryOptions: { endpoint = "", requestParams = {} },
    placeholder,
    minInputLength = 2,
    context: { elementId }
  } = props || {};
  const [linkInLinkRestriction, setLinkInLinkRestriction] = (0, import_react22.useState)((0, import_editor_elements.getLinkInLinkRestriction)(elementId));
  const [options, setOptions] = (0, import_react22.useState)(
    generateFirstLoadedOption(value)
  );
  const shouldDisableAddingLink = !isActive && linkInLinkRestriction.shouldRestrict;
  const onEnabledChange = () => {
    setLinkInLinkRestriction((0, import_editor_elements.getLinkInLinkRestriction)(elementId));
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
      destination: import_editor_props17.numberPropTypeUtil.create(newValue),
      label: import_editor_props17.stringPropTypeUtil.create(findMatchingOption(options, newValue)?.label || null)
    } : null;
    onSaveNewValue(valueToSave);
  };
  const onTextChange = (newValue) => {
    newValue = newValue?.trim() || "";
    const valueToSave = newValue ? {
      ...value,
      destination: import_editor_props17.urlPropTypeUtil.create(newValue),
      label: import_editor_props17.stringPropTypeUtil.create("")
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
  const debounceFetch = (0, import_react22.useMemo)(
    () => (0, import_utils3.debounce)(
      (params) => fetchOptions(endpoint, params).then((newOptions) => {
        setOptions(formatOptions(newOptions));
      }),
      400
    ),
    [endpoint]
  );
  return /* @__PURE__ */ React39.createElement(PropProvider, { ...propContext, value, setValue }, /* @__PURE__ */ React39.createElement(import_ui32.Stack, { gap: 1.5 }, /* @__PURE__ */ React39.createElement(
    import_ui32.Stack,
    {
      direction: "row",
      sx: {
        justifyContent: "space-between",
        alignItems: "center",
        marginInlineEnd: -0.75
      }
    },
    /* @__PURE__ */ React39.createElement(ControlFormLabel, null, (0, import_i18n10.__)("Link", "elementor")),
    /* @__PURE__ */ React39.createElement(ConditionalInfoTip, { isVisible: !isActive, linkInLinkRestriction }, /* @__PURE__ */ React39.createElement(
      ToggleIconControl,
      {
        disabled: shouldDisableAddingLink,
        active: isActive,
        onIconClick: onEnabledChange,
        label: (0, import_i18n10.__)("Toggle link", "elementor")
      }
    ))
  ), /* @__PURE__ */ React39.createElement(import_ui32.Collapse, { in: isActive, timeout: "auto", unmountOnExit: true }, /* @__PURE__ */ React39.createElement(import_ui32.Stack, { gap: 1.5 }, /* @__PURE__ */ React39.createElement(PropKeyProvider, { bind: "destination" }, /* @__PURE__ */ React39.createElement(ControlActions, null, /* @__PURE__ */ React39.createElement(
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
  return /* @__PURE__ */ React39.createElement(import_ui32.IconButton, { size: SIZE4, onClick: onIconClick, "aria-label": label, disabled }, active ? /* @__PURE__ */ React39.createElement(import_icons10.MinusIcon, { fontSize: SIZE4 }) : /* @__PURE__ */ React39.createElement(import_icons10.PlusIcon, { fontSize: SIZE4 }));
};
var SwitchControl = ({ disabled }) => {
  const { value = false, setValue } = useBoundProp(import_editor_props17.booleanPropTypeUtil);
  const onClick = () => {
    setValue(!value);
  };
  const inputProps = disabled ? {
    style: {
      opacity: 0
    }
  } : {};
  return /* @__PURE__ */ React39.createElement(import_ui32.Grid, { container: true, alignItems: "center", flexWrap: "nowrap", justifyContent: "space-between" }, /* @__PURE__ */ React39.createElement(import_ui32.Grid, { item: true }, /* @__PURE__ */ React39.createElement(ControlFormLabel, null, (0, import_i18n10.__)("Open in a new tab", "elementor"))), /* @__PURE__ */ React39.createElement(import_ui32.Grid, { item: true, sx: { marginInlineEnd: -1 } }, /* @__PURE__ */ React39.createElement(import_ui32.Switch, { checked: value, onClick, disabled, inputProps })));
};
async function fetchOptions(ajaxUrl, params) {
  if (!params || !ajaxUrl) {
    return [];
  }
  try {
    const { data: response } = await (0, import_http_client2.httpService)().get(ajaxUrl, { params });
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
      (0, import_editor_elements.selectElement)(elementId);
    }
  };
  return shouldRestrict && isVisible ? /* @__PURE__ */ React39.createElement(
    import_ui32.Infotip,
    {
      placement: "right",
      content: /* @__PURE__ */ React39.createElement(
        import_editor_ui5.InfoTipCard,
        {
          content: INFOTIP_CONTENT[reason],
          svgIcon: /* @__PURE__ */ React39.createElement(import_icons10.AlertTriangleIcon, null),
          learnMoreButton,
          ctaButton: {
            label: (0, import_i18n10.__)("Take me there", "elementor"),
            onClick: handleTakeMeClick
          }
        }
      )
    },
    /* @__PURE__ */ React39.createElement(import_ui32.Box, null, children)
  ) : /* @__PURE__ */ React39.createElement(React39.Fragment, null, children);
};
var INFOTIP_CONTENT = {
  descendant: /* @__PURE__ */ React39.createElement(React39.Fragment, null, (0, import_i18n10.__)("To add a link to this container,", "elementor"), /* @__PURE__ */ React39.createElement("br", null), (0, import_i18n10.__)("first remove the link from the elements inside of it.", "elementor")),
  ancestor: /* @__PURE__ */ React39.createElement(React39.Fragment, null, (0, import_i18n10.__)("To add a link to this element,", "elementor"), /* @__PURE__ */ React39.createElement("br", null), (0, import_i18n10.__)("first remove the link from its parent container.", "elementor"))
};

// src/controls/gap-control.tsx
var React40 = __toESM(require("react"));
var import_react23 = require("react");
var import_editor_props18 = require("@elementor/editor-props");
var import_icons11 = require("@elementor/icons");
var import_ui33 = require("@elementor/ui");
var import_i18n11 = require("@wordpress/i18n");
var GapControl = createControl(({ label }) => {
  const {
    value: directionValue,
    setValue: setDirectionValue,
    propType,
    disabled: directionDisabled
  } = useBoundProp(import_editor_props18.layoutDirectionPropTypeUtil);
  const stackRef = (0, import_react23.useRef)(null);
  const { value: sizeValue, setValue: setSizeValue, disabled: sizeDisabled } = useBoundProp(import_editor_props18.sizePropTypeUtil);
  const isLinked = !directionValue && !sizeValue ? true : !!sizeValue;
  const onLinkToggle = () => {
    if (!isLinked) {
      setSizeValue(directionValue?.column?.value ?? null);
      return;
    }
    const value = sizeValue ? import_editor_props18.sizePropTypeUtil.create(sizeValue) : null;
    setDirectionValue({
      row: value,
      column: value
    });
  };
  const tooltipLabel = label.toLowerCase();
  const LinkedIcon = isLinked ? import_icons11.LinkIcon : import_icons11.DetachIcon;
  const linkedLabel = (0, import_i18n11.__)("Link %s", "elementor").replace("%s", tooltipLabel);
  const unlinkedLabel = (0, import_i18n11.__)("Unlink %s", "elementor").replace("%s", tooltipLabel);
  const disabled = sizeDisabled || directionDisabled;
  return /* @__PURE__ */ React40.createElement(PropProvider, { propType, value: directionValue, setValue: setDirectionValue }, /* @__PURE__ */ React40.createElement(import_ui33.Stack, { direction: "row", gap: 2, flexWrap: "nowrap" }, /* @__PURE__ */ React40.createElement(ControlLabel, null, label), /* @__PURE__ */ React40.createElement(import_ui33.Tooltip, { title: isLinked ? unlinkedLabel : linkedLabel, placement: "top" }, /* @__PURE__ */ React40.createElement(
    import_ui33.ToggleButton,
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
  ))), /* @__PURE__ */ React40.createElement(import_ui33.Stack, { direction: "row", gap: 2, flexWrap: "nowrap", ref: stackRef }, /* @__PURE__ */ React40.createElement(import_ui33.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React40.createElement(import_ui33.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React40.createElement(ControlFormLabel, null, (0, import_i18n11.__)("Column", "elementor"))), /* @__PURE__ */ React40.createElement(import_ui33.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React40.createElement(Control4, { bind: "column", isLinked, anchorRef: stackRef }))), /* @__PURE__ */ React40.createElement(import_ui33.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React40.createElement(import_ui33.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React40.createElement(ControlFormLabel, null, (0, import_i18n11.__)("Row", "elementor"))), /* @__PURE__ */ React40.createElement(import_ui33.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React40.createElement(Control4, { bind: "row", isLinked, anchorRef: stackRef })))));
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
var React41 = __toESM(require("react"));
var import_react24 = require("react");
var import_editor_props19 = require("@elementor/editor-props");
var import_editor_ui6 = require("@elementor/editor-ui");
var import_icons12 = require("@elementor/icons");
var import_ui34 = require("@elementor/ui");
var import_i18n12 = require("@wordpress/i18n");
var RATIO_OPTIONS = [
  { label: (0, import_i18n12.__)("Auto", "elementor"), value: "auto" },
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
  const { value: aspectRatioValue, setValue: setAspectRatioValue, disabled } = useBoundProp(import_editor_props19.stringPropTypeUtil);
  const isCustomSelected = aspectRatioValue && !RATIO_OPTIONS.some((option) => option.value === aspectRatioValue);
  const [initialWidth, initialHeight] = isCustomSelected ? aspectRatioValue.split("/") : ["", ""];
  const [isCustom, setIsCustom] = (0, import_react24.useState)(isCustomSelected);
  const [customWidth, setCustomWidth] = (0, import_react24.useState)(initialWidth);
  const [customHeight, setCustomHeight] = (0, import_react24.useState)(initialHeight);
  const [selectedValue, setSelectedValue] = (0, import_react24.useState)(
    isCustomSelected ? CUSTOM_RATIO : aspectRatioValue || ""
  );
  (0, import_react24.useEffect)(() => {
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
  return /* @__PURE__ */ React41.createElement(ControlActions, null, /* @__PURE__ */ React41.createElement(import_ui34.Stack, { direction: "column", gap: 2 }, /* @__PURE__ */ React41.createElement(import_ui34.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React41.createElement(import_ui34.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React41.createElement(ControlLabel, null, label)), /* @__PURE__ */ React41.createElement(import_ui34.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React41.createElement(
    import_ui34.Select,
    {
      size: "tiny",
      displayEmpty: true,
      sx: { overflow: "hidden" },
      disabled,
      value: selectedValue,
      onChange: handleSelectChange,
      fullWidth: true
    },
    [...RATIO_OPTIONS, { label: (0, import_i18n12.__)("Custom", "elementor"), value: CUSTOM_RATIO }].map(
      ({ label: optionLabel, ...props }) => /* @__PURE__ */ React41.createElement(import_editor_ui6.MenuListItem, { key: props.value, ...props, value: props.value ?? "" }, optionLabel)
    )
  ))), isCustom && /* @__PURE__ */ React41.createElement(import_ui34.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React41.createElement(import_ui34.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React41.createElement(
    import_ui34.TextField,
    {
      size: "tiny",
      type: "number",
      fullWidth: true,
      disabled,
      value: customWidth,
      onChange: handleCustomWidthChange,
      InputProps: {
        startAdornment: /* @__PURE__ */ React41.createElement(import_icons12.ArrowsMoveHorizontalIcon, { fontSize: "tiny" })
      }
    }
  )), /* @__PURE__ */ React41.createElement(import_ui34.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React41.createElement(
    import_ui34.TextField,
    {
      size: "tiny",
      type: "number",
      fullWidth: true,
      disabled,
      value: customHeight,
      onChange: handleCustomHeightChange,
      InputProps: {
        startAdornment: /* @__PURE__ */ React41.createElement(import_icons12.ArrowsMoveVerticalIcon, { fontSize: "tiny" })
      }
    }
  )))));
});

// src/controls/svg-media-control.tsx
var React43 = __toESM(require("react"));
var import_react26 = require("react");
var import_editor_props20 = require("@elementor/editor-props");
var import_icons13 = require("@elementor/icons");
var import_ui36 = require("@elementor/ui");
var import_wp_media2 = require("@elementor/wp-media");
var import_i18n14 = require("@wordpress/i18n");

// src/components/enable-unfiltered-modal.tsx
var React42 = __toESM(require("react"));
var import_react25 = require("react");
var import_editor_current_user = require("@elementor/editor-current-user");
var import_ui35 = require("@elementor/ui");
var import_i18n13 = require("@wordpress/i18n");
var ADMIN_TITLE_TEXT = (0, import_i18n13.__)("Enable Unfiltered Uploads", "elementor");
var ADMIN_CONTENT_TEXT = (0, import_i18n13.__)(
  "Before you enable unfiltered files upload, note that such files include a security risk. Elementor does run a process to remove possible malicious code, but there is still risk involved when using such files.",
  "elementor"
);
var NON_ADMIN_TITLE_TEXT = (0, import_i18n13.__)("Sorry, you can't upload that file yet", "elementor");
var NON_ADMIN_CONTENT_TEXT = (0, import_i18n13.__)(
  "This is because this file type may pose a security risk. To upload them anyway, ask the site administrator to enable unfiltered file uploads.",
  "elementor"
);
var ADMIN_FAILED_CONTENT_TEXT_PT1 = (0, import_i18n13.__)("Failed to enable unfiltered files upload.", "elementor");
var ADMIN_FAILED_CONTENT_TEXT_PT2 = (0, import_i18n13.__)(
  "You can try again, if the problem persists, please contact support.",
  "elementor"
);
var WAIT_FOR_CLOSE_TIMEOUT_MS = 300;
var EnableUnfilteredModal = (props) => {
  const { mutateAsync, isPending } = useUpdateUnfilteredFilesUpload();
  const { canUser } = (0, import_editor_current_user.useCurrentUserCapabilities)();
  const [isError, setIsError] = (0, import_react25.useState)(false);
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
var AdminDialog = ({ open, onClose, handleEnable, isPending, isError }) => /* @__PURE__ */ React42.createElement(import_ui35.Dialog, { open, maxWidth: "sm", onClose: () => onClose(false) }, /* @__PURE__ */ React42.createElement(import_ui35.DialogHeader, { logo: false }, /* @__PURE__ */ React42.createElement(import_ui35.DialogTitle, null, ADMIN_TITLE_TEXT)), /* @__PURE__ */ React42.createElement(import_ui35.Divider, null), /* @__PURE__ */ React42.createElement(import_ui35.DialogContent, null, /* @__PURE__ */ React42.createElement(import_ui35.DialogContentText, null, isError ? /* @__PURE__ */ React42.createElement(React42.Fragment, null, ADMIN_FAILED_CONTENT_TEXT_PT1, " ", /* @__PURE__ */ React42.createElement("br", null), " ", ADMIN_FAILED_CONTENT_TEXT_PT2) : ADMIN_CONTENT_TEXT)), /* @__PURE__ */ React42.createElement(import_ui35.DialogActions, null, /* @__PURE__ */ React42.createElement(import_ui35.Button, { size: "medium", color: "secondary", onClick: () => onClose(false) }, (0, import_i18n13.__)("Cancel", "elementor")), /* @__PURE__ */ React42.createElement(
  import_ui35.Button,
  {
    size: "medium",
    onClick: () => handleEnable(),
    variant: "contained",
    color: "primary",
    disabled: isPending
  },
  isPending ? /* @__PURE__ */ React42.createElement(import_ui35.CircularProgress, { size: 24 }) : (0, import_i18n13.__)("Enable", "elementor")
)));
var NonAdminDialog = ({ open, onClose }) => /* @__PURE__ */ React42.createElement(import_ui35.Dialog, { open, maxWidth: "sm", onClose: () => onClose(false) }, /* @__PURE__ */ React42.createElement(import_ui35.DialogHeader, { logo: false }, /* @__PURE__ */ React42.createElement(import_ui35.DialogTitle, null, NON_ADMIN_TITLE_TEXT)), /* @__PURE__ */ React42.createElement(import_ui35.Divider, null), /* @__PURE__ */ React42.createElement(import_ui35.DialogContent, null, /* @__PURE__ */ React42.createElement(import_ui35.DialogContentText, null, NON_ADMIN_CONTENT_TEXT)), /* @__PURE__ */ React42.createElement(import_ui35.DialogActions, null, /* @__PURE__ */ React42.createElement(import_ui35.Button, { size: "medium", onClick: () => onClose(false), variant: "contained", color: "primary" }, (0, import_i18n13.__)("Got it", "elementor"))));

// src/controls/svg-media-control.tsx
var TILE_SIZE = 8;
var TILE_WHITE = "transparent";
var TILE_BLACK = "#c1c1c1";
var TILES_GRADIENT_FORMULA = `linear-gradient(45deg, ${TILE_BLACK} 25%, ${TILE_WHITE} 0, ${TILE_WHITE} 75%, ${TILE_BLACK} 0, ${TILE_BLACK})`;
var StyledCard = (0, import_ui36.styled)(import_ui36.Card)`
	background-color: white;
	background-image: ${TILES_GRADIENT_FORMULA}, ${TILES_GRADIENT_FORMULA};
	background-size: ${TILE_SIZE}px ${TILE_SIZE}px;
	background-position:
		0 0,
		${TILE_SIZE / 2}px ${TILE_SIZE / 2}px;
	border: none;
`;
var StyledCardMediaContainer = (0, import_ui36.styled)(import_ui36.Stack)`
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
  const { value, setValue } = useBoundProp(import_editor_props20.imageSrcPropTypeUtil);
  const { id, url } = value ?? {};
  const { data: attachment, isFetching } = (0, import_wp_media2.useWpMediaAttachment)(id?.value || null);
  const src = attachment?.url ?? url?.value ?? null;
  const { data: allowSvgUpload } = useUnfilteredFilesUpload();
  const [unfilteredModalOpenState, setUnfilteredModalOpenState] = (0, import_react26.useState)(false);
  const { open } = (0, import_wp_media2.useWpMediaFrame)({
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
  return /* @__PURE__ */ React43.createElement(import_ui36.Stack, { gap: 1 }, /* @__PURE__ */ React43.createElement(EnableUnfilteredModal, { open: unfilteredModalOpenState, onClose: onCloseUnfilteredModal }), /* @__PURE__ */ React43.createElement(ControlFormLabel, null, " ", (0, import_i18n14.__)("SVG", "elementor"), " "), /* @__PURE__ */ React43.createElement(ControlActions, null, /* @__PURE__ */ React43.createElement(StyledCard, { variant: "outlined" }, /* @__PURE__ */ React43.createElement(StyledCardMediaContainer, null, isFetching ? /* @__PURE__ */ React43.createElement(import_ui36.CircularProgress, { role: "progressbar" }) : /* @__PURE__ */ React43.createElement(
    import_ui36.CardMedia,
    {
      component: "img",
      image: src,
      alt: (0, import_i18n14.__)("Preview SVG", "elementor"),
      sx: { maxHeight: "140px", width: "50px" }
    }
  )), /* @__PURE__ */ React43.createElement(
    import_ui36.CardOverlay,
    {
      sx: {
        "&:hover": {
          backgroundColor: "rgba( 0, 0, 0, 0.75 )"
        }
      }
    },
    /* @__PURE__ */ React43.createElement(import_ui36.Stack, { gap: 1 }, /* @__PURE__ */ React43.createElement(
      import_ui36.Button,
      {
        size: "tiny",
        color: "inherit",
        variant: "outlined",
        onClick: () => handleClick(MODE_BROWSE)
      },
      (0, import_i18n14.__)("Select SVG", "elementor")
    ), /* @__PURE__ */ React43.createElement(
      import_ui36.Button,
      {
        size: "tiny",
        variant: "text",
        color: "inherit",
        startIcon: /* @__PURE__ */ React43.createElement(import_icons13.UploadIcon, null),
        onClick: () => handleClick(MODE_UPLOAD)
      },
      (0, import_i18n14.__)("Upload", "elementor")
    ))
  ))));
});

// src/controls/background-control/background-control.tsx
var React50 = __toESM(require("react"));
var import_editor_props26 = require("@elementor/editor-props");
var import_editor_v1_adapters4 = require("@elementor/editor-v1-adapters");
var import_ui44 = require("@elementor/ui");
var import_i18n20 = require("@wordpress/i18n");

// src/controls/background-control/background-overlay/background-overlay-repeater-control.tsx
var React49 = __toESM(require("react"));
var import_editor_props25 = require("@elementor/editor-props");
var import_ui43 = require("@elementor/ui");
var import_wp_media3 = require("@elementor/wp-media");
var import_i18n19 = require("@wordpress/i18n");

// src/env.ts
var import_env = require("@elementor/env");
var { env } = (0, import_env.parseEnv)("@elementor/editor-controls");

// src/controls/background-control/background-gradient-color-control.tsx
var React44 = __toESM(require("react"));
var import_editor_props21 = require("@elementor/editor-props");
var import_ui37 = require("@elementor/ui");
var BackgroundGradientColorControl = createControl(() => {
  const { value, setValue } = useBoundProp(import_editor_props21.backgroundGradientOverlayPropTypeUtil);
  const handleChange = (newValue) => {
    const transformedValue = createTransformableValue(newValue);
    if (transformedValue.positions) {
      transformedValue.positions = import_editor_props21.stringPropTypeUtil.create(newValue.positions.join(" "));
    }
    setValue(transformedValue);
  };
  const createTransformableValue = (newValue) => ({
    ...newValue,
    type: import_editor_props21.stringPropTypeUtil.create(newValue.type),
    angle: import_editor_props21.numberPropTypeUtil.create(newValue.angle),
    stops: import_editor_props21.gradientColorStopPropTypeUtil.create(
      newValue.stops.map(
        ({ color, offset }) => import_editor_props21.colorStopPropTypeUtil.create({
          color: import_editor_props21.colorPropTypeUtil.create(color),
          offset: import_editor_props21.numberPropTypeUtil.create(offset)
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
    import_ui37.UnstableGradientBox,
    {
      sx: { width: "auto", padding: 1.5 },
      value: normalizeValue(),
      onChange: handleChange
    }
  ));
});
var initialBackgroundGradientOverlay = import_editor_props21.backgroundGradientOverlayPropTypeUtil.create({
  type: import_editor_props21.stringPropTypeUtil.create("linear"),
  angle: import_editor_props21.numberPropTypeUtil.create(180),
  stops: import_editor_props21.gradientColorStopPropTypeUtil.create([
    import_editor_props21.colorStopPropTypeUtil.create({
      color: import_editor_props21.colorPropTypeUtil.create("rgb(0,0,0)"),
      offset: import_editor_props21.numberPropTypeUtil.create(0)
    }),
    import_editor_props21.colorStopPropTypeUtil.create({
      color: import_editor_props21.colorPropTypeUtil.create("rgb(255,255,255)"),
      offset: import_editor_props21.numberPropTypeUtil.create(100)
    })
  ])
});

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-attachment.tsx
var React45 = __toESM(require("react"));
var import_icons14 = require("@elementor/icons");
var import_ui38 = require("@elementor/ui");
var import_i18n15 = require("@wordpress/i18n");
var attachmentControlOptions = [
  {
    value: "fixed",
    label: (0, import_i18n15.__)("Fixed", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(import_icons14.PinIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "scroll",
    label: (0, import_i18n15.__)("Scroll", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(import_icons14.PinnedOffIcon, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlayAttachment = () => {
  return /* @__PURE__ */ React45.createElement(PopoverGridContainer, null, /* @__PURE__ */ React45.createElement(import_ui38.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React45.createElement(ControlFormLabel, null, (0, import_i18n15.__)("Attachment", "elementor"))), /* @__PURE__ */ React45.createElement(import_ui38.Grid, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end", overflow: "hidden" } }, /* @__PURE__ */ React45.createElement(ToggleControl, { options: attachmentControlOptions })));
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-position.tsx
var React46 = __toESM(require("react"));
var import_react27 = require("react");
var import_editor_props22 = require("@elementor/editor-props");
var import_editor_ui7 = require("@elementor/editor-ui");
var import_icons15 = require("@elementor/icons");
var import_ui39 = require("@elementor/ui");
var import_i18n16 = require("@wordpress/i18n");
var backgroundPositionOptions = [
  { label: (0, import_i18n16.__)("Center center", "elementor"), value: "center center" },
  { label: (0, import_i18n16.__)("Center left", "elementor"), value: "center left" },
  { label: (0, import_i18n16.__)("Center right", "elementor"), value: "center right" },
  { label: (0, import_i18n16.__)("Top center", "elementor"), value: "top center" },
  { label: (0, import_i18n16.__)("Top left", "elementor"), value: "top left" },
  { label: (0, import_i18n16.__)("Top right", "elementor"), value: "top right" },
  { label: (0, import_i18n16.__)("Bottom center", "elementor"), value: "bottom center" },
  { label: (0, import_i18n16.__)("Bottom left", "elementor"), value: "bottom left" },
  { label: (0, import_i18n16.__)("Bottom right", "elementor"), value: "bottom right" },
  { label: (0, import_i18n16.__)("Custom", "elementor"), value: "custom" }
];
var BackgroundImageOverlayPosition = () => {
  const backgroundImageOffsetContext = useBoundProp(import_editor_props22.backgroundImagePositionOffsetPropTypeUtil);
  const stringPropContext = useBoundProp(import_editor_props22.stringPropTypeUtil);
  const isCustom = !!backgroundImageOffsetContext.value;
  const rowRef = (0, import_react27.useRef)(null);
  const handlePositionChange = (event) => {
    const value = event.target.value || null;
    if (value === "custom") {
      backgroundImageOffsetContext.setValue({ x: null, y: null });
    } else {
      stringPropContext.setValue(value);
    }
  };
  return /* @__PURE__ */ React46.createElement(import_ui39.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React46.createElement(import_ui39.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React46.createElement(PopoverGridContainer, null, /* @__PURE__ */ React46.createElement(import_ui39.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React46.createElement(ControlFormLabel, null, (0, import_i18n16.__)("Position", "elementor"))), /* @__PURE__ */ React46.createElement(import_ui39.Grid, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end", overflow: "hidden" } }, /* @__PURE__ */ React46.createElement(
    import_ui39.Select,
    {
      fullWidth: true,
      size: "tiny",
      onChange: handlePositionChange,
      disabled: stringPropContext.disabled,
      value: (backgroundImageOffsetContext.value ? "custom" : stringPropContext.value) ?? ""
    },
    backgroundPositionOptions.map(({ label, value }) => /* @__PURE__ */ React46.createElement(import_editor_ui7.MenuListItem, { key: value, value: value ?? "" }, label))
  )))), isCustom ? /* @__PURE__ */ React46.createElement(PropProvider, { ...backgroundImageOffsetContext }, /* @__PURE__ */ React46.createElement(import_ui39.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React46.createElement(import_ui39.Grid, { container: true, spacing: 1.5, ref: rowRef }, /* @__PURE__ */ React46.createElement(import_ui39.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React46.createElement(PropKeyProvider, { bind: "x" }, /* @__PURE__ */ React46.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React46.createElement(import_icons15.LetterXIcon, { fontSize: "tiny" }),
      anchorRef: rowRef
    }
  ))), /* @__PURE__ */ React46.createElement(import_ui39.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React46.createElement(PropKeyProvider, { bind: "y" }, /* @__PURE__ */ React46.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React46.createElement(import_icons15.LetterYIcon, { fontSize: "tiny" }),
      anchorRef: rowRef
    }
  )))))) : null);
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-repeat.tsx
var React47 = __toESM(require("react"));
var import_icons16 = require("@elementor/icons");
var import_ui40 = require("@elementor/ui");
var import_i18n17 = require("@wordpress/i18n");
var repeatControlOptions = [
  {
    value: "repeat",
    label: (0, import_i18n17.__)("Repeat", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(import_icons16.GridDotsIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "repeat-x",
    label: (0, import_i18n17.__)("Repeat-x", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(import_icons16.DotsHorizontalIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "repeat-y",
    label: (0, import_i18n17.__)("Repeat-y", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(import_icons16.DotsVerticalIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "no-repeat",
    label: (0, import_i18n17.__)("No-repeat", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(import_icons16.XIcon, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlayRepeat = () => {
  return /* @__PURE__ */ React47.createElement(PopoverGridContainer, null, /* @__PURE__ */ React47.createElement(import_ui40.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React47.createElement(ControlFormLabel, null, (0, import_i18n17.__)("Repeat", "elementor"))), /* @__PURE__ */ React47.createElement(import_ui40.Grid, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React47.createElement(ToggleControl, { options: repeatControlOptions })));
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-size.tsx
var React48 = __toESM(require("react"));
var import_react28 = require("react");
var import_editor_props23 = require("@elementor/editor-props");
var import_icons17 = require("@elementor/icons");
var import_ui41 = require("@elementor/ui");
var import_i18n18 = require("@wordpress/i18n");
var sizeControlOptions = [
  {
    value: "auto",
    label: (0, import_i18n18.__)("Auto", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(import_icons17.LetterAIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "cover",
    label: (0, import_i18n18.__)("Cover", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(import_icons17.ArrowsMaximizeIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "contain",
    label: (0, import_i18n18.__)("Contain", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(import_icons17.ArrowBarBothIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "custom",
    label: (0, import_i18n18.__)("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(import_icons17.PencilIcon, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlaySize = () => {
  const backgroundImageScaleContext = useBoundProp(import_editor_props23.backgroundImageSizeScalePropTypeUtil);
  const stringPropContext = useBoundProp(import_editor_props23.stringPropTypeUtil);
  const isCustom = !!backgroundImageScaleContext.value;
  const rowRef = (0, import_react28.useRef)(null);
  const handleSizeChange = (size) => {
    if (size === "custom") {
      backgroundImageScaleContext.setValue({ width: null, height: null });
    } else {
      stringPropContext.setValue(size);
    }
  };
  return /* @__PURE__ */ React48.createElement(import_ui41.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React48.createElement(import_ui41.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React48.createElement(PopoverGridContainer, null, /* @__PURE__ */ React48.createElement(import_ui41.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React48.createElement(ControlFormLabel, null, (0, import_i18n18.__)("Size", "elementor"))), /* @__PURE__ */ React48.createElement(import_ui41.Grid, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React48.createElement(
    ControlToggleButtonGroup,
    {
      exclusive: true,
      items: sizeControlOptions,
      onChange: handleSizeChange,
      disabled: stringPropContext.disabled,
      value: backgroundImageScaleContext.value ? "custom" : stringPropContext.value
    }
  )))), isCustom ? /* @__PURE__ */ React48.createElement(PropProvider, { ...backgroundImageScaleContext }, /* @__PURE__ */ React48.createElement(import_ui41.Grid, { item: true, xs: 12, ref: rowRef }, /* @__PURE__ */ React48.createElement(PopoverGridContainer, null, /* @__PURE__ */ React48.createElement(import_ui41.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React48.createElement(PropKeyProvider, { bind: "width" }, /* @__PURE__ */ React48.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React48.createElement(import_icons17.ArrowsMoveHorizontalIcon, { fontSize: "tiny" }),
      extendedOptions: ["auto"],
      anchorRef: rowRef
    }
  ))), /* @__PURE__ */ React48.createElement(import_ui41.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React48.createElement(PropKeyProvider, { bind: "height" }, /* @__PURE__ */ React48.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React48.createElement(import_icons17.ArrowsMoveVerticalIcon, { fontSize: "tiny" }),
      extendedOptions: ["auto"],
      anchorRef: rowRef
    }
  )))))) : null);
};

// src/controls/background-control/background-overlay/use-background-tabs-history.ts
var import_react29 = require("react");
var import_editor_props24 = require("@elementor/editor-props");
var import_ui42 = require("@elementor/ui");
var useBackgroundTabsHistory = ({
  color: initialBackgroundColorOverlay2,
  image: initialBackgroundImageOverlay,
  gradient: initialBackgroundGradientOverlay2
}) => {
  const { value: imageValue, setValue: setImageValue } = useBoundProp(import_editor_props24.backgroundImageOverlayPropTypeUtil);
  const { value: colorValue, setValue: setColorValue } = useBoundProp(import_editor_props24.backgroundColorOverlayPropTypeUtil);
  const { value: gradientValue, setValue: setGradientValue } = useBoundProp(import_editor_props24.backgroundGradientOverlayPropTypeUtil);
  const getCurrentOverlayType = () => {
    if (colorValue) {
      return "color";
    }
    if (gradientValue) {
      return "gradient";
    }
    return "image";
  };
  const { getTabsProps, getTabProps, getTabPanelProps } = (0, import_ui42.useTabs)(getCurrentOverlayType());
  const valuesHistory = (0, import_react29.useRef)({
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
var initialBackgroundColorOverlay = import_editor_props25.backgroundColorOverlayPropTypeUtil.create(
  {
    color: import_editor_props25.colorPropTypeUtil.create(DEFAULT_BACKGROUND_COLOR_OVERLAY_COLOR)
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
  { label: (0, import_i18n19.__)("Thumbnail - 150 x 150", "elementor"), value: "thumbnail" },
  { label: (0, import_i18n19.__)("Medium - 300 x 300", "elementor"), value: "medium" },
  { label: (0, import_i18n19.__)("Large 1024 x 1024", "elementor"), value: "large" },
  { label: (0, import_i18n19.__)("Full", "elementor"), value: "full" }
];
var BackgroundOverlayRepeaterControl = createControl(() => {
  const { propType, value: overlayValues, setValue, disabled } = useBoundProp(import_editor_props25.backgroundOverlayPropTypeUtil);
  return /* @__PURE__ */ React49.createElement(PropProvider, { propType, value: overlayValues, setValue, disabled }, /* @__PURE__ */ React49.createElement(
    Repeater,
    {
      openOnAdd: true,
      disabled,
      values: overlayValues ?? [],
      setValues: setValue,
      label: (0, import_i18n19.__)("Overlay", "elementor"),
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
  return /* @__PURE__ */ React49.createElement(import_ui43.Box, { sx: { width: "100%" } }, /* @__PURE__ */ React49.createElement(import_ui43.Box, { sx: { borderBottom: 1, borderColor: "divider" } }, /* @__PURE__ */ React49.createElement(
    import_ui43.Tabs,
    {
      size: "small",
      variant: "fullWidth",
      ...getTabsProps(),
      "aria-label": (0, import_i18n19.__)("Background Overlay", "elementor")
    },
    /* @__PURE__ */ React49.createElement(import_ui43.Tab, { label: (0, import_i18n19.__)("Image", "elementor"), ...getTabProps("image") }),
    /* @__PURE__ */ React49.createElement(import_ui43.Tab, { label: (0, import_i18n19.__)("Gradient", "elementor"), ...getTabProps("gradient") }),
    /* @__PURE__ */ React49.createElement(import_ui43.Tab, { label: (0, import_i18n19.__)("Color", "elementor"), ...getTabProps("color") })
  )), /* @__PURE__ */ React49.createElement(import_ui43.TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("image") }, /* @__PURE__ */ React49.createElement(PopoverContent, null, /* @__PURE__ */ React49.createElement(ImageOverlayContent, null))), /* @__PURE__ */ React49.createElement(import_ui43.TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("gradient") }, /* @__PURE__ */ React49.createElement(BackgroundGradientColorControl, null)), /* @__PURE__ */ React49.createElement(import_ui43.TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("color") }, /* @__PURE__ */ React49.createElement(PopoverContent, null, /* @__PURE__ */ React49.createElement(ColorOverlayContent, { anchorEl }))));
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
    import_ui43.CardMedia,
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
    return /* @__PURE__ */ React49.createElement("span", null, (0, import_i18n19.__)("Linear Gradient", "elementor"));
  }
  return /* @__PURE__ */ React49.createElement("span", null, (0, import_i18n19.__)("Radial Gradient", "elementor"));
};
var ColorOverlayContent = ({ anchorEl }) => {
  const propContext = useBoundProp(import_editor_props25.backgroundColorOverlayPropTypeUtil);
  return /* @__PURE__ */ React49.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "color" }, /* @__PURE__ */ React49.createElement(ColorControl, { anchorEl })));
};
var ImageOverlayContent = () => {
  const propContext = useBoundProp(import_editor_props25.backgroundImageOverlayPropTypeUtil);
  return /* @__PURE__ */ React49.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "image" }, /* @__PURE__ */ React49.createElement(import_ui43.Grid, { container: true, spacing: 1, alignItems: "center" }, /* @__PURE__ */ React49.createElement(import_ui43.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React49.createElement(
    ImageControl,
    {
      resolutionLabel: (0, import_i18n19.__)("Resolution", "elementor"),
      sizes: backgroundResolutionOptions
    }
  )))), /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "position" }, /* @__PURE__ */ React49.createElement(BackgroundImageOverlayPosition, null)), /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "repeat" }, /* @__PURE__ */ React49.createElement(BackgroundImageOverlayRepeat, null)), /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "size" }, /* @__PURE__ */ React49.createElement(BackgroundImageOverlaySize, null)), /* @__PURE__ */ React49.createElement(PropKeyProvider, { bind: "attachment" }, /* @__PURE__ */ React49.createElement(BackgroundImageOverlayAttachment, null)));
};
var StyledUnstableColorIndicator = (0, import_ui43.styled)(import_ui43.UnstableColorIndicator)(({ theme }) => ({
  borderRadius: `${theme.shape.borderRadius / 2}px`
}));
var useImage = (image) => {
  let imageTitle, imageUrl = null;
  const imageSrc = image?.value.image.value?.src.value;
  const { data: attachment } = (0, import_wp_media3.useWpMediaAttachment)(imageSrc.id?.value || null);
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
  const propContext = useBoundProp(import_editor_props26.backgroundPropTypeUtil);
  const isUsingNestedProps = (0, import_editor_v1_adapters4.isExperimentActive)("e_v_3_30");
  const colorLabel = (0, import_i18n20.__)("Color", "elementor");
  return /* @__PURE__ */ React50.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React50.createElement(PropKeyProvider, { bind: "background-overlay" }, /* @__PURE__ */ React50.createElement(BackgroundOverlayRepeaterControl, null)), /* @__PURE__ */ React50.createElement(PropKeyProvider, { bind: "color" }, /* @__PURE__ */ React50.createElement(import_ui44.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React50.createElement(import_ui44.Grid, { item: true, xs: 6 }, isUsingNestedProps ? /* @__PURE__ */ React50.createElement(ControlLabel, null, colorLabel) : /* @__PURE__ */ React50.createElement(ControlFormLabel, null, colorLabel)), /* @__PURE__ */ React50.createElement(import_ui44.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React50.createElement(ColorControl, null)))));
});

// src/controls/switch-control.tsx
var React51 = __toESM(require("react"));
var import_editor_props27 = require("@elementor/editor-props");
var import_ui45 = require("@elementor/ui");
var SwitchControl2 = createControl(() => {
  const { value, setValue, disabled } = useBoundProp(import_editor_props27.booleanPropTypeUtil);
  const handleChange = (event) => {
    setValue(event.target.checked);
  };
  return /* @__PURE__ */ React51.createElement("div", { style: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React51.createElement(import_ui45.Switch, { checked: !!value, onChange: handleChange, size: "small", disabled }));
});

// src/controls/repeatable-control.tsx
var React52 = __toESM(require("react"));
var import_react31 = require("react");
var import_editor_props28 = require("@elementor/editor-props");
var import_ui46 = require("@elementor/ui");

// src/hooks/use-repeatable-control-context.ts
var import_react30 = require("react");
var RepeatableControlContext = (0, import_react30.createContext)(void 0);
var useRepeatableControlContext = () => {
  const context = (0, import_react30.useContext)(RepeatableControlContext);
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
    const childArrayPropTypeUtil = (0, import_react31.useMemo)(
      () => (0, import_editor_props28.createArrayPropUtils)(childPropTypeUtil.key, childPropTypeUtil.schema),
      [childPropTypeUtil.key, childPropTypeUtil.schema]
    );
    const { propType, value, setValue } = useBoundProp(childArrayPropTypeUtil);
    const ItemLabel4 = ({ value: itemValue }) => {
      const pattern = patternLabel || "";
      const finalLabel = interpolate(pattern, itemValue.value);
      if (finalLabel) {
        return /* @__PURE__ */ React52.createElement("span", null, finalLabel);
      }
      return /* @__PURE__ */ React52.createElement(import_ui46.Box, { component: "span", color: "text.tertiary" }, placeholder);
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
var React53 = __toESM(require("react"));
var import_react32 = require("react");
var import_editor_props29 = require("@elementor/editor-props");
var import_ui47 = require("@elementor/ui");
var import_i18n21 = require("@wordpress/i18n");
var KeyValueControl = createControl((props = {}) => {
  const { value, setValue } = useBoundProp(import_editor_props29.keyValuePropTypeUtil);
  const [keyError, setKeyError] = (0, import_react32.useState)(null);
  const [valueError, setValueError] = (0, import_react32.useState)(null);
  const [sessionState, setSessionState] = (0, import_react32.useState)({
    key: value?.key?.value || "",
    value: value?.value?.value || ""
  });
  const keyLabel = props.keyName || (0, import_i18n21.__)("Key", "elementor");
  const valueLabel = props.valueName || (0, import_i18n21.__)("Value", "elementor");
  const [keyRegex, valueRegex, errMsg] = (0, import_react32.useMemo)(
    () => [
      props.regexKey ? new RegExp(props.regexKey) : void 0,
      props.regexValue ? new RegExp(props.regexValue) : void 0,
      props.validationErrorMessage || (0, import_i18n21.__)("Invalid Format", "elementor")
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
  return /* @__PURE__ */ React53.createElement(ControlActions, null, /* @__PURE__ */ React53.createElement(import_ui47.Grid, { container: true, gap: 1.5 }, /* @__PURE__ */ React53.createElement(import_ui47.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React53.createElement(import_ui47.FormLabel, { size: "tiny" }, keyLabel), /* @__PURE__ */ React53.createElement(
    import_ui47.TextField,
    {
      autoFocus: true,
      sx: { pt: 1 },
      size: "tiny",
      fullWidth: true,
      value: sessionState.key,
      onChange: (e) => handleChange(e, "key"),
      error: isKeyInvalid
    }
  ), isKeyInvalid && /* @__PURE__ */ React53.createElement(import_ui47.FormHelperText, { error: true }, keyError)), /* @__PURE__ */ React53.createElement(import_ui47.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React53.createElement(import_ui47.FormLabel, { size: "tiny" }, valueLabel), /* @__PURE__ */ React53.createElement(
    import_ui47.TextField,
    {
      sx: { pt: 1 },
      size: "tiny",
      fullWidth: true,
      value: sessionState.value,
      onChange: (e) => handleChange(e, "value"),
      disabled: isKeyInvalid,
      error: isValueInvalid
    }
  ), isValueInvalid && /* @__PURE__ */ React53.createElement(import_ui47.FormHelperText, { error: true }, valueError))));
});

// src/controls/position-control.tsx
var React54 = __toESM(require("react"));
var import_react33 = require("react");
var import_editor_props30 = require("@elementor/editor-props");
var import_editor_ui8 = require("@elementor/editor-ui");
var import_editor_v1_adapters5 = require("@elementor/editor-v1-adapters");
var import_icons18 = require("@elementor/icons");
var import_ui48 = require("@elementor/ui");
var import_i18n22 = require("@wordpress/i18n");
var positionOptions = [
  { label: (0, import_i18n22.__)("Center center", "elementor"), value: "center center" },
  { label: (0, import_i18n22.__)("Center left", "elementor"), value: "center left" },
  { label: (0, import_i18n22.__)("Center right", "elementor"), value: "center right" },
  { label: (0, import_i18n22.__)("Top center", "elementor"), value: "top center" },
  { label: (0, import_i18n22.__)("Top left", "elementor"), value: "top left" },
  { label: (0, import_i18n22.__)("Top right", "elementor"), value: "top right" },
  { label: (0, import_i18n22.__)("Bottom center", "elementor"), value: "bottom center" },
  { label: (0, import_i18n22.__)("Bottom left", "elementor"), value: "bottom left" },
  { label: (0, import_i18n22.__)("Bottom right", "elementor"), value: "bottom right" }
];
var PositionControl = () => {
  const positionContext = useBoundProp(import_editor_props30.positionPropTypeUtil);
  const stringPropContext = useBoundProp(import_editor_props30.stringPropTypeUtil);
  const isVersion331Active = (0, import_editor_v1_adapters5.isExperimentActive)("e_v_3_31");
  const isCustom = !!positionContext.value && isVersion331Active;
  const availablePositionOptions = (0, import_react33.useMemo)(() => {
    const options = [...positionOptions];
    if (isVersion331Active) {
      options.push({ label: (0, import_i18n22.__)("Custom", "elementor"), value: "custom" });
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
  return /* @__PURE__ */ React54.createElement(import_ui48.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React54.createElement(import_ui48.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React54.createElement(import_ui48.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React54.createElement(import_ui48.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React54.createElement(ControlFormLabel, null, (0, import_i18n22.__)("Object position", "elementor"))), /* @__PURE__ */ React54.createElement(import_ui48.Grid, { item: true, xs: 6, sx: { overflow: "hidden" } }, /* @__PURE__ */ React54.createElement(
    import_ui48.Select,
    {
      size: "tiny",
      disabled: stringPropContext.disabled,
      value: (positionContext.value ? "custom" : stringPropContext.value) ?? "",
      onChange: handlePositionChange,
      fullWidth: true
    },
    availablePositionOptions.map(({ label, value }) => /* @__PURE__ */ React54.createElement(import_editor_ui8.MenuListItem, { key: value, value: value ?? "" }, label))
  )))), isCustom && /* @__PURE__ */ React54.createElement(PropProvider, { ...positionContext }, /* @__PURE__ */ React54.createElement(import_ui48.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React54.createElement(import_ui48.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React54.createElement(import_ui48.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React54.createElement(PropKeyProvider, { bind: "x" }, /* @__PURE__ */ React54.createElement(SizeControl, { startIcon: /* @__PURE__ */ React54.createElement(import_icons18.LetterXIcon, { fontSize: "tiny" }) }))), /* @__PURE__ */ React54.createElement(import_ui48.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React54.createElement(PropKeyProvider, { bind: "y" }, /* @__PURE__ */ React54.createElement(SizeControl, { startIcon: /* @__PURE__ */ React54.createElement(import_icons18.LetterYIcon, { fontSize: "tiny" }) })))))));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
  SwitchControl,
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
});
//# sourceMappingURL=index.js.map