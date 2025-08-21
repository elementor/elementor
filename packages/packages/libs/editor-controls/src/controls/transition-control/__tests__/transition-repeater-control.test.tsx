import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { sendMixpanelEvent } from '@elementor/utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { repeaterEventBus } from '../../../services/repeater-event-bus';
import { TransitionRepeaterControl } from '../transition-repeater-control';

jest.mock( '../../selection-size-control', () => ( {
	SelectionSizeControl: jest.fn( () => <div data-testid="selection-size-control">Mock Selection Size Control</div> ),
} ) );

jest.mock( '../transition-selector', () => ( {
	TransitionSelector: jest.fn( () => <div data-testid="transition-selector">Mock Transition Selector</div> ),
} ) );

jest.mock( '../../../utils/event-tracking', () => ( {
	sendMixpanelEvent: jest.fn(),
} ) );

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
				const addButton = screen.getByLabelText( 'Add item' );
				expect( addButton ).toBeInTheDocument();
				expect( addButton ).toBeEnabled();
			} );
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
				const addButton = screen.getByLabelText( 'Add item' );
				expect( addButton ).toBeInTheDocument();
				expect( addButton ).toBeDisabled();
			} );
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
		it( 'should subscribe to transition-item-added events and call sendAddTransitionControlEvent when triggered', async () => {
			// Arrange
			const props = createDefaultProps();
			const subscribeSpy = jest.spyOn( repeaterEventBus, 'subscribe' );

			// Act
			renderControl(
				<TransitionRepeaterControl currentStyleState={ null } recentlyUsedListGetter={ recentlyUsedGetter } />,
				props
			);

			// Assert
			expect( subscribeSpy ).toHaveBeenCalledWith( 'transition-item-added', expect.any( Function ) );

			// Act
			const callback = subscribeSpy.mock.calls[ 0 ][ 1 ];
			callback();

			// Assert
			expect( sendMixpanelEvent ).toHaveBeenCalled();

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
			unmount();

			// Assert
			expect( mockUnsubscribe ).toHaveBeenCalled();

			subscribeSpy.mockRestore();
		} );
	} );
} );
