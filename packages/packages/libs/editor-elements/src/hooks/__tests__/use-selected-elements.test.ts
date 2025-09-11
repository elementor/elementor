import { createMockElementType, dispatchCommandAfter } from 'test-utils';
import { act, renderHook } from '@testing-library/react';

import { getElementType } from '../../sync/get-element-type';
import { getSelectedElements } from '../../sync/get-selected-elements';
import { type Element } from '../../types';
import { useSelectedElement } from '../use-selected-element';

jest.mock( '../../sync/get-selected-elements' );
jest.mock( '../../sync/get-element-type' );

describe( 'useSelectedElements', () => {
	beforeEach( () => {
		jest.mocked( getElementType ).mockImplementation( ( type?: string ) => {
			if ( type === 'atomic-heading' ) {
				return createMockElementType( { key: 'atomic-heading', title: 'Heading' } );
			}

			return null;
		} );
	} );

	function selectElements( elements: Element[] ) {
		act( () => {
			jest.mocked( getSelectedElements ).mockReturnValue( elements );
			dispatchCommandAfter( 'document/elements/select' );
		} );
	}

	function deselectElements() {
		act( () => {
			jest.mocked( getSelectedElements ).mockReturnValue( [] );
			dispatchCommandAfter( 'document/elements/deselect' );
		} );
	}

	it( 'should return the selected element and its type', () => {
		// Arrange.
		selectElements( [ { id: '1', type: 'atomic-heading' } ] );

		// Act.
		const { result } = renderHook( () => useSelectedElement() );

		// Assert.
		expect( result.current ).toEqual( {
			element: { id: '1', type: 'atomic-heading' },
			elementType: createMockElementType( { key: 'atomic-heading', title: 'Heading' } ),
		} );
	} );

	it( 'should return empty values if multiple elements are selected', () => {
		// Arrange.
		selectElements( [
			{ id: '1', type: 'atomic-heading' },
			{ id: '2', type: 'atomic-heading' },
		] );

		// Act.
		const { result } = renderHook( () => useSelectedElement() );

		// Assert.
		expect( result.current ).toEqual( { element: null, elementType: null } );
	} );

	it( 'should return empty values if no element is selected', () => {
		// Arrange.
		deselectElements();

		// Act.
		const { result } = renderHook( () => useSelectedElement() );

		// Assert.
		expect( result.current ).toEqual( { element: null, elementType: null } );
	} );

	it( 'should return empty values if element type is not found', () => {
		// Arrange.
		selectElements( [ { id: '1', type: 'unknown' } ] );

		// Act.
		const { result } = renderHook( () => useSelectedElement() );

		// Assert.
		expect( result.current ).toEqual( { element: null, elementType: null } );
	} );

	it.each( [
		{ name: 'load', event: 'editor/documents/load' },
		{ name: 'select', event: 'document/elements/select' },
		{ name: 'deselect', event: 'document/elements/deselect' },
		{ name: 'select-all', event: 'document/elements/select-all' },
		{ name: 'deselect-all', event: 'document/elements/deselect-all' },
	] )( 'should update values if $name is fired', ( { event } ) => {
		// Arrange.
		jest.mocked( getSelectedElements ).mockReturnValue( [ { id: '1', type: 'atomic-heading' } ] );

		// Act.
		const { result } = renderHook( () => useSelectedElement() );

		// Assert.
		expect( result.current ).toEqual( {
			element: { id: '1', type: 'atomic-heading' },
			elementType: createMockElementType( { key: 'atomic-heading', title: 'Heading' } ),
		} );

		// Arrange.
		jest.mocked( getSelectedElements ).mockReturnValue( [ { id: '2', type: 'atomic-heading' } ] );

		// Act.
		act( () => {
			dispatchCommandAfter( event );
		} );
		const { result: result2 } = renderHook( () => useSelectedElement() );

		// Assert.
		expect( result2.current ).toEqual( {
			element: { id: '2', type: 'atomic-heading' },
			elementType: createMockElementType( { key: 'atomic-heading', title: 'Heading' } ),
		} );
	} );
} );
