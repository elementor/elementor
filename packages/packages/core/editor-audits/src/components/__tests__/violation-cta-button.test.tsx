import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import ViolationCtaButton from '../violation-cta-button';

const CTA_LABEL = 'Create';
const EXTERNAL_URL = 'https://example.com/wp-admin/options-privacy.php';

describe( 'ViolationCtaButton', () => {
	const originalWindowOpen = window.open;

	beforeEach( () => {
		window.open = jest.fn();
	} );

	afterEach( () => {
		window.open = originalWindowOpen;
	} );

	it( 'renders a button with the given cta label', () => {
		renderWithTheme( <ViolationCtaButton ctaLabel={ CTA_LABEL } externalUrl={ EXTERNAL_URL } /> );

		expect( screen.getByRole( 'button', { name: CTA_LABEL } ) ).toBeInTheDocument();
	} );

	it( 'opens the external url in a new tab when clicked', () => {
		renderWithTheme( <ViolationCtaButton ctaLabel={ CTA_LABEL } externalUrl={ EXTERNAL_URL } /> );

		fireEvent.click( screen.getByRole( 'button', { name: CTA_LABEL } ) );

		expect( window.open ).toHaveBeenCalledWith( EXTERNAL_URL, '_blank', 'noopener' );
	} );

	it( 'stops event propagation on click', () => {
		renderWithTheme( <ViolationCtaButton ctaLabel={ CTA_LABEL } externalUrl={ EXTERNAL_URL } /> );

		const button = screen.getByRole( 'button', { name: CTA_LABEL } );
		const event = new MouseEvent( 'click', { bubbles: true, cancelable: true } );
		const stopPropagation = jest.spyOn( event, 'stopPropagation' );
		const preventDefault = jest.spyOn( event, 'preventDefault' );

		button.dispatchEvent( event );

		expect( stopPropagation ).toHaveBeenCalled();
		expect( preventDefault ).toHaveBeenCalled();
	} );

	it( 'defaults to the outlined variant', () => {
		renderWithTheme( <ViolationCtaButton ctaLabel={ CTA_LABEL } externalUrl={ EXTERNAL_URL } /> );

		expect( screen.getByRole( 'button', { name: CTA_LABEL } ) ).toHaveClass( 'MuiButton-outlined' );
	} );

	it( 'renders the text variant when requested', () => {
		renderWithTheme( <ViolationCtaButton ctaLabel={ CTA_LABEL } externalUrl={ EXTERNAL_URL } variant="text" /> );

		expect( screen.getByRole( 'button', { name: CTA_LABEL } ) ).toHaveClass( 'MuiButton-text' );
	} );

	it( 'does not render a start icon by default', () => {
		// Arrange & Act.
		renderWithTheme( <ViolationCtaButton ctaLabel={ CTA_LABEL } externalUrl={ EXTERNAL_URL } /> );

		// Assert.
		const button = screen.getByRole( 'button', { name: CTA_LABEL } );
		// eslint-disable-next-line testing-library/no-node-access -- the start icon is a decorative svg with no accessible role.
		expect( button.querySelector( 'svg' ) ).not.toBeInTheDocument();
	} );

	it( 'renders a start icon when withIcon is set', () => {
		// Arrange & Act.
		renderWithTheme( <ViolationCtaButton ctaLabel={ CTA_LABEL } externalUrl={ EXTERNAL_URL } withIcon /> );

		// Assert.
		// eslint-disable-next-line testing-library/no-node-access -- see above.
		expect( screen.getByRole( 'button', { name: CTA_LABEL } ).querySelector( 'svg' ) ).toBeInTheDocument();
	} );
} );
