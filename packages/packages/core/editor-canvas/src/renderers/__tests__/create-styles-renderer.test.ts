/* eslint-disable testing-library/render-result-naming-convention */
import type { BreakpointsMap } from '@elementor/editor-responsive';

import { createStylesRenderer, type RendererStyleDefinition } from '../create-styles-renderer';

describe( 'renderStyles', () => {
	it( 'should render styles', async () => {
		// Arrange.
		const styleDef: RendererStyleDefinition = {
			id: 'test',
			type: 'class',
			cssName: 'test',
			label: 'Test',
			variants: [
				{
					meta: { breakpoint: null, state: null },
					props: { 'font-size': '10px' },
				},
				{
					meta: { breakpoint: null, state: 'hover' },
					props: { 'font-size': '20px' },
				},
				{
					meta: { breakpoint: 'tablet', state: null },
					props: { 'font-size': '30px' },
				},
				{
					meta: { breakpoint: 'mobile', state: 'focus' },
					props: { 'font-size': '40px' },
				},
			],
		};

		const styleDefWithCssName: RendererStyleDefinition = {
			id: 'test-2',
			type: 'class',
			cssName: 'custom-name',
			label: 'Test 2',
			variants: [
				{
					meta: { breakpoint: null, state: null },
					props: { 'font-size': '50px' },
				},
			],
		};

		const resolve = jest.fn( ( { props } ) => props );

		const renderStyles = createStylesRenderer( {
			breakpoints: {
				tablet: { width: 992, type: 'max-width' },
				mobile: { width: 768, type: 'max-width' },
			} as BreakpointsMap,
			resolve,
		} );

		// Act.
		const result = await renderStyles( { styles: [ styleDef, styleDefWithCssName ] } );

		// Assert.
		expect( result ).toMatchSnapshot();

		expect( resolve ).toHaveBeenCalledTimes( 5 );
		expect( resolve ).toHaveBeenNthCalledWith( 1, { props: { 'font-size': '10px' } } );
		expect( resolve ).toHaveBeenNthCalledWith( 2, { props: { 'font-size': '20px' } } );
		expect( resolve ).toHaveBeenNthCalledWith( 3, { props: { 'font-size': '30px' } } );
		expect( resolve ).toHaveBeenNthCalledWith( 4, { props: { 'font-size': '40px' } } );
		expect( resolve ).toHaveBeenNthCalledWith( 5, { props: { 'font-size': '50px' } } );
	} );

	it( 'should add selector prefix to the output', async () => {
		// Arrange.
		const styleDef: RendererStyleDefinition = {
			id: 'test',
			type: 'class',
			cssName: 'test',
			label: 'Test',
			variants: [
				{
					meta: { breakpoint: null, state: null },
					props: { 'font-size': '24px' },
				},
			],
		};

		const resolve = jest.fn( ( { props } ) => props );

		const renderStyles = createStylesRenderer( {
			breakpoints: {} as BreakpointsMap,
			selectorPrefix: '.elementor-prefix',
			resolve,
		} );

		// Act.
		const result = await renderStyles( { styles: [ styleDef ] } );

		// Assert.
		expect( result ).toEqual( [
			{
				breakpoint: 'desktop',
				id: 'test',
				value: '.elementor-prefix .test{font-size:24px;}',
			},
		] );
	} );
} );
