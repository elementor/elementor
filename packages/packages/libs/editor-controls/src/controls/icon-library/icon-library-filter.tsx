import * as React from 'react';
import { useId } from 'react';
import { CheckIcon, FilterIcon, LibraryIcon, ListIcon, StarFilledIcon, StarIcon } from '@elementor/icons';
import {
	bindMenu,
	bindTrigger,
	Box,
	Menu,
	MenuItem,
	Stack,
	ToggleButton,
	Tooltip,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	FONT_AWESOME_7_LIBRARIES,
	type FontAwesome7Library,
	type FontAwesome7LibraryFilter,
} from './font-awesome-7-catalog';

const FILTER_MENU_WIDTH = 280;
const FILTER_INDICATOR_SIZE = 6;
const FILTER_INDICATOR_OFFSET = 4;
const LIBRARY_FILTER_ORDER = {
	regular: 0,
	solid: 1,
	brands: 2,
} as const;

const LIBRARY_FILTER_CONFIG: Record<
	FontAwesome7Library,
	{ getLabel: () => string; Icon: typeof StarIcon; order: number }
> = {
	'fa-regular': {
		getLabel: () => __( 'Font Awesome - Regular', 'elementor' ),
		Icon: StarIcon,
		order: LIBRARY_FILTER_ORDER.regular,
	},
	'fa-solid': {
		getLabel: () => __( 'Font Awesome - Solid', 'elementor' ),
		Icon: StarFilledIcon,
		order: LIBRARY_FILTER_ORDER.solid,
	},
	'fa-brands': {
		getLabel: () => __( 'Font Awesome - Brands', 'elementor' ),
		Icon: LibraryIcon,
		order: LIBRARY_FILTER_ORDER.brands,
	},
};

type IconLibraryFilterProps = {
	value: FontAwesome7LibraryFilter;
	onChange: ( value: FontAwesome7LibraryFilter ) => void;
};

export const IconLibraryFilter = ( { value, onChange }: IconLibraryFilterProps ) => {
	const popupId = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId,
	} );
	const options = FONT_AWESOME_7_LIBRARIES.map( ( { library } ) => ( {
		value: library,
		label: LIBRARY_FILTER_CONFIG[ library ].getLabel(),
		Icon: LIBRARY_FILTER_CONFIG[ library ].Icon,
		order: LIBRARY_FILTER_CONFIG[ library ].order,
	} ) ).sort( ( firstOption, secondOption ) => firstOption.order - secondOption.order );
	const isFiltered = value.length > 0;
	const filterButtonLabel = isFiltered
		? __( 'Filter by library, active', 'elementor' )
		: __( 'Filter by library', 'elementor' );

	const handleAllIconsClick = () => {
		onChange( [] );
	};

	const handleLibraryClick = ( library: FontAwesome7Library ) => {
		const nextValue = value.includes( library )
			? value.filter( ( selectedLibrary ) => selectedLibrary !== library )
			: [ ...value, library ];

		onChange( nextValue.length === FONT_AWESOME_7_LIBRARIES.length ? [] : nextValue );
	};

	return (
		<>
			<Tooltip title={ __( 'Filter by library', 'elementor' ) } placement="top">
				<ToggleButton
					aria-label={ filterButtonLabel }
					value="filter"
					size="tiny"
					selected={ popupState.isOpen }
					sx={ { position: 'relative', flexShrink: 0 } }
					{ ...bindTrigger( popupState ) }
					aria-expanded={ popupState.isOpen }
				>
					<FilterIcon fontSize="tiny" />
					{ isFiltered ? (
						<Box
							component="span"
							aria-hidden="true"
							sx={ {
								position: 'absolute',
								insetBlockStart: FILTER_INDICATOR_OFFSET,
								insetInlineEnd: FILTER_INDICATOR_OFFSET,
								width: FILTER_INDICATOR_SIZE,
								height: FILTER_INDICATOR_SIZE,
								borderRadius: '50%',
								bgcolor: 'secondary.main',
							} }
						/>
					) : null }
				</ToggleButton>
			</Tooltip>
			<Menu
				{ ...bindMenu( popupState ) }
				MenuListProps={ {
					dense: true,
					autoFocusItem: true,
					'aria-label': __( 'Filter by library', 'elementor' ),
				} }
				sx={ { '& .MuiPaper-root': { minWidth: FILTER_MENU_WIDTH } } }
			>
				<MenuItem
					role="menuitemcheckbox"
					aria-checked={ ! isFiltered }
					selected={ ! isFiltered }
					onClick={ handleAllIconsClick }
				>
					{ renderFilterMenuItemContent( __( 'All icons', 'elementor' ), ListIcon, ! isFiltered ) }
				</MenuItem>
				{ options.map( ( { value: library, label, Icon } ) => (
					<MenuItem
						key={ library }
						role="menuitemcheckbox"
						aria-checked={ value.includes( library ) }
						selected={ value.includes( library ) }
						onClick={ () => handleLibraryClick( library ) }
					>
						{ renderFilterMenuItemContent( label, Icon, value.includes( library ) ) }
					</MenuItem>
				) ) }
			</Menu>
		</>
	);
};

const renderFilterMenuItemContent = ( label: string, Icon: typeof ListIcon, selected: boolean ) => (
	<Stack direction="row" alignItems="center" gap={ 1 } width="100%">
		<Icon fontSize="tiny" />
		<Typography variant="caption" flex={ 1 }>
			{ label }
		</Typography>
		{ selected ? <CheckIcon fontSize="tiny" /> : null }
	</Stack>
);
