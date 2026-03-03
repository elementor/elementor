// src/init.ts
import { register } from "@elementor/editor-elements-panel-notice";

// src/components/atomic-elements-promo.tsx
import * as React from "react";
import { useCallback as useCallback2 } from "react";
import { notify as notify2 } from "@elementor/editor-notifications";
import { ThemeProvider } from "@elementor/editor-ui";
import { httpService } from "@elementor/http-client";
import { Box, Button, Chip, CloseButton, Divider, Typography } from "@elementor/ui";
import { __ as __2 } from "@wordpress/i18n";

// src/hooks/use-promo-suppressed-message.ts
import { useCallback } from "react";
import { useSuppressedMessage } from "@elementor/editor-current-user";
import { notify } from "@elementor/editor-notifications";
import { __ } from "@wordpress/i18n";
var MESSAGE_KEY = "atomic_elements_promo";
var usePromoSuppressedMessage = () => {
  const [suppressed, setSuppressMessage] = useSuppressedMessage(MESSAGE_KEY);
  const toggleSuppressMessage = useCallback(() => {
    if (!suppressed) {
      setSuppressMessage();
      notify({
        type: "default",
        message: __("You can re-activate Atomic elements via Editor Settings > Atomic Editor", "elementor"),
        id: MESSAGE_KEY
      });
    }
  }, [suppressed, setSuppressMessage]);
  return [suppressed, toggleSuppressMessage];
};

// src/components/atomic-elements-promo.tsx
var PROMO_IMAGE = "https://assets.elementor.com/v4-promotion/v1/images/v4_chip_new.png";
function AtomicElementsPromo() {
  const [suppressed, toggleSuppressMessage] = usePromoSuppressedMessage();
  const activateAtomicElements = useCallback2(async () => {
    try {
      const response = await httpService().post("elementor/v1/operations/opt-in-v4");
      if (response.data.success) {
        window.location.reload();
      }
    } catch {
      notify2({
        type: "error",
        message: __2("Failed to activate Atomic elements", "elementor"),
        id: "atomic-elements-promo-error"
      });
    }
  }, []);
  if (suppressed) {
    return null;
  }
  return /* @__PURE__ */ React.createElement(ThemeProvider, null, /* @__PURE__ */ React.createElement(Divider, null), /* @__PURE__ */ React.createElement(
    Box,
    {
      sx: {
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column"
      }
    },
    /* @__PURE__ */ React.createElement(
      Box,
      {
        sx: {
          display: "flex",
          alignItems: "center",
          gap: 1,
          pl: 2.5,
          pr: 1,
          py: 1
        }
      },
      /* @__PURE__ */ React.createElement(
        Typography,
        {
          variant: "subtitle2",
          sx: { flexGrow: 1, gap: 1, display: "flex", alignItems: "center" }
        },
        __2("Atomic Elements", "elementor"),
        /* @__PURE__ */ React.createElement(Chip, { label: __2("New", "elementor"), size: "tiny", variant: "standard", color: "secondary" })
      ),
      /* @__PURE__ */ React.createElement(CloseButton, { slotProps: { icon: { fontSize: "small" } }, onClick: toggleSuppressMessage })
    ),
    /* @__PURE__ */ React.createElement(
      Box,
      {
        sx: {
          maxHeight: 205,
          mx: 2,
          overflow: "hidden"
        }
      },
      /* @__PURE__ */ React.createElement(
        Box,
        {
          component: "img",
          src: PROMO_IMAGE,
          alt: "",
          sx: {
            width: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block"
          }
        }
      )
    ),
    /* @__PURE__ */ React.createElement(Box, { sx: { pl: 2.5, pr: 4, pt: 2 } }, /* @__PURE__ */ React.createElement(Typography, { variant: "caption", color: "text.tertiary" }, __2(
      "The new generation of high-performance, flexible building blocks designed for precise styling and a unified experience.",
      "elementor"
    ))),
    /* @__PURE__ */ React.createElement(
      Box,
      {
        sx: {
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          pb: 1.5,
          pl: 2,
          pr: 2.5,
          pt: 1
        }
      },
      /* @__PURE__ */ React.createElement(
        Button,
        {
          variant: "text",
          size: "small",
          color: "secondary",
          href: "https://go.elementor.com/wp-dash-opt-in-v4-help-center/",
          target: "_blank"
        },
        __2("Learn more", "elementor")
      ),
      /* @__PURE__ */ React.createElement(Button, { variant: "contained", size: "small", color: "primary", onClick: activateAtomicElements }, __2("Unlock for free", "elementor"))
    )
  ), /* @__PURE__ */ React.createElement(Divider, null));
}

// src/init.ts
function init() {
  const { experimentalFeatures = {} } = window.elementorCommon?.config || {};
  const currentAtomicElementsExperimentState = experimentalFeatures?.e_atomic_elements;
  const currentContainerExperimentState = experimentalFeatures?.container;
  if (!currentAtomicElementsExperimentState && currentContainerExperimentState) {
    register(AtomicElementsPromo);
  }
}
export {
  AtomicElementsPromo,
  init
};
//# sourceMappingURL=index.mjs.map