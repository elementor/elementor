// src/init.ts
import { injectIntoLogic } from "@elementor/editor";
import { injectIntoClassSelectorActions, registerStyleProviderToColors } from "@elementor/editor-editing-panel";
import { __registerPanel as registerPanel } from "@elementor/editor-panels";
import { stylesRepository } from "@elementor/editor-styles-repository";
import { __privateListenTo as listenTo, v1ReadyEvent } from "@elementor/editor-v1-adapters";
import { __registerSlice as registerSlice } from "@elementor/store";

// src/components/class-manager/class-manager-button.tsx
import * as React11 from "react";
import {
  __useActiveDocument as useActiveDocument,
  __useActiveDocumentActions as useActiveDocumentActions
} from "@elementor/editor-documents";
import { useUserStylesCapability } from "@elementor/editor-styles-repository";
import { IconButton as IconButton3, Tooltip as Tooltip2 } from "@elementor/ui";
import { __ as __9 } from "@wordpress/i18n";

// src/global-classes-styles-provider.ts
import { generateId } from "@elementor/editor-styles";
import { createStylesProvider } from "@elementor/editor-styles-repository";
import { isExperimentActive as isExperimentActive2 } from "@elementor/editor-v1-adapters";
import {
  __dispatch as dispatch,
  __getState as getState,
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

// src/store.ts
import { mergeProps } from "@elementor/editor-props";
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
    updateProps(state, {
      payload
    }) {
      const style = state.data.items[payload.id];
      if (!style) {
        throw new GlobalClassNotFoundError({ context: { styleId: payload.id } });
      }
      localHistory.next(state.data);
      const variant = getVariantByMeta(style, payload.meta);
      if (variant) {
        variant.props = mergeProps(variant.props, payload.props);
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
var selectOrder = createSelector(selectData, ({ order }) => order);
var selectGlobalClasses = createSelector(selectData, ({ items }) => items);
var selectIsDirty = (state) => state[SLICE_NAME].isDirty;
var selectOrderedClasses = createSelector(
  selectGlobalClasses,
  selectOrder,
  (items, order) => order.map((id2) => items[id2])
);
var selectClass = (state, id2) => state[SLICE_NAME].data.items[id2] ?? null;

// src/global-classes-styles-provider.ts
var MAX_CLASSES = 50;
var GLOBAL_CLASSES_PROVIDER_KEY = "global-classes";
var globalClassesStylesProvider = createStylesProvider({
  key: GLOBAL_CLASSES_PROVIDER_KEY,
  priority: 30,
  limit: MAX_CLASSES,
  labels: {
    singular: __("class", "elementor"),
    plural: __("classes", "elementor")
  },
  subscribe: (cb) => subscribeWithSelector((state) => state.globalClasses, cb),
  capabilities: getCapabilities(),
  actions: {
    all: () => selectOrderedClasses(getState()),
    get: (id2) => selectClass(getState(), id2),
    resolveCssName: (id2) => {
      if (!isExperimentActive2("e_v_3_30")) {
        return id2;
      }
      return selectClass(getState(), id2)?.label ?? id2;
    },
    create: (label) => {
      const classes = selectGlobalClasses(getState());
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
          variants: []
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
    }
  }
});

// src/components/class-manager/class-manager-panel.tsx
import { useEffect as useEffect2 } from "react";
import * as React10 from "react";
import { setDocumentModifiedStatus } from "@elementor/editor-documents";
import { EXPERIMENTAL_FEATURES as EXPERIMENTAL_FEATURES2 } from "@elementor/editor-editing-panel";
import {
  __createPanel as createPanel,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  PanelHeaderTitle
} from "@elementor/editor-panels";
import { ThemeProvider } from "@elementor/editor-ui";
import { changeEditMode, isExperimentActive as isExperimentActive4 } from "@elementor/editor-v1-adapters";
import { XIcon } from "@elementor/icons";
import { useMutation } from "@elementor/query";
import { __dispatch as dispatch4 } from "@elementor/store";
import {
  Alert,
  Box as Box6,
  Button as Button3,
  DialogHeader,
  Divider,
  ErrorBoundary,
  IconButton as IconButton2,
  Stack as Stack5
} from "@elementor/ui";
import { useDebounceState } from "@elementor/utils";
import { __ as __8 } from "@wordpress/i18n";

// src/hooks/use-dirty-state.ts
import { __useSelector as useSelector } from "@elementor/store";
var useDirtyState = () => {
  return useSelector(selectIsDirty);
};

// src/save-global-classes.ts
import { __dispatch as dispatch2, __getState as getState2 } from "@elementor/store";

// src/api.ts
import { httpService } from "@elementor/http-client";
var RESOURCE_URL = "/global-classes";
var apiClient = {
  all: (context2 = "preview") => httpService().get("elementor/v1" + RESOURCE_URL, {
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

// src/save-global-classes.ts
async function saveGlobalClasses({ context: context2 }) {
  const state = selectData(getState2());
  if (context2 === "preview") {
    await apiClient.saveDraft({
      items: state.items,
      order: state.order,
      changes: calculateChanges(state, selectPreviewInitialData(getState2()))
    });
  } else {
    await apiClient.publish({
      items: state.items,
      order: state.order,
      changes: calculateChanges(state, selectFrontendInitialData(getState2()))
    });
  }
  dispatch2(slice.actions.reset({ context: context2 }));
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
import * as React from "react";
import { useState } from "react";
import { useSuppressedMessage } from "@elementor/editor-current-user";
import { IntroductionModal } from "@elementor/editor-ui";
import { Box, Image, Typography } from "@elementor/ui";
import { __ as __2 } from "@wordpress/i18n";
var MESSAGE_KEY = "global-class-manager";
var ClassManagerIntroduction = () => {
  const [isMessageSuppressed, suppressMessage] = useSuppressedMessage(MESSAGE_KEY);
  const [shouldShowIntroduction, setShouldShowIntroduction] = useState(!isMessageSuppressed);
  return /* @__PURE__ */ React.createElement(
    IntroductionModal,
    {
      open: shouldShowIntroduction,
      title: __2("Class Manager", "elementor"),
      handleClose: (shouldShowAgain) => {
        if (!shouldShowAgain) {
          suppressMessage();
        }
        setShouldShowIntroduction(false);
      }
    },
    /* @__PURE__ */ React.createElement(
      Image,
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
  return /* @__PURE__ */ React.createElement(Box, { p: 3 }, /* @__PURE__ */ React.createElement(Typography, { variant: "body2" }, __2(
    "The Class Manager lets you see all the classes you've created, plus adjust their priority, rename them, and delete unused classes to keep your CSS structured.",
    "elementor"
  )), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement(Typography, { variant: "body2" }, __2(
    "Remember, when editing an item within a specific class, any changes you make will apply across all elements in that class.",
    "elementor"
  )));
};

// src/components/class-manager/class-manager-search.tsx
import * as React2 from "react";
import { SearchIcon } from "@elementor/icons";
import { Box as Box2, Grid, InputAdornment, Stack, TextField } from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";
var ClassManagerSearch = ({ searchValue, onChange }) => /* @__PURE__ */ React2.createElement(Grid, { item: true, xs: 6, px: 2, pb: 1 }, /* @__PURE__ */ React2.createElement(Stack, { direction: "row", gap: 0.5, sx: { width: "100%" } }, /* @__PURE__ */ React2.createElement(Box2, { sx: { flexGrow: 1 } }, /* @__PURE__ */ React2.createElement(
  TextField,
  {
    role: "search",
    fullWidth: true,
    size: "tiny",
    value: searchValue,
    placeholder: __3("Search", "elementor"),
    onChange: (e) => onChange(e.target.value),
    InputProps: {
      startAdornment: /* @__PURE__ */ React2.createElement(InputAdornment, { position: "start" }, /* @__PURE__ */ React2.createElement(SearchIcon, { fontSize: "tiny" }))
    }
  }
))));

// src/components/class-manager/delete-class.ts
import { getCurrentDocument, getV1DocumentsManager } from "@elementor/editor-documents";
import { __privateRunCommand as runCommand } from "@elementor/editor-v1-adapters";
import { __dispatch as dispatch3 } from "@elementor/store";
var isDeleted = false;
var deleteClass = (id2) => {
  dispatch3(slice.actions.delete(id2));
  isDeleted = true;
};
var onDelete = async () => {
  await reloadDocument();
  isDeleted = false;
};
var hasDeletedItems = () => isDeleted;
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

// src/components/class-manager/flipped-color-swatch-icon.tsx
import * as React3 from "react";
import { ColorSwatchIcon } from "@elementor/icons";
var FlippedColorSwatchIcon = ({ sx, ...props }) => /* @__PURE__ */ React3.createElement(ColorSwatchIcon, { sx: { transform: "rotate(90deg)", ...sx }, ...props });

// src/components/class-manager/global-classes-list.tsx
import * as React8 from "react";
import { useEffect, useMemo } from "react";
import { __useDispatch as useDispatch } from "@elementor/store";
import { List, Stack as Stack4, styled as styled3, Typography as Typography5 } from "@elementor/ui";
import { __ as __7 } from "@wordpress/i18n";

// src/hooks/use-classes-order.ts
import { __useSelector as useSelector2 } from "@elementor/store";
var useClassesOrder = () => {
  return useSelector2(selectOrder);
};

// src/hooks/use-ordered-classes.ts
import { __useSelector as useSelector3 } from "@elementor/store";
var useOrderedClasses = () => {
  return useSelector3(selectOrderedClasses);
};

// src/components/class-manager/class-item.tsx
import * as React6 from "react";
import { useRef } from "react";
import { EXPERIMENTAL_FEATURES } from "@elementor/editor-editing-panel";
import { validateStyleLabel } from "@elementor/editor-styles-repository";
import { EditableField, EllipsisWithTooltip, MenuListItem, useEditable, WarningInfotip } from "@elementor/editor-ui";
import { isExperimentActive as isExperimentActive3 } from "@elementor/editor-v1-adapters";
import { DotsVerticalIcon } from "@elementor/icons";
import {
  bindMenu,
  bindTrigger,
  Box as Box4,
  IconButton,
  ListItemButton,
  Menu,
  Stack as Stack2,
  styled as styled2,
  Tooltip,
  Typography as Typography3,
  usePopupState
} from "@elementor/ui";
import { __ as __5 } from "@wordpress/i18n";

// src/components/class-manager/delete-confirmation-dialog.tsx
import * as React4 from "react";
import { createContext, useContext, useState as useState2 } from "react";
import { AlertOctagonFilledIcon } from "@elementor/icons";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography as Typography2
} from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";
var context = createContext(null);
var DeleteConfirmationProvider = ({ children }) => {
  const [dialogProps, setDialogProps] = useState2(null);
  const openDialog = (props) => {
    setDialogProps(props);
  };
  const closeDialog = () => {
    setDialogProps(null);
  };
  return /* @__PURE__ */ React4.createElement(context.Provider, { value: { openDialog, closeDialog, dialogProps } }, children, !!dialogProps && /* @__PURE__ */ React4.createElement(DeleteConfirmationDialog, { ...dialogProps }));
};
var TITLE_ID = "delete-class-dialog";
var DeleteConfirmationDialog = ({ label, id: id2 }) => {
  const { closeDialog } = useDeleteConfirmation();
  const onConfirm = () => {
    deleteClass(id2);
    closeDialog();
  };
  return /* @__PURE__ */ React4.createElement(Dialog, { open: true, onClose: closeDialog, "aria-labelledby": TITLE_ID, maxWidth: "xs" }, /* @__PURE__ */ React4.createElement(DialogTitle, { id: TITLE_ID, display: "flex", alignItems: "center", gap: 1, sx: { lineHeight: 1 } }, /* @__PURE__ */ React4.createElement(AlertOctagonFilledIcon, { color: "error" }), __4("Delete this class?", "elementor")), /* @__PURE__ */ React4.createElement(DialogContent, null, /* @__PURE__ */ React4.createElement(DialogContentText, { variant: "body2", color: "textPrimary" }, __4("Deleting", "elementor"), /* @__PURE__ */ React4.createElement(Typography2, { variant: "subtitle2", component: "span" }, "\xA0", label, "\xA0"), __4(
    "will permanently remove it from your project and may affect the design across all elements using it. This action cannot be undone.",
    "elementor"
  ))), /* @__PURE__ */ React4.createElement(DialogActions, null, /* @__PURE__ */ React4.createElement(Button, { color: "secondary", onClick: closeDialog }, __4("Not now", "elementor")), /* @__PURE__ */ React4.createElement(Button, { variant: "contained", color: "error", onClick: onConfirm }, __4("Delete", "elementor"))));
};
var useDeleteConfirmation = () => {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("useDeleteConfirmation must be used within a DeleteConfirmationProvider");
  }
  return contextValue;
};

// src/components/class-manager/sortable.tsx
import * as React5 from "react";
import { GripVerticalIcon } from "@elementor/icons";
import {
  Box as Box3,
  styled,
  UnstableSortableItem,
  UnstableSortableProvider
} from "@elementor/ui";
var SortableProvider = (props) => /* @__PURE__ */ React5.createElement(UnstableSortableProvider, { restrictAxis: true, variant: "static", dragPlaceholderStyle: { opacity: "1" }, ...props });
var SortableTrigger = (props) => /* @__PURE__ */ React5.createElement(StyledSortableTrigger, { ...props, role: "button", className: "class-item-sortable-trigger" }, /* @__PURE__ */ React5.createElement(GripVerticalIcon, { fontSize: "tiny" }));
var SortableItem = ({ children, id: id2, ...props }) => {
  return /* @__PURE__ */ React5.createElement(
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
        return /* @__PURE__ */ React5.createElement(
          Box3,
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
          showDropIndication && /* @__PURE__ */ React5.createElement(SortableItemIndicator, { style: dropIndicationStyle })
        );
      }
    }
  );
};
var StyledSortableTrigger = styled("div")(({ theme }) => ({
  position: "absolute",
  left: 0,
  top: "50%",
  transform: `translate( -${theme.spacing(1.5)}, -50% )`,
  color: theme.palette.action.active
}));
var SortableItemIndicator = styled(Box3)`
	width: 100%;
	height: 1px;
	background-color: ${({ theme }) => theme.palette.text.primary};
`;

// src/components/class-manager/class-item.tsx
var isVersion311IsActive = isExperimentActive3(EXPERIMENTAL_FEATURES.V_3_31);
var ClassItem = ({
  id: id2,
  label,
  renameClass,
  selected,
  disabled,
  sortableTriggerProps,
  isSearchActive
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
  const { openDialog } = useDeleteConfirmation();
  const popupState = usePopupState({
    variant: "popover",
    disableAutoFocus: true
  });
  const isSelected = (selected || popupState.isOpen) && !disabled;
  return /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(Stack2, { p: 0 }, /* @__PURE__ */ React6.createElement(
    WarningInfotip,
    {
      open: Boolean(error),
      text: error ?? "",
      placement: "bottom",
      width: itemRef.current?.getBoundingClientRect().width,
      offset: [0, -15]
    },
    /* @__PURE__ */ React6.createElement(
      StyledListItemButton,
      {
        ref: itemRef,
        dense: true,
        disableGutters: true,
        showSortIndicator: isSearchActive,
        showActions: isSelected || isEditing,
        shape: "rounded",
        onDoubleClick: openEditMode,
        selected: isSelected,
        disabled,
        focusVisibleClassName: "visible-class-item"
      },
      /* @__PURE__ */ React6.createElement(SortableTrigger, { ...sortableTriggerProps }),
      /* @__PURE__ */ React6.createElement(Indicator, { isActive: isEditing, isError: !!error }, isEditing ? /* @__PURE__ */ React6.createElement(
        EditableField,
        {
          ref: editableRef,
          as: Typography3,
          variant: "caption",
          ...getEditableProps()
        }
      ) : /* @__PURE__ */ React6.createElement(EllipsisWithTooltip, { title: label, as: Typography3, variant: "caption" })),
      /* @__PURE__ */ React6.createElement(
        Tooltip,
        {
          placement: "top",
          className: "class-item-more-actions",
          title: __5("More actions", "elementor")
        },
        /* @__PURE__ */ React6.createElement(IconButton, { size: "tiny", ...bindTrigger(popupState), "aria-label": "More actions" }, /* @__PURE__ */ React6.createElement(DotsVerticalIcon, { fontSize: "tiny" }))
      )
    )
  )), /* @__PURE__ */ React6.createElement(
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
    /* @__PURE__ */ React6.createElement(
      MenuListItem,
      {
        sx: { minWidth: "160px" },
        onClick: () => {
          popupState.close();
          openEditMode();
        }
      },
      /* @__PURE__ */ React6.createElement(Typography3, { variant: "caption", sx: { color: "text.primary" } }, __5("Rename", "elementor"))
    ),
    /* @__PURE__ */ React6.createElement(
      MenuListItem,
      {
        onClick: () => {
          popupState.close();
          openDialog({ id: id2, label });
        }
      },
      /* @__PURE__ */ React6.createElement(Typography3, { variant: "caption", sx: { color: "error.light" } }, __5("Delete", "elementor"))
    )
  ));
};
var StyledListItemButtonV2 = styled2(ListItemButton, {
  shouldForwardProp: (prop) => !["showActions", "showSortIndicator"].includes(prop)
})(
  ({ showActions, showSortIndicator }) => `
	min-height: 36px;

	&.visible-class-item {
		box-shadow: none !important;
	}
	.class-item-sortable-trigger {
		visibility: ${showSortIndicator && showActions ? "visible" : "hidden"};
	}
	&:hover&:not(:disabled) {
		.class-item-sortable-trigger  {
			visibility: ${showSortIndicator ? "visible" : "hidden"};
		}
	}
`
);
var StyledListItemButtonV1 = styled2(ListItemButton, {
  shouldForwardProp: (prop) => !["showActions", "showSortIndicator"].includes(prop)
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
var StyledListItemButton = isVersion311IsActive ? StyledListItemButtonV2 : StyledListItemButtonV1;
var Indicator = styled2(Box4, {
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

// src/components/class-manager/class-manager-class-not-found.tsx
import * as React7 from "react";
import { Box as Box5, Link, Stack as Stack3, Typography as Typography4 } from "@elementor/ui";
import { __ as __6 } from "@wordpress/i18n";
var CssClassNotFound = ({ onClear, searchValue }) => /* @__PURE__ */ React7.createElement(
  Stack3,
  {
    color: "text.secondary",
    pt: 5,
    alignItems: "center",
    gap: 1,
    overflow: "hidden",
    maxWidth: "170px",
    justifySelf: "center"
  },
  /* @__PURE__ */ React7.createElement(FlippedColorSwatchIcon, { color: "inherit", fontSize: "large" }),
  /* @__PURE__ */ React7.createElement(Box5, null, /* @__PURE__ */ React7.createElement(Typography4, { align: "center", variant: "subtitle2", color: "inherit" }, __6("Sorry, nothing matched", "elementor")), /* @__PURE__ */ React7.createElement(
    Typography4,
    {
      variant: "subtitle2",
      color: "inherit",
      sx: {
        display: "flex",
        width: "100%",
        justifyContent: "center"
      }
    },
    /* @__PURE__ */ React7.createElement("span", null, "\u201C"),
    /* @__PURE__ */ React7.createElement(
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
    /* @__PURE__ */ React7.createElement("span", null, "\u201D.")
  )),
  /* @__PURE__ */ React7.createElement(Typography4, { align: "center", variant: "caption", color: "inherit" }, __6("Try something else.", "elementor"), /* @__PURE__ */ React7.createElement(Link, { color: "secondary", variant: "caption", component: "button", onClick: onClear }, __6("Clear & try again", "elementor")))
);

// src/components/class-manager/global-classes-list.tsx
var GlobalClassesList = ({ disabled, searchValue, onSearch }) => {
  const cssClasses = useOrderedClasses();
  const dispatch5 = useDispatch();
  const [classesOrder, reorderClasses] = useReorder();
  const lowercaseLabels = useMemo(
    () => cssClasses.map((cssClass) => ({
      ...cssClass,
      lowerLabel: cssClass.label.toLowerCase()
    })),
    [cssClasses]
  );
  const filteredClasses = useMemo(() => {
    return searchValue.length > 1 ? lowercaseLabels.filter(
      (cssClass) => cssClass.lowerLabel.toLowerCase().includes(searchValue.toLowerCase())
    ) : cssClasses;
  }, [searchValue, cssClasses, lowercaseLabels]);
  useEffect(() => {
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
    return /* @__PURE__ */ React8.createElement(EmptyState, null);
  }
  return /* @__PURE__ */ React8.createElement(DeleteConfirmationProvider, null, filteredClasses.length <= 0 && searchValue.length > 1 ? /* @__PURE__ */ React8.createElement(CssClassNotFound, { onClear: () => onSearch(""), searchValue }) : /* @__PURE__ */ React8.createElement(List, { sx: { display: "flex", flexDirection: "column", gap: 0.5 } }, /* @__PURE__ */ React8.createElement(SortableProvider, { value: classesOrder, onChange: reorderClasses }, filteredClasses?.map(({ id: id2, label }) => {
    return /* @__PURE__ */ React8.createElement(SortableItem, { key: id2, id: id2 }, ({ isDragged, isDragPlaceholder, triggerProps, triggerStyle }) => /* @__PURE__ */ React8.createElement(
      ClassItem,
      {
        isSearchActive: searchValue.length < 2,
        id: id2,
        label,
        renameClass: (newLabel) => {
          dispatch5(
            slice.actions.update({
              style: {
                id: id2,
                label: newLabel
              }
            })
          );
        },
        selected: isDragged,
        disabled: disabled || isDragPlaceholder,
        sortableTriggerProps: { ...triggerProps, style: triggerStyle }
      }
    ));
  }))));
};
var EmptyState = () => /* @__PURE__ */ React8.createElement(Stack4, { alignItems: "center", gap: 1.5, pt: 10, px: 0.5, maxWidth: "260px", margin: "auto" }, /* @__PURE__ */ React8.createElement(FlippedColorSwatchIcon, { fontSize: "large" }), /* @__PURE__ */ React8.createElement(StyledHeader, { variant: "subtitle2", component: "h2", color: "text.secondary" }, __7("There are no global classes yet.", "elementor")), /* @__PURE__ */ React8.createElement(Typography5, { align: "center", variant: "caption", color: "text.secondary" }, __7(
  "CSS classes created in the editor panel will appear here. Once they are available, you can arrange their hierarchy, rename them, or delete them as needed.",
  "elementor"
)));
var StyledHeader = styled3(Typography5)(({ theme, variant }) => ({
  "&.MuiTypography-root": {
    ...theme.typography[variant]
  }
}));
var useReorder = () => {
  const dispatch5 = useDispatch();
  const order = useClassesOrder();
  const reorder = (newIds) => {
    dispatch5(slice.actions.setOrder(newIds));
  };
  return [order, reorder];
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
import * as React9 from "react";
import { useState as useState3 } from "react";
import { AlertTriangleFilledIcon } from "@elementor/icons";
import {
  Button as Button2,
  Dialog as Dialog2,
  DialogActions as DialogActions2,
  DialogContent as DialogContent2,
  DialogContentText as DialogContentText2,
  DialogTitle as DialogTitle2
} from "@elementor/ui";
var TITLE_ID2 = "save-changes-dialog";
var SaveChangesDialog = ({ children, onClose }) => /* @__PURE__ */ React9.createElement(Dialog2, { open: true, onClose, "aria-labelledby": TITLE_ID2, maxWidth: "xs" }, children);
var SaveChangesDialogTitle = ({ children }) => /* @__PURE__ */ React9.createElement(DialogTitle2, { id: TITLE_ID2, display: "flex", alignItems: "center", gap: 1, sx: { lineHeight: 1 } }, /* @__PURE__ */ React9.createElement(AlertTriangleFilledIcon, { color: "secondary" }), children);
var SaveChangesDialogContent = ({ children }) => /* @__PURE__ */ React9.createElement(DialogContent2, null, children);
var SaveChangesDialogContentText = (props) => /* @__PURE__ */ React9.createElement(DialogContentText2, { variant: "body2", color: "textPrimary", display: "flex", flexDirection: "column", ...props });
var SaveChangesDialogActions = ({ actions }) => {
  const [isConfirming, setIsConfirming] = useState3(false);
  const { cancel, confirm, discard } = actions;
  const onConfirm = async () => {
    setIsConfirming(true);
    await confirm.action();
    setIsConfirming(false);
  };
  return /* @__PURE__ */ React9.createElement(DialogActions2, null, cancel && /* @__PURE__ */ React9.createElement(Button2, { variant: "text", color: "secondary", onClick: cancel.action }, cancel.label), discard && /* @__PURE__ */ React9.createElement(Button2, { variant: "text", color: "secondary", onClick: discard.action }, discard.label), /* @__PURE__ */ React9.createElement(Button2, { variant: "contained", color: "secondary", onClick: onConfirm, loading: isConfirming }, confirm.label));
};
SaveChangesDialog.Title = SaveChangesDialogTitle;
SaveChangesDialog.Content = SaveChangesDialogContent;
SaveChangesDialog.ContentText = SaveChangesDialogContentText;
SaveChangesDialog.Actions = SaveChangesDialogActions;
var useDialog = () => {
  const [isOpen, setIsOpen] = useState3(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, open, close };
};

// src/components/class-manager/class-manager-panel.tsx
var isVersion311IsActive2 = isExperimentActive4(EXPERIMENTAL_FEATURES2.V_3_31);
var id = "global-classes-manager";
var { panel, usePanelActions } = createPanel({
  id,
  component: ClassManagerPanel,
  allowedEditModes: ["edit", id],
  onOpen: () => {
    changeEditMode(id);
    blockPanelInteractions();
  },
  onClose: () => {
    changeEditMode("edit");
    unblockPanelInteractions();
  }
});
function ClassManagerPanel() {
  const { debouncedValue, inputValue, handleChange } = useDebounceState({
    delay: 300,
    initialValue: ""
  });
  const isDirty2 = useDirtyState();
  const { close: closePanel } = usePanelActions();
  const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();
  const { mutateAsync: publish, isPending: isPublishing } = usePublish();
  const resetAndClosePanel = () => {
    dispatch4(slice.actions.resetToInitialState({ context: "frontend" }));
    closeSaveChangesDialog();
  };
  usePreventUnload();
  return /* @__PURE__ */ React10.createElement(ThemeProvider, null, /* @__PURE__ */ React10.createElement(ErrorBoundary, { fallback: /* @__PURE__ */ React10.createElement(ErrorBoundaryFallback, null) }, /* @__PURE__ */ React10.createElement(Panel, null, /* @__PURE__ */ React10.createElement(PanelHeader, null, /* @__PURE__ */ React10.createElement(Stack5, { p: 1, pl: 2, width: "100%", direction: "row", alignItems: "center" }, /* @__PURE__ */ React10.createElement(PanelHeaderTitle, { sx: { display: "flex", alignItems: "center", gap: 0.5 } }, /* @__PURE__ */ React10.createElement(FlippedColorSwatchIcon, { fontSize: "inherit" }), __8("Class Manager", "elementor")), /* @__PURE__ */ React10.createElement(
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
  ))), /* @__PURE__ */ React10.createElement(
    PanelBody,
    {
      sx: {
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }
    },
    isVersion311IsActive2 && /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement(ClassManagerSearch, { searchValue: inputValue, onChange: handleChange }), /* @__PURE__ */ React10.createElement(
      Divider,
      {
        sx: {
          borderWidth: "1px 0 0 0"
        }
      }
    )),
    /* @__PURE__ */ React10.createElement(
      Box6,
      {
        px: 2,
        sx: {
          flexGrow: 1,
          overflowY: "auto"
        }
      },
      /* @__PURE__ */ React10.createElement(
        GlobalClassesList,
        {
          disabled: isPublishing,
          searchValue: debouncedValue,
          onSearch: handleChange
        }
      )
    )
  ), /* @__PURE__ */ React10.createElement(PanelFooter, null, /* @__PURE__ */ React10.createElement(
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
    __8("Save changes", "elementor")
  )))), /* @__PURE__ */ React10.createElement(ClassManagerIntroduction, null), isSaveChangesDialogOpen && /* @__PURE__ */ React10.createElement(SaveChangesDialog, null, /* @__PURE__ */ React10.createElement(DialogHeader, { onClose: closeSaveChangesDialog, logo: false }, /* @__PURE__ */ React10.createElement(SaveChangesDialog.Title, null, __8("You have unsaved changes", "elementor"))), /* @__PURE__ */ React10.createElement(SaveChangesDialog.Content, null, /* @__PURE__ */ React10.createElement(SaveChangesDialog.ContentText, null, __8("You have unsaved changes in the Class Manager.", "elementor")), /* @__PURE__ */ React10.createElement(SaveChangesDialog.ContentText, null, __8("To avoid losing your updates, save your changes before leaving.", "elementor"))), /* @__PURE__ */ React10.createElement(
    SaveChangesDialog.Actions,
    {
      actions: {
        discard: {
          label: __8("Discard", "elementor"),
          action: () => {
            resetAndClosePanel();
          }
        },
        confirm: {
          label: __8("Save & Continue", "elementor"),
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
var CloseButton = ({ onClose, ...props }) => /* @__PURE__ */ React10.createElement(IconButton2, { size: "small", color: "secondary", onClick: onClose, "aria-label": "Close", ...props }, /* @__PURE__ */ React10.createElement(XIcon, { fontSize: "small" }));
var ErrorBoundaryFallback = () => /* @__PURE__ */ React10.createElement(Box6, { role: "alert", sx: { minHeight: "100%", p: 2 } }, /* @__PURE__ */ React10.createElement(Alert, { severity: "error", sx: { mb: 2, maxWidth: 400, textAlign: "center" } }, /* @__PURE__ */ React10.createElement("strong", null, __8("Something went wrong", "elementor"))));
var usePreventUnload = () => {
  const isDirty2 = useDirtyState();
  useEffect2(() => {
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

// src/components/class-manager/class-manager-button.tsx
var ClassManagerButton = () => {
  const document = useActiveDocument();
  const { open: openPanel } = usePanelActions();
  const { save: saveDocument } = useActiveDocumentActions();
  const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();
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
  };
  return /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement(Tooltip2, { title: __9("Class Manager", "elementor"), placement: "top" }, /* @__PURE__ */ React11.createElement(IconButton3, { size: "tiny", onClick: handleOpenPanel, sx: { marginInlineEnd: -0.75 } }, /* @__PURE__ */ React11.createElement(FlippedColorSwatchIcon, { fontSize: "tiny" }))), isSaveChangesDialogOpen && /* @__PURE__ */ React11.createElement(SaveChangesDialog, null, /* @__PURE__ */ React11.createElement(SaveChangesDialog.Title, null, __9("You have unsaved changes", "elementor")), /* @__PURE__ */ React11.createElement(SaveChangesDialog.Content, null, /* @__PURE__ */ React11.createElement(SaveChangesDialog.ContentText, { sx: { mb: 2 } }, __9(
    "To open the Class Manager, save your page first. You can't continue without saving.",
    "elementor"
  ))), /* @__PURE__ */ React11.createElement(
    SaveChangesDialog.Actions,
    {
      actions: {
        cancel: {
          label: __9("Stay here", "elementor"),
          action: closeSaveChangesDialog
        },
        confirm: {
          label: __9("Save & Continue", "elementor"),
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
import { useEffect as useEffect3 } from "react";
import { __useDispatch as useDispatch2 } from "@elementor/store";
function PopulateStore() {
  const dispatch5 = useDispatch2();
  useEffect3(() => {
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
import { setDocumentModifiedStatus as setDocumentModifiedStatus2 } from "@elementor/editor-documents";
import { registerDataHook } from "@elementor/editor-v1-adapters";
import { __getState as getState3, __subscribeWithSelector as subscribeWithSelector2 } from "@elementor/store";
function syncWithDocumentSave() {
  const unsubscribe = syncDirtyState();
  bindSaveAction();
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
function bindSaveAction() {
  registerDataHook("after", "document/save/save", (args) => {
    return saveGlobalClasses({
      context: args.status === "publish" ? "frontend" : "preview"
    });
  });
}
function isDirty() {
  return selectIsDirty(getState3());
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
  injectIntoClassSelectorActions({
    id: "global-classes-manager-button",
    component: ClassManagerButton
  });
  registerStyleProviderToColors(GLOBAL_CLASSES_PROVIDER_KEY, {
    name: "global",
    getThemeColor: (theme) => theme.palette.global.dark
  });
  listenTo(v1ReadyEvent(), () => {
    syncWithDocumentSave();
  });
}
export {
  init
};
//# sourceMappingURL=index.mjs.map