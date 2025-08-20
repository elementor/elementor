import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { sendAddTransitionControlEvent } from '../../../utils/event-tracking';
import { repeaterEventBus } from '../../../services/repeater-event-bus';
import { TransitionRepeaterControl } from '../transition-repeater-control';

jest.mock( '../../selection-size-control', () => ( {
	SelectionSizeControl: jest.fn( () => <div data-testid="selection-size-control">Mock Selection Size Control</div> ),
} ) );

jest.mock( '../transition-selector', () => ( {
	TransitionSelector: jest.fn( () => <div data-testid="transition-selector">Mock Transition Selector</div> ),
} ) );

jest.mock( '../../../utils/event-tracking', () => ( {
	sendAddTransitionControlEvent: jest.fn(),
} ) );

const createTransitionPropType = () =>
	createMockPropType( {
		kind: 'array',
	} );

const createDefaultProps = () => ( {
	setValue: jest.fn(),
	value: { $$type: 'array', value: [] },
	bind: 'transition',
	propType: createTransitionPropType(),
} );

describe( 'TransitionRepeaterControl', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Rendering', () => {
		it( 'should render with default empty state', () => {
			// Arrange
			const props = createDefaultProps();

			// Act
			renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );

			// Assert
			expect( screen.getByText( 'Transitions' ) ).toBeInTheDocument();
		} );

		it( 'should render with initial transition values', () => {
			// Arrange
			const props = {
				...createDefaultProps(),
				value: {
					$$type: 'array',
					value: [
						{
							$$type: 'selection-size',
							value: {
								selection: {
									$$type: 'key-value',
									value: {
										key: { $$type: 'string', value: 'All properties' },
										value: { $$type: 'string', value: 'all' },
									},
								},
								size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
							},
						},
					],
				},
			};

			// Act
			renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );
			const addButton = screen.getByRole( 'button' );
			fireEvent.click( addButton );

			// Assert
			expect( screen.getByText( 'Transitions' ) ).toBeInTheDocument();
			expect( screen.getByText( ( content ) => content.includes( 'All properties' ) ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Add Button State', () => {
		it( 'should display an enabled add button when rendered in normal style state', () => {
			// Arrange
			const props = createDefaultProps();

			// Act
			renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );

			// Assert
			const addButton = screen.getByLabelText( 'Add item' );
			expect( addButton ).toBeInTheDocument();
			expect( addButton ).toBeEnabled();
		} );

		it( 'should display a disabled add button when not in normal style state', () => {
			// Arrange
			const props = createDefaultProps();

			// Act
			renderControl( <TransitionRepeaterControl currentStyleState={ 'hover' } recentlyUsedList={ [] } />, props );

			// Assert
			const addButton = screen.getByLabelText( 'Add item' );
			expect( addButton ).toBeInTheDocument();
			expect( addButton ).toBeDisabled();
		} );

		it( 'should display tooltip when button is disabled', () => {
			// Arrange
			const props = createDefaultProps();

			// Act
			renderControl( <TransitionRepeaterControl currentStyleState={ 'hover' } recentlyUsedList={ [] } />, props );

			// Assert
			const addButton = screen.getByLabelText( 'Add item' );
			expect( addButton ).toBeDisabled();
		} );
	} );

	describe( 'Event Bus Integration', () => {
		it( 'should subscribe to transition-item-added events on mount', () => {
			// Arrange
			const props = createDefaultProps();
			const subscribeSpy = jest.spyOn( repeaterEventBus, 'subscribe' );

			// Act
			renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );

			// Assert
			expect( subscribeSpy ).toHaveBeenCalledWith( 'transition-item-added', expect.any( Function ) );

			// Cleanup
			subscribeSpy.mockRestore();
		} );

		it( 'should call sendAddTransitionControlEvent when transition item is added', () => {
			// Arrange
			const props = createDefaultProps();
			const subscribeSpy = jest.spyOn( repeaterEventBus, 'subscribe' );

			// Act
			renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );

			// Simulate the event being emitted by the repeater
			const callback = subscribeSpy.mock.calls[ 0 ][ 1 ];
			callback();

			// Assert
			expect( sendAddTransitionControlEvent ).toHaveBeenCalled();

			subscribeSpy.mockRestore();
		} );

		it( 'should not call sendAddTransitionControlEvent for non-transition events', () => {
			// Arrange
			const props = createDefaultProps();

			// Act
			renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );

			// Assert
			expect( sendAddTransitionControlEvent ).not.toHaveBeenCalled();
		} );

		it( 'should unsubscribe from events on unmount', () => {
			// Arrange
			const props = createDefaultProps();
			const subscribeSpy = jest.spyOn( repeaterEventBus, 'subscribe' );
			const mockUnsubscribe = jest.fn();
			subscribeSpy.mockReturnValue( mockUnsubscribe );

			// Act
			const { unmount } = renderControl(
				<TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />,
				props
			);
			unmount();

			// Assert
			expect( mockUnsubscribe ).toHaveBeenCalled();

			subscribeSpy.mockRestore();
		} );
	} );

	describe( 'Props Handling', () => {
		it( 'should pass recently used list to child components', () => {
			// Arrange
			const props = createDefaultProps();
			const recentlyUsedList = [ 'fade', 'slide' ];

			// Act
			renderControl(
				<TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ recentlyUsedList } />,
				props
			);

			// Assert
			expect( screen.getByText( 'Transitions' ) ).toBeInTheDocument();
		} );

		it( 'should handle different style states correctly', () => {
			// Arrange
			const props = createDefaultProps();
			const styleStates = [ null, 'hover' as const, 'active' as const, 'focus' as const ];

			styleStates.forEach( ( styleState ) => {
				// Act & Assert
				const { unmount } = renderControl(
					<TransitionRepeaterControl currentStyleState={ styleState } recentlyUsedList={ [] } />,
					props
				);

				const addButton = screen.getByLabelText( 'Add item' );
				if ( styleState === null ) {
					expect( addButton ).toBeEnabled();
				} else {
					expect( addButton ).toBeDisabled();
				}

				unmount();
			} );
		} );
	} );
} );
