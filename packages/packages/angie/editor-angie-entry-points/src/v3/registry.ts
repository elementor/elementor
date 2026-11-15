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

export type V3AngieControlRegistration = {
	types: string[];
	buildPrompt: ( args: BuildV3AngiePromptArgs ) => string;
	getButtonLabel?: ( args: {
		getControlValue: () => unknown;
		additionalOptions?: Record< string, unknown >;
	} ) => string;
};

const registrations = new Map< string, V3AngieControlRegistration >();

export function registerV3AngieControl( registration: V3AngieControlRegistration ): void {
	for ( const type of registration.types ) {
		registrations.set( type, registration );
	}
}

export function getV3AngieControl( aiType: string ): V3AngieControlRegistration | undefined {
	return registrations.get( aiType );
}

export function clearV3AngieControls(): void {
	registrations.clear();
}
