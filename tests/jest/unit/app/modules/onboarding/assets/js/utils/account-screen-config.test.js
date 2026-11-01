import {
	buildDisconnectedPageTexts,
	getAccountScreenIllustrationUrl,
	getDefaultIllustrationUrl,
	getLegacyAccountScreenConfig,
	resolveAccountScreenImage,
	resolveDisconnectedAccountHeadlines,
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

		it( 'returns bundled default when illustration is shown without a CDN url', () => {
			expect(
				getAccountScreenIllustrationUrl( {
					showIllustration: true,
					illustrationUrl: '',
				} ),
			).toBe( getDefaultIllustrationUrl() );
		} );
	} );

	describe( 'resolveAccountScreenImage', () => {
		it( 'returns bundled default when accountScreen is null', () => {
			expect( resolveAccountScreenImage( null ) ).toBe( getDefaultIllustrationUrl() );
		} );
	} );

	describe( 'resolveDisconnectedAccountHeadlines', () => {
		it( 'uses CDN headlines when accountScreen is set', () => {
			expect(
				resolveDisconnectedAccountHeadlines( {
					headlineLine1: 'CDN one',
					headlineLine2: 'CDN two',
				} ),
			).toEqual( {
				title: 'CDN one',
				secondLineTitle: 'CDN two',
			} );
		} );

		it( 'uses experiment defaults when accountScreen is null', () => {
			global.elementorAppConfig = { onboarding: { experiment: true } };

			const headlines = resolveDisconnectedAccountHeadlines( null );

			expect( headlines.title ).toContain( 'here' );
			expect( headlines.secondLineTitle ).toContain( 'connected' );
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
