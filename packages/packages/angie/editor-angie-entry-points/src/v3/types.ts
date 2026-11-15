export type V3AngieControlContext = {
	elementId?: string;
	controlName?: string;
	controlType?: string;
	controlValue?: unknown;
	isRepeaterItem?: boolean;
	documentType?: string;
	elementType?: string;
	widgetType?: string;
};

export type BuildV3AngiePromptArgs = {
	type: string;
	controlType: string;
	getControlValue: () => unknown;
	context: V3AngieControlContext;
	additionalOptions?: Record< string, unknown >;
};

export type GetButtonLabelArgs = {
	getControlValue: () => unknown;
	additionalOptions?: Record< string, unknown >;
};

export type V3ControlViewWithGetValue = V3ControlView & { getControlValue: () => unknown };

export type V3AngieControlRegistration = {
	types: string[];
	buildPrompt: ( args: BuildV3AngiePromptArgs ) => string;
	getButtonLabel?: ( args: GetButtonLabelArgs ) => string;
	getAdditionalOptions?: ( view: V3ControlView, aiType: string ) => Record< string, unknown >;
	getGetControlValue?: ( view: V3ControlViewWithGetValue, aiType: string ) => () => unknown;
	forceLabelBlock?: boolean;
};

export type V3ControlView = {
	options: {
		model: {
			get: ( key: string ) => unknown;
		};
		container?: {
			id?: string;
			type?: string;
			document?: { config: { type: string } };
			args?: { model: { get: ( key: string ) => unknown } };
			settings?: { get: ( key: string ) => unknown };
		};
	};
	getControlValue?: () => unknown;
};

export type BehaviorsMap = Record< string, unknown >;

export type MarionetteBehaviorConstructor = new () => Record< string, unknown >;

export type BehaviorJQueryElement = {
	html: ( markup: string ) => BehaviorJQueryElement;
	addClass: ( className: string ) => BehaviorJQueryElement;
	append: ( text: string ) => BehaviorJQueryElement;
	tipsy?: ( options: { gravity: string; title: () => string } ) => void;
};

export type BehaviorDomQuery = {
	length: number;
	after: ( element: BehaviorJQueryElement ) => void;
	find: ( selector: string ) => BehaviorDomQuery;
};

export type AngieBehaviorView = {
	getOption: ( key: string ) => unknown;
	$el: BehaviorDomQuery;
	getAiButtonLabel: () => string;
};

/**
 * Runtime editor globals used by V3 Angie entry points.
 * Kept local so we do not narrow the shared Window.elementor / Marionette shapes
 * in packages/types/global.d.ts (those must stay additive for the monorepo).
 */
export type ExtendedWindow = Window & {
	Marionette?: {
		Behavior: {
			extend: ( proto: Record< string, unknown > ) => MarionetteBehaviorConstructor;
		};
	};
	jQuery?: ( tag: string, attrs?: Record< string, string > ) => BehaviorJQueryElement;
	ElementorAiConfig?: {
		is_get_started?: boolean | string;
	};
	elementor?: Window[ 'elementor' ] & {
		hooks?: {
			addFilter: (
				name: string,
				callback: ( behaviors: Record< string, unknown >, view: unknown ) => Record< string, unknown >,
				priority?: number
			) => void;
		};
	};
};

export function getExtendedWindow(): ExtendedWindow {
	return window as ExtendedWindow;
}
