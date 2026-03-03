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
  register: () => register
});
module.exports = __toCommonJS(index_exports);

// src/init.tsx
var React2 = __toESM(require("react"));
var import_editor = require("@elementor/editor");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");

// src/components/notice-portal.tsx
var React = __toESM(require("react"));
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var import_ui = require("@elementor/ui");
var NOTICE_AREA_ID = "elementor-panel-elements-notice-area";
var ELEMENTS_PANEL_ROUTE_PREFIX = "panel/elements/";
function NoticePortal({ component: Component }) {
  const container = (0, import_editor_v1_adapters.__privateUseListenTo)(
    [(0, import_editor_v1_adapters.v1ReadyEvent)(), (0, import_editor_v1_adapters.routeOpenEvent)(ELEMENTS_PANEL_ROUTE_PREFIX)],
    () => document.getElementById(NOTICE_AREA_ID)
  );
  return container ? /* @__PURE__ */ React.createElement(import_ui.Portal, { container }, /* @__PURE__ */ React.createElement(Component, null)) : null;
}

// src/utils/create-notice-view.ts
function createNoticeView() {
  return window.Marionette?.CompositeView.extend({
    template: `<div></div>`
  });
}

// src/init.tsx
function register(Component) {
  (0, import_editor.injectIntoTop)({
    id: "editor-elements-panel-notice",
    component: () => /* @__PURE__ */ React2.createElement(NoticePortal, { component: Component })
  });
  (0, import_editor_v1_adapters2.__privateListenTo)((0, import_editor_v1_adapters2.v1ReadyEvent)(), () => {
    window.elementor?.hooks?.addFilter(
      "panel/elements/regionViews",
      (regionViews, { notice }) => {
        regionViews.notice = {
          region: notice,
          view: createNoticeView()
        };
        return regionViews;
      }
    );
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  register
});
//# sourceMappingURL=index.js.map