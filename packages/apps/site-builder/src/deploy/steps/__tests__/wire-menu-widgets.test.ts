import type { DeployMenuItem } from '../../types';
import { wireMenuWidgets } from '../wire-menu-widgets';

const items: DeployMenuItem[] = [
	{ title: 'Home', pageId: 'home' },
	{ title: 'About', pageId: 'about' },
];

const pageUrlMap = {
	home: 'http://example.com/home/',
	about: 'http://example.com/about/',
};

describe( '@elementor/site-builder/deploy/wire-menu-widgets', () => {
	it( 'sets item_link on mega-menu items by order from page URLs', () => {
		const content = [
			{
				elType: 'widget',
				widgetType: 'mega-menu',
				settings: {
					menu_items: [
						{ item_title: 'Home' },
						{ item_title: 'About' },
						{ item_title: 'Unmapped' },
					],
				},
			},
		];

		wireMenuWidgets( content, { items, pageUrlMap } );

		const menuItems = ( content[ 0 ].settings as { menu_items: Array< Record< string, unknown > > } ).menu_items;
		expect( menuItems[ 0 ].item_link ).toEqual( {
			url: 'http://example.com/home/',
			is_external: '',
			nofollow: '',
		} );
		expect( menuItems[ 1 ].item_link ).toEqual( {
			url: 'http://example.com/about/',
			is_external: '',
			nofollow: '',
		} );
		expect( menuItems[ 2 ].item_link ).toBeUndefined();
	} );

	it( 'binds a nested nav-menu widget to the created menu slug', () => {
		const content = [
			{
				elType: 'section',
				elements: [
					{ elType: 'widget', widgetType: 'nav-menu', settings: { menu: 'old-slug' } },
				],
			},
		];

		wireMenuWidgets( content, { items, pageUrlMap, menuSlug: 'header-123' } );

		const navMenu = ( content[ 0 ] as { elements: Array< { settings: { menu: string } } > } ).elements[ 0 ];
		expect( navMenu.settings.menu ).toBe( 'header-123' );
	} );

	it( 'leaves nav-menu untouched when no menu slug is provided', () => {
		const content = [
			{ elType: 'widget', widgetType: 'nav-menu', settings: { menu: 'old-slug' } },
		];

		wireMenuWidgets( content, { items, pageUrlMap } );

		expect( ( content[ 0 ].settings as { menu: string } ).menu ).toBe( 'old-slug' );
	} );
} );
