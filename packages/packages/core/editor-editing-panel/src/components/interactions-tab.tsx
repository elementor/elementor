import * as React from 'react';
import { InteractionsTab as InteractionsTabContent } from '@elementor/editor-interactions';

import { useElement } from '../contexts/element-context';
import { SectionsList } from './sections-list';

export const InteractionsTab = () => {
	const { element } = useElement();

	return (
		<SectionsList>
			<InteractionsTabContent elementId={ element.id } />
		</SectionsList>
	);
};
