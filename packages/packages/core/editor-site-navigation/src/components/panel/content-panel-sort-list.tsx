import * as React from 'react';
import { CheckIcon } from '@elementor/icons';
import { MenuItem, MenuList, Stack, Typography } from '@elementor/ui';

import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';
import { getSiteContentSortLabel, SITE_CONTENT_SORT_OPTIONS } from '../../site-content-sort';

const renderSortMenuItemContent = ( label: string, selected: boolean ) => (
	<Stack alignItems="center" direction="row" gap={ 1 } width="100%">
		<Typography sx={ { color: 'text.secondary', flex: 1 } } variant="caption">
			{ label }
		</Typography>
		{ selected ? <CheckIcon aria-hidden fontSize="tiny" /> : null }
	</Stack>
);

export default function ContentPanelSortList() {
	const { setSiteContentSort, siteContentSort } = useContentPanelCoordinator();

	return (
		<MenuList dense>
			{ SITE_CONTENT_SORT_OPTIONS.map( ( option ) => {
				const isSelected = siteContentSort === option;

				return (
					<MenuItem
						key={ option }
						aria-checked={ isSelected }
						onClick={ () => setSiteContentSort( option ) }
						role="menuitemradio"
						selected={ isSelected }
					>
						{ renderSortMenuItemContent( getSiteContentSortLabel( option ), isSelected ) }
					</MenuItem>
				);
			} ) }
		</MenuList>
	);
}
