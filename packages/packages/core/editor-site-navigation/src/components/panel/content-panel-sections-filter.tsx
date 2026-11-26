import * as React from 'react';
import { PopoverBody, PopoverHeader } from '@elementor/editor-ui';
import { FilterIcon } from '@elementor/icons';
import { bindPopover, bindToggle, Divider, Popover, ToggleButton, Tooltip, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useSiteContentPanelSectionsFilter } from '../../contexts/site-content-panel-sections-filter';
import { SITE_CONTENT_PANEL_SECTIONS_FILTER_POPOVER_WIDTH_PX } from '../../site-content-panel-sections';
import ContentPanelClearFiltersButton from './content-panel-clear-filters-button';
import ContentPanelSectionsFilterList from './content-panel-sections-filter-list';

export default function ContentPanelSectionsFilter() {
	const { clearHiddenSections, hasHiddenSections, shouldShowSectionsFilter } = useSiteContentPanelSectionsFilter();
	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	if ( ! shouldShowSectionsFilter ) {
		return null;
	}

	const filterLabel = __( 'Content types', 'elementor' );

	return (
		<>
			<Tooltip placement="top" title={ filterLabel }>
				<ToggleButton
					aria-label={ filterLabel }
					selected={ popupState.isOpen || hasHiddenSections }
					size="tiny"
					value="content-types"
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
					maxWidth: `${ SITE_CONTENT_PANEL_SECTIONS_FILTER_POPOVER_WIDTH_PX }px`,
				} }
				transformOrigin={ {
					horizontal: -21,
					vertical: 'top',
				} }
				{ ...bindPopover( popupState ) }
			>
				<PopoverHeader
					actions={
						hasHiddenSections
							? [
									<ContentPanelClearFiltersButton
										ariaLabel={ __( 'Show all', 'elementor' ) }
										key="show-all-content-types"
										onClear={ clearHiddenSections }
										tooltipText={ __( 'Show all', 'elementor' ) }
									/>,
							  ]
							: []
					}
					icon={ <FilterIcon fontSize="tiny" /> }
					onClose={ popupState.close }
					title={ filterLabel }
				/>
				<Divider sx={ { borderWidth: '1px 0 0 0' } } />
				<PopoverBody height="auto" width={ SITE_CONTENT_PANEL_SECTIONS_FILTER_POPOVER_WIDTH_PX }>
					<ContentPanelSectionsFilterList />
				</PopoverBody>
			</Popover>
		</>
	);
}