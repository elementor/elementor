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
  BaseControl: () => Control,
  CustomCssIndicator: () => CustomCssIndicator,
  ElementProvider: () => ElementProvider,
  FIELD_TYPE: () => FIELD_TYPE,
  HISTORY_DEBOUNCE_WAIT: () => HISTORY_DEBOUNCE_WAIT,
  SectionContent: () => SectionContent,
  SettingsControl: () => SettingsControl,
  SettingsField: () => SettingsField,
  StyleIndicator: () => StyleIndicator,
  StyleTabSection: () => StyleTabSection,
  StylesProviderCannotUpdatePropsError: () => StylesProviderCannotUpdatePropsError,
  controlsRegistry: () => controlsRegistry,
  createTopLevelObjectType: () => createTopLevelObjectType,
  doApplyClasses: () => doApplyClasses,
  doGetAppliedClasses: () => doGetAppliedClasses,
  doUnapplyClass: () => doUnapplyClass,
  getFieldIndicators: () => getFieldIndicators,
  getSubtitle: () => getSubtitle,
  getTitle: () => getTitle,
  init: () => init4,
  injectIntoClassSelectorActions: () => injectIntoClassSelectorActions,
  injectIntoCssClassConvert: () => injectIntoCssClassConvert,
  injectIntoPanelHeaderTop: () => injectIntoPanelHeaderTop,
  injectIntoStyleTab: () => injectIntoStyleTab,
  isDynamicPropValue: () => isDynamicPropValue,
  registerEditingPanelReplacement: () => registerEditingPanelReplacement,
  registerFieldIndicator: () => registerFieldIndicator,
  registerStyleProviderToColors: () => registerStyleProviderToColors,
  setLicenseConfig: () => setLicenseConfig,
  useClassesProp: () => useClassesProp,
  useCustomCss: () => useCustomCss,
  useElement: () => useElement,
  usePanelActions: () => usePanelActions,
  usePanelStatus: () => usePanelStatus,
  useStateByElement: () => useStateByElement,
  useStyle: () => useStyle,
  useStylesRerender: () => useStylesRerender
});
module.exports = __toCommonJS(index_exports);

// src/components/css-classes/css-class-convert-local.tsx
var React4 = __toESM(require("react"));
var import_editor_elements = require("@elementor/editor-elements");
var import_editor_props = require("@elementor/editor-props");
var import_locations = require("@elementor/locations");
var import_session = require("@elementor/session");

// src/contexts/classes-prop-context.tsx
var React = __toESM(require("react"));
var import_react = require("react");
var Context = (0, import_react.createContext)(null);
function ClassesPropProvider({ children, prop }) {
  return /* @__PURE__ */ React.createElement(Context.Provider, { value: { prop } }, children);
}
function useClassesProp() {
  const context = (0, import_react.useContext)(Context);
  if (!context) {
    throw new Error("useClassesProp must be used within a ClassesPropProvider");
  }
  return context.prop;
}

// src/contexts/element-context.tsx
var React2 = __toESM(require("react"));
var import_react2 = require("react");
var Context2 = (0, import_react2.createContext)(null);
function ElementProvider({ children, element, elementType, settings }) {
  return /* @__PURE__ */ React2.createElement(Context2.Provider, { value: { element, elementType, settings } }, children);
}
function useElement() {
  const context = (0, import_react2.useContext)(Context2);
  if (!context) {
    throw new Error("useElement must be used within a ElementProvider");
  }
  return context;
}
function usePanelElementSetting(propKey) {
  const context = (0, import_react2.useContext)(Context2);
  if (!context) {
    throw new Error("usePanelElementSetting must be used within a ElementProvider");
  }
  return context.settings[propKey] ?? null;
}

// src/contexts/style-context.tsx
var React3 = __toESM(require("react"));
var import_react3 = require("react");
var import_editor_styles_repository = require("@elementor/editor-styles-repository");

// src/errors.ts
var import_utils = require("@elementor/utils");
var ControlTypeNotFoundError = (0, import_utils.createError)({
  code: "control_type_not_found",
  message: "Control type not found."
});
var ControlTypeAlreadyRegisteredError = (0, import_utils.createError)({
  code: "control_type_already_registered",
  message: "Control type is already registered."
});
var ControlTypeNotRegisteredError = (0, import_utils.createError)({
  code: "control_type_not_registered",
  message: "Control type is not registered."
});
var StylesProviderNotFoundError = (0, import_utils.createError)({
  code: "provider_not_found",
  message: "Styles provider not found."
});
var StylesProviderCannotUpdatePropsError = (0, import_utils.createError)({
  code: "provider_cannot_update_props",
  message: "Styles provider doesn't support updating props."
});
var StyleNotFoundUnderProviderError = (0, import_utils.createError)({
  code: "style_not_found_under_provider",
  message: "Style not found under the provider."
});

// src/contexts/style-context.tsx
var Context3 = (0, import_react3.createContext)(null);
function StyleProvider({ children, ...props }) {
  const provider = props.id === null ? null : getProviderByStyleId(props.id);
  const { userCan } = (0, import_editor_styles_repository.useUserStylesCapability)();
  if (props.id && !provider) {
    throw new StylesProviderNotFoundError({ context: { styleId: props.id } });
  }
  const canEdit = userCan(provider?.getKey() ?? "").updateProps;
  return /* @__PURE__ */ React3.createElement(Context3.Provider, { value: { ...props, provider, canEdit } }, children);
}
function useStyle() {
  const context = (0, import_react3.useContext)(Context3);
  if (!context) {
    throw new Error("useStyle must be used within a StyleProvider");
  }
  return context;
}
function getProviderByStyleId(styleId) {
  const styleProvider = import_editor_styles_repository.stylesRepository.getProviders().find((provider) => {
    return provider.actions.all().find((style) => style.id === styleId);
  });
  return styleProvider ?? null;
}
function useIsStyle() {
  return !!(0, import_react3.useContext)(Context3);
}

// src/components/css-classes/css-class-convert-local.tsx
var { Slot: CssClassConvertSlot, inject: injectIntoCssClassConvert } = (0, import_locations.createLocation)();
var CssClassConvert = (props) => {
  const { element } = useElement();
  const elementId = element.id;
  const currentClassesProp = useClassesProp();
  const { setId: setActiveId } = useStyle();
  const [, saveValue] = (0, import_session.useSessionStorage)("last-converted-class-generated-name", "app");
  const successCallback = (newId) => {
    if (!props.styleDef) {
      throw new Error("Style definition is required for converting local class to global class.");
    }
    onConvert({
      newId,
      elementId,
      classesProp: currentClassesProp,
      styleDef: props.styleDef
    });
    saveValue(newId);
    setActiveId(newId);
    props.closeMenu();
  };
  return /* @__PURE__ */ React4.createElement(
    CssClassConvertSlot,
    {
      canConvert: !!props.canConvert,
      styleDef: props.styleDef,
      successCallback
    }
  );
};
var onConvert = (opts) => {
  const { newId, elementId, classesProp } = opts;
  (0, import_editor_elements.deleteElementStyle)(elementId, opts.styleDef.id);
  const currentUsedClasses = (0, import_editor_elements.getElementSetting)(elementId, classesProp) || { value: [] };
  (0, import_editor_elements.updateElementSettings)({
    id: elementId,
    props: { [classesProp]: import_editor_props.classesPropTypeUtil.create([newId, ...currentUsedClasses.value]) },
    withHistory: false
  });
};

// src/components/css-classes/css-class-selector.tsx
var React10 = __toESM(require("react"));
var import_react10 = require("react");
var import_editor_styles_repository8 = require("@elementor/editor-styles-repository");
var import_editor_ui3 = require("@elementor/editor-ui");
var import_icons2 = require("@elementor/icons");
var import_locations2 = require("@elementor/locations");
var import_ui7 = require("@elementor/ui");
var import_i18n5 = require("@wordpress/i18n");

// src/utils/get-styles-provider-color.ts
var import_editor_styles_repository2 = require("@elementor/editor-styles-repository");

// src/provider-colors-registry.ts
var DEFAULT_COLORS = {
  name: "default",
  getThemeColor: null
};
var providerColorsRegistry = /* @__PURE__ */ new Map();
var registerStyleProviderToColors = (provider, colors) => {
  providerColorsRegistry.set(provider, colors);
};
var getStyleProviderColors = (provider) => providerColorsRegistry.get(provider) ?? DEFAULT_COLORS;

// src/utils/get-styles-provider-color.ts
var getStylesProviderColorName = (provider) => {
  if (!provider || provider === import_editor_styles_repository2.ELEMENTS_BASE_STYLES_PROVIDER_KEY) {
    return "default";
  }
  if ((0, import_editor_styles_repository2.isElementsStylesProvider)(provider)) {
    return "accent";
  }
  return getStyleProviderColors(provider).name;
};
var getStylesProviderThemeColor = (provider) => {
  if (!provider || provider === import_editor_styles_repository2.ELEMENTS_BASE_STYLES_PROVIDER_KEY) {
    return null;
  }
  if ((0, import_editor_styles_repository2.isElementsStylesProvider)(provider)) {
    return (theme) => theme.palette.accent.main;
  }
  return getStyleProviderColors(provider).getThemeColor;
};
function getTempStylesProviderThemeColor(provider) {
  if ((0, import_editor_styles_repository2.isElementsStylesProvider)(provider)) {
    return (theme) => theme.palette.primary.main;
  }
  return getStylesProviderThemeColor(provider);
}

// src/utils/tracking/subscribe.ts
var import_editor_styles_repository3 = require("@elementor/editor-styles-repository");
var trackStyles = (provider, event, data) => {
  const providerInstance = import_editor_styles_repository3.stylesRepository.getProviderByKey(provider);
  providerInstance?.actions.tracking?.({ event, ...data });
};

// src/components/creatable-autocomplete/creatable-autocomplete.tsx
var React5 = __toESM(require("react"));
var import_react6 = require("react");
var import_ui2 = require("@elementor/ui");

// src/components/creatable-autocomplete/autocomplete-option-internal-properties.ts
function addGroupToOptions(options12, pluralEntityName) {
  return options12.map((option) => {
    return {
      ...option,
      _group: `Existing ${pluralEntityName ?? "options"}`
    };
  });
}
function removeInternalKeys(option) {
  const { _group, _action, ...rest } = option;
  return rest;
}

// src/components/creatable-autocomplete/use-autocomplete-change.ts
function useAutocompleteChange(params) {
  const { options: options12, onSelect, createOption, setInputValue, closeDropdown } = params;
  if (!onSelect && !createOption) {
    return;
  }
  const handleChange = async (_, selectedOrInputValue, reason, details) => {
    const changedOption = details?.option;
    if (!changedOption || typeof changedOption === "object" && changedOption.fixed) {
      return;
    }
    const selectedOptions = selectedOrInputValue.filter((option) => typeof option !== "string");
    switch (reason) {
      case "removeOption":
        const removedOption = changedOption;
        updateSelectedOptions(selectedOptions, "removeOption", removedOption);
        break;
      // User clicked an option. It's either an existing option, or "Create <new option>".
      case "selectOption": {
        const selectedOption = changedOption;
        if (selectedOption._action === "create") {
          const newOption = selectedOption.value;
          return createOption?.(newOption);
        }
        updateSelectedOptions(selectedOptions, "selectOption", selectedOption);
        break;
      }
      // User pressed "Enter" after typing input. The input is either matching existing option or a new option to create.
      case "createOption": {
        const inputValue = changedOption;
        const matchingOption = options12.find(
          (option) => option.label.toLocaleLowerCase() === inputValue.toLocaleLowerCase()
        );
        if (matchingOption) {
          selectedOptions.push(matchingOption);
          updateSelectedOptions(selectedOptions, "selectOption", matchingOption);
        } else {
          return createOption?.(inputValue);
        }
        break;
      }
    }
    setInputValue("");
    closeDropdown();
  };
  return handleChange;
  function updateSelectedOptions(selectedOptions, reason, changedOption) {
    onSelect?.(
      selectedOptions.map((option) => removeInternalKeys(option)),
      reason,
      removeInternalKeys(changedOption)
    );
  }
}

// src/components/creatable-autocomplete/use-autocomplete-states.ts
var import_react4 = require("react");
function useInputState(validate) {
  const [inputValue, setInputValue] = (0, import_react4.useState)("");
  const [error, setError] = (0, import_react4.useState)(null);
  const handleInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
    if (!validate) {
      return;
    }
    if (!value) {
      setError(null);
      return;
    }
    const { isValid, errorMessage } = validate(value, "inputChange");
    if (isValid) {
      setError(null);
    } else {
      setError(errorMessage);
    }
  };
  const handleInputBlur = () => {
    setInputValue("");
    setError(null);
  };
  return {
    inputValue,
    setInputValue,
    error,
    setError,
    inputHandlers: {
      onChange: handleInputChange,
      onBlur: handleInputBlur
    }
  };
}
function useOpenState(initialOpen = false) {
  const [open, setOpen] = (0, import_react4.useState)(initialOpen);
  const openDropdown = () => setOpen(true);
  const closeDropdown = () => setOpen(false);
  return { open, openDropdown, closeDropdown };
}

// src/components/creatable-autocomplete/use-create-option.ts
var import_react5 = require("react");
function useCreateOption(params) {
  const { onCreate, validate, setInputValue, setError, closeDropdown } = params;
  const [loading, setLoading] = (0, import_react5.useState)(false);
  if (!onCreate) {
    return { createOption: null, loading: false };
  }
  const createOption = async (value) => {
    setLoading(true);
    if (validate) {
      const { isValid, errorMessage } = validate(value, "create");
      if (!isValid) {
        setError(errorMessage);
        setLoading(false);
        return;
      }
    }
    try {
      setInputValue("");
      closeDropdown();
      await onCreate(value);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  return { createOption, loading };
}

// src/components/creatable-autocomplete/use-filter-options.ts
var import_ui = require("@elementor/ui");
function useFilterOptions(parameters) {
  const { options: options12, selected, onCreate, entityName } = parameters;
  const filter = (0, import_ui.createFilterOptions)();
  const filterOptions = (optionList, params) => {
    const selectedValues = selected.map((option) => option.value);
    const filteredOptions = filter(
      optionList.filter((option) => !selectedValues.includes(option.value)),
      params
    );
    const isExisting = options12.some((option) => params.inputValue === option.label);
    const allowCreate = Boolean(onCreate) && params.inputValue !== "" && !selectedValues.includes(params.inputValue) && !isExisting;
    if (allowCreate) {
      filteredOptions.unshift({
        label: `Create "${params.inputValue}"`,
        value: params.inputValue,
        _group: `Create a new ${entityName?.singular ?? "option"}`,
        key: `create-${params.inputValue}`,
        _action: "create"
      });
    }
    return filteredOptions;
  };
  return filterOptions;
}

// src/components/creatable-autocomplete/creatable-autocomplete.tsx
var MIN_INPUT_LENGTH = 2;
var CreatableAutocomplete = React5.forwardRef(CreatableAutocompleteInner);
function CreatableAutocompleteInner({
  selected,
  options: options12,
  entityName,
  onSelect,
  placeholder,
  onCreate,
  validate,
  renderEmptyState,
  ...props
}, ref) {
  const { inputValue, setInputValue, error, setError, inputHandlers } = useInputState(validate);
  const { open, openDropdown, closeDropdown } = useOpenState(props.open);
  const { createOption, loading } = useCreateOption({ onCreate, validate, setInputValue, setError, closeDropdown });
  const [internalOptions, internalSelected] = (0, import_react6.useMemo)(
    () => [options12, selected].map((optionsArr) => addGroupToOptions(optionsArr, entityName?.plural)),
    [options12, selected, entityName?.plural]
  );
  const handleChange = useAutocompleteChange({
    options: internalOptions,
    onSelect,
    createOption,
    setInputValue,
    closeDropdown
  });
  const filterOptions = useFilterOptions({ options: options12, selected, onCreate, entityName });
  const isCreatable = Boolean(onCreate);
  const freeSolo = isCreatable || inputValue.length < MIN_INPUT_LENGTH || void 0;
  return /* @__PURE__ */ React5.createElement(
    import_ui2.Autocomplete,
    {
      renderTags: (tagValue, getTagProps) => {
        return tagValue.map((option, index) => /* @__PURE__ */ React5.createElement(
          import_ui2.Chip,
          {
            size: "tiny",
            ...getTagProps({ index }),
            key: option.key ?? option.value ?? option.label,
            label: option.label
          }
        ));
      },
      ...props,
      ref,
      freeSolo,
      forcePopupIcon: false,
      multiple: true,
      clearOnBlur: true,
      selectOnFocus: true,
      disableClearable: true,
      handleHomeEndKeys: true,
      disabled: loading,
      open,
      onOpen: openDropdown,
      onClose: closeDropdown,
      disableCloseOnSelect: true,
      value: internalSelected,
      options: internalOptions,
      ListboxComponent: error ? React5.forwardRef((_, errorTextRef) => /* @__PURE__ */ React5.createElement(ErrorText, { ref: errorTextRef, error })) : void 0,
      renderGroup: (params) => /* @__PURE__ */ React5.createElement(Group, { ...params }),
      inputValue,
      renderInput: (params) => {
        return /* @__PURE__ */ React5.createElement(
          import_ui2.TextField,
          {
            ...params,
            error: Boolean(error),
            placeholder,
            ...inputHandlers,
            sx: (theme) => ({
              ".MuiAutocomplete-inputRoot.MuiInputBase-adornedStart": {
                paddingLeft: theme.spacing(0.25),
                paddingRight: theme.spacing(0.25)
              }
            })
          }
        );
      },
      onChange: handleChange,
      getOptionLabel: (option) => typeof option === "string" ? option : option.label,
      getOptionKey: (option) => {
        if (typeof option === "string") {
          return option;
        }
        return option.key ?? option.value ?? option.label;
      },
      filterOptions,
      groupBy: (option) => option._group ?? "",
      renderOption: (optionProps, option) => {
        const { _group, label } = option;
        return /* @__PURE__ */ React5.createElement(
          "li",
          {
            ...optionProps,
            style: { display: "block", textOverflow: "ellipsis" },
            "data-group": _group
          },
          label
        );
      },
      noOptionsText: renderEmptyState?.({
        searchValue: inputValue,
        onClear: () => {
          setInputValue("");
          closeDropdown();
        }
      }),
      isOptionEqualToValue: (option, value) => {
        if (typeof option === "string") {
          return option === value;
        }
        return option.value === value.value;
      }
    }
  );
}
var Group = (params) => {
  const id = `combobox-group-${(0, import_react6.useId)().replace(/:/g, "_")}`;
  return /* @__PURE__ */ React5.createElement(StyledGroup, { role: "group", "aria-labelledby": id }, /* @__PURE__ */ React5.createElement(StyledGroupHeader, { id }, " ", params.group), /* @__PURE__ */ React5.createElement(StyledGroupItems, { role: "listbox" }, params.children));
};
var ErrorText = React5.forwardRef(({ error = "error" }, ref) => {
  return /* @__PURE__ */ React5.createElement(
    import_ui2.Box,
    {
      ref,
      sx: (theme) => ({
        padding: theme.spacing(2)
      })
    },
    /* @__PURE__ */ React5.createElement(import_ui2.Typography, { variant: "caption", sx: { color: "error.main", display: "inline-block" } }, error)
  );
});
var StyledGroup = (0, import_ui2.styled)("li")`
	&:not( :last-of-type ) {
		border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
	}
`;
var StyledGroupHeader = (0, import_ui2.styled)(import_ui2.Box)(({ theme }) => ({
  position: "sticky",
  top: "-8px",
  padding: theme.spacing(1, 2),
  color: theme.palette.text.tertiary,
  backgroundColor: theme.palette.primary.contrastText
}));
var StyledGroupItems = (0, import_ui2.styled)("ul")`
	padding: 0;
`;

// src/components/css-classes/css-class-item.tsx
var React9 = __toESM(require("react"));
var import_react9 = require("react");
var import_editor_styles = require("@elementor/editor-styles");
var import_editor_styles_repository7 = require("@elementor/editor-styles-repository");
var import_editor_ui2 = require("@elementor/editor-ui");
var import_icons = require("@elementor/icons");
var import_session2 = require("@elementor/session");
var import_ui6 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");

// src/components/css-classes/css-class-context.tsx
var React6 = __toESM(require("react"));
var import_react7 = require("react");
var CssClassContext = (0, import_react7.createContext)(null);
var useCssClass = () => {
  const context = (0, import_react7.useContext)(CssClassContext);
  if (!context) {
    throw new Error("useCssClass must be used within a CssClassProvider");
  }
  return context;
};
function CssClassProvider({ children, ...contextValue }) {
  return /* @__PURE__ */ React6.createElement(CssClassContext.Provider, { value: contextValue }, children);
}

// src/components/css-classes/css-class-menu.tsx
var React8 = __toESM(require("react"));
var import_editor_styles_repository6 = require("@elementor/editor-styles-repository");
var import_editor_ui = require("@elementor/editor-ui");
var import_ui5 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");

// src/components/style-indicator.tsx
var import_ui3 = require("@elementor/ui");
var StyleIndicator = (0, import_ui3.styled)("div", {
  shouldForwardProp: (prop) => !["isOverridden", "getColor"].includes(prop)
})`
	width: 5px;
	height: 5px;
	border-radius: 50%;
	background-color: ${({ theme, isOverridden, getColor }) => {
  if (isOverridden) {
    return theme.palette.warning.light;
  }
  const providerColor = getColor?.(theme);
  return providerColor ?? theme.palette.text.disabled;
}};
`;

// src/components/css-classes/local-class-sub-menu.tsx
var React7 = __toESM(require("react"));
var import_ui4 = require("@elementor/ui");
var import_i18n = require("@wordpress/i18n");

// src/components/css-classes/use-can-convert-local-class-to-global.ts
var import_editor_styles_repository4 = require("@elementor/editor-styles-repository");
var useCanConvertLocalClassToGlobal = () => {
  const { element } = useElement();
  const { provider, id, meta } = useStyle();
  const styleDef = provider?.actions.get(id, { elementId: element.id, ...meta });
  const isLocalStylesProvider = provider && (0, import_editor_styles_repository4.isElementsStylesProvider)(provider?.getKey());
  const variants = styleDef?.variants || [];
  const canConvert = !!(isLocalStylesProvider && variants.length);
  return {
    canConvert,
    isLocalStylesProvider,
    id,
    styleDef: styleDef || null
  };
};

// src/components/css-classes/local-class-sub-menu.tsx
var LocalClassSubMenu = (props) => {
  const { canConvert, styleDef } = useCanConvertLocalClassToGlobal();
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(import_ui4.MenuSubheader, { sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1 } }, (0, import_i18n.__)("Local Class", "elementor")), /* @__PURE__ */ React7.createElement(CssClassConvert, { canConvert, styleDef, closeMenu: props.popupState.close }));
};

// src/components/css-classes/use-apply-and-unapply-class.ts
var import_react8 = require("react");
var import_editor_elements3 = require("@elementor/editor-elements");
var import_editor_styles_repository5 = require("@elementor/editor-styles-repository");
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var import_i18n2 = require("@wordpress/i18n");

// src/apply-unapply-actions.ts
var import_editor_documents = require("@elementor/editor-documents");
var import_editor_elements2 = require("@elementor/editor-elements");
var import_editor_props2 = require("@elementor/editor-props");
function doGetAppliedClasses(elementId, classesPropType = "classes") {
  return (0, import_editor_elements2.getElementSetting)(elementId, classesPropType)?.value || [];
}
function doApplyClasses(elementId, classIds, classesPropType = "classes") {
  (0, import_editor_elements2.updateElementSettings)({
    id: elementId,
    props: { [classesPropType]: import_editor_props2.classesPropTypeUtil.create(classIds) },
    withHistory: false
  });
  (0, import_editor_documents.setDocumentModifiedStatus)(true);
}
function doUnapplyClass(elementId, classId, classesPropType = "classes") {
  const appliedClasses = (0, import_editor_elements2.getElementSetting)(elementId, classesPropType)?.value || [];
  if (!appliedClasses.includes(classId)) {
    return false;
  }
  const updatedClassIds = appliedClasses.filter((id) => id !== classId);
  doApplyClasses(elementId, updatedClassIds, classesPropType);
  return true;
}

// src/components/css-classes/use-apply-and-unapply-class.ts
function useApplyClass() {
  const { id: activeId, setId: setActiveId } = useStyle();
  const { element } = useElement();
  const applyClass = useApply();
  const unapplyClass = useUnapply();
  return (0, import_react8.useMemo)(() => {
    return (0, import_editor_v1_adapters.undoable)(
      {
        do: ({ classId }) => {
          const prevActiveId = activeId;
          applyClass(classId);
          return prevActiveId;
        },
        undo: ({ classId }, prevActiveId) => {
          unapplyClass(classId);
          setActiveId(prevActiveId);
        }
      },
      {
        title: (0, import_editor_elements3.getElementLabel)(element.id),
        subtitle: ({ classLabel }) => {
          return (0, import_i18n2.__)(`class %s applied`, "elementor").replace("%s", classLabel);
        }
      }
    );
  }, [activeId, applyClass, element.id, unapplyClass, setActiveId]);
}
function useUnapplyClass() {
  const { id: activeId, setId: setActiveId } = useStyle();
  const { element } = useElement();
  const applyClass = useApply();
  const unapplyClass = useUnapply();
  return (0, import_react8.useMemo)(() => {
    return (0, import_editor_v1_adapters.undoable)(
      {
        do: ({ classId }) => {
          const prevActiveId = activeId;
          unapplyClass(classId);
          return prevActiveId;
        },
        undo: ({ classId }, prevActiveId) => {
          applyClass(classId);
          setActiveId(prevActiveId);
        }
      },
      {
        title: (0, import_editor_elements3.getElementLabel)(element.id),
        subtitle: ({ classLabel }) => {
          return (0, import_i18n2.__)(`class %s removed`, "elementor").replace("%s", classLabel);
        }
      }
    );
  }, [activeId, applyClass, element.id, unapplyClass, setActiveId]);
}
function useCreateAndApplyClass() {
  const { id: activeId, setId: setActiveId } = useStyle();
  const [provider, createAction] = (0, import_editor_styles_repository5.useGetStylesRepositoryCreateAction)() ?? [null, null];
  const deleteAction = provider?.actions.delete;
  const applyClass = useApply();
  const unapplyClass = useUnapply();
  const undoableCreateAndApply = (0, import_react8.useMemo)(() => {
    if (!provider || !createAction) {
      return;
    }
    return (0, import_editor_v1_adapters.undoable)(
      {
        do: ({ classLabel }) => {
          const prevActiveId = activeId;
          const createdId = createAction(classLabel);
          applyClass(createdId);
          return { prevActiveId, createdId };
        },
        undo: (_, { prevActiveId, createdId }) => {
          unapplyClass(createdId);
          deleteAction?.(createdId);
          setActiveId(prevActiveId);
        }
      },
      {
        title: (0, import_i18n2.__)("Class", "elementor"),
        subtitle: ({ classLabel }) => {
          return (0, import_i18n2.__)(`%s created`, "elementor").replace("%s", classLabel);
        }
      }
    );
  }, [activeId, applyClass, createAction, deleteAction, provider, setActiveId, unapplyClass]);
  if (!provider || !undoableCreateAndApply) {
    return [null, null];
  }
  return [provider, undoableCreateAndApply];
}
function useApply() {
  const { element } = useElement();
  const { setId: setActiveId } = useStyle();
  const { setClasses, getAppliedClasses } = useClasses();
  return (0, import_react8.useCallback)(
    (classIDToApply) => {
      const appliedClasses = getAppliedClasses();
      if (appliedClasses.includes(classIDToApply)) {
        throw new Error(
          `Class ${classIDToApply} is already applied to element ${element.id}, cannot re-apply.`
        );
      }
      const updatedClassesIds = [...appliedClasses, classIDToApply];
      setClasses(updatedClassesIds);
      setActiveId(classIDToApply);
    },
    [element.id, getAppliedClasses, setActiveId, setClasses]
  );
}
function useUnapply() {
  const { element } = useElement();
  const { id: activeId, setId: setActiveId } = useStyle();
  const { setClasses, getAppliedClasses } = useClasses();
  return (0, import_react8.useCallback)(
    (classIDToUnapply) => {
      const appliedClasses = getAppliedClasses();
      if (!appliedClasses.includes(classIDToUnapply)) {
        throw new Error(
          `Class ${classIDToUnapply} is not applied to element ${element.id}, cannot unapply it.`
        );
      }
      const updatedClassesIds = appliedClasses.filter((id) => id !== classIDToUnapply);
      setClasses(updatedClassesIds);
      if (activeId === classIDToUnapply) {
        setActiveId(updatedClassesIds[0] ?? null);
      }
    },
    [activeId, element.id, getAppliedClasses, setActiveId, setClasses]
  );
}
function useClasses() {
  const { element } = useElement();
  const currentClassesProp = useClassesProp();
  return (0, import_react8.useMemo)(() => {
    const setClasses = (ids) => {
      doApplyClasses(element.id, ids, currentClassesProp);
    };
    const getAppliedClasses = () => doGetAppliedClasses(element.id, currentClassesProp) || [];
    return { setClasses, getAppliedClasses };
  }, [currentClassesProp, element.id]);
}

// src/components/css-classes/css-class-menu.tsx
var DEFAULT_PSEUDO_STATES = [
  { key: "normal", value: null, label: (0, import_i18n3.__)("normal", "elementor") },
  { key: "hover", value: "hover", label: (0, import_i18n3.__)("hover", "elementor") },
  { key: "focus", value: "focus", label: (0, import_i18n3.__)("focus", "elementor") },
  { key: "active", value: "active", label: (0, import_i18n3.__)("active", "elementor") }
];
function usePseudoStates() {
  const { elementType } = useElement();
  const { pseudoStates = [] } = elementType;
  const additionalStates = pseudoStates.map(({ name, value }) => ({
    key: value,
    value,
    label: name
  }));
  return [...DEFAULT_PSEUDO_STATES, ...additionalStates];
}
function CssClassMenu({ popupState, anchorEl, fixed }) {
  const { provider } = useCssClass();
  const isLocalStyle2 = provider ? (0, import_editor_styles_repository6.isElementsStylesProvider)(provider) : true;
  const pseudoStates = usePseudoStates();
  const handleKeyDown = (e) => {
    e.stopPropagation();
  };
  return /* @__PURE__ */ React8.createElement(
    import_ui5.Menu,
    {
      MenuListProps: { dense: true, sx: { minWidth: "160px" } },
      ...(0, import_ui5.bindMenu)(popupState),
      anchorEl,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "left"
      },
      transformOrigin: {
        horizontal: "left",
        vertical: -4
      },
      onKeyDown: handleKeyDown,
      disableAutoFocusItem: true
    },
    isLocalStyle2 && /* @__PURE__ */ React8.createElement(LocalClassSubMenu, { popupState }),
    getMenuItemsByProvider({ provider, closeMenu: popupState.close, fixed }),
    /* @__PURE__ */ React8.createElement(import_ui5.MenuSubheader, { sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1 } }, (0, import_i18n3.__)("States", "elementor")),
    pseudoStates.map((state) => {
      return /* @__PURE__ */ React8.createElement(
        StateMenuItem,
        {
          key: state.key,
          state: state.value,
          label: state.label,
          closeMenu: popupState.close
        }
      );
    }),
    /* @__PURE__ */ React8.createElement(ClassStatesMenu, { closeMenu: popupState.close })
  );
}
function ClassStatesMenu({ closeMenu }) {
  const { elementStates, elementTitle } = useElementStates();
  if (!elementStates.length) {
    return null;
  }
  const customTitle = (0, import_i18n3.__)("%s States", "elementor").replace("%s", elementTitle);
  return /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement(import_ui5.Divider, null), /* @__PURE__ */ React8.createElement(import_ui5.MenuSubheader, { sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1 } }, customTitle), elementStates.map((state) => {
    return /* @__PURE__ */ React8.createElement(
      StateMenuItem,
      {
        key: state.key,
        state: state.value,
        label: state.label,
        closeMenu
      }
    );
  }));
}
var CLASS_STATES_MAP = {
  selected: {
    label: (0, import_i18n3.__)("selected", "elementor")
  }
};
function useElementStates() {
  const { elementType } = useElement();
  const { styleStates = [] } = elementType;
  const elementStates = styleStates.map(({ value, name }) => ({
    key: value,
    value,
    label: CLASS_STATES_MAP[value]?.label ?? name
  }));
  return {
    elementStates,
    elementTitle: elementType.title
  };
}
function useModifiedStates(styleId) {
  const { meta } = useStyle();
  const styleDef = import_editor_styles_repository6.stylesRepository.all().find((style) => style.id === styleId);
  return Object.fromEntries(
    styleDef?.variants.filter((variant) => meta.breakpoint === variant.meta.breakpoint).map((variant) => [variant.meta.state ?? "normal", true]) ?? []
  );
}
function getMenuItemsByProvider({
  provider,
  closeMenu,
  fixed
}) {
  if (!provider) {
    return [];
  }
  const providerInstance = import_editor_styles_repository6.stylesRepository.getProviderByKey(provider);
  const providerActions = providerInstance?.actions;
  const canUpdate = providerActions?.update;
  const canUnapply = !fixed;
  const actions = [
    canUpdate && /* @__PURE__ */ React8.createElement(RenameClassMenuItem, { key: "rename-class", closeMenu }),
    canUnapply && /* @__PURE__ */ React8.createElement(UnapplyClassMenuItem, { key: "unapply-class", closeMenu })
  ].filter(Boolean);
  if (actions.length) {
    actions.unshift(
      /* @__PURE__ */ React8.createElement(
        import_ui5.MenuSubheader,
        {
          key: "provider-label",
          sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1, textTransform: "capitalize" }
        },
        providerInstance?.labels?.singular
      )
    );
    actions.push(/* @__PURE__ */ React8.createElement(import_ui5.Divider, { key: "provider-actions-divider" }));
  }
  return actions;
}
function StateMenuItem({ state, label, closeMenu, ...props }) {
  const { id: styleId, provider } = useCssClass();
  const { id: activeId, setId: setActiveId, setMetaState: setActiveMetaState, meta } = useStyle();
  const { state: activeState } = meta;
  const { userCan } = (0, import_editor_styles_repository6.useUserStylesCapability)();
  const modifiedStates = useModifiedStates(styleId);
  const isUpdateAllowed = !state || userCan(provider ?? "").updateProps;
  const isStyled = modifiedStates[state ?? "normal"] ?? false;
  const disabled = !isUpdateAllowed && !isStyled;
  const isActive = styleId === activeId;
  const isSelected = state === activeState && isActive;
  return /* @__PURE__ */ React8.createElement(
    import_editor_ui.MenuListItem,
    {
      ...props,
      selected: isSelected,
      disabled,
      sx: { textTransform: "capitalize" },
      onClick: () => {
        if (!isActive) {
          setActiveId(styleId);
        }
        trackStyles(provider ?? "", "classStateClicked", {
          classId: styleId,
          type: label,
          source: styleId ? "global" : "local"
        });
        setActiveMetaState(state);
        closeMenu();
      }
    },
    /* @__PURE__ */ React8.createElement(
      import_editor_ui.MenuItemInfotip,
      {
        showInfoTip: disabled,
        content: (0, import_i18n3.__)("With your current role, you can only use existing states.", "elementor")
      },
      /* @__PURE__ */ React8.createElement(import_ui5.Stack, { gap: 0.75, direction: "row", alignItems: "center" }, isStyled && /* @__PURE__ */ React8.createElement(
        StyleIndicator,
        {
          "aria-label": (0, import_i18n3.__)("Has style", "elementor"),
          getColor: getTempStylesProviderThemeColor(provider ?? "")
        }
      ), label)
    )
  );
}
function UnapplyClassMenuItem({ closeMenu, ...props }) {
  const { id: classId, label: classLabel, provider } = useCssClass();
  const unapplyClass = useUnapplyClass();
  return classId ? /* @__PURE__ */ React8.createElement(
    import_editor_ui.MenuListItem,
    {
      ...props,
      onClick: () => {
        unapplyClass({ classId, classLabel });
        trackStyles(provider ?? "", "classRemoved", {
          classId,
          classTitle: classLabel,
          source: "style-tab"
        });
        closeMenu();
      }
    },
    (0, import_i18n3.__)("Remove", "elementor")
  ) : null;
}
function RenameClassMenuItem({ closeMenu }) {
  const { handleRename, provider } = useCssClass();
  const { userCan } = (0, import_editor_styles_repository6.useUserStylesCapability)();
  if (!provider) {
    return null;
  }
  const isAllowed = userCan(provider).update;
  return /* @__PURE__ */ React8.createElement(
    import_editor_ui.MenuListItem,
    {
      disabled: !isAllowed,
      onClick: () => {
        closeMenu();
        handleRename();
      }
    },
    /* @__PURE__ */ React8.createElement(
      import_editor_ui.MenuItemInfotip,
      {
        showInfoTip: !isAllowed,
        content: (0, import_i18n3.__)(
          "With your current role, you can use existing classes but can\u2019t modify them.",
          "elementor"
        )
      },
      (0, import_i18n3.__)("Rename", "elementor")
    )
  );
}

