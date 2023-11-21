import { useRef, useState } from 'react';
import { IconButton, Popover, Stack, useTheme } from '@elementor/ui';
import { MenuItem } from './menu-item';
import XCircleIcon from '../../../../icons/x-circle-icon';
import PlusCircleIcon from '../../../../icons/plus-circle-icon';
import PropTypes from 'prop-types';
import { AttachDialog } from './attach-dialog';

export const Menu = ( props ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ selectedType, setSelectedType ] = useState( null );
	const { direction } = useTheme();
	const anchorRef = useRef( null );

	return (
		<>
			<IconButton
				size="medium"
				ref={ anchorRef }
				disabled={ props.disabled }
				onClick={ () => setIsOpen( true ) }
				color="secondary"
				variant="text"
				sx={ {
					width: 20,
					minWidth: 20,
				} }
			>
				{ isOpen ? <XCircleIcon /> : <PlusCircleIcon /> }
			</IconButton>

			<Popover
				open={ isOpen }
				anchorEl={ anchorRef.current }
				onClose={ () => setIsOpen( false ) }
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'rtl' === direction ? 'right' : 'left',
				} }
			>
				<Stack spacing={ 2 } sx={ {
					width: 440,
				} }>
					{ props.items.map( ( item ) => (
						<MenuItem
							key={ item.type }
							title={ item.title }
							icon={ item.icon }
							onClick={ () => setSelectedType( item.type ) }
						/> ) ) }
				</Stack>
			</Popover>
			<AttachDialog
				type={ selectedType }
				onAttach={ props.onAttach }
				onClose={ () => {
					setIsOpen( false );
					setSelectedType( null );
				} }
			/>
		</>
	);
};

Menu.propTypes = {
	items: PropTypes.arrayOf( PropTypes.shape( {
		title: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		icon: PropTypes.elementType,
	} ) ).isRequired,
	onAttach: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};
