import * as React from 'react';
import { useMemo, useState } from 'react';
import {
	PopoverBody,
	PopoverHeader,
	PopoverMenuList,
	SearchField,
	StyledMenuList,
	type VirtualizedItem,
} from '@elementor/editor-ui';
import { ComponentsIcon } from '@elementor/icons';
import { Box, CircularProgress, Divider, Link, Stack, styled, Typography } from '@elementor/ui';
import { useDebounceState } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import {
	createIconSelectionValue,
	filterFontAwesome7Icons,
	findFontAwesome7Icon,
	type FontAwesome7Icon,
} from './font-awesome-7-catalog';
import { FontAwesomeGlyph } from './font-awesome-glyph';
import { useFontAwesome7Catalog } from './use-font-awesome-7-catalog';

export const ICON_LIBRARY_POPOVER_WIDTH = 300;
export const ICON_LIBRARY_ROW_HEIGHT = 48;
export const ICON_LIBRARY_SEARCH_DEBOUNCE_DELAY = 300;
const ICON_TILE_SIZE = 40;
const ICON_GLYPH_SIZE = 20;
const ICON_LIBRARY_INLINE_SPACING = 1;

const CompactIconLibraryMenuList = styled( StyledMenuList )( ( { theme } ) => ( {
	'& > [role="option"]': {
		padding: theme.spacing( 0.75, ICON_LIBRARY_INLINE_SPACING ),
	},
} ) );

type IconLibraryItem = VirtualizedItem< 'item', string > & Omit< FontAwesome7Icon, 'value' >;

type IconLibraryPopoverProps = {
	open: boolean;
	selectedIconClass: string | null;
	selectedIconLibrary: string | null;
	onSelect: ( icon: { value: string; library: string } ) => void;
	onClose: () => void;
	width?: number;
};

export const IconLibraryPopover = ( {
	open,
	selectedIconClass,
	selectedIconLibrary,
	onSelect,
	onClose,
	width = ICON_LIBRARY_POPOVER_WIDTH,
}: IconLibraryPopoverProps ) => {
	const {
		debouncedValue: searchValue,
		inputValue: searchInputValue,
		handleChange: handleSearchChange,
	} = useDebounceState( { delay: ICON_LIBRARY_SEARCH_DEBOUNCE_DELAY } );
	const [ searchValue, setSearchValue ] = useState( '' );
	const { data: icons = [], isLoading } = useFontAwesome7Catalog( open );

	const items = useMemo( () => createIconLibraryItems( icons, searchValue ), [ icons, searchValue ] );
	const selectedValue = useMemo(
		() => findFontAwesome7Icon( icons, selectedIconClass, selectedIconLibrary )?.id,
		[ icons, selectedIconClass, selectedIconLibrary ]
	);

	const handleClose = () => {
		handleSearchChange( '' );
		onClose();
	};

	const handleSelect = ( id: string ) => {
		const icon = items.find( ( item ) => item.id === id );

		if ( ! icon ) {
			return;
		}

		onSelect( {
			value: createIconSelectionValue( icon.library, icon.name ),
			library: icon.library,
		} );
	};

	const handleClearSearch = () => {
		setSearchValue( '' );
	};

	return (
		<PopoverBody width={ width } fillWidth id="icon-library">
			<PopoverHeader
				title={ __( 'Icon library', 'elementor' ) }
				onClose={ handleClose }
				icon={ <ComponentsIcon fontSize="tiny" /> }
				sx={ { pl: ICON_LIBRARY_INLINE_SPACING, pr: 0.5 } }
			/>
			<SearchField
				value={ searchValue }
				onSearch={ setSearchValue }
				placeholder={ __( 'Search', 'elementor' ) }
				id="icon-library-search"
				sx={ { px: ICON_LIBRARY_INLINE_SPACING, pb: 1 } }
			/>
			<Divider />
			<Box sx={ { flex: 1, overflow: 'auto', minHeight: 0 } }>
				<IconLibraryContent
					isLoading={ isLoading }
					items={ items }
					selectedValue={ selectedValue }
					searchValue={ searchValue }
					onSelect={ handleSelect }
					onClose={ handleClose }
					onClearSearch={ handleClearSearch }
				/>
			</Box>
		</PopoverBody>
	);
};

