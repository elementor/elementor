// src/utils/create-styles-repository.ts
var createStylesRepository = () => {
  const providers = [];
  const getProviders = () => {
    return providers.slice(0).sort((a, b) => a.priority > b.priority ? -1 : 1);
  };
  const register = (provider) => {
    providers.push(provider);
  };
  const all = (meta = {}) => {
    return getProviders().flatMap((provider) => provider.actions.all(meta));
  };
  const subscribe = (cb) => {
    const unsubscribes = providers.map((provider) => {
      return provider.subscribe(cb);
    });
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  };
  const getProviderByKey = (key) => {
    return providers.find((provider) => provider.getKey() === key);
  };
  return {
    all,
    register,
    subscribe,
    getProviders,
    getProviderByKey
  };
};

// src/styles-repository.ts
var stylesRepository = createStylesRepository();

// src/hooks/use-providers.ts
import { useEffect, useReducer } from "react";
function useProviders() {
  const [, rerender] = useReducer((prev) => !prev, false);
  useEffect(() => stylesRepository.subscribe(rerender), []);
  return stylesRepository.getProviders();
}

// src/hooks/use-get-styles-repository-create-action.ts
import { useMemo } from "react";

// src/hooks/use-user-styles-capability.ts
import { useCurrentUserCapabilities } from "@elementor/editor-current-user";
var DEFAULT_CAPABILITIES = {
  create: true,
  delete: true,
  update: true,
  updateProps: true
};
var useUserStylesCapability = () => {
  const { capabilities } = useCurrentUserCapabilities();
  const userCan = (providerKey) => {
    const provider = stylesRepository.getProviderByKey(providerKey);
    if (!provider?.capabilities) {
      return DEFAULT_CAPABILITIES;
    }
    return Object.entries(provider.capabilities).reduce(
      (acc, [key, capability]) => ({
        ...acc,
        [key]: capabilities?.includes(capability) ?? true
      }),
      DEFAULT_CAPABILITIES
    );
  };
  return { userCan };
};

// src/hooks/use-get-styles-repository-create-action.ts
function useGetStylesRepositoryCreateAction() {
  const { userCan } = useUserStylesCapability();
  return useMemo(() => {
    const createActions = stylesRepository.getProviders().map((provider) => {
      if (!provider.actions.create || !userCan(provider.getKey()).create) {
        return null;
      }
      return [provider, provider.actions.create];
    }).filter(Boolean);
    if (createActions.length === 1) {
      return createActions[0];
    } else if (createActions.length === 0) {
      return null;
    }
    throw new Error("Multiple providers with create action found in styles repository.");
  }, []);
}

// src/utils/validate-style-label.ts
import { z } from "@elementor/schema";
import { __ } from "@wordpress/i18n";

// src/providers/document-elements-styles-provider.ts
import {
  getCurrentDocumentId,
  getElements,
  getElementStyles,
  styleRerenderEvents,
  updateElementStyle
} from "@elementor/editor-elements";
import { __privateListenTo as listenTo } from "@elementor/editor-v1-adapters";

// src/errors.ts
import { createError } from "@elementor/utils";
var InvalidElementsStyleProviderMetaError = createError({
  code: "invalid_elements_style_provider_meta",
  message: "Invalid elements style provider meta."
});
var ActiveDocumentMustExistError = createError({
  code: "active_document_must_exist",
  message: "Active document must exist."
});

// src/utils/create-styles-provider.ts
var DEFAULT_LIMIT = 1e4;
var DEFAULT_PRIORITY = 10;
function createStylesProvider({
  key,
  priority = DEFAULT_PRIORITY,
  limit = DEFAULT_LIMIT,
  subscribe = () => () => {
  },
  labels,
  actions,
  capabilities
}) {
  return {
    getKey: typeof key === "string" ? () => key : key,
    priority,
    limit,
    capabilities,
    subscribe,
    labels: {
      singular: labels?.singular ?? null,
      plural: labels?.plural ?? null
    },
    actions: {
      all: actions.all,
      get: actions.get,
      resolveCssName: actions.resolveCssName ?? ((id) => id),
      create: actions.create,
      delete: actions.delete,
      update: actions.update,
      updateProps: actions.updateProps
    }
  };
}

