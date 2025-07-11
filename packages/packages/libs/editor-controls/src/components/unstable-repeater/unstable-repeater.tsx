import * as React from 'react';

import { SectionContent } from '../section-content';
import { RepeaterContextProvider } from './context/repeater-context';

export const UnstableRepeater = ( { children }: { children: React.ReactNode } ) => {
	return (
		<SectionContent>
			<RepeaterContextProvider>{ children }</RepeaterContextProvider>
		</SectionContent>
	);
};
