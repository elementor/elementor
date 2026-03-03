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
  GLOBAL_CLASSES_URI: () => GLOBAL_CLASSES_URI,
  init: () => init
});
module.exports = __toCommonJS(index_exports);

// src/mcp-integration/classes-resource.ts
var import_editor_mcp = require("@elementor/editor-mcp");

// src/global-classes-styles-provider.ts
var import_editor_styles2 = require("@elementor/editor-styles");
var import_editor_styles_repository = require("@elementor/editor-styles-repository");
var import_store4 = require("@elementor/store");
var import_i18n = require("@wordpress/i18n");

// src/capabilities.ts
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var EXPERIMENT_KEY = "global_classes_should_enforce_capabilities";
var UPDATE_CLASS_CAPABILITY_KEY = "elementor_global_classes_update_class";
var getCapabilities = () => {
  const shouldEnforceCapabilities = (0, import_editor_v1_adapters.isExperimentActive)(EXPERIMENT_KEY);
  if (shouldEnforceCapabilities) {
    return {
      update: UPDATE_CLASS_CAPABILITY_KEY,
      create: UPDATE_CLASS_CAPABILITY_KEY,
      delete: UPDATE_CLASS_CAPABILITY_KEY,
      updateProps: UPDATE_CLASS_CAPABILITY_KEY
    };
  }
};

// src/errors.ts
var import_utils = require("@elementor/utils");
var GlobalClassNotFoundError = (0, import_utils.createError)({
  code: "global_class_not_found",
  message: "Global class not found."
});
var GlobalClassLabelAlreadyExistsError = (0, import_utils.createError)({
  code: "global_class_label_already_exists",
  message: "Class with this name already exists."
});
var GlobalClassTrackingError = (0, import_utils.createError)({
  code: "global_class_tracking_error",
  message: "Error tracking global classes event."
});

// src/store.ts
var import_editor_styles = require("@elementor/editor-styles");
var import_store = require("@elementor/store");

// src/utils/snapshot-history.ts
function createLink({ value, next, prev }) {
  return {
    value,
    prev: prev || null,
    next: next || null
  };
}
var SnapshotHistory = class _SnapshotHistory {
  constructor(namespace) {
    this.namespace = namespace;
  }
  static registry = {};
  static get(namespace) {
    if (!_SnapshotHistory.registry[namespace]) {
      _SnapshotHistory.registry[namespace] = new _SnapshotHistory(namespace);
    }
    return _SnapshotHistory.registry[namespace];
  }
  first = null;
  current = null;
  transform(item) {
    return JSON.parse(JSON.stringify(item));
  }
  reset() {
    this.first = this.current = null;
  }
  prev() {
    if (!this.current || this.current === this.first) {
      return null;
    }
    this.current = this.current.prev;
    return this.current?.value || null;
  }
  isLast() {
    return !this.current || !this.current.next;
  }
  next(value) {
    if (value) {
      if (!this.current) {
        this.first = createLink({ value: this.transform(value) });
        this.current = this.first;
        return this.current.value;
      }
      const nextLink = createLink({
        value: this.transform(value),
        prev: this.current
      });
      this.current.next = nextLink;
      this.current = nextLink;
      return this.current.value;
    }
    if (!this.current || !this.current.next) {
      return null;
    }
    this.current = this.current.next;
    return this.current.value;
  }
};

// src/store.ts
var localHistory = SnapshotHistory.get("global-classes");
var initialState = {
  data: { items: {}, order: [] },
  initialData: {
    frontend: { items: {}, order: [] },
    preview: { items: {}, order: [] }
  },
  isDirty: false
};
var SLICE_NAME = "globalClasses";
var slice = (0, import_store.__createSlice)({
  name: SLICE_NAME,
  initialState,
  reducers: {
    load(state, {
      payload: { frontend, preview }
    }) {
      state.initialData.frontend = frontend;
      state.initialData.preview = preview;
      state.data = preview;
      state.isDirty = false;
    },
    add(state, { payload }) {
      localHistory.next(state.data);
      state.data.items[payload.id] = payload;
      state.data.order.unshift(payload.id);
      state.isDirty = true;
    },
    delete(state, { payload }) {
      localHistory.next(state.data);
      state.data.items = Object.fromEntries(
        Object.entries(state.data.items).filter(([id2]) => id2 !== payload)
      );
      state.data.order = state.data.order.filter((id2) => id2 !== payload);
      state.isDirty = true;
    },
    setOrder(state, { payload }) {
      localHistory.next(state.data);
      state.data.order = payload;
      state.isDirty = true;
    },
    update(state, { payload }) {
      localHistory.next(state.data);
      const style = state.data.items[payload.style.id];
      const mergedData = {
        ...style,
        ...payload.style
      };
      state.data.items[payload.style.id] = mergedData;
      state.isDirty = true;
    },
    updateMultiple(state, { payload }) {
      localHistory.next(state.data);
      Object.entries(payload).forEach(([id2, { modified }]) => {
        state.data.items[id2].label = modified;
      });
      state.isDirty = false;
    },
    updateProps(state, {
      payload
    }) {
      const style = state.data.items[payload.id];
      if (!style) {
        throw new GlobalClassNotFoundError({ context: { styleId: payload.id } });
      }
      localHistory.next(state.data);
      const variant = (0, import_editor_styles.getVariantByMeta)(style, payload.meta);
      let customCss = ("custom_css" in payload ? payload.custom_css : variant?.custom_css) ?? null;
      customCss = customCss?.raw ? customCss : null;
      if (variant) {
        const variantProps = JSON.parse(JSON.stringify(variant.props));
        const payloadProps = JSON.parse(JSON.stringify(payload.props));
        variant.props = mergeProps(variantProps, payloadProps);
        variant.custom_css = customCss;
        style.variants = getNonEmptyVariants(style);
      } else {
        style.variants.push({ meta: payload.meta, props: payload.props, custom_css: customCss });
      }
      state.isDirty = true;
    },
    reset(state, { payload: { context: context2 } }) {
      if (context2 === "frontend") {
        localHistory.reset();
        state.initialData.frontend = state.data;
        state.isDirty = false;
      }
      state.initialData.preview = state.data;
    },
    undo(state) {
      if (localHistory.isLast()) {
        localHistory.next(state.data);
      }
      const data = localHistory.prev();
      if (data) {
        state.data = data;
        state.isDirty = true;
      } else {
        state.data = state.initialData.preview;
      }
    },
    resetToInitialState(state, { payload: { context: context2 } }) {
      localHistory.reset();
      state.data = state.initialData[context2];
      state.isDirty = false;
    },
    redo(state) {
      const data = localHistory.next();
      if (localHistory.isLast()) {
        localHistory.prev();
      }
      if (data) {
        state.data = data;
        state.isDirty = true;
      }
    }
  }
});
var mergeProps = (current, updates) => {
  const props = Array.isArray(current) ? {} : current;
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === void 0) {
      delete props[key];
    } else {
      props[key] = value;
    }
  });
  return props;
};
var getNonEmptyVariants = (style) => {
  return style.variants.filter(
    ({ props, custom_css: customCss }) => Object.keys(props).length || customCss?.raw
  );
};
var selectData = (state) => state[SLICE_NAME].data;
var selectFrontendInitialData = (state) => state[SLICE_NAME].initialData.frontend;
var selectPreviewInitialData = (state) => state[SLICE_NAME].initialData.preview;
var selectOrder = (0, import_store.__createSelector)(selectData, ({ order }) => order);
var selectGlobalClasses = (0, import_store.__createSelector)(selectData, ({ items }) => items);
var selectIsDirty = (state) => state[SLICE_NAME].isDirty;
var selectOrderedClasses = (0, import_store.__createSelector)(
  selectGlobalClasses,
  selectOrder,
  (items, order) => order.map((id2) => items[id2])
);
var selectClass = (state, id2) => state[SLICE_NAME].data.items[id2] ?? null;
var selectEmptyCssClass = (0, import_store.__createSelector)(
  selectData,
  ({ items }) => Object.values(items).filter((cssClass) => cssClass.variants.length === 0)
);

// src/utils/tracking.ts
var import_events = require("@elementor/events");
var import_store2 = require("@elementor/store");

// src/api.ts
var import_http_client = require("@elementor/http-client");
var RESOURCE_URL = "/global-classes";
var BASE_URL = "elementor/v1";
var RESOURCE_USAGE_URL = `${RESOURCE_URL}/usage`;
var apiClient = {
  usage: () => (0, import_http_client.httpService)().get(`${BASE_URL}${RESOURCE_USAGE_URL}`),
  all: (context2 = "preview") => (0, import_http_client.httpService)().get(`${BASE_URL}${RESOURCE_URL}`, {
    params: { context: context2 }
  }),
  publish: (payload) => (0, import_http_client.httpService)().put("elementor/v1" + RESOURCE_URL, payload, {
    params: {
      context: "frontend"
    }
  }),
  saveDraft: (payload) => (0, import_http_client.httpService)().put("elementor/v1" + RESOURCE_URL, payload, {
    params: {
      context: "preview"
    }
  })
};
var API_ERROR_CODES = {
  DUPLICATED_LABEL: "DUPLICATED_LABEL"
};

// src/components/css-class-usage/utils.ts
var transformData = (data) => Object.entries(data).reduce((acc, [key, value]) => {
  acc[key] = {
    content: value || [],
    total: value.reduce((total, val) => total + (val?.total || 0), 0)
  };
  return acc;
}, {});

// service/css-class-usage-service.ts
var fetchCssClassUsage = async () => {
  const response = await apiClient.usage();
  return transformData(response?.data?.data || {});
};

// src/utils/tracking.ts
var trackGlobalClasses = async (payload) => {
  const { runAction } = payload;
  const data = await getSanitizedData(payload);
  if (data) {
    track(data);
    if (data.event === "classCreated" && "classId" in data) {
      fireClassApplied(data.classId);
    }
  }
  runAction?.();
};
var fireClassApplied = async (classId) => {
  const appliedInfo = await getAppliedInfo(classId);
  track({
    event: "classApplied",
    classId,
    ...appliedInfo,
    totalInstancesAfterApply: 1
  });
};
var getSanitizedData = async (payload) => {
  switch (payload.event) {
    case "classApplied":
      if ("classId" in payload && payload.classId) {
        const appliedInfo = await getAppliedInfo(payload.classId);
        return { ...payload, ...appliedInfo };
      }
      break;
    case "classRemoved":
      if ("classId" in payload && payload.classId) {
        const deleteInfo = getRemovedInfo(payload.classId);
        return { ...payload, ...deleteInfo };
      }
      break;
    case "classDeleted":
      if ("classId" in payload && payload.classId) {
        const deleteInfo = await trackDeleteClass(payload.classId);
        return { ...payload, ...deleteInfo };
      }
      break;
    case "classCreated":
      if ("source" in payload && payload.source !== "created") {
        if ("classId" in payload && payload.classId) {
          return { ...payload, classTitle: getCssClass(payload.classId).label };
        }
      }
      return payload;
    case "classStateClicked":
      if ("classId" in payload && payload.classId) {
        return { ...payload, classTitle: getCssClass(payload.classId).label };
      }
      break;
    default:
      return payload;
  }
};
var track = (data) => {
  const { dispatchEvent, config } = (0, import_events.getMixpanel)();
  if (!config?.names?.global_classes?.[data.event]) {
    console.error("Global class tracking event not found", { event: data.event });
    return;
  }
  const name = config.names.global_classes[data.event];
  const { event, ...eventData } = data;
  try {
    dispatchEvent?.(name, {
      event,
      ...eventData
    });
  } catch (error) {
    throw new GlobalClassTrackingError({ cause: error });
  }
};
var extractCssClassData = (classId) => {
  const cssClass = getCssClass(classId);
  const classTitle = cssClass.label;
  return { classTitle };
};
var getCssClass = (classId) => {
  const cssClass = selectClass((0, import_store2.__getState)(), classId);
  if (!cssClass) {
    throw new Error(`CSS class with ID ${classId} not found`);
  }
  return cssClass;
};
var trackDeleteClass = async (classId) => {
  const totalInstances = await getTotalInstancesByCssClassID(classId);
  const classTitle = getCssClass(classId).label;
  return { totalInstances, classTitle };
};
var getTotalInstancesByCssClassID = async (classId) => {
  const cssClassUsage = await fetchCssClassUsage();
  return cssClassUsage[classId]?.total ?? 1;
};
var getAppliedInfo = async (classId) => {
  const { classTitle } = extractCssClassData(classId);
  const totalInstancesAfterApply = await getTotalInstancesByCssClassID(classId) + 1;
  return { classTitle, totalInstancesAfterApply };
};
var getRemovedInfo = (classId) => {
  const { classTitle } = extractCssClassData(classId);
  return {
    classTitle
  };
};

// src/global-classes-styles-provider.ts
var MAX_CLASSES = 100;
var GLOBAL_CLASSES_PROVIDER_KEY = "global-classes";
var globalClassesStylesProvider = (0, import_editor_styles_repository.createStylesProvider)({
  key: GLOBAL_CLASSES_PROVIDER_KEY,
  priority: 30,
  limit: MAX_CLASSES,
  labels: {
    singular: (0, import_i18n.__)("class", "elementor"),
    plural: (0, import_i18n.__)("classes", "elementor")
  },
  subscribe: (cb) => subscribeWithStates(cb),
  capabilities: getCapabilities(),
  actions: {
    all: () => selectOrderedClasses((0, import_store4.__getState)()),
    get: (id2) => selectClass((0, import_store4.__getState)(), id2),
    resolveCssName: (id2) => {
      return selectClass((0, import_store4.__getState)(), id2)?.label ?? id2;
    },
    create: (label, variants = []) => {
      const classes = selectGlobalClasses((0, import_store4.__getState)());
      const existingLabels = Object.values(classes).map((style) => style.label);
      if (existingLabels.includes(label)) {
        throw new GlobalClassLabelAlreadyExistsError({ context: { label } });
      }
      const existingIds = Object.keys(classes);
      const id2 = (0, import_editor_styles2.generateId)("g-", existingIds);
      (0, import_store4.__dispatch)(
        slice.actions.add({
          id: id2,
          type: "class",
          label,
          variants
        })
      );
      return id2;
    },
    update: (payload) => {
      (0, import_store4.__dispatch)(
        slice.actions.update({
          style: payload
        })
      );
    },
    delete: (id2) => {
      (0, import_store4.__dispatch)(slice.actions.delete(id2));
    },
    updateProps: (args) => {
      (0, import_store4.__dispatch)(
        slice.actions.updateProps({
          id: args.id,
          meta: args.meta,
          props: args.props
        })
      );
    },
    updateCustomCss: (args) => {
      (0, import_store4.__dispatch)(
        slice.actions.updateProps({
          id: args.id,
          meta: args.meta,
          custom_css: args.custom_css,
          props: {}
        })
      );
    },
    tracking: (data) => {
      trackGlobalClasses(data).catch((error) => {
        throw new GlobalClassTrackingError({ cause: error });
      });
    }
  }
});
var subscribeWithStates = (cb) => {
  let previousState = selectData((0, import_store4.__getState)());
  return (0, import_store4.__subscribeWithSelector)(
    (state) => state.globalClasses,
    (currentState) => {
      cb(previousState.items, currentState.data.items);
      previousState = currentState.data;
    }
  );
};