// src/components/css-classes/css-class-item.tsx
var CHIP_SIZE = "tiny";
function CssClassItem(props) {
  const { chipProps, icon, color: colorProp, fixed, ...classProps } = props;
  const { id, provider, label, isActive, onClickActive, renameLabel, setError } = classProps;
  const { elementStates } = useElementStates();
  const { meta, setMetaState } = useStyle();
  const popupState = (0, import_ui6.usePopupState)({ variant: "popover" });
  const [chipRef, setChipRef] = (0, import_react9.useState)(null);
  const { onDelete, ...chipGroupProps } = chipProps;
  const { userCan } = (0, import_editor_styles_repository7.useUserStylesCapability)();
  const [convertedFromLocalId, , clearConvertedFromLocalId] = (0, import_session2.useSessionStorage)(
    "last-converted-class-generated-name",
    "app"
  );
  const {
    ref,
    isEditing,
    openEditMode,
    error,
    getProps: getEditableProps
  } = (0, import_editor_ui2.useEditable)({
    value: label,
    onSubmit: renameLabel,
    validation: validateLabel,
    onError: setError
  });
  const color = error ? "error" : colorProp;
  const providerActions = provider ? import_editor_styles_repository7.stylesRepository.getProviderByKey(provider)?.actions : null;
  const allowRename = Boolean(providerActions?.update) && userCan(provider ?? "")?.update;
  const isShowingState = isActive && meta.state;
  const stateLabel = (0, import_react9.useMemo)(() => {
    if (meta.state && (0, import_editor_styles.isClassState)(meta.state)) {
      return elementStates.find((state) => state.value === meta.state)?.label;
    }
    return meta.state;
  }, [meta.state, elementStates]);
  (0, import_react9.useEffect)(() => {
    if (convertedFromLocalId && id === convertedFromLocalId) {
      clearConvertedFromLocalId();
      openEditMode();
    }
  }, [id, convertedFromLocalId]);
  return /* @__PURE__ */ React9.createElement(import_ui6.ThemeProvider, { palette: "default" }, /* @__PURE__ */ React9.createElement(
    import_ui6.UnstableChipGroup,
    {
      ref: setChipRef,
      ...chipGroupProps,
      "aria-label": `Edit ${label}`,
      role: "group",
      sx: (theme) => ({
        "&.MuiChipGroup-root.MuiAutocomplete-tag": { margin: theme.spacing(0.125) }
      })
    },
    /* @__PURE__ */ React9.createElement(
      import_ui6.Chip,
      {
        size: CHIP_SIZE,
        label: isEditing ? /* @__PURE__ */ React9.createElement(import_editor_ui2.EditableField, { ref, ...getEditableProps() }) : /* @__PURE__ */ React9.createElement(import_editor_ui2.EllipsisWithTooltip, { maxWidth: "10ch", title: label, as: "div" }),
        variant: isActive && !meta.state && !isEditing ? "filled" : "standard",
        shape: "rounded",
        icon,
        color,
        onClick: () => {
          if (isShowingState) {
            setMetaState(null);
            return;
          }
          if (allowRename && isActive) {
            openEditMode();
            return;
          }
          onClickActive(id);
        },
        "aria-pressed": isActive,
        sx: (theme) => ({
          lineHeight: 1,
          cursor: isActive && allowRename && !isShowingState ? "text" : "pointer",
          borderRadius: `${theme.shape.borderRadius * 0.75}px`,
          "&.Mui-focusVisible": {
            boxShadow: "none !important"
          }
        })
      }
    ),
    !isEditing && /* @__PURE__ */ React9.createElement(
      import_ui6.Chip,
      {
        icon: isShowingState ? void 0 : /* @__PURE__ */ React9.createElement(import_icons.DotsVerticalIcon, { fontSize: "tiny" }),
        size: CHIP_SIZE,
        label: isShowingState ? /* @__PURE__ */ React9.createElement(import_ui6.Stack, { direction: "row", gap: 0.5, alignItems: "center" }, /* @__PURE__ */ React9.createElement(import_ui6.Typography, { variant: "inherit" }, stateLabel), /* @__PURE__ */ React9.createElement(import_icons.DotsVerticalIcon, { fontSize: "tiny" })) : void 0,
        variant: "filled",
        shape: "rounded",
        color,
        ...(0, import_ui6.bindTrigger)(popupState),
        "aria-label": (0, import_i18n4.__)("Open CSS Class Menu", "elementor"),
        sx: (theme) => ({
          borderRadius: `${theme.shape.borderRadius * 0.75}px`,
          paddingRight: 0,
          ...!isShowingState ? { paddingLeft: 0 } : {},
          ".MuiChip-label": isShowingState ? { paddingRight: 0 } : { padding: 0 }
        })
      }
    )
  ), /* @__PURE__ */ React9.createElement(CssClassProvider, { ...classProps, handleRename: openEditMode }, /* @__PURE__ */ React9.createElement(CssClassMenu, { popupState, anchorEl: chipRef, fixed })));
}
var validateLabel = (newLabel) => {
  const result = (0, import_editor_styles_repository7.validateStyleLabel)(newLabel, "rename");
  if (result.isValid) {
    return null;
  }
  return result.errorMessage;
};

// src/components/css-classes/css-class-selector.tsx
var ID = "elementor-css-class-selector";
var TAGS_LIMIT = 50;
var EMPTY_OPTION = {
  label: (0, import_i18n5.__)("local", "elementor"),
  value: null,
  fixed: true,
  color: getTempStylesProviderColorName("accent"),
  icon: /* @__PURE__ */ React10.createElement(import_icons2.MapPinIcon, null),
  provider: null
};
var { Slot: ClassSelectorActionsSlot, inject: injectIntoClassSelectorActions } = (0, import_locations2.createLocation)();
function CssClassSelector() {
  const options12 = useOptions();
  const { id: activeId, setId: setActiveId } = useStyle();
  const autocompleteRef = (0, import_react10.useRef)(null);
  const [renameError, setRenameError] = (0, import_react10.useState)(null);
  const handleSelect = useHandleSelect();
  const { create, validate, entityName } = useCreateAction();
  const appliedOptions = useAppliedOptions(options12);
  const active = appliedOptions.find((option) => option.value === activeId) ?? EMPTY_OPTION;
  const showPlaceholder = appliedOptions.every(({ fixed }) => fixed);
  const { userCan } = (0, import_editor_styles_repository8.useUserStylesCapability)();
  const canEdit = active.provider ? userCan(active.provider).updateProps : true;
  return /* @__PURE__ */ React10.createElement(import_ui7.Stack, { p: 2 }, /* @__PURE__ */ React10.createElement(import_ui7.Stack, { direction: "row", gap: 1, alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React10.createElement(import_ui7.FormLabel, { htmlFor: ID, size: "small" }, (0, import_i18n5.__)("Classes", "elementor")), /* @__PURE__ */ React10.createElement(import_ui7.Stack, { direction: "row", gap: 1 }, /* @__PURE__ */ React10.createElement(ClassSelectorActionsSlot, null))), /* @__PURE__ */ React10.createElement(
    import_editor_ui3.WarningInfotip,
    {
      open: Boolean(renameError),
      text: renameError ?? "",
      placement: "bottom",
      width: autocompleteRef.current?.getBoundingClientRect().width,
      offset: [0, -15]
    },
    /* @__PURE__ */ React10.createElement(
      CreatableAutocomplete,
      {
        id: ID,
        ref: autocompleteRef,
        size: "tiny",
        placeholder: showPlaceholder ? (0, import_i18n5.__)("Type class name", "elementor") : void 0,
        options: options12,
        selected: appliedOptions,
        entityName,
        onSelect: handleSelect,
        onCreate: create ?? void 0,
        validate: validate ?? void 0,
        limitTags: TAGS_LIMIT,
        renderEmptyState: EmptyState,
        getLimitTagsText: (more) => /* @__PURE__ */ React10.createElement(import_ui7.Chip, { size: "tiny", variant: "standard", label: `+${more}`, clickable: true }),
        renderTags: (values, getTagProps) => values.map((value, index) => {
          const chipProps = getTagProps({ index });
          const isActive = value.value === active?.value;
          const renameLabel = (newLabel) => {
            if (!value.value) {
              throw new Error(`Cannot rename a class without style id`);
            }
            trackStyles(value.provider ?? "", "classRenamed", {
              classId: value.value,
              newValue: newLabel,
              oldValue: value.label,
              source: "style-tab"
            });
            return updateClassByProvider(value.provider, { label: newLabel, id: value.value });
          };
          return /* @__PURE__ */ React10.createElement(
            CssClassItem,
            {
              key: chipProps.key,
              fixed: value.fixed,
              label: value.label,
              provider: value.provider,
              id: value.value,
              isActive,
              color: isActive && value.color ? value.color : "default",
              icon: value.icon,
              chipProps,
              onClickActive: () => setActiveId(value.value),
              renameLabel,
              setError: setRenameError
            }
          );
        })
      }
    )
  ), !canEdit && /* @__PURE__ */ React10.createElement(import_editor_ui3.InfoAlert, { sx: { mt: 1 } }, (0, import_i18n5.__)("With your current role, you can use existing classes but can\u2019t modify them.", "elementor")));
}
var EmptyState = ({ searchValue, onClear }) => /* @__PURE__ */ React10.createElement(import_ui7.Box, { sx: { py: 4 } }, /* @__PURE__ */ React10.createElement(
  import_ui7.Stack,
  {
    gap: 1,
    alignItems: "center",
    color: "text.secondary",
    justifyContent: "center",
    sx: { px: 2, m: "auto", maxWidth: "236px" }
  },
  /* @__PURE__ */ React10.createElement(import_icons2.ColorSwatchIcon, { sx: { transform: "rotate(90deg)" }, fontSize: "large" }),
  /* @__PURE__ */ React10.createElement(import_ui7.Typography, { align: "center", variant: "subtitle2" }, (0, import_i18n5.__)("Sorry, nothing matched", "elementor"), /* @__PURE__ */ React10.createElement("br", null), "\u201C", searchValue, "\u201D."),
  /* @__PURE__ */ React10.createElement(import_ui7.Typography, { align: "center", variant: "caption", sx: { mb: 2 } }, (0, import_i18n5.__)("With your current role,", "elementor"), /* @__PURE__ */ React10.createElement("br", null), (0, import_i18n5.__)("you can only use existing classes.", "elementor")),
  /* @__PURE__ */ React10.createElement(import_ui7.Link, { color: "text.secondary", variant: "caption", component: "button", onClick: onClear }, (0, import_i18n5.__)("Clear & try again", "elementor"))
));
var updateClassByProvider = (provider, data) => {
  if (!provider) {
    return;
  }
  const providerInstance = import_editor_styles_repository8.stylesRepository.getProviderByKey(provider);
  if (!providerInstance) {
    return;
  }
  return providerInstance.actions.update?.(data);
};
function useOptions() {
  const { element } = useElement();
  const isProviderEditable = (provider) => !!provider.actions.updateProps;
  return (0, import_editor_styles_repository8.useProviders)().filter(isProviderEditable).flatMap((provider) => {
    const isElements = (0, import_editor_styles_repository8.isElementsStylesProvider)(provider.getKey());
    const styleDefs = provider.actions.all({ elementId: element.id });
    if (isElements && styleDefs.length === 0) {
      return [EMPTY_OPTION];
    }
    return styleDefs.map((styleDef) => {
      return {
        label: styleDef.label,
        value: styleDef.id,
        fixed: isElements,
        color: getTempStylesProviderColorName(getStylesProviderColorName(provider.getKey())),
        icon: isElements ? /* @__PURE__ */ React10.createElement(import_icons2.MapPinIcon, null) : null,
        provider: provider.getKey()
      };
    });
  });
}
function getTempStylesProviderColorName(color) {
  if (color === "accent") {
    return "primary";
  }
  return color;
}
function useCreateAction() {
  const [provider, createAction] = useCreateAndApplyClass();
  if (!provider || !createAction) {
    return {};
  }
  const create = (classLabel) => {
    const { createdId } = createAction({ classLabel });
    trackStyles(provider.getKey() ?? "", "classCreated", {
      source: "created",
      classTitle: classLabel,
      classId: createdId
    });
  };
  const validate = (newClassLabel, event) => {
    if (hasReachedLimit(provider)) {
      return {
        isValid: false,
        /* translators: %s is the maximum number of classes */
        errorMessage: (0, import_i18n5.__)(
          "You\u2019ve reached the limit of %s classes. Please remove an existing one to create a new class.",
          "elementor"
        ).replace("%s", provider.limit.toString())
      };
    }
    return (0, import_editor_styles_repository8.validateStyleLabel)(newClassLabel, event);
  };
  const entityName = provider.labels.singular && provider.labels.plural ? provider.labels : void 0;
  return { create, validate, entityName };
}
function hasReachedLimit(provider) {
  return provider.actions.all().length >= provider.limit;
}
function useAppliedOptions(options12) {
  const currentClassesProp = useClassesProp();
  const appliedIds = usePanelElementSetting(currentClassesProp)?.value ?? [];
  const appliedOptions = options12.filter((option) => option.value && appliedIds.includes(option.value));
  const hasElementsProviderStyleApplied = appliedOptions.some(
    (option) => option.provider && (0, import_editor_styles_repository8.isElementsStylesProvider)(option.provider)
  );
  if (!hasElementsProviderStyleApplied) {
    appliedOptions.unshift(EMPTY_OPTION);
  }
  return appliedOptions;
}
function useHandleSelect() {
  const apply = useApplyClass();
  const unapply = useUnapplyClass();
  return (_selectedOptions, reason, option) => {
    if (!option.value) {
      return;
    }
    switch (reason) {
      case "selectOption":
        apply({ classId: option.value, classLabel: option.label });
        trackStyles(option.provider ?? "", "classApplied", {
          classId: option.value,
          source: "style-tab"
        });
        break;
      case "removeOption":
        unapply({ classId: option.value, classLabel: option.label });
        trackStyles(option.provider ?? "", "classRemoved", {
          classId: option.value,
          source: "style-tab"
        });
        break;
    }
  };
}

// src/components/custom-css-indicator.tsx
var React11 = __toESM(require("react"));
var import_editor_responsive = require("@elementor/editor-responsive");
var import_editor_styles4 = require("@elementor/editor-styles");

// src/hooks/use-custom-css.ts
var import_react13 = require("react");
var import_editor_elements5 = require("@elementor/editor-elements");
var import_editor_props3 = require("@elementor/editor-props");
var import_editor_styles3 = require("@elementor/editor-styles");
var import_editor_styles_repository11 = require("@elementor/editor-styles-repository");
var import_editor_v1_adapters3 = require("@elementor/editor-v1-adapters");
var import_utils2 = require("@elementor/utils");

// src/hooks/use-styles-fields.ts
var import_react12 = require("react");
var import_editor_elements4 = require("@elementor/editor-elements");
var import_editor_styles2 = require("@elementor/editor-styles");
var import_editor_styles_repository9 = require("@elementor/editor-styles-repository");
var import_editor_styles_repository10 = require("@elementor/editor-styles-repository");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
var import_i18n6 = require("@wordpress/i18n");

// src/hooks/use-styles-rerender.ts
var import_react11 = require("react");
var useStylesRerender = () => {
  const { provider } = useStyle();
  const [, reRender] = (0, import_react11.useReducer)((p) => !p, false);
  (0, import_react11.useEffect)(() => provider?.subscribe(reRender), [provider]);
};

// src/hooks/use-styles-fields.ts
var HISTORY_DEBOUNCE_WAIT = 800;
function useStylesFields(propNames) {
  const {
    element: { id: elementId }
  } = useElement();
  const { id: styleId, meta, provider, canEdit } = useStyle();
  const undoableUpdateStyle = useUndoableActions({ elementId, meta });
  useStylesRerender();
  const values = getProps({ elementId, styleId, provider, meta, propNames });
  const setValues = (props, { history: { propDisplayName } }) => {
    if (!styleId) {
      undoableUpdateStyle({ styleId: null, provider: null, props, propDisplayName });
    } else {
      undoableUpdateStyle({ styleId, provider, props, propDisplayName });
    }
  };
  return { values, setValues, canEdit };
}
function getProps({ styleId, elementId, provider, meta, propNames }) {
  if (!provider || !styleId) {
    return null;
  }
  const style = provider.actions.get(styleId, { elementId });
  if (!style) {
    throw new StyleNotFoundUnderProviderError({ context: { styleId, providerKey: provider.getKey() } });
  }
  const variant = (0, import_editor_styles2.getVariantByMeta)(style, meta);
  return Object.fromEntries(
    propNames.map((key) => [key, variant?.props[key] ?? null])
  );
}
function useUndoableActions({
  elementId,
  meta: { breakpoint, state }
}) {
  const classesProp = useClassesProp();
  return (0, import_react12.useMemo)(() => {
    const meta = { breakpoint, state };
    const createStyleArgs = { elementId, classesProp, meta, label: import_editor_styles_repository10.ELEMENTS_STYLES_RESERVED_LABEL };
    return (0, import_editor_v1_adapters2.undoable)(
      {
        do: (payload) => {
          if ((0, import_editor_elements4.shouldCreateNewLocalStyle)(payload)) {
            return create(payload);
          }
          return update(payload);
        },
        undo: (payload, doReturn) => {
          const wasLocalStyleCreated = (0, import_editor_elements4.shouldCreateNewLocalStyle)(payload);
          if (wasLocalStyleCreated) {
            return undoCreate(payload, doReturn);
          }
          return undo(payload, doReturn);
        },
        redo: (payload, doReturn) => {
          const wasLocalStyleCreated = (0, import_editor_elements4.shouldCreateNewLocalStyle)(payload);
          if (wasLocalStyleCreated) {
            return create(payload, doReturn);
          }
          return update(payload);
        }
      },
      {
        title: ({ provider, styleId }) => getTitle({ provider, styleId, elementId }),
        subtitle: ({ provider, styleId, propDisplayName }) => getSubtitle({ provider, styleId, elementId, propDisplayName }),
        debounce: { wait: HISTORY_DEBOUNCE_WAIT }
      }
    );
    function create({ props }, redoArgs) {
      const createdStyle = (0, import_editor_elements4.createElementStyle)({ ...createStyleArgs, props, styleId: redoArgs?.createdStyleId });
      return { createdStyleId: createdStyle };
    }
    function undoCreate(_, { createdStyleId }) {
      (0, import_editor_elements4.deleteElementStyle)(elementId, createdStyleId);
    }
    function update({ provider, styleId, props }) {
      if (!provider.actions.updateProps) {
        throw new StylesProviderCannotUpdatePropsError({
          context: { providerKey: provider.getKey() }
        });
      }
      const style = provider.actions.get(styleId, { elementId });
      const prevProps = getCurrentProps(style, meta);
      provider.actions.updateProps({ id: styleId, meta, props }, { elementId });
      return { styleId, provider, prevProps };
    }
    function undo(_, { styleId, provider, prevProps }) {
      provider.actions.updateProps?.({ id: styleId, meta, props: prevProps }, { elementId });
    }
  }, [elementId, breakpoint, state, classesProp]);
}
function getCurrentProps(style, meta) {
  if (!style) {
    return {};
  }
  const variant = (0, import_editor_styles2.getVariantByMeta)(style, meta);
  const props = variant?.props ?? {};
  return structuredClone(props);
}
var defaultHistoryTitles = {
  title: ({ provider }) => {
    const providerLabel = provider.labels?.singular;
    return providerLabel ? capitalize(providerLabel) : (0, import_i18n6.__)("Style", "elementor");
  },
  subtitle: ({ provider, styleId, elementId, propDisplayName }) => {
    const styleLabel = provider.actions.get(styleId, { elementId })?.label;
    if (!styleLabel) {
      throw new Error(`Style ${styleId} not found`);
    }
    return (0, import_i18n6.__)(`%s$1 %s$2 edited`, "elementor").replace("%s$1", styleLabel).replace("%s$2", propDisplayName);
  }
};
var localStyleHistoryTitles = {
  title: ({ elementId }) => (0, import_editor_elements4.getElementLabel)(elementId),
  subtitle: ({ propDisplayName }) => (
    // translators: %s is the name of the style property being edited
    (0, import_i18n6.__)(`%s edited`, "elementor").replace("%s", propDisplayName)
  )
};
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
var isLocalStyle = (provider, styleId) => !provider || !styleId || (0, import_editor_styles_repository9.isElementsStylesProvider)(provider.getKey());
var getTitle = ({ provider, styleId, elementId }) => {
  const isLocal = isLocalStyle(provider, styleId);
  if (isLocal) {
    return localStyleHistoryTitles.title({ elementId });
  }
  return defaultHistoryTitles.title({ provider });
};
var getSubtitle = ({ provider, styleId, propDisplayName, elementId }) => {
  const isLocal = isLocalStyle(provider, styleId);
  if (isLocal) {
    return localStyleHistoryTitles.subtitle({ propDisplayName });
  }
  return defaultHistoryTitles.subtitle({
    provider,
    styleId,
    elementId,
    propDisplayName
  });
};

// src/hooks/use-custom-css.ts
var useCustomCss = () => {
  const {
    element: { id: elementId }
  } = useElement();
  const { id: styleId, meta, provider } = useStyle();
  const style = provider?.actions.get(styleId, { elementId });
  const undoableUpdateStyle = useUndoableActions2({ elementId, meta });
  const currentStyleId = styleId ? styleId : null;
  const currentProvider = styleId ? provider : null;
  useStylesRerender();
  const variant = style ? (0, import_editor_styles3.getVariantByMeta)(style, meta) : null;
  const setCustomCss = (raw, { history: { propDisplayName } }) => {
    const newValue = { raw: (0, import_utils2.encodeString)(sanitize(raw)) };
    undoableUpdateStyle({
      styleId: currentStyleId,
      provider: currentProvider,
      customCss: newValue,
      propDisplayName
    });
  };
  const customCss = variant?.custom_css?.raw ? { raw: (0, import_utils2.decodeString)(variant.custom_css.raw) } : null;
  return {
    customCss,
    setCustomCss
  };
};
function useUndoableActions2({
  elementId,
  meta: { breakpoint, state }
}) {
  const classesProp = useClassesProp();
  return (0, import_react13.useMemo)(() => {
    const meta = { breakpoint, state };
    const createStyleArgs = { elementId, classesProp, meta, label: import_editor_styles_repository11.ELEMENTS_STYLES_RESERVED_LABEL };
    return (0, import_editor_v1_adapters3.undoable)(
      {
        do: (payload) => {
          if ((0, import_editor_elements5.shouldCreateNewLocalStyle)(payload)) {
            return create(payload);
          }
          return update(payload);
        },
        undo: (payload, doReturn) => {
          if ((0, import_editor_elements5.shouldCreateNewLocalStyle)(payload)) {
            return undoCreate(payload, doReturn);
          }
          return undoUpdate(payload, doReturn);
        },
        redo: (payload, doReturn) => {
          if ((0, import_editor_elements5.shouldCreateNewLocalStyle)(payload)) {
            return create(payload, doReturn);
          }
          return update(payload);
        }
      },
      {
        title: ({ provider, styleId }) => getTitle({ provider, styleId, elementId }),
        subtitle: ({ provider, styleId, propDisplayName }) => getSubtitle({ provider, styleId, elementId, propDisplayName }),
        debounce: { wait: HISTORY_DEBOUNCE_WAIT }
      }
    );
    function create({ customCss }, redoArgs) {
      const createdStyle = (0, import_editor_elements5.createElementStyle)({
        ...createStyleArgs,
        props: {},
        custom_css: customCss ?? null,
        styleId: redoArgs?.createdStyleId
      });
      return { createdStyleId: createdStyle };
    }
    function undoCreate(_, { createdStyleId }) {
      (0, import_editor_elements5.deleteElementStyle)(elementId, createdStyleId);
    }
    function update({ provider, styleId, customCss }) {
      if (!provider.actions.updateCustomCss) {
        throw new StylesProviderCannotUpdatePropsError({
          context: { providerKey: provider.getKey() }
        });
      }
      const style = provider.actions.get(styleId, { elementId });
      const prevCustomCss = getCurrentCustomCss(style, meta);
      provider.actions.updateCustomCss({ id: styleId, meta, custom_css: customCss }, { elementId });
      return { styleId, provider, prevCustomCss };
    }
    function undoUpdate(_, { styleId, provider, prevCustomCss }) {
      provider.actions.updateCustomCss?.(
        { id: styleId, meta, custom_css: prevCustomCss ?? { raw: "" } },
        { elementId }
      );
    }
  }, [elementId, breakpoint, state, classesProp]);
}
function getCurrentCustomCss(style, meta) {
  if (!style) {
    return null;
  }
  const variant = (0, import_editor_styles3.getVariantByMeta)(style, meta);
  return variant?.custom_css ?? null;
}
function sanitize(raw) {
  return import_editor_props3.stringPropTypeUtil.schema.safeParse(import_editor_props3.stringPropTypeUtil.create(raw)).data?.value?.trim() ?? "";
}

// src/components/custom-css-indicator.tsx
var CustomCssIndicator = () => {
  const { customCss } = useCustomCss();
  const { id: styleId, provider, meta } = useStyle();
  const {
    element: { id: elementId }
  } = useElement();
  const style = React11.useMemo(
    () => styleId && provider ? provider.actions.get(styleId, { elementId }) : null,
    [styleId, provider, elementId]
  );
  const hasContent = Boolean(customCss?.raw?.trim());
  const hasInheritedContent = React11.useMemo(() => {
    if (hasContent) {
      return false;
    }
    return hasInheritedCustomCss(style, meta);
  }, [hasContent, style, meta]);
  if (!hasContent) {
    if (hasInheritedContent) {
      return /* @__PURE__ */ React11.createElement(StyleIndicator, null);
    }
    return null;
  }
  return /* @__PURE__ */ React11.createElement(StyleIndicator, { getColor: provider ? getStylesProviderThemeColor(provider.getKey()) : void 0 });
};
var hasInheritedCustomCss = (style, meta) => {
  if (!style || !meta) {
    return false;
  }
  const target = meta.breakpoint ?? "desktop";
  const root = (0, import_editor_responsive.getBreakpointsTree)();
  const state = meta.state;
  function search(node, ancestorHasCss) {
    if (!style) {
      return void 0;
    }
    const hasHere = Boolean(
      (0, import_editor_styles4.getVariantByMeta)(style, {
        breakpoint: node.id,
        state
      })?.custom_css?.raw?.trim()
    );
    if (node.id === target) {
      return ancestorHasCss;
    }
    for (const child of node.children ?? []) {
      const res = search(child, ancestorHasCss || hasHere);
      if (res !== void 0) {
        return res;
      }
    }
    return void 0;
  }
  return Boolean(search(root, false));
};

// src/components/editing-panel.tsx
var React81 = __toESM(require("react"));
var import_editor_controls49 = require("@elementor/editor-controls");
var import_editor_elements12 = require("@elementor/editor-elements");
var import_editor_panels = require("@elementor/editor-panels");
var import_editor_ui7 = require("@elementor/editor-ui");
var import_icons21 = require("@elementor/icons");
var import_locations4 = require("@elementor/locations");
var import_menus = require("@elementor/menus");
var import_session8 = require("@elementor/session");
var import_ui36 = require("@elementor/ui");
var import_i18n55 = require("@wordpress/i18n");

// src/editing-panel-replacement-registry.tsx
var registry = /* @__PURE__ */ new Map();
var DEFAULT_PRIORITY = 10;
var registerEditingPanelReplacement = ({
  id,
  priority = DEFAULT_PRIORITY,
  ...props
}) => {
  registry.set(id, { ...props, priority });
};
var getEditingPanelReplacement = (element, elementType) => Array.from(registry.values()).filter(({ condition }) => condition(element, elementType)).sort((a, b) => a.priority - b.priority)?.[0] ?? null;

// src/components/editing-panel-error-fallback.tsx
var React12 = __toESM(require("react"));
var import_ui8 = require("@elementor/ui");
function EditorPanelErrorFallback() {
  return /* @__PURE__ */ React12.createElement(import_ui8.Box, { role: "alert", sx: { minHeight: "100%", p: 2 } }, /* @__PURE__ */ React12.createElement(import_ui8.Alert, { severity: "error", sx: { mb: 2, maxWidth: 400, textAlign: "center" } }, /* @__PURE__ */ React12.createElement("strong", null, "Something went wrong")));
}

// src/components/editing-panel-tabs.tsx
var import_react33 = require("react");
var React80 = __toESM(require("react"));
var import_editor_v1_adapters7 = require("@elementor/editor-v1-adapters");
var import_ui35 = require("@elementor/ui");
var import_i18n54 = require("@wordpress/i18n");

// src/contexts/scroll-context.tsx
var React13 = __toESM(require("react"));
var import_react14 = require("react");
var import_ui9 = require("@elementor/ui");
var ScrollContext = (0, import_react14.createContext)(void 0);
var ScrollPanel = (0, import_ui9.styled)("div")`
	height: 100%;
	overflow-y: auto;
`;
var DEFAULT_SCROLL_DIRECTION = "up";
function ScrollProvider({ children }) {
  const [direction, setDirection] = (0, import_react14.useState)(DEFAULT_SCROLL_DIRECTION);
  const ref = (0, import_react14.useRef)(null);
  const scrollPos = (0, import_react14.useRef)(0);
  (0, import_react14.useEffect)(() => {
    const scrollElement = ref.current;
    if (!scrollElement) {
      return;
    }
    const handleScroll = () => {
      const { scrollTop } = scrollElement;
      if (scrollTop > scrollPos.current) {
        setDirection("down");
      } else if (scrollTop < scrollPos.current) {
        setDirection("up");
      }
      scrollPos.current = scrollTop;
    };
    scrollElement.addEventListener("scroll", handleScroll);
    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  });
  return /* @__PURE__ */ React13.createElement(ScrollContext.Provider, { value: { direction } }, /* @__PURE__ */ React13.createElement(ScrollPanel, { ref }, children));
}
function useScrollDirection() {
  return (0, import_react14.useContext)(ScrollContext)?.direction ?? DEFAULT_SCROLL_DIRECTION;
}

// src/hooks/use-default-panel-settings.ts
var import_react15 = require("react");
var fallbackEditorSettings = {
  defaultSectionsExpanded: {
    settings: ["Content", "Settings"],
    style: []
  },
  defaultTab: "settings"
};
var defaultPanelSettingsContext = (0, import_react15.createContext)({
  "e-div-block": {
    defaultSectionsExpanded: fallbackEditorSettings.defaultSectionsExpanded,
    defaultTab: "style"
  },
  "e-flexbox": {
    defaultSectionsExpanded: fallbackEditorSettings.defaultSectionsExpanded,
    defaultTab: "style"
  },
  "e-divider": {
    defaultSectionsExpanded: fallbackEditorSettings.defaultSectionsExpanded,
    defaultTab: "style"
  }
});
var useDefaultPanelSettings = () => {
  const { element } = useElement();
  const defaults = (0, import_react15.useContext)(defaultPanelSettingsContext)[element.type];
  return defaults || fallbackEditorSettings;
};

// src/hooks/use-state-by-element.ts
var import_react16 = require("react");
var import_session3 = require("@elementor/session");
var useStateByElement = (key, initialValue) => {
  const { element } = useElement();
  const lookup = `elementor/editor-state/${element.id}/${key}`;
  const storedValue = (0, import_session3.getSessionStorageItem)(lookup);
  const [value, setValue] = (0, import_react16.useState)(storedValue ?? initialValue);
  const doUpdate = (newValue) => {
    (0, import_session3.setSessionStorageItem)(lookup, newValue);
    setValue(newValue);
  };
  return [value, doUpdate];
};

// src/components/interactions-tab.tsx
var React15 = __toESM(require("react"));
var import_editor_interactions = require("@elementor/editor-interactions");

// src/components/sections-list.tsx
var React14 = __toESM(require("react"));
var import_ui10 = require("@elementor/ui");
function SectionsList(props) {
  return /* @__PURE__ */ React14.createElement(import_ui10.List, { disablePadding: true, component: "div", ...props });
}

// src/components/interactions-tab.tsx
var InteractionsTab = () => {
  const { element } = useElement();
  return /* @__PURE__ */ React15.createElement(SectionsList, null, /* @__PURE__ */ React15.createElement(import_editor_interactions.InteractionsTab, { elementId: element.id }));
};

// src/components/settings-tab.tsx
var React22 = __toESM(require("react"));
var import_session5 = require("@elementor/session");

// src/components/section.tsx
var React16 = __toESM(require("react"));
var import_react17 = require("react");
var import_editor_ui4 = require("@elementor/editor-ui");
var import_ui11 = require("@elementor/ui");
function Section({ title, children, defaultExpanded = false, titleEnd, unmountOnExit = true, action }) {
  const [isOpen, setIsOpen] = useStateByElement(title, !!defaultExpanded);
  const ref = (0, import_react17.useRef)(null);
  const isDisabled = !!action;
  const handleClick = () => {
    if (isDisabled) {
      action?.onClick();
    } else {
      setIsOpen(!isOpen);
    }
  };
  const id = (0, import_react17.useId)();
  const labelId = `label-${id}`;
  const contentId = `content-${id}`;
  return /* @__PURE__ */ React16.createElement(React16.Fragment, null, /* @__PURE__ */ React16.createElement(
    import_ui11.ListItemButton,
    {
      id: labelId,
      "aria-controls": contentId,
      "aria-label": `${title} section`,
      onClick: handleClick,
      sx: { "&:hover": { backgroundColor: "transparent" } }
    },
    /* @__PURE__ */ React16.createElement(import_ui11.Stack, { direction: "row", alignItems: "center", justifyItems: "start", flexGrow: 1, gap: 0.5 }, /* @__PURE__ */ React16.createElement(
      import_ui11.ListItemText,
      {
        secondary: title,
        secondaryTypographyProps: { color: "text.primary", variant: "caption", fontWeight: "bold" },
        sx: { flexGrow: 0, flexShrink: 1, marginInlineEnd: 1 }
      }
    ), (0, import_editor_ui4.getCollapsibleValue)(titleEnd, isOpen)),
    action?.component,
    /* @__PURE__ */ React16.createElement(
      import_editor_ui4.CollapseIcon,
      {
        open: isOpen,
        color: "secondary",
        fontSize: "tiny",
        disabled: isDisabled,
        sx: { ml: 1 }
      }
    )
  ), /* @__PURE__ */ React16.createElement(
    import_ui11.Collapse,
    {
      id: contentId,
      "aria-labelledby": labelId,
      in: isOpen,
      timeout: "auto",
      unmountOnExit
    },
    /* @__PURE__ */ React16.createElement(import_editor_ui4.SectionRefContext.Provider, { value: ref }, /* @__PURE__ */ React16.createElement(import_ui11.Stack, { ref, gap: 2.5, p: 2, "aria-label": `${title} section content` }, children))
  ), /* @__PURE__ */ React16.createElement(import_ui11.Divider, null));
}

// src/components/settings-control.tsx
var React21 = __toESM(require("react"));
var import_editor_controls4 = require("@elementor/editor-controls");
var import_ui14 = require("@elementor/ui");

// src/controls-registry/control.tsx
var React17 = __toESM(require("react"));

// src/controls-registry/controls-registry.tsx
var import_editor_controls = require("@elementor/editor-controls");
var import_editor_props4 = require("@elementor/editor-props");
var controlTypes = {
  image: { component: import_editor_controls.ImageControl, layout: "custom", propTypeUtil: import_editor_props4.imagePropTypeUtil },
  "svg-media": { component: import_editor_controls.SvgMediaControl, layout: "full", propTypeUtil: import_editor_props4.imageSrcPropTypeUtil },
  text: { component: import_editor_controls.TextControl, layout: "full", propTypeUtil: import_editor_props4.stringPropTypeUtil },
  textarea: { component: import_editor_controls.TextAreaControl, layout: "full", propTypeUtil: import_editor_props4.stringPropTypeUtil },
  size: { component: import_editor_controls.SizeControl, layout: "two-columns", propTypeUtil: import_editor_props4.sizePropTypeUtil },
  select: { component: import_editor_controls.SelectControlWrapper, layout: "two-columns", propTypeUtil: import_editor_props4.stringPropTypeUtil },
  chips: { component: import_editor_controls.ChipsControl, layout: "full", propTypeUtil: import_editor_props4.stringArrayPropTypeUtil },
  link: { component: import_editor_controls.LinkControl, layout: "custom", propTypeUtil: import_editor_props4.linkPropTypeUtil },
  query: { component: import_editor_controls.QueryControl, layout: "full", propTypeUtil: import_editor_props4.queryPropTypeUtil },
  url: { component: import_editor_controls.UrlControl, layout: "full", propTypeUtil: import_editor_props4.stringPropTypeUtil },
  switch: { component: import_editor_controls.SwitchControl, layout: "two-columns", propTypeUtil: import_editor_props4.booleanPropTypeUtil },
  number: { component: import_editor_controls.NumberControl, layout: "two-columns", propTypeUtil: import_editor_props4.numberPropTypeUtil },
  repeatable: { component: import_editor_controls.RepeatableControl, layout: "full", propTypeUtil: void 0 },
  "key-value": { component: import_editor_controls.KeyValueControl, layout: "full", propTypeUtil: import_editor_props4.keyValuePropTypeUtil },
  "html-tag": { component: import_editor_controls.HtmlTagControl, layout: "two-columns", propTypeUtil: import_editor_props4.stringPropTypeUtil },
  toggle: { component: import_editor_controls.ToggleControl, layout: "full", propTypeUtil: import_editor_props4.stringPropTypeUtil },
  "date-time": { component: import_editor_controls.DateTimeControl, layout: "full", propTypeUtil: import_editor_props4.DateTimePropTypeUtil },
  video: { component: import_editor_controls.VideoMediaControl, layout: "full", propTypeUtil: import_editor_props4.videoSrcPropTypeUtil },
  "inline-editing": { component: import_editor_controls.InlineEditingControl, layout: "full", propTypeUtil: import_editor_props4.htmlV3PropTypeUtil },
  email: { component: import_editor_controls.EmailFormActionControl, layout: "custom", propTypeUtil: import_editor_props4.emailPropTypeUtil }
};
var ControlsRegistry = class {
  constructor(controlsRegistry2) {
    this.controlsRegistry = controlsRegistry2;
    this.controlsRegistry = controlsRegistry2;
  }
  get(type) {
    return this.controlsRegistry[type]?.component;
  }
  getLayout(type) {
    return this.controlsRegistry[type]?.layout;
  }
  getPropTypeUtil(type) {
    return this.controlsRegistry[type]?.propTypeUtil;
  }
  registry() {
    return this.controlsRegistry;
  }
  register(type, component, layout, propTypeUtil) {
    if (this.controlsRegistry[type]) {
      throw new ControlTypeAlreadyRegisteredError({ context: { controlType: type } });
    }
    this.controlsRegistry[type] = { component, layout, propTypeUtil };
  }
  unregister(type) {
    if (!this.controlsRegistry[type]) {
      throw new ControlTypeNotRegisteredError({ context: { controlType: type } });
    }
    delete this.controlsRegistry[type];
  }
};
var controlsRegistry = new ControlsRegistry(controlTypes);

// src/controls-registry/control.tsx
var Control = ({ props, type }) => {
  const ControlByType = controlsRegistry.get(type);
  const { element } = useElement();
  if (!ControlByType) {
    throw new ControlTypeNotFoundError({
      context: { controlType: type }
    });
  }
  return /* @__PURE__ */ React17.createElement(ControlByType, { ...props, context: { elementId: element.id } });
};

// src/controls-registry/control-type-container.tsx
var React18 = __toESM(require("react"));
var import_ui12 = require("@elementor/ui");
var ControlTypeContainer = ({ children, layout }) => {
  if (layout === "custom") {
    return children;
  }
  return /* @__PURE__ */ React18.createElement(StyledContainer, { layout }, children);
};
var StyledContainer = (0, import_ui12.styled)(import_ui12.Box, {
  shouldForwardProp: (prop) => !["layout"].includes(prop)
})(({ layout, theme }) => ({
  display: "grid",
  gridGap: theme.spacing(1),
  ...getGridLayout(layout)
}));
var getGridLayout = (layout) => ({
  justifyContent: "space-between",
  ...getStyleByLayout(layout)
});
var getStyleByLayout = (layout) => {
  if (layout === "full") {
    return {
      gridTemplateColumns: "minmax(0, 1fr)"
    };
  }
  if (layout === "two-columns") {
    return {
      alignItems: "center",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))"
    };
  }
};

