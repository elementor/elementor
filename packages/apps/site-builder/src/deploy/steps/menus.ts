import apiFetch from '@wordpress/api-fetch';
import type { DeployMenuItem, DeployPayload, WpMenu } from '../types';

async function createMenu(
	name: string,
	items: DeployMenuItem[],
	pageIdMap: Record< string, number >,
	location: string,
) {
	const menu = await apiFetch< WpMenu >( {
		path: '/wp/v2/menus',
		method: 'POST',
		data: {
			name,
			auto_add: false,
			locations: [ location ],
		},
	} );

	const menuItemPromises = items.map( ( item, index ) => {
		const objectId = pageIdMap[ item.pageId ];

		if ( ! objectId ) {
			return Promise.resolve();
		}

		return apiFetch( {
			path: '/wp/v2/menu-items',
			method: 'POST',
			data: {
				title: item.title,
				object_id: objectId,
				menus: menu.id,
				object: 'page',
				type: 'post_type',
				status: 'publish',
				menu_order: index + 1,
				parent: 0,
			},
		} );
	} );

	await Promise.all( menuItemPromises );
}

export async function createMenus(
	menus: DeployPayload[ 'menus' ],
	pageIdMap: Record< string, number >,
) {
	if ( menus.header?.length ) {
		await createMenu( `Header-${ Date.now() }`, menus.header, pageIdMap, 'primary' );
	}

	if ( menus.footer?.length ) {
		await createMenu( `Footer-${ Date.now() }`, menus.footer, pageIdMap, 'footer' );
	}
}
