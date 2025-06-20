// src/init.tsx
import { injectIntoTop } from "@elementor/editor";

// src/components/elements-overlays.tsx
import * as React2 from "react";
import { getElements, useSelectedElement } from "@elementor/editor-elements";
import {
  __privateUseIsRouteActive as useIsRouteActive,
  __privateUseListenTo as useListenTo,
  useEditMode,
  windowEvent
} from "@elementor/editor-v1-adapters";

// src/components/element-overlay.tsx
import * as React from "react";
import { Box, styled } from "@elementor/ui";
import { FloatingPortal, useHover, useInteractions } from "@floating-ui/react";

// src/hooks/use-bind-react-props-to-element.ts
import { useEffect } from "react";
function useBindReactPropsToElement(element, getProps) {
  useEffect(() => {
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
import { useEffect as useEffect2, useState } from "react";
import { autoUpdate, offset, size, useFloating } from "@floating-ui/react";
function useFloatingOnElement({ element, isSelected }) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    // Must be controlled for interactions (like hover) to work.
    open: isOpen || isSelected,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      // Match the floating element's size to the reference element.
      size({
        apply({ elements, rects }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width + 2}px`,
            height: `${rects.reference.height + 2}px`
          });
        }
      }),
      // Center the floating element on the reference element.
      offset(({ rects }) => -rects.reference.height / 2 - rects.floating.height / 2)
    ]
  });
  useEffect2(() => {
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

// src/components/element-overlay.tsx
var CANVAS_WRAPPER_ID = "elementor-preview-responsive-wrapper";
var OverlayBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isSelected" && prop !== "isSmallerOffset"
})(({ theme, isSelected, isSmallerOffset }) => ({
  outline: `${isSelected ? "2px" : "1px"} solid ${theme.palette.primary.light}`,
  outlineOffset: isSelected && !isSmallerOffset ? "-2px" : "-1px",
  pointerEvents: "none"
}));
function ElementOverlay({ element, isSelected, id }) {
  const { context, floating, isVisible } = useFloatingOnElement({ element, isSelected });
  const { getFloatingProps, getReferenceProps } = useInteractions([useHover(context)]);
  useBindReactPropsToElement(element, getReferenceProps);
  const isSmallerOffset = element.offsetHeight <= 1;
  return isVisible && /* @__PURE__ */ React.createElement(FloatingPortal, { id: CANVAS_WRAPPER_ID }, /* @__PURE__ */ React.createElement(
    OverlayBox,
    {
      ref: floating.setRef,
      isSelected,
      style: floating.styles,
      "data-element-overlay": id,
      role: "presentation",
      isSmallerOffset,
      ...getFloatingProps()
    }
  ));
}

// src/components/elements-overlays.tsx
function ElementsOverlays() {
  const selected = useSelectedElement();
  const elements = useElementsDom();
  const currentEditMode = useEditMode();
  const isEditMode = currentEditMode === "edit";
  const isKitRouteActive = useIsRouteActive("panel/global");
  const isActive = isEditMode && !isKitRouteActive;
  return isActive && elements.map(([id, element]) => /* @__PURE__ */ React2.createElement(ElementOverlay, { key: id, id, element, isSelected: selected.element?.id === id }));
}
var ELEMENTS_DATA_ATTR = "atomic";
function useElementsDom() {
  return useListenTo(
    [windowEvent("elementor/editor/element-rendered"), windowEvent("elementor/editor/element-destroyed")],
    () => {
      return getElements().filter((el) => ELEMENTS_DATA_ATTR in (el.view?.el?.dataset ?? {})).map((element) => [element.id, element.view?.getDomElement?.()?.get?.(0)]).filter((item) => !!item[1]);
    }
  );
}

// src/components/style-renderer.tsx
import * as React3 from "react";
import { __privateUseListenTo as useListenTo3, commandEndEvent as commandEndEvent2 } from "@elementor/editor-v1-adapters";
import { Portal } from "@elementor/ui";

// src/hooks/use-documents-css-links.ts
import { __privateUseListenTo as useListenTo2, commandEndEvent } from "@elementor/editor-v1-adapters";

// src/sync/get-canvas-iframe-document.ts
function getCanvasIframeDocument() {
  const extendedWindow = window;
  return extendedWindow.elementor?.$preview?.[0]?.contentDocument;
}

// src/hooks/use-documents-css-links.ts
var REMOVED_ATTR = "data-e-removed";
var DOCUMENT_WRAPPER_ATTR = "data-elementor-id";
var CSS_LINK_ID_PREFIX = "elementor-post-";
var CSS_LINK_ID_SUFFIX = "-css";
function useDocumentsCssLinks() {
  return useListenTo2(commandEndEvent("editor/documents/attach-preview"), () => {
    const iframeDocument = getCanvasIframeDocument();
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
function getDocumentsIdsInCanvas(document) {
  return [...document.body.querySelectorAll(`[${DOCUMENT_WRAPPER_ATTR}]`) ?? []].map(
    (el) => el.getAttribute(DOCUMENT_WRAPPER_ATTR) || ""
  );
}
function getDocumentsCssLinks(document) {
  return [
    ...document.head.querySelectorAll(
      `link[rel="stylesheet"][id^=${CSS_LINK_ID_PREFIX}][id$=${CSS_LINK_ID_SUFFIX}]`
    ) ?? []
  ];
}
function getLinkAttrs(el) {
  const entries = [...el.attributes].map((attr) => [attr.name, attr.value]);
  return Object.fromEntries(entries);
}

// src/hooks/use-style-items.ts
import { useEffect as useEffect4, useMemo as useMemo3, useState as useState2 } from "react";
import { stylesRepository } from "@elementor/editor-styles-repository";
import { registerDataHook } from "@elementor/editor-v1-adapters";

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

// src/hooks/use-on-mount.ts
import { useEffect as useEffect3, useRef } from "react";
function useOnMount(cb) {
  const mounted = useRef(false);
  useEffect3(() => {
    if (!mounted.current) {
      mounted.current = true;
      cb();
    }
  }, []);
}

// src/hooks/use-style-prop-resolver.ts
import { useMemo } from "react";
import { getStylesSchema } from "@elementor/editor-styles";

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
  async function resolve({ props, schema, signal }) {
    schema = schema ?? initialSchema;
    const promises = Promise.all(
      Object.entries(schema).map(async ([key, type]) => {
        const value = props[key] ?? type.default;
        const transformed = await transform({ value, key, type, signal });
        onPropResolve?.({ key, value: transformed });
        if (isMultiProps(transformed)) {
          return getMultiPropsValue(transformed);
        }
        return { [key]: transformed };
      })
    );
    return Object.assign({}, ...(await promises).filter(Boolean));
  }
  async function transform({ value, key, type, signal, depth = 0 }) {
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
    if (type.kind === "union") {
      type = type.prop_types[value.$$type];
      if (!type) {
        return null;
      }
    }
    if (value.$$type !== type.key) {
      return null;
    }
    let resolvedValue = value.value;
    if (type.kind === "object") {
      resolvedValue = await resolve({
        props: resolvedValue,
        schema: type.shape,
        signal
      });
    }
    if (type.kind === "array") {
      resolvedValue = await Promise.all(
        resolvedValue.map(
          (item) => transform({ value: item, key, type: type.item_prop_type, depth, signal })
        )
      );
    }
    const transformer = transformers.get(value.$$type);
    if (!transformer) {
      return null;
    }
    try {
      const transformed = await transformer(resolvedValue, { key, signal });
      return transform({ value: transformed, key, type, signal, depth: depth + 1 });
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

// src/style-transformers-registry.ts
var styleTransformersRegistry = createTransformersRegistry();

// src/sync/enqueue-font.ts
var enqueueFont = (fontFamily, context = "preview") => {
  const extendedWindow = window;
  return extendedWindow.elementor?.helpers?.enqueueFont?.(fontFamily, context) ?? null;
};

// src/hooks/use-style-prop-resolver.ts
function useStylePropResolver() {
  return useMemo(() => {
    return createPropsResolver({
      transformers: styleTransformersRegistry,
      schema: getStylesSchema(),
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
import { useMemo as useMemo2 } from "react";
import { useBreakpointsMap } from "@elementor/editor-responsive";

// src/renderers/errors.ts
import { createError } from "@elementor/utils";
var UnknownStyleTypeError = createError({
  code: "unknown_style_type",
  message: "Unknown style type"
});

// src/renderers/create-styles-renderer.ts
var SELECTORS_MAP = {
  class: "."
};
function createStylesRenderer({ resolve, breakpoints, selectorPrefix = "" }) {
  return async ({ styles, signal }) => {
    const stylesCssPromises = styles.map(async (style) => {
      const variantCssPromises = Object.values(style.variants).map(async (variant) => {
        const css = await propsToCss({ props: variant.props, resolve, signal });
        return createStyleWrapper().for(style.cssName, style.type).withPrefix(selectorPrefix).withState(variant.meta.state).withMediaQuery(variant.meta.breakpoint ? breakpoints[variant.meta.breakpoint] : null).wrap(css);
      });
      const variantsCss = await Promise.all(variantCssPromises);
      return {
        id: style.id,
        value: variantsCss.join("")
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
    withState: (state) => createStyleWrapper(state ? `${value}:${state}` : value, wrapper),
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

// src/hooks/use-style-renderer.ts
var SELECTOR_PREFIX = ".elementor";
function useStyleRenderer(resolve) {
  const breakpoints = useBreakpointsMap();
  return useMemo2(() => {
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
  const [styleItems, setStyleItems] = useState2({});
  const providerAndSubscribers = useMemo3(() => {
    return stylesRepository.getProviders().map((provider) => {
      return {
        provider,
        subscriber: createProviderSubscriber({
          provider,
          renderStyles,
          setStyleItems
        })
      };
    });
  }, [renderStyles]);
  useEffect4(() => {
    const unsubscribes = providerAndSubscribers.map(
      ({ provider, subscriber }) => provider.subscribe(subscriber)
    );
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [providerAndSubscribers]);
  useOnMount(() => {
    registerDataHook("after", "editor/documents/attach-preview", async () => {
      const promises = providerAndSubscribers.map(async ({ subscriber }) => subscriber());
      await Promise.all(promises);
    });
  });
  return Object.values(styleItems).sort(({ provider: providerA }, { provider: providerB }) => providerA.priority - providerB.priority).flatMap(({ items }) => items);
}
function createProviderSubscriber({ provider, renderStyles, setStyleItems }) {
  return abortPreviousRuns(
    (abortController) => signalizedProcess(abortController.signal).then((_, signal) => {
      const styles = provider.actions.all().map((__5, index, items) => {
        const lastPosition = items.length - 1;
        const style = items[lastPosition - index];
        return {
          ...style,
          cssName: provider.actions.resolveCssName(style.id)
        };
      });
      return renderStyles({ styles, signal });
    }).then((items) => {
      setStyleItems((prev) => ({
        ...prev,
        [provider.getKey()]: { provider, items }
      }));
    }).execute()
  );
}

// src/components/style-renderer.tsx
function StyleRenderer() {
  const container = usePortalContainer();
  const styleItems = useStyleItems();
  const linksAttrs = useDocumentsCssLinks();
  if (!container) {
    return null;
  }
  return /* @__PURE__ */ React3.createElement(Portal, { container }, styleItems.map((item) => /* @__PURE__ */ React3.createElement("style", { "data-e-style-id": item.id, key: item.id }, item.value)), linksAttrs.map((attrs) => /* @__PURE__ */ React3.createElement("link", { ...attrs, key: attrs.id })));
}
function usePortalContainer() {
  return useListenTo3(commandEndEvent2("editor/documents/attach-preview"), () => getCanvasIframeDocument()?.head);
}

// src/settings-transformers-registry.ts
var settingsTransformersRegistry = createTransformersRegistry();

// src/transformers/settings/classes-transformer.ts
import { stylesRepository as stylesRepository2 } from "@elementor/editor-styles-repository";

// src/transformers/create-transformer.ts
function createTransformer(cb) {
  return cb;
}

// src/transformers/settings/classes-transformer.ts
function createClassesTransformer() {
  const cache = /* @__PURE__ */ new Map();
  return createTransformer((value) => {
    return value.map((id) => {
      if (!cache.has(id)) {
        cache.set(id, getCssName(id));
      }
      return cache.get(id);
    }).filter(Boolean);
  });
}
function getCssName(id) {
  const provider = stylesRepository2.getProviders().find((p) => {
    return p.actions.all().find((style) => style.id === id);
  });
  if (!provider) {
    return id;
  }
  return provider.actions.resolveCssName(id);
}

// src/transformers/settings/link-transformer.ts
var linkTransformer = createTransformer(({ destination, isTargetBlank }) => {
  return {
    // The real post URL is not relevant in the Editor.
    href: typeof destination === "number" ? "#post-id-" + destination : destination,
    target: isTargetBlank ? "_blank" : "_self"
  };
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

// src/init-settings-transformers.ts
function initSettingsTransformers() {
  settingsTransformersRegistry.register("classes", createClassesTransformer()).register("link", linkTransformer).register("image", imageTransformer).register("image-src", imageSrcTransformer).registerFallback(plainTransformer);
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
import { isExperimentActive } from "@elementor/editor-v1-adapters";
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
  const isVersion330Active = isExperimentActive("e_v_3_30");
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
  if (!isVersion330Active) {
    return mappedValues;
  }
  return mappedValues.filter((item) => item && !!item.src);
}
function getValuesString(items, prop, defaultValue, preventUnification = false) {
  const isVersion330Active = isExperimentActive("e_v_3_30");
  const isEmpty = items.filter((item) => item?.[prop]).length === 0;
  if (isEmpty) {
    return isVersion330Active ? defaultValue : null;
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
  const { color = null, "background-overlay": overlays = null } = value;
  return createMultiPropsValue({
    ...overlays,
    "background-color": color
  });
});

// src/transformers/styles/color-stop-transformer.ts
var colorStopTransformer = createTransformer(
  (value) => `${value?.color} ${value?.offset ?? 0}%`
);

// src/transformers/styles/create-combine-array-transformer.ts
var createCombineArrayTransformer = (delimiter) => {
  return createTransformer((value) => value.filter(Boolean).join(delimiter));
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
  return filterValues.map(mapToFilterFunctionString).join(" ");
});
var mapToFilterFunctionString = (value) => {
  if ("radius" in value) {
    return `blur(${value.radius})`;
  }
  if ("amount" in value) {
    return `brightness(${value.amount})`;
  }
  return "";
};

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

// src/init-style-transformers.ts
function initStyleTransformers() {
  styleTransformersRegistry.register("size", sizeTransformer).register("shadow", shadowTransformer).register("stroke", strokeTransformer).register(
    "dimensions",
    createMultiPropsTransformer(
      ["block-start", "block-end", "inline-start", "inline-end"],
      ({ propKey, key }) => `${propKey}-${key}`
    )
  ).register("filter", filterTransformer).register("box-shadow", createCombineArrayTransformer(",")).register("background", backgroundTransformer).register("background-overlay", backgroundOverlayTransformer).register("background-color-overlay", backgroundColorOverlayTransformer).register("background-image-overlay", backgroundImageOverlayTransformer).register("background-gradient-overlay", backgroundGradientOverlayTransformer).register("gradient-color-stop", createCombineArrayTransformer(",")).register("color-stop", colorStopTransformer).register("background-image-position-offset", positionTransformer).register("background-image-size-scale", backgroundImageSizeScaleTransformer).register("image-src", imageSrcTransformer).register("image", imageTransformer).register("object-position", positionTransformer).register(
    "layout-direction",
    createMultiPropsTransformer(["row", "column"], ({ propKey, key }) => `${key}-${propKey}`)
  ).register(
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
import { getWidgetsCache } from "@elementor/editor-elements";
import { __privateListenTo, v1ReadyEvent } from "@elementor/editor-v1-adapters";

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
      legacyWindow.elementor?.$preview?.[0]?.contentWindow.dispatchEvent(
        new CustomEvent(eventType, {
          detail: {
            id: this.model.get("id"),
            type: this.model.get("widgetType"),
            element: this.getDomElement().get(0)
          }
        })
      );
    }
    getContextMenuGroups() {
      return super.getContextMenuGroups().filter((group) => group.name !== "save");
    }
  };
}

// src/legacy/create-templated-element-type.ts
function createTemplatedElementType({ type, renderer, element }) {
  const legacyWindow = window;
  Object.entries(element.twig_templates).forEach(([key, template]) => {
    renderer.register(key, template);
  });
  const propsResolver = createPropsResolver({
    transformers: settingsTransformersRegistry,
    schema: element.atomic_props_schema
  });
  return class extends legacyWindow.elementor.modules.elements.types.Widget {
    getType() {
      return type;
    }
    getView() {
      return createTemplatedElementViewClassDeclaration({
        type,
        renderer,
        propsResolver,
        baseStylesDictionary: element.base_styles_dictionary,
        templateKey: element.twig_main_template
      });
    }
  };
}
function canBeTemplated(element) {
  return !!(element.atomic_props_schema && element.twig_templates && element.twig_main_template && element.base_styles_dictionary);
}
function createTemplatedElementViewClassDeclaration({
  type,
  renderer,
  propsResolver: resolveProps,
  templateKey,
  baseStylesDictionary
}) {
  const BaseView = createElementViewClassDeclaration();
  return class extends BaseView {
    #abortController = null;
    getTemplateType() {
      return "twig";
    }
    renderOnChange() {
      this.render();
    }
    // Overriding Marionette original render method to inject our renderer.
    async _renderTemplate() {
      this.#beforeRenderTemplate();
      this.#abortController?.abort();
      this.#abortController = new AbortController();
      const process = signalizedProcess(this.#abortController.signal).then((_, signal) => {
        const settings = this.model.get("settings").toJSON();
        return resolveProps({
          props: settings,
          signal
        });
      }).then((resolvedSettings) => {
        const context = {
          id: this.model.get("id"),
          type,
          settings: resolvedSettings,
          base_styles: baseStylesDictionary
        };
        return renderer.render(templateKey, context);
      }).then((html) => this.$el.html(html));
      await process.execute();
      this.#afterRenderTemplate();
    }
    // Emulating the original Marionette behavior.
    #beforeRenderTemplate() {
      this.triggerMethod("before:render:template");
    }
    #afterRenderTemplate() {
      this.bindUIElements();
      this.triggerMethod("render:template");
    }
  };
}

// src/legacy/init-legacy-views.ts
function initLegacyViews() {
  __privateListenTo(v1ReadyEvent(), () => {
    const config = getWidgetsCache() ?? {};
    const legacyWindow = window;
    const renderer = createDomRenderer();
    Object.entries(config).forEach(([type, element]) => {
      if (!element.atomic) {
        return;
      }
      const ElementType = canBeTemplated(element) ? createTemplatedElementType({ type, renderer, element }) : createElementType(type);
      legacyWindow.elementor.elementsManager.registerElementType(new ElementType());
    });
  });
}

// src/prevent-link-in-link-commands.ts
import {
  getAnchoredAncestorId,
  getAnchoredDescendantId,
  isElementAnchored
} from "@elementor/editor-elements";
import { notify } from "@elementor/editor-notifications";
import { blockCommand } from "@elementor/editor-v1-adapters";
import { __ } from "@wordpress/i18n";
function initLinkInLinkPrevention() {
  blockCommand({
    command: "document/elements/paste",
    condition: blockLinkInLinkPaste
  });
  blockCommand({
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
    message: __(
      "To paste a link to this element, first remove the link from it's parent container.",
      "elementor"
    ),
    id: "paste-in-link-blocked",
    additionalActionProps: [learnMoreActionProps]
  };
  const blocked = shouldBlock(sourceElements, targetElements);
  if (blocked) {
    notify(notification);
  }
  return blocked;
}
function blockLinkInLinkMove(args) {
  const { containers = [args.container], target } = args;
  const sourceElements = containers;
  const targetElement = target;
  const notification = {
    type: "default",
    message: __("To drag a link to this element, first remove the link from it's parent container.", "elementor"),
    id: "move-in-link-blocked",
    additionalActionProps: [learnMoreActionProps]
  };
  const isBlocked = shouldBlock(sourceElements, [targetElement]);
  if (isBlocked) {
    notify(notification);
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
import {
  __privateListenTo as listenTo,
  blockCommand as blockCommand2,
  commandStartEvent
} from "@elementor/editor-v1-adapters";

// src/style-commands/undoable-actions/paste-element-style.ts
import {
  createElementStyle,
  deleteElementStyle,
  getElementStyles,
  updateElementStyle
} from "@elementor/editor-elements";
import { ELEMENTS_STYLES_RESERVED_LABEL } from "@elementor/editor-styles-repository";
import { undoable } from "@elementor/editor-v1-adapters";
import { __ as __3 } from "@wordpress/i18n";

// src/style-commands/utils.ts
import { getElementLabel, getWidgetsCache as getWidgetsCache2 } from "@elementor/editor-elements";
import { CLASSES_PROP_KEY } from "@elementor/editor-props";
import { __ as __2 } from "@wordpress/i18n";
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
  const widgetsCache = getWidgetsCache2();
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
  return containers.length > 1 ? __2("Elements", "elementor") : getElementLabel(containers[0].id);
}

// src/style-commands/undoable-actions/paste-element-style.ts
var undoablePasteElementStyle = () => undoable(
  {
    do: ({ containers, newStyle }) => {
      return containers.map((container) => {
        const elementId = container.id;
        const classesProp = getClassesProp(container);
        if (!classesProp) {
          return null;
        }
        const originalStyles = getElementStyles(container.id);
        const [styleId, styleDef] = Object.entries(originalStyles ?? {})[0] ?? [];
        const originalStyle = Object.keys(styleDef ?? {}).length ? styleDef : null;
        const revertData = {
          styleId,
          originalStyle
        };
        if (styleId) {
          newStyle.variants.forEach(({ meta, props }) => {
            updateElementStyle({
              elementId,
              styleId,
              meta,
              props
            });
          });
        } else {
          const [firstVariant] = newStyle.variants;
          const additionalVariants = newStyle.variants.slice(1);
          revertData.styleId = createElementStyle({
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
        createElementStyle({
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
    subtitle: __3("Style Pasted", "elementor")
  }
);

// src/style-commands/paste-style.ts
function initPasteStyleCommand() {
  const pasteElementStyleCommand = undoablePasteElementStyle();
  blockCommand2({
    command: "document/elements/paste-style",
    condition: hasAtomicWidgets
  });
  listenTo(
    commandStartEvent("document/elements/paste-style"),
    (e) => pasteStyles(e.args, pasteElementStyleCommand)
  );
}
function pasteStyles(args, pasteCallback) {
  const { containers = [args.container], storageKey } = args;
  const clipboardElements = getClipboardElements(storageKey);
  const [clipboardElement] = clipboardElements ?? [];
  if (!clipboardElement) {
    return;
  }
  const elementStyles = clipboardElement.styles;
  const elementStyle = Object.values(elementStyles ?? {})[0];
  if (!elementStyle) {
    return;
  }
  const atomicContainers = containers.filter(isAtomicWidget);
  if (!atomicContainers.length) {
    return;
  }
  pasteCallback({ containers: atomicContainers, newStyle: elementStyle });
}

// src/style-commands/reset-style.ts
import {
  __privateListenTo as listenTo2,
  blockCommand as blockCommand3,
  commandStartEvent as commandStartEvent2
} from "@elementor/editor-v1-adapters";

// src/style-commands/undoable-actions/reset-element-style.ts
import { createElementStyle as createElementStyle2, deleteElementStyle as deleteElementStyle2, getElementStyles as getElementStyles2 } from "@elementor/editor-elements";
import { ELEMENTS_STYLES_RESERVED_LABEL as ELEMENTS_STYLES_RESERVED_LABEL2 } from "@elementor/editor-styles-repository";
import { undoable as undoable2 } from "@elementor/editor-v1-adapters";
import { __ as __4 } from "@wordpress/i18n";
var undoableResetElementStyle = () => undoable2(
  {
    do: ({ containers }) => {
      return containers.map((container) => {
        const elementId = container.model.get("id");
        const containerStyles = getElementStyles2(elementId);
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
          createElementStyle2({
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
    subtitle: __4("Style Reset", "elementor")
  }
);

// src/style-commands/reset-style.ts
function initResetStyleCommand() {
  const resetElementStyles = undoableResetElementStyle();
  blockCommand3({
    command: "document/elements/reset-style",
    condition: hasAtomicWidgets
  });
  listenTo2(
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
}
export {
  createPropsResolver,
  createTransformer,
  createTransformersRegistry,
  init,
  settingsTransformersRegistry,
  styleTransformersRegistry
};
//# sourceMappingURL=index.mjs.map