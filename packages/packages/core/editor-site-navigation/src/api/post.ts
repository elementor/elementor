import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import { type Post } from '../types';

export type NewPost = {
	title: string;
	status: 'publish' | 'draft';
};

export type UpdatePost = {
	id: number;
	title?: string;
};

export type Slug = keyof typeof postTypesMap;

export const postTypesMap = {
	page: {
		labels: {
			singular_name: __( 'Page', 'elementor' ),
			plural_name: __( 'Pages', 'elementor' ),
		},
		rest_base: 'pages',
	},
};

export const POST_PER_PAGE = 10;

type WpPostsResponse = {
	json: () => Promise< Post[] >;
	headers: {
		get: ( key: string ) => string | null;
	};
};

export type PostsResponse = {
	data: Post[];
	totalPages: number;
	totalPosts: number;
	currentPage: number;
};

export const getRequest = async ( postTypeSlug: Slug, page: number ): Promise< PostsResponse > => {
	const baseUri = `/wp/v2/${ postTypesMap[ postTypeSlug ].rest_base }`;

	const keys: Array< keyof Post > = [ 'id', 'type', 'title', 'link', 'status', 'user_can' ];

	const queryParams = new URLSearchParams( {
		status: 'any',
		order: 'asc',
		page: page.toString(),
		per_page: POST_PER_PAGE.toString(),
		_fields: keys.join( ',' ),
	} );

	const uri = baseUri + '?' + queryParams.toString();

	const result = await apiFetch< WpPostsResponse >( { path: uri, parse: false } );
	const data = await result.json();

	const totalPages = Number( result.headers.get( 'x-wp-totalpages' ) );
	const totalPosts = Number( result.headers.get( 'x-wp-total' ) );

	return {
		data,
		totalPages,
		totalPosts,
		currentPage: page,
	};
};

export const createRequest = ( postTypeSlug: Slug, newPost: NewPost ) => {
	const path = `/wp/v2/${ postTypesMap[ postTypeSlug ].rest_base }`;

	return apiFetch< { id: number } >( {
		path,
		method: 'POST',
		data: newPost,
	} );
};

export const updateRequest = ( postTypeSlug: Slug, updatedPost: UpdatePost ) => {
	const path = `/wp/v2/${ postTypesMap[ postTypeSlug ].rest_base }`;
	const { id, ...data } = updatedPost;

	return apiFetch( {
		path: `${ path }/${ id }`,
		method: 'POST',
		data,
	} );
};

export const deleteRequest = ( postTypeSlug: Slug, postId: number ) => {
	const path = `/wp/v2/${ postTypesMap[ postTypeSlug ].rest_base }`;

	return apiFetch( {
		path: `${ path }/${ postId }`,
		method: 'DELETE',
	} );
};

export const duplicateRequest = ( originalPost: UpdatePost ) => {
	const path = `/elementor/v1/site-navigation/duplicate-post`;

	return apiFetch< { post_id: number } >( {
		path,
		method: 'POST',
		data: {
			post_id: originalPost.id,
			title: originalPost.title,
		},
	} );
};
