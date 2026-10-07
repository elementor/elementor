import { useState } from 'react';
import { FileIcon } from '@elementor/icons';
import Autocomplete from '@elementor/ui/Autocomplete';
import Box from '@elementor/ui/Box';
import CircularProgress from '@elementor/ui/CircularProgress';
import Stack from '@elementor/ui/Stack';
import TextField from '@elementor/ui/TextField';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { useMarkdownItems } from '../../hooks/use-markdown-items';
import { wpAdminInputResetSx } from '../wp-admin-sx';

const PAGE_FIELD_WIDTH = 177;
const PAGE_FIELD_RADIUS = '8px';
const PAGE_MENU_WIDTH = 254;
const PAGE_MENU_HEIGHT = 324;
const PAGE_MENU_RADIUS = '16px';
const EMPTY_STATE_WIDTH = 170;
const SEARCH_PROGRESS_SIZE = 20;
const USER_INPUT_REASON = 'input';

const itemShape = PropTypes.shape( {
	id: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
} );

const withSelectedItem = ( items, selectedItem ) => {
	if ( ! selectedItem || items.some( ( item ) => item.id === selectedItem.id ) ) {
		return items;
	}

	return [ selectedItem, ...items ];
};

const EmptyState = ( { query } ) => (
	<Stack alignItems="center" spacing={ 1 } py={ 4 } px={ 2 }>
		<FileIcon color="action" fontSize="large" />
		<Typography variant="subtitle2" color="text.secondary" align="center" width={ EMPTY_STATE_WIDTH }>
			{ __( 'Sorry, nothing matched', 'elementor' ) }
			<br />
			{ sprintf(
				/* Translators: %s: the search text. */
				__( '“%s“.', 'elementor' ),
				query,
			) }
		</Typography>
	</Stack>
);

EmptyState.propTypes = {
	query: PropTypes.string.isRequired,
};

export const PagePicker = ( { items, selectedItem, onSelect, disabled = false } ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ query, setQuery ] = useState( '' );

	const hasQuery = '' !== query.trim();
	const { items: searchResults, isLoading } = useMarkdownItems( { term: query, isPaused: ! isOpen || ! hasQuery } );
	const isSearching = hasQuery && isLoading;
	const visibleItems = hasQuery ? searchResults : items;

	const close = () => {
		setIsOpen( false );
		setQuery( '' );
	};

	const updateQuery = ( event, value, reason ) => {
		if ( USER_INPUT_REASON === reason ) {
			setQuery( value );
		}
	};

	return (
		<Autocomplete
			size="tiny"
			disabled={ disabled }
			disableClearable
			open={ isOpen }
			onOpen={ () => setIsOpen( true ) }
			onClose={ close }
			value={ selectedItem ?? null }
			options={ withSelectedItem( visibleItems, selectedItem ) }
			onChange={ ( event, item ) => item && onSelect( item ) }
			onInputChange={ updateQuery }
			filterOptions={ () => ( isSearching ? [] : visibleItems ) }
			getOptionLabel={ ( item ) => item.title }
			isOptionEqualToValue={ ( option, value ) => option.id === value.id }
			loading={ isSearching }
			loadingText={
				<Stack alignItems="center" py={ 4 }>
					<CircularProgress size={ SEARCH_PROGRESS_SIZE } aria-label={ __( 'Searching pages', 'elementor' ) } />
				</Stack>
			}
			noOptionsText={ <EmptyState query={ query } /> }
			renderOption={ ( optionProps, item ) => (
				<Box component="li" { ...optionProps } key={ item.id }>
					<Typography variant="body2" noWrap minWidth={ 0 }>{ item.title }</Typography>
				</Box>
			) }
			ListboxProps={ { sx: { maxHeight: PAGE_MENU_HEIGHT } } }
			slotProps={ {
				popper: { placement: 'bottom-start', style: { width: PAGE_MENU_WIDTH } },
				paper: { sx: { borderRadius: PAGE_MENU_RADIUS } },
			} }
			sx={ { width: PAGE_FIELD_WIDTH } }
			renderInput={ ( params ) => (
				<TextField
					{ ...params }
					placeholder={ __( 'Select a page', 'elementor' ) }
					sx={ wpAdminInputResetSx }
					InputProps={ { ...params.InputProps, sx: { borderRadius: PAGE_FIELD_RADIUS } } }
					inputProps={ { ...params.inputProps, 'aria-label': __( 'Select a page', 'elementor' ) } }
				/>
			) }
		/>
	);
};

PagePicker.propTypes = {
	items: PropTypes.arrayOf( itemShape ).isRequired,
	selectedItem: itemShape,
	onSelect: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};
