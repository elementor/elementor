import apiFetch from '@wordpress/api-fetch';

import type { CreatePagesResult, DeployPage, WpPost } from '../types';

// Matches PageTemplatesModule::TEMPLATE_CANVAS. Maps to the `_wp_page_template` meta.
const ELEMENTOR_CANVAS_PAGE_TEMPLATE = 'elementor_canvas';

export async function createPages( pages: DeployPage[] ): Promise< CreatePagesResult > {
	const pageIdMap: Record< string, number > = {};
	const pageUrlMap: Record< string, string > = {};

	for ( const page of pages ) {
		const created = await apiFetch< WpPost >( {
			path: '/wp/v2/pages',
			method: 'POST',
			data: {
				title: page.title,
				status: 'publish',
				template: ELEMENTOR_CANVAS_PAGE_TEMPLATE,
				meta: {
					_elementor_edit_mode: 'builder',
					_elementor_template_type: 'wp-page',
					_elementor_data: JSON.stringify( page.content ),
				},
			},
		} );

		pageIdMap[ page.id ] = created.id;
		if ( created.link ) {
			pageUrlMap[ page.id ] = created.link;
		}
	}

	return { pageIdMap, pageUrlMap };
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
