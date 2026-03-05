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
  BASE_EASINGS: () => BASE_EASINGS,
  BASE_EFFECTS: () => BASE_EFFECTS,
  BASE_REPLAY: () => BASE_REPLAY,
  BASE_TRIGGERS: () => BASE_TRIGGERS,
  EASING_OPTIONS: () => EASING_OPTIONS,
  EFFECT_OPTIONS: () => EFFECT_OPTIONS,
  ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX: () => ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX,
  EmptyState: () => EmptyState,
  InteractionsTab: () => InteractionsTab,
  REPLAY_OPTIONS: () => REPLAY_OPTIONS,
  TRIGGER_OPTIONS: () => TRIGGER_OPTIONS,
  buildDisplayLabel: () => buildDisplayLabel,
  convertTimeUnit: () => convertTimeUnit,
  createAnimationPreset: () => createAnimationPreset,
  createBoolean: () => createBoolean,
  createConfig: () => createConfig,
  createDefaultInteractionItem: () => createDefaultInteractionItem,
  createDefaultInteractions: () => createDefaultInteractions,
  createExcludedBreakpoints: () => createExcludedBreakpoints,
  createInteractionBreakpoints: () => createInteractionBreakpoints,
  createInteractionItem: () => createInteractionItem,
  createInteractionsProvider: () => createInteractionsProvider,
  createNumber: () => createNumber,
  createString: () => createString,
  createTimingConfig: () => createTimingConfig,
  extractBoolean: () => extractBoolean,
  extractExcludedBreakpoints: () => extractExcludedBreakpoints,
  extractSize: () => extractSize,
  extractString: () => extractString,
  formatSizeValue: () => formatSizeValue,
  generateTempInteractionId: () => generateTempInteractionId,
  getInteractionsConfig: () => getInteractionsConfig,
  init: () => init,
  interactionsRepository: () => interactionsRepository,
  isTempId: () => isTempId,
  parseSizeValue: () => parseSizeValue,
  registerInteractionsControl: () => registerInteractionsControl,
  resolveDirection: () => resolveDirection
});
module.exports = __toCommonJS(index_exports);

// src/components/empty-state.tsx
var React = __toESM(require("react"));
var import_icons = require("@elementor/icons");
var import_ui = require("@elementor/ui");
var import_i18n = require("@wordpress/i18n");
var EmptyState = ({ onCreateInteraction }) => {
  return /* @__PURE__ */ React.createElement(
    import_ui.Stack,
    {
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "text.secondary",
      sx: { p: 2.5, pt: 8, pb: 5.5 },
      gap: 1.5
    },
    /* @__PURE__ */ React.createElement(import_icons.SwipeIcon, { fontSize: "large" }),
    /* @__PURE__ */ React.createElement(import_ui.Typography, { align: "center", variant: "subtitle2" }, (0, import_i18n.__)("Animate elements with Interactions", "elementor")),
    /* @__PURE__ */ React.createElement(import_ui.Typography, { align: "center", variant: "caption", maxWidth: "170px" }, (0, import_i18n.__)(
      "Add entrance animations and effects triggered by user interactions such as page load or scroll.",
      "elementor"
    )),
    /* @__PURE__ */ React.createElement(import_ui.Button, { variant: "outlined", color: "secondary", size: "small", sx: { mt: 1 }, onClick: onCreateInteraction }, (0, import_i18n.__)("Create an interaction", "elementor"))
  );
};

// src/components/interactions-tab.tsx
var React11 = __toESM(require("react"));
var import_react9 = require("react");
var import_editor_elements2 = require("@elementor/editor-elements");
var import_session = require("@elementor/session");
var import_ui7 = require("@elementor/ui");

// src/contexts/interactions-context.tsx
var React2 = __toESM(require("react"));
var import_react = require("react");
var import_editor_elements = require("@elementor/editor-elements");
var InteractionsContext = (0, import_react.createContext)(null);
var DEFAULT_INTERACTIONS = {
  version: 1,
  items: []
};
var InteractionsProvider = ({ children, elementId }) => {
  const rawInteractions = (0, import_editor_elements.useElementInteractions)(elementId);
  (0, import_react.useEffect)(() => {
    window.dispatchEvent(new CustomEvent("elementor/element/update_interactions"));
  }, []);
  const interactions = rawInteractions ?? DEFAULT_INTERACTIONS;
  const setInteractions = (value) => {
    const normalizedValue = value && value.items?.length === 0 ? void 0 : value;
    (0, import_editor_elements.updateElementInteractions)({
      elementId,
      interactions: normalizedValue
    });
  };
  const playInteractions = (interactionId) => {
    (0, import_editor_elements.playElementInteractions)(elementId, interactionId);
  };
  const contextValue = {
    interactions,
    setInteractions,
    playInteractions
  };
  return /* @__PURE__ */ React2.createElement(InteractionsContext.Provider, { value: contextValue }, children);
};
var useInteractionsContext = () => {
  const context = (0, import_react.useContext)(InteractionsContext);
  if (!context) {
    throw new Error("useInteractionsContext must be used within InteractionsProvider");
  }
  return context;
};

// src/contexts/popup-state-context.tsx
var React3 = __toESM(require("react"));
var import_react2 = require("react");
var PopupStateContext = (0, import_react2.createContext)(void 0);
var PopupStateProvider = ({ children }) => {
  const [openByDefault, setOpenByDefault] = (0, import_react2.useState)(false);
  const triggerDefaultOpen = (0, import_react2.useCallback)(() => {
    setOpenByDefault(true);
  }, []);
  const resetDefaultOpen = (0, import_react2.useCallback)(() => {
    setOpenByDefault(false);
  }, []);
  return /* @__PURE__ */ React3.createElement(PopupStateContext.Provider, { value: { openByDefault, triggerDefaultOpen, resetDefaultOpen } }, children);
};

// src/components/interactions-list.tsx
var React10 = __toESM(require("react"));
var import_react8 = require("react");
var import_editor_controls5 = require("@elementor/editor-controls");
var import_icons2 = require("@elementor/icons");
var import_ui6 = require("@elementor/ui");
var import_i18n5 = require("@wordpress/i18n");

// src/contexts/interactions-item-context.tsx
var React4 = __toESM(require("react"));
var import_react3 = require("react");
var InteractionItemContext = (0, import_react3.createContext)(null);
function InteractionItemContextProvider({
  value,
  children
}) {
  return /* @__PURE__ */ React4.createElement(InteractionItemContext.Provider, { value }, children);
}
function useInteractionItemContext() {
  const context = (0, import_react3.useContext)(InteractionItemContext);
  if (!context) {
    throw new Error("useInteractionItemContext must be used within InteractionItemContextProvider");
  }
  return context;
}

// src/utils/prop-value-utils.ts
var import_editor_props = require("@elementor/editor-props");

// src/configs/time-constants.ts
var TIME_UNITS = ["s", "ms"];
var DEFAULT_TIME_UNIT = "ms";

// src/utils/size-transform-utils.ts
var SIZE_REGEX = /^(?:(-?\d*\.?\d+)([a-z%]+)|([a-z%]+))$/i;
var parseSizeValue = (value, allowedUnits, defaultValue, defaultUnit) => {
  if (typeof value === "number") {
    return {
      size: value,
      unit: defaultUnit
    };
  }
  const sizeValue = tryParse(value, allowedUnits, defaultUnit);
  if (sizeValue) {
    return sizeValue;
  }
  if (defaultValue) {
    const fallbackSize = tryParse(defaultValue, allowedUnits, defaultUnit);
    if (fallbackSize) {
      return fallbackSize;
    }
  }
  return createSizeValue(null, defaultUnit);
};
var tryParse = (value, allowedUnits, defaultUnit) => {
  if (typeof value === "number") {
    return createSizeValue(value, defaultUnit);
  }
  const match = value && value.match(SIZE_REGEX);
  if (!match) {
    if (value) {
      return {
        size: Number(value),
        unit: defaultUnit
      };
    }
    return null;
  }
  const size = match[1] ? parseFloat(match[1]) : null;
  const unit = match[2] || match[3];
  if (!allowedUnits.includes(unit)) {
    return null;
  }
  return createSizeValue(size, unit);
};
var formatSizeValue = ({ size, unit }) => {
  return `${size ?? ""}${unit}`;
};
var createSizeValue = (size, unit) => {
  return { size, unit };
};

