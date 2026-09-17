import type {
	ElementorCommandsInstance,
	ElementorCommonInstance,
	ElementorContainer,
	ElementorInstance,
} from './types';
import { widgetMandatoryFields } from './widget-mandatory-fields';

interface McpWindow {
	elementor?: ElementorInstance;
	$e?: ElementorCommandsInstance;
	elementorCommon?: ElementorCommonInstance;
}

export const getElementor = (): ElementorInstance | undefined => ( window as unknown as McpWindow ).elementor;

export const get$e = (): ElementorCommandsInstance | undefined => ( window as unknown as McpWindow ).$e;

export const getElementorCommon = (): ElementorCommonInstance | undefined =>
	( window as unknown as McpWindow ).elementorCommon;

export async function updateRepeaterControl(
	container: ElementorContainer,
	repeaterName: string,
	widgetType: string,
	settings: Record< string, unknown >
): Promise< Record< string, unknown >[] > {
	const repeaterControl = getElementor()?.widgetsCache?.[ widgetType ]?.controls?.[ repeaterName ] as {
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
		itemModel._id = getElementorCommon()?.helpers?.getUniqueId?.();

		get$e()?.run( 'document/repeater/insert', {
			container,
			name: repeaterName,
			model: itemModel,
		} );

		insertedModels.push( itemModel );
	} );

	while ( existingItemsCount-- ) {
		await get$e()?.run( 'document/repeater/remove', { container, name: repeaterName, index: 0 } );
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
	return Object.keys( getElementor()?.selection?.elements || {} );
}

export async function restoreCurrentSelection( selectedElementId: string | null ): Promise< void > {
	const elementor = getElementor();
	const $e = get$e();
	if ( selectedElementId && elementor && $e ) {
		try {
			await $e.run( 'document/elements/select', {
				container: elementor.getContainer( selectedElementId ),
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

	const $e = get$e();
	if ( ! $e?.data?.get ) {
		return { globalStyles, remainingSettings };
	}

	const globalColorsResult = ( await $e.data.get( 'globals/colors' ) ) as
		| {
				data: Record< string, { value: unknown } >;
		  }
		| undefined;
	const globalTypographyResult = ( await $e.data.get( 'globals/typography' ) ) as
		| {
				data: Record< string, { value: unknown } >;
		  }
		| undefined;

	const globalColors = globalColorsResult?.data ?? {};
	const globalTypography = globalTypographyResult?.data ?? {};

	const keysToRemove: string[] = [];

	Object.keys( remainingSettings ).forEach( ( key ) => {
		const value = remainingSettings[ key ];
		if ( typeof value === 'string' && value ) {
			if ( globalColors[ value ] || globalTypography[ value ] ) {
				globalStyles[ key ] = value;
				keysToRemove.push( key );
			} else {
				const globalColorKey = Object.keys( globalColors ).find(
					( globalKey ) => globalColors[ globalKey ]?.value === value
				);
				const globalTypographyKey = Object.keys( globalTypography ).find( ( globalKey ) => {
					const globalTypo = globalTypography[ globalKey ];
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

	const elementor = getElementor();
	if ( Object.keys( globalStyles ).length > 0 && elementor ) {
		const container = elementor.getContainer( elementId );
		if ( container ) {
			const convertedSettings = convertToGlobalFormat( globalStyles );
			await $e?.run( 'document/globals/enable', {
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
	const container = getElementor()?.getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Container with ID ${ elementId } not found.` );
	}

	return ( container.model.attributes?.widgetType ?? 'container' ) as string;
}
