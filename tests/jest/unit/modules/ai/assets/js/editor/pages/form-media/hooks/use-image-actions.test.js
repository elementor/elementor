const useImageActions = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-actions' ).default;
const { useEditImage } = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/edit-image-context' );
const useImageUpload = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-upload' ).default;
const { useGlobalActions } = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/global-actions-context' );

jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/edit-image-context' );
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-upload' );
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/global-actions-context' );
jest.mock( 'elementor-editor/utils/files-upload-handler', () => {
	return {
		getUnfilteredFilesNotEnabledDialog: jest.fn().mockReturnValue( {
			getElements: jest.fn().mockReturnValue( {
				css: jest.fn(),
			} ),
			show: jest.fn(),
		} ),
	};
} );

describe( 'useImageActions', () => {
	beforeEach( () => {
		global.window = {
			_wpPluploadSettings: {
				defaults: {
					filters: {
						mime_types: [
							{ extensions: 'jpg,jpeg,png,gif' },
						],
					},
				},
			},
		};

		global.elementorCommon = {
			config: {
				filesUpload: {
					unfilteredFiles: false,
				},
			},
		};

		jest.clearAllMocks();

		useEditImage.mockImplementation( () => ( {
			setEditImage: jest.fn(),
		} ) );

		useImageUpload.mockImplementation( () => ( {
			upload: jest.fn().mockResolvedValue( { image: { url: 'test-url' } } ),
		} ) );

		useGlobalActions.mockImplementation( () => ( {} ) );
	} );

	afterEach( () => {
		delete global.window;
		delete global.elementorCommon;
	} );

	describe( 'edit', () => {
		it( 'should allow null or undefined image URLs', async () => {
			const { edit } = useImageActions();
			await expect( edit( { image_url: null } ) ).resolves.not.toThrow();
			await expect( edit( { image_url: undefined } ) ).resolves.not.toThrow();
		} );

		it( 'should allow supported image extensions', async () => {
			const { edit } = useImageActions();
			const supportedImages = [
				{ image_url: 'https://example.com/image.jpg' },
				{ image_url: 'https://example.com/image.jpeg' },
				{ image_url: 'https://example.com/image.png' },
				{ image_url: 'https://example.com/image.gif' },
			];

			for ( const image of supportedImages ) {
				await expect( edit( image ) ).resolves.not.toThrow();
			}

			expect( require( 'elementor-editor/utils/files-upload-handler' ).getUnfilteredFilesNotEnabledDialog ).not.toHaveBeenCalled();
		} );

		it( 'should block unsupported extensions when unfilteredFiles is false', async () => {
			const { edit } = useImageActions();
			await expect( edit( { image_url: 'https://example.com/image.svg' } ) )
				.rejects.toThrow( 'SVG Uploading is not allowed' );

			expect( require( 'elementor-editor/utils/files-upload-handler' ).getUnfilteredFilesNotEnabledDialog ).toHaveBeenCalledWith( expect.any( Function ) );
			expect( require( 'elementor-editor/utils/files-upload-handler' ).getUnfilteredFilesNotEnabledDialog().show ).toHaveBeenCalled();
		} );

		it( 'should allow all extensions when unfilteredFiles is true', async () => {
			global.elementorCommon.config.filesUpload.unfilteredFiles = true;
			const { edit } = useImageActions();
			await expect( edit( { image_url: 'https://example.com/image.svg' } ) )
				.resolves.not.toThrow();

			expect( require( 'elementor-editor/utils/files-upload-handler' ).getUnfilteredFilesNotEnabledDialog ).not.toHaveBeenCalled();
		} );

		it( 'should handle URLs with query parameters correctly', async () => {
			const { edit } = useImageActions();
			await expect( edit( { image_url: 'https://example.com/image.png?width=300&height=200' } ) )
				.resolves.not.toThrow();
			await expect( edit( { image_url: 'https://example.com/image.svg?width=300&height=200' } ) )
				.rejects.toThrow( 'SVG Uploading is not allowed' );

			expect( require( 'elementor-editor/utils/files-upload-handler' ).getUnfilteredFilesNotEnabledDialog ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
