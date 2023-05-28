import { Stack, Box, Button, Typography } from '@elementor/ui';
import GenerateButton from '../../../components/generate-button';
import PromptForm from './form-controls/prompt-form';
import PromptErrorMessage from '../../../components/prompt-error-message';
import RefreshIcon from '../../../icons/refresh-icon';

const ImageVariationsForm = ( {
	panelActive,
	editImage,
	prompt = '',
	setPrompt,
	generateNewPrompt,
	promptSettings,
	updatePromptSettings,
	submitPrompt,
	error,
	images,
} ) => {
	const handleSubmit = ( event ) => {
		event.preventDefault();
		submitPrompt();
	};

	return (
		<Box component="form" onSubmit={ handleSubmit }>
			<Typography variant="h4" sx={ { mb: 3 } }>
				{ __( 'Imagine anything create everything', 'elementor' ) }
			</Typography>
			<Typography variant="body1" sx={ { mb: 8 } }>
				{ __( 'Describe your vision to create stunning images for your website', 'elementor' ) }
			</Typography>

			{ error && <PromptErrorMessage error={ error } sx={ { mb: 6 } } actionPosition="bottom" onRetry={ handleSubmit } /> }

			<Box sx={ {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				bgcolor: 'background.paper',
				mb: 4,
			} }>
				<img src={ editImage?.image_url || editImage.url } alt={ prompt } style={ {
					width: 160,
					height: 160,
				} } />
			</Box>

			<PromptForm { ...{
				prompt,
				setPrompt,
				panelActive,
				promptSettings,
				updatePromptSettings,
				hasImage: true,
			} } />

			<Stack gap={ 5 } sx={ { my: 6 } }>
				{
					images.length
						? (
							<Button
								fullWidth
								size="large"
								type="submit"
								variant="contained"
								color="secondary"
								startIcon={ <RefreshIcon /> }
								disabled={ ( ! panelActive || '' === prompt ) }
							>
								{ __( 'Generate again', 'elementor' ) }
							</Button>
						)
						: (
							<GenerateButton disabled={ ! panelActive || '' === prompt } size="large">
								{ __( 'Generate images', 'elementor' ) }
							</GenerateButton>
						)
				}

				<Button variant="text" onClick={ generateNewPrompt } disabled={ ! panelActive } color="secondary">
					{ __( 'New prompt', 'elementor' ) }
				</Button>
			</Stack>
		</Box>
	);
};

ImageVariationsForm.propTypes = {
	panelActive: PropTypes.bool,
	prompt: PropTypes.string,
	setPrompt: PropTypes.func,
	generateNewPrompt: PropTypes.func,
	editImage: PropTypes.object,
	promptSettings: PropTypes.object,
	updatePromptSettings: PropTypes.func,
	submitPrompt: PropTypes.func,
	error: PropTypes.string,
	images: PropTypes.array,
};

export default ImageVariationsForm;
