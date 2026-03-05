// src/components/empty-state.tsx
import * as React from "react";
import { SwipeIcon } from "@elementor/icons";
import { Button, Stack, Typography } from "@elementor/ui";
import { __ } from "@wordpress/i18n";
var EmptyState = ({ onCreateInteraction }) => {
  return /* @__PURE__ */ React.createElement(
    Stack,
    {
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "text.secondary",
      sx: { p: 2.5, pt: 8, pb: 5.5 },
      gap: 1.5
    },
    /* @__PURE__ */ React.createElement(SwipeIcon, { fontSize: "large" }),
    /* @__PURE__ */ React.createElement(Typography, { align: "center", variant: "subtitle2" }, __("Animate elements with Interactions", "elementor")),
    /* @__PURE__ */ React.createElement(Typography, { align: "center", variant: "caption", maxWidth: "170px" }, __(
      "Add entrance animations and effects triggered by user interactions such as page load or scroll.",
      "elementor"
    )),
    /* @__PURE__ */ React.createElement(Button, { variant: "outlined", color: "secondary", size: "small", sx: { mt: 1 }, onClick: onCreateInteraction }, __("Create an interaction", "elementor"))
  );
};

// src/components/interactions-tab.tsx
import * as React11 from "react";
import { useCallback as useCallback6, useState as useState3 } from "react";
import { useElementInteractions as useElementInteractions2 } from "@elementor/editor-elements";
import { SessionStorageProvider } from "@elementor/session";
import { Stack as Stack3 } from "@elementor/ui";

// src/contexts/interactions-context.tsx
import * as React2 from "react";
import { createContext, useContext, useEffect } from "react";
import {
  playElementInteractions,
  updateElementInteractions,
  useElementInteractions
} from "@elementor/editor-elements";
var InteractionsContext = createContext(null);
var DEFAULT_INTERACTIONS = {
  version: 1,
  items: []
};
var InteractionsProvider = ({ children, elementId }) => {
  const rawInteractions = useElementInteractions(elementId);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("elementor/element/update_interactions"));
  }, []);
  const interactions = rawInteractions ?? DEFAULT_INTERACTIONS;
  const setInteractions = (value) => {
    const normalizedValue = value && value.items?.length === 0 ? void 0 : value;
    updateElementInteractions({
      elementId,
      interactions: normalizedValue
    });
  };
  const playInteractions = (interactionId) => {
    playElementInteractions(elementId, interactionId);
  };
  const contextValue = {
    interactions,
    setInteractions,
    playInteractions
  };
  return /* @__PURE__ */ React2.createElement(InteractionsContext.Provider, { value: contextValue }, children);
};
var useInteractionsContext = () => {
  const context = useContext(InteractionsContext);
  if (!context) {
    throw new Error("useInteractionsContext must be used within InteractionsProvider");
  }
  return context;
};

// src/contexts/popup-state-context.tsx
import * as React3 from "react";
import { createContext as createContext2, useCallback, useContext as useContext2, useState } from "react";
var PopupStateContext = createContext2(void 0);
var PopupStateProvider = ({ children }) => {
  const [openByDefault, setOpenByDefault] = useState(false);
  const triggerDefaultOpen = useCallback(() => {
    setOpenByDefault(true);
  }, []);
  const resetDefaultOpen = useCallback(() => {
    setOpenByDefault(false);
  }, []);
  return /* @__PURE__ */ React3.createElement(PopupStateContext.Provider, { value: { openByDefault, triggerDefaultOpen, resetDefaultOpen } }, children);
};

// src/components/interactions-list.tsx
import * as React10 from "react";
import { useCallback as useCallback5, useEffect as useEffect2, useMemo as useMemo3, useRef as useRef3 } from "react";
import { Repeater } from "@elementor/editor-controls";
import { InfoCircleFilledIcon, PlayerPlayIcon } from "@elementor/icons";
import { Alert, AlertTitle, Box as Box2, IconButton, Tooltip } from "@elementor/ui";
import { __ as __5 } from "@wordpress/i18n";

// src/contexts/interactions-item-context.tsx
import * as React4 from "react";
import { createContext as createContext3, useContext as useContext3 } from "react";
var InteractionItemContext = createContext3(null);
function InteractionItemContextProvider({
  value,
  children
}) {
  return /* @__PURE__ */ React4.createElement(InteractionItemContext.Provider, { value }, children);
}
function useInteractionItemContext() {
  const context = useContext3(InteractionItemContext);
  if (!context) {
    throw new Error("useInteractionItemContext must be used within InteractionItemContextProvider");
  }
  return context;
}

