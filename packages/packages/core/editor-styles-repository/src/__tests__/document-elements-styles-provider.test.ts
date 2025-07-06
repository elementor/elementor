import { createMockElement, createMockStyleDefinition } from 'test-utils';
import { getCurrentDocumentId, getElements, getElementStyles, updateElementStyle } from '@elementor/editor-elements';
import type { StyleDefinition } from '@elementor/editor-styles';

import { InvalidElementsStyleProviderMetaError } from '../errors';
import { documentElementsStylesProvider } from '../providers/document-elements-styles-provider';

jest.mock( '@elementor/editor-elements' );

describe( 'documentElementsStylesProvider', () => {
	beforeEach( () => {
		jest.mocked( getElements ).mockReturnValue( [
			createMockElement( {
				model: {
					id: '1',
					styles: {
						's-1': createMockStyleDefinition( { id: 's-1' } ),
						's-2': createMockStyleDefinition( { id: 's-2' } ),
					},
				},
			} ),
			createMockElement( {
				model: {
					id: '2',
					styles: {
						's-3': createMockStyleDefinition( { id: 's-3' } ),
					},
				},
			} ),
		] );
	} );

	it( 'should generate the key based on current document', () => {
		// Arrange.
		jest.mocked( getCurrentDocumentId ).mockReturnValue( 42 );

		// Act.
		const key = documentElementsStylesProvider.getKey();

		// Assert.
		expect( key ).toBe( 'document-elements-42' );
	} );

	it( 'should return all the styles attached to all the document elements', () => {
		// Act.
		const styles = documentElementsStylesProvider.actions.all();

		// Assert.
		expect( styles ).toEqual( [
			expect.objectContaining( { id: 's-1' } ),
			expect.objectContaining( { id: 's-2' } ),
			expect.objectContaining( { id: 's-3' } ),
		] );
	} );

	it( 'should return all styles filtered by element', () => {
		// Act.
		const styles = documentElementsStylesProvider.actions.all( { elementId: '1' } );

		// Assert.
		expect( styles ).toEqual( [
			expect.objectContaining( { id: 's-1' } ),
			expect.objectContaining( { id: 's-2' } ),
		] );
	} );

	it( 'should retrieve an element style by id', () => {
		const styles: Record< string, StyleDefinition > = {
			'style-1': {
				id: 'style-1',
				label: 'Style 1',
				variants: [],
				type: 'class',
			},
			'style-2': {
				id: 'style-2',
				label: 'Style 2',
				variants: [],
				type: 'class',
			},
		};

		jest.mocked( getElementStyles ).mockImplementation( ( elementId ) => {
			return elementId === 'test-element-id' ? styles : null;
		} );

		// Act.
		const elementStyle = documentElementsStylesProvider.actions.get( 'style-2', { elementId: 'test-element-id' } );

		// Assert.
		expect( elementStyle ).toStrictEqual( styles[ 'style-2' ] );
	} );

	it( 'should throw when trying to get a style by id without passing an element id', () => {
		// Act & Assert.
		expect( () => documentElementsStylesProvider.actions.get( 'style', { notElementId: 'test-value' } ) ).toThrow(
			new InvalidElementsStyleProviderMetaError()
		);
	} );

	it( 'should update style props', () => {
		// Act.
		documentElementsStylesProvider.actions?.updateProps?.(
			{
				id: 'test-style',
				meta: {
					breakpoint: null,
					state: null,
				},
				props: {
					prop: 'value',
				},
			},
			{ elementId: 'test-element' }
		);

		// Assert.
		expect( updateElementStyle ).toHaveBeenCalledTimes( 1 );

		expect( updateElementStyle ).toHaveBeenCalledWith( {
			elementId: 'test-element',
			styleId: 'test-style',
			meta: {
				breakpoint: null,
				state: null,
			},
			props: {
				prop: 'value',
			},
		} );
	} );

	it.each( [
		{ elementsMeta: { notElementId: 'test-value' } },
		{ elementsMeta: { elementId: 123 } },
		{ elementsMeta: { elementId: null } },
		{ elementsMeta: { elementId: '' } },
		{ elementsMeta: { elementId: {} } },
	] )( 'should throw when updating props with invalid elements meta', ( { elementsMeta } ) => {
		// Act & Assert.
		expect(
			() =>
				documentElementsStylesProvider.actions?.updateProps?.(
					{
						id: 'test-id',
						meta: {
							breakpoint: null,
							state: null,
						},
						props: {
							prop: 'value',
						},
					},
					elementsMeta
				)
		).toThrow( new InvalidElementsStyleProviderMetaError() );
	} );
} );
