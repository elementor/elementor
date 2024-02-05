import { useRef, useState } from 'react';
import { MenuItem, IconButton, ListItemIcon, Popover, Stack, useTheme } from '@elementor/ui';
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
				size="small"
				ref={ anchorRef }
				disabled={ props.disabled }
				onClick={ () => setIsOpen( true ) }
				color="secondary"
			>
				{ isOpen ? <XCircleIcon fontSize="small" /> : <PlusCircleIcon fontSize="small" /> }
			</IconButton>

			<Popover
				open={ isOpen }
				anchorEl={ anchorRef.current }
				onClose={ () => setIsOpen( false ) }
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'rtl' === direction ? 'right' : 'left',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'rtl' === direction ? 'right' : 'left',
				} }
			>
				<Stack sx={ {
					width: 440,
				} }>
					{ props.items.map( ( item ) => {
						const IconComponent = item.icon;
						return (
							<MenuItem
								key={ item.type }
								onClick={ () => {
									setSelectedType( item.type );
									setIsOpen( false );
								} }
							>
								<ListItemIcon>
									<IconComponent />
								</ListItemIcon>
								{ item.title }
							</MenuItem> );
					},
					) }
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
