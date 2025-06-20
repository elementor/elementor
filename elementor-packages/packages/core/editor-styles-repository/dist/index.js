"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ELEMENTS_BASE_STYLES_PROVIDER_KEY: () => ELEMENTS_BASE_STYLES_PROVIDER_KEY,
  ELEMENTS_STYLES_PROVIDER_KEY_PREFIX: () => ELEMENTS_STYLES_PROVIDER_KEY_PREFIX,
  ELEMENTS_STYLES_RESERVED_LABEL: () => ELEMENTS_STYLES_RESERVED_LABEL,
  createStylesProvider: () => createStylesProvider,
  init: () => init,
  isElementsStylesProvider: () => isElementsStylesProvider,
  stylesRepository: () => stylesRepository,
  useGetStylesRepositoryCreateAction: () => useGetStylesRepositoryCreateAction,
  useProviders: () => useProviders,
  useUserStylesCapability: () => useUserStylesCapability,
  validateStyleLabel: () => validateStyleLabel
});
module.exports = __toCommonJS(index_exports);

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
var import_react = require("react");
function useProviders() {
  const [, rerender] = (0, import_react.useReducer)((prev) => !prev, false);
  (0, import_react.useEffect)(() => stylesRepository.subscribe(rerender), []);
  return stylesRepository.getProviders();
}

// src/hooks/use-get-styles-repository-create-action.ts
var import_react2 = require("react");

// src/hooks/use-user-styles-capability.ts
var import_editor_current_user = require("@elementor/editor-current-user");
var DEFAULT_CAPABILITIES = {
  create: true,
  delete: true,
  update: true,
  updateProps: true
};
var useUserStylesCapability = () => {
  const { capabilities } = (0, import_editor_current_user.useCurrentUserCapabilities)();
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
  return (0, import_react2.useMemo)(() => {
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
var import_schema = require("@elementor/schema");
var import_i18n = require("@wordpress/i18n");

// src/providers/document-elements-styles-provider.ts
var import_editor_elements = require("@elementor/editor-elements");
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");

// src/errors.ts
var import_utils = require("@elementor/utils");
var InvalidElementsStyleProviderMetaError = (0, import_utils.createError)({
  code: "invalid_elements_style_provider_meta",
  message: "Invalid elements style provider meta."
});
var ActiveDocumentMustExistError = (0, import_utils.createError)({
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
    const documentId = (0, import_editor_elements.getCurrentDocumentId)();
    if (!documentId) {
      throw new ActiveDocumentMustExistError();
    }
    return `${ELEMENTS_STYLES_PROVIDER_KEY_PREFIX}${documentId}`;
  },
  priority: 50,
  subscribe: (cb) => (0, import_editor_v1_adapters.__privateListenTo)(import_editor_elements.styleRerenderEvents, cb),
  actions: {
    all: (meta = {}) => {
      let elements = (0, import_editor_elements.getElements)();
      if (isValidElementsMeta(meta)) {
        elements = elements.filter((element) => element.id === meta.elementId);
      }
      return elements.flatMap((element) => Object.values(element.model.get("styles") ?? {}));
    },
    get: (id, meta = {}) => {
      if (!isValidElementsMeta(meta)) {
        throw new InvalidElementsStyleProviderMetaError({ context: { meta } });
      }
      const styles = (0, import_editor_elements.getElementStyles)(meta.elementId) ?? {};
      return styles[id] ?? null;
    },
    updateProps: (args, meta = {}) => {
      if (!isValidElementsMeta(meta)) {
        throw new InvalidElementsStyleProviderMetaError({ context: { meta } });
      }
      (0, import_editor_elements.updateElementStyle)({
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
var schema = import_schema.z.string().max(50, (0, import_i18n.__)("Class name is too long. Please keep it under 50 characters.", "elementor")).regex(NO_START_DIGIT_REGEX, (0, import_i18n.__)("Class names must start with a letter.", "elementor")).regex(NO_SPACES_REGEX, (0, import_i18n.__)("Class names can\u2019t contain spaces.", "elementor")).regex(
  NO_SPECIAL_CHARS_REGEX,
  (0, import_i18n.__)("Class names can only use letters, numbers, dashes (-), and underscores (_).", "elementor")
).regex(NO_DOUBLE_HYPHEN_START_REGEX, (0, import_i18n.__)("Double hyphens are reserved for custom properties.", "elementor")).regex(
  NO_HYPHEN_DIGIT_START_REGEX,
  (0, import_i18n.__)("Class names can\u2019t start with a hyphen followed by a number.", "elementor")
).refine((value) => !RESERVED_CLASS_NAMES.includes(value), {
  message: (0, import_i18n.__)("This name is reserved and can\u2019t be used. Try something more specific.", "elementor")
});
function validateStyleLabel(label, event) {
  const existingLabels = /* @__PURE__ */ new Set([
    ELEMENTS_STYLES_RESERVED_LABEL,
    ...stylesRepository.all().map((styleDef) => styleDef.label.toLowerCase())
  ]);
  const fullValidationEvent = ["create", "rename"].includes(event);
  const result = schema.refine((value) => !(fullValidationEvent && value.length < 2), {
    message: (0, import_i18n.__)("Class name is too short. Use at least 2 characters.", "elementor")
  }).refine((value) => !(fullValidationEvent && existingLabels.has(value)), {
    message: (0, import_i18n.__)("This class name already exists. Please choose a unique name.", "elementor")
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
var import_editor_elements2 = require("@elementor/editor-elements");
var ELEMENTS_BASE_STYLES_PROVIDER_KEY = "element-base-styles";
var elementBaseStylesProvider = createStylesProvider({
  key: ELEMENTS_BASE_STYLES_PROVIDER_KEY,
  actions: {
    all() {
      const widgetsCache = (0, import_editor_elements2.getWidgetsCache)();
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=index.js.map