// src/mcp-integration/classes-resource.ts
var GLOBAL_CLASSES_URI = "elementor://global-classes";
var STORAGE_KEY = "elementor-global-classes";
var updateLocalStorageCache = () => {
  const classes = globalClassesStylesProvider.actions.all();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
};
var initClassesResource = () => {
  const canvasMcpEntry = (0, import_editor_mcp.getMCPByDomain)("canvas");
  const classesMcpEntry = (0, import_editor_mcp.getMCPByDomain)("classes");
  [canvasMcpEntry, classesMcpEntry].forEach((entry) => {
    const { mcpServer, resource, waitForReady } = entry;
    resource(
      "global-classes",
      GLOBAL_CLASSES_URI,
      {
        description: "Global classes list."
      },
      async () => {
        return {
          contents: [{ uri: GLOBAL_CLASSES_URI, text: localStorage[STORAGE_KEY] ?? "[]" }]
        };
      }
    );
    waitForReady().then(() => {
      updateLocalStorageCache();
      globalClassesStylesProvider.subscribe(() => {
        updateLocalStorageCache();
        mcpServer.sendResourceListChanged();
      });
    });
  });
};

// src/init.ts
var import_editor = require("@elementor/editor");
var import_editor_editing_panel2 = require("@elementor/editor-editing-panel");
var import_editor_panels2 = require("@elementor/editor-panels");
var import_editor_styles_repository5 = require("@elementor/editor-styles-repository");
var import_store26 = require("@elementor/store");

// src/components/class-manager/class-manager-button.tsx
var React20 = __toESM(require("react"));
var import_editor_documents4 = require("@elementor/editor-documents");
var import_editor_styles_repository3 = require("@elementor/editor-styles-repository");
var import_editor_ui10 = require("@elementor/editor-ui");
var import_ui17 = require("@elementor/ui");
var import_i18n16 = require("@wordpress/i18n");

// src/hooks/use-prefetch-css-class-usage.ts
var import_query = require("@elementor/query");

// src/components/css-class-usage/types.ts
var QUERY_KEY = "css-classes-usage";

// src/hooks/use-prefetch-css-class-usage.ts
function usePrefetchCssClassUsage() {
  const queryClient = (0, import_query.useQueryClient)();
  const prefetchClassesUsage = () => queryClient.prefetchQuery({
    queryKey: [QUERY_KEY],
    queryFn: fetchCssClassUsage
  });
  return { prefetchClassesUsage };
}
var PrefetchCssClassUsage = () => {
  const { prefetchClassesUsage } = usePrefetchCssClassUsage();
  prefetchClassesUsage();
  return null;
};

// src/components/class-manager/class-manager-panel.tsx
var React19 = __toESM(require("react"));
var import_react9 = require("react");
var import_editor_current_user2 = require("@elementor/editor-current-user");
var import_editor_documents3 = require("@elementor/editor-documents");
var import_editor_panels = require("@elementor/editor-panels");
var import_editor_ui9 = require("@elementor/editor-ui");
var import_editor_v1_adapters3 = require("@elementor/editor-v1-adapters");
var import_icons11 = require("@elementor/icons");
var import_query3 = require("@elementor/query");
var import_store20 = require("@elementor/store");
var import_ui16 = require("@elementor/ui");
var import_i18n15 = require("@wordpress/i18n");

// src/hooks/use-classes-order.ts
var import_store6 = require("@elementor/store");
var useClassesOrder = () => {
  return (0, import_store6.__useSelector)(selectOrder);
};

// src/hooks/use-dirty-state.ts
var import_store8 = require("@elementor/store");
var useDirtyState = () => {
  return (0, import_store8.__useSelector)(selectIsDirty);
};

// src/hooks/use-filters.ts
var import_react3 = require("react");

// src/components/search-and-filter/context.tsx
var React = __toESM(require("react"));
var import_react = require("react");
var import_utils3 = require("@elementor/utils");
var SearchAndFilterContext = (0, import_react.createContext)(void 0);
var INIT_CHECKED_FILTERS = {
  empty: false,
  onThisPage: false,
  unused: false
};
var SearchAndFilterProvider = ({ children }) => {
  const [filters, setFilters] = React.useState(INIT_CHECKED_FILTERS);
  const getInitialSearchValue = () => {
    const storedValue = localStorage.getItem("elementor-global-classes-search");
    if (storedValue) {
      localStorage.removeItem("elementor-global-classes-search");
      return storedValue;
    }
    return "";
  };
  const { debouncedValue, inputValue, handleChange } = (0, import_utils3.useDebounceState)({
    delay: 300,
    initialValue: getInitialSearchValue()
  });
  const onClearSearch = () => {
    handleChange("");
  };
  const onClearFilter = () => {
    setFilters(INIT_CHECKED_FILTERS);
  };
  return /* @__PURE__ */ React.createElement(
    SearchAndFilterContext.Provider,
    {
      value: {
        search: {
          debouncedValue,
          inputValue,
          handleChange,
          onClearSearch
        },
        filters: {
          filters,
          setFilters,
          onClearFilter
        }
      }
    },
    children
  );
};
var useSearchAndFilters = () => {
  const context2 = (0, import_react.useContext)(SearchAndFilterContext);
  if (!context2) {
    throw new Error("useSearchContext must be used within a SearchContextProvider");
  }
  return context2;
};

// src/hooks/use-filtered-css-class-usage.tsx
var import_react2 = require("react");
var import_editor_documents = require("@elementor/editor-documents");

// src/hooks/use-css-class-usage.ts
var import_query2 = require("@elementor/query");
var useCssClassUsage = () => {
  return (0, import_query2.useQuery)({
    queryKey: [QUERY_KEY],
    queryFn: fetchCssClassUsage,
    refetchOnMount: false,
    refetchOnWindowFocus: true
  });
};

// src/hooks/use-empty-css-class.ts
var import_store10 = require("@elementor/store");
var useEmptyCssClass = () => {
  return (0, import_store10.__useSelector)(selectEmptyCssClass);
};
var useAllCssClassesIDs = () => {
  const cssClasses = (0, import_store10.__useSelector)(selectGlobalClasses);
  return Object.keys(cssClasses);
};

// src/hooks/use-filtered-css-class-usage.tsx
var findCssClassKeysByPageID = (data, pageId) => {
  const result = [];
  for (const key in data) {
    data[key].content.forEach((content) => {
      if (+content.pageId === pageId) {
        result.push(key);
      }
    });
  }
  return result;
};
var getUnusedClasses = (usedCssClass, potentialUnused) => {
  const set = new Set(usedCssClass);
  return potentialUnused.filter((cssClass) => !set.has(cssClass));
};
var EMPTY_FILTERED_CSS_CLASS_RESPONSE = {
  empty: [],
  onThisPage: [],
  unused: []
};
var useFilteredCssClassUsage = () => {
  const document = (0, import_editor_documents.__useActiveDocument)();
  const emptyCssClasses = useEmptyCssClass();
  const { data, isLoading } = useCssClassUsage();
  const listOfCssClasses = useAllCssClassesIDs();
  const emptyCssClassesIDs = (0, import_react2.useMemo)(() => emptyCssClasses.map(({ id: id2 }) => id2), [emptyCssClasses]);
  const onThisPage = (0, import_react2.useMemo)(() => {
    if (!data || !document) {
      return [];
    }
    return findCssClassKeysByPageID(data, document.id);
  }, [data, document]);
  const unused = (0, import_react2.useMemo)(() => {
    if (!data) {
      return [];
    }
    return getUnusedClasses(Object.keys(data), listOfCssClasses);
  }, [data, listOfCssClasses]);
  if (isLoading || !data || !document) {
    return EMPTY_FILTERED_CSS_CLASS_RESPONSE;
  }
  return {
    onThisPage,
    unused,
    empty: emptyCssClassesIDs
  };
};

// src/hooks/use-filters.ts
var useFilters = () => {
  const {
    filters: { filters }
  } = useSearchAndFilters();
  const allFilters = useFilteredCssClassUsage();
  return (0, import_react3.useMemo)(() => {
    const activeEntries = Object.entries(filters).filter(([, isActive]) => isActive);
    if (activeEntries.length === 0) {
      return null;
    }
    return activeEntries.reduce((acc, [key], index) => {
      const current = allFilters[key] || [];
      if (index === 0) {
        return current;
      }
      return acc.filter((val) => current.includes(val));
    }, []);
  }, [filters, allFilters]);
};

// src/save-global-classes.tsx
var React3 = __toESM(require("react"));
var import_editor_ui2 = require("@elementor/editor-ui");
var import_store12 = require("@elementor/store");
var import_utils4 = require("@elementor/utils");

// src/components/class-manager/duplicate-label-dialog.tsx
var React2 = __toESM(require("react"));
var import_editor_ui = require("@elementor/editor-ui");
var import_icons = require("@elementor/icons");
var import_ui = require("@elementor/ui");
var import_i18n2 = require("@wordpress/i18n");
var DUP_PREFIX = "DUP_";
var DuplicateLabelDialog = ({
  modifiedLabels,
  onApprove
}) => {
  const handleButtonClick = () => {
    localStorage.setItem("elementor-global-classes-search", DUP_PREFIX);
    onApprove?.();
    (0, import_editor_ui.closeDialog)();
  };
  return /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(import_ui.DialogHeader, { logo: false }, /* @__PURE__ */ React2.createElement(import_ui.Box, { display: "flex", alignItems: "center", gap: 1 }, /* @__PURE__ */ React2.createElement(import_ui.Icon, { color: "secondary" }, /* @__PURE__ */ React2.createElement(import_icons.InfoCircleFilledIcon, { fontSize: "medium" })), /* @__PURE__ */ React2.createElement(import_ui.Typography, { variant: "subtitle1" }, (0, import_i18n2.__)("We've published your page and updated class names.", "elementor")))), /* @__PURE__ */ React2.createElement(import_ui.DialogContent, null, /* @__PURE__ */ React2.createElement(import_ui.Stack, { spacing: 2, direction: "column" }, /* @__PURE__ */ React2.createElement(import_ui.Typography, { variant: "body2" }, (0, import_i18n2.__)(
    "Some new classes used the same names as existing ones. To prevent conflicts, we added the prefix",
    "elementor"
  ), /* @__PURE__ */ React2.createElement("strong", null, " ", DUP_PREFIX)), /* @__PURE__ */ React2.createElement(import_ui.Box, null, /* @__PURE__ */ React2.createElement(
    import_ui.Box,
    {
      sx: {
        width: "100%",
        display: "flex",
        gap: 2,
        alignItems: "flex-start"
      }
    },
    /* @__PURE__ */ React2.createElement(
      import_ui.Typography,
      {
        variant: "subtitle2",
        sx: {
          fontWeight: "bold",
          flex: 1,
          flexShrink: 1,
          flexGrow: 1,
          minWidth: 0
        }
      },
      (0, import_i18n2.__)("Before", "elementor")
    ),
    /* @__PURE__ */ React2.createElement(
      import_ui.Typography,
      {
        variant: "subtitle2",
        sx: {
          minWidth: "200px",
          fontWeight: "bold",
          flexShrink: 0,
          flexGrow: 0,
          width: "200px",
          maxWidth: "200px"
        }
      },
      (0, import_i18n2.__)("After", "elementor")
    )
  ), /* @__PURE__ */ React2.createElement(import_ui.Divider, { sx: { mt: 0.5, mb: 0.5 } }), /* @__PURE__ */ React2.createElement(import_ui.Stack, { direction: "column", gap: 0.5, sx: { pb: 2 } }, Object.values(modifiedLabels).map(({ original, modified }, index) => /* @__PURE__ */ React2.createElement(
    import_ui.Box,
    {
      key: index,
      sx: {
        width: "100%",
        display: "flex",
        gap: 2,
        alignItems: "flex-start"
      }
    },
    /* @__PURE__ */ React2.createElement(
      import_ui.Box,
      {
        sx: {
          flex: 1,
          flexShrink: 1,
          flexGrow: 1,
          minWidth: 0
        }
      },
      /* @__PURE__ */ React2.createElement(import_editor_ui.EllipsisWithTooltip, { title: original }, /* @__PURE__ */ React2.createElement(import_ui.Typography, { variant: "body2", sx: { color: "text.secondary" } }, original))
    ),
    /* @__PURE__ */ React2.createElement(
      import_ui.Box,
      {
        sx: {
          minWidth: "200px",
          flexShrink: 0,
          flexGrow: 0,
          width: "200px",
          maxWidth: "200px"
        }
      },
      /* @__PURE__ */ React2.createElement(import_editor_ui.EllipsisWithTooltip, { title: modified }, /* @__PURE__ */ React2.createElement(import_ui.Typography, { variant: "body2", sx: { color: "text.primary" } }, modified))
    )
  ))), /* @__PURE__ */ React2.createElement(import_ui.Box, null, /* @__PURE__ */ React2.createElement(import_ui.Alert, { severity: "info", size: "small", color: "secondary" }, /* @__PURE__ */ React2.createElement("strong", null, (0, import_i18n2.__)("Your designs and classes are safe.", "elementor")), (0, import_i18n2.__)(
    "Only the prefixes were added. Find them in Class Manager by searching",
    "elementor"
  ), /* @__PURE__ */ React2.createElement("strong", null, DUP_PREFIX)))))), /* @__PURE__ */ React2.createElement(import_ui.DialogActions, null, /* @__PURE__ */ React2.createElement(import_ui.Button, { color: "secondary", variant: "text", onClick: handleButtonClick }, (0, import_i18n2.__)("Go to Class Manager", "elementor")), /* @__PURE__ */ React2.createElement(import_ui.Button, { color: "secondary", variant: "contained", onClick: import_editor_ui.closeDialog }, (0, import_i18n2.__)("Done", "elementor"))));
};

