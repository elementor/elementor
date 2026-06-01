import apiFetch from '@wordpress/api-fetch';

import type { CreatedMenus, DeployMenuItem, DeployPayload, WpMenu } from '../types';
import { fetchMenuLocationSlugs, isInvalidMenuLocationError, resolveMenuLocation } from './menu-locations';

type CreateMenuData = {
	name: string;
	auto_add: boolean;
	locations?: string[];
};

type CreateMenuArgs = {
	name: string;
	items: DeployMenuItem[];
	pageIdMap: Record< string, number >;
	locationCandidates: string[];
	fallbackPattern?: RegExp;
};

async function postMenu( data: CreateMenuData ): Promise< WpMenu > {
	return apiFetch< WpMenu >( {
		path: '/wp/v2/menus',
		method: 'POST',
		data,
	} );
}

async function createMenu( args: CreateMenuArgs ): Promise< WpMenu > {
	const { name, items, pageIdMap, locationCandidates, fallbackPattern } = args;

	const availableSlugs = await fetchMenuLocationSlugs();
	const location = resolveMenuLocation( availableSlugs, locationCandidates, fallbackPattern );

	const baseData: CreateMenuData = {
		name,
		auto_add: false,
	};

	let menu: WpMenu;

	try {
		menu = await postMenu( location ? { ...baseData, locations: [ location ] } : baseData );
	} catch ( error ) {
		if ( ! location || ! isInvalidMenuLocationError( error ) ) {
			throw error;
		}

		menu = await postMenu( baseData );
	}

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

	return menu;
}

export async function createMenus(
	menus: DeployPayload[ 'menus' ],
	pageIdMap: Record< string, number >
): Promise< CreatedMenus > {
	const created: CreatedMenus = {};

	if ( menus.header?.length ) {
		created.header = await createMenu( {
			name: `Header-${ Date.now() }`,
			items: menus.header,
			pageIdMap,
			locationCandidates: [ 'header', 'menu-1', 'main', 'navigation' ],
			fallbackPattern: /header|main|navigation/i,
		} );
	}

	if ( menus.footer?.length ) {
		created.footer = await createMenu( {
			name: `Footer-${ Date.now() }`,
			items: menus.footer,
			pageIdMap,
			locationCandidates: [ 'footer', 'footer-menu', 'secondary' ],
			fallbackPattern: /footer/i,
		} );
	}

	return created;
}
