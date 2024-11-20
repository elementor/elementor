import { render } from '@testing-library/react';
import { useLocation } from 'elementor/modules/ai/assets/js/editor/pages/form-media/context/location-context';
import { useEditImage } from 'elementor/modules/ai/assets/js/editor/pages/form-media/context/edit-image-context';
jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/views/product-image-unification', () => ( {
	__esModule: true,
	default: () => <div>Product Image Unification View</div>,
} ) );

jest.mock( 'elementor/modules/ai/assets/js/editor/components/prompt-history/context/prompt-history-action-context', () => ( {
	useSubscribeOnPromptHistoryAction: jest.fn(),
	ACTION_TYPES: {
		RESTORE: 'RESTORE',
	},
} ) );

import MediaOutlet from 'elementor/modules/ai/assets/js/editor/pages/form-media/media-outlet';
import { LOCATIONS } from 'elementor/modules/ai/assets/js/editor/pages/form-media/constants';

jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/location-context', () => ( {
	useLocation: jest.fn(),
} ) );

jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/context/edit-image-context', () => ( {
	useEditImage: jest.fn(),
} ) );

jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/components/view', () => ( {
	__esModule: true,
	default: ( { children } ) => <div>{ children }</div>,
} ) );

jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/views/generate', () => ( {
	__esModule: true,
	default: () => <div>Generate View</div>,
} ) );

jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-media/views/image-tools', () => ( {
	__esModule: true,
	default: () => <div>Image Tools View</div>,
} ) );

describe( 'MediaOutlet', () => {
	const mockNavigate = jest.fn();

	beforeAll( () => {
		global.wp = {
			components: {
				ColorPicker: () => null,
				ColorIndicator: () => null,
			},
		};
	} );

	beforeEach( () => {
		jest.clearAllMocks();

		useLocation.mockImplementation( () => ( {
			current: LOCATIONS.GENERATE,
			navigate: mockNavigate,
		} ) );
	} );

	describe( 'Navigate to generetate or image tools logic', () => {
		it( 'should stay on Generate view when there is no URL', () => {
			useEditImage.mockImplementation( () => ( {
				editImage: { url: null },
			} ) );

			render( <MediaOutlet /> );

			expect( mockNavigate ).not.toHaveBeenCalled();
		} );

		it( 'should stay on Generate view when there is no source', () => {
			useEditImage.mockImplementation( () => ( {
				editImage: { url: 'https://example.com/', source: null },
			} ) );

			render( <MediaOutlet /> );

			expect( mockNavigate ).toHaveBeenCalledWith( LOCATIONS.GENERATE );
		} );

		it( 'should stay on Generate view when URL is a wireframe', () => {
			const wireframeUrl = 'https://gene-12345.live.strattic.io/image.jpg';
			useEditImage.mockImplementation( () => ( {
				editImage: { url: wireframeUrl, id: '11' },
			} ) );

			render( <MediaOutlet /> );

			expect( mockNavigate ).toHaveBeenCalledWith( LOCATIONS.GENERATE );
		} );

		it( 'should navigate to Image Tools when URL is not a wireframe and source is url', () => {
			useEditImage.mockImplementation( () => ( {
				editImage: { url: 'https://example.com/image.jpg', source: 'url' },
			} ) );

			render( <MediaOutlet /> );

			expect( mockNavigate ).toHaveBeenCalledWith( LOCATIONS.IMAGE_TOOLS );
		} );

		it( 'should navigate to Image Tools when there is id, source, and url not wireframe', () => {
			useEditImage.mockImplementation( () => ( {
				editImage: { url: 'https://example.com/image.jpg', source: 'library', id: '11' },
			} ) );

			render( <MediaOutlet /> );

			expect( mockNavigate ).toHaveBeenCalledWith( LOCATIONS.IMAGE_TOOLS );
		} );
	} );
} );
