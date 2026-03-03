"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ELEMENT_STYLE_CHANGE_EVENT: () => ELEMENT_STYLE_CHANGE_EVENT,
  createElement: () => createElement,
  createElementStyle: () => createElementStyle,
  createElements: () => createElements,
  deleteElement: () => deleteElement,
  deleteElementStyle: () => deleteElementStyle,
  dropElement: () => dropElement,
  duplicateElement: () => duplicateElement,
  duplicateElements: () => duplicateElements,
  findChildRecursive: () => findChildRecursive,
  generateElementId: () => generateElementId,
  getAllDescendants: () => getAllDescendants,
  getAnchoredAncestorId: () => getAnchoredAncestorId,
  getAnchoredDescendantId: () => getAnchoredDescendantId,
  getContainer: () => getContainer,
  getCurrentDocumentContainer: () => getCurrentDocumentContainer,
  getCurrentDocumentId: () => getCurrentDocumentId,
  getElementChildrenWithFallback: () => getElementChildren,
  getElementEditorSettings: () => getElementEditorSettings,
  getElementInteractions: () => getElementInteractions,
  getElementLabel: () => getElementLabel,
  getElementSetting: () => getElementSetting,
  getElementSettings: () => getElementSettings,
  getElementStyles: () => getElementStyles,
  getElementType: () => getElementType,
  getElements: () => getElements,
  getLinkInLinkRestriction: () => getLinkInLinkRestriction,
  getSelectedElements: () => getSelectedElements,
  getWidgetsCache: () => getWidgetsCache,
  isElementAnchored: () => isElementAnchored,
  moveElement: () => moveElement,
  moveElements: () => moveElements,
  playElementInteractions: () => playElementInteractions,
  removeElements: () => removeElements,
  replaceElement: () => replaceElement,
  selectElement: () => selectElement,
  shouldCreateNewLocalStyle: () => shouldCreateNewLocalStyle,
  styleRerenderEvents: () => styleRerenderEvents,
  updateElementEditorSettings: () => updateElementEditorSettings,
  updateElementInteractions: () => updateElementInteractions,
  updateElementSettings: () => updateElementSettings,
  updateElementStyle: () => updateElementStyle,
  useElementChildren: () => useElementChildren,
  useElementEditorSettings: () => useElementEditorSettings,
  useElementInteractions: () => useElementInteractions,
  useParentElement: () => useParentElement,
  useSelectedElement: () => useSelectedElement,
  useSelectedElementSettings: () => useSelectedElementSettings
});
module.exports = __toCommonJS(index_exports);

// src/hooks/use-element-children.ts
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");

// src/sync/get-container.ts
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
function getContainer(id) {
  const extendedWindow = window;
  const container = extendedWindow.elementor?.getContainer?.(id);
  return container ?? null;
}
var selectElement = (elementId) => {
  try {
    const container = getContainer(elementId);
    (0, import_editor_v1_adapters.__privateRunCommand)("document/elements/select", { container });
  } catch {
  }
};

// src/sync/model-utils.ts
function findChildRecursive(model, predicate) {
  const childModels = model.get("elements") ?? [];
  for (const childModel of childModels) {
    if (predicate(childModel)) {
      return { model: childModel };
    }
    const found = findChildRecursive(childModel, predicate);
    if (found) {
      return found;
    }
  }
  return null;
}
function getElementChildren(model, predicate) {
  const childModels = model.get("elements") ?? [];
  return childModels.filter((childModel) => !predicate || predicate(childModel)).map((childModel) => ({ model: childModel }));
}

// src/hooks/use-element-children.ts
function toElementModel({ model }) {
  return {
    id: model.get("id"),
    editorSettings: model.get("editor_settings") ?? {}
  };
}
function useElementChildren(elementId, childrenTypes) {
  return (0, import_editor_v1_adapters2.__privateUseListenTo)(
    [
      (0, import_editor_v1_adapters2.v1ReadyEvent)(),
      (0, import_editor_v1_adapters2.commandEndEvent)("document/elements/create"),
      (0, import_editor_v1_adapters2.commandEndEvent)("document/elements/delete"),
      (0, import_editor_v1_adapters2.commandEndEvent)("document/elements/update"),
      (0, import_editor_v1_adapters2.commandEndEvent)("document/elements/set-settings")
    ],
    () => {
      const container = getContainer(elementId);
      const model = container?.model;
      if (!model) {
        return {};
      }
      const elementChildren = Object.entries(childrenTypes).reduce((acc, [parentType, childType]) => {
        const parent = findChildRecursive(model, (m) => m.get("elType") === parentType);
        if (!parent) {
          acc[childType] = [];
          return acc;
        }
        const children = getElementChildren(parent.model, (m) => m.get("elType") === childType);
        acc[childType] = children.map(toElementModel);
        return acc;
      }, {});
      return elementChildren;
    },
    [elementId]
  );
}

