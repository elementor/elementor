import { addAiPromotionForSiteLogo } from '../../../../../../../../modules/ai/assets/js/editor/utils/ai-promotion';

jest.mock( 'react-markdown', () => () => 'ReactMarkdown' );

// Mock React utils
jest.mock( 'elementor-utils/react', () => ( {
	render: jest.fn().mockReturnValue( { unmount: jest.fn() } ),
} ) );

describe( 'addAiPromotionForSiteLogo', () => {
	let addAiPromotionSpy;

	beforeEach( () => {
		document.body.innerHTML = '';
		jest.clearAllMocks();

		addAiPromotionSpy = jest.spyOn(
			{ addAiPromotionForSiteLogo },
			'addAiPromotionForSiteLogo',
		);

		// Set up mocks in a way that makes them available globally without using global.
		window.elementorCommon = {
			config: {
				isRTL: false,
			},
		};

		window.elementor = {
			getPreferences: jest.fn().mockReturnValue( 'light' ),
			helpers: {
				hasPro: jest.fn().mockReturnValue( false ),
			},
		};
	} );

	afterEach( () => {
		addAiPromotionSpy.mockRestore();
		// Clean up the mocks
		delete window.elementor;
		delete window.elementorCommon;
	} );

	it( 'should do nothing when .elementor-control-site_logo does not exist', () => {
		document.body.innerHTML = '<div class="other-element"></div>';

		// Run the function
		const result = addAiPromotionForSiteLogo();

		expect( result ).toBeUndefined();
	} );

	it( 'should do nothing when .elementor-control-site_logo exists but no .e-ai-button inside', () => {
		document.body.innerHTML = '<div class="elementor-control-site_logo"></div>';

		// Run the function
		const result = addAiPromotionForSiteLogo();

		expect( result ).toBeUndefined();
	} );

	it( 'should succeed when both .elementor-control-site_logo and .e-ai-button exist', () => {
		document.body.innerHTML = `
			<div class="elementor-control-site_logo">
				<button class="e-ai-button"></button>
			</div>
		`;

		const result = addAiPromotionForSiteLogo();

		expect( result ).toBe( true );
	} );
} );
