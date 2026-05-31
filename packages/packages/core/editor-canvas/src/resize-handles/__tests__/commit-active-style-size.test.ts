import { sizePropTypeUtil } from '@elementor/editor-props';

import {
	createSizePropFromPixels,
	MIN_RESIZE_SIZE_PX,
	roundResizePixels,
} from '../commit-active-style-size';

describe( 'commit-active-style-size helpers', () => {
	it( 'should round resize pixels to at least the minimum size', () => {
		expect( roundResizePixels( 0 ) ).toBe( MIN_RESIZE_SIZE_PX );
		expect( roundResizePixels( 42.6 ) ).toBe( 43 );
	} );

	it( 'should create a px size prop value', () => {
		const prop = createSizePropFromPixels( 120 );

		expect( sizePropTypeUtil.extract( prop ) ).toEqual( { size: 120, unit: 'px' } );
	} );
} );
