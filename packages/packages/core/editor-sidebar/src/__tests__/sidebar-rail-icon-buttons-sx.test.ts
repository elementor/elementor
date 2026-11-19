import { sidebarRailIconButtonsSx } from '../sidebar-rail-icon-buttons-sx';

describe( 'sidebarRailIconButtonsSx', () => {
	it( 'styles default rail icon buttons', () => {
		expect( sidebarRailIconButtonsSx ).toMatchObject( {
			'& .MuiIconButton-root': {
				borderRadius: 1,
				color: 'grey.800',
			},
		} );
	} );

	it( 'keeps selected background on hover for emphasized controls', () => {
		expect( sidebarRailIconButtonsSx ).toMatchObject( {
			'& .MuiIconButton-root:is([aria-pressed="true"], [aria-expanded="true"])': {
				'&:hover': {
					backgroundColor: 'action.selected',
				},
			},
		} );
	} );
} );
