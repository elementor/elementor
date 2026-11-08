import { createMockElement } from 'test-utils';

import { getContainer } from '../get-container';
import { getElementPart, getElementWidgetMarker } from '../get-element-widget-markers';

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
} );
