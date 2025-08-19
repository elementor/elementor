import { useState, useRef } from 'react';
import { AppBar, Toolbar, Typography, Stack, IconButton, Chip, styled } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import PromptDialog from '../../../components/prompt-dialog';
import { AIIcon, XIcon } from '@elementor/icons';

const StyledDialog = styled( PromptDialog )( () => ( {
	'& .MuiDialog-container': {
		marginTop: 0,
		alignItems: 'flex-end',
		paddingBottom: '16vh',
	},
	'& .MuiPaper-root': {
		margin: 0,
		maxHeight: '80vh',
	},
} ) );

const DialogHeader = ( { onClose, children } ) => (
	<AppBar sx={ { fontWeight: 'normal' } } color="transparent" position="relative">
		<Toolbar variant="dense">
			<AIIcon sx={ { mr: 1 } } />

			<Typography component="span" variant="subtitle2" sx={ { fontWeight: 'bold', textTransform: 'uppercase' } }>
				{ __( 'AI', 'elementor' ) }
			</Typography>

			<Chip label={ __( 'Beta', 'elementor' ) } color="default" size="small" sx={ { ml: 1 } } />

			<Stack direction="row" spacing={ 1 } alignItems="center" sx={ { ml: 'auto' } }>
				{ children }

				<IconButton
					size="small"
					aria-label="close"
					onClick={ onClose }
					sx={ { '&.MuiButtonBase-root': { mr: -1 } } }
				>
					<XIcon />
				</IconButton>
			</Stack>
		</Toolbar>
	</AppBar>
);

DialogHeader.propTypes = {
	children: PropTypes.node,
	onClose: PropTypes.func.isRequired,
};

const StyledDialogContent = styled( PromptDialog.Content )( () => ( {
	'&.MuiDialogContent-root': {
		padding: 0,
	},
} ) );

const LayoutDialog = ( { sx = {}, PaperProps = {}, ...props } ) => {
	const [ sxStyle, setSxStyle ] = useState( { pointerEvents: 'none' } );
	const timeoutRef = useRef( null );

	/**
	 * The PromptDialog is using disableScrollLock in order to allow scrolling the page when the Dialog is opened.
	 * When using the react-draggable library inside the editor, the background page scroll is not working smoothly.
	 * Therefore, we need to delay the pointerEvents: none, which allowing to scroll the page content.
	 */
	return (
		<StyledDialog
			maxWidth="md"
			PaperProps={ {
				sx: { pointerEvents: 'auto' },
				onMouseEnter: () => {
					clearTimeout( timeoutRef.current );

					setSxStyle( { pointerEvents: 'all' } );
				},
				onMouseLeave: () => {
					clearTimeout( timeoutRef.current );

					timeoutRef.current = setTimeout( () => {
						setSxStyle( { pointerEvents: 'none' } );
					}, 200 );
				},
				...PaperProps,
			} }
			{ ...props }
			sx={ { ...sxStyle, ...sx } }
		/>
	);
};

LayoutDialog.propTypes = {
	sx: PropTypes.object,
	PaperProps: PropTypes.object,
};

LayoutDialog.Header = DialogHeader;
LayoutDialog.Content = StyledDialogContent;

export default LayoutDialog;
