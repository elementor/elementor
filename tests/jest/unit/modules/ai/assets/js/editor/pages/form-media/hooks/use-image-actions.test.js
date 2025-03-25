// Convert ES module imports to CommonJS require statements
const FilesUploadHandler = require( 'elementor-assets-js/editor/utils/files-upload-handler' ).default;
const useImageActions = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-actions' ).default;
const { useEditImage } = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/edit-image-context' );
const useImageUpload = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-upload' ).default;
const { useGlobalActions } = require( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/global-actions-context' );

// Mock dependencies
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/edit-image-context' );
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/hooks/use-image-upload' );
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/global-actions-context' );
jest.mock( 'elementor-assets-js/editor/utils/files-upload-handler' );

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
			editImage: {},
			setEditImage: jest.fn(),
		} ) );

		useImageUpload.mockImplementation( () => ( {
			attachmentData: {},
			isUploading: false,
			uploadError: null,
			upload: jest.fn(),
			resetUpload: jest.fn(),
		} ) );

		useGlobalActions.mockImplementation( () => ( {
			setControlValue: jest.fn(),
			saveAndClose: jest.fn(),
		} ) );

		FilesUploadHandler.getUnfilteredFilesNotEnabledDialog = jest.fn().mockReturnValue( {
			show: jest.fn(),
		} );
	} );

	afterEach( () => {
		delete global.window;
		delete global.elementorCommon;
	} );

	describe( 'ensureSVGUploading', () => {
		it( 'should allow null or undefined image URLs', () => {
			const { ensureSVGUploading } = useImageActions();
			expect( ensureSVGUploading( null ) ).toBe( true );
			expect( ensureSVGUploading( undefined ) ).toBe( true );
		} );

		it( 'should allow supported image extensions', () => {
			const { ensureSVGUploading } = useImageActions();
			expect( ensureSVGUploading( 'https://example.com/image.jpg' ) ).toBe( true );
			expect( ensureSVGUploading( 'https://example.com/image.jpeg' ) ).toBe( true );
			expect( ensureSVGUploading( 'https://example.com/image.png' ) ).toBe( true );
			expect( ensureSVGUploading( 'https://example.com/image.gif' ) ).toBe( true );

			expect( FilesUploadHandler.getUnfilteredFilesNotEnabledDialog ).not.toHaveBeenCalled();
		} );

		it( 'should block unsupported extensions when unfilteredFiles is false', () => {
			const { ensureSVGUploading } = useImageActions();
			expect( ensureSVGUploading( 'https://example.com/image.svg' ) ).toBe( false );

			expect( FilesUploadHandler.getUnfilteredFilesNotEnabledDialog ).toHaveBeenCalledWith( expect.any( Function ) );
			expect( FilesUploadHandler.getUnfilteredFilesNotEnabledDialog().show ).toHaveBeenCalled();
		} );

		it( 'should allow all extensions when unfilteredFiles is true', () => {
			global.elementorCommon.config.filesUpload.unfilteredFiles = true;
			const { ensureSVGUploading } = useImageActions();
			expect( ensureSVGUploading( 'https://example.com/image.svg' ) ).toBe( true );

			expect( FilesUploadHandler.getUnfilteredFilesNotEnabledDialog ).not.toHaveBeenCalled();
		} );

		it( 'should handle URLs with query parameters correctly', () => {
			const { ensureSVGUploading } = useImageActions();
			expect( ensureSVGUploading( 'https://example.com/image.png?width=300&height=200' ) ).toBe( true );
			expect( ensureSVGUploading( 'https://example.com/image.svg?width=300&height=200' ) ).toBe( false );

			expect( FilesUploadHandler.getUnfilteredFilesNotEnabledDialog ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
