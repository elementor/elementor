import { httpService } from '@elementor/http-client';

const ELEMENTOR_SETTING_URL = 'elementor/v1/settings';

type Response< T > = { data: { value: T }; success: boolean };

export const apiClient = {
	getElementorSetting: < T >( key: string ) =>
		httpService()
			.get< Response< T > >( `${ ELEMENTOR_SETTING_URL }/${ key }` )
			.then( ( res ) => formatSettingResponse( res.data ) ),
	updateElementorSetting: < T >( key: string, value: T ) =>
		httpService().put( `${ ELEMENTOR_SETTING_URL }/${ key }`, { value } ),
};

const formatSettingResponse = < T >( response: Response< T > ) => response.data.value;
