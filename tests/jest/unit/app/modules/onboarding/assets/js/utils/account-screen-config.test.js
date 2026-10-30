import {
	buildDisconnectedPageTexts,
	getAccountScreenIllustrationUrl,
	getLegacyAccountScreenConfig,
} from '../../../../../../../../../app/modules/onboarding/assets/js/utils/account-screen-config';

describe( 'account-screen-config', () => {
	const originalConfig = global.elementorAppConfig;

	afterEach( () => {
		global.elementorAppConfig = originalConfig;
	} );

	describe( 'getLegacyAccountScreenConfig', () => {
		it( 'returns null when accountScreen is omitted', () => {
			global.elementorAppConfig = { onboarding: {} };

			expect( getLegacyAccountScreenConfig() ).toBeNull();
		} );

		it( 'returns config when accountScreen is set', () => {
			const accountScreen = { headlineLine1: 'Hi' };
			global.elementorAppConfig = { onboarding: { accountScreen } };

			expect( getLegacyAccountScreenConfig() ).toBe( accountScreen );
		} );
	} );

	describe( 'getAccountScreenIllustrationUrl', () => {
		it( 'returns null when illustration is hidden', () => {
			expect( getAccountScreenIllustrationUrl( { showIllustration: false } ) ).toBeNull();
		} );

		it( 'returns CDN url when set', () => {
			expect(
				getAccountScreenIllustrationUrl( {
					showIllustration: true,
					illustrationUrl: 'https://assets.elementor.com/onboarding/v1/images/x.svg',
				} ),
			).toBe( 'https://assets.elementor.com/onboarding/v1/images/x.svg' );
		} );
	} );

	describe( 'buildDisconnectedPageTexts', () => {
		it( 'filters hidden benefits and description', () => {
			const result = buildDisconnectedPageTexts( {
				showDescription: false,
				description: 'Hidden',
				benefits: [ 'A', 'B', 'C' ],
				showBenefits: [ true, false, true ],
			} );

			expect( result.firstLine ).toBeUndefined();
			expect( result.listItems ).toEqual( [ 'A', 'C' ] );
		} );

		it( 'returns null when config is missing', () => {
			expect( buildDisconnectedPageTexts( null ) ).toBeNull();
		} );
	} );
} );
