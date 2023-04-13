import apiFetch from '@wordpress/api-fetch';

export interface NewPost {
	id: number,
	edit_url: string,
}

export default function useAddNewPage() {
	return () => {
		addNewPage().then( ( newPost ) => {
			if ( 0 !== newPost.id ) {
				window.location.href = newPost.edit_url;
			}
		} );
	};
}

async function addNewPage() {
	return await apiFetch( {
		path: '/elementor/v1/site-navigation/add-new-post',
		method: 'POST',
		data: { post_type: 'page' },
	} ).then( ( newPost ) => newPost as NewPost );
}
