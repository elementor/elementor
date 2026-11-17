import { getSidebarIconButtonSx } from '../sidebar-icon-button';

describe( 'getSidebarIconButtonSx', () => {
	it( 'uses compact 28px control dimensions for default state', () => {
		expect( getSidebarIconButtonSx() ).toMatchObject( {
			width: 28,
			height: 28,
			padding: '6px',
			color: 'grey.800',
			backgroundColor: 'transparent',
		} );
	} );

	it( 'applies selected styling when a toggle is active', () => {
		expect( getSidebarIconButtonSx( { selected: true } ) ).toMatchObject( {
			color: 'primary.main',
			backgroundColor: 'action.selected',
		} );
	} );
} );