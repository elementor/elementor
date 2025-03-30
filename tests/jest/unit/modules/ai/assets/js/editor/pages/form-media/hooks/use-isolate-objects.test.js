// Mock the dependencies first
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-prompt', () => {
	return jest.fn();
} );

jest.mock( 'elementor/modules/ai/assets/js/editor/api', () => ( {
	getImageToImageIsolateObjects: jest.fn(),
} ) );

// Import the modules after mocking
const useIsolateObject = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/views/isolate-objects/hooks/use-isolate-objects' ).default;
const useImagePrompt = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-prompt' );
const { getImageToImageIsolateObjects } = require( 'elementor/modules/ai/assets/js/editor/api' );

describe( 'useIsolateObject', () => {
	const mockSendFn = jest.fn();
	const sampleImage = { url: 'test-image.jpg', alt: 'Test image' };
	const sampleSettings = { aspectRatio: '1:1', backgroundColor: '#ffffff' };

	beforeEach( () => {
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

	it( 'should provide a send function to isolate objects in an image', () => {
		const { send } = useIsolateObject();

		expect( typeof send ).toBe( 'function' );
	} );

	it( 'should pass the image and background color settings when isolating objects', async () => {
		const { send } = useIsolateObject();
		const payload = {
			image: sampleImage,
			settings: sampleSettings,
		};

		await send( payload );

		expect( mockSendFn ).toHaveBeenCalledWith( payload );
	} );

	it( 'should maintain previous results when provided as initial value', () => {
		// Arrange
		const previousResults = {
			result: [ { url: 'previous-result.jpg' } ],
		};

		// Override the mock to return different data based on initialValue
		useImagePrompt.mockImplementation( ( fetchAction, initialValue ) => {
			return {
				send: mockSendFn,
				data: initialValue,
				isLoading: false,
				error: null,
			};
		} );

		// Act - Call the hook with initial value
		const { data } = useIsolateObject( previousResults );

		// Assert - Verify the data reflects the initial value
		expect( data ).toEqual( previousResults );
	} );
} );
