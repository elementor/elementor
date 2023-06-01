import { Stack, Box, Button, Typography } from '@elementor/ui';
import GenerateButton from '../../../components/generate-button';
import PromptForm from './form-controls/prompt-form';
import { PANELS } from '../consts/consts';
import PromptErrorMessage from '../../../components/prompt-error-message';
import RefreshIcon from '../../../icons/refresh-icon';

const ImagePromptForm = (
	{
		panelActive,
		prompt = '',
		setPrompt,
		generateNewPrompt,
		images,
		promptSettings,
		updatePromptSettings,
		submitPrompt,
		error,
	} ) => {
	const handleSubmit = ( event ) => {
		event.preventDefault();
		submitPrompt( PANELS.TEXT_TO_IMAGE, prompt );
	};

	return (
		<Box component="form" onSubmit={ handleSubmit }>
			<Typography variant="h3" sx={ { mb: 3 } }>
				{ __( 'Imagine anything create everything', 'elementor' ) }
			</Typography>
			<Typography variant="body1" sx={ { mb: 8 } }>
				{ __( 'Generate images by selecting the desired type and style, and entering a prompt.', 'elementor' ) }
			</Typography>

			{ error && <PromptErrorMessage error={ error } sx={ { mb: 6 } } actionPosition="bottom" onRetry={ handleSubmit } /> }

			<PromptForm
				{ ...{
					prompt,
					setPrompt,
					panelActive,
					promptSettings,
					updatePromptSettings,
				} }
			/>

			{
				images.length
					? (
						<Stack gap={ 5 } sx={ { my: 6 } }>
							<Button
								fullWidth
								type="submit"
								variant="contained"
								color="secondary"
								startIcon={ <RefreshIcon /> }
								disabled={ ( ! panelActive || '' === prompt ) }
							>
								{ __( 'Generate again', 'elementor' ) }
							</Button>

							<Button
								fullWidth
								variant="text"
								color="secondary"
								disabled={ ! panelActive }
								onClick={ generateNewPrompt }
							>
								{ __( 'New prompt', 'elementor' ) }
							</Button>
						</Stack>
					)
					: (
						<GenerateButton size="medium" disabled={ ( ! panelActive || '' === prompt ) } fullWidth sx={ { my: 6 } }>
							{ __( 'Generate images', 'elementor' ) }
						</GenerateButton>
					)
			}
		</Box>
	);
};

ImagePromptForm.propTypes = {
	panelActive: PropTypes.bool,
	prompt: PropTypes.string,
	setPrompt: PropTypes.func,
	generateNewPrompt: PropTypes.func,
	images: PropTypes.array,
	promptSettings: PropTypes.object,
	updatePromptSettings: PropTypes.func,
	submitPrompt: PropTypes.func,
	error: PropTypes.string,
};

export default ImagePromptForm;
