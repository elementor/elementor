const TOOL_NAME = 'v3-motion-effects';
const SECTION_EFFECTS = 'section_effects';
const TAB_POSITIONING_HOVER = '_tab_positioning_hover';

type MotionScope = 'entrance' | 'hover';

type WidgetCacheControl = {
	name?: string;
	section?: string;
	inner_tab?: string;
};

type ElementorContainer = {
	model: {
		get: ( key: string ) => unknown;
	};
	settings?: {
		controls?: Record< string, unknown >;
		get?: ( controlName: string ) => unknown;
	};
};

type MotionEffectsResult = {
	elementId: string;
	scope: MotionScope;
	settings: Record< string, unknown >;
	widgetType: string;
};

type SetMotionEffectsResult = MotionEffectsResult & {
	success: true;
};

export type MotionEffectsToolParams = {
	action: 'get' | 'set' | 'clear';
	elementId: string;
	scope?: MotionScope;
	settings?: Record< string, unknown >;
};

const getElementor = () =>
	(
		window as unknown as {
			elementor?: {
				getContainer?: ( id: string ) => ElementorContainer | null | undefined;
				helpers?: { isAtomicWidget?: ( model: unknown ) => boolean; hasPro?: () => boolean };
				widgetsCache?: Record< string, { controls?: Record< string, WidgetCacheControl > } >;
			};
		}
	 ).elementor;

const getCommands = () =>
	(
		window as unknown as {
			$e?: { run?: ( command: string, args?: Record< string, unknown > ) => Promise< unknown > | unknown };
		}
	 ).$e;

const isProMotionSettingKey = ( key: string ): boolean =>
	key.startsWith( 'motion_fx_' ) || key.startsWith( 'background_motion_fx_' );

export const resolveWidgetType = ( container: ElementorContainer ): string => {
	const widgetType = container.model.get( 'widgetType' );
	return ( widgetType as string | undefined ) ?? 'container';
};

const listScopeControlNames = ( widgetType: string, scope: MotionScope ): string[] => {
	const elementor = getElementor();
	const controls = Object.values( elementor?.widgetsCache?.[ widgetType ]?.controls ?? {} );

	return controls
		.filter( ( control ) =>
			'hover' === scope ? control.inner_tab === TAB_POSITIONING_HOVER : control.section === SECTION_EFFECTS
		)
		.map( ( control ) => control.name )
		.filter( ( name ): name is string => Boolean( name ) );
};

const readScopeSettings = ( container: ElementorContainer, scope: MotionScope ): Record< string, unknown > => {
	const controlNames = listScopeControlNames( resolveWidgetType( container ), scope );

	return controlNames.reduce< Record< string, unknown > >( ( accumulated, controlName ) => {
		return {
			...accumulated,
			[ controlName ]: container.settings?.get?.( controlName ),
		};
	}, {} );
};

const assertKnownControlNames = ( container: ElementorContainer, settings: Record< string, unknown > ) => {
	const knownControls = container.settings?.controls ?? {};

	for ( const controlName of Object.keys( settings ) ) {
		if ( ! knownControls[ controlName ] ) {
			throw new Error( `Control "${ controlName }" not found on element.` );
		}
	}
};

const assertProMotionSettingsAllowed = ( settings: Record< string, unknown > ) => {
	const hasProMotionKeys = Object.keys( settings ).some( isProMotionSettingKey );

	if ( ! hasProMotionKeys ) {
		return;
	}

	const hasPro = getElementor()?.helpers?.hasPro?.();

	if ( ! hasPro ) {
		throw new Error(
			'Pro-only motion_fx settings cannot be applied without Elementor Pro. Remove motion_fx_* keys from the payload.'
		);
	}
};

export const resolveMotionEffectsContainer = ( elementId: string ) => {
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

	return container;
};

export const getMotionEffects = ( {
	elementId,
	scope = 'entrance',
}: {
	elementId: string;
	scope?: MotionScope;
} ): MotionEffectsResult => {
	const container = resolveMotionEffectsContainer( elementId );

	return {
		elementId,
		scope,
		widgetType: resolveWidgetType( container ),
		settings: readScopeSettings( container, scope ),
	};
};

export const setMotionEffects = async ( {
	elementId,
	scope = 'entrance',
	settings,
}: {
	elementId: string;
	scope?: MotionScope;
	settings: Record< string, unknown >;
} ): Promise< SetMotionEffectsResult > => {
	const container = resolveMotionEffectsContainer( elementId );

	if ( ! settings || ! Object.keys( settings ).length ) {
		throw new Error( 'settings must contain at least one key for set action.' );
	}

	assertProMotionSettingsAllowed( settings );
	assertKnownControlNames( container, settings );

	const run = getCommands()?.run;

	if ( ! run ) {
		throw new Error( 'Elementor commands API is not available.' );
	}

	await run( 'document/elements/settings', {
		container,
		settings,
		options: {
			external: true,
		},
	} );

	return {
		success: true,
		elementId,
		scope,
		widgetType: resolveWidgetType( container ),
		settings: readScopeSettings( container, scope ),
	};
};

export const clearMotionEffects = async ( {
	elementId,
	scope,
}: {
	elementId: string;
	scope: MotionScope;
} ): Promise< SetMotionEffectsResult > => {
	const container = resolveMotionEffectsContainer( elementId );
	const controlNames = listScopeControlNames( resolveWidgetType( container ), scope );

	const clearedSettings = controlNames.reduce< Record< string, unknown > >( ( accumulated, controlName ) => {
		return {
			...accumulated,
			[ controlName ]: '',
		};
	}, {} );

	return setMotionEffects( { elementId, scope, settings: clearedSettings } );
};

export const handleMotionEffectsTool = async (
	params: MotionEffectsToolParams
): Promise< MotionEffectsResult | SetMotionEffectsResult > => {
	const { action, elementId, scope, settings } = params;

	if ( ! elementId ) {
		throw new Error( 'elementId is required.' );
	}

	switch ( action ) {
		case 'get':
			return getMotionEffects( { elementId, scope: scope ?? 'entrance' } );
		case 'set':
			if ( ! settings ) {
				throw new Error( 'settings is required for set action.' );
			}

			return setMotionEffects( { elementId, scope: scope ?? 'entrance', settings } );
		case 'clear':
			if ( ! scope ) {
				throw new Error( 'scope is required for clear action.' );
			}

			return clearMotionEffects( { elementId, scope } );
		default:
			throw new Error( `Unknown action: ${ action as string }` );
	}
};
