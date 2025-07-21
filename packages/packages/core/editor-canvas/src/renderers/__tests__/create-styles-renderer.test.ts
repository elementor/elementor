/* eslint-disable testing-library/render-result-naming-convention */
import type { BreakpointsMap } from '@elementor/editor-responsive';
import { encodeString } from '@elementor/utils';

import { createStylesRenderer, type RendererStyleDefinition } from '../create-styles-renderer';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	isExperimentActive: jest.fn().mockReturnValue( true ),
} ) );

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
					custom_css: null,
				},
				{
					meta: { breakpoint: null, state: 'hover' },
					props: { 'font-size': '20px' },
					custom_css: null,
				},
				{
					meta: { breakpoint: 'tablet', state: null },
					props: { 'font-size': '30px' },
					custom_css: null,
				},
				{
					meta: { breakpoint: 'mobile', state: 'focus' },
					props: { 'font-size': '40px' },
					custom_css: null,
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
					custom_css: null,
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
					custom_css: null,
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

describe( 'custom_css rendering', () => {
	it( 'should not render custom_css if raw is empty', async () => {
		// Arrange.
		const styleDef: RendererStyleDefinition = {
			id: 'test',
			type: 'class',
			cssName: 'test',
			label: 'Test',
			variants: [ { meta: { breakpoint: null, state: null }, props: {}, custom_css: { raw: '' } } ],
		};

		// Act.
		const renderStyles = createStylesRenderer( { breakpoints: {} as BreakpointsMap, resolve: async () => ( {} ) } );
		const result = await renderStyles( { styles: [ styleDef ] } );

		// Assert.
		expect( result[ 0 ].value ).not.toContain( '{;}' );
	} );

	it( 'should not render custom_css if raw is whitespace', async () => {
		// Arrange.
		const styleDef: RendererStyleDefinition = {
			id: 'test',
			type: 'class',
			cssName: 'test',
			label: 'Test',
			variants: [
				{ meta: { breakpoint: null, state: null }, props: {}, custom_css: { raw: encodeString( '   \n\t' ) } },
			],
		};

		// Act.
		const renderStyles = createStylesRenderer( { breakpoints: {} as BreakpointsMap, resolve: async () => ( {} ) } );
		const result = await renderStyles( { styles: [ styleDef ] } );

		// Assert.
		expect( result[ 0 ].value ).not.toContain( '{;}' );
	} );

	it( 'should not render custom_css if raw is invalid encoded string', async () => {
		// Arrange.
		const styleDef: RendererStyleDefinition = {
			id: 'test',
			type: 'class',
			cssName: 'test',
			label: 'Test',
			variants: [
				{ meta: { breakpoint: null, state: null }, props: {}, custom_css: { raw: 'I cannot be decoded' } },
			],
		};

		// Act.
		const renderStyles = createStylesRenderer( { breakpoints: {} as BreakpointsMap, resolve: async () => ( {} ) } );
		const result = await renderStyles( { styles: [ styleDef ] } );

		// Assert.
		expect( result[ 0 ].value ).not.toContain( '{;}' );
	} );

	it( 'should render custom_css if raw is valid base64 encoded string', async () => {
		// Arrange.
		const styleDef: RendererStyleDefinition = {
			id: 'test',
			type: 'class',
			cssName: 'test',
			label: 'Test',
			variants: [
				{
					meta: { breakpoint: null, state: null },
					props: {},
					custom_css: { raw: encodeString( 'body { color: red; }' ) },
				},
			],
		};

		// Act.
		const renderStyles = createStylesRenderer( { breakpoints: {} as BreakpointsMap, resolve: async () => ( {} ) } );
		const result = await renderStyles( { styles: [ styleDef ] } );

		// Assert.
		expect( result[ 0 ].value ).toContain( 'body { color: red; }' );
	} );
} );