// src/utils/get-interactions-config.ts
var DEFAULT_CONFIG = {
  constants: {
    defaultDuration: 600,
    defaultDelay: 0,
    slideDistance: 100,
    scaleStart: 0,
    defaultEasing: "easeIn",
    relativeTo: "viewport",
    end: 15,
    start: 85
  }
};
function getInteractionsConfig() {
  return window.ElementorInteractionsConfig || DEFAULT_CONFIG;
}

// src/utils/temp-id-utils.ts
var TEMP_ID_PREFIX = "temp-";
var TEMP_ID_REGEX = /^temp-[a-z0-9]+$/i;
function generateTempInteractionId() {
  return `${TEMP_ID_PREFIX}${Math.random().toString(36).substring(2, 11)}`;
}
function isTempId(id) {
  return !!id && TEMP_ID_REGEX.test(id);
}

// src/utils/prop-value-utils.ts
var createString = (value) => ({
  $$type: "string",
  value
});
var createNumber = (value) => ({
  $$type: "number",
  value
});
var createTimingConfig = (duration, delay) => ({
  $$type: "timing-config",
  value: {
    duration: import_editor_props.sizePropTypeUtil.create(parseSizeValue(duration, TIME_UNITS, void 0, DEFAULT_TIME_UNIT)),
    delay: import_editor_props.sizePropTypeUtil.create(parseSizeValue(delay, TIME_UNITS, void 0, DEFAULT_TIME_UNIT))
  }
});
var createBoolean = (value) => ({
  $$type: "boolean",
  value
});
var createConfig = ({
  replay,
  easing = "easeIn",
  relativeTo = "",
  start = 85,
  end = 15
}) => ({
  $$type: "config",
  value: {
    replay: createBoolean(replay),
    easing: createString(easing),
    relativeTo: createString(relativeTo),
    start: createSize(start, "%"),
    end: createSize(end, "%")
  }
});
var createSize = (value, defaultUnit, defaultValue) => {
  if (!value) {
    return;
  }
  return import_editor_props.sizePropTypeUtil.create(parseSizeValue(value, ["%"], defaultValue, defaultUnit));
};
var extractBoolean = (prop, fallback = false) => {
  return prop?.value ?? fallback;
};
var createExcludedBreakpoints = (breakpoints) => ({
  $$type: "excluded-breakpoints",
  value: breakpoints.map(createString)
});
var createInteractionBreakpoints = (excluded) => ({
  $$type: "interaction-breakpoints",
  value: {
    excluded: createExcludedBreakpoints(excluded)
  }
});
var extractExcludedBreakpoints = (breakpoints) => {
  return breakpoints?.value.excluded.value.map((bp) => bp.value) ?? [];
};
var createAnimationPreset = ({
  effect,
  type,
  direction,
  duration,
  delay,
  replay = false,
  easing = "easeIn",
  relativeTo,
  start,
  end,
  customEffects
}) => ({
  $$type: "animation-preset-props",
  value: {
    effect: createString(effect),
    custom_effect: customEffects,
    type: createString(type),
    direction: createString(direction ?? ""),
    timing_config: createTimingConfig(duration, delay),
    config: createConfig({
      replay,
      easing,
      relativeTo,
      start,
      end
    })
  }
});
var createInteractionItem = ({
  trigger,
  effect,
  type,
  direction,
  duration,
  delay,
  interactionId,
  replay = false,
  easing = "easeIn",
  relativeTo,
  start,
  end,
  excludedBreakpoints,
  customEffects
}) => ({
  $$type: "interaction-item",
  value: {
    ...interactionId && { interaction_id: createString(interactionId) },
    trigger: createString(trigger ?? ""),
    animation: createAnimationPreset({
      effect: effect ?? "",
      type: type ?? "",
      direction,
      duration: duration ?? 0,
      delay: delay ?? 0,
      replay,
      easing,
      relativeTo,
      start,
      end,
      customEffects
    }),
    ...excludedBreakpoints && excludedBreakpoints.length > 0 && {
      breakpoints: createInteractionBreakpoints(excludedBreakpoints)
    }
  }
});
var createDefaultInteractionItem = () => {
  const { constants } = getInteractionsConfig();
  return createInteractionItem({
    trigger: "load",
    effect: "fade",
    type: "in",
    duration: constants.defaultDuration,
    delay: constants.defaultDelay,
    replay: false,
    easing: constants.defaultEasing,
    interactionId: generateTempInteractionId()
  });
};
var createDefaultInteractions = () => ({
  version: 1,
  items: [createDefaultInteractionItem()]
});
var extractString = (prop, fallback = "") => {
  return prop?.value ?? fallback;
};
var extractSize = (prop, defaultValue) => {
  if (!prop?.value) {
    return defaultValue;
  }
  return formatSizeValue(prop.value);
};
var TRIGGER_LABELS = {
  load: "On page load",
  scrollIn: "Scroll into view",
  scrollOut: "Scroll out of view",
  scrollOn: "While scrolling"
};
var capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
var buildDisplayLabel = (item) => {
  const trigger = extractString(item.trigger);
  const effect = extractString(item.animation.value.effect);
  const type = extractString(item.animation.value.type);
  const triggerLabel = TRIGGER_LABELS[trigger] || capitalize(trigger);
  const effectLabel = capitalize(effect);
  const typeLabel = capitalize(type);
  return `${triggerLabel}: ${effectLabel} ${typeLabel}`;
};

// src/components/interactions-list-item.tsx
var React9 = __toESM(require("react"));
var import_react7 = require("react");
var import_ui5 = require("@elementor/ui");
var import_i18n4 = require("@wordpress/i18n");

// src/components/interaction-details.tsx
var React7 = __toESM(require("react"));
var import_react5 = require("react");
var import_editor_controls3 = require("@elementor/editor-controls");
var import_ui3 = require("@elementor/ui");
var import_i18n2 = require("@wordpress/i18n");

// src/interactions-controls-registry.ts
var controlsRegistry = /* @__PURE__ */ new Map();
function registerInteractionsControl({
  type,
  component,
  options
}) {
  controlsRegistry.set(type, { type, component, options });
}
function getInteractionsControl(type) {
  return controlsRegistry.get(type);
}

// src/utils/resolve-direction.ts
var resolveDirection = (hasDirection, newEffect, newDirection, currentDirection, currentEffect) => {
  if (newEffect === "slide" && !newDirection) {
    return "top";
  }
  if (currentEffect === "slide" && hasDirection) {
    return newDirection ?? "top";
  }
  if (hasDirection) {
    return newDirection;
  }
  return currentDirection;
};

// src/components/controls/time-frame-indicator.tsx
var React5 = __toESM(require("react"));
var import_react4 = require("react");
var import_editor_controls = require("@elementor/editor-controls");

// src/utils/time-conversion.ts
var UNIT_TO_MS = {
  ms: 1,
  s: 1e3
};
var convertTimeUnit = (value, from, to) => {
  return value * UNIT_TO_MS[from] / UNIT_TO_MS[to];
};

// src/components/controls/time-frame-indicator.tsx
function TimeFrameIndicator({
  value,
  onChange,
  defaultValue
}) {
  const sizeValue = parseSizeValue(value, TIME_UNITS, defaultValue, DEFAULT_TIME_UNIT);
  const prevUnitRef = (0, import_react4.useRef)(sizeValue.unit);
  const setValue = (0, import_react4.useCallback)(
    (size) => {
      const unitChanged = prevUnitRef.current !== size.unit;
      if (unitChanged) {
        const fromUnit = prevUnitRef.current;
        const toUnit = size.unit;
        size.size = convertTimeUnit(Number(size.size), fromUnit, toUnit);
        prevUnitRef.current = toUnit;
      }
      onChange(formatSizeValue(size));
    },
    [onChange]
  );
  const handleChange = (newValue) => {
    setValue(newValue);
  };
  const handleBlur = () => {
    if (!sizeValue.size) {
      setValue(parseSizeValue(defaultValue, TIME_UNITS, void 0, DEFAULT_TIME_UNIT));
    }
  };
  return /* @__PURE__ */ React5.createElement(
    import_editor_controls.UnstableSizeField,
    {
      units: TIME_UNITS,
      value: sizeValue,
      onChange: handleChange,
      onBlur: handleBlur,
      InputProps: {
        inputProps: {
          min: 0
        }
      }
    }
  );
}

