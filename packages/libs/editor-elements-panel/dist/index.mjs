// src/init.ts
import { injectIntoTop } from "@elementor/editor";

// src/components/elements-panel-tab.tsx
import * as React from "react";
import { Portal } from "@elementor/ui";

// src/hooks/use-active-tab.ts
import {
  __privateUseListenTo as useListenTo,
  routeCloseEvent,
  routeOpenEvent,
  v1ReadyEvent
} from "@elementor/editor-v1-adapters";

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
  return useListenTo(
    [
      v1ReadyEvent(),
      routeOpenEvent(LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX),
      routeCloseEvent(LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX)
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
  return TabComponent && container ? /* @__PURE__ */ React.createElement(Portal, { container }, /* @__PURE__ */ React.createElement(TabComponent, null)) : null;
}

// src/init.ts
function init() {
  injectIntoTop({
    id: "editor-elements-panel-tab",
    component: ElementsPanelTab
  });
}

// src/inject-tab.ts
import {
  __privateListenTo as listenTo,
  routeOpenEvent as routeOpenEvent2,
  v1ReadyEvent as v1ReadyEvent2,
  windowEvent
} from "@elementor/editor-v1-adapters";

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
import { createError } from "@elementor/utils";
var NAVIGATION_WRAPPER_ID = "elementor-panel-elements-navigation";
var ElementsPanelWrapperElementNotFoundError = createError({
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
import { createError as createError2 } from "@elementor/utils";
var ComponentNotFoundError = createError2({
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
  listenTo(v1ReadyEvent2(), () => {
    window.elementor?.hooks?.addFilter("panel/elements/regionViews", (regions, { elements }) => {
      regions[id] = { region: elements, view: createLegacyView() };
      return regions;
    });
  });
  listenTo(windowEvent("elementor/panel/init"), () => {
    getLegacyElementsPanelComponent().addTab(id, { title: label });
  });
  listenTo(routeOpenEvent2(LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX), (e) => {
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
export {
  init,
  injectTab,
  registerTab
};
//# sourceMappingURL=index.mjs.map