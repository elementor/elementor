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
  init: () => init
});
module.exports = __toCommonJS(index_exports);

// src/init.ts
var import_editor = require("@elementor/editor");

// src/init-color-variables.ts
var import_editor_canvas2 = require("@elementor/editor-canvas");
var import_editor_controls8 = require("@elementor/editor-controls");
var import_editor_editing_panel7 = require("@elementor/editor-editing-panel");
var import_editor_props4 = require("@elementor/editor-props");

// src/components/variables-repeater-item-slot.tsx
var React = __toESM(require("react"));

// src/hooks/use-prop-variables.ts
var import_react = require("react");

// src/api.ts
var import_http_client = require("@elementor/http-client");
var BASE_PATH = "elementor/v1/variables";
var apiClient = {
  list: () => {
    return (0, import_http_client.httpService)().get(BASE_PATH + "/list");
  },
  create: (type, label, value) => {
    return (0, import_http_client.httpService)().post(BASE_PATH + "/create", {
      type,
      label,
      value
    });
  },
  update: (id, label, value) => {
    return (0, import_http_client.httpService)().put(BASE_PATH + "/update", {
      id,
      label,
      value
    });
  },
  delete: (id) => {
    return (0, import_http_client.httpService)().post(BASE_PATH + "/delete", { id });
  },
  restore: (id) => {
    return (0, import_http_client.httpService)().post(BASE_PATH + "/restore", { id });
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
  return (0, import_react.useMemo)(() => normalizeVariables(propKey), [propKey]);
};
var isNotDeleted = ({ deleted }) => !deleted;
var normalizeVariables = (propKey) => {
  const variables = service.variables();
  return Object.entries(variables).filter(([, variable]) => variable.type === propKey && isNotDeleted(variable)).map(([key, { label, value }]) => ({
    key,
    label,
    value
  }));
};
var createVariable = (newVariable) => {
  return service.create(newVariable).then(({ id }) => {
    return id;
  });
};
var updateVariable = (updateId, { value, label }) => {
  return service.update(updateId, { value, label }).then(({ id }) => {
    return id;
  });
};
var deleteVariable = (deleteId) => {
  return service.delete(deleteId).then(({ id }) => {
    return id;
  });
};

// src/components/ui/color-indicator.tsx
var import_ui = require("@elementor/ui");
var ColorIndicator = (0, import_ui.styled)(import_ui.UnstableColorIndicator)(({ theme }) => ({
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
var React13 = __toESM(require("react"));
var import_react10 = require("react");
var import_editor_controls7 = require("@elementor/editor-controls");
var import_editor_props3 = require("@elementor/editor-props");
var import_icons9 = require("@elementor/icons");
var import_ui14 = require("@elementor/ui");

// src/components/ui/variable-tag.tsx
var React2 = __toESM(require("react"));
var import_icons = require("@elementor/icons");
var import_ui2 = require("@elementor/ui");
var import_i18n = require("@wordpress/i18n");
var SIZE = "tiny";
var VariableTag = ({ startIcon, label, onUnlink, ...props }) => {
  const actions = [];
  if (onUnlink) {
    actions.push(
      /* @__PURE__ */ React2.createElement(import_ui2.IconButton, { key: "unlink", size: SIZE, onClick: onUnlink, "aria-label": (0, import_i18n.__)("Unlink", "elementor") }, /* @__PURE__ */ React2.createElement(import_icons.DetachIcon, { fontSize: SIZE }))
    );
  }
  return /* @__PURE__ */ React2.createElement(
    import_ui2.UnstableTag,
    {
      fullWidth: true,
      showActionsOnHover: true,
      startIcon: /* @__PURE__ */ React2.createElement(import_ui2.Stack, { gap: 0.5, direction: "row", alignItems: "center" }, startIcon),
      label: /* @__PURE__ */ React2.createElement(import_ui2.Box, { sx: { display: "inline-grid", minWidth: 0 } }, /* @__PURE__ */ React2.createElement(import_ui2.Typography, { sx: { lineHeight: 1.34 }, variant: "caption", noWrap: true }, label)),
      actions,
      ...props
    }
  );
};

// src/components/variable-selection-popover.tsx
var React12 = __toESM(require("react"));
var import_react9 = require("react");
var import_ui13 = require("@elementor/ui");

// src/prop-types/color-variable-prop-type.ts
var import_editor_props = require("@elementor/editor-props");
var import_schema = require("@elementor/schema");
var colorVariablePropTypeUtil = (0, import_editor_props.createPropUtils)("global-color-variable", import_schema.z.string());

// src/prop-types/font-variable-prop-type.ts
var import_editor_props2 = require("@elementor/editor-props");
var import_schema2 = require("@elementor/schema");
var fontVariablePropTypeUtil = (0, import_editor_props2.createPropUtils)("global-font-variable", import_schema2.z.string());

// src/components/color-variable-creation.tsx
var React3 = __toESM(require("react"));
var import_react3 = require("react");
var import_editor_controls = require("@elementor/editor-controls");
var import_editor_editing_panel = require("@elementor/editor-editing-panel");
var import_editor_ui = require("@elementor/editor-ui");
var import_icons2 = require("@elementor/icons");
var import_ui3 = require("@elementor/ui");
var import_i18n2 = require("@wordpress/i18n");

// src/components/variable-selection-popover.context.ts
var import_react2 = require("react");
var PopoverContentRefContext = (0, import_react2.createContext)(null);
var usePopoverContentRef = () => {
  return (0, import_react2.useContext)(PopoverContentRefContext);
};

// src/components/color-variable-creation.tsx
var SIZE2 = "tiny";
var ColorVariableCreation = ({ onGoBack, onClose }) => {
  const { setValue: setVariable } = (0, import_editor_controls.useBoundProp)(colorVariablePropTypeUtil);
  const [color, setColor] = (0, import_react3.useState)("");
  const [label, setLabel] = (0, import_react3.useState)("");
  const defaultRef = (0, import_react3.useRef)(null);
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
  return /* @__PURE__ */ React3.createElement(import_editor_editing_panel.PopoverScrollableContent, { height: "auto" }, /* @__PURE__ */ React3.createElement(
    import_editor_ui.PopoverHeader,
    {
      icon: /* @__PURE__ */ React3.createElement(React3.Fragment, null, onGoBack && /* @__PURE__ */ React3.createElement(import_ui3.IconButton, { size: SIZE2, "aria-label": (0, import_i18n2.__)("Go Back", "elementor"), onClick: onGoBack }, /* @__PURE__ */ React3.createElement(import_icons2.ArrowLeftIcon, { fontSize: SIZE2 })), /* @__PURE__ */ React3.createElement(import_icons2.BrushIcon, { fontSize: SIZE2 })),
      title: (0, import_i18n2.__)("Create variable", "elementor"),
      onClose: closePopover
    }
  ), /* @__PURE__ */ React3.createElement(import_ui3.Divider, null), /* @__PURE__ */ React3.createElement(import_editor_controls.PopoverContent, { p: 2 }, /* @__PURE__ */ React3.createElement(import_ui3.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React3.createElement(import_ui3.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React3.createElement(import_ui3.FormLabel, { size: "tiny" }, (0, import_i18n2.__)("Name", "elementor"))), /* @__PURE__ */ React3.createElement(import_ui3.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React3.createElement(
    import_ui3.TextField,
    {
      size: "tiny",
      fullWidth: true,
      value: label,
      onChange: (e) => setLabel(e.target.value)
    }
  ))), /* @__PURE__ */ React3.createElement(import_ui3.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React3.createElement(import_ui3.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React3.createElement(import_ui3.FormLabel, { size: "tiny" }, (0, import_i18n2.__)("Value", "elementor"))), /* @__PURE__ */ React3.createElement(import_ui3.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React3.createElement(
    import_ui3.UnstableColorField,
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
  )))), /* @__PURE__ */ React3.createElement(import_ui3.CardActions, { sx: { pt: 0.5, pb: 1 } }, /* @__PURE__ */ React3.createElement(import_ui3.Button, { size: "small", variant: "contained", disabled: isFormInvalid(), onClick: handleCreate }, (0, import_i18n2.__)("Create", "elementor"))));
};

// src/components/color-variable-edit.tsx
var React4 = __toESM(require("react"));
var import_react4 = require("react");
var import_editor_controls2 = require("@elementor/editor-controls");
var import_editor_ui2 = require("@elementor/editor-ui");
var import_icons3 = require("@elementor/icons");
var import_ui4 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");
var SIZE3 = "tiny";
var ColorVariableEdit = ({ onClose, onGoBack, onSubmit, editId }) => {
  const variable = useVariable(editId);
  if (!variable) {
    throw new Error(`Global color variable not found`);
  }
  const defaultRef = (0, import_react4.useRef)(null);
  const anchorRef = usePopoverContentRef() ?? defaultRef;
  const [color, setColor] = (0, import_react4.useState)(variable.value);
  const [label, setLabel] = (0, import_react4.useState)(variable.label);
  const handleUpdate = () => {
    updateVariable(editId, {
      value: color,
      label
    }).then(() => {
      onSubmit?.();
    });
  };
  const handleDelete = () => {
    deleteVariable(editId).then(() => {
      onSubmit?.();
    });
  };
  const noValueChanged = () => color === variable.value && label === variable.label;
  const hasEmptyValue = () => "" === color.trim() || "" === label.trim();
  const isSaveDisabled = () => noValueChanged() || hasEmptyValue();
  const actions = [];
  actions.push(
    /* @__PURE__ */ React4.createElement(import_ui4.IconButton, { key: "delete", size: SIZE3, "aria-label": (0, import_i18n3.__)("Delete", "elementor"), onClick: handleDelete }, /* @__PURE__ */ React4.createElement(import_icons3.TrashIcon, { fontSize: SIZE3 }))
  );
  return /* @__PURE__ */ React4.createElement(import_editor_ui2.PopoverScrollableContent, { height: "auto" }, /* @__PURE__ */ React4.createElement(
    import_editor_ui2.PopoverHeader,
    {
      title: (0, import_i18n3.__)("Edit variable", "elementor"),
      onClose,
      icon: /* @__PURE__ */ React4.createElement(React4.Fragment, null, onGoBack && /* @__PURE__ */ React4.createElement(import_ui4.IconButton, { size: SIZE3, "aria-label": (0, import_i18n3.__)("Go Back", "elementor"), onClick: onGoBack }, /* @__PURE__ */ React4.createElement(import_icons3.ArrowLeftIcon, { fontSize: SIZE3 })), /* @__PURE__ */ React4.createElement(import_icons3.BrushIcon, { fontSize: SIZE3 })),
      actions
    }
  ), /* @__PURE__ */ React4.createElement(import_ui4.Divider, null), /* @__PURE__ */ React4.createElement(import_editor_controls2.PopoverContent, { p: 2 }, /* @__PURE__ */ React4.createElement(import_ui4.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React4.createElement(import_ui4.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React4.createElement(import_ui4.FormLabel, { size: "tiny" }, (0, import_i18n3.__)("Name", "elementor"))), /* @__PURE__ */ React4.createElement(import_ui4.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React4.createElement(
    import_ui4.TextField,
    {
      size: "tiny",
      fullWidth: true,
      value: label,
      onChange: (e) => setLabel(e.target.value)
    }
  ))), /* @__PURE__ */ React4.createElement(import_ui4.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React4.createElement(import_ui4.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React4.createElement(import_ui4.FormLabel, { size: "tiny" }, (0, import_i18n3.__)("Value", "elementor"))), /* @__PURE__ */ React4.createElement(import_ui4.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React4.createElement(
    import_ui4.UnstableColorField,
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
  )))), /* @__PURE__ */ React4.createElement(import_ui4.CardActions, { sx: { pt: 0.5, pb: 1 } }, /* @__PURE__ */ React4.createElement(import_ui4.Button, { size: "small", variant: "contained", disabled: isSaveDisabled(), onClick: handleUpdate }, (0, import_i18n3.__)("Save", "elementor"))));
};

// src/components/color-variables-selection.tsx
var React8 = __toESM(require("react"));
var import_react5 = require("react");
var import_editor_controls3 = require("@elementor/editor-controls");
var import_editor_editing_panel2 = require("@elementor/editor-editing-panel");
var import_editor_ui4 = require("@elementor/editor-ui");
var import_icons5 = require("@elementor/icons");
var import_ui9 = require("@elementor/ui");
var import_i18n7 = require("@wordpress/i18n");

// src/components/ui/menu-item-content.tsx
var React5 = __toESM(require("react"));
var import_editor_ui3 = require("@elementor/editor-ui");
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var import_icons4 = require("@elementor/icons");
var import_ui5 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");
var SIZE4 = "tiny";
var isVersion330Active = (0, import_editor_v1_adapters.isExperimentActive)("e_v_3_30");
var MenuItemContent = ({ item }) => {
  const onEdit = item.onEdit;
  return /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement(import_ui5.ListItemIcon, null, item.icon), /* @__PURE__ */ React5.createElement(
    import_ui5.Box,
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
      import_editor_ui3.EllipsisWithTooltip,
      {
        title: item.label || item.value,
        as: import_ui5.Typography,
        variant: isVersion330Active ? "caption" : "body2",
        color: isVersion330Active ? "text.primary" : "text.secondary",
        sx: { marginTop: "1px", lineHeight: "2" },
        maxWidth: "50%"
      }
    ),
    item.secondaryText && /* @__PURE__ */ React5.createElement(
      import_editor_ui3.EllipsisWithTooltip,
      {
        title: item.secondaryText,
        as: import_ui5.Typography,
        variant: "caption",
        color: "text.tertiary",
        sx: { marginTop: "1px", lineHeight: "1" },
        maxWidth: "50%"
      }
    )
  ), !!onEdit && /* @__PURE__ */ React5.createElement(
    import_ui5.IconButton,
    {
      sx: { mx: 1, opacity: "0" },
      onClick: (e) => {
        e.stopPropagation();
        onEdit(item.value);
      },
      "aria-label": (0, import_i18n4.__)("Edit", "elementor")
    },
    /* @__PURE__ */ React5.createElement(import_icons4.EditIcon, { color: "action", fontSize: SIZE4 })
  ));
};

// src/components/ui/no-search-results.tsx
var React6 = __toESM(require("react"));
var import_ui6 = require("@elementor/ui");
var import_i18n5 = require("@wordpress/i18n");
var NoSearchResults = ({ searchValue, onClear, icon }) => {
  return /* @__PURE__ */ React6.createElement(
    import_ui6.Stack,
    {
      gap: 1,
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      p: 2.5,
      color: "text.secondary",
      sx: { pb: 3.5 }
    },
    icon,
    /* @__PURE__ */ React6.createElement(import_ui6.Typography, { align: "center", variant: "subtitle2" }, (0, import_i18n5.__)("Sorry, nothing matched", "elementor"), /* @__PURE__ */ React6.createElement("br", null), "\u201C", searchValue, "\u201D."),
    /* @__PURE__ */ React6.createElement(import_ui6.Typography, { align: "center", variant: "caption", sx: { display: "flex", flexDirection: "column" } }, (0, import_i18n5.__)("Try something else.", "elementor"), /* @__PURE__ */ React6.createElement(import_ui6.Link, { color: "text.secondary", variant: "caption", component: "button", onClick: onClear }, (0, import_i18n5.__)("Clear & try again", "elementor")))
  );
};

// src/components/ui/no-variables.tsx
var React7 = __toESM(require("react"));
var import_ui7 = require("@elementor/ui");
var import_i18n6 = require("@wordpress/i18n");
var NoVariables = ({ icon, title, onAdd }) => /* @__PURE__ */ React7.createElement(
  import_ui7.Stack,
  {
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "text.secondary",
    sx: { p: 2.5, pb: 5.5 }
  },
  icon,
  /* @__PURE__ */ React7.createElement(import_ui7.Typography, { align: "center", variant: "subtitle2" }, title),
  /* @__PURE__ */ React7.createElement(import_ui7.Typography, { align: "center", variant: "caption", maxWidth: "180px" }, (0, import_i18n6.__)("Variables are saved attributes that you can apply anywhere on your site.", "elementor")),
  onAdd && /* @__PURE__ */ React7.createElement(import_ui7.Button, { variant: "outlined", color: "secondary", size: "small", onClick: onAdd }, (0, import_i18n6.__)("Create a variable", "elementor"))
);

// src/components/ui/styled-menu-list.tsx
var import_ui8 = require("@elementor/ui");
var VariablesStyledMenuList = (0, import_ui8.styled)(import_ui8.MenuList)(({ theme }) => ({
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
  const { value: variable, setValue: setVariable } = (0, import_editor_controls3.useBoundProp)(colorVariablePropTypeUtil);
  const [searchValue, setSearchValue] = (0, import_react5.useState)("");
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
      /* @__PURE__ */ React8.createElement(import_ui9.IconButton, { key: "add", size: SIZE5, onClick: onAdd }, /* @__PURE__ */ React8.createElement(import_icons5.PlusIcon, { fontSize: SIZE5 }))
    );
  }
  if (onSettings) {
    actions.push(
      /* @__PURE__ */ React8.createElement(import_ui9.IconButton, { key: "settings", size: SIZE5, onClick: onSettings }, /* @__PURE__ */ React8.createElement(import_icons5.SettingsIcon, { fontSize: SIZE5 }))
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
  return /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement(
    import_editor_ui4.PopoverHeader,
    {
      title: (0, import_i18n7.__)("Variables", "elementor"),
      icon: /* @__PURE__ */ React8.createElement(import_icons5.ColorFilterIcon, { fontSize: SIZE5 }),
      onClose: closePopover,
      actions
    }
  ), hasVariables && /* @__PURE__ */ React8.createElement(
    import_editor_ui4.PopoverSearch,
    {
      value: searchValue,
      onSearch: handleSearch,
      placeholder: (0, import_i18n7.__)("Search", "elementor")
    }
  ), /* @__PURE__ */ React8.createElement(import_ui9.Divider, null), /* @__PURE__ */ React8.createElement(import_editor_editing_panel2.PopoverScrollableContent, null, hasVariables && hasSearchResults && /* @__PURE__ */ React8.createElement(
    import_editor_ui4.PopoverMenuList,
    {
      items,
      onSelect: handleSetColorVariable,
      onClose: () => {
      },
      selectedValue: variable,
      "data-testid": "color-variables-list",
      menuListTemplate: VariablesStyledMenuList,
      menuItemContentTemplate: (item) => /* @__PURE__ */ React8.createElement(MenuItemContent, { item })
    }
  ), !hasSearchResults && hasVariables && /* @__PURE__ */ React8.createElement(
    NoSearchResults,
    {
      searchValue,
      onClear: handleClearSearch,
      icon: /* @__PURE__ */ React8.createElement(import_icons5.BrushIcon, { fontSize: "large" })
    }
  ), !hasVariables && /* @__PURE__ */ React8.createElement(
    NoVariables,
    {
      title: (0, import_i18n7.__)("Create your first color variable", "elementor"),
      icon: /* @__PURE__ */ React8.createElement(import_icons5.BrushIcon, { fontSize: "large" }),
      onAdd
    }
  )));
};

// src/components/font-variable-creation.tsx
var React9 = __toESM(require("react"));
var import_react6 = require("react");
var import_editor_controls4 = require("@elementor/editor-controls");
var import_editor_editing_panel3 = require("@elementor/editor-editing-panel");
var import_editor_ui5 = require("@elementor/editor-ui");
var import_icons6 = require("@elementor/icons");
var import_ui10 = require("@elementor/ui");
var import_i18n8 = require("@wordpress/i18n");
var SIZE6 = "tiny";
var FontVariableCreation = ({ onClose, onGoBack }) => {
  const fontFamilies = (0, import_editor_editing_panel3.useFontFamilies)();
  const { setValue: setVariable } = (0, import_editor_controls4.useBoundProp)(fontVariablePropTypeUtil);
  const [fontFamily, setFontFamily] = (0, import_react6.useState)("");
  const [label, setLabel] = (0, import_react6.useState)("");
  const anchorRef = (0, import_react6.useRef)(null);
  const fontPopoverState = (0, import_ui10.usePopupState)({ variant: "popover" });
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
  const sectionWidth = (0, import_editor_editing_panel3.useSectionWidth)();
  return /* @__PURE__ */ React9.createElement(import_editor_editing_panel3.PopoverScrollableContent, { height: "auto" }, /* @__PURE__ */ React9.createElement(
    import_editor_ui5.PopoverHeader,
    {
      icon: /* @__PURE__ */ React9.createElement(React9.Fragment, null, onGoBack && /* @__PURE__ */ React9.createElement(import_ui10.IconButton, { size: SIZE6, "aria-label": (0, import_i18n8.__)("Go Back", "elementor"), onClick: onGoBack }, /* @__PURE__ */ React9.createElement(import_icons6.ArrowLeftIcon, { fontSize: SIZE6 })), /* @__PURE__ */ React9.createElement(import_icons6.TextIcon, { fontSize: SIZE6 })),
      title: (0, import_i18n8.__)("Create variable", "elementor"),
      onClose: closePopover
    }
  ), /* @__PURE__ */ React9.createElement(import_ui10.Divider, null), /* @__PURE__ */ React9.createElement(import_editor_controls4.PopoverContent, { p: 2 }, /* @__PURE__ */ React9.createElement(import_ui10.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React9.createElement(import_ui10.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React9.createElement(import_ui10.FormLabel, { size: "tiny" }, (0, import_i18n8.__)("Name", "elementor"))), /* @__PURE__ */ React9.createElement(import_ui10.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React9.createElement(
    import_ui10.TextField,
    {
      size: "tiny",
      fullWidth: true,
      value: label,
      onChange: (e) => setLabel(e.target.value)
    }
  ))), /* @__PURE__ */ React9.createElement(import_ui10.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React9.createElement(import_ui10.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React9.createElement(import_ui10.FormLabel, { size: "tiny" }, (0, import_i18n8.__)("Value", "elementor"))), /* @__PURE__ */ React9.createElement(import_ui10.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React9.createElement(React9.Fragment, null, /* @__PURE__ */ React9.createElement(
    import_ui10.UnstableTag,
    {
      variant: "outlined",
      label: fontFamily,
      endIcon: /* @__PURE__ */ React9.createElement(import_icons6.ChevronDownIcon, { fontSize: "tiny" }),
      ...(0, import_ui10.bindTrigger)(fontPopoverState),
      fullWidth: true
    }
  ), /* @__PURE__ */ React9.createElement(
    import_ui10.Popover,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorEl: anchorRef.current,
      anchorOrigin: { vertical: "top", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: -20 },
      ...(0, import_ui10.bindPopover)(fontPopoverState)
    },
    /* @__PURE__ */ React9.createElement(
      import_editor_controls4.FontFamilySelector,
      {
        fontFamilies,
        fontFamily,
        onFontFamilyChange: setFontFamily,
        onClose: fontPopoverState.close,
        sectionWidth
      }
    )
  ))))), /* @__PURE__ */ React9.createElement(import_ui10.CardActions, { sx: { pt: 0.5, pb: 1 } }, /* @__PURE__ */ React9.createElement(import_ui10.Button, { size: "small", variant: "contained", disabled: isFormInvalid(), onClick: handleCreate }, (0, import_i18n8.__)("Create", "elementor"))));
};

// src/components/font-variable-edit.tsx
var React10 = __toESM(require("react"));
var import_react7 = require("react");
var import_editor_controls5 = require("@elementor/editor-controls");
var import_editor_editing_panel4 = require("@elementor/editor-editing-panel");
var import_editor_ui6 = require("@elementor/editor-ui");
var import_icons7 = require("@elementor/icons");
var import_ui11 = require("@elementor/ui");
var import_i18n9 = require("@wordpress/i18n");
var SIZE7 = "tiny";
var FontVariableEdit = ({ onClose, onGoBack, onSubmit, editId }) => {
  const variable = useVariable(editId);
  if (!variable) {
    throw new Error(`Global font variable "${editId}" not found`);
  }
  const [fontFamily, setFontFamily] = (0, import_react7.useState)(variable.value);
  const [label, setLabel] = (0, import_react7.useState)(variable.label);
  const variableNameId = (0, import_react7.useId)();
  const variableValueId = (0, import_react7.useId)();
  const anchorRef = (0, import_react7.useRef)(null);
  const fontPopoverState = (0, import_ui11.usePopupState)({ variant: "popover" });
  const fontFamilies = (0, import_editor_editing_panel4.useFontFamilies)();
  const handleUpdate = () => {
    updateVariable(editId, {
      value: fontFamily,
      label
    }).then(() => {
      onSubmit?.();
    });
  };
  const handleDelete = () => {
    deleteVariable(editId).then(() => {
      onSubmit?.();
    });
  };
  const noValueChanged = () => fontFamily === variable.value && label === variable.label;
  const hasEmptyValue = () => "" === fontFamily.trim() || "" === label.trim();
  const isSaveDisabled = () => noValueChanged() || hasEmptyValue();
  const sectionWidth = (0, import_editor_editing_panel4.useSectionWidth)();
  const actions = [];
  actions.push(
    /* @__PURE__ */ React10.createElement(import_ui11.IconButton, { key: "delete", size: SIZE7, "aria-label": (0, import_i18n9.__)("Delete", "elementor"), onClick: handleDelete }, /* @__PURE__ */ React10.createElement(import_icons7.TrashIcon, { fontSize: SIZE7 }))
  );
  return /* @__PURE__ */ React10.createElement(import_editor_ui6.PopoverScrollableContent, { height: "auto" }, /* @__PURE__ */ React10.createElement(
    import_editor_ui6.PopoverHeader,
    {
      icon: /* @__PURE__ */ React10.createElement(React10.Fragment, null, onGoBack && /* @__PURE__ */ React10.createElement(import_ui11.IconButton, { size: SIZE7, "aria-label": (0, import_i18n9.__)("Go Back", "elementor"), onClick: onGoBack }, /* @__PURE__ */ React10.createElement(import_icons7.ArrowLeftIcon, { fontSize: SIZE7 })), /* @__PURE__ */ React10.createElement(import_icons7.TextIcon, { fontSize: SIZE7 })),
      title: (0, import_i18n9.__)("Edit variable", "elementor"),
      onClose,
      actions
    }
  ), /* @__PURE__ */ React10.createElement(import_ui11.Divider, null), /* @__PURE__ */ React10.createElement(import_editor_controls5.PopoverContent, { p: 2 }, /* @__PURE__ */ React10.createElement(import_ui11.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React10.createElement(import_ui11.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React10.createElement(import_ui11.FormLabel, { htmlFor: variableNameId, size: "tiny" }, (0, import_i18n9.__)("Name", "elementor"))), /* @__PURE__ */ React10.createElement(import_ui11.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React10.createElement(
    import_ui11.TextField,
    {
      id: variableNameId,
      size: "tiny",
      fullWidth: true,
      value: label,
      onChange: (e) => setLabel(e.target.value)
    }
  ))), /* @__PURE__ */ React10.createElement(import_ui11.Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React10.createElement(import_ui11.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React10.createElement(import_ui11.FormLabel, { htmlFor: variableValueId, size: "tiny" }, (0, import_i18n9.__)("Value", "elementor"))), /* @__PURE__ */ React10.createElement(import_ui11.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement(
    import_ui11.UnstableTag,
    {
      id: variableValueId,
      variant: "outlined",
      label: fontFamily,
      endIcon: /* @__PURE__ */ React10.createElement(import_icons7.ChevronDownIcon, { fontSize: "tiny" }),
      ...(0, import_ui11.bindTrigger)(fontPopoverState),
      fullWidth: true
    }
  ), /* @__PURE__ */ React10.createElement(
    import_ui11.Popover,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorEl: anchorRef.current,
      anchorOrigin: { vertical: "top", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: -20 },
      ...(0, import_ui11.bindPopover)(fontPopoverState)
    },
    /* @__PURE__ */ React10.createElement(
      import_editor_controls5.FontFamilySelector,
      {
        fontFamilies,
        fontFamily,
        onFontFamilyChange: setFontFamily,
        onClose: fontPopoverState.close,
        sectionWidth
      }
    )
  ))))), /* @__PURE__ */ React10.createElement(import_ui11.CardActions, { sx: { pt: 0.5, pb: 1 } }, /* @__PURE__ */ React10.createElement(import_ui11.Button, { size: "small", variant: "contained", disabled: isSaveDisabled(), onClick: handleUpdate }, (0, import_i18n9.__)("Save", "elementor"))));
};

