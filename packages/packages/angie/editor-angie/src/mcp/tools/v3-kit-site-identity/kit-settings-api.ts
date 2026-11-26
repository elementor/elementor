import { httpService } from '@elementor/http-client';

const ACTIVE_KIT_SETTINGS_URL = 'elementor/v1/kits/active/settings';
const FORBIDDEN_STATUS = 403;

type KitSettingsResponse = {
	data: Record< string, unknown >;
	meta?: {
		editable?: Record< string, boolean >;
	};
};

type FetchedKitSettings = {
	settings: Record< string, unknown >;
	editable: Record< string, boolean >;
};

export const fetchKitSettings = async ( keys: string[] ): Promise< FetchedKitSettings > => {
	const response = await httpService().get< KitSettingsResponse >( ACTIVE_KIT_SETTINGS_URL, {
		params: { keys: keys.join( ',' ) },
	} );

	return {
		settings: response.data.data ?? {},
		editable: response.data.meta?.editable ?? {},
	};
};

export const updateKitSettings = async ( settings: Record< string, unknown > ): Promise< void > => {
	try {
		await httpService().put< KitSettingsResponse >( ACTIVE_KIT_SETTINGS_URL, { settings } );
	} catch ( error ) {
		if ( FORBIDDEN_STATUS === ( error as { response?: { status?: number } } )?.response?.status ) {
			throw new Error(
				`The current user is not allowed to change: ${ Object.keys( settings ).join(
					', '
				) }. Site name and description require manage_options; other kit settings require edit_theme_options.`
			);
		}

		throw error;
	}
};
