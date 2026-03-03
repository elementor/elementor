// src/mcp/resources/breakpoints-resource.ts
import { v1ReadyEvent } from "@elementor/editor-v1-adapters";
var BREAKPOINTS_SCHEMA_URI = "elementor://breakpoints/list";
var initBreakpointsResource = (reg) => {
  const { mcpServer, sendResourceUpdated } = reg;
  const getBreakpointsList = () => {
    const { breakpoints } = window.elementor?.config?.responsive || {};
    if (!breakpoints) {
      return [];
    }
    return Object.values(breakpoints).filter((bp) => bp.is_enabled).map((bp) => {
      const { direction: constraint, label, value } = bp;
      return {
        label,
        constraint,
        value
      };
    });
  };
  const buildResourceResponse = () => ({
    contents: [
      {
        uri: BREAKPOINTS_SCHEMA_URI,
        mimeType: "application/json",
        text: JSON.stringify(getBreakpointsList())
      }
    ]
  });
  mcpServer.resource("breakpoints ", BREAKPOINTS_SCHEMA_URI, () => {
    return buildResourceResponse();
  });
  window.addEventListener(v1ReadyEvent().name, () => {
    sendResourceUpdated({
      uri: BREAKPOINTS_SCHEMA_URI,
      ...buildResourceResponse()
    });
  });
};

// src/mcp/resources/widgets-schema-resource.ts
import { getWidgetsCache } from "@elementor/editor-elements";
import { ResourceTemplate } from "@elementor/editor-mcp";
import {
  Schema
} from "@elementor/editor-props";
import { getStylesSchema } from "@elementor/editor-styles";
var WIDGET_SCHEMA_URI = "elementor://widgets/schema/{widgetType}";
var STYLE_SCHEMA_URI = "elementor://styles/schema/{category}";
var BEST_PRACTICES_URI = "elementor://styles/best-practices";
var initWidgetsSchemaResource = (reg) => {
  const { mcpServer } = reg;
  mcpServer.resource("styles-best-practices", BEST_PRACTICES_URI, async () => {
    return {
      contents: [
        {
          uri: BEST_PRACTICES_URI,
          text: `# Styling best practices
Prefer using "em" and "rem" values for text-related sizes, padding and spacing. Use percentages for dynamic sizing relative to parent containers.
This flexboxes are by default "flex" with "stretch" alignment. To ensure proper layout, define the "justify-content" and "align-items" as in the schema.

When applicable for styles, apply style PropValues using the ${STYLE_SCHEMA_URI}.
The css string must follow standard CSS syntax, with properties and values separated by semicolons, no selectors, or nesting rules allowed.`
        }
      ]
    };
  });
  mcpServer.resource(
    "styles-schema",
    new ResourceTemplate(STYLE_SCHEMA_URI, {
      list: () => {
        const categories = [...Object.keys(getStylesSchema())].filter((category) => category !== "all");
        return {
          resources: categories.map((category) => ({
            uri: `elementor://styles/schema/${category}`,
            name: "Style schema for " + category
          }))
        };
      }
    }),
    {
      description: "Common styles schema for the specified category"
    },
    async (uri, variables) => {
      const category = typeof variables.category === "string" ? variables.category : variables.category?.[0];
      const stylesSchema = getStylesSchema()[category];
      if (!stylesSchema) {
        throw new Error(`No styles schema found for category: ${category}`);
      }
      const asJson = Schema.propTypeToJsonSchema(stylesSchema);
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(
              Schema.enrichWithIntention(asJson, 'Desired CSS in format "property: value;"')
            )
          }
        ]
      };
    }
  );
  mcpServer.resource(
    "widget-schema-by-type",
    new ResourceTemplate(WIDGET_SCHEMA_URI, {
      list: () => {
        const cache = getWidgetsCache() || {};
        const availableWidgets = Object.keys(cache || {}).filter(
          (widgetType) => cache[widgetType]?.atomic_props_schema && cache[widgetType].meta?.llm_support !== false
        );
        return {
          resources: availableWidgets.map((widgetType) => ({
            uri: `elementor://widgets/schema/${widgetType}`,
            name: "Widget schema for " + widgetType
          }))
        };
      }
    }),
    {
      description: "PropType schema for the specified widget type"
    },
    async (uri, variables) => {
      const widgetType = typeof variables.widgetType === "string" ? variables.widgetType : variables.widgetType?.[0];
      const widgetData = getWidgetsCache()?.[widgetType];
      const propSchema = widgetData?.atomic_props_schema;
      if (!propSchema || !widgetData) {
        throw new Error(`No prop schema found for element type: ${widgetType}`);
      }
      const asJson = Object.fromEntries(
        Object.entries(propSchema).map(([key, propType]) => [
          key,
          Schema.propTypeToJsonSchema(propType)
        ])
      );
      Schema.nonConfigurablePropKeys.forEach((key) => {
        delete asJson[key];
      });
      const description = typeof widgetData?.meta?.description === "string" ? widgetData.meta.description : void 0;
      const defaultStyles = {};
      const baseStyleSchema = widgetData?.base_styles;
      if (baseStyleSchema) {
        Object.values(baseStyleSchema).forEach((stylePropType) => {
          stylePropType.variants.forEach((variant) => {
            Object.assign(defaultStyles, variant.props);
          });
        });
      }
      const hasDefaultStyles = Object.keys(defaultStyles).length > 0;
      const llmGuidance = {
        can_have_children: !!widgetData?.meta?.is_container
      };
      if (hasDefaultStyles) {
        llmGuidance.instructions = "These are the default styles applied to the widget. Override only when necessary.";
        llmGuidance.default_styles = defaultStyles;
      }
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify({
              type: "object",
              properties: asJson,
              description,
              llm_guidance: llmGuidance
            })
          }
        ]
      };
    }
  );
};

// src/init.tsx
import { injectIntoLogic, injectIntoTop } from "@elementor/editor";
import { getMCPByDomain } from "@elementor/editor-mcp";

// src/components/classes-rename.tsx
import { useEffect } from "react";
import { getV1DocumentsManager } from "@elementor/editor-documents";
import { stylesRepository } from "@elementor/editor-styles-repository";
import { hash } from "@elementor/utils";
var ClassesRename = () => {
  useEffect(() => {
    const unsubscribe = subscribeToStylesRepository();
    return () => {
      unsubscribe();
    };
  }, []);
  return null;
};
var subscribeToStylesRepository = () => {
  return stylesRepository.subscribe((previous, current) => {
    if (!previous || !current) {
      return;
    }
    const currentIds = Object.keys(current);
    currentIds.forEach((id) => {
      const isStyleChanged = previous[id] && hash(previous[id]) !== hash(current[id]);
      if (!isStyleChanged) {
        return;
      }
      const previousStyle = previous[id];
      const currentStyle = current[id];
      if (previousStyle.label !== currentStyle.label) {
        renameClass(previousStyle.label, currentStyle.label);
      }
    });
  });
};
var renameClass = (oldClassName, newClassName) => {
  Object.values(getV1DocumentsManager().documents).forEach((document2) => {
    const container = document2.container;
    container.view?.el?.querySelectorAll(`.elementor .${oldClassName}`).forEach((element) => {
      element.classList.replace(oldClassName, newClassName);
    });
  });
};

// src/components/elements-overlays.tsx
import * as React2 from "react";
import { getElements, useSelectedElement } from "@elementor/editor-elements";
import {
  __privateUseIsRouteActive as useIsRouteActive,
  __privateUseListenTo as useListenTo,
  useEditMode,
  windowEvent
} from "@elementor/editor-v1-adapters";

// src/components/outline-overlay.tsx
import * as React from "react";
import { Box, styled } from "@elementor/ui";
import { FloatingPortal, useHover, useInteractions } from "@floating-ui/react";

// src/hooks/use-bind-react-props-to-element.ts
import { useEffect as useEffect2 } from "react";
function useBindReactPropsToElement(element, getProps) {
  useEffect2(() => {
    const el = element;
    const { events, attrs } = groupProps(getProps());
    events.forEach(([eventName, listener]) => el.addEventListener(eventName, listener));
    attrs.forEach(([attrName, attrValue]) => el.setAttribute(attrName, attrValue));
    return () => {
      events.forEach(([eventName, listener]) => el.removeEventListener(eventName, listener));
      attrs.forEach(([attrName]) => el.removeAttribute(attrName));
    };
  }, [getProps, element]);
}
function groupProps(props) {
  const eventRegex = /^on(?=[A-Z])/;
  return Object.entries(props).reduce(
    (acc, [propName, propValue]) => {
      if (!eventRegex.test(propName)) {
        acc.attrs.push([propName, propValue]);
        return acc;
      }
      const eventName = propName.replace(eventRegex, "").toLowerCase();
      const listener = propValue;
      acc.events.push([eventName, listener]);
      return acc;
    },
    {
      events: [],
      attrs: []
    }
  );
}

