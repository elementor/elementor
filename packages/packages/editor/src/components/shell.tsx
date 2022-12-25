import React from 'react';
import { Slot } from '@elementor/locations';
import { EDITOR_TOP_LOCATION } from '../locations';

export default function Shell() {
	return (
		<>
			<Slot location={ EDITOR_TOP_LOCATION } />
		</>
	);
}