// src/components/font-variables-selection.tsx
var React11 = __toESM(require("react"));
var import_react8 = require("react");
var import_editor_controls6 = require("@elementor/editor-controls");
var import_editor_editing_panel5 = require("@elementor/editor-editing-panel");
var import_editor_ui7 = require("@elementor/editor-ui");
var import_icons8 = require("@elementor/icons");
var import_ui12 = require("@elementor/ui");
var import_i18n10 = require("@wordpress/i18n");
var SIZE8 = "tiny";
var FontVariablesSelection = ({ closePopover, onAdd, onEdit, onSettings }) => {
  const { value: variable, setValue: setVariable } = (0, import_editor_controls6.useBoundProp)(fontVariablePropTypeUtil);
  const [searchValue, setSearchValue] = (0, import_react8.useState)("");
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
      /* @__PURE__ */ React11.createElement(import_ui12.IconButton, { key: "add", size: SIZE8, onClick: onAdd }, /* @__PURE__ */ React11.createElement(import_icons8.PlusIcon, { fontSize: SIZE8 }))
    );
  }
  if (onSettings) {
    actions.push(
      /* @__PURE__ */ React11.createElement(import_ui12.IconButton, { key: "settings", size: SIZE8, onClick: onSettings }, /* @__PURE__ */ React11.createElement(import_icons8.SettingsIcon, { fontSize: SIZE8 }))
    );
  }
  const items = variables.map(({ value, label, key }) => ({
    type: "item",
    value: key,
    label,
    icon: /* @__PURE__ */ React11.createElement(import_icons8.TextIcon, { fontSize: SIZE8 }),
    secondaryText: value,
    onEdit: () => onEdit?.(key)
  }));
  const handleSearch = (search) => {
    setSearchValue(search);
  };
  const handleClearSearch = () => {
    setSearchValue("");
  };
  return /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement(
    import_editor_ui7.PopoverHeader,
    {
      title: (0, import_i18n10.__)("Variables", "elementor"),
      onClose: closePopover,
      icon: /* @__PURE__ */ React11.createElement(import_icons8.ColorFilterIcon, { fontSize: SIZE8 }),
      actions
    }
  ), hasVariables && /* @__PURE__ */ React11.createElement(
    import_editor_ui7.PopoverSearch,
    {
      value: searchValue,
      onSearch: handleSearch,
      placeholder: (0, import_i18n10.__)("Search", "elementor")
    }
  ), /* @__PURE__ */ React11.createElement(import_ui12.Divider, null), /* @__PURE__ */ React11.createElement(import_editor_editing_panel5.PopoverScrollableContent, null, hasVariables && hasSearchResults && /* @__PURE__ */ React11.createElement(
    import_editor_ui7.PopoverMenuList,
    {
      items,
      onSelect: handleSetVariable,
      onClose: () => {
      },
      selectedValue: variable,
      "data-testid": "font-variables-list",
      menuListTemplate: VariablesStyledMenuList,
      menuItemContentTemplate: (item) => /* @__PURE__ */ React11.createElement(MenuItemContent, { item })
    }
  ), !hasSearchResults && hasVariables && /* @__PURE__ */ React11.createElement(
    NoSearchResults,
    {
      searchValue,
      onClear: handleClearSearch,
      icon: /* @__PURE__ */ React11.createElement(import_icons8.TextIcon, { fontSize: "large" })
    }
  ), !hasVariables && /* @__PURE__ */ React11.createElement(
    NoVariables,
    {
      title: (0, import_i18n10.__)("Create your first font variable", "elementor"),
      icon: /* @__PURE__ */ React11.createElement(import_icons8.TextIcon, { fontSize: "large" }),
      onAdd
    }
  )));
};

