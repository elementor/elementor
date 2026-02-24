import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../parallelTest';
import WpAdminPage from '../../../../../pages/wp-admin-page';
import {
	ONBOARDING_URL,
	mockOnboardingApi,
	doAndWaitForProgress,
	navigateAndPassLogin,
} from './e-onboarding-utils';

test.describe( 'E-Onboarding @e-onboarding', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_onboarding: 'active' } );
		await page.close();
		await context.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
		await context.close();
	} );

	test( 'Full onboarding happy path', async ( { page } ) => {
		const { choicesRequests, progressRequests } = await mockOnboardingApi( page );

		await page.goto( ONBOARDING_URL );

		await test.step( 'Login screen', async () => {
			await expect( page.getByTestId( 'login-screen' ) ).toBeVisible();
			await expect( page.getByRole( 'heading', { name: "Let's get to work." } ) ).toBeVisible();

			await expect( page.getByRole( 'button', { name: 'Sign in to Elementor' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Continue another way' } ) ).toBeVisible();

			await expect( page.getByAltText( 'Google' ) ).toBeVisible();
			await expect( page.getByAltText( 'Facebook' ) ).toBeVisible();
			await expect( page.getByAltText( 'Apple' ) ).toBeVisible();

			await expect( page.getByRole( 'button', { name: 'Continue as a guest' } ) ).toBeVisible();

			await expect( page.getByRole( 'button', { name: 'Back' } ) ).not.toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Continue', exact: true } ) ).not.toBeVisible();

			await page.getByRole( 'button', { name: 'Continue as a guest' } ).click();
		} );

		await test.step( 'Building for step', async () => {
			await expect( page.getByTestId( 'building-for-step' ) ).toBeVisible();

			await expect( page.getByText( /Hey.*Let's get your site set up\./ ) ).toBeVisible();

			await expect( page.getByRole( 'heading', { name: 'Who are you building for?' } ) ).toBeVisible();

			await expect( page.getByRole( 'button', { name: 'Myself or someone I know' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'My business or workplace' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'A client' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Just exploring' } ) ).toBeVisible();

			await expect( page.getByRole( 'button', { name: 'Back' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Skip' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Continue' } ) ).toBeDisabled();

			await doAndWaitForProgress( page, () =>
				page.getByRole( 'button', { name: 'Just exploring' } ).click(),
			);

			expect( choicesRequests[ 0 ] ).toMatchObject( { building_for: 'exploring' } );
			expect( progressRequests[ 0 ] ).toMatchObject( {
				complete_step: 'building_for',
				step_index: 0,
				total_steps: 5,
			} );
		} );

		await test.step( 'Site about step', async () => {
			await expect( page.getByTestId( 'site-about-step' ) ).toBeVisible();

			await expect( page.getByText( "Got it! We'll keep things simple." ) ).toBeVisible();

			await expect( page.getByRole( 'heading', { name: 'What is your site about?' } ) ).toBeVisible();
			await expect( page.getByText( 'Choose anything that applies.' ) ).toBeVisible();

			await expect( page.getByRole( 'button', { name: 'Small business' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Online store' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Company site' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Blog' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Landing page' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Booking' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Portfolio' } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Other' } ) ).toBeVisible();

			const continueBtn = page.getByRole( 'button', { name: 'Continue' } );
			await expect( continueBtn ).toBeDisabled();

			const smallBusiness = page.getByRole( 'button', { name: 'Small business' } );
			await smallBusiness.click();
			await expect( smallBusiness ).toHaveAttribute( 'aria-pressed', 'true' );

			const onlineStore = page.getByRole( 'button', { name: 'Online store' } );
			await onlineStore.click();
			await expect( onlineStore ).toHaveAttribute( 'aria-pressed', 'true' );

			await expect( continueBtn ).not.toBeDisabled();

			await doAndWaitForProgress( page, () => continueBtn.click() );

			expect( choicesRequests[ 1 ] ).toMatchObject( {
				site_about: [ 'small_business', 'online_store' ],
			} );
			expect( progressRequests[ 1 ] ).toMatchObject( {
				complete_step: 'site_about',
				step_index: 1,
				total_steps: 5,
			} );
		} );

		await test.step( 'Experience level step', async () => {
			await expect( page.getByTestId( 'experience-level-step' ) ).toBeVisible();

			await expect(
				page.getByRole( 'heading', { name: 'How much experience do you have with Elementor?' } ),
			).toBeVisible();
			await expect( page.getByText( 'This helps us adjust the editor to your workflow.' ) ).toBeVisible();

			await expect( page.getByRole( 'button', { name: "I'm just getting started" } ) ).toBeVisible();
			await expect( page.getByRole( 'button', { name: 'I have some experience' } ) ).toBeVisible();
			await expect(
				page.getByRole( 'button', { name: "I'm very comfortable with Elementor" } ),
			).toBeVisible();

			await expect( page.getByRole( 'button', { name: 'Continue' } ) ).toBeDisabled();

			await doAndWaitForProgress( page, () =>
				page.getByRole( 'button', { name: 'I have some experience' } ).click(),
			);

			expect( choicesRequests[ 2 ] ).toMatchObject( { experience_level: 'intermediate' } );
			expect( progressRequests[ 2 ] ).toMatchObject( {
				complete_step: 'experience_level',
				step_index: 2,
				total_steps: 5,
			} );
		} );

		await test.step( 'Theme selection step', async () => {
			await expect( page.getByTestId( 'theme-selection-step' ) ).toBeVisible();

			await expect( page.getByText( "Great. Let's take it to the next step" ) ).toBeVisible();

			await expect(
				page.getByRole( 'heading', { name: 'Start with a theme that fits your needs' } ),
			).toBeVisible();
			await expect(
				page.getByText( 'Hello themes are built to work seamlessly with Elementor.' ),
			).toBeVisible();

			await expect( page.getByRole( 'radiogroup', { name: 'Theme selection' } ) ).toBeVisible();

			const helloRadio = page.getByRole( 'radio', { name: 'Hello', exact: true } );
			await expect( helloRadio ).toBeVisible();
			await expect( helloRadio ).toHaveAttribute( 'aria-checked', 'true' );

			await expect( page.getByText( 'Recommended' ) ).toBeVisible();

			await expect(
				page.getByText( 'A flexible canvas theme you can shape from the ground up' ),
			).toBeVisible();

			const helloBizRadio = page.getByRole( 'radio', { name: 'Hello Biz', exact: true } );
			await expect( helloBizRadio ).toBeVisible();
			await expect( helloBizRadio ).toHaveAttribute( 'aria-checked', 'false' );
			await expect(
				page.getByText( 'A ready-to-start theme with smart layouts and widgets' ),
			).toBeVisible();

			const continueWithThemeBtn = page.getByRole( 'button', { name: 'Continue with this theme' } );
			await expect( continueWithThemeBtn ).not.toBeDisabled();

			await expect( page.getByRole( 'button', { name: 'Skip' } ) ).toBeVisible();

			await doAndWaitForProgress( page, () => continueWithThemeBtn.click() );

			expect( choicesRequests[ 3 ] ).toMatchObject( { theme_selection: 'hello-elementor' } );
			expect( progressRequests[ 3 ] ).toMatchObject( {
				complete_step: 'theme_selection',
				step_index: 3,
				total_steps: 5,
			} );
		} );

		await test.step( 'Final screen', async () => {
			await expect( page.getByTestId( 'onboarding-steps' ) ).toBeVisible();

			const finishBtn = page.getByRole( 'button', { name: 'Finish' } );
			await expect( finishBtn ).toBeVisible();
			await expect( finishBtn ).toBeDisabled();

			await expect( page.getByRole( 'button', { name: 'Skip' } ) ).not.toBeVisible();
			await expect( page.getByRole( 'button', { name: 'Back' } ) ).toBeVisible();
		} );
	} );

	test( 'Back from site_about returns to building_for with selection preserved', async ( { page } ) => {
		await mockOnboardingApi( page );
		await navigateAndPassLogin( page );

		await doAndWaitForProgress( page, () =>
			page.getByRole( 'button', { name: 'Just exploring' } ).click(),
		);
		await expect( page.getByTestId( 'site-about-step' ) ).toBeVisible();

		await page.getByRole( 'button', { name: 'Small business' } ).click();
		await page.getByRole( 'button', { name: 'Online store' } ).click();
		await expect( page.getByRole( 'button', { name: 'Continue' } ) ).not.toBeDisabled();

		await page.getByRole( 'button', { name: 'Back' } ).click();
		await expect( page.getByTestId( 'building-for-step' ) ).toBeVisible();

		await expect(
			page.getByRole( 'button', { name: 'Just exploring' } ),
		).toHaveAttribute( 'aria-pressed', 'true' );

		const continueBtn = page.getByRole( 'button', { name: 'Continue' } );
		await expect( continueBtn ).not.toBeDisabled();

		await doAndWaitForProgress( page, () => continueBtn.click() );
		await expect( page.getByTestId( 'site-about-step' ) ).toBeVisible();

		await expect(
			page.getByRole( 'button', { name: 'Small business' } ),
		).toHaveAttribute( 'aria-pressed', 'true' );
		await expect(
			page.getByRole( 'button', { name: 'Online store' } ),
		).toHaveAttribute( 'aria-pressed', 'true' );

		await expect( page.getByRole( 'button', { name: 'Continue' } ) ).not.toBeDisabled();
	} );

	test( 'Back from theme_selection shows experience_level Continue enabled', async ( { page } ) => {
		await mockOnboardingApi( page );
		await navigateAndPassLogin( page );

		await doAndWaitForProgress( page, () =>
			page.getByRole( 'button', { name: 'Just exploring' } ).click(),
		);
		await expect( page.getByTestId( 'site-about-step' ) ).toBeVisible();

		await page.getByRole( 'button', { name: 'Small business' } ).click();
		const siteAboutContinue = page.getByRole( 'button', { name: 'Continue' } );
		await doAndWaitForProgress( page, () => siteAboutContinue.click() );
		await expect( page.getByTestId( 'experience-level-step' ) ).toBeVisible();

		await expect( page.getByRole( 'button', { name: 'Continue' } ) ).toBeDisabled();

		await doAndWaitForProgress( page, () =>
			page.getByRole( 'button', { name: 'I have some experience' } ).click(),
		);
		await expect( page.getByTestId( 'theme-selection-step' ) ).toBeVisible();

		await page.getByRole( 'button', { name: 'Back' } ).click();
		await expect( page.getByTestId( 'experience-level-step' ) ).toBeVisible();

		await expect(
			page.getByRole( 'button', { name: 'I have some experience' } ),
		).toHaveAttribute( 'aria-pressed', 'true' );

		await expect( page.getByRole( 'button', { name: 'Continue' } ) ).not.toBeDisabled();
	} );
} );
