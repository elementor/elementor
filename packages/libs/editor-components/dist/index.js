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
var import_editor2 = require("@elementor/editor");
var import_editor_canvas8 = require("@elementor/editor-canvas");
var import_editor_documents14 = require("@elementor/editor-documents");
var import_editor_editing_panel9 = require("@elementor/editor-editing-panel");
var import_editor_elements_panel2 = require("@elementor/editor-elements-panel");
var import_editor_styles_repository2 = require("@elementor/editor-styles-repository");
var import_editor_v1_adapters13 = require("@elementor/editor-v1-adapters");
var import_store86 = require("@elementor/store");
var import_i18n33 = require("@wordpress/i18n");

// src/component-instance-transformer.ts
var import_editor_canvas = require("@elementor/editor-canvas");
var import_store3 = require("@elementor/store");

// src/store/store.ts
var import_store2 = require("@elementor/store");

// src/store/thunks.ts
var import_store = require("@elementor/store");

// src/api.ts
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var import_http_client = require("@elementor/http-client");
var BASE_URL = "elementor/v1/components";
var getParams = (id2) => ({
  action: "get_document_config",
  unique_id: `document-config-${id2}`,
  data: { id: id2 }
});
var apiClient = {
  get: () => (0, import_http_client.httpService)().get(`${BASE_URL}`).then((res) => res.data.data),
  create: (payload) => (0, import_http_client.httpService)().post(`${BASE_URL}`, payload).then((res) => res.data.data),
  updateStatuses: (ids, status) => (0, import_http_client.httpService)().put(`${BASE_URL}/status`, {
    ids,
    status
  }),
  getComponentConfig: (id2) => import_editor_v1_adapters.ajax.load(getParams(id2)),
  invalidateComponentConfigCache: (id2) => import_editor_v1_adapters.ajax.invalidateCache(getParams(id2)),
  getComponentLockStatus: async (componentId) => await (0, import_http_client.httpService)().get(`${BASE_URL}/lock-status`, {
    params: {
      componentId
    }
  }).then((res) => {
    const { is_current_user_allow_to_edit: isAllowedToSwitchDocument, locked_by: lockedBy } = res.data.data;
    return { isAllowedToSwitchDocument, lockedBy: lockedBy || "" };
  }),
  lockComponent: async (componentId) => await (0, import_http_client.httpService)().post(`${BASE_URL}/lock`, {
    componentId
  }).then((res) => res.data),
  unlockComponent: async (componentId) => await (0, import_http_client.httpService)().post(`${BASE_URL}/unlock`, {
    componentId
  }).then((res) => res.data),
  getOverridableProps: async (componentId) => await (0, import_http_client.httpService)().get(`${BASE_URL}/overridable-props`, {
    params: {
      componentId: componentId.toString()
    }
  }).then((res) => res.data.data),
  updateArchivedComponents: async (componentIds, status) => await (0, import_http_client.httpService)().post(
    `${BASE_URL}/archive`,
    {
      componentIds,
      status
    }
  ).then((res) => res.data.data),
  updateComponentTitle: (updatedComponentNames, status) => (0, import_http_client.httpService)().post(
    `${BASE_URL}/update-titles`,
    {
      components: updatedComponentNames,
      status
    }
  ).then((res) => res.data.data),
  validate: async (payload) => await (0, import_http_client.httpService)().post(`${BASE_URL}/create-validate`, payload).then((res) => res.data)
};

// src/store/thunks.ts
var loadComponents = (0, import_store.__createAsyncThunk)("components/load", async () => {
  const response = await apiClient.get();
  return response;
});

// src/store/store.ts
var initialState = {
  data: [],
  unpublishedData: [],
  loadStatus: "idle",
  styles: {},
  createdThisSession: [],
  archivedThisSession: [],
  path: [],
  currentComponentId: null,
  updatedComponentNames: {},
  sanitized: {}
};
var SLICE_NAME = "components";
var slice = (0, import_store2.__createSlice)({
  name: SLICE_NAME,
  initialState,
  reducers: {
    add: (state, { payload }) => {
      if (Array.isArray(payload)) {
        state.data = [...payload, ...state.data];
      } else {
        state.data.unshift(payload);
      }
    },
    load: (state, { payload }) => {
      state.data = payload;
    },
    addUnpublished: (state, { payload }) => {
      state.unpublishedData.unshift(payload);
    },
    removeUnpublished: (state, { payload }) => {
      const uidsToRemove = Array.isArray(payload) ? payload : [payload];
      state.unpublishedData = state.unpublishedData.filter(
        (component) => !uidsToRemove.includes(component.uid)
      );
    },
    resetUnpublished: (state) => {
      state.unpublishedData = [];
    },
    removeStyles(state, { payload }) {
      const { [payload.id]: _, ...rest } = state.styles;
      state.styles = rest;
    },
    addStyles: (state, { payload }) => {
      state.styles = { ...state.styles, ...payload };
    },
    addCreatedThisSession: (state, { payload }) => {
      state.createdThisSession.push(payload);
    },
    removeCreatedThisSession: (state, { payload }) => {
      state.createdThisSession = state.createdThisSession.filter((uid) => uid !== payload);
    },
    archive: (state, { payload }) => {
      const component = state.data.find((comp) => comp.id === payload);
      if (component) {
        component.isArchived = true;
        state.archivedThisSession.push(payload);
      }
    },
    setCurrentComponentId: (state, { payload }) => {
      state.currentComponentId = payload;
    },
    setPath: (state, { payload }) => {
      state.path = payload;
    },
    setOverridableProps: (state, { payload }) => {
      const component = state.data.find((comp) => comp.id === payload.componentId);
      if (!component) {
        return;
      }
      component.overridableProps = payload.overridableProps;
    },
    rename: (state, { payload }) => {
      const component = state.data.find((comp) => comp.uid === payload.componentUid);
      if (!component) {
        return;
      }
      if (component.id) {
        state.updatedComponentNames[component.id] = payload.name;
      }
      component.name = payload.name;
    },
    cleanUpdatedComponentNames: (state) => {
      state.updatedComponentNames = {};
    },
    updateComponentSanitizedAttribute: (state, {
      payload: { componentId, attribute }
    }) => {
      if (!state.sanitized[componentId]) {
        state.sanitized[componentId] = {};
      }
      state.sanitized[componentId][attribute] = true;
    },
    resetSanitizedComponents: (state) => {
      state.sanitized = {};
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loadComponents.fulfilled, (state, { payload }) => {
      state.data = payload;
      state.loadStatus = "idle";
    });
    builder.addCase(loadComponents.pending, (state) => {
      state.loadStatus = "pending";
    });
    builder.addCase(loadComponents.rejected, (state) => {
      state.loadStatus = "error";
    });
  }
});
var selectData = (state) => state[SLICE_NAME].data;
var selectArchivedThisSession = (state) => state[SLICE_NAME].archivedThisSession;
var selectLoadStatus = (state) => state[SLICE_NAME].loadStatus;
var selectStylesDefinitions = (state) => state[SLICE_NAME].styles ?? {};
var selectUnpublishedData = (state) => state[SLICE_NAME].unpublishedData;
var getCreatedThisSession = (state) => state[SLICE_NAME].createdThisSession;
var getPath = (state) => state[SLICE_NAME].path;
var getCurrentComponentId = (state) => state[SLICE_NAME].currentComponentId;
var selectComponent = (state, componentId) => state[SLICE_NAME].data.find((component) => component.id === componentId);
var useComponent = (componentId) => {
  return (0, import_store2.__useSelector)((state) => componentId ? selectComponent(state, componentId) : null);
};
var selectComponentByUid = (state, componentUid) => state[SLICE_NAME].data.find((component) => component.uid === componentUid) ?? state[SLICE_NAME].unpublishedData.find((component) => component.uid === componentUid);
var selectComponents = (0, import_store2.__createSelector)(
  selectData,
  selectUnpublishedData,
  (data, unpublishedData) => [
    ...unpublishedData.map((item) => ({
      uid: item.uid,
      name: item.name,
      overridableProps: item.overridableProps
    })),
    ...data.filter((component) => !component.isArchived)
  ]
);
var selectUnpublishedComponents = (0, import_store2.__createSelector)(
  selectUnpublishedData,
  (unpublishedData) => unpublishedData
);
var selectLoadIsPending = (0, import_store2.__createSelector)(selectLoadStatus, (status) => status === "pending");
var selectLoadIsError = (0, import_store2.__createSelector)(selectLoadStatus, (status) => status === "error");
var selectStyles = (state) => state[SLICE_NAME].styles ?? {};
var selectFlatStyles = (0, import_store2.__createSelector)(selectStylesDefinitions, (data) => Object.values(data).flat());
var selectCreatedThisSession = (0, import_store2.__createSelector)(
  getCreatedThisSession,
  (createdThisSession) => createdThisSession
);
var DEFAULT_OVERRIDABLE_PROPS = {
  props: {},
  groups: {
    items: {},
    order: []
  }
};
var selectOverridableProps = (0, import_store2.__createSelector)(
  selectComponent,
  (component) => {
    if (!component) {
      return void 0;
    }
    return component.overridableProps ?? DEFAULT_OVERRIDABLE_PROPS;
  }
);
var useOverridableProps = (componentId) => {
  return (0, import_store2.__useSelector)(
    (state) => componentId ? selectOverridableProps(state, componentId) : null
  );
};
var selectIsOverridablePropsLoaded = (0, import_store2.__createSelector)(
  selectComponent,
  (component) => {
    return !!component?.overridableProps;
  }
);
var selectPath = (0, import_store2.__createSelector)(getPath, (path) => path);
var selectCurrentComponentId = (0, import_store2.__createSelector)(
  getCurrentComponentId,
  (currentComponentId) => currentComponentId
);
var selectCurrentComponent = (0, import_store2.__createSelector)(
  selectData,
  getCurrentComponentId,
  (data, currentComponentId) => data.find((component) => component.id === currentComponentId)
);
var useCurrentComponentId = () => {
  return (0, import_store2.__useSelector)(selectCurrentComponentId);
};
var useCurrentComponent = () => {
  return (0, import_store2.__useSelector)(selectCurrentComponent);
};
var selectUpdatedComponentNames = (0, import_store2.__createSelector)(
  (state) => state[SLICE_NAME].updatedComponentNames,
  (updatedComponentNames) => Object.entries(updatedComponentNames).map(([componentId, title]) => ({
    componentId: Number(componentId),
    title
  }))
);
var useSanitizedComponents = () => {
  return (0, import_store2.__useSelector)((state) => state[SLICE_NAME].sanitized);
};
var useIsSanitizedComponent = (componentId, key) => {
  const sanitizedComponents = useSanitizedComponents();
  if (!componentId) {
    return false;
  }
  return !!sanitizedComponents[componentId]?.[key];
};

// src/utils/component-document-data.ts
var import_editor_documents = require("@elementor/editor-documents");
var getComponentDocumentData = async (id2) => {
  const documentManager = (0, import_editor_documents.getV1DocumentsManager)();
  try {
    return await documentManager.request(id2);
  } catch {
    return null;
  }
};

// src/component-instance-transformer.ts
var componentInstanceTransformer = (0, import_editor_canvas.createTransformer)(
  async ({
    component_id: id2,
    overrides: overridesValue
  }) => {
    const unpublishedComponents = selectUnpublishedComponents((0, import_store3.__getState)());
    const unpublishedComponent = unpublishedComponents.find(({ uid }) => uid === id2);
    const overrides = overridesValue?.reduce((acc, override) => ({ ...acc, ...override }), {});
    if (unpublishedComponent) {
      return {
        elements: structuredClone(unpublishedComponent.elements),
        overrides
      };
    }
    if (typeof id2 !== "number") {
      throw new Error(`Component ID "${id2}" not valid.`);
    }
    const data = await getComponentDocumentData(id2);
    return {
      elements: data?.elements ?? [],
      overrides
    };
  }
);

// src/component-overridable-transformer.ts
var import_editor_canvas2 = require("@elementor/editor-canvas");
var componentOverridableTransformer = (0, import_editor_canvas2.createTransformer)(
  (value, options) => {
    const { overrides } = options.renderContext ?? {};
    const overrideValue = overrides?.[value.override_key];
    if (overrideValue) {
      const isOverride = isOriginValueOverride(value.origin_value);
      if (isOverride) {
        return transformOverride(value, options, overrideValue);
      }
      return overrideValue;
    }
    return value.origin_value;
  }
);
function transformOverride(value, options, overrideValue) {
  const transformer = import_editor_canvas2.settingsTransformersRegistry.get("override");
  if (!transformer) {
    return null;
  }
  const transformedValue = transformer(value.origin_value.value, options);
  if (!transformedValue) {
    return null;
  }
  const [key] = Object.keys(transformedValue);
  return {
    [key]: overrideValue
  };
}
function isOriginValueOverride(originValue) {
  return originValue.$$type === "override";
}

// src/component-override-transformer.ts
var import_editor_canvas3 = require("@elementor/editor-canvas");
var componentOverrideTransformer = (0, import_editor_canvas3.createTransformer)((override) => {
  const { override_key: key, override_value: overrideValue } = override;
  return { [key]: overrideValue };
});

// src/components/components-tab/components.tsx
var React7 = __toESM(require("react"));
var import_editor_ui3 = require("@elementor/editor-ui");

// src/hooks/use-components.ts
var import_store5 = require("@elementor/store");
var useComponents = () => {
  const components = (0, import_store5.__useSelector)(selectComponents);
  const isLoading = (0, import_store5.__useSelector)(selectLoadIsPending);
  return { components, isLoading };
};

// src/components/components-tab/component-search.tsx
var React2 = __toESM(require("react"));
var import_icons = require("@elementor/icons");
var import_ui = require("@elementor/ui");
var import_i18n = require("@wordpress/i18n");

