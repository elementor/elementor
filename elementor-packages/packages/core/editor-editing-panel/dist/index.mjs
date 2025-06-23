// src/sync/experiments-flags.ts
var EXPERIMENTAL_FEATURES = {
  V_3_30: "e_v_3_30",
  V_3_31: "e_v_3_31"
};

// src/index.ts
import { useBoundProp as useBoundProp9 } from "@elementor/editor-controls";

// src/control-replacement.tsx
import { createControlReplacementsRegistry } from "@elementor/editor-controls";
var { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

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
import * as React8 from "react";
import { useRef, useState as useState4 } from "react";
import { useElementSetting } from "@elementor/editor-elements";
import {
  isElementsStylesProvider as isElementsStylesProvider2,
  stylesRepository as stylesRepository4,
  useProviders,
  useUserStylesCapability as useUserStylesCapability4,
  validateStyleLabel as validateStyleLabel2
} from "@elementor/editor-styles-repository";
import { InfoAlert, WarningInfotip } from "@elementor/editor-ui";
import { ColorSwatchIcon, MapPinIcon } from "@elementor/icons";
import { createLocation } from "@elementor/locations";
import {
  Box as Box2,
  Chip as Chip3,
  FormLabel,
  Link,
  Stack as Stack3,
  Typography as Typography3
} from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";

// src/contexts/classes-prop-context.tsx
import * as React from "react";
import { createContext, useContext } from "react";
var Context = createContext(null);
function ClassesPropProvider({ children, prop }) {
  return /* @__PURE__ */ React.createElement(Context.Provider, { value: { prop } }, children);
}
function useClassesProp() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useClassesProp must be used within a ClassesPropProvider");
  }
  return context.prop;
}

// src/contexts/element-context.tsx
import * as React2 from "react";
import { createContext as createContext2, useContext as useContext2 } from "react";
var Context2 = createContext2(null);
function ElementProvider({ children, element, elementType }) {
  return /* @__PURE__ */ React2.createElement(Context2.Provider, { value: { element, elementType } }, children);
}
function useElement() {
  const context = useContext2(Context2);
  if (!context) {
    throw new Error("useElement must be used within a ElementProvider");
  }
  return context;
}

// src/contexts/style-context.tsx
import * as React3 from "react";
import { createContext as createContext3, useContext as useContext3 } from "react";
import { stylesRepository, useUserStylesCapability } from "@elementor/editor-styles-repository";

// src/errors.ts
import { createError } from "@elementor/utils";
var ControlTypeNotFoundError = createError({
  code: "control_type_not_found",
  message: "Control type not found."
});
var StylesProviderNotFoundError = createError({
  code: "provider_not_found",
  message: "Styles provider not found."
});
var StylesProviderCannotUpdatePropsError = createError({
  code: "provider_cannot_update_props",
  message: "Styles provider doesn't support updating props."
});
var StyleNotFoundUnderProviderError = createError({
  code: "style_not_found_under_provider",
  message: "Style not found under the provider."
});

// src/contexts/style-context.tsx
var Context3 = createContext3(null);
function StyleProvider({ children, ...props }) {
  const provider = props.id === null ? null : getProviderByStyleId(props.id);
  const { userCan } = useUserStylesCapability();
  if (props.id && !provider) {
    throw new StylesProviderNotFoundError({ context: { styleId: props.id } });
  }
  const canEdit = userCan(provider?.getKey() ?? "").updateProps;
  return /* @__PURE__ */ React3.createElement(Context3.Provider, { value: { ...props, provider, canEdit } }, children);
}
function useStyle() {
  const context = useContext3(Context3);
  if (!context) {
    throw new Error("useStyle must be used within a StyleProvider");
  }
  return context;
}
function getProviderByStyleId(styleId) {
  const styleProvider = stylesRepository.getProviders().find((provider) => {
    return provider.actions.all().find((style) => style.id === styleId);
  });
  return styleProvider ?? null;
}
function useIsStyle() {
  return !!useContext3(Context3);
}

// src/utils/get-styles-provider-color.ts
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY, isElementsStylesProvider } from "@elementor/editor-styles-repository";
var getStylesProviderColorName = (provider) => {
  if (!provider || provider === ELEMENTS_BASE_STYLES_PROVIDER_KEY) {
    return "default";
  }
  if (isElementsStylesProvider(provider)) {
    return "accent";
  }
  return getStyleProviderColors(provider).name;
};
var getStylesProviderThemeColor = (provider) => {
  if (!provider || provider === ELEMENTS_BASE_STYLES_PROVIDER_KEY) {
    return null;
  }
  if (isElementsStylesProvider(provider)) {
    return (theme) => theme.palette.accent.main;
  }
  return getStyleProviderColors(provider).getThemeColor;
};

// src/components/creatable-autocomplete/creatable-autocomplete.tsx
import * as React4 from "react";
import { useId, useMemo } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  styled,
  TextField,
  Typography
} from "@elementor/ui";

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
import { useState } from "react";
function useInputState(validate) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(null);
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
  const [open, setOpen] = useState(initialOpen);
  const openDropdown = () => setOpen(true);
  const closeDropdown = () => setOpen(false);
  return { open, openDropdown, closeDropdown };
}

