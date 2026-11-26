import { getContentPanelListItemSecondarySlotCount, getContentPanelListItemSx } from '../content-panel-chrome';

describe( 'getContentPanelListItemSx', () => {
	it( 'leaves rows with only the menu slot on the shared list padding', () => {
		// Act.
		const sx = getContentPanelListItemSx( 1 );

		// Assert.
		expect( sx ).toEqual( { paddingInline: 2 } );
	} );

	it( 'insets the button end when the row needs multiple secondary slots', () => {
		// Act.
		const slotCount = getContentPanelListItemSecondarySlotCount( {
			hasHomeIcon: true,
			hasRowActions: true,
		} );
		const sx = getContentPanelListItemSx( slotCount );

		// Assert.
		expect( slotCount ).toBe( 3 );
		expect( sx ).toEqual( {
			paddingInline: 2,
			'&& > .MuiListItemButton-root': {
				paddingInlineEnd: 21,
				paddingRight: 'unset',
			},
		} );
	} );
} );
