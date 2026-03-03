// src/init.ts
import { injectIntoLogic, injectIntoTop } from "@elementor/editor";
import { registerControlReplacement } from "@elementor/editor-controls";
import { __registerPanel as registerPanel } from "@elementor/editor-panels";
import { isTransformable as isTransformable2 } from "@elementor/editor-props";
import { controlActionsMenu } from "@elementor/menus";

// src/components/open-panel-from-url.tsx
import { useEffect as useEffect4, useRef as useRef7 } from "react";
import { __privateListenTo as listenTo, routeOpenEvent } from "@elementor/editor-v1-adapters";

// src/components/variables-manager/variables-manager-panel.tsx
import * as React14 from "react";
import { useCallback as useCallback5, useEffect as useEffect3, useState as useState6 } from "react";
import { useSuppressedMessage } from "@elementor/editor-current-user";
import {
  __createPanel as createPanel,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  PanelHeaderTitle
} from "@elementor/editor-panels";
import { ConfirmationDialog as ConfirmationDialog2, SaveChangesDialog, SearchField, ThemeProvider, useDialog } from "@elementor/editor-ui";
import { changeEditMode } from "@elementor/editor-v1-adapters";
import { AlertTriangleFilledIcon as AlertTriangleFilledIcon2, ColorFilterIcon, TrashIcon } from "@elementor/icons";
import {
  Alert,
  AlertAction,
  AlertTitle,
  Button as Button2,
  CloseButton,
  Divider,
  Infotip,
  Stack as Stack6,
  usePopupState as usePopupState2
} from "@elementor/ui";
import { __ as __10 } from "@wordpress/i18n";

// src/utils/tracking.ts
import { getMixpanel } from "@elementor/events";
var trackVariableEvent = ({ varType, controlPath, action }) => {
  const { dispatchEvent, config } = getMixpanel();
  if (!config?.names?.variables?.[action]) {
    return;
  }
  const name = config.names.variables[action];
  dispatchEvent?.(name, {
    location: config?.locations?.variables || "",
    secondaryLocation: config?.secondaryLocations?.variablesPopover || "",
    trigger: config?.triggers?.click || "",
    var_type: varType,
    control_path: controlPath,
    action_type: name
  });
};
var trackVariablesManagerEvent = ({ action, varType, controlPath }) => {
  const { dispatchEvent, config } = getMixpanel();
  if (!config?.names?.variables?.[action]) {
    return;
  }
  const name = config.names.variables[action];
  const eventData = {
    location: config?.locations?.variablesManager || "",
    trigger: config?.triggers?.click || "",
    action_type: name
  };
  if (varType) {
    eventData.var_type = varType;
  }
  if (controlPath) {
    eventData.style_control_path = controlPath;
  }
  dispatchEvent?.(name, eventData);
};

// src/utils/validations.ts
import { AlertTriangleFilledIcon, InfoCircleFilledIcon } from "@elementor/icons";
import { __, sprintf } from "@wordpress/i18n";
var ERROR_MESSAGES = {
  MISSING_VARIABLE_NAME: __("Give your variable a name.", "elementor"),
  MISSING_VARIABLE_VALUE: __("Add a value to complete your variable.", "elementor"),
  INVALID_CHARACTERS: __("Use letters, numbers, dashes (-), or underscores (_) for the name.", "elementor"),
  NO_NON_SPECIAL_CHARACTER: __("Names have to include at least one non-special character.", "elementor"),
  VARIABLE_LABEL_MAX_LENGTH: __("Keep names up to 50 characters.", "elementor"),
  DUPLICATED_LABEL: __("This variable name already exists. Please choose a unique name.", "elementor"),
  UNEXPECTED_ERROR: __("There was a glitch. Try saving your variable again.", "elementor"),
  BATCH: {
    DUPLICATED_LABELS: (count, name) => (
      // eslint-disable-next-line @wordpress/i18n-translator-comments
      sprintf(__("We found %1$d duplicated %2$s.", "elementor"), count, name)
    ),
    UNEXPECTED_ERROR: __("There was a glitch.", "elementor"),
    DUPLICATED_LABEL_ACTION: __("Take me there", "elementor"),
    DUPLICATED_LABEL_ACTION_MESSAGE: __("Please rename the variables.", "elementor"),
    UNEXPECTED_ERROR_ACTION_MESSAGE: __("Try saving your variables again.", "elementor")
  }
};
var VARIABLE_LABEL_MAX_LENGTH = 50;
var mapServerError = (error) => {
  if (error?.response?.data?.code === "duplicated_label") {
    return {
      field: "label",
      message: ERROR_MESSAGES.DUPLICATED_LABEL
    };
  }
  if (error?.response?.data?.code === "batch_duplicated_label") {
    const errorData = error?.response?.data?.data ?? {};
    const count = Object.keys(errorData).length;
    const name = count === 1 ? "name" : "names";
    const duplicatedIds = Object.keys(errorData);
    return {
      field: "label",
      message: ERROR_MESSAGES.BATCH.DUPLICATED_LABELS(count, name),
      severity: "error",
      IconComponent: AlertTriangleFilledIcon,
      action: {
        label: ERROR_MESSAGES.BATCH.DUPLICATED_LABEL_ACTION,
        message: ERROR_MESSAGES.BATCH.DUPLICATED_LABEL_ACTION_MESSAGE,
        data: {
          duplicatedIds
        }
      }
    };
  }
  if (error?.response?.data?.code === "batch_operation_failed") {
    return {
      field: "label",
      message: ERROR_MESSAGES.BATCH.UNEXPECTED_ERROR,
      severity: "secondary",
      IconComponent: InfoCircleFilledIcon,
      action: {
        message: ERROR_MESSAGES.BATCH.UNEXPECTED_ERROR_ACTION_MESSAGE
      }
    };
  }
  return void 0;
};
var validateLabel = (name, variables) => {
  if (!name.trim()) {
    return ERROR_MESSAGES.MISSING_VARIABLE_NAME;
  }
  const allowedChars = /^[a-zA-Z0-9_-]+$/;
  if (!allowedChars.test(name)) {
    return ERROR_MESSAGES.INVALID_CHARACTERS;
  }
  const hasAlphanumeric = /[a-zA-Z0-9]/;
  if (!hasAlphanumeric.test(name)) {
    return ERROR_MESSAGES.NO_NON_SPECIAL_CHARACTER;
  }
  if (VARIABLE_LABEL_MAX_LENGTH < name.length) {
    return ERROR_MESSAGES.VARIABLE_LABEL_MAX_LENGTH;
  }
  if (Object.values(variables ?? {}).some((variable) => variable.label === name)) {
    return ERROR_MESSAGES.DUPLICATED_LABEL;
  }
  return "";
};
var labelHint = (name) => {
  const hintThreshold = VARIABLE_LABEL_MAX_LENGTH * 0.8 - 1;
  if (hintThreshold < name.length) {
    return ERROR_MESSAGES.VARIABLE_LABEL_MAX_LENGTH;
  }
  return "";
};
var validateValue = (value) => {
  if (!value.trim()) {
    return ERROR_MESSAGES.MISSING_VARIABLE_VALUE;
  }
  return "";
};

// src/variables-registry/create-variable-type-registry.ts
import {
  stylesInheritanceTransformersRegistry,
  styleTransformersRegistry
} from "@elementor/editor-canvas";

// src/transformers/inheritance-transformer.tsx
import * as React from "react";
import { createTransformer } from "@elementor/editor-canvas";
import { Stack, Typography } from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";

// src/components/ui/color-indicator.tsx
import { styled, UnstableColorIndicator } from "@elementor/ui";
var ColorIndicator = styled(UnstableColorIndicator)(({ theme }) => ({
  borderRadius: `${theme.shape.borderRadius / 2}px`,
  marginRight: theme.spacing(0.25)
}));

// src/prop-types/color-variable-prop-type.ts
import { createPropUtils } from "@elementor/editor-props";
import { z } from "@elementor/schema";
var colorVariablePropTypeUtil = createPropUtils("global-color-variable", z.string());

// src/service.ts
import { __ as __2 } from "@wordpress/i18n";

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
  update: (id2, label, value, type) => {
    return httpService().put(BASE_PATH + "/update", {
      id: id2,
      label,
      value,
      type
    });
  },
  delete: (id2) => {
    return httpService().post(BASE_PATH + "/delete", { id: id2 });
  },
  restore: (id2, label, value, type) => {
    const payload = { id: id2 };
    if (label) {
      payload.label = label;
    }
    if (value) {
      payload.value = value;
    }
    if (type) {
      payload.type = type;
    }
    return httpService().post(BASE_PATH + "/restore", payload);
  },
  batch: (payload) => {
    return httpService().post(BASE_PATH + "/batch", payload);
  }
};

// src/batch-operations.ts
var generateTempId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `tmp-${timestamp}-${random}`;
};
var isTempId = (id2) => {
  return id2.startsWith("tmp-");
};
var buildOperationsArray = (originalVariables, currentVariables, deletedVariables) => {
  const operations = [];
  Object.entries(currentVariables).forEach(([id2, variable]) => {
    if (isTempId(id2)) {
      operations.push({
        type: "create",
        variable: {
          ...variable,
          id: id2
        }
      });
    } else if (originalVariables[id2]) {
      const original = originalVariables[id2];
      const syncChanged = original.sync_to_v3 !== variable.sync_to_v3;
      if (original.deleted && !variable.deleted) {
        operations.push({
          type: "restore",
          id: id2,
          ...original.label !== variable.label && { label: variable.label },
          ...original.value !== variable.value && { value: variable.value }
        });
      } else if (!variable.deleted && (original.label !== variable.label || original.value !== variable.value || original.order !== variable.order || original.type !== variable.type || syncChanged)) {
        operations.push({
          type: "update",
          id: id2,
          variable: {
            ...original.label !== variable.label && { label: variable.label },
            ...original.value !== variable.value && { value: variable.value },
            ...original.order !== variable.order && { order: variable.order },
            ...original.type !== variable.type && { type: variable.type },
            ...syncChanged && { sync_to_v3: variable.sync_to_v3 }
          }
        });
      }
    }
  });
  deletedVariables.forEach((id2) => {
    operations.push({
      type: "delete",
      id: id2
    });
  });
  return operations.filter((op) => {
    const id2 = op.id || op.variable?.id;
    return id2 && !(isTempId(id2) && currentVariables[id2]?.deleted);
  });
};

// src/storage.ts
var STORAGE_KEY = "elementor-global-variables";
var STORAGE_WATERMARK_KEY = "elementor-global-variables-watermark";
var OP_RW = "RW";
var OP_RO = "RO";
var Storage = class {
  state;
  notifyChange() {
    window.dispatchEvent(new Event("variables:updated"));
  }
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
    this.notifyChange();
  }
  add(id2, variable) {
    this.load();
    this.state.variables[id2] = variable;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.variables));
    this.notifyChange();
  }
  update(id2, variable) {
    this.load();
    this.state.variables[id2] = variable;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.variables));
    this.notifyChange();
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
import { enqueueFont } from "@elementor/editor-v1-adapters";

