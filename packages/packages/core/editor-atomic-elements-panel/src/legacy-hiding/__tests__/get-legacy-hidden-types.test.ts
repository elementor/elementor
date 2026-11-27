import { type WidgetsCache } from '../../utils/get-atomic-widgets';
import { getLegacyHiddenTypes } from '../get-legacy-hidden-types';

const setPromotions = ( atomicWidgetPromotions?: unknown ) => {
	( window as unknown as { elementor: unknown } ).elementor = { config: { atomicWidgetPromotions } };
};

const atom = ( title: string, categories: string[] = [ 'v4-elements' ] ) => ( {
	title,
	atomic: true,
	controls: {},
	categories,
} );

const promotion = ( type: string, names: string[], categories: string[] ) => ( {
	type,
	widgets: names.map( ( name ) => ( {
		name,
		title: name,
		icon: 'eicon-x',
		categories: JSON.stringify( categories ),
	} ) ),
} );

const REGISTERED_INVENTORY = [
	'e-div-block',
	'e-flexbox',
	'e-grid',
	'e-heading',
	'e-paragraph',
	'e-image',
	'e-svg',
	'e-button',
	'e-divider',
	'e-youtube',
	'e-self-hosted-video',
	'e-background-video',
	'e-google-maps',
	'e-tabs',
	'e-accordion',
	'e-list',
	'e-menu',
];

const PROMOTED = [ 'e-carousel', 'e-collection-loop', 'e-form', 'e-form-input' ];

const cache = {
	...Object.fromEntries( REGISTERED_INVENTORY.map( ( type ) => [ type, atom( type ) ] ) ),
	heading: { title: 'Heading', atomic: false, controls: {}, categories: [ 'basic' ] },
	'angie-atom': atom( 'Angie Atom', [ 'angie-widgets' ] ),
	'custom-atom': atom( 'Custom Atom', [ 'custom-widgets' ] ),
	'acme-atom': atom( 'Acme Atom' ),
} as unknown as WidgetsCache;

describe( 'getLegacyHiddenTypes', () => {
	beforeEach( () => {
		setPromotions( [
			promotion( 'pro', [ 'e-carousel', 'e-collection-loop' ], [ 'v4-elements' ] ),
			promotion( 'atomic-form', [ 'e-form', 'e-form-input' ], [ 'atomic-form' ] ),
		] );
	} );

	afterEach( () => {
		delete ( window as unknown as { elementor?: unknown } ).elementor;
	} );

	it.each( REGISTERED_INVENTORY )( 'should hide the registered inventory type %s', ( type ) => {
		// Act & Assert.
		expect( getLegacyHiddenTypes( cache ).has( type ) ).toBe( true );
	} );

	it.each( PROMOTED )( 'should hide the promotion tile %s', ( type ) => {
		// Act & Assert.
		expect( getLegacyHiddenTypes( cache ).has( type ) ).toBe( true );
	} );

	it( 'should hide a third-party atom rendered in the fallback group', () => {
		// Act & Assert.
		expect( getLegacyHiddenTypes( cache ).has( 'acme-atom' ) ).toBe( true );
	} );

	it.each( [ 'heading', 'angie-atom', 'custom-atom' ] )( 'should not hide %s', ( type ) => {
		// Act & Assert.
		expect( getLegacyHiddenTypes( cache ).has( type ) ).toBe( false );
	} );

	it( 'should hide nothing without a widgets cache', () => {
		// Act & Assert.
		expect( getLegacyHiddenTypes( null ).size ).toBe( 0 );
	} );
} );
