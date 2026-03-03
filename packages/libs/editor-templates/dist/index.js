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
  init: () => init,
  useLoadedTemplates: () => useLoadedTemplates
});
module.exports = __toCommonJS(index_exports);

// src/init.ts
var import_editor = require("@elementor/editor");
var import_editor_styles_repository2 = require("@elementor/editor-styles-repository");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
var import_store6 = require("@elementor/store");

// src/load-templates.ts
var import_editor_documents = require("@elementor/editor-documents");
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var import_store2 = require("@elementor/store");

// src/store.ts
var import_store = require("@elementor/store");
var initialState = {
  entities: {}
};
var slice = (0, import_store.__createSlice)({
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
var selectTemplates = (0, import_store.__createSelector)(
  [selectEntities],
  (entities) => Object.values(entities)
);

// src/load-templates.ts
var TEMPLATE_ATTRIBUTE = 'data-elementor-post-type="elementor_library"';
var DOCUMENT_WRAPPER_ATTR = "data-elementor-id";
async function loadTemplates() {
  const iframeDocument = (0, import_editor_v1_adapters.getCanvasIframeDocument)();
  if (!iframeDocument) {
    return;
  }
  const currentDocumentId = (0, import_editor_documents.getV1CurrentDocument)()?.id;
  const templateIds = getTemplateIds(iframeDocument, currentDocumentId);
  if (!templateIds.length) {
    return;
  }
  const documents = await fetchDocuments(templateIds);
  (0, import_store2.__dispatch)(slice.actions.setTemplates(documents));
}
function unloadTemplates() {
  (0, import_store2.__dispatch)(slice.actions.clearTemplates());
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
        return await import_editor_v1_adapters.ajax.load({
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
var import_react = require("react");

// src/templates-styles-provider.ts
var import_editor_styles_repository = require("@elementor/editor-styles-repository");
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
var templatesStylesProvider = (0, import_editor_styles_repository.createStylesProvider)({
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
var import_store4 = require("@elementor/store");
function useLoadedTemplates() {
  return (0, import_store4.__useSelector)(selectTemplates);
}

// src/render-template-styles.tsx
var RenderTemplateStyles = () => {
  const templates = useLoadedTemplates();
  (0, import_react.useEffect)(() => {
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
  (0, import_store6.__registerSlice)(slice);
  import_editor_styles_repository2.stylesRepository.register(templatesStylesProvider);
  (0, import_editor_v1_adapters2.registerDataHook)("after", "editor/documents/attach-preview", async () => {
    unloadTemplates();
    clearTemplatesStyles();
    await loadTemplates();
  });
  (0, import_editor.injectIntoLogic)({
    id: "templates-styles",
    component: RenderTemplateStyles
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  init,
  useLoadedTemplates
});
//# sourceMappingURL=index.js.map