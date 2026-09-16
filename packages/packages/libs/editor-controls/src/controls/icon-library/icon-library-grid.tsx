import * as React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { Box, Tooltip, useTheme } from '@elementor/ui';
import { useVirtualizer } from '@tanstack/react-virtual';

import { type FontAwesome7Icon } from './font-awesome-7-catalog';
import { FontAwesomeGlyph } from './font-awesome-glyph';

export const ICON_LIBRARY_GRID_COLUMNS = 4;
export const ICON_LIBRARY_GRID_MIN_CELL_SIZE = 52;
export const ICON_LIBRARY_GRID_TOOLTIP_ENTER_DELAY = 1000;

const ICON_GLYPH_SIZE = 20;
const GRID_OVERSCAN = 6;
const GRID_COLUMN_GAP = 1;
const GRID_HORIZONTAL_PADDING = 1;
const HOME_END_KEYS = new Set( [ 'Home', 'End' ] );

const getGridMetrics = ( containerWidth: number, columnGap: number, inlinePadding: number ) => {
	const availableWidth = containerWidth - inlinePadding;

	if ( availableWidth <= 0 ) {
		return {
			columnCount: ICON_LIBRARY_GRID_COLUMNS,
			cellSize: ICON_LIBRARY_GRID_MIN_CELL_SIZE,
		};
	}

	const columnCount = Math.max(
		1,
		Math.floor( ( availableWidth + columnGap ) / ( ICON_LIBRARY_GRID_MIN_CELL_SIZE + columnGap ) )
	);
	const cellSize = Math.floor( ( availableWidth - columnGap * ( columnCount - 1 ) ) / columnCount );

	return {
		columnCount,
		cellSize: Math.max( cellSize, 1 ),
	};
};

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
	const theme = useTheme();
	const containerRef = useRef< HTMLDivElement >( null );
	const cellRefs = useRef( new Map< string, HTMLButtonElement >() );
	const shouldRestoreFocusRef = useRef( false );
	const selectedIndex = items.findIndex( ( item ) => item.id === selectedValue );
	const [ focusedIndex, setFocusedIndex ] = useState( selectedIndex >= 0 ? selectedIndex : 0 );
	const [ { columnCount, cellSize }, setGridMetrics ] = useState( () => getGridMetrics( 0, 0, 0 ) );
	const rowCount = Math.ceil( items.length / columnCount );
	const virtualizer = useVirtualizer( {
		count: rowCount,
		getScrollElement: () => containerRef.current,
		estimateSize: () => cellSize,
		overscan: GRID_OVERSCAN,
	} );
	const focusedItem = items[ focusedIndex ];

	useLayoutEffect( () => {
		setFocusedIndex( ( current ) => {
			if ( items.length === 0 ) {
				return 0;
			}

			if ( selectedIndex >= 0 ) {
				return selectedIndex;
			}

			return Math.min( current, items.length - 1 );
		} );

		if ( selectedIndex >= 0 ) {
			virtualizer.scrollToIndex( Math.floor( selectedIndex / columnCount ) );
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

	useLayoutEffect( () => {
		const container = containerRef.current;

		if ( ! container ) {
			return;
		}

		const measureGrid = () => {
			const columnGap = Number.parseFloat( theme.spacing( GRID_COLUMN_GAP ) );
			const inlinePadding = Number.parseFloat( theme.spacing( GRID_HORIZONTAL_PADDING ) ) * 2;
			setGridMetrics( getGridMetrics( container.clientWidth, columnGap, inlinePadding ) );
		};

		measureGrid();
		const resizeObserver = new ResizeObserver( measureGrid );
		resizeObserver.observe( container );

		return () => {
			resizeObserver.disconnect();
		};
	}, [ theme ] );

	useLayoutEffect( () => {
		virtualizer.measure();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ cellSize, columnCount ] );

	if ( items.length === 0 && noResultsComponent ) {
		return noResultsComponent;
	}

	const moveFocus = ( nextIndex: number ) => {
		if ( nextIndex < 0 || nextIndex >= items.length ) {
			return;
		}

		shouldRestoreFocusRef.current = true;
		setFocusedIndex( nextIndex );
		virtualizer.scrollToIndex( Math.floor( nextIndex / columnCount ) );
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
			moveFocus( index + columnCount );
			return;
		}

		if ( event.key === 'ArrowUp' ) {
			event.preventDefault();
			moveFocus( index - columnCount );
			return;
		}

		if ( HOME_END_KEYS.has( event.key ) ) {
			event.preventDefault();

			if ( event.ctrlKey ) {
				moveFocus( event.key === 'Home' ? 0 : items.length - 1 );
				return;
			}

			const rowStart = Math.floor( index / columnCount ) * columnCount;
			const rowEnd = Math.min( rowStart + columnCount - 1, items.length - 1 );

			moveFocus( event.key === 'Home' ? rowStart : rowEnd );
		}
	};

	return (
		<Box
			ref={ containerRef }
			sx={ {
				width: '100%',
				height: '100%',
				minWidth: 0,
				overflowX: 'hidden',
				overflowY: 'auto',
			} }
		>
			<Box
				role="grid"
				aria-rowcount={ rowCount }
				aria-colcount={ columnCount }
				data-testid="icon-library-grid"
				sx={ {
					width: '100%',
					minWidth: 0,
					height: virtualizer.getTotalSize(),
					position: 'relative',
				} }
			>
				{ virtualizer.getVirtualItems().map( ( virtualRow ) => {
					const startIndex = virtualRow.index * columnCount;
					const rowItems = items.slice( startIndex, startIndex + columnCount );

					return (
						<Box
							key={ virtualRow.key }
							role="row"
							aria-rowindex={ virtualRow.index + 1 }
							sx={ {
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: virtualRow.size,
								transform: `translateY(${ virtualRow.start }px)`,
								display: 'grid',
								gridTemplateColumns: `repeat(${ columnCount }, minmax(0, 1fr))`,
								gap: GRID_COLUMN_GAP,
								px: GRID_HORIZONTAL_PADDING,
								boxSizing: 'border-box',
							} }
						>
							{ rowItems.map( ( item, columnIndex ) => {
								const index = startIndex + columnIndex;
								const isSelected = selectedValue === item.id;
								const tabIndex = focusedIndex === index ? 0 : -1;

								return (
									<Box
										key={ item.id }
										sx={ { minWidth: 0, minHeight: 0, width: '100%', height: '100%' } }
									>
										<Tooltip
											title={ item.label }
											placement="top"
											enterDelay={ ICON_LIBRARY_GRID_TOOLTIP_ENTER_DELAY }
											enterNextDelay={ ICON_LIBRARY_GRID_TOOLTIP_ENTER_DELAY }
											disableInteractive
										>
											<Box
												component="button"
												type="button"
												role="gridcell"
												aria-colindex={ columnIndex + 1 }
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
												onFocus={ () => setFocusedIndex( index ) }
												onKeyDown={ ( event: React.KeyboardEvent< HTMLButtonElement > ) =>
													handleKeyDown( event, index )
												}
												sx={ {
													boxSizing: 'border-box',
													appearance: 'none',
													m: 0,
													width: '100%',
													height: '100%',
													minWidth: 0,
													minHeight: 0,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													border: '1px solid',
													borderColor: 'divider',
													borderRadius: 1,
													color: 'text.tertiary',
													bgcolor: 'transparent',
													p: 0,
													cursor: 'pointer',
													font: 'inherit',
													lineHeight: 0,
													overflow: 'hidden',
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
									</Box>
								);
							} ) }
						</Box>
					);
				} ) }
			</Box>
		</Box>
	);
};
