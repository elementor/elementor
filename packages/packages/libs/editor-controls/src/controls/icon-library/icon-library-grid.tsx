import * as React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { Box, Stack, Tooltip } from '@elementor/ui';
import { useVirtualizer } from '@tanstack/react-virtual';

import { type FontAwesome7Icon } from './font-awesome-7-catalog';
import { FontAwesomeGlyph } from './font-awesome-glyph';

export const ICON_LIBRARY_GRID_COLUMNS = 4;
export const ICON_LIBRARY_GRID_ROW_HEIGHT = 60;
export const ICON_LIBRARY_GRID_CELL_WIDTH = 53;
export const ICON_LIBRARY_GRID_CELL_HEIGHT = 52;
export const ICON_LIBRARY_GRID_TOOLTIP_ENTER_DELAY = 1000;

const ICON_GLYPH_SIZE = 20;
const GRID_OVERSCAN = 6;
const GRID_COLUMN_GAP = 1;
const GRID_HORIZONTAL_PADDING = 2;
const GRID_VERTICAL_PADDING = 0.5;
const HOME_END_KEYS = new Set( [ 'Home', 'End' ] );

type IconLibraryGridItem = FontAwesome7Icon & {
	id: string;
	value: string;
};

type IconLibraryGridProps = {
	items: IconLibraryGridItem[];
	selectedValue?: string;
	onSelect: ( id: string ) => void;
	onClose: () => void;
	noResultsComponent?: React.ReactNode;
};

