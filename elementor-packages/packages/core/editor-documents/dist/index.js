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
  __useActiveDocument: () => useActiveDocument,
  __useActiveDocumentActions: () => useActiveDocumentActions,
  __useHostDocument: () => useHostDocument,
  __useNavigateToDocument: () => useNavigateToDocument,
  getCurrentDocument: () => getCurrentDocument,
  getV1DocumentsManager: () => getV1DocumentsManager,
  init: () => init,
  setDocumentModifiedStatus: () => setDocumentModifiedStatus,
  slice: () => slice
});
module.exports = __toCommonJS(index_exports);

// src/init.ts
var import_editor = require("@elementor/editor");
var import_store7 = require("@elementor/store");

// src/hooks/use-sync-document-title.ts
var import_react = require("react");
var import_i18n = require("@wordpress/i18n");

// src/hooks/use-active-document.ts
var import_store2 = require("@elementor/store");

// src/store/selectors.ts
var import_store = require("@elementor/store");
var selectEntities = (state) => state.documents.entities;
var selectActiveId = (state) => state.documents.activeId;
var selectHostId = (state) => state.documents.hostId;
var selectActiveDocument = (0, import_store.__createSelector)(
  selectEntities,
  selectActiveId,
  (entities, activeId) => activeId && entities[activeId] ? entities[activeId] : null
);
var selectHostDocument = (0, import_store.__createSelector)(
  selectEntities,
  selectHostId,
  (entities, hostId) => hostId && entities[hostId] ? entities[hostId] : null
);

// src/hooks/use-active-document.ts
function useActiveDocument() {
  return (0, import_store2.__useSelector)(selectActiveDocument);
}

// src/hooks/use-host-document.ts
var import_store3 = require("@elementor/store");
function useHostDocument() {
  return (0, import_store3.__useSelector)(selectHostDocument);
}

// src/hooks/use-sync-document-title.ts
function useSyncDocumentTitle() {
  const activeDocument = useActiveDocument();
  const hostDocument = useHostDocument();
  const document = activeDocument && activeDocument.type.value !== "kit" ? activeDocument : hostDocument;
  (0, import_react.useEffect)(() => {
    if (document?.title === void 0) {
      return;
    }
    const title = (0, import_i18n.__)('Edit "%s" with Elementor', "elementor").replace("%s", document.title);
    window.document.title = title;
  }, [document?.title]);
}

// src/components/logic-hooks.tsx
function LogicHooks() {
  useSyncDocumentTitle();
  return null;
}

// src/store/index.ts
var import_store4 = require("@elementor/store");
var initialState = {
  entities: {},
  activeId: null,
  hostId: null
};
function hasActiveEntity(state) {
  return !!(state.activeId && state.entities[state.activeId]);
}
var slice = (0, import_store4.__createSlice)({
  name: "documents",
  initialState,
  reducers: {
    init(state, { payload }) {
      state.entities = payload.entities;
      state.hostId = payload.hostId;
      state.activeId = payload.activeId;
    },
    activateDocument(state, action) {
      state.entities[action.payload.id] = action.payload;
      state.activeId = action.payload.id;
    },
    setAsHost(state, action) {
      state.hostId = action.payload;
    },
    updateActiveDocument(state, action) {
      if (hasActiveEntity(state)) {
        state.entities[state.activeId] = {
          ...state.entities[state.activeId],
          ...action.payload
        };
      }
    },
    startSaving(state) {
      if (hasActiveEntity(state)) {
        state.entities[state.activeId].isSaving = true;
      }
    },
    endSaving(state, action) {
      if (hasActiveEntity(state)) {
        state.entities[state.activeId] = {
          ...action.payload,
          isSaving: false
        };
      }
    },
    startSavingDraft: (state) => {
      if (hasActiveEntity(state)) {
        state.entities[state.activeId].isSavingDraft = true;
      }
    },
    endSavingDraft(state, action) {
      if (hasActiveEntity(state)) {
        state.entities[state.activeId] = {
          ...action.payload,
          isSavingDraft: false
        };
      }
    },
    markAsDirty(state) {
      if (hasActiveEntity(state)) {
        state.entities[state.activeId].isDirty = true;
      }
    },
    markAsPristine(state) {
      if (hasActiveEntity(state)) {
        state.entities[state.activeId].isDirty = false;
      }
    }
  }
});

// src/sync/sync-store.ts
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
var import_store5 = require("@elementor/store");
var import_utils = require("@elementor/utils");

