// src/locations.ts
import { createLocation } from "@elementor/locations";
var { Slot: TopSlot, inject: injectIntoTop } = createLocation();
var { Slot: LogicSlot, inject: injectIntoLogic } = createLocation();

// src/start.tsx
import * as React2 from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { __privateDispatchReadyEvent as dispatchReadyEvent } from "@elementor/editor-v1-adapters";
import { createQueryClient, QueryClientProvider } from "@elementor/query";
import { __createStore, __StoreProvider as StoreProvider } from "@elementor/store";
import { DirectionProvider, ThemeProvider } from "@elementor/ui";

// src/components/shell.tsx
import * as React from "react";
function Shell() {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(TopSlot, null), /* @__PURE__ */ React.createElement("div", { style: { display: "none" } }, /* @__PURE__ */ React.createElement(LogicSlot, null)));
}

// src/start.tsx
function start(domElement) {
  const store = __createStore();
  const queryClient = createQueryClient();
  dispatchReadyEvent();
  render2(
    /* @__PURE__ */ React2.createElement(StoreProvider, { store }, /* @__PURE__ */ React2.createElement(QueryClientProvider, { client: queryClient }, /* @__PURE__ */ React2.createElement(DirectionProvider, { rtl: window.document.dir === "rtl" }, /* @__PURE__ */ React2.createElement(ThemeProvider, null, /* @__PURE__ */ React2.createElement(Shell, null))))),
    domElement
  );
}
function render2(app, domElement) {
  let renderFn;
  try {
    const root = createRoot(domElement);
    renderFn = () => {
      root.render(app);
    };
  } catch {
    renderFn = () => {
      ReactDOM.render(app, domElement);
    };
  }
  renderFn();
}
export {
  injectIntoLogic,
  injectIntoTop,
  start
};
//# sourceMappingURL=index.mjs.map