/* eslint-disable testing-library/no-test-id-queries */
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import { DEFAULT_TEST_URLS, mockFetch, renderApp, setupOnboardingTests } from '../../../__tests__/test-utils';
import { FEATURE_OPTIONS } from '../site-features';

const SITE_FEATURES_PROGRESS = {
	current_step_id: 'site_features',
	current_step_index: 4,
};

const STEP_TITLE = 'What do you want to include in your site?';
const STEP_SUBTITLE = "We'll use this to tailor suggestions for you.";
const BUILT_IN_LABEL = 'Included';
const EXPLORE_MORE_LABEL = 'Explore more';
const FINISH_BUTTON_LABEL = 'Continue with Free';
const USER_CHOICES_ENDPOINT = 'user-choices';
const PRO_PLAN_NOTICE_TEXT = 'Some features you selected are available in Pro plan.';
const COMPARE_PLANS_BUTTON_LABEL = 'Compare plans';
const TARGET_BLANK = '_blank';

const getFirstProOption = () => {
	const option = FEATURE_OPTIONS.find( ( featureOption ) => featureOption.isPro );

	if ( ! option ) {
		throw new Error( 'No pro option in FEATURE_OPTIONS' );
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
				expect( screen.getByText( option.label ) ).toBeInTheDocument();
			} );
			expect( screen.getByText( EXPLORE_MORE_LABEL ) ).toBeInTheDocument();
		} );

		it( 'renders Included chip on core features', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			const coreOptions = FEATURE_OPTIONS.filter( ( option ) => ! option.isPro );
			coreOptions.forEach( ( option ) => {
				const card = screen.getByTestId( `feature-card-${ option.id }` );
				expect( within( card ).getByText( BUILT_IN_LABEL ) ).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'Default selection state', () => {
		it( 'pro features are not selected by default', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			const proOptions = FEATURE_OPTIONS.filter( ( option ) => option.isPro );
			proOptions.forEach( ( option ) => {
				const button = screen.getByRole( 'button', { name: option.label } );
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
			fireEvent.click( screen.getByRole( 'button', { name: firstProOption.label } ) );
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

			const coreOptions = FEATURE_OPTIONS.filter( ( option ) => ! option.isPro );
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
	} );

	describe( 'ProPlanNotice visibility', () => {
		it( 'is hidden when no pro features are selected', () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			expect( screen.queryByText( PRO_PLAN_NOTICE_TEXT ) ).not.toBeInTheDocument();
		} );

		it( 'is shown when pro features are pre-selected', () => {
			const firstProOption = getFirstProOption();
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ firstProOption.id ] },
			} );

			expect( screen.getByText( PRO_PLAN_NOTICE_TEXT ) ).toBeInTheDocument();
		} );

		it( 'appears after clicking a pro feature', async () => {
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			const firstProOption = getFirstProOption();
			fireEvent.click( screen.getByRole( 'button', { name: firstProOption.label } ) );

			await waitFor( () => {
				expect( screen.getByText( PRO_PLAN_NOTICE_TEXT ) ).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'External links', () => {
		it( '"Explore more" opens features URL in new tab', () => {
			const openSpy = jest.spyOn( window, 'open' ).mockImplementation( () => null );
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
			} );

			fireEvent.click( screen.getByRole( 'button', { name: EXPLORE_MORE_LABEL } ) );

			expect( openSpy ).toHaveBeenCalledWith( DEFAULT_TEST_URLS.exploreFeatures, TARGET_BLANK );
			openSpy.mockRestore();
		} );

		it( '"Compare plans" opens pricing URL in new tab', () => {
			const firstProOption = getFirstProOption();
			const openSpy = jest.spyOn( window, 'open' ).mockImplementation( () => null );
			renderApp( {
				isConnected: true,
				progress: SITE_FEATURES_PROGRESS,
				choices: { site_features: [ firstProOption.id ] },
			} );

			fireEvent.click( screen.getByRole( 'button', { name: COMPARE_PLANS_BUTTON_LABEL } ) );

			expect( openSpy ).toHaveBeenCalledWith( DEFAULT_TEST_URLS.comparePlans, TARGET_BLANK );
			openSpy.mockRestore();
		} );
	} );

	describe( 'Pre-selected state', () => {
		it( 'restores previously selected pro features from saved choices', () => {
			const proOptions = FEATURE_OPTIONS.filter( ( option ) => option.isPro );
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
				const button = screen.getByRole( 'button', { name: option.label } );
				expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
			} );
			const unselectedButton = screen.getByRole( 'button', { name: unselectedOption.label } );
			expect( unselectedButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );
	} );
} );
