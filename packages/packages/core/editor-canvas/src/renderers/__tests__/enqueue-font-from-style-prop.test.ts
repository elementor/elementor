import { createMockPropType } from 'test-utils';
import { fontFamilyPropTypeUtil } from '@elementor/editor-props';
import { enqueueFont } from '@elementor/editor-v1-adapters';

import { maybeEnqueueFontFromStyleProp } from '../enqueue-font-from-style-prop';

jest.mock( '@elementor/editor-v1-adapters' );

describe( 'maybeEnqueueFontFromStyleProp', () => {
	it( 'should enqueue when prop type implements getEnqueueFontFamily', () => {
		maybeEnqueueFontFromStyleProp(
			createMockPropType( { key: 'font-family', kind: 'plain' } ),
			fontFamilyPropTypeUtil.create( 'Open Sans' ),
			enqueueFont
		);

		expect( enqueueFont ).toHaveBeenCalledWith( 'Open Sans' );
	} );

	it( 'should not enqueue when prop type does not implement font enqueue', () => {
		maybeEnqueueFontFromStyleProp(
			createMockPropType( { key: 'string', kind: 'plain' } ),
			{ $$type: 'string', value: 'red' },
			enqueueFont
		);

		expect( enqueueFont ).not.toHaveBeenCalled();
	} );
} );
