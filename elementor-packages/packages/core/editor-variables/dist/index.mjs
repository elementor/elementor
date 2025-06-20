// src/init.ts
import { injectIntoTop } from "@elementor/editor";

// src/init-color-variables.ts
import { styleTransformersRegistry } from "@elementor/editor-canvas";
import { injectIntoRepeaterItemIcon, injectIntoRepeaterItemLabel } from "@elementor/editor-controls";
import { controlActionsMenu, registerControlReplacement } from "@elementor/editor-editing-panel";
import { backgroundColorOverlayPropTypeUtil, shadowPropTypeUtil } from "@elementor/editor-props";

// src/components/variables-repeater-item-slot.tsx
import * as React from "react";

// src/hooks/use-prop-variables.ts
import { useMemo } from "react";

// src/api.ts
import { httpService } from "@elementor/http-client";
var BASE_PATH = "elementor/v1/variables";
var apiClient = {
  list: () => {
    return httpService().get(BASE_PATH + "/list");
  },
  create: (type, label, value) => {
    return httpService().post(BASE_PATH + "/create", {
      type,
      label,
      value
    });
  },
  update: (id, label, value) => {
    return httpService().put(BASE_PATH + "/update", {
      id,
      label,
      value
    });
  },
  delete: (id) => {
    return httpService().post(BASE_PATH + "/delete", { id });
  },
  restore: (id) => {
    return httpService().post(BASE_PATH + "/restore", { id });
  }
};

// src/storage.ts
var STORAGE_KEY = "elementor-global-variables";
var STORAGE_WATERMARK_KEY = "elementor-global-variables-watermark";
var OP_RW = "RW";
var OP_RO = "RO";
var Storage = class {
  state;
  constructor() {
    this.state = {
      watermark: -1,
      variables: {}
    };
  }
  load() {
    this.state.watermark = parseInt(localStorage.getItem(STORAGE_WATERMARK_KEY) || "-1");
    this.state.variables = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return this.state.variables;
  }
  fill(variables, watermark) {
    this.state.variables = {};
    if (variables && Object.keys(variables).length) {
      this.state.variables = variables;
    }
    this.state.watermark = watermark;
    localStorage.setItem(STORAGE_WATERMARK_KEY, this.state.watermark.toString());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.variables));
  }
  add(id, variable) {
    this.load();
    this.state.variables[id] = variable;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.variables));
  }
  update(id, variable) {
    this.load();
    this.state.variables[id] = variable;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.variables));
  }
  watermark(watermark) {
    this.state.watermark = watermark;
    localStorage.setItem(STORAGE_WATERMARK_KEY, this.state.watermark.toString());
  }
  watermarkDiff(operation, newWatermark) {
    const diff = newWatermark - this.state.watermark;
    if (OP_RW === operation) {
      return 1 !== diff;
    }
    if (OP_RO === operation) {
      return 0 !== diff;
    }
    return false;
  }
};

// src/create-style-variables-repository.ts
var createStyleVariablesRepository = () => {
  const variables = {};
  let subscription;
  const subscribe = (cb) => {
    subscription = cb;
    return () => {
      subscription = () => {
      };
    };
  };
  const notify = () => {
    if (typeof subscription === "function") {
      subscription({ ...variables });
    }
  };
  const shouldUpdate = (key, newValue) => {
    return !(key in variables) || variables[key] !== newValue;
  };
  const applyUpdates = (updatedVars) => {
    let hasChanges = false;
    for (const [key, { value }] of Object.entries(updatedVars)) {
      if (shouldUpdate(key, value)) {
        variables[key] = value;
        hasChanges = true;
      }
    }
    return hasChanges;
  };
  const update = (updatedVars) => {
    if (applyUpdates(updatedVars)) {
      notify();
    }
  };
  return {
    subscribe,
    update
  };
};

// src/style-variables-repository.ts
var styleVariablesRepository = createStyleVariablesRepository();

// src/service.ts
var storage = new Storage();
var service = {
  variables: () => {
    return storage.load();
  },
  init: () => {
    service.load();
  },
  load: () => {
    return apiClient.list().then((response) => {
      const { success, data: payload } = response.data;
      if (!success) {
        throw new Error("Unexpected response from server");
      }
      return payload;
    }).then((data) => {
      const { variables, watermark } = data;
      storage.fill(variables, watermark);
      styleVariablesRepository.update(variables);
      return variables;
    });
  },
  create: ({ type, label, value }) => {
    return apiClient.create(type, label, value).then((response) => {
      const { success, data: payload } = response.data;
      if (!success) {
        throw new Error("Unexpected response from server");
      }
      return payload;
    }).then((data) => {
      const { variable, watermark } = data;
      handleWatermark(OP_RW, watermark);
      const { id: variableId, ...createdVariable } = variable;
      storage.add(variableId, createdVariable);
      styleVariablesRepository.update({
        [variableId]: createdVariable
      });
      return {
        id: variableId,
        variable: createdVariable
      };
    });
  },
  update: (id, { label, value }) => {
    return apiClient.update(id, label, value).then((response) => {
      const { success, data: payload } = response.data;
      if (!success) {
        throw new Error("Unexpected response from server");
      }
      return payload;
    }).then((data) => {
      const { variable, watermark } = data;
      handleWatermark(OP_RW, watermark);
      const { id: variableId, ...updatedVariable } = variable;
      storage.update(variableId, updatedVariable);
      styleVariablesRepository.update({
        [variableId]: updatedVariable
      });
      return {
        id: variableId,
        variable: updatedVariable
      };
    });
  },
  delete: (id) => {
    return apiClient.delete(id).then((response) => {
      const { success, data: payload } = response.data;
      if (!success) {
        throw new Error("Unexpected response from server");
      }
      return payload;
    }).then((data) => {
      const { variable, watermark } = data;
      handleWatermark(OP_RW, watermark);
      const { id: variableId, ...deletedVariable } = variable;
      storage.update(variableId, deletedVariable);
      styleVariablesRepository.update({
        [variableId]: deletedVariable
      });
      return {
        id: variableId,
        variable: deletedVariable
      };
    });
  },
  restore: (id) => {
    return apiClient.restore(id).then((response) => {
      const { success, data: payload } = response.data;
      if (!success) {
        throw new Error("Unexpected response from server");
      }
      return payload;
    }).then((data) => {
      const { variable, watermark } = data;
      handleWatermark(OP_RW, watermark);
      const { id: variableId, ...restoredVariable } = variable;
      storage.update(variableId, restoredVariable);
      styleVariablesRepository.update({
        [variableId]: restoredVariable
      });
      return {
        id: variableId,
        variable: restoredVariable
      };
    });
  }
};
var handleWatermark = (operation, newWatermark) => {
  if (storage.watermarkDiff(operation, newWatermark)) {
    setTimeout(() => service.load(), 500);
  }
  storage.watermark(newWatermark);
};

