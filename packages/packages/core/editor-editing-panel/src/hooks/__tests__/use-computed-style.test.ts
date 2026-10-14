import { createDOMElement, dispatchElementEvent } from 'test-utils';
import { renderHook } from '@testing-library/react';

import { useComputedStyle } from '../use-computed-style';

describe( 'useComputedStyle', () => {
	const mockElement = {
		id: 'mockId',
		view: {
			el: {},
		},
	};

	it( 'should return the style of the element on device-mode/change event', () => {
		// Arrange
		window.elementor = {
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
		window.elementor = {
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
		window.elementor = {
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
		window.elementor = {
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
		window.elementor = undefined;

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );
		// Assert
		expect( result.current ).toBeNull();
	} );

	it( 'should return null when getContainer not defined', () => {
		// Arrange
		window.elementor = {
			getContainer: undefined,
		};

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );
		// Assert
		expect( result.current ).toBeNull();
	} );

	it( 'should return null when element not found', () => {
		// Arrange
		window.elementor = {
			getContainer: jest.fn().mockReturnValue( undefined ),
		};

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );
		// Assert
		expect( result.current ).toBeNull();
	} );

	it( 'should return null when element view undefined', () => {
		// Arrange
		window.elementor = {
			getContainer: jest.fn().mockReturnValue( undefined ),
		};

		// Act
		const { result } = renderHook( () => useComputedStyle( 'mockId' ) );
		// Assert
		expect( result.current ).toBeNull();
	} );
} );
