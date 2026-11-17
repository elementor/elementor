const TOOL_NAME = 'v3-motion-effects';
const SECTION_EFFECTS = 'section_effects';
const TAB_POSITIONING_HOVER = '_tab_positioning_hover';

type MotionScope = 'entrance' | 'hover';

type WidgetCacheControl = {
	name?: string;
	section?: string;
	inner_tab?: string;
	type?: string;
	default?: unknown;
};

const UI_ONLY_CONTROL_TYPES = new Set( [ 'section', 'heading', 'raw_html', 'popover_toggle', 'divider' ] );
const ENTRANCE_CONTROL_NAMES = new Set( [ '_animation', 'animation_duration', '_animation_delay' ] );

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

const isUiOnlyControl = ( control: WidgetCacheControl ): boolean =>
	Boolean( control.type && UI_ONLY_CONTROL_TYPES.has( control.type ) );

const matchesScope = ( control: WidgetCacheControl, scope: MotionScope ): boolean => {
	if ( 'hover' === scope ) {
		return control.inner_tab === TAB_POSITIONING_HOVER;
	}

	return control.section === SECTION_EFFECTS && Boolean( control.name && ENTRANCE_CONTROL_NAMES.has( control.name ) );
};

const listScopeControlNames = ( widgetType: string, scope: MotionScope ): string[] => {
	const elementor = getElementor();
	const controls = Object.values( elementor?.widgetsCache?.[ widgetType ]?.controls ?? {} );

	return controls
		.filter( ( control ) => matchesScope( control, scope ) && ! isUiOnlyControl( control ) )
		.map( ( control ) => control.name )
		.filter( ( name ): name is string => Boolean( name ) );
};

const getControlDefault = ( widgetType: string, controlName: string ): unknown => {
	const control = getElementor()?.widgetsCache?.[ widgetType ]?.controls?.[ controlName ];

	return control && 'default' in control ? control.default : '';
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

const isDocumentContainer = ( container: ElementorContainer ): boolean =>
	container.model.get( 'elType' ) === 'document';

const assertKnownControlNames = (
	container: ElementorContainer,
	scope: MotionScope,
	settings: Record< string, unknown >
) => {
	const allowed = new Set( listScopeControlNames( resolveWidgetType( container ), scope ) );

	for ( const controlName of Object.keys( settings ) ) {
		if ( ! allowed.has( controlName ) ) {
			throw new Error( `Control "${ controlName }" is not a ${ scope } motion control on this element.` );
		}
	}
};

const assertProMotionSettingsAllowed = ( settings: Record< string, unknown > ) => {
	const hasProMotionKeys = Object.entries( settings ).some(
		( [ key, value ] ) => isProMotionSettingKey( key ) && value !== '' && value !== undefined && value !== null
	);

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

	if ( isDocumentContainer( container ) ) {
		throw new Error( `Element "${ elementId }" is a document and is not supported by ${ TOOL_NAME }.` );
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
	assertKnownControlNames( container, scope, settings );

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
	const widgetType = resolveWidgetType( container );
	const controlNames = listScopeControlNames( widgetType, scope );

	if ( ! controlNames.length ) {
		throw new Error( `No ${ scope } motion controls found on element "${ elementId }".` );
	}

	const clearedSettings = controlNames.reduce< Record< string, unknown > >( ( accumulated, controlName ) => {
		return {
			...accumulated,
			[ controlName ]: getControlDefault( widgetType, controlName ),
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
