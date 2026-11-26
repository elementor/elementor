import * as React from 'react';
import { CheckIcon } from '@elementor/icons';
import { MenuItem, MenuList, Stack, Typography } from '@elementor/ui';

import { useSiteContentPanelSectionsFilter } from '../../contexts/site-content-panel-sections-filter';

const renderSectionMenuItemContent = ( label: string, selected: boolean ) => (
	<Stack alignItems="center" direction="row" gap={ 1 } width="100%">
		<Typography sx={ { color: 'text.secondary', flex: 1 } } variant="caption">
			{ label }
		</Typography>
		{ selected ? <CheckIcon aria-hidden fontSize="tiny" /> : null }
	</Stack>
);

export default function ContentPanelSectionsFilterList() {
	const { descriptors, isSectionVisible, setSectionVisible } = useSiteContentPanelSectionsFilter();

	return (
		<MenuList dense disablePadding>
			{ descriptors.map( ( descriptor ) => {
				const selected = isSectionVisible( descriptor.id );

				return (
					<MenuItem
						key={ descriptor.id }
						dense
						onClick={ () => setSectionVisible( descriptor.id, ! selected ) }
						selected={ selected }
					>
						{ renderSectionMenuItemContent( descriptor.label, selected ) }
					</MenuItem>
				);
			} ) }
		</MenuList>
	);
}