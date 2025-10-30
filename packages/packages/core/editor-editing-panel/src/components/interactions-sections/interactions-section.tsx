import * as React from 'react';

import { InteractionsProvider } from '../../contexts/interaction-context';
import { SectionContent } from '../section-content';
import { InteractionsInput } from './interactions-input';

export const InteractionsSection = () => {
	return (
		<SectionContent>
			<InteractionsProvider>
				<InteractionsInput />
			</InteractionsProvider>
		</SectionContent>
	);
};