// src/hooks/use-prop-variables.ts
var useVariable = (key) => {
  const variables = service.variables();
  if (!variables?.[key]) {
    return null;
  }
  return {
    ...variables[key],
    key
  };
};
var useFilteredVariables = (searchValue, propTypeKey) => {
  const variables = usePropVariables(propTypeKey);
  const filteredVariables = variables.filter(({ label }) => {
    return label.toLowerCase().includes(searchValue.toLowerCase());
  });
  return {
    list: filteredVariables,
    hasMatches: filteredVariables.length > 0,
    isSourceNotEmpty: variables.length > 0
  };
};
var usePropVariables = (propKey) => {
  return useMemo(() => normalizeVariables(propKey), [propKey]);
};
var normalizeVariables = (propKey) => {
  const variables = service.variables();
  styleVariablesRepository.update(variables);
  return Object.entries(variables).filter(([, { type }]) => type === propKey).map(([key, { label, value }]) => ({
    key,
    label,
    value
  }));
};
var createVariable = (newVariable) => {
  return service.create(newVariable).then(({ id, variable }) => {
    styleVariablesRepository.update({
      [id]: variable
    });
    return id;
  });
};
var updateVariable = (updateId, { value, label }) => {
  return service.update(updateId, { value, label }).then(({ id, variable }) => {
    styleVariablesRepository.update({
      [id]: variable
    });
    return id;
  });
};

// src/components/ui/color-indicator.tsx
import { styled, UnstableColorIndicator } from "@elementor/ui";
var ColorIndicator = styled(UnstableColorIndicator)(({ theme }) => ({
  borderRadius: `${theme.shape.borderRadius / 2}px`,
  marginRight: theme.spacing(0.25)
}));

// src/components/variables-repeater-item-slot.tsx
var useColorVariable = (value) => {
  const variableId = value?.value?.color?.value;
  return useVariable(variableId || "");
};
var BackgroundRepeaterColorIndicator = ({ value }) => {
  const colorVariable = useColorVariable(value);
  return /* @__PURE__ */ React.createElement(ColorIndicator, { component: "span", size: "inherit", value: colorVariable?.value });
};
var BackgroundRepeaterLabel = ({ value }) => {
  const colorVariable = useColorVariable(value);
  return /* @__PURE__ */ React.createElement("span", null, colorVariable?.label);
};
var BoxShadowRepeaterColorIndicator = ({ value }) => {
  const colorVariable = useColorVariable(value);
  return /* @__PURE__ */ React.createElement(ColorIndicator, { component: "span", size: "inherit", value: colorVariable?.value });
};

// src/controls/color-variable-control.tsx
import * as React13 from "react";
import { useId as useId2, useRef as useRef6 } from "react";
import { useBoundProp as useBoundProp5 } from "@elementor/editor-controls";
import { colorPropTypeUtil } from "@elementor/editor-props";
import { ColorFilterIcon as ColorFilterIcon4 } from "@elementor/icons";
import { bindPopover as bindPopover3, bindTrigger as bindTrigger3, Box as Box4, Popover as Popover3, usePopupState as usePopupState3 } from "@elementor/ui";

// src/components/ui/variable-tag.tsx
import * as React2 from "react";
import { DetachIcon } from "@elementor/icons";
import { Box, IconButton, Stack, Typography, UnstableTag as Tag } from "@elementor/ui";
import { __ } from "@wordpress/i18n";
var SIZE = "tiny";
var VariableTag = ({ startIcon, label, onUnlink, ...props }) => {
  const actions = [];
  if (onUnlink) {
    actions.push(
      /* @__PURE__ */ React2.createElement(IconButton, { key: "unlink", size: SIZE, onClick: onUnlink, "aria-label": __("Unlink", "elementor") }, /* @__PURE__ */ React2.createElement(DetachIcon, { fontSize: SIZE }))
    );
  }
  return /* @__PURE__ */ React2.createElement(
    Tag,
    {
      fullWidth: true,
      showActionsOnHover: true,
      startIcon: /* @__PURE__ */ React2.createElement(Stack, { gap: 0.5, direction: "row", alignItems: "center" }, startIcon),
      label: /* @__PURE__ */ React2.createElement(Box, { sx: { display: "inline-grid", minWidth: 0 } }, /* @__PURE__ */ React2.createElement(Typography, { sx: { lineHeight: 1.34 }, variant: "caption", noWrap: true }, label)),
      actions,
      ...props
    }
  );
};

// src/components/variable-selection-popover.tsx
import * as React12 from "react";
import { useRef as useRef5, useState as useState7 } from "react";
import { Box as Box3 } from "@elementor/ui";

// src/prop-types/color-variable-prop-type.ts
import { createPropUtils } from "@elementor/editor-props";
import { z } from "@elementor/schema";
var colorVariablePropTypeUtil = createPropUtils("global-color-variable", z.string());

// src/prop-types/font-variable-prop-type.ts
import { createPropUtils as createPropUtils2 } from "@elementor/editor-props";
import { z as z2 } from "@elementor/schema";
var fontVariablePropTypeUtil = createPropUtils2("global-font-variable", z2.string());

// src/components/color-variable-creation.tsx
import * as React3 from "react";
import { useRef, useState } from "react";
import { PopoverContent, useBoundProp } from "@elementor/editor-controls";
import { useSectionRef } from "@elementor/editor-editing-panel";
import { PopoverHeader, PopoverScrollableContent } from "@elementor/editor-ui";
import { ArrowLeftIcon, BrushIcon } from "@elementor/icons";
import {
  Button,
  CardActions,
  Divider,
  FormLabel,
  Grid,
  IconButton as IconButton2,
  TextField,
  UnstableColorField
} from "@elementor/ui";
import { __ as __2 } from "@wordpress/i18n";

// src/components/variable-selection-popover.context.ts
import { createContext, useContext } from "react";
var PopoverContentRefContext = createContext(null);
var usePopoverContentRef = () => {
  return useContext(PopoverContentRefContext);
};

