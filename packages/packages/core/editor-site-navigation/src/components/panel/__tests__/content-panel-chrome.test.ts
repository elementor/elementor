import { getContentPanelListItemSx } from '../content-panel-chrome';

describe( 'getContentPanelListItemSx', () => {
	it( 'leaves rows without an action slot on the shared list padding', () => {
		// Act.
		const sx = getContentPanelListItemSx( false );

		// Assert.
		expect( sx ).toEqual( { paddingInline: 2 } );
	} );

	it( 'insets only the button end when the active row has an action slot', () => {
		// Act.
		const sx = getContentPanelListItemSx( true );

		// Assert.
		expect( sx ).toEqual( {
			paddingInline: 2,
			'&& > .MuiListItemButton-root': {
				paddingInlineEnd: 11,
				paddingRight: 'unset',
			},
		} );
	} );
} );
