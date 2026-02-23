import * as React from 'react';
import { renderWithTheme, mockCurrentUserCapabilities } from 'test-utils';
import { screen, fireEvent } from '@testing-library/react';

import { ProInteractionDisabledContent } from '../components/pro-interaction-disabled-content';

jest.mock( '@elementor/editor-current-user' );

const createAnchorEl = (): HTMLElement => {
	const el = document.createElement( 'div' );
	document.body.appendChild( el );
	return el;
};

describe( 'ProInteractionDisabledContent', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Popover visibility', () => {
		it( 'should render the promotion popover when open is true', () => {
			mockCurrentUserCapabilities( true );

			const anchorEl = createAnchorEl();
			const setPromoPopover = jest.fn();

			renderWithTheme(
				<ProInteractionDisabledContent
					promoPopover={ { open: true, anchorEl } }
					setPromoPopover={ setPromoPopover }
				/>
			);

			expect( screen.getByRole( 'dialog', { name: /promotion-popover-title/i } ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'This interaction is currently inactive and not showing on your website. Activate your Pro plugin to use it again.'
				)
			).toBeInTheDocument();
		} );

		it( 'should not render the promotion popover content when open is false', () => {
			mockCurrentUserCapabilities( true );

			const setPromoPopover = jest.fn();

			renderWithTheme(
				<ProInteractionDisabledContent
					promoPopover={ { open: false, anchorEl: null } }
					setPromoPopover={ setPromoPopover }
				/>
			);

			expect( screen.queryByRole( 'dialog', { name: /promotion-popover-title/i } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Admin vs non-admin CTA', () => {
		it( 'should show "Upgrade now" CTA text when user is admin', () => {
			mockCurrentUserCapabilities( true );

			const anchorEl = createAnchorEl();
			( window as unknown as { elementorAppConfig: { admin_url: string } } ).elementorAppConfig = {
				admin_url: 'https://example.com/wp-admin/',
			};

			renderWithTheme(
				<ProInteractionDisabledContent
					promoPopover={ { open: true, anchorEl } }
					setPromoPopover={ jest.fn() }
				/>
			);

			expect( screen.getByText( 'Upgrade now' ) ).toBeInTheDocument();
		} );

		it( 'should NOT show "Upgrade now" CTA text when user is not admin', () => {
			mockCurrentUserCapabilities( false );

			const anchorEl = createAnchorEl();
			( window as unknown as { elementorAppConfig: { admin_url: string } } ).elementorAppConfig = {
				admin_url: 'https://example.com/wp-admin/',
			};

			renderWithTheme(
				<ProInteractionDisabledContent
					promoPopover={ { open: true, anchorEl } }
					setPromoPopover={ jest.fn() }
				/>
			);

			expect( screen.queryByText( 'Upgrade now' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'CTA URL resolution', () => {
		it( 'should link to plugins.php when admin_url is available', () => {
			mockCurrentUserCapabilities( true );

			const anchorEl = createAnchorEl();
			( window as unknown as { elementorAppConfig: { admin_url: string } } ).elementorAppConfig = {
				admin_url: 'https://example.com/wp-admin/',
			};

			renderWithTheme(
				<ProInteractionDisabledContent
					promoPopover={ { open: true, anchorEl } }
					setPromoPopover={ jest.fn() }
				/>
			);

			const link = screen.getByText( 'Upgrade now' ).closest( 'a' );
			expect( link ).toHaveAttribute( 'href', 'https://example.com/wp-admin/plugins.php' );
		} );

		it( 'should fall back to go.elementor.com when admin_url is not available', () => {
			mockCurrentUserCapabilities( true );

			const anchorEl = createAnchorEl();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			( window as any ).elementorAppConfig = undefined;

			renderWithTheme(
				<ProInteractionDisabledContent
					promoPopover={ { open: true, anchorEl } }
					setPromoPopover={ jest.fn() }
				/>
			);

			const link = screen.getByText( 'Upgrade now' ).closest( 'a' );
			expect( link ).toHaveAttribute( 'href', 'https://go.elementor.com/go-pro-interactions/' );
		} );
	} );

	describe( 'Close behavior', () => {
		it( 'should call setPromoPopover with closed state when popover is closed', () => {
			mockCurrentUserCapabilities( true );

			const anchorEl = createAnchorEl();
			const setPromoPopover = jest.fn();

			renderWithTheme(
				<ProInteractionDisabledContent
					promoPopover={ { open: true, anchorEl } }
					setPromoPopover={ setPromoPopover }
				/>
			);

			const closeButton = screen.getByRole( 'button', { name: /close/i } );
			fireEvent.click( closeButton );

			expect( setPromoPopover ).toHaveBeenCalledWith( { open: false, anchorEl: null } );
		} );
	} );

	describe( 'Static content', () => {
		it( 'should display "Interactions" as the popover title', () => {
			mockCurrentUserCapabilities( true );

			const anchorEl = createAnchorEl();

			renderWithTheme(
				<ProInteractionDisabledContent
					promoPopover={ { open: true, anchorEl } }
					setPromoPopover={ jest.fn() }
				/>
			);

			expect( screen.getByText( 'Interactions' ) ).toBeInTheDocument();
		} );
	} );
} );
