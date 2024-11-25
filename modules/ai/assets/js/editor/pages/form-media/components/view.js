import Panel from '../../../components/ui/panel';
import { Box, Stack, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';
import Loader from '../../../components/loader';
import GenerateLoader from './generate-loader';
import PromptErrorMessage from '../../../components/prompt-error-message';
import BackButton from './back-button';
import { useLocation } from '../context/location-context';
import { useGlobalSettings } from '../context/global-settings-context';
import UsageMessages from '../../../components/usage-messages';
import { FREE_TRIAL_FEATURES_NAMES } from '../../../helpers/features-enum';

const ViewBackButton = ( { sx = {}, ...props } ) => {
	const { back } = useLocation();

	return (
		<BackButton
			onClick={ ( e ) => {
				e.preventDefault();
				back();
			} }
			{ ...props }
			sx={ { mb: 1, alignSelf: 'flex-start', ...sx } }
		/>
	);
};

ViewBackButton.propTypes = {
	sx: PropTypes.object,
};

const PanelHeading = ( { primary, secondary, ...props } ) => (
	<Stack spacing={ 1 } sx={ { mb: 3 } } { ...props }>
		<Typography variant="h4">{ primary }</Typography>
		{ secondary && <Typography variant="body1" color="secondary">{ secondary }</Typography> }
	</Stack>
);

PanelHeading.propTypes = {
	primary: PropTypes.string.isRequired,
	secondary: PropTypes.string,
};

const ContentHeading = ( { primary, secondary, ...props } ) => (
	<Stack gap={ 1.5 } sx={ { mb: 3 } } { ...props }>
		<Typography variant="h6">{ primary }</Typography>
		{ secondary && <Typography variant="subtitle1" color="secondary">{ secondary }</Typography> }
	</Stack>
);

ContentHeading.propTypes = {
	primary: PropTypes.string.isRequired,
	secondary: PropTypes.string,
};

const View = ( { children, ...props } ) => {
	return (
		<Box className="e-ai-dialog-content" display="flex" sx={ { overflowY: 'auto', position: 'relative' } } height="100%" { ...props }>
			{ children }
		</Box>
	);
};

const Content = ( { isLoading = false, isGenerating = false, children, ...props } ) => {
	if ( isGenerating ) {
		return <GenerateLoader />;
	}

	if ( isLoading ) {
		return (
			<Box sx={ { width: '100%', maxWidth: 600, margin: '0 auto', alignSelf: 'center' } }>
				<Loader color="inherit" />
			</Box>
		);
	}

	return (
		<Box sx={ { overflowY: 'auto', p: 4 } } flexGrow={ 1 } { ...props }>
			{ children }
		</Box>
	);
};

Content.propTypes = {
	children: PropTypes.node,
	isLoading: PropTypes.bool,
	isGenerating: PropTypes.bool,
};

const ErrorMessage = ( { sx = {}, ...props } ) => (
	<PromptErrorMessage actionPosition="bottom" { ...props } sx={ { mb: 2.5, ...sx } } />
);

ErrorMessage.propTypes = {
	sx: PropTypes.object,
};

const ViewPanel = ( props ) => {
	const { hasSubscription, usagePercentage } = useGlobalSettings();

	return (
		<Panel>
			<UsageMessages
				hasSubscription={ hasSubscription }
				usagePercentage={ usagePercentage }
				sx={ { mb: 4 } }
				feature={ FREE_TRIAL_FEATURES_NAMES.IMAGES }
			/>

			{ props.children }
		</Panel>
	);
};

ViewPanel.propTypes = {
	children: PropTypes.node,
};

View.Panel = ViewPanel;
View.Content = Content;
View.BackButton = ViewBackButton;
View.ErrorMessage = ErrorMessage;
View.PanelHeading = PanelHeading;
View.ContentHeading = ContentHeading;

View.propTypes = {
	children: PropTypes.node,
};

export default View;