// src/sync/utils.ts
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
function getV1DocumentsManager() {
  const documentsManager = window.elementor?.documents;
  if (!documentsManager) {
    throw new Error("Elementor Editor V1 documents manager not found");
  }
  return documentsManager;
}
function getV1DocumentsExitTo(documentData) {
  const exitPreference = window.elementor?.getPreferences?.("exit_to") || "this_post";
  switch (exitPreference) {
    case "dashboard":
      return documentData.config.urls.main_dashboard;
    case "all_posts":
      return documentData.config.urls.all_post_type;
    case "this_post":
    default:
      return documentData.config.urls.exit_to_dashboard;
  }
}
function getV1DocumentShowCopyAndShare(documentData) {
  return documentData?.config?.panel?.show_copy_and_share ?? false;
}
function getV1DocumentPermalink(documentData) {
  return documentData.config.urls.permalink ?? "";
}
function normalizeV1Document(documentData) {
  const isUnpublishedRevision = documentData.config.revisions.current_id !== documentData.id;
  const exitToUrl = getV1DocumentsExitTo(documentData);
  return {
    id: documentData.id,
    title: documentData.container.settings.get("post_title"),
    type: {
      value: documentData.config.type,
      label: documentData.config.panel.title
    },
    status: {
      value: documentData.config.status.value,
      label: documentData.config.status.label
    },
    links: {
      permalink: getV1DocumentPermalink(documentData),
      platformEdit: exitToUrl
    },
    isDirty: documentData.editor.isChanged || isUnpublishedRevision,
    isSaving: documentData.editor.isSaving,
    isSavingDraft: false,
    permissions: {
      allowAddingWidgets: documentData.config.panel?.allow_adding_widgets ?? true,
      showCopyAndShare: getV1DocumentShowCopyAndShare(documentData)
    },
    userCan: {
      publish: documentData.config.user.can_publish
    }
  };
}
function setDocumentModifiedStatus(status) {
  (0, import_editor_v1_adapters.__privateRunCommandSync)("document/save/set-is-modified", { status }, { internal: true });
}

// src/sync/sync-store.ts
function syncStore() {
  syncInitialization();
  syncActiveDocument();
  syncOnDocumentSave();
  syncOnTitleChange();
  syncOnDocumentChange();
  syncOnExitToChange();
}
function syncInitialization() {
  const { init: init2 } = slice.actions;
  (0, import_editor_v1_adapters2.__privateListenTo)((0, import_editor_v1_adapters2.v1ReadyEvent)(), () => {
    const documentsManager = getV1DocumentsManager();
    const entities = Object.entries(documentsManager.documents).reduce(
      (acc, [id, document]) => {
        acc[id] = normalizeV1Document(document);
        return acc;
      },
      {}
    );
    (0, import_store5.__dispatch)(
      init2({
        entities,
        hostId: documentsManager.getInitialId(),
        activeId: documentsManager.getCurrentId()
      })
    );
  });
}
function syncActiveDocument() {
  const { activateDocument, setAsHost } = slice.actions;
  (0, import_editor_v1_adapters2.__privateListenTo)((0, import_editor_v1_adapters2.commandEndEvent)("editor/documents/open"), () => {
    const documentsManager = getV1DocumentsManager();
    const currentDocument = normalizeV1Document(documentsManager.getCurrent());
    (0, import_store5.__dispatch)(activateDocument(currentDocument));
    if (documentsManager.getInitialId() === currentDocument.id) {
      (0, import_store5.__dispatch)(setAsHost(currentDocument.id));
    }
  });
}
function syncOnDocumentSave() {
  const { startSaving, endSaving, startSavingDraft, endSavingDraft } = slice.actions;
  const isDraft = (e) => {
    const event = e;
    return event.args?.status === "autosave";
  };
  (0, import_editor_v1_adapters2.__privateListenTo)((0, import_editor_v1_adapters2.commandStartEvent)("document/save/save"), (e) => {
    if (isDraft(e)) {
      (0, import_store5.__dispatch)(startSavingDraft());
      return;
    }
    (0, import_store5.__dispatch)(startSaving());
  });
  (0, import_editor_v1_adapters2.__privateListenTo)((0, import_editor_v1_adapters2.commandEndEvent)("document/save/save"), (e) => {
    const activeDocument = normalizeV1Document(getV1DocumentsManager().getCurrent());
    if (isDraft(e)) {
      (0, import_store5.__dispatch)(endSavingDraft(activeDocument));
    } else {
      (0, import_store5.__dispatch)(endSaving(activeDocument));
    }
  });
}
function syncOnTitleChange() {
  const { updateActiveDocument } = slice.actions;
  const updateTitle = (0, import_utils.debounce)((e) => {
    const event = e;
    if (!("post_title" in event.args?.settings)) {
      return;
    }
    const currentDocument = getV1DocumentsManager().getCurrent();
    const newTitle = currentDocument.container.settings.get("post_title");
    (0, import_store5.__dispatch)(updateActiveDocument({ title: newTitle }));
  }, 400);
  (0, import_editor_v1_adapters2.__privateListenTo)((0, import_editor_v1_adapters2.commandEndEvent)("document/elements/settings"), updateTitle);
}
function syncOnExitToChange() {
  const { updateActiveDocument } = slice.actions;
  const updateExitTo = (0, import_utils.debounce)((e) => {
    const event = e;
    if (!("exit_to" in event.args?.settings)) {
      return;
    }
    const currentDocument = getV1DocumentsManager().getCurrent();
    const newExitTo = getV1DocumentsExitTo(currentDocument);
    const permalink = getV1DocumentPermalink(currentDocument);
    (0, import_store5.__dispatch)(updateActiveDocument({ links: { platformEdit: newExitTo, permalink } }));
  }, 400);
  (0, import_editor_v1_adapters2.__privateListenTo)((0, import_editor_v1_adapters2.commandEndEvent)("document/elements/settings"), updateExitTo);
}
function syncOnDocumentChange() {
  const { markAsDirty, markAsPristine } = slice.actions;
  (0, import_editor_v1_adapters2.__privateListenTo)((0, import_editor_v1_adapters2.commandEndEvent)("document/save/set-is-modified"), () => {
    const isSaving = selectActiveDocument((0, import_store5.__getState)())?.isSaving;
    if (isSaving) {
      return;
    }
    const currentDocument = getV1DocumentsManager().getCurrent();
    if (currentDocument.editor.isChanged) {
      (0, import_store5.__dispatch)(markAsDirty());
      return;
    }
    (0, import_store5.__dispatch)(markAsPristine());
  });
}

