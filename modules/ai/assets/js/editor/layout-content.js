import Connect from './pages/connect';
import FormLayout from './pages/form-layout';
import GetStarted from './pages/get-started';
import Loader from './components/loader';
import PromptDialog from './components/prompt-dialog';
import StyledChip from './components/ui/styled-chip';
import UpgradeChip from './components/upgrade-chip';
import useUserInfo from './hooks/use-user-info';
import WizardDialog from './components/wizard-dialog';
import { DialogTitle, Typography, Stack, IconButton } from '@elementor/ui';
import { AIIcon, XIcon } from '@elementor/icons';

const promptDialogStyleProps = {
	sx: {
		pointerEvents: 'none',
		'&.MuiDialog-root': {
			top: 'initial',
		},
		'& .MuiDialog-container': {
			alignItems: 'flex-end',
		},
	},
	PaperProps: {
		sx: {
			m: 0,
			top: 'initial',
			bottom: ( { spacing } ) => spacing( 9 ),
			maxHeight: '40vh',
			pointerEvents: 'auto',
		},
	},
};

const DialogHeader = ( { onClose, children } ) => (
	<DialogTitle sx={ { fontWeight: 'normal' } }>
		<AIIcon fontSize="small" sx={ { mr: 3 } } />

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

const LayoutContent = ( { onClose, onConnect, onGenerated, onInsert, onSelect } ) => {
	const { isLoading, isConnected, isGetStarted, connectUrl, fetchData, hasSubscription, credits, usagePercentage } = useUserInfo();

	if ( isLoading ) {
		return (
			<PromptDialog onClose={ onClose } { ...promptDialogStyleProps } maxWidth="md">
				<DialogHeader onClose={ onClose } />

				<PromptDialog.Content dividers>
					<Loader />
				</PromptDialog.Content>
			</PromptDialog>
		);
	}

	if ( ! isConnected ) {
		return (
			<WizardDialog onClose={ onClose }>
				<DialogHeader onClose={ onClose } />

				<WizardDialog.Content dividers>
					<Connect
						connectUrl={ connectUrl }
						onSuccess={ ( data ) => {
							onConnect( data );
							fetchData();
						} }
					/>
				</WizardDialog.Content>
			</WizardDialog>
		);
	}

	if ( ! isGetStarted ) {
		return (
			<WizardDialog onClose={ onClose }>
				<DialogHeader onClose={ onClose } />

				<WizardDialog.Content dividers>
					<GetStarted onSuccess={ fetchData } />
				</WizardDialog.Content>
			</WizardDialog>
		);
	}

	const showUpgradeChip = ! hasSubscription || 80 <= usagePercentage;

	return (
		<PromptDialog
			maxWidth="md"
			onClose={ onClose }
			{ ...promptDialogStyleProps }
		>
			<DialogHeader onClose={ onClose }>
				{ showUpgradeChip && <UpgradeChip hasSubscription={ hasSubscription } usagePercentage={ usagePercentage } /> }
			</DialogHeader>

			<PromptDialog.Content dividers>
				<FormLayout
					credits={ credits }
					onClose={ onClose }
					onInsert={ onInsert }
					onGenerated={ onGenerated }
					onSelect={ onSelect }
				/>
			</PromptDialog.Content>
		</PromptDialog>
	);
};

LayoutContent.propTypes = {
	onClose: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
	onGenerated: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
};

export default LayoutContent;
