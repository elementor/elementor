import { isSidebarEnabled, SIDEBAR_ICON_SIZE_PX } from '@elementor/editor-sidebar';

import { getToolbarChromeIconSvgSx } from '../toolbar-chrome-icon-sx';

jest.mock( '@elementor/editor-sidebar', () => ( {
	isSidebarEnabled: jest.fn(),
	SIDEBAR_ICON_SIZE_PX: 20,
} ) );

describe( 'getToolbarChromeIconSvgSx', () => {
	it( 'uses legacy rem sizing when sidebar experiment is off', () => {
		jest.mocked( isSidebarEnabled ).mockReturnValue( false );

		expect( getToolbarChromeIconSvgSx() ).toEqual( {
			fontSize: '1.25rem',
			height: '1em',
			width: '1em',
		} );
	} );

	it( 'uses sidebar rail icon px when sidebar experiment is on', () => {
		jest.mocked( isSidebarEnabled ).mockReturnValue( true );

		const iconSize = `${ SIDEBAR_ICON_SIZE_PX }px`;

		expect( getToolbarChromeIconSvgSx() ).toEqual( {
			fontSize: iconSize,
			height: iconSize,
			width: iconSize,
		} );
	} );
} );
