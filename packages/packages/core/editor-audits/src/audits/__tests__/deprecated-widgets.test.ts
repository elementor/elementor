import { getWidgetsCache } from '@elementor/editor-elements';

import { audit } from '../deprecated-widgets';
import { makeContext, makeWidget } from './fixtures';

jest.mock( '@elementor/editor-elements', () => ( {
	getWidgetsCache: jest.fn(),
} ) );

const mockGetWidgetsCache = jest.mocked( getWidgetsCache );

const WIDGETS_CACHE_WITH_DEPRECATED = {
	accordion: {
		title: 'Accordion',
		controls: {
			deprecation_message: { type: 'alert' },
		},
	},
	tabs: {
		title: 'Tabs',
		controls: {
			deprecation_message: { type: 'alert' },
		},
	},
	heading: {
		title: 'Heading',
		controls: {},
	},
};

afterEach( () => {
	jest.clearAllMocks();
} );

describe( audit.id, () => {
	it( 'passes when no deprecated widgets are on the page', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( WIDGETS_CACHE_WITH_DEPRECATED );
		const tree = [ makeWidget( 'w1', 'heading' ) ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result ).toEqual( { status: 'pass' } );
	} );

	it( 'fails with one violation when a single deprecated widget is on the page', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( WIDGETS_CACHE_WITH_DEPRECATED );
		const tree = [ makeWidget( 'w1', 'accordion' ) ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].elementId ).toBe( 'w1' );
			expect( result.violations[ 0 ].label ).toBe( 'Using deprecated widget.' );
			expect( result.violations[ 0 ].detail ).toBeUndefined();
		}
	} );

	it( 'flags every deprecated widget and ignores non-deprecated ones', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( WIDGETS_CACHE_WITH_DEPRECATED );
		const tree = [ makeWidget( 'w1', 'accordion' ), makeWidget( 'w2', 'heading' ), makeWidget( 'w3', 'tabs' ) ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 2 );
			expect( result.violations[ 0 ].elementId ).toBe( 'w1' );
			expect( result.violations[ 1 ].elementId ).toBe( 'w3' );
		}
	} );

	it( 'does not throw and produces no violation for a widget type absent from the cache', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( WIDGETS_CACHE_WITH_DEPRECATED );
		const tree = [ makeWidget( 'w1', 'unknown-orphaned-widget' ) ];

		// Act.
		const result = await audit.evaluate( makeContext( { tree } ) );

		// Assert.
		expect( result ).toEqual( { status: 'pass' } );
	} );

	it( 'is skipped when the widgets cache is unavailable', async () => {
		// Arrange.
		mockGetWidgetsCache.mockReturnValue( null );

		// Act.
		const result = await audit.evaluate( makeContext() );

		// Assert.
		expect( result ).toEqual( { status: 'skipped', reason: 'widgets-cache-unavailable' } );
	} );
} );
