import { createDOMElement, dispatchElementEvent } from 'test-utils';
import { renderHook } from '@testing-library/react';

import { type ExtendedWindow } from '../../sync/types';
import { useComputedStyle } from '../use-computed-style';

describe( 'useComputedStyle', () => {
	const mockElement = {
		id: 'mockId',
		view: {
			el: {},
		},
	};
	let extendedWindow: ExtendedWindow;

	beforeEach( () => {
		extendedWindow = window as unknown as ExtendedWindow;
	} );

	it( 'should return the style of the element on device-mode/change event', () => {
		// Arrange
		extendedWindow.elementor = {
			getContainer: jest.fn().mockReturnValue( mockElement ),
		};
		const ele = createDOMElement( {
			tag: 'div',
			attrs: {
				'data-id': 'mockId',
				style: 'display: flex',
			},
		} );
		mockElement.view.el = ele;
		document.body.appendChild( ele );

		dispatchElementEvent( 'elementor/device-mode/change', 'mockId' );

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );

		// Assert
		expect( result.current?.display ).toBe( 'flex' );
	} );

	it( 'should return the style of the element on elements/reset-style event', () => {
		// Arrange
		extendedWindow.elementor = {
			getContainer: jest.fn().mockReturnValue( mockElement ),
		};
		const ele = createDOMElement( {
			tag: 'div',
			attrs: {
				'data-id': 'mockId',
				style: 'display: flex',
			},
		} );
		mockElement.view.el = ele;
		document.body.appendChild( ele );

		dispatchElementEvent( 'document/elements/reset-style', 'mockId' );

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );

		// Assert
		expect( result.current?.display ).toBe( 'flex' );
	} );

	it( 'should return the style of the element on elements/settings event', () => {
		// Arrange
		extendedWindow.elementor = {
			getContainer: jest.fn().mockReturnValue( mockElement ),
		};
		const ele = createDOMElement( {
			tag: 'div',
			attrs: {
				'data-id': 'mockId',
				style: 'display: flex',
			},
		} );
		mockElement.view.el = ele;
		document.body.appendChild( ele );

		dispatchElementEvent( 'document/elements/settings', 'mockId' );

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );

		// Assert
		expect( result.current?.display ).toBe( 'flex' );
	} );

	it( 'should return the style of the element on elements/paste-style event', () => {
		// Arrange
		extendedWindow.elementor = {
			getContainer: jest.fn().mockReturnValue( mockElement ),
		};
		const ele = createDOMElement( {
			tag: 'div',
			attrs: {
				'data-id': 'mockId',
				style: 'display: flex',
			},
		} );
		mockElement.view.el = ele;
		document.body.appendChild( ele );

		dispatchElementEvent( 'document/elements/paste-style', 'mockId' );

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );

		// Assert
		expect( result.current?.display ).toBe( 'flex' );
	} );

	it( 'should return null when elementor not defined', () => {
		// Arrange
		extendedWindow.elementor = undefined;

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );
		// Assert
		expect( result.current ).toBeNull();
	} );

	it( 'should return null when getContainer not defined', () => {
		// Arrange
		extendedWindow.elementor = {
			getContainer: undefined,
		};

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );
		// Assert
		expect( result.current ).toBeNull();
	} );

	it( 'should return null when element not found', () => {
		// Arrange
		extendedWindow.elementor = {
			getContainer: jest.fn().mockReturnValue( undefined ),
		};

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );
		// Assert
		expect( result.current ).toBeNull();
	} );

	it( 'should return null when element view undefined', () => {
		// Arrange
		extendedWindow.elementor = {
			getContainer: jest.fn().mockReturnValue( undefined ),
		};

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );
		// Assert
		expect( result.current ).toBeNull();
	} );
} );
