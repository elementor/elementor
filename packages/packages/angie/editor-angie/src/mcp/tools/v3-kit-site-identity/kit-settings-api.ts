import { httpService } from '@elementor/http-client';

const ACTIVE_KIT_SETTINGS_URL = 'elementor/v1/kits/active/settings';

type KitSettingsResponse = {
	data: Record< string, unknown >;
};

export const fetchKitSettings = async ( keys: string[] ): Promise< Record< string, unknown > > => {
	const response = await httpService().get< KitSettingsResponse >( ACTIVE_KIT_SETTINGS_URL, {
		params: { keys: keys.join( ',' ) },
	} );

	return response.data.data ?? {};
};

export const updateKitSettings = async (
	settings: Record< string, unknown >
): Promise< Record< string, unknown > > => {
	const response = await httpService().put< KitSettingsResponse >( ACTIVE_KIT_SETTINGS_URL, { settings } );

	return response.data.data ?? {};
};