// src/save-global-classes.tsx
async function saveGlobalClasses({ context: context2, onApprove }) {
  const state = selectData((0, import_store12.__getState)());
  const apiAction = context2 === "preview" ? apiClient.saveDraft : apiClient.publish;
  const currentContext = context2 === "preview" ? selectPreviewInitialData : selectFrontendInitialData;
  const response = await apiAction({
    items: state.items,
    order: state.order,
    changes: calculateChanges(state, currentContext((0, import_store12.__getState)()))
  });
  (0, import_store12.__dispatch)(slice.actions.reset({ context: context2 }));
  if (response?.data?.data?.code === API_ERROR_CODES.DUPLICATED_LABEL) {
    (0, import_store12.__dispatch)(slice.actions.updateMultiple(response.data.data.modifiedLabels));
    trackGlobalClasses({
      event: "classPublishConflict",
      numOfConflicts: Object.keys(response.data.data.modifiedLabels).length
    });
    (0, import_editor_ui2.openDialog)({
      component: /* @__PURE__ */ React3.createElement(
        DuplicateLabelDialog,
        {
          modifiedLabels: response.data.data.modifiedLabels || [],
          onApprove
        }
      )
    });
  }
}
function calculateChanges(state, initialData) {
  const stateIds = Object.keys(state.items);
  const initialDataIds = Object.keys(initialData.items);
  return {
    added: stateIds.filter((id2) => !initialDataIds.includes(id2)),
    deleted: initialDataIds.filter((id2) => !stateIds.includes(id2)),
    modified: stateIds.filter((id2) => {
      return id2 in initialData.items && (0, import_utils4.hash)(state.items[id2]) !== (0, import_utils4.hash)(initialData.items[id2]);
    })
  };
}

// src/components/search-and-filter/components/filter/active-filters.tsx
var React6 = __toESM(require("react"));
var import_ui4 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");

// src/components/search-and-filter/components/filter/clear-icon-button.tsx
var React4 = __toESM(require("react"));
var import_icons2 = require("@elementor/icons");
var import_ui2 = require("@elementor/ui");
var ClearIconButton = ({ tooltipText, sx, trigger }) => {
  const {
    filters: { onClearFilter }
  } = useSearchAndFilters();
  const handleClearFilters = () => {
    onClearFilter(trigger);
    trackGlobalClasses({
      event: "classManagerFilterCleared",
      trigger
    });
  };
  return /* @__PURE__ */ React4.createElement(import_ui2.Tooltip, { title: tooltipText, placement: "top", disableInteractive: true }, /* @__PURE__ */ React4.createElement(import_ui2.Box, null, /* @__PURE__ */ React4.createElement(CustomIconButton, { "aria-label": tooltipText, size: "tiny", onClick: handleClearFilters, sx }, /* @__PURE__ */ React4.createElement(import_icons2.BrushBigIcon, { fontSize: "tiny" }))));
};
var CustomIconButton = (0, import_ui2.styled)(import_ui2.IconButton)(({ theme }) => ({
  "&.Mui-disabled": {
    pointerEvents: "auto",
    "&:hover": {
      color: theme.palette.action.disabled
    }
  }
}));

// src/components/search-and-filter/components/filter/filter-list.tsx
var React5 = __toESM(require("react"));
var import_ui3 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");
var filterConfig = {
  unused: (0, import_i18n3.__)("Unused", "elementor"),
  empty: (0, import_i18n3.__)("Empty", "elementor"),
  onThisPage: (0, import_i18n3.__)("On this page", "elementor")
};
var FilterList = () => {
  const {
    filters: { filters, setFilters }
  } = useSearchAndFilters();
  const filteredCssClass = useFilteredCssClassUsage();
  const handleOnClick = (value) => {
    setFilters((prev) => ({ ...prev, [value]: !prev[value] }));
    trackGlobalClasses({
      event: "classManagerFilterUsed",
      action: filters[value] ? "remove" : "apply",
      type: value,
      trigger: "menu"
    });
  };
  return /* @__PURE__ */ React5.createElement(import_ui3.MenuList, null, /* @__PURE__ */ React5.createElement(import_ui3.MenuItem, { onClick: () => handleOnClick("unused") }, /* @__PURE__ */ React5.createElement(
    LabeledCheckbox,
    {
      label: filterConfig.unused,
      checked: filters.unused,
      suffix: /* @__PURE__ */ React5.createElement(import_ui3.Chip, { size: "tiny", sx: { ml: "auto" }, label: filteredCssClass.unused.length })
    }
  )), /* @__PURE__ */ React5.createElement(import_ui3.MenuItem, { onClick: () => handleOnClick("empty") }, /* @__PURE__ */ React5.createElement(
    LabeledCheckbox,
    {
      label: filterConfig.empty,
      checked: filters.empty,
      suffix: /* @__PURE__ */ React5.createElement(import_ui3.Chip, { size: "tiny", sx: { ml: "auto" }, label: filteredCssClass.empty.length })
    }
  )), /* @__PURE__ */ React5.createElement(import_ui3.MenuItem, { onClick: () => handleOnClick("onThisPage") }, /* @__PURE__ */ React5.createElement(
    LabeledCheckbox,
    {
      label: filterConfig.onThisPage,
      checked: filters.onThisPage,
      suffix: /* @__PURE__ */ React5.createElement(import_ui3.Chip, { size: "tiny", sx: { ml: "auto" }, label: filteredCssClass.onThisPage.length })
    }
  )));
};
var LabeledCheckbox = ({ label, suffix, checked }) => /* @__PURE__ */ React5.createElement(import_ui3.Stack, { direction: "row", alignItems: "center", gap: 0.5, flex: 1 }, /* @__PURE__ */ React5.createElement(
  import_ui3.Checkbox,
  {
    size: "small",
    checked,
    sx: {
      padding: 0,
      color: "text.tertiary",
      "&.Mui-checked": {
        color: "text.tertiary"
      }
    }
  }
), /* @__PURE__ */ React5.createElement(import_ui3.Typography, { variant: "caption", sx: { color: "text.secondary" } }, label), suffix);

// src/components/search-and-filter/components/filter/active-filters.tsx
var ActiveFilters = () => {
  const {
    filters: { filters, setFilters }
  } = useSearchAndFilters();
  const handleRemove = (key) => {
    setFilters((prev) => ({ ...prev, [key]: false }));
    trackGlobalClasses({
      event: "classManagerFilterUsed",
      action: "remove",
      type: key,
      trigger: "header"
    });
  };
  const activeKeys = Object.keys(filters).filter((key) => filters[key]);
  const showClearIcon = activeKeys.length > 0;
  return /* @__PURE__ */ React6.createElement(import_ui4.Stack, { direction: "row", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React6.createElement(import_ui4.Stack, { direction: "row", gap: 0.5, alignItems: "center", flexWrap: "wrap" }, activeKeys.map((key) => /* @__PURE__ */ React6.createElement(
    import_ui4.Chip,
    {
      key,
      label: filterConfig[key],
      onDelete: () => handleRemove(key),
      sx: chipSx,
      size: "tiny"
    }
  ))), showClearIcon && /* @__PURE__ */ React6.createElement(
    ClearIconButton,
    {
      trigger: "header",
      tooltipText: (0, import_i18n4.__)("Clear Filters", "elementor"),
      sx: { margin: "0 0 auto auto" }
    }
  ));
};
var chipSx = {
  "& .MuiChip-deleteIcon": {
    display: "none",
    transition: "opacity 0.2s"
  },
  "&:hover .MuiChip-deleteIcon": {
    display: "block"
  }
};

// src/components/search-and-filter/components/filter/css-class-filter.tsx
var React7 = __toESM(require("react"));
var import_editor_ui3 = require("@elementor/editor-ui");
var import_icons3 = require("@elementor/icons");
var import_ui5 = require("@elementor/ui");
var import_i18n5 = require("@wordpress/i18n");
var CssClassFilter = () => {
  const {
    filters: { filters }
  } = useSearchAndFilters();
  const popupState = (0, import_ui5.usePopupState)({
    variant: "popover",
    disableAutoFocus: true
  });
  React7.useEffect(() => {
    if (popupState.isOpen) {
      trackGlobalClasses({
        event: "classManagerFiltersOpened"
      });
    }
  }, [popupState.isOpen]);
  const showCleanIcon = Object.values(filters).some((value) => value);
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(import_ui5.Tooltip, { title: (0, import_i18n5.__)("Filters", "elementor"), placement: "top" }, /* @__PURE__ */ React7.createElement(
    import_ui5.ToggleButton,
    {
      value: "filter",
      size: "tiny",
      selected: popupState.isOpen,
      ...(0, import_ui5.bindToggle)(popupState)
    },
    /* @__PURE__ */ React7.createElement(import_icons3.FilterIcon, { fontSize: "tiny" })
  )), /* @__PURE__ */ React7.createElement(
    import_ui5.Popover,
    {
      sx: {
        maxWidth: "344px"
      },
      anchorOrigin: {
        vertical: "top",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: -21
      },
      ...(0, import_ui5.bindPopover)(popupState)
    },
    /* @__PURE__ */ React7.createElement(
      import_editor_ui3.PopoverHeader,
      {
        actions: showCleanIcon ? [
          /* @__PURE__ */ React7.createElement(
            ClearIconButton,
            {
              trigger: "menu",
              key: "clear-all-button",
              tooltipText: (0, import_i18n5.__)("Clear all", "elementor")
            }
          )
        ] : [],
        onClose: popupState.close,
        title: (0, import_i18n5.__)("Filters", "elementor"),
        icon: /* @__PURE__ */ React7.createElement(import_icons3.FilterIcon, { fontSize: "tiny" })
      }
    ),
    /* @__PURE__ */ React7.createElement(
      import_ui5.Divider,
      {
        sx: {
          borderWidth: "1px 0 0 0"
        }
      }
    ),
    /* @__PURE__ */ React7.createElement(import_editor_ui3.PopoverBody, { width: 344, height: 125 }, /* @__PURE__ */ React7.createElement(FilterList, null))
  ));
};

// src/components/search-and-filter/components/search/class-manager-search.tsx
var React8 = __toESM(require("react"));
var import_icons4 = require("@elementor/icons");
var import_ui6 = require("@elementor/ui");
var import_i18n6 = require("@wordpress/i18n");
var ClassManagerSearch = () => {
  const {
    search: { inputValue, handleChange }
  } = useSearchAndFilters();
  return /* @__PURE__ */ React8.createElement(import_ui6.Stack, { direction: "row", gap: 0.5, sx: { width: "100%" } }, /* @__PURE__ */ React8.createElement(import_ui6.Box, { sx: { flexGrow: 1 } }, /* @__PURE__ */ React8.createElement(
    import_ui6.TextField,
    {
      role: "search",
      fullWidth: true,
      size: "tiny",
      value: inputValue,
      onFocus: () => {
        trackGlobalClasses({
          event: "classManagerSearched"
        });
      },
      placeholder: (0, import_i18n6.__)("Search", "elementor"),
      onChange: (e) => handleChange(e.target.value),
      InputProps: {
        startAdornment: /* @__PURE__ */ React8.createElement(import_ui6.InputAdornment, { position: "start" }, /* @__PURE__ */ React8.createElement(import_icons4.SearchIcon, { fontSize: "tiny" }))
      }
    }
  )));
};

// src/components/class-manager/class-manager-introduction.tsx
var React9 = __toESM(require("react"));
var import_react4 = require("react");
var import_editor_current_user = require("@elementor/editor-current-user");
var import_editor_ui4 = require("@elementor/editor-ui");
var import_ui7 = require("@elementor/ui");
var import_i18n7 = require("@wordpress/i18n");
var MESSAGE_KEY = "global-class-manager";
var ClassManagerIntroduction = () => {
  const [isMessageSuppressed, suppressMessage] = (0, import_editor_current_user.useSuppressedMessage)(MESSAGE_KEY);
  const [shouldShowIntroduction, setShouldShowIntroduction] = (0, import_react4.useState)(!isMessageSuppressed);
  return /* @__PURE__ */ React9.createElement(
    import_editor_ui4.IntroductionModal,
    {
      open: shouldShowIntroduction,
      title: (0, import_i18n7.__)("Class Manager", "elementor"),
      handleClose: (shouldShowAgain) => {
        if (!shouldShowAgain) {
          suppressMessage();
        }
        setShouldShowIntroduction(false);
      }
    },
    /* @__PURE__ */ React9.createElement(
      import_ui7.Image,
      {
        sx: { width: "100%", aspectRatio: "16 / 9" },
        src: "https://assets.elementor.com/packages/v1/images/class-manager-intro.svg",
        alt: ""
      }
    ),
    /* @__PURE__ */ React9.createElement(IntroductionContent, null)
  );
};
var IntroductionContent = () => {
  return /* @__PURE__ */ React9.createElement(import_ui7.Box, { p: 3 }, /* @__PURE__ */ React9.createElement(import_ui7.Typography, { variant: "body2" }, (0, import_i18n7.__)(
    "The Class Manager lets you see all the classes you've created, plus adjust their priority, rename them, and delete unused classes to keep your CSS structured.",
    "elementor"
  )), /* @__PURE__ */ React9.createElement("br", null), /* @__PURE__ */ React9.createElement(import_ui7.Typography, { variant: "body2" }, (0, import_i18n7.__)(
    "Remember, when editing an item within a specific class, any changes you make will apply across all elements in that class.",
    "elementor"
  )));
};

// src/components/class-manager/delete-class.ts
var import_store14 = require("@elementor/store");
var isDeleted = false;
var deleteClass = (id2) => {
  trackGlobalClasses({
    event: "classDeleted",
    classId: id2,
    runAction: () => {
      (0, import_store14.__dispatch)(slice.actions.delete(id2));
      isDeleted = true;
    }
  });
};
var onDelete = async () => {
  isDeleted = false;
};
var hasDeletedItems = () => isDeleted;