// src/controls-registry/settings-field.tsx
var React19 = __toESM(require("react"));
var import_react18 = require("react");
var import_editor_controls2 = require("@elementor/editor-controls");
var import_editor_documents2 = require("@elementor/editor-documents");
var import_editor_elements6 = require("@elementor/editor-elements");
var import_editor_props6 = require("@elementor/editor-props");
var import_editor_v1_adapters4 = require("@elementor/editor-v1-adapters");
var import_i18n7 = require("@wordpress/i18n");

// src/utils/prop-dependency-utils.ts
var import_editor_props5 = require("@elementor/editor-props");
var import_session4 = require("@elementor/session");
function extractOrderedDependencies(dependenciesPerTargetMapping) {
  return Object.values(dependenciesPerTargetMapping).flat().filter((dependent, index, self) => self.indexOf(dependent) === index);
}
function getUpdatedValues(values, dependencies, propsSchema, elementValues, elementId) {
  if (!dependencies.length) {
    return values;
  }
  return dependencies.reduce(
    (newValues, dependency) => {
      const path = dependency.split(".");
      const combinedValues = { ...elementValues, ...newValues };
      const propType = getPropType(propsSchema, combinedValues, path);
      if (!propType) {
        return newValues;
      }
      const testDependencies = {
        previousValues: (0, import_editor_props5.isDependencyMet)(propType.dependencies, elementValues),
        newValues: (0, import_editor_props5.isDependencyMet)(propType.dependencies, combinedValues)
      };
      if (!testDependencies.newValues.isMet) {
        const newValue = handleUnmetCondition({
          failingDependencies: testDependencies.newValues.failingDependencies,
          dependency,
          elementValues: combinedValues,
          defaultValue: propType.default,
          elementId
        });
        return {
          ...newValues,
          ...updateValue(path, newValue, combinedValues)
        };
      }
      if (!testDependencies.previousValues.isMet) {
        const savedValue = retrievePreviousValueFromStorage({ path: dependency, elementId });
        removePreviousValueFromStorage({ path: dependency, elementId });
        return {
          ...newValues,
          ...updateValue(path, savedValue ?? propType.default, combinedValues)
        };
      }
      return newValues;
    },
    { ...values }
  );
}
function getPropType(schema, elementValues, path) {
  if (!path.length) {
    return null;
  }
  const [basePropKey, ...keys] = path;
  const baseProp = schema[basePropKey];
  if (!baseProp) {
    return null;
  }
  return keys.reduce(
    (prop, key, index) => evaluatePropType({ prop, key, index, path, elementValues, basePropKey }),
    baseProp
  );
}
function evaluatePropType(props) {
  const { prop } = props;
  if (!prop?.kind) {
    return null;
  }
  const { key, index, path, elementValues, basePropKey } = props;
  switch (prop.kind) {
    case "union":
      const value = (0, import_editor_props5.extractValue)(path.slice(0, index + 1), elementValues);
      const type = value?.$$type ?? null;
      return getPropType(
        { [basePropKey]: prop.prop_types?.[type] },
        elementValues,
        path.slice(0, index + 2)
      );
    case "array":
      return prop.item_prop_type;
    case "object":
      return prop.shape[key];
  }
  return prop[key];
}
function updateValue(path, value, values) {
  const topPropKey = path[0];
  const newValue = { ...values };
  path.reduce((carry, key, index) => {
    if (!carry) {
      return null;
    }
    if (index === path.length - 1) {
      carry[key] = value ?? null;
      return carry[key]?.value ?? carry.value;
    }
    return carry[key]?.value ?? carry.value;
  }, newValue);
  return { [topPropKey]: newValue[topPropKey] ?? null };
}
function handleUnmetCondition(props) {
  const { failingDependencies, dependency, elementValues, defaultValue, elementId } = props;
  const termWithNewValue = failingDependencies.find(
    (term) => "newValue" in term && !!term.newValue
  );
  const newValue = termWithNewValue?.newValue ?? null;
  const currentValue = (0, import_editor_props5.extractValue)(dependency.split("."), elementValues) ?? defaultValue;
  savePreviousValueToStorage({
    path: dependency,
    elementId,
    value: currentValue
  });
  return newValue;
}
function savePreviousValueToStorage({ path, elementId, value }) {
  const prefix = `elementor/${elementId}`;
  const savedValue = retrievePreviousValueFromStorage({ path, elementId });
  if (savedValue) {
    return;
  }
  const key = `${prefix}:${path}`;
  (0, import_session4.setSessionStorageItem)(key, value);
}
function retrievePreviousValueFromStorage({ path, elementId }) {
  const prefix = `elementor/${elementId}`;
  const key = `${prefix}:${path}`;
  return (0, import_session4.getSessionStorageItem)(key) ?? null;
}
function removePreviousValueFromStorage({ path, elementId }) {
  const prefix = `elementor/${elementId}`;
  const key = `${prefix}:${path}`;
  (0, import_session4.removeSessionStorageItem)(key);
}

// src/controls-registry/create-top-level-object-type.ts
var createTopLevelObjectType = ({ schema }) => {
  const schemaPropType = {
    key: "",
    kind: "object",
    meta: {},
    settings: {},
    default: null,
    shape: schema
  };
  return schemaPropType;
};

// src/controls-registry/settings-field.tsx
var HISTORY_DEBOUNCE_WAIT2 = 800;
var getElementSettigsWithDefaults = (propsSchema, elementSettings) => {
  const elementSettingsWithDefaults = { ...elementSettings };
  Object.keys(propsSchema).forEach((key) => {
    if (!(key in elementSettingsWithDefaults)) {
      if (propsSchema[key].default !== null) {
        elementSettingsWithDefaults[key] = propsSchema[key].default;
      }
    }
  });
  return elementSettingsWithDefaults;
};
var extractDependencyEffect = (bind, propsSchema, currentElementSettings) => {
  const elementSettingsForDepCheck = getElementSettigsWithDefaults(propsSchema, currentElementSettings);
  const propType = propsSchema[bind];
  const depCheck = (0, import_editor_props6.isDependencyMet)(propType?.dependencies, elementSettingsForDepCheck);
  const isHidden = !depCheck.isMet && !(0, import_editor_props6.isDependency)(depCheck.failingDependencies[0]) && depCheck.failingDependencies[0]?.effect === "hide";
  return {
    isDisabled: (prop) => {
      const result = !(0, import_editor_props6.isDependencyMet)(prop?.dependencies, elementSettingsForDepCheck).isMet;
      return result;
    },
    isHidden,
    settingsWithDefaults: elementSettingsForDepCheck
  };
};
var SettingsField = ({ bind, children, propDisplayName }) => {
  const {
    element: { id: elementId },
    elementType: { propsSchema, dependenciesPerTargetMapping = {} },
    settings: currentElementSettings
  } = useElement();
  const value = { [bind]: currentElementSettings?.[bind] ?? null };
  const propType = createTopLevelObjectType({ schema: propsSchema });
  const undoableUpdateElementProp = useUndoableUpdateElementProp({
    elementId,
    propDisplayName
  });
  const { isDisabled, isHidden, settingsWithDefaults } = extractDependencyEffect(
    bind,
    propsSchema,
    currentElementSettings
  );
  if (isHidden) {
    return null;
  }
  const setValue = (newValue, _ = {}, meta) => {
    const { withHistory = true } = meta ?? {};
    const dependents = extractOrderedDependencies(dependenciesPerTargetMapping);
    const settings = getUpdatedValues(newValue, dependents, propsSchema, settingsWithDefaults, elementId);
    if (withHistory) {
      undoableUpdateElementProp(settings);
    } else {
      (0, import_editor_elements6.updateElementSettings)({ id: elementId, props: settings, withHistory: false });
    }
  };
  return /* @__PURE__ */ React19.createElement(import_editor_controls2.PropProvider, { propType, value, setValue, isDisabled }, /* @__PURE__ */ React19.createElement(import_editor_controls2.PropKeyProvider, { bind }, children));
};
function useUndoableUpdateElementProp({
  elementId,
  propDisplayName
}) {
  return (0, import_react18.useMemo)(() => {
    return (0, import_editor_v1_adapters4.undoable)(
      {
        do: (newSettings) => {
          const prevPropValue = (0, import_editor_elements6.getElementSettings)(elementId, Object.keys(newSettings));
          (0, import_editor_elements6.updateElementSettings)({ id: elementId, props: newSettings, withHistory: false });
          (0, import_editor_documents2.setDocumentModifiedStatus)(true);
          return prevPropValue;
        },
        undo: ({}, prevProps) => {
          (0, import_editor_elements6.updateElementSettings)({ id: elementId, props: prevProps, withHistory: false });
        }
      },
      {
        title: (0, import_editor_elements6.getElementLabel)(elementId),
        // translators: %s is the name of the property that was edited.
        subtitle: (0, import_i18n7.__)("%s edited", "elementor").replace("%s", propDisplayName),
        debounce: { wait: HISTORY_DEBOUNCE_WAIT2 }
      }
    );
  }, [elementId, propDisplayName]);
}

// src/field-indicators-registry.ts
var indicatorsRegistry = {
  settings: /* @__PURE__ */ new Map(),
  styles: /* @__PURE__ */ new Map()
};
var DEFAULT_PRIORITY2 = 10;
var FIELD_TYPE = {
  SETTINGS: "settings",
  STYLES: "styles"
};
var registerFieldIndicator = ({
  fieldType,
  id,
  indicator,
  priority = DEFAULT_PRIORITY2
}) => {
  indicatorsRegistry[fieldType].set(id, { id, indicator, priority });
};
var getFieldIndicators = (fieldType) => Array.from(indicatorsRegistry[fieldType].values()).sort((a, b) => a.priority - b.priority).map(({ id, indicator: Adornment }) => ({ id, Adornment }));

// src/components/control-label.tsx
var React20 = __toESM(require("react"));
var import_editor_controls3 = require("@elementor/editor-controls");
var import_ui13 = require("@elementor/ui");
var ControlLabel = ({ children }) => {
  return /* @__PURE__ */ React20.createElement(import_ui13.Stack, { direction: "row", alignItems: "center", justifyItems: "start", gap: 0.25 }, /* @__PURE__ */ React20.createElement(import_editor_controls3.ControlFormLabel, null, children), /* @__PURE__ */ React20.createElement(import_editor_controls3.ControlAdornments, null));
};

// src/components/settings-control.tsx
var Wrapper = (0, import_ui14.styled)("span")`
	display: contents;
`;
var SettingsControl = ({ control: { value, type } }) => {
  if (!controlsRegistry.get(value.type)) {
    return null;
  }
  const layout = value.meta?.layout || controlsRegistry.getLayout(value.type);
  const controlProps = populateChildControlProps(value.props);
  if (layout === "custom") {
    controlProps.label = value.label;
  }
  if (type === "element-control") {
    return /* @__PURE__ */ React21.createElement(ControlLayout, { control: value, layout, controlProps });
  }
  return /* @__PURE__ */ React21.createElement(SettingsField, { bind: value.bind, propDisplayName: value.label || value.bind }, /* @__PURE__ */ React21.createElement(ControlLayout, { control: value, layout, controlProps }));
};
var ControlLayout = ({
  control,
  layout,
  controlProps
}) => {
  const controlType = control.type;
  return /* @__PURE__ */ React21.createElement(import_editor_controls4.ControlAdornmentsProvider, { items: getFieldIndicators("settings") }, control.meta?.topDivider && /* @__PURE__ */ React21.createElement(import_ui14.Divider, null), /* @__PURE__ */ React21.createElement(Wrapper, { "data-type": "settings-field" }, /* @__PURE__ */ React21.createElement(ControlTypeContainer, { layout }, control.label && layout !== "custom" ? /* @__PURE__ */ React21.createElement(ControlLabel, null, control.label) : null, /* @__PURE__ */ React21.createElement(Control, { type: controlType, props: controlProps }))));
};
function populateChildControlProps(props) {
  if (props.childControlType) {
    const childComponent = controlsRegistry.get(props.childControlType);
    const childPropType = controlsRegistry.getPropTypeUtil(props.childControlType);
    props = {
      ...props,
      childControlConfig: {
        component: childComponent,
        props: props.childControlProps || {},
        propTypeUtil: childPropType
      }
    };
  }
  return props;
}

// src/components/settings-tab.tsx
var SettingsTab = () => {
  const { elementType, element } = useElement();
  const settingsDefault = useDefaultPanelSettings();
  const isDefaultExpanded = (sectionId) => settingsDefault.defaultSectionsExpanded.settings?.includes(sectionId);
  return /* @__PURE__ */ React22.createElement(import_session5.SessionStorageProvider, { prefix: element.id }, /* @__PURE__ */ React22.createElement(SectionsList, null, elementType.controls.map((control, index) => {
    if (isControl(control)) {
      return /* @__PURE__ */ React22.createElement(SettingsControl, { key: getKey(control, element), control });
    }
    const { type, value } = control;
    if (type === "section") {
      return /* @__PURE__ */ React22.createElement(
        Section,
        {
          title: value.label,
          key: type + "." + index,
          defaultExpanded: isDefaultExpanded(value.label)
        },
        value.items?.map((item) => {
          if (isControl(item)) {
            return /* @__PURE__ */ React22.createElement(SettingsControl, { key: getKey(item, element), control: item });
          }
          return null;
        })
      );
    }
    return null;
  })));
};
function getKey(control, element) {
  if (control.type === "control") {
    return control.value.bind + "." + element.id;
  }
  return control.value.type + "." + element.id;
}
function isControl(control) {
  return control.type === "control" || control.type === "element-control";
}

// src/components/style-tab.tsx
var React79 = __toESM(require("react"));
var import_react32 = require("react");
var import_editor_props14 = require("@elementor/editor-props");
var import_editor_responsive3 = require("@elementor/editor-responsive");
var import_locations3 = require("@elementor/locations");
var import_session7 = require("@elementor/session");
var import_ui34 = require("@elementor/ui");
var import_i18n53 = require("@wordpress/i18n");

// src/contexts/styles-inheritance-context.tsx
var React23 = __toESM(require("react"));
var import_react19 = require("react");
var import_editor_elements7 = require("@elementor/editor-elements");
var import_editor_props9 = require("@elementor/editor-props");
var import_editor_responsive2 = require("@elementor/editor-responsive");
var import_editor_styles5 = require("@elementor/editor-styles");
var import_editor_styles_repository12 = require("@elementor/editor-styles-repository");

// src/styles-inheritance/create-styles-inheritance.ts
var import_editor_props8 = require("@elementor/editor-props");

// src/styles-inheritance/create-snapshots-manager.ts
var import_editor_props7 = require("@elementor/editor-props");
var import_editor_variables = require("@elementor/editor-variables");

// src/styles-inheritance/utils.ts
var DEFAULT_STATE = "normal";
var DEFAULT_BREAKPOINT = "desktop";
var getStateKey = (state) => state ?? DEFAULT_STATE;
var getBreakpointKey = (breakpoint) => breakpoint ?? DEFAULT_BREAKPOINT;
var getValueFromInheritanceChain = (inheritanceChain, styleId, meta) => inheritanceChain.find(
  ({
    style,
    variant: {
      meta: { breakpoint, state }
    }
  }) => style.id === styleId && breakpoint === meta.breakpoint && state === meta.state
);

// src/styles-inheritance/create-snapshots-manager.ts
function createSnapshotsManager(getStylesByMeta, breakpointsRoot) {
  const breakpointsInheritancePaths = makeBreakpointsInheritancePaths(breakpointsRoot);
  const allBreakpointStatesSnapshots = {};
  const buildMissingSnapshotsForBreakpoint = (currentBreakpointId, parentBreakpoint, state) => {
    const currentBreakpointKey = getBreakpointKey(currentBreakpointId);
    const stateKey = getStateKey(state);
    if (!allBreakpointStatesSnapshots[currentBreakpointKey]) {
      allBreakpointStatesSnapshots[currentBreakpointKey] = {
        [DEFAULT_STATE]: buildStateSnapshotSlot(
          getStylesByMeta({ breakpoint: currentBreakpointId, state: null }),
          parentBreakpoint,
          {},
          null
        )
      };
    }
    if (state && !allBreakpointStatesSnapshots[currentBreakpointKey]?.[stateKey]) {
      allBreakpointStatesSnapshots[currentBreakpointKey][stateKey] = buildStateSnapshotSlot(
        getStylesByMeta({ breakpoint: currentBreakpointId, state }),
        parentBreakpoint,
        allBreakpointStatesSnapshots[currentBreakpointKey] ?? {},
        state
      );
    }
  };
  return (meta) => {
    const { breakpoint, state } = meta;
    const stateKey = getStateKey(state);
    const breakpointKey = getBreakpointKey(breakpoint);
    if (allBreakpointStatesSnapshots[breakpointKey]?.[stateKey]) {
      return allBreakpointStatesSnapshots[breakpointKey]?.[stateKey]?.snapshot;
    }
    const breakpointsChain = [...breakpointsInheritancePaths[breakpointKey], breakpoint];
    breakpointsChain.forEach((breakpointId, index) => {
      const parentBreakpointId = index > 0 ? breakpointsChain[index - 1] : null;
      buildMissingSnapshotsForBreakpoint(
        breakpointId,
        parentBreakpointId ? allBreakpointStatesSnapshots[parentBreakpointId] : void 0,
        state
      );
    });
    return allBreakpointStatesSnapshots[breakpointKey]?.[stateKey]?.snapshot;
  };
}
function makeBreakpointsInheritancePaths(root) {
  const breakpoints = {};
  const traverse = (node, parent) => {
    const { id, children } = node;
    breakpoints[id] = parent ? [...parent] : [];
    children?.forEach((child) => {
      traverse(child, [...breakpoints[id] ?? [], id]);
    });
  };
  traverse(root);
  return breakpoints;
}
function buildStateSnapshotSlot(styles, parentBreakpoint, currentBreakpoint, state) {
  const initialSlot = buildInitialSnapshotFromStyles(styles);
  if (!state) {
    return {
      snapshot: mergeSnapshots([initialSlot.snapshot, parentBreakpoint?.[DEFAULT_STATE]?.snapshot]),
      stateSpecificSnapshot: void 0
    };
  }
  return {
    snapshot: mergeSnapshots([
      initialSlot.snapshot,
      parentBreakpoint?.[state]?.stateSpecificSnapshot,
      currentBreakpoint[DEFAULT_STATE]?.snapshot
    ]),
    stateSpecificSnapshot: mergeSnapshots([
      initialSlot.stateSpecificSnapshot,
      parentBreakpoint?.[state]?.stateSpecificSnapshot
    ])
  };
}
function buildInitialSnapshotFromStyles(styles) {
  const snapshot = {};
  styles.forEach((styleData) => {
    const {
      variant: { props }
    } = styleData;
    Object.entries(props).forEach(([key, value]) => {
      const filteredValue = (0, import_editor_props7.filterEmptyValues)(value);
      const filteredVariableValue = filteredValue?.$$type?.includes("variable") && !(0, import_editor_variables.hasVariable)(filteredValue?.value) ? null : filteredValue;
      if (filteredVariableValue === null) {
        return;
      }
      if (!snapshot[key]) {
        snapshot[key] = [];
      }
      const snapshotPropValue = {
        ...styleData,
        value: filteredVariableValue
      };
      snapshot[key].push(snapshotPropValue);
    });
  });
  return {
    snapshot,
    stateSpecificSnapshot: snapshot
  };
}
function mergeSnapshots(snapshots) {
  const snapshot = {};
  snapshots.filter(Boolean).forEach(
    (currentSnapshot) => Object.entries(currentSnapshot).forEach(([key, values]) => {
      if (!snapshot[key]) {
        snapshot[key] = [];
      }
      snapshot[key] = snapshot[key].concat(values);
    })
  );
  return snapshot;
}

// src/styles-inheritance/create-styles-inheritance.ts
function createStylesInheritance(styleDefs, breakpointsRoot) {
  const styleVariantsByMeta = buildStyleVariantsByMetaMapping(styleDefs);
  const getStyles = ({ breakpoint, state }) => styleVariantsByMeta?.[getBreakpointKey(breakpoint)]?.[getStateKey(state)] ?? [];
  return {
    getSnapshot: createSnapshotsManager(getStyles, breakpointsRoot),
    getInheritanceChain: (snapshot, path, topLevelPropType) => {
      const [field, ...nextFields] = path;
      let inheritanceChain = snapshot[field] ?? [];
      if (nextFields.length > 0) {
        const filterPropType = getFilterPropType(topLevelPropType, nextFields);
        inheritanceChain = inheritanceChain.map(({ value: styleValue, ...rest }) => ({
          ...rest,
          value: getValueByPath(styleValue, nextFields, filterPropType)
        })).filter(({ value: styleValue }) => !(0, import_editor_props8.isEmpty)(styleValue));
      }
      return inheritanceChain;
    }
  };
}
function buildStyleVariantsByMetaMapping(styleDefs) {
  const breakpointStateSlots = {};
  styleDefs.forEach((styleDef) => {
    const provider = getProviderByStyleId(styleDef.id)?.getKey() ?? null;
    styleDef.variants.forEach((variant) => {
      const { meta } = variant;
      const { state, breakpoint } = meta;
      const breakpointKey = getBreakpointKey(breakpoint);
      const stateKey = getStateKey(state);
      if (!breakpointStateSlots[breakpointKey]) {
        breakpointStateSlots[breakpointKey] = {};
      }
      const breakpointNode = breakpointStateSlots[breakpointKey];
      if (!breakpointNode[stateKey]) {
        breakpointNode[stateKey] = [];
      }
      breakpointNode[stateKey].push({
        style: styleDef,
        variant,
        provider
      });
    });
  });
  return breakpointStateSlots;
}
function getValueByPath(value, path, filterPropType) {
  if (!value || typeof value !== "object") {
    return null;
  }
  if (shouldUseOriginalValue(filterPropType, value)) {
    return value;
  }
  return path.reduce((currentScope, key) => {
    if (!currentScope) {
      return null;
    }
    if ((0, import_editor_props8.isTransformable)(currentScope)) {
      return currentScope.value?.[key] ?? null;
    }
    if (typeof currentScope === "object") {
      return currentScope[key] ?? null;
    }
    return null;
  }, value);
}
function shouldUseOriginalValue(filterPropType, value) {
  return !!filterPropType && (0, import_editor_props8.isTransformable)(value) && filterPropType.key !== value.$$type;
}
var getFilterPropType = (propType, path) => {
  if (!propType || propType.kind !== "union") {
    return null;
  }
  return Object.values(propType.prop_types).find((type) => {
    return !!path.reduce((currentScope, key) => {
      if (currentScope?.kind !== "object") {
        return null;
      }
      const { shape } = currentScope;
      if (shape[key]) {
        return shape[key];
      }
      return null;
    }, type);
  }) ?? null;
};

// src/contexts/styles-inheritance-context.tsx
var Context4 = (0, import_react19.createContext)(null);
function StyleInheritanceProvider({ children }) {
  const styleDefs = useAppliedStyles();
  const breakpointsTree = (0, import_editor_responsive2.getBreakpointsTree)();
  const { getSnapshot, getInheritanceChain } = createStylesInheritance(styleDefs, breakpointsTree);
  return /* @__PURE__ */ React23.createElement(Context4.Provider, { value: { getSnapshot, getInheritanceChain } }, children);
}
function useStylesInheritanceSnapshot() {
  const context = (0, import_react19.useContext)(Context4);
  const { meta } = useStyle();
  if (!context) {
    throw new Error("useStylesInheritanceSnapshot must be used within a StyleInheritanceProvider");
  }
  if (!meta) {
    return null;
  }
  return context.getSnapshot(meta) ?? null;
}
function useStylesInheritanceChain(path) {
  const context = (0, import_react19.useContext)(Context4);
  if (!context) {
    throw new Error("useStylesInheritanceChain must be used within a StyleInheritanceProvider");
  }
  const schema = (0, import_editor_styles5.getStylesSchema)();
  const topLevelPropType = schema?.[path[0]];
  const snapshot = useStylesInheritanceSnapshot();
  if (!snapshot) {
    return [];
  }
  return context.getInheritanceChain(snapshot, path, topLevelPropType);
}
var useAppliedStyles = () => {
  const currentClassesProp = useClassesProp();
  const baseStyles = useBaseStyles();
  useStylesRerender();
  const classesProp = usePanelElementSetting(currentClassesProp);
  const appliedStyles = import_editor_props9.classesPropTypeUtil.extract(classesProp) ?? [];
  return import_editor_styles_repository12.stylesRepository.all().filter((style) => [...baseStyles, ...appliedStyles].includes(style.id));
};
var useBaseStyles = () => {
  const { elementType } = useElement();
  const widgetsCache = (0, import_editor_elements7.getWidgetsCache)();
  const widgetCache = widgetsCache?.[elementType.key];
  return Object.keys(widgetCache?.base_styles ?? {});
};

// src/hooks/use-active-style-def-id.ts
var import_editor_elements8 = require("@elementor/editor-elements");
function useActiveStyleDefId(classProp) {
  const [activeStyledDefId, setActiveStyledDefId] = useStateByElement(
    "active-style-id",
    null
  );
  const appliedClassesIds = usePanelElementSetting(classProp)?.value || [];
  const fallback = useFirstAppliedClass(appliedClassesIds);
  const activeAndAppliedClassId = useActiveAndAppliedClassId(activeStyledDefId, appliedClassesIds);
  return [activeAndAppliedClassId || fallback?.id || null, setActiveStyledDefId];
}
function useFirstAppliedClass(appliedClassesIds) {
  const { element } = useElement();
  const stylesDefs = (0, import_editor_elements8.getElementStyles)(element.id) ?? {};
  return Object.values(stylesDefs).find((styleDef) => appliedClassesIds.includes(styleDef.id));
}
function useActiveAndAppliedClassId(id, appliedClassesIds) {
  const isClassApplied = !!id && appliedClassesIds.includes(id);
  return isClassApplied ? id : null;
}

// src/components/style-sections/background-section/background-section.tsx
var React26 = __toESM(require("react"));
var import_editor_controls7 = require("@elementor/editor-controls");
var import_i18n8 = require("@wordpress/i18n");

// src/controls-registry/styles-field.tsx
var React24 = __toESM(require("react"));
var import_editor_controls6 = require("@elementor/editor-controls");
var import_editor_styles6 = require("@elementor/editor-styles");

// src/hooks/use-styles-field.ts
function useStylesField(propName, meta) {
  const { values, setValues, canEdit } = useStylesFields([propName]);
  const value = values?.[propName] ?? null;
  const setValue = (newValue) => {
    setValues({ [propName]: newValue }, meta);
  };
  return { value, setValue, canEdit };
}

// src/controls-registry/conditional-field.tsx
var import_editor_controls5 = require("@elementor/editor-controls");
var import_editor_props10 = require("@elementor/editor-props");
var ConditionalField = ({ children }) => {
  const { propType } = (0, import_editor_controls5.useBoundProp)();
  const depList = getDependencies(propType);
  const { values: depValues } = useStylesFields(depList);
  const isHidden = !(0, import_editor_props10.isDependencyMet)(propType?.dependencies, depValues).isMet;
  return isHidden ? null : children;
};
function getDependencies(propType) {
  if (!propType?.dependencies?.terms.length) {
    return [];
  }
  return propType.dependencies.terms.flatMap((term) => !(0, import_editor_props10.isDependency)(term) ? term.path : []);
}

