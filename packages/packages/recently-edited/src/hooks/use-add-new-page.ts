import apiFetch from '@wordpress/api-fetch';
import { useCallback } from 'react';
export interface NewPost {
	id: number,
	edit_url: string,
}
export default function useAddNewPage() {
	const createNewPage = useCallback( () => {
		addNewPage().then( ( newPost ) => {
			if ( 0 !== newPost.id ) {
				window.location.href = newPost.edit_url;
			}
		} );
	}, [] );

	return createNewPage;
}

async function addNewPage() {
	return await apiFetch( {
		path: '/elementor/v1/site-navigation/add-new-page',
		method: 'POST',
	} ).then( ( newPost ) => newPost as NewPost );
}
