import Connect from './pages/connect';
import FormLayout from './pages/form-layout';
import GetStarted from './pages/get-started';
import Loader from './components/loader';
import UpgradeChip from './components/upgrade-chip';
import useUserInfo from './hooks/use-user-info';
import WizardDialog from './components/wizard-dialog';
import LayoutDialog from './pages/form-layout/components/layout-dialog';
import PropTypes from 'prop-types';
import { AttachmentPropType } from './types/attachment';
import { useConfig } from './pages/form-layout/context/config';
import { useRequestIds } from './context/requests-ids';
import { useEffect, useState } from 'react';

const LayoutContent = ( props ) => {
	const { isLoading, isConnected, isGetStarted, connectUrl, fetchData, hasSubscription, usagePercentage: initialUsagePercentage } = useUserInfo();
	const { onClose, onConnect } = useConfig();
	const { updateUsagePercentage, usagePercentage } = useRequestIds();
	const [ isInitUsageDone, setIsInitUsageDone ] = useState( false );

	useEffect( () => {
		if ( ! isInitUsageDone && ( initialUsagePercentage || 0 === initialUsagePercentage ) ) {
			updateUsagePercentage( initialUsagePercentage );
			setIsInitUsageDone( true );
		}
	}, [ initialUsagePercentage, isInitUsageDone, updateUsagePercentage ] );

	if ( isLoading || ! isInitUsageDone ) {
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
			attachments={ props.attachments }
			DialogHeaderProps={ {
				children: showUpgradeChip && <UpgradeChip hasSubscription={ hasSubscription } usagePercentage={ usagePercentage } />,
			} }
		/>
	);
};

LayoutContent.propTypes = {
	attachments: PropTypes.arrayOf( AttachmentPropType ),
};

export default LayoutContent;