// src/controls-registry/styles-field.tsx
var StylesField = ({ bind, propDisplayName, children }) => {
  const stylesSchema = (0, import_editor_styles6.getStylesSchema)();
  const stylesInheritanceChain = useStylesInheritanceChain([bind]);
  const { value, canEdit, ...fields } = useStylesField(bind, { history: { propDisplayName } });
  const propType = createTopLevelObjectType({ schema: stylesSchema });
  const [actualValue] = stylesInheritanceChain;
  const placeholderValues = {
    [bind]: actualValue?.value
  };
  const setValue = (newValue) => {
    fields.setValue(newValue[bind]);
  };
  return /* @__PURE__ */ React24.createElement(import_editor_controls6.ControlAdornmentsProvider, { items: getFieldIndicators("styles") }, /* @__PURE__ */ React24.createElement(
    import_editor_controls6.PropProvider,
    {
      propType,
      value: { [bind]: value },
      setValue,
      placeholder: placeholderValues,
      isDisabled: () => !canEdit
    },
    /* @__PURE__ */ React24.createElement(import_editor_controls6.PropKeyProvider, { bind }, /* @__PURE__ */ React24.createElement(ConditionalField, null, children))
  ));
};

// src/components/section-content.tsx
var React25 = __toESM(require("react"));
var import_ui15 = require("@elementor/ui");
var SectionContent = ({ gap = 2, sx, children, "aria-label": ariaLabel }) => /* @__PURE__ */ React25.createElement(import_ui15.Stack, { gap, sx: { ...sx }, "aria-label": ariaLabel }, children);

// src/components/style-sections/background-section/background-section.tsx
var BACKGROUND_LABEL = (0, import_i18n8.__)("Background", "elementor");
var BackgroundSection = () => {
  return /* @__PURE__ */ React26.createElement(SectionContent, null, /* @__PURE__ */ React26.createElement(StylesField, { bind: "background", propDisplayName: BACKGROUND_LABEL }, /* @__PURE__ */ React26.createElement(import_editor_controls7.BackgroundControl, null)));
};

// src/components/style-sections/border-section/border-section.tsx
var React33 = __toESM(require("react"));

// src/components/style-sections/border-section/border-color-field.tsx
var React28 = __toESM(require("react"));
var import_editor_controls8 = require("@elementor/editor-controls");
var import_i18n9 = require("@wordpress/i18n");

// src/components/styles-field-layout.tsx
var React27 = __toESM(require("react"));
var import_ui16 = require("@elementor/ui");
var StylesFieldLayout = React27.forwardRef((props, ref) => {
  const { direction = "row", children, label } = props;
  const LayoutComponent = direction === "row" ? Row : Column;
  return /* @__PURE__ */ React27.createElement(LayoutComponent, { label, ref, children });
});
var Row = React27.forwardRef(
  ({ label, children }, ref) => {
    return /* @__PURE__ */ React27.createElement(
      import_ui16.Grid,
      {
        container: true,
        gap: 2,
        alignItems: "center",
        flexWrap: "nowrap",
        ref,
        "aria-label": `${label} control`
      },
      /* @__PURE__ */ React27.createElement(import_ui16.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React27.createElement(ControlLabel, null, label)),
      /* @__PURE__ */ React27.createElement(
        import_ui16.Grid,
        {
          item: true,
          xs: 6,
          sx: (theme) => ({
            width: `calc(50% - ${theme.spacing(2)})`
          })
        },
        children
      )
    );
  }
);
var Column = React27.forwardRef(
  ({ label, children }, ref) => {
    return /* @__PURE__ */ React27.createElement(import_ui16.Stack, { gap: 0.75, ref }, /* @__PURE__ */ React27.createElement(ControlLabel, null, label), children);
  }
);

// src/components/style-sections/border-section/border-color-field.tsx
var BORDER_COLOR_LABEL = (0, import_i18n9.__)("Border color", "elementor");
var BorderColorField = () => /* @__PURE__ */ React28.createElement(StylesField, { bind: "border-color", propDisplayName: BORDER_COLOR_LABEL }, /* @__PURE__ */ React28.createElement(StylesFieldLayout, { label: BORDER_COLOR_LABEL }, /* @__PURE__ */ React28.createElement(import_editor_controls8.ColorControl, null)));

// src/components/style-sections/border-section/border-radius-field.tsx
var React30 = __toESM(require("react"));
var import_editor_controls9 = require("@elementor/editor-controls");
var import_editor_props11 = require("@elementor/editor-props");
var import_icons3 = require("@elementor/icons");
var import_ui19 = require("@elementor/ui");
var import_i18n10 = require("@wordpress/i18n");

// src/hooks/use-direction.ts
var import_editor_v1_adapters5 = require("@elementor/editor-v1-adapters");
var import_ui17 = require("@elementor/ui");
function useDirection() {
  const theme = (0, import_ui17.useTheme)();
  const isUiRtl = "rtl" === theme.direction, isSiteRtl = !!(0, import_editor_v1_adapters5.getElementorFrontendConfig)()?.is_rtl;
  return { isSiteRtl, isUiRtl };
}

// src/styles-inheritance/components/ui-providers.tsx
var React29 = __toESM(require("react"));
var import_ui18 = require("@elementor/ui");
var UiProviders = ({ children }) => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React29.createElement(import_ui18.DirectionProvider, { rtl: isSiteRtl }, /* @__PURE__ */ React29.createElement(import_ui18.ThemeProvider, null, children));
};

// src/components/style-sections/border-section/border-radius-field.tsx
var BORDER_RADIUS_LABEL = (0, import_i18n10.__)("Border radius", "elementor");
var StartStartIcon = (0, import_ui19.withDirection)(import_icons3.RadiusTopLeftIcon);
var StartEndIcon = (0, import_ui19.withDirection)(import_icons3.RadiusTopRightIcon);
var EndStartIcon = (0, import_ui19.withDirection)(import_icons3.RadiusBottomLeftIcon);
var EndEndIcon = (0, import_ui19.withDirection)(import_icons3.RadiusBottomRightIcon);
var getStartStartLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n10.__)("Top right", "elementor") : (0, import_i18n10.__)("Top left", "elementor");
var getStartStartAriaLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n10.__)("Border top right radius", "elementor") : (0, import_i18n10.__)("Border top left radius", "elementor");
var getStartEndLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n10.__)("Top left", "elementor") : (0, import_i18n10.__)("Top right", "elementor");
var getStartEndAriaLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n10.__)("Border top left radius", "elementor") : (0, import_i18n10.__)("Border top right radius", "elementor");
var getEndStartLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n10.__)("Bottom right", "elementor") : (0, import_i18n10.__)("Bottom left", "elementor");
var getEndStartAriaLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n10.__)("Border bottom right radius", "elementor") : (0, import_i18n10.__)("Border bottom left radius", "elementor");
var getEndEndLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n10.__)("Bottom left", "elementor") : (0, import_i18n10.__)("Bottom right", "elementor");
var getEndEndAriaLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n10.__)("Border bottom left radius", "elementor") : (0, import_i18n10.__)("Border bottom right radius", "elementor");
var getCorners = (isSiteRtl) => [
  {
    label: getStartStartLabel(isSiteRtl),
    ariaLabel: getStartStartAriaLabel(isSiteRtl),
    icon: /* @__PURE__ */ React30.createElement(StartStartIcon, { fontSize: "tiny" }),
    bind: "start-start"
  },
  {
    label: getStartEndLabel(isSiteRtl),
    ariaLabel: getStartEndAriaLabel(isSiteRtl),
    icon: /* @__PURE__ */ React30.createElement(StartEndIcon, { fontSize: "tiny" }),
    bind: "start-end"
  },
  {
    label: getEndStartLabel(isSiteRtl),
    ariaLabel: getEndStartAriaLabel(isSiteRtl),
    icon: /* @__PURE__ */ React30.createElement(EndStartIcon, { fontSize: "tiny" }),
    bind: "end-start"
  },
  {
    label: getEndEndLabel(isSiteRtl),
    ariaLabel: getEndEndAriaLabel(isSiteRtl),
    icon: /* @__PURE__ */ React30.createElement(EndEndIcon, { fontSize: "tiny" }),
    bind: "end-end"
  }
];
var BorderRadiusField = () => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React30.createElement(UiProviders, null, /* @__PURE__ */ React30.createElement(StylesField, { bind: "border-radius", propDisplayName: BORDER_RADIUS_LABEL }, /* @__PURE__ */ React30.createElement(
    import_editor_controls9.EqualUnequalSizesControl,
    {
      items: getCorners(isSiteRtl),
      label: BORDER_RADIUS_LABEL,
      icon: /* @__PURE__ */ React30.createElement(import_icons3.BorderCornersIcon, { fontSize: "tiny" }),
      tooltipLabel: (0, import_i18n10.__)("Adjust corners", "elementor"),
      multiSizePropTypeUtil: import_editor_props11.borderRadiusPropTypeUtil
    }
  )));
};

// src/components/style-sections/border-section/border-style-field.tsx
var React31 = __toESM(require("react"));
var import_editor_controls10 = require("@elementor/editor-controls");
var import_i18n11 = require("@wordpress/i18n");
var BORDER_TYPE_LABEL = (0, import_i18n11.__)("Border type", "elementor");
var borderStyles = [
  { value: "none", label: (0, import_i18n11.__)("None", "elementor") },
  { value: "solid", label: (0, import_i18n11.__)("Solid", "elementor") },
  { value: "dashed", label: (0, import_i18n11.__)("Dashed", "elementor") },
  { value: "dotted", label: (0, import_i18n11.__)("Dotted", "elementor") },
  { value: "double", label: (0, import_i18n11.__)("Double", "elementor") },
  { value: "groove", label: (0, import_i18n11.__)("Groove", "elementor") },
  { value: "ridge", label: (0, import_i18n11.__)("Ridge", "elementor") },
  { value: "inset", label: (0, import_i18n11.__)("Inset", "elementor") },
  { value: "outset", label: (0, import_i18n11.__)("Outset", "elementor") }
];
var BorderStyleField = () => /* @__PURE__ */ React31.createElement(StylesField, { bind: "border-style", propDisplayName: BORDER_TYPE_LABEL }, /* @__PURE__ */ React31.createElement(StylesFieldLayout, { label: BORDER_TYPE_LABEL }, /* @__PURE__ */ React31.createElement(import_editor_controls10.SelectControl, { options: borderStyles })));

// src/components/style-sections/border-section/border-width-field.tsx
var React32 = __toESM(require("react"));
var import_editor_controls11 = require("@elementor/editor-controls");
var import_editor_props12 = require("@elementor/editor-props");
var import_icons4 = require("@elementor/icons");
var import_ui20 = require("@elementor/ui");
var import_i18n12 = require("@wordpress/i18n");
var BORDER_WIDTH_LABEL = (0, import_i18n12.__)("Border width", "elementor");
var InlineStartIcon = (0, import_ui20.withDirection)(import_icons4.SideRightIcon);
var InlineEndIcon = (0, import_ui20.withDirection)(import_icons4.SideLeftIcon);
var getEdges = (isSiteRtl) => [
  {
    label: (0, import_i18n12.__)("Top", "elementor"),
    ariaLabel: (0, import_i18n12.__)("Border top width", "elementor"),
    icon: /* @__PURE__ */ React32.createElement(import_icons4.SideTopIcon, { fontSize: "tiny" }),
    bind: "block-start"
  },
  {
    label: isSiteRtl ? (0, import_i18n12.__)("Left", "elementor") : (0, import_i18n12.__)("Right", "elementor"),
    ariaLabel: isSiteRtl ? (0, import_i18n12.__)("Border left width", "elementor") : (0, import_i18n12.__)("Border right width", "elementor"),
    icon: /* @__PURE__ */ React32.createElement(InlineStartIcon, { fontSize: "tiny" }),
    bind: "inline-end"
  },
  {
    label: (0, import_i18n12.__)("Bottom", "elementor"),
    ariaLabel: (0, import_i18n12.__)("Border bottom width", "elementor"),
    icon: /* @__PURE__ */ React32.createElement(import_icons4.SideBottomIcon, { fontSize: "tiny" }),
    bind: "block-end"
  },
  {
    label: isSiteRtl ? (0, import_i18n12.__)("Right", "elementor") : (0, import_i18n12.__)("Left", "elementor"),
    ariaLabel: isSiteRtl ? (0, import_i18n12.__)("Border right width", "elementor") : (0, import_i18n12.__)("Border left width", "elementor"),
    icon: /* @__PURE__ */ React32.createElement(InlineEndIcon, { fontSize: "tiny" }),
    bind: "inline-start"
  }
];
var BorderWidthField = () => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React32.createElement(StylesField, { bind: "border-width", propDisplayName: BORDER_WIDTH_LABEL }, /* @__PURE__ */ React32.createElement(
    import_editor_controls11.EqualUnequalSizesControl,
    {
      items: getEdges(isSiteRtl),
      label: BORDER_WIDTH_LABEL,
      icon: /* @__PURE__ */ React32.createElement(import_icons4.SideAllIcon, { fontSize: "tiny" }),
      tooltipLabel: (0, import_i18n12.__)("Adjust borders", "elementor"),
      multiSizePropTypeUtil: import_editor_props12.borderWidthPropTypeUtil
    }
  ));
};

// src/components/style-sections/border-section/border-section.tsx
var BorderSection = () => /* @__PURE__ */ React33.createElement(SectionContent, null, /* @__PURE__ */ React33.createElement(BorderWidthField, null), /* @__PURE__ */ React33.createElement(BorderColorField, null), /* @__PURE__ */ React33.createElement(BorderStyleField, null), /* @__PURE__ */ React33.createElement(BorderRadiusField, null));

// src/components/style-sections/effects-section/effects-section.tsx
var React37 = __toESM(require("react"));
var import_editor_controls14 = require("@elementor/editor-controls");
var import_i18n15 = require("@wordpress/i18n");

// src/utils/can-element-have-children.ts
var import_editor_elements9 = require("@elementor/editor-elements");
var canElementHaveChildren = (elementId) => {
  const container = (0, import_editor_elements9.getContainer)(elementId);
  if (!container) {
    return false;
  }
  return container.model.get("elType") !== "widget";
};

// src/utils/get-recently-used-styles.ts
var import_editor_canvas = require("@elementor/editor-canvas");
var import_editor_elements10 = require("@elementor/editor-elements");
var import_editor_styles7 = require("@elementor/editor-styles");
var getRecentlyUsedList = async (elementId) => {
  if (!elementId) {
    return [];
  }
  const resolver = (0, import_editor_canvas.createPropsResolver)({
    transformers: import_editor_canvas.styleTransformersRegistry,
    schema: (0, import_editor_styles7.getStylesSchema)()
  });
  const styles = (0, import_editor_elements10.getElementStyles)(elementId) ?? {};
  const styleKeys = Object.keys(styles ?? {});
  const variants = styleKeys.map((key) => styles?.[key]?.variants ?? []);
  const resolved = await Promise.all(
    variants.flat().map(async (variant) => {
      const result = await resolver({
        props: variant.props ?? {},
        schema: (0, import_editor_styles7.getStylesSchema)()
      });
      return Object.entries(result).filter(([, value]) => value !== null).map(([key]) => key);
    })
  );
  const propSet = new Set(resolved.flat());
  return Array.from(propSet);
};

// src/components/panel-divider.tsx
var React34 = __toESM(require("react"));
var import_ui21 = require("@elementor/ui");
var PanelDivider = () => /* @__PURE__ */ React34.createElement(import_ui21.Divider, { sx: { my: 0.5 } });

// src/components/style-sections/effects-section/blend-mode-field.tsx
var React35 = __toESM(require("react"));
var import_editor_controls12 = require("@elementor/editor-controls");
var import_i18n13 = require("@wordpress/i18n");
var BLEND_MODE_LABEL = (0, import_i18n13.__)("Blend mode", "elementor");
var blendModeOptions = [
  { label: (0, import_i18n13.__)("Normal", "elementor"), value: "normal" },
  { label: (0, import_i18n13.__)("Multiply", "elementor"), value: "multiply" },
  { label: (0, import_i18n13.__)("Screen", "elementor"), value: "screen" },
  { label: (0, import_i18n13.__)("Overlay", "elementor"), value: "overlay" },
  { label: (0, import_i18n13.__)("Darken", "elementor"), value: "darken" },
  { label: (0, import_i18n13.__)("Lighten", "elementor"), value: "lighten" },
  { label: (0, import_i18n13.__)("Color dodge", "elementor"), value: "color-dodge" },
  { label: (0, import_i18n13.__)("Color burn", "elementor"), value: "color-burn" },
  { label: (0, import_i18n13.__)("Saturation", "elementor"), value: "saturation" },
  { label: (0, import_i18n13.__)("Color", "elementor"), value: "color" },
  { label: (0, import_i18n13.__)("Difference", "elementor"), value: "difference" },
  { label: (0, import_i18n13.__)("Exclusion", "elementor"), value: "exclusion" },
  { label: (0, import_i18n13.__)("Hue", "elementor"), value: "hue" },
  { label: (0, import_i18n13.__)("Luminosity", "elementor"), value: "luminosity" },
  { label: (0, import_i18n13.__)("Soft light", "elementor"), value: "soft-light" },
  { label: (0, import_i18n13.__)("Hard light", "elementor"), value: "hard-light" }
];
var BlendModeField = () => {
  return /* @__PURE__ */ React35.createElement(StylesField, { bind: "mix-blend-mode", propDisplayName: BLEND_MODE_LABEL }, /* @__PURE__ */ React35.createElement(StylesFieldLayout, { label: BLEND_MODE_LABEL }, /* @__PURE__ */ React35.createElement(import_editor_controls12.SelectControl, { options: blendModeOptions })));
};

// src/components/style-sections/effects-section/opacity-control-field.tsx
var React36 = __toESM(require("react"));
var import_react20 = require("react");
var import_editor_controls13 = require("@elementor/editor-controls");
var import_i18n14 = require("@wordpress/i18n");
var OPACITY_LABEL = (0, import_i18n14.__)("Opacity", "elementor");
var OpacityControlField = () => {
  const rowRef = (0, import_react20.useRef)(null);
  return /* @__PURE__ */ React36.createElement(StylesField, { bind: "opacity", propDisplayName: OPACITY_LABEL }, /* @__PURE__ */ React36.createElement(StylesFieldLayout, { ref: rowRef, label: OPACITY_LABEL }, /* @__PURE__ */ React36.createElement(import_editor_controls13.SizeControl, { units: ["%"], anchorRef: rowRef, defaultUnit: "%" })));
};

// src/components/style-sections/effects-section/effects-section.tsx
var BOX_SHADOW_LABEL = (0, import_i18n15.__)("Box shadow", "elementor");
var FILTER_LABEL = (0, import_i18n15.__)("Filters", "elementor");
var TRANSFORM_LABEL = (0, import_i18n15.__)("Transform", "elementor");
var BACKDROP_FILTER_LABEL = (0, import_i18n15.__)("Backdrop filters", "elementor");
var TRANSITIONS_LABEL = (0, import_i18n15.__)("Transitions", "elementor");
var EffectsSection = () => {
  const { element } = useElement();
  const { meta } = useStyle();
  const canHaveChildren = canElementHaveChildren(element?.id ?? "");
  return /* @__PURE__ */ React37.createElement(SectionContent, { gap: 1 }, /* @__PURE__ */ React37.createElement(BlendModeField, null), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(OpacityControlField, null), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(StylesField, { bind: "box-shadow", propDisplayName: BOX_SHADOW_LABEL }, /* @__PURE__ */ React37.createElement(import_editor_controls14.BoxShadowRepeaterControl, null)), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(StylesField, { bind: "transform", propDisplayName: TRANSFORM_LABEL }, /* @__PURE__ */ React37.createElement(import_editor_controls14.TransformRepeaterControl, { showChildrenPerspective: canHaveChildren })), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(StylesField, { bind: "transition", propDisplayName: TRANSITIONS_LABEL }, /* @__PURE__ */ React37.createElement(
    import_editor_controls14.TransitionRepeaterControl,
    {
      currentStyleState: meta.state,
      recentlyUsedListGetter: () => getRecentlyUsedList(element?.id ?? "")
    }
  )), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(StylesField, { bind: "filter", propDisplayName: FILTER_LABEL }, /* @__PURE__ */ React37.createElement(import_editor_controls14.FilterRepeaterControl, null)), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(StylesField, { bind: "backdrop-filter", propDisplayName: BACKDROP_FILTER_LABEL }, /* @__PURE__ */ React37.createElement(import_editor_controls14.FilterRepeaterControl, { filterPropName: "backdrop-filter" })));
};

// src/components/style-sections/layout-section/layout-section.tsx
var React49 = __toESM(require("react"));
var import_editor_controls25 = require("@elementor/editor-controls");
var import_editor_elements11 = require("@elementor/editor-elements");
var import_i18n27 = require("@wordpress/i18n");

// src/hooks/use-computed-style.ts
var import_editor_v1_adapters6 = require("@elementor/editor-v1-adapters");
function useComputedStyle(elementId) {
  return (0, import_editor_v1_adapters6.__privateUseListenTo)(
    [
      (0, import_editor_v1_adapters6.windowEvent)("elementor/device-mode/change"),
      (0, import_editor_v1_adapters6.commandEndEvent)("document/elements/reset-style"),
      (0, import_editor_v1_adapters6.commandEndEvent)("document/elements/settings"),
      (0, import_editor_v1_adapters6.commandEndEvent)("document/elements/paste-style")
    ],
    () => {
      if (!elementId) {
        return null;
      }
      const element = window.elementor?.getContainer?.(elementId);
      if (!element?.view?.el) {
        return null;
      }
      const resp = window.getComputedStyle(element.view.el);
      return resp;
    }
  );
}

// src/components/style-sections/layout-section/align-content-field.tsx
var React39 = __toESM(require("react"));
var import_editor_controls15 = require("@elementor/editor-controls");
var import_icons5 = require("@elementor/icons");
var import_ui23 = require("@elementor/ui");
var import_i18n17 = require("@wordpress/i18n");

// src/components/style-sections/layout-section/utils/rotated-icon.tsx
var React38 = __toESM(require("react"));
var import_react21 = require("react");
var import_ui22 = require("@elementor/ui");
var import_i18n16 = require("@wordpress/i18n");
var FLEX_DIRECTION_LABEL = (0, import_i18n16.__)("Flex direction", "elementor");
var CLOCKWISE_ANGLES = {
  row: 0,
  column: 90,
  "row-reverse": 180,
  "column-reverse": 270
};
var COUNTER_CLOCKWISE_ANGLES = {
  row: 0,
  column: -90,
  "row-reverse": -180,
  "column-reverse": -270
};
var RotatedIcon = ({
  icon: Icon,
  size,
  isClockwise = true,
  offset = 0,
  disableRotationForReversed = false
}) => {
  const rotate = (0, import_react21.useRef)(useGetTargetAngle(isClockwise, offset, disableRotationForReversed));
  rotate.current = useGetTargetAngle(isClockwise, offset, disableRotationForReversed, rotate);
  return /* @__PURE__ */ React38.createElement(Icon, { fontSize: size, sx: { transition: ".3s", rotate: `${rotate.current}deg` } });
};
var useGetTargetAngle = (isClockwise, offset, disableRotationForReversed, existingRef) => {
  const { value: direction } = useStylesField("flex-direction", {
    history: { propDisplayName: FLEX_DIRECTION_LABEL }
  });
  const isRtl = "rtl" === (0, import_ui22.useTheme)().direction;
  const rotationMultiplier = isRtl ? -1 : 1;
  const angleMap = isClockwise ? CLOCKWISE_ANGLES : COUNTER_CLOCKWISE_ANGLES;
  const currentDirection = direction?.value || "row";
  const currentAngle = existingRef ? existingRef.current * rotationMultiplier : angleMap[currentDirection] + offset;
  const targetAngle = angleMap[currentDirection] + offset;
  const diffToTargetAngle = (targetAngle - currentAngle + 360) % 360;
  const formattedDiff = (diffToTargetAngle + 180) % 360 - 180;
  if (disableRotationForReversed && ["row-reverse", "column-reverse"].includes(currentDirection)) {
    return 0;
  }
  return (currentAngle + formattedDiff) * rotationMultiplier;
};

