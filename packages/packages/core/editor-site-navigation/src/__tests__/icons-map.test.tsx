import * as React from 'react';

import { extendIconsMap, getIconsMap, resetIconsMap } from '../icons-map';

describe( '@elementor/site-navigation - iconsMap', () => {
	afterEach( () => {
		resetIconsMap();
	} );

	it( 'should override existing icons', async () => {
		// Arrange.
		const initialIcons = getIconsMap();
		const addedIcons = {
			'added-icon': () => <div>added-icon</div>,
		};

		// Act - add icons.
		extendIconsMap( addedIcons );

		// Assert - should be initial and added.
		expect( getIconsMap() ).toEqual( { ...initialIcons, ...addedIcons } );

		// Arrange.
		const overrideIcons = {
			'added-icon': () => <div>override-icon</div>,
		};

		// Act - override exits icons.
		extendIconsMap( overrideIcons );

		// Assert - should override exits icons.
		expect( getIconsMap() ).toEqual( { ...initialIcons, ...overrideIcons } );
	} );
} );
