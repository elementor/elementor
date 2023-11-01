import Connect from './pages/connect';
import FormLayout from './pages/form-layout';
import GetStarted from './pages/get-started';
import Loader from './components/loader';
import UpgradeChip from './components/upgrade-chip';
import useUserInfo from './hooks/use-user-info';
import WizardDialog from './components/wizard-dialog';
import LayoutDialog from './pages/form-layout/components/layout-dialog';
import { Alert } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import useIntroduction from './hooks/use-introduction';
import { attachmentsShape } from './types/attachments';

const LayoutContent = ( {
	attachmentsTypes,
	attachments,
	onClose,
	onConnect,
	onData,
	onInsert,
	onSelect,
	onGenerate,
} ) => {
	const { isLoading, isConnected, isGetStarted, connectUrl, fetchData, hasSubscription, credits, usagePercentage } = useUserInfo();
	const { isViewed, markAsViewed } = useIntroduction( 'e-ai-builder-coming-soon-info' );

	if ( isLoading ) {
		return (
			<LayoutDialog onClose={ onClose }>
				<LayoutDialog.Header onClose={ onClose } />

				<LayoutDialog.Content dividers>
					<Loader BoxProps={ { sx: { px: 3 } } } />
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
			attachmentsTypes={ attachmentsTypes }
			attachments={ attachments }
			credits={ credits }
			onClose={ onClose }
			onInsert={ onInsert }
			onData={ onData }
			onSelect={ onSelect }
			onGenerate={ onGenerate }
			DialogHeaderProps={ {
				children: showUpgradeChip && <UpgradeChip hasSubscription={ hasSubscription } usagePercentage={ usagePercentage } />,
			} }
			DialogContentProps={ {
				children: ! isViewed && (
					<Alert
						severity="info"
						onClose={ markAsViewed }
					>
						{ __( "Layouts generated with AI only include some Elementor widgets, but we're evolving! More capabilities coming soon...", 'elementor' ) }
					</Alert>
				),
			} }
		/>
	);
};

LayoutContent.propTypes = {
	attachmentsTypes: PropTypes.object,
	attachments: attachmentsShape,
	onClose: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
	onData: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onGenerate: PropTypes.func.isRequired,
};

export default LayoutContent;
