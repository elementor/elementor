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
				state: null,
			},
		] );
	} );
} );

describe( 'breakpoint deduplication', () => {
	it( 'should render all breakpoints when same id has multiple breakpoint variants', async () => {
		// Arrange - simulates output from breakToBreakpoints in use-style-items.
		const desktopStyle: RendererStyleDefinition = {
			id: 'button-style',
			type: 'class',
			cssName: 'e-button',
			label: 'Button',
			variants: [ { meta: { breakpoint: null, state: null }, props: { 'font-size': '16px' }, custom_css: null } ],
		};
		const tabletStyle: RendererStyleDefinition = {
			...desktopStyle,
			variants: [
				{ meta: { breakpoint: 'tablet', state: null }, props: { 'font-size': '14px' }, custom_css: null },
			],
		};
		const mobileStyle: RendererStyleDefinition = {
			...desktopStyle,
			variants: [
				{ meta: { breakpoint: 'mobile', state: null }, props: { 'font-size': '12px' }, custom_css: null },
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
		const result = await renderStyles( { styles: [ desktopStyle, tabletStyle, mobileStyle ] } );

		// Assert - all three breakpoints must be rendered (previously tablet/mobile were dropped).
		expect( result ).toHaveLength( 3 );
		expect( result.map( ( r ) => r.breakpoint ) ).toEqual( [ 'desktop', 'tablet', 'mobile' ] );
		expect( result[ 0 ].value ).toContain( 'font-size:16px' );
		expect( result[ 1 ].value ).toContain( '@media(max-width:992px)' );
		expect( result[ 1 ].value ).toContain( 'font-size:14px' );
		expect( result[ 2 ].value ).toContain( '@media(max-width:768px)' );
		expect( result[ 2 ].value ).toContain( 'font-size:12px' );
	} );

	it( 'should deduplicate same id + breakpoint + state combinations', async () => {
		// Arrange - two styles with same id, breakpoint, and state should dedupe.
		const style1: RendererStyleDefinition = {
			id: 'button-style',
			type: 'class',
			cssName: 'e-button',
			label: 'Button',
			variants: [
				{ meta: { breakpoint: 'tablet', state: null }, props: { 'font-size': '14px' }, custom_css: null },
			],
		};
		const style2: RendererStyleDefinition = {
			...style1,
			variants: [
				{ meta: { breakpoint: 'tablet', state: null }, props: { 'font-size': '16px' }, custom_css: null },
			],
		};

		const resolve = jest.fn( ( { props } ) => props );
		const renderStyles = createStylesRenderer( {
			breakpoints: {
				tablet: { width: 992, type: 'max-width' },
			} as BreakpointsMap,
			resolve,
		} );

		// Act.
		const result = await renderStyles( { styles: [ style1, style2 ] } );

		// Assert - should only render first occurrence.
		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].value ).toContain( 'font-size:14px' );
	} );

	it( 'should render separately when same id + breakpoint have different states', async () => {
		// Arrange - same id and breakpoint but different states should NOT dedupe.
		const normalStyle: RendererStyleDefinition = {
			id: 'button-style',
			type: 'class',
			cssName: 'e-button',
			label: 'Button',
			variants: [
				{ meta: { breakpoint: 'tablet', state: null }, props: { 'font-size': '14px' }, custom_css: null },
			],
		};
		const hoverStyle: RendererStyleDefinition = {
			...normalStyle,
			variants: [
				{ meta: { breakpoint: 'tablet', state: 'hover' }, props: { 'font-size': '16px' }, custom_css: null },
			],
		};

		const resolve = jest.fn( ( { props } ) => props );
		const renderStyles = createStylesRenderer( {
			breakpoints: {
				tablet: { width: 992, type: 'max-width' },
			} as BreakpointsMap,
			resolve,
		} );

		// Act.
		const result = await renderStyles( { styles: [ normalStyle, hoverStyle ] } );

		// Assert - both should be rendered since states differ.
		expect( result ).toHaveLength( 2 );
		expect( result[ 0 ].state ).toBeNull();
		expect( result[ 0 ].value ).toContain( 'font-size:14px' );
		expect( result[ 1 ].state ).toBe( 'hover' );
		expect( result[ 1 ].value ).toContain( 'font-size:16px' );
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
		const css = 'transition: 100s; \n .inner-selector { color: red; }';
		const styleDef: RendererStyleDefinition = {
			id: 'test',
			type: 'class',
			cssName: 'test',
			label: 'Test',
			variants: [
				{
					meta: { breakpoint: null, state: null },
					props: {},
					custom_css: { raw: encodeString( css ) },
				},
			],
		};

		// Act.
		const renderStyles = createStylesRenderer( { breakpoints: {} as BreakpointsMap, resolve: async () => ( {} ) } );
		const result = await renderStyles( { styles: [ styleDef ] } );

		// Assert.
		expect( result[ 0 ].value ).toContain( css );
	} );

	it( 'should render class state with selector', async () => {
		// Arrange.
		const styleDef: RendererStyleDefinition = {
			id: 'test',
			type: 'class',
			cssName: 'test',
			label: 'Test',
			variants: [
				{
					meta: { breakpoint: null, state: 'e--selected' },
					props: {},
					custom_css: null,
				},
			],
		};

		// Act.
		const renderStyles = createStylesRenderer( { breakpoints: {} as BreakpointsMap, resolve: async () => ( {} ) } );
		const result = await renderStyles( { styles: [ styleDef ] } );

		// Assert.
		expect( result[ 0 ].value ).toContain( '.test.e--selected{}' );
	} );
} );
