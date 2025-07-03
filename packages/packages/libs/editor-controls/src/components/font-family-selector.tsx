import * as React from 'react';
import { useEffect, useState } from 'react';
import { PopoverHeader, PopoverMenuList, PopoverScrollableContent, PopoverSearch } from '@elementor/editor-ui';
import { TextIcon } from '@elementor/icons';
import { Box, Divider, Link, Stack, Typography } from '@elementor/ui';
import { debounce } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { enqueueFont } from '../controls/font-family-control/enqueue-font';
import { type FontCategory } from '../controls/font-family-control/font-family-control';
import { type FontListItem, useFilteredFontFamilies } from '../hooks/use-filtered-font-families';

const SIZE = 'tiny';

type FontFamilySelectorProps = {
	fontFamilies: FontCategory[];
	fontFamily: string | null;
	onFontFamilyChange: ( fontFamily: string ) => void;
	onClose: () => void;
	sectionWidth: number;
};

export const FontFamilySelector = ( {
	fontFamilies,
	fontFamily,
	onFontFamilyChange,
	onClose,
	sectionWidth,
}: FontFamilySelectorProps ) => {
	const [ searchValue, setSearchValue ] = useState( '' );

	const filteredFontFamilies = useFilteredFontFamilies( fontFamilies, searchValue );

	const handleSearch = ( value: string ) => {
		setSearchValue( value );
	};

	const handleClose = () => {
		setSearchValue( '' );
		onClose();
	};

	return (
		<Stack>
			<PopoverHeader
				title={ __( 'Font Family', 'elementor' ) }
				onClose={ handleClose }
				icon={ <TextIcon fontSize={ SIZE } /> }
			/>

			<PopoverSearch
				value={ searchValue }
				onSearch={ handleSearch }
				placeholder={ __( 'Search', 'elementor' ) }
			/>

			<Divider />

			<PopoverScrollableContent width={ sectionWidth }>
				{ filteredFontFamilies.length > 0 ? (
					<FontList
						fontListItems={ filteredFontFamilies }
						setFontFamily={ onFontFamilyChange }
						handleClose={ handleClose }
						fontFamily={ fontFamily }
					/>
				) : (
					<Stack
						alignItems="center"
						justifyContent="center"
						height="100%"
						p={ 2.5 }
						gap={ 1.5 }
						overflow={ 'hidden' }
					>
						<TextIcon fontSize="large" />
						<Box sx={ { maxWidth: 160, overflow: 'hidden' } }>
							<Typography align="center" variant="subtitle2" color="text.secondary">
								{ __( 'Sorry, nothing matched', 'elementor' ) }
							</Typography>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								sx={ {
									display: 'flex',
									width: '100%',
									justifyContent: 'center',
								} }
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
			</PopoverScrollableContent>
		</Stack>
	);
};

type FontListProps = {
	fontListItems: FontListItem[];
	setFontFamily: ( fontFamily: string ) => void;
	handleClose: () => void;
	fontFamily: string | null;
};

const FontList = ( { fontListItems, setFontFamily, handleClose, fontFamily }: FontListProps ) => {
	const selectedItem = fontListItems.find( ( item ) => item.value === fontFamily );

	const debouncedVirtualizeChange = useDebounce( ( { getVirtualIndexes }: { getVirtualIndexes: () => number[] } ) => {
		getVirtualIndexes().forEach( ( index ) => {
			const item = fontListItems[ index ];
			if ( item && item.type === 'font' ) {
				enqueueFont( item.value );
			}
		} );
	}, 100 );

	return (
		<PopoverMenuList
			items={ fontListItems }
			selectedValue={ selectedItem?.value }
			onChange={ debouncedVirtualizeChange }
			onSelect={ setFontFamily }
			onClose={ handleClose }
			itemStyle={ ( item ) => ( { fontFamily: item.value } ) }
			data-testid="font-list"
		/>
	);
};

const useDebounce = < TArgs extends unknown[] >( fn: ( ...args: TArgs ) => void, delay: number ) => {
	const [ debouncedFn ] = useState( () => debounce( fn, delay ) );

	useEffect( () => () => debouncedFn.cancel(), [ debouncedFn ] );

	return debouncedFn;
};
