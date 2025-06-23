// src/hooks/use-element-setting.ts
import { __privateUseListenTo as useListenTo, commandEndEvent } from "@elementor/editor-v1-adapters";

// src/sync/get-container.ts
import { __privateRunCommand as runCommand } from "@elementor/editor-v1-adapters";
function getContainer(id) {
  const extendedWindow = window;
  const container = extendedWindow.elementor?.getContainer?.(id);
  return container ?? null;
}
var selectElement = (elementId) => {
  try {
    const container = getContainer(elementId);
    runCommand("document/elements/select", { container });
  } catch {
  }
};

// src/sync/get-element-setting.ts
var getElementSetting = (elementId, settingKey) => {
  const container = getContainer(elementId);
  const value = container?.settings?.get(settingKey);
  return value ?? null;
};

// src/hooks/use-element-setting.ts
var useElementSetting = (elementId, settingKey) => {
  return useListenTo(
    commandEndEvent("document/elements/set-settings"),
    () => getElementSetting(elementId, settingKey),
    [elementId, settingKey]
  );
};
var useElementSettings = (elementId, settingKeys) => {
  return useListenTo(
    commandEndEvent("document/elements/set-settings"),
    () => settingKeys.reduce((settings, key) => {
      const value = getElementSetting(elementId, key);
      if (value !== null) {
        settings[key] = value;
      }
      return settings;
    }, {}),
    [elementId, ...settingKeys]
  );
};

// src/hooks/use-element-type.ts
import { __privateUseListenTo as useListenTo2, commandEndEvent as commandEndEvent2 } from "@elementor/editor-v1-adapters";

// src/sync/get-widgets-cache.ts
function getWidgetsCache() {
  const extendedWindow = window;
  return extendedWindow?.elementor?.widgetsCache || null;
}

// src/hooks/use-element-type.ts
function useElementType(type) {
  return useListenTo2(
    commandEndEvent2("editor/documents/load"),
    () => {
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
        title: elementType.title
      };
    },
    [type]
  );
}

// src/hooks/use-selected-element.ts
import { __privateUseListenTo as useListenTo3, commandEndEvent as commandEndEvent3 } from "@elementor/editor-v1-adapters";

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

// src/hooks/use-selected-element.ts
function useSelectedElement() {
  const elements = useListenTo3(
    [
      commandEndEvent3("document/elements/select"),
      commandEndEvent3("document/elements/deselect"),
      commandEndEvent3("document/elements/select-all"),
      commandEndEvent3("document/elements/deselect-all")
    ],
    getSelectedElements
  );
  const [element] = elements;
  const elementType = useElementType(element?.type);
  if (elements.length !== 1 || !elementType) {
    return { element: null, elementType: null };
  }
  return { element, elementType };
}

