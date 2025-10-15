import * as React from 'react';
import { type PropTypeUtil } from '@elementor/editor-props';

import { SectionContent } from '../section-content';
import { RepeaterContextProvider } from './context/repeater-context';
import { type RepeatablePropValue } from './types';

export const ControlRepeater = < T extends RepeatablePropValue >( {
	children,
	initial,
	propTypeUtil,
}: React.PropsWithChildren< { initial: T; propTypeUtil: PropTypeUtil< string, T[] > } > ) => {
	return (
		<SectionContent>
			<RepeaterContextProvider initial={ initial } propTypeUtil={ propTypeUtil }>
				{ children }
			</RepeaterContextProvider>
		</SectionContent>
	);
};
