import { activate, deactivate, isActive, register, unregister } from '../../replacements/registry';
import { createReplacementBridge } from '../create-replacement-bridge';
import { createTemplatedElementView } from '../create-templated-element-type';
import { type ElementView } from '../types';

jest.mock( '../create-templated-element-type' );
jest.mock( '../../replacements/registry' );

const ELEMENT_ID = 'test-element-123';
const REPLACEMENT_TYPE = 'inline-editing';

describe( 'createReplacementBridge', () => {
	let mockView: Partial<ElementView>;
	let mockConfig: {
		type: 'inline-editing';
		shouldActivate: jest.Mock;
		activationTrigger: 'dblclick';
		onActivate: jest.Mock;
		getProps: jest.Mock;
	};
	let mockOptions: {
		type: string;
		renderer: unknown;
		element: { twig_templates: Record<string, unknown> };
	};
	let ViewClass: ReturnType<typeof createReplacementBridge>;

	beforeEach( () => {
		const mockElement = document.createElement( 'div' );
		mockElement.innerHTML = '<span class="test-class">Test content</span>';

		mockView = {
			container: { id: ELEMENT_ID } as any,
			model: {
				get: jest.fn( ( key: string ) => {
					if ( key === 'id' ) {
						return ELEMENT_ID;
					}
					return undefined;
				} ),
			} as any,
			el: mockElement,
			$el: {
				on: jest.fn(),
				off: jest.fn(),
				html: jest.fn(),
			} as any,
		};

		mockConfig = {
			type: REPLACEMENT_TYPE,
			shouldActivate: jest.fn().mockReturnValue( true ),
			activationTrigger: 'dblclick',
			onActivate: jest.fn(),
			getProps: jest.fn().mockReturnValue( {
				classes: 'test-class',
				expectedTag: 'h1',
			} ),
		};

		mockOptions = {
			type: 'test-widget',
			renderer: {},
			element: { twig_templates: {} },
		};

		const MockTemplatedView = class {
			container = mockView.container;
			model = mockView.model;
			el = mockView.el;
			$el = mockView.$el;

			render() {}
			onDestroy() {}
		};

		jest.mocked( createTemplatedElementView ).mockReturnValue( MockTemplatedView as any );
		jest.mocked( isActive ).mockReturnValue( false );

		ViewClass = createReplacementBridge( mockConfig, mockOptions );
	} );

	afterEach( () => {
		jest.clearAllMocks();
		unregister( ELEMENT_ID );
	} );

	describe( 'render', () => {
		it( 'should register replacement on first render with container', () => {
			const view = new ViewClass();
			Object.assign( view, mockView );

			view.render();

			expect( register ).toHaveBeenCalledWith(
				expect.objectContaining( {
					elementId: ELEMENT_ID,
					targetElement: mockView.el,
					type: REPLACEMENT_TYPE,
				} )
			);
		} );

		it( 'should use model.id fallback when container.id not available', () => {
			const viewWithoutContainer = new ViewClass();
			Object.assign( viewWithoutContainer, {
				...mockView,
				container: undefined,
			} );

			viewWithoutContainer.render();

			expect( register ).toHaveBeenCalledWith(
				expect.objectContaining( {
					elementId: ELEMENT_ID,
				} )
			);
		} );

		it( 'should attach double-click handler when shouldActivate returns true', () => {
			const view = new ViewClass();
			Object.assign( view, mockView );

			view.render();

			expect( mockView.$el?.on ).toHaveBeenCalledWith(
				'dblclick',
				'*',
				expect.any( Function )
			);
		} );

		it( 'should not attach handler when shouldActivate returns false', () => {
			mockConfig.shouldActivate.mockReturnValue( false );
			const view = new ViewClass();
			Object.assign( view, mockView );

			view.render();

			expect( mockView.$el?.on ).not.toHaveBeenCalled();
		} );

		it( 'should return early when replacement is active', () => {
			jest.mocked( isActive ).mockReturnValue( true );
			const view = new ViewClass();
			Object.assign( view, mockView );

			view.render();

			expect( register ).not.toHaveBeenCalled();
			expect( mockView.$el?.on ).not.toHaveBeenCalled();
		} );

		it( 'should activate replacement when handler is triggered', () => {
			const view = new ViewClass();
			Object.assign( view, mockView );

			view.render();

			const onCall = jest.mocked( mockView.$el?.on );
			const handler = onCall.mock.calls[ 0 ]?.[ 2 ] as ( event: Event ) => void;

			const mockEvent = {
				stopPropagation: jest.fn(),
			} as any;

			handler( mockEvent );

			expect( mockEvent.stopPropagation ).toHaveBeenCalled();
			expect( activate ).toHaveBeenCalledWith( ELEMENT_ID );
		} );

		it( 'should cache props before clearing element on activation', () => {
			const view = new ViewClass();
			Object.assign( view, mockView );

			view.render();

			const registerCall = jest.mocked( register ).mock.calls[ 0 ]?.[ 0 ];
			const onActivate = registerCall?.onActivate;

			onActivate?.();

			expect( mockConfig.getProps ).toHaveBeenCalled();
			expect( mockView.$el?.html ).toHaveBeenCalledWith( '' );
		} );
	} );

	describe( 'onDestroy', () => {
		it( 'should remove event handlers', () => {
			const view = new ViewClass();
			Object.assign( view, mockView );

			view.render();
			view.onDestroy();

			expect( mockView.$el?.off ).toHaveBeenCalledWith( 'dblclick', '*' );
		} );

		it( 'should unregister and deactivate replacement', () => {
			const view = new ViewClass();
			Object.assign( view, mockView );

			view.render();
			view.onDestroy();

			expect( unregister ).toHaveBeenCalledWith( ELEMENT_ID );
			expect( deactivate ).toHaveBeenCalledWith( ELEMENT_ID );
		} );

		it( 'should handle missing container gracefully', () => {
			const view = new ViewClass();
			Object.assign( view, {
				...mockView,
				container: undefined,
				model: { get: jest.fn().mockReturnValue( undefined ) },
			} );

			expect( () => view.onDestroy() ).not.toThrow();
		} );
	} );
} );

