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

export default function useRecentPosts( documentId?: number ) {
	const [ fetchedPosts, setFetchedPosts ] = useState<Post[]>( [] );

	useEffect( () => {
		if ( documentId ) {
			fetchRecentlyEditedPosts( documentId ).then( ( posts ) => setFetchedPosts( posts ) );
		}
	}, [ documentId ] );

	return fetchedPosts;
}

async function fetchRecentlyEditedPosts( documentId: number ) {
	const queryParams = {
		posts_per_page: 5,
		post__not_in: documentId,
	};

	return await apiFetch( {
		path: addQueryArgs( '/elementor/v1/site-navigation/recent-posts', queryParams ),
	} ).then( ( response ) => response as Post[] )
		.catch( ( ) => [] );
}
