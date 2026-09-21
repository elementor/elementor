import { getWidgetsCache } from '@elementor/editor-elements';

import { type ElementSnapshotNode } from '../../types';
import { audit } from '../too-many-widgets';
import { makeContext, makeWidget } from './fixtures';

jest.mock( '@elementor/editor-elements', () => ( {
	getWidgetsCache: jest.fn(),
} ) );

const mockGetWidgetsCache = jest.mocked( getWidgetsCache );

const WIDGETS_CACHE = {
	'e-tabs': { title: 'Tabs', controls: {}, meta: { is_compound: true } },
	'e-div-block': { title: 'Div block', controls: {}, meta: { is_container: true } },
};

const makeWidgets = ( count: number ) => Array.from( { length: count }, ( _, i ) => makeWidget( `w${ i }`, 'text' ) );

const makeElement = ( id: string, elType: string, elements: ElementSnapshotNode[] = [] ): ElementSnapshotNode => ( {
	id,
	elType,
	settings: {},
	elements,
} );

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

	it( 'passes at exactly 100 widgets', async () => {
		const tree = makeWidgets( 100 );

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails with 101 widgets', async () => {
		const tree = makeWidgets( 101 );
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );
	} );

	it( 'counts a compound v4 atom (e.g. Tabs) as a single widget', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( WIDGETS_CACHE );
		const tree = [ ...makeWidgets( 100 ), makeElement( 'tabs-1', 'e-tabs' ) ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result.status ).toBe( 'fail' );
	} );

	it( 'does not count a pure layout v4 atom (e.g. Div block) as a widget', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( WIDGETS_CACHE );
		const tree = [ ...makeWidgets( 100 ), makeElement( 'div-block-1', 'e-div-block' ) ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result ).toEqual( { status: 'pass' } );
	} );

	it( 'counts a compound v4 atom once, ignoring its internal sub-parts', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( WIDGETS_CACHE );
		const tabs = makeElement( 'tabs-1', 'e-tabs', [
			makeElement( 'tabs-menu-1', 'e-tabs-menu', [ makeElement( 'tab-1', 'e-tab' ) ] ),
			makeElement( 'tabs-content-area-1', 'e-tabs-content-area', [
				makeElement( 'tab-content-1', 'e-tab-content' ),
			] ),
		] );
		const tree = [ ...makeWidgets( 99 ), tabs ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result ).toEqual( { status: 'pass' } );
	} );

	it( 'behaves like the v3-only baseline when the widgets cache is unavailable', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( null );
		const tree = [ ...makeWidgets( 100 ), makeElement( 'tabs-1', 'e-tabs' ) ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result ).toEqual( { status: 'pass' } );
	} );
} );
