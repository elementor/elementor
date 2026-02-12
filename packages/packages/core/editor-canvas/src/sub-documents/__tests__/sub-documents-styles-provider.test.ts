import { createMockStyleDefinition } from 'test-utils';

import {
	clearSubDocumentStyles,
	setSubDocumentStyles,
	subDocumentsStylesProvider,
} from '../sub-documents-styles-provider';

describe( 'subDocumentsStylesProvider', () => {
	afterEach( () => {
		clearSubDocumentStyles();
	} );

	it( 'should expose the static key', () => {
		// Act.
		const key = subDocumentsStylesProvider.getKey();

		// Assert.
		expect( key ).toBe( 'sub-documents-styles' );
	} );

	it( 'should return empty array when no styles are set', () => {
		// Act.
		const styles = subDocumentsStylesProvider.actions.all();

		// Assert.
		expect( styles ).toEqual( [] );
	} );

	it( 'should return all styles after setSubDocumentStyles', () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 's-1' } );
		const style2 = createMockStyleDefinition( { id: 's-2' } );

		// Act.
		setSubDocumentStyles( [ style1, style2 ] );

		// Assert.
		expect( subDocumentsStylesProvider.actions.all() ).toEqual( [ style1, style2 ] );
	} );

	it( 'should get a single style by id', () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 's-1' } );
		const style2 = createMockStyleDefinition( { id: 's-2' } );
		setSubDocumentStyles( [ style1, style2 ] );

		// Act & Assert.
		expect( subDocumentsStylesProvider.actions.get( 's-1' ) ).toStrictEqual( style1 );
		expect( subDocumentsStylesProvider.actions.get( 's-2' ) ).toStrictEqual( style2 );
	} );

	it( 'should return null for unknown style id', () => {
		// Arrange.
		setSubDocumentStyles( [ createMockStyleDefinition( { id: 's-1' } ) ] );

		// Act.
		const result = subDocumentsStylesProvider.actions.get( 'non-existent' );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'should clear styles', () => {
		// Arrange.
		setSubDocumentStyles( [ createMockStyleDefinition( { id: 's-1' } ) ] );

		// Act.
		clearSubDocumentStyles();

		// Assert.
		expect( subDocumentsStylesProvider.actions.all() ).toEqual( [] );
	} );

	it( 'should notify subscribers when styles are set', () => {
		// Arrange.
		const callback = jest.fn();
		subDocumentsStylesProvider.subscribe( callback );

		// Act.
		setSubDocumentStyles( [ createMockStyleDefinition( { id: 's-1' } ) ] );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should notify subscribers when styles are cleared', () => {
		// Arrange.
		const callback = jest.fn();
		subDocumentsStylesProvider.subscribe( callback );

		// Act.
		clearSubDocumentStyles();

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should stop notifying after unsubscribe', () => {
		// Arrange.
		const callback = jest.fn();
		const unsubscribe = subDocumentsStylesProvider.subscribe( callback );

		// Act.
		unsubscribe();
		setSubDocumentStyles( [ createMockStyleDefinition( { id: 's-1' } ) ] );

		// Assert.
		expect( callback ).not.toHaveBeenCalled();
	} );
} );