// src/components/field.tsx
var React6 = __toESM(require("react"));
var import_editor_controls2 = require("@elementor/editor-controls");
var import_ui2 = require("@elementor/ui");
var Field = ({ label, children }) => {
  return /* @__PURE__ */ React6.createElement(import_ui2.Grid, { item: true, xs: 12, "aria-label": `${label} control` }, /* @__PURE__ */ React6.createElement(import_editor_controls2.PopoverGridContainer, null, /* @__PURE__ */ React6.createElement(import_ui2.Grid, { item: true, xs: 6 }, /* @__PURE__ */ React6.createElement(import_editor_controls2.ControlFormLabel, null, label)), /* @__PURE__ */ React6.createElement(import_ui2.Grid, { item: true, xs: 6 }, children)));
};

// src/components/interaction-details.tsx
var DEFAULT_VALUES = {
  trigger: "load",
  effect: "fade",
  type: "in",
  direction: "",
  duration: 600,
  delay: 0,
  replay: false,
  easing: "easeIn",
  relativeTo: "viewport",
  start: 85,
  end: 15
};
var TRIGGERS_WITHOUT_REPLAY = ["load", "scrollOn", "hover", "click"];
var controlVisibilityConfig = {
  replay: (values) => !TRIGGERS_WITHOUT_REPLAY.includes(values.trigger),
  custom: (values) => values.effect === "custom",
  effectType: (values) => values.effect !== "custom",
  direction: (values) => values.effect !== "custom",
  relativeTo: (values) => values.trigger === "scrollOn",
  start: (values) => values.trigger === "scrollOn",
  end: (values) => values.trigger === "scrollOn",
  duration: (values) => {
    const isRelativeToVisible = values.trigger === "scrollOn";
    return !isRelativeToVisible;
  },
  delay: (values) => {
    const isRelativeToVisible = values.trigger === "scrollOn";
    return !isRelativeToVisible;
  }
};
function useControlComponent(controlName, isVisible = true) {
  return (0, import_react5.useMemo)(() => {
    if (!isVisible) {
      return null;
    }
    return getInteractionsControl(controlName)?.component ?? null;
  }, [controlName, isVisible]);
}
var InteractionDetails = ({ interaction, onChange, onPlayInteraction }) => {
  const trigger = extractString(interaction.trigger, DEFAULT_VALUES.trigger);
  const effect = extractString(interaction.animation.value.effect, DEFAULT_VALUES.effect);
  const customEffects = interaction.animation.value.custom_effect;
  const type = extractString(interaction.animation.value.type, DEFAULT_VALUES.type);
  const direction = extractString(interaction.animation.value.direction, DEFAULT_VALUES.direction);
  const duration = extractSize(interaction.animation.value.timing_config.value.duration);
  const delay = extractSize(interaction.animation.value.timing_config.value.delay);
  const replay = extractBoolean(interaction.animation.value.config?.value.replay, DEFAULT_VALUES.replay);
  const easing = extractString(interaction.animation.value.config?.value.easing, DEFAULT_VALUES.easing);
  const relativeTo = extractString(interaction.animation.value.config?.value.relativeTo, DEFAULT_VALUES.relativeTo);
  const start = extractSize(interaction.animation.value.config?.value.start, DEFAULT_VALUES.start);
  const end = extractSize(interaction.animation.value.config?.value.end, DEFAULT_VALUES.end);
  const interactionValues = {
    trigger,
    effect,
    type,
    direction,
    duration,
    delay,
    easing,
    replay,
    relativeTo,
    start,
    end,
    customEffects
  };
  const TriggerControl = useControlComponent("trigger", true);
  const EffectControl = useControlComponent("effect");
  const ReplayControl = useControlComponent("replay", controlVisibilityConfig.replay(interactionValues));
  const RelativeToControl = useControlComponent(
    "relativeTo",
    controlVisibilityConfig.relativeTo(interactionValues)
  );
  const StartControl = useControlComponent("start", controlVisibilityConfig.start(interactionValues));
  const EndControl = useControlComponent("end", controlVisibilityConfig.end(interactionValues));
  const CustomEffectControl = useControlComponent(
    "customEffects",
    controlVisibilityConfig.custom(interactionValues)
  );
  const EffectTypeControl = useControlComponent(
    "effectType",
    controlVisibilityConfig.effectType(interactionValues)
  );
  const DirectionControl = useControlComponent("direction", controlVisibilityConfig.direction(interactionValues));
  const EasingControl = useControlComponent("easing");
  const containerRef = (0, import_react5.useRef)(null);
  const updateInteraction = (updates) => {
    const resolvedDirectionValue = resolveDirection(
      "direction" in updates,
      updates.effect,
      updates.direction,
      direction,
      effect
    );
    const updatedInteraction = {
      ...interaction,
      interaction_id: interaction.interaction_id,
      trigger: createString(updates.trigger ?? trigger),
      animation: createAnimationPreset({
        effect: updates.effect ?? effect,
        type: updates.type ?? type,
        direction: resolvedDirectionValue,
        duration: updates.duration ?? duration,
        delay: updates.delay ?? delay,
        replay: updates.replay ?? replay,
        easing: updates.easing ?? easing,
        relativeTo: updates.relativeTo ?? relativeTo,
        start: updates.start ?? start,
        end: updates.end ?? end,
        customEffects: updates.customEffects ?? customEffects
      })
    };
    onChange(updatedInteraction);
    const interactionId = extractString(updatedInteraction.interaction_id);
    setTimeout(() => {
      onPlayInteraction(interactionId);
    }, 0);
  };
  return /* @__PURE__ */ React7.createElement(import_ui3.Box, { ref: containerRef }, /* @__PURE__ */ React7.createElement(import_editor_controls3.PopoverContent, { p: 1.5 }, /* @__PURE__ */ React7.createElement(import_ui3.Grid, { container: true, spacing: 1.5 }, TriggerControl && /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("Trigger", "elementor") }, /* @__PURE__ */ React7.createElement(
    TriggerControl,
    {
      value: trigger,
      onChange: (v) => updateInteraction({ trigger: v })
    }
  )), ReplayControl && /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("Replay", "elementor") }, /* @__PURE__ */ React7.createElement(
    ReplayControl,
    {
      value: replay,
      onChange: (v) => updateInteraction({ replay: v }),
      disabled: true,
      anchorRef: containerRef
    }
  ))), /* @__PURE__ */ React7.createElement(import_ui3.Divider, null), /* @__PURE__ */ React7.createElement(import_ui3.Grid, { container: true, spacing: 1.5 }, EffectControl && /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("Effect", "elementor") }, /* @__PURE__ */ React7.createElement(EffectControl, { value: effect, onChange: (v) => updateInteraction({ effect: v }) })), CustomEffectControl && /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("Custom Effect", "elementor") }, /* @__PURE__ */ React7.createElement(
    CustomEffectControl,
    {
      value: customEffects,
      onChange: (v) => updateInteraction({ customEffects: v })
    }
  )), EffectTypeControl && /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("Type", "elementor") }, /* @__PURE__ */ React7.createElement(EffectTypeControl, { value: type, onChange: (v) => updateInteraction({ type: v }) })), DirectionControl && /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("Direction", "elementor") }, /* @__PURE__ */ React7.createElement(
    DirectionControl,
    {
      value: direction,
      onChange: (v) => updateInteraction({ direction: v }),
      interactionType: type
    }
  )), controlVisibilityConfig.duration(interactionValues) && /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("Duration", "elementor") }, /* @__PURE__ */ React7.createElement(
    TimeFrameIndicator,
    {
      value: String(duration),
      onChange: (v) => updateInteraction({ duration: v }),
      defaultValue: DEFAULT_VALUES.duration
    }
  )), controlVisibilityConfig.delay(interactionValues) && /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("Delay", "elementor") }, /* @__PURE__ */ React7.createElement(
    TimeFrameIndicator,
    {
      value: String(delay),
      onChange: (v) => updateInteraction({ delay: v }),
      defaultValue: DEFAULT_VALUES.delay
    }
  ))), controlVisibilityConfig.relativeTo(interactionValues) && RelativeToControl && /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(import_ui3.Divider, null), /* @__PURE__ */ React7.createElement(import_ui3.Grid, { container: true, spacing: 1.5 }, StartControl && /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("Start", "elementor") }, /* @__PURE__ */ React7.createElement(
    StartControl,
    {
      value: parseSizeValue(start, ["%"]).size?.toString() ?? "",
      onChange: (v) => updateInteraction({ start: v })
    }
  )), EndControl && /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("End", "elementor") }, /* @__PURE__ */ React7.createElement(
    EndControl,
    {
      value: parseSizeValue(end, ["%"]).size?.toString() ?? "",
      onChange: (v) => updateInteraction({ end: v })
    }
  )), /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("Relative To", "elementor") }, /* @__PURE__ */ React7.createElement(
    RelativeToControl,
    {
      value: relativeTo,
      onChange: (v) => updateInteraction({ relativeTo: v })
    }
  ))), /* @__PURE__ */ React7.createElement(import_ui3.Divider, null)), EasingControl && /* @__PURE__ */ React7.createElement(import_ui3.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React7.createElement(Field, { label: (0, import_i18n2.__)("Easing", "elementor") }, /* @__PURE__ */ React7.createElement(
    EasingControl,
    {
      value: easing,
      onChange: (v) => {
        updateInteraction({ easing: v });
      }
    }
  )))));
};

