import { getAtomicWidgets } from '../get-atomic-widgets';

const widget = ( overrides: Record< string, unknown > = {} ) => ( { title: 'Widget', atomic: true, ...overrides } );

describe( 'getAtomicWidgets', () => {
	it( 'should return only atomic widgets', () => {
		// Arrange.
		const cache = { 'e-heading': widget(), heading: widget( { atomic: false } ), legacy: widget( { atomic: undefined } ) };

		// Act.
		const result = getAtomicWidgets( cache );

		// Assert.
		expect( Object.keys( result ) ).toEqual( [ 'e-heading' ] );
	} );

	it( 'should exclude widgets hidden from the panel but keep those with a missing show_in_panel', () => {
		// Arrange.
		const cache = {
			hidden: widget( { show_in_panel: false } ),
			shown: widget( { show_in_panel: true } ),
			missing: widget(),
		};

		// Act.
		const result = getAtomicWidgets( cache );

		// Assert.
		expect( Object.keys( result ) ).toEqual( [ 'shown', 'missing' ] );
	} );

	it( 'should exclude deprecated widgets only when their replacement exists', () => {
		// Arrange.
		const cache = {
			old: widget( { deprecation: { replacement: 'new' } } ),
			new: widget(),
			orphan: widget( { deprecation: { replacement: 'missing' } } ),
		};

		// Act.
		const result = getAtomicWidgets( cache );

		// Assert.
		expect( Object.keys( result ) ).toEqual( [ 'new', 'orphan' ] );
	} );

	it( 'should exclude widgets in the angie-widgets and custom-widgets categories', () => {
		// Arrange.
		const cache = {
			angie: widget( { categories: [ 'angie-widgets' ] } ),
			custom: widget( { categories: [ 'custom-widgets' ] } ),
			basic: widget( { categories: [ 'v4-elements' ] } ),
		};

		// Act.
		const result = getAtomicWidgets( cache );

		// Assert.
		expect( Object.keys( result ) ).toEqual( [ 'basic' ] );
	} );

	it( 'should skip widgets without a title', () => {
		// Arrange.
		const cache = { untitled: widget( { title: '' } ), titled: widget() };

		// Act.
		const result = getAtomicWidgets( cache );

		// Assert.
		expect( Object.keys( result ) ).toEqual( [ 'titled' ] );
	} );

	it( 'should not mutate the cache', () => {
		// Arrange.
		const cache = { a: widget(), b: widget( { show_in_panel: false } ) };
		const snapshot = JSON.parse( JSON.stringify( cache ) );

		// Act.
		getAtomicWidgets( cache );

		// Assert.
		expect( cache ).toEqual( snapshot );
	} );

	it( 'should return an empty object when the cache is missing', () => {
		// Act & Assert.
		expect( getAtomicWidgets( null ) ).toEqual( {} );
	} );
} );
