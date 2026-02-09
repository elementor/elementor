import * as React from 'react';
import { InteractionsField } from '@elementor/editor-interactions';

import { SectionsList } from './sections-list';

export const InteractionsTab = () => {
	return (
		<SectionsList>
			<InteractionsField />
		</SectionsList>
	);
};
