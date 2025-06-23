import { dispatchElementEvent } from 'test-utils';
import { renderHook } from '@testing-library/react';

import { type ExtendedWindow } from '../../sync/types';
import { useParentElement } from '../use-parent-element';

describe( 'useParentElement', () => {
	let extendedWindow: ExtendedWindow;

	beforeEach( () => {
		extendedWindow = window as unknown as ExtendedWindow;
	} );

	it( 'should return the parent of the element', () => {
		// Arrange
		const mockElement = {
			id: 'mockId',
			parent: {
				id: 'mockParent',
				model: {},
				parent: {},
			},
		};
		dispatchElementEvent( 'document/elements/create', 'mockId' );

		extendedWindow.elementor = {
			getContainer: jest.fn().mockReturnValue( mockElement ),
		};

		// Act
		const { result } = renderHook( () => useParentElement( 'mockId' ) );

		// Assert

		expect( result.current ).toBe( mockElement.parent );
	} );

	it( 'should return null when element not found', () => {
		// Arrange
		extendedWindow.elementor = {
			getContainer: jest.fn().mockReturnValue( undefined ),
		};
		dispatchElementEvent( 'document/elements/create', 'mockId' );

		// Act
		const { result } = renderHook( () => useParentElement( 'mockId' ) );
		// Assert
		expect( result.current ).toBeNull();
	} );

	it( 'should return null when getContainer not defined', () => {
		// Arrange
		extendedWindow.elementor = {
			getContainer: undefined,
		};

		dispatchElementEvent( 'document/elements/create', 'mockId' );

		// Act
		const { result } = renderHook( () => useParentElement( 'mockId' ) );
		// Assert
		expect( result.current ).toBeNull();
	} );
} );
