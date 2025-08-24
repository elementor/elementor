import * as React from 'react';
import { type PropTypeUtil } from '@elementor/editor-props';

import { SlotChildren } from '../../control-replacements';
import { SectionContent } from '../section-content';
import { RepeaterContextProvider } from './context/repeater-context';
import { Header } from './header/header';
import { EditItemPopover } from './items/edit-item-popover';
import { ItemsContainer } from './items/items-container';
import { type RepeatablePropValue } from './types';

export const UnstableRepeater = < T extends RepeatablePropValue >( {
	children,
	initial,
	propTypeUtil,
}: React.PropsWithChildren< { initial: T; propTypeUtil: PropTypeUtil< string, T[] > } > ) => {
	return (
		<SectionContent>
			<RepeaterContextProvider initial={ initial } propTypeUtil={ propTypeUtil }>
				<SlotChildren whitelist={ [ Header, ItemsContainer, EditItemPopover ] as React.FC[] } sorted>
					{ children }
				</SlotChildren>
			</RepeaterContextProvider>
		</SectionContent>
	);
};
