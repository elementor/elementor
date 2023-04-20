import apiFetch from '@wordpress/api-fetch';
import { useState } from 'react';

export interface NewPost {
	id: number,
	edit_url: string,
}

export default function usePage() {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ pageData, setPageData ] = useState<NewPost|null>( null );

	return {
		createPage: () => {
			setIsLoading( true );

			addNewPage()
				.then( ( newPost ) => newPost as NewPost )
				.then( ( newPost ) => {
					setIsLoading( false );
					setPageData( newPost );
				} )
				.catch( () => {
					setIsLoading( false );
				} );
		},
		isLoading,
		pageData,
	};
}

async function addNewPage() {
	return await apiFetch( {
		path: '/elementor/v1/site-navigation/add-new-post',
		method: 'POST',
		data: { post_type: 'page' },
	} );
}