// src/components/interaction-settings.tsx
var React8 = __toESM(require("react"));
var import_react6 = require("react");
var import_editor_controls4 = require("@elementor/editor-controls");
var import_editor_responsive = require("@elementor/editor-responsive");
var import_ui4 = require("@elementor/ui");
var import_i18n3 = require("@wordpress/i18n");
var SIZE = "tiny";
var InteractionSettings = ({ interaction, onChange }) => {
  const breakpoints = (0, import_editor_responsive.useBreakpoints)();
  const availableBreakpoints = (0, import_react6.useMemo)(
    () => breakpoints.map((breakpoint) => ({ label: breakpoint.label, value: String(breakpoint.id) })),
    [breakpoints]
  );
  const [selectedBreakpoints, setSelectedBreakpoints] = (0, import_react6.useState)(() => {
    const excluded = extractExcludedBreakpoints(interaction.breakpoints).filter((excludedBreakpoint) => {
      return availableBreakpoints.some(({ value }) => value === excludedBreakpoint);
    });
    return availableBreakpoints.filter(({ value }) => {
      return !excluded.includes(value);
    });
  });
  const handleBreakpointChange = (0, import_react6.useCallback)(
    (_, newValue) => {
      setSelectedBreakpoints(newValue);
      const selectedValues = newValue.map((option) => option.value);
      const newExcluded = availableBreakpoints.filter((breakpoint) => !selectedValues.includes(breakpoint.value)).map((breakpoint) => breakpoint.value);
      const updatedInteraction = {
        ...interaction,
        ...newExcluded.length > 0 && {
          breakpoints: createInteractionBreakpoints(newExcluded)
        }
      };
      if (newExcluded.length === 0) {
        delete updatedInteraction.breakpoints;
      }
      onChange(updatedInteraction);
    },
    [interaction, availableBreakpoints, onChange]
  );
  return /* @__PURE__ */ React8.createElement(import_editor_controls4.PopoverContent, { p: 1.5 }, /* @__PURE__ */ React8.createElement(import_ui4.Grid, { container: true, spacing: 1.5 }, /* @__PURE__ */ React8.createElement(import_ui4.Grid, { item: true, xs: 12 }, /* @__PURE__ */ React8.createElement(import_ui4.Stack, { direction: "column", gap: 1 }, /* @__PURE__ */ React8.createElement(import_editor_controls4.ControlFormLabel, { sx: { width: "100%" } }, (0, import_i18n3.__)("Trigger on", "elementor")), /* @__PURE__ */ React8.createElement(
    import_ui4.Autocomplete,
    {
      fullWidth: true,
      multiple: true,
      value: selectedBreakpoints,
      onChange: handleBreakpointChange,
      size: SIZE,
      options: availableBreakpoints,
      isOptionEqualToValue: (option, value) => option.value === value.value,
      renderInput: (params) => /* @__PURE__ */ React8.createElement(import_ui4.TextField, { ...params }),
      renderTags: (values, getTagProps) => values.map((option, index) => {
        const { key, ...chipProps } = getTagProps({ index });
        return /* @__PURE__ */ React8.createElement(import_ui4.Chip, { key, size: SIZE, label: option.label, ...chipProps });
      })
    }
  )))));
};

// src/components/interactions-list-item.tsx
var InteractionsListItem = ({
  index,
  value: interaction
}) => {
  const { getTabsProps, getTabProps, getTabPanelProps } = (0, import_ui5.useTabs)("details");
  const context = useInteractionItemContext();
  const handleChange = (0, import_react7.useCallback)(
    (newInteractionValue) => {
      context?.onInteractionChange(index, newInteractionValue);
    },
    [context, index]
  );
  const handlePlayInteraction = (0, import_react7.useCallback)(
    (interactionId2) => {
      context?.onPlayInteraction(interactionId2);
    },
    [context]
  );
  const interactionId = extractString(interaction.value.interaction_id);
  return /* @__PURE__ */ React9.createElement(React9.Fragment, null, /* @__PURE__ */ React9.createElement(
    import_ui5.Tabs,
    {
      size: "small",
      variant: "fullWidth",
      "aria-label": (0, import_i18n4.__)("Interaction", "elementor"),
      ...getTabsProps()
    },
    /* @__PURE__ */ React9.createElement(import_ui5.Tab, { label: (0, import_i18n4.__)("Details", "elementor"), ...getTabProps("details") }),
    /* @__PURE__ */ React9.createElement(import_ui5.Tab, { label: (0, import_i18n4.__)("Settings", "elementor"), ...getTabProps("settings") })
  ), /* @__PURE__ */ React9.createElement(import_ui5.Divider, null), /* @__PURE__ */ React9.createElement(import_ui5.TabPanel, { sx: { p: 0 }, ...getTabPanelProps("details") }, /* @__PURE__ */ React9.createElement(
    InteractionDetails,
    {
      key: interactionId,
      interaction: interaction.value,
      onChange: handleChange,
      onPlayInteraction: handlePlayInteraction
    }
  )), /* @__PURE__ */ React9.createElement(import_ui5.TabPanel, { sx: { p: 0 }, ...getTabPanelProps("settings") }, /* @__PURE__ */ React9.createElement(
    InteractionSettings,
    {
      key: interactionId,
      interaction: interaction.value,
      onChange: handleChange
    }
  )));
};

// src/components/interactions-list.tsx
var MAX_NUMBER_OF_INTERACTIONS = 5;
function InteractionsList(props) {
  const { interactions, onSelectInteractions, onPlayInteraction, triggerCreateOnShowEmpty } = props;
  const hasInitializedRef = (0, import_react8.useRef)(false);
  const handleUpdateInteractions = (0, import_react8.useCallback)(
    (newInteractions) => {
      onSelectInteractions(newInteractions);
    },
    [onSelectInteractions]
  );
  (0, import_react8.useEffect)(() => {
    if (triggerCreateOnShowEmpty && !hasInitializedRef.current && (!interactions.items || interactions.items?.length === 0)) {
      hasInitializedRef.current = true;
      const newState = {
        version: 1,
        items: [createDefaultInteractionItem()]
      };
      handleUpdateInteractions(newState);
    }
  }, [triggerCreateOnShowEmpty, interactions.items, handleUpdateInteractions]);
  const isMaxNumberOfInteractionsReached = (0, import_react8.useMemo)(() => {
    return interactions.items?.length >= MAX_NUMBER_OF_INTERACTIONS;
  }, [interactions.items?.length]);
  const infotipContent = isMaxNumberOfInteractionsReached ? /* @__PURE__ */ React10.createElement(import_ui6.Alert, { color: "secondary", icon: /* @__PURE__ */ React10.createElement(import_icons2.InfoCircleFilledIcon, null), size: "small" }, /* @__PURE__ */ React10.createElement(import_ui6.AlertTitle, null, (0, import_i18n5.__)("Interactions", "elementor")), /* @__PURE__ */ React10.createElement(import_ui6.Box, { component: "span" }, (0, import_i18n5.__)(
    "You've reached the limit of 5 interactions for this element. Please remove an interaction before creating a new one.",
    "elementor"
  ))) : void 0;
  const handleRepeaterChange = (0, import_react8.useCallback)(
    (newItems) => {
      handleUpdateInteractions({
        ...interactions,
        items: newItems
      });
    },
    [interactions, handleUpdateInteractions]
  );
  const handleInteractionChange = (0, import_react8.useCallback)(
    (index, newInteractionValue) => {
      const newItems = structuredClone(interactions.items);
      newItems[index] = {
        $$type: "interaction-item",
        value: newInteractionValue
      };
      handleUpdateInteractions({
        ...interactions,
        items: newItems
      });
    },
    [interactions, handleUpdateInteractions]
  );
  const contextValue = (0, import_react8.useMemo)(
    () => ({
      onInteractionChange: handleInteractionChange,
      onPlayInteraction
    }),
    [handleInteractionChange, onPlayInteraction]
  );
  return /* @__PURE__ */ React10.createElement(InteractionItemContextProvider, { value: contextValue }, /* @__PURE__ */ React10.createElement(
    import_editor_controls5.Repeater,
    {
      openOnAdd: true,
      openItem: triggerCreateOnShowEmpty ? 0 : void 0,
      label: (0, import_i18n5.__)("Interactions", "elementor"),
      values: interactions.items,
      setValues: handleRepeaterChange,
      showDuplicate: false,
      showToggle: false,
      isSortable: false,
      disableAddItemButton: isMaxNumberOfInteractionsReached,
      addButtonInfotipContent: infotipContent,
      itemSettings: {
        initialValues: createDefaultInteractionItem(),
        Label: ({ value }) => buildDisplayLabel(value.value),
        Icon: () => null,
        Content: InteractionsListItem,
        actions: (value) => /* @__PURE__ */ React10.createElement(import_ui6.Tooltip, { key: "preview", placement: "top", title: (0, import_i18n5.__)("Preview", "elementor") }, /* @__PURE__ */ React10.createElement(
          import_ui6.IconButton,
          {
            "aria-label": (0, import_i18n5.__)("Play interaction", "elementor"),
            size: "tiny",
            onClick: () => onPlayInteraction(extractString(value.value.interaction_id))
          },
          /* @__PURE__ */ React10.createElement(import_icons2.PlayerPlayIcon, { fontSize: "tiny" })
        ))
      }
    }
  ));
}