// src/components/class-manager/flipped-color-swatch-icon.tsx
var React10 = __toESM(require("react"));
var import_icons5 = require("@elementor/icons");
var FlippedColorSwatchIcon = ({ sx, ...props }) => /* @__PURE__ */ React10.createElement(import_icons5.ColorSwatchIcon, { sx: { transform: "rotate(90deg)", ...sx }, ...props });

// src/components/class-manager/global-classes-list.tsx
var React17 = __toESM(require("react"));
var import_react7 = require("react");
var import_store18 = require("@elementor/store");
var import_ui14 = require("@elementor/ui");
var import_i18n13 = require("@wordpress/i18n");

// src/hooks/use-ordered-classes.ts
var import_store16 = require("@elementor/store");
var useOrderedClasses = () => {
  return (0, import_store16.__useSelector)(selectOrderedClasses);
};

// src/components/class-manager/class-item.tsx
var React15 = __toESM(require("react"));
var import_react6 = require("react");
var import_editor_styles_repository2 = require("@elementor/editor-styles-repository");
var import_editor_ui8 = require("@elementor/editor-ui");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
var import_icons9 = require("@elementor/icons");
var import_ui12 = require("@elementor/ui");
var import_i18n11 = require("@wordpress/i18n");

// src/components/css-class-usage/components/css-class-usage-popover.tsx
var React11 = __toESM(require("react"));
var import_editor_documents2 = require("@elementor/editor-documents");
var import_editor_ui5 = require("@elementor/editor-ui");
var import_icons6 = require("@elementor/icons");
var import_ui8 = require("@elementor/ui");
var import_i18n8 = require("@wordpress/i18n");

// src/hooks/use-css-class-usage-by-id.ts
var EMPTY_CLASS_USAGE = {
  total: 0,
  content: []
};
var useCssClassUsageByID = (id2) => {
  const { data, ...rest } = useCssClassUsage();
  const classData = data?.[id2] ?? EMPTY_CLASS_USAGE;
  return { ...rest, data: classData };
};

// src/components/css-class-usage/components/css-class-usage-popover.tsx
var iconMapper = {
  "wp-post": {
    label: (0, import_i18n8.__)("Post", "elementor"),
    icon: /* @__PURE__ */ React11.createElement(import_icons6.PostTypeIcon, { fontSize: "inherit" })
  },
  "wp-page": {
    label: (0, import_i18n8.__)("Page", "elementor"),
    icon: /* @__PURE__ */ React11.createElement(import_icons6.PagesIcon, { fontSize: "inherit" })
  },
  popup: {
    label: (0, import_i18n8.__)("Popup", "elementor"),
    icon: /* @__PURE__ */ React11.createElement(import_icons6.PopupTemplateIcon, { fontSize: "inherit" })
  },
  header: {
    label: (0, import_i18n8.__)("Header", "elementor"),
    icon: /* @__PURE__ */ React11.createElement(import_icons6.HeaderTemplateIcon, { fontSize: "inherit" })
  },
  footer: {
    label: (0, import_i18n8.__)("Footer", "elementor"),
    icon: /* @__PURE__ */ React11.createElement(import_icons6.FooterTemplateIcon, { fontSize: "inherit" })
  }
};
var CssClassUsagePopover = ({
  cssClassID,
  onClose
}) => {
  const { data: classUsage } = useCssClassUsageByID(cssClassID);
  const onNavigate = (0, import_editor_documents2.__useOpenDocumentInNewTab)();
  const cssClassUsageRecords = classUsage?.content.map(
    ({ title, elements, pageId, type }) => ({
      type: "item",
      value: pageId,
      label: title,
      secondaryText: elements.length.toString(),
      docType: type
    })
  ) ?? [];
  const handleSelect = (value) => {
    onNavigate(+value);
    trackGlobalClasses({
      event: "classUsageLocate",
      classId: cssClassID
    });
  };
  return /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement(
    import_editor_ui5.PopoverHeader,
    {
      icon: /* @__PURE__ */ React11.createElement(import_icons6.CurrentLocationIcon, { fontSize: "tiny" }),
      title: /* @__PURE__ */ React11.createElement(import_ui8.Stack, { flexDirection: "row", gap: 1, alignItems: "center" }, /* @__PURE__ */ React11.createElement(import_ui8.Box, { "aria-label": "header-title" }, (0, import_i18n8.__)("Locator", "elementor")), /* @__PURE__ */ React11.createElement(import_ui8.Box, null, /* @__PURE__ */ React11.createElement(import_ui8.Chip, { sx: { lineHeight: 1 }, size: "tiny", label: classUsage.total }))),
      onClose
    }
  ), /* @__PURE__ */ React11.createElement(import_ui8.Divider, null), /* @__PURE__ */ React11.createElement(import_editor_ui5.PopoverBody, { width: 300 }, /* @__PURE__ */ React11.createElement(
    import_editor_ui5.PopoverMenuList,
    {
      onSelect: handleSelect,
      items: cssClassUsageRecords,
      onClose: () => {
      },
      menuListTemplate: StyledCssClassUsageItem,
      menuItemContentTemplate: (cssClassUsageRecord) => /* @__PURE__ */ React11.createElement(import_ui8.Stack, { flexDirection: "row", flex: 1, alignItems: "center" }, /* @__PURE__ */ React11.createElement(import_ui8.Box, { display: "flex", sx: { pr: 1 } }, /* @__PURE__ */ React11.createElement(
        import_ui8.Tooltip,
        {
          disableInteractive: true,
          title: iconMapper?.[cssClassUsageRecord.docType]?.label ?? cssClassUsageRecord.docType,
          placement: "top"
        },
        /* @__PURE__ */ React11.createElement(import_ui8.Icon, { fontSize: "small" }, iconMapper?.[cssClassUsageRecord.docType]?.icon || /* @__PURE__ */ React11.createElement(import_icons6.PagesIcon, { fontSize: "inherit" }))
      )), /* @__PURE__ */ React11.createElement(import_ui8.Box, { sx: { pr: 0.5, maxWidth: "173px" }, display: "flex" }, /* @__PURE__ */ React11.createElement(
        import_editor_ui5.EllipsisWithTooltip,
        {
          title: cssClassUsageRecord.label,
          as: import_ui8.Typography,
          variant: "caption",
          maxWidth: "173px",
          sx: {
            lineHeight: 1
          }
        }
      )), /* @__PURE__ */ React11.createElement(import_icons6.ExternalLinkIcon, { className: "hover-only-icon", fontSize: "tiny" }), /* @__PURE__ */ React11.createElement(
        import_ui8.Chip,
        {
          sx: {
            ml: "auto"
          },
          size: "tiny",
          label: cssClassUsageRecord.secondaryText
        }
      ))
    }
  )));
};
var StyledCssClassUsageItem = (0, import_ui8.styled)(import_ui8.MenuList)(({ theme }) => ({
  "& > li": {
    display: "flex",
    cursor: "pointer",
    height: 32,
    width: "100%"
  },
  '& > [role="option"]': {
    ...theme.typography.caption,
    lineHeight: "inherit",
    padding: theme.spacing(0.5, 1, 0.5, 2),
    textOverflow: "ellipsis",
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 1,
    ".hover-only-icon": {
      color: theme.palette.text.disabled,
      opacity: 0
    },
    "&:hover": {
      borderRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.action.hover,
      ".hover-only-icon": {
        color: theme.palette.text.disabled,
        opacity: 1
      }
    }
  },
  width: "100%",
  position: "relative"
}));

// src/components/css-class-usage/components/css-class-usage-trigger.tsx
var React12 = __toESM(require("react"));
var import_editor_ui6 = require("@elementor/editor-ui");
var import_icons7 = require("@elementor/icons");
var import_ui9 = require("@elementor/ui");
var import_i18n9 = require("@wordpress/i18n");
var CssClassUsageTrigger = ({ id: id2, onClick }) => {
  const {
    data: { total },
    isLoading
  } = useCssClassUsageByID(id2);
  const cssClassUsagePopover = (0, import_ui9.usePopupState)({ variant: "popover", popupId: "css-class-usage-popover" });
  if (isLoading) {
    return null;
  }
  const WrapperComponent = total !== 0 ? TooltipWrapper : InfoAlertMessage;
  const handleMouseEnter = () => {
    trackGlobalClasses({
      event: "classUsageHovered",
      classId: id2,
      usage: total
    });
  };
  const handleClick = (e) => {
    if (total !== 0) {
      (0, import_ui9.bindTrigger)(cssClassUsagePopover).onClick(e);
      onClick(id2);
      trackGlobalClasses({
        event: "classUsageClicked",
        classId: id2
      });
    }
  };
  return /* @__PURE__ */ React12.createElement(React12.Fragment, null, /* @__PURE__ */ React12.createElement(import_ui9.Box, { position: "relative", onMouseEnter: handleMouseEnter }, /* @__PURE__ */ React12.createElement(WrapperComponent, { total }, /* @__PURE__ */ React12.createElement(
    CustomIconButton2,
    {
      disabled: total === 0,
      size: "tiny",
      ...(0, import_ui9.bindTrigger)(cssClassUsagePopover),
      onClick: handleClick
    },
    /* @__PURE__ */ React12.createElement(import_icons7.CurrentLocationIcon, { fontSize: "tiny" })
  ))), /* @__PURE__ */ React12.createElement(import_ui9.Box, null, /* @__PURE__ */ React12.createElement(
    import_ui9.Popover,
    {
      anchorOrigin: {
        vertical: "center",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: 15,
        horizontal: -50
      },
      ...(0, import_ui9.bindPopover)(cssClassUsagePopover),
      onClose: () => {
        (0, import_ui9.bindPopover)(cssClassUsagePopover).onClose();
        onClick("");
      }
    },
    /* @__PURE__ */ React12.createElement(
      CssClassUsagePopover,
      {
        onClose: cssClassUsagePopover.close,
        "aria-label": "css-class-usage-popover",
        cssClassID: id2
      }
    )
  )));
};
var CustomIconButton2 = (0, import_ui9.styled)(import_ui9.IconButton)(({ theme }) => ({
  "&.Mui-disabled": {
    pointerEvents: "auto",
    // Enable hover
    "&:hover": {
      color: theme.palette.action.disabled
      // optional
    }
  },
  height: "22px",
  width: "22px"
}));
var TooltipWrapper = ({ children, total }) => /* @__PURE__ */ React12.createElement(
  import_ui9.Tooltip,
  {
    disableInteractive: true,
    placement: "top",
    title: `${(0, import_i18n9.__)("Show {{number}} {{locations}}", "elementor").replace("{{number}}", total.toString()).replace(
      "{{locations}}",
      total === 1 ? (0, import_i18n9.__)("location", "elementor") : (0, import_i18n9.__)("locations", "elementor")
    )}`
  },
  /* @__PURE__ */ React12.createElement("span", null, children)
);
var InfoAlertMessage = ({ children }) => /* @__PURE__ */ React12.createElement(
  import_ui9.Infotip,
  {
    disableInteractive: true,
    placement: "top",
    color: "secondary",
    content: /* @__PURE__ */ React12.createElement(import_editor_ui6.InfoAlert, { sx: { mt: 1 } }, (0, import_i18n9.__)("This class isn\u2019t being used yet.", "elementor"))
  },
  /* @__PURE__ */ React12.createElement("span", null, children)
);

// src/components/class-manager/delete-confirmation-dialog.tsx
var React13 = __toESM(require("react"));
var import_react5 = require("react");
var import_editor_ui7 = require("@elementor/editor-ui");
var import_ui10 = require("@elementor/ui");
var import_i18n10 = require("@wordpress/i18n");
var context = (0, import_react5.createContext)(null);
var DeleteConfirmationProvider = ({ children }) => {
  const [dialogProps, setDialogProps] = (0, import_react5.useState)(null);
  const openDialog2 = (props) => {
    setDialogProps(props);
  };
  const closeDialog2 = () => {
    setDialogProps(null);
  };
  return /* @__PURE__ */ React13.createElement(context.Provider, { value: { openDialog: openDialog2, closeDialog: closeDialog2, dialogProps } }, children, !!dialogProps && /* @__PURE__ */ React13.createElement(DeleteClassDialog, { ...dialogProps }));
};
var DeleteClassDialog = ({ label, id: id2 }) => {
  const { closeDialog: closeDialog2 } = useDeleteConfirmation();
  const {
    data: { total, content }
  } = useCssClassUsageByID(id2);
  const handleConfirm = () => {
    closeDialog2();
    deleteClass(id2);
  };
  const text = total && content.length ? (0, import_i18n10.__)(
    "Will permanently remove it from your project and may affect the design across all elements using it. Used %1 times across %2 pages. This action cannot be undone.",
    "elementor"
  ).replace("%1", total.toString()).replace("%2", content.length.toString()) : (0, import_i18n10.__)(
    "Will permanently remove it from your project and may affect the design across all elements using it. This action cannot be undone.",
    "elementor"
  );
  return /* @__PURE__ */ React13.createElement(import_editor_ui7.ConfirmationDialog, { open: true, onClose: closeDialog2 }, /* @__PURE__ */ React13.createElement(import_editor_ui7.ConfirmationDialog.Title, null, (0, import_i18n10.__)("Delete this class?", "elementor")), /* @__PURE__ */ React13.createElement(import_editor_ui7.ConfirmationDialog.Content, null, /* @__PURE__ */ React13.createElement(import_editor_ui7.ConfirmationDialog.ContentText, null, (0, import_i18n10.__)("Deleting", "elementor"), /* @__PURE__ */ React13.createElement(import_ui10.Typography, { variant: "subtitle2", component: "span" }, "\xA0", label, "\xA0"), text)), /* @__PURE__ */ React13.createElement(import_editor_ui7.ConfirmationDialog.Actions, { onClose: closeDialog2, onConfirm: handleConfirm }));
};
var useDeleteConfirmation = () => {
  const contextValue = (0, import_react5.useContext)(context);
  if (!contextValue) {
    throw new Error("useDeleteConfirmation must be used within a DeleteConfirmationProvider");
  }
  return contextValue;
};

