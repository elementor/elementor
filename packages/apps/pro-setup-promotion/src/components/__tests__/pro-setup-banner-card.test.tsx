import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { render, screen } from '@testing-library/react';

import { ProSetupBannerCard } from '../pro-setup-banner-card';

const LONG_TITLE = 'Your Elementor Pro subscription is ready on this site and waiting for you to finish setup now';

describe( 'ProSetupBannerCard', () => {
	it( 'renders title and subtitle copy', () => {
		render(
			<ThemeProvider>
				<ProSetupBannerCard title="Your Elementor Pro is ready" subtitle="Finish setup to start using Pro" />
			</ThemeProvider>
		);

		expect( screen.getByText( 'Your Elementor Pro is ready' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Finish setup to start using Pro' ) ).toBeInTheDocument();
	} );

	it( 'renders in dark theme with decorative download tile hidden from assistive tech', () => {
		render(
			<ThemeProvider colorScheme="dark">
				<ProSetupBannerCard title="Your Elementor Pro is ready" subtitle="Finish setup to start using Pro" />
			</ThemeProvider>
		);

		expect( screen.getByText( 'Your Elementor Pro is ready' ) ).toBeInTheDocument();
		// eslint-disable-next-line testing-library/no-test-id-queries -- decorative, non-interactive tile
		expect( screen.getByTestId( 'pro-setup-banner-decorative-tile' ) ).toHaveAttribute( 'aria-hidden' );
	} );

	it( 'renders long banner title without dropping copy from the document', () => {
		render(
			<ThemeProvider>
				<ProSetupBannerCard title={ LONG_TITLE } subtitle="Finish setup to start using Pro" />
			</ThemeProvider>
		);

		expect( screen.getByText( LONG_TITLE ) ).toBeInTheDocument();
	} );
} );
