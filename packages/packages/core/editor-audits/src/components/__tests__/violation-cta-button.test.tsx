import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { installAndActivatePlugin } from '../../utils/install-plugin';
import ViolationCtaButton from '../violation-cta-button';

jest.mock( '../../utils/install-plugin' );

const installAndActivatePluginMock = installAndActivatePlugin as jest.MockedFunction< typeof installAndActivatePlugin >;

const CTA_LABEL = 'Create';
const EXTERNAL_URL = 'https://example.com/wp-admin/options-privacy.php';
const PLUGIN_SLUG = 'cookiez';
const PLUGIN_FILE = 'cookiez/cookiez.php';

describe( 'ViolationCtaButton', () => {
	const originalWindowOpen = window.open;

	beforeEach( () => {
		window.open = jest.fn();
	} );

	afterEach( () => {
		window.open = originalWindowOpen;
		jest.resetAllMocks();
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

	it( 'installs and activates the plugin instead of opening a url when install props are given', async () => {
		installAndActivatePluginMock.mockResolvedValue( { success: true } );

		renderWithTheme(
			<ViolationCtaButton
				ctaLabel={ CTA_LABEL }
				installPluginSlug={ PLUGIN_SLUG }
				installPluginFile={ PLUGIN_FILE }
			/>
		);

		fireEvent.click( screen.getByRole( 'button', { name: CTA_LABEL } ) );

		await waitFor( () => expect( installAndActivatePluginMock ).toHaveBeenCalledWith( PLUGIN_SLUG, PLUGIN_FILE ) );
		expect( window.open ).not.toHaveBeenCalled();
	} );

	it( 'disables the button while the plugin install is in progress', async () => {
		let resolveInstall: ( result: { success: true } ) => void = () => undefined;
		installAndActivatePluginMock.mockReturnValue(
			new Promise( ( resolve ) => {
				resolveInstall = resolve;
			} )
		);

		renderWithTheme(
			<ViolationCtaButton
				ctaLabel={ CTA_LABEL }
				installPluginSlug={ PLUGIN_SLUG }
				installPluginFile={ PLUGIN_FILE }
			/>
		);

		fireEvent.click( screen.getByRole( 'button', { name: CTA_LABEL } ) );

		await waitFor( () => expect( screen.getByRole( 'button', { name: CTA_LABEL } ) ).toBeDisabled() );

		resolveInstall( { success: true } );

		await waitFor( () => expect( screen.getByRole( 'button', { name: CTA_LABEL } ) ).toBeEnabled() );
	} );
} );
