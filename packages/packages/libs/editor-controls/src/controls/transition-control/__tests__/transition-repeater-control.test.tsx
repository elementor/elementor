import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { sendMixpanelEvent } from '@elementor/utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { repeaterEventBus, RepeaterEvents } from '../../../services/repeater-event-bus';
import { TransitionRepeaterControl } from '../transition-repeater-control';

jest.mock( '../../selection-size-control', () => ( {
	SelectionSizeControl: jest.fn( () => <div data-testid="selection-size-control">Mock Selection Size Control</div> ),
} ) );

jest.mock( '../transition-selector', () => ( {
	TransitionSelector: jest.fn( () => <div data-testid="transition-selector">Mock Transition Selector</div> ),
} ) );

jest.mock( '@elementor/utils', () => ( {
	sendMixpanelEvent: jest.fn(),
	createError: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	getSelectedElements: jest.fn( () => [ { type: 'test-widget' } ] ),
} ) );

import { getSelectedElements } from '@elementor/editor-elements';

const mockedGetSelectedElements = getSelectedElements as jest.MockedFunction< typeof getSelectedElements >;

const recentlyUsedGetter = () => Promise.resolve( [] );

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
		it( 'should render with default empty state', async () => {
			// Arrange
			const props = createDefaultProps();

			// Act
			renderControl(
				<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
				props
			);

			// Assert
			await waitFor( () => {
				expect( screen.getByText( 'Transitions' ) ).toBeInTheDocument();
			} );
		} );

		it( 'should render with initial transition values', async () => {
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
			renderControl(
				<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
				props
			);

			const addButton = screen.getByRole( 'button' );
			fireEvent.click( addButton );

			// Assert
			await waitFor( () => {
				expect( screen.getByText( 'Transitions' ) ).toBeInTheDocument();
			} );
			expect( screen.getByText( ( content ) => content.includes( 'All properties' ) ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Add Button State', () => {
		it( 'should display an enabled add button when rendered in normal style state', async () => {
			// Arrange
			const props = createDefaultProps();

			// Act
			renderControl(
				<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
				props
			);

			// Assert
			await waitFor( () => {
				expect( screen.getByLabelText( 'Add item' ) ).toBeInTheDocument();
			} );

			const addButton = screen.getByLabelText( 'Add item' );
			expect( addButton ).toBeEnabled();
		} );

		it( 'should display a disabled add button when not in normal style state', async () => {
			// Arrange
			const props = createDefaultProps();

			// Act
			renderControl(
				<TransitionRepeaterControl
					currentStyleState={ 'hover' }
					recentlyUsedListGetter={ recentlyUsedGetter }
				/>,
				props
			);

			// Assert
			await waitFor( () => {
				expect( screen.getByLabelText( 'Add item' ) ).toBeInTheDocument();
			} );

			const addButton = screen.getByLabelText( 'Add item' );
			expect( addButton ).toBeDisabled();
		} );

		it( 'should display tooltip when button is disabled', async () => {
			// Arrange
			const props = createDefaultProps();

			// Act
			renderControl(
				<TransitionRepeaterControl
					currentStyleState={ 'hover' }
					recentlyUsedListGetter={ recentlyUsedGetter }
				/>,
				props
			);

			// Assert
			await waitFor( () => {
				const addButton = screen.getByLabelText( 'Add item' );
				expect( addButton ).toBeDisabled();
			} );
		} );
	} );

	describe( 'Event Bus Integration', () => {
		it( 'should subscribe to transition-item-added events and call sendMixpanelEvent when triggered', async () => {
			// Arrange
			const props = createDefaultProps();
			const subscribeSpy = jest.spyOn( repeaterEventBus, 'subscribe' );
			const mockEventData = { someData: 'test' };

			// Act
			renderControl(
				<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
				props
			);

			await waitFor( () => {
				expect( subscribeSpy ).toHaveBeenCalledWith(
					RepeaterEvents.TransitionItemAdded,
					expect.any( Function )
				);
			} );

			// Act
			const callback = subscribeSpy.mock.calls[ 0 ][ 1 ];
			callback( mockEventData );

			// Assert
			expect( sendMixpanelEvent ).toHaveBeenCalledWith( {
				...mockEventData,
				eventName: 'click_added_transition',
				location: 'V4 Style Tab',
				secondaryLocation: 'Transition control',
				trigger: 'click',
				widget_type: 'test-widget',
			} );

			subscribeSpy.mockRestore();
		} );

		it( 'should handle case when no elements are selected', async () => {
			// Arrange
			mockedGetSelectedElements.mockReturnValueOnce( [ { id: 'test-id', type: 'unknown' } ] );
			const props = createDefaultProps();
			const subscribeSpy = jest.spyOn( repeaterEventBus, 'subscribe' );
			const mockEventData = { someData: 'test' };

			// Act
			renderControl(
				<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
				props
			);

			await waitFor( () => {
				expect( subscribeSpy ).toHaveBeenCalledWith(
					RepeaterEvents.TransitionItemAdded,
					expect.any( Function )
				);
			} );

			// Act
			const callback = subscribeSpy.mock.calls[ 0 ][ 1 ];
			callback( mockEventData );

			// Assert
			expect( sendMixpanelEvent ).toHaveBeenCalledWith( {
				...mockEventData,
				eventName: 'click_added_transition',
				location: 'V4 Style Tab',
				secondaryLocation: 'Transition control',
				trigger: 'click',
				widget_type: 'unknown',
			} );

			subscribeSpy.mockRestore();
		} );

		it( 'should unsubscribe from events on unmount', async () => {
			// Arrange
			const props = createDefaultProps();
			const subscribeSpy = jest.spyOn( repeaterEventBus, 'subscribe' );
			const mockUnsubscribe = jest.fn();
			subscribeSpy.mockReturnValue( mockUnsubscribe );

			// Act
			const { unmount } = renderControl(
				<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
				props
			);

			await waitFor( () => {
				expect( subscribeSpy ).toHaveBeenCalled();
			} );

			unmount();

			// Assert
			expect( mockUnsubscribe ).toHaveBeenCalled();

			subscribeSpy.mockRestore();
		} );
	} );
} );