// src/components/components-tab/search-provider.tsx
var React = __toESM(require("react"));
var import_react = require("react");
var import_utils = require("@elementor/utils");
var SearchContext = (0, import_react.createContext)(void 0);
var SearchProvider = ({
  children,
  localStorageKey
}) => {
  const { debouncedValue, handleChange, inputValue } = (0, import_utils.useSearchState)({ localStorageKey });
  const clearSearch = () => {
    handleChange("");
  };
  return /* @__PURE__ */ React.createElement(SearchContext.Provider, { value: { handleChange, clearSearch, searchValue: debouncedValue, inputValue } }, children);
};
var useSearch = () => {
  const context = (0, import_react.useContext)(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

// src/components/components-tab/component-search.tsx
var ComponentSearch = () => {
  const { inputValue, handleChange } = useSearch();
  return /* @__PURE__ */ React2.createElement(import_ui.Stack, { direction: "row", gap: 0.5, sx: { width: "100%", px: 2, py: 1.5 } }, /* @__PURE__ */ React2.createElement(import_ui.Box, { sx: { flexGrow: 1 } }, /* @__PURE__ */ React2.createElement(
    import_ui.TextField,
    {
      role: "search",
      fullWidth: true,
      size: "tiny",
      value: inputValue,
      placeholder: (0, import_i18n.__)("Search", "elementor"),
      onChange: (e) => handleChange(e.target.value),
      InputProps: {
        startAdornment: /* @__PURE__ */ React2.createElement(import_ui.InputAdornment, { position: "start" }, /* @__PURE__ */ React2.createElement(import_icons.SearchIcon, { fontSize: "tiny" }))
      }
    }
  )));
};

// src/components/components-tab/components-list.tsx
var React5 = __toESM(require("react"));
var import_icons3 = require("@elementor/icons");
var import_ui4 = require("@elementor/ui");
var import_i18n2 = require("@wordpress/i18n");

// src/hooks/use-components-permissions.ts
var import_editor_current_user = require("@elementor/editor-current-user");
var useComponentsPermissions = () => {
  const { isAdmin } = (0, import_editor_current_user.useCurrentUserCapabilities)();
  return {
    canCreate: isAdmin,
    canEdit: isAdmin,
    canDelete: isAdmin,
    canRename: isAdmin
  };
};

// src/components/components-tab/components-item.tsx
var React3 = __toESM(require("react"));
var import_react2 = require("react");
var import_editor_ui = require("@elementor/editor-ui");
var import_icons2 = require("@elementor/icons");
var import_ui2 = require("@elementor/ui");
var ComponentItem = (0, import_react2.forwardRef)(
  ({
    component,
    disabled = true,
    draggable,
    onDragStart,
    onDragEnd,
    onClick,
    isEditing = false,
    error = null,
    nameSlot,
    endSlot,
    ...props
  }, ref) => {
    return /* @__PURE__ */ React3.createElement(
      import_ui2.ListItemButton,
      {
        disabled,
        draggable,
        onDragStart,
        onDragEnd,
        shape: "rounded",
        ref,
        sx: {
          border: "solid 1px",
          borderColor: "divider",
          py: 0.5,
          px: 1,
          display: "flex",
          width: "100%",
          alignItems: "center",
          gap: 1
        },
        ...props
      },
      /* @__PURE__ */ React3.createElement(import_ui2.Box, { display: "flex", alignItems: "center", gap: 1, minWidth: 0, flexGrow: 1, onClick }, /* @__PURE__ */ React3.createElement(import_ui2.ListItemIcon, { size: "tiny" }, /* @__PURE__ */ React3.createElement(import_icons2.ComponentsIcon, { fontSize: "tiny" })), /* @__PURE__ */ React3.createElement(Indicator, { isActive: isEditing, isError: !!error }, /* @__PURE__ */ React3.createElement(import_ui2.Box, { display: "flex", flex: 1, minWidth: 0, flexGrow: 1 }, nameSlot ?? /* @__PURE__ */ React3.createElement(ComponentName, { name: component.name })))),
      endSlot
    );
  }
);
var Indicator = (0, import_ui2.styled)(import_ui2.Box, {
  shouldForwardProp: (prop) => prop !== "isActive" && prop !== "isError"
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
function ComponentName({ name, editable }) {
  if (editable?.isEditing) {
    return /* @__PURE__ */ React3.createElement(import_editor_ui.EditableField, { ref: editable.ref, as: import_ui2.Typography, variant: "caption", ...editable.getProps() });
  }
  return /* @__PURE__ */ React3.createElement(import_editor_ui.EllipsisWithTooltip, { title: name, as: import_ui2.Typography, variant: "caption", color: "text.primary" });
}

// src/components/components-tab/loading-components.tsx
var React4 = __toESM(require("react"));
var import_ui3 = require("@elementor/ui");
var ROWS = Array.from({ length: 6 }, (_, index) => index);
var LoadingComponents = () => {
  return /* @__PURE__ */ React4.createElement(
    import_ui3.Stack,
    {
      "aria-label": "Loading components",
      gap: 1,
      sx: {
        pointerEvents: "none",
        position: "relative",
        maxHeight: "300px",
        overflow: "hidden",
        "&:after": {
          position: "absolute",
          top: 0,
          content: '""',
          left: 0,
          width: "100%",
          height: "300px",
          background: "linear-gradient(to top, white, transparent)",
          pointerEvents: "none"
        }
      }
    },
    ROWS.map((row) => /* @__PURE__ */ React4.createElement(
      import_ui3.ListItemButton,
      {
        key: row,
        sx: { border: "solid 1px", borderColor: "divider", py: 0.5, px: 1 },
        shape: "rounded"
      },
      /* @__PURE__ */ React4.createElement(import_ui3.Box, { display: "flex", gap: 1, width: "100%" }, /* @__PURE__ */ React4.createElement(import_ui3.Skeleton, { variant: "text", width: "24px", height: "36px" }), /* @__PURE__ */ React4.createElement(import_ui3.Skeleton, { variant: "text", width: "100%", height: "36px" }))
    ))
  );
};

// src/components/components-tab/components-list.tsx
var LEARN_MORE_URL = "http://go.elementor.com/components-guide-article";
var SUBTITLE_OVERRIDE_SX = {
  fontSize: "0.875rem !important",
  fontWeight: "500 !important"
};
function ComponentsList() {
  const { components, isLoading, searchValue } = useFilteredComponents();
  if (isLoading) {
    return /* @__PURE__ */ React5.createElement(LoadingComponents, null);
  }
  const isEmpty = !components?.length;
  if (isEmpty) {
    return searchValue.length ? /* @__PURE__ */ React5.createElement(EmptySearchResult, null) : /* @__PURE__ */ React5.createElement(EmptyState, null);
  }
  return /* @__PURE__ */ React5.createElement(import_ui4.List, { sx: { display: "flex", flexDirection: "column", gap: 1, px: 2 } }, components.map((component) => /* @__PURE__ */ React5.createElement(ComponentItem, { key: component.uid, component })));
}
var EmptyState = () => {
  const { canCreate } = useComponentsPermissions();
  return /* @__PURE__ */ React5.createElement(
    import_ui4.Stack,
    {
      alignItems: "center",
      justifyContent: "start",
      height: "100%",
      sx: { px: 2, py: 4 },
      gap: 2,
      overflow: "hidden"
    },
    /* @__PURE__ */ React5.createElement(import_ui4.Stack, { alignItems: "center", gap: 1 }, /* @__PURE__ */ React5.createElement(import_icons3.ComponentsIcon, { fontSize: "large", sx: { color: "text.secondary" } }), /* @__PURE__ */ React5.createElement(import_ui4.Typography, { align: "center", variant: "subtitle2", color: "text.secondary", sx: SUBTITLE_OVERRIDE_SX }, (0, import_i18n2.__)("No components yet", "elementor")), /* @__PURE__ */ React5.createElement(import_ui4.Typography, { align: "center", variant: "caption", color: "secondary", sx: { maxWidth: 200 } }, (0, import_i18n2.__)("Components are reusable blocks that sync across your site.", "elementor"), /* @__PURE__ */ React5.createElement("br", null), canCreate ? (0, import_i18n2.__)("Create once, use everywhere.", "elementor") : (0, import_i18n2.__)(
      "With your current role, you cannot create components. Contact an administrator to create one.",
      "elementor"
    )), /* @__PURE__ */ React5.createElement(
      import_ui4.Link,
      {
        href: LEARN_MORE_URL,
        target: "_blank",
        rel: "noopener noreferrer",
        variant: "caption",
        color: "info.main"
      },
      (0, import_i18n2.__)("Learn more about components", "elementor")
    )),
    canCreate && /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement(import_ui4.Divider, { sx: { width: "100%" } }), /* @__PURE__ */ React5.createElement(import_ui4.Stack, { alignItems: "center", gap: 1, width: "100%" }, /* @__PURE__ */ React5.createElement(
      import_ui4.Typography,
      {
        align: "center",
        variant: "subtitle2",
        color: "text.secondary",
        sx: SUBTITLE_OVERRIDE_SX
      },
      (0, import_i18n2.__)("Create your first one:", "elementor")
    ), /* @__PURE__ */ React5.createElement(import_ui4.Typography, { align: "center", variant: "caption", color: "secondary", sx: { maxWidth: 228 } }, (0, import_i18n2.__)(
      'Right-click any div-block or flexbox on your canvas or structure and select "Create component"',
      "elementor"
    ))))
  );
};
var EmptySearchResult = () => {
  const { searchValue, clearSearch } = useSearch();
  return /* @__PURE__ */ React5.createElement(
    import_ui4.Stack,
    {
      color: "text.secondary",
      pt: 5,
      alignItems: "center",
      gap: 1,
      overflow: "hidden",
      justifySelf: "center"
    },
    /* @__PURE__ */ React5.createElement(import_icons3.ComponentsIcon, null),
    /* @__PURE__ */ React5.createElement(
      import_ui4.Box,
      {
        sx: {
          width: "100%"
        }
      },
      /* @__PURE__ */ React5.createElement(import_ui4.Typography, { align: "center", variant: "subtitle2", color: "inherit", sx: SUBTITLE_OVERRIDE_SX }, (0, import_i18n2.__)("Sorry, nothing matched", "elementor")),
      searchValue && /* @__PURE__ */ React5.createElement(
        import_ui4.Typography,
        {
          variant: "subtitle2",
          color: "inherit",
          sx: {
            ...SUBTITLE_OVERRIDE_SX,
            display: "flex",
            width: "100%",
            justifyContent: "center"
          }
        },
        /* @__PURE__ */ React5.createElement("span", null, "\u201C"),
        /* @__PURE__ */ React5.createElement(
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
        /* @__PURE__ */ React5.createElement("span", null, "\u201D.")
      )
    ),
    /* @__PURE__ */ React5.createElement(import_ui4.Typography, { align: "center", variant: "caption", color: "inherit" }, (0, import_i18n2.__)("Try something else.", "elementor")),
    /* @__PURE__ */ React5.createElement(import_ui4.Typography, { align: "center", variant: "caption", color: "inherit" }, /* @__PURE__ */ React5.createElement(import_ui4.Link, { color: "secondary", variant: "caption", component: "button", onClick: clearSearch }, (0, import_i18n2.__)("Clear & try again", "elementor")))
  );
};
var useFilteredComponents = () => {
  const { components, isLoading } = useComponents();
  const { searchValue } = useSearch();
  return {
    components: components.filter(
      (component) => component.name.toLowerCase().includes(searchValue.toLowerCase())
    ),
    isLoading,
    searchValue
  };
};

// src/components/components-tab/components-pro-notification.tsx
var React6 = __toESM(require("react"));
var import_editor_ui2 = require("@elementor/editor-ui");
var import_ui5 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");
function ComponentsProNotification() {
  return /* @__PURE__ */ React6.createElement(import_ui5.Box, { sx: { px: 2 } }, /* @__PURE__ */ React6.createElement(import_editor_ui2.InfoAlert, null, /* @__PURE__ */ React6.createElement(import_ui5.Typography, { variant: "caption", component: "span" }, /* @__PURE__ */ React6.createElement(import_ui5.Typography, { variant: "caption", component: "span", fontWeight: "bold" }, (0, import_i18n3.__)("Try Components for free:", "elementor")), " ", (0, import_i18n3.__)(
    "Soon Components will be part of the Pro subscription, but what you create now will remain on your site.",
    "elementor"
  ))));
}

// src/components/components-tab/components.tsx
var ComponentsContent = () => {
  const { components, isLoading } = useComponents();
  const hasComponents = !isLoading && components.length > 0;
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, hasComponents && /* @__PURE__ */ React7.createElement(ComponentSearch, null), hasComponents && /* @__PURE__ */ React7.createElement(ComponentsProNotification, null), /* @__PURE__ */ React7.createElement(ComponentsList, null));
};
var Components = () => {
  return /* @__PURE__ */ React7.createElement(import_editor_ui3.ThemeProvider, null, /* @__PURE__ */ React7.createElement(SearchProvider, { localStorageKey: "elementor-components-search" }, /* @__PURE__ */ React7.createElement(ComponentsContent, null)));
};

// src/components/in-edit-mode.tsx
var React8 = __toESM(require("react"));
var import_editor_ui4 = require("@elementor/editor-ui");
var import_icons4 = require("@elementor/icons");
var import_ui6 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");
var openEditModeDialog = (lockedBy) => {
  (0, import_editor_ui4.openDialog)({
    component: /* @__PURE__ */ React8.createElement(EditModeDialog, { lockedBy })
  });
};
var EditModeDialog = ({ lockedBy }) => {
  const content = (0, import_i18n4.__)("%s is currently editing this document", "elementor").replace("%s", lockedBy);
  return /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement(import_ui6.DialogHeader, { logo: false }, /* @__PURE__ */ React8.createElement(import_ui6.Box, { display: "flex", alignItems: "center", gap: 1 }, /* @__PURE__ */ React8.createElement(import_ui6.Icon, { color: "secondary" }, /* @__PURE__ */ React8.createElement(import_icons4.InfoCircleFilledIcon, { fontSize: "medium" })), /* @__PURE__ */ React8.createElement(import_ui6.Typography, { variant: "subtitle1" }, content))), /* @__PURE__ */ React8.createElement(import_ui6.DialogContent, null, /* @__PURE__ */ React8.createElement(import_ui6.Stack, { spacing: 2, direction: "column" }, /* @__PURE__ */ React8.createElement(import_ui6.Typography, { variant: "body2" }, (0, import_i18n4.__)(
    "You can wait for them to finish or reach out to coordinate your changes together.",
    "elementor"
  )), /* @__PURE__ */ React8.createElement(import_ui6.DialogActions, null, /* @__PURE__ */ React8.createElement(import_ui6.Button, { color: "secondary", variant: "contained", onClick: import_editor_ui4.closeDialog }, (0, import_i18n4.__)("Close", "elementor"))))));
};

// src/components/instance-editing-panel/instance-editing-panel.tsx
var React17 = __toESM(require("react"));
var import_icons7 = require("@elementor/icons");
var import_ui13 = require("@elementor/ui");
var import_i18n6 = require("@wordpress/i18n");

// src/provider/component-instance-context.tsx
var React9 = __toESM(require("react"));
var import_react3 = require("react");
var ComponentInstanceContext = (0, import_react3.createContext)(null);
function ComponentInstanceProvider({ children, ...props }) {
  return /* @__PURE__ */ React9.createElement(ComponentInstanceContext.Provider, { value: props }, children);
}
var useComponentId = () => (0, import_react3.useContext)(ComponentInstanceContext)?.componentId;
var useComponentInstanceOverrides = () => (0, import_react3.useContext)(ComponentInstanceContext)?.overrides;
var useComponentOverridableProps = () => (0, import_react3.useContext)(ComponentInstanceContext)?.overridableProps;

// src/components/instance-editing-panel/empty-state.tsx
var React10 = __toESM(require("react"));
var import_icons5 = require("@elementor/icons");
var import_ui7 = require("@elementor/ui");
var import_i18n5 = require("@wordpress/i18n");
var EmptyState2 = ({ onEditComponent }) => {
  const { canEdit } = useComponentsPermissions();
  const message = canEdit ? (0, import_i18n5.__)(
    "Edit the component to add properties, manage them or update the design across all instances.",
    "elementor"
  ) : (0, import_i18n5.__)(
    "With your current role, you cannot edit this component. Contact an administrator to add properties.",
    "elementor"
  );
  return /* @__PURE__ */ React10.createElement(
    import_ui7.Stack,
    {
      alignItems: "center",
      justifyContent: "start",
      height: "100%",
      color: "text.secondary",
      sx: { p: 2.5, pt: 8, pb: 5.5, mt: 1 },
      gap: 1.5
    },
    /* @__PURE__ */ React10.createElement(import_icons5.ComponentPropListIcon, { fontSize: "large" }),
    /* @__PURE__ */ React10.createElement(import_ui7.Typography, { align: "center", variant: "subtitle2" }, (0, import_i18n5.__)("No properties yet", "elementor")),
    /* @__PURE__ */ React10.createElement(import_ui7.Typography, { align: "center", variant: "caption", maxWidth: "170px" }, message),
    canEdit && !!onEditComponent && /* @__PURE__ */ React10.createElement(import_ui7.Button, { variant: "outlined", color: "secondary", size: "small", sx: { mt: 1 }, onClick: onEditComponent }, /* @__PURE__ */ React10.createElement(import_icons5.PencilIcon, { fontSize: "small" }), (0, import_i18n5.__)("Edit component", "elementor"))
  );
};

// src/components/instance-editing-panel/instance-panel-body.tsx
var React15 = __toESM(require("react"));
var import_editor_controls3 = require("@elementor/editor-controls");
var import_editor_editing_panel3 = require("@elementor/editor-editing-panel");
var import_editor_panels = require("@elementor/editor-panels");
var import_ui11 = require("@elementor/ui");

// src/components/instance-editing-panel/override-props-group.tsx
var React14 = __toESM(require("react"));
var import_react5 = require("react");
var import_editor_editing_panel2 = require("@elementor/editor-editing-panel");
var import_editor_ui5 = require("@elementor/editor-ui");
var import_ui10 = require("@elementor/ui");

// src/components/instance-editing-panel/override-prop-control.tsx
var React13 = __toESM(require("react"));
var import_editor_controls2 = require("@elementor/editor-controls");
var import_editor_editing_panel = require("@elementor/editor-editing-panel");
var import_editor_elements4 = require("@elementor/editor-elements");
var import_ui9 = require("@elementor/ui");

// src/hooks/use-controls-by-widget-type.ts
var import_editor_elements = require("@elementor/editor-elements");
function useControlsByWidgetType(type) {
  const elementType = (0, import_editor_elements.getElementType)(type);
  if (!elementType) {
    return {};
  }
  const controls = iterateControls(elementType.controls);
  return getControlsByBind(controls);
}
function iterateControls(controls) {
  return controls.map((control) => {
    if (control.type === "control" && "bind" in control.value) {
      return control;
    }
    if (control.type === "section") {
      return iterateControls(control.value.items);
    }
    return null;
  }).filter(Boolean).flat();
}
function getControlsByBind(controls) {
  return controls.reduce(
    (controlsByBind, control) => ({
      ...controlsByBind,
      [control.value.bind]: control
    }),
    {}
  );
}

// src/prop-types/component-instance-override-prop-type.ts
var import_editor_props = require("@elementor/editor-props");
var import_schema = require("@elementor/schema");
var componentInstanceOverridePropTypeUtil = (0, import_editor_props.createPropUtils)(
  "override",
  import_schema.z.object({
    override_key: import_schema.z.string(),
    override_value: import_schema.z.unknown(),
    schema_source: import_schema.z.object({
      type: import_schema.z.literal("component"),
      id: import_schema.z.number()
    })
  })
);

// src/prop-types/component-instance-overrides-prop-type.ts
var import_editor_props3 = require("@elementor/editor-props");
var import_schema3 = require("@elementor/schema");

// src/prop-types/component-overridable-prop-type.ts
var import_editor_props2 = require("@elementor/editor-props");
var import_schema2 = require("@elementor/schema");
var componentOverridablePropTypeUtil = (0, import_editor_props2.createPropUtils)(
  "overridable",
  import_schema2.z.object({
    override_key: import_schema2.z.string(),
    origin_value: import_schema2.z.object({
      $$type: import_schema2.z.string(),
      value: import_schema2.z.unknown()
    }).nullable()
  })
);

// src/prop-types/component-instance-overrides-prop-type.ts
var componentInstanceOverridesPropTypeUtil = (0, import_editor_props3.createPropUtils)(
  "overrides",
  import_schema3.z.array(import_schema3.z.union([componentInstanceOverridePropTypeUtil.schema, componentOverridablePropTypeUtil.schema])).optional().default([])
);

// src/prop-types/component-instance-prop-type.ts
var import_editor_props4 = require("@elementor/editor-props");
var import_schema4 = require("@elementor/schema");
var componentInstancePropTypeUtil = (0, import_editor_props4.createPropUtils)(
  "component-instance",
  import_schema4.z.object({
    component_id: import_editor_props4.numberPropTypeUtil.schema,
    overrides: import_schema4.z.optional(componentInstanceOverridesPropTypeUtil.schema)
  })
);

// src/provider/overridable-prop-context.tsx
var React11 = __toESM(require("react"));
var import_react4 = require("react");
var OverridablePropContext = (0, import_react4.createContext)(null);
function OverridablePropProvider({ children, ...props }) {
  return /* @__PURE__ */ React11.createElement(OverridablePropContext.Provider, { value: props }, children);
}
var useOverridablePropValue = () => (0, import_react4.useContext)(OverridablePropContext)?.value;
var useComponentInstanceElement = () => (0, import_react4.useContext)(OverridablePropContext)?.componentInstanceElement;

// src/store/actions/update-overridable-prop.ts
var import_store7 = require("@elementor/store");

// src/utils/resolve-override-prop-value.ts
var resolveOverridePropValue = (originalPropValue) => {
  const isOverridable = componentOverridablePropTypeUtil.isValid(originalPropValue);
  if (isOverridable) {
    return getOverridableValue(originalPropValue);
  }
  const isOverride = componentInstanceOverridePropTypeUtil.isValid(originalPropValue);
  if (isOverride) {
    return getOverrideValue(originalPropValue);
  }
  return originalPropValue;
};
function getOverridableValue(overridableProp) {
  const overridableValue = componentOverridablePropTypeUtil.extract(overridableProp);
  if (!overridableValue) {
    return null;
  }
  const isOverride = componentInstanceOverridePropTypeUtil.isValid(overridableValue.origin_value);
  if (isOverride) {
    return getOverrideValue(overridableValue.origin_value);
  }
  return overridableValue.origin_value;
}
function getOverrideValue(overrideProp) {
  const overrideValue = componentInstanceOverridePropTypeUtil.extract(overrideProp);
  if (!overrideValue) {
    return null;
  }
  return overrideValue.override_value;
}

// src/store/actions/update-overridable-prop.ts
function updateOverridableProp(componentId, propValue, originPropFields) {
  const overridableProps = selectOverridableProps((0, import_store7.__getState)(), componentId);
  if (!overridableProps) {
    return;
  }
  const existingOverridableProp = overridableProps.props[propValue.override_key];
  if (!existingOverridableProp) {
    return;
  }
  const originValue = resolveOverridePropValue(propValue.origin_value);
  const newOverridableProp = originPropFields ? {
    originValue,
    originPropFields
  } : {
    originValue
  };
  const newOverridableProps = {
    ...overridableProps,
    props: {
      ...overridableProps.props,
      [existingOverridableProp.overrideKey]: {
        ...existingOverridableProp,
        ...newOverridableProp
      }
    }
  };
  (0, import_store7.__dispatch)(
    slice.actions.setOverridableProps({
      componentId,
      overridableProps: newOverridableProps
    })
  );
}

// src/utils/get-container-by-origin-id.ts
var import_editor_elements2 = require("@elementor/editor-elements");
function getContainerByOriginId(originElementId, instanceElementId) {
  if (!instanceElementId) {
    return (0, import_editor_elements2.getContainer)(originElementId);
  }
  const instanceContainer = (0, import_editor_elements2.getContainer)(instanceElementId);
  if (!instanceContainer) {
    return null;
  }
  const legacyWindow = window;
  return legacyWindow.elementor?.getContainerByKeyValue?.({
    key: "originId",
    value: originElementId,
    parent: instanceContainer.view
  }) ?? null;
}

// src/utils/get-prop-type-for-component-override.ts
var import_editor_elements3 = require("@elementor/editor-elements");
var getPropTypeForComponentOverride = (overridableProp) => {
  if (overridableProp.originPropFields) {
    return getPropType(overridableProp.originPropFields);
  }
  const { widgetType, propKey } = overridableProp;
  return getPropType({
    widgetType,
    propKey
  });
};
function getPropType({ widgetType, propKey }) {
  const widgetPropsSchema = (0, import_editor_elements3.getWidgetsCache)()?.[widgetType]?.atomic_props_schema;
  return widgetPropsSchema?.[propKey];
}

// src/utils/overridable-props-utils.ts
function getMatchingOverride(overrides, overrideKey) {
  return overrides?.find((override) => {
    const overridableValue = componentOverridablePropTypeUtil.extract(override);
    if (overridableValue) {
      const overrideValue = componentInstanceOverridePropTypeUtil.extract(overridableValue.origin_value);
      return overrideValue?.override_key === overrideKey;
    }
    return override.value.override_key === overrideKey;
  }) ?? null;
}
function extractInnerOverrideInfo(override) {
  if (!override) {
    return null;
  }
  const overridableValue = componentOverridablePropTypeUtil.extract(override);
  const innerOverride = overridableValue ? componentInstanceOverridePropTypeUtil.extract(overridableValue.origin_value) : componentInstanceOverridePropTypeUtil.extract(override);
  if (!innerOverride) {
    return null;
  }
  const {
    schema_source: schemaSource,
    override_key: innerOverrideKey,
    override_value: overrideValue
  } = innerOverride;
  const componentId = schemaSource?.id;
  if (!componentId || !innerOverrideKey) {
    return null;
  }
  return { componentId, innerOverrideKey, overrideValue };
}

// src/components/control-label.tsx
var React12 = __toESM(require("react"));
var import_editor_controls = require("@elementor/editor-controls");
var import_ui8 = require("@elementor/ui");
var ControlLabel = ({ children, ...props }) => {
  return /* @__PURE__ */ React12.createElement(import_ui8.Stack, { direction: "row", alignItems: "center", justifyItems: "start", gap: 0.25 }, /* @__PURE__ */ React12.createElement(import_editor_controls.ControlFormLabel, { ...props }, children), /* @__PURE__ */ React12.createElement(import_editor_controls.ControlAdornments, null));
};

// src/components/errors.ts
var import_utils2 = require("@elementor/utils");
var OverrideControlInnerElementNotFoundError = (0, import_utils2.createError)({
  code: "override_control_inner_element_not_found",
  message: `Component inner element not found for override control. The element may have been deleted without updating the overridable props, or the component has not finished rendering yet.`
});

// src/components/instance-editing-panel/use-resolved-origin-value.tsx
var import_store11 = require("@elementor/store");

// src/utils/get-overridable-prop.ts
var import_store9 = require("@elementor/store");
function getOverridableProp({
  componentId,
  overrideKey
}) {
  const overridableProps = selectOverridableProps((0, import_store9.__getState)(), componentId);
  if (!overridableProps) {
    return void 0;
  }
  return overridableProps.props[overrideKey];
}

// src/components/instance-editing-panel/use-resolved-origin-value.tsx
function useResolvedOriginValue(override, overridableProp) {
  const components = (0, import_store11.__useSelector)(selectData);
  return resolveOriginValue(components, override, overridableProp);
}
function resolveOriginValue(components, matchingOverride, overridableProp) {
  const { originValue: fallbackOriginValue, originPropFields } = overridableProp;
  if (hasValue(fallbackOriginValue)) {
    return fallbackOriginValue;
  }
  if (matchingOverride) {
    const result = getOriginFromOverride(components, matchingOverride);
    if (hasValue(result)) {
      return result;
    }
  }
  const { elementId, propKey } = originPropFields ?? {};
  if (elementId && propKey) {
    return findOriginValueByElementId(components, elementId, propKey);
  }
  return null;
}
function getOriginFromOverride(components, override) {
  const innerOverrideInfo = extractInnerOverrideInfo(override);
  if (!innerOverrideInfo) {
    return null;
  }
  const { componentId, innerOverrideKey, overrideValue } = innerOverrideInfo;
  const prop = getOverridableProp({ componentId, overrideKey: innerOverrideKey });
  if (hasValue(prop?.originValue)) {
    return prop.originValue;
  }
  if (prop?.originPropFields?.elementId) {
    const targetPropKey = prop.originPropFields.propKey ?? prop.propKey;
    const result = findOriginValueByElementId(components, prop.originPropFields.elementId, targetPropKey);
    if (hasValue(result)) {
      return result;
    }
  }
  const nestedOverridable = componentOverridablePropTypeUtil.extract(overrideValue);
  if (nestedOverridable) {
    return getOriginFromOverride(components, componentOverridablePropTypeUtil.create(nestedOverridable));
  }
  return null;
}
function findOriginValueByElementId(components, targetElementId, targetPropKey, visited = /* @__PURE__ */ new Set()) {
  for (const component of components) {
    if (visited.has(component.id)) {
      continue;
    }
    visited.add(component.id);
    const matchingProp = Object.values(component.overridableProps?.props ?? {}).find(
      ({ elementId, propKey }) => elementId === targetElementId && propKey === targetPropKey
    );
    if (!matchingProp) {
      continue;
    }
    if (hasValue(matchingProp.originValue)) {
      return matchingProp.originValue;
    }
    if (matchingProp.originPropFields?.elementId) {
      const innerPropKey = matchingProp.originPropFields.propKey ?? targetPropKey;
      return findOriginValueByElementId(
        components,
        matchingProp.originPropFields.elementId,
        innerPropKey,
        visited
      );
    }
  }
  return null;
}
function hasValue(value) {
  return value !== null && value !== void 0;
}

// src/components/instance-editing-panel/override-prop-control.tsx
function OverridePropControl({ overrideKey }) {
  const overridableProps = useComponentOverridableProps();
  const overridableProp = overridableProps?.props[overrideKey];
  if (!overridableProp) {
    return null;
  }
  return /* @__PURE__ */ React13.createElement(import_editor_editing_panel.SettingsField, { bind: "component_instance", propDisplayName: overridableProp.label }, /* @__PURE__ */ React13.createElement(OverrideControl, { overridableProp }));
}
function OverrideControl({ overridableProp }) {
  const componentInstanceElement = (0, import_editor_editing_panel.useElement)();
  const { value: instanceValue, setValue: setInstanceValue } = (0, import_editor_controls2.useBoundProp)(componentInstancePropTypeUtil);
  const wrappingComponentId = useCurrentComponentId();
  const componentId = useComponentId();
  const overridableProps = useComponentOverridableProps();
  const overrides = useComponentInstanceOverrides();
  const controls = useControlsByWidgetType(
    overridableProp?.originPropFields?.widgetType ?? overridableProp.widgetType
  );
  const controlReplacements = (0, import_editor_controls2.getControlReplacements)();
  const matchingOverride = getMatchingOverride(overrides, overridableProp.overrideKey);
  const recursiveOriginValue = useResolvedOriginValue(matchingOverride, overridableProp);
  if (!componentId) {
    throw new Error("Component ID is required");
  }
  if (!overridableProps) {
    throw new Error("Component has no overridable props");
  }
  const propType = getPropTypeForComponentOverride(overridableProp);
  if (!propType) {
    return null;
  }
  const resolvedOverrideValue = matchingOverride ? resolveOverridePropValue(matchingOverride) : null;
  const propValue = resolvedOverrideValue ?? recursiveOriginValue ?? overridableProp.originValue;
  const value = {
    [overridableProp.overrideKey]: propValue
  };
  const setValue = (newValue) => {
    if (!overridableProps) {
      setInstanceValue({
        ...instanceValue,
        overrides: void 0
      });
      return;
    }
    const newPropValue = getTempNewValueForDynamicProp(
      propType,
      propValue,
      newValue[overridableProp.overrideKey]
    );
    const newOverrideValue = createOverrideValue({
      matchingOverride,
      overrideKey: overridableProp.overrideKey,
      overrideValue: newPropValue,
      componentId
    });
    let newOverrides = (overrides ?? []).filter((override) => isValidOverride(overridableProps, override)).map((override) => override === matchingOverride ? newOverrideValue : override);
    if (!matchingOverride) {
      newOverrides = [...newOverrides, newOverrideValue];
    }
    setInstanceValue({
      ...instanceValue,
      overrides: componentInstanceOverridesPropTypeUtil.create(newOverrides)
    });
    const overridableValue = componentOverridablePropTypeUtil.extract(newOverrideValue);
    if (overridableValue && wrappingComponentId) {
      if (overridableProp.originPropFields) {
        updateOverridableProp(wrappingComponentId, overridableValue, overridableProp.originPropFields);
        return;
      }
      const { elType: elType2, widgetType: widgetType2, propKey: propKey2, elementId: elementId2 } = overridableProp;
      updateOverridableProp(wrappingComponentId, overridableValue, { elType: elType2, widgetType: widgetType2, propKey: propKey2, elementId: elementId2 });
    }
  };
  const { control, controlProps, layout } = getControlParams(
    controls,
    overridableProp?.originPropFields ?? overridableProp,
    overridableProp.label
  );
  const {
    elementId: originElementId,
    widgetType,
    elType,
    propKey
  } = overridableProp.originPropFields ?? overridableProp;
  const element = getContainerByOriginId(originElementId, componentInstanceElement.element.id);
  if (!element) {
    throw new OverrideControlInnerElementNotFoundError({ context: { componentId, elementId: originElementId } });
  }
  const elementId = element.id;
  const type = elType === "widget" ? widgetType : elType;
  const elementType = (0, import_editor_elements4.getElementType)(type);
  if (!elementType) {
    return null;
  }
  const settings = (0, import_editor_elements4.getElementSettings)(elementId, Object.keys(elementType.propsSchema));
  const propTypeSchema = (0, import_editor_editing_panel.createTopLevelObjectType)({
    schema: {
      [overridableProp.overrideKey]: propType
    }
  });
  return /* @__PURE__ */ React13.createElement(
    OverridablePropProvider,
    {
      value: componentOverridablePropTypeUtil.extract(matchingOverride) ?? void 0,
      componentInstanceElement
    },
    /* @__PURE__ */ React13.createElement(import_editor_editing_panel.ElementProvider, { element: { id: elementId, type }, elementType, settings }, /* @__PURE__ */ React13.createElement(import_editor_editing_panel.SettingsField, { bind: propKey, propDisplayName: overridableProp.label }, /* @__PURE__ */ React13.createElement(
      import_editor_controls2.PropProvider,
      {
        propType: propTypeSchema,
        value,
        setValue,
        isDisabled: () => {
          return false;
        }
      },
      /* @__PURE__ */ React13.createElement(import_editor_controls2.PropKeyProvider, { bind: overridableProp.overrideKey }, /* @__PURE__ */ React13.createElement(import_editor_controls2.ControlReplacementsProvider, { replacements: controlReplacements }, /* @__PURE__ */ React13.createElement(import_ui9.Stack, { direction: "column", gap: 1, mb: 1.5 }, layout !== "custom" && /* @__PURE__ */ React13.createElement(ControlLabel, null, overridableProp.label), /* @__PURE__ */ React13.createElement(OriginalControl, { control, controlProps }))))
    )))
  );
}
function getTempNewValueForDynamicProp(propType, propValue, newPropValue) {
  const isRemovingOverride = newPropValue === null;
  if (isRemovingOverride && (0, import_editor_editing_panel.isDynamicPropValue)(propValue)) {
    return propType.default ?? null;
  }
  return newPropValue;
}
function createOverrideValue({
  matchingOverride,
  overrideKey,
  overrideValue,
  componentId
}) {
  const overridableValue = componentOverridablePropTypeUtil.extract(matchingOverride);
  const newOverridableValue = componentOverridablePropTypeUtil.extract(overrideValue);
  const anyOverridable = newOverridableValue ?? overridableValue;
  if (anyOverridable) {
    const innerOverride = componentInstanceOverridePropTypeUtil.create({
      override_key: overrideKey,
      override_value: resolveOverridePropValue(overrideValue),
      schema_source: {
        type: "component",
        id: componentId
      }
    });
    return componentOverridablePropTypeUtil.create({
      override_key: anyOverridable.override_key,
      origin_value: innerOverride
    });
  }
  return componentInstanceOverridePropTypeUtil.create({
    override_key: overrideKey,
    override_value: overrideValue,
    schema_source: {
      type: "component",
      id: componentId
    }
  });
}
function getControlParams(controls, originPropFields, label) {
  const control = controls[originPropFields.propKey];
  const { value } = control;
  const layout = getControlLayout(control);
  const controlProps = populateChildControlProps(value.props);
  if (layout === "custom") {
    controlProps.label = label ?? value.label;
  }
  return {
    control,
    controlProps,
    layout
  };
}
function OriginalControl({ control, controlProps }) {
  const { value } = control;
  return /* @__PURE__ */ React13.createElement(import_editor_editing_panel.BaseControl, { type: value.type, props: controlProps });
}
function getControlLayout(control) {
  return control.value.meta?.layout || import_editor_editing_panel.controlsRegistry.getLayout(control.value.type);
}
function populateChildControlProps(props) {
  if (props.childControlType) {
    const childComponent = import_editor_editing_panel.controlsRegistry.get(props.childControlType);
    const childPropType = import_editor_editing_panel.controlsRegistry.getPropTypeUtil(props.childControlType);
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
function isValidOverride(overridableProps, override) {
  const overridableKey = componentOverridablePropTypeUtil.isValid(override) ? override.value.origin_value?.value.override_key : override.value.override_key;
  return !!overridableProps.props[overridableKey];
}

// src/components/instance-editing-panel/override-props-group.tsx
function OverridePropsGroup({ group }) {
  const [isOpen, setIsOpen] = (0, import_editor_editing_panel2.useStateByElement)(group.id, true);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  const id2 = (0, import_react5.useId)();
  const labelId = `label-${id2}`;
  const contentId = `content-${id2}`;
  const title = group.label;
  return /* @__PURE__ */ React14.createElement(import_ui10.Box, { "aria-label": `${title} section` }, /* @__PURE__ */ React14.createElement(
    import_ui10.ListItemButton,
    {
      id: labelId,
      "aria-controls": contentId,
      "aria-label": `${title} section`,
      onClick: handleClick,
      p: 0,
      sx: { "&:hover": { backgroundColor: "transparent" } }
    },
    /* @__PURE__ */ React14.createElement(import_ui10.Stack, { direction: "row", alignItems: "center", justifyItems: "start", flexGrow: 1, gap: 0.5 }, /* @__PURE__ */ React14.createElement(
      import_ui10.ListItemText,
      {
        secondary: title,
        secondaryTypographyProps: { color: "text.primary", variant: "caption", fontWeight: "bold" },
        sx: { flexGrow: 0, flexShrink: 1, marginInlineEnd: 1 }
      }
    )),
    /* @__PURE__ */ React14.createElement(import_editor_ui5.CollapseIcon, { open: isOpen, color: "secondary", fontSize: "tiny" })
  ), /* @__PURE__ */ React14.createElement(import_ui10.Collapse, { id: contentId, "aria-labelledby": labelId, in: isOpen, timeout: "auto" }, /* @__PURE__ */ React14.createElement(import_ui10.Stack, { direction: "column", gap: 1, p: 2 }, group.props.map((overrideKey) => /* @__PURE__ */ React14.createElement(OverridePropControl, { key: overrideKey, overrideKey })))));
}

// src/components/instance-editing-panel/instance-panel-body.tsx
function InstancePanelBody({ groups, isEmpty, emptyState, componentInstanceId }) {
  return /* @__PURE__ */ React15.createElement(import_editor_panels.PanelBody, null, /* @__PURE__ */ React15.createElement(import_editor_controls3.ControlAdornmentsProvider, { items: (0, import_editor_editing_panel3.getFieldIndicators)("settings") }, isEmpty ? emptyState : /* @__PURE__ */ React15.createElement(import_ui11.Stack, { direction: "column", alignItems: "stretch" }, groups.map((group) => /* @__PURE__ */ React15.createElement(React15.Fragment, { key: group.id + componentInstanceId }, /* @__PURE__ */ React15.createElement(OverridePropsGroup, { group }), /* @__PURE__ */ React15.createElement(import_ui11.Divider, null))))));
}

// src/components/instance-editing-panel/instance-panel-header.tsx
var React16 = __toESM(require("react"));
var import_editor_panels2 = require("@elementor/editor-panels");
var import_editor_ui6 = require("@elementor/editor-ui");
var import_icons6 = require("@elementor/icons");
var import_ui12 = require("@elementor/ui");
function InstancePanelHeader({ componentName, actions }) {
  return /* @__PURE__ */ React16.createElement(import_editor_panels2.PanelHeader, { sx: { justifyContent: "start", px: 2 } }, /* @__PURE__ */ React16.createElement(import_ui12.Stack, { direction: "row", alignItems: "center", flexGrow: 1, gap: 1, maxWidth: "100%" }, /* @__PURE__ */ React16.createElement(import_icons6.ComponentsIcon, { fontSize: "small", sx: { color: "text.tertiary" } }), /* @__PURE__ */ React16.createElement(import_editor_ui6.EllipsisWithTooltip, { title: componentName, as: import_editor_panels2.PanelHeaderTitle, sx: { flexGrow: 1 } }), actions));
}
function EditComponentAction({ label, onClick, disabled = false, icon: Icon2 }) {
  return /* @__PURE__ */ React16.createElement(import_ui12.Tooltip, { title: label }, /* @__PURE__ */ React16.createElement(import_ui12.IconButton, { size: "tiny", onClick, "aria-label": label, disabled }, /* @__PURE__ */ React16.createElement(Icon2, { fontSize: "tiny" })));
}

// src/components/instance-editing-panel/use-instance-panel-data.ts
var import_editor_editing_panel4 = require("@elementor/editor-editing-panel");

// src/utils/filter-valid-overridable-props.ts
function filterValidOverridableProps(overridableProps, instanceElementId) {
  const validProps = {};
  for (const [key, prop] of Object.entries(overridableProps.props)) {
    if (isExposedPropValid(prop, instanceElementId)) {
      validProps[key] = prop;
    }
  }
  const validPropKeys = new Set(Object.keys(validProps));
  const filteredGroups = {
    items: Object.fromEntries(
      Object.entries(overridableProps.groups.items).map(([groupId, group]) => [
        groupId,
        { ...group, props: group.props.filter((propKey) => validPropKeys.has(propKey)) }
      ])
    ),
    order: overridableProps.groups.order
  };
  return { props: validProps, groups: filteredGroups };
}
function isExposedPropValid(prop, instanceElementId) {
  if (!prop.originPropFields) {
    return true;
  }
  const innerComponentInstanceElement = getContainerByOriginId(prop.elementId, instanceElementId);
  if (!innerComponentInstanceElement) {
    return false;
  }
  const setting = innerComponentInstanceElement.settings?.get("component_instance") ?? null;
  const componentInstance = componentInstancePropTypeUtil.extract(setting);
  if (!componentInstance?.component_id?.value) {
    return false;
  }
  const overrides = componentInstanceOverridesPropTypeUtil.extract(componentInstance.overrides) ?? void 0;
  const matchingOverride = findOverrideByOuterKey(overrides, prop.overrideKey);
  const innerOverrideInfo = extractInnerOverrideInfo(matchingOverride);
  if (!innerOverrideInfo) {
    return false;
  }
  const { componentId, innerOverrideKey } = innerOverrideInfo;
  const innerOverridableProp = getOverridableProp({ componentId, overrideKey: innerOverrideKey });
  if (!innerOverridableProp) {
    return false;
  }
  return isExposedPropValid(innerOverridableProp, innerComponentInstanceElement.id);
}
function findOverrideByOuterKey(overrides, outerKey) {
  if (!overrides) {
    return null;
  }
  return overrides.find((override) => {
    const overridableValue = componentOverridablePropTypeUtil.extract(override);
    if (overridableValue) {
      return overridableValue.override_key === outerKey;
    }
    return override.value.override_key === outerKey;
  }) ?? null;
}

// src/hooks/use-sanitize-overridable-props.ts
function useSanitizeOverridableProps(componentId, instanceElementId) {
  const overridableProps = useOverridableProps(componentId);
  const isSanitized = useIsSanitizedComponent(componentId, "overridableProps");
  if (!overridableProps || !componentId) {
    return void 0;
  }
  if (isSanitized) {
    return overridableProps;
  }
  return filterValidOverridableProps(overridableProps, instanceElementId);
}

// src/components/instance-editing-panel/use-instance-panel-data.ts
function useInstancePanelData() {
  const { element, settings } = useComponentInstanceSettings();
  const componentId = settings?.component_id?.value;
  const overrides = settings?.overrides?.value;
  const component = useComponent(componentId ?? null);
  const componentInstanceId = element?.id;
  const overridableProps = useSanitizeOverridableProps(componentId ?? null, componentInstanceId);
  if (!componentId || !overridableProps || !component) {
    return null;
  }
  const isNonEmptyGroup = (group) => group !== null && group.props.length > 0;
  const groups = overridableProps.groups.order.map((groupId) => overridableProps.groups.items[groupId] ?? null).filter(isNonEmptyGroup);
  const isEmpty = groups.length === 0 || Object.keys(overridableProps.props).length === 0;
  return { componentId, component, overrides, overridableProps, groups, isEmpty, componentInstanceId };
}
function useComponentInstanceSettings() {
  const { element, settings } = (0, import_editor_editing_panel4.useElement)();
  return { element, settings: componentInstancePropTypeUtil.extract(settings.component_instance) };
}

// src/components/instance-editing-panel/instance-editing-panel.tsx
function InstanceEditingPanel() {
  const data = useInstancePanelData();
  if (!data) {
    return null;
  }
  const { componentId, component, overrides, overridableProps, groups, isEmpty, componentInstanceId } = data;
  const panelTitle = (0, import_i18n6.__)("Edit %s", "elementor").replace("%s", component.name);
  return /* @__PURE__ */ React17.createElement(import_ui13.Box, { "data-testid": "instance-editing-panel" }, /* @__PURE__ */ React17.createElement(
    ComponentInstanceProvider,
    {
      componentId,
      overrides,
      overridableProps
    },
    /* @__PURE__ */ React17.createElement(
      InstancePanelHeader,
      {
        componentName: component.name,
        actions: /* @__PURE__ */ React17.createElement(EditComponentAction, { disabled: true, label: panelTitle, icon: import_icons7.PencilIcon })
      }
    ),
    /* @__PURE__ */ React17.createElement(
      InstancePanelBody,
      {
        groups,
        isEmpty,
        emptyState: /* @__PURE__ */ React17.createElement(EmptyState2, null),
        componentInstanceId
      }
    )
  ));
}

// src/components/load-template-components.tsx
var import_react6 = require("react");
var import_editor_templates = require("@elementor/editor-templates");

// src/store/actions/load-components-assets.ts
var import_editor_documents4 = require("@elementor/editor-documents");

// src/create-component-type.ts
var import_editor_canvas4 = require("@elementor/editor-canvas");
var import_editor_documents3 = require("@elementor/editor-documents");
var import_store18 = require("@elementor/store");
var import_utils4 = require("@elementor/utils");
var import_i18n7 = require("@wordpress/i18n");

// src/utils/format-component-elements-id.ts
var import_utils3 = require("@elementor/utils");
var ELEMENT_ID_LENGTH = 7;
function formatComponentElementsId(elements, path) {
  return elements.map((element) => {
    const nestingPath = [...path, element.id];
    const id2 = (0, import_utils3.hashString)(nestingPath.join("_"), ELEMENT_ID_LENGTH);
    return {
      ...element,
      id: id2,
      originId: element.id,
      elements: element.elements ? formatComponentElementsId(element.elements, nestingPath) : void 0
    };
  });
}

// src/utils/switch-to-component.ts
var import_editor_documents2 = require("@elementor/editor-documents");
var import_editor_elements5 = require("@elementor/editor-elements");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
async function switchToComponent(componentId, componentInstanceId, element) {
  const selector = getSelector(element, componentInstanceId);
  (0, import_editor_documents2.invalidateDocumentData)(componentId);
  await (0, import_editor_documents2.switchToDocument)(componentId, {
    selector,
    mode: "autosave",
    setAsInitial: false,
    shouldScroll: false
  });
  const currentDocumentContainer = (0, import_editor_elements5.getCurrentDocumentContainer)();
  const topLevelElement = currentDocumentContainer?.children?.[0];
  if (topLevelElement) {
    (0, import_editor_elements5.selectElement)(topLevelElement.id);
    expandNavigator();
  }
}
async function expandNavigator() {
  await (0, import_editor_v1_adapters2.__privateRunCommand)("navigator/expand-all");
}
function getSelector(element, componentInstanceId) {
  if (element) {
    return buildUniqueSelector(element);
  }
  if (componentInstanceId) {
    return `[data-id="${componentInstanceId}"]`;
  }
  return void 0;
}
function buildUniqueSelector(element) {
  const selectors = [];
  let current = element.closest("[data-id]");
  while (current) {
    const dataId = current.dataset.id;
    const isComponentInstance2 = current.hasAttribute("data-elementor-id");
    if (isComponentInstance2) {
      selectors.unshift(`[data-id="${dataId}"]`);
    }
    current = current.parentElement?.closest("[data-id]") ?? null;
  }
  if (selectors.length === 0) {
    const closestElement = element.closest("[data-id]");
    if (closestElement?.dataset?.id) {
      return `[data-id="${closestElement.dataset.id}"]`;
    }
  }
  return selectors.join(" ");
}

// src/utils/tracking.ts
var import_events = require("@elementor/events");
var import_store16 = require("@elementor/store");
var FEATURE_NAME = "Components";
var trackComponentEvent = ({ action, source, ...data }) => {
  if (source === "system") {
    return;
  }
  const { dispatchEvent, config } = (0, import_events.getMixpanel)();
  if (!config?.names?.components?.[action]) {
    return;
  }
  const name = config.names.components[action];
  dispatchEvent?.(name, { ...data, source, "Feature name": FEATURE_NAME });
};
var onElementDrop = (_args, element) => {
  if (!(element?.model?.get("widgetType") === "e-component")) {
    return;
  }
  const editorSettings = element.model.get("editor_settings");
  const componentName = editorSettings?.title;
  const componentUID = editorSettings?.component_uid;
  const instanceId = element.id;
  const createdThisSession = selectCreatedThisSession((0, import_store16.__getState)());
  const isSameSessionReuse = componentUID && createdThisSession.includes(componentUID);
  const eventsManagerConfig = window.elementorCommon.eventsManager.config;
  const { locations, secondaryLocations } = eventsManagerConfig;
  trackComponentEvent({
    action: "instanceAdded",
    source: "user",
    instance_id: instanceId,
    component_uid: componentUID,
    component_name: componentName,
    is_same_session_reuse: isSameSessionReuse,
    location: locations.widgetPanel,
    secondary_location: secondaryLocations.componentsTab
  });
};

// src/create-component-type.ts
var COMPONENT_WIDGET_TYPE = "e-component";
var EDIT_COMPONENT_UPGRADE_URL = "https://go.elementor.com/go-pro-components-edit/";
var updateGroups = (groups, config) => {
  const disableMap = new Map(Object.entries(config.disable ?? {}));
  const addMap = new Map(Object.entries(config.add ?? {}));
  return groups.map((group) => {
    const disabledActions = disableMap.get(group.name) ?? [];
    const addConfig = addMap.get(group.name);
    const updatedActions = group.actions.map(
      (action) => disabledActions.includes(action.name) ? { ...action, isEnabled: () => false } : action
    );
    if (addConfig) {
      updatedActions.splice(addConfig.index, 0, addConfig.action);
    }
    return { ...group, actions: updatedActions };
  });
};
function createComponentType(options) {
  const legacyWindow = window;
  const WidgetType = legacyWindow.elementor.modules.elements.types.Widget;
  const view = createComponentView({ ...options });
  return class extends WidgetType {
    getType() {
      return options.type;
    }
    getView() {
      return view;
    }
    getModel() {
      return createComponentModel();
    }
  };
}
function createComponentView(options) {
  const legacyWindow = window;
  return class extends (0, import_editor_canvas4.createTemplatedElementView)(options) {
    eventsManagerConfig = legacyWindow.elementorCommon.eventsManager.config;
    #componentRenderContext;
    isComponentCurrentlyEdited() {
      const currentDocument = (0, import_editor_documents3.getCurrentDocument)();
      return currentDocument?.id === this.getComponentId();
    }
    getRenderContext() {
      const namespaceKey = this.getNamespaceKey();
      const parentContext = this._parent?.getRenderContext?.();
      const parentComponentContext = parentContext?.[namespaceKey];
      if (!this.#componentRenderContext) {
        return parentContext;
      }
      const ownOverrides = this.#componentRenderContext.overrides ?? {};
      const parentOverrides = parentComponentContext?.overrides ?? {};
      return {
        ...parentContext,
        [namespaceKey]: {
          overrides: {
            ...parentOverrides,
            ...ownOverrides
          }
        }
      };
    }
    getResolverRenderContext() {
      const namespaceKey = this.getNamespaceKey();
      const context = this.getRenderContext();
      return context?.[namespaceKey];
    }
    afterSettingsResolve(settings) {
      const componentInstance = settings.component_instance;
      if (componentInstance) {
        this.#componentRenderContext = {
          overrides: componentInstance.overrides ?? {}
        };
        const instanceId = this.model.get("id");
        const elements = componentInstance.elements ?? [];
        const formattedElements = formatComponentElementsId(elements, [instanceId]);
        this.collection = legacyWindow.elementor.createBackboneElementsCollection(formattedElements);
        this.collection.models.forEach(setInactiveRecursively);
        settings.component_instance = "<template data-children-placeholder></template>";
      }
      return settings;
    }
    getDomElement() {
      return this.children.findByIndex(0)?.getDomElement() ?? this.$el;
    }
    attachBuffer(collectionView, buffer) {
      const childrenPlaceholder = collectionView.$el.find("[data-children-placeholder]").get(0);
      if (!childrenPlaceholder) {
        super.attachBuffer(collectionView, buffer);
        return;
      }
      childrenPlaceholder.replaceWith(buffer);
    }
    getComponentId() {
      const componentInstance = this.options?.model?.get("settings")?.get("component_instance")?.value;
      return componentInstance.component_id.value;
    }
    getContextMenuGroups() {
      const filteredGroups = super.getContextMenuGroups().filter((group) => group.name !== "save");
      const componentId = this.getComponentId();
      if (!componentId) {
        return filteredGroups;
      }
      const newGroups = updateGroups(
        filteredGroups,
        this._getContextMenuConfig()
      );
      return newGroups;
    }
    _getContextMenuConfig() {
      const isAdministrator = isUserAdministrator();
      const hasPro = (0, import_utils4.hasProInstalled)();
      const proLabel = (0, import_i18n7.__)("PRO", "elementor");
      const badgeClass = "elementor-context-menu-list__item__shortcut__new-badge";
      const proBadge = `<a href="${EDIT_COMPONENT_UPGRADE_URL}" target="_blank" onclick="event.stopPropagation()" class="${badgeClass}">${proLabel}</a>`;
      const addedGroup = {
        general: {
          index: 1,
          action: {
            name: "edit component",
            icon: "eicon-edit",
            title: () => (0, import_i18n7.__)("Edit Component", "elementor"),
            ...!hasPro && { shortcut: proBadge, hasShortcutAction: true },
            isEnabled: () => hasPro,
            callback: (_, eventData) => this.editComponent(eventData)
          }
        }
      };
      const disabledGroup = {
        clipboard: ["pasteStyle", "resetStyle"]
      };
      return { add: isAdministrator ? addedGroup : {}, disable: disabledGroup };
    }
    async switchDocument() {
      const { isAllowedToSwitchDocument, lockedBy } = await apiClient.getComponentLockStatus(
        this.getComponentId()
      );
      if (!isAllowedToSwitchDocument) {
        options.showLockedByModal?.(lockedBy || "");
      } else {
        switchToComponent(this.getComponentId(), this.model.get("id"), this.el);
      }
    }
    editComponent({ trigger, location, secondaryLocation }) {
      const hasPro = (0, import_utils4.hasProInstalled)();
      if (!hasPro || this.isComponentCurrentlyEdited()) {
        return;
      }
      this.switchDocument();
      const editorSettings = this.model.get("editor_settings");
      trackComponentEvent({
        action: "edited",
        source: "user",
        component_uid: editorSettings?.component_uid,
        component_name: editorSettings?.title,
        location,
        secondary_location: secondaryLocation,
        trigger
      });
    }
    handleDblClick(e) {
      e.stopPropagation();
      if (!isUserAdministrator() || !(0, import_utils4.hasProInstalled)()) {
        return;
      }
      const { triggers, locations, secondaryLocations } = this.eventsManagerConfig;
      this.editComponent({
        trigger: triggers.doubleClick,
        location: locations.canvas,
        secondaryLocation: secondaryLocations.canvasElement
      });
    }
    events() {
      return {
        ...super.events(),
        dblclick: this.handleDblClick
      };
    }
    attributes() {
      return {
        ...super.attributes(),
        "data-elementor-id": this.getComponentId()
      };
    }
  };
}
function setInactiveRecursively(model) {
  const editSettings = model.get("editSettings");
  if (editSettings) {
    editSettings.set("inactive", true);
  }
  const elements = model.get("elements");
  if (elements) {
    elements.forEach((childModel) => {
      setInactiveRecursively(childModel);
    });
  }
}
function isUserAdministrator() {
  const legacyWindow = window;
  return legacyWindow.elementor.config?.user?.is_administrator ?? false;
}
function createComponentModel() {
  const legacyWindow = window;
  const WidgetType = legacyWindow.elementor.modules.elements.types.Widget;
  const widgetTypeInstance = new WidgetType();
  const BaseWidgetModel = widgetTypeInstance.getModel();
  return BaseWidgetModel.extend({
    initialize(attributes, options) {
      BaseWidgetModel.prototype.initialize.call(this, attributes, options);
      const componentInstance = this.get("settings")?.get("component_instance");
      if (componentInstance?.value) {
        const componentId = componentInstance.value.component_id?.value;
        if (componentId && typeof componentId === "number") {
          this.set("componentId", componentId);
        }
      }
      this.set("isGlobal", true);
    },
    getTitle() {
      const editorSettings = this.get("editor_settings");
      const instanceTitle = editorSettings?.title;
      if (instanceTitle) {
        return instanceTitle;
      }
      const componentUid = editorSettings?.component_uid;
      if (componentUid) {
        const component = selectComponentByUid((0, import_store18.__getState)(), componentUid);
        if (component?.name) {
          return component.name;
        }
      }
      return window.elementor.getElementData(this).title;
    },
    getComponentId() {
      return this.get("componentId") || null;
    },
    getComponentName() {
      return this.getTitle();
    },
    getComponentUid() {
      const editorSettings = this.get("editor_settings");
      return editorSettings?.component_uid || null;
    }
  });
}

// src/utils/is-component-instance.ts
function isComponentInstance(elementModel) {
  return [elementModel.widgetType, elementModel.elType].includes(COMPONENT_WIDGET_TYPE);
}

// src/utils/get-component-documents.ts
async function getComponentDocuments(elements, cache = /* @__PURE__ */ new Map()) {
  const componentIds = await getComponentIds(elements, cache);
  return getDocumentsMap(componentIds, cache);
}
async function getComponentIds(elements, cache) {
  const results = await Promise.all(
    elements.map(async ({ widgetType, elType, elements: childElements, settings }) => {
      const ids = [];
      if (isComponentInstance({ widgetType, elType })) {
        const componentId = settings?.component_instance?.value?.component_id.value;
        if (!componentId) {
          return ids;
        }
        ids.push(componentId);
        if (!cache.has(componentId)) {
          cache.set(componentId, getComponentDocumentData(componentId));
        }
        const doc = await cache.get(componentId);
        childElements = doc?.elements;
      }
      if (childElements?.length) {
        const childIds = await getComponentIds(childElements, cache);
        ids.push(...childIds);
      }
      return ids;
    })
  );
  return [...new Set(results.flat())];
}
async function getDocumentsMap(ids, cache) {
  const documents = await Promise.all(
    ids.map(async (id2) => {
      const document = await cache.get(id2);
      if (!document) {
        return null;
      }
      return [id2, document];
    })
  );
  return new Map(documents.filter((document) => document !== null));
}

// src/store/actions/load-components-overridable-props.ts
var import_store20 = require("@elementor/store");
function loadComponentsOverridableProps(componentIds) {
  if (!componentIds.length) {
    return;
  }
  return Promise.all(componentIds.map(loadComponentOverrides));
}
async function loadComponentOverrides(componentId) {
  const isOverridablePropsLoaded = selectIsOverridablePropsLoaded((0, import_store20.__getState)(), componentId);
  if (isOverridablePropsLoaded) {
    return;
  }
  const overridableProps = await apiClient.getOverridableProps(componentId);
  if (!overridableProps) {
    return;
  }
  (0, import_store20.__dispatch)(
    slice.actions.setOverridableProps({
      componentId,
      overridableProps
    })
  );
}

// src/store/actions/load-components-styles.ts
var import_store22 = require("@elementor/store");
function loadComponentsStyles(documents) {
  if (!documents.size) {
    return;
  }
  const knownComponents = selectStyles((0, import_store22.__getState)());
  const unknownDocuments = new Map([...documents.entries()].filter(([id2]) => !knownComponents[id2]));
  if (!unknownDocuments.size) {
    return;
  }
  addStyles(unknownDocuments);
}
function addStyles(documents) {
  const styles = Object.fromEntries(
    [...documents.entries()].map(([id2, document]) => [id2, extractStylesFromDocument(document)])
  );
  (0, import_store22.__dispatch)(slice.actions.addStyles(styles));
}
function extractStylesFromDocument(document) {
  if (!document.elements?.length) {
    return [];
  }
  return document.elements.flatMap(extractStylesFromElement);
}
function extractStylesFromElement(element) {
  return [
    ...Object.values(element.styles ?? {}),
    ...(element.elements ?? []).flatMap(extractStylesFromElement)
  ];
}

// src/store/actions/load-components-assets.ts
async function loadComponentsAssets(elements) {
  const documents = await getComponentDocuments(elements);
  updateDocumentState(documents);
  loadComponentsStyles(documents);
  await loadComponentsOverridableProps([...documents.keys()]);
}
function updateDocumentState(documents) {
  const isDrafted = [...documents.values()].some(import_editor_documents4.isDocumentDirty);
  if (isDrafted) {
    (0, import_editor_documents4.setDocumentModifiedStatus)(true);
  }
}

// src/components/load-template-components.tsx
var LoadTemplateComponents = () => {
  const templates = (0, import_editor_templates.useLoadedTemplates)();
  (0, import_react6.useEffect)(() => {
    loadComponentsAssets(templates.flatMap((elements) => elements ?? []));
  }, [templates]);
  return null;
};

// src/extended/init.ts
var import_editor = require("@elementor/editor");
var import_editor_controls7 = require("@elementor/editor-controls");
var import_editor_documents13 = require("@elementor/editor-documents");
var import_editor_editing_panel8 = require("@elementor/editor-editing-panel");
var import_editor_elements_panel = require("@elementor/editor-elements-panel");
var import_editor_panels6 = require("@elementor/editor-panels");
var import_editor_v1_adapters10 = require("@elementor/editor-v1-adapters");
var import_i18n31 = require("@wordpress/i18n");

// src/extended/components/component-panel-header/component-panel-header.tsx
var React27 = __toESM(require("react"));
var import_editor_current_user2 = require("@elementor/editor-current-user");
var import_editor_documents8 = require("@elementor/editor-documents");
var import_editor_panels5 = require("@elementor/editor-panels");
var import_editor_ui12 = require("@elementor/editor-ui");
var import_icons14 = require("@elementor/icons");
var import_store42 = require("@elementor/store");
var import_ui23 = require("@elementor/ui");
var import_i18n19 = require("@wordpress/i18n");

// src/extended/hooks/use-navigate-back.ts
var import_react7 = require("react");
var import_editor_documents5 = require("@elementor/editor-documents");
var import_store24 = require("@elementor/store");
function useNavigateBack() {
  const path = (0, import_store24.__useSelector)(selectPath);
  const documentsManager = (0, import_editor_documents5.getV1DocumentsManager)();
  return (0, import_react7.useCallback)(() => {
    const { componentId: prevComponentId, instanceId: prevComponentInstanceId } = path.at(-2) ?? {};
    if (prevComponentId && prevComponentInstanceId) {
      switchToComponent(prevComponentId, prevComponentInstanceId);
      return;
    }
    switchToComponent(documentsManager.getInitialId());
  }, [path, documentsManager]);
}

// src/extended/components/component-introduction.tsx
var React18 = __toESM(require("react"));
var import_editor_controls4 = require("@elementor/editor-controls");
var import_editor_ui7 = require("@elementor/editor-ui");
var import_ui14 = require("@elementor/ui");
var import_i18n8 = require("@wordpress/i18n");
var ComponentIntroduction = ({
  anchorRef,
  shouldShowIntroduction,
  onClose
}) => {
  if (!anchorRef.current || !shouldShowIntroduction) {
    return null;
  }
  return /* @__PURE__ */ React18.createElement(
    import_ui14.Popover,
    {
      anchorEl: anchorRef.current,
      open: shouldShowIntroduction,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: -30
      },
      onClose
    },
    /* @__PURE__ */ React18.createElement(import_ui14.Box, { sx: { width: "296px" } }, /* @__PURE__ */ React18.createElement(import_editor_ui7.PopoverHeader, { title: (0, import_i18n8.__)("Add your first property", "elementor"), onClose }), /* @__PURE__ */ React18.createElement(
      import_ui14.Image,
      {
        sx: { width: "296px", height: "160px" },
        src: "https://assets.elementor.com/packages/v1/images/components-properties-intro.png",
        alt: ""
      }
    ), /* @__PURE__ */ React18.createElement(import_editor_controls4.PopoverContent, null, /* @__PURE__ */ React18.createElement(import_ui14.Stack, { sx: { p: 2 } }, /* @__PURE__ */ React18.createElement(import_ui14.Typography, { variant: "body2" }, (0, import_i18n8.__)("Properties make instances flexible.", "elementor")), /* @__PURE__ */ React18.createElement(import_ui14.Typography, { variant: "body2" }, (0, import_i18n8.__)(
      "Select any Element, then in the General tab, click next to any setting you want users to customize - like text, images, or links.",
      "elementor"
    )), /* @__PURE__ */ React18.createElement(import_ui14.Typography, { variant: "body2", sx: { mt: 2 } }, (0, import_i18n8.__)(
      "Your properties will appear in the Properties panel, where you can organize and manage them anytime.",
      "elementor"
    )), /* @__PURE__ */ React18.createElement(
      import_ui14.Link,
      {
        href: "http://go.elementor.com/components-guide",
        target: "_blank",
        sx: { mt: 2 },
        color: "info.main",
        variant: "body2"
      },
      (0, import_i18n8.__)("Learn more", "elementor")
    ), /* @__PURE__ */ React18.createElement(import_ui14.Stack, { direction: "row", alignItems: "center", justifyContent: "flex-end", sx: { pt: 1 } }, /* @__PURE__ */ React18.createElement(import_ui14.Button, { size: "medium", variant: "contained", onClick: onClose }, (0, import_i18n8.__)("Got it", "elementor"))))))
  );
};

// src/extended/components/component-properties-panel/component-properties-panel.tsx
var React25 = __toESM(require("react"));
var import_editor_editing_panel5 = require("@elementor/editor-editing-panel");
var import_editor_panels4 = require("@elementor/editor-panels");
var import_editor_ui11 = require("@elementor/editor-ui");
var import_ui21 = require("@elementor/ui");
var import_i18n17 = require("@wordpress/i18n");

// src/extended/components/component-properties-panel/component-properties-panel-content.tsx
var React24 = __toESM(require("react"));
var import_react11 = require("react");
var import_editor_documents7 = require("@elementor/editor-documents");
var import_editor_panels3 = require("@elementor/editor-panels");
var import_icons12 = require("@elementor/icons");
var import_ui20 = require("@elementor/ui");
var import_utils6 = require("@elementor/utils");
var import_i18n16 = require("@wordpress/i18n");

// src/extended/store/actions/add-overridable-group.ts
var import_store26 = require("@elementor/store");
function addOverridableGroup({
  componentId,
  groupId,
  label,
  source
}) {
  const currentComponent = selectCurrentComponent((0, import_store26.__getState)());
  const overridableProps = selectOverridableProps((0, import_store26.__getState)(), componentId);
  if (!overridableProps) {
    return;
  }
  const newGroup = {
    id: groupId,
    label,
    props: []
  };
  (0, import_store26.__dispatch)(
    slice.actions.setOverridableProps({
      componentId,
      overridableProps: {
        ...overridableProps,
        groups: {
          ...overridableProps.groups,
          items: {
            ...overridableProps.groups.items,
            [groupId]: newGroup
          },
          order: [groupId, ...overridableProps.groups.order]
        }
      }
    })
  );
  trackComponentEvent({
    action: "propertiesGroupCreated",
    source,
    component_uid: currentComponent?.uid,
    group_name: label
  });
  return newGroup;
}

// src/extended/store/actions/delete-overridable-group.ts
var import_store28 = require("@elementor/store");

// src/extended/store/utils/groups-transformers.ts
var import_utils5 = require("@elementor/utils");
var import_i18n9 = require("@wordpress/i18n");
function removePropFromAllGroups(groups, propKey) {
  const propKeys = Array.isArray(propKey) ? propKey : [propKey];
  return {
    ...groups,
    items: Object.fromEntries(
      Object.entries(groups.items).map(([groupId, group]) => [
        groupId,
        {
          ...group,
          props: group.props.filter((p) => !propKeys.includes(p))
        }
      ])
    )
  };
}
function addPropToGroup(groups, groupId, propKey) {
  const group = groups.items[groupId];
  if (!group) {
    return groups;
  }
  if (group.props.includes(propKey)) {
    return groups;
  }
  return {
    ...groups,
    items: {
      ...groups.items,
      [groupId]: {
        ...group,
        props: [...group.props, propKey]
      }
    }
  };
}
function movePropBetweenGroups(groups, propKey, fromGroupId, toGroupId) {
  if (fromGroupId === toGroupId) {
    return groups;
  }
  const withoutProp = removePropFromGroup(groups, fromGroupId, propKey);
  return addPropToGroup(withoutProp, toGroupId, propKey);
}
function removePropFromGroup(groups, groupId, propKey) {
  const group = groups.items[groupId];
  if (!group) {
    return groups;
  }
  return {
    ...groups,
    items: {
      ...groups.items,
      [groupId]: {
        ...group,
        props: group.props.filter((p) => p !== propKey)
      }
    }
  };
}
function resolveOrCreateGroup(groups, requestedGroupId) {
  if (requestedGroupId && groups.items[requestedGroupId]) {
    return { groups, groupId: requestedGroupId };
  }
  if (!requestedGroupId && groups.order.length > 0) {
    return { groups, groupId: groups.order[0] };
  }
  return createGroup(groups, requestedGroupId);
}
function createGroup(groups, groupId, label) {
  const newGroupId = groupId || (0, import_utils5.generateUniqueId)("group");
  const newLabel = label || (0, import_i18n9.__)("Default", "elementor");
  return {
    groups: {
      ...groups,
      items: {
        ...groups.items,
        [newGroupId]: {
          id: newGroupId,
          label: newLabel,
          props: []
        }
      },
      order: [...groups.order, newGroupId]
    },
    groupId: newGroupId
  };
}
function removePropsFromState(overridableProps, propsToRemove) {
  const overrideKeysToRemove = propsToRemove.map((prop) => prop.overrideKey);
  const remainingProps = Object.fromEntries(
    Object.entries(overridableProps.props).filter(([, prop]) => !propsToRemove.includes(prop))
  );
  const updatedGroupItems = Object.fromEntries(
    Object.entries(overridableProps.groups.items).map(
      ([groupId, group]) => [
        groupId,
        {
          ...group,
          props: group.props.filter((prop) => !overrideKeysToRemove.includes(prop))
        }
      ]
    )
  );
  return {
    props: remainingProps,
    groups: {
      items: updatedGroupItems,
      order: overridableProps.groups.order.filter((groupId) => !overrideKeysToRemove.includes(groupId))
    }
  };
}
function ensureGroupInOrder(groups, groupId) {
  if (groups.order.includes(groupId)) {
    return groups;
  }
  return {
    ...groups,
    order: [...groups.order, groupId]
  };
}
function deleteGroup(groups, groupId) {
  const { [groupId]: removed, ...remainingItems } = groups.items;
  return {
    items: remainingItems,
    order: groups.order.filter((id2) => id2 !== groupId)
  };
}
function renameGroup(groups, groupId, newLabel) {
  const group = groups.items[groupId];
  if (!group) {
    return groups;
  }
  return {
    ...groups,
    items: {
      ...groups.items,
      [groupId]: {
        ...group,
        label: newLabel
      }
    }
  };
}

// src/extended/store/actions/delete-overridable-group.ts
function deleteOverridableGroup({ componentId, groupId }) {
  const overridableProps = selectOverridableProps((0, import_store28.__getState)(), componentId);
  if (!overridableProps) {
    return false;
  }
  const group = overridableProps.groups.items[groupId];
  if (!group || group.props.length > 0) {
    return false;
  }
  const updatedGroups = deleteGroup(overridableProps.groups, groupId);
  (0, import_store28.__dispatch)(
    slice.actions.setOverridableProps({
      componentId,
      overridableProps: {
        ...overridableProps,
        groups: updatedGroups
      }
    })
  );
  return true;
}

// src/extended/store/actions/delete-overridable-prop.ts
var import_store30 = require("@elementor/store");

// src/extended/utils/revert-overridable-settings.ts
var import_editor_elements6 = require("@elementor/editor-elements");
function revertElementOverridableSetting(elementId, settingKey, originValue, overrideKey) {
  const container = (0, import_editor_elements6.getContainer)(elementId);
  if (!container) {
    return;
  }
  if (isComponentInstance(container.model.toJSON())) {
    revertComponentInstanceOverridableSetting(elementId, overrideKey);
    return;
  }
  (0, import_editor_elements6.updateElementSettings)({
    id: elementId,
    props: { [settingKey]: originValue ?? null },
    withHistory: false
  });
}
function revertComponentInstanceOverridableSetting(elementId, overrideKey) {
  const setting = (0, import_editor_elements6.getElementSetting)(elementId, "component_instance");
  const componentInstance = componentInstancePropTypeUtil.extract(setting);
  const overrides = componentInstanceOverridesPropTypeUtil.extract(componentInstance?.overrides);
  if (!overrides?.length) {
    return;
  }
  const revertedOverrides = revertComponentInstanceOverrides(overrides, overrideKey);
  const updatedSetting = componentInstancePropTypeUtil.create({
    ...componentInstance,
    overrides: componentInstanceOverridesPropTypeUtil.create(revertedOverrides)
  });
  (0, import_editor_elements6.updateElementSettings)({
    id: elementId,
    props: { component_instance: updatedSetting },
    withHistory: false
  });
}
function revertComponentInstanceOverrides(overrides, filterByKey) {
  return overrides.map((item) => {
    if (!componentOverridablePropTypeUtil.isValid(item)) {
      return item;
    }
    if (!componentInstanceOverridePropTypeUtil.isValid(item.value.origin_value)) {
      return null;
    }
    if (filterByKey && item.value.override_key !== filterByKey) {
      return item;
    }
    return item.value.origin_value;
  }).filter((item) => item !== null);
}
function revertOverridablePropsFromSettings(settings) {
  let hasChanges = false;
  const revertedSettings = {};
  for (const [key, value] of Object.entries(settings)) {
    if (componentOverridablePropTypeUtil.isValid(value)) {
      revertedSettings[key] = value.value.origin_value;
      hasChanges = true;
    } else {
      revertedSettings[key] = value;
    }
  }
  return { hasChanges, settings: revertedSettings };
}
function revertAllOverridablesInElementData(elementData) {
  const revertedElement = { ...elementData };
  if (isComponentInstance({ widgetType: elementData.widgetType, elType: elementData.elType })) {
    revertedElement.settings = revertComponentInstanceSettings(elementData.settings);
  } else if (revertedElement.settings) {
    const { settings } = revertOverridablePropsFromSettings(revertedElement.settings);
    revertedElement.settings = settings;
  }
  if (revertedElement.elements) {
    revertedElement.elements = revertedElement.elements.map(revertAllOverridablesInElementData);
  }
  return revertedElement;
}
function revertComponentInstanceSettings(settings) {
  if (!settings?.component_instance) {
    return settings;
  }
  const componentInstance = componentInstancePropTypeUtil.extract(settings.component_instance);
  const overrides = componentInstanceOverridesPropTypeUtil.extract(componentInstance?.overrides);
  if (!overrides?.length) {
    return settings;
  }
  const revertedOverrides = revertComponentInstanceOverrides(overrides);
  return {
    ...settings,
    component_instance: componentInstancePropTypeUtil.create({
      ...componentInstance,
      overrides: componentInstanceOverridesPropTypeUtil.create(revertedOverrides)
    })
  };
}
function revertAllOverridablesInContainer(container) {
  (0, import_editor_elements6.getAllDescendants)(container).forEach((element) => {
    if (element.model.get("widgetType") === COMPONENT_WIDGET_TYPE) {
      revertComponentInstanceOverridesInElement(element);
    } else {
      revertElementSettings(element);
    }
  });
}
function revertComponentInstanceOverridesInElement(element) {
  const settings = element.settings?.toJSON() ?? {};
  const componentInstance = componentInstancePropTypeUtil.extract(settings.component_instance);
  const overrides = componentInstanceOverridesPropTypeUtil.extract(componentInstance?.overrides);
  if (!overrides?.length) {
    return;
  }
  const revertedOverrides = revertComponentInstanceOverrides(overrides);
  const updatedSetting = componentInstancePropTypeUtil.create({
    ...componentInstance,
    overrides: componentInstanceOverridesPropTypeUtil.create(revertedOverrides)
  });
  (0, import_editor_elements6.updateElementSettings)({
    id: element.id,
    props: { component_instance: updatedSetting },
    withHistory: false
  });
}
function revertElementSettings(element) {
  const settings = element.settings?.toJSON() ?? {};
  const { hasChanges, settings: revertedSettings } = revertOverridablePropsFromSettings(settings);
  if (!hasChanges) {
    return;
  }
  (0, import_editor_elements6.updateElementSettings)({
    id: element.id,
    props: revertedSettings,
    withHistory: false
  });
}

// src/extended/store/actions/delete-overridable-prop.ts
function deleteOverridableProp({ componentId, propKey, source }) {
  const overridableProps = selectOverridableProps((0, import_store30.__getState)(), componentId);
  if (!overridableProps || Object.keys(overridableProps.props).length === 0) {
    return;
  }
  const propKeysToDelete = Array.isArray(propKey) ? propKey : [propKey];
  const deletedProps = [];
  for (const key of propKeysToDelete) {
    const prop = overridableProps.props[key];
    if (!prop) {
      continue;
    }
    deletedProps.push(prop);
    revertElementOverridableSetting(prop.elementId, prop.propKey, prop.originValue, key);
  }
  if (deletedProps.length === 0) {
    return;
  }
  const remainingProps = Object.fromEntries(
    Object.entries(overridableProps.props).filter(([key]) => !propKeysToDelete.includes(key))
  );
  const updatedGroups = removePropFromAllGroups(overridableProps.groups, propKey);
  (0, import_store30.__dispatch)(
    slice.actions.setOverridableProps({
      componentId,
      overridableProps: {
        ...overridableProps,
        props: remainingProps,
        groups: updatedGroups
      }
    })
  );
  const currentComponent = selectCurrentComponent((0, import_store30.__getState)());
  for (const prop of deletedProps) {
    trackComponentEvent({
      action: "propertyRemoved",
      source,
      component_uid: currentComponent?.uid,
      property_id: prop.overrideKey,
      property_path: prop.propKey,
      property_name: prop.label,
      element_type: prop.widgetType ?? prop.elType
    });
  }
}

// src/extended/store/actions/reorder-group-props.ts
var import_store32 = require("@elementor/store");
function reorderGroupProps({ componentId, groupId, newPropsOrder }) {
  const overridableProps = selectOverridableProps((0, import_store32.__getState)(), componentId);
  if (!overridableProps) {
    return;
  }
  const group = overridableProps.groups.items[groupId];
  if (!group) {
    return;
  }
  (0, import_store32.__dispatch)(
    slice.actions.setOverridableProps({
      componentId,
      overridableProps: {
        ...overridableProps,
        groups: {
          ...overridableProps.groups,
          items: {
            ...overridableProps.groups.items,
            [groupId]: {
              ...group,
              props: newPropsOrder
            }
          }
        }
      }
    })
  );
}

// src/extended/store/actions/reorder-overridable-groups.ts
var import_store34 = require("@elementor/store");
function reorderOverridableGroups({ componentId, newOrder }) {
  const overridableProps = selectOverridableProps((0, import_store34.__getState)(), componentId);
  if (!overridableProps) {
    return;
  }
  (0, import_store34.__dispatch)(
    slice.actions.setOverridableProps({
      componentId,
      overridableProps: {
        ...overridableProps,
        groups: {
          ...overridableProps.groups,
          order: newOrder
        }
      }
    })
  );
}

// src/extended/store/actions/update-overridable-prop-params.ts
var import_store36 = require("@elementor/store");
function updateOverridablePropParams({
  componentId,
  overrideKey,
  label,
  groupId
}) {
  const overridableProps = selectOverridableProps((0, import_store36.__getState)(), componentId);
  if (!overridableProps) {
    return;
  }
  const prop = overridableProps.props[overrideKey];
  if (!prop) {
    return;
  }
  const oldGroupId = prop.groupId;
  const newGroupId = groupId ?? oldGroupId;
  const updatedProp = {
    ...prop,
    label,
    groupId: newGroupId
  };
  const updatedGroups = movePropBetweenGroups(overridableProps.groups, overrideKey, oldGroupId, newGroupId);
  (0, import_store36.__dispatch)(
    slice.actions.setOverridableProps({
      componentId,
      overridableProps: {
        ...overridableProps,
        props: {
          ...overridableProps.props,
          [overrideKey]: updatedProp
        },
        groups: updatedGroups
      }
    })
  );
  return updatedProp;
}

// src/extended/components/component-properties-panel/properties-empty-state.tsx
var React19 = __toESM(require("react"));
var import_react8 = require("react");
var import_icons8 = require("@elementor/icons");
var import_ui15 = require("@elementor/ui");
var import_i18n10 = require("@wordpress/i18n");
function PropertiesEmptyState({ introductionRef }) {
  const [isOpen, setIsOpen] = (0, import_react8.useState)(false);
  return /* @__PURE__ */ React19.createElement(React19.Fragment, null, /* @__PURE__ */ React19.createElement(
    import_ui15.Stack,
    {
      alignItems: "center",
      justifyContent: "flex-start",
      height: "100%",
      color: "text.secondary",
      sx: { px: 2.5, pt: 10, pb: 5.5 },
      gap: 1
    },
    /* @__PURE__ */ React19.createElement(import_icons8.ComponentPropListIcon, { fontSize: "large" }),
    /* @__PURE__ */ React19.createElement(import_ui15.Typography, { align: "center", variant: "subtitle2" }, (0, import_i18n10.__)("Add your first property", "elementor")),
    /* @__PURE__ */ React19.createElement(import_ui15.Typography, { align: "center", variant: "caption" }, (0, import_i18n10.__)("Make instances flexible while keeping design synced.", "elementor")),
    /* @__PURE__ */ React19.createElement(import_ui15.Typography, { align: "center", variant: "caption" }, (0, import_i18n10.__)("Select any element, then click + next to a setting to expose it.", "elementor")),
    /* @__PURE__ */ React19.createElement(
      import_ui15.Link,
      {
        variant: "caption",
        color: "secondary",
        sx: { textDecorationLine: "underline" },
        onClick: () => setIsOpen(true)
      },
      (0, import_i18n10.__)("Learn more", "elementor")
    )
  ), /* @__PURE__ */ React19.createElement(
    ComponentIntroduction,
    {
      anchorRef: introductionRef,
      shouldShowIntroduction: isOpen,
      onClose: () => setIsOpen(false)
    }
  ));
}

// src/extended/components/component-properties-panel/properties-group.tsx
var React23 = __toESM(require("react"));
var import_editor_ui9 = require("@elementor/editor-ui");
var import_icons11 = require("@elementor/icons");
var import_ui19 = require("@elementor/ui");
var import_i18n13 = require("@wordpress/i18n");

// src/extended/components/component-properties-panel/property-item.tsx
var React22 = __toESM(require("react"));
var import_editor_elements7 = require("@elementor/editor-elements");
var import_icons10 = require("@elementor/icons");
var import_ui18 = require("@elementor/ui");

// src/extended/components/overridable-props/overridable-prop-form.tsx
var React20 = __toESM(require("react"));
var import_react9 = require("react");
var import_editor_ui8 = require("@elementor/editor-ui");
var import_ui16 = require("@elementor/ui");
var import_i18n12 = require("@wordpress/i18n");

// src/extended/components/overridable-props/utils/validate-prop-label.ts
var import_i18n11 = require("@wordpress/i18n");
var ERROR_MESSAGES = {
  EMPTY_NAME: (0, import_i18n11.__)("Property name is required", "elementor"),
  DUPLICATE_NAME: (0, import_i18n11.__)("Property name already exists", "elementor")
};
function validatePropLabel(label, existingLabels, currentLabel) {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) {
    return { isValid: false, errorMessage: ERROR_MESSAGES.EMPTY_NAME };
  }
  const normalizedLabel = trimmedLabel.toLowerCase();
  const normalizedCurrentLabel = currentLabel?.trim().toLowerCase();
  const isDuplicate = existingLabels.some((existingLabel) => {
    const normalizedExisting = existingLabel.trim().toLowerCase();
    if (normalizedCurrentLabel && normalizedExisting === normalizedCurrentLabel) {
      return false;
    }
    return normalizedExisting === normalizedLabel;
  });
  if (isDuplicate) {
    return { isValid: false, errorMessage: ERROR_MESSAGES.DUPLICATE_NAME };
  }
  return { isValid: true, errorMessage: null };
}

// src/extended/components/overridable-props/overridable-prop-form.tsx
var SIZE = "tiny";
var DEFAULT_GROUP = { value: null, label: (0, import_i18n12.__)("Default", "elementor") };
function OverridablePropForm({ onSubmit, groups, currentValue, existingLabels = [], sx }) {
  const selectGroups = groups?.length ? groups : [DEFAULT_GROUP];
  const [propLabel, setPropLabel] = (0, import_react9.useState)(currentValue?.label ?? null);
  const [group, setGroup] = (0, import_react9.useState)(currentValue?.groupId ?? selectGroups[0]?.value ?? null);
  const [error, setError] = (0, import_react9.useState)(null);
  const name = (0, import_i18n12.__)("Name", "elementor");
  const groupName = (0, import_i18n12.__)("Group Name", "elementor");
  const isCreate = currentValue === void 0;
  const title = isCreate ? (0, import_i18n12.__)("Create new property", "elementor") : (0, import_i18n12.__)("Update property", "elementor");
  const ctaLabel = isCreate ? (0, import_i18n12.__)("Create", "elementor") : (0, import_i18n12.__)("Update", "elementor");
  const handleSubmit = () => {
    const validationResult = validatePropLabel(propLabel ?? "", existingLabels, currentValue?.label);
    if (!validationResult.isValid) {
      setError(validationResult.errorMessage);
      return;
    }
    onSubmit({ label: propLabel ?? "", group });
  };
  return /* @__PURE__ */ React20.createElement(import_editor_ui8.Form, { onSubmit: handleSubmit, "data-testid": "overridable-prop-form" }, /* @__PURE__ */ React20.createElement(import_ui16.Stack, { alignItems: "start", sx: { width: "268px", ...sx } }, /* @__PURE__ */ React20.createElement(
    import_ui16.Stack,
    {
      direction: "row",
      alignItems: "center",
      py: 1,
      px: 1.5,
      sx: { columnGap: 0.5, borderBottom: "1px solid", borderColor: "divider", width: "100%", mb: 1.5 }
    },
    /* @__PURE__ */ React20.createElement(import_ui16.Typography, { variant: "caption", sx: { color: "text.primary", fontWeight: "500", lineHeight: 1 } }, title)
  ), /* @__PURE__ */ React20.createElement(import_ui16.Grid, { container: true, gap: 0.75, alignItems: "start", px: 1.5, mb: 1.5 }, /* @__PURE__ */ React20.createElement(import_ui16.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React20.createElement(import_ui16.FormLabel, { size: "tiny" }, name)), /* @__PURE__ */ React20.createElement(import_ui16.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React20.createElement(
    import_ui16.TextField,
    {
      name,
      size: SIZE,
      fullWidth: true,
      placeholder: (0, import_i18n12.__)("Enter value", "elementor"),
      value: propLabel ?? "",
      onChange: (e) => {
        const newValue = e.target.value;
        setPropLabel(newValue);
        const validationResult = validatePropLabel(
          newValue,
          existingLabels,
          currentValue?.label
        );
        setError(validationResult.errorMessage);
      },
      error: Boolean(error),
      helperText: error
    }
  ))), /* @__PURE__ */ React20.createElement(import_ui16.Grid, { container: true, gap: 0.75, alignItems: "start", px: 1.5, mb: 1.5 }, /* @__PURE__ */ React20.createElement(import_ui16.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React20.createElement(import_ui16.FormLabel, { size: "tiny" }, groupName)), /* @__PURE__ */ React20.createElement(import_ui16.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React20.createElement(
    import_ui16.Select,
    {
      name: groupName,
      size: SIZE,
      fullWidth: true,
      value: group ?? null,
      onChange: (e) => setGroup(e.target.value),
      displayEmpty: true,
      renderValue: (selectedValue) => {
        if (!selectedValue) {
          return selectGroups[0].label;
        }
        return selectGroups.find(({ value }) => value === selectedValue)?.label ?? selectedValue;
      }
    },
    selectGroups.map(({ label: groupLabel, ...props }) => /* @__PURE__ */ React20.createElement(import_editor_ui8.MenuListItem, { key: props.value, ...props, value: props.value ?? "" }, groupLabel))
  ))), /* @__PURE__ */ React20.createElement(import_ui16.Stack, { direction: "row", justifyContent: "flex-end", alignSelf: "end", mt: 1.5, py: 1, px: 1.5 }, /* @__PURE__ */ React20.createElement(
    import_ui16.Button,
    {
      type: "submit",
      disabled: !propLabel || Boolean(error),
      variant: "contained",
      color: "primary",
      size: "small"
    },
    ctaLabel
  ))));
}

// src/extended/components/component-properties-panel/sortable.tsx
var React21 = __toESM(require("react"));
var import_icons9 = require("@elementor/icons");
var import_ui17 = require("@elementor/ui");
var SortableProvider = (props) => /* @__PURE__ */ React21.createElement(import_ui17.UnstableSortableProvider, { restrictAxis: true, variant: "static", dragPlaceholderStyle: { opacity: "1" }, ...props });
var SortableTrigger = ({ triggerClassName, ...props }) => /* @__PURE__ */ React21.createElement(
  StyledSortableTrigger,
  {
    ...props,
    role: "button",
    className: `sortable-trigger ${triggerClassName ?? ""}`.trim(),
    "aria-label": "sort"
  },
  /* @__PURE__ */ React21.createElement(import_icons9.GripVerticalIcon, { fontSize: "tiny" })
);
var SortableItem = ({ children, id: id2 }) => /* @__PURE__ */ React21.createElement(
  import_ui17.UnstableSortableItem,
  {
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
    }) => /* @__PURE__ */ React21.createElement(
      import_ui17.Box,
      {
        ...itemProps,
        style: itemStyle,
        component: "div",
        role: "listitem",
        sx: {
          backgroundColor: isDragOverlay ? "background.paper" : void 0
        }
      },
      children({
        isDragged,
        isDragPlaceholder,
        triggerProps,
        triggerStyle
      }),
      showDropIndication && /* @__PURE__ */ React21.createElement(SortableItemIndicator, { style: dropIndicationStyle })
    )
  }
);
var StyledSortableTrigger = (0, import_ui17.styled)("div")(({ theme }) => ({
  position: "absolute",
  left: "-2px",
  top: "50%",
  transform: `translate( -${theme.spacing(1.5)}, -50% )`,
  color: theme.palette.action.active,
  cursor: "grab"
}));
var SortableItemIndicator = (0, import_ui17.styled)(import_ui17.Box)`
	width: 100%;
	height: 1px;
	background-color: ${({ theme }) => theme.palette.text.primary};
`;