// src/components/class-manager/sortable.tsx
var React14 = __toESM(require("react"));
var import_icons8 = require("@elementor/icons");
var import_ui11 = require("@elementor/ui");
var SortableProvider = (props) => /* @__PURE__ */ React14.createElement(import_ui11.UnstableSortableProvider, { restrictAxis: true, variant: "static", dragPlaceholderStyle: { opacity: "1" }, ...props });
var SortableTrigger = (props) => /* @__PURE__ */ React14.createElement(StyledSortableTrigger, { ...props, role: "button", className: "class-item-sortable-trigger", "aria-label": "sort" }, /* @__PURE__ */ React14.createElement(import_icons8.GripVerticalIcon, { fontSize: "tiny" }));
var SortableItem = ({ children, id: id2, ...props }) => {
  return /* @__PURE__ */ React14.createElement(
    import_ui11.UnstableSortableItem,
    {
      ...props,
      id: id2,
      render: ({
        itemProps,
        isDragged,
        triggerProps,
        itemStyle,
        triggerStyle,
        dropIndicationStyle,
        showDropIndication,
        isDragOverlay,
        isDragPlaceholder
      }) => {
        return /* @__PURE__ */ React14.createElement(
          import_ui11.Box,
          {
            ...itemProps,
            style: itemStyle,
            component: "li",
            role: "listitem",
            sx: {
              backgroundColor: isDragOverlay ? "background.paper" : void 0
            }
          },
          children({
            itemProps,
            isDragged,
            triggerProps,
            itemStyle,
            triggerStyle,
            isDragPlaceholder
          }),
          showDropIndication && /* @__PURE__ */ React14.createElement(SortableItemIndicator, { style: dropIndicationStyle })
        );
      }
    }
  );
};
var StyledSortableTrigger = (0, import_ui11.styled)("div")(({ theme }) => ({
  position: "absolute",
  left: 0,
  top: "50%",
  transform: `translate( -${theme.spacing(1.5)}, -50% )`,
  color: theme.palette.action.active
}));
var SortableItemIndicator = (0, import_ui11.styled)(import_ui11.Box)`
	width: 100%;
	height: 1px;
	background-color: ${({ theme }) => theme.palette.text.primary};
`;

// src/components/class-manager/class-item.tsx
var ClassItem = ({
  id: id2,
  label,
  renameClass,
  selected,
  disabled,
  sortableTriggerProps,
  showSortIndicator,
  syncToV3,
  onToggleSync
}) => {
  const itemRef = (0, import_react6.useRef)(null);
  const {
    ref: editableRef,
    openEditMode,
    isEditing,
    error,
    getProps: getEditableProps
  } = (0, import_editor_ui8.useEditable)({
    value: label,
    onSubmit: renameClass,
    validation: validateLabel
  });
  const [selectedCssUsage, setSelectedCssUsage] = (0, import_react6.useState)("");
  const { openDialog: openDialog2 } = useDeleteConfirmation();
  const popupState = (0, import_ui12.usePopupState)({
    variant: "popover",
    disableAutoFocus: true
  });
  const isSelected = (selectedCssUsage === id2 || selected || popupState.isOpen) && !disabled;
  return /* @__PURE__ */ React15.createElement(React15.Fragment, null, /* @__PURE__ */ React15.createElement(import_ui12.Stack, { p: 0 }, /* @__PURE__ */ React15.createElement(
    import_editor_ui8.WarningInfotip,
    {
      open: Boolean(error),
      text: error ?? "",
      placement: "bottom",
      width: itemRef.current?.getBoundingClientRect().width,
      offset: [0, -15]
    },
    /* @__PURE__ */ React15.createElement(
      StyledListItemButton,
      {
        ref: itemRef,
        dense: true,
        disableGutters: true,
        showSortIndicator,
        showActions: isSelected || isEditing,
        shape: "rounded",
        onDoubleClick: openEditMode,
        selected: isSelected,
        disabled,
        focusVisibleClassName: "visible-class-item"
      },
      /* @__PURE__ */ React15.createElement(SortableTrigger, { ...sortableTriggerProps }),
      /* @__PURE__ */ React15.createElement(Indicator, { isActive: isEditing, isError: !!error }, isEditing ? /* @__PURE__ */ React15.createElement(
        import_editor_ui8.EditableField,
        {
          ref: editableRef,
          as: import_ui12.Typography,
          variant: "caption",
          ...getEditableProps()
        }
      ) : /* @__PURE__ */ React15.createElement(import_editor_ui8.EllipsisWithTooltip, { title: label, as: import_ui12.Typography, variant: "caption" })),
      /* @__PURE__ */ React15.createElement(import_ui12.Box, { className: "class-item-locator" }, /* @__PURE__ */ React15.createElement(CssClassUsageTrigger, { id: id2, onClick: setSelectedCssUsage })),
      /* @__PURE__ */ React15.createElement(
        import_ui12.Tooltip,
        {
          placement: "top",
          className: "class-item-more-actions",
          title: (0, import_i18n11.__)("More actions", "elementor")
        },
        /* @__PURE__ */ React15.createElement(import_ui12.IconButton, { size: "tiny", ...(0, import_ui12.bindTrigger)(popupState), "aria-label": "More actions" }, /* @__PURE__ */ React15.createElement(import_icons9.DotsVerticalIcon, { fontSize: "tiny" }))
      )
    )
  )), /* @__PURE__ */ React15.createElement(
    import_ui12.Menu,
    {
      ...(0, import_ui12.bindMenu)(popupState),
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right"
      }
    },
    /* @__PURE__ */ React15.createElement(
      import_editor_ui8.MenuListItem,
      {
        sx: { minWidth: "160px" },
        onClick: () => {
          popupState.close();
          openEditMode();
        }
      },
      /* @__PURE__ */ React15.createElement(import_ui12.Typography, { variant: "caption", sx: { color: "text.primary" } }, (0, import_i18n11.__)("Rename", "elementor"))
    ),
    (0, import_editor_v1_adapters2.isExperimentActive)("e_design_system_sync") && onToggleSync && /* @__PURE__ */ React15.createElement(
      import_editor_ui8.MenuListItem,
      {
        onClick: () => {
          popupState.close();
          onToggleSync(id2, !syncToV3);
        }
      },
      /* @__PURE__ */ React15.createElement(import_ui12.Typography, { variant: "caption", sx: { color: "text.primary" } }, syncToV3 ? (0, import_i18n11.__)("Stop syncing to Version 3", "elementor") : (0, import_i18n11.__)("Sync to Version 3", "elementor"))
    ),
    /* @__PURE__ */ React15.createElement(
      import_editor_ui8.MenuListItem,
      {
        onClick: () => {
          popupState.close();
          openDialog2({ id: id2, label });
        }
      },
      /* @__PURE__ */ React15.createElement(import_ui12.Typography, { variant: "caption", sx: { color: "error.light" } }, (0, import_i18n11.__)("Delete", "elementor"))
    )
  ));
};
var StyledListItemButton = (0, import_ui12.styled)(import_ui12.ListItemButton, {
  shouldForwardProp: (prop) => !["showActions", "showSortIndicator"].includes(prop)
})(
  ({ showActions, showSortIndicator }) => `
    min-height: 36px;

    &.visible-class-item {
      box-shadow: none !important;
    }

    .class-item-locator {
      visibility: hidden;
    }

    .class-item-sortable-trigger {
      visibility: ${showSortIndicator && showActions ? "visible" : "hidden"};
    }

    &:hover:not(:disabled) {
      .class-item-locator {
        visibility: visible;
      }

      .class-item-sortable-trigger {
        visibility: ${showSortIndicator ? "visible" : "hidden"};
      }
    }
  `
);
var Indicator = (0, import_ui12.styled)(import_ui12.Box, {
  shouldForwardProp: (prop) => !["isActive", "isError"].includes(prop)
})(({ theme, isActive, isError }) => ({
  display: "flex",
  width: "100%",
  flexGrow: 1,
  borderRadius: theme.spacing(0.5),
  border: getIndicatorBorder({ isActive, isError, theme }),
  padding: `0 ${theme.spacing(1)}`,
  marginLeft: isActive ? theme.spacing(1) : 0,
  minWidth: 0
}));
var getIndicatorBorder = ({ isActive, isError, theme }) => {
  if (isError) {
    return `2px solid ${theme.palette.error.main}`;
  }
  if (isActive) {
    return `2px solid ${theme.palette.secondary.main}`;
  }
  return "none";
};
var validateLabel = (newLabel) => {
  const result = (0, import_editor_styles_repository2.validateStyleLabel)(newLabel, "rename");
  if (result.isValid) {
    return null;
  }
  return result.errorMessage;
};

// src/components/class-manager/not-found.tsx
var React16 = __toESM(require("react"));
var import_icons10 = require("@elementor/icons");
var import_ui13 = require("@elementor/ui");
var import_i18n12 = require("@wordpress/i18n");
var getNotFoundType = (searchValue, filters, filteredClasses) => {
  const searchNotFound = filteredClasses.length <= 0 && searchValue.length > 1;
  const filterNotFound = filters && filters.length === 0;
  const filterAndSearchNotFound = searchNotFound && filterNotFound;
  if (filterAndSearchNotFound) {
    return "filterAndSearch";
  }
  if (searchNotFound) {
    return "search";
  }
  if (filterNotFound) {
    return "filter";
  }
  return void 0;
};
var notFound = {
  filterAndSearch: {
    mainText: (0, import_i18n12.__)("Sorry, nothing matched.", "elementor"),
    sceneryText: (0, import_i18n12.__)("Try something else.", "elementor"),
    icon: /* @__PURE__ */ React16.createElement(import_icons10.PhotoIcon, { color: "inherit", fontSize: "large" })
  },
  search: {
    mainText: (0, import_i18n12.__)("Sorry, nothing matched", "elementor"),
    sceneryText: (0, import_i18n12.__)("Clear your input and try something else.", "elementor"),
    icon: /* @__PURE__ */ React16.createElement(import_icons10.PhotoIcon, { color: "inherit", fontSize: "large" })
  },
  filter: {
    mainText: (0, import_i18n12.__)("Sorry, nothing matched that search.", "elementor"),
    sceneryText: (0, import_i18n12.__)("Clear the filters and try something else.", "elementor"),
    icon: /* @__PURE__ */ React16.createElement(import_icons10.ColorSwatchIcon, { color: "inherit", fontSize: "large" })
  }
};
var NotFound = ({ notFoundType }) => {
  const {
    search: { onClearSearch, inputValue },
    filters: { onClearFilter }
  } = useSearchAndFilters();
  switch (notFoundType) {
    case "filter":
      return /* @__PURE__ */ React16.createElement(NotFoundLayout, { ...notFound.filter, onClear: onClearFilter });
    case "search":
      return /* @__PURE__ */ React16.createElement(NotFoundLayout, { ...notFound.search, searchValue: inputValue, onClear: onClearSearch });
    case "filterAndSearch":
      return /* @__PURE__ */ React16.createElement(
        NotFoundLayout,
        {
          ...notFound.filterAndSearch,
          onClear: () => {
            onClearFilter();
            onClearSearch();
          }
        }
      );
  }
};
var NotFoundLayout = ({ onClear, searchValue, mainText, sceneryText, icon }) => /* @__PURE__ */ React16.createElement(
  import_ui13.Stack,
  {
    color: "text.secondary",
    pt: 5,
    alignItems: "center",
    gap: 1,
    overflow: "hidden",
    justifySelf: "center"
  },
  icon,
  /* @__PURE__ */ React16.createElement(
    import_ui13.Box,
    {
      sx: {
        width: "100%"
      }
    },
    /* @__PURE__ */ React16.createElement(import_ui13.Typography, { align: "center", variant: "subtitle2", color: "inherit" }, mainText),
    searchValue && /* @__PURE__ */ React16.createElement(
      import_ui13.Typography,
      {
        variant: "subtitle2",
        color: "inherit",
        sx: {
          display: "flex",
          width: "100%",
          justifyContent: "center"
        }
      },
      /* @__PURE__ */ React16.createElement("span", null, "\u201C"),
      /* @__PURE__ */ React16.createElement(
        "span",
        {
          style: {
            maxWidth: "80%",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }
        },
        searchValue
      ),
      /* @__PURE__ */ React16.createElement("span", null, "\u201D.")
    )
  ),
  /* @__PURE__ */ React16.createElement(import_ui13.Typography, { align: "center", variant: "caption", color: "inherit" }, sceneryText),
  /* @__PURE__ */ React16.createElement(import_ui13.Typography, { align: "center", variant: "caption", color: "inherit" }, /* @__PURE__ */ React16.createElement(import_ui13.Link, { color: "secondary", variant: "caption", component: "button", onClick: onClear }, (0, import_i18n12.__)("Clear & try again", "elementor")))
);