// src/components/color-variable-creation.tsx
var SIZE2 = "tiny";
var ColorVariableCreation = ({ onGoBack, onClose }) => {
  const { setValue: setVariable } = useBoundProp(colorVariablePropTypeUtil);
  const [color, setColor] = useState("");
  const [label, setLabel] = useState("");
  const defaultRef = useRef(null);
  const anchorRef = usePopoverContentRef() ?? defaultRef;
  const resetFields = () => {
    setColor("");
    setLabel("");
  };
  const closePopover = () => {
    resetFields();
    onClose();
  };
  const handleCreate = () => {
    createVariable({
      value: color,
      label,
      type: colorVariablePropTypeUtil.key
    }).then((key) => {
      setVariable(key);
      closePopover();
    });
  };
  const isFormInvalid = () => {
    return !color?.trim() || !label?.trim();
  };
  const sectionRef = useSectionRef();
  const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;
  return /* @__PURE__ */ React3.createElement(PopoverScrollableContent, { height: "auto", width: sectionWidth }, /* @__PURE__ */ React3.createElement(
    PopoverHeader,
    {
      icon: /* @__PURE__ */ React3.createElement(React3.Fragment, null, onGoBack && /* @__PURE__ */ React3.createElement(IconButton2, { size: SIZE2, "aria-label": __2("Go Back", "elementor"), onClick: onGoBack }, /* @__PURE__ */ React3.createElement(ArrowLeftIcon, { fontSize: SIZE2 })), /* @__PURE__ */ React3.createElement(BrushIcon, { fontSize: SIZE2 })),
      title: __2("Create variable", "elementor"),
      onClose: closePopover
    }
  ), /* @__PURE__ */ React3.createElement(Divider, null), /* @__PURE__ */ React3.createElement(PopoverContent, { p: 2 }, /* @__PURE__ */ React3.createElement(Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React3.createElement(Grid, { item: true, xs: 12 }, /* @__PURE__ */ React3.createElement(FormLabel, { size: "tiny" }, __2("Name", "elementor"))), /* @__PURE__ */ React3.createElement(Grid, { item: true, xs: 12 }, /* @__PURE__ */ React3.createElement(
    TextField,
    {
      size: "tiny",
      fullWidth: true,
      value: label,
      onChange: (e) => setLabel(e.target.value)
    }
  ))), /* @__PURE__ */ React3.createElement(Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React3.createElement(Grid, { item: true, xs: 12 }, /* @__PURE__ */ React3.createElement(FormLabel, { size: "tiny" }, __2("Value", "elementor"))), /* @__PURE__ */ React3.createElement(Grid, { item: true, xs: 12 }, /* @__PURE__ */ React3.createElement(
    UnstableColorField,
    {
      size: "tiny",
      fullWidth: true,
      value: color,
      onChange: setColor,
      slotProps: {
        colorPicker: {
          anchorEl: anchorRef.current,
          anchorOrigin: { vertical: "top", horizontal: "right" },
          transformOrigin: { vertical: "top", horizontal: -10 }
        }
      }
    }
  )))), /* @__PURE__ */ React3.createElement(CardActions, { sx: { pt: 0.5, pb: 1 } }, /* @__PURE__ */ React3.createElement(Button, { size: "small", variant: "contained", disabled: isFormInvalid(), onClick: handleCreate }, __2("Create", "elementor"))));
};

// src/components/color-variable-edit.tsx
import * as React4 from "react";
import { useRef as useRef2, useState as useState2 } from "react";
import { PopoverContent as PopoverContent2 } from "@elementor/editor-controls";
import { useSectionRef as useSectionRef2 } from "@elementor/editor-editing-panel";
import { PopoverHeader as PopoverHeader2, PopoverScrollableContent as PopoverScrollableContent2 } from "@elementor/editor-ui";
import { ArrowLeftIcon as ArrowLeftIcon2, BrushIcon as BrushIcon2 } from "@elementor/icons";
import {
  Button as Button2,
  CardActions as CardActions2,
  Divider as Divider2,
  FormLabel as FormLabel2,
  Grid as Grid2,
  IconButton as IconButton3,
  TextField as TextField2,
  UnstableColorField as UnstableColorField2
} from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";
var SIZE3 = "tiny";
var ColorVariableEdit = ({ onClose, onGoBack, onSubmit, editId }) => {
  const variable = useVariable(editId);
  if (!variable) {
    throw new Error(`Global color variable not found`);
  }
  const defaultRef = useRef2(null);
  const anchorRef = usePopoverContentRef() ?? defaultRef;
  const [color, setColor] = useState2(variable.value);
  const [label, setLabel] = useState2(variable.label);
  const handleUpdate = () => {
    updateVariable(editId, {
      value: color,
      label
    }).then(() => {
      onSubmit?.();
    });
  };
  const noValueChanged = () => color === variable.value && label === variable.label;
  const hasEmptyValue = () => "" === color.trim() || "" === label.trim();
  const isSaveDisabled = () => noValueChanged() || hasEmptyValue();
  const sectionRef = useSectionRef2();
  const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;
  return /* @__PURE__ */ React4.createElement(PopoverScrollableContent2, { height: "auto", width: sectionWidth }, /* @__PURE__ */ React4.createElement(
    PopoverHeader2,
    {
      title: __3("Edit variable", "elementor"),
      onClose,
      icon: /* @__PURE__ */ React4.createElement(React4.Fragment, null, onGoBack && /* @__PURE__ */ React4.createElement(IconButton3, { size: SIZE3, "aria-label": __3("Go Back", "elementor"), onClick: onGoBack }, /* @__PURE__ */ React4.createElement(ArrowLeftIcon2, { fontSize: SIZE3 })), /* @__PURE__ */ React4.createElement(BrushIcon2, { fontSize: SIZE3 }))
    }
  ), /* @__PURE__ */ React4.createElement(Divider2, null), /* @__PURE__ */ React4.createElement(PopoverContent2, { p: 2 }, /* @__PURE__ */ React4.createElement(Grid2, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React4.createElement(Grid2, { item: true, xs: 12 }, /* @__PURE__ */ React4.createElement(FormLabel2, { size: "tiny" }, __3("Name", "elementor"))), /* @__PURE__ */ React4.createElement(Grid2, { item: true, xs: 12 }, /* @__PURE__ */ React4.createElement(
    TextField2,
    {
      size: "tiny",
      fullWidth: true,
      value: label,
      onChange: (e) => setLabel(e.target.value)
    }
  ))), /* @__PURE__ */ React4.createElement(Grid2, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React4.createElement(Grid2, { item: true, xs: 12 }, /* @__PURE__ */ React4.createElement(FormLabel2, { size: "tiny" }, __3("Value", "elementor"))), /* @__PURE__ */ React4.createElement(Grid2, { item: true, xs: 12 }, /* @__PURE__ */ React4.createElement(
    UnstableColorField2,
    {
      size: "tiny",
      fullWidth: true,
      value: color,
      onChange: setColor,
      slotProps: {
        colorPicker: {
          anchorEl: anchorRef.current,
          anchorOrigin: { vertical: "top", horizontal: "right" },
          transformOrigin: { vertical: "top", horizontal: -10 }
        }
      }
    }
  )))), /* @__PURE__ */ React4.createElement(CardActions2, { sx: { pt: 0.5, pb: 1 } }, /* @__PURE__ */ React4.createElement(Button2, { size: "small", variant: "contained", disabled: isSaveDisabled(), onClick: handleUpdate }, __3("Save", "elementor"))));
};

// src/components/color-variables-selection.tsx
import * as React8 from "react";
import { useState as useState3 } from "react";
import { useBoundProp as useBoundProp2 } from "@elementor/editor-controls";
import { useSectionRef as useSectionRef3 } from "@elementor/editor-editing-panel";
import {
  PopoverHeader as PopoverHeader3,
  PopoverMenuList,
  PopoverScrollableContent as PopoverScrollableContent3,
  PopoverSearch
} from "@elementor/editor-ui";
import { BrushIcon as BrushIcon3, ColorFilterIcon as ColorFilterIcon2, PlusIcon, SettingsIcon } from "@elementor/icons";
import { Divider as Divider3, IconButton as IconButton5 } from "@elementor/ui";
import { __ as __7 } from "@wordpress/i18n";

