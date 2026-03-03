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
  AttributesControl: () => AttributesControl,
  BackgroundControl: () => BackgroundControl,
  BoxShadowRepeaterControl: () => BoxShadowRepeaterControl,
  ChipsControl: () => ChipsControl,
  ClearIconButton: () => ClearIconButton,
  ColorControl: () => ColorControl,
  ControlActionsProvider: () => ControlActionsProvider,
  ControlAdornments: () => ControlAdornments,
  ControlAdornmentsProvider: () => ControlAdornmentsProvider,
  ControlFormLabel: () => ControlFormLabel,
  ControlReplacementsProvider: () => ControlReplacementsProvider,
  ControlToggleButtonGroup: () => ControlToggleButtonGroup,
  DateTimeControl: () => DateTimeControl,
  DisplayConditionsControl: () => DisplayConditionsControl,
  EmailFormActionControl: () => EmailFormActionControl,
  EqualUnequalSizesControl: () => EqualUnequalSizesControl,
  FilterRepeaterControl: () => FilterRepeaterControl,
  FontFamilyControl: () => FontFamilyControl,
  GapControl: () => GapControl,
  HtmlTagControl: () => HtmlTagControl,
  ImageControl: () => ImageControl,
  InlineEditingControl: () => InlineEditingControl,
  InlineEditor: () => InlineEditor,
  InlineEditorToolbar: () => InlineEditorToolbar,
  ItemSelector: () => ItemSelector,
  KeyValueControl: () => KeyValueControl,
  LinkControl: () => LinkControl,
  LinkedDimensionsControl: () => LinkedDimensionsControl,
  NumberControl: () => NumberControl,
  NumberInput: () => NumberInput,
  PopoverContent: () => PopoverContent,
  PopoverGridContainer: () => PopoverGridContainer,
  PositionControl: () => PositionControl,
  PromotionTrigger: () => PromotionTrigger,
  PropKeyProvider: () => PropKeyProvider,
  PropProvider: () => PropProvider,
  QueryControl: () => QueryControl,
  RepeatableControl: () => RepeatableControl,
  Repeater: () => Repeater3,
  SelectControl: () => SelectControl,
  SelectControlWrapper: () => SelectControlWrapper,
  SizeControl: () => SizeControl,
  StrokeControl: () => StrokeControl,
  SvgMediaControl: () => SvgMediaControl,
  SwitchControl: () => SwitchControl,
  TextAreaControl: () => TextAreaControl,
  TextControl: () => TextControl,
  ToggleButtonGroupUi: () => ToggleButtonGroupUi,
  ToggleControl: () => ToggleControl,
  TransformRepeaterControl: () => TransformRepeaterControl,
  TransformSettingsControl: () => TransformSettingsControl,
  TransitionRepeaterControl: () => TransitionRepeaterControl,
  UnstableSizeField: () => UnstableSizeField,
  UrlControl: () => UrlControl,
  VideoMediaControl: () => VideoMediaControl,
  createControl: () => createControl,
  createControlReplacementsRegistry: () => createControlReplacementsRegistry,
  enqueueFont: () => enqueueFont,
  getControlReplacements: () => getControlReplacements,
  injectIntoRepeaterItemActions: () => injectIntoRepeaterItemActions,
  injectIntoRepeaterItemIcon: () => injectIntoRepeaterItemIcon,
  injectIntoRepeaterItemLabel: () => injectIntoRepeaterItemLabel,
  isUnitExtendedOption: () => isUnitExtendedOption,
  registerControlReplacement: () => registerControlReplacement,
  transitionProperties: () => transitionProperties,
  transitionsItemsList: () => transitionsItemsList,
  useBoundProp: () => useBoundProp,
  useControlActions: () => useControlActions,
  useControlReplacement: () => useControlReplacement,
  useFontFamilies: () => useFontFamilies,
  useSyncExternalState: () => useSyncExternalState,
  useTypingBuffer: () => useTypingBuffer
});
module.exports = __toCommonJS(index_exports);

// src/controls/image-control.tsx
var React13 = __toESM(require("react"));
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
  const [isValid, setIsValid] = (0, import_react3.useState)(true);
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
var React3 = __toESM(require("react"));
var import_ui = require("@elementor/ui");
var ControlFormLabel = (props) => {
  return /* @__PURE__ */ React3.createElement(import_ui.FormLabel, { size: "tiny", ...props });
};

// src/components/control-label.tsx
var React6 = __toESM(require("react"));
var import_ui2 = require("@elementor/ui");

// src/control-adornments/control-adornments.tsx
var React5 = __toESM(require("react"));

// src/control-adornments/control-adornments-context.tsx
var React4 = __toESM(require("react"));
var import_react4 = require("react");
var Context = (0, import_react4.createContext)(null);
var ControlAdornmentsProvider = ({ children, items: items2 }) => /* @__PURE__ */ React4.createElement(Context.Provider, { value: { items: items2 } }, children);
var useControlAdornments = () => {
  const context = (0, import_react4.useContext)(Context);
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
  return /* @__PURE__ */ React6.createElement(import_ui2.Stack, { direction: "row", alignItems: "center", justifyItems: "start", gap: 0.25 }, /* @__PURE__ */ React6.createElement(ControlFormLabel, { ...props }, children), /* @__PURE__ */ React6.createElement(ControlAdornments, null));
};

// src/create-control.tsx
var React8 = __toESM(require("react"));
var import_ui3 = require("@elementor/ui");

// src/control-replacements.tsx
var React7 = __toESM(require("react"));
var import_react5 = require("react");
var ControlReplacementContext = (0, import_react5.createContext)([]);
var ControlReplacementsProvider = ({ replacements, children }) => {
  return /* @__PURE__ */ React7.createElement(ControlReplacementContext.Provider, { value: replacements }, children);
};
var useControlReplacement = (OriginalComponent) => {
  const { value, placeholder } = useBoundProp();
  const replacements = (0, import_react5.useContext)(ControlReplacementContext);
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
    return /* @__PURE__ */ React8.createElement(import_ui3.ErrorBoundary, { fallback: null }, /* @__PURE__ */ React8.createElement(ControlToRender, { ...controlProps }));
  });
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
var React11 = __toESM(require("react"));
var import_editor_props = require("@elementor/editor-props");
var import_icons = require("@elementor/icons");
var import_ui4 = require("@elementor/ui");
var import_wp_media = require("@elementor/wp-media");
var import_i18n = require("@wordpress/i18n");

// src/control-actions/control-actions.tsx
var React10 = __toESM(require("react"));
var import_editor_ui = require("@elementor/editor-ui");

// src/control-actions/control-actions-context.tsx
var React9 = __toESM(require("react"));
var import_react6 = require("react");
var Context2 = (0, import_react6.createContext)(null);
var ControlActionsProvider = ({ children, items: items2 }) => /* @__PURE__ */ React9.createElement(Context2.Provider, { value: { items: items2 } }, children);
var useControlActions = () => {
  const context = (0, import_react6.useContext)(Context2);
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
  return /* @__PURE__ */ React10.createElement(import_editor_ui.FloatingActionsBar, { actions: menuItems }, children);
}

// src/controls/image-media-control.tsx
var ImageMediaControl = createControl(({ mediaTypes = ["image"] }) => {
  const { value, setValue, propType } = useBoundProp(import_editor_props.imageSrcPropTypeUtil);
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
  return /* @__PURE__ */ React11.createElement(ControlActions, null, /* @__PURE__ */ React11.createElement(import_ui4.Card, { variant: "outlined" }, /* @__PURE__ */ React11.createElement(import_ui4.CardMedia, { image: src, sx: { height: propType.meta.isDynamic ? 134 : 150 } }, isFetching ? /* @__PURE__ */ React11.createElement(import_ui4.Stack, { justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }, /* @__PURE__ */ React11.createElement(import_ui4.CircularProgress, null)) : /* @__PURE__ */ React11.createElement(React11.Fragment, null)), /* @__PURE__ */ React11.createElement(import_ui4.CardOverlay, null, /* @__PURE__ */ React11.createElement(import_ui4.Stack, { gap: 1 }, /* @__PURE__ */ React11.createElement(
    import_ui4.Button,
    {
      size: "tiny",
      color: "inherit",
      variant: "outlined",
      onClick: () => open({ mode: "browse" })
    },
    (0, import_i18n.__)("Select image", "elementor")
  ), /* @__PURE__ */ React11.createElement(
    import_ui4.Button,
    {
      size: "tiny",
      variant: "text",
      color: "inherit",
      startIcon: /* @__PURE__ */ React11.createElement(import_icons.UploadIcon, null),
      onClick: () => open({ mode: "upload" })
    },
    (0, import_i18n.__)("Upload", "elementor")
  )))));
});

// src/controls/select-control.tsx
var React12 = __toESM(require("react"));
var import_editor_props2 = require("@elementor/editor-props");
var import_editor_ui2 = require("@elementor/editor-ui");
var import_ui5 = require("@elementor/ui");
var DEFAULT_MENU_PROPS = {
  MenuListProps: {
    sx: {
      maxHeight: "160px"
    }
  }
};
var SelectControl = createControl(
  ({ options, onChange, MenuProps = DEFAULT_MENU_PROPS, ariaLabel }) => {
    const { value, setValue, disabled, placeholder } = useBoundProp(import_editor_props2.stringPropTypeUtil);
    const handleChange = (event) => {
      const newValue = event.target.value || null;
      onChange?.(newValue, value);
      setValue(newValue);
    };
    const isDisabled = disabled || options.length === 0;
    return /* @__PURE__ */ React12.createElement(ControlActions, null, /* @__PURE__ */ React12.createElement(
      import_ui5.Select,
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
              return /* @__PURE__ */ React12.createElement(import_ui5.Typography, { component: "span", variant: "caption", color: "text.tertiary" }, displayText);
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
      options.map(({ label, ...props }) => /* @__PURE__ */ React12.createElement(import_editor_ui2.MenuListItem, { key: props.value, ...props, value: props.value ?? "" }, label))
    ));
  }
);