export const IconLibraryGrid = ( {
	items,
	selectedValue,
	onSelect,
	onClose,
	noResultsComponent,
}: IconLibraryGridProps ) => {
	const containerRef = useRef< HTMLDivElement >( null );
	const cellRefs = useRef( new Map< string, HTMLButtonElement >() );
	const shouldRestoreFocusRef = useRef( false );
	const selectedIndex = items.findIndex( ( item ) => item.id === selectedValue );
	const [ focusedIndex, setFocusedIndex ] = useState( selectedIndex >= 0 ? selectedIndex : 0 );
	const rowCount = Math.ceil( items.length / ICON_LIBRARY_GRID_COLUMNS );
	const virtualizer = useVirtualizer( {
		count: rowCount,
		getScrollElement: () => containerRef.current,
		estimateSize: () => ICON_LIBRARY_GRID_ROW_HEIGHT,
		overscan: GRID_OVERSCAN,
	} );
	const focusedItem = items[ focusedIndex ];

	useLayoutEffect( () => {
		if ( selectedIndex >= 0 ) {
			setFocusedIndex( selectedIndex );
			virtualizer.scrollToIndex( Math.floor( selectedIndex / ICON_LIBRARY_GRID_COLUMNS ) );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ selectedValue, items ] );

	useLayoutEffect( () => {
		if ( ! shouldRestoreFocusRef.current || ! focusedItem ) {
			return;
		}

		const cell = cellRefs.current.get( focusedItem.id );

		if ( ! cell ) {
			return;
		}

		cell.focus();
		shouldRestoreFocusRef.current = false;
	} );

	if ( items.length === 0 && noResultsComponent ) {
		return noResultsComponent;
	}

	const moveFocus = ( nextIndex: number ) => {
		if ( nextIndex < 0 || nextIndex >= items.length ) {
			return;
		}

		shouldRestoreFocusRef.current = true;
		setFocusedIndex( nextIndex );
		virtualizer.scrollToIndex( Math.floor( nextIndex / ICON_LIBRARY_GRID_COLUMNS ) );
	};

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLButtonElement >, index: number ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			onSelect( items[ index ].id );
			onClose();
			return;
		}

		if ( event.key === 'ArrowRight' ) {
			event.preventDefault();
			moveFocus( index + 1 );
			return;
		}

		if ( event.key === 'ArrowLeft' ) {
			event.preventDefault();
			moveFocus( index - 1 );
			return;
		}

		if ( event.key === 'ArrowDown' ) {
			event.preventDefault();
			moveFocus( index + ICON_LIBRARY_GRID_COLUMNS );
			return;
		}

		if ( event.key === 'ArrowUp' ) {
			event.preventDefault();
			moveFocus( index - ICON_LIBRARY_GRID_COLUMNS );
			return;
		}

		if ( HOME_END_KEYS.has( event.key ) ) {
			event.preventDefault();

			if ( event.ctrlKey ) {
				moveFocus( event.key === 'Home' ? 0 : items.length - 1 );
				return;
			}

			const rowStart = Math.floor( index / ICON_LIBRARY_GRID_COLUMNS ) * ICON_LIBRARY_GRID_COLUMNS;
			const rowEnd = Math.min( rowStart + ICON_LIBRARY_GRID_COLUMNS - 1, items.length - 1 );

			moveFocus( event.key === 'Home' ? rowStart : rowEnd );
		}
	};

	return (
		<Box ref={ containerRef } sx={ { height: '100%', overflowY: 'auto' } }>
			<Box
				role="grid"
				aria-rowcount={ rowCount }
				data-testid="icon-library-grid"
				sx={ {
					height: virtualizer.getTotalSize(),
					position: 'relative',
					px: GRID_HORIZONTAL_PADDING,
					py: GRID_VERTICAL_PADDING,
				} }
			>
				{ virtualizer.getVirtualItems().map( ( virtualRow ) => {
					const startIndex = virtualRow.index * ICON_LIBRARY_GRID_COLUMNS;
					const rowItems = items.slice( startIndex, startIndex + ICON_LIBRARY_GRID_COLUMNS );

					return (
						<Stack
							key={ virtualRow.key }
							role="row"
							direction="row"
							gap={ GRID_COLUMN_GAP }
							sx={ {
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								height: virtualRow.size,
								transform: `translateY(${ virtualRow.start }px)`,
							} }
						>
							{ rowItems.map( ( item, columnIndex ) => {
								const index = startIndex + columnIndex;
								const isSelected = selectedValue === item.id;
								const tabIndex = focusedIndex === index ? 0 : -1;

								return (
									<Tooltip
										key={ item.id }
										title={ item.label }
										placement="top"
										enterDelay={ ICON_LIBRARY_GRID_TOOLTIP_ENTER_DELAY }
										enterNextDelay={ ICON_LIBRARY_GRID_TOOLTIP_ENTER_DELAY }
									>
										<Box
											component="button"
											type="button"
											role="gridcell"
											aria-label={ item.label }
											aria-selected={ isSelected }
											tabIndex={ tabIndex }
											ref={ ( node: HTMLButtonElement | null ) => {
												if ( node ) {
													cellRefs.current.set( item.id, node );
												} else {
													cellRefs.current.delete( item.id );
												}
											} }
											onClick={ () => {
												onSelect( item.id );
												onClose();
											} }
											onKeyDown={ ( event: React.KeyboardEvent< HTMLButtonElement > ) =>
												handleKeyDown( event, index )
											}
											sx={ {
												width: ICON_LIBRARY_GRID_CELL_WIDTH,
												height: ICON_LIBRARY_GRID_CELL_HEIGHT,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												border: 1,
												borderColor: 'divider',
												borderRadius: 1,
												color: 'text.tertiary',
												bgcolor: 'transparent',
												p: 0,
												cursor: 'pointer',
												flexShrink: 0,
												'&:hover, &:focus': {
													bgcolor: 'action.hover',
												},
												'&[aria-selected="true"]': {
													bgcolor: 'action.selected',
												},
												'&[aria-selected="true"]:hover, &[aria-selected="true"]:focus': {
													bgcolor: 'action.selected',
												},
											} }
										>
											{ item.paths.length > 0 ? (
												<FontAwesomeGlyph
													icon={ item }
													size={ ICON_GLYPH_SIZE }
													color="currentColor"
												/>
											) : null }
										</Box>
									</Tooltip>
								);
							} ) }
						</Stack>
					);
				} ) }
			</Box>
		</Box>
	);
};