// src/extended/components/component-properties-panel/property-item.tsx
function PropertyItem({
  prop,
  sortableTriggerProps,
  isDragPlaceholder,
  groups,
  existingLabels,
  onDelete,
  onUpdate
}) {
  const popoverState = (0, import_ui18.usePopupState)({
    variant: "popover"
  });
  const icon = getElementIcon(prop);
  const popoverProps = (0, import_ui18.bindPopover)(popoverState);
  const handleSubmit = (data) => {
    onUpdate(data);
    popoverState.close();
  };
  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete(prop.overrideKey);
  };
  return /* @__PURE__ */ React22.createElement(React22.Fragment, null, /* @__PURE__ */ React22.createElement(
    import_ui18.Box,
    {
      ...(0, import_ui18.bindTrigger)(popoverState),
      sx: {
        position: "relative",
        pl: 0.5,
        pr: 1,
        py: 0.25,
        minHeight: 28,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        opacity: isDragPlaceholder ? 0.5 : 1,
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "action.hover"
        },
        "&:hover .sortable-trigger": {
          visibility: "visible"
        },
        "& .sortable-trigger": {
          visibility: "hidden"
        },
        "&:hover .delete-button": {
          visibility: "visible"
        },
        "& .delete-button": {
          visibility: "hidden"
        }
      }
    },
    /* @__PURE__ */ React22.createElement(SortableTrigger, { ...sortableTriggerProps }),
    /* @__PURE__ */ React22.createElement(
      import_ui18.Box,
      {
        sx: { display: "flex", alignItems: "center", color: "text.primary", fontSize: 12, padding: 0.25 }
      },
      /* @__PURE__ */ React22.createElement("i", { className: icon })
    ),
    /* @__PURE__ */ React22.createElement(import_ui18.Typography, { variant: "caption", sx: { color: "text.primary", flexGrow: 1, fontSize: 10 } }, prop.label),
    /* @__PURE__ */ React22.createElement(import_ui18.IconButton, { size: "tiny", onClick: handleDelete, "aria-label": "Delete property", sx: { p: 0.25 } }, /* @__PURE__ */ React22.createElement(import_icons10.XIcon, { fontSize: "tiny" }))
  ), /* @__PURE__ */ React22.createElement(
    import_ui18.Popover,
    {
      ...popoverProps,
      anchorOrigin: { vertical: "bottom", horizontal: "left" },
      transformOrigin: { vertical: "top", horizontal: "left" },
      PaperProps: { sx: { width: popoverState.anchorEl?.getBoundingClientRect().width } }
    },
    /* @__PURE__ */ React22.createElement(
      OverridablePropForm,
      {
        onSubmit: handleSubmit,
        currentValue: prop,
        groups,
        existingLabels,
        sx: { width: "100%" }
      }
    )
  ));
}
function getElementIcon(prop) {
  const elType = prop.elType === "widget" ? prop.widgetType : prop.elType;
  const widgetsCache = (0, import_editor_elements7.getWidgetsCache)();
  if (!widgetsCache) {
    return "eicon-apps";
  }
  const widgetConfig = widgetsCache[elType];
  return widgetConfig?.icon || "eicon-apps";
}

