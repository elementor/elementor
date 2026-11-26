import { contentPanelListItemButtonSx } from '../content-panel-chrome';

describe( 'contentPanelListItemButtonSx', () => {
	it( 'lays out the title and trailing row actions on one flex row', () => {
		expect( contentPanelListItemButtonSx ).toEqual(
			expect.objectContaining( {
				alignItems: 'center',
				display: 'flex',
				gap: 0.5,
			} )
		);
	} );
} );
