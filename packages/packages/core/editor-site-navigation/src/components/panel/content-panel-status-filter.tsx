import * as React from 'react';
import { PopoverBody, PopoverHeader } from '@elementor/editor-ui';
import { FilterIcon } from '@elementor/icons';
import { bindPopover, bindToggle, Divider, Popover, ToggleButton, Tooltip, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';
import {
	hasActiveSiteContentStatusFilters,
	SITE_CONTENT_FILTER_POPOVER_BODY_HEIGHT_PX,
} from '../../site-content-status-filter';
import ContentPanelClearFiltersButton from './content-panel-clear-filters-button';
import ContentPanelStatusFilterList from './content-panel-status-filter-list';

export default function ContentPanelStatusFilter() {
	const { clearStatusFilters, statusFilters } = useContentPanelCoordinator();
	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const hasActiveFilters = hasActiveSiteContentStatusFilters( statusFilters );

	return (
		<>
			<Tooltip placement="top" title={ __( 'Filters', 'elementor' ) }>
				<ToggleButton
					aria-label={ __( 'Filters', 'elementor' ) }
					selected={ popupState.isOpen || hasActiveFilters }
					size="tiny"
					value="filter"
					{ ...bindToggle( popupState ) }
				>
					<FilterIcon fontSize="tiny" />
				</ToggleButton>
			</Tooltip>
			<Popover
				anchorOrigin={ {
					horizontal: 'right',
					vertical: 'top',
				} }
				sx={ {
					maxWidth: '344px',
				} }
				transformOrigin={ {
					horizontal: -21,
					vertical: 'top',
				} }
				{ ...bindPopover( popupState ) }
			>
				<PopoverHeader
					actions={
						hasActiveFilters
							? [
									<ContentPanelClearFiltersButton
										ariaLabel={ __( 'Clear all', 'elementor' ) }
										key="clear-all-filters"
										onClear={ clearStatusFilters }
										tooltipText={ __( 'Clear all', 'elementor' ) }
									/>,
							  ]
							: []
					}
					icon={ <FilterIcon fontSize="tiny" /> }
					onClose={ popupState.close }
					title={ __( 'Filters', 'elementor' ) }
				/>
				<Divider sx={ { borderWidth: '1px 0 0 0' } } />
				<PopoverBody height={ SITE_CONTENT_FILTER_POPOVER_BODY_HEIGHT_PX } width={ 344 }>
					<ContentPanelStatusFilterList />
				</PopoverBody>
			</Popover>
		</>
	);
}