import { useState } from 'react';
import apiFetch from '@wordpress/api-fetch';

interface NewPost {
	id: number;
	edit_url: string;
}

export const endpointPath = '/elementor/v1/site-navigation/add-new-post';

export default function useCreatePage() {
	const [ isLoading, setIsLoading ] = useState( false );

	return {
		create: () => {
			setIsLoading( true );

			return addNewPage()
				.then( ( newPost ) => newPost as NewPost )
				.finally( () => setIsLoading( false ) );
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