// src/components/ui/menu-item-content.tsx
import * as React5 from "react";
import { EllipsisWithTooltip } from "@elementor/editor-ui";
import { isExperimentActive } from "@elementor/editor-v1-adapters";
import { EditIcon } from "@elementor/icons";
import { Box as Box2, IconButton as IconButton4, ListItemIcon, Typography as Typography2 } from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";
var SIZE4 = "tiny";
var isVersion330Active = isExperimentActive("e_v_3_30");
var MenuItemContent = ({ item }) => {
  const onEdit = item.onEdit;
  return /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement(ListItemIcon, null, item.icon), /* @__PURE__ */ React5.createElement(
    Box2,
    {
      sx: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: 1
      }
    },
    /* @__PURE__ */ React5.createElement(
      EllipsisWithTooltip,
      {
        title: item.label || item.value,
        as: Typography2,
        variant: isVersion330Active ? "caption" : "body2",
        color: isVersion330Active ? "text.primary" : "text.secondary",
        sx: { marginTop: "1px", lineHeight: "2" },
        maxWidth: "50%"
      }
    ),
    item.secondaryText && /* @__PURE__ */ React5.createElement(
      EllipsisWithTooltip,
      {
        title: item.secondaryText,
        as: Typography2,
        variant: "caption",
        color: "text.tertiary",
        sx: { marginTop: "1px", lineHeight: "1" },
        maxWidth: "50%"
      }
    )
  ), !!onEdit && /* @__PURE__ */ React5.createElement(
    IconButton4,
    {
      sx: { mx: 1, opacity: "0" },
      onClick: (e) => {
        e.stopPropagation();
        onEdit(item.value);
      },
      "aria-label": __4("Edit", "elementor")
    },
    /* @__PURE__ */ React5.createElement(EditIcon, { color: "action", fontSize: SIZE4 })
  ));
};

// src/components/ui/no-search-results.tsx
import * as React6 from "react";
import { ColorFilterIcon } from "@elementor/icons";
import { Link, Stack as Stack2, Typography as Typography3 } from "@elementor/ui";
import { __ as __5 } from "@wordpress/i18n";
var NoSearchResults = ({ searchValue, onClear }) => {
  return /* @__PURE__ */ React6.createElement(
    Stack2,
    {
      gap: 1,
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      p: 2.5,
      color: "text.secondary",
      sx: { pb: 3.5 }
    },
    /* @__PURE__ */ React6.createElement(ColorFilterIcon, { fontSize: "large" }),
    /* @__PURE__ */ React6.createElement(Typography3, { align: "center", variant: "subtitle2" }, __5("Sorry, nothing matched", "elementor"), /* @__PURE__ */ React6.createElement("br", null), "\u201C", searchValue, "\u201D."),
    /* @__PURE__ */ React6.createElement(Typography3, { align: "center", variant: "caption", sx: { display: "flex", flexDirection: "column" } }, __5("Try something else.", "elementor"), /* @__PURE__ */ React6.createElement(Link, { color: "text.secondary", variant: "caption", component: "button", onClick: onClear }, __5("Clear & try again", "elementor")))
  );
};

// src/components/ui/no-variables.tsx
import * as React7 from "react";
import { Button as Button3, Stack as Stack3, Typography as Typography4 } from "@elementor/ui";
import { __ as __6 } from "@wordpress/i18n";
var NoVariables = ({ icon, title, onAdd }) => /* @__PURE__ */ React7.createElement(
  Stack3,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "text.secondary",
    sx: { p: 2.5, pb: 5.5 }
  },
  icon,
  /* @__PURE__ */ React7.createElement(Typography4, { align: "center", variant: "subtitle2" }, title),
  /* @__PURE__ */ React7.createElement(Typography4, { align: "center", variant: "caption", maxWidth: "180px" }, __6("Variables are saved attributes that you can apply anywhere on your site.", "elementor")),
  onAdd && /* @__PURE__ */ React7.createElement(Button3, { variant: "outlined", color: "secondary", size: "small", onClick: onAdd }, __6("Create a variable", "elementor"))
);

// src/components/ui/styled-menu-list.tsx
import { MenuList, styled as styled2 } from "@elementor/ui";
var VariablesStyledMenuList = styled2(MenuList)(({ theme }) => ({
  "& > li": {
    height: 32,
    width: "100%",
    display: "flex",
    alignItems: "center"
  },
  '& > [role="option"]': {
    ...theme.typography.caption,
    lineHeight: "inherit",
    padding: theme.spacing(0.5, 1, 0.5, 2),
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
    left: 0,
    "&:hover .MuiIconButton-root, .MuiIconButton-root:focus": {
      opacity: 1
    }
  },
  width: "100%",
  position: "relative"
}));

// src/components/color-variables-selection.tsx
var SIZE5 = "tiny";
var ColorVariablesSelection = ({ closePopover, onAdd, onEdit, onSettings }) => {
  const { value: variable, setValue: setVariable } = useBoundProp2(colorVariablePropTypeUtil);
  const [searchValue, setSearchValue] = useState3("");
  const {
    list: variables,
    hasMatches: hasSearchResults,
    isSourceNotEmpty: hasVariables
  } = useFilteredVariables(searchValue, colorVariablePropTypeUtil.key);
  const handleSetColorVariable = (key) => {
    setVariable(key);
    closePopover();
  };
  const actions = [];
  if (onAdd) {
    actions.push(
      /* @__PURE__ */ React8.createElement(IconButton5, { key: "add", size: SIZE5, onClick: onAdd }, /* @__PURE__ */ React8.createElement(PlusIcon, { fontSize: SIZE5 }))
    );
  }
  if (onSettings) {
    actions.push(
      /* @__PURE__ */ React8.createElement(IconButton5, { key: "settings", size: SIZE5, onClick: onSettings }, /* @__PURE__ */ React8.createElement(SettingsIcon, { fontSize: SIZE5 }))
    );
  }
  const items = variables.map(({ value, label, key }) => ({
    type: "item",
    value: key,
    label,
    icon: /* @__PURE__ */ React8.createElement(ColorIndicator, { size: "inherit", component: "span", value }),
    secondaryText: value,
    onEdit: () => onEdit?.(key)
  }));
  const handleSearch = (search) => {
    setSearchValue(search);
  };
  const handleClearSearch = () => {
    setSearchValue("");
  };
  const sectionRef = useSectionRef3();
  const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;
  return /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement(
    PopoverHeader3,
    {
      title: __7("Variables", "elementor"),
      icon: /* @__PURE__ */ React8.createElement(ColorFilterIcon2, { fontSize: SIZE5 }),
      onClose: closePopover,
      actions
    }
  ), hasVariables && /* @__PURE__ */ React8.createElement(
    PopoverSearch,
    {
      value: searchValue,
      onSearch: handleSearch,
      placeholder: __7("Search", "elementor")
    }
  ), /* @__PURE__ */ React8.createElement(Divider3, null), hasVariables && hasSearchResults && /* @__PURE__ */ React8.createElement(
    PopoverMenuList,
    {
      items,
      onSelect: handleSetColorVariable,
      onClose: () => {
      },
      selectedValue: variable,
      "data-testid": "color-variables-list",
      menuListTemplate: VariablesStyledMenuList,
      menuItemContentTemplate: (item) => /* @__PURE__ */ React8.createElement(MenuItemContent, { item }),
      width: sectionWidth
    }
  ), !hasSearchResults && hasVariables && /* @__PURE__ */ React8.createElement(PopoverScrollableContent3, { width: sectionWidth }, /* @__PURE__ */ React8.createElement(NoSearchResults, { searchValue, onClear: handleClearSearch })), !hasVariables && /* @__PURE__ */ React8.createElement(PopoverScrollableContent3, { width: sectionWidth }, /* @__PURE__ */ React8.createElement(
    NoVariables,
    {
      title: __7("Create your first color variable", "elementor"),
      icon: /* @__PURE__ */ React8.createElement(BrushIcon3, { fontSize: "large" }),
      onAdd
    }
  )));
};

