import apiFetch from '@wordpress/api-fetch';

export const saveAngieConsent = async (): Promise< void > => {
	await apiFetch( {
		path: '/elementor/v1/angie/consent',
		method: 'POST',
	} );
};
