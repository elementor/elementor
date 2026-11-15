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

export type V3AngieControlRegistration = {
	types: string[];
	buildPrompt: ( args: BuildV3AngiePromptArgs ) => string;
	getButtonLabel?: ( args: GetButtonLabelArgs ) => string;
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
