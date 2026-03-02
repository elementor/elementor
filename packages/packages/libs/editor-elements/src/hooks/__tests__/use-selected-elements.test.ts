import { createMockElementType, dispatchCommandAfter } from 'test-utils';
import { act, renderHook } from '@testing-library/react';

import { getSelectedElement } from '../../sync/get-selected-elements';
import { type Element } from '../../types';
import { useSelectedElement } from '../use-selected-element';

jest.mock( '../../sync/get-selected-elements' );

describe( 'useSelectedElement', () => {
	const mockHeadingType = createMockElementType( { key: 'atomic-heading', title: 'Heading' } );

	function selectElements( element: Element ) {
		act( () => {
			const elementType = element.type === 'atomic-heading' ? mockHeadingType : null;

			jest.mocked( getSelectedElement ).mockReturnValue(
				elementType ? { element, elementType } : { element: null, elementType: null }
			);
			dispatchCommandAfter( 'document/elements/select' );
		} );
	}

	function deselectElements() {
		act( () => {
			jest.mocked( getSelectedElement ).mockReturnValue( { element: null, elementType: null } );
			dispatchCommandAfter( 'document/elements/deselect' );
		} );
	}

	it( 'should return the selected element and its type', () => {
		// Arrange.
		selectElements( { id: '1', type: 'atomic-heading' } );

		// Act.
		const { result } = renderHook( () => useSelectedElement() );

		// Assert.
		expect( result.current ).toEqual( {
			element: { id: '1', type: 'atomic-heading' },
			elementType: createMockElementType( { key: 'atomic-heading', title: 'Heading' } ),
		} );
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
		selectElements( { id: '1', type: 'unknown' } );

		// Act.
		const { result } = renderHook( () => useSelectedElement() );

		// Assert.
		expect( result.current ).toEqual( { element: null, elementType: null } );
	} );

	it.each( [
		{ name: 'select', event: 'document/elements/select' },
		{ name: 'deselect', event: 'document/elements/deselect' },
		{ name: 'select-all', event: 'document/elements/select-all' },
		{ name: 'deselect-all', event: 'document/elements/deselect-all' },
	] )( 'should update values if $name is fired', ( { event } ) => {
		// Arrange.
		jest.mocked( getSelectedElement ).mockReturnValue( {
			element: { id: '1', type: 'atomic-heading' },
			elementType: mockHeadingType,
		} );

		// Act.
		const { result } = renderHook( () => useSelectedElement() );

		// Assert.
		expect( result.current ).toEqual( {
			element: { id: '1', type: 'atomic-heading' },
			elementType: createMockElementType( { key: 'atomic-heading', title: 'Heading' } ),
		} );

		// Arrange.
		jest.mocked( getSelectedElement ).mockReturnValue( {
			element: { id: '2', type: 'atomic-heading' },
			elementType: mockHeadingType,
		} );

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