// src/hooks/use-parent-element.ts
import { __privateUseListenTo as useListenTo4, commandEndEvent as commandEndEvent4 } from "@elementor/editor-v1-adapters";
function useParentElement(elementId) {
  return useListenTo4(
    [commandEndEvent4("document/elements/create")],
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

// src/sync/get-element-styles.ts
var getElementStyles = (elementID) => {
  const container = getContainer(elementID);
  return container?.model.get("styles") || null;
};

// src/errors.ts
import { createError } from "@elementor/utils";
var ElementNotFoundError = createError({
  code: "element_not_found",
  message: "Element not found."
});
var StyleNotFoundError = createError({
  code: "style_not_found",
  message: "Style not found."
});
var ElementTypeNotExistsError = createError({
  code: "element_type_not_exists",
  message: "Element type does not exist."
});
var ElementLabelNotExistsError = createError({
  code: "element_label_not_exists",
  message: "Element label does not exist."
});

// src/sync/get-element-label.ts
function getElementLabel(elementId) {
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

// src/sync/get-current-document-container.ts
function getCurrentDocumentContainer() {
  const extendedWindow = window;
  return extendedWindow.elementor?.documents?.getCurrent?.()?.container ?? null;
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

// src/sync/get-current-document-id.ts
function getCurrentDocumentId() {
  const extendedWindow = window;
  return extendedWindow.elementor?.documents?.getCurrentId?.() ?? null;
}

// src/sync/update-element-settings.ts
import { __privateRunCommandSync as runCommandSync } from "@elementor/editor-v1-adapters";
var updateElementSettings = ({ id, props, withHistory = true }) => {
  const container = getContainer(id);
  const args = {
    container,
    settings: { ...props }
  };
  if (withHistory) {
    runCommandSync("document/elements/settings", args);
  } else {
    runCommandSync("document/elements/set-settings", args, { internal: true });
  }
};

// src/styles/consts.ts
import { commandEndEvent as commandEndEvent5, windowEvent } from "@elementor/editor-v1-adapters";
var ELEMENT_STYLE_CHANGE_EVENT = "elementor/editor-v2/editor-elements/style";
var styleRerenderEvents = [
  commandEndEvent5("document/elements/create"),
  commandEndEvent5("document/elements/duplicate"),
  commandEndEvent5("document/elements/import"),
  commandEndEvent5("document/elements/paste"),
  windowEvent(ELEMENT_STYLE_CHANGE_EVENT)
];

// src/styles/create-element-style.ts
import { classesPropTypeUtil as classesPropTypeUtil2 } from "@elementor/editor-props";
import {
  generateId
} from "@elementor/editor-styles";

// src/styles/mutate-element-styles.ts
import { classesPropTypeUtil } from "@elementor/editor-props";
import { __privateRunCommandSync as runCommandSync2 } from "@elementor/editor-v1-adapters";
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
  return style.variants.filter(({ props }) => Object.keys(props).length > 0);
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
    return classesPropTypeUtil.isValid(value);
  });
}
function notifyChanges() {
  dispatchChangeEvent();
  runCommandSync2("document/save/set-is-modified", { status: true }, { internal: true });
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
  additionalVariants = []
}) {
  let id = styleId;
  mutateElementStyles(elementId, (styles) => {
    id ??= generateId(`e-${elementId}-`, Object.keys(styles));
    const variants = [{ meta, props }, ...additionalVariants];
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
  const classesPropValue = classesPropTypeUtil2.create(
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

// src/styles/update-element-style.ts
import { mergeProps } from "@elementor/editor-props";
import { getVariantByMeta } from "@elementor/editor-styles";
function updateElementStyle(args) {
  mutateElementStyles(args.elementId, (styles) => {
    const style = styles[args.styleId];
    if (!style) {
      throw new StyleNotFoundError({ context: { styleId: args.styleId } });
    }
    const variant = getVariantByMeta(style, args.meta);
    if (variant) {
      variant.props = mergeProps(variant.props, args.props);
    } else {
      style.variants.push({ meta: args.meta, props: args.props });
    }
    return styles;
  });
}

// src/styles/delete-element-style.ts
function deleteElementStyle(elementId, styleId) {
  mutateElementStyles(elementId, (styles) => {
    delete styles[styleId];
    return styles;
  });
}

// src/link-restriction.ts
function getLinkInLinkRestriction(elementId) {
  const anchoredDescendantId = getAnchoredDescendantId(elementId);
  if (anchoredDescendantId) {
    return {
      shouldRestrict: true,
      reason: "descendant",
      elementId: anchoredDescendantId
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
  for (const childAnchorElement of Array.from(element.querySelectorAll("a"))) {
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
  const parentAnchor = element.parentElement.closest("a");
  return parentAnchor ? findElementIdOf(parentAnchor) : null;
}
function isElementAnchored(elementId) {
  const element = getElementDOM(elementId);
  if (!element) {
    return false;
  }
  if (isAnchorTag(element.tagName)) {
    return true;
  }
  return doesElementContainAnchor(element);
}
function doesElementContainAnchor(element) {
  for (const child of element.children) {
    if (isElementorElement(child)) {
      continue;
    }
    if (isAnchorTag(child.tagName)) {
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
function getElementDOM(id) {
  try {
    return getContainer(id)?.view?.el || null;
  } catch {
    return null;
  }
}
function isAnchorTag(tagName) {
  return tagName.toLowerCase() === "a";
}
function isElementorElement(element) {
  return element.hasAttribute("data-id");
}
export {
  ELEMENT_STYLE_CHANGE_EVENT,
  createElementStyle,
  deleteElementStyle,
  getAnchoredAncestorId,
  getAnchoredDescendantId,
  getContainer,
  getCurrentDocumentId,
  getElementLabel,
  getElementSetting,
  getElementStyles,
  getElements,
  getLinkInLinkRestriction,
  getSelectedElements,
  getWidgetsCache,
  isElementAnchored,
  selectElement,
  styleRerenderEvents,
  updateElementSettings,
  updateElementStyle,
  useElementSetting,
  useElementSettings,
  useElementType,
  useParentElement,
  useSelectedElement
};
//# sourceMappingURL=index.mjs.map