// src/components/variable-selection-popover.tsx
var VIEW_LIST = "list";
var VIEW_ADD = "add";
var VIEW_EDIT = "edit";
var VariableSelectionPopover = ({ closePopover, propTypeKey, selectedVariable }) => {
  const [currentView, setCurrentView] = (0, import_react9.useState)(VIEW_LIST);
  const editIdRef = (0, import_react9.useRef)("");
  const anchorRef = (0, import_react9.useRef)(null);
  return /* @__PURE__ */ React12.createElement(PopoverContentRefContext.Provider, { value: anchorRef }, /* @__PURE__ */ React12.createElement(import_ui13.Box, { ref: anchorRef }, renderStage({
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
  const { setValue: setColor } = (0, import_editor_controls7.useBoundProp)();
  const { value: variableValue } = (0, import_editor_controls7.useBoundProp)(colorVariablePropTypeUtil);
  const anchorRef = (0, import_react10.useRef)(null);
  const popupId = (0, import_react10.useId)();
  const popupState = (0, import_ui14.usePopupState)({
    variant: "popover",
    popupId: `elementor-variables-list-${popupId}`
  });
  const selectedVariable = useVariable(variableValue);
  if (!selectedVariable) {
    throw new Error(`Global color variable ${variableValue} not found`);
  }
  const unlinkVariable = () => {
    setColor(import_editor_props3.colorPropTypeUtil.create(selectedVariable.value));
  };
  return /* @__PURE__ */ React13.createElement(import_ui14.Box, { ref: anchorRef }, /* @__PURE__ */ React13.createElement(
    VariableTag,
    {
      label: selectedVariable.label,
      startIcon: /* @__PURE__ */ React13.createElement(React13.Fragment, null, /* @__PURE__ */ React13.createElement(import_icons9.ColorFilterIcon, { fontSize: SIZE }), /* @__PURE__ */ React13.createElement(ColorIndicator, { size: "inherit", value: selectedVariable.value, component: "span" })),
      onUnlink: unlinkVariable,
      ...(0, import_ui14.bindTrigger)(popupState)
    }
  ), /* @__PURE__ */ React13.createElement(
    import_ui14.Popover,
    {
      disableScrollLock: true,
      anchorEl: anchorRef.current,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...(0, import_ui14.bindPopover)(popupState)
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
var React14 = __toESM(require("react"));
var import_editor_editing_panel6 = require("@elementor/editor-editing-panel");
var import_icons10 = require("@elementor/icons");
var import_i18n11 = require("@wordpress/i18n");

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
  const { propType } = (0, import_editor_editing_panel6.useBoundProp)();
  const visible = !!propType && supportsColorVariables(propType);
  return {
    visible,
    icon: import_icons10.ColorFilterIcon,
    title: (0, import_i18n11.__)("Variables", "elementor"),
    content: ({ close: closePopover }) => {
      return /* @__PURE__ */ React14.createElement(VariableSelectionPopover, { closePopover, propTypeKey: colorVariablePropTypeUtil.key });
    }
  };
};

// src/transformers/variable-transformer.ts
var import_editor_canvas = require("@elementor/editor-canvas");
var variableTransformer = (0, import_editor_canvas.createTransformer)((value) => {
  if (!value.trim()) {
    return null;
  }
  return `var(--${value})`;
});

// src/init-color-variables.ts
var { registerPopoverAction } = import_editor_editing_panel7.controlActionsMenu;
var conditions = {
  backgroundOverlay: ({ value: prop }) => {
    return hasAssignedColorVariable(import_editor_props4.backgroundColorOverlayPropTypeUtil.extract(prop)?.color);
  },
  boxShadow: ({ value: prop }) => {
    return hasAssignedColorVariable(import_editor_props4.shadowPropTypeUtil.extract(prop)?.color);
  }
};
function registerControlsAndActions() {
  (0, import_editor_editing_panel7.registerControlReplacement)({
    component: ColorVariableControl,
    condition: ({ value }) => hasAssignedColorVariable(value)
  });
  registerPopoverAction({
    id: "color-variables",
    useProps: usePropColorVariableAction
  });
}
function registerRepeaterItemIcons() {
  (0, import_editor_controls8.injectIntoRepeaterItemIcon)({
    id: "color-variables-background-icon",
    component: BackgroundRepeaterColorIndicator,
    condition: conditions.backgroundOverlay
  });
  (0, import_editor_controls8.injectIntoRepeaterItemIcon)({
    id: "color-variables-icon",
    component: BoxShadowRepeaterColorIndicator,
    condition: conditions.boxShadow
  });
}
function registerRepeaterItemLabels() {
  (0, import_editor_controls8.injectIntoRepeaterItemLabel)({
    id: "color-variables-label",
    component: BackgroundRepeaterLabel,
    condition: conditions.backgroundOverlay
  });
}
function registerStyleTransformers() {
  import_editor_canvas2.styleTransformersRegistry.register(colorVariablePropTypeUtil.key, variableTransformer);
}
function initColorVariables() {
  registerControlsAndActions();
  registerRepeaterItemIcons();
  registerRepeaterItemLabels();
  registerStyleTransformers();
}

// src/init-font-variables.ts
var import_editor_canvas3 = require("@elementor/editor-canvas");
var import_editor_editing_panel9 = require("@elementor/editor-editing-panel");

// src/controls/font-variable-control.tsx
var React15 = __toESM(require("react"));
var import_react11 = require("react");
var import_editor_controls9 = require("@elementor/editor-controls");
var import_editor_props5 = require("@elementor/editor-props");
var import_icons11 = require("@elementor/icons");
var import_ui15 = require("@elementor/ui");
var FontVariableControl = () => {
  const { setValue: setFontFamily } = (0, import_editor_controls9.useBoundProp)();
  const { value: variableValue } = (0, import_editor_controls9.useBoundProp)(fontVariablePropTypeUtil);
  const anchorRef = (0, import_react11.useRef)(null);
  const popupId = (0, import_react11.useId)();
  const popupState = (0, import_ui15.usePopupState)({
    variant: "popover",
    popupId: `elementor-variables-list-${popupId}`
  });
  const selectedVariable = useVariable(variableValue);
  if (!selectedVariable) {
    throw new Error(`Global font variable ${variableValue} not found`);
  }
  const unlinkVariable = () => {
    setFontFamily(import_editor_props5.stringPropTypeUtil.create(selectedVariable.value));
  };
  return /* @__PURE__ */ React15.createElement(import_ui15.Box, { ref: anchorRef }, /* @__PURE__ */ React15.createElement(
    VariableTag,
    {
      label: selectedVariable.label,
      startIcon: /* @__PURE__ */ React15.createElement(import_icons11.ColorFilterIcon, { fontSize: SIZE }),
      onUnlink: unlinkVariable,
      ...(0, import_ui15.bindTrigger)(popupState)
    }
  ), /* @__PURE__ */ React15.createElement(
    import_ui15.Popover,
    {
      disableScrollLock: true,
      anchorEl: anchorRef.current,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...(0, import_ui15.bindPopover)(popupState)
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
var React16 = __toESM(require("react"));
var import_editor_editing_panel8 = require("@elementor/editor-editing-panel");
var import_icons12 = require("@elementor/icons");
var import_i18n12 = require("@wordpress/i18n");
var usePropFontVariableAction = () => {
  const { propType } = (0, import_editor_editing_panel8.useBoundProp)();
  const visible = !!propType && supportsFontVariables(propType);
  return {
    visible,
    icon: import_icons12.ColorFilterIcon,
    title: (0, import_i18n12.__)("Variables", "elementor"),
    content: ({ close: closePopover }) => {
      return /* @__PURE__ */ React16.createElement(VariableSelectionPopover, { closePopover, propTypeKey: fontVariablePropTypeUtil.key });
    }
  };
};

// src/init-font-variables.ts
var { registerPopoverAction: registerPopoverAction2 } = import_editor_editing_panel9.controlActionsMenu;
function initFontVariables() {
  (0, import_editor_editing_panel9.registerControlReplacement)({
    component: FontVariableControl,
    condition: ({ value }) => hasAssignedFontVariable(value)
  });
  registerPopoverAction2({
    id: "font-variables",
    useProps: usePropFontVariableAction
  });
  import_editor_canvas3.styleTransformersRegistry.register(fontVariablePropTypeUtil.key, variableTransformer);
}

// src/renderers/style-variables-renderer.tsx
var React17 = __toESM(require("react"));
var import_react12 = require("react");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
var import_ui16 = require("@elementor/ui");

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
  return /* @__PURE__ */ React17.createElement(import_ui16.Portal, { container }, /* @__PURE__ */ React17.createElement("style", { "data-e-style-id": "e-variables", key: wrappedCss }, wrappedCss));
}
function usePortalContainer() {
  return (0, import_editor_v1_adapters2.__privateUseListenTo)((0, import_editor_v1_adapters2.commandEndEvent)("editor/documents/attach-preview"), () => getCanvasIframeDocument()?.head);
}
function useStyleVariables() {
  const [variables, setVariables] = (0, import_react12.useState)({});
  (0, import_react12.useEffect)(() => {
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
  (0, import_editor.injectIntoTop)({
    id: "canvas-style-variables-render",
    component: StyleVariablesRenderer
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  init
});
//# sourceMappingURL=index.js.map