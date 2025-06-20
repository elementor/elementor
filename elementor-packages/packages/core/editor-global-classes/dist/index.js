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
var import_editor_editing_panel = require("@elementor/editor-editing-panel");
var import_editor_panels2 = require("@elementor/editor-panels");
var import_editor_styles_repository4 = require("@elementor/editor-styles-repository");
var import_editor_v1_adapters6 = require("@elementor/editor-v1-adapters");
var import_store22 = require("@elementor/store");

// src/components/class-manager/class-manager-button.tsx
var React8 = __toESM(require("react"));
var import_editor_documents3 = require("@elementor/editor-documents");
var import_editor_styles_repository3 = require("@elementor/editor-styles-repository");
var import_ui7 = require("@elementor/ui");
var import_i18n6 = require("@wordpress/i18n");

// src/global-classes-styles-provider.ts
var import_editor_styles2 = require("@elementor/editor-styles");
var import_editor_styles_repository = require("@elementor/editor-styles-repository");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
var import_store2 = require("@elementor/store");
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

// src/store.ts
var import_editor_props = require("@elementor/editor-props");
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
    updateProps(state, {
      payload
    }) {
      const style = state.data.items[payload.id];
      if (!style) {
        throw new GlobalClassNotFoundError({ context: { styleId: payload.id } });
      }
      localHistory.next(state.data);
      const variant = (0, import_editor_styles.getVariantByMeta)(style, payload.meta);
      if (variant) {
        variant.props = (0, import_editor_props.mergeProps)(variant.props, payload.props);
        if (Object.keys(variant.props).length === 0) {
          style.variants = style.variants.filter((v) => v !== variant);
        }
      } else {
        style.variants.push({ meta: payload.meta, props: payload.props });
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

// src/global-classes-styles-provider.ts
var MAX_CLASSES = 50;
var GLOBAL_CLASSES_PROVIDER_KEY = "global-classes";
var globalClassesStylesProvider = (0, import_editor_styles_repository.createStylesProvider)({
  key: GLOBAL_CLASSES_PROVIDER_KEY,
  priority: 30,
  limit: MAX_CLASSES,
  labels: {
    singular: (0, import_i18n.__)("class", "elementor"),
    plural: (0, import_i18n.__)("classes", "elementor")
  },
  subscribe: (cb) => (0, import_store2.__subscribeWithSelector)((state) => state.globalClasses, cb),
  capabilities: getCapabilities(),
  actions: {
    all: () => selectOrderedClasses((0, import_store2.__getState)()),
    get: (id2) => selectClass((0, import_store2.__getState)(), id2),
    resolveCssName: (id2) => {
      if (!(0, import_editor_v1_adapters2.isExperimentActive)("e_v_3_30")) {
        return id2;
      }
      return selectClass((0, import_store2.__getState)(), id2)?.label ?? id2;
    },
    create: (label) => {
      const classes = selectGlobalClasses((0, import_store2.__getState)());
      const existingLabels = Object.values(classes).map((style) => style.label);
      if (existingLabels.includes(label)) {
        throw new GlobalClassLabelAlreadyExistsError({ context: { label } });
      }
      const existingIds = Object.keys(classes);
      const id2 = (0, import_editor_styles2.generateId)("g-", existingIds);
      (0, import_store2.__dispatch)(
        slice.actions.add({
          id: id2,
          type: "class",
          label,
          variants: []
        })
      );
      return id2;
    },
    update: (payload) => {
      (0, import_store2.__dispatch)(
        slice.actions.update({
          style: payload
        })
      );
    },
    delete: (id2) => {
      (0, import_store2.__dispatch)(slice.actions.delete(id2));
    },
    updateProps: (args) => {
      (0, import_store2.__dispatch)(
        slice.actions.updateProps({
          id: args.id,
          meta: args.meta,
          props: args.props
        })
      );
    }
  }
});

// src/components/class-manager/class-manager-panel.tsx
var React7 = __toESM(require("react"));
var import_react5 = require("react");
var import_editor_documents2 = require("@elementor/editor-documents");
var import_editor_panels = require("@elementor/editor-panels");
var import_editor_ui3 = require("@elementor/editor-ui");
var import_editor_v1_adapters4 = require("@elementor/editor-v1-adapters");
var import_icons6 = require("@elementor/icons");
var import_query = require("@elementor/query");
var import_store16 = require("@elementor/store");
var import_ui6 = require("@elementor/ui");
var import_i18n5 = require("@wordpress/i18n");

// src/hooks/use-dirty-state.ts
var import_store4 = require("@elementor/store");
var useDirtyState = () => {
  return (0, import_store4.__useSelector)(selectIsDirty);
};

// src/save-global-classes.ts
var import_store6 = require("@elementor/store");

// src/api.ts
var import_http_client = require("@elementor/http-client");
var RESOURCE_URL = "/global-classes";
var apiClient = {
  all: (context2 = "preview") => (0, import_http_client.httpService)().get("elementor/v1" + RESOURCE_URL, {
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

// src/save-global-classes.ts
async function saveGlobalClasses({ context: context2 }) {
  const state = selectData((0, import_store6.__getState)());
  if (context2 === "preview") {
    await apiClient.saveDraft({
      items: state.items,
      order: state.order,
      changes: calculateChanges(state, selectPreviewInitialData((0, import_store6.__getState)()))
    });
  } else {
    await apiClient.publish({
      items: state.items,
      order: state.order,
      changes: calculateChanges(state, selectFrontendInitialData((0, import_store6.__getState)()))
    });
  }
  (0, import_store6.__dispatch)(slice.actions.reset({ context: context2 }));
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
function hash(obj) {
  return JSON.stringify(
    obj,
    (_, value) => isPlainObject(value) ? Object.keys(value).sort().reduce((result, key) => {
      result[key] = value[key];
      return result;
    }, {}) : value
  );
}
function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

// src/components/class-manager/class-manager-introduction.tsx
var React = __toESM(require("react"));
var import_react = require("react");
var import_editor_current_user = require("@elementor/editor-current-user");
var import_editor_ui = require("@elementor/editor-ui");
var import_ui = require("@elementor/ui");
var import_i18n2 = require("@wordpress/i18n");
var MESSAGE_KEY = "global-class-manager";
var ClassManagerIntroduction = () => {
  const [isMessageSuppressed, suppressMessage] = (0, import_editor_current_user.useSuppressedMessage)(MESSAGE_KEY);
  const [shouldShowIntroduction, setShouldShowIntroduction] = (0, import_react.useState)(!isMessageSuppressed);
  return /* @__PURE__ */ React.createElement(
    import_editor_ui.IntroductionModal,
    {
      open: shouldShowIntroduction,
      title: (0, import_i18n2.__)("Class Manager", "elementor"),
      handleClose: (shouldShowAgain) => {
        if (!shouldShowAgain) {
          suppressMessage();
        }
        setShouldShowIntroduction(false);
      }
    },
    /* @__PURE__ */ React.createElement(
      import_ui.Image,
      {
        sx: { width: "100%", aspectRatio: "16 / 9" },
        src: "https://assets.elementor.com/packages/v1/images/class-manager-intro.svg",
        alt: ""
      }
    ),
    /* @__PURE__ */ React.createElement(IntroductionContent, null)
  );
};
var IntroductionContent = () => {
  return /* @__PURE__ */ React.createElement(import_ui.Box, { p: 3 }, /* @__PURE__ */ React.createElement(import_ui.Typography, { variant: "body2" }, (0, import_i18n2.__)(
    "The Class Manager lets you see all the classes you've created, plus adjust their priority, rename them, and delete unused classes to keep your CSS structured.",
    "elementor"
  )), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement(import_ui.Typography, { variant: "body2" }, (0, import_i18n2.__)(
    "Remember, when editing an item within a specific class, any changes you make will apply across all elements in that class.",
    "elementor"
  )));
};

// src/components/class-manager/delete-class.ts
var import_editor_documents = require("@elementor/editor-documents");
var import_editor_v1_adapters3 = require("@elementor/editor-v1-adapters");
var import_store8 = require("@elementor/store");
var isDeleted = false;
var deleteClass = (id2) => {
  (0, import_store8.__dispatch)(slice.actions.delete(id2));
  isDeleted = true;
};
var onDelete = async () => {
  await reloadDocument();
  isDeleted = false;
};
var hasDeletedItems = () => isDeleted;
var reloadDocument = () => {
  const currentDocument = (0, import_editor_documents.getCurrentDocument)();
  const documentsManager = (0, import_editor_documents.getV1DocumentsManager)();
  documentsManager.invalidateCache();
  return (0, import_editor_v1_adapters3.__privateRunCommand)("editor/documents/switch", {
    id: currentDocument?.id,
    shouldScroll: false,
    shouldNavigateToDefaultRoute: false
  });
};

// src/components/class-manager/flipped-color-swatch-icon.tsx
var React2 = __toESM(require("react"));
var import_icons = require("@elementor/icons");
var FlippedColorSwatchIcon = ({ sx, ...props }) => /* @__PURE__ */ React2.createElement(import_icons.ColorSwatchIcon, { sx: { transform: "rotate(90deg)", ...sx }, ...props });

// src/components/class-manager/global-classes-list.tsx
var React5 = __toESM(require("react"));
var import_react3 = require("react");
var import_editor_styles_repository2 = require("@elementor/editor-styles-repository");
var import_editor_ui2 = require("@elementor/editor-ui");
var import_icons4 = require("@elementor/icons");
var import_store14 = require("@elementor/store");
var import_ui4 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");

// src/hooks/use-classes-order.ts
var import_store10 = require("@elementor/store");
var useClassesOrder = () => {
  return (0, import_store10.__useSelector)(selectOrder);
};

// src/hooks/use-ordered-classes.ts
var import_store12 = require("@elementor/store");
var useOrderedClasses = () => {
  return (0, import_store12.__useSelector)(selectOrderedClasses);
};

// src/components/class-manager/delete-confirmation-dialog.tsx
var React3 = __toESM(require("react"));
var import_react2 = require("react");
var import_icons2 = require("@elementor/icons");
var import_ui2 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");
var context = (0, import_react2.createContext)(null);
var DeleteConfirmationProvider = ({ children }) => {
  const [dialogProps, setDialogProps] = (0, import_react2.useState)(null);
  const openDialog = (props) => {
    setDialogProps(props);
  };
  const closeDialog = () => {
    setDialogProps(null);
  };
  return /* @__PURE__ */ React3.createElement(context.Provider, { value: { openDialog, closeDialog, dialogProps } }, children, !!dialogProps && /* @__PURE__ */ React3.createElement(DeleteConfirmationDialog, { ...dialogProps }));
};
var TITLE_ID = "delete-class-dialog";
var DeleteConfirmationDialog = ({ label, id: id2 }) => {
  const { closeDialog } = useDeleteConfirmation();
  const onConfirm = () => {
    deleteClass(id2);
    closeDialog();
  };
  return /* @__PURE__ */ React3.createElement(import_ui2.Dialog, { open: true, onClose: closeDialog, "aria-labelledby": TITLE_ID, maxWidth: "xs" }, /* @__PURE__ */ React3.createElement(import_ui2.DialogTitle, { id: TITLE_ID, display: "flex", alignItems: "center", gap: 1, sx: { lineHeight: 1 } }, /* @__PURE__ */ React3.createElement(import_icons2.AlertOctagonFilledIcon, { color: "error" }), (0, import_i18n3.__)("Delete this class?", "elementor")), /* @__PURE__ */ React3.createElement(import_ui2.DialogContent, null, /* @__PURE__ */ React3.createElement(import_ui2.DialogContentText, { variant: "body2", color: "textPrimary" }, (0, import_i18n3.__)("Deleting", "elementor"), /* @__PURE__ */ React3.createElement(import_ui2.Typography, { variant: "subtitle2", component: "span" }, "\xA0", label, "\xA0"), (0, import_i18n3.__)(
    "will permanently remove it from your project and may affect the design across all elements using it. This action cannot be undone.",
    "elementor"
  ))), /* @__PURE__ */ React3.createElement(import_ui2.DialogActions, null, /* @__PURE__ */ React3.createElement(import_ui2.Button, { color: "secondary", onClick: closeDialog }, (0, import_i18n3.__)("Not now", "elementor")), /* @__PURE__ */ React3.createElement(import_ui2.Button, { variant: "contained", color: "error", onClick: onConfirm }, (0, import_i18n3.__)("Delete", "elementor"))));
};
var useDeleteConfirmation = () => {
  const contextValue = (0, import_react2.useContext)(context);
  if (!contextValue) {
    throw new Error("useDeleteConfirmation must be used within a DeleteConfirmationProvider");
  }
  return contextValue;
};

// src/components/class-manager/sortable.tsx
var React4 = __toESM(require("react"));
var import_icons3 = require("@elementor/icons");
var import_ui3 = require("@elementor/ui");
var SortableProvider = (props) => /* @__PURE__ */ React4.createElement(import_ui3.UnstableSortableProvider, { restrictAxis: true, variant: "static", dragPlaceholderStyle: { opacity: "1" }, ...props });
var SortableTrigger = (props) => /* @__PURE__ */ React4.createElement(StyledSortableTrigger, { ...props, role: "button", className: "class-item-sortable-trigger" }, /* @__PURE__ */ React4.createElement(import_icons3.GripVerticalIcon, { fontSize: "tiny" }));
var SortableItem = ({ children, id: id2, ...props }) => {
  return /* @__PURE__ */ React4.createElement(
    import_ui3.UnstableSortableItem,
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
        return /* @__PURE__ */ React4.createElement(
          import_ui3.Box,
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
          showDropIndication && /* @__PURE__ */ React4.createElement(SortableItemIndicator, { style: dropIndicationStyle })
        );
      }
    }
  );
};
var StyledSortableTrigger = (0, import_ui3.styled)("div")(({ theme }) => ({
  position: "absolute",
  left: 0,
  top: "50%",
  transform: `translate( -${theme.spacing(1.5)}, -50% )`,
  color: theme.palette.action.active
}));
var SortableItemIndicator = (0, import_ui3.styled)(import_ui3.Box)`
	width: 100%;
	height: 1px;
	background-color: ${({ theme }) => theme.palette.text.primary};
`;

// src/components/class-manager/global-classes-list.tsx
var GlobalClassesList = ({ disabled }) => {
  const cssClasses = useOrderedClasses();
  const dispatch5 = (0, import_store14.__useDispatch)();
  const [classesOrder, reorderClasses] = useReorder();
  (0, import_react3.useEffect)(() => {
    const handler = (event) => {
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
    window.addEventListener("keydown", handler, {
      capture: true
    });
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch5]);
  if (!cssClasses?.length) {
    return /* @__PURE__ */ React5.createElement(EmptyState, null);
  }
  return /* @__PURE__ */ React5.createElement(DeleteConfirmationProvider, null, /* @__PURE__ */ React5.createElement(import_ui4.List, { sx: { display: "flex", flexDirection: "column", gap: 0.5 } }, /* @__PURE__ */ React5.createElement(SortableProvider, { value: classesOrder, onChange: reorderClasses }, cssClasses?.map(({ id: id2, label }) => {
    const renameClass = (newLabel) => {
      dispatch5(
        slice.actions.update({
          style: {
            id: id2,
            label: newLabel
          }
        })
      );
    };
    return /* @__PURE__ */ React5.createElement(SortableItem, { key: id2, id: id2 }, ({ isDragged, isDragPlaceholder, triggerProps, triggerStyle }) => /* @__PURE__ */ React5.createElement(
      ClassItem,
      {
        id: id2,
        label,
        renameClass,
        selected: isDragged,
        disabled: disabled || isDragPlaceholder,
        sortableTriggerProps: { ...triggerProps, style: triggerStyle }
      }
    ));
  }))));
};
var useReorder = () => {
  const dispatch5 = (0, import_store14.__useDispatch)();
  const order = useClassesOrder();
  const reorder = (newIds) => {
    dispatch5(slice.actions.setOrder(newIds));
  };
  return [order, reorder];
};
var ClassItem = ({ id: id2, label, renameClass, selected, disabled, sortableTriggerProps }) => {
  const itemRef = (0, import_react3.useRef)(null);
  const {
    ref: editableRef,
    openEditMode,
    isEditing,
    error,
    getProps: getEditableProps
  } = (0, import_editor_ui2.useEditable)({
    value: label,
    onSubmit: renameClass,
    validation: validateLabel
  });
  const { openDialog } = useDeleteConfirmation();
  const popupState = (0, import_ui4.usePopupState)({
    variant: "popover",
    disableAutoFocus: true
  });
  const isSelected = (selected || popupState.isOpen) && !disabled;
  return /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement(import_ui4.Stack, { p: 0 }, /* @__PURE__ */ React5.createElement(
    import_editor_ui2.WarningInfotip,
    {
      open: Boolean(error),
      text: error ?? "",
      placement: "bottom",
      width: itemRef.current?.getBoundingClientRect().width,
      offset: [0, -15]
    },
    /* @__PURE__ */ React5.createElement(
      StyledListItemButton,
      {
        ref: itemRef,
        dense: true,
        disableGutters: true,
        showActions: isSelected || isEditing,
        shape: "rounded",
        onDoubleClick: openEditMode,
        selected: isSelected,
        disabled,
        focusVisibleClassName: "visible-class-item"
      },
      /* @__PURE__ */ React5.createElement(SortableTrigger, { ...sortableTriggerProps }),
      /* @__PURE__ */ React5.createElement(Indicator, { isActive: isEditing, isError: !!error }, isEditing ? /* @__PURE__ */ React5.createElement(
        import_editor_ui2.EditableField,
        {
          ref: editableRef,
          as: import_ui4.Typography,
          variant: "caption",
          ...getEditableProps()
        }
      ) : /* @__PURE__ */ React5.createElement(import_editor_ui2.EllipsisWithTooltip, { title: label, as: import_ui4.Typography, variant: "caption" })),
      /* @__PURE__ */ React5.createElement(
        import_ui4.Tooltip,
        {
          placement: "top",
          className: "class-item-more-actions",
          title: (0, import_i18n4.__)("More actions", "elementor")
        },
        /* @__PURE__ */ React5.createElement(import_ui4.IconButton, { size: "tiny", ...(0, import_ui4.bindTrigger)(popupState), "aria-label": "More actions" }, /* @__PURE__ */ React5.createElement(import_icons4.DotsVerticalIcon, { fontSize: "tiny" }))
      )
    )
  )), /* @__PURE__ */ React5.createElement(
    import_ui4.Menu,
    {
      ...(0, import_ui4.bindMenu)(popupState),
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right"
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right"
      }
    },
    /* @__PURE__ */ React5.createElement(
      import_editor_ui2.MenuListItem,
      {
        sx: { minWidth: "160px" },
        onClick: () => {
          popupState.close();
          openEditMode();
        }
      },
      /* @__PURE__ */ React5.createElement(import_ui4.Typography, { variant: "caption", sx: { color: "text.primary" } }, (0, import_i18n4.__)("Rename", "elementor"))
    ),
    /* @__PURE__ */ React5.createElement(
      import_editor_ui2.MenuListItem,
      {
        onClick: () => {
          popupState.close();
          openDialog({ id: id2, label });
        }
      },
      /* @__PURE__ */ React5.createElement(import_ui4.Typography, { variant: "caption", sx: { color: "error.light" } }, (0, import_i18n4.__)("Delete", "elementor"))
    )
  ));
};
var StyledListItemButton = (0, import_ui4.styled)(import_ui4.ListItemButton, {
  shouldForwardProp: (prop) => !["showActions"].includes(prop)
})(
  ({ showActions }) => `
	min-height: 36px;

	&.visible-class-item {
		box-shadow: none !important;
	}

	.class-item-more-actions, .class-item-sortable-trigger {
		visibility: ${showActions ? "visible" : "hidden"};
	}

	.class-item-sortable-trigger {
		visibility: ${showActions ? "visible" : "hidden"};
	}

	&:hover&:not(:disabled) {
		.class-item-more-actions, .class-item-sortable-trigger  {
			visibility: visible;
		}
	}
`
);
var EmptyState = () => /* @__PURE__ */ React5.createElement(import_ui4.Stack, { alignItems: "center", gap: 1.5, pt: 10, px: 0.5, maxWidth: "260px", margin: "auto" }, /* @__PURE__ */ React5.createElement(FlippedColorSwatchIcon, { fontSize: "large" }), /* @__PURE__ */ React5.createElement(StyledHeader, { variant: "subtitle2", component: "h2", color: "text.secondary" }, (0, import_i18n4.__)("There are no global classes yet.", "elementor")), /* @__PURE__ */ React5.createElement(import_ui4.Typography, { align: "center", variant: "caption", color: "text.secondary" }, (0, import_i18n4.__)(
  "CSS classes created in the editor panel will appear here. Once they are available, you can arrange their hierarchy, rename them, or delete them as needed.",
  "elementor"
)));
var StyledHeader = (0, import_ui4.styled)(import_ui4.Typography)(({ theme, variant }) => ({
  "&.MuiTypography-root": {
    ...theme.typography[variant]
  }
}));
var Indicator = (0, import_ui4.styled)(import_ui4.Box, {
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

// src/components/class-manager/panel-interactions.ts
function blockPanelInteractions() {
  const extendedWindow = window;
  extendedWindow.$e?.components?.get?.("panel")?.blockUserInteractions?.();
}
function unblockPanelInteractions() {
  const extendedWindow = window;
  extendedWindow.$e?.components?.get?.("panel")?.unblockUserInteractions?.();
}

// src/components/class-manager/save-changes-dialog.tsx
var React6 = __toESM(require("react"));
var import_react4 = require("react");
var import_icons5 = require("@elementor/icons");
var import_ui5 = require("@elementor/ui");
var TITLE_ID2 = "save-changes-dialog";
var SaveChangesDialog = ({ children, onClose }) => /* @__PURE__ */ React6.createElement(import_ui5.Dialog, { open: true, onClose, "aria-labelledby": TITLE_ID2, maxWidth: "xs" }, children);
var SaveChangesDialogTitle = ({ children }) => /* @__PURE__ */ React6.createElement(import_ui5.DialogTitle, { id: TITLE_ID2, display: "flex", alignItems: "center", gap: 1, sx: { lineHeight: 1 } }, /* @__PURE__ */ React6.createElement(import_icons5.AlertTriangleFilledIcon, { color: "secondary" }), children);
var SaveChangesDialogContent = ({ children }) => /* @__PURE__ */ React6.createElement(import_ui5.DialogContent, null, children);
var SaveChangesDialogContentText = (props) => /* @__PURE__ */ React6.createElement(import_ui5.DialogContentText, { variant: "body2", color: "textPrimary", display: "flex", flexDirection: "column", ...props });
var SaveChangesDialogActions = ({ actions }) => {
  const [isConfirming, setIsConfirming] = (0, import_react4.useState)(false);
  const { cancel, confirm, discard } = actions;
  const onConfirm = async () => {
    setIsConfirming(true);
    await confirm.action();
    setIsConfirming(false);
  };
  return /* @__PURE__ */ React6.createElement(import_ui5.DialogActions, null, cancel && /* @__PURE__ */ React6.createElement(import_ui5.Button, { variant: "text", color: "secondary", onClick: cancel.action }, cancel.label), discard && /* @__PURE__ */ React6.createElement(import_ui5.Button, { variant: "text", color: "secondary", onClick: discard.action }, discard.label), /* @__PURE__ */ React6.createElement(import_ui5.Button, { variant: "contained", color: "secondary", onClick: onConfirm, loading: isConfirming }, confirm.label));
};
SaveChangesDialog.Title = SaveChangesDialogTitle;
SaveChangesDialog.Content = SaveChangesDialogContent;
SaveChangesDialog.ContentText = SaveChangesDialogContentText;
SaveChangesDialog.Actions = SaveChangesDialogActions;
var useDialog = () => {
  const [isOpen, setIsOpen] = (0, import_react4.useState)(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, open, close };
};

// src/components/class-manager/class-manager-panel.tsx
var id = "global-classes-manager";
var { panel, usePanelActions } = (0, import_editor_panels.__createPanel)({
  id,
  component: ClassManagerPanel,
  allowedEditModes: ["edit", id],
  onOpen: () => {
    (0, import_editor_v1_adapters4.changeEditMode)(id);
    blockPanelInteractions();
  },
  onClose: () => {
    (0, import_editor_v1_adapters4.changeEditMode)("edit");
    unblockPanelInteractions();
  }
});
function ClassManagerPanel() {
  const isDirty2 = useDirtyState();
  const { close: closePanel } = usePanelActions();
  const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();
  const { mutateAsync: publish, isPending: isPublishing } = usePublish();
  const resetAndClosePanel = () => {
    (0, import_store16.__dispatch)(slice.actions.resetToInitialState({ context: "frontend" }));
    closeSaveChangesDialog();
  };
  usePreventUnload();
  return /* @__PURE__ */ React7.createElement(import_editor_ui3.ThemeProvider, null, /* @__PURE__ */ React7.createElement(import_ui6.ErrorBoundary, { fallback: /* @__PURE__ */ React7.createElement(ErrorBoundaryFallback, null) }, /* @__PURE__ */ React7.createElement(import_editor_panels.Panel, null, /* @__PURE__ */ React7.createElement(import_editor_panels.PanelHeader, null, /* @__PURE__ */ React7.createElement(import_ui6.Stack, { p: 1, pl: 2, width: "100%", direction: "row", alignItems: "center" }, /* @__PURE__ */ React7.createElement(import_editor_panels.PanelHeaderTitle, { sx: { display: "flex", alignItems: "center", gap: 0.5 } }, /* @__PURE__ */ React7.createElement(FlippedColorSwatchIcon, { fontSize: "inherit" }), (0, import_i18n5.__)("Class Manager", "elementor")), /* @__PURE__ */ React7.createElement(
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
  ))), /* @__PURE__ */ React7.createElement(import_editor_panels.PanelBody, { px: 2 }, /* @__PURE__ */ React7.createElement(GlobalClassesList, { disabled: isPublishing })), /* @__PURE__ */ React7.createElement(import_editor_panels.PanelFooter, null, /* @__PURE__ */ React7.createElement(
    import_ui6.Button,
    {
      fullWidth: true,
      size: "small",
      color: "global",
      variant: "contained",
      onClick: publish,
      disabled: !isDirty2,
      loading: isPublishing
    },
    (0, import_i18n5.__)("Save changes", "elementor")
  )))), /* @__PURE__ */ React7.createElement(ClassManagerIntroduction, null), isSaveChangesDialogOpen && /* @__PURE__ */ React7.createElement(SaveChangesDialog, null, /* @__PURE__ */ React7.createElement(import_ui6.DialogHeader, { onClose: closeSaveChangesDialog, logo: false }, /* @__PURE__ */ React7.createElement(SaveChangesDialog.Title, null, (0, import_i18n5.__)("You have unsaved changes", "elementor"))), /* @__PURE__ */ React7.createElement(SaveChangesDialog.Content, null, /* @__PURE__ */ React7.createElement(SaveChangesDialog.ContentText, null, (0, import_i18n5.__)("You have unsaved changes in the Class Manager.", "elementor")), /* @__PURE__ */ React7.createElement(SaveChangesDialog.ContentText, null, (0, import_i18n5.__)("To avoid losing your updates, save your changes before leaving.", "elementor"))), /* @__PURE__ */ React7.createElement(
    SaveChangesDialog.Actions,
    {
      actions: {
        discard: {
          label: (0, import_i18n5.__)("Discard", "elementor"),
          action: () => {
            resetAndClosePanel();
          }
        },
        confirm: {
          label: (0, import_i18n5.__)("Save & Continue", "elementor"),
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
var CloseButton = ({ onClose, ...props }) => /* @__PURE__ */ React7.createElement(import_ui6.IconButton, { size: "small", color: "secondary", onClick: onClose, "aria-label": "Close", ...props }, /* @__PURE__ */ React7.createElement(import_icons6.XIcon, { fontSize: "small" }));
var ErrorBoundaryFallback = () => /* @__PURE__ */ React7.createElement(import_ui6.Box, { role: "alert", sx: { minHeight: "100%", p: 2 } }, /* @__PURE__ */ React7.createElement(import_ui6.Alert, { severity: "error", sx: { mb: 2, maxWidth: 400, textAlign: "center" } }, /* @__PURE__ */ React7.createElement("strong", null, (0, import_i18n5.__)("Something went wrong", "elementor"))));
var usePreventUnload = () => {
  const isDirty2 = useDirtyState();
  (0, import_react5.useEffect)(() => {
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
  return (0, import_query.useMutation)({
    mutationFn: () => saveGlobalClasses({ context: "frontend" }),
    onSuccess: async () => {
      (0, import_editor_documents2.setDocumentModifiedStatus)(false);
      if (hasDeletedItems()) {
        await onDelete();
      }
    }
  });
};

// src/components/class-manager/class-manager-button.tsx
var ClassManagerButton = () => {
  const document = (0, import_editor_documents3.__useActiveDocument)();
  const { open: openPanel } = usePanelActions();
  const { save: saveDocument } = (0, import_editor_documents3.__useActiveDocumentActions)();
  const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();
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
  };
  return /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement(import_ui7.Tooltip, { title: (0, import_i18n6.__)("Class Manager", "elementor"), placement: "top" }, /* @__PURE__ */ React8.createElement(import_ui7.IconButton, { size: "tiny", onClick: handleOpenPanel, sx: { marginInlineEnd: -0.75 } }, /* @__PURE__ */ React8.createElement(FlippedColorSwatchIcon, { fontSize: "tiny" }))), isSaveChangesDialogOpen && /* @__PURE__ */ React8.createElement(SaveChangesDialog, null, /* @__PURE__ */ React8.createElement(SaveChangesDialog.Title, null, (0, import_i18n6.__)("You have unsaved changes", "elementor")), /* @__PURE__ */ React8.createElement(SaveChangesDialog.Content, null, /* @__PURE__ */ React8.createElement(SaveChangesDialog.ContentText, { sx: { mb: 2 } }, (0, import_i18n6.__)(
    "To open the Class Manager, save your page first. You can't continue without saving.",
    "elementor"
  ))), /* @__PURE__ */ React8.createElement(
    SaveChangesDialog.Actions,
    {
      actions: {
        cancel: {
          label: (0, import_i18n6.__)("Stay here", "elementor"),
          action: closeSaveChangesDialog
        },
        confirm: {
          label: (0, import_i18n6.__)("Save & Continue", "elementor"),
          action: async () => {
            await saveDocument();
            closeSaveChangesDialog();
            openPanel();
          }
        }
      }
    }
  )));
};

// src/components/populate-store.tsx
var import_react6 = require("react");
var import_store18 = require("@elementor/store");
function PopulateStore() {
  const dispatch5 = (0, import_store18.__useDispatch)();
  (0, import_react6.useEffect)(() => {
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

// src/sync-with-document-save.ts
var import_editor_documents4 = require("@elementor/editor-documents");
var import_editor_v1_adapters5 = require("@elementor/editor-v1-adapters");
var import_store20 = require("@elementor/store");
function syncWithDocumentSave() {
  const unsubscribe = syncDirtyState();
  bindSaveAction();
  return unsubscribe;
}
function syncDirtyState() {
  return (0, import_store20.__subscribeWithSelector)(selectIsDirty, () => {
    if (!isDirty()) {
      return;
    }
    (0, import_editor_documents4.setDocumentModifiedStatus)(true);
  });
}
function bindSaveAction() {
  (0, import_editor_v1_adapters5.registerDataHook)("after", "document/save/save", (args) => {
    return saveGlobalClasses({
      context: args.status === "publish" ? "frontend" : "preview"
    });
  });
}
function isDirty() {
  return selectIsDirty((0, import_store20.__getState)());
}

// src/init.ts
function init() {
  (0, import_store22.__registerSlice)(slice);
  (0, import_editor_panels2.__registerPanel)(panel);
  import_editor_styles_repository4.stylesRepository.register(globalClassesStylesProvider);
  (0, import_editor.injectIntoLogic)({
    id: "global-classes-populate-store",
    component: PopulateStore
  });
  (0, import_editor_editing_panel.injectIntoClassSelectorActions)({
    id: "global-classes-manager-button",
    component: ClassManagerButton
  });
  (0, import_editor_editing_panel.registerStyleProviderToColors)(GLOBAL_CLASSES_PROVIDER_KEY, {
    name: "global",
    getThemeColor: (theme) => theme.palette.global.dark
  });
  (0, import_editor_v1_adapters6.__privateListenTo)((0, import_editor_v1_adapters6.v1ReadyEvent)(), () => {
    syncWithDocumentSave();
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  init
});
//# sourceMappingURL=index.js.map