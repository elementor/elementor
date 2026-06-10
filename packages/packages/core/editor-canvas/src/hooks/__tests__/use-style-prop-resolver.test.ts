import { createMockPropType } from 'test-utils';
import { fontFamilyPropTypeUtil } from '@elementor/editor-props';
import { type BreakpointsMap } from '@elementor/editor-responsive';
import { getStylesSchema } from '@elementor/editor-styles';
import { enqueueFont } from '@elementor/editor-v1-adapters';
import { act, renderHook } from '@testing-library/react';

import { initStyleTransformers } from '../../init-style-transformers';
import { createStylesRenderer } from '../../renderers/create-styles-renderer';
import { useStylePropResolver } from '../use-style-prop-resolver';

jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '@elementor/editor-styles', () => ( {
	...jest.requireActual( '@elementor/editor-styles' ),
	getStylesSchema: jest.fn(),
} ) );

describe( 'useStylePropResolver', () => {
	it( 'should enqueue fonts from stored props when rendering styles', async () => {
		// Arrange.
		initStyleTransformers();

		jest.mocked( getStylesSchema ).mockReturnValue( {
			'font-family': createMockPropType( { key: 'font-family', kind: 'plain' } ),
			color: createMockPropType( { key: 'string', kind: 'plain' } ),
		} );

		const { result } = renderHook( useStylePropResolver );
		const renderStyles = createStylesRenderer( {
			resolve: result.current,
			breakpoints: {} as BreakpointsMap,
		} );

		// Act.
		await act( () =>
			renderStyles( {
				styles: [
					{
						id: 'test-style',
						type: 'class',
						cssName: 'test-style',
						label: 'Test style',
						variants: [
							{
								meta: { breakpoint: null, state: null },
								props: {
									'font-family': fontFamilyPropTypeUtil.create( 'Open Sans' ),
								},
								custom_css: null,
							},
						],
					},
				],
			} )
		);

		// Assert.
		expect( enqueueFont ).toHaveBeenCalledWith( 'Open Sans' );
		expect( enqueueFont ).toHaveBeenCalledTimes( 1 );
	} );
} );
