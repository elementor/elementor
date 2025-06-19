// src/handlers-registry.ts
var handlers = /* @__PURE__ */ new Map();
var register = ({ elementType, id, callback }) => {
  if (!handlers.has(elementType)) {
    handlers.set(elementType, /* @__PURE__ */ new Map());
  }
  if (!handlers.get(elementType)?.has(id)) {
    handlers.get(elementType)?.set(id, callback);
  }
};
var unregister = ({ elementType, id }) => {
  if (!handlers.has(elementType)) {
    return;
  }
  if (id) {
    handlers.get(elementType)?.delete(id);
    if (handlers.get(elementType)?.size === 0) {
      handlers.delete(elementType);
    }
  } else {
    handlers.delete(elementType);
  }
};

// src/lifecycle-events.ts
var unmountCallbacks = /* @__PURE__ */ new Map();
var onElementRender = ({
  element,
  elementType,
  elementId
}) => {
  const controller = new AbortController();
  const manualUnmount = [];
  if (!handlers.has(elementType)) {
    return;
  }
  Array.from(handlers.get(elementType)?.values() ?? []).forEach((handler) => {
    const unmount = handler({ element, signal: controller.signal });
    if (typeof unmount === "function") {
      manualUnmount.push(unmount);
    }
  });
  if (!unmountCallbacks.has(elementType)) {
    unmountCallbacks.set(elementType, /* @__PURE__ */ new Map());
  }
  unmountCallbacks.get(elementType)?.set(elementId, () => {
    controller.abort();
    manualUnmount.forEach((callback) => callback());
  });
};
var onElementDestroy = ({ elementType, elementId }) => {
  const unmount = unmountCallbacks.get(elementType)?.get(elementId);
  if (!unmount) {
    return;
  }
  unmount();
  unmountCallbacks.get(elementType)?.delete(elementId);
  if (unmountCallbacks.get(elementType)?.size === 0) {
    unmountCallbacks.delete(elementType);
  }
};

// src/init.ts
function init() {
  window.addEventListener("elementor/element/render", (_event) => {
    const event = _event;
    const { id, type, element } = event.detail;
    onElementDestroy({ elementType: type, elementId: id });
    onElementRender({ element, elementType: type, elementId: id });
  });
  window.addEventListener("elementor/element/destroy", (_event) => {
    const event = _event;
    const { id, type } = event.detail;
    onElementDestroy({ elementType: type, elementId: id });
  });
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-e-type]").forEach((element) => {
      const el = element;
      const { eType, id } = el.dataset;
      if (!eType || !id) {
        return;
      }
      window.dispatchEvent(
        new CustomEvent("elementor/element/render", {
          detail: {
            id,
            type: eType,
            element
          }
        })
      );
    });
  });
}
export {
  init,
  register,
  unregister
};
//# sourceMappingURL=index.mjs.map