// src/hooks/use-element-editor-settings.ts
var import_editor_v1_adapters3 = require("@elementor/editor-v1-adapters");

// src/sync/get-element-editor-settings.ts
function getElementEditorSettings(elementId) {
  const container = getContainer(elementId);
  return container?.model.get("editor_settings") ?? {};
}

// src/hooks/use-element-editor-settings.ts
var useElementEditorSettings = (elementId) => {
  return (0, import_editor_v1_adapters3.__privateUseListenTo)(
    (0, import_editor_v1_adapters3.windowEvent)("elementor/element/update_editor_settings"),
    () => getElementEditorSettings(elementId),
    [elementId]
  );
};

// src/hooks/use-parent-element.ts
var import_editor_v1_adapters4 = require("@elementor/editor-v1-adapters");
function useParentElement(elementId) {
  return (0, import_editor_v1_adapters4.__privateUseListenTo)(
    [(0, import_editor_v1_adapters4.commandEndEvent)("document/elements/create")],
    () => {
      if (!elementId) {
        return null;
      }
      const extendedWindow = window;
      const element = extendedWindow?.elementor?.getContainer?.(elementId);
      if (!element) {
        return null;
      }
      return element.parent;
    },
    [elementId]
  );
}

// src/hooks/use-selected-element.ts
var import_editor_v1_adapters5 = require("@elementor/editor-v1-adapters");

// src/sync/get-widgets-cache.ts
function getWidgetsCache() {
  const extendedWindow = window;
  return extendedWindow?.elementor?.widgetsCache || null;
}

// src/sync/get-element-type.ts
function getElementType(type) {
  if (!type) {
    return null;
  }
  const widgetsCache = getWidgetsCache();
  const elementType = widgetsCache?.[type];
  if (!elementType?.atomic_controls) {
    return null;
  }
  if (!elementType?.atomic_props_schema) {
    return null;
  }
  return {
    key: type,
    controls: elementType.atomic_controls,
    propsSchema: elementType.atomic_props_schema,
    dependenciesPerTargetMapping: elementType.dependencies_per_target_mapping ?? {},
    title: elementType.title,
    styleStates: elementType.atomic_style_states ?? [],
    pseudoStates: elementType.atomic_pseudo_states ?? []
  };
}

// src/sync/get-selected-elements.ts
function getSelectedElements() {
  const extendedWindow = window;
  const selectedElements = extendedWindow.elementor?.selection?.getElements?.() ?? [];
  return selectedElements.reduce((acc, el) => {
    const type = el.model.get("widgetType") || el.model.get("elType");
    if (type) {
      acc.push({
        id: el.model.get("id"),
        type
      });
    }
    return acc;
  }, []);
}
function getSelectedElement() {
  const elements = getSelectedElements();
  const [element] = elements;
  const elementType = getElementType(element?.type);
  if (elements.length !== 1 || !elementType || !element) {
    return { element: null, elementType: null };
  }
  return { element, elementType };
}

// src/hooks/use-selected-element.ts
function useSelectedElement() {
  return (0, import_editor_v1_adapters5.__privateUseListenTo)(
    [
      (0, import_editor_v1_adapters5.commandEndEvent)("document/elements/select"),
      (0, import_editor_v1_adapters5.commandEndEvent)("document/elements/deselect"),
      (0, import_editor_v1_adapters5.commandEndEvent)("document/elements/select-all"),
      (0, import_editor_v1_adapters5.commandEndEvent)("document/elements/deselect-all")
    ],
    getSelectedElement
  );
}

// src/hooks/use-selected-element-settings.ts
var import_editor_v1_adapters6 = require("@elementor/editor-v1-adapters");

// src/sync/get-element-setting.ts
var getElementSetting = (elementId, settingKey) => {
  const container = getContainer(elementId);
  return container?.settings?.get(settingKey) ?? null;
};
var getElementSettings = (elementId, settingKey) => {
  return Object.fromEntries(settingKey.map((key) => [key, getElementSetting(elementId, key)]));
};

// src/hooks/use-selected-element-settings.ts
function useSelectedElementSettings() {
  return (0, import_editor_v1_adapters6.__privateUseListenTo)(
    [
      (0, import_editor_v1_adapters6.commandEndEvent)("document/elements/select"),
      (0, import_editor_v1_adapters6.commandEndEvent)("document/elements/deselect"),
      (0, import_editor_v1_adapters6.commandEndEvent)("document/elements/select-all"),
      (0, import_editor_v1_adapters6.commandEndEvent)("document/elements/deselect-all"),
      (0, import_editor_v1_adapters6.commandEndEvent)("document/elements/set-settings")
    ],
    () => {
      const { element, elementType } = getSelectedElement();
      if (!element || !elementType) {
        return { element: null, elementType: null, settings: null };
      }
      const settings = getElementSettings(element.id, Object.keys(elementType.propsSchema));
      return {
        element,
        elementType,
        settings
      };
    }
  );
}