// src/components/font-variable-creation.tsx
import * as React9 from "react";
import { useRef as useRef3, useState as useState4 } from "react";
import { FontFamilySelector, PopoverContent as PopoverContent3, useBoundProp as useBoundProp3 } from "@elementor/editor-controls";
import { useFontFamilies, useSectionRef as useSectionRef4 } from "@elementor/editor-editing-panel";
import { PopoverHeader as PopoverHeader4, PopoverScrollableContent as PopoverScrollableContent4 } from "@elementor/editor-ui";
import { ArrowLeftIcon as ArrowLeftIcon3, ChevronDownIcon, TextIcon } from "@elementor/icons";
import {
  bindPopover,
  bindTrigger,
  Button as Button4,
  CardActions as CardActions3,
  Divider as Divider4,
  FormLabel as FormLabel3,
  Grid as Grid3,
  IconButton as IconButton6,
  Popover,
  TextField as TextField3,
  UnstableTag,
  usePopupState
} from "@elementor/ui";
import { __ as __8 } from "@wordpress/i18n";
var SIZE6 = "tiny";
var FontVariableCreation = ({ onClose, onGoBack }) => {
  const fontFamilies = useFontFamilies();
  const { setValue: setVariable } = useBoundProp3(fontVariablePropTypeUtil);
  const [fontFamily, setFontFamily] = useState4("");
  const [label, setLabel] = useState4("");
  const anchorRef = useRef3(null);
  const fontPopoverState = usePopupState({ variant: "popover" });
  const resetFields = () => {
    setFontFamily("");
    setLabel("");
  };
  const closePopover = () => {
    resetFields();
    onClose();
  };
  const handleCreate = () => {
    createVariable({
      value: fontFamily,
      label,
      type: fontVariablePropTypeUtil.key
    }).then((key) => {
      setVariable(key);
      closePopover();
    });
  };
  const isFormInvalid = () => {
    return !fontFamily?.trim() || !label?.trim();
  };
  const sectionRef = useSectionRef4();
  const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;
  return /* @__PURE__ */ React9.createElement(PopoverScrollableContent4, { height: "auto", width: sectionWidth }, /* @__PURE__ */ React9.createElement(
    PopoverHeader4,
    {
      icon: /* @__PURE__ */ React9.createElement(React9.Fragment, null, onGoBack && /* @__PURE__ */ React9.createElement(IconButton6, { size: SIZE6, "aria-label": __8("Go Back", "elementor"), onClick: onGoBack }, /* @__PURE__ */ React9.createElement(ArrowLeftIcon3, { fontSize: SIZE6 })), /* @__PURE__ */ React9.createElement(TextIcon, { fontSize: SIZE6 })),
      title: __8("Create variable", "elementor"),
      onClose: closePopover
    }
  ), /* @__PURE__ */ React9.createElement(Divider4, null), /* @__PURE__ */ React9.createElement(PopoverContent3, { p: 2 }, /* @__PURE__ */ React9.createElement(Grid3, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React9.createElement(Grid3, { item: true, xs: 12 }, /* @__PURE__ */ React9.createElement(FormLabel3, { size: "tiny" }, __8("Name", "elementor"))), /* @__PURE__ */ React9.createElement(Grid3, { item: true, xs: 12 }, /* @__PURE__ */ React9.createElement(
    TextField3,
    {
      size: "tiny",
      fullWidth: true,
      value: label,
      onChange: (e) => setLabel(e.target.value)
    }
  ))), /* @__PURE__ */ React9.createElement(Grid3, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React9.createElement(Grid3, { item: true, xs: 12 }, /* @__PURE__ */ React9.createElement(FormLabel3, { size: "tiny" }, __8("Value", "elementor"))), /* @__PURE__ */ React9.createElement(Grid3, { item: true, xs: 12 }, /* @__PURE__ */ React9.createElement(React9.Fragment, null, /* @__PURE__ */ React9.createElement(
    UnstableTag,
    {
      variant: "outlined",
      label: fontFamily,
      endIcon: /* @__PURE__ */ React9.createElement(ChevronDownIcon, { fontSize: "tiny" }),
      ...bindTrigger(fontPopoverState),
      fullWidth: true
    }
  ), /* @__PURE__ */ React9.createElement(
    Popover,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorEl: anchorRef.current,
      anchorOrigin: { vertical: "top", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: -20 },
      ...bindPopover(fontPopoverState)
    },
    /* @__PURE__ */ React9.createElement(
      FontFamilySelector,
      {
        fontFamilies,
        fontFamily,
        onFontFamilyChange: setFontFamily,
        onClose: fontPopoverState.close,
        sectionWidth
      }
    )
  ))))), /* @__PURE__ */ React9.createElement(CardActions3, { sx: { pt: 0.5, pb: 1 } }, /* @__PURE__ */ React9.createElement(Button4, { size: "small", variant: "contained", disabled: isFormInvalid(), onClick: handleCreate }, __8("Create", "elementor"))));
};

