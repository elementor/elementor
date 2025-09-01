import { createMockPropType } from 'test-utils';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';
import { act, renderHook } from '@testing-library/react';

import { initStyleTransformers } from '../../init-style-transformers';
import { enqueueFont } from '../../sync/enqueue-font';
import { useStylePropResolver } from '../use-style-prop-resolver';

jest.mock( '../../sync/enqueue-font' );
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
} );