// src/extended/components/component-properties-panel/properties-group.tsx
function PropertiesGroup({
  group,
  props,
  allGroups,
  sortableTriggerProps,
  isDragPlaceholder,
  onPropsReorder,
  onPropertyDelete,
  onPropertyUpdate,
  onGroupDelete,
  editableLabelProps
}) {
  const groupProps = group.props.map((propId) => props[propId]).filter((prop) => Boolean(prop));
  const popupState = (0, import_ui19.usePopupState)({
    variant: "popover",
    disableAutoFocus: true
  });
  const { editableRef, isEditing, error, getEditableProps, setEditingGroupId, editingGroupId } = editableLabelProps;
  const hasProperties = group.props.length > 0;
  const isThisGroupEditing = isEditing && editingGroupId === group.id;
  const handleRenameClick = () => {
    popupState.close();
    setEditingGroupId(group.id);
  };
  const handleDeleteClick = () => {
    popupState.close();
    onGroupDelete(group.id);
  };
  return /* @__PURE__ */ React23.createElement(
    import_ui19.Box,
    {
      sx: {
        opacity: isDragPlaceholder ? 0.5 : 1
      }
    },
    /* @__PURE__ */ React23.createElement(import_ui19.Stack, { gap: 1 }, /* @__PURE__ */ React23.createElement(
      import_ui19.Box,
      {
        className: "group-header",
        sx: {
          position: "relative",
          "&:hover .group-sortable-trigger": {
            visibility: "visible"
          },
          "& .group-sortable-trigger": {
            visibility: "hidden"
          },
          "&:hover .group-menu": {
            visibility: "visible"
          },
          "& .group-menu": {
            visibility: "hidden"
          }
        }
      },
      /* @__PURE__ */ React23.createElement(SortableTrigger, { triggerClassName: "group-sortable-trigger", ...sortableTriggerProps }),
      /* @__PURE__ */ React23.createElement(import_ui19.Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", gap: 2 }, isThisGroupEditing ? /* @__PURE__ */ React23.createElement(
        import_ui19.Box,
        {
          sx: {
            height: 28,
            display: "flex",
            alignItems: "center",
            border: 2,
            borderColor: "text.secondary",
            borderRadius: 1,
            pl: 0.5,
            flexGrow: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%"
          }
        },
        /* @__PURE__ */ React23.createElement(
          import_editor_ui9.EditableField,
          {
            ref: editableRef,
            as: import_ui19.Typography,
            variant: "caption",
            error: error ?? void 0,
            sx: { color: "text.primary", fontWeight: 400, lineHeight: 1.66 },
            ...getEditableProps()
          }
        )
      ) : /* @__PURE__ */ React23.createElement(
        import_editor_ui9.EllipsisWithTooltip,
        {
          title: group.label,
          as: import_ui19.Typography,
          variant: "caption",
          sx: { color: "text.primary", fontWeight: 400, lineHeight: 1.66 }
        }
      ), /* @__PURE__ */ React23.createElement(
        import_ui19.IconButton,
        {
          className: "group-menu",
          size: "tiny",
          sx: { p: 0.25, visibility: isThisGroupEditing ? "visible" : void 0 },
          "aria-label": (0, import_i18n13.__)("Group actions", "elementor"),
          ...(0, import_ui19.bindTrigger)(popupState)
        },
        /* @__PURE__ */ React23.createElement(import_icons11.DotsVerticalIcon, { fontSize: "tiny" })
      ))
    ), /* @__PURE__ */ React23.createElement(import_ui19.List, { sx: { p: 0, display: "flex", flexDirection: "column", gap: 1 } }, /* @__PURE__ */ React23.createElement(SortableProvider, { value: group.props, onChange: onPropsReorder }, groupProps.map((prop) => /* @__PURE__ */ React23.createElement(SortableItem, { key: prop.overrideKey, id: prop.overrideKey }, ({ triggerProps, triggerStyle, isDragPlaceholder: isItemDragPlaceholder }) => /* @__PURE__ */ React23.createElement(
      PropertyItem,
      {
        prop,
        sortableTriggerProps: { ...triggerProps, style: triggerStyle },
        isDragPlaceholder: isItemDragPlaceholder,
        groups: allGroups,
        existingLabels: Object.values(props).map((p) => p.label),
        onDelete: onPropertyDelete,
        onUpdate: (data) => onPropertyUpdate(prop.overrideKey, data)
      }
    )))))),
    /* @__PURE__ */ React23.createElement(
      import_ui19.Menu,
      {
        ...(0, import_ui19.bindMenu)(popupState),
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
        transformOrigin: { vertical: "top", horizontal: "right" }
      },
      /* @__PURE__ */ React23.createElement(import_editor_ui9.MenuListItem, { sx: { minWidth: "160px" }, onClick: handleRenameClick }, /* @__PURE__ */ React23.createElement(import_ui19.Typography, { variant: "caption", sx: { color: "text.primary" } }, (0, import_i18n13.__)("Rename", "elementor"))),
      /* @__PURE__ */ React23.createElement(
        import_ui19.Tooltip,
        {
          title: hasProperties ? (0, import_i18n13.__)("To delete the group, first remove all the properties", "elementor") : "",
          placement: "right"
        },
        /* @__PURE__ */ React23.createElement("span", null, /* @__PURE__ */ React23.createElement(import_editor_ui9.MenuListItem, { onClick: handleDeleteClick, disabled: hasProperties }, /* @__PURE__ */ React23.createElement(
          import_ui19.Typography,
          {
            variant: "caption",
            sx: { color: hasProperties ? "text.disabled" : "error.light" }
          },
          (0, import_i18n13.__)("Delete", "elementor")
        )))
      )
    )
  );
}