// src/components/interactions-tab.tsx
var InteractionsTab = ({ elementId }) => {
  return /* @__PURE__ */ React11.createElement(PopupStateProvider, null, /* @__PURE__ */ React11.createElement(InteractionsTabContent, { elementId }));
};
function InteractionsTabContent({ elementId }) {
  const existingInteractions = (0, import_editor_elements2.useElementInteractions)(elementId);
  const firstInteractionState = (0, import_react9.useState)(false);
  const hasInteractions = existingInteractions?.items?.length || firstInteractionState[0];
  return /* @__PURE__ */ React11.createElement(import_session.SessionStorageProvider, { prefix: elementId }, hasInteractions ? /* @__PURE__ */ React11.createElement(InteractionsProvider, { elementId }, /* @__PURE__ */ React11.createElement(InteractionsContent, { firstInteractionState })) : /* @__PURE__ */ React11.createElement(
    EmptyState,
    {
      onCreateInteraction: () => {
        firstInteractionState[1](true);
      }
    }
  ));
}
function InteractionsContent({
  firstInteractionState
}) {
  const { interactions, setInteractions, playInteractions } = useInteractionsContext();
  const applyInteraction = (0, import_react9.useCallback)(
    (newInteractions) => {
      firstInteractionState[1](false);
      if (!newInteractions) {
        setInteractions(void 0);
        return;
      }
      setInteractions(newInteractions);
    },
    [setInteractions, firstInteractionState]
  );
  return /* @__PURE__ */ React11.createElement(import_ui7.Stack, { sx: { m: 1, p: 1.5 }, gap: 2 }, /* @__PURE__ */ React11.createElement(
    InteractionsList,
    {
      triggerCreateOnShowEmpty: firstInteractionState[0],
      interactions,
      onSelectInteractions: applyInteraction,
      onPlayInteraction: playInteractions
    }
  ));
}

// src/utils/create-interactions-repository.ts
var createInteractionsRepository = () => {
  const providers = [];
  const getProviders = () => {
    const sorted = providers.slice(0).sort((a, b) => a.priority > b.priority ? -1 : 1);
    return sorted;
  };
  const register = (provider) => {
    providers.push(provider);
  };
  const all = () => {
    return getProviders().flatMap((provider) => provider.actions.all());
  };
  const subscribe = (cb) => {
    const unsubscribes = providers.map((provider) => provider.subscribe(cb));
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  };
  const getProviderByKey = (key) => {
    return providers.find((provider) => {
      try {
        return provider.getKey() === key;
      } catch {
        return false;
      }
    });
  };
  return {
    all,
    register,
    subscribe,
    getProviders,
    getProviderByKey
  };
};

// src/interactions-repository.ts
var interactionsRepository = createInteractionsRepository();

// src/utils/create-interactions-provider.ts
var DEFAULT_PRIORITY = 10;
function createInteractionsProvider({
  key,
  priority = DEFAULT_PRIORITY,
  subscribe = () => () => {
  },
  actions
}) {
  return {
    getKey: typeof key === "string" ? () => key : key,
    priority,
    subscribe,
    actions: {
      all: actions.all
    }
  };
}

// src/providers/document-elements-interactions-provider.ts
var import_editor_elements3 = require("@elementor/editor-elements");
var import_editor_v1_adapters = require("@elementor/editor-v1-adapters");
var ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX = "document-elements-interactions-";
var documentElementsInteractionsProvider = createInteractionsProvider({
  key: () => {
    const documentId = (0, import_editor_elements3.getCurrentDocumentId)();
    if (!documentId) {
      const pendingKey = `${ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX}pending`;
      return pendingKey;
    }
    const key = `${ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX}${documentId}`;
    return key;
  },
  priority: 50,
  subscribe: (cb) => {
    return (0, import_editor_v1_adapters.__privateListenTo)([(0, import_editor_v1_adapters.windowEvent)("elementor/element/update_interactions")], () => cb());
  },
  actions: {
    all: () => {
      const elements = (0, import_editor_elements3.getElements)();
      const filtered = elements.filter((element) => {
        const interactions = (0, import_editor_elements3.getElementInteractions)(element.id);
        if (!interactions) {
          return false;
        }
        return interactions?.items?.length > 0;
      });
      return filtered.map((element) => {
        const interactions = (0, import_editor_elements3.getElementInteractions)(element.id);
        return {
          elementId: element.id,
          dataId: element.id,
          interactions: interactions || { version: 1, items: [] }
        };
      });
    }
  }
});

// src/components/controls/direction.tsx
var React12 = __toESM(require("react"));
var import_react10 = require("react");
var import_editor_controls6 = require("@elementor/editor-controls");
var import_icons3 = require("@elementor/icons");
var import_i18n6 = require("@wordpress/i18n");
function Direction({ value, onChange, interactionType }) {
  const options = (0, import_react10.useMemo)(() => {
    const isIn = interactionType === "in";
    return [
      {
        value: "top",
        label: isIn ? (0, import_i18n6.__)("From top", "elementor") : (0, import_i18n6.__)("To top", "elementor"),
        renderContent: ({ size }) => isIn ? /* @__PURE__ */ React12.createElement(import_icons3.ArrowDownSmallIcon, { fontSize: size }) : /* @__PURE__ */ React12.createElement(import_icons3.ArrowUpSmallIcon, { fontSize: size }),
        showTooltip: true
      },
      {
        value: "bottom",
        label: interactionType === "in" ? (0, import_i18n6.__)("From bottom", "elementor") : (0, import_i18n6.__)("To bottom", "elementor"),
        renderContent: ({ size }) => isIn ? /* @__PURE__ */ React12.createElement(import_icons3.ArrowUpSmallIcon, { fontSize: size }) : /* @__PURE__ */ React12.createElement(import_icons3.ArrowDownSmallIcon, { fontSize: size }),
        showTooltip: true
      },
      {
        value: "left",
        label: interactionType === "in" ? (0, import_i18n6.__)("From left", "elementor") : (0, import_i18n6.__)("To left", "elementor"),
        renderContent: ({ size }) => isIn ? /* @__PURE__ */ React12.createElement(import_icons3.ArrowRightIcon, { fontSize: size }) : /* @__PURE__ */ React12.createElement(import_icons3.ArrowLeftIcon, { fontSize: size }),
        showTooltip: true
      },
      {
        value: "right",
        label: interactionType === "in" ? (0, import_i18n6.__)("From right", "elementor") : (0, import_i18n6.__)("To right", "elementor"),
        renderContent: ({ size }) => isIn ? /* @__PURE__ */ React12.createElement(import_icons3.ArrowLeftIcon, { fontSize: size }) : /* @__PURE__ */ React12.createElement(import_icons3.ArrowRightIcon, { fontSize: size }),
        showTooltip: true
      }
    ];
  }, [interactionType]);
  return /* @__PURE__ */ React12.createElement(import_editor_controls6.ToggleButtonGroupUi, { items: options, exclusive: true, onChange, value });
}

