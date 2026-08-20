import type { DeployMenuItem, ElementorContentNode } from '../types';

const MEGA_MENU_WIDGET_TYPE = 'mega-menu';
const NAV_MENU_WIDGET_TYPE = 'nav-menu';

type MenuItemLink = {
	url: string;
	is_external: string;
	nofollow: string;
};

export type WireMenuWidgetsOptions = {
	items: DeployMenuItem[];
	pageUrlMap: Record< string, string >;
	menuSlug?: string;
};

function buildItemLink( url: string ): MenuItemLink {
	return { url, is_external: '', nofollow: '' };
}

function wireMegaMenu(
	node: ElementorContentNode,
	items: DeployMenuItem[],
	pageUrlMap: Record< string, string >
): number {
	const menuItems = node.settings?.menu_items;
	if ( ! Array.isArray( menuItems ) ) {
		return 0;
	}

	let patched = 0;
	menuItems.forEach( ( menuItem, index ) => {
		const item = items[ index ];
		if ( ! item || typeof menuItem !== 'object' || menuItem === null ) {
			return;
		}

		const url = pageUrlMap[ item.pageId ];
		if ( ! url ) {
			return;
		}

		( menuItem as Record< string, unknown > ).item_link = buildItemLink( url );
		patched += 1;
	} );

	return patched;
}

function wireNavMenu( node: ElementorContentNode, menuSlug?: string ): number {
	if ( ! menuSlug || ! node.settings ) {
		return 0;
	}

	node.settings.menu = menuSlug;
	return 1;
}

export function wireMenuWidgets( content: ElementorContentNode[], options: WireMenuWidgetsOptions ): void {
	const walk = ( nodes: ElementorContentNode[] ) => {
		for ( const node of nodes ) {
			if ( node.widgetType === MEGA_MENU_WIDGET_TYPE ) {
				wireMegaMenu( node, options.items, options.pageUrlMap );
			} else if ( node.widgetType === NAV_MENU_WIDGET_TYPE ) {
				wireNavMenu( node, options.menuSlug );
			}

			if ( Array.isArray( node.elements ) ) {
				walk( node.elements );
			}
		}
	};

	walk( content );
}