// src/init.ts
function init() {
  initStore();
  (0, import_editor.injectIntoLogic)({
    id: "documents-hooks",
    component: LogicHooks
  });
}
function initStore() {
  (0, import_store7.__registerSlice)(slice);
  syncStore();
}

// src/hooks/use-active-document-actions.ts
var import_react2 = require("react");
var import_editor_v1_adapters3 = require("@elementor/editor-v1-adapters");
function useActiveDocumentActions() {
  const document = useActiveDocument();
  const permalink = document?.links?.permalink ?? "";
  const save = (0, import_react2.useCallback)(() => (0, import_editor_v1_adapters3.__privateRunCommand)("document/save/default"), []);
  const saveDraft = (0, import_react2.useCallback)(() => (0, import_editor_v1_adapters3.__privateRunCommand)("document/save/draft"), []);
  const saveTemplate = (0, import_react2.useCallback)(() => (0, import_editor_v1_adapters3.__privateOpenRoute)("library/save-template"), []);
  const copyAndShare = (0, import_react2.useCallback)(() => {
    navigator.clipboard.writeText(permalink);
  }, [permalink]);
  return {
    save,
    saveDraft,
    saveTemplate,
    copyAndShare
  };
}

// src/hooks/use-navigate-to-document.ts
var import_react3 = require("react");
var import_editor_v1_adapters4 = require("@elementor/editor-v1-adapters");
function useNavigateToDocument() {
  return (0, import_react3.useCallback)(async (id) => {
    await (0, import_editor_v1_adapters4.__privateRunCommand)("editor/documents/switch", {
      id,
      setAsInitial: true
    });
    const url = new URL(window.location.href);
    url.searchParams.set("post", id.toString());
    url.searchParams.delete("active-document");
    history.replaceState({}, "", url);
  }, []);
}

// src/store/get-current-document.ts
var import_store9 = require("@elementor/store");
function getCurrentDocument() {
  return selectActiveDocument((0, import_store9.__getState)());
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  __useActiveDocument,
  __useActiveDocumentActions,
  __useHostDocument,
  __useNavigateToDocument,
  getCurrentDocument,
  getV1DocumentsManager,
  init,
  setDocumentModifiedStatus,
  slice
});
//# sourceMappingURL=index.js.map