// src/components/class-manager/global-classes-list.tsx
var GlobalClassesList = ({ disabled, onStopSyncRequest, onStartSyncRequest }) => {
  const {
    search: { debouncedValue: searchValue }
  } = useSearchAndFilters();
  const cssClasses = useOrderedClasses();
  const dispatch5 = (0, import_store18.__useDispatch)();
  const filters = useFilters();
  const [draggedItemId, setDraggedItemId] = React17.useState(null);
  const draggedItemLabel = cssClasses.find((cssClass) => cssClass.id === draggedItemId)?.label ?? "";
  const [classesOrder, reorderClasses] = useReorder(draggedItemId, setDraggedItemId, draggedItemLabel ?? "");
  const filteredCssClasses = useFilteredCssClasses();
  (0, import_react7.useEffect)(() => {
    const handler2 = (event) => {
      if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
        event.stopImmediatePropagation();
        event.preventDefault();
        if (event.shiftKey) {
          dispatch5(slice.actions.redo());
          return;
        }
        dispatch5(slice.actions.undo());
      }
    };
    window.addEventListener("keydown", handler2, {
      capture: true
    });
    return () => window.removeEventListener("keydown", handler2);
  }, [dispatch5]);
  if (!cssClasses?.length) {
    return /* @__PURE__ */ React17.createElement(EmptyState, null);
  }
  const notFoundType = getNotFoundType(searchValue, filters, filteredCssClasses);
  if (notFoundType) {
    return /* @__PURE__ */ React17.createElement(NotFound, { notFoundType });
  }
  const isFiltersApplied = filters?.length || searchValue;
  const allowSorting = filteredCssClasses.length > 1 && !isFiltersApplied;
  return /* @__PURE__ */ React17.createElement(DeleteConfirmationProvider, null, /* @__PURE__ */ React17.createElement(import_ui14.List, { sx: { display: "flex", flexDirection: "column", gap: 0.5 } }, /* @__PURE__ */ React17.createElement(
    SortableProvider,
    {
      value: classesOrder,
      onChange: reorderClasses,
      disableDragOverlay: !allowSorting
    },
    filteredCssClasses?.map((cssClass) => /* @__PURE__ */ React17.createElement(SortableItem, { key: cssClass.id, id: cssClass.id }, ({ isDragged, isDragPlaceholder, triggerProps, triggerStyle }) => {
      if (isDragged && !draggedItemId) {
        setDraggedItemId(cssClass.id);
      }
      return /* @__PURE__ */ React17.createElement(
        ClassItem,
        {
          id: cssClass.id,
          label: cssClass.label,
          renameClass: (newLabel) => {
            trackGlobalClasses({
              event: "classRenamed",
              classId: cssClass.id,
              oldValue: cssClass.label,
              newValue: newLabel,
              source: "class-manager"
            });
            dispatch5(
              slice.actions.update({
                style: {
                  id: cssClass.id,
                  label: newLabel
                }
              })
            );
          },
          selected: isDragged,
          disabled: disabled || isDragPlaceholder,
          sortableTriggerProps: {
            ...triggerProps,
            style: triggerStyle
          },
          showSortIndicator: allowSorting,
          syncToV3: cssClass.sync_to_v3,
          onToggleSync: (id2, newValue) => {
            if (!newValue && onStopSyncRequest) {
              onStopSyncRequest(id2);
            } else if (newValue && onStartSyncRequest) {
              onStartSyncRequest(id2);
            } else {
              dispatch5(
                slice.actions.update({
                  style: {
                    id: id2,
                    sync_to_v3: newValue
                  }
                })
              );
            }
          }
        }
      );
    }))
  )));
};
var EmptyState = () => /* @__PURE__ */ React17.createElement(import_ui14.Stack, { alignItems: "center", gap: 1.5, pt: 10, px: 0.5, maxWidth: "260px", margin: "auto" }, /* @__PURE__ */ React17.createElement(FlippedColorSwatchIcon, { fontSize: "large" }), /* @__PURE__ */ React17.createElement(StyledHeader, { variant: "subtitle2", component: "h2", color: "text.secondary" }, (0, import_i18n13.__)("There are no global classes yet.", "elementor")), /* @__PURE__ */ React17.createElement(import_ui14.Typography, { align: "center", variant: "caption", color: "text.secondary" }, (0, import_i18n13.__)(
  "CSS classes created in the editor panel will appear here. Once they are available, you can arrange their hierarchy, rename them, or delete them as needed.",
  "elementor"
)));
var StyledHeader = (0, import_ui14.styled)(import_ui14.Typography)(({ theme, variant }) => ({
  "&.MuiTypography-root": {
    ...theme.typography[variant]
  }
}));
var useReorder = (draggedItemId, setDraggedItemId, draggedItemLabel) => {
  const dispatch5 = (0, import_store18.__useDispatch)();
  const order = useClassesOrder();
  const reorder = (newIds) => {
    dispatch5(slice.actions.setOrder(newIds));
    if (draggedItemId) {
      trackGlobalClasses({
        event: "classManagerReorder",
        classId: draggedItemId,
        classTitle: draggedItemLabel
      });
      setDraggedItemId(null);
    }
  };
  return [order, reorder];
};
var useFilteredCssClasses = () => {
  const cssClasses = useOrderedClasses();
  const {
    search: { debouncedValue: searchValue }
  } = useSearchAndFilters();
  const filters = useFilters();
  const lowercaseLabels = (0, import_react7.useMemo)(
    () => cssClasses.map((cssClass) => ({
      ...cssClass,
      lowerLabel: cssClass.label.toLowerCase()
    })),
    [cssClasses]
  );
  const filteredClasses = (0, import_react7.useMemo)(() => {
    if (searchValue.length > 1) {
      return lowercaseLabels.filter((cssClass) => cssClass.lowerLabel.includes(searchValue.toLowerCase()));
    }
    return cssClasses;
  }, [searchValue, cssClasses, lowercaseLabels]);
  return (0, import_react7.useMemo)(() => {
    if (filters && filters.length > 0) {
      return filteredClasses.filter((cssClass) => filters.includes(cssClass.id));
    }
    return filteredClasses;
  }, [filteredClasses, filters]);
};

// src/components/class-manager/panel-interactions.ts
function blockPanelInteractions() {
  const extendedWindow = window;
  extendedWindow.$e?.components?.get?.("panel")?.blockUserInteractions?.();
}
function unblockPanelInteractions() {
  const extendedWindow = window;
  extendedWindow.$e?.components?.get?.("panel")?.unblockUserInteractions?.();
}

// src/components/class-manager/start-sync-to-v3-modal.tsx
var React18 = __toESM(require("react"));
var import_react8 = require("react");
var import_ui15 = require("@elementor/ui");
var import_i18n14 = require("@wordpress/i18n");
var IMAGE_URL = "https://assets.elementor.com/packages/v1/images/class-manager-sync-modal.png";
var StartSyncToV3Modal = ({ externalOpen, onExternalClose, onConfirm } = {}) => {
  const [shouldShowAgain, setShouldShowAgain] = (0, import_react8.useState)(true);
  const handleClose = () => {
    onExternalClose?.();
  };
  const handleConfirm = () => {
    onConfirm?.();
    onExternalClose?.();
  };
  return /* @__PURE__ */ React18.createElement(import_ui15.Dialog, { open: !!externalOpen, onClose: handleClose, maxWidth: "sm", fullWidth: true }, /* @__PURE__ */ React18.createElement(import_ui15.DialogContent, { sx: { p: 0 } }, /* @__PURE__ */ React18.createElement(import_ui15.Box, { component: "img", src: IMAGE_URL, alt: "", sx: { width: "100%", display: "block" } }), /* @__PURE__ */ React18.createElement(import_ui15.Box, { sx: { px: 3, pt: 4, pb: 1 } }, /* @__PURE__ */ React18.createElement(import_ui15.Typography, { variant: "h6" }, (0, import_i18n14.__)("Sync class to version 3 Global Fonts", "elementor")), /* @__PURE__ */ React18.createElement(import_ui15.Typography, { variant: "body2", color: "secondary", sx: { mb: 2, pt: 1 } }, (0, import_i18n14.__)(
    "Only typography settings supported in version 3 will be applied, including: font family, responsive font sizes, weight, text transform, decoration, line height, letter spacing, and word spacing. Changes made in the class will automatically apply to version 3.",
    "elementor"
  )))), /* @__PURE__ */ React18.createElement(import_ui15.DialogActions, { sx: { justifyContent: "space-between", px: 3, pb: 2 } }, /* @__PURE__ */ React18.createElement(
    import_ui15.FormControlLabel,
    {
      control: /* @__PURE__ */ React18.createElement(
        import_ui15.Checkbox,
        {
          checked: !shouldShowAgain,
          onChange: (e) => setShouldShowAgain(!e.target.checked)
        }
      ),
      label: /* @__PURE__ */ React18.createElement(import_ui15.Typography, { variant: "body2", color: "secondary" }, (0, import_i18n14.__)("Don't show again", "elementor"))
    }
  ), /* @__PURE__ */ React18.createElement(import_ui15.Box, { sx: { display: "flex", gap: 1 } }, /* @__PURE__ */ React18.createElement(import_ui15.Button, { onClick: handleClose, color: "secondary", size: "small" }, (0, import_i18n14.__)("Cancel", "elementor")), /* @__PURE__ */ React18.createElement(import_ui15.Button, { onClick: handleConfirm, variant: "contained", size: "small" }, (0, import_i18n14.__)("Sync to version 3", "elementor")))));
};

// src/components/class-manager/class-manager-panel.tsx
var STOP_SYNC_MESSAGE_KEY = "stop-sync-class";
var id = "global-classes-manager";
var reloadDocument = () => {
  const currentDocument = (0, import_editor_documents3.getCurrentDocument)();
  const documentsManager = (0, import_editor_documents3.getV1DocumentsManager)();
  documentsManager.invalidateCache();
  return (0, import_editor_v1_adapters3.__privateRunCommand)("editor/documents/switch", {
    id: currentDocument?.id,
    shouldScroll: false,
    shouldNavigateToDefaultRoute: false
  });
};
var { panel, usePanelActions } = (0, import_editor_panels.__createPanel)({
  id,
  component: ClassManagerPanel,
  allowedEditModes: ["edit", id],
  onOpen: () => {
    (0, import_editor_v1_adapters3.changeEditMode)(id);
    blockPanelInteractions();
  },
  onClose: async () => {
    (0, import_editor_v1_adapters3.changeEditMode)("edit");
    await reloadDocument();
    unblockPanelInteractions();
  },
  isOpenPreviousElement: true
});
function ClassManagerPanel() {
  const isDirty2 = useDirtyState();
  const { close: closePanel } = usePanelActions();
  const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = (0, import_editor_ui9.useDialog)();
  const [stopSyncConfirmation, setStopSyncConfirmation] = (0, import_react9.useState)(null);
  const [startSyncConfirmation, setStartSyncConfirmation] = (0, import_react9.useState)(null);
  const [isStopSyncSuppressed] = (0, import_editor_current_user2.useSuppressedMessage)(STOP_SYNC_MESSAGE_KEY);
  const { mutateAsync: publish, isPending: isPublishing } = usePublish();
  const resetAndClosePanel = () => {
    (0, import_store20.__dispatch)(slice.actions.resetToInitialState({ context: "frontend" }));
    closeSaveChangesDialog();
  };
  const handleStopSync = (0, import_react9.useCallback)((classId) => {
    (0, import_store20.__dispatch)(
      slice.actions.update({
        style: {
          id: classId,
          sync_to_v3: false
        }
      })
    );
    setStopSyncConfirmation(null);
  }, []);
  const handleStartSync = (0, import_react9.useCallback)((classId) => {
    (0, import_store20.__dispatch)(
      slice.actions.update({
        style: {
          id: classId,
          sync_to_v3: true
        }
      })
    );
    setStartSyncConfirmation(null);
  }, []);
  const handleStopSyncRequest = (0, import_react9.useCallback)(
    (classId) => {
      if (!isStopSyncSuppressed) {
        setStopSyncConfirmation(classId);
      } else {
        handleStopSync(classId);
      }
    },
    [isStopSyncSuppressed, handleStopSync]
  );
  usePreventUnload();
  return /* @__PURE__ */ React19.createElement(import_editor_ui9.ThemeProvider, null, /* @__PURE__ */ React19.createElement(import_ui16.ErrorBoundary, { fallback: /* @__PURE__ */ React19.createElement(ErrorBoundaryFallback, null) }, /* @__PURE__ */ React19.createElement(import_editor_panels.Panel, null, /* @__PURE__ */ React19.createElement(SearchAndFilterProvider, null, /* @__PURE__ */ React19.createElement(import_editor_panels.PanelHeader, null, /* @__PURE__ */ React19.createElement(import_ui16.Stack, { p: 1, pl: 2, width: "100%", direction: "row", alignItems: "center" }, /* @__PURE__ */ React19.createElement(import_ui16.Stack, { width: "100%", direction: "row", gap: 1 }, /* @__PURE__ */ React19.createElement(import_editor_panels.PanelHeaderTitle, { sx: { display: "flex", alignItems: "center", gap: 0.5 } }, /* @__PURE__ */ React19.createElement(FlippedColorSwatchIcon, { fontSize: "inherit" }), (0, import_i18n15.__)("Class Manager", "elementor")), /* @__PURE__ */ React19.createElement(TotalCssClassCounter, null)), /* @__PURE__ */ React19.createElement(
    CloseButton,
    {
      sx: { marginLeft: "auto" },
      disabled: isPublishing,
      onClose: () => {
        if (isDirty2) {
          openSaveChangesDialog();
          return;
        }
        closePanel();
      }
    }
  ))), /* @__PURE__ */ React19.createElement(
    import_editor_panels.PanelBody,
    {
      sx: {
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }
    },
    /* @__PURE__ */ React19.createElement(import_ui16.Box, { px: 2, pb: 1 }, /* @__PURE__ */ React19.createElement(import_ui16.Stack, { direction: "row", justifyContent: "spaceBetween", gap: 0.5, sx: { pb: 0.5 } }, /* @__PURE__ */ React19.createElement(import_ui16.Box, { sx: { flexGrow: 1 } }, /* @__PURE__ */ React19.createElement(ClassManagerSearch, null)), /* @__PURE__ */ React19.createElement(CssClassFilter, null)), /* @__PURE__ */ React19.createElement(ActiveFilters, null)),
    /* @__PURE__ */ React19.createElement(import_ui16.Divider, null),
    /* @__PURE__ */ React19.createElement(
      import_ui16.Box,
      {
        px: 2,
        sx: {
          flexGrow: 1,
          overflowY: "auto"
        }
      },
      /* @__PURE__ */ React19.createElement(
        GlobalClassesList,
        {
          disabled: isPublishing,
          onStopSyncRequest: handleStopSyncRequest,
          onStartSyncRequest: (classId) => setStartSyncConfirmation(classId)
        }
      )
    )
  ), /* @__PURE__ */ React19.createElement(import_editor_panels.PanelFooter, null, /* @__PURE__ */ React19.createElement(
    import_ui16.Button,
    {
      fullWidth: true,
      size: "small",
      color: "global",
      variant: "contained",
      onClick: publish,
      disabled: !isDirty2,
      loading: isPublishing
    },
    (0, import_i18n15.__)("Save changes", "elementor")
  ))))), /* @__PURE__ */ React19.createElement(ClassManagerIntroduction, null), startSyncConfirmation && /* @__PURE__ */ React19.createElement(
    StartSyncToV3Modal,
    {
      externalOpen: true,
      onExternalClose: () => setStartSyncConfirmation(null),
      onConfirm: () => handleStartSync(startSyncConfirmation)
    }
  ), stopSyncConfirmation && /* @__PURE__ */ React19.createElement(
    StopSyncConfirmationDialog,
    {
      open: true,
      onClose: () => setStopSyncConfirmation(null),
      onConfirm: () => handleStopSync(stopSyncConfirmation)
    }
  ), isSaveChangesDialogOpen && /* @__PURE__ */ React19.createElement(import_editor_ui9.SaveChangesDialog, null, /* @__PURE__ */ React19.createElement(import_ui16.DialogHeader, { onClose: closeSaveChangesDialog, logo: false }, /* @__PURE__ */ React19.createElement(import_editor_ui9.SaveChangesDialog.Title, null, (0, import_i18n15.__)("You have unsaved changes", "elementor"))), /* @__PURE__ */ React19.createElement(import_editor_ui9.SaveChangesDialog.Content, null, /* @__PURE__ */ React19.createElement(import_editor_ui9.SaveChangesDialog.ContentText, null, (0, import_i18n15.__)("You have unsaved changes in the Class Manager.", "elementor")), /* @__PURE__ */ React19.createElement(import_editor_ui9.SaveChangesDialog.ContentText, null, (0, import_i18n15.__)("To avoid losing your updates, save your changes before leaving.", "elementor"))), /* @__PURE__ */ React19.createElement(
    import_editor_ui9.SaveChangesDialog.Actions,
    {
      actions: {
        discard: {
          label: (0, import_i18n15.__)("Discard", "elementor"),
          action: () => {
            resetAndClosePanel();
          }
        },
        confirm: {
          label: (0, import_i18n15.__)("Save & Continue", "elementor"),
          action: async () => {
            await publish();
            closeSaveChangesDialog();
            closePanel();
          }
        }
      }
    }
  )));
}
var CloseButton = ({ onClose, ...props }) => /* @__PURE__ */ React19.createElement(import_ui16.IconButton, { size: "small", color: "secondary", onClick: onClose, "aria-label": "Close", ...props }, /* @__PURE__ */ React19.createElement(import_icons11.XIcon, { fontSize: "small" }));
var ErrorBoundaryFallback = () => /* @__PURE__ */ React19.createElement(import_ui16.Box, { role: "alert", sx: { minHeight: "100%", p: 2 } }, /* @__PURE__ */ React19.createElement(import_ui16.Alert, { severity: "error", sx: { mb: 2, maxWidth: 400, textAlign: "center" } }, /* @__PURE__ */ React19.createElement("strong", null, (0, import_i18n15.__)("Something went wrong", "elementor"))));
var usePreventUnload = () => {
  const isDirty2 = useDirtyState();
  (0, import_react9.useEffect)(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty2) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty2]);
};
var usePublish = () => {
  return (0, import_query3.useMutation)({
    mutationFn: () => saveGlobalClasses({ context: "frontend" }),
    onSuccess: async () => {
      (0, import_editor_documents3.setDocumentModifiedStatus)(false);
      if (hasDeletedItems()) {
        await onDelete();
      }
    }
  });
};
var TotalCssClassCounter = () => {
  const filters = useFilters();
  const cssClasses = useClassesOrder();
  return /* @__PURE__ */ React19.createElement(
    import_ui16.Chip,
    {
      size: "small",
      label: filters ? `${filters.length} / ${cssClasses?.length}` : cssClasses?.length
    }
  );
};
var StopSyncConfirmationDialog = ({ open, onClose, onConfirm }) => {
  const [, suppressStopSyncMessage] = (0, import_editor_current_user2.useSuppressedMessage)(STOP_SYNC_MESSAGE_KEY);
  return /* @__PURE__ */ React19.createElement(import_editor_ui9.ConfirmationDialog, { open, onClose }, /* @__PURE__ */ React19.createElement(import_editor_ui9.ConfirmationDialog.Title, { icon: FlippedColorSwatchIcon, iconColor: "primary" }, (0, import_i18n15.__)("Un-sync typography class", "elementor")), /* @__PURE__ */ React19.createElement(import_editor_ui9.ConfirmationDialog.Content, null, /* @__PURE__ */ React19.createElement(import_editor_ui9.ConfirmationDialog.ContentText, null, (0, import_i18n15.__)("You're about to stop syncing a typography class to version 3.", "elementor")), /* @__PURE__ */ React19.createElement(import_editor_ui9.ConfirmationDialog.ContentText, { sx: { mt: 1 } }, (0, import_i18n15.__)(
    "Note that if it's being used anywhere, the affected elements will inherit the default typography.",
    "elementor"
  ))), /* @__PURE__ */ React19.createElement(
    import_editor_ui9.ConfirmationDialog.Actions,
    {
      onClose,
      onConfirm,
      cancelLabel: (0, import_i18n15.__)("Cancel", "elementor"),
      confirmLabel: (0, import_i18n15.__)("Got it", "elementor"),
      color: "primary",
      onSuppressMessage: suppressStopSyncMessage,
      suppressLabel: (0, import_i18n15.__)("Don't show again", "elementor")
    }
  ));
};

