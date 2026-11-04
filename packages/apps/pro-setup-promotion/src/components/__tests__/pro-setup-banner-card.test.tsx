import * as React from 'react';
import { ThemeProvider } from '@elementor/ui';
import { render, screen } from '@testing-library/react';

import { ProSetupBannerCard } from '../pro-setup-banner-card';

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
} );
