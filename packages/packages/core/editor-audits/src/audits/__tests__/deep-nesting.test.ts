import { getWidgetsCache } from '@elementor/editor-elements';

import { type ElementSnapshotNode } from '../../types';
import { audit } from '../deep-nesting';
import { makeContainer, makeContext, makeWidget } from './fixtures';

jest.mock( '@elementor/editor-elements', () => ( {
	getWidgetsCache: jest.fn(),
} ) );

const mockGetWidgetsCache = jest.mocked( getWidgetsCache );

const WIDGETS_CACHE = {
	'e-div-block': { title: 'Div block', controls: {}, meta: { is_container: true } },
	'e-flexbox': { title: 'Flexbox', controls: {}, meta: { is_container: true } },
	'e-grid': { title: 'Grid', controls: {}, meta: { is_container: true } },
};

function makeNestedContainers( depth: number ): ElementSnapshotNode {
	if ( depth === 1 ) {
		return makeContainer( `c${ depth }`, {} );
	}

	return makeContainer( `c${ depth }`, {}, [ makeNestedContainers( depth - 1 ) ] );
}

function makeElement( id: string, elType: string, elements: ElementSnapshotNode[] = [] ): ElementSnapshotNode {
	return { id, elType, settings: {}, elements };
}

function makeNestedLayoutElements( depth: number, elType: string ): ElementSnapshotNode {
	if ( depth === 1 ) {
		return makeElement( `l${ depth }`, elType );
	}

	return makeElement( `l${ depth }`, elType, [ makeNestedLayoutElements( depth - 1, elType ) ] );
}

afterEach( () => {
	jest.clearAllMocks();
} );

describe( audit.id, () => {
	it( 'is skipped with an empty tree', async () => {
		expect( await audit.evaluate( makeContext() ) ).toEqual( {
			status: 'skipped',
			reason: 'No elements',
		} );
	} );

	it( 'passes at exactly 6 levels of nesting', async () => {
		const tree = [ makeNestedContainers( 6 ) ];

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails at 7 levels of nesting', async () => {
		const tree = [ makeNestedContainers( 7 ) ];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].elementId ).toBe( 'c1' );
		}
	} );

	it( 'passes with a flat tree of containers', async () => {
		const tree = [ makeContainer( 'a', {} ), makeContainer( 'b', {} ), makeContainer( 'c', {} ) ];

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails at 7 levels of nesting of v4 layout elements (e.g. Div block)', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( WIDGETS_CACHE );
		const tree = [ makeNestedLayoutElements( 7, 'e-div-block' ) ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].elementId ).toBe( 'l1' );
		}
	} );

	it( 'passes at exactly 6 levels of nesting of v4 layout elements (e.g. Grid)', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( WIDGETS_CACHE );
		const tree = [ makeNestedLayoutElements( 6, 'e-grid' ) ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when v3 containers and v4 layout elements (e.g. Flexbox) are nested together past the limit', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( WIDGETS_CACHE );
		const flexboxChain = makeNestedLayoutElements( 4, 'e-flexbox' );
		const containerChain = makeContainer( 'c3', {}, [
			makeContainer( 'c2', {}, [ makeContainer( 'c1', {}, [ flexboxChain ] ) ] ),
		] );
		const tree = [ containerChain ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].elementId ).toBe( 'l1' );
		}
	} );

	it( 'does not count a v4 widget without the is_container meta towards nesting depth', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( WIDGETS_CACHE );
		const widget = makeWidget( 'w1', 'e-heading' );
		widget.elements = [ makeNestedLayoutElements( 6, 'e-flexbox' ) ];
		const tree = [ widget ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result ).toEqual( { status: 'pass' } );
	} );

	it( 'behaves like the v3-only baseline when the widgets cache is unavailable', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( null );
		const tree = [ makeNestedLayoutElements( 7, 'e-div-block' ) ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result ).toEqual( { status: 'pass' } );
	} );
} );
