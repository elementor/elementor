// src/init.ts
import { injectIntoLogic } from "@elementor/editor";
import { __registerSlice } from "@elementor/store";

// src/hooks/use-sync-document-title.ts
import { useEffect } from "react";
import { __ } from "@wordpress/i18n";

// src/hooks/use-active-document.ts
import { __useSelector as useSelector } from "@elementor/store";

// src/store/selectors.ts
import { __createSelector } from "@elementor/store";
var selectEntities = (state) => state.documents.entities;
var selectActiveId = (state) => state.documents.activeId;
var selectHostId = (state) => state.documents.hostId;
var selectActiveDocument = __createSelector(
  selectEntities,
  selectActiveId,
  (entities, activeId) => activeId && entities[activeId] ? entities[activeId] : null
);
var selectHostDocument = __createSelector(
  selectEntities,
  selectHostId,
  (entities, hostId) => hostId && entities[hostId] ? entities[hostId] : null
);

// src/hooks/use-active-document.ts
function useActiveDocument() {
  return useSelector(selectActiveDocument);
}

// src/hooks/use-host-document.ts
import { __useSelector as useSelector2 } from "@elementor/store";
function useHostDocument() {
  return useSelector2(selectHostDocument);
}

// src/hooks/use-sync-document-title.ts
function useSyncDocumentTitle() {
  const activeDocument = useActiveDocument();
  const hostDocument = useHostDocument();
  const document = activeDocument && activeDocument.type.value !== "kit" ? activeDocument : hostDocument;
  useEffect(() => {
    if (document?.title === void 0) {
      return;
    }
    const title = __('Edit "%s" with Elementor', "elementor").replace("%s", document.title);
    window.document.title = title;
  }, [document?.title]);
}

// src/components/logic-hooks.tsx
function LogicHooks() {
  useSyncDocumentTitle();
  return null;
}

// src/store/index.ts
import { __createSlice } from "@elementor/store";
var initialState = {
  entities: {},
  activeId: null,
  hostId: null
};
function hasActiveEntity(state) {
  return !!(state.activeId && state.entities[state.activeId]);
}
var slice = __createSlice({
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
import {
  __privateListenTo as listenTo,
  commandEndEvent,
  commandStartEvent,
  v1ReadyEvent
} from "@elementor/editor-v1-adapters";
import { __dispatch, __getState as getState } from "@elementor/store";
import { debounce } from "@elementor/utils";

// src/sync/utils.ts
import { __privateRunCommandSync as runCommandSync } from "@elementor/editor-v1-adapters";
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
  runCommandSync("document/save/set-is-modified", { status }, { internal: true });
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
  listenTo(v1ReadyEvent(), () => {
    const documentsManager = getV1DocumentsManager();
    const entities = Object.entries(documentsManager.documents).reduce(
      (acc, [id, document]) => {
        acc[id] = normalizeV1Document(document);
        return acc;
      },
      {}
    );
    __dispatch(
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
  listenTo(commandEndEvent("editor/documents/open"), () => {
    const documentsManager = getV1DocumentsManager();
    const currentDocument = normalizeV1Document(documentsManager.getCurrent());
    __dispatch(activateDocument(currentDocument));
    if (documentsManager.getInitialId() === currentDocument.id) {
      __dispatch(setAsHost(currentDocument.id));
    }
  });
}
function syncOnDocumentSave() {
  const { startSaving, endSaving, startSavingDraft, endSavingDraft } = slice.actions;
  const isDraft = (e) => {
    const event = e;
    return event.args?.status === "autosave";
  };
  listenTo(commandStartEvent("document/save/save"), (e) => {
    if (isDraft(e)) {
      __dispatch(startSavingDraft());
      return;
    }
    __dispatch(startSaving());
  });
  listenTo(commandEndEvent("document/save/save"), (e) => {
    const activeDocument = normalizeV1Document(getV1DocumentsManager().getCurrent());
    if (isDraft(e)) {
      __dispatch(endSavingDraft(activeDocument));
    } else {
      __dispatch(endSaving(activeDocument));
    }
  });
}
function syncOnTitleChange() {
  const { updateActiveDocument } = slice.actions;
  const updateTitle = debounce((e) => {
    const event = e;
    if (!("post_title" in event.args?.settings)) {
      return;
    }
    const currentDocument = getV1DocumentsManager().getCurrent();
    const newTitle = currentDocument.container.settings.get("post_title");
    __dispatch(updateActiveDocument({ title: newTitle }));
  }, 400);
  listenTo(commandEndEvent("document/elements/settings"), updateTitle);
}
function syncOnExitToChange() {
  const { updateActiveDocument } = slice.actions;
  const updateExitTo = debounce((e) => {
    const event = e;
    if (!("exit_to" in event.args?.settings)) {
      return;
    }
    const currentDocument = getV1DocumentsManager().getCurrent();
    const newExitTo = getV1DocumentsExitTo(currentDocument);
    const permalink = getV1DocumentPermalink(currentDocument);
    __dispatch(updateActiveDocument({ links: { platformEdit: newExitTo, permalink } }));
  }, 400);
  listenTo(commandEndEvent("document/elements/settings"), updateExitTo);
}
function syncOnDocumentChange() {
  const { markAsDirty, markAsPristine } = slice.actions;
  listenTo(commandEndEvent("document/save/set-is-modified"), () => {
    const isSaving = selectActiveDocument(getState())?.isSaving;
    if (isSaving) {
      return;
    }
    const currentDocument = getV1DocumentsManager().getCurrent();
    if (currentDocument.editor.isChanged) {
      __dispatch(markAsDirty());
      return;
    }
    __dispatch(markAsPristine());
  });
}

// src/init.ts
function init() {
  initStore();
  injectIntoLogic({
    id: "documents-hooks",
    component: LogicHooks
  });
}
function initStore() {
  __registerSlice(slice);
  syncStore();
}

// src/hooks/use-active-document-actions.ts
import { useCallback } from "react";
import { __privateOpenRoute as openRoute, __privateRunCommand as runCommand } from "@elementor/editor-v1-adapters";
function useActiveDocumentActions() {
  const document = useActiveDocument();
  const permalink = document?.links?.permalink ?? "";
  const save = useCallback(() => runCommand("document/save/default"), []);
  const saveDraft = useCallback(() => runCommand("document/save/draft"), []);
  const saveTemplate = useCallback(() => openRoute("library/save-template"), []);
  const copyAndShare = useCallback(() => {
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
import { useCallback as useCallback2 } from "react";
import { __privateRunCommand as runCommand2 } from "@elementor/editor-v1-adapters";
function useNavigateToDocument() {
  return useCallback2(async (id) => {
    await runCommand2("editor/documents/switch", {
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
import { __getState as getState2 } from "@elementor/store";
function getCurrentDocument() {
  return selectActiveDocument(getState2());
}
export {
  useActiveDocument as __useActiveDocument,
  useActiveDocumentActions as __useActiveDocumentActions,
  useHostDocument as __useHostDocument,
  useNavigateToDocument as __useNavigateToDocument,
  getCurrentDocument,
  getV1DocumentsManager,
  init,
  setDocumentModifiedStatus,
  slice
};
//# sourceMappingURL=index.mjs.map