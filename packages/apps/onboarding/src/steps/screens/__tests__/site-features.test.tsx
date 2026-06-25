/* eslint-disable testing-library/no-test-id-queries */
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import { DEFAULT_TEST_URLS, mockFetch, renderApp, setupOnboardingTests } from '../../../__tests__/test-utils';
import { t } from '../../../utils/translations';
import { COOKIE_CONSENT_FEATURE_ID, FEATURE_OPTIONS, HELLO_THEME_FEATURE_ID } from '../site-features';

const SITE_FEATURES_PROGRESS = {
	current_step_id: 'site_features',
	current_step_index: 3,
};

const STEP_TITLE = 'What do you want to include in your site?';
const STEP_SUBTITLE = "We'll use this to tailor suggestions for you.";
const BUILT_IN_LABEL = 'Included';
const FINISH_BUTTON_LABEL = 'Continue with Free';
const USER_CHOICES_ENDPOINT = 'user-choices';
const PRO_PLAN_NOTICE_PATTERN = /Elementor (Pro|One)/;

const getFirstProOption = () => {
	const option = FEATURE_OPTIONS.find( ( featureOption ) => featureOption.licenseType === 'pro' );

	if ( ! option ) {
		throw new Error( 'No pro option in FEATURE_OPTIONS' );
	}
	return option;
};

const getFirstOneOption = () => {
	const option = FEATURE_OPTIONS.find( ( featureOption ) => featureOption.licenseType === 'one' );

	if ( ! option ) {
		throw new Error( 'No one option in FEATURE_OPTIONS' );
	}
	return option;
};