// src/components/font-variable-edit.tsx
import * as React10 from "react";
import { useId, useRef as useRef4, useState as useState5 } from "react";
import { FontFamilySelector as FontFamilySelector2, PopoverContent as PopoverContent4 } from "@elementor/editor-controls";
import { useFontFamilies as useFontFamilies2, useSectionRef as useSectionRef5 } from "@elementor/editor-editing-panel";
import { PopoverHeader as PopoverHeader5, PopoverScrollableContent as PopoverScrollableContent5 } from "@elementor/editor-ui";
import { ArrowLeftIcon as ArrowLeftIcon4, ChevronDownIcon as ChevronDownIcon2, TextIcon as TextIcon2 } from "@elementor/icons";
import {
  bindPopover as bindPopover2,
  bindTrigger as bindTrigger2,
  Button as Button5,
  CardActions as CardActions4,
  Divider as Divider5,
  FormLabel as FormLabel4,
  Grid as Grid4,
  IconButton as IconButton7,
  Popover as Popover2,
  TextField as TextField4,
  UnstableTag as UnstableTag2,
  usePopupState as usePopupState2
} from "@elementor/ui";
import { __ as __9 } from "@wordpress/i18n";
var SIZE7 = "tiny";
var FontVariableEdit = ({ onClose, onGoBack, onSubmit, editId }) => {
  const variable = useVariable(editId);
  if (!variable) {
    throw new Error(`Global font variable "${editId}" not found`);
  }
  const [fontFamily, setFontFamily] = useState5(variable.value);
  const [label, setLabel] = useState5(variable.label);
  const variableNameId = useId();
  const variableValueId = useId();
  const anchorRef = useRef4(null);
  const fontPopoverState = usePopupState2({ variant: "popover" });
  const fontFamilies = useFontFamilies2();
  const handleUpdate = () => {
    updateVariable(editId, {
      value: fontFamily,
      label
    }).then(() => {
      onSubmit?.();
    });
  };
  const noValueChanged = () => fontFamily === variable.value && label === variable.label;
  const hasEmptyValue = () => "" === fontFamily.trim() || "" === label.trim();
  const isSaveDisabled = () => noValueChanged() || hasEmptyValue();
  const sectionRef = useSectionRef5();
  const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;
  return /* @__PURE__ */ React10.createElement(PopoverScrollableContent5, { height: "auto", width: sectionWidth }, /* @__PURE__ */ React10.createElement(
    PopoverHeader5,
    {
      icon: /* @__PURE__ */ React10.createElement(React10.Fragment, null, onGoBack && /* @__PURE__ */ React10.createElement(IconButton7, { size: SIZE7, "aria-label": __9("Go Back", "elementor"), onClick: onGoBack }, /* @__PURE__ */ React10.createElement(ArrowLeftIcon4, { fontSize: SIZE7 })), /* @__PURE__ */ React10.createElement(TextIcon2, { fontSize: SIZE7 })),
      title: __9("Edit variable", "elementor"),
      onClose
    }
  ), /* @__PURE__ */ React10.createElement(Divider5, null), /* @__PURE__ */ React10.createElement(PopoverContent4, { p: 2 }, /* @__PURE__ */ React10.createElement(Grid4, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React10.createElement(Grid4, { item: true, xs: 12 }, /* @__PURE__ */ React10.createElement(FormLabel4, { htmlFor: variableNameId, size: "tiny" }, __9("Name", "elementor"))), /* @__PURE__ */ React10.createElement(Grid4, { item: true, xs: 12 }, /* @__PURE__ */ React10.createElement(
    TextField4,
    {
      id: variableNameId,
      size: "tiny",
      fullWidth: true,
      value: label,
      onChange: (e) => setLabel(e.target.value)
    }
  ))), /* @__PURE__ */ React10.createElement(Grid4, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React10.createElement(Grid4, { item: true, xs: 12 }, /* @__PURE__ */ React10.createElement(FormLabel4, { htmlFor: variableValueId, size: "tiny" }, __9("Value", "elementor"))), /* @__PURE__ */ React10.createElement(Grid4, { item: true, xs: 12 }, /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement(
    UnstableTag2,
    {
      id: variableValueId,
      variant: "outlined",
      label: fontFamily,
      endIcon: /* @__PURE__ */ React10.createElement(ChevronDownIcon2, { fontSize: "tiny" }),
      ...bindTrigger2(fontPopoverState),
      fullWidth: true
    }
  ), /* @__PURE__ */ React10.createElement(
    Popover2,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorEl: anchorRef.current,
      anchorOrigin: { vertical: "top", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: -20 },
      ...bindPopover2(fontPopoverState)
    },
    /* @__PURE__ */ React10.createElement(
      FontFamilySelector2,
      {
        fontFamilies,
        fontFamily,
        onFontFamilyChange: setFontFamily,
        onClose: fontPopoverState.close,
        sectionWidth
      }
    )
  ))))), /* @__PURE__ */ React10.createElement(CardActions4, { sx: { pt: 0.5, pb: 1 } }, /* @__PURE__ */ React10.createElement(Button5, { size: "small", variant: "contained", disabled: isSaveDisabled(), onClick: handleUpdate }, __9("Save", "elementor"))));
};

// src/components/font-variables-selection.tsx
import * as React11 from "react";
import { useState as useState6 } from "react";
import { useBoundProp as useBoundProp4 } from "@elementor/editor-controls";
import { useSectionRef as useSectionRef6 } from "@elementor/editor-editing-panel";
import {
  PopoverHeader as PopoverHeader6,
  PopoverMenuList as PopoverMenuList2,
  PopoverScrollableContent as PopoverScrollableContent6,
  PopoverSearch as PopoverSearch2
} from "@elementor/editor-ui";
import { ColorFilterIcon as ColorFilterIcon3, PlusIcon as PlusIcon2, SettingsIcon as SettingsIcon2, TextIcon as TextIcon3 } from "@elementor/icons";
import { Divider as Divider6, IconButton as IconButton8 } from "@elementor/ui";
import { __ as __10 } from "@wordpress/i18n";
var SIZE8 = "tiny";
var FontVariablesSelection = ({ closePopover, onAdd, onEdit, onSettings }) => {
  const { value: variable, setValue: setVariable } = useBoundProp4(fontVariablePropTypeUtil);
  const [searchValue, setSearchValue] = useState6("");
  const {
    list: variables,
    hasMatches: hasSearchResults,
    isSourceNotEmpty: hasVariables
  } = useFilteredVariables(searchValue, fontVariablePropTypeUtil.key);
  const handleSetVariable = (key) => {
    setVariable(key);
    closePopover();
  };
  const actions = [];
  if (onAdd) {
    actions.push(
      /* @__PURE__ */ React11.createElement(IconButton8, { key: "add", size: SIZE8, onClick: onAdd }, /* @__PURE__ */ React11.createElement(PlusIcon2, { fontSize: SIZE8 }))
    );
  }
  if (onSettings) {
    actions.push(
      /* @__PURE__ */ React11.createElement(IconButton8, { key: "settings", size: SIZE8, onClick: onSettings }, /* @__PURE__ */ React11.createElement(SettingsIcon2, { fontSize: SIZE8 }))
    );
  }
  const items = variables.map(({ value, label, key }) => ({
    type: "item",
    value: key,
    label,
    icon: /* @__PURE__ */ React11.createElement(TextIcon3, { fontSize: SIZE8 }),
    secondaryText: value,
    onEdit: () => onEdit?.(key)
  }));
  const handleSearch = (search) => {
    setSearchValue(search);
  };
  const handleClearSearch = () => {
    setSearchValue("");
  };
  const sectionRef = useSectionRef6();
  const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;
  return /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement(
    PopoverHeader6,
    {
      title: __10("Variables", "elementor"),
      onClose: closePopover,
      icon: /* @__PURE__ */ React11.createElement(ColorFilterIcon3, { fontSize: SIZE8 }),
      actions
    }
  ), hasVariables && /* @__PURE__ */ React11.createElement(
    PopoverSearch2,
    {
      value: searchValue,
      onSearch: handleSearch,
      placeholder: __10("Search", "elementor")
    }
  ), /* @__PURE__ */ React11.createElement(Divider6, null), hasVariables && hasSearchResults && /* @__PURE__ */ React11.createElement(
    PopoverMenuList2,
    {
      items,
      onSelect: handleSetVariable,
      onClose: () => {
      },
      selectedValue: variable,
      "data-testid": "font-variables-list",
      menuListTemplate: VariablesStyledMenuList,
      menuItemContentTemplate: (item) => /* @__PURE__ */ React11.createElement(MenuItemContent, { item }),
      width: sectionWidth
    }
  ), !hasSearchResults && hasVariables && /* @__PURE__ */ React11.createElement(PopoverScrollableContent6, { width: sectionWidth }, /* @__PURE__ */ React11.createElement(NoSearchResults, { searchValue, onClear: handleClearSearch })), !hasVariables && /* @__PURE__ */ React11.createElement(PopoverScrollableContent6, { width: sectionWidth }, /* @__PURE__ */ React11.createElement(
    NoVariables,
    {
      title: __10("Create your first font variable", "elementor"),
      icon: /* @__PURE__ */ React11.createElement(TextIcon3, { fontSize: "large" }),
      onAdd
    }
  )));
};

