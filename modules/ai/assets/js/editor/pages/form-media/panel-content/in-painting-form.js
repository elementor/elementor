import { Stack, Box, Button, Typography, Link, InputAdornment, IconButton } from '@elementor/ui';
import GenerateButton from '../../../components/generate-button';
import PromptForm from './form-controls/prompt-form';
import PromptErrorMessage from '../../../components/prompt-error-message';
import RefreshIcon from '../../../icons/refresh-icon';
import { PANELS } from '../consts/consts';
import ChevronLeftIcon from '../../../icons/chevron-left-icon';
import Textarea from '../../../components/textarea';
import useImagePromptEnhancer from '../../../hooks/use-image-prompt-enhancer';
import { useEffect } from 'react';
import WandIcon from '../../../icons/wand-icon';

const InPaintingForm = ( {
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
	maskImage,
	backToTools,
} ) => {
	const {
		data: imagePromptData,
		isLoading: imagePromptIsLoading,
		error: imagePromptError,
		send: imagePromptEnhancer,
		sendUsageData: imagePromptSendUsageData,
		reset: imagePromptReset,
	} = useImagePromptEnhancer( prompt );

	// Image Prompt Enhancer
	useEffect( () => {
		if ( ! imagePromptIsLoading && imagePromptData?.result ) {
			setPrompt( imagePromptData?.result );
		}
	}, [ imagePromptIsLoading ] );

	const handleSubmit = ( event ) => {
		event.preventDefault();
		submitPrompt( PANELS.IN_PAINTING, prompt, maskImage );
	};

	return (
		<Box component="form" onSubmit={ handleSubmit }>
			<Box sx={ { mb: 3 } }>
				<Button
					variant="text"
					onClick={ ( e ) => {
						e.preventDefault();
						backToTools();
					} }
				>
					{ __( 'Back', 'elementor' ) }
				</Button>
			</Box>
			<Typography variant="h3" sx={ { mb: 3 } }>
				{ __( 'Generative Fill', 'elementor' ) }
			</Typography>
			<Typography variant="body1" sx={ { mb: 8 } }>
				{ __( 'Generate images by selecting the desired type and style, and entering a prompt.', 'elementor' ) }
			</Typography>

			{ error && <PromptErrorMessage error={ error } sx={ { mb: 6 } } actionPosition="bottom" onRetry={ handleSubmit } /> }

			<Stack gap={ 5 } sx={ { my: 6 } }>
				<Textarea
					minRows={ 3 }
					maxRows={ 6 }
					disabled={ ! panelActive || imagePromptIsLoading }
					placeholder={ __( 'Describe what you want to generate in the marked area (English only)', 'elementor' ) }
					onChange={ ( event ) => setPrompt( event.target.value ) }
					value={ prompt }
					InputProps={ {
						endAdornment: (
							<InputAdornment position="end">
								<IconButton onClick={ () => imagePromptEnhancer( prompt ) }>
									<WandIcon />
								</IconButton>
							</InputAdornment>
						),
					} }
				/>
				<GenerateButton size="medium" disabled={ ! panelActive || '' === prompt }>
					{ __( 'Apply', 'elementor' ) }
				</GenerateButton>
			</Stack>
		</Box>
	);
};

InPaintingForm.propTypes = {
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
	maskImage: PropTypes.string,
	backToTools: PropTypes.func,
};

export default InPaintingForm;