// src/extended/components/component-properties-panel/use-current-editable-item.ts
var import_react10 = require("react");
var import_editor_documents6 = require("@elementor/editor-documents");
var import_editor_ui10 = require("@elementor/editor-ui");
var import_i18n15 = require("@wordpress/i18n");

// src/extended/store/actions/rename-overridable-group.ts
var import_store38 = require("@elementor/store");
function renameOverridableGroup({ componentId, groupId, label }) {
  const overridableProps = selectOverridableProps((0, import_store38.__getState)(), componentId);
  if (!overridableProps) {
    return false;
  }
  const group = overridableProps.groups.items[groupId];
  if (!group) {
    return false;
  }
  const updatedGroups = renameGroup(overridableProps.groups, groupId, label);
  (0, import_store38.__dispatch)(
    slice.actions.setOverridableProps({
      componentId,
      overridableProps: {
        ...overridableProps,
        groups: updatedGroups
      }
    })
  );
  return true;
}

// src/extended/components/component-properties-panel/utils/validate-group-label.ts
var import_i18n14 = require("@wordpress/i18n");
var ERROR_MESSAGES2 = {
  EMPTY_NAME: (0, import_i18n14.__)("Group name is required", "elementor"),
  DUPLICATE_NAME: (0, import_i18n14.__)("Group name already exists", "elementor")
};
function validateGroupLabel(label, existingGroups) {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) {
    return ERROR_MESSAGES2.EMPTY_NAME;
  }
  const isDuplicate = Object.values(existingGroups).some((group) => group.label === trimmedLabel);
  if (isDuplicate) {
    return ERROR_MESSAGES2.DUPLICATE_NAME;
  }
  return "";
}

// src/extended/components/component-properties-panel/use-current-editable-item.ts
function useCurrentEditableItem() {
  const [editingGroupId, setEditingGroupId] = (0, import_react10.useState)(null);
  const currentComponentId = useCurrentComponentId();
  const overridableProps = useOverridableProps(currentComponentId);
  const allGroupsRecord = overridableProps?.groups?.items ?? {};
  const currentGroup = editingGroupId ? allGroupsRecord[editingGroupId] : null;
  const validateLabel = (newLabel) => {
    const otherGroups = Object.fromEntries(
      Object.entries(allGroupsRecord).filter(([id2]) => id2 !== editingGroupId)
    );
    return validateGroupLabel(newLabel, otherGroups) || null;
  };
  const handleSubmit = (newLabel) => {
    if (!editingGroupId || !currentComponentId) {
      throw new Error((0, import_i18n15.__)("Group ID or component ID is missing", "elementor"));
    }
    renameOverridableGroup({
      componentId: currentComponentId,
      groupId: editingGroupId,
      label: newLabel
    });
    (0, import_editor_documents6.setDocumentModifiedStatus)(true);
  };
  const {
    ref: editableRef,
    openEditMode,
    isEditing,
    error,
    getProps: getEditableProps
  } = (0, import_editor_ui10.useEditable)({
    value: currentGroup?.label ?? "",
    onSubmit: handleSubmit,
    validation: validateLabel
  });
  return {
    editableRef,
    isEditing,
    error,
    getEditableProps,
    setEditingGroupId: (groupId) => {
      setEditingGroupId(groupId);
      openEditMode();
    },
    editingGroupId
  };
}

// src/extended/components/component-properties-panel/utils/generate-unique-label.ts
var DEFAULT_NEW_GROUP_LABEL = "New group";
function generateUniqueLabel(groups) {
  const existingLabels = new Set(groups.map((group) => group.label));
  if (!existingLabels.has(DEFAULT_NEW_GROUP_LABEL)) {
    return DEFAULT_NEW_GROUP_LABEL;
  }
  let index = 1;
  let newLabel = `${DEFAULT_NEW_GROUP_LABEL}-${index}`;
  while (existingLabels.has(newLabel)) {
    index++;
    newLabel = `${DEFAULT_NEW_GROUP_LABEL}-${index}`;
  }
  return newLabel;
}

