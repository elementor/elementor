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
import { __ } from '@wordpress/i18n';

import {
	createIconSelectionValue,
	filterFontAwesome7Icons,
	type FontAwesome7Icon,
	getSelectedIconId,
} from './font-awesome-7-catalog';
import { FontAwesomeGlyph } from './font-awesome-glyph';
import { useFontAwesome7Catalog } from './use-font-awesome-7-catalog';

export const ICON_LIBRARY_POPOVER_WIDTH = 300;
export const ICON_LIBRARY_ROW_HEIGHT = 48;
const ICON_TILE_SIZE = 40;
const ICON_GLYPH_SIZE = 20;
const ICON_LIBRARY_INLINE_SPACING = 1;

const CompactIconLibraryMenuList = styled( StyledMenuList )( ( { theme } ) => ( {
	'& > [role="option"]': {
		padding: theme.spacing( 0.75, ICON_LIBRARY_INLINE_SPACING ),
	},
} ) );

type IconLibraryItem = VirtualizedItem< 'item', string > & FontAwesome7Icon;

type IconLibraryPopoverProps = {
	open: boolean;
	selectedIconClass: string | null;
	selectedIconLibrary: string | null;
	onSelect: ( icon: { value: string; library: string } ) => void;
	onClose: () => void;
	width?: number;
};

export function IconLibraryPopover( {
	open,
	selectedIconClass,
	selectedIconLibrary,
	onSelect,
	onClose,
	width = ICON_LIBRARY_POPOVER_WIDTH,
}: IconLibraryPopoverProps ) {
	const [ searchValue, setSearchValue ] = useState( '' );
	const { data: icons = [], isLoading } = useFontAwesome7Catalog( open );

	const items = useMemo< IconLibraryItem[] >(
		() =>
			filterFontAwesome7Icons( icons, searchValue ).map( ( icon ) => ( {
				...icon,
				type: 'item',
				value: icon.id,
			} ) ),
		[ icons, searchValue ]
	);

	const selectedValue = useMemo(
		() => items.find( ( item ) => item.id === getSelectedIconId( selectedIconClass, selectedIconLibrary ) )?.value,
		[ items, selectedIconClass, selectedIconLibrary ]
	);

	const handleClose = () => {
		setSearchValue( '' );
		onClose();
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
				{ isLoading ? (
					<Stack alignItems="center" justifyContent="center" height="100%">
						<CircularProgress role="progressbar" size={ 24 } />
					</Stack>
				) : (
					<PopoverMenuList
						items={ items }
						selectedValue={ selectedValue }
						menuListTemplate={ CompactIconLibraryMenuList }
						onSelect={ ( id ) => {
							const icon = items.find( ( item ) => item.id === id );

							if ( icon ) {
								onSelect( {
									value: createIconSelectionValue( icon.library, icon.name ),
									library: icon.library,
								} );
							}
						} }
						onClose={ handleClose }
						itemHeight={ ICON_LIBRARY_ROW_HEIGHT }
						menuItemContentTemplate={ renderIconRow }
						noResultsComponent={
							searchValue.trim() === '' ? (
								<CatalogUnavailable />
							) : (
								<NoResults searchValue={ searchValue } onClear={ () => setSearchValue( '' ) } />
							)
						}
						data-testid="icon-library-list"
					/>
				) }
			</Box>
		</PopoverBody>
	);
}

function renderIconRow( item: VirtualizedItem< string, string > ) {
	const icon = item as IconLibraryItem;
	const paths = icon.paths ?? [];

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
				{ paths.length > 0 ? (
					<FontAwesomeGlyph icon={ icon } size={ ICON_GLYPH_SIZE } color="currentColor" />
				) : null }
			</Box>
			<Typography variant="caption" color="text.primary" noWrap>
				{ icon.label }
			</Typography>
		</Stack>
	);
}

function CatalogUnavailable() {
	return (
		<Stack alignItems="center" justifyContent="center" height="100%" p={ 2.5 } gap={ 1.5 }>
			<ComponentsIcon fontSize="large" />
			<Typography align="center" variant="subtitle2" color="text.secondary">
				{ __( "Icons couldn't be loaded.", 'elementor' ) }
			</Typography>
		</Stack>
	);
}

function NoResults( { searchValue, onClear }: { searchValue: string; onClear: () => void } ) {
	return (
		<Stack alignItems="center" justifyContent="center" height="100%" p={ 2.5 } gap={ 1.5 }>
			<ComponentsIcon fontSize="large" />
			<Typography align="center" variant="subtitle2" color="text.secondary">
				{ __( 'Sorry, nothing matched', 'elementor' ) }
			</Typography>
			<Typography align="center" variant="subtitle2" color="text.secondary" noWrap sx={ { maxWidth: '80%' } }>
				&ldquo;{ searchValue }&rdquo;.
			</Typography>
			<Link color="secondary" variant="caption" component="button" onClick={ onClear }>
				{ __( 'Clear & try again', 'elementor' ) }
			</Link>
		</Stack>
	);
}
