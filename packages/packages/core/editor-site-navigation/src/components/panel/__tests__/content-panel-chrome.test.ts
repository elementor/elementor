import {
	contentPanelListItemButtonSx,
	getContentPanelListItemRowStateSx,
	getContentPanelListItemSx,
} from '../content-panel-chrome';

describe( 'getContentPanelListItemSx', () => {
	it( 'reserves trailing space for secondary actions on the list row button', () => {
		const sx = getContentPanelListItemSx( 2 );

		expect( sx ).toEqual(
			expect.objectContaining( {
				'&& > .MuiListItemButton-root': expect.objectContaining( {
					paddingInlineEnd: 11,
				} ),
			} )
		);
	} );
} );

describe( 'getContentPanelListItemRowStateSx', () => {
	it( 'applies selected background on the list row container', () => {
		expect( getContentPanelListItemRowStateSx( true, true ) ).toEqual(
			expect.objectContaining( {
				backgroundColor: 'action.selected',
			} )
		);
	} );
} );

describe( 'contentPanelListItemButtonSx', () => {
	it( 'keeps the row button background transparent so the list item can paint selection', () => {
		expect( contentPanelListItemButtonSx ).toEqual(
			expect.objectContaining( {
				backgroundColor: 'transparent',
			} )
		);
	} );
} );
