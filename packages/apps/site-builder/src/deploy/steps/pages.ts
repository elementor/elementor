import apiFetch from '@wordpress/api-fetch';
import type { DeployPage, WpPost } from '../types';

function triggerMediaImport( postId: number ) {
	apiFetch( {
		path: `/elementor/v1/documents/${ postId }/media/import`,
		method: 'POST',
		data: { id: postId },
	} ).catch( () => {} );
}

export async function createPages( pages: DeployPage[] ) {
	const pageIdMap: Record< string, number > = {};

	for ( const page of pages ) {
		const created = await apiFetch< WpPost >( {
			path: '/wp/v2/pages',
			method: 'POST',
			data: {
				title: page.title,
				status: 'publish',
				meta: {
					_elementor_edit_mode: 'builder',
					_elementor_template_type: 'wp-page',
					_elementor_data: JSON.stringify( page.content ),
				},
			},
		} );

		pageIdMap[ page.id ] = created.id;
		triggerMediaImport( created.id );
	}

	return pageIdMap;
}

export async function setHomePage( homePageWpId: number ) {
	await apiFetch( {
		path: '/wp/v2/settings',
		method: 'POST',
		data: {
			page_on_front: homePageWpId,
			show_on_front: 'page',
		},
	} );
}