// src/components/creatable-autocomplete/use-create-option.ts
import { useState as useState2 } from "react";
function useCreateOption(params) {
  const { onCreate, validate, setInputValue, setError, closeDropdown } = params;
  const [loading, setLoading] = useState2(false);
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
import { createFilterOptions } from "@elementor/ui";
function useFilterOptions(parameters) {
  const { options: options12, selected, onCreate, entityName } = parameters;
  const filter = createFilterOptions();
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
  const [internalOptions, internalSelected] = useMemo(
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
    Autocomplete,
    {
      renderTags: (tagValue, getTagProps) => {
        return tagValue.map((option, index) => /* @__PURE__ */ React4.createElement(
          Chip,
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
          TextField,
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
  const id = `combobox-group-${useId().replace(/:/g, "_")}`;
  return /* @__PURE__ */ React4.createElement(StyledGroup, { role: "group", "aria-labelledby": id }, /* @__PURE__ */ React4.createElement(StyledGroupHeader, { id }, " ", params.group), /* @__PURE__ */ React4.createElement(StyledGroupItems, { role: "listbox" }, params.children));
};
var ErrorText = React4.forwardRef(({ error = "error" }, ref) => {
  return /* @__PURE__ */ React4.createElement(
    Box,
    {
      ref,
      sx: (theme) => ({
        padding: theme.spacing(2)
      })
    },
    /* @__PURE__ */ React4.createElement(Typography, { variant: "caption", sx: { color: "error.main", display: "inline-block" } }, error)
  );
});
var StyledGroup = styled("li")`
	&:not( :last-of-type ) {
		border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
	}
`;
var StyledGroupHeader = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: "-8px",
  padding: theme.spacing(1, 2),
  color: theme.palette.text.tertiary,
  backgroundColor: theme.palette.primary.contrastText
}));
var StyledGroupItems = styled("ul")`
	padding: 0;
`;

// src/components/css-classes/css-class-item.tsx
import * as React7 from "react";
import { useState as useState3 } from "react";
import { stylesRepository as stylesRepository3, useUserStylesCapability as useUserStylesCapability3, validateStyleLabel } from "@elementor/editor-styles-repository";
import { EditableField, EllipsisWithTooltip, useEditable } from "@elementor/editor-ui";
import { DotsVerticalIcon } from "@elementor/icons";
import {
  bindTrigger,
  Chip as Chip2,
  Stack as Stack2,
  Typography as Typography2,
  UnstableChipGroup,
  usePopupState
} from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";

// src/components/css-classes/css-class-context.tsx
import * as React5 from "react";
import { createContext as createContext4, useContext as useContext4 } from "react";
var CssClassContext = createContext4(null);
var useCssClass = () => {
  const context = useContext4(CssClassContext);
  if (!context) {
    throw new Error("useCssClass must be used within a CssClassProvider");
  }
  return context;
};
function CssClassProvider({ children, ...contextValue }) {
  return /* @__PURE__ */ React5.createElement(CssClassContext.Provider, { value: contextValue }, children);
}

// src/components/css-classes/css-class-menu.tsx
import * as React6 from "react";
import { stylesRepository as stylesRepository2, useUserStylesCapability as useUserStylesCapability2 } from "@elementor/editor-styles-repository";
import { MenuItemInfotip, MenuListItem } from "@elementor/editor-ui";
import { bindMenu, Divider, Menu, MenuSubheader, Stack } from "@elementor/ui";
import { __ as __2 } from "@wordpress/i18n";

// src/components/style-indicator.tsx
import { styled as styled2 } from "@elementor/ui";
var StyleIndicator = styled2("div", {
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
import { useCallback, useMemo as useMemo2 } from "react";
import { setDocumentModifiedStatus } from "@elementor/editor-documents";
import { getElementLabel, getElementSetting, updateElementSettings } from "@elementor/editor-elements";
import { classesPropTypeUtil } from "@elementor/editor-props";
import { useGetStylesRepositoryCreateAction } from "@elementor/editor-styles-repository";
import { isExperimentActive, undoable } from "@elementor/editor-v1-adapters";
import { __ } from "@wordpress/i18n";
function useApplyClass() {
  const { id: activeId, setId: setActiveId } = useStyle();
  const { element } = useElement();
  const isVersion330Active = isExperimentActive(EXPERIMENTAL_FEATURES.V_3_30);
  const applyClass = useApply();
  const unapplyClass = useUnapply();
  const undoableApply = useMemo2(() => {
    return undoable(
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
        title: getElementLabel(element.id),
        subtitle: ({ classLabel }) => {
          return __(`class %s applied`, "elementor").replace("%s", classLabel);
        }
      }
    );
  }, [activeId, applyClass, element.id, unapplyClass, setActiveId]);
  const applyWithoutHistory = useCallback(
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
  const isVersion330Active = isExperimentActive(EXPERIMENTAL_FEATURES.V_3_30);
  const applyClass = useApply();
  const unapplyClass = useUnapply();
  const undoableUnapply = useMemo2(() => {
    return undoable(
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
        title: getElementLabel(element.id),
        subtitle: ({ classLabel }) => {
          return __(`class %s removed`, "elementor").replace("%s", classLabel);
        }
      }
    );
  }, [activeId, applyClass, element.id, unapplyClass, setActiveId]);
  const unapplyWithoutHistory = useCallback(
    ({ classId }) => {
      unapplyClass(classId);
    },
    [unapplyClass]
  );
  return isVersion330Active ? undoableUnapply : unapplyWithoutHistory;
}
function useCreateAndApplyClass() {
  const { id: activeId, setId: setActiveId } = useStyle();
  const isVersion330Active = isExperimentActive(EXPERIMENTAL_FEATURES.V_3_30);
  const [provider, createAction] = useGetStylesRepositoryCreateAction() ?? [null, null];
  const deleteAction = provider?.actions.delete;
  const applyClass = useApply();
  const unapplyClass = useUnapply();
  const undoableCreateAndApply = useMemo2(() => {
    if (!provider || !createAction) {
      return;
    }
    return undoable(
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
        title: __("Class", "elementor"),
        subtitle: ({ classLabel }) => {
          return __(`%s created`, "elementor").replace("%s", classLabel);
        }
      }
    );
  }, [activeId, applyClass, createAction, deleteAction, provider, setActiveId, unapplyClass]);
  const createAndApplyWithoutHistory = useCallback(
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
  return useCallback(
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
  return useCallback(
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
  const isVersion330Active = isExperimentActive(EXPERIMENTAL_FEATURES.V_3_30);
  return useMemo2(() => {
    const setClasses = (ids) => {
      updateElementSettings({
        id: element.id,
        props: { [currentClassesProp]: classesPropTypeUtil.create(ids) },
        withHistory: isVersion330Active ? false : true
      });
      if (isVersion330Active) {
        setDocumentModifiedStatus(true);
      }
    };
    const getAppliedClasses = () => getElementSetting(element.id, currentClassesProp)?.value || [];
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
    Menu,
    {
      MenuListProps: { dense: true, sx: { minWidth: "160px" } },
      ...bindMenu(popupState),
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
    /* @__PURE__ */ React6.createElement(MenuSubheader, { sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1 } }, __2("States", "elementor")),
    STATES.map((state) => {
      return /* @__PURE__ */ React6.createElement(StateMenuItem, { key: state.key, state: state.value, closeMenu: popupState.close });
    })
  );
}
function useModifiedStates(styleId) {
  const { meta } = useStyle();
  const styleDef = stylesRepository2.all().find((style) => style.id === styleId);
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
  const providerInstance = stylesRepository2.getProviderByKey(provider);
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
        MenuSubheader,
        {
          key: "provider-label",
          sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1, textTransform: "capitalize" }
        },
        providerInstance?.labels?.singular
      )
    );
    actions.push(/* @__PURE__ */ React6.createElement(Divider, { key: "provider-actions-divider" }));
  }
  return actions;
}
function StateMenuItem({ state, closeMenu, ...props }) {
  const { id: styleId, provider } = useCssClass();
  const { id: activeId, setId: setActiveId, setMetaState: setActiveMetaState, meta } = useStyle();
  const { state: activeState } = meta;
  const { userCan } = useUserStylesCapability2();
  const modifiedStates = useModifiedStates(styleId);
  const isUpdateAllowed = !state || userCan(provider ?? "").updateProps;
  const isStyled = modifiedStates[state ?? "normal"] ?? false;
  const disabled = !isUpdateAllowed && !isStyled;
  const isActive = styleId === activeId;
  const isSelected = state === activeState && isActive;
  return /* @__PURE__ */ React6.createElement(
    MenuListItem,
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
      MenuItemInfotip,
      {
        showInfoTip: disabled,
        content: __2("With your current role, you can only use existing states.", "elementor")
      },
      /* @__PURE__ */ React6.createElement(Stack, { gap: 0.75, direction: "row", alignItems: "center" }, isStyled && /* @__PURE__ */ React6.createElement(
        StyleIndicator,
        {
          "aria-label": __2("Has style", "elementor"),
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
    MenuListItem,
    {
      ...props,
      onClick: () => {
        unapplyClass({ classId, classLabel });
        closeMenu();
      }
    },
    __2("Remove", "elementor")
  ) : null;
}
function RenameClassMenuItem({ closeMenu }) {
  const { handleRename, provider } = useCssClass();
  const { userCan } = useUserStylesCapability2();
  if (!provider) {
    return null;
  }
  const isAllowed = userCan(provider).update;
  return /* @__PURE__ */ React6.createElement(
    MenuListItem,
    {
      disabled: !isAllowed,
      onClick: () => {
        closeMenu();
        handleRename();
      }
    },
    /* @__PURE__ */ React6.createElement(
      MenuItemInfotip,
      {
        showInfoTip: !isAllowed,
        content: __2(
          "With your current role, you can use existing classes but can\u2019t modify them.",
          "elementor"
        )
      },
      __2("Rename", "elementor")
    )
  );
}

// src/components/css-classes/css-class-item.tsx
var CHIP_SIZE = "tiny";
function CssClassItem(props) {
  const { chipProps, icon, color: colorProp, fixed, ...classProps } = props;
  const { id, provider, label, isActive, onClickActive, renameLabel, setError } = classProps;
  const { meta, setMetaState } = useStyle();
  const popupState = usePopupState({ variant: "popover" });
  const [chipRef, setChipRef] = useState3(null);
  const { onDelete, ...chipGroupProps } = chipProps;
  const { userCan } = useUserStylesCapability3();
  const {
    ref,
    isEditing,
    openEditMode,
    error,
    getProps: getEditableProps
  } = useEditable({
    value: label,
    onSubmit: renameLabel,
    validation: validateLabel,
    onError: setError
  });
  const color = error ? "error" : colorProp;
  const providerActions = provider ? stylesRepository3.getProviderByKey(provider)?.actions : null;
  const allowRename = Boolean(providerActions?.update) && userCan(provider ?? "")?.update;
  const isShowingState = isActive && meta.state;
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(
    UnstableChipGroup,
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
      Chip2,
      {
        size: CHIP_SIZE,
        label: isEditing ? /* @__PURE__ */ React7.createElement(EditableField, { ref, ...getEditableProps() }) : /* @__PURE__ */ React7.createElement(EllipsisWithTooltip, { maxWidth: "10ch", title: label, as: "div" }),
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
      Chip2,
      {
        icon: isShowingState ? void 0 : /* @__PURE__ */ React7.createElement(DotsVerticalIcon, { fontSize: "tiny" }),
        size: CHIP_SIZE,
        label: isShowingState ? /* @__PURE__ */ React7.createElement(Stack2, { direction: "row", gap: 0.5, alignItems: "center" }, /* @__PURE__ */ React7.createElement(Typography2, { variant: "inherit" }, meta.state), /* @__PURE__ */ React7.createElement(DotsVerticalIcon, { fontSize: "tiny" })) : void 0,
        variant: "filled",
        shape: "rounded",
        color,
        ...bindTrigger(popupState),
        "aria-label": __3("Open CSS Class Menu", "elementor"),
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
  const result = validateStyleLabel(newLabel, "rename");
  if (result.isValid) {
    return null;
  }
  return result.errorMessage;
};

// src/components/css-classes/css-class-selector.tsx
var ID = "elementor-css-class-selector";
var TAGS_LIMIT = 50;
var EMPTY_OPTION = {
  label: __4("local", "elementor"),
  value: null,
  fixed: true,
  color: "accent",
  icon: /* @__PURE__ */ React8.createElement(MapPinIcon, null),
  provider: null
};
var { Slot: ClassSelectorActionsSlot, inject: injectIntoClassSelectorActions } = createLocation();
function CssClassSelector() {
  const options12 = useOptions();
  const { id: activeId, setId: setActiveId } = useStyle();
  const autocompleteRef = useRef(null);
  const [renameError, setRenameError] = useState4(null);
  const handleSelect = useHandleSelect();
  const { create, validate, entityName } = useCreateAction();
  const appliedOptions = useAppliedOptions(options12);
  const active = appliedOptions.find((option) => option.value === activeId) ?? EMPTY_OPTION;
  const showPlaceholder = appliedOptions.every(({ fixed }) => fixed);
  const { userCan } = useUserStylesCapability4();
  const canEdit = active.provider ? userCan(active.provider).updateProps : true;
  return /* @__PURE__ */ React8.createElement(Stack3, { p: 2 }, /* @__PURE__ */ React8.createElement(Stack3, { direction: "row", gap: 1, alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React8.createElement(FormLabel, { htmlFor: ID, size: "small" }, __4("Classes", "elementor")), /* @__PURE__ */ React8.createElement(Stack3, { direction: "row", gap: 1 }, /* @__PURE__ */ React8.createElement(ClassSelectorActionsSlot, null))), /* @__PURE__ */ React8.createElement(
    WarningInfotip,
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
        placeholder: showPlaceholder ? __4("Type class name", "elementor") : void 0,
        options: options12,
        selected: appliedOptions,
        entityName,
        onSelect: handleSelect,
        onCreate: create ?? void 0,
        validate: validate ?? void 0,
        limitTags: TAGS_LIMIT,
        renderEmptyState: EmptyState,
        getLimitTagsText: (more) => /* @__PURE__ */ React8.createElement(Chip3, { size: "tiny", variant: "standard", label: `+${more}`, clickable: true }),
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
  ), !canEdit && /* @__PURE__ */ React8.createElement(InfoAlert, { sx: { mt: 1 } }, __4("With your current role, you can use existing classes but can\u2019t modify them.", "elementor")));
}
var EmptyState = ({ searchValue, onClear }) => /* @__PURE__ */ React8.createElement(Box2, { sx: { py: 4 } }, /* @__PURE__ */ React8.createElement(
  Stack3,
  {
    gap: 1,
    alignItems: "center",
    color: "text.secondary",
    justifyContent: "center",
    sx: { px: 2, m: "auto", maxWidth: "236px" }
  },
  /* @__PURE__ */ React8.createElement(ColorSwatchIcon, { sx: { transform: "rotate(90deg)" }, fontSize: "large" }),
  /* @__PURE__ */ React8.createElement(Typography3, { align: "center", variant: "subtitle2" }, __4("Sorry, nothing matched", "elementor"), /* @__PURE__ */ React8.createElement("br", null), "\u201C", searchValue, "\u201D."),
  /* @__PURE__ */ React8.createElement(Typography3, { align: "center", variant: "caption", sx: { mb: 2 } }, __4("With your current role,", "elementor"), /* @__PURE__ */ React8.createElement("br", null), __4("you can only use existing classes.", "elementor")),
  /* @__PURE__ */ React8.createElement(Link, { color: "text.secondary", variant: "caption", component: "button", onClick: onClear }, __4("Clear & try again", "elementor"))
));
var updateClassByProvider = (provider, data) => {
  if (!provider) {
    return;
  }
  const providerInstance = stylesRepository4.getProviderByKey(provider);
  if (!providerInstance) {
    return;
  }
  return providerInstance.actions.update?.(data);
};
function useOptions() {
  const { element } = useElement();
  const isProviderEditable = (provider) => !!provider.actions.updateProps;
  return useProviders().filter(isProviderEditable).flatMap((provider) => {
    const isElements = isElementsStylesProvider2(provider.getKey());
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
        icon: isElements ? /* @__PURE__ */ React8.createElement(MapPinIcon, null) : null,
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
        errorMessage: __4(
          "You\u2019ve reached the limit of 50 classes. Please remove an existing one to create a new class.",
          "elementor"
        )
      };
    }
    return validateStyleLabel2(newClassLabel, event);
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
  const appliedIds = useElementSetting(element.id, currentClassesProp)?.value || [];
  const appliedOptions = options12.filter((option) => option.value && appliedIds.includes(option.value));
  const hasElementsProviderStyleApplied = appliedOptions.some(
    (option) => option.provider && isElementsStylesProvider2(option.provider)
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
import { __createPanel as createPanel } from "@elementor/editor-panels";

// src/components/editing-panel.tsx
import * as React86 from "react";
import { ControlActionsProvider, ControlReplacementsProvider } from "@elementor/editor-controls";
import { useSelectedElement } from "@elementor/editor-elements";
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from "@elementor/editor-panels";
import { ThemeProvider as ThemeProvider2 } from "@elementor/editor-ui";
import { AtomIcon } from "@elementor/icons";
import { SessionStorageProvider as SessionStorageProvider3 } from "@elementor/session";
import { ErrorBoundary } from "@elementor/ui";
import { __ as __62 } from "@wordpress/i18n";

// src/controls-actions.ts
import { createMenu } from "@elementor/menus";

// src/action.tsx
import * as React9 from "react";
import { IconButton, Tooltip } from "@elementor/ui";
var SIZE = "tiny";
function Action({ title, visible = true, icon: Icon, onClick }) {
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React9.createElement(Tooltip, { placement: "top", title, arrow: true }, /* @__PURE__ */ React9.createElement(IconButton, { "aria-label": title, size: SIZE, onClick }, /* @__PURE__ */ React9.createElement(Icon, { fontSize: SIZE })));
}

// src/popover-action.tsx
import * as React10 from "react";
import { useId as useId2 } from "react";
import { bindPopover, bindToggle, IconButton as IconButton2, Popover, Tooltip as Tooltip2, usePopupState as usePopupState2 } from "@elementor/ui";
var SIZE2 = "tiny";
function PopoverAction({
  title,
  visible = true,
  icon: Icon,
  content: PopoverContent
}) {
  const id = useId2();
  const popupState = usePopupState2({
    variant: "popover",
    popupId: `elementor-popover-action-${id}`
  });
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement(Tooltip2, { placement: "top", title }, /* @__PURE__ */ React10.createElement(IconButton2, { "aria-label": title, key: id, size: SIZE2, ...bindToggle(popupState) }, /* @__PURE__ */ React10.createElement(Icon, { fontSize: SIZE2 }))), /* @__PURE__ */ React10.createElement(
    Popover,
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
      ...bindPopover(popupState)
    },
    /* @__PURE__ */ React10.createElement(PopoverContent, { close: popupState.close })
  ));
}

// src/controls-actions.ts
var controlActionsMenu = createMenu({
  components: {
    Action,
    PopoverAction
  }
});

// src/components/editing-panel-error-fallback.tsx
import * as React11 from "react";
import { Alert, Box as Box3 } from "@elementor/ui";
function EditorPanelErrorFallback() {
  return /* @__PURE__ */ React11.createElement(Box3, { role: "alert", sx: { minHeight: "100%", p: 2 } }, /* @__PURE__ */ React11.createElement(Alert, { severity: "error", sx: { mb: 2, maxWidth: 400, textAlign: "center" } }, /* @__PURE__ */ React11.createElement("strong", null, "Something went wrong")));
}

// src/components/editing-panel-tabs.tsx
import * as React85 from "react";
import { Fragment as Fragment10 } from "react";
import { isExperimentActive as isExperimentActive17 } from "@elementor/editor-v1-adapters";
import { Divider as Divider6, Stack as Stack15, Tab, TabPanel, Tabs, useTabs } from "@elementor/ui";
import { __ as __61 } from "@wordpress/i18n";

// src/contexts/scroll-context.tsx
import * as React12 from "react";
import { createContext as createContext5, useContext as useContext5, useEffect, useRef as useRef2, useState as useState5 } from "react";
import { styled as styled3 } from "@elementor/ui";
var ScrollContext = createContext5(void 0);
var ScrollPanel = styled3("div")`
	height: 100%;
	overflow-y: auto;
`;
var DEFAULT_SCROLL_DIRECTION = "up";
function ScrollProvider({ children }) {
  const [direction, setDirection] = useState5(DEFAULT_SCROLL_DIRECTION);
  const ref = useRef2(null);
  const scrollPos = useRef2(0);
  useEffect(() => {
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
  return useContext5(ScrollContext)?.direction ?? DEFAULT_SCROLL_DIRECTION;
}

// src/hooks/use-default-panel-settings.ts
import { createContext as createContext6, useContext as useContext6 } from "react";
var fallbackEditorSettings = {
  defaultSectionsExpanded: {
    settings: ["Content", "Settings"],
    style: []
  },
  defaultTab: "settings"
};
var defaultPanelSettingsContext = createContext6({
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
  const defaults = useContext6(defaultPanelSettingsContext)[element.type];
  return defaults || fallbackEditorSettings;
};

// src/hooks/use-state-by-element.ts
import { useState as useState6 } from "react";
import { isExperimentActive as isExperimentActive2 } from "@elementor/editor-v1-adapters";
import { getSessionStorageItem, setSessionStorageItem } from "@elementor/session";
var useStateByElement = (key, initialValue) => {
  const { element } = useElement();
  const isFeatureActive = isExperimentActive2(EXPERIMENTAL_FEATURES.V_3_30);
  const lookup = `elementor/editor-state/${element.id}/${key}`;
  const storedValue = isFeatureActive ? getSessionStorageItem(lookup) : initialValue;
  const [value, setValue] = useState6(storedValue ?? initialValue);
  const doUpdate = (newValue) => {
    setSessionStorageItem(lookup, newValue);
    setValue(newValue);
  };
  return [value, doUpdate];
};

// src/components/settings-tab.tsx
import * as React19 from "react";
import { ControlFormLabel } from "@elementor/editor-controls";
import { isExperimentActive as isExperimentActive5 } from "@elementor/editor-v1-adapters";
import { SessionStorageProvider } from "@elementor/session";
import { Divider as Divider3 } from "@elementor/ui";

// src/controls-registry/control.tsx
import * as React13 from "react";

// src/controls-registry/controls-registry.tsx
import {
  ImageControl,
  KeyValueControl,
  LinkControl,
  RepeatableControl,
  SelectControl,
  SizeControl,
  SvgMediaControl,
  SwitchControl,
  TextAreaControl,
  TextControl,
  UrlControl
} from "@elementor/editor-controls";
import {
  booleanPropTypeUtil,
  imagePropTypeUtil,
  imageSrcPropTypeUtil,
  keyValuePropTypeUtil,
  linkPropTypeUtil,
  sizePropTypeUtil,
  stringPropTypeUtil
} from "@elementor/editor-props";
var controlTypes = {
  image: { component: ImageControl, layout: "full", propTypeUtil: imagePropTypeUtil },
  "svg-media": { component: SvgMediaControl, layout: "full", propTypeUtil: imageSrcPropTypeUtil },
  text: { component: TextControl, layout: "full", propTypeUtil: stringPropTypeUtil },
  textarea: { component: TextAreaControl, layout: "full", propTypeUtil: stringPropTypeUtil },
  size: { component: SizeControl, layout: "two-columns", propTypeUtil: sizePropTypeUtil },
  select: { component: SelectControl, layout: "two-columns", propTypeUtil: stringPropTypeUtil },
  link: { component: LinkControl, layout: "custom", propTypeUtil: linkPropTypeUtil },
  url: { component: UrlControl, layout: "full", propTypeUtil: stringPropTypeUtil },
  switch: { component: SwitchControl, layout: "two-columns", propTypeUtil: booleanPropTypeUtil },
  repeatable: { component: RepeatableControl, layout: "full", propTypeUtil: void 0 },
  "key-value": { component: KeyValueControl, layout: "full", propTypeUtil: keyValuePropTypeUtil }
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
import * as React14 from "react";
import { Box as Box4, styled as styled4 } from "@elementor/ui";
var ControlTypeContainer = ({ children, layout }) => {
  if (layout === "custom") {
    return children;
  }
  return /* @__PURE__ */ React14.createElement(StyledContainer, { layout }, children);
};
var StyledContainer = styled4(Box4, {
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
import * as React15 from "react";
import { useMemo as useMemo3 } from "react";
import { PropKeyProvider, PropProvider } from "@elementor/editor-controls";
import { setDocumentModifiedStatus as setDocumentModifiedStatus2 } from "@elementor/editor-documents";
import {
  getElementLabel as getElementLabel2,
  getElementSetting as getElementSetting2,
  updateElementSettings as updateElementSettings2,
  useElementSettings
} from "@elementor/editor-elements";
import { shouldApplyEffect } from "@elementor/editor-props";
import { isExperimentActive as isExperimentActive3, undoable as undoable2 } from "@elementor/editor-v1-adapters";
import { __ as __5 } from "@wordpress/i18n";

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
var SettingsField = ({ bind, children, propDisplayName }) => {
  const { element, elementType } = useElement();
  const elementSettingValues = useElementSettings(element.id, Object.keys(elementType.propsSchema));
  const value = { [bind]: elementSettingValues?.[bind] };
  const propType = createTopLevelOjectType({ schema: elementType.propsSchema });
  const undoableUpdateElementProp = useUndoableUpdateElementProp({
    propKey: bind,
    elementId: element.id,
    propDisplayName
  });
  const setValue = (newValue) => {
    const isVersion331Active = isExperimentActive3(EXPERIMENTAL_FEATURES.V_3_31);
    if (isVersion331Active) {
      undoableUpdateElementProp({ newValue });
    } else {
      updateElementSettings2({ id: element.id, props: newValue });
    }
  };
  const isDisabled = (prop) => getDisableState(prop, elementSettingValues);
  return /* @__PURE__ */ React15.createElement(PropProvider, { propType, value, setValue, isDisabled }, /* @__PURE__ */ React15.createElement(PropKeyProvider, { bind }, children));
};
function getDisableState(propType, elementValues) {
  const disablingDependencies = propType.dependencies?.filter(({ effect }) => effect === "disable") || [];
  if (!disablingDependencies.length) {
    return false;
  }
  if (disablingDependencies.length > 1) {
    throw new Error("Multiple disabling dependencies are not supported.");
  }
  return shouldApplyEffect(disablingDependencies[0], elementValues);
}
function useUndoableUpdateElementProp({
  propKey,
  elementId,
  propDisplayName
}) {
  return useMemo3(() => {
    return undoable2(
      {
        do: ({ newValue }) => {
          const prevPropValue = getElementSetting2(elementId, propKey);
          updateElementSettings2({ id: elementId, props: { ...newValue }, withHistory: false });
          setDocumentModifiedStatus2(true);
          return { [propKey]: prevPropValue };
        },
        undo: ({}, prevProps) => {
          updateElementSettings2({ id: elementId, props: prevProps, withHistory: false });
        }
      },
      {
        title: getElementLabel2(elementId),
        // translators: %s is the name of the property that was edited.
        subtitle: __5("%s edited", "elementor").replace("%s", propDisplayName)
      }
    );
  }, [propKey, elementId, propDisplayName]);
}

// src/components/section.tsx
import * as React17 from "react";
import { useId as useId3, useRef as useRef3 } from "react";
import { isExperimentActive as isExperimentActive4 } from "@elementor/editor-v1-adapters";
import { Collapse as Collapse2, Divider as Divider2, ListItemButton, ListItemText, Stack as Stack5 } from "@elementor/ui";

// src/contexts/section-context.tsx
import { createContext as createContext7, useContext as useContext7 } from "react";
var FALLBACK_SECTION_WIDTH = 320;
var SectionRefContext = createContext7(null);
var useSectionRef = () => useContext7(SectionRefContext);
var useSectionWidth = () => {
  const sectionRef = useSectionRef();
  return sectionRef?.current?.offsetWidth ?? FALLBACK_SECTION_WIDTH;
};

// src/components/collapse-icon.tsx
import { ChevronDownIcon } from "@elementor/icons";
import { styled as styled5 } from "@elementor/ui";
var CollapseIcon = styled5(ChevronDownIcon, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  transform: open ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.standard
  })
}));

// src/components/collapsible-content.tsx
import * as React16 from "react";
import { useState as useState7 } from "react";
import { Button, Collapse, Stack as Stack4, styled as styled6 } from "@elementor/ui";
import { __ as __6 } from "@wordpress/i18n";
var IndicatorsWrapper = styled6("div")`
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
  const [open, setOpen] = useState7(defaultOpen);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  return /* @__PURE__ */ React16.createElement(Stack4, null, /* @__PURE__ */ React16.createElement(Stack4, { sx: { position: "relative" } }, /* @__PURE__ */ React16.createElement(
    Button,
    {
      fullWidth: true,
      size: "small",
      color: "secondary",
      variant: "outlined",
      onClick: handleToggle,
      endIcon: /* @__PURE__ */ React16.createElement(CollapseIcon, { open }),
      sx: { my: 0.5 }
    },
    open ? __6("Show less", "elementor") : __6("Show more", "elementor")
  ), titleEnd && /* @__PURE__ */ React16.createElement(IndicatorsWrapper, null, getCollapsibleValue(titleEnd, open))), /* @__PURE__ */ React16.createElement(Collapse, { in: open, timeout: "auto", unmountOnExit: true }, children));
};
function getCollapsibleValue(value, isOpen) {
  if (typeof value === "function") {
    return value(isOpen);
  }
  return value;
}

// src/components/section.tsx
function Section({ title, children, defaultExpanded = false, titleEnd }) {
  const [isOpen, setIsOpen] = useStateByElement(title, !!defaultExpanded);
  const ref = useRef3(null);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  const id = useId3();
  const labelId = `label-${id}`;
  const contentId = `content-${id}`;
  const isUsingTitleEnd = isExperimentActive4(EXPERIMENTAL_FEATURES.V_3_30);
  return /* @__PURE__ */ React17.createElement(React17.Fragment, null, /* @__PURE__ */ React17.createElement(
    ListItemButton,
    {
      id: labelId,
      "aria-controls": contentId,
      onClick: handleClick,
      sx: { "&:hover": { backgroundColor: "transparent" } }
    },
    /* @__PURE__ */ React17.createElement(Stack5, { direction: "row", alignItems: "center", justifyItems: "start", flexGrow: 1, gap: 0.5 }, /* @__PURE__ */ React17.createElement(
      ListItemText,
      {
        secondary: title,
        secondaryTypographyProps: { color: "text.primary", variant: "caption", fontWeight: "bold" },
        sx: { flexGrow: 0, flexShrink: 1, marginInlineEnd: 1 }
      }
    ), isUsingTitleEnd ? getCollapsibleValue(titleEnd, isOpen) : null),
    /* @__PURE__ */ React17.createElement(CollapseIcon, { open: isOpen, color: "secondary", fontSize: "tiny" })
  ), /* @__PURE__ */ React17.createElement(Collapse2, { id: contentId, "aria-labelledby": labelId, in: isOpen, timeout: "auto", unmountOnExit: true }, /* @__PURE__ */ React17.createElement(SectionRefContext.Provider, { value: ref }, /* @__PURE__ */ React17.createElement(Stack5, { ref, gap: 2.5, p: 2 }, children))), /* @__PURE__ */ React17.createElement(Divider2, null));
}

// src/components/sections-list.tsx
import * as React18 from "react";
import { List } from "@elementor/ui";
function SectionsList(props) {
  return /* @__PURE__ */ React18.createElement(List, { disablePadding: true, component: "div", ...props });
}

// src/components/settings-tab.tsx
var SettingsTab = () => {
  const { elementType, element } = useElement();
  const settingsDefault = useDefaultPanelSettings();
  const isDefaultExpanded = (sectionId) => isExperimentActive5(EXPERIMENTAL_FEATURES.V_3_30) ? settingsDefault.defaultSectionsExpanded.settings?.includes(sectionId) : true;
  return /* @__PURE__ */ React19.createElement(SessionStorageProvider, { prefix: element.id }, /* @__PURE__ */ React19.createElement(SectionsList, null, elementType.controls.map(({ type, value }, index) => {
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
  if (layout === "custom") {
    controlProps.label = control.label;
  }
  return /* @__PURE__ */ React19.createElement(SettingsField, { bind: control.bind, propDisplayName: control.label || control.bind }, control.meta?.topDivider && /* @__PURE__ */ React19.createElement(Divider3, null), /* @__PURE__ */ React19.createElement(ControlTypeContainer, { layout }, control.label && layout !== "custom" ? /* @__PURE__ */ React19.createElement(ControlFormLabel, null, control.label) : null, /* @__PURE__ */ React19.createElement(Control, { type: control.type, props: controlProps })));
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
import * as React84 from "react";
import { useState as useState12 } from "react";
import { CLASSES_PROP_KEY } from "@elementor/editor-props";
import { useActiveBreakpoint } from "@elementor/editor-responsive";
import { SessionStorageProvider as SessionStorageProvider2 } from "@elementor/session";
import { Divider as Divider5, Stack as Stack14 } from "@elementor/ui";
import { __ as __60 } from "@wordpress/i18n";

// src/contexts/styles-inheritance-context.tsx
import * as React20 from "react";
import { createContext as createContext8, useContext as useContext8 } from "react";
import { getWidgetsCache, useElementSetting as useElementSetting2 } from "@elementor/editor-elements";
import { classesPropTypeUtil as classesPropTypeUtil2 } from "@elementor/editor-props";
import { getBreakpointsTree } from "@elementor/editor-responsive";
import { getStylesSchema } from "@elementor/editor-styles";
import { stylesRepository as stylesRepository5 } from "@elementor/editor-styles-repository";

// src/hooks/use-styles-rerender.ts
import { useEffect as useEffect2, useReducer } from "react";
var useStylesRerender = () => {
  const { provider } = useStyle();
  const [, reRender] = useReducer((p) => !p, false);
  useEffect2(() => provider?.subscribe(reRender), [provider]);
};

// src/styles-inheritance/create-styles-inheritance.ts
import {
  isEmpty,
  isTransformable
} from "@elementor/editor-props";

// src/styles-inheritance/create-snapshots-manager.ts
import { filterEmptyValues } from "@elementor/editor-props";

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
      const filteredValue = filterEmptyValues(value);
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
        })).filter(({ value: styleValue }) => !isEmpty(styleValue));
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
    if (isTransformable(currentScope)) {
      return currentScope.value?.[key] ?? null;
    }
    if (typeof currentScope === "object") {
      return currentScope[key] ?? null;
    }
    return null;
  }, value);
}
function shouldUseOriginalValue(filterPropType, value) {
  return !!filterPropType && isTransformable(value) && filterPropType.key !== value.$$type;
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
var Context4 = createContext8(null);
function StyleInheritanceProvider({ children }) {
  const styleDefs = useAppliedStyles();
  const breakpointsTree = getBreakpointsTree();
  const { getSnapshot, getInheritanceChain } = createStylesInheritance(styleDefs, breakpointsTree);
  return /* @__PURE__ */ React20.createElement(Context4.Provider, { value: { getSnapshot, getInheritanceChain } }, children);
}
function useStylesInheritanceSnapshot() {
  const context = useContext8(Context4);
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
  const context = useContext8(Context4);
  if (!context) {
    throw new Error("useStylesInheritanceChain must be used within a StyleInheritanceProvider");
  }
  const schema = getStylesSchema();
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
  const classesProp = useElementSetting2(element.id, currentClassesProp);
  const appliedStyles = classesPropTypeUtil2.extract(classesProp) ?? [];
  return stylesRepository5.all().filter((style) => [...baseStyles, ...appliedStyles].includes(style.id));
};
var useBaseStyles = () => {
  const { elementType } = useElement();
  const widgetsCache = getWidgetsCache();
  const widgetCache = widgetsCache?.[elementType.key];
  return Object.keys(widgetCache?.base_styles ?? {});
};

// src/hooks/use-active-style-def-id.ts
import { getElementStyles, useElementSetting as useElementSetting3 } from "@elementor/editor-elements";
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
  const stylesDefs = getElementStyles(element.id) ?? {};
  return Object.values(stylesDefs).find((styleDef) => appliedClassesIds.includes(styleDef.id));
}
function useAppliedClassesIds(classProp) {
  const { element } = useElement();
  return useElementSetting3(element.id, classProp);
}
function useActiveAndAppliedClassId(id, appliedClassesIds) {
  const isClassApplied = !!id && appliedClassesIds.includes(id);
  return isClassApplied ? id : null;
}

// src/components/style-sections/background-section/background-section.tsx
import * as React29 from "react";
import { BackgroundControl } from "@elementor/editor-controls";
import { __ as __12 } from "@wordpress/i18n";

// src/controls-registry/styles-field.tsx
import * as React27 from "react";
import { ControlAdornmentsProvider, PropKeyProvider as PropKeyProvider2, PropProvider as PropProvider2 } from "@elementor/editor-controls";
import { getStylesSchema as getStylesSchema2 } from "@elementor/editor-styles";
import { isExperimentActive as isExperimentActive9 } from "@elementor/editor-v1-adapters";

// src/hooks/use-styles-fields.ts
import { useMemo as useMemo4 } from "react";
import { createElementStyle, deleteElementStyle, getElementLabel as getElementLabel3 } from "@elementor/editor-elements";
import { getVariantByMeta } from "@elementor/editor-styles";
import { isElementsStylesProvider as isElementsStylesProvider3 } from "@elementor/editor-styles-repository";
import { ELEMENTS_STYLES_RESERVED_LABEL } from "@elementor/editor-styles-repository";
import { isExperimentActive as isExperimentActive6, undoable as undoable3 } from "@elementor/editor-v1-adapters";
import { __ as __7 } from "@wordpress/i18n";
function useStylesFields(propNames) {
  const {
    element: { id: elementId }
  } = useElement();
  const { id: styleId, meta, provider, canEdit } = useStyle();
  const undoableUpdateStyle = useUndoableUpdateStyle({ elementId, meta });
  const undoableCreateElementStyle = useUndoableCreateElementStyle({ elementId, meta });
  useStylesRerender();
  const values = getProps({ elementId, styleId, provider, meta, propNames });
  const setValues = (props, { history: { propDisplayName } }) => {
    if (styleId === null) {
      undoableCreateElementStyle({ props, propDisplayName });
    } else {
      undoableUpdateStyle({ provider, styleId, props, propDisplayName });
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
  const variant = getVariantByMeta(style, meta);
  return Object.fromEntries(
    propNames.map((key) => [key, variant?.props[key] ?? null])
  );
}
function useUndoableCreateElementStyle({
  elementId,
  meta
}) {
  const classesProp = useClassesProp();
  return useMemo4(() => {
    const isVersion331Active = isExperimentActive6(EXPERIMENTAL_FEATURES.V_3_31);
    const createStyleArgs = { elementId, classesProp, meta, label: ELEMENTS_STYLES_RESERVED_LABEL };
    return undoable3(
      {
        do: ({ props }) => {
          return createElementStyle({ ...createStyleArgs, props });
        },
        undo: (_, styleId) => {
          deleteElementStyle(elementId, styleId);
        },
        redo: ({ props }, styleId) => {
          return createElementStyle({ ...createStyleArgs, props, styleId });
        }
      },
      {
        title: () => {
          if (isVersion331Active) {
            return localStyleHistoryTitlesV331.title({ elementId });
          }
          return historyTitlesV330.title({ elementId });
        },
        subtitle: ({ propDisplayName }) => {
          if (isVersion331Active) {
            return localStyleHistoryTitlesV331.subtitle({ propDisplayName });
          }
          return historyTitlesV330.subtitle;
        }
      }
    );
  }, [classesProp, elementId, meta]);
}
function useUndoableUpdateStyle({
  elementId,
  meta
}) {
  return useMemo4(() => {
    const isVersion331Active = isExperimentActive6(EXPERIMENTAL_FEATURES.V_3_31);
    return undoable3(
      {
        do: ({ provider, styleId, props }) => {
          if (!provider.actions.updateProps) {
            throw new StylesProviderCannotUpdatePropsError({
              context: { providerKey: provider.getKey() }
            });
          }
          const style = provider.actions.get(styleId, { elementId });
          const prevProps = getCurrentProps(style, meta);
          provider.actions.updateProps({ id: styleId, meta, props }, { elementId });
          return prevProps;
        },
        undo: ({ provider, styleId }, prevProps) => {
          provider.actions.updateProps?.({ id: styleId, meta, props: prevProps }, { elementId });
        }
      },
      {
        title: ({ provider }) => {
          if (isVersion331Active) {
            const isLocal = isElementsStylesProvider3(provider.getKey());
            if (isLocal) {
              return localStyleHistoryTitlesV331.title({ elementId });
            }
            return defaultHistoryTitlesV331.title({ provider });
          }
          return historyTitlesV330.title({ elementId });
        },
        subtitle: ({ provider, styleId, propDisplayName }) => {
          if (isVersion331Active) {
            const isLocal = isElementsStylesProvider3(provider.getKey());
            if (isLocal) {
              return localStyleHistoryTitlesV331.subtitle({ propDisplayName });
            }
            return defaultHistoryTitlesV331.subtitle({ provider, styleId, elementId, propDisplayName });
          }
          return historyTitlesV330.subtitle;
        }
      }
    );
  }, [elementId, meta]);
}
function getCurrentProps(style, meta) {
  if (!style) {
    return {};
  }
  const variant = getVariantByMeta(style, meta);
  const props = variant?.props ?? {};
  return structuredClone(props);
}
var historyTitlesV330 = {
  title: ({ elementId }) => getElementLabel3(elementId),
  subtitle: __7("Style edited", "elementor")
};
var defaultHistoryTitlesV331 = {
  title: ({ provider }) => {
    const providerLabel = provider.labels?.singular;
    return providerLabel ? capitalize(providerLabel) : __7("Style", "elementor");
  },
  subtitle: ({ provider, styleId, elementId, propDisplayName }) => {
    const styleLabel = provider.actions.get(styleId, { elementId })?.label;
    if (!styleLabel) {
      throw new Error(`Style ${styleId} not found`);
    }
    return __7(`%s$1 %s$2 edited`, "elementor").replace("%s$1", styleLabel).replace("%s$2", propDisplayName);
  }
};
var localStyleHistoryTitlesV331 = {
  title: ({ elementId }) => getElementLabel3(elementId),
  subtitle: ({ propDisplayName }) => (
    // translators: %s is the name of the style property being edited
    __7(`%s edited`, "elementor").replace("%s", propDisplayName)
  )
};
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// src/hooks/use-styles-field.ts
function useStylesField(propName, meta) {
  const { values, setValues, canEdit } = useStylesFields([propName]);
  const value = values?.[propName] ?? null;
  const setValue = (newValue) => {
    setValues({ [propName]: newValue }, meta);
  };
  return { value, setValue, canEdit };
}

// src/styles-inheritance/components/styles-inheritance-indicator.tsx
import * as React26 from "react";
import { useBoundProp } from "@elementor/editor-controls";
import { isEmpty as isEmpty2 } from "@elementor/editor-props";
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY as ELEMENTS_BASE_STYLES_PROVIDER_KEY4 } from "@elementor/editor-styles-repository";
import { isExperimentActive as isExperimentActive8 } from "@elementor/editor-v1-adapters";
import { Tooltip as Tooltip6 } from "@elementor/ui";
import { __ as __11 } from "@wordpress/i18n";

// src/styles-inheritance/consts.ts
import { isExperimentActive as isExperimentActive7 } from "@elementor/editor-v1-adapters";
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
var isUsingIndicatorPopover = () => isExperimentActive7("e_v_3_30");

// src/styles-inheritance/components/styles-inheritance-infotip.tsx
import * as React25 from "react";
import { useMemo as useMemo5, useState as useState9 } from "react";
import { createPropsResolver } from "@elementor/editor-canvas";
import { PopoverHeader } from "@elementor/editor-ui";
import {
  Backdrop,
  Box as Box6,
  Card,
  CardContent,
  ClickAwayListener,
  IconButton as IconButton3,
  Infotip,
  Stack as Stack6,
  Tooltip as Tooltip5
} from "@elementor/ui";
import { __ as __10 } from "@wordpress/i18n";

// src/hooks/use-direction.ts
import { useTheme } from "@elementor/ui";

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
  const theme = useTheme();
  const isUiRtl = "rtl" === theme.direction, isSiteRtl = !!getElementorFrontendConfig()?.is_rtl;
  return { isSiteRtl, isUiRtl };
}

// src/styles-inheritance/hooks/use-normalized-inheritance-chain-items.tsx
import { isValidElement, useEffect as useEffect3, useState as useState8 } from "react";
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY as ELEMENTS_BASE_STYLES_PROVIDER_KEY2 } from "@elementor/editor-styles-repository";
import { __ as __8 } from "@wordpress/i18n";
var MAXIMUM_ITEMS = 2;
var useNormalizedInheritanceChainItems = (inheritanceChain, bind, resolve) => {
  const [items3, setItems] = useState8([]);
  useEffect3(() => {
    (async () => {
      const normalizedItems = await Promise.all(
        inheritanceChain.filter(({ style }) => style).map((item, index) => normalizeInheritanceItem(item, index, bind, resolve))
      );
      const validItems = normalizedItems.map((item) => ({
        ...item,
        displayLabel: ELEMENTS_BASE_STYLES_PROVIDER_KEY2 !== item.provider ? item.displayLabel : __8("Base", "elementor")
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
    if (isValidElement(value)) {
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
import { createTransformersRegistry } from "@elementor/editor-canvas";
var stylesInheritanceTransformersRegistry = createTransformersRegistry();

// src/styles-inheritance/components/infotip/breakpoint-icon.tsx
import * as React21 from "react";
import { useBreakpoints } from "@elementor/editor-responsive";
import {
  DesktopIcon,
  LaptopIcon,
  MobileLandscapeIcon,
  MobilePortraitIcon,
  TabletLandscapeIcon,
  TabletPortraitIcon,
  WidescreenIcon
} from "@elementor/icons";
import { Tooltip as Tooltip3 } from "@elementor/ui";
var SIZE3 = "tiny";
var DEFAULT_BREAKPOINT3 = "desktop";
var breakpointIconMap = {
  widescreen: WidescreenIcon,
  desktop: DesktopIcon,
  laptop: LaptopIcon,
  tablet_extra: TabletLandscapeIcon,
  tablet: TabletPortraitIcon,
  mobile_extra: MobileLandscapeIcon,
  mobile: MobilePortraitIcon
};
var BreakpointIcon = ({ breakpoint }) => {
  const breakpoints = useBreakpoints();
  const currentBreakpoint = breakpoint || DEFAULT_BREAKPOINT3;
  const IconComponent = breakpointIconMap[currentBreakpoint];
  if (!IconComponent) {
    return null;
  }
  const breakpointLabel = breakpoints.find((breakpointItem) => breakpointItem.id === currentBreakpoint)?.label;
  return /* @__PURE__ */ React21.createElement(Tooltip3, { title: breakpointLabel, placement: "top" }, /* @__PURE__ */ React21.createElement(IconComponent, { fontSize: SIZE3, sx: { mt: "2px" } }));
};

// src/styles-inheritance/components/infotip/label-chip.tsx
import * as React22 from "react";
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY as ELEMENTS_BASE_STYLES_PROVIDER_KEY3 } from "@elementor/editor-styles-repository";
import { InfoCircleIcon } from "@elementor/icons";
import { Chip as Chip4, Tooltip as Tooltip4 } from "@elementor/ui";
import { __ as __9 } from "@wordpress/i18n";
var SIZE4 = "tiny";
var LabelChip = ({ displayLabel, provider }) => {
  const isBaseStyle = provider === ELEMENTS_BASE_STYLES_PROVIDER_KEY3;
  const chipIcon = isBaseStyle ? /* @__PURE__ */ React22.createElement(Tooltip4, { title: __9("Inherited from base styles", "elementor"), placement: "top" }, /* @__PURE__ */ React22.createElement(InfoCircleIcon, { fontSize: SIZE4 })) : void 0;
  return /* @__PURE__ */ React22.createElement(
    Chip4,
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
import * as React23 from "react";
import { Typography as Typography4 } from "@elementor/ui";
var ValueComponent = ({ index, value }) => {
  return /* @__PURE__ */ React23.createElement(
    Typography4,
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
import * as React24 from "react";
import { Box as Box5 } from "@elementor/ui";
var ActionIcons = () => /* @__PURE__ */ React24.createElement(Box5, { display: "flex", gap: 0.5, alignItems: "center" });

// src/styles-inheritance/components/styles-inheritance-infotip.tsx
var SECTION_PADDING_INLINE = 32;
var StylesInheritanceInfotip = ({ inheritanceChain, propType, path, label, children }) => {
  const [showInfotip, setShowInfotip] = useState9(false);
  const toggleInfotip = () => setShowInfotip((prev) => !prev);
  const closeInfotip = () => setShowInfotip(false);
  const key = path.join(".");
  const sectionWidth = useSectionWidth() + SECTION_PADDING_INLINE;
  const resolve = useMemo5(() => {
    return createPropsResolver({
      transformers: stylesInheritanceTransformersRegistry,
      schema: { [key]: propType }
    });
  }, [key, propType]);
  const items3 = useNormalizedInheritanceChainItems(inheritanceChain, key, resolve);
  const infotipContent = /* @__PURE__ */ React25.createElement(ClickAwayListener, { onClickAway: closeInfotip }, /* @__PURE__ */ React25.createElement(
    Card,
    {
      elevation: 0,
      sx: {
        width: `${sectionWidth - SECTION_PADDING_INLINE}px`,
        maxWidth: 496,
        overflowX: "hidden"
      }
    },
    /* @__PURE__ */ React25.createElement(
      CardContent,
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
      /* @__PURE__ */ React25.createElement(PopoverHeader, { title: __10("Style origin", "elementor"), onClose: closeInfotip }),
      /* @__PURE__ */ React25.createElement(
        Stack6,
        {
          gap: 1.5,
          sx: { pl: 2, pr: 1, pb: 2, overflowX: "hidden", overflowY: "auto" },
          role: "list"
        },
        items3.map((item, index) => {
          return /* @__PURE__ */ React25.createElement(
            Box6,
            {
              key: item.id,
              display: "flex",
              gap: 0.5,
              role: "listitem",
              "aria-label": __10("Inheritance item: %s", "elementor").replace(
                "%s",
                item.displayLabel
              )
            },
            /* @__PURE__ */ React25.createElement(Box6, { display: "flex", gap: 0.5, sx: { flexWrap: "wrap", width: "100%" } }, /* @__PURE__ */ React25.createElement(BreakpointIcon, { breakpoint: item.breakpoint }), /* @__PURE__ */ React25.createElement(LabelChip, { displayLabel: item.displayLabel, provider: item.provider }), /* @__PURE__ */ React25.createElement(ValueComponent, { index, value: item.value })),
            /* @__PURE__ */ React25.createElement(ActionIcons, null)
          );
        })
      )
    )
  ));
  return /* @__PURE__ */ React25.createElement(TooltipOrInfotip, { showInfotip, onClose: closeInfotip, infotipContent }, /* @__PURE__ */ React25.createElement(IconButton3, { onClick: toggleInfotip, "aria-label": label, sx: { my: "-1px" } }, children));
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
      Backdrop,
      {
        open: showInfotip,
        onClick: onClose,
        sx: {
          backgroundColor: "transparent",
          zIndex: (theme) => theme.zIndex.modal - 1
        }
      }
    ), /* @__PURE__ */ React25.createElement(
      Infotip,
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
  return /* @__PURE__ */ React25.createElement(Tooltip5, { title: __10("Style origin", "elementor"), placement: "top" }, children);
}

// src/styles-inheritance/components/styles-inheritance-indicator.tsx
var StylesInheritanceIndicator = () => {
  const { path, propType } = useBoundProp();
  const isUsingNestedProps = isExperimentActive8(EXPERIMENTAL_FEATURES.V_3_30);
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
  const hasValue = !isEmpty2(currentItem?.value);
  const [actualStyle] = inheritanceChain;
  if (!isExperimentActive8(EXPERIMENTAL_FEATURES.V_3_31) && actualStyle.provider === ELEMENTS_BASE_STYLES_PROVIDER_KEY4) {
    return null;
  }
  const isFinalValue = currentItem === actualStyle;
  const label = getLabel({ isFinalValue, hasValue });
  const styleIndicatorProps = {
    getColor: isFinalValue && currentStyleProvider ? getStylesProviderThemeColor(currentStyleProvider.getKey()) : void 0,
    isOverridden: hasValue && !isFinalValue ? true : void 0
  };
  if (!isUsingIndicatorPopover()) {
    return /* @__PURE__ */ React26.createElement(Tooltip6, { title: __11("Style origin", "elementor"), placement: "top" }, /* @__PURE__ */ React26.createElement(StyleIndicator, { ...styleIndicatorProps, "aria-label": label }));
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
    return __11("This is the final value", "elementor");
  }
  if (hasValue) {
    return __11("This value is overridden by another style", "elementor");
  }
  return __11("This has value from another style", "elementor");
};

// src/controls-registry/styles-field.tsx
var StylesField = ({ bind, placeholder, propDisplayName, children }) => {
  const { value, setValue, canEdit } = useStylesField(bind, {
    history: { propDisplayName }
  });
  const isVersion331Active = isExperimentActive9("e_v_3_31");
  const stylesInheritanceChain = useStylesInheritanceChain([bind]);
  const stylesSchema = getStylesSchema2();
  const propType = createTopLevelOjectType({ schema: stylesSchema });
  const values = { [bind]: value };
  const [actualValue] = stylesInheritanceChain;
  const placeholderValues = {
    [bind]: isVersion331Active ? actualValue?.value : placeholder
  };
  const setValues = (newValue) => {
    setValue(newValue[bind]);
  };
  return /* @__PURE__ */ React27.createElement(
    ControlAdornmentsProvider,
    {
      items: [
        {
          id: "styles-inheritance",
          Adornment: StylesInheritanceIndicator
        }
      ]
    },
    /* @__PURE__ */ React27.createElement(
      PropProvider2,
      {
        propType,
        value: values,
        setValue: setValues,
        placeholder: placeholderValues,
        isDisabled: () => !canEdit
      },
      /* @__PURE__ */ React27.createElement(PropKeyProvider2, { bind }, children)
    )
  );
};

// src/components/section-content.tsx
import * as React28 from "react";
import { Stack as Stack7 } from "@elementor/ui";
var SectionContent = ({ gap = 2, sx, children }) => /* @__PURE__ */ React28.createElement(Stack7, { gap, sx: { ...sx } }, children);

// src/components/style-sections/background-section/background-section.tsx
var BACKGROUND_LABEL = __12("Background", "elementor");
var BackgroundSection = () => {
  return /* @__PURE__ */ React29.createElement(SectionContent, null, /* @__PURE__ */ React29.createElement(StylesField, { bind: "background", propDisplayName: BACKGROUND_LABEL }, /* @__PURE__ */ React29.createElement(BackgroundControl, null)));
};

// src/components/style-sections/border-section/border-section.tsx
import * as React40 from "react";

// src/components/panel-divider.tsx
import * as React30 from "react";
import { Divider as Divider4 } from "@elementor/ui";
var PanelDivider = () => /* @__PURE__ */ React30.createElement(Divider4, { sx: { my: 0.5 } });

// src/components/style-sections/border-section/border-field.tsx
import * as React37 from "react";
import { ControlFormLabel as ControlFormLabel3 } from "@elementor/editor-controls";
import { __ as __16 } from "@wordpress/i18n";

// src/components/add-or-remove-content.tsx
import * as React31 from "react";
import { MinusIcon, PlusIcon } from "@elementor/icons";
import { Collapse as Collapse3, IconButton as IconButton4, Stack as Stack8 } from "@elementor/ui";
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
    Stack8,
    {
      direction: "row",
      sx: {
        justifyContent: "space-between",
        alignItems: "center",
        marginInlineEnd: -0.75
      }
    },
    renderLabel(),
    isAdded ? /* @__PURE__ */ React31.createElement(IconButton4, { size: SIZE5, onClick: onRemove, "aria-label": "Remove", disabled }, /* @__PURE__ */ React31.createElement(MinusIcon, { fontSize: SIZE5 })) : /* @__PURE__ */ React31.createElement(IconButton4, { size: SIZE5, onClick: onAdd, "aria-label": "Add", disabled }, /* @__PURE__ */ React31.createElement(PlusIcon, { fontSize: SIZE5 }))
  ), /* @__PURE__ */ React31.createElement(Collapse3, { in: isAdded, unmountOnExit: true }, /* @__PURE__ */ React31.createElement(SectionContent, null, children)));
};

// src/components/style-sections/border-section/border-color-field.tsx
import * as React34 from "react";
import { ColorControl } from "@elementor/editor-controls";
import { __ as __13 } from "@wordpress/i18n";

// src/components/styles-field-layout.tsx
import * as React33 from "react";
import { Grid, Stack as Stack10 } from "@elementor/ui";

// src/components/control-label.tsx
import * as React32 from "react";
import { ControlAdornments, ControlFormLabel as ControlFormLabel2 } from "@elementor/editor-controls";
import { Stack as Stack9 } from "@elementor/ui";
var ControlLabel = ({ children }) => {
  return /* @__PURE__ */ React32.createElement(Stack9, { direction: "row", alignItems: "center", justifyItems: "start", gap: 0.25 }, /* @__PURE__ */ React32.createElement(ControlFormLabel2, null, children), /* @__PURE__ */ React32.createElement(ControlAdornments, null));
};

// src/components/styles-field-layout.tsx
var StylesFieldLayout = React33.forwardRef((props, ref) => {
  const { direction = "row", children, label } = props;
  const LayoutComponent = direction === "row" ? Row : Column;
  return /* @__PURE__ */ React33.createElement(LayoutComponent, { label, ref, children });
});
var Row = React33.forwardRef(
  ({ label, children }, ref) => {
    return /* @__PURE__ */ React33.createElement(Grid, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap", ref }, /* @__PURE__ */ React33.createElement(Grid, { item: true, xs: 6 }, /* @__PURE__ */ React33.createElement(ControlLabel, null, label)), /* @__PURE__ */ React33.createElement(
      Grid,
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
    return /* @__PURE__ */ React33.createElement(Stack10, { gap: 0.75, ref }, /* @__PURE__ */ React33.createElement(ControlLabel, null, label), children);
  }
);

// src/components/style-sections/border-section/border-color-field.tsx
var BORDER_COLOR_LABEL = __13("Border color", "elementor");
var BorderColorField = () => /* @__PURE__ */ React34.createElement(StylesField, { bind: "border-color", propDisplayName: BORDER_COLOR_LABEL }, /* @__PURE__ */ React34.createElement(StylesFieldLayout, { label: BORDER_COLOR_LABEL }, /* @__PURE__ */ React34.createElement(ColorControl, null)));

// src/components/style-sections/border-section/border-style-field.tsx
import * as React35 from "react";
import { SelectControl as SelectControl2 } from "@elementor/editor-controls";
import { __ as __14 } from "@wordpress/i18n";
var BORDER_TYPE_LABEL = __14("Border type", "elementor");
var borderStyles = [
  { value: "none", label: __14("None", "elementor") },
  { value: "solid", label: __14("Solid", "elementor") },
  { value: "dashed", label: __14("Dashed", "elementor") },
  { value: "dotted", label: __14("Dotted", "elementor") },
  { value: "double", label: __14("Double", "elementor") },
  { value: "groove", label: __14("Groove", "elementor") },
  { value: "ridge", label: __14("Ridge", "elementor") },
  { value: "inset", label: __14("Inset", "elementor") },
  { value: "outset", label: __14("Outset", "elementor") }
];
var BorderStyleField = () => /* @__PURE__ */ React35.createElement(StylesField, { bind: "border-style", propDisplayName: BORDER_TYPE_LABEL }, /* @__PURE__ */ React35.createElement(StylesFieldLayout, { label: BORDER_TYPE_LABEL }, /* @__PURE__ */ React35.createElement(SelectControl2, { options: borderStyles })));

// src/components/style-sections/border-section/border-width-field.tsx
import * as React36 from "react";
import { EqualUnequalSizesControl } from "@elementor/editor-controls";
import { borderWidthPropTypeUtil } from "@elementor/editor-props";
import { SideAllIcon, SideBottomIcon, SideLeftIcon, SideRightIcon, SideTopIcon } from "@elementor/icons";
import { withDirection } from "@elementor/ui";
import { __ as __15 } from "@wordpress/i18n";
var BORDER_WIDTH_LABEL = __15("Border width", "elementor");
var InlineStartIcon = withDirection(SideRightIcon);
var InlineEndIcon = withDirection(SideLeftIcon);
var getEdges = (isSiteRtl) => [
  {
    label: __15("Top", "elementor"),
    icon: /* @__PURE__ */ React36.createElement(SideTopIcon, { fontSize: "tiny" }),
    bind: "block-start"
  },
  {
    label: isSiteRtl ? __15("Left", "elementor") : __15("Right", "elementor"),
    icon: /* @__PURE__ */ React36.createElement(InlineStartIcon, { fontSize: "tiny" }),
    bind: "inline-end"
  },
  {
    label: __15("Bottom", "elementor"),
    icon: /* @__PURE__ */ React36.createElement(SideBottomIcon, { fontSize: "tiny" }),
    bind: "block-end"
  },
  {
    label: isSiteRtl ? __15("Right", "elementor") : __15("Left", "elementor"),
    icon: /* @__PURE__ */ React36.createElement(InlineEndIcon, { fontSize: "tiny" }),
    bind: "inline-start"
  }
];
var BorderWidthField = () => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React36.createElement(StylesField, { bind: "border-width", propDisplayName: BORDER_WIDTH_LABEL }, /* @__PURE__ */ React36.createElement(
    EqualUnequalSizesControl,
    {
      items: getEdges(isSiteRtl),
      label: BORDER_WIDTH_LABEL,
      icon: /* @__PURE__ */ React36.createElement(SideAllIcon, { fontSize: "tiny" }),
      tooltipLabel: __15("Adjust borders", "elementor"),
      multiSizePropTypeUtil: borderWidthPropTypeUtil
    }
  ));
};

// src/components/style-sections/border-section/border-field.tsx
var BORDER_LABEL = __16("Border", "elementor");
var initialBorder = {
  "border-width": { $$type: "size", value: { size: 1, unit: "px" } },
  "border-color": { $$type: "color", value: "#000000" },
  "border-style": { $$type: "string", value: "solid" }
};
var BorderField = () => {
  const { values, setValues, canEdit } = useStylesFields(Object.keys(initialBorder));
  const meta = { history: { propDisplayName: BORDER_LABEL } };
  const addBorder = () => {
    setValues(initialBorder, meta);
  };
  const removeBorder = () => {
    setValues(
      {
        "border-width": null,
        "border-color": null,
        "border-style": null
      },
      meta
    );
  };
  const hasBorder = Object.values(values ?? {}).some(Boolean);
  return /* @__PURE__ */ React37.createElement(
    AddOrRemoveContent,
    {
      isAdded: hasBorder,
      onAdd: addBorder,
      onRemove: removeBorder,
      disabled: !canEdit,
      renderLabel: () => /* @__PURE__ */ React37.createElement(ControlFormLabel3, null, BORDER_LABEL)
    },
    /* @__PURE__ */ React37.createElement(BorderWidthField, null),
    /* @__PURE__ */ React37.createElement(BorderColorField, null),
    /* @__PURE__ */ React37.createElement(BorderStyleField, null)
  );
};

// src/components/style-sections/border-section/border-radius-field.tsx
import * as React39 from "react";
import { EqualUnequalSizesControl as EqualUnequalSizesControl2 } from "@elementor/editor-controls";
import { borderRadiusPropTypeUtil } from "@elementor/editor-props";
import {
  BorderCornersIcon,
  RadiusBottomLeftIcon,
  RadiusBottomRightIcon,
  RadiusTopLeftIcon,
  RadiusTopRightIcon
} from "@elementor/icons";
import { withDirection as withDirection2 } from "@elementor/ui";
import { __ as __17 } from "@wordpress/i18n";

// src/styles-inheritance/components/ui-providers.tsx
import * as React38 from "react";
import { DirectionProvider, ThemeProvider } from "@elementor/ui";
var UiProviders = ({ children }) => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React38.createElement(DirectionProvider, { rtl: isSiteRtl }, /* @__PURE__ */ React38.createElement(ThemeProvider, null, children));
};

// src/components/style-sections/border-section/border-radius-field.tsx
var BORDER_RADIUS_LABEL = __17("Border radius", "elementor");
var StartStartIcon = withDirection2(RadiusTopLeftIcon);
var StartEndIcon = withDirection2(RadiusTopRightIcon);
var EndStartIcon = withDirection2(RadiusBottomLeftIcon);
var EndEndIcon = withDirection2(RadiusBottomRightIcon);
var getStartStartLabel = (isSiteRtl) => isSiteRtl ? __17("Top right", "elementor") : __17("Top left", "elementor");
var getStartEndLabel = (isSiteRtl) => isSiteRtl ? __17("Top left", "elementor") : __17("Top right", "elementor");
var getEndStartLabel = (isSiteRtl) => isSiteRtl ? __17("Bottom right", "elementor") : __17("Bottom left", "elementor");
var getEndEndLabel = (isSiteRtl) => isSiteRtl ? __17("Bottom left", "elementor") : __17("Bottom right", "elementor");
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
    EqualUnequalSizesControl2,
    {
      items: getCorners(isSiteRtl),
      label: BORDER_RADIUS_LABEL,
      icon: /* @__PURE__ */ React39.createElement(BorderCornersIcon, { fontSize: "tiny" }),
      tooltipLabel: __17("Adjust corners", "elementor"),
      multiSizePropTypeUtil: borderRadiusPropTypeUtil
    }
  )));
};

// src/components/style-sections/border-section/border-section.tsx
var BorderSection = () => /* @__PURE__ */ React40.createElement(SectionContent, null, /* @__PURE__ */ React40.createElement(BorderRadiusField, null), /* @__PURE__ */ React40.createElement(PanelDivider, null), /* @__PURE__ */ React40.createElement(BorderField, null));

// src/components/style-sections/effects-section/effects-section.tsx
import * as React42 from "react";
import { BoxShadowRepeaterControl, FilterRepeaterControl } from "@elementor/editor-controls";
import { isExperimentActive as isExperimentActive10 } from "@elementor/editor-v1-adapters";
import { __ as __19 } from "@wordpress/i18n";

// src/components/style-sections/layout-section/opacity-control-field.tsx
import * as React41 from "react";
import { useRef as useRef4 } from "react";
import { SizeControl as SizeControl2 } from "@elementor/editor-controls";
import { __ as __18 } from "@wordpress/i18n";
var OPACITY_LABEL = __18("Opacity", "elementor");
var OpacityControlField = () => {
  const rowRef = useRef4(null);
  return /* @__PURE__ */ React41.createElement(StylesField, { bind: "opacity", propDisplayName: OPACITY_LABEL }, /* @__PURE__ */ React41.createElement(StylesFieldLayout, { ref: rowRef, label: OPACITY_LABEL }, /* @__PURE__ */ React41.createElement(SizeControl2, { units: ["%"], anchorRef: rowRef, defaultUnit: "%" })));
};

// src/components/style-sections/effects-section/effects-section.tsx
var BOX_SHADOW_LABEL = __19("Box shadow", "elementor");
var FILTER_LABEL = __19("Filter", "elementor");
var EffectsSection = () => {
  const isVersion331Active = isExperimentActive10(EXPERIMENTAL_FEATURES.V_3_31);
  return /* @__PURE__ */ React42.createElement(SectionContent, null, /* @__PURE__ */ React42.createElement(OpacityControlField, null), /* @__PURE__ */ React42.createElement(PanelDivider, null), /* @__PURE__ */ React42.createElement(StylesField, { bind: "box-shadow", propDisplayName: BOX_SHADOW_LABEL }, /* @__PURE__ */ React42.createElement(BoxShadowRepeaterControl, null)), isVersion331Active && /* @__PURE__ */ React42.createElement(React42.Fragment, null, /* @__PURE__ */ React42.createElement(PanelDivider, null), /* @__PURE__ */ React42.createElement(StylesField, { bind: "filter", propDisplayName: FILTER_LABEL }, /* @__PURE__ */ React42.createElement(FilterRepeaterControl, null))));
};

// src/components/style-sections/layout-section/layout-section.tsx
import * as React54 from "react";
import { ControlFormLabel as ControlFormLabel4 } from "@elementor/editor-controls";
import { useParentElement } from "@elementor/editor-elements";
import { __ as __31 } from "@wordpress/i18n";

// src/hooks/use-computed-style.ts
import { __privateUseListenTo as useListenTo, commandEndEvent, windowEvent } from "@elementor/editor-v1-adapters";
function useComputedStyle(elementId) {
  return useListenTo(
    [
      windowEvent("elementor/device-mode/change"),
      commandEndEvent("document/elements/reset-style"),
      commandEndEvent("document/elements/settings"),
      commandEndEvent("document/elements/paste-style")
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
import * as React44 from "react";
import { ToggleControl } from "@elementor/editor-controls";
import {
  JustifyBottomIcon,
  JustifyCenterIcon as CenterIcon,
  JustifyDistributeVerticalIcon as EvenlyIcon,
  JustifySpaceAroundVerticalIcon as AroundIcon,
  JustifySpaceBetweenVerticalIcon as BetweenIcon,
  JustifyTopIcon
} from "@elementor/icons";
import { withDirection as withDirection3 } from "@elementor/ui";
import { __ as __21 } from "@wordpress/i18n";

// src/components/style-sections/layout-section/utils/rotated-icon.tsx
import * as React43 from "react";
import { useRef as useRef5 } from "react";
import { useTheme as useTheme2 } from "@elementor/ui";
import { __ as __20 } from "@wordpress/i18n";
var FLEX_DIRECTION_LABEL = __20("Flex direction", "elementor");
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
  const rotate = useRef5(useGetTargetAngle(isClockwise, offset, disableRotationForReversed));
  rotate.current = useGetTargetAngle(isClockwise, offset, disableRotationForReversed, rotate);
  return /* @__PURE__ */ React43.createElement(Icon, { fontSize: size, sx: { transition: ".3s", rotate: `${rotate.current}deg` } });
};
var useGetTargetAngle = (isClockwise, offset, disableRotationForReversed, existingRef) => {
  const { value: direction } = useStylesField("flex-direction", {
    history: { propDisplayName: FLEX_DIRECTION_LABEL }
  });
  const isRtl = "rtl" === useTheme2().direction;
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
var ALIGN_CONTENT_LABEL = __21("Align content", "elementor");
var StartIcon = withDirection3(JustifyTopIcon);
var EndIcon = withDirection3(JustifyBottomIcon);
var iconProps = {
  isClockwise: false,
  offset: 0,
  disableRotationForReversed: true
};
var options = [
  {
    value: "start",
    label: __21("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: StartIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "center",
    label: __21("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: CenterIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "end",
    label: __21("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: EndIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-between",
    label: __21("Space between", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: BetweenIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-around",
    label: __21("Space around", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: AroundIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-evenly",
    label: __21("Space evenly", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(RotatedIcon, { icon: EvenlyIcon, size, ...iconProps }),
    showTooltip: true
  }
];
var AlignContentField = () => /* @__PURE__ */ React44.createElement(StylesField, { bind: "align-content", propDisplayName: ALIGN_CONTENT_LABEL }, /* @__PURE__ */ React44.createElement(UiProviders, null, /* @__PURE__ */ React44.createElement(StylesFieldLayout, { label: ALIGN_CONTENT_LABEL, direction: "column" }, /* @__PURE__ */ React44.createElement(ToggleControl, { options, fullWidth: true }))));

// src/components/style-sections/layout-section/align-items-field.tsx
import * as React45 from "react";
import { ToggleControl as ToggleControl2 } from "@elementor/editor-controls";
import {
  LayoutAlignCenterIcon as CenterIcon2,
  LayoutAlignLeftIcon,
  LayoutAlignRightIcon,
  LayoutDistributeVerticalIcon as JustifyIcon
} from "@elementor/icons";
import { withDirection as withDirection4 } from "@elementor/ui";
import { __ as __22 } from "@wordpress/i18n";
var ALIGN_ITEMS_LABEL = __22("Align items", "elementor");
var StartIcon2 = withDirection4(LayoutAlignLeftIcon);
var EndIcon2 = withDirection4(LayoutAlignRightIcon);
var iconProps2 = {
  isClockwise: false,
  offset: 90
};
var options2 = [
  {
    value: "start",
    label: __22("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(RotatedIcon, { icon: StartIcon2, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "center",
    label: __22("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(RotatedIcon, { icon: CenterIcon2, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "end",
    label: __22("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(RotatedIcon, { icon: EndIcon2, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "stretch",
    label: __22("Stretch", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(RotatedIcon, { icon: JustifyIcon, size, ...iconProps2 }),
    showTooltip: true
  }
];
var AlignItemsField = () => {
  return /* @__PURE__ */ React45.createElement(UiProviders, null, /* @__PURE__ */ React45.createElement(StylesField, { bind: "align-items", propDisplayName: ALIGN_ITEMS_LABEL }, /* @__PURE__ */ React45.createElement(StylesFieldLayout, { label: ALIGN_ITEMS_LABEL }, /* @__PURE__ */ React45.createElement(ToggleControl2, { options: options2 }))));
};

// src/components/style-sections/layout-section/align-self-child-field.tsx
import * as React46 from "react";
import { ToggleControl as ToggleControl3 } from "@elementor/editor-controls";
import {
  LayoutAlignCenterIcon as CenterIcon3,
  LayoutAlignLeftIcon as LayoutAlignLeftIcon2,
  LayoutAlignRightIcon as LayoutAlignRightIcon2,
  LayoutDistributeVerticalIcon as JustifyIcon2
} from "@elementor/icons";
import { withDirection as withDirection5 } from "@elementor/ui";
import { __ as __23 } from "@wordpress/i18n";
var ALIGN_SELF_LABEL = __23("Align self", "elementor");
var ALIGN_SELF_CHILD_OFFSET_MAP = {
  row: 90,
  "row-reverse": 90,
  column: 0,
  "column-reverse": 0
};
var StartIcon3 = withDirection5(LayoutAlignLeftIcon2);
var EndIcon3 = withDirection5(LayoutAlignRightIcon2);
var iconProps3 = {
  isClockwise: false
};
var getOptions = (parentStyleDirection) => [
  {
    value: "start",
    label: __23("Start", "elementor"),
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
    label: __23("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React46.createElement(
      RotatedIcon,
      {
        icon: CenterIcon3,
        size,
        offset: ALIGN_SELF_CHILD_OFFSET_MAP[parentStyleDirection],
        ...iconProps3
      }
    ),
    showTooltip: true
  },
  {
    value: "end",
    label: __23("End", "elementor"),
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
    label: __23("Stretch", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React46.createElement(
      RotatedIcon,
      {
        icon: JustifyIcon2,
        size,
        offset: ALIGN_SELF_CHILD_OFFSET_MAP[parentStyleDirection],
        ...iconProps3
      }
    ),
    showTooltip: true
  }
];
var AlignSelfChild = ({ parentStyleDirection }) => /* @__PURE__ */ React46.createElement(StylesField, { bind: "align-self", propDisplayName: ALIGN_SELF_LABEL }, /* @__PURE__ */ React46.createElement(UiProviders, null, /* @__PURE__ */ React46.createElement(StylesFieldLayout, { label: ALIGN_SELF_LABEL }, /* @__PURE__ */ React46.createElement(ToggleControl3, { options: getOptions(parentStyleDirection) }))));

// src/components/style-sections/layout-section/display-field.tsx
import * as React47 from "react";
import { ToggleControl as ToggleControl4 } from "@elementor/editor-controls";
import { isExperimentActive as isExperimentActive11 } from "@elementor/editor-v1-adapters";
import { __ as __24 } from "@wordpress/i18n";
var DISPLAY_LABEL = __24("Display", "elementor");
var displayFieldItems = [
  {
    value: "block",
    renderContent: () => __24("Block", "elementor"),
    label: __24("Block", "elementor"),
    showTooltip: true
  },
  {
    value: "flex",
    renderContent: () => __24("Flex", "elementor"),
    label: __24("Flex", "elementor"),
    showTooltip: true
  },
  {
    value: "inline-block",
    renderContent: () => __24("In-blk", "elementor"),
    label: __24("Inline-block", "elementor"),
    showTooltip: true
  }
];
var DisplayField = () => {
  const isDisplayNoneFeatureActive = isExperimentActive11(EXPERIMENTAL_FEATURES.V_3_30);
  const items3 = [...displayFieldItems];
  if (isDisplayNoneFeatureActive) {
    items3.push({
      value: "none",
      renderContent: () => __24("None", "elementor"),
      label: __24("None", "elementor"),
      showTooltip: true
    });
  }
  items3.push({
    value: "inline-flex",
    renderContent: () => __24("In-flx", "elementor"),
    label: __24("Inline-flex", "elementor"),
    showTooltip: true
  });
  const placeholder = useDisplayPlaceholderValue();
  return /* @__PURE__ */ React47.createElement(StylesField, { bind: "display", propDisplayName: DISPLAY_LABEL, placeholder }, /* @__PURE__ */ React47.createElement(StylesFieldLayout, { label: DISPLAY_LABEL, direction: "column" }, /* @__PURE__ */ React47.createElement(ToggleControl4, { options: items3, maxItems: 4, fullWidth: true })));
};
var useDisplayPlaceholderValue = () => useStylesInheritanceChain(["display"])[0]?.value ?? void 0;

// src/components/style-sections/layout-section/flex-direction-field.tsx
import * as React48 from "react";
import { ToggleControl as ToggleControl5 } from "@elementor/editor-controls";
import { ArrowDownSmallIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpSmallIcon } from "@elementor/icons";
import { withDirection as withDirection6 } from "@elementor/ui";
import { __ as __25 } from "@wordpress/i18n";
var FLEX_DIRECTION_LABEL2 = __25("Direction", "elementor");
var options3 = [
  {
    value: "row",
    label: __25("Row", "elementor"),
    renderContent: ({ size }) => {
      const StartIcon5 = withDirection6(ArrowRightIcon);
      return /* @__PURE__ */ React48.createElement(StartIcon5, { fontSize: size });
    },
    showTooltip: true
  },
  {
    value: "column",
    label: __25("Column", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(ArrowDownSmallIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "row-reverse",
    label: __25("Reversed row", "elementor"),
    renderContent: ({ size }) => {
      const EndIcon5 = withDirection6(ArrowLeftIcon);
      return /* @__PURE__ */ React48.createElement(EndIcon5, { fontSize: size });
    },
    showTooltip: true
  },
  {
    value: "column-reverse",
    label: __25("Reversed column", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(ArrowUpSmallIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FlexDirectionField = () => {
  return /* @__PURE__ */ React48.createElement(StylesField, { bind: "flex-direction", propDisplayName: FLEX_DIRECTION_LABEL2 }, /* @__PURE__ */ React48.createElement(UiProviders, null, /* @__PURE__ */ React48.createElement(StylesFieldLayout, { label: FLEX_DIRECTION_LABEL2 }, /* @__PURE__ */ React48.createElement(ToggleControl5, { options: options3 }))));
};

// src/components/style-sections/layout-section/flex-order-field.tsx
import * as React49 from "react";
import { useState as useState10 } from "react";
import { ControlToggleButtonGroup, NumberControl } from "@elementor/editor-controls";
import { ArrowDownSmallIcon as ArrowDownSmallIcon2, ArrowUpSmallIcon as ArrowUpSmallIcon2, PencilIcon } from "@elementor/icons";
import { Grid as Grid2 } from "@elementor/ui";
import { __ as __26 } from "@wordpress/i18n";
var ORDER_LABEL = __26("Order", "elementor");
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
    label: __26("First", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React49.createElement(ArrowUpSmallIcon2, { fontSize: size }),
    showTooltip: true
  },
  {
    value: LAST,
    label: __26("Last", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React49.createElement(ArrowDownSmallIcon2, { fontSize: size }),
    showTooltip: true
  },
  {
    value: CUSTOM,
    label: __26("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React49.createElement(PencilIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FlexOrderField = () => {
  const {
    value: order,
    setValue: setOrder,
    canEdit
  } = useStylesField("order", {
    history: { propDisplayName: ORDER_LABEL }
  });
  const [groupControlValue, setGroupControlValue] = useState10(getGroupControlValue(order?.value || null));
  const handleToggleButtonChange = (group) => {
    setGroupControlValue(group);
    if (!group || group === CUSTOM) {
      setOrder(null);
      return;
    }
    setOrder({ $$type: "number", value: orderValueMap[group] });
  };
  return /* @__PURE__ */ React49.createElement(StylesField, { bind: "order", propDisplayName: ORDER_LABEL }, /* @__PURE__ */ React49.createElement(UiProviders, null, /* @__PURE__ */ React49.createElement(StylesFieldLayout, { label: ORDER_LABEL }, /* @__PURE__ */ React49.createElement(SectionContent, null, /* @__PURE__ */ React49.createElement(
    ControlToggleButtonGroup,
    {
      items,
      value: groupControlValue,
      onChange: handleToggleButtonChange,
      exclusive: true,
      disabled: !canEdit
    }
  ), CUSTOM === groupControlValue && /* @__PURE__ */ React49.createElement(Grid2, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React49.createElement(Grid2, { item: true, xs: 6 }, /* @__PURE__ */ React49.createElement(ControlLabel, null, __26("Custom order", "elementor"))), /* @__PURE__ */ React49.createElement(Grid2, { item: true, xs: 6, sx: { display: "flex", justifyContent: "end" } }, /* @__PURE__ */ React49.createElement(
    NumberControl,
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
import * as React50 from "react";
import { useMemo as useMemo6, useRef as useRef6, useState as useState11 } from "react";
import {
  ControlToggleButtonGroup as ControlToggleButtonGroup2,
  NumberControl as NumberControl2,
  SizeControl as SizeControl3
} from "@elementor/editor-controls";
import { numberPropTypeUtil } from "@elementor/editor-props";
import { ExpandIcon, PencilIcon as PencilIcon2, ShrinkIcon } from "@elementor/icons";
import { __ as __27 } from "@wordpress/i18n";
var FLEX_SIZE_LABEL = __27("Flex Size", "elementor");
var DEFAULT = 1;
var items2 = [
  {
    value: "flex-grow",
    label: __27("Grow", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React50.createElement(ExpandIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "flex-shrink",
    label: __27("Shrink", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React50.createElement(ShrinkIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "custom",
    label: __27("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React50.createElement(PencilIcon2, { fontSize: size }),
    showTooltip: true
  }
];
var FlexSizeField = () => {
  const { values, setValues, canEdit } = useStylesFields(["flex-grow", "flex-shrink", "flex-basis"]);
  const grow = values?.["flex-grow"]?.value || null;
  const shrink = values?.["flex-shrink"]?.value || null;
  const basis = values?.["flex-basis"]?.value || null;
  const currentGroup = useMemo6(() => getActiveGroup({ grow, shrink, basis }), [grow, shrink, basis]), [activeGroup, setActiveGroup] = useState11(currentGroup);
  const onChangeGroup = (group = null) => {
    setActiveGroup(group);
    let props;
    if (!group || group === "custom") {
      props = {
        "flex-basis": null,
        "flex-grow": null,
        "flex-shrink": null
      };
    } else if (group === "flex-grow") {
      props = {
        "flex-basis": null,
        "flex-grow": numberPropTypeUtil.create(DEFAULT),
        "flex-shrink": null
      };
    } else {
      props = {
        "flex-basis": null,
        "flex-grow": null,
        "flex-shrink": numberPropTypeUtil.create(DEFAULT)
      };
    }
    setValues(props, { history: { propDisplayName: FLEX_SIZE_LABEL } });
  };
  return /* @__PURE__ */ React50.createElement(UiProviders, null, /* @__PURE__ */ React50.createElement(SectionContent, null, /* @__PURE__ */ React50.createElement(StylesField, { bind: activeGroup ?? "", propDisplayName: FLEX_SIZE_LABEL }, /* @__PURE__ */ React50.createElement(StylesFieldLayout, { label: FLEX_SIZE_LABEL }, /* @__PURE__ */ React50.createElement(
    ControlToggleButtonGroup2,
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
  const flexBasisRowRef = useRef6(null);
  return /* @__PURE__ */ React50.createElement(React50.Fragment, null, /* @__PURE__ */ React50.createElement(StylesField, { bind: "flex-grow", propDisplayName: FLEX_SIZE_LABEL }, /* @__PURE__ */ React50.createElement(StylesFieldLayout, { label: __27("Grow", "elementor") }, /* @__PURE__ */ React50.createElement(NumberControl2, { min: 0, shouldForceInt: true }))), /* @__PURE__ */ React50.createElement(StylesField, { bind: "flex-shrink", propDisplayName: FLEX_SIZE_LABEL }, /* @__PURE__ */ React50.createElement(StylesFieldLayout, { label: __27("Shrink", "elementor") }, /* @__PURE__ */ React50.createElement(NumberControl2, { min: 0, shouldForceInt: true }))), /* @__PURE__ */ React50.createElement(StylesField, { bind: "flex-basis", propDisplayName: FLEX_SIZE_LABEL }, /* @__PURE__ */ React50.createElement(StylesFieldLayout, { label: __27("Basis", "elementor"), ref: flexBasisRowRef }, /* @__PURE__ */ React50.createElement(SizeControl3, { extendedOptions: ["auto"], anchorRef: flexBasisRowRef }))));
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
import * as React51 from "react";
import { GapControl } from "@elementor/editor-controls";
import { __ as __28 } from "@wordpress/i18n";
var GAPS_LABEL = __28("Gaps", "elementor");
var GapControlField = () => {
  return /* @__PURE__ */ React51.createElement(StylesField, { bind: "gap", propDisplayName: GAPS_LABEL }, /* @__PURE__ */ React51.createElement(GapControl, { label: GAPS_LABEL }));
};

// src/components/style-sections/layout-section/justify-content-field.tsx
import * as React52 from "react";
import { ToggleControl as ToggleControl6 } from "@elementor/editor-controls";
import {
  JustifyBottomIcon as JustifyBottomIcon2,
  JustifyCenterIcon as CenterIcon4,
  JustifyDistributeVerticalIcon as EvenlyIcon2,
  JustifySpaceAroundVerticalIcon as AroundIcon2,
  JustifySpaceBetweenVerticalIcon as BetweenIcon2,
  JustifyTopIcon as JustifyTopIcon2
} from "@elementor/icons";
import { withDirection as withDirection7 } from "@elementor/ui";
import { __ as __29 } from "@wordpress/i18n";
var JUSTIFY_CONTENT_LABEL = __29("Justify content", "elementor");
var StartIcon4 = withDirection7(JustifyTopIcon2);
var EndIcon4 = withDirection7(JustifyBottomIcon2);
var iconProps4 = {
  isClockwise: true,
  offset: -90
};
var options4 = [
  {
    value: "flex-start",
    label: __29("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: StartIcon4, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "center",
    label: __29("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: CenterIcon4, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "flex-end",
    label: __29("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: EndIcon4, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-between",
    label: __29("Space between", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: BetweenIcon2, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-around",
    label: __29("Space around", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: AroundIcon2, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-evenly",
    label: __29("Space evenly", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React52.createElement(RotatedIcon, { icon: EvenlyIcon2, size, ...iconProps4 }),
    showTooltip: true
  }
];
var JustifyContentField = () => /* @__PURE__ */ React52.createElement(StylesField, { bind: "justify-content", propDisplayName: JUSTIFY_CONTENT_LABEL }, /* @__PURE__ */ React52.createElement(UiProviders, null, /* @__PURE__ */ React52.createElement(StylesFieldLayout, { label: JUSTIFY_CONTENT_LABEL, direction: "column" }, /* @__PURE__ */ React52.createElement(ToggleControl6, { options: options4, fullWidth: true }))));

// src/components/style-sections/layout-section/wrap-field.tsx
import * as React53 from "react";
import { ToggleControl as ToggleControl7 } from "@elementor/editor-controls";
import { ArrowBackIcon, ArrowForwardIcon, ArrowRightIcon as ArrowRightIcon2 } from "@elementor/icons";
import { __ as __30 } from "@wordpress/i18n";
var FLEX_WRAP_LABEL = __30("Wrap", "elementor");
var options5 = [
  {
    value: "nowrap",
    label: __30("No wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React53.createElement(ArrowRightIcon2, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "wrap",
    label: __30("Wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React53.createElement(ArrowBackIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "wrap-reverse",
    label: __30("Reversed wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React53.createElement(ArrowForwardIcon, { fontSize: size }),
    showTooltip: true
  }
];
var WrapField = () => {
  return /* @__PURE__ */ React53.createElement(StylesField, { bind: "flex-wrap", propDisplayName: FLEX_WRAP_LABEL }, /* @__PURE__ */ React53.createElement(UiProviders, null, /* @__PURE__ */ React53.createElement(StylesFieldLayout, { label: FLEX_WRAP_LABEL }, /* @__PURE__ */ React53.createElement(ToggleControl7, { options: options5 }))));
};

// src/components/style-sections/layout-section/layout-section.tsx
var DISPLAY_LABEL2 = __31("Display", "elementor");
var FLEX_WRAP_LABEL2 = __31("Flex wrap", "elementor");
var LayoutSection = () => {
  const { value: display } = useStylesField("display", {
    history: { propDisplayName: DISPLAY_LABEL2 }
  });
  const displayPlaceholder = useDisplayPlaceholderValue();
  const isDisplayFlex = shouldDisplayFlexFields(display, displayPlaceholder);
  const { element } = useElement();
  const parent = useParentElement(element.id);
  const parentStyle = useComputedStyle(parent?.id || null);
  const parentStyleDirection = parentStyle?.flexDirection ?? "row";
  return /* @__PURE__ */ React54.createElement(SectionContent, null, /* @__PURE__ */ React54.createElement(DisplayField, null), isDisplayFlex && /* @__PURE__ */ React54.createElement(FlexFields, null), "flex" === parentStyle?.display && /* @__PURE__ */ React54.createElement(FlexChildFields, { parentStyleDirection }));
};
var FlexFields = () => {
  const { value: flexWrap } = useStylesField("flex-wrap", {
    history: { propDisplayName: FLEX_WRAP_LABEL2 }
  });
  return /* @__PURE__ */ React54.createElement(React54.Fragment, null, /* @__PURE__ */ React54.createElement(FlexDirectionField, null), /* @__PURE__ */ React54.createElement(JustifyContentField, null), /* @__PURE__ */ React54.createElement(AlignItemsField, null), /* @__PURE__ */ React54.createElement(PanelDivider, null), /* @__PURE__ */ React54.createElement(GapControlField, null), /* @__PURE__ */ React54.createElement(WrapField, null), ["wrap", "wrap-reverse"].includes(flexWrap?.value) && /* @__PURE__ */ React54.createElement(AlignContentField, null));
};
var FlexChildFields = ({ parentStyleDirection }) => /* @__PURE__ */ React54.createElement(React54.Fragment, null, /* @__PURE__ */ React54.createElement(PanelDivider, null), /* @__PURE__ */ React54.createElement(ControlFormLabel4, null, __31("Flex child", "elementor")), /* @__PURE__ */ React54.createElement(AlignSelfChild, { parentStyleDirection }), /* @__PURE__ */ React54.createElement(FlexOrderField, null), /* @__PURE__ */ React54.createElement(FlexSizeField, null));
var shouldDisplayFlexFields = (display, local) => {
  const value = display?.value ?? local?.value;
  if (!value) {
    return false;
  }
  return "flex" === value || "inline-flex" === value;
};

// src/components/style-sections/position-section/position-section.tsx
import * as React59 from "react";
import { isExperimentActive as isExperimentActive12 } from "@elementor/editor-v1-adapters";
import { useSessionStorage } from "@elementor/session";
import { __ as __36 } from "@wordpress/i18n";

// src/components/style-sections/position-section/dimensions-field.tsx
import * as React55 from "react";
import { useRef as useRef7 } from "react";
import { SizeControl as SizeControl4 } from "@elementor/editor-controls";
import { SideBottomIcon as SideBottomIcon2, SideLeftIcon as SideLeftIcon2, SideRightIcon as SideRightIcon2, SideTopIcon as SideTopIcon2 } from "@elementor/icons";
import { Grid as Grid3, Stack as Stack11, withDirection as withDirection8 } from "@elementor/ui";
import { __ as __32 } from "@wordpress/i18n";
var InlineStartIcon2 = withDirection8(SideLeftIcon2);
var InlineEndIcon2 = withDirection8(SideRightIcon2);
var sideIcons = {
  "inset-block-start": /* @__PURE__ */ React55.createElement(SideTopIcon2, { fontSize: "tiny" }),
  "inset-block-end": /* @__PURE__ */ React55.createElement(SideBottomIcon2, { fontSize: "tiny" }),
  "inset-inline-start": /* @__PURE__ */ React55.createElement(RotatedIcon, { icon: InlineStartIcon2, size: "tiny" }),
  "inset-inline-end": /* @__PURE__ */ React55.createElement(RotatedIcon, { icon: InlineEndIcon2, size: "tiny" })
};
var getInlineStartLabel = (isSiteRtl) => isSiteRtl ? __32("Right", "elementor") : __32("Left", "elementor");
var getInlineEndLabel = (isSiteRtl) => isSiteRtl ? __32("Left", "elementor") : __32("Right", "elementor");
var DimensionsField = () => {
  const { isSiteRtl } = useDirection();
  const rowRefs = [useRef7(null), useRef7(null)];
  return /* @__PURE__ */ React55.createElement(UiProviders, null, /* @__PURE__ */ React55.createElement(Stack11, { direction: "row", gap: 2, flexWrap: "nowrap", ref: rowRefs[0] }, /* @__PURE__ */ React55.createElement(DimensionField, { side: "inset-block-start", label: __32("Top", "elementor"), rowRef: rowRefs[0] }), /* @__PURE__ */ React55.createElement(
    DimensionField,
    {
      side: "inset-inline-end",
      label: getInlineEndLabel(isSiteRtl),
      rowRef: rowRefs[0]
    }
  )), /* @__PURE__ */ React55.createElement(Stack11, { direction: "row", gap: 2, flexWrap: "nowrap", ref: rowRefs[1] }, /* @__PURE__ */ React55.createElement(DimensionField, { side: "inset-block-end", label: __32("Bottom", "elementor"), rowRef: rowRefs[1] }), /* @__PURE__ */ React55.createElement(
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
}) => /* @__PURE__ */ React55.createElement(StylesField, { bind: side, propDisplayName: label }, /* @__PURE__ */ React55.createElement(Grid3, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React55.createElement(Grid3, { item: true, xs: 12 }, /* @__PURE__ */ React55.createElement(ControlLabel, null, label)), /* @__PURE__ */ React55.createElement(Grid3, { item: true, xs: 12 }, /* @__PURE__ */ React55.createElement(SizeControl4, { startIcon: sideIcons[side], extendedOptions: ["auto"], anchorRef: rowRef }))));

// src/components/style-sections/position-section/offset-field.tsx
import * as React56 from "react";
import { useRef as useRef8 } from "react";
import { SizeControl as SizeControl5 } from "@elementor/editor-controls";
import { __ as __33 } from "@wordpress/i18n";
var OFFSET_LABEL = __33("Anchor offset", "elementor");
var UNITS = ["px", "em", "rem", "vw", "vh"];
var OffsetField = () => {
  const rowRef = useRef8(null);
  return /* @__PURE__ */ React56.createElement(StylesField, { bind: "scroll-margin-top", propDisplayName: OFFSET_LABEL }, /* @__PURE__ */ React56.createElement(StylesFieldLayout, { label: OFFSET_LABEL, ref: rowRef }, /* @__PURE__ */ React56.createElement(SizeControl5, { units: UNITS, anchorRef: rowRef })));
};

// src/components/style-sections/position-section/position-field.tsx
import * as React57 from "react";
import { SelectControl as SelectControl3 } from "@elementor/editor-controls";
import { __ as __34 } from "@wordpress/i18n";
var POSITION_LABEL = __34("Position", "elementor");
var positionOptions = [
  { label: __34("Static", "elementor"), value: "static" },
  { label: __34("Relative", "elementor"), value: "relative" },
  { label: __34("Absolute", "elementor"), value: "absolute" },
  { label: __34("Fixed", "elementor"), value: "fixed" },
  { label: __34("Sticky", "elementor"), value: "sticky" }
];
var PositionField = ({ onChange }) => {
  return /* @__PURE__ */ React57.createElement(StylesField, { bind: "position", propDisplayName: POSITION_LABEL }, /* @__PURE__ */ React57.createElement(StylesFieldLayout, { label: POSITION_LABEL }, /* @__PURE__ */ React57.createElement(SelectControl3, { options: positionOptions, onChange })));
};

// src/components/style-sections/position-section/z-index-field.tsx
import * as React58 from "react";
import { NumberControl as NumberControl3 } from "@elementor/editor-controls";
import { __ as __35 } from "@wordpress/i18n";
var Z_INDEX_LABEL = __35("Z-index", "elementor");
var ZIndexField = () => {
  return /* @__PURE__ */ React58.createElement(StylesField, { bind: "z-index", propDisplayName: Z_INDEX_LABEL }, /* @__PURE__ */ React58.createElement(StylesFieldLayout, { label: Z_INDEX_LABEL }, /* @__PURE__ */ React58.createElement(NumberControl3, null)));
};

// src/components/style-sections/position-section/position-section.tsx
var POSITION_LABEL2 = __36("Position", "elementor");
var DIMENSIONS_LABEL = __36("Dimensions", "elementor");
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
  const isCssIdFeatureActive = isExperimentActive12("e_v_3_30");
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
  return /* @__PURE__ */ React59.createElement(SectionContent, null, /* @__PURE__ */ React59.createElement(PositionField, { onChange: onPositionChange }), isNotStatic ? /* @__PURE__ */ React59.createElement(React59.Fragment, null, /* @__PURE__ */ React59.createElement(DimensionsField, null), /* @__PURE__ */ React59.createElement(ZIndexField, null)) : null, isCssIdFeatureActive && /* @__PURE__ */ React59.createElement(React59.Fragment, null, /* @__PURE__ */ React59.createElement(PanelDivider, null), /* @__PURE__ */ React59.createElement(OffsetField, null)));
};
var usePersistDimensions = () => {
  const { id: styleDefID, meta } = useStyle();
  const styleVariantPath = `styles/${styleDefID}/${meta.breakpoint || "desktop"}/${meta.state || "null"}`;
  const dimensionsPath = `${styleVariantPath}/dimensions`;
  return useSessionStorage(dimensionsPath);
};

// src/components/style-sections/size-section/size-section.tsx
import * as React65 from "react";
import { useRef as useRef9 } from "react";
import { AspectRatioControl, SizeControl as SizeControl6 } from "@elementor/editor-controls";
import { isExperimentActive as isExperimentActive14 } from "@elementor/editor-v1-adapters";
import { Grid as Grid4, Stack as Stack13 } from "@elementor/ui";
import { __ as __41 } from "@wordpress/i18n";

// src/components/style-tab-collapsible-content.tsx
import * as React61 from "react";
import { isExperimentActive as isExperimentActive13 } from "@elementor/editor-v1-adapters";

// src/styles-inheritance/components/styles-inheritance-section-indicators.tsx
import * as React60 from "react";
import { isElementsStylesProvider as isElementsStylesProvider4 } from "@elementor/editor-styles-repository";
import { Stack as Stack12, Tooltip as Tooltip7 } from "@elementor/ui";
import { __ as __37 } from "@wordpress/i18n";
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
  const hasValueLabel = __37("Has effective styles", "elementor");
  const hasOverridesLabel = __37("Has overridden styles", "elementor");
  return /* @__PURE__ */ React60.createElement(Tooltip7, { title: __37("Has styles", "elementor"), placement: "top" }, /* @__PURE__ */ React60.createElement(Stack12, { direction: "row", sx: { "& > *": { marginInlineStart: -0.25 } }, role: "list" }, hasValues && provider && /* @__PURE__ */ React60.createElement(
    StyleIndicator,
    {
      getColor: getStylesProviderThemeColor(provider.getKey()),
      "data-variant": isElementsStylesProvider4(provider.getKey()) ? "local" : "global",
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
  const isUsingFieldsIndicators = isExperimentActive13(EXPERIMENTAL_FEATURES.V_3_30);
  if (fields.length === 0 || !isUsingFieldsIndicators) {
    return null;
  }
  return (isOpen) => !isOpen ? /* @__PURE__ */ React61.createElement(StylesInheritanceSectionIndicators, { fields }) : null;
}

// src/components/style-sections/size-section/object-fit-field.tsx
import * as React62 from "react";
import { SelectControl as SelectControl4 } from "@elementor/editor-controls";
import { __ as __38 } from "@wordpress/i18n";
var OBJECT_FIT_LABEL = __38("Object fit", "elementor");
var positionOptions2 = [
  { label: __38("Fill", "elementor"), value: "fill" },
  { label: __38("Cover", "elementor"), value: "cover" },
  { label: __38("Contain", "elementor"), value: "contain" },
  { label: __38("None", "elementor"), value: "none" },
  { label: __38("Scale down", "elementor"), value: "scale-down" }
];
var ObjectFitField = () => {
  return /* @__PURE__ */ React62.createElement(StylesField, { bind: "object-fit", propDisplayName: OBJECT_FIT_LABEL }, /* @__PURE__ */ React62.createElement(StylesFieldLayout, { label: OBJECT_FIT_LABEL }, /* @__PURE__ */ React62.createElement(SelectControl4, { options: positionOptions2 })));
};

// src/components/style-sections/size-section/object-position-field.tsx
import * as React63 from "react";
import { PositionControl } from "@elementor/editor-controls";
import { __ as __39 } from "@wordpress/i18n";
var OBJECT_POSITION_LABEL = __39("Object position", "elementor");
var ObjectPositionField = () => {
  return /* @__PURE__ */ React63.createElement(StylesField, { bind: "object-position", propDisplayName: OBJECT_POSITION_LABEL }, /* @__PURE__ */ React63.createElement(PositionControl, null));
};

// src/components/style-sections/size-section/overflow-field.tsx
import * as React64 from "react";
import { ToggleControl as ToggleControl8 } from "@elementor/editor-controls";
import { EyeIcon, EyeOffIcon, LetterAIcon } from "@elementor/icons";
import { __ as __40 } from "@wordpress/i18n";
var OVERFLOW_LABEL = __40("Overflow", "elementor");
var options6 = [
  {
    value: "visible",
    label: __40("Visible", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React64.createElement(EyeIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "hidden",
    label: __40("Hidden", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React64.createElement(EyeOffIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "auto",
    label: __40("Auto", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React64.createElement(LetterAIcon, { fontSize: size }),
    showTooltip: true
  }
];
var OverflowField = () => {
  return /* @__PURE__ */ React64.createElement(StylesField, { bind: "overflow", propDisplayName: OVERFLOW_LABEL }, /* @__PURE__ */ React64.createElement(StylesFieldLayout, { label: OVERFLOW_LABEL }, /* @__PURE__ */ React64.createElement(ToggleControl8, { options: options6 })));
};

// src/components/style-sections/size-section/size-section.tsx
var EXPERIMENT_ID = "e_v_3_30";
var CssSizeProps = [
  [
    {
      bind: "width",
      label: __41("Width", "elementor")
    },
    {
      bind: "height",
      label: __41("Height", "elementor")
    }
  ],
  [
    {
      bind: "min-width",
      label: __41("Min width", "elementor")
    },
    {
      bind: "min-height",
      label: __41("Min height", "elementor")
    }
  ],
  [
    {
      bind: "max-width",
      label: __41("Max width", "elementor")
    },
    {
      bind: "max-height",
      label: __41("Max height", "elementor")
    }
  ]
];
var ASPECT_RATIO_LABEL = __41("Aspect Ratio", "elementor");
var OBJECT_FIT_LABEL2 = __41("Object fit", "elementor");
var SizeSection = () => {
  const { value: fitValue } = useStylesField("object-fit", {
    history: { propDisplayName: OBJECT_FIT_LABEL2 }
  });
  const isNotFill = fitValue && fitValue?.value !== "fill";
  const gridRowRefs = [useRef9(null), useRef9(null), useRef9(null)];
  const isVersion330Active = isExperimentActive14(EXPERIMENT_ID);
  return /* @__PURE__ */ React65.createElement(SectionContent, null, CssSizeProps.map((row, rowIndex) => /* @__PURE__ */ React65.createElement(Grid4, { key: rowIndex, container: true, gap: 2, flexWrap: "nowrap", ref: gridRowRefs[rowIndex] }, row.map((props) => /* @__PURE__ */ React65.createElement(Grid4, { item: true, xs: 6, key: props.bind }, /* @__PURE__ */ React65.createElement(SizeField, { ...props, rowRef: gridRowRefs[rowIndex], extendedOptions: ["auto"] }))))), /* @__PURE__ */ React65.createElement(PanelDivider, null), /* @__PURE__ */ React65.createElement(Stack13, null, /* @__PURE__ */ React65.createElement(OverflowField, null)), isVersion330Active && /* @__PURE__ */ React65.createElement(StyleTabCollapsibleContent, { fields: ["aspect-ratio", "object-fit"] }, /* @__PURE__ */ React65.createElement(Stack13, { gap: 2, pt: 2 }, /* @__PURE__ */ React65.createElement(StylesField, { bind: "aspect-ratio", propDisplayName: ASPECT_RATIO_LABEL }, /* @__PURE__ */ React65.createElement(AspectRatioControl, { label: ASPECT_RATIO_LABEL })), /* @__PURE__ */ React65.createElement(PanelDivider, null), /* @__PURE__ */ React65.createElement(ObjectFitField, null), isNotFill && /* @__PURE__ */ React65.createElement(Grid4, { item: true, xs: 6 }, /* @__PURE__ */ React65.createElement(ObjectPositionField, null)))));
};
var SizeField = ({ label, bind, rowRef, extendedOptions }) => {
  return /* @__PURE__ */ React65.createElement(StylesField, { bind, propDisplayName: label }, /* @__PURE__ */ React65.createElement(Grid4, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React65.createElement(Grid4, { item: true, xs: 12 }, /* @__PURE__ */ React65.createElement(ControlLabel, null, label)), /* @__PURE__ */ React65.createElement(Grid4, { item: true, xs: 12 }, /* @__PURE__ */ React65.createElement(SizeControl6, { extendedOptions, anchorRef: rowRef }))));
};

// src/components/style-sections/spacing-section/spacing-section.tsx
import * as React66 from "react";
import { LinkedDimensionsControl } from "@elementor/editor-controls";
import { __ as __42 } from "@wordpress/i18n";
var MARGIN_LABEL = __42("Margin", "elementor");
var PADDING_LABEL = __42("Padding", "elementor");
var SpacingSection = () => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React66.createElement(SectionContent, null, /* @__PURE__ */ React66.createElement(StylesField, { bind: "margin", propDisplayName: MARGIN_LABEL }, /* @__PURE__ */ React66.createElement(
    LinkedDimensionsControl,
    {
      label: MARGIN_LABEL,
      isSiteRtl,
      extendedOptions: ["auto"]
    }
  )), /* @__PURE__ */ React66.createElement(PanelDivider, null), /* @__PURE__ */ React66.createElement(StylesField, { bind: "padding", propDisplayName: PADDING_LABEL }, /* @__PURE__ */ React66.createElement(LinkedDimensionsControl, { label: PADDING_LABEL, isSiteRtl })));
};

// src/components/style-sections/typography-section/typography-section.tsx
import * as React82 from "react";
import { isExperimentActive as isExperimentActive15 } from "@elementor/editor-v1-adapters";
import { __ as __59 } from "@wordpress/i18n";

// src/components/style-sections/typography-section/column-count-field.tsx
import * as React67 from "react";
import { NumberControl as NumberControl4 } from "@elementor/editor-controls";
import { __ as __43 } from "@wordpress/i18n";
var COLUMN_COUNT_LABEL = __43("Columns", "elementor");
var ColumnCountField = () => {
  return /* @__PURE__ */ React67.createElement(StylesField, { bind: "column-count", propDisplayName: COLUMN_COUNT_LABEL }, /* @__PURE__ */ React67.createElement(StylesFieldLayout, { label: COLUMN_COUNT_LABEL }, /* @__PURE__ */ React67.createElement(NumberControl4, { shouldForceInt: true, min: 0, step: 1 })));
};

// src/components/style-sections/typography-section/column-gap-field.tsx
import * as React68 from "react";
import { useRef as useRef10 } from "react";
import { SizeControl as SizeControl7 } from "@elementor/editor-controls";
import { __ as __44 } from "@wordpress/i18n";
var COLUMN_GAP_LABEL = __44("Column gap", "elementor");
var ColumnGapField = () => {
  const rowRef = useRef10(null);
  return /* @__PURE__ */ React68.createElement(StylesField, { bind: "column-gap", propDisplayName: COLUMN_GAP_LABEL }, /* @__PURE__ */ React68.createElement(StylesFieldLayout, { label: COLUMN_GAP_LABEL, ref: rowRef }, /* @__PURE__ */ React68.createElement(SizeControl7, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/font-family-field.tsx
import * as React69 from "react";
import { FontFamilyControl } from "@elementor/editor-controls";
import { __ as __46 } from "@wordpress/i18n";

// src/components/style-sections/typography-section/hooks/use-font-families.ts
import { useMemo as useMemo7 } from "react";
import { __ as __45 } from "@wordpress/i18n";
var supportedCategories = {
  system: __45("System", "elementor"),
  custom: __45("Custom Fonts", "elementor"),
  googlefonts: __45("Google Fonts", "elementor")
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
  return useMemo7(() => {
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
var FONT_FAMILY_LABEL = __46("Font family", "elementor");
var FontFamilyField = () => {
  const fontFamilies = useFontFamilies();
  const sectionWidth = useSectionWidth();
  if (fontFamilies.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React69.createElement(StylesField, { bind: "font-family", propDisplayName: FONT_FAMILY_LABEL }, /* @__PURE__ */ React69.createElement(StylesFieldLayout, { label: FONT_FAMILY_LABEL }, /* @__PURE__ */ React69.createElement(FontFamilyControl, { fontFamilies, sectionWidth })));
};

// src/components/style-sections/typography-section/font-size-field.tsx
import * as React70 from "react";
import { useRef as useRef11 } from "react";
import { SizeControl as SizeControl8 } from "@elementor/editor-controls";
import { __ as __47 } from "@wordpress/i18n";
var FONT_SIZE_LABEL = __47("Font size", "elementor");
var FontSizeField = () => {
  const rowRef = useRef11(null);
  return /* @__PURE__ */ React70.createElement(StylesField, { bind: "font-size", propDisplayName: FONT_SIZE_LABEL }, /* @__PURE__ */ React70.createElement(StylesFieldLayout, { label: FONT_SIZE_LABEL, ref: rowRef }, /* @__PURE__ */ React70.createElement(SizeControl8, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/font-style-field.tsx
import * as React71 from "react";
import { ToggleControl as ToggleControl9 } from "@elementor/editor-controls";
import { ItalicIcon, MinusIcon as MinusIcon2 } from "@elementor/icons";
import { __ as __48 } from "@wordpress/i18n";
var FONT_STYLE_LABEL = __48("Font style", "elementor");
var options7 = [
  {
    value: "normal",
    label: __48("Normal", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(MinusIcon2, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "italic",
    label: __48("Italic", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(ItalicIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FontStyleField = () => {
  return /* @__PURE__ */ React71.createElement(StylesField, { bind: "font-style", propDisplayName: FONT_STYLE_LABEL }, /* @__PURE__ */ React71.createElement(StylesFieldLayout, { label: FONT_STYLE_LABEL }, /* @__PURE__ */ React71.createElement(ToggleControl9, { options: options7 })));
};

// src/components/style-sections/typography-section/font-weight-field.tsx
import * as React72 from "react";
import { SelectControl as SelectControl5 } from "@elementor/editor-controls";
import { __ as __49 } from "@wordpress/i18n";
var FONT_WEIGHT_LABEL = __49("Font weight", "elementor");
var fontWeightOptions = [
  { value: "100", label: __49("100 - Thin", "elementor") },
  { value: "200", label: __49("200 - Extra light", "elementor") },
  { value: "300", label: __49("300 - Light", "elementor") },
  { value: "400", label: __49("400 - Normal", "elementor") },
  { value: "500", label: __49("500 - Medium", "elementor") },
  { value: "600", label: __49("600 - Semi bold", "elementor") },
  { value: "700", label: __49("700 - Bold", "elementor") },
  { value: "800", label: __49("800 - Extra bold", "elementor") },
  { value: "900", label: __49("900 - Black", "elementor") }
];
var FontWeightField = () => {
  return /* @__PURE__ */ React72.createElement(StylesField, { bind: "font-weight", propDisplayName: FONT_WEIGHT_LABEL }, /* @__PURE__ */ React72.createElement(StylesFieldLayout, { label: FONT_WEIGHT_LABEL }, /* @__PURE__ */ React72.createElement(SelectControl5, { options: fontWeightOptions })));
};

// src/components/style-sections/typography-section/letter-spacing-field.tsx
import * as React73 from "react";
import { useRef as useRef12 } from "react";
import { SizeControl as SizeControl9 } from "@elementor/editor-controls";
import { __ as __50 } from "@wordpress/i18n";
var LETTER_SPACING_LABEL = __50("Letter spacing", "elementor");
var LetterSpacingField = () => {
  const rowRef = useRef12(null);
  return /* @__PURE__ */ React73.createElement(StylesField, { bind: "letter-spacing", propDisplayName: LETTER_SPACING_LABEL }, /* @__PURE__ */ React73.createElement(StylesFieldLayout, { label: LETTER_SPACING_LABEL, ref: rowRef }, /* @__PURE__ */ React73.createElement(SizeControl9, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/line-height-field.tsx
import * as React74 from "react";
import { useRef as useRef13 } from "react";
import { SizeControl as SizeControl10 } from "@elementor/editor-controls";
import { __ as __51 } from "@wordpress/i18n";
var LINE_HEIGHT_LABEL = __51("Line height", "elementor");
var LineHeightField = () => {
  const rowRef = useRef13(null);
  return /* @__PURE__ */ React74.createElement(StylesField, { bind: "line-height", propDisplayName: LINE_HEIGHT_LABEL }, /* @__PURE__ */ React74.createElement(StylesFieldLayout, { label: LINE_HEIGHT_LABEL, ref: rowRef }, /* @__PURE__ */ React74.createElement(SizeControl10, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/text-alignment-field.tsx
import * as React75 from "react";
import { ToggleControl as ToggleControl10 } from "@elementor/editor-controls";
import { AlignCenterIcon, AlignJustifiedIcon, AlignLeftIcon, AlignRightIcon } from "@elementor/icons";
import { withDirection as withDirection9 } from "@elementor/ui";
import { __ as __52 } from "@wordpress/i18n";
var TEXT_ALIGNMENT_LABEL = __52("Text align", "elementor");
var AlignStartIcon = withDirection9(AlignLeftIcon);
var AlignEndIcon = withDirection9(AlignRightIcon);
var options8 = [
  {
    value: "start",
    label: __52("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(AlignStartIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "center",
    label: __52("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(AlignCenterIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "end",
    label: __52("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(AlignEndIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "justify",
    label: __52("Justify", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(AlignJustifiedIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextAlignmentField = () => {
  return /* @__PURE__ */ React75.createElement(StylesField, { bind: "text-align", propDisplayName: TEXT_ALIGNMENT_LABEL }, /* @__PURE__ */ React75.createElement(UiProviders, null, /* @__PURE__ */ React75.createElement(StylesFieldLayout, { label: TEXT_ALIGNMENT_LABEL }, /* @__PURE__ */ React75.createElement(ToggleControl10, { options: options8 }))));
};

// src/components/style-sections/typography-section/text-color-field.tsx
import * as React76 from "react";
import { ColorControl as ColorControl2 } from "@elementor/editor-controls";
import { __ as __53 } from "@wordpress/i18n";
var TEXT_COLOR_LABEL = __53("Text color", "elementor");
var TextColorField = () => {
  return /* @__PURE__ */ React76.createElement(StylesField, { bind: "color", propDisplayName: TEXT_COLOR_LABEL }, /* @__PURE__ */ React76.createElement(StylesFieldLayout, { label: TEXT_COLOR_LABEL }, /* @__PURE__ */ React76.createElement(ColorControl2, null)));
};

// src/components/style-sections/typography-section/text-decoration-field.tsx
import * as React77 from "react";
import { ToggleControl as ToggleControl11 } from "@elementor/editor-controls";
import { MinusIcon as MinusIcon3, OverlineIcon, StrikethroughIcon, UnderlineIcon } from "@elementor/icons";
import { __ as __54 } from "@wordpress/i18n";
var TEXT_DECORATION_LABEL = __54("Line decoration", "elementor");
var options9 = [
  {
    value: "none",
    label: __54("None", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(MinusIcon3, { fontSize: size }),
    showTooltip: true,
    exclusive: true
  },
  {
    value: "underline",
    label: __54("Underline", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(UnderlineIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "line-through",
    label: __54("Line-through", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(StrikethroughIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "overline",
    label: __54("Overline", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React77.createElement(OverlineIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextDecorationField = () => /* @__PURE__ */ React77.createElement(StylesField, { bind: "text-decoration", propDisplayName: TEXT_DECORATION_LABEL }, /* @__PURE__ */ React77.createElement(StylesFieldLayout, { label: TEXT_DECORATION_LABEL }, /* @__PURE__ */ React77.createElement(ToggleControl11, { options: options9, exclusive: false })));

// src/components/style-sections/typography-section/text-direction-field.tsx
import * as React78 from "react";
import { ToggleControl as ToggleControl12 } from "@elementor/editor-controls";
import { TextDirectionLtrIcon, TextDirectionRtlIcon } from "@elementor/icons";
import { __ as __55 } from "@wordpress/i18n";
var TEXT_DIRECTION_LABEL = __55("Direction", "elementor");
var options10 = [
  {
    value: "ltr",
    label: __55("Left to right", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React78.createElement(TextDirectionLtrIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "rtl",
    label: __55("Right to left", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React78.createElement(TextDirectionRtlIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextDirectionField = () => {
  return /* @__PURE__ */ React78.createElement(StylesField, { bind: "direction", propDisplayName: TEXT_DIRECTION_LABEL }, /* @__PURE__ */ React78.createElement(StylesFieldLayout, { label: TEXT_DIRECTION_LABEL }, /* @__PURE__ */ React78.createElement(ToggleControl12, { options: options10 })));
};

// src/components/style-sections/typography-section/text-stroke-field.tsx
import * as React79 from "react";
import { StrokeControl } from "@elementor/editor-controls";
import { __ as __56 } from "@wordpress/i18n";
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
var TEXT_STROKE_LABEL = __56("Text stroke", "elementor");
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
  return /* @__PURE__ */ React79.createElement(StylesField, { bind: "stroke", propDisplayName: TEXT_STROKE_LABEL }, /* @__PURE__ */ React79.createElement(
    AddOrRemoveContent,
    {
      isAdded: hasTextStroke,
      onAdd: addTextStroke,
      onRemove: removeTextStroke,
      disabled: !canEdit,
      renderLabel: () => /* @__PURE__ */ React79.createElement(ControlLabel, null, TEXT_STROKE_LABEL)
    },
    /* @__PURE__ */ React79.createElement(StrokeControl, null)
  ));
};

// src/components/style-sections/typography-section/transform-field.tsx
import * as React80 from "react";
import { ToggleControl as ToggleControl13 } from "@elementor/editor-controls";
import { LetterCaseIcon, LetterCaseLowerIcon, LetterCaseUpperIcon, MinusIcon as MinusIcon4 } from "@elementor/icons";
import { __ as __57 } from "@wordpress/i18n";
var TEXT_TRANSFORM_LABEL = __57("Text transform", "elementor");
var options11 = [
  {
    value: "none",
    label: __57("None", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React80.createElement(MinusIcon4, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "capitalize",
    label: __57("Capitalize", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React80.createElement(LetterCaseIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "uppercase",
    label: __57("Uppercase", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React80.createElement(LetterCaseUpperIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "lowercase",
    label: __57("Lowercase", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React80.createElement(LetterCaseLowerIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TransformField = () => /* @__PURE__ */ React80.createElement(StylesField, { bind: "text-transform", propDisplayName: TEXT_TRANSFORM_LABEL }, /* @__PURE__ */ React80.createElement(StylesFieldLayout, { label: TEXT_TRANSFORM_LABEL }, /* @__PURE__ */ React80.createElement(ToggleControl13, { options: options11 })));

// src/components/style-sections/typography-section/word-spacing-field.tsx
import * as React81 from "react";
import { useRef as useRef14 } from "react";
import { SizeControl as SizeControl11 } from "@elementor/editor-controls";
import { __ as __58 } from "@wordpress/i18n";
var WORD_SPACING_LABEL = __58("Word spacing", "elementor");
var WordSpacingField = () => {
  const rowRef = useRef14(null);
  return /* @__PURE__ */ React81.createElement(StylesField, { bind: "word-spacing", propDisplayName: WORD_SPACING_LABEL }, /* @__PURE__ */ React81.createElement(StylesFieldLayout, { label: WORD_SPACING_LABEL, ref: rowRef }, /* @__PURE__ */ React81.createElement(SizeControl11, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/typography-section.tsx
var COLUMN_COUNT_LABEL2 = __59("Column count", "elementor");
var TypographySection = () => {
  const { value: columnCount } = useStylesField("column-count", {
    history: { propDisplayName: COLUMN_COUNT_LABEL2 }
  });
  const hasMultiColumns = !!(columnCount?.value && columnCount?.value > 1);
  const isVersion330Active = isExperimentActive15("e_v_3_30");
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
import * as React83 from "react";
import { isExperimentActive as isExperimentActive16 } from "@elementor/editor-v1-adapters";
var StyleTabSection = ({ section, fields = [] }) => {
  const { component, name, title } = section;
  const tabDefaults = useDefaultPanelSettings();
  const SectionComponent = component;
  const isExpanded = isExperimentActive16(EXPERIMENTAL_FEATURES.V_3_30) ? tabDefaults.defaultSectionsExpanded.style?.includes(name) : false;
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
  const [activeStyleState, setActiveStyleState] = useState12(null);
  const breakpoint = useActiveBreakpoint();
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
    /* @__PURE__ */ React84.createElement(SessionStorageProvider2, { prefix: activeStyleDefId ?? "" }, /* @__PURE__ */ React84.createElement(StyleInheritanceProvider, null, /* @__PURE__ */ React84.createElement(ClassesHeader, null, /* @__PURE__ */ React84.createElement(CssClassSelector, null), /* @__PURE__ */ React84.createElement(Divider5, null)), /* @__PURE__ */ React84.createElement(SectionsList, null, /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: LayoutSection,
          name: "Layout",
          title: __60("Layout", "elementor")
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
          title: __60("Spacing", "elementor")
        },
        fields: ["margin", "padding"]
      }
    ), /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: SizeSection,
          name: "Size",
          title: __60("Size", "elementor")
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
          title: __60("Position", "elementor")
        },
        fields: ["position", "z-index", "scroll-margin-top"]
      }
    ), /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: TypographySection,
          name: "Typography",
          title: __60("Typography", "elementor")
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
          title: __60("Background", "elementor")
        },
        fields: ["background"]
      }
    ), /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: BorderSection,
          name: "Border",
          title: __60("Border", "elementor")
        },
        fields: ["border-radius", "border-width", "border-color", "border-style"]
      }
    ), /* @__PURE__ */ React84.createElement(
      StyleTabSection,
      {
        section: {
          component: EffectsSection,
          name: "Effects",
          title: __60("Effects", "elementor")
        },
        fields: ["box-shadow"]
      }
    ))))
  ));
};
function ClassesHeader({ children }) {
  const scrollDirection = useScrollDirection();
  return /* @__PURE__ */ React84.createElement(Stack14, { sx: { ...stickyHeaderStyles, top: scrollDirection === "up" ? TABS_HEADER_HEIGHT : 0 } }, children);
}
function useCurrentClassesProp() {
  const { elementType } = useElement();
  const prop = Object.entries(elementType.propsSchema).find(
    ([, propType]) => propType.kind === "plain" && propType.key === CLASSES_PROP_KEY
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
    /* @__PURE__ */ React85.createElement(Fragment10, { key: element.id }, /* @__PURE__ */ React85.createElement(PanelTabContent, null))
  );
};
var PanelTabContent = () => {
  const editorDefaults = useDefaultPanelSettings();
  const defaultComponentTab = isExperimentActive17(EXPERIMENTAL_FEATURES.V_3_30) ? editorDefaults.defaultTab : "settings";
  const [currentTab, setCurrentTab] = useStateByElement("tab", defaultComponentTab);
  const { getTabProps, getTabPanelProps, getTabsProps } = useTabs(currentTab);
  return /* @__PURE__ */ React85.createElement(ScrollProvider, null, /* @__PURE__ */ React85.createElement(Stack15, { direction: "column", sx: { width: "100%" } }, /* @__PURE__ */ React85.createElement(Stack15, { sx: { ...stickyHeaderStyles, top: 0 } }, /* @__PURE__ */ React85.createElement(
    Tabs,
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
    /* @__PURE__ */ React85.createElement(Tab, { label: __61("General", "elementor"), ...getTabProps("settings") }),
    /* @__PURE__ */ React85.createElement(Tab, { label: __61("Style", "elementor"), ...getTabProps("style") })
  ), /* @__PURE__ */ React85.createElement(Divider6, null)), /* @__PURE__ */ React85.createElement(TabPanel, { ...getTabPanelProps("settings"), disablePadding: true }, /* @__PURE__ */ React85.createElement(SettingsTab, null)), /* @__PURE__ */ React85.createElement(TabPanel, { ...getTabPanelProps("style"), disablePadding: true }, /* @__PURE__ */ React85.createElement(StyleTab, null))));
};

// src/components/editing-panel.tsx
var { useMenuItems } = controlActionsMenu;
var EditingPanel = () => {
  const { element, elementType } = useSelectedElement();
  const controlReplacements = getControlReplacements();
  const menuItems = useMenuItems().default;
  if (!element || !elementType) {
    return null;
  }
  const panelTitle = __62("Edit %s", "elementor").replace("%s", elementType.title);
  return /* @__PURE__ */ React86.createElement(ErrorBoundary, { fallback: /* @__PURE__ */ React86.createElement(EditorPanelErrorFallback, null) }, /* @__PURE__ */ React86.createElement(SessionStorageProvider3, { prefix: "elementor" }, /* @__PURE__ */ React86.createElement(ThemeProvider2, null, /* @__PURE__ */ React86.createElement(Panel, null, /* @__PURE__ */ React86.createElement(PanelHeader, null, /* @__PURE__ */ React86.createElement(PanelHeaderTitle, null, panelTitle), /* @__PURE__ */ React86.createElement(AtomIcon, { fontSize: "small", sx: { color: "text.tertiary" } })), /* @__PURE__ */ React86.createElement(PanelBody, null, /* @__PURE__ */ React86.createElement(ControlActionsProvider, { items: menuItems }, /* @__PURE__ */ React86.createElement(ControlReplacementsProvider, { replacements: controlReplacements }, /* @__PURE__ */ React86.createElement(ElementProvider, { element, elementType }, /* @__PURE__ */ React86.createElement(EditingPanelTabs, null)))))))));
};

// src/panel.ts
var { panel, usePanelActions, usePanelStatus } = createPanel({
  id: "editing-panel",
  component: EditingPanel
});

// src/components/popover-scrollable-content.tsx
import * as React87 from "react";
import { PopoverScrollableContent as BasePopoverScrollableContent } from "@elementor/editor-ui";
var PopoverScrollableContent = (props) => {
  const sectionWidth = useSectionWidth();
  return /* @__PURE__ */ React87.createElement(BasePopoverScrollableContent, { ...props, width: sectionWidth });
};

// src/init.ts
import { injectIntoLogic } from "@elementor/editor";
import { PrefetchUserData } from "@elementor/editor-current-user";
import { __registerPanel as registerPanel } from "@elementor/editor-panels";
import { blockCommand, isExperimentActive as isExperimentActive18 } from "@elementor/editor-v1-adapters";

// src/hooks/use-open-editor-panel.ts
import { useEffect as useEffect4 } from "react";
import { __privateListenTo as listenTo, commandStartEvent } from "@elementor/editor-v1-adapters";

// src/sync/is-atomic-widget-selected.ts
import { getSelectedElements, getWidgetsCache as getWidgetsCache2 } from "@elementor/editor-elements";
var isAtomicWidgetSelected = () => {
  const selectedElements = getSelectedElements();
  const widgetCache = getWidgetsCache2();
  if (selectedElements.length !== 1) {
    return false;
  }
  return !!widgetCache?.[selectedElements[0].type]?.atomic_controls;
};

// src/hooks/use-open-editor-panel.ts
var useOpenEditorPanel = () => {
  const { open } = usePanelActions();
  useEffect4(() => {
    return listenTo(commandStartEvent("panel/editor/open"), () => {
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
import { settingsTransformersRegistry, styleTransformersRegistry } from "@elementor/editor-canvas";
import { injectIntoRepeaterItemIcon, injectIntoRepeaterItemLabel } from "@elementor/editor-controls";

// src/dynamics/components/background-control-dynamic-tag.tsx
import * as React88 from "react";
import { PropKeyProvider as PropKeyProvider3, PropProvider as PropProvider3, useBoundProp as useBoundProp3 } from "@elementor/editor-controls";
import {
  backgroundImageOverlayPropTypeUtil
} from "@elementor/editor-props";
import { DatabaseIcon } from "@elementor/icons";

// src/dynamics/hooks/use-dynamic-tag.ts
import { useMemo as useMemo9 } from "react";

// src/dynamics/hooks/use-prop-dynamic-tags.ts
import { useMemo as useMemo8 } from "react";
import { useBoundProp as useBoundProp2 } from "@elementor/editor-controls";

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
import {
  createPropUtils,
  isTransformable as isTransformable2
} from "@elementor/editor-props";
import { z } from "@elementor/schema";
var DYNAMIC_PROP_TYPE_KEY = "dynamic";
var isDynamicPropType = (prop) => prop.key === DYNAMIC_PROP_TYPE_KEY;
var getDynamicPropType = (propType) => {
  const dynamicPropType = propType.kind === "union" && propType.prop_types[DYNAMIC_PROP_TYPE_KEY];
  return dynamicPropType && isDynamicPropType(dynamicPropType) ? dynamicPropType : null;
};
var isDynamicPropValue = (prop) => {
  return isTransformable2(prop) && prop.$$type === DYNAMIC_PROP_TYPE_KEY;
};
var supportsDynamic = (propType) => {
  return !!getDynamicPropType(propType);
};
var dynamicPropTypeUtil = createPropUtils(
  DYNAMIC_PROP_TYPE_KEY,
  z.strictObject({
    name: z.string(),
    settings: z.any().optional()
  })
);

// src/dynamics/hooks/use-prop-dynamic-tags.ts
var usePropDynamicTags = () => {
  let categories = [];
  const { propType } = useBoundProp2();
  if (propType) {
    const propDynamicType = getDynamicPropType(propType);
    categories = propDynamicType?.settings.categories || [];
  }
  return useMemo8(() => getDynamicTagsByCategories(categories), [categories.join()]);
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
  return useMemo9(() => dynamicTags.find((tag) => tag.name === tagName) ?? null, [dynamicTags, tagName]);
};

// src/dynamics/components/background-control-dynamic-tag.tsx
var BackgroundControlDynamicTagIcon = () => /* @__PURE__ */ React88.createElement(DatabaseIcon, { fontSize: "tiny" });
var BackgroundControlDynamicTagLabel = ({ value }) => {
  const context = useBoundProp3(backgroundImageOverlayPropTypeUtil);
  return /* @__PURE__ */ React88.createElement(PropProvider3, { ...context, value: value.value }, /* @__PURE__ */ React88.createElement(PropKeyProvider3, { bind: "image" }, /* @__PURE__ */ React88.createElement(Wrapper, { rawValue: value.value })));
};
var Wrapper = ({ rawValue }) => {
  const { propType } = useBoundProp3();
  const imageOverlayPropType = propType.prop_types["background-image-overlay"];
  return /* @__PURE__ */ React88.createElement(PropProvider3, { propType: imageOverlayPropType.shape.image, value: rawValue, setValue: () => void 0 }, /* @__PURE__ */ React88.createElement(PropKeyProvider3, { bind: "src" }, /* @__PURE__ */ React88.createElement(Content, { rawValue: rawValue.image })));
};
var Content = ({ rawValue }) => {
  const src = rawValue.value.src;
  const dynamicTag = useDynamicTag(src.value.name || "");
  return /* @__PURE__ */ React88.createElement(React88.Fragment, null, dynamicTag?.label);
};

// src/dynamics/components/dynamic-selection-control.tsx
import * as React91 from "react";
import { ControlFormLabel as ControlFormLabel5, useBoundProp as useBoundProp6 } from "@elementor/editor-controls";
import { PopoverHeader as PopoverHeader3, PopoverScrollableContent as PopoverScrollableContent2 } from "@elementor/editor-ui";
import { DatabaseIcon as DatabaseIcon3, SettingsIcon, XIcon } from "@elementor/icons";
import {
  bindPopover as bindPopover2,
  bindTrigger as bindTrigger2,
  Box as Box8,
  Divider as Divider8,
  Grid as Grid5,
  IconButton as IconButton5,
  Popover as Popover2,
  Stack as Stack17,
  Tab as Tab2,
  TabPanel as TabPanel2,
  Tabs as Tabs2,
  UnstableTag as Tag,
  usePopupState as usePopupState3,
  useTabs as useTabs2
} from "@elementor/ui";
import { __ as __64 } from "@wordpress/i18n";

// src/hooks/use-persist-dynamic-value.ts
import { useSessionStorage as useSessionStorage2 } from "@elementor/session";
var usePersistDynamicValue = (propKey) => {
  const { element } = useElement();
  const prefixedKey = `dynamic/non-dynamic-values-history/${element.id}/${propKey}`;
  return useSessionStorage2(prefixedKey);
};

// src/dynamics/dynamic-control.tsx
import * as React89 from "react";
import { PropKeyProvider as PropKeyProvider4, PropProvider as PropProvider4, useBoundProp as useBoundProp4 } from "@elementor/editor-controls";
var DynamicControl = ({ bind, children }) => {
  const { value, setValue } = useBoundProp4(dynamicPropTypeUtil);
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
  return /* @__PURE__ */ React89.createElement(PropProvider4, { propType, setValue: setDynamicValue, value: { [bind]: dynamicValue } }, /* @__PURE__ */ React89.createElement(PropKeyProvider4, { bind }, children));
};

// src/dynamics/components/dynamic-selection.tsx
import { Fragment as Fragment12, useState as useState13 } from "react";
import * as React90 from "react";
import { useBoundProp as useBoundProp5 } from "@elementor/editor-controls";
import { PopoverHeader as PopoverHeader2, PopoverMenuList, PopoverSearch } from "@elementor/editor-ui";
import { DatabaseIcon as DatabaseIcon2 } from "@elementor/icons";
import { Box as Box7, Divider as Divider7, Link as Link2, Stack as Stack16, Typography as Typography5, useTheme as useTheme3 } from "@elementor/ui";
import { __ as __63 } from "@wordpress/i18n";
var SIZE6 = "tiny";
var DynamicSelection = ({ close: closePopover }) => {
  const [searchValue, setSearchValue] = useState13("");
  const { groups: dynamicGroups } = getAtomicDynamicTags() || {};
  const theme = useTheme3();
  const { value: anyValue } = useBoundProp5();
  const { bind, value: dynamicValue, setValue } = useBoundProp5(dynamicPropTypeUtil);
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
  return /* @__PURE__ */ React90.createElement(React90.Fragment, null, /* @__PURE__ */ React90.createElement(
    PopoverHeader2,
    {
      title: __63("Dynamic tags", "elementor"),
      onClose: closePopover,
      icon: /* @__PURE__ */ React90.createElement(DatabaseIcon2, { fontSize: SIZE6 })
    }
  ), /* @__PURE__ */ React90.createElement(Stack16, null, hasNoDynamicTags ? /* @__PURE__ */ React90.createElement(NoDynamicTags, null) : /* @__PURE__ */ React90.createElement(Fragment12, null, /* @__PURE__ */ React90.createElement(
    PopoverSearch,
    {
      value: searchValue,
      onSearch: handleSearch,
      placeholder: __63("Search dynamic tags\u2026", "elementor")
    }
  ), /* @__PURE__ */ React90.createElement(Divider7, null), /* @__PURE__ */ React90.createElement(PopoverScrollableContent, null, /* @__PURE__ */ React90.createElement(
    PopoverMenuList,
    {
      items: virtualizedItems,
      onSelect: handleSetDynamicTag,
      onClose: closePopover,
      selectedValue: dynamicValue?.name,
      itemStyle: (item) => item.type === "item" ? { paddingInlineStart: theme.spacing(3.5) } : {},
      noResultsComponent: /* @__PURE__ */ React90.createElement(NoResults, { searchValue, onClear: () => setSearchValue("") })
    }
  )))));
};
var NoResults = ({ searchValue, onClear }) => /* @__PURE__ */ React90.createElement(
  Stack16,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    p: 2.5,
    color: "text.secondary",
    sx: { pb: 3.5 }
  },
  /* @__PURE__ */ React90.createElement(DatabaseIcon2, { fontSize: "large" }),
  /* @__PURE__ */ React90.createElement(Typography5, { align: "center", variant: "subtitle2" }, __63("Sorry, nothing matched", "elementor"), /* @__PURE__ */ React90.createElement("br", null), "\u201C", searchValue, "\u201D."),
  /* @__PURE__ */ React90.createElement(Typography5, { align: "center", variant: "caption", sx: { display: "flex", flexDirection: "column" } }, __63("Try something else.", "elementor"), /* @__PURE__ */ React90.createElement(Link2, { color: "text.secondary", variant: "caption", component: "button", onClick: onClear }, __63("Clear & try again", "elementor")))
);
var NoDynamicTags = () => /* @__PURE__ */ React90.createElement(Box7, { sx: { overflowY: "hidden", height: 297, width: 220 } }, /* @__PURE__ */ React90.createElement(Divider7, null), /* @__PURE__ */ React90.createElement(
  Stack16,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    p: 2.5,
    color: "text.secondary",
    sx: { pb: 3.5 }
  },
  /* @__PURE__ */ React90.createElement(DatabaseIcon2, { fontSize: "large" }),
  /* @__PURE__ */ React90.createElement(Typography5, { align: "center", variant: "subtitle2" }, __63("Streamline your workflow with dynamic tags", "elementor")),
  /* @__PURE__ */ React90.createElement(Typography5, { align: "center", variant: "caption" }, __63("You'll need Elementor Pro to use this feature.", "elementor"))
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
  const { setValue: setAnyValue } = useBoundProp6();
  const { bind, value } = useBoundProp6(dynamicPropTypeUtil);
  const [propValueFromHistory] = usePersistDynamicValue(bind);
  const selectionPopoverState = usePopupState3({ variant: "popover" });
  const { name: tagName = "" } = value;
  const dynamicTag = useDynamicTag(tagName);
  const removeDynamicTag = () => {
    setAnyValue(propValueFromHistory ?? null);
  };
  if (!dynamicTag) {
    throw new Error(`Dynamic tag ${tagName} not found`);
  }
  return /* @__PURE__ */ React91.createElement(Box8, null, /* @__PURE__ */ React91.createElement(
    Tag,
    {
      fullWidth: true,
      showActionsOnHover: true,
      label: dynamicTag.label,
      startIcon: /* @__PURE__ */ React91.createElement(DatabaseIcon3, { fontSize: SIZE7 }),
      ...bindTrigger2(selectionPopoverState),
      actions: /* @__PURE__ */ React91.createElement(React91.Fragment, null, /* @__PURE__ */ React91.createElement(DynamicSettingsPopover, { dynamicTag }), /* @__PURE__ */ React91.createElement(
        IconButton5,
        {
          size: SIZE7,
          onClick: removeDynamicTag,
          "aria-label": __64("Remove dynamic value", "elementor")
        },
        /* @__PURE__ */ React91.createElement(XIcon, { fontSize: SIZE7 })
      ))
    }
  ), /* @__PURE__ */ React91.createElement(
    Popover2,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...bindPopover2(selectionPopoverState)
    },
    /* @__PURE__ */ React91.createElement(Stack17, null, /* @__PURE__ */ React91.createElement(DynamicSelection, { close: selectionPopoverState.close }))
  ));
};
var DynamicSettingsPopover = ({ dynamicTag }) => {
  const popupState = usePopupState3({ variant: "popover" });
  const hasDynamicSettings = !!dynamicTag.atomic_controls.length;
  if (!hasDynamicSettings) {
    return null;
  }
  return /* @__PURE__ */ React91.createElement(React91.Fragment, null, /* @__PURE__ */ React91.createElement(IconButton5, { size: SIZE7, ...bindTrigger2(popupState), "aria-label": __64("Settings", "elementor") }, /* @__PURE__ */ React91.createElement(SettingsIcon, { fontSize: SIZE7 })), /* @__PURE__ */ React91.createElement(
    Popover2,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorOrigin: { vertical: "bottom", horizontal: "center" },
      PaperProps: {
        sx: { my: 0.5 }
      },
      ...bindPopover2(popupState)
    },
    /* @__PURE__ */ React91.createElement(
      PopoverHeader3,
      {
        title: dynamicTag.label,
        onClose: popupState.close,
        icon: /* @__PURE__ */ React91.createElement(DatabaseIcon3, { fontSize: SIZE7 })
      }
    ),
    /* @__PURE__ */ React91.createElement(DynamicSettings, { controls: dynamicTag.atomic_controls })
  ));
};
var DynamicSettings = ({ controls }) => {
  const tabs = controls.filter(({ type }) => type === "section");
  const { getTabsProps, getTabProps, getTabPanelProps } = useTabs2(0);
  if (!tabs.length) {
    return null;
  }
  return /* @__PURE__ */ React91.createElement(PopoverScrollableContent2, null, /* @__PURE__ */ React91.createElement(Tabs2, { size: "small", variant: "fullWidth", ...getTabsProps() }, tabs.map(({ value }, index) => /* @__PURE__ */ React91.createElement(Tab2, { key: index, label: value.label, sx: { px: 1, py: 0.5 }, ...getTabProps(index) }))), /* @__PURE__ */ React91.createElement(Divider8, null), tabs.map(({ value }, index) => {
    return /* @__PURE__ */ React91.createElement(TabPanel2, { key: index, sx: { flexGrow: 1, py: 0 }, ...getTabPanelProps(index) }, /* @__PURE__ */ React91.createElement(Stack17, { p: 2, gap: 2 }, value.items.map((item) => {
      if (item.type === "control") {
        return /* @__PURE__ */ React91.createElement(Control3, { key: item.value.bind, control: item.value });
      }
      return null;
    })));
  }));
};
var Control3 = ({ control }) => {
  if (!getControl(control.type)) {
    return null;
  }
  return /* @__PURE__ */ React91.createElement(DynamicControl, { bind: control.bind }, /* @__PURE__ */ React91.createElement(Grid5, { container: true, gap: 0.75 }, control.label ? /* @__PURE__ */ React91.createElement(Grid5, { item: true, xs: 12 }, /* @__PURE__ */ React91.createElement(ControlFormLabel5, null, control.label)) : null, /* @__PURE__ */ React91.createElement(Grid5, { item: true, xs: 12 }, /* @__PURE__ */ React91.createElement(Control, { type: control.type, props: control.props }))));
};

// src/dynamics/dynamic-transformer.ts
import { createTransformer } from "@elementor/editor-canvas";
import { isTransformable as isTransformable3 } from "@elementor/editor-props";

// src/dynamics/errors.ts
import { createError as createError2 } from "@elementor/utils";
var DynamicTagsManagerNotFoundError = createError2({
  code: "dynamic_tags_manager_not_found",
  message: "Dynamic tags manager not found"
});

// src/dynamics/dynamic-transformer.ts
var dynamicTransformer = createTransformer((value) => {
  if (!value.name) {
    return null;
  }
  return getDynamicValue(value.name, simpleTransform(value.settings ?? {}));
});
function simpleTransform(props) {
  const transformed = Object.entries(props).map(([settingKey, settingValue]) => {
    const value = isTransformable3(settingValue) ? settingValue.value : settingValue;
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
import * as React92 from "react";
import { useBoundProp as useBoundProp7 } from "@elementor/editor-controls";
import { DatabaseIcon as DatabaseIcon4 } from "@elementor/icons";
import { __ as __65 } from "@wordpress/i18n";
var usePropDynamicAction = () => {
  const { propType } = useBoundProp7();
  const visible = !!propType && supportsDynamic(propType);
  return {
    visible,
    icon: DatabaseIcon4,
    title: __65("Dynamic tags", "elementor"),
    content: ({ close }) => /* @__PURE__ */ React92.createElement(DynamicSelection, { close })
  };
};

// src/dynamics/init.ts
var { registerPopoverAction } = controlActionsMenu;
var init = () => {
  registerControlReplacement({
    component: DynamicSelectionControl,
    condition: ({ value }) => isDynamicPropValue(value)
  });
  injectIntoRepeaterItemLabel({
    id: "dynamic-background-image",
    condition: ({ value }) => isDynamicPropValue(value.value?.image?.value?.src),
    component: BackgroundControlDynamicTagLabel
  });
  injectIntoRepeaterItemIcon({
    id: "dynamic-background-image",
    condition: ({ value }) => isDynamicPropValue(value.value?.image?.value?.src),
    component: BackgroundControlDynamicTagIcon
  });
  registerPopoverAction({
    id: "dynamic-tags",
    useProps: usePropDynamicAction
  });
  styleTransformersRegistry.register("dynamic", dynamicTransformer);
  settingsTransformersRegistry.register("dynamic", dynamicTransformer);
};

// src/reset-style-props.tsx
import { useBoundProp as useBoundProp8 } from "@elementor/editor-controls";
import { BrushBigIcon } from "@elementor/icons";
import { __ as __66 } from "@wordpress/i18n";
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
  const { value, setValue, path, bind } = useBoundProp8();
  return {
    visible: isStyle && value !== null && value !== void 0 && path.length <= 2 && !EXCLUDED_BINDS.includes(bind),
    title: __66("Clear", "elementor"),
    icon: BrushBigIcon,
    onClick: () => setValue(null)
  };
}

// src/styles-inheritance/init-styles-inheritance-transformers.ts
import { createTransformer as createTransformer6, styleTransformersRegistry as styleTransformersRegistry2 } from "@elementor/editor-canvas";

// src/styles-inheritance/transformers/background-color-overlay-transformer.tsx
import * as React93 from "react";
import { createTransformer as createTransformer2 } from "@elementor/editor-canvas";
import { Stack as Stack18, styled as styled7, UnstableColorIndicator } from "@elementor/ui";
var backgroundColorOverlayTransformer = createTransformer2((value) => /* @__PURE__ */ React93.createElement(Stack18, { direction: "row", gap: 10 }, /* @__PURE__ */ React93.createElement(ItemIconColor, { value }), /* @__PURE__ */ React93.createElement(ItemLabelColor, { value })));
var ItemIconColor = ({ value }) => {
  const { color } = value;
  return /* @__PURE__ */ React93.createElement(StyledUnstableColorIndicator, { size: "inherit", component: "span", value: color });
};
var ItemLabelColor = ({ value: { color } }) => {
  return /* @__PURE__ */ React93.createElement("span", null, color);
};
var StyledUnstableColorIndicator = styled7(UnstableColorIndicator)(({ theme }) => ({
  borderRadius: `${theme.shape.borderRadius / 2}px`
}));

// src/styles-inheritance/transformers/background-gradient-overlay-transformer.tsx
import * as React94 from "react";
import { createTransformer as createTransformer3 } from "@elementor/editor-canvas";
import { Stack as Stack19 } from "@elementor/ui";
import { __ as __67 } from "@wordpress/i18n";
var backgroundGradientOverlayTransformer = createTransformer3((value) => /* @__PURE__ */ React94.createElement(Stack19, { direction: "row", gap: 10 }, /* @__PURE__ */ React94.createElement(ItemIconGradient, { value }), /* @__PURE__ */ React94.createElement(ItemLabelGradient, { value })));
var ItemIconGradient = ({ value }) => {
  const gradient = getGradientValue(value);
  return /* @__PURE__ */ React94.createElement(StyledUnstableColorIndicator, { size: "inherit", component: "span", value: gradient });
};
var ItemLabelGradient = ({ value }) => {
  if (value.type === "linear") {
    return /* @__PURE__ */ React94.createElement("span", null, __67("Linear Gradient", "elementor"));
  }
  return /* @__PURE__ */ React94.createElement("span", null, __67("Radial Gradient", "elementor"));
};
var getGradientValue = (gradient) => {
  const stops = gradient.stops?.map(({ color, offset }) => `${color} ${offset ?? 0}%`)?.join(",");
  if (gradient.type === "linear") {
    return `linear-gradient(${gradient.angle}deg, ${stops})`;
  }
  return `radial-gradient(circle at ${gradient.positions}, ${stops})`;
};

// src/styles-inheritance/transformers/background-image-overlay-transformer.tsx
import * as React95 from "react";
import { createTransformer as createTransformer4 } from "@elementor/editor-canvas";
import { EllipsisWithTooltip as EllipsisWithTooltip2 } from "@elementor/editor-ui";
import { CardMedia, Stack as Stack20 } from "@elementor/ui";
import { useWpMediaAttachment } from "@elementor/wp-media";
var backgroundImageOverlayTransformer = createTransformer4((value) => /* @__PURE__ */ React95.createElement(Stack20, { direction: "row", gap: 10 }, /* @__PURE__ */ React95.createElement(ItemIconImage, { value }), /* @__PURE__ */ React95.createElement(ItemLabelImage, { value })));
var ItemIconImage = ({ value }) => {
  const { imageUrl } = useImage(value);
  return /* @__PURE__ */ React95.createElement(
    CardMedia,
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
  return /* @__PURE__ */ React95.createElement(EllipsisWithTooltip2, { title: imageTitle }, /* @__PURE__ */ React95.createElement("span", null, imageTitle));
};
var useImage = (image) => {
  let imageTitle, imageUrl = null;
  const imageSrc = image?.image.src;
  const { data: attachment } = useWpMediaAttachment(imageSrc.id || null);
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
import * as React96 from "react";
import { createTransformer as createTransformer5 } from "@elementor/editor-canvas";
import { Stack as Stack21 } from "@elementor/ui";
var backgroundOverlayTransformer = createTransformer5((values) => {
  if (!values || values.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React96.createElement(Stack21, { direction: "column" }, values.map((item, index) => /* @__PURE__ */ React96.createElement(Stack21, { key: index }, item)));
});

// src/styles-inheritance/init-styles-inheritance-transformers.ts
function initStylesInheritanceTransformers() {
  const originalStyleTransformers = styleTransformersRegistry2.all();
  Object.entries(originalStyleTransformers).forEach(([propType, transformer]) => {
    if (excludePropTypeTransformers.has(propType)) {
      return;
    }
    stylesInheritanceTransformersRegistry.register(propType, transformer);
  });
  stylesInheritanceTransformersRegistry.registerFallback(
    createTransformer6((value) => {
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
  registerPanel(panel);
  blockV1Panel();
  injectIntoLogic({
    id: "editing-panel-hooks",
    component: EditingPanelHooks
  });
  injectIntoLogic({
    id: "current-user-data",
    component: PrefetchUserData
  });
  init();
  init2();
  if (isExperimentActive18(EXPERIMENTAL_FEATURES.V_3_30)) {
    initResetStyleProps();
  }
}
var blockV1Panel = () => {
  blockCommand({
    command: "panel/editor/open",
    condition: isAtomicWidgetSelected
  });
};
export {
  EXPERIMENTAL_FEATURES,
  PopoverScrollableContent,
  controlActionsMenu,
  init3 as init,
  injectIntoClassSelectorActions,
  registerControlReplacement,
  registerStyleProviderToColors,
  useBoundProp9 as useBoundProp,
  useFontFamilies,
  usePanelActions,
  usePanelStatus,
  useSectionWidth
};
//# sourceMappingURL=index.mjs.map