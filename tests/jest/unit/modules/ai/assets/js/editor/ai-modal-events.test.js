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
						id: mockImage.id,
						url: mockImage.url,
						alt: mockImage.alt,
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
	} );

	describe( 'Event detail validation', () => {
		it( 'should include required fields in success event detail', () => {
			const testImage = {
				id: 789,
				url: 'https://example.com/success.jpg',
			};
			const modalType = 'test';
			const location = 'test-location';
			const setControlValue = createSetControlValue( modalType, location );

			setControlValue( testImage );

			const lastEvent = getLastDispatchedEvent();
			expect( lastEvent.detail ).toHaveProperty( 'success', true );
			expect( lastEvent.detail ).toHaveProperty( 'modalType', modalType );
			expect( lastEvent.detail ).toHaveProperty( 'location', location );
			expect( lastEvent.detail ).toHaveProperty( 'id', testImage.id );
			expect( lastEvent.detail ).toHaveProperty( 'url', testImage.url );
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
			expect( lastEvent.detail ).toHaveProperty( 'id', mockImage.id );
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