type IconLibraryContentProps = {
	isLoading: boolean;
	items: IconLibraryItem[];
	selectedValue: string | undefined;
	searchValue: string;
	onSelect: ( id: string ) => void;
	onClose: () => void;
	onClearSearch: () => void;
};

const IconLibraryContent = ( {
	isLoading,
	items,
	selectedValue,
	searchValue,
	onSelect,
	onClose,
	onClearSearch,
}: IconLibraryContentProps ) => {
	if ( isLoading ) {
		return <IconLibraryLoadingState />;
	}

	return (
		<PopoverMenuList
			items={ items }
			selectedValue={ selectedValue }
			menuListTemplate={ CompactIconLibraryMenuList }
			onSelect={ onSelect }
			onClose={ onClose }
			itemHeight={ ICON_LIBRARY_ROW_HEIGHT }
			menuItemContentTemplate={ IconLibraryRow }
			noResultsComponent={ <IconLibraryEmptyState searchValue={ searchValue } onClear={ onClearSearch } /> }
			data-testid="icon-library-list"
		/>
	);
};

const IconLibraryLoadingState = () => (
	<Stack alignItems="center" justifyContent="center" height="100%">
		<CircularProgress role="progressbar" size={ 24 } />
	</Stack>
);

const IconLibraryEmptyState = ( { searchValue, onClear }: { searchValue: string; onClear: () => void } ) => {
	if ( searchValue.trim() === '' ) {
		return <CatalogUnavailable />;
	}

	return <NoResults searchValue={ searchValue } onClear={ onClear } />;
};

const IconLibraryRow = ( item: VirtualizedItem< string, string > ) => {
	const icon = item as IconLibraryItem;

	return (
		<Stack direction="row" alignItems="center" gap={ 1 } sx={ { width: '100%' } }>
			<Box
				sx={ {
					width: ICON_TILE_SIZE,
					height: ICON_TILE_SIZE,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					border: 1,
					borderColor: 'divider',
					borderRadius: 1,
					color: 'text.tertiary',
					flexShrink: 0,
				} }
			>
				{ icon.paths.length > 0 ? (
					<FontAwesomeGlyph icon={ icon } size={ ICON_GLYPH_SIZE } color="currentColor" />
				) : null }
			</Box>
			<Typography variant="caption" color="text.primary" noWrap>
				{ icon.label }
			</Typography>
		</Stack>
	);
};

const CatalogUnavailable = () => (
	<Stack alignItems="center" justifyContent="center" height="100%" p={ 2.5 } gap={ 1.5 }>
		<ComponentsIcon fontSize="large" />
		<Typography align="center" variant="subtitle2" color="text.secondary">
			{ __( "Icons couldn't be loaded.", 'elementor' ) }
		</Typography>
	</Stack>
);

const NoResults = ( { searchValue, onClear }: { searchValue: string; onClear: () => void } ) => (
	<Stack alignItems="center" justifyContent="center" height="100%" p={ 2.5 } gap={ 1.5 }>
		<ComponentsIcon fontSize="large" />
		<Typography align="center" variant="subtitle2" color="text.secondary">
			{ __( 'Sorry, nothing matched', 'elementor' ) }
		</Typography>
		<Typography align="center" variant="subtitle2" color="text.secondary" noWrap sx={ { maxWidth: '80%' } }>
			&ldquo;{ searchValue }&rdquo;.
		</Typography>
		<Link color="secondary" variant="caption" component="button" type="button" onClick={ onClear }>
			{ __( 'Clear & try again', 'elementor' ) }
		</Link>
	</Stack>
);

const createIconLibraryItems = ( icons: FontAwesome7Icon[], searchValue: string ): IconLibraryItem[] =>
	filterFontAwesome7Icons( icons, searchValue ).map( ( icon ) => ( {
		...icon,
		type: 'item',
		value: icon.id,
	} ) );