// src/components/variable-selection-popover.tsx
var VIEW_LIST = "list";
var VIEW_ADD = "add";
var VIEW_EDIT = "edit";
var VariableSelectionPopover = ({ closePopover, propTypeKey, selectedVariable }) => {
  const [currentView, setCurrentView] = useState7(VIEW_LIST);
  const editIdRef = useRef5("");
  const anchorRef = useRef5(null);
  return /* @__PURE__ */ React12.createElement(PopoverContentRefContext.Provider, { value: anchorRef }, /* @__PURE__ */ React12.createElement(Box3, { ref: anchorRef }, renderStage({
    propTypeKey,
    currentView,
    selectedVariable,
    editIdRef,
    setCurrentView,
    closePopover
  })));
};
function renderStage(props) {
  const handleSubmitOnEdit = () => {
    if (props?.selectedVariable?.key === props.editIdRef.current) {
      props.closePopover();
    } else {
      props.setCurrentView(VIEW_LIST);
    }
  };
  if (fontVariablePropTypeUtil.key === props.propTypeKey) {
    if (VIEW_LIST === props.currentView) {
      return /* @__PURE__ */ React12.createElement(
        FontVariablesSelection,
        {
          closePopover: props.closePopover,
          onAdd: () => {
            props.setCurrentView(VIEW_ADD);
          },
          onEdit: (key) => {
            props.editIdRef.current = key;
            props.setCurrentView(VIEW_EDIT);
          }
        }
      );
    }
    if (VIEW_ADD === props.currentView) {
      return /* @__PURE__ */ React12.createElement(
        FontVariableCreation,
        {
          onGoBack: () => props.setCurrentView(VIEW_LIST),
          onClose: props.closePopover
        }
      );
    }
    if (VIEW_EDIT === props.currentView) {
      return /* @__PURE__ */ React12.createElement(
        FontVariableEdit,
        {
          editId: props.editIdRef.current ?? "",
          onGoBack: () => props.setCurrentView(VIEW_LIST),
          onClose: props.closePopover,
          onSubmit: handleSubmitOnEdit
        }
      );
    }
  }
  if (colorVariablePropTypeUtil.key === props.propTypeKey) {
    if (VIEW_LIST === props.currentView) {
      return /* @__PURE__ */ React12.createElement(
        ColorVariablesSelection,
        {
          closePopover: props.closePopover,
          onAdd: () => {
            props.setCurrentView(VIEW_ADD);
          },
          onEdit: (key) => {
            props.editIdRef.current = key;
            props.setCurrentView(VIEW_EDIT);
          }
        }
      );
    }
    if (VIEW_ADD === props.currentView) {
      return /* @__PURE__ */ React12.createElement(
        ColorVariableCreation,
        {
          onGoBack: () => props.setCurrentView(VIEW_LIST),
          onClose: props.closePopover
        }
      );
    }
    if (VIEW_EDIT === props.currentView) {
      return /* @__PURE__ */ React12.createElement(
        ColorVariableEdit,
        {
          editId: props.editIdRef.current ?? "",
          onGoBack: () => props.setCurrentView(VIEW_LIST),
          onClose: props.closePopover,
          onSubmit: handleSubmitOnEdit
        }
      );
    }
  }
  return null;
}

// src/controls/color-variable-control.tsx
var ColorVariableControl = () => {
  const { setValue: setColor } = useBoundProp5();
  const { value: variableValue } = useBoundProp5(colorVariablePropTypeUtil);
  const anchorRef = useRef6(null);
  const popupId = useId2();
  const popupState = usePopupState3({
    variant: "popover",
    popupId: `elementor-variables-list-${popupId}`
  });
  const selectedVariable = useVariable(variableValue);
  if (!selectedVariable) {
    throw new Error(`Global color variable ${variableValue} not found`);
  }
  const unlinkVariable = () => {
    setColor(colorPropTypeUtil.create(selectedVariable.value));
  };
  return /* @__PURE__ */ React13.createElement(Box4, { ref: anchorRef }, /* @__PURE__ */ React13.createElement(
    VariableTag,
    {
      label: selectedVariable.label,
      startIcon: /* @__PURE__ */ React13.createElement(React13.Fragment, null, /* @__PURE__ */ React13.createElement(ColorFilterIcon4, { fontSize: SIZE }), /* @__PURE__ */ React13.createElement(ColorIndicator, { size: "inherit", value: selectedVariable.value, component: "span" })),
      onUnlink: unlinkVariable,
      ...bindTrigger3(popupState)
    }
  ), /* @__PURE__ */ React13.createElement(
    Popover3,
    {
      disableScrollLock: true,
      anchorEl: anchorRef.current,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...bindPopover3(popupState)
    },
    /* @__PURE__ */ React13.createElement(
      VariableSelectionPopover,
      {
        selectedVariable,
        closePopover: popupState.close,
        propTypeKey: colorVariablePropTypeUtil.key
      }
    )
  ));
};

// src/hooks/use-prop-color-variable-action.tsx
import * as React14 from "react";
import { useBoundProp as useBoundProp6 } from "@elementor/editor-editing-panel";
import { ColorFilterIcon as ColorFilterIcon5 } from "@elementor/icons";
import { __ as __11 } from "@wordpress/i18n";

// src/utils.ts
var hasAssignedColorVariable = (propValue) => {
  return !!colorVariablePropTypeUtil.isValid(propValue);
};
var supportsColorVariables = (propType) => {
  return propType.kind === "union" && colorVariablePropTypeUtil.key in propType.prop_types;
};
var hasAssignedFontVariable = (propValue) => {
  return !!fontVariablePropTypeUtil.isValid(propValue);
};
var supportsFontVariables = (propType) => {
  return propType.kind === "union" && fontVariablePropTypeUtil.key in propType.prop_types;
};

// src/hooks/use-prop-color-variable-action.tsx
var usePropColorVariableAction = () => {
  const { propType } = useBoundProp6();
  const visible = !!propType && supportsColorVariables(propType);
  return {
    visible,
    icon: ColorFilterIcon5,
    title: __11("Variables", "elementor"),
    content: ({ close: closePopover }) => {
      return /* @__PURE__ */ React14.createElement(VariableSelectionPopover, { closePopover, propTypeKey: colorVariablePropTypeUtil.key });
    }
  };
};

// src/transformers/variable-transformer.ts
import { createTransformer } from "@elementor/editor-canvas";
var variableTransformer = createTransformer((value) => {
  if (!value.trim()) {
    return null;
  }
  return `var(--${value})`;
});

