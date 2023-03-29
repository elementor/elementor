import * as React from 'react';
import { Slot } from '@elementor/locations';
import { LOCATION_TOP } from '../locations';

export default function Shell() {
	return (
		<Slot location={ LOCATION_TOP } />
	);
}