// src/components/controls/easing.tsx
var React15 = __toESM(require("react"));
var import_i18n9 = require("@wordpress/i18n");

// src/ui/promotion-select.tsx
var React14 = __toESM(require("react"));
var import_react12 = require("react");
var import_editor_ui2 = require("@elementor/editor-ui");
var import_ui9 = require("@elementor/ui");
var import_i18n8 = require("@wordpress/i18n");

// src/ui/interactions-promotion-chip.tsx
var React13 = __toESM(require("react"));
var import_react11 = require("react");
var import_editor_ui = require("@elementor/editor-ui");
var import_ui8 = require("@elementor/ui");
var import_i18n7 = require("@wordpress/i18n");
var InteractionsPromotionChip = (0, import_react11.forwardRef)(
  ({ content, upgradeUrl, anchorRef }, ref) => {
    const [isOpen, setIsOpen] = (0, import_react11.useState)(false);
    (0, import_editor_ui.useCanvasClickHandler)(isOpen, () => setIsOpen(false));
    const toggle = () => setIsOpen((prev) => !prev);
    (0, import_react11.useImperativeHandle)(ref, () => ({ toggle }), []);
    const handleToggle = (e) => {
      e.stopPropagation();
      toggle();
    };
    return /* @__PURE__ */ React13.createElement(
      import_editor_ui.PromotionPopover,
      {
        open: isOpen,
        title: (0, import_i18n7.__)("Interactions", "elementor"),
        content,
        ctaText: (0, import_i18n7.__)("Upgrade now", "elementor"),
        ctaUrl: upgradeUrl,
        anchorRef,
        placement: anchorRef ? "right-start" : void 0,
        onClose: (e) => {
          e.stopPropagation();
          setIsOpen(false);
        }
      },
      /* @__PURE__ */ React13.createElement(
        import_ui8.Box,
        {
          onMouseDown: (e) => e.stopPropagation(),
          onClick: handleToggle,
          sx: { cursor: "pointer", display: "inline-flex", mr: 1 }
        },
        /* @__PURE__ */ React13.createElement(import_editor_ui.PromotionChip, null)
      )
    );
  }
);
InteractionsPromotionChip.displayName = "InteractionsPromotionChip";

// src/ui/promotion-select.tsx
function PromotionSelect({
  value,
  onChange,
  baseOptions,
  disabledOptions,
  promotionLabel,
  promotionContent,
  upgradeUrl
}) {
  const promotionRef = (0, import_react12.useRef)(null);
  const anchorRef = (0, import_react12.useRef)(null);
  return /* @__PURE__ */ React14.createElement(
    import_ui9.Select,
    {
      value,
      onChange: (e) => onChange?.(e.target.value),
      fullWidth: true,
      displayEmpty: true,
      size: "tiny",
      MenuProps: { disablePortal: true }
    },
    Object.entries(baseOptions).map(([key, label]) => /* @__PURE__ */ React14.createElement(import_editor_ui2.MenuListItem, { key, value: key }, label)),
    /* @__PURE__ */ React14.createElement(
      import_ui9.MenuSubheader,
      {
        ref: anchorRef,
        sx: {
          cursor: "pointer",
          color: "text.tertiary",
          fontWeight: "400",
          display: "flex",
          alignItems: "center"
        },
        onMouseDown: (e) => {
          e.stopPropagation();
          promotionRef.current?.toggle();
        }
      },
      promotionLabel ?? (0, import_i18n8.__)("PRO features", "elementor"),
      /* @__PURE__ */ React14.createElement(
        InteractionsPromotionChip,
        {
          content: promotionContent,
          upgradeUrl,
          ref: promotionRef,
          anchorRef
        }
      )
    ),
    Object.entries(disabledOptions).map(([key, label]) => /* @__PURE__ */ React14.createElement(import_editor_ui2.MenuListItem, { key, value: key, disabled: true, sx: { pl: 3 } }, label))
  );
}

// src/components/controls/easing.tsx
var EASING_OPTIONS = {
  easeIn: (0, import_i18n9.__)("Ease In", "elementor"),
  easeInOut: (0, import_i18n9.__)("Ease In Out", "elementor"),
  easeOut: (0, import_i18n9.__)("Ease Out", "elementor"),
  backIn: (0, import_i18n9.__)("Back In", "elementor"),
  backInOut: (0, import_i18n9.__)("Back In Out", "elementor"),
  backOut: (0, import_i18n9.__)("Back Out", "elementor"),
  linear: (0, import_i18n9.__)("Linear", "elementor")
};
var BASE_EASINGS = ["easeIn"];
function Easing({}) {
  const baseOptions = Object.fromEntries(
    Object.entries(EASING_OPTIONS).filter(([key]) => BASE_EASINGS.includes(key))
  );
  const disabledOptions = Object.fromEntries(
    Object.entries(EASING_OPTIONS).filter(([key]) => !BASE_EASINGS.includes(key))
  );
  return /* @__PURE__ */ React15.createElement(
    PromotionSelect,
    {
      value: DEFAULT_VALUES.easing,
      baseOptions,
      disabledOptions,
      promotionContent: (0, import_i18n9.__)("Upgrade to control the smoothness of the interaction.", "elementor"),
      upgradeUrl: "https://go.elementor.com/go-pro-interactions-easing-modal/"
    }
  );
}

// src/components/controls/effect.tsx
var React16 = __toESM(require("react"));
var import_i18n10 = require("@wordpress/i18n");
var EFFECT_OPTIONS = {
  fade: (0, import_i18n10.__)("Fade", "elementor"),
  slide: (0, import_i18n10.__)("Slide", "elementor"),
  scale: (0, import_i18n10.__)("Scale", "elementor"),
  custom: (0, import_i18n10.__)("Custom", "elementor")
};
var BASE_EFFECTS = ["fade", "slide", "scale"];
function Effect({ value, onChange }) {
  const baseOptions = Object.fromEntries(
    Object.entries(EFFECT_OPTIONS).filter(([key]) => BASE_EFFECTS.includes(key))
  );
  const disabledOptions = Object.fromEntries(
    Object.entries(EFFECT_OPTIONS).filter(([key]) => !BASE_EFFECTS.includes(key))
  );
  return /* @__PURE__ */ React16.createElement(
    PromotionSelect,
    {
      value: value in baseOptions ? value : DEFAULT_VALUES.effect,
      onChange,
      baseOptions,
      disabledOptions,
      promotionLabel: (0, import_i18n10.__)("PRO effects", "elementor"),
      promotionContent: (0, import_i18n10.__)(
        "Upgrade to further customize your animation with opacity, scale, move, rotate and more.",
        "elementor"
      ),
      upgradeUrl: "https://go.elementor.com/go-pro-interactions-custom-effect-modal/"
    }
  );
}

// src/components/controls/effect-type.tsx
var React17 = __toESM(require("react"));
var import_editor_controls7 = require("@elementor/editor-controls");
var import_i18n11 = require("@wordpress/i18n");
function EffectType({ value, onChange }) {
  const options = [
    {
      value: "in",
      label: (0, import_i18n11.__)("In", "elementor"),
      renderContent: () => (0, import_i18n11.__)("In", "elementor"),
      showTooltip: true
    },
    {
      value: "out",
      label: (0, import_i18n11.__)("Out", "elementor"),
      renderContent: () => (0, import_i18n11.__)("Out", "elementor"),
      showTooltip: true
    }
  ];
  return /* @__PURE__ */ React17.createElement(import_editor_controls7.ToggleButtonGroupUi, { items: options, exclusive: true, onChange, value });
}

