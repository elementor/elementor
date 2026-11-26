import { filterCollections } from 'elementor-panel/pages/elements/utils/filter-collections';

describe( 'filterCollections', () => {
	let collections;

	beforeEach( () => {
		collections = {
			elementsCollection: { models: [] },
			categoriesCollection: { models: [] },
		};

		global.elementor = { hooks: { applyFilters: jest.fn( ( name, value ) => value ) } };
	} );

	afterEach( () => {
		delete global.elementor;
		jest.restoreAllMocks();
	} );

	test( 'calls applyFilters with the collections hook name', () => {
		filterCollections( collections );

		expect( global.elementor.hooks.applyFilters ).toHaveBeenCalledWith( 'panel/elements/collections', collections );
	} );

	test( 'returns the same collections when no handler changes them', () => {
		const result = filterCollections( collections );

		expect( result.elementsCollection ).toBe( collections.elementsCollection );
		expect( result.categoriesCollection ).toBe( collections.categoriesCollection );
	} );

	test( 'returns the handler collections', () => {
		const filtered = {
			elementsCollection: { models: [ 1 ] },
			categoriesCollection: { models: [ 2 ] },
		};

		global.elementor.hooks.applyFilters.mockReturnValue( filtered );

		expect( filterCollections( collections ) ).toBe( filtered );
	} );

	test( 'returns the input and logs when a handler throws', () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		global.elementor.hooks.applyFilters.mockImplementation( () => {
			throw new Error( 'boom' );
		} );

		expect( filterCollections( collections ) ).toBe( collections );
		expect( consoleError ).toHaveBeenCalledTimes( 1 );
	} );

	test.each( [
		[ 'undefined', undefined ],
		[ 'empty object', {} ],
		[ 'missing categoriesCollection', { elementsCollection: { models: [] } } ],
		[ 'missing elementsCollection', { categoriesCollection: { models: [] } } ],
		[ 'non-array models', { elementsCollection: { models: {} }, categoriesCollection: { models: [] } } ],
	] )( 'returns the input when a handler returns an invalid shape (%s)', ( name, invalid ) => {
		global.elementor.hooks.applyFilters.mockReturnValue( invalid );

		expect( filterCollections( collections ) ).toBe( collections );
	} );
} );