// src/extended/components/component-properties-panel/component-properties-panel-content.tsx
function ComponentPropertiesPanelContent({ onClose }) {
  const currentComponentId = useCurrentComponentId();
  const overridableProps = useSanitizeOverridableProps(currentComponentId);
  const [isAddingGroup, setIsAddingGroup] = (0, import_react11.useState)(false);
  const introductionRef = (0, import_react11.useRef)(null);
  const groupLabelEditable = useCurrentEditableItem();
  const groups = (0, import_react11.useMemo)(() => {
    if (!overridableProps) {
      return [];
    }
    return overridableProps.groups.order.map((groupId) => overridableProps.groups.items[groupId] ?? null).filter(Boolean);
  }, [overridableProps]);
  const allGroupsForSelect = (0, import_react11.useMemo)(
    () => groups.map((group) => ({ value: group.id, label: group.label })),
    [groups]
  );
  if (!currentComponentId || !overridableProps) {
    return null;
  }
  const hasGroups = groups.length > 0;
  const showEmptyState = !hasGroups && !isAddingGroup;
  const groupIds = overridableProps.groups.order;
  const handleAddGroupClick = () => {
    if (isAddingGroup) {
      return;
    }
    const newGroupId = (0, import_utils6.generateUniqueId)("group");
    const newLabel = generateUniqueLabel(groups);
    addOverridableGroup({
      componentId: currentComponentId,
      groupId: newGroupId,
      label: newLabel,
      source: "user"
    });
    (0, import_editor_documents7.setDocumentModifiedStatus)(true);
    setIsAddingGroup(false);
    groupLabelEditable.setEditingGroupId(newGroupId);
  };
  const handleGroupsReorder = (newOrder) => {
    reorderOverridableGroups({ componentId: currentComponentId, newOrder });
    (0, import_editor_documents7.setDocumentModifiedStatus)(true);
  };
  const handlePropsReorder = (groupId, newPropsOrder) => {
    reorderGroupProps({ componentId: currentComponentId, groupId, newPropsOrder });
    (0, import_editor_documents7.setDocumentModifiedStatus)(true);
  };
  const handlePropertyDelete = (propKey) => {
    deleteOverridableProp({ componentId: currentComponentId, propKey, source: "user" });
    (0, import_editor_documents7.setDocumentModifiedStatus)(true);
  };
  const handlePropertyUpdate = (overrideKey, data) => {
    updateOverridablePropParams({
      componentId: currentComponentId,
      overrideKey,
      label: data.label,
      groupId: data.group
    });
    (0, import_editor_documents7.setDocumentModifiedStatus)(true);
  };
  const handleGroupDelete = (groupId) => {
    deleteOverridableGroup({ componentId: currentComponentId, groupId });
    (0, import_editor_documents7.setDocumentModifiedStatus)(true);
  };
  return /* @__PURE__ */ React24.createElement(React24.Fragment, null, /* @__PURE__ */ React24.createElement(import_editor_panels3.PanelHeader, { sx: { justifyContent: "start", pl: 1.5, pr: 1, py: 1 } }, /* @__PURE__ */ React24.createElement(import_ui20.Stack, { direction: "row", alignItems: "center", gap: 0.5, flexGrow: 1 }, /* @__PURE__ */ React24.createElement(import_icons12.ComponentPropListIcon, { fontSize: "tiny" }), /* @__PURE__ */ React24.createElement(import_editor_panels3.PanelHeaderTitle, { variant: "subtitle2" }, (0, import_i18n16.__)("Component properties", "elementor"))), !showEmptyState && /* @__PURE__ */ React24.createElement(import_ui20.Tooltip, { title: (0, import_i18n16.__)("Add new group", "elementor") }, /* @__PURE__ */ React24.createElement(
    import_ui20.IconButton,
    {
      size: "tiny",
      "aria-label": (0, import_i18n16.__)("Add new group", "elementor"),
      onClick: handleAddGroupClick
    },
    /* @__PURE__ */ React24.createElement(import_icons12.FolderPlusIcon, { fontSize: "tiny" })
  )), /* @__PURE__ */ React24.createElement(import_ui20.Tooltip, { title: (0, import_i18n16.__)("Close panel", "elementor") }, /* @__PURE__ */ React24.createElement(
    import_ui20.IconButton,
    {
      ref: introductionRef,
      size: "tiny",
      "aria-label": (0, import_i18n16.__)("Close panel", "elementor"),
      onClick: onClose
    },
    /* @__PURE__ */ React24.createElement(import_icons12.XIcon, { fontSize: "tiny" })
  ))), /* @__PURE__ */ React24.createElement(import_ui20.Divider, null), /* @__PURE__ */ React24.createElement(import_editor_panels3.PanelBody, null, showEmptyState ? /* @__PURE__ */ React24.createElement(PropertiesEmptyState, { introductionRef }) : /* @__PURE__ */ React24.createElement(import_ui20.List, { sx: { p: 2, display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React24.createElement(SortableProvider, { value: groupIds, onChange: handleGroupsReorder }, groups.map((group) => /* @__PURE__ */ React24.createElement(SortableItem, { key: group.id, id: group.id }, ({ triggerProps, triggerStyle, isDragPlaceholder }) => /* @__PURE__ */ React24.createElement(
    PropertiesGroup,
    {
      group,
      props: overridableProps.props,
      allGroups: allGroupsForSelect,
      allGroupsRecord: overridableProps.groups.items,
      sortableTriggerProps: { ...triggerProps, style: triggerStyle },
      isDragPlaceholder,
      setIsAddingGroup,
      onPropsReorder: (newOrder) => handlePropsReorder(group.id, newOrder),
      onPropertyDelete: handlePropertyDelete,
      onPropertyUpdate: handlePropertyUpdate,
      editableLabelProps: groupLabelEditable,
      onGroupDelete: handleGroupDelete
    }
  )))))));
}

// src/extended/components/component-properties-panel/component-properties-panel.tsx
var id = "component-properties-panel";
var { panel, usePanelActions } = (0, import_editor_panels4.__createPanel)({
  id,
  component: ComponentPropertiesPanel
});
function ComponentPropertiesPanel() {
  const { close: closePanel } = usePanelActions();
  const { open: openEditingPanel } = (0, import_editor_editing_panel5.usePanelActions)();
  return /* @__PURE__ */ React25.createElement(import_editor_ui11.ThemeProvider, null, /* @__PURE__ */ React25.createElement(import_ui21.ErrorBoundary, { fallback: /* @__PURE__ */ React25.createElement(ErrorBoundaryFallback, null) }, /* @__PURE__ */ React25.createElement(import_editor_panels4.Panel, null, /* @__PURE__ */ React25.createElement(
    ComponentPropertiesPanelContent,
    {
      onClose: () => {
        closePanel();
        openEditingPanel();
      }
    }
  ))));
}
var ErrorBoundaryFallback = () => /* @__PURE__ */ React25.createElement(import_ui21.Box, { role: "alert", sx: { minHeight: "100%", p: 2 } }, /* @__PURE__ */ React25.createElement(import_ui21.Alert, { severity: "error", sx: { mb: 2, maxWidth: 400, textAlign: "center" } }, /* @__PURE__ */ React25.createElement("strong", null, (0, import_i18n17.__)("Something went wrong", "elementor"))));

// src/extended/components/component-panel-header/component-badge.tsx
var React26 = __toESM(require("react"));
var import_react12 = require("react");
var import_icons13 = require("@elementor/icons");
var import_ui22 = require("@elementor/ui");
var import_i18n18 = require("@wordpress/i18n");
var ComponentsBadge = React26.forwardRef(({ overridablePropsCount, onClick }, ref) => {
  const prevCount = usePrevious(overridablePropsCount);
  const isFirstExposedProperty = prevCount === 0 && overridablePropsCount === 1;
  return /* @__PURE__ */ React26.createElement(
    StyledBadge,
    {
      ref,
      color: "primary",
      key: overridablePropsCount,
      invisible: overridablePropsCount === 0,
      animate: isFirstExposedProperty,
      anchorOrigin: { vertical: "top", horizontal: "right" },
      badgeContent: /* @__PURE__ */ React26.createElement(import_ui22.Box, { sx: { animation: !isFirstExposedProperty ? `${slideUp} 300ms ease-out` : "none" } }, overridablePropsCount)
    },
    /* @__PURE__ */ React26.createElement(import_ui22.Tooltip, { title: (0, import_i18n18.__)("Component properties", "elementor") }, /* @__PURE__ */ React26.createElement(
      import_ui22.ToggleButton,
      {
        value: "exposed properties",
        size: "tiny",
        onClick,
        "aria-label": (0, import_i18n18.__)("Component properties", "elementor")
      },
      /* @__PURE__ */ React26.createElement(import_icons13.ComponentPropListIcon, { fontSize: "tiny" })
    ))
  );
});
var StyledBadge = (0, import_ui22.styled)(import_ui22.Badge, { shouldForwardProp: (prop) => prop !== "animate" })(
  ({ theme, animate }) => ({
    "& .MuiBadge-badge": {
      minWidth: theme.spacing(2),
      height: theme.spacing(2),
      minHeight: theme.spacing(2),
      maxWidth: theme.spacing(2),
      fontSize: theme.typography.caption.fontSize,
      animation: animate ? `${bounceIn} 300ms ease-out` : "none"
    }
  })
);
function usePrevious(value) {
  const ref = (0, import_react12.useRef)(value);
  (0, import_react12.useEffect)(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
var bounceIn = import_ui22.keyframes`
	0% { transform: scale(0) translate(50%, 50%); opacity: 0; }
	70% { transform: scale(1.1) translate(50%, -50%); opacity: 1; }
	100% { transform: scale(1) translate(50%, -50%); opacity: 1; }
`;
var slideUp = import_ui22.keyframes`
	from { transform: translateY(100%); opacity: 0; }
	to { transform: translateY(0); opacity: 1; }
`;

// src/extended/components/component-panel-header/component-panel-header.tsx
var MESSAGE_KEY = "components-properties-introduction";
var ComponentPanelHeader = () => {
  const { id: currentComponentId, uid: componentUid } = useCurrentComponent() ?? { id: null, uid: null };
  const overridableProps = useSanitizeOverridableProps(currentComponentId);
  const onBack = useNavigateBack();
  const componentName = getComponentName();
  const [isMessageSuppressed, suppressMessage] = (0, import_editor_current_user2.useSuppressedMessage)(MESSAGE_KEY);
  const [shouldShowIntroduction, setShouldShowIntroduction] = React27.useState(!isMessageSuppressed);
  const { open: openPropertiesPanel } = usePanelActions();
  const overridablePropsCount = overridableProps ? Object.keys(overridableProps.props).length : 0;
  const anchorRef = React27.useRef(null);
  if (!currentComponentId) {
    return null;
  }
  const handleCloseIntroduction = () => {
    suppressMessage();
    setShouldShowIntroduction(false);
  };
  const handleOpenPropertiesPanel = () => {
    openPropertiesPanel();
    trackComponentEvent({
      action: "propertiesPanelOpened",
      source: "user",
      component_uid: componentUid,
      properties_count: overridablePropsCount
    });
  };
  return /* @__PURE__ */ React27.createElement(import_ui23.Box, { "data-testid": "component-panel-header" }, /* @__PURE__ */ React27.createElement(import_editor_panels5.PanelHeader, { sx: { justifyContent: "start", px: 2 } }, /* @__PURE__ */ React27.createElement(import_ui23.Tooltip, { title: (0, import_i18n19.__)("Back", "elementor") }, /* @__PURE__ */ React27.createElement(import_ui23.IconButton, { size: "tiny", onClick: onBack, "aria-label": (0, import_i18n19.__)("Back", "elementor") }, /* @__PURE__ */ React27.createElement(import_icons14.ArrowLeftIcon, { fontSize: "tiny" }))), /* @__PURE__ */ React27.createElement(import_icons14.ComponentsFilledIcon, { fontSize: "tiny", stroke: "currentColor" }), /* @__PURE__ */ React27.createElement(
    import_editor_ui12.EllipsisWithTooltip,
    {
      title: componentName,
      as: import_ui23.Typography,
      variant: "caption",
      sx: { fontWeight: 500, flexGrow: 1 }
    }
  ), /* @__PURE__ */ React27.createElement(
    ComponentsBadge,
    {
      overridablePropsCount,
      ref: anchorRef,
      onClick: handleOpenPropertiesPanel
    }
  )), /* @__PURE__ */ React27.createElement(import_ui23.Divider, null), /* @__PURE__ */ React27.createElement(
    ComponentIntroduction,
    {
      anchorRef,
      shouldShowIntroduction,
      onClose: handleCloseIntroduction
    }
  ));
};
function getComponentName() {
  const state = (0, import_store42.__getState)();
  const path = state[SLICE_NAME].path;
  const { instanceTitle } = path.at(-1) ?? {};
  if (instanceTitle) {
    return instanceTitle;
  }
  const documentsManager = (0, import_editor_documents8.getV1DocumentsManager)();
  const currentDocument = documentsManager.getCurrent();
  return currentDocument?.container?.settings?.get("post_title") ?? "";
}

// src/extended/components/components-tab/components.tsx
var React30 = __toESM(require("react"));
var import_editor_ui15 = require("@elementor/editor-ui");
var import_ui25 = require("@elementor/ui");

// src/extended/components/components-tab/component-item.tsx
var React29 = __toESM(require("react"));
var import_react13 = require("react");
var import_editor_canvas5 = require("@elementor/editor-canvas");
var import_editor_elements10 = require("@elementor/editor-elements");
var import_editor_ui14 = require("@elementor/editor-ui");
var import_icons15 = require("@elementor/icons");
var import_ui24 = require("@elementor/ui");
var import_i18n23 = require("@wordpress/i18n");

// src/extended/store/actions/archive-component.ts
var import_editor_documents9 = require("@elementor/editor-documents");
var import_editor_notifications = require("@elementor/editor-notifications");
var import_store44 = require("@elementor/store");
var import_i18n20 = require("@wordpress/i18n");
var successNotification = (componentId, componentName) => ({
  type: "success",
  /* translators: %s: component name */
  message: (0, import_i18n20.__)("Successfully deleted component %s", "elementor").replace("%s", componentName),
  id: `success-archived-components-notification-${componentId}`
});
var archiveComponent = (componentId, componentName) => {
  (0, import_store44.__dispatch)(slice.actions.archive(componentId));
  (0, import_editor_documents9.setDocumentModifiedStatus)(true);
  (0, import_editor_notifications.notify)(successNotification(componentId, componentName));
};

// src/extended/store/actions/rename-component.ts
var import_editor_documents10 = require("@elementor/editor-documents");
var import_editor_elements8 = require("@elementor/editor-elements");
var import_store46 = require("@elementor/store");
var TITLE_EXTERNAL_CHANGE_COMMAND = "title_external_change";
var renameComponent = (componentUid, newName) => {
  (0, import_store46.__dispatch)(slice.actions.rename({ componentUid, name: newName }));
  (0, import_editor_documents10.setDocumentModifiedStatus)(true);
  refreshComponentInstanceTitles(componentUid);
};
function refreshComponentInstanceTitles(componentUid) {
  const documentContainer = getDocumentContainer();
  if (!documentContainer) {
    return;
  }
  const componentInstances = findComponentInstancesByUid(documentContainer, componentUid);
  componentInstances.forEach((element) => {
    element.model.trigger?.(TITLE_EXTERNAL_CHANGE_COMMAND);
  });
}
function getDocumentContainer() {
  const documentsManager = (0, import_editor_documents10.getV1DocumentsManager)();
  return documentsManager?.getCurrent()?.container;
}
function findComponentInstancesByUid(documentContainer, componentUid) {
  const allDescendants = (0, import_editor_elements8.getAllDescendants)(documentContainer);
  return allDescendants.filter((element) => {
    const widgetType = element.model.get("widgetType");
    const editorSettings = element.model.get("editor_settings");
    const isMatch = widgetType === COMPONENT_WIDGET_TYPE && editorSettings?.component_uid === componentUid;
    return isMatch;
  });
}

// src/extended/utils/component-name-validation.ts
var import_store48 = require("@elementor/store");

// src/extended/utils/component-form-schema.ts
var import_schema5 = require("@elementor/schema");
var import_i18n21 = require("@wordpress/i18n");
var MIN_NAME_LENGTH = 2;
var MAX_NAME_LENGTH = 50;
var baseComponentSchema = import_schema5.z.string().trim().max(MAX_NAME_LENGTH, (0, import_i18n21.__)("Component name is too long. Please keep it under 50 characters.", "elementor"));
var createBaseComponentSchema = (existingNames) => {
  return import_schema5.z.object({
    componentName: baseComponentSchema.refine((value) => !existingNames.includes(value), {
      message: (0, import_i18n21.__)("Component name already exists", "elementor")
    })
  });
};
var createSubmitComponentSchema = (existingNames) => {
  const baseSchema = createBaseComponentSchema(existingNames);
  return baseSchema.extend({
    componentName: baseSchema.shape.componentName.refine((value) => value.length > 0, {
      message: (0, import_i18n21.__)("Component name is required.", "elementor")
    }).refine((value) => value.length >= MIN_NAME_LENGTH, {
      message: (0, import_i18n21.__)("Component name is too short. Please enter at least 2 characters.", "elementor")
    })
  });
};

// src/extended/utils/component-name-validation.ts
function validateComponentName(label) {
  const existingComponentTitles = selectComponents((0, import_store48.__getState)())?.map(({ name }) => name) ?? [];
  const schema = createSubmitComponentSchema(existingComponentTitles);
  const result = schema.safeParse({ componentName: label.toLowerCase() });
  if (result.success) {
    return {
      isValid: true,
      errorMessage: null
    };
  }
  const formattedErrors = result.error.format();
  const errorMessage = formattedErrors.componentName?._errors[0] ?? formattedErrors._errors[0];
  return {
    isValid: false,
    errorMessage
  };
}

// src/extended/utils/create-component-model.ts
var createComponentModel2 = (component) => {
  return {
    elType: "widget",
    widgetType: "e-component",
    settings: {
      component_instance: {
        $$type: "component-instance",
        value: {
          component_id: {
            $$type: "number",
            value: component.id ?? component.uid
          }
        }
      }
    },
    editor_settings: {
      component_uid: component.uid
    }
  };
};

// src/extended/utils/get-container-for-new-element.ts
var import_editor_elements9 = require("@elementor/editor-elements");
var getContainerForNewElement = () => {
  const currentDocumentContainer = (0, import_editor_elements9.getCurrentDocumentContainer)();
  const selectedElement = getSelectedElementContainer();
  let container, options;
  if (selectedElement) {
    switch (selectedElement.model.get("elType")) {
      case "widget": {
        container = selectedElement?.parent;
        const selectedElIndex = selectedElement.view?._index ?? -1;
        if (selectedElIndex > -1) {
          options = { at: selectedElIndex + 1 };
        }
        break;
      }
      case "section": {
        container = selectedElement?.children?.[0];
        break;
      }
      default: {
        container = selectedElement;
        break;
      }
    }
  }
  return { container: container ?? currentDocumentContainer, options };
};
function getSelectedElementContainer() {
  const selectedElements = (0, import_editor_elements9.getSelectedElements)();
  if (selectedElements.length !== 1) {
    return void 0;
  }
  return (0, import_editor_elements9.getContainer)(selectedElements[0].id);
}

// src/extended/components/components-tab/delete-confirmation-dialog.tsx
var React28 = __toESM(require("react"));
var import_editor_ui13 = require("@elementor/editor-ui");
var import_i18n22 = require("@wordpress/i18n");
function DeleteConfirmationDialog({ open, onClose, onConfirm }) {
  return /* @__PURE__ */ React28.createElement(import_editor_ui13.ConfirmationDialog, { open, onClose }, /* @__PURE__ */ React28.createElement(import_editor_ui13.ConfirmationDialog.Title, null, (0, import_i18n22.__)("Delete this component?", "elementor")), /* @__PURE__ */ React28.createElement(import_editor_ui13.ConfirmationDialog.Content, null, /* @__PURE__ */ React28.createElement(import_editor_ui13.ConfirmationDialog.ContentText, null, (0, import_i18n22.__)(
    "Existing instances on your pages will remain functional. You will no longer find this component in your list.",
    "elementor"
  ))), /* @__PURE__ */ React28.createElement(import_editor_ui13.ConfirmationDialog.Actions, { onClose, onConfirm }));
}

// src/extended/components/components-tab/component-item.tsx
function ComponentItem2({ component }) {
  const itemRef = (0, import_react13.useRef)(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = (0, import_react13.useState)(false);
  const { canRename, canDelete } = useComponentsPermissions();
  const shouldShowActions = canRename || canDelete;
  const {
    ref: editableRef,
    isEditing,
    openEditMode,
    error,
    getProps: getEditableProps
  } = (0, import_editor_ui14.useEditable)({
    value: component.name,
    onSubmit: (newName) => renameComponent(component.uid, newName),
    validation: validateComponentTitle
  });
  const componentModel = createComponentModel2(component);
  const popupState = (0, import_ui24.usePopupState)({
    variant: "popover",
    disableAutoFocus: true
  });
  const handleClick = () => {
    addComponentToPage(componentModel);
  };
  const handleDragEnd = () => {
    loadComponentsAssets([componentModel]);
    (0, import_editor_canvas5.endDragElementFromPanel)();
  };
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    popupState.close();
  };
  const handleDeleteConfirm = () => {
    if (!component.id) {
      throw new Error("Component ID is required");
    }
    setIsDeleteDialogOpen(false);
    archiveComponent(component.id, component.name);
  };
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };
  return /* @__PURE__ */ React29.createElement(import_ui24.Stack, null, /* @__PURE__ */ React29.createElement(
    import_editor_ui14.WarningInfotip,
    {
      open: Boolean(error),
      text: error ?? "",
      placement: "bottom",
      width: itemRef.current?.getBoundingClientRect().width,
      offset: [0, -15]
    },
    /* @__PURE__ */ React29.createElement(
      ComponentItem,
      {
        ref: itemRef,
        component,
        disabled: false,
        draggable: true,
        onDragStart: (event) => (0, import_editor_canvas5.startDragElementFromPanel)(componentModel, event),
        onDragEnd: handleDragEnd,
        onClick: handleClick,
        isEditing,
        error,
        nameSlot: /* @__PURE__ */ React29.createElement(
          ComponentName,
          {
            name: component.name,
            editable: { ref: editableRef, isEditing, getProps: getEditableProps }
          }
        ),
        endSlot: shouldShowActions ? /* @__PURE__ */ React29.createElement(import_ui24.IconButton, { size: "tiny", ...(0, import_ui24.bindTrigger)(popupState), "aria-label": "More actions" }, /* @__PURE__ */ React29.createElement(import_icons15.DotsVerticalIcon, { fontSize: "tiny" })) : void 0
      }
    )
  ), shouldShowActions && /* @__PURE__ */ React29.createElement(
    import_ui24.Menu,
    {
      ...(0, import_ui24.bindMenu)(popupState),
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right"
      }
    },
    canRename && /* @__PURE__ */ React29.createElement(
      import_editor_ui14.MenuListItem,
      {
        sx: { minWidth: "160px" },
        primaryTypographyProps: { variant: "caption", color: "text.primary" },
        onClick: () => {
          popupState.close();
          openEditMode();
        }
      },
      (0, import_i18n23.__)("Rename", "elementor")
    ),
    canDelete && /* @__PURE__ */ React29.createElement(
      import_editor_ui14.MenuListItem,
      {
        sx: { minWidth: "160px" },
        primaryTypographyProps: { variant: "caption", color: "error.light" },
        onClick: handleDeleteClick
      },
      (0, import_i18n23.__)("Delete", "elementor")
    )
  ), /* @__PURE__ */ React29.createElement(
    DeleteConfirmationDialog,
    {
      open: isDeleteDialogOpen,
      onClose: handleDeleteDialogClose,
      onConfirm: handleDeleteConfirm
    }
  ));
}
var addComponentToPage = (model) => {
  const { container, options } = getContainerForNewElement();
  if (!container) {
    throw new Error(`Can't find container to drop new component instance at`);
  }
  loadComponentsAssets([model]);
  (0, import_editor_elements10.dropElement)({
    containerId: container.id,
    model,
    options: { ...options, useHistory: false, scrollIntoView: true }
  });
};
var validateComponentTitle = (newTitle) => {
  const result = validateComponentName(newTitle);
  if (!result.errorMessage) {
    return null;
  }
  return result.errorMessage;
};

// src/extended/components/components-tab/components.tsx
var ExtendedComponentsList = () => {
  const { components, isLoading, searchValue } = useFilteredComponents();
  if (isLoading) {
    return /* @__PURE__ */ React30.createElement(LoadingComponents, null);
  }
  const isEmpty = !components?.length;
  if (isEmpty) {
    return searchValue.length ? /* @__PURE__ */ React30.createElement(EmptySearchResult, null) : /* @__PURE__ */ React30.createElement(EmptyState, null);
  }
  return /* @__PURE__ */ React30.createElement(import_ui25.List, { sx: { display: "flex", flexDirection: "column", gap: 1, px: 2 } }, components.map((component) => /* @__PURE__ */ React30.createElement(ComponentItem2, { key: component.uid, component })));
};
var ExtendedComponentsContent = () => {
  const { components, isLoading } = useComponents();
  const hasComponents = !isLoading && components.length > 0;
  return /* @__PURE__ */ React30.createElement(React30.Fragment, null, hasComponents && /* @__PURE__ */ React30.createElement(ComponentSearch, null), /* @__PURE__ */ React30.createElement(ExtendedComponentsList, null));
};
var ExtendedComponents = () => {
  return /* @__PURE__ */ React30.createElement(import_editor_ui15.ThemeProvider, null, /* @__PURE__ */ React30.createElement(SearchProvider, { localStorageKey: "elementor-components-search" }, /* @__PURE__ */ React30.createElement(ExtendedComponentsContent, null)));
};

// src/extended/components/create-component-form/create-component-form.tsx
var React31 = __toESM(require("react"));
var import_react15 = require("react");
var import_editor_elements14 = require("@elementor/editor-elements");
var import_editor_notifications3 = require("@elementor/editor-notifications");
var import_editor_ui16 = require("@elementor/editor-ui");
var import_icons16 = require("@elementor/icons");
var import_store54 = require("@elementor/store");
var import_ui26 = require("@elementor/ui");
var import_i18n26 = require("@wordpress/i18n");

// src/extended/store/actions/create-unpublished-component.ts
var import_editor_elements12 = require("@elementor/editor-elements");
var import_editor_v1_adapters3 = require("@elementor/editor-v1-adapters");
var import_store50 = require("@elementor/store");
var import_utils7 = require("@elementor/utils");
var import_i18n24 = require("@wordpress/i18n");

// src/extended/utils/replace-element-with-component.ts
var import_editor_elements11 = require("@elementor/editor-elements");
var replaceElementWithComponent = async (element, component) => {
  return await (0, import_editor_elements11.replaceElement)({
    currentElement: element,
    newElement: createComponentModel2(component),
    withHistory: false
  });
};

// src/extended/store/actions/create-unpublished-component.ts
async function createUnpublishedComponent({
  name,
  element,
  eventData,
  uid,
  overridableProps,
  source
}) {
  const generatedUid = uid ?? (0, import_utils7.generateUniqueId)("component");
  const componentBase = { uid: generatedUid, name };
  const elementDataWithOverridablesReverted = revertAllOverridablesInElementData(element);
  const container = (0, import_editor_elements12.getContainer)(element.id);
  const modelFromContainer = container?.model?.toJSON?.();
  const originalElement = {
    model: modelFromContainer ?? element,
    parentId: container?.parent?.id ?? "",
    index: container?.view?._index ?? 0
  };
  (0, import_store50.__dispatch)(
    slice.actions.addUnpublished({
      ...componentBase,
      elements: [elementDataWithOverridablesReverted],
      overridableProps
    })
  );
  (0, import_store50.__dispatch)(slice.actions.addCreatedThisSession(generatedUid));
  const componentInstance = await replaceElementWithComponent(element, componentBase);
  trackComponentEvent({
    action: "created",
    source,
    component_uid: generatedUid,
    component_name: name,
    ...eventData
  });
  try {
    await (0, import_editor_v1_adapters3.__privateRunCommand)("document/save/auto");
  } catch (error) {
    restoreOriginalElement(originalElement, componentInstance.id);
    (0, import_store50.__dispatch)(slice.actions.removeUnpublished(generatedUid));
    (0, import_store50.__dispatch)(slice.actions.removeCreatedThisSession(generatedUid));
    throw error;
  }
  return { uid: generatedUid, instanceId: componentInstance.id };
}
function restoreOriginalElement(originalElement, componentInstanceId) {
  const componentContainer = (0, import_editor_elements12.getContainer)(componentInstanceId);
  if (componentContainer) {
    (0, import_editor_elements12.deleteElement)({ container: componentContainer, options: { useHistory: false } });
  }
  const parentContainer = (0, import_editor_elements12.getContainer)(originalElement.parentId);
  if (!parentContainer) {
    return;
  }
  const clonedModel = structuredClone(originalElement.model);
  (0, import_editor_elements12.createElements)({
    title: (0, import_i18n24.__)("Restore Element", "elementor"),
    elements: [
      {
        container: parentContainer,
        model: clonedModel,
        options: { at: originalElement.index }
      }
    ]
  });
}

// src/extended/sync/prevent-non-atomic-nesting.ts
var import_editor_canvas6 = require("@elementor/editor-canvas");
var import_editor_elements13 = require("@elementor/editor-elements");
var import_editor_notifications2 = require("@elementor/editor-notifications");
var import_editor_v1_adapters4 = require("@elementor/editor-v1-adapters");
var import_i18n25 = require("@wordpress/i18n");

// src/extended/utils/is-editing-component.ts
var import_store52 = require("@elementor/store");
function isEditingComponent() {
  const state = (0, import_store52.__getStore)()?.getState();
  if (!state) {
    return false;
  }
  return selectCurrentComponentId(state) !== null;
}

// src/extended/sync/prevent-non-atomic-nesting.ts
var NON_ATOMIC_ELEMENT_ALERT = {
  type: "default",
  message: (0, import_i18n25.__)("This widget isn't compatible with components. Use atomic elements instead.", "elementor"),
  id: "non-atomic-element-blocked"
};
function initNonAtomicNestingPrevention() {
  (0, import_editor_v1_adapters4.blockCommand)({
    command: "document/elements/create",
    condition: blockNonAtomicCreate
  });
  (0, import_editor_v1_adapters4.blockCommand)({
    command: "document/elements/move",
    condition: blockNonAtomicMove
  });
  (0, import_editor_v1_adapters4.blockCommand)({
    command: "document/elements/paste",
    condition: blockNonAtomicPaste
  });
}
function isElementAtomic(elementType) {
  return (0, import_editor_elements13.getElementType)(elementType) !== null;
}
function blockNonAtomicCreate(args) {
  if (!isEditingComponent()) {
    return false;
  }
  const { model } = args;
  const elementType = model?.widgetType || model?.elType;
  if (!elementType) {
    return false;
  }
  if (isElementAtomic(elementType)) {
    return false;
  }
  (0, import_editor_notifications2.notify)(NON_ATOMIC_ELEMENT_ALERT);
  return true;
}
function blockNonAtomicMove(args) {
  if (!isEditingComponent()) {
    return false;
  }
  const { containers = [args.container] } = args;
  const hasNonAtomicElement = containers.some((container) => {
    if (!container) {
      return false;
    }
    const allElements = (0, import_editor_elements13.getAllDescendants)(container);
    return allElements.some((element) => !(0, import_editor_canvas6.isAtomicWidget)(element));
  });
  if (hasNonAtomicElement) {
    (0, import_editor_notifications2.notify)(NON_ATOMIC_ELEMENT_ALERT);
  }
  return hasNonAtomicElement;
}
function blockNonAtomicPaste(args) {
  if (!isEditingComponent()) {
    return false;
  }
  const { storageType } = args;
  if (storageType !== "localstorage") {
    return false;
  }
  const data = window?.elementorCommon?.storage?.get();
  if (!data?.clipboard?.elements) {
    return false;
  }
  const hasNonAtomicElement = hasNonAtomicElementsInTree(data.clipboard.elements);
  if (hasNonAtomicElement) {
    (0, import_editor_notifications2.notify)(NON_ATOMIC_ELEMENT_ALERT);
  }
  return hasNonAtomicElement;
}
function hasNonAtomicElementsInTree(elements) {
  for (const element of elements) {
    const elementType = element.widgetType || element.elType;
    if (elementType && !isElementAtomic(elementType)) {
      return true;
    }
    if (element.elements?.length) {
      if (hasNonAtomicElementsInTree(element.elements)) {
        return true;
      }
    }
  }
  return false;
}
function findNonAtomicElementsInElement(element) {
  const nonAtomicElements = [];
  const elementType = element.widgetType || element.elType;
  if (elementType && !isElementAtomic(elementType)) {
    nonAtomicElements.push(elementType);
  }
  if (element.elements?.length) {
    for (const child of element.elements) {
      nonAtomicElements.push(...findNonAtomicElementsInElement(child));
    }
  }
  return [...new Set(nonAtomicElements)];
}

// src/extended/components/create-component-form/hooks/use-form.ts
var import_react14 = require("react");
var useForm = (initialValues) => {
  const [values, setValues] = (0, import_react14.useState)(initialValues);
  const [errors, setErrors] = (0, import_react14.useState)({});
  const isValid = (0, import_react14.useMemo)(() => {
    return !Object.values(errors).some((error) => error);
  }, [errors]);
  const handleChange = (e, field, validationSchema) => {
    const updated = { ...values, [field]: e.target.value };
    setValues(updated);
    const { success, errors: validationErrors } = validateForm(updated, validationSchema);
    if (!success) {
      setErrors(validationErrors);
    } else {
      setErrors({});
    }
  };
  const validate = (validationSchema) => {
    const { success, errors: validationErrors, parsedValues } = validateForm(values, validationSchema);
    if (!success) {
      setErrors(validationErrors);
      return { success };
    }
    setErrors({});
    return { success, parsedValues };
  };
  return {
    values,
    errors,
    isValid,
    handleChange,
    validateForm: validate
  };
};
var validateForm = (values, schema) => {
  const result = schema.safeParse(values);
  if (result.success) {
    return { success: true, parsedValues: result.data };
  }
  const errors = {};
  Object.entries(result.error.formErrors.fieldErrors).forEach(
    ([field, error]) => {
      errors[field] = error[0];
    }
  );
  return { success: false, errors };
};

// src/extended/components/create-component-form/utils/get-component-event-data.ts
var getComponentEventData = (containerElement, options) => {
  const { elementsCount, componentsCount } = countNestedElements(containerElement);
  return {
    nested_elements_count: elementsCount,
    nested_components_count: componentsCount,
    top_element_type: containerElement.elType,
    location: options?.location,
    secondary_location: options?.secondaryLocation,
    trigger: options?.trigger
  };
};
function countNestedElements(container) {
  if (!container.elements || container.elements.length === 0) {
    return { elementsCount: 0, componentsCount: 0 };
  }
  let elementsCount = container.elements.length;
  let componentsCount = 0;
  for (const element of container.elements) {
    if (element.widgetType === "e-component") {
      componentsCount++;
    }
    const { elementsCount: nestedElementsCount, componentsCount: nestedComponentsCount } = countNestedElements(element);
    elementsCount += nestedElementsCount;
    componentsCount += nestedComponentsCount;
  }
  return { elementsCount, componentsCount };
}

// src/extended/components/create-component-form/create-component-form.tsx
var MAX_COMPONENTS = 100;
function CreateComponentForm() {
  const [element, setElement] = (0, import_react15.useState)(null);
  const [anchorPosition, setAnchorPosition] = (0, import_react15.useState)();
  const { components } = useComponents();
  const eventData = (0, import_react15.useRef)(null);
  (0, import_react15.useEffect)(() => {
    const OPEN_SAVE_AS_COMPONENT_FORM_EVENT = "elementor/editor/open-save-as-component-form";
    const openPopup = (event) => {
      const { shouldOpen, notification } = shouldOpenForm(event.detail.element, components?.length ?? 0);
      if (!shouldOpen) {
        (0, import_editor_notifications3.notify)(notification);
        return;
      }
      setElement({ element: event.detail.element, elementLabel: (0, import_editor_elements14.getElementLabel)(event.detail.element.id) });
      setAnchorPosition(event.detail.anchorPosition);
      eventData.current = getComponentEventData(event.detail.element, event.detail.options);
      trackComponentEvent({
        action: "createClicked",
        source: "user",
        ...eventData.current
      });
    };
    window.addEventListener(OPEN_SAVE_AS_COMPONENT_FORM_EVENT, openPopup);
    return () => {
      window.removeEventListener(OPEN_SAVE_AS_COMPONENT_FORM_EVENT, openPopup);
    };
  }, [components?.length]);
  const handleSave = async (values) => {
    try {
      if (!element) {
        throw new Error(`Can't save element as component: element not found`);
      }
      const { uid, instanceId } = await createUnpublishedComponent({
        name: values.componentName,
        element: element.element,
        eventData: eventData.current,
        source: "user"
      });
      const publishedComponentId = selectComponentByUid((0, import_store54.__getState)(), uid)?.id;
      if (publishedComponentId) {
        switchToComponent(publishedComponentId, instanceId);
      } else {
        throw new Error("Failed to find published component");
      }
      (0, import_editor_notifications3.notify)({
        type: "success",
        message: (0, import_i18n26.__)("Component created successfully.", "elementor"),
        id: `component-saved-successfully-${uid}`
      });
      resetAndClosePopup();
    } catch {
      const errorMessage = (0, import_i18n26.__)("Failed to create component. Please try again.", "elementor");
      (0, import_editor_notifications3.notify)({
        type: "error",
        message: errorMessage,
        id: "component-save-failed"
      });
      resetAndClosePopup();
    }
  };
  const resetAndClosePopup = () => {
    setElement(null);
    setAnchorPosition(void 0);
  };
  const cancelSave = () => {
    resetAndClosePopup();
    trackComponentEvent({
      action: "createCancelled",
      source: "user",
      ...eventData.current
    });
  };
  return /* @__PURE__ */ React31.createElement(import_editor_ui16.ThemeProvider, null, /* @__PURE__ */ React31.createElement(
    import_ui26.Popover,
    {
      open: element !== null,
      onClose: cancelSave,
      anchorReference: "anchorPosition",
      anchorPosition,
      "data-testid": "create-component-form"
    },
    element !== null && /* @__PURE__ */ React31.createElement(
      Form2,
      {
        initialValues: { componentName: element.elementLabel },
        handleSave,
        closePopup: cancelSave
      }
    )
  ));
}
function shouldOpenForm(element, componentsCount) {
  const nonAtomicElements = findNonAtomicElementsInElement(element);
  if (nonAtomicElements.length > 0) {
    return {
      shouldOpen: false,
      notification: {
        type: "default",
        message: (0, import_i18n26.__)(
          "Components require atomic elements only. Remove widgets to create this component.",
          "elementor"
        ),
        id: "non-atomic-element-save-blocked"
      }
    };
  }
  if (componentsCount >= MAX_COMPONENTS) {
    return {
      shouldOpen: false,
      notification: {
        type: "default",
        /* translators: %s is the maximum number of components */
        message: (0, import_i18n26.__)(
          `You've reached the limit of %s components. Please remove an existing one to create a new component.`,
          "elementor"
        ).replace("%s", MAX_COMPONENTS.toString()),
        id: "maximum-number-of-components-exceeded"
      }
    };
  }
  return { shouldOpen: true, notification: null };
}
var FONT_SIZE = "tiny";
var Form2 = ({
  initialValues,
  handleSave,
  closePopup
}) => {
  const { values, errors, isValid, handleChange, validateForm: validateForm2 } = useForm(initialValues);
  const nameInputRef = (0, import_editor_ui16.useTextFieldAutoSelect)();
  const { components } = useComponents();
  const existingComponentNames = (0, import_react15.useMemo)(() => {
    return components?.map((component) => component.name) ?? [];
  }, [components]);
  const changeValidationSchema = (0, import_react15.useMemo)(
    () => createBaseComponentSchema(existingComponentNames),
    [existingComponentNames]
  );
  const submitValidationSchema = (0, import_react15.useMemo)(
    () => createSubmitComponentSchema(existingComponentNames),
    [existingComponentNames]
  );
  const handleSubmit = () => {
    const { success, parsedValues } = validateForm2(submitValidationSchema);
    if (success) {
      handleSave(parsedValues);
    }
  };
  const texts = {
    heading: (0, import_i18n26.__)("Create component", "elementor"),
    name: (0, import_i18n26.__)("Name", "elementor"),
    cancel: (0, import_i18n26.__)("Cancel", "elementor"),
    create: (0, import_i18n26.__)("Create", "elementor")
  };
  const nameInputId = "component-name";
  return /* @__PURE__ */ React31.createElement(import_editor_ui16.Form, { onSubmit: handleSubmit }, /* @__PURE__ */ React31.createElement(import_ui26.Stack, { alignItems: "start", width: "268px" }, /* @__PURE__ */ React31.createElement(
    import_ui26.Stack,
    {
      direction: "row",
      alignItems: "center",
      py: 1,
      px: 1.5,
      sx: { columnGap: 0.5, borderBottom: "1px solid", borderColor: "divider", width: "100%" }
    },
    /* @__PURE__ */ React31.createElement(import_icons16.ComponentsIcon, { fontSize: FONT_SIZE }),
    /* @__PURE__ */ React31.createElement(import_ui26.Typography, { variant: "caption", sx: { color: "text.primary", fontWeight: "500", lineHeight: 1 } }, texts.heading)
  ), /* @__PURE__ */ React31.createElement(import_ui26.Grid, { container: true, gap: 0.75, alignItems: "start", p: 1.5 }, /* @__PURE__ */ React31.createElement(import_ui26.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React31.createElement(import_ui26.FormLabel, { htmlFor: nameInputId, size: "tiny" }, texts.name)), /* @__PURE__ */ React31.createElement(import_ui26.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React31.createElement(
    import_ui26.TextField,
    {
      id: nameInputId,
      size: FONT_SIZE,
      fullWidth: true,
      value: values.componentName,
      onChange: (e) => handleChange(e, "componentName", changeValidationSchema),
      inputProps: { style: { color: "text.primary", fontWeight: "600" } },
      error: Boolean(errors.componentName),
      helperText: errors.componentName,
      inputRef: nameInputRef
    }
  ))), /* @__PURE__ */ React31.createElement(import_ui26.Stack, { direction: "row", justifyContent: "flex-end", alignSelf: "end", py: 1, px: 1.5 }, /* @__PURE__ */ React31.createElement(import_ui26.Button, { onClick: closePopup, color: "secondary", variant: "text", size: "small" }, texts.cancel), /* @__PURE__ */ React31.createElement(import_ui26.Button, { type: "submit", disabled: !isValid, variant: "contained", color: "primary", size: "small" }, texts.create))));
};

// src/extended/components/edit-component/edit-component.tsx
var React33 = __toESM(require("react"));
var import_react18 = require("react");
var import_editor_documents11 = require("@elementor/editor-documents");
var import_editor_v1_adapters6 = require("@elementor/editor-v1-adapters");
var import_store60 = require("@elementor/store");
var import_utils9 = require("@elementor/utils");

// src/extended/consts.ts
var OVERRIDABLE_PROP_REPLACEMENT_ID = "overridable-prop";
var COMPONENT_DOCUMENT_TYPE = "elementor_component";

// src/extended/store/actions/reset-sanitized-components.ts
var import_store56 = require("@elementor/store");
function resetSanitizedComponents() {
  (0, import_store56.__dispatch)(slice.actions.resetSanitizedComponents());
}

// src/extended/store/actions/update-current-component.ts
var import_store58 = require("@elementor/store");
function updateCurrentComponent({
  path,
  currentComponentId
}) {
  const dispatch21 = (0, import_store58.__getStore)()?.dispatch;
  if (!dispatch21) {
    return;
  }
  dispatch21(slice.actions.setPath(path));
  dispatch21(slice.actions.setCurrentComponentId(currentComponentId));
}

// src/extended/components/edit-component/component-modal.tsx
var React32 = __toESM(require("react"));
var import_react17 = require("react");
var import_react_dom = require("react-dom");
var import_i18n27 = require("@wordpress/i18n");

// src/extended/components/edit-component/use-canvas-document.ts
var import_editor_v1_adapters5 = require("@elementor/editor-v1-adapters");
function useCanvasDocument() {
  return (0, import_editor_v1_adapters5.__privateUseListenTo)((0, import_editor_v1_adapters5.commandEndEvent)("editor/documents/attach-preview"), () => (0, import_editor_v1_adapters5.getCanvasIframeDocument)());
}

// src/extended/components/edit-component/use-element-rect.ts
var import_react16 = require("react");
var import_utils8 = require("@elementor/utils");
function useElementRect(element) {
  const [rect, setRect] = (0, import_react16.useState)(new DOMRect(0, 0, 0, 0));
  const onChange = (0, import_utils8.throttle)(
    () => {
      setRect(element?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0));
    },
    20,
    true
  );
  useScrollListener({ element, onChange });
  useResizeListener({ element, onChange });
  useMutationsListener({ element, onChange });
  (0, import_react16.useEffect)(
    () => () => {
      onChange.cancel();
    },
    [onChange]
  );
  return rect;
}
function useScrollListener({ element, onChange }) {
  (0, import_react16.useEffect)(() => {
    if (!element) {
      return;
    }
    const win = element.ownerDocument?.defaultView;
    win?.addEventListener("scroll", onChange, { passive: true });
    return () => {
      win?.removeEventListener("scroll", onChange);
    };
  }, [element, onChange]);
}
function useResizeListener({ element, onChange }) {
  (0, import_react16.useEffect)(() => {
    if (!element) {
      return;
    }
    const resizeObserver = new ResizeObserver(onChange);
    resizeObserver.observe(element);
    const win = element.ownerDocument?.defaultView;
    win?.addEventListener("resize", onChange, { passive: true });
    return () => {
      resizeObserver.disconnect();
      win?.removeEventListener("resize", onChange);
    };
  }, [element, onChange]);
}
function useMutationsListener({ element, onChange }) {
  (0, import_react16.useEffect)(() => {
    if (!element) {
      return;
    }
    const mutationObserver = new MutationObserver(onChange);
    mutationObserver.observe(element, { childList: true, subtree: true });
    return () => {
      mutationObserver.disconnect();
    };
  }, [element, onChange]);
}

// src/extended/components/edit-component/component-modal.tsx
function ComponentModal({ topLevelElementDom, onClose }) {
  const canvasDocument = useCanvasDocument();
  (0, import_react17.useEffect)(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    canvasDocument?.body.addEventListener("keydown", handleEsc);
    return () => {
      canvasDocument?.body.removeEventListener("keydown", handleEsc);
    };
  }, [canvasDocument, onClose]);
  if (!canvasDocument?.body) {
    return null;
  }
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ React32.createElement(React32.Fragment, null, /* @__PURE__ */ React32.createElement(BlockEditPage, null), /* @__PURE__ */ React32.createElement(Backdrop, { canvas: canvasDocument, element: topLevelElementDom, onClose })),
    canvasDocument.body
  );
}
function Backdrop({
  canvas,
  element,
  onClose
}) {
  const rect = useElementRect(element);
  const clipPath = element ? getRectPath(rect, canvas.defaultView) : void 0;
  const backdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
    pointerEvents: "painted",
    cursor: "pointer",
    clipPath
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClose();
    }
  };
  return /* @__PURE__ */ React32.createElement(
    "div",
    {
      style: backdropStyle,
      onClick: onClose,
      onKeyDown: handleKeyDown,
      role: "button",
      tabIndex: 0,
      "aria-label": (0, import_i18n27.__)("Exit component editing mode", "elementor")
    }
  );
}
function getRectPath(rect, viewport) {
  const { x, y, width, height } = rect;
  const { innerWidth: vw, innerHeight: vh } = viewport;
  const path = `path(evenodd, 'M 0 0 
		L ${vw} 0
		L ${vw} ${vh}
		L 0 ${vh}
		Z
		M ${x} ${y}
		L ${x + width} ${y}
		L ${x + width} ${y + height}
		L ${x} ${y + height}
		L ${x} ${y}
    	Z'
	)`;
  return path.replace(/\s{2,}/g, " ");
}
function BlockEditPage() {
  const blockV3DocumentHandlesStyles = `
	.elementor-editor-active {
		& .elementor-section-wrap.ui-sortable {
			display: contents;
		}

		& *[data-editable-elementor-document]:not(.elementor-edit-mode):hover {
			& .elementor-document-handle:not(.elementor-document-save-back-handle) {
				display: none;

				&::before,
				& .elementor-document-handle__inner {
					display: none;
				}
			}
		}
	}
	`;
  return /* @__PURE__ */ React32.createElement("style", { "data-e-style-id": "e-block-v3-document-handles-styles" }, blockV3DocumentHandlesStyles);
}

