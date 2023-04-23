import apiFetch from '@wordpress/api-fetch';
import { useState } from 'react';

export interface NewPost {
	id: number,
	edit_url: string,
}

export type Args = {
	onCreated: ( url : string ) => void;
}

export const endpointPath = '/elementor/v1/site-navigation/add-new-post';

export default function usePage( { onCreated }: Args ) {
	const [ isLoading, setIsLoading ] = useState( false );

	return {
		createPage: () => {
			setIsLoading( true );

			addNewPage()
				.then( ( newPost ) => newPost as NewPost )
				.then( ( newPost ) => {
					setIsLoading( false );
					onCreated( newPost.edit_url );
				} )
				.catch( () => {
					setIsLoading( false );
				} );
		},
		isLoading,
	};
}

async function addNewPage() {
	return await apiFetch( {
		path: endpointPath,
		method: 'POST',
		data: { post_type: 'page' },
	} );
}
