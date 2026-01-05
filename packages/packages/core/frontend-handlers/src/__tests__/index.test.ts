import { init, register, registerBySelector, unregister, unregisterBySelector } from '../index';

describe( 'Frontend Handlers', () => {
	const PARENT_ELEMENT_TYPE = 'e-parent-element';
	const CHILD_ELEMENT_TYPE = 'e-child-element';
	const WIDGET_ELEMENT_TYPE = 'e-widget';
	const ELEMENT_CLASS = 'selector-target';
	const SELECTOR_TARGET = `.${ ELEMENT_CLASS }`;
	const HANDLER_IDS = {
		handler_1: 'handler-1',
		handler_2: 'handler-2',
		parent_handler: 'parent-handler',
	};

	beforeAll( () => {
		init();
	} );

	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	afterEach( () => {
		[ WIDGET_ELEMENT_TYPE, PARENT_ELEMENT_TYPE, CHILD_ELEMENT_TYPE ].forEach( ( elementType ) => {
			unregister( { elementType } );
		} );

		Object.values( HANDLER_IDS ).forEach( ( handler ) => {
			unregisterBySelector( { selector: SELECTOR_TARGET, id: handler } );
		} );
	} );

	describe( 'Handler Registration', () => {
		it( 'should register and execute handler callback', () => {
			// Arrange
			const ELEMENT_ID = 'element-1';
			const handlerCallback = jest.fn();

			register( {
				elementType: WIDGET_ELEMENT_TYPE,
				id: 'widget-handler',
				callback: handlerCallback,
			} );

			const element = document.createElement( 'div' );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			element.setAttribute( 'data-id', ELEMENT_ID );
			document.body.appendChild( element );

			// Act
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			// Assert
			expect( handlerCallback ).toHaveBeenCalledWith(
				expect.objectContaining( {
					element,
					settings: {},
					signal: expect.any( AbortSignal ),
				} )
			);
		} );

		it( 'should register multiple handlers for same element type', () => {
			// Arrange
			const ELEMENT_ID = 'element-1';
			const handler1 = jest.fn();
			const handler2 = jest.fn();

			register( {
				elementType: WIDGET_ELEMENT_TYPE,
				id: HANDLER_IDS.handler_1,
				callback: handler1,
			} );

			register( {
				elementType: WIDGET_ELEMENT_TYPE,
				id: HANDLER_IDS.handler_2,
				callback: handler2,
			} );

			const element = document.createElement( 'div' );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			element.setAttribute( 'data-id', ELEMENT_ID );
			document.body.appendChild( element );

			// Act
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			// Assert
			expect( handler1 ).toHaveBeenCalledTimes( 1 );
			expect( handler2 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should unregister handlers', () => {
			// Arrange
			const ELEMENT_ID = 'element-1';
			const handlerCallback = jest.fn();

			register( {
				elementType: WIDGET_ELEMENT_TYPE,
				id: HANDLER_IDS.handler_1,
				callback: handlerCallback,
			} );

			unregister( { elementType: WIDGET_ELEMENT_TYPE, id: HANDLER_IDS.handler_1 } );

			const element = document.createElement( 'div' );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			element.setAttribute( 'data-id', ELEMENT_ID );
			document.body.appendChild( element );

			// Act
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			// Assert
			expect( handlerCallback ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Settings Parsing', () => {
		it( 'should parse settings from data-e-settings attribute', () => {
			// Arrange
			const ELEMENT_ID = 'element-1';
			const SETTINGS = { color: 'red', size: 'large', enabled: true };
			const handlerCallback = jest.fn();

			register( {
				elementType: WIDGET_ELEMENT_TYPE,
				id: HANDLER_IDS.handler_1,
				callback: handlerCallback,
			} );

			const element = document.createElement( 'div' );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			element.setAttribute( 'data-id', ELEMENT_ID );
			element.setAttribute( 'data-e-settings', JSON.stringify( SETTINGS ) );
			document.body.appendChild( element );

			// Act
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			// Assert
			expect( handlerCallback ).toHaveBeenCalledWith(
				expect.objectContaining( {
					settings: SETTINGS,
				} )
			);
		} );

		it( 'should handle settings changes on re-render', () => {
			// Arrange
			const ELEMENT_ID = 'element-1';
			const INITIAL_SETTINGS = { value: 0 };
			const UPDATED_SETTINGS = { value: 1 };
			const settingsHistory: Record< string, unknown >[] = [];

			register( {
				elementType: WIDGET_ELEMENT_TYPE,
				id: HANDLER_IDS.handler_1,
				callback: ( { settings } ) => {
					settingsHistory.push( { ...settings } );
					return undefined;
				},
			} );

			const element = document.createElement( 'div' );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			element.setAttribute( 'data-id', ELEMENT_ID );
			element.setAttribute( 'data-e-settings', JSON.stringify( INITIAL_SETTINGS ) );
			document.body.appendChild( element );

			// Act
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			element.setAttribute( 'data-e-settings', JSON.stringify( UPDATED_SETTINGS ) );

			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			// Assert
			expect( settingsHistory.length ).toBeGreaterThanOrEqual( 2 );
			expect( settingsHistory[ 0 ] ).toEqual( INITIAL_SETTINGS );
			expect( settingsHistory[ settingsHistory.length - 1 ] ).toEqual( UPDATED_SETTINGS );
		} );
	} );

	describe( 'Cleanup and Unmount', () => {
		it( 'should call selector unmount callback when element is destroyed', () => {
			const ELEMENT_ID = 'selector-1';
			const unmountSelector = jest.fn();

			registerBySelector( {
				selector: SELECTOR_TARGET,
				id: HANDLER_IDS.handler_1,
				callback: () => unmountSelector,
			} );

			const element = document.createElement( 'div' );
			element.classList.add( ELEMENT_CLASS );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			element.setAttribute( 'data-id', ELEMENT_ID );
			document.body.appendChild( element );

			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			window.dispatchEvent(
				new CustomEvent( 'elementor/element/destroy', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE },
				} )
			);

			expect( unmountSelector ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call unmount callback when element is destroyed', () => {
			// Arrange
			const ELEMENT_ID = 'element-1';
			const unmountCallback = jest.fn();

			register( {
				elementType: WIDGET_ELEMENT_TYPE,
				id: HANDLER_IDS.handler_1,
				callback: () => unmountCallback,
			} );

			const element = document.createElement( 'div' );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			element.setAttribute( 'data-id', ELEMENT_ID );
			document.body.appendChild( element );

			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			// Act
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/destroy', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE },
				} )
			);

			// Assert
			expect( unmountCallback ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should cleanup on re-render before new initialization', () => {
			// Arrange
			const ELEMENT_ID = 'element-1';
			const lifecycleEvents: string[] = [];

			register( {
				elementType: WIDGET_ELEMENT_TYPE,
				id: HANDLER_IDS.handler_1,
				callback: () => {
					lifecycleEvents.push( 'init' );
					return () => {
						lifecycleEvents.push( 'cleanup' );
					};
				},
			} );

			const element = document.createElement( 'div' );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			element.setAttribute( 'data-id', ELEMENT_ID );
			document.body.appendChild( element );

			// Act
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			// Assert
			const initCount = lifecycleEvents.filter( ( e ) => e === 'init' ).length;
			const cleanupCount = lifecycleEvents.filter( ( e ) => e === 'cleanup' ).length;

			expect( initCount ).toBe( 2 );
			expect( cleanupCount ).toBeGreaterThanOrEqual( 1 );
			expect( lifecycleEvents[ 0 ] ).toBe( 'init' );
			expect( lifecycleEvents[ lifecycleEvents.length - 1 ] ).toBe( 'init' );
		} );
	} );

	describe( 'AbortSignal Integration', () => {
		it( 'should provide AbortSignal to handler callback', () => {
			// Arrange
			const ELEMENT_ID = 'element-1';
			let receivedSignal: AbortSignal | undefined;

			register( {
				elementType: WIDGET_ELEMENT_TYPE,
				id: HANDLER_IDS.handler_1,
				callback: ( { signal } ) => {
					receivedSignal = signal;
					return undefined;
				},
			} );

			const element = document.createElement( 'div' );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			element.setAttribute( 'data-id', ELEMENT_ID );
			document.body.appendChild( element );

			// Act
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			// Assert
			expect( receivedSignal ).toBeInstanceOf( AbortSignal );
			expect( receivedSignal?.aborted ).toBe( false );
		} );

		it( 'should abort signal when element is destroyed', () => {
			// Arrange
			const ELEMENT_ID = 'element-1';
			let signalAborted = false;

			register( {
				elementType: WIDGET_ELEMENT_TYPE,
				id: HANDLER_IDS.handler_1,
				callback: ( { signal } ) => {
					signal.addEventListener( 'abort', () => {
						signalAborted = true;
					} );
					return undefined;
				},
			} );

			const element = document.createElement( 'div' );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			element.setAttribute( 'data-id', ELEMENT_ID );
			document.body.appendChild( element );

			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE, element },
				} )
			);

			// Act
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/destroy', {
					detail: { id: ELEMENT_ID, type: WIDGET_ELEMENT_TYPE },
				} )
			);

			// Assert
			expect( signalAborted ).toBe( true );
		} );
	} );

	describe( 'Child Render Bubbling', () => {
		it( 'should trigger callback when child of specified type renders', () => {
			// Arrange
			const PARENT_ID = 'parent-1';
			const CHILD_ID = 'child-1';
			const childRenderCallback = jest.fn();

			register( {
				elementType: PARENT_ELEMENT_TYPE,
				id: HANDLER_IDS.handler_1,
				callback: ( { listenToChildren } ) => {
					listenToChildren( [ CHILD_ELEMENT_TYPE ] ).render( childRenderCallback );
					return undefined;
				},
			} );

			const parent = document.createElement( 'div' );
			parent.setAttribute( 'data-e-type', PARENT_ELEMENT_TYPE );
			parent.setAttribute( 'data-id', PARENT_ID );
			document.body.appendChild( parent );

			const child = document.createElement( 'div' );
			child.setAttribute( 'data-e-type', CHILD_ELEMENT_TYPE );
			child.setAttribute( 'data-id', CHILD_ID );
			parent.appendChild( child );

			// Act
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: PARENT_ID, type: PARENT_ELEMENT_TYPE, element: parent },
				} )
			);

			// Render child - this should bubble up to parent
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: CHILD_ID, type: CHILD_ELEMENT_TYPE, element: child },
				} )
			);

			// Assert
			expect( childRenderCallback ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not trigger callback for non-descendant elements', () => {
			// Arrange
			const PARENT_ID = 'parent-1';
			const SIBLING_ID = 'sibling-1';
			const childRenderCallback = jest.fn();

			register( {
				elementType: PARENT_ELEMENT_TYPE,
				id: HANDLER_IDS.parent_handler,
				callback: ( { listenToChildren } ) => {
					listenToChildren( [ CHILD_ELEMENT_TYPE ] ).render( childRenderCallback );
					return undefined;
				},
			} );

			const parent = document.createElement( 'div' );
			parent.setAttribute( 'data-e-type', PARENT_ELEMENT_TYPE );
			parent.setAttribute( 'data-id', PARENT_ID );
			document.body.appendChild( parent );

			const sibling = document.createElement( 'div' );
			sibling.setAttribute( 'data-e-type', CHILD_ELEMENT_TYPE );
			sibling.setAttribute( 'data-id', SIBLING_ID );
			document.body.appendChild( sibling );

			// Act
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: PARENT_ID, type: PARENT_ELEMENT_TYPE, element: parent },
				} )
			);

			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: SIBLING_ID, type: CHILD_ELEMENT_TYPE, element: sibling },
				} )
			);

			// Assert
			expect( childRenderCallback ).not.toHaveBeenCalled();
		} );

		it( 'should cleanup listener on signal abort', () => {
			// Arrange
			const PARENT_ID = 'parent-1';
			const CHILD_ID = 'child-1';
			const childRenderCallback = jest.fn();

			register( {
				elementType: PARENT_ELEMENT_TYPE,
				id: HANDLER_IDS.parent_handler,
				callback: ( { listenToChildren } ) => {
					listenToChildren( [ CHILD_ELEMENT_TYPE ] ).render( childRenderCallback );
					return undefined;
				},
			} );

			const parent = document.createElement( 'div' );
			parent.setAttribute( 'data-e-type', PARENT_ELEMENT_TYPE );
			parent.setAttribute( 'data-id', PARENT_ID );
			document.body.appendChild( parent );

			const child = document.createElement( 'div' );
			child.setAttribute( 'data-e-type', CHILD_ELEMENT_TYPE );
			child.setAttribute( 'data-id', CHILD_ID );
			parent.appendChild( child );

			// Render Parent
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: PARENT_ID, type: PARENT_ELEMENT_TYPE, element: parent },
				} )
			);

			// Destroy Parent (should remove listener)
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/destroy', {
					detail: { id: PARENT_ID, type: PARENT_ELEMENT_TYPE },
				} )
			);

			// Render Child
			window.dispatchEvent(
				new CustomEvent( 'elementor/element/render', {
					detail: { id: CHILD_ID, type: CHILD_ELEMENT_TYPE, element: child },
				} )
			);

			// Assert
			expect( childRenderCallback ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Multiple Element Instances', () => {
		it( 'should handle multiple instances of same element type independently', () => {
			// Arrange
			const PARENT_1_ID = 'parent-1';
			const PARENT_2_ID = 'parent-2';
			const CHILD_1_ID = 'child-1';
			const CHILD_2_ID = 'child-2';
			const callbackCounts = new Map< string, number >();

			register( {
				elementType: PARENT_ELEMENT_TYPE,
				id: HANDLER_IDS.parent_handler,
				callback: ( { element, listenToChildren } ) => {
					const parentId = element.getAttribute( 'data-id' ) || 'unknown';
					callbackCounts.set( parentId, 0 );

					listenToChildren( [ CHILD_ELEMENT_TYPE ] ).render( () => {
						const currentCount = callbackCounts.get( parentId ) || 0;
						callbackCounts.set( parentId, currentCount + 1 );
					} );
					return undefined;
				},
			} );

			const parent1 = document.createElement( 'div' );
			parent1.setAttribute( 'data-e-type', PARENT_ELEMENT_TYPE );
			parent1.setAttribute( 'data-id', PARENT_1_ID );
			document.body.appendChild( parent1 );

			const child1 = document.createElement( 'div' );
			child1.setAttribute( 'data-e-type', CHILD_ELEMENT_TYPE );
			child1.setAttribute( 'data-id', CHILD_1_ID );
			parent1.appendChild( child1 );

			const parent2 = document.createElement( 'div' );
			parent2.setAttribute( 'data-e-type', PARENT_ELEMENT_TYPE );
			parent2.setAttribute( 'data-id', PARENT_2_ID );
			document.body.appendChild( parent2 );

			const child2 = document.createElement( 'div' );
			child2.setAttribute( 'data-e-type', CHILD_ELEMENT_TYPE );
			child2.setAttribute( 'data-id', CHILD_2_ID );
			parent2.appendChild( child2 );

			// Act
			[ parent1, child1, parent2, child2 ].forEach( ( element ) => {
				window.dispatchEvent(
					new CustomEvent( 'elementor/element/render', {
						detail: {
							id: element.getAttribute( 'data-id' ),
							type: element.getAttribute( 'data-e-type' ),
							element,
						},
					} )
				);
			} );

			// Assert
			expect( callbackCounts.get( PARENT_1_ID ) ).toBe( 1 );
			expect( callbackCounts.get( PARENT_2_ID ) ).toBe( 1 );
		} );
	} );

	describe( 'DOMContentLoaded Initialization', () => {
		it( 'should skip selector initialization on page load when in editor', () => {
			// Arrange
			const ELEMENT_ID = 'element-1';
			const selectorHandler = jest.fn();

			registerBySelector( {
				selector: SELECTOR_TARGET,
				id: HANDLER_IDS.handler_1,
				callback: selectorHandler,
			} );

			const element = document.createElement( 'div' );
			element.classList.add( ELEMENT_CLASS );
			element.setAttribute( 'data-id', ELEMENT_ID );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			document.body.appendChild( element );

			const editorWindow = window as Window & { elementor?: unknown };

			editorWindow.elementor = {};

			document.dispatchEvent( new Event( 'DOMContentLoaded' ) );

			expect( selectorHandler ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should initialize selector handlers on page load', () => {
			// Arrange
			const ELEMENT_ID = 'element-1';
			const selectorHandler = jest.fn();

			registerBySelector( {
				selector: SELECTOR_TARGET,
				id: HANDLER_IDS.handler_1,
				callback: selectorHandler,
			} );

			const element = document.createElement( 'div' );
			element.classList.add( ELEMENT_CLASS );
			element.setAttribute( 'data-id', ELEMENT_ID );
			element.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			document.body.appendChild( element );

			document.dispatchEvent( new Event( 'DOMContentLoaded' ) );

			expect( selectorHandler ).toHaveBeenCalledTimes( 1 );
			expect( selectorHandler ).toHaveBeenCalledWith(
				expect.objectContaining( {
					element,
					settings: {},
					signal: expect.any( AbortSignal ),
				} )
			);
		} );

		it( 'should initialize all existing elements on page load', () => {
			// Arrange
			const PARENT_ID = 'parent-1';
			const WIDGET_ID = 'widget-1';
			const initializedElements: string[] = [];

			register( {
				elementType: PARENT_ELEMENT_TYPE,
				id: HANDLER_IDS.parent_handler,
				callback: ( { element } ) => {
					const id = element.getAttribute( 'data-id' ) || 'unknown';
					initializedElements.push( id );
					return undefined;
				},
			} );

			register( {
				elementType: WIDGET_ELEMENT_TYPE,
				id: HANDLER_IDS.handler_1,
				callback: ( { element } ) => {
					const id = element.getAttribute( 'data-id' ) || 'unknown';
					initializedElements.push( id );
					return undefined;
				},
			} );

			const parent = document.createElement( 'div' );
			parent.setAttribute( 'data-e-type', PARENT_ELEMENT_TYPE );
			parent.setAttribute( 'data-id', PARENT_ID );
			document.body.appendChild( parent );

			const widget = document.createElement( 'div' );
			widget.setAttribute( 'data-e-type', WIDGET_ELEMENT_TYPE );
			widget.setAttribute( 'data-id', WIDGET_ID );
			document.body.appendChild( widget );

			init();

			// Act
			document.dispatchEvent( new Event( 'DOMContentLoaded' ) );

			// Assert
			expect( initializedElements ).toContain( PARENT_ID );
			expect( initializedElements ).toContain( WIDGET_ID );
		} );
	} );
} );