// src/providers/document-elements-styles-provider.ts
var ELEMENTS_STYLES_PROVIDER_KEY_PREFIX = "document-elements-";
var ELEMENTS_STYLES_RESERVED_LABEL = "local";
var documentElementsStylesProvider = createStylesProvider({
  key: () => {
    const documentId = getCurrentDocumentId();
    if (!documentId) {
      throw new ActiveDocumentMustExistError();
    }
    return `${ELEMENTS_STYLES_PROVIDER_KEY_PREFIX}${documentId}`;
  },
  priority: 50,
  subscribe: (cb) => listenTo(styleRerenderEvents, cb),
  actions: {
    all: (meta = {}) => {
      let elements = getElements();
      if (isValidElementsMeta(meta)) {
        elements = elements.filter((element) => element.id === meta.elementId);
      }
      return elements.flatMap((element) => Object.values(element.model.get("styles") ?? {}));
    },
    get: (id, meta = {}) => {
      if (!isValidElementsMeta(meta)) {
        throw new InvalidElementsStyleProviderMetaError({ context: { meta } });
      }
      const styles = getElementStyles(meta.elementId) ?? {};
      return styles[id] ?? null;
    },
    updateProps: (args, meta = {}) => {
      if (!isValidElementsMeta(meta)) {
        throw new InvalidElementsStyleProviderMetaError({ context: { meta } });
      }
      updateElementStyle({
        elementId: meta.elementId,
        styleId: args.id,
        meta: args.meta,
        props: args.props
      });
    }
  }
});
function isValidElementsMeta(meta) {
  return "elementId" in meta && typeof meta.elementId === "string" && !!meta.elementId;
}

// src/utils/validate-style-label.ts
var NO_START_DIGIT_REGEX = /^(|[^0-9].*)$/;
var NO_SPACES_REGEX = /^\S*$/;
var NO_SPECIAL_CHARS_REGEX = /^(|[a-zA-Z0-9_-]+)$/;
var NO_DOUBLE_HYPHEN_START_REGEX = /^(?!--).*/;
var NO_HYPHEN_DIGIT_START_REGEX = /^(?!-[0-9])/;
var RESERVED_CLASS_NAMES = ["container"];
var schema = z.string().max(50, __("Class name is too long. Please keep it under 50 characters.", "elementor")).regex(NO_START_DIGIT_REGEX, __("Class names must start with a letter.", "elementor")).regex(NO_SPACES_REGEX, __("Class names can\u2019t contain spaces.", "elementor")).regex(
  NO_SPECIAL_CHARS_REGEX,
  __("Class names can only use letters, numbers, dashes (-), and underscores (_).", "elementor")
).regex(NO_DOUBLE_HYPHEN_START_REGEX, __("Double hyphens are reserved for custom properties.", "elementor")).regex(
  NO_HYPHEN_DIGIT_START_REGEX,
  __("Class names can\u2019t start with a hyphen followed by a number.", "elementor")
).refine((value) => !RESERVED_CLASS_NAMES.includes(value), {
  message: __("This name is reserved and can\u2019t be used. Try something more specific.", "elementor")
});
function validateStyleLabel(label, event) {
  const existingLabels = /* @__PURE__ */ new Set([
    ELEMENTS_STYLES_RESERVED_LABEL,
    ...stylesRepository.all().map((styleDef) => styleDef.label.toLowerCase())
  ]);
  const fullValidationEvent = ["create", "rename"].includes(event);
  const result = schema.refine((value) => !(fullValidationEvent && value.length < 2), {
    message: __("Class name is too short. Use at least 2 characters.", "elementor")
  }).refine((value) => !(fullValidationEvent && existingLabels.has(value)), {
    message: __("This class name already exists. Please choose a unique name.", "elementor")
  }).safeParse(label.toLowerCase());
  if (result.success) {
    return {
      isValid: true,
      errorMessage: null
    };
  }
  return {
    isValid: false,
    errorMessage: result.error.format()._errors[0]
  };
}

// src/utils/is-elements-styles-provider.ts
function isElementsStylesProvider(key) {
  return new RegExp(`^${ELEMENTS_STYLES_PROVIDER_KEY_PREFIX}\\d+$`).test(key);
}

// src/providers/element-base-styles-provider.ts
import { getWidgetsCache } from "@elementor/editor-elements";
var ELEMENTS_BASE_STYLES_PROVIDER_KEY = "element-base-styles";
var elementBaseStylesProvider = createStylesProvider({
  key: ELEMENTS_BASE_STYLES_PROVIDER_KEY,
  actions: {
    all() {
      const widgetsCache = getWidgetsCache();
      return Object.values(widgetsCache ?? {}).flatMap(
        (widget) => Object.values(widget.base_styles ?? {})
      );
    },
    get(id) {
      return this.all().find((style) => style.id === id) ?? null;
    }
  }
});

// src/init.ts
function init() {
  stylesRepository.register(documentElementsStylesProvider);
  stylesRepository.register(elementBaseStylesProvider);
}
export {
  ELEMENTS_BASE_STYLES_PROVIDER_KEY,
  ELEMENTS_STYLES_PROVIDER_KEY_PREFIX,
  ELEMENTS_STYLES_RESERVED_LABEL,
  createStylesProvider,
  init,
  isElementsStylesProvider,
  stylesRepository,
  useGetStylesRepositoryCreateAction,
  useProviders,
  useUserStylesCapability,
  validateStyleLabel
};
//# sourceMappingURL=index.mjs.map