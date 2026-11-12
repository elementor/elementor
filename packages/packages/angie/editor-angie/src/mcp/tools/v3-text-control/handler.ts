const TOOL_NAME = 'v3-text-control';
const ALLOWED_CONTROL_TYPES = [ 'text', 'textarea', 'wysiwyg' ] as const;

type AllowedControlType = ( typeof ALLOWED_CONTROL_TYPES )[ number ];

type ElementorControl = {
	type?: string;
	ai?: {
		active?: boolean;
	};
};

type ElementorContainer = {
	model: unknown;
	settings?: {
		controls?: Record< string, ElementorControl >;
		get?: ( controlName: string ) => unknown;
	};
};

type TextControlResult = {
	elementId: string;
	controlName: string;
	controlType: AllowedControlType;
	value: string;
};

type SetTextControlResult = TextControlResult & {
	success: true;
};

export type TextControlToolParams = {
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

export const resolveTextControl = ( elementId: string, controlName: string ) => {
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
			}" is not a V3 text control. Allowed: ${ ALLOWED_CONTROL_TYPES.join( ', ' ) }.`
		);
	}

	if ( ! control.ai?.active ) {
		throw new Error( `Control "${ controlName }" does not have AI text support enabled.` );
	}

	return { container, control, controlType: control.type };
};

const normalizeValueForControl = ( controlType: AllowedControlType, value: string ) => {
	if ( 'wysiwyg' === controlType ) {
		return value.replaceAll( '\n', '<br>' );
	}

	return value;
};

export const getTextControlValue = ( {
	elementId,
	controlName,
}: {
	elementId: string;
	controlName: string;
} ): TextControlResult => {
	const { container, controlType } = resolveTextControl( elementId, controlName );
	const value = container.settings?.get?.( controlName );

	return {
		elementId,
		controlName,
		controlType,
		value: ( value as string | undefined ) ?? '',
	};
};

export const setTextControlValue = async ( {
	elementId,
	controlName,
	value,
}: {
	elementId: string;
	controlName: string;
	value: string;
} ): Promise< SetTextControlResult > => {
	const { container, controlType } = resolveTextControl( elementId, controlName );
	const normalizedValue = normalizeValueForControl( controlType, value );

	const run = getCommands()?.run;

	if ( ! run ) {
		throw new Error( 'Elementor commands API is not available.' );
	}

	await run( 'document/elements/settings', {
		container,
		settings: {
			[ controlName ]: normalizedValue,
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
		value: normalizedValue,
	};
};

export const handleTextControlTool = async (
	params: TextControlToolParams
): Promise< TextControlResult | SetTextControlResult > => {
	const { action, elementId, controlName, value } = params;

	if ( ! elementId || ! controlName ) {
		throw new Error( 'elementId and controlName are required.' );
	}

	switch ( action ) {
		case 'get':
			return getTextControlValue( { elementId, controlName } );
		case 'set':
			if ( undefined === value ) {
				throw new Error( 'value is required for set action.' );
			}

			return setTextControlValue( { elementId, controlName, value } );
		default:
			throw new Error( `Unknown action: ${ action as string }` );
	}
};