// src/utils/prop-value-utils.ts
import { sizePropTypeUtil } from "@elementor/editor-props";

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
    duration: sizePropTypeUtil.create(parseSizeValue(duration, TIME_UNITS, void 0, DEFAULT_TIME_UNIT)),
    delay: sizePropTypeUtil.create(parseSizeValue(delay, TIME_UNITS, void 0, DEFAULT_TIME_UNIT))
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
  return sizePropTypeUtil.create(parseSizeValue(value, ["%"], defaultValue, defaultUnit));
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
import * as React9 from "react";
import { useCallback as useCallback4 } from "react";
import { Divider as Divider2, Tab, TabPanel, Tabs, useTabs } from "@elementor/ui";
import { __ as __4 } from "@wordpress/i18n";

// src/components/interaction-details.tsx
import * as React7 from "react";
import { useMemo, useRef as useRef2 } from "react";
import { PopoverContent } from "@elementor/editor-controls";
import { Box, Divider, Grid as Grid2 } from "@elementor/ui";
import { __ as __2 } from "@wordpress/i18n";

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
import * as React5 from "react";
import { useCallback as useCallback2, useRef } from "react";
import { UnstableSizeField } from "@elementor/editor-controls";

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
  const prevUnitRef = useRef(sizeValue.unit);
  const setValue = useCallback2(
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
    UnstableSizeField,
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
import * as React6 from "react";
import { ControlFormLabel, PopoverGridContainer } from "@elementor/editor-controls";
import { Grid } from "@elementor/ui";
var Field = ({ label, children }) => {
  return /* @__PURE__ */ React6.createElement(Grid, { item: true, xs: 12, "aria-label": `${label} control` }, /* @__PURE__ */ React6.createElement(PopoverGridContainer, null, /* @__PURE__ */ React6.createElement(Grid, { item: true, xs: 6 }, /* @__PURE__ */ React6.createElement(ControlFormLabel, null, label)), /* @__PURE__ */ React6.createElement(Grid, { item: true, xs: 6 }, children)));
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
  return useMemo(() => {
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
  const containerRef = useRef2(null);
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
  return /* @__PURE__ */ React7.createElement(Box, { ref: containerRef }, /* @__PURE__ */ React7.createElement(PopoverContent, { p: 1.5 }, /* @__PURE__ */ React7.createElement(Grid2, { container: true, spacing: 1.5 }, TriggerControl && /* @__PURE__ */ React7.createElement(Field, { label: __2("Trigger", "elementor") }, /* @__PURE__ */ React7.createElement(
    TriggerControl,
    {
      value: trigger,
      onChange: (v) => updateInteraction({ trigger: v })
    }
  )), ReplayControl && /* @__PURE__ */ React7.createElement(Field, { label: __2("Replay", "elementor") }, /* @__PURE__ */ React7.createElement(
    ReplayControl,
    {
      value: replay,
      onChange: (v) => updateInteraction({ replay: v }),
      disabled: true,
      anchorRef: containerRef
    }
  ))), /* @__PURE__ */ React7.createElement(Divider, null), /* @__PURE__ */ React7.createElement(Grid2, { container: true, spacing: 1.5 }, EffectControl && /* @__PURE__ */ React7.createElement(Field, { label: __2("Effect", "elementor") }, /* @__PURE__ */ React7.createElement(EffectControl, { value: effect, onChange: (v) => updateInteraction({ effect: v }) })), CustomEffectControl && /* @__PURE__ */ React7.createElement(Field, { label: __2("Custom Effect", "elementor") }, /* @__PURE__ */ React7.createElement(
    CustomEffectControl,
    {
      value: customEffects,
      onChange: (v) => updateInteraction({ customEffects: v })
    }
  )), EffectTypeControl && /* @__PURE__ */ React7.createElement(Field, { label: __2("Type", "elementor") }, /* @__PURE__ */ React7.createElement(EffectTypeControl, { value: type, onChange: (v) => updateInteraction({ type: v }) })), DirectionControl && /* @__PURE__ */ React7.createElement(Field, { label: __2("Direction", "elementor") }, /* @__PURE__ */ React7.createElement(
    DirectionControl,
    {
      value: direction,
      onChange: (v) => updateInteraction({ direction: v }),
      interactionType: type
    }
  )), controlVisibilityConfig.duration(interactionValues) && /* @__PURE__ */ React7.createElement(Field, { label: __2("Duration", "elementor") }, /* @__PURE__ */ React7.createElement(
    TimeFrameIndicator,
    {
      value: String(duration),
      onChange: (v) => updateInteraction({ duration: v }),
      defaultValue: DEFAULT_VALUES.duration
    }
  )), controlVisibilityConfig.delay(interactionValues) && /* @__PURE__ */ React7.createElement(Field, { label: __2("Delay", "elementor") }, /* @__PURE__ */ React7.createElement(
    TimeFrameIndicator,
    {
      value: String(delay),
      onChange: (v) => updateInteraction({ delay: v }),
      defaultValue: DEFAULT_VALUES.delay
    }
  ))), controlVisibilityConfig.relativeTo(interactionValues) && RelativeToControl && /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(Divider, null), /* @__PURE__ */ React7.createElement(Grid2, { container: true, spacing: 1.5 }, StartControl && /* @__PURE__ */ React7.createElement(Field, { label: __2("Start", "elementor") }, /* @__PURE__ */ React7.createElement(
    StartControl,
    {
      value: parseSizeValue(start, ["%"]).size?.toString() ?? "",
      onChange: (v) => updateInteraction({ start: v })
    }
  )), EndControl && /* @__PURE__ */ React7.createElement(Field, { label: __2("End", "elementor") }, /* @__PURE__ */ React7.createElement(
    EndControl,
    {
      value: parseSizeValue(end, ["%"]).size?.toString() ?? "",
      onChange: (v) => updateInteraction({ end: v })
    }
  )), /* @__PURE__ */ React7.createElement(Field, { label: __2("Relative To", "elementor") }, /* @__PURE__ */ React7.createElement(
    RelativeToControl,
    {
      value: relativeTo,
      onChange: (v) => updateInteraction({ relativeTo: v })
    }
  ))), /* @__PURE__ */ React7.createElement(Divider, null)), EasingControl && /* @__PURE__ */ React7.createElement(Grid2, { container: true, spacing: 1.5 }, /* @__PURE__ */ React7.createElement(Field, { label: __2("Easing", "elementor") }, /* @__PURE__ */ React7.createElement(
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
import * as React8 from "react";
import { useCallback as useCallback3, useMemo as useMemo2, useState as useState2 } from "react";
import { ControlFormLabel as ControlFormLabel2, PopoverContent as PopoverContent2 } from "@elementor/editor-controls";
import { useBreakpoints } from "@elementor/editor-responsive";
import { Autocomplete, Chip, Grid as Grid3, Stack as Stack2, TextField } from "@elementor/ui";
import { __ as __3 } from "@wordpress/i18n";
var SIZE = "tiny";
var InteractionSettings = ({ interaction, onChange }) => {
  const breakpoints = useBreakpoints();
  const availableBreakpoints = useMemo2(
    () => breakpoints.map((breakpoint) => ({ label: breakpoint.label, value: String(breakpoint.id) })),
    [breakpoints]
  );
  const [selectedBreakpoints, setSelectedBreakpoints] = useState2(() => {
    const excluded = extractExcludedBreakpoints(interaction.breakpoints).filter((excludedBreakpoint) => {
      return availableBreakpoints.some(({ value }) => value === excludedBreakpoint);
    });
    return availableBreakpoints.filter(({ value }) => {
      return !excluded.includes(value);
    });
  });
  const handleBreakpointChange = useCallback3(
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
  return /* @__PURE__ */ React8.createElement(PopoverContent2, { p: 1.5 }, /* @__PURE__ */ React8.createElement(Grid3, { container: true, spacing: 1.5 }, /* @__PURE__ */ React8.createElement(Grid3, { item: true, xs: 12 }, /* @__PURE__ */ React8.createElement(Stack2, { direction: "column", gap: 1 }, /* @__PURE__ */ React8.createElement(ControlFormLabel2, { sx: { width: "100%" } }, __3("Trigger on", "elementor")), /* @__PURE__ */ React8.createElement(
    Autocomplete,
    {
      fullWidth: true,
      multiple: true,
      value: selectedBreakpoints,
      onChange: handleBreakpointChange,
      size: SIZE,
      options: availableBreakpoints,
      isOptionEqualToValue: (option, value) => option.value === value.value,
      renderInput: (params) => /* @__PURE__ */ React8.createElement(TextField, { ...params }),
      renderTags: (values, getTagProps) => values.map((option, index) => {
        const { key, ...chipProps } = getTagProps({ index });
        return /* @__PURE__ */ React8.createElement(Chip, { key, size: SIZE, label: option.label, ...chipProps });
      })
    }
  )))));
};

// src/components/interactions-list-item.tsx
var InteractionsListItem = ({
  index,
  value: interaction
}) => {
  const { getTabsProps, getTabProps, getTabPanelProps } = useTabs("details");
  const context = useInteractionItemContext();
  const handleChange = useCallback4(
    (newInteractionValue) => {
      context?.onInteractionChange(index, newInteractionValue);
    },
    [context, index]
  );
  const handlePlayInteraction = useCallback4(
    (interactionId2) => {
      context?.onPlayInteraction(interactionId2);
    },
    [context]
  );
  const interactionId = extractString(interaction.value.interaction_id);
  return /* @__PURE__ */ React9.createElement(React9.Fragment, null, /* @__PURE__ */ React9.createElement(
    Tabs,
    {
      size: "small",
      variant: "fullWidth",
      "aria-label": __4("Interaction", "elementor"),
      ...getTabsProps()
    },
    /* @__PURE__ */ React9.createElement(Tab, { label: __4("Details", "elementor"), ...getTabProps("details") }),
    /* @__PURE__ */ React9.createElement(Tab, { label: __4("Settings", "elementor"), ...getTabProps("settings") })
  ), /* @__PURE__ */ React9.createElement(Divider2, null), /* @__PURE__ */ React9.createElement(TabPanel, { sx: { p: 0 }, ...getTabPanelProps("details") }, /* @__PURE__ */ React9.createElement(
    InteractionDetails,
    {
      key: interactionId,
      interaction: interaction.value,
      onChange: handleChange,
      onPlayInteraction: handlePlayInteraction
    }
  )), /* @__PURE__ */ React9.createElement(TabPanel, { sx: { p: 0 }, ...getTabPanelProps("settings") }, /* @__PURE__ */ React9.createElement(
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
  const hasInitializedRef = useRef3(false);
  const handleUpdateInteractions = useCallback5(
    (newInteractions) => {
      onSelectInteractions(newInteractions);
    },
    [onSelectInteractions]
  );
  useEffect2(() => {
    if (triggerCreateOnShowEmpty && !hasInitializedRef.current && (!interactions.items || interactions.items?.length === 0)) {
      hasInitializedRef.current = true;
      const newState = {
        version: 1,
        items: [createDefaultInteractionItem()]
      };
      handleUpdateInteractions(newState);
    }
  }, [triggerCreateOnShowEmpty, interactions.items, handleUpdateInteractions]);
  const isMaxNumberOfInteractionsReached = useMemo3(() => {
    return interactions.items?.length >= MAX_NUMBER_OF_INTERACTIONS;
  }, [interactions.items?.length]);
  const infotipContent = isMaxNumberOfInteractionsReached ? /* @__PURE__ */ React10.createElement(Alert, { color: "secondary", icon: /* @__PURE__ */ React10.createElement(InfoCircleFilledIcon, null), size: "small" }, /* @__PURE__ */ React10.createElement(AlertTitle, null, __5("Interactions", "elementor")), /* @__PURE__ */ React10.createElement(Box2, { component: "span" }, __5(
    "You've reached the limit of 5 interactions for this element. Please remove an interaction before creating a new one.",
    "elementor"
  ))) : void 0;
  const handleRepeaterChange = useCallback5(
    (newItems) => {
      handleUpdateInteractions({
        ...interactions,
        items: newItems
      });
    },
    [interactions, handleUpdateInteractions]
  );
  const handleInteractionChange = useCallback5(
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
  const contextValue = useMemo3(
    () => ({
      onInteractionChange: handleInteractionChange,
      onPlayInteraction
    }),
    [handleInteractionChange, onPlayInteraction]
  );
  return /* @__PURE__ */ React10.createElement(InteractionItemContextProvider, { value: contextValue }, /* @__PURE__ */ React10.createElement(
    Repeater,
    {
      openOnAdd: true,
      openItem: triggerCreateOnShowEmpty ? 0 : void 0,
      label: __5("Interactions", "elementor"),
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
        actions: (value) => /* @__PURE__ */ React10.createElement(Tooltip, { key: "preview", placement: "top", title: __5("Preview", "elementor") }, /* @__PURE__ */ React10.createElement(
          IconButton,
          {
            "aria-label": __5("Play interaction", "elementor"),
            size: "tiny",
            onClick: () => onPlayInteraction(extractString(value.value.interaction_id))
          },
          /* @__PURE__ */ React10.createElement(PlayerPlayIcon, { fontSize: "tiny" })
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
  const existingInteractions = useElementInteractions2(elementId);
  const firstInteractionState = useState3(false);
  const hasInteractions = existingInteractions?.items?.length || firstInteractionState[0];
  return /* @__PURE__ */ React11.createElement(SessionStorageProvider, { prefix: elementId }, hasInteractions ? /* @__PURE__ */ React11.createElement(InteractionsProvider, { elementId }, /* @__PURE__ */ React11.createElement(InteractionsContent, { firstInteractionState })) : /* @__PURE__ */ React11.createElement(
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
  const applyInteraction = useCallback6(
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
  return /* @__PURE__ */ React11.createElement(Stack3, { sx: { m: 1, p: 1.5 }, gap: 2 }, /* @__PURE__ */ React11.createElement(
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
import { getCurrentDocumentId, getElementInteractions, getElements } from "@elementor/editor-elements";
import { __privateListenTo as listenTo, windowEvent } from "@elementor/editor-v1-adapters";
var ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX = "document-elements-interactions-";
var documentElementsInteractionsProvider = createInteractionsProvider({
  key: () => {
    const documentId = getCurrentDocumentId();
    if (!documentId) {
      const pendingKey = `${ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX}pending`;
      return pendingKey;
    }
    const key = `${ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX}${documentId}`;
    return key;
  },
  priority: 50,
  subscribe: (cb) => {
    return listenTo([windowEvent("elementor/element/update_interactions")], () => cb());
  },
  actions: {
    all: () => {
      const elements = getElements();
      const filtered = elements.filter((element) => {
        const interactions = getElementInteractions(element.id);
        if (!interactions) {
          return false;
        }
        return interactions?.items?.length > 0;
      });
      return filtered.map((element) => {
        const interactions = getElementInteractions(element.id);
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
import * as React12 from "react";
import { useMemo as useMemo4 } from "react";
import { ToggleButtonGroupUi } from "@elementor/editor-controls";
import { ArrowDownSmallIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpSmallIcon } from "@elementor/icons";
import { __ as __6 } from "@wordpress/i18n";
function Direction({ value, onChange, interactionType }) {
  const options = useMemo4(() => {
    const isIn = interactionType === "in";
    return [
      {
        value: "top",
        label: isIn ? __6("From top", "elementor") : __6("To top", "elementor"),
        renderContent: ({ size }) => isIn ? /* @__PURE__ */ React12.createElement(ArrowDownSmallIcon, { fontSize: size }) : /* @__PURE__ */ React12.createElement(ArrowUpSmallIcon, { fontSize: size }),
        showTooltip: true
      },
      {
        value: "bottom",
        label: interactionType === "in" ? __6("From bottom", "elementor") : __6("To bottom", "elementor"),
        renderContent: ({ size }) => isIn ? /* @__PURE__ */ React12.createElement(ArrowUpSmallIcon, { fontSize: size }) : /* @__PURE__ */ React12.createElement(ArrowDownSmallIcon, { fontSize: size }),
        showTooltip: true
      },
      {
        value: "left",
        label: interactionType === "in" ? __6("From left", "elementor") : __6("To left", "elementor"),
        renderContent: ({ size }) => isIn ? /* @__PURE__ */ React12.createElement(ArrowRightIcon, { fontSize: size }) : /* @__PURE__ */ React12.createElement(ArrowLeftIcon, { fontSize: size }),
        showTooltip: true
      },
      {
        value: "right",
        label: interactionType === "in" ? __6("From right", "elementor") : __6("To right", "elementor"),
        renderContent: ({ size }) => isIn ? /* @__PURE__ */ React12.createElement(ArrowLeftIcon, { fontSize: size }) : /* @__PURE__ */ React12.createElement(ArrowRightIcon, { fontSize: size }),
        showTooltip: true
      }
    ];
  }, [interactionType]);
  return /* @__PURE__ */ React12.createElement(ToggleButtonGroupUi, { items: options, exclusive: true, onChange, value });
}

// src/components/controls/easing.tsx
import * as React15 from "react";
import { __ as __9 } from "@wordpress/i18n";

// src/ui/promotion-select.tsx
import * as React14 from "react";
import { useRef as useRef4 } from "react";
import { MenuListItem } from "@elementor/editor-ui";
import { MenuSubheader, Select } from "@elementor/ui";
import { __ as __8 } from "@wordpress/i18n";

// src/ui/interactions-promotion-chip.tsx
import * as React13 from "react";
import { forwardRef, useImperativeHandle, useState as useState4 } from "react";
import { PromotionChip, PromotionPopover, useCanvasClickHandler } from "@elementor/editor-ui";
import { Box as Box3 } from "@elementor/ui";
import { __ as __7 } from "@wordpress/i18n";
var InteractionsPromotionChip = forwardRef(
  ({ content, upgradeUrl, anchorRef }, ref) => {
    const [isOpen, setIsOpen] = useState4(false);
    useCanvasClickHandler(isOpen, () => setIsOpen(false));
    const toggle = () => setIsOpen((prev) => !prev);
    useImperativeHandle(ref, () => ({ toggle }), []);
    const handleToggle = (e) => {
      e.stopPropagation();
      toggle();
    };
    return /* @__PURE__ */ React13.createElement(
      PromotionPopover,
      {
        open: isOpen,
        title: __7("Interactions", "elementor"),
        content,
        ctaText: __7("Upgrade now", "elementor"),
        ctaUrl: upgradeUrl,
        anchorRef,
        placement: anchorRef ? "right-start" : void 0,
        onClose: (e) => {
          e.stopPropagation();
          setIsOpen(false);
        }
      },
      /* @__PURE__ */ React13.createElement(
        Box3,
        {
          onMouseDown: (e) => e.stopPropagation(),
          onClick: handleToggle,
          sx: { cursor: "pointer", display: "inline-flex", mr: 1 }
        },
        /* @__PURE__ */ React13.createElement(PromotionChip, null)
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
  const promotionRef = useRef4(null);
  const anchorRef = useRef4(null);
  return /* @__PURE__ */ React14.createElement(
    Select,
    {
      value,
      onChange: (e) => onChange?.(e.target.value),
      fullWidth: true,
      displayEmpty: true,
      size: "tiny",
      MenuProps: { disablePortal: true }
    },
    Object.entries(baseOptions).map(([key, label]) => /* @__PURE__ */ React14.createElement(MenuListItem, { key, value: key }, label)),
    /* @__PURE__ */ React14.createElement(
      MenuSubheader,
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
      promotionLabel ?? __8("PRO features", "elementor"),
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
    Object.entries(disabledOptions).map(([key, label]) => /* @__PURE__ */ React14.createElement(MenuListItem, { key, value: key, disabled: true, sx: { pl: 3 } }, label))
  );
}

// src/components/controls/easing.tsx
var EASING_OPTIONS = {
  easeIn: __9("Ease In", "elementor"),
  easeInOut: __9("Ease In Out", "elementor"),
  easeOut: __9("Ease Out", "elementor"),
  backIn: __9("Back In", "elementor"),
  backInOut: __9("Back In Out", "elementor"),
  backOut: __9("Back Out", "elementor"),
  linear: __9("Linear", "elementor")
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
      promotionContent: __9("Upgrade to control the smoothness of the interaction.", "elementor"),
      upgradeUrl: "https://go.elementor.com/go-pro-interactions-easing-modal/"
    }
  );
}

// src/components/controls/effect.tsx
import * as React16 from "react";
import { __ as __10 } from "@wordpress/i18n";
var EFFECT_OPTIONS = {
  fade: __10("Fade", "elementor"),
  slide: __10("Slide", "elementor"),
  scale: __10("Scale", "elementor"),
  custom: __10("Custom", "elementor")
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
      promotionLabel: __10("PRO effects", "elementor"),
      promotionContent: __10(
        "Upgrade to further customize your animation with opacity, scale, move, rotate and more.",
        "elementor"
      ),
      upgradeUrl: "https://go.elementor.com/go-pro-interactions-custom-effect-modal/"
    }
  );
}

// src/components/controls/effect-type.tsx
import * as React17 from "react";
import { ToggleButtonGroupUi as ToggleButtonGroupUi2 } from "@elementor/editor-controls";
import { __ as __11 } from "@wordpress/i18n";
function EffectType({ value, onChange }) {
  const options = [
    {
      value: "in",
      label: __11("In", "elementor"),
      renderContent: () => __11("In", "elementor"),
      showTooltip: true
    },
    {
      value: "out",
      label: __11("Out", "elementor"),
      renderContent: () => __11("Out", "elementor"),
      showTooltip: true
    }
  ];
  return /* @__PURE__ */ React17.createElement(ToggleButtonGroupUi2, { items: options, exclusive: true, onChange, value });
}

// src/components/controls/replay.tsx
import * as React18 from "react";
import { ToggleButtonGroupUi as ToggleButtonGroupUi3 } from "@elementor/editor-controls";
import { CheckIcon, MinusIcon } from "@elementor/icons";
import { Box as Box4 } from "@elementor/ui";
import { __ as __12 } from "@wordpress/i18n";
var REPLAY_OPTIONS = {
  no: __12("No", "elementor"),
  yes: __12("Yes", "elementor")
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
      renderContent: ({ size }) => /* @__PURE__ */ React18.createElement(MinusIcon, { fontSize: size }),
      showTooltip: true
    },
    {
      value: true,
      disabled: true,
      label: REPLAY_OPTIONS.yes,
      renderContent: ({ size }) => /* @__PURE__ */ React18.createElement(CheckIcon, { fontSize: size }),
      showTooltip: true
    }
  ];
  return /* @__PURE__ */ React18.createElement(Box4, { sx: { display: "grid", alignItems: "center" } }, /* @__PURE__ */ React18.createElement(Box4, { sx: { gridArea: OVERLAY_GRID } }, /* @__PURE__ */ React18.createElement(ToggleButtonGroupUi3, { items: options, exclusive: true, onChange, value: false })), /* @__PURE__ */ React18.createElement(Box4, { sx: { gridArea: OVERLAY_GRID, marginInlineEnd: CHIP_OFFSET, justifySelf: "end" } }, /* @__PURE__ */ React18.createElement(
    InteractionsPromotionChip,
    {
      content: __12("Upgrade to run the animation every time its trigger occurs.", "elementor"),
      upgradeUrl: "https://go.elementor.com/go-pro-interactions-replay-modal/",
      anchorRef
    }
  )));
}

// src/components/controls/trigger.tsx
import * as React19 from "react";
import { __ as __13 } from "@wordpress/i18n";
var TRIGGER_OPTIONS = {
  load: __13("Page load", "elementor"),
  scrollIn: __13("Scroll into view", "elementor"),
  scrollOn: __13("While scrolling", "elementor"),
  hover: __13("On hover", "elementor"),
  click: __13("On click", "elementor")
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
      promotionLabel: __13("PRO triggers", "elementor"),
      promotionContent: __13("Upgrade to unlock more interactions triggers.", "elementor"),
      upgradeUrl: "https://go.elementor.com/go-pro-interactions-triggers-modal/"
    }
  );
}

// src/hooks/on-duplicate.ts
import { getAllDescendants, getContainer } from "@elementor/editor-elements";
import { registerDataHook } from "@elementor/editor-v1-adapters";
function initCleanInteractionIdsOnDuplicate() {
  registerDataHook("after", "document/elements/duplicate", (_args, result) => {
    const containers = Array.isArray(result) ? result : [result];
    containers.forEach((container) => {
      cleanInteractionIdsRecursive(container.id);
    });
  });
}
function cleanInteractionIdsRecursive(elementId) {
  const container = getContainer(elementId);
  if (!container) {
    return;
  }
  getAllDescendants(container).forEach((element) => {
    cleanInteractionIds(element.id);
  });
}
function cleanInteractionIds(elementId) {
  const container = getContainer(elementId);
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
import { getMCPByDomain } from "@elementor/editor-mcp";

// src/mcp/constants.ts
var MAX_INTERACTIONS_PER_ELEMENT = 5;

// src/mcp/resources/interactions-schema-resource.ts
import { isProActive } from "@elementor/utils";

// src/mcp/tools/schema.ts
import { z } from "@elementor/schema";
var baseSchema = {
  trigger: z.enum(["load", "scrollIn"]).optional().describe("Event that triggers the animation"),
  effect: z.enum(["fade", "slide", "scale"]).optional().describe("Animation effect type"),
  effectType: z.enum(["in", "out"]).optional().describe("Whether the animation plays in or out"),
  direction: z.enum(["top", "bottom", "left", "right", ""]).optional().describe("Direction for slide effect. Use empty string for fade/scale."),
  duration: z.number().min(0).max(1e4).optional().describe("Animation duration in milliseconds"),
  delay: z.number().min(0).max(1e4).optional().describe("Animation delay in milliseconds"),
  easing: z.string().optional().describe("Easing function. See interactions schema for options."),
  excludedBreakpoints: z.array(z.string()).optional().describe(
    'Breakpoint IDs on which this interaction is disabled (e.g. ["mobile", "tablet"]). Omit to enable on all breakpoints.'
  )
};
var proSchema = {
  trigger: z.enum(["load", "scrollIn", "scrollOut", "scrollOn", "hover", "click"]).optional().describe("Event that triggers the animation"),
  effect: z.enum(["fade", "slide", "scale", "custom"]).optional().describe("Animation effect type"),
  customEffect: z.object({
    keyframes: z.array(
      z.object({
        stop: z.number().describe("The stop of the keyframe in percent, can be either 0 or 100"),
        value: z.object({
          opacity: z.number().min(0).max(1).describe("The opacity of the keyframe"),
          scale: z.object({
            x: z.number().min(0).max(1).describe("The x scale of the keyframe"),
            y: z.number().min(0).max(1).describe("The y scale of the keyframe")
          }).optional().describe("The scale of the keyframe"),
          rotate: z.object({
            x: z.number().min(0).max(360).describe("The x rotate of the keyframe"),
            y: z.number().min(0).max(360).describe("The y rotate of the keyframe"),
            z: z.number().min(0).max(360).describe("The z rotate of the keyframe")
          }).optional().describe("The rotate of the keyframe"),
          move: z.object({
            x: z.number().min(0).max(1).describe("The x move of the keyframe"),
            y: z.number().min(0).max(1).describe("The y move of the keyframe"),
            z: z.number().min(0).max(1).describe("The z move of the keyframe")
          }).optional().describe("The move of the keyframe"),
          skew: z.object({
            x: z.number().min(0).max(360).describe("The x skew of the keyframe"),
            y: z.number().min(0).max(360).describe("The y skew of the keyframe")
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
  const schema = isProActive() ? { ...baseSchema, ...proSchema } : baseSchema;
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
import { updateElementInteractions as updateElementInteractions2 } from "@elementor/editor-elements";
import { z as z2 } from "@elementor/schema";
import { isProActive as isProActive2 } from "@elementor/utils";
var EMPTY_INTERACTIONS = {
  version: 1,
  items: []
};
var initManageElementInteractionTool = (reg) => {
  const { addTool } = reg;
  const extendedSchema = isProActive2() ? { ...baseSchema, ...proSchema } : baseSchema;
  const schema = {
    elementId: z2.string().describe("The ID of the element to read or modify interactions on"),
    action: z2.enum(["get", "add", "update", "delete", "clear"]).describe('Operation to perform. Use "get" first to inspect existing interactions.'),
    interactionId: z2.string().optional().describe('Interaction ID \u2014 required for update and delete. Obtain from a prior "get" call.'),
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
      success: z2.boolean().describe("Whether the action was successful"),
      action: z2.enum(["get", "add", "update", "delete", "clear"]).describe('Operation to perform. Use "get" first to inspect existing interactions.'),
      elementId: z2.string().optional().describe("The ID of the element to read or modify interactions on"),
      interactions: z2.array(z2.any()).optional().describe("The interactions on the element"),
      count: z2.number().optional().describe("The number of interactions on the element")
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
        updateElementInteractions2({ elementId, interactions: updatedInteractions });
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
  const reg = getMCPByDomain("interactions", {
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
export {
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
};
//# sourceMappingURL=index.mjs.map