// src/hooks/use-floating-on-element.ts
import { useEffect as useEffect3, useState } from "react";
import { autoUpdate, offset, size, useFloating } from "@floating-ui/react";
function useFloatingOnElement({ element, isSelected }) {
  const [isOpen, setIsOpen] = useState(false);
  const sizeModifier = 2;
  const { refs, floatingStyles, context } = useFloating({
    // Must be controlled for interactions (like hover) to work.
    open: isOpen || isSelected,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      // Match the floating element's size to the reference element.
      size(() => {
        return {
          apply({ elements, rects }) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width + sizeModifier}px`,
              height: `${rects.reference.height + sizeModifier}px`
            });
          }
        };
      }),
      // Center the floating element on the reference element.
      offset(({ rects }) => -rects.reference.height / 2 - rects.floating.height / 2)
    ]
  });
  useEffect3(() => {
    refs.setReference(element);
  }, [element, refs]);
  return {
    isVisible: isOpen || isSelected,
    context,
    floating: {
      setRef: refs.setFloating,
      ref: refs.floating,
      styles: floatingStyles
    }
  };
}

// src/hooks/use-has-overlapping.ts
var possibleOverlappingSelectors = [".e-off-canvas"];
var useHasOverlapping = () => {
  const preview = window.elementor?.$preview?.[0];
  if (!preview) {
    return false;
  }
  const hasOverlapping = possibleOverlappingSelectors.map((selector) => Array.from(preview?.contentWindow?.document.body.querySelectorAll(selector) ?? [])).flat().some(
    (elem) => elem.checkVisibility({
      opacityProperty: true,
      visibilityProperty: true,
      contentVisibilityAuto: true
    })
  );
  return hasOverlapping;
};

// src/components/outline-overlay.tsx
var CANVAS_WRAPPER_ID = "elementor-preview-responsive-wrapper";
var OverlayBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isSelected" && prop !== "isSmallerOffset" && prop !== "isGlobal"
})(
  ({ theme, isSelected, isSmallerOffset, isGlobal }) => ({
    outline: `${isSelected ? "2px" : "1px"} solid ${isGlobal ? theme.palette.global.main : theme.palette.primary.light}`,
    outlineOffset: isSelected && !isSmallerOffset ? "-2px" : "-1px",
    pointerEvents: "none"
  })
);
var OutlineOverlay = ({ element, isSelected, id, isGlobal = false }) => {
  const { context, floating, isVisible } = useFloatingOnElement({ element, isSelected });
  const { getFloatingProps, getReferenceProps } = useInteractions([useHover(context)]);
  const hasOverlapping = useHasOverlapping();
  useBindReactPropsToElement(element, getReferenceProps);
  const isSmallerOffset = element.offsetHeight <= 1;
  return isVisible && !hasOverlapping && /* @__PURE__ */ React.createElement(FloatingPortal, { id: CANVAS_WRAPPER_ID }, /* @__PURE__ */ React.createElement(
    OverlayBox,
    {
      ref: floating.setRef,
      isSelected,
      isGlobal,
      style: floating.styles,
      "data-element-overlay": id,
      role: "presentation",
      isSmallerOffset,
      ...getFloatingProps()
    }
  ));
};

// src/components/elements-overlays.tsx
var ELEMENTS_DATA_ATTR = "atomic";
var overlayRegistry = [
  {
    component: OutlineOverlay,
    shouldRender: () => true
  }
];
function ElementsOverlays() {
  const selected = useSelectedElement();
  const elements = useElementsDom();
  const currentEditMode = useEditMode();
  const isEditMode = currentEditMode === "edit";
  const isKitRouteActive = useIsRouteActive("panel/global");
  const isActive = isEditMode && !isKitRouteActive;
  if (!isActive) {
    return null;
  }
  return elements.map(({ id, domElement, isGlobal }) => {
    const isSelected = selected.element?.id === id;
    return overlayRegistry.map(
      ({ shouldRender, component: Overlay }, index) => shouldRender({ id, element: domElement, isSelected }) && /* @__PURE__ */ React2.createElement(
        Overlay,
        {
          key: `${id}-${index}`,
          id,
          element: domElement,
          isSelected,
          isGlobal
        }
      )
    );
  });
}
function useElementsDom() {
  return useListenTo(
    [windowEvent("elementor/editor/element-rendered"), windowEvent("elementor/editor/element-destroyed")],
    () => {
      return getElements().filter((el) => ELEMENTS_DATA_ATTR in (el.view?.el?.dataset ?? {})).map((element) => ({
        id: element.id,
        domElement: element.view?.getDomElement?.()?.get?.(0),
        isGlobal: element.model.get("isGlobal") ?? false
      })).filter((item) => !!item.domElement);
    }
  );
}

// src/components/interactions-renderer.tsx
import * as React3 from "react";
import {
  __privateUseListenTo as useListenTo2,
  commandEndEvent,
  getCanvasIframeDocument
} from "@elementor/editor-v1-adapters";
import { Portal } from "@elementor/ui";

// src/hooks/use-interactions-items.ts
import { useEffect as useEffect5, useMemo, useState as useState2 } from "react";
import { interactionsRepository } from "@elementor/editor-interactions";
import { registerDataHook } from "@elementor/editor-v1-adapters";

// src/hooks/use-on-mount.ts
import { useEffect as useEffect4, useRef } from "react";
function useOnMount(cb) {
  const mounted = useRef(false);
  useEffect4(() => {
    if (!mounted.current) {
      mounted.current = true;
      cb();
    }
  }, []);
}

// src/hooks/use-interactions-items.ts
function useInteractionsItems() {
  const [interactionItems, setInteractionItems] = useState2({});
  const providerAndSubscribers = useMemo(() => {
    try {
      const providers = interactionsRepository.getProviders();
      const mapped = providers.map((provider) => {
        return {
          provider,
          subscriber: createProviderSubscriber({
            provider,
            setInteractionItems
          })
        };
      });
      return mapped;
    } catch {
      return [];
    }
  }, []);
  useEffect5(() => {
    if (providerAndSubscribers.length === 0) {
      return;
    }
    const unsubscribes = providerAndSubscribers.map(({ provider, subscriber }) => {
      const safeSubscriber = () => {
        try {
          subscriber();
        } catch {
        }
      };
      const unsubscribe = provider.subscribe(safeSubscriber);
      return unsubscribe;
    });
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [providerAndSubscribers]);
  useOnMount(() => {
    if (providerAndSubscribers.length === 0) {
      return;
    }
    registerDataHook("after", "editor/documents/attach-preview", async () => {
      providerAndSubscribers.forEach(({ subscriber }) => {
        try {
          subscriber();
        } catch {
        }
      });
    });
  });
  return useMemo(() => {
    const result = Object.values(interactionItems).sort(sortByProviderPriority).flatMap(({ items }) => items);
    return result;
  }, [interactionItems]);
}
function sortByProviderPriority({ provider: providerA }, { provider: providerB }) {
  return providerA.priority - providerB.priority;
}
function createProviderSubscriber({ provider, setInteractionItems }) {
  return () => {
    try {
      const items = provider.actions.all();
      const providerKey = provider.getKey();
      setInteractionItems((prev) => ({
        ...prev,
        [providerKey]: { provider, items }
      }));
    } catch {
    }
  };
}

// src/components/interactions-renderer.tsx
function InteractionsRenderer() {
  const container = usePortalContainer();
  const interactionItems = useInteractionsItems();
  if (!container) {
    return null;
  }
  const interactionsData = JSON.stringify(Array.isArray(interactionItems) ? interactionItems : []);
  return /* @__PURE__ */ React3.createElement(Portal, { container }, /* @__PURE__ */ React3.createElement(
    "script",
    {
      type: "application/json",
      "data-e-interactions": "true",
      dangerouslySetInnerHTML: {
        __html: interactionsData
      }
    }
  ));
}
function usePortalContainer() {
  return useListenTo2(commandEndEvent("editor/documents/attach-preview"), () => getCanvasIframeDocument()?.head);
}

// src/components/style-renderer.tsx
import * as React4 from "react";
import {
  __privateUseListenTo as useListenTo4,
  commandEndEvent as commandEndEvent3,
  getCanvasIframeDocument as getCanvasIframeDocument3
} from "@elementor/editor-v1-adapters";
import { Portal as Portal2 } from "@elementor/ui";

// src/hooks/use-documents-css-links.ts
import {
  __privateUseListenTo as useListenTo3,
  commandEndEvent as commandEndEvent2,
  getCanvasIframeDocument as getCanvasIframeDocument2
} from "@elementor/editor-v1-adapters";
var REMOVED_ATTR = "data-e-removed";
var DOCUMENT_WRAPPER_ATTR = "data-elementor-id";
var CSS_LINK_ID_PREFIX = "elementor-post-";
var CSS_LINK_ID_SUFFIX = "-css";
function useDocumentsCssLinks() {
  return useListenTo3(commandEndEvent2("editor/documents/attach-preview"), () => {
    const iframeDocument = getCanvasIframeDocument2();
    if (!iframeDocument) {
      return [];
    }
    const relevantLinkIds = getDocumentsIdsInCanvas(iframeDocument).map(
      (id) => `${CSS_LINK_ID_PREFIX}${id}${CSS_LINK_ID_SUFFIX}`
    );
    const links = getDocumentsCssLinks(iframeDocument).filter(
      (link) => relevantLinkIds.includes(link.getAttribute("id") ?? "")
    );
    links.forEach((link) => {
      if (!link.hasAttribute(REMOVED_ATTR)) {
        link.remove();
      }
    });
    return links.map((link) => ({
      ...getLinkAttrs(link),
      id: link.getAttribute("id") ?? "",
      [REMOVED_ATTR]: true
    }));
  });
}
function getDocumentsIdsInCanvas(document2) {
  return [...document2.body.querySelectorAll(`[${DOCUMENT_WRAPPER_ATTR}]`) ?? []].map(
    (el) => el.getAttribute(DOCUMENT_WRAPPER_ATTR) || ""
  );
}
function getDocumentsCssLinks(document2) {
  return [
    ...document2.head.querySelectorAll(
      `link[rel="stylesheet"][id^=${CSS_LINK_ID_PREFIX}][id$=${CSS_LINK_ID_SUFFIX}]`
    ) ?? []
  ];
}
function getLinkAttrs(el) {
  const entries = [...el.attributes].map((attr) => [attr.name, attr.value]);
  return Object.fromEntries(entries);
}

// src/hooks/use-style-items.ts
import { useEffect as useEffect6, useMemo as useMemo4, useRef as useRef2, useState as useState3 } from "react";
import { useBreakpoints } from "@elementor/editor-responsive";
import { isClassState } from "@elementor/editor-styles";
import { stylesRepository as stylesRepository2 } from "@elementor/editor-styles-repository";
import { registerDataHook as registerDataHook2 } from "@elementor/editor-v1-adapters";

// src/utils/abort-previous-runs.ts
function abortPreviousRuns(cb) {
  let abortController = null;
  return (...args) => {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    return cb(abortController, ...args);
  };
}

// src/utils/signalized-process.ts
function signalizedProcess(signal, steps = []) {
  return {
    then: (cb) => {
      steps.push(cb);
      return signalizedProcess(signal, steps);
    },
    execute: async () => {
      let lastResult;
      for (const step of steps) {
        if (signal.aborted) {
          break;
        }
        lastResult = await step(lastResult, signal);
      }
    }
  };
}

// src/hooks/use-style-prop-resolver.ts
import { useMemo as useMemo2 } from "react";
import { getStylesSchema as getStylesSchema2 } from "@elementor/editor-styles";
import { enqueueFont } from "@elementor/editor-v1-adapters";

// src/renderers/create-props-resolver.ts
import {
  isTransformable
} from "@elementor/editor-props";

// src/renderers/multi-props.ts
var isMultiProps = (propValue) => {
  return !!propValue && typeof propValue === "object" && "$$multi-props" in propValue && propValue["$$multi-props"] === true;
};
var createMultiPropsValue = (props) => {
  return {
    "$$multi-props": true,
    value: props
  };
};
var getMultiPropsValue = (multiProps) => {
  return multiProps.value;
};

// src/renderers/create-props-resolver.ts
var TRANSFORM_DEPTH_LIMIT = 3;
function createPropsResolver({ transformers, schema: initialSchema, onPropResolve }) {
  async function resolve({ props, schema: schema2, signal, renderContext }) {
    schema2 = schema2 ?? initialSchema;
    const promises = Promise.all(
      Object.entries(schema2).map(async ([key, type]) => {
        const value = props[key] ?? type.default;
        const transformed = await transform({ value, key, type, signal, renderContext });
        onPropResolve?.({ key, value: transformed });
        if (isMultiProps(transformed)) {
          return getMultiPropsValue(transformed);
        }
        return { [key]: transformed };
      })
    );
    return Object.assign({}, ...(await promises).filter(Boolean));
  }
  async function transform({ value, key, type, signal, depth = 0, renderContext }) {
    if (value === null || value === void 0) {
      return null;
    }
    if (!isTransformable(value)) {
      return value;
    }
    if (depth > TRANSFORM_DEPTH_LIMIT) {
      return null;
    }
    if (value.disabled === true) {
      return null;
    }
    let transformablePropType = type;
    if (type.kind === "union") {
      transformablePropType = type.prop_types[value.$$type];
      if (!transformablePropType) {
        return null;
      }
    }
    transformablePropType = transformablePropType;
    if (value.$$type !== transformablePropType.key) {
      return null;
    }
    let resolvedValue = value.value;
    if (transformablePropType.kind === "object") {
      resolvedValue = await resolve({
        props: resolvedValue,
        schema: transformablePropType.shape,
        signal,
        renderContext
      });
    }
    if (transformablePropType.kind === "array") {
      resolvedValue = await Promise.all(
        resolvedValue.map(
          (item) => transform({
            value: item,
            key,
            type: transformablePropType.item_prop_type,
            depth,
            signal,
            renderContext
          })
        )
      );
    }
    const transformer = transformers.get(value.$$type);
    if (!transformer) {
      return null;
    }
    try {
      const transformed = await transformer(resolvedValue, { key, signal, renderContext, propType: type });
      return transform({ value: transformed, key, type, signal, depth: depth + 1, renderContext });
    } catch {
      return null;
    }
  }
  return resolve;
}

// src/transformers/create-transformers-registry.ts
function createTransformersRegistry() {
  const transformers = {};
  let fallbackTransformer = null;
  return {
    register(type, transformer) {
      transformers[type] = transformer;
      return this;
    },
    registerFallback(transformer) {
      fallbackTransformer = transformer;
      return this;
    },
    get(type) {
      return transformers[type] ?? fallbackTransformer;
    },
    all() {
      return { ...transformers };
    }
  };
}
var stylesInheritanceTransformersRegistry = createTransformersRegistry();

// src/style-transformers-registry.ts
var styleTransformersRegistry = createTransformersRegistry();

// src/hooks/use-style-prop-resolver.ts
function useStylePropResolver() {
  return useMemo2(() => {
    return createPropsResolver({
      transformers: styleTransformersRegistry,
      schema: getStylesSchema2(),
      onPropResolve: ({ key, value }) => {
        if (key !== "font-family" || typeof value !== "string") {
          return;
        }
        enqueueFont(value);
      }
    });
  }, []);
}

// src/hooks/use-style-renderer.ts
import { useMemo as useMemo3 } from "react";
import { useBreakpointsMap } from "@elementor/editor-responsive";

// src/renderers/create-styles-renderer.ts
import {
  getSelectorWithState
} from "@elementor/editor-styles";
import { decodeString } from "@elementor/utils";

// src/renderers/errors.ts
import { createError } from "@elementor/utils";
var UnknownStyleTypeError = createError({
  code: "unknown_style_type",
  message: "Unknown style type"
});
var UnknownStyleStateError = createError({
  code: "unknown_style_state",
  message: "Unknown style state"
});

// src/renderers/create-styles-renderer.ts
var SELECTORS_MAP = {
  class: "."
};
function createStylesRenderer({ resolve, breakpoints, selectorPrefix = "" }) {
  return async ({ styles, signal }) => {
    const seenIds = /* @__PURE__ */ new Set();
    const uniqueStyles = styles.filter((style) => {
      if (seenIds.has(style.id)) {
        return false;
      }
      seenIds.add(style.id);
      return true;
    });
    const stylesCssPromises = uniqueStyles.map(async (style) => {
      const variantCssPromises = Object.values(style.variants).map(async (variant) => {
        const css = await propsToCss({ props: variant.props, resolve, signal });
        const customCss = customCssToString(variant.custom_css);
        return createStyleWrapper().for(style.cssName, style.type).withPrefix(selectorPrefix).withState(variant.meta.state).withMediaQuery(variant.meta.breakpoint ? breakpoints[variant.meta.breakpoint] : null).wrap(css + customCss);
      });
      const variantsCss = await Promise.all(variantCssPromises);
      return {
        id: style.id,
        breakpoint: style?.variants[0]?.meta?.breakpoint || "desktop",
        value: variantsCss.join(""),
        state: style?.variants[0]?.meta?.state || null
      };
    });
    return await Promise.all(stylesCssPromises);
  };
}
function createStyleWrapper(value = "", wrapper) {
  return {
    for: (cssName, type) => {
      const symbol = SELECTORS_MAP[type];
      if (!symbol) {
        throw new UnknownStyleTypeError({ context: { type } });
      }
      return createStyleWrapper(`${value}${symbol}${cssName}`, wrapper);
    },
    withPrefix: (prefix) => createStyleWrapper([prefix, value].filter(Boolean).join(" "), wrapper),
    withState: (state) => {
      const selector = getSelectorWithState(value, state);
      return createStyleWrapper(selector, wrapper);
    },
    withMediaQuery: (breakpoint) => {
      if (!breakpoint?.type) {
        return createStyleWrapper(value, wrapper);
      }
      const size2 = `${breakpoint.type}:${breakpoint.width}px`;
      return createStyleWrapper(value, (css) => `@media(${size2}){${css}}`);
    },
    wrap: (css) => {
      const res = `${value}{${css}}`;
      if (!wrapper) {
        return res;
      }
      return wrapper(res);
    }
  };
}
async function propsToCss({ props, resolve, signal }) {
  const transformed = await resolve({ props, signal });
  return Object.entries(transformed).reduce((acc, [propName, propValue]) => {
    if (propValue === null) {
      return acc;
    }
    acc.push(propName + ":" + propValue + ";");
    return acc;
  }, []).join("");
}
function customCssToString(customCss) {
  const decoded = decodeString(customCss?.raw || "");
  if (!decoded.trim()) {
    return "";
  }
  return decoded + "\n";
}

// src/hooks/use-style-renderer.ts
var SELECTOR_PREFIX = ".elementor";
function useStyleRenderer(resolve) {
  const breakpoints = useBreakpointsMap();
  return useMemo3(() => {
    return createStylesRenderer({
      selectorPrefix: SELECTOR_PREFIX,
      breakpoints,
      resolve
    });
  }, [resolve, breakpoints]);
}

// src/hooks/use-style-items.ts
function useStyleItems() {
  const resolve = useStylePropResolver();
  const renderStyles = useStyleRenderer(resolve);
  const breakpoints = useBreakpoints();
  const [styleItems, setStyleItems] = useState3({});
  const styleItemsCacheRef = useRef2(/* @__PURE__ */ new Map());
  const providerAndSubscribers = useMemo4(() => {
    return stylesRepository2.getProviders().map((provider) => {
      const providerKey = provider.getKey();
      if (!styleItemsCacheRef.current.has(providerKey)) {
        styleItemsCacheRef.current.set(providerKey, { orderedIds: [], itemsById: /* @__PURE__ */ new Map() });
      }
      const cache = styleItemsCacheRef.current.get(providerKey);
      return {
        provider,
        subscriber: createProviderSubscriber2({
          provider,
          renderStyles,
          setStyleItems,
          cache
        })
      };
    });
  }, [renderStyles]);
  useEffect6(() => {
    const unsubscribes = providerAndSubscribers.map(
      ({ provider, subscriber }) => provider.subscribe(subscriber)
    );
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [providerAndSubscribers]);
  useOnMount(() => {
    registerDataHook2("after", "editor/documents/attach-preview", async () => {
      const promises = providerAndSubscribers.map(async ({ subscriber }) => subscriber());
      await Promise.all(promises);
    });
  });
  const breakpointSorter = useMemo4(
    () => createBreakpointSorter(breakpoints.map((breakpoint) => breakpoint.id)),
    [breakpoints]
  );
  return useMemo4(
    () => Object.values(styleItems).sort(prioritySorter).flatMap(({ items }) => items).sort(stateSorter).sort(breakpointSorter),
    [styleItems, breakpointSorter]
  );
}
function prioritySorter({ provider: providerA }, { provider: providerB }) {
  return providerA.priority - providerB.priority;
}
function stateSorter({ state: stateA }, { state: stateB }) {
  if (isClassState(stateA) && !isClassState(stateB)) {
    return -1;
  }
  if (!isClassState(stateA) && isClassState(stateB)) {
    return 1;
  }
  return 0;
}
function createBreakpointSorter(breakpointsOrder) {
  return ({ breakpoint: breakpointA }, { breakpoint: breakpointB }) => breakpointsOrder.indexOf(breakpointA) - breakpointsOrder.indexOf(breakpointB);
}
function createProviderSubscriber2({ provider, renderStyles, setStyleItems, cache }) {
  return abortPreviousRuns(
    (abortController, previous, current) => signalizedProcess(abortController.signal).then((_, signal) => {
      const hasDiffInfo = current !== void 0 && previous !== void 0;
      const hasCache = cache.orderedIds.length > 0;
      if (hasDiffInfo && hasCache) {
        return updateItems(previous, current, signal);
      }
      return createItems(signal);
    }).then((items) => {
      setStyleItems((prev) => ({
        ...prev,
        [provider.getKey()]: { provider, items }
      }));
    }).execute()
  );
  async function updateItems(previous, current, signal) {
    const changedIds = getChangedStyleIds(previous, current);
    cache.orderedIds = provider.actions.all().map((style) => style.id).reverse();
    if (changedIds.length > 0) {
      const changedStyles = changedIds.map((id) => provider.actions.get(id)).filter((style) => !!style).map((style) => ({
        ...style,
        cssName: provider.actions.resolveCssName(style.id)
      }));
      return renderStyles({ styles: breakToBreakpoints(changedStyles), signal }).then((rendered) => {
        updateCacheItems(cache, rendered);
        return getOrderedItems(cache);
      });
    }
    return getOrderedItems(cache);
  }
  async function createItems(signal) {
    const allStyles = provider.actions.all();
    const styles = allStyles.reverse().map((style) => {
      return {
        ...style,
        cssName: provider.actions.resolveCssName(style.id)
      };
    });
    return renderStyles({ styles: breakToBreakpoints(styles), signal }).then((rendered) => {
      rebuildCache(cache, allStyles, rendered);
      return rendered;
    });
  }
  function breakToBreakpoints(styles) {
    return Object.values(
      styles.reduce(
        (acc, style) => {
          style.variants.forEach((variant) => {
            const breakpoint = variant.meta.breakpoint || "desktop";
            if (!acc[style.id]) {
              acc[style.id] = {};
            }
            if (!acc[style.id][breakpoint]) {
              acc[style.id][breakpoint] = {
                ...style,
                variants: []
              };
            }
            acc[style.id][breakpoint].variants.push(variant);
          });
          return acc;
        },
        {}
      )
    ).flatMap((breakpointMap) => Object.values(breakpointMap));
  }
}
function getChangedStyleIds(previous, current) {
  const changedIds = [];
  for (const id of Object.keys(current)) {
    const currentStyle = current[id];
    const previousStyle = previous[id];
    if (!previousStyle || currentStyle !== previousStyle) {
      changedIds.push(id);
    }
  }
  return changedIds;
}
function getOrderedItems(cache) {
  return cache.orderedIds.map((id) => cache.itemsById.get(id)).filter((items) => items !== void 0).flat();
}
function updateCacheItems(cache, changedItems) {
  for (const item of changedItems) {
    const existing = cache.itemsById.get(item.id);
    if (existing) {
      const idx = existing.findIndex((e) => e.breakpoint === item.breakpoint && e.state === item.state);
      if (idx >= 0) {
        existing[idx] = item;
      } else {
        existing.push(item);
      }
    } else {
      cache.itemsById.set(item.id, [item]);
    }
  }
}
function rebuildCache(cache, allStyles, items) {
  cache.orderedIds = allStyles.map((style) => style.id).reverse();
  cache.itemsById.clear();
  for (const item of items) {
    const existing = cache.itemsById.get(item.id) || [];
    existing.push(item);
    cache.itemsById.set(item.id, existing);
  }
}

// src/components/style-renderer.tsx
function StyleRenderer() {
  const container = usePortalContainer2();
  const styleItems = useStyleItems();
  const linksAttrs = useDocumentsCssLinks();
  if (!container) {
    return null;
  }
  return /* @__PURE__ */ React4.createElement(Portal2, { container }, filterUniqueStyleDefinitions(styleItems).map((item) => /* @__PURE__ */ React4.createElement("style", { key: `${item.id}-${item.breakpoint}-${item.state ?? "normal"}` }, item.value)), linksAttrs.map((attrs) => /* @__PURE__ */ React4.createElement("link", { ...attrs, key: attrs.id })));
}
function usePortalContainer2() {
  return useListenTo4(commandEndEvent3("editor/documents/attach-preview"), () => getCanvasIframeDocument3()?.head);
}
function filterUniqueStyleDefinitions(styleItems) {
  const seen = /* @__PURE__ */ new Map();
  return styleItems.filter((style) => {
    const existingStyle = seen.get(style.id);
    if (existingStyle) {
      const existingStyleVariant = existingStyle.find(
        (s) => s.breakpoint === style.breakpoint && s.state === style.state
      );
      if (existingStyleVariant) {
        return false;
      }
      existingStyle.push(style);
      return true;
    }
    seen.set(style.id, [style]);
    return true;
  });
}

// src/form-structure/enforce-form-ancestor-commands.ts
import { notify } from "@elementor/editor-notifications";
import { blockCommand } from "@elementor/editor-v1-adapters";
import { __ } from "@wordpress/i18n";

// src/form-structure/utils.ts
import { getAllDescendants } from "@elementor/editor-elements";
var FORM_ELEMENT_TYPE = "e-form";
var FORM_FIELD_ELEMENT_TYPES = /* @__PURE__ */ new Set([
  "e-form-input",
  "e-form-textarea",
  "e-form-label",
  "e-form-checkbox",
  "e-form-submit-button"
]);
function getArgsElementType(args) {
  return args.model?.widgetType || args.model?.elType;
}
function getElementType(element) {
  return element?.model.get("widgetType") || element?.model.get("elType");
}
function isElementWithinFormSelector(element) {
  return !!element?.view?.el?.closest('form,[data-element_type="e-form"]');
}
function isWithinForm(element) {
  return isElementWithinFormSelector(element);
}
function hasElementType(element, type) {
  return getAllDescendants(element).some((item) => getElementType(item) === type);
}
function hasElementTypes(element, types) {
  return getAllDescendants(element).some((item) => {
    const itemType = getElementType(item);
    return itemType ? types.has(itemType) : false;
  });
}
function hasClipboardElementType(elements, type) {
  return elements.some((element) => {
    const elementType = element.widgetType || element.elType;
    if (elementType === type) {
      return true;
    }
    return element.elements ? hasClipboardElementType(element.elements, type) : false;
  });
}
function hasClipboardElementTypes(elements, types) {
  return elements.some((element) => {
    const elementType = element.widgetType || element.elType;
    if (elementType && types.has(elementType)) {
      return true;
    }
    return element.elements ? hasClipboardElementTypes(element.elements, types) : false;
  });
}

// src/form-structure/enforce-form-ancestor-commands.ts
var FORM_FIELDS_OUTSIDE_ALERT = {
  type: "default",
  message: __("Form elements must be placed inside a form.", "elementor"),
  id: "form-fields-outside-form-blocked"
};
function initFormAncestorEnforcement() {
  blockCommand({
    command: "document/elements/create",
    condition: blockFormFieldCreate
  });
  blockCommand({
    command: "document/elements/move",
    condition: blockFormFieldMove
  });
  blockCommand({
    command: "document/elements/paste",
    condition: blockFormFieldPaste
  });
}
function blockFormFieldCreate(args) {
  const elementType = getArgsElementType(args);
  if (!elementType || !FORM_FIELD_ELEMENT_TYPES.has(elementType)) {
    return false;
  }
  if (!isWithinForm(args.container)) {
    handleBlockedFormField();
    return true;
  }
  return false;
}
function blockFormFieldMove(args) {
  const { containers = [args.container], target } = args;
  const hasFormFieldElement = containers.some(
    (container) => container ? hasElementTypes(container, FORM_FIELD_ELEMENT_TYPES) : false
  );
  if (hasFormFieldElement && !isWithinForm(target)) {
    handleBlockedFormField();
    return true;
  }
  return false;
}
function blockFormFieldPaste(args) {
  const { storageType } = args;
  if (storageType !== "localstorage") {
    return false;
  }
  const data = window?.elementorCommon?.storage?.get();
  if (!data?.clipboard?.elements) {
    return false;
  }
  const hasFormFieldElement = hasClipboardElementTypes(data.clipboard.elements, FORM_FIELD_ELEMENT_TYPES);
  if (hasFormFieldElement && !isWithinForm(args.container)) {
    handleBlockedFormField();
    return true;
  }
  return false;
}
function handleBlockedFormField() {
  notify(FORM_FIELDS_OUTSIDE_ALERT);
}

// src/form-structure/prevent-form-nesting-commands.ts
import { notify as notify2 } from "@elementor/editor-notifications";
import { blockCommand as blockCommand2 } from "@elementor/editor-v1-adapters";
import { __ as __2 } from "@wordpress/i18n";
var FORM_NESTING_ALERT = {
  type: "default",
  message: __2("Forms can't be nested. Create separate forms instead.", "elementor"),
  id: "form-nesting-blocked"
};
function initFormNestingPrevention() {
  blockCommand2({
    command: "document/elements/create",
    condition: blockFormCreate
  });
  blockCommand2({
    command: "document/elements/move",
    condition: blockFormMove
  });
  blockCommand2({
    command: "document/elements/paste",
    condition: blockFormPaste
  });
}
function blockFormCreate(args) {
  const elementType = getArgsElementType(args);
  if (!elementType) {
    return false;
  }
  if (elementType === FORM_ELEMENT_TYPE && isWithinForm(args.container)) {
    handleBlockedFormField2();
    return true;
  }
  return false;
}
function blockFormMove(args) {
  const { containers = [args.container], target } = args;
  const hasFormElement = containers.some(
    (container) => container ? hasElementType(container, FORM_ELEMENT_TYPE) : false
  );
  if (hasFormElement && isWithinForm(target)) {
    handleBlockedFormField2();
    return true;
  }
  return false;
}
function blockFormPaste(args) {
  const { storageType } = args;
  if (storageType !== "localstorage") {
    return false;
  }
  const data = window?.elementorCommon?.storage?.get();
  if (!data?.clipboard?.elements) {
    return false;
  }
  const hasFormElement = hasClipboardElementType(data.clipboard.elements, FORM_ELEMENT_TYPE);
  if (hasFormElement && isWithinForm(args.container)) {
    handleBlockedFormField2();
    return true;
  }
  return false;
}
function handleBlockedFormField2() {
  notify2(FORM_NESTING_ALERT);
}

// src/settings-transformers-registry.ts
var settingsTransformersRegistry = createTransformersRegistry();

// src/transformers/create-transformer.ts
function createTransformer(cb) {
  return cb;
}

// src/transformers/settings/attributes-transformer.ts
var attributesTransformer = createTransformer(() => "");

// src/transformers/settings/classes-transformer.ts
import { stylesRepository as stylesRepository3 } from "@elementor/editor-styles-repository";
function transformClassId(id, cache) {
  if (!cache.has(id)) {
    const provider2 = stylesRepository3.getProviders().find((p) => {
      return p.actions.all().find((style) => style.id === id);
    });
    if (!provider2) {
      return id;
    }
    cache.set(id, provider2.getKey());
  }
  const providerKey = cache.get(id);
  const provider = stylesRepository3.getProviderByKey(providerKey);
  return provider?.actions.resolveCssName(id) ?? id;
}
function createClassesTransformer() {
  const cache = /* @__PURE__ */ new Map();
  return createTransformer((value) => {
    return value.map((id) => transformClassId(id, cache)).filter(Boolean);
  });
}

// src/transformers/settings/date-time-transformer.ts
var dateTimeTransformer = createTransformer((values) => {
  return values.map((value) => {
    const date = (value.date || "").trim();
    const time = (value.time || "").trim();
    return !date && !time ? "" : `${date} ${time}`.trim();
  }).join(" ");
});

// src/transformers/settings/html-v2-transformer.ts
var htmlV2Transformer = createTransformer((value) => {
  return value?.content ?? "";
});

// src/transformers/settings/html-v3-transformer.ts
var htmlV3Transformer = createTransformer((value) => {
  return value?.content ?? "";
});

// src/transformers/settings/link-transformer.ts
var linkTransformer = createTransformer(({ destination, isTargetBlank, tag }) => {
  return {
    // The real post URL is not relevant in the Editor.
    href: typeof destination === "number" ? "#post-id-" + destination : destination,
    target: isTargetBlank ? "_blank" : "_self",
    tag: tag ?? "a"
  };
});

// src/transformers/settings/query-transformer.ts
var queryTransformer = createTransformer(({ id }) => {
  return id ?? null;
});

// src/transformers/shared/image-src-transformer.ts
var imageSrcTransformer = createTransformer((value) => ({
  id: value.id ?? null,
  url: value.url ?? null
}));

// src/transformers/shared/image-transformer.ts
import { getMediaAttachment } from "@elementor/wp-media";
var imageTransformer = createTransformer(async (value) => {
  const { src, size: size2 } = value;
  if (!src?.id) {
    return src?.url ? { src: src.url } : null;
  }
  const attachment = await getMediaAttachment({ id: src.id });
  const sizedAttachment = attachment?.sizes?.[size2 ?? ""];
  if (sizedAttachment) {
    return {
      src: sizedAttachment.url,
      height: sizedAttachment.height,
      width: sizedAttachment.width
    };
  }
  if (attachment) {
    return {
      src: attachment.url,
      height: attachment.height,
      width: attachment.width
    };
  }
  return null;
});

// src/transformers/shared/plain-transformer.ts
var plainTransformer = createTransformer((value) => {
  return value;
});

// src/transformers/shared/video-src-transformer.ts
import { getMediaAttachment as getMediaAttachment2 } from "@elementor/wp-media";
var videoSrcTransformer = createTransformer(async (value) => {
  const { id, url } = value;
  if (!id) {
    return { id: null, url };
  }
  const attachment = await getMediaAttachment2({ id });
  return {
    id,
    url: attachment?.url ?? url
  };
});

// src/init-settings-transformers.ts
function initSettingsTransformers() {
  settingsTransformersRegistry.register("classes", createClassesTransformer()).register("link", linkTransformer).register("query", queryTransformer).register("image", imageTransformer).register("image-src", imageSrcTransformer).register("video-src", videoSrcTransformer).register("attributes", attributesTransformer).register("date-time", dateTimeTransformer).register("html-v2", htmlV2Transformer).register("html-v3", htmlV3Transformer).registerFallback(plainTransformer);
}

// src/transformers/styles/background-color-overlay-transformer.ts
var backgroundColorOverlayTransformer = createTransformer((value) => {
  const { color = null } = value;
  if (!color) {
    return null;
  }
  return `linear-gradient(${color}, ${color})`;
});

// src/transformers/styles/background-gradient-overlay-transformer.ts
var backgroundGradientOverlayTransformer = createTransformer((value) => {
  if (value.type === "radial") {
    return `radial-gradient(circle at ${value.positions}, ${value.stops})`;
  }
  return `linear-gradient(${value.angle}deg, ${value.stops})`;
});

// src/transformers/styles/background-image-overlay-transformer.ts
var backgroundImageOverlayTransformer = createTransformer((value) => {
  const { image, size: size2 = null, position = null, repeat = null, attachment = null } = value;
  if (!image) {
    return null;
  }
  const src = image.src ? `url(${image.src})` : null;
  const backgroundStyles = {
    src,
    repeat,
    attachment,
    size: size2,
    position
  };
  return backgroundStyles;
});

// src/transformers/styles/background-image-size-scale-transformer.ts
var backgroundImageSizeScaleTransformer = createTransformer(
  ({ width, height }) => `${width ?? "auto"} ${height ?? "auto"}`
);

// src/transformers/styles/background-overlay-transformer.ts
var backgroundOverlayTransformer = createTransformer(
  (value) => {
    if (!value || value.length === 0) {
      return null;
    }
    const normalizedValues = normalizeOverlayValues(value);
    if (normalizedValues.length === 0) {
      return null;
    }
    const images = getValuesString(normalizedValues, "src", "none", true);
    const repeats = getValuesString(normalizedValues, "repeat", "repeat");
    const attachments = getValuesString(normalizedValues, "attachment", "scroll");
    const sizes = getValuesString(normalizedValues, "size", "auto auto");
    const positions = getValuesString(normalizedValues, "position", "0% 0%");
    return {
      "background-image": images,
      "background-repeat": repeats,
      "background-attachment": attachments,
      "background-size": sizes,
      "background-position": positions
    };
  }
);
function normalizeOverlayValues(overlays) {
  const mappedValues = overlays.map((item) => {
    if (typeof item === "string") {
      return {
        src: item,
        repeat: null,
        attachment: null,
        size: null,
        position: null
      };
    }
    return item;
  });
  return mappedValues.filter((item) => item && !!item.src);
}
function getValuesString(items, prop, defaultValue, preventUnification = false) {
  const isEmpty = items.filter((item) => item?.[prop]).length === 0;
  if (isEmpty) {
    return defaultValue;
  }
  const formattedValues = items.map((item) => item[prop] ?? defaultValue);
  if (!preventUnification) {
    const allSame = formattedValues.every((value) => value === formattedValues[0]);
    if (allSame) {
      return formattedValues[0];
    }
  }
  return formattedValues.join(",");
}

// src/transformers/styles/background-transformer.ts
var backgroundTransformer = createTransformer((value) => {
  const { color = null, "background-overlay": overlays = null, clip = null } = value;
  return createMultiPropsValue({
    ...overlays,
    "background-color": color,
    "background-clip": clip
  });
});

// src/transformers/styles/color-stop-transformer.ts
var colorStopTransformer = createTransformer(
  (value) => `${value?.color} ${value?.offset ?? 0}%`
);

// src/transformers/styles/create-combine-array-transformer.ts
var createCombineArrayTransformer = (delimiter) => {
  return createTransformer(
    (value) => value?.length ? value.filter(Boolean).join(delimiter) : null
  );
};

// src/transformers/styles/create-multi-props-transformer.ts
var createMultiPropsTransformer = (keys, keyGenerator) => {
  return createTransformer((value, { key: propKey }) => {
    const entries = keys.filter((key) => value[key]).map((key) => [keyGenerator({ propKey, key }), value[key]]);
    return createMultiPropsValue(Object.fromEntries(entries));
  });
};

// src/transformers/styles/filter-transformer.ts
var filterTransformer = createTransformer((filterValues) => {
  if (filterValues?.length < 1) {
    return null;
  }
  return filterValues.filter(Boolean).map(mapToFilterFunctionString).join(" ");
});
var mapToFilterFunctionString = (value) => {
  if (value.func === "drop-shadow") {
    const { xAxis, yAxis, blur, color } = value.args;
    return `drop-shadow(${xAxis || "0px"} ${yAxis || "0px"} ${blur || "10px"} ${color || "transparent"})`;
  }
  const size2 = value.args?.size;
  if (!value.func || !size2) {
    return "";
  }
  return `${value.func}(${size2})`;
};

// src/transformers/styles/flex-transformer.ts
var flexTransformer = createTransformer((value) => {
  const grow = value.flexGrow;
  const shrink = value.flexShrink;
  const basis = value.flexBasis;
  const hasGrow = grow !== void 0 && grow !== null;
  const hasShrink = shrink !== void 0 && shrink !== null;
  const hasBasis = basis !== void 0 && basis !== null;
  if (!hasGrow && !hasShrink && !hasBasis) {
    return null;
  }
  if (hasGrow && hasShrink && hasBasis) {
    return `${grow} ${shrink} ${typeof basis === "object" && basis.size !== void 0 ? `${basis.size}${basis.unit || ""}` : basis}`;
  }
  if (hasGrow && hasShrink && !hasBasis) {
    return `${grow} ${shrink}`;
  }
  if (hasGrow && !hasShrink && hasBasis) {
    return `${grow} 1 ${typeof basis === "object" && basis.size !== void 0 ? `${basis.size}${basis.unit || ""}` : basis}`;
  }
  if (!hasGrow && hasShrink && hasBasis) {
    return `0 ${shrink} ${typeof basis === "object" && basis.size !== void 0 ? `${basis.size}${basis.unit || ""}` : basis}`;
  }
  if (hasGrow && !hasShrink && !hasBasis) {
    return `${grow}`;
  }
  if (!hasGrow && hasShrink && !hasBasis) {
    return `0 ${shrink}`;
  }
  if (!hasGrow && !hasShrink && hasBasis) {
    return `0 1 ${typeof basis === "object" && basis.size !== void 0 ? `${basis.size}${basis.unit || ""}` : basis}`;
  }
  return null;
});

// src/transformers/styles/perspective-origin-transformer.ts
var FALLBACK = "0px";
function getVal(val) {
  return `${val ?? FALLBACK}`;
}
var perspectiveOriginTransformer = createTransformer(
  (value) => `${getVal(value?.x)} ${getVal(value?.y)}`
);

// src/transformers/styles/position-transformer.ts
var positionTransformer = createTransformer(({ x, y }) => `${x ?? "0px"} ${y ?? "0px"}`);

// src/transformers/styles/shadow-transformer.ts
var shadowTransformer = createTransformer((value) => {
  return [value.hOffset, value.vOffset, value.blur, value.spread, value.color, value.position].filter(Boolean).join(" ");
});

// src/transformers/styles/size-transformer.ts
var sizeTransformer = createTransformer((value) => {
  return value.unit === "custom" ? value.size : `${value.size}${value.unit}`;
});

// src/transformers/styles/stroke-transformer.ts
var strokeTransformer = createTransformer((value) => {
  const parsed = {
    "-webkit-text-stroke": `${value.width} ${value.color}`,
    stroke: `${value.color}`,
    "stroke-width": `${value.width}`
  };
  return createMultiPropsValue(parsed);
});

// src/transformers/styles/transform-functions-transformer.ts
var transformFunctionsTransformer = createTransformer((values) => {
  if (values?.length < 1) {
    return null;
  }
  return values.join(" ");
});

// src/transformers/styles/transform-move-transformer.ts
var defaultMove = "0px";
var transformMoveTransformer = createTransformer((value) => {
  return `translate3d(${value.x ?? defaultMove}, ${value.y ?? defaultMove}, ${value.z ?? defaultMove})`;
});

// src/transformers/styles/transform-origin-transformer.ts
var EMPTY_VALUE = "0px";
var DEFAULT_XY = "50%";
var DEFAULT_Z = EMPTY_VALUE;
function getVal2(val) {
  return `${val ?? EMPTY_VALUE}`;
}
var transformOriginTransformer = createTransformer((value) => {
  const x = getVal2(value.x);
  const y = getVal2(value.y);
  const z4 = getVal2(value.z);
  if (x === DEFAULT_XY && y === DEFAULT_XY && z4 === DEFAULT_Z) {
    return null;
  }
  return `${x} ${y} ${z4}`;
});

// src/transformers/styles/transform-rotate-transformer.ts
var defaultRotate = "0deg";
var transformRotateTransformer = createTransformer((value) => {
  const transforms = [
    `rotateX(${value?.x ?? defaultRotate})`,
    `rotateY(${value?.y ?? defaultRotate})`,
    `rotateZ(${value?.z ?? defaultRotate})`
  ];
  return transforms.join(" ");
});

// src/transformers/styles/transform-scale-transformer.ts
var transformScaleTransformer = createTransformer((value) => {
  return `scale3d(${value.x ?? 1}, ${value.y ?? 1}, ${value.z ?? 1})`;
});

// src/transformers/styles/transform-skew-transformer.ts
var defaultSkew = "0deg";
var transformSkewTransformer = createTransformer((value) => {
  const x = value?.x ?? defaultSkew;
  const y = value?.y ?? defaultSkew;
  return `skew(${x}, ${y})`;
});

// src/transformers/styles/transition-transformer.ts
import { transitionProperties } from "@elementor/editor-controls";
var getAllowedProperties = () => {
  const allowedProperties = /* @__PURE__ */ new Set();
  transitionProperties.forEach((category) => {
    category.properties.forEach((property) => {
      allowedProperties.add(property.value);
    });
  });
  return allowedProperties;
};
var transitionTransformer = createTransformer((transitionValues) => {
  if (transitionValues?.length < 1) {
    return null;
  }
  const allowedProperties = getAllowedProperties();
  const validTransitions = transitionValues.map((value) => mapToTransitionString(value, allowedProperties)).filter(Boolean);
  if (validTransitions.length === 0) {
    return null;
  }
  return validTransitions.join(", ");
});
var mapToTransitionString = (value, allowedProperties) => {
  if (!value.selection || !value.size) {
    return "";
  }
  const property = value.selection.value;
  if (!allowedProperties.has(property)) {
    return "";
  }
  return `${property} ${value.size}`;
};

// src/init-style-transformers.ts
function initStyleTransformers() {
  styleTransformersRegistry.register("size", sizeTransformer).register("shadow", shadowTransformer).register("stroke", strokeTransformer).register(
    "dimensions",
    createMultiPropsTransformer(
      ["block-start", "block-end", "inline-start", "inline-end"],
      ({ propKey, key }) => `${propKey}-${key}`
    )
  ).register("filter", filterTransformer).register("backdrop-filter", filterTransformer).register("box-shadow", createCombineArrayTransformer(",")).register("background", backgroundTransformer).register("background-overlay", backgroundOverlayTransformer).register("background-color-overlay", backgroundColorOverlayTransformer).register("background-image-overlay", backgroundImageOverlayTransformer).register("background-gradient-overlay", backgroundGradientOverlayTransformer).register("gradient-color-stop", createCombineArrayTransformer(",")).register("color-stop", colorStopTransformer).register("background-image-position-offset", positionTransformer).register("background-image-size-scale", backgroundImageSizeScaleTransformer).register("image-src", imageSrcTransformer).register("image", imageTransformer).register("object-position", positionTransformer).register("transform-origin", transformOriginTransformer).register("perspective-origin", perspectiveOriginTransformer).register("transform-move", transformMoveTransformer).register("transform-scale", transformScaleTransformer).register("transform-rotate", transformRotateTransformer).register("transform-skew", transformSkewTransformer).register("transform-functions", transformFunctionsTransformer).register(
    "transform",
    createMultiPropsTransformer(
      ["transform-functions", "transform-origin", "perspective", "perspective-origin"],
      ({ key }) => key === "transform-functions" ? "transform" : key
    )
  ).register("transition", transitionTransformer).register(
    "layout-direction",
    createMultiPropsTransformer(["row", "column"], ({ propKey, key }) => `${key}-${propKey}`)
  ).register("flex", flexTransformer).register(
    "border-width",
    createMultiPropsTransformer(
      ["block-start", "block-end", "inline-start", "inline-end"],
      ({ key }) => `border-${key}-width`
    )
  ).register(
    "border-radius",
    createMultiPropsTransformer(
      ["start-start", "start-end", "end-start", "end-end"],
      ({ key }) => `border-${key}-radius`
    )
  ).registerFallback(plainTransformer);
}

// src/legacy/init-legacy-views.ts
import { getWidgetsCache as getWidgetsCache2 } from "@elementor/editor-elements";
import { __privateListenTo, v1ReadyEvent as v1ReadyEvent2 } from "@elementor/editor-v1-adapters";

// src/renderers/create-dom-renderer.ts
import { createArrayLoader, createEnvironment } from "@elementor/twing";
function createDomRenderer() {
  const loader = createArrayLoader({});
  const environment = createEnvironment(loader);
  environment.registerEscapingStrategy(escapeHtmlTag, "html_tag");
  environment.registerEscapingStrategy(escapeURL, "full_url");
  return {
    register: loader.setTemplate,
    render: environment.render
  };
}
function escapeHtmlTag(value) {
  const allowedTags = [
    "a",
    "article",
    "aside",
    "button",
    "div",
    "footer",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "main",
    "nav",
    "p",
    "section",
    "span"
  ];
  return allowedTags.includes(value) ? value : "div";
}
function escapeURL(value) {
  const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];
  try {
    const parsed = new URL(value);
    return allowedProtocols.includes(parsed.protocol) ? value : "";
  } catch {
    return "";
  }
}

// src/legacy/create-element-type.ts
function createElementType(type) {
  const legacyWindow = window;
  return class extends legacyWindow.elementor.modules.elements.types.Widget {
    getType() {
      return type;
    }
    getView() {
      return createElementViewClassDeclaration();
    }
  };
}
function createElementViewClassDeclaration() {
  const legacyWindow = window;
  return class extends legacyWindow.elementor.modules.elements.views.Widget {
    // Dispatch `render` event so the overlay layer will be updated
    onRender(...args) {
      super.onRender(...args);
      this.#dispatchEvent("elementor/preview/atomic-widget/render");
      this.#dispatchPreviewEvent("elementor/element/render");
    }
    // Dispatch `destroy` event so the overlay layer will be updated
    onDestroy(...args) {
      super.onDestroy(...args);
      this.#dispatchEvent("elementor/preview/atomic-widget/destroy");
      this.#dispatchPreviewEvent("elementor/element/destroy");
    }
    attributes() {
      return {
        ...super.attributes(),
        // Mark the widget as atomic, so external APIs (such as the overlay layer) can reference it.
        "data-atomic": "",
        // Make the wrapper is non-existent in terms of CSS to mimic the frontend DOM tree.
        style: "display: contents !important;"
      };
    }
    // Removes behaviors that are not needed for atomic widgets (that are implemented in the overlay layer).
    behaviors() {
      const disabledBehaviors = ["InlineEditing", "Draggable", "Resizable"];
      const behaviorsAsEntries = Object.entries(super.behaviors()).filter(
        ([key]) => !disabledBehaviors.includes(key)
      );
      return Object.fromEntries(behaviorsAsEntries);
    }
    // Change the drag handle because the $el is not the draggable element (`display: contents`).
    getDomElement() {
      return this.$el.find(":first-child");
    }
    // Remove the overlay, so we can use the new overlay layer.
    getHandlesOverlay() {
      return null;
    }
    #dispatchEvent(eventType) {
      window.top?.dispatchEvent(
        new CustomEvent(eventType, {
          detail: { id: this.model.get("id") }
        })
      );
    }
    #dispatchPreviewEvent(eventType) {
      const element = this.getDomElement().get(0);
      if (!element) {
        return;
      }
      legacyWindow.elementor?.$preview?.[0]?.contentWindow.dispatchEvent(
        new CustomEvent(eventType, {
          detail: {
            id: this.model.get("id"),
            type: this.model.get("widgetType"),
            element
          }
        })
      );
    }
    getContextMenuGroups() {
      return super.getContextMenuGroups().filter((group) => group.name !== "save");
    }
  };
}

// src/legacy/create-nested-templated-element-type.ts
import { ELEMENT_STYLE_CHANGE_EVENT } from "@elementor/editor-elements";

// src/legacy/twig-rendering-utils.ts
function setupTwigRenderer({ renderer, element }) {
  const templateKey = element.twig_main_template;
  const baseStylesDictionary = element.base_styles_dictionary;
  Object.entries(element.twig_templates).forEach(([key, template]) => {
    renderer.register(key, template);
  });
  const resolveProps = createPropsResolver({
    transformers: settingsTransformersRegistry,
    schema: element.atomic_props_schema
  });
  return { templateKey, baseStylesDictionary, resolveProps };
}
function createBeforeRender(view) {
  view._ensureViewIsIntact();
  view._isRendering = true;
  view.resetChildViewContainer();
  view.triggerMethod("before:render", view);
}
function createAfterRender(view) {
  view._isRendering = false;
  view.isRendered = true;
  view.triggerMethod("render", view);
}
function rerenderExistingChildren(view) {
  view.children?.each((childView) => {
    childView.render();
  });
}
async function waitForChildrenToComplete(view) {
  const promises = [];
  view.children?.each((childView) => {
    if (childView._currentRenderPromise) {
      promises.push(childView._currentRenderPromise);
    }
  });
  if (promises.length > 0) {
    await Promise.all(promises);
  }
}

// src/legacy/create-templated-element-type.ts
function canBeTemplated(element) {
  return !!(element.atomic_props_schema && element.twig_templates && element.twig_main_template && element.base_styles_dictionary);
}
function createTemplatedElementView({
  type,
  renderer,
  element
}) {
  const BaseView = createElementViewClassDeclaration();
  const { templateKey, baseStylesDictionary, resolveProps } = setupTwigRenderer({
    type,
    renderer,
    element
  });
  return class extends BaseView {
    _abortController = null;
    _lastResolvedSettingsHash = null;
    _domUpdateWasSkipped = false;
    getTemplateType() {
      return "twig";
    }
    getNamespaceKey() {
      return type;
    }
    renderOnChange() {
      this.render();
    }
    getRenderContext() {
      return this._parent?.getRenderContext?.();
    }
    getResolverRenderContext() {
      return this._parent?.getResolverRenderContext?.();
    }
    invalidateRenderCache() {
      this._lastResolvedSettingsHash = null;
    }
    render() {
      this._abortController?.abort();
      this._abortController = new AbortController();
      const process = signalizedProcess(this._abortController.signal).then(() => this._beforeRender()).then(() => this._renderTemplate()).then(() => this._renderChildren()).then(() => this._afterRender());
      this._currentRenderPromise = process.execute();
      return this._currentRenderPromise;
    }
    async _renderChildren() {
      if (this._shouldReuseChildren()) {
        rerenderExistingChildren(this);
      } else {
        super._renderChildren();
      }
      await waitForChildrenToComplete(this);
    }
    _shouldReuseChildren() {
      return this._domUpdateWasSkipped && this.children?.length > 0;
    }
    async _renderTemplate() {
      this.triggerMethod("before:render:template");
      const process = signalizedProcess(this._abortController?.signal).then((_, signal) => {
        const settings = this.model.get("settings").toJSON();
        return resolveProps({
          props: settings,
          signal,
          renderContext: this.getResolverRenderContext()
        });
      }).then((settings) => {
        return this.afterSettingsResolve(settings);
      }).then(async (settings) => {
        const settingsHash = JSON.stringify(settings);
        const settingsChanged = settingsHash !== this._lastResolvedSettingsHash;
        if (!settingsChanged && this.isRendered) {
          this._domUpdateWasSkipped = true;
          return null;
        }
        this._domUpdateWasSkipped = false;
        this._lastResolvedSettingsHash = settingsHash;
        const context = {
          id: this.model.get("id"),
          type,
          settings,
          base_styles: baseStylesDictionary
        };
        return renderer.render(templateKey, context);
      }).then((html) => {
        if (html === null) {
          return;
        }
        this.$el.html(html);
      });
      await process.execute();
      this.bindUIElements();
      this.triggerMethod("render:template");
    }
    afterSettingsResolve(settings) {
      return settings;
    }
    _beforeRender() {
      createBeforeRender(this);
    }
    _afterRender() {
      createAfterRender(this);
    }
    _doAfterRender(callback) {
      if (this.isRendered) {
        callback();
      } else {
        this.once("render", callback);
      }
    }
    _openEditingPanel(options) {
      this._doAfterRender(() => super._openEditingPanel(options));
    }
  };
}

// src/legacy/create-nested-templated-element-type.ts
function canBeNestedTemplated(element) {
  return canBeTemplated(element) && "support_nesting" in element && !!element.support_nesting;
}
function createNestedTemplatedElementType({
  type,
  renderer,
  element,
  modelExtensions
}) {
  const legacyWindow = window;
  return class extends legacyWindow.elementor.modules.elements.types.Base {
    getType() {
      return type;
    }
    getView() {
      return createNestedTemplatedElementView({ type, renderer, element });
    }
    getModel() {
      const BaseModel = legacyWindow.elementor.modules.elements.models.AtomicElementBase;
      if (modelExtensions && Object.keys(modelExtensions).length > 0) {
        return BaseModel.extend(modelExtensions);
      }
      return BaseModel;
    }
  };
}
function buildEditorAttributes(model) {
  const id = model.get("id");
  const cid = model.cid ?? "";
  const attrs = {
    "data-model-cid": cid,
    "data-interaction-id": id,
    "x-ignore": "true"
  };
  return Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(" ");
}
function buildEditorClasses(model) {
  const id = model.get("id");
  return ["elementor-element", "elementor-element-edit-mode", `elementor-element-${id}`].join(" ");
}
function createNestedTemplatedElementView({
  type,
  renderer,
  element
}) {
  const legacyWindow = window;
  const { templateKey, baseStylesDictionary, resolveProps } = setupTwigRenderer({
    type,
    renderer,
    element
  });
  const AtomicElementBaseView = legacyWindow.elementor.modules.elements.views.createAtomicElementBase(type);
  const parentRenderChildren = AtomicElementBaseView.prototype._renderChildren;
  const parentOpenEditingPanel = AtomicElementBaseView.prototype._openEditingPanel;
  return AtomicElementBaseView.extend({
    _abortController: null,
    _lastResolvedSettingsHash: null,
    _domUpdateWasSkipped: false,
    template: false,
    getTemplateType() {
      return "twig";
    },
    invalidateRenderCache() {
      this._lastResolvedSettingsHash = null;
    },
    render() {
      this._abortController?.abort();
      this._abortController = new AbortController();
      const process = signalizedProcess(this._abortController.signal).then(() => this._beforeRender()).then(() => this._renderTemplate()).then(() => this._onTemplateReady()).then(() => this._renderChildren()).then(() => this._afterRender());
      this._currentRenderPromise = process.execute();
      return this._currentRenderPromise;
    },
    _beforeRender() {
      createBeforeRender(this);
    },
    _onTemplateReady() {
      this.dispatchPreviewEvent("elementor/element/render");
    },
    _afterRender() {
      createAfterRender(this);
      this.dispatchPreviewEvent("elementor/element/rendered");
      requestAnimationFrame(() => {
        this._initAlpine();
      });
      this.model.trigger("render:complete");
      window.dispatchEvent(new CustomEvent(ELEMENT_STYLE_CHANGE_EVENT));
    },
    async _renderTemplate() {
      const model = this.model;
      this.triggerMethod("before:render:template");
      const process = signalizedProcess(this._abortController?.signal).then((_, signal) => {
        const settings = model.get("settings").toJSON();
        return resolveProps({
          props: settings,
          signal,
          renderContext: this.getResolverRenderContext?.()
        });
      }).then(async (settings) => {
        const settingsHash = JSON.stringify(settings);
        const settingsChanged = settingsHash !== this._lastResolvedSettingsHash;
        if (!settingsChanged && this.isRendered) {
          this._domUpdateWasSkipped = true;
          return null;
        }
        this._domUpdateWasSkipped = false;
        this._lastResolvedSettingsHash = settingsHash;
        const context = {
          id: model.get("id"),
          type,
          settings,
          base_styles: baseStylesDictionary,
          editor_attributes: buildEditorAttributes(model),
          editor_classes: buildEditorClasses(model)
        };
        return renderer.render(templateKey, context);
      }).then((html) => {
        if (html === null) {
          return;
        }
        this._attachTwigContent(html);
      });
      await process.execute();
      this.bindUIElements();
      this.triggerMethod("render:template");
    },
    getRenderContext() {
      return this._parent?.getRenderContext?.();
    },
    getResolverRenderContext() {
      return this._parent?.getResolverRenderContext?.();
    },
    getChildType() {
      const allowedTypes = element.allowed_child_types ?? [];
      if (allowedTypes && allowedTypes.length > 0) {
        return allowedTypes;
      }
      return AtomicElementBaseView.prototype.getChildType.call(this);
    },
    _attachTwigContent(html) {
      const $newContent = legacyWindow.jQuery(html);
      const oldEl = this.$el.get(0);
      const newEl = $newContent.get(0);
      if (!oldEl || !newEl) {
        return;
      }
      this._destroyAlpine();
      Array.from(newEl.attributes).forEach((attr) => {
        oldEl.setAttribute(attr.name, attr.value);
      });
      oldEl.setAttribute("draggable", "true");
      const overlayHTML = this.getHandlesOverlay()?.get(0)?.outerHTML ?? "";
      oldEl.innerHTML = overlayHTML + newEl.innerHTML;
    },
    async _renderChildren() {
      if (this._shouldReuseChildren()) {
        rerenderExistingChildren(this);
      } else {
        parentRenderChildren.call(this);
      }
      await waitForChildrenToComplete(this);
      this._removeChildrenPlaceholder();
    },
    _shouldReuseChildren() {
      return this._domUpdateWasSkipped && this.children?.length > 0;
    },
    _removeChildrenPlaceholder() {
      const el = this.$el.get(0);
      if (!el) {
        return;
      }
      const placeholderComment = Array.from(el.childNodes).find(
        (node) => node.nodeType === Node.COMMENT_NODE && node.nodeValue?.trim() === "elementor-children-placeholder"
      );
      placeholderComment?.remove();
    },
    getChildViewContainer() {
      this.childViewContainer = "";
      return this.$el;
    },
    attachBuffer(_collectionView, buffer) {
      const el = this.$el.get(0);
      if (!el) {
        return;
      }
      const placeholderComment = Array.from(el.childNodes).find(
        (node) => node.nodeType === Node.COMMENT_NODE && node.nodeValue?.trim() === "elementor-children-placeholder"
      );
      if (placeholderComment) {
        placeholderComment.parentNode?.insertBefore(buffer, placeholderComment);
        placeholderComment.remove();
      } else {
        el.append(buffer);
      }
    },
    getDomElement() {
      return this.$el;
    },
    onBeforeDestroy() {
      this._abortController?.abort();
    },
    onDestroy() {
      this.dispatchPreviewEvent("elementor/element/destroy");
    },
    _destroyAlpine() {
      const el = this.$el.get(0);
      if (!el) {
        return;
      }
      const xDataValue = el.getAttribute("x-data");
      if (!xDataValue) {
        return;
      }
      const previewWindow = el.ownerDocument?.defaultView;
      previewWindow?.Alpine?.destroyTree(el);
    },
    _initAlpine() {
      const el = this.$el.get(0);
      if (!el) {
        return;
      }
      el.removeAttribute("x-ignore");
      const xDataValue = el.getAttribute("x-data");
      if (!xDataValue) {
        return;
      }
      const previewWindow = el.ownerDocument?.defaultView;
      previewWindow?.Alpine?.initTree(el);
    },
    _doAfterRender(callback) {
      if (this.isRendered) {
        callback();
      } else {
        this.once("render", callback);
      }
    },
    _openEditingPanel(options) {
      this._doAfterRender(() => parentOpenEditingPanel.call(this, options));
    }
  });
}

// src/legacy/replacements/inline-editing/inline-editing-elements.tsx
import * as React6 from "react";
import { createRoot } from "react-dom/client";
import { getContainer, getElementLabel, getElementType as getElementType2 } from "@elementor/editor-elements";
import {
  htmlV3PropTypeUtil as htmlV3PropTypeUtil2,
  parseHtmlChildren,
  stringPropTypeUtil as stringPropTypeUtil2
} from "@elementor/editor-props";
import { __privateRunCommandSync as runCommandSync, getCurrentEditMode, undoable } from "@elementor/editor-v1-adapters";
import { __ as __3 } from "@wordpress/i18n";

// src/legacy/replacements/base.ts
var TRIGGER_TIMING = {
  before: "before",
  after: "after",
  never: "never"
};
var ReplacementBase = class {
  getSetting;
  setSetting;
  element;
  type;
  id;
  refreshView;
  constructor(settings) {
    this.getSetting = settings.getSetting;
    this.setSetting = settings.setSetting;
    this.element = settings.element;
    this.type = settings.type;
    this.id = settings.id;
    this.refreshView = settings.refreshView;
  }
  static getTypes() {
    return null;
  }
  shouldRenderReplacement() {
    return true;
  }
  originalMethodsToTrigger() {
    return {
      _beforeRender: TRIGGER_TIMING.before,
      _afterRender: TRIGGER_TIMING.after,
      renderOnChange: TRIGGER_TIMING.never,
      onDestroy: TRIGGER_TIMING.never,
      render: TRIGGER_TIMING.never
    };
  }
};

// src/legacy/replacements/inline-editing/canvas-inline-editor.tsx
import * as React5 from "react";
import { useEffect as useEffect8, useLayoutEffect, useState as useState5 } from "react";
import { InlineEditor, InlineEditorToolbar } from "@elementor/editor-controls";
import { Box as Box2, ThemeProvider } from "@elementor/ui";
import { autoUpdate as autoUpdate2, flip, FloatingPortal as FloatingPortal2, useFloating as useFloating2 } from "@floating-ui/react";

// src/legacy/replacements/inline-editing/inline-editing-utils.ts
import { useCallback, useEffect as useEffect7, useState as useState4 } from "react";
var TOP_BAR_SELECTOR = "#elementor-editor-wrapper-v2";
var NAVIGATOR_SELECTOR = "#elementor-navigator";
var EDITING_PANEL = "#elementor-panel";
var EDITOR_ELEMENTS_OUT_OF_IFRAME = [TOP_BAR_SELECTOR, NAVIGATOR_SELECTOR, EDITING_PANEL];
var TOOLBAR_ANCHOR_ID_PREFIX = "inline-editing-toolbar-anchor";
var TOOLBAR_ANCHOR_STATIC_STYLES = {
  backgroundColor: "transparent",
  border: "none",
  outline: "none",
  boxShadow: "none",
  padding: "0",
  margin: "0",
  borderRadius: "0",
  overflow: "hidden",
  opacity: "0",
  pointerEvents: "none",
  position: "absolute",
  display: "block"
};
var INLINE_EDITING_PROPERTY_PER_TYPE = {
  "e-button": "text",
  "e-form-label": "text",
  "e-heading": "title",
  "e-paragraph": "paragraph"
};
var getInlineEditorElement = (elementWrapper, expectedTag) => {
  return !expectedTag ? null : elementWrapper.querySelector(expectedTag);
};
var useOnClickOutsideIframe = (handleUnmount) => {
  const asyncUnmountInlineEditor = useCallback(() => queueMicrotask(handleUnmount), [handleUnmount]);
  useEffect7(() => {
    EDITOR_ELEMENTS_OUT_OF_IFRAME.forEach(
      (selector) => document?.querySelector(selector)?.addEventListener("mousedown", asyncUnmountInlineEditor)
    );
    return () => EDITOR_ELEMENTS_OUT_OF_IFRAME.forEach(
      (selector) => document?.querySelector(selector)?.removeEventListener("mousedown", asyncUnmountInlineEditor)
    );
  }, []);
};
var useRenderToolbar = (ownerDocument, id) => {
  const [anchor, setAnchor] = useState4(null);
  const onSelectionEnd = (view) => {
    const hasSelection = !view.state.selection.empty;
    removeToolbarAnchor(ownerDocument, id);
    if (hasSelection) {
      setAnchor(createAnchorBasedOnSelection(ownerDocument, id));
    } else {
      setAnchor(null);
    }
  };
  return { onSelectionEnd, anchor };
};
var createAnchorBasedOnSelection = (ownerDocument, id) => {
  const frameWindow = ownerDocument.defaultView;
  const selection = frameWindow?.getSelection();
  if (!selection) {
    return null;
  }
  const range = selection.getRangeAt(0);
  const selectionRect = range.getBoundingClientRect();
  const bodyRect = ownerDocument.body.getBoundingClientRect();
  const toolbarAnchor = ownerDocument.createElement("span");
  styleToolbarAnchor(toolbarAnchor, selectionRect, bodyRect);
  toolbarAnchor.setAttribute("id", getToolbarAnchorId(id));
  ownerDocument.body.appendChild(toolbarAnchor);
  return toolbarAnchor;
};
var removeToolbarAnchor = (ownerDocument, id) => {
  const toolbarAnchor = getToolbarAnchor(ownerDocument, id);
  if (toolbarAnchor) {
    ownerDocument.body.removeChild(toolbarAnchor);
  }
};
var getToolbarAnchorId = (id) => `${TOOLBAR_ANCHOR_ID_PREFIX}-${id}`;
var getToolbarAnchor = (ownerDocument, id) => ownerDocument.getElementById(getToolbarAnchorId(id));
var styleToolbarAnchor = (anchor, selectionRect, bodyRect) => {
  const { width, height } = selectionRect;
  Object.assign(anchor.style, {
    ...TOOLBAR_ANCHOR_STATIC_STYLES,
    top: `${selectionRect.top - bodyRect.top}px`,
    left: `${selectionRect.left - bodyRect.left}px`,
    width: `${width}px`,
    height: `${height}px`
  });
};
var horizontalShifterMiddleware = {
  name: "horizontalShifter",
  fn(state) {
    const {
      x: left,
      y: top,
      elements: { reference: anchor, floating }
    } = state;
    const newState = {
      ...state,
      x: left,
      y: top
    };
    const isLeftOverflown = left < 0;
    if (isLeftOverflown) {
      newState.x = 0;
      return newState;
    }
    const anchorRect = anchor.getBoundingClientRect();
    const right = left + floating.offsetWidth;
    const documentWidth = anchor.ownerDocument.body.offsetWidth;
    const isRightOverflown = right > documentWidth && anchorRect.right < right;
    if (isRightOverflown) {
      const diff = right - documentWidth;
      newState.x = left - diff;
      return newState;
    }
    return newState;
  }
};

// src/legacy/replacements/inline-editing/canvas-inline-editor.tsx
var EDITOR_WRAPPER_SELECTOR = "inline-editor-wrapper";
var CanvasInlineEditor = ({
  elementClasses,
  initialValue,
  expectedTag,
  rootElement,
  id,
  setValue,
  ...props
}) => {
  const [editor, setEditor] = useState5(null);
  const { onSelectionEnd, anchor: toolbarAnchor } = useRenderToolbar(rootElement.ownerDocument, id);
  const onBlur = () => {
    removeToolbarAnchor(rootElement.ownerDocument, id);
    props.onBlur();
  };
  useOnClickOutsideIframe(onBlur);
  return /* @__PURE__ */ React5.createElement(ThemeProvider, null, /* @__PURE__ */ React5.createElement(InlineEditingOverlay, { expectedTag, rootElement, id }), /* @__PURE__ */ React5.createElement("style", null, `
			.ProseMirror > * {
				height: 100%;
			}
			.${EDITOR_WRAPPER_SELECTOR} .ProseMirror > button[contenteditable="true"] {
				height: auto;
				cursor: text;
			}
			`), /* @__PURE__ */ React5.createElement(
    InlineEditor,
    {
      onEditorCreate: setEditor,
      editorProps: {
        attributes: {
          style: "outline: none;overflow-wrap: normal;height:100%"
        }
      },
      elementClasses,
      value: initialValue,
      setValue,
      onBlur,
      autofocus: true,
      expectedTag,
      onSelectionEnd
    }
  ), toolbarAnchor && editor && /* @__PURE__ */ React5.createElement(InlineEditingToolbar, { anchor: toolbarAnchor, editor, id }));
};
var InlineEditingOverlay = ({
  expectedTag,
  rootElement,
  id
}) => {
  const inlineEditedElement = getInlineEditorElement(rootElement, expectedTag);
  const [overlayRefElement, setOverlayElement] = useState5(inlineEditedElement);
  useEffect8(() => {
    setOverlayElement(getInlineEditorElement(rootElement, expectedTag));
  }, [expectedTag, rootElement]);
  return overlayRefElement ? /* @__PURE__ */ React5.createElement(OutlineOverlay, { element: overlayRefElement, id, isSelected: true }) : null;
};
var InlineEditingToolbar = ({ anchor, editor, id }) => {
  const { refs, floatingStyles } = useFloating2({
    placement: "top",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: autoUpdate2,
    middleware: [horizontalShifterMiddleware, flip()]
  });
  useLayoutEffect(() => {
    refs.setReference(anchor);
    return () => refs.setReference(null);
  }, [anchor, refs]);
  return /* @__PURE__ */ React5.createElement(FloatingPortal2, { id: CANVAS_WRAPPER_ID }, /* @__PURE__ */ React5.createElement(Box2, { ref: refs.setFloating, role: "presentation", style: { ...floatingStyles, pointerEvents: "none" } }, /* @__PURE__ */ React5.createElement(InlineEditorToolbar, { editor, elementId: id })));
};

// src/legacy/replacements/inline-editing/inline-editing-eligibility.ts
import { htmlV3PropTypeUtil, stringPropTypeUtil } from "@elementor/editor-props";
var hasKey = (propType) => {
  return "key" in propType;
};
var TEXT_PROP_TYPE_KEYS = /* @__PURE__ */ new Set([htmlV3PropTypeUtil.key, stringPropTypeUtil.key]);
var isCoreTextPropTypeKey = (key) => {
  return TEXT_PROP_TYPE_KEYS.has(key);
};
var isAllowedBySchema = (propTypeFromSchema) => {
  if (!propTypeFromSchema) {
    return false;
  }
  if (hasKey(propTypeFromSchema) && isCoreTextPropTypeKey(propTypeFromSchema.key)) {
    return true;
  }
  if (propTypeFromSchema.kind !== "union") {
    return false;
  }
  return [...TEXT_PROP_TYPE_KEYS].some((key) => propTypeFromSchema.prop_types[key]);
};
var isInlineEditingAllowed = ({ rawValue, propTypeFromSchema }) => {
  if (rawValue === null || rawValue === void 0) {
    return isAllowedBySchema(propTypeFromSchema);
  }
  return htmlV3PropTypeUtil.isValid(rawValue) || stringPropTypeUtil.isValid(rawValue);
};

// src/legacy/replacements/inline-editing/inline-editing-elements.tsx
var HISTORY_DEBOUNCE_WAIT = 800;
var InlineEditingReplacement = class extends ReplacementBase {
  inlineEditorRoot = null;
  handlerAttached = false;
  getReplacementKey() {
    return "inline-editing";
  }
  static getTypes() {
    return Object.keys(INLINE_EDITING_PROPERTY_PER_TYPE);
  }
  isEditingModeActive() {
    return !!this.inlineEditorRoot;
  }
  shouldRenderReplacement() {
    return this.isInlineEditingEligible() && getCurrentEditMode() === "edit";
  }
  handleRenderInlineEditor = () => {
    if (this.isEditingModeActive() || !this.isInlineEditingEligible()) {
      return;
    }
    this.renderInlineEditor();
  };
  renderOnChange() {
    if (this.isEditingModeActive()) {
      return;
    }
    this.refreshView();
  }
  onDestroy() {
    this.resetInlineEditorRoot();
  }
  _beforeRender() {
    this.resetInlineEditorRoot();
  }
  _afterRender() {
    if (this.isInlineEditingEligible() && !this.handlerAttached) {
      this.element.addEventListener("click", this.handleRenderInlineEditor);
      this.handlerAttached = true;
    }
  }
  originalMethodsToTrigger() {
    const before = this.isEditingModeActive() ? TRIGGER_TIMING.never : TRIGGER_TIMING.before;
    const after = this.isEditingModeActive() ? TRIGGER_TIMING.never : TRIGGER_TIMING.after;
    return {
      _beforeRender: before,
      _afterRender: after,
      renderOnChange: after,
      onDestroy: TRIGGER_TIMING.after,
      render: before
    };
  }
  resetInlineEditorRoot() {
    this.element.removeEventListener("click", this.handleRenderInlineEditor);
    this.handlerAttached = false;
    this.inlineEditorRoot?.unmount?.();
    this.inlineEditorRoot = null;
  }
  unmountInlineEditor() {
    this.resetInlineEditorRoot();
    this.refreshView();
  }
  isInlineEditingEligible() {
    const settingKey = this.getInlineEditablePropertyName();
    const rawValue = this.getSetting(settingKey);
    return isInlineEditingAllowed({ rawValue, propTypeFromSchema: this.getInlineEditablePropType() });
  }
  getInlineEditablePropertyName() {
    return INLINE_EDITING_PROPERTY_PER_TYPE[this.type] ?? "";
  }
  getInlineEditablePropType() {
    const propSchema = getElementType2(this.type)?.propsSchema;
    const propertyName = this.getInlineEditablePropertyName();
    return propSchema?.[propertyName] ?? null;
  }
  getInlineEditablePropValue() {
    const prop = this.getInlineEditablePropType();
    const settingKey = this.getInlineEditablePropertyName();
    return this.getSetting(settingKey) ?? prop?.default ?? null;
  }
  getExtractedContentValue() {
    const propValue = this.getInlineEditablePropValue();
    const extracted = htmlV3PropTypeUtil2.extract(propValue);
    return stringPropTypeUtil2.extract(extracted?.content ?? null) ?? "";
  }
  setContentValue(value) {
    const settingKey = this.getInlineEditablePropertyName();
    const html = value || "";
    const parsed = parseHtmlChildren(html);
    const valueToSave = htmlV3PropTypeUtil2.create({
      content: parsed.content ? stringPropTypeUtil2.create(parsed.content) : null,
      children: parsed.children
    });
    undoable(
      {
        do: () => {
          const prevValue = this.getInlineEditablePropValue();
          this.runCommand(settingKey, valueToSave);
          return prevValue;
        },
        undo: (_, prevValue) => {
          this.runCommand(settingKey, prevValue ?? null);
        }
      },
      {
        title: getElementLabel(this.id),
        // translators: %s is the name of the property that was edited.
        subtitle: __3("%s edited", "elementor").replace(
          "%s",
          this.getInlineEditablePropTypeKey() ?? "Inline editing"
        ),
        debounce: { wait: HISTORY_DEBOUNCE_WAIT }
      }
    )();
  }
  getInlineEditablePropTypeKey() {
    const propType = this.getInlineEditablePropType();
    if (!propType) {
      return null;
    }
    if (propType.kind === "union") {
      const textKeys = [htmlV3PropTypeUtil2.key, stringPropTypeUtil2.key];
      for (const key of textKeys) {
        if (propType.prop_types[key]) {
          return key;
        }
      }
      return null;
    }
    if ("key" in propType && typeof propType.key === "string") {
      return propType.key;
    }
    return null;
  }
  runCommand(key, value) {
    runCommandSync(
      "document/elements/set-settings",
      {
        container: getContainer(this.id),
        settings: {
          [key]: value
        }
      },
      { internal: true }
    );
    runCommandSync("document/save/set-is-modified", { status: true }, { internal: true });
  }
  getExpectedTag() {
    const tagPropType = this.getTagPropType();
    const tagSettingKey = "tag";
    return stringPropTypeUtil2.extract(this.getSetting(tagSettingKey) ?? null) ?? stringPropTypeUtil2.extract(tagPropType?.default ?? null) ?? null;
  }
  getTagPropType() {
    const propsSchema = getElementType2(this.type)?.propsSchema;
    if (!propsSchema?.tag) {
      return null;
    }
    const tagPropType = propsSchema.tag ?? null;
    if (tagPropType.kind === "union") {
      return tagPropType.prop_types.string ?? null;
    }
    return tagPropType;
  }
  renderInlineEditor() {
    if (this.isEditingModeActive()) {
      this.resetInlineEditorRoot();
    }
    const elementClasses = this.element.children?.[0]?.classList.toString() ?? "";
    const propValue = this.getExtractedContentValue();
    const expectedTag = this.getExpectedTag();
    this.element.innerHTML = "";
    this.inlineEditorRoot = createRoot(this.element);
    this.inlineEditorRoot.render(
      /* @__PURE__ */ React6.createElement(
        CanvasInlineEditor,
        {
          elementClasses,
          initialValue: propValue,
          expectedTag,
          rootElement: this.element,
          id: this.id,
          setValue: this.setContentValue.bind(this),
          onBlur: this.unmountInlineEditor.bind(this)
        }
      )
    );
  }
};

// src/legacy/replacements/manager.ts
var replacements = /* @__PURE__ */ new Map();
var initViewReplacements = () => {
  registerReplacement(InlineEditingReplacement);
};
var registerReplacement = (replacement) => {
  const types = replacement.getTypes();
  if (!types) {
    return;
  }
  types.forEach((type) => {
    replacements.set(type, replacement);
  });
};
var getReplacement = (type) => {
  return replacements.get(type) ?? null;
};
var createViewWithReplacements = (options) => {
  const TemplatedView = createTemplatedElementView(options);
  return class extends TemplatedView {
    #replacement = null;
    #config;
    constructor(...args) {
      super(...args);
      const settings = this.model.get("settings");
      this.#config = {
        getSetting: settings.get.bind(settings),
        setSetting: settings.set.bind(settings),
        element: this.el,
        type: this?.model?.get("widgetType") ?? this.container?.model?.get("elType") ?? null,
        id: this?.model?.get("id") ?? null,
        refreshView: this.refreshView.bind(this)
      };
    }
    refreshView() {
      this.invalidateRenderCache?.();
      this.render();
    }
    renderOnChange() {
      this.#triggerAltMethod("renderOnChange");
    }
    render() {
      const config = this.#config;
      const widgetType = config.type;
      const ReplacementClass = widgetType ? getReplacement(widgetType) : null;
      if (ReplacementClass && !this.#replacement) {
        this.#replacement = new ReplacementClass(config);
      }
      this.#triggerAltMethod("render");
    }
    onDestroy() {
      this.#triggerAltMethod("onDestroy");
    }
    _afterRender() {
      this.#triggerAltMethod("_afterRender");
    }
    _beforeRender() {
      this.#triggerAltMethod("_beforeRender");
    }
    #triggerAltMethod(methodKey) {
      const baseMethod = TemplatedView.prototype[methodKey].bind(this);
      const shouldReplace = this.#replacement?.shouldRenderReplacement();
      const altMethod = shouldReplace && this.#replacement?.[methodKey]?.bind(this.#replacement);
      if (!altMethod || !shouldReplace) {
        return baseMethod();
      }
      const renderTiming = this.#replacement?.originalMethodsToTrigger()[methodKey] ?? "never";
      if (renderTiming === "before") {
        baseMethod();
      }
      altMethod();
      if (renderTiming === "after") {
        baseMethod();
      }
    }
  };
};
var createTemplatedElementTypeWithReplacements = ({
  type,
  renderer,
  element
}) => {
  const legacyWindow = window;
  const view = createViewWithReplacements({
    type,
    renderer,
    element
  });
  return class extends legacyWindow.elementor.modules.elements.types.Widget {
    getType() {
      return type;
    }
    getView() {
      return view;
    }
  };
};

// src/legacy/init-legacy-views.ts
var elementsLegacyTypes = {};
var modelExtensionsRegistry = {};
function registerModelExtensions(type, extensions) {
  modelExtensionsRegistry[type] = extensions;
}
function registerElementType(type, elementTypeGenerator) {
  elementsLegacyTypes[type] = elementTypeGenerator;
}
function initLegacyViews() {
  __privateListenTo(v1ReadyEvent2(), () => {
    const widgetsCache = getWidgetsCache2() ?? {};
    const legacyWindow = window;
    const renderer = createDomRenderer();
    Object.entries(widgetsCache).forEach(([type, element]) => {
      if (!element.atomic) {
        return;
      }
      const ResolvedElementType = resolveElementType(type, renderer, element);
      tryRegisterElement(legacyWindow, type, element, ResolvedElementType);
    });
  });
}
function resolveElementType(type, renderer, element) {
  if (canBeNestedTemplated(element)) {
    return createNestedTemplatedType(type, renderer, element);
  }
  if (!canBeTemplated(element)) {
    return createElementType(type);
  }
  const customGenerator = elementsLegacyTypes[type];
  return customGenerator?.({ type, renderer, element }) ?? createTemplatedElementTypeWithReplacements({ type, renderer, element });
}
function tryRegisterElement(legacyWindow, type, element, ResolvedElementType) {
  const shouldBeRegistered = canBeTemplated(element) || canBeNestedTemplated(element);
  if (!shouldBeRegistered) {
    return;
  }
  const elementsManager = legacyWindow.elementor.elementsManager;
  const isAlreadyRegistered = Boolean(elementsManager.getElementTypeClass(type));
  try {
    elementsManager.registerElementType(new ResolvedElementType());
  } catch {
    const canOverrideExisting = canBeNestedTemplated(element) && isAlreadyRegistered;
    if (canOverrideExisting) {
      elementsManager._elementTypes[type] = new ResolvedElementType();
    }
  }
}
function createNestedTemplatedType(type, renderer, element) {
  return createNestedTemplatedElementType({
    type,
    renderer,
    element,
    modelExtensions: modelExtensionsRegistry[type]
  });
}

// src/legacy/tabs-model-extensions.ts
import { htmlV3PropTypeUtil as htmlV3PropTypeUtil3, stringPropTypeUtil as stringPropTypeUtil3 } from "@elementor/editor-props";
var tabModelExtensions = {
  modifyDefaultChildren(elements) {
    if (!Array.isArray(elements) || elements.length === 0) {
      return elements;
    }
    const [paragraph] = elements;
    const position = this.get("editor_settings")?.initial_position;
    if (!position || !paragraph || typeof paragraph !== "object") {
      return elements;
    }
    const paragraphElement = paragraph;
    const updatedParagraph = {
      ...paragraphElement,
      settings: {
        ...paragraphElement.settings,
        paragraph: htmlV3PropTypeUtil3.create({
          content: stringPropTypeUtil3.create(`Tab ${position}`),
          children: []
        })
      }
    };
    return [updatedParagraph, ...elements.slice(1)];
  }
};
function initTabsModelExtensions() {
  registerModelExtensions("e-tab", tabModelExtensions);
}

// src/mcp/resources/document-structure-resource.ts
import { __privateListenTo as listenTo, commandEndEvent as commandEndEvent4 } from "@elementor/editor-v1-adapters";
var DOCUMENT_STRUCTURE_URI = "elementor://document/structure";
var initDocumentStructureResource = (reg) => {
  const { mcpServer, sendResourceUpdated } = reg;
  let currentDocumentStructure = null;
  const updateDocumentStructure = () => {
    const structure = getDocumentStructure();
    const newStructure = JSON.stringify(structure, null, 2);
    if (newStructure !== currentDocumentStructure) {
      currentDocumentStructure = newStructure;
      sendResourceUpdated({ uri: DOCUMENT_STRUCTURE_URI });
    }
  };
  listenTo(
    [
      commandEndEvent4("document/elements/create"),
      commandEndEvent4("document/elements/delete"),
      commandEndEvent4("document/elements/move"),
      commandEndEvent4("document/elements/copy"),
      commandEndEvent4("document/elements/paste"),
      commandEndEvent4("editor/documents/attach-preview")
    ],
    updateDocumentStructure
  );
  updateDocumentStructure();
  mcpServer.resource("document-structure", DOCUMENT_STRUCTURE_URI, async () => {
    const structure = getDocumentStructure();
    return {
      contents: [
        {
          uri: DOCUMENT_STRUCTURE_URI,
          text: JSON.stringify(structure, null, 2)
        }
      ]
    };
  });
};
function getDocumentStructure() {
  const extendedWindow = window;
  const document2 = extendedWindow.elementor?.documents?.getCurrent?.();
  if (!document2) {
    return { error: "No active document found" };
  }
  const containers = document2.container?.children || [];
  const elements = containers.map(
    (container) => extractElementData(container)
  );
  return {
    documentId: document2.id,
    documentType: document2.config.type,
    title: document2.config.settings?.post_title || "Untitled",
    elements: elements.filter((el) => el !== null)
  };
}
function extractElementData(element) {
  if (!element || !element.model) {
    return null;
  }
  const model = element.model.attributes;
  const result = {
    id: model.id,
    elType: model.elType,
    widgetType: model.widgetType || void 0
  };
  const title = model.title || element.model?.editor_settings?.title;
  if (title) {
    result.title = title;
  }
  if (element.children && element.children.length > 0) {
    result.children = element.children.map((child) => extractElementData(child)).filter((child) => child !== null);
  }
  return result;
}

// src/mcp/tools/build-composition/tool.ts
import {
  createElement as createElement8,
  deleteElement,
  getContainer as getContainer3,
  getWidgetsCache as getWidgetsCache6
} from "@elementor/editor-elements";

// src/composition-builder/composition-builder.ts
import {
  createElement as createElement7,
  generateElementId,
  getContainer as getContainer2,
  getWidgetsCache as getWidgetsCache5
} from "@elementor/editor-elements";

// src/mcp/utils/do-update-element-property.ts
import {
  createElementStyle,
  getElementStyles,
  getWidgetsCache as getWidgetsCache3,
  updateElementSettings,
  updateElementStyle
} from "@elementor/editor-elements";
import { getPropSchemaFromCache, Schema as Schema2 } from "@elementor/editor-props";
import { getStylesSchema as getStylesSchema3 } from "@elementor/editor-styles";
function resolvePropValue(value, forceKey) {
  const Utils = window.elementorV2.editorVariables.Utils;
  return Schema2.adjustLlmPropValueSchema(value, {
    forceKey,
    transformers: Utils.globalVariablesLLMResolvers
  });
}
var doUpdateElementProperty = (params) => {
  const { elementId, propertyName, propertyValue, elementType } = params;
  if (propertyName === "_styles") {
    const elementStyles = getElementStyles(elementId) || {};
    const propertyMapValue = propertyValue;
    const styleSchema = getStylesSchema3();
    const transformedStyleValues = Object.fromEntries(
      Object.entries(propertyMapValue).map(([key, val]) => {
        if (key === "custom_css") {
          return [key, val];
        }
        const { key: propKey2, kind } = styleSchema?.[key] || {};
        if (!propKey2 && kind !== "union") {
          throw new Error(`_styles property ${key} is not supported.`);
        }
        return [key, resolvePropValue(val, propKey2)];
      })
    );
    let customCss;
    Object.keys(propertyMapValue).forEach((stylePropName) => {
      const propertyRawSchema = styleSchema[stylePropName];
      if (stylePropName === "custom_css") {
        let customCssValue = propertyMapValue[stylePropName];
        if (typeof customCssValue === "object" && customCssValue && customCssValue.value) {
          customCssValue = String(customCssValue.value);
        }
        if (!customCssValue) {
          customCssValue = "";
        }
        customCss = {
          raw: btoa(customCssValue)
        };
        return;
      }
      const isSupported = !!propertyRawSchema;
      if (!isSupported) {
        throw new Error(`Style property ${stylePropName} is not supported.`);
      }
      if (propertyRawSchema.kind === "plain") {
        if (typeof propertyMapValue[stylePropName] !== "object") {
          const propUtil = getPropSchemaFromCache(propertyRawSchema.key);
          if (propUtil) {
            const plainValue = propUtil.create(propertyMapValue[stylePropName]);
            propertyMapValue[stylePropName] = plainValue;
          }
        }
      }
    });
    delete transformedStyleValues.custom_css;
    const localStyle = Object.values(elementStyles).find((style) => style.label === "local");
    if (!localStyle) {
      createElementStyle({
        elementId,
        ...typeof customCss !== "undefined" ? { custom_css: customCss } : {},
        classesProp: "classes",
        label: "local",
        meta: {
          breakpoint: "desktop",
          state: null
        },
        props: {
          ...transformedStyleValues
        }
      });
    } else {
      updateElementStyle({
        elementId,
        styleId: localStyle.id,
        meta: {
          breakpoint: "desktop",
          state: null
        },
        ...typeof customCss !== "undefined" ? { custom_css: customCss } : {},
        props: {
          ...transformedStyleValues
        }
      });
    }
    return;
  }
  const elementPropSchema = getWidgetsCache3()?.[elementType]?.atomic_props_schema;
  if (!elementPropSchema) {
    throw new Error(`No prop schema found for element type: ${elementType}`);
  }
  if (!elementPropSchema[propertyName]) {
    const propertyNames = Object.keys(elementPropSchema);
    throw new Error(
      `Property "${propertyName}" does not exist on element type "${elementType}". Available properties are: ${propertyNames.join(
        ", "
      )}`
    );
  }
  const propKey = elementPropSchema[propertyName].key;
  const value = resolvePropValue(propertyValue, propKey);
  updateElementSettings({
    id: elementId,
    props: {
      [propertyName]: value
    },
    withHistory: false
  });
};

// src/mcp/utils/validate-input.ts
import { getWidgetsCache as getWidgetsCache4 } from "@elementor/editor-elements";
import { Schema as Schema3 } from "@elementor/editor-props";
import { getStylesSchema as getStylesSchema4 } from "@elementor/editor-styles";
var _widgetsSchema = null;
var validateInput = {
  get widgetsSchema() {
    if (!_widgetsSchema) {
      const schema2 = {};
      const cache = getWidgetsCache4();
      if (!cache) {
        return {};
      }
      Object.entries(cache).forEach(([widgetType, widgetData]) => {
        if (widgetData.atomic_props_schema) {
          schema2[widgetType] = structuredClone(widgetData.atomic_props_schema);
        }
      });
      _widgetsSchema = schema2;
    }
    return _widgetsSchema;
  },
  validateProps(schema2, values, ignore = []) {
    if (!schema2) {
      throw new Error("No schema provided for validation.");
    }
    const errors = [];
    let hasInvalidKey = false;
    Object.entries(values).forEach(([propName, propValue]) => {
      if (ignore.includes(propName)) {
        return;
      }
      const propSchema = schema2[propName];
      if (!propSchema) {
        errors.push(`Property "${propName}" is not defined in the schema.`);
        hasInvalidKey = true;
      } else if (!Schema3.isPropKeyConfigurable(propName)) {
        errors.push(`Property "${propName}" is not configurable.`);
      } else {
        const { valid } = Schema3.validatePropValue(propSchema, propValue);
        if (!valid) {
          errors.push(
            `Invalid property "${propName}". Validate input with resource [${STYLE_SCHEMA_URI.replace(
              "{category}",
              propName
            )}]`
          );
        }
      }
    });
    if (hasInvalidKey) {
      errors.push("Available properties: " + Object.keys(schema2).join(", "));
    }
    return {
      errors,
      valid: errors.length === 0
    };
  },
  validateStyles(values) {
    const styleSchema = getStylesSchema4();
    const customCssValue = values.custom_css;
    const result = this.validateProps(styleSchema, values, ["custom_css", "$intention"]);
    const appendInvalidCustomCssErr = () => {
      result.valid = false;
      result.errors = result.errors || [];
      result.errors.push('Invalid property "custom_css". Expected a string value.');
    };
    if (customCssValue && typeof customCssValue === "object") {
      if (typeof customCssValue.value !== "string") {
        appendInvalidCustomCssErr();
      }
    } else if (typeof customCssValue !== "string" && typeof customCssValue !== "undefined" && customCssValue !== null) {
      appendInvalidCustomCssErr();
    }
    return result;
  },
  validatePropSchema(widgetType, values, ignore = []) {
    const schema2 = this.widgetsSchema[widgetType];
    if (!schema2) {
      return { valid: false, errors: [`No schema found for widget type "${widgetType}".`] };
    }
    return this.validateProps(schema2, values, ignore);
  }
};

// src/composition-builder/composition-builder.ts
var CompositionBuilder = class _CompositionBuilder {
  elementConfig = {};
  elementStylesConfig = {};
  rootContainers = [];
  containerElements = [];
  api = {
    createElement: createElement7,
    getWidgetsCache: getWidgetsCache5,
    generateElementId,
    getContainer: getContainer2,
    doUpdateElementProperty
  };
  xml;
  static fromXMLString(xmlString, api = {}) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    const errorNode = xmlDoc.querySelector("parsererror");
    if (errorNode) {
      throw new Error("Failed to parse XML string: " + errorNode.textContent);
    }
    return new _CompositionBuilder({
      xml: xmlDoc,
      api
    });
  }
  constructor(opts) {
    const { api = {}, elementConfig = {}, stylesConfig = {}, xml } = opts;
    this.xml = xml;
    Object.assign(this.api, api);
    this.setElementConfig(elementConfig);
    this.setStylesConfig(stylesConfig);
  }
  setElementConfig(config) {
    this.elementConfig = config;
  }
  setStylesConfig(config) {
    this.elementStylesConfig = config;
  }
  getXML() {
    return this.xml;
  }
  iterateBuild(node, containerElement, childIndex) {
    const elementTag = node.tagName;
    const isContainer = this.containerElements.includes(elementTag);
    const parentElType = containerElement.model.get("elType");
    let targetContainer = parentElType === "e-tabs" ? containerElement.children?.[1].children?.[childIndex] || containerElement.children?.[1] : containerElement;
    if (!targetContainer) {
      targetContainer = containerElement;
    }
    const newElement = isContainer ? this.api.createElement({
      container: targetContainer,
      model: {
        elType: elementTag,
        id: generateElementId()
      },
      options: { useHistory: false }
    }) : this.api.createElement({
      container: targetContainer,
      model: {
        elType: "widget",
        widgetType: elementTag,
        id: generateElementId()
      },
      options: { useHistory: false }
    });
    if (containerElement.id === "document") {
      this.rootContainers.push(newElement);
    }
    node.setAttribute("id", newElement.id);
    let currentChild = 0;
    for (const childNode of Array.from(node.children)) {
      this.iterateBuild(childNode, newElement, currentChild);
      currentChild++;
    }
  }
  findSchemaForNode(node) {
    const widgetsCache = this.api.getWidgetsCache() || {};
    const widgetType = node.tagName;
    const widgetData = widgetsCache[widgetType]?.atomic_props_schema;
    return widgetData || null;
  }
  matchNodeByConfigId(configId) {
    const node = this.xml.querySelector(`[configuration-id="${configId}"]`);
    if (!node) {
      throw new Error(`Configuration id "${configId}" does not have target node.`);
    }
    const id = node.getAttribute("id");
    if (!id) {
      throw new Error(`Node with configuration id "${configId}" does not have element id.`);
    }
    const element = this.api.getContainer(id);
    if (!element) {
      throw new Error(`Element with id "${id}" not found but should exist.`);
    }
    return {
      element,
      node
    };
  }
  applyStyles() {
    const errors = [];
    const invalidStyles = {};
    const validStylesPropValues = {};
    for (const [styleId, styleConfig] of Object.entries(this.elementStylesConfig)) {
      const { element, node } = this.matchNodeByConfigId(styleId);
      for (const [styleName, stylePropValue] of Object.entries(styleConfig)) {
        const { valid, errors: validationErrors } = validateInput.validateStyles({
          [styleName]: stylePropValue
        });
        if (!valid) {
          if (styleConfig.$intention) {
            invalidStyles[element.id] = invalidStyles[element.id] || [];
            invalidStyles[element.id].push(styleName);
          }
          errors.push(...validationErrors || []);
        } else {
          validStylesPropValues[styleName] = stylePropValue;
        }
        this.api.doUpdateElementProperty({
          elementId: element.id,
          propertyName: "_styles",
          propertyValue: validStylesPropValues,
          elementType: node.tagName
        });
      }
    }
    return {
      errors,
      invalidStyles
    };
  }
  applyConfigs() {
    const errors = [];
    for (const [configId, config] of Object.entries(this.elementConfig)) {
      const { element, node } = this.matchNodeByConfigId(configId);
      const propSchema = this.findSchemaForNode(node);
      const result = validateInput.validateProps(propSchema, config);
      if (!result.valid && result.errors?.length) {
        errors.push(...result.errors);
      } else {
        for (const [propertyName, propertyValue] of Object.entries(config)) {
          try {
            this.api.doUpdateElementProperty({
              elementId: element.id,
              propertyName,
              propertyValue,
              elementType: node.tagName
            });
          } catch (error) {
            errors.push(error.message);
          }
        }
      }
    }
    return errors;
  }
  build(rootContainer) {
    const widgetsCache = this.api.getWidgetsCache() || {};
    const CONTAINER_ELEMENTS = Object.values(widgetsCache).filter((widget) => widget.meta?.is_container).map((widget) => widget.elType).filter((x) => typeof x === "string");
    this.containerElements = CONTAINER_ELEMENTS;
    new Set(this.xml.querySelectorAll("*")).forEach((node) => {
      if (!widgetsCache[node.tagName]) {
        throw new Error(`Unknown widget type: ${node.tagName}`);
      }
    });
    const children = Array.from(this.xml.children);
    let currentChild = 0;
    for (const childNode of children) {
      this.iterateBuild(childNode, rootContainer, currentChild);
      currentChild++;
    }
    const { errors: styleErrors, invalidStyles } = this.applyStyles();
    const configErrors = this.applyConfigs();
    return {
      configErrors,
      styleErrors,
      invalidStyles,
      rootContainers: [...this.rootContainers]
    };
  }
};

// src/mcp/tools/build-composition/prompt.ts
import { toolPrompts } from "@elementor/editor-mcp";
var generatePrompt = () => {
  const buildCompositionsToolPrompt = toolPrompts("build-compositions");
  buildCompositionsToolPrompt.description(`
# REQUIRED RESOURCES (Read before use)
1. [${WIDGET_SCHEMA_URI}] - Widget types, configuration schemas, and PropType definitions
2. [${STYLE_SCHEMA_URI}] - Common styles schema shared by all widgets
3. [elementor://global-classes] - Existing global classes (check FIRST to reuse)

# THREE-PHASE WORKFLOW (MANDATORY)

## Phase 1: Create Global Classes
1. Analyze requirements \u2192 identify reusable patterns (typography, colors, spacing)
2. Check [elementor://global-classes] for existing classes
3. Use "create-global-class" tool for NEW reusable styles BEFORE building

## Phase 2: Build Composition (THIS TOOL)
4. Build valid XML with minimal inline styles (layout/positioning only)
5. Avoid duplicating styles that should be global classes

## Phase 3: Apply Classes
6. Use "apply-global-class" tool to apply global classes to elements

# CORE INSTRUCTIONS

**Structure:**
- Build valid XML using allowed widget tags (e.g., \`<e-button configuration-id="btn1"></e-button>\`)
- Containers only: "e-flexbox", "e-div-block", "e-tabs"
- Every element MUST have unique "configuration-id" attribute
- No attributes, classes, IDs, or text nodes in XML

**Configuration:**
- Map each configuration-id to elementConfig (widget props) and stylesConfig (styles)
- Follow exact PropType schemas from resources above
- All PropValues need \`$$type\` property matching schema
- Keep stylesConfig MINIMAL - layout only, NOT reusable styles

**Validation:**
- Parse XML before submission
- Match all PropValues to schema (\`$$type\` required)
- NO LINKS in any configuration
- Retry on errors up to 10x, reading error messages carefully

# DESIGN QUALITY: AVOID AI SLOP

**Problem:** LLMs default to generic patterns (purple gradients, #333 grays, 24px headings, uniform spacing)
**Solution:** Make intentional, distinctive choices. When unsure, choose bold over safe.

## Typography Rules
\u274C AVOID: Inter/Roboto/Arial, small ratios (1.5x), medium weights (500-700)
\u2705 USE: 3x+ size ratios, extreme weight contrasts (100/200 vs 800/900), tight headlines (1.1 line-height)

## Color Rules
\u274C AVOID: Purple gradients, pure grays (#333/#666/#999), even distribution
\u2705 USE: ONE dominant color (60-70%), 1-2 accent colors (10-15%), tinted neutrals (warm/cool grays)

## Spacing Rules
\u274C AVOID: Uniform spacing (all 16px/24px), cramped layouts, centered everything
\u2705 USE: Generous spacing (80-120px sections), dramatic variation (12px/48px/96px), asymmetric layouts

## Background Rules
\u274C AVOID: Solid white/gray, single colors
\u2705 USE: Layered gradients (2-3 layers), subtle patterns, alternating light/dark sections

## Visual Hierarchy
1. **Primary** (1 element): Largest, highest contrast, most space
2. **Secondary** (2-3 elements): 40-60% of primary size
3. **Tertiary** (rest): Minimal weight, muted

**Contrast techniques:** 3x size differences, 300+ weight differences, color hierarchy (brand \u2192 neutral \u2192 muted)

# DESIGN CONSTRAINTS (NEVER VIOLATE)

**Typography:**
- NEVER use Inter, Roboto, Arial, Helvetica as primary display fonts
- NEVER use font-size ratios < 2.5x between headlines and body
- NEVER use font-weight 500-700 for headlines (go lighter or heavier)

**Color:**
- PREFER not to use pure grays - use tinted neutrals (#2d2622, #faf8f6, not #333/#f5f5f5)
- NEVER distribute colors evenly - commit to ONE dominant
- NEVER use more than 3 core colors - except for info/alert/badges

**Spacing:**
- NEVER use uniform spacing
- NEVER use < 4rem (64px) padding for major sections
- NEVER center everything
- PRIORITIZE rem based values over pixel based

**Background:**
- NEVER use solid #ffffff or #f5f5f5 without texture/gradients
- ALWAYS layer 2+ gradient/color elements

# WIDGET NOTES
- Check \`llm_guidance\` property in widget schemas for context
- Avoid SVG widgets (require content upload tools) - when must, prior to execution ensure assets uploaded
- Apply style schema to containers for layout control

# PARAMETERS (ALL MANDATORY)
- **xmlStructure**: Valid XML with configuration-id attributes
- **elementConfig**: Record of configuration-id \u2192 widget PropValues
- **stylesConfig**: Record of configuration-id \u2192 style PropValues (layout only)
  `);
  buildCompositionsToolPrompt.example(`
A Heading and a button inside a flexbox
{
  xmlStructure: "<e-flexbox configuration-id="flex1"><e-heading configuration-id="heading1"></e-heading><e-button configuration-id="button1"></e-button></e-flexbox>"
  elementConfig: {
    "flex1": {
      "tag": {
        "$$type": "string",
        "value": "section"
      },
  },
  stylesConfig: {
    "heading1": {
      "font-size": {
        "$$type": "size",
        "value": {
          "size": { "$$type": "number", "value": 24 },
          "unit": { "$$type": "string", "value": "px" }
        }
      },
      "color": {
        "$$type": "color",
        "value": { "$$type": "string", "value": "#333" }
      }
    }
  },
}
`);
  buildCompositionsToolPrompt.parameter(
    "xmlStructure",
    `**MANDATORY** A valid XML structure representing the composition to be built, using custom elementor tags, styling and configuration PropValues.`
  );
  buildCompositionsToolPrompt.parameter(
    "elementConfig",
    `**MANDATORY** A record mapping configuration IDs to their corresponding configuration objects, defining the PropValues for each element created.`
  );
  buildCompositionsToolPrompt.parameter(
    "stylesConfig",
    `**MANDATORY** A record mapping style PropTypes to their corresponding style configuration objects, defining the PropValues for styles to be applied to elements.`
  );
  buildCompositionsToolPrompt.instruction(
    `You will be provided the XML structure with element IDs. These IDs represent the actual elementor widgets created on the page/post.
You should use these IDs as reference for further configuration, styling or changing elements later on.`
  );
  buildCompositionsToolPrompt.instruction(
    `**CRITICAL WORKFLOW REMINDER**:
1. FIRST: Create reusable global classes for typography, colors, spacing patterns using "create-global-class" tool
2. SECOND: Use THIS tool with minimal inline styles (only layout & unique properties)
3. THIRD: Apply global classes to elements using "apply-global-class" tool

This ensures maximum reusability and consistency across your design system. ALWAYS check [elementor://global-classes] for existing classes before creating new ones.`
  );
  return buildCompositionsToolPrompt.prompt();
};

// src/mcp/tools/build-composition/schema.ts
import { z } from "@elementor/schema";
var inputSchema = {
  xmlStructure: z.string().describe("The XML structure representing the composition to be built"),
  elementConfig: z.record(
    z.string().describe("The configuration id"),
    z.record(
      z.string().describe("property name"),
      z.any().describe(`The PropValue for the property, refer to ${WIDGET_SCHEMA_URI}`)
    )
  ).describe("A record mapping element IDs to their configuration objects. REQUIRED"),
  stylesConfig: z.record(
    z.string().describe("The configuration id"),
    z.record(
      z.string().describe("StyleSchema property name"),
      z.any().describe(`The PropValue for the style property. MANDATORY, refer to [${STYLE_SCHEMA_URI}]`)
    )
  ).describe(
    `A record mapping element IDs to their styles configuration objects. Use the actual styles schema from [${STYLE_SCHEMA_URI}].`
  ).default({})
};
var outputSchema = {
  errors: z.string().describe("Error message if the composition building failed").optional(),
  xmlStructure: z.string().describe(
    "The built XML structure as a string. Must use this XML after completion of building the composition, it contains real IDs."
  ).optional(),
  llm_instructions: z.string().describe("Instructions what to do next, Important to follow these instructions!").optional()
};

// src/mcp/tools/build-composition/tool.ts
var initBuildCompositionsTool = (reg) => {
  const { addTool } = reg;
  addTool({
    name: "build-compositions",
    description: generatePrompt(),
    schema: inputSchema,
    requiredResources: [
      { description: "Widgets schema", uri: WIDGET_SCHEMA_URI },
      { description: "Styles schema", uri: STYLE_SCHEMA_URI },
      { description: "Global Classes", uri: "elementor://global-classes" },
      { description: "Global Variables", uri: "elementor://global-variables" },
      { description: "Styles best practices", uri: BEST_PRACTICES_URI }
    ],
    outputSchema,
    modelPreferences: {
      hints: [{ name: "claude-sonnet-4-5" }]
    },
    handler: async (params) => {
      const { xmlStructure, elementConfig, stylesConfig } = params;
      let generatedXML = "";
      const errors = [];
      const rootContainers = [];
      const documentContainer = getContainer3("document");
      try {
        const compositionBuilder = CompositionBuilder.fromXMLString(xmlStructure, {
          createElement: createElement8,
          getWidgetsCache: getWidgetsCache6
        });
        compositionBuilder.setElementConfig(elementConfig);
        compositionBuilder.setStylesConfig(stylesConfig);
        const {
          configErrors,
          invalidStyles,
          rootContainers: generatedRootContainers
        } = compositionBuilder.build(documentContainer);
        generatedXML = new XMLSerializer().serializeToString(compositionBuilder.getXML());
        if (configErrors.length) {
          errors.push(...configErrors.map((e) => new Error(e)));
          throw new Error("Configuration errors occurred during composition building.");
        }
        rootContainers.push(...generatedRootContainers);
        Object.entries(invalidStyles).forEach(([elementId, rawCssRules]) => {
          const customCss = {
            value: rawCssRules.join(";\n")
          };
          doUpdateElementProperty({
            elementId,
            propertyName: "_styles",
            propertyValue: {
              _styles: {
                custom_css: customCss
              }
            },
            elementType: "widget"
          });
        });
      } catch (error) {
        errors.push(error);
      }
      if (errors.length) {
        rootContainers.forEach((rootContainer) => {
          deleteElement({
            container: rootContainer,
            options: { useHistory: false }
          });
        });
        const errorMessages = errors.map((e) => {
          if (typeof e === "string") {
            return e;
          }
          if (e instanceof Error) {
            return e.message || String(e);
          }
          if (typeof e === "object" && e !== null) {
            return JSON.stringify(e);
          }
          return String(e);
        }).filter(
          (msg) => msg && msg.trim() !== "" && msg !== "{}" && msg !== "null" && msg !== "undefined"
        );
        if (errorMessages.length === 0) {
          throw new Error(
            "Failed to build composition: Unknown error occurred. No error details available."
          );
        }
        const errorText = `Failed to build composition with the following errors:

${errorMessages.join(
          "\n\n"
        )}

"Missing $$type" errors indicate that the configuration objects are invalid. Try again and apply **ALL** object entries with correct $$type.
Now that you have these errors, fix them and try again. Errors regarding configuration objects, please check against the PropType schemas`;
        throw new Error(errorText);
      }
      return {
        xmlStructure: generatedXML,
        errors: errors?.length ? errors.map((e) => typeof e === "string" ? e : e.message).join("\n\n") : void 0,
        llm_instructions: `The composition was built successfully with element IDs embedded in the XML.

**CRITICAL NEXT STEPS** (Follow in order):
1. **Apply Global Classes**: Use "apply-global-class" tool to apply the global classes you created BEFORE building this composition
   - Check the created element IDs in the returned XML
   - Apply semantic classes (heading-primary, button-cta, etc.) to appropriate elements

2. **Fine-tune if needed**: Use "configure-element" tool only for element-specific adjustments that don't warrant global classes

Remember: Global classes ensure design consistency and reusability. Don't skip applying them!
`
      };
    }
  });
};

// src/mcp/tools/configure-element/prompt.ts
var configureElementToolPrompt = `Configure an existing element on the page.

# **CRITICAL - REQUIRED INFORMATION (Must read before using this tool)**
1. [${WIDGET_SCHEMA_URI}]
   Required to understand which widgets are available, and what are their configuration schemas.
   Every widgetType (i.e. e-heading, e-button) that is supported has it's own property schema, that you must follow in order to apply parameter values correctly.
2. [${STYLE_SCHEMA_URI}]
   Required to understand the styles schema for the widgets. All widgets share the same styles schema, grouped by categories.
   Use this resource to understand which style properties are available for each element, and how to structure the "stylePropertiesToChange" parameter.
3. If not sure about the PropValues schema, you can use the "get-element-configuration-values" tool to retreive the current PropValues configuration of the element.

Before using this tool, check the definitions of the elements PropTypes at the resource "widget-schema-by-type" at editor-canvas__elementor://widgets/schema/{widgetType}
All widgets share a common _style property for styling, which uses the common styles schema.
Retreive and check the common styles schema at the resource list "styles-schema" at editor-canvas__elementor://styles/schema/{category}

# Parameters
- propertiesToChange: An object containing the properties to change, with their new values. MANDATORY. When updating a style only, provide an empty object.
- stylePropertiesToChange: An object containing the style properties to change, with their new values. OPTIONAL
- elementId: The ID of the element to configure. MANDATORY
- elementType: The type of the element to configure (i.e. e-heading, e-button). MANDATORY

# When to use this tool
When a user requires to change anything in an element, such as updating text, colors, sizes, or other configurable properties.
This tool handles elements of type "widget".
This tool handles styling elements, using the "stylePropertiesToChange" parameter.

To CLEAR a property (i.e., set it to default or none), provide null as a value.

The element's schema must be known before using this tool.
The style schema must be known before using this tool.

Attached resource link describing how PropType schema should be parsed as PropValue for this tool.

Read carefully the PropType Schema of the element and it's styles, then apply correct PropValue according to the schema.

PropValue structure:
{
    "$$type": string, // MANDATORY as defined in the PropType schema under the "key" property
    value: unknown // The value according to the PropType schema for kinds of "array", use array with PropValues items inside. For "object", read the shape property of the PropType schema. For "plain", use strings.
}

<IMPORTANT>
ALWAYS MAKE SURE you have the PropType schemas for the element you are configuring, and the common-styles schema for styling. If you are not sure, retreive the schema from the resources mentioned above.
</IMPORTANT>

You can use multiple property changes at once by providing multiple entries in the propertiesToChange object, including _style alongside non-style props.
Some properties are nested, use the root property name, then objects with nested values inside, as the complete schema suggests.

Make sure you have the "widget-schema-by-type" resource available to retreive the PropType schema for the element type you are configuring.
Make sure you have to "styles-schema" resources available to retreive the common styles schema.

# How to configure elements
We use a dedicated PropType Schema for configuring elements, including styles. When you configure an element, you must use the EXACT PropType Value as defined in the schema.
For styleProperties, use the style schema provided, as it also uses the PropType format.
For all non-primitive types, provide the key property as defined in the schema as $$type in the generated objecct, as it is MANDATORY for parsing.

Use the EXACT "PROP-TYPE" Schema given, and ALWAYS include the "key" property from the original configuration for every property you are changing.

# Example
\`\`\`json
{
  propertiesToChange: {
    // List of properties TO CHANGE, following the PropType schema for the element as defined in the resource [${WIDGET_SCHEMA_URI}]
    title: {
      $$type: 'string',
      value: 'New Title Text'
    },
    border: {
      $$type: 'boolean',
      value: false
    },
  },
  stylePropertiesToChange: {
    'line-height': {
      $$type: 'size', // MANDATORY do not forget to include the correct $$type for every property
      value: {
        size: {
          $$type: 'number',
          value: 20
        },
        unit: {
          $$type: 'string',
          value: 'px'
        }
      }
    }
  },
  elementId: 'element-id',
  elementType: 'element-type'
};
\`\`\`

<IMPORTANT>
The $$type property is MANDATORY for every value, it is required to parse the value and apply application-level effects.
</IMPORTANT>
`;

// src/mcp/tools/configure-element/schema.ts
import { z as z2 } from "@elementor/schema";
var inputSchema2 = {
  propertiesToChange: z2.record(
    z2.string().describe("The property name."),
    z2.any().describe(`PropValue, refer to [${WIDGET_SCHEMA_URI}] by correct type, as appears in elementType`),
    z2.any()
  ).describe("An object record containing property names and their new values to be set on the element"),
  stylePropertiesToChange: z2.record(
    z2.string().describe("The style property name"),
    z2.any().describe(`The style PropValue, refer to [${STYLE_SCHEMA_URI}] how to generate values`),
    z2.any()
  ).describe("An object record containing style property names and their new values to be set on the element").default({}),
  elementType: z2.string().describe("The type of the element to retreive the schema"),
  elementId: z2.string().describe("The unique id of the element to configure")
};
var outputSchema2 = {
  success: z2.boolean().describe(
    "Whether the configuration change was successful, only if propertyName and propertyValue are provided"
  )
};

// src/mcp/tools/configure-element/tool.ts
var initConfigureElementTool = (reg) => {
  const { addTool } = reg;
  addTool({
    name: "configure-element",
    description: configureElementToolPrompt,
    schema: inputSchema2,
    outputSchema: outputSchema2,
    requiredResources: [
      { description: "Widgets schema", uri: WIDGET_SCHEMA_URI },
      { description: "Styles schema", uri: STYLE_SCHEMA_URI }
    ],
    modelPreferences: {
      hints: [{ name: "claude-sonnet-4-5" }],
      intelligencePriority: 0.8,
      speedPriority: 0.7
    },
    handler: ({ elementId, propertiesToChange, elementType, stylePropertiesToChange }) => {
      const toUpdate = Object.entries(propertiesToChange);
      const { valid, errors } = validateInput.validatePropSchema(elementType, propertiesToChange);
      const { valid: stylesValid, errors: stylesErrors } = validateInput.validateStyles(
        stylePropertiesToChange || {}
      );
      if (!valid) {
        const errorMessage = `Failed to configure element "${elementId}" due to invalid properties: ${errors?.join(
          "\n- "
        )}`;
        throw new Error(errorMessage);
      }
      if (!stylesValid) {
        const errorMessage = `Failed to configure element "${elementId}" due to invalid style properties: ${stylesErrors?.join(
          "\n- "
        )}`;
        throw new Error(errorMessage);
      }
      for (const [propertyName, propertyValue] of toUpdate) {
        try {
          doUpdateElementProperty({
            elementId,
            elementType,
            propertyName,
            propertyValue
          });
        } catch (error) {
          const errorMessage = createUpdateErrorMessage({
            propertyName,
            elementId,
            elementType,
            error,
            propertyType: "prop"
          });
          throw new Error(errorMessage);
        }
      }
      for (const [stylePropertyName, stylePropertyValue] of Object.entries(stylePropertiesToChange || {})) {
        try {
          doUpdateElementProperty({
            elementId,
            elementType,
            propertyName: "_styles",
            propertyValue: {
              [stylePropertyName]: stylePropertyValue
            }
          });
        } catch (error) {
          const errorMessage = createUpdateErrorMessage({
            propertyName: `(style) ${stylePropertyName}`,
            elementId,
            elementType,
            propertyType: "style",
            error
          });
          throw new Error(errorMessage);
        }
      }
      return {
        success: true
      };
    }
  });
};
function createUpdateErrorMessage(opts) {
  const { propertyName, elementId, elementType, error, propertyType } = opts;
  return `Failed to update property "${propertyName}" on element "${elementId}": ${error.message}.
${propertyType === "prop" ? `
Check the element's PropType schema at the resource [${WIDGET_SCHEMA_URI.replace(
    "{widgetType}",
    elementType
  )}] for type "${elementType}" to ensure the property exists and the value matches the expected PropType.
Now that you have this information, ensure you have the schema and try again.` : `
Check the styles schema at the resource [${STYLE_SCHEMA_URI.replace(
    "{category}",
    propertyName
  )}] at editor-canvas__elementor://styles/schema/{category} to ensure the style property exists and the value matches the expected PropType.
`};
}`;
}

// src/mcp/tools/get-element-config/tool.ts
import { getContainer as getContainer4, getElementStyles as getElementStyles2, getWidgetsCache as getWidgetsCache7 } from "@elementor/editor-elements";
import { Schema as Schema4 } from "@elementor/editor-props";
import { z as z3 } from "@elementor/schema";
var schema = {
  elementId: z3.string()
};
var outputSchema3 = {
  properties: z3.record(z3.string(), z3.any()).describe("A record mapping PropTypes to their corresponding PropValues"),
  style: z3.record(z3.string(), z3.any()).describe("A record mapping StyleSchema properties to their corresponding PropValues"),
  childElements: z3.array(
    z3.object({
      id: z3.string(),
      elementType: z3.string(),
      childElements: z3.array(z3.any()).describe("An array of child element IDs, when applicable, same structure recursively")
    })
  ).describe("An array of child element IDs, when applicable, with recursive structure")
};
var structuredElements = (element) => {
  const children = element.children || [];
  return children.map((child) => {
    return {
      id: child.id,
      elementType: child.model.get("elType") || child.model.get("widgetType") || "unknown",
      childElements: structuredElements(child)
    };
  });
};
var initGetElementConfigTool = (reg) => {
  const { addTool } = reg;
  addTool({
    name: "get-element-configuration-values",
    description: "Retrieve the element's configuration PropValues for a specific element by unique ID.",
    schema,
    outputSchema: outputSchema3,
    modelPreferences: {
      intelligencePriority: 0.6,
      speedPriority: 0.9
    },
    handler: async ({ elementId }) => {
      const element = getContainer4(elementId);
      if (!element) {
        throw new Error(`Element with ID ${elementId} not found.`);
      }
      const elementRawSettings = element.settings;
      const propSchema = getWidgetsCache7()?.[element.model.get("widgetType") || element.model.get("elType") || ""]?.atomic_props_schema;
      if (!elementRawSettings || !propSchema) {
        throw new Error(`No settings or prop schema found for element ID: ${elementId}`);
      }
      const propValues = {};
      const stylePropValues = {};
      Schema4.configurableKeys(propSchema).forEach((key) => {
        propValues[key] = structuredClone(elementRawSettings.get(key));
      });
      const elementStyles = getElementStyles2(elementId) || {};
      const localStyle = Object.values(elementStyles).find((style) => style.label === "local");
      if (localStyle) {
        const defaultVariant = localStyle.variants.find(
          (variant) => variant.meta.breakpoint === "desktop" && !variant.meta.state
        );
        if (defaultVariant) {
          const styleProps = defaultVariant.props || {};
          Object.keys(styleProps).forEach((stylePropName) => {
            if (typeof styleProps[stylePropName] !== "undefined") {
              stylePropValues[stylePropName] = structuredClone(styleProps[stylePropName]);
            }
          });
          if (defaultVariant.custom_css) {
            stylePropValues.custom_css = atob(defaultVariant.custom_css.raw);
          }
        }
      }
      return {
        properties: {
          ...propValues
        },
        style: {
          ...stylePropValues
        },
        childElements: structuredElements(element)
      };
    }
  });
};

// src/mcp/canvas-mcp.ts
var initCanvasMcp = (reg) => {
  const { setMCPDescription } = reg;
  setMCPDescription(
    'Everything related to creative design, layout, styling and building the pages, specifically element of type "widget"'
  );
  initWidgetsSchemaResource(reg);
  initDocumentStructureResource(reg);
  initBuildCompositionsTool(reg);
  initGetElementConfigTool(reg);
  initConfigureElementTool(reg);
  initBreakpointsResource(reg);
};

// src/mcp/mcp-description.ts
var ELEMENT_SCHEMA_URI = WIDGET_SCHEMA_URI.replace("{widgetType}", "element-schema");
var mcpDescription = `Elementor Canvas MCP
This MCP enables creation, configuration, and styling of elements on the Elementor canvas using the build_composition tool.

# Core Concepts

## PropValues Structure
All data in Elementor uses PropValues - a typed wrapper for values:
\`\`\`json
{
  "$$type": "the-prop-type-schema-kind",
  "value": "the-actual-value-as-defined-for-the-propType"
}
\`\`\`
The \`$$type\` defines how Elementor interprets the value. Providing the correct \`$$type\` is critical - incorrect types will be rejected.

## Design System Resources
- **Global Variables**: Reusable colors, sizes, and fonts (\`elementor://global-variables\`)
- **Global Classes**: Reusable style sets that can be applied to elements (\`elementor://global-classes\`)
- **Widget Schemas**: Configuration options for each widget type (\`${WIDGET_SCHEMA_URI}\`)
- **Style Schema**: Common styles shared across all widgets and containers (\`${STYLE_SCHEMA_URI}\`)

# Building Compositions with build_composition

The \`build_composition\` tool is the primary way to create elements. It accepts structure (XML), configuration, and styling in a single operation.

## Complete Workflow

### 1. Parse User Requirements
Understand what needs to be built: structure, content, and styling.

### 2. Check Global Resources FIRST
Always check existing resources before building:
- List \`elementor://global-variables\` for available variables (colors, sizes, fonts)
- List \`elementor://global-classes\` for available style sets
- **Always prefer using existing global resources over creating inline styles**

### 3. Retrieve Widget Schemas
For each widget you'll use:
- List \`${WIDGET_SCHEMA_URI}\` to see available widgets
- Retrieve configuration schema from \`${ELEMENT_SCHEMA_URI}\` for each widget
- Check the \`llm_guidance\` property to understand if a widget is a container (can have children)

### 4. Build XML Structure
Create valid XML with configuration-ids:
- Each element must have a unique \`configuration-id\` attribute
- No text nodes, classes, or IDs in XML - structure only
- Example:
\`\`\`xml
<e-container configuration-id="container-1">
  <e-heading configuration-id="heading-1" />
  <e-text configuration-id="text-1" />
</e-container>
\`\`\`

### 5. Create elementConfig
Map each configuration-id to its widget properties using PropValues:
- Use correct \`$$type\` matching the widget's schema
- Use global variables in PropValues where applicable
- Example:
\`\`\`json
{
  "heading-1": {
    "text": { "$$type": "string", "value": "Welcome" },
    "tag": { "$$type": "string", "value": "h1" }
  }
}
\`\`\`

### 6. Create stylesConfig
Map each configuration-id to style PropValues from \`${STYLE_SCHEMA_URI}\`:
- Use global variables for colors, sizes, and fonts
- Example using global variable:
\`\`\`json
{
  "heading-1": {
    "color": { "$$type": "global-color-variable", "value": "primary-color-id" },
    "font-size": { "$$type": "size", "value": "2rem" }
  }
}
\`\`\`

### 7. Execute build_composition
Call the tool with your XML structure, elementConfig, and stylesConfig. The response will contain the created element IDs.
At the response you will also find llm_instructions for you to do afterwards, read and follow them!

## Key Points

- **PropValue Types**: Arrays that accept union types are typed as mixed arrays
- **Visual Sizing**: Widget sizes MUST be defined in stylesConfig. Widget properties like image "size" control resolution, not visual appearance
- **Global Variables**: Reference by ID in PropValues (e.g., \`{ "$$type": "global-color-variable", "value": "variable-id" }\`)
- **Naming Conventions**: Use meaningful, purpose-based names (e.g., "primary-button", "heading-large"), not value-based names (e.g., "blue-style", "20px-padding")

## Example: e-image PropValue Structure
\`\`\`json
{
  "$$type": "image",
  "value": {
    "src": {
      "$$type": "image-src",
      "value": {
        "url": { "$$type": "url", "value": "https://example.com/image.jpg" }
      }
    },
    "size": { "$$type": "string", "value": "full" }
  }
}
\`\`\`
Note: The "size" property controls image resolution/loading, not visual size. Set visual dimensions in stylesConfig.
`;

// src/prevent-link-in-link-commands.ts
import {
  getAnchoredAncestorId,
  getAnchoredDescendantId,
  isElementAnchored
} from "@elementor/editor-elements";
import { notify as notify3 } from "@elementor/editor-notifications";
import { blockCommand as blockCommand3 } from "@elementor/editor-v1-adapters";
import { __ as __4 } from "@wordpress/i18n";
function initLinkInLinkPrevention() {
  blockCommand3({
    command: "document/elements/paste",
    condition: blockLinkInLinkPaste
  });
  blockCommand3({
    command: "document/elements/move",
    condition: blockLinkInLinkMove
  });
}
var learnMoreActionProps = {
  href: "https://go.elementor.com/element-link-inside-link-infotip",
  target: "_blank",
  color: "inherit",
  variant: "text",
  sx: {
    marginInlineStart: "20px"
  },
  children: "Learn more"
};
function blockLinkInLinkPaste(args) {
  const { containers = [args.container], storageType } = args;
  const targetElements = containers;
  if (storageType !== "localstorage") {
    return false;
  }
  const data = window?.elementorCommon?.storage?.get();
  if (!data?.clipboard?.elements) {
    return false;
  }
  const sourceElements = data.clipboard.elements;
  const notification = {
    type: "default",
    message: __4(
      "To paste a link to this element, first remove the link from it's parent container.",
      "elementor"
    ),
    id: "paste-in-link-blocked",
    additionalActionProps: [learnMoreActionProps]
  };
  const blocked = shouldBlock(sourceElements, targetElements);
  if (blocked) {
    notify3(notification);
  }
  return blocked;
}
function blockLinkInLinkMove(args) {
  const { containers = [args.container], target } = args;
  const sourceElements = containers;
  const targetElement = target;
  const notification = {
    type: "default",
    message: __4("To drag a link to this element, first remove the link from it's parent container.", "elementor"),
    id: "move-in-link-blocked",
    additionalActionProps: [learnMoreActionProps]
  };
  const isBlocked = shouldBlock(sourceElements, [targetElement]);
  if (isBlocked) {
    notify3(notification);
  }
  return isBlocked;
}
function shouldBlock(sourceElements, targetElements) {
  if (!sourceElements?.length || !targetElements?.length) {
    return false;
  }
  const isSourceContainsAnAnchor = sourceElements.some((src) => {
    return src?.id ? isElementAnchored(src.id) || !!getAnchoredDescendantId(src.id) : false;
  });
  if (!isSourceContainsAnAnchor) {
    return false;
  }
  const isTargetContainsAnAnchor = targetElements.some((target) => {
    return target?.id ? isElementAnchored(target.id) || !!getAnchoredAncestorId(target.id) : false;
  });
  return isTargetContainsAnAnchor;
}

// src/style-commands/paste-style.ts
import { getContainer as getContainer5, getElementSetting, updateElementSettings as updateElementSettings2 } from "@elementor/editor-elements";
import { classesPropTypeUtil } from "@elementor/editor-props";
import {
  __privateListenTo as listenTo2,
  blockCommand as blockCommand4,
  commandStartEvent
} from "@elementor/editor-v1-adapters";

// src/style-commands/undoable-actions/paste-element-style.ts
import {
  createElementStyle as createElementStyle2,
  deleteElementStyle,
  getElementStyles as getElementStyles3,
  updateElementStyle as updateElementStyle2
} from "@elementor/editor-elements";
import { ELEMENTS_STYLES_RESERVED_LABEL } from "@elementor/editor-styles-repository";
import { undoable as undoable2 } from "@elementor/editor-v1-adapters";
import { __ as __6 } from "@wordpress/i18n";

// src/style-commands/utils.ts
import { getElementLabel as getElementLabel2, getWidgetsCache as getWidgetsCache8 } from "@elementor/editor-elements";
import { CLASSES_PROP_KEY } from "@elementor/editor-props";
import { __ as __5 } from "@wordpress/i18n";
function hasAtomicWidgets(args) {
  const { containers = [args.container] } = args;
  return containers.some(isAtomicWidget);
}
function isAtomicWidget(container) {
  if (!container) {
    return false;
  }
  return Boolean(getContainerSchema(container));
}
function getClassesProp(container) {
  const propsSchema = getContainerSchema(container);
  if (!propsSchema) {
    return null;
  }
  const [propKey] = Object.entries(propsSchema).find(
    ([, propType]) => propType.kind === "plain" && propType.key === CLASSES_PROP_KEY
  ) ?? [];
  return propKey ?? null;
}
function getContainerSchema(container) {
  const type = container?.model.get("widgetType") || container?.model.get("elType");
  const widgetsCache = getWidgetsCache8();
  const elementType = widgetsCache?.[type];
  return elementType?.atomic_props_schema ?? null;
}
function getClipboardElements(storageKey = "clipboard") {
  try {
    const storedData = JSON.parse(localStorage.getItem("elementor") ?? "{}");
    return storedData[storageKey]?.elements;
  } catch {
    return void 0;
  }
}
function getTitleForContainers(containers) {
  return containers.length > 1 ? __5("Elements", "elementor") : getElementLabel2(containers[0].id);
}

// src/style-commands/undoable-actions/paste-element-style.ts
var undoablePasteElementStyle = () => undoable2(
  {
    do: ({ containers, newStyle }) => {
      return containers.map((container) => {
        const elementId = container.id;
        const classesProp = getClassesProp(container);
        if (!classesProp) {
          return null;
        }
        const originalStyles = getElementStyles3(container.id);
        const [styleId, styleDef] = Object.entries(originalStyles ?? {})[0] ?? [];
        const originalStyle = Object.keys(styleDef ?? {}).length ? styleDef : null;
        const revertData = {
          styleId,
          originalStyle
        };
        if (styleId) {
          newStyle.variants.forEach(({ meta, props, custom_css: customCss }) => {
            updateElementStyle2({
              elementId,
              styleId,
              meta,
              props,
              custom_css: customCss
            });
          });
        } else {
          const [firstVariant] = newStyle.variants;
          const additionalVariants = newStyle.variants.slice(1);
          revertData.styleId = createElementStyle2({
            elementId,
            classesProp,
            label: ELEMENTS_STYLES_RESERVED_LABEL,
            ...firstVariant,
            additionalVariants
          });
        }
        return revertData;
      });
    },
    undo: ({ containers }, revertDataItems) => {
      containers.forEach((container, index) => {
        const revertData = revertDataItems[index];
        if (!revertData) {
          return;
        }
        if (!revertData.originalStyle) {
          deleteElementStyle(container.id, revertData.styleId);
          return;
        }
        const classesProp = getClassesProp(container);
        if (!classesProp) {
          return;
        }
        const [firstVariant] = revertData.originalStyle.variants;
        const additionalVariants = revertData.originalStyle.variants.slice(1);
        createElementStyle2({
          elementId: container.id,
          classesProp,
          label: ELEMENTS_STYLES_RESERVED_LABEL,
          styleId: revertData.styleId,
          ...firstVariant,
          additionalVariants
        });
      });
    }
  },
  {
    title: ({ containers }) => getTitleForContainers(containers),
    subtitle: __6("Style Pasted", "elementor")
  }
);

// src/style-commands/paste-style.ts
function initPasteStyleCommand() {
  const pasteElementStyleCommand = undoablePasteElementStyle();
  blockCommand4({
    command: "document/elements/paste-style",
    condition: hasAtomicWidgets
  });
  listenTo2(
    commandStartEvent("document/elements/paste-style"),
    (e) => pasteStyles(e.args, pasteElementStyleCommand)
  );
}
function pasteStyles(args, pasteLocalStyle) {
  const { containers = [args.container], storageKey } = args;
  const atomicContainers = containers.filter(isAtomicWidget);
  if (!atomicContainers.length) {
    return;
  }
  const clipboardElements = getClipboardElements(storageKey);
  const [clipboardElement] = clipboardElements ?? [];
  const clipboardContainer = getContainer5(clipboardElement.id);
  if (!clipboardElement || !clipboardContainer || !isAtomicWidget(clipboardContainer)) {
    return;
  }
  const elementStyles = clipboardElement.styles;
  const elementStyle = Object.values(elementStyles ?? {})[0];
  const classesSetting = getClassesWithoutLocalStyle(clipboardContainer, elementStyle);
  if (classesSetting.length) {
    pasteClasses(atomicContainers, classesSetting);
  }
  if (elementStyle) {
    pasteLocalStyle({ containers: atomicContainers, newStyle: elementStyle });
  }
}
function getClassesWithoutLocalStyle(clipboardContainer, style) {
  const classesProp = getClassesProp(clipboardContainer);
  if (!classesProp) {
    return [];
  }
  const classesSetting = getElementSetting(clipboardContainer.id, classesProp);
  return classesSetting?.value.filter((styleId) => styleId !== style?.id) ?? [];
}
function pasteClasses(containers, classes) {
  containers.forEach((container) => {
    const classesProp = getClassesProp(container);
    if (!classesProp) {
      return;
    }
    const classesSetting = getElementSetting(container.id, classesProp);
    const currentClasses = classesPropTypeUtil.extract(classesSetting) ?? [];
    const newClasses = classesPropTypeUtil.create(Array.from(/* @__PURE__ */ new Set([...classes, ...currentClasses])));
    updateElementSettings2({
      id: container.id,
      props: { [classesProp]: newClasses }
    });
  });
}

// src/style-commands/reset-style.ts
import {
  __privateListenTo as listenTo3,
  blockCommand as blockCommand5,
  commandStartEvent as commandStartEvent2
} from "@elementor/editor-v1-adapters";

// src/style-commands/undoable-actions/reset-element-style.ts
import { createElementStyle as createElementStyle3, deleteElementStyle as deleteElementStyle2, getElementStyles as getElementStyles4 } from "@elementor/editor-elements";
import { ELEMENTS_STYLES_RESERVED_LABEL as ELEMENTS_STYLES_RESERVED_LABEL2 } from "@elementor/editor-styles-repository";
import { undoable as undoable3 } from "@elementor/editor-v1-adapters";
import { __ as __7 } from "@wordpress/i18n";
var undoableResetElementStyle = () => undoable3(
  {
    do: ({ containers }) => {
      return containers.map((container) => {
        const elementId = container.model.get("id");
        const containerStyles = getElementStyles4(elementId);
        Object.keys(containerStyles ?? {}).forEach(
          (styleId) => deleteElementStyle2(elementId, styleId)
        );
        return containerStyles;
      });
    },
    undo: ({ containers }, revertDataItems) => {
      containers.forEach((container, index) => {
        const classesProp = getClassesProp(container);
        if (!classesProp) {
          return;
        }
        const elementId = container.model.get("id");
        const containerStyles = revertDataItems[index];
        Object.entries(containerStyles ?? {}).forEach(([styleId, style]) => {
          const [firstVariant] = style.variants;
          const additionalVariants = style.variants.slice(1);
          createElementStyle3({
            elementId,
            classesProp,
            styleId,
            label: ELEMENTS_STYLES_RESERVED_LABEL2,
            ...firstVariant,
            additionalVariants
          });
        });
      });
    }
  },
  {
    title: ({ containers }) => getTitleForContainers(containers),
    subtitle: __7("Style Reset", "elementor")
  }
);

// src/style-commands/reset-style.ts
function initResetStyleCommand() {
  const resetElementStyles = undoableResetElementStyle();
  blockCommand5({
    command: "document/elements/reset-style",
    condition: hasAtomicWidgets
  });
  listenTo3(
    commandStartEvent2("document/elements/reset-style"),
    (e) => resetStyles(e.args, resetElementStyles)
  );
}
function resetStyles(args, resetElementStyles) {
  const { containers = [args.container] } = args;
  const atomicContainers = containers.filter(isAtomicWidget);
  if (!atomicContainers.length) {
    return;
  }
  resetElementStyles({ containers: atomicContainers });
}

// src/style-commands/init-style-commands.ts
function initStyleCommands() {
  initPasteStyleCommand();
  initResetStyleCommand();
}

// src/init.tsx
function init() {
  initStyleTransformers();
  initStyleCommands();
  initLinkInLinkPrevention();
  initFormNestingPrevention();
  initFormAncestorEnforcement();
  initViewReplacements();
  initLegacyViews();
  initSettingsTransformers();
  injectIntoTop({
    id: "elements-overlays",
    component: ElementsOverlays
  });
  injectIntoTop({
    id: "canvas-style-render",
    component: StyleRenderer
  });
  injectIntoTop({
    id: "canvas-interactions-render",
    component: InteractionsRenderer
  });
  injectIntoLogic({
    id: "classes-rename",
    component: ClassesRename
  });
  initCanvasMcp(
    getMCPByDomain("canvas", {
      instructions: mcpDescription
    })
  );
  initTabsModelExtensions();
}

// src/sync/drag-element-from-panel.ts
var DRAG_GROUPS = ["elementor-element"];
var endDragElementFromPanel = () => {
  getElementorChannels()?.panelElements?.trigger("element:drag:end");
};
var startDragElementFromPanel = (props, event) => {
  setDragGroups(event);
  const channels = getElementorChannels();
  channels?.editor.reply("element:dragged", null);
  channels?.panelElements.reply("element:selected", getLegacyPanelElementView(props)).trigger("element:drag:start");
};
var setDragGroups = (event) => {
  const dataContainer = { groups: getDragGroups(event) };
  event.dataTransfer?.setData(JSON.stringify(dataContainer), "true");
};
var getDragGroups = (event) => {
  const dataContainer = event.dataTransfer?.getData("text/plain");
  return dataContainer ? JSON.parse(dataContainer).groups : DRAG_GROUPS;
};
var getElementorChannels = () => {
  const extendedWindow = window;
  const channels = extendedWindow.elementor?.channels;
  if (!channels) {
    throw new Error(
      "Elementor channels not found: Elementor editor is not initialized or channels are unavailable."
    );
  }
  return channels;
};
var getLegacyPanelElementView = ({ settings, ...rest }) => {
  const extendedWindow = window;
  const LegacyElementModel = extendedWindow.elementor?.modules?.elements?.models?.Element;
  if (!LegacyElementModel) {
    throw new Error("Elementor legacy Element model not found in editor modules");
  }
  const elementModel = new LegacyElementModel({
    ...rest,
    custom: {
      isPreset: !!settings,
      preset_settings: settings
    }
  });
  return { model: elementModel };
};
export {
  BREAKPOINTS_SCHEMA_URI,
  DOCUMENT_STRUCTURE_URI,
  STYLE_SCHEMA_URI,
  UnknownStyleStateError,
  UnknownStyleTypeError,
  WIDGET_SCHEMA_URI,
  canBeNestedTemplated,
  createNestedTemplatedElementType,
  createNestedTemplatedElementView,
  createPropsResolver,
  createTemplatedElementView,
  createTransformer,
  createTransformersRegistry,
  endDragElementFromPanel,
  init,
  isAtomicWidget,
  registerElementType,
  registerModelExtensions,
  settingsTransformersRegistry,
  startDragElementFromPanel,
  styleTransformersRegistry,
  stylesInheritanceTransformersRegistry
};
//# sourceMappingURL=index.mjs.map