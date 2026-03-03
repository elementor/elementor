// src/init.tsx
import * as React2 from "react";
import { injectIntoTop } from "@elementor/editor";
import { __privateListenTo as listenTo, v1ReadyEvent as v1ReadyEvent2 } from "@elementor/editor-v1-adapters";

// src/components/notice-portal.tsx
import * as React from "react";
import { __privateUseListenTo as useListenTo, routeOpenEvent, v1ReadyEvent } from "@elementor/editor-v1-adapters";
import { Portal } from "@elementor/ui";
var NOTICE_AREA_ID = "elementor-panel-elements-notice-area";
var ELEMENTS_PANEL_ROUTE_PREFIX = "panel/elements/";
function NoticePortal({ component: Component }) {
  const container = useListenTo(
    [v1ReadyEvent(), routeOpenEvent(ELEMENTS_PANEL_ROUTE_PREFIX)],
    () => document.getElementById(NOTICE_AREA_ID)
  );
  return container ? /* @__PURE__ */ React.createElement(Portal, { container }, /* @__PURE__ */ React.createElement(Component, null)) : null;
}

// src/utils/create-notice-view.ts
function createNoticeView() {
  return window.Marionette?.CompositeView.extend({
    template: `<div></div>`
  });
}

// src/init.tsx
function register(Component) {
  injectIntoTop({
    id: "editor-elements-panel-notice",
    component: () => /* @__PURE__ */ React2.createElement(NoticePortal, { component: Component })
  });
  listenTo(v1ReadyEvent2(), () => {
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
export {
  register
};
//# sourceMappingURL=index.mjs.map