import './types';

import type { ElementorContainer } from './types';
import { widgetMandatoryFields } from './widget-mandatory-fields';

export async function updateRepeaterControl(
	container: ElementorContainer,
	repeaterName: string,
	widgetType: string,
	settings: Record< string, unknown >
): Promise< Record< string, unknown >[] > {
	const repeaterControl = window.elementor?.widgetsCache?.[ widgetType ]?.controls?.[ repeaterName ] as {
		fields?: Record< string, { default?: unknown } >;
	};
	const existingAttribute = container.settings?.attributes?.[ repeaterName ] as { models?: unknown[] };
	let existingItemsCount = existingAttribute?.models?.length ?? 0;
	const repeaterModel: Record< string, unknown > = {};
	const insertedModels: Record< string, unknown >[] = [];

	Object.keys( repeaterControl?.fields ?? {} ).forEach( ( fieldKey ) => {
		const field = repeaterControl?.fields?.[ fieldKey ];
		repeaterModel[ fieldKey ] = field?.default || '';
	} );

	const repeaterValues = settings[ repeaterName ] as Record< string, unknown >[];
	repeaterValues.forEach( ( val ) => {
		const itemModel: Record< string, unknown > = {};
		Object.keys( repeaterModel ).forEach( ( fieldKey ) => {
			itemModel[ fieldKey ] = val[ fieldKey ] ?? repeaterModel[ fieldKey ];
		} );
		itemModel._id = window.elementorCommon?.helpers.getUniqueId();

		window.$e?.run( 'document/repeater/insert', {
			container,
			name: repeaterName,
			model: itemModel,
		} );

		insertedModels.push( itemModel );
	} );

	while ( existingItemsCount-- ) {
		await window.$e?.run( 'document/repeater/remove', { container, name: repeaterName, index: 0 } );
	}

	return insertedModels;
}

export function addMandatoryFields( settings: Record< string, unknown > ): Record< string, unknown > {
	const missingFields: Record< string, unknown > = {};

	Object.keys( settings ).forEach( ( settingKey ) => {
		const mandatoryFields = widgetMandatoryFields[ settingKey ];

		mandatoryFields?.forEach( ( mandatoryField ) => {
			if ( ! settings[ mandatoryField.mandatory ] ) {
				settings[ mandatoryField.mandatory ] = mandatoryField.default;
				missingFields[ mandatoryField.mandatory ] = mandatoryField.default;
			}
		} );
	} );

	return missingFields;
}

export function getCurrentSelection(): string[] {
	return Object.keys( window.elementor?.selection?.elements || {} );
}

export async function restoreCurrentSelection( selectedElementId: string | null ): Promise< void > {
	if ( selectedElementId && window.elementor && window.$e ) {
		try {
			await window.$e.run( 'document/elements/select', {
				container: window.elementor.getContainer( selectedElementId ),
			} );
		} catch {
			// Unable to restore selection
		}
	}
}

function convertToGlobalFormat( settings: Record< string, unknown > ): Record< string, string > {
	const converted: Record< string, string > = {};

	for ( const [ key, value ] of Object.entries( settings ) ) {
		if ( typeof value === 'string' && value.startsWith( 'globals/' ) ) {
			converted[ key ] = value;
		} else if ( key.includes( 'typography' ) ) {
			converted[ key ] = `globals/typography?id=${ value }`;
		} else {
			converted[ key ] = `globals/colors?id=${ value }`;
		}
	}

	return converted;
}

export async function extractAndApplyGlobalStyles(
	settings: Record< string, unknown >,
	elementId: string
): Promise< { globalStyles: Record< string, string >; remainingSettings: Record< string, unknown > } > {
	const globalStyles = ( settings.__globals__ || {} ) as Record< string, string >;
	const remainingSettings: Record< string, unknown > = {};

	Object.keys( settings ).forEach( ( key ) => {
		if ( key === '__globals__' ) {
			return;
		}
		remainingSettings[ key ] = settings[ key ];
	} );

	if ( ! window.$e ) {
		return { globalStyles, remainingSettings };
	}

	const globalColors = await window.$e.data.get( 'globals/colors' );
	const globalTypography = await window.$e.data.get( 'globals/typography' );

	const keysToRemove: string[] = [];

	Object.keys( remainingSettings ).forEach( ( key ) => {
		const value = remainingSettings[ key ];
		if ( typeof value === 'string' && value ) {
			if ( globalColors.data[ value ] || globalTypography.data[ value ] ) {
				globalStyles[ key ] = value;
				keysToRemove.push( key );
			} else {
				const globalColorKey = Object.keys( globalColors.data ).find(
					( globalKey ) => globalColors.data[ globalKey ]?.value === value
				);
				const globalTypographyKey = Object.keys( globalTypography.data ).find( ( globalKey ) => {
					const globalTypo = globalTypography.data[ globalKey ];
					return globalTypo && JSON.stringify( globalTypo.value ) === JSON.stringify( value );
				} );

				if ( globalColorKey ) {
					globalStyles[ key ] = globalColorKey;
					keysToRemove.push( key );
				} else if ( globalTypographyKey ) {
					globalStyles[ key ] = globalTypographyKey;
					keysToRemove.push( key );
				}
			}
		}
	} );

	const finalSettings: Record< string, unknown > = {};
	Object.keys( remainingSettings ).forEach( ( key ) => {
		if ( ! keysToRemove.includes( key ) ) {
			finalSettings[ key ] = remainingSettings[ key ];
		}
	} );

	if ( Object.keys( globalStyles ).length > 0 && window.elementor ) {
		const container = window.elementor.getContainer( elementId );
		if ( container ) {
			const convertedSettings = convertToGlobalFormat( globalStyles );
			await window.$e.run( 'document/globals/enable', {
				container,
				settings: convertedSettings,
			} );
		}
	}

	return { globalStyles, remainingSettings: finalSettings };
}

export function encodeToolJson( data: unknown ): string {
	return JSON.stringify( data ).replaceAll( '"', "'" );
}

export function getElementType( elementId: string ): string {
	const container = window.elementor?.getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Container with ID ${ elementId } not found.` );
	}

	return ( container.model.attributes.widgetType ?? 'container' ) as string;
}
