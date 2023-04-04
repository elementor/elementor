import { useEffect, useState } from 'react';
import { DocType } from '../types';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { Document } from '@elementor/documents';

export interface Post {
	id: number,
	title: string,
	edit_url: string,
	type: {
		post_type: string,
		doc_type: DocType,
		label: string,
	},
	date_modified: number,
}

export default function useRecentPosts( document: unknown ) {
	const [ fetchedPosts, setFetchedPosts ] = useState<Post[]>( [] );

	useEffect( () => {
		if ( document ) {
			fetchRecentlyEditedPosts( document as Document ).then( ( posts ) => setFetchedPosts( posts ) );
		}
	}, [ document ] );

	return fetchedPosts;
}

async function fetchRecentlyEditedPosts( document: Document ) {
	const queryParams = {
		posts_per_page: 5,
		post__not_in: document.id,
	};

	return await apiFetch( {
		path: addQueryArgs( '/elementor/v1/site-navigation/recent-posts', queryParams ),
	} ).then( ( response ) => response as Post[] )
		.catch( ( ) => [] );
}
