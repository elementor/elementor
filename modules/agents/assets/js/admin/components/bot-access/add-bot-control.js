import { useRef, useState } from 'react';
import { ChevronDownIcon, XIcon, ZoomIcon } from '@elementor/icons';
import Button from '@elementor/ui/Button';
import CloseButton from '@elementor/ui/CloseButton';
import Divider from '@elementor/ui/Divider';
import IconButton from '@elementor/ui/IconButton';
import InputAdornment from '@elementor/ui/InputAdornment';
import MenuItem from '@elementor/ui/MenuItem';
import MenuList from '@elementor/ui/MenuList';
import Popover from '@elementor/ui/Popover';
import Stack from '@elementor/ui/Stack';
import TextField from '@elementor/ui/TextField';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { wpAdminInputResetSx } from '../wp-admin-sx';

const CONTROL_WIDTH = 248;
const FIELD_HEIGHT = 28;
const FIELD_RADIUS = '8px';
const MENU_WIDTH = 254;
const MENU_RADIUS = '16px';
const MENU_LIST_MAX_HEIGHT = 240;
const OPEN_KEYS = [ 'Enter', ' ', 'ArrowDown' ];
const MENU_ID = 'e-agents-add-bot-menu';

const matchesQuery = ( bot, query ) => {
	const normalizedQuery = query.trim().toLowerCase();

	return ! normalizedQuery ||
		bot.name.toLowerCase().includes( normalizedQuery ) ||
		bot.vendor.toLowerCase().includes( normalizedQuery );
};