// src/extended/components/edit-component/edit-component.tsx
function EditComponent() {
  const currentComponentId = useCurrentComponentId();
  useHandleDocumentSwitches();
  const navigateBack = useNavigateBack();
  const onClose = (0, import_utils9.throttle)(navigateBack, 100);
  const topLevelElementDom = useComponentDOMElement(currentComponentId ?? void 0);
  if (!currentComponentId) {
    return null;
  }
  return /* @__PURE__ */ React33.createElement(ComponentModal, { topLevelElementDom, onClose });
}
function useHandleDocumentSwitches() {
  const documentsManager = (0, import_editor_documents11.getV1DocumentsManager)();
  const currentComponentId = useCurrentComponentId();
  const path = (0, import_store60.__useSelector)(selectPath);
  (0, import_react18.useEffect)(() => {
    return (0, import_editor_v1_adapters6.__privateListenTo)((0, import_editor_v1_adapters6.commandEndEvent)("editor/documents/open"), () => {
      const nextDocument = documentsManager.getCurrent();
      if (nextDocument.id === currentComponentId) {
        return;
      }
      if (currentComponentId) {
        apiClient.unlockComponent(currentComponentId);
      }
      resetSanitizedComponents();
      const isComponent2 = nextDocument.config.type === COMPONENT_DOCUMENT_TYPE;
      if (!isComponent2) {
        updateCurrentComponent({ path: [], currentComponentId: null });
        return;
      }
      updateCurrentComponent({
        path: getUpdatedComponentPath(path, nextDocument),
        currentComponentId: nextDocument.id
      });
    });
  }, [path, documentsManager, currentComponentId]);
}
function getUpdatedComponentPath(path, nextDocument) {
  const componentIndex = path.findIndex(({ componentId }) => componentId === nextDocument.id);
  if (componentIndex >= 0) {
    return path.slice(0, componentIndex + 1);
  }
  const instanceId = nextDocument?.container.view?.el?.dataset.id;
  const instanceTitle = getInstanceTitle(instanceId, path);
  return [
    ...path,
    {
      instanceId,
      instanceTitle,
      componentId: nextDocument.id
    }
  ];
}
function getInstanceTitle(instanceId, path) {
  if (!instanceId) {
    return void 0;
  }
  const documentsManager = (0, import_editor_documents11.getV1DocumentsManager)();
  const parentDocId = path.at(-1)?.componentId ?? documentsManager.getInitialId();
  const parentDoc = documentsManager.get(parentDocId);
  const parentContainer = parentDoc?.container;
  const widget = parentContainer?.children?.findRecursive?.(
    (container) => container.id === instanceId
  );
  const editorSettings = widget?.model?.get?.("editor_settings");
  return editorSettings?.title;
}
function useComponentDOMElement(id2) {
  const { componentContainerDomElement, topLevelElementDom } = getComponentDOMElements(id2);
  const [currentElementDom, setCurrentElementDom] = (0, import_react18.useState)(topLevelElementDom);
  (0, import_react18.useEffect)(() => {
    setCurrentElementDom(topLevelElementDom);
  }, [topLevelElementDom]);
  (0, import_react18.useEffect)(() => {
    if (!componentContainerDomElement) {
      return;
    }
    const mutationObserver = new MutationObserver(() => {
      const newElementDom = componentContainerDomElement.children[0];
      setCurrentElementDom(newElementDom);
    });
    mutationObserver.observe(componentContainerDomElement, { childList: true });
    return () => {
      mutationObserver.disconnect();
    };
  }, [componentContainerDomElement]);
  return currentElementDom;
}
function getComponentDOMElements(id2) {
  if (!id2) {
    return { componentContainerDomElement: null, topLevelElementDom: null };
  }
  const documentsManager = (0, import_editor_documents11.getV1DocumentsManager)();
  const currentComponent = documentsManager.get(id2);
  const componentContainer = currentComponent?.container;
  const componentContainerDomElement = componentContainer?.view?.el?.children?.[0] ?? null;
  const topLevelElementDom = componentContainerDomElement?.children[0] ?? null;
  return { componentContainerDomElement, topLevelElementDom };
}

// src/extended/components/instance-editing-panel/instance-editing-panel.tsx
var React34 = __toESM(require("react"));
var import_icons17 = require("@elementor/icons");
var import_ui27 = require("@elementor/ui");
var import_i18n28 = require("@wordpress/i18n");
function ExtendedInstanceEditingPanel() {
  const { canEdit } = useComponentsPermissions();
  const data = useInstancePanelData();
  if (!data) {
    return null;
  }
  const { componentId, component, overrides, overridableProps, groups, isEmpty, componentInstanceId } = data;
  const panelTitle = (0, import_i18n28.__)("Edit %s", "elementor").replace("%s", component.name);
  const handleEditComponent = () => switchToComponent(componentId, componentInstanceId);
  return /* @__PURE__ */ React34.createElement(import_ui27.Box, { "data-testid": "instance-editing-panel" }, /* @__PURE__ */ React34.createElement(
    ComponentInstanceProvider,
    {
      componentId,
      overrides,
      overridableProps
    },
    /* @__PURE__ */ React34.createElement(
      InstancePanelHeader,
      {
        componentName: component.name,
        actions: canEdit ? /* @__PURE__ */ React34.createElement(
          EditComponentAction,
          {
            label: panelTitle,
            onClick: handleEditComponent,
            icon: import_icons17.PencilIcon
          }
        ) : void 0
      }
    ),
    /* @__PURE__ */ React34.createElement(
      InstancePanelBody,
      {
        groups,
        isEmpty,
        emptyState: /* @__PURE__ */ React34.createElement(EmptyState2, { onEditComponent: canEdit ? handleEditComponent : void 0 }),
        componentInstanceId
      }
    )
  ));
}

// src/extended/components/overridable-props/overridable-prop-control.tsx
var React35 = __toESM(require("react"));
var import_editor_controls5 = require("@elementor/editor-controls");
var import_editor_editing_panel6 = require("@elementor/editor-editing-panel");
function OverridablePropControl({
  OriginalControl: OriginalControl2,
  ...props
}) {
  const { elementType } = (0, import_editor_editing_panel6.useElement)();
  const { value, bind, setValue, placeholder, ...propContext } = (0, import_editor_controls5.useBoundProp)(componentOverridablePropTypeUtil);
  const componentId = useCurrentComponentId();
  const overridableProps = useOverridableProps(componentId);
  const filteredReplacements = (0, import_editor_controls5.getControlReplacements)().filter(
    (r) => !r.id || r.id !== OVERRIDABLE_PROP_REPLACEMENT_ID
  );
  if (!componentId) {
    return null;
  }
  if (!value?.override_key) {
    throw new Error("Override key is required");
  }
  const isComponentInstance2 = elementType.key === "e-component";
  const overridablePropData = overridableProps?.props?.[value.override_key];
  const setOverridableValue = (newValue) => {
    const propValue2 = {
      ...value,
      origin_value: newValue[bind]
    };
    setValue(propValue2);
    if (!isComponentInstance2) {
      updateOverridableProp(componentId, propValue2, overridablePropData?.originPropFields);
    }
  };
  const defaultPropType = elementType.propsSchema[bind];
  const overridePropType = overridablePropData ? getPropTypeForComponentOverride(overridablePropData) : void 0;
  const resolvedPropType = overridePropType ?? defaultPropType;
  if (!resolvedPropType) {
    return null;
  }
  const propType = (0, import_editor_editing_panel6.createTopLevelObjectType)({
    schema: {
      [bind]: resolvedPropType
    }
  });
  const propValue = isComponentInstance2 ? (value.origin_value?.value).override_value : value.origin_value;
  const objectPlaceholder = placeholder ? { [bind]: placeholder } : void 0;
  return /* @__PURE__ */ React35.createElement(OverridablePropProvider, { value }, /* @__PURE__ */ React35.createElement(
    import_editor_controls5.PropProvider,
    {
      ...propContext,
      propType,
      setValue: setOverridableValue,
      value: {
        [bind]: propValue
      },
      placeholder: objectPlaceholder
    },
    /* @__PURE__ */ React35.createElement(import_editor_controls5.PropKeyProvider, { bind }, /* @__PURE__ */ React35.createElement(import_editor_controls5.ControlReplacementsProvider, { replacements: filteredReplacements }, /* @__PURE__ */ React35.createElement(ControlWithReplacements, { OriginalControl: OriginalControl2, props })))
  ));
}
function ControlWithReplacements({
  OriginalControl: OriginalControl2,
  props
}) {
  const { ControlToRender, isReplaced } = (0, import_editor_controls5.useControlReplacement)(OriginalControl2);
  if (isReplaced) {
    const ReplacementControl = ControlToRender;
    return /* @__PURE__ */ React35.createElement(ReplacementControl, { ...props, OriginalControl: OriginalControl2 });
  }
  return /* @__PURE__ */ React35.createElement(OriginalControl2, { ...props });
}

// src/extended/components/overridable-props/overridable-prop-indicator.tsx
var React37 = __toESM(require("react"));
var import_editor_controls6 = require("@elementor/editor-controls");
var import_editor_editing_panel7 = require("@elementor/editor-editing-panel");
var import_editor_elements15 = require("@elementor/editor-elements");
var import_ui29 = require("@elementor/ui");
var import_i18n30 = require("@wordpress/i18n");

// src/extended/store/actions/set-overridable-prop.ts
var import_store63 = require("@elementor/store");
var import_utils10 = require("@elementor/utils");
function setOverridableProp({
  componentId,
  overrideKey,
  elementId,
  label,
  groupId,
  propKey,
  elType,
  widgetType,
  originValue,
  originPropFields,
  source
}) {
  const overridableProps = selectOverridableProps((0, import_store63.__getState)(), componentId);
  if (!overridableProps) {
    return;
  }
  const existingOverridableProp = overrideKey ? overridableProps.props[overrideKey] : null;
  const duplicatedTargetProps = Object.values(overridableProps.props).filter(
    (prop) => prop.elementId === elementId && prop.propKey === propKey && prop !== existingOverridableProp
  );
  const { groups: groupsAfterResolve, groupId: currentGroupId } = resolveOrCreateGroup(
    overridableProps.groups,
    groupId || existingOverridableProp?.groupId || void 0
  );
  const overridableProp = {
    overrideKey: existingOverridableProp?.overrideKey || (0, import_utils10.generateUniqueId)("prop"),
    label,
    elementId,
    propKey,
    widgetType,
    elType,
    originValue,
    groupId: currentGroupId,
    originPropFields
  };
  const stateAfterRemovingDuplicates = removePropsFromState(
    { ...overridableProps, groups: groupsAfterResolve },
    duplicatedTargetProps
  );
  const props = {
    ...stateAfterRemovingDuplicates.props,
    [overridableProp.overrideKey]: overridableProp
  };
  let groups = addPropToGroup(stateAfterRemovingDuplicates.groups, currentGroupId, overridableProp.overrideKey);
  groups = ensureGroupInOrder(groups, currentGroupId);
  const isChangingGroups = existingOverridableProp && existingOverridableProp.groupId !== currentGroupId;
  if (isChangingGroups) {
    groups = removePropFromGroup(groups, existingOverridableProp.groupId, overridableProp.overrideKey);
  }
  (0, import_store63.__dispatch)(
    slice.actions.setOverridableProps({
      componentId,
      overridableProps: {
        props,
        groups
      }
    })
  );
  const isNewProperty = !existingOverridableProp;
  if (isNewProperty) {
    const currentComponent = selectCurrentComponent((0, import_store63.__getState)());
    trackComponentEvent({
      action: "propertyExposed",
      source,
      component_uid: currentComponent?.uid,
      property_id: overridableProp.overrideKey,
      property_path: propKey,
      property_name: label,
      element_type: widgetType ?? elType
    });
  }
  return overridableProp;
}

// src/extended/components/overridable-props/indicator.tsx
var React36 = __toESM(require("react"));
var import_react19 = require("react");
var import_icons18 = require("@elementor/icons");
var import_ui28 = require("@elementor/ui");
var import_i18n29 = require("@wordpress/i18n");
var SIZE2 = "tiny";
var IconContainer = (0, import_ui28.styled)(import_ui28.Box)`
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.2s ease-in-out;

	& > svg {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate( -50%, -50% );
		width: 10px;
		height: 10px;
		fill: ${({ theme }) => theme.palette.primary.contrastText};
		stroke: ${({ theme }) => theme.palette.primary.contrastText};
		stroke-width: 2px;
	}
`;
var Content = (0, import_ui28.styled)(import_ui28.Box)`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	width: 16px;
	height: 16px;
	margin-inline: ${({ theme }) => theme.spacing(0.5)};

	&:before {
		content: '';
		display: block;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate( -50%, -50% ) rotate( 45deg );
		width: 5px;
		height: 5px;
		border-radius: 1px;
		background-color: ${({ theme }) => theme.palette.primary.main};
		transition: all 0.1s ease-in-out;
	}

	&:hover,
	&.enlarged {
		&:before {
			width: 12px;
			height: 12px;
			border-radius: 2px;
		}

		.icon {
			opacity: 1;
		}
	}
`;
var Indicator2 = (0, import_react19.forwardRef)(({ isOpen, isOverridable, ...props }, ref) => /* @__PURE__ */ React36.createElement(
  Content,
  {
    role: "button",
    ref,
    ...props,
    className: isOpen || isOverridable ? "enlarged" : "",
    "aria-label": isOverridable ? (0, import_i18n29.__)("Overridable property", "elementor") : (0, import_i18n29.__)("Make prop overridable", "elementor")
  },
  /* @__PURE__ */ React36.createElement(IconContainer, { className: "icon" }, isOverridable ? /* @__PURE__ */ React36.createElement(import_icons18.CheckIcon, { fontSize: SIZE2 }) : /* @__PURE__ */ React36.createElement(import_icons18.PlusIcon, { fontSize: SIZE2 }))
));

// src/extended/components/overridable-props/overridable-prop-indicator.tsx
function OverridablePropIndicator() {
  const { propType } = (0, import_editor_controls6.useBoundProp)();
  const componentId = useCurrentComponentId();
  const overridableProps = useSanitizeOverridableProps(componentId);
  if (!isPropAllowed(propType) || !componentId || !overridableProps) {
    return null;
  }
  return /* @__PURE__ */ React37.createElement(Content2, { componentId, overridableProps });
}
function Content2({ componentId, overridableProps }) {
  const {
    element: { id: elementId },
    elementType
  } = (0, import_editor_editing_panel7.useElement)();
  const { value, bind, propType } = (0, import_editor_controls6.useBoundProp)();
  const contextOverridableValue = useOverridablePropValue();
  const componentInstanceElement = useComponentInstanceElement();
  const { value: boundPropOverridableValue, setValue: setOverridableValue } = (0, import_editor_controls6.useBoundProp)(
    componentOverridablePropTypeUtil
  );
  const overridableValue = boundPropOverridableValue ?? contextOverridableValue;
  const popupState = (0, import_ui29.usePopupState)({
    variant: "popover"
  });
  const triggerProps = (0, import_ui29.bindTrigger)(popupState);
  const popoverProps = (0, import_ui29.bindPopover)(popupState);
  const { elType } = (0, import_editor_elements15.getWidgetsCache)()?.[elementType.key] ?? { elType: "widget" };
  const handleSubmit = ({ label, group }) => {
    const propTypeDefault = propType.default ?? {};
    const originValue = resolveOverridePropValue(overridableValue?.origin_value) ?? value ?? propTypeDefault;
    const matchingOverridableProp = overridableValue ? overridableProps?.props?.[overridableValue.override_key] : void 0;
    const overridablePropConfig = setOverridableProp({
      componentId,
      overrideKey: overridableValue?.override_key ?? null,
      elementId: componentInstanceElement?.element.id ?? elementId,
      label,
      groupId: group,
      propKey: bind,
      elType: elType ?? "widget",
      widgetType: componentInstanceElement?.elementType.key ?? elementType.key,
      originValue,
      originPropFields: matchingOverridableProp?.originPropFields,
      source: "user"
    });
    if (!overridableValue && overridablePropConfig) {
      setOverridableValue({
        override_key: overridablePropConfig.overrideKey,
        origin_value: originValue
      });
    }
    popupState.close();
  };
  const overridableConfig = overridableValue ? getOverridableProp({ componentId, overrideKey: overridableValue.override_key }) : void 0;
  return /* @__PURE__ */ React37.createElement(React37.Fragment, null, /* @__PURE__ */ React37.createElement(import_ui29.Tooltip, { placement: "top", title: (0, import_i18n30.__)("Override Property", "elementor") }, /* @__PURE__ */ React37.createElement(Indicator2, { ...triggerProps, isOpen: !!popoverProps.open, isOverridable: !!overridableValue })), /* @__PURE__ */ React37.createElement(
    import_ui29.Popover,
    {
      disableScrollLock: true,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right"
      },
      PaperProps: {
        sx: { my: 2.5 }
      },
      ...popoverProps
    },
    /* @__PURE__ */ React37.createElement(
      OverridablePropForm,
      {
        onSubmit: handleSubmit,
        groups: overridableProps?.groups.order.map((groupId) => ({
          value: groupId,
          label: overridableProps.groups.items[groupId].label
        })),
        existingLabels: Object.values(overridableProps?.props ?? {}).map((prop) => prop.label),
        currentValue: overridableConfig
      }
    )
  ));
}
function isPropAllowed(propType) {
  return propType.meta.overridable !== false;
}

// src/extended/mcp/index.ts
var import_editor_mcp2 = require("@elementor/editor-mcp");

