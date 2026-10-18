import * as React from 'react';
import { __flushAllInjections } from '@elementor/locations';
import { ThemeProvider } from '@elementor/ui';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { trackUpgradePromotionClick, trackViewPromotion } from '../../../utils/tracking';
import {
	ICON_LIBRARY_UPLOAD_UPGRADE_URL,
	IconLibraryUploadAction,
	IconLibraryUploadActionSlot,
	IconLibraryUploadPromotion,
	injectIntoIconLibraryUploadAction,
} from '../icon-library-upload-action';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '../../../utils/tracking', () => ( {
	trackViewPromotion: jest.fn(),
	trackUpgradePromotionClick: jest.fn(),
} ) );

const renderSlot = () =>
	render(
		<ThemeProvider>
			<IconLibraryUploadActionSlot>
				<IconLibraryUploadAction />
			</IconLibraryUploadActionSlot>
		</ThemeProvider>
	);

const setPromotions = ( value?: unknown ) => {
	( window as { elementor?: unknown } ).elementor = { config: { v4Promotions: value } };
};

describe( 'IconLibraryUploadAction', () => {
	beforeEach( () => {
		setPromotions( {} );
	} );

	afterEach( () => {
		__flushAllInjections();
		delete ( window as { elementorPro?: unknown } ).elementorPro;
		delete ( window as { elementor?: unknown } ).elementor;
		jest.clearAllMocks();
	} );

	it( 'should render an upload button for users without Pro', () => {
		// Arrange & Act.
		renderSlot();

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Upload library' } ) ).toBeInTheDocument();
	} );

	it( 'should open the upgrade promotion when the upload button is clicked', () => {
		// Arrange.
		renderSlot();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Upload library' } ) );

		// Assert.
		expect( screen.getByText( 'Upload custom icons' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Add your own icon font library to use across your site.' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Upgrade now' } ) ).toHaveAttribute(
			'href',
			ICON_LIBRARY_UPLOAD_UPGRADE_URL
		);
		expect( ICON_LIBRARY_UPLOAD_UPGRADE_URL ).toBe( 'https://go.elementor.com/go-pro-svg-library-upload-upgrade/' );
	} );

	it( 'should track the promotion view when it opens and the click on the upgrade link', () => {
		// Arrange.
		renderSlot();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Upload library' } ) );
		fireEvent.click( screen.getByRole( 'link', { name: 'Upgrade now' } ) );

		// Assert.
		expect( trackViewPromotion ).toHaveBeenCalledTimes( 1 );
		expect( trackUpgradePromotionClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should close the promotion and keep the button when the close button is clicked', async () => {
		// Arrange.
		renderSlot();
		fireEvent.click( screen.getByRole( 'button', { name: 'Upload library' } ) );

		// Act.
		fireEvent.click( within( screen.getByRole( 'dialog' ) ).getByRole( 'button', { name: /close/i } ) );

		// Assert.
		await waitFor( () => expect( screen.queryByText( 'Upload custom icons' ) ).not.toBeInTheDocument() );
		expect( screen.getByRole( 'button', { name: 'Upload library' } ) ).toBeInTheDocument();
	} );

	it( 'should expose the open state on the trigger and return focus to it when the promotion closes', async () => {
		// Arrange.
		renderSlot();
		const trigger = screen.getByRole( 'button', { name: 'Upload library' } );

		// Act.
		fireEvent.click( trigger );

		// Assert.
		expect( trigger ).toHaveAttribute( 'aria-haspopup', 'dialog' );
		expect( trigger ).toHaveAttribute( 'aria-expanded', 'true' );

		// Act.
		fireEvent.click( within( screen.getByRole( 'dialog' ) ).getByRole( 'button', { name: /close/i } ) );

		// Assert.
		await waitFor( () => expect( trigger ).toHaveAttribute( 'aria-expanded', 'false' ) );
		expect( trigger ).toHaveFocus();
	} );

	it( 'should render the promotion with the given link for other entitlement states', () => {
		// Arrange.
		render(
			<ThemeProvider>
				<IconLibraryUploadPromotion ctaUrl="https://example.com/renew" />
			</ThemeProvider>
		);

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Upload library' } ) );

		// Assert.
		expect( screen.getByRole( 'link', { name: 'Upgrade now' } ) ).toHaveAttribute(
			'href',
			'https://example.com/renew'
		);
		expect( trackViewPromotion ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should render nothing for users who do not receive promotions', () => {
		// Arrange.
		setPromotions( undefined );

		// Act.
		renderSlot();

		// Assert.
		expect( screen.queryByRole( 'button', { name: 'Upload library' } ) ).not.toBeInTheDocument();
	} );

	it( 'should render nothing by default when Pro is active so Pro can provide the action', () => {
		// Arrange.
		( window as { elementorPro?: unknown } ).elementorPro = {};

		// Act.
		renderSlot();

		// Assert.
		expect( screen.queryByRole( 'button', { name: 'Upload library' } ) ).not.toBeInTheDocument();
	} );

	it( 'should render the injected component instead of the default when its condition passes', () => {
		// Arrange.
		( window as { elementorPro?: unknown } ).elementorPro = {};
		injectIntoIconLibraryUploadAction( {
			id: 'test-pro-upload-action',
			component: () => <button>Manage libraries</button>,
		} );

		// Act.
		renderSlot();

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Manage libraries' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Upload library' } ) ).not.toBeInTheDocument();
	} );

	it( 'should show an injected component that is registered after the slot mounted', () => {
		// Arrange.
		( window as { elementorPro?: unknown } ).elementorPro = {};
		renderSlot();

		// Act.
		act( () => {
			injectIntoIconLibraryUploadAction( {
				id: 'test-late-upload-action',
				component: () => <button>Manage libraries</button>,
			} );
		} );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Manage libraries' } ) ).toBeInTheDocument();
	} );
} );