// src/init-color-variables.ts
var { registerPopoverAction } = controlActionsMenu;
var conditions = {
  backgroundOverlay: ({ value: prop }) => {
    return hasAssignedColorVariable(backgroundColorOverlayPropTypeUtil.extract(prop)?.color);
  },
  boxShadow: ({ value: prop }) => {
    return hasAssignedColorVariable(shadowPropTypeUtil.extract(prop)?.color);
  }
};
function registerControlsAndActions() {
  registerControlReplacement({
    component: ColorVariableControl,
    condition: ({ value }) => hasAssignedColorVariable(value)
  });
  registerPopoverAction({
    id: "color-variables",
    useProps: usePropColorVariableAction
  });
}
function registerRepeaterItemIcons() {
  injectIntoRepeaterItemIcon({
    id: "color-variables-background-icon",
    component: BackgroundRepeaterColorIndicator,
    condition: conditions.backgroundOverlay
  });
  injectIntoRepeaterItemIcon({
    id: "color-variables-icon",
    component: BoxShadowRepeaterColorIndicator,
    condition: conditions.boxShadow
  });
}
function registerRepeaterItemLabels() {
  injectIntoRepeaterItemLabel({
    id: "color-variables-label",
    component: BackgroundRepeaterLabel,
    condition: conditions.backgroundOverlay
  });
}
function registerStyleTransformers() {
  styleTransformersRegistry.register(colorVariablePropTypeUtil.key, variableTransformer);
}
function initColorVariables() {
  registerControlsAndActions();
  registerRepeaterItemIcons();
  registerRepeaterItemLabels();
  registerStyleTransformers();
}

// src/init-font-variables.ts
import { styleTransformersRegistry as styleTransformersRegistry2 } from "@elementor/editor-canvas";
import { controlActionsMenu as controlActionsMenu2, registerControlReplacement as registerControlReplacement2 } from "@elementor/editor-editing-panel";

// src/controls/font-variable-control.tsx
import * as React15 from "react";
import { useId as useId3, useRef as useRef7 } from "react";
import { useBoundProp as useBoundProp7 } from "@elementor/editor-controls";
import { stringPropTypeUtil } from "@elementor/editor-props";
import { ColorFilterIcon as ColorFilterIcon6 } from "@elementor/icons";
import { bindPopover as bindPopover4, bindTrigger as bindTrigger4, Box as Box5, Popover as Popover4, usePopupState as usePopupState4 } from "@elementor/ui";
var FontVariableControl = () => {
  const { setValue: setFontFamily } = useBoundProp7();
  const { value: variableValue } = useBoundProp7(fontVariablePropTypeUtil);
  const anchorRef = useRef7(null);
  const popupId = useId3();
  const popupState = usePopupState4({
    variant: "popover",
    popupId: `elementor-variables-list-${popupId}`
  });
  const selectedVariable = useVariable(variableValue);
  if (!selectedVariable) {
    throw new Error(`Global font variable ${variableValue} not found`);
  }
  const unlinkVariable = () => {
    setFontFamily(stringPropTypeUtil.create(selectedVariable.value));
  };
  return /* @__PURE__ */ React15.createElement(Box5, { ref: anchorRef }, /* @__PURE__ */ React15.createElement(
    VariableTag,
    {
      label: selectedVariable.label,
      startIcon: /* @__PURE__ */ React15.createElement(ColorFilterIcon6, { fontSize: SIZE }),
      onUnlink: unlinkVariable,
      ...bindTrigger4(popupState)
    }
  ), /* @__PURE__ */ React15.createElement(
    Popover4,
    {
      disableScrollLock: true,
      anchorEl: anchorRef.current,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...bindPopover4(popupState)
    },
    /* @__PURE__ */ React15.createElement(
      VariableSelectionPopover,
      {
        selectedVariable,
        closePopover: popupState.close,
        propTypeKey: fontVariablePropTypeUtil.key
      }
    )
  ));
};

// src/hooks/use-prop-font-variable-action.tsx
import * as React16 from "react";
import { useBoundProp as useBoundProp8 } from "@elementor/editor-editing-panel";
import { ColorFilterIcon as ColorFilterIcon7 } from "@elementor/icons";
import { __ as __12 } from "@wordpress/i18n";
var usePropFontVariableAction = () => {
  const { propType } = useBoundProp8();
  const visible = !!propType && supportsFontVariables(propType);
  return {
    visible,
    icon: ColorFilterIcon7,
    title: __12("Variables", "elementor"),
    content: ({ close: closePopover }) => {
      return /* @__PURE__ */ React16.createElement(VariableSelectionPopover, { closePopover, propTypeKey: fontVariablePropTypeUtil.key });
    }
  };
};

// src/init-font-variables.ts
var { registerPopoverAction: registerPopoverAction2 } = controlActionsMenu2;
function initFontVariables() {
  registerControlReplacement2({
    component: FontVariableControl,
    condition: ({ value }) => hasAssignedFontVariable(value)
  });
  registerPopoverAction2({
    id: "font-variables",
    useProps: usePropFontVariableAction
  });
  styleTransformersRegistry2.register(fontVariablePropTypeUtil.key, variableTransformer);
}

// src/renderers/style-variables-renderer.tsx
import * as React17 from "react";
import { useEffect, useState as useState8 } from "react";
import { __privateUseListenTo as useListenTo, commandEndEvent } from "@elementor/editor-v1-adapters";
import { Portal } from "@elementor/ui";

// src/sync/get-canvas-iframe-document.ts
function getCanvasIframeDocument() {
  const extendedWindow = window;
  return extendedWindow.elementor?.$preview?.[0]?.contentDocument;
}

// src/renderers/style-variables-renderer.tsx
var VARIABLES_WRAPPER = "body";
function StyleVariablesRenderer() {
  const container = usePortalContainer();
  const styleVariables = useStyleVariables();
  const hasVariables = Object.keys(styleVariables).length > 0;
  if (!container || !hasVariables) {
    return null;
  }
  const cssVariables = convertToCssVariables(styleVariables);
  const wrappedCss = `${VARIABLES_WRAPPER}{${cssVariables}}`;
  return /* @__PURE__ */ React17.createElement(Portal, { container }, /* @__PURE__ */ React17.createElement("style", { "data-e-style-id": "e-variables", key: wrappedCss }, wrappedCss));
}
function usePortalContainer() {
  return useListenTo(commandEndEvent("editor/documents/attach-preview"), () => getCanvasIframeDocument()?.head);
}
function useStyleVariables() {
  const [variables, setVariables] = useState8({});
  useEffect(() => {
    const unsubscribe = styleVariablesRepository.subscribe(setVariables);
    return () => {
      unsubscribe();
    };
  }, []);
  return variables;
}
function convertToCssVariables(variables) {
  return Object.entries(variables).map(([key, value]) => `--${key}:${value};`).join("");
}

// src/init.ts
function init() {
  initColorVariables();
  initFontVariables();
  service.init();
  injectIntoTop({
    id: "canvas-style-variables-render",
    component: StyleVariablesRenderer
  });
}
export {
  init
};
//# sourceMappingURL=index.mjs.map