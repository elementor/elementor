import { createMockElement } from 'test-utils';
import { getElementIcon } from '@elementor/editor-elements';

import { getContainer } from '../get-container';
import { type ExtendedWindow } from '../types';

jest.mock( '../get-container' );

describe( 'getElementIcon', () => {
	const eWindow = window as unknown as ExtendedWindow;

	beforeEach( () => {
		eWindow.elementor = {
			widgetsCache: {
				'test-widget': { title: 'Widget Type Title', icon: 'eicon-t-letter' } as never,
				'test-container': { title: 'Container', icon: 'eicon-container' } as never,
				'no-icon-widget': { title: 'No Icon Widget' } as never,
			},
		};
	} );

	it( 'should return icon from widgetsCache when element has widgetType', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( {
				model: { widgetType: 'test-widget' },
			} )
		);

		// Act.
		const icon = getElementIcon( 'test-id' );

		// Assert.
		expect( icon ).toBe( 'eicon-t-letter' );
	} );

	it( 'should return icon from widgetsCache when element has elType (non-widget)', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( {
				model: { elType: 'test-container' },
			} )
		);

		// Act.
		const icon = getElementIcon( 'test-id' );

		// Assert.
		expect( icon ).toBe( 'eicon-container' );
	} );

	it( 'should return null when element does not exist', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( null );

		// Act.
		const icon = getElementIcon( 'non-existing-id' );

		// Assert.
		expect( icon ).toBeNull();
	} );

	it( 'should return null when type is not in widgets cache', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( {
				model: { widgetType: 'unknown-widget' },
			} )
		);

		// Act.
		const icon = getElementIcon( 'test-id' );

		// Assert.
		expect( icon ).toBeNull();
	} );

	it( 'should return null when icon is not defined on the config', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( {
				model: { widgetType: 'no-icon-widget' },
			} )
		);

		// Act.
		const icon = getElementIcon( 'test-id' );

		// Assert.
		expect( icon ).toBeNull();
	} );
} );
