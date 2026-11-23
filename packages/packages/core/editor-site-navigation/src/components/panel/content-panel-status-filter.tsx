import * as React from 'react';
import { PopoverBody, PopoverHeader } from '@elementor/editor-ui';
import { FilterIcon } from '@elementor/icons';
import {
	bindPopover,
	bindToggle,
	Divider,
	MenuItem,
	MenuList,
	Popover,
	ToggleButton,
	Tooltip,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';
import {
	getSiteContentStatusFilterLabel,
	SITE_CONTENT_STATUS_FILTERS,
	type SiteContentStatusFilter,
} from '../../site-content-status-filter';

export default function ContentPanelStatusFilter() {
	const { statusFilter, setStatusFilter } = useContentPanelCoordinator();
	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const handleSelect = ( filter: SiteContentStatusFilter ) => {
		setStatusFilter( filter );
		popupState.close();
	};

	return (
		<>
			<Tooltip title={ __( 'Filter', 'elementor' ) } placement="top">
				<ToggleButton
					value="filter"
					size="tiny"
					selected={ 'all' !== statusFilter || popupState.isOpen }
					{ ...bindToggle( popupState ) }
					aria-label={ __( 'Filter', 'elementor' ) }
				>
					<FilterIcon fontSize="tiny" />
				</ToggleButton>
			</Tooltip>
			<Popover
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'right',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'right',
				} }
				{ ...bindPopover( popupState ) }
			>
				<PopoverHeader
					onClose={ popupState.close }
					title={ __( 'Filter', 'elementor' ) }
					icon={ <FilterIcon fontSize="tiny" /> }
				/>
				<Divider sx={ { borderWidth: '1px 0 0 0' } } />
				<PopoverBody>
					<MenuList dense>
						{ SITE_CONTENT_STATUS_FILTERS.map( ( filter ) => (
							<MenuItem key={ filter } selected={ statusFilter === filter } onClick={ () => handleSelect( filter ) }>
								{ getSiteContentStatusFilterLabel( filter ) }
							</MenuItem>
						) ) }
					</MenuList>
				</PopoverBody>
			</Popover>
		</>
	);
}