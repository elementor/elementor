import * as React from 'react';
import { RefObject, ComponentType } from 'react';
import { Unit } from '@elementor/editor-controls';
import { ElementInteractions, InteractionItemPropValue, AnimationPresetPropValue, BooleanPropValue, ConfigPropValue, ExcludedBreakpointsPropValue, InteractionBreakpointsPropValue, NumberPropValue, StringPropValue, TimingConfigPropValue } from '@elementor/editor-elements';
export { InteractionItemPropValue } from '@elementor/editor-elements';
import { PropValue, SizePropValue } from '@elementor/editor-props';

declare const EmptyState: ({ onCreateInteraction }: {
    onCreateInteraction: () => void;
}) => React.JSX.Element;

declare const InteractionsTab: ({ elementId }: {
    elementId: string;
}) => React.JSX.Element;

type InteractionConstants = {
    defaultDuration: number;
    defaultDelay: number;
    slideDistance: number;
    scaleStart: number;
    defaultEasing: string;
    relativeTo: string;
    start: number;
    end: number;
};
type InteractionsConfig = {
    constants: InteractionConstants;
};
type FieldProps<T = string> = {
    value: T;
    onChange: (value: T) => void;
    label?: string;
    disabled?: boolean;
    anchorRef?: RefObject<HTMLElement | null>;
};
type ReplayFieldProps = FieldProps<boolean>;
type DirectionFieldProps = FieldProps<string> & {
    interactionType: string;
};
type ElementInteractionData = {
    elementId: string;
    dataId: string;
    interactions: ElementInteractions;
};
type InteractionsProvider = {
    getKey: () => string;
    priority: number;
    subscribe: (callback: () => void) => () => void;
    actions: {
        all: () => ElementInteractionData[];
    };
};
type InteractionItemValue = InteractionItemPropValue['value'];
type SizeStringValue = `${number}${Unit}` | number;

declare function getInteractionsConfig(): InteractionsConfig;

declare const interactionsRepository: {
    all: () => ElementInteractionData[];
    register: (provider: InteractionsProvider) => void;
    subscribe: (cb: () => void) => () => void;
    getProviders: () => InteractionsProvider[];
    getProviderByKey: (key: string) => InteractionsProvider | undefined;
};

type CreateInteractionsProviderOptions = {
    key: string | (() => string);
    priority?: number;
    subscribe?: (callback: () => void) => () => void;
    actions: {
        all: InteractionsProvider['actions']['all'];
    };
};
declare function createInteractionsProvider({ key, priority, subscribe, actions, }: CreateInteractionsProviderOptions): InteractionsProvider;

declare const ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX = "document-elements-interactions-";

declare function init(): void;

type InteractionsControlType = 'trigger' | 'effect' | 'effectType' | 'direction' | 'duration' | 'delay' | 'replay' | 'easing' | 'relativeTo' | 'start' | 'end' | 'customEffects';
type InteractionsControlPropsMap = {
    trigger: FieldProps;
    effect: FieldProps;
    customEffects: FieldProps<PropValue>;
    effectType: FieldProps;
    direction: DirectionFieldProps;
    duration: FieldProps;
    delay: FieldProps;
    replay: ReplayFieldProps;
    easing: FieldProps;
    relativeTo: FieldProps;
    start: FieldProps;
    end: FieldProps;
};
type ControlOptions<T extends InteractionsControlType> = {
    type: T;
    component: ComponentType<InteractionsControlPropsMap[T]>;
    options?: string[];
};
declare function registerInteractionsControl<T extends InteractionsControlType>({ type, component, options, }: ControlOptions<T>): void;

declare const TRIGGER_OPTIONS: {
    load: string;
    scrollIn: string;
    scrollOn: string;
    hover: string;
    click: string;
};
declare const BASE_TRIGGERS: string[];

declare const EASING_OPTIONS: {
    easeIn: string;
    easeInOut: string;
    easeOut: string;
    backIn: string;
    backInOut: string;
    backOut: string;
    linear: string;
};
declare const BASE_EASINGS: string[];

declare const REPLAY_OPTIONS: {
    no: string;
    yes: string;
};
declare const BASE_REPLAY: string[];

