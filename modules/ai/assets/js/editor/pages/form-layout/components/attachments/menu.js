import { useRef, useState } from 'react';
import { Button, Popover, Stack, useTheme } from '@elementor/ui';
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
			<Button
				ref={ anchorRef }
				disabled={ props.disabled }
				onClick={ () => setIsOpen( true ) }
				color="secondary"
				variant="text"
				sx={ {
					width: 24,
					minWidth: 24,
				} }
			>
				{ isOpen ? <XCircleIcon /> : <PlusCircleIcon /> }
			</Button>

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
	disabled: PropTypes.bool,
	onAttach: PropTypes.func,
	items: PropTypes.arrayOf( PropTypes.shape( MenuItem.propTypes ) ),
};
