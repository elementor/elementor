import { getOnboardingExitUrl, buildSiteBuilderParamsFromChoices } from '../get-onboarding-exit-url';

describe( 'getOnboardingExitUrl', () => {
	const legacyUrls = {
		dashboard: 'https://example.com/wp-admin/',
		editor: 'https://example.com/wp-admin/edit.php?post_type=elementor_library',
		connect: 'https://example.com/connect',
		signUp: 'https://example.com/connect?signup',
		upgradeUrl: 'https://example.com/upgrade',
		createNewPage: 'https://example.com/wp-admin/edit.php?action=elementor_new_post',
	};

	it( 'should return site builder url when experiment is active', () => {
		const url = getOnboardingExitUrl( {
			shouldRedirectToSitePlanner: true,
			siteBuilderUrl: 'https://example.com/wp-admin/admin.php?page=elementor-app#site-builder',
			urls: legacyUrls,
		} );

		expect( url ).toBe( 'https://example.com/wp-admin/admin.php?page=elementor-app#site-builder' );
	} );

	it( 'should return legacy url when experiment is active but site builder url is empty', () => {
		const url = getOnboardingExitUrl( {
			shouldRedirectToSitePlanner: true,
			siteBuilderUrl: '',
			urls: legacyUrls,
		} );

		expect( url ).toBe( legacyUrls.createNewPage );
	} );

	it( 'should return legacy create new page url when experiment is inactive', () => {
		const url = getOnboardingExitUrl( {
			shouldRedirectToSitePlanner: false,
			siteBuilderUrl: 'https://example.com/wp-admin/admin.php?page=elementor-app#site-builder',
			urls: legacyUrls,
		} );

		expect( url ).toBe( legacyUrls.createNewPage );
	} );

	it( 'should fall back to editor and dashboard urls', () => {
		const url = getOnboardingExitUrl( {
			shouldRedirectToSitePlanner: false,
			urls: {
				...legacyUrls,
				createNewPage: undefined,
			},
		} );

		expect( url ).toBe( legacyUrls.editor );
	} );
} );

describe( 'buildSiteBuilderParamsFromChoices', () => {
	it( 'should map first site_about choice to siteType', () => {
		expect(
			buildSiteBuilderParamsFromChoices( {
				building_for: 'business',
				site_about: [ 'online_store', 'blog' ],
				experience_level: null,
				theme_selection: null,
				site_features: [],
			} )
		).toEqual( { siteType: 'online_store' } );
	} );

	it( 'should return empty object when site_about is empty', () => {
		expect(
			buildSiteBuilderParamsFromChoices( {
				building_for: null,
				site_about: [],
				experience_level: null,
				theme_selection: null,
				site_features: [],
			} )
		).toEqual( {} );
	} );
} );