declare const EFFECT_OPTIONS: {
    fade: string;
    slide: string;
    scale: string;
    custom: string;
};
declare const BASE_EFFECTS: string[];

declare const createString: (value: string) => StringPropValue;
declare const createNumber: (value: number) => NumberPropValue;
declare const createTimingConfig: (duration: SizeStringValue, delay: SizeStringValue) => TimingConfigPropValue;
declare const createBoolean: (value: boolean) => BooleanPropValue;
declare const createConfig: ({ replay, easing, relativeTo, start, end, }: {
    replay: boolean;
    easing?: string;
    relativeTo?: string;
    start?: SizeStringValue;
    end?: SizeStringValue;
}) => ConfigPropValue;
declare const extractBoolean: (prop: BooleanPropValue | undefined, fallback?: boolean) => boolean;
declare const createExcludedBreakpoints: (breakpoints: string[]) => ExcludedBreakpointsPropValue;
declare const createInteractionBreakpoints: (excluded: string[]) => InteractionBreakpointsPropValue;
declare const extractExcludedBreakpoints: (breakpoints: InteractionBreakpointsPropValue | undefined) => string[];
declare const createAnimationPreset: ({ effect, type, direction, duration, delay, replay, easing, relativeTo, start, end, customEffects, }: {
    effect: string;
    type: string;
    direction?: string;
    duration: SizeStringValue;
    delay: SizeStringValue;
    replay: boolean;
    easing?: string;
    relativeTo?: string;
    start?: SizeStringValue;
    end?: SizeStringValue;
    customEffects?: PropValue;
}) => AnimationPresetPropValue;
declare const createInteractionItem: ({ trigger, effect, type, direction, duration, delay, interactionId, replay, easing, relativeTo, start, end, excludedBreakpoints, customEffects, }: {
    trigger?: string;
    effect?: string;
    type?: string;
    direction?: string;
    duration?: SizeStringValue;
    delay?: SizeStringValue;
    interactionId?: string;
    replay?: boolean;
    easing?: string;
    relativeTo?: string;
    start?: number;
    end?: number;
    excludedBreakpoints?: string[];
    customEffects?: PropValue;
}) => InteractionItemPropValue;
declare const createDefaultInteractionItem: () => InteractionItemPropValue;
declare const createDefaultInteractions: () => ElementInteractions;
declare const extractString: (prop: StringPropValue | undefined, fallback?: string) => string;
declare const extractSize: (prop?: SizePropValue, defaultValue?: SizeStringValue) => SizeStringValue;
declare const buildDisplayLabel: (item: InteractionItemValue) => string;

declare function generateTempInteractionId(): string;
declare function isTempId(id: string | undefined): boolean;

declare const resolveDirection: (hasDirection: boolean, newEffect?: string, newDirection?: string, currentDirection?: string, currentEffect?: string) => string | undefined;

declare const convertTimeUnit: (value: number, from: Unit, to: Unit) => number;

type SizeValue = SizePropValue['value'];
type SizeUnit = SizeValue['unit'];
declare const parseSizeValue: (value: SizeStringValue, allowedUnits: SizeUnit[], defaultValue?: SizeStringValue, defaultUnit?: Unit) => SizeValue;
declare const formatSizeValue: ({ size, unit }: SizeValue) => SizeStringValue;

export { BASE_EASINGS, BASE_EFFECTS, BASE_REPLAY, BASE_TRIGGERS, type CreateInteractionsProviderOptions, EASING_OPTIONS, EFFECT_OPTIONS, ELEMENTS_INTERACTIONS_PROVIDER_KEY_PREFIX, EmptyState, type FieldProps, InteractionsTab, REPLAY_OPTIONS, type ReplayFieldProps, TRIGGER_OPTIONS, buildDisplayLabel, convertTimeUnit, createAnimationPreset, createBoolean, createConfig, createDefaultInteractionItem, createDefaultInteractions, createExcludedBreakpoints, createInteractionBreakpoints, createInteractionItem, createInteractionsProvider, createNumber, createString, createTimingConfig, extractBoolean, extractExcludedBreakpoints, extractSize, extractString, formatSizeValue, generateTempInteractionId, getInteractionsConfig, init, interactionsRepository, isTempId, parseSizeValue, registerInteractionsControl, resolveDirection };