// src/components/controls/replay.tsx
var React18 = __toESM(require("react"));
var import_editor_controls8 = require("@elementor/editor-controls");
var import_icons4 = require("@elementor/icons");
var import_ui10 = require("@elementor/ui");
var import_i18n12 = require("@wordpress/i18n");
var REPLAY_OPTIONS = {
  no: (0, import_i18n12.__)("No", "elementor"),
  yes: (0, import_i18n12.__)("Yes", "elementor")
};
var BASE_REPLAY = ["no"];
var OVERLAY_GRID = "1 / 1";
var CHIP_OFFSET = "50%";
function Replay({ onChange, anchorRef }) {
  const options = [
    {
      value: false,
      disabled: false,
      label: REPLAY_OPTIONS.no,
      renderContent: ({ size }) => /* @__PURE__ */ React18.createElement(import_icons4.MinusIcon, { fontSize: size }),
      showTooltip: true
    },
    {
      value: true,
      disabled: true,
      label: REPLAY_OPTIONS.yes,
      renderContent: ({ size }) => /* @__PURE__ */ React18.createElement(import_icons4.CheckIcon, { fontSize: size }),
      showTooltip: true
    }
  ];
  return /* @__PURE__ */ React18.createElement(import_ui10.Box, { sx: { display: "grid", alignItems: "center" } }, /* @__PURE__ */ React18.createElement(import_ui10.Box, { sx: { gridArea: OVERLAY_GRID } }, /* @__PURE__ */ React18.createElement(import_editor_controls8.ToggleButtonGroupUi, { items: options, exclusive: true, onChange, value: false })), /* @__PURE__ */ React18.createElement(import_ui10.Box, { sx: { gridArea: OVERLAY_GRID, marginInlineEnd: CHIP_OFFSET, justifySelf: "end" } }, /* @__PURE__ */ React18.createElement(
    InteractionsPromotionChip,
    {
      content: (0, import_i18n12.__)("Upgrade to run the animation every time its trigger occurs.", "elementor"),
      upgradeUrl: "https://go.elementor.com/go-pro-interactions-replay-modal/",
      anchorRef
    }
  )));
}

// src/components/controls/trigger.tsx
var React19 = __toESM(require("react"));
var import_i18n13 = require("@wordpress/i18n");
var TRIGGER_OPTIONS = {
  load: (0, import_i18n13.__)("Page load", "elementor"),
  scrollIn: (0, import_i18n13.__)("Scroll into view", "elementor"),
  scrollOn: (0, import_i18n13.__)("While scrolling", "elementor"),
  hover: (0, import_i18n13.__)("On hover", "elementor"),
  click: (0, import_i18n13.__)("On click", "elementor")
};
var BASE_TRIGGERS = ["load", "scrollIn"];
function Trigger({ value, onChange }) {
  const baseOptions = Object.fromEntries(
    Object.entries(TRIGGER_OPTIONS).filter(([key]) => BASE_TRIGGERS.includes(key))
  );
  const disabledOptions = Object.fromEntries(
    Object.entries(TRIGGER_OPTIONS).filter(([key]) => !BASE_TRIGGERS.includes(key))
  );
  return /* @__PURE__ */ React19.createElement(
    PromotionSelect,
    {
      value: value in baseOptions ? value : DEFAULT_VALUES.trigger,
      onChange,
      baseOptions,
      disabledOptions,
      promotionLabel: (0, import_i18n13.__)("PRO triggers", "elementor"),
      promotionContent: (0, import_i18n13.__)("Upgrade to unlock more interactions triggers.", "elementor"),
      upgradeUrl: "https://go.elementor.com/go-pro-interactions-triggers-modal/"
    }
  );
}

// src/hooks/on-duplicate.ts
var import_editor_elements4 = require("@elementor/editor-elements");
var import_editor_v1_adapters2 = require("@elementor/editor-v1-adapters");
function initCleanInteractionIdsOnDuplicate() {
  (0, import_editor_v1_adapters2.registerDataHook)("after", "document/elements/duplicate", (_args, result) => {
    const containers = Array.isArray(result) ? result : [result];
    containers.forEach((container) => {
      cleanInteractionIdsRecursive(container.id);
    });
  });
}
function cleanInteractionIdsRecursive(elementId) {
  const container = (0, import_editor_elements4.getContainer)(elementId);
  if (!container) {
    return;
  }
  (0, import_editor_elements4.getAllDescendants)(container).forEach((element) => {
    cleanInteractionIds(element.id);
  });
}
function cleanInteractionIds(elementId) {
  const container = (0, import_editor_elements4.getContainer)(elementId);
  if (!container) {
    return;
  }
  const interactions = container.model.get("interactions");
  if (!interactions || !interactions.items) {
    return;
  }
  const updatedInteractions = structuredClone(interactions);
  updatedInteractions?.items?.forEach((interaction) => {
    if (interaction.$$type === "interaction-item" && interaction.value) {
      interaction.value.interaction_id = createString(generateTempInteractionId());
    }
  });
  container.model.set("interactions", updatedInteractions);
}

// src/mcp/index.ts
var import_editor_mcp = require("@elementor/editor-mcp");

// src/mcp/constants.ts
var MAX_INTERACTIONS_PER_ELEMENT = 5;

// src/mcp/resources/interactions-schema-resource.ts
var import_utils = require("@elementor/utils");

// src/mcp/tools/schema.ts
var import_schema = require("@elementor/schema");
var baseSchema = {
  trigger: import_schema.z.enum(["load", "scrollIn"]).optional().describe("Event that triggers the animation"),
  effect: import_schema.z.enum(["fade", "slide", "scale"]).optional().describe("Animation effect type"),
  effectType: import_schema.z.enum(["in", "out"]).optional().describe("Whether the animation plays in or out"),
  direction: import_schema.z.enum(["top", "bottom", "left", "right", ""]).optional().describe("Direction for slide effect. Use empty string for fade/scale."),
  duration: import_schema.z.number().min(0).max(1e4).optional().describe("Animation duration in milliseconds"),
  delay: import_schema.z.number().min(0).max(1e4).optional().describe("Animation delay in milliseconds"),
  easing: import_schema.z.string().optional().describe("Easing function. See interactions schema for options."),
  excludedBreakpoints: import_schema.z.array(import_schema.z.string()).optional().describe(
    'Breakpoint IDs on which this interaction is disabled (e.g. ["mobile", "tablet"]). Omit to enable on all breakpoints.'
  )
};
var proSchema = {
  trigger: import_schema.z.enum(["load", "scrollIn", "scrollOut", "scrollOn", "hover", "click"]).optional().describe("Event that triggers the animation"),
  effect: import_schema.z.enum(["fade", "slide", "scale", "custom"]).optional().describe("Animation effect type"),
  customEffect: import_schema.z.object({
    keyframes: import_schema.z.array(
      import_schema.z.object({
        stop: import_schema.z.number().describe("The stop of the keyframe in percent, can be either 0 or 100"),
        value: import_schema.z.object({
          opacity: import_schema.z.number().min(0).max(1).describe("The opacity of the keyframe"),
          scale: import_schema.z.object({
            x: import_schema.z.number().min(0).max(1).describe("The x scale of the keyframe"),
            y: import_schema.z.number().min(0).max(1).describe("The y scale of the keyframe")
          }).optional().describe("The scale of the keyframe"),
          rotate: import_schema.z.object({
            x: import_schema.z.number().min(0).max(360).describe("The x rotate of the keyframe"),
            y: import_schema.z.number().min(0).max(360).describe("The y rotate of the keyframe"),
            z: import_schema.z.number().min(0).max(360).describe("The z rotate of the keyframe")
          }).optional().describe("The rotate of the keyframe"),
          move: import_schema.z.object({
            x: import_schema.z.number().min(0).max(1).describe("The x move of the keyframe"),
            y: import_schema.z.number().min(0).max(1).describe("The y move of the keyframe"),
            z: import_schema.z.number().min(0).max(1).describe("The z move of the keyframe")
          }).optional().describe("The move of the keyframe"),
          skew: import_schema.z.object({
            x: import_schema.z.number().min(0).max(360).describe("The x skew of the keyframe"),
            y: import_schema.z.number().min(0).max(360).describe("The y skew of the keyframe")
          }).optional().describe("The skew of the keyframe")
        })
      })
    ).describe("The keyframes of the custom effect")
  }).optional().describe("The custom effect to use for the animation")
};

// src/mcp/resources/interactions-schema-resource.ts
var INTERACTIONS_SCHEMA_URI = "elementor://interactions/schema";
var initInteractionsSchemaResource = (reg) => {
  const { resource } = reg;
  const schema = (0, import_utils.isProActive)() ? { ...baseSchema, ...proSchema } : baseSchema;
  resource(
    "interactions-schema",
    INTERACTIONS_SCHEMA_URI,
    {
      description: "Schema describing all available options for element interactions."
    },
    async () => {
      return {
        contents: [
          {
            uri: INTERACTIONS_SCHEMA_URI,
            mimeType: "application/json",
            text: JSON.stringify(schema)
          }
        ]
      };
    }
  );
};

