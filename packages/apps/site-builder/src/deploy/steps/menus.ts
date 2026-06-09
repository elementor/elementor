import apiFetch from '@wordpress/api-fetch';

import type { DeployMenuItem, DeployPayload, WpMenu } from '../types';

type MenuLocationEntry = {
	name: string;
	description: string;
};

type MenuLocationsResponse = Record< string, MenuLocationEntry >;

const matchLocation = ( entries: MenuLocationEntry[], pattern: RegExp ): string => {
	const match = entries.find(
		( entry ) => pattern.test( entry.name ) || pattern.test( entry.description )
	);

	return match?.name ?? '';
};

export const resolveMenuLocations = async (): Promise< { header: string; footer: string } > => {
	try {
		const locations = await apiFetch< MenuLocationsResponse >( {
			path: '/wp/v2/menu-locations',
		} );

		const entries = Object.values( locations ?? {} );

		if ( ! entries.length ) {
			return { header: '', footer: '' };
		}

		const header =
			matchLocation( entries, /header|primary|menu-1/i ) || entries[ 0 ]?.name || '';
		const footer =
			matchLocation( entries, /footer|secondary|menu-2/i ) ||
			entries[ 1 ]?.name ||
			entries[ 0 ]?.name ||
			'';

		return { header, footer };
	} catch {
		return { header: '', footer: '' };
	}
};

async function createMenu(
	name: string,
	items: DeployMenuItem[],
	pageIdMap: Record< string, number >,
	location: string
) {
	const menu = await apiFetch< WpMenu >( {
		path: '/wp/v2/menus',
		method: 'POST',
		data: {
			name,
			auto_add: false,
			...( location ? { locations: [ location ] } : {} ),
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

export async function createMenus( menus: DeployPayload[ 'menus' ], pageIdMap: Record< string, number > ) {
	if ( ! menus ) {
		return;
	}

	const { header: headerLocation, footer: footerLocation } = await resolveMenuLocations();

	if ( menus.header?.length ) {
		await createMenu( `Header-${ Date.now() }`, menus.header, pageIdMap, headerLocation );
	}

	if ( menus.footer?.length ) {
		await createMenu( `Footer-${ Date.now() }`, menus.footer, pageIdMap, footerLocation );
	}
}
