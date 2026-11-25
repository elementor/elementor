import apiFetch from '@wordpress/api-fetch';

export type Settings = {
	page_on_front: number;
	show_on_front: 'page' | 'posts';
};

export type UpdateReadingSettings =
	| { show_on_front: 'posts' }
	| { show_on_front: 'page'; page_on_front: number };

type Homepage = number;

export const getSettings = () => {
	const baseUri = '/elementor/v1/site-navigation/homepage';

	const uri = baseUri;

	return apiFetch< Homepage >( { path: uri } );
};

export const updateSettings = ( settings: UpdateReadingSettings ) => {
	return apiFetch( {
		path: '/wp/v2/settings',
		method: 'POST',
		data: settings,
	} );
};
