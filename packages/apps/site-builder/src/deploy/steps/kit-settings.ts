import apiFetch from '@wordpress/api-fetch';
import type { ElementorSettingResponse } from '../types';

export async function updateKitSettings( kitSettings: Record< string, unknown > ) {
	const res = await apiFetch< ElementorSettingResponse >( {
		path: '/elementor/v1/settings/elementor_active_kit',
	} );

	const kitId = res?.data?.value;

	if ( ! kitId ) {
		throw new Error( 'Could not resolve active kit ID' );
	}

	await apiFetch( {
		path: `/wp/v2/elementor_library/${ kitId }`,
		method: 'POST',
		data: {
			meta: { _elementor_page_settings: kitSettings },
		},
	} );
}
