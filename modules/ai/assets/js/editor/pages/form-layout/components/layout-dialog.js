import { useState, useRef } from 'react';
import { DialogTitle, Typography, Stack, IconButton, styled } from '@elementor/ui';
import StyledChip from '../../../components/ui/styled-chip';
import PromptDialog from '../../../components/prompt-dialog';
import { AIIcon, XIcon } from '@elementor/icons';

const StyledDialog = styled( PromptDialog )( ( { theme } ) => ( {
	'& .MuiDialog-container': {
		marginTop: 0,
		alignItems: 'flex-end',
		paddingBottom: theme.spacing( 9 ),
	},
	'& .MuiPaper-root': {
		margin: 0,
		maxHeight: '55vh',
	},
} ) );

const DialogHeader = ( { onClose, children } ) => (
	<DialogTitle sx={ { fontWeight: 'normal' } }>
		<AIIcon fontSize="large" sx={ { mr: 3 } } />

		<Typography component="span" variant="subtitle1" sx={ { fontWeight: 'bold', textTransform: 'uppercase' } }>
			{ __( 'AI Builder', 'elementor' ) }
		</Typography>

		<StyledChip label={ __( 'Beta', 'elementor' ) } color="default" sx={ { ml: 3 } } />

		<Stack direction="row" spacing={ 3 } alignItems="center" sx={ { ml: 'auto' } }>
			{ children }

			<IconButton
				size="small"
				aria-label="close"
				onClick={ onClose }
				sx={ { '&.MuiButtonBase-root': { mr: -4 } } }
			>
				<XIcon />
			</IconButton>
		</Stack>
	</DialogTitle>
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