// src/extended/mcp/save-as-component-tool.ts
var import_editor_canvas7 = require("@elementor/editor-canvas");
var import_editor_elements16 = require("@elementor/editor-elements");
var import_editor_mcp = require("@elementor/editor-mcp");
var import_http_client2 = require("@elementor/http-client");
var import_schema6 = require("@elementor/schema");
var import_utils11 = require("@elementor/utils");
var InputSchema = {
  element_id: import_schema6.z.string().describe(
    'The unique identifier of the element to save as a component. Use the "list-elements" tool to find available element IDs in the current document.'
  ),
  component_name: import_schema6.z.string().describe("The name for the new component. Should be descriptive and unique among existing components."),
  overridable_props: import_schema6.z.object({
    props: import_schema6.z.record(
      import_schema6.z.object({
        elementId: import_schema6.z.string().describe("The id of the child element that you want to override its settings"),
        propKey: import_schema6.z.string().describe(
          'The property key of the child element that you want to override its settings (e.g., "text", "url", "tag"). To get the available propKeys for an element, use the "get-element-type-config" tool.'
        ),
        label: import_schema6.z.string().describe(
          'A unique, user-friendly display name for this property (e.g., "Hero Headline", "CTA Button Text"). Must be unique within the same component.'
        ),
        group: import_schema6.z.string().optional().describe("Non unique, optional property grouping")
      })
    )
  }).optional().describe(
    'Overridable properties configuration. Specify which CHILD element properties can be customized. Only elementId and propKey are required; To get the available propKeys for a child element you must use the "get-element-type-config" tool.'
  ),
  groups: import_schema6.z.array(import_schema6.z.string()).describe("Property Groups, by order, unique values").optional()
};
var OutputSchema = {
  message: import_schema6.z.string().optional().describe("Additional information about the operation result"),
  component_uid: import_schema6.z.string().optional().describe("The unique identifier of the newly created component (only present on success)")
};
var ERROR_MESSAGES3 = {
  ELEMENT_NOT_FOUND: "Element not found. Use 'list-elements' to get valid element IDs.",
  ELEMENT_NOT_ONE_OF_TYPES: (validTypes) => `Element is not one of the following types: ${validTypes.join(", ")}`,
  ELEMENT_IS_LOCKED: "Cannot save a locked element as a component."
};
var handleSaveAsComponent = async (params) => {
  const {
    groups = [],
    element_id: elementId,
    component_name: componentName,
    overridable_props: overridablePropsInput
  } = params;
  const validElementTypes = getValidElementTypes();
  const container = (0, import_editor_elements16.getContainer)(elementId);
  if (!container) {
    throw new Error(ERROR_MESSAGES3.ELEMENT_NOT_FOUND);
  }
  const elType = container.model.get("elType");
  if (!validElementTypes.includes(elType)) {
    throw new Error(ERROR_MESSAGES3.ELEMENT_NOT_ONE_OF_TYPES(validElementTypes));
  }
  const element = container.model.toJSON({ remove: ["default"] });
  if (element?.isLocked) {
    throw new Error(ERROR_MESSAGES3.ELEMENT_IS_LOCKED);
  }
  const groupsWithDefaultGroup = groups.indexOf("Default") >= 0 ? [...groups] : ["Default", ...groups];
  const propertyGroups = groupsWithDefaultGroup.map((groupName) => ({
    id: (0, import_utils11.generateUniqueId)("group"),
    label: groupName,
    props: []
  }));
  const overridableProps = overridablePropsInput ? enrichOverridableProps(overridablePropsInput, element, propertyGroups) : void 0;
  if (overridableProps) {
    updateElementDataWithOverridableProps(element, overridableProps);
  }
  const uid = (0, import_utils11.generateUniqueId)("component");
  try {
    await apiClient.validate({
      items: [
        { uid, title: componentName, elements: [element], settings: { overridable_props: overridableProps } }
      ]
    });
  } catch (error) {
    if (error instanceof import_http_client2.AxiosError) {
      throw new Error(error.response?.data.messge);
    }
    throw new Error("Unknown error");
  }
  await createUnpublishedComponent({
    name: componentName,
    element,
    eventData: null,
    uid,
    overridableProps,
    source: "mcp_tool"
  });
  return {
    status: "ok",
    message: `Component "${componentName}" created successfully.`,
    component_uid: uid
  };
};
function enrichOverridableProps(input, rootElement, propertGroups) {
  const enrichedProps = {};
  const enrichedGroups = {};
  const defaultGroup = propertGroups.find((g) => g.label === "Default");
  if (!defaultGroup) {
    throw new Error("Internal mcp error: could not generate default group");
  }
  Object.entries(input.props).forEach(([, prop]) => {
    const { elementId, propKey, label, group = "Default" } = prop;
    const targetGroup = propertGroups.find((g) => g.label === group) || defaultGroup;
    const targetGroupId = targetGroup.id;
    const element = findElementById(rootElement, elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found in component`);
    }
    const elType = element.elType;
    const widgetType = element.widgetType || element.elType;
    const elementType = (0, import_editor_elements16.getElementType)(widgetType);
    if (!elementType) {
      throw new Error(
        `Element type "${widgetType}" is not atomic or does not have a settings schema. Cannot expose property "${propKey}" for element "${elementId}".`
      );
    }
    if (!elementType.propsSchema[propKey]) {
      const availableProps = Object.keys(elementType.propsSchema).join(", ");
      throw new Error(
        `Property "${propKey}" does not exist in element "${elementId}" (type: ${widgetType}). Available properties: ${availableProps}`
      );
    }
    const overrideKey = (0, import_utils11.generateUniqueId)("prop");
    const originValue = element.settings?.[propKey] ? element.settings[propKey] : elementType.propsSchema[propKey].default ?? null;
    if (!enrichedGroups[targetGroupId]) {
      enrichedGroups[targetGroupId] = {
        id: targetGroupId,
        label: targetGroup.label,
        props: []
      };
    }
    enrichedGroups[targetGroupId].props.push(overrideKey);
    enrichedProps[overrideKey] = {
      overrideKey,
      label,
      elementId,
      propKey,
      elType,
      widgetType,
      originValue,
      groupId: targetGroupId
    };
  });
  return {
    props: enrichedProps,
    groups: {
      items: enrichedGroups,
      order: [defaultGroup.id]
    }
  };
}
function updateElementDataWithOverridableProps(rootElement, overridableProps) {
  Object.values(overridableProps.props).forEach((prop) => {
    const element = findElementById(rootElement, prop.elementId);
    if (!element || !element.settings) {
      return;
    }
    element.settings[prop.propKey] = {
      $$type: "overridable",
      value: {
        override_key: prop.overrideKey,
        origin_value: prop.originValue
      }
    };
  });
}
function findElementById(root, targetId) {
  if (root.id === targetId) {
    return root;
  }
  if (root.elements) {
    for (const child of root.elements) {
      const found = findElementById(child, targetId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}
function getValidElementTypes() {
  const types = (0, import_editor_elements16.getWidgetsCache)();
  if (!types) {
    return [];
  }
  return Object.entries(types).reduce((acc, [type, value]) => {
    if (!value.atomic_props_schema || !value.show_in_panel || value.elType === "widget") {
      return acc;
    }
    acc.push(type);
    return acc;
  }, []);
}
var generatePrompt = () => {
  const saveAsComponentPrompt = (0, import_editor_mcp.toolPrompts)("save-as-component");
  saveAsComponentPrompt.description(`
Save an existing element as a reusable component in the Elementor editor.

# When to use this tool
Use this tool when the user wants to:
- Create a reusable component from an existing element structure
- Make specific child element properties customizable in component instances
- Build a library of reusable design patterns

# When NOT to use this tool
- Element is already a component (widgetType: 'e-component')
- Element is locked
- Element is not an atomic element (atomic_props_schema is not defined)
- Element elType is a 'widget'

# **CRITICAL - REQUIRED RESOURCES (Must read before using this tool)**
1. [${import_editor_canvas7.DOCUMENT_STRUCTURE_URI}]
   **MANDATORY** - Required to understand the document structure and identify child elements for overridable properties.
   Use this resource to find element IDs and understand the element hierarchy.

2. [${import_editor_canvas7.WIDGET_SCHEMA_URI}]
   **MANDATORY** - Required to understand which properties are available for each widget type.
   Use this to identify available propKeys in the atomic_props_schema for child elements.

# Instructions - MUST FOLLOW IN ORDER
## Step 1: Identify the Target Element
1. Read the [${import_editor_canvas7.DOCUMENT_STRUCTURE_URI}] resource to understand the document structure
2. Locate the element you want to save as a component by its element_id
3. Verify the element type is a valid element type
4. Ensure the element is not locked and is not already a component

## Step 2: Define Overridable Properties
Do this step to make child element properties customizable.
Skip that step ONLY if the user explicitly requests to not make any properties customizable.

1. **Identify Child Elements**
   - Use the [${import_editor_canvas7.DOCUMENT_STRUCTURE_URI}] resource to find all child elements
   - Note the elementId and widgetType/elType of each child element you want to customize

2. **Find Available Properties**
   - Use the [${import_editor_canvas7.WIDGET_SCHEMA_URI}] resource to find the child element's widget type schema
   - Review the atomic_props_schema to find available propKeys (ONLY use top-level props)
   - Common propKeys include: "text", "url", "tag", "size", etc.
   - Use only the top level properties, do not use nested properties.

3. **Build the overridable_props Object**
   - For each property you want to make overridable, add an entry:
     \`{ "elementId": "<child-element-id>", "propKey": "<property-key>", "label": "<user-friendly-name>" }\`
   - The label must be unique within the component and should be meaningful to the user (e.g., "Hero Headline", "CTA Button Text")
   - Group all entries under the "props" object

## Step 3: Execute the Tool
Call the tool with:
- element_id: The ID of the parent element to save as component
- component_name: A descriptive name for the component
- overridable_props: (Optional) The properties configuration from Step 2

# CONSTRAINTS
- NEVER try to override properties of the parent element itself - ONLY child elements
- NEVER use invalid propKeys - always verify against the widget's atomic_props_schema in [${import_editor_canvas7.WIDGET_SCHEMA_URI}]
- Property keys must exist in the child element's atomic_props_schema
- Element IDs must exist within the target element's children
- When tool execution fails, read the error message and adjust accordingly
- The element being saved must not be inside another component
`);
  saveAsComponentPrompt.parameter(
    "element_id",
    `**MANDATORY** The unique identifier of the element to save as a component.
Use the [${import_editor_canvas7.DOCUMENT_STRUCTURE_URI}] resource to find available element IDs.`
  );
  saveAsComponentPrompt.parameter(
    "component_name",
    `**MANDATORY** A descriptive name for the new component.
Should be unique and clearly describe the component's purpose (e.g., "Hero Section", "Feature Card").`
  );
  saveAsComponentPrompt.parameter(
    "overridable_props",
    `**OPTIONAL** Configuration for which child element properties can be customized in component instances.

Structure:
\`\`\`json
{
  "props": {
    "<unique-key>": {
      "elementId": "<child-element-id>",
      "propKey": "<property-key>",
      "label": "<user-friendly-name>"
    }
  }
}
\`\`\`

To populate this correctly:
1. Use [${import_editor_canvas7.DOCUMENT_STRUCTURE_URI}] to find child element IDs and their widgetType
2. Use [${import_editor_canvas7.WIDGET_SCHEMA_URI}] to find the atomic_props_schema for each child element's widgetType
3. Only include properties you want to be customizable in component instances
4. Provide a unique, user-friendly label for each property (e.g., "Hero Headline", "CTA Button Text")`
  );
  saveAsComponentPrompt.example(`
Basic component without overridable properties:
\`\`\`json
{
  "element_id": "abc123",
  "component_name": "Hero Section"
}
\`\`\`

Component with overridable properties:
\`\`\`json
{
  "element_id": "abc123",
  "component_name": "Feature Card",
  "overridable_props": {
    "props": {
      "heading-text": {
        "elementId": "heading-123",
        "propKey": "text",
        "label": "Card Title",
        "group": "Content"
      },
      "button-text": {
        "elementId": "button-456",
        "propKey": "text",
        "label": "Button Text",
        "group": "Content"
      },
      "button-link": {
        "elementId": "button-456",
        "propKey": "url",
        "label": "Button Link",
        "group": "Settings"
      }
    }
  }
}
\`\`\`
`);
  saveAsComponentPrompt.instruction(
    `After successful creation, the component will be available in the components library and can be inserted into any page or template.`
  );
  saveAsComponentPrompt.instruction(
    `When overridable properties are defined, component instances will show customization controls for those specific properties in the editing panel.`
  );
  return saveAsComponentPrompt.prompt();
};
var initSaveAsComponentTool = () => {
  return (0, import_editor_mcp.getMCPByDomain)("components").addTool({
    name: "save-as-component",
    schema: InputSchema,
    outputSchema: OutputSchema,
    description: generatePrompt(),
    handler: handleSaveAsComponent
  });
};

// src/extended/mcp/index.ts
function initMcp() {
  const { setMCPDescription } = (0, import_editor_mcp2.getMCPByDomain)("components");
  setMCPDescription(
    `Elementor Editor Components MCP - Tools for creating and managing reusable components. 
        Components are reusable blocks of content that can be used multiple times across the pages, its a widget which contains a set of elements and styles.`
  );
  initSaveAsComponentTool();
}

// src/sync/publish-draft-components-in-page-before-save.ts
var import_editor_documents12 = require("@elementor/editor-documents");
async function publishDraftComponentsInPageBeforeSave({ status, elements }) {
  if (status !== "publish") {
    return;
  }
  const documents = await getComponentDocuments(elements);
  const draftIds = [...documents.values()].filter(import_editor_documents12.isDocumentDirty).map((document) => document.id);
  if (draftIds.length === 0) {
    return;
  }
  await apiClient.updateStatuses(draftIds, "publish");
  draftIds.forEach((id2) => (0, import_editor_documents12.invalidateDocumentData)(id2));
}

// src/extended/sync/set-component-overridable-props-settings-before-save.ts
var import_store66 = require("@elementor/store");
var setComponentOverridablePropsSettingsBeforeSave = ({
  container
}) => {
  const currentDocument = container.document;
  if (!currentDocument || currentDocument.config.type !== COMPONENT_DOCUMENT_TYPE) {
    return;
  }
  const overridableProps = selectOverridableProps((0, import_store66.__getState)(), currentDocument.id);
  if (overridableProps) {
    container.settings.set("overridable_props", overridableProps);
  }
};

// src/extended/sync/update-archived-component-before-save.ts
var import_editor_notifications4 = require("@elementor/editor-notifications");
var import_store68 = require("@elementor/store");
var failedNotification = (message) => ({
  type: "error",
  message: `Failed to archive components: ${message}`,
  id: "failed-archived-components-notification"
});
var updateArchivedComponentBeforeSave = async (status) => {
  try {
    const archivedComponents = selectArchivedThisSession((0, import_store68.__getState)());
    if (!archivedComponents.length) {
      return;
    }
    const result = await apiClient.updateArchivedComponents(archivedComponents, status);
    const failedIds = result.failedIds.join(", ");
    if (failedIds) {
      (0, import_editor_notifications4.notify)(failedNotification(failedIds));
    }
  } catch (error) {
    throw new Error(`Failed to update archived components: ${error}`);
  }
};

// src/extended/sync/update-component-title-before-save.ts
var import_store70 = require("@elementor/store");
var updateComponentTitleBeforeSave = async (status) => {
  const updatedComponentNames = selectUpdatedComponentNames((0, import_store70.__getState)());
  if (!updatedComponentNames.length) {
    return;
  }
  const result = await apiClient.updateComponentTitle(updatedComponentNames, status);
  if (result.failedIds.length === 0) {
    (0, import_store70.__dispatch)(slice.actions.cleanUpdatedComponentNames());
  }
};

// src/extended/sync/create-components-before-save.ts
var import_editor_elements17 = require("@elementor/editor-elements");
var import_store72 = require("@elementor/store");
async function createComponentsBeforeSave({
  elements,
  status
}) {
  const unpublishedComponents = selectUnpublishedComponents((0, import_store72.__getState)());
  if (!unpublishedComponents.length) {
    return;
  }
  try {
    const uidToComponentId = await createComponents(unpublishedComponents, status);
    updateComponentInstances(elements, uidToComponentId);
    (0, import_store72.__dispatch)(
      slice.actions.add(
        unpublishedComponents.map((component) => ({
          id: uidToComponentId.get(component.uid),
          name: component.name,
          uid: component.uid,
          overridableProps: component.overridableProps ? component.overridableProps : void 0
        }))
      )
    );
    (0, import_store72.__dispatch)(slice.actions.resetUnpublished());
  } catch (error) {
    const failedUids = unpublishedComponents.map((component) => component.uid);
    (0, import_store72.__dispatch)(slice.actions.removeUnpublished(failedUids));
    throw new Error(`Failed to publish components: ${error}`);
  }
}
async function createComponents(components, status) {
  const response = await apiClient.create({
    status,
    items: components.map((component) => ({
      uid: component.uid,
      title: component.name,
      elements: component.elements,
      settings: component.overridableProps ? { overridable_props: component.overridableProps } : void 0
    }))
  });
  const map = /* @__PURE__ */ new Map();
  Object.entries(response).forEach(([key, value]) => {
    map.set(key, value);
  });
  return map;
}
function updateComponentInstances(elements, uidToComponentId) {
  elements.forEach((element) => {
    const { shouldUpdate, newComponentId } = shouldUpdateElement(element, uidToComponentId);
    if (shouldUpdate) {
      updateElementComponentId(element.id, newComponentId);
    }
    if (element.elements) {
      updateComponentInstances(element.elements, uidToComponentId);
    }
  });
}
function shouldUpdateElement(element, uidToComponentId) {
  if (element.widgetType === "e-component") {
    const currentComponentId = element.settings?.component_instance?.value?.component_id.value;
    if (currentComponentId && uidToComponentId.has(currentComponentId.toString())) {
      return {
        shouldUpdate: true,
        newComponentId: uidToComponentId.get(currentComponentId.toString())
      };
    }
  }
  return { shouldUpdate: false, newComponentId: null };
}
function updateElementComponentId(elementId, componentId) {
  (0, import_editor_elements17.updateElementSettings)({
    id: elementId,
    props: {
      component_instance: {
        $$type: "component-instance",
        value: {
          component_id: { $$type: "number", value: componentId }
        }
      }
    },
    withHistory: false
  });
}

// src/extended/sync/before-save.ts
var beforeSave = ({ container, status }) => {
  const elements = container?.model.get("elements").toJSON?.() ?? [];
  return Promise.all([
    syncComponents({ elements, status }),
    setComponentOverridablePropsSettingsBeforeSave({ container })
  ]);
};
var syncComponents = async ({ elements, status }) => {
  await updateExistingComponentsBeforeSave({ elements, status });
  await createComponentsBeforeSave({ elements, status });
};
var updateExistingComponentsBeforeSave = async ({
  elements,
  status
}) => {
  await updateComponentTitleBeforeSave(status);
  await updateArchivedComponentBeforeSave(status);
  await publishDraftComponentsInPageBeforeSave({ elements, status });
};

// src/extended/sync/cleanup-overridable-props-on-delete.ts
var import_editor_elements18 = require("@elementor/editor-elements");
var import_editor_v1_adapters7 = require("@elementor/editor-v1-adapters");
var import_store74 = require("@elementor/store");
function initCleanupOverridablePropsOnDelete() {
  (0, import_editor_v1_adapters7.registerDataHook)("dependency", "document/elements/delete", (args, options) => {
    if (isPartOfMoveCommand(options)) {
      return true;
    }
    const state = (0, import_store74.__getState)();
    if (!state) {
      return true;
    }
    const currentComponentId = selectCurrentComponentId(state);
    if (!currentComponentId) {
      return true;
    }
    const overridableProps = selectOverridableProps(state, currentComponentId);
    if (!overridableProps || Object.keys(overridableProps.props).length === 0) {
      return true;
    }
    const containers = args.containers ?? (args.container ? [args.container] : []);
    if (containers.length === 0) {
      return true;
    }
    const deletedElementIds = collectDeletedElementIds(containers);
    if (deletedElementIds.length === 0) {
      return true;
    }
    const propKeysToDelete = Object.entries(overridableProps.props).filter(([, prop]) => deletedElementIds.includes(prop.elementId)).map(([propKey]) => propKey);
    if (propKeysToDelete.length === 0) {
      return true;
    }
    deleteOverridableProp({ componentId: currentComponentId, propKey: propKeysToDelete, source: "system" });
    return true;
  });
}
function collectDeletedElementIds(containers) {
  const elementIds = containers.filter(Boolean).flatMap((container) => [container, ...(0, import_editor_elements18.getAllDescendants)(container)]).map((element) => element.model?.get?.("id") ?? element.id).filter((id2) => Boolean(id2));
  return elementIds;
}
function isPartOfMoveCommand(options) {
  const isMoveCommandInTrace = options?.commandsCurrentTrace?.includes("document/elements/move") || options?.commandsCurrentTrace?.includes("document/repeater/move");
  return Boolean(isMoveCommandInTrace);
}

// src/extended/sync/handle-component-edit-mode-container.ts
var import_editor_elements19 = require("@elementor/editor-elements");
var import_editor_v1_adapters8 = require("@elementor/editor-v1-adapters");
var V4_DEFAULT_CONTAINER_TYPE = "e-flexbox";
function initHandleComponentEditModeContainer() {
  initRedirectDropIntoComponent();
  initHandleTopLevelElementDelete();
}
function initHandleTopLevelElementDelete() {
  (0, import_editor_v1_adapters8.registerDataHook)("after", "document/elements/delete", (args) => {
    if (!isEditingComponent()) {
      return;
    }
    const containers = args.containers ?? (args.container ? [args.container] : []);
    for (const container of containers) {
      if (!container.parent || !isComponent(container.parent)) {
        continue;
      }
      const component = container.parent;
      const isComponentEmpty = component.children?.length === 0;
      if (isComponentEmpty) {
        createEmptyTopLevelContainer(container.parent);
      }
    }
  });
}
function initRedirectDropIntoComponent() {
  (0, import_editor_v1_adapters8.registerDataHook)("dependency", "preview/drop", (args) => {
    if (!isEditingComponent()) {
      return true;
    }
    const containers = args.containers ?? (args.container ? [args.container] : []);
    for (const container of containers) {
      if (!isComponent(container)) {
        continue;
      }
      const { shouldRedirect, container: redirectedContainer } = getComponentContainer(container);
      if (!shouldRedirect) {
        continue;
      }
      if (args.containers) {
        const index = args.containers.indexOf(container);
        args.containers[index] = redirectedContainer;
      } else {
        args.container = redirectedContainer;
      }
    }
    return true;
  });
}
function createEmptyTopLevelContainer(container) {
  const newContainer = (0, import_editor_elements19.createElement)({
    container,
    model: { elType: V4_DEFAULT_CONTAINER_TYPE }
  });
  (0, import_editor_elements19.selectElement)(newContainer.id);
}
function getComponentContainer(container) {
  const topLevelElement = container.children?.[0];
  if (topLevelElement) {
    return { shouldRedirect: true, container: topLevelElement };
  }
  return { shouldRedirect: false, container };
}
function isComponent(container) {
  const isDocument = container.id === "document";
  if (!isDocument) {
    return false;
  }
  return container.document?.config.type === COMPONENT_DOCUMENT_TYPE;
}

// src/extended/sync/revert-overridables-on-copy-or-duplicate.ts
var import_editor_v1_adapters9 = require("@elementor/editor-v1-adapters");
function initRevertOverridablesOnCopyOrDuplicate() {
  (0, import_editor_v1_adapters9.registerDataHook)("after", "document/elements/duplicate", (_args, result) => {
    if (!isEditingComponent()) {
      return;
    }
    revertOverridablesForDuplicatedElements(result);
  });
  (0, import_editor_v1_adapters9.registerDataHook)("after", "document/elements/copy", (args) => {
    if (!isEditingComponent()) {
      return;
    }
    revertOverridablesInStorage(args.storageKey ?? "clipboard");
  });
}
function revertOverridablesForDuplicatedElements(duplicatedElements) {
  const containers = Array.isArray(duplicatedElements) ? duplicatedElements : [duplicatedElements];
  containers.forEach((container) => {
    revertAllOverridablesInContainer(container);
  });
}
function revertOverridablesInStorage(storageKey) {
  const storage = window.elementorCommon?.storage;
  if (!storage) {
    return;
  }
  const storageData = storage.get(storageKey);
  if (!storageData?.elements?.length) {
    return;
  }
  const elementsDataWithOverridablesReverted = storageData.elements.map(revertAllOverridablesInElementData);
  storage.set(storageKey, {
    ...storageData,
    elements: elementsDataWithOverridablesReverted
  });
}

// src/extended/sync/sanitize-overridable-props.ts
var import_react20 = require("react");

// src/extended/store/actions/update-component-sanitized-attribute.ts
var import_store76 = require("@elementor/store");
function updateComponentSanitizedAttribute(componentId, attribute) {
  (0, import_store76.__dispatch)(slice.actions.updateComponentSanitizedAttribute({ componentId, attribute }));
}

// src/extended/sync/sanitize-overridable-props.ts
function SanitizeOverridableProps() {
  const currentComponentId = useCurrentComponentId();
  const overridableProps = useOverridableProps(currentComponentId);
  const isSanitized = useIsSanitizedComponent(currentComponentId, "overridableProps");
  (0, import_react20.useEffect)(() => {
    if (isSanitized || !overridableProps || !currentComponentId) {
      return;
    }
    const filtered = filterValidOverridableProps(overridableProps);
    const propsToDelete = Object.keys(overridableProps.props ?? {}).filter((key) => !filtered.props[key]);
    if (propsToDelete.length > 0) {
      propsToDelete.forEach((key) => {
        deleteOverridableProp({ componentId: currentComponentId, propKey: key, source: "system" });
      });
    }
    updateComponentSanitizedAttribute(currentComponentId, "overridableProps");
  }, [currentComponentId, isSanitized, overridableProps]);
  return null;
}

// src/extended/init.ts
function initExtended() {
  (0, import_editor_editing_panel8.registerEditingPanelReplacement)({
    id: "component-instance-edit-panel",
    condition: (_, elementType) => elementType.key === "e-component",
    component: ExtendedInstanceEditingPanel
  });
  (0, import_editor_elements_panel.registerTab)({
    id: "components",
    label: (0, import_i18n31.__)("Components", "elementor"),
    component: ExtendedComponents
  });
  (0, import_editor_panels6.__registerPanel)(panel);
  (0, import_editor_v1_adapters10.registerDataHook)("dependency", "editor/documents/close", (args) => {
    const document = (0, import_editor_documents13.getV1CurrentDocument)();
    if (document.config.type === COMPONENT_DOCUMENT_TYPE) {
      args.mode = "autosave";
    }
    return true;
  });
  (0, import_editor_v1_adapters10.registerDataHook)("after", "preview/drop", onElementDrop);
  window.elementorCommon.__beforeSave = beforeSave;
  (0, import_editor.injectIntoTop)({
    id: "create-component-popup",
    component: CreateComponentForm
  });
  (0, import_editor.injectIntoTop)({
    id: "edit-component",
    component: EditComponent
  });
  (0, import_editor_editing_panel8.injectIntoPanelHeaderTop)({
    id: "component-panel-header",
    component: ComponentPanelHeader
  });
  (0, import_editor_editing_panel8.registerFieldIndicator)({
    fieldType: import_editor_editing_panel8.FIELD_TYPE.SETTINGS,
    id: "component-overridable-prop",
    priority: 1,
    indicator: OverridablePropIndicator
  });
  (0, import_editor_controls7.registerControlReplacement)({
    id: OVERRIDABLE_PROP_REPLACEMENT_ID,
    component: OverridablePropControl,
    condition: ({ value }) => componentOverridablePropTypeUtil.isValid(value)
  });
  initCleanupOverridablePropsOnDelete();
  initMcp();
  initNonAtomicNestingPrevention();
  initHandleComponentEditModeContainer();
  initRevertOverridablesOnCopyOrDuplicate();
  (0, import_editor.injectIntoLogic)({
    id: "sanitize-overridable-props",
    component: SanitizeOverridableProps
  });
}

// src/populate-store.ts
var import_react21 = require("react");
var import_store79 = require("@elementor/store");
function PopulateStore() {
  (0, import_react21.useEffect)(() => {
    (0, import_store79.__dispatch)(loadComponents());
  }, []);
  return null;
}

// src/prevent-circular-nesting.ts
var import_editor_elements20 = require("@elementor/editor-elements");
var import_editor_notifications5 = require("@elementor/editor-notifications");
var import_editor_v1_adapters11 = require("@elementor/editor-v1-adapters");
var import_store80 = require("@elementor/store");
var import_i18n32 = require("@wordpress/i18n");
var COMPONENT_TYPE = "e-component";
var COMPONENT_CIRCULAR_NESTING_ALERT = {
  type: "default",
  message: (0, import_i18n32.__)("Can't add this component - components that contain each other can't be nested.", "elementor"),
  id: "circular-component-nesting-blocked"
};
function initCircularNestingPrevention() {
  (0, import_editor_v1_adapters11.blockCommand)({
    command: "document/elements/create",
    condition: blockCircularCreate
  });
  (0, import_editor_v1_adapters11.blockCommand)({
    command: "document/elements/move",
    condition: blockCircularMove
  });
  (0, import_editor_v1_adapters11.blockCommand)({
    command: "document/elements/paste",
    condition: blockCircularPaste
  });
}
function wouldCreateCircularNesting(componentIdToAdd) {
  if (componentIdToAdd === void 0) {
    return false;
  }
  const state = (0, import_store80.__getState)();
  const currentComponentId = selectCurrentComponentId(state);
  const path = selectPath(state);
  if (currentComponentId === null) {
    return false;
  }
  if (componentIdToAdd === currentComponentId) {
    return true;
  }
  return path.some((item) => item.componentId === componentIdToAdd);
}
function extractComponentIdFromModel(model) {
  if (!model) {
    return null;
  }
  const isComponent2 = model.widgetType === COMPONENT_TYPE;
  if (!isComponent2) {
    return null;
  }
  return model.settings?.component_instance?.value?.component_id?.value ?? null;
}
function extractComponentIdFromElement(element) {
  if (element.widgetType !== COMPONENT_TYPE) {
    return null;
  }
  return element.settings?.component_instance?.value?.component_id?.value ?? null;
}
function extractComponentIdsFromElements(elements) {
  const ids = [];
  for (const element of elements) {
    const componentId = extractComponentIdFromElement(element);
    if (componentId !== null) {
      ids.push(componentId);
    }
    if (element.elements?.length) {
      ids.push(...extractComponentIdsFromElements(element.elements));
    }
  }
  return ids;
}
function extractComponentIdFromContainer(container) {
  const widgetType = container.model?.get?.("widgetType");
  if (widgetType !== COMPONENT_TYPE) {
    return null;
  }
  const settings = container.model?.get?.("settings");
  const componentInstance = settings?.get?.("component_instance");
  return componentInstance?.value?.component_id?.value ?? null;
}
function blockCircularCreate(args) {
  const componentId = extractComponentIdFromModel(args.model);
  if (componentId === null) {
    return false;
  }
  const isBlocked = wouldCreateCircularNesting(componentId);
  if (isBlocked) {
    (0, import_editor_notifications5.notify)(COMPONENT_CIRCULAR_NESTING_ALERT);
  }
  return isBlocked;
}
function blockCircularMove(args) {
  const { containers = [args.container] } = args;
  const hasCircularComponent = containers.some((container) => {
    if (!container) {
      return false;
    }
    const allElements = (0, import_editor_elements20.getAllDescendants)(container);
    return allElements.some((element) => {
      const componentId = extractComponentIdFromContainer(element);
      if (componentId === null) {
        return false;
      }
      return wouldCreateCircularNesting(componentId);
    });
  });
  if (hasCircularComponent) {
    (0, import_editor_notifications5.notify)(COMPONENT_CIRCULAR_NESTING_ALERT);
  }
  return hasCircularComponent;
}
function blockCircularPaste(args) {
  const { storageType } = args;
  if (storageType !== "localstorage") {
    return false;
  }
  const data = window?.elementorCommon?.storage?.get();
  if (!data?.clipboard?.elements) {
    return false;
  }
  const allComponentIds = extractComponentIdsFromElements(data.clipboard.elements);
  const hasCircularComponent = allComponentIds.some(wouldCreateCircularNesting);
  if (hasCircularComponent) {
    (0, import_editor_notifications5.notify)(COMPONENT_CIRCULAR_NESTING_ALERT);
  }
  return hasCircularComponent;
}

// src/store/actions/remove-component-styles.ts
var import_store82 = require("@elementor/store");
function removeComponentStyles(id2) {
  apiClient.invalidateComponentConfigCache(id2);
  (0, import_store82.__dispatch)(slice.actions.removeStyles({ id: id2 }));
}

// src/store/components-styles-provider.ts
var import_editor_styles_repository = require("@elementor/editor-styles-repository");
var import_store84 = require("@elementor/store");
var componentsStylesProvider = (0, import_editor_styles_repository.createStylesProvider)({
  key: "components-styles",
  priority: 100,
  subscribe: (cb) => (0, import_store84.__subscribeWithSelector)(
    (state) => state[SLICE_NAME],
    () => {
      cb();
    }
  ),
  actions: {
    all: () => {
      return selectFlatStyles((0, import_store84.__getState)());
    },
    get: (id2) => {
      return selectFlatStyles((0, import_store84.__getState)()).find((style) => style.id === id2) ?? null;
    }
  }
});

// src/sync/before-save.ts
var beforeSave2 = ({ container, status }) => {
  const elements = container?.model.get("elements").toJSON?.() ?? [];
  return publishDraftComponentsInPageBeforeSave({ elements, status });
};

// src/sync/load-component-data-after-instance-added.ts
var import_editor_v1_adapters12 = require("@elementor/editor-v1-adapters");
function initLoadComponentDataAfterInstanceAdded() {
  (0, import_editor_v1_adapters12.registerDataHook)("after", "document/elements/paste", (_args, result) => {
    load(result);
  });
  (0, import_editor_v1_adapters12.registerDataHook)("after", "document/elements/import", (_args, result) => {
    load(result);
  });
}
function load(result) {
  const containers = Array.isArray(result) ? result : [result];
  loadComponentsAssets(containers.map((container) => container.model.toJSON()));
}

// src/init.ts
function init() {
  import_editor_styles_repository2.stylesRepository.register(componentsStylesProvider);
  (0, import_store86.__registerSlice)(slice);
  (0, import_editor_canvas8.registerElementType)(
    COMPONENT_WIDGET_TYPE,
    (options) => createComponentType({ ...options, showLockedByModal: openEditModeDialog })
  );
  window.elementorCommon.__beforeSave = beforeSave2;
  (0, import_editor_elements_panel2.injectTab)({
    id: "components",
    label: (0, import_i18n33.__)("Components", "elementor"),
    component: Components,
    position: 1
  });
  (0, import_editor2.injectIntoLogic)({
    id: "components-populate-store",
    component: PopulateStore
  });
  (0, import_editor_v1_adapters13.registerDataHook)("after", "editor/documents/attach-preview", async () => {
    const { id: id2, config } = (0, import_editor_documents14.getV1CurrentDocument)();
    if (id2) {
      removeComponentStyles(id2);
    }
    await loadComponentsAssets(config?.elements ?? []);
  });
  (0, import_editor2.injectIntoLogic)({
    id: "templates",
    component: LoadTemplateComponents
  });
  (0, import_editor_editing_panel9.registerEditingPanelReplacement)({
    id: "component-instance-edit-panel",
    condition: (_, elementType) => elementType.key === "e-component",
    component: InstanceEditingPanel
  });
  import_editor_canvas8.settingsTransformersRegistry.register("component-instance", componentInstanceTransformer);
  import_editor_canvas8.settingsTransformersRegistry.register("overridable", componentOverridableTransformer);
  import_editor_canvas8.settingsTransformersRegistry.register("override", componentOverrideTransformer);
  initCircularNestingPrevention();
  initLoadComponentDataAfterInstanceAdded();
  initExtended();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  init
});
//# sourceMappingURL=index.js.map