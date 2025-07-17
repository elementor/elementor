import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { PopoverBody, PopoverHeader, PopoverMenuList, PopoverSearch } from '@elementor/editor-ui';
import { Box, Divider, Link, Stack, Typography } from '@elementor/ui';
import { debounce } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { type SelectableItem, useFilteredItemsList } from '../hooks/use-filtered-items-list';

export type Category = {
	label: string;
	items: string[];
};

type ItemSelectorProps = {
	itemsList: Category[];
	selectedItem: string | null;
	onItemChange: ( item: string ) => void;
	onClose: () => void;
	sectionWidth: number;
	title: string;
	itemStyle?: ( item: SelectableItem ) => React.CSSProperties;
	onDebounce?: ( fontName: string ) => void;
	icon: React.ElementType< { fontSize: string } >;
};

export const ItemSelector = ( {
	itemsList,
	selectedItem,
	onItemChange,
	onClose,
	sectionWidth,
	title,
	itemStyle = () => ( {} ),
	onDebounce = () => {},
	icon,
}: ItemSelectorProps ) => {
	const [ searchValue, setSearchValue ] = useState( '' );

	const filteredItemsList = useFilteredItemsList( itemsList, searchValue );

	const IconComponent = icon;

	const handleSearch = ( value: string ) => {
		setSearchValue( value );
	};

	const handleClose = () => {
		setSearchValue( '' );
		onClose();
	};

	return (
		<PopoverBody width={ sectionWidth }>
			<PopoverHeader title={ title } onClose={ handleClose } icon={ <IconComponent fontSize="tiny" /> } />
			<PopoverSearch
				value={ searchValue }
				onSearch={ handleSearch }
				placeholder={ __( 'Search', 'elementor' ) }
			/>

			<Divider />

			{ filteredItemsList.length > 0 ? (
				<ItemList
					itemListItems={ filteredItemsList }
					setSelectedItem={ onItemChange }
					handleClose={ handleClose }
					selectedItem={ selectedItem }
					itemStyle={ itemStyle }
					onDebounce={ onDebounce }
				/>
			) : (
				<Stack
					alignItems="center"
					justifyContent="center"
					height="100%"
					p={ 2.5 }
					gap={ 1.5 }
					overflow="hidden"
				>
					<IconComponent fontSize="large" />
					<Box sx={ { maxWidth: 160, overflow: 'hidden' } }>
						<Typography align="center" variant="subtitle2" color="text.secondary">
							{ __( 'Sorry, nothing matched', 'elementor' ) }
						</Typography>
						<Typography
							variant="subtitle2"
							color="text.secondary"
							sx={ { display: 'flex', width: '100%', justifyContent: 'center' } }
						>
							<span>&ldquo;</span>
							<span style={ { maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' } }>
								{ searchValue }
							</span>
							<span>&rdquo;.</span>
						</Typography>
					</Box>
					<Typography
						align="center"
						variant="caption"
						color="text.secondary"
						sx={ { display: 'flex', flexDirection: 'column' } }
					>
						{ __( 'Try something else.', 'elementor' ) }
						<Link
							color="secondary"
							variant="caption"
							component="button"
							onClick={ () => setSearchValue( '' ) }
						>
							{ __( 'Clear & try again', 'elementor' ) }
						</Link>
					</Typography>
				</Stack>
			) }
		</PopoverBody>
	);
};

type ItemListProps = {
	itemListItems: SelectableItem[];
	setSelectedItem: ( item: string ) => void;
	handleClose: () => void;
	selectedItem: string | null;
	itemStyle?: ( item: SelectableItem ) => React.CSSProperties;
	onDebounce?: ( fontName: string ) => void;
};

const ItemList = ( {
	itemListItems,
	setSelectedItem,
	handleClose,
	selectedItem,
	itemStyle = () => ( {} ),
	onDebounce = () => {},
}: ItemListProps ) => {
	const selectedItemFound = itemListItems.find( ( item ) => item.value === selectedItem );

	const debouncedVirtualizeChange = useDebounce( ( { getVirtualIndexes }: { getVirtualIndexes: () => number[] } ) => {
		getVirtualIndexes().forEach( ( index ) => {
			const item = itemListItems[ index ];
			if ( item && item.type === 'item' ) {
				onDebounce( item.value );
			}
		} );
	}, 100 );

	const memoizedItemStyle = useCallback( ( item: SelectableItem ) => itemStyle( item ), [ itemStyle ] );

	return (
		<PopoverMenuList
			items={ itemListItems }
			selectedValue={ selectedItemFound?.value }
			onChange={ debouncedVirtualizeChange }
			onSelect={ setSelectedItem }
			onClose={ handleClose }
			itemStyle={ memoizedItemStyle }
			data-testid="item-list"
		/>
	);
};

const useDebounce = < TArgs extends unknown[] >( fn: ( ...args: TArgs ) => void, delay: number ) => {
	const [ debouncedFn ] = useState( () => debounce( fn, delay ) );
	useEffect( () => () => debouncedFn.cancel(), [ debouncedFn ] );
	return debouncedFn;
};