describe( 'SiteFeatures', () => {
	setupOnboardingTests();

	describe( 'Rendering', () => {
		it( 'renders step title and subtitle', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			expect( screen.getByText( STEP_TITLE ) ).toBeInTheDocument();
			expect( screen.getByText( STEP_SUBTITLE ) ).toBeInTheDocument();
		} );

		it( 'renders all feature options', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			FEATURE_OPTIONS.forEach( ( option ) => {
				expect( screen.getByText( t( option.labelKey ) ) ).toBeInTheDocument();
			} );
		} );

		it( 'renders Included chip on core features', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			const coreOptions = FEATURE_OPTIONS.filter( ( option ) => option.licenseType === 'core' );
			coreOptions.forEach( ( option ) => {
				const card = screen.getByTestId( `feature-card-${ option.id }` );
				expect( within( card ).getByText( BUILT_IN_LABEL ) ).toBeInTheDocument();
			} );
		} );

		it( 'does not render Interactions or WooCommerce', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			expect( screen.queryByText( 'Interactions' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'WooCommerce' ) ).not.toBeInTheDocument();
		} );

		it( 'places Cookie Consent after Email deliverability', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			const ids = FEATURE_OPTIONS.map( ( option ) => option.id );
			expect( ids.indexOf( COOKIE_CONSENT_FEATURE_ID ) ).toBeGreaterThan( ids.indexOf( 'email_deliverability' ) );
		} );

		it( 'hides Hello theme card when isElementorThemeActive is true', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				isElementorThemeActive: true,
			} );

			expect( screen.queryByText( 'Hello theme' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Default selection state', () => {
		it( 'selects Hello theme by default', async () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: 'Hello theme' } ) ).toHaveAttribute( 'aria-pressed', 'true' );
			} );
		} );

		it( 'does not select Cookie Consent by default', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			const cookieButton = screen.getByRole( 'button', { name: 'Cookie Consent' } );
			expect( cookieButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );

		it( 'pro features are not selected by default', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			const proOptions = FEATURE_OPTIONS.filter( ( option ) => option.licenseType === 'pro' );
			proOptions.forEach( ( option ) => {
				const button = screen.getByRole( 'button', { name: t( option.labelKey ) } );
				expect( button ).toHaveAttribute( 'aria-pressed', 'false' );
			} );
		} );
	} );

	describe( 'Selection behavior', () => {
		it( 'clicking Finish after selecting pro feature calls API with correct value', async () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			const firstProOption = getFirstProOption();
			fireEvent.click( screen.getByRole( 'button', { name: t( firstProOption.labelKey ) } ) );
			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: FINISH_BUTTON_LABEL } ) ).toBeEnabled();
			} );
			fireEvent.click( screen.getByRole( 'button', { name: FINISH_BUTTON_LABEL } ) );

			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( USER_CHOICES_ENDPOINT ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( firstProOption.id ),
					} )
				);
			} );
		} );

		it( 'core features are not clickable', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			const coreOptions = FEATURE_OPTIONS.filter( ( option ) => option.licenseType === 'core' );
			coreOptions.forEach( ( option ) => {
				mockFetch.mockClear();
				const card = screen.getByTestId( `feature-card-${ option.id }` );
				fireEvent.click( card );
				expect( mockFetch ).not.toHaveBeenCalledWith(
					expect.stringContaining( USER_CHOICES_ENDPOINT ),
					expect.anything()
				);
			} );
		} );

		it( 'allows toggling Hello theme off', async () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			const helloButton = await screen.findByRole( 'button', { name: 'Hello theme' } );
			fireEvent.click( helloButton );

			expect( helloButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );
	} );

	describe( 'Install orchestration on Continue', () => {
		it( 'installs Hello theme when selected and Continue is clicked', async () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			await screen.findByRole( 'button', { name: 'Hello theme' } );
			fireEvent.click( screen.getByRole( 'button', { name: FINISH_BUTTON_LABEL } ) );

			await waitFor( () => {
				expect(
					mockFetch.mock.calls.some(
						( [ url, options ] ) =>
							typeof url === 'string' &&
							url.includes( 'install-theme' ) &&
							typeof options?.body === 'string' &&
							options.body.includes( 'hello-elementor' )
					)
				).toBe( true );
			} );
		} );

		it( 'does not call install-theme when Hello is unselected', async () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			const helloButton = await screen.findByRole( 'button', { name: 'Hello theme' } );
			fireEvent.click( helloButton );
			fireEvent.click( screen.getByRole( 'button', { name: FINISH_BUTTON_LABEL } ) );

			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalled();
			} );

			expect( mockFetch ).not.toHaveBeenCalledWith( expect.stringContaining( 'install-theme' ), expect.anything() );
		} );
	} );

	describe( 'External links', () => {
		it( '"View plans" links to pricing URL in new tab', () => {
			const firstProOption = getFirstProOption();
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ firstProOption.id ] },
			} );

			const link = screen.getByRole( 'link', { name: /View plans/ } );
			expect( link ).toHaveAttribute( 'href', DEFAULT_TEST_URLS.comparePlans );
			expect( link ).toHaveAttribute( 'target', '_blank' );
		} );
	} );

	describe( 'Pre-selected state', () => {
		it( 'restores previously selected pro features from saved choices', () => {
			const proOptions = FEATURE_OPTIONS.filter( ( option ) => option.licenseType === 'pro' );
			const preSelectedCount = 2;
			const selectedIds = proOptions.slice( 0, preSelectedCount ).map( ( option ) => option.id );
			const unselectedOption = proOptions[ preSelectedCount ];
			if ( ! unselectedOption ) {
				throw new Error( 'Expected unselected option' );
			}

			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: selectedIds },
			} );

			selectedIds.forEach( ( id ) => {
				const option = FEATURE_OPTIONS.find( ( opt ) => opt.id === id );
				if ( ! option ) {
					throw new Error( 'Expected option for selected id' );
				}
				const button = screen.getByRole( 'button', { name: t( option.labelKey ) } );
				expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
			} );
			const unselectedButton = screen.getByRole( 'button', { name: t( unselectedOption.labelKey ) } );
			expect( unselectedButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );
	} );

	describe( 'ProPlanNotice visibility', () => {
		it( 'is hidden when no paid features are selected', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ HELLO_THEME_FEATURE_ID ] },
			} );

			expect( screen.queryByText( PRO_PLAN_NOTICE_PATTERN ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'ProPlanNotice plan name', () => {
		it( 'shows Pro notice when only pro features are selected', () => {
			const firstProOption = getFirstProOption();
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ firstProOption.id ] },
			} );

			expect( screen.getByText( /Elementor Pro/ ) ).toBeInTheDocument();
		} );

		it( 'shows One notice when a one-license feature is selected', () => {
			const firstOneOption = getFirstOneOption();
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ firstOneOption.id ] },
			} );

			expect( screen.getByText( /Elementor One/ ) ).toBeInTheDocument();
		} );

		it( 'shows One notice when Cookie Consent is selected', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ COOKIE_CONSENT_FEATURE_ID ] },
			} );

			expect( screen.getByText( /Elementor One/ ) ).toBeInTheDocument();
		} );

		it( 'shows One notice when both pro and one-license features are selected', () => {
			const firstProOption = getFirstProOption();
			const firstOneOption = getFirstOneOption();
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ firstProOption.id, firstOneOption.id ] },
			} );

			expect( screen.getByText( /Elementor One/ ) ).toBeInTheDocument();
		} );
	} );
} );
