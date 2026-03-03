// src/components/css-classes/css-class-convert-local.tsx
import * as React4 from "react";
import { deleteElementStyle, getElementSetting, updateElementSettings } from "@elementor/editor-elements";
import { classesPropTypeUtil } from "@elementor/editor-props";
import { createLocation } from "@elementor/locations";
import { useSessionStorage } from "@elementor/session";

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
function ElementProvider({ children, element, elementType, settings }) {
  return /* @__PURE__ */ React2.createElement(Context2.Provider, { value: { element, elementType, settings } }, children);
}
function useElement() {
  const context = useContext2(Context2);
  if (!context) {
    throw new Error("useElement must be used within a ElementProvider");
  }
  return context;
}
function usePanelElementSetting(propKey) {
  const context = useContext2(Context2);
  if (!context) {
    throw new Error("usePanelElementSetting must be used within a ElementProvider");
  }
  return context.settings[propKey] ?? null;
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
var ControlTypeAlreadyRegisteredError = createError({
  code: "control_type_already_registered",
  message: "Control type is already registered."
});
var ControlTypeNotRegisteredError = createError({
  code: "control_type_not_registered",
  message: "Control type is not registered."
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

// src/components/css-classes/css-class-convert-local.tsx
var { Slot: CssClassConvertSlot, inject: injectIntoCssClassConvert } = createLocation();
var CssClassConvert = (props) => {
  const { element } = useElement();
  const elementId = element.id;
  const currentClassesProp = useClassesProp();
  const { setId: setActiveId } = useStyle();
  const [, saveValue] = useSessionStorage("last-converted-class-generated-name", "app");
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
  deleteElementStyle(elementId, opts.styleDef.id);
  const currentUsedClasses = getElementSetting(elementId, classesProp) || { value: [] };
  updateElementSettings({
    id: elementId,
    props: { [classesProp]: classesPropTypeUtil.create([newId, ...currentUsedClasses.value]) },
    withHistory: false
  });
};

// src/components/css-classes/css-class-selector.tsx
import * as React10 from "react";
import { useRef, useState as useState4 } from "react";
import {
  isElementsStylesProvider as isElementsStylesProvider4,
  stylesRepository as stylesRepository5,
  useProviders,
  useUserStylesCapability as useUserStylesCapability4,
  validateStyleLabel as validateStyleLabel2
} from "@elementor/editor-styles-repository";
import { InfoAlert, WarningInfotip } from "@elementor/editor-ui";
import { ColorSwatchIcon, MapPinIcon } from "@elementor/icons";
import { createLocation as createLocation2 } from "@elementor/locations";
import {
  Box as Box2,
  Chip as Chip3,
  FormLabel,
  Link,
  Stack as Stack3,
  Typography as Typography3
} from "@elementor/ui";
import { __ as __5 } from "@wordpress/i18n";

// src/utils/get-styles-provider-color.ts
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY, isElementsStylesProvider } from "@elementor/editor-styles-repository";

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
function getTempStylesProviderThemeColor(provider) {
  if (isElementsStylesProvider(provider)) {
    return (theme) => theme.palette.primary.main;
  }
  return getStylesProviderThemeColor(provider);
}

// src/utils/tracking/subscribe.ts
import { stylesRepository as stylesRepository2 } from "@elementor/editor-styles-repository";
var trackStyles = (provider, event, data) => {
  const providerInstance = stylesRepository2.getProviderByKey(provider);
  providerInstance?.actions.tracking?.({ event, ...data });
};

// src/components/creatable-autocomplete/creatable-autocomplete.tsx
import * as React5 from "react";
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
  return /* @__PURE__ */ React5.createElement(
    Autocomplete,
    {
      renderTags: (tagValue, getTagProps) => {
        return tagValue.map((option, index) => /* @__PURE__ */ React5.createElement(
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
      ListboxComponent: error ? React5.forwardRef((_, errorTextRef) => /* @__PURE__ */ React5.createElement(ErrorText, { ref: errorTextRef, error })) : void 0,
      renderGroup: (params) => /* @__PURE__ */ React5.createElement(Group, { ...params }),
      inputValue,
      renderInput: (params) => {
        return /* @__PURE__ */ React5.createElement(
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
  const id = `combobox-group-${useId().replace(/:/g, "_")}`;
  return /* @__PURE__ */ React5.createElement(StyledGroup, { role: "group", "aria-labelledby": id }, /* @__PURE__ */ React5.createElement(StyledGroupHeader, { id }, " ", params.group), /* @__PURE__ */ React5.createElement(StyledGroupItems, { role: "listbox" }, params.children));
};
var ErrorText = React5.forwardRef(({ error = "error" }, ref) => {
  return /* @__PURE__ */ React5.createElement(
    Box,
    {
      ref,
      sx: (theme) => ({
        padding: theme.spacing(2)
      })
    },
    /* @__PURE__ */ React5.createElement(Typography, { variant: "caption", sx: { color: "error.main", display: "inline-block" } }, error)
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
import * as React9 from "react";
import { useEffect, useMemo as useMemo3, useState as useState3 } from "react";
import { isClassState } from "@elementor/editor-styles";
import { stylesRepository as stylesRepository4, useUserStylesCapability as useUserStylesCapability3, validateStyleLabel } from "@elementor/editor-styles-repository";
import { EditableField, EllipsisWithTooltip, useEditable } from "@elementor/editor-ui";
import { DotsVerticalIcon } from "@elementor/icons";
import { useSessionStorage as useSessionStorage2 } from "@elementor/session";
import {
  bindTrigger,
  Chip as Chip2,
  Stack as Stack2,
  ThemeProvider,
  Typography as Typography2,
  UnstableChipGroup,
  usePopupState
} from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";

// src/components/css-classes/css-class-context.tsx
import * as React6 from "react";
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
  return /* @__PURE__ */ React6.createElement(CssClassContext.Provider, { value: contextValue }, children);
}

// src/components/css-classes/css-class-menu.tsx
import * as React8 from "react";
import {
  isElementsStylesProvider as isElementsStylesProvider3,
  stylesRepository as stylesRepository3,
  useUserStylesCapability as useUserStylesCapability2
} from "@elementor/editor-styles-repository";
import { MenuItemInfotip, MenuListItem } from "@elementor/editor-ui";
import { bindMenu, Divider, Menu, MenuSubheader as MenuSubheader2, Stack } from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";

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

// src/components/css-classes/local-class-sub-menu.tsx
import * as React7 from "react";
import { MenuSubheader } from "@elementor/ui";
import { __ } from "@wordpress/i18n";

// src/components/css-classes/use-can-convert-local-class-to-global.ts
import { isElementsStylesProvider as isElementsStylesProvider2 } from "@elementor/editor-styles-repository";
var useCanConvertLocalClassToGlobal = () => {
  const { element } = useElement();
  const { provider, id, meta } = useStyle();
  const styleDef = provider?.actions.get(id, { elementId: element.id, ...meta });
  const isLocalStylesProvider = provider && isElementsStylesProvider2(provider?.getKey());
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
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(MenuSubheader, { sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1 } }, __("Local Class", "elementor")), /* @__PURE__ */ React7.createElement(CssClassConvert, { canConvert, styleDef, closeMenu: props.popupState.close }));
};

// src/components/css-classes/use-apply-and-unapply-class.ts
import { useCallback, useMemo as useMemo2 } from "react";
import { getElementLabel } from "@elementor/editor-elements";
import { useGetStylesRepositoryCreateAction } from "@elementor/editor-styles-repository";
import { undoable } from "@elementor/editor-v1-adapters";
import { __ as __2 } from "@wordpress/i18n";

// src/apply-unapply-actions.ts
import { setDocumentModifiedStatus } from "@elementor/editor-documents";
import { getElementSetting as getElementSetting2, updateElementSettings as updateElementSettings2 } from "@elementor/editor-elements";
import { classesPropTypeUtil as classesPropTypeUtil2 } from "@elementor/editor-props";
function doGetAppliedClasses(elementId, classesPropType = "classes") {
  return getElementSetting2(elementId, classesPropType)?.value || [];
}
function doApplyClasses(elementId, classIds, classesPropType = "classes") {
  updateElementSettings2({
    id: elementId,
    props: { [classesPropType]: classesPropTypeUtil2.create(classIds) },
    withHistory: false
  });
  setDocumentModifiedStatus(true);
}
function doUnapplyClass(elementId, classId, classesPropType = "classes") {
  const appliedClasses = getElementSetting2(elementId, classesPropType)?.value || [];
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
  return useMemo2(() => {
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
          return __2(`class %s applied`, "elementor").replace("%s", classLabel);
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
  return useMemo2(() => {
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
          return __2(`class %s removed`, "elementor").replace("%s", classLabel);
        }
      }
    );
  }, [activeId, applyClass, element.id, unapplyClass, setActiveId]);
}
function useCreateAndApplyClass() {
  const { id: activeId, setId: setActiveId } = useStyle();
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
        title: __2("Class", "elementor"),
        subtitle: ({ classLabel }) => {
          return __2(`%s created`, "elementor").replace("%s", classLabel);
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
  return useMemo2(() => {
    const setClasses = (ids) => {
      doApplyClasses(element.id, ids, currentClassesProp);
    };
    const getAppliedClasses = () => doGetAppliedClasses(element.id, currentClassesProp) || [];
    return { setClasses, getAppliedClasses };
  }, [currentClassesProp, element.id]);
}

// src/components/css-classes/css-class-menu.tsx
var DEFAULT_PSEUDO_STATES = [
  { key: "normal", value: null, label: __3("normal", "elementor") },
  { key: "hover", value: "hover", label: __3("hover", "elementor") },
  { key: "focus", value: "focus", label: __3("focus", "elementor") },
  { key: "active", value: "active", label: __3("active", "elementor") }
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
  const isLocalStyle2 = provider ? isElementsStylesProvider3(provider) : true;
  const pseudoStates = usePseudoStates();
  const handleKeyDown = (e) => {
    e.stopPropagation();
  };
  return /* @__PURE__ */ React8.createElement(
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
    isLocalStyle2 && /* @__PURE__ */ React8.createElement(LocalClassSubMenu, { popupState }),
    getMenuItemsByProvider({ provider, closeMenu: popupState.close, fixed }),
    /* @__PURE__ */ React8.createElement(MenuSubheader2, { sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1 } }, __3("States", "elementor")),
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
  const customTitle = __3("%s States", "elementor").replace("%s", elementTitle);
  return /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement(Divider, null), /* @__PURE__ */ React8.createElement(MenuSubheader2, { sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1 } }, customTitle), elementStates.map((state) => {
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
    label: __3("selected", "elementor")
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
  const styleDef = stylesRepository3.all().find((style) => style.id === styleId);
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
  const providerInstance = stylesRepository3.getProviderByKey(provider);
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
        MenuSubheader2,
        {
          key: "provider-label",
          sx: { typography: "caption", color: "text.secondary", pb: 0.5, pt: 1, textTransform: "capitalize" }
        },
        providerInstance?.labels?.singular
      )
    );
    actions.push(/* @__PURE__ */ React8.createElement(Divider, { key: "provider-actions-divider" }));
  }
  return actions;
}
function StateMenuItem({ state, label, closeMenu, ...props }) {
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
  return /* @__PURE__ */ React8.createElement(
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
      MenuItemInfotip,
      {
        showInfoTip: disabled,
        content: __3("With your current role, you can only use existing states.", "elementor")
      },
      /* @__PURE__ */ React8.createElement(Stack, { gap: 0.75, direction: "row", alignItems: "center" }, isStyled && /* @__PURE__ */ React8.createElement(
        StyleIndicator,
        {
          "aria-label": __3("Has style", "elementor"),
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
    MenuListItem,
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
    __3("Remove", "elementor")
  ) : null;
}
function RenameClassMenuItem({ closeMenu }) {
  const { handleRename, provider } = useCssClass();
  const { userCan } = useUserStylesCapability2();
  if (!provider) {
    return null;
  }
  const isAllowed = userCan(provider).update;
  return /* @__PURE__ */ React8.createElement(
    MenuListItem,
    {
      disabled: !isAllowed,
      onClick: () => {
        closeMenu();
        handleRename();
      }
    },
    /* @__PURE__ */ React8.createElement(
      MenuItemInfotip,
      {
        showInfoTip: !isAllowed,
        content: __3(
          "With your current role, you can use existing classes but can\u2019t modify them.",
          "elementor"
        )
      },
      __3("Rename", "elementor")
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
  const popupState = usePopupState({ variant: "popover" });
  const [chipRef, setChipRef] = useState3(null);
  const { onDelete, ...chipGroupProps } = chipProps;
  const { userCan } = useUserStylesCapability3();
  const [convertedFromLocalId, , clearConvertedFromLocalId] = useSessionStorage2(
    "last-converted-class-generated-name",
    "app"
  );
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
  const providerActions = provider ? stylesRepository4.getProviderByKey(provider)?.actions : null;
  const allowRename = Boolean(providerActions?.update) && userCan(provider ?? "")?.update;
  const isShowingState = isActive && meta.state;
  const stateLabel = useMemo3(() => {
    if (meta.state && isClassState(meta.state)) {
      return elementStates.find((state) => state.value === meta.state)?.label;
    }
    return meta.state;
  }, [meta.state, elementStates]);
  useEffect(() => {
    if (convertedFromLocalId && id === convertedFromLocalId) {
      clearConvertedFromLocalId();
      openEditMode();
    }
  }, [id, convertedFromLocalId]);
  return /* @__PURE__ */ React9.createElement(ThemeProvider, { palette: "default" }, /* @__PURE__ */ React9.createElement(
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
    /* @__PURE__ */ React9.createElement(
      Chip2,
      {
        size: CHIP_SIZE,
        label: isEditing ? /* @__PURE__ */ React9.createElement(EditableField, { ref, ...getEditableProps() }) : /* @__PURE__ */ React9.createElement(EllipsisWithTooltip, { maxWidth: "10ch", title: label, as: "div" }),
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
      Chip2,
      {
        icon: isShowingState ? void 0 : /* @__PURE__ */ React9.createElement(DotsVerticalIcon, { fontSize: "tiny" }),
        size: CHIP_SIZE,
        label: isShowingState ? /* @__PURE__ */ React9.createElement(Stack2, { direction: "row", gap: 0.5, alignItems: "center" }, /* @__PURE__ */ React9.createElement(Typography2, { variant: "inherit" }, stateLabel), /* @__PURE__ */ React9.createElement(DotsVerticalIcon, { fontSize: "tiny" })) : void 0,
        variant: "filled",
        shape: "rounded",
        color,
        ...bindTrigger(popupState),
        "aria-label": __4("Open CSS Class Menu", "elementor"),
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
  label: __5("local", "elementor"),
  value: null,
  fixed: true,
  color: getTempStylesProviderColorName("accent"),
  icon: /* @__PURE__ */ React10.createElement(MapPinIcon, null),
  provider: null
};
var { Slot: ClassSelectorActionsSlot, inject: injectIntoClassSelectorActions } = createLocation2();
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
  return /* @__PURE__ */ React10.createElement(Stack3, { p: 2 }, /* @__PURE__ */ React10.createElement(Stack3, { direction: "row", gap: 1, alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React10.createElement(FormLabel, { htmlFor: ID, size: "small" }, __5("Classes", "elementor")), /* @__PURE__ */ React10.createElement(Stack3, { direction: "row", gap: 1 }, /* @__PURE__ */ React10.createElement(ClassSelectorActionsSlot, null))), /* @__PURE__ */ React10.createElement(
    WarningInfotip,
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
        placeholder: showPlaceholder ? __5("Type class name", "elementor") : void 0,
        options: options12,
        selected: appliedOptions,
        entityName,
        onSelect: handleSelect,
        onCreate: create ?? void 0,
        validate: validate ?? void 0,
        limitTags: TAGS_LIMIT,
        renderEmptyState: EmptyState,
        getLimitTagsText: (more) => /* @__PURE__ */ React10.createElement(Chip3, { size: "tiny", variant: "standard", label: `+${more}`, clickable: true }),
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
  ), !canEdit && /* @__PURE__ */ React10.createElement(InfoAlert, { sx: { mt: 1 } }, __5("With your current role, you can use existing classes but can\u2019t modify them.", "elementor")));
}
var EmptyState = ({ searchValue, onClear }) => /* @__PURE__ */ React10.createElement(Box2, { sx: { py: 4 } }, /* @__PURE__ */ React10.createElement(
  Stack3,
  {
    gap: 1,
    alignItems: "center",
    color: "text.secondary",
    justifyContent: "center",
    sx: { px: 2, m: "auto", maxWidth: "236px" }
  },
  /* @__PURE__ */ React10.createElement(ColorSwatchIcon, { sx: { transform: "rotate(90deg)" }, fontSize: "large" }),
  /* @__PURE__ */ React10.createElement(Typography3, { align: "center", variant: "subtitle2" }, __5("Sorry, nothing matched", "elementor"), /* @__PURE__ */ React10.createElement("br", null), "\u201C", searchValue, "\u201D."),
  /* @__PURE__ */ React10.createElement(Typography3, { align: "center", variant: "caption", sx: { mb: 2 } }, __5("With your current role,", "elementor"), /* @__PURE__ */ React10.createElement("br", null), __5("you can only use existing classes.", "elementor")),
  /* @__PURE__ */ React10.createElement(Link, { color: "text.secondary", variant: "caption", component: "button", onClick: onClear }, __5("Clear & try again", "elementor"))
));
var updateClassByProvider = (provider, data) => {
  if (!provider) {
    return;
  }
  const providerInstance = stylesRepository5.getProviderByKey(provider);
  if (!providerInstance) {
    return;
  }
  return providerInstance.actions.update?.(data);
};
function useOptions() {
  const { element } = useElement();
  const isProviderEditable = (provider) => !!provider.actions.updateProps;
  return useProviders().filter(isProviderEditable).flatMap((provider) => {
    const isElements = isElementsStylesProvider4(provider.getKey());
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
        icon: isElements ? /* @__PURE__ */ React10.createElement(MapPinIcon, null) : null,
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
        errorMessage: __5(
          "You\u2019ve reached the limit of %s classes. Please remove an existing one to create a new class.",
          "elementor"
        ).replace("%s", provider.limit.toString())
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
  const currentClassesProp = useClassesProp();
  const appliedIds = usePanelElementSetting(currentClassesProp)?.value ?? [];
  const appliedOptions = options12.filter((option) => option.value && appliedIds.includes(option.value));
  const hasElementsProviderStyleApplied = appliedOptions.some(
    (option) => option.provider && isElementsStylesProvider4(option.provider)
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
import * as React11 from "react";
import { getBreakpointsTree } from "@elementor/editor-responsive";
import { getVariantByMeta as getVariantByMeta3 } from "@elementor/editor-styles";

// src/hooks/use-custom-css.ts
import { useMemo as useMemo5 } from "react";
import {
  createElementStyle as createElementStyle2,
  deleteElementStyle as deleteElementStyle3,
  shouldCreateNewLocalStyle as shouldCreateNewLocalStyle2
} from "@elementor/editor-elements";
import { stringPropTypeUtil } from "@elementor/editor-props";
import {
  getVariantByMeta as getVariantByMeta2
} from "@elementor/editor-styles";
import { ELEMENTS_STYLES_RESERVED_LABEL as ELEMENTS_STYLES_RESERVED_LABEL2 } from "@elementor/editor-styles-repository";
import { undoable as undoable3 } from "@elementor/editor-v1-adapters";
import { decodeString, encodeString } from "@elementor/utils";

// src/hooks/use-styles-fields.ts
import { useMemo as useMemo4 } from "react";
import {
  createElementStyle,
  deleteElementStyle as deleteElementStyle2,
  getElementLabel as getElementLabel2,
  shouldCreateNewLocalStyle
} from "@elementor/editor-elements";
import { getVariantByMeta } from "@elementor/editor-styles";
import { isElementsStylesProvider as isElementsStylesProvider5 } from "@elementor/editor-styles-repository";
import { ELEMENTS_STYLES_RESERVED_LABEL } from "@elementor/editor-styles-repository";
import { undoable as undoable2 } from "@elementor/editor-v1-adapters";
import { __ as __6 } from "@wordpress/i18n";

// src/hooks/use-styles-rerender.ts
import { useEffect as useEffect2, useReducer } from "react";
var useStylesRerender = () => {
  const { provider } = useStyle();
  const [, reRender] = useReducer((p) => !p, false);
  useEffect2(() => provider?.subscribe(reRender), [provider]);
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
  const variant = getVariantByMeta(style, meta);
  return Object.fromEntries(
    propNames.map((key) => [key, variant?.props[key] ?? null])
  );
}
function useUndoableActions({
  elementId,
  meta: { breakpoint, state }
}) {
  const classesProp = useClassesProp();
  return useMemo4(() => {
    const meta = { breakpoint, state };
    const createStyleArgs = { elementId, classesProp, meta, label: ELEMENTS_STYLES_RESERVED_LABEL };
    return undoable2(
      {
        do: (payload) => {
          if (shouldCreateNewLocalStyle(payload)) {
            return create(payload);
          }
          return update(payload);
        },
        undo: (payload, doReturn) => {
          const wasLocalStyleCreated = shouldCreateNewLocalStyle(payload);
          if (wasLocalStyleCreated) {
            return undoCreate(payload, doReturn);
          }
          return undo(payload, doReturn);
        },
        redo: (payload, doReturn) => {
          const wasLocalStyleCreated = shouldCreateNewLocalStyle(payload);
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
      const createdStyle = createElementStyle({ ...createStyleArgs, props, styleId: redoArgs?.createdStyleId });
      return { createdStyleId: createdStyle };
    }
    function undoCreate(_, { createdStyleId }) {
      deleteElementStyle2(elementId, createdStyleId);
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
  const variant = getVariantByMeta(style, meta);
  const props = variant?.props ?? {};
  return structuredClone(props);
}
var defaultHistoryTitles = {
  title: ({ provider }) => {
    const providerLabel = provider.labels?.singular;
    return providerLabel ? capitalize(providerLabel) : __6("Style", "elementor");
  },
  subtitle: ({ provider, styleId, elementId, propDisplayName }) => {
    const styleLabel = provider.actions.get(styleId, { elementId })?.label;
    if (!styleLabel) {
      throw new Error(`Style ${styleId} not found`);
    }
    return __6(`%s$1 %s$2 edited`, "elementor").replace("%s$1", styleLabel).replace("%s$2", propDisplayName);
  }
};
var localStyleHistoryTitles = {
  title: ({ elementId }) => getElementLabel2(elementId),
  subtitle: ({ propDisplayName }) => (
    // translators: %s is the name of the style property being edited
    __6(`%s edited`, "elementor").replace("%s", propDisplayName)
  )
};
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
var isLocalStyle = (provider, styleId) => !provider || !styleId || isElementsStylesProvider5(provider.getKey());
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
  const variant = style ? getVariantByMeta2(style, meta) : null;
  const setCustomCss = (raw, { history: { propDisplayName } }) => {
    const newValue = { raw: encodeString(sanitize(raw)) };
    undoableUpdateStyle({
      styleId: currentStyleId,
      provider: currentProvider,
      customCss: newValue,
      propDisplayName
    });
  };
  const customCss = variant?.custom_css?.raw ? { raw: decodeString(variant.custom_css.raw) } : null;
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
  return useMemo5(() => {
    const meta = { breakpoint, state };
    const createStyleArgs = { elementId, classesProp, meta, label: ELEMENTS_STYLES_RESERVED_LABEL2 };
    return undoable3(
      {
        do: (payload) => {
          if (shouldCreateNewLocalStyle2(payload)) {
            return create(payload);
          }
          return update(payload);
        },
        undo: (payload, doReturn) => {
          if (shouldCreateNewLocalStyle2(payload)) {
            return undoCreate(payload, doReturn);
          }
          return undoUpdate(payload, doReturn);
        },
        redo: (payload, doReturn) => {
          if (shouldCreateNewLocalStyle2(payload)) {
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
      const createdStyle = createElementStyle2({
        ...createStyleArgs,
        props: {},
        custom_css: customCss ?? null,
        styleId: redoArgs?.createdStyleId
      });
      return { createdStyleId: createdStyle };
    }
    function undoCreate(_, { createdStyleId }) {
      deleteElementStyle3(elementId, createdStyleId);
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
  const variant = getVariantByMeta2(style, meta);
  return variant?.custom_css ?? null;
}
function sanitize(raw) {
  return stringPropTypeUtil.schema.safeParse(stringPropTypeUtil.create(raw)).data?.value?.trim() ?? "";
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
  const root = getBreakpointsTree();
  const state = meta.state;
  function search(node, ancestorHasCss) {
    if (!style) {
      return void 0;
    }
    const hasHere = Boolean(
      getVariantByMeta3(style, {
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
import * as React81 from "react";
import {
  ControlActionsProvider,
  ControlReplacementsProvider,
  getControlReplacements
} from "@elementor/editor-controls";
import { useSelectedElementSettings } from "@elementor/editor-elements";
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from "@elementor/editor-panels";
import { ThemeProvider as ThemeProvider3 } from "@elementor/editor-ui";
import { AtomIcon } from "@elementor/icons";
import { createLocation as createLocation4 } from "@elementor/locations";
import { controlActionsMenu } from "@elementor/menus";
import { SessionStorageProvider as SessionStorageProvider3 } from "@elementor/session";
import { ErrorBoundary } from "@elementor/ui";
import { __ as __55 } from "@wordpress/i18n";

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
import * as React12 from "react";
import { Alert, Box as Box3 } from "@elementor/ui";
function EditorPanelErrorFallback() {
  return /* @__PURE__ */ React12.createElement(Box3, { role: "alert", sx: { minHeight: "100%", p: 2 } }, /* @__PURE__ */ React12.createElement(Alert, { severity: "error", sx: { mb: 2, maxWidth: 400, textAlign: "center" } }, /* @__PURE__ */ React12.createElement("strong", null, "Something went wrong")));
}

// src/components/editing-panel-tabs.tsx
import { Fragment as Fragment9 } from "react";
import * as React80 from "react";
import { isExperimentActive } from "@elementor/editor-v1-adapters";
import { Divider as Divider6, Stack as Stack13, Tab, TabPanel, Tabs, useTabs } from "@elementor/ui";
import { __ as __54 } from "@wordpress/i18n";

// src/contexts/scroll-context.tsx
import * as React13 from "react";
import { createContext as createContext5, useContext as useContext5, useEffect as useEffect3, useRef as useRef2, useState as useState5 } from "react";
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
  useEffect3(() => {
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
import { getSessionStorageItem, setSessionStorageItem } from "@elementor/session";
var useStateByElement = (key, initialValue) => {
  const { element } = useElement();
  const lookup = `elementor/editor-state/${element.id}/${key}`;
  const storedValue = getSessionStorageItem(lookup);
  const [value, setValue] = useState6(storedValue ?? initialValue);
  const doUpdate = (newValue) => {
    setSessionStorageItem(lookup, newValue);
    setValue(newValue);
  };
  return [value, doUpdate];
};

// src/components/interactions-tab.tsx
import * as React15 from "react";
import { InteractionsTab as InteractionsTabContent } from "@elementor/editor-interactions";

// src/components/sections-list.tsx
import * as React14 from "react";
import { List } from "@elementor/ui";
function SectionsList(props) {
  return /* @__PURE__ */ React14.createElement(List, { disablePadding: true, component: "div", ...props });
}

// src/components/interactions-tab.tsx
var InteractionsTab = () => {
  const { element } = useElement();
  return /* @__PURE__ */ React15.createElement(SectionsList, null, /* @__PURE__ */ React15.createElement(InteractionsTabContent, { elementId: element.id }));
};

// src/components/settings-tab.tsx
import * as React22 from "react";
import { SessionStorageProvider } from "@elementor/session";

// src/components/section.tsx
import * as React16 from "react";
import { useId as useId2, useRef as useRef3 } from "react";
import { CollapseIcon, getCollapsibleValue, SectionRefContext } from "@elementor/editor-ui";
import { Collapse, Divider as Divider2, ListItemButton, ListItemText, Stack as Stack4 } from "@elementor/ui";
function Section({ title, children, defaultExpanded = false, titleEnd, unmountOnExit = true, action }) {
  const [isOpen, setIsOpen] = useStateByElement(title, !!defaultExpanded);
  const ref = useRef3(null);
  const isDisabled = !!action;
  const handleClick = () => {
    if (isDisabled) {
      action?.onClick();
    } else {
      setIsOpen(!isOpen);
    }
  };
  const id = useId2();
  const labelId = `label-${id}`;
  const contentId = `content-${id}`;
  return /* @__PURE__ */ React16.createElement(React16.Fragment, null, /* @__PURE__ */ React16.createElement(
    ListItemButton,
    {
      id: labelId,
      "aria-controls": contentId,
      "aria-label": `${title} section`,
      onClick: handleClick,
      sx: { "&:hover": { backgroundColor: "transparent" } }
    },
    /* @__PURE__ */ React16.createElement(Stack4, { direction: "row", alignItems: "center", justifyItems: "start", flexGrow: 1, gap: 0.5 }, /* @__PURE__ */ React16.createElement(
      ListItemText,
      {
        secondary: title,
        secondaryTypographyProps: { color: "text.primary", variant: "caption", fontWeight: "bold" },
        sx: { flexGrow: 0, flexShrink: 1, marginInlineEnd: 1 }
      }
    ), getCollapsibleValue(titleEnd, isOpen)),
    action?.component,
    /* @__PURE__ */ React16.createElement(
      CollapseIcon,
      {
        open: isOpen,
        color: "secondary",
        fontSize: "tiny",
        disabled: isDisabled,
        sx: { ml: 1 }
      }
    )
  ), /* @__PURE__ */ React16.createElement(
    Collapse,
    {
      id: contentId,
      "aria-labelledby": labelId,
      in: isOpen,
      timeout: "auto",
      unmountOnExit
    },
    /* @__PURE__ */ React16.createElement(SectionRefContext.Provider, { value: ref }, /* @__PURE__ */ React16.createElement(Stack4, { ref, gap: 2.5, p: 2, "aria-label": `${title} section content` }, children))
  ), /* @__PURE__ */ React16.createElement(Divider2, null));
}

// src/components/settings-control.tsx
import * as React21 from "react";
import { ControlAdornmentsProvider } from "@elementor/editor-controls";
import { Divider as Divider3, styled as styled5 } from "@elementor/ui";

// src/controls-registry/control.tsx
import * as React17 from "react";

// src/controls-registry/controls-registry.tsx
import {
  ChipsControl,
  DateTimeControl,
  EmailFormActionControl,
  HtmlTagControl,
  ImageControl,
  InlineEditingControl,
  KeyValueControl,
  LinkControl,
  NumberControl,
  QueryControl,
  RepeatableControl,
  SelectControlWrapper,
  SizeControl,
  SvgMediaControl,
  SwitchControl,
  TextAreaControl,
  TextControl,
  ToggleControl,
  UrlControl,
  VideoMediaControl
} from "@elementor/editor-controls";
import {
  booleanPropTypeUtil,
  DateTimePropTypeUtil,
  emailPropTypeUtil,
  htmlV3PropTypeUtil,
  imagePropTypeUtil,
  imageSrcPropTypeUtil,
  keyValuePropTypeUtil,
  linkPropTypeUtil,
  numberPropTypeUtil,
  queryPropTypeUtil,
  sizePropTypeUtil,
  stringArrayPropTypeUtil,
  stringPropTypeUtil as stringPropTypeUtil2,
  videoSrcPropTypeUtil
} from "@elementor/editor-props";
var controlTypes = {
  image: { component: ImageControl, layout: "custom", propTypeUtil: imagePropTypeUtil },
  "svg-media": { component: SvgMediaControl, layout: "full", propTypeUtil: imageSrcPropTypeUtil },
  text: { component: TextControl, layout: "full", propTypeUtil: stringPropTypeUtil2 },
  textarea: { component: TextAreaControl, layout: "full", propTypeUtil: stringPropTypeUtil2 },
  size: { component: SizeControl, layout: "two-columns", propTypeUtil: sizePropTypeUtil },
  select: { component: SelectControlWrapper, layout: "two-columns", propTypeUtil: stringPropTypeUtil2 },
  chips: { component: ChipsControl, layout: "full", propTypeUtil: stringArrayPropTypeUtil },
  link: { component: LinkControl, layout: "custom", propTypeUtil: linkPropTypeUtil },
  query: { component: QueryControl, layout: "full", propTypeUtil: queryPropTypeUtil },
  url: { component: UrlControl, layout: "full", propTypeUtil: stringPropTypeUtil2 },
  switch: { component: SwitchControl, layout: "two-columns", propTypeUtil: booleanPropTypeUtil },
  number: { component: NumberControl, layout: "two-columns", propTypeUtil: numberPropTypeUtil },
  repeatable: { component: RepeatableControl, layout: "full", propTypeUtil: void 0 },
  "key-value": { component: KeyValueControl, layout: "full", propTypeUtil: keyValuePropTypeUtil },
  "html-tag": { component: HtmlTagControl, layout: "two-columns", propTypeUtil: stringPropTypeUtil2 },
  toggle: { component: ToggleControl, layout: "full", propTypeUtil: stringPropTypeUtil2 },
  "date-time": { component: DateTimeControl, layout: "full", propTypeUtil: DateTimePropTypeUtil },
  video: { component: VideoMediaControl, layout: "full", propTypeUtil: videoSrcPropTypeUtil },
  "inline-editing": { component: InlineEditingControl, layout: "full", propTypeUtil: htmlV3PropTypeUtil },
  email: { component: EmailFormActionControl, layout: "custom", propTypeUtil: emailPropTypeUtil }
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
import * as React18 from "react";
import { Box as Box4, styled as styled4 } from "@elementor/ui";
var ControlTypeContainer = ({ children, layout }) => {
  if (layout === "custom") {
    return children;
  }
  return /* @__PURE__ */ React18.createElement(StyledContainer, { layout }, children);
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
import * as React19 from "react";
import { useMemo as useMemo7 } from "react";
import { PropKeyProvider, PropProvider } from "@elementor/editor-controls";
import { setDocumentModifiedStatus as setDocumentModifiedStatus2 } from "@elementor/editor-documents";
import { getElementLabel as getElementLabel3, getElementSettings, updateElementSettings as updateElementSettings3 } from "@elementor/editor-elements";
import {
  isDependency,
  isDependencyMet as isDependencyMet2
} from "@elementor/editor-props";
import { undoable as undoable4 } from "@elementor/editor-v1-adapters";
import { __ as __7 } from "@wordpress/i18n";

// src/utils/prop-dependency-utils.ts
import {
  extractValue,
  isDependencyMet
} from "@elementor/editor-props";
import { getSessionStorageItem as getSessionStorageItem2, removeSessionStorageItem, setSessionStorageItem as setSessionStorageItem2 } from "@elementor/session";
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
        previousValues: isDependencyMet(propType.dependencies, elementValues),
        newValues: isDependencyMet(propType.dependencies, combinedValues)
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
      const value = extractValue(path.slice(0, index + 1), elementValues);
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
  const currentValue = extractValue(dependency.split("."), elementValues) ?? defaultValue;
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
  setSessionStorageItem2(key, value);
}
function retrievePreviousValueFromStorage({ path, elementId }) {
  const prefix = `elementor/${elementId}`;
  const key = `${prefix}:${path}`;
  return getSessionStorageItem2(key) ?? null;
}
function removePreviousValueFromStorage({ path, elementId }) {
  const prefix = `elementor/${elementId}`;
  const key = `${prefix}:${path}`;
  removeSessionStorageItem(key);
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
  const depCheck = isDependencyMet2(propType?.dependencies, elementSettingsForDepCheck);
  const isHidden = !depCheck.isMet && !isDependency(depCheck.failingDependencies[0]) && depCheck.failingDependencies[0]?.effect === "hide";
  return {
    isDisabled: (prop) => {
      const result = !isDependencyMet2(prop?.dependencies, elementSettingsForDepCheck).isMet;
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
      updateElementSettings3({ id: elementId, props: settings, withHistory: false });
    }
  };
  return /* @__PURE__ */ React19.createElement(PropProvider, { propType, value, setValue, isDisabled }, /* @__PURE__ */ React19.createElement(PropKeyProvider, { bind }, children));
};
function useUndoableUpdateElementProp({
  elementId,
  propDisplayName
}) {
  return useMemo7(() => {
    return undoable4(
      {
        do: (newSettings) => {
          const prevPropValue = getElementSettings(elementId, Object.keys(newSettings));
          updateElementSettings3({ id: elementId, props: newSettings, withHistory: false });
          setDocumentModifiedStatus2(true);
          return prevPropValue;
        },
        undo: ({}, prevProps) => {
          updateElementSettings3({ id: elementId, props: prevProps, withHistory: false });
        }
      },
      {
        title: getElementLabel3(elementId),
        // translators: %s is the name of the property that was edited.
        subtitle: __7("%s edited", "elementor").replace("%s", propDisplayName),
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
import * as React20 from "react";
import { ControlAdornments, ControlFormLabel } from "@elementor/editor-controls";
import { Stack as Stack5 } from "@elementor/ui";
var ControlLabel = ({ children }) => {
  return /* @__PURE__ */ React20.createElement(Stack5, { direction: "row", alignItems: "center", justifyItems: "start", gap: 0.25 }, /* @__PURE__ */ React20.createElement(ControlFormLabel, null, children), /* @__PURE__ */ React20.createElement(ControlAdornments, null));
};

// src/components/settings-control.tsx
var Wrapper = styled5("span")`
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
  return /* @__PURE__ */ React21.createElement(ControlAdornmentsProvider, { items: getFieldIndicators("settings") }, control.meta?.topDivider && /* @__PURE__ */ React21.createElement(Divider3, null), /* @__PURE__ */ React21.createElement(Wrapper, { "data-type": "settings-field" }, /* @__PURE__ */ React21.createElement(ControlTypeContainer, { layout }, control.label && layout !== "custom" ? /* @__PURE__ */ React21.createElement(ControlLabel, null, control.label) : null, /* @__PURE__ */ React21.createElement(Control, { type: controlType, props: controlProps }))));
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
  return /* @__PURE__ */ React22.createElement(SessionStorageProvider, { prefix: element.id }, /* @__PURE__ */ React22.createElement(SectionsList, null, elementType.controls.map((control, index) => {
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
import * as React79 from "react";
import { useState as useState9 } from "react";
import { CLASSES_PROP_KEY } from "@elementor/editor-props";
import { useActiveBreakpoint } from "@elementor/editor-responsive";
import { createLocation as createLocation3 } from "@elementor/locations";
import { SessionStorageProvider as SessionStorageProvider2 } from "@elementor/session";
import { Box as Box5, Divider as Divider5, Stack as Stack12 } from "@elementor/ui";
import { __ as __53 } from "@wordpress/i18n";

// src/contexts/styles-inheritance-context.tsx
import * as React23 from "react";
import { createContext as createContext7, useContext as useContext7 } from "react";
import { getWidgetsCache } from "@elementor/editor-elements";
import { classesPropTypeUtil as classesPropTypeUtil3 } from "@elementor/editor-props";
import { getBreakpointsTree as getBreakpointsTree2 } from "@elementor/editor-responsive";
import { getStylesSchema } from "@elementor/editor-styles";
import { stylesRepository as stylesRepository6 } from "@elementor/editor-styles-repository";

// src/styles-inheritance/create-styles-inheritance.ts
import {
  isEmpty,
  isTransformable
} from "@elementor/editor-props";

// src/styles-inheritance/create-snapshots-manager.ts
import { filterEmptyValues } from "@elementor/editor-props";
import { hasVariable } from "@elementor/editor-variables";

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
      const filteredValue = filterEmptyValues(value);
      const filteredVariableValue = filteredValue?.$$type?.includes("variable") && !hasVariable(filteredValue?.value) ? null : filteredValue;
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
var Context4 = createContext7(null);
function StyleInheritanceProvider({ children }) {
  const styleDefs = useAppliedStyles();
  const breakpointsTree = getBreakpointsTree2();
  const { getSnapshot, getInheritanceChain } = createStylesInheritance(styleDefs, breakpointsTree);
  return /* @__PURE__ */ React23.createElement(Context4.Provider, { value: { getSnapshot, getInheritanceChain } }, children);
}
function useStylesInheritanceSnapshot() {
  const context = useContext7(Context4);
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
  const context = useContext7(Context4);
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
  const currentClassesProp = useClassesProp();
  const baseStyles = useBaseStyles();
  useStylesRerender();
  const classesProp = usePanelElementSetting(currentClassesProp);
  const appliedStyles = classesPropTypeUtil3.extract(classesProp) ?? [];
  return stylesRepository6.all().filter((style) => [...baseStyles, ...appliedStyles].includes(style.id));
};
var useBaseStyles = () => {
  const { elementType } = useElement();
  const widgetsCache = getWidgetsCache();
  const widgetCache = widgetsCache?.[elementType.key];
  return Object.keys(widgetCache?.base_styles ?? {});
};

// src/hooks/use-active-style-def-id.ts
import { getElementStyles } from "@elementor/editor-elements";
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
  const stylesDefs = getElementStyles(element.id) ?? {};
  return Object.values(stylesDefs).find((styleDef) => appliedClassesIds.includes(styleDef.id));
}
function useActiveAndAppliedClassId(id, appliedClassesIds) {
  const isClassApplied = !!id && appliedClassesIds.includes(id);
  return isClassApplied ? id : null;
}

// src/components/style-sections/background-section/background-section.tsx
import * as React26 from "react";
import { BackgroundControl } from "@elementor/editor-controls";
import { __ as __8 } from "@wordpress/i18n";

// src/controls-registry/styles-field.tsx
import * as React24 from "react";
import { ControlAdornmentsProvider as ControlAdornmentsProvider2, PropKeyProvider as PropKeyProvider2, PropProvider as PropProvider2 } from "@elementor/editor-controls";
import { getStylesSchema as getStylesSchema2 } from "@elementor/editor-styles";

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
import { useBoundProp } from "@elementor/editor-controls";
import { isDependency as isDependency2, isDependencyMet as isDependencyMet3 } from "@elementor/editor-props";
var ConditionalField = ({ children }) => {
  const { propType } = useBoundProp();
  const depList = getDependencies(propType);
  const { values: depValues } = useStylesFields(depList);
  const isHidden = !isDependencyMet3(propType?.dependencies, depValues).isMet;
  return isHidden ? null : children;
};
function getDependencies(propType) {
  if (!propType?.dependencies?.terms.length) {
    return [];
  }
  return propType.dependencies.terms.flatMap((term) => !isDependency2(term) ? term.path : []);
}

// src/controls-registry/styles-field.tsx
var StylesField = ({ bind, propDisplayName, children }) => {
  const stylesSchema = getStylesSchema2();
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
  return /* @__PURE__ */ React24.createElement(ControlAdornmentsProvider2, { items: getFieldIndicators("styles") }, /* @__PURE__ */ React24.createElement(
    PropProvider2,
    {
      propType,
      value: { [bind]: value },
      setValue,
      placeholder: placeholderValues,
      isDisabled: () => !canEdit
    },
    /* @__PURE__ */ React24.createElement(PropKeyProvider2, { bind }, /* @__PURE__ */ React24.createElement(ConditionalField, null, children))
  ));
};

// src/components/section-content.tsx
import * as React25 from "react";
import { Stack as Stack6 } from "@elementor/ui";
var SectionContent = ({ gap = 2, sx, children, "aria-label": ariaLabel }) => /* @__PURE__ */ React25.createElement(Stack6, { gap, sx: { ...sx }, "aria-label": ariaLabel }, children);

// src/components/style-sections/background-section/background-section.tsx
var BACKGROUND_LABEL = __8("Background", "elementor");
var BackgroundSection = () => {
  return /* @__PURE__ */ React26.createElement(SectionContent, null, /* @__PURE__ */ React26.createElement(StylesField, { bind: "background", propDisplayName: BACKGROUND_LABEL }, /* @__PURE__ */ React26.createElement(BackgroundControl, null)));
};

// src/components/style-sections/border-section/border-section.tsx
import * as React33 from "react";

// src/components/style-sections/border-section/border-color-field.tsx
import * as React28 from "react";
import { ColorControl } from "@elementor/editor-controls";
import { __ as __9 } from "@wordpress/i18n";

// src/components/styles-field-layout.tsx
import * as React27 from "react";
import { Grid, Stack as Stack7 } from "@elementor/ui";
var StylesFieldLayout = React27.forwardRef((props, ref) => {
  const { direction = "row", children, label } = props;
  const LayoutComponent = direction === "row" ? Row : Column;
  return /* @__PURE__ */ React27.createElement(LayoutComponent, { label, ref, children });
});
var Row = React27.forwardRef(
  ({ label, children }, ref) => {
    return /* @__PURE__ */ React27.createElement(
      Grid,
      {
        container: true,
        gap: 2,
        alignItems: "center",
        flexWrap: "nowrap",
        ref,
        "aria-label": `${label} control`
      },
      /* @__PURE__ */ React27.createElement(Grid, { item: true, xs: 6 }, /* @__PURE__ */ React27.createElement(ControlLabel, null, label)),
      /* @__PURE__ */ React27.createElement(
        Grid,
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
    return /* @__PURE__ */ React27.createElement(Stack7, { gap: 0.75, ref }, /* @__PURE__ */ React27.createElement(ControlLabel, null, label), children);
  }
);

// src/components/style-sections/border-section/border-color-field.tsx
var BORDER_COLOR_LABEL = __9("Border color", "elementor");
var BorderColorField = () => /* @__PURE__ */ React28.createElement(StylesField, { bind: "border-color", propDisplayName: BORDER_COLOR_LABEL }, /* @__PURE__ */ React28.createElement(StylesFieldLayout, { label: BORDER_COLOR_LABEL }, /* @__PURE__ */ React28.createElement(ColorControl, null)));

// src/components/style-sections/border-section/border-radius-field.tsx
import * as React30 from "react";
import { EqualUnequalSizesControl } from "@elementor/editor-controls";
import { borderRadiusPropTypeUtil } from "@elementor/editor-props";
import {
  BorderCornersIcon,
  RadiusBottomLeftIcon,
  RadiusBottomRightIcon,
  RadiusTopLeftIcon,
  RadiusTopRightIcon
} from "@elementor/icons";
import { withDirection } from "@elementor/ui";
import { __ as __10 } from "@wordpress/i18n";

// src/hooks/use-direction.ts
import { getElementorFrontendConfig } from "@elementor/editor-v1-adapters";
import { useTheme } from "@elementor/ui";
function useDirection() {
  const theme = useTheme();
  const isUiRtl = "rtl" === theme.direction, isSiteRtl = !!getElementorFrontendConfig()?.is_rtl;
  return { isSiteRtl, isUiRtl };
}

// src/styles-inheritance/components/ui-providers.tsx
import * as React29 from "react";
import { DirectionProvider, ThemeProvider as ThemeProvider2 } from "@elementor/ui";
var UiProviders = ({ children }) => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React29.createElement(DirectionProvider, { rtl: isSiteRtl }, /* @__PURE__ */ React29.createElement(ThemeProvider2, null, children));
};

// src/components/style-sections/border-section/border-radius-field.tsx
var BORDER_RADIUS_LABEL = __10("Border radius", "elementor");
var StartStartIcon = withDirection(RadiusTopLeftIcon);
var StartEndIcon = withDirection(RadiusTopRightIcon);
var EndStartIcon = withDirection(RadiusBottomLeftIcon);
var EndEndIcon = withDirection(RadiusBottomRightIcon);
var getStartStartLabel = (isSiteRtl) => isSiteRtl ? __10("Top right", "elementor") : __10("Top left", "elementor");
var getStartStartAriaLabel = (isSiteRtl) => isSiteRtl ? __10("Border top right radius", "elementor") : __10("Border top left radius", "elementor");
var getStartEndLabel = (isSiteRtl) => isSiteRtl ? __10("Top left", "elementor") : __10("Top right", "elementor");
var getStartEndAriaLabel = (isSiteRtl) => isSiteRtl ? __10("Border top left radius", "elementor") : __10("Border top right radius", "elementor");
var getEndStartLabel = (isSiteRtl) => isSiteRtl ? __10("Bottom right", "elementor") : __10("Bottom left", "elementor");
var getEndStartAriaLabel = (isSiteRtl) => isSiteRtl ? __10("Border bottom right radius", "elementor") : __10("Border bottom left radius", "elementor");
var getEndEndLabel = (isSiteRtl) => isSiteRtl ? __10("Bottom left", "elementor") : __10("Bottom right", "elementor");
var getEndEndAriaLabel = (isSiteRtl) => isSiteRtl ? __10("Border bottom left radius", "elementor") : __10("Border bottom right radius", "elementor");
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
    EqualUnequalSizesControl,
    {
      items: getCorners(isSiteRtl),
      label: BORDER_RADIUS_LABEL,
      icon: /* @__PURE__ */ React30.createElement(BorderCornersIcon, { fontSize: "tiny" }),
      tooltipLabel: __10("Adjust corners", "elementor"),
      multiSizePropTypeUtil: borderRadiusPropTypeUtil
    }
  )));
};

// src/components/style-sections/border-section/border-style-field.tsx
import * as React31 from "react";
import { SelectControl } from "@elementor/editor-controls";
import { __ as __11 } from "@wordpress/i18n";
var BORDER_TYPE_LABEL = __11("Border type", "elementor");
var borderStyles = [
  { value: "none", label: __11("None", "elementor") },
  { value: "solid", label: __11("Solid", "elementor") },
  { value: "dashed", label: __11("Dashed", "elementor") },
  { value: "dotted", label: __11("Dotted", "elementor") },
  { value: "double", label: __11("Double", "elementor") },
  { value: "groove", label: __11("Groove", "elementor") },
  { value: "ridge", label: __11("Ridge", "elementor") },
  { value: "inset", label: __11("Inset", "elementor") },
  { value: "outset", label: __11("Outset", "elementor") }
];
var BorderStyleField = () => /* @__PURE__ */ React31.createElement(StylesField, { bind: "border-style", propDisplayName: BORDER_TYPE_LABEL }, /* @__PURE__ */ React31.createElement(StylesFieldLayout, { label: BORDER_TYPE_LABEL }, /* @__PURE__ */ React31.createElement(SelectControl, { options: borderStyles })));

// src/components/style-sections/border-section/border-width-field.tsx
import * as React32 from "react";
import { EqualUnequalSizesControl as EqualUnequalSizesControl2 } from "@elementor/editor-controls";
import { borderWidthPropTypeUtil } from "@elementor/editor-props";
import { SideAllIcon, SideBottomIcon, SideLeftIcon, SideRightIcon, SideTopIcon } from "@elementor/icons";
import { withDirection as withDirection2 } from "@elementor/ui";
import { __ as __12 } from "@wordpress/i18n";
var BORDER_WIDTH_LABEL = __12("Border width", "elementor");
var InlineStartIcon = withDirection2(SideRightIcon);
var InlineEndIcon = withDirection2(SideLeftIcon);
var getEdges = (isSiteRtl) => [
  {
    label: __12("Top", "elementor"),
    ariaLabel: __12("Border top width", "elementor"),
    icon: /* @__PURE__ */ React32.createElement(SideTopIcon, { fontSize: "tiny" }),
    bind: "block-start"
  },
  {
    label: isSiteRtl ? __12("Left", "elementor") : __12("Right", "elementor"),
    ariaLabel: isSiteRtl ? __12("Border left width", "elementor") : __12("Border right width", "elementor"),
    icon: /* @__PURE__ */ React32.createElement(InlineStartIcon, { fontSize: "tiny" }),
    bind: "inline-end"
  },
  {
    label: __12("Bottom", "elementor"),
    ariaLabel: __12("Border bottom width", "elementor"),
    icon: /* @__PURE__ */ React32.createElement(SideBottomIcon, { fontSize: "tiny" }),
    bind: "block-end"
  },
  {
    label: isSiteRtl ? __12("Right", "elementor") : __12("Left", "elementor"),
    ariaLabel: isSiteRtl ? __12("Border right width", "elementor") : __12("Border left width", "elementor"),
    icon: /* @__PURE__ */ React32.createElement(InlineEndIcon, { fontSize: "tiny" }),
    bind: "inline-start"
  }
];
var BorderWidthField = () => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React32.createElement(StylesField, { bind: "border-width", propDisplayName: BORDER_WIDTH_LABEL }, /* @__PURE__ */ React32.createElement(
    EqualUnequalSizesControl2,
    {
      items: getEdges(isSiteRtl),
      label: BORDER_WIDTH_LABEL,
      icon: /* @__PURE__ */ React32.createElement(SideAllIcon, { fontSize: "tiny" }),
      tooltipLabel: __12("Adjust borders", "elementor"),
      multiSizePropTypeUtil: borderWidthPropTypeUtil
    }
  ));
};

// src/components/style-sections/border-section/border-section.tsx
var BorderSection = () => /* @__PURE__ */ React33.createElement(SectionContent, null, /* @__PURE__ */ React33.createElement(BorderWidthField, null), /* @__PURE__ */ React33.createElement(BorderColorField, null), /* @__PURE__ */ React33.createElement(BorderStyleField, null), /* @__PURE__ */ React33.createElement(BorderRadiusField, null));

// src/components/style-sections/effects-section/effects-section.tsx
import * as React37 from "react";
import {
  BoxShadowRepeaterControl,
  FilterRepeaterControl,
  TransformRepeaterControl,
  TransitionRepeaterControl
} from "@elementor/editor-controls";
import { __ as __15 } from "@wordpress/i18n";

// src/utils/can-element-have-children.ts
import { getContainer } from "@elementor/editor-elements";
var canElementHaveChildren = (elementId) => {
  const container = getContainer(elementId);
  if (!container) {
    return false;
  }
  return container.model.get("elType") !== "widget";
};

// src/utils/get-recently-used-styles.ts
import { createPropsResolver, styleTransformersRegistry } from "@elementor/editor-canvas";
import { getElementStyles as getElementStyles2 } from "@elementor/editor-elements";
import { getStylesSchema as getStylesSchema3 } from "@elementor/editor-styles";
var getRecentlyUsedList = async (elementId) => {
  if (!elementId) {
    return [];
  }
  const resolver = createPropsResolver({
    transformers: styleTransformersRegistry,
    schema: getStylesSchema3()
  });
  const styles = getElementStyles2(elementId) ?? {};
  const styleKeys = Object.keys(styles ?? {});
  const variants = styleKeys.map((key) => styles?.[key]?.variants ?? []);
  const resolved = await Promise.all(
    variants.flat().map(async (variant) => {
      const result = await resolver({
        props: variant.props ?? {},
        schema: getStylesSchema3()
      });
      return Object.entries(result).filter(([, value]) => value !== null).map(([key]) => key);
    })
  );
  const propSet = new Set(resolved.flat());
  return Array.from(propSet);
};

// src/components/panel-divider.tsx
import * as React34 from "react";
import { Divider as Divider4 } from "@elementor/ui";
var PanelDivider = () => /* @__PURE__ */ React34.createElement(Divider4, { sx: { my: 0.5 } });

// src/components/style-sections/effects-section/blend-mode-field.tsx
import * as React35 from "react";
import { SelectControl as SelectControl2 } from "@elementor/editor-controls";
import { __ as __13 } from "@wordpress/i18n";
var BLEND_MODE_LABEL = __13("Blend mode", "elementor");
var blendModeOptions = [
  { label: __13("Normal", "elementor"), value: "normal" },
  { label: __13("Multiply", "elementor"), value: "multiply" },
  { label: __13("Screen", "elementor"), value: "screen" },
  { label: __13("Overlay", "elementor"), value: "overlay" },
  { label: __13("Darken", "elementor"), value: "darken" },
  { label: __13("Lighten", "elementor"), value: "lighten" },
  { label: __13("Color dodge", "elementor"), value: "color-dodge" },
  { label: __13("Color burn", "elementor"), value: "color-burn" },
  { label: __13("Saturation", "elementor"), value: "saturation" },
  { label: __13("Color", "elementor"), value: "color" },
  { label: __13("Difference", "elementor"), value: "difference" },
  { label: __13("Exclusion", "elementor"), value: "exclusion" },
  { label: __13("Hue", "elementor"), value: "hue" },
  { label: __13("Luminosity", "elementor"), value: "luminosity" },
  { label: __13("Soft light", "elementor"), value: "soft-light" },
  { label: __13("Hard light", "elementor"), value: "hard-light" }
];
var BlendModeField = () => {
  return /* @__PURE__ */ React35.createElement(StylesField, { bind: "mix-blend-mode", propDisplayName: BLEND_MODE_LABEL }, /* @__PURE__ */ React35.createElement(StylesFieldLayout, { label: BLEND_MODE_LABEL }, /* @__PURE__ */ React35.createElement(SelectControl2, { options: blendModeOptions })));
};

// src/components/style-sections/effects-section/opacity-control-field.tsx
import * as React36 from "react";
import { useRef as useRef4 } from "react";
import { SizeControl as SizeControl2 } from "@elementor/editor-controls";
import { __ as __14 } from "@wordpress/i18n";
var OPACITY_LABEL = __14("Opacity", "elementor");
var OpacityControlField = () => {
  const rowRef = useRef4(null);
  return /* @__PURE__ */ React36.createElement(StylesField, { bind: "opacity", propDisplayName: OPACITY_LABEL }, /* @__PURE__ */ React36.createElement(StylesFieldLayout, { ref: rowRef, label: OPACITY_LABEL }, /* @__PURE__ */ React36.createElement(SizeControl2, { units: ["%"], anchorRef: rowRef, defaultUnit: "%" })));
};

// src/components/style-sections/effects-section/effects-section.tsx
var BOX_SHADOW_LABEL = __15("Box shadow", "elementor");
var FILTER_LABEL = __15("Filters", "elementor");
var TRANSFORM_LABEL = __15("Transform", "elementor");
var BACKDROP_FILTER_LABEL = __15("Backdrop filters", "elementor");
var TRANSITIONS_LABEL = __15("Transitions", "elementor");
var EffectsSection = () => {
  const { element } = useElement();
  const { meta } = useStyle();
  const canHaveChildren = canElementHaveChildren(element?.id ?? "");
  return /* @__PURE__ */ React37.createElement(SectionContent, { gap: 1 }, /* @__PURE__ */ React37.createElement(BlendModeField, null), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(OpacityControlField, null), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(StylesField, { bind: "box-shadow", propDisplayName: BOX_SHADOW_LABEL }, /* @__PURE__ */ React37.createElement(BoxShadowRepeaterControl, null)), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(StylesField, { bind: "transform", propDisplayName: TRANSFORM_LABEL }, /* @__PURE__ */ React37.createElement(TransformRepeaterControl, { showChildrenPerspective: canHaveChildren })), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(StylesField, { bind: "transition", propDisplayName: TRANSITIONS_LABEL }, /* @__PURE__ */ React37.createElement(
    TransitionRepeaterControl,
    {
      currentStyleState: meta.state,
      recentlyUsedListGetter: () => getRecentlyUsedList(element?.id ?? "")
    }
  )), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(StylesField, { bind: "filter", propDisplayName: FILTER_LABEL }, /* @__PURE__ */ React37.createElement(FilterRepeaterControl, null)), /* @__PURE__ */ React37.createElement(PanelDivider, null), /* @__PURE__ */ React37.createElement(StylesField, { bind: "backdrop-filter", propDisplayName: BACKDROP_FILTER_LABEL }, /* @__PURE__ */ React37.createElement(FilterRepeaterControl, { filterPropName: "backdrop-filter" })));
};

// src/components/style-sections/layout-section/layout-section.tsx
import * as React49 from "react";
import { ControlFormLabel as ControlFormLabel2 } from "@elementor/editor-controls";
import { useParentElement } from "@elementor/editor-elements";
import { __ as __27 } from "@wordpress/i18n";

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
import * as React39 from "react";
import { ToggleControl as ToggleControl2 } from "@elementor/editor-controls";
import {
  JustifyBottomIcon,
  JustifyCenterIcon as CenterIcon,
  JustifyDistributeVerticalIcon as EvenlyIcon,
  JustifySpaceAroundVerticalIcon as AroundIcon,
  JustifySpaceBetweenVerticalIcon as BetweenIcon,
  JustifyTopIcon
} from "@elementor/icons";
import { withDirection as withDirection3 } from "@elementor/ui";
import { __ as __17 } from "@wordpress/i18n";

// src/components/style-sections/layout-section/utils/rotated-icon.tsx
import * as React38 from "react";
import { useRef as useRef5 } from "react";
import { useTheme as useTheme2 } from "@elementor/ui";
import { __ as __16 } from "@wordpress/i18n";
var FLEX_DIRECTION_LABEL = __16("Flex direction", "elementor");
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
  return /* @__PURE__ */ React38.createElement(Icon, { fontSize: size, sx: { transition: ".3s", rotate: `${rotate.current}deg` } });
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
var ALIGN_CONTENT_LABEL = __17("Align content", "elementor");
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
    label: __17("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: StartIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "center",
    label: __17("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: CenterIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "end",
    label: __17("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: EndIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-between",
    label: __17("Space between", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: BetweenIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-around",
    label: __17("Space around", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: AroundIcon, size, ...iconProps }),
    showTooltip: true
  },
  {
    value: "space-evenly",
    label: __17("Space evenly", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React39.createElement(RotatedIcon, { icon: EvenlyIcon, size, ...iconProps }),
    showTooltip: true
  }
];
var AlignContentField = () => /* @__PURE__ */ React39.createElement(StylesField, { bind: "align-content", propDisplayName: ALIGN_CONTENT_LABEL }, /* @__PURE__ */ React39.createElement(UiProviders, null, /* @__PURE__ */ React39.createElement(StylesFieldLayout, { label: ALIGN_CONTENT_LABEL, direction: "column" }, /* @__PURE__ */ React39.createElement(ToggleControl2, { options, fullWidth: true }))));

// src/components/style-sections/layout-section/align-items-field.tsx
import * as React40 from "react";
import { ToggleControl as ToggleControl3 } from "@elementor/editor-controls";
import {
  LayoutAlignCenterIcon as CenterIcon2,
  LayoutAlignLeftIcon,
  LayoutAlignRightIcon,
  LayoutDistributeVerticalIcon as JustifyIcon
} from "@elementor/icons";
import { withDirection as withDirection4 } from "@elementor/ui";
import { __ as __18 } from "@wordpress/i18n";
var ALIGN_ITEMS_LABEL = __18("Align items", "elementor");
var StartIcon2 = withDirection4(LayoutAlignLeftIcon);
var EndIcon2 = withDirection4(LayoutAlignRightIcon);
var iconProps2 = {
  isClockwise: false,
  offset: 90
};
var options2 = [
  {
    value: "start",
    label: __18("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React40.createElement(RotatedIcon, { icon: StartIcon2, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "center",
    label: __18("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React40.createElement(RotatedIcon, { icon: CenterIcon2, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "end",
    label: __18("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React40.createElement(RotatedIcon, { icon: EndIcon2, size, ...iconProps2 }),
    showTooltip: true
  },
  {
    value: "stretch",
    label: __18("Stretch", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React40.createElement(RotatedIcon, { icon: JustifyIcon, size, ...iconProps2 }),
    showTooltip: true
  }
];
var AlignItemsField = () => {
  return /* @__PURE__ */ React40.createElement(UiProviders, null, /* @__PURE__ */ React40.createElement(StylesField, { bind: "align-items", propDisplayName: ALIGN_ITEMS_LABEL }, /* @__PURE__ */ React40.createElement(StylesFieldLayout, { label: ALIGN_ITEMS_LABEL }, /* @__PURE__ */ React40.createElement(ToggleControl3, { options: options2 }))));
};

// src/components/style-sections/layout-section/align-self-child-field.tsx
import * as React41 from "react";
import { ToggleControl as ToggleControl4 } from "@elementor/editor-controls";
import {
  LayoutAlignCenterIcon as CenterIcon3,
  LayoutAlignLeftIcon as LayoutAlignLeftIcon2,
  LayoutAlignRightIcon as LayoutAlignRightIcon2,
  LayoutDistributeVerticalIcon as JustifyIcon2
} from "@elementor/icons";
import { withDirection as withDirection5 } from "@elementor/ui";
import { __ as __19 } from "@wordpress/i18n";
var ALIGN_SELF_LABEL = __19("Align self", "elementor");
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
    label: __19("Start", "elementor"),
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
    label: __19("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React41.createElement(
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
    label: __19("End", "elementor"),
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
    label: __19("Stretch", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React41.createElement(
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
var AlignSelfChild = ({ parentStyleDirection }) => /* @__PURE__ */ React41.createElement(StylesField, { bind: "align-self", propDisplayName: ALIGN_SELF_LABEL }, /* @__PURE__ */ React41.createElement(UiProviders, null, /* @__PURE__ */ React41.createElement(StylesFieldLayout, { label: ALIGN_SELF_LABEL }, /* @__PURE__ */ React41.createElement(ToggleControl4, { options: getOptions(parentStyleDirection) }))));

// src/components/style-sections/layout-section/display-field.tsx
import * as React42 from "react";
import { ToggleControl as ToggleControl5 } from "@elementor/editor-controls";
import { __ as __20 } from "@wordpress/i18n";
var DISPLAY_LABEL = __20("Display", "elementor");
var displayFieldItems = [
  {
    value: "block",
    renderContent: () => __20("Block", "elementor"),
    label: __20("Block", "elementor"),
    showTooltip: true
  },
  {
    value: "flex",
    renderContent: () => __20("Flex", "elementor"),
    label: __20("Flex", "elementor"),
    showTooltip: true
  },
  {
    value: "inline-block",
    renderContent: () => __20("In-blk", "elementor"),
    label: __20("Inline-block", "elementor"),
    showTooltip: true
  },
  {
    value: "none",
    renderContent: () => __20("None", "elementor"),
    label: __20("None", "elementor"),
    showTooltip: true
  },
  {
    value: "inline-flex",
    renderContent: () => __20("In-flx", "elementor"),
    label: __20("Inline-flex", "elementor"),
    showTooltip: true
  }
];
var DisplayField = () => {
  const placeholder = useDisplayPlaceholderValue();
  return /* @__PURE__ */ React42.createElement(StylesField, { bind: "display", propDisplayName: DISPLAY_LABEL, placeholder }, /* @__PURE__ */ React42.createElement(StylesFieldLayout, { label: DISPLAY_LABEL, direction: "column" }, /* @__PURE__ */ React42.createElement(ToggleControl5, { options: displayFieldItems, maxItems: 4, fullWidth: true })));
};
var useDisplayPlaceholderValue = () => useStylesInheritanceChain(["display"])[0]?.value ?? void 0;

// src/components/style-sections/layout-section/flex-direction-field.tsx
import * as React43 from "react";
import { ToggleControl as ToggleControl6 } from "@elementor/editor-controls";
import { ArrowDownSmallIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpSmallIcon } from "@elementor/icons";
import { withDirection as withDirection6 } from "@elementor/ui";
import { __ as __21 } from "@wordpress/i18n";
var FLEX_DIRECTION_LABEL2 = __21("Direction", "elementor");
var options3 = [
  {
    value: "row",
    label: __21("Row", "elementor"),
    renderContent: ({ size }) => {
      const StartIcon5 = withDirection6(ArrowRightIcon);
      return /* @__PURE__ */ React43.createElement(StartIcon5, { fontSize: size });
    },
    showTooltip: true
  },
  {
    value: "column",
    label: __21("Column", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React43.createElement(ArrowDownSmallIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "row-reverse",
    label: __21("Reversed row", "elementor"),
    renderContent: ({ size }) => {
      const EndIcon5 = withDirection6(ArrowLeftIcon);
      return /* @__PURE__ */ React43.createElement(EndIcon5, { fontSize: size });
    },
    showTooltip: true
  },
  {
    value: "column-reverse",
    label: __21("Reversed column", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React43.createElement(ArrowUpSmallIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FlexDirectionField = () => {
  return /* @__PURE__ */ React43.createElement(StylesField, { bind: "flex-direction", propDisplayName: FLEX_DIRECTION_LABEL2 }, /* @__PURE__ */ React43.createElement(UiProviders, null, /* @__PURE__ */ React43.createElement(StylesFieldLayout, { label: FLEX_DIRECTION_LABEL2 }, /* @__PURE__ */ React43.createElement(ToggleControl6, { options: options3 }))));
};

// src/components/style-sections/layout-section/flex-order-field.tsx
import * as React44 from "react";
import { useEffect as useEffect4, useMemo as useMemo8, useState as useState7 } from "react";
import {
  ControlToggleButtonGroup,
  NumberControl as NumberControl2,
  useBoundProp as useBoundProp2
} from "@elementor/editor-controls";
import { ArrowDownSmallIcon as ArrowDownSmallIcon2, ArrowUpSmallIcon as ArrowUpSmallIcon2, PencilIcon } from "@elementor/icons";
import { Grid as Grid2 } from "@elementor/ui";
import { __ as __22 } from "@wordpress/i18n";
var ORDER_LABEL = __22("Order", "elementor");
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
    label: __22("First", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(ArrowUpSmallIcon2, { fontSize: size }),
    showTooltip: true
  },
  {
    value: LAST,
    label: __22("Last", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(ArrowDownSmallIcon2, { fontSize: size }),
    showTooltip: true
  },
  {
    value: CUSTOM,
    label: __22("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React44.createElement(PencilIcon, { fontSize: size }),
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
  const { placeholder } = useBoundProp2();
  const placeholderValue = placeholder;
  const currentGroup = useMemo8(() => getGroupControlValue(order?.value ?? null), [order]);
  const [activeGroup, setActiveGroup] = useState7(currentGroup);
  const [customLocked, setCustomLocked] = useState7(false);
  useEffect4(() => {
    if (!customLocked) {
      setActiveGroup(currentGroup);
    }
  }, [currentGroup, customLocked]);
  useEffect4(() => {
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
    ControlToggleButtonGroup,
    {
      items,
      value: activeGroup,
      onChange: handleToggleButtonChange,
      exclusive: true,
      placeholder: groupPlaceholder,
      disabled: !canEdit
    }
  )), isCustomVisible && /* @__PURE__ */ React44.createElement(Grid2, { container: true, gap: 2, alignItems: "center", flexWrap: "nowrap" }, /* @__PURE__ */ React44.createElement(Grid2, { item: true, xs: 6 }, /* @__PURE__ */ React44.createElement(ControlLabel, null, __22("Custom order", "elementor"))), /* @__PURE__ */ React44.createElement(Grid2, { item: true, xs: 6, sx: { display: "flex", justifyContent: "end" } }, /* @__PURE__ */ React44.createElement(
    NumberControl2,
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
import * as React45 from "react";
import { useEffect as useEffect5, useMemo as useMemo9, useRef as useRef6, useState as useState8 } from "react";
import {
  ControlToggleButtonGroup as ControlToggleButtonGroup2,
  NumberControl as NumberControl3,
  PropKeyProvider as PropKeyProvider3,
  PropProvider as PropProvider3,
  SizeControl as SizeControl3,
  useBoundProp as useBoundProp3
} from "@elementor/editor-controls";
import { flexPropTypeUtil, numberPropTypeUtil as numberPropTypeUtil2, sizePropTypeUtil as sizePropTypeUtil2 } from "@elementor/editor-props";
import { ExpandIcon, PencilIcon as PencilIcon2, ShrinkIcon } from "@elementor/icons";
import { __ as __23 } from "@wordpress/i18n";
var FLEX_SIZE_LABEL = __23("Flex Size", "elementor");
var DEFAULT = 1;
var items2 = [
  {
    value: "flex-grow",
    label: __23("Grow", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(ExpandIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "flex-shrink",
    label: __23("Shrink", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(ShrinkIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "custom",
    label: __23("Custom", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React45.createElement(PencilIcon2, { fontSize: size }),
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
  const { placeholder } = useBoundProp3();
  const flexValues = extractFlexValues(value);
  const currentGroup = useMemo9(() => getActiveGroup(flexValues), [flexValues]);
  const [activeGroup, setActiveGroup] = useState8(currentGroup);
  const [customLocked, setCustomLocked] = useState8(false);
  useEffect5(() => {
    if (!customLocked) {
      setActiveGroup(currentGroup);
    }
  }, [currentGroup, customLocked]);
  useEffect5(() => {
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
    ControlToggleButtonGroup2,
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
    return flexPropTypeUtil.create({
      flexGrow: numberPropTypeUtil2.create(DEFAULT),
      flexShrink: numberPropTypeUtil2.create(0),
      flexBasis: sizePropTypeUtil2.create({ unit: "auto", size: "" })
    });
  }
  if (group === "flex-shrink") {
    return flexPropTypeUtil.create({
      flexGrow: numberPropTypeUtil2.create(0),
      flexShrink: numberPropTypeUtil2.create(DEFAULT),
      flexBasis: sizePropTypeUtil2.create({ unit: "auto", size: "" })
    });
  }
  if (group === "custom") {
    if (flexValue) {
      return flexValue;
    }
    return flexPropTypeUtil.create({
      flexGrow: null,
      flexShrink: null,
      flexBasis: null
    });
  }
  return null;
};
var FlexCustomField = () => {
  const flexBasisRowRef = useRef6(null);
  const context = useBoundProp3(flexPropTypeUtil);
  return /* @__PURE__ */ React45.createElement(PropProvider3, { ...context }, /* @__PURE__ */ React45.createElement(React45.Fragment, null, /* @__PURE__ */ React45.createElement(StylesFieldLayout, { label: __23("Grow", "elementor") }, /* @__PURE__ */ React45.createElement(PropKeyProvider3, { bind: "flexGrow" }, /* @__PURE__ */ React45.createElement(NumberControl3, { min: 0, shouldForceInt: true }))), /* @__PURE__ */ React45.createElement(StylesFieldLayout, { label: __23("Shrink", "elementor") }, /* @__PURE__ */ React45.createElement(PropKeyProvider3, { bind: "flexShrink" }, /* @__PURE__ */ React45.createElement(NumberControl3, { min: 0, shouldForceInt: true }))), /* @__PURE__ */ React45.createElement(StylesFieldLayout, { label: __23("Basis", "elementor"), ref: flexBasisRowRef }, /* @__PURE__ */ React45.createElement(PropKeyProvider3, { bind: "flexBasis" }, /* @__PURE__ */ React45.createElement(SizeControl3, { extendedOptions: ["auto"], anchorRef: flexBasisRowRef })))));
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
import * as React46 from "react";
import { GapControl } from "@elementor/editor-controls";
import { __ as __24 } from "@wordpress/i18n";
var GAPS_LABEL = __24("Gaps", "elementor");
var GapControlField = () => {
  return /* @__PURE__ */ React46.createElement(StylesField, { bind: "gap", propDisplayName: GAPS_LABEL }, /* @__PURE__ */ React46.createElement(GapControl, { label: GAPS_LABEL }));
};

// src/components/style-sections/layout-section/justify-content-field.tsx
import * as React47 from "react";
import { ToggleControl as ToggleControl7 } from "@elementor/editor-controls";
import {
  JustifyBottomIcon as JustifyBottomIcon2,
  JustifyCenterIcon as CenterIcon4,
  JustifyDistributeVerticalIcon as EvenlyIcon2,
  JustifySpaceAroundVerticalIcon as AroundIcon2,
  JustifySpaceBetweenVerticalIcon as BetweenIcon2,
  JustifyTopIcon as JustifyTopIcon2
} from "@elementor/icons";
import { withDirection as withDirection7 } from "@elementor/ui";
import { __ as __25 } from "@wordpress/i18n";
var JUSTIFY_CONTENT_LABEL = __25("Justify content", "elementor");
var StartIcon4 = withDirection7(JustifyTopIcon2);
var EndIcon4 = withDirection7(JustifyBottomIcon2);
var iconProps4 = {
  isClockwise: true,
  offset: -90
};
var options4 = [
  {
    value: "flex-start",
    label: __25("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: StartIcon4, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "center",
    label: __25("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: CenterIcon4, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "flex-end",
    label: __25("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: EndIcon4, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-between",
    label: __25("Space between", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: BetweenIcon2, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-around",
    label: __25("Space around", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: AroundIcon2, size, ...iconProps4 }),
    showTooltip: true
  },
  {
    value: "space-evenly",
    label: __25("Space evenly", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React47.createElement(RotatedIcon, { icon: EvenlyIcon2, size, ...iconProps4 }),
    showTooltip: true
  }
];
var JustifyContentField = () => /* @__PURE__ */ React47.createElement(StylesField, { bind: "justify-content", propDisplayName: JUSTIFY_CONTENT_LABEL }, /* @__PURE__ */ React47.createElement(UiProviders, null, /* @__PURE__ */ React47.createElement(StylesFieldLayout, { label: JUSTIFY_CONTENT_LABEL, direction: "column" }, /* @__PURE__ */ React47.createElement(ToggleControl7, { options: options4, fullWidth: true }))));

// src/components/style-sections/layout-section/wrap-field.tsx
import * as React48 from "react";
import { ToggleControl as ToggleControl8 } from "@elementor/editor-controls";
import { ArrowBackIcon, ArrowForwardIcon, ArrowRightIcon as ArrowRightIcon2 } from "@elementor/icons";
import { __ as __26 } from "@wordpress/i18n";
var FLEX_WRAP_LABEL = __26("Wrap", "elementor");
var options5 = [
  {
    value: "nowrap",
    label: __26("No wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(ArrowRightIcon2, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "wrap",
    label: __26("Wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(ArrowBackIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "wrap-reverse",
    label: __26("Reversed wrap", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React48.createElement(ArrowForwardIcon, { fontSize: size }),
    showTooltip: true
  }
];
var WrapField = () => {
  return /* @__PURE__ */ React48.createElement(StylesField, { bind: "flex-wrap", propDisplayName: FLEX_WRAP_LABEL }, /* @__PURE__ */ React48.createElement(UiProviders, null, /* @__PURE__ */ React48.createElement(StylesFieldLayout, { label: FLEX_WRAP_LABEL }, /* @__PURE__ */ React48.createElement(ToggleControl8, { options: options5 }))));
};

// src/components/style-sections/layout-section/layout-section.tsx
var DISPLAY_LABEL2 = __27("Display", "elementor");
var FLEX_WRAP_LABEL2 = __27("Flex wrap", "elementor");
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
  return /* @__PURE__ */ React49.createElement(SectionContent, null, /* @__PURE__ */ React49.createElement(DisplayField, null), isDisplayFlex && /* @__PURE__ */ React49.createElement(FlexFields, null), "flex" === parentStyle?.display && /* @__PURE__ */ React49.createElement(FlexChildFields, { parentStyleDirection }));
};
var FlexFields = () => {
  const { value: flexWrap } = useStylesField("flex-wrap", {
    history: { propDisplayName: FLEX_WRAP_LABEL2 }
  });
  return /* @__PURE__ */ React49.createElement(React49.Fragment, null, /* @__PURE__ */ React49.createElement(FlexDirectionField, null), /* @__PURE__ */ React49.createElement(JustifyContentField, null), /* @__PURE__ */ React49.createElement(AlignItemsField, null), /* @__PURE__ */ React49.createElement(PanelDivider, null), /* @__PURE__ */ React49.createElement(GapControlField, null), /* @__PURE__ */ React49.createElement(WrapField, null), ["wrap", "wrap-reverse"].includes(flexWrap?.value) && /* @__PURE__ */ React49.createElement(AlignContentField, null));
};
var FlexChildFields = ({ parentStyleDirection }) => /* @__PURE__ */ React49.createElement(React49.Fragment, null, /* @__PURE__ */ React49.createElement(PanelDivider, null), /* @__PURE__ */ React49.createElement(ControlFormLabel2, null, __27("Flex child", "elementor")), /* @__PURE__ */ React49.createElement(AlignSelfChild, { parentStyleDirection }), /* @__PURE__ */ React49.createElement(FlexOrderField, null), /* @__PURE__ */ React49.createElement(FlexSizeField, null));
var shouldDisplayFlexFields = (display, local) => {
  const value = display?.value ?? local?.value;
  if (!value) {
    return false;
  }
  return "flex" === value || "inline-flex" === value;
};

// src/components/style-sections/position-section/position-section.tsx
import * as React54 from "react";
import { useSessionStorage as useSessionStorage3 } from "@elementor/session";
import { __ as __32 } from "@wordpress/i18n";

// src/components/style-sections/position-section/dimensions-field.tsx
import * as React50 from "react";
import { useRef as useRef7 } from "react";
import { SizeControl as SizeControl4 } from "@elementor/editor-controls";
import { SideBottomIcon as SideBottomIcon2, SideLeftIcon as SideLeftIcon2, SideRightIcon as SideRightIcon2, SideTopIcon as SideTopIcon2 } from "@elementor/icons";
import { Grid as Grid3, Stack as Stack8, withDirection as withDirection8 } from "@elementor/ui";
import { __ as __28 } from "@wordpress/i18n";
var InlineStartIcon2 = withDirection8(SideLeftIcon2);
var InlineEndIcon2 = withDirection8(SideRightIcon2);
var sideIcons = {
  "inset-block-start": /* @__PURE__ */ React50.createElement(SideTopIcon2, { fontSize: "tiny" }),
  "inset-block-end": /* @__PURE__ */ React50.createElement(SideBottomIcon2, { fontSize: "tiny" }),
  "inset-inline-start": /* @__PURE__ */ React50.createElement(RotatedIcon, { icon: InlineStartIcon2, size: "tiny" }),
  "inset-inline-end": /* @__PURE__ */ React50.createElement(RotatedIcon, { icon: InlineEndIcon2, size: "tiny" })
};
var getInlineStartLabel = (isSiteRtl) => isSiteRtl ? __28("Right", "elementor") : __28("Left", "elementor");
var getInlineEndLabel = (isSiteRtl) => isSiteRtl ? __28("Left", "elementor") : __28("Right", "elementor");
var DimensionsField = () => {
  const { isSiteRtl } = useDirection();
  const rowRefs = [useRef7(null), useRef7(null)];
  return /* @__PURE__ */ React50.createElement(UiProviders, null, /* @__PURE__ */ React50.createElement(Stack8, { direction: "row", gap: 2, flexWrap: "nowrap", ref: rowRefs[0] }, /* @__PURE__ */ React50.createElement(DimensionField, { side: "inset-block-start", label: __28("Top", "elementor"), rowRef: rowRefs[0] }), /* @__PURE__ */ React50.createElement(
    DimensionField,
    {
      side: "inset-inline-end",
      label: getInlineEndLabel(isSiteRtl),
      rowRef: rowRefs[0]
    }
  )), /* @__PURE__ */ React50.createElement(Stack8, { direction: "row", gap: 2, flexWrap: "nowrap", ref: rowRefs[1] }, /* @__PURE__ */ React50.createElement(DimensionField, { side: "inset-block-end", label: __28("Bottom", "elementor"), rowRef: rowRefs[1] }), /* @__PURE__ */ React50.createElement(
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
}) => /* @__PURE__ */ React50.createElement(StylesField, { bind: side, propDisplayName: label }, /* @__PURE__ */ React50.createElement(Grid3, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React50.createElement(Grid3, { item: true, xs: 12 }, /* @__PURE__ */ React50.createElement(ControlLabel, null, label)), /* @__PURE__ */ React50.createElement(Grid3, { item: true, xs: 12 }, /* @__PURE__ */ React50.createElement(
  SizeControl4,
  {
    startIcon: sideIcons[side],
    extendedOptions: ["auto"],
    anchorRef: rowRef,
    min: -Number.MAX_SAFE_INTEGER
  }
))));

// src/components/style-sections/position-section/offset-field.tsx
import * as React51 from "react";
import { useRef as useRef8 } from "react";
import { SizeControl as SizeControl5 } from "@elementor/editor-controls";
import { __ as __29 } from "@wordpress/i18n";
var OFFSET_LABEL = __29("Anchor offset", "elementor");
var UNITS = ["px", "em", "rem", "vw", "vh"];
var OffsetField = () => {
  const rowRef = useRef8(null);
  return /* @__PURE__ */ React51.createElement(StylesField, { bind: "scroll-margin-top", propDisplayName: OFFSET_LABEL }, /* @__PURE__ */ React51.createElement(StylesFieldLayout, { label: OFFSET_LABEL, ref: rowRef }, /* @__PURE__ */ React51.createElement(SizeControl5, { units: UNITS, anchorRef: rowRef })));
};

// src/components/style-sections/position-section/position-field.tsx
import * as React52 from "react";
import { SelectControl as SelectControl3 } from "@elementor/editor-controls";
import { __ as __30 } from "@wordpress/i18n";
var POSITION_LABEL = __30("Position", "elementor");
var positionOptions = [
  { label: __30("Static", "elementor"), value: "static" },
  { label: __30("Relative", "elementor"), value: "relative" },
  { label: __30("Absolute", "elementor"), value: "absolute" },
  { label: __30("Fixed", "elementor"), value: "fixed" },
  { label: __30("Sticky", "elementor"), value: "sticky" }
];
var PositionField = ({ onChange }) => {
  return /* @__PURE__ */ React52.createElement(StylesField, { bind: "position", propDisplayName: POSITION_LABEL }, /* @__PURE__ */ React52.createElement(StylesFieldLayout, { label: POSITION_LABEL }, /* @__PURE__ */ React52.createElement(SelectControl3, { options: positionOptions, onChange })));
};

// src/components/style-sections/position-section/z-index-field.tsx
import * as React53 from "react";
import { NumberControl as NumberControl4 } from "@elementor/editor-controls";
import { __ as __31 } from "@wordpress/i18n";
var Z_INDEX_LABEL = __31("Z-index", "elementor");
var ZIndexField = () => {
  return /* @__PURE__ */ React53.createElement(StylesField, { bind: "z-index", propDisplayName: Z_INDEX_LABEL }, /* @__PURE__ */ React53.createElement(StylesFieldLayout, { label: Z_INDEX_LABEL }, /* @__PURE__ */ React53.createElement(NumberControl4, null)));
};

// src/components/style-sections/position-section/position-section.tsx
var POSITION_LABEL2 = __32("Position", "elementor");
var DIMENSIONS_LABEL = __32("Dimensions", "elementor");
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
  return useSessionStorage3(dimensionsPath);
};

// src/components/style-sections/size-section/size-section.tsx
import * as React59 from "react";
import { useRef as useRef9 } from "react";
import { AspectRatioControl, PositionControl, SizeControl as SizeControl6 } from "@elementor/editor-controls";
import { Grid as Grid4, Stack as Stack10 } from "@elementor/ui";
import { __ as __36 } from "@wordpress/i18n";

// src/components/style-tab-collapsible-content.tsx
import * as React56 from "react";
import { CollapsibleContent } from "@elementor/editor-ui";

// src/styles-inheritance/components/styles-inheritance-section-indicators.tsx
import * as React55 from "react";
import { isElementsStylesProvider as isElementsStylesProvider6 } from "@elementor/editor-styles-repository";
import { Stack as Stack9, Tooltip } from "@elementor/ui";
import { __ as __33 } from "@wordpress/i18n";
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
  const hasValueLabel = __33("Has effective styles", "elementor");
  const hasOverridesLabel = __33("Has overridden styles", "elementor");
  return /* @__PURE__ */ React55.createElement(Tooltip, { title: __33("Has styles", "elementor"), placement: "top" }, /* @__PURE__ */ React55.createElement(Stack9, { direction: "row", sx: { "& > *": { marginInlineStart: -0.25 } }, role: "list" }, hasValues && provider && /* @__PURE__ */ React55.createElement(
    StyleIndicator,
    {
      getColor: getStylesProviderThemeColor(provider.getKey()),
      "data-variant": isElementsStylesProvider6(provider.getKey()) ? "local" : "global",
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
  return /* @__PURE__ */ React56.createElement(CollapsibleContent, { titleEnd: getStylesInheritanceIndicators(fields) }, children);
};
function getStylesInheritanceIndicators(fields) {
  if (fields.length === 0) {
    return null;
  }
  return (isOpen) => !isOpen ? /* @__PURE__ */ React56.createElement(StylesInheritanceSectionIndicators, { fields }) : null;
}

// src/components/style-sections/size-section/object-fit-field.tsx
import * as React57 from "react";
import { SelectControl as SelectControl4 } from "@elementor/editor-controls";
import { __ as __34 } from "@wordpress/i18n";
var OBJECT_FIT_LABEL = __34("Object fit", "elementor");
var positionOptions2 = [
  { label: __34("Fill", "elementor"), value: "fill" },
  { label: __34("Cover", "elementor"), value: "cover" },
  { label: __34("Contain", "elementor"), value: "contain" },
  { label: __34("None", "elementor"), value: "none" },
  { label: __34("Scale down", "elementor"), value: "scale-down" }
];
var ObjectFitField = () => {
  return /* @__PURE__ */ React57.createElement(StylesField, { bind: "object-fit", propDisplayName: OBJECT_FIT_LABEL }, /* @__PURE__ */ React57.createElement(StylesFieldLayout, { label: OBJECT_FIT_LABEL }, /* @__PURE__ */ React57.createElement(SelectControl4, { options: positionOptions2 })));
};

// src/components/style-sections/size-section/overflow-field.tsx
import * as React58 from "react";
import { ToggleControl as ToggleControl9 } from "@elementor/editor-controls";
import { EyeIcon, EyeOffIcon, LetterAIcon } from "@elementor/icons";
import { __ as __35 } from "@wordpress/i18n";
var OVERFLOW_LABEL = __35("Overflow", "elementor");
var options6 = [
  {
    value: "visible",
    label: __35("Visible", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React58.createElement(EyeIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "hidden",
    label: __35("Hidden", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React58.createElement(EyeOffIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "auto",
    label: __35("Auto", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React58.createElement(LetterAIcon, { fontSize: size }),
    showTooltip: true
  }
];
var OverflowField = () => {
  return /* @__PURE__ */ React58.createElement(StylesField, { bind: "overflow", propDisplayName: OVERFLOW_LABEL }, /* @__PURE__ */ React58.createElement(StylesFieldLayout, { label: OVERFLOW_LABEL }, /* @__PURE__ */ React58.createElement(ToggleControl9, { options: options6 })));
};

// src/components/style-sections/size-section/size-section.tsx
var CssSizeProps = [
  [
    {
      bind: "width",
      label: __36("Width", "elementor")
    },
    {
      bind: "height",
      label: __36("Height", "elementor")
    }
  ],
  [
    {
      bind: "min-width",
      label: __36("Min width", "elementor")
    },
    {
      bind: "min-height",
      label: __36("Min height", "elementor")
    }
  ],
  [
    {
      bind: "max-width",
      label: __36("Max width", "elementor")
    },
    {
      bind: "max-height",
      label: __36("Max height", "elementor")
    }
  ]
];
var ASPECT_RATIO_LABEL = __36("Aspect Ratio", "elementor");
var SizeSection = () => {
  const gridRowRefs = [useRef9(null), useRef9(null), useRef9(null)];
  return /* @__PURE__ */ React59.createElement(SectionContent, null, CssSizeProps.map((row, rowIndex) => /* @__PURE__ */ React59.createElement(Grid4, { key: rowIndex, container: true, gap: 2, flexWrap: "nowrap", ref: gridRowRefs[rowIndex] }, row.map((props) => /* @__PURE__ */ React59.createElement(Grid4, { item: true, xs: 6, key: props.bind }, /* @__PURE__ */ React59.createElement(SizeField, { ...props, rowRef: gridRowRefs[rowIndex], extendedOptions: ["auto"] }))))), /* @__PURE__ */ React59.createElement(PanelDivider, null), /* @__PURE__ */ React59.createElement(Stack10, null, /* @__PURE__ */ React59.createElement(OverflowField, null)), /* @__PURE__ */ React59.createElement(StyleTabCollapsibleContent, { fields: ["aspect-ratio", "object-fit"] }, /* @__PURE__ */ React59.createElement(Stack10, { gap: 2, pt: 2 }, /* @__PURE__ */ React59.createElement(StylesField, { bind: "aspect-ratio", propDisplayName: ASPECT_RATIO_LABEL }, /* @__PURE__ */ React59.createElement(AspectRatioControl, { label: ASPECT_RATIO_LABEL })), /* @__PURE__ */ React59.createElement(PanelDivider, null), /* @__PURE__ */ React59.createElement(ObjectFitField, null), /* @__PURE__ */ React59.createElement(StylesField, { bind: "object-position", propDisplayName: __36("Object position", "elementor") }, /* @__PURE__ */ React59.createElement(Grid4, { item: true, xs: 6 }, /* @__PURE__ */ React59.createElement(PositionControl, null))))));
};
var SizeField = ({ label, bind, rowRef, extendedOptions }) => {
  return /* @__PURE__ */ React59.createElement(StylesField, { bind, propDisplayName: label }, /* @__PURE__ */ React59.createElement(Grid4, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React59.createElement(Grid4, { item: true, xs: 12 }, /* @__PURE__ */ React59.createElement(ControlLabel, null, label)), /* @__PURE__ */ React59.createElement(Grid4, { item: true, xs: 12 }, /* @__PURE__ */ React59.createElement(SizeControl6, { extendedOptions, anchorRef: rowRef }))));
};

// src/components/style-sections/spacing-section/spacing-section.tsx
import * as React60 from "react";
import { LinkedDimensionsControl } from "@elementor/editor-controls";
import { __ as __37 } from "@wordpress/i18n";
var MARGIN_LABEL = __37("Margin", "elementor");
var PADDING_LABEL = __37("Padding", "elementor");
var SpacingSection = () => {
  const { isSiteRtl } = useDirection();
  return /* @__PURE__ */ React60.createElement(SectionContent, null, /* @__PURE__ */ React60.createElement(StylesField, { bind: "margin", propDisplayName: MARGIN_LABEL }, /* @__PURE__ */ React60.createElement(
    LinkedDimensionsControl,
    {
      label: MARGIN_LABEL,
      isSiteRtl,
      extendedOptions: ["auto"],
      min: -Number.MAX_SAFE_INTEGER
    }
  )), /* @__PURE__ */ React60.createElement(PanelDivider, null), /* @__PURE__ */ React60.createElement(StylesField, { bind: "padding", propDisplayName: PADDING_LABEL }, /* @__PURE__ */ React60.createElement(LinkedDimensionsControl, { label: PADDING_LABEL, isSiteRtl })));
};

// src/components/style-sections/typography-section/typography-section.tsx
import * as React77 from "react";

// src/components/style-sections/typography-section/column-count-field.tsx
import * as React61 from "react";
import { NumberControl as NumberControl5 } from "@elementor/editor-controls";
import { __ as __38 } from "@wordpress/i18n";
var COLUMN_COUNT_LABEL = __38("Columns", "elementor");
var ColumnCountField = () => {
  return /* @__PURE__ */ React61.createElement(StylesField, { bind: "column-count", propDisplayName: COLUMN_COUNT_LABEL }, /* @__PURE__ */ React61.createElement(StylesFieldLayout, { label: COLUMN_COUNT_LABEL }, /* @__PURE__ */ React61.createElement(NumberControl5, { shouldForceInt: true, min: 0, step: 1 })));
};

// src/components/style-sections/typography-section/column-gap-field.tsx
import * as React62 from "react";
import { useRef as useRef10 } from "react";
import { SizeControl as SizeControl7 } from "@elementor/editor-controls";
import { __ as __39 } from "@wordpress/i18n";
var COLUMN_GAP_LABEL = __39("Column gap", "elementor");
var ColumnGapField = () => {
  const rowRef = useRef10(null);
  return /* @__PURE__ */ React62.createElement(StylesField, { bind: "column-gap", propDisplayName: COLUMN_GAP_LABEL }, /* @__PURE__ */ React62.createElement(StylesFieldLayout, { label: COLUMN_GAP_LABEL, ref: rowRef }, /* @__PURE__ */ React62.createElement(SizeControl7, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/font-family-field.tsx
import * as React63 from "react";
import { FontFamilyControl, useFontFamilies } from "@elementor/editor-controls";
import { useSectionWidth } from "@elementor/editor-ui";
import { __ as __40 } from "@wordpress/i18n";
var FONT_FAMILY_LABEL = __40("Font family", "elementor");
var FontFamilyField = () => {
  const fontFamilies = useFontFamilies();
  const sectionWidth = useSectionWidth();
  if (fontFamilies.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React63.createElement(StylesField, { bind: "font-family", propDisplayName: FONT_FAMILY_LABEL }, /* @__PURE__ */ React63.createElement(StylesFieldLayout, { label: FONT_FAMILY_LABEL }, /* @__PURE__ */ React63.createElement(
    FontFamilyControl,
    {
      fontFamilies,
      sectionWidth,
      ariaLabel: FONT_FAMILY_LABEL
    }
  )));
};

// src/components/style-sections/typography-section/font-size-field.tsx
import * as React64 from "react";
import { useRef as useRef11 } from "react";
import { SizeControl as SizeControl8 } from "@elementor/editor-controls";
import { __ as __41 } from "@wordpress/i18n";
var FONT_SIZE_LABEL = __41("Font size", "elementor");
var FontSizeField = () => {
  const rowRef = useRef11(null);
  return /* @__PURE__ */ React64.createElement(StylesField, { bind: "font-size", propDisplayName: FONT_SIZE_LABEL }, /* @__PURE__ */ React64.createElement(StylesFieldLayout, { label: FONT_SIZE_LABEL, ref: rowRef }, /* @__PURE__ */ React64.createElement(SizeControl8, { anchorRef: rowRef, ariaLabel: FONT_SIZE_LABEL })));
};

// src/components/style-sections/typography-section/font-style-field.tsx
import * as React65 from "react";
import { ToggleControl as ToggleControl10 } from "@elementor/editor-controls";
import { ItalicIcon, MinusIcon } from "@elementor/icons";
import { __ as __42 } from "@wordpress/i18n";
var FONT_STYLE_LABEL = __42("Font style", "elementor");
var options7 = [
  {
    value: "normal",
    label: __42("Normal", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React65.createElement(MinusIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "italic",
    label: __42("Italic", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React65.createElement(ItalicIcon, { fontSize: size }),
    showTooltip: true
  }
];
var FontStyleField = () => {
  return /* @__PURE__ */ React65.createElement(StylesField, { bind: "font-style", propDisplayName: FONT_STYLE_LABEL }, /* @__PURE__ */ React65.createElement(StylesFieldLayout, { label: FONT_STYLE_LABEL }, /* @__PURE__ */ React65.createElement(ToggleControl10, { options: options7 })));
};

// src/components/style-sections/typography-section/font-weight-field.tsx
import * as React66 from "react";
import { SelectControl as SelectControl5 } from "@elementor/editor-controls";
import { __ as __43 } from "@wordpress/i18n";
var FONT_WEIGHT_LABEL = __43("Font weight", "elementor");
var fontWeightOptions = [
  { value: "100", label: __43("100 - Thin", "elementor") },
  { value: "200", label: __43("200 - Extra light", "elementor") },
  { value: "300", label: __43("300 - Light", "elementor") },
  { value: "400", label: __43("400 - Normal", "elementor") },
  { value: "500", label: __43("500 - Medium", "elementor") },
  { value: "600", label: __43("600 - Semi bold", "elementor") },
  { value: "700", label: __43("700 - Bold", "elementor") },
  { value: "800", label: __43("800 - Extra bold", "elementor") },
  { value: "900", label: __43("900 - Black", "elementor") }
];
var FontWeightField = () => {
  return /* @__PURE__ */ React66.createElement(StylesField, { bind: "font-weight", propDisplayName: FONT_WEIGHT_LABEL }, /* @__PURE__ */ React66.createElement(StylesFieldLayout, { label: FONT_WEIGHT_LABEL }, /* @__PURE__ */ React66.createElement(SelectControl5, { options: fontWeightOptions })));
};

// src/components/style-sections/typography-section/letter-spacing-field.tsx
import * as React67 from "react";
import { useRef as useRef12 } from "react";
import { SizeControl as SizeControl9 } from "@elementor/editor-controls";
import { __ as __44 } from "@wordpress/i18n";
var LETTER_SPACING_LABEL = __44("Letter spacing", "elementor");
var LetterSpacingField = () => {
  const rowRef = useRef12(null);
  return /* @__PURE__ */ React67.createElement(StylesField, { bind: "letter-spacing", propDisplayName: LETTER_SPACING_LABEL }, /* @__PURE__ */ React67.createElement(StylesFieldLayout, { label: LETTER_SPACING_LABEL, ref: rowRef }, /* @__PURE__ */ React67.createElement(SizeControl9, { anchorRef: rowRef, min: -Number.MAX_SAFE_INTEGER })));
};

// src/components/style-sections/typography-section/line-height-field.tsx
import * as React68 from "react";
import { useRef as useRef13 } from "react";
import { SizeControl as SizeControl10 } from "@elementor/editor-controls";
import { __ as __45 } from "@wordpress/i18n";
var LINE_HEIGHT_LABEL = __45("Line height", "elementor");
var LineHeightField = () => {
  const rowRef = useRef13(null);
  return /* @__PURE__ */ React68.createElement(StylesField, { bind: "line-height", propDisplayName: LINE_HEIGHT_LABEL }, /* @__PURE__ */ React68.createElement(StylesFieldLayout, { label: LINE_HEIGHT_LABEL, ref: rowRef }, /* @__PURE__ */ React68.createElement(SizeControl10, { anchorRef: rowRef })));
};

// src/components/style-sections/typography-section/text-alignment-field.tsx
import * as React69 from "react";
import { ToggleControl as ToggleControl11 } from "@elementor/editor-controls";
import { AlignCenterIcon, AlignJustifiedIcon, AlignLeftIcon, AlignRightIcon } from "@elementor/icons";
import { withDirection as withDirection9 } from "@elementor/ui";
import { __ as __46 } from "@wordpress/i18n";
var TEXT_ALIGNMENT_LABEL = __46("Text align", "elementor");
var AlignStartIcon = withDirection9(AlignLeftIcon);
var AlignEndIcon = withDirection9(AlignRightIcon);
var options8 = [
  {
    value: "start",
    label: __46("Start", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React69.createElement(AlignStartIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "center",
    label: __46("Center", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React69.createElement(AlignCenterIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "end",
    label: __46("End", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React69.createElement(AlignEndIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "justify",
    label: __46("Justify", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React69.createElement(AlignJustifiedIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextAlignmentField = () => {
  return /* @__PURE__ */ React69.createElement(StylesField, { bind: "text-align", propDisplayName: TEXT_ALIGNMENT_LABEL }, /* @__PURE__ */ React69.createElement(UiProviders, null, /* @__PURE__ */ React69.createElement(StylesFieldLayout, { label: TEXT_ALIGNMENT_LABEL }, /* @__PURE__ */ React69.createElement(ToggleControl11, { options: options8 }))));
};

// src/components/style-sections/typography-section/text-color-field.tsx
import * as React70 from "react";
import { ColorControl as ColorControl2 } from "@elementor/editor-controls";
import { __ as __47 } from "@wordpress/i18n";
var TEXT_COLOR_LABEL = __47("Text color", "elementor");
var TextColorField = () => {
  return /* @__PURE__ */ React70.createElement(StylesField, { bind: "color", propDisplayName: TEXT_COLOR_LABEL }, /* @__PURE__ */ React70.createElement(StylesFieldLayout, { label: TEXT_COLOR_LABEL }, /* @__PURE__ */ React70.createElement(ColorControl2, { id: "text-color-control" })));
};

// src/components/style-sections/typography-section/text-decoration-field.tsx
import * as React71 from "react";
import { ToggleControl as ToggleControl12 } from "@elementor/editor-controls";
import { MinusIcon as MinusIcon2, OverlineIcon, StrikethroughIcon, UnderlineIcon } from "@elementor/icons";
import { __ as __48 } from "@wordpress/i18n";
var TEXT_DECORATION_LABEL = __48("Line decoration", "elementor");
var options9 = [
  {
    value: "none",
    label: __48("None", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(MinusIcon2, { fontSize: size }),
    showTooltip: true,
    exclusive: true
  },
  {
    value: "underline",
    label: __48("Underline", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(UnderlineIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "line-through",
    label: __48("Line-through", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(StrikethroughIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "overline",
    label: __48("Overline", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React71.createElement(OverlineIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextDecorationField = () => /* @__PURE__ */ React71.createElement(StylesField, { bind: "text-decoration", propDisplayName: TEXT_DECORATION_LABEL }, /* @__PURE__ */ React71.createElement(StylesFieldLayout, { label: TEXT_DECORATION_LABEL }, /* @__PURE__ */ React71.createElement(ToggleControl12, { options: options9, exclusive: false })));

// src/components/style-sections/typography-section/text-direction-field.tsx
import * as React72 from "react";
import { ToggleControl as ToggleControl13 } from "@elementor/editor-controls";
import { TextDirectionLtrIcon, TextDirectionRtlIcon } from "@elementor/icons";
import { __ as __49 } from "@wordpress/i18n";
var TEXT_DIRECTION_LABEL = __49("Direction", "elementor");
var options10 = [
  {
    value: "ltr",
    label: __49("Left to right", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React72.createElement(TextDirectionLtrIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "rtl",
    label: __49("Right to left", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React72.createElement(TextDirectionRtlIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TextDirectionField = () => {
  return /* @__PURE__ */ React72.createElement(StylesField, { bind: "direction", propDisplayName: TEXT_DIRECTION_LABEL }, /* @__PURE__ */ React72.createElement(StylesFieldLayout, { label: TEXT_DIRECTION_LABEL }, /* @__PURE__ */ React72.createElement(ToggleControl13, { options: options10 })));
};

// src/components/style-sections/typography-section/text-stroke-field.tsx
import * as React74 from "react";
import { StrokeControl } from "@elementor/editor-controls";
import { __ as __50 } from "@wordpress/i18n";

// src/components/add-or-remove-content.tsx
import * as React73 from "react";
import { MinusIcon as MinusIcon3, PlusIcon } from "@elementor/icons";
import { Collapse as Collapse2, IconButton, Stack as Stack11 } from "@elementor/ui";
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
    Stack11,
    {
      direction: "row",
      sx: {
        justifyContent: "space-between",
        alignItems: "center",
        marginInlineEnd: -0.75
      }
    },
    renderLabel(),
    isAdded ? /* @__PURE__ */ React73.createElement(IconButton, { size: SIZE, onClick: onRemove, "aria-label": "Remove", disabled }, /* @__PURE__ */ React73.createElement(MinusIcon3, { fontSize: SIZE })) : /* @__PURE__ */ React73.createElement(IconButton, { size: SIZE, onClick: onAdd, "aria-label": "Add", disabled }, /* @__PURE__ */ React73.createElement(PlusIcon, { fontSize: SIZE }))
  ), /* @__PURE__ */ React73.createElement(Collapse2, { in: isAdded, unmountOnExit: true }, /* @__PURE__ */ React73.createElement(SectionContent, null, children)));
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
var TEXT_STROKE_LABEL = __50("Text stroke", "elementor");
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
    /* @__PURE__ */ React74.createElement(StrokeControl, null)
  ));
};

// src/components/style-sections/typography-section/transform-field.tsx
import * as React75 from "react";
import { ToggleControl as ToggleControl14 } from "@elementor/editor-controls";
import { LetterCaseIcon, LetterCaseLowerIcon, LetterCaseUpperIcon, MinusIcon as MinusIcon4 } from "@elementor/icons";
import { __ as __51 } from "@wordpress/i18n";
var TEXT_TRANSFORM_LABEL = __51("Text transform", "elementor");
var options11 = [
  {
    value: "none",
    label: __51("None", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(MinusIcon4, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "capitalize",
    label: __51("Capitalize", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(LetterCaseIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "uppercase",
    label: __51("Uppercase", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(LetterCaseUpperIcon, { fontSize: size }),
    showTooltip: true
  },
  {
    value: "lowercase",
    label: __51("Lowercase", "elementor"),
    renderContent: ({ size }) => /* @__PURE__ */ React75.createElement(LetterCaseLowerIcon, { fontSize: size }),
    showTooltip: true
  }
];
var TransformField = () => /* @__PURE__ */ React75.createElement(StylesField, { bind: "text-transform", propDisplayName: TEXT_TRANSFORM_LABEL }, /* @__PURE__ */ React75.createElement(StylesFieldLayout, { label: TEXT_TRANSFORM_LABEL }, /* @__PURE__ */ React75.createElement(ToggleControl14, { options: options11 })));

// src/components/style-sections/typography-section/word-spacing-field.tsx
import * as React76 from "react";
import { useRef as useRef14 } from "react";
import { SizeControl as SizeControl11 } from "@elementor/editor-controls";
import { __ as __52 } from "@wordpress/i18n";
var WORD_SPACING_LABEL = __52("Word spacing", "elementor");
var WordSpacingField = () => {
  const rowRef = useRef14(null);
  return /* @__PURE__ */ React76.createElement(StylesField, { bind: "word-spacing", propDisplayName: WORD_SPACING_LABEL }, /* @__PURE__ */ React76.createElement(StylesFieldLayout, { label: WORD_SPACING_LABEL, ref: rowRef }, /* @__PURE__ */ React76.createElement(SizeControl11, { anchorRef: rowRef, min: -Number.MAX_SAFE_INTEGER })));
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
import * as React78 from "react";
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
var { Slot: StyleTabSlot, inject: injectIntoStyleTab } = createLocation3();
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
  const [activeStyleState, setActiveStyleState] = useState9(null);
  const breakpoint = useActiveBreakpoint();
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
    /* @__PURE__ */ React79.createElement(SessionStorageProvider2, { prefix: activeStyleDefId ?? "" }, /* @__PURE__ */ React79.createElement(StyleInheritanceProvider, null, /* @__PURE__ */ React79.createElement(ClassesHeader, null, /* @__PURE__ */ React79.createElement(CssClassSelector, null), /* @__PURE__ */ React79.createElement(Divider5, null)), /* @__PURE__ */ React79.createElement(SectionsList, null, /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: LayoutSection,
          name: "Layout",
          title: __53("Layout", "elementor")
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
          title: __53("Spacing", "elementor")
        },
        fields: ["margin", "padding"]
      }
    ), /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: SizeSection,
          name: "Size",
          title: __53("Size", "elementor")
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
          title: __53("Position", "elementor")
        },
        fields: ["position", "z-index", "scroll-margin-top"]
      }
    ), /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: TypographySection,
          name: "Typography",
          title: __53("Typography", "elementor")
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
          title: __53("Background", "elementor")
        },
        fields: ["background"]
      }
    ), /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: BorderSection,
          name: "Border",
          title: __53("Border", "elementor")
        },
        fields: ["border-radius", "border-width", "border-color", "border-style"]
      }
    ), /* @__PURE__ */ React79.createElement(
      StyleTabSection,
      {
        section: {
          component: EffectsSection,
          name: "Effects",
          title: __53("Effects", "elementor")
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
    ), /* @__PURE__ */ React79.createElement(StyleTabSlot, null)), /* @__PURE__ */ React79.createElement(Box5, { sx: { height: "150px" } })))
  ));
};
function ClassesHeader({ children }) {
  const scrollDirection = useScrollDirection();
  return /* @__PURE__ */ React79.createElement(Stack12, { sx: { ...stickyHeaderStyles, top: scrollDirection === "up" ? TABS_HEADER_HEIGHT : 0 } }, children);
}
function useCurrentClassesProp() {
  const { elementType } = useElement();
  const prop = Object.entries(elementType.propsSchema).find(
    ([, propType]) => propType.kind === "plain" && propType.key === CLASSES_PROP_KEY
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
    /* @__PURE__ */ React80.createElement(Fragment9, { key: element.id }, /* @__PURE__ */ React80.createElement(PanelTabContent, null))
  );
};
var PanelTabContent = () => {
  const editorDefaults = useDefaultPanelSettings();
  const defaultComponentTab = editorDefaults.defaultTab;
  const isInteractionsActive = isExperimentActive("e_interactions");
  const [currentTab, setCurrentTab] = useStateByElement("tab", defaultComponentTab);
  const { getTabProps, getTabPanelProps, getTabsProps } = useTabs(currentTab);
  return /* @__PURE__ */ React80.createElement(ScrollProvider, null, /* @__PURE__ */ React80.createElement(Stack13, { direction: "column", sx: { width: "100%" } }, /* @__PURE__ */ React80.createElement(Stack13, { sx: { ...stickyHeaderStyles, top: 0 } }, /* @__PURE__ */ React80.createElement(
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
    /* @__PURE__ */ React80.createElement(Tab, { label: __54("General", "elementor"), ...getTabProps("settings") }),
    /* @__PURE__ */ React80.createElement(Tab, { label: __54("Style", "elementor"), ...getTabProps("style") }),
    isInteractionsActive && /* @__PURE__ */ React80.createElement(Tab, { label: __54("Interactions", "elementor"), ...getTabProps("interactions") })
  ), /* @__PURE__ */ React80.createElement(Divider6, null)), /* @__PURE__ */ React80.createElement(TabPanel, { ...getTabPanelProps("settings"), disablePadding: true }, /* @__PURE__ */ React80.createElement(SettingsTab, null)), /* @__PURE__ */ React80.createElement(TabPanel, { ...getTabPanelProps("style"), disablePadding: true }, /* @__PURE__ */ React80.createElement(StyleTab, null)), isInteractionsActive && /* @__PURE__ */ React80.createElement(TabPanel, { ...getTabPanelProps("interactions"), disablePadding: true }, /* @__PURE__ */ React80.createElement(InteractionsTab, null))));
};

// src/components/editing-panel.tsx
var { Slot: PanelHeaderTopSlot, inject: injectIntoPanelHeaderTop } = createLocation4();
var { useMenuItems } = controlActionsMenu;
var EditingPanel = () => {
  const { element, elementType, settings } = useSelectedElementSettings();
  const controlReplacements = getControlReplacements();
  const menuItems = useMenuItems().default;
  if (!element || !elementType) {
    return null;
  }
  const panelTitle = __55("Edit %s", "elementor").replace("%s", elementType.title);
  const { component: ReplacementComponent } = getEditingPanelReplacement(element, elementType) ?? {};
  let panelContent = /* @__PURE__ */ React81.createElement(React81.Fragment, null, /* @__PURE__ */ React81.createElement(PanelHeader, null, /* @__PURE__ */ React81.createElement(PanelHeaderTitle, null, panelTitle), /* @__PURE__ */ React81.createElement(AtomIcon, { fontSize: "small", sx: { color: "text.tertiary" } })), /* @__PURE__ */ React81.createElement(PanelBody, null, /* @__PURE__ */ React81.createElement(EditingPanelTabs, null)));
  if (ReplacementComponent) {
    panelContent = /* @__PURE__ */ React81.createElement(ReplacementComponent, null);
  }
  return /* @__PURE__ */ React81.createElement(ErrorBoundary, { fallback: /* @__PURE__ */ React81.createElement(EditorPanelErrorFallback, null) }, /* @__PURE__ */ React81.createElement(SessionStorageProvider3, { prefix: "elementor" }, /* @__PURE__ */ React81.createElement(ThemeProvider3, null, /* @__PURE__ */ React81.createElement(ControlActionsProvider, { items: menuItems }, /* @__PURE__ */ React81.createElement(ControlReplacementsProvider, { replacements: controlReplacements }, /* @__PURE__ */ React81.createElement(ElementProvider, { element, elementType, settings }, /* @__PURE__ */ React81.createElement(Panel, null, /* @__PURE__ */ React81.createElement(PanelHeaderTopSlot, null), panelContent)))))));
};

// src/init.ts
import { injectIntoLogic } from "@elementor/editor";
import { __registerPanel as registerPanel } from "@elementor/editor-panels";
import { blockCommand } from "@elementor/editor-v1-adapters";

// src/hooks/use-open-editor-panel.ts
import { useEffect as useEffect6 } from "react";
import { __privateListenTo as listenTo, commandStartEvent } from "@elementor/editor-v1-adapters";

// src/panel.ts
import { __createPanel as createPanel } from "@elementor/editor-panels";
var { panel, usePanelActions, usePanelStatus } = createPanel({
  id: "editing-panel",
  component: EditingPanel
});

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
  useEffect6(() => {
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

// src/components/promotions/init.tsx
import { AttributesControl, DisplayConditionsControl } from "@elementor/editor-controls";

// src/components/promotions/custom-css.tsx
import * as React82 from "react";
import { useRef as useRef15 } from "react";
import { PromotionTrigger } from "@elementor/editor-controls";
import { __ as __56 } from "@wordpress/i18n";
var CustomCssSection = () => {
  const triggerRef = useRef15(null);
  return /* @__PURE__ */ React82.createElement(
    StyleTabSection,
    {
      section: {
        name: "Custom CSS",
        title: __56("Custom CSS", "elementor"),
        action: {
          component: /* @__PURE__ */ React82.createElement(PromotionTrigger, { ref: triggerRef, promotionKey: "customCss" }),
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
    controlsRegistry.register("attributes", AttributesControl, "two-columns");
    controlsRegistry.register("display-conditions", DisplayConditionsControl, "two-columns");
  }
};

// src/controls-registry/element-controls/tabs-control/tabs-control.tsx
import * as React83 from "react";
import {
  ControlFormLabel as ControlFormLabel3,
  Repeater,
  useBoundProp as useBoundProp5
} from "@elementor/editor-controls";
import {
  updateElementEditorSettings,
  useElementChildren,
  useElementEditorSettings
} from "@elementor/editor-elements";
import { numberPropTypeUtil as numberPropTypeUtil4 } from "@elementor/editor-props";
import { InfoCircleFilledIcon } from "@elementor/icons";
import { Alert as Alert2, Chip as Chip4, Infotip, Stack as Stack14, Switch, TextField as TextField2, Typography as Typography4 } from "@elementor/ui";
import { __ as __58 } from "@wordpress/i18n";

// src/controls-registry/element-controls/get-element-by-type.ts
import { getContainer as getContainer2 } from "@elementor/editor-elements";
var getElementByType = (elementId, type) => {
  const currentElement = getContainer2(elementId);
  if (!currentElement) {
    return null;
  }
  if (currentElement.model.get("elType") === type) {
    return currentElement;
  }
  return currentElement.children?.findRecursive?.((child) => child.model.get("elType") === type) ?? null;
};

// src/controls-registry/element-controls/tabs-control/use-actions.ts
import { useBoundProp as useBoundProp4 } from "@elementor/editor-controls";
import {
  createElements,
  duplicateElements,
  getContainer as getContainer3,
  moveElements,
  removeElements
} from "@elementor/editor-elements";
import { numberPropTypeUtil as numberPropTypeUtil3 } from "@elementor/editor-props";
import { __ as __57 } from "@wordpress/i18n";
var TAB_ELEMENT_TYPE = "e-tab";
var TAB_CONTENT_ELEMENT_TYPE = "e-tab-content";
var useActions = () => {
  const { value, setValue: setDefaultActiveTab } = useBoundProp4(numberPropTypeUtil3);
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
      const tabContentAreaContainer = getContainer3(tabContentAreaId);
      const tabContentId = tabContentAreaContainer?.children?.[index]?.id;
      if (!tabContentId) {
        throw new Error("Original content ID is required for duplication");
      }
      duplicateElements({
        elementIds: [tabId, tabContentId],
        title: __57("Duplicate Tab", "elementor"),
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
    const tabContentContainer = getContainer3(tabContentAreaId);
    const tabContent = tabContentContainer?.children?.[movedElementIndex];
    const movedElement = getContainer3(movedElementId);
    const tabsMenu = getContainer3(tabsMenuId);
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
    moveElements({
      title: __57("Reorder Tabs", "elementor"),
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
    removeElements({
      title: __57("Tabs", "elementor"),
      elementIds: items3.flatMap(({ item, index }) => {
        const tabId = item.id;
        const tabContentContainer = getContainer3(tabContentAreaId);
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
    const tabContentArea = getContainer3(tabContentAreaId);
    const tabsMenu = getContainer3(tabsMenuId);
    if (!tabContentArea || !tabsMenu) {
      throw new Error("Tab containers not found");
    }
    items3.forEach(({ index }) => {
      const position = index + 1;
      createElements({
        title: __57("Tabs", "elementor"),
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
  return /* @__PURE__ */ React83.createElement(SettingsField, { bind: "default-active-tab", propDisplayName: __58("Tabs", "elementor") }, /* @__PURE__ */ React83.createElement(TabsControlContent, { label }));
};
var TabsControlContent = ({ label }) => {
  const { element } = useElement();
  const { addItem, duplicateItem, moveItem, removeItem } = useActions();
  const { [TAB_ELEMENT_TYPE]: tabLinks } = useElementChildren(element.id, {
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
    Repeater,
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
  return /* @__PURE__ */ React83.createElement(Stack14, { sx: { minHeight: 20 }, direction: "row", alignItems: "center", gap: 1.5 }, /* @__PURE__ */ React83.createElement("span", null, elementTitle), /* @__PURE__ */ React83.createElement(ItemDefaultTab, { index }));
};
var ItemDefaultTab = ({ index }) => {
  const { value: defaultItem } = useBoundProp5(numberPropTypeUtil4);
  const isDefault = defaultItem === index;
  if (!isDefault) {
    return null;
  }
  return /* @__PURE__ */ React83.createElement(Chip4, { size: "tiny", shape: "rounded", label: __58("Default", "elementor") });
};
var ItemContent = ({ value, index }) => {
  if (!value.id) {
    return null;
  }
  return /* @__PURE__ */ React83.createElement(Stack14, { p: 2, gap: 1.5 }, /* @__PURE__ */ React83.createElement(TabLabelControl, { elementId: value.id }), /* @__PURE__ */ React83.createElement(SettingsField, { bind: "default-active-tab", propDisplayName: __58("Tabs", "elementor") }, /* @__PURE__ */ React83.createElement(DefaultTabControl, { tabIndex: index })));
};
var DefaultTabControl = ({ tabIndex }) => {
  const { value, setValue } = useBoundProp5(numberPropTypeUtil4);
  const isDefault = value === tabIndex;
  return /* @__PURE__ */ React83.createElement(Stack14, { direction: "row", alignItems: "center", justifyContent: "space-between", gap: 2 }, /* @__PURE__ */ React83.createElement(ControlFormLabel3, null, __58("Set as default tab", "elementor")), /* @__PURE__ */ React83.createElement(ConditionalTooltip, { showTooltip: isDefault, placement: "right" }, /* @__PURE__ */ React83.createElement(
    Switch,
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
  const editorSettings = useElementEditorSettings(elementId);
  const label = editorSettings?.title ?? "";
  return /* @__PURE__ */ React83.createElement(Stack14, { gap: 1 }, /* @__PURE__ */ React83.createElement(ControlFormLabel3, null, __58("Tab name", "elementor")), /* @__PURE__ */ React83.createElement(
    TextField2,
    {
      size: "tiny",
      value: label,
      onChange: ({ target }) => {
        updateElementEditorSettings({
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
    Infotip,
    {
      arrow: false,
      content: /* @__PURE__ */ React83.createElement(
        Alert2,
        {
          color: "secondary",
          icon: /* @__PURE__ */ React83.createElement(InfoCircleFilledIcon, { fontSize: "tiny" }),
          size: "small",
          sx: { width: 288 }
        },
        /* @__PURE__ */ React83.createElement(Typography4, { variant: "body2" }, __58("To change the default tab, simply set another tab as default.", "elementor"))
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
import { settingsTransformersRegistry, styleTransformersRegistry as styleTransformersRegistry2 } from "@elementor/editor-canvas";
import {
  injectIntoRepeaterItemIcon,
  injectIntoRepeaterItemLabel,
  registerControlReplacement
} from "@elementor/editor-controls";
import { controlActionsMenu as controlActionsMenu2 } from "@elementor/menus";

// src/dynamics/components/background-control-dynamic-tag.tsx
import * as React84 from "react";
import { PropKeyProvider as PropKeyProvider4, PropProvider as PropProvider4, useBoundProp as useBoundProp7 } from "@elementor/editor-controls";
import {
  backgroundImageOverlayPropTypeUtil
} from "@elementor/editor-props";
import { DatabaseIcon } from "@elementor/icons";

// src/dynamics/hooks/use-dynamic-tag.ts
import { useMemo as useMemo11 } from "react";

// src/dynamics/hooks/use-prop-dynamic-tags.ts
import { useMemo as useMemo10 } from "react";
import { useBoundProp as useBoundProp6 } from "@elementor/editor-controls";

// src/dynamics/sync/get-atomic-dynamic-tags.ts
import { getElementorConfig } from "@elementor/editor-v1-adapters";

// src/hooks/use-license-config.ts
import { useSyncExternalStore } from "react";
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
  return useSyncExternalStore(subscribe, getLicenseConfig, getLicenseConfig);
}

// src/dynamics/sync/get-atomic-dynamic-tags.ts
var getAtomicDynamicTags = (shouldFilterByLicense = true) => {
  const { atomicDynamicTags } = getElementorConfig();
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
import {
  createPropUtils,
  isTransformable as isTransformable2
} from "@elementor/editor-props";
import { getElementorConfig as getElementorConfig2 } from "@elementor/editor-v1-adapters";
import { z } from "@elementor/schema";
var DYNAMIC_PROP_TYPE_KEY = "dynamic";
var dynamicPropTypeUtil = createPropUtils(
  DYNAMIC_PROP_TYPE_KEY,
  z.strictObject({
    name: z.string(),
    group: z.string(),
    settings: z.any().optional()
  })
);
var isDynamicTagSupported = (tagName) => {
  return !!getElementorConfig2()?.atomicDynamicTags?.tags?.[tagName];
};
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

// src/dynamics/hooks/use-prop-dynamic-tags.ts
var usePropDynamicTags = () => {
  return usePropDynamicTagsInternal(true);
};
var useAllPropDynamicTags = () => {
  return usePropDynamicTagsInternal(false);
};
var usePropDynamicTagsInternal = (filterByLicense2) => {
  let categories = [];
  const { propType } = useBoundProp6();
  if (propType) {
    const propDynamicType = getDynamicPropType(propType);
    categories = propDynamicType?.settings.categories || [];
  }
  const categoriesKey = categories.join();
  return useMemo10(
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
  return useMemo11(() => dynamicTags.find((tag) => tag.name === tagName) ?? null, [dynamicTags, tagName]);
};

// src/dynamics/components/background-control-dynamic-tag.tsx
var BackgroundControlDynamicTagIcon = () => /* @__PURE__ */ React84.createElement(DatabaseIcon, { fontSize: "tiny" });
var BackgroundControlDynamicTagLabel = ({ value }) => {
  const context = useBoundProp7(backgroundImageOverlayPropTypeUtil);
  return /* @__PURE__ */ React84.createElement(PropProvider4, { ...context, value: value.value }, /* @__PURE__ */ React84.createElement(PropKeyProvider4, { bind: "image" }, /* @__PURE__ */ React84.createElement(Wrapper2, { rawValue: value.value })));
};
var Wrapper2 = ({ rawValue }) => {
  const { propType } = useBoundProp7();
  const imageOverlayPropType = propType.prop_types["background-image-overlay"];
  return /* @__PURE__ */ React84.createElement(PropProvider4, { propType: imageOverlayPropType.shape.image, value: rawValue, setValue: () => void 0 }, /* @__PURE__ */ React84.createElement(PropKeyProvider4, { bind: "src" }, /* @__PURE__ */ React84.createElement(Content, { rawValue: rawValue.image })));
};
var Content = ({ rawValue }) => {
  const src = rawValue.value.src;
  const dynamicTag = useDynamicTag(src.value.name || "");
  return /* @__PURE__ */ React84.createElement(React84.Fragment, null, dynamicTag?.label);
};

// src/dynamics/components/dynamic-selection-control.tsx
import * as React88 from "react";
import {
  ControlFormLabel as ControlFormLabel4,
  PropKeyProvider as PropKeyProvider6,
  PropProvider as PropProvider6,
  useBoundProp as useBoundProp10
} from "@elementor/editor-controls";
import { PopoverHeader as PopoverHeader2, SectionPopoverBody as SectionPopoverBody2 } from "@elementor/editor-ui";
import { DatabaseIcon as DatabaseIcon3, SettingsIcon, XIcon } from "@elementor/icons";
import {
  bindPopover,
  bindTrigger as bindTrigger2,
  Box as Box6,
  Divider as Divider8,
  Grid as Grid5,
  IconButton as IconButton2,
  Popover,
  Stack as Stack16,
  Tab as Tab2,
  TabPanel as TabPanel2,
  Tabs as Tabs2,
  UnstableTag as Tag,
  usePopupState as usePopupState2,
  useTabs as useTabs2
} from "@elementor/ui";
import { __ as __60 } from "@wordpress/i18n";

// src/hooks/use-persist-dynamic-value.ts
import { useSessionStorage as useSessionStorage4 } from "@elementor/session";
var usePersistDynamicValue = (propKey) => {
  const { element } = useElement();
  const prefixedKey = `dynamic/non-dynamic-values-history/${element.id}/${propKey}`;
  return useSessionStorage4(prefixedKey);
};

// src/dynamics/dynamic-control.tsx
import * as React86 from "react";
import { PropKeyProvider as PropKeyProvider5, PropProvider as PropProvider5, useBoundProp as useBoundProp8 } from "@elementor/editor-controls";

// src/dynamics/components/dynamic-conditional-control.tsx
import * as React85 from "react";
import { isDependencyMet as isDependencyMet4 } from "@elementor/editor-props";
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
  const isHidden = !isDependencyMet4(propType?.dependencies, effectiveSettings).isMet;
  return isHidden ? null : /* @__PURE__ */ React85.createElement(React85.Fragment, null, children);
};

// src/dynamics/dynamic-control.tsx
var DynamicControl = ({ bind, children }) => {
  const { value, setValue } = useBoundProp8(dynamicPropTypeUtil);
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
  return /* @__PURE__ */ React86.createElement(PropProvider5, { propType, setValue: setDynamicValue, value: { [bind]: dynamicValue } }, /* @__PURE__ */ React86.createElement(PropKeyProvider5, { bind }, /* @__PURE__ */ React86.createElement(
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
import { Fragment as Fragment13, useState as useState10 } from "react";
import * as React87 from "react";
import { useBoundProp as useBoundProp9 } from "@elementor/editor-controls";
import { CtaButton, PopoverHeader, PopoverMenuList, SearchField, SectionPopoverBody } from "@elementor/editor-ui";
import { DatabaseIcon as DatabaseIcon2 } from "@elementor/icons";
import { Divider as Divider7, Link as Link2, Stack as Stack15, Typography as Typography5, useTheme as useTheme3 } from "@elementor/ui";
import { __ as __59 } from "@wordpress/i18n";
var SIZE2 = "tiny";
var PROMO_TEXT_WIDTH = 170;
var PRO_DYNAMIC_TAGS_URL = "https://go.elementor.com/go-pro-dynamic-tags-modal/";
var RENEW_DYNAMIC_TAGS_URL = "https://go.elementor.com/go-pro-dynamic-tags-renew-modal/";
var DynamicSelection = ({ close: closePopover, expired = false }) => {
  const [searchValue, setSearchValue] = useState10("");
  const { groups: dynamicGroups } = getAtomicDynamicTags() || {};
  const theme = useTheme3();
  const { value: anyValue } = useBoundProp9();
  const { bind, value: dynamicValue, setValue } = useBoundProp9(dynamicPropTypeUtil);
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
    return /* @__PURE__ */ React87.createElement(Fragment13, null, /* @__PURE__ */ React87.createElement(
      SearchField,
      {
        value: searchValue,
        onSearch: handleSearch,
        placeholder: __59("Search dynamic tags\u2026", "elementor")
      }
    ), /* @__PURE__ */ React87.createElement(Divider7, null), /* @__PURE__ */ React87.createElement(
      PopoverMenuList,
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
  return /* @__PURE__ */ React87.createElement(SectionPopoverBody, { "aria-label": __59("Dynamic tags", "elementor") }, /* @__PURE__ */ React87.createElement(
    PopoverHeader,
    {
      title: __59("Dynamic tags", "elementor"),
      onClose: closePopover,
      icon: /* @__PURE__ */ React87.createElement(DatabaseIcon2, { fontSize: SIZE2 })
    }
  ), getPopOverContent());
};
var NoResults = ({ searchValue, onClear }) => /* @__PURE__ */ React87.createElement(
  Stack15,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    p: 2.5,
    color: "text.secondary",
    sx: { pb: 3.5 }
  },
  /* @__PURE__ */ React87.createElement(DatabaseIcon2, { fontSize: "large" }),
  /* @__PURE__ */ React87.createElement(Typography5, { align: "center", variant: "subtitle2" }, __59("Sorry, nothing matched", "elementor"), /* @__PURE__ */ React87.createElement("br", null), "\u201C", searchValue, "\u201D."),
  /* @__PURE__ */ React87.createElement(Typography5, { align: "center", variant: "caption", sx: { display: "flex", flexDirection: "column" } }, __59("Try something else.", "elementor"), /* @__PURE__ */ React87.createElement(Link2, { color: "text.secondary", variant: "caption", component: "button", onClick: onClear }, __59("Clear & try again", "elementor")))
);
var NoDynamicTags = () => /* @__PURE__ */ React87.createElement(React87.Fragment, null, /* @__PURE__ */ React87.createElement(Divider7, null), /* @__PURE__ */ React87.createElement(
  Stack15,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    p: 2.5,
    color: "text.secondary",
    sx: { pb: 3.5 }
  },
  /* @__PURE__ */ React87.createElement(DatabaseIcon2, { fontSize: "large" }),
  /* @__PURE__ */ React87.createElement(Typography5, { align: "center", variant: "subtitle2" }, __59("Streamline your workflow with dynamic tags", "elementor")),
  /* @__PURE__ */ React87.createElement(Typography5, { align: "center", variant: "caption", width: PROMO_TEXT_WIDTH }, __59("Upgrade now to display your content dynamically.", "elementor")),
  /* @__PURE__ */ React87.createElement(CtaButton, { size: "small", href: PRO_DYNAMIC_TAGS_URL })
));
var ExpiredDynamicTags = () => /* @__PURE__ */ React87.createElement(React87.Fragment, null, /* @__PURE__ */ React87.createElement(Divider7, null), /* @__PURE__ */ React87.createElement(
  Stack15,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    p: 2.5,
    color: "text.secondary",
    sx: { pb: 3.5 }
  },
  /* @__PURE__ */ React87.createElement(DatabaseIcon2, { fontSize: "large" }),
  /* @__PURE__ */ React87.createElement(Typography5, { align: "center", variant: "subtitle2" }, __59("Unlock your Dynamic tags again", "elementor")),
  /* @__PURE__ */ React87.createElement(Typography5, { align: "center", variant: "caption", width: PROMO_TEXT_WIDTH }, __59("Dynamic tags need Elementor Pro. Renew now to keep them active.", "elementor")),
  /* @__PURE__ */ React87.createElement(CtaButton, { size: "small", href: RENEW_DYNAMIC_TAGS_URL, children: __59("Renew Now", "elementor") })
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
  const { setValue: setAnyValue, propType } = useBoundProp10();
  const { bind, value } = useBoundProp10(dynamicPropTypeUtil);
  const { expired: readonly } = useLicenseConfig();
  const originalPropType = createTopLevelObjectType({
    schema: {
      [bind]: propType
    }
  });
  const [propValueFromHistory] = usePersistDynamicValue(bind);
  const selectionPopoverState = usePopupState2({ variant: "popover" });
  const { name: tagName = "" } = value;
  const dynamicTag = useDynamicTag(tagName);
  if (!isDynamicTagSupported(tagName) && OriginalControl) {
    return /* @__PURE__ */ React88.createElement(PropProvider6, { propType: originalPropType, value: { [bind]: null }, setValue: setAnyValue }, /* @__PURE__ */ React88.createElement(PropKeyProvider6, { bind }, /* @__PURE__ */ React88.createElement(OriginalControl, { ...props })));
  }
  const removeDynamicTag = () => {
    setAnyValue(propValueFromHistory ?? null);
  };
  if (!dynamicTag) {
    throw new Error(`Dynamic tag ${tagName} not found`);
  }
  return /* @__PURE__ */ React88.createElement(Box6, null, /* @__PURE__ */ React88.createElement(
    Tag,
    {
      fullWidth: true,
      showActionsOnHover: true,
      label: dynamicTag.label,
      startIcon: /* @__PURE__ */ React88.createElement(DatabaseIcon3, { fontSize: SIZE3 }),
      ...bindTrigger2(selectionPopoverState),
      actions: /* @__PURE__ */ React88.createElement(React88.Fragment, null, /* @__PURE__ */ React88.createElement(DynamicSettingsPopover, { dynamicTag, disabled: readonly }), /* @__PURE__ */ React88.createElement(
        IconButton2,
        {
          size: SIZE3,
          onClick: removeDynamicTag,
          "aria-label": __60("Remove dynamic value", "elementor")
        },
        /* @__PURE__ */ React88.createElement(XIcon, { fontSize: SIZE3 })
      ))
    }
  ), /* @__PURE__ */ React88.createElement(
    Popover,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...bindPopover(selectionPopoverState)
    },
    /* @__PURE__ */ React88.createElement(SectionPopoverBody2, { "aria-label": __60("Dynamic tags", "elementor") }, /* @__PURE__ */ React88.createElement(DynamicSelection, { close: selectionPopoverState.close, expired: readonly }))
  ));
};
var DynamicSettingsPopover = ({
  dynamicTag,
  disabled = false
}) => {
  const popupState = usePopupState2({ variant: "popover" });
  const hasDynamicSettings = !!dynamicTag.atomic_controls.length;
  if (!hasDynamicSettings) {
    return null;
  }
  return /* @__PURE__ */ React88.createElement(React88.Fragment, null, /* @__PURE__ */ React88.createElement(
    IconButton2,
    {
      size: SIZE3,
      disabled,
      ...!disabled && bindTrigger2(popupState),
      "aria-label": __60("Dynamic settings", "elementor")
    },
    /* @__PURE__ */ React88.createElement(SettingsIcon, { fontSize: SIZE3 })
  ), /* @__PURE__ */ React88.createElement(
    Popover,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...bindPopover(popupState)
    },
    /* @__PURE__ */ React88.createElement(SectionPopoverBody2, { "aria-label": __60("Dynamic settings", "elementor") }, /* @__PURE__ */ React88.createElement(
      PopoverHeader2,
      {
        title: dynamicTag.label,
        onClose: popupState.close,
        icon: /* @__PURE__ */ React88.createElement(DatabaseIcon3, { fontSize: SIZE3 })
      }
    ), /* @__PURE__ */ React88.createElement(DynamicSettings, { controls: dynamicTag.atomic_controls, tagName: dynamicTag.name }))
  ));
};
var DynamicSettings = ({ controls, tagName }) => {
  const tabs = controls.filter(({ type }) => type === "section");
  const { getTabsProps, getTabProps, getTabPanelProps } = useTabs2(0);
  if (!tabs.length) {
    return null;
  }
  if (tagsWithoutTabs.includes(tagName)) {
    const singleTab = tabs[0];
    return /* @__PURE__ */ React88.createElement(React88.Fragment, null, /* @__PURE__ */ React88.createElement(Divider8, null), /* @__PURE__ */ React88.createElement(ControlsItemsStack, { items: singleTab.value.items }));
  }
  return /* @__PURE__ */ React88.createElement(React88.Fragment, null, tabs.length > 1 && /* @__PURE__ */ React88.createElement(Tabs2, { size: "small", variant: "fullWidth", ...getTabsProps() }, tabs.map(({ value }, index) => /* @__PURE__ */ React88.createElement(
    Tab2,
    {
      key: index,
      label: value.label,
      sx: { px: 1, py: 0.5 },
      ...getTabProps(index)
    }
  ))), /* @__PURE__ */ React88.createElement(Divider8, null), tabs.map(({ value }, index) => {
    return /* @__PURE__ */ React88.createElement(
      TabPanel2,
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
  return /* @__PURE__ */ React88.createElement(DynamicControl, { bind: control.bind }, /* @__PURE__ */ React88.createElement(Grid5, { container: true, gap: 0.75, sx: layoutStyleProps }, control.label ? /* @__PURE__ */ React88.createElement(Grid5, { item: true, xs: 12 }, /* @__PURE__ */ React88.createElement(ControlFormLabel4, null, control.label)) : null, /* @__PURE__ */ React88.createElement(Grid5, { item: true, xs: 12 }, /* @__PURE__ */ React88.createElement(Control, { type: control.type, props: controlProps }))));
};
function ControlsItemsStack({ items: items3 }) {
  return /* @__PURE__ */ React88.createElement(Stack16, { p: 2, gap: 2, sx: { overflowY: "auto" } }, items3.map(
    (item) => item.type === "control" ? /* @__PURE__ */ React88.createElement(Control2, { key: item.value.bind, control: item.value }) : null
  ));
}

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
var dynamicTransformer = createTransformer((value, { propType }) => {
  if (!value?.name || !isDynamicTagSupported(value.name)) {
    return propType?.default ?? null;
  }
  return getDynamicValue(value.name, simpleTransform(value?.settings ?? {}));
});
function simpleTransform(props) {
  const transformed = Object.entries(props).map(([settingKey, settingValue]) => {
    const value = isTransformable3(settingValue) ? settingValue.value : settingValue;
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
import * as React89 from "react";
import { useBoundProp as useBoundProp11 } from "@elementor/editor-controls";
import { DatabaseIcon as DatabaseIcon4 } from "@elementor/icons";
import { __ as __61 } from "@wordpress/i18n";
var usePropDynamicAction = () => {
  const { propType } = useBoundProp11();
  const visible = !!propType && supportsDynamic(propType);
  return {
    visible,
    icon: DatabaseIcon4,
    title: __61("Dynamic tags", "elementor"),
    content: ({ close }) => /* @__PURE__ */ React89.createElement(DynamicSelection, { close })
  };
};

// src/dynamics/init.ts
var { registerPopoverAction } = controlActionsMenu2;
var init2 = () => {
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
    priority: 20,
    useProps: usePropDynamicAction
  });
  styleTransformersRegistry2.register("dynamic", dynamicTransformer);
  settingsTransformersRegistry.register("dynamic", dynamicTransformer);
};

// src/reset-style-props.tsx
import { useBoundProp as useBoundProp12 } from "@elementor/editor-controls";
import { hasVariable as hasVariable2 } from "@elementor/editor-variables";
import { BrushBigIcon } from "@elementor/icons";
import { controlActionsMenu as controlActionsMenu3 } from "@elementor/menus";
import { __ as __62 } from "@wordpress/i18n";

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
var { registerAction } = controlActionsMenu3;
function initResetStyleProps() {
  registerAction({
    id: "reset-style-value",
    priority: 10,
    useProps: useResetStyleValueProps
  });
}
function useResetStyleValueProps() {
  const isStyle = useIsStyle();
  const { value, resetValue, propType } = useBoundProp12();
  const hasValue = value !== null && value !== void 0;
  const hasInitial = propType.initial_value !== void 0 && propType.initial_value !== null;
  const isRequired = !!propType.settings?.required;
  const shouldHide = !!propType.settings?.hide_reset;
  const isPropTypeValue = value;
  const isVariable = isPropTypeValue?.$$type?.includes("variable");
  const variableExists = isVariable && hasVariable2(isPropTypeValue?.value);
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
    title: __62("Clear", "elementor"),
    icon: BrushBigIcon,
    onClick: () => resetValue()
  };
}

// src/styles-inheritance/components/styles-inheritance-indicator.tsx
import * as React95 from "react";
import { useBoundProp as useBoundProp13 } from "@elementor/editor-controls";
import { isEmpty as isEmpty2 } from "@elementor/editor-props";
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY as ELEMENTS_BASE_STYLES_PROVIDER_KEY4 } from "@elementor/editor-styles-repository";
import { __ as __66 } from "@wordpress/i18n";

// src/styles-inheritance/components/styles-inheritance-infotip.tsx
import * as React94 from "react";
import { useMemo as useMemo13, useRef as useRef16, useState as useState12 } from "react";
import {
  createPropsResolver as createPropsResolver2,
  stylesInheritanceTransformersRegistry
} from "@elementor/editor-canvas";
import { PopoverHeader as PopoverHeader3, useSectionWidth as useSectionWidth2 } from "@elementor/editor-ui";
import {
  Backdrop,
  Box as Box8,
  Card,
  CardContent,
  ClickAwayListener,
  IconButton as IconButton3,
  Infotip as Infotip2,
  Stack as Stack17,
  Tooltip as Tooltip4
} from "@elementor/ui";
import { __ as __65 } from "@wordpress/i18n";

// src/styles-inheritance/hooks/use-normalized-inheritance-chain-items.tsx
import { isValidElement, useEffect as useEffect7, useState as useState11 } from "react";
import { UnknownStyleStateError } from "@elementor/editor-canvas";
import {
  isClassState as isClassState2,
  isPseudoState
} from "@elementor/editor-styles";
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY as ELEMENTS_BASE_STYLES_PROVIDER_KEY2 } from "@elementor/editor-styles-repository";
import { __ as __63 } from "@wordpress/i18n";
var MAXIMUM_ITEMS = 2;
var useNormalizedInheritanceChainItems = (inheritanceChain, bind, resolve) => {
  const [items3, setItems] = useState11([]);
  useEffect7(() => {
    (async () => {
      const normalizedItems = await Promise.all(
        inheritanceChain.filter(({ style }) => style).map((item, index) => normalizeInheritanceItem(item, index, bind, resolve))
      );
      const validItems = normalizedItems.map((item) => ({
        ...item,
        displayLabel: ELEMENTS_BASE_STYLES_PROVIDER_KEY2 !== item.provider ? item.displayLabel : __63("Base", "elementor")
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
  if (isClassState2(state)) {
    return `${label}.${state}`;
  }
  if (isPseudoState(state)) {
    return `${label}:${state}`;
  }
  throw new UnknownStyleStateError({ context: { state } });
}
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

// src/styles-inheritance/components/infotip/breakpoint-icon.tsx
import * as React90 from "react";
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
import { Tooltip as Tooltip2 } from "@elementor/ui";
var SIZE4 = "tiny";
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
  return /* @__PURE__ */ React90.createElement(Tooltip2, { title: breakpointLabel, placement: "top" }, /* @__PURE__ */ React90.createElement(IconComponent, { fontSize: SIZE4, sx: { mt: "2px" } }));
};

// src/styles-inheritance/components/infotip/label-chip.tsx
import * as React91 from "react";
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY as ELEMENTS_BASE_STYLES_PROVIDER_KEY3 } from "@elementor/editor-styles-repository";
import { InfoCircleIcon } from "@elementor/icons";
import { Chip as Chip5, Tooltip as Tooltip3 } from "@elementor/ui";
import { __ as __64 } from "@wordpress/i18n";
var SIZE5 = "tiny";
var LabelChip = ({ displayLabel, provider }) => {
  const isBaseStyle = provider === ELEMENTS_BASE_STYLES_PROVIDER_KEY3;
  const chipIcon = isBaseStyle ? /* @__PURE__ */ React91.createElement(Tooltip3, { title: __64("Inherited from base styles", "elementor"), placement: "top" }, /* @__PURE__ */ React91.createElement(InfoCircleIcon, { fontSize: SIZE5 })) : void 0;
  return /* @__PURE__ */ React91.createElement(
    Chip5,
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
import * as React92 from "react";
import { Typography as Typography6 } from "@elementor/ui";
var ValueComponent = ({ index, value }) => {
  return /* @__PURE__ */ React92.createElement(
    Typography6,
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
import * as React93 from "react";
import { Box as Box7 } from "@elementor/ui";
var ActionIcons = () => /* @__PURE__ */ React93.createElement(Box7, { display: "flex", gap: 0.5, alignItems: "center" });

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
  const [showInfotip, setShowInfotip] = useState12(false);
  const triggerRef = useRef16(null);
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
  const sectionWidth = useSectionWidth2();
  const resolve = useMemo13(() => {
    return createPropsResolver2({
      transformers: stylesInheritanceTransformersRegistry,
      schema: { [key]: propType }
    });
  }, [key, propType]);
  const items3 = useNormalizedInheritanceChainItems(inheritanceChain, key, resolve);
  const infotipContent = /* @__PURE__ */ React94.createElement(ClickAwayListener, { onClickAway: closeInfotip }, /* @__PURE__ */ React94.createElement(
    Card,
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
      Box8,
      {
        sx: {
          position: "sticky",
          top: 0,
          zIndex: 1,
          backgroundColor: "background.paper"
        }
      },
      /* @__PURE__ */ React94.createElement(PopoverHeader3, { title: __65("Style origin", "elementor"), onClose: closeInfotip })
    ),
    /* @__PURE__ */ React94.createElement(
      CardContent,
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
      /* @__PURE__ */ React94.createElement(Stack17, { gap: 1.5, sx: { pl: 3, pr: 1, pb: 2 }, role: "list" }, items3.map((item, index) => {
        return /* @__PURE__ */ React94.createElement(
          Box8,
          {
            key: item.id,
            display: "flex",
            gap: 0.5,
            role: "listitem",
            "aria-label": __65("Inheritance item: %s", "elementor").replace(
              "%s",
              item.displayLabel
            )
          },
          /* @__PURE__ */ React94.createElement(
            Box8,
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
    return /* @__PURE__ */ React94.createElement(Box8, { sx: { display: "inline-flex" } }, children);
  }
  return /* @__PURE__ */ React94.createElement(Box8, { ref: triggerRef, sx: { display: "inline-flex" } }, /* @__PURE__ */ React94.createElement(
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
      IconButton3,
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
    return /* @__PURE__ */ React94.createElement(Box8, { sx: { display: "inline-flex" } }, children);
  }
  if (showInfotip) {
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    const cardWidth = Math.min(sectionWidth - SECTION_PADDING_INLINE, INFOTIP_MAX_WIDTH);
    const offsetX = calculatePopoverOffset(triggerRect, cardWidth, isSiteRtl);
    return /* @__PURE__ */ React94.createElement(React94.Fragment, null, /* @__PURE__ */ React94.createElement(
      Backdrop,
      {
        open: showInfotip,
        onClick: onClose,
        sx: {
          backgroundColor: "transparent",
          zIndex: (theme) => theme.zIndex.modal - 1
        }
      }
    ), /* @__PURE__ */ React94.createElement(
      Infotip2,
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
  return /* @__PURE__ */ React94.createElement(Tooltip4, { title: __65("Style origin", "elementor"), placement: "top" }, children);
}

// src/styles-inheritance/components/styles-inheritance-indicator.tsx
var StylesInheritanceIndicator = ({
  customContext
}) => {
  const context = useBoundProp13();
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
  const hasValue = !isEmpty2(currentItem?.value);
  const [actualStyle] = inheritanceChain;
  if (actualStyle.provider === ELEMENTS_BASE_STYLES_PROVIDER_KEY4) {
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
    return __66("This is the final value", "elementor");
  }
  if (hasValue) {
    return __66("This value is overridden by another style", "elementor");
  }
  return __66("This has value from another style", "elementor");
};

// src/styles-inheritance/init-styles-inheritance-transformers.ts
import {
  createTransformer as createTransformer9,
  stylesInheritanceTransformersRegistry as stylesInheritanceTransformersRegistry2,
  styleTransformersRegistry as styleTransformersRegistry3
} from "@elementor/editor-canvas";

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
import * as React96 from "react";
import { createTransformer as createTransformer2 } from "@elementor/editor-canvas";
import { Stack as Stack18 } from "@elementor/ui";
var arrayTransformer = createTransformer2((values) => {
  if (!values || values.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React96.createElement(Stack18, { direction: "column" }, values.map((item, index) => /* @__PURE__ */ React96.createElement(Stack18, { key: index }, item)));
});

// src/styles-inheritance/transformers/background-color-overlay-transformer.tsx
import * as React97 from "react";
import { createTransformer as createTransformer3 } from "@elementor/editor-canvas";
import { Stack as Stack19, styled as styled6, UnstableColorIndicator } from "@elementor/ui";
var backgroundColorOverlayTransformer = createTransformer3((value) => /* @__PURE__ */ React97.createElement(Stack19, { direction: "row", gap: 1, alignItems: "center" }, /* @__PURE__ */ React97.createElement(ItemLabelColor, { value })));
var ItemLabelColor = ({ value: { color } }) => {
  return /* @__PURE__ */ React97.createElement("span", null, color);
};
var StyledUnstableColorIndicator = styled6(UnstableColorIndicator)(({ theme }) => ({
  width: "1em",
  height: "1em",
  borderRadius: `${theme.shape.borderRadius / 2}px`,
  outline: `1px solid ${theme.palette.action.disabled}`,
  flexShrink: 0
}));

// src/styles-inheritance/transformers/background-gradient-overlay-transformer.tsx
import * as React98 from "react";
import { createTransformer as createTransformer4 } from "@elementor/editor-canvas";
import { Stack as Stack20 } from "@elementor/ui";
import { __ as __67 } from "@wordpress/i18n";
var backgroundGradientOverlayTransformer = createTransformer4((value) => /* @__PURE__ */ React98.createElement(Stack20, { direction: "row", gap: 1, alignItems: "center" }, /* @__PURE__ */ React98.createElement(ItemIconGradient, { value }), /* @__PURE__ */ React98.createElement(ItemLabelGradient, { value })));
var ItemIconGradient = ({ value }) => {
  const gradient = getGradientValue(value);
  return /* @__PURE__ */ React98.createElement(StyledUnstableColorIndicator, { size: "inherit", component: "span", value: gradient });
};
var ItemLabelGradient = ({ value }) => {
  if (value.type === "linear") {
    return /* @__PURE__ */ React98.createElement("span", null, __67("Linear gradient", "elementor"));
  }
  return /* @__PURE__ */ React98.createElement("span", null, __67("Radial gradient", "elementor"));
};
var getGradientValue = (gradient) => {
  const stops = gradient.stops?.map(({ color, offset }) => `${color} ${offset ?? 0}%`)?.join(",");
  if (gradient.type === "linear") {
    return `linear-gradient(${gradient.angle}deg, ${stops})`;
  }
  return `radial-gradient(circle at ${gradient.positions}, ${stops})`;
};

// src/styles-inheritance/transformers/background-image-overlay-transformer.tsx
import * as React99 from "react";
import { createTransformer as createTransformer5 } from "@elementor/editor-canvas";
import { EllipsisWithTooltip as EllipsisWithTooltip2 } from "@elementor/editor-ui";
import { CardMedia, Stack as Stack21 } from "@elementor/ui";
import { useWpMediaAttachment } from "@elementor/wp-media";
var backgroundImageOverlayTransformer = createTransformer5((value) => /* @__PURE__ */ React99.createElement(Stack21, { direction: "row", gap: 1, alignItems: "center" }, /* @__PURE__ */ React99.createElement(ItemIconImage, { value }), /* @__PURE__ */ React99.createElement(ItemLabelImage, { value })));
var ItemIconImage = ({ value }) => {
  const { imageUrl } = useImage(value);
  return /* @__PURE__ */ React99.createElement(
    CardMedia,
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
  return /* @__PURE__ */ React99.createElement(EllipsisWithTooltip2, { title: imageTitle }, /* @__PURE__ */ React99.createElement("span", null, imageTitle));
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

// src/styles-inheritance/transformers/box-shadow-transformer.tsx
import * as React100 from "react";
import { createTransformer as createTransformer6 } from "@elementor/editor-canvas";
import { Stack as Stack22 } from "@elementor/ui";
var boxShadowTransformer = createTransformer6((value) => {
  if (!value) {
    return null;
  }
  const { color, hOffset, vOffset, blur, spread, position } = value;
  const colorValue = color || "#000000";
  const sizes = [hOffset || "0px", vOffset || "0px", blur || "10px", spread || "0px"].join(" ");
  const positionValue = position || "outset";
  return /* @__PURE__ */ React100.createElement(Stack22, { direction: "column", gap: 0.5, pb: 1 }, /* @__PURE__ */ React100.createElement("span", null, colorValue, " ", positionValue, ", ", sizes));
});

// src/styles-inheritance/transformers/color-transformer.tsx
import * as React101 from "react";
import { createTransformer as createTransformer7 } from "@elementor/editor-canvas";
import { Stack as Stack23, styled as styled7, UnstableColorIndicator as UnstableColorIndicator2 } from "@elementor/ui";
function isValidCSSColor(value) {
  if (!value.trim()) {
    return false;
  }
  return CSS.supports("color", value.trim());
}
var StyledColorIndicator = styled7(UnstableColorIndicator2)(({ theme }) => ({
  width: "1em",
  height: "1em",
  borderRadius: `${theme.shape.borderRadius / 2}px`,
  outline: `1px solid ${theme.palette.action.disabled}`,
  flexShrink: 0
}));
var colorTransformer = createTransformer7((value) => {
  if (!isValidCSSColor(value)) {
    return value;
  }
  return /* @__PURE__ */ React101.createElement(Stack23, { direction: "row", gap: 1, alignItems: "center" }, /* @__PURE__ */ React101.createElement(StyledColorIndicator, { size: "inherit", component: "span", value }), /* @__PURE__ */ React101.createElement("span", null, value));
});

// src/styles-inheritance/transformers/repeater-to-items-transformer.tsx
import * as React102 from "react";
import { createTransformer as createTransformer8 } from "@elementor/editor-canvas";
import { Stack as Stack24 } from "@elementor/ui";
var createRepeaterToItemsTransformer = (originalTransformer, separator = " ") => {
  return createTransformer8((value, options12) => {
    const stringResult = originalTransformer(value, options12);
    if (!stringResult || typeof stringResult !== "string") {
      return stringResult;
    }
    const parts = stringResult.split(separator).filter(Boolean);
    if (parts.length <= 1) {
      return stringResult;
    }
    return /* @__PURE__ */ React102.createElement(Stack24, { direction: "column", gap: 0.5 }, parts.map((part, index) => /* @__PURE__ */ React102.createElement(Stack24, { key: index }, part.trim())));
  });
};

// src/styles-inheritance/init-styles-inheritance-transformers.ts
function initStylesInheritanceTransformers() {
  const originalStyleTransformers = styleTransformersRegistry3.all();
  Object.entries(originalStyleTransformers).forEach(([propType, transformer]) => {
    if (excludePropTypeTransformers.has(propType)) {
      return;
    }
    stylesInheritanceTransformersRegistry2.register(propType, transformer);
  });
  stylesInheritanceTransformersRegistry2.registerFallback(
    createTransformer9((value) => {
      return value;
    })
  );
  registerCustomTransformers(originalStyleTransformers);
}
function registerCustomTransformers(originalStyleTransformers) {
  stylesInheritanceTransformersRegistry2.register("color", colorTransformer);
  stylesInheritanceTransformersRegistry2.register("background-color-overlay", backgroundColorOverlayTransformer);
  stylesInheritanceTransformersRegistry2.register(
    "background-gradient-overlay",
    backgroundGradientOverlayTransformer
  );
  stylesInheritanceTransformersRegistry2.register("background-image-overlay", backgroundImageOverlayTransformer);
  stylesInheritanceTransformersRegistry2.register("shadow", boxShadowTransformer);
  stylesInheritanceTransformersRegistry2.register(
    "filter",
    createRepeaterToItemsTransformer(originalStyleTransformers.filter)
  );
  stylesInheritanceTransformersRegistry2.register(
    "backdrop-filter",
    createRepeaterToItemsTransformer(originalStyleTransformers["backdrop-filter"])
  );
  stylesInheritanceTransformersRegistry2.register(
    "transition",
    createRepeaterToItemsTransformer(originalStyleTransformers.transition, ", ")
  );
  ["background-overlay", "box-shadow", "transform-functions"].forEach(
    (propType) => stylesInheritanceTransformersRegistry2.register(propType, arrayTransformer)
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
  registerPanel(panel);
  blockV1Panel();
  injectIntoLogic({
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
  blockCommand({
    command: "panel/editor/open",
    condition: isAtomicWidgetSelected
  });
};
export {
  Control as BaseControl,
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
  init4 as init,
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
};
//# sourceMappingURL=index.mjs.map