// src/sync/create-element.ts
var import_editor_v1_adapters7 = require("@elementor/editor-v1-adapters");
function createElement({ container, model, options }) {
  return (0, import_editor_v1_adapters7.__privateRunCommandSync)("document/elements/create", {
    container,
    model,
    options: { edit: false, ...options }
  });
}

// src/sync/create-elements.ts
var import_editor_v1_adapters9 = require("@elementor/editor-v1-adapters");
var import_i18n = require("@wordpress/i18n");

// src/sync/delete-element.ts
var import_editor_v1_adapters8 = require("@elementor/editor-v1-adapters");
function deleteElement({ container, options = {} }) {
  return (0, import_editor_v1_adapters8.__privateRunCommand)("document/elements/delete", {
    container,
    options
  });
}

// src/sync/create-elements.ts
var createElements = ({
  elements,
  title,
  subtitle = (0, import_i18n.__)("Item added", "elementor")
}) => {
  const undoableCreate = (0, import_editor_v1_adapters9.undoable)(
    {
      do: ({ elements: elementsParam }) => {
        const createdElements = [];
        elementsParam.forEach(({ container, options, ...elementParams }) => {
          const parentContainer = container.lookup?.() ?? container;
          if (!parentContainer) {
            throw new Error("Parent container not found");
          }
          const element = createElement({
            container: parentContainer,
            ...elementParams,
            options: { ...options, useHistory: false }
          });
          createdElements.push({
            container: element,
            parentContainer,
            model: element.model?.toJSON() || {},
            options
          });
        });
        return { createdElements };
      },
      undo: (_, { createdElements }) => {
        [...createdElements].reverse().forEach(({ container }) => {
          const freshContainer = container.lookup?.();
          if (freshContainer) {
            deleteElement({
              container: freshContainer,
              options: { useHistory: false }
            });
          }
        });
      },
      redo: (_, { createdElements }) => {
        const newElements = [];
        createdElements.forEach(({ parentContainer, model, options }) => {
          const freshParent = parentContainer.lookup?.();
          if (!freshParent) {
            return;
          }
          const element = createElement({
            container: freshParent,
            model,
            options: { ...options, useHistory: false }
          });
          newElements.push({
            container: element,
            parentContainer: freshParent,
            model: element.model.toJSON(),
            options
          });
        });
        return { createdElements: newElements };
      }
    },
    {
      title,
      subtitle
    }
  );
  return undoableCreate({ elements });
};

// src/sync/drop-element.ts
var import_editor_v1_adapters10 = require("@elementor/editor-v1-adapters");
function dropElement({ containerId, model, options }) {
  const container = getContainer(containerId);
  if (!container) {
    throw new Error(`Container with ID "${containerId}" not found`);
  }
  return (0, import_editor_v1_adapters10.__privateRunCommandSync)("preview/drop", {
    container,
    model,
    options
  });
}

// src/sync/duplicate-element.ts
var import_editor_v1_adapters11 = require("@elementor/editor-v1-adapters");
function duplicateElement({ element, options = {} }) {
  const currentIndex = element.view?._index ?? 0;
  const insertPosition = options.clone !== false ? currentIndex + 1 : void 0;
  return (0, import_editor_v1_adapters11.__privateRunCommandSync)("document/elements/duplicate", {
    container: element,
    options: { at: insertPosition, edit: false, ...options }
  });
}

