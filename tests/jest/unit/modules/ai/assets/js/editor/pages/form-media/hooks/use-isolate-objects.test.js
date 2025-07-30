jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-prompt', () => {
	return jest.fn();
} );

jest.mock( 'elementor/modules/ai/assets/js/editor/api', () => ( {
	getImageToImageIsolateObjects: jest.fn(),
} ) );

const useIsolateObject = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/views/isolate-objects/hooks/use-isolate-objects' ).default;
const useImagePrompt = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-prompt' );
const { getImageToImageIsolateObjects } = require( 'elementor/modules/ai/assets/js/editor/api' );

describe( 'useIsolateObject', () => {
	const mockSendFn = jest.fn();
	const sampleImage = { url: 'test-image.jpg', alt: 'Test image' };
	const sampleSettings = { aspectRatio: '1:1', backgroundColor: '#ffffff' };

	beforeEach( () => {
		// Arrange
		jest.clearAllMocks();

		useImagePrompt.mockImplementation( () => {
			return {
				send: mockSendFn,
				data: null,
				isLoading: false,
				error: null,
			};
		} );

		getImageToImageIsolateObjects.mockImplementation( ( ) => {
			return Promise.resolve( { result: [ { url: 'processed-image.jpg' } ] } );
		} );
	} );

	it( 'should pass the image and background color settings when isolating objects', async () => {
		// Arrange
		const { send } = useIsolateObject();
		const payload = {
			image: sampleImage,
			settings: sampleSettings,
		};

		// Act
		await send( payload );

		// Assert
		expect( mockSendFn ).toHaveBeenCalledWith( payload );
	} );

	it( 'should maintain previous results when provided as initial value', () => {
		// Arrange
		const previousResults = {
			result: [ { url: 'previous-result.jpg' } ],
		};

		useImagePrompt.mockImplementation( ( fetchAction, initialValue ) => {
			return {
				send: mockSendFn,
				data: initialValue,
				isLoading: false,
				error: null,
			};
		} );

		// Act
		const { data } = useIsolateObject( previousResults );

		// Assert
		expect( data ).toEqual( previousResults );
	} );
} );
