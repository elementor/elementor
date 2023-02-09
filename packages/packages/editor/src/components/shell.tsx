import * as React from 'react';
import { Slot } from '@elementor/locations';
import { LOCATION_TOP } from '../locations';
import { ThemeProvider } from '@elementor/ui';
import { useEnvOptions } from '../contexts/env-context';

export default function Shell() {
	const a = useEnvOptions();

	console.log( a );

	return (
		<ThemeProvider>
			<Slot location={ LOCATION_TOP } />
		</ThemeProvider>
	);
}
