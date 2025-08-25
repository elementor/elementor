import { getSelectedElements } from '@elementor/editor-elements';
import { sendMixpanelEvent } from '@elementor/utils';

import { repeaterEventBus } from '../../../services/repeater-event-bus';
import { subscribeToTransitionEvent, unsubscribeFromTransitionItemAdded } from '../trainsition-events';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getSelectedElements: jest.fn(),
} ) );

jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	sendMixpanelEvent: jest.fn(),
} ) );

jest.mock( '../../../services/repeater-event-bus', () => ( {
	repeaterEventBus: {
		subscribe: jest.fn(),
		unsubscribe: jest.fn(),
	},
} ) );

describe( 'Transition Events', () => {
	// Arrange
	const mockGetSelectedElements = getSelectedElements as jest.MockedFunction<typeof getSelectedElements>;
	const mockSendMixpanelEvent = sendMixpanelEvent as jest.MockedFunction<typeof sendMixpanelEvent>;
	const mockRepeaterEventBus = repeaterEventBus as jest.Mocked<typeof repeaterEventBus>;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

		it( 'should subscribe to transition-item-added event', () => {
			// Act
			subscribeToTransitionEvent();

			// Assert
			expect( mockRepeaterEventBus.subscribe ).toHaveBeenCalledWith(
				'transition-item-added',
				expect.any( Function )
			);
		} );

		it( 'should send mixpanel event with transition type when event is triggered', () => {
			// Arrange
			const mockTransitionValue = 'fade';
			const mockWidgetType = 'heading';
			const mockData = {
				itemValue: {
					selection: {
						value: {
							value: {
								value: mockTransitionValue,
							},
						},
					},
				},
			};

			mockGetSelectedElements.mockReturnValue( [
				{
					id: 'test-element',
					type: mockWidgetType,
				},
			] );

			// Act
			subscribeToTransitionEvent();
			const subscribeCallback = mockRepeaterEventBus.subscribe.mock.calls[ 0 ][ 1 ];
			subscribeCallback( mockData );

			// Assert
			expect( mockSendMixpanelEvent ).toHaveBeenCalledWith( {
				transition_type: mockTransitionValue,
				eventName: 'click_added_transition',
				location: 'V4 Style Tab',
				secondaryLocation: 'Transition control',
				trigger: 'click',
				widget_type: mockWidgetType,
			} );
		} );

		it( 'should unsubscribe from transition-item-added event', () => {
			// Act
			unsubscribeFromTransitionItemAdded();

			// Assert
			expect( mockRepeaterEventBus.unsubscribe ).toHaveBeenCalledWith( 'transition-item-added' );
		} );
	} );