// src/sync/duplicate-elements.ts
var import_editor_v1_adapters12 = require("@elementor/editor-v1-adapters");
var import_i18n2 = require("@wordpress/i18n");
var duplicateElements = ({
  elementIds,
  title,
  subtitle = (0, import_i18n2.__)("Item duplicated", "elementor"),
  onDuplicateElements,
  onRestoreElements
}) => {
  const undoableDuplicate = (0, import_editor_v1_adapters12.undoable)(
    {
      do: ({ elementIds: elementIdsToDuplicate }) => {
        onDuplicateElements?.();
        const duplicatedElements = [];
        elementIdsToDuplicate.forEach((elementId) => {
          const originalContainer = getContainer(elementId);
          if (!originalContainer?.parent) {
            return;
          }
          const duplicatedElement = duplicateElement({
            element: originalContainer,
            options: { useHistory: false }
          });
          if (!duplicatedElement.parent) {
            return;
          }
          duplicatedElements.push({
            container: duplicatedElement,
            parentContainer: duplicatedElement.parent,
            model: duplicatedElement.model.toJSON(),
            at: duplicatedElement.view?._index
          });
        });
        return { duplicatedElements };
      },
      undo: (_, { duplicatedElements }) => {
        onRestoreElements?.();
        [...duplicatedElements].reverse().forEach(({ container }) => {
          deleteElement({
            container,
            options: { useHistory: false }
          });
        });
      },
      redo: (_, { duplicatedElements: previousElements }) => {
        onDuplicateElements?.();
        const duplicatedElements = [];
        previousElements.forEach(({ parentContainer, model, at }) => {
          const freshParent = parentContainer.lookup?.();
          if (freshParent) {
            const createdElement = createElement({
              container: freshParent,
              model,
              options: { useHistory: false, clone: false, at }
            });
            duplicatedElements.push({
              container: createdElement,
              parentContainer: freshParent,
              model,
              at
            });
          }
        });
        return { duplicatedElements };
      }
    },
    {
      title,
      subtitle
    }
  );
  return undoableDuplicate({ elementIds });
};