// src/prop-types/font-variable-prop-type.ts
import { createPropUtils as createPropUtils2 } from "@elementor/editor-props";
import { z as z2 } from "@elementor/schema";
var fontVariablePropTypeUtil = createPropUtils2("global-font-variable", z2.string());

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
  const shouldUpdate = (key, maybeUpdated) => {
    if (!(key in variables)) {
      return true;
    }
    if (variables[key].label !== maybeUpdated.label) {
      return true;
    }
    if (variables[key].value !== maybeUpdated.value) {
      return true;
    }
    if (!variables[key]?.deleted && maybeUpdated?.deleted) {
      return true;
    }
    if (variables[key]?.deleted && !maybeUpdated?.deleted) {
      return true;
    }
    return false;
  };
  const applyUpdates = (updatedVars) => {
    let hasChanges = false;
    for (const [key, variable] of Object.entries(updatedVars)) {
      if (shouldUpdate(key, variable)) {
        variables[key] = variable;
        if (variable.type === fontVariablePropTypeUtil.key) {
          fontEnqueue(variable.value);
        }
        hasChanges = true;
      }
    }
    return hasChanges;
  };
  const fontEnqueue = (value) => {
    if (!value) {
      return;
    }
    try {
      enqueueFont(value);
    } catch {
    }
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
  findIdByLabel(needle) {
    const variableId = Object.entries(this.variables()).find(([, variable]) => variable.label === needle);
    if (!variableId) {
      throw new Error(`Variable with label ${needle} not found`);
    }
    return variableId[0];
  },
  findVariableByLabel(needle) {
    return Object.values(this.variables()).find((variable) => variable.label === needle) || null;
  },
  getWatermark: () => {
    return storage.state.watermark;
  },
  init: () => {
    return service.load();
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
        const errorMessage = payload?.message || __2("Unexpected response from server", "elementor");
        throw new Error(errorMessage);
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
  update: (id2, { label, value, type }) => {
    return apiClient.update(id2, label, value, type).then((response) => {
      const { success, data: payload } = response.data;
      if (!success) {
        const errorMessage = payload?.message || __2("Unexpected response from server", "elementor");
        throw new Error(errorMessage);
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
  delete: (id2) => {
    return apiClient.delete(id2).then((response) => {
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
  restore: (id2, label, value, type) => {
    return apiClient.restore(id2, label, value, type).then((response) => {
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
  },
  batchSave: (originalVariables, currentVariables, deletedVariables) => {
    const operations = buildOperationsArray(originalVariables, currentVariables, deletedVariables);
    const batchPayload = { operations, watermark: storage.state.watermark };
    if (operations.length === 0) {
      return Promise.resolve({
        success: true,
        watermark: storage.state.watermark,
        operations: 0
      });
    }
    return apiClient.batch(batchPayload).then((response) => {
      const { success, data: payload } = response.data;
      if (!success) {
        throw new Error("Unexpected response from server");
      }
      return payload;
    }).then((data) => {
      const { results, watermark } = data;
      handleWatermark(OP_RW, watermark);
      if (results) {
        results.forEach((result) => {
          if (result.variable) {
            const { id: variableId, ...variableData } = result.variable;
            if (result.type === "create") {
              storage.add(variableId, variableData);
            } else {
              storage.update(variableId, variableData);
            }
            styleVariablesRepository.update({
              [variableId]: variableData
            });
          }
        });
      }
      return {
        success: true,
        watermark,
        operations: operations.length
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

// src/transformers/utils/resolve-css-variable.ts
var resolveCssVariable = (id2, variable) => {
  let name = id2;
  let fallbackValue = "";
  if (variable) {
    fallbackValue = variable.value;
  }
  if (variable && !variable.deleted) {
    name = variable.label;
  }
  if (!name.trim()) {
    return null;
  }
  const validCssVariableName = `--${name}`;
  if (!fallbackValue.trim()) {
    return `var(${validCssVariableName})`;
  }
  return `var(${validCssVariableName}, ${fallbackValue})`;
};

// src/transformers/inheritance-transformer.tsx
var inheritanceTransformer = createTransformer((id2) => {
  const variables = service.variables();
  const variable = variables[id2];
  if (!variable) {
    return /* @__PURE__ */ React.createElement("span", null, __3("Missing variable", "elementor"));
  }
  const showColorIndicator = variable.type === colorVariablePropTypeUtil.key;
  const css = resolveCssVariable(id2, variable);
  return /* @__PURE__ */ React.createElement(Stack, { direction: "row", spacing: 0.5, sx: { paddingInline: "1px" }, alignItems: "center" }, showColorIndicator && /* @__PURE__ */ React.createElement(ColorIndicator, { size: "inherit", value: variable.value }), /* @__PURE__ */ React.createElement(Typography, { variant: "caption", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }, css));
});

// src/transformers/variable-transformer.ts
import { createTransformer as createTransformer2 } from "@elementor/editor-canvas";
var variableTransformer = createTransformer2((idOrLabel) => {
  const variables = service.variables();
  const targetVariable = variables[idOrLabel] || service.findVariableByLabel(idOrLabel);
  if (!targetVariable) {
    return null;
  }
  const id2 = service.findIdByLabel(targetVariable.label);
  return resolveCssVariable(id2, targetVariable);
});

// src/variables-registry/create-variable-type-registry.ts
function createVariableTypeRegistry() {
  const variableTypes = {};
  const registerVariableType2 = ({
    key,
    icon,
    startIcon,
    valueField,
    propTypeUtil,
    variableType,
    defaultValue,
    selectionFilter,
    valueTransformer,
    styleTransformer,
    fallbackPropTypeUtil,
    isCompatible,
    emptyState,
    isActive = true,
    menuActionsFactory
  }) => {
    const variableTypeKey = key ?? propTypeUtil.key;
    if (!isCompatible) {
      isCompatible = (propType, variable) => {
        if ("union" === propType.kind) {
          if (variable.type in propType.prop_types) {
            return true;
          }
        }
        return false;
      };
    }
    variableTypes[variableTypeKey] = {
      icon,
      startIcon,
      valueField,
      propTypeUtil,
      variableType,
      defaultValue,
      selectionFilter,
      valueTransformer,
      fallbackPropTypeUtil,
      isCompatible,
      emptyState,
      isActive,
      menuActionsFactory
    };
    registerTransformer(propTypeUtil.key, styleTransformer);
    registerInheritanceTransformer(propTypeUtil.key);
  };
  const registerTransformer = (key, transformer) => {
    styleTransformersRegistry.register(key, transformer ?? variableTransformer);
  };
  const registerInheritanceTransformer = (key) => {
    stylesInheritanceTransformersRegistry.register(key, inheritanceTransformer);
  };
  const getVariableType2 = (key) => {
    return variableTypes[key];
  };
  const getVariableTypes2 = () => {
    return variableTypes;
  };
  const hasVariableType2 = (key) => {
    return key in variableTypes && !!variableTypes[key].isActive;
  };
  return {
    registerVariableType: registerVariableType2,
    getVariableType: getVariableType2,
    getVariableTypes: getVariableTypes2,
    hasVariableType: hasVariableType2
  };
}

// src/variables-registry/variable-type-registry.ts
var { registerVariableType, getVariableType, getVariableTypes, hasVariableType } = createVariableTypeRegistry();
function getMenuActionsForVariable(variableType, context) {
  const typeOptions = getVariableType(variableType);
  if (typeOptions?.menuActionsFactory) {
    return typeOptions.menuActionsFactory(context);
  }
  return [];
}

// src/components/ui/delete-confirmation-dialog.tsx
import * as React2 from "react";
import { ConfirmationDialog } from "@elementor/editor-ui";
import { Typography as Typography2 } from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";
var DeleteConfirmationDialog = ({ open, label, closeDialog, onConfirm }) => {
  return /* @__PURE__ */ React2.createElement(ConfirmationDialog, { open, onClose: closeDialog }, /* @__PURE__ */ React2.createElement(ConfirmationDialog.Title, null, __4("Delete this variable?", "elementor")), /* @__PURE__ */ React2.createElement(ConfirmationDialog.Content, null, /* @__PURE__ */ React2.createElement(ConfirmationDialog.ContentText, null, __4("All elements using", "elementor"), "\xA0", /* @__PURE__ */ React2.createElement(Typography2, { variant: "subtitle2", component: "span", sx: { lineBreak: "anywhere" } }, label), "\xA0", __4("will keep their current values, but the variable itself will be removed.", "elementor"))), /* @__PURE__ */ React2.createElement(ConfirmationDialog.Actions, { onClose: closeDialog, onConfirm }));
};

// src/components/ui/empty-state.tsx
import * as React3 from "react";
import { Button, Stack as Stack2, Typography as Typography3 } from "@elementor/ui";
import { __ as __5 } from "@wordpress/i18n";

// src/hooks/use-permissions.ts
import { useCurrentUserCapabilities } from "@elementor/editor-current-user";
var usePermissions = () => {
  const { canUser, isAdmin } = useCurrentUserCapabilities();
  return {
    canAssign: () => canUser("edit_posts"),
    canUnlink: () => canUser("edit_posts"),
    canAdd: () => isAdmin,
    canDelete: () => isAdmin,
    canEdit: () => isAdmin,
    canRestore: () => isAdmin,
    canManageSettings: () => isAdmin
  };
};

// src/components/ui/empty-state.tsx
var EmptyState = ({ icon, title, message, onAdd, children }) => {
  const canAdd = usePermissions().canAdd();
  const displayTitle = canAdd ? title : __5("There are no variables", "elementor");
  const displayMessage = canAdd ? message : __5("With your current role, you can only connect and detach variables.", "elementor");
  return /* @__PURE__ */ React3.createElement(Content, { title: displayTitle, message: displayMessage, icon }, children || onAdd && /* @__PURE__ */ React3.createElement(Button, { variant: "outlined", color: "secondary", size: "small", onClick: onAdd }, __5("Create a variable", "elementor")));
};
function Content({ title, message, icon, children }) {
  return /* @__PURE__ */ React3.createElement(
    Stack2,
    {
      gap: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      height: "100%",
      color: "text.secondary",
      sx: { p: 2.5, pt: 8, pb: 5.5 }
    },
    icon,
    /* @__PURE__ */ React3.createElement(Typography3, { align: "center", variant: "subtitle2" }, title),
    /* @__PURE__ */ React3.createElement(Typography3, { align: "center", variant: "caption", maxWidth: "180px" }, message),
    children
  );
}

// src/components/ui/no-search-results.tsx
import * as React4 from "react";
import { Link, Stack as Stack3, Typography as Typography4 } from "@elementor/ui";
import { __ as __6 } from "@wordpress/i18n";
var NoSearchResults = ({ searchValue, onClear, icon }) => {
  return /* @__PURE__ */ React4.createElement(
    Stack3,
    {
      gap: 1,
      alignItems: "center",
      justifyContent: "center",
      p: 2.5,
      color: "text.secondary",
      sx: { pb: 3.5, pt: 8 }
    },
    icon,
    /* @__PURE__ */ React4.createElement(Typography4, { align: "center", variant: "subtitle2" }, __6("Sorry, nothing matched", "elementor"), /* @__PURE__ */ React4.createElement("br", null), "\u201C", searchValue, "\u201D."),
    /* @__PURE__ */ React4.createElement(Typography4, { align: "center", variant: "caption", sx: { display: "flex", flexDirection: "column" } }, __6("Try something else.", "elementor"), /* @__PURE__ */ React4.createElement(Link, { color: "text.secondary", variant: "caption", component: "button", onClick: onClear }, __6("Clear & try again", "elementor")))
  );
};

// src/components/variables-manager/hooks/use-auto-edit.ts
import { useCallback, useState } from "react";
var useAutoEdit = () => {
  const [autoEditVariableId, setAutoEditVariableId] = useState(void 0);
  const startAutoEdit = useCallback((variableId) => {
    setAutoEditVariableId(variableId);
  }, []);
  const handleAutoEditComplete = useCallback(() => {
    setTimeout(() => {
      setAutoEditVariableId(void 0);
    }, 100);
  }, []);
  return {
    autoEditVariableId,
    startAutoEdit,
    handleAutoEditComplete
  };
};

// src/components/variables-manager/hooks/use-error-navigation.ts
import { useCallback as useCallback2, useRef } from "react";
var useErrorNavigation = () => {
  const currentIndexRef = useRef(0);
  const createNavigationCallback = useCallback2(
    (ids, onNavigate, onComplete) => {
      return () => {
        if (!ids?.length) {
          return;
        }
        const currentIndex = currentIndexRef.current;
        const currentId = ids[currentIndex];
        if (currentId) {
          onNavigate(currentId);
          const nextIndex = currentIndex + 1;
          if (nextIndex >= ids.length) {
            onComplete();
            currentIndexRef.current = 0;
          } else {
            currentIndexRef.current = nextIndex;
          }
        }
      };
    },
    []
  );
  const resetNavigation = useCallback2(() => {
    currentIndexRef.current = 0;
  }, []);
  return {
    createNavigationCallback,
    resetNavigation
  };
};

// src/components/variables-manager/hooks/use-variables-manager-state.ts
import { useCallback as useCallback3, useState as useState2 } from "react";

// src/hooks/use-prop-variables.ts
import { useMemo } from "react";
import { useBoundProp } from "@elementor/editor-controls";

// src/context/variable-type-context.tsx
import * as React5 from "react";
import { createContext, useContext } from "react";
var VariableTypeContext = createContext(null);
function VariableTypeProvider({ children, propTypeKey }) {
  return /* @__PURE__ */ React5.createElement(VariableTypeContext.Provider, { value: propTypeKey }, children);
}
function useVariableType() {
  const context = useContext(VariableTypeContext);
  if (context === null) {
    throw new Error("useVariableType must be used within a VariableTypeProvider");
  }
  return getVariableType(context);
}

// src/utils/filter-by-search.ts
function filterBySearch(variables, searchValue) {
  const lowerSearchValue = searchValue.toLowerCase();
  return variables.filter((variable) => variable.label.toLowerCase().includes(lowerSearchValue));
}

// src/utils/variables-to-list.ts
var variablesToList = (variables) => {
  return Object.entries(variables).map(([key, variable]) => ({ key, ...variable }));
};
var toNormalizedVariable = ({
  key,
  label,
  value,
  order,
  sync_to_v3: syncToV3
}) => ({
  key,
  label,
  value,
  order,
  sync_to_v3: syncToV3
});
var applySelectionFilters = (variables, variableTypes) => {
  const grouped = {};
  variables.forEach((item) => (grouped[item.type] ??= []).push(item));
  return Object.entries(grouped).flatMap(([type, vars]) => {
    const filter = variableTypes[type]?.selectionFilter;
    const normalized = vars.map(toNormalizedVariable);
    return (filter?.(normalized) ?? normalized).map((v) => ({ ...v, type }));
  });
};

// src/hooks/use-prop-variables.ts
var getVariables = (includeDeleted = true) => {
  const variables = service.variables();
  if (includeDeleted) {
    return variables;
  }
  return Object.fromEntries(Object.entries(variables).filter(([, variable]) => !variable.deleted));
};
var hasVariable = (key) => {
  return getVariables()[key] !== void 0;
};
var useVariable = (key) => {
  const variables = getVariables();
  if (!variables?.[key]) {
    return null;
  }
  return {
    ...variables[key],
    key
  };
};
var useFilteredVariables = (searchValue, propTypeKey) => {
  const baseVariables = usePropVariables(propTypeKey);
  const typeFilteredVariables = useVariableSelectionFilter(baseVariables);
  const searchFilteredVariables = filterBySearch(typeFilteredVariables, searchValue);
  const sortedVariables = searchFilteredVariables.sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
  return {
    list: sortedVariables,
    hasMatches: searchFilteredVariables.length > 0,
    isSourceNotEmpty: typeFilteredVariables.length > 0,
    hasNoCompatibleVariables: baseVariables.length > 0 && typeFilteredVariables.length === 0
  };
};
var useVariableSelectionFilter = (variables) => {
  const { selectionFilter } = useVariableType();
  const { propType } = useBoundProp();
  return selectionFilter ? selectionFilter(variables, propType) : variables;
};
var usePropVariables = (propKey) => {
  return useMemo(() => normalizeVariables(propKey), [propKey]);
};
var getMatchingTypes = (propKey) => {
  const matchingTypes = [];
  const allTypes = getVariableTypes();
  const variableType = getVariableType(propKey);
  Object.entries(allTypes).forEach(([key, typeOptions]) => {
    if (variableType.variableType === typeOptions.variableType) {
      matchingTypes.push(key);
    }
  });
  return matchingTypes;
};
var normalizeVariables = (propKey) => {
  const variables = getVariables(false);
  const matchingTypes = getMatchingTypes(propKey);
  return variablesToList(variables).filter((variable) => matchingTypes.includes(variable.type)).map(toNormalizedVariable);
};
var extractId = ({ id: id2 }) => id2;
var createVariable = (newVariable) => {
  return service.create(newVariable).then(extractId);
};
var updateVariable = (updateId, { value, label, type }) => {
  return service.update(updateId, { value, label, type }).then(extractId);
};
var deleteVariable = (deleteId) => {
  return service.delete(deleteId).then(extractId);
};
var restoreVariable = (restoreId, label, value, type) => {
  return service.restore(restoreId, label, value, type).then(extractId);
};

// src/components/variables-manager/hooks/use-variables-manager-state.ts
var useVariablesManagerState = () => {
  const [variables, setVariables] = useState2(() => getVariables(false));
  const [deletedVariables, setDeletedVariables] = useState2([]);
  const [isSaveDisabled, setIsSaveDisabled] = useState2(false);
  const [isDirty, setIsDirty] = useState2(false);
  const [isSaving, setIsSaving] = useState2(false);
  const [searchValue, setSearchValue] = useState2("");
  const handleOnChange = useCallback3(
    (newVariables) => {
      setVariables({ ...variables, ...newVariables });
      setIsDirty(true);
    },
    [variables]
  );
  const createVariable2 = useCallback3((type, defaultName, defaultValue) => {
    const newId = generateTempId();
    const newVariable = {
      id: newId,
      label: defaultName.trim(),
      value: defaultValue.trim(),
      type
    };
    setVariables((prev) => ({ ...prev, [newId]: newVariable }));
    setIsDirty(true);
    return newId;
  }, []);
  const handleDeleteVariable = useCallback3((itemId) => {
    setDeletedVariables((prev) => [...prev, itemId]);
    setVariables((prev) => ({ ...prev, [itemId]: { ...prev[itemId], deleted: true } }));
    setIsDirty(true);
  }, []);
  const handleStartSync = useCallback3((itemId) => {
    setVariables((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], sync_to_v3: true }
    }));
    setIsDirty(true);
  }, []);
  const handleStopSync = useCallback3((itemId) => {
    setVariables((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], sync_to_v3: false }
    }));
    setIsDirty(true);
  }, []);
  const handleSearch = (searchTerm) => {
    setSearchValue(searchTerm);
  };
  const handleSave = useCallback3(async () => {
    const originalVariables = getVariables(false);
    setIsSaving(true);
    const result = await service.batchSave(originalVariables, variables, deletedVariables);
    if (result.success) {
      await service.load();
      const updatedVariables = service.variables();
      setVariables(updatedVariables);
      setDeletedVariables([]);
      setIsDirty(false);
    }
    return { success: result.success };
  }, [variables, deletedVariables]);
  const filteredVariables = useCallback3(() => {
    const list = variablesToList(variables).filter((v) => !v.deleted);
    const typeFiltered = applySelectionFilters(list, getVariableTypes());
    const searchFiltered = filterBySearch(typeFiltered, searchValue);
    return Object.fromEntries(searchFiltered.map(({ key, ...rest }) => [key, rest]));
  }, [variables, searchValue]);
  return {
    variables: filteredVariables(),
    deletedVariables,
    isDirty,
    isSaveDisabled,
    handleOnChange,
    createVariable: createVariable2,
    handleDeleteVariable,
    handleStartSync,
    handleStopSync,
    handleSave,
    isSaving,
    handleSearch,
    searchValue,
    setIsSaving,
    setIsSaveDisabled
  };
};

// src/components/variables-manager/variables-manager-create-menu.tsx
import * as React7 from "react";
import { createElement as createElement8, useMemo as useMemo2, useRef as useRef2 } from "react";
import { PlusIcon } from "@elementor/icons";
import { bindMenu, bindTrigger, IconButton, Menu, MenuItem, Typography as Typography5 } from "@elementor/ui";
import { capitalize as capitalize2 } from "@elementor/utils";
import { __ as __8 } from "@wordpress/i18n";

// src/hooks/use-quota-permissions.ts
var useQuotaPermissions = (variableType) => {
  const quotaConfig = {
    ...window.ElementorVariablesQuotaConfig ?? {},
    ...window.ElementorVariablesQuotaConfigExtended ?? {}
  };
  const hasLegacySupport = quotaConfig[variableType] === void 0 && window.elementorPro;
  const limit = quotaConfig[variableType] || 0;
  const hasPermission = hasLegacySupport || limit > 0;
  return {
    canAdd: () => hasPermission,
    canEdit: () => hasPermission
  };
};

// src/components/ui/variable-promotion-chip.tsx
import * as React6 from "react";
import { forwardRef, useImperativeHandle, useState as useState3 } from "react";
import { PromotionChip, PromotionPopover, useCanvasClickHandler } from "@elementor/editor-ui";
import { Box } from "@elementor/ui";
import { capitalize } from "@elementor/utils";
import { __ as __7, sprintf as sprintf2 } from "@wordpress/i18n";
var VariablePromotionChip = forwardRef(
  ({ variableType, upgradeUrl }, ref) => {
    const [isOpen, setIsOpen] = useState3(false);
    useCanvasClickHandler(isOpen, () => setIsOpen(false));
    const toggle = () => setIsOpen((prev) => !prev);
    useImperativeHandle(ref, () => ({ toggle }), []);
    const title = sprintf2(
      /* translators: %s: Variable Type. */
      __7("%s variables", "elementor"),
      capitalize(variableType)
    );
    const content = sprintf2(
      /* translators: %s: Variable Type. */
      __7("Upgrade to continue creating and editing %s variables.", "elementor"),
      variableType
    );
    return /* @__PURE__ */ React6.createElement(
      PromotionPopover,
      {
        open: isOpen,
        title,
        content,
        ctaText: __7("Upgrade now", "elementor"),
        ctaUrl: upgradeUrl,
        onClose: (e) => {
          e.stopPropagation();
          setIsOpen(false);
        }
      },
      /* @__PURE__ */ React6.createElement(
        Box,
        {
          onClick: (e) => {
            e.stopPropagation();
            toggle();
          },
          sx: { cursor: "pointer", display: "inline-flex" }
        },
        /* @__PURE__ */ React6.createElement(PromotionChip, null)
      )
    );
  }
);

// src/components/variables-manager/variables-manager-create-menu.tsx
var SIZE = "tiny";
var VariableManagerCreateMenu = ({ variables, onCreate, menuState }) => {
  const buttonRef = useRef2(null);
  const variableTypes = getVariableTypes();
  const menuOptionConfigs = useMemo2(
    () => Object.entries(variableTypes).filter(([, variable]) => !!variable.defaultValue).map(([key, variable]) => ({
      key,
      propTypeKey: variable.propTypeUtil.key,
      variableType: variable.variableType,
      defaultValue: variable.defaultValue || "",
      icon: variable.icon
    })),
    [variableTypes]
  );
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(
    IconButton,
    {
      ...bindTrigger(menuState),
      ref: buttonRef,
      size: SIZE,
      "aria-label": __8("Add variable", "elementor")
    },
    /* @__PURE__ */ React7.createElement(PlusIcon, { fontSize: SIZE })
  ), /* @__PURE__ */ React7.createElement(
    Menu,
    {
      disablePortal: true,
      MenuListProps: {
        dense: true
      },
      PaperProps: {
        elevation: 6
      },
      ...bindMenu(menuState),
      anchorEl: buttonRef.current,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right"
      },
      "data-testid": "variable-manager-create-menu"
    },
    menuOptionConfigs.map((config) => /* @__PURE__ */ React7.createElement(
      MenuOption,
      {
        key: config.key,
        config,
        variables,
        onCreate,
        onClose: menuState.close
      }
    ))
  ));
};
var MenuOption = ({
  config,
  variables,
  onCreate,
  onClose
}) => {
  const promotionRef = useRef2(null);
  const userQuotaPermissions = useQuotaPermissions(config.propTypeKey);
  const displayName = capitalize2(config.variableType);
  const isDisabled = !userQuotaPermissions.canAdd();
  const handleClick = () => {
    if (isDisabled) {
      promotionRef.current?.toggle();
      return;
    }
    const defaultName = getDefaultName(variables, config.variableType);
    onCreate(config.key, defaultName, config.defaultValue);
    trackVariablesManagerEvent({ action: "add", varType: config.variableType });
    onClose();
  };
  return /* @__PURE__ */ React7.createElement(MenuItem, { onClick: handleClick, sx: { gap: 1.5, cursor: "pointer" } }, createElement8(config.icon, { fontSize: SIZE, color: isDisabled ? "disabled" : "action" }), /* @__PURE__ */ React7.createElement(Typography5, { variant: "caption", color: isDisabled ? "text.disabled" : "text.primary" }, displayName), isDisabled && /* @__PURE__ */ React7.createElement(
    VariablePromotionChip,
    {
      variableType: config.variableType,
      upgradeUrl: `https://go.elementor.com/go-pro-manager-${config.variableType}-variable/`,
      ref: promotionRef
    }
  ));
};
var getDefaultName = (variables, baseName) => {
  const pattern = new RegExp(`^${baseName}-(\\d+)$`, "i");
  let counter = 1;
  Object.values(variables).forEach((variable) => {
    if (pattern.test(variable.label)) {
      counter = Math.max(counter, parseInt(variable.label.match(pattern)?.[1] ?? "0", 10) + 1);
    }
  });
  return `${baseName}-${counter}`;
};

// src/components/variables-manager/variables-manager-table.tsx
import * as React13 from "react";
import { useEffect as useEffect2, useRef as useRef6 } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow as TableRow2,
  UnstableSortableItem,
  UnstableSortableProvider
} from "@elementor/ui";
import { __ as __9 } from "@wordpress/i18n";

// src/components/variables-manager/ui/variable-table-cell.tsx
import * as React8 from "react";
import { TableCell } from "@elementor/ui";
var VariableTableCell = ({
  children,
  isHeader,
  width,
  maxWidth,
  align,
  noPadding,
  sx
}) => {
  const baseSx = {
    maxWidth: maxWidth ?? 150,
    cursor: "initial",
    typography: "caption",
    ...isHeader && { color: "text.primary", fontWeight: "bold" },
    ...isHeader && !noPadding && { padding: "10px 16px" },
    ...width && { width },
    ...sx
  };
  return /* @__PURE__ */ React8.createElement(TableCell, { size: "small", padding: noPadding ? "none" : void 0, align, sx: baseSx }, children);
};

// src/components/variables-manager/ui/variable-table-row.tsx
import * as React12 from "react";
import { createElement as createElement15, useRef as useRef5 } from "react";
import { EllipsisWithTooltip } from "@elementor/editor-ui";
import { GripVerticalIcon } from "@elementor/icons";
import { IconButton as IconButton3, Stack as Stack5, TableRow } from "@elementor/ui";

// src/components/fields/label-field.tsx
import * as React9 from "react";
import { useRef as useRef3, useState as useState4 } from "react";
import { WarningInfotip } from "@elementor/editor-ui";
import { TextField } from "@elementor/ui";
function isLabelEqual(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
var useLabelError = (initialError) => {
  const [error, setError] = useState4(initialError ?? { value: "", message: "" });
  return {
    labelFieldError: error,
    setLabelFieldError: setError
  };
};
var LabelField = ({
  value,
  error,
  onChange,
  id: id2,
  onErrorChange,
  size = "tiny",
  focusOnShow = false,
  selectOnShow = false,
  showWarningInfotip = false,
  variables,
  onKeyDown
}) => {
  const [label, setLabel] = useState4(value);
  const [errorMessage, setErrorMessage] = useState4("");
  const fieldRef = useRef3(null);
  const handleChange = (newValue) => {
    setLabel(newValue);
    const errorMsg2 = validateLabel(newValue, variables);
    setErrorMessage(errorMsg2);
    onErrorChange?.(errorMsg2);
    onChange(isLabelEqual(newValue, error?.value ?? "") || errorMsg2 ? "" : newValue);
  };
  let errorMsg = errorMessage;
  if (isLabelEqual(label, error?.value ?? "") && error?.message) {
    errorMsg = error.message;
  }
  const hintMsg = !errorMsg ? labelHint(label) : "";
  const textField = /* @__PURE__ */ React9.createElement(
    TextField,
    {
      ref: fieldRef,
      id: id2,
      size,
      fullWidth: true,
      value: label,
      error: !!errorMsg,
      onChange: (e) => handleChange(e.target.value),
      inputProps: {
        maxLength: VARIABLE_LABEL_MAX_LENGTH,
        ...selectOnShow && { onFocus: (e) => e.target.select() },
        "aria-label": "Name",
        onKeyDown
      },
      autoFocus: focusOnShow
    }
  );
  if (showWarningInfotip) {
    const tooltipWidth = Math.max(240, fieldRef.current?.getBoundingClientRect().width ?? 240);
    return /* @__PURE__ */ React9.createElement(
      WarningInfotip,
      {
        open: Boolean(errorMsg || hintMsg),
        text: errorMsg || hintMsg,
        placement: "bottom-start",
        width: tooltipWidth,
        offset: [0, -15],
        ...hintMsg && { hasError: false }
      },
      textField
    );
  }
  return textField;
};

// src/components/variables-manager/variable-editable-cell.tsx
import * as React10 from "react";
import { useCallback as useCallback4, useEffect, useRef as useRef4, useState as useState5 } from "react";
import { ClickAwayListener, Stack as Stack4 } from "@elementor/ui";
var VariableEditableCell = React10.memo(
  ({
    initialValue,
    children,
    editableElement,
    onChange,
    prefixElement,
    autoEdit = false,
    onRowRef,
    onAutoEditComplete,
    gap = 1,
    fieldType,
    disabled = false
  }) => {
    const [value, setValue] = useState5(initialValue);
    const [isEditing, setIsEditing] = useState5(false);
    const { labelFieldError, setLabelFieldError } = useLabelError();
    const [valueFieldError, setValueFieldError] = useState5("");
    const rowRef = useRef4(null);
    const handleSave = useCallback4(() => {
      const hasError = fieldType === "label" && labelFieldError?.message || fieldType === "value" && valueFieldError;
      if (!hasError) {
        onChange(value);
      }
      setIsEditing(false);
    }, [value, onChange, fieldType, labelFieldError, valueFieldError]);
    useEffect(() => {
      onRowRef?.(rowRef?.current);
    }, [onRowRef]);
    useEffect(() => {
      if (autoEdit && !isEditing && !disabled) {
        setIsEditing(true);
        onAutoEditComplete?.();
      }
    }, [autoEdit, isEditing, onAutoEditComplete, disabled]);
    const handleDoubleClick = () => {
      if (disabled) {
        return;
      }
      setIsEditing(true);
    };
    const handleKeyDown = (event) => {
      if (disabled) {
        return;
      }
      if (event.key === "Enter") {
        handleSave();
      } else if (event.key === "Escape") {
        setIsEditing(false);
      }
      if (event.key === " " && !isEditing) {
        event.preventDefault();
        setIsEditing(true);
      }
    };
    const handleChange = useCallback4((newValue) => {
      setValue(newValue);
    }, []);
    const handleValidationChange = useCallback4(
      (errorMsg) => {
        if (fieldType === "label") {
          setLabelFieldError({
            value,
            message: errorMsg
          });
        } else {
          setValueFieldError(errorMsg);
        }
      },
      [fieldType, value, setLabelFieldError, setValueFieldError]
    );
    let currentError;
    if (fieldType === "label") {
      currentError = labelFieldError;
    } else if (fieldType === "value") {
      currentError = { value, message: valueFieldError };
    }
    const editableContent = editableElement({
      value,
      onChange: handleChange,
      onValidationChange: handleValidationChange,
      error: currentError
    });
    if (isEditing) {
      return /* @__PURE__ */ React10.createElement(ClickAwayListener, { onClickAway: handleSave }, /* @__PURE__ */ React10.createElement(
        Stack4,
        {
          ref: rowRef,
          direction: "row",
          alignItems: "center",
          gap,
          onDoubleClick: handleDoubleClick,
          onKeyDown: handleKeyDown,
          tabIndex: 0,
          role: "button",
          "aria-label": "Double click or press Space to edit"
        },
        prefixElement,
        editableContent
      ));
    }
    return /* @__PURE__ */ React10.createElement(
      Stack4,
      {
        ref: rowRef,
        direction: "row",
        alignItems: "center",
        gap,
        onDoubleClick: handleDoubleClick,
        onKeyDown: handleKeyDown,
        tabIndex: disabled ? -1 : 0,
        role: "button",
        "aria-label": disabled ? "" : "Double click or press Space to edit"
      },
      prefixElement,
      children
    );
  }
);

// src/components/variables-manager/ui/variable-edit-menu.tsx
import * as React11 from "react";
import { createElement as createElement13 } from "react";
import { DotsVerticalIcon } from "@elementor/icons";
import { bindMenu as bindMenu2, bindTrigger as bindTrigger2, IconButton as IconButton2, Menu as Menu2, MenuItem as MenuItem2, usePopupState } from "@elementor/ui";
var VariableEditMenu = ({ menuActions, disabled, itemId }) => {
  const menuState = usePopupState({
    variant: "popover"
  });
  const triggerProps = bindTrigger2(menuState);
  return /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement(
    IconButton2,
    {
      ...triggerProps,
      disabled,
      size: "tiny",
      onClick: (e) => {
        e.stopPropagation();
        triggerProps.onClick?.(e);
      }
    },
    /* @__PURE__ */ React11.createElement(DotsVerticalIcon, { fontSize: "tiny" })
  ), /* @__PURE__ */ React11.createElement(
    Menu2,
    {
      disablePortal: true,
      MenuListProps: {
        dense: true
      },
      PaperProps: {
        elevation: 6
      },
      ...bindMenu2(menuState),
      anchorEl: menuState.anchorEl,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right"
      },
      open: menuState.isOpen,
      onClose: menuState.close
    },
    menuActions.map((action) => /* @__PURE__ */ React11.createElement(
      MenuItem2,
      {
        key: action.name,
        onClick: (e) => {
          e.stopPropagation();
          action.onClick?.(itemId);
          menuState.close();
        },
        sx: {
          color: action.color,
          gap: 1
        }
      },
      action.icon && createElement13(action.icon, {
        fontSize: "inherit"
      }),
      " ",
      action.name
    ))
  ));
};

// src/components/variables-manager/ui/variable-table-row.tsx
var VariableRow = (props) => {
  const {
    row,
    variables,
    handleOnChange,
    autoEditVariableId,
    onAutoEditComplete,
    onFieldError,
    menuActions,
    handleRowRef,
    itemProps,
    showDropIndication,
    triggerProps,
    itemStyle,
    triggerStyle,
    isDragged,
    dropPosition,
    setTriggerRef,
    isSorting
  } = props;
  const promotionRef = useRef5(null);
  const isDisabled = !useQuotaPermissions(row.type).canEdit();
  const showIndicationBefore = showDropIndication && dropPosition === "before";
  const showIndicationAfter = showDropIndication && dropPosition === "after";
  return /* @__PURE__ */ React12.createElement(
    TableRow,
    {
      ...itemProps,
      ref: itemProps.ref,
      selected: isDragged,
      sx: {
        ...isDisabled && {
          "& td, & th": {
            color: "text.disabled"
          }
        },
        ...showIndicationBefore && {
          "& td, & th": {
            borderTop: "2px solid",
            borderTopColor: "primary.main"
          }
        },
        ...showIndicationAfter && {
          "& td, & th": {
            borderBottom: "2px solid",
            borderBottomColor: "primary.main"
          }
        },
        "&:hover, &:focus-within": {
          backgroundColor: "action.hover",
          '& [role="toolbar"], & [draggable]': {
            opacity: 1
          }
        },
        '& [role="toolbar"], & [draggable]': {
          opacity: 0
        }
      },
      style: { ...itemStyle, ...triggerStyle },
      onClick: () => {
        if (isDisabled) {
          promotionRef.current?.toggle();
        }
      }
    },
    /* @__PURE__ */ React12.createElement(VariableTableCell, { noPadding: true, width: 10, maxWidth: 10 }, /* @__PURE__ */ React12.createElement(IconButton3, { size: "small", ref: setTriggerRef, ...triggerProps, disabled: isSorting, draggable: true }, /* @__PURE__ */ React12.createElement(GripVerticalIcon, { fontSize: "inherit" }))),
    /* @__PURE__ */ React12.createElement(VariableTableCell, null, /* @__PURE__ */ React12.createElement(
      VariableEditableCell,
      {
        initialValue: row.name,
        onChange: (value) => {
          if (value !== row.name && !isDisabled) {
            handleOnChange({
              ...variables,
              [row.id]: { ...variables[row.id], label: value }
            });
          }
        },
        prefixElement: createElement15(row.icon, {
          fontSize: "inherit",
          color: isDisabled ? "disabled" : "inherit"
        }),
        editableElement: ({ value, onChange, onValidationChange, error }) => /* @__PURE__ */ React12.createElement(
          LabelField,
          {
            id: "variable-label-" + row.id,
            size: "tiny",
            value,
            onChange,
            onErrorChange: (errorMsg) => {
              onValidationChange?.(errorMsg);
              onFieldError?.(!!errorMsg);
            },
            error,
            focusOnShow: true,
            selectOnShow: autoEditVariableId === row.id,
            showWarningInfotip: true,
            variables
          }
        ),
        autoEdit: autoEditVariableId === row.id && !isDisabled,
        onRowRef: handleRowRef(row.id),
        onAutoEditComplete: autoEditVariableId === row.id ? onAutoEditComplete : void 0,
        fieldType: "label",
        disabled: isDisabled
      },
      /* @__PURE__ */ React12.createElement(EllipsisWithTooltip, { title: row.name, sx: { border: "4px solid transparent" } }, row.name)
    )),
    /* @__PURE__ */ React12.createElement(VariableTableCell, null, /* @__PURE__ */ React12.createElement(
      VariableEditableCell,
      {
        initialValue: row.value,
        onChange: (value) => {
          if (value !== row.value && !isDisabled) {
            handleOnChange({
              ...variables,
              [row.id]: { ...variables[row.id], value }
            });
          }
        },
        editableElement: ({ value, onChange, onValidationChange, error }) => row.valueField?.({
          value,
          onChange,
          onPropTypeKeyChange: (type) => {
            if (!isDisabled) {
              handleOnChange({
                ...variables,
                [row.id]: { ...variables[row.id], type }
              });
            }
          },
          propTypeKey: row.type,
          onValidationChange: (errorMsg) => {
            onValidationChange?.(errorMsg);
            onFieldError?.(!!errorMsg);
          },
          error
        }) ?? /* @__PURE__ */ React12.createElement(React12.Fragment, null),
        onRowRef: handleRowRef(row.id),
        gap: 0.25,
        fieldType: "value",
        disabled: isDisabled
      },
      row.startIcon && row.startIcon({ value: row.value }),
      /* @__PURE__ */ React12.createElement(
        EllipsisWithTooltip,
        {
          title: row.value,
          sx: {
            border: "4px solid transparent",
            lineHeight: "1",
            pt: 0.25
          }
        },
        row.value
      )
    )),
    /* @__PURE__ */ React12.createElement(VariableTableCell, { align: "right", noPadding: true, width: 16, maxWidth: 16, sx: { paddingInlineEnd: 1 } }, /* @__PURE__ */ React12.createElement(Stack5, { role: "toolbar", direction: "row", justifyContent: "flex-end", alignItems: "center" }, isDisabled && /* @__PURE__ */ React12.createElement(
      VariablePromotionChip,
      {
        variableType: row.variableType,
        upgradeUrl: `https://go.elementor.com/renew-license-manager-${row.variableType}-variable`,
        ref: promotionRef
      }
    ), /* @__PURE__ */ React12.createElement(VariableEditMenu, { menuActions: menuActions(row.id), disabled: isSorting, itemId: row.id })))
  );
};

// src/components/variables-manager/variables-manager-table.tsx
var VariablesManagerTable = ({
  menuActions,
  variables,
  onChange: handleOnChange,
  autoEditVariableId,
  onAutoEditComplete,
  onFieldError
}) => {
  const tableContainerRef = useRef6(null);
  const variableRowRefs = useRef6(/* @__PURE__ */ new Map());
  useEffect2(() => {
    if (autoEditVariableId && tableContainerRef.current) {
      const rowElement = variableRowRefs.current.get(autoEditVariableId);
      if (rowElement) {
        setTimeout(() => {
          rowElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
          });
        }, 100);
      }
    }
  }, [autoEditVariableId]);
  const handleRowRef = (id2) => (ref) => {
    if (ref) {
      variableRowRefs.current.set(id2, ref);
    } else {
      variableRowRefs.current.delete(id2);
    }
  };
  const ids = Object.keys(variables).sort(sortVariablesOrder(variables));
  const rows = ids.map((id2) => {
    const variable = variables[id2];
    const variableType = getVariableType(variable.type);
    if (!variableType) {
      return null;
    }
    return {
      id: id2,
      type: variable.type,
      name: variable.label,
      value: variable.value,
      ...variableType
    };
  }).filter(Boolean);
  const tableSX = {
    minWidth: 250,
    tableLayout: "fixed"
  };
  const handleReorder = (newIds) => {
    const updatedVariables = { ...variables };
    newIds.forEach((id2, index) => {
      const current = updatedVariables[id2];
      if (!current) {
        return;
      }
      updatedVariables[id2] = Object.assign({}, current, { order: index + 1 });
    });
    handleOnChange(updatedVariables);
  };
  return /* @__PURE__ */ React13.createElement(TableContainer, { ref: tableContainerRef, sx: { overflow: "initial" } }, /* @__PURE__ */ React13.createElement(Table, { sx: tableSX, "aria-label": "Variables manager list with drag and drop reordering", stickyHeader: true }, /* @__PURE__ */ React13.createElement(TableHead, null, /* @__PURE__ */ React13.createElement(TableRow2, null, /* @__PURE__ */ React13.createElement(VariableTableCell, { isHeader: true, noPadding: true, width: 10, maxWidth: 10 }), /* @__PURE__ */ React13.createElement(VariableTableCell, { isHeader: true }, __9("Name", "elementor")), /* @__PURE__ */ React13.createElement(VariableTableCell, { isHeader: true }, __9("Value", "elementor")), /* @__PURE__ */ React13.createElement(VariableTableCell, { isHeader: true, noPadding: true, width: 16, maxWidth: 16 }))), /* @__PURE__ */ React13.createElement(TableBody, null, /* @__PURE__ */ React13.createElement(
    UnstableSortableProvider,
    {
      value: ids,
      onChange: handleReorder,
      variant: "static",
      restrictAxis: true,
      dragOverlay: ({ children: dragOverlayChildren, ...dragOverlayProps }) => /* @__PURE__ */ React13.createElement(Table, { sx: tableSX, ...dragOverlayProps }, /* @__PURE__ */ React13.createElement(TableBody, null, dragOverlayChildren))
    },
    rows.map((row) => /* @__PURE__ */ React13.createElement(
      UnstableSortableItem,
      {
        key: row.id,
        id: row.id,
        render: (props) => /* @__PURE__ */ React13.createElement(
          VariableRow,
          {
            ...props,
            row,
            variables,
            handleOnChange,
            autoEditVariableId,
            onAutoEditComplete,
            onFieldError,
            menuActions,
            handleRowRef
          }
        )
      }
    ))
  ))));
};
function sortVariablesOrder(variables) {
  return (a, b) => {
    const orderA = variables[a]?.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = variables[b]?.order ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  };
}

// src/components/variables-manager/variables-manager-panel.tsx
var id = "variables-manager";
var STOP_SYNC_MESSAGE_KEY = "stop-sync-variable";
var { panel, usePanelActions } = createPanel({
  id,
  component: VariablesManagerPanel,
  allowedEditModes: ["edit", id],
  onOpen: () => {
    changeEditMode(id);
  },
  onClose: async () => {
    changeEditMode("edit");
  },
  isOpenPreviousElement: true
});
function VariablesManagerPanel() {
  const { close: closePanel } = usePanelActions();
  const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();
  const [isStopSyncSuppressed] = useSuppressedMessage(STOP_SYNC_MESSAGE_KEY);
  const createMenuState = usePopupState2({
    variant: "popover"
  });
  const {
    variables,
    isDirty,
    searchValue,
    isSaveDisabled,
    handleOnChange,
    createVariable: createVariable2,
    handleDeleteVariable,
    handleStartSync,
    handleStopSync,
    handleSave,
    isSaving,
    handleSearch,
    setIsSaving,
    setIsSaveDisabled
  } = useVariablesManagerState();
  const { autoEditVariableId, startAutoEdit, handleAutoEditComplete } = useAutoEdit();
  const { createNavigationCallback, resetNavigation } = useErrorNavigation();
  const [deleteConfirmation, setDeleteConfirmation] = useState6(null);
  const [stopSyncConfirmation, setStopSyncConfirmation] = useState6(null);
  const [serverError, setServerError] = useState6(null);
  usePreventUnload(isDirty);
  const handleClosePanel = () => {
    if (isDirty) {
      openSaveChangesDialog();
      return;
    }
    closePanel();
  };
  const handleCreateVariable = useCallback5(
    (type, defaultName, defaultValue) => {
      const newId = createVariable2(type, defaultName, defaultValue);
      if (newId) {
        startAutoEdit(newId);
      }
    },
    [createVariable2, startAutoEdit]
  );
  const handleSaveClick = async () => {
    try {
      setServerError(null);
      resetNavigation();
      const result = await handleSave();
      trackVariablesManagerEvent({ action: "saveChanges" });
      return result;
    } catch (error) {
      const mappedError = mapServerError(error);
      const duplicatedIds = mappedError?.action?.data?.duplicatedIds;
      if (mappedError && "label" === mappedError.field) {
        if (duplicatedIds && mappedError.action) {
          mappedError.action.callback = createNavigationCallback(duplicatedIds, startAutoEdit, () => {
            setIsSaveDisabled(false);
          });
        }
        setServerError(mappedError);
        setIsSaveDisabled(true);
        resetNavigation();
      }
      return { success: false, error: mappedError };
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteVariableWithConfirmation = useCallback5(
    (itemId) => {
      handleDeleteVariable(itemId);
      setDeleteConfirmation(null);
    },
    [handleDeleteVariable]
  );
  const handleStopSyncWithConfirmation = useCallback5(
    (itemId) => {
      handleStopSync(itemId);
      setStopSyncConfirmation(null);
    },
    [handleStopSync]
  );
  const handleShowStopSyncDialog = useCallback5(
    (itemId) => {
      if (!isStopSyncSuppressed) {
        setStopSyncConfirmation(itemId);
      } else {
        handleStopSync(itemId);
      }
    },
    [isStopSyncSuppressed, handleStopSync]
  );
  const buildMenuActions = useCallback5(
    (variableId) => {
      const variable = variables[variableId];
      if (!variable) {
        return [];
      }
      const typeActions = getMenuActionsForVariable(variable.type, {
        variable,
        variableId,
        handlers: {
          onStartSync: handleStartSync,
          onStopSync: handleShowStopSyncDialog
        }
      });
      const deleteAction = {
        name: __10("Delete", "elementor"),
        icon: TrashIcon,
        color: "error.main",
        onClick: (itemId) => {
          const v = variables[itemId];
          if (v) {
            setDeleteConfirmation({ id: itemId, label: v.label });
            const variableTypeOptions = getVariableType(v.type);
            trackVariablesManagerEvent({ action: "delete", varType: variableTypeOptions?.variableType });
          }
        }
      };
      return [...typeActions, deleteAction];
    },
    [variables, handleStartSync, handleShowStopSyncDialog]
  );
  const hasVariables = Object.keys(variables).length > 0;
  return /* @__PURE__ */ React14.createElement(ThemeProvider, null, /* @__PURE__ */ React14.createElement(Panel, null, /* @__PURE__ */ React14.createElement(
    PanelHeader,
    {
      sx: {
        height: "unset"
      }
    },
    /* @__PURE__ */ React14.createElement(Stack6, { width: "100%", direction: "column", alignItems: "center" }, /* @__PURE__ */ React14.createElement(Stack6, { p: 1, pl: 2, width: "100%", direction: "row", alignItems: "center" }, /* @__PURE__ */ React14.createElement(Stack6, { width: "100%", direction: "row", gap: 1 }, /* @__PURE__ */ React14.createElement(PanelHeaderTitle, { sx: { display: "flex", alignItems: "center", gap: 0.5 } }, /* @__PURE__ */ React14.createElement(ColorFilterIcon, { fontSize: "inherit" }), __10("Variables Manager", "elementor"))), /* @__PURE__ */ React14.createElement(Stack6, { direction: "row", gap: 0.5, alignItems: "center" }, /* @__PURE__ */ React14.createElement(
      VariableManagerCreateMenu,
      {
        onCreate: handleCreateVariable,
        variables,
        menuState: createMenuState
      }
    ), /* @__PURE__ */ React14.createElement(
      CloseButton,
      {
        "aria-label": "Close",
        slotProps: { icon: { fontSize: SIZE } },
        onClick: () => {
          handleClosePanel();
        }
      }
    ))), /* @__PURE__ */ React14.createElement(Stack6, { width: "100%", direction: "row", gap: 1 }, /* @__PURE__ */ React14.createElement(
      SearchField,
      {
        sx: {
          display: "flex",
          flex: 1
        },
        placeholder: __10("Search", "elementor"),
        value: searchValue,
        onSearch: handleSearch
      }
    )), /* @__PURE__ */ React14.createElement(Divider, { sx: { width: "100%" } }))
  ), /* @__PURE__ */ React14.createElement(
    PanelBody,
    {
      sx: {
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }
    },
    hasVariables && /* @__PURE__ */ React14.createElement(
      VariablesManagerTable,
      {
        menuActions: buildMenuActions,
        variables,
        onChange: handleOnChange,
        autoEditVariableId,
        onAutoEditComplete: handleAutoEditComplete,
        onFieldError: setIsSaveDisabled
      }
    ),
    !hasVariables && searchValue && /* @__PURE__ */ React14.createElement(
      NoSearchResults,
      {
        searchValue,
        onClear: () => handleSearch(""),
        icon: /* @__PURE__ */ React14.createElement(ColorFilterIcon, { fontSize: "large" })
      }
    ),
    !hasVariables && !searchValue && /* @__PURE__ */ React14.createElement(
      EmptyState,
      {
        title: __10("Create your first variable", "elementor"),
        message: __10(
          "Variables are saved attributes that you can apply anywhere on your site.",
          "elementor"
        ),
        icon: /* @__PURE__ */ React14.createElement(ColorFilterIcon, { fontSize: "large" }),
        onAdd: createMenuState.open
      }
    )
  ), /* @__PURE__ */ React14.createElement(PanelFooter, null, /* @__PURE__ */ React14.createElement(
    Infotip,
    {
      placement: "right",
      open: !!serverError,
      content: serverError ? /* @__PURE__ */ React14.createElement(
        Alert,
        {
          severity: serverError.severity ?? "error",
          action: serverError.action?.label ? /* @__PURE__ */ React14.createElement(AlertAction, { onClick: serverError.action.callback }, serverError.action.label) : void 0,
          onClose: !serverError.action?.label ? () => {
            setServerError(null);
            setIsSaveDisabled(false);
          } : void 0,
          icon: serverError.IconComponent ? /* @__PURE__ */ React14.createElement(serverError.IconComponent, null) : /* @__PURE__ */ React14.createElement(AlertTriangleFilledIcon2, null)
        },
        /* @__PURE__ */ React14.createElement(AlertTitle, null, serverError.message),
        serverError.action?.message
      ) : null,
      arrow: false,
      slotProps: {
        popper: {
          modifiers: [
            {
              name: "offset",
              options: { offset: [-10, 10] }
            }
          ]
        }
      }
    },
    /* @__PURE__ */ React14.createElement(
      Button2,
      {
        fullWidth: true,
        size: "small",
        color: "global",
        variant: "contained",
        disabled: isSaveDisabled || !isDirty || isSaving,
        onClick: handleSaveClick,
        loading: isSaving
      },
      __10("Save changes", "elementor")
    )
  ))), deleteConfirmation && /* @__PURE__ */ React14.createElement(
    DeleteConfirmationDialog,
    {
      open: true,
      label: deleteConfirmation.label,
      onConfirm: () => handleDeleteVariableWithConfirmation(deleteConfirmation.id),
      closeDialog: () => setDeleteConfirmation(null)
    }
  ), stopSyncConfirmation && /* @__PURE__ */ React14.createElement(
    StopSyncConfirmationDialog,
    {
      open: true,
      onClose: () => setStopSyncConfirmation(null),
      onConfirm: () => handleStopSyncWithConfirmation(stopSyncConfirmation)
    }
  ), isSaveChangesDialogOpen && /* @__PURE__ */ React14.createElement(SaveChangesDialog, null, /* @__PURE__ */ React14.createElement(SaveChangesDialog.Title, { onClose: closeSaveChangesDialog }, __10("You have unsaved changes", "elementor")), /* @__PURE__ */ React14.createElement(SaveChangesDialog.Content, null, /* @__PURE__ */ React14.createElement(SaveChangesDialog.ContentText, null, __10("To avoid losing your updates, save your changes before leaving.", "elementor"))), /* @__PURE__ */ React14.createElement(
    SaveChangesDialog.Actions,
    {
      actions: {
        discard: {
          label: __10("Discard", "elementor"),
          action: () => {
            closeSaveChangesDialog();
            closePanel();
          }
        },
        confirm: {
          label: __10("Save", "elementor"),
          action: async () => {
            const result = await handleSaveClick();
            closeSaveChangesDialog();
            if (result?.success) {
              closePanel();
            }
          }
        }
      }
    }
  )));
}
var usePreventUnload = (isDirty) => {
  useEffect3(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);
};
var StopSyncConfirmationDialog = ({ open, onClose, onConfirm }) => {
  const [, suppressStopSyncMessage] = useSuppressedMessage(STOP_SYNC_MESSAGE_KEY);
  return /* @__PURE__ */ React14.createElement(ConfirmationDialog2, { open, onClose }, /* @__PURE__ */ React14.createElement(ConfirmationDialog2.Title, { icon: ColorFilterIcon, iconColor: "primary" }, __10("Stop syncing variable color", "elementor")), /* @__PURE__ */ React14.createElement(ConfirmationDialog2.Content, null, /* @__PURE__ */ React14.createElement(ConfirmationDialog2.ContentText, null, __10(
    "This will disconnect the variable color from version 3. Existing uses on your site will automatically switch to a default color.",
    "elementor"
  ))), /* @__PURE__ */ React14.createElement(
    ConfirmationDialog2.Actions,
    {
      onClose,
      onConfirm,
      cancelLabel: __10("Cancel", "elementor"),
      confirmLabel: __10("Got it", "elementor"),
      color: "primary",
      onSuppressMessage: suppressStopSyncMessage,
      suppressLabel: __10("Don't show again", "elementor")
    }
  ));
};

// src/components/open-panel-from-url.tsx
var ACTIVE_PANEL_PARAM = "active-panel";
var PANEL_ID = "variables-manager";
var DEFAULT_PANEL_ROUTE = "panel/elements";
function OpenPanelFromUrl() {
  const { open } = usePanelActions();
  const hasOpened = useRef7(false);
  useEffect4(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activePanel = urlParams.get(ACTIVE_PANEL_PARAM);
    if (activePanel !== PANEL_ID) {
      return;
    }
    const cleanup = listenTo(routeOpenEvent(DEFAULT_PANEL_ROUTE), () => {
      if (hasOpened.current) {
        return;
      }
      hasOpened.current = true;
      requestAnimationFrame(() => {
        open();
      });
    });
    return cleanup;
  }, [open]);
  return null;
}

// src/controls/variable-control.tsx
import * as React33 from "react";
import { useBoundProp as useBoundProp11 } from "@elementor/editor-controls";

// src/components/ui/variable/assigned-variable.tsx
import { useId, useRef as useRef8 } from "react";
import * as React24 from "react";
import { useBoundProp as useBoundProp6 } from "@elementor/editor-controls";
import { ColorFilterIcon as ColorFilterIcon3 } from "@elementor/icons";
import { bindPopover, bindTrigger as bindTrigger3, Box as Box5, Popover, usePopupState as usePopupState3 } from "@elementor/ui";

// src/utils/unlink-variable.ts
function transformValueBeforeUnlink(variable, propTypeKey) {
  const { valueTransformer } = getVariableType(propTypeKey);
  if (valueTransformer) {
    return valueTransformer(variable.value, variable.type);
  }
  return variable.value;
}
function createUnlinkHandler(variable, propTypeKey, setValue) {
  return () => {
    const { fallbackPropTypeUtil } = getVariableType(propTypeKey);
    const transformedValue = transformValueBeforeUnlink(variable, propTypeKey);
    setValue(fallbackPropTypeUtil.create(transformedValue));
  };
}

// src/components/variable-selection-popover.tsx
import * as React22 from "react";
import { useState as useState12 } from "react";
import { isExperimentActive } from "@elementor/editor-v1-adapters";

// src/context/variable-selection-popover.context.tsx
import * as React15 from "react";
import { createContext as createContext2, useContext as useContext2, useState as useState7 } from "react";
import { Box as Box2 } from "@elementor/ui";
var PopoverContentRefContext = createContext2(null);
var PopoverContentRefContextProvider = ({ children }) => {
  const [anchorRef, setAnchorRef] = useState7(null);
  return /* @__PURE__ */ React15.createElement(PopoverContentRefContext.Provider, { value: anchorRef }, /* @__PURE__ */ React15.createElement(Box2, { ref: setAnchorRef }, children));
};
var usePopoverContentRef = () => {
  return useContext2(PopoverContentRefContext);
};

// src/components/variable-creation.tsx
import * as React17 from "react";
import { useState as useState8 } from "react";
import { PopoverContent, useBoundProp as useBoundProp4 } from "@elementor/editor-controls";
import { PopoverHeader, SectionPopoverBody } from "@elementor/editor-ui";
import { ArrowLeftIcon } from "@elementor/icons";
import { Button as Button3, CardActions, Divider as Divider2, FormHelperText as FormHelperText2, IconButton as IconButton4, Typography as Typography6 } from "@elementor/ui";
import { __ as __11 } from "@wordpress/i18n";

// src/hooks/use-initial-value.ts
import { useBoundProp as useBoundProp2 } from "@elementor/editor-controls";
var useInitialValue = () => {
  const { value: initial } = useBoundProp2();
  const hasAssignedVariable = hasVariableType(initial?.$$type) && Boolean(initial?.value);
  const variable = useVariable(hasAssignedVariable ? initial.value : "");
  if (hasAssignedVariable) {
    return variable ? variable.value : "";
  }
  return initial?.value ?? "";
};

// src/hooks/use-variable-bound-prop.ts
import { useBoundProp as useBoundProp3 } from "@elementor/editor-controls";
import { isTransformable } from "@elementor/editor-props";
var useVariableBoundProp = () => {
  const { propTypeUtil } = useVariableType();
  const boundProp = useBoundProp3(propTypeUtil);
  return {
    ...boundProp,
    setVariableValue: (value) => resolveBoundPropAndSetValue(value, boundProp),
    variableId: boundProp.value ?? boundProp.placeholder
  };
};
var resolveBoundPropAndSetValue = (value, boundProp) => {
  const propValue = unwrapValue(boundProp.value);
  const placeholder = unwrapValue(boundProp.placeholder);
  const newValue = unwrapValue(value);
  if (!propValue && placeholder === newValue) {
    return boundProp.setValue(null);
  }
  return boundProp.setValue(value);
};
var unwrapValue = (input) => {
  if (isTransformable(input)) {
    return input.value;
  }
  return input;
};

// src/components/ui/form-field.tsx
import * as React16 from "react";
import { FormHelperText, FormLabel, Grid } from "@elementor/ui";
var FormField = ({ id: id2, label, errorMsg, noticeMsg, children }) => {
  return /* @__PURE__ */ React16.createElement(Grid, { container: true, gap: 0.75, alignItems: "center" }, /* @__PURE__ */ React16.createElement(Grid, { item: true, xs: 12 }, /* @__PURE__ */ React16.createElement(FormLabel, { htmlFor: id2, size: "tiny" }, label)), /* @__PURE__ */ React16.createElement(Grid, { item: true, xs: 12 }, children, errorMsg && /* @__PURE__ */ React16.createElement(FormHelperText, { error: true }, errorMsg), noticeMsg && /* @__PURE__ */ React16.createElement(FormHelperText, null, noticeMsg)));
};

// src/components/variable-creation.tsx
var SIZE2 = "tiny";
var VariableCreation = ({ onGoBack, onClose }) => {
  const { icon: VariableIcon, valueField: ValueField, variableType, propTypeUtil } = useVariableType();
  const { setVariableValue: setVariable, path } = useVariableBoundProp();
  const { propType } = useBoundProp4();
  const initialValue = useInitialValue();
  const [value, setValue] = useState8(initialValue);
  const [label, setLabel] = useState8("");
  const [errorMessage, setErrorMessage] = useState8("");
  const [valueFieldError, setValueFieldError] = useState8("");
  const [propTypeKey, setPropTypeKey] = useState8(propTypeUtil.key);
  const { labelFieldError, setLabelFieldError } = useLabelError();
  const resetFields = () => {
    setValue("");
    setLabel("");
    setErrorMessage("");
    setValueFieldError("");
  };
  const closePopover = () => {
    resetFields();
    onClose();
  };
  const handleCreateAndTrack = () => {
    createVariable({
      value,
      label,
      type: propTypeKey
    }).then((key) => {
      setVariable(key);
      closePopover();
    }).catch((error) => {
      const mappedError = mapServerError(error);
      if (mappedError && "label" === mappedError.field) {
        setLabel("");
        setLabelFieldError({
          value: label,
          message: mappedError.message
        });
        return;
      }
      setErrorMessage(ERROR_MESSAGES.UNEXPECTED_ERROR);
    });
    trackVariableEvent({
      varType: variableType,
      controlPath: path.join("."),
      action: "save"
    });
  };
  const hasEmptyFields = () => {
    if ("" === label.trim()) {
      return true;
    }
    if ("string" === typeof value) {
      return "" === value.trim();
    }
    return false === Boolean(value);
  };
  const hasErrors = () => {
    return !!errorMessage;
  };
  const isSubmitDisabled = hasEmptyFields() || hasErrors();
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !isSubmitDisabled) {
      event.preventDefault();
      handleCreateAndTrack();
    }
  };
  return /* @__PURE__ */ React17.createElement(SectionPopoverBody, { height: "auto" }, /* @__PURE__ */ React17.createElement(
    PopoverHeader,
    {
      icon: /* @__PURE__ */ React17.createElement(React17.Fragment, null, onGoBack && /* @__PURE__ */ React17.createElement(IconButton4, { size: SIZE2, "aria-label": __11("Go Back", "elementor"), onClick: onGoBack }, /* @__PURE__ */ React17.createElement(ArrowLeftIcon, { fontSize: SIZE2 })), /* @__PURE__ */ React17.createElement(VariableIcon, { fontSize: SIZE2 })),
      title: __11("Create variable", "elementor"),
      onClose: closePopover
    }
  ), /* @__PURE__ */ React17.createElement(Divider2, null), /* @__PURE__ */ React17.createElement(PopoverContent, { p: 2 }, /* @__PURE__ */ React17.createElement(
    FormField,
    {
      id: "variable-label",
      label: __11("Name", "elementor"),
      errorMsg: labelFieldError?.message,
      noticeMsg: labelHint(label)
    },
    /* @__PURE__ */ React17.createElement(
      LabelField,
      {
        id: "variable-label",
        value: label,
        error: labelFieldError,
        onChange: (newValue) => {
          setLabel(newValue);
          setErrorMessage("");
        },
        onErrorChange: (errorMsg) => {
          setLabelFieldError({
            value: label,
            message: errorMsg
          });
        },
        onKeyDown: handleKeyDown
      }
    )
  ), ValueField && /* @__PURE__ */ React17.createElement(FormField, { errorMsg: valueFieldError, label: __11("Value", "elementor") }, /* @__PURE__ */ React17.createElement(Typography6, { variant: "h5", id: "variable-value-wrapper" }, /* @__PURE__ */ React17.createElement(
    ValueField,
    {
      value,
      onPropTypeKeyChange: (key) => setPropTypeKey(key),
      onChange: (newValue) => {
        setValue(newValue);
        setErrorMessage("");
        setValueFieldError("");
      },
      onValidationChange: setValueFieldError,
      propType,
      onKeyDown: handleKeyDown
    }
  ))), errorMessage && /* @__PURE__ */ React17.createElement(FormHelperText2, { error: true }, errorMessage)), /* @__PURE__ */ React17.createElement(CardActions, { sx: { pt: 0.5, pb: 1 } }, /* @__PURE__ */ React17.createElement(
    Button3,
    {
      id: "create-variable-button",
      size: "small",
      variant: "contained",
      disabled: isSubmitDisabled,
      onClick: handleCreateAndTrack
    },
    __11("Create", "elementor")
  )));
};

// src/components/variable-edit.tsx
import * as React19 from "react";
import { useEffect as useEffect5, useState as useState10 } from "react";
import { PopoverContent as PopoverContent2, useBoundProp as useBoundProp5 } from "@elementor/editor-controls";
import { useSuppressedMessage as useSuppressedMessage2 } from "@elementor/editor-current-user";
import { PopoverHeader as PopoverHeader2, SectionPopoverBody as SectionPopoverBody2 } from "@elementor/editor-ui";
import { ArrowLeftIcon as ArrowLeftIcon2, TrashIcon as TrashIcon2 } from "@elementor/icons";
import { Button as Button5, CardActions as CardActions2, Divider as Divider3, FormHelperText as FormHelperText3, IconButton as IconButton5, Tooltip, Typography as Typography8 } from "@elementor/ui";
import { __ as __13 } from "@wordpress/i18n";

// src/components/ui/edit-confirmation-dialog.tsx
import * as React18 from "react";
import { useState as useState9 } from "react";
import { AlertTriangleFilledIcon as AlertTriangleFilledIcon3 } from "@elementor/icons";
import {
  Button as Button4,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Typography as Typography7
} from "@elementor/ui";
import { __ as __12 } from "@wordpress/i18n";
var EDIT_CONFIRMATION_DIALOG_ID = "edit-confirmation-dialog";
var EditConfirmationDialog = ({
  closeDialog,
  onConfirm,
  onSuppressMessage
}) => {
  const [dontShowAgain, setDontShowAgain] = useState9(false);
  const handleSave = () => {
    if (dontShowAgain) {
      onSuppressMessage?.();
    }
    onConfirm?.();
  };
  return /* @__PURE__ */ React18.createElement(Dialog, { open: true, onClose: closeDialog, maxWidth: "xs" }, /* @__PURE__ */ React18.createElement(DialogTitle, { display: "flex", alignItems: "center", gap: 1 }, /* @__PURE__ */ React18.createElement(AlertTriangleFilledIcon3, { color: "secondary" }), __12("Changes to variables go live right away.", "elementor")), /* @__PURE__ */ React18.createElement(DialogContent, null, /* @__PURE__ */ React18.createElement(DialogContentText, { variant: "body2", color: "textPrimary" }, __12(
    "Don't worry - all other changes you make will wait until you publish your site.",
    "elementor"
  ))), /* @__PURE__ */ React18.createElement(DialogActions, { sx: { justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React18.createElement(
    FormControlLabel,
    {
      control: /* @__PURE__ */ React18.createElement(
        Checkbox,
        {
          checked: dontShowAgain,
          onChange: (event) => setDontShowAgain(event.target.checked),
          size: "small"
        }
      ),
      label: /* @__PURE__ */ React18.createElement(Typography7, { variant: "body2" }, __12("Don't show me again", "elementor"))
    }
  ), /* @__PURE__ */ React18.createElement("div", null, /* @__PURE__ */ React18.createElement(Button4, { color: "secondary", onClick: closeDialog }, __12("Keep editing", "elementor")), /* @__PURE__ */ React18.createElement(Button4, { variant: "contained", color: "secondary", onClick: handleSave, sx: { ml: 1 } }, __12("Save", "elementor")))));
};

// src/components/variable-edit.tsx
var SIZE3 = "tiny";
var DELETE_LABEL = __13("Delete variable", "elementor");
var VariableEdit = ({ onClose, onGoBack, onSubmit, editId }) => {
  const { icon: VariableIcon, valueField: ValueField, variableType, propTypeUtil } = useVariableType();
  const { setVariableValue: notifyBoundPropChange, variableId } = useVariableBoundProp();
  const { propType } = useBoundProp5();
  const [isMessageSuppressed, suppressMessage] = useSuppressedMessage2(EDIT_CONFIRMATION_DIALOG_ID);
  const [deleteConfirmation, setDeleteConfirmation] = useState10(false);
  const [editConfirmation, setEditConfirmation] = useState10(false);
  const [errorMessage, setErrorMessage] = useState10("");
  const [valueFieldError, setValueFieldError] = useState10("");
  const { labelFieldError, setLabelFieldError } = useLabelError();
  const variable = useVariable(editId);
  const [propTypeKey, setPropTypeKey] = useState10(variable?.type ?? propTypeUtil.key);
  if (!variable) {
    throw new Error(`Global ${variableType} variable not found`);
  }
  const userPermissions = usePermissions();
  const [value, setValue] = useState10(() => variable.value);
  const [label, setLabel] = useState10(() => variable.label);
  useEffect5(() => {
    styleVariablesRepository.update({
      [editId]: {
        ...variable,
        value
      }
    });
    return () => {
      styleVariablesRepository.update({
        [editId]: { ...variable }
      });
    };
  }, [editId, value, variable]);
  const handleUpdate = () => {
    if (isMessageSuppressed) {
      handleSaveVariable();
    } else {
      setEditConfirmation(true);
    }
  };
  const handleSaveVariable = () => {
    const typeChanged = propTypeKey !== variable.type;
    const updatePayload = typeChanged ? { value, label, type: propTypeKey } : { value, label };
    updateVariable(editId, updatePayload).then(() => {
      maybeTriggerBoundPropChange();
      onSubmit?.();
    }).catch((error) => {
      const mappedError = mapServerError(error);
      if (mappedError && "label" === mappedError.field) {
        setLabel("");
        setLabelFieldError({
          value: label,
          message: mappedError.message
        });
        return;
      }
      setErrorMessage(ERROR_MESSAGES.UNEXPECTED_ERROR);
    });
  };
  const handleDelete = () => {
    deleteVariable(editId).then(() => {
      maybeTriggerBoundPropChange();
      onSubmit?.();
    });
  };
  const maybeTriggerBoundPropChange = () => {
    if (editId === variableId) {
      notifyBoundPropChange(editId);
    }
  };
  const handleDeleteConfirmation = () => {
    setDeleteConfirmation(true);
  };
  const closeDeleteDialog = () => () => {
    setDeleteConfirmation(false);
  };
  const closeEditDialog = () => () => {
    setEditConfirmation(false);
  };
  const actions = [];
  if (userPermissions.canDelete()) {
    actions.push(
      /* @__PURE__ */ React19.createElement(Tooltip, { key: "delete", placement: "top", title: DELETE_LABEL }, /* @__PURE__ */ React19.createElement(IconButton5, { size: SIZE3, onClick: handleDeleteConfirmation, "aria-label": DELETE_LABEL }, /* @__PURE__ */ React19.createElement(TrashIcon2, { fontSize: SIZE3 })))
    );
  }
  const hasEmptyFields = () => {
    if ("" === label.trim()) {
      return true;
    }
    if ("string" === typeof value) {
      return "" === value.trim();
    }
    return false === Boolean(value);
  };
  const noValueChanged = () => {
    return value === variable.value && label === variable.label;
  };
  const hasErrors = () => {
    return !!errorMessage;
  };
  const isSubmitDisabled = noValueChanged() || hasEmptyFields() || hasErrors();
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !isSubmitDisabled) {
      event.preventDefault();
      handleUpdate();
    }
  };
  return /* @__PURE__ */ React19.createElement(React19.Fragment, null, /* @__PURE__ */ React19.createElement(SectionPopoverBody2, { height: "auto" }, /* @__PURE__ */ React19.createElement(
    PopoverHeader2,
    {
      title: __13("Edit variable", "elementor"),
      onClose,
      icon: /* @__PURE__ */ React19.createElement(React19.Fragment, null, onGoBack && /* @__PURE__ */ React19.createElement(
        IconButton5,
        {
          size: SIZE3,
          "aria-label": __13("Go Back", "elementor"),
          onClick: onGoBack
        },
        /* @__PURE__ */ React19.createElement(ArrowLeftIcon2, { fontSize: SIZE3 })
      ), /* @__PURE__ */ React19.createElement(VariableIcon, { fontSize: SIZE3 })),
      actions
    }
  ), /* @__PURE__ */ React19.createElement(Divider3, null), /* @__PURE__ */ React19.createElement(PopoverContent2, { p: 2 }, /* @__PURE__ */ React19.createElement(
    FormField,
    {
      id: "variable-label",
      label: __13("Name", "elementor"),
      errorMsg: labelFieldError?.message,
      noticeMsg: labelHint(label)
    },
    /* @__PURE__ */ React19.createElement(
      LabelField,
      {
        id: "variable-label",
        value: label,
        error: labelFieldError,
        onChange: (newValue) => {
          setLabel(newValue);
          setErrorMessage("");
        },
        onErrorChange: (errorMsg) => {
          setLabelFieldError({
            value: label,
            message: errorMsg
          });
        },
        onKeyDown: handleKeyDown
      }
    )
  ), ValueField && /* @__PURE__ */ React19.createElement(FormField, { errorMsg: valueFieldError, label: __13("Value", "elementor") }, /* @__PURE__ */ React19.createElement(Typography8, { variant: "h5" }, /* @__PURE__ */ React19.createElement(
    ValueField,
    {
      propTypeKey: variable.type,
      onPropTypeKeyChange: (key) => setPropTypeKey(key),
      value,
      onChange: (newValue) => {
        setValue(newValue);
        setErrorMessage("");
        setValueFieldError("");
      },
      onKeyDown: handleKeyDown,
      onValidationChange: setValueFieldError,
      propType
    }
  ))), errorMessage && /* @__PURE__ */ React19.createElement(FormHelperText3, { error: true }, errorMessage)), /* @__PURE__ */ React19.createElement(CardActions2, { sx: { pt: 0.5, pb: 1 } }, /* @__PURE__ */ React19.createElement(Button5, { size: "small", variant: "contained", disabled: isSubmitDisabled, onClick: handleUpdate }, __13("Save", "elementor")))), deleteConfirmation && /* @__PURE__ */ React19.createElement(
    DeleteConfirmationDialog,
    {
      open: true,
      label,
      onConfirm: handleDelete,
      closeDialog: closeDeleteDialog()
    }
  ), editConfirmation && !isMessageSuppressed && /* @__PURE__ */ React19.createElement(
    EditConfirmationDialog,
    {
      closeDialog: closeEditDialog(),
      onConfirm: handleSaveVariable,
      onSuppressMessage: suppressMessage
    }
  ));
};

// src/components/variables-selection.tsx
import { useState as useState11 } from "react";
import * as React21 from "react";
import {
  PopoverHeader as PopoverHeader3,
  PopoverMenuList,
  SearchField as SearchField2,
  SectionPopoverBody as SectionPopoverBody3
} from "@elementor/editor-ui";
import { PromotionAlert } from "@elementor/editor-ui";
import { ColorFilterIcon as ColorFilterIcon2, PlusIcon as PlusIcon2, SettingsIcon } from "@elementor/icons";
import { Divider as Divider4, IconButton as IconButton7, Tooltip as Tooltip3 } from "@elementor/ui";
import { __ as __15, sprintf as sprintf3 } from "@wordpress/i18n";

// src/components/ui/menu-item-content.tsx
import * as React20 from "react";
import { EllipsisWithTooltip as EllipsisWithTooltip2 } from "@elementor/editor-ui";
import { EditIcon } from "@elementor/icons";
import { Box as Box3, IconButton as IconButton6, ListItemIcon, Tooltip as Tooltip2, Typography as Typography9 } from "@elementor/ui";
import { __ as __14 } from "@wordpress/i18n";
var SIZE4 = "tiny";
var EDIT_LABEL = __14("Edit variable", "elementor");
var MenuItemContent = ({ item, disabled = false }) => {
  const onEdit = item.onEdit;
  return /* @__PURE__ */ React20.createElement(React20.Fragment, null, /* @__PURE__ */ React20.createElement(ListItemIcon, { sx: { color: disabled ? "text.disabled" : "inherit" } }, item.icon), /* @__PURE__ */ React20.createElement(
    Box3,
    {
      sx: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: 1
      }
    },
    /* @__PURE__ */ React20.createElement(
      EllipsisWithTooltip2,
      {
        title: item.label || item.value,
        as: Typography9,
        variant: "caption",
        color: disabled ? "text.disabled" : "text.primary",
        sx: { marginTop: "1px", lineHeight: "2" },
        maxWidth: "50%"
      }
    ),
    item.secondaryText && /* @__PURE__ */ React20.createElement(
      EllipsisWithTooltip2,
      {
        title: item.secondaryText,
        as: Typography9,
        variant: "caption",
        color: disabled ? "text.disabled" : "text.tertiary",
        sx: { marginTop: "1px", lineHeight: "1" },
        maxWidth: "50%"
      }
    )
  ), !!onEdit && !disabled && /* @__PURE__ */ React20.createElement(Tooltip2, { placement: "top", title: EDIT_LABEL }, /* @__PURE__ */ React20.createElement(
    IconButton6,
    {
      sx: { mx: 1, opacity: "0" },
      onClick: (e) => {
        e.stopPropagation();
        onEdit(item.value);
      },
      "aria-label": EDIT_LABEL
    },
    /* @__PURE__ */ React20.createElement(EditIcon, { color: "action", fontSize: SIZE4 })
  )));
};

// src/components/ui/styled-menu-list.tsx
import { MenuList, styled as styled2 } from "@elementor/ui";
var VariablesStyledMenuList = styled2(MenuList)(({ theme, disabled }) => ({
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
    ...!disabled && {
      "&:hover, &:focus": {
        backgroundColor: theme.palette.action.hover
      },
      cursor: "pointer"
    },
    '&[aria-selected="true"]': {
      backgroundColor: theme.palette.action.selected
    },
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

// src/components/variables-selection.tsx
var SIZE5 = "tiny";
var CREATE_LABEL = __15("Create variable", "elementor");
var MANAGER_LABEL = __15("Variables Manager", "elementor");
var getProUpgradeUrl = (variableType) => `https://go.elementor.com/renew-license-panel-${variableType}-variable`;
var VariablesSelection = ({ closePopover, onAdd, onEdit, onSettings, disabled = false }) => {
  const { icon: VariableIcon, startIcon, variableType, propTypeUtil, emptyState } = useVariableType();
  const { value: variable, setValue: setVariable, path } = useVariableBoundProp();
  const [searchValue, setSearchValue] = useState11("");
  const {
    list: variables,
    hasMatches: hasSearchResults,
    isSourceNotEmpty: hasVariables,
    hasNoCompatibleVariables
  } = useFilteredVariables(searchValue, propTypeUtil.key);
  const handleSetVariable = (key) => {
    setVariable(key);
    trackVariableEvent({
      varType: variableType,
      controlPath: path.join("."),
      action: "connect"
    });
    closePopover();
  };
  const onAddAndTrack = () => {
    onAdd?.();
    trackVariableEvent({
      varType: variableType,
      controlPath: path.join("."),
      action: "add"
    });
  };
  const actions = [];
  if (onAdd) {
    actions.push(
      /* @__PURE__ */ React21.createElement(Tooltip3, { key: "add", placement: "top", title: CREATE_LABEL }, /* @__PURE__ */ React21.createElement("span", null, /* @__PURE__ */ React21.createElement(
        IconButton7,
        {
          id: "add-variable-button",
          size: SIZE5,
          onClick: onAddAndTrack,
          "aria-label": CREATE_LABEL,
          disabled
        },
        /* @__PURE__ */ React21.createElement(PlusIcon2, { fontSize: SIZE5 })
      )))
    );
  }
  if (onSettings) {
    const handleOpenManager = () => {
      onSettings();
      trackVariablesManagerEvent({
        action: "openManager",
        varType: variableType,
        controlPath: path.join(".")
      });
    };
    actions.push(
      /* @__PURE__ */ React21.createElement(Tooltip3, { key: "settings", placement: "top", title: MANAGER_LABEL }, /* @__PURE__ */ React21.createElement(
        IconButton7,
        {
          id: "variables-manager-button",
          size: SIZE5,
          onClick: handleOpenManager,
          "aria-label": MANAGER_LABEL
        },
        /* @__PURE__ */ React21.createElement(SettingsIcon, { fontSize: SIZE5 })
      ))
    );
  }
  const StartIcon = startIcon || (() => /* @__PURE__ */ React21.createElement(VariableIcon, { fontSize: SIZE5 }));
  const items = variables.map(({ value, label, key }) => ({
    type: "item",
    value: key,
    label,
    icon: /* @__PURE__ */ React21.createElement(StartIcon, { value }),
    secondaryText: value,
    onEdit: onEdit ? () => onEdit?.(key) : void 0
  }));
  const handleSearch = (search) => {
    setSearchValue(search);
  };
  const handleClearSearch = () => {
    setSearchValue("");
  };
  return /* @__PURE__ */ React21.createElement(SectionPopoverBody3, null, /* @__PURE__ */ React21.createElement(
    PopoverHeader3,
    {
      title: __15("Variables", "elementor"),
      icon: /* @__PURE__ */ React21.createElement(ColorFilterIcon2, { fontSize: SIZE5 }),
      onClose: closePopover,
      actions
    }
  ), hasVariables && /* @__PURE__ */ React21.createElement(
    SearchField2,
    {
      value: searchValue,
      onSearch: handleSearch,
      placeholder: __15("Search", "elementor")
    }
  ), /* @__PURE__ */ React21.createElement(Divider4, null), hasVariables && hasSearchResults && /* @__PURE__ */ React21.createElement(React21.Fragment, null, /* @__PURE__ */ React21.createElement(
    PopoverMenuList,
    {
      items,
      onSelect: disabled ? () => {
      } : handleSetVariable,
      onClose: () => {
      },
      selectedValue: variable,
      "data-testid": `${variableType}-variables-list`,
      menuListTemplate: (props) => /* @__PURE__ */ React21.createElement(VariablesStyledMenuList, { ...props, disabled }),
      menuItemContentTemplate: (item) => /* @__PURE__ */ React21.createElement(MenuItemContent, { item, disabled })
    }
  ), disabled && /* @__PURE__ */ React21.createElement(
    PromotionAlert,
    {
      message: sprintf3(
        /* translators: %s: Variable Type. */
        __15("Upgrade to continue creating and editing %s variables.", "elementor"),
        variableType
      ),
      upgradeUrl: getProUpgradeUrl(variableType)
    }
  )), !hasSearchResults && hasVariables && /* @__PURE__ */ React21.createElement(
    NoSearchResults,
    {
      searchValue,
      onClear: handleClearSearch,
      icon: /* @__PURE__ */ React21.createElement(VariableIcon, { fontSize: "large" })
    }
  ), disabled && !hasVariables && /* @__PURE__ */ React21.createElement(
    EmptyState,
    {
      title: sprintf3(
        /* translators: %s: Variable Type. */
        __15("No %s variables yet", "elementor"),
        variableType
      ),
      message: sprintf3(
        /* translators: %s: Variable Type. */
        __15("Upgrade to create %s variables and maintain consistent element sizing.", "elementor"),
        variableType
      ),
      icon: /* @__PURE__ */ React21.createElement(VariableIcon, { fontSize: "large" })
    },
    emptyState
  ), !hasVariables && !hasNoCompatibleVariables && !disabled && /* @__PURE__ */ React21.createElement(
    EmptyState,
    {
      title: sprintf3(
        /* translators: %s: Variable Type. */
        __15("Create your first %s variable", "elementor"),
        variableType
      ),
      message: __15(
        "Variables are saved attributes that you can apply anywhere on your site.",
        "elementor"
      ),
      icon: /* @__PURE__ */ React21.createElement(VariableIcon, { fontSize: "large" }),
      onAdd
    }
  ), hasNoCompatibleVariables && !disabled && /* @__PURE__ */ React21.createElement(
    EmptyState,
    {
      title: __15("No compatible variables", "elementor"),
      message: __15(
        "Looks like none of your variables work with this control. Create a new variable to use it here.",
        "elementor"
      ),
      icon: /* @__PURE__ */ React21.createElement(VariableIcon, { fontSize: "large" }),
      onAdd
    }
  ));
};

// src/components/variable-selection-popover.tsx
var VIEW_LIST = "list";
var VIEW_ADD = "add";
var VIEW_EDIT = "edit";
var VariableSelectionPopover = ({ closePopover, propTypeKey, selectedVariable }) => {
  const [currentView, setCurrentView] = useState12(VIEW_LIST);
  const [editId, setEditId] = useState12("");
  const { open } = usePanelActions();
  const onSettingsAvailable = isExperimentActive("e_variables_manager") ? () => {
    open();
  } : void 0;
  return /* @__PURE__ */ React22.createElement(VariableTypeProvider, { propTypeKey }, /* @__PURE__ */ React22.createElement(PopoverContentRefContextProvider, null, RenderView({
    propTypeKey,
    currentView,
    selectedVariable,
    editId,
    setEditId,
    setCurrentView,
    closePopover,
    onSettings: onSettingsAvailable
  })));
};
function RenderView(props) {
  const userPermissions = usePermissions();
  const userQuotaPremissions = useQuotaPermissions(props.propTypeKey);
  const handlers = {
    onClose: () => {
      props.closePopover();
    },
    onGoBack: () => {
      props.setCurrentView(VIEW_LIST);
    }
  };
  if (userPermissions.canAdd()) {
    handlers.onAdd = () => {
      props.setCurrentView(VIEW_ADD);
    };
  }
  if (userPermissions.canEdit()) {
    handlers.onEdit = (key) => {
      props.setEditId(key);
      props.setCurrentView(VIEW_EDIT);
    };
  }
  if (userPermissions.canManageSettings() && props.onSettings) {
    handlers.onSettings = () => {
      props.closePopover();
      props.onSettings?.();
    };
  }
  const handleSubmitOnEdit = () => {
    if (props?.selectedVariable?.key === props.editId) {
      handlers.onClose();
    } else {
      handlers.onGoBack?.();
    }
  };
  if (VIEW_LIST === props.currentView) {
    return /* @__PURE__ */ React22.createElement(
      VariablesSelection,
      {
        closePopover: handlers.onClose,
        onAdd: handlers.onAdd,
        onEdit: handlers.onEdit,
        onSettings: handlers.onSettings,
        disabled: !userQuotaPremissions.canAdd()
      }
    );
  }
  if (VIEW_ADD === props.currentView) {
    return /* @__PURE__ */ React22.createElement(VariableCreation, { onGoBack: handlers.onGoBack, onClose: handlers.onClose });
  }
  if (VIEW_EDIT === props.currentView) {
    return /* @__PURE__ */ React22.createElement(
      VariableEdit,
      {
        editId: props.editId,
        onGoBack: handlers.onGoBack,
        onClose: handlers.onClose,
        onSubmit: handleSubmitOnEdit
      }
    );
  }
  return null;
}

// src/components/ui/tags/assigned-tag.tsx
import * as React23 from "react";
import { DetachIcon } from "@elementor/icons";
import { Box as Box4, IconButton as IconButton8, Stack as Stack7, Tooltip as Tooltip4, Typography as Typography10, UnstableTag as Tag } from "@elementor/ui";
import { __ as __16 } from "@wordpress/i18n";
var SIZE6 = "tiny";
var UNLINK_LABEL = __16("Unlink variable", "elementor");
var AssignedTag = ({ startIcon, label, onUnlink, ...props }) => {
  const actions = [];
  if (onUnlink) {
    actions.push(
      /* @__PURE__ */ React23.createElement(Tooltip4, { key: "unlink", title: UNLINK_LABEL, placement: "bottom" }, /* @__PURE__ */ React23.createElement(IconButton8, { size: SIZE6, onClick: onUnlink, "aria-label": UNLINK_LABEL }, /* @__PURE__ */ React23.createElement(DetachIcon, { fontSize: SIZE6 })))
    );
  }
  return /* @__PURE__ */ React23.createElement(Tooltip4, { title: label, placement: "top" }, /* @__PURE__ */ React23.createElement(
    Tag,
    {
      fullWidth: true,
      showActionsOnHover: true,
      startIcon: /* @__PURE__ */ React23.createElement(Stack7, { gap: 0.5, direction: "row", alignItems: "center" }, startIcon),
      label: /* @__PURE__ */ React23.createElement(Box4, { sx: { display: "inline-grid", minWidth: 0 } }, /* @__PURE__ */ React23.createElement(Typography10, { sx: { lineHeight: 1.34 }, variant: "caption", noWrap: true }, label)),
      actions,
      ...props
    }
  ));
};

// src/components/ui/variable/assigned-variable.tsx
var AssignedVariable = ({ variable, propTypeKey }) => {
  const { startIcon, propTypeUtil } = getVariableType(propTypeKey);
  const { setValue } = useBoundProp6();
  const anchorRef = useRef8(null);
  const popupId = useId();
  const popupState = usePopupState3({
    variant: "popover",
    popupId: `elementor-variables-list-${popupId}`
  });
  const unlinkVariable = createUnlinkHandler(variable, propTypeKey, setValue);
  const StartIcon = startIcon || (() => null);
  return /* @__PURE__ */ React24.createElement(Box5, { ref: anchorRef }, /* @__PURE__ */ React24.createElement(
    AssignedTag,
    {
      label: variable.label,
      startIcon: /* @__PURE__ */ React24.createElement(React24.Fragment, null, /* @__PURE__ */ React24.createElement(ColorFilterIcon3, { fontSize: SIZE6 }), /* @__PURE__ */ React24.createElement(StartIcon, { value: variable.value })),
      onUnlink: unlinkVariable,
      ...bindTrigger3(popupState)
    }
  ), /* @__PURE__ */ React24.createElement(
    Popover,
    {
      disableScrollLock: true,
      anchorEl: anchorRef.current,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...bindPopover(popupState)
    },
    /* @__PURE__ */ React24.createElement(
      VariableSelectionPopover,
      {
        selectedVariable: variable,
        closePopover: popupState.close,
        propTypeKey: propTypeUtil.key
      }
    )
  ));
};

// src/components/ui/variable/deleted-variable.tsx
import * as React28 from "react";
import { useId as useId2, useRef as useRef9, useState as useState14 } from "react";
import { useBoundProp as useBoundProp8 } from "@elementor/editor-controls";
import { Backdrop, bindPopover as bindPopover2, Box as Box7, Infotip as Infotip2, Popover as Popover2, usePopupState as usePopupState4 } from "@elementor/ui";
import { __ as __19 } from "@wordpress/i18n";

// src/components/variable-restore.tsx
import * as React25 from "react";
import { useState as useState13 } from "react";
import { PopoverContent as PopoverContent3, useBoundProp as useBoundProp7 } from "@elementor/editor-controls";
import { PopoverHeader as PopoverHeader4, SectionPopoverBody as SectionPopoverBody4 } from "@elementor/editor-ui";
import { Button as Button6, CardActions as CardActions3, Divider as Divider5, FormHelperText as FormHelperText4, Typography as Typography11 } from "@elementor/ui";
import { __ as __17 } from "@wordpress/i18n";
var SIZE7 = "tiny";
var VariableRestore = ({ variableId, onClose, onSubmit }) => {
  const { icon: VariableIcon, valueField: ValueField, variableType, propTypeUtil } = useVariableType();
  const { setVariableValue: notifyBoundPropChange } = useVariableBoundProp();
  const { propType } = useBoundProp7();
  const variable = useVariable(variableId);
  if (!variable) {
    throw new Error(`Global ${variableType} variable not found`);
  }
  const [errorMessage, setErrorMessage] = useState13("");
  const [valueFieldError, setValueFieldError] = useState13("");
  const [label, setLabel] = useState13(variable.label);
  const [value, setValue] = useState13(variable.value);
  const [propTypeKey, setPropTypeKey] = useState13(variable?.type ?? propTypeUtil.key);
  const { labelFieldError, setLabelFieldError } = useLabelError({
    value: variable.label,
    message: ERROR_MESSAGES.DUPLICATED_LABEL
  });
  const handleRestore = () => {
    const typeChanged = propTypeKey !== variable.type;
    const restorePromise = typeChanged ? restoreVariable(variableId, label, value, propTypeKey) : restoreVariable(variableId, label, value);
    restorePromise.then(() => {
      notifyBoundPropChange(variableId);
      onSubmit?.();
    }).catch((error) => {
      const mappedError = mapServerError(error);
      if (mappedError && "label" === mappedError.field) {
        setLabel("");
        setLabelFieldError({
          value: label,
          message: mappedError.message
        });
        return;
      }
      setErrorMessage(ERROR_MESSAGES.UNEXPECTED_ERROR);
    });
  };
  const hasEmptyFields = () => {
    if ("" === label.trim()) {
      return true;
    }
    if ("string" === typeof value) {
      return "" === value.trim();
    }
    return false === Boolean(value);
  };
  const noValueChanged = () => {
    return value === variable.value && label === variable.label;
  };
  const hasErrors = () => {
    return !!errorMessage;
  };
  const isSubmitDisabled = noValueChanged() || hasEmptyFields() || hasErrors();
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !isSubmitDisabled) {
      event.preventDefault();
      handleRestore();
    }
  };
  return /* @__PURE__ */ React25.createElement(PopoverContentRefContextProvider, null, /* @__PURE__ */ React25.createElement(SectionPopoverBody4, { height: "auto" }, /* @__PURE__ */ React25.createElement(
    PopoverHeader4,
    {
      icon: /* @__PURE__ */ React25.createElement(VariableIcon, { fontSize: SIZE7 }),
      title: __17("Restore variable", "elementor"),
      onClose
    }
  ), /* @__PURE__ */ React25.createElement(Divider5, null), /* @__PURE__ */ React25.createElement(PopoverContent3, { p: 2 }, /* @__PURE__ */ React25.createElement(
    FormField,
    {
      id: "variable-label",
      label: __17("Name", "elementor"),
      errorMsg: labelFieldError?.message,
      noticeMsg: labelHint(label)
    },
    /* @__PURE__ */ React25.createElement(
      LabelField,
      {
        id: "variable-label",
        value: label,
        error: labelFieldError,
        onChange: (newValue) => {
          setLabel(newValue);
          setErrorMessage("");
        },
        onErrorChange: (errorMsg) => {
          setLabelFieldError({
            value: label,
            message: errorMsg
          });
        },
        onKeyDown: handleKeyDown
      }
    )
  ), ValueField && /* @__PURE__ */ React25.createElement(FormField, { errorMsg: valueFieldError, label: __17("Value", "elementor") }, /* @__PURE__ */ React25.createElement(Typography11, { variant: "h5" }, /* @__PURE__ */ React25.createElement(
    ValueField,
    {
      propTypeKey,
      onPropTypeKeyChange: (key) => setPropTypeKey(key),
      value,
      onChange: (newValue) => {
        setValue(newValue);
        setErrorMessage("");
        setValueFieldError("");
      },
      onValidationChange: setValueFieldError,
      propType,
      onKeyDown: handleKeyDown
    }
  ))), errorMessage && /* @__PURE__ */ React25.createElement(FormHelperText4, { error: true }, errorMessage)), /* @__PURE__ */ React25.createElement(CardActions3, { sx: { pt: 0.5, pb: 1 } }, /* @__PURE__ */ React25.createElement(Button6, { size: "small", variant: "contained", disabled: isSubmitDisabled, onClick: handleRestore }, __17("Restore", "elementor")))));
};

// src/components/ui/deleted-variable-alert.tsx
import * as React26 from "react";
import { Alert as Alert2, AlertAction as AlertAction2, AlertTitle as AlertTitle2, ClickAwayListener as ClickAwayListener2, Typography as Typography12 } from "@elementor/ui";
import { __ as __18 } from "@wordpress/i18n";
var DeletedVariableAlert = ({ onClose, onUnlink, onRestore, label }) => {
  return /* @__PURE__ */ React26.createElement(ClickAwayListener2, { onClickAway: onClose }, /* @__PURE__ */ React26.createElement(
    Alert2,
    {
      variant: "standard",
      severity: "warning",
      onClose,
      action: /* @__PURE__ */ React26.createElement(React26.Fragment, null, onUnlink && /* @__PURE__ */ React26.createElement(AlertAction2, { variant: "contained", onClick: onUnlink }, __18("Unlink", "elementor")), onRestore && /* @__PURE__ */ React26.createElement(AlertAction2, { variant: "outlined", onClick: onRestore }, __18("Restore", "elementor"))),
      sx: { maxWidth: 300 }
    },
    /* @__PURE__ */ React26.createElement(AlertTitle2, null, __18("Deleted variable", "elementor")),
    /* @__PURE__ */ React26.createElement(Typography12, { variant: "body2", color: "textPrimary" }, __18("The variable", "elementor"), "\xA0'", /* @__PURE__ */ React26.createElement(Typography12, { variant: "body2", component: "span", sx: { lineBreak: "anywhere" } }, label), "'\xA0", __18(
      "has been deleted, but it is still referenced in this location. You may restore the variable or unlink it to assign a different value.",
      "elementor"
    ))
  ));
};

// src/components/ui/tags/warning-variable-tag.tsx
import * as React27 from "react";
import { AlertTriangleFilledIcon as AlertTriangleFilledIcon4 } from "@elementor/icons";
import { Box as Box6, Chip, Tooltip as Tooltip5, Typography as Typography13 } from "@elementor/ui";
var WarningVariableTag = React27.forwardRef(
  ({ label, suffix, onClick, icon, ...props }, ref) => {
    const displayText = suffix ? `${label} (${suffix})` : label;
    return /* @__PURE__ */ React27.createElement(
      Chip,
      {
        ref,
        size: "tiny",
        color: "warning",
        shape: "rounded",
        variant: "standard",
        onClick,
        icon: /* @__PURE__ */ React27.createElement(AlertTriangleFilledIcon4, null),
        label: /* @__PURE__ */ React27.createElement(Tooltip5, { title: displayText, placement: "top" }, /* @__PURE__ */ React27.createElement(Box6, { sx: { display: "inline-grid", minWidth: 0 } }, /* @__PURE__ */ React27.createElement(Typography13, { variant: "caption", noWrap: true, sx: { lineHeight: 1.34 } }, displayText))),
        sx: {
          height: (theme) => theme.spacing(3.5),
          borderRadius: (theme) => theme.spacing(1),
          justifyContent: "flex-start",
          width: "100%"
        },
        ...props
      }
    );
  }
);
WarningVariableTag.displayName = "WarningVariableTag";

// src/components/ui/variable/deleted-variable.tsx
var DeletedVariable = ({ variable, propTypeKey }) => {
  const { propTypeUtil } = getVariableType(propTypeKey);
  const boundProp = useBoundProp8();
  const userPermissions = usePermissions();
  const [showInfotip, setShowInfotip] = useState14(false);
  const toggleInfotip = () => setShowInfotip((prev) => !prev);
  const closeInfotip = () => setShowInfotip(false);
  const deletedChipAnchorRef = useRef9(null);
  const popupId = useId2();
  const popupState = usePopupState4({
    variant: "popover",
    popupId: `elementor-variables-restore-${popupId}`
  });
  const handlers = {};
  if (userPermissions.canUnlink()) {
    handlers.onUnlink = createUnlinkHandler(variable, propTypeKey, boundProp.setValue);
  }
  if (userPermissions.canRestore()) {
    handlers.onRestore = () => {
      if (!variable.key) {
        return;
      }
      restoreVariable(variable.key).then((id2) => {
        resolveBoundPropAndSetValue(propTypeUtil.create(id2), boundProp);
        closeInfotip();
      }).catch(() => {
        closeInfotip();
        popupState.setAnchorEl(deletedChipAnchorRef.current);
        popupState.open();
      });
    };
  }
  const handleRestoreWithOverrides = () => {
    popupState.close();
  };
  return /* @__PURE__ */ React28.createElement(React28.Fragment, null, /* @__PURE__ */ React28.createElement(Box7, { ref: deletedChipAnchorRef }, showInfotip && /* @__PURE__ */ React28.createElement(Backdrop, { open: true, onClick: closeInfotip, invisible: true }), /* @__PURE__ */ React28.createElement(
    Infotip2,
    {
      color: "warning",
      placement: "right-start",
      open: showInfotip,
      disableHoverListener: true,
      onClose: closeInfotip,
      content: /* @__PURE__ */ React28.createElement(
        DeletedVariableAlert,
        {
          onClose: closeInfotip,
          onUnlink: handlers.onUnlink,
          onRestore: handlers.onRestore,
          label: variable.label
        }
      ),
      slotProps: {
        popper: {
          modifiers: [
            {
              name: "offset",
              options: { offset: [0, 24] }
            }
          ]
        }
      }
    },
    /* @__PURE__ */ React28.createElement(
      WarningVariableTag,
      {
        label: variable.label,
        onClick: toggleInfotip,
        suffix: __19("deleted", "elementor")
      }
    )
  ), /* @__PURE__ */ React28.createElement(
    Popover2,
    {
      disableScrollLock: true,
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: "right" },
      PaperProps: {
        sx: { my: 1 }
      },
      ...bindPopover2(popupState)
    },
    /* @__PURE__ */ React28.createElement(VariableTypeProvider, { propTypeKey }, /* @__PURE__ */ React28.createElement(
      VariableRestore,
      {
        variableId: variable.key ?? "",
        onClose: popupState.close,
        onSubmit: handleRestoreWithOverrides
      }
    ))
  )));
};

// src/components/ui/variable/mismatch-variable.tsx
import * as React30 from "react";
import { useId as useId3, useRef as useRef10, useState as useState15 } from "react";
import { useBoundProp as useBoundProp9 } from "@elementor/editor-controls";
import { Backdrop as Backdrop2, bindPopover as bindPopover3, Box as Box8, Infotip as Infotip3, Popover as Popover3, usePopupState as usePopupState5 } from "@elementor/ui";
import { __ as __21 } from "@wordpress/i18n";

// src/components/ui/mismatch-variable-alert.tsx
import * as React29 from "react";
import { Alert as Alert3, AlertAction as AlertAction3, AlertTitle as AlertTitle3, ClickAwayListener as ClickAwayListener3, Typography as Typography14 } from "@elementor/ui";
import { __ as __20 } from "@wordpress/i18n";
var i18n = {
  title: __20("Variable has changed", "elementor"),
  message: __20(
    `This variable is no longer compatible with this property. You can clear it or select a different one.`,
    "elementor"
  ),
  buttons: {
    clear: __20("Clear", "elementor"),
    select: __20("Select variable", "elementor")
  }
};
var MismatchVariableAlert = ({ onClose, onClear, triggerSelect }) => {
  return /* @__PURE__ */ React29.createElement(ClickAwayListener3, { onClickAway: onClose }, /* @__PURE__ */ React29.createElement(
    Alert3,
    {
      variant: "standard",
      severity: "warning",
      onClose,
      action: /* @__PURE__ */ React29.createElement(React29.Fragment, null, onClear && /* @__PURE__ */ React29.createElement(AlertAction3, { variant: "contained", onClick: onClear }, i18n.buttons.clear), triggerSelect && /* @__PURE__ */ React29.createElement(AlertAction3, { variant: "outlined", onClick: triggerSelect }, i18n.buttons.select)),
      sx: { maxWidth: 300 }
    },
    /* @__PURE__ */ React29.createElement(AlertTitle3, null, i18n.title),
    /* @__PURE__ */ React29.createElement(Typography14, { variant: "body2", color: "textPrimary" }, i18n.message)
  ));
};

// src/components/ui/variable/mismatch-variable.tsx
var MismatchVariable = ({ variable }) => {
  const { setValue, value } = useBoundProp9();
  const anchorRef = useRef10(null);
  const popupId = useId3();
  const popupState = usePopupState5({
    variant: "popover",
    popupId: `elementor-variables-list-${popupId}`
  });
  const [infotipVisible, setInfotipVisible] = useState15(false);
  const toggleInfotip = () => setInfotipVisible((prev) => !prev);
  const closeInfotip = () => setInfotipVisible(false);
  const triggerSelect = () => {
    closeInfotip();
    popupState.setAnchorEl(anchorRef.current);
    popupState.open();
  };
  const clearValue = () => {
    closeInfotip();
    setValue(null);
  };
  const showClearButton = !!value;
  return /* @__PURE__ */ React30.createElement(Box8, { ref: anchorRef }, infotipVisible && /* @__PURE__ */ React30.createElement(Backdrop2, { open: true, onClick: closeInfotip, invisible: true }), /* @__PURE__ */ React30.createElement(
    Infotip3,
    {
      color: "warning",
      placement: "right-start",
      open: infotipVisible,
      disableHoverListener: true,
      onClose: closeInfotip,
      content: /* @__PURE__ */ React30.createElement(
        MismatchVariableAlert,
        {
          onClose: closeInfotip,
          onClear: showClearButton ? clearValue : void 0,
          triggerSelect
        }
      ),
      slotProps: {
        popper: {
          modifiers: [
            {
              name: "offset",
              options: { offset: [0, 24] }
            }
          ]
        }
      }
    },
    /* @__PURE__ */ React30.createElement(
      WarningVariableTag,
      {
        label: variable.label,
        onClick: toggleInfotip,
        suffix: __21("changed", "elementor")
      }
    )
  ), /* @__PURE__ */ React30.createElement(
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
    /* @__PURE__ */ React30.createElement(
      VariableSelectionPopover,
      {
        selectedVariable: variable,
        closePopover: popupState.close,
        propTypeKey: variable.type
      }
    )
  ));
};

// src/components/ui/variable/missing-variable.tsx
import * as React32 from "react";
import { useState as useState16 } from "react";
import { useBoundProp as useBoundProp10 } from "@elementor/editor-controls";
import { Backdrop as Backdrop3, Infotip as Infotip4 } from "@elementor/ui";
import { __ as __23 } from "@wordpress/i18n";

// src/components/ui/missing-variable-alert.tsx
import * as React31 from "react";
import { Alert as Alert4, AlertAction as AlertAction4, AlertTitle as AlertTitle4, ClickAwayListener as ClickAwayListener4, Typography as Typography15 } from "@elementor/ui";
import { __ as __22 } from "@wordpress/i18n";
var MissingVariableAlert = ({ onClose, onClear }) => {
  return /* @__PURE__ */ React31.createElement(ClickAwayListener4, { onClickAway: onClose }, /* @__PURE__ */ React31.createElement(
    Alert4,
    {
      variant: "standard",
      severity: "warning",
      onClose,
      action: /* @__PURE__ */ React31.createElement(React31.Fragment, null, onClear && /* @__PURE__ */ React31.createElement(AlertAction4, { variant: "contained", onClick: onClear }, __22("Clear", "elementor"))),
      sx: { maxWidth: 300 }
    },
    /* @__PURE__ */ React31.createElement(AlertTitle4, null, __22("This variable is missing", "elementor")),
    /* @__PURE__ */ React31.createElement(Typography15, { variant: "body2", color: "textPrimary" }, __22(
      "It may have been deleted. Try clearing this field and select a different value or variable.",
      "elementor"
    ))
  ));
};

// src/components/ui/variable/missing-variable.tsx
var MissingVariable = () => {
  const { setValue } = useBoundProp10();
  const [infotipVisible, setInfotipVisible] = useState16(false);
  const toggleInfotip = () => setInfotipVisible((prev) => !prev);
  const closeInfotip = () => setInfotipVisible(false);
  const clearValue = () => setValue(null);
  return /* @__PURE__ */ React32.createElement(React32.Fragment, null, infotipVisible && /* @__PURE__ */ React32.createElement(Backdrop3, { open: true, onClick: closeInfotip, invisible: true }), /* @__PURE__ */ React32.createElement(
    Infotip4,
    {
      color: "warning",
      placement: "right-start",
      open: infotipVisible,
      disableHoverListener: true,
      onClose: closeInfotip,
      content: /* @__PURE__ */ React32.createElement(MissingVariableAlert, { onClose: closeInfotip, onClear: clearValue }),
      slotProps: {
        popper: {
          modifiers: [
            {
              name: "offset",
              options: { offset: [0, 24] }
            }
          ]
        }
      }
    },
    /* @__PURE__ */ React32.createElement(WarningVariableTag, { label: __23("Missing variable", "elementor"), onClick: toggleInfotip })
  ));
};

// src/controls/variable-control.tsx
var VariableControl = () => {
  const boundProp = useBoundProp11();
  const boundPropValue = boundProp.value ?? boundProp.placeholder;
  const assignedVariable = useVariable(boundPropValue?.value);
  if (!assignedVariable) {
    return /* @__PURE__ */ React33.createElement(MissingVariable, null);
  }
  const { $$type: propTypeKey } = boundPropValue;
  if (assignedVariable?.deleted) {
    return /* @__PURE__ */ React33.createElement(DeletedVariable, { variable: assignedVariable, propTypeKey });
  }
  const { isCompatible } = getVariableType(assignedVariable.type);
  if (isCompatible && !isCompatible(boundProp?.propType, assignedVariable)) {
    return /* @__PURE__ */ React33.createElement(MismatchVariable, { variable: assignedVariable });
  }
  return /* @__PURE__ */ React33.createElement(AssignedVariable, { variable: assignedVariable, propTypeKey });
};

// src/hooks/use-prop-variable-action.tsx
import * as React34 from "react";
import { useBoundProp as useBoundProp12 } from "@elementor/editor-controls";
import { ColorFilterIcon as ColorFilterIcon4 } from "@elementor/icons";
import { __ as __24 } from "@wordpress/i18n";
var usePropVariableAction = () => {
  const { propType, path } = useBoundProp12();
  const variable = resolveVariableFromPropType(propType);
  return {
    visible: Boolean(variable),
    icon: ColorFilterIcon4,
    title: __24("Variables", "elementor"),
    content: ({ close: closePopover }) => {
      if (!variable) {
        return null;
      }
      trackOpenVariablePopover(path, variable.variableType);
      return /* @__PURE__ */ React34.createElement(VariableSelectionPopover, { closePopover, propTypeKey: variable.propTypeUtil.key });
    }
  };
};
var resolveVariableFromPropType = (propType) => {
  if (propType.kind !== "union") {
    return void 0;
  }
  for (const key of Object.keys(propType.prop_types)) {
    const variable = getVariableType(key);
    if (variable) {
      return variable;
    }
  }
  return void 0;
};
var trackOpenVariablePopover = (path, variableType) => {
  trackVariableEvent({
    varType: variableType,
    controlPath: path.join("."),
    action: "open"
  });
};

// src/mcp/index.ts
import { isAngieAvailable } from "@elementor/editor-mcp";

// src/mcp/manage-variable-tool.ts
import { getMCPByDomain as getMCPByDomain2 } from "@elementor/editor-mcp";
import { z as z3 } from "@elementor/schema";

// src/mcp/variables-resource.ts
import { getMCPByDomain } from "@elementor/editor-mcp";
var GLOBAL_VARIABLES_URI = "elementor://global-variables";
var initVariablesResource = () => {
  const canvasMcpEntry = getMCPByDomain("canvas");
  const variablesMcpEntry = getMCPByDomain("variables");
  [canvasMcpEntry, variablesMcpEntry].forEach((entry) => {
    const { mcpServer } = entry;
    mcpServer.resource(
      "global-variables",
      GLOBAL_VARIABLES_URI,
      {
        description: "List of Global variables. Defined as a key-value store (ID as key, global-variable object as value)"
      },
      async () => {
        const variables = {};
        Object.entries(service.variables()).forEach(([id2, variable]) => {
          if (!variable.deleted) {
            variables[id2] = variable;
          }
        });
        return {
          contents: [{ uri: GLOBAL_VARIABLES_URI, text: JSON.stringify(variables) }]
        };
      }
    );
    window.addEventListener("variables:updated", () => {
      mcpServer.server.sendResourceUpdated({
        uri: GLOBAL_VARIABLES_URI,
        contents: [{ uri: GLOBAL_VARIABLES_URI, text: localStorage["elementor-global-variables"] }]
      });
    });
  });
};

// src/mcp/manage-variable-tool.ts
var initManageVariableTool = () => {
  getMCPByDomain2("variables").addTool({
    name: "manage-global-variable",
    schema: {
      action: z3.enum(["create", "update", "delete"]).describe("Operation to perform"),
      id: z3.string().optional().describe("Variable id (required for update/delete). Get from list-global-variables."),
      type: z3.string().optional().describe('Variable type: "global-color-variable" or "global-font-variable" (required for create)'),
      label: z3.string().optional().describe("Variable label (required for create/update)"),
      value: z3.string().optional().describe("Variable value (required for create/update)")
    },
    outputSchema: {
      status: z3.enum(["ok"]).describe("Operation status"),
      message: z3.string().optional().describe("Error details if status is error")
    },
    modelPreferences: {
      intelligencePriority: 0.75,
      speedPriority: 0.75
    },
    requiredResources: [
      {
        uri: GLOBAL_VARIABLES_URI,
        description: "Global variables"
      }
    ],
    description: `Manages global variables (create/update/delete). Existing variables available in resources.
CREATE: requires type, label, value. Ensure label is unique.
UPDATE: requires id, label, value. When renaming: keep existing value. When updating value: keep exact label.
DELETE: requires id. DESTRUCTIVE - confirm with user first.

# NAMING - IMPORTANT
the variables names should ALWAYS be lowercased and dashed spaced. example: "Headline Primary" should be "headline-primary"
`,
    handler: async (params) => {
      const operations = getServiceActions(service);
      const op = operations[params.action];
      if (op) {
        await op(params);
        return {
          status: "ok"
        };
      }
      throw new Error(`Unknown action ${params.action}`);
    },
    isDestructive: true
    // Because delete is destructive
  });
};
function getServiceActions(svc) {
  return {
    create({ type, label, value }) {
      if (!type || !label || !value) {
        throw new Error("Create requires type, label, and value");
      }
      return svc.create({ type, label, value });
    },
    update({ id: id2, label, value }) {
      if (!id2 || !label || !value) {
        throw new Error("Update requires id, label, and value");
      }
      return svc.update(id2, { label, value });
    },
    delete({ id: id2 }) {
      if (!id2) {
        throw new Error("delete requires id");
      }
      return svc.delete(id2);
    }
  };
}

// src/mcp/index.ts
function initMcp() {
  if (!isAngieAvailable()) {
    return;
  }
  initManageVariableTool();
  initVariablesResource();
}

// src/register-variable-types.tsx
import * as React37 from "react";
import { colorPropTypeUtil, sizePropTypeUtil, stringPropTypeUtil } from "@elementor/editor-props";
import { CtaButton } from "@elementor/editor-ui";
import { isExperimentActive as isExperimentActive2 } from "@elementor/editor-v1-adapters";
import { BrushIcon, ExpandDiagonalIcon, ResetIcon, TextIcon as TextIcon2 } from "@elementor/icons";
import { __ as __26 } from "@wordpress/i18n";

// src/components/fields/color-field.tsx
import * as React35 from "react";
import { useRef as useRef11, useState as useState17 } from "react";
import { UnstableColorField } from "@elementor/ui";
var ColorField = ({ value, onChange, onValidationChange }) => {
  const [color, setColor] = useState17(value);
  const [errorMessage, setErrorMessage] = useState17("");
  const defaultRef = useRef11(null);
  const anchorRef = usePopoverContentRef() ?? defaultRef.current;
  const handleChange = (newValue) => {
    setColor(newValue);
    const errorMsg = validateValue(newValue);
    setErrorMessage(errorMsg);
    onValidationChange?.(errorMsg);
    onChange(errorMsg ? "" : newValue);
  };
  return /* @__PURE__ */ React35.createElement(
    UnstableColorField,
    {
      id: "color-variable-field",
      size: "tiny",
      fullWidth: true,
      value: color,
      onChange: handleChange,
      error: errorMessage || void 0,
      slotProps: {
        colorPicker: {
          anchorEl: anchorRef,
          anchorOrigin: { vertical: "top", horizontal: "right" },
          transformOrigin: { vertical: "top", horizontal: -10 },
          slotProps: {
            colorIndicator: {
              size: "inherit",
              sx: {
                borderRadius: 0.5
              }
            }
          }
        }
      }
    }
  );
};

// src/components/fields/font-field.tsx
import * as React36 from "react";
import { useId as useId4, useRef as useRef12, useState as useState18 } from "react";
import { enqueueFont as enqueueFont2, ItemSelector, useFontFamilies } from "@elementor/editor-controls";
import { useSectionWidth } from "@elementor/editor-ui";
import { ChevronDownIcon, TextIcon } from "@elementor/icons";
import { bindPopover as bindPopover4, bindTrigger as bindTrigger4, Popover as Popover4, UnstableTag, usePopupState as usePopupState6 } from "@elementor/ui";
import { __ as __25 } from "@wordpress/i18n";
var FontField = ({ value, onChange, onValidationChange }) => {
  const [fontFamily, setFontFamily] = useState18(value);
  const defaultRef = useRef12(null);
  const anchorRef = usePopoverContentRef() ?? defaultRef.current;
  const fontPopoverState = usePopupState6({ variant: "popover" });
  const fontFamilies = useFontFamilies();
  const sectionWidth = useSectionWidth();
  const mapFontSubs = React36.useMemo(() => {
    return fontFamilies.map(({ label, fonts }) => ({
      label,
      items: fonts
    }));
  }, [fontFamilies]);
  const handleChange = (newValue) => {
    setFontFamily(newValue);
    const errorMsg = validateValue(newValue);
    onValidationChange?.(errorMsg);
    onChange(errorMsg ? "" : newValue);
  };
  const handleFontFamilyChange = (newFontFamily) => {
    handleChange(newFontFamily);
    fontPopoverState.close();
  };
  const id2 = useId4();
  return /* @__PURE__ */ React36.createElement(React36.Fragment, null, /* @__PURE__ */ React36.createElement(
    UnstableTag,
    {
      id: id2,
      variant: "outlined",
      label: fontFamily,
      endIcon: /* @__PURE__ */ React36.createElement(ChevronDownIcon, { fontSize: "tiny" }),
      ...bindTrigger4(fontPopoverState),
      fullWidth: true
    }
  ), /* @__PURE__ */ React36.createElement(
    Popover4,
    {
      disablePortal: true,
      disableScrollLock: true,
      anchorEl: anchorRef,
      anchorOrigin: { vertical: "top", horizontal: "right" },
      transformOrigin: { vertical: "top", horizontal: -28 },
      ...bindPopover4(fontPopoverState)
    },
    /* @__PURE__ */ React36.createElement(
      ItemSelector,
      {
        id: "font-family-variables-selector",
        itemsList: mapFontSubs,
        selectedItem: fontFamily,
        onItemChange: handleFontFamilyChange,
        onClose: fontPopoverState.close,
        sectionWidth,
        title: __25("Font family", "elementor"),
        itemStyle: (item) => ({ fontFamily: item.value }),
        onDebounce: enqueueFont2,
        icon: TextIcon
      }
    )
  ));
};

// src/prop-types/size-variable-prop-type.ts
import { createPropUtils as createPropUtils3 } from "@elementor/editor-props";
import { z as z4 } from "@elementor/schema";
var sizeVariablePropTypeUtil = createPropUtils3("global-size-variable", z4.string());

// src/transformers/empty-transformer.tsx
import { createTransformer as createTransformer3 } from "@elementor/editor-canvas";
var EmptyTransformer = createTransformer3((_value) => {
  return null;
});

// src/register-variable-types.tsx
function registerVariableTypes() {
  registerVariableType({
    key: colorVariablePropTypeUtil.key,
    valueField: ColorField,
    icon: BrushIcon,
    propTypeUtil: colorVariablePropTypeUtil,
    fallbackPropTypeUtil: colorPropTypeUtil,
    variableType: "color",
    startIcon: ({ value }) => /* @__PURE__ */ React37.createElement(ColorIndicator, { size: "inherit", component: "span", value }),
    defaultValue: "#ffffff",
    menuActionsFactory: ({ variable, variableId, handlers }) => {
      const actions = [];
      if (!isExperimentActive2("e_design_system_sync")) {
        return [];
      }
      if (variable.sync_to_v3) {
        actions.push({
          name: __26("Stop syncing to Version 3", "elementor"),
          icon: ResetIcon,
          color: "text.primary",
          onClick: () => handlers.onStopSync(variableId)
        });
      } else {
        actions.push({
          name: __26("Sync to Version 3", "elementor"),
          icon: ResetIcon,
          color: "text.primary",
          onClick: () => handlers.onStartSync(variableId)
        });
      }
      return actions;
    }
  });
  registerVariableType({
    key: fontVariablePropTypeUtil.key,
    valueField: FontField,
    icon: TextIcon2,
    propTypeUtil: fontVariablePropTypeUtil,
    fallbackPropTypeUtil: stringPropTypeUtil,
    variableType: "font",
    defaultValue: "Roboto"
  });
  const sizePromotions = {
    isActive: false,
    icon: ExpandDiagonalIcon,
    propTypeUtil: sizeVariablePropTypeUtil,
    fallbackPropTypeUtil: sizePropTypeUtil,
    styleTransformer: EmptyTransformer,
    variableType: "size",
    selectionFilter: () => [],
    emptyState: /* @__PURE__ */ React37.createElement(CtaButton, { size: "small", href: "https://go.elementor.com/go-pro-panel-size-variable/" })
  };
  registerVariableType({
    ...sizePromotions,
    key: sizeVariablePropTypeUtil.key,
    defaultValue: "0px"
  });
  registerVariableType({
    ...sizePromotions,
    key: "global-custom-size-variable"
  });
}

// src/renderers/style-variables-renderer.tsx
import * as React38 from "react";
import { useEffect as useEffect6, useState as useState19 } from "react";
import {
  __privateUseListenTo as useListenTo,
  commandEndEvent,
  getCanvasIframeDocument
} from "@elementor/editor-v1-adapters";
import { Portal } from "@elementor/ui";
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
  return /* @__PURE__ */ React38.createElement(Portal, { container }, /* @__PURE__ */ React38.createElement("style", { "data-e-style-id": "e-variables", key: wrappedCss }, wrappedCss));
}
function usePortalContainer() {
  return useListenTo(commandEndEvent("editor/documents/attach-preview"), () => getCanvasIframeDocument()?.head);
}
function useStyleVariables() {
  const [variables, setVariables] = useState19({});
  useEffect6(() => {
    const unsubscribe = styleVariablesRepository.subscribe(setVariables);
    return () => {
      unsubscribe();
    };
  }, []);
  return variables;
}
function cssVariableDeclaration(key, variable) {
  const variableName = variable?.deleted ? key : variable.label;
  const value = variable.value;
  return `--${variableName}:${value};`;
}
function convertToCssVariables(variables) {
  const listOfVariables = Object.entries(variables);
  return listOfVariables.map(([key, variable]) => cssVariableDeclaration(key, variable)).join("");
}

