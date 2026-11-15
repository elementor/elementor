import { createMockElement } from 'test-utils';

import { getContainerPart, getContainerWidgetMarker, isContainerSlot } from '../get-element-widget-markers';

describe( 'getContainerWidgetMarker', () => {
	it( 'returns the widget marker of the container', () => {
		// Arrange.
		const widget = { id: 'elementor/icon-button', version: 1, values: { icon: false } };

		// Act.
		const result = getContainerWidgetMarker( createMockElement( { model: { widget } } ) );

		// Assert.
		expect( result ).toEqual( widget );
	} );

	it( 'defaults missing values to an empty object', () => {
		// Arrange.
		const widget = { id: 'elementor/icon-button', version: 1 };

		// Act.
		const result = getContainerWidgetMarker( createMockElement( { model: { widget } } ) );

		// Assert.
		expect( result ).toEqual( { ...widget, values: {} } );
	} );

	it( 'returns null when the container is not a widget root', () => {
		// Act.
		const result = getContainerWidgetMarker( createMockElement( { model: {} } ) );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'returns null when there is no container', () => {
		// Act.
		const result = getContainerWidgetMarker( null );

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
		// Act.
		const result = getContainerWidgetMarker( createMockElement( { model: { widget } as never } ) );

		// Assert.
		expect( result ).toBeNull();
	} );
} );

describe( 'getContainerPart', () => {
	it( 'returns the part name of the container', () => {
		// Act.
		const result = getContainerPart( createMockElement( { model: { part: 'label' } } ) );

		// Assert.
		expect( result ).toBe( 'label' );
	} );

	it( 'returns null when there is no container', () => {
		// Act.
		const result = getContainerPart( null );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'returns null for a part name that does not match the pattern', () => {
		// Act.
		const result = getContainerPart( createMockElement( { model: { part: 'Feature-Icon' } } ) );

		// Assert.
		expect( result ).toBeNull();
	} );
} );

describe( 'isContainerSlot', () => {
	it( 'returns true for a part marked as a slot', () => {
		// Act.
		const result = isContainerSlot( createMockElement( { model: { part: 'tab_content', slot: true } } ) );

		// Assert.
		expect( result ).toBe( true );
	} );

	it( 'returns false when there is no container', () => {
		// Act.
		const result = isContainerSlot( null );

		// Assert.
		expect( result ).toBe( false );
	} );

	it.each( [
		[ 'a slot without a part', { slot: true } ],
		[ 'a non-boolean slot', { part: 'tab_content', slot: 'true' } ],
		[ 'a part without a slot', { part: 'tab_content' } ],
	] )( 'returns false for %s', ( _, model ) => {
		// Act.
		const result = isContainerSlot( createMockElement( { model: model as never } ) );

		// Assert.
		expect( result ).toBe( false );
	} );
} );
