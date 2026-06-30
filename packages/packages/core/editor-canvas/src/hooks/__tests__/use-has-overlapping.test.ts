import { createDOMElement } from 'test-utils';
import { renderHook } from '@testing-library/react';

import { type CanvasExtendedWindow } from '../../sync/types';
import { useHasOverlapping } from '../use-has-overlapping';

const OFF_CANVAS_CLASS = 'e-off-canvas';

describe( 'useHasOverlapping', () => {
	let mockPreviewFrame: HTMLIFrameElement;
	let mockDocument: Document;

	const setupPreviewFrame = ( hasOffCanvas: boolean, isVisible: boolean = true ) => {
		// Arrange - Create mock iframe and document
		mockPreviewFrame = createDOMElement( { tag: 'iframe' } ) as HTMLIFrameElement;
		mockDocument = document.implementation.createHTMLDocument( 'Preview' );

		if ( hasOffCanvas ) {
			const offCanvasElement = createDOMElement( {
				tag: 'div',
				attrs: { class: OFF_CANVAS_CLASS },
			} );

			// Mock checkVisibility method
			offCanvasElement.checkVisibility = jest.fn().mockReturnValue( isVisible );

			mockDocument.body.appendChild( offCanvasElement );
		}

		// Setup the content window with the mock document
		Object.defineProperty( mockPreviewFrame, 'contentWindow', {
			value: {
				document: mockDocument,
			},
			writable: true,
		} );

		// Setup window.elementor.$preview
		( window as unknown as CanvasExtendedWindow ).elementor = {
			$preview: [ mockPreviewFrame ],
		};
	};

	const cleanupPreviewFrame = () => {
		delete ( window as unknown as CanvasExtendedWindow ).elementor;
	};

	afterEach( () => {
		cleanupPreviewFrame();
	} );

	it( 'should return false when preview frame is not available', () => {
		// Arrange - No preview frame setup

		// Act
		const { result } = renderHook( () => useHasOverlapping() );

		// Assert
		expect( result.current ).toBe( false );
	} );

	it( 'should return false when off-canvas element does not exist', () => {
		// Arrange
		setupPreviewFrame( false );

		// Act
		const { result } = renderHook( () => useHasOverlapping() );

		// Assert
		expect( result.current ).toBe( false );
	} );

	it( 'should return true when off-canvas element exists and is visible', () => {
		// Arrange
		setupPreviewFrame( true, true );

		// Act
		const { result } = renderHook( () => useHasOverlapping() );

		// Assert
		expect( result.current ).toBe( true );
	} );

	it( 'should return false when off-canvas element exists but is not visible', () => {
		// Arrange
		setupPreviewFrame( true, false );

		// Act
		const { result } = renderHook( () => useHasOverlapping() );

		// Assert
		expect( result.current ).toBe( false );
	} );

	it( 'should check visibility with correct options', () => {
		// Arrange
		setupPreviewFrame( true, true );

		// Act
		renderHook( () => useHasOverlapping() );

		// Assert
		// eslint-disable-next-line testing-library/no-node-access
		const offCanvasElement = mockDocument.querySelector( `.${ OFF_CANVAS_CLASS }` );
		expect( offCanvasElement?.checkVisibility ).toHaveBeenCalledWith( {
			opacityProperty: true,
			visibilityProperty: true,
			contentVisibilityAuto: true,
		} );
	} );

	it( 'should return true when multiple off-canvas elements exist and at least one is visible', () => {
		// Arrange
		mockPreviewFrame = createDOMElement( { tag: 'iframe' } ) as HTMLIFrameElement;
		mockDocument = document.implementation.createHTMLDocument( 'Preview' );

		const offCanvasElement1 = createDOMElement( {
			tag: 'div',
			attrs: { class: OFF_CANVAS_CLASS },
		} );
		offCanvasElement1.checkVisibility = jest.fn().mockReturnValue( false );

		const offCanvasElement2 = createDOMElement( {
			tag: 'div',
			attrs: { class: OFF_CANVAS_CLASS },
		} );
		offCanvasElement2.checkVisibility = jest.fn().mockReturnValue( true );

		mockDocument.body.appendChild( offCanvasElement1 );
		mockDocument.body.appendChild( offCanvasElement2 );

		Object.defineProperty( mockPreviewFrame, 'contentWindow', {
			value: {
				document: mockDocument,
			},
			writable: true,
		} );

		( window as unknown as CanvasExtendedWindow ).elementor = {
			$preview: [ mockPreviewFrame ],
		};

		// Act
		const { result } = renderHook( () => useHasOverlapping() );

		// Assert
		expect( result.current ).toBe( true );
	} );

	it( 'should return false when multiple off-canvas elements exist but none are visible', () => {
		// Arrange
		mockPreviewFrame = createDOMElement( { tag: 'iframe' } ) as HTMLIFrameElement;
		mockDocument = document.implementation.createHTMLDocument( 'Preview' );

		const offCanvasElement1 = createDOMElement( {
			tag: 'div',
			attrs: { class: OFF_CANVAS_CLASS },
		} );
		offCanvasElement1.checkVisibility = jest.fn().mockReturnValue( false );

		const offCanvasElement2 = createDOMElement( {
			tag: 'div',
			attrs: { class: OFF_CANVAS_CLASS },
		} );
		offCanvasElement2.checkVisibility = jest.fn().mockReturnValue( false );

		mockDocument.body.appendChild( offCanvasElement1 );
		mockDocument.body.appendChild( offCanvasElement2 );

		Object.defineProperty( mockPreviewFrame, 'contentWindow', {
			value: {
				document: mockDocument,
			},
			writable: true,
		} );

		( window as unknown as CanvasExtendedWindow ).elementor = {
			$preview: [ mockPreviewFrame ],
		};

		// Act
		const { result } = renderHook( () => useHasOverlapping() );

		// Assert
		expect( result.current ).toBe( false );
	} );
} );