// src/components/class-manager/class-manager-button.tsx
var trackGlobalClassesButton = () => {
  trackGlobalClasses({
    event: "classManagerOpened",
    source: "style-panel"
  });
};
var ClassManagerButton = () => {
  const document = (0, import_editor_documents4.__useActiveDocument)();
  const { open: openPanel } = usePanelActions();
  const { save: saveDocument } = (0, import_editor_documents4.__useActiveDocumentActions)();
  const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = (0, import_editor_ui10.useDialog)();
  const { prefetchClassesUsage } = usePrefetchCssClassUsage();
  const { userCan } = (0, import_editor_styles_repository3.useUserStylesCapability)();
  const isUserAllowedToUpdateClass = userCan(globalClassesStylesProvider.getKey()).update;
  if (!isUserAllowedToUpdateClass) {
    return null;
  }
  const handleOpenPanel = () => {
    if (document?.isDirty) {
      openSaveChangesDialog();
      return;
    }
    openPanel();
    trackGlobalClassesButton();
    trackGlobalClasses({
      event: "classManagerOpened",
      source: "style-panel"
    });
    prefetchClassesUsage();
  };
  return /* @__PURE__ */ React20.createElement(React20.Fragment, null, /* @__PURE__ */ React20.createElement(import_ui17.Tooltip, { title: (0, import_i18n16.__)("Class Manager", "elementor"), placement: "top" }, /* @__PURE__ */ React20.createElement(import_ui17.IconButton, { size: "tiny", onClick: handleOpenPanel, sx: { marginInlineEnd: -0.75 } }, /* @__PURE__ */ React20.createElement(FlippedColorSwatchIcon, { fontSize: "tiny" }))), isSaveChangesDialogOpen && /* @__PURE__ */ React20.createElement(import_editor_ui10.SaveChangesDialog, null, /* @__PURE__ */ React20.createElement(import_editor_ui10.SaveChangesDialog.Title, null, (0, import_i18n16.__)("You have unsaved changes", "elementor")), /* @__PURE__ */ React20.createElement(import_editor_ui10.SaveChangesDialog.Content, null, /* @__PURE__ */ React20.createElement(import_editor_ui10.SaveChangesDialog.ContentText, { sx: { mb: 2 } }, (0, import_i18n16.__)(
    "To open the Class Manager, save your page first. You can't continue without saving.",
    "elementor"
  ))), /* @__PURE__ */ React20.createElement(
    import_editor_ui10.SaveChangesDialog.Actions,
    {
      actions: {
        cancel: {
          label: (0, import_i18n16.__)("Stay here", "elementor"),
          action: closeSaveChangesDialog
        },
        confirm: {
          label: (0, import_i18n16.__)("Save & Continue", "elementor"),
          action: async () => {
            await saveDocument();
            closeSaveChangesDialog();
            openPanel();
            trackGlobalClassesButton();
            prefetchClassesUsage();
          }
        }
      }
    }
  )));
};

// src/components/convert-local-class-to-global-class.tsx
var React21 = __toESM(require("react"));
var import_editor_styles_repository4 = require("@elementor/editor-styles-repository");
var import_editor_ui11 = require("@elementor/editor-ui");
var import_ui18 = require("@elementor/ui");
var import_i18n17 = require("@wordpress/i18n");
var ConvertLocalClassToGlobalClass = (props) => {
  const localStyleData = props.styleDef;
  const handleConversion = () => {
    const newClassName = createClassName(`converted-class-`);
    if (!localStyleData) {
      throw new Error("Style definition is required for converting local class to global class.");
    }
    const newId = globalClassesStylesProvider.actions.create?.(newClassName, localStyleData.variants);
    if (newId) {
      props.successCallback(newId);
      trackGlobalClasses({
        classId: newId,
        event: "classCreated",
        source: "converted",
        classTitle: newClassName
      });
    }
  };
  return /* @__PURE__ */ React21.createElement(React21.Fragment, null, /* @__PURE__ */ React21.createElement(
    import_editor_ui11.MenuListItem,
    {
      disabled: !props.canConvert,
      onClick: handleConversion,
      dense: true,
      sx: {
        "&.Mui-focusVisible": {
          border: "none",
          boxShadow: "none !important",
          backgroundColor: "transparent"
        }
      }
    },
    (0, import_i18n17.__)("Convert to global class", "elementor")
  ), /* @__PURE__ */ React21.createElement(import_ui18.Divider, null));
};
function createClassName(prefix) {
  let i = 1;
  let newClassName = `${prefix}${i}`;
  while (!(0, import_editor_styles_repository4.validateStyleLabel)(newClassName, "create").isValid) {
    newClassName = `${prefix}${++i}`;
  }
  return newClassName;
}

