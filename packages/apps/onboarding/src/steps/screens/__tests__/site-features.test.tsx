/* eslint-disable testing-library/no-test-id-queries */
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { DEFAULT_TEST_URLS, mockFetch, renderApp, setupOnboardingTests } from '../../../__tests__/test-utils';
import { t } from '../../../utils/translations';
import {
	COOKIE_CONSENT_FEATURE_ID,
	FEATURE_OPTIONS,
	HELLO_THEME_FEATURE_ID,
} from '../site-features';

const SITE_FEATURES_PROGRESS = {
	current_step_id: 'site_features',
	current_step_index: 4,
};

const STEP_TITLE = 'What do you want to include in your site?';
const STEP_SUBTITLE = "We'll use this to tailor suggestions for you.";
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
			// Arrange & Act
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			// Assert
			expect( screen.getByText( STEP_TITLE ) ).toBeInTheDocument();
			expect( screen.getByText( STEP_SUBTITLE ) ).toBeInTheDocument();
		} );

		it( 'renders all feature options including Hello and Cookie Consent', () => {
			// Arrange & Act
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			// Assert
			FEATURE_OPTIONS.forEach( ( option ) => {
				expect( screen.getByText( t( option.labelKey ) ) ).toBeInTheDocument();
			} );

			expect( screen.getByText( 'Hello theme' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Cookie Consent' ) ).toBeInTheDocument();
		} );

		it( 'does not render Design system or Interactions', () => {
			// Arrange & Act
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			// Assert
			expect( screen.queryByText( 'Design system' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Interactions' ) ).not.toBeInTheDocument();
		} );

		it( 'places Cookie Consent after Email delivery', () => {
			// Arrange & Act
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			// Assert
			const ids = FEATURE_OPTIONS.map( ( option ) => option.id );
			expect( ids.indexOf( COOKIE_CONSENT_FEATURE_ID ) ).toBeGreaterThan( ids.indexOf( 'email_deliverability' ) );
		} );

		it( 'hides Hello theme card when isElementorThemeActive is true', () => {
			// Arrange & Act
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				isElementorThemeActive: true,
			} );

			// Assert
			expect( screen.queryByText( 'Hello theme' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Default selection state', () => {
		it( 'selects Hello theme by default', () => {
			// Arrange & Act
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			// Assert
			const helloButton = screen.getByRole( 'button', { name: 'Hello theme' } );
			expect( helloButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );

		it( 'does not select Cookie Consent by default', () => {
			// Arrange & Act
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			// Assert
			const cookieButton = screen.getByRole( 'button', { name: 'Cookie Consent' } );
			expect( cookieButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );

		it( 'does not select any paid features by default', () => {
			// Arrange & Act
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			// Assert
			const paidOptions = FEATURE_OPTIONS.filter(
				( option ) => option.licenseType === 'pro' || option.licenseType === 'one'
			);
			paidOptions.forEach( ( option ) => {
				const button = screen.getByRole( 'button', { name: t( option.labelKey ) } );
				expect( button ).toHaveAttribute( 'aria-pressed', 'false' );
			} );
		} );
	} );

	describe( 'Selection behavior', () => {
		it( 'allows toggling Cookie Consent on', () => {
			// Arrange
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			// Act
			const cookieButton = screen.getByRole( 'button', { name: 'Cookie Consent' } );
			fireEvent.click( cookieButton );

			// Assert
			expect( cookieButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );

		it( 'allows toggling Hello theme off', () => {
			// Arrange
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			// Act
			const helloButton = screen.getByRole( 'button', { name: 'Hello theme' } );
			fireEvent.click( helloButton );

			// Assert
			expect( helloButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );

		it( 'submits selected paid feature on Continue', async () => {
			// Arrange
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			const firstProOption = getFirstProOption();

			// Act
			fireEvent.click( screen.getByRole( 'button', { name: t( firstProOption.labelKey ) } ) );
			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: FINISH_BUTTON_LABEL } ) ).toBeEnabled();
			} );
			fireEvent.click( screen.getByRole( 'button', { name: FINISH_BUTTON_LABEL } ) );

			// Assert
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
	} );

	describe( 'Install orchestration on Continue', () => {
		it( 'installs Hello theme when selected and Continue is clicked', async () => {
			// Arrange
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			// Act
			fireEvent.click( screen.getByRole( 'button', { name: FINISH_BUTTON_LABEL } ) );

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'install-theme' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'hello-elementor' ),
					} )
				);
			} );
		} );

		it( 'installs Cookie Consent plugin when selected and Continue is clicked', async () => {
			// Arrange
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ HELLO_THEME_FEATURE_ID, COOKIE_CONSENT_FEATURE_ID ] },
			} );

			// Act
			fireEvent.click( screen.getByRole( 'button', { name: FINISH_BUTTON_LABEL } ) );

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.stringContaining( 'install-plugin' ),
					expect.objectContaining( {
						method: 'POST',
						body: expect.stringContaining( 'cookiez' ),
					} )
				);
			} );
		} );

		it( 'does not call install endpoints when nothing installable is selected', async () => {
			// Arrange
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [] },
			} );

			// Act
			fireEvent.click( screen.getByRole( 'button', { name: FINISH_BUTTON_LABEL } ) );

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalled();
			} );

			expect( mockFetch ).not.toHaveBeenCalledWith( expect.stringContaining( 'install-theme' ), expect.anything() );
			expect( mockFetch ).not.toHaveBeenCalledWith(
				expect.stringContaining( 'install-plugin' ),
				expect.anything()
			);
		} );
	} );

	describe( 'ProPlanNotice visibility', () => {
		it( 'is hidden when only installable features are selected', () => {
			// Arrange & Act
			renderApp( { isConnected: true, progress: SITE_FEATURES_PROGRESS } );

			// Assert
			expect( screen.queryByText( PRO_PLAN_NOTICE_PATTERN ) ).not.toBeInTheDocument();
		} );

		it( 'is hidden when Cookie Consent is selected on top of Hello', () => {
			// Arrange & Act
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ HELLO_THEME_FEATURE_ID, COOKIE_CONSENT_FEATURE_ID ] },
			} );

			// Assert
			expect( screen.queryByText( PRO_PLAN_NOTICE_PATTERN ) ).not.toBeInTheDocument();
		} );

		it( 'shows Pro notice when a pro feature is selected', () => {
			// Arrange & Act
			const firstProOption = getFirstProOption();
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ firstProOption.id ] },
			} );

			// Assert
			expect( screen.getByText( /Elementor Pro/ ) ).toBeInTheDocument();
		} );

		it( 'shows One notice when a one-license feature is selected', () => {
			// Arrange & Act
			const firstOneOption = getFirstOneOption();
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ firstOneOption.id ] },
			} );

			// Assert
			expect( screen.getByText( /Elementor One/ ) ).toBeInTheDocument();
		} );
	} );

	describe( 'External links', () => {
		it( '"View plans" links to pricing URL in new tab', () => {
			// Arrange & Act
			const firstProOption = getFirstProOption();
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ firstProOption.id ] },
			} );

			// Assert
			const link = screen.getByRole( 'link', { name: /View plans/ } );
			expect( link ).toHaveAttribute( 'href', DEFAULT_TEST_URLS.comparePlans );
			expect( link ).toHaveAttribute( 'target', '_blank' );
		} );
	} );
} );
