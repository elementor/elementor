import * as React from 'react';
import { useCallback, useState } from 'react';
import { PopoverBody, PopoverHeader, PopoverMenuList, SearchField } from '@elementor/editor-ui';
import { Box, Divider, Link, Stack, Typography } from '@elementor/ui';
import { useDebouncedCallback } from '@elementor/utils';
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
	onDebounce?: ( name: string ) => void;
	icon: React.ElementType< { fontSize: string } >;
	disabledItems?: string[];
	id?: string;
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
	disabledItems,
	id = 'item-selector',
}: ItemSelectorProps ) => {
	const [ searchValue, setSearchValue ] = useState( '' );

	const filteredItemsList = useFilteredItemsList( itemsList, searchValue, disabledItems );

	const IconComponent = icon;

	const handleSearch = ( value: string ) => {
		setSearchValue( value );
	};

	const handleClose = () => {
		setSearchValue( '' );
		onClose();
	};

	return (
		<PopoverBody width={ sectionWidth } id={ id }>
			<PopoverHeader title={ title } onClose={ handleClose } icon={ <IconComponent fontSize="tiny" /> } />
			<SearchField
				value={ searchValue }
				onSearch={ handleSearch }
				placeholder={ __( 'Search', 'elementor' ) }
				id={ id + '-search' }
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
							<Box
								component="span"
								sx={ { maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' } }
							>
								{ searchValue }
							</Box>
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
	onDebounce?: ( name: string ) => void;
	disabledItems?: string[];
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

	const debouncedVirtualizeChange = useDebouncedCallback( ( _, items: SelectableItem[] ) => {
		items.forEach( ( item ) => {
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
