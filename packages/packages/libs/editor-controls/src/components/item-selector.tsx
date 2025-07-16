import * as React from 'react';
import { useEffect, useState } from 'react';
import { PopoverBody, PopoverHeader, PopoverMenuList, PopoverSearch } from '@elementor/editor-ui';
import * as Icons from '@elementor/icons';
import { Box, Divider, Link, Stack, Typography } from '@elementor/ui';
import { debounce } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { enqueueFont } from '../controls/font-family-control/enqueue-font';
import { type SelectableItem, useFilteredItemsList } from '../hooks/use-filtered-items-list';

const SIZE = 'tiny';

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
	useCustomFont?: boolean;
};

export const ItemSelector = ( {
	itemsList,
	selectedItem,
	onItemChange,
	onClose,
	sectionWidth,
	title,
}: ItemSelectorProps ) => {
	const [ searchValue, setSearchValue ] = useState( '' );

	const filteredItemsList = useFilteredItemsList( itemsList, searchValue );

	const handleSearch = ( value: string ) => {
		setSearchValue( value );
	};

	const handleClose = () => {
		setSearchValue( '' );
		onClose();
	};

	const iconNameTemp = 'TextIcon';
	const IconComponent = Icons[ iconNameTemp ];

	return (
		<PopoverBody width={ sectionWidth }>
			<PopoverHeader title={ title } onClose={ handleClose } icon={ <IconComponent fontSize={ SIZE } /> } />
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
					<Icons.TextIcon fontSize="large" />
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
};

const ItemList = ( { itemListItems, setSelectedItem, handleClose, selectedItem }: ItemListProps ) => {
	const selectedItemFound = itemListItems.find( ( item ) => item.value === selectedItem );

	const debouncedVirtualizeChange = useDebounce( ( { getVirtualIndexes }: { getVirtualIndexes: () => number[] } ) => {
		getVirtualIndexes().forEach( ( index ) => {
			const item = itemListItems[ index ];
			if ( item && item.type === 'item' ) {
				enqueueFont( item.value );
			}
		} );
	}, 100 );

	return (
		<PopoverMenuList
			items={ itemListItems }
			selectedValue={ selectedItemFound?.value }
			onChange={ debouncedVirtualizeChange }
			onSelect={ setSelectedItem }
			onClose={ handleClose }
			itemStyle={ ( item ) => ( { fontFamily: item.value } ) }
			data-testid="item-list"
		/>
	);
};

const useDebounce = < TArgs extends unknown[] >( fn: ( ...args: TArgs ) => void, delay: number ) => {
	const [ debouncedFn ] = useState( () => debounce( fn, delay ) );
	useEffect( () => () => debouncedFn.cancel(), [ debouncedFn ] );
	return debouncedFn;
};
