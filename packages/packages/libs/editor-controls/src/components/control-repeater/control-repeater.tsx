import * as React from 'react';
import { type PropTypeUtil } from '@elementor/editor-props';

import { SectionContent } from '../section-content';
import { RepeaterContextProvider } from './context/repeater-context';
import { type Item, type RepeatablePropValue } from './types';

export const ControlRepeater = < T extends RepeatablePropValue >( {
	children,
	initial,
	propTypeUtil,
	isItemDisabled,
}: React.PropsWithChildren< {
	initial: T;
	propTypeUtil: PropTypeUtil< string, T[] >;
	isItemDisabled?: ( item: Item< T > ) => boolean;
} > ) => {
	return (
		<SectionContent>
			<RepeaterContextProvider
				initial={ initial }
				propTypeUtil={ propTypeUtil }
				isItemDisabled={ isItemDisabled }
			>
				{ children }
			</RepeaterContextProvider>
		</SectionContent>
	);
};
