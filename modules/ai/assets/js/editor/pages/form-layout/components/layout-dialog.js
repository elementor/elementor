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
		maxHeight: '42vh',
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

const LayoutDialog = ( props ) => <StyledDialog maxWidth="md" { ...props } />;

LayoutDialog.Header = DialogHeader;
LayoutDialog.Content = StyledDialogContent;

export default LayoutDialog;
