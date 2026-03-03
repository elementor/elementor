// src/components/v4-activation-modal.tsx
import * as React from "react";
import { XIcon } from "@elementor/icons";
import { Box, Dialog, DialogContent, IconButton, Stack } from "@elementor/ui";
var V4ActivationModal = ({
  onClose,
  header,
  children,
  footer,
  rightPanel,
  rightPanelBackgroundColor = "transparent"
}) => {
  return /* @__PURE__ */ React.createElement(
    Dialog,
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
      DialogContent,
      {
        sx: {
          p: 0,
          height: "100%",
          position: "relative"
        }
      },
      /* @__PURE__ */ React.createElement(
        IconButton,
        {
          onClick: onClose,
          sx: {
            position: "absolute",
            right: 16,
            top: 16,
            zIndex: 3
          }
        },
        /* @__PURE__ */ React.createElement(XIcon, { sx: { color: "common.black" } })
      ),
      /* @__PURE__ */ React.createElement(Stack, { direction: "row", width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement(
        Stack,
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
        Box,
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
import * as React6 from "react";
import { Stack as Stack4 } from "@elementor/ui";
import { __ } from "@wordpress/i18n";

// src/hooks/use-autoplay-carousel.ts
import { useCallback, useEffect, useState } from "react";
var DEFAULT_INTERVAL_MS = 3e3;
function useAutoplayCarousel(items, intervalMs = DEFAULT_INTERVAL_MS) {
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const advanceToNextItem = useCallback(() => {
    setSelectedItem((current) => {
      const currentIndex = items.indexOf(current);
      const nextIndex = (currentIndex + 1) % items.length;
      return items[nextIndex];
    });
  }, [items]);
  useEffect(() => {
    if (!isAutoPlaying) {
      return;
    }
    const id = setInterval(advanceToNextItem, intervalMs);
    return () => clearInterval(id);
  }, [isAutoPlaying, advanceToNextItem, intervalMs]);
  const selectItem = useCallback((item) => {
    setSelectedItem(item);
    setIsAutoPlaying(false);
  }, []);
  return { selectedItem, selectItem };
}

// src/components/feature-item.tsx
import * as React2 from "react";
import { Box as Box2, Typography } from "@elementor/ui";
var FeatureItem = ({ title, subtitle, selected, onClick }) => {
  return /* @__PURE__ */ React2.createElement(
    Box2,
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
    /* @__PURE__ */ React2.createElement(Typography, { variant: "subtitle2", color: "text.primary" }, title),
    /* @__PURE__ */ React2.createElement(Typography, { variant: "body2", color: "text.tertiary" }, subtitle)
  );
};

// src/components/modal-footer.tsx
import * as React3 from "react";
import { Link, Stack as Stack2, Typography as Typography2 } from "@elementor/ui";
var ModalFooter = ({ helpText, learnMoreText, learnMoreUrl }) => {
  return /* @__PURE__ */ React3.createElement(Stack2, { direction: "row", alignItems: "center", gap: 1.5 }, /* @__PURE__ */ React3.createElement(Typography2, { variant: "body2", color: "text.secondary" }, helpText), /* @__PURE__ */ React3.createElement(
    Link,
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
import * as React4 from "react";
import { Stack as Stack3, Typography as Typography3 } from "@elementor/ui";
var ModalHeader = ({ title, subtitle }) => {
  return /* @__PURE__ */ React4.createElement(Stack3, { gap: 1 }, /* @__PURE__ */ React4.createElement(Typography3, { variant: "h4", color: "text.primary", maxWidth: 320 }, title), /* @__PURE__ */ React4.createElement(Typography3, { variant: "body2", color: "text.primary" }, subtitle));
};

// src/components/modal-image.tsx
import * as React5 from "react";
import { useMemo, useState as useState2 } from "react";
import { Box as Box3, Skeleton } from "@elementor/ui";
var ModalImage = ({ id, images }) => {
  const [loadedIds, setLoadedIds] = useState2({});
  const showSkeleton = useMemo(() => images.some((img) => !loadedIds[img.id]), [images, loadedIds]);
  const markLoaded = (key) => setLoadedIds((prev) => ({ ...prev, [key]: true }));
  return /* @__PURE__ */ React5.createElement(React5.Fragment, null, showSkeleton && /* @__PURE__ */ React5.createElement(Skeleton, { variant: "rectangular", width: "80%", height: "60%" }), images.map(({ id: key, src }) => /* @__PURE__ */ React5.createElement(
    Box3,
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
    title: __("Combine legacy Widgets & new Elements", "elementor"),
    subtitle: __("Current and new workflows work together on the same page.", "elementor"),
    image: ""
  },
  {
    id: "designSystems",
    title: __("Build reusable design systems", "elementor"),
    subtitle: __("Classes, Variables & Components give a clear path for scale.", "elementor"),
    image: ""
  },
  {
    id: "consistentStyling",
    title: __("Consistent styling experience", "elementor"),
    subtitle: __("A unified Style tab with full control over responsive design.", "elementor"),
    image: ""
  },
  {
    id: "performance",
    title: __("Unparalleled performance", "elementor"),
    subtitle: __("Clean code and a light CSS footprint with single-div wrappers.", "elementor"),
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
          title: __("Welcome to the future of Elementor!", "elementor"),
          subtitle: __(
            "You're now using The Atomic Editor, a new architectural foundation that will continue to evolve with more features and capabilities.",
            "elementor"
          )
        }
      ),
      footer: /* @__PURE__ */ React6.createElement(
        ModalFooter,
        {
          helpText: __("Need help getting started?", "elementor"),
          learnMoreText: __("Learn more", "elementor"),
          learnMoreUrl: LEARN_MORE_URL
        }
      )
    },
    /* @__PURE__ */ React6.createElement(Stack4, { gap: 2 }, FEATURE_ITEMS.map((item) => /* @__PURE__ */ React6.createElement(
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
import * as React7 from "react";
import { useCallback as useCallback2, useState as useState3 } from "react";
import { DirectionProvider, LocalizationProvider, ThemeProvider } from "@elementor/ui";
function App() {
  const [isOpen, setIsOpen] = useState3(true);
  const handleClose = useCallback2(() => {
    setIsOpen(false);
  }, []);
  return /* @__PURE__ */ React7.createElement(DirectionProvider, { rtl: document.dir === "rtl" }, /* @__PURE__ */ React7.createElement(LocalizationProvider, null, /* @__PURE__ */ React7.createElement(ThemeProvider, { colorScheme: "light", palette: "unstable" }, isOpen && /* @__PURE__ */ React7.createElement(AppContent, { onClose: handleClose }))));
}

// src/init.tsx
import * as React8 from "react";
import { createRoot } from "react-dom/client";
var ROOT_ELEMENT_ID = "e-v4-opt-in-welcome";
function init() {
  const rootElement = getOrCreateRootElement();
  createRoot(rootElement).render(/* @__PURE__ */ React8.createElement(App, null));
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
export {
  App,
  FeatureItem,
  ModalFooter,
  ModalHeader,
  V4ActivationModal,
  init,
  useAutoplayCarousel
};
//# sourceMappingURL=index.mjs.map