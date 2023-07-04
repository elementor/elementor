import Panel from '../../../components/ui/panel';
import { Box, Stack, Typography } from '@elementor/ui';
import Loader from '../../../components/loader';
import GenerateLoader from './generate-loader';
import PromptErrorMessage from '../../../components/prompt-error-message';
import BackButton from './back-button';
import { useLocation } from '../context/location-context';

const ViewBackButton = ( { sx = {}, ...props } ) => {
	const { back } = useLocation();

	return (
		<BackButton
			onClick={ ( e ) => {
				e.preventDefault();
				back();
			} }
			{ ...props }
			sx={ { mb: 3, alignSelf: 'flex-start', ...sx } }
		/>
	);
};

ViewBackButton.propTypes = {
	sx: PropTypes.object,
};

const PanelHeading = ( { primary, secondary, ...props } ) => (
	<Stack spacing={ 3 } sx={ { mb: 7 } } { ...props }>
		<Typography variant="h3">{ primary }</Typography>
		{ secondary && <Typography variant="body1" color="secondary">{ secondary }</Typography> }
	</Stack>
);

PanelHeading.propTypes = {
	primary: PropTypes.string.isRequired,
	secondary: PropTypes.string,
};

const ContentHeading = ( { primary, secondary, ...props } ) => (
	<Stack gap={ 4 } sx={ { mb: 7 } } { ...props }>
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
		<Box display="flex" sx={ { overflowY: 'auto' } } height="100%" { ...props }>
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
		<Box sx={ { overflowY: 'scroll', p: 8 } } flexGrow={ 1 } { ...props }>
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
	<PromptErrorMessage actionPosition="bottom" { ...props } sx={ { mb: 6, ...sx } } />
);

ErrorMessage.propTypes = {
	sx: PropTypes.object,
};

View.Panel = Panel;
View.Content = Content;
View.BackButton = ViewBackButton;
View.ErrorMessage = ErrorMessage;
View.PanelHeading = PanelHeading;
View.ContentHeading = ContentHeading;

View.propTypes = {
	children: PropTypes.node,
};

export default View;
