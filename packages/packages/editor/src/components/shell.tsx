import * as React from 'react';
import { Slot } from '@elementor/locations';
import { LOCATION_TOP } from '../locations';
import { ThemeProvider } from '@elementor/ui';

export default function Shell() {
	return (
		<ThemeProvider>
			<Slot location={ LOCATION_TOP } />
		</ThemeProvider>
	);
}
