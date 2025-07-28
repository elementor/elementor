import * as React from 'react';
import { type PropTypeUtil, type PropValue } from '@elementor/editor-props';

import { SlotChildren } from '../../control-replacements';
import { SectionContent } from '../section-content';
import { RepeaterContextProvider } from './context/repeater-context';
import { Header } from './header/header';
import { ItemsContainer } from './items/items-container';

export const UnstableRepeater = < T extends PropValue >( {
	children,
	initial,
	propTypeUtil,
}: React.PropsWithChildren< { initial: T; propTypeUtil: PropTypeUtil< string, T[] > } > ) => {
	return (
		<SectionContent>
			<RepeaterContextProvider initial={ initial } propTypeUtil={ propTypeUtil }>
				<SlotChildren whitelist={ [ Header, ItemsContainer ] as React.FC[] } sorted>
					{ children }
				</SlotChildren>
			</RepeaterContextProvider>
		</SectionContent>
	);
};
