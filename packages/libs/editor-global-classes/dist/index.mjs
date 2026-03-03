// src/mcp-integration/classes-resource.ts
import { getMCPByDomain } from "@elementor/editor-mcp";

// src/global-classes-styles-provider.ts
import { generateId } from "@elementor/editor-styles";
import { createStylesProvider } from "@elementor/editor-styles-repository";
import {
  __dispatch as dispatch,
  __getState as getState2,
  __subscribeWithSelector as subscribeWithSelector
} from "@elementor/store";
import { __ } from "@wordpress/i18n";

// src/capabilities.ts
import { isExperimentActive } from "@elementor/editor-v1-adapters";
var EXPERIMENT_KEY = "global_classes_should_enforce_capabilities";
var UPDATE_CLASS_CAPABILITY_KEY = "elementor_global_classes_update_class";
var getCapabilities = () => {
  const shouldEnforceCapabilities = isExperimentActive(EXPERIMENT_KEY);
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
import { createError } from "@elementor/utils";
var GlobalClassNotFoundError = createError({
  code: "global_class_not_found",
  message: "Global class not found."
});
var GlobalClassLabelAlreadyExistsError = createError({
  code: "global_class_label_already_exists",
  message: "Class with this name already exists."
});
var GlobalClassTrackingError = createError({
  code: "global_class_tracking_error",
  message: "Error tracking global classes event."
});

// src/store.ts
import {
  getVariantByMeta
} from "@elementor/editor-styles";
import {
  __createSelector as createSelector,
  __createSlice as createSlice
} from "@elementor/store";

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
var slice = createSlice({
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
      const variant = getVariantByMeta(style, payload.meta);
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
var selectOrder = createSelector(selectData, ({ order }) => order);
var selectGlobalClasses = createSelector(selectData, ({ items }) => items);
var selectIsDirty = (state) => state[SLICE_NAME].isDirty;
var selectOrderedClasses = createSelector(
  selectGlobalClasses,
  selectOrder,
  (items, order) => order.map((id2) => items[id2])
);
var selectClass = (state, id2) => state[SLICE_NAME].data.items[id2] ?? null;
var selectEmptyCssClass = createSelector(
  selectData,
  ({ items }) => Object.values(items).filter((cssClass) => cssClass.variants.length === 0)
);

// src/utils/tracking.ts
import { getMixpanel } from "@elementor/events";
import { __getState as getState } from "@elementor/store";

// src/api.ts
import { httpService } from "@elementor/http-client";
var RESOURCE_URL = "/global-classes";
var BASE_URL = "elementor/v1";
var RESOURCE_USAGE_URL = `${RESOURCE_URL}/usage`;
var apiClient = {
  usage: () => httpService().get(`${BASE_URL}${RESOURCE_USAGE_URL}`),
  all: (context2 = "preview") => httpService().get(`${BASE_URL}${RESOURCE_URL}`, {
    params: { context: context2 }
  }),
  publish: (payload) => httpService().put("elementor/v1" + RESOURCE_URL, payload, {
    params: {
      context: "frontend"
    }
  }),
  saveDraft: (payload) => httpService().put("elementor/v1" + RESOURCE_URL, payload, {
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
  const { dispatchEvent, config } = getMixpanel();
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
  const cssClass = selectClass(getState(), classId);
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
var globalClassesStylesProvider = createStylesProvider({
  key: GLOBAL_CLASSES_PROVIDER_KEY,
  priority: 30,
  limit: MAX_CLASSES,
  labels: {
    singular: __("class", "elementor"),
    plural: __("classes", "elementor")
  },
  subscribe: (cb) => subscribeWithStates(cb),
  capabilities: getCapabilities(),
  actions: {
    all: () => selectOrderedClasses(getState2()),
    get: (id2) => selectClass(getState2(), id2),
    resolveCssName: (id2) => {
      return selectClass(getState2(), id2)?.label ?? id2;
    },
    create: (label, variants = []) => {
      const classes = selectGlobalClasses(getState2());
      const existingLabels = Object.values(classes).map((style) => style.label);
      if (existingLabels.includes(label)) {
        throw new GlobalClassLabelAlreadyExistsError({ context: { label } });
      }
      const existingIds = Object.keys(classes);
      const id2 = generateId("g-", existingIds);
      dispatch(
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
      dispatch(
        slice.actions.update({
          style: payload
        })
      );
    },
    delete: (id2) => {
      dispatch(slice.actions.delete(id2));
    },
    updateProps: (args) => {
      dispatch(
        slice.actions.updateProps({
          id: args.id,
          meta: args.meta,
          props: args.props
        })
      );
    },
    updateCustomCss: (args) => {
      dispatch(
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
  let previousState = selectData(getState2());
  return subscribeWithSelector(
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
  const canvasMcpEntry = getMCPByDomain("canvas");
  const classesMcpEntry = getMCPByDomain("classes");
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
import { injectIntoLogic } from "@elementor/editor";
import {
  injectIntoClassSelectorActions,
  injectIntoCssClassConvert,
  registerStyleProviderToColors
} from "@elementor/editor-editing-panel";
import { __registerPanel as registerPanel } from "@elementor/editor-panels";
import { stylesRepository } from "@elementor/editor-styles-repository";
import { __registerSlice as registerSlice } from "@elementor/store";

// src/components/class-manager/class-manager-button.tsx
import * as React20 from "react";
import {
  __useActiveDocument as useActiveDocument2,
  __useActiveDocumentActions as useActiveDocumentActions
} from "@elementor/editor-documents";
import { useUserStylesCapability } from "@elementor/editor-styles-repository";
import { SaveChangesDialog as SaveChangesDialog2, useDialog as useDialog2 } from "@elementor/editor-ui";
import { IconButton as IconButton5, Tooltip as Tooltip6 } from "@elementor/ui";
import { __ as __16 } from "@wordpress/i18n";

// src/hooks/use-prefetch-css-class-usage.ts
import { useQueryClient } from "@elementor/query";

// src/components/css-class-usage/types.ts
var QUERY_KEY = "css-classes-usage";

// src/hooks/use-prefetch-css-class-usage.ts
function usePrefetchCssClassUsage() {
  const queryClient = useQueryClient();
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
import * as React19 from "react";
import { useCallback, useEffect as useEffect3, useState as useState7 } from "react";
import { useSuppressedMessage as useSuppressedMessage2 } from "@elementor/editor-current-user";
import { getCurrentDocument, getV1DocumentsManager, setDocumentModifiedStatus } from "@elementor/editor-documents";
import {
  __createPanel as createPanel,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  PanelHeaderTitle
} from "@elementor/editor-panels";
import { ConfirmationDialog as ConfirmationDialog2, SaveChangesDialog, ThemeProvider, useDialog } from "@elementor/editor-ui";
import { __privateRunCommand as runCommand, changeEditMode } from "@elementor/editor-v1-adapters";
import { XIcon } from "@elementor/icons";
import { useMutation } from "@elementor/query";
import { __dispatch as dispatch4 } from "@elementor/store";
import {
  Alert as Alert2,
  Box as Box11,
  Button as Button3,
  Chip as Chip4,
  DialogHeader as DialogHeader2,
  Divider as Divider4,
  ErrorBoundary,
  IconButton as IconButton4,
  Stack as Stack9
} from "@elementor/ui";
import { __ as __15 } from "@wordpress/i18n";

// src/hooks/use-classes-order.ts
import { __useSelector as useSelector } from "@elementor/store";
var useClassesOrder = () => {
  return useSelector(selectOrder);
};

// src/hooks/use-dirty-state.ts
import { __useSelector as useSelector2 } from "@elementor/store";
var useDirtyState = () => {
  return useSelector2(selectIsDirty);
};

// src/hooks/use-filters.ts
import { useMemo as useMemo2 } from "react";

// src/components/search-and-filter/context.tsx
import * as React from "react";
import { createContext, useContext } from "react";
import { useDebounceState } from "@elementor/utils";
var SearchAndFilterContext = createContext(void 0);
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
  const { debouncedValue, inputValue, handleChange } = useDebounceState({
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
  const context2 = useContext(SearchAndFilterContext);
  if (!context2) {
    throw new Error("useSearchContext must be used within a SearchContextProvider");
  }
  return context2;
};

// src/hooks/use-filtered-css-class-usage.tsx
import { useMemo } from "react";
import { __useActiveDocument as useActiveDocument } from "@elementor/editor-documents";

// src/hooks/use-css-class-usage.ts
import { useQuery } from "@elementor/query";
var useCssClassUsage = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: fetchCssClassUsage,
    refetchOnMount: false,
    refetchOnWindowFocus: true
  });
};

// src/hooks/use-empty-css-class.ts
import { __useSelector } from "@elementor/store";
var useEmptyCssClass = () => {
  return __useSelector(selectEmptyCssClass);
};
var useAllCssClassesIDs = () => {
  const cssClasses = __useSelector(selectGlobalClasses);
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
  const document = useActiveDocument();
  const emptyCssClasses = useEmptyCssClass();
  const { data, isLoading } = useCssClassUsage();
  const listOfCssClasses = useAllCssClassesIDs();
  const emptyCssClassesIDs = useMemo(() => emptyCssClasses.map(({ id: id2 }) => id2), [emptyCssClasses]);
  const onThisPage = useMemo(() => {
    if (!data || !document) {
      return [];
    }
    return findCssClassKeysByPageID(data, document.id);
  }, [data, document]);
  const unused = useMemo(() => {
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
  return useMemo2(() => {
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
import * as React3 from "react";
import { openDialog } from "@elementor/editor-ui";
import { __dispatch as dispatch2, __getState as getState3 } from "@elementor/store";
import { hash } from "@elementor/utils";

// src/components/class-manager/duplicate-label-dialog.tsx
import * as React2 from "react";
import { closeDialog, EllipsisWithTooltip } from "@elementor/editor-ui";
import { InfoCircleFilledIcon } from "@elementor/icons";
import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogHeader,
  Divider,
  Icon,
  Stack,
  Typography
} from "@elementor/ui";
import { __ as __2 } from "@wordpress/i18n";
var DUP_PREFIX = "DUP_";
var DuplicateLabelDialog = ({
  modifiedLabels,
  onApprove
}) => {
  const handleButtonClick = () => {
    localStorage.setItem("elementor-global-classes-search", DUP_PREFIX);
    onApprove?.();
    closeDialog();
  };
  return /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(DialogHeader, { logo: false }, /* @__PURE__ */ React2.createElement(Box, { display: "flex", alignItems: "center", gap: 1 }, /* @__PURE__ */ React2.createElement(Icon, { color: "secondary" }, /* @__PURE__ */ React2.createElement(InfoCircleFilledIcon, { fontSize: "medium" })), /* @__PURE__ */ React2.createElement(Typography, { variant: "subtitle1" }, __2("We've published your page and updated class names.", "elementor")))), /* @__PURE__ */ React2.createElement(DialogContent, null, /* @__PURE__ */ React2.createElement(Stack, { spacing: 2, direction: "column" }, /* @__PURE__ */ React2.createElement(Typography, { variant: "body2" }, __2(
    "Some new classes used the same names as existing ones. To prevent conflicts, we added the prefix",
    "elementor"
  ), /* @__PURE__ */ React2.createElement("strong", null, " ", DUP_PREFIX)), /* @__PURE__ */ React2.createElement(Box, null, /* @__PURE__ */ React2.createElement(
    Box,
    {
      sx: {
        width: "100%",
        display: "flex",
        gap: 2,
        alignItems: "flex-start"
      }
    },
    /* @__PURE__ */ React2.createElement(
      Typography,
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
      __2("Before", "elementor")
    ),
    /* @__PURE__ */ React2.createElement(
      Typography,
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
      __2("After", "elementor")
    )
  ), /* @__PURE__ */ React2.createElement(Divider, { sx: { mt: 0.5, mb: 0.5 } }), /* @__PURE__ */ React2.createElement(Stack, { direction: "column", gap: 0.5, sx: { pb: 2 } }, Object.values(modifiedLabels).map(({ original, modified }, index) => /* @__PURE__ */ React2.createElement(
    Box,
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
      Box,
      {
        sx: {
          flex: 1,
          flexShrink: 1,
          flexGrow: 1,
          minWidth: 0
        }
      },
      /* @__PURE__ */ React2.createElement(EllipsisWithTooltip, { title: original }, /* @__PURE__ */ React2.createElement(Typography, { variant: "body2", sx: { color: "text.secondary" } }, original))
    ),
    /* @__PURE__ */ React2.createElement(
      Box,
      {
        sx: {
          minWidth: "200px",
          flexShrink: 0,
          flexGrow: 0,
          width: "200px",
          maxWidth: "200px"
        }
      },
      /* @__PURE__ */ React2.createElement(EllipsisWithTooltip, { title: modified }, /* @__PURE__ */ React2.createElement(Typography, { variant: "body2", sx: { color: "text.primary" } }, modified))
    )
  ))), /* @__PURE__ */ React2.createElement(Box, null, /* @__PURE__ */ React2.createElement(Alert, { severity: "info", size: "small", color: "secondary" }, /* @__PURE__ */ React2.createElement("strong", null, __2("Your designs and classes are safe.", "elementor")), __2(
    "Only the prefixes were added. Find them in Class Manager by searching",
    "elementor"
  ), /* @__PURE__ */ React2.createElement("strong", null, DUP_PREFIX)))))), /* @__PURE__ */ React2.createElement(DialogActions, null, /* @__PURE__ */ React2.createElement(Button, { color: "secondary", variant: "text", onClick: handleButtonClick }, __2("Go to Class Manager", "elementor")), /* @__PURE__ */ React2.createElement(Button, { color: "secondary", variant: "contained", onClick: closeDialog }, __2("Done", "elementor"))));
};

// src/save-global-classes.tsx
async function saveGlobalClasses({ context: context2, onApprove }) {
  const state = selectData(getState3());
  const apiAction = context2 === "preview" ? apiClient.saveDraft : apiClient.publish;
  const currentContext = context2 === "preview" ? selectPreviewInitialData : selectFrontendInitialData;
  const response = await apiAction({
    items: state.items,
    order: state.order,
    changes: calculateChanges(state, currentContext(getState3()))
  });
  dispatch2(slice.actions.reset({ context: context2 }));
  if (response?.data?.data?.code === API_ERROR_CODES.DUPLICATED_LABEL) {
    dispatch2(slice.actions.updateMultiple(response.data.data.modifiedLabels));
    trackGlobalClasses({
      event: "classPublishConflict",
      numOfConflicts: Object.keys(response.data.data.modifiedLabels).length
    });
    openDialog({
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
      return id2 in initialData.items && hash(state.items[id2]) !== hash(initialData.items[id2]);
    })
  };
}

// src/components/search-and-filter/components/filter/active-filters.tsx
import * as React6 from "react";
import { Chip as Chip2, Stack as Stack3 } from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";

// src/components/search-and-filter/components/filter/clear-icon-button.tsx
import * as React4 from "react";
import { BrushBigIcon } from "@elementor/icons";
import { Box as Box2, IconButton, styled, Tooltip } from "@elementor/ui";
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
  return /* @__PURE__ */ React4.createElement(Tooltip, { title: tooltipText, placement: "top", disableInteractive: true }, /* @__PURE__ */ React4.createElement(Box2, null, /* @__PURE__ */ React4.createElement(CustomIconButton, { "aria-label": tooltipText, size: "tiny", onClick: handleClearFilters, sx }, /* @__PURE__ */ React4.createElement(BrushBigIcon, { fontSize: "tiny" }))));
};
var CustomIconButton = styled(IconButton)(({ theme }) => ({
  "&.Mui-disabled": {
    pointerEvents: "auto",
    "&:hover": {
      color: theme.palette.action.disabled
    }
  }
}));

// src/components/search-and-filter/components/filter/filter-list.tsx
import * as React5 from "react";
import { Checkbox, Chip, MenuItem, MenuList, Stack as Stack2, Typography as Typography2 } from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";
var filterConfig = {
  unused: __3("Unused", "elementor"),
  empty: __3("Empty", "elementor"),
  onThisPage: __3("On this page", "elementor")
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
  return /* @__PURE__ */ React5.createElement(MenuList, null, /* @__PURE__ */ React5.createElement(MenuItem, { onClick: () => handleOnClick("unused") }, /* @__PURE__ */ React5.createElement(
    LabeledCheckbox,
    {
      label: filterConfig.unused,
      checked: filters.unused,
      suffix: /* @__PURE__ */ React5.createElement(Chip, { size: "tiny", sx: { ml: "auto" }, label: filteredCssClass.unused.length })
    }
  )), /* @__PURE__ */ React5.createElement(MenuItem, { onClick: () => handleOnClick("empty") }, /* @__PURE__ */ React5.createElement(
    LabeledCheckbox,
    {
      label: filterConfig.empty,
      checked: filters.empty,
      suffix: /* @__PURE__ */ React5.createElement(Chip, { size: "tiny", sx: { ml: "auto" }, label: filteredCssClass.empty.length })
    }
  )), /* @__PURE__ */ React5.createElement(MenuItem, { onClick: () => handleOnClick("onThisPage") }, /* @__PURE__ */ React5.createElement(
    LabeledCheckbox,
    {
      label: filterConfig.onThisPage,
      checked: filters.onThisPage,
      suffix: /* @__PURE__ */ React5.createElement(Chip, { size: "tiny", sx: { ml: "auto" }, label: filteredCssClass.onThisPage.length })
    }
  )));
};
var LabeledCheckbox = ({ label, suffix, checked }) => /* @__PURE__ */ React5.createElement(Stack2, { direction: "row", alignItems: "center", gap: 0.5, flex: 1 }, /* @__PURE__ */ React5.createElement(
  Checkbox,
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
), /* @__PURE__ */ React5.createElement(Typography2, { variant: "caption", sx: { color: "text.secondary" } }, label), suffix);

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
  return /* @__PURE__ */ React6.createElement(Stack3, { direction: "row", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React6.createElement(Stack3, { direction: "row", gap: 0.5, alignItems: "center", flexWrap: "wrap" }, activeKeys.map((key) => /* @__PURE__ */ React6.createElement(
    Chip2,
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
      tooltipText: __4("Clear Filters", "elementor"),
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
import * as React7 from "react";
import { PopoverBody, PopoverHeader } from "@elementor/editor-ui";
import { FilterIcon } from "@elementor/icons";
import { bindPopover, bindToggle, Divider as Divider2, Popover, ToggleButton, Tooltip as Tooltip2, usePopupState } from "@elementor/ui";
import { __ as __5 } from "@wordpress/i18n";
var CssClassFilter = () => {
  const {
    filters: { filters }
  } = useSearchAndFilters();
  const popupState = usePopupState({
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
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(Tooltip2, { title: __5("Filters", "elementor"), placement: "top" }, /* @__PURE__ */ React7.createElement(
    ToggleButton,
    {
      value: "filter",
      size: "tiny",
      selected: popupState.isOpen,
      ...bindToggle(popupState)
    },
    /* @__PURE__ */ React7.createElement(FilterIcon, { fontSize: "tiny" })
  )), /* @__PURE__ */ React7.createElement(
    Popover,
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
      ...bindPopover(popupState)
    },
    /* @__PURE__ */ React7.createElement(
      PopoverHeader,
      {
        actions: showCleanIcon ? [
          /* @__PURE__ */ React7.createElement(
            ClearIconButton,
            {
              trigger: "menu",
              key: "clear-all-button",
              tooltipText: __5("Clear all", "elementor")
            }
          )
        ] : [],
        onClose: popupState.close,
        title: __5("Filters", "elementor"),
        icon: /* @__PURE__ */ React7.createElement(FilterIcon, { fontSize: "tiny" })
      }
    ),
    /* @__PURE__ */ React7.createElement(
      Divider2,
      {
        sx: {
          borderWidth: "1px 0 0 0"
        }
      }
    ),
    /* @__PURE__ */ React7.createElement(PopoverBody, { width: 344, height: 125 }, /* @__PURE__ */ React7.createElement(FilterList, null))
  ));
};

// src/components/search-and-filter/components/search/class-manager-search.tsx
import * as React8 from "react";
import { SearchIcon } from "@elementor/icons";
import { Box as Box3, InputAdornment, Stack as Stack4, TextField } from "@elementor/ui";
import { __ as __6 } from "@wordpress/i18n";
var ClassManagerSearch = () => {
  const {
    search: { inputValue, handleChange }
  } = useSearchAndFilters();
  return /* @__PURE__ */ React8.createElement(Stack4, { direction: "row", gap: 0.5, sx: { width: "100%" } }, /* @__PURE__ */ React8.createElement(Box3, { sx: { flexGrow: 1 } }, /* @__PURE__ */ React8.createElement(
    TextField,
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
      placeholder: __6("Search", "elementor"),
      onChange: (e) => handleChange(e.target.value),
      InputProps: {
        startAdornment: /* @__PURE__ */ React8.createElement(InputAdornment, { position: "start" }, /* @__PURE__ */ React8.createElement(SearchIcon, { fontSize: "tiny" }))
      }
    }
  )));
};

// src/components/class-manager/class-manager-introduction.tsx
import * as React9 from "react";
import { useState as useState2 } from "react";
import { useSuppressedMessage } from "@elementor/editor-current-user";
import { IntroductionModal } from "@elementor/editor-ui";
import { Box as Box4, Image, Typography as Typography3 } from "@elementor/ui";
import { __ as __7 } from "@wordpress/i18n";
var MESSAGE_KEY = "global-class-manager";
var ClassManagerIntroduction = () => {
  const [isMessageSuppressed, suppressMessage] = useSuppressedMessage(MESSAGE_KEY);
  const [shouldShowIntroduction, setShouldShowIntroduction] = useState2(!isMessageSuppressed);
  return /* @__PURE__ */ React9.createElement(
    IntroductionModal,
    {
      open: shouldShowIntroduction,
      title: __7("Class Manager", "elementor"),
      handleClose: (shouldShowAgain) => {
        if (!shouldShowAgain) {
          suppressMessage();
        }
        setShouldShowIntroduction(false);
      }
    },
    /* @__PURE__ */ React9.createElement(
      Image,
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
  return /* @__PURE__ */ React9.createElement(Box4, { p: 3 }, /* @__PURE__ */ React9.createElement(Typography3, { variant: "body2" }, __7(
    "The Class Manager lets you see all the classes you've created, plus adjust their priority, rename them, and delete unused classes to keep your CSS structured.",
    "elementor"
  )), /* @__PURE__ */ React9.createElement("br", null), /* @__PURE__ */ React9.createElement(Typography3, { variant: "body2" }, __7(
    "Remember, when editing an item within a specific class, any changes you make will apply across all elements in that class.",
    "elementor"
  )));
};

// src/components/class-manager/delete-class.ts
import { __dispatch as dispatch3 } from "@elementor/store";
var isDeleted = false;
var deleteClass = (id2) => {
  trackGlobalClasses({
    event: "classDeleted",
    classId: id2,
    runAction: () => {
      dispatch3(slice.actions.delete(id2));
      isDeleted = true;
    }
  });
};
var onDelete = async () => {
  isDeleted = false;
};
var hasDeletedItems = () => isDeleted;

// src/components/class-manager/flipped-color-swatch-icon.tsx
import * as React10 from "react";
import { ColorSwatchIcon } from "@elementor/icons";
var FlippedColorSwatchIcon = ({ sx, ...props }) => /* @__PURE__ */ React10.createElement(ColorSwatchIcon, { sx: { transform: "rotate(90deg)", ...sx }, ...props });

// src/components/class-manager/global-classes-list.tsx
import * as React17 from "react";
import { useEffect as useEffect2, useMemo as useMemo3 } from "react";
import { __useDispatch as useDispatch } from "@elementor/store";
import { List, Stack as Stack8, styled as styled6, Typography as Typography8 } from "@elementor/ui";
import { __ as __13 } from "@wordpress/i18n";

// src/hooks/use-ordered-classes.ts
import { __useSelector as useSelector3 } from "@elementor/store";
var useOrderedClasses = () => {
  return useSelector3(selectOrderedClasses);
};

// src/components/class-manager/class-item.tsx
import * as React15 from "react";
import { useRef, useState as useState4 } from "react";
import { validateStyleLabel } from "@elementor/editor-styles-repository";
import { EditableField, EllipsisWithTooltip as EllipsisWithTooltip3, MenuListItem, useEditable, WarningInfotip } from "@elementor/editor-ui";
import { isExperimentActive as isExperimentActive2 } from "@elementor/editor-v1-adapters";
import { DotsVerticalIcon } from "@elementor/icons";
import {
  bindMenu,
  bindTrigger as bindTrigger2,
  Box as Box8,
  IconButton as IconButton3,
  ListItemButton,
  Menu,
  Stack as Stack6,
  styled as styled5,
  Tooltip as Tooltip5,
  Typography as Typography6,
  usePopupState as usePopupState3
} from "@elementor/ui";
import { __ as __11 } from "@wordpress/i18n";

// src/components/css-class-usage/components/css-class-usage-popover.tsx
import * as React11 from "react";
import { __useOpenDocumentInNewTab as useOpenDocumentInNewTab } from "@elementor/editor-documents";
import {
  EllipsisWithTooltip as EllipsisWithTooltip2,
  PopoverBody as PopoverBody2,
  PopoverHeader as PopoverHeader2,
  PopoverMenuList
} from "@elementor/editor-ui";
import {
  CurrentLocationIcon,
  ExternalLinkIcon,
  FooterTemplateIcon,
  HeaderTemplateIcon,
  PagesIcon,
  PopupTemplateIcon,
  PostTypeIcon
} from "@elementor/icons";
import { Box as Box5, Chip as Chip3, Divider as Divider3, Icon as Icon2, MenuList as MenuList2, Stack as Stack5, styled as styled2, Tooltip as Tooltip3, Typography as Typography4 } from "@elementor/ui";
import { __ as __8 } from "@wordpress/i18n";

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
    label: __8("Post", "elementor"),
    icon: /* @__PURE__ */ React11.createElement(PostTypeIcon, { fontSize: "inherit" })
  },
  "wp-page": {
    label: __8("Page", "elementor"),
    icon: /* @__PURE__ */ React11.createElement(PagesIcon, { fontSize: "inherit" })
  },
  popup: {
    label: __8("Popup", "elementor"),
    icon: /* @__PURE__ */ React11.createElement(PopupTemplateIcon, { fontSize: "inherit" })
  },
  header: {
    label: __8("Header", "elementor"),
    icon: /* @__PURE__ */ React11.createElement(HeaderTemplateIcon, { fontSize: "inherit" })
  },
  footer: {
    label: __8("Footer", "elementor"),
    icon: /* @__PURE__ */ React11.createElement(FooterTemplateIcon, { fontSize: "inherit" })
  }
};
var CssClassUsagePopover = ({
  cssClassID,
  onClose
}) => {
  const { data: classUsage } = useCssClassUsageByID(cssClassID);
  const onNavigate = useOpenDocumentInNewTab();
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
    PopoverHeader2,
    {
      icon: /* @__PURE__ */ React11.createElement(CurrentLocationIcon, { fontSize: "tiny" }),
      title: /* @__PURE__ */ React11.createElement(Stack5, { flexDirection: "row", gap: 1, alignItems: "center" }, /* @__PURE__ */ React11.createElement(Box5, { "aria-label": "header-title" }, __8("Locator", "elementor")), /* @__PURE__ */ React11.createElement(Box5, null, /* @__PURE__ */ React11.createElement(Chip3, { sx: { lineHeight: 1 }, size: "tiny", label: classUsage.total }))),
      onClose
    }
  ), /* @__PURE__ */ React11.createElement(Divider3, null), /* @__PURE__ */ React11.createElement(PopoverBody2, { width: 300 }, /* @__PURE__ */ React11.createElement(
    PopoverMenuList,
    {
      onSelect: handleSelect,
      items: cssClassUsageRecords,
      onClose: () => {
      },
      menuListTemplate: StyledCssClassUsageItem,
      menuItemContentTemplate: (cssClassUsageRecord) => /* @__PURE__ */ React11.createElement(Stack5, { flexDirection: "row", flex: 1, alignItems: "center" }, /* @__PURE__ */ React11.createElement(Box5, { display: "flex", sx: { pr: 1 } }, /* @__PURE__ */ React11.createElement(
        Tooltip3,
        {
          disableInteractive: true,
          title: iconMapper?.[cssClassUsageRecord.docType]?.label ?? cssClassUsageRecord.docType,
          placement: "top"
        },
        /* @__PURE__ */ React11.createElement(Icon2, { fontSize: "small" }, iconMapper?.[cssClassUsageRecord.docType]?.icon || /* @__PURE__ */ React11.createElement(PagesIcon, { fontSize: "inherit" }))
      )), /* @__PURE__ */ React11.createElement(Box5, { sx: { pr: 0.5, maxWidth: "173px" }, display: "flex" }, /* @__PURE__ */ React11.createElement(
        EllipsisWithTooltip2,
        {
          title: cssClassUsageRecord.label,
          as: Typography4,
          variant: "caption",
          maxWidth: "173px",
          sx: {
            lineHeight: 1
          }
        }
      )), /* @__PURE__ */ React11.createElement(ExternalLinkIcon, { className: "hover-only-icon", fontSize: "tiny" }), /* @__PURE__ */ React11.createElement(
        Chip3,
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
var StyledCssClassUsageItem = styled2(MenuList2)(({ theme }) => ({
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
import * as React12 from "react";
import { InfoAlert } from "@elementor/editor-ui";
import { CurrentLocationIcon as CurrentLocationIcon2 } from "@elementor/icons";
import {
  bindPopover as bindPopover2,
  bindTrigger,
  Box as Box6,
  IconButton as IconButton2,
  Infotip,
  Popover as Popover2,
  styled as styled3,
  Tooltip as Tooltip4,
  usePopupState as usePopupState2
} from "@elementor/ui";
import { __ as __9 } from "@wordpress/i18n";
var CssClassUsageTrigger = ({ id: id2, onClick }) => {
  const {
    data: { total },
    isLoading
  } = useCssClassUsageByID(id2);
  const cssClassUsagePopover = usePopupState2({ variant: "popover", popupId: "css-class-usage-popover" });
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
      bindTrigger(cssClassUsagePopover).onClick(e);
      onClick(id2);
      trackGlobalClasses({
        event: "classUsageClicked",
        classId: id2
      });
    }
  };
  return /* @__PURE__ */ React12.createElement(React12.Fragment, null, /* @__PURE__ */ React12.createElement(Box6, { position: "relative", onMouseEnter: handleMouseEnter }, /* @__PURE__ */ React12.createElement(WrapperComponent, { total }, /* @__PURE__ */ React12.createElement(
    CustomIconButton2,
    {
      disabled: total === 0,
      size: "tiny",
      ...bindTrigger(cssClassUsagePopover),
      onClick: handleClick
    },
    /* @__PURE__ */ React12.createElement(CurrentLocationIcon2, { fontSize: "tiny" })
  ))), /* @__PURE__ */ React12.createElement(Box6, null, /* @__PURE__ */ React12.createElement(
    Popover2,
    {
      anchorOrigin: {
        vertical: "center",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: 15,
        horizontal: -50
      },
      ...bindPopover2(cssClassUsagePopover),
      onClose: () => {
        bindPopover2(cssClassUsagePopover).onClose();
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
var CustomIconButton2 = styled3(IconButton2)(({ theme }) => ({
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
  Tooltip4,
  {
    disableInteractive: true,
    placement: "top",
    title: `${__9("Show {{number}} {{locations}}", "elementor").replace("{{number}}", total.toString()).replace(
      "{{locations}}",
      total === 1 ? __9("location", "elementor") : __9("locations", "elementor")
    )}`
  },
  /* @__PURE__ */ React12.createElement("span", null, children)
);
var InfoAlertMessage = ({ children }) => /* @__PURE__ */ React12.createElement(
  Infotip,
  {
    disableInteractive: true,
    placement: "top",
    color: "secondary",
    content: /* @__PURE__ */ React12.createElement(InfoAlert, { sx: { mt: 1 } }, __9("This class isn\u2019t being used yet.", "elementor"))
  },
  /* @__PURE__ */ React12.createElement("span", null, children)
);

// src/components/class-manager/delete-confirmation-dialog.tsx
import * as React13 from "react";
import { createContext as createContext2, useContext as useContext2, useState as useState3 } from "react";
import { ConfirmationDialog } from "@elementor/editor-ui";
import { Typography as Typography5 } from "@elementor/ui";
import { __ as __10 } from "@wordpress/i18n";
var context = createContext2(null);
var DeleteConfirmationProvider = ({ children }) => {
  const [dialogProps, setDialogProps] = useState3(null);
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
  const text = total && content.length ? __10(
    "Will permanently remove it from your project and may affect the design across all elements using it. Used %1 times across %2 pages. This action cannot be undone.",
    "elementor"
  ).replace("%1", total.toString()).replace("%2", content.length.toString()) : __10(
    "Will permanently remove it from your project and may affect the design across all elements using it. This action cannot be undone.",
    "elementor"
  );
  return /* @__PURE__ */ React13.createElement(ConfirmationDialog, { open: true, onClose: closeDialog2 }, /* @__PURE__ */ React13.createElement(ConfirmationDialog.Title, null, __10("Delete this class?", "elementor")), /* @__PURE__ */ React13.createElement(ConfirmationDialog.Content, null, /* @__PURE__ */ React13.createElement(ConfirmationDialog.ContentText, null, __10("Deleting", "elementor"), /* @__PURE__ */ React13.createElement(Typography5, { variant: "subtitle2", component: "span" }, "\xA0", label, "\xA0"), text)), /* @__PURE__ */ React13.createElement(ConfirmationDialog.Actions, { onClose: closeDialog2, onConfirm: handleConfirm }));
};
var useDeleteConfirmation = () => {
  const contextValue = useContext2(context);
  if (!contextValue) {
    throw new Error("useDeleteConfirmation must be used within a DeleteConfirmationProvider");
  }
  return contextValue;
};

// src/components/class-manager/sortable.tsx
import * as React14 from "react";
import { GripVerticalIcon } from "@elementor/icons";
import {
  Box as Box7,
  styled as styled4,
  UnstableSortableItem,
  UnstableSortableProvider
} from "@elementor/ui";
var SortableProvider = (props) => /* @__PURE__ */ React14.createElement(UnstableSortableProvider, { restrictAxis: true, variant: "static", dragPlaceholderStyle: { opacity: "1" }, ...props });
var SortableTrigger = (props) => /* @__PURE__ */ React14.createElement(StyledSortableTrigger, { ...props, role: "button", className: "class-item-sortable-trigger", "aria-label": "sort" }, /* @__PURE__ */ React14.createElement(GripVerticalIcon, { fontSize: "tiny" }));
var SortableItem = ({ children, id: id2, ...props }) => {
  return /* @__PURE__ */ React14.createElement(
    UnstableSortableItem,
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
          Box7,
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
var StyledSortableTrigger = styled4("div")(({ theme }) => ({
  position: "absolute",
  left: 0,
  top: "50%",
  transform: `translate( -${theme.spacing(1.5)}, -50% )`,
  color: theme.palette.action.active
}));
var SortableItemIndicator = styled4(Box7)`
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
  const itemRef = useRef(null);
  const {
    ref: editableRef,
    openEditMode,
    isEditing,
    error,
    getProps: getEditableProps
  } = useEditable({
    value: label,
    onSubmit: renameClass,
    validation: validateLabel
  });
  const [selectedCssUsage, setSelectedCssUsage] = useState4("");
  const { openDialog: openDialog2 } = useDeleteConfirmation();
  const popupState = usePopupState3({
    variant: "popover",
    disableAutoFocus: true
  });
  const isSelected = (selectedCssUsage === id2 || selected || popupState.isOpen) && !disabled;
  return /* @__PURE__ */ React15.createElement(React15.Fragment, null, /* @__PURE__ */ React15.createElement(Stack6, { p: 0 }, /* @__PURE__ */ React15.createElement(
    WarningInfotip,
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
        EditableField,
        {
          ref: editableRef,
          as: Typography6,
          variant: "caption",
          ...getEditableProps()
        }
      ) : /* @__PURE__ */ React15.createElement(EllipsisWithTooltip3, { title: label, as: Typography6, variant: "caption" })),
      /* @__PURE__ */ React15.createElement(Box8, { className: "class-item-locator" }, /* @__PURE__ */ React15.createElement(CssClassUsageTrigger, { id: id2, onClick: setSelectedCssUsage })),
      /* @__PURE__ */ React15.createElement(
        Tooltip5,
        {
          placement: "top",
          className: "class-item-more-actions",
          title: __11("More actions", "elementor")
        },
        /* @__PURE__ */ React15.createElement(IconButton3, { size: "tiny", ...bindTrigger2(popupState), "aria-label": "More actions" }, /* @__PURE__ */ React15.createElement(DotsVerticalIcon, { fontSize: "tiny" }))
      )
    )
  )), /* @__PURE__ */ React15.createElement(
    Menu,
    {
      ...bindMenu(popupState),
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
      MenuListItem,
      {
        sx: { minWidth: "160px" },
        onClick: () => {
          popupState.close();
          openEditMode();
        }
      },
      /* @__PURE__ */ React15.createElement(Typography6, { variant: "caption", sx: { color: "text.primary" } }, __11("Rename", "elementor"))
    ),
    isExperimentActive2("e_design_system_sync") && onToggleSync && /* @__PURE__ */ React15.createElement(
      MenuListItem,
      {
        onClick: () => {
          popupState.close();
          onToggleSync(id2, !syncToV3);
        }
      },
      /* @__PURE__ */ React15.createElement(Typography6, { variant: "caption", sx: { color: "text.primary" } }, syncToV3 ? __11("Stop syncing to Version 3", "elementor") : __11("Sync to Version 3", "elementor"))
    ),
    /* @__PURE__ */ React15.createElement(
      MenuListItem,
      {
        onClick: () => {
          popupState.close();
          openDialog2({ id: id2, label });
        }
      },
      /* @__PURE__ */ React15.createElement(Typography6, { variant: "caption", sx: { color: "error.light" } }, __11("Delete", "elementor"))
    )
  ));
};
var StyledListItemButton = styled5(ListItemButton, {
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
var Indicator = styled5(Box8, {
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
  const result = validateStyleLabel(newLabel, "rename");
  if (result.isValid) {
    return null;
  }
  return result.errorMessage;
};

// src/components/class-manager/not-found.tsx
import * as React16 from "react";
import { ColorSwatchIcon as ColorSwatchIcon2, PhotoIcon } from "@elementor/icons";
import { Box as Box9, Link, Stack as Stack7, Typography as Typography7 } from "@elementor/ui";
import { __ as __12 } from "@wordpress/i18n";
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
    mainText: __12("Sorry, nothing matched.", "elementor"),
    sceneryText: __12("Try something else.", "elementor"),
    icon: /* @__PURE__ */ React16.createElement(PhotoIcon, { color: "inherit", fontSize: "large" })
  },
  search: {
    mainText: __12("Sorry, nothing matched", "elementor"),
    sceneryText: __12("Clear your input and try something else.", "elementor"),
    icon: /* @__PURE__ */ React16.createElement(PhotoIcon, { color: "inherit", fontSize: "large" })
  },
  filter: {
    mainText: __12("Sorry, nothing matched that search.", "elementor"),
    sceneryText: __12("Clear the filters and try something else.", "elementor"),
    icon: /* @__PURE__ */ React16.createElement(ColorSwatchIcon2, { color: "inherit", fontSize: "large" })
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
  Stack7,
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
    Box9,
    {
      sx: {
        width: "100%"
      }
    },
    /* @__PURE__ */ React16.createElement(Typography7, { align: "center", variant: "subtitle2", color: "inherit" }, mainText),
    searchValue && /* @__PURE__ */ React16.createElement(
      Typography7,
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
  /* @__PURE__ */ React16.createElement(Typography7, { align: "center", variant: "caption", color: "inherit" }, sceneryText),
  /* @__PURE__ */ React16.createElement(Typography7, { align: "center", variant: "caption", color: "inherit" }, /* @__PURE__ */ React16.createElement(Link, { color: "secondary", variant: "caption", component: "button", onClick: onClear }, __12("Clear & try again", "elementor")))
);

// src/components/class-manager/global-classes-list.tsx
var GlobalClassesList = ({ disabled, onStopSyncRequest, onStartSyncRequest }) => {
  const {
    search: { debouncedValue: searchValue }
  } = useSearchAndFilters();
  const cssClasses = useOrderedClasses();
  const dispatch5 = useDispatch();
  const filters = useFilters();
  const [draggedItemId, setDraggedItemId] = React17.useState(null);
  const draggedItemLabel = cssClasses.find((cssClass) => cssClass.id === draggedItemId)?.label ?? "";
  const [classesOrder, reorderClasses] = useReorder(draggedItemId, setDraggedItemId, draggedItemLabel ?? "");
  const filteredCssClasses = useFilteredCssClasses();
  useEffect2(() => {
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
  return /* @__PURE__ */ React17.createElement(DeleteConfirmationProvider, null, /* @__PURE__ */ React17.createElement(List, { sx: { display: "flex", flexDirection: "column", gap: 0.5 } }, /* @__PURE__ */ React17.createElement(
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
var EmptyState = () => /* @__PURE__ */ React17.createElement(Stack8, { alignItems: "center", gap: 1.5, pt: 10, px: 0.5, maxWidth: "260px", margin: "auto" }, /* @__PURE__ */ React17.createElement(FlippedColorSwatchIcon, { fontSize: "large" }), /* @__PURE__ */ React17.createElement(StyledHeader, { variant: "subtitle2", component: "h2", color: "text.secondary" }, __13("There are no global classes yet.", "elementor")), /* @__PURE__ */ React17.createElement(Typography8, { align: "center", variant: "caption", color: "text.secondary" }, __13(
  "CSS classes created in the editor panel will appear here. Once they are available, you can arrange their hierarchy, rename them, or delete them as needed.",
  "elementor"
)));
var StyledHeader = styled6(Typography8)(({ theme, variant }) => ({
  "&.MuiTypography-root": {
    ...theme.typography[variant]
  }
}));
var useReorder = (draggedItemId, setDraggedItemId, draggedItemLabel) => {
  const dispatch5 = useDispatch();
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
  const lowercaseLabels = useMemo3(
    () => cssClasses.map((cssClass) => ({
      ...cssClass,
      lowerLabel: cssClass.label.toLowerCase()
    })),
    [cssClasses]
  );
  const filteredClasses = useMemo3(() => {
    if (searchValue.length > 1) {
      return lowercaseLabels.filter((cssClass) => cssClass.lowerLabel.includes(searchValue.toLowerCase()));
    }
    return cssClasses;
  }, [searchValue, cssClasses, lowercaseLabels]);
  return useMemo3(() => {
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
import * as React18 from "react";
import { useState as useState6 } from "react";
import {
  Box as Box10,
  Button as Button2,
  Checkbox as Checkbox2,
  Dialog,
  DialogActions as DialogActions2,
  DialogContent as DialogContent2,
  FormControlLabel,
  Typography as Typography9
} from "@elementor/ui";
import { __ as __14 } from "@wordpress/i18n";
var IMAGE_URL = "https://assets.elementor.com/packages/v1/images/class-manager-sync-modal.png";
var StartSyncToV3Modal = ({ externalOpen, onExternalClose, onConfirm } = {}) => {
  const [shouldShowAgain, setShouldShowAgain] = useState6(true);
  const handleClose = () => {
    onExternalClose?.();
  };
  const handleConfirm = () => {
    onConfirm?.();
    onExternalClose?.();
  };
  return /* @__PURE__ */ React18.createElement(Dialog, { open: !!externalOpen, onClose: handleClose, maxWidth: "sm", fullWidth: true }, /* @__PURE__ */ React18.createElement(DialogContent2, { sx: { p: 0 } }, /* @__PURE__ */ React18.createElement(Box10, { component: "img", src: IMAGE_URL, alt: "", sx: { width: "100%", display: "block" } }), /* @__PURE__ */ React18.createElement(Box10, { sx: { px: 3, pt: 4, pb: 1 } }, /* @__PURE__ */ React18.createElement(Typography9, { variant: "h6" }, __14("Sync class to version 3 Global Fonts", "elementor")), /* @__PURE__ */ React18.createElement(Typography9, { variant: "body2", color: "secondary", sx: { mb: 2, pt: 1 } }, __14(
    "Only typography settings supported in version 3 will be applied, including: font family, responsive font sizes, weight, text transform, decoration, line height, letter spacing, and word spacing. Changes made in the class will automatically apply to version 3.",
    "elementor"
  )))), /* @__PURE__ */ React18.createElement(DialogActions2, { sx: { justifyContent: "space-between", px: 3, pb: 2 } }, /* @__PURE__ */ React18.createElement(
    FormControlLabel,
    {
      control: /* @__PURE__ */ React18.createElement(
        Checkbox2,
        {
          checked: !shouldShowAgain,
          onChange: (e) => setShouldShowAgain(!e.target.checked)
        }
      ),
      label: /* @__PURE__ */ React18.createElement(Typography9, { variant: "body2", color: "secondary" }, __14("Don't show again", "elementor"))
    }
  ), /* @__PURE__ */ React18.createElement(Box10, { sx: { display: "flex", gap: 1 } }, /* @__PURE__ */ React18.createElement(Button2, { onClick: handleClose, color: "secondary", size: "small" }, __14("Cancel", "elementor")), /* @__PURE__ */ React18.createElement(Button2, { onClick: handleConfirm, variant: "contained", size: "small" }, __14("Sync to version 3", "elementor")))));
};

// src/components/class-manager/class-manager-panel.tsx
var STOP_SYNC_MESSAGE_KEY = "stop-sync-class";
var id = "global-classes-manager";
var reloadDocument = () => {
  const currentDocument = getCurrentDocument();
  const documentsManager = getV1DocumentsManager();
  documentsManager.invalidateCache();
  return runCommand("editor/documents/switch", {
    id: currentDocument?.id,
    shouldScroll: false,
    shouldNavigateToDefaultRoute: false
  });
};
var { panel, usePanelActions } = createPanel({
  id,
  component: ClassManagerPanel,
  allowedEditModes: ["edit", id],
  onOpen: () => {
    changeEditMode(id);
    blockPanelInteractions();
  },
  onClose: async () => {
    changeEditMode("edit");
    await reloadDocument();
    unblockPanelInteractions();
  },
  isOpenPreviousElement: true
});
function ClassManagerPanel() {
  const isDirty2 = useDirtyState();
  const { close: closePanel } = usePanelActions();
  const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();
  const [stopSyncConfirmation, setStopSyncConfirmation] = useState7(null);
  const [startSyncConfirmation, setStartSyncConfirmation] = useState7(null);
  const [isStopSyncSuppressed] = useSuppressedMessage2(STOP_SYNC_MESSAGE_KEY);
  const { mutateAsync: publish, isPending: isPublishing } = usePublish();
  const resetAndClosePanel = () => {
    dispatch4(slice.actions.resetToInitialState({ context: "frontend" }));
    closeSaveChangesDialog();
  };
  const handleStopSync = useCallback((classId) => {
    dispatch4(
      slice.actions.update({
        style: {
          id: classId,
          sync_to_v3: false
        }
      })
    );
    setStopSyncConfirmation(null);
  }, []);
  const handleStartSync = useCallback((classId) => {
    dispatch4(
      slice.actions.update({
        style: {
          id: classId,
          sync_to_v3: true
        }
      })
    );
    setStartSyncConfirmation(null);
  }, []);
  const handleStopSyncRequest = useCallback(
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
  return /* @__PURE__ */ React19.createElement(ThemeProvider, null, /* @__PURE__ */ React19.createElement(ErrorBoundary, { fallback: /* @__PURE__ */ React19.createElement(ErrorBoundaryFallback, null) }, /* @__PURE__ */ React19.createElement(Panel, null, /* @__PURE__ */ React19.createElement(SearchAndFilterProvider, null, /* @__PURE__ */ React19.createElement(PanelHeader, null, /* @__PURE__ */ React19.createElement(Stack9, { p: 1, pl: 2, width: "100%", direction: "row", alignItems: "center" }, /* @__PURE__ */ React19.createElement(Stack9, { width: "100%", direction: "row", gap: 1 }, /* @__PURE__ */ React19.createElement(PanelHeaderTitle, { sx: { display: "flex", alignItems: "center", gap: 0.5 } }, /* @__PURE__ */ React19.createElement(FlippedColorSwatchIcon, { fontSize: "inherit" }), __15("Class Manager", "elementor")), /* @__PURE__ */ React19.createElement(TotalCssClassCounter, null)), /* @__PURE__ */ React19.createElement(
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
    PanelBody,
    {
      sx: {
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }
    },
    /* @__PURE__ */ React19.createElement(Box11, { px: 2, pb: 1 }, /* @__PURE__ */ React19.createElement(Stack9, { direction: "row", justifyContent: "spaceBetween", gap: 0.5, sx: { pb: 0.5 } }, /* @__PURE__ */ React19.createElement(Box11, { sx: { flexGrow: 1 } }, /* @__PURE__ */ React19.createElement(ClassManagerSearch, null)), /* @__PURE__ */ React19.createElement(CssClassFilter, null)), /* @__PURE__ */ React19.createElement(ActiveFilters, null)),
    /* @__PURE__ */ React19.createElement(Divider4, null),
    /* @__PURE__ */ React19.createElement(
      Box11,
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
  ), /* @__PURE__ */ React19.createElement(PanelFooter, null, /* @__PURE__ */ React19.createElement(
    Button3,
    {
      fullWidth: true,
      size: "small",
      color: "global",
      variant: "contained",
      onClick: publish,
      disabled: !isDirty2,
      loading: isPublishing
    },
    __15("Save changes", "elementor")
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
  ), isSaveChangesDialogOpen && /* @__PURE__ */ React19.createElement(SaveChangesDialog, null, /* @__PURE__ */ React19.createElement(DialogHeader2, { onClose: closeSaveChangesDialog, logo: false }, /* @__PURE__ */ React19.createElement(SaveChangesDialog.Title, null, __15("You have unsaved changes", "elementor"))), /* @__PURE__ */ React19.createElement(SaveChangesDialog.Content, null, /* @__PURE__ */ React19.createElement(SaveChangesDialog.ContentText, null, __15("You have unsaved changes in the Class Manager.", "elementor")), /* @__PURE__ */ React19.createElement(SaveChangesDialog.ContentText, null, __15("To avoid losing your updates, save your changes before leaving.", "elementor"))), /* @__PURE__ */ React19.createElement(
    SaveChangesDialog.Actions,
    {
      actions: {
        discard: {
          label: __15("Discard", "elementor"),
          action: () => {
            resetAndClosePanel();
          }
        },
        confirm: {
          label: __15("Save & Continue", "elementor"),
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
var CloseButton = ({ onClose, ...props }) => /* @__PURE__ */ React19.createElement(IconButton4, { size: "small", color: "secondary", onClick: onClose, "aria-label": "Close", ...props }, /* @__PURE__ */ React19.createElement(XIcon, { fontSize: "small" }));
var ErrorBoundaryFallback = () => /* @__PURE__ */ React19.createElement(Box11, { role: "alert", sx: { minHeight: "100%", p: 2 } }, /* @__PURE__ */ React19.createElement(Alert2, { severity: "error", sx: { mb: 2, maxWidth: 400, textAlign: "center" } }, /* @__PURE__ */ React19.createElement("strong", null, __15("Something went wrong", "elementor"))));
var usePreventUnload = () => {
  const isDirty2 = useDirtyState();
  useEffect3(() => {
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
  return useMutation({
    mutationFn: () => saveGlobalClasses({ context: "frontend" }),
    onSuccess: async () => {
      setDocumentModifiedStatus(false);
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
    Chip4,
    {
      size: "small",
      label: filters ? `${filters.length} / ${cssClasses?.length}` : cssClasses?.length
    }
  );
};
var StopSyncConfirmationDialog = ({ open, onClose, onConfirm }) => {
  const [, suppressStopSyncMessage] = useSuppressedMessage2(STOP_SYNC_MESSAGE_KEY);
  return /* @__PURE__ */ React19.createElement(ConfirmationDialog2, { open, onClose }, /* @__PURE__ */ React19.createElement(ConfirmationDialog2.Title, { icon: FlippedColorSwatchIcon, iconColor: "primary" }, __15("Un-sync typography class", "elementor")), /* @__PURE__ */ React19.createElement(ConfirmationDialog2.Content, null, /* @__PURE__ */ React19.createElement(ConfirmationDialog2.ContentText, null, __15("You're about to stop syncing a typography class to version 3.", "elementor")), /* @__PURE__ */ React19.createElement(ConfirmationDialog2.ContentText, { sx: { mt: 1 } }, __15(
    "Note that if it's being used anywhere, the affected elements will inherit the default typography.",
    "elementor"
  ))), /* @__PURE__ */ React19.createElement(
    ConfirmationDialog2.Actions,
    {
      onClose,
      onConfirm,
      cancelLabel: __15("Cancel", "elementor"),
      confirmLabel: __15("Got it", "elementor"),
      color: "primary",
      onSuppressMessage: suppressStopSyncMessage,
      suppressLabel: __15("Don't show again", "elementor")
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
  const document = useActiveDocument2();
  const { open: openPanel } = usePanelActions();
  const { save: saveDocument } = useActiveDocumentActions();
  const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog2();
  const { prefetchClassesUsage } = usePrefetchCssClassUsage();
  const { userCan } = useUserStylesCapability();
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
  return /* @__PURE__ */ React20.createElement(React20.Fragment, null, /* @__PURE__ */ React20.createElement(Tooltip6, { title: __16("Class Manager", "elementor"), placement: "top" }, /* @__PURE__ */ React20.createElement(IconButton5, { size: "tiny", onClick: handleOpenPanel, sx: { marginInlineEnd: -0.75 } }, /* @__PURE__ */ React20.createElement(FlippedColorSwatchIcon, { fontSize: "tiny" }))), isSaveChangesDialogOpen && /* @__PURE__ */ React20.createElement(SaveChangesDialog2, null, /* @__PURE__ */ React20.createElement(SaveChangesDialog2.Title, null, __16("You have unsaved changes", "elementor")), /* @__PURE__ */ React20.createElement(SaveChangesDialog2.Content, null, /* @__PURE__ */ React20.createElement(SaveChangesDialog2.ContentText, { sx: { mb: 2 } }, __16(
    "To open the Class Manager, save your page first. You can't continue without saving.",
    "elementor"
  ))), /* @__PURE__ */ React20.createElement(
    SaveChangesDialog2.Actions,
    {
      actions: {
        cancel: {
          label: __16("Stay here", "elementor"),
          action: closeSaveChangesDialog
        },
        confirm: {
          label: __16("Save & Continue", "elementor"),
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
import * as React21 from "react";
import { validateStyleLabel as validateStyleLabel2 } from "@elementor/editor-styles-repository";
import { MenuListItem as MenuListItem2 } from "@elementor/editor-ui";
import { Divider as Divider5 } from "@elementor/ui";
import { __ as __17 } from "@wordpress/i18n";
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
    MenuListItem2,
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
    __17("Convert to global class", "elementor")
  ), /* @__PURE__ */ React21.createElement(Divider5, null));
};
function createClassName(prefix) {
  let i = 1;
  let newClassName = `${prefix}${i}`;
  while (!validateStyleLabel2(newClassName, "create").isValid) {
    newClassName = `${prefix}${++i}`;
  }
  return newClassName;
}

// src/components/open-panel-from-url.tsx
import { useEffect as useEffect4, useRef as useRef2 } from "react";
import { __privateListenTo as listenTo, routeOpenEvent } from "@elementor/editor-v1-adapters";
var ACTIVE_PANEL_PARAM = "active-panel";
var PANEL_ID = "global-classes-manager";
var DEFAULT_PANEL_ROUTE = "panel/elements";
function OpenPanelFromUrl() {
  const { open } = usePanelActions();
  const hasOpened = useRef2(false);
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

// src/components/populate-store.tsx
import { useEffect as useEffect5 } from "react";
import { __useDispatch as useDispatch2 } from "@elementor/store";
function PopulateStore() {
  const dispatch5 = useDispatch2();
  useEffect5(() => {
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
import { getMCPByDomain as getMCPByDomain2 } from "@elementor/editor-mcp";

// src/mcp-integration/mcp-apply-unapply-global-classes.ts
import { doApplyClasses, doGetAppliedClasses, doUnapplyClass } from "@elementor/editor-editing-panel";
import { z } from "@elementor/schema";
function initMcpApplyUnapplyGlobalClasses(server) {
  server.addTool({
    schema: {
      classId: z.string().describe("The ID of the class to apply"),
      elementId: z.string().describe("The ID of the element to which the class will be applied")
    },
    outputSchema: {
      result: z.string().describe("Result message indicating the success of the apply operation"),
      llm_instructions: z.string().describe("Instructions what to do next, Important to follow these instructions!")
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
      const appliedClasses = doGetAppliedClasses(elementId);
      doApplyClasses(elementId, [...appliedClasses, classId]);
      return {
        llm_instructions: "Please check the element-configuration, find DUPLICATES in the style schema that are in the class, and remove them",
        result: `Class ${classId} applied to element ${elementId} successfully.`
      };
    }
  });
  server.addTool({
    name: "unapply-global-class",
    schema: {
      classId: z.string().describe("The ID of the class to unapply"),
      elementId: z.string().describe("The ID of the element from which the class will be unapplied")
    },
    outputSchema: {
      result: z.string().describe("Result message indicating the success of the unapply operation")
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
      const ok = doUnapplyClass(elementId, classId);
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
import { z as z2 } from "@elementor/schema";
function initMcpApplyGetGlobalClassUsages(reg) {
  const { addTool } = reg;
  const globalClassesUsageSchema = {
    usages: z2.array(
      z2.object({
        classId: z2.string().describe(
          'The ID of the class, not visible to the user. To retreive the name of the class, use the "list-global-classes" tool'
        ),
        usages: z2.array(
          z2.object({
            pageId: z2.string().describe("The ID of the page where the class is used"),
            title: z2.string().describe("The title of the page where the class is used"),
            total: z2.number().describe("The number of times the class is used on this page"),
            elements: z2.array(z2.string()).describe("List of element IDs using this class on the page")
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
import { BREAKPOINTS_SCHEMA_URI, STYLE_SCHEMA_URI } from "@elementor/editor-canvas";
import { Schema } from "@elementor/editor-props";
import { getStylesSchema } from "@elementor/editor-styles";
import { z as z3 } from "@elementor/schema";
var schema = {
  action: z3.enum(["create", "modify", "delete"]).describe("Operation to perform"),
  classId: z3.string().optional().describe("Global class ID (required for modify). Get from elementor://global-classes resource."),
  globalClassName: z3.string().optional().describe("Global class name (required for create)"),
  props: z3.object({
    default: z3.record(z3.any()).describe(
      'key-value of style-schema PropValues. Available properties at dynamic resource "elementor://styles/schema/{property-name}"'
    ),
    hover: z3.record(z3.any()).describe("key-value of style-schema PropValues, for :hover css state. optional").optional(),
    focus: z3.record(z3.any()).describe("key-value of style-schema PropValues, for :focus css state. optional").optional(),
    active: z3.record(z3.any()).describe("key-value of style-schema PropValues, for :active css state. optional").optional()
  }),
  breakpoint: z3.nullable(z3.string().describe("Responsive breakpoint name for styles. Defaults to desktop (null).")).default(null).describe("Responsive breakpoint name for styles. Defaults to desktop (null).")
};
var outputSchema = {
  status: z3.enum(["ok", "error"]).describe("Operation status"),
  classId: z3.string().optional().describe("Class ID (returned on create success)"),
  message: z3.string().optional().describe("Error details if status is error")
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
  const stylesSchema = getStylesSchema();
  const validProps = Object.keys(stylesSchema);
  Object.values(propsWithStates).forEach((props) => {
    Object.keys(props).forEach((key) => {
      const propType = stylesSchema[key];
      if (!propType) {
        errors.push(`Property "${key}" does not exist in styles schema.`);
        return;
      }
      const { valid, jsonSchema } = Schema.validatePropValue(propType, props[key]);
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
      props[key] = Schema.adjustLlmPropValueSchema(props[key], {
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
      { uri: STYLE_SCHEMA_URI, description: "Style schema resources" },
      { uri: BREAKPOINTS_SCHEMA_URI, description: "Breakpoints list" }
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
  const reg = getMCPByDomain2("classes", {
    instructions: "MCP server for management of Elementor global classes"
  });
  initMcpApplyUnapplyGlobalClasses(reg);
  initMcpApplyGetGlobalClassUsages(reg);
  initManageGlobalClasses(reg);
  initClassesResource();
};

// src/sync-with-document.tsx
import { useEffect as useEffect6 } from "react";
import { __privateListenTo as listenTo2, v1ReadyEvent } from "@elementor/editor-v1-adapters";

// src/sync-with-document-save.ts
import { getCurrentUser } from "@elementor/editor-current-user";
import { setDocumentModifiedStatus as setDocumentModifiedStatus2 } from "@elementor/editor-documents";
import { registerDataHook } from "@elementor/editor-v1-adapters";
import { __getState as getState4, __subscribeWithSelector as subscribeWithSelector2 } from "@elementor/store";
function syncWithDocumentSave(panelActions) {
  const unsubscribe = syncDirtyState();
  bindSaveAction(panelActions);
  return unsubscribe;
}
function syncDirtyState() {
  return subscribeWithSelector2(selectIsDirty, () => {
    if (!isDirty()) {
      return;
    }
    setDocumentModifiedStatus2(true);
  });
}
function bindSaveAction(panelActions) {
  registerDataHook("dependency", "document/save/save", (args) => {
    const user = getCurrentUser();
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
  return selectIsDirty(getState4());
}

// src/sync-with-document.tsx
function SyncWithDocumentSave() {
  const panelActions = usePanelActions();
  useEffect6(() => {
    listenTo2(v1ReadyEvent(), () => {
      syncWithDocumentSave(panelActions);
    });
  }, []);
  return null;
}

// src/init.ts
function init() {
  registerSlice(slice);
  registerPanel(panel);
  stylesRepository.register(globalClassesStylesProvider);
  injectIntoLogic({
    id: "global-classes-populate-store",
    component: PopulateStore
  });
  injectIntoLogic({
    id: "global-classes-sync-with-document",
    component: SyncWithDocumentSave
  });
  injectIntoLogic({
    id: "global-classes-prefetch-css-class-usage",
    component: PrefetchCssClassUsage
  });
  injectIntoLogic({
    id: "global-classes-open-panel-from-url",
    component: OpenPanelFromUrl
  });
  injectIntoCssClassConvert({
    id: "global-classes-convert-from-local-class",
    component: ConvertLocalClassToGlobalClass
  });
  injectIntoClassSelectorActions({
    id: "global-classes-manager-button",
    component: ClassManagerButton
  });
  registerStyleProviderToColors(GLOBAL_CLASSES_PROVIDER_KEY, {
    name: "global",
    getThemeColor: (theme) => theme.palette.global.dark
  });
  initMcpIntegration();
}
export {
  GLOBAL_CLASSES_URI,
  init
};
//# sourceMappingURL=index.mjs.map