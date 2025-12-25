import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Box, ListItem, MenuList, MenuSubheader, styled } from '@elementor/ui';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useScrollTop, useScrollToSelected } from '../../hooks';

export type VirtualizedItem< T, V extends string > = {
	type: T;
	value: V;
	disabled?: boolean;
	label?: string;
	icon?: React.ReactNode;
	secondaryText?: string;
	[ key: string ]: unknown;
};

export type PopoverMenuListProps< T, V extends string > = {
	items: VirtualizedItem< T, V >[];
	onSelect: ( value: V ) => void;
	onClose: () => void;
	selectedValue?: V;
	itemStyle?: ( item: VirtualizedItem< T, V > ) => React.CSSProperties;
	'data-testid'?: string;
	onChange?: ( params: { getVirtualIndexes: () => number[] }, items: VirtualizedItem< T, V >[] ) => void;
	menuListTemplate?: React.ComponentType< React.ComponentProps< typeof MenuList > >;
	menuItemContentTemplate?: ( item: VirtualizedItem< T, V > ) => React.ReactNode;
	noResultsComponent?: React.ReactNode;
};

export const ITEM_HEIGHT = 32;
const LIST_ITEMS_BUFFER = 6;
const MENU_LIST_PADDING_TOP = 8;

const menuSubHeaderAbsoluteStyling = ( start: number ) => ( {
	position: 'absolute',
	transform: `translateY(${ start + MENU_LIST_PADDING_TOP }px)`,
} );

const getAdjacentStickyIndices = (
	stickyIndices: number[],
	range: { startIndex: number; endIndex: number }
): number[] => {
	const previousTwoStickyIndices = stickyIndices
		.filter( ( stickyIndex ) => stickyIndex < range.startIndex )
		.slice( -2 );

	const nextTwoStickyIndices = stickyIndices.filter( ( stickyIndex ) => stickyIndex > range.endIndex ).slice( 0, 2 );

	return [ ...previousTwoStickyIndices, ...nextTwoStickyIndices ];
};

export const PopoverMenuList = < T, V extends string >( {
	items,
	onSelect,
	onClose,
	selectedValue,
	itemStyle,
	onChange,
	'data-testid': dataTestId,
	menuItemContentTemplate,
	noResultsComponent,
	menuListTemplate: CustomMenuList,
}: PopoverMenuListProps< T, V > ) => {
	const containerRef = useRef< HTMLDivElement >( null );
	const scrollTop = useScrollTop( { containerRef } );

	const MenuListComponent = CustomMenuList || MenuList;

	const stickyIndices = useMemo(
		() =>
			items.reduce( ( categoryIndices, item, index ) => {
				if ( item.type === 'category' ) {
					categoryIndices.push( index );
				}
				return categoryIndices;
			}, [] as number[] ),
		[ items ]
	);

	const getActiveItemIndices = ( range: { startIndex: number; endIndex: number } ) => {
		const visibleAndStickyIndexes: number[] = [];

		for ( let i = range.startIndex; i <= range.endIndex; i++ ) {
			visibleAndStickyIndexes.push( i );
		}

		const stickyIndicesToShow = getAdjacentStickyIndices( stickyIndices, range );

		stickyIndicesToShow.forEach( ( stickyIndex ) => {
			if ( ! visibleAndStickyIndexes.includes( stickyIndex ) ) {
				visibleAndStickyIndexes.push( stickyIndex );
			}
		} );

		return visibleAndStickyIndexes.sort( ( a, b ) => a - b );
	};

	const virtualizer = useVirtualizer( {
		count: items.length,
		getScrollElement: () => containerRef.current,
		estimateSize: () => ITEM_HEIGHT,
		overscan: LIST_ITEMS_BUFFER,
		rangeExtractor: getActiveItemIndices,
		onChange: onChange ? ( virtualizerInstance ) => onChange( virtualizerInstance, items ) : undefined,
	} );

	useScrollToSelected( { selectedValue, items, virtualizer } );
	const virtualItems = virtualizer.getVirtualItems();

	useEffect( () => {
		if ( ! onChange || items.length === 0 ) {
			return;
		}

		onChange( virtualizer, items );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ items ] );

	return (
		<Box ref={ containerRef } sx={ { height: '100%', overflowY: 'auto' } }>
			{ items.length === 0 && noResultsComponent ? (
				noResultsComponent
			) : (
				<MenuListComponent
					role="listbox"
					style={ { height: `${ virtualizer.getTotalSize() }px` } }
					data-testid={ dataTestId }
				>
					{ virtualItems.map( ( virtualRow ) => {
						const item = items[ virtualRow.index ];

						if ( ! item ) {
							return null;
						}

						if ( item.type === 'category' ) {
							const shouldStick = virtualRow.start + MENU_LIST_PADDING_TOP <= scrollTop;
							return (
								<MenuSubheader
									key={ virtualRow.key }
									style={ shouldStick ? {} : menuSubHeaderAbsoluteStyling( virtualRow.start ) }
									sx={ { fontWeight: '400', color: 'text.tertiary' } }
								>
									{ item.label || item.value }
								</MenuSubheader>
							);
						}

						const isLast = virtualRow.index === items.length - 1;
						const isFirst =
							items[ 0 ]?.type === 'category' ? virtualRow.index === 1 : virtualRow.index === 0;
						const isSelected = selectedValue === item.value;
						const tabIndexFallback = ! selectedValue ? 0 : -1;
						const isDisabled = item.disabled;

						return (
							<StyledMenuItem
								key={ virtualRow.key }
								role="option"
								aria-selected={ isSelected }
								aria-disabled={ isDisabled }
								onClick={
									isDisabled
										? undefined
										: ( e: React.MouseEvent< HTMLLIElement > ) => {
												if ( ( e.target as HTMLElement ).closest( 'button' ) ) {
													return;
												}
												onSelect( item.value );
												onClose();
										  }
								}
								onKeyDown={ ( event: React.KeyboardEvent< HTMLLIElement > ) => {
									if ( event.key === 'Enter' && ! isDisabled ) {
										onSelect( item.value );
										onClose();
									}

									if ( event.key === 'ArrowDown' && isLast ) {
										event.preventDefault();
										event.stopPropagation();
									}

									if ( event.key === 'ArrowUp' && isFirst ) {
										event.preventDefault();
										event.stopPropagation();
									}
								} }
								tabIndex={ isSelected ? 0 : tabIndexFallback }
								sx={ {
									transform: `translateY(${ virtualRow.start + MENU_LIST_PADDING_TOP }px)`,
									...( itemStyle ? itemStyle( item ) : {} ),
								} }
							>
								{ menuItemContentTemplate ? menuItemContentTemplate( item ) : item.label || item.value }
							</StyledMenuItem>
						);
					} ) }
				</MenuListComponent>
			) }
		</Box>
	);
};

const StyledMenuItem = styled( ListItem )( ( { theme } ) => ( {
	height: ITEM_HEIGHT,
	width: '100%',
	display: 'flex',
	alignItems: 'center',
	...theme.typography.caption,
	lineHeight: 'inherit',
	padding: theme.spacing( 0.75, 2, 0.75, 4 ),
	'&:hover, &:focus': {
		backgroundColor: theme.palette.action.hover,
	},
	'&[aria-selected="true"]': {
		backgroundColor: theme.palette.action.selected,
	},
	'&[aria-disabled="true"]': {
		color: theme.palette.text.disabled,
	},
	cursor: 'pointer',
	textOverflow: 'ellipsis',
	position: 'absolute',
	top: 0,
	left: 0,
} ) );