// src/components/style-sections/layout-section/align-content-field.tsx
var ALIGN_CONTENT_LABEL = (0, import_i18n17.__)("Align content", "elementor");
var StartIcon = (0, import_ui23.withDirection)(import_icons5.JustifyTopIcon);
var EndIcon = (0, import_ui23.withDirection)(import_icons5.JustifyBottomIcon);
var iconProps = {
  isClockwise: false,
  offset: 0,
  disableRotationForReversed: true
};
var options = [
  {
    value: "start",
    label: (0, import_i18n17.__)("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: StartIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "center",
    label: (0, import_i18n17.__)("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: import_icons5.JustifyCenterIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "end",
    label: (0, import_i18n17.__)("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: EndIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-between",
    label: (0, import_i18n17.__)("Space between", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: import_icons5.JustifySpaceBetweenVerticalIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-around",
    label: (0, import_i18n17.__)("Space around", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: import_icons5.JustifySpaceAroundVerticalIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-evenly",
    label: (0, import_i18n17.__)("Space evenly", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: import_icons5.JustifyDistributeVerticalIcon, size, ...iconProps }),
    showTooltip: true
  }
];
var AlignContentField = () => /* @__PURE__ */ React39.createElement(StylesField, { bind: "align-content", propDisplayName: ALIGN_CONTENT_LABEL }, /* @__PURE__ */ React39.createElement(UiProviders, null, /* @__PURE__ */ React39.createElement(StylesFieldLayout, { label: ALIGN_CONTENT_LABEL, direction: "column" }, /* @__PURE__ */ React39.createElement(import_editor_controls15.ToggleControl, { options, fullWidth: true }))));

// src/components/style-sections/layout-section/align-items-field.tsx
var React40 = __toESM(require("react"));
var import_editor_controls16 = require("@elementor/editor-controls");
var import_icons6 = require("@elementor/icons");
var import_ui24 = require("@elementor/ui");
var import_i18n18 = require("@wordpress/i18n");
var ALIGN_ITEMS_LABEL = (0, import_i18n18.__)("Align items", "elementor");
var StartIcon2 = (0, import_ui24.withDirection)(import_icons6.LayoutAlignLeftIcon);
var EndIcon2 = (0, import_ui24.withDirection)(import_icons6.LayoutAlignRightIcon);
var iconProps2 = {
  isClockwise: false,
  offset: 90
};
var options2 = [
  {
    value: "start",
    label: (0, import_i18n18.__)("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React40.createElement(RotatedIcon, { icon: StartIcon2, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "center",
    label: (0, import_i18n18.__)("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React40.createElement(RotatedIcon, { icon: import_icons6.LayoutAlignCenterIcon, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "end",
    label: (0, import_i18n18.__)("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React40.createElement(RotatedIcon, { icon: EndIcon2, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "stretch",
    label: (0, import_i18n18.__)("Stretch", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React40.createElement(RotatedIcon, { icon: import_icons6.LayoutDistributeVerticalIcon, size, ...iconProps2 }),
    showTooltip: true
  }
];
var AlignItemsField = () => {
  return /* @__PURE__ */ React40.createElement(UiProviders, null, /* @__PURE__ */ React40.createElement(StylesField, { bind: "align-items", propDisplayName: ALIGN_ITEMS_LABEL }, /* @__PURE__ */ React40.createElement(StylesFieldLayout, { label: ALIGN_ITEMS_LABEL }, /* @__PURE__ */ React40.createElement(import_editor_controls16.ToggleControl, { options: options2 }))));
};

// src/components/style-sections/layout-section/align-self-child-field.tsx
var React41 = __toESM(require("react"));
var import_editor_controls17 = require("@elementor/editor-controls");
var import_icons7 = require("@elementor/icons");
var import_ui25 = require("@elementor/ui");
var import_i18n19 = require("@wordpress/i18n");
var ALIGN_SELF_LABEL = (0, import_i18n19.__)("Align self", "elementor");
var ALIGN_SELF_CHILD_OFFSET_MAP = {
  row: 90,
  "row-reverse": 90,
  column: 0,
  "column-reverse": 0
};
var StartIcon3 = (0, import_ui25.withDirection)(import_icons7.LayoutAlignLeftIcon);
var EndIcon3 = (0, import_ui25.withDirection)(import_icons7.LayoutAlignRightIcon);
var iconProps3 = {
  isClockwise: false
};
var getOptions = (parentStyleDirection) => [
  {
    value: "start",
    label: (0, import_i18n19.__)("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React41.createElement(
      RotatedIcon,
      {
        icon: StartIcon3,
        size,
        offset: ALIGN_SELF_CHILD_OFFSET_MAP[parentStyleDirection],
        ...iconProps3
      }
    ),
    showTooltip: true
  },
  {
    value: "center",
    label: (0, import_i18n19.__)("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React41.createElement(
      RotatedIcon,
      {
        icon: import_icons7.LayoutAlignCenterIcon,
        size,
        offset: ALIGN_SELF_CHILD_OFFSET_MAP[parentStyleDirection],
        ...iconProps3
      }
    ),
    showTooltip: true
  },
  {
    value: "end",
    label: (0, import_i18n19.__)("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React41.createElement(
      RotatedIcon,
      {
        icon: EndIcon3,
        size,
        offset: ALIGN_SELF_CHILD_OFFSET_MAP[parentStyleDirection],
        ...iconProps3
      }
    ),
    showTooltip: true
  },
  {
    value: "stretch",
    label: (0, import_i18n19.__)("Stretch", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React41.createElement(
      RotatedIcon,
      {
        icon: import_icons7.LayoutDistributeVerticalIcon,
        size,
        offset: ALIGN_SELF_CHILD_OFFSET_MAP[parentStyleDirection],
        ...iconProps3
      }
    ),
    showTooltip: true
  }
];
var AlignSelfChild = ({ parentStyleDirection }) => /* @__PURE__ */ React41.createElement(StylesField, { bind: "align-self", propDisplayName: ALIGN_SELF_LABEL }, /* @__PURE__ */ React41.createElement(UiProviders, null, /* @__PURE__ */ React41.createElement(StylesFieldLayout, { label: ALIGN_SELF_LABEL }, /* @__PURE__ */ React41.createElement(import_editor_controls17.ToggleControl, { options: getOptions(parentStyleDirection) }))));

// src/components/style-sections/layout-section/display-field.tsx
var React42 = __toESM(require("react"));
var import_editor_controls18 = require("@elementor/editor-controls");
var import_i18n20 = require("@wordpress/i18n");
var DISPLAY_LABEL = (0, import_i18n20.__)("Display", "elementor");
var displayFieldItems = [
  {
    value: "block",
    renderContent: () => (0, import_i18n20.__)("Block", "elementor"),
    label: (0, import_i18n20.__)("Block", "elementor"),
    showTooltip: true
  },
  {
    value: "flex",
    renderContent: () => (0, import_i18n20.__)("Flex", "elementor"),
    label: (0, import_i18n20.__)("Flex", "elementor"),
    showTooltip: true
  },
  {
    value: "inline-block",
    renderContent: () => (0, import_i18n20.__)("In-blk", "elementor"),
    label: (0, import_i18n20.__)("Inline-block", "elementor"),
    showTooltip: true
  },
  {
    value: "none",
    renderContent: () => (0, import_i18n20.__)("None", "elementor"),
    label: (0, import_i18n20.__)("None", "elementor"),
    showTooltip: true
  },
  {
    value: "inline-flex",
    renderContent: () => (0, import_i18n20.__)("In-flx", "elementor"),
    label: (0, import_i18n20.__)("Inline-flex", "elementor"),
    showTooltip: true
  }
];
var DisplayField = () => {
  const placeholder = useDisplayPlaceholderValue();
  return /* @__PURE__ */ React42.createElement(StylesField, { bind: "display", propDisplayName: DISPLAY_LABEL, placeholder }, /* @__PURE__ */ React42.createElement(StylesFieldLayout, { label: DISPLAY_LABEL, direction: "column" }, /* @__PURE__ */ React42.createElement(import_editor_controls18.ToggleControl, { options: displayFieldItems, maxItems: 4, fullWidth: true })));
};
var useDisplayPlaceholderValue = () => useStylesInheritanceChain(["display"])[0]?.value ?? void 0;

// src/components/style-sections/layout-section/flex-direction-field.tsx
var React43 = __toESM(require("react"));
var import_editor_controls19 = require("@elementor/editor-controls");
var import_icons8 = require("@elementor/icons");
var import_ui26 = require("@elementor/ui");
var import_i18n21 = require("@wordpress/i18n");
var FLEX_DIRECTION_LABEL2 = (0, import_i18n21.__)("Direction", "elementor");
var options3 = [
  {
    value: "row",
    label: (0, import_i18n21.__)("Row", "elementor"),
    renderContent: ({ size }) => {
      const StartIcon5 = (0, import_ui26.withDirection)(import_icons8.ArrowRightIcon);
      return /* @__PURE__ */ React43.createElement(StartIcon5, { fontSize: size });
    },
    showTooltip: true
  },
  {
    value: "column",
    label: (0, import_i18n21.__)("Column", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React43.createElement(import_icons8.ArrowDownSmallIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "row-reverse",
    label: (0, import_i18n21.__)("Reversed row", "elementor"),
    renderContent: ({ size }) => {
      const EndIcon5 = (0, import_ui26.withDirection)(import_icons8.ArrowLeftIcon);
      return /* @__PURE__ */ React43.createElement(EndIcon5, { fontSize: size });
    },
    showTooltip: true
  },
  {
    value: "column-reverse",
    label: (0, import_i18n21.__)("Reversed column", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React43.createElement(import_icons8.ArrowUpSmallIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FlexDirectionField = () => {
  return /* @__PURE__ */ React43.createElement(StylesField, { bind: "flex-direction", propDisplayName: FLEX_DIRECTION_LABEL2 }, /* @__PURE__ */ React43.createElement(UiProviders, null, /* @__PURE__ */ React43.createElement(StylesFieldLayout, { label: FLEX_DIRECTION_LABEL2 }, /* @__PURE__ */ React43.createElement(import_editor_controls19.ToggleControl, { options: options3 }))));
};

// src/components/style-sections/layout-section/flex-order-field.tsx
var React44 = __toESM(require("react"));
var import_react22 = require("react");
var import_editor_controls20 = require("@elementor/editor-controls");
var import_icons9 = require("@elementor/icons");
var import_ui27 = require("@elementor/ui");
var import_i18n22 = require("@wordpress/i18n");
var ORDER_LABEL = (0, import_i18n22.__)("Order", "elementor");
var FIRST_DEFAULT_VALUE = -99999;
var LAST_DEFAULT_VALUE = 99999;
var FIRST = "first";
var LAST = "last";
var CUSTOM = "custom";
var orderValueMap = {
  [FIRST]: FIRST_DEFAULT_VALUE,
  [LAST]: LAST_DEFAULT_VALUE
};
var items = [
  {
    value: FIRST,
    label: (0, import_i18n22.__)("First", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(import_icons9.ArrowUpSmallIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: LAST,
    label: (0, import_i18n22.__)("Last", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(import_icons9.ArrowDownSmallIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: CUSTOM,
    label: (0, import_i18n22.__)("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(import_icons9.PencilIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FlexOrderField = () => {
  return /* @__PURE__ */ React44.createElement(StylesField, { bind: "order", propDisplayName: ORDER_LABEL }, /* @__PURE__ */ React44.createElement(UiProviders, null, /* @__PURE__ */ React44.createElement(SectionContent, null, /* @__PURE__ */ React44.createElement(FlexOrderFieldContent, null))));
};
function FlexOrderFieldContent() {
  const {
    value: order,
    setValue: setOrder,
    canEdit
  } = useStylesField("order", {
    history: { propDisplayName: ORDER_LABEL }
  });
  const { placeholder } = (0, import_editor_controls20.useBoundProp)();
  const placeholderValue = placeholder;
  const currentGroup = (0, import_react22.useMemo)(() => getGroupControlValue(order?.value ?? null), [order]);
  const [activeGroup, setActiveGroup] = (0, import_react22.useState)(currentGroup);
  const [customLocked, setCustomLocked] = (0, import_react22.useState)(false);
  (0, import_react22.useEffect)(() => {
    if (!customLocked) {
      setActiveGroup(currentGroup);
    }
  }, [currentGroup, customLocked]);
  (0, import_react22.useEffect)(() => {
    if (order === null) {
      setCustomLocked(false);
    }
  }, [order]);
  const groupPlaceholder = getGroupControlValue(placeholderValue?.value ?? null);
  const handleToggleButtonChange = (group) => {
    setActiveGroup(group);
    setCustomLocked(group === CUSTOM);
    if (CUSTOM === group) {
      setOrder({ $$type: "number", value: null });
      return;
    }
    if (FIRST === group) {
      setOrder({ $$type: "number", value: orderValueMap[group] });
      return;
    }
    if (LAST === group) {
      setOrder({ $$type: "number", value: orderValueMap[group] });
      return;
    }
    setOrder(null);
  };
  const isCustomVisible = CUSTOM === activeGroup || CUSTOM === groupPlaceholder;
  const orderPlaceholder = CUSTOM === groupPlaceholder ? String(placeholderValue?.value ?? null) : "";
  return /* @__PURE__ */ React44.createElement(React44.Fragment, null, /* @__PURE__ */ React44.createElement(StylesFieldLayout, { label: ORDER_LABEL }, /* @__PURE__ */ React44.createElement(
    import_editor_controls20.ControlToggleButtonGroup,
    {
      items,
      value: activeGroup,
      onChange: handleToggleButtonChange,
      exclusive: true,
      placeholder: groupPlaceholder,
      disabled: !canEdit
    }
  )), isCustomVisible && /* @__PURE__ */ React44.createElement(import_ui27.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React44.createElement(import_ui27.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React44.createElement(ControlLabel, null, (0, import_i18n22.__)("Custom order", "elementor"))), /* @__PURE__ */ React44.createElement(import_ui27.Grid, { item: true, xs: 6, sx: { display: "flex", justifyContent: "end" } }, /* @__PURE__ */ React44.createElement(
    import_editor_controls20.NumberControl,
    {
      min: FIRST_DEFAULT_VALUE + 1,
      max: LAST_DEFAULT_VALUE - 1,
      shouldForceInt: true,
      placeholder: orderPlaceholder
    }
  ))));
}
var getGroupControlValue = (order) => {
  if (LAST_DEFAULT_VALUE === order) {
    return LAST;
  }
  if (FIRST_DEFAULT_VALUE === order) {
    return FIRST;
  }
  if (null !== order) {
    return CUSTOM;
  }
  return null;
};

// src/components/style-sections/layout-section/flex-size-field.tsx
var React45 = __toESM(require("react"));
var import_react23 = require("react");
var import_editor_controls21 = require("@elementor/editor-controls");
var import_editor_props13 = require("@elementor/editor-props");
var import_icons10 = require("@elementor/icons");
var import_i18n23 = require("@wordpress/i18n");
var FLEX_SIZE_LABEL = (0, import_i18n23.__)("Flex Size", "elementor");
var DEFAULT = 1;
var items2 = [
  {
    value: "flex-grow",
    label: (0, import_i18n23.__)("Grow", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(import_icons10.ExpandIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "flex-shrink",
    label: (0, import_i18n23.__)("Shrink", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(import_icons10.ShrinkIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "custom",
    label: (0, import_i18n23.__)("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(import_icons10.PencilIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FlexSizeField = () => {
  return /* @__PURE__ */ React45.createElement(UiProviders, null, /* @__PURE__ */ React45.createElement(SectionContent, null, /* @__PURE__ */ React45.createElement(StylesField, { bind: "flex", propDisplayName: FLEX_SIZE_LABEL }, /* @__PURE__ */ React45.createElement(FlexSizeFieldContent, null))));
};
var FlexSizeFieldContent = () => {
  const { value, setValue, canEdit } = useStylesField("flex", {
    history: { propDisplayName: FLEX_SIZE_LABEL }
  });
  const { placeholder } = (0, import_editor_controls21.useBoundProp)();
  const flexValues = extractFlexValues(value);
  const currentGroup = (0, import_react23.useMemo)(() => getActiveGroup(flexValues), [flexValues]);
  const [activeGroup, setActiveGroup] = (0, import_react23.useState)(currentGroup);
  const [customLocked, setCustomLocked] = (0, import_react23.useState)(false);
  (0, import_react23.useEffect)(() => {
    if (!customLocked) {
      setActiveGroup(currentGroup);
    }
  }, [currentGroup, customLocked]);
  (0, import_react23.useEffect)(() => {
    if (value === null) {
      setCustomLocked(false);
    }
  }, [value]);
  const onChangeGroup = (group = null) => {
    setActiveGroup(group);
    setCustomLocked(group === "custom");
    const newFlexValue = createFlexValueForGroup(group, value);
    setValue(newFlexValue);
  };
  const groupPlaceholder = getActiveGroup(extractFlexValues(placeholder));
  const isCustomVisible = "custom" === activeGroup || "custom" === groupPlaceholder;
  return /* @__PURE__ */ React45.createElement(React45.Fragment, null, /* @__PURE__ */ React45.createElement(StylesFieldLayout, { label: FLEX_SIZE_LABEL }, /* @__PURE__ */ React45.createElement(
    import_editor_controls21.ControlToggleButtonGroup,
    {
      value: activeGroup ?? null,
      placeholder: groupPlaceholder ?? null,
      onChange: onChangeGroup,
      disabled: !canEdit,
      items: items2,
      exclusive: true
    }
  )), isCustomVisible && /* @__PURE__ */ React45.createElement(FlexCustomField, null));
};
function extractFlexValues(source) {
  return {
    grow: source?.value?.flexGrow?.value ?? null,
    shrink: source?.value?.flexShrink?.value ?? null,
    basis: source?.value?.flexBasis?.value ?? null
  };
}
var createFlexValueForGroup = (group, flexValue) => {
  if (!group) {
    return null;
  }
  if (group === "flex-grow") {
    return import_editor_props13.flexPropTypeUtil.create({
      flexGrow: import_editor_props13.numberPropTypeUtil.create(DEFAULT),
      flexShrink: import_editor_props13.numberPropTypeUtil.create(0),
      flexBasis: import_editor_props13.sizePropTypeUtil.create({ unit: "auto", size: "" })
    });
  }
  if (group === "flex-shrink") {
    return import_editor_props13.flexPropTypeUtil.create({
      flexGrow: import_editor_props13.numberPropTypeUtil.create(0),
      flexShrink: import_editor_props13.numberPropTypeUtil.create(DEFAULT),
      flexBasis: import_editor_props13.sizePropTypeUtil.create({ unit: "auto", size: "" })
    });
  }
  if (group === "custom") {
    if (flexValue) {
      return flexValue;
    }
    return import_editor_props13.flexPropTypeUtil.create({
      flexGrow: null,
      flexShrink: null,
      flexBasis: null
    });
  }
  return null;
};
var FlexCustomField = () => {
  const flexBasisRowRef = (0, import_react23.useRef)(null);
  const context = (0, import_editor_controls21.useBoundProp)(import_editor_props13.flexPropTypeUtil);
  return /* @__PURE__ */ React45.createElement(import_editor_controls21.PropProvider, { ...context }, /* @__PURE__ */ React45.createElement(React45.Fragment, null, /* @__PURE__ */ React45.createElement(StylesFieldLayout, { label: (0, import_i18n23.__)("Grow", "elementor") }, /* @__PURE__ */ React45.createElement(import_editor_controls21.PropKeyProvider, { bind: "flexGrow" }, /* @__PURE__ */ React45.createElement(import_editor_controls21.NumberControl, { min: 0, shouldForceInt: true }))), /* @__PURE__ */ React45.createElement(StylesFieldLayout, { label: (0, import_i18n23.__)("Shrink", "elementor") }, /* @__PURE__ */ React45.createElement(import_editor_controls21.PropKeyProvider, { bind: "flexShrink" }, /* @__PURE__ */ React45.createElement(import_editor_controls21.NumberControl, { min: 0, shouldForceInt: true }))), /* @__PURE__ */ React45.createElement(StylesFieldLayout, { label: (0, import_i18n23.__)("Basis", "elementor"), ref: flexBasisRowRef }, /* @__PURE__ */ React45.createElement(import_editor_controls21.PropKeyProvider, { bind: "flexBasis" }, /* @__PURE__ */ React45.createElement(import_editor_controls21.SizeControl, { extendedOptions: ["auto"], anchorRef: flexBasisRowRef })))));
};
var getActiveGroup = ({
  grow,
  shrink,
  basis
}) => {
  if (null === grow && null === shrink && !basis) {
    return null;
  }
  const isAutoBasis = basis === null || typeof basis === "object" && basis.unit === "auto";
  if (basis && !isAutoBasis) {
    return "custom";
  }
  if (grow === DEFAULT && (shrink === null || shrink === 0) && isAutoBasis) {
    return "flex-grow";
  }
  if (shrink === DEFAULT && (grow === null || grow === 0) && isAutoBasis) {
    return "flex-shrink";
  }
  return "custom";
};

// src/components/style-sections/layout-section/gap-control-field.tsx
var React46 = __toESM(require("react"));
var import_editor_controls22 = require("@elementor/editor-controls");
var import_i18n24 = require("@wordpress/i18n");
var GAPS_LABEL = (0, import_i18n24.__)("Gaps", "elementor");
var GapControlField = () => {
  return /* @__PURE__ */ React46.createElement(StylesField, { bind: "gap", propDisplayName: GAPS_LABEL }, /* @__PURE__ */ React46.createElement(import_editor_controls22.GapControl, { label: GAPS_LABEL }));
};

// src/components/style-sections/layout-section/justify-content-field.tsx
var React47 = __toESM(require("react"));
var import_editor_controls23 = require("@elementor/editor-controls");
var import_icons11 = require("@elementor/icons");
var import_ui28 = require("@elementor/ui");
var import_i18n25 = require("@wordpress/i18n");
var JUSTIFY_CONTENT_LABEL = (0, import_i18n25.__)("Justify content", "elementor");
var StartIcon4 = (0, import_ui28.withDirection)(import_icons11.JustifyTopIcon);
var EndIcon4 = (0, import_ui28.withDirection)(import_icons11.JustifyBottomIcon);
var iconProps4 = {
  isClockwise: true,
  offset: -90
};
var options4 = [
  {
    value: "flex-start",
    label: (0, import_i18n25.__)("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: StartIcon4, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "center",
    label: (0, import_i18n25.__)("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: import_icons11.JustifyCenterIcon, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "flex-end",
    label: (0, import_i18n25.__)("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: EndIcon4, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-between",
    label: (0, import_i18n25.__)("Space between", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: import_icons11.JustifySpaceBetweenVerticalIcon, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-around",
    label: (0, import_i18n25.__)("Space around", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: import_icons11.JustifySpaceAroundVerticalIcon, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-evenly",
    label: (0, import_i18n25.__)("Space evenly", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: import_icons11.JustifyDistributeVerticalIcon, size, ...iconProps4 }),
    showTooltip: true
  }
];
var JustifyContentField = () => /* @__PURE__ */ React47.createElement(StylesField, { bind: "justify-content", propDisplayName: JUSTIFY_CONTENT_LABEL }, /* @__PURE__ */ React47.createElement(UiProviders, null, /* @__PURE__ */ React47.createElement(StylesFieldLayout, { label: JUSTIFY_CONTENT_LABEL, direction: "column" }, /* @__PURE__ */ React47.createElement(import_editor_controls23.ToggleControl, { options: options4, fullWidth: true }))));

// src/components/style-sections/layout-section/wrap-field.tsx
var React48 = __toESM(require("react"));
var import_editor_controls24 = require("@elementor/editor-controls");
var import_icons12 = require("@elementor/icons");
var import_i18n26 = require("@wordpress/i18n");
var FLEX_WRAP_LABEL = (0, import_i18n26.__)("Wrap", "elementor");
var options5 = [
  {
    value: "nowrap",
    label: (0, import_i18n26.__)("No wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(import_icons12.ArrowRightIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "wrap",
    label: (0, import_i18n26.__)("Wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(import_icons12.ArrowBackIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "wrap-reverse",
    label: (0, import_i18n26.__)("Reversed wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(import_icons12.ArrowForwardIcon, { fontSize: size }),
    showTooltip: true
  }
];
var WrapField = () => {
  return /* @__PURE__ */ React48.createElement(StylesField, { bind: "flex-wrap", propDisplayName: FLEX_WRAP_LABEL }, /* @__PURE__ */ React48.createElement(UiProviders, null, /* @__PURE__ */ React48.createElement(StylesFieldLayout, { label: FLEX_WRAP_LABEL }, /* @__PURE__ */ React48.createElement(import_editor_controls24.ToggleControl, { options: options5 }))));
};

// src/components/style-sections/layout-section/layout-section.tsx
var DISPLAY_LABEL2 = (0, import_i18n27.__)("Display", "elementor");
var FLEX_WRAP_LABEL2 = (0, import_i18n27.__)("Flex wrap", "elementor");
var LayoutSection = () => {
  const { value: display } = useStylesField("display", {
    history: { propDisplayName: DISPLAY_LABEL2 }
  });
  const displayPlaceholder = useDisplayPlaceholderValue();
  const isDisplayFlex = shouldDisplayFlexFields(display, displayPlaceholder);
  const { element } = useElement();
  const parent = (0, import_editor_elements11.useParentElement)(element.id);
  const parentStyle = useComputedStyle(parent?.id || null);
  const parentStyleDirection = parentStyle?.flexDirection ?? "row";
  return /* @__PURE__ */ React49.createElement(SectionContent, null, /* @__PURE__ */ React49.createElement(DisplayField, null), isDisplayFlex && /* @__PURE__ */ React49.createElement(FlexFields, null), "flex" === parentStyle?.display && /* @__PURE__ */ React49.createElement(FlexChildFields, { parentStyleDirection }));
};
var FlexFields = () => {
  const { value: flexWrap } = useStylesField("flex-wrap", {
    history: { propDisplayName: FLEX_WRAP_LABEL2 }
  });
  return /* @__PURE__ */ React49.createElement(React49.Fragment, null, /* @__PURE__ */ React49.createElement(FlexDirectionField, null), /* @__PURE__ */ React49.createElement(JustifyContentField, null), /* @__PURE__ */ React49.createElement(AlignItemsField, null), /* @__PURE__ */ React49.createElement(PanelDivider, null), /* @__PURE__ */ React49.createElement(GapControlField, null), /* @__PURE__ */ React49.createElement(WrapField, null), ["wrap", "wrap-reverse"].includes(flexWrap?.value) && /* @__PURE__ */ React49.createElement(AlignContentField, null));
};
var FlexChildFields = ({ parentStyleDirection }) => /* @__PURE__ */ React49.createElement(React49.Fragment, null, /* @__PURE__ */ React49.createElement(PanelDivider, null), /* @__PURE__ */ React49.createElement(import_editor_controls25.ControlFormLabel, null, (0, import_i18n27.__)("Flex child", "elementor")), /* @__PURE__ */ React49.createElement(AlignSelfChild, { parentStyleDirection }), /* @__PURE__ */ React49.createElement(FlexOrderField, null), /* @__PURE__ */ React49.createElement(FlexSizeField, null));
var shouldDisplayFlexFields = (display, local) => {
  const value = display?.value ?? local?.value;
  if (!value) {
    return false;
  }
  return "flex" === value || "inline-flex" === value;
};

// src/components/style-sections/position-section/position-section.tsx
var React54 = __toESM(require("react"));
var import_session6 = require("@elementor/session");
var import_i18n32 = require("@wordpress/i18n");

// src/components/style-sections/position-section/dimensions-field.tsx
var React50 = __toESM(require("react"));
var import_react24 = require("react");
var import_editor_controls26 = require("@elementor/editor-controls");
var import_icons13 = require("@elementor/icons");
var import_ui29 = require("@elementor/ui");
var import_i18n28 = require("@wordpress/i18n");
var InlineStartIcon2 = (0, import_ui29.withDirection)(import_icons13.SideLeftIcon);
var InlineEndIcon2 = (0, import_ui29.withDirection)(import_icons13.SideRightIcon);
var sideIcons = {
  "inset-block-start": /* @__PURE__ */ React50.createElement(import_icons13.SideTopIcon, { fontSize: "tiny" }),
  "inset-block-end": /* @__PURE__ */ React50.createElement(import_icons13.SideBottomIcon, { fontSize: "tiny" }),
  "inset-inline-start": /* @__PURE__ */ React50.createElement(RotatedIcon, { icon: InlineStartIcon2, size: "tiny" }),
  "inset-inline-end": /* @__PURE__ */ React50.createElement(RotatedIcon, { icon: InlineEndIcon2, size: "tiny" })
};
var getInlineStartLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n28.__)("Right", "elementor") : (0, import_i18n28.__)("Left", "elementor");
var getInlineEndLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n28.__)("Left", "elementor") : (0, import_i18n28.__)("Right", "elementor");
var DimensionsField = () => {
  const { isSiteRtl } = useDirection();
  const rowRefs = [(0, import_react24.useRef)(null), (0, import_react24.useRef)(null)];
  return /* @__PURE__ */ React50.createElement(UiProviders, null, /* @__PURE__ */ React50.createElement(import_ui29.Stack, { direction: "row", gap: 2, flexWrap: "nowrap", ref: rowRefs[0] }, /* @__PURE__ */ React50.createElement(DimensionField, { side: "inset-block-start", label: (0, import_i18n28.__)("Top", "elementor"), rowRef: rowRefs[0] }), /* @__PURE__ */ React50.createElement(
    DimensionField,
    {
      side: "inset-inline-end",
      label: getInlineEndLabel(isSiteRtl),
      rowRef: rowRefs[0]
    }
  )), /* @__PURE__ */ React50.createElement(import_ui29.Stack, { direction: "row", gap: 2, flexWrap: "nowrap", ref: rowRefs[1] }, /* @__PURE__ */ React50.createElement(DimensionField, { side: "inset-block-end", label: (0, import_i18n28.__)("Bottom", "elementor"), rowRef: rowRefs[1] }), /* @__PURE__ */ React50.createElement(
    DimensionField,
    {
      side: "inset-inline-start",
      label: getInlineStartLabel(isSiteRtl),
      rowRef: rowRefs[1]
    }
  )));
};
var DimensionField = ({
  side,
  label,
  rowRef
}) => /* @__PURE__ */ React50.createElement(StylesField, { bind: side, propDisplayName: label }, /* @__PURE__ */ React50.createElement(import_ui29.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React50.createElement(import_ui29.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React50.createElement(ControlLabel, null, label)), /* @__PURE__ */ React50.createElement(import_ui29.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React50.createElement(
  import_editor_controls26.SizeControl,
  {
    startIcon: sideIcons[side],
    extendedOptions: ["auto"],
    anchorRef: rowRef,
    min: -Number.MAX_SAFE_INTEGER
  }
))));

// src/components/style-sections/position-section/offset-field.tsx
var React51 = __toESM(require("react"));
var import_react25 = require("react");
var import_editor_controls27 = require("@elementor/editor-controls");
var import_i18n29 = require("@wordpress/i18n");
var OFFSET_LABEL = (0, import_i18n29.__)("Anchor offset", "elementor");
var UNITS = ["px", "em", "rem", "vw", "vh"];
var OffsetField = () => {
  const rowRef = (0, import_react25.useRef)(null);
  return /* @__PURE__ */ React51.createElement(StylesField, { bind: "scroll-margin-top", propDisplayName: OFFSET_LABEL }, /* @__PURE__ */ React51.createElement(StylesFieldLayout, { label: OFFSET_LABEL, ref: rowRef }, /* @__PURE__ */ React51.createElement(import_editor_controls27.SizeControl, { units: UNITS, anchorRef: rowRef })));
};

// src/components/style-sections/position-section/position-field.tsx
var React52 = __toESM(require("react"));
var import_editor_controls28 = require("@elementor/editor-controls");
var import_i18n30 = require("@wordpress/i18n");
var POSITION_LABEL = (0, import_i18n30.__)("Position", "elementor");
var positionOptions = [
  { label: (0, import_i18n30.__)("Static", "elementor"), value: "static" },
  { label: (0, import_i18n30.__)("Relative", "elementor"), value: "relative" },
  { label: (0, import_i18n30.__)("Absolute", "elementor"), value: "absolute" },
  { label: (0, import_i18n30.__)("Fixed", "elementor"), value: "fixed" },
  { label: (0, import_i18n30.__)("Sticky", "elementor"), value: "sticky" }
];
var PositionField = ({ onChange }) => {
  return /* @__PURE__ */ React52.createElement(StylesField, { bind: "position", propDisplayName: POSITION_LABEL }, /* @__PURE__ */ React52.createElement(StylesFieldLayout, { label: POSITION_LABEL }, /* @__PURE__ */ React52.createElement(import_editor_controls28.SelectControl, { options: positionOptions, onChange })));
};

// src/components/style-sections/position-section/z-index-field.tsx
var React53 = __toESM(require("react"));
var import_editor_controls29 = require("@elementor/editor-controls");
var import_i18n31 = require("@wordpress/i18n");
var Z_INDEX_LABEL = (0, import_i18n31.__)("Z-index", "elementor");
var ZIndexField = () => {
  return /* @__PURE__ */ React53.createElement(StylesField, { bind: "z-index", propDisplayName: Z_INDEX_LABEL }, /* @__PURE__ */ React53.createElement(StylesFieldLayout, { label: Z_INDEX_LABEL }, /* @__PURE__ */ React53.createElement(import_editor_controls29.NumberControl, null)));
};

// src/components/style-sections/position-section/position-section.tsx
var POSITION_LABEL2 = (0, import_i18n32.__)("Position", "elementor");
var DIMENSIONS_LABEL = (0, import_i18n32.__)("Dimensions", "elementor");
var PositionSection = () => {
  const { value: positionValue } = useStylesField("position", {
    history: { propDisplayName: POSITION_LABEL2 }
  });
  const { values: dimensions, setValues: setDimensions } = useStylesFields([
    "inset-block-start",
    "inset-block-end",
    "inset-inline-start",
    "inset-inline-end"
  ]);
  const [dimensionsValuesFromHistory, updateDimensionsHistory, clearDimensionsHistory] = usePersistDimensions();
  const onPositionChange = (newPosition, previousPosition) => {
    const meta = { history: { propDisplayName: DIMENSIONS_LABEL } };
    if (newPosition === "static") {
      if (dimensions) {
        updateDimensionsHistory(dimensions);
        setDimensions(
          {
            "inset-block-start": void 0,
            "inset-block-end": void 0,
            "inset-inline-start": void 0,
            "inset-inline-end": void 0
          },
          meta
        );
      }
    } else if (previousPosition === "static") {
      if (dimensionsValuesFromHistory) {
        setDimensions(dimensionsValuesFromHistory, meta);
        clearDimensionsHistory();
      }
    }
  };
  const isNotStatic = positionValue && positionValue?.value !== "static";
  return /* @__PURE__ */ React54.createElement(SectionContent, null, /* @__PURE__ */ React54.createElement(PositionField, { onChange: onPositionChange }), isNotStatic ? /* @__PURE__ */ React54.createElement(React54.Fragment, null, /* @__PURE__ */ React54.createElement(DimensionsField, null), /* @__PURE__ */ React54.createElement(ZIndexField, null)) : null, /* @__PURE__ */ React54.createElement(PanelDivider, null), /* @__PURE__ */ React54.createElement(OffsetField, null));
};
var usePersistDimensions = () => {
  const { id: styleDefID, meta } = useStyle();
  const styleVariantPath = `styles/${styleDefID}/${meta.breakpoint || "desktop"}/${meta.state || "null"}`;
  const dimensionsPath = `${styleVariantPath}/dimensions`;
  return (0, import_session6.useSessionStorage)(dimensionsPath);
};

// src/components/style-sections/size-section/size-section.tsx
var React59 = __toESM(require("react"));
var import_react26 = require("react");
var import_editor_controls32 = require("@elementor/editor-controls");
var import_ui31 = require("@elementor/ui");
var import_i18n36 = require("@wordpress/i18n");

// src/components/style-tab-collapsible-content.tsx
var React56 = __toESM(require("react"));
var import_editor_ui5 = require("@elementor/editor-ui");

// src/styles-inheritance/components/styles-inheritance-section-indicators.tsx
var React55 = __toESM(require("react"));
var import_editor_styles_repository13 = require("@elementor/editor-styles-repository");
var import_ui30 = require("@elementor/ui");
var import_i18n33 = require("@wordpress/i18n");
var StylesInheritanceSectionIndicators = ({ fields }) => {
  const { id, meta, provider } = useStyle();
  const snapshot = useStylesInheritanceSnapshot();
  if (fields.includes("custom_css")) {
    return /* @__PURE__ */ React55.createElement(CustomCssIndicator, null);
  }
  const snapshotFields = Object.fromEntries(
    Object.entries(snapshot ?? {}).filter(([key]) => fields.includes(key))
  );
  const { hasValues, hasOverrides } = getIndicators(snapshotFields, id ?? "", meta);
  if (!hasValues && !hasOverrides) {
    return null;
  }
  const hasValueLabel = (0, import_i18n33.__)("Has effective styles", "elementor");
  const hasOverridesLabel = (0, import_i18n33.__)("Has overridden styles", "elementor");
  return /* @__PURE__ */ React55.createElement(import_ui30.Tooltip, { title: (0, import_i18n33.__)("Has styles", "elementor"), placement: "top" }, /* @__PURE__ */ React55.createElement(import_ui30.Stack, { direction: "row", sx: { "& > *": { marginInlineStart: -0.25 } }, role: "list" }, hasValues && provider && /* @__PURE__ */ React55.createElement(
    StyleIndicator,
    {
      getColor: getStylesProviderThemeColor(provider.getKey()),
      "data-variant": (0, import_editor_styles_repository13.isElementsStylesProvider)(provider.getKey()) ? "local" : "global",
      role: "listitem",
      "aria-label": hasValueLabel
    }
  ), hasOverrides && /* @__PURE__ */ React55.createElement(
    StyleIndicator,
    {
      isOverridden: true,
      "data-variant": "overridden",
      role: "listitem",
      "aria-label": hasOverridesLabel
    }
  )));
};
function getIndicators(snapshotFields, styleId, meta) {
  let hasValues = false;
  let hasOverrides = false;
  Object.values(snapshotFields).forEach((inheritanceChain) => {
    const currentStyle = getCurrentStyleFromChain(inheritanceChain, styleId, meta);
    if (!currentStyle) {
      return;
    }
    const [actualStyle] = inheritanceChain;
    if (currentStyle === actualStyle) {
      hasValues = true;
    } else {
      hasOverrides = true;
    }
  });
  return { hasValues, hasOverrides };
}
function getCurrentStyleFromChain(chain, styleId, meta) {
  return chain.find(
    ({
      style: { id },
      variant: {
        meta: { breakpoint, state }
      }
    }) => id === styleId && breakpoint === meta.breakpoint && state === meta.state
  );
}

// src/components/style-tab-collapsible-content.tsx
var StyleTabCollapsibleContent = ({ fields = [], children }) => {
  return /* @__PURE__ */ React56.createElement(import_editor_ui5.CollapsibleContent, { titleEnd: getStylesInheritanceIndicators(fields) }, children);
};
function getStylesInheritanceIndicators(fields) {
  if (fields.length === 0) {
    return null;
  }
  return (isOpen) => !isOpen ? /* @__PURE__ */ React56.createElement(StylesInheritanceSectionIndicators, { fields }) : null;
}

// src/components/style-sections/size-section/object-fit-field.tsx
var React57 = __toESM(require("react"));
var import_editor_controls30 = require("@elementor/editor-controls");
var import_i18n34 = require("@wordpress/i18n");
var OBJECT_FIT_LABEL = (0, import_i18n34.__)("Object fit", "elementor");
var positionOptions2 = [
  { label: (0, import_i18n34.__)("Fill", "elementor"), value: "fill" },
  { label: (0, import_i18n34.__)("Cover", "elementor"), value: "cover" },
  { label: (0, import_i18n34.__)("Contain", "elementor"), value: "contain" },
  { label: (0, import_i18n34.__)("None", "elementor"), value: "none" },
  { label: (0, import_i18n34.__)("Scale down", "elementor"), value: "scale-down" }
];
var ObjectFitField = () => {
  return /* @__PURE__ */ React57.createElement(StylesField, { bind: "object-fit", propDisplayName: OBJECT_FIT_LABEL }, /* @__PURE__ */ React57.createElement(StylesFieldLayout, { label: OBJECT_FIT_LABEL }, /* @__PURE__ */ React57.createElement(import_editor_controls30.SelectControl, { options: positionOptions2 })));
};

// src/components/style-sections/size-section/overflow-field.tsx
var React58 = __toESM(require("react"));
var import_editor_controls31 = require("@elementor/editor-controls");
var import_icons14 = require("@elementor/icons");
var import_i18n35 = require("@wordpress/i18n");
var OVERFLOW_LABEL = (0, import_i18n35.__)("Overflow", "elementor");
var options6 = [
  {
    value: "visible",
    label: (0, import_i18n35.__)("Visible", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React58.createElement(import_icons14.EyeIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "hidden",
    label: (0, import_i18n35.__)("Hidden", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React58.createElement(import_icons14.EyeOffIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "auto",
    label: (0, import_i18n35.__)("Auto", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React58.createElement(import_icons14.LetterAIcon, { fontSize: size }),
    showTooltip: true
  }
];
var OverflowField = () => {
  return /* @__PURE__ */ React58.createElement(StylesField, { bind: "overflow", propDisplayName: OVERFLOW_LABEL }, /* @__PURE__ */ React58.createElement(StylesFieldLayout, { label: OVERFLOW_LABEL }, /* @__PURE__ */ React58.createElement(import_editor_controls31.ToggleControl, { options: options6 })));
};

// src/components/style-sections/size-section/size-section.tsx
var CssSizeProps = [
  [
    {
      bind: "width",
      label: (0, import_i18n36.__)("Width", "elementor")
    },
    {
      bind: "height",
      label: (0, import_i18n36.__)("Height", "elementor")
    }
  ],
  [
    {
      bind: "min-width",
      label: (0, import_i18n36.__)("Min width", "elementor")
    },
    {
      bind: "min-height",
      label: (0, import_i18n36.__)("Min height", "elementor")
    }
  ],
  [
    {
      bind: "max-width",
      label: (0, import_i18n36.__)("Max width", "elementor")
    },
    {
      bind: "max-height",
      label: (0, import_i18n36.__)("Max height", "elementor")
    }
  ]
];
var ASPECT_RATIO_LABEL = (0, import_i18n36.__)("Aspect Ratio", "elementor");
var SizeSection = () => {
  const gridRowRefs = [(0, import_react26.useRef)(null), (0, import_react26.useRef)(null), (0, import_react26.useRef)(null)];
  return /* @__PURE__ */ React59.createElement(SectionContent, null, CssSizeProps.map((row, rowIndex) => /* @__PURE__ */ React59.createElement(import_ui31.Grid, { key: rowIndex, container: true, gap: 2, flexWrap: "nowrap", ref: gridRowRefs[rowIndex] }, row.map((props) => /* @__PURE__ */ React59.createElement(import_ui31.Grid, { item: true, xs: 6, key: props.bind }, /* @__PURE__ */ React59.createElement(SizeField, { ...props, rowRef: gridRowRefs[rowIndex], extendedOptions: ["auto"] }))))), /* @__PURE__ */ React59.createElement(PanelDivider, null), /* @__PURE__ */ React59.createElement(import_ui31.Stack, null, /* @__PURE__ */ React59.createElement(OverflowField, null)), /* @__PURE__ */ React59.createElement(StyleTabCollapsibleContent, { fields: ["aspect-ratio", "object-fit"] }, /* @__PURE__ */ React59.createElement(import_ui31.Stack, { gap: 2, pt: 2 }, /* @__PURE__ */ React59.createElement(StylesField, { bind: "aspect-ratio", propDisplayName: ASPECT_RATIO_LABEL }, /* @__PURE__ */ React59.createElement(import_editor_controls32.AspectRatioControl, { label: ASPECT_RATIO_LABEL })), /* @__PURE__ */ React59.createElement(PanelDivider, null), /* @__PURE__ */ React59.createElement(ObjectFitField, null), /* @__PURE__ */ React59.createElement(StylesField, { bind: "object-position", propDisplayName: (0, import_i18n36.__)("Object position", "elementor") }, /* @__PURE__ */ React59.createElement(import_ui31.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React59.createElement(import_editor_controls32.PositionControl, null))))));
};
var SizeField = ({ label, bind, rowRef, extendedOptions }) => {
  return /* @__PURE__ */ React59.createElement(StylesField, { bind, propDisplayName: label }, /* @__PURE__ */ React59.createElement(import_ui31.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React59.createElement(import_ui31.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React59.createElement(ControlLabel, null, label)), /* @__PURE__ */ React59.createElement(import_ui31.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React59.createElement(import_editor_controls32.SizeControl, { extendedOptions, anchorRef: rowRef }))));
};

// src/components/style-sections/spacing-section/spacing-section.tsx
var React60 = __toESM(require("react"));
var import_editor_controls33 = require("@elementor/editor-controls");
var import_i18n37 = require("@wordpress/i18n");
var MARGIN_LABEL = (0, import_i18n37.__)("Margin", "elementor");
var PADDING_LABEL = (0, import_i18n37.__)("Padding", "elementor");
var SpacingSection = () => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React60.createElement(SectionContent, null, /* @__PURE__ */ React60.createElement(StylesField, { bind: "margin", propDisplayName: MARGIN_LABEL }, /* @__PURE__ */ React60.createElement(
    import_editor_controls33.LinkedDimensionsControl,
    {
      label: MARGIN_LABEL,
      isSiteRtl,
      extendedOptions: ["auto"],
      min: -Number.MAX_SAFE_INTEGER
    }
  )), /* @__PURE__ */ React60.createElement(PanelDivider, null), /* @__PURE__ */ React60.createElement(StylesField, { bind: "padding", propDisplayName: PADDING_LABEL }, /* @__PURE__ */ React60.createElement(import_editor_controls33.LinkedDimensionsControl, { label: PADDING_LABEL, isSiteRtl })));
};

// src/components/style-sections/typography-section/typography-section.tsx
var React77 = __toESM(require("react"));

// src/components/style-sections/typography-section/column-count-field.tsx
var React61 = __toESM(require("react"));
var import_editor_controls34 = require("@elementor/editor-controls");
var import_i18n38 = require("@wordpress/i18n");
var COLUMN_COUNT_LABEL = (0, import_i18n38.__)("Columns", "elementor");
var ColumnCountField = () => {
  return /* @__PURE__ */ React61.createElement(StylesField, { bind: "column-count", propDisplayName: COLUMN_COUNT_LABEL }, /* @__PURE__ */ React61.createElement(StylesFieldLayout, { label: COLUMN_COUNT_LABEL }, /* @__PURE__ */ React61.createElement(import_editor_controls34.NumberControl, { shouldForceInt: true, min: 0, step: 1 })));
};

// src/components/style-sections/typography-section/column-gap-field.tsx
var React62 = __toESM(require("react"));
var import_react27 = require("react");
var import_editor_controls35 = require("@elementor/editor-controls");
var import_i18n39 = require("@wordpress/i18n");
var COLUMN_GAP_LABEL = (0, import_i18n39.__)("Column gap", "elementor");
var ColumnGapField = () => {
  const rowRef = (0, import_react27.useRef)(null);
  return /* @__PURE__ */ React62.createElement(StylesField, { bind: "column-gap", propDisplayName: COLUMN_GAP_LABEL }, /* @__PURE__ */ React62.createElement(StylesFieldLayout, { label: COLUMN_GAP_LABEL, ref: rowRef }, /* @__PURE__ */ React62.createElement(import_editor_controls35.SizeControl, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/font-family-field.tsx
var React63 = __toESM(require("react"));
var import_editor_controls36 = require("@elementor/editor-controls");
var import_editor_ui6 = require("@elementor/editor-ui");
var import_i18n40 = require("@wordpress/i18n");
var FONT_FAMILY_LABEL = (0, import_i18n40.__)("Font family", "elementor");
var FontFamilyField = () => {
  const fontFamilies = (0, import_editor_controls36.useFontFamilies)();
  const sectionWidth = (0, import_editor_ui6.useSectionWidth)();
  if (fontFamilies.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React63.createElement(StylesField, { bind: "font-family", propDisplayName: FONT_FAMILY_LABEL }, /* @__PURE__ */ React63.createElement(StylesFieldLayout, { label: FONT_FAMILY_LABEL }, /* @__PURE__ */ React63.createElement(
    import_editor_controls36.FontFamilyControl,
    {
      fontFamilies,
      sectionWidth,
      ariaLabel: FONT_FAMILY_LABEL
    }
  )));
};

// src/components/style-sections/typography-section/font-size-field.tsx
var React64 = __toESM(require("react"));
var import_react28 = require("react");
var import_editor_controls37 = require("@elementor/editor-controls");
var import_i18n41 = require("@wordpress/i18n");
var FONT_SIZE_LABEL = (0, import_i18n41.__)("Font size", "elementor");
var FontSizeField = () => {
  const rowRef = (0, import_react28.useRef)(null);
  return /* @__PURE__ */ React64.createElement(StylesField, { bind: "font-size", propDisplayName: FONT_SIZE_LABEL }, /* @__PURE__ */ React64.createElement(StylesFieldLayout, { label: FONT_SIZE_LABEL, ref: rowRef }, /* @__PURE__ */ React64.createElement(import_editor_controls37.SizeControl, { anchorRef: rowRef, ariaLabel: FONT_SIZE_LABEL })));
};

// src/components/style-sections/typography-section/font-style-field.tsx
var React65 = __toESM(require("react"));
var import_editor_controls38 = require("@elementor/editor-controls");
var import_icons15 = require("@elementor/icons");
var import_i18n42 = require("@wordpress/i18n");
var FONT_STYLE_LABEL = (0, import_i18n42.__)("Font style", "elementor");
var options7 = [
  {
    value: "normal",
    label: (0, import_i18n42.__)("Normal", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React65.createElement(import_icons15.MinusIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "italic",
    label: (0, import_i18n42.__)("Italic", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React65.createElement(import_icons15.ItalicIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FontStyleField = () => {
  return /* @__PURE__ */ React65.createElement(StylesField, { bind: "font-style", propDisplayName: FONT_STYLE_LABEL }, /* @__PURE__ */ React65.createElement(StylesFieldLayout, { label: FONT_STYLE_LABEL }, /* @__PURE__ */ React65.createElement(import_editor_controls38.ToggleControl, { options: options7 })));
};

// src/components/style-sections/typography-section/font-weight-field.tsx
var React66 = __toESM(require("react"));
var import_editor_controls39 = require("@elementor/editor-controls");
var import_i18n43 = require("@wordpress/i18n");
var FONT_WEIGHT_LABEL = (0, import_i18n43.__)("Font weight", "elementor");
var fontWeightOptions = [
  { value: "100", label: (0, import_i18n43.__)("100 - Thin", "elementor") },
  { value: "200", label: (0, import_i18n43.__)("200 - Extra light", "elementor") },
  { value: "300", label: (0, import_i18n43.__)("300 - Light", "elementor") },
  { value: "400", label: (0, import_i18n43.__)("400 - Normal", "elementor") },
  { value: "500", label: (0, import_i18n43.__)("500 - Medium", "elementor") },
  { value: "600", label: (0, import_i18n43.__)("600 - Semi bold", "elementor") },
  { value: "700", label: (0, import_i18n43.__)("700 - Bold", "elementor") },
  { value: "800", label: (0, import_i18n43.__)("800 - Extra bold", "elementor") },
  { value: "900", label: (0, import_i18n43.__)("900 - Black", "elementor") }
];
var FontWeightField = () => {
  return /* @__PURE__ */ React66.createElement(StylesField, { bind: "font-weight", propDisplayName: FONT_WEIGHT_LABEL }, /* @__PURE__ */ React66.createElement(StylesFieldLayout, { label: FONT_WEIGHT_LABEL }, /* @__PURE__ */ React66.createElement(import_editor_controls39.SelectControl, { options: fontWeightOptions })));
};

// src/components/style-sections/typography-section/letter-spacing-field.tsx
var React67 = __toESM(require("react"));
var import_react29 = require("react");
var import_editor_controls40 = require("@elementor/editor-controls");
var import_i18n44 = require("@wordpress/i18n");
var LETTER_SPACING_LABEL = (0, import_i18n44.__)("Letter spacing", "elementor");
var LetterSpacingField = () => {
  const rowRef = (0, import_react29.useRef)(null);
  return /* @__PURE__ */ React67.createElement(StylesField, { bind: "letter-spacing", propDisplayName: LETTER_SPACING_LABEL }, /* @__PURE__ */ React67.createElement(StylesFieldLayout, { label: LETTER_SPACING_LABEL, ref: rowRef }, /* @__PURE__ */ React67.createElement(import_editor_controls40.SizeControl, { anchorRef: rowRef, min: -Number.MAX_SAFE_INTEGER })));
};

// src/components/style-sections/typography-section/line-height-field.tsx
var React68 = __toESM(require("react"));
var import_react30 = require("react");
var import_editor_controls41 = require("@elementor/editor-controls");
var import_i18n45 = require("@wordpress/i18n");
var LINE_HEIGHT_LABEL = (0, import_i18n45.__)("Line height", "elementor");
var LineHeightField = () => {
  const rowRef = (0, import_react30.useRef)(null);
  return /* @__PURE__ */ React68.createElement(StylesField, { bind: "line-height", propDisplayName: LINE_HEIGHT_LABEL }, /* @__PURE__ */ React68.createElement(StylesFieldLayout, { label: LINE_HEIGHT_LABEL, ref: rowRef }, /* @__PURE__ */ React68.createElement(import_editor_controls41.SizeControl, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/text-alignment-field.tsx
var React69 = __toESM(require("react"));
var import_editor_controls42 = require("@elementor/editor-controls");
var import_icons16 = require("@elementor/icons");
var import_ui32 = require("@elementor/ui");
var import_i18n46 = require("@wordpress/i18n");
var TEXT_ALIGNMENT_LABEL = (0, import_i18n46.__)("Text align", "elementor");
var AlignStartIcon = (0, import_ui32.withDirection)(import_icons16.AlignLeftIcon);
var AlignEndIcon = (0, import_ui32.withDirection)(import_icons16.AlignRightIcon);
var options8 = [
  {
    value: "start",
    label: (0, import_i18n46.__)("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React69.createElement(AlignStartIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "center",
    label: (0, import_i18n46.__)("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React69.createElement(import_icons16.AlignCenterIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "end",
    label: (0, import_i18n46.__)("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React69.createElement(AlignEndIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "justify",
    label: (0, import_i18n46.__)("Justify", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React69.createElement(import_icons16.AlignJustifiedIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextAlignmentField = () => {
  return /* @__PURE__ */ React69.createElement(StylesField, { bind: "text-align", propDisplayName: TEXT_ALIGNMENT_LABEL }, /* @__PURE__ */ React69.createElement(UiProviders, null, /* @__PURE__ */ React69.createElement(StylesFieldLayout, { label: TEXT_ALIGNMENT_LABEL }, /* @__PURE__ */ React69.createElement(import_editor_controls42.ToggleControl, { options: options8 }))));
};

// src/components/style-sections/typography-section/text-color-field.tsx
var React70 = __toESM(require("react"));
var import_editor_controls43 = require("@elementor/editor-controls");
var import_i18n47 = require("@wordpress/i18n");
var TEXT_COLOR_LABEL = (0, import_i18n47.__)("Text color", "elementor");
var TextColorField = () => {
  return /* @__PURE__ */ React70.createElement(StylesField, { bind: "color", propDisplayName: TEXT_COLOR_LABEL }, /* @__PURE__ */ React70.createElement(StylesFieldLayout, { label: TEXT_COLOR_LABEL }, /* @__PURE__ */ React70.createElement(import_editor_controls43.ColorControl, { id: "text-color-control" })));
};

// src/components/style-sections/typography-section/text-decoration-field.tsx
var React71 = __toESM(require("react"));
var import_editor_controls44 = require("@elementor/editor-controls");
var import_icons17 = require("@elementor/icons");
var import_i18n48 = require("@wordpress/i18n");
var TEXT_DECORATION_LABEL = (0, import_i18n48.__)("Line decoration", "elementor");
var options9 = [
  {
    value: "none",
    label: (0, import_i18n48.__)("None", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(import_icons17.MinusIcon, { fontSize: size }),
    showTooltip: true,
    exclusive: true
  },
  {
    value: "underline",
    label: (0, import_i18n48.__)("Underline", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(import_icons17.UnderlineIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "line-through",
    label: (0, import_i18n48.__)("Line-through", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(import_icons17.StrikethroughIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "overline",
    label: (0, import_i18n48.__)("Overline", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(import_icons17.OverlineIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextDecorationField = () => /* @__PURE__ */ React71.createElement(StylesField, { bind: "text-decoration", propDisplayName: TEXT_DECORATION_LABEL }, /* @__PURE__ */ React71.createElement(StylesFieldLayout, { label: TEXT_DECORATION_LABEL }, /* @__PURE__ */ React71.createElement(import_editor_controls44.ToggleControl, { options: options9, exclusive: false })));

// src/components/style-sections/typography-section/text-direction-field.tsx
var React72 = __toESM(require("react"));
var import_editor_controls45 = require("@elementor/editor-controls");
var import_icons18 = require("@elementor/icons");
var import_i18n49 = require("@wordpress/i18n");
var TEXT_DIRECTION_LABEL = (0, import_i18n49.__)("Direction", "elementor");
var options10 = [
  {
    value: "ltr",
    label: (0, import_i18n49.__)("Left to right", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React72.createElement(import_icons18.TextDirectionLtrIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "rtl",
    label: (0, import_i18n49.__)("Right to left", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React72.createElement(import_icons18.TextDirectionRtlIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextDirectionField = () => {
  return /* @__PURE__ */ React72.createElement(StylesField, { bind: "direction", propDisplayName: TEXT_DIRECTION_LABEL }, /* @__PURE__ */ React72.createElement(StylesFieldLayout, { label: TEXT_DIRECTION_LABEL }, /* @__PURE__ */ React72.createElement(import_editor_controls45.ToggleControl, { options: options10 })));
};

// src/components/style-sections/typography-section/text-stroke-field.tsx
var React74 = __toESM(require("react"));
var import_editor_controls46 = require("@elementor/editor-controls");
var import_i18n50 = require("@wordpress/i18n");

// src/components/add-or-remove-content.tsx
var React73 = __toESM(require("react"));
var import_icons19 = require("@elementor/icons");
var import_ui33 = require("@elementor/ui");
var SIZE = "tiny";
var AddOrRemoveContent = ({
  isAdded,
  onAdd,
  onRemove,
  children,
  disabled,
  renderLabel
}) => {
  return /* @__PURE__ */ React73.createElement(SectionContent, null, /* @__PURE__ */ React73.createElement(
    import_ui33.Stack,
    {
      direction: "row",
      sx: {
        justifyContent: "space-between",
        alignItems: "center",
        marginInlineEnd: -0.75
      }
    },
    renderLabel(),
    isAdded ? /* @__PURE__ */ React73.createElement(import_ui33.IconButton, { size: SIZE, onClick: onRemove, "aria-label": "Remove", disabled }, /* @__PURE__ */ React73.createElement(import_icons19.MinusIcon, { fontSize: SIZE })) : /* @__PURE__ */ React73.createElement(import_ui33.IconButton, { size: SIZE, onClick: onAdd, "aria-label": "Add", disabled }, /* @__PURE__ */ React73.createElement(import_icons19.PlusIcon, { fontSize: SIZE }))
  ), /* @__PURE__ */ React73.createElement(import_ui33.Collapse, { in: isAdded, unmountOnExit: true }, /* @__PURE__ */ React73.createElement(SectionContent, null, children)));
};

// src/components/style-sections/typography-section/text-stroke-field.tsx
var initTextStroke = {
  $$type: "stroke",
  value: {
    color: {
      $$type: "color",
      value: "#000000"
    },
    width: {
      $$type: "size",
      value: {
        unit: "px",
        size: 1
      }
    }
  }
};
var TEXT_STROKE_LABEL = (0, import_i18n50.__)("Text stroke", "elementor");
var TextStrokeField = () => {
  const { value, setValue, canEdit } = useStylesField("stroke", {
    history: { propDisplayName: TEXT_STROKE_LABEL }
  });
  const addTextStroke = () => {
    setValue(initTextStroke);
  };
  const removeTextStroke = () => {
    setValue(null);
  };
  const hasTextStroke = Boolean(value);
  return /* @__PURE__ */ React74.createElement(StylesField, { bind: "stroke", propDisplayName: TEXT_STROKE_LABEL }, /* @__PURE__ */ React74.createElement(
    AddOrRemoveContent,
    {
      isAdded: hasTextStroke,
      onAdd: addTextStroke,
      onRemove: removeTextStroke,
      disabled: !canEdit,
      renderLabel: () => /* @__PURE__ */ React74.createElement(ControlLabel, null, TEXT_STROKE_LABEL)
    },
    /* @__PURE__ */ React74.createElement(import_editor_controls46.StrokeControl, null)
  ));
};

// src/components/style-sections/typography-section/transform-field.tsx
var React75 = __toESM(require("react"));
var import_editor_controls47 = require("@elementor/editor-controls");
var import_icons20 = require("@elementor/icons");
var import_i18n51 = require("@wordpress/i18n");
var TEXT_TRANSFORM_LABEL = (0, import_i18n51.__)("Text transform", "elementor");
var options11 = [
  {
    value: "none",
    label: (0, import_i18n51.__)("None", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(import_icons20.MinusIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "capitalize",
    label: (0, import_i18n51.__)("Capitalize", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(import_icons20.LetterCaseIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "uppercase",
    label: (0, import_i18n51.__)("Uppercase", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(import_icons20.LetterCaseUpperIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "lowercase",
    label: (0, import_i18n51.__)("Lowercase", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(import_icons20.LetterCaseLowerIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TransformField = () => /* @__PURE__ */ React75.createElement(StylesField, { bind: "text-transform", propDisplayName: TEXT_TRANSFORM_LABEL }, /* @__PURE__ */ React75.createElement(StylesFieldLayout, { label: TEXT_TRANSFORM_LABEL }, /* @__PURE__ */ React75.createElement(import_editor_controls47.ToggleControl, { options: options11 })));

// src/components/style-sections/typography-section/word-spacing-field.tsx
var React76 = __toESM(require("react"));
var import_react31 = require("react");
var import_editor_controls48 = require("@elementor/editor-controls");
var import_i18n52 = require("@wordpress/i18n");
var WORD_SPACING_LABEL = (0, import_i18n52.__)("Word spacing", "elementor");
var WordSpacingField = () => {
  const rowRef = (0, import_react31.useRef)(null);
  return /* @__PURE__ */ React76.createElement(StylesField, { bind: "word-spacing", propDisplayName: WORD_SPACING_LABEL }, /* @__PURE__ */ React76.createElement(StylesFieldLayout, { label: WORD_SPACING_LABEL, ref: rowRef }, /* @__PURE__ */ React76.createElement(import_editor_controls48.SizeControl, { anchorRef: rowRef, min: -Number.MAX_SAFE_INTEGER })));
};

// src/components/style-sections/typography-section/typography-section.tsx
var TypographySection = () => {
  return /* @__PURE__ */ React77.createElement(SectionContent, null, /* @__PURE__ */ React77.createElement(FontFamilyField, null), /* @__PURE__ */ React77.createElement(FontWeightField, null), /* @__PURE__ */ React77.createElement(FontSizeField, null), /* @__PURE__ */ React77.createElement(PanelDivider, null), /* @__PURE__ */ React77.createElement(TextAlignmentField, null), /* @__PURE__ */ React77.createElement(TextColorField, null), /* @__PURE__ */ React77.createElement(
    StyleTabCollapsibleContent,
    {
      fields: [
        "line-height",
        "letter-spacing",
        "word-spacing",
        "column-count",
        "text-decoration",
        "text-transform",
        "direction",
        "font-style",
        "stroke"
      ]
    },
    /* @__PURE__ */ React77.createElement(SectionContent, { sx: { pt: 2 } }, /* @__PURE__ */ React77.createElement(LineHeightField, null), /* @__PURE__ */ React77.createElement(LetterSpacingField, null), /* @__PURE__ */ React77.createElement(WordSpacingField, null), /* @__PURE__ */ React77.createElement(ColumnCountField, null), /* @__PURE__ */ React77.createElement(ColumnGapField, null), /* @__PURE__ */ React77.createElement(PanelDivider, null), /* @__PURE__ */ React77.createElement(TextDecorationField, null), /* @__PURE__ */ React77.createElement(TransformField, null), /* @__PURE__ */ React77.createElement(TextDirectionField, null), /* @__PURE__ */ React77.createElement(FontStyleField, null), /* @__PURE__ */ React77.createElement(TextStrokeField, null))
  ));
};

// src/components/style-tab-section.tsx
var React78 = __toESM(require("react"));
var StyleTabSection = ({ section, fields = [], unmountOnExit = true }) => {
  const { component, name, title, action } = section;
  const tabDefaults = useDefaultPanelSettings();
  const SectionComponent = component || (() => /* @__PURE__ */ React78.createElement(React78.Fragment, null));
  const isExpanded = tabDefaults.defaultSectionsExpanded.style?.includes(name);
  return /* @__PURE__ */ React78.createElement(
    Section,
    {
      title,
      defaultExpanded: isExpanded,
      titleEnd: getStylesInheritanceIndicators(fields),
      unmountOnExit,
      action
    },
    /* @__PURE__ */ React78.createElement(SectionComponent, null)
  );
};

// src/components/style-tab.tsx
var TABS_HEADER_HEIGHT = "37px";
var { Slot: StyleTabSlot, inject: injectIntoStyleTab } = (0, import_locations3.createLocation)();
var stickyHeaderStyles = {
  position: "sticky",
  zIndex: 1100,
  opacity: 1,
  backgroundColor: "background.default",
  transition: "top 300ms ease"
};
var StyleTab = () => {
  const currentClassesProp = useCurrentClassesProp();
  const [activeStyleDefId, setActiveStyleDefId] = useActiveStyleDefId(currentClassesProp ?? "");
  const [activeStyleState, setActiveStyleState] = (0, import_react32.useState)(null);
  const breakpoint = (0, import_editor_responsive3.useActiveBreakpoint)();
  if (!currentClassesProp) {
    return null;
  }
  return /* @__PURE__ */ React79.createElement(ClassesPropProvider, { prop: currentClassesProp }, /* @__PURE__ */ React79.createElement(
    StyleProvider,
    {
      meta: { breakpoint, state: activeStyleState },
      id: activeStyleDefId,
      setId: (id) => {
        setActiveStyleDefId(id);
        setActiveStyleState(null);
      },
      setMetaState: setActiveStyleState
    },
    /* @__PURE__ */ React79.createElement(import_session7.SessionStorageProvider, { prefix: activeStyleDefId ?? "" }, /* @__PURE__ */ React79.createElement(StyleInheritanceProvider, null, /* @__PURE__ */ React79.createElement(ClassesHeader, null, /* @__PURE__ */ React79.createElement(CssClassSelector, null), /* @__PURE__ */ React79.createElement(import_ui34.Divider, null)), /* @__PURE__ */ React79.createElement(SectionsList, null, /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: LayoutSection,
          name: "Layout",
          title: (0, import_i18n53.__)("Layout", "elementor")
        },
        fields: [
          "display",
          "flex-direction",
          "flex-wrap",
          "justify-content",
          "align-items",
          "align-content",
          "align-self",
          "gap"
        ]
      }
    ), /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: SpacingSection,
          name: "Spacing",
          title: (0, import_i18n53.__)("Spacing", "elementor")
        },
        fields: ["margin", "padding"]
      }
    ), /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: SizeSection,
          name: "Size",
          title: (0, import_i18n53.__)("Size", "elementor")
        },
        fields: [
          "width",
          "min-width",
          "max-width",
          "height",
          "min-height",
          "max-height",
          "overflow",
          "aspect-ratio",
          "object-fit"
        ]
      }
    ), /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: PositionSection,
          name: "Position",
          title: (0, import_i18n53.__)("Position", "elementor")
        },
        fields: ["position", "z-index", "scroll-margin-top"]
      }
    ), /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: TypographySection,
          name: "Typography",
          title: (0, import_i18n53.__)("Typography", "elementor")
        },
        fields: [
          "font-family",
          "font-weight",
          "font-size",
          "text-align",
          "color",
          "line-height",
          "letter-spacing",
          "word-spacing",
          "column-count",
          "text-decoration",
          "text-transform",
          "direction",
          "font-style",
          "stroke"
        ]
      }
    ), /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: BackgroundSection,
          name: "Background",
          title: (0, import_i18n53.__)("Background", "elementor")
        },
        fields: ["background"]
      }
    ), /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: BorderSection,
          name: "Border",
          title: (0, import_i18n53.__)("Border", "elementor")
        },
        fields: ["border-radius", "border-width", "border-color", "border-style"]
      }
    ), /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: EffectsSection,
          name: "Effects",
          title: (0, import_i18n53.__)("Effects", "elementor")
        },
        fields: [
          "mix-blend-mode",
          "box-shadow",
          "opacity",
          "transform",
          "filter",
          "backdrop-filter",
          "transform-origin",
          "transition"
        ]
      }
    ), /* @__PURE__ */ React79.createElement(StyleTabSlot, null)), /* @__PURE__ */ React79.createElement(import_ui34.Box, { sx: { height: "150px" } })))
  ));
};
function ClassesHeader({ children }) {
  const scrollDirection = useScrollDirection();
  return /* @__PURE__ */ React79.createElement(import_ui34.Stack, { sx: { ...stickyHeaderStyles, top: scrollDirection === "up" ? TABS_HEADER_HEIGHT : 0 } }, children);
}
function useCurrentClassesProp() {
  const { elementType } = useElement();
  const prop = Object.entries(elementType.propsSchema).find(
    ([, propType]) => propType.kind === "plain" && propType.key === import_editor_props14.CLASSES_PROP_KEY
  );
  if (!prop) {
    return null;
  }
  return prop[0];
}

// src/components/editing-panel-tabs.tsx
var EditingPanelTabs = () => {
  const { element } = useElement();
  return (
    // When switching between elements, the local states should be reset. We are using key to rerender the tabs.
    // Reference: https://react.dev/learn/preserving-and-resetting-state#resetting-a-form-with-a-key
    /* @__PURE__ */ React80.createElement(import_react33.Fragment, { key: element.id }, /* @__PURE__ */ React80.createElement(PanelTabContent, null))
  );
};
var PanelTabContent = () => {
  const editorDefaults = useDefaultPanelSettings();
  const defaultComponentTab = editorDefaults.defaultTab;
  const isInteractionsActive = (0, import_editor_v1_adapters7.isExperimentActive)("e_interactions");
  const [currentTab, setCurrentTab] = useStateByElement("tab", defaultComponentTab);
  const { getTabProps, getTabPanelProps, getTabsProps } = (0, import_ui35.useTabs)(currentTab);
  return /* @__PURE__ */ React80.createElement(ScrollProvider, null, /* @__PURE__ */ React80.createElement(import_ui35.Stack, { direction: "column", sx: { width: "100%" } }, /* @__PURE__ */ React80.createElement(import_ui35.Stack, { sx: { ...stickyHeaderStyles, top: 0 } }, /* @__PURE__ */ React80.createElement(
    import_ui35.Tabs,
    {
      variant: "fullWidth",
      size: "small",
      sx: { mt: 0.5 },
      ...getTabsProps(),
      onChange: (_, newValue) => {
        getTabsProps().onChange(_, newValue);
        setCurrentTab(newValue);
      }
    },
    /* @__PURE__ */ React80.createElement(import_ui35.Tab, { label: (0, import_i18n54.__)("General", "elementor"), ...getTabProps("settings") }),
    /* @__PURE__ */ React80.createElement(import_ui35.Tab, { label: (0, import_i18n54.__)("Style", "elementor"), ...getTabProps("style") }),
    isInteractionsActive && /* @__PURE__ */ React80.createElement(import_ui35.Tab, { label: (0, import_i18n54.__)("Interactions", "elementor"), ...getTabProps("interactions") })
  ), /* @__PURE__ */ React80.createElement(import_ui35.Divider, null)), /* @__PURE__ */ React80.createElement(import_ui35.TabPanel, { ...getTabPanelProps("settings"), disablePadding: true }, /* @__PURE__ */ React80.createElement(SettingsTab, null)), /* @__PURE__ */ React80.createElement(import_ui35.TabPanel, { ...getTabPanelProps("style"), disablePadding: true }, /* @__PURE__ */ React80.createElement(StyleTab, null)), isInteractionsActive && /* @__PURE__ */ React80.createElement(import_ui35.TabPanel, { ...getTabPanelProps("interactions"), disablePadding: true }, /* @__PURE__ */ React80.createElement(InteractionsTab, null))));
};

// src/components/editing-panel.tsx
var { Slot: PanelHeaderTopSlot, inject: injectIntoPanelHeaderTop } = (0, import_locations4.createLocation)();
var { useMenuItems } = import_menus.controlActionsMenu;
var EditingPanel = () => {
  const { element, elementType, settings } = (0, import_editor_elements12.useSelectedElementSettings)();
  const controlReplacements = (0, import_editor_controls49.getControlReplacements)();
  const menuItems = useMenuItems().default;
  if (!element || !elementType) {
    return null;
  }
  const panelTitle = (0, import_i18n55.__)("Edit %s", "elementor").replace("%s", elementType.title);
  const { component: ReplacementComponent } = getEditingPanelReplacement(element, elementType) ?? {};
  let panelContent = /* @__PURE__ */ React81.createElement(React81.Fragment, null, /* @__PURE__ */ React81.createElement(import_editor_panels.PanelHeader, null, /* @__PURE__ */ React81.createElement(import_editor_panels.PanelHeaderTitle, null, panelTitle), /* @__PURE__ */ React81.createElement(import_icons21.AtomIcon, { fontSize: "small", sx: { color: "text.tertiary" } })), /* @__PURE__ */ React81.createElement(import_editor_panels.PanelBody, null, /* @__PURE__ */ React81.createElement(EditingPanelTabs, null)));
  if (ReplacementComponent) {
    panelContent = /* @__PURE__ */ React81.createElement(ReplacementComponent, null);
  }
  return /* @__PURE__ */ React81.createElement(import_ui36.ErrorBoundary, { fallback: /* @__PURE__ */ React81.createElement(EditorPanelErrorFallback, null) }, /* @__PURE__ */ React81.createElement(import_session8.SessionStorageProvider, { prefix: "elementor" }, /* @__PURE__ */ React81.createElement(import_editor_ui7.ThemeProvider, null, /* @__PURE__ */ React81.createElement(import_editor_controls49.ControlActionsProvider, { items: menuItems }, /* @__PURE__ */ React81.createElement(import_editor_controls49.ControlReplacementsProvider, { replacements: controlReplacements }, /* @__PURE__ */ React81.createElement(ElementProvider, { element, elementType, settings }, /* @__PURE__ */ React81.createElement(import_editor_panels.Panel, null, /* @__PURE__ */ React81.createElement(PanelHeaderTopSlot, null), panelContent)))))));
};

// src/init.ts
var import_editor = require("@elementor/editor");
var import_editor_panels3 = require("@elementor/editor-panels");
var import_editor_v1_adapters11 = require("@elementor/editor-v1-adapters");

// src/hooks/use-open-editor-panel.ts
var import_react34 = require("react");
var import_editor_v1_adapters8 = require("@elementor/editor-v1-adapters");

// src/panel.ts
var import_editor_panels2 = require("@elementor/editor-panels");
var { panel, usePanelActions, usePanelStatus } = (0, import_editor_panels2.__createPanel)({
  id: "editing-panel",
  component: EditingPanel
});

// src/sync/is-atomic-widget-selected.ts
var import_editor_elements13 = require("@elementor/editor-elements");
var isAtomicWidgetSelected = () => {
  const selectedElements = (0, import_editor_elements13.getSelectedElements)();
  const widgetCache = (0, import_editor_elements13.getWidgetsCache)();
  if (selectedElements.length !== 1) {
    return false;
  }
  return !!widgetCache?.[selectedElements[0].type]?.atomic_controls;
};

// src/hooks/use-open-editor-panel.ts
var useOpenEditorPanel = () => {
  const { open } = usePanelActions();
  (0, import_react34.useEffect)(() => {
    return (0, import_editor_v1_adapters8.__privateListenTo)((0, import_editor_v1_adapters8.commandStartEvent)("panel/editor/open"), () => {
      if (isAtomicWidgetSelected()) {
        open();
      }
    });
  }, []);
};

// src/components/editing-panel-hooks.tsx
var EditingPanelHooks = () => {
  useOpenEditorPanel();
  return null;
};

// src/components/promotions/init.tsx
var import_editor_controls51 = require("@elementor/editor-controls");

// src/components/promotions/custom-css.tsx
var React82 = __toESM(require("react"));
var import_react35 = require("react");
var import_editor_controls50 = require("@elementor/editor-controls");
var import_i18n56 = require("@wordpress/i18n");
var CustomCssSection = () => {
  const triggerRef = (0, import_react35.useRef)(null);
  return /* @__PURE__ */ React82.createElement(
    StyleTabSection,
    {
      section: {
        name: "Custom CSS",
        title: (0, import_i18n56.__)("Custom CSS", "elementor"),
        action: {
          component: /* @__PURE__ */ React82.createElement(import_editor_controls50.PromotionTrigger, { ref: triggerRef, promotionKey: "customCss" }),
          onClick: () => triggerRef.current?.toggle()
        }
      }
    }
  );
};

// src/components/promotions/init.tsx
var init = () => {
  if (!window.elementorPro) {
    injectIntoStyleTab({
      id: "custom-css",
      component: CustomCssSection,
      options: { overwrite: true }
    });
    controlsRegistry.register("attributes", import_editor_controls51.AttributesControl, "two-columns");
    controlsRegistry.register("display-conditions", import_editor_controls51.DisplayConditionsControl, "two-columns");
  }
};

// src/controls-registry/element-controls/tabs-control/tabs-control.tsx
var React83 = __toESM(require("react"));
var import_editor_controls53 = require("@elementor/editor-controls");
var import_editor_elements16 = require("@elementor/editor-elements");
var import_editor_props16 = require("@elementor/editor-props");
var import_icons22 = require("@elementor/icons");
var import_ui37 = require("@elementor/ui");
var import_i18n58 = require("@wordpress/i18n");

// src/controls-registry/element-controls/get-element-by-type.ts
var import_editor_elements14 = require("@elementor/editor-elements");
var getElementByType = (elementId, type) => {
  const currentElement = (0, import_editor_elements14.getContainer)(elementId);
  if (!currentElement) {
    return null;
  }
  if (currentElement.model.get("elType") === type) {
    return currentElement;
  }
  return currentElement.children?.findRecursive?.((child) => child.model.get("elType") === type) ?? null;
};

// src/controls-registry/element-controls/tabs-control/use-actions.ts
var import_editor_controls52 = require("@elementor/editor-controls");
var import_editor_elements15 = require("@elementor/editor-elements");
var import_editor_props15 = require("@elementor/editor-props");
var import_i18n57 = require("@wordpress/i18n");
var TAB_ELEMENT_TYPE = "e-tab";
var TAB_CONTENT_ELEMENT_TYPE = "e-tab-content";
var useActions = () => {
  const { value, setValue: setDefaultActiveTab } = (0, import_editor_controls52.useBoundProp)(import_editor_props15.numberPropTypeUtil);
  const defaultActiveTab = value ?? 0;
  const duplicateItem = ({
    items: items3,
    tabContentAreaId
  }) => {
    const newDefault = calculateDefaultOnDuplicate({
      items: items3,
      defaultActiveTab
    });
    items3.forEach(({ item, index }) => {
      const tabId = item.id;
      const tabContentAreaContainer = (0, import_editor_elements15.getContainer)(tabContentAreaId);
      const tabContentId = tabContentAreaContainer?.children?.[index]?.id;
      if (!tabContentId) {
        throw new Error("Original content ID is required for duplication");
      }
      (0, import_editor_elements15.duplicateElements)({
        elementIds: [tabId, tabContentId],
        title: (0, import_i18n57.__)("Duplicate Tab", "elementor"),
        onDuplicateElements: () => {
          if (newDefault !== defaultActiveTab) {
            setDefaultActiveTab(newDefault, {}, { withHistory: false });
          }
        },
        onRestoreElements: () => {
          if (newDefault !== defaultActiveTab) {
            setDefaultActiveTab(defaultActiveTab, {}, { withHistory: false });
          }
        }
      });
    });
  };
  const moveItem = ({
    toIndex,
    tabsMenuId,
    tabContentAreaId,
    movedElementId,
    movedElementIndex
  }) => {
    const tabContentContainer = (0, import_editor_elements15.getContainer)(tabContentAreaId);
    const tabContent = tabContentContainer?.children?.[movedElementIndex];
    const movedElement = (0, import_editor_elements15.getContainer)(movedElementId);
    const tabsMenu = (0, import_editor_elements15.getContainer)(tabsMenuId);
    if (!tabContent) {
      throw new Error("Content element is required");
    }
    if (!movedElement || !tabsMenu) {
      throw new Error("Tab element or menu not found");
    }
    const newDefault = calculateDefaultOnMove({
      from: movedElementIndex,
      to: toIndex,
      defaultActiveTab
    });
    (0, import_editor_elements15.moveElements)({
      title: (0, import_i18n57.__)("Reorder Tabs", "elementor"),
      moves: [
        {
          element: movedElement,
          targetContainer: tabsMenu,
          options: { at: toIndex }
        },
        {
          element: tabContent,
          targetContainer: tabContentContainer,
          options: { at: toIndex }
        }
      ],
      onMoveElements: () => {
        if (newDefault !== defaultActiveTab) {
          setDefaultActiveTab(newDefault, {}, { withHistory: false });
        }
      },
      onRestoreElements: () => {
        if (newDefault !== defaultActiveTab) {
          setDefaultActiveTab(defaultActiveTab, {}, { withHistory: false });
        }
      }
    });
  };
  const removeItem = ({
    items: items3,
    tabContentAreaId
  }) => {
    const newDefault = calculateDefaultOnRemove({
      items: items3,
      defaultActiveTab
    });
    (0, import_editor_elements15.removeElements)({
      title: (0, import_i18n57.__)("Tabs", "elementor"),
      elementIds: items3.flatMap(({ item, index }) => {
        const tabId = item.id;
        const tabContentContainer = (0, import_editor_elements15.getContainer)(tabContentAreaId);
        const tabContentId = tabContentContainer?.children?.[index]?.id;
        if (!tabContentId) {
          throw new Error("Content ID is required");
        }
        return [tabId, tabContentId];
      }),
      onRemoveElements: () => {
        if (newDefault !== defaultActiveTab) {
          setDefaultActiveTab(newDefault, {}, { withHistory: false });
        }
      },
      onRestoreElements: () => {
        if (newDefault !== defaultActiveTab) {
          setDefaultActiveTab(defaultActiveTab, {}, { withHistory: false });
        }
      }
    });
  };
  const addItem = ({
    tabContentAreaId,
    tabsMenuId,
    items: items3
  }) => {
    const tabContentArea = (0, import_editor_elements15.getContainer)(tabContentAreaId);
    const tabsMenu = (0, import_editor_elements15.getContainer)(tabsMenuId);
    if (!tabContentArea || !tabsMenu) {
      throw new Error("Tab containers not found");
    }
    items3.forEach(({ index }) => {
      const position = index + 1;
      (0, import_editor_elements15.createElements)({
        title: (0, import_i18n57.__)("Tabs", "elementor"),
        elements: [
          {
            container: tabContentArea,
            model: {
              elType: TAB_CONTENT_ELEMENT_TYPE,
              editor_settings: { title: `Tab ${position} content`, initial_position: position }
            }
          },
          {
            container: tabsMenu,
            model: {
              elType: TAB_ELEMENT_TYPE,
              editor_settings: { title: `Tab ${position} trigger`, initial_position: position }
            }
          }
        ]
      });
    });
  };
  return {
    duplicateItem,
    moveItem,
    removeItem,
    addItem
  };
};
var calculateDefaultOnMove = ({
  from,
  to,
  defaultActiveTab
}) => {
  if (from === defaultActiveTab) {
    return to;
  }
  if (from < defaultActiveTab && to >= defaultActiveTab) {
    return defaultActiveTab - 1;
  }
  if (from > defaultActiveTab && to <= defaultActiveTab) {
    return defaultActiveTab + 1;
  }
  return defaultActiveTab;
};
var calculateDefaultOnRemove = ({
  items: items3,
  defaultActiveTab
}) => {
  const isDefault = items3.some(({ index }) => index === defaultActiveTab);
  if (isDefault) {
    return 0;
  }
  const defaultGap = items3.reduce((acc, { index }) => index < defaultActiveTab ? acc + 1 : acc, 0);
  return defaultActiveTab - defaultGap;
};
var calculateDefaultOnDuplicate = ({
  items: items3,
  defaultActiveTab
}) => {
  const duplicatesBefore = items3.reduce((acc, { index }) => {
    const isDuplicatedBeforeDefault = index < defaultActiveTab;
    return isDuplicatedBeforeDefault ? acc + 1 : acc;
  }, 0);
  return defaultActiveTab + duplicatesBefore;
};

// src/controls-registry/element-controls/tabs-control/tabs-control.tsx
var TAB_MENU_ELEMENT_TYPE = "e-tabs-menu";
var TAB_CONTENT_AREA_ELEMENT_TYPE = "e-tabs-content-area";
var TabsControl = ({ label }) => {
  return /* @__PURE__ */ React83.createElement(SettingsField, { bind: "default-active-tab", propDisplayName: (0, import_i18n58.__)("Tabs", "elementor") }, /* @__PURE__ */ React83.createElement(TabsControlContent, { label }));
};
var TabsControlContent = ({ label }) => {
  const { element } = useElement();
  const { addItem, duplicateItem, moveItem, removeItem } = useActions();
  const { [TAB_ELEMENT_TYPE]: tabLinks } = (0, import_editor_elements16.useElementChildren)(element.id, {
    [TAB_MENU_ELEMENT_TYPE]: TAB_ELEMENT_TYPE
  });
  const tabList = getElementByType(element.id, TAB_MENU_ELEMENT_TYPE);
  const tabContentArea = getElementByType(element.id, TAB_CONTENT_AREA_ELEMENT_TYPE);
  const repeaterValues = tabLinks.map((tabLink, index) => {
    return {
      id: tabLink.id,
      title: tabLink.editorSettings?.title,
      index
    };
  });
  const setValue = (_newValues, _options, meta) => {
    if (meta?.action?.type === "add") {
      const items3 = meta.action.payload;
      return addItem({ tabContentAreaId: tabContentArea.id, items: items3, tabsMenuId: tabList.id });
    }
    if (meta?.action?.type === "remove") {
      const items3 = meta.action.payload;
      return removeItem({
        items: items3,
        tabContentAreaId: tabContentArea.id
      });
    }
    if (meta?.action?.type === "duplicate") {
      const items3 = meta.action.payload;
      return duplicateItem({ items: items3, tabContentAreaId: tabContentArea.id });
    }
    if (meta?.action?.type === "reorder") {
      const { from, to } = meta.action.payload;
      return moveItem({
        toIndex: to,
        tabsMenuId: tabList.id,
        tabContentAreaId: tabContentArea.id,
        movedElementId: tabLinks[from].id,
        movedElementIndex: from
      });
    }
  };
  return /* @__PURE__ */ React83.createElement(
    import_editor_controls53.Repeater,
    {
      showToggle: false,
      values: repeaterValues,
      setValues: setValue,
      showRemove: repeaterValues.length > 1,
      label,
      itemSettings: {
        getId: ({ item }) => item.id,
        initialValues: { id: "", title: "Tab" },
        Label: ItemLabel,
        Content: ItemContent,
        Icon: () => null
      }
    }
  );
};
var ItemLabel = ({ value, index }) => {
  const elementTitle = value?.title;
  return /* @__PURE__ */ React83.createElement(import_ui37.Stack, { sx: { minHeight: 20 }, direction: "row", alignItems: "center", gap: 1.5 }, /* @__PURE__ */ React83.createElement("span", null, elementTitle), /* @__PURE__ */ React83.createElement(ItemDefaultTab, { index }));
};
var ItemDefaultTab = ({ index }) => {
  const { value: defaultItem } = (0, import_editor_controls53.useBoundProp)(import_editor_props16.numberPropTypeUtil);
  const isDefault = defaultItem === index;
  if (!isDefault) {
    return null;
  }
  return /* @__PURE__ */ React83.createElement(import_ui37.Chip, { size: "tiny", shape: "rounded", label: (0, import_i18n58.__)("Default", "elementor") });
};
var ItemContent = ({ value, index }) => {
  if (!value.id) {
    return null;
  }
  return /* @__PURE__ */ React83.createElement(import_ui37.Stack, { p: 2, gap: 1.5 }, /* @__PURE__ */ React83.createElement(TabLabelControl, { elementId: value.id }), /* @__PURE__ */ React83.createElement(SettingsField, { bind: "default-active-tab", propDisplayName: (0, import_i18n58.__)("Tabs", "elementor") }, /* @__PURE__ */ React83.createElement(DefaultTabControl, { tabIndex: index })));
};
var DefaultTabControl = ({ tabIndex }) => {
  const { value, setValue } = (0, import_editor_controls53.useBoundProp)(import_editor_props16.numberPropTypeUtil);
  const isDefault = value === tabIndex;
  return /* @__PURE__ */ React83.createElement(import_ui37.Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", gap: 2 }, /* @__PURE__ */ React83.createElement(import_editor_controls53.ControlFormLabel, null, (0, import_i18n58.__)("Set as default tab", "elementor")), /* @__PURE__ */ React83.createElement(ConditionalTooltip, { showTooltip: isDefault, placement: "right" }, /* @__PURE__ */ React83.createElement(
    import_ui37.Switch,
    {
      size: "small",
      checked: isDefault,
      disabled: isDefault,
      onChange: ({ target }) => {
        setValue(target.checked ? tabIndex : null);
      },
      inputProps: {
        ...isDefault ? { style: { opacity: 0, cursor: "not-allowed" } } : {}
      }
    }
  )));
};
var TabLabelControl = ({ elementId }) => {
  const editorSettings = (0, import_editor_elements16.useElementEditorSettings)(elementId);
  const label = editorSettings?.title ?? "";
  return /* @__PURE__ */ React83.createElement(import_ui37.Stack, { gap: 1 }, /* @__PURE__ */ React83.createElement(import_editor_controls53.ControlFormLabel, null, (0, import_i18n58.__)("Tab name", "elementor")), /* @__PURE__ */ React83.createElement(
    import_ui37.TextField,
    {
      size: "tiny",
      value: label,
      onChange: ({ target }) => {
        (0, import_editor_elements16.updateElementEditorSettings)({
          elementId,
          settings: { title: target.value }
        });
      }
    }
  ));
};
var ConditionalTooltip = ({
  showTooltip,
  children
}) => {
  if (!showTooltip) {
    return children;
  }
  return /* @__PURE__ */ React83.createElement(
    import_ui37.Infotip,
    {
      arrow: false,
      content: /* @__PURE__ */ React83.createElement(
        import_ui37.Alert,
        {
          color: "secondary",
          icon: /* @__PURE__ */ React83.createElement(import_icons22.InfoCircleFilledIcon, { fontSize: "tiny" }),
          size: "small",
          sx: { width: 288 }
        },
        /* @__PURE__ */ React83.createElement(import_ui37.Typography, { variant: "body2" }, (0, import_i18n58.__)("To change the default tab, simply set another tab as default.", "elementor"))
      )
    },
    /* @__PURE__ */ React83.createElement("span", null, children)
  );
};

// src/controls-registry/element-controls/registry.ts
var controlTypes2 = {
  tabs: { component: TabsControl, layout: "full" }
};
var registerElementControls = () => {
  Object.entries(controlTypes2).forEach(
    ([type, { component, layout }]) => {
      controlsRegistry.register(type, component, layout);
    }
  );
};

// src/dynamics/init.ts
var import_editor_canvas3 = require("@elementor/editor-canvas");
var import_editor_controls60 = require("@elementor/editor-controls");
var import_menus2 = require("@elementor/menus");

// src/dynamics/components/background-control-dynamic-tag.tsx
var React84 = __toESM(require("react"));
var import_editor_controls55 = require("@elementor/editor-controls");
var import_editor_props18 = require("@elementor/editor-props");
var import_icons23 = require("@elementor/icons");

// src/dynamics/hooks/use-dynamic-tag.ts
var import_react38 = require("react");

// src/dynamics/hooks/use-prop-dynamic-tags.ts
var import_react37 = require("react");
var import_editor_controls54 = require("@elementor/editor-controls");

// src/dynamics/sync/get-atomic-dynamic-tags.ts
var import_editor_v1_adapters9 = require("@elementor/editor-v1-adapters");

// src/hooks/use-license-config.ts
var import_react36 = require("react");
var config = { expired: false };
var listeners = /* @__PURE__ */ new Set();
function setLicenseConfig(newConfig) {
  config = { ...config, ...newConfig };
  listeners.forEach((listener) => listener());
}
function getLicenseConfig() {
  return config;
}
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function useLicenseConfig() {
  return (0, import_react36.useSyncExternalStore)(subscribe, getLicenseConfig, getLicenseConfig);
}

// src/dynamics/sync/get-atomic-dynamic-tags.ts
var getAtomicDynamicTags = (shouldFilterByLicense = true) => {
  const { atomicDynamicTags } = (0, import_editor_v1_adapters9.getElementorConfig)();
  if (!atomicDynamicTags) {
    return null;
  }
  return {
    tags: shouldFilterByLicense ? filterByLicense(atomicDynamicTags.tags) : atomicDynamicTags.tags,
    groups: atomicDynamicTags.groups
  };
};
var filterByLicense = (tags) => {
  const { expired } = getLicenseConfig();
  if (expired) {
    return Object.fromEntries(
      Object.entries(tags).filter(
        ([, tag]) => !(tag?.meta?.origin === "elementor" && tag?.meta?.required_license)
      )
    );
  }
  return tags;
};

// src/dynamics/utils.ts
var import_editor_props17 = require("@elementor/editor-props");
var import_editor_v1_adapters10 = require("@elementor/editor-v1-adapters");
var import_schema = require("@elementor/schema");
var DYNAMIC_PROP_TYPE_KEY = "dynamic";
var dynamicPropTypeUtil = (0, import_editor_props17.createPropUtils)(
  DYNAMIC_PROP_TYPE_KEY,
  import_schema.z.strictObject({
    name: import_schema.z.string(),
    group: import_schema.z.string(),
    settings: import_schema.z.any().optional()
  })
);
var isDynamicTagSupported = (tagName) => {
  return !!(0, import_editor_v1_adapters10.getElementorConfig)()?.atomicDynamicTags?.tags?.[tagName];
};
var isDynamicPropType = (prop) => prop.key === DYNAMIC_PROP_TYPE_KEY;
var getDynamicPropType = (propType) => {
  const dynamicPropType = propType.kind === "union" && propType.prop_types[DYNAMIC_PROP_TYPE_KEY];
  return dynamicPropType && isDynamicPropType(dynamicPropType) ? dynamicPropType : null;
};
var isDynamicPropValue = (prop) => {
  return (0, import_editor_props17.isTransformable)(prop) && prop.$$type === DYNAMIC_PROP_TYPE_KEY;
};
var supportsDynamic = (propType) => {
  return !!getDynamicPropType(propType);
};

// src/dynamics/hooks/use-prop-dynamic-tags.ts
var usePropDynamicTags = () => {
  return usePropDynamicTagsInternal(true);
};
var useAllPropDynamicTags = () => {
  return usePropDynamicTagsInternal(false);
};
var usePropDynamicTagsInternal = (filterByLicense2) => {
  let categories = [];
  const { propType } = (0, import_editor_controls54.useBoundProp)();
  if (propType) {
    const propDynamicType = getDynamicPropType(propType);
    categories = propDynamicType?.settings.categories || [];
  }
  const categoriesKey = categories.join();
  return (0, import_react37.useMemo)(
    () => getDynamicTagsByCategories(categories, filterByLicense2),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoriesKey, filterByLicense2]
  );
};
var getDynamicTagsByCategories = (categories, filterByLicense2) => {
  const { tags, groups } = getAtomicDynamicTags(filterByLicense2) || {};
  if (!categories.length || !tags || !groups) {
    return [];
  }
  const _categories = new Set(categories);
  const dynamicTags = [];
  const groupedFilteredTags = {};
  for (const tag of Object.values(tags)) {
    if (!tag.categories.some((category) => _categories.has(category))) {
      continue;
    }
    if (!groupedFilteredTags[tag.group]) {
      groupedFilteredTags[tag.group] = [];
    }
    groupedFilteredTags[tag.group].push(tag);
  }
  for (const group in groups) {
    if (groupedFilteredTags[group]) {
      dynamicTags.push(...groupedFilteredTags[group]);
    }
  }
  return dynamicTags;
};

// src/dynamics/hooks/use-dynamic-tag.ts
var useDynamicTag = (tagName) => {
  const dynamicTags = useAllPropDynamicTags();
  return (0, import_react38.useMemo)(() => dynamicTags.find((tag) => tag.name === tagName) ?? null, [dynamicTags, tagName]);
};

// src/dynamics/components/background-control-dynamic-tag.tsx
var BackgroundControlDynamicTagIcon = () => /* @__PURE__ */ React84.createElement(import_icons23.DatabaseIcon, { fontSize: "tiny" });
var BackgroundControlDynamicTagLabel = ({ value }) => {
  const context = (0, import_editor_controls55.useBoundProp)(import_editor_props18.backgroundImageOverlayPropTypeUtil);
  return /* @__PURE__ */ React84.createElement(import_editor_controls55.PropProvider, { ...context, value: value.value }, /* @__PURE__ */ React84.createElement(import_editor_controls55.PropKeyProvider, { bind: "image" }, /* @__PURE__ */ React84.createElement(Wrapper2, { rawValue: value.value })));
};
var Wrapper2 = ({ rawValue }) => {
  const { propType } = (0, import_editor_controls55.useBoundProp)();
  const imageOverlayPropType = propType.prop_types["background-image-overlay"];
  return /* @__PURE__ */ React84.createElement(import_editor_controls55.PropProvider, { propType: imageOverlayPropType.shape.image, value: rawValue, setValue: () => void 0 }, /* @__PURE__ */ React84.createElement(import_editor_controls55.PropKeyProvider, { bind: "src" }, /* @__PURE__ */ React84.createElement(Content, { rawValue: rawValue.image })));
};
var Content = ({ rawValue }) => {
  const src = rawValue.value.src;
  const dynamicTag = useDynamicTag(src.value.name || "");
  return /* @__PURE__ */ React84.createElement(React84.Fragment, null, dynamicTag?.label);
};

// src/dynamics/components/dynamic-selection-control.tsx
var React88 = __toESM(require("react"));
var import_editor_controls58 = require("@elementor/editor-controls");
var import_editor_ui9 = require("@elementor/editor-ui");
var import_icons25 = require("@elementor/icons");
var import_ui39 = require("@elementor/ui");
var import_i18n60 = require("@wordpress/i18n");

// src/hooks/use-persist-dynamic-value.ts
var import_session9 = require("@elementor/session");
var usePersistDynamicValue = (propKey) => {
  const { element } = useElement();
  const prefixedKey = `dynamic/non-dynamic-values-history/${element.id}/${propKey}`;
  return (0, import_session9.useSessionStorage)(prefixedKey);
};

// src/dynamics/dynamic-control.tsx
var React86 = __toESM(require("react"));
var import_editor_controls56 = require("@elementor/editor-controls");

// src/dynamics/components/dynamic-conditional-control.tsx
var React85 = __toESM(require("react"));
var import_editor_props19 = require("@elementor/editor-props");
var DynamicConditionalControl = ({
  children,
  propType,
  propsSchema,
  dynamicSettings
}) => {
  const defaults = React85.useMemo(() => {
    if (!propsSchema) {
      return {};
    }
    const entries = Object.entries(propsSchema);
    return entries.reduce((result, [key, prop]) => {
      result[key] = prop?.default ?? null;
      return result;
    }, {});
  }, [propsSchema]);
  const convertedSettings = React85.useMemo(() => {
    if (!dynamicSettings) {
      return {};
    }
    return Object.entries(dynamicSettings).reduce(
      (result, [key, dynamicValue]) => {
        if (dynamicValue && typeof dynamicValue === "object" && "$$type" in dynamicValue) {
          result[key] = dynamicValue;
        } else {
          result[key] = {
            $$type: "plain",
            value: dynamicValue
          };
        }
        return result;
      },
      {}
    );
  }, [dynamicSettings]);
  const effectiveSettings = React85.useMemo(() => {
    return { ...defaults, ...convertedSettings };
  }, [defaults, convertedSettings]);
  if (!propType?.dependencies?.terms.length) {
    return /* @__PURE__ */ React85.createElement(React85.Fragment, null, children);
  }
  const isHidden = !(0, import_editor_props19.isDependencyMet)(propType?.dependencies, effectiveSettings).isMet;
  return isHidden ? null : /* @__PURE__ */ React85.createElement(React85.Fragment, null, children);
};

// src/dynamics/dynamic-control.tsx
var DynamicControl = ({ bind, children }) => {
  const { value, setValue } = (0, import_editor_controls56.useBoundProp)(dynamicPropTypeUtil);
  const { name = "", group = "", settings } = value ?? {};
  const dynamicTag = useDynamicTag(name);
  if (!dynamicTag) {
    throw new Error(`Dynamic tag ${name} not found`);
  }
  const dynamicPropType = dynamicTag.props_schema[bind];
  const defaultValue = dynamicPropType?.default;
  const dynamicValue = settings?.[bind] ?? defaultValue;
  const setDynamicValue = (newValues) => {
    setValue({
      name,
      group,
      settings: {
        ...settings,
        ...newValues
      }
    });
  };
  const propType = createTopLevelObjectType({ schema: dynamicTag.props_schema });
  return /* @__PURE__ */ React86.createElement(import_editor_controls56.PropProvider, { propType, setValue: setDynamicValue, value: { [bind]: dynamicValue } }, /* @__PURE__ */ React86.createElement(import_editor_controls56.PropKeyProvider, { bind }, /* @__PURE__ */ React86.createElement(
    DynamicConditionalControl,
    {
      propType: dynamicPropType,
      propsSchema: dynamicTag.props_schema,
      dynamicSettings: settings
    },
    children
  )));
};

// src/dynamics/components/dynamic-selection.tsx
var import_react39 = require("react");
var React87 = __toESM(require("react"));
var import_editor_controls57 = require("@elementor/editor-controls");
var import_editor_ui8 = require("@elementor/editor-ui");
var import_icons24 = require("@elementor/icons");
var import_ui38 = require("@elementor/ui");
var import_i18n59 = require("@wordpress/i18n");
var SIZE2 = "tiny";
var PROMO_TEXT_WIDTH = 170;
var PRO_DYNAMIC_TAGS_URL = "https://go.elementor.com/go-pro-dynamic-tags-modal/";
var RENEW_DYNAMIC_TAGS_URL = "https://go.elementor.com/go-pro-dynamic-tags-renew-modal/";
var DynamicSelection = ({ close: closePopover, expired = false }) => {
  const [searchValue, setSearchValue] = (0, import_react39.useState)("");
  const { groups: dynamicGroups } = getAtomicDynamicTags() || {};
  const theme = (0, import_ui38.useTheme)();
  const { value: anyValue } = (0, import_editor_controls57.useBoundProp)();
  const { bind, value: dynamicValue, setValue } = (0, import_editor_controls57.useBoundProp)(dynamicPropTypeUtil);
  const [, updatePropValueHistory] = usePersistDynamicValue(bind);
  const isCurrentValueDynamic = !!dynamicValue;
  const options12 = useFilteredOptions(searchValue);
  const hasNoDynamicTags = !options12.length && !searchValue.trim();
  const handleSearch = (value) => {
    setSearchValue(value);
  };
  const handleSetDynamicTag = (value) => {
    if (!isCurrentValueDynamic) {
      updatePropValueHistory(anyValue);
    }
    const selectedOption = options12.flatMap(([, items3]) => items3).find((item) => item.value === value);
    setValue({ name: value, group: selectedOption?.group ?? "", settings: { label: selectedOption?.label } });
    closePopover();
  };
  const virtualizedItems = options12.flatMap(([category, items3]) => [
    {
      type: "category",
      value: category,
      label: dynamicGroups?.[category]?.title || category
    },
    ...items3.map((item) => ({
      type: "item",
      value: item.value,
      label: item.label
    }))
  ]);
  const getPopOverContent = () => {
    if (hasNoDynamicTags) {
      return /* @__PURE__ */ React87.createElement(NoDynamicTags, null);
    }
    if (expired) {
      return /* @__PURE__ */ React87.createElement(ExpiredDynamicTags, null);
    }
    return /* @__PURE__ */ React87.createElement(import_react39.Fragment, null, /* @__PURE__ */ React87.createElement(
      import_editor_ui8.SearchField,
      {
        value: searchValue,
        onSearch: handleSearch,
        placeholder: (0, import_i18n59.__)("Search dynamic tags\u2026", "elementor")
      }
    ), /* @__PURE__ */ React87.createElement(import_ui38.Divider, null), /* @__PURE__ */ React87.createElement(
      import_editor_ui8.PopoverMenuList,
      {
        items: virtualizedItems,
        onSelect: handleSetDynamicTag,
        onClose: closePopover,
        selectedValue: dynamicValue?.name,
        itemStyle: (item) => item.type === "item" ? { paddingInlineStart: theme.spacing(3.5) } : {},
        noResultsComponent: /* @__PURE__ */ React87.createElement(NoResults, { searchValue, onClear: () => setSearchValue("") })
      }
    ));
  };
  return /* @__PURE__ */ React87.createElement(import_editor_ui8.SectionPopoverBody, { "aria-label": (0, import_i18n59.__)("Dynamic tags", "elementor") }, /* @__PURE__ */ React87.createElement(
    import_editor_ui8.PopoverHeader,
    {
      title: (0, import_i18n59.__)("Dynamic tags", "elementor"),
      onClose: closePopover,
      icon: /* @__PURE__ */ React87.createElement(import_icons24.DatabaseIcon, { fontSize: SIZE2 })
    }
  ), getPopOverContent());
};
var NoResults = ({ searchValue, onClear }) => /* @__PURE__ */ React87.createElement(
  import_ui38.Stack,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    p: 2.5,
    color: "text.secondary",
    sx: { pb: 3.5 }
  },
  /* @__PURE__ */ React87.createElement(import_icons24.DatabaseIcon, { fontSize: "large" }),
  /* @__PURE__ */ React87.createElement(import_ui38.Typography, { align: "center", variant: "subtitle2" }, (0, import_i18n59.__)("Sorry, nothing matched", "elementor"), /* @__PURE__ */ React87.createElement("br", null), "\u201C", searchValue, "\u201D."),
  /* @__PURE__ */ React87.createElement(import_ui38.Typography, { align: "center", variant: "caption", sx: { display: "flex", flexDirection: "column" } }, (0, import_i18n59.__)("Try something else.", "elementor"), /* @__PURE__ */ React87.createElement(import_ui38.Link, { color: "text.secondary", variant: "caption", component: "button", onClick: onClear }, (0, import_i18n59.__)("Clear & try again", "elementor")))
);
var NoDynamicTags = () => /* @__PURE__ */ React87.createElement(React87.Fragment, null, /* @__PURE__ */ React87.createElement(import_ui38.Divider, null), /* @__PURE__ */ React87.createElement(
  import_ui38.Stack,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    p: 2.5,
    color: "text.secondary",
    sx: { pb: 3.5 }
  },
  /* @__PURE__ */ React87.createElement(import_icons24.DatabaseIcon, { fontSize: "large" }),
  /* @__PURE__ */ React87.createElement(import_ui38.Typography, { align: "center", variant: "subtitle2" }, (0, import_i18n59.__)("Streamline your workflow with dynamic tags", "elementor")),
  /* @__PURE__ */ React87.createElement(import_ui38.Typography, { align: "center", variant: "caption", width: PROMO_TEXT_WIDTH }, (0, import_i18n59.__)("Upgrade now to display your content dynamically.", "elementor")),
  /* @__PURE__ */ React87.createElement(import_editor_ui8.CtaButton, { size: "small", href: PRO_DYNAMIC_TAGS_URL })
));
var ExpiredDynamicTags = () => /* @__PURE__ */ React87.createElement(React87.Fragment, null, /* @__PURE__ */ React87.createElement(import_ui38.Divider, null), /* @__PURE__ */ React87.createElement(
  import_ui38.Stack,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    p: 2.5,
    color: "text.secondary",
    sx: { pb: 3.5 }
  },
  /* @__PURE__ */ React87.createElement(import_icons24.DatabaseIcon, { fontSize: "large" }),
  /* @__PURE__ */ React87.createElement(import_ui38.Typography, { align: "center", variant: "subtitle2" }, (0, import_i18n59.__)("Unlock your Dynamic tags again", "elementor")),
  /* @__PURE__ */ React87.createElement(import_ui38.Typography, { align: "center", variant: "caption", width: PROMO_TEXT_WIDTH }, (0, import_i18n59.__)("Dynamic tags need Elementor Pro. Renew now to keep them active.", "elementor")),
  /* @__PURE__ */ React87.createElement(import_editor_ui8.CtaButton, { size: "small", href: RENEW_DYNAMIC_TAGS_URL, children: (0, import_i18n59.__)("Renew Now", "elementor") })
));
var useFilteredOptions = (searchValue) => {
  const dynamicTags = usePropDynamicTags();
  const options12 = dynamicTags.reduce((categories, { name, label, group }) => {
    const isVisible = label.toLowerCase().includes(searchValue.trim().toLowerCase());
    if (!isVisible) {
      return categories;
    }
    if (!categories.has(group)) {
      categories.set(group, []);
    }
    categories.get(group)?.push({ label, group, value: name });
    return categories;
  }, /* @__PURE__ */ new Map());
  return [...options12];
};

// src/dynamics/components/dynamic-selection-control.tsx
var SIZE3 = "tiny";
var tagsWithoutTabs = ["popup"];
var DynamicSelectionControl = ({ OriginalControl, ...props }) => {
  const { setValue: setAnyValue, propType } = (0, import_editor_controls58.useBoundProp)();
  const { bind, value } = (0, import_editor_controls58.useBoundProp)(dynamicPropTypeUtil);
  const { expired: readonly } = useLicenseConfig();
  const originalPropType = createTopLevelObjectType({
    schema: {
      [bind]: propType
    }
  });
  const [propValueFromHistory] = usePersistDynamicValue(bind);
  const selectionPopoverState = (0, import_ui39.usePopupState)({ variant: "popover" });
  const { name: tagName = "" } = value;
  const dynamicTag = useDynamicTag(tagName);
  if (!isDynamicTagSupported(tagName) && OriginalControl) {
    return /* @__PURE__ */ React88.createElement(import_editor_controls58.PropProvider, { propType: originalPropType, value: { [bind]: null }, setValue: setAnyValue }, /* @__PURE__ */ React88.createElement(import_editor_controls58.PropKeyProvider, { bind }, /* @__PURE__ */ React88.createElement(OriginalControl, { ...props })));
  }
  const removeDynamicTag = () => {
    setAnyValue(propValueFromHistory ?? null);
  };
  if (!dynamicTag) {
    throw new Error(`Dynamic tag ${tagName} not found`);
  }
  return /* @__PURE__ */ React88.createElement(import_ui39.Box, null, /* @__PURE__ */ React88.createElement(
    import_ui39.UnstableTag,
    {
      fullWidth: true,
      showActionsOnHover: true,
      label: dynamicTag.label,
      startIcon: /* @__PURE__ */ React88.createElement(import_icons25.DatabaseIcon, { fontSize: SIZE3 }),
      ...(0, import_ui39.bindTrigger)(selectionPopoverState),
      actions: /* @__PURE__ */ React88.createElement(React88.Fragment, null, /* @__PURE__ */ React88.createElement(DynamicSettingsPopover, { dynamicTag, disabled: readonly }), /* @__PURE__ */ React88.createElement(
        import_ui39.IconButton,
        {
          size: SIZE3,
          onClick: removeDynamicTag,
          "aria-label": (0, import_i18n60.__)("Remove dynamic value", "elementor")
        },
        /* @__PURE__ */ React88.createElement(import_icons25.XIcon, { fontSize: SIZE3 })
      ))
    }
  ), /* @__PURE__ */ React88.createElement(
    import_ui39.Popover,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...(0, import_ui39.bindPopover)(selectionPopoverState)
    },
    /* @__PURE__ */ React88.createElement(import_editor_ui9.SectionPopoverBody, { "aria-label": (0, import_i18n60.__)("Dynamic tags", "elementor") }, /* @__PURE__ */ React88.createElement(DynamicSelection, { close: selectionPopoverState.close, expired: readonly }))
  ));
};
var DynamicSettingsPopover = ({
  dynamicTag,
  disabled = false
}) => {
  const popupState = (0, import_ui39.usePopupState)({ variant: "popover" });
  const hasDynamicSettings = !!dynamicTag.atomic_controls.length;
  if (!hasDynamicSettings) {
    return null;
  }
  return /* @__PURE__ */ React88.createElement(React88.Fragment, null, /* @__PURE__ */ React88.createElement(
    import_ui39.IconButton,
    {
      size: SIZE3,
      disabled,
      ...!disabled && (0, import_ui39.bindTrigger)(popupState),
      "aria-label": (0, import_i18n60.__)("Dynamic settings", "elementor")
    },
    /* @__PURE__ */ React88.createElement(import_icons25.SettingsIcon, { fontSize: SIZE3 })
  ), /* @__PURE__ */ React88.createElement(
    import_ui39.Popover,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...(0, import_ui39.bindPopover)(popupState)
    },
    /* @__PURE__ */ React88.createElement(import_editor_ui9.SectionPopoverBody, { "aria-label": (0, import_i18n60.__)("Dynamic settings", "elementor") }, /* @__PURE__ */ React88.createElement(
      import_editor_ui9.PopoverHeader,
      {
        title: dynamicTag.label,
        onClose: popupState.close,
        icon: /* @__PURE__ */ React88.createElement(import_icons25.DatabaseIcon, { fontSize: SIZE3 })
      }
    ), /* @__PURE__ */ React88.createElement(DynamicSettings, { controls: dynamicTag.atomic_controls, tagName: dynamicTag.name }))
  ));
};
var DynamicSettings = ({ controls, tagName }) => {
  const tabs = controls.filter(({ type }) => type === "section");
  const { getTabsProps, getTabProps, getTabPanelProps } = (0, import_ui39.useTabs)(0);
  if (!tabs.length) {
    return null;
  }
  if (tagsWithoutTabs.includes(tagName)) {
    const singleTab = tabs[0];
    return /* @__PURE__ */ React88.createElement(React88.Fragment, null, /* @__PURE__ */ React88.createElement(import_ui39.Divider, null), /* @__PURE__ */ React88.createElement(ControlsItemsStack, { items: singleTab.value.items }));
  }
  return /* @__PURE__ */ React88.createElement(React88.Fragment, null, tabs.length > 1 && /* @__PURE__ */ React88.createElement(import_ui39.Tabs, { size: "small", variant: "fullWidth", ...getTabsProps() }, tabs.map(({ value }, index) => /* @__PURE__ */ React88.createElement(
    import_ui39.Tab,
    {
      key: index,
      label: value.label,
      sx: { px: 1, py: 0.5 },
      ...getTabProps(index)
    }
  ))), /* @__PURE__ */ React88.createElement(import_ui39.Divider, null), tabs.map(({ value }, index) => {
    return /* @__PURE__ */ React88.createElement(
      import_ui39.TabPanel,
      {
        key: index,
        sx: { flexGrow: 1, py: 0, overflowY: "auto" },
        ...getTabPanelProps(index)
      },
      /* @__PURE__ */ React88.createElement(ControlsItemsStack, { items: value.items })
    );
  }));
};
var LAYOUT_OVERRIDE_FIELDS = {
  separator: "two-columns",
  action: "full",
  off_canvas: "full",
  type: "two-columns"
};
var DYNAMIC_TAG_LAYOUT_OVERRIDES = {
  select: "full"
};
var getLayout = (control) => {
  const dynamicOverride = DYNAMIC_TAG_LAYOUT_OVERRIDES[control.type];
  if (dynamicOverride) {
    return dynamicOverride;
  }
  return LAYOUT_OVERRIDE_FIELDS[control.bind] ?? controlsRegistry.getLayout(control.type);
};
var Control2 = ({ control }) => {
  if (!controlsRegistry.get(control.type)) {
    return null;
  }
  const layout = getLayout(control);
  const shouldDisablePortal = control.type === "select";
  const baseControlProps = shouldDisablePortal ? {
    ...control.props,
    MenuProps: {
      ...control.props?.MenuProps ?? {},
      disablePortal: true
    }
  } : { ...control.props };
  const controlProps = {
    ...baseControlProps,
    ariaLabel: control.label
  };
  const isSwitchControl = control.type === "switch";
  const layoutStyleProps = layout === "two-columns" ? {
    display: "grid",
    gridTemplateColumns: isSwitchControl ? "minmax(0, 1fr) max-content" : "1fr 1fr"
  } : {};
  return /* @__PURE__ */ React88.createElement(DynamicControl, { bind: control.bind }, /* @__PURE__ */ React88.createElement(import_ui39.Grid, { container: true, gap: 0.75, sx: layoutStyleProps }, control.label ? /* @__PURE__ */ React88.createElement(import_ui39.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React88.createElement(import_editor_controls58.ControlFormLabel, null, control.label)) : null, /* @__PURE__ */ React88.createElement(import_ui39.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React88.createElement(Control, { type: control.type, props: controlProps }))));
};
function ControlsItemsStack({ items: items3 }) {
  return /* @__PURE__ */ React88.createElement(import_ui39.Stack, { p: 2, gap: 2, sx: { overflowY: "auto" } }, items3.map(
    (item) => item.type === "control" ? /* @__PURE__ */ React88.createElement(Control2, { key: item.value.bind, control: item.value }) : null
  ));
}

// src/dynamics/dynamic-transformer.ts
var import_editor_canvas2 = require("@elementor/editor-canvas");
var import_editor_props20 = require("@elementor/editor-props");

// src/dynamics/errors.ts
var import_utils9 = require("@elementor/utils");
var DynamicTagsManagerNotFoundError = (0, import_utils9.createError)({
  code: "dynamic_tags_manager_not_found",
  message: "Dynamic tags manager not found"
});

// src/dynamics/dynamic-transformer.ts
var dynamicTransformer = (0, import_editor_canvas2.createTransformer)((value, { propType }) => {
  if (!value?.name || !isDynamicTagSupported(value.name)) {
    return propType?.default ?? null;
  }
  return getDynamicValue(value.name, simpleTransform(value?.settings ?? {}));
});
function simpleTransform(props) {
  const transformed = Object.entries(props).map(([settingKey, settingValue]) => {
    const value = (0, import_editor_props20.isTransformable)(settingValue) ? settingValue.value : settingValue;
    return [settingKey, value];
  });
  return Object.fromEntries(transformed);
}
function getDynamicValue(name, settings) {
  const { dynamicTags } = window.elementor ?? {};
  if (!dynamicTags) {
    throw new DynamicTagsManagerNotFoundError();
  }
  const getTagValue = () => {
    const tag = dynamicTags.createTag("v4-dynamic-tag", name, settings);
    if (!tag) {
      return null;
    }
    return dynamicTags.loadTagDataFromCache(tag) ?? null;
  };
  const tagValue = getTagValue();
  if (tagValue !== null) {
    return tagValue;
  }
  return new Promise((resolve) => {
    dynamicTags.refreshCacheFromServer(() => {
      resolve(getTagValue());
    });
  });
}

// src/dynamics/hooks/use-prop-dynamic-action.tsx
var React89 = __toESM(require("react"));
var import_editor_controls59 = require("@elementor/editor-controls");
var import_icons26 = require("@elementor/icons");
var import_i18n61 = require("@wordpress/i18n");
var usePropDynamicAction = () => {
  const { propType } = (0, import_editor_controls59.useBoundProp)();
  const visible = !!propType && supportsDynamic(propType);
  return {
    visible,
    icon: import_icons26.DatabaseIcon,
    title: (0, import_i18n61.__)("Dynamic tags", "elementor"),
    content: ({ close }) => /* @__PURE__ */ React89.createElement(DynamicSelection, { close })
  };
};

// src/dynamics/init.ts
var { registerPopoverAction } = import_menus2.controlActionsMenu;
var init2 = () => {
  (0, import_editor_controls60.registerControlReplacement)({
    component: DynamicSelectionControl,
    condition: ({ value }) => isDynamicPropValue(value)
  });
  (0, import_editor_controls60.injectIntoRepeaterItemLabel)({
    id: "dynamic-background-image",
    condition: ({ value }) => isDynamicPropValue(value.value?.image?.value?.src),
    component: BackgroundControlDynamicTagLabel
  });
  (0, import_editor_controls60.injectIntoRepeaterItemIcon)({
    id: "dynamic-background-image",
    condition: ({ value }) => isDynamicPropValue(value.value?.image?.value?.src),
    component: BackgroundControlDynamicTagIcon
  });
  registerPopoverAction({
    id: "dynamic-tags",
    priority: 20,
    useProps: usePropDynamicAction
  });
  import_editor_canvas3.styleTransformersRegistry.register("dynamic", dynamicTransformer);
  import_editor_canvas3.settingsTransformersRegistry.register("dynamic", dynamicTransformer);
};

// src/reset-style-props.tsx
var import_editor_controls61 = require("@elementor/editor-controls");
var import_editor_variables2 = require("@elementor/editor-variables");
var import_icons27 = require("@elementor/icons");
var import_menus3 = require("@elementor/menus");
var import_i18n62 = require("@wordpress/i18n");

// src/utils/is-equal.ts
function isEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  if (typeof a === "object" && typeof b === "object") {
    const objA = a;
    const objB = b;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
      return false;
    }
    for (const key of keysA) {
      if (!(key in objB)) {
        return false;
      }
      if (!isEqual(objA[key], objB[key])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

// src/reset-style-props.tsx
var { registerAction } = import_menus3.controlActionsMenu;
function initResetStyleProps() {
  registerAction({
    id: "reset-style-value",
    priority: 10,
    useProps: useResetStyleValueProps
  });
}
function useResetStyleValueProps() {
  const isStyle = useIsStyle();
  const { value, resetValue, propType } = (0, import_editor_controls61.useBoundProp)();
  const hasValue = value !== null && value !== void 0;
  const hasInitial = propType.initial_value !== void 0 && propType.initial_value !== null;
  const isRequired = !!propType.settings?.required;
  const shouldHide = !!propType.settings?.hide_reset;
  const isPropTypeValue = value;
  const isVariable = isPropTypeValue?.$$type?.includes("variable");
  const variableExists = isVariable && (0, import_editor_variables2.hasVariable)(isPropTypeValue?.value);
  function calculateVisibility() {
    if (!isStyle || !hasValue || shouldHide || isVariable && !variableExists) {
      return false;
    }
    if (hasInitial) {
      return !isEqual(value, propType.initial_value);
    }
    return !isRequired;
  }
  const visible = calculateVisibility();
  return {
    visible,
    title: (0, import_i18n62.__)("Clear", "elementor"),
    icon: import_icons27.BrushBigIcon,
    onClick: () => resetValue()
  };
}

// src/styles-inheritance/components/styles-inheritance-indicator.tsx
var React95 = __toESM(require("react"));
var import_editor_controls62 = require("@elementor/editor-controls");
var import_editor_props21 = require("@elementor/editor-props");
var import_editor_styles_repository16 = require("@elementor/editor-styles-repository");
var import_i18n66 = require("@wordpress/i18n");

// src/styles-inheritance/components/styles-inheritance-infotip.tsx
var React94 = __toESM(require("react"));
var import_react41 = require("react");
var import_editor_canvas5 = require("@elementor/editor-canvas");
var import_editor_ui10 = require("@elementor/editor-ui");
var import_ui44 = require("@elementor/ui");
var import_i18n65 = require("@wordpress/i18n");

// src/styles-inheritance/hooks/use-normalized-inheritance-chain-items.tsx
var import_react40 = require("react");
var import_editor_canvas4 = require("@elementor/editor-canvas");
var import_editor_styles8 = require("@elementor/editor-styles");
var import_editor_styles_repository14 = require("@elementor/editor-styles-repository");
var import_i18n63 = require("@wordpress/i18n");
var MAXIMUM_ITEMS = 2;
var useNormalizedInheritanceChainItems = (inheritanceChain, bind, resolve) => {
  const [items3, setItems] = (0, import_react40.useState)([]);
  (0, import_react40.useEffect)(() => {
    (async () => {
      const normalizedItems = await Promise.all(
        inheritanceChain.filter(({ style }) => style).map((item, index) => normalizeInheritanceItem(item, index, bind, resolve))
      );
      const validItems = normalizedItems.map((item) => ({
        ...item,
        displayLabel: import_editor_styles_repository14.ELEMENTS_BASE_STYLES_PROVIDER_KEY !== item.provider ? item.displayLabel : (0, import_i18n63.__)("Base", "elementor")
      })).filter((item) => !item.value || item.displayLabel !== "").slice(0, MAXIMUM_ITEMS);
      setItems(validItems);
    })();
  }, [inheritanceChain, bind, resolve]);
  return items3;
};
var DEFAULT_BREAKPOINT2 = "desktop";
var normalizeInheritanceItem = async (item, index, bind, resolve) => {
  const {
    variant: {
      meta: { state, breakpoint }
    },
    style: { label, id }
  } = item;
  const displayLabel = getDisplayLabel({ label, state });
  return {
    id: id ? id + (state ?? "") : index,
    provider: item.provider || "",
    breakpoint: breakpoint ?? DEFAULT_BREAKPOINT2,
    displayLabel,
    value: await getTransformedValue(item, bind, resolve)
  };
};
function getDisplayLabel({ label, state }) {
  if (!state) {
    return label;
  }
  if ((0, import_editor_styles8.isClassState)(state)) {
    return `${label}.${state}`;
  }
  if ((0, import_editor_styles8.isPseudoState)(state)) {
    return `${label}:${state}`;
  }
  throw new import_editor_canvas4.UnknownStyleStateError({ context: { state } });
}
var getTransformedValue = async (item, bind, resolve) => {
  try {
    const result = await resolve({
      props: {
        [bind]: item.value
      }
    });
    const value = result?.[bind] ?? result;
    if ((0, import_react40.isValidElement)(value)) {
      return value;
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  } catch {
    return "";
  }
};

// src/styles-inheritance/components/infotip/breakpoint-icon.tsx
var React90 = __toESM(require("react"));
var import_editor_responsive4 = require("@elementor/editor-responsive");
var import_icons28 = require("@elementor/icons");
var import_ui40 = require("@elementor/ui");
var SIZE4 = "tiny";
var DEFAULT_BREAKPOINT3 = "desktop";
var breakpointIconMap = {
  widescreen: import_icons28.WidescreenIcon,
  desktop: import_icons28.DesktopIcon,
  laptop: import_icons28.LaptopIcon,
  tablet_extra: import_icons28.TabletLandscapeIcon,
  tablet: import_icons28.TabletPortraitIcon,
  mobile_extra: import_icons28.MobileLandscapeIcon,
  mobile: import_icons28.MobilePortraitIcon
};
var BreakpointIcon = ({ breakpoint }) => {
  const breakpoints = (0, import_editor_responsive4.useBreakpoints)();
  const currentBreakpoint = breakpoint || DEFAULT_BREAKPOINT3;
  const IconComponent = breakpointIconMap[currentBreakpoint];
  if (!IconComponent) {
    return null;
  }
  const breakpointLabel = breakpoints.find((breakpointItem) => breakpointItem.id === currentBreakpoint)?.label;
  return /* @__PURE__ */ React90.createElement(import_ui40.Tooltip, { title: breakpointLabel, placement: "top" }, /* @__PURE__ */ React90.createElement(IconComponent, { fontSize: SIZE4, sx: { mt: "2px" } }));
};

// src/styles-inheritance/components/infotip/label-chip.tsx
var React91 = __toESM(require("react"));
var import_editor_styles_repository15 = require("@elementor/editor-styles-repository");
var import_icons29 = require("@elementor/icons");
var import_ui41 = require("@elementor/ui");
var import_i18n64 = require("@wordpress/i18n");
var SIZE5 = "tiny";
var LabelChip = ({ displayLabel, provider }) => {
  const isBaseStyle = provider === import_editor_styles_repository15.ELEMENTS_BASE_STYLES_PROVIDER_KEY;
  const chipIcon = isBaseStyle ? /* @__PURE__ */ React91.createElement(import_ui41.Tooltip, { title: (0, import_i18n64.__)("Inherited from base styles", "elementor"), placement: "top" }, /* @__PURE__ */ React91.createElement(import_icons29.InfoCircleIcon, { fontSize: SIZE5 })) : void 0;
  return /* @__PURE__ */ React91.createElement(
    import_ui41.Chip,
    {
      label: displayLabel,
      size: SIZE5,
      color: getStylesProviderColorName(provider),
      variant: "standard",
      state: "enabled",
      icon: chipIcon,
      sx: (theme) => ({
        lineHeight: 1,
        flexWrap: "nowrap",
        alignItems: "center",
        borderRadius: `${theme.shape.borderRadius * 0.75}px`,
        flexDirection: "row-reverse",
        ".MuiChip-label": {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      })
    }
  );
};

// src/styles-inheritance/components/infotip/value-component.tsx
var React92 = __toESM(require("react"));
var import_ui42 = require("@elementor/ui");
var ValueComponent = ({ index, value }) => {
  return /* @__PURE__ */ React92.createElement(
    import_ui42.Typography,
    {
      variant: "caption",
      color: "text.tertiary",
      sx: {
        mt: "1px",
        textDecoration: index === 0 ? "none" : "line-through",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        pl: 2.5,
        minWidth: 0,
        maxWidth: "100%"
      }
    },
    value
  );
};

// src/styles-inheritance/components/infotip/action-icons.tsx
var React93 = __toESM(require("react"));
var import_ui43 = require("@elementor/ui");
var ActionIcons = () => /* @__PURE__ */ React93.createElement(import_ui43.Box, { display: "flex", gap: 0.5, alignItems: "center" });

// src/styles-inheritance/components/styles-inheritance-infotip.tsx
var SECTION_PADDING_INLINE = 32;
var INFOTIP_MAX_WIDTH = 496;
var calculatePopoverOffset = (triggerRect, cardWidth, isSiteRtl) => {
  if (!triggerRect) {
    return 0;
  }
  const triggerWidth = triggerRect.width;
  return isSiteRtl ? triggerWidth - cardWidth : -(cardWidth / 2) + triggerWidth / 2;
};
var StylesInheritanceInfotip = ({
  inheritanceChain,
  propType,
  path,
  label,
  children,
  isDisabled
}) => {
  const [showInfotip, setShowInfotip] = (0, import_react41.useState)(false);
  const triggerRef = (0, import_react41.useRef)(null);
  const toggleInfotip = () => {
    if (isDisabled) {
      return;
    }
    setShowInfotip((prev) => !prev);
  };
  const closeInfotip = () => {
    if (isDisabled) {
      return;
    }
    setShowInfotip(false);
  };
  const key = path.join(".");
  const sectionWidth = (0, import_editor_ui10.useSectionWidth)();
  const resolve = (0, import_react41.useMemo)(() => {
    return (0, import_editor_canvas5.createPropsResolver)({
      transformers: import_editor_canvas5.stylesInheritanceTransformersRegistry,
      schema: { [key]: propType }
    });
  }, [key, propType]);
  const items3 = useNormalizedInheritanceChainItems(inheritanceChain, key, resolve);
  const infotipContent = /* @__PURE__ */ React94.createElement(import_ui44.ClickAwayListener, { onClickAway: closeInfotip }, /* @__PURE__ */ React94.createElement(
    import_ui44.Card,
    {
      elevation: 0,
      sx: {
        width: `${sectionWidth - SECTION_PADDING_INLINE}px`,
        maxWidth: INFOTIP_MAX_WIDTH,
        maxHeight: 268,
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column"
      }
    },
    /* @__PURE__ */ React94.createElement(
      import_ui44.Box,
      {
        sx: {
          position: "sticky",
          top: 0,
          zIndex: 1,
          backgroundColor: "background.paper"
        }
      },
      /* @__PURE__ */ React94.createElement(import_editor_ui10.PopoverHeader, { title: (0, import_i18n65.__)("Style origin", "elementor"), onClose: closeInfotip })
    ),
    /* @__PURE__ */ React94.createElement(
      import_ui44.CardContent,
      {
        sx: {
          display: "flex",
          flexDirection: "column",
          p: 0,
          flex: 1,
          overflow: "auto",
          "&:last-child": {
            pb: 0
          }
        }
      },
      /* @__PURE__ */ React94.createElement(import_ui44.Stack, { gap: 1.5, sx: { pl: 3, pr: 1, pb: 2 }, role: "list" }, items3.map((item, index) => {
        return /* @__PURE__ */ React94.createElement(
          import_ui44.Box,
          {
            key: item.id,
            display: "flex",
            gap: 0.5,
            role: "listitem",
            "aria-label": (0, import_i18n65.__)("Inheritance item: %s", "elementor").replace(
              "%s",
              item.displayLabel
            )
          },
          /* @__PURE__ */ React94.createElement(
            import_ui44.Box,
            {
              display: "flex",
              gap: 0.5,
              sx: { flexWrap: "wrap", width: "100%", alignItems: "flex-start" }
            },
            /* @__PURE__ */ React94.createElement(BreakpointIcon, { breakpoint: item.breakpoint }),
            /* @__PURE__ */ React94.createElement(LabelChip, { displayLabel: item.displayLabel, provider: item.provider }),
            /* @__PURE__ */ React94.createElement(ValueComponent, { index, value: item.value })
          ),
          /* @__PURE__ */ React94.createElement(ActionIcons, null)
        );
      }))
    )
  ));
  if (isDisabled) {
    return /* @__PURE__ */ React94.createElement(import_ui44.Box, { sx: { display: "inline-flex" } }, children);
  }
  return /* @__PURE__ */ React94.createElement(import_ui44.Box, { ref: triggerRef, sx: { display: "inline-flex" } }, /* @__PURE__ */ React94.createElement(
    TooltipOrInfotip,
    {
      showInfotip,
      onClose: closeInfotip,
      infotipContent,
      isDisabled,
      triggerRef,
      sectionWidth
    },
    /* @__PURE__ */ React94.createElement(
      import_ui44.IconButton,
      {
        onClick: toggleInfotip,
        "aria-label": label,
        sx: { my: "-1px" },
        disabled: isDisabled
      },
      children
    )
  ));
};
function TooltipOrInfotip({
  children,
  showInfotip,
  onClose,
  infotipContent,
  isDisabled,
  triggerRef,
  sectionWidth
}) {
  const direction = useDirection();
  const isSiteRtl = direction.isSiteRtl;
  if (isDisabled) {
    return /* @__PURE__ */ React94.createElement(import_ui44.Box, { sx: { display: "inline-flex" } }, children);
  }
  if (showInfotip) {
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    const cardWidth = Math.min(sectionWidth - SECTION_PADDING_INLINE, INFOTIP_MAX_WIDTH);
    const offsetX = calculatePopoverOffset(triggerRect, cardWidth, isSiteRtl);
    return /* @__PURE__ */ React94.createElement(React94.Fragment, null, /* @__PURE__ */ React94.createElement(
      import_ui44.Backdrop,
      {
        open: showInfotip,
        onClick: onClose,
        sx: {
          backgroundColor: "transparent",
          zIndex: (theme) => theme.zIndex.modal - 1
        }
      }
    ), /* @__PURE__ */ React94.createElement(
      import_ui44.Infotip,
      {
        placement: "top",
        content: infotipContent,
        open: showInfotip,
        onClose,
        disableHoverListener: true,
        componentsProps: {
          tooltip: {
            sx: { mx: 2 }
          }
        },
        slotProps: {
          popper: {
            modifiers: [
              {
                name: "offset",
                options: { offset: [offsetX, 0] }
              }
            ]
          }
        }
      },
      children
    ));
  }
  return /* @__PURE__ */ React94.createElement(import_ui44.Tooltip, { title: (0, import_i18n65.__)("Style origin", "elementor"), placement: "top" }, children);
}

// src/styles-inheritance/components/styles-inheritance-indicator.tsx
var StylesInheritanceIndicator = ({
  customContext
}) => {
  const context = (0, import_editor_controls62.useBoundProp)();
  const { path, propType } = customContext || context;
  const inheritanceChain = useStylesInheritanceChain(path);
  if (!path || !inheritanceChain.length) {
    return null;
  }
  return /* @__PURE__ */ React95.createElement(Indicator, { inheritanceChain, path, propType });
};
var Indicator = ({ inheritanceChain, path, propType, isDisabled }) => {
  const { id: currentStyleId, provider: currentStyleProvider, meta: currentStyleMeta } = useStyle();
  const currentItem = currentStyleId ? getValueFromInheritanceChain(inheritanceChain, currentStyleId, currentStyleMeta) : null;
  const hasValue = !(0, import_editor_props21.isEmpty)(currentItem?.value);
  const [actualStyle] = inheritanceChain;
  if (actualStyle.provider === import_editor_styles_repository16.ELEMENTS_BASE_STYLES_PROVIDER_KEY) {
    return null;
  }
  const isFinalValue = currentItem === actualStyle;
  const label = getLabel({ isFinalValue, hasValue });
  const styleIndicatorProps = {
    getColor: isFinalValue && currentStyleProvider ? getStylesProviderThemeColor(currentStyleProvider.getKey()) : void 0,
    isOverridden: hasValue && !isFinalValue ? true : void 0
  };
  return /* @__PURE__ */ React95.createElement(
    StylesInheritanceInfotip,
    {
      inheritanceChain,
      path,
      propType,
      label,
      isDisabled
    },
    /* @__PURE__ */ React95.createElement(StyleIndicator, { ...styleIndicatorProps })
  );
};
var getLabel = ({ isFinalValue, hasValue }) => {
  if (isFinalValue) {
    return (0, import_i18n66.__)("This is the final value", "elementor");
  }
  if (hasValue) {
    return (0, import_i18n66.__)("This value is overridden by another style", "elementor");
  }
  return (0, import_i18n66.__)("This has value from another style", "elementor");
};

// src/styles-inheritance/init-styles-inheritance-transformers.ts
var import_editor_canvas13 = require("@elementor/editor-canvas");

// src/styles-inheritance/consts.ts
var excludePropTypeTransformers = /* @__PURE__ */ new Set([
  "background-color-overlay",
  "background-image-overlay",
  "background-gradient-overlay",
  "gradient-color-stop",
  "color-stop",
  "background-image-position-offset",
  "background-image-size-scale",
  "image-src",
  "image",
  "background-overlay"
]);

// src/styles-inheritance/transformers/array-transformer.tsx
var React96 = __toESM(require("react"));
var import_editor_canvas6 = require("@elementor/editor-canvas");
var import_ui45 = require("@elementor/ui");
var arrayTransformer = (0, import_editor_canvas6.createTransformer)((values) => {
  if (!values || values.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React96.createElement(import_ui45.Stack, { direction: "column" }, values.map((item, index) => /* @__PURE__ */ React96.createElement(import_ui45.Stack, { key: index }, item)));
});

// src/styles-inheritance/transformers/background-color-overlay-transformer.tsx
var React97 = __toESM(require("react"));
var import_editor_canvas7 = require("@elementor/editor-canvas");
var import_ui46 = require("@elementor/ui");
var backgroundColorOverlayTransformer = (0, import_editor_canvas7.createTransformer)((value) => /* @__PURE__ */ React97.createElement(import_ui46.Stack, { direction: "row", gap: 1, alignItems: "center" }, /* @__PURE__ */ React97.createElement(ItemLabelColor, { value })));
var ItemLabelColor = ({ value: { color } }) => {
  return /* @__PURE__ */ React97.createElement("span", null, color);
};
var StyledUnstableColorIndicator = (0, import_ui46.styled)(import_ui46.UnstableColorIndicator)(({ theme }) => ({
  width: "1em",
  height: "1em",
  borderRadius: `${theme.shape.borderRadius / 2}px`,
  outline: `1px solid ${theme.palette.action.disabled}`,
  flexShrink: 0
}));

// src/styles-inheritance/transformers/background-gradient-overlay-transformer.tsx
var React98 = __toESM(require("react"));
var import_editor_canvas8 = require("@elementor/editor-canvas");
var import_ui47 = require("@elementor/ui");
var import_i18n67 = require("@wordpress/i18n");
var backgroundGradientOverlayTransformer = (0, import_editor_canvas8.createTransformer)((value) => /* @__PURE__ */ React98.createElement(import_ui47.Stack, { direction: "row", gap: 1, alignItems: "center" }, /* @__PURE__ */ React98.createElement(ItemIconGradient, { value }), /* @__PURE__ */ React98.createElement(ItemLabelGradient, { value })));
var ItemIconGradient = ({ value }) => {
  const gradient = getGradientValue(value);
  return /* @__PURE__ */ React98.createElement(StyledUnstableColorIndicator, { size: "inherit", component: "span", value: gradient });
};
var ItemLabelGradient = ({ value }) => {
  if (value.type === "linear") {
    return /* @__PURE__ */ React98.createElement("span", null, (0, import_i18n67.__)("Linear gradient", "elementor"));
  }
  return /* @__PURE__ */ React98.createElement("span", null, (0, import_i18n67.__)("Radial gradient", "elementor"));
};
var getGradientValue = (gradient) => {
  const stops = gradient.stops?.map(({ color, offset }) => `${color} ${offset ?? 0}%`)?.join(",");
  if (gradient.type === "linear") {
    return `linear-gradient(${gradient.angle}deg, ${stops})`;
  }
  return `radial-gradient(circle at ${gradient.positions}, ${stops})`;
};

// src/styles-inheritance/transformers/background-image-overlay-transformer.tsx
var React99 = __toESM(require("react"));
var import_editor_canvas9 = require("@elementor/editor-canvas");
var import_editor_ui11 = require("@elementor/editor-ui");
var import_ui48 = require("@elementor/ui");
var import_wp_media = require("@elementor/wp-media");
var backgroundImageOverlayTransformer = (0, import_editor_canvas9.createTransformer)((value) => /* @__PURE__ */ React99.createElement(import_ui48.Stack, { direction: "row", gap: 1, alignItems: "center" }, /* @__PURE__ */ React99.createElement(ItemIconImage, { value }), /* @__PURE__ */ React99.createElement(ItemLabelImage, { value })));
var ItemIconImage = ({ value }) => {
  const { imageUrl } = useImage(value);
  return /* @__PURE__ */ React99.createElement(
    import_ui48.CardMedia,
    {
      image: imageUrl,
      sx: (theme) => ({
        height: "1em",
        width: "1em",
        borderRadius: `${theme.shape.borderRadius / 2}px`,
        outline: `1px solid ${theme.palette.action.disabled}`,
        flexShrink: 0
      })
    }
  );
};
var ItemLabelImage = ({ value }) => {
  const { imageTitle } = useImage(value);
  return /* @__PURE__ */ React99.createElement(import_editor_ui11.EllipsisWithTooltip, { title: imageTitle }, /* @__PURE__ */ React99.createElement("span", null, imageTitle));
};
var useImage = (image) => {
  let imageTitle, imageUrl = null;
  const imageSrc = image?.image.src;
  const { data: attachment } = (0, import_wp_media.useWpMediaAttachment)(imageSrc.id || null);
  if (imageSrc.id) {
    const imageFileTypeExtension = getFileExtensionFromFilename(attachment?.filename);
    imageTitle = `${attachment?.title}${imageFileTypeExtension}` || null;
    imageUrl = attachment?.url || null;
  } else if (imageSrc.url) {
    imageUrl = imageSrc.url;
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

// src/styles-inheritance/transformers/box-shadow-transformer.tsx
var React100 = __toESM(require("react"));
var import_editor_canvas10 = require("@elementor/editor-canvas");
var import_ui49 = require("@elementor/ui");
var boxShadowTransformer = (0, import_editor_canvas10.createTransformer)((value) => {
  if (!value) {
    return null;
  }
  const { color, hOffset, vOffset, blur, spread, position } = value;
  const colorValue = color || "#000000";
  const sizes = [hOffset || "0px", vOffset || "0px", blur || "10px", spread || "0px"].join(" ");
  const positionValue = position || "outset";
  return /* @__PURE__ */ React100.createElement(import_ui49.Stack, { direction: "column", gap: 0.5, pb: 1 }, /* @__PURE__ */ React100.createElement("span", null, colorValue, " ", positionValue, ", ", sizes));
});

// src/styles-inheritance/transformers/color-transformer.tsx
var React101 = __toESM(require("react"));
var import_editor_canvas11 = require("@elementor/editor-canvas");
var import_ui50 = require("@elementor/ui");
function isValidCSSColor(value) {
  if (!value.trim()) {
    return false;
  }
  return CSS.supports("color", value.trim());
}
var StyledColorIndicator = (0, import_ui50.styled)(import_ui50.UnstableColorIndicator)(({ theme }) => ({
  width: "1em",
  height: "1em",
  borderRadius: `${theme.shape.borderRadius / 2}px`,
  outline: `1px solid ${theme.palette.action.disabled}`,
  flexShrink: 0
}));
var colorTransformer = (0, import_editor_canvas11.createTransformer)((value) => {
  if (!isValidCSSColor(value)) {
    return value;
  }
  return /* @__PURE__ */ React101.createElement(import_ui50.Stack, { direction: "row", gap: 1, alignItems: "center" }, /* @__PURE__ */ React101.createElement(StyledColorIndicator, { size: "inherit", component: "span", value }), /* @__PURE__ */ React101.createElement("span", null, value));
});

// src/styles-inheritance/transformers/repeater-to-items-transformer.tsx
var React102 = __toESM(require("react"));
var import_editor_canvas12 = require("@elementor/editor-canvas");
var import_ui51 = require("@elementor/ui");
var createRepeaterToItemsTransformer = (originalTransformer, separator = " ") => {
  return (0, import_editor_canvas12.createTransformer)((value, options12) => {
    const stringResult = originalTransformer(value, options12);
    if (!stringResult || typeof stringResult !== "string") {
      return stringResult;
    }
    const parts = stringResult.split(separator).filter(Boolean);
    if (parts.length <= 1) {
      return stringResult;
    }
    return /* @__PURE__ */ React102.createElement(import_ui51.Stack, { direction: "column", gap: 0.5 }, parts.map((part, index) => /* @__PURE__ */ React102.createElement(import_ui51.Stack, { key: index }, part.trim())));
  });
};

// src/styles-inheritance/init-styles-inheritance-transformers.ts
function initStylesInheritanceTransformers() {
  const originalStyleTransformers = import_editor_canvas13.styleTransformersRegistry.all();
  Object.entries(originalStyleTransformers).forEach(([propType, transformer]) => {
    if (excludePropTypeTransformers.has(propType)) {
      return;
    }
    import_editor_canvas13.stylesInheritanceTransformersRegistry.register(propType, transformer);
  });
  import_editor_canvas13.stylesInheritanceTransformersRegistry.registerFallback(
    (0, import_editor_canvas13.createTransformer)((value) => {
      return value;
    })
  );
  registerCustomTransformers(originalStyleTransformers);
}
function registerCustomTransformers(originalStyleTransformers) {
  import_editor_canvas13.stylesInheritanceTransformersRegistry.register("color", colorTransformer);
  import_editor_canvas13.stylesInheritanceTransformersRegistry.register("background-color-overlay", backgroundColorOverlayTransformer);
  import_editor_canvas13.stylesInheritanceTransformersRegistry.register(
    "background-gradient-overlay",
    backgroundGradientOverlayTransformer
  );
  import_editor_canvas13.stylesInheritanceTransformersRegistry.register("background-image-overlay", backgroundImageOverlayTransformer);
  import_editor_canvas13.stylesInheritanceTransformersRegistry.register("shadow", boxShadowTransformer);
  import_editor_canvas13.stylesInheritanceTransformersRegistry.register(
    "filter",
    createRepeaterToItemsTransformer(originalStyleTransformers.filter)
  );
  import_editor_canvas13.stylesInheritanceTransformersRegistry.register(
    "backdrop-filter",
    createRepeaterToItemsTransformer(originalStyleTransformers["backdrop-filter"])
  );
  import_editor_canvas13.stylesInheritanceTransformersRegistry.register(
    "transition",
    createRepeaterToItemsTransformer(originalStyleTransformers.transition, ", ")
  );
  ["background-overlay", "box-shadow", "transform-functions"].forEach(
    (propType) => import_editor_canvas13.stylesInheritanceTransformersRegistry.register(propType, arrayTransformer)
  );
}

// src/styles-inheritance/init.ts
var init3 = () => {
  initStylesInheritanceTransformers();
  registerFieldIndicator({
    fieldType: FIELD_TYPE.STYLES,
    id: "styles-inheritance",
    priority: 1,
    indicator: StylesInheritanceIndicator
  });
};

// src/init.ts
function init4() {
  (0, import_editor_panels3.__registerPanel)(panel);
  blockV1Panel();
  (0, import_editor.injectIntoLogic)({
    id: "editing-panel-hooks",
    component: EditingPanelHooks
  });
  init2();
  init3();
  registerElementControls();
  initResetStyleProps();
  init();
}
var blockV1Panel = () => {
  (0, import_editor_v1_adapters11.blockCommand)({
    command: "panel/editor/open",
    condition: isAtomicWidgetSelected
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseControl,
  CustomCssIndicator,
  ElementProvider,
  FIELD_TYPE,
  HISTORY_DEBOUNCE_WAIT,
  SectionContent,
  SettingsControl,
  SettingsField,
  StyleIndicator,
  StyleTabSection,
  StylesProviderCannotUpdatePropsError,
  controlsRegistry,
  createTopLevelObjectType,
  doApplyClasses,
  doGetAppliedClasses,
  doUnapplyClass,
  getFieldIndicators,
  getSubtitle,
  getTitle,
  init,
  injectIntoClassSelectorActions,
  injectIntoCssClassConvert,
  injectIntoPanelHeaderTop,
  injectIntoStyleTab,
  isDynamicPropValue,
  registerEditingPanelReplacement,
  registerFieldIndicator,
  registerStyleProviderToColors,
  setLicenseConfig,
  useClassesProp,
  useCustomCss,
  useElement,
  usePanelActions,
  usePanelStatus,
  useStateByElement,
  useStyle,
  useStylesRerender
});
//# sourceMappingURL=index.js.map