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
  init: () => init,
  injectTab: () => injectTab,
  registerTab: () => registerTab
});
module.exports = __toCommonJS(index_exports);

// src/init.ts
var import_editor = require("@elementor/editor");

// src/components/elements-panel-tab.tsx
var React = __toESM(require("react"));
var import_ui = require("@elementor/ui");

// src/hooks/use-active-tab.ts
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");

// src/consts.ts
var LEGACY_ELEMENTS_PANEL_COMPONENT_NAME = "panel/elements";
var LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX = `${LEGACY_ELEMENTS_PANEL_COMPONENT_NAME}/`;

// src/tabs.ts
var tabs = {};
function registerTab(tab) {
  tabs[tab.id] = tab;
}
function getTab(id) {
  return tabs[id] || null;
}

// src/utils/get-window.ts
function getWindow() {
  return window;
}

// src/hooks/use-active-tab.ts
function useActiveTab() {
  return (0, import_editor_v1_adapters.__privateUseListenTo)(
    [
      (0, import_editor_v1_adapters.v1ReadyEvent)(),
      (0, import_editor_v1_adapters.routeOpenEvent)(LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX),
      (0, import_editor_v1_adapters.routeCloseEvent)(LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX)
    ],
    () => {
      const panelRoute = getWindow().$e.routes.getCurrent()?.panel;
      if (!panelRoute || !panelRoute.startsWith(LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX)) {
        return null;
      }
      const tab = panelRoute.replace(LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX, "");
      return getTab(tab) ?? null;
    }
  );
}

// src/components/elements-panel-tab.tsx
var PANEL_WRAPPER_ID = "elementor-panel-elements-wrapper";
function ElementsPanelTab() {
  const tab = useActiveTab();
  const TabComponent = tab?.component;
  const container = document.getElementById(PANEL_WRAPPER_ID);
  return TabComponent && container ? /* @__PURE__ */ React.createElement(import_ui.Portal, { container }, /* @__PURE__ */ React.createElement(TabComponent, null)) : null;
}

// src/init.ts
function init() {
  (0, import_editor.injectIntoTop)({
    id: "editor-elements-panel-tab",
    component: ElementsPanelTab
  });
}

// src/inject-tab.ts
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");

// src/utils/create-legacy-view.ts
function createLegacyView() {
  return getWindow().Marionette.CompositeView.extend({
    template: `<div></div>`,
    initialize() {
      getWindow().elementor.getPanelView().getCurrentPageView().search.reset();
    }
  });
}

// src/utils/get-navigation-wrapper-element.ts
var import_utils = require("@elementor/utils");
var NAVIGATION_WRAPPER_ID = "elementor-panel-elements-navigation";
var ElementsPanelWrapperElementNotFoundError = (0, import_utils.createError)({
  code: "elements_panel_wrapper_element_not_found",
  message: "Elementor Elements Panel wrapper element not found"
});
function getNavigationWrapperElement() {
  const wrapper = document.getElementById(NAVIGATION_WRAPPER_ID);
  if (!wrapper) {
    throw new ElementsPanelWrapperElementNotFoundError();
  }
  return wrapper;
}

// src/utils/create-tab-nav-item.ts
function createTabNavItem({ id, label, route, isActive, position }) {
  const wrapper = getNavigationWrapperElement();
  const btn = document.createElement("button");
  btn.className = ["elementor-component-tab", "elementor-panel-navigation-tab", isActive ? "elementor-active" : ""].filter(Boolean).join(" ");
  btn.setAttribute("data-tab", id);
  btn.textContent = label;
  btn.addEventListener("click", () => {
    getWindow().$e.route(route);
  });
  if (position !== void 0 && wrapper.children[position]) {
    wrapper.insertBefore(btn, wrapper.children[position]);
  } else {
    wrapper.appendChild(btn);
  }
}

// src/utils/get-legacy-elements-panel-component.ts
var import_utils2 = require("@elementor/utils");
var ComponentNotFoundError = (0, import_utils2.createError)({
  code: "e_component_not_found",
  message: "Elementor component not found"
});
function getLegacyElementsPanelComponent() {
  const eComponent = getWindow().$e.components.get(LEGACY_ELEMENTS_PANEL_COMPONENT_NAME);
  if (!eComponent) {
    throw new ComponentNotFoundError({ context: { componentId: LEGACY_ELEMENTS_PANEL_COMPONENT_NAME } });
  }
  return eComponent;
}

// src/inject-tab.ts
function injectTab({ id, label, component, position }) {
  registerTab({ id, label, component });
  (0, import_editor_v1_adapters2.__privateListenTo)((0, import_editor_v1_adapters2.v1ReadyEvent)(), () => {
    window.elementor?.hooks?.addFilter("panel/elements/regionViews", (regions, { elements }) => {
      regions[id] = { region: elements, view: createLegacyView() };
      return regions;
    });
  });
  (0, import_editor_v1_adapters2.__privateListenTo)((0, import_editor_v1_adapters2.windowEvent)("elementor/panel/init"), () => {
    getLegacyElementsPanelComponent().addTab(id, { title: label });
  });
  (0, import_editor_v1_adapters2.__privateListenTo)((0, import_editor_v1_adapters2.routeOpenEvent)(LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX), (e) => {
    const route = `${LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX}${id}`;
    createTabNavItem({
      id,
      label,
      route,
      isActive: "route" in e && e.route === route,
      position
    });
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  init,
  injectTab,
  registerTab
});
//# sourceMappingURL=index.js.map