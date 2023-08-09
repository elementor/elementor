import Connect from './pages/connect';
import FormLayout from './pages/form-layout';
import GetStarted from './pages/get-started';
import Loader from './components/loader';
import UpgradeChip from './components/upgrade-chip';
import useUserInfo from './hooks/use-user-info';
import WizardDialog from './components/wizard-dialog';
import LayoutDialog from './pages/form-layout/components/layout-dialog';
import { Alert } from '@elementor/ui';
import useIntroduction from './hooks/use-introduction';

const LayoutContent = ( { onClose, onConnect, onGenerationStart, onGenerationEnd, onInsert, onSelect } ) => {
	const { isLoading, isConnected, isGetStarted, connectUrl, fetchData, hasSubscription, credits, usagePercentage } = useUserInfo();
	const { isViewed, markAsViewed } = useIntroduction( 'e-ai-builder-no-images-info' );

	if ( isLoading ) {
		return (
			<LayoutDialog onClose={ onClose }>
				<LayoutDialog.Header onClose={ onClose } />

				<LayoutDialog.Content dividers>
					<Loader />
				</LayoutDialog.Content>
			</LayoutDialog>
		);
	}

	if ( ! isConnected ) {
		return (
			<WizardDialog onClose={ onClose }>
				<LayoutDialog onClose={ onClose } />

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
				<LayoutDialog onClose={ onClose } />

				<WizardDialog.Content dividers>
					<GetStarted onSuccess={ fetchData } />
				</WizardDialog.Content>
			</WizardDialog>
		);
	}

	const showUpgradeChip = ! hasSubscription || 80 <= usagePercentage;

	return (
		<FormLayout
			credits={ credits }
			onClose={ onClose }
			onInsert={ onInsert }
			onGenerationStart={ onGenerationStart }
			onGenerationEnd={ onGenerationEnd }
			onSelect={ onSelect }
			DialogHeaderProps={ {
				children: showUpgradeChip && <UpgradeChip hasSubscription={ hasSubscription } usagePercentage={ usagePercentage } />,
			} }
			DialogContentProps={ {
				children: ! isViewed && (
					<Alert
						color="info"
						onClose={ markAsViewed }
					>
						{ __( "At the moment images are not included, but we're working on it! stay tuned.", 'elementor' ) }
					</Alert>
				),
			} }
		/>
	);
};

LayoutContent.propTypes = {
	onClose: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
	onGenerationStart: PropTypes.func.isRequired,
	onGenerationEnd: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
};

export default LayoutContent;
