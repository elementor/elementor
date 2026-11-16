const TOOL_NAME = 'v3-code-control';
const ALLOWED_CONTROL_TYPES = [ 'code' ] as const;

type AllowedControlType = ( typeof ALLOWED_CONTROL_TYPES )[ number ];

type ElementorControl = {
	type?: string;
	language?: string;
	ai?: {
		active?: boolean;
		language?: string;
	};
};

type ElementorContainer = {
	model: unknown;
	settings?: {
		controls?: Record< string, ElementorControl >;
		get?: ( controlName: string ) => unknown;
	};
};

type CodeControlResult = {
	elementId: string;
	controlName: string;
	controlType: AllowedControlType;
	language: string;
	value: string;
};

type SetCodeControlResult = CodeControlResult & {
	success: true;
};

export type CodeControlToolParams = {
	action: 'get' | 'set';
	elementId: string;
	controlName: string;
	value?: string;
};

const getElementor = () =>
	(
		window as unknown as {
			elementor?: {
				getContainer?: ( id: string ) => ElementorContainer | null | undefined;
				helpers?: { isAtomicWidget?: ( model: unknown ) => boolean };
			};
		}
	 ).elementor;

const getCommands = () =>
	(
		window as unknown as {
			$e?: { run?: ( command: string, args?: Record< string, unknown > ) => Promise< unknown > | unknown };
		}
	 ).$e;

const isAllowedControlType = ( type: string | undefined ): type is AllowedControlType =>
	Boolean( type && ( ALLOWED_CONTROL_TYPES as readonly string[] ).includes( type ) );

const resolveControlLanguage = ( control: ElementorControl ): string => control.language || control.ai?.language || '';

export const resolveCodeControl = ( elementId: string, controlName: string ) => {
	const elementor = getElementor();

	if ( ! elementor?.getContainer ) {
		throw new Error( 'Elementor editor is not available.' );
	}

	const container = elementor.getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Element with ID ${ elementId } not found.` );
	}

	if ( elementor.helpers?.isAtomicWidget?.( container.model ) ) {
		throw new Error( `Element "${ elementId }" is an atomic element and is not supported by ${ TOOL_NAME }.` );
	}

	const control = container.settings?.controls?.[ controlName ];

	if ( ! control ) {
		throw new Error( `Control "${ controlName }" not found on element ${ elementId }.` );
	}

	if ( ! isAllowedControlType( control.type ) ) {
		throw new Error(
			`Control "${ controlName }" type "${
				control.type
			}" is not a V3 code control. Allowed: ${ ALLOWED_CONTROL_TYPES.join( ', ' ) }.`
		);
	}

	if ( ! control.ai?.active ) {
		throw new Error( `Control "${ controlName }" does not have AI code support enabled.` );
	}

	return { container, control, controlType: control.type, language: resolveControlLanguage( control ) };
};

export const getCodeControlValue = ( {
	elementId,
	controlName,
}: {
	elementId: string;
	controlName: string;
} ): CodeControlResult => {
	const { container, controlType, language } = resolveCodeControl( elementId, controlName );
	const value = container.settings?.get?.( controlName );

	return {
		elementId,
		controlName,
		controlType,
		language,
		value: ( value as string | undefined ) ?? '',
	};
};

export const setCodeControlValue = async ( {
	elementId,
	controlName,
	value,
}: {
	elementId: string;
	controlName: string;
	value: string;
} ): Promise< SetCodeControlResult > => {
	const { container, controlType, language } = resolveCodeControl( elementId, controlName );

	const run = getCommands()?.run;

	if ( ! run ) {
		throw new Error( 'Elementor commands API is not available.' );
	}

	await run( 'document/elements/settings', {
		container,
		settings: {
			[ controlName ]: value,
		},
		options: {
			external: true,
		},
	} );

	return {
		success: true,
		elementId,
		controlName,
		controlType,
		language,
		value,
	};
};

export const handleCodeControlTool = async (
	params: CodeControlToolParams
): Promise< CodeControlResult | SetCodeControlResult > => {
	const { action, elementId, controlName, value } = params;

	if ( ! elementId || ! controlName ) {
		throw new Error( 'elementId and controlName are required.' );
	}

	switch ( action ) {
		case 'get':
			return getCodeControlValue( { elementId, controlName } );
		case 'set':
			if ( undefined === value ) {
				throw new Error( 'value is required for set action.' );
			}

			return setCodeControlValue( { elementId, controlName, value } );
		default:
			throw new Error( `Unknown action: ${ action as string }` );
	}
};
