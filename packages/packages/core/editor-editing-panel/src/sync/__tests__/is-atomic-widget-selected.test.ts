import { createMockElement } from 'test-utils';

import { isAtomicWidgetSelected } from '../is-atomic-widget-selected';
import { type ExtendedWindow } from '../types';

describe( 'isAtomicWidgetSelected', () => {
	const getElements = jest.fn();

	beforeEach( () => {
		const extendedWindow = window as unknown as ExtendedWindow;

		extendedWindow.elementor = {
			selection: {
				getElements,
			},
			widgetsCache: {
				'v1-heading': {
					controls: {},
					title: 'V1 Heading',
				},
				'v2-heading': {
					controls: {},
					atomic_controls: [],
					title: 'V2 Heading',
				},
				'v2-container': {
					controls: {},
					atomic_controls: [],
					title: 'V2 Container',
				},
			},
		};
	} );

	it( 'should return false if there are no selectedElements', () => {
		// Arrange.
		getElements.mockReturnValue( [] );

		// Assert.
		expect( isAtomicWidgetSelected() ).toBe( false );
	} );

	it( 'should return true for v2 element', () => {
		// Arrange.
		getElements.mockReturnValue( [ createMockElement( { model: { widgetType: 'v2-heading' } } ) ] );

		// Assert.
		expect( isAtomicWidgetSelected() ).toBe( true );
	} );

	it( 'should return true for v2 element', () => {
		// Arrange.
		getElements.mockReturnValue( [ createMockElement( { model: { elType: 'v2-container' } } ) ] );

		// Assert.
		expect( isAtomicWidgetSelected() ).toBe( true );
	} );

	it( 'should return false for v1 element', () => {
		// Arrange.
		getElements.mockReturnValue( [ createMockElement( { model: { widgetType: 'v1-heading' } } ) ] );

		// Assert.
		expect( isAtomicWidgetSelected() ).toBe( false );
	} );

	it( 'should return false for non-existing element', () => {
		// Arrange.
		getElements.mockReturnValue( [ createMockElement( { model: { widgetType: 'non-existing' } } ) ] );

		// Assert.
		expect( isAtomicWidgetSelected() ).toBe( false );
	} );

	it( 'should return false if there is more than 1 selected element with mixed versions', () => {
		// Arrange.
		getElements.mockReturnValue( [
			createMockElement( { model: { widgetType: 'v2-heading' } } ),
			createMockElement( { model: { widgetType: 'v1-heading' } } ),
		] );

		// Assert.
		expect( isAtomicWidgetSelected() ).toBe( false );
	} );

	it( 'should return false if there is more than 1 selected element with same version', () => {
		// Arrange.
		getElements.mockReturnValue( [
			createMockElement( { model: { widgetType: 'v2-heading' } } ),
			createMockElement( { model: { widgetType: 'v2-container' } } ),
		] );

		// Assert.
		expect( isAtomicWidgetSelected() ).toBe( false );
	} );
} );
