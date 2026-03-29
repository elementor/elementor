import './types';

import type { ElementorContainer, ElementorControls, ElementorControlsMapped } from './types';

function deepMerge< T >( target: T, source: T ): T {
	if ( ! source || typeof source !== 'object' ) {
		return target;
	}
	if ( ! target || typeof target !== 'object' ) {
		return source;
	}

	const result = { ...target } as Record< string, unknown >;

	for ( const key of Object.keys( source as object ) ) {
		const sourceValue = ( source as Record< string, unknown > )[ key ];
		const targetValue = ( target as Record< string, unknown > )[ key ];

		if ( Array.isArray( sourceValue ) ) {
			result[ key ] = sourceValue;
		} else if ( sourceValue && typeof sourceValue === 'object' ) {
			result[ key ] = deepMerge( targetValue, sourceValue );
		} else {
			result[ key ] = sourceValue;
		}
	}

	return result as T;
}

export function getPageOverView(): {
	documentId?: string;
	documentType?: string;
	title?: string;
	elements?: Record< string, unknown >[];
	error?: string;
} {
	const document = window.elementor?.documents?.getCurrent();
	if ( ! document ) {
		return { error: 'No active document found' };
	}

	function extractElementData( element: ElementorContainer ): Record< string, unknown > | null {
		if ( ! element || ! element.model ) {
			return null;
		}

		const model = element.model.attributes;
		const result: Record< string, unknown > = {
			id: model.id,
			elType: model.elType,
			widgetType: model.widgetType || undefined,
		};

		const title = ( model.title as string ) || element.model?.editor_settings?.title;

		if ( title ) {
			result.title = title;
		}

		if ( element.children && element.children.length > 0 ) {
			result.children = element.children
				.map( ( child: ElementorContainer ) => extractElementData( child ) )
				.filter( ( child ): child is Record< string, unknown > => child !== null );
		}

		return result;
	}

	const containers = document.container.children;
	const elements = containers.map( ( container: ElementorContainer ) => extractElementData( container ) );

	return {
		documentId: document.id,
		documentType: document.config.type,
		title: ( ( document.config.settings as Record< string, unknown > )?.post_title as string ) || 'Untitled',
		elements: elements.filter( ( el ): el is Record< string, unknown > => el !== null ),
	};
}

export function getElementSettings( elementId: string ): Record< string, unknown > {
	const container = window.elementor?.getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Container with ID ${ elementId } not found.` );
	}

	const settings = container.settings.attributes || {};
	const modelAttributes = container.model.attributes || {};

	const cleanSettings: Record< string, unknown > = {};
	const excludeModelAttributes = [ 'settings', 'editSettings', 'defaultEditSettings' ];

	Object.keys( { ...settings, ...modelAttributes } ).forEach( ( key ) => {
		const settingsValue = settings[ key ];
		const modelValue = modelAttributes[ key ];
		const value = settingsValue !== undefined ? settingsValue : modelValue;

		if (
			! excludeModelAttributes.includes( key ) &&
			typeof value !== 'function' &&
			! (
				value &&
				typeof value === 'object' &&
				( value as { constructor?: { name?: string } } ).constructor?.name?.includes( 'Model' )
			)
		) {
			cleanSettings[ key ] = value;
		}
	} );

	return cleanSettings;
}

function mapControlsToSchema( controlsData: ElementorControls ): ElementorControlsMapped {
	if ( ! controlsData || typeof controlsData !== 'object' ) {
		return {};
	}

	return Object.fromEntries(
		Object.entries( controlsData )
			.filter( ( [ , control ] ) => ! [ 'section', 'tab', 'tabs' ].includes( control.type ) )
			.map( ( [ controlKey, control ] ) => {
				let options;

				const controlConfig = window.elementor?.config?.controls?.[ control.type ] || {};
				const completeConfig = deepMerge( controlConfig, control ) as Record< string, unknown >;
				const returnValue = completeConfig.return_value;

				if ( completeConfig.options ) {
					options = Object.keys( completeConfig.options as Record< string, unknown > );
				}

				let fields;

				if ( completeConfig.fields ) {
					fields = mapControlsToSchema( completeConfig.fields as ElementorControls );
				}

				const returnConfig: ElementorControlsMapped[ string ] = {
					type: control.type,
					default: completeConfig.default as unknown,
				};

				if ( options ) {
					returnConfig.options = options;
				}

				if ( fields ) {
					returnConfig.fields = fields;
				}

				if ( completeConfig.size_units ) {
					returnConfig.size_units = completeConfig.size_units as string[];
				}

				if ( returnValue !== undefined ) {
					returnConfig.onValue = returnValue as string;
				}

				return [ controlKey, returnConfig ];
			} )
	);
}

function getDocumentSchema( documentId: string ): ElementorControlsMapped | undefined {
	const document = window.elementor?.documents.get( documentId );
	if ( ! document ) {
		return;
	}

	const controls = document.config?.settings.controls;
	return mapControlsToSchema( controls as ElementorControls );
}

export function getElementSchema( type: string ): ElementorControlsMapped {
	const controls = window.elementor?.widgetsCache[ type ]?.controls;
	return mapControlsToSchema( controls as ElementorControls );
}

export function loadDocumentSettings( documentId: string ): Record< string, unknown > | undefined {
	const document = window.elementor?.documents?.get( documentId );
	if ( ! document ) {
		return;
	}

	const allSettings = document.config?.settings.settings || {};
	const controls = document.config?.settings.controls || {};
	const result: Record< string, unknown > = {};

	Object.entries( allSettings ).forEach( ( [ controlKey, value ] ) => {
		const control = controls[ controlKey ] as { default?: unknown } | undefined;
		if ( value !== control?.default ) {
			result[ controlKey ] = value;
		}
	} );

	return result;
}

export function loadDocumentSchema( documentId: string ): ElementorControlsMapped | undefined {
	return getDocumentSchema( documentId );
}
