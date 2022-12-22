import React from 'react';
import { Slot } from '@elementor/locations';
import locations from '../locations';

export default function Shell() {
	return (
		<>
			<Slot name={ locations.TOP } />
		</>
	);
}
