import * as React from 'react';
import { ListIcon, WidgetsIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ICON_LIBRARY_ACTION_TOOLTIP_ENTER_DELAY } from './icon-library-tooltip';

export type IconLibraryView = 'grid' | 'list';

const HEADER_ACTION_GAP = 0.5;

type IconLibraryViewToggleProps = {
	value: IconLibraryView;
	onChange: ( value: IconLibraryView ) => void;
};

export const IconLibraryViewToggle = ( { value, onChange }: IconLibraryViewToggleProps ) => {
	const isGrid = value === 'grid';
	const nextView: IconLibraryView = isGrid ? 'list' : 'grid';
	const ViewIcon = isGrid ? WidgetsIcon : ListIcon;
	const viewButtonLabel = isGrid ? __( 'Grid view', 'elementor' ) : __( 'List view', 'elementor' );
	const viewButtonAction = isGrid ? __( 'Switch to list view', 'elementor' ) : __( 'Switch to grid view', 'elementor' );

	return (
		<Tooltip
			title={ viewButtonLabel }
			placement="top"
			enterDelay={ ICON_LIBRARY_ACTION_TOOLTIP_ENTER_DELAY }
			enterNextDelay={ ICON_LIBRARY_ACTION_TOOLTIP_ENTER_DELAY }
			disableInteractive
		>
			<IconButton
				aria-label={ viewButtonAction }
				size="tiny"
				onClick={ () => onChange( nextView ) }
				sx={ { flexShrink: 0, mr: HEADER_ACTION_GAP } }
			>
				<ViewIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