// src/sync/generate-element-id.ts
var generateElementId = () => {
  const extendedWindow = window;
  return extendedWindow.elementorCommon?.helpers?.getUniqueId?.() ?? `el-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// src/sync/get-current-document-container.ts
function getCurrentDocumentContainer() {
  const extendedWindow = window;
  return extendedWindow.elementor?.documents?.getCurrent?.()?.container ?? null;
}

// src/sync/get-current-document-id.ts
function getCurrentDocumentId() {
  const extendedWindow = window;
  return extendedWindow.elementor?.documents?.getCurrentId?.() ?? null;
}

// src/errors.ts
var import_utils = require("@elementor/utils");
var ElementNotFoundError = (0, import_utils.createError)({
  code: "element_not_found",
  message: "Element not found."
});
var StyleNotFoundError = (0, import_utils.createError)({
  code: "style_not_found",
  message: "Style not found."
});
var ElementTypeNotExistsError = (0, import_utils.createError)({
  code: "element_type_not_exists",
  message: "Element type does not exist."
});
var ElementLabelNotExistsError = (0, import_utils.createError)({
  code: "element_label_not_exists",
  message: "Element label does not exist."
});
var ElementParentNotFoundError = (0, import_utils.createError)({
  code: "element_parent_not_found",
  message: "Element parent not found."
});
var ElementIndexNotFoundError = (0, import_utils.createError)({
  code: "element_index_not_found",
  message: "Element index not found."
});

// src/sync/get-element-label.ts
function getElementLabel(elementId) {
  if (!elementId) {
    elementId = getSelectedElements()?.[0]?.id;
  }
  const container = getContainer(elementId);
  const type = container?.model.get("widgetType") || container?.model.get("elType");
  if (!type) {
    throw new ElementTypeNotExistsError({ context: { elementId } });
  }
  const label = getWidgetsCache()?.[type]?.title;
  if (!label) {
    throw new ElementLabelNotExistsError({ context: { elementType: type } });
  }
  return label;
}

// src/sync/get-element-styles.ts
var getElementStyles = (elementID) => {
  const container = getContainer(elementID);
  return container?.model.get("styles") || null;
};

// src/sync/get-all-descendants.ts
function getAllDescendants(container) {
  const children = (container.children ?? []).flatMap((child) => getAllDescendants(child));
  return [container, ...children];
}

// src/sync/get-elements.ts
function getElements(root) {
  const container = root ? getContainer(root) : getCurrentDocumentContainer();
  if (!container) {
    return [];
  }
  const children = [...container.model.get("elements") ?? []].flatMap(
    (childModel) => getElements(childModel.get("id"))
  );
  return [container, ...children];
}

// src/sync/move-element.ts
function moveElement({ element, targetContainer, options = {} }) {
  const resolvedElement = element.lookup?.();
  const resolvedTarget = targetContainer.lookup?.();
  if (!resolvedElement) {
    throw new Error(`Element not found: ${element.id}`);
  }
  if (!resolvedTarget) {
    throw new Error(`Target container not found: ${targetContainer.id}`);
  }
  const modelToRecreate = resolvedElement.model.toJSON();
  deleteElement({
    container: resolvedElement,
    options: { ...options, useHistory: false }
  });
  const newContainer = createElement({
    container: resolvedTarget,
    model: modelToRecreate,
    options: { edit: false, ...options, useHistory: false }
  });
  return newContainer;
}

// src/sync/move-elements.ts
var import_editor_v1_adapters13 = require("@elementor/editor-v1-adapters");
var import_i18n3 = require("@wordpress/i18n");
var moveElements = ({
  moves: movesToMake,
  title,
  subtitle = (0, import_i18n3.__)("Elements moved", "elementor"),
  onMoveElements,
  onRestoreElements
}) => {
  const undoableMove = (0, import_editor_v1_adapters13.undoable)(
    {
      do: ({ moves }) => {
        const movedElements = [];
        onMoveElements?.();
        moves.forEach(({ element, targetContainer, options }) => {
          const sourceElement = element.lookup?.() ?? element;
          const target = targetContainer.lookup?.() ?? targetContainer;
          if (!sourceElement) {
            throw new Error("Element not found");
          }
          if (!target) {
            throw new Error("Target container not found");
          }
          if (!sourceElement.parent) {
            throw new Error("Element has no parent container");
          }
          const originalContainer = sourceElement.parent;
          const originalIndex = originalContainer.children?.indexOf(sourceElement) ?? -1;
          const newElement = moveElement({
            element: sourceElement,
            targetContainer: target,
            options: { ...options, useHistory: false }
          });
          movedElements.push({
            element: newElement,
            originalContainer,
            originalIndex,
            targetContainer: target,
            options
          });
        });
        return { movedElements };
      },
      undo: (_, { movedElements }) => {
        onRestoreElements?.();
        [...movedElements].reverse().forEach(({ element, originalContainer, originalIndex }) => {
          const freshElement = element.lookup?.();
          const freshOriginalContainer = originalContainer.lookup?.();
          if (!freshElement || !freshOriginalContainer) {
            return;
          }
          moveElement({
            element: freshElement,
            targetContainer: freshOriginalContainer,
            options: {
              useHistory: false,
              at: originalIndex >= 0 ? originalIndex : void 0
            }
          });
        });
      },
      redo: (_, { movedElements }) => {
        const newMovedElements = [];
        onMoveElements?.();
        movedElements.forEach(({ element, originalContainer, originalIndex, targetContainer, options }) => {
          const freshElement = element.lookup?.();
          const freshOriginalContainer = originalContainer.lookup?.();
          const freshTarget = targetContainer.lookup?.();
          if (!freshElement || !freshOriginalContainer || !freshTarget) {
            return;
          }
          const newElement = moveElement({
            element: freshElement,
            targetContainer: freshTarget,
            options: { ...options, useHistory: false }
          });
          newMovedElements.push({
            element: newElement,
            originalContainer: freshOriginalContainer,
            originalIndex,
            targetContainer: freshTarget,
            options
          });
        });
        return { movedElements: newMovedElements };
      }
    },
    {
      title,
      subtitle
    }
  );
  return undoableMove({ moves: movesToMake });
};

// src/sync/remove-elements.ts
var import_editor_v1_adapters14 = require("@elementor/editor-v1-adapters");
var import_i18n4 = require("@wordpress/i18n");
var removeElements = ({
  elementIds,
  title,
  subtitle = (0, import_i18n4.__)("Item removed", "elementor"),
  onRemoveElements,
  onRestoreElements
}) => {
  const undoableRemove = (0, import_editor_v1_adapters14.undoable)(
    {
      do: ({ elementIds: elementIdsParam }) => {
        const removedElements = [];
        elementIdsParam.forEach((elementId) => {
          const container = getContainer(elementId);
          if (container?.parent) {
            removedElements.push({
              container,
              parent: container.parent,
              model: container.model.toJSON(),
              at: container.view?._index ?? 0
            });
          }
        });
        onRemoveElements?.();
        removedElements.forEach(({ container }) => {
          deleteElement({
            container,
            options: { useHistory: false }
          });
        });
        return { removedElements };
      },
      undo: (_, { removedElements }) => {
        onRestoreElements?.();
        [...removedElements].reverse().forEach(({ parent, model, at }) => {
          const freshParent = parent.lookup?.();
          if (freshParent) {
            createElement({
              container: freshParent,
              model,
              options: { useHistory: false, at }
            });
          }
        });
      },
      redo: (_, { removedElements }) => {
        onRemoveElements?.();
        const newRemovedElements = [];
        removedElements.forEach(({ container, parent, model, at }) => {
          const freshContainer = container.lookup?.();
          const freshParent = parent.lookup?.();
          if (!freshContainer || !freshParent) {
            return;
          }
          deleteElement({
            container: freshContainer,
            options: { useHistory: false }
          });
          newRemovedElements.push({
            container: freshContainer,
            parent: freshParent,
            model,
            at
          });
        });
        return { removedElements: newRemovedElements };
      }
    },
    {
      title,
      subtitle
    }
  );
  return undoableRemove({ elementIds });
};

// src/sync/replace-element.ts
var replaceElement = async ({ currentElement, newElement, withHistory = true }) => {
  const currentElementContainer = getContainer(currentElement.id);
  if (!currentElementContainer) {
    throw new ElementNotFoundError({ context: { elementId: currentElement.id } });
  }
  const { container, index } = getNewElementContainer(currentElementContainer, newElement);
  const newElementInstance = createElement({
    container,
    model: newElement,
    options: { at: index, useHistory: withHistory }
  });
  await deleteElement({ container: currentElementContainer, options: { useHistory: withHistory } });
  return newElementInstance;
};
function getNewElementContainer(currentElementContainer, newElement) {
  const { parent } = currentElementContainer;
  if (!parent) {
    throw new ElementParentNotFoundError({ context: { elementId: currentElementContainer.id } });
  }
  const elementIndex = currentElementContainer.view?._index ?? 0;
  if (elementIndex === -1) {
    throw new ElementIndexNotFoundError({ context: { elementId: currentElementContainer.id } });
  }
  let location = { container: parent, index: elementIndex };
  if (parent.id === "document" && newElement.elType === "widget") {
    location = createWrapperForWidget(parent, elementIndex);
  }
  return location;
}
var DEFAULT_CONTAINER_TYPE = "e-flexbox";
function createWrapperForWidget(parent, elementIndex) {
  const container = createElement({
    container: parent,
    model: { elType: DEFAULT_CONTAINER_TYPE },
    options: { at: elementIndex, useHistory: false }
  });
  return { container, index: 0 };
}

// src/sync/update-element-editor-settings.ts
var import_editor_v1_adapters15 = require("@elementor/editor-v1-adapters");
var updateElementEditorSettings = ({
  elementId,
  settings
}) => {
  const element = getContainer(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }
  const editorSettings = element.model.get("editor_settings") ?? {};
  element.model.set("editor_settings", { ...editorSettings, ...settings });
  (0, import_editor_v1_adapters15.__privateRunCommandSync)("document/save/set-is-modified", { status: true }, { internal: true });
};

// src/sync/update-element-settings.ts
var import_editor_v1_adapters16 = require("@elementor/editor-v1-adapters");
var updateElementSettings = ({ id, props, withHistory = true }) => {
  const container = getContainer(id);
  if (!container) {
    return;
  }
  const args = {
    container,
    settings: { ...props }
  };
  if (withHistory) {
    (0, import_editor_v1_adapters16.__privateRunCommandSync)("document/elements/settings", args);
  } else {
    (0, import_editor_v1_adapters16.__privateRunCommandSync)("document/elements/set-settings", args, { internal: true });
  }
};

// src/link-restriction.ts
var ANCHOR_SELECTOR = "a, [data-action-link]";
function getLinkInLinkRestriction(elementId, resolvedValue) {
  const anchoredDescendantId = getAnchoredDescendantId(elementId);
  if (anchoredDescendantId) {
    return {
      shouldRestrict: true,
      reason: "descendant",
      elementId: anchoredDescendantId
    };
  }
  const hasInlineLink = checkForInlineLink(elementId, resolvedValue);
  if (hasInlineLink) {
    return {
      shouldRestrict: true,
      reason: "descendant",
      elementId
    };
  }
  const ancestor = getAnchoredAncestorId(elementId);
  if (ancestor) {
    return {
      shouldRestrict: true,
      reason: "ancestor",
      elementId: ancestor
    };
  }
  return {
    shouldRestrict: false
  };
}
function getAnchoredDescendantId(elementId) {
  const element = getElementDOM(elementId);
  if (!element) {
    return null;
  }
  for (const childAnchorElement of Array.from(element.querySelectorAll(ANCHOR_SELECTOR))) {
    const childElementId = findElementIdOf(childAnchorElement);
    if (childElementId !== elementId) {
      return childElementId;
    }
  }
  return null;
}
function getAnchoredAncestorId(elementId) {
  const element = getElementDOM(elementId);
  if (!element || element.parentElement === null) {
    return null;
  }
  const parentAnchor = element.parentElement.closest(ANCHOR_SELECTOR);
  return parentAnchor ? findElementIdOf(parentAnchor) : null;
}
function isElementAnchored(elementId) {
  const element = getElementDOM(elementId);
  if (!element) {
    return false;
  }
  if (element.matches(ANCHOR_SELECTOR)) {
    return true;
  }
  return doesElementContainAnchor(element);
}
function doesElementContainAnchor(element) {
  for (const child of Array.from(element.children)) {
    if (isElementorElement(child)) {
      continue;
    }
    if (child.matches(ANCHOR_SELECTOR)) {
      return true;
    }
    if (doesElementContainAnchor(child)) {
      return true;
    }
  }
  return false;
}
function findElementIdOf(element) {
  return element.closest("[data-id]")?.dataset.id || null;
}
function checkForInlineLink(elementId, resolvedValue) {
  const element = getElementDOM(elementId);
  if (!element) {
    return false;
  }
  if (element.matches(ANCHOR_SELECTOR)) {
    return false;
  }
  const linkSetting = resolvedValue ?? getElementSetting(elementId, "link")?.value;
  if (linkSetting?.destination) {
    return false;
  }
  return element.querySelector(ANCHOR_SELECTOR) !== null;
}
function getElementDOM(id) {
  try {
    return getContainer(id)?.view?.el || null;
  } catch {
    return null;
  }
}
function isElementorElement(element) {
  return element.hasAttribute("data-id");
}

// src/styles/consts.ts
var import_editor_v1_adapters17 = require("@elementor/editor-v1-adapters");
var ELEMENT_STYLE_CHANGE_EVENT = "elementor/editor-v2/editor-elements/style";
var styleRerenderEvents = [
  (0, import_editor_v1_adapters17.commandEndEvent)("document/elements/create"),
  (0, import_editor_v1_adapters17.commandEndEvent)("document/elements/duplicate"),
  (0, import_editor_v1_adapters17.commandEndEvent)("document/elements/import"),
  (0, import_editor_v1_adapters17.commandEndEvent)("document/elements/paste"),
  (0, import_editor_v1_adapters17.windowEvent)(ELEMENT_STYLE_CHANGE_EVENT)
];

// src/styles/create-element-style.ts
var import_editor_props2 = require("@elementor/editor-props");
var import_editor_styles = require("@elementor/editor-styles");

// src/styles/mutate-element-styles.ts
var import_editor_props = require("@elementor/editor-props");
var import_editor_v1_adapters18 = require("@elementor/editor-v1-adapters");
function mutateElementStyles(elementId, mutator) {
  const container = getContainer(elementId);
  if (!container) {
    throw new ElementNotFoundError({ context: { elementId } });
  }
  const oldIds = Object.keys(container.model.get("styles") ?? {});
  const styles = mutateStyles(container, mutator);
  const newIds = Object.keys(styles);
  clearRemovedClasses(container, {
    oldIds,
    newIds
  });
  notifyChanges();
  return styles;
}
function mutateStyles(container, mutator) {
  const styles = structuredClone(container.model.get("styles")) ?? {};
  const entries = Object.entries(mutator(styles)).map(([styleId, style]) => {
    style.variants = removeEmptyVariants(style);
    return [styleId, style];
  }).filter(([, style]) => {
    return !isStyleEmpty(style);
  });
  const mutatedStyles = Object.fromEntries(entries);
  container.model.set("styles", mutatedStyles);
  return mutatedStyles;
}
function removeEmptyVariants(style) {
  return style.variants.filter(
    ({ props, custom_css: customCss }) => Object.keys(props).length > 0 || customCss?.raw
  );
}
function isStyleEmpty(style) {
  return style.variants.length === 0;
}
function clearRemovedClasses(container, { oldIds, newIds }) {
  const removedIds = oldIds.filter((id) => !newIds.includes(id));
  const classesProps = structuredClone(getClassesProps(container));
  classesProps.forEach(([, prop]) => {
    prop.value = prop.value.filter((value) => !removedIds.includes(value));
  });
  updateElementSettings({
    id: container.id,
    props: Object.fromEntries(classesProps),
    withHistory: false
  });
}
function getClassesProps(container) {
  return Object.entries(container.settings.toJSON()).filter((prop) => {
    const [, value] = prop;
    return import_editor_props.classesPropTypeUtil.isValid(value);
  });
}
function notifyChanges() {
  dispatchChangeEvent();
  (0, import_editor_v1_adapters18.__privateRunCommandSync)("document/save/set-is-modified", { status: true }, { internal: true });
}
function dispatchChangeEvent() {
  window.dispatchEvent(new CustomEvent(ELEMENT_STYLE_CHANGE_EVENT));
}

// src/styles/create-element-style.ts
function createElementStyle({
  styleId,
  elementId,
  classesProp,
  label,
  meta,
  props,
  custom_css: customCss = null,
  additionalVariants = []
}) {
  let id = styleId;
  mutateElementStyles(elementId, (styles) => {
    id ??= (0, import_editor_styles.generateId)(`e-${elementId}-`, Object.keys(styles));
    const variants = [{ meta, props, custom_css: customCss }, ...additionalVariants];
    styles[id] = {
      id,
      label,
      type: "class",
      variants
    };
    addStyleToClassesProp(elementId, classesProp, id);
    return styles;
  });
  return id;
}
function addStyleToClassesProp(elementId, classesProp, styleId) {
  const base = getElementSetting(elementId, classesProp);
  const classesPropValue = import_editor_props2.classesPropTypeUtil.create(
    (prev) => {
      return [...prev ?? [], styleId];
    },
    { base }
  );
  updateElementSettings({
    id: elementId,
    props: {
      [classesProp]: classesPropValue
    },
    withHistory: false
  });
}
function shouldCreateNewLocalStyle(payload) {
  return !payload?.styleId && !payload?.provider;
}

// src/styles/delete-element-style.ts
function deleteElementStyle(elementId, styleId) {
  mutateElementStyles(elementId, (styles) => {
    delete styles[styleId];
    return styles;
  });
}

// src/styles/update-element-style.ts
var import_editor_props3 = require("@elementor/editor-props");
var import_editor_styles2 = require("@elementor/editor-styles");
function updateElementStyle(args) {
  mutateElementStyles(args.elementId, (styles) => {
    const style = styles[args.styleId];
    if (!style) {
      throw new StyleNotFoundError({ context: { styleId: args.styleId } });
    }
    const variant = (0, import_editor_styles2.getVariantByMeta)(style, args.meta);
    const customCss = ("custom_css" in args ? args.custom_css : variant?.custom_css) ?? null;
    if (variant) {
      variant.props = (0, import_editor_props3.mergeProps)(variant.props, args.props);
      variant.custom_css = customCss?.raw ? customCss : null;
    } else {
      style.variants.push({ meta: args.meta, props: args.props, custom_css: customCss });
    }
    return styles;
  });
}

// src/hooks/use-element-interactions.ts
var import_react = require("react");
var import_editor_v1_adapters19 = require("@elementor/editor-v1-adapters");

// src/sync/get-element-interactions.ts
function getElementInteractions(elementId) {
  const container = getContainer(elementId);
  const interactions = container?.model?.get("interactions");
  if (typeof interactions === "string") {
    return JSON.parse(interactions);
  }
  return interactions;
}

// src/hooks/use-element-interactions.ts
var useElementInteractions = (elementId) => {
  const [interactions, setInteractions] = (0, import_react.useState)(() => {
    const initial = getElementInteractions(elementId);
    return initial ?? { version: 1, items: [] };
  });
  (0, import_editor_v1_adapters19.__privateUseListenTo)(
    (0, import_editor_v1_adapters19.windowEvent)("elementor/element/update_interactions"),
    () => {
      const newInteractions = getElementInteractions(elementId);
      setInteractions(newInteractions ?? { version: 1, items: [] });
    },
    [elementId]
  );
  return interactions;
};

// src/sync/update-element-interactions.ts
var import_editor_v1_adapters20 = require("@elementor/editor-v1-adapters");
var updateElementInteractions = ({
  elementId,
  interactions
}) => {
  const element = getContainer(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }
  element.model.set("interactions", interactions);
  window.dispatchEvent(new CustomEvent("elementor/element/update_interactions"));
  (0, import_editor_v1_adapters20.__privateRunCommandSync)("document/save/set-is-modified", { status: true }, { internal: true });
};
var playElementInteractions = (elementId, interactionId) => {
  window.top?.dispatchEvent(
    new CustomEvent("atomic/play_interactions", { detail: { elementId, interactionId } })
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ELEMENT_STYLE_CHANGE_EVENT,
  createElement,
  createElementStyle,
  createElements,
  deleteElement,
  deleteElementStyle,
  dropElement,
  duplicateElement,
  duplicateElements,
  findChildRecursive,
  generateElementId,
  getAllDescendants,
  getAnchoredAncestorId,
  getAnchoredDescendantId,
  getContainer,
  getCurrentDocumentContainer,
  getCurrentDocumentId,
  getElementChildrenWithFallback,
  getElementEditorSettings,
  getElementInteractions,
  getElementLabel,
  getElementSetting,
  getElementSettings,
  getElementStyles,
  getElementType,
  getElements,
  getLinkInLinkRestriction,
  getSelectedElements,
  getWidgetsCache,
  isElementAnchored,
  moveElement,
  moveElements,
  playElementInteractions,
  removeElements,
  replaceElement,
  selectElement,
  shouldCreateNewLocalStyle,
  styleRerenderEvents,
  updateElementEditorSettings,
  updateElementInteractions,
  updateElementSettings,
  updateElementStyle,
  useElementChildren,
  useElementEditorSettings,
  useElementInteractions,
  useParentElement,
  useSelectedElement,
  useSelectedElementSettings
});
//# sourceMappingURL=index.js.map