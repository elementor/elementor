import { createMockStyleDefinition } from 'test-utils';

import { addTemplateStyles, clearTemplatesStyles, templatesStylesProvider } from '../templates-styles-provider';

describe( 'templatesStylesProvider', () => {
	afterEach( () => {
		clearTemplatesStyles();
	} );

	it( 'should expose the static key', () => {
		// Act.
		const key = templatesStylesProvider.getKey();

		// Assert.
		expect( key ).toBe( 'templates-styles' );
	} );

	it( 'should return empty array when no styles are set', () => {
		// Act.
		const styles = templatesStylesProvider.actions.all();

		// Assert.
		expect( styles ).toEqual( [] );
	} );

	it( 'should return all styles after addTemplateStyles', () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 's-1' } );
		const style2 = createMockStyleDefinition( { id: 's-2' } );

		// Act.
		addTemplateStyles( [ style1, style2 ] );

		// Assert.
		expect( templatesStylesProvider.actions.all() ).toEqual( [ style1, style2 ] );
	} );

	it( 'should get a single style by id', () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 's-1' } );
		const style2 = createMockStyleDefinition( { id: 's-2' } );
		addTemplateStyles( [ style1, style2 ] );

		// Act & Assert.
		expect( templatesStylesProvider.actions.get( 's-1' ) ).toStrictEqual( style1 );
		expect( templatesStylesProvider.actions.get( 's-2' ) ).toStrictEqual( style2 );
	} );

	it( 'should return null for unknown style id', () => {
		// Arrange.
		addTemplateStyles( [ createMockStyleDefinition( { id: 's-1' } ) ] );

		// Act.
		const result = templatesStylesProvider.actions.get( 'non-existent' );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'should clear styles', () => {
		// Arrange.
		addTemplateStyles( [ createMockStyleDefinition( { id: 's-1' } ) ] );

		// Act.
		clearTemplatesStyles();

		// Assert.
		expect( templatesStylesProvider.actions.all() ).toEqual( [] );
	} );

	it( 'should notify subscribers when styles are set', () => {
		// Arrange.
		const callback = jest.fn();
		templatesStylesProvider.subscribe( callback );

		// Act.
		addTemplateStyles( [ createMockStyleDefinition( { id: 's-1' } ) ] );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should notify subscribers when styles are cleared', () => {
		// Arrange.
		const callback = jest.fn();
		templatesStylesProvider.subscribe( callback );

		// Act.
		clearTemplatesStyles();

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should stop notifying after unsubscribe', () => {
		// Arrange.
		const callback = jest.fn();
		const unsubscribe = templatesStylesProvider.subscribe( callback );

		// Act.
		unsubscribe();
		addTemplateStyles( [ createMockStyleDefinition( { id: 's-1' } ) ] );

		// Assert.
		expect( callback ).not.toHaveBeenCalled();
	} );
} );
