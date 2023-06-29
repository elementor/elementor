import FormText from './pages/form-text';
import Connect from './pages/connect';
import FormCode from './pages/form-code';
import GetStarted from './pages/get-started';
import Loader from './components/loader';
import useUserInfo from './hooks/use-user-info';
import WizardDialog from './components/wizard-dialog';
import PromptDialog from './components/prompt-dialog';
import UpgradeChip from './components/upgrade-chip';

const PageContent = (
	{
		type,
		controlType,
		onClose,
		onConnect,
		getControlValue,
		setControlValue,
		additionalOptions,
	} ) => {
	const { isLoading, isConnected, isGetStarted, connectUrl, fetchData, hasSubscription, credits, usagePercentage } = useUserInfo();

	if ( isLoading ) {
		return (
			<PromptDialog onClose={ onClose }>
				<Loader />
			</PromptDialog>
		);
	}

	if ( ! isConnected ) {
		return (
			<WizardDialog onClose={ onClose }>
				<Connect
					connectUrl={ connectUrl }
					onSuccess={ ( data ) => {
						onConnect( data );
						fetchData();
					} }
				/>
			</WizardDialog>
		);
	}

	if ( ! isGetStarted ) {
		return (
			<WizardDialog onClose={ onClose }>
				<GetStarted onSuccess={ fetchData } />
			</WizardDialog>
		);
	}

	if ( 'code' === type ) {
		return (
			<PromptDialog onClose={ onClose } headerAction={ ! hasSubscription && <UpgradeChip /> }>
				<FormCode
					onClose={ onClose }
					getControlValue={ getControlValue }
					setControlValue={ setControlValue }
					additionalOptions={ additionalOptions }
					credits={ credits }
					usagePercentage={ usagePercentage }
				/>
			</PromptDialog>
		);
	}

	return (
		<PromptDialog onClose={ onClose } headerAction={ ! hasSubscription && <UpgradeChip /> }>
			<FormText
				type={ type }
				controlType={ controlType }
				onClose={ onClose }
				getControlValue={ getControlValue }
				setControlValue={ setControlValue }
				additionalOptions={ additionalOptions }
				credits={ credits }
				usagePercentage={ usagePercentage }
			/>
		</PromptDialog>
	);
};

PageContent.propTypes = {
	type: PropTypes.string,
	controlType: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
	getControlValue: PropTypes.func.isRequired,
	setControlValue: PropTypes.func.isRequired,
	additionalOptions: PropTypes.object,
};

export default PageContent;
