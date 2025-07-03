import apiFetch from '@wordpress/api-fetch';

import { type RecentPost } from '../types';

export const baseUrl = '/elementor/v1/site-navigation/recent-posts';
export const NUMBER_OF_RECENT_POSTS = 6;

export const getRequest = () => {
	const queryParams = new URLSearchParams( {
		posts_per_page: `${ NUMBER_OF_RECENT_POSTS }`,
	} );

	const path = `${ baseUrl }?${ queryParams.toString() }`;

	return apiFetch< RecentPost[] >( { path } );
};
