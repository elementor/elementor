import { createMockElement } from 'test-utils';

import { getContainer } from '../get-container';
import { getElementPart, getElementWidgetMarker, isElementSlot } from '../get-element-widget-markers';

jest.mock( '../get-container' );

const ELEMENT_ID = 'element-id';

describe( 'getElementWidgetMarker', () => {
	it( 'returns the widget marker of the element', () => {
		// Arrange.
		const widget = { id: 'elementor/icon-button', version: 1, values: { icon: false } };

		jest.mocked( getContainer ).mockReturnValue( createMockElement( { model: { widget } } ) );

		// Act.
		const result = getElementWidgetMarker( ELEMENT_ID );

		// Assert.
		expect( result ).toEqual( widget );
	} );

	it( 'defaults missing values to an empty object', () => {
		// Arrange.
		const widget = { id: 'elementor/icon-button', version: 1 };

		jest.mocked( getContainer ).mockReturnValue( createMockElement( { model: { widget } } ) );

		// Act.
		const result = getElementWidgetMarker( ELEMENT_ID );

		// Assert.
		expect( result ).toEqual( { ...widget, values: {} } );
	} );

	it( 'returns null when the element is not a widget root', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( createMockElement( { model: {} } ) );

		// Act.
		const result = getElementWidgetMarker( ELEMENT_ID );

		// Assert.
		expect( result ).toBeNull();
	} );

	it.each( [
		[ 'a non-namespaced id', { id: 'icon-button', version: 1 } ],
		[ 'a zero version', { id: 'elementor/icon-button', version: 0 } ],
		[ 'a string version', { id: 'elementor/icon-button', version: '1' } ],
		[ 'array values', { id: 'elementor/icon-button', version: 1, values: [] } ],
		[ 'a non-object marker', 'elementor/icon-button' ],
	] )( 'returns null for %s', ( _, widget ) => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( createMockElement( { model: { widget } as never } ) );

		// Act.
		const result = getElementWidgetMarker( ELEMENT_ID );

		// Assert.
		expect( result ).toBeNull();
	} );
} );

describe( 'getElementPart', () => {
	it( 'returns the part name of the element', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( createMockElement( { model: { part: 'label' } } ) );

		// Act.
		const result = getElementPart( ELEMENT_ID );

		// Assert.
		expect( result ).toBe( 'label' );
	} );

	it( 'returns null when the element is not found', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( null );

		// Act.
		const result = getElementPart( ELEMENT_ID );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'returns null for a part name that does not match the pattern', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( createMockElement( { model: { part: 'Feature-Icon' } } ) );

		// Act.
		const result = getElementPart( ELEMENT_ID );

		// Assert.
		expect( result ).toBeNull();
	} );
} );

describe( 'isElementSlot', () => {
	it( 'returns true for a part marked as a slot', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( { model: { part: 'tab_content', slot: true } } )
		);

		// Act.
		const result = isElementSlot( ELEMENT_ID );

		// Assert.
		expect( result ).toBe( true );
	} );

	it.each( [
		[ 'a slot without a part', { slot: true } ],
		[ 'a non-boolean slot', { part: 'tab_content', slot: 'true' } ],
		[ 'a part without a slot', { part: 'tab_content' } ],
	] )( 'returns false for %s', ( _, model ) => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( createMockElement( { model: model as never } ) );

		// Act.
		const result = isElementSlot( ELEMENT_ID );

		// Assert.
		expect( result ).toBe( false );
	} );
} );
