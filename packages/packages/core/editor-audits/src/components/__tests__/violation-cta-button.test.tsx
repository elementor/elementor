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

		expect( window.open ).toHaveBeenCalledWith( EXTERNAL_URL, '_blank' );
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
} );