export const AddBotControl = ( { options, isDisabled, onAdd } ) => {
	const anchorRef = useRef( null );
	const searchInputRef = useRef( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ query, setQuery ] = useState( '' );
	const [ selectedToken, setSelectedToken ] = useState( null );

	const selectedBot = options.find( ( bot ) => bot.token === selectedToken ) ?? null;
	const filteredOptions = options.filter( ( bot ) => matchesQuery( bot, query ) );
	const isFieldDisabled = isDisabled || ! options.length;

	const open = () => {
		if ( ! isFieldDisabled ) {
			setIsOpen( true );
		}
	};

	const close = () => {
		setIsOpen( false );
		setQuery( '' );
	};

	const select = ( token ) => {
		setSelectedToken( token );
		close();
	};

	const handleFieldKeyDown = ( event ) => {
		if ( OPEN_KEYS.includes( event.key ) ) {
			event.preventDefault();
			open();
		}
	};

	const handleClear = ( event ) => {
		event.stopPropagation();
		setSelectedToken( null );
	};

	const handleAdd = () => {
		onAdd( selectedBot.token );
		setSelectedToken( null );
	};

	return (
		<Stack direction="row" spacing={ 1 } alignItems="center" width={ CONTROL_WIDTH }>
			<Stack
				ref={ anchorRef }
				role="combobox"
				tabIndex={ isFieldDisabled ? -1 : 0 }
				aria-label={ __( 'Select bot', 'elementor' ) }
				aria-haspopup="listbox"
				aria-expanded={ isOpen }
				aria-controls={ isOpen ? MENU_ID : undefined }
				aria-disabled={ isFieldDisabled }
				onClick={ open }
				onKeyDown={ handleFieldKeyDown }
				direction="row"
				alignItems="center"
				spacing={ 0.5 }
				flex={ 1 }
				minWidth={ 0 }
				height={ FIELD_HEIGHT }
				pl={ 1.5 }
				pr={ 1 }
				border={ 1 }
				borderColor={ isOpen ? 'text.primary' : 'divider' }
				borderRadius={ FIELD_RADIUS }
				bgcolor={ isFieldDisabled ? 'action.disabledBackground' : 'background.paper' }
				sx={ {
					cursor: isFieldDisabled ? 'default' : 'pointer',
					'&:hover': ! isFieldDisabled && { borderColor: 'text.primary' },
					'&:focus-visible': { outline: 'none', borderColor: 'text.primary' },
				} }
			>
				<Typography
					variant="caption"
					color={ selectedBot && ! isFieldDisabled ? 'text.primary' : 'text.disabled' }
					flexGrow={ 1 }
					noWrap
				>
					{ selectedBot ? selectedBot.name : __( 'Add bot rule', 'elementor' ) }
				</Typography>
				{ selectedBot && ! isFieldDisabled && (
					<IconButton size="small" aria-label={ __( 'Clear', 'elementor' ) } onClick={ handleClear }>
						<XIcon fontSize="tiny" />
					</IconButton>
				) }
				<ChevronDownIcon fontSize="tiny" color={ isFieldDisabled ? 'disabled' : 'action' } />
			</Stack>
			<Button
				size="small"
				variant="contained"
				color="secondary"
				disabled={ isFieldDisabled || ! selectedBot }
				onClick={ handleAdd }
			>
				{ __( 'Add', 'elementor' ) }
			</Button>
			<Popover
				open={ isOpen }
				anchorEl={ anchorRef.current }
				onClose={ close }
				TransitionProps={ { onEntered: () => searchInputRef.current?.focus() } }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
				transformOrigin={ { vertical: 'top', horizontal: 'left' } }
				slotProps={ { paper: { sx: { width: MENU_WIDTH, borderRadius: MENU_RADIUS, mt: 0.5 } } } }
			>
				<Stack direction="row" alignItems="center" pl={ 2 } pr={ 1 } py={ 1 }>
					<Typography variant="subtitle2" flexGrow={ 1 }>
						{ __( 'Customize a bot\'s access', 'elementor' ) }
					</Typography>
					<CloseButton aria-label={ __( 'Close', 'elementor' ) } slotProps={ { icon: { fontSize: 'tiny' } } } onClick={ close } />
				</Stack>
				<Stack px={ 2 } pb={ 1.5 }>
					<TextField
						inputRef={ searchInputRef }
						fullWidth
						size="tiny"
						value={ query }
						onChange={ ( event ) => setQuery( event.target.value ) }
						placeholder={ __( 'Search', 'elementor' ) }
						inputProps={ { 'aria-label': __( 'Search bots', 'elementor' ) } }
						InputProps={ {
							startAdornment: (
								<InputAdornment position="start">
									<ZoomIcon fontSize="tiny" />
								</InputAdornment>
							),
							sx: { borderRadius: FIELD_RADIUS },
						} }
						sx={ wpAdminInputResetSx }
					/>
				</Stack>
				<Divider />
				<MenuList id={ MENU_ID } role="listbox" dense sx={ { maxHeight: MENU_LIST_MAX_HEIGHT, overflowY: 'auto' } }>
					{ filteredOptions.map( ( bot ) => (
						<MenuItem
							key={ bot.token }
							role="option"
							dense
							selected={ bot.token === selectedToken }
							aria-selected={ bot.token === selectedToken }
							onClick={ () => select( bot.token ) }
						>
							<Typography variant="caption" color="text.primary" noWrap>
								<Typography component="span" variant="inherit" fontWeight="fontWeightBold">{ bot.name }</Typography>
								{ ' ' }
								<Typography component="span" variant="inherit" color="text.secondary">{ bot.vendor }</Typography>
							</Typography>
						</MenuItem>
					) ) }
				</MenuList>
				{ ! filteredOptions.length && (
					<Typography variant="caption" color="text.secondary" component="p" px={ 2 } pb={ 1.5 }>
						{ __( 'No bots found', 'elementor' ) }
					</Typography>
				) }
			</Popover>
		</Stack>
	);
};

AddBotControl.propTypes = {
	options: PropTypes.arrayOf( PropTypes.shape( {
		token: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		vendor: PropTypes.string.isRequired,
	} ) ).isRequired,
	isDisabled: PropTypes.bool.isRequired,
	onAdd: PropTypes.func.isRequired,
};