// src/mcp/tools/manage-element-interaction-tool.ts
var import_editor_elements5 = require("@elementor/editor-elements");
var import_schema3 = require("@elementor/schema");
var import_utils2 = require("@elementor/utils");
var EMPTY_INTERACTIONS = {
  version: 1,
  items: []
};
var initManageElementInteractionTool = (reg) => {
  const { addTool } = reg;
  const extendedSchema = (0, import_utils2.isProActive)() ? { ...baseSchema, ...proSchema } : baseSchema;
  const schema = {
    elementId: import_schema3.z.string().describe("The ID of the element to read or modify interactions on"),
    action: import_schema3.z.enum(["get", "add", "update", "delete", "clear"]).describe('Operation to perform. Use "get" first to inspect existing interactions.'),
    interactionId: import_schema3.z.string().optional().describe('Interaction ID \u2014 required for update and delete. Obtain from a prior "get" call.'),
    ...extendedSchema
  };
  addTool({
    name: "manage-element-interaction",
    description: `Manage the element interaction.`,
    schema,
    requiredResources: [
      { uri: INTERACTIONS_SCHEMA_URI, description: "Interactions schema with all available options" }
    ],
    isDestructive: true,
    outputSchema: {
      success: import_schema3.z.boolean().describe("Whether the action was successful"),
      action: import_schema3.z.enum(["get", "add", "update", "delete", "clear"]).describe('Operation to perform. Use "get" first to inspect existing interactions.'),
      elementId: import_schema3.z.string().optional().describe("The ID of the element to read or modify interactions on"),
      interactions: import_schema3.z.array(import_schema3.z.any()).optional().describe("The interactions on the element"),
      count: import_schema3.z.number().optional().describe("The number of interactions on the element")
    },
    handler: (input) => {
      const { elementId, action, interactionId, ...animationData } = input;
      const allInteractions = interactionsRepository.all();
      const elementData = allInteractions.find((data) => data.elementId === elementId);
      const currentInteractions = elementData?.interactions ?? EMPTY_INTERACTIONS;
      if (action === "get") {
        const summary = currentInteractions.items.map((item) => {
          const { value } = item;
          const animValue = value.animation.value;
          const timingValue = animValue.timing_config.value;
          const configValue = animValue.config.value;
          return {
            id: extractString(value.interaction_id),
            trigger: extractString(value.trigger),
            effect: extractString(animValue.effect),
            effectType: extractString(animValue.type),
            direction: extractString(animValue.direction),
            duration: extractSize(timingValue.duration),
            delay: extractSize(timingValue.delay),
            easing: extractString(configValue.easing),
            excludedBreakpoints: extractExcludedBreakpoints(value.breakpoints)
          };
        });
        return {
          success: true,
          elementId,
          action,
          interactions: summary,
          count: summary.length
        };
      }
      let updatedItems = [...currentInteractions.items];
      switch (action) {
        case "add": {
          if (updatedItems.length >= MAX_INTERACTIONS_PER_ELEMENT) {
            throw new Error(
              `Cannot add more than ${MAX_INTERACTIONS_PER_ELEMENT} interactions per element. Current count: ${updatedItems.length}. Delete an existing interaction first.`
            );
          }
          const newItem = createInteractionItem({
            interactionId: generateTempInteractionId(),
            ...animationData
          });
          updatedItems = [...updatedItems, newItem];
          break;
        }
        case "update": {
          if (!interactionId) {
            throw new Error("interactionId is required for the update action.");
          }
          const itemIndex = updatedItems.findIndex(
            (item) => extractString(item.value.interaction_id) === interactionId
          );
          if (itemIndex === -1) {
            throw new Error(
              `Interaction with ID "${interactionId}" not found on element "${elementId}".`
            );
          }
          const updatedItem = createInteractionItem({
            interactionId,
            ...animationData
          });
          updatedItems = [
            ...updatedItems.slice(0, itemIndex),
            updatedItem,
            ...updatedItems.slice(itemIndex + 1)
          ];
          break;
        }
        case "delete": {
          if (!interactionId) {
            throw new Error("interactionId is required for the delete action.");
          }
          const beforeCount = updatedItems.length;
          updatedItems = updatedItems.filter(
            (item) => extractString(item.value.interaction_id) !== interactionId
          );
          if (updatedItems.length === beforeCount) {
            throw new Error(
              `Interaction with ID "${interactionId}" not found on element "${elementId}".`
            );
          }
          break;
        }
        case "clear": {
          updatedItems = [];
          break;
        }
      }
      const updatedInteractions = {
        ...currentInteractions,
        items: updatedItems
      };
      try {
        (0, import_editor_elements5.updateElementInteractions)({ elementId, interactions: updatedInteractions });
      } catch (error) {
        throw new Error(
          `Failed to update interactions for element "${elementId}": ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
      return {
        success: true,
        action,
        elementId,
        count: updatedItems.length
      };
    }
  });
};

// src/mcp/index.ts
var initMcpInteractions = () => {
  const reg = (0, import_editor_mcp.getMCPByDomain)("interactions", {
    instructions: `
		MCP server for managing element interactions and animations. Use this to add, modify, or remove animations and motion effects triggered by user events such as page load or scroll-into-view.
		** IMPORTANT **
		Use the "interactions-schema" resource to get the schema of the interactions.
		Actions:
		- get: Read the current interactions on the element.
		- add: Add a new interaction (max ${MAX_INTERACTIONS_PER_ELEMENT} per element).
		- update: Update an existing interaction by its interactionId.
		- delete: Remove a specific interaction by its interactionId.
		- clear: Remove all interactions from the element.
		
		For add/update, provide: trigger, effect, effectType, direction (required for slide effect), duration, delay, easing.
		Use excludedBreakpoints to disable the animation on specific responsive breakpoints (e.g. ["mobile", "tablet"]).
		Example Get Request:
		{
			"elementId": "123",
			"action": "get",
			"interactionId": "123",
			"animationData": {
				"trigger": "click",
				"effect": "fade",
			}
		}
		Example Add Request:
		{
			"elementId": "123",
			"action": "add",
			"animationData": {
				"effectType": "in",
				"direction": "top",
				"trigger": "click",
				"effect": "fade",
				"duration": 1000,
				"delay": 0,
				"easing": "easeIn",
				"excludedBreakpoints": ["mobile", "tablet"],
			}
		}
		Example Update Request:
		{
			"elementId": "123",
			"action": "update",
			"interactionId": "123",
			"animationData": {
				"trigger": "click",
				"effect": "fade",
			}
		}
		Example Delete Request:
		{
			"elementId": "123",
			"action": "delete",
			"interactionId": "123",
		}
		Example Clear Request:
		{
			"elementId": "123",
			"action": "clear",
		}
		`
  });
  reg.waitForReady().then(() => {
    initInteractionsSchemaResource(reg);
    initManageElementInteractionTool(reg);
  });
};

// src/init.ts
function init() {
  try {
    interactionsRepository.register(documentElementsInteractionsProvider);
    initCleanInteractionIdsOnDuplicate();
    registerInteractionsControl({
      type: "trigger",
      component: Trigger,
      options: ["load", "scrollIn"]
    });
    registerInteractionsControl({
      type: "easing",
      component: Easing,
      options: ["easeIn"]
    });
    registerInteractionsControl({
      type: "replay",
      component: Replay,
      options: ["true", "false"]
    });
    registerInteractionsControl({
      type: "effectType",
      component: EffectType,
      options: ["in", "out"]
    });
    registerInteractionsControl({
      type: "direction",
      component: Direction,
      options: ["top", "bottom", "left", "right"]
    });
    registerInteractionsControl({
      type: "effect",
      component: Effect,
      options: ["fade", "slide", "scale"]
    });
    initMcpInteractions();
  } catch (error) {
    throw error;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BASE_EASINGS,
  BASE_EFFECTS,
  BASE_REPLAY,
  BASE_TRIGGERS,
  EASING_OPTIONS,
  EFFECT_OPTIONS,
  ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX,
  EmptyState,
  InteractionsTab,
  REPLAY_OPTIONS,
  TRIGGER_OPTIONS,
  buildDisplayLabel,
  convertTimeUnit,
  createAnimationPreset,
  createBoolean,
  createConfig,
  createDefaultInteractionItem,
  createDefaultInteractions,
  createExcludedBreakpoints,
  createInteractionBreakpoints,
  createInteractionItem,
  createInteractionsProvider,
  createNumber,
  createString,
  createTimingConfig,
  extractBoolean,
  extractExcludedBreakpoints,
  extractSize,
  extractString,
  formatSizeValue,
  generateTempInteractionId,
  getInteractionsConfig,
  init,
  interactionsRepository,
  isTempId,
  parseSizeValue,
  registerInteractionsControl,
  resolveDirection
});
//# sourceMappingURL=index.js.map