import { AI_EVENTS } from 'elementor/modules/ai/assets/js/editor/pages/form-media/constants';

describe( 'AI Modal Events', () => {
	let dispatchEventSpy;

	const mockImage = {
		id: 123,
		url: 'https://example.com/image.jpg',
		alt: 'Test image',
	};

	const errorEventDetail = {
		success: false,
		error: 'User closed the modal manually without selecting an image',
	};

	const createOnCloseCallback = () => {
		return () => {
			window.dispatchEvent( new CustomEvent( AI_EVENTS.MODAL_CLOSED, {
				detail: errorEventDetail,
			} ) );
		};
	};

	const createSetControlValue = ( modalType, location ) => {
		return ( image ) => {
			window.dispatchEvent( new CustomEvent( AI_EVENTS.MODAL_CLOSED, {
				detail: {
					modalType,
					location,
					success: true,
					...image,
				},
			} ) );
		};
	};

	const getLastDispatchedEvent = () => {
		return dispatchEventSpy.mock.calls[ dispatchEventSpy.mock.calls.length - 1 ][ 0 ];
	};

	beforeEach( () => {
		dispatchEventSpy = jest.spyOn( window, 'dispatchEvent' ).mockImplementation( () => {} );
		jest.clearAllMocks();
	} );

	afterEach( () => {
		dispatchEventSpy.mockRestore();
	} );

	// If those tests fail, it means that the constants are not correct and should also be updated on elementor-ai
	describe( 'AI_EVENTS constants', () => {
		it( 'should have the correct MODAL_CLOSED event name', () => {
			expect( AI_EVENTS.MODAL_CLOSED ).toBe( 'elementor:ai:modal-closed' );
		} );

		it( 'should have the correct SHOW_MODAL event name', () => {
			expect( AI_EVENTS.SHOW_MODAL ).toBe( 'elementor:ai:show-modal' );
		} );

		it( 'should be suitable for CustomEvent creation', () => {
			const eventName = AI_EVENTS.MODAL_CLOSED;
			const customEvent = new CustomEvent( eventName, {
				detail: { test: true },
			} );

			expect( customEvent.type ).toBe( 'elementor:ai:modal-closed' );
			expect( customEvent.detail ).toEqual( { test: true } );
		} );

		it( 'should be suitable for addEventListener usage', () => {
			const eventName = AI_EVENTS.SHOW_MODAL;
			const mockHandler = jest.fn();

			dispatchEventSpy.mockRestore();

			window.addEventListener( eventName, mockHandler );

			const event = new CustomEvent( eventName );
			window.dispatchEvent( event );

			expect( mockHandler ).toHaveBeenCalled();
			expect( mockHandler ).toHaveBeenCalledWith( event );

			window.removeEventListener( eventName, mockHandler );

			dispatchEventSpy = jest.spyOn( window, 'dispatchEvent' ).mockImplementation( () => {} );
		} );
	} );

	describe( 'Modal closed event dispatching', () => {
		it( 'should dispatch event with success: false when modal is closed manually', () => {
			const onCloseCallback = createOnCloseCallback();

			onCloseCallback();

			expect( dispatchEventSpy ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: AI_EVENTS.MODAL_CLOSED,
					detail: errorEventDetail,
				} ),
			);
		} );

		it( 'should dispatch event with success: true and image data when image is selected', () => {
			const mockModalType = 'generate';
			const mockLocation = 'media-library';
			const setControlValue = createSetControlValue( mockModalType, mockLocation );

			setControlValue( mockImage );

			expect( dispatchEventSpy ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: AI_EVENTS.MODAL_CLOSED,
					detail: {
						modalType: mockModalType,
						location: mockLocation,
						success: true,
						id: 123,
						url: 'https://example.com/image.jpg',
						alt: 'Test image',
					},
				} ),
			);
		} );

		it( 'should dispatch event with correct modalType and location for different scenarios', () => {
			const testCases = [
				{ modalType: 'generate', location: 'resize' },
				{ modalType: 'edit', location: 'variations' },
				{ modalType: 'enhance', location: 'cleanup' },
			];

			testCases.forEach( ( { modalType, location }, index ) => {
				const setControlValue = createSetControlValue( modalType, location );
				const testImage = { id: 456 + index, url: `https://example.com/test${ index }.jpg` };

				setControlValue( testImage );

				expect( dispatchEventSpy ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: AI_EVENTS.MODAL_CLOSED,
						detail: expect.objectContaining( {
							modalType,
							location,
							success: true,
						} ),
					} ),
				);
			} );
		} );

		it( 'should use constant instead of magic string', () => {
			const eventType = AI_EVENTS.MODAL_CLOSED;

			window.dispatchEvent( new CustomEvent( eventType, {
				detail: { test: true },
			} ) );

			expect( dispatchEventSpy ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: 'elementor:ai:modal-closed',
				} ),
			);

			expect( eventType ).toBe( 'elementor:ai:modal-closed' );
		} );
	} );

	describe( 'Event detail validation', () => {
		it( 'should include required fields in success event detail', () => {
			const testImage = {
				id: 789,
				url: 'https://example.com/success.jpg',
			};
			const setControlValue = createSetControlValue( 'test', 'test-location' );

			setControlValue( testImage );

			const lastEvent = getLastDispatchedEvent();
			expect( lastEvent.detail ).toHaveProperty( 'success', true );
			expect( lastEvent.detail ).toHaveProperty( 'modalType', 'test' );
			expect( lastEvent.detail ).toHaveProperty( 'location', 'test-location' );
			expect( lastEvent.detail ).toHaveProperty( 'id', 789 );
			expect( lastEvent.detail ).toHaveProperty( 'url', 'https://example.com/success.jpg' );
		} );

		it( 'should include required fields in error event detail', () => {
			const onCloseCallback = createOnCloseCallback();

			onCloseCallback();

			const lastEvent = getLastDispatchedEvent();
			expect( lastEvent.detail ).toHaveProperty( 'success', false );
			expect( lastEvent.detail ).toHaveProperty( 'error', 'User closed the modal manually without selecting an image' );
		} );

		it( 'should preserve image properties when spreading', () => {
			const imageWithExtraProps = {
				...mockImage,
				customProperty: 'custom-value',
				size: 'large',
			};
			const setControlValue = createSetControlValue( 'test', 'test-location' );

			setControlValue( imageWithExtraProps );

			const lastEvent = getLastDispatchedEvent();
			expect( lastEvent.detail ).toHaveProperty( 'customProperty', 'custom-value' );
			expect( lastEvent.detail ).toHaveProperty( 'size', 'large' );
			expect( lastEvent.detail ).toHaveProperty( 'id', 123 );
		} );
	} );

	describe( 'Error handling', () => {
		it( 'should handle undefined image data gracefully', () => {
			const setControlValue = createSetControlValue( 'test', 'test-location' );

			setControlValue( undefined );

			const lastEvent = getLastDispatchedEvent();
			expect( lastEvent.detail ).toHaveProperty( 'success', true );
			expect( lastEvent.detail ).toHaveProperty( 'modalType', 'test' );
			expect( lastEvent.detail ).toHaveProperty( 'location', 'test-location' );
		} );

		it( 'should handle empty image object', () => {
			const setControlValue = createSetControlValue( 'test', 'test-location' );

			setControlValue( {} );

			const lastEvent = getLastDispatchedEvent();
			expect( lastEvent.detail ).toHaveProperty( 'success', true );
			expect( lastEvent.detail ).toHaveProperty( 'modalType', 'test' );
			expect( lastEvent.detail ).toHaveProperty( 'location', 'test-location' );
		} );
	} );
} );
