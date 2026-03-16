import apiFetch from '@wordpress/api-fetch';
import type { DeployThemePart, WpPost } from '../types';

export interface ThemePartEntry {
	key: string;
	part: DeployThemePart;
}

interface OptionsSchema {
	schema?: {
		properties?: {
			meta?: {
				properties?: {
					_elementor_template_type?: {
						enum?: string[];
					};
				};
			};
		};
	};
}

async function getSupportedDocumentTypes(): Promise< string[] > {
	try {
		const schema = await apiFetch< OptionsSchema >( {
			path: '/wp/v2/elementor_library',
			method: 'OPTIONS',
		} );
		return schema?.schema?.properties?.meta?.properties?._elementor_template_type?.enum || [];
	} catch {
		return [];
	}
}

function triggerMediaImport( postId: number ) {
	apiFetch( {
		path: `/elementor/v1/documents/${ postId }/media/import`,
		method: 'POST',
		data: { id: postId },
	} ).catch( () => {} );
}

export async function createThemeParts( parts: ThemePartEntry[] ) {
	const supportedTypes = await getSupportedDocumentTypes();
	const supported = parts.filter( ( { part } ) => supportedTypes.includes( part.type ) );

	if ( ! supported.length ) {
		return;
	}

	const templateIds: Record< string, number > = {};

	for ( const { key, part } of supported ) {
		const created = await apiFetch< WpPost >( {
			path: '/wp/v2/elementor_library',
			method: 'POST',
			data: {
				title: part.title,
				status: 'publish',
				meta: {
					_elementor_edit_mode: 'builder',
					_elementor_template_type: part.type,
					_elementor_data: JSON.stringify( part.content ),
					_elementor_conditions: part.themeBuilderCondition || 'include/general',
				},
			},
		} );

		templateIds[ key ] = created.id;
		triggerMediaImport( created.id );
	}

	const conditions: Record< string, Record< number, string[] > > = {};

	for ( const { key, part } of supported ) {
		const tid = templateIds[ key ];
		if ( ! tid ) {
			continue;
		}

		const conditionValue = part.themeBuilderCondition || 'include/general';
		const bucket = part.type === 'header' ? 'header'
			: part.type === 'footer' ? 'footer'
				: 'single';

		if ( ! conditions[ bucket ] ) {
			conditions[ bucket ] = {};
		}
		conditions[ bucket ][ tid ] = [ conditionValue ];
	}

	await apiFetch( {
		path: '/elementor/v1/settings/elementor_pro_theme_builder_conditions',
		method: 'POST',
		data: { value: conditions },
	} );
}
