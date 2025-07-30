jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-size', () => () => ( { width: 300, height: 200 } ) );
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/views/isolate-objects/hooks/use-isolate-objects' );
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/location-context' );
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/edit-image-context' );
jest.mock( 'elementor/modules/ai/assets/js/editor/context/requests-ids' );
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/global-actions-context' );
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-actions', () => () => ( {
	use: jest.fn(),
	edit: jest.fn(),
	isLoading: false,
} ) );

jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-prompt-settings', () => {
	return {
		__esModule: true,
		default: jest.fn(),
		IMAGE_RATIO: 'image-ratio',
		IMAGE_BACKGROUND_COLOR: 'image-background-color',
	};
} );

jest.mock( 'react', () => {
	const originalReact = jest.requireActual( 'react' );
	let callCount = 0;
	return {
		...originalReact,
		useMemo: () => {
			callCount += 1;
			if ( 1 === callCount ) {
				return '1:1';
			}
			return '#ffffff';
		},
	};
} );

const { Box } = require( '@elementor/ui' );
const ImagesDisplay = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/components/images-display' ).default;

global.elementorCommon = {
	config: {
		wp_color_picker: {
			palettes: [ '#000000', '#FFFFFF' ],
		},
	},
};

const useIsolateObject = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/views/isolate-objects/hooks/use-isolate-objects' ).default;
const { useEditImage } = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/edit-image-context' );
const { useRequestIds } = require( 'elementor/modules/ai/assets/js/editor/context/requests-ids' );
const { useLocation } = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/location-context' );
const usePromptSettings = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-prompt-settings' ).default;
const { IMAGE_RATIO, IMAGE_BACKGROUND_COLOR } = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-prompt-settings' );
const IsolateObject = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/views/isolate-objects/index' ).default;
const { FEATURE_IDENTIFIER } = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/constants' );

describe( 'IsolateObject Component - Functional Tests', () => {
	const mockSubmitFn = jest.fn();
	const mockSetGenerate = jest.fn();
	const mockUpdateSettings = jest.fn();
	const mockPreventDefault = jest.fn();
	const mockNavigate = jest.fn();

	const testImage = {
		url: 'test-image-url.jpg',
		alt: 'test image',
		aspectRatio: '1:1',
	};

	const testSettings = {
		[ IMAGE_RATIO ]: '1:1',
		[ IMAGE_BACKGROUND_COLOR ]: '#ffffff',
	};

	beforeEach( () => {
		// Arrange
		jest.clearAllMocks();
		jest.resetModules();

		global.elementorCommon = {
			config: {
				wp_color_picker: {
					palettes: [ '#000000', '#FFFFFF' ],
				},
			},
		};

		useIsolateObject.mockImplementation( () => ( {
			send: mockSubmitFn,
			data: null,
			isLoading: false,
			error: null,
		} ) );

		useEditImage.mockImplementation( () => ( {
			editImage: testImage,
		} ) );

		useRequestIds.mockImplementation( () => ( {
			setGenerate: mockSetGenerate,
		} ) );

		usePromptSettings.mockImplementation( () => ( {
			settings: testSettings,
			updateSettings: mockUpdateSettings,
		} ) );

		useLocation.mockImplementation( () => ( {
			current: 'GENERATE',
			navigate: mockNavigate,
		} ) );
	} );

	afterEach( () => {
		delete global.elementorCommon;
	} );

	it( 'should handle form submission correctly', () => {
		// Arrange
		const isolateObject = IsolateObject();
		const mockEvent = { preventDefault: mockPreventDefault };

		// Act
		isolateObject.props.children[ 0 ].props.children[ 3 ].props.onSubmit( mockEvent );

		// Assert
		expect( mockPreventDefault ).toHaveBeenCalled();
		expect( mockSetGenerate ).toHaveBeenCalled();
		expect( mockSubmitFn ).toHaveBeenCalledWith( {
			image: testImage,
			settings: {
				[ IMAGE_RATIO ]: '1:1',
				[ IMAGE_BACKGROUND_COLOR ]: '#ffffff',
			},
			featureIdentifier: FEATURE_IDENTIFIER.ISOLATE_OBJECT,
		} );
	} );

	it( 'should display results when data is successfully loaded', () => {
		// Arrange
		const successfulResponse = {
			result: [ { url: 'generated-image.jpg', id: 'gen1' } ],
		};

		useIsolateObject.mockImplementation( () => ( {
			send: mockSubmitFn,
			data: successfulResponse,
			isLoading: false,
			error: null,
		} ) );

		// Act
		const component = IsolateObject();
		const viewContent = component.props.children[ 1 ];
		const renderedContent = viewContent.props.children;

		// Assert
		expect( renderedContent.type ).toBe( Box );
		const imagesDisplay = renderedContent.props.children;
		expect( imagesDisplay.type ).toBe( ImagesDisplay );
		expect( imagesDisplay.props.images ).toBe( successfulResponse.result );
		expect( imagesDisplay.props.transparentContainer ).toBe( true );
		expect( imagesDisplay.props.aspectRatio ).toBe( testImage.aspectRatio );
	} );
} );
