import { Stack, Box, Button, Typography, withDirection } from '@elementor/ui';
import GenerateButton from '../../../components/generate-button';
import PromptForm from './form-controls/prompt-form';
import PromptErrorMessage from '../../../components/prompt-error-message';
import RefreshIcon from '../../../icons/refresh-icon';
import ChevronLeftIcon from '../../../icons/chevron-left-icon';

const StyledChevronLeftIcon = withDirection( ChevronLeftIcon );

const ImageVariationsForm = ( {
	panelActive,
	editImage,
	prompt = '',
	setPrompt,
	promptSettings,
	updatePromptSettings,
	submitPrompt,
	error,
	images,
	disableAspectRatio = false,
	backToTools,
	viewData,
} ) => {
	const handleSubmit = ( event ) => {
		event.preventDefault();
		submitPrompt();
	};

	return (
		<Box component="form" onSubmit={ handleSubmit }>
			<Box sx={ { mb: 3 } }>
				<Button
					size="small"
					variant="text"
					color="secondary"
					startIcon={ <StyledChevronLeftIcon /> }
					onClick={ ( e ) => {
						e.preventDefault();
						backToTools();
					} }
				>
					{ __( 'Back', 'elementor' ) }
				</Button>
			</Box>
			<Typography variant="h3" sx={ { mb: 3 } }>
				{ __( 'Variations', 'elementor' ) }
			</Typography>
			<Typography variant="body1" color="secondary" sx={ { mb: 8 } }>
				{ __( 'Create new versions of the original image.', 'elementor' ) }
			</Typography>

			{ error && <PromptErrorMessage error={ error } sx={ { mb: 6 } } actionPosition="bottom" onRetry={ handleSubmit } /> }

			<Box sx={ {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				bgcolor: 'secondary.background',
				mb: 4,
			} }>
				<img src={ editImage?.image_url || editImage.url } alt={ prompt } style={ {
					width: 'auto',
					height: 'auto',
					maxWidth: '100%',
					maxHeight: 166,
					objectFit: 'contained',
				} } />
			</Box>

			<PromptForm { ...{
				prompt,
				setPrompt,
				panelActive,
				promptSettings,
				updatePromptSettings,
				hasImage: true,
				disableAspectRatio,
				viewData,
			} } />

			<Stack gap={ 5 } sx={ { my: 6 } }>
				{
					images.length
						? (
							<Button
								fullWidth
								type="submit"
								variant="contained"
								color="secondary"
								startIcon={ <RefreshIcon /> }
								disabled={ ( ! panelActive || '' === prompt ) }
								sx={ {
									// TODO: Remove on @elementor/ui 1.4.51.
									color: 'background.paper',
								} }
							>
								{ __( 'Generate again', 'elementor' ) }
							</Button>
						)
						: (
							<GenerateButton size="medium" disabled={ ! panelActive || '' === prompt }>
								{ __( 'Generate images', 'elementor' ) }
							</GenerateButton>
						)
				}
			</Stack>
		</Box>
	);
};

ImageVariationsForm.propTypes = {
	panelActive: PropTypes.bool,
	prompt: PropTypes.string,
	setPrompt: PropTypes.func,
	editImage: PropTypes.object,
	promptSettings: PropTypes.object,
	updatePromptSettings: PropTypes.func,
	submitPrompt: PropTypes.func,
	error: PropTypes.string,
	images: PropTypes.array,
	disableAspectRatio: PropTypes.bool,
	backToTools: PropTypes.func,
	viewData: PropTypes.object,
};

export default ImageVariationsForm;
