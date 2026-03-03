// src/init.ts
import { injectIntoLogic } from "@elementor/editor";
import { stylesRepository } from "@elementor/editor-styles-repository";
import { registerDataHook } from "@elementor/editor-v1-adapters";
import { __registerSlice as registerSlice } from "@elementor/store";

// src/load-templates.ts
import { getV1CurrentDocument } from "@elementor/editor-documents";
import { ajax, getCanvasIframeDocument } from "@elementor/editor-v1-adapters";
import { __dispatch as dispatch } from "@elementor/store";

// src/store.ts
import { __createSelector, __createSlice } from "@elementor/store";
var initialState = {
  entities: {}
};
var slice = __createSlice({
  name: "templates",
  initialState,
  reducers: {
    setTemplates(state, action) {
      action.payload.forEach((doc) => {
        state.entities[doc.id] = doc.elements ?? [];
      });
    },
    clearTemplates(state) {
      state.entities = {};
    }
  }
});
var selectEntities = (state) => state.templates.entities;
var selectTemplates = __createSelector(
  [selectEntities],
  (entities) => Object.values(entities)
);

// src/load-templates.ts
var TEMPLATE_ATTRIBUTE = 'data-elementor-post-type="elementor_library"';
var DOCUMENT_WRAPPER_ATTR = "data-elementor-id";
async function loadTemplates() {
  const iframeDocument = getCanvasIframeDocument();
  if (!iframeDocument) {
    return;
  }
  const currentDocumentId = getV1CurrentDocument()?.id;
  const templateIds = getTemplateIds(iframeDocument, currentDocumentId);
  if (!templateIds.length) {
    return;
  }
  const documents = await fetchDocuments(templateIds);
  dispatch(slice.actions.setTemplates(documents));
}
function unloadTemplates() {
  dispatch(slice.actions.clearTemplates());
}
function getTemplateIds(iframeDocument, currentDocumentId) {
  const elements = [...iframeDocument.body.querySelectorAll(`[${TEMPLATE_ATTRIBUTE}]`)];
  const ids = elements.map((el) => Number(el.getAttribute(DOCUMENT_WRAPPER_ATTR))).filter((id) => !isNaN(id) && id !== currentDocumentId);
  return [...new Set(ids)];
}
async function fetchDocuments(ids) {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        return await ajax.load({
          data: { id },
          action: "get_document_config",
          unique_id: `template-${id}`
        });
      } catch {
        return null;
      }
    })
  );
  return results.filter((doc) => doc !== null);
}

// src/render-template-styles.tsx
import { useEffect } from "react";

// src/templates-styles-provider.ts
import { createStylesProvider } from "@elementor/editor-styles-repository";
var styles = [];
var listeners = /* @__PURE__ */ new Set();
function addTemplateStyles(newStyles) {
  styles = [...styles, ...newStyles];
  listeners.forEach((cb) => cb());
}
function clearTemplatesStyles() {
  styles = [];
  listeners.forEach((cb) => cb());
}
var templatesStylesProvider = createStylesProvider({
  key: "templates-styles",
  priority: 50,
  subscribe: (cb) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  actions: {
    all: () => styles,
    get: (id) => styles.find((style) => style.id === id) ?? null
  }
});

// src/use-loaded-templates.ts
import { __useSelector as useSelector } from "@elementor/store";
function useLoadedTemplates() {
  return useSelector(selectTemplates);
}

// src/render-template-styles.tsx
var RenderTemplateStyles = () => {
  const templates = useLoadedTemplates();
  useEffect(() => {
    const styles2 = templates.flatMap(extractStylesFromDocument);
    addTemplateStyles(styles2);
  }, [templates]);
  return null;
};
function extractStylesFromDocument(elements) {
  if (!elements.length) {
    return [];
  }
  return elements.flatMap(extractStylesFromElement);
}
function extractStylesFromElement(element) {
  return [
    ...Object.values(element.styles ?? {}),
    ...(element.elements ?? []).flatMap(extractStylesFromElement)
  ];
}

// src/init.ts
function init() {
  registerSlice(slice);
  stylesRepository.register(templatesStylesProvider);
  registerDataHook("after", "editor/documents/attach-preview", async () => {
    unloadTemplates();
    clearTemplatesStyles();
    await loadTemplates();
  });
  injectIntoLogic({
    id: "templates-styles",
    component: RenderTemplateStyles
  });
}
export {
  init,
  useLoadedTemplates
};
//# sourceMappingURL=index.mjs.map