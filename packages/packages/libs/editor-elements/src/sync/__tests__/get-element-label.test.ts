import { createMockElement } from 'test-utils';
import { getElementLabel } from '@elementor/editor-elements';

import { ElementLabelNotExistsError, ElementTypeNotExistsError } from '../../errors';
import { getContainer } from '../get-container';
import { type ExtendedWindow } from '../types';

jest.mock( '../get-container' );

describe( 'getElementLabel', () => {
	const eWindow = window as unknown as ExtendedWindow;

	it( 'should return element label', () => {
		// Arrange.
		jest.mocked( getContainer ).mockImplementation( ( id ) => {
			return id === 'test-element-id'
				? createMockElement( {
						model: {
							widgetType: 'test-element-type',
						},
				  } )
				: null;
		} );

		eWindow.elementor = {
			widgetsCache: {
				'test-element-type': {
					title: 'Test Element',
				} as never,
			},
		};

		// Act.
		const label = getElementLabel( 'test-element-id' );

		// Assert.
		expect( label ).toBe( 'Test Element' );
	} );

	it( 'should throw if element does not exist', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( null );

		// Act & Assert.
		expect( () => getElementLabel( 'non-existing-element' ) ).toThrow( ElementTypeNotExistsError );
	} );

	it( 'should throw if element type does not exist in widget cache', () => {
		// Arrange.
		jest.mocked( getContainer ).mockImplementation( ( id ) => {
			return id === 'test-element-id'
				? createMockElement( {
						model: {
							widgetType: 'non-existing-test-element-type',
						},
				  } )
				: null;
		} );

		eWindow.elementor = {
			widgetsCache: {
				'test-element-type': {
					title: 'Test Element',
				} as never,
			},
		};

		// Act & Assert.
		expect( () => getElementLabel( 'test-element-id' ) ).toThrow( ElementLabelNotExistsError );
	} );
} );
