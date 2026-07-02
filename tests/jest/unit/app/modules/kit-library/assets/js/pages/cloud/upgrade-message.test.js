import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UpgradeMessage from 'elementor/app/modules/kit-library/assets/js/pages/cloud/upgrade-message';

jest.mock( '@elementor/app-ui' );

jest.mock( 'elementor-app/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendKitsCloudUpgradeClicked: jest.fn(),
	},
} ) );

global.__ = jest.fn( ( text ) => text );

global.elementorCommon = {
	eventsManager: {
		config: {
			secondaryLocations: {
				kitLibrary: {
					cloudKitLibrary: 'cloud-kit-library-location',
				},
			},
		},
	},
};

import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

describe( 'UpgradeMessage Component', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Component Rendering', () => {
		it( 'should render the upgrade screen structure', () => {
			render( <UpgradeMessage hasSubscription={ false } isCloudKitsAvailable={ false } /> );

			expect( screen.getByRole( 'heading' ) ).toBeTruthy();
			const icon = document.querySelector( '.eicon-library-subscription-upgrade' );
			expect( icon ).toBeTruthy();
		} );

		it( 'should render button with target="_blank"', () => {
			render( <UpgradeMessage hasSubscription={ false } isCloudKitsAvailable={ false } /> );

			const button = screen.getByRole( 'link' );
			expect( button.getAttribute( 'target' ) ).toBe( '_blank' );
		} );
	} );

	describe( 'Content for users without subscription', () => {
		it( 'should show "level up" message when user has no subscription', () => {
			render( <UpgradeMessage hasSubscription={ false } isCloudKitsAvailable={ false } /> );

			expect( screen.getByText( "It's time to level up" ) ).toBeTruthy();
			expect( screen.getByText( 'Upgrade to Elementor Pro to import your own website template and save templates that you can reuse on any of your connected websites.' ) ).toBeTruthy();
			expect( screen.getByText( 'Upgrade now' ) ).toBeTruthy();
		} );

		it( 'should use GO_PRO URL when user has no subscription', () => {
			render( <UpgradeMessage hasSubscription={ false } isCloudKitsAvailable={ false } /> );

			const button = screen.getByRole( 'link' );
			expect( button.getAttribute( 'href' ) ).toBe( 'https://go.elementor.com/go-pro-cloud-website-templates-library/' );
		} );

		it( 'should show "level up" message when user has no subscription and cloud kits are available', () => {
			render( <UpgradeMessage hasSubscription={ false } isCloudKitsAvailable={ true } /> );

			expect( screen.getByText( "It's time to level up" ) ).toBeTruthy();
		} );
	} );

	describe( 'Content for users with subscription but no cloud kits access', () => {
		it( 'should show plan upgrade message when user has subscription but no cloud kits access', () => {
			render( <UpgradeMessage hasSubscription={ true } isCloudKitsAvailable={ false } /> );

			expect( screen.getByText( 'Access Website Templates with a plan upgrade' ) ).toBeTruthy();
			expect( screen.getByText( "Your current plan doesn't include saving and importing Website Templates. Upgrade to the Advanced plan or higher to use this feature." ) ).toBeTruthy();
			expect( screen.getByText( 'Compare plans' ) ).toBeTruthy();
		} );

		it( 'should use ADVANCED_PLAN URL when user has subscription but no cloud kits access', () => {
			render( <UpgradeMessage hasSubscription={ true } isCloudKitsAvailable={ false } /> );

			const button = screen.getByRole( 'link' );
			expect( button.getAttribute( 'href' ) ).toBe( 'https://go.elementor.com/go-pro-cloud-website-templates-library-advanced/' );
		} );
	} );

	describe( 'Button Click Tracking', () => {
		it( 'should call AppsEventTracking when button is clicked', () => {
			render( <UpgradeMessage hasSubscription={ false } isCloudKitsAvailable={ false } /> );

			const button = screen.getByRole( 'link' );
			fireEvent.click( button );

			expect( AppsEventTracking.sendKitsCloudUpgradeClicked ).toHaveBeenCalledWith( 'cloud-kit-library-location' );
			expect( AppsEventTracking.sendKitsCloudUpgradeClicked ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call AppsEventTracking for plan upgrade scenario', () => {
			render( <UpgradeMessage hasSubscription={ true } isCloudKitsAvailable={ false } /> );

			const button = screen.getByRole( 'link' );
			fireEvent.click( button );

			expect( AppsEventTracking.sendKitsCloudUpgradeClicked ).toHaveBeenCalledWith( 'cloud-kit-library-location' );
			expect( AppsEventTracking.sendKitsCloudUpgradeClicked ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should track multiple button clicks', () => {
			render( <UpgradeMessage hasSubscription={ false } isCloudKitsAvailable={ false } /> );

			const button = screen.getByRole( 'link' );
			fireEvent.click( button );
			fireEvent.click( button );
			fireEvent.click( button );

			expect( AppsEventTracking.sendKitsCloudUpgradeClicked ).toHaveBeenCalledTimes( 3 );
		} );
	} );

	describe( 'Prop Combinations', () => {
		const scenarios = [
			{
				hasSubscription: false,
				isCloudKitsAvailable: false,
				expectedHeading: "It's time to level up",
				expectedButton: 'Upgrade now',
				expectedUrl: 'https://go.elementor.com/go-pro-cloud-website-templates-library/',
			},
			{
				hasSubscription: false,
				isCloudKitsAvailable: true,
				expectedHeading: "It's time to level up",
				expectedButton: 'Upgrade now',
				expectedUrl: 'https://go.elementor.com/go-pro-cloud-website-templates-library/',
			},
			{
				hasSubscription: true,
				isCloudKitsAvailable: false,
				expectedHeading: 'Access Website Templates with a plan upgrade',
				expectedButton: 'Compare plans',
				expectedUrl: 'https://go.elementor.com/go-pro-cloud-website-templates-library-advanced/',
			},
			{
				hasSubscription: true,
				isCloudKitsAvailable: true,
				expectedHeading: "It's time to level up",
				expectedButton: 'Upgrade now',
				expectedUrl: 'https://go.elementor.com/go-pro-cloud-website-templates-library/',
			},
		];

		scenarios.forEach( ( { hasSubscription, isCloudKitsAvailable, expectedHeading, expectedButton, expectedUrl } ) => {
			it( `should render correct content for hasSubscription=${ hasSubscription } and isCloudKitsAvailable=${ isCloudKitsAvailable }`, () => {
				render( <UpgradeMessage hasSubscription={ hasSubscription } isCloudKitsAvailable={ isCloudKitsAvailable } /> );

				expect( screen.getByText( expectedHeading ) ).toBeTruthy();
				expect( screen.getByText( expectedButton ) ).toBeTruthy();

				const button = screen.getByRole( 'link' );
				expect( button.getAttribute( 'href' ) ).toBe( expectedUrl );
			} );
		} );
	} );
} );
