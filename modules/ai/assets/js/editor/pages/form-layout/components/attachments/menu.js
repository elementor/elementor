import { useRef, useState } from 'react';
import { MenuItem, IconButton, ListItemIcon, Popover, Stack, useTheme, Badge } from '@elementor/ui';
import XCircleIcon from '../../../../icons/x-circle-icon';
import PlusCircleIcon from '../../../../icons/plus-circle-icon';
import PropTypes from 'prop-types';
import { AttachDialog } from './attach-dialog';
import useIntroduction from '../../../../hooks/use-introduction';

export const Menu = ( props ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ selectedType, setSelectedType ] = useState( null );
	const { direction } = useTheme();
	const anchorRef = useRef( null );
	const { isViewed, markAsViewed } = useIntroduction( 'e-ai-attachment-badge' );

	return (
		<>
			<IconButton
				size="small"
				ref={ anchorRef }
				disabled={ props.disabled }
				onClick={ () => {
					setIsOpen( true );
					markAsViewed();
				} }
				color="secondary"
			>
				{ ( () => {
					if ( isOpen ) {
						return <XCircleIcon fontSize="small" />;
					} else if ( isViewed ) {
						return <PlusCircleIcon fontSize="small" />;
					}
					return <Badge color="primary" badgeContent=" " variant="dot"><PlusCircleIcon
						fontSize="small" /></Badge>;
				} )() }

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