// src/controls/image-control.tsx
var ImageControl = createControl(({ sizes, label = (0, import_i18n2.__)("Image", "elementor") }) => {
  const propContext = useBoundProp(import_editor_props3.imagePropTypeUtil);
  return /* @__PURE__ */ React13.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React13.createElement(import_ui6.Stack, { gap: 1.5 }, /* @__PURE__ */ React13.createElement(ControlLabel, null, label), /* @__PURE__ */ React13.createElement(ImageSrcControl, null), /* @__PURE__ */ React13.createElement(import_ui6.Grid, { container: true, gap: 1.5, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React13.createElement(import_ui6.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React13.createElement(ControlFormLabel, null, (0, import_i18n2.__)("Resolution", "elementor"))), /* @__PURE__ */ React13.createElement(import_ui6.Grid, { item: true, xs: 6, sx: { overflow: "hidden" } }, /* @__PURE__ */ React13.createElement(ImageSizeControl, { sizes })))));
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
var React14 = __toESM(require("react"));
var import_editor_props4 = require("@elementor/editor-props");
var import_ui7 = require("@elementor/ui");
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
    const { value, setValue, disabled } = useBoundProp(import_editor_props4.stringPropTypeUtil);
    const handleChange = (event) => setValue(event.target.value);
    return /* @__PURE__ */ React14.createElement(ControlActions, null, /* @__PURE__ */ React14.createElement(
      import_ui7.TextField,
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
var React15 = __toESM(require("react"));
var import_editor_props5 = require("@elementor/editor-props");
var import_ui8 = require("@elementor/ui");
var TextAreaControl = createControl(({ placeholder, ariaLabel }) => {
  const { value, setValue, disabled } = useBoundProp(import_editor_props5.stringPropTypeUtil);
  const handleChange = (event) => {
    setValue(event.target.value);
  };
  return /* @__PURE__ */ React15.createElement(ControlActions, null, /* @__PURE__ */ React15.createElement(
    import_ui8.TextField,
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
var React20 = __toESM(require("react"));
var import_react13 = require("react");
var import_editor_props7 = require("@elementor/editor-props");
var import_editor_responsive = require("@elementor/editor-responsive");
var import_ui13 = require("@elementor/ui");

// src/components/size-control/size-input.tsx
var React18 = __toESM(require("react"));
var import_icons2 = require("@elementor/icons");
var import_ui11 = require("@elementor/ui");

// src/hooks/use-typing-buffer.ts
var import_react7 = require("react");
function useTypingBuffer(options = {}) {
  const { limit = 3, timeout = 600 } = options;
  const inputBufferRef = (0, import_react7.useRef)("");
  const timeoutRef = (0, import_react7.useRef)(null);
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
  (0, import_react7.useEffect)(() => {
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
var React17 = __toESM(require("react"));
var import_react9 = require("react");
var import_editor_props6 = require("@elementor/editor-props");
var import_editor_ui3 = require("@elementor/editor-ui");
var import_ui10 = require("@elementor/ui");

// src/components/number-input.tsx
var React16 = __toESM(require("react"));
var import_react8 = require("react");
var import_ui9 = require("@elementor/ui");
var RESTRICTED_INPUT_KEYS = ["e", "E", "+"];
var NumberInput = (0, import_react8.forwardRef)((props, ref) => {
  const [key, setKey] = (0, import_react8.useState)(0);
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
  return /* @__PURE__ */ React16.createElement(import_ui9.TextField, { ...props, ref, key, onKeyDown: handleKeyDown, onBlur: handleBlur });
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
var TextFieldInnerSelection = (0, import_react9.forwardRef)(
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
    const { placeholder: boundPropPlaceholder } = useBoundProp(import_editor_props6.sizePropTypeUtil);
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
  const popupState = (0, import_ui10.usePopupState)({
    variant: "popover",
    popupId: (0, import_react9.useId)()
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
  return /* @__PURE__ */ React17.createElement(import_ui10.InputAdornment, { position: "end" }, /* @__PURE__ */ React17.createElement(
    StyledButton,
    {
      isPrimaryColor: showPrimaryColor,
      size: "small",
      disabled,
      ...(0, import_ui10.bindTrigger)(popupState)
    },
    placeholder ?? alternativeOptionLabels[value] ?? value
  ), /* @__PURE__ */ React17.createElement(import_ui10.Menu, { MenuListProps: { dense: true }, ...(0, import_ui10.bindMenu)(popupState) }, options.map((option, index) => /* @__PURE__ */ React17.createElement(
    import_editor_ui3.MenuListItem,
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
  const { value: externalValue, placeholder } = useBoundProp(import_editor_props6.sizePropTypeUtil);
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
var StyledButton = (0, import_ui10.styled)(import_ui10.Button, {
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
    custom: /* @__PURE__ */ React18.createElement(import_icons2.MathFunctionIcon, { fontSize: "tiny" })
  };
  const InputProps = {
    ...popupAttributes,
    readOnly: isUnitExtendedOption(unit),
    autoComplete: "off",
    onClick,
    onFocus,
    startAdornment: startIcon ? /* @__PURE__ */ React18.createElement(import_ui11.InputAdornment, { position: "start", disabled }, startIcon) : void 0,
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
  return /* @__PURE__ */ React18.createElement(ControlActions, null, /* @__PURE__ */ React18.createElement(import_ui11.Box, null, /* @__PURE__ */ React18.createElement(
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
var React19 = __toESM(require("react"));
var import_react10 = require("react");
var import_editor_ui4 = require("@elementor/editor-ui");
var import_icons3 = require("@elementor/icons");
var import_ui12 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");
var SIZE = "tiny";
var TextFieldPopover = (props) => {
  const { popupState, restoreValue, anchorRef, value, onChange } = props;
  const inputRef = (0, import_react10.useRef)(null);
  (0, import_react10.useEffect)(() => {
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
    import_ui12.Popover,
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
      ...(0, import_ui12.bindPopover)(popupState),
      anchorOrigin: { vertical: "bottom", horizontal: "center" },
      transformOrigin: { vertical: "top", horizontal: "center" },
      onClose: handleClose
    },
    /* @__PURE__ */ React19.createElement(
      import_editor_ui4.PopoverHeader,
      {
        title: (0, import_i18n3.__)("CSS function", "elementor"),
        onClose: handleClose,
        icon: /* @__PURE__ */ React19.createElement(import_icons3.MathFunctionIcon, { fontSize: SIZE })
      }
    ),
    /* @__PURE__ */ React19.createElement(
      import_ui12.TextField,
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
var import_react11 = require("react");
function useSizeExtendedOptions(options, disableCustom) {
  return (0, import_react11.useMemo)(() => {
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
var import_react12 = require("react");
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
  const [internal, setInternal] = (0, import_react12.useState)(toInternal(external, null));
  (0, import_react12.useEffect)(() => {
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
    } = useBoundProp(import_editor_props7.sizePropTypeUtil);
    const actualDefaultUnit = defaultUnit ?? externalPlaceholder?.unit ?? defaultSelectedUnit[variant];
    const activeBreakpoint = (0, import_editor_responsive.useActiveBreakpoint)();
    const actualExtendedOptions = useSizeExtendedOptions(extendedOptions || [], disableCustom ?? false);
    const actualUnits = resolveUnits(propType, enablePropTypeUnits, variant, units2, actualExtendedOptions);
    const popupState = (0, import_ui13.usePopupState)({ variant: "popover" });
    const memorizedExternalState = (0, import_react13.useMemo)(
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
    (0, import_react13.useEffect)(() => {
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
var React23 = __toESM(require("react"));
var import_react14 = require("react");
var import_editor_props9 = require("@elementor/editor-props");
var import_ui16 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");

// src/components/section-content.tsx
var React21 = __toESM(require("react"));
var import_ui14 = require("@elementor/ui");
var SectionContent = ({ gap = 0.5, sx, children }) => /* @__PURE__ */ React21.createElement(import_ui14.Stack, { gap, sx: { ...sx } }, children);

// src/controls/color-control.tsx
var React22 = __toESM(require("react"));
var import_editor_props8 = require("@elementor/editor-props");
var import_ui15 = require("@elementor/ui");
var ColorControl = createControl(
  ({ propTypeUtil = import_editor_props8.colorPropTypeUtil, anchorEl, slotProps = {}, id, ...props }) => {
    const { value, setValue, placeholder: boundPropPlaceholder, disabled } = useBoundProp(propTypeUtil);
    const placeholder = props.placeholder ?? boundPropPlaceholder;
    const handleChange = (selectedColor) => {
      setValue(selectedColor || null);
    };
    return /* @__PURE__ */ React22.createElement(ControlActions, null, /* @__PURE__ */ React22.createElement(
      import_ui15.UnstableColorField,
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
  const propContext = useBoundProp(import_editor_props9.strokePropTypeUtil);
  const rowRef = (0, import_react14.useRef)(null);
  return /* @__PURE__ */ React23.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React23.createElement(SectionContent, null, /* @__PURE__ */ React23.createElement(Control, { bind: "width", label: (0, import_i18n4.__)("Stroke width", "elementor"), ref: rowRef }, /* @__PURE__ */ React23.createElement(SizeControl, { units, anchorRef: rowRef })), /* @__PURE__ */ React23.createElement(Control, { bind: "color", label: (0, import_i18n4.__)("Stroke color", "elementor") }, /* @__PURE__ */ React23.createElement(ColorControl, null))));
});
var Control = (0, import_react14.forwardRef)(({ bind, label, children }, ref) => /* @__PURE__ */ React23.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React23.createElement(import_ui16.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap", ref }, /* @__PURE__ */ React23.createElement(import_ui16.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React23.createElement(ControlFormLabel, null, label)), /* @__PURE__ */ React23.createElement(import_ui16.Grid, { item: true, xs: 6 }, children))));

// src/controls/box-shadow-repeater-control.tsx
var React39 = __toESM(require("react"));
var import_react21 = require("react");
var import_editor_props10 = require("@elementor/editor-props");
var import_ui30 = require("@elementor/ui");
var import_i18n11 = require("@wordpress/i18n");

// src/components/control-repeater/actions/tooltip-add-item-action.tsx
var React25 = __toESM(require("react"));
var import_icons4 = require("@elementor/icons");
var import_ui18 = require("@elementor/ui");
var import_i18n5 = require("@wordpress/i18n");

// src/components/control-repeater/context/repeater-context.tsx
var React24 = __toESM(require("react"));
var import_react16 = require("react");
var import_ui17 = require("@elementor/ui");

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
var import_react15 = require("react");
var ItemContext = (0, import_react15.createContext)({
  index: -1,
  value: {}
});

// src/components/control-repeater/context/repeater-context.tsx
var RepeaterContext = (0, import_react16.createContext)(null);
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
  const [uniqueKeys, setUniqueKeys] = (0, import_react16.useState)(() => {
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
  const itemsWithKeys = (0, import_react16.useMemo)(
    () => uniqueKeys.map((key, index) => ({
      key,
      item: items2[index]
    })).filter(({ item }) => item !== void 0),
    [uniqueKeys, items2]
  );
  const handleSetItems = (newItemsWithKeys) => {
    setItems(newItemsWithKeys.map(({ item }) => item));
  };
  const [openItemIndex, setOpenItemIndex] = (0, import_react16.useState)(EMPTY_OPEN_ITEM);
  const [rowRef, setRowRef] = (0, import_react16.useState)(null);
  const isOpen = openItemIndex !== EMPTY_OPEN_ITEM;
  const popoverState = (0, import_ui17.usePopupState)({ variant: "popover" });
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
  return /* @__PURE__ */ React25.createElement(ConditionalToolTip, { content: tooltipContent, enable: enableTooltip }, /* @__PURE__ */ React25.createElement(import_ui18.Box, { component: "span", sx: { cursor: disabled ? "not-allowed" : "pointer" } }, /* @__PURE__ */ React25.createElement(
    import_ui18.IconButton,
    {
      size: SIZE2,
      disabled,
      onClick,
      "aria-label": (0, import_i18n5.sprintf)((0, import_i18n5.__)("Add %s item", "elementor"), ariaLabel?.toLowerCase())
    },
    /* @__PURE__ */ React25.createElement(import_icons4.PlusIcon, { fontSize: SIZE2 })
  )));
};
var ConditionalToolTip = ({
  children,
  enable,
  content
}) => enable && content ? /* @__PURE__ */ React25.createElement(import_ui18.Infotip, { placement: "right", color: "secondary", content }, children) : children;

// src/components/control-repeater/items/items-container.tsx
var React27 = __toESM(require("react"));

// src/components/repeater/sortable.tsx
var React26 = __toESM(require("react"));
var import_icons5 = require("@elementor/icons");
var import_ui19 = require("@elementor/ui");
var import_i18n6 = require("@wordpress/i18n");
var SortableProvider = (props) => {
  return /* @__PURE__ */ React26.createElement(import_ui19.List, { sx: { p: 0, my: -0.5, mx: 0 } }, /* @__PURE__ */ React26.createElement(import_ui19.UnstableSortableProvider, { restrictAxis: true, disableDragOverlay: false, variant: "static", ...props }));
};
var SortableItem = ({ id, children, disabled }) => {
  return /* @__PURE__ */ React26.createElement(
    import_ui19.UnstableSortableItem,
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
var StyledListItem = (0, import_ui19.styled)(import_ui19.ListItem)`
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
    "aria-label": (0, import_i18n6.__)("Drag item", "elementor")
  },
  /* @__PURE__ */ React26.createElement(import_icons5.GripVerticalIcon, { fontSize: "tiny" })
);
var StyledDivider = (0, import_ui19.styled)(import_ui19.Divider)`
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
var React29 = __toESM(require("react"));
var import_ui21 = require("@elementor/ui");
var import_i18n7 = require("@wordpress/i18n");

// src/hooks/use-repeatable-control-context.ts
var import_react17 = require("react");
var RepeatableControlContext = (0, import_react17.createContext)(void 0);
var useRepeatableControlContext = () => {
  const context = (0, import_react17.useContext)(RepeatableControlContext);
  if (!context) {
    throw new Error("useRepeatableControlContext must be used within RepeatableControl");
  }
  return context;
};

// src/components/repeater/repeater-tag.tsx
var React28 = __toESM(require("react"));
var import_react18 = require("react");
var import_ui20 = require("@elementor/ui");
var RepeaterTag = (0, import_react18.forwardRef)((props, ref) => {
  return /* @__PURE__ */ React28.createElement(
    import_ui20.UnstableTag,
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
var import_locations = require("@elementor/locations");
var { Slot: RepeaterItemIconSlot, inject: injectIntoRepeaterItemIcon } = (0, import_locations.createReplaceableLocation)();
var { Slot: RepeaterItemLabelSlot, inject: injectIntoRepeaterItemLabel } = (0, import_locations.createReplaceableLocation)();
var { Slot: RepeaterItemActionsSlot, inject: injectIntoRepeaterItemActions } = (0, import_locations.createLocation)();

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
  const triggerProps = (0, import_ui21.bindTrigger)(popoverState);
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
      "aria-label": (0, import_i18n7.__)("Open item", "elementor"),
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
var React30 = __toESM(require("react"));
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
var React31 = __toESM(require("react"));
var import_icons6 = require("@elementor/icons");
var import_ui22 = require("@elementor/ui");
var import_i18n8 = require("@wordpress/i18n");
var SIZE3 = "tiny";
var DisableItemAction = () => {
  const { items: items2, updateItem, index = -1 } = useRepeaterContext();
  if (index === -1) {
    return null;
  }
  const propDisabled = items2[index].item.disabled ?? false;
  const toggleLabel = propDisabled ? (0, import_i18n8.__)("Show", "elementor") : (0, import_i18n8.__)("Hide", "elementor");
  const onClick = () => {
    const self = structuredClone(items2[index].item);
    self.disabled = !self.disabled;
    if (!self.disabled) {
      delete self.disabled;
    }
    updateItem(self, index);
  };
  return /* @__PURE__ */ React31.createElement(import_ui22.Tooltip, { title: toggleLabel, placement: "top" }, /* @__PURE__ */ React31.createElement(import_ui22.IconButton, { size: SIZE3, onClick, "aria-label": toggleLabel }, propDisabled ? /* @__PURE__ */ React31.createElement(import_icons6.EyeOffIcon, { fontSize: SIZE3 }) : /* @__PURE__ */ React31.createElement(import_icons6.EyeIcon, { fontSize: SIZE3 })));
};

// src/components/control-repeater/actions/duplicate-item-action.tsx
var React32 = __toESM(require("react"));
var import_icons7 = require("@elementor/icons");
var import_ui23 = require("@elementor/ui");
var import_i18n9 = require("@wordpress/i18n");
var SIZE4 = "tiny";
var DuplicateItemAction = () => {
  const { items: items2, addItem, index = -1, isItemDisabled: isItemDisabled2 } = useRepeaterContext();
  if (index === -1) {
    return null;
  }
  const duplicateLabel = (0, import_i18n9.__)("Duplicate", "elementor");
  const item = items2[index]?.item;
  const onClick = (ev) => {
    const newItem = structuredClone(item);
    addItem(ev, { item: newItem, index: index + 1 });
  };
  return /* @__PURE__ */ React32.createElement(import_ui23.Tooltip, { title: duplicateLabel, placement: "top" }, /* @__PURE__ */ React32.createElement(
    import_ui23.IconButton,
    {
      size: SIZE4,
      onClick,
      "aria-label": duplicateLabel,
      disabled: isItemDisabled2(index)
    },
    /* @__PURE__ */ React32.createElement(import_icons7.CopyIcon, { fontSize: SIZE4 })
  ));
};

// src/components/control-repeater/actions/remove-item-action.tsx
var React33 = __toESM(require("react"));
var import_icons8 = require("@elementor/icons");
var import_ui24 = require("@elementor/ui");
var import_i18n10 = require("@wordpress/i18n");
var SIZE5 = "tiny";
var RemoveItemAction = () => {
  const { removeItem, index = -1 } = useRepeaterContext();
  if (index === -1) {
    return null;
  }
  const removeLabel = (0, import_i18n10.__)("Remove", "elementor");
  const onClick = () => removeItem(index);
  return /* @__PURE__ */ React33.createElement(import_ui24.Tooltip, { title: removeLabel, placement: "top" }, /* @__PURE__ */ React33.createElement(import_ui24.IconButton, { size: SIZE5, onClick, "aria-label": removeLabel }, /* @__PURE__ */ React33.createElement(import_icons8.XIcon, { fontSize: SIZE5 })));
};

// src/components/control-repeater/items/edit-item-popover.tsx
var React35 = __toESM(require("react"));
var import_ui26 = require("@elementor/ui");

// src/components/repeater/repeater-popover.tsx
var React34 = __toESM(require("react"));
var import_ui25 = require("@elementor/ui");
var RepeaterPopover = ({ children, width, ...props }) => {
  return /* @__PURE__ */ React34.createElement(
    import_ui25.Popover,
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
  return /* @__PURE__ */ React35.createElement(RepeaterPopover, { width: rowRef.offsetWidth, ...(0, import_ui26.bindPopover)(popoverState), onClose }, /* @__PURE__ */ React35.createElement(PropKeyProvider, { bind: String(openItemIndex) }, /* @__PURE__ */ React35.createElement(import_ui26.Box, null, children)));
};

// src/components/popover-content.tsx
var React36 = __toESM(require("react"));
var import_ui27 = require("@elementor/ui");
var PopoverContent = ({ gap = 1.5, children, ...props }) => /* @__PURE__ */ React36.createElement(import_ui27.Stack, { ...props, gap }, children);

// src/components/popover-grid-container.tsx
var import_react19 = require("react");
var React37 = __toESM(require("react"));
var import_ui28 = require("@elementor/ui");
var PopoverGridContainer = (0, import_react19.forwardRef)(
  ({ gap = 1.5, alignItems = "center", flexWrap = "nowrap", children }, ref) => /* @__PURE__ */ React37.createElement(import_ui28.Grid, { container: true, gap, alignItems, flexWrap, ref }, children)
);

// src/components/repeater/repeater-header.tsx
var React38 = __toESM(require("react"));
var import_react20 = require("react");
var import_ui29 = require("@elementor/ui");
var RepeaterHeader = (0, import_react20.forwardRef)(
  ({
    label,
    children,
    adornment: Adornment = ControlAdornments
  }, ref) => {
    return /* @__PURE__ */ React38.createElement(
      import_ui29.Stack,
      {
        direction: "row",
        alignItems: "center",
        gap: 1,
        sx: { marginInlineEnd: -0.75, py: 0.25 },
        ref
      },
      /* @__PURE__ */ React38.createElement(import_ui29.Box, { display: "flex", alignItems: "center", gap: 1, sx: { flexGrow: 1 } }, /* @__PURE__ */ React38.createElement(import_ui29.Typography, { component: "label", variant: "caption", color: "text.secondary", sx: { lineHeight: 1 } }, label), /* @__PURE__ */ React38.createElement(Adornment, null)),
      children
    );
  }
);

// src/controls/box-shadow-repeater-control.tsx
var BoxShadowRepeaterControl = createControl(() => {
  const { propType, value, setValue, disabled } = useBoundProp(import_editor_props10.boxShadowPropTypeUtil);
  return /* @__PURE__ */ React39.createElement(PropProvider, { propType, value, setValue, isDisabled: () => disabled }, /* @__PURE__ */ React39.createElement(ControlRepeater, { initial: initialShadow, propTypeUtil: import_editor_props10.boxShadowPropTypeUtil }, /* @__PURE__ */ React39.createElement(RepeaterHeader, { label: (0, import_i18n11.__)("Box shadow", "elementor") }, /* @__PURE__ */ React39.createElement(TooltipAddItemAction, { newItemIndex: 0, disabled, ariaLabel: "Box shadow" })), /* @__PURE__ */ React39.createElement(ItemsContainer, null, /* @__PURE__ */ React39.createElement(
    Item,
    {
      Icon: ItemIcon,
      Label: ItemLabel,
      actions: /* @__PURE__ */ React39.createElement(React39.Fragment, null, /* @__PURE__ */ React39.createElement(DuplicateItemAction, null), /* @__PURE__ */ React39.createElement(DisableItemAction, null), /* @__PURE__ */ React39.createElement(RemoveItemAction, null))
    }
  )), /* @__PURE__ */ React39.createElement(EditItemPopover, null, /* @__PURE__ */ React39.createElement(Content, null))));
});
var StyledUnstableColorIndicator = (0, import_ui30.styled)(import_ui30.UnstableColorIndicator)(({ theme }) => ({
  height: "1rem",
  width: "1rem",
  borderRadius: `${theme.shape.borderRadius / 2}px`
}));
var ItemIcon = ({ value }) => /* @__PURE__ */ React39.createElement(StyledUnstableColorIndicator, { size: "inherit", component: "span", value: value.value.color?.value });
var Content = () => {
  const context = useBoundProp(import_editor_props10.shadowPropTypeUtil);
  const rowRef = [(0, import_react21.useRef)(null), (0, import_react21.useRef)(null)];
  const { rowRef: anchorEl } = useRepeaterContext();
  return /* @__PURE__ */ React39.createElement(PropProvider, { ...context }, /* @__PURE__ */ React39.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React39.createElement(PopoverGridContainer, null, /* @__PURE__ */ React39.createElement(Control2, { bind: "color", label: (0, import_i18n11.__)("Color", "elementor") }, /* @__PURE__ */ React39.createElement(ColorControl, { anchorEl })), /* @__PURE__ */ React39.createElement(Control2, { bind: "position", label: (0, import_i18n11.__)("Position", "elementor"), sx: { overflow: "hidden" } }, /* @__PURE__ */ React39.createElement(
    SelectControl,
    {
      options: [
        { label: (0, import_i18n11.__)("Inset", "elementor"), value: "inset" },
        { label: (0, import_i18n11.__)("Outset", "elementor"), value: null }
      ]
    }
  ))), /* @__PURE__ */ React39.createElement(PopoverGridContainer, { ref: rowRef[0] }, /* @__PURE__ */ React39.createElement(Control2, { bind: "hOffset", label: (0, import_i18n11.__)("Horizontal", "elementor") }, /* @__PURE__ */ React39.createElement(SizeControl, { anchorRef: rowRef[0] })), /* @__PURE__ */ React39.createElement(Control2, { bind: "vOffset", label: (0, import_i18n11.__)("Vertical", "elementor") }, /* @__PURE__ */ React39.createElement(SizeControl, { anchorRef: rowRef[0] }))), /* @__PURE__ */ React39.createElement(PopoverGridContainer, { ref: rowRef[1] }, /* @__PURE__ */ React39.createElement(Control2, { bind: "blur", label: (0, import_i18n11.__)("Blur", "elementor") }, /* @__PURE__ */ React39.createElement(SizeControl, { anchorRef: rowRef[1] })), /* @__PURE__ */ React39.createElement(Control2, { bind: "spread", label: (0, import_i18n11.__)("Spread", "elementor") }, /* @__PURE__ */ React39.createElement(SizeControl, { anchorRef: rowRef[1] })))));
};
var Control2 = ({
  label,
  bind,
  children,
  sx
}) => /* @__PURE__ */ React39.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React39.createElement(import_ui30.Grid, { item: true, xs: 6, sx }, /* @__PURE__ */ React39.createElement(import_ui30.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React39.createElement(import_ui30.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React39.createElement(import_ui30.FormLabel, { size: "tiny" }, label)), /* @__PURE__ */ React39.createElement(import_ui30.Grid, { item: true, xs: 12 }, children))));
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
var React48 = __toESM(require("react"));
var import_editor_props15 = require("@elementor/editor-props");
var import_i18n16 = require("@wordpress/i18n");

// src/controls/filter-control/context/filter-config-context.tsx
var React40 = __toESM(require("react"));
var import_react22 = require("react");
var import_editor_props11 = require("@elementor/editor-props");

// src/controls/filter-control/utils.ts
var import_i18n13 = require("@wordpress/i18n");

// src/controls/filter-control/configs.ts
var import_i18n12 = require("@wordpress/i18n");
var FILTERS_BY_GROUP = {
  blur: {
    blur: {
      name: (0, import_i18n12.__)("Blur", "elementor"),
      valueName: (0, import_i18n12.__)("Radius", "elementor")
    }
  },
  intensity: {
    brightness: { name: (0, import_i18n12.__)("Brightness", "elementor") },
    contrast: { name: (0, import_i18n12.__)("Contrast", "elementor") },
    saturate: { name: (0, import_i18n12.__)("Saturate", "elementor") }
  },
  "hue-rotate": {
    "hue-rotate": {
      name: (0, import_i18n12.__)("Hue Rotate", "elementor"),
      valueName: (0, import_i18n12.__)("Angle", "elementor")
    }
  },
  "color-tone": {
    grayscale: { name: (0, import_i18n12.__)("Grayscale", "elementor") },
    invert: { name: (0, import_i18n12.__)("Invert", "elementor") },
    sepia: { name: (0, import_i18n12.__)("Sepia", "elementor") }
  },
  "drop-shadow": {
    "drop-shadow": { name: (0, import_i18n12.__)("Drop shadow", "elementor"), valueName: (0, import_i18n12.__)("Drop-shadow", "elementor") }
  }
};

// src/controls/filter-control/utils.ts
var AMOUNT_VALUE_NAME = (0, import_i18n13.__)("Amount", "elementor");
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
var FilterConfigContext = (0, import_react22.createContext)(null);
function FilterConfigProvider({ children }) {
  const propContext = useBoundProp(import_editor_props11.cssFilterFunctionPropUtil);
  const contextValue = (0, import_react22.useMemo)(() => {
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
  const context = (0, import_react22.useContext)(FilterConfigContext);
  if (!context) {
    throw new Error("useFilterConfig must be used within FilterConfigProvider");
  }
  return context;
}

// src/controls/filter-control/filter-content.tsx
var React43 = __toESM(require("react"));
var import_editor_props14 = require("@elementor/editor-props");
var import_ui33 = require("@elementor/ui");
var import_i18n15 = require("@wordpress/i18n");

// src/controls/filter-control/drop-shadow/drop-shadow-item-content.tsx
var React41 = __toESM(require("react"));
var import_react23 = require("react");
var import_editor_props12 = require("@elementor/editor-props");
var import_ui31 = require("@elementor/ui");
var import_i18n14 = require("@wordpress/i18n");
var items = [
  {
    bind: "xAxis",
    label: (0, import_i18n14.__)("X-axis", "elementor"),
    rowIndex: 0
  },
  {
    bind: "yAxis",
    label: (0, import_i18n14.__)("Y-axis", "elementor"),
    rowIndex: 0
  },
  {
    bind: "blur",
    label: (0, import_i18n14.__)("Blur", "elementor"),
    rowIndex: 1
  },
  {
    bind: "color",
    label: (0, import_i18n14.__)("Color", "elementor"),
    rowIndex: 1
  }
];
var DropShadowItemContent = ({ anchorEl }) => {
  const context = useBoundProp(import_editor_props12.dropShadowFilterPropTypeUtil);
  const rowRefs = [(0, import_react23.useRef)(null), (0, import_react23.useRef)(null)];
  return /* @__PURE__ */ React41.createElement(PropProvider, { ...context }, items.map((item) => /* @__PURE__ */ React41.createElement(PopoverGridContainer, { key: item.bind, ref: rowRefs[item.rowIndex] ?? null }, /* @__PURE__ */ React41.createElement(PropKeyProvider, { bind: item.bind }, /* @__PURE__ */ React41.createElement(import_ui31.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React41.createElement(ControlFormLabel, null, item.label)), /* @__PURE__ */ React41.createElement(import_ui31.Grid, { item: true, xs: 6 }, item.bind === "color" ? /* @__PURE__ */ React41.createElement(ColorControl, { anchorEl }) : /* @__PURE__ */ React41.createElement(
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
var import_react24 = require("react");
var React42 = __toESM(require("react"));
var import_editor_props13 = require("@elementor/editor-props");
var import_ui32 = require("@elementor/ui");
var propTypeMap = {
  blur: import_editor_props13.blurFilterPropTypeUtil,
  intensity: import_editor_props13.intensityFilterPropTypeUtil,
  "hue-rotate": import_editor_props13.hueRotateFilterPropTypeUtil,
  "color-tone": import_editor_props13.colorToneFilterPropTypeUtil
};
var SingleSizeItemContent = ({ filterFunc }) => {
  const rowRef = (0, import_react24.useRef)(null);
  const { getFilterFunctionConfig } = useFilterConfig();
  const { valueName, filterFunctionGroup } = getFilterFunctionConfig(filterFunc);
  const context = useBoundProp(propTypeMap[filterFunctionGroup]);
  return /* @__PURE__ */ React42.createElement(PropProvider, { ...context }, /* @__PURE__ */ React42.createElement(PropKeyProvider, { bind: filterFunctionGroup }, /* @__PURE__ */ React42.createElement(PropKeyProvider, { bind: "size" }, /* @__PURE__ */ React42.createElement(PopoverGridContainer, { ref: rowRef }, /* @__PURE__ */ React42.createElement(import_ui32.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React42.createElement(ControlFormLabel, null, valueName)), /* @__PURE__ */ React42.createElement(import_ui32.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React42.createElement(SizeControl, { anchorRef: rowRef, enablePropTypeUnits: true }))))));
};

// src/controls/filter-control/filter-content.tsx
var FilterContent = () => {
  const propContext = useBoundProp(import_editor_props14.cssFilterFunctionPropUtil);
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
  return /* @__PURE__ */ React43.createElement(PropProvider, { ...propContext, setValue: handleValueChange }, /* @__PURE__ */ React43.createElement(PropKeyProvider, { bind: "css-filter-func" }, /* @__PURE__ */ React43.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React43.createElement(PopoverGridContainer, null, /* @__PURE__ */ React43.createElement(import_ui33.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React43.createElement(ControlFormLabel, null, (0, import_i18n15.__)("Filter", "elementor"))), /* @__PURE__ */ React43.createElement(import_ui33.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React43.createElement(PropKeyProvider, { bind: "func" }, /* @__PURE__ */ React43.createElement(SelectControl, { options: filterOptions })))), /* @__PURE__ */ React43.createElement(PropKeyProvider, { bind: "args" }, /* @__PURE__ */ React43.createElement(FilterValueContent, null)))));
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
var React44 = __toESM(require("react"));
var import_ui34 = require("@elementor/ui");
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
var StyledUnstableColorIndicator2 = (0, import_ui34.styled)(import_ui34.UnstableColorIndicator)(({ theme }) => ({
  borderRadius: `${theme.shape.borderRadius / 2}px`
}));

// src/controls/filter-control/filter-label.tsx
var React47 = __toESM(require("react"));

// src/controls/filter-control/drop-shadow/drop-shadow-item-label.tsx
var React45 = __toESM(require("react"));
var import_ui35 = require("@elementor/ui");
var DropShadowItemLabel = ({ value }) => {
  const values = value.value.args.value;
  const keys = ["xAxis", "yAxis", "blur"];
  const labels = keys.map(
    (key) => values[key]?.value?.unit !== "custom" ? `${values[key]?.value?.size ?? 0}${values[key]?.value?.unit ?? "px"}` : values[key]?.value?.size || CUSTOM_SIZE_LABEL
  );
  return /* @__PURE__ */ React45.createElement(import_ui35.Box, { component: "span" }, /* @__PURE__ */ React45.createElement(import_ui35.Box, { component: "span", style: { textTransform: "capitalize" } }, "Drop shadow:"), ` ${labels.join(" ")}`);
};

// src/controls/filter-control/single-size/single-size-item-label.tsx
var React46 = __toESM(require("react"));
var import_ui36 = require("@elementor/ui");
var SingleSizeItemLabel = ({ value }) => {
  const { func, args } = value.value;
  const { getFilterFunctionConfig } = useFilterConfig();
  const { defaultValue } = getFilterFunctionConfig(func.value ?? "");
  const defaultUnit = defaultValue.value.args.value?.size?.value?.unit ?? lengthUnits[0];
  const { unit, size } = args.value.size?.value ?? { unit: defaultUnit, size: 0 };
  const label = /* @__PURE__ */ React46.createElement(import_ui36.Box, { component: "span", style: { textTransform: "capitalize" } }, func.value ?? "", ":");
  return /* @__PURE__ */ React46.createElement(import_ui36.Box, { component: "span" }, label, " " + (unit !== "custom" ? `${size ?? 0}${unit ?? defaultUnit}` : size || CUSTOM_SIZE_LABEL));
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
    propTypeUtil: import_editor_props15.filterPropTypeUtil,
    label: (0, import_i18n16.__)("Filters", "elementor")
  },
  "backdrop-filter": {
    propTypeUtil: import_editor_props15.backdropFilterPropTypeUtil,
    label: (0, import_i18n16.__)("Backdrop filters", "elementor")
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
var React49 = __toESM(require("react"));
var import_react25 = require("react");
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
  const [options, setOptions] = (0, import_react25.useState)(initialOptions ?? []);
  (0, import_react25.useEffect)(() => {
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
var React50 = __toESM(require("react"));
var import_editor_props16 = require("@elementor/editor-props");
var import_ui37 = require("@elementor/ui");
var SIZE6 = "tiny";
var ChipsControl = createControl(({ options }) => {
  const { value, setValue, disabled } = useBoundProp(import_editor_props16.stringArrayPropTypeUtil);
  const selectedValues = (value || []).map((item) => import_editor_props16.stringPropTypeUtil.extract(item)).filter((val) => val !== null);
  const selectedOptions = selectedValues.map((val) => options.find((opt) => opt.value === val)).filter((opt) => opt !== void 0);
  const handleChange = (_, newValue) => {
    const values = newValue.map((option) => import_editor_props16.stringPropTypeUtil.create(option.value));
    setValue(values.length > 0 ? values : null);
  };
  return /* @__PURE__ */ React50.createElement(ControlActions, null, /* @__PURE__ */ React50.createElement(
    import_ui37.Autocomplete,
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
      renderInput: (params) => /* @__PURE__ */ React50.createElement(import_ui37.TextField, { ...params }),
      renderTags: (values, getTagProps) => values.map((option, index) => {
        const { key, ...chipProps } = getTagProps({ index });
        return /* @__PURE__ */ React50.createElement(import_ui37.Chip, { key, size: "tiny", label: option.label, ...chipProps });
      })
    }
  ));
});

// src/controls/toggle-control.tsx
var React54 = __toESM(require("react"));
var import_editor_props17 = require("@elementor/editor-props");

// src/components/control-toggle-button-group.tsx
var React52 = __toESM(require("react"));
var import_react26 = require("react");
var import_icons9 = require("@elementor/icons");
var import_ui39 = require("@elementor/ui");

// src/components/conditional-tooltip.tsx
var React51 = __toESM(require("react"));
var import_ui38 = require("@elementor/ui");
var ConditionalTooltip = ({
  showTooltip,
  children,
  label
}) => {
  return showTooltip && label ? /* @__PURE__ */ React51.createElement(import_ui38.Tooltip, { title: label, disableFocusListener: true, placement: "top" }, children) : children;
};

// src/components/control-toggle-button-group.tsx
var StyledToggleButtonGroup = (0, import_ui39.styled)(import_ui39.ToggleButtonGroup)`
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
var StyledToggleButton = (0, import_ui39.styled)(import_ui39.ToggleButton, {
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
    const theme = (0, import_ui39.useTheme)();
    const isRtl = "rtl" === theme.direction;
    const handleChange = (_, newValue) => {
      onChange(newValue);
    };
    const getGridTemplateColumns = (0, import_react26.useMemo)(() => {
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
  const [isMenuOpen, setIsMenuOpen] = (0, import_react26.useState)(false);
  const menuButtonRef = (0, import_react26.useRef)(null);
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
    import_ui39.ToggleButton,
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
    import_ui39.ToggleButton,
    {
      size,
      "aria-expanded": isMenuOpen ? "true" : void 0,
      "aria-haspopup": "menu",
      "aria-pressed": void 0,
      onClick: onMenuToggle,
      ref: menuButtonRef,
      value: "__chevron-icon-button__"
    },
    /* @__PURE__ */ React52.createElement(import_icons9.ChevronDownIcon, { fontSize: size })
  ), /* @__PURE__ */ React52.createElement(
    import_ui39.Menu,
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
      import_ui39.MenuItem,
      {
        key: buttonValue,
        selected: buttonValue === value,
        onClick: () => onMenuItemClick(buttonValue)
      },
      /* @__PURE__ */ React52.createElement(import_ui39.ListItemText, null, /* @__PURE__ */ React52.createElement(import_ui39.Typography, { sx: { fontSize: "14px" } }, label))
    ))
  ));
};
var usePreviewButton = (items2, value) => {
  const [previewButton, setPreviewButton] = (0, import_react26.useState)(
    items2.find((item) => item.value === value) ?? items2[0]
  );
  (0, import_react26.useEffect)(() => {
    const selectedButton = items2.find((item) => item.value === value);
    if (selectedButton) {
      setPreviewButton(selectedButton);
    }
  }, [items2, value]);
  return previewButton;
};

// src/utils/convert-toggle-options-to-atomic.tsx
var React53 = __toESM(require("react"));
var Icons = __toESM(require("@elementor/icons"));
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
    const { value, setValue, placeholder, disabled } = useBoundProp(import_editor_props17.stringPropTypeUtil);
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
var React55 = __toESM(require("react"));
var import_editor_props18 = require("@elementor/editor-props");
var import_ui40 = require("@elementor/ui");
var isEmptyOrNaN = (value) => value === null || value === void 0 || value === "" || Number.isNaN(Number(value));
var renderSuffix = (propType) => {
  if (propType.meta?.suffix) {
    return /* @__PURE__ */ React55.createElement(import_ui40.InputAdornment, { position: "end" }, propType.meta.suffix);
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
    const { value, setValue, placeholder, disabled, restoreValue, propType } = useBoundProp(import_editor_props18.numberPropTypeUtil);
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
          startAdornment: startIcon ? /* @__PURE__ */ React55.createElement(import_ui40.InputAdornment, { position: "start", disabled }, startIcon) : void 0,
          endAdornment: renderSuffix(propType)
        }
      }
    ));
  }
);

// src/controls/equal-unequal-sizes-control.tsx
var React56 = __toESM(require("react"));
var import_react27 = require("react");
var import_ui41 = require("@elementor/ui");
var import_i18n17 = require("@wordpress/i18n");
function EqualUnequalSizesControl({
  label,
  icon,
  tooltipLabel,
  items: items2,
  multiSizePropTypeUtil
}) {
  const popupId = (0, import_react27.useId)();
  const popupState = (0, import_ui41.usePopupState)({ variant: "popover", popupId });
  const rowRefs = [(0, import_react27.useRef)(null), (0, import_react27.useRef)(null)];
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
  return /* @__PURE__ */ React56.createElement(React56.Fragment, null, /* @__PURE__ */ React56.createElement(import_ui41.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap", ref: rowRefs[0] }, /* @__PURE__ */ React56.createElement(import_ui41.Grid, { item: true, xs: 6 }, !isShowingGeneralIndicator ? /* @__PURE__ */ React56.createElement(ControlFormLabel, null, label) : /* @__PURE__ */ React56.createElement(ControlLabel, null, label)), /* @__PURE__ */ React56.createElement(import_ui41.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React56.createElement(import_ui41.Stack, { direction: "row", alignItems: "center", gap: 1 }, /* @__PURE__ */ React56.createElement(import_ui41.Box, { flexGrow: 1 }, /* @__PURE__ */ React56.createElement(
    SizeControl,
    {
      placeholder: isMixed ? (0, import_i18n17.__)("Mixed", "elementor") : void 0,
      enablePropTypeUnits: !isMixed || !isMixedPlaceholder,
      anchorRef: rowRefs[0]
    }
  )), /* @__PURE__ */ React56.createElement(import_ui41.Tooltip, { title: tooltipLabel, placement: "top" }, /* @__PURE__ */ React56.createElement(
    StyledToggleButton,
    {
      size: "tiny",
      value: "check",
      sx: { marginLeft: "auto" },
      ...(0, import_ui41.bindToggle)(popupState),
      selected: popupState.isOpen,
      isPlaceholder: isMixedPlaceholder,
      "aria-label": tooltipLabel
    },
    icon
  ))))), /* @__PURE__ */ React56.createElement(
    import_ui41.Popover,
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
      ...(0, import_ui41.bindPopover)(popupState),
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
  return /* @__PURE__ */ React56.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React56.createElement(import_ui41.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React56.createElement(import_ui41.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React56.createElement(import_ui41.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React56.createElement(ControlLabel, null, label)), /* @__PURE__ */ React56.createElement(import_ui41.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React56.createElement(SizeControl, { startIcon: icon, ariaLabel, anchorRef: rowRef })))));
};

// src/controls/linked-dimensions-control.tsx
var React57 = __toESM(require("react"));
var import_react28 = require("react");
var import_editor_props19 = require("@elementor/editor-props");
var import_editor_responsive2 = require("@elementor/editor-responsive");
var import_icons10 = require("@elementor/icons");
var import_ui42 = require("@elementor/ui");
var import_i18n18 = require("@wordpress/i18n");
var LinkedDimensionsControl = ({ label, isSiteRtl = false, extendedOptions, min }) => {
  const gridRowRefs = [(0, import_react28.useRef)(null), (0, import_react28.useRef)(null)];
  const { disabled: sizeDisabled } = useBoundProp(import_editor_props19.sizePropTypeUtil);
  const {
    value: dimensionsValue,
    setValue: setDimensionsValue,
    propType,
    placeholder: dimensionsPlaceholder,
    disabled: dimensionsDisabled
  } = useBoundProp(import_editor_props19.dimensionsPropTypeUtil);
  const { value: masterValue, placeholder: masterPlaceholder, setValue: setMasterValue } = useBoundProp();
  const inferIsLinked = () => {
    if (import_editor_props19.dimensionsPropTypeUtil.isValid(masterValue)) {
      return false;
    }
    if (!masterValue && import_editor_props19.dimensionsPropTypeUtil.isValid(masterPlaceholder)) {
      return false;
    }
    return true;
  };
  const [isLinked, setIsLinked] = (0, import_react28.useState)(() => inferIsLinked());
  const activeBreakpoint = (0, import_editor_responsive2.useActiveBreakpoint)();
  (0, import_react28.useLayoutEffect)(() => {
    setIsLinked(inferIsLinked);
  }, [activeBreakpoint]);
  const onLinkToggle = () => {
    setIsLinked((prev) => !prev);
    if (!import_editor_props19.dimensionsPropTypeUtil.isValid(masterValue)) {
      const value = masterValue ? masterValue : null;
      if (!value) {
        setMasterValue(null);
        return;
      }
      setMasterValue(
        import_editor_props19.dimensionsPropTypeUtil.create({
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
  const LinkedIcon = isLinked ? import_icons10.LinkIcon : import_icons10.DetachIcon;
  const linkedLabel = (0, import_i18n18.__)("Link %s", "elementor").replace("%s", tooltipLabel);
  const unlinkedLabel = (0, import_i18n18.__)("Unlink %s", "elementor").replace("%s", tooltipLabel);
  const disabled = sizeDisabled || dimensionsDisabled;
  const propProviderProps = {
    propType,
    value: dimensionsValue,
    placeholder: dimensionsPlaceholder,
    setValue: setDimensionsValue,
    isDisabled: () => dimensionsDisabled
  };
  const hasPlaceholders = !masterValue && (dimensionsPlaceholder || masterPlaceholder);
  return /* @__PURE__ */ React57.createElement(PropProvider, { ...propProviderProps }, /* @__PURE__ */ React57.createElement(import_ui42.Stack, { direction: "row", gap: 2, flexWrap: "nowrap" }, /* @__PURE__ */ React57.createElement(ControlFormLabel, null, label), /* @__PURE__ */ React57.createElement(import_ui42.Tooltip, { title: isLinked ? unlinkedLabel : linkedLabel, placement: "top" }, /* @__PURE__ */ React57.createElement(
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
  ))), getCssDimensionProps(label, isSiteRtl).map((row, index) => /* @__PURE__ */ React57.createElement(import_ui42.Stack, { direction: "row", gap: 2, flexWrap: "nowrap", key: index, ref: gridRowRefs[index] }, row.map(({ icon, ...props }) => /* @__PURE__ */ React57.createElement(import_ui42.Grid, { container: true, gap: 0.75, alignItems: "center", key: props.bind }, /* @__PURE__ */ React57.createElement(import_ui42.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React57.createElement(Label, { ...props })), /* @__PURE__ */ React57.createElement(import_ui42.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React57.createElement(
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
        label: (0, import_i18n18.__)("Top", "elementor"),
        /* translators: %s is the name of the main group (margin or padding) */
        ariaLabel: (0, import_i18n18.sprintf)((0, import_i18n18.__)("%s top", "elementor"), label),
        icon: /* @__PURE__ */ React57.createElement(import_icons10.SideTopIcon, { fontSize: "tiny" })
      },
      {
        bind: "inline-end",
        label: isSiteRtl ? (0, import_i18n18.__)("Left", "elementor") : (0, import_i18n18.__)("Right", "elementor"),
        ariaLabel: isSiteRtl ? (
          /* translators: %s is the name of the main group (margin or padding) */
          (0, import_i18n18.sprintf)((0, import_i18n18.__)("%s left", "elementor"), label)
        ) : (
          /* translators: %s is the name of the main group (margin or padding) */
          (0, import_i18n18.sprintf)((0, import_i18n18.__)("%s right", "elementor"), label)
        ),
        icon: isSiteRtl ? /* @__PURE__ */ React57.createElement(import_icons10.SideLeftIcon, { fontSize: "tiny" }) : /* @__PURE__ */ React57.createElement(import_icons10.SideRightIcon, { fontSize: "tiny" })
      }
    ],
    [
      {
        bind: "block-end",
        label: (0, import_i18n18.__)("Bottom", "elementor"),
        /* translators: %s is the name of the main group (margin or padding) */
        ariaLabel: (0, import_i18n18.sprintf)((0, import_i18n18.__)("%s bottom", "elementor"), label),
        icon: /* @__PURE__ */ React57.createElement(import_icons10.SideBottomIcon, { fontSize: "tiny" })
      },
      {
        bind: "inline-start",
        label: isSiteRtl ? (0, import_i18n18.__)("Right", "elementor") : (0, import_i18n18.__)("Left", "elementor"),
        ariaLabel: isSiteRtl ? (
          /* translators: %s is the name of the main group (margin or padding) */
          (0, import_i18n18.sprintf)((0, import_i18n18.__)("%s right", "elementor"), label)
        ) : (
          /* translators: %s is the name of the main group (margin or padding) */
          (0, import_i18n18.sprintf)((0, import_i18n18.__)("%s left", "elementor"), label)
        ),
        icon: isSiteRtl ? /* @__PURE__ */ React57.createElement(import_icons10.SideRightIcon, { fontSize: "tiny" }) : /* @__PURE__ */ React57.createElement(import_icons10.SideLeftIcon, { fontSize: "tiny" })
      }
    ]
  ];
}

// src/controls/font-family-control/font-family-control.tsx
var React59 = __toESM(require("react"));
var import_editor_props20 = require("@elementor/editor-props");
var import_icons11 = require("@elementor/icons");
var import_ui44 = require("@elementor/ui");
var import_i18n20 = require("@wordpress/i18n");

// src/components/item-selector.tsx
var React58 = __toESM(require("react"));
var import_react29 = require("react");
var import_editor_ui5 = require("@elementor/editor-ui");
var import_ui43 = require("@elementor/ui");
var import_utils3 = require("@elementor/utils");
var import_i18n19 = require("@wordpress/i18n");

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
  const [searchValue, setSearchValue] = (0, import_react29.useState)("");
  const filteredItemsList = useFilteredItemsList(itemsList, searchValue, disabledItems);
  const IconComponent = icon;
  const handleSearch = (value) => {
    setSearchValue(value);
  };
  const handleClose = () => {
    setSearchValue("");
    onClose();
  };
  return /* @__PURE__ */ React58.createElement(import_editor_ui5.PopoverBody, { width: sectionWidth, id }, /* @__PURE__ */ React58.createElement(import_editor_ui5.PopoverHeader, { title, onClose: handleClose, icon: /* @__PURE__ */ React58.createElement(IconComponent, { fontSize: "tiny" }) }), /* @__PURE__ */ React58.createElement(
    import_editor_ui5.SearchField,
    {
      value: searchValue,
      onSearch: handleSearch,
      placeholder: (0, import_i18n19.__)("Search", "elementor"),
      id: id + "-search"
    }
  ), /* @__PURE__ */ React58.createElement(import_ui43.Divider, null), /* @__PURE__ */ React58.createElement(import_ui43.Box, { sx: { flex: 1, overflow: "auto", minHeight: 0 } }, filteredItemsList.length > 0 ? /* @__PURE__ */ React58.createElement(
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
    import_ui43.Stack,
    {
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      p: 2.5,
      gap: 1.5,
      overflow: "hidden"
    },
    /* @__PURE__ */ React58.createElement(IconComponent, { fontSize: "large" }),
    /* @__PURE__ */ React58.createElement(import_ui43.Box, { sx: { maxWidth: 160, overflow: "hidden" } }, /* @__PURE__ */ React58.createElement(import_ui43.Typography, { align: "center", variant: "subtitle2", color: "text.secondary" }, (0, import_i18n19.__)("Sorry, nothing matched", "elementor")), /* @__PURE__ */ React58.createElement(
      import_ui43.Typography,
      {
        variant: "subtitle2",
        color: "text.secondary",
        sx: { display: "flex", width: "100%", justifyContent: "center" }
      },
      /* @__PURE__ */ React58.createElement("span", null, "\u201C"),
      /* @__PURE__ */ React58.createElement(
        import_ui43.Box,
        {
          component: "span",
          sx: { maxWidth: "80%", overflow: "hidden", textOverflow: "ellipsis" }
        },
        searchValue
      ),
      /* @__PURE__ */ React58.createElement("span", null, "\u201D.")
    )),
    /* @__PURE__ */ React58.createElement(
      import_ui43.Typography,
      {
        align: "center",
        variant: "caption",
        color: "text.secondary",
        sx: { display: "flex", flexDirection: "column" }
      },
      (0, import_i18n19.__)("Try something else.", "elementor"),
      /* @__PURE__ */ React58.createElement(
        import_ui43.Link,
        {
          color: "secondary",
          variant: "caption",
          component: "button",
          onClick: () => setSearchValue("")
        },
        (0, import_i18n19.__)("Clear & try again", "elementor")
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
  const memoizedItemStyle = (0, import_react29.useCallback)((item) => itemStyle(item), [itemStyle]);
  return /* @__PURE__ */ React58.createElement(
    import_editor_ui5.PopoverMenuList,
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
  const [debouncedFn] = (0, import_react29.useState)(() => (0, import_utils3.debounce)(fn, delay));
  (0, import_react29.useEffect)(() => () => debouncedFn.cancel(), [debouncedFn]);
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
    } = useBoundProp(import_editor_props20.stringPropTypeUtil);
    const popoverState = (0, import_ui44.usePopupState)({ variant: "popover" });
    const isShowingPlaceholder = !fontFamily && placeholder;
    const mapFontSubs = React59.useMemo(() => {
      return fontFamilies.map(({ label, fonts }) => ({
        label,
        items: fonts
      }));
    }, [fontFamilies]);
    return /* @__PURE__ */ React59.createElement(React59.Fragment, null, /* @__PURE__ */ React59.createElement(ControlActions, null, /* @__PURE__ */ React59.createElement(
      import_ui44.UnstableTag,
      {
        id: "font-family-control",
        variant: "outlined",
        label: fontFamily || placeholder,
        endIcon: /* @__PURE__ */ React59.createElement(import_icons11.ChevronDownIcon, { fontSize: "tiny" }),
        ...(0, import_ui44.bindTrigger)(popoverState),
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
      import_ui44.Popover,
      {
        disablePortal: true,
        disableScrollLock: true,
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
        transformOrigin: { vertical: "top", horizontal: "right" },
        sx: { my: 1.5 },
        ...(0, import_ui44.bindPopover)(popoverState)
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
          title: (0, import_i18n20.__)("Font family", "elementor"),
          itemStyle: (item) => ({ fontFamily: item.value }),
          onDebounce: enqueueFont,
          icon: import_icons11.TextIcon
        }
      )
    ));
  }
);

// src/controls/url-control.tsx
var React60 = __toESM(require("react"));
var import_editor_props21 = require("@elementor/editor-props");
var import_ui45 = require("@elementor/ui");
var UrlControl = createControl(
  ({ placeholder, ariaLabel }) => {
    const { value, setValue, disabled } = useBoundProp(import_editor_props21.urlPropTypeUtil);
    const handleChange = (event) => setValue(event.target.value);
    return /* @__PURE__ */ React60.createElement(ControlActions, null, /* @__PURE__ */ React60.createElement(
      import_ui45.TextField,
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
var React65 = __toESM(require("react"));
var import_react32 = require("react");
var import_editor_elements2 = require("@elementor/editor-elements");
var import_editor_props24 = require("@elementor/editor-props");
var import_icons15 = require("@elementor/icons");
var import_session = require("@elementor/session");
var import_ui49 = require("@elementor/ui");
var import_utils5 = require("@elementor/utils");
var import_i18n23 = require("@wordpress/i18n");

// src/components/restricted-link-infotip.tsx
var React61 = __toESM(require("react"));
var import_editor_elements = require("@elementor/editor-elements");
var import_icons12 = require("@elementor/icons");
var import_ui46 = require("@elementor/ui");
var import_i18n21 = require("@wordpress/i18n");
var learnMoreButton = {
  label: (0, import_i18n21.__)("Learn More", "elementor"),
  href: "https://go.elementor.com/element-link-inside-link-infotip"
};
var INFOTIP_CONTENT = {
  descendant: (0, import_i18n21.__)(
    "To add a link or action to this element, first remove the link or action from the elements inside of it.",
    "elementor"
  ),
  ancestor: (0, import_i18n21.__)(
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
      (0, import_editor_elements.selectElement)(elementId);
    }
  };
  const content = /* @__PURE__ */ React61.createElement(
    import_ui46.Alert,
    {
      color: "secondary",
      icon: /* @__PURE__ */ React61.createElement(import_icons12.InfoCircleFilledIcon, null),
      action: /* @__PURE__ */ React61.createElement(
        import_ui46.AlertAction,
        {
          sx: { width: "fit-content" },
          variant: "contained",
          color: "secondary",
          onClick: handleTakeMeClick
        },
        (0, import_i18n21.__)("Take me there", "elementor")
      )
    },
    /* @__PURE__ */ React61.createElement(import_ui46.AlertTitle, null, (0, import_i18n21.__)("Nested links", "elementor")),
    /* @__PURE__ */ React61.createElement(import_ui46.Box, { component: "span" }, INFOTIP_CONTENT[reason ?? "descendant"], " ", /* @__PURE__ */ React61.createElement(import_ui46.Link, { href: learnMoreButton.href, target: "_blank", color: "info.main" }, learnMoreButton.label))
  );
  return shouldRestrict && isVisible ? /* @__PURE__ */ React61.createElement(
    import_ui46.Infotip,
    {
      placement: "right",
      content,
      color: "secondary",
      slotProps: { popper: { sx: { width: 300 } } }
    },
    /* @__PURE__ */ React61.createElement(import_ui46.Box, null, children)
  ) : /* @__PURE__ */ React61.createElement(React61.Fragment, null, children);
};

// src/controls/query-control.tsx
var React63 = __toESM(require("react"));
var import_react31 = require("react");
var import_editor_props22 = require("@elementor/editor-props");
var import_http_client2 = require("@elementor/http-client");
var import_icons14 = require("@elementor/icons");
var import_utils4 = require("@elementor/utils");
var import_i18n22 = require("@wordpress/i18n");

// src/components/autocomplete.tsx
var React62 = __toESM(require("react"));
var import_react30 = require("react");
var import_icons13 = require("@elementor/icons");
var import_ui47 = require("@elementor/ui");
var Autocomplete2 = (0, import_react30.forwardRef)((props, ref) => {
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
    import_ui47.Autocomplete,
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
      renderOption: (optionProps, optionId) => /* @__PURE__ */ React62.createElement(import_ui47.Box, { component: "li", ...optionProps, key: optionProps.id }, findMatchingOption(options, optionId)?.label ?? optionId),
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
    import_ui47.TextField,
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
}) => /* @__PURE__ */ React62.createElement(import_ui47.InputAdornment, { position: "end" }, allowClear && /* @__PURE__ */ React62.createElement(import_ui47.IconButton, { size: params.size, onClick: () => handleChange(null), sx: { cursor: "pointer" } }, /* @__PURE__ */ React62.createElement(import_icons13.XIcon, { fontSize: params.size })));
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
  const normalizedPlaceholder = placeholder || (0, import_i18n22.__)("Search", "elementor");
  const [options, setOptions] = (0, import_react31.useState)(
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
        id: import_editor_props22.numberPropTypeUtil.create(newValue),
        label: import_editor_props22.stringPropTypeUtil.create(findMatchingOption(options, newValue)?.label || null)
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
    const valueToSave = newLinkValue ? import_editor_props22.urlPropTypeUtil.create(newLinkValue) : null;
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
  const debounceFetch = (0, import_react31.useMemo)(
    () => (0, import_utils4.debounce)(
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
      startAdornment: /* @__PURE__ */ React63.createElement(import_icons14.SearchIcon, { fontSize: "tiny" }),
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
var React64 = __toESM(require("react"));
var import_editor_props23 = require("@elementor/editor-props");
var import_ui48 = require("@elementor/ui");
var SwitchControl = createControl(() => {
  const { value, setValue, disabled } = useBoundProp(import_editor_props23.booleanPropTypeUtil);
  const handleChange = (event) => {
    setValue(event.target.checked);
  };
  return /* @__PURE__ */ React64.createElement(import_ui48.Box, { sx: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React64.createElement(
    import_ui48.Switch,
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
  const { value, path, setValue, ...propContext } = useBoundProp(import_editor_props24.linkPropTypeUtil);
  const [linkSessionValue, setLinkSessionValue] = (0, import_session.useSessionStorage)(path.join("/"));
  const [isActive, setIsActive] = (0, import_react32.useState)(!!value);
  const {
    allowCustomValues = true,
    queryOptions,
    placeholder,
    minInputLength = 2,
    context: { elementId },
    label = (0, import_i18n23.__)("Link", "elementor"),
    ariaLabel
  } = props || {};
  const [linkInLinkRestriction, setLinkInLinkRestriction] = (0, import_react32.useState)(
    (0, import_editor_elements2.getLinkInLinkRestriction)(elementId, value)
  );
  const shouldDisableAddingLink = !isActive && linkInLinkRestriction.shouldRestrict;
  const debouncedCheckRestriction = (0, import_react32.useMemo)(
    () => (0, import_utils5.debounce)(() => {
      const newRestriction = (0, import_editor_elements2.getLinkInLinkRestriction)(elementId, value);
      if (newRestriction.shouldRestrict && isActive) {
        setIsActive(false);
      }
      setLinkInLinkRestriction(newRestriction);
    }, 300),
    [elementId, isActive, value]
  );
  (0, import_react32.useEffect)(() => {
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
    setLinkInLinkRestriction((0, import_editor_elements2.getLinkInLinkRestriction)(elementId, value));
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
  return /* @__PURE__ */ React65.createElement(PropProvider, { ...propContext, value, setValue }, /* @__PURE__ */ React65.createElement(import_ui49.Stack, { gap: 1.5 }, /* @__PURE__ */ React65.createElement(
    import_ui49.Stack,
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
        label: (0, import_i18n23.__)("Toggle link", "elementor")
      }
    ))
  ), /* @__PURE__ */ React65.createElement(import_ui49.Collapse, { in: isActive, timeout: "auto", unmountOnExit: true }, /* @__PURE__ */ React65.createElement(import_ui49.Stack, { gap: 1.5 }, /* @__PURE__ */ React65.createElement(PropKeyProvider, { bind: "destination" }, /* @__PURE__ */ React65.createElement(
    QueryControl,
    {
      queryOptions,
      allowCustomValues,
      minInputLength,
      placeholder,
      onSetValue: onSaveValueToSession,
      ariaLabel: ariaLabel || label
    }
  )), /* @__PURE__ */ React65.createElement(PropKeyProvider, { bind: "isTargetBlank" }, /* @__PURE__ */ React65.createElement(import_ui49.Grid, { container: true, alignItems: "center", flexWrap: "nowrap", justifyContent: "space-between" }, /* @__PURE__ */ React65.createElement(import_ui49.Grid, { item: true }, /* @__PURE__ */ React65.createElement(ControlFormLabel, null, (0, import_i18n23.__)("Open in a new tab", "elementor"))), /* @__PURE__ */ React65.createElement(import_ui49.Grid, { item: true, sx: { marginInlineEnd: -1 } }, /* @__PURE__ */ React65.createElement(SwitchControl, null))))))));
});
var ToggleIconControl = ({ disabled, active, onIconClick, label }) => {
  return /* @__PURE__ */ React65.createElement(import_ui49.IconButton, { size: SIZE7, onClick: onIconClick, "aria-label": label, disabled }, active ? /* @__PURE__ */ React65.createElement(import_icons15.MinusIcon, { fontSize: SIZE7 }) : /* @__PURE__ */ React65.createElement(import_icons15.PlusIcon, { fontSize: SIZE7 }));
};

// src/controls/html-tag-control.tsx
var React67 = __toESM(require("react"));
var import_editor_elements3 = require("@elementor/editor-elements");
var import_editor_props25 = require("@elementor/editor-props");
var import_editor_ui7 = require("@elementor/editor-ui");
var import_ui52 = require("@elementor/ui");
var import_i18n24 = require("@wordpress/i18n");

// src/components/conditional-control-infotip.tsx
var React66 = __toESM(require("react"));
var import_editor_ui6 = require("@elementor/editor-ui");
var import_ui50 = require("@elementor/ui");
var import_ui51 = require("@elementor/ui");
var DEFAULT_COLOR = "secondary";
var ConditionalControlInfotip = React66.forwardRef(
  ({ children, title, description, alertProps, infotipProps, ...props }, ref) => {
    const theme = (0, import_ui50.useTheme)();
    const isUiRtl = "rtl" === theme.direction;
    const isEnabled = props.isEnabled && (title || description);
    return /* @__PURE__ */ React66.createElement(import_ui50.Box, { ref }, isEnabled ? /* @__PURE__ */ React66.createElement(import_ui51.DirectionProvider, { rtl: isUiRtl }, /* @__PURE__ */ React66.createElement(
      import_ui50.Infotip,
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
          import_editor_ui6.InfoAlert,
          {
            color: DEFAULT_COLOR,
            sx: { width: 300, px: 1.5, py: 2 },
            ...alertProps
          },
          /* @__PURE__ */ React66.createElement(import_ui50.Box, { sx: { flexDirection: "column", display: "flex", gap: 0.5 } }, /* @__PURE__ */ React66.createElement(import_ui50.AlertTitle, null, title), /* @__PURE__ */ React66.createElement(import_ui50.Box, null, description))
        )
      },
      children
    )) : children);
  }
);

// src/controls/html-tag-control.tsx
var StyledSelect = (0, import_ui52.styled)(import_ui52.Select)(() => ({ ".MuiSelect-select.Mui-disabled": { cursor: "not-allowed" } }));
var HtmlTagControl = createControl(({ options, onChange, fallbackLabels = {} }) => {
  const { value, setValue, disabled, placeholder } = useBoundProp(import_editor_props25.stringPropTypeUtil);
  const handleChange = (event) => {
    const newValue = event.target.value || null;
    onChange?.(newValue, value);
    setValue(newValue);
  };
  const elementLabel = (0, import_editor_elements3.getElementLabel)() ?? "element";
  const infoTipProps = {
    title: (0, import_i18n24.__)("HTML Tag", "elementor"),
    /* translators: %s is the element name. */
    description: (0, import_i18n24.__)(
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
    return /* @__PURE__ */ React67.createElement(import_ui52.Typography, { component: "span", variant: "caption", color: "text.tertiary" }, displayText);
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
    options.map(({ label, ...props }) => /* @__PURE__ */ React67.createElement(import_editor_ui7.MenuListItem, { key: props.value, ...props, value: props.value ?? "" }, label))
  )));
});

// src/controls/gap-control.tsx
var React68 = __toESM(require("react"));
var import_react33 = require("react");
var import_editor_props26 = require("@elementor/editor-props");
var import_editor_responsive3 = require("@elementor/editor-responsive");
var import_icons16 = require("@elementor/icons");
var import_ui53 = require("@elementor/ui");
var import_i18n25 = require("@wordpress/i18n");
var GapControl = ({ label }) => {
  const stackRef = (0, import_react33.useRef)(null);
  const { disabled: sizeDisabled } = useBoundProp(import_editor_props26.sizePropTypeUtil);
  const {
    value: directionValue,
    setValue: setDirectionValue,
    propType,
    placeholder: directionPlaceholder,
    disabled: directionDisabled
  } = useBoundProp(import_editor_props26.layoutDirectionPropTypeUtil);
  const { value: masterValue, setValue: setMasterValue, placeholder: masterPlaceholder } = useBoundProp();
  const inferIsLinked = () => {
    if (import_editor_props26.layoutDirectionPropTypeUtil.isValid(masterValue)) {
      return false;
    }
    if (!masterValue && import_editor_props26.layoutDirectionPropTypeUtil.isValid(masterPlaceholder)) {
      return false;
    }
    return true;
  };
  const [isLinked, setIsLinked] = (0, import_react33.useState)(() => inferIsLinked());
  const activeBreakpoint = (0, import_editor_responsive3.useActiveBreakpoint)();
  (0, import_react33.useLayoutEffect)(() => {
    setIsLinked(inferIsLinked());
  }, [activeBreakpoint]);
  const onLinkToggle = () => {
    setIsLinked((prev) => !prev);
    if (!import_editor_props26.layoutDirectionPropTypeUtil.isValid(masterValue)) {
      const currentValue2 = masterValue ? masterValue : null;
      if (!currentValue2) {
        setMasterValue(null);
        return;
      }
      setMasterValue(
        import_editor_props26.layoutDirectionPropTypeUtil.create({
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
  const LinkedIcon = isLinked ? import_icons16.LinkIcon : import_icons16.DetachIcon;
  const linkedLabel = (0, import_i18n25.__)("Link %s", "elementor").replace("%s", tooltipLabel);
  const unlinkedLabel = (0, import_i18n25.__)("Unlink %s", "elementor").replace("%s", tooltipLabel);
  const disabled = sizeDisabled || directionDisabled;
  const propProviderProps = {
    propType,
    value: directionValue,
    setValue: setDirectionValue,
    placeholder: directionPlaceholder
  };
  const hasPlaceholders = !masterValue && (directionPlaceholder || masterPlaceholder);
  return /* @__PURE__ */ React68.createElement(PropProvider, { ...propProviderProps }, /* @__PURE__ */ React68.createElement(import_ui53.Stack, { direction: "row", gap: 2, flexWrap: "nowrap" }, /* @__PURE__ */ React68.createElement(ControlLabel, null, label), /* @__PURE__ */ React68.createElement(import_ui53.Tooltip, { title: isLinked ? unlinkedLabel : linkedLabel, placement: "top" }, /* @__PURE__ */ React68.createElement(
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
  ))), /* @__PURE__ */ React68.createElement(import_ui53.Stack, { direction: "row", gap: 2, flexWrap: "nowrap", ref: stackRef }, /* @__PURE__ */ React68.createElement(import_ui53.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React68.createElement(import_ui53.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React68.createElement(ControlFormLabel, null, (0, import_i18n25.__)("Column", "elementor"))), /* @__PURE__ */ React68.createElement(import_ui53.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React68.createElement(
    Control4,
    {
      bind: "column",
      ariaLabel: (0, import_i18n25.__)("Column gap", "elementor"),
      isLinked,
      anchorRef: stackRef
    }
  ))), /* @__PURE__ */ React68.createElement(import_ui53.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React68.createElement(import_ui53.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React68.createElement(ControlFormLabel, null, (0, import_i18n25.__)("Row", "elementor"))), /* @__PURE__ */ React68.createElement(import_ui53.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React68.createElement(
    Control4,
    {
      bind: "row",
      ariaLabel: (0, import_i18n25.__)("Row gap", "elementor"),
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
var React69 = __toESM(require("react"));
var import_react34 = require("react");
var import_editor_props27 = require("@elementor/editor-props");
var import_editor_ui8 = require("@elementor/editor-ui");
var import_icons17 = require("@elementor/icons");
var import_ui54 = require("@elementor/ui");
var import_i18n26 = require("@wordpress/i18n");
var RATIO_OPTIONS = [
  { label: (0, import_i18n26.__)("Auto", "elementor"), value: "auto" },
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
  } = useBoundProp(import_editor_props27.stringPropTypeUtil);
  const aspectRatioValue = currentPropValue ?? externalPlaceholder;
  const isCustomSelected = aspectRatioValue && !RATIO_OPTIONS.some((option) => option.value === aspectRatioValue);
  const [initialWidth, initialHeight] = isCustomSelected ? aspectRatioValue.split("/") : ["", ""];
  const [isCustom, setIsCustom] = (0, import_react34.useState)(isCustomSelected);
  const [customWidth, setCustomWidth] = (0, import_react34.useState)(initialWidth);
  const [customHeight, setCustomHeight] = (0, import_react34.useState)(initialHeight);
  const [selectedValue, setSelectedValue] = (0, import_react34.useState)(
    isCustomSelected ? CUSTOM_RATIO : aspectRatioValue || ""
  );
  (0, import_react34.useEffect)(() => {
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
  return /* @__PURE__ */ React69.createElement(ControlActions, null, /* @__PURE__ */ React69.createElement(import_ui54.Stack, { direction: "column", gap: 2 }, /* @__PURE__ */ React69.createElement(import_ui54.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React69.createElement(import_ui54.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React69.createElement(ControlLabel, null, label)), /* @__PURE__ */ React69.createElement(import_ui54.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React69.createElement(
    import_ui54.Select,
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
    [...RATIO_OPTIONS, { label: (0, import_i18n26.__)("Custom", "elementor"), value: CUSTOM_RATIO }].map(
      ({ label: optionLabel, ...props }) => /* @__PURE__ */ React69.createElement(import_editor_ui8.MenuListItem, { key: props.value, ...props, value: props.value ?? "" }, optionLabel)
    )
  ))), isCustom && /* @__PURE__ */ React69.createElement(import_ui54.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React69.createElement(import_ui54.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React69.createElement(
    import_ui54.TextField,
    {
      size: "tiny",
      type: "number",
      fullWidth: true,
      disabled,
      value: customWidth,
      onChange: handleCustomWidthChange,
      InputProps: {
        startAdornment: /* @__PURE__ */ React69.createElement(import_icons17.ArrowsMoveHorizontalIcon, { fontSize: "tiny" })
      }
    }
  )), /* @__PURE__ */ React69.createElement(import_ui54.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React69.createElement(
    import_ui54.TextField,
    {
      size: "tiny",
      type: "number",
      fullWidth: true,
      disabled,
      value: customHeight,
      onChange: handleCustomHeightChange,
      InputProps: {
        startAdornment: /* @__PURE__ */ React69.createElement(import_icons17.ArrowsMoveVerticalIcon, { fontSize: "tiny" })
      }
    }
  )))));
});

// src/controls/svg-media-control.tsx
var React71 = __toESM(require("react"));
var import_react36 = require("react");
var import_editor_current_user = require("@elementor/editor-current-user");
var import_editor_props28 = require("@elementor/editor-props");
var import_icons18 = require("@elementor/icons");
var import_ui56 = require("@elementor/ui");
var import_wp_media2 = require("@elementor/wp-media");
var import_i18n28 = require("@wordpress/i18n");

// src/components/enable-unfiltered-modal.tsx
var React70 = __toESM(require("react"));
var import_react35 = require("react");
var import_ui55 = require("@elementor/ui");
var import_i18n27 = require("@wordpress/i18n");
var ADMIN_TITLE_TEXT = (0, import_i18n27.__)("Enable Unfiltered Uploads", "elementor");
var ADMIN_CONTENT_TEXT = (0, import_i18n27.__)(
  "Before you enable unfiltered files upload, note that such files include a security risk. Elementor does run a process to remove possible malicious code, but there is still risk involved when using such files.",
  "elementor"
);
var ADMIN_FAILED_CONTENT_TEXT_PT1 = (0, import_i18n27.__)("Failed to enable unfiltered files upload.", "elementor");
var ADMIN_FAILED_CONTENT_TEXT_PT2 = (0, import_i18n27.__)(
  "You can try again, if the problem persists, please contact support.",
  "elementor"
);
var WAIT_FOR_CLOSE_TIMEOUT_MS = 300;
var EnableUnfilteredModal = (props) => {
  const { mutateAsync, isPending } = useUpdateUnfilteredFilesUpload();
  const [isError, setIsError] = (0, import_react35.useState)(false);
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
var AdminDialog = ({ open, onClose, handleEnable, isPending, isError }) => /* @__PURE__ */ React70.createElement(import_ui55.Dialog, { open, maxWidth: "sm", onClose: () => onClose(false) }, /* @__PURE__ */ React70.createElement(import_ui55.DialogHeader, { logo: false }, /* @__PURE__ */ React70.createElement(import_ui55.DialogTitle, null, ADMIN_TITLE_TEXT)), /* @__PURE__ */ React70.createElement(import_ui55.Divider, null), /* @__PURE__ */ React70.createElement(import_ui55.DialogContent, null, /* @__PURE__ */ React70.createElement(import_ui55.DialogContentText, null, isError ? /* @__PURE__ */ React70.createElement(React70.Fragment, null, ADMIN_FAILED_CONTENT_TEXT_PT1, " ", /* @__PURE__ */ React70.createElement("br", null), " ", ADMIN_FAILED_CONTENT_TEXT_PT2) : ADMIN_CONTENT_TEXT)), /* @__PURE__ */ React70.createElement(import_ui55.DialogActions, null, /* @__PURE__ */ React70.createElement(import_ui55.Button, { size: "medium", color: "secondary", onClick: () => onClose(false) }, (0, import_i18n27.__)("Cancel", "elementor")), /* @__PURE__ */ React70.createElement(
  import_ui55.Button,
  {
    size: "medium",
    onClick: () => handleEnable(),
    variant: "contained",
    color: "primary",
    disabled: isPending
  },
  isPending ? /* @__PURE__ */ React70.createElement(import_ui55.CircularProgress, { size: 24 }) : (0, import_i18n27.__)("Enable", "elementor")
)));

// src/controls/svg-media-control.tsx
var TILE_SIZE = 8;
var TILE_WHITE = "transparent";
var TILE_BLACK = "#c1c1c1";
var TILES_GRADIENT_FORMULA = `linear-gradient(45deg, ${TILE_BLACK} 25%, ${TILE_WHITE} 0, ${TILE_WHITE} 75%, ${TILE_BLACK} 0, ${TILE_BLACK})`;
var StyledCard = (0, import_ui56.styled)(import_ui56.Card)`
	background-color: white;
	background-image: ${TILES_GRADIENT_FORMULA}, ${TILES_GRADIENT_FORMULA};
	background-size: ${TILE_SIZE}px ${TILE_SIZE}px;
	background-position:
		0 0,
		${TILE_SIZE / 2}px ${TILE_SIZE / 2}px;
	border: none;
`;
var StyledCardMediaContainer = (0, import_ui56.styled)(import_ui56.Stack)`
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
  const { value, setValue } = useBoundProp(import_editor_props28.imageSrcPropTypeUtil);
  const { id, url } = value ?? {};
  const { data: attachment, isFetching } = (0, import_wp_media2.useWpMediaAttachment)(id?.value || null);
  const src = attachment?.url ?? url?.value ?? null;
  const { data: allowSvgUpload } = useUnfilteredFilesUpload();
  const [unfilteredModalOpenState, setUnfilteredModalOpenState] = (0, import_react36.useState)(false);
  const { isAdmin } = (0, import_editor_current_user.useCurrentUserCapabilities)();
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
  const infotipProps = {
    title: (0, import_i18n28.__)("Sorry, you can't upload that file yet.", "elementor"),
    description: /* @__PURE__ */ React71.createElement(React71.Fragment, null, (0, import_i18n28.__)("To upload them anyway, ask the site administrator to enable unfiltered", "elementor"), /* @__PURE__ */ React71.createElement("br", null), (0, import_i18n28.__)("file uploads.", "elementor")),
    isEnabled: !isAdmin
  };
  return /* @__PURE__ */ React71.createElement(import_ui56.Stack, { gap: 1, "aria-label": "SVG Control" }, /* @__PURE__ */ React71.createElement(EnableUnfilteredModal, { open: unfilteredModalOpenState, onClose: onCloseUnfilteredModal }), /* @__PURE__ */ React71.createElement(ControlActions, null, /* @__PURE__ */ React71.createElement(StyledCard, { variant: "outlined" }, /* @__PURE__ */ React71.createElement(StyledCardMediaContainer, null, isFetching ? /* @__PURE__ */ React71.createElement(import_ui56.CircularProgress, { role: "progressbar" }) : /* @__PURE__ */ React71.createElement(
    import_ui56.CardMedia,
    {
      component: "img",
      image: src,
      alt: (0, import_i18n28.__)("Preview SVG", "elementor"),
      sx: { maxHeight: "140px", width: "50px" }
    }
  )), /* @__PURE__ */ React71.createElement(
    import_ui56.CardOverlay,
    {
      sx: {
        "&:hover": {
          backgroundColor: "rgba( 0, 0, 0, 0.75 )"
        }
      }
    },
    /* @__PURE__ */ React71.createElement(import_ui56.Stack, { gap: 1 }, /* @__PURE__ */ React71.createElement(
      import_ui56.Button,
      {
        size: "tiny",
        color: "inherit",
        variant: "outlined",
        onClick: () => handleClick(MODE_BROWSE),
        "aria-label": "Select SVG"
      },
      (0, import_i18n28.__)("Select SVG", "elementor")
    ), /* @__PURE__ */ React71.createElement(ConditionalControlInfotip, { ...infotipProps }, /* @__PURE__ */ React71.createElement("span", null, /* @__PURE__ */ React71.createElement(import_ui56.ThemeProvider, { colorScheme: isAdmin ? "light" : "dark" }, /* @__PURE__ */ React71.createElement(
      import_ui56.Button,
      {
        size: "tiny",
        variant: "text",
        color: "inherit",
        startIcon: /* @__PURE__ */ React71.createElement(import_icons18.UploadIcon, null),
        disabled: !isAdmin,
        onClick: () => isAdmin && handleClick(MODE_UPLOAD),
        "aria-label": "Upload SVG"
      },
      (0, import_i18n28.__)("Upload", "elementor")
    )))))
  ))));
});

// src/controls/video-media-control.tsx
var React72 = __toESM(require("react"));
var import_editor_props29 = require("@elementor/editor-props");
var import_icons19 = require("@elementor/icons");
var import_ui57 = require("@elementor/ui");
var import_wp_media3 = require("@elementor/wp-media");
var import_i18n29 = require("@wordpress/i18n");
var PLACEHOLDER_IMAGE = window.elementorCommon?.config?.urls?.assets + "/shapes/play-triangle.svg";
var VideoMediaControl = createControl(() => {
  const { value, setValue } = useBoundProp(import_editor_props29.videoSrcPropTypeUtil);
  const { id, url } = value ?? {};
  const { data: attachment, isFetching } = (0, import_wp_media3.useWpMediaAttachment)(id?.value || null);
  const videoUrl = attachment?.url ?? url?.value ?? null;
  const { open } = (0, import_wp_media3.useWpMediaFrame)({
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
  return /* @__PURE__ */ React72.createElement(ControlActions, null, /* @__PURE__ */ React72.createElement(import_ui57.Card, { variant: "outlined" }, /* @__PURE__ */ React72.createElement(
    import_ui57.CardMedia,
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
  ), /* @__PURE__ */ React72.createElement(import_ui57.CardOverlay, null, /* @__PURE__ */ React72.createElement(import_ui57.Stack, { gap: 1 }, /* @__PURE__ */ React72.createElement(
    import_ui57.Button,
    {
      size: "tiny",
      color: "inherit",
      variant: "outlined",
      onClick: () => open({ mode: "browse" })
    },
    (0, import_i18n29.__)("Select video", "elementor")
  ), /* @__PURE__ */ React72.createElement(
    import_ui57.Button,
    {
      size: "tiny",
      variant: "text",
      color: "inherit",
      startIcon: /* @__PURE__ */ React72.createElement(import_icons19.UploadIcon, null),
      onClick: () => open({ mode: "upload" })
    },
    (0, import_i18n29.__)("Upload", "elementor")
  )))));
});
var VideoPreview = ({ isFetching = false, videoUrl }) => {
  if (isFetching) {
    return /* @__PURE__ */ React72.createElement(import_ui57.CircularProgress, null);
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
var React79 = __toESM(require("react"));
var import_editor_props35 = require("@elementor/editor-props");
var import_ui65 = require("@elementor/ui");
var import_i18n35 = require("@wordpress/i18n");

// src/controls/background-control/background-overlay/background-overlay-repeater-control.tsx
var React78 = __toESM(require("react"));
var import_editor_props34 = require("@elementor/editor-props");
var import_ui64 = require("@elementor/ui");
var import_wp_media4 = require("@elementor/wp-media");
var import_i18n34 = require("@wordpress/i18n");

// src/env.ts
var import_env = require("@elementor/env");
var { env } = (0, import_env.parseEnv)("@elementor/editor-controls");

// src/controls/background-control/background-gradient-color-control.tsx
var React73 = __toESM(require("react"));
var import_editor_props30 = require("@elementor/editor-props");
var import_ui58 = require("@elementor/ui");
var BackgroundGradientColorControl = createControl(() => {
  const { value, setValue } = useBoundProp(import_editor_props30.backgroundGradientOverlayPropTypeUtil);
  const handleChange = (newValue) => {
    const transformedValue = createTransformableValue(newValue);
    if (transformedValue.positions) {
      transformedValue.positions = import_editor_props30.stringPropTypeUtil.create(newValue.positions.join(" "));
    }
    setValue(transformedValue);
  };
  const createTransformableValue = (newValue) => ({
    ...newValue,
    type: import_editor_props30.stringPropTypeUtil.create(newValue.type),
    angle: import_editor_props30.numberPropTypeUtil.create(newValue.angle),
    stops: import_editor_props30.gradientColorStopPropTypeUtil.create(
      newValue.stops.map(
        ({ color, offset }) => import_editor_props30.colorStopPropTypeUtil.create({
          color: import_editor_props30.colorPropTypeUtil.create(color),
          offset: import_editor_props30.numberPropTypeUtil.create(offset)
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
    import_ui58.UnstableGradientBox,
    {
      sx: { width: "auto", padding: 1.5 },
      value: normalizeValue(),
      onChange: handleChange
    }
  );
});
var initialBackgroundGradientOverlay = import_editor_props30.backgroundGradientOverlayPropTypeUtil.create({
  type: import_editor_props30.stringPropTypeUtil.create("linear"),
  angle: import_editor_props30.numberPropTypeUtil.create(180),
  stops: import_editor_props30.gradientColorStopPropTypeUtil.create([
    import_editor_props30.colorStopPropTypeUtil.create({
      color: import_editor_props30.colorPropTypeUtil.create("rgb(0,0,0)"),
      offset: import_editor_props30.numberPropTypeUtil.create(0)
    }),
    import_editor_props30.colorStopPropTypeUtil.create({
      color: import_editor_props30.colorPropTypeUtil.create("rgb(255,255,255)"),
      offset: import_editor_props30.numberPropTypeUtil.create(100)
    })
  ])
});

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-attachment.tsx
var React74 = __toESM(require("react"));
var import_icons20 = require("@elementor/icons");
var import_ui59 = require("@elementor/ui");
var import_i18n30 = require("@wordpress/i18n");
var attachmentControlOptions = [
  {
    value: "fixed",
    label: (0, import_i18n30.__)("Fixed", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React74.createElement(import_icons20.PinIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "scroll",
    label: (0, import_i18n30.__)("Scroll", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React74.createElement(import_icons20.PinnedOffIcon, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlayAttachment = () => {
  return /* @__PURE__ */ React74.createElement(PopoverGridContainer, null, /* @__PURE__ */ React74.createElement(import_ui59.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React74.createElement(ControlFormLabel, null, (0, import_i18n30.__)("Attachment", "elementor"))), /* @__PURE__ */ React74.createElement(import_ui59.Grid, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end", overflow: "hidden" } }, /* @__PURE__ */ React74.createElement(ToggleControl, { options: attachmentControlOptions })));
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-position.tsx
var React75 = __toESM(require("react"));
var import_react37 = require("react");
var import_editor_props31 = require("@elementor/editor-props");
var import_editor_ui9 = require("@elementor/editor-ui");
var import_icons21 = require("@elementor/icons");
var import_ui60 = require("@elementor/ui");
var import_i18n31 = require("@wordpress/i18n");
var backgroundPositionOptions = [
  { label: (0, import_i18n31.__)("Center center", "elementor"), value: "center center" },
  { label: (0, import_i18n31.__)("Center left", "elementor"), value: "center left" },
  { label: (0, import_i18n31.__)("Center right", "elementor"), value: "center right" },
  { label: (0, import_i18n31.__)("Top center", "elementor"), value: "top center" },
  { label: (0, import_i18n31.__)("Top left", "elementor"), value: "top left" },
  { label: (0, import_i18n31.__)("Top right", "elementor"), value: "top right" },
  { label: (0, import_i18n31.__)("Bottom center", "elementor"), value: "bottom center" },
  { label: (0, import_i18n31.__)("Bottom left", "elementor"), value: "bottom left" },
  { label: (0, import_i18n31.__)("Bottom right", "elementor"), value: "bottom right" },
  { label: (0, import_i18n31.__)("Custom", "elementor"), value: "custom" }
];
var BackgroundImageOverlayPosition = () => {
  const backgroundImageOffsetContext = useBoundProp(import_editor_props31.backgroundImagePositionOffsetPropTypeUtil);
  const stringPropContext = useBoundProp(import_editor_props31.stringPropTypeUtil);
  const isCustom = !!backgroundImageOffsetContext.value;
  const rowRef = (0, import_react37.useRef)(null);
  const handlePositionChange = (event) => {
    const value = event.target.value || null;
    if (value === "custom") {
      backgroundImageOffsetContext.setValue({ x: null, y: null });
    } else {
      stringPropContext.setValue(value);
    }
  };
  return /* @__PURE__ */ React75.createElement(import_ui60.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React75.createElement(import_ui60.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React75.createElement(PopoverGridContainer, null, /* @__PURE__ */ React75.createElement(import_ui60.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React75.createElement(ControlFormLabel, null, (0, import_i18n31.__)("Position", "elementor"))), /* @__PURE__ */ React75.createElement(import_ui60.Grid, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end", overflow: "hidden" } }, /* @__PURE__ */ React75.createElement(ControlActions, null, /* @__PURE__ */ React75.createElement(
    import_ui60.Select,
    {
      fullWidth: true,
      size: "tiny",
      onChange: handlePositionChange,
      disabled: stringPropContext.disabled,
      value: (backgroundImageOffsetContext.value ? "custom" : stringPropContext.value) ?? ""
    },
    backgroundPositionOptions.map(({ label, value }) => /* @__PURE__ */ React75.createElement(import_editor_ui9.MenuListItem, { key: value, value: value ?? "" }, label))
  ))))), isCustom ? /* @__PURE__ */ React75.createElement(PropProvider, { ...backgroundImageOffsetContext }, /* @__PURE__ */ React75.createElement(import_ui60.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React75.createElement(import_ui60.Grid, { container: true, spacing: 1.5, ref: rowRef }, /* @__PURE__ */ React75.createElement(import_ui60.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React75.createElement(PropKeyProvider, { bind: "x" }, /* @__PURE__ */ React75.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React75.createElement(import_icons21.LetterXIcon, { fontSize: "tiny" }),
      anchorRef: rowRef,
      min: -Number.MAX_SAFE_INTEGER
    }
  ))), /* @__PURE__ */ React75.createElement(import_ui60.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React75.createElement(PropKeyProvider, { bind: "y" }, /* @__PURE__ */ React75.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React75.createElement(import_icons21.LetterYIcon, { fontSize: "tiny" }),
      anchorRef: rowRef,
      min: -Number.MAX_SAFE_INTEGER
    }
  )))))) : null);
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-repeat.tsx
var React76 = __toESM(require("react"));
var import_icons22 = require("@elementor/icons");
var import_ui61 = require("@elementor/ui");
var import_i18n32 = require("@wordpress/i18n");
var repeatControlOptions = [
  {
    value: "repeat",
    label: (0, import_i18n32.__)("Repeat", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React76.createElement(import_icons22.GridDotsIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "repeat-x",
    label: (0, import_i18n32.__)("Repeat-x", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React76.createElement(import_icons22.DotsHorizontalIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "repeat-y",
    label: (0, import_i18n32.__)("Repeat-y", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React76.createElement(import_icons22.DotsVerticalIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "no-repeat",
    label: (0, import_i18n32.__)("No-repeat", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React76.createElement(import_icons22.XIcon, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlayRepeat = () => {
  return /* @__PURE__ */ React76.createElement(PopoverGridContainer, null, /* @__PURE__ */ React76.createElement(import_ui61.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React76.createElement(ControlFormLabel, null, (0, import_i18n32.__)("Repeat", "elementor"))), /* @__PURE__ */ React76.createElement(import_ui61.Grid, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React76.createElement(ToggleControl, { options: repeatControlOptions })));
};

// src/controls/background-control/background-overlay/background-image-overlay/background-image-overlay-size.tsx
var React77 = __toESM(require("react"));
var import_react38 = require("react");
var import_editor_props32 = require("@elementor/editor-props");
var import_icons23 = require("@elementor/icons");
var import_ui62 = require("@elementor/ui");
var import_i18n33 = require("@wordpress/i18n");
var sizeControlOptions = [
  {
    value: "auto",
    label: (0, import_i18n33.__)("Auto", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(import_icons23.LetterAIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "cover",
    label: (0, import_i18n33.__)("Cover", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(import_icons23.ArrowsMaximizeIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "contain",
    label: (0, import_i18n33.__)("Contain", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(import_icons23.ArrowBarBothIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "custom",
    label: (0, import_i18n33.__)("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(import_icons23.PencilIcon, { fontSize: size }),
    showTooltip: true
  }
];
var BackgroundImageOverlaySize = () => {
  const backgroundImageScaleContext = useBoundProp(import_editor_props32.backgroundImageSizeScalePropTypeUtil);
  const stringPropContext = useBoundProp(import_editor_props32.stringPropTypeUtil);
  const isCustom = !!backgroundImageScaleContext.value;
  const rowRef = (0, import_react38.useRef)(null);
  const handleSizeChange = (size) => {
    if (size === "custom") {
      backgroundImageScaleContext.setValue({ width: null, height: null });
    } else {
      stringPropContext.setValue(size);
    }
  };
  return /* @__PURE__ */ React77.createElement(import_ui62.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React77.createElement(import_ui62.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React77.createElement(PopoverGridContainer, null, /* @__PURE__ */ React77.createElement(import_ui62.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React77.createElement(ControlFormLabel, null, (0, import_i18n33.__)("Size", "elementor"))), /* @__PURE__ */ React77.createElement(import_ui62.Grid, { item: true, xs: 6, sx: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React77.createElement(
    ControlToggleButtonGroup,
    {
      exclusive: true,
      items: sizeControlOptions,
      onChange: handleSizeChange,
      disabled: stringPropContext.disabled,
      value: backgroundImageScaleContext.value ? "custom" : stringPropContext.value
    }
  )))), isCustom ? /* @__PURE__ */ React77.createElement(PropProvider, { ...backgroundImageScaleContext }, /* @__PURE__ */ React77.createElement(import_ui62.Grid, { item: true, xs: 12, ref: rowRef }, /* @__PURE__ */ React77.createElement(PopoverGridContainer, null, /* @__PURE__ */ React77.createElement(import_ui62.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React77.createElement(PropKeyProvider, { bind: "width" }, /* @__PURE__ */ React77.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React77.createElement(import_icons23.ArrowsMoveHorizontalIcon, { fontSize: "tiny" }),
      extendedOptions: ["auto"],
      anchorRef: rowRef
    }
  ))), /* @__PURE__ */ React77.createElement(import_ui62.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React77.createElement(PropKeyProvider, { bind: "height" }, /* @__PURE__ */ React77.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React77.createElement(import_icons23.ArrowsMoveVerticalIcon, { fontSize: "tiny" }),
      extendedOptions: ["auto"],
      anchorRef: rowRef
    }
  )))))) : null);
};

// src/controls/background-control/background-overlay/use-background-tabs-history.ts
var import_react39 = require("react");
var import_editor_props33 = require("@elementor/editor-props");
var import_ui63 = require("@elementor/ui");
var useBackgroundTabsHistory = ({
  color: initialBackgroundColorOverlay2,
  image: initialBackgroundImageOverlay,
  gradient: initialBackgroundGradientOverlay2
}) => {
  const { value: imageValue, setValue: setImageValue } = useBoundProp(import_editor_props33.backgroundImageOverlayPropTypeUtil);
  const { value: colorValue, setValue: setColorValue } = useBoundProp(import_editor_props33.backgroundColorOverlayPropTypeUtil);
  const { value: gradientValue, setValue: setGradientValue } = useBoundProp(import_editor_props33.backgroundGradientOverlayPropTypeUtil);
  const getCurrentOverlayType = () => {
    if (colorValue) {
      return "color";
    }
    if (gradientValue) {
      return "gradient";
    }
    return "image";
  };
  const { getTabsProps, getTabProps, getTabPanelProps } = (0, import_ui63.useTabs)(getCurrentOverlayType());
  const valuesHistory = (0, import_react39.useRef)({
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
var initialBackgroundColorOverlay = import_editor_props34.backgroundColorOverlayPropTypeUtil.create(
  {
    color: import_editor_props34.colorPropTypeUtil.create(DEFAULT_BACKGROUND_COLOR_OVERLAY_COLOR)
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
  { label: (0, import_i18n34.__)("Thumbnail - 150 x 150", "elementor"), value: "thumbnail" },
  { label: (0, import_i18n34.__)("Medium - 300 x 300", "elementor"), value: "medium" },
  { label: (0, import_i18n34.__)("Large 1024 x 1024", "elementor"), value: "large" },
  { label: (0, import_i18n34.__)("Full", "elementor"), value: "full" }
];
var BackgroundOverlayRepeaterControl = createControl(() => {
  const { propType, value: overlayValues, setValue } = useBoundProp(import_editor_props34.backgroundOverlayPropTypeUtil);
  return /* @__PURE__ */ React78.createElement(PropProvider, { propType, value: overlayValues, setValue }, /* @__PURE__ */ React78.createElement(
    ControlRepeater,
    {
      initial: getInitialBackgroundOverlay(),
      propTypeUtil: import_editor_props34.backgroundOverlayPropTypeUtil
    },
    /* @__PURE__ */ React78.createElement(RepeaterHeader, { label: (0, import_i18n34.__)("Overlay", "elementor") }, /* @__PURE__ */ React78.createElement(TooltipAddItemAction, { newItemIndex: 0 })),
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
  return /* @__PURE__ */ React78.createElement(import_ui64.Box, { sx: { width: "100%" } }, /* @__PURE__ */ React78.createElement(import_ui64.Box, { sx: { borderBottom: 1, borderColor: "divider" } }, /* @__PURE__ */ React78.createElement(
    import_ui64.Tabs,
    {
      size: "small",
      variant: "fullWidth",
      ...getTabsProps(),
      "aria-label": (0, import_i18n34.__)("Background Overlay", "elementor")
    },
    /* @__PURE__ */ React78.createElement(import_ui64.Tab, { label: (0, import_i18n34.__)("Image", "elementor"), ...getTabProps("image") }),
    /* @__PURE__ */ React78.createElement(import_ui64.Tab, { label: (0, import_i18n34.__)("Gradient", "elementor"), ...getTabProps("gradient") }),
    /* @__PURE__ */ React78.createElement(import_ui64.Tab, { label: (0, import_i18n34.__)("Color", "elementor"), ...getTabProps("color") })
  )), /* @__PURE__ */ React78.createElement(import_ui64.TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("image") }, /* @__PURE__ */ React78.createElement(PopoverContent, null, /* @__PURE__ */ React78.createElement(ImageOverlayContent, null))), /* @__PURE__ */ React78.createElement(import_ui64.TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("gradient") }, /* @__PURE__ */ React78.createElement(BackgroundGradientColorControl, null)), /* @__PURE__ */ React78.createElement(import_ui64.TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps("color") }, /* @__PURE__ */ React78.createElement(PopoverContent, null, /* @__PURE__ */ React78.createElement(ColorOverlayContent, { anchorEl: rowRef }))));
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
    import_ui64.CardMedia,
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
    return /* @__PURE__ */ React78.createElement("span", null, (0, import_i18n34.__)("Linear Gradient", "elementor"));
  }
  return /* @__PURE__ */ React78.createElement("span", null, (0, import_i18n34.__)("Radial Gradient", "elementor"));
};
var ColorOverlayContent = ({ anchorEl }) => {
  const propContext = useBoundProp(import_editor_props34.backgroundColorOverlayPropTypeUtil);
  return /* @__PURE__ */ React78.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "color" }, /* @__PURE__ */ React78.createElement(ColorControl, { anchorEl })));
};
var ImageOverlayContent = () => {
  const propContext = useBoundProp(import_editor_props34.backgroundImageOverlayPropTypeUtil);
  return /* @__PURE__ */ React78.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "image" }, /* @__PURE__ */ React78.createElement(ImageControl, { sizes: backgroundResolutionOptions })), /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "position" }, /* @__PURE__ */ React78.createElement(BackgroundImageOverlayPosition, null)), /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "repeat" }, /* @__PURE__ */ React78.createElement(BackgroundImageOverlayRepeat, null)), /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "size" }, /* @__PURE__ */ React78.createElement(BackgroundImageOverlaySize, null)), /* @__PURE__ */ React78.createElement(PropKeyProvider, { bind: "attachment" }, /* @__PURE__ */ React78.createElement(BackgroundImageOverlayAttachment, null)));
};
var StyledUnstableColorIndicator3 = (0, import_ui64.styled)(import_ui64.UnstableColorIndicator)(({ theme }) => ({
  height: "1rem",
  width: "1rem",
  borderRadius: `${theme.shape.borderRadius / 2}px`
}));
var useImage = (image) => {
  let imageTitle, imageUrl = null;
  const imageSrc = image?.value.image.value?.src.value;
  const { data: attachment } = (0, import_wp_media4.useWpMediaAttachment)(imageSrc.id?.value || null);
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
  { label: (0, import_i18n35.__)("Full element", "elementor"), value: "border-box" },
  { label: (0, import_i18n35.__)("Padding edges", "elementor"), value: "padding-box" },
  { label: (0, import_i18n35.__)("Content edges", "elementor"), value: "content-box" },
  { label: (0, import_i18n35.__)("Text", "elementor"), value: "text" }
];
var colorLabel = (0, import_i18n35.__)("Color", "elementor");
var clipLabel = (0, import_i18n35.__)("Clipping", "elementor");
var BackgroundControl = createControl(() => {
  const propContext = useBoundProp(import_editor_props35.backgroundPropTypeUtil);
  return /* @__PURE__ */ React79.createElement(PropProvider, { ...propContext }, /* @__PURE__ */ React79.createElement(PropKeyProvider, { bind: "background-overlay" }, /* @__PURE__ */ React79.createElement(BackgroundOverlayRepeaterControl, null)), /* @__PURE__ */ React79.createElement(BackgroundColorField, null), /* @__PURE__ */ React79.createElement(BackgroundClipField, null));
});
var BackgroundColorField = () => {
  return /* @__PURE__ */ React79.createElement(PropKeyProvider, { bind: "color" }, /* @__PURE__ */ React79.createElement(import_ui65.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React79.createElement(import_ui65.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React79.createElement(ControlLabel, null, colorLabel)), /* @__PURE__ */ React79.createElement(import_ui65.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React79.createElement(ColorControl, null))));
};
var BackgroundClipField = () => {
  return /* @__PURE__ */ React79.createElement(PropKeyProvider, { bind: "clip" }, /* @__PURE__ */ React79.createElement(import_ui65.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React79.createElement(import_ui65.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React79.createElement(ControlLabel, null, clipLabel)), /* @__PURE__ */ React79.createElement(import_ui65.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React79.createElement(SelectControl, { options: clipOptions }))));
};

// src/controls/repeatable-control.tsx
var React80 = __toESM(require("react"));
var import_react40 = require("react");
var import_editor_props36 = require("@elementor/editor-props");
var import_ui66 = require("@elementor/ui");
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
    const childArrayPropTypeUtil2 = (0, import_react40.useMemo)(
      () => (0, import_editor_props36.createArrayPropUtils)(childPropTypeUtil.key, childPropTypeUtil.schema, propKey),
      [childPropTypeUtil.key, childPropTypeUtil.schema, propKey]
    );
    const contextValue = (0, import_react40.useMemo)(
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
  return /* @__PURE__ */ React80.createElement(import_ui66.Box, { component: "span", color }, label);
};
var getAllProperties = (pattern) => {
  const properties = pattern.match(PLACEHOLDER_REGEX)?.map((match) => match.slice(2, -1)) || [];
  return properties;
};

// src/controls/key-value-control.tsx
var React81 = __toESM(require("react"));
var import_react41 = require("react");
var import_editor_props37 = require("@elementor/editor-props");
var import_ui67 = require("@elementor/ui");
var import_i18n36 = require("@wordpress/i18n");

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
  const { value, setValue, ...propContext } = useBoundProp(import_editor_props37.keyValuePropTypeUtil);
  const [keyError, setKeyError] = (0, import_react41.useState)("");
  const [valueError, setValueError] = (0, import_react41.useState)("");
  const [sessionState, setSessionState] = (0, import_react41.useState)({
    key: getInitialFieldValue(value?.key),
    value: getInitialFieldValue(value?.value)
  });
  const keyLabel = props.keyName || (0, import_i18n36.__)("Key", "elementor");
  const valueLabel = props.valueName || (0, import_i18n36.__)("Value", "elementor");
  const { keyHelper, valueHelper } = props.getHelperText?.(sessionState.key, sessionState.value) || {
    keyHelper: void 0,
    valueHelper: void 0
  };
  const [keyRegex, valueRegex, errMsg] = (0, import_react41.useMemo)(
    () => [
      props.regexKey ? new RegExp(props.regexKey) : void 0,
      props.regexValue ? new RegExp(props.regexValue) : void 0,
      props.validationErrorMessage || (0, import_i18n36.__)("Invalid Format", "elementor")
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
    if ((0, import_editor_props37.isTransformable)(newChangedValue) && newChangedValue.$$type === "dynamic") {
      setValue({
        ...value,
        [fieldType]: newChangedValue
      });
      return;
    }
    const extractedValue = import_editor_props37.stringPropTypeUtil.extract(newChangedValue);
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
  return /* @__PURE__ */ React81.createElement(PropProvider, { ...propContext, value, setValue: handleChange }, /* @__PURE__ */ React81.createElement(import_ui67.Grid, { container: true, gap: 1.5 }, /* @__PURE__ */ React81.createElement(import_ui67.Grid, { item: true, xs: 12, display: "flex", flexDirection: "column" }, /* @__PURE__ */ React81.createElement(import_ui67.FormLabel, { size: "tiny", sx: { pb: 1 } }, keyLabel), /* @__PURE__ */ React81.createElement(PropKeyProvider, { bind: "key" }, /* @__PURE__ */ React81.createElement(
    TextControl,
    {
      inputValue: props.escapeHtml ? escapeHtmlAttr(sessionState.key) : sessionState.key,
      error: !!keyError,
      helperText: keyHelper
    }
  )), !!keyError && /* @__PURE__ */ React81.createElement(import_ui67.FormHelperText, { error: true }, keyError)), /* @__PURE__ */ React81.createElement(import_ui67.Grid, { item: true, xs: 12, display: "flex", flexDirection: "column" }, /* @__PURE__ */ React81.createElement(import_ui67.FormLabel, { size: "tiny", sx: { pb: 1 } }, valueLabel), /* @__PURE__ */ React81.createElement(PropKeyProvider, { bind: "value" }, /* @__PURE__ */ React81.createElement(
    TextControl,
    {
      inputValue: props.escapeHtml ? escapeHtmlAttr(sessionState.value) : sessionState.value,
      error: !!valueError,
      inputDisabled: !!keyError,
      helperText: valueHelper
    }
  )), !!valueError && /* @__PURE__ */ React81.createElement(import_ui67.FormHelperText, { error: true }, valueError))));
});

// src/controls/position-control.tsx
var React82 = __toESM(require("react"));
var import_editor_props38 = require("@elementor/editor-props");
var import_editor_ui10 = require("@elementor/editor-ui");
var import_icons24 = require("@elementor/icons");
var import_ui68 = require("@elementor/ui");
var import_i18n37 = require("@wordpress/i18n");
var positionOptions = [
  { label: (0, import_i18n37.__)("Center center", "elementor"), value: "center center" },
  { label: (0, import_i18n37.__)("Center left", "elementor"), value: "center left" },
  { label: (0, import_i18n37.__)("Center right", "elementor"), value: "center right" },
  { label: (0, import_i18n37.__)("Top center", "elementor"), value: "top center" },
  { label: (0, import_i18n37.__)("Top left", "elementor"), value: "top left" },
  { label: (0, import_i18n37.__)("Top right", "elementor"), value: "top right" },
  { label: (0, import_i18n37.__)("Bottom center", "elementor"), value: "bottom center" },
  { label: (0, import_i18n37.__)("Bottom left", "elementor"), value: "bottom left" },
  { label: (0, import_i18n37.__)("Bottom right", "elementor"), value: "bottom right" },
  { label: (0, import_i18n37.__)("Custom", "elementor"), value: "custom" }
];
var PositionControl = () => {
  const positionContext = useBoundProp(import_editor_props38.positionPropTypeUtil);
  const stringPropContext = useBoundProp(import_editor_props38.stringPropTypeUtil);
  const isCustom = !!positionContext.value;
  const handlePositionChange = (event) => {
    const value = event.target.value || null;
    if (value === "custom") {
      positionContext.setValue({ x: null, y: null });
    } else {
      stringPropContext.setValue(value);
    }
  };
  return /* @__PURE__ */ React82.createElement(import_ui68.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React82.createElement(import_ui68.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React82.createElement(import_ui68.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React82.createElement(import_ui68.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React82.createElement(ControlFormLabel, null, (0, import_i18n37.__)("Object position", "elementor"))), /* @__PURE__ */ React82.createElement(import_ui68.Grid, { item: true, xs: 6, sx: { overflow: "hidden" } }, /* @__PURE__ */ React82.createElement(
    import_ui68.Select,
    {
      size: "tiny",
      disabled: stringPropContext.disabled,
      value: (positionContext.value ? "custom" : stringPropContext.value) ?? "",
      onChange: handlePositionChange,
      fullWidth: true
    },
    positionOptions.map(({ label, value }) => /* @__PURE__ */ React82.createElement(import_editor_ui10.MenuListItem, { key: value, value: value ?? "" }, label))
  )))), isCustom && /* @__PURE__ */ React82.createElement(PropProvider, { ...positionContext }, /* @__PURE__ */ React82.createElement(import_ui68.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React82.createElement(import_ui68.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React82.createElement(import_ui68.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React82.createElement(PropKeyProvider, { bind: "x" }, /* @__PURE__ */ React82.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React82.createElement(import_icons24.LetterXIcon, { fontSize: "tiny" }),
      min: -Number.MAX_SAFE_INTEGER
    }
  ))), /* @__PURE__ */ React82.createElement(import_ui68.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React82.createElement(PropKeyProvider, { bind: "y" }, /* @__PURE__ */ React82.createElement(
    SizeControl,
    {
      startIcon: /* @__PURE__ */ React82.createElement(import_icons24.LetterYIcon, { fontSize: "tiny" }),
      min: -Number.MAX_SAFE_INTEGER
    }
  )))))));
};

// src/controls/transform-control/transform-repeater-control.tsx
var React95 = __toESM(require("react"));
var import_react47 = require("react");
var import_editor_props47 = require("@elementor/editor-props");
var import_icons31 = require("@elementor/icons");
var import_ui81 = require("@elementor/ui");
var import_i18n47 = require("@wordpress/i18n");

// src/controls/transform-control/initial-values.ts
var import_editor_props39 = require("@elementor/editor-props");
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
var initialScaleValue = import_editor_props39.scaleTransformPropTypeUtil.create({
  x: import_editor_props39.numberPropTypeUtil.create(defaultValues.scale),
  y: import_editor_props39.numberPropTypeUtil.create(defaultValues.scale),
  z: import_editor_props39.numberPropTypeUtil.create(defaultValues.scale)
});
var initialRotateValue = import_editor_props39.rotateTransformPropTypeUtil.create({
  x: { $$type: "size", value: { size: defaultValues.rotate.size, unit: defaultValues.rotate.unit } },
  y: { $$type: "size", value: { size: defaultValues.rotate.size, unit: defaultValues.rotate.unit } },
  z: { $$type: "size", value: { size: defaultValues.rotate.size, unit: defaultValues.rotate.unit } }
});
var initialSkewValue = import_editor_props39.skewTransformPropTypeUtil.create({
  x: { $$type: "size", value: { size: defaultValues.skew.size, unit: defaultValues.skew.unit } },
  y: { $$type: "size", value: { size: defaultValues.skew.size, unit: defaultValues.skew.unit } }
});

// src/controls/transform-control/transform-content.tsx
var React89 = __toESM(require("react"));
var import_ui76 = require("@elementor/ui");
var import_i18n42 = require("@wordpress/i18n");

// src/controls/transform-control/functions/move.tsx
var React84 = __toESM(require("react"));
var import_react42 = require("react");
var import_editor_props40 = require("@elementor/editor-props");
var import_icons25 = require("@elementor/icons");
var import_ui70 = require("@elementor/ui");
var import_i18n38 = require("@wordpress/i18n");

// src/controls/transform-control/functions/axis-row.tsx
var React83 = __toESM(require("react"));
var import_ui69 = require("@elementor/ui");
var AxisRow = ({ label, bind, startIcon, anchorRef, units: units2, variant = "angle" }) => {
  const safeId = label.replace(/\s+/g, "-").toLowerCase();
  return /* @__PURE__ */ React83.createElement(import_ui69.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React83.createElement(PopoverGridContainer, { ref: anchorRef }, /* @__PURE__ */ React83.createElement(import_ui69.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React83.createElement(ControlLabel, { htmlFor: safeId }, label)), /* @__PURE__ */ React83.createElement(import_ui69.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React83.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React83.createElement(
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
    label: (0, import_i18n38.__)("Move X", "elementor"),
    bind: "x",
    startIcon: /* @__PURE__ */ React84.createElement(import_icons25.ArrowRightIcon, { fontSize: "tiny" }),
    units: ["px", "%", "em", "rem", "vw"]
  },
  {
    label: (0, import_i18n38.__)("Move Y", "elementor"),
    bind: "y",
    startIcon: /* @__PURE__ */ React84.createElement(import_icons25.ArrowDownSmallIcon, { fontSize: "tiny" }),
    units: ["px", "%", "em", "rem", "vh"]
  },
  {
    label: (0, import_i18n38.__)("Move Z", "elementor"),
    bind: "z",
    startIcon: /* @__PURE__ */ React84.createElement(import_icons25.ArrowDownLeftIcon, { fontSize: "tiny" }),
    units: ["px", "%", "em", "rem", "vw", "vh"]
  }
];
var Move = () => {
  const context = useBoundProp(import_editor_props40.moveTransformPropTypeUtil);
  const rowRefs = [(0, import_react42.useRef)(null), (0, import_react42.useRef)(null), (0, import_react42.useRef)(null)];
  return /* @__PURE__ */ React84.createElement(import_ui70.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React84.createElement(PropProvider, { ...context }, /* @__PURE__ */ React84.createElement(PropKeyProvider, { bind: TransformFunctionKeys.move }, moveAxisControls.map((control, index) => /* @__PURE__ */ React84.createElement(
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
var React85 = __toESM(require("react"));
var import_react43 = require("react");
var import_editor_props41 = require("@elementor/editor-props");
var import_icons26 = require("@elementor/icons");
var import_ui71 = require("@elementor/ui");
var import_i18n39 = require("@wordpress/i18n");
var rotateAxisControls = [
  {
    label: (0, import_i18n39.__)("Rotate X", "elementor"),
    bind: "x",
    startIcon: /* @__PURE__ */ React85.createElement(import_icons26.Arrow360Icon, { fontSize: "tiny" })
  },
  {
    label: (0, import_i18n39.__)("Rotate Y", "elementor"),
    bind: "y",
    startIcon: /* @__PURE__ */ React85.createElement(import_icons26.Arrow360Icon, { fontSize: "tiny", style: { transform: "scaleX(-1) rotate(-90deg)" } })
  },
  {
    label: (0, import_i18n39.__)("Rotate Z", "elementor"),
    bind: "z",
    startIcon: /* @__PURE__ */ React85.createElement(import_icons26.RotateClockwiseIcon, { fontSize: "tiny" })
  }
];
var rotateUnits = ["deg", "rad", "grad", "turn"];
var Rotate = () => {
  const context = useBoundProp(import_editor_props41.rotateTransformPropTypeUtil);
  const rowRefs = [(0, import_react43.useRef)(null), (0, import_react43.useRef)(null), (0, import_react43.useRef)(null)];
  return /* @__PURE__ */ React85.createElement(import_ui71.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React85.createElement(PropProvider, { ...context }, /* @__PURE__ */ React85.createElement(PropKeyProvider, { bind: TransformFunctionKeys.rotate }, rotateAxisControls.map((control, index) => /* @__PURE__ */ React85.createElement(
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
var React87 = __toESM(require("react"));
var import_react44 = require("react");
var import_editor_props42 = require("@elementor/editor-props");
var import_icons27 = require("@elementor/icons");
var import_ui73 = require("@elementor/ui");
var import_i18n40 = require("@wordpress/i18n");

// src/controls/transform-control/functions/scale-axis-row.tsx
var React86 = __toESM(require("react"));
var import_ui72 = require("@elementor/ui");
var ScaleAxisRow = ({ label, bind, startIcon, anchorRef }) => {
  return /* @__PURE__ */ React86.createElement(import_ui72.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React86.createElement(PopoverGridContainer, { ref: anchorRef }, /* @__PURE__ */ React86.createElement(import_ui72.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React86.createElement(ControlLabel, null, label)), /* @__PURE__ */ React86.createElement(import_ui72.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React86.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React86.createElement(NumberControl, { step: 0.1, placeholder: "1", startIcon })))));
};

// src/controls/transform-control/functions/scale.tsx
var scaleAxisControls = [
  {
    label: (0, import_i18n40.__)("Scale X", "elementor"),
    bind: "x",
    startIcon: /* @__PURE__ */ React87.createElement(import_icons27.ArrowRightIcon, { fontSize: "tiny" })
  },
  {
    label: (0, import_i18n40.__)("Scale Y", "elementor"),
    bind: "y",
    startIcon: /* @__PURE__ */ React87.createElement(import_icons27.ArrowDownSmallIcon, { fontSize: "tiny" })
  },
  {
    label: (0, import_i18n40.__)("Scale Z", "elementor"),
    bind: "z",
    startIcon: /* @__PURE__ */ React87.createElement(import_icons27.ArrowDownLeftIcon, { fontSize: "tiny" })
  }
];
var Scale = () => {
  const context = useBoundProp(import_editor_props42.scaleTransformPropTypeUtil);
  const rowRefs = [(0, import_react44.useRef)(null), (0, import_react44.useRef)(null), (0, import_react44.useRef)(null)];
  return /* @__PURE__ */ React87.createElement(import_ui73.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React87.createElement(PropProvider, { ...context }, /* @__PURE__ */ React87.createElement(PropKeyProvider, { bind: TransformFunctionKeys.scale }, scaleAxisControls.map((control, index) => /* @__PURE__ */ React87.createElement(ScaleAxisRow, { key: control.bind, ...control, anchorRef: rowRefs[index] })))));
};

// src/controls/transform-control/functions/skew.tsx
var React88 = __toESM(require("react"));
var import_react45 = require("react");
var import_editor_props43 = require("@elementor/editor-props");
var import_icons28 = require("@elementor/icons");
var import_ui74 = require("@elementor/ui");
var import_i18n41 = require("@wordpress/i18n");
var skewAxisControls = [
  {
    label: (0, import_i18n41.__)("Skew X", "elementor"),
    bind: "x",
    startIcon: /* @__PURE__ */ React88.createElement(import_icons28.ArrowRightIcon, { fontSize: "tiny" })
  },
  {
    label: (0, import_i18n41.__)("Skew Y", "elementor"),
    bind: "y",
    startIcon: /* @__PURE__ */ React88.createElement(import_icons28.ArrowLeftIcon, { fontSize: "tiny", style: { transform: "scaleX(-1) rotate(-90deg)" } })
  }
];
var skewUnits = ["deg", "rad", "grad", "turn"];
var Skew = () => {
  const context = useBoundProp(import_editor_props43.skewTransformPropTypeUtil);
  const rowRefs = [(0, import_react45.useRef)(null), (0, import_react45.useRef)(null), (0, import_react45.useRef)(null)];
  return /* @__PURE__ */ React88.createElement(import_ui74.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React88.createElement(PropProvider, { ...context }, /* @__PURE__ */ React88.createElement(PropKeyProvider, { bind: TransformFunctionKeys.skew }, skewAxisControls.map((control, index) => /* @__PURE__ */ React88.createElement(
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
var import_react46 = require("react");
var import_editor_props44 = require("@elementor/editor-props");
var import_ui75 = require("@elementor/ui");
var useTransformTabsHistory = ({
  move: initialMove,
  scale: initialScale,
  rotate: initialRotate,
  skew: initialSkew
}) => {
  const { value: moveValue, setValue: setMoveValue } = useBoundProp(import_editor_props44.moveTransformPropTypeUtil);
  const { value: scaleValue, setValue: setScaleValue } = useBoundProp(import_editor_props44.scaleTransformPropTypeUtil);
  const { value: rotateValue, setValue: setRotateValue } = useBoundProp(import_editor_props44.rotateTransformPropTypeUtil);
  const { value: skewValue, setValue: setSkewValue } = useBoundProp(import_editor_props44.skewTransformPropTypeUtil);
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
  const { getTabsProps, getTabProps, getTabPanelProps } = (0, import_ui75.useTabs)(getCurrentTransformType());
  const valuesHistory = (0, import_react46.useRef)({
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
  return /* @__PURE__ */ React89.createElement(PopoverContent, null, /* @__PURE__ */ React89.createElement(import_ui76.Box, { sx: { width: "100%" } }, /* @__PURE__ */ React89.createElement(import_ui76.Box, { sx: { borderBottom: 1, borderColor: "divider" } }, /* @__PURE__ */ React89.createElement(
    import_ui76.Tabs,
    {
      size: "small",
      variant: "fullWidth",
      sx: {
        "& .MuiTab-root": {
          minWidth: "62px"
        }
      },
      ...getTabsProps(),
      "aria-label": (0, import_i18n42.__)("Transform", "elementor")
    },
    /* @__PURE__ */ React89.createElement(import_ui76.Tab, { label: (0, import_i18n42.__)("Move", "elementor"), ...getTabProps(TransformFunctionKeys.move) }),
    /* @__PURE__ */ React89.createElement(import_ui76.Tab, { label: (0, import_i18n42.__)("Scale", "elementor"), ...getTabProps(TransformFunctionKeys.scale) }),
    /* @__PURE__ */ React89.createElement(import_ui76.Tab, { label: (0, import_i18n42.__)("Rotate", "elementor"), ...getTabProps(TransformFunctionKeys.rotate) }),
    /* @__PURE__ */ React89.createElement(import_ui76.Tab, { label: (0, import_i18n42.__)("Skew", "elementor"), ...getTabProps(TransformFunctionKeys.skew) })
  )), /* @__PURE__ */ React89.createElement(import_ui76.TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps(TransformFunctionKeys.move) }, /* @__PURE__ */ React89.createElement(Move, null)), /* @__PURE__ */ React89.createElement(import_ui76.TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps(TransformFunctionKeys.scale) }, /* @__PURE__ */ React89.createElement(Scale, null)), /* @__PURE__ */ React89.createElement(import_ui76.TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps(TransformFunctionKeys.rotate) }, /* @__PURE__ */ React89.createElement(Rotate, null)), /* @__PURE__ */ React89.createElement(import_ui76.TabPanel, { sx: { p: 1.5 }, ...getTabPanelProps(TransformFunctionKeys.skew) }, /* @__PURE__ */ React89.createElement(Skew, null))));
};

// src/controls/transform-control/transform-icon.tsx
var React90 = __toESM(require("react"));
var import_icons29 = require("@elementor/icons");
var TransformIcon = ({ value }) => {
  switch (value.$$type) {
    case TransformFunctionKeys.move:
      return /* @__PURE__ */ React90.createElement(import_icons29.ArrowsMaximizeIcon, { fontSize: "tiny" });
    case TransformFunctionKeys.scale:
      return /* @__PURE__ */ React90.createElement(import_icons29.ArrowAutofitHeightIcon, { fontSize: "tiny" });
    case TransformFunctionKeys.rotate:
      return /* @__PURE__ */ React90.createElement(import_icons29.RotateClockwise2Icon, { fontSize: "tiny" });
    case TransformFunctionKeys.skew:
      return /* @__PURE__ */ React90.createElement(import_icons29.SkewXIcon, { fontSize: "tiny" });
    default:
      return null;
  }
};

// src/controls/transform-control/transform-label.tsx
var React91 = __toESM(require("react"));
var import_ui77 = require("@elementor/ui");
var import_i18n43 = require("@wordpress/i18n");
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
      return /* @__PURE__ */ React91.createElement(Label2, { label: (0, import_i18n43.__)("Move", "elementor"), value: formatLabel(value, "move") });
    case TransformFunctionKeys.scale:
      return /* @__PURE__ */ React91.createElement(Label2, { label: (0, import_i18n43.__)("Scale", "elementor"), value: formatLabel(value, "scale") });
    case TransformFunctionKeys.rotate:
      return /* @__PURE__ */ React91.createElement(Label2, { label: (0, import_i18n43.__)("Rotate", "elementor"), value: formatLabel(value, "rotate") });
    case TransformFunctionKeys.skew:
      return /* @__PURE__ */ React91.createElement(Label2, { label: (0, import_i18n43.__)("Skew", "elementor"), value: formatLabel(value, "skew") });
    default:
      return "";
  }
};
var Label2 = ({ label, value }) => {
  return /* @__PURE__ */ React91.createElement(import_ui77.Box, { component: "span" }, label, ": ", value);
};

// src/controls/transform-control/transform-settings-control.tsx
var React94 = __toESM(require("react"));
var import_editor_ui11 = require("@elementor/editor-ui");
var import_icons30 = require("@elementor/icons");
var import_ui80 = require("@elementor/ui");
var import_i18n46 = require("@wordpress/i18n");

// src/controls/transform-control/transform-base-controls/children-perspective-control.tsx
var React92 = __toESM(require("react"));
var import_editor_props45 = require("@elementor/editor-props");
var import_ui78 = require("@elementor/ui");
var import_i18n44 = require("@wordpress/i18n");
var ORIGIN_UNITS = ["px", "%", "em", "rem"];
var PERSPECTIVE_CONTROL_FIELD = {
  label: (0, import_i18n44.__)("Perspective", "elementor"),
  bind: "perspective",
  units: ["px", "em", "rem", "vw", "vh"]
};
var CHILDREN_PERSPECTIVE_FIELDS = [
  {
    label: (0, import_i18n44.__)("Origin X", "elementor"),
    bind: "x",
    units: ORIGIN_UNITS
  },
  {
    label: (0, import_i18n44.__)("Origin Y", "elementor"),
    bind: "y",
    units: ORIGIN_UNITS
  }
];
var ChildrenPerspectiveControl = () => {
  return /* @__PURE__ */ React92.createElement(import_ui78.Stack, { direction: "column", spacing: 1.5 }, /* @__PURE__ */ React92.createElement(ControlFormLabel, null, (0, import_i18n44.__)("Children perspective", "elementor")), /* @__PURE__ */ React92.createElement(PerspectiveControl, null), /* @__PURE__ */ React92.createElement(PerspectiveOriginControl, null));
};
var PerspectiveControl = () => /* @__PURE__ */ React92.createElement(PropKeyProvider, { bind: "perspective" }, /* @__PURE__ */ React92.createElement(ControlFields, { control: PERSPECTIVE_CONTROL_FIELD, key: PERSPECTIVE_CONTROL_FIELD.bind }));
var PerspectiveOriginControl = () => /* @__PURE__ */ React92.createElement(PropKeyProvider, { bind: "perspective-origin" }, /* @__PURE__ */ React92.createElement(PerspectiveOriginControlProvider, null));
var PerspectiveOriginControlProvider = () => {
  const context = useBoundProp(import_editor_props45.perspectiveOriginPropTypeUtil);
  return /* @__PURE__ */ React92.createElement(PropProvider, { ...context }, CHILDREN_PERSPECTIVE_FIELDS.map((control) => /* @__PURE__ */ React92.createElement(PropKeyProvider, { bind: control.bind, key: control.bind }, /* @__PURE__ */ React92.createElement(ControlFields, { control }))));
};
var ControlFields = ({ control }) => {
  const rowRef = React92.useRef(null);
  return /* @__PURE__ */ React92.createElement(PopoverGridContainer, { ref: rowRef }, /* @__PURE__ */ React92.createElement(import_ui78.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React92.createElement(ControlFormLabel, null, control.label)), /* @__PURE__ */ React92.createElement(import_ui78.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React92.createElement(SizeControl, { variant: "length", units: control.units, anchorRef: rowRef, disableCustom: true })));
};

// src/controls/transform-control/transform-base-controls/transform-origin-control.tsx
var React93 = __toESM(require("react"));
var import_editor_props46 = require("@elementor/editor-props");
var import_ui79 = require("@elementor/ui");
var import_i18n45 = require("@wordpress/i18n");
var TRANSFORM_ORIGIN_UNITS = ["px", "%", "em", "rem"];
var TRANSFORM_ORIGIN_UNITS_Z_AXIS = TRANSFORM_ORIGIN_UNITS.filter((unit) => unit !== "%");
var TRANSFORM_ORIGIN_FIELDS = [
  {
    label: (0, import_i18n45.__)("Origin X", "elementor"),
    bind: "x",
    units: TRANSFORM_ORIGIN_UNITS
  },
  {
    label: (0, import_i18n45.__)("Origin Y", "elementor"),
    bind: "y",
    units: TRANSFORM_ORIGIN_UNITS
  },
  {
    label: (0, import_i18n45.__)("Origin Z", "elementor"),
    bind: "z",
    units: TRANSFORM_ORIGIN_UNITS_Z_AXIS
  }
];
var TransformOriginControl = () => {
  return /* @__PURE__ */ React93.createElement(import_ui79.Stack, { direction: "column", spacing: 1.5 }, /* @__PURE__ */ React93.createElement(ControlFormLabel, null, (0, import_i18n45.__)("Transform", "elementor")), TRANSFORM_ORIGIN_FIELDS.map((control) => /* @__PURE__ */ React93.createElement(ControlFields2, { control, key: control.bind })));
};
var ControlFields2 = ({ control }) => {
  const context = useBoundProp(import_editor_props46.transformOriginPropTypeUtil);
  const rowRef = React93.useRef(null);
  return /* @__PURE__ */ React93.createElement(PropProvider, { ...context }, /* @__PURE__ */ React93.createElement(PropKeyProvider, { bind: control.bind }, /* @__PURE__ */ React93.createElement(PopoverGridContainer, { ref: rowRef }, /* @__PURE__ */ React93.createElement(import_ui79.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React93.createElement(ControlFormLabel, null, control.label)), /* @__PURE__ */ React93.createElement(import_ui79.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React93.createElement(SizeControl, { variant: "length", units: control.units, anchorRef: rowRef, disableCustom: true })))));
};

// src/controls/transform-control/transform-settings-control.tsx
var SIZE8 = "tiny";
var TransformSettingsControl = ({
  popupState,
  anchorRef,
  showChildrenPerspective
}) => {
  const popupProps = (0, import_ui80.bindPopover)({
    ...popupState,
    anchorEl: anchorRef.current ?? void 0
  });
  return /* @__PURE__ */ React94.createElement(
    import_ui80.Popover,
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
      import_editor_ui11.PopoverHeader,
      {
        title: (0, import_i18n46.__)("Transform settings", "elementor"),
        onClose: popupState.close,
        icon: /* @__PURE__ */ React94.createElement(import_icons30.AdjustmentsIcon, { fontSize: SIZE8 })
      }
    ),
    /* @__PURE__ */ React94.createElement(import_ui80.Divider, null),
    /* @__PURE__ */ React94.createElement(PopoverContent, { sx: { px: 2, py: 1.5 } }, /* @__PURE__ */ React94.createElement(PropKeyProvider, { bind: "transform-origin" }, /* @__PURE__ */ React94.createElement(TransformOriginControl, null)), showChildrenPerspective && /* @__PURE__ */ React94.createElement(React94.Fragment, null, /* @__PURE__ */ React94.createElement(import_ui80.Box, { sx: { my: 0.5 } }, /* @__PURE__ */ React94.createElement(import_ui80.Divider, null)), /* @__PURE__ */ React94.createElement(ChildrenPerspectiveControl, null)))
  );
};

// src/controls/transform-control/transform-repeater-control.tsx
var SIZE9 = "tiny";
var TransformRepeaterControl = createControl(
  ({ showChildrenPerspective }) => {
    const context = useBoundProp(import_editor_props47.transformPropTypeUtil);
    const headerRef = (0, import_react47.useRef)(null);
    const popupState = (0, import_ui81.usePopupState)({ variant: "popover" });
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
  import_ui81.Box,
  {
    component: "span",
    "aria-label": void 0,
    sx: { display: "flex", gap: 0.5, p: 2, width: 320, borderRadius: 1 }
  },
  /* @__PURE__ */ React95.createElement(import_icons31.InfoCircleFilledIcon, { sx: { color: "secondary.main" } }),
  /* @__PURE__ */ React95.createElement(import_ui81.Typography, { variant: "body2", color: "text.secondary", fontSize: "14px" }, (0, import_i18n47.__)("You can use each kind of transform only once per element.", "elementor"))
);
var Repeater2 = ({
  headerRef,
  propType,
  popupState
}) => {
  const transformFunctionsContext = useBoundProp(import_editor_props47.transformFunctionsPropTypeUtil);
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
      propTypeUtil: import_editor_props47.transformFunctionsPropTypeUtil
    },
    /* @__PURE__ */ React95.createElement(
      RepeaterHeader,
      {
        label: (0, import_i18n47.__)("Transform", "elementor"),
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
  const titleLabel = (0, import_i18n47.__)("Transform settings", "elementor");
  return bind !== repeaterBindKey ? null : /* @__PURE__ */ React95.createElement(import_ui81.Tooltip, { title: titleLabel, placement: "top" }, /* @__PURE__ */ React95.createElement(import_ui81.IconButton, { size: SIZE9, "aria-label": titleLabel, ...(0, import_ui81.bindTrigger)(popupState) }, /* @__PURE__ */ React95.createElement(import_icons31.AdjustmentsIcon, { fontSize: SIZE9 })));
};

// src/controls/transition-control/transition-repeater-control.tsx
var React98 = __toESM(require("react"));
var import_react50 = require("react");
var import_editor_props50 = require("@elementor/editor-props");
var import_icons33 = require("@elementor/icons");
var import_ui84 = require("@elementor/ui");
var import_i18n50 = require("@wordpress/i18n");

// src/controls/selection-size-control.tsx
var React96 = __toESM(require("react"));
var import_react48 = require("react");
var import_editor_props48 = require("@elementor/editor-props");
var import_ui82 = require("@elementor/ui");
var SelectionSizeControl = createControl(
  ({ selectionLabel, sizeLabel, selectionConfig, sizeConfigMap }) => {
    const { value, setValue, propType } = useBoundProp(import_editor_props48.selectionSizePropTypeUtil);
    const rowRef = (0, import_react48.useRef)(null);
    const sizeFieldId = sizeLabel.replace(/\s+/g, "-").toLowerCase();
    const currentSizeConfig = (0, import_react48.useMemo)(() => {
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
    return /* @__PURE__ */ React96.createElement(PropProvider, { value, setValue, propType }, /* @__PURE__ */ React96.createElement(import_ui82.Grid, { container: true, spacing: 1.5, ref: rowRef }, /* @__PURE__ */ React96.createElement(import_ui82.Grid, { item: true, xs: 6, sx: { display: "flex", alignItems: "center" } }, /* @__PURE__ */ React96.createElement(ControlFormLabel, null, selectionLabel)), /* @__PURE__ */ React96.createElement(import_ui82.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React96.createElement(PropKeyProvider, { bind: "selection" }, /* @__PURE__ */ React96.createElement(SelectionComponent, { ...selectionConfig.props }))), currentSizeConfig && /* @__PURE__ */ React96.createElement(React96.Fragment, null, /* @__PURE__ */ React96.createElement(import_ui82.Grid, { item: true, xs: 6, sx: { display: "flex", alignItems: "center" } }, /* @__PURE__ */ React96.createElement(ControlFormLabel, { htmlFor: sizeFieldId }, sizeLabel)), /* @__PURE__ */ React96.createElement(import_ui82.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React96.createElement(PropKeyProvider, { bind: "size" }, /* @__PURE__ */ React96.createElement(
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
var import_utils6 = require("@elementor/utils");
var import_i18n48 = require("@wordpress/i18n");
var initialTransitionValue = {
  selection: {
    $$type: "key-value",
    value: {
      key: { value: (0, import_i18n48.__)("All properties", "elementor"), $$type: "string" },
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
  if (!(0, import_utils6.hasProInstalled)()) {
    return false;
  }
  const proVersion = window.elementorPro?.config?.version;
  if (!proVersion) {
    return false;
  }
  return (0, import_utils6.isVersionGreaterOrEqual)(proVersion, MIN_PRO_VERSION);
};
var createTransitionPropertiesList = () => {
  const isSiteRtl = getIsSiteRtl();
  const baseProperties = [
    {
      label: (0, import_i18n48.__)("Default", "elementor"),
      type: "category",
      properties: [{ label: (0, import_i18n48.__)("All properties", "elementor"), value: "all" }]
    },
    {
      label: (0, import_i18n48.__)("Margin", "elementor"),
      type: "category",
      properties: [
        { label: (0, import_i18n48.__)("Margin (all)", "elementor"), value: "margin", isDisabled: true },
        { label: (0, import_i18n48.__)("Margin bottom", "elementor"), value: "margin-block-end", isDisabled: true },
        {
          label: isSiteRtl ? (0, import_i18n48.__)("Margin right", "elementor") : (0, import_i18n48.__)("Margin left", "elementor"),
          value: "margin-inline-start",
          isDisabled: true
        },
        {
          label: isSiteRtl ? (0, import_i18n48.__)("Margin left", "elementor") : (0, import_i18n48.__)("Margin right", "elementor"),
          value: "margin-inline-end",
          isDisabled: true
        },
        { label: (0, import_i18n48.__)("Margin top", "elementor"), value: "margin-block-start", isDisabled: true }
      ]
    },
    {
      label: (0, import_i18n48.__)("Padding", "elementor"),
      type: "category",
      properties: [
        { label: (0, import_i18n48.__)("Padding (all)", "elementor"), value: "padding", isDisabled: true },
        { label: (0, import_i18n48.__)("Padding bottom", "elementor"), value: "padding-block-end", isDisabled: true },
        {
          label: isSiteRtl ? (0, import_i18n48.__)("Padding right", "elementor") : (0, import_i18n48.__)("Padding left", "elementor"),
          value: "padding-inline-start",
          isDisabled: true
        },
        {
          label: isSiteRtl ? (0, import_i18n48.__)("Padding left", "elementor") : (0, import_i18n48.__)("Padding right", "elementor"),
          value: "padding-inline-end",
          isDisabled: true
        },
        { label: (0, import_i18n48.__)("Padding top", "elementor"), value: "padding-block-start", isDisabled: true }
      ]
    },
    {
      label: (0, import_i18n48.__)("Flex", "elementor"),
      type: "category",
      properties: [
        { label: (0, import_i18n48.__)("Flex (all)", "elementor"), value: "flex", isDisabled: true },
        { label: (0, import_i18n48.__)("Flex grow", "elementor"), value: "flex-grow", isDisabled: true },
        { label: (0, import_i18n48.__)("Flex shrink", "elementor"), value: "flex-shrink", isDisabled: true },
        { label: (0, import_i18n48.__)("Flex basis", "elementor"), value: "flex-basis", isDisabled: true }
      ]
    },
    {
      label: (0, import_i18n48.__)("Size", "elementor"),
      type: "category",
      properties: [
        { label: (0, import_i18n48.__)("Width", "elementor"), value: "width", isDisabled: true },
        { label: (0, import_i18n48.__)("Height", "elementor"), value: "height", isDisabled: true },
        { label: (0, import_i18n48.__)("Max height", "elementor"), value: "max-height", isDisabled: true },
        { label: (0, import_i18n48.__)("Max width", "elementor"), value: "max-width", isDisabled: true },
        { label: (0, import_i18n48.__)("Min height", "elementor"), value: "min-height", isDisabled: true },
        { label: (0, import_i18n48.__)("Min width", "elementor"), value: "min-width", isDisabled: true }
      ]
    },
    {
      label: (0, import_i18n48.__)("Position", "elementor"),
      type: "category",
      properties: [
        { label: (0, import_i18n48.__)("Top", "elementor"), value: "inset-block-start", isDisabled: true },
        {
          label: isSiteRtl ? (0, import_i18n48.__)("Right", "elementor") : (0, import_i18n48.__)("Left", "elementor"),
          value: "inset-inline-start",
          isDisabled: true
        },
        {
          label: isSiteRtl ? (0, import_i18n48.__)("Left", "elementor") : (0, import_i18n48.__)("Right", "elementor"),
          value: "inset-inline-end",
          isDisabled: true
        },
        { label: (0, import_i18n48.__)("Bottom", "elementor"), value: "inset-block-end", isDisabled: true },
        { label: (0, import_i18n48.__)("Z-index", "elementor"), value: "z-index", isDisabled: true }
      ]
    },
    {
      label: (0, import_i18n48.__)("Typography", "elementor"),
      type: "category",
      properties: [
        { label: (0, import_i18n48.__)("Font color", "elementor"), value: "color", isDisabled: true },
        { label: (0, import_i18n48.__)("Font size", "elementor"), value: "font-size", isDisabled: true },
        { label: (0, import_i18n48.__)("Line height", "elementor"), value: "line-height", isDisabled: true },
        { label: (0, import_i18n48.__)("Letter spacing", "elementor"), value: "letter-spacing", isDisabled: true },
        { label: (0, import_i18n48.__)("Word spacing", "elementor"), value: "word-spacing", isDisabled: true },
        { label: (0, import_i18n48.__)("Font variations", "elementor"), value: "font-variation-settings", isDisabled: true },
        { label: (0, import_i18n48.__)("Text stroke color", "elementor"), value: "-webkit-text-stroke-color", isDisabled: true }
      ]
    },
    {
      label: (0, import_i18n48.__)("Background", "elementor"),
      type: "category",
      properties: [
        { label: (0, import_i18n48.__)("Background color", "elementor"), value: "background-color", isDisabled: true },
        { label: (0, import_i18n48.__)("Background position", "elementor"), value: "background-position", isDisabled: true },
        { label: (0, import_i18n48.__)("Box shadow", "elementor"), value: "box-shadow", isDisabled: true }
      ]
    },
    {
      label: (0, import_i18n48.__)("Border", "elementor"),
      type: "category",
      properties: [
        { label: (0, import_i18n48.__)("Border (all)", "elementor"), value: "border", isDisabled: true },
        { label: (0, import_i18n48.__)("Border radius", "elementor"), value: "border-radius", isDisabled: true },
        { label: (0, import_i18n48.__)("Border color", "elementor"), value: "border-color", isDisabled: true },
        { label: (0, import_i18n48.__)("Border width", "elementor"), value: "border-width", isDisabled: true }
      ]
    },
    {
      label: (0, import_i18n48.__)("Effects", "elementor"),
      type: "category",
      properties: [
        { label: (0, import_i18n48.__)("Opacity", "elementor"), value: "opacity", isDisabled: true },
        { label: (0, import_i18n48.__)("Transform (all)", "elementor"), value: "transform", isDisabled: true },
        { label: (0, import_i18n48.__)("Filter (all)", "elementor"), value: "filter", isDisabled: true }
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
var import_editor_elements4 = require("@elementor/editor-elements");
var import_events = require("@elementor/events");
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
    const selectedElements = (0, import_editor_elements4.getSelectedElements)();
    const widgetType = selectedElements[0]?.type ?? null;
    (0, import_events.trackEvent)({
      transition_type: value ?? "unknown",
      ...transitionRepeaterMixpanelEvent,
      widget_type: widgetType
    });
  });
}

// src/controls/transition-control/transition-selector.tsx
var React97 = __toESM(require("react"));
var import_react49 = require("react");
var import_editor_props49 = require("@elementor/editor-props");
var import_editor_ui12 = require("@elementor/editor-ui");
var import_icons32 = require("@elementor/icons");
var import_ui83 = require("@elementor/ui");
var import_i18n49 = require("@wordpress/i18n");
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
  const { value, setValue } = useBoundProp(import_editor_props49.keyValuePropTypeUtil);
  const {
    key: { value: transitionLabel }
  } = value;
  const defaultRef = (0, import_react49.useRef)(null);
  const popoverState = (0, import_ui83.usePopupState)({ variant: "popover" });
  const disabledCategories = (0, import_react49.useMemo)(() => {
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
        label: (0, import_i18n49.__)("Recently Used", "elementor"),
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
  return /* @__PURE__ */ React97.createElement(import_ui83.Box, { ref: defaultRef }, /* @__PURE__ */ React97.createElement(ControlActions, null, /* @__PURE__ */ React97.createElement(
    import_ui83.UnstableTag,
    {
      variant: "outlined",
      label: transitionLabel,
      endIcon: /* @__PURE__ */ React97.createElement(import_icons32.ChevronDownIcon, { fontSize: "tiny" }),
      ...(0, import_ui83.bindTrigger)(popoverState),
      fullWidth: true
    }
  )), /* @__PURE__ */ React97.createElement(
    import_ui83.Popover,
    {
      disablePortal: true,
      disableScrollLock: true,
      ...(0, import_ui83.bindPopover)(popoverState),
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
        title: (0, import_i18n49.__)("Transition Property", "elementor"),
        icon: import_icons32.VariationsIcon,
        disabledItems: includeCurrentValueInOptions(value, disabledItems),
        categoryItemContentTemplate: (item) => /* @__PURE__ */ React97.createElement(
          import_ui83.Box,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%"
            }
          },
          /* @__PURE__ */ React97.createElement("span", null, item.value),
          showPromotion && disabledCategories.has(item.value) && /* @__PURE__ */ React97.createElement(import_editor_ui12.PromotionChip, null)
        ),
        footer: showPromotion ? /* @__PURE__ */ React97.createElement(
          import_editor_ui12.PromotionAlert,
          {
            message: (0, import_i18n49.__)(
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
var childArrayPropTypeUtil = (0, import_editor_props50.createArrayPropUtils)(
  import_editor_props50.selectionSizePropTypeUtil.key,
  import_editor_props50.selectionSizePropTypeUtil.schema,
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
    selectionLabel: (0, import_i18n50.__)("Type", "elementor"),
    sizeLabel: (0, import_i18n50.__)("Duration", "elementor"),
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
    propTypeUtil: import_editor_props50.selectionSizePropTypeUtil,
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
  import_ui84.Alert,
  {
    sx: {
      width: 280,
      gap: 0.5
    },
    color: "secondary",
    icon: /* @__PURE__ */ React98.createElement(import_icons33.InfoCircleFilledIcon, null)
  },
  /* @__PURE__ */ React98.createElement(import_ui84.AlertTitle, null, (0, import_i18n50.__)("Transitions", "elementor")),
  /* @__PURE__ */ React98.createElement(import_ui84.Box, { component: "span" }, /* @__PURE__ */ React98.createElement(import_ui84.Typography, { variant: "body2" }, (0, import_i18n50.__)("Switch to 'Normal' state to add a transition.", "elementor")))
);
var TransitionRepeaterControl = createControl(
  ({
    recentlyUsedListGetter,
    currentStyleState
  }) => {
    const currentStyleIsNormal = currentStyleState === null;
    const [recentlyUsedList, setRecentlyUsedList] = (0, import_react50.useState)([]);
    const { value, setValue } = useBoundProp(childArrayPropTypeUtil);
    const { allDisabled: disabledItems, proDisabled: proDisabledItems } = (0, import_react50.useMemo)(
      () => getDisabledItemLabels(value),
      [value]
    );
    const allowedTransitionSet = (0, import_react50.useMemo)(() => {
      const set = /* @__PURE__ */ new Set();
      transitionProperties.forEach((category) => {
        category.properties.forEach((prop) => set.add(prop.value));
      });
      return set;
    }, []);
    (0, import_react50.useEffect)(() => {
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
    (0, import_react50.useEffect)(() => {
      recentlyUsedListGetter().then(setRecentlyUsedList);
    }, [recentlyUsedListGetter]);
    const allPropertiesUsed = (0, import_react50.useMemo)(() => areAllPropertiesUsed(value), [value]);
    const isAddItemDisabled = !currentStyleIsNormal || allPropertiesUsed;
    return /* @__PURE__ */ React98.createElement(
      RepeatableControl,
      {
        label: (0, import_i18n50.__)("Transitions", "elementor"),
        repeaterLabel: (0, import_i18n50.__)("Transitions", "elementor"),
        patternLabel: "${value.selection.value.key.value}: ${value.size.value.size}${value.size.value.unit}",
        placeholder: (0, import_i18n50.__)("Empty Transition", "elementor"),
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
var React99 = __toESM(require("react"));
var dayjs = __toESM(require("dayjs"));
var import_editor_props51 = require("@elementor/editor-props");
var import_editor_props52 = require("@elementor/editor-props");
var import_ui85 = require("@elementor/ui");
var DATE_FORMAT = "YYYY-MM-DD";
var TIME_FORMAT = "HH:mm";
var DateTimeControl = createControl(({ inputDisabled }) => {
  const { value, setValue, ...propContext } = useBoundProp(import_editor_props52.DateTimePropTypeUtil);
  const handleChange = (newValue, meta) => {
    const field = meta.bind;
    const fieldValue = newValue[field];
    if ((0, import_editor_props51.isTransformable)(fieldValue)) {
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
  return /* @__PURE__ */ React99.createElement(PropProvider, { ...propContext, value, setValue }, /* @__PURE__ */ React99.createElement(ControlActions, null, /* @__PURE__ */ React99.createElement(import_ui85.LocalizationProvider, null, /* @__PURE__ */ React99.createElement(import_ui85.Box, { display: "flex", gap: 1, alignItems: "center" }, /* @__PURE__ */ React99.createElement(PropKeyProvider, { bind: "date" }, /* @__PURE__ */ React99.createElement(
    import_ui85.DatePicker,
    {
      value: parseDateValue(import_editor_props51.stringPropTypeUtil.extract(value?.date)),
      onChange: (v) => handleChange({ date: v }, { bind: "date" }),
      disabled: inputDisabled,
      slotProps: {
        textField: { size: "tiny" },
        openPickerButton: { size: "tiny" },
        openPickerIcon: { fontSize: "tiny" }
      }
    }
  )), /* @__PURE__ */ React99.createElement(PropKeyProvider, { bind: "time" }, /* @__PURE__ */ React99.createElement(
    import_ui85.TimePicker,
    {
      value: parseTimeValue(import_editor_props51.stringPropTypeUtil.extract(value?.time)),
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
var React101 = __toESM(require("react"));
var import_react53 = require("react");
var import_editor_props53 = require("@elementor/editor-props");
var import_ui87 = require("@elementor/ui");
var import_utils7 = require("@elementor/utils");

// src/components/inline-editor.tsx
var React100 = __toESM(require("react"));
var import_react51 = require("react");
var import_ui86 = require("@elementor/ui");
var import_extension_bold = __toESM(require("@tiptap/extension-bold"));
var import_extension_document = __toESM(require("@tiptap/extension-document"));
var import_extension_hard_break = __toESM(require("@tiptap/extension-hard-break"));
var import_extension_heading = __toESM(require("@tiptap/extension-heading"));
var import_extension_italic = __toESM(require("@tiptap/extension-italic"));
var import_extension_link = __toESM(require("@tiptap/extension-link"));
var import_extension_paragraph = __toESM(require("@tiptap/extension-paragraph"));
var import_extension_strike = __toESM(require("@tiptap/extension-strike"));
var import_extension_subscript = __toESM(require("@tiptap/extension-subscript"));
var import_extension_superscript = __toESM(require("@tiptap/extension-superscript"));
var import_extension_text = __toESM(require("@tiptap/extension-text"));
var import_extension_underline = __toESM(require("@tiptap/extension-underline"));
var import_react52 = require("@tiptap/react");

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
  const containerRef = (0, import_react51.useRef)(null);
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
  const editor = (0, import_react52.useEditor)({
    extensions: [
      import_extension_document.default.extend({
        content: documentContentSettings
      }),
      import_extension_paragraph.default.extend({
        renderHTML({ HTMLAttributes }) {
          const tag = expectedTag ?? "p";
          return [tag, editedElementAttributes(HTMLAttributes), 0];
        }
      }),
      import_extension_heading.default.extend({
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
      import_extension_link.default.configure({
        openOnClick: false
      }),
      import_extension_text.default,
      import_extension_bold.default,
      import_extension_italic.default,
      import_extension_strike.default,
      import_extension_superscript.default,
      import_extension_subscript.default,
      import_extension_underline.default,
      import_extension_hard_break.default.extend({
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
    /* @__PURE__ */ React100.createElement(import_react52.EditorContent, { ref, editor })
  ));
});
var Wrapper = ({ children, containerRef, editor, sx, onBlur, className }) => {
  const wrappedChildren = /* @__PURE__ */ React100.createElement(import_ui86.Box, { ref: containerRef, ...sx, className }, children);
  return onBlur ? /* @__PURE__ */ React100.createElement(
    import_ui86.ClickAwayListener,
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
  const hasMounted = (0, import_react51.useRef)(false);
  (0, import_react51.useEffect)(() => {
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
    const { value, setValue } = useBoundProp(import_editor_props53.htmlV3PropTypeUtil);
    const content = import_editor_props53.stringPropTypeUtil.extract(value?.content ?? null) ?? "";
    const debouncedParse = (0, import_react53.useMemo)(
      () => (0, import_utils7.debounce)((html) => {
        const parsed = (0, import_editor_props53.parseHtmlChildren)(html);
        setValue({
          content: parsed.content ? import_editor_props53.stringPropTypeUtil.create(parsed.content) : null,
          children: parsed.children
        });
      }, CHILDREN_PARSE_DEBOUNCE_MS),
      [setValue]
    );
    const handleChange = (0, import_react53.useCallback)(
      (newValue) => {
        const html = newValue ?? "";
        setValue({
          content: html ? import_editor_props53.stringPropTypeUtil.create(html) : null,
          children: value?.children ?? []
        });
        debouncedParse(html);
      },
      [setValue, value?.children, debouncedParse]
    );
    (0, import_react53.useEffect)(() => () => debouncedParse.cancel(), [debouncedParse]);
    return /* @__PURE__ */ React101.createElement(ControlActions, null, /* @__PURE__ */ React101.createElement(
      import_ui87.Box,
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
var React102 = __toESM(require("react"));
var import_editor_props54 = require("@elementor/editor-props");
var import_editor_ui13 = require("@elementor/editor-ui");
var import_ui88 = require("@elementor/ui");
var import_i18n51 = require("@wordpress/i18n");
var EmailField = ({ bind, label, placeholder }) => /* @__PURE__ */ React102.createElement(PropKeyProvider, { bind }, /* @__PURE__ */ React102.createElement(import_ui88.Grid, { container: true, direction: "column", gap: 0.5 }, /* @__PURE__ */ React102.createElement(import_ui88.Grid, { item: true }, /* @__PURE__ */ React102.createElement(ControlFormLabel, null, label)), /* @__PURE__ */ React102.createElement(import_ui88.Grid, { item: true }, /* @__PURE__ */ React102.createElement(TextControl, { placeholder }))));
var SendToField = () => /* @__PURE__ */ React102.createElement(
  EmailField,
  {
    bind: "to",
    label: (0, import_i18n51.__)("Send To", "elementor"),
    placeholder: (0, import_i18n51.__)("Where should we send new submissions?", "elementor")
  }
);
var SubjectField = () => /* @__PURE__ */ React102.createElement(
  EmailField,
  {
    bind: "subject",
    label: (0, import_i18n51.__)("Email Subject", "elementor"),
    placeholder: (0, import_i18n51.__)("New form submission", "elementor")
  }
);
var MessageField = () => /* @__PURE__ */ React102.createElement(PropKeyProvider, { bind: "message" }, /* @__PURE__ */ React102.createElement(import_ui88.Grid, { container: true, direction: "column", gap: 0.5 }, /* @__PURE__ */ React102.createElement(import_ui88.Grid, { item: true }, /* @__PURE__ */ React102.createElement(ControlFormLabel, null, (0, import_i18n51.__)("Message", "elementor"))), /* @__PURE__ */ React102.createElement(import_ui88.Grid, { item: true }, /* @__PURE__ */ React102.createElement(
  TextAreaControl,
  {
    placeholder: (0, import_i18n51.__)(
      "By default, all form fields are sent via [all-fields] shortcode.",
      "elementor"
    )
  }
))));
var FromEmailField = () => /* @__PURE__ */ React102.createElement(
  EmailField,
  {
    bind: "from",
    label: (0, import_i18n51.__)("From email", "elementor"),
    placeholder: (0, import_i18n51.__)("What email address should appear as the sender?", "elementor")
  }
);
var FromNameField = () => /* @__PURE__ */ React102.createElement(
  EmailField,
  {
    bind: "from-name",
    label: (0, import_i18n51.__)("From name", "elementor"),
    placeholder: (0, import_i18n51.__)("What name should appear as the sender?", "elementor")
  }
);
var ReplyToField = () => /* @__PURE__ */ React102.createElement(EmailField, { bind: "reply-to", label: (0, import_i18n51.__)("Reply-to", "elementor") });
var CcField = () => /* @__PURE__ */ React102.createElement(EmailField, { bind: "cc", label: (0, import_i18n51.__)("Cc", "elementor") });
var BccField = () => /* @__PURE__ */ React102.createElement(EmailField, { bind: "bcc", label: (0, import_i18n51.__)("Bcc", "elementor") });
var MetaDataField = () => /* @__PURE__ */ React102.createElement(PropKeyProvider, { bind: "meta-data" }, /* @__PURE__ */ React102.createElement(import_ui88.Stack, { gap: 0.5 }, /* @__PURE__ */ React102.createElement(ControlLabel, null, (0, import_i18n51.__)("Meta data", "elementor")), /* @__PURE__ */ React102.createElement(
  ChipsControl,
  {
    options: [
      { label: (0, import_i18n51.__)("Date", "elementor"), value: "date" },
      { label: (0, import_i18n51.__)("Time", "elementor"), value: "time" },
      { label: (0, import_i18n51.__)("Page URL", "elementor"), value: "page-url" },
      { label: (0, import_i18n51.__)("User agent", "elementor"), value: "user-agent" },
      { label: (0, import_i18n51.__)("Credit", "elementor"), value: "credit" }
    ]
  }
)));
var SendAsField = () => /* @__PURE__ */ React102.createElement(PropKeyProvider, { bind: "send-as" }, /* @__PURE__ */ React102.createElement(import_ui88.Grid, { container: true, direction: "column", gap: 0.5 }, /* @__PURE__ */ React102.createElement(import_ui88.Grid, { item: true }, /* @__PURE__ */ React102.createElement(ControlFormLabel, null, (0, import_i18n51.__)("Send as", "elementor"))), /* @__PURE__ */ React102.createElement(import_ui88.Grid, { item: true }, /* @__PURE__ */ React102.createElement(
  SelectControl,
  {
    options: [
      { label: (0, import_i18n51.__)("HTML", "elementor"), value: "html" },
      { label: (0, import_i18n51.__)("Plain Text", "elementor"), value: "plain" }
    ]
  }
))));
var AdvancedSettings = () => /* @__PURE__ */ React102.createElement(import_editor_ui13.CollapsibleContent, { defaultOpen: false }, /* @__PURE__ */ React102.createElement(import_ui88.Box, { sx: { pt: 2 } }, /* @__PURE__ */ React102.createElement(import_ui88.Stack, { gap: 2 }, /* @__PURE__ */ React102.createElement(FromNameField, null), /* @__PURE__ */ React102.createElement(ReplyToField, null), /* @__PURE__ */ React102.createElement(CcField, null), /* @__PURE__ */ React102.createElement(BccField, null), /* @__PURE__ */ React102.createElement(import_ui88.Divider, null), /* @__PURE__ */ React102.createElement(MetaDataField, null), /* @__PURE__ */ React102.createElement(SendAsField, null))));
var EmailFormActionControl = createControl(() => {
  const { value, setValue, ...propContext } = useBoundProp(import_editor_props54.emailPropTypeUtil);
  return /* @__PURE__ */ React102.createElement(PropProvider, { ...propContext, value, setValue }, /* @__PURE__ */ React102.createElement(import_ui88.Stack, { gap: 2 }, /* @__PURE__ */ React102.createElement(ControlFormLabel, null, (0, import_i18n51.__)("Email settings", "elementor")), /* @__PURE__ */ React102.createElement(SendToField, null), /* @__PURE__ */ React102.createElement(SubjectField, null), /* @__PURE__ */ React102.createElement(MessageField, null), /* @__PURE__ */ React102.createElement(FromEmailField, null), /* @__PURE__ */ React102.createElement(AdvancedSettings, null)));
});

// src/components/promotions/display-conditions-control.tsx
var React104 = __toESM(require("react"));
var import_react55 = require("react");
var import_icons34 = require("@elementor/icons");
var import_ui90 = require("@elementor/ui");
var import_i18n52 = require("@wordpress/i18n");

// src/components/promotions/promotion-trigger.tsx
var React103 = __toESM(require("react"));
var import_react54 = require("react");
var import_editor_ui14 = require("@elementor/editor-ui");
var import_ui89 = require("@elementor/ui");
function getV4Promotion(key) {
  return window.elementor?.config?.v4Promotions?.[key];
}
var PromotionTrigger = (0, import_react54.forwardRef)(
  ({ promotionKey, children }, ref) => {
    const [isOpen, setIsOpen] = (0, import_react54.useState)(false);
    const promotion = getV4Promotion(promotionKey);
    const toggle = () => setIsOpen((prev) => !prev);
    (0, import_react54.useImperativeHandle)(ref, () => ({ toggle }), []);
    return /* @__PURE__ */ React103.createElement(React103.Fragment, null, promotion && /* @__PURE__ */ React103.createElement(
      import_editor_ui14.PromotionInfotip,
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
        import_ui89.Box,
        {
          onClick: (e) => {
            e.stopPropagation();
            toggle();
          },
          sx: { cursor: "pointer", display: "inline-flex" }
        },
        children ?? /* @__PURE__ */ React103.createElement(import_editor_ui14.PromotionChip, null)
      )
    ));
  }
);

// src/components/promotions/display-conditions-control.tsx
var ARIA_LABEL = (0, import_i18n52.__)("Display Conditions", "elementor");
var DisplayConditionsControl = createControl(() => {
  const triggerRef = (0, import_react55.useRef)(null);
  return /* @__PURE__ */ React104.createElement(
    import_ui90.Stack,
    {
      direction: "row",
      spacing: 2,
      sx: {
        justifyContent: "flex-end",
        alignItems: "center"
      }
    },
    /* @__PURE__ */ React104.createElement(PromotionTrigger, { ref: triggerRef, promotionKey: "displayConditions" }),
    /* @__PURE__ */ React104.createElement(import_ui90.Tooltip, { title: ARIA_LABEL, placement: "top" }, /* @__PURE__ */ React104.createElement(
      import_ui90.IconButton,
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
      /* @__PURE__ */ React104.createElement(import_icons34.SitemapIcon, { fontSize: "tiny", color: "disabled" })
    ))
  );
});

// src/components/promotions/attributes-control.tsx
var React105 = __toESM(require("react"));
var import_react56 = require("react");
var import_icons35 = require("@elementor/icons");
var import_ui91 = require("@elementor/ui");
var import_i18n53 = require("@wordpress/i18n");
var ARIA_LABEL2 = (0, import_i18n53.__)("Attributes", "elementor");
var AttributesControl = createControl(() => {
  const triggerRef = (0, import_react56.useRef)(null);
  return /* @__PURE__ */ React105.createElement(
    import_ui91.Stack,
    {
      direction: "row",
      spacing: 2,
      sx: {
        justifyContent: "flex-end",
        alignItems: "center"
      }
    },
    /* @__PURE__ */ React105.createElement(PromotionTrigger, { ref: triggerRef, promotionKey: "attributes" }),
    /* @__PURE__ */ React105.createElement(import_ui91.Tooltip, { title: ARIA_LABEL2, placement: "top" }, /* @__PURE__ */ React105.createElement(
      import_icons35.PlusIcon,
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
var React106 = __toESM(require("react"));
var import_icons36 = require("@elementor/icons");
var import_ui92 = require("@elementor/ui");
var CustomIconButton = (0, import_ui92.styled)(import_ui92.IconButton)(({ theme }) => ({
  width: theme.spacing(2.5),
  height: theme.spacing(2.5)
}));
var ClearIconButton = ({ tooltipText, onClick, disabled, size = "tiny" }) => /* @__PURE__ */ React106.createElement(import_ui92.Tooltip, { title: tooltipText, placement: "top", disableInteractive: true }, /* @__PURE__ */ React106.createElement(CustomIconButton, { "aria-label": tooltipText, size, onClick, disabled }, /* @__PURE__ */ React106.createElement(import_icons36.BrushBigIcon, { fontSize: size })));

// src/components/repeater/repeater.tsx
var React107 = __toESM(require("react"));
var import_react57 = require("react");
var import_icons37 = require("@elementor/icons");
var import_ui93 = require("@elementor/ui");
var import_i18n54 = require("@wordpress/i18n");
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
  const [openItem, setOpenItem] = (0, import_react57.useState)(initialOpenItem);
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
    import_ui93.IconButton,
    {
      size: SIZE10,
      sx: {
        ml: "auto"
      },
      disabled: isButtonDisabled,
      onClick: addRepeaterItem,
      "aria-label": (0, import_i18n54.__)("Add item", "elementor")
    },
    /* @__PURE__ */ React107.createElement(import_icons37.PlusIcon, { fontSize: SIZE10 })
  );
  return /* @__PURE__ */ React107.createElement(SectionContent, { gap: 2 }, /* @__PURE__ */ React107.createElement(RepeaterHeader, { label, adornment: ControlAdornments }, shouldShowInfotip ? /* @__PURE__ */ React107.createElement(
    import_ui93.Infotip,
    {
      placement: "right",
      content: addButtonInfotipContent,
      color: "secondary",
      slotProps: { popper: { sx: { width: 300 } } }
    },
    /* @__PURE__ */ React107.createElement(import_ui93.Box, { sx: { ...isButtonDisabled ? { cursor: "not-allowed" } : {} } }, addButton)
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
  const duplicateLabel = (0, import_i18n54.__)("Duplicate", "elementor");
  const toggleLabel = propDisabled ? (0, import_i18n54.__)("Show", "elementor") : (0, import_i18n54.__)("Hide", "elementor");
  const removeLabel = (0, import_i18n54.__)("Remove", "elementor");
  return /* @__PURE__ */ React107.createElement(React107.Fragment, null, /* @__PURE__ */ React107.createElement(
    RepeaterTag,
    {
      disabled,
      label,
      ref: setRef,
      "aria-label": (0, import_i18n54.__)("Open item", "elementor"),
      ...(0, import_ui93.bindTrigger)(popoverState),
      startIcon,
      actions: /* @__PURE__ */ React107.createElement(React107.Fragment, null, showDuplicate && /* @__PURE__ */ React107.createElement(import_ui93.Tooltip, { title: duplicateLabel, placement: "top" }, /* @__PURE__ */ React107.createElement(import_ui93.IconButton, { size: SIZE10, onClick: duplicateItem, "aria-label": duplicateLabel }, /* @__PURE__ */ React107.createElement(import_icons37.CopyIcon, { fontSize: SIZE10 }))), showToggle && /* @__PURE__ */ React107.createElement(import_ui93.Tooltip, { title: toggleLabel, placement: "top" }, /* @__PURE__ */ React107.createElement(import_ui93.IconButton, { size: SIZE10, onClick: toggleDisableItem, "aria-label": toggleLabel }, propDisabled ? /* @__PURE__ */ React107.createElement(import_icons37.EyeOffIcon, { fontSize: SIZE10 }) : /* @__PURE__ */ React107.createElement(import_icons37.EyeIcon, { fontSize: SIZE10 }))), actions?.(value), showRemove && /* @__PURE__ */ React107.createElement(import_ui93.Tooltip, { title: removeLabel, placement: "top" }, /* @__PURE__ */ React107.createElement(import_ui93.IconButton, { size: SIZE10, onClick: removeItem, "aria-label": removeLabel }, /* @__PURE__ */ React107.createElement(import_icons37.XIcon, { fontSize: SIZE10 }))))
    }
  ), /* @__PURE__ */ React107.createElement(RepeaterPopover, { width: ref?.getBoundingClientRect().width, ...popoverProps, anchorEl: ref }, /* @__PURE__ */ React107.createElement(import_ui93.Box, null, children({ anchorEl: ref }))));
};
var usePopover = (openOnMount, onOpen) => {
  const [ref, setRef] = (0, import_react57.useState)(null);
  const popoverState = (0, import_ui93.usePopupState)({ variant: "popover" });
  const popoverProps = (0, import_ui93.bindPopover)(popoverState);
  (0, import_react57.useEffect)(() => {
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
var React109 = __toESM(require("react"));
var import_react59 = require("react");
var import_editor_elements5 = require("@elementor/editor-elements");
var import_icons39 = require("@elementor/icons");
var import_ui95 = require("@elementor/ui");
var import_react60 = require("@tiptap/react");
var import_i18n56 = require("@wordpress/i18n");

// src/components/url-popover.tsx
var React108 = __toESM(require("react"));
var import_react58 = require("react");
var import_icons38 = require("@elementor/icons");
var import_ui94 = require("@elementor/ui");
var import_i18n55 = require("@wordpress/i18n");
var UrlPopover = ({
  popupState,
  restoreValue,
  anchorRef,
  value,
  onChange,
  openInNewTab,
  onToggleNewTab
}) => {
  const inputRef = (0, import_react58.useRef)(null);
  (0, import_react58.useEffect)(() => {
    if (popupState.isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [popupState.isOpen]);
  const handleClose = () => {
    restoreValue();
    popupState.close();
  };
  return /* @__PURE__ */ React108.createElement(
    import_ui94.Popover,
    {
      slotProps: {
        paper: { sx: { borderRadius: "16px", width: anchorRef.current?.offsetWidth + "px", marginTop: -1 } }
      },
      ...(0, import_ui94.bindPopover)(popupState),
      anchorOrigin: { vertical: "top", horizontal: "left" },
      transformOrigin: { vertical: "top", horizontal: "left" },
      onClose: handleClose
    },
    /* @__PURE__ */ React108.createElement(import_ui94.Stack, { direction: "row", alignItems: "center", gap: 1, sx: { p: 1.5 } }, /* @__PURE__ */ React108.createElement(
      import_ui94.TextField,
      {
        value,
        onChange,
        size: "tiny",
        fullWidth: true,
        placeholder: (0, import_i18n55.__)("Type a URL", "elementor"),
        inputProps: { ref: inputRef },
        color: "secondary",
        InputProps: { sx: { borderRadius: "8px" } },
        onKeyUp: (event) => event.key === "Enter" && handleClose()
      }
    ), /* @__PURE__ */ React108.createElement(import_ui94.Tooltip, { title: (0, import_i18n55.__)("Open in a new tab", "elementor") }, /* @__PURE__ */ React108.createElement(
      import_ui94.ToggleButton,
      {
        size: "tiny",
        value: "newTab",
        selected: openInNewTab,
        onClick: onToggleNewTab,
        "aria-label": (0, import_i18n55.__)("Open in a new tab", "elementor"),
        sx: { borderRadius: "8px" }
      },
      /* @__PURE__ */ React108.createElement(import_icons38.ExternalLinkIcon, { fontSize: "tiny" })
    )))
  );
};

// src/components/inline-editor-toolbar.tsx
var InlineEditorToolbar = ({ editor, elementId, sx = {} }) => {
  const [urlValue, setUrlValue] = (0, import_react59.useState)("");
  const [openInNewTab, setOpenInNewTab] = (0, import_react59.useState)(false);
  const toolbarRef = (0, import_react59.useRef)(null);
  const linkPopupState = (0, import_ui95.usePopupState)({ variant: "popover" });
  const isElementClickable = elementId ? checkIfElementIsClickable(elementId) : false;
  const editorState = (0, import_react60.useEditorState)({
    editor,
    selector: (ctx) => possibleFormats.filter((format) => ctx.editor.isActive(format))
  });
  const formatButtonsList = (0, import_react59.useMemo)(() => {
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
    import_ui95.Box,
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
    /* @__PURE__ */ React109.createElement(import_ui95.Tooltip, { title: clearButton.label, placement: "top", sx: { borderRadius: "8px" } }, /* @__PURE__ */ React109.createElement(import_ui95.IconButton, { "aria-label": clearButton.label, onClick: () => clearButton.method(editor), size: "tiny" }, clearButton.icon)),
    /* @__PURE__ */ React109.createElement(
      import_ui95.ToggleButtonGroup,
      {
        value: editorState,
        size: "tiny",
        sx: {
          display: "flex",
          gap: 0.5,
          border: "none",
          [`& .${import_ui95.toggleButtonGroupClasses.firstButton}, & .${import_ui95.toggleButtonGroupClasses.middleButton}, & .${import_ui95.toggleButtonGroupClasses.lastButton}`]: {
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
      formatButtonsList.map((button) => /* @__PURE__ */ React109.createElement(import_ui95.Tooltip, { title: button.label, key: button.action, placement: "top" }, /* @__PURE__ */ React109.createElement(
        import_ui95.ToggleButton,
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
  const container = (0, import_editor_elements5.getContainer)(elementId);
  const type = container?.model.get("widgetType");
  const isButton = type === "e-button";
  const hasLink = !!(0, import_editor_elements5.getElementSetting)(elementId, "link")?.value?.destination;
  return isButton || hasLink;
};
var toolbarButtons = {
  clear: {
    label: (0, import_i18n56.__)("Clear", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(import_icons39.MinusIcon, { fontSize: "tiny" }),
    action: "clear",
    method: (editor) => {
      editor.chain().focus().clearNodes().unsetAllMarks().run();
    }
  },
  bold: {
    label: (0, import_i18n56.__)("Bold", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(import_icons39.BoldIcon, { fontSize: "tiny" }),
    action: "bold",
    method: (editor) => {
      editor.chain().focus().toggleBold().run();
    }
  },
  italic: {
    label: (0, import_i18n56.__)("Italic", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(import_icons39.ItalicIcon, { fontSize: "tiny" }),
    action: "italic",
    method: (editor) => {
      editor.chain().focus().toggleItalic().run();
    }
  },
  underline: {
    label: (0, import_i18n56.__)("Underline", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(import_icons39.UnderlineIcon, { fontSize: "tiny" }),
    action: "underline",
    method: (editor) => {
      editor.chain().focus().toggleUnderline().run();
    }
  },
  strike: {
    label: (0, import_i18n56.__)("Strikethrough", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(import_icons39.StrikethroughIcon, { fontSize: "tiny" }),
    action: "strike",
    method: (editor) => {
      editor.chain().focus().toggleStrike().run();
    }
  },
  superscript: {
    label: (0, import_i18n56.__)("Superscript", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(import_icons39.SuperscriptIcon, { fontSize: "tiny" }),
    action: "superscript",
    method: (editor) => {
      editor.chain().focus().toggleSuperscript().run();
    }
  },
  subscript: {
    label: (0, import_i18n56.__)("Subscript", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(import_icons39.SubscriptIcon, { fontSize: "tiny" }),
    action: "subscript",
    method: (editor) => {
      editor.chain().focus().toggleSubscript().run();
    }
  },
  link: {
    label: (0, import_i18n56.__)("Link", "elementor"),
    icon: /* @__PURE__ */ React109.createElement(import_icons39.LinkIcon, { fontSize: "tiny" }),
    action: "link",
    method: null
  }
};
var { clear: clearButton, ...formatButtons } = toolbarButtons;
var possibleFormats = Object.keys(formatButtons);

// src/components/size/unstable-size-field.tsx
var React112 = __toESM(require("react"));
var import_ui97 = require("@elementor/ui");

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
var React110 = __toESM(require("react"));
var import_react61 = require("react");
var import_editor_ui15 = require("@elementor/editor-ui");
var import_ui96 = require("@elementor/ui");
var menuItemContentStyles = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};
var UnitSelect = ({ value, showPrimaryColor, onClick, options }) => {
  const popupState = (0, import_ui96.usePopupState)({
    variant: "popover",
    popupId: (0, import_react61.useId)()
  });
  const handleMenuItemClick = (index) => {
    onClick(options[index]);
    popupState.close();
  };
  return /* @__PURE__ */ React110.createElement(React110.Fragment, null, /* @__PURE__ */ React110.createElement(StyledButton2, { isPrimaryColor: showPrimaryColor, size: "small", ...(0, import_ui96.bindTrigger)(popupState) }, value), /* @__PURE__ */ React110.createElement(import_ui96.Menu, { MenuListProps: { dense: true }, ...(0, import_ui96.bindMenu)(popupState) }, options.map((option, index) => /* @__PURE__ */ React110.createElement(
    import_editor_ui15.MenuListItem,
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
var StyledButton2 = (0, import_ui96.styled)(import_ui96.Button, {
  shouldForwardProp: (prop) => prop !== "isPrimaryColor"
})(({ isPrimaryColor, theme }) => ({
  color: isPrimaryColor ? theme.palette.text.primary : theme.palette.text.tertiary,
  font: "inherit",
  minWidth: "initial",
  textTransform: "uppercase"
}));

// src/components/size/unstable-size-input.tsx
var React111 = __toESM(require("react"));
var import_react62 = require("react");
var UnstableSizeInput = (0, import_react62.forwardRef)(
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
        startAdornment: startIcon && /* @__PURE__ */ React112.createElement(import_ui97.InputAdornment, { position: "start" }, startIcon),
        endAdornment: /* @__PURE__ */ React112.createElement(import_ui97.InputAdornment, { position: "end" }, /* @__PURE__ */ React112.createElement(
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
var import_react63 = require("react");
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var import_i18n57 = require("@wordpress/i18n");
var supportedCategories = {
  system: (0, import_i18n57.__)("System", "elementor"),
  custom: (0, import_i18n57.__)("Custom Fonts", "elementor"),
  googlefonts: (0, import_i18n57.__)("Google Fonts", "elementor")
};
var getFontFamilies = () => {
  const { controls } = (0, import_editor_v1_adapters.getElementorConfig)();
  const options = controls?.font?.options;
  if (!options) {
    return null;
  }
  return options;
};
var useFontFamilies = () => {
  const fontFamilies = getFontFamilies();
  return (0, import_react63.useMemo)(() => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
  Repeater,
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
});
//# sourceMappingURL=index.js.map