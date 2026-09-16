import * as React from 'react';
import { useId } from 'react';
import { CheckIcon, ListIcon, WidgetsIcon } from '@elementor/icons';
import {
	bindMenu,
	bindToggle,
	Menu,
	MenuItem,
	Stack,
	ToggleButton,
	Tooltip,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ICON_LIBRARY_ACTION_TOOLTIP_ENTER_DELAY } from './icon-library-tooltip';

export type IconLibraryView = 'grid' | 'list';

const VIEW_MENU_WIDTH = 122;

type IconLibraryViewToggleProps = {
	value: IconLibraryView;
	onChange: ( value: IconLibraryView ) => void;
};

export const IconLibraryViewToggle = ( { value, onChange }: IconLibraryViewToggleProps ) => {
	const popupId = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId,
	} );
	const isGrid = value === 'grid';
	const ViewIcon = isGrid ? WidgetsIcon : ListIcon;
	const viewButtonLabel = isGrid ? __( 'Grid view', 'elementor' ) : __( 'List view', 'elementor' );

	return (
		<>
			<Tooltip
				title={ viewButtonLabel }
				placement="top"
				enterDelay={ ICON_LIBRARY_ACTION_TOOLTIP_ENTER_DELAY }
				enterNextDelay={ ICON_LIBRARY_ACTION_TOOLTIP_ENTER_DELAY }
				disableInteractive
			>
				<ToggleButton
					aria-label={ viewButtonLabel }
					value="view"
					size="tiny"
					selected={ popupState.isOpen }
					sx={ { flexShrink: 0 } }
					{ ...bindToggle( popupState ) }
					aria-expanded={ popupState.isOpen }
				>
					<ViewIcon fontSize="tiny" />
				</ToggleButton>
			</Tooltip>
			<Menu
				{ ...bindMenu( popupState ) }
				MenuListProps={ {
					dense: true,
					autoFocusItem: true,
					'aria-label': __( 'View', 'elementor' ),
				} }
				sx={ { '& .MuiPaper-root': { minWidth: VIEW_MENU_WIDTH } } }
			>
				<ViewMenuItem
					label={ __( 'List', 'elementor' ) }
					selected={ value === 'list' }
					onClick={ () => {
						onChange( 'list' );
						popupState.close();
					} }
				/>
				<ViewMenuItem
					label={ __( 'Grid', 'elementor' ) }
					selected={ value === 'grid' }
					onClick={ () => {
						onChange( 'grid' );
						popupState.close();
					} }
				/>
			</Menu>
		</>
	);
};

type ViewMenuItemProps = {
	label: string;
	selected: boolean;
	onClick: () => void;
};

const ViewMenuItem = ( { label, selected, onClick }: ViewMenuItemProps ) => (
	<MenuItem role="menuitemradio" aria-checked={ selected } selected={ selected } onClick={ onClick }>
		<Stack direction="row" alignItems="center" gap={ 1 } width="100%">
			<Typography variant="caption" sx={ { flex: 1 } }>
				{ label }
			</Typography>
			{ selected ? <CheckIcon fontSize="tiny" aria-hidden="true" /> : null }
		</Stack>
	</MenuItem>
);
