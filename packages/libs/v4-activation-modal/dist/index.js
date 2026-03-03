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
  App: () => App,
  FeatureItem: () => FeatureItem,
  ModalFooter: () => ModalFooter,
  ModalHeader: () => ModalHeader,
  V4ActivationModal: () => V4ActivationModal,
  init: () => init,
  useAutoplayCarousel: () => useAutoplayCarousel
});
module.exports = __toCommonJS(index_exports);

// src/components/v4-activation-modal.tsx
var React = __toESM(require("react"));
var import_icons = require("@elementor/icons");
var import_ui = require("@elementor/ui");
var V4ActivationModal = ({
  onClose,
  header,
  children,
  footer,
  rightPanel,
  rightPanelBackgroundColor = "transparent"
}) => {
  return /* @__PURE__ */ React.createElement(
    import_ui.Dialog,
    {
      open: true,
      fullWidth: true,
      maxWidth: "lg",
      onClose,
      PaperProps: {
        sx: {
          maxHeight: 680,
          minHeight: 480,
          height: "100%"
        }
      },
      sx: {
        zIndex: 99999
      }
    },
    /* @__PURE__ */ React.createElement(
      import_ui.DialogContent,
      {
        sx: {
          p: 0,
          height: "100%",
          position: "relative"
        }
      },
      /* @__PURE__ */ React.createElement(
        import_ui.IconButton,
        {
          onClick: onClose,
          sx: {
            position: "absolute",
            right: 16,
            top: 16,
            zIndex: 3
          }
        },
        /* @__PURE__ */ React.createElement(import_icons.XIcon, { sx: { color: "common.black" } })
      ),
      /* @__PURE__ */ React.createElement(import_ui.Stack, { direction: "row", width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement(
        import_ui.Stack,
        {
          justifyContent: "space-between",
          alignItems: "flex-start",
          sx: {
            flexShrink: 1,
            flexBasis: "41%",
            py: 5,
            px: 4
          },
          gap: 3
        },
        header,
        children,
        footer
      ), /* @__PURE__ */ React.createElement(
        import_ui.Box,
        {
          sx: {
            flexShrink: 1,
            flexBasis: "59%",
            display: "flex",
            position: "relative",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: rightPanelBackgroundColor
          }
        },
        rightPanel
      ))
    )
  );
};

// src/components/app-content.tsx
var React6 = __toESM(require("react"));
var import_ui6 = require("@elementor/ui");
var import_i18n = require("@wordpress/i18n");

// src/hooks/use-autoplay-carousel.ts
var import_react = require("react");
var DEFAULT_INTERVAL_MS = 3e3;
function useAutoplayCarousel(items, intervalMs = DEFAULT_INTERVAL_MS) {
  const [selectedItem, setSelectedItem] = (0, import_react.useState)(items[0]);
  const [isAutoPlaying, setIsAutoPlaying] = (0, import_react.useState)(true);
  const advanceToNextItem = (0, import_react.useCallback)(() => {
    setSelectedItem((current) => {
      const currentIndex = items.indexOf(current);
      const nextIndex = (currentIndex + 1) % items.length;
      return items[nextIndex];
    });
  }, [items]);
  (0, import_react.useEffect)(() => {
    if (!isAutoPlaying) {
      return;
    }
    const id = setInterval(advanceToNextItem, intervalMs);
    return () => clearInterval(id);
  }, [isAutoPlaying, advanceToNextItem, intervalMs]);
  const selectItem = (0, import_react.useCallback)((item) => {
    setSelectedItem(item);
    setIsAutoPlaying(false);
  }, []);
  return { selectedItem, selectItem };
}

// src/components/feature-item.tsx
var React2 = __toESM(require("react"));
var import_ui2 = require("@elementor/ui");
var FeatureItem = ({ title, subtitle, selected, onClick }) => {
  return /* @__PURE__ */ React2.createElement(
    import_ui2.Box,
    {
      onClick,
      sx: {
        pl: 2,
        pr: 1,
        cursor: "pointer",
        borderLeft: "3px solid",
        borderColor: selected ? "common.black" : "transparent",
        transition: (theme) => theme.transitions.create(["border-color"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        })
      }
    },
    /* @__PURE__ */ React2.createElement(import_ui2.Typography, { variant: "subtitle2", color: "text.primary" }, title),
    /* @__PURE__ */ React2.createElement(import_ui2.Typography, { variant: "body2", color: "text.tertiary" }, subtitle)
  );
};

// src/components/modal-footer.tsx
var React3 = __toESM(require("react"));
var import_ui3 = require("@elementor/ui");
var ModalFooter = ({ helpText, learnMoreText, learnMoreUrl }) => {
  return /* @__PURE__ */ React3.createElement(import_ui3.Stack, { direction: "row", alignItems: "center", gap: 1.5 }, /* @__PURE__ */ React3.createElement(import_ui3.Typography, { variant: "body2", color: "text.secondary" }, helpText), /* @__PURE__ */ React3.createElement(
    import_ui3.Link,
    {
      href: learnMoreUrl,
      target: "_blank",
      variant: "body2",
      color: "info.main",
      sx: { textDecoration: "none" }
    },
    learnMoreText
  ));
};

// src/components/modal-header.tsx
var React4 = __toESM(require("react"));
var import_ui4 = require("@elementor/ui");
var ModalHeader = ({ title, subtitle }) => {
  return /* @__PURE__ */ React4.createElement(import_ui4.Stack, { gap: 1 }, /* @__PURE__ */ React4.createElement(import_ui4.Typography, { variant: "h4", color: "text.primary", maxWidth: 320 }, title), /* @__PURE__ */ React4.createElement(import_ui4.Typography, { variant: "body2", color: "text.primary" }, subtitle));
};

// src/components/modal-image.tsx
var React5 = __toESM(require("react"));
var import_react2 = require("react");
var import_ui5 = require("@elementor/ui");
var ModalImage = ({ id, images }) => {
  const [loadedIds, setLoadedIds] = (0, import_react2.useState)({});
  const showSkeleton = (0, import_react2.useMemo)(() => images.some((img) => !loadedIds[img.id]), [images, loadedIds]);
  const markLoaded = (key) => setLoadedIds((prev) => ({ ...prev, [key]: true }));
  return /* @__PURE__ */ React5.createElement(React5.Fragment, null, showSkeleton && /* @__PURE__ */ React5.createElement(import_ui5.Skeleton, { variant: "rectangular", width: "80%", height: "60%" }), images.map(({ id: key, src }) => /* @__PURE__ */ React5.createElement(
    import_ui5.Box,
    {
      key,
      component: "img",
      src,
      alt: `Modal image ${key}`,
      onLoad: () => markLoaded(key),
      onError: () => markLoaded(key),
      sx: {
        display: showSkeleton ? "none" : "block",
        width: key === id ? "100%" : "0",
        height: key === id ? "100%" : "0",
        opacity: key === id ? 1 : 0,
        objectFit: "cover",
        objectPosition: "left top",
        transition: (theme) => theme.transitions.create(["opacity"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        })
      }
    }
  )));
};

// src/components/app-content.tsx
var BACKGROUND_COLOR = "#FFDFF9";
var LEARN_MORE_URL = "https://go.elementor.com/wp-dash-opt-in-v4-help-center/";
var FEATURE_ITEMS = [
  {
    id: "combineWidgets",
    title: (0, import_i18n.__)("Combine legacy Widgets & new Elements", "elementor"),
    subtitle: (0, import_i18n.__)("Current and new workflows work together on the same page.", "elementor"),
    image: ""
  },
  {
    id: "designSystems",
    title: (0, import_i18n.__)("Build reusable design systems", "elementor"),
    subtitle: (0, import_i18n.__)("Classes, Variables & Components give a clear path for scale.", "elementor"),
    image: ""
  },
  {
    id: "consistentStyling",
    title: (0, import_i18n.__)("Consistent styling experience", "elementor"),
    subtitle: (0, import_i18n.__)("A unified Style tab with full control over responsive design.", "elementor"),
    image: ""
  },
  {
    id: "performance",
    title: (0, import_i18n.__)("Unparalleled performance", "elementor"),
    subtitle: (0, import_i18n.__)("Clean code and a light CSS footprint with single-div wrappers.", "elementor"),
    image: ""
  }
];
var FEATURE_IDS = FEATURE_ITEMS.map((item) => item.id);
function AppContent({ onClose }) {
  const { selectedItem, selectItem } = useAutoplayCarousel(FEATURE_IDS);
  return /* @__PURE__ */ React6.createElement(
    V4ActivationModal,
    {
      onClose,
      rightPanelBackgroundColor: BACKGROUND_COLOR,
      rightPanel: /* @__PURE__ */ React6.createElement(
        ModalImage,
        {
          id: selectedItem,
          images: FEATURE_ITEMS.map(({ id, image }) => ({ id, src: image }))
        }
      ),
      header: /* @__PURE__ */ React6.createElement(
        ModalHeader,
        {
          title: (0, import_i18n.__)("Welcome to the future of Elementor!", "elementor"),
          subtitle: (0, import_i18n.__)(
            "You're now using The Atomic Editor, a new architectural foundation that will continue to evolve with more features and capabilities.",
            "elementor"
          )
        }
      ),
      footer: /* @__PURE__ */ React6.createElement(
        ModalFooter,
        {
          helpText: (0, import_i18n.__)("Need help getting started?", "elementor"),
          learnMoreText: (0, import_i18n.__)("Learn more", "elementor"),
          learnMoreUrl: LEARN_MORE_URL
        }
      )
    },
    /* @__PURE__ */ React6.createElement(import_ui6.Stack, { gap: 2 }, FEATURE_ITEMS.map((item) => /* @__PURE__ */ React6.createElement(
      FeatureItem,
      {
        key: item.id,
        title: item.title,
        subtitle: item.subtitle,
        selected: item.id === selectedItem,
        onClick: () => selectItem(item.id)
      }
    )))
  );
}

// src/app.tsx
var React7 = __toESM(require("react"));
var import_react3 = require("react");
var import_ui7 = require("@elementor/ui");
function App() {
  const [isOpen, setIsOpen] = (0, import_react3.useState)(true);
  const handleClose = (0, import_react3.useCallback)(() => {
    setIsOpen(false);
  }, []);
  return /* @__PURE__ */ React7.createElement(import_ui7.DirectionProvider, { rtl: document.dir === "rtl" }, /* @__PURE__ */ React7.createElement(import_ui7.LocalizationProvider, null, /* @__PURE__ */ React7.createElement(import_ui7.ThemeProvider, { colorScheme: "light", palette: "unstable" }, isOpen && /* @__PURE__ */ React7.createElement(AppContent, { onClose: handleClose }))));
}

// src/init.tsx
var React8 = __toESM(require("react"));
var import_client = require("react-dom/client");
var ROOT_ELEMENT_ID = "e-v4-opt-in-welcome";
function init() {
  const rootElement = getOrCreateRootElement();
  (0, import_client.createRoot)(rootElement).render(/* @__PURE__ */ React8.createElement(App, null));
}
function getOrCreateRootElement() {
  const existing = document.getElementById(ROOT_ELEMENT_ID);
  if (existing) {
    return existing;
  }
  const el = document.createElement("div");
  el.id = ROOT_ELEMENT_ID;
  document.body.appendChild(el);
  return el;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  App,
  FeatureItem,
  ModalFooter,
  ModalHeader,
  V4ActivationModal,
  init,
  useAutoplayCarousel
});
//# sourceMappingURL=index.js.map