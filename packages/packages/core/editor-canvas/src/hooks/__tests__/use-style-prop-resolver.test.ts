import { createMockPropType } from 'test-utils';
import { fontFamilyPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';
import { enqueueFont } from '@elementor/editor-v1-adapters';
import { act, renderHook } from '@testing-library/react';

import { initStyleTransformers } from '../../init-style-transformers';
import { useStylePropResolver } from '../use-style-prop-resolver';

jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '@elementor/editor-styles' );

describe( 'useStylePropResolver', () => {
	it( 'should call enqueueFont with the correct value when font-family is resolved', async () => {
		// Arrange.
		initStyleTransformers();

		jest.mocked( getStylesSchema ).mockReturnValue( {
			'font-family': createMockPropType( { key: 'string', kind: 'plain' } ),
			'another-prop': createMockPropType( { key: 'string', kind: 'plain' } ),
		} );

		const { result } = renderHook( useStylePropResolver );

		// Act.
		const resolve = result.current;

		await act( () =>
			resolve( {
				props: {
					'another-prop': stringPropTypeUtil.create( 'value' ),
				},
			} )
		);

		// Assert.
		expect( enqueueFont ).not.toHaveBeenCalled();

		// Act.
		await act( () =>
			resolve( {
				props: {
					'font-family': stringPropTypeUtil.create( 'arial' ),
				},
			} )
		);

		// Assert.
		expect( enqueueFont ).toHaveBeenCalledWith( 'arial' );
	} );

	it( 'should strip quotes from font-family before enqueuing when using font-family prop type', async () => {
		// Arrange.
		initStyleTransformers();

		jest.mocked( getStylesSchema ).mockReturnValue( {
			'font-family': createMockPropType( { key: 'font-family', kind: 'plain' } ),
		} );

		const { result } = renderHook( useStylePropResolver );

		// Act.
		await act( () =>
			result.current( {
				props: {
					'font-family': fontFamilyPropTypeUtil.create( 'Open Sans' ),
				},
			} )
		);

		// Assert.
		expect( enqueueFont ).toHaveBeenCalledWith( 'Open Sans' );
	} );
} );
