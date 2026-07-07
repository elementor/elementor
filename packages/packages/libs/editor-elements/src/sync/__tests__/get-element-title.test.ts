import { createMockElement } from 'test-utils';
import { getElementTitle } from '@elementor/editor-elements';

import { getContainer } from '../get-container';
import { type ExtendedWindow } from '../types';

jest.mock( '../get-container' );

describe( 'getElementTitle', () => {
	const eWindow = window as unknown as ExtendedWindow;

	beforeEach( () => {
		eWindow.elementor = {
			widgetsCache: {
				'test-widget': { title: 'Widget Type Title' } as never,
			},
		};
	} );

	it( 'should return editor_settings.title when set', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( {
				model: {
					widgetType: 'test-widget',
					editor_settings: { title: 'Custom Editor Title' },
				},
			} )
		);

		// Act.
		const title = getElementTitle( 'test-id' );

		// Assert.
		expect( title ).toBe( 'Custom Editor Title' );
	} );

	it( 'should return _title setting when editor_settings.title is not set', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( {
				model: { widgetType: 'test-widget' },
				settings: { _title: 'Legacy Custom Title' as never },
			} )
		);

		// Act.
		const title = getElementTitle( 'test-id' );

		// Assert.
		expect( title ).toBe( 'Legacy Custom Title' );
	} );

	it( 'should return presetTitle setting when editor_settings.title and _title are not set', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( {
				model: { widgetType: 'test-widget' },
				settings: { presetTitle: 'Preset Title' as never },
			} )
		);

		// Act.
		const title = getElementTitle( 'test-id' );

		// Assert.
		expect( title ).toBe( 'Preset Title' );
	} );

	it( 'should return widget type title when no custom title is set', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( {
				model: { widgetType: 'test-widget' },
			} )
		);

		// Act.
		const title = getElementTitle( 'test-id' );

		// Assert.
		expect( title ).toBe( 'Widget Type Title' );
	} );

	it( 'should return null when element does not exist', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( null );

		// Act.
		const title = getElementTitle( 'non-existing-id' );

		// Assert.
		expect( title ).toBeNull();
	} );

	it( 'should return null when element type is not in widgets cache', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( {
				model: { widgetType: 'unknown-widget' },
			} )
		);

		// Act.
		const title = getElementTitle( 'test-id' );

		// Assert.
		expect( title ).toBeNull();
	} );

	it( 'should prefer editor_settings.title over _title setting', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( {
				model: {
					widgetType: 'test-widget',
					editor_settings: { title: 'Editor Title' },
				},
				settings: { _title: 'Legacy Title' as never },
			} )
		);

		// Act.
		const title = getElementTitle( 'test-id' );

		// Assert.
		expect( title ).toBe( 'Editor Title' );
	} );
} );
