import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { repeaterEventBus } from '../../../services/repeater-event-bus';
import { TransitionRepeaterControl } from '../transition-repeater-control';

jest.mock( '../../selection-size-control', () => ( {
	SelectionSizeControl: jest.fn( () => <div data-testid="selection-size-control">Mock Selection Size Control</div> ),
} ) );

jest.mock( '../transition-selector', () => ( {
	TransitionSelector: jest.fn( () => <div data-testid="transition-selector">Mock Transition Selector</div> ),
} ) );

jest.mock( '../../../services/repeater-event-bus', () => ( {
	repeaterEventBus: {
		subscribe: jest.fn( () => jest.fn() ),
		emit: jest.fn(),
	},
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
		it( 'should subscribe to item-added events on mount', () => {
			// Arrange
			const props = createDefaultProps();

			// Act
			renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );

			// Assert
			expect( repeaterEventBus.subscribe ).toHaveBeenCalledWith( 'item-added', expect.any( Function ) );
		} );

		it( 'should emit transition-item-added event when transition item is added', () => {
			// Arrange
			const props = createDefaultProps();
			const mockSubscribe = jest.fn( ( event, callback ) => {
				if ( event === 'item-added' ) {
					callback( { repeaterType: 'transition' } );
				}
				return jest.fn();
			} );

			jest.mocked( repeaterEventBus.subscribe ).mockImplementation( mockSubscribe );

			// Act
			renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );

			// Assert
			expect( repeaterEventBus.emit ).toHaveBeenCalledWith( 'transition-item-added', {
				transition_type: expect.any( String ),
			} );
		} );

		it( 'should not emit transition-item-added event for non-transition items', () => {
			// Arrange
			const props = createDefaultProps();
			const mockSubscribe = jest.fn( ( event, callback ) => {
				if ( event === 'item-added' ) {
					callback( { repeaterType: 'transform' } );
				}
				return jest.fn();
			} );

			jest.mocked( repeaterEventBus.subscribe ).mockImplementation( mockSubscribe );

			// Act
			renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );

			// Assert
			expect( repeaterEventBus.emit ).not.toHaveBeenCalledWith( 'transition-item-added', expect.anything() );
		} );

		it( 'should unsubscribe from events on unmount', () => {
			// Arrange
			const props = createDefaultProps();
			const mockUnsubscribe = jest.fn();
			jest.mocked( repeaterEventBus.subscribe ).mockReturnValue( mockUnsubscribe );

			// Act
			const { unmount } = renderControl(
				<TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />,
				props
			);
			unmount();

			// Assert
			expect( mockUnsubscribe ).toHaveBeenCalled();
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
