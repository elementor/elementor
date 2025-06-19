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
  controlActionsMenu: () => controlActionsMenu,
  init: () => init3,
  injectIntoClassSelectorActions: () => injectIntoClassSelectorActions,
  registerControlReplacement: () => registerControlReplacement,
  registerStyleProviderToColors: () => registerStyleProviderToColors,
  useBoundProp: () => import_editor_controls60.useBoundProp,
  useFontFamilies: () => useFontFamilies,
  usePanelActions: () => usePanelActions,
  usePanelStatus: () => usePanelStatus,
  useSectionRef: () => useSectionRef
});
module.exports = __toCommonJS(index_exports);
var import_editor_controls60 = require("@elementor/editor-controls");

// src/control-replacement.tsx
var import_editor_controls = require("@elementor/editor-controls");
var { registerControlReplacement, getControlReplacements } = (0, import_editor_controls.createControlReplacementsRegistry)();

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

// src/components/css-classes/css-class-selector.tsx
var React8 = __toESM(require("react"));
var import_react10 = require("react");
var import_editor_elements2 = require("@elementor/editor-elements");
var import_editor_styles_repository6 = require("@elementor/editor-styles-repository");
var import_editor_ui3 = require("@elementor/editor-ui");
var import_icons2 = require("@elementor/icons");
var import_locations = require("@elementor/locations");
var import_ui6 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");

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
function ElementProvider({ children, element, elementType }) {
  return /* @__PURE__ */ React2.createElement(Context2.Provider, { value: { element, elementType } }, children);
}
function useElement() {
  const context = (0, import_react2.useContext)(Context2);
  if (!context) {
    throw new Error("useElement must be used within a ElementProvider");
  }
  return context;
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

// src/utils/get-styles-provider-color.ts
var import_editor_styles_repository2 = require("@elementor/editor-styles-repository");
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

// src/components/creatable-autocomplete/creatable-autocomplete.tsx
var React4 = __toESM(require("react"));
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
var CreatableAutocomplete = React4.forwardRef(CreatableAutocompleteInner);
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
  return /* @__PURE__ */ React4.createElement(
    import_ui2.Autocomplete,
    {
      renderTags: (tagValue, getTagProps) => {
        return tagValue.map((option, index) => /* @__PURE__ */ React4.createElement(
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
      ListboxComponent: error ? React4.forwardRef((_, errorTextRef) => /* @__PURE__ */ React4.createElement(ErrorText, { ref: errorTextRef, error })) : void 0,
      renderGroup: (params) => /* @__PURE__ */ React4.createElement(Group, { ...params }),
      inputValue,
      renderInput: (params) => {
        return /* @__PURE__ */ React4.createElement(
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
        return /* @__PURE__ */ React4.createElement(
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
  return /* @__PURE__ */ React4.createElement(StyledGroup, { role: "group", "aria-labelledby": id }, /* @__PURE__ */ React4.createElement(StyledGroupHeader, { id }, " ", params.group), /* @__PURE__ */ React4.createElement(StyledGroupItems, { role: "listbox" }, params.children));
};
var ErrorText = React4.forwardRef(({ error = "error" }, ref) => {
  return /* @__PURE__ */ React4.createElement(
    import_ui2.Box,
    {
      ref,
      sx: (theme) => ({
        padding: theme.spacing(2)
      })
    },
    /* @__PURE__ */ React4.createElement(import_ui2.Typography, { variant: "caption", sx: { color: "error.main", display: "inline-block" } }, error)
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
var React7 = __toESM(require("react"));
var import_react9 = require("react");
var import_editor_styles_repository5 = require("@elementor/editor-styles-repository");
var import_editor_ui2 = require("@elementor/editor-ui");
var import_icons = require("@elementor/icons");
var import_ui5 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");

// src/components/css-classes/css-class-context.tsx
var React5 = __toESM(require("react"));
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
  return /* @__PURE__ */ React5.createElement(CssClassContext.Provider, { value: contextValue }, children);
}

// src/components/css-classes/css-class-menu.tsx
var React6 = __toESM(require("react"));
var import_editor_styles_repository4 = require("@elementor/editor-styles-repository");
var import_editor_ui = require("@elementor/editor-ui");
var import_ui4 = require("@elementor/ui");
var import_i18n2 = require("@wordpress/i18n");

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

// src/components/css-classes/use-apply-and-unapply-class.ts
var import_react8 = require("react");
var import_editor_documents = require("@elementor/editor-documents");
var import_editor_elements = require("@elementor/editor-elements");
var import_editor_props = require("@elementor/editor-props");
var import_editor_styles_repository3 = require("@elementor/editor-styles-repository");
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var import_i18n = require("@wordpress/i18n");

// src/sync/experiments-flags.ts
var EXPERIMENTAL_FEATURES = {
  V_3_30: "e_v_3_30",
  V_3_31: "e_v_3_31"
};

// src/components/css-classes/use-apply-and-unapply-class.ts
function useApplyClass() {
  const { id: activeId, setId: setActiveId } = useStyle();
  const { element } = useElement();
  const isVersion330Active = (0, import_editor_v1_adapters.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30);
  const applyClass = useApply();
  const unapplyClass = useUnapply();
  const undoableApply = (0, import_react8.useMemo)(() => {
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
        title: (0, import_editor_elements.getElementLabel)(element.id),
        subtitle: ({ classLabel }) => {
          return (0, import_i18n.__)(`class %s applied`, "elementor").replace("%s", classLabel);
        }
      }
    );
  }, [activeId, applyClass, element.id, unapplyClass, setActiveId]);
  const applyWithoutHistory = (0, import_react8.useCallback)(
    ({ classId }) => {
      applyClass(classId);
    },
    [applyClass]
  );
  return isVersion330Active ? undoableApply : applyWithoutHistory;
}
function useUnapplyClass() {
  const { id: activeId, setId: setActiveId } = useStyle();
  const { element } = useElement();
  const isVersion330Active = (0, import_editor_v1_adapters.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30);
  const applyClass = useApply();
  const unapplyClass = useUnapply();
  const undoableUnapply = (0, import_react8.useMemo)(() => {
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
        title: (0, import_editor_elements.getElementLabel)(element.id),
        subtitle: ({ classLabel }) => {
          return (0, import_i18n.__)(`class %s removed`, "elementor").replace("%s", classLabel);
        }
      }
    );
  }, [activeId, applyClass, element.id, unapplyClass, setActiveId]);
  const unapplyWithoutHistory = (0, import_react8.useCallback)(
    ({ classId }) => {
      unapplyClass(classId);
    },
    [unapplyClass]
  );
  return isVersion330Active ? undoableUnapply : unapplyWithoutHistory;
}
function useCreateAndApplyClass() {
  const { id: activeId, setId: setActiveId } = useStyle();
  const isVersion330Active = (0, import_editor_v1_adapters.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30);
  const [provider, createAction] = (0, import_editor_styles_repository3.useGetStylesRepositoryCreateAction)() ?? [null, null];
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
        title: (0, import_i18n.__)("Class", "elementor"),
        subtitle: ({ classLabel }) => {
          return (0, import_i18n.__)(`%s created`, "elementor").replace("%s", classLabel);
        }
      }
    );
  }, [activeId, applyClass, createAction, deleteAction, provider, setActiveId, unapplyClass]);
  const createAndApplyWithoutHistory = (0, import_react8.useCallback)(
    ({ classLabel }) => {
      if (!createAction) {
        return;
      }
      const createdId = createAction(classLabel);
      applyClass(createdId);
    },
    [applyClass, createAction]
  );
  if (!provider || !undoableCreateAndApply) {
    return [null, null];
  }
  return isVersion330Active ? [provider, undoableCreateAndApply] : [provider, createAndApplyWithoutHistory];
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
  const isVersion330Active = (0, import_editor_v1_adapters.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30);
  return (0, import_react8.useMemo)(() => {
    const setClasses = (ids) => {
      (0, import_editor_elements.updateElementSettings)({
        id: element.id,
        props: { [currentClassesProp]: import_editor_props.classesPropTypeUtil.create(ids) },
        withHistory: isVersion330Active ? false : true
      });
      if (isVersion330Active) {
        (0, import_editor_documents.setDocumentModifiedStatus)(true);
      }
    };
    const getAppliedClasses = () => (0, import_editor_elements.getElementSetting)(element.id, currentClassesProp)?.value || [];
    return { setClasses, getAppliedClasses };
  }, [currentClassesProp, element.id, isVersion330Active]);
}

// src/components/css-classes/css-class-menu.tsx
var STATES = [
  { key: "normal", value: null },
  { key: "hover", value: "hover" },
  { key: "focus", value: "focus" },
  { key: "active", value: "active" }
];
function CssClassMenu({ popupState, anchorEl, fixed }) {
  const { provider } = useCssClass();
  const handleKeyDown = (e) => {
    e.stopPropagation();
  };
  return /* @__PURE__ */ React6.createElement(
    import_ui4.Menu,
    {
      MenuListProps: { dense: true, sx: { minWidth: "160px" } },
      ...(0, import_ui4.bindMenu)(popupState),
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
    getMenuItemsByProvider({ provider, closeMenu: popupState.close, fixed }),
    /* @__PURE__ */ React6.createElement(import_ui4.MenuSubheader, { sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1 } }, (0, import_i18n2.__)("States", "elementor")),
    STATES.map((state) => {
      return /* @__PURE__ */ React6.createElement(StateMenuItem, { key: state.key, state: state.value, closeMenu: popupState.close });
    })
  );
}
function useModifiedStates(styleId) {
  const { meta } = useStyle();
  const styleDef = import_editor_styles_repository4.stylesRepository.all().find((style) => style.id === styleId);
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
  const providerInstance = import_editor_styles_repository4.stylesRepository.getProviderByKey(provider);
  const providerActions = providerInstance?.actions;
  const canUpdate = providerActions?.update;
  const canUnapply = !fixed;
  const actions = [
    canUpdate && /* @__PURE__ */ React6.createElement(RenameClassMenuItem, { key: "rename-class", closeMenu }),
    canUnapply && /* @__PURE__ */ React6.createElement(UnapplyClassMenuItem, { key: "unapply-class", closeMenu })
  ].filter(Boolean);
  if (actions.length) {
    actions.unshift(
      /* @__PURE__ */ React6.createElement(
        import_ui4.MenuSubheader,
        {
          key: "provider-label",
          sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1, textTransform: "capitalize" }
        },
        providerInstance?.labels?.singular
      )
    );
    actions.push(/* @__PURE__ */ React6.createElement(import_ui4.Divider, { key: "provider-actions-divider" }));
  }
  return actions;
}
function StateMenuItem({ state, closeMenu, ...props }) {
  const { id: styleId, provider } = useCssClass();
  const { id: activeId, setId: setActiveId, setMetaState: setActiveMetaState, meta } = useStyle();
  const { state: activeState } = meta;
  const { userCan } = (0, import_editor_styles_repository4.useUserStylesCapability)();
  const modifiedStates = useModifiedStates(styleId);
  const isUpdateAllowed = !state || userCan(provider ?? "").updateProps;
  const isStyled = modifiedStates[state ?? "normal"] ?? false;
  const disabled = !isUpdateAllowed && !isStyled;
  const isActive = styleId === activeId;
  const isSelected = state === activeState && isActive;
  return /* @__PURE__ */ React6.createElement(
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
        setActiveMetaState(state);
        closeMenu();
      }
    },
    /* @__PURE__ */ React6.createElement(
      import_editor_ui.MenuItemInfotip,
      {
        showInfoTip: disabled,
        content: (0, import_i18n2.__)("With your current role, you can only use existing states.", "elementor")
      },
      /* @__PURE__ */ React6.createElement(import_ui4.Stack, { gap: 0.75, direction: "row", alignItems: "center" }, isStyled && /* @__PURE__ */ React6.createElement(
        StyleIndicator,
        {
          "aria-label": (0, import_i18n2.__)("Has style", "elementor"),
          getColor: getStylesProviderThemeColor(provider ?? "")
        }
      ), state ?? "normal")
    )
  );
}
function UnapplyClassMenuItem({ closeMenu, ...props }) {
  const { id: classId, label: classLabel } = useCssClass();
  const unapplyClass = useUnapplyClass();
  return classId ? /* @__PURE__ */ React6.createElement(
    import_editor_ui.MenuListItem,
    {
      ...props,
      onClick: () => {
        unapplyClass({ classId, classLabel });
        closeMenu();
      }
    },
    (0, import_i18n2.__)("Remove", "elementor")
  ) : null;
}
function RenameClassMenuItem({ closeMenu }) {
  const { handleRename, provider } = useCssClass();
  const { userCan } = (0, import_editor_styles_repository4.useUserStylesCapability)();
  if (!provider) {
    return null;
  }
  const isAllowed = userCan(provider).update;
  return /* @__PURE__ */ React6.createElement(
    import_editor_ui.MenuListItem,
    {
      disabled: !isAllowed,
      onClick: () => {
        closeMenu();
        handleRename();
      }
    },
    /* @__PURE__ */ React6.createElement(
      import_editor_ui.MenuItemInfotip,
      {
        showInfoTip: !isAllowed,
        content: (0, import_i18n2.__)(
          "With your current role, you can use existing classes but can\u2019t modify them.",
          "elementor"
        )
      },
      (0, import_i18n2.__)("Rename", "elementor")
    )
  );
}

