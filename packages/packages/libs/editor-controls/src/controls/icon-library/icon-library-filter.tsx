import * as React from 'react';
import { useId } from 'react';
import { CheckIcon, FilterIcon, LibraryIcon, ListIcon, StarFilledIcon, StarIcon } from '@elementor/icons';
import {
	bindMenu,
	bindToggle,
	Box,
	Divider,
	ListSubheader,
	Menu,
	MenuItem,
	Stack,
	ToggleButton,
	Tooltip,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type FontAwesome7LibraryFilter } from './font-awesome-7-catalog';
import { ICON_LIBRARY_ACTION_TOOLTIP_ENTER_DELAY } from './icon-library-tooltip';

const FILTER_MENU_WIDTH = 280;
const FILTER_INDICATOR_SIZE = 6;
const FILTER_INDICATOR_OFFSET = 4;
const FILTER_TYPE_ALL = 'all';
const FILTER_TYPE_GROUP = 'group';
const FILTER_TYPE_ITEM = 'item';

const FILTER_ICONS: Record< string, typeof ListIcon > = {
	list: ListIcon,
	star: StarIcon,
	'star-filled': StarFilledIcon,
	library: LibraryIcon,
};

const DEFAULT_FILTER = [
	{ type: FILTER_TYPE_ALL, label: 'All icons', icon: 'list' },
	{ type: FILTER_TYPE_ITEM, value: 'fa-regular', label: 'Font Awesome - Regular', icon: 'star' },
	{ type: FILTER_TYPE_ITEM, value: 'fa-solid', label: 'Font Awesome - Solid', icon: 'star-filled' },
	{ type: FILTER_TYPE_ITEM, value: 'fa-brands', label: 'Font Awesome - Brands', icon: 'library' },
] as const;

type FilterEntry =
	| { type: typeof FILTER_TYPE_ALL; label: string; icon?: string }
	| { type: typeof FILTER_TYPE_GROUP; label: string }
	| { type: typeof FILTER_TYPE_ITEM; value: string; label: string; icon?: string };

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
	const entries = getFilterEntries();
	const selectableValues = entries.flatMap( ( entry ) =>
		entry.type === FILTER_TYPE_ITEM ? [ entry.value ] : []
	);
	const isFiltered = value.length > 0;
	const filterButtonLabel = isFiltered
		? __( 'Filter by library, active', 'elementor' )
		: __( 'Filter by library', 'elementor' );

	const handleLibraryClick = ( library: string ) => {
		const nextValue = value.includes( library )
			? value.filter( ( selectedLibrary ) => selectedLibrary !== library )
			: [ ...value, library ];

		onChange( nextValue.length === selectableValues.length ? [] : nextValue );
	};

	return (
		<>
			<Tooltip
				title={ __( 'Filter by library', 'elementor' ) }
				placement="top"
				enterDelay={ ICON_LIBRARY_ACTION_TOOLTIP_ENTER_DELAY }
				enterNextDelay={ ICON_LIBRARY_ACTION_TOOLTIP_ENTER_DELAY }
				disableInteractive
			>
				<ToggleButton
					aria-label={ filterButtonLabel }
					value="filter"
					size="tiny"
					selected={ popupState.isOpen }
					sx={ { position: 'relative', flexShrink: 0 } }
					{ ...bindToggle( popupState ) }
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
				{ entries.flatMap( ( entry, index ) =>
					renderFilterEntry( entry, index, value, isFiltered, () => onChange( [] ), handleLibraryClick )
				) }
			</Menu>
		</>
	);
};

const renderFilterEntry = (
	entry: FilterEntry,
	index: number,
	selectedLibraries: FontAwesome7LibraryFilter,
	isFiltered: boolean,
	onAllIconsClick: () => void,
	onLibraryClick: ( library: string ) => void
): React.ReactNode[] => {
	if ( entry.type === FILTER_TYPE_GROUP ) {
		return [
			<Divider key={ `divider-${ index }` } />,
			<ListSubheader key={ `group-${ index }` } disableSticky>
				{ entry.label }
			</ListSubheader>,
		];
	}

	if ( entry.type === FILTER_TYPE_ALL ) {
		return [
			<MenuItem
				key={ `all-${ index }` }
				role="menuitemcheckbox"
				aria-checked={ ! isFiltered }
				selected={ ! isFiltered }
				onClick={ onAllIconsClick }
			>
				{ renderFilterMenuItemContent( entry.label, getFilterIcon( entry.icon ), ! isFiltered ) }
			</MenuItem>,
		];
	}

	const isSelected = selectedLibraries.includes( entry.value );

	return [
		<MenuItem
			key={ entry.value }
			role="menuitemcheckbox"
			aria-checked={ isSelected }
			selected={ isSelected }
			onClick={ () => onLibraryClick( entry.value ) }
		>
			{ renderFilterMenuItemContent( entry.label, getFilterIcon( entry.icon ), isSelected ) }
		</MenuItem>,
	];
};

const getFilterIcon = ( icon?: string ) => FILTER_ICONS[ icon ?? '' ] ?? LibraryIcon;

const renderFilterMenuItemContent = ( label: string, Icon: typeof ListIcon, selected: boolean ) => (
	<Stack direction="row" alignItems="center" gap={ 1 } width="100%">
		<Icon fontSize="tiny" />
		<Typography variant="caption" sx={ { flex: 1 } }>
			{ label }
		</Typography>
		{ selected ? <CheckIcon fontSize="tiny" aria-hidden="true" /> : null }
	</Stack>
);

function getFilterEntries(): FilterEntry[] {
	const filter = window.elementorCommon?.config?.fontAwesome?.v7?.filter;

	if ( ! Array.isArray( filter ) ) {
		return [ ...DEFAULT_FILTER ];
	}

	const entries = filter.map( parseFilterEntry ).filter( ( entry ): entry is FilterEntry => entry !== null );

	return entries.length > 0 ? entries : [ ...DEFAULT_FILTER ];
}

function parseFilterEntry( value: unknown ): FilterEntry | null {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}

	const entry = value as { type?: unknown; label?: unknown; value?: unknown; icon?: unknown };

	if ( typeof entry.label !== 'string' || entry.label === '' ) {
		return null;
	}

	if ( entry.type === FILTER_TYPE_GROUP ) {
		return { type: FILTER_TYPE_GROUP, label: entry.label };
	}

	if ( entry.type === FILTER_TYPE_ALL ) {
		return {
			type: FILTER_TYPE_ALL,
			label: entry.label,
			icon: typeof entry.icon === 'string' ? entry.icon : undefined,
		};
	}

	if ( entry.type === FILTER_TYPE_ITEM && typeof entry.value === 'string' && entry.value !== '' ) {
		return {
			type: FILTER_TYPE_ITEM,
			value: entry.value,
			label: entry.label,
			icon: typeof entry.icon === 'string' ? entry.icon : undefined,
		};
	}

	return null;
}