// src/components/open-panel-from-url.tsx
var import_react10 = require("react");
var import_editor_v1_adapters4 = require("@elementor/editor-v1-adapters");
var ACTIVE_PANEL_PARAM = "active-panel";
var PANEL_ID = "global-classes-manager";
var DEFAULT_PANEL_ROUTE = "panel/elements";
function OpenPanelFromUrl() {
  const { open } = usePanelActions();
  const hasOpened = (0, import_react10.useRef)(false);
  (0, import_react10.useEffect)(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activePanel = urlParams.get(ACTIVE_PANEL_PARAM);
    if (activePanel !== PANEL_ID) {
      return;
    }
    const cleanup = (0, import_editor_v1_adapters4.__privateListenTo)((0, import_editor_v1_adapters4.routeOpenEvent)(DEFAULT_PANEL_ROUTE), () => {
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

// src/components/populate-store.tsx
var import_react11 = require("react");
var import_store22 = require("@elementor/store");
function PopulateStore() {
  const dispatch5 = (0, import_store22.__useDispatch)();
  (0, import_react11.useEffect)(() => {
    Promise.all([apiClient.all("preview"), apiClient.all("frontend")]).then(
      ([previewRes, frontendRes]) => {
        const { data: previewData } = previewRes;
        const { data: frontendData } = frontendRes;
        dispatch5(
          slice.actions.load({
            preview: {
              items: previewData.data,
              order: previewData.meta.order
            },
            frontend: {
              items: frontendData.data,
              order: frontendData.meta.order
            }
          })
        );
      }
    );
  }, [dispatch5]);
  return null;
}

// src/mcp-integration/index.ts
var import_editor_mcp2 = require("@elementor/editor-mcp");

// src/mcp-integration/mcp-apply-unapply-global-classes.ts
var import_editor_editing_panel = require("@elementor/editor-editing-panel");
var import_schema = require("@elementor/schema");
function initMcpApplyUnapplyGlobalClasses(server) {
  server.addTool({
    schema: {
      classId: import_schema.z.string().describe("The ID of the class to apply"),
      elementId: import_schema.z.string().describe("The ID of the element to which the class will be applied")
    },
    outputSchema: {
      result: import_schema.z.string().describe("Result message indicating the success of the apply operation"),
      llm_instructions: import_schema.z.string().describe("Instructions what to do next, Important to follow these instructions!")
    },
    name: "apply-global-class",
    modelPreferences: {
      intelligencePriority: 0.7,
      speedPriority: 0.8
    },
    description: `Apply a global class to an element, enabling consistent styling through your design system.

## When to use this tool:
**ALWAYS use this IMMEDIATELY AFTER building compositions** to apply the global classes you created beforehand:
- After using "build-compositions" tool, apply semantic classes to the created elements
- When applying consistent typography styles (heading-primary, text-body, etc.)
- When applying theme colors or brand styles (bg-brand, button-cta, etc.)
- When ensuring spacing consistency (spacing-section-large, etc.)

**DO NOT use this tool** for:
- Elements that don't share styles with other elements (use inline styles instead)
- Layout-specific properties (those should remain inline in stylesConfig)

## Prerequisites:
- **REQUIRED**: Get the list of available global classes from 'elementor://global-classes' resource
- **REQUIRED**: Get element IDs from the composition XML returned by "build-compositions" tool
- Ensure you have the most up-to-date list of classes applied to the element to avoid duplicates
- Make sure you have the correct class ID that you want to apply

## Best Practices:
1. Apply multiple classes to a single element if needed (typography + color + spacing)
2. After applying, the tool will remind you to remove duplicate inline styles from elementConfig
3. Classes should describe purpose, not implementation (e.g., "heading-primary" not "big-red-text")`,
    handler: async (params) => {
      const { classId, elementId } = params;
      const appliedClasses = (0, import_editor_editing_panel.doGetAppliedClasses)(elementId);
      (0, import_editor_editing_panel.doApplyClasses)(elementId, [...appliedClasses, classId]);
      return {
        llm_instructions: "Please check the element-configuration, find DUPLICATES in the style schema that are in the class, and remove them",
        result: `Class ${classId} applied to element ${elementId} successfully.`
      };
    }
  });
  server.addTool({
    name: "unapply-global-class",
    schema: {
      classId: import_schema.z.string().describe("The ID of the class to unapply"),
      elementId: import_schema.z.string().describe("The ID of the element from which the class will be unapplied")
    },
    outputSchema: {
      result: import_schema.z.string().describe("Result message indicating the success of the unapply operation")
    },
    modelPreferences: {
      intelligencePriority: 0.7,
      speedPriority: 0.8
    },
    description: `Unapply a (global) class from the current element

## When to use this tool:
- When a user requests to unapply a global class or a class from an element in the Elementor editor.
- When you need to remove a specific class from an element's applied classes.

## Prerequisites:
- Ensure you have the most up-to-date list of classes applied to the element to avoid errors.
  The list is available at always up-to-date resource 'elementor://global-classes'.
- Make sure you have the correct class ID that you want to unapply.

<note>
If the user want to unapply a class by it's name and not ID, retreive the id from the list, available at uri elementor://global-classes
</note>
`,
    handler: async (params) => {
      const { classId, elementId } = params;
      const ok = (0, import_editor_editing_panel.doUnapplyClass)(elementId, classId);
      if (!ok) {
        throw new Error(`Class ${classId} is not applied to element ${elementId}, cannot unapply it.`);
      }
      return {
        result: `Class ${classId} unapplied from element ${elementId} successfully.`
      };
    }
  });
}

// src/mcp-integration/mcp-get-global-class-usages.ts
var import_schema2 = require("@elementor/schema");
function initMcpApplyGetGlobalClassUsages(reg) {
  const { addTool } = reg;
  const globalClassesUsageSchema = {
    usages: import_schema2.z.array(
      import_schema2.z.object({
        classId: import_schema2.z.string().describe(
          'The ID of the class, not visible to the user. To retreive the name of the class, use the "list-global-classes" tool'
        ),
        usages: import_schema2.z.array(
          import_schema2.z.object({
            pageId: import_schema2.z.string().describe("The ID of the page where the class is used"),
            title: import_schema2.z.string().describe("The title of the page where the class is used"),
            total: import_schema2.z.number().describe("The number of times the class is used on this page"),
            elements: import_schema2.z.array(import_schema2.z.string()).describe("List of element IDs using this class on the page")
          })
        )
      })
    )
  };
  addTool({
    name: "get-global-class-usages",
    modelPreferences: {
      intelligencePriority: 0.6,
      speedPriority: 0.8
    },
    description: `Retreive the usages of global-classes ACCROSS PAGES designed by Elementor editor.

## Prequisites: CRITICAL
- The list of global classes and their applid values is available at resource uri elementor://global-classes

## When to use this tool:
- When a user requests to see where a specific global class is being used accross the site.
- When you need to manage or clean up unused global classes.
- Before deleting a global class, to ensure it is not in use in any other pages.

## When NOT to use this tool:
- For getting the list of global classes, refer to the resource at uri elementor://global-classes
`,
    outputSchema: globalClassesUsageSchema,
    handler: async () => {
      const data = await fetchCssClassUsage();
      const result = {
        usages: []
      };
      Object.entries(data).forEach(
        ([classId, usageDetails]) => {
          const newEntry = {
            classId,
            usages: []
          };
          if (typeof usageDetails !== "number") {
            const { content } = usageDetails;
            content.forEach((detail) => {
              newEntry.usages.push({
                pageId: String(detail.pageId),
                title: detail.title,
                total: detail.total,
                elements: detail.elements
              });
            });
            result.usages.push(newEntry);
          }
        }
      );
      return result;
    }
  });
}

// src/mcp-integration/mcp-manage-global-classes.ts
var import_editor_canvas = require("@elementor/editor-canvas");
var import_editor_props = require("@elementor/editor-props");
var import_editor_styles3 = require("@elementor/editor-styles");
var import_schema3 = require("@elementor/schema");
var schema = {
  action: import_schema3.z.enum(["create", "modify", "delete"]).describe("Operation to perform"),
  classId: import_schema3.z.string().optional().describe("Global class ID (required for modify). Get from elementor://global-classes resource."),
  globalClassName: import_schema3.z.string().optional().describe("Global class name (required for create)"),
  props: import_schema3.z.object({
    default: import_schema3.z.record(import_schema3.z.any()).describe(
      'key-value of style-schema PropValues. Available properties at dynamic resource "elementor://styles/schema/{property-name}"'
    ),
    hover: import_schema3.z.record(import_schema3.z.any()).describe("key-value of style-schema PropValues, for :hover css state. optional").optional(),
    focus: import_schema3.z.record(import_schema3.z.any()).describe("key-value of style-schema PropValues, for :focus css state. optional").optional(),
    active: import_schema3.z.record(import_schema3.z.any()).describe("key-value of style-schema PropValues, for :active css state. optional").optional()
  }),
  breakpoint: import_schema3.z.nullable(import_schema3.z.string().describe("Responsive breakpoint name for styles. Defaults to desktop (null).")).default(null).describe("Responsive breakpoint name for styles. Defaults to desktop (null).")
};
var outputSchema = {
  status: import_schema3.z.enum(["ok", "error"]).describe("Operation status"),
  classId: import_schema3.z.string().optional().describe("Class ID (returned on create success)"),
  message: import_schema3.z.string().optional().describe("Error details if status is error")
};
var handler = async (input) => {
  const { action, classId: rawClassId, globalClassName, props: rawProps, breakpoint } = input;
  const propsWithStates = rawProps;
  let classId = rawClassId;
  if (action === "create" && !globalClassName) {
    return {
      status: "error",
      message: "Create requires globalClassName"
    };
  }
  if (action === "modify" && !classId) {
    return {
      status: "error",
      message: "Modify requires classId"
    };
  }
  if (action === "delete" && !classId) {
    return {
      status: "error",
      message: "Delete requires classId"
    };
  }
  const { create, update, delete: deleteClass2 } = globalClassesStylesProvider.actions;
  if (!create || !update || !deleteClass2) {
    return {
      status: "error",
      message: "Required actions not available"
    };
  }
  const errors = [];
  const stylesSchema = (0, import_editor_styles3.getStylesSchema)();
  const validProps = Object.keys(stylesSchema);
  Object.values(propsWithStates).forEach((props) => {
    Object.keys(props).forEach((key) => {
      const propType = stylesSchema[key];
      if (!propType) {
        errors.push(`Property "${key}" does not exist in styles schema.`);
        return;
      }
      const { valid, jsonSchema } = import_editor_props.Schema.validatePropValue(propType, props[key]);
      if (!valid) {
        errors.push(`- Property "${key}" has invalid value
  Expected schema: ${jsonSchema}
`);
      }
    });
  });
  if (errors.length > 0) {
    return {
      status: "error",
      message: `Validation errors:
${errors.join("\n")}
Available Properties: ${validProps.join(
        ", "
      )}
Update your input and try again.`
    };
  }
  const Utils = window.elementorV2.editorVariables.Utils;
  Object.values(propsWithStates).forEach((props) => {
    Object.keys(props).forEach((key) => {
      props[key] = import_editor_props.Schema.adjustLlmPropValueSchema(props[key], {
        transformers: Utils.globalVariablesLLMResolvers
      });
    });
  });
  const breakpointValue = breakpoint ?? "desktop";
  let result = {
    status: "error",
    classId: "",
    message: "unknown error"
  };
  try {
    let currentAction = action;
    for await (const [state, props] of Object.entries(propsWithStates)) {
      switch (currentAction) {
        case "create":
          const newClassId = await attemptCreate({
            props,
            className: globalClassName,
            stylesProvider: globalClassesStylesProvider,
            breakpoint: breakpointValue,
            state
          });
          if (newClassId && currentAction === "create") {
            currentAction = "modify";
            classId = newClassId;
          }
          result = newClassId ? {
            status: "ok",
            message: `created global class with ID ${newClassId}`
          } : {
            status: "error",
            message: "error creating class"
          };
          break;
        case "modify":
          const updated = await attemptUpdate({
            classId,
            props,
            stylesProvider: globalClassesStylesProvider,
            breakpoint: breakpointValue,
            state
          });
          result = updated ? { status: "ok", classId } : {
            status: "error",
            message: "error modifying class"
          };
          break;
        case "delete":
          const deleted = await attemptDelete({
            classId,
            stylesProvider: globalClassesStylesProvider
          });
          result = deleted ? { status: "ok", message: `deleted global class with ID ${classId}` } : {
            status: "error",
            message: "error deleting class"
          };
          break;
        default:
          throw new Error(`Unsupported action ${action}`);
      }
    }
  } catch (error) {
    return {
      status: "error",
      message: `${action} failed: ${error.message || "Unknown error"}`
    };
  }
  return result;
};
var initManageGlobalClasses = (reg) => {
  const { addTool } = reg;
  addTool({
    name: "manage-global-classes",
    requiredResources: [
      { uri: GLOBAL_CLASSES_URI, description: "Global classes list" },
      { uri: import_editor_canvas.STYLE_SCHEMA_URI, description: "Style schema resources" },
      { uri: import_editor_canvas.BREAKPOINTS_SCHEMA_URI, description: "Breakpoints list" }
    ],
    modelPreferences: {
      intelligencePriority: 0.85,
      speedPriority: 0.6
    },
    description: `Manages global classes (create/modify) in Elementor editor. Check [elementor://global-classes] and style schemas first.

CREATE: Requires globalClassName, props. Use semantic naming (heading-primary, button-cta, text-muted). Check existing classes to avoid duplicates. ALWAYS create global classes BEFORE compositions for reusable styles.
MODIFY: Requires classId, props. Get classId from [elementor://global-classes] resource.

Naming pattern: [element-type]-[purpose/variant]-[modifier]
DO NOT create global classes for: one-off styles, layout-specific properties.

Use style schema at [elementor://styles/schema/{category}] for valid props. Errors include exact schema mismatch details.`,
    schema,
    outputSchema,
    handler
  });
};
async function attemptCreate(opts) {
  const { props, breakpoint, className, stylesProvider, state } = opts;
  const { create, delete: deleteClass2 } = stylesProvider.actions;
  if (!className) {
    throw new Error("Global class name is a required for creation");
  }
  if (!create || !deleteClass2) {
    throw new Error("User is unable to create global classes");
  }
  const newClassId = create(className, [
    {
      meta: {
        breakpoint,
        state: state === "default" ? null : state
      },
      custom_css: null,
      props
    }
  ]);
  try {
    await saveGlobalClasses({ context: "frontend" });
    return newClassId;
  } catch {
    deleteClass2(newClassId);
    return null;
  }
}
async function attemptUpdate(opts) {
  const { props, breakpoint, classId, stylesProvider, state } = opts;
  const { updateProps, update } = stylesProvider.actions;
  if (!classId) {
    throw new Error("Class ID is required for modification");
  }
  if (!updateProps || !update) {
    throw new Error("User is unable to update global classes");
  }
  const snapshot = structuredClone(stylesProvider.actions.all());
  try {
    updateProps({
      id: classId,
      props,
      meta: {
        breakpoint,
        state
      }
    });
    await saveGlobalClasses({ context: "frontend" });
    return true;
  } catch {
    snapshot.forEach((style) => {
      update({
        id: style.id,
        variants: style.variants
      });
    });
    await saveGlobalClasses({ context: "frontend" });
    return false;
  }
}
async function attemptDelete(opts) {
  const { classId, stylesProvider } = opts;
  const { delete: deleteClass2, create } = stylesProvider.actions;
  if (!classId) {
    throw new Error("Class ID is required for deletion");
  }
  if (!deleteClass2 || !create) {
    throw new Error("User is unable to delete global classes");
  }
  const snapshot = structuredClone(stylesProvider.actions.all());
  const targetClass = snapshot.find((style) => style.id === classId);
  if (!targetClass) {
    throw new Error(`Class with ID "${classId}" not found`);
  }
  try {
    deleteClass2(classId);
    await saveGlobalClasses({ context: "frontend" });
    return true;
  } catch {
    return false;
  }
}

// src/mcp-integration/index.ts
var initMcpIntegration = () => {
  const reg = (0, import_editor_mcp2.getMCPByDomain)("classes", {
    instructions: "MCP server for management of Elementor global classes"
  });
  initMcpApplyUnapplyGlobalClasses(reg);
  initMcpApplyGetGlobalClassUsages(reg);
  initManageGlobalClasses(reg);
  initClassesResource();
};

// src/sync-with-document.tsx
var import_react12 = require("react");
var import_editor_v1_adapters6 = require("@elementor/editor-v1-adapters");

// src/sync-with-document-save.ts
var import_editor_current_user3 = require("@elementor/editor-current-user");
var import_editor_documents5 = require("@elementor/editor-documents");
var import_editor_v1_adapters5 = require("@elementor/editor-v1-adapters");
var import_store24 = require("@elementor/store");
function syncWithDocumentSave(panelActions) {
  const unsubscribe = syncDirtyState();
  bindSaveAction(panelActions);
  return unsubscribe;
}
function syncDirtyState() {
  return (0, import_store24.__subscribeWithSelector)(selectIsDirty, () => {
    if (!isDirty()) {
      return;
    }
    (0, import_editor_documents5.setDocumentModifiedStatus)(true);
  });
}
function bindSaveAction(panelActions) {
  (0, import_editor_v1_adapters5.registerDataHook)("dependency", "document/save/save", (args) => {
    const user = (0, import_editor_current_user3.getCurrentUser)();
    const canEdit = user?.capabilities.includes(UPDATE_CLASS_CAPABILITY_KEY);
    if (!canEdit) {
      return true;
    }
    saveGlobalClasses({
      context: args.status === "publish" ? "frontend" : "preview",
      onApprove: panelActions?.open
    });
    return true;
  });
}
function isDirty() {
  return selectIsDirty((0, import_store24.__getState)());
}

// src/sync-with-document.tsx
function SyncWithDocumentSave() {
  const panelActions = usePanelActions();
  (0, import_react12.useEffect)(() => {
    (0, import_editor_v1_adapters6.__privateListenTo)((0, import_editor_v1_adapters6.v1ReadyEvent)(), () => {
      syncWithDocumentSave(panelActions);
    });
  }, []);
  return null;
}

// src/init.ts
function init() {
  (0, import_store26.__registerSlice)(slice);
  (0, import_editor_panels2.__registerPanel)(panel);
  import_editor_styles_repository5.stylesRepository.register(globalClassesStylesProvider);
  (0, import_editor.injectIntoLogic)({
    id: "global-classes-populate-store",
    component: PopulateStore
  });
  (0, import_editor.injectIntoLogic)({
    id: "global-classes-sync-with-document",
    component: SyncWithDocumentSave
  });
  (0, import_editor.injectIntoLogic)({
    id: "global-classes-prefetch-css-class-usage",
    component: PrefetchCssClassUsage
  });
  (0, import_editor.injectIntoLogic)({
    id: "global-classes-open-panel-from-url",
    component: OpenPanelFromUrl
  });
  (0, import_editor_editing_panel2.injectIntoCssClassConvert)({
    id: "global-classes-convert-from-local-class",
    component: ConvertLocalClassToGlobalClass
  });
  (0, import_editor_editing_panel2.injectIntoClassSelectorActions)({
    id: "global-classes-manager-button",
    component: ClassManagerButton
  });
  (0, import_editor_editing_panel2.registerStyleProviderToColors)(GLOBAL_CLASSES_PROVIDER_KEY, {
    name: "global",
    getThemeColor: (theme) => theme.palette.global.dark
  });
  initMcpIntegration();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GLOBAL_CLASSES_URI,
  init
});
//# sourceMappingURL=index.js.map