// src/components/css-classes/css-class-item.tsx
var CHIP_SIZE = "tiny";
function CssClassItem(props) {
  const { chipProps, icon, color: colorProp, fixed, ...classProps } = props;
  const { id, provider, label, isActive, onClickActive, renameLabel, setError } = classProps;
  const { meta, setMetaState } = useStyle();
  const popupState = (0, import_ui5.usePopupState)({ variant: "popover" });
  const [chipRef, setChipRef] = (0, import_react9.useState)(null);
  const { onDelete, ...chipGroupProps } = chipProps;
  const { userCan } = (0, import_editor_styles_repository5.useUserStylesCapability)();
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
  const providerActions = provider ? import_editor_styles_repository5.stylesRepository.getProviderByKey(provider)?.actions : null;
  const allowRename = Boolean(providerActions?.update) && userCan(provider ?? "")?.update;
  const isShowingState = isActive && meta.state;
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(
    import_ui5.UnstableChipGroup,
    {
      ref: setChipRef,
      ...chipGroupProps,
      "aria-label": `Edit ${label}`,
      role: "group",
      sx: (theme) => ({
        "&.MuiChipGroup-root.MuiAutocomplete-tag": { margin: theme.spacing(0.125) }
      })
    },
    /* @__PURE__ */ React7.createElement(
      import_ui5.Chip,
      {
        size: CHIP_SIZE,
        label: isEditing ? /* @__PURE__ */ React7.createElement(import_editor_ui2.EditableField, { ref, ...getEditableProps() }) : /* @__PURE__ */ React7.createElement(import_editor_ui2.EllipsisWithTooltip, { maxWidth: "10ch", title: label, as: "div" }),
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
    !isEditing && /* @__PURE__ */ React7.createElement(
      import_ui5.Chip,
      {
        icon: isShowingState ? void 0 : /* @__PURE__ */ React7.createElement(import_icons.DotsVerticalIcon, { fontSize: "tiny" }),
        size: CHIP_SIZE,
        label: isShowingState ? /* @__PURE__ */ React7.createElement(import_ui5.Stack, { direction: "row", gap: 0.5, alignItems: "center" }, /* @__PURE__ */ React7.createElement(import_ui5.Typography, { variant: "inherit" }, meta.state), /* @__PURE__ */ React7.createElement(import_icons.DotsVerticalIcon, { fontSize: "tiny" })) : void 0,
        variant: "filled",
        shape: "rounded",
        color,
        ...(0, import_ui5.bindTrigger)(popupState),
        "aria-label": (0, import_i18n3.__)("Open CSS Class Menu", "elementor"),
        sx: (theme) => ({
          borderRadius: `${theme.shape.borderRadius * 0.75}px`,
          paddingRight: 0,
          ...!isShowingState ? { paddingLeft: 0 } : {},
          ".MuiChip-label": isShowingState ? { paddingRight: 0 } : { padding: 0 }
        })
      }
    )
  ), /* @__PURE__ */ React7.createElement(CssClassProvider, { ...classProps, handleRename: openEditMode }, /* @__PURE__ */ React7.createElement(CssClassMenu, { popupState, anchorEl: chipRef, fixed })));
}
var validateLabel = (newLabel) => {
  const result = (0, import_editor_styles_repository5.validateStyleLabel)(newLabel, "rename");
  if (result.isValid) {
    return null;
  }
  return result.errorMessage;
};

// src/components/css-classes/css-class-selector.tsx
var ID = "elementor-css-class-selector";
var TAGS_LIMIT = 50;
var EMPTY_OPTION = {
  label: (0, import_i18n4.__)("local", "elementor"),
  value: null,
  fixed: true,
  color: "accent",
  icon: /* @__PURE__ */ React8.createElement(import_icons2.MapPinIcon, null),
  provider: null
};
var { Slot: ClassSelectorActionsSlot, inject: injectIntoClassSelectorActions } = (0, import_locations.createLocation)();
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
  const { userCan } = (0, import_editor_styles_repository6.useUserStylesCapability)();
  const canEdit = active.provider ? userCan(active.provider).updateProps : true;
  return /* @__PURE__ */ React8.createElement(import_ui6.Stack, { p: 2 }, /* @__PURE__ */ React8.createElement(import_ui6.Stack, { direction: "row", gap: 1, alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React8.createElement(import_ui6.FormLabel, { htmlFor: ID, size: "small" }, (0, import_i18n4.__)("Classes", "elementor")), /* @__PURE__ */ React8.createElement(import_ui6.Stack, { direction: "row", gap: 1 }, /* @__PURE__ */ React8.createElement(ClassSelectorActionsSlot, null))), /* @__PURE__ */ React8.createElement(
    import_editor_ui3.WarningInfotip,
    {
      open: Boolean(renameError),
      text: renameError ?? "",
      placement: "bottom",
      width: autocompleteRef.current?.getBoundingClientRect().width,
      offset: [0, -15]
    },
    /* @__PURE__ */ React8.createElement(
      CreatableAutocomplete,
      {
        id: ID,
        ref: autocompleteRef,
        size: "tiny",
        placeholder: showPlaceholder ? (0, import_i18n4.__)("Type class name", "elementor") : void 0,
        options: options12,
        selected: appliedOptions,
        entityName,
        onSelect: handleSelect,
        onCreate: create ?? void 0,
        validate: validate ?? void 0,
        limitTags: TAGS_LIMIT,
        renderEmptyState: EmptyState,
        getLimitTagsText: (more) => /* @__PURE__ */ React8.createElement(import_ui6.Chip, { size: "tiny", variant: "standard", label: `+${more}`, clickable: true }),
        renderTags: (values, getTagProps) => values.map((value, index) => {
          const chipProps = getTagProps({ index });
          const isActive = value.value === active?.value;
          const renameLabel = (newLabel) => {
            if (!value.value) {
              throw new Error(`Cannot rename a class without style id`);
            }
            return updateClassByProvider(value.provider, { label: newLabel, id: value.value });
          };
          return /* @__PURE__ */ React8.createElement(
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
  ), !canEdit && /* @__PURE__ */ React8.createElement(import_editor_ui3.InfoAlert, { sx: { mt: 1 } }, (0, import_i18n4.__)("With your current role, you can use existing classes but can\u2019t modify them.", "elementor")));
}
var EmptyState = ({ searchValue, onClear }) => /* @__PURE__ */ React8.createElement(import_ui6.Box, { sx: { py: 4 } }, /* @__PURE__ */ React8.createElement(
  import_ui6.Stack,
  {
    gap: 1,
    alignItems: "center",
    color: "text.secondary",
    justifyContent: "center",
    sx: { px: 2, m: "auto", maxWidth: "236px" }
  },
  /* @__PURE__ */ React8.createElement(import_icons2.ColorSwatchIcon, { sx: { transform: "rotate(90deg)" }, fontSize: "large" }),
  /* @__PURE__ */ React8.createElement(import_ui6.Typography, { align: "center", variant: "subtitle2" }, (0, import_i18n4.__)("Sorry, nothing matched", "elementor"), /* @__PURE__ */ React8.createElement("br", null), "\u201C", searchValue, "\u201D."),
  /* @__PURE__ */ React8.createElement(import_ui6.Typography, { align: "center", variant: "caption", sx: { mb: 2 } }, (0, import_i18n4.__)("With your current role,", "elementor"), /* @__PURE__ */ React8.createElement("br", null), (0, import_i18n4.__)("you can only use existing classes.", "elementor")),
  /* @__PURE__ */ React8.createElement(import_ui6.Link, { color: "text.secondary", variant: "caption", component: "button", onClick: onClear }, (0, import_i18n4.__)("Clear & try again", "elementor"))
));
var updateClassByProvider = (provider, data) => {
  if (!provider) {
    return;
  }
  const providerInstance = import_editor_styles_repository6.stylesRepository.getProviderByKey(provider);
  if (!providerInstance) {
    return;
  }
  return providerInstance.actions.update?.(data);
};
function useOptions() {
  const { element } = useElement();
  const isProviderEditable = (provider) => !!provider.actions.updateProps;
  return (0, import_editor_styles_repository6.useProviders)().filter(isProviderEditable).flatMap((provider) => {
    const isElements = (0, import_editor_styles_repository6.isElementsStylesProvider)(provider.getKey());
    const styleDefs = provider.actions.all({ elementId: element.id });
    if (isElements && styleDefs.length === 0) {
      return [EMPTY_OPTION];
    }
    return styleDefs.map((styleDef) => {
      return {
        label: styleDef.label,
        value: styleDef.id,
        fixed: isElements,
        color: getStylesProviderColorName(provider.getKey()),
        icon: isElements ? /* @__PURE__ */ React8.createElement(import_icons2.MapPinIcon, null) : null,
        provider: provider.getKey()
      };
    });
  });
}
function useCreateAction() {
  const [provider, createAction] = useCreateAndApplyClass();
  if (!provider || !createAction) {
    return {};
  }
  const create = (classLabel) => {
    createAction({ classLabel });
  };
  const validate = (newClassLabel, event) => {
    if (hasReachedLimit(provider)) {
      return {
        isValid: false,
        errorMessage: (0, import_i18n4.__)(
          "You\u2019ve reached the limit of 50 classes. Please remove an existing one to create a new class.",
          "elementor"
        )
      };
    }
    return (0, import_editor_styles_repository6.validateStyleLabel)(newClassLabel, event);
  };
  const entityName = provider.labels.singular && provider.labels.plural ? provider.labels : void 0;
  return { create, validate, entityName };
}
function hasReachedLimit(provider) {
  return provider.actions.all().length >= provider.limit;
}
function useAppliedOptions(options12) {
  const { element } = useElement();
  const currentClassesProp = useClassesProp();
  const appliedIds = (0, import_editor_elements2.useElementSetting)(element.id, currentClassesProp)?.value || [];
  const appliedOptions = options12.filter((option) => option.value && appliedIds.includes(option.value));
  const hasElementsProviderStyleApplied = appliedOptions.some(
    (option) => option.provider && (0, import_editor_styles_repository6.isElementsStylesProvider)(option.provider)
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
        break;
      case "removeOption":
        unapply({ classId: option.value, classLabel: option.label });
        break;
    }
  };
}

// src/panel.ts
var import_editor_panels2 = require("@elementor/editor-panels");

// src/components/editing-panel.tsx
var React86 = __toESM(require("react"));
var import_editor_controls51 = require("@elementor/editor-controls");
var import_editor_elements8 = require("@elementor/editor-elements");
var import_editor_panels = require("@elementor/editor-panels");
var import_editor_ui5 = require("@elementor/editor-ui");
var import_icons24 = require("@elementor/icons");
var import_session5 = require("@elementor/session");
var import_ui45 = require("@elementor/ui");
var import_i18n58 = require("@wordpress/i18n");

// src/controls-actions.ts
var import_menus = require("@elementor/menus");

// src/action.tsx
var React9 = __toESM(require("react"));
var import_ui7 = require("@elementor/ui");
var SIZE = "tiny";
function Action({ title, visible = true, icon: Icon, onClick }) {
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React9.createElement(import_ui7.Tooltip, { placement: "top", title, arrow: true }, /* @__PURE__ */ React9.createElement(import_ui7.IconButton, { "aria-label": title, size: SIZE, onClick }, /* @__PURE__ */ React9.createElement(Icon, { fontSize: SIZE })));
}

// src/popover-action.tsx
var React10 = __toESM(require("react"));
var import_react11 = require("react");
var import_ui8 = require("@elementor/ui");
var SIZE2 = "tiny";
function PopoverAction({
  title,
  visible = true,
  icon: Icon,
  content: PopoverContent
}) {
  const id = (0, import_react11.useId)();
  const popupState = (0, import_ui8.usePopupState)({
    variant: "popover",
    popupId: `elementor-popover-action-${id}`
  });
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement(import_ui8.Tooltip, { placement: "top", title }, /* @__PURE__ */ React10.createElement(import_ui8.IconButton, { "aria-label": title, key: id, size: SIZE2, ...(0, import_ui8.bindToggle)(popupState) }, /* @__PURE__ */ React10.createElement(Icon, { fontSize: SIZE2 }))), /* @__PURE__ */ React10.createElement(
    import_ui8.Popover,
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
      PaperProps: {
        sx: { my: 2.5 }
      },
      ...(0, import_ui8.bindPopover)(popupState)
    },
    /* @__PURE__ */ React10.createElement(PopoverContent, { close: popupState.close })
  ));
}

// src/controls-actions.ts
var controlActionsMenu = (0, import_menus.createMenu)({
  components: {
    Action,
    PopoverAction
  }
});

// src/components/editing-panel-error-fallback.tsx
var React11 = __toESM(require("react"));
var import_ui9 = require("@elementor/ui");
function EditorPanelErrorFallback() {
  return /* @__PURE__ */ React11.createElement(import_ui9.Box, { role: "alert", sx: { minHeight: "100%", p: 2 } }, /* @__PURE__ */ React11.createElement(import_ui9.Alert, { severity: "error", sx: { mb: 2, maxWidth: 400, textAlign: "center" } }, /* @__PURE__ */ React11.createElement("strong", null, "Something went wrong")));
}

// src/components/editing-panel-tabs.tsx
var React85 = __toESM(require("react"));
var import_react36 = require("react");
var import_editor_v1_adapters16 = require("@elementor/editor-v1-adapters");
var import_ui44 = require("@elementor/ui");
var import_i18n57 = require("@wordpress/i18n");

// src/contexts/scroll-context.tsx
var React12 = __toESM(require("react"));
var import_react12 = require("react");
var import_ui10 = require("@elementor/ui");
var ScrollContext = (0, import_react12.createContext)(void 0);
var ScrollPanel = (0, import_ui10.styled)("div")`
	height: 100%;
	overflow-y: auto;
`;
var DEFAULT_SCROLL_DIRECTION = "up";
function ScrollProvider({ children }) {
  const [direction, setDirection] = (0, import_react12.useState)(DEFAULT_SCROLL_DIRECTION);
  const ref = (0, import_react12.useRef)(null);
  const scrollPos = (0, import_react12.useRef)(0);
  (0, import_react12.useEffect)(() => {
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
  return /* @__PURE__ */ React12.createElement(ScrollContext.Provider, { value: { direction } }, /* @__PURE__ */ React12.createElement(ScrollPanel, { ref }, children));
}
function useScrollDirection() {
  return (0, import_react12.useContext)(ScrollContext)?.direction ?? DEFAULT_SCROLL_DIRECTION;
}

// src/hooks/use-default-panel-settings.ts
var import_react13 = require("react");
var fallbackEditorSettings = {
  defaultSectionsExpanded: {
    settings: ["Content", "Settings"],
    style: []
  },
  defaultTab: "settings"
};
var defaultPanelSettingsContext = (0, import_react13.createContext)({
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
  const defaults = (0, import_react13.useContext)(defaultPanelSettingsContext)[element.type];
  return defaults || fallbackEditorSettings;
};

// src/hooks/use-state-by-element.ts
var import_react14 = require("react");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
var import_session = require("@elementor/session");
var useStateByElement = (key, initialValue) => {
  const { element } = useElement();
  const isFeatureActive = (0, import_editor_v1_adapters2.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30);
  const lookup = `elementor/editor-state/${element.id}/${key}`;
  const storedValue = isFeatureActive ? (0, import_session.getSessionStorageItem)(lookup) : initialValue;
  const [value, setValue] = (0, import_react14.useState)(storedValue ?? initialValue);
  const doUpdate = (newValue) => {
    (0, import_session.setSessionStorageItem)(lookup, newValue);
    setValue(newValue);
  };
  return [value, doUpdate];
};

// src/components/settings-tab.tsx
var React19 = __toESM(require("react"));
var import_editor_controls4 = require("@elementor/editor-controls");
var import_editor_v1_adapters4 = require("@elementor/editor-v1-adapters");
var import_session2 = require("@elementor/session");
var import_ui16 = require("@elementor/ui");

// src/controls-registry/control.tsx
var React13 = __toESM(require("react"));

// src/controls-registry/controls-registry.tsx
var import_editor_controls2 = require("@elementor/editor-controls");
var import_editor_props2 = require("@elementor/editor-props");
var controlTypes = {
  image: { component: import_editor_controls2.ImageControl, layout: "full", propTypeUtil: import_editor_props2.imagePropTypeUtil },
  "svg-media": { component: import_editor_controls2.SvgMediaControl, layout: "full", propTypeUtil: import_editor_props2.imageSrcPropTypeUtil },
  text: { component: import_editor_controls2.TextControl, layout: "full", propTypeUtil: import_editor_props2.stringPropTypeUtil },
  textarea: { component: import_editor_controls2.TextAreaControl, layout: "full", propTypeUtil: import_editor_props2.stringPropTypeUtil },
  size: { component: import_editor_controls2.SizeControl, layout: "two-columns", propTypeUtil: import_editor_props2.sizePropTypeUtil },
  select: { component: import_editor_controls2.SelectControl, layout: "two-columns", propTypeUtil: import_editor_props2.stringPropTypeUtil },
  link: { component: import_editor_controls2.LinkControl, layout: "full", propTypeUtil: import_editor_props2.linkPropTypeUtil },
  url: { component: import_editor_controls2.UrlControl, layout: "full", propTypeUtil: import_editor_props2.stringPropTypeUtil },
  switch: { component: import_editor_controls2.SwitchControl, layout: "two-columns", propTypeUtil: import_editor_props2.booleanPropTypeUtil },
  repeatable: { component: import_editor_controls2.RepeatableControl, layout: "full", propTypeUtil: void 0 },
  "key-value": { component: import_editor_controls2.KeyValueControl, layout: "full", propTypeUtil: import_editor_props2.keyValuePropTypeUtil }
};
var getControl = (type) => controlTypes[type]?.component;
var getDefaultLayout = (type) => controlTypes[type].layout;
var getPropTypeUtil = (type) => controlTypes[type]?.propTypeUtil;

// src/controls-registry/control.tsx
var Control = ({ props, type }) => {
  const ControlByType = getControl(type);
  const { element } = useElement();
  if (!ControlByType) {
    throw new ControlTypeNotFoundError({
      context: { controlType: type }
    });
  }
  return /* @__PURE__ */ React13.createElement(ControlByType, { ...props, context: { elementId: element.id } });
};

// src/controls-registry/control-type-container.tsx
var React14 = __toESM(require("react"));
var import_ui11 = require("@elementor/ui");
var ControlTypeContainer = ({ children, layout }) => {
  return /* @__PURE__ */ React14.createElement(StyledContainer, { layout }, children);
};
var StyledContainer = (0, import_ui11.styled)(import_ui11.Box, {
  shouldForwardProp: (prop) => !["layout"].includes(prop)
})(({ layout, theme }) => ({
  display: "grid",
  gridGap: theme.spacing(1),
  ...getGridLayout(layout)
}));
var getGridLayout = (layout) => ({
  justifyContent: "space-between",
  gridTemplateColumns: {
    full: "minmax(0, 1fr)",
    "two-columns": "repeat(2, minmax(0, 1fr))"
  }[layout]
});

// src/controls-registry/settings-field.tsx
var React15 = __toESM(require("react"));
var import_editor_controls3 = require("@elementor/editor-controls");
var import_editor_elements3 = require("@elementor/editor-elements");

// src/controls-registry/create-top-level-object-type.ts
var createTopLevelOjectType = ({ schema }) => {
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
var SettingsField = ({ bind, children }) => {
  const { element, elementType } = useElement();
  const settingsValue = (0, import_editor_elements3.useElementSetting)(element.id, bind);
  const value = { [bind]: settingsValue };
  const propType = createTopLevelOjectType({ schema: elementType.propsSchema });
  const setValue = (newValue) => {
    (0, import_editor_elements3.updateElementSettings)({
      id: element.id,
      props: { ...newValue }
    });
  };
  return /* @__PURE__ */ React15.createElement(import_editor_controls3.PropProvider, { propType, value, setValue }, /* @__PURE__ */ React15.createElement(import_editor_controls3.PropKeyProvider, { bind }, children));
};

// src/components/section.tsx
var React17 = __toESM(require("react"));
var import_react16 = require("react");
var import_editor_v1_adapters3 = require("@elementor/editor-v1-adapters");
var import_ui14 = require("@elementor/ui");

// src/components/collapse-icon.tsx
var import_icons3 = require("@elementor/icons");
var import_ui12 = require("@elementor/ui");
var CollapseIcon = (0, import_ui12.styled)(import_icons3.ChevronDownIcon, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  transform: open ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.standard
  })
}));

// src/components/collapsible-content.tsx
var React16 = __toESM(require("react"));
var import_react15 = require("react");
var import_ui13 = require("@elementor/ui");
var import_i18n5 = require("@wordpress/i18n");
var IndicatorsWrapper = (0, import_ui13.styled)("div")`
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
  const [open, setOpen] = (0, import_react15.useState)(defaultOpen);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  return /* @__PURE__ */ React16.createElement(import_ui13.Stack, null, /* @__PURE__ */ React16.createElement(import_ui13.Stack, { sx: { position: "relative" } }, /* @__PURE__ */ React16.createElement(
    import_ui13.Button,
    {
      fullWidth: true,
      size: "small",
      color: "secondary",
      variant: "outlined",
      onClick: handleToggle,
      endIcon: /* @__PURE__ */ React16.createElement(CollapseIcon, { open }),
      sx: { my: 0.5 }
    },
    open ? (0, import_i18n5.__)("Show less", "elementor") : (0, import_i18n5.__)("Show more", "elementor")
  ), titleEnd && /* @__PURE__ */ React16.createElement(IndicatorsWrapper, null, getCollapsibleValue(titleEnd, open))), /* @__PURE__ */ React16.createElement(import_ui13.Collapse, { in: open, timeout: "auto", unmountOnExit: true }, children));
};
function getCollapsibleValue(value, isOpen) {
  if (typeof value === "function") {
    return value(isOpen);
  }
  return value;
}

// src/components/section.tsx
var SectionRefContext = (0, import_react16.createContext)(null);
var useSectionRef = () => (0, import_react16.useContext)(SectionRefContext);
function Section({ title, children, defaultExpanded = false, titleEnd }) {
  const [isOpen, setIsOpen] = useStateByElement(title, !!defaultExpanded);
  const ref = (0, import_react16.useRef)(null);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  const id = (0, import_react16.useId)();
  const labelId = `label-${id}`;
  const contentId = `content-${id}`;
  const isUsingTitleEnd = (0, import_editor_v1_adapters3.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30);
  return /* @__PURE__ */ React17.createElement(React17.Fragment, null, /* @__PURE__ */ React17.createElement(
    import_ui14.ListItemButton,
    {
      id: labelId,
      "aria-controls": contentId,
      onClick: handleClick,
      sx: { "&:hover": { backgroundColor: "transparent" } }
    },
    /* @__PURE__ */ React17.createElement(import_ui14.Stack, { direction: "row", alignItems: "center", justifyItems: "start", flexGrow: 1, gap: 0.5 }, /* @__PURE__ */ React17.createElement(
      import_ui14.ListItemText,
      {
        secondary: title,
        secondaryTypographyProps: { color: "text.primary", variant: "caption", fontWeight: "bold" },
        sx: { flexGrow: 0, flexShrink: 1, marginInlineEnd: 1 }
      }
    ), isUsingTitleEnd ? getCollapsibleValue(titleEnd, isOpen) : null),
    /* @__PURE__ */ React17.createElement(CollapseIcon, { open: isOpen, color: "secondary", fontSize: "tiny" })
  ), /* @__PURE__ */ React17.createElement(import_ui14.Collapse, { id: contentId, "aria-labelledby": labelId, in: isOpen, timeout: "auto", unmountOnExit: true }, /* @__PURE__ */ React17.createElement(SectionRefContext.Provider, { value: ref }, /* @__PURE__ */ React17.createElement(import_ui14.Stack, { ref, gap: 2.5, p: 2 }, children))), /* @__PURE__ */ React17.createElement(import_ui14.Divider, null));
}

// src/components/sections-list.tsx
var React18 = __toESM(require("react"));
var import_ui15 = require("@elementor/ui");
function SectionsList(props) {
  return /* @__PURE__ */ React18.createElement(import_ui15.List, { disablePadding: true, component: "div", ...props });
}

// src/components/settings-tab.tsx
var SettingsTab = () => {
  const { elementType, element } = useElement();
  const settingsDefault = useDefaultPanelSettings();
  const isDefaultExpanded = (sectionId) => (0, import_editor_v1_adapters4.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30) ? settingsDefault.defaultSectionsExpanded.settings?.includes(sectionId) : true;
  return /* @__PURE__ */ React19.createElement(import_session2.SessionStorageProvider, { prefix: element.id }, /* @__PURE__ */ React19.createElement(SectionsList, null, elementType.controls.map(({ type, value }, index) => {
    if (type === "control") {
      return /* @__PURE__ */ React19.createElement(Control2, { key: value.bind, control: value });
    }
    if (type === "section") {
      return /* @__PURE__ */ React19.createElement(
        Section,
        {
          title: value.label,
          key: type + "." + index,
          defaultExpanded: isDefaultExpanded(value.label)
        },
        value.items?.map((item) => {
          if (item.type === "control") {
            return /* @__PURE__ */ React19.createElement(Control2, { key: item.value.bind, control: item.value });
          }
          return null;
        })
      );
    }
    return null;
  })));
};
var Control2 = ({ control }) => {
  if (!getControl(control.type)) {
    return null;
  }
  const layout = control.meta?.layout || getDefaultLayout(control.type);
  const controlProps = populateChildControlProps(control.props);
  return /* @__PURE__ */ React19.createElement(SettingsField, { bind: control.bind }, control.meta?.topDivider && /* @__PURE__ */ React19.createElement(import_ui16.Divider, null), /* @__PURE__ */ React19.createElement(ControlTypeContainer, { layout }, control.label ? /* @__PURE__ */ React19.createElement(import_editor_controls4.ControlFormLabel, null, control.label) : null, /* @__PURE__ */ React19.createElement(Control, { type: control.type, props: controlProps })));
};
function populateChildControlProps(props) {
  if (props.childControlType) {
    const childComponent = getControl(props.childControlType);
    const childPropType = getPropTypeUtil(props.childControlType);
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

// src/components/style-tab.tsx
var React84 = __toESM(require("react"));
var import_react35 = require("react");
var import_editor_props10 = require("@elementor/editor-props");
var import_editor_responsive3 = require("@elementor/editor-responsive");
var import_session4 = require("@elementor/session");
var import_ui43 = require("@elementor/ui");
var import_i18n56 = require("@wordpress/i18n");

// src/contexts/styles-inheritance-context.tsx
var React20 = __toESM(require("react"));
var import_react18 = require("react");
var import_editor_elements4 = require("@elementor/editor-elements");
var import_editor_props5 = require("@elementor/editor-props");
var import_editor_responsive = require("@elementor/editor-responsive");
var import_editor_styles = require("@elementor/editor-styles");
var import_editor_styles_repository7 = require("@elementor/editor-styles-repository");

// src/hooks/use-styles-rerender.ts
var import_react17 = require("react");
var useStylesRerender = () => {
  const { provider } = useStyle();
  const [, reRender] = (0, import_react17.useReducer)((p) => !p, false);
  (0, import_react17.useEffect)(() => provider?.subscribe(reRender), [provider]);
};

// src/styles-inheritance/create-styles-inheritance.ts
var import_editor_props4 = require("@elementor/editor-props");

// src/styles-inheritance/create-snapshots-manager.ts
var import_editor_props3 = require("@elementor/editor-props");

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
    if (state && !allBreakpointStatesSnapshots[currentBreakpointKey][stateKey]) {
      allBreakpointStatesSnapshots[currentBreakpointKey][stateKey] = buildStateSnapshotSlot(
        getStylesByMeta({ breakpoint: currentBreakpointId, state }),
        parentBreakpoint,
        allBreakpointStatesSnapshots[currentBreakpointKey],
        state
      );
    }
  };
  return (meta) => {
    const { breakpoint, state } = meta;
    const stateKey = getStateKey(state);
    const breakpointKey = getBreakpointKey(breakpoint);
    if (allBreakpointStatesSnapshots[breakpointKey]?.[stateKey]) {
      return allBreakpointStatesSnapshots[breakpointKey][stateKey].snapshot;
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
      const filteredValue = (0, import_editor_props3.filterEmptyValues)(value);
      if (filteredValue === null) {
        return;
      }
      if (!snapshot[key]) {
        snapshot[key] = [];
      }
      const snapshotPropValue = {
        ...styleData,
        value: filteredValue
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
        })).filter(({ value: styleValue }) => !(0, import_editor_props4.isEmpty)(styleValue));
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
    if ((0, import_editor_props4.isTransformable)(currentScope)) {
      return currentScope.value?.[key] ?? null;
    }
    if (typeof currentScope === "object") {
      return currentScope[key] ?? null;
    }
    return null;
  }, value);
}
function shouldUseOriginalValue(filterPropType, value) {
  return !!filterPropType && (0, import_editor_props4.isTransformable)(value) && filterPropType.key !== value.$$type;
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
var Context4 = (0, import_react18.createContext)(null);
function StyleInheritanceProvider({ children }) {
  const styleDefs = useAppliedStyles();
  const breakpointsTree = (0, import_editor_responsive.getBreakpointsTree)();
  const { getSnapshot, getInheritanceChain } = createStylesInheritance(styleDefs, breakpointsTree);
  return /* @__PURE__ */ React20.createElement(Context4.Provider, { value: { getSnapshot, getInheritanceChain } }, children);
}
function useStylesInheritanceSnapshot() {
  const context = (0, import_react18.useContext)(Context4);
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
  const context = (0, import_react18.useContext)(Context4);
  if (!context) {
    throw new Error("useStylesInheritanceChain must be used within a StyleInheritanceProvider");
  }
  const schema = (0, import_editor_styles.getStylesSchema)();
  const topLevelPropType = schema?.[path[0]];
  const snapshot = useStylesInheritanceSnapshot();
  if (!snapshot) {
    return [];
  }
  return context.getInheritanceChain(snapshot, path, topLevelPropType);
}
var useAppliedStyles = () => {
  const { element } = useElement();
  const currentClassesProp = useClassesProp();
  const baseStyles = useBaseStyles();
  useStylesRerender();
  const classesProp = (0, import_editor_elements4.useElementSetting)(element.id, currentClassesProp);
  const appliedStyles = import_editor_props5.classesPropTypeUtil.extract(classesProp) ?? [];
  return import_editor_styles_repository7.stylesRepository.all().filter((style) => [...baseStyles, ...appliedStyles].includes(style.id));
};
var useBaseStyles = () => {
  const { elementType } = useElement();
  const widgetsCache = (0, import_editor_elements4.getWidgetsCache)();
  const widgetCache = widgetsCache?.[elementType.key];
  return Object.keys(widgetCache?.base_styles ?? {});
};

// src/hooks/use-active-style-def-id.ts
var import_editor_elements5 = require("@elementor/editor-elements");
function useActiveStyleDefId(classProp) {
  const [activeStyledDefId, setActiveStyledDefId] = useStateByElement(
    "active-style-id",
    null
  );
  const appliedClassesIds = useAppliedClassesIds(classProp)?.value || [];
  const fallback = useFirstAppliedClass(appliedClassesIds);
  const activeAndAppliedClassId = useActiveAndAppliedClassId(activeStyledDefId, appliedClassesIds);
  return [activeAndAppliedClassId || fallback?.id || null, setActiveStyledDefId];
}
function useFirstAppliedClass(appliedClassesIds) {
  const { element } = useElement();
  const stylesDefs = (0, import_editor_elements5.getElementStyles)(element.id) ?? {};
  return Object.values(stylesDefs).find((styleDef) => appliedClassesIds.includes(styleDef.id));
}
function useAppliedClassesIds(classProp) {
  const { element } = useElement();
  return (0, import_editor_elements5.useElementSetting)(element.id, classProp);
}
function useActiveAndAppliedClassId(id, appliedClassesIds) {
  const isClassApplied = !!id && appliedClassesIds.includes(id);
  return isClassApplied ? id : null;
}

// src/components/style-sections/background-section/background-section.tsx
var React29 = __toESM(require("react"));
var import_editor_controls7 = require("@elementor/editor-controls");
var import_i18n11 = require("@wordpress/i18n");

// src/controls-registry/styles-field.tsx
var React27 = __toESM(require("react"));
var import_editor_controls6 = require("@elementor/editor-controls");
var import_editor_styles3 = require("@elementor/editor-styles");

// src/hooks/use-styles-fields.ts
var import_react19 = require("react");
var import_editor_elements6 = require("@elementor/editor-elements");
var import_editor_styles2 = require("@elementor/editor-styles");
var import_editor_styles_repository8 = require("@elementor/editor-styles-repository");
var import_editor_v1_adapters5 = require("@elementor/editor-v1-adapters");
var import_i18n6 = require("@wordpress/i18n");
function useStylesFields(propNames) {
  const { element } = useElement();
  const { id, meta, provider, canEdit } = useStyle();
  const classesProp = useClassesProp();
  const undoableUpdateStyle = useUndoableUpdateStyle();
  const undoableCreateElementStyle = useUndoableCreateElementStyle();
  useStylesRerender();
  const values = getProps({
    elementId: element.id,
    styleId: id,
    provider,
    meta,
    propNames
  });
  const setValues = (props) => {
    if (id === null) {
      undoableCreateElementStyle({
        elementId: element.id,
        classesProp,
        meta,
        props
      });
      return;
    }
    undoableUpdateStyle({
      elementId: element.id,
      styleId: id,
      provider,
      meta,
      props
    });
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
function useUndoableCreateElementStyle() {
  return (0, import_react19.useMemo)(() => {
    return (0, import_editor_v1_adapters5.undoable)(
      {
        do: (payload) => {
          return (0, import_editor_elements6.createElementStyle)({
            ...payload,
            label: import_editor_styles_repository8.ELEMENTS_STYLES_RESERVED_LABEL
          });
        },
        undo: ({ elementId }, styleId) => {
          (0, import_editor_elements6.deleteElementStyle)(elementId, styleId);
        },
        redo: (payload, styleId) => {
          return (0, import_editor_elements6.createElementStyle)({
            ...payload,
            styleId,
            label: import_editor_styles_repository8.ELEMENTS_STYLES_RESERVED_LABEL
          });
        }
      },
      {
        title: ({ elementId }) => (0, import_editor_elements6.getElementLabel)(elementId),
        subtitle: (0, import_i18n6.__)("Style edited", "elementor")
      }
    );
  }, []);
}
function useUndoableUpdateStyle() {
  return (0, import_react19.useMemo)(() => {
    return (0, import_editor_v1_adapters5.undoable)(
      {
        do: ({ elementId, styleId, provider, meta, props }) => {
          if (!provider.actions.updateProps) {
            throw new StylesProviderCannotUpdatePropsError({
              context: { providerKey: provider.getKey() }
            });
          }
          const style = provider.actions.get(styleId, { elementId });
          const prevProps = getCurrentProps(style, meta);
          provider.actions.updateProps(
            {
              id: styleId,
              meta,
              props
            },
            { elementId }
          );
          return prevProps;
        },
        undo: ({ elementId, styleId, meta, provider }, prevProps) => {
          provider.actions.updateProps?.({ id: styleId, meta, props: prevProps }, { elementId });
        }
      },
      {
        title: ({ elementId }) => (0, import_editor_elements6.getElementLabel)(elementId),
        subtitle: (0, import_i18n6.__)("Style edited", "elementor")
      }
    );
  }, []);
}
function getCurrentProps(style, meta) {
  if (!style) {
    return {};
  }
  const variant = (0, import_editor_styles2.getVariantByMeta)(style, meta);
  const props = variant?.props ?? {};
  return structuredClone(props);
}

// src/hooks/use-styles-field.ts
function useStylesField(propName) {
  const { values, setValues, canEdit } = useStylesFields([propName]);
  const value = values?.[propName] ?? null;
  const setValue = (newValue) => {
    setValues({
      [propName]: newValue
    });
  };
  return { value, setValue, canEdit };
}

// src/styles-inheritance/components/styles-inheritance-indicator.tsx
var React26 = __toESM(require("react"));
var import_editor_controls5 = require("@elementor/editor-controls");
var import_editor_props6 = require("@elementor/editor-props");
var import_editor_styles_repository11 = require("@elementor/editor-styles-repository");
var import_editor_v1_adapters7 = require("@elementor/editor-v1-adapters");
var import_ui23 = require("@elementor/ui");
var import_i18n10 = require("@wordpress/i18n");

// src/styles-inheritance/consts.ts
var import_editor_v1_adapters6 = require("@elementor/editor-v1-adapters");
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
var isUsingIndicatorPopover = () => (0, import_editor_v1_adapters6.isExperimentActive)("e_v_3_30");

// src/styles-inheritance/components/styles-inheritance-infotip.tsx
var React25 = __toESM(require("react"));
var import_react21 = require("react");
var import_editor_canvas2 = require("@elementor/editor-canvas");
var import_editor_ui4 = require("@elementor/editor-ui");
var import_ui22 = require("@elementor/ui");
var import_i18n9 = require("@wordpress/i18n");

// src/hooks/use-direction.ts
var import_ui17 = require("@elementor/ui");

// src/sync/get-elementor-globals.ts
var getElementorConfig = () => {
  const extendedWindow = window;
  return extendedWindow.elementor?.config ?? {};
};
var getElementorFrontendConfig = () => {
  const extendedWindow = window;
  return extendedWindow.elementorFrontend?.config ?? {};
};

// src/hooks/use-direction.ts
function useDirection() {
  const theme = (0, import_ui17.useTheme)();
  const isUiRtl = "rtl" === theme.direction, isSiteRtl = !!getElementorFrontendConfig()?.is_rtl;
  return { isSiteRtl, isUiRtl };
}

// src/styles-inheritance/hooks/use-normalized-inheritance-chain-items.tsx
var import_react20 = require("react");
var import_editor_styles_repository9 = require("@elementor/editor-styles-repository");
var import_i18n7 = require("@wordpress/i18n");
var MAXIMUM_ITEMS = 2;
var useNormalizedInheritanceChainItems = (inheritanceChain, bind, resolve) => {
  const [items3, setItems] = (0, import_react20.useState)([]);
  (0, import_react20.useEffect)(() => {
    (async () => {
      const normalizedItems = await Promise.all(
        inheritanceChain.filter(({ style }) => style).map((item, index) => normalizeInheritanceItem(item, index, bind, resolve))
      );
      const validItems = normalizedItems.map((item) => ({
        ...item,
        displayLabel: import_editor_styles_repository9.ELEMENTS_BASE_STYLES_PROVIDER_KEY !== item.provider ? item.displayLabel : (0, import_i18n7.__)("Base", "elementor")
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
  const displayLabel = `${label}${state ? ":" + state : ""}`;
  return {
    id: id ? id + (state ?? "") : index,
    provider: item.provider || "",
    breakpoint: breakpoint ?? DEFAULT_BREAKPOINT2,
    displayLabel,
    value: await getTransformedValue(item, bind, resolve)
  };
};
var getTransformedValue = async (item, bind, resolve) => {
  try {
    const result = await resolve({
      props: {
        [bind]: item.value
      }
    });
    const value = result?.[bind] ?? result;
    if ((0, import_react20.isValidElement)(value)) {
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

// src/styles-inheritance/styles-inheritance-transformers-registry.tsx
var import_editor_canvas = require("@elementor/editor-canvas");
var stylesInheritanceTransformersRegistry = (0, import_editor_canvas.createTransformersRegistry)();

// src/styles-inheritance/components/infotip/breakpoint-icon.tsx
var React21 = __toESM(require("react"));
var import_editor_responsive2 = require("@elementor/editor-responsive");
var import_icons4 = require("@elementor/icons");
var import_ui18 = require("@elementor/ui");
var SIZE3 = "tiny";
var DEFAULT_BREAKPOINT3 = "desktop";
var breakpointIconMap = {
  widescreen: import_icons4.WidescreenIcon,
  desktop: import_icons4.DesktopIcon,
  laptop: import_icons4.LaptopIcon,
  tablet_extra: import_icons4.TabletLandscapeIcon,
  tablet: import_icons4.TabletPortraitIcon,
  mobile_extra: import_icons4.MobileLandscapeIcon,
  mobile: import_icons4.MobilePortraitIcon
};
var BreakpointIcon = ({ breakpoint }) => {
  const breakpoints = (0, import_editor_responsive2.useBreakpoints)();
  const currentBreakpoint = breakpoint || DEFAULT_BREAKPOINT3;
  const IconComponent = breakpointIconMap[currentBreakpoint];
  if (!IconComponent) {
    return null;
  }
  const breakpointLabel = breakpoints.find((breakpointItem) => breakpointItem.id === currentBreakpoint)?.label;
  return /* @__PURE__ */ React21.createElement(import_ui18.Tooltip, { title: breakpointLabel, placement: "top" }, /* @__PURE__ */ React21.createElement(IconComponent, { fontSize: SIZE3, sx: { mt: "2px" } }));
};

// src/styles-inheritance/components/infotip/label-chip.tsx
var React22 = __toESM(require("react"));
var import_editor_styles_repository10 = require("@elementor/editor-styles-repository");
var import_icons5 = require("@elementor/icons");
var import_ui19 = require("@elementor/ui");
var import_i18n8 = require("@wordpress/i18n");
var SIZE4 = "tiny";
var LabelChip = ({ displayLabel, provider }) => {
  const isBaseStyle = provider === import_editor_styles_repository10.ELEMENTS_BASE_STYLES_PROVIDER_KEY;
  const chipIcon = isBaseStyle ? /* @__PURE__ */ React22.createElement(import_ui19.Tooltip, { title: (0, import_i18n8.__)("Inherited from base styles", "elementor"), placement: "top" }, /* @__PURE__ */ React22.createElement(import_icons5.InfoCircleIcon, { fontSize: SIZE4 })) : void 0;
  return /* @__PURE__ */ React22.createElement(
    import_ui19.Chip,
    {
      label: displayLabel,
      size: SIZE4,
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
var React23 = __toESM(require("react"));
var import_ui20 = require("@elementor/ui");
var ValueComponent = ({ index, value }) => {
  return /* @__PURE__ */ React23.createElement(
    import_ui20.Typography,
    {
      variant: "caption",
      color: "text.tertiary",
      sx: {
        mt: "1px",
        textDecoration: index === 0 ? "none" : "line-through",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    },
    value
  );
};

// src/styles-inheritance/components/infotip/action-icons.tsx
var React24 = __toESM(require("react"));
var import_ui21 = require("@elementor/ui");
var ActionIcons = () => /* @__PURE__ */ React24.createElement(import_ui21.Box, { display: "flex", gap: 0.5, alignItems: "center" });

// src/styles-inheritance/components/styles-inheritance-infotip.tsx
var SECTION_PADDING_INLINE = 32;
var StylesInheritanceInfotip = ({ inheritanceChain, propType, path, label, children }) => {
  const [showInfotip, setShowInfotip] = (0, import_react21.useState)(false);
  const toggleInfotip = () => setShowInfotip((prev) => !prev);
  const closeInfotip = () => setShowInfotip(false);
  const key = path.join(".");
  const sectionRef = useSectionRef();
  const sectionWidth = sectionRef?.current?.offsetWidth ?? 320 + SECTION_PADDING_INLINE;
  const resolve = (0, import_react21.useMemo)(() => {
    return (0, import_editor_canvas2.createPropsResolver)({
      transformers: stylesInheritanceTransformersRegistry,
      schema: { [key]: propType }
    });
  }, [key, propType]);
  const items3 = useNormalizedInheritanceChainItems(inheritanceChain, key, resolve);
  const infotipContent = /* @__PURE__ */ React25.createElement(import_ui22.ClickAwayListener, { onClickAway: closeInfotip }, /* @__PURE__ */ React25.createElement(
    import_ui22.Card,
    {
      elevation: 0,
      sx: {
        width: `${sectionWidth - SECTION_PADDING_INLINE}px`,
        maxWidth: 496,
        overflowX: "hidden"
      }
    },
    /* @__PURE__ */ React25.createElement(
      import_ui22.CardContent,
      {
        sx: {
          display: "flex",
          gap: 0.5,
          flexDirection: "column",
          p: 0,
          "&:last-child": {
            pb: 0
          }
        }
      },
      /* @__PURE__ */ React25.createElement(import_editor_ui4.PopoverHeader, { title: (0, import_i18n9.__)("Style origin", "elementor"), onClose: closeInfotip }),
      /* @__PURE__ */ React25.createElement(
        import_ui22.Stack,
        {
          gap: 1.5,
          sx: { pl: 2, pr: 1, pb: 2, overflowX: "hidden", overflowY: "auto" },
          role: "list"
        },
        items3.map((item, index) => {
          return /* @__PURE__ */ React25.createElement(
            import_ui22.Box,
            {
              key: item.id,
              display: "flex",
              gap: 0.5,
              role: "listitem",
              "aria-label": (0, import_i18n9.__)("Inheritance item: %s", "elementor").replace(
                "%s",
                item.displayLabel
              )
            },
            /* @__PURE__ */ React25.createElement(import_ui22.Box, { display: "flex", gap: 0.5, sx: { flexWrap: "wrap", width: "100%" } }, /* @__PURE__ */ React25.createElement(BreakpointIcon, { breakpoint: item.breakpoint }), /* @__PURE__ */ React25.createElement(LabelChip, { displayLabel: item.displayLabel, provider: item.provider }), /* @__PURE__ */ React25.createElement(ValueComponent, { index, value: item.value })),
            /* @__PURE__ */ React25.createElement(ActionIcons, null)
          );
        })
      )
    )
  ));
  return /* @__PURE__ */ React25.createElement(TooltipOrInfotip, { showInfotip, onClose: closeInfotip, infotipContent }, /* @__PURE__ */ React25.createElement(import_ui22.IconButton, { onClick: toggleInfotip, "aria-label": label, sx: { my: "-1px" } }, children));
};
function TooltipOrInfotip({
  children,
  showInfotip,
  onClose,
  infotipContent
}) {
  const { isSiteRtl } = useDirection();
  const forceInfotipAlignLeft = isSiteRtl ? 9999999 : -9999999;
  if (showInfotip) {
    return /* @__PURE__ */ React25.createElement(React25.Fragment, null, /* @__PURE__ */ React25.createElement(
      import_ui22.Backdrop,
      {
        open: showInfotip,
        onClick: onClose,
        sx: {
          backgroundColor: "transparent",
          zIndex: (theme) => theme.zIndex.modal - 1
        }
      }
    ), /* @__PURE__ */ React25.createElement(
      import_ui22.Infotip,
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
                options: { offset: [forceInfotipAlignLeft, 0] }
              }
            ]
          }
        }
      },
      children
    ));
  }
  return /* @__PURE__ */ React25.createElement(import_ui22.Tooltip, { title: (0, import_i18n9.__)("Style origin", "elementor"), placement: "top" }, children);
}

// src/styles-inheritance/components/styles-inheritance-indicator.tsx
var StylesInheritanceIndicator = () => {
  const { path, propType } = (0, import_editor_controls5.useBoundProp)();
  const isUsingNestedProps = (0, import_editor_v1_adapters7.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30);
  const finalPath = isUsingNestedProps ? path : path.slice(0, 1);
  const inheritanceChain = useStylesInheritanceChain(finalPath);
  if (!inheritanceChain.length) {
    return null;
  }
  return /* @__PURE__ */ React26.createElement(Indicator, { inheritanceChain, path: finalPath, propType });
};
var Indicator = ({ inheritanceChain, path, propType }) => {
  const { id: currentStyleId, provider: currentStyleProvider, meta: currentStyleMeta } = useStyle();
  const currentItem = currentStyleId ? getValueFromInheritanceChain(inheritanceChain, currentStyleId, currentStyleMeta) : null;
  const hasValue = !(0, import_editor_props6.isEmpty)(currentItem?.value);
  const [actualStyle] = inheritanceChain;
  if (actualStyle.provider === import_editor_styles_repository11.ELEMENTS_BASE_STYLES_PROVIDER_KEY) {
    return null;
  }
  const isFinalValue = currentItem === actualStyle;
  const label = getLabel({ isFinalValue, hasValue });
  const styleIndicatorProps = {
    getColor: isFinalValue && currentStyleProvider ? getStylesProviderThemeColor(currentStyleProvider.getKey()) : void 0,
    isOverridden: hasValue && !isFinalValue ? true : void 0
  };
  if (!isUsingIndicatorPopover()) {
    return /* @__PURE__ */ React26.createElement(import_ui23.Tooltip, { title: (0, import_i18n10.__)("Style origin", "elementor"), placement: "top" }, /* @__PURE__ */ React26.createElement(StyleIndicator, { ...styleIndicatorProps, "aria-label": label }));
  }
  return /* @__PURE__ */ React26.createElement(
    StylesInheritanceInfotip,
    {
      inheritanceChain,
      path,
      propType,
      label
    },
    /* @__PURE__ */ React26.createElement(StyleIndicator, { ...styleIndicatorProps })
  );
};
var getLabel = ({ isFinalValue, hasValue }) => {
  if (isFinalValue) {
    return (0, import_i18n10.__)("This is the final value", "elementor");
  }
  if (hasValue) {
    return (0, import_i18n10.__)("This value is overridden by another style", "elementor");
  }
  return (0, import_i18n10.__)("This has value from another style", "elementor");
};

// src/controls-registry/styles-field.tsx
var StylesField = ({ bind, placeholder, children }) => {
  const { value, setValue, canEdit } = useStylesField(bind);
  const stylesSchema = (0, import_editor_styles3.getStylesSchema)();
  const propType = createTopLevelOjectType({ schema: stylesSchema });
  const values = { [bind]: value };
  const placeholderValues = { [bind]: placeholder };
  const setValues = (newValue) => {
    setValue(newValue[bind]);
  };
  return /* @__PURE__ */ React27.createElement(
    import_editor_controls6.ControlAdornmentsProvider,
    {
      items: [
        {
          id: "styles-inheritance",
          Adornment: StylesInheritanceIndicator
        }
      ]
    },
    /* @__PURE__ */ React27.createElement(
      import_editor_controls6.PropProvider,
      {
        propType,
        value: values,
        setValue: setValues,
        placeholder: placeholderValues,
        disabled: !canEdit
      },
      /* @__PURE__ */ React27.createElement(import_editor_controls6.PropKeyProvider, { bind }, children)
    )
  );
};

// src/components/section-content.tsx
var React28 = __toESM(require("react"));
var import_ui24 = require("@elementor/ui");
var SectionContent = ({ gap = 2, sx, children }) => /* @__PURE__ */ React28.createElement(import_ui24.Stack, { gap, sx: { ...sx } }, children);

// src/components/style-sections/background-section/background-section.tsx
var BACKGROUND_LABEL = (0, import_i18n11.__)("Background", "elementor");
var BackgroundSection = () => {
  return /* @__PURE__ */ React29.createElement(SectionContent, null, /* @__PURE__ */ React29.createElement(StylesField, { bind: "background", propDisplayName: BACKGROUND_LABEL }, /* @__PURE__ */ React29.createElement(import_editor_controls7.BackgroundControl, null)));
};

// src/components/style-sections/border-section/border-section.tsx
var React40 = __toESM(require("react"));

// src/components/panel-divider.tsx
var React30 = __toESM(require("react"));
var import_ui25 = require("@elementor/ui");
var PanelDivider = () => /* @__PURE__ */ React30.createElement(import_ui25.Divider, { sx: { my: 0.5 } });

// src/components/style-sections/border-section/border-field.tsx
var React37 = __toESM(require("react"));
var import_editor_controls12 = require("@elementor/editor-controls");
var import_i18n15 = require("@wordpress/i18n");

// src/components/add-or-remove-content.tsx
var React31 = __toESM(require("react"));
var import_icons6 = require("@elementor/icons");
var import_ui26 = require("@elementor/ui");
var SIZE5 = "tiny";
var AddOrRemoveContent = ({
  isAdded,
  onAdd,
  onRemove,
  children,
  disabled,
  renderLabel
}) => {
  return /* @__PURE__ */ React31.createElement(SectionContent, null, /* @__PURE__ */ React31.createElement(
    import_ui26.Stack,
    {
      direction: "row",
      sx: {
        justifyContent: "space-between",
        alignItems: "center",
        marginInlineEnd: -0.75
      }
    },
    renderLabel(),
    isAdded ? /* @__PURE__ */ React31.createElement(import_ui26.IconButton, { size: SIZE5, onClick: onRemove, "aria-label": "Remove", disabled }, /* @__PURE__ */ React31.createElement(import_icons6.MinusIcon, { fontSize: SIZE5 })) : /* @__PURE__ */ React31.createElement(import_ui26.IconButton, { size: SIZE5, onClick: onAdd, "aria-label": "Add", disabled }, /* @__PURE__ */ React31.createElement(import_icons6.PlusIcon, { fontSize: SIZE5 }))
  ), /* @__PURE__ */ React31.createElement(import_ui26.Collapse, { in: isAdded, unmountOnExit: true }, /* @__PURE__ */ React31.createElement(SectionContent, null, children)));
};

// src/components/style-sections/border-section/border-color-field.tsx
var React34 = __toESM(require("react"));
var import_editor_controls9 = require("@elementor/editor-controls");
var import_i18n12 = require("@wordpress/i18n");

// src/components/styles-field-layout.tsx
var React33 = __toESM(require("react"));
var import_ui28 = require("@elementor/ui");

// src/components/control-label.tsx
var React32 = __toESM(require("react"));
var import_editor_controls8 = require("@elementor/editor-controls");
var import_ui27 = require("@elementor/ui");
var ControlLabel = ({ children }) => {
  return /* @__PURE__ */ React32.createElement(import_ui27.Stack, { direction: "row", alignItems: "center", justifyItems: "start", gap: 0.25 }, /* @__PURE__ */ React32.createElement(import_editor_controls8.ControlFormLabel, null, children), /* @__PURE__ */ React32.createElement(import_editor_controls8.ControlAdornments, null));
};

// src/components/styles-field-layout.tsx
var StylesFieldLayout = React33.forwardRef((props, ref) => {
  const { direction = "row", children, label } = props;
  const LayoutComponent = direction === "row" ? Row : Column;
  return /* @__PURE__ */ React33.createElement(LayoutComponent, { label, ref, children });
});
var Row = React33.forwardRef(
  ({ label, children }, ref) => {
    return /* @__PURE__ */ React33.createElement(import_ui28.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap", ref }, /* @__PURE__ */ React33.createElement(import_ui28.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React33.createElement(ControlLabel, null, label)), /* @__PURE__ */ React33.createElement(
      import_ui28.Grid,
      {
        item: true,
        xs: 6,
        sx: (theme) => ({
          width: `calc(50% - ${theme.spacing(2)})`
        })
      },
      children
    ));
  }
);
var Column = React33.forwardRef(
  ({ label, children }, ref) => {
    return /* @__PURE__ */ React33.createElement(import_ui28.Stack, { gap: 0.75, ref }, /* @__PURE__ */ React33.createElement(ControlLabel, null, label), children);
  }
);

// src/components/style-sections/border-section/border-color-field.tsx
var BORDER_COLOR_LABEL = (0, import_i18n12.__)("Border color", "elementor");
var BorderColorField = () => /* @__PURE__ */ React34.createElement(StylesField, { bind: "border-color", propDisplayName: BORDER_COLOR_LABEL }, /* @__PURE__ */ React34.createElement(StylesFieldLayout, { label: BORDER_COLOR_LABEL }, /* @__PURE__ */ React34.createElement(import_editor_controls9.ColorControl, null)));

// src/components/style-sections/border-section/border-style-field.tsx
var React35 = __toESM(require("react"));
var import_editor_controls10 = require("@elementor/editor-controls");
var import_i18n13 = require("@wordpress/i18n");
var BORDER_TYPE_LABEL = (0, import_i18n13.__)("Border type", "elementor");
var borderStyles = [
  { value: "none", label: (0, import_i18n13.__)("None", "elementor") },
  { value: "solid", label: (0, import_i18n13.__)("Solid", "elementor") },
  { value: "dashed", label: (0, import_i18n13.__)("Dashed", "elementor") },
  { value: "dotted", label: (0, import_i18n13.__)("Dotted", "elementor") },
  { value: "double", label: (0, import_i18n13.__)("Double", "elementor") },
  { value: "groove", label: (0, import_i18n13.__)("Groove", "elementor") },
  { value: "ridge", label: (0, import_i18n13.__)("Ridge", "elementor") },
  { value: "inset", label: (0, import_i18n13.__)("Inset", "elementor") },
  { value: "outset", label: (0, import_i18n13.__)("Outset", "elementor") }
];
var BorderStyleField = () => /* @__PURE__ */ React35.createElement(StylesField, { bind: "border-style", propDisplayName: BORDER_TYPE_LABEL }, /* @__PURE__ */ React35.createElement(StylesFieldLayout, { label: BORDER_TYPE_LABEL }, /* @__PURE__ */ React35.createElement(import_editor_controls10.SelectControl, { options: borderStyles })));

// src/components/style-sections/border-section/border-width-field.tsx
var React36 = __toESM(require("react"));
var import_editor_controls11 = require("@elementor/editor-controls");
var import_editor_props7 = require("@elementor/editor-props");
var import_icons7 = require("@elementor/icons");
var import_ui29 = require("@elementor/ui");
var import_i18n14 = require("@wordpress/i18n");
var BORDER_WIDTH_LABEL = (0, import_i18n14.__)("Border width", "elementor");
var InlineStartIcon = (0, import_ui29.withDirection)(import_icons7.SideRightIcon);
var InlineEndIcon = (0, import_ui29.withDirection)(import_icons7.SideLeftIcon);
var getEdges = (isSiteRtl) => [
  {
    label: (0, import_i18n14.__)("Top", "elementor"),
    icon: /* @__PURE__ */ React36.createElement(import_icons7.SideTopIcon, { fontSize: "tiny" }),
    bind: "block-start"
  },
  {
    label: isSiteRtl ? (0, import_i18n14.__)("Left", "elementor") : (0, import_i18n14.__)("Right", "elementor"),
    icon: /* @__PURE__ */ React36.createElement(InlineStartIcon, { fontSize: "tiny" }),
    bind: "inline-end"
  },
  {
    label: (0, import_i18n14.__)("Bottom", "elementor"),
    icon: /* @__PURE__ */ React36.createElement(import_icons7.SideBottomIcon, { fontSize: "tiny" }),
    bind: "block-end"
  },
  {
    label: isSiteRtl ? (0, import_i18n14.__)("Right", "elementor") : (0, import_i18n14.__)("Left", "elementor"),
    icon: /* @__PURE__ */ React36.createElement(InlineEndIcon, { fontSize: "tiny" }),
    bind: "inline-start"
  }
];
var BorderWidthField = () => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React36.createElement(StylesField, { bind: "border-width", propDisplayName: BORDER_WIDTH_LABEL }, /* @__PURE__ */ React36.createElement(
    import_editor_controls11.EqualUnequalSizesControl,
    {
      items: getEdges(isSiteRtl),
      label: BORDER_WIDTH_LABEL,
      icon: /* @__PURE__ */ React36.createElement(import_icons7.SideAllIcon, { fontSize: "tiny" }),
      tooltipLabel: (0, import_i18n14.__)("Adjust borders", "elementor"),
      multiSizePropTypeUtil: import_editor_props7.borderWidthPropTypeUtil
    }
  ));
};

// src/components/style-sections/border-section/border-field.tsx
var initialBorder = {
  "border-width": { $$type: "size", value: { size: 1, unit: "px" } },
  "border-color": { $$type: "color", value: "#000000" },
  "border-style": { $$type: "string", value: "solid" }
};
var BorderField = () => {
  const { values, setValues, canEdit } = useStylesFields(Object.keys(initialBorder));
  const addBorder = () => {
    setValues(initialBorder);
  };
  const removeBorder = () => {
    setValues({
      "border-width": null,
      "border-color": null,
      "border-style": null
    });
  };
  const hasBorder = Object.values(values ?? {}).some(Boolean);
  return /* @__PURE__ */ React37.createElement(
    AddOrRemoveContent,
    {
      isAdded: hasBorder,
      onAdd: addBorder,
      onRemove: removeBorder,
      disabled: !canEdit,
      renderLabel: () => /* @__PURE__ */ React37.createElement(import_editor_controls12.ControlFormLabel, null, (0, import_i18n15.__)("Border", "elementor"))
    },
    /* @__PURE__ */ React37.createElement(BorderWidthField, null),
    /* @__PURE__ */ React37.createElement(BorderColorField, null),
    /* @__PURE__ */ React37.createElement(BorderStyleField, null)
  );
};

// src/components/style-sections/border-section/border-radius-field.tsx
var React39 = __toESM(require("react"));
var import_editor_controls13 = require("@elementor/editor-controls");
var import_editor_props8 = require("@elementor/editor-props");
var import_icons8 = require("@elementor/icons");
var import_ui31 = require("@elementor/ui");
var import_i18n16 = require("@wordpress/i18n");

// src/styles-inheritance/components/ui-providers.tsx
var React38 = __toESM(require("react"));
var import_ui30 = require("@elementor/ui");
var UiProviders = ({ children }) => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React38.createElement(import_ui30.DirectionProvider, { rtl: isSiteRtl }, /* @__PURE__ */ React38.createElement(import_ui30.ThemeProvider, null, children));
};

// src/components/style-sections/border-section/border-radius-field.tsx
var BORDER_RADIUS_LABEL = (0, import_i18n16.__)("Border radius", "elementor");
var StartStartIcon = (0, import_ui31.withDirection)(import_icons8.RadiusTopLeftIcon);
var StartEndIcon = (0, import_ui31.withDirection)(import_icons8.RadiusTopRightIcon);
var EndStartIcon = (0, import_ui31.withDirection)(import_icons8.RadiusBottomLeftIcon);
var EndEndIcon = (0, import_ui31.withDirection)(import_icons8.RadiusBottomRightIcon);
var getStartStartLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n16.__)("Top right", "elementor") : (0, import_i18n16.__)("Top left", "elementor");
var getStartEndLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n16.__)("Top left", "elementor") : (0, import_i18n16.__)("Top right", "elementor");
var getEndStartLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n16.__)("Bottom right", "elementor") : (0, import_i18n16.__)("Bottom left", "elementor");
var getEndEndLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n16.__)("Bottom left", "elementor") : (0, import_i18n16.__)("Bottom right", "elementor");
var getCorners = (isSiteRtl) => [
  {
    label: getStartStartLabel(isSiteRtl),
    icon: /* @__PURE__ */ React39.createElement(StartStartIcon, { fontSize: "tiny" }),
    bind: "start-start"
  },
  {
    label: getStartEndLabel(isSiteRtl),
    icon: /* @__PURE__ */ React39.createElement(StartEndIcon, { fontSize: "tiny" }),
    bind: "start-end"
  },
  {
    label: getEndStartLabel(isSiteRtl),
    icon: /* @__PURE__ */ React39.createElement(EndStartIcon, { fontSize: "tiny" }),
    bind: "end-start"
  },
  {
    label: getEndEndLabel(isSiteRtl),
    icon: /* @__PURE__ */ React39.createElement(EndEndIcon, { fontSize: "tiny" }),
    bind: "end-end"
  }
];
var BorderRadiusField = () => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React39.createElement(UiProviders, null, /* @__PURE__ */ React39.createElement(StylesField, { bind: "border-radius", propDisplayName: BORDER_RADIUS_LABEL }, /* @__PURE__ */ React39.createElement(
    import_editor_controls13.EqualUnequalSizesControl,
    {
      items: getCorners(isSiteRtl),
      label: BORDER_RADIUS_LABEL,
      icon: /* @__PURE__ */ React39.createElement(import_icons8.BorderCornersIcon, { fontSize: "tiny" }),
      tooltipLabel: (0, import_i18n16.__)("Adjust corners", "elementor"),
      multiSizePropTypeUtil: import_editor_props8.borderRadiusPropTypeUtil
    }
  )));
};

// src/components/style-sections/border-section/border-section.tsx
var BorderSection = () => /* @__PURE__ */ React40.createElement(SectionContent, null, /* @__PURE__ */ React40.createElement(BorderRadiusField, null), /* @__PURE__ */ React40.createElement(PanelDivider, null), /* @__PURE__ */ React40.createElement(BorderField, null));

// src/components/style-sections/effects-section/effects-section.tsx
var React42 = __toESM(require("react"));
var import_editor_controls15 = require("@elementor/editor-controls");
var import_editor_v1_adapters8 = require("@elementor/editor-v1-adapters");
var import_i18n18 = require("@wordpress/i18n");

// src/components/style-sections/layout-section/opacity-control-field.tsx
var React41 = __toESM(require("react"));
var import_react22 = require("react");
var import_editor_controls14 = require("@elementor/editor-controls");
var import_i18n17 = require("@wordpress/i18n");
var OPACITY_LABEL = (0, import_i18n17.__)("Opacity", "elementor");
var OpacityControlField = () => {
  const rowRef = (0, import_react22.useRef)(null);
  return /* @__PURE__ */ React41.createElement(StylesField, { bind: "opacity", propDisplayName: OPACITY_LABEL }, /* @__PURE__ */ React41.createElement(StylesFieldLayout, { ref: rowRef, label: OPACITY_LABEL }, /* @__PURE__ */ React41.createElement(import_editor_controls14.SizeControl, { units: ["%"], anchorRef: rowRef, defaultUnit: "%" })));
};

// src/components/style-sections/effects-section/effects-section.tsx
var BOX_SHADOW_LABEL = (0, import_i18n18.__)("Box shadow", "elementor");
var FILTER_LABEL = (0, import_i18n18.__)("Filter", "elementor");
var EffectsSection = () => {
  const isVersion331Active = (0, import_editor_v1_adapters8.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_31);
  return /* @__PURE__ */ React42.createElement(SectionContent, null, /* @__PURE__ */ React42.createElement(OpacityControlField, null), /* @__PURE__ */ React42.createElement(PanelDivider, null), /* @__PURE__ */ React42.createElement(StylesField, { bind: "box-shadow", propDisplayName: BOX_SHADOW_LABEL }, /* @__PURE__ */ React42.createElement(import_editor_controls15.BoxShadowRepeaterControl, null)), isVersion331Active && /* @__PURE__ */ React42.createElement(StylesField, { bind: "filter", propDisplayName: FILTER_LABEL }, /* @__PURE__ */ React42.createElement(import_editor_controls15.FilterRepeaterControl, null)));
};

// src/components/style-sections/layout-section/layout-section.tsx
var React54 = __toESM(require("react"));
var import_editor_controls26 = require("@elementor/editor-controls");
var import_editor_elements7 = require("@elementor/editor-elements");
var import_i18n29 = require("@wordpress/i18n");

// src/hooks/use-computed-style.ts
var import_editor_v1_adapters9 = require("@elementor/editor-v1-adapters");
function useComputedStyle(elementId) {
  return (0, import_editor_v1_adapters9.__privateUseListenTo)(
    [
      (0, import_editor_v1_adapters9.windowEvent)("elementor/device-mode/change"),
      (0, import_editor_v1_adapters9.commandEndEvent)("document/elements/reset-style"),
      (0, import_editor_v1_adapters9.commandEndEvent)("document/elements/settings"),
      (0, import_editor_v1_adapters9.commandEndEvent)("document/elements/paste-style")
    ],
    () => {
      if (!elementId) {
        return null;
      }
      const extendedWindow = window;
      const element = extendedWindow.elementor?.getContainer?.(elementId);
      if (!element?.view?.el) {
        return null;
      }
      const resp = window.getComputedStyle(element.view.el);
      return resp;
    }
  );
}

// src/components/style-sections/layout-section/align-content-field.tsx
var React44 = __toESM(require("react"));
var import_editor_controls16 = require("@elementor/editor-controls");
var import_icons9 = require("@elementor/icons");
var import_ui33 = require("@elementor/ui");
var import_i18n19 = require("@wordpress/i18n");

// src/components/style-sections/layout-section/utils/rotated-icon.tsx
var React43 = __toESM(require("react"));
var import_react23 = require("react");
var import_ui32 = require("@elementor/ui");
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
  const rotate = (0, import_react23.useRef)(useGetTargetAngle(isClockwise, offset, disableRotationForReversed));
  rotate.current = useGetTargetAngle(isClockwise, offset, disableRotationForReversed, rotate);
  return /* @__PURE__ */ React43.createElement(Icon, { fontSize: size, sx: { transition: ".3s", rotate: `${rotate.current}deg` } });
};
var useGetTargetAngle = (isClockwise, offset, disableRotationForReversed, existingRef) => {
  const { value: direction } = useStylesField("flex-direction");
  const isRtl = "rtl" === (0, import_ui32.useTheme)().direction;
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
var ALIGN_CONTENT_LABEL = (0, import_i18n19.__)("Align content", "elementor");
var StartIcon = (0, import_ui33.withDirection)(import_icons9.JustifyTopIcon);
var EndIcon = (0, import_ui33.withDirection)(import_icons9.JustifyBottomIcon);
var iconProps = {
  isClockwise: false,
  offset: 0,
  disableRotationForReversed: true
};
var options = [
  {
    value: "start",
    label: (0, import_i18n19.__)("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: StartIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "center",
    label: (0, import_i18n19.__)("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: import_icons9.JustifyCenterIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "end",
    label: (0, import_i18n19.__)("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: EndIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-between",
    label: (0, import_i18n19.__)("Space between", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: import_icons9.JustifySpaceBetweenVerticalIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-around",
    label: (0, import_i18n19.__)("Space around", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: import_icons9.JustifySpaceAroundVerticalIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-evenly",
    label: (0, import_i18n19.__)("Space evenly", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: import_icons9.JustifyDistributeVerticalIcon, size, ...iconProps }),
    showTooltip: true
  }
];
var AlignContentField = () => /* @__PURE__ */ React44.createElement(StylesField, { bind: "align-content", propDisplayName: ALIGN_CONTENT_LABEL }, /* @__PURE__ */ React44.createElement(UiProviders, null, /* @__PURE__ */ React44.createElement(StylesFieldLayout, { label: ALIGN_CONTENT_LABEL, direction: "column" }, /* @__PURE__ */ React44.createElement(import_editor_controls16.ToggleControl, { options, fullWidth: true }))));

// src/components/style-sections/layout-section/align-items-field.tsx
var React45 = __toESM(require("react"));
var import_editor_controls17 = require("@elementor/editor-controls");
var import_icons10 = require("@elementor/icons");
var import_ui34 = require("@elementor/ui");
var import_i18n20 = require("@wordpress/i18n");
var ALIGN_ITEMS_LABEL = (0, import_i18n20.__)("Align items", "elementor");
var StartIcon2 = (0, import_ui34.withDirection)(import_icons10.LayoutAlignLeftIcon);
var EndIcon2 = (0, import_ui34.withDirection)(import_icons10.LayoutAlignRightIcon);
var iconProps2 = {
  isClockwise: false,
  offset: 90
};
var options2 = [
  {
    value: "start",
    label: (0, import_i18n20.__)("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(RotatedIcon, { icon: StartIcon2, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "center",
    label: (0, import_i18n20.__)("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(RotatedIcon, { icon: import_icons10.LayoutAlignCenterIcon, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "end",
    label: (0, import_i18n20.__)("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(RotatedIcon, { icon: EndIcon2, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "stretch",
    label: (0, import_i18n20.__)("Stretch", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(RotatedIcon, { icon: import_icons10.LayoutDistributeVerticalIcon, size, ...iconProps2 }),
    showTooltip: true
  }
];
var AlignItemsField = () => {
  return /* @__PURE__ */ React45.createElement(UiProviders, null, /* @__PURE__ */ React45.createElement(StylesField, { bind: "align-items", propDisplayName: ALIGN_ITEMS_LABEL }, /* @__PURE__ */ React45.createElement(StylesFieldLayout, { label: ALIGN_ITEMS_LABEL }, /* @__PURE__ */ React45.createElement(import_editor_controls17.ToggleControl, { options: options2 }))));
};

// src/components/style-sections/layout-section/align-self-child-field.tsx
var React46 = __toESM(require("react"));
var import_editor_controls18 = require("@elementor/editor-controls");
var import_icons11 = require("@elementor/icons");
var import_ui35 = require("@elementor/ui");
var import_i18n21 = require("@wordpress/i18n");
var ALIGN_SELF_LABEL = (0, import_i18n21.__)("Align self", "elementor");
var ALIGN_SELF_CHILD_OFFSET_MAP = {
  row: 90,
  "row-reverse": 90,
  column: 0,
  "column-reverse": 0
};
var StartIcon3 = (0, import_ui35.withDirection)(import_icons11.LayoutAlignLeftIcon);
var EndIcon3 = (0, import_ui35.withDirection)(import_icons11.LayoutAlignRightIcon);
var iconProps3 = {
  isClockwise: false
};
var getOptions = (parentStyleDirection) => [
  {
    value: "start",
    label: (0, import_i18n21.__)("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React46.createElement(
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
    label: (0, import_i18n21.__)("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React46.createElement(
      RotatedIcon,
      {
        icon: import_icons11.LayoutAlignCenterIcon,
        size,
        offset: ALIGN_SELF_CHILD_OFFSET_MAP[parentStyleDirection],
        ...iconProps3
      }
    ),
    showTooltip: true
  },
  {
    value: "end",
    label: (0, import_i18n21.__)("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React46.createElement(
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
    label: (0, import_i18n21.__)("Stretch", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React46.createElement(
      RotatedIcon,
      {
        icon: import_icons11.LayoutDistributeVerticalIcon,
        size,
        offset: ALIGN_SELF_CHILD_OFFSET_MAP[parentStyleDirection],
        ...iconProps3
      }
    ),
    showTooltip: true
  }
];
var AlignSelfChild = ({ parentStyleDirection }) => /* @__PURE__ */ React46.createElement(StylesField, { bind: "align-self", propDisplayName: ALIGN_SELF_LABEL }, /* @__PURE__ */ React46.createElement(UiProviders, null, /* @__PURE__ */ React46.createElement(StylesFieldLayout, { label: ALIGN_SELF_LABEL }, /* @__PURE__ */ React46.createElement(import_editor_controls18.ToggleControl, { options: getOptions(parentStyleDirection) }))));

// src/components/style-sections/layout-section/display-field.tsx
var React47 = __toESM(require("react"));
var import_editor_controls19 = require("@elementor/editor-controls");
var import_editor_v1_adapters10 = require("@elementor/editor-v1-adapters");
var import_i18n22 = require("@wordpress/i18n");
var DISPLAY_LABEL = (0, import_i18n22.__)("Display", "elementor");
var displayFieldItems = [
  {
    value: "block",
    renderContent: () => (0, import_i18n22.__)("Block", "elementor"),
    label: (0, import_i18n22.__)("Block", "elementor"),
    showTooltip: true
  },
  {
    value: "flex",
    renderContent: () => (0, import_i18n22.__)("Flex", "elementor"),
    label: (0, import_i18n22.__)("Flex", "elementor"),
    showTooltip: true
  },
  {
    value: "inline-block",
    renderContent: () => (0, import_i18n22.__)("In-blk", "elementor"),
    label: (0, import_i18n22.__)("Inline-block", "elementor"),
    showTooltip: true
  }
];
var DisplayField = () => {
  const isDisplayNoneFeatureActive = (0, import_editor_v1_adapters10.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30);
  const items3 = [...displayFieldItems];
  if (isDisplayNoneFeatureActive) {
    items3.push({
      value: "none",
      renderContent: () => (0, import_i18n22.__)("None", "elementor"),
      label: (0, import_i18n22.__)("None", "elementor"),
      showTooltip: true
    });
  }
  items3.push({
    value: "inline-flex",
    renderContent: () => (0, import_i18n22.__)("In-flx", "elementor"),
    label: (0, import_i18n22.__)("Inline-flex", "elementor"),
    showTooltip: true
  });
  const placeholder = useDisplayPlaceholderValue();
  return /* @__PURE__ */ React47.createElement(StylesField, { bind: "display", propDisplayName: DISPLAY_LABEL, placeholder }, /* @__PURE__ */ React47.createElement(StylesFieldLayout, { label: DISPLAY_LABEL, direction: "column" }, /* @__PURE__ */ React47.createElement(import_editor_controls19.ToggleControl, { options: items3, maxItems: 4, fullWidth: true })));
};
var useDisplayPlaceholderValue = () => useStylesInheritanceChain(["display"])[0]?.value ?? void 0;

// src/components/style-sections/layout-section/flex-direction-field.tsx
var React48 = __toESM(require("react"));
var import_editor_controls20 = require("@elementor/editor-controls");
var import_icons12 = require("@elementor/icons");
var import_ui36 = require("@elementor/ui");
var import_i18n23 = require("@wordpress/i18n");
var FLEX_DIRECTION_LABEL = (0, import_i18n23.__)("Direction", "elementor");
var options3 = [
  {
    value: "row",
    label: (0, import_i18n23.__)("Row", "elementor"),
    renderContent: ({ size }) => {
      const StartIcon5 = (0, import_ui36.withDirection)(import_icons12.ArrowRightIcon);
      return /* @__PURE__ */ React48.createElement(StartIcon5, { fontSize: size });
    },
    showTooltip: true
  },
  {
    value: "column",
    label: (0, import_i18n23.__)("Column", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(import_icons12.ArrowDownSmallIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "row-reverse",
    label: (0, import_i18n23.__)("Reversed row", "elementor"),
    renderContent: ({ size }) => {
      const EndIcon5 = (0, import_ui36.withDirection)(import_icons12.ArrowLeftIcon);
      return /* @__PURE__ */ React48.createElement(EndIcon5, { fontSize: size });
    },
    showTooltip: true
  },
  {
    value: "column-reverse",
    label: (0, import_i18n23.__)("Reversed column", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(import_icons12.ArrowUpSmallIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FlexDirectionField = () => {
  return /* @__PURE__ */ React48.createElement(StylesField, { bind: "flex-direction", propDisplayName: FLEX_DIRECTION_LABEL }, /* @__PURE__ */ React48.createElement(UiProviders, null, /* @__PURE__ */ React48.createElement(StylesFieldLayout, { label: FLEX_DIRECTION_LABEL }, /* @__PURE__ */ React48.createElement(import_editor_controls20.ToggleControl, { options: options3 }))));
};

// src/components/style-sections/layout-section/flex-order-field.tsx
var React49 = __toESM(require("react"));
var import_react24 = require("react");
var import_editor_controls21 = require("@elementor/editor-controls");
var import_icons13 = require("@elementor/icons");
var import_ui37 = require("@elementor/ui");
var import_i18n24 = require("@wordpress/i18n");
var ORDER_LABEL = (0, import_i18n24.__)("Order", "elementor");
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
    label: (0, import_i18n24.__)("First", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React49.createElement(import_icons13.ArrowUpSmallIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: LAST,
    label: (0, import_i18n24.__)("Last", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React49.createElement(import_icons13.ArrowDownSmallIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: CUSTOM,
    label: (0, import_i18n24.__)("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React49.createElement(import_icons13.PencilIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FlexOrderField = () => {
  const { value: order, setValue: setOrder, canEdit } = useStylesField("order");
  const [groupControlValue, setGroupControlValue] = (0, import_react24.useState)(getGroupControlValue(order?.value || null));
  const handleToggleButtonChange = (group) => {
    setGroupControlValue(group);
    if (!group || group === CUSTOM) {
      setOrder(null);
      return;
    }
    setOrder({ $$type: "number", value: orderValueMap[group] });
  };
  return /* @__PURE__ */ React49.createElement(StylesField, { bind: "order", propDisplayName: ORDER_LABEL }, /* @__PURE__ */ React49.createElement(UiProviders, null, /* @__PURE__ */ React49.createElement(StylesFieldLayout, { label: ORDER_LABEL }, /* @__PURE__ */ React49.createElement(SectionContent, null, /* @__PURE__ */ React49.createElement(
    import_editor_controls21.ControlToggleButtonGroup,
    {
      items,
      value: groupControlValue,
      onChange: handleToggleButtonChange,
      exclusive: true,
      disabled: !canEdit
    }
  ), CUSTOM === groupControlValue && /* @__PURE__ */ React49.createElement(import_ui37.Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React49.createElement(import_ui37.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React49.createElement(ControlLabel, null, (0, import_i18n24.__)("Custom order", "elementor"))), /* @__PURE__ */ React49.createElement(import_ui37.Grid, { item: true, xs: 6, sx: { display: "flex", justifyContent: "end" } }, /* @__PURE__ */ React49.createElement(
    import_editor_controls21.NumberControl,
    {
      min: FIRST_DEFAULT_VALUE + 1,
      max: LAST_DEFAULT_VALUE - 1,
      shouldForceInt: true
    }
  )))))));
};
var getGroupControlValue = (order) => {
  if (LAST_DEFAULT_VALUE === order) {
    return LAST;
  }
  if (FIRST_DEFAULT_VALUE === order) {
    return FIRST;
  }
  return 0 === order || order ? CUSTOM : null;
};

// src/components/style-sections/layout-section/flex-size-field.tsx
var React50 = __toESM(require("react"));
var import_react25 = require("react");
var import_editor_controls22 = require("@elementor/editor-controls");
var import_editor_props9 = require("@elementor/editor-props");
var import_icons14 = require("@elementor/icons");
var import_i18n25 = require("@wordpress/i18n");
var FLEX_SIZE_LABEL = (0, import_i18n25.__)("Flex Size", "elementor");
var DEFAULT = 1;
var items2 = [
  {
    value: "flex-grow",
    label: (0, import_i18n25.__)("Grow", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React50.createElement(import_icons14.ExpandIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "flex-shrink",
    label: (0, import_i18n25.__)("Shrink", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React50.createElement(import_icons14.ShrinkIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "custom",
    label: (0, import_i18n25.__)("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React50.createElement(import_icons14.PencilIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FlexSizeField = () => {
  const { values, setValues, canEdit } = useStylesFields(["flex-grow", "flex-shrink", "flex-basis"]);
  const grow = values?.["flex-grow"]?.value || null;
  const shrink = values?.["flex-shrink"]?.value || null;
  const basis = values?.["flex-basis"]?.value || null;
  const currentGroup = (0, import_react25.useMemo)(() => getActiveGroup({ grow, shrink, basis }), [grow, shrink, basis]), [activeGroup, setActiveGroup] = (0, import_react25.useState)(currentGroup);
  const onChangeGroup = (group = null) => {
    setActiveGroup(group);
    if (!group || group === "custom") {
      setValues({
        "flex-basis": null,
        "flex-grow": null,
        "flex-shrink": null
      });
      return;
    }
    if (group === "flex-grow") {
      setValues({
        "flex-basis": null,
        "flex-grow": import_editor_props9.numberPropTypeUtil.create(DEFAULT),
        "flex-shrink": null
      });
      return;
    }
    setValues({
      "flex-basis": null,
      "flex-grow": null,
      "flex-shrink": import_editor_props9.numberPropTypeUtil.create(DEFAULT)
    });
  };
  return /* @__PURE__ */ React50.createElement(UiProviders, null, /* @__PURE__ */ React50.createElement(SectionContent, null, /* @__PURE__ */ React50.createElement(StylesField, { bind: activeGroup ?? "", propDisplayName: FLEX_SIZE_LABEL }, /* @__PURE__ */ React50.createElement(StylesFieldLayout, { label: FLEX_SIZE_LABEL }, /* @__PURE__ */ React50.createElement(
    import_editor_controls22.ControlToggleButtonGroup,
    {
      value: activeGroup,
      onChange: onChangeGroup,
      disabled: !canEdit,
      items: items2,
      exclusive: true
    }
  ))), "custom" === activeGroup && /* @__PURE__ */ React50.createElement(FlexCustomField, null)));
};
var FlexCustomField = () => {
  const flexBasisRowRef = (0, import_react25.useRef)(null);
  return /* @__PURE__ */ React50.createElement(React50.Fragment, null, /* @__PURE__ */ React50.createElement(StylesField, { bind: "flex-grow", propDisplayName: FLEX_SIZE_LABEL }, /* @__PURE__ */ React50.createElement(StylesFieldLayout, { label: (0, import_i18n25.__)("Grow", "elementor") }, /* @__PURE__ */ React50.createElement(import_editor_controls22.NumberControl, { min: 0, shouldForceInt: true }))), /* @__PURE__ */ React50.createElement(StylesField, { bind: "flex-shrink", propDisplayName: FLEX_SIZE_LABEL }, /* @__PURE__ */ React50.createElement(StylesFieldLayout, { label: (0, import_i18n25.__)("Shrink", "elementor") }, /* @__PURE__ */ React50.createElement(import_editor_controls22.NumberControl, { min: 0, shouldForceInt: true }))), /* @__PURE__ */ React50.createElement(StylesField, { bind: "flex-basis", propDisplayName: FLEX_SIZE_LABEL }, /* @__PURE__ */ React50.createElement(StylesFieldLayout, { label: (0, import_i18n25.__)("Basis", "elementor"), ref: flexBasisRowRef }, /* @__PURE__ */ React50.createElement(import_editor_controls22.SizeControl, { extendedOptions: ["auto"], anchorRef: flexBasisRowRef }))));
};
var getActiveGroup = ({
  grow,
  shrink,
  basis
}) => {
  if (null === grow && null === shrink && !basis) {
    return null;
  }
  if (shrink && grow || basis) {
    return "custom";
  }
  if (grow === DEFAULT) {
    return "flex-grow";
  }
  if (shrink === DEFAULT) {
    return "flex-shrink";
  }
  return "custom";
};

// src/components/style-sections/layout-section/gap-control-field.tsx
var React51 = __toESM(require("react"));
var import_editor_controls23 = require("@elementor/editor-controls");
var import_i18n26 = require("@wordpress/i18n");
var GAPS_LABEL = (0, import_i18n26.__)("Gaps", "elementor");
var GapControlField = () => {
  return /* @__PURE__ */ React51.createElement(StylesField, { bind: "gap", propDisplayName: GAPS_LABEL }, /* @__PURE__ */ React51.createElement(import_editor_controls23.GapControl, { label: GAPS_LABEL }));
};

// src/components/style-sections/layout-section/justify-content-field.tsx
var React52 = __toESM(require("react"));
var import_editor_controls24 = require("@elementor/editor-controls");
var import_icons15 = require("@elementor/icons");
var import_ui38 = require("@elementor/ui");
var import_i18n27 = require("@wordpress/i18n");
var JUSTIFY_CONTENT_LABEL = (0, import_i18n27.__)("Justify content", "elementor");
var StartIcon4 = (0, import_ui38.withDirection)(import_icons15.JustifyTopIcon);
var EndIcon4 = (0, import_ui38.withDirection)(import_icons15.JustifyBottomIcon);
var iconProps4 = {
  isClockwise: true,
  offset: -90
};
var options4 = [
  {
    value: "flex-start",
    label: (0, import_i18n27.__)("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: StartIcon4, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "center",
    label: (0, import_i18n27.__)("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: import_icons15.JustifyCenterIcon, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "flex-end",
    label: (0, import_i18n27.__)("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: EndIcon4, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-between",
    label: (0, import_i18n27.__)("Space between", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: import_icons15.JustifySpaceBetweenVerticalIcon, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-around",
    label: (0, import_i18n27.__)("Space around", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: import_icons15.JustifySpaceAroundVerticalIcon, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-evenly",
    label: (0, import_i18n27.__)("Space evenly", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: import_icons15.JustifyDistributeVerticalIcon, size, ...iconProps4 }),
    showTooltip: true
  }
];
var JustifyContentField = () => /* @__PURE__ */ React52.createElement(StylesField, { bind: "justify-content", propDisplayName: JUSTIFY_CONTENT_LABEL }, /* @__PURE__ */ React52.createElement(UiProviders, null, /* @__PURE__ */ React52.createElement(StylesFieldLayout, { label: JUSTIFY_CONTENT_LABEL, direction: "column" }, /* @__PURE__ */ React52.createElement(import_editor_controls24.ToggleControl, { options: options4, fullWidth: true }))));

// src/components/style-sections/layout-section/wrap-field.tsx
var React53 = __toESM(require("react"));
var import_editor_controls25 = require("@elementor/editor-controls");
var import_icons16 = require("@elementor/icons");
var import_i18n28 = require("@wordpress/i18n");
var FLEX_WRAP_LABEL = (0, import_i18n28.__)("Wrap", "elementor");
var options5 = [
  {
    value: "nowrap",
    label: (0, import_i18n28.__)("No wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React53.createElement(import_icons16.ArrowRightIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "wrap",
    label: (0, import_i18n28.__)("Wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React53.createElement(import_icons16.ArrowBackIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "wrap-reverse",
    label: (0, import_i18n28.__)("Reversed wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React53.createElement(import_icons16.ArrowForwardIcon, { fontSize: size }),
    showTooltip: true
  }
];
var WrapField = () => {
  return /* @__PURE__ */ React53.createElement(StylesField, { bind: "flex-wrap", propDisplayName: FLEX_WRAP_LABEL }, /* @__PURE__ */ React53.createElement(UiProviders, null, /* @__PURE__ */ React53.createElement(StylesFieldLayout, { label: FLEX_WRAP_LABEL }, /* @__PURE__ */ React53.createElement(import_editor_controls25.ToggleControl, { options: options5 }))));
};

// src/components/style-sections/layout-section/layout-section.tsx
var LayoutSection = () => {
  const { value: display } = useStylesField("display");
  const displayPlaceholder = useDisplayPlaceholderValue();
  const isDisplayFlex = shouldDisplayFlexFields(display, displayPlaceholder);
  const { element } = useElement();
  const parent = (0, import_editor_elements7.useParentElement)(element.id);
  const parentStyle = useComputedStyle(parent?.id || null);
  const parentStyleDirection = parentStyle?.flexDirection ?? "row";
  return /* @__PURE__ */ React54.createElement(SectionContent, null, /* @__PURE__ */ React54.createElement(DisplayField, null), isDisplayFlex && /* @__PURE__ */ React54.createElement(FlexFields, null), "flex" === parentStyle?.display && /* @__PURE__ */ React54.createElement(FlexChildFields, { parentStyleDirection }));
};
var FlexFields = () => {
  const { value: flexWrap } = useStylesField("flex-wrap");
  return /* @__PURE__ */ React54.createElement(React54.Fragment, null, /* @__PURE__ */ React54.createElement(FlexDirectionField, null), /* @__PURE__ */ React54.createElement(JustifyContentField, null), /* @__PURE__ */ React54.createElement(AlignItemsField, null), /* @__PURE__ */ React54.createElement(PanelDivider, null), /* @__PURE__ */ React54.createElement(GapControlField, null), /* @__PURE__ */ React54.createElement(WrapField, null), ["wrap", "wrap-reverse"].includes(flexWrap?.value) && /* @__PURE__ */ React54.createElement(AlignContentField, null));
};
var FlexChildFields = ({ parentStyleDirection }) => /* @__PURE__ */ React54.createElement(React54.Fragment, null, /* @__PURE__ */ React54.createElement(PanelDivider, null), /* @__PURE__ */ React54.createElement(import_editor_controls26.ControlFormLabel, null, (0, import_i18n29.__)("Flex child", "elementor")), /* @__PURE__ */ React54.createElement(AlignSelfChild, { parentStyleDirection }), /* @__PURE__ */ React54.createElement(FlexOrderField, null), /* @__PURE__ */ React54.createElement(FlexSizeField, null));
var shouldDisplayFlexFields = (display, local) => {
  const value = display?.value ?? local?.value;
  if (!value) {
    return false;
  }
  return "flex" === value || "inline-flex" === value;
};

// src/components/style-sections/position-section/position-section.tsx
var React59 = __toESM(require("react"));
var import_editor_v1_adapters11 = require("@elementor/editor-v1-adapters");
var import_session3 = require("@elementor/session");

// src/components/style-sections/position-section/dimensions-field.tsx
var React55 = __toESM(require("react"));
var import_react26 = require("react");
var import_editor_controls27 = require("@elementor/editor-controls");
var import_icons17 = require("@elementor/icons");
var import_ui39 = require("@elementor/ui");
var import_i18n30 = require("@wordpress/i18n");
var InlineStartIcon2 = (0, import_ui39.withDirection)(import_icons17.SideLeftIcon);
var InlineEndIcon2 = (0, import_ui39.withDirection)(import_icons17.SideRightIcon);
var sideIcons = {
  "inset-block-start": /* @__PURE__ */ React55.createElement(import_icons17.SideTopIcon, { fontSize: "tiny" }),
  "inset-block-end": /* @__PURE__ */ React55.createElement(import_icons17.SideBottomIcon, { fontSize: "tiny" }),
  "inset-inline-start": /* @__PURE__ */ React55.createElement(RotatedIcon, { icon: InlineStartIcon2, size: "tiny" }),
  "inset-inline-end": /* @__PURE__ */ React55.createElement(RotatedIcon, { icon: InlineEndIcon2, size: "tiny" })
};
var getInlineStartLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n30.__)("Right", "elementor") : (0, import_i18n30.__)("Left", "elementor");
var getInlineEndLabel = (isSiteRtl) => isSiteRtl ? (0, import_i18n30.__)("Left", "elementor") : (0, import_i18n30.__)("Right", "elementor");
var DimensionsField = () => {
  const { isSiteRtl } = useDirection();
  const rowRefs = [(0, import_react26.useRef)(null), (0, import_react26.useRef)(null)];
  return /* @__PURE__ */ React55.createElement(UiProviders, null, /* @__PURE__ */ React55.createElement(import_ui39.Stack, { direction: "row", gap: 2, flexWrap: "nowrap", ref: rowRefs[0] }, /* @__PURE__ */ React55.createElement(DimensionField, { side: "inset-block-start", label: (0, import_i18n30.__)("Top", "elementor"), rowRef: rowRefs[0] }), /* @__PURE__ */ React55.createElement(
    DimensionField,
    {
      side: "inset-inline-end",
      label: getInlineEndLabel(isSiteRtl),
      rowRef: rowRefs[0]
    }
  )), /* @__PURE__ */ React55.createElement(import_ui39.Stack, { direction: "row", gap: 2, flexWrap: "nowrap", ref: rowRefs[1] }, /* @__PURE__ */ React55.createElement(DimensionField, { side: "inset-block-end", label: (0, import_i18n30.__)("Bottom", "elementor"), rowRef: rowRefs[1] }), /* @__PURE__ */ React55.createElement(
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
}) => /* @__PURE__ */ React55.createElement(StylesField, { bind: side, propDisplayName: label }, /* @__PURE__ */ React55.createElement(import_ui39.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React55.createElement(import_ui39.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React55.createElement(ControlLabel, null, label)), /* @__PURE__ */ React55.createElement(import_ui39.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React55.createElement(import_editor_controls27.SizeControl, { startIcon: sideIcons[side], extendedOptions: ["auto"], anchorRef: rowRef }))));

// src/components/style-sections/position-section/offset-field.tsx
var React56 = __toESM(require("react"));
var import_react27 = require("react");
var import_editor_controls28 = require("@elementor/editor-controls");
var import_i18n31 = require("@wordpress/i18n");
var OFFSET_LABEL = (0, import_i18n31.__)("Anchor offset", "elementor");
var UNITS = ["px", "em", "rem", "vw", "vh"];
var OffsetField = () => {
  const rowRef = (0, import_react27.useRef)(null);
  return /* @__PURE__ */ React56.createElement(StylesField, { bind: "scroll-margin-top", propDisplayName: OFFSET_LABEL }, /* @__PURE__ */ React56.createElement(StylesFieldLayout, { label: OFFSET_LABEL, ref: rowRef }, /* @__PURE__ */ React56.createElement(import_editor_controls28.SizeControl, { units: UNITS, anchorRef: rowRef })));
};

// src/components/style-sections/position-section/position-field.tsx
var React57 = __toESM(require("react"));
var import_editor_controls29 = require("@elementor/editor-controls");
var import_i18n32 = require("@wordpress/i18n");
var POSITION_LABEL = (0, import_i18n32.__)("Position", "elementor");
var positionOptions = [
  { label: (0, import_i18n32.__)("Static", "elementor"), value: "static" },
  { label: (0, import_i18n32.__)("Relative", "elementor"), value: "relative" },
  { label: (0, import_i18n32.__)("Absolute", "elementor"), value: "absolute" },
  { label: (0, import_i18n32.__)("Fixed", "elementor"), value: "fixed" },
  { label: (0, import_i18n32.__)("Sticky", "elementor"), value: "sticky" }
];
var PositionField = ({ onChange }) => {
  return /* @__PURE__ */ React57.createElement(StylesField, { bind: "position", propDisplayName: POSITION_LABEL }, /* @__PURE__ */ React57.createElement(StylesFieldLayout, { label: POSITION_LABEL }, /* @__PURE__ */ React57.createElement(import_editor_controls29.SelectControl, { options: positionOptions, onChange })));
};

// src/components/style-sections/position-section/z-index-field.tsx
var React58 = __toESM(require("react"));
var import_editor_controls30 = require("@elementor/editor-controls");
var import_i18n33 = require("@wordpress/i18n");
var Z_INDEX_LABEL = (0, import_i18n33.__)("Z-index", "elementor");
var ZIndexField = () => {
  return /* @__PURE__ */ React58.createElement(StylesField, { bind: "z-index", propDisplayName: Z_INDEX_LABEL }, /* @__PURE__ */ React58.createElement(StylesFieldLayout, { label: Z_INDEX_LABEL }, /* @__PURE__ */ React58.createElement(import_editor_controls30.NumberControl, null)));
};

// src/components/style-sections/position-section/position-section.tsx
var PositionSection = () => {
  const { value: positionValue } = useStylesField("position");
  const { values: dimensions, setValues: setDimensions } = useStylesFields([
    "inset-block-start",
    "inset-block-end",
    "inset-inline-start",
    "inset-inline-end"
  ]);
  const [dimensionsValuesFromHistory, updateDimensionsHistory, clearDimensionsHistory] = usePersistDimensions();
  const isCssIdFeatureActive = (0, import_editor_v1_adapters11.isExperimentActive)("e_v_3_30");
  const onPositionChange = (newPosition, previousPosition) => {
    if (newPosition === "static") {
      if (dimensions) {
        updateDimensionsHistory(dimensions);
        setDimensions({
          "inset-block-start": void 0,
          "inset-block-end": void 0,
          "inset-inline-start": void 0,
          "inset-inline-end": void 0
        });
      }
    } else if (previousPosition === "static") {
      if (dimensionsValuesFromHistory) {
        setDimensions(dimensionsValuesFromHistory);
        clearDimensionsHistory();
      }
    }
  };
  const isNotStatic = positionValue && positionValue?.value !== "static";
  return /* @__PURE__ */ React59.createElement(SectionContent, null, /* @__PURE__ */ React59.createElement(PositionField, { onChange: onPositionChange }), isNotStatic ? /* @__PURE__ */ React59.createElement(React59.Fragment, null, /* @__PURE__ */ React59.createElement(DimensionsField, null), /* @__PURE__ */ React59.createElement(ZIndexField, null)) : null, isCssIdFeatureActive && /* @__PURE__ */ React59.createElement(React59.Fragment, null, /* @__PURE__ */ React59.createElement(PanelDivider, null), /* @__PURE__ */ React59.createElement(OffsetField, null)));
};
var usePersistDimensions = () => {
  const { id: styleDefID, meta } = useStyle();
  const styleVariantPath = `styles/${styleDefID}/${meta.breakpoint || "desktop"}/${meta.state || "null"}`;
  const dimensionsPath = `${styleVariantPath}/dimensions`;
  return (0, import_session3.useSessionStorage)(dimensionsPath);
};

// src/components/style-sections/size-section/size-section.tsx
var React65 = __toESM(require("react"));
var import_react28 = require("react");
var import_editor_controls34 = require("@elementor/editor-controls");
var import_editor_v1_adapters13 = require("@elementor/editor-v1-adapters");
var import_ui41 = require("@elementor/ui");
var import_i18n38 = require("@wordpress/i18n");

// src/components/style-tab-collapsible-content.tsx
var React61 = __toESM(require("react"));
var import_editor_v1_adapters12 = require("@elementor/editor-v1-adapters");

// src/styles-inheritance/components/styles-inheritance-section-indicators.tsx
var React60 = __toESM(require("react"));
var import_editor_styles_repository12 = require("@elementor/editor-styles-repository");
var import_ui40 = require("@elementor/ui");
var import_i18n34 = require("@wordpress/i18n");
var StylesInheritanceSectionIndicators = ({ fields }) => {
  const { id, meta, provider } = useStyle();
  const snapshot = useStylesInheritanceSnapshot();
  const snapshotFields = Object.fromEntries(
    Object.entries(snapshot ?? {}).filter(([key]) => fields.includes(key))
  );
  const { hasValues, hasOverrides } = getIndicators(snapshotFields, id ?? "", meta);
  if (!hasValues && !hasOverrides) {
    return null;
  }
  const hasValueLabel = (0, import_i18n34.__)("Has effective styles", "elementor");
  const hasOverridesLabel = (0, import_i18n34.__)("Has overridden styles", "elementor");
  return /* @__PURE__ */ React60.createElement(import_ui40.Tooltip, { title: (0, import_i18n34.__)("Has styles", "elementor"), placement: "top" }, /* @__PURE__ */ React60.createElement(import_ui40.Stack, { direction: "row", sx: { "& > *": { marginInlineStart: -0.25 } }, role: "list" }, hasValues && provider && /* @__PURE__ */ React60.createElement(
    StyleIndicator,
    {
      getColor: getStylesProviderThemeColor(provider.getKey()),
      "data-variant": (0, import_editor_styles_repository12.isElementsStylesProvider)(provider.getKey()) ? "local" : "global",
      role: "listitem",
      "aria-label": hasValueLabel
    }
  ), hasOverrides && /* @__PURE__ */ React60.createElement(
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
  return /* @__PURE__ */ React61.createElement(CollapsibleContent, { titleEnd: getStylesInheritanceIndicators(fields) }, children);
};
function getStylesInheritanceIndicators(fields) {
  const isUsingFieldsIndicators = (0, import_editor_v1_adapters12.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30);
  if (fields.length === 0 || !isUsingFieldsIndicators) {
    return null;
  }
  return (isOpen) => !isOpen ? /* @__PURE__ */ React61.createElement(StylesInheritanceSectionIndicators, { fields }) : null;
}

// src/components/style-sections/size-section/object-fit-field.tsx
var React62 = __toESM(require("react"));
var import_editor_controls31 = require("@elementor/editor-controls");
var import_i18n35 = require("@wordpress/i18n");
var OBJECT_FIT_LABEL = (0, import_i18n35.__)("Object fit", "elementor");
var positionOptions2 = [
  { label: (0, import_i18n35.__)("Fill", "elementor"), value: "fill" },
  { label: (0, import_i18n35.__)("Cover", "elementor"), value: "cover" },
  { label: (0, import_i18n35.__)("Contain", "elementor"), value: "contain" },
  { label: (0, import_i18n35.__)("None", "elementor"), value: "none" },
  { label: (0, import_i18n35.__)("Scale down", "elementor"), value: "scale-down" }
];
var ObjectFitField = () => {
  return /* @__PURE__ */ React62.createElement(StylesField, { bind: "object-fit", propDisplayName: OBJECT_FIT_LABEL }, /* @__PURE__ */ React62.createElement(StylesFieldLayout, { label: OBJECT_FIT_LABEL }, /* @__PURE__ */ React62.createElement(import_editor_controls31.SelectControl, { options: positionOptions2 })));
};

// src/components/style-sections/size-section/object-position-field.tsx
var React63 = __toESM(require("react"));
var import_editor_controls32 = require("@elementor/editor-controls");
var import_i18n36 = require("@wordpress/i18n");
var OBJECT_POSITION_LABEL = (0, import_i18n36.__)("Object position", "elementor");
var ObjectPositionField = () => {
  return /* @__PURE__ */ React63.createElement(StylesField, { bind: "object-position", propDisplayName: OBJECT_POSITION_LABEL }, /* @__PURE__ */ React63.createElement(import_editor_controls32.PositionControl, null));
};

// src/components/style-sections/size-section/overflow-field.tsx
var React64 = __toESM(require("react"));
var import_editor_controls33 = require("@elementor/editor-controls");
var import_icons18 = require("@elementor/icons");
var import_i18n37 = require("@wordpress/i18n");
var OVERFLOW_LABEL = (0, import_i18n37.__)("Overflow", "elementor");
var options6 = [
  {
    value: "visible",
    label: (0, import_i18n37.__)("Visible", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React64.createElement(import_icons18.EyeIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "hidden",
    label: (0, import_i18n37.__)("Hidden", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React64.createElement(import_icons18.EyeOffIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "auto",
    label: (0, import_i18n37.__)("Auto", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React64.createElement(import_icons18.LetterAIcon, { fontSize: size }),
    showTooltip: true
  }
];
var OverflowField = () => {
  return /* @__PURE__ */ React64.createElement(StylesField, { bind: "overflow", propDisplayName: OVERFLOW_LABEL }, /* @__PURE__ */ React64.createElement(StylesFieldLayout, { label: OVERFLOW_LABEL }, /* @__PURE__ */ React64.createElement(import_editor_controls33.ToggleControl, { options: options6 })));
};

// src/components/style-sections/size-section/size-section.tsx
var EXPERIMENT_ID = "e_v_3_30";
var CssSizeProps = [
  [
    {
      bind: "width",
      label: (0, import_i18n38.__)("Width", "elementor")
    },
    {
      bind: "height",
      label: (0, import_i18n38.__)("Height", "elementor")
    }
  ],
  [
    {
      bind: "min-width",
      label: (0, import_i18n38.__)("Min width", "elementor")
    },
    {
      bind: "min-height",
      label: (0, import_i18n38.__)("Min height", "elementor")
    }
  ],
  [
    {
      bind: "max-width",
      label: (0, import_i18n38.__)("Max width", "elementor")
    },
    {
      bind: "max-height",
      label: (0, import_i18n38.__)("Max height", "elementor")
    }
  ]
];
var ASPECT_RATIO_LABEL = (0, import_i18n38.__)("Aspect Ratio", "elementor");
var SizeSection = () => {
  const { value: fitValue } = useStylesField("object-fit");
  const isNotFill = fitValue && fitValue?.value !== "fill";
  const gridRowRefs = [(0, import_react28.useRef)(null), (0, import_react28.useRef)(null), (0, import_react28.useRef)(null)];
  const isVersion330Active = (0, import_editor_v1_adapters13.isExperimentActive)(EXPERIMENT_ID);
  return /* @__PURE__ */ React65.createElement(SectionContent, null, CssSizeProps.map((row, rowIndex) => /* @__PURE__ */ React65.createElement(import_ui41.Grid, { key: rowIndex, container: true, gap: 2, flexWrap: "nowrap", ref: gridRowRefs[rowIndex] }, row.map((props) => /* @__PURE__ */ React65.createElement(import_ui41.Grid, { item: true, xs: 6, key: props.bind }, /* @__PURE__ */ React65.createElement(SizeField, { ...props, rowRef: gridRowRefs[rowIndex], extendedOptions: ["auto"] }))))), /* @__PURE__ */ React65.createElement(PanelDivider, null), /* @__PURE__ */ React65.createElement(import_ui41.Stack, null, /* @__PURE__ */ React65.createElement(OverflowField, null)), isVersion330Active && /* @__PURE__ */ React65.createElement(StyleTabCollapsibleContent, { fields: ["aspect-ratio", "object-fit"] }, /* @__PURE__ */ React65.createElement(import_ui41.Stack, { gap: 2, pt: 2 }, /* @__PURE__ */ React65.createElement(StylesField, { bind: "aspect-ratio", propDisplayName: ASPECT_RATIO_LABEL }, /* @__PURE__ */ React65.createElement(import_editor_controls34.AspectRatioControl, { label: ASPECT_RATIO_LABEL })), /* @__PURE__ */ React65.createElement(PanelDivider, null), /* @__PURE__ */ React65.createElement(ObjectFitField, null), isNotFill && /* @__PURE__ */ React65.createElement(import_ui41.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React65.createElement(ObjectPositionField, null)))));
};
var SizeField = ({ label, bind, rowRef, extendedOptions }) => {
  return /* @__PURE__ */ React65.createElement(StylesField, { bind, propDisplayName: label }, /* @__PURE__ */ React65.createElement(import_ui41.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React65.createElement(import_ui41.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React65.createElement(ControlLabel, null, label)), /* @__PURE__ */ React65.createElement(import_ui41.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React65.createElement(import_editor_controls34.SizeControl, { extendedOptions, anchorRef: rowRef }))));
};

// src/components/style-sections/spacing-section/spacing-section.tsx
var React66 = __toESM(require("react"));
var import_editor_controls35 = require("@elementor/editor-controls");
var import_i18n39 = require("@wordpress/i18n");
var MARGIN_LABEL = (0, import_i18n39.__)("Margin", "elementor");
var PADDING_LABEL = (0, import_i18n39.__)("Padding", "elementor");
var SpacingSection = () => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React66.createElement(SectionContent, null, /* @__PURE__ */ React66.createElement(StylesField, { bind: "margin", propDisplayName: MARGIN_LABEL }, /* @__PURE__ */ React66.createElement(
    import_editor_controls35.LinkedDimensionsControl,
    {
      label: MARGIN_LABEL,
      isSiteRtl,
      extendedOptions: ["auto"]
    }
  )), /* @__PURE__ */ React66.createElement(PanelDivider, null), /* @__PURE__ */ React66.createElement(StylesField, { bind: "padding", propDisplayName: PADDING_LABEL }, /* @__PURE__ */ React66.createElement(import_editor_controls35.LinkedDimensionsControl, { label: PADDING_LABEL, isSiteRtl })));
};

// src/components/style-sections/typography-section/typography-section.tsx
var React82 = __toESM(require("react"));
var import_editor_v1_adapters14 = require("@elementor/editor-v1-adapters");

// src/components/style-sections/typography-section/column-count-field.tsx
var React67 = __toESM(require("react"));
var import_editor_controls36 = require("@elementor/editor-controls");
var import_i18n40 = require("@wordpress/i18n");
var COLUMN_COUNT_LABEL = (0, import_i18n40.__)("Columns", "elementor");
var ColumnCountField = () => {
  return /* @__PURE__ */ React67.createElement(StylesField, { bind: "column-count", propDisplayName: COLUMN_COUNT_LABEL }, /* @__PURE__ */ React67.createElement(StylesFieldLayout, { label: COLUMN_COUNT_LABEL }, /* @__PURE__ */ React67.createElement(import_editor_controls36.NumberControl, { shouldForceInt: true, min: 0, step: 1 })));
};

// src/components/style-sections/typography-section/column-gap-field.tsx
var React68 = __toESM(require("react"));
var import_react29 = require("react");
var import_editor_controls37 = require("@elementor/editor-controls");
var import_i18n41 = require("@wordpress/i18n");
var COLUMN_GAP_LABEL = (0, import_i18n41.__)("Column gap", "elementor");
var ColumnGapField = () => {
  const rowRef = (0, import_react29.useRef)(null);
  return /* @__PURE__ */ React68.createElement(StylesField, { bind: "column-gap", propDisplayName: COLUMN_GAP_LABEL }, /* @__PURE__ */ React68.createElement(StylesFieldLayout, { label: COLUMN_GAP_LABEL, ref: rowRef }, /* @__PURE__ */ React68.createElement(import_editor_controls37.SizeControl, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/font-family-field.tsx
var React69 = __toESM(require("react"));
var import_editor_controls38 = require("@elementor/editor-controls");
var import_i18n43 = require("@wordpress/i18n");

// src/components/style-sections/typography-section/hooks/use-font-families.ts
var import_react30 = require("react");
var import_i18n42 = require("@wordpress/i18n");
var supportedCategories = {
  system: (0, import_i18n42.__)("System", "elementor"),
  custom: (0, import_i18n42.__)("Custom Fonts", "elementor"),
  googlefonts: (0, import_i18n42.__)("Google Fonts", "elementor")
};
var getFontFamilies = () => {
  const { controls } = getElementorConfig();
  const options12 = controls?.font?.options;
  if (!options12) {
    return null;
  }
  return options12;
};
var useFontFamilies = () => {
  const fontFamilies = getFontFamilies();
  return (0, import_react30.useMemo)(() => {
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

// src/components/style-sections/typography-section/font-family-field.tsx
var FONT_FAMILY_LABEL = (0, import_i18n43.__)("Font family", "elementor");
var FontFamilyField = () => {
  const fontFamilies = useFontFamilies();
  const sectionRef = useSectionRef();
  if (fontFamilies.length === 0) {
    return null;
  }
  const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;
  return /* @__PURE__ */ React69.createElement(StylesField, { bind: "font-family", propDisplayName: FONT_FAMILY_LABEL }, /* @__PURE__ */ React69.createElement(StylesFieldLayout, { label: FONT_FAMILY_LABEL }, /* @__PURE__ */ React69.createElement(import_editor_controls38.FontFamilyControl, { fontFamilies, sectionWidth })));
};

// src/components/style-sections/typography-section/font-size-field.tsx
var React70 = __toESM(require("react"));
var import_react31 = require("react");
var import_editor_controls39 = require("@elementor/editor-controls");
var import_i18n44 = require("@wordpress/i18n");
var FONT_SIZE_LABEL = (0, import_i18n44.__)("Font size", "elementor");
var FontSizeField = () => {
  const rowRef = (0, import_react31.useRef)(null);
  return /* @__PURE__ */ React70.createElement(StylesField, { bind: "font-size", propDisplayName: FONT_SIZE_LABEL }, /* @__PURE__ */ React70.createElement(StylesFieldLayout, { label: FONT_SIZE_LABEL, ref: rowRef }, /* @__PURE__ */ React70.createElement(import_editor_controls39.SizeControl, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/font-style-field.tsx
var React71 = __toESM(require("react"));
var import_editor_controls40 = require("@elementor/editor-controls");
var import_icons19 = require("@elementor/icons");
var import_i18n45 = require("@wordpress/i18n");
var FONT_STYLE_LABEL = (0, import_i18n45.__)("Font style", "elementor");
var options7 = [
  {
    value: "normal",
    label: (0, import_i18n45.__)("Normal", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(import_icons19.MinusIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "italic",
    label: (0, import_i18n45.__)("Italic", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(import_icons19.ItalicIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FontStyleField = () => {
  return /* @__PURE__ */ React71.createElement(StylesField, { bind: "font-style", propDisplayName: FONT_STYLE_LABEL }, /* @__PURE__ */ React71.createElement(StylesFieldLayout, { label: FONT_STYLE_LABEL }, /* @__PURE__ */ React71.createElement(import_editor_controls40.ToggleControl, { options: options7 })));
};

// src/components/style-sections/typography-section/font-weight-field.tsx
var React72 = __toESM(require("react"));
var import_editor_controls41 = require("@elementor/editor-controls");
var import_i18n46 = require("@wordpress/i18n");
var FONT_WEIGHT_LABEL = (0, import_i18n46.__)("Font weight", "elementor");
var fontWeightOptions = [
  { value: "100", label: (0, import_i18n46.__)("100 - Thin", "elementor") },
  { value: "200", label: (0, import_i18n46.__)("200 - Extra light", "elementor") },
  { value: "300", label: (0, import_i18n46.__)("300 - Light", "elementor") },
  { value: "400", label: (0, import_i18n46.__)("400 - Normal", "elementor") },
  { value: "500", label: (0, import_i18n46.__)("500 - Medium", "elementor") },
  { value: "600", label: (0, import_i18n46.__)("600 - Semi bold", "elementor") },
  { value: "700", label: (0, import_i18n46.__)("700 - Bold", "elementor") },
  { value: "800", label: (0, import_i18n46.__)("800 - Extra bold", "elementor") },
  { value: "900", label: (0, import_i18n46.__)("900 - Black", "elementor") }
];
var FontWeightField = () => {
  return /* @__PURE__ */ React72.createElement(StylesField, { bind: "font-weight", propDisplayName: FONT_WEIGHT_LABEL }, /* @__PURE__ */ React72.createElement(StylesFieldLayout, { label: FONT_WEIGHT_LABEL }, /* @__PURE__ */ React72.createElement(import_editor_controls41.SelectControl, { options: fontWeightOptions })));
};

// src/components/style-sections/typography-section/letter-spacing-field.tsx
var React73 = __toESM(require("react"));
var import_react32 = require("react");
var import_editor_controls42 = require("@elementor/editor-controls");
var import_i18n47 = require("@wordpress/i18n");
var LETTER_SPACING_LABEL = (0, import_i18n47.__)("Letter spacing", "elementor");
var LetterSpacingField = () => {
  const rowRef = (0, import_react32.useRef)(null);
  return /* @__PURE__ */ React73.createElement(StylesField, { bind: "letter-spacing", propDisplayName: LETTER_SPACING_LABEL }, /* @__PURE__ */ React73.createElement(StylesFieldLayout, { label: LETTER_SPACING_LABEL, ref: rowRef }, /* @__PURE__ */ React73.createElement(import_editor_controls42.SizeControl, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/line-height-field.tsx
var React74 = __toESM(require("react"));
var import_react33 = require("react");
var import_editor_controls43 = require("@elementor/editor-controls");
var import_i18n48 = require("@wordpress/i18n");
var LINE_HEIGHT_LABEL = (0, import_i18n48.__)("Line height", "elementor");
var LineHeightField = () => {
  const rowRef = (0, import_react33.useRef)(null);
  return /* @__PURE__ */ React74.createElement(StylesField, { bind: "line-height", propDisplayName: LINE_HEIGHT_LABEL }, /* @__PURE__ */ React74.createElement(StylesFieldLayout, { label: LINE_HEIGHT_LABEL, ref: rowRef }, /* @__PURE__ */ React74.createElement(import_editor_controls43.SizeControl, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/text-alignment-field.tsx
var React75 = __toESM(require("react"));
var import_editor_controls44 = require("@elementor/editor-controls");
var import_icons20 = require("@elementor/icons");
var import_ui42 = require("@elementor/ui");
var import_i18n49 = require("@wordpress/i18n");
var TEXT_ALIGNMENT_LABEL = (0, import_i18n49.__)("Text align", "elementor");
var AlignStartIcon = (0, import_ui42.withDirection)(import_icons20.AlignLeftIcon);
var AlignEndIcon = (0, import_ui42.withDirection)(import_icons20.AlignRightIcon);
var options8 = [
  {
    value: "start",
    label: (0, import_i18n49.__)("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(AlignStartIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "center",
    label: (0, import_i18n49.__)("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(import_icons20.AlignCenterIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "end",
    label: (0, import_i18n49.__)("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(AlignEndIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "justify",
    label: (0, import_i18n49.__)("Justify", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(import_icons20.AlignJustifiedIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextAlignmentField = () => {
  return /* @__PURE__ */ React75.createElement(StylesField, { bind: "text-align", propDisplayName: TEXT_ALIGNMENT_LABEL }, /* @__PURE__ */ React75.createElement(UiProviders, null, /* @__PURE__ */ React75.createElement(StylesFieldLayout, { label: TEXT_ALIGNMENT_LABEL }, /* @__PURE__ */ React75.createElement(import_editor_controls44.ToggleControl, { options: options8 }))));
};

// src/components/style-sections/typography-section/text-color-field.tsx
var React76 = __toESM(require("react"));
var import_editor_controls45 = require("@elementor/editor-controls");
var import_i18n50 = require("@wordpress/i18n");
var TEXT_COLOR_LABEL = (0, import_i18n50.__)("Text color", "elementor");
var TextColorField = () => {
  return /* @__PURE__ */ React76.createElement(StylesField, { bind: "color", propDisplayName: TEXT_COLOR_LABEL }, /* @__PURE__ */ React76.createElement(StylesFieldLayout, { label: TEXT_COLOR_LABEL }, /* @__PURE__ */ React76.createElement(import_editor_controls45.ColorControl, null)));
};

// src/components/style-sections/typography-section/text-decoration-field.tsx
var React77 = __toESM(require("react"));
var import_editor_controls46 = require("@elementor/editor-controls");
var import_icons21 = require("@elementor/icons");
var import_i18n51 = require("@wordpress/i18n");
var TEXT_DECORATION_LABEL = (0, import_i18n51.__)("Line decoration", "elementor");
var options9 = [
  {
    value: "none",
    label: (0, import_i18n51.__)("None", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(import_icons21.MinusIcon, { fontSize: size }),
    showTooltip: true,
    exclusive: true
  },
  {
    value: "underline",
    label: (0, import_i18n51.__)("Underline", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(import_icons21.UnderlineIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "line-through",
    label: (0, import_i18n51.__)("Line-through", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(import_icons21.StrikethroughIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "overline",
    label: (0, import_i18n51.__)("Overline", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(import_icons21.OverlineIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextDecorationField = () => /* @__PURE__ */ React77.createElement(StylesField, { bind: "text-decoration", propDisplayName: TEXT_DECORATION_LABEL }, /* @__PURE__ */ React77.createElement(StylesFieldLayout, { label: TEXT_DECORATION_LABEL }, /* @__PURE__ */ React77.createElement(import_editor_controls46.ToggleControl, { options: options9, exclusive: false })));

// src/components/style-sections/typography-section/text-direction-field.tsx
var React78 = __toESM(require("react"));
var import_editor_controls47 = require("@elementor/editor-controls");
var import_icons22 = require("@elementor/icons");
var import_i18n52 = require("@wordpress/i18n");
var TEXT_DIRECTION_LABEL = (0, import_i18n52.__)("Direction", "elementor");
var options10 = [
  {
    value: "ltr",
    label: (0, import_i18n52.__)("Left to right", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React78.createElement(import_icons22.TextDirectionLtrIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "rtl",
    label: (0, import_i18n52.__)("Right to left", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React78.createElement(import_icons22.TextDirectionRtlIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextDirectionField = () => {
  return /* @__PURE__ */ React78.createElement(StylesField, { bind: "direction", propDisplayName: TEXT_DIRECTION_LABEL }, /* @__PURE__ */ React78.createElement(StylesFieldLayout, { label: TEXT_DIRECTION_LABEL }, /* @__PURE__ */ React78.createElement(import_editor_controls47.ToggleControl, { options: options10 })));
};

// src/components/style-sections/typography-section/text-stroke-field.tsx
var React79 = __toESM(require("react"));
var import_editor_controls48 = require("@elementor/editor-controls");
var import_i18n53 = require("@wordpress/i18n");
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
var TEXT_STROKE_LABEL = (0, import_i18n53.__)("Text stroke", "elementor");
var TextStrokeField = () => {
  const { value, setValue, canEdit } = useStylesField("stroke");
  const addTextStroke = () => {
    setValue(initTextStroke);
  };
  const removeTextStroke = () => {
    setValue(null);
  };
  const hasTextStroke = Boolean(value);
  return /* @__PURE__ */ React79.createElement(StylesField, { bind: "stroke", propDisplayName: TEXT_STROKE_LABEL }, /* @__PURE__ */ React79.createElement(
    AddOrRemoveContent,
    {
      isAdded: hasTextStroke,
      onAdd: addTextStroke,
      onRemove: removeTextStroke,
      disabled: !canEdit,
      renderLabel: () => /* @__PURE__ */ React79.createElement(ControlLabel, null, TEXT_STROKE_LABEL)
    },
    /* @__PURE__ */ React79.createElement(import_editor_controls48.StrokeControl, null)
  ));
};

// src/components/style-sections/typography-section/transform-field.tsx
var React80 = __toESM(require("react"));
var import_editor_controls49 = require("@elementor/editor-controls");
var import_icons23 = require("@elementor/icons");
var import_i18n54 = require("@wordpress/i18n");
var TEXT_TRANSFORM_LABEL = (0, import_i18n54.__)("Text transform", "elementor");
var options11 = [
  {
    value: "none",
    label: (0, import_i18n54.__)("None", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React80.createElement(import_icons23.MinusIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "capitalize",
    label: (0, import_i18n54.__)("Capitalize", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React80.createElement(import_icons23.LetterCaseIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "uppercase",
    label: (0, import_i18n54.__)("Uppercase", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React80.createElement(import_icons23.LetterCaseUpperIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "lowercase",
    label: (0, import_i18n54.__)("Lowercase", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React80.createElement(import_icons23.LetterCaseLowerIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TransformField = () => /* @__PURE__ */ React80.createElement(StylesField, { bind: "text-transform", propDisplayName: TEXT_TRANSFORM_LABEL }, /* @__PURE__ */ React80.createElement(StylesFieldLayout, { label: TEXT_TRANSFORM_LABEL }, /* @__PURE__ */ React80.createElement(import_editor_controls49.ToggleControl, { options: options11 })));

// src/components/style-sections/typography-section/word-spacing-field.tsx
var React81 = __toESM(require("react"));
var import_react34 = require("react");
var import_editor_controls50 = require("@elementor/editor-controls");
var import_i18n55 = require("@wordpress/i18n");
var WORD_SPACING_LABEL = (0, import_i18n55.__)("Word spacing", "elementor");
var WordSpacingField = () => {
  const rowRef = (0, import_react34.useRef)(null);
  return /* @__PURE__ */ React81.createElement(StylesField, { bind: "word-spacing", propDisplayName: WORD_SPACING_LABEL }, /* @__PURE__ */ React81.createElement(StylesFieldLayout, { label: WORD_SPACING_LABEL, ref: rowRef }, /* @__PURE__ */ React81.createElement(import_editor_controls50.SizeControl, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/typography-section.tsx
var TypographySection = () => {
  const { value: columnCount } = useStylesField("column-count");
  const hasMultiColumns = !!(columnCount?.value && columnCount?.value > 1);
  const isVersion330Active = (0, import_editor_v1_adapters14.isExperimentActive)("e_v_3_30");
  return /* @__PURE__ */ React82.createElement(SectionContent, null, /* @__PURE__ */ React82.createElement(FontFamilyField, null), /* @__PURE__ */ React82.createElement(FontWeightField, null), /* @__PURE__ */ React82.createElement(FontSizeField, null), /* @__PURE__ */ React82.createElement(PanelDivider, null), /* @__PURE__ */ React82.createElement(TextAlignmentField, null), /* @__PURE__ */ React82.createElement(TextColorField, null), /* @__PURE__ */ React82.createElement(
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
    /* @__PURE__ */ React82.createElement(SectionContent, { sx: { pt: 2 } }, /* @__PURE__ */ React82.createElement(LineHeightField, null), /* @__PURE__ */ React82.createElement(LetterSpacingField, null), /* @__PURE__ */ React82.createElement(WordSpacingField, null), isVersion330Active && /* @__PURE__ */ React82.createElement(React82.Fragment, null, /* @__PURE__ */ React82.createElement(ColumnCountField, null), hasMultiColumns && /* @__PURE__ */ React82.createElement(ColumnGapField, null)), /* @__PURE__ */ React82.createElement(PanelDivider, null), /* @__PURE__ */ React82.createElement(TextDecorationField, null), /* @__PURE__ */ React82.createElement(TransformField, null), /* @__PURE__ */ React82.createElement(TextDirectionField, null), /* @__PURE__ */ React82.createElement(FontStyleField, null), /* @__PURE__ */ React82.createElement(TextStrokeField, null))
  ));
};

// src/components/style-tab-section.tsx
var React83 = __toESM(require("react"));
var import_editor_v1_adapters15 = require("@elementor/editor-v1-adapters");
var StyleTabSection = ({ section, fields = [] }) => {
  const { component, name, title } = section;
  const tabDefaults = useDefaultPanelSettings();
  const SectionComponent = component;
  const isExpanded = (0, import_editor_v1_adapters15.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30) ? tabDefaults.defaultSectionsExpanded.style?.includes(name) : false;
  return /* @__PURE__ */ React83.createElement(Section, { title, defaultExpanded: isExpanded, titleEnd: getStylesInheritanceIndicators(fields) }, /* @__PURE__ */ React83.createElement(SectionComponent, null));
};

// src/components/style-tab.tsx
var TABS_HEADER_HEIGHT = "37px";
var stickyHeaderStyles = {
  position: "sticky",
  zIndex: 1,
  opacity: 1,
  backgroundColor: "background.default",
  transition: "top 300ms ease"
};
var StyleTab = () => {
  const currentClassesProp = useCurrentClassesProp();
  const [activeStyleDefId, setActiveStyleDefId] = useActiveStyleDefId(currentClassesProp);
  const [activeStyleState, setActiveStyleState] = (0, import_react35.useState)(null);
  const breakpoint = (0, import_editor_responsive3.useActiveBreakpoint)();
  return /* @__PURE__ */ React84.createElement(ClassesPropProvider, { prop: currentClassesProp }, /* @__PURE__ */ React84.createElement(
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
    /* @__PURE__ */ React84.createElement(import_session4.SessionStorageProvider, { prefix: activeStyleDefId ?? "" }, /* @__PURE__ */ React84.createElement(StyleInheritanceProvider, null, /* @__PURE__ */ React84.createElement(ClassesHeader, null, /* @__PURE__ */ React84.createElement(CssClassSelector, null), /* @__PURE__ */ React84.createElement(import_ui43.Divider, null)), /* @__PURE__ */ React84.createElement(SectionsList, null, /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: LayoutSection,
          name: "Layout",
          title: (0, import_i18n56.__)("Layout", "elementor")
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
    ), /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: SpacingSection,
          name: "Spacing",
          title: (0, import_i18n56.__)("Spacing", "elementor")
        },
        fields: ["margin", "padding"]
      }
    ), /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: SizeSection,
          name: "Size",
          title: (0, import_i18n56.__)("Size", "elementor")
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
    ), /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: PositionSection,
          name: "Position",
          title: (0, import_i18n56.__)("Position", "elementor")
        },
        fields: ["position", "z-index", "scroll-margin-top"]
      }
    ), /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: TypographySection,
          name: "Typography",
          title: (0, import_i18n56.__)("Typography", "elementor")
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
    ), /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: BackgroundSection,
          name: "Background",
          title: (0, import_i18n56.__)("Background", "elementor")
        },
        fields: ["background"]
      }
    ), /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: BorderSection,
          name: "Border",
          title: (0, import_i18n56.__)("Border", "elementor")
        },
        fields: ["border-radius", "border-width", "border-color", "border-style"]
      }
    ), /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: EffectsSection,
          name: "Effects",
          title: (0, import_i18n56.__)("Effects", "elementor")
        },
        fields: ["box-shadow"]
      }
    ))))
  ));
};
function ClassesHeader({ children }) {
  const scrollDirection = useScrollDirection();
  return /* @__PURE__ */ React84.createElement(import_ui43.Stack, { sx: { ...stickyHeaderStyles, top: scrollDirection === "up" ? TABS_HEADER_HEIGHT : 0 } }, children);
}
function useCurrentClassesProp() {
  const { elementType } = useElement();
  const prop = Object.entries(elementType.propsSchema).find(
    ([, propType]) => propType.kind === "plain" && propType.key === import_editor_props10.CLASSES_PROP_KEY
  );
  if (!prop) {
    throw new Error("Element does not have a classes prop");
  }
  return prop[0];
}

// src/components/editing-panel-tabs.tsx
var EditingPanelTabs = () => {
  const { element } = useElement();
  return (
    // When switching between elements, the local states should be reset. We are using key to rerender the tabs.
    // Reference: https://react.dev/learn/preserving-and-resetting-state#resetting-a-form-with-a-key
    /* @__PURE__ */ React85.createElement(import_react36.Fragment, { key: element.id }, /* @__PURE__ */ React85.createElement(PanelTabContent, null))
  );
};
var PanelTabContent = () => {
  const editorDefaults = useDefaultPanelSettings();
  const defaultComponentTab = (0, import_editor_v1_adapters16.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30) ? editorDefaults.defaultTab : "settings";
  const [currentTab, setCurrentTab] = useStateByElement("tab", defaultComponentTab);
  const { getTabProps, getTabPanelProps, getTabsProps } = (0, import_ui44.useTabs)(currentTab);
  return /* @__PURE__ */ React85.createElement(ScrollProvider, null, /* @__PURE__ */ React85.createElement(import_ui44.Stack, { direction: "column", sx: { width: "100%" } }, /* @__PURE__ */ React85.createElement(import_ui44.Stack, { sx: { ...stickyHeaderStyles, top: 0 } }, /* @__PURE__ */ React85.createElement(
    import_ui44.Tabs,
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
    /* @__PURE__ */ React85.createElement(import_ui44.Tab, { label: (0, import_i18n57.__)("General", "elementor"), ...getTabProps("settings") }),
    /* @__PURE__ */ React85.createElement(import_ui44.Tab, { label: (0, import_i18n57.__)("Style", "elementor"), ...getTabProps("style") })
  ), /* @__PURE__ */ React85.createElement(import_ui44.Divider, null)), /* @__PURE__ */ React85.createElement(import_ui44.TabPanel, { ...getTabPanelProps("settings"), disablePadding: true }, /* @__PURE__ */ React85.createElement(SettingsTab, null)), /* @__PURE__ */ React85.createElement(import_ui44.TabPanel, { ...getTabPanelProps("style"), disablePadding: true }, /* @__PURE__ */ React85.createElement(StyleTab, null))));
};

// src/components/editing-panel.tsx
var { useMenuItems } = controlActionsMenu;
var EditingPanel = () => {
  const { element, elementType } = (0, import_editor_elements8.useSelectedElement)();
  const controlReplacements = getControlReplacements();
  const menuItems = useMenuItems().default;
  if (!element || !elementType) {
    return null;
  }
  const panelTitle = (0, import_i18n58.__)("Edit %s", "elementor").replace("%s", elementType.title);
  return /* @__PURE__ */ React86.createElement(import_ui45.ErrorBoundary, { fallback: /* @__PURE__ */ React86.createElement(EditorPanelErrorFallback, null) }, /* @__PURE__ */ React86.createElement(import_session5.SessionStorageProvider, { prefix: "elementor" }, /* @__PURE__ */ React86.createElement(import_editor_ui5.ThemeProvider, null, /* @__PURE__ */ React86.createElement(import_editor_panels.Panel, null, /* @__PURE__ */ React86.createElement(import_editor_panels.PanelHeader, null, /* @__PURE__ */ React86.createElement(import_editor_panels.PanelHeaderTitle, null, panelTitle), /* @__PURE__ */ React86.createElement(import_icons24.AtomIcon, { fontSize: "small", sx: { color: "text.tertiary" } })), /* @__PURE__ */ React86.createElement(import_editor_panels.PanelBody, null, /* @__PURE__ */ React86.createElement(import_editor_controls51.ControlActionsProvider, { items: menuItems }, /* @__PURE__ */ React86.createElement(import_editor_controls51.ControlReplacementsProvider, { replacements: controlReplacements }, /* @__PURE__ */ React86.createElement(ElementProvider, { element, elementType }, /* @__PURE__ */ React86.createElement(EditingPanelTabs, null)))))))));
};

// src/panel.ts
var { panel, usePanelActions, usePanelStatus } = (0, import_editor_panels2.__createPanel)({
  id: "editing-panel",
  component: EditingPanel
});

// src/init.ts
var import_editor = require("@elementor/editor");
var import_editor_current_user = require("@elementor/editor-current-user");
var import_editor_panels3 = require("@elementor/editor-panels");
var import_editor_v1_adapters18 = require("@elementor/editor-v1-adapters");

// src/hooks/use-open-editor-panel.ts
var import_react37 = require("react");
var import_editor_v1_adapters17 = require("@elementor/editor-v1-adapters");

// src/sync/is-atomic-widget-selected.ts
var import_editor_elements9 = require("@elementor/editor-elements");
var isAtomicWidgetSelected = () => {
  const selectedElements = (0, import_editor_elements9.getSelectedElements)();
  const widgetCache = (0, import_editor_elements9.getWidgetsCache)();
  if (selectedElements.length !== 1) {
    return false;
  }
  return !!widgetCache?.[selectedElements[0].type]?.atomic_controls;
};

// src/hooks/use-open-editor-panel.ts
var useOpenEditorPanel = () => {
  const { open } = usePanelActions();
  (0, import_react37.useEffect)(() => {
    return (0, import_editor_v1_adapters17.__privateListenTo)((0, import_editor_v1_adapters17.commandStartEvent)("panel/editor/open"), () => {
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

// src/dynamics/init.ts
var import_editor_canvas4 = require("@elementor/editor-canvas");
var import_editor_controls58 = require("@elementor/editor-controls");

// src/dynamics/components/background-control-dynamic-tag.tsx
var React87 = __toESM(require("react"));
var import_editor_controls53 = require("@elementor/editor-controls");
var import_editor_props12 = require("@elementor/editor-props");
var import_icons25 = require("@elementor/icons");

// src/dynamics/hooks/use-dynamic-tag.ts
var import_react39 = require("react");

// src/dynamics/hooks/use-prop-dynamic-tags.ts
var import_react38 = require("react");
var import_editor_controls52 = require("@elementor/editor-controls");

// src/dynamics/sync/get-elementor-config.ts
var getElementorConfig2 = () => {
  const extendedWindow = window;
  return extendedWindow.elementor?.config ?? {};
};

// src/dynamics/sync/get-atomic-dynamic-tags.ts
var getAtomicDynamicTags = () => {
  const { atomicDynamicTags } = getElementorConfig2();
  if (!atomicDynamicTags) {
    return null;
  }
  return {
    tags: atomicDynamicTags.tags,
    groups: atomicDynamicTags.groups
  };
};

// src/dynamics/utils.ts
var import_editor_props11 = require("@elementor/editor-props");
var import_schema = require("@elementor/schema");
var DYNAMIC_PROP_TYPE_KEY = "dynamic";
var isDynamicPropType = (prop) => prop.key === DYNAMIC_PROP_TYPE_KEY;
var getDynamicPropType = (propType) => {
  const dynamicPropType = propType.kind === "union" && propType.prop_types[DYNAMIC_PROP_TYPE_KEY];
  return dynamicPropType && isDynamicPropType(dynamicPropType) ? dynamicPropType : null;
};
var isDynamicPropValue = (prop) => {
  return (0, import_editor_props11.isTransformable)(prop) && prop.$$type === DYNAMIC_PROP_TYPE_KEY;
};
var supportsDynamic = (propType) => {
  return !!getDynamicPropType(propType);
};
var dynamicPropTypeUtil = (0, import_editor_props11.createPropUtils)(
  DYNAMIC_PROP_TYPE_KEY,
  import_schema.z.strictObject({
    name: import_schema.z.string(),
    settings: import_schema.z.any().optional()
  })
);

// src/dynamics/hooks/use-prop-dynamic-tags.ts
var usePropDynamicTags = () => {
  let categories = [];
  const { propType } = (0, import_editor_controls52.useBoundProp)();
  if (propType) {
    const propDynamicType = getDynamicPropType(propType);
    categories = propDynamicType?.settings.categories || [];
  }
  return (0, import_react38.useMemo)(() => getDynamicTagsByCategories(categories), [categories.join()]);
};
var getDynamicTagsByCategories = (categories) => {
  const dynamicTags = getAtomicDynamicTags();
  if (!categories.length || !dynamicTags?.tags) {
    return [];
  }
  const _categories = new Set(categories);
  return Object.values(dynamicTags.tags).filter(
    (dynamicTag) => dynamicTag.categories.some((category) => _categories.has(category))
  );
};

// src/dynamics/hooks/use-dynamic-tag.ts
var useDynamicTag = (tagName) => {
  const dynamicTags = usePropDynamicTags();
  return (0, import_react39.useMemo)(() => dynamicTags.find((tag) => tag.name === tagName) ?? null, [dynamicTags, tagName]);
};

// src/dynamics/components/background-control-dynamic-tag.tsx
var BackgroundControlDynamicTagIcon = () => /* @__PURE__ */ React87.createElement(import_icons25.DatabaseIcon, { fontSize: "tiny" });
var BackgroundControlDynamicTagLabel = ({ value }) => {
  const context = (0, import_editor_controls53.useBoundProp)(import_editor_props12.backgroundImageOverlayPropTypeUtil);
  return /* @__PURE__ */ React87.createElement(import_editor_controls53.PropProvider, { ...context, value: value.value }, /* @__PURE__ */ React87.createElement(import_editor_controls53.PropKeyProvider, { bind: "image" }, /* @__PURE__ */ React87.createElement(Wrapper, { rawValue: value.value })));
};
var Wrapper = ({ rawValue }) => {
  const { propType } = (0, import_editor_controls53.useBoundProp)();
  const imageOverlayPropType = propType.prop_types["background-image-overlay"];
  return /* @__PURE__ */ React87.createElement(import_editor_controls53.PropProvider, { propType: imageOverlayPropType.shape.image, value: rawValue, setValue: () => void 0 }, /* @__PURE__ */ React87.createElement(import_editor_controls53.PropKeyProvider, { bind: "src" }, /* @__PURE__ */ React87.createElement(Content, { rawValue: rawValue.image })));
};
var Content = ({ rawValue }) => {
  const src = rawValue.value.src;
  const dynamicTag = useDynamicTag(src.value.name || "");
  return /* @__PURE__ */ React87.createElement(React87.Fragment, null, dynamicTag?.label);
};

// src/dynamics/components/dynamic-selection-control.tsx
var React90 = __toESM(require("react"));
var import_editor_controls56 = require("@elementor/editor-controls");
var import_editor_ui7 = require("@elementor/editor-ui");
var import_icons27 = require("@elementor/icons");
var import_ui47 = require("@elementor/ui");
var import_i18n60 = require("@wordpress/i18n");

// src/hooks/use-persist-dynamic-value.ts
var import_session6 = require("@elementor/session");
var usePersistDynamicValue = (propKey) => {
  const { element } = useElement();
  const prefixedKey = `dynamic/non-dynamic-values-history/${element.id}/${propKey}`;
  return (0, import_session6.useSessionStorage)(prefixedKey);
};

// src/dynamics/dynamic-control.tsx
var React88 = __toESM(require("react"));
var import_editor_controls54 = require("@elementor/editor-controls");
var DynamicControl = ({ bind, children }) => {
  const { value, setValue } = (0, import_editor_controls54.useBoundProp)(dynamicPropTypeUtil);
  const { name = "", settings } = value ?? {};
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
      settings: {
        ...settings,
        ...newValues
      }
    });
  };
  const propType = createTopLevelOjectType({ schema: dynamicTag.props_schema });
  return /* @__PURE__ */ React88.createElement(import_editor_controls54.PropProvider, { propType, setValue: setDynamicValue, value: { [bind]: dynamicValue } }, /* @__PURE__ */ React88.createElement(import_editor_controls54.PropKeyProvider, { bind }, children));
};

// src/dynamics/components/dynamic-selection.tsx
var import_react40 = require("react");
var React89 = __toESM(require("react"));
var import_editor_controls55 = require("@elementor/editor-controls");
var import_editor_ui6 = require("@elementor/editor-ui");
var import_icons26 = require("@elementor/icons");
var import_ui46 = require("@elementor/ui");
var import_i18n59 = require("@wordpress/i18n");
var SIZE6 = "tiny";
var DynamicSelection = ({ close: closePopover }) => {
  const [searchValue, setSearchValue] = (0, import_react40.useState)("");
  const { groups: dynamicGroups } = getAtomicDynamicTags() || {};
  const theme = (0, import_ui46.useTheme)();
  const { value: anyValue } = (0, import_editor_controls55.useBoundProp)();
  const { bind, value: dynamicValue, setValue } = (0, import_editor_controls55.useBoundProp)(dynamicPropTypeUtil);
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
    setValue({ name: value, settings: { label: selectedOption?.label } });
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
  const sectionRef = useSectionRef();
  const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;
  return /* @__PURE__ */ React89.createElement(React89.Fragment, null, /* @__PURE__ */ React89.createElement(
    import_editor_ui6.PopoverHeader,
    {
      title: (0, import_i18n59.__)("Dynamic tags", "elementor"),
      onClose: closePopover,
      icon: /* @__PURE__ */ React89.createElement(import_icons26.DatabaseIcon, { fontSize: SIZE6 })
    }
  ), /* @__PURE__ */ React89.createElement(import_ui46.Stack, null, hasNoDynamicTags ? /* @__PURE__ */ React89.createElement(NoDynamicTags, null) : /* @__PURE__ */ React89.createElement(import_react40.Fragment, null, /* @__PURE__ */ React89.createElement(
    import_editor_ui6.PopoverSearch,
    {
      value: searchValue,
      onSearch: handleSearch,
      placeholder: (0, import_i18n59.__)("Search dynamic tags\u2026", "elementor")
    }
  ), /* @__PURE__ */ React89.createElement(import_ui46.Divider, null), /* @__PURE__ */ React89.createElement(
    import_editor_ui6.PopoverMenuList,
    {
      items: virtualizedItems,
      onSelect: handleSetDynamicTag,
      onClose: closePopover,
      selectedValue: dynamicValue?.name,
      itemStyle: (item) => item.type === "item" ? { paddingInlineStart: theme.spacing(3.5) } : {},
      noResultsComponent: /* @__PURE__ */ React89.createElement(NoResults, { searchValue, onClear: () => setSearchValue("") }),
      width: sectionWidth
    }
  ))));
};
var NoResults = ({ searchValue, onClear }) => /* @__PURE__ */ React89.createElement(
  import_ui46.Stack,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    p: 2.5,
    color: "text.secondary",
    sx: { pb: 3.5 }
  },
  /* @__PURE__ */ React89.createElement(import_icons26.DatabaseIcon, { fontSize: "large" }),
  /* @__PURE__ */ React89.createElement(import_ui46.Typography, { align: "center", variant: "subtitle2" }, (0, import_i18n59.__)("Sorry, nothing matched", "elementor"), /* @__PURE__ */ React89.createElement("br", null), "\u201C", searchValue, "\u201D."),
  /* @__PURE__ */ React89.createElement(import_ui46.Typography, { align: "center", variant: "caption", sx: { display: "flex", flexDirection: "column" } }, (0, import_i18n59.__)("Try something else.", "elementor"), /* @__PURE__ */ React89.createElement(import_ui46.Link, { color: "text.secondary", variant: "caption", component: "button", onClick: onClear }, (0, import_i18n59.__)("Clear & try again", "elementor")))
);
var NoDynamicTags = () => /* @__PURE__ */ React89.createElement(import_ui46.Box, { sx: { overflowY: "hidden", height: 297, width: 220 } }, /* @__PURE__ */ React89.createElement(import_ui46.Divider, null), /* @__PURE__ */ React89.createElement(
  import_ui46.Stack,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    p: 2.5,
    color: "text.secondary",
    sx: { pb: 3.5 }
  },
  /* @__PURE__ */ React89.createElement(import_icons26.DatabaseIcon, { fontSize: "large" }),
  /* @__PURE__ */ React89.createElement(import_ui46.Typography, { align: "center", variant: "subtitle2" }, (0, import_i18n59.__)("Streamline your workflow with dynamic tags", "elementor")),
  /* @__PURE__ */ React89.createElement(import_ui46.Typography, { align: "center", variant: "caption" }, (0, import_i18n59.__)("You'll need Elementor Pro to use this feature.", "elementor"))
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
    categories.get(group)?.push({ label, value: name });
    return categories;
  }, /* @__PURE__ */ new Map());
  return [...options12];
};

// src/dynamics/components/dynamic-selection-control.tsx
var SIZE7 = "tiny";
var DynamicSelectionControl = () => {
  const { setValue: setAnyValue } = (0, import_editor_controls56.useBoundProp)();
  const { bind, value } = (0, import_editor_controls56.useBoundProp)(dynamicPropTypeUtil);
  const [propValueFromHistory] = usePersistDynamicValue(bind);
  const selectionPopoverState = (0, import_ui47.usePopupState)({ variant: "popover" });
  const { name: tagName = "" } = value;
  const dynamicTag = useDynamicTag(tagName);
  const removeDynamicTag = () => {
    setAnyValue(propValueFromHistory ?? null);
  };
  if (!dynamicTag) {
    throw new Error(`Dynamic tag ${tagName} not found`);
  }
  return /* @__PURE__ */ React90.createElement(import_ui47.Box, null, /* @__PURE__ */ React90.createElement(
    import_ui47.UnstableTag,
    {
      fullWidth: true,
      showActionsOnHover: true,
      label: dynamicTag.label,
      startIcon: /* @__PURE__ */ React90.createElement(import_icons27.DatabaseIcon, { fontSize: SIZE7 }),
      ...(0, import_ui47.bindTrigger)(selectionPopoverState),
      actions: /* @__PURE__ */ React90.createElement(React90.Fragment, null, /* @__PURE__ */ React90.createElement(DynamicSettingsPopover, { dynamicTag }), /* @__PURE__ */ React90.createElement(
        import_ui47.IconButton,
        {
          size: SIZE7,
          onClick: removeDynamicTag,
          "aria-label": (0, import_i18n60.__)("Remove dynamic value", "elementor")
        },
        /* @__PURE__ */ React90.createElement(import_icons27.XIcon, { fontSize: SIZE7 })
      ))
    }
  ), /* @__PURE__ */ React90.createElement(
    import_ui47.Popover,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...(0, import_ui47.bindPopover)(selectionPopoverState)
    },
    /* @__PURE__ */ React90.createElement(import_ui47.Stack, null, /* @__PURE__ */ React90.createElement(DynamicSelection, { close: selectionPopoverState.close }))
  ));
};
var DynamicSettingsPopover = ({ dynamicTag }) => {
  const popupState = (0, import_ui47.usePopupState)({ variant: "popover" });
  const hasDynamicSettings = !!dynamicTag.atomic_controls.length;
  if (!hasDynamicSettings) {
    return null;
  }
  return /* @__PURE__ */ React90.createElement(React90.Fragment, null, /* @__PURE__ */ React90.createElement(import_ui47.IconButton, { size: SIZE7, ...(0, import_ui47.bindTrigger)(popupState), "aria-label": (0, import_i18n60.__)("Settings", "elementor") }, /* @__PURE__ */ React90.createElement(import_icons27.SettingsIcon, { fontSize: SIZE7 })), /* @__PURE__ */ React90.createElement(
    import_ui47.Popover,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorOrigin: { vertical: "bottom", horizontal: "center" },
      PaperProps: {
        sx: { my: 0.5 }
      },
      ...(0, import_ui47.bindPopover)(popupState)
    },
    /* @__PURE__ */ React90.createElement(
      import_editor_ui7.PopoverHeader,
      {
        title: dynamicTag.label,
        onClose: popupState.close,
        icon: /* @__PURE__ */ React90.createElement(import_icons27.DatabaseIcon, { fontSize: SIZE7 })
      }
    ),
    /* @__PURE__ */ React90.createElement(DynamicSettings, { controls: dynamicTag.atomic_controls })
  ));
};
var DynamicSettings = ({ controls }) => {
  const tabs = controls.filter(({ type }) => type === "section");
  const { getTabsProps, getTabProps, getTabPanelProps } = (0, import_ui47.useTabs)(0);
  if (!tabs.length) {
    return null;
  }
  return /* @__PURE__ */ React90.createElement(import_editor_ui7.PopoverScrollableContent, null, /* @__PURE__ */ React90.createElement(import_ui47.Tabs, { size: "small", variant: "fullWidth", ...getTabsProps() }, tabs.map(({ value }, index) => /* @__PURE__ */ React90.createElement(import_ui47.Tab, { key: index, label: value.label, sx: { px: 1, py: 0.5 }, ...getTabProps(index) }))), /* @__PURE__ */ React90.createElement(import_ui47.Divider, null), tabs.map(({ value }, index) => {
    return /* @__PURE__ */ React90.createElement(import_ui47.TabPanel, { key: index, sx: { flexGrow: 1, py: 0 }, ...getTabPanelProps(index) }, /* @__PURE__ */ React90.createElement(import_ui47.Stack, { p: 2, gap: 2 }, value.items.map((item) => {
      if (item.type === "control") {
        return /* @__PURE__ */ React90.createElement(Control3, { key: item.value.bind, control: item.value });
      }
      return null;
    })));
  }));
};
var Control3 = ({ control }) => {
  if (!getControl(control.type)) {
    return null;
  }
  return /* @__PURE__ */ React90.createElement(DynamicControl, { bind: control.bind }, /* @__PURE__ */ React90.createElement(import_ui47.Grid, { container: true, gap: 0.75 }, control.label ? /* @__PURE__ */ React90.createElement(import_ui47.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React90.createElement(import_editor_controls56.ControlFormLabel, null, control.label)) : null, /* @__PURE__ */ React90.createElement(import_ui47.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React90.createElement(Control, { type: control.type, props: control.props }))));
};

// src/dynamics/dynamic-transformer.ts
var import_editor_canvas3 = require("@elementor/editor-canvas");
var import_editor_props13 = require("@elementor/editor-props");

// src/dynamics/errors.ts
var import_utils9 = require("@elementor/utils");
var DynamicTagsManagerNotFoundError = (0, import_utils9.createError)({
  code: "dynamic_tags_manager_not_found",
  message: "Dynamic tags manager not found"
});

// src/dynamics/dynamic-transformer.ts
var dynamicTransformer = (0, import_editor_canvas3.createTransformer)((value) => {
  if (!value.name) {
    return null;
  }
  return getDynamicValue(value.name, simpleTransform(value.settings ?? {}));
});
function simpleTransform(props) {
  const transformed = Object.entries(props).map(([settingKey, settingValue]) => {
    const value = (0, import_editor_props13.isTransformable)(settingValue) ? settingValue.value : settingValue;
    return [settingKey, value];
  });
  return Object.fromEntries(transformed);
}
function getDynamicValue(name, settings) {
  const extendedWindow = window;
  const { dynamicTags } = extendedWindow.elementor ?? {};
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
var React91 = __toESM(require("react"));
var import_editor_controls57 = require("@elementor/editor-controls");
var import_icons28 = require("@elementor/icons");
var import_i18n61 = require("@wordpress/i18n");
var usePropDynamicAction = () => {
  const { propType } = (0, import_editor_controls57.useBoundProp)();
  const visible = !!propType && supportsDynamic(propType);
  return {
    visible,
    icon: import_icons28.DatabaseIcon,
    title: (0, import_i18n61.__)("Dynamic tags", "elementor"),
    content: ({ close }) => /* @__PURE__ */ React91.createElement(DynamicSelection, { close })
  };
};

// src/dynamics/init.ts
var { registerPopoverAction } = controlActionsMenu;
var init = () => {
  registerControlReplacement({
    component: DynamicSelectionControl,
    condition: ({ value }) => isDynamicPropValue(value)
  });
  (0, import_editor_controls58.injectIntoRepeaterItemLabel)({
    id: "dynamic-background-image",
    condition: ({ value }) => isDynamicPropValue(value.value?.image?.value?.src),
    component: BackgroundControlDynamicTagLabel
  });
  (0, import_editor_controls58.injectIntoRepeaterItemIcon)({
    id: "dynamic-background-image",
    condition: ({ value }) => isDynamicPropValue(value.value?.image?.value?.src),
    component: BackgroundControlDynamicTagIcon
  });
  registerPopoverAction({
    id: "dynamic-tags",
    useProps: usePropDynamicAction
  });
  import_editor_canvas4.styleTransformersRegistry.register("dynamic", dynamicTransformer);
  import_editor_canvas4.settingsTransformersRegistry.register("dynamic", dynamicTransformer);
};

// src/reset-style-props.tsx
var import_editor_controls59 = require("@elementor/editor-controls");
var import_icons29 = require("@elementor/icons");
var import_i18n62 = require("@wordpress/i18n");
var { registerAction } = controlActionsMenu;
function initResetStyleProps() {
  registerAction({
    id: "reset-style-value",
    useProps: useResetStyleValueProps
  });
}
var EXCLUDED_BINDS = ["order", "flex-grow", "flex-shrink", "flex-basis"];
function useResetStyleValueProps() {
  const isStyle = useIsStyle();
  const { value, setValue, path, bind } = (0, import_editor_controls59.useBoundProp)();
  return {
    visible: isStyle && value !== null && value !== void 0 && path.length <= 2 && !EXCLUDED_BINDS.includes(bind),
    title: (0, import_i18n62.__)("Clear", "elementor"),
    icon: import_icons29.BrushBigIcon,
    onClick: () => setValue(null)
  };
}

// src/styles-inheritance/init-styles-inheritance-transformers.ts
var import_editor_canvas9 = require("@elementor/editor-canvas");

// src/styles-inheritance/transformers/background-color-overlay-transformer.tsx
var React92 = __toESM(require("react"));
var import_editor_canvas5 = require("@elementor/editor-canvas");
var import_ui48 = require("@elementor/ui");
var backgroundColorOverlayTransformer = (0, import_editor_canvas5.createTransformer)((value) => /* @__PURE__ */ React92.createElement(import_ui48.Stack, { direction: "row", gap: 10 }, /* @__PURE__ */ React92.createElement(ItemIconColor, { value }), /* @__PURE__ */ React92.createElement(ItemLabelColor, { value })));
var ItemIconColor = ({ value }) => {
  const { color } = value;
  return /* @__PURE__ */ React92.createElement(StyledUnstableColorIndicator, { size: "inherit", component: "span", value: color });
};
var ItemLabelColor = ({ value: { color } }) => {
  return /* @__PURE__ */ React92.createElement("span", null, color);
};
var StyledUnstableColorIndicator = (0, import_ui48.styled)(import_ui48.UnstableColorIndicator)(({ theme }) => ({
  borderRadius: `${theme.shape.borderRadius / 2}px`
}));

// src/styles-inheritance/transformers/background-gradient-overlay-transformer.tsx
var React93 = __toESM(require("react"));
var import_editor_canvas6 = require("@elementor/editor-canvas");
var import_ui49 = require("@elementor/ui");
var import_i18n63 = require("@wordpress/i18n");
var backgroundGradientOverlayTransformer = (0, import_editor_canvas6.createTransformer)((value) => /* @__PURE__ */ React93.createElement(import_ui49.Stack, { direction: "row", gap: 10 }, /* @__PURE__ */ React93.createElement(ItemIconGradient, { value }), /* @__PURE__ */ React93.createElement(ItemLabelGradient, { value })));
var ItemIconGradient = ({ value }) => {
  const gradient = getGradientValue(value);
  return /* @__PURE__ */ React93.createElement(StyledUnstableColorIndicator, { size: "inherit", component: "span", value: gradient });
};
var ItemLabelGradient = ({ value }) => {
  if (value.type === "linear") {
    return /* @__PURE__ */ React93.createElement("span", null, (0, import_i18n63.__)("Linear Gradient", "elementor"));
  }
  return /* @__PURE__ */ React93.createElement("span", null, (0, import_i18n63.__)("Radial Gradient", "elementor"));
};
var getGradientValue = (gradient) => {
  const stops = gradient.stops?.map(({ color, offset }) => `${color} ${offset ?? 0}%`)?.join(",");
  if (gradient.type === "linear") {
    return `linear-gradient(${gradient.angle}deg, ${stops})`;
  }
  return `radial-gradient(circle at ${gradient.positions}, ${stops})`;
};

// src/styles-inheritance/transformers/background-image-overlay-transformer.tsx
var React94 = __toESM(require("react"));
var import_editor_canvas7 = require("@elementor/editor-canvas");
var import_editor_ui8 = require("@elementor/editor-ui");
var import_ui50 = require("@elementor/ui");
var import_wp_media = require("@elementor/wp-media");
var backgroundImageOverlayTransformer = (0, import_editor_canvas7.createTransformer)((value) => /* @__PURE__ */ React94.createElement(import_ui50.Stack, { direction: "row", gap: 10 }, /* @__PURE__ */ React94.createElement(ItemIconImage, { value }), /* @__PURE__ */ React94.createElement(ItemLabelImage, { value })));
var ItemIconImage = ({ value }) => {
  const { imageUrl } = useImage(value);
  return /* @__PURE__ */ React94.createElement(
    import_ui50.CardMedia,
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
var ItemLabelImage = ({ value }) => {
  const { imageTitle } = useImage(value);
  return /* @__PURE__ */ React94.createElement(import_editor_ui8.EllipsisWithTooltip, { title: imageTitle }, /* @__PURE__ */ React94.createElement("span", null, imageTitle));
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

// src/styles-inheritance/transformers/background-overlay-transformer.tsx
var React95 = __toESM(require("react"));
var import_editor_canvas8 = require("@elementor/editor-canvas");
var import_ui51 = require("@elementor/ui");
var backgroundOverlayTransformer = (0, import_editor_canvas8.createTransformer)((values) => {
  if (!values || values.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React95.createElement(import_ui51.Stack, { direction: "column" }, values.map((item, index) => /* @__PURE__ */ React95.createElement(import_ui51.Stack, { key: index }, item)));
});

// src/styles-inheritance/init-styles-inheritance-transformers.ts
function initStylesInheritanceTransformers() {
  const originalStyleTransformers = import_editor_canvas9.styleTransformersRegistry.all();
  Object.entries(originalStyleTransformers).forEach(([propType, transformer]) => {
    if (excludePropTypeTransformers.has(propType)) {
      return;
    }
    stylesInheritanceTransformersRegistry.register(propType, transformer);
  });
  stylesInheritanceTransformersRegistry.registerFallback(
    (0, import_editor_canvas9.createTransformer)((value) => {
      return value;
    })
  );
  registerCustomTransformers();
}
function registerCustomTransformers() {
  stylesInheritanceTransformersRegistry.register("background-color-overlay", backgroundColorOverlayTransformer);
  stylesInheritanceTransformersRegistry.register(
    "background-gradient-overlay",
    backgroundGradientOverlayTransformer
  );
  stylesInheritanceTransformersRegistry.register("background-image-overlay", backgroundImageOverlayTransformer);
  stylesInheritanceTransformersRegistry.register("background-overlay", backgroundOverlayTransformer);
}

// src/styles-inheritance/init.ts
var init2 = () => {
  if (isUsingIndicatorPopover()) {
    initStylesInheritanceTransformers();
  }
};

// src/init.ts
function init3() {
  (0, import_editor_panels3.__registerPanel)(panel);
  blockV1Panel();
  (0, import_editor.injectIntoLogic)({
    id: "editing-panel-hooks",
    component: EditingPanelHooks
  });
  (0, import_editor.injectIntoLogic)({
    id: "current-user-data",
    component: import_editor_current_user.PrefetchUserData
  });
  init();
  init2();
  if ((0, import_editor_v1_adapters18.isExperimentActive)(EXPERIMENTAL_FEATURES.V_3_30)) {
    initResetStyleProps();
  }
}
var blockV1Panel = () => {
  (0, import_editor_v1_adapters18.blockCommand)({
    command: "panel/editor/open",
    condition: isAtomicWidgetSelected
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  controlActionsMenu,
  init,
  injectIntoClassSelectorActions,
  registerControlReplacement,
  registerStyleProviderToColors,
  useBoundProp,
  useFontFamilies,
  usePanelActions,
  usePanelStatus,
  useSectionRef
});
//# sourceMappingURL=index.js.map