// src/repeater-injections.ts
import { injectIntoRepeaterItemIcon, injectIntoRepeaterItemLabel } from "@elementor/editor-controls";
import { backgroundColorOverlayPropTypeUtil, shadowPropTypeUtil } from "@elementor/editor-props";

// src/components/variables-repeater-item-slot.tsx
import * as React39 from "react";
var useColorVariable = (value) => {
  const variableId = value?.value?.color?.value;
  return useVariable(variableId || "");
};
var BackgroundRepeaterColorIndicator = ({ value }) => {
  const colorVariable = useColorVariable(value);
  return /* @__PURE__ */ React39.createElement(ColorIndicator, { component: "span", size: "inherit", value: colorVariable?.value });
};
var BackgroundRepeaterLabel = ({ value }) => {
  const colorVariable = useColorVariable(value);
  return /* @__PURE__ */ React39.createElement("span", null, colorVariable?.label);
};
var BoxShadowRepeaterColorIndicator = ({ value }) => {
  const colorVariable = useColorVariable(value);
  return /* @__PURE__ */ React39.createElement(ColorIndicator, { component: "span", size: "inherit", value: colorVariable?.value });
};

// src/repeater-injections.ts
function registerRepeaterInjections() {
  injectIntoRepeaterItemIcon({
    id: "color-variables-background-icon",
    component: BackgroundRepeaterColorIndicator,
    condition: ({ value: prop }) => {
      return hasAssignedColorVariable(backgroundColorOverlayPropTypeUtil.extract(prop)?.color);
    }
  });
  injectIntoRepeaterItemIcon({
    id: "color-variables-icon",
    component: BoxShadowRepeaterColorIndicator,
    condition: ({ value: prop }) => {
      return hasAssignedColorVariable(shadowPropTypeUtil.extract(prop)?.color);
    }
  });
  injectIntoRepeaterItemLabel({
    id: "color-variables-label",
    component: BackgroundRepeaterLabel,
    condition: ({ value: prop }) => {
      return hasAssignedColorVariable(backgroundColorOverlayPropTypeUtil.extract(prop)?.color);
    }
  });
}
var hasAssignedColorVariable = (propValue) => {
  return !!colorVariablePropTypeUtil.isValid(propValue);
};

// src/init.ts
var { registerPopoverAction } = controlActionsMenu;
function init() {
  registerVariableTypes();
  registerRepeaterInjections();
  registerControlReplacement({
    component: VariableControl,
    condition: ({ value, placeholder }) => {
      if (hasVariableAssigned(value)) {
        return true;
      }
      if (value) {
        return false;
      }
      return hasVariableAssigned(placeholder);
    }
  });
  registerPopoverAction({
    id: "variables",
    priority: 40,
    useProps: usePropVariableAction
  });
  service.init().then(() => {
    initMcp();
  });
  injectIntoTop({
    id: "canvas-style-variables-render",
    component: StyleVariablesRenderer
  });
  injectIntoLogic({
    id: "variables-open-panel-from-url",
    component: OpenPanelFromUrl
  });
  registerPanel(panel);
}
function hasVariableAssigned(value) {
  if (isTransformable2(value)) {
    return hasVariableType(value.$$type);
  }
  return false;
}

// src/utils/llm-propvalue-label-resolver.ts
var defaultResolver = (key) => (value) => {
  const idOrLabel = String(value);
  return {
    $$type: key,
    value: service.variables()[idOrLabel] ? idOrLabel : service.findIdByLabel(idOrLabel)
  };
};
var globalVariablesLLMResolvers = {
  "global-color-variable": defaultResolver("global-color-variable"),
  "global-font-variable": defaultResolver("global-font-variable"),
  "global-size-variable": defaultResolver("global-size-variable")
};

// src/index.ts
var Utils = {
  globalVariablesLLMResolvers
};
export {
  GLOBAL_VARIABLES_URI,
  Utils,
  getMenuActionsForVariable,
  hasVariable,
  init,
  registerVariableType,
  registerVariableTypes,
  service,
  sizeVariablePropTypeUtil
};
//# sourceMappingURL=index.mjs.map