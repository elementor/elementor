import { Stack, Box, Button, Typography, Slider, FormControl, Link, InputAdornment, IconButton } from '@elementor/ui';
import GenerateButton from '../../../components/generate-button';
import PromptForm from './form-controls/prompt-form';
import PromptErrorMessage from '../../../components/prompt-error-message';
import RefreshIcon from '../../../icons/refresh-icon';
import { IMAGE_ASPECT_RATIOS, IMAGE_PROMPT_SETTINGS, PANELS } from '../consts/consts';
import PromptActionSelection from '../../../components/prompt-action-selection';
import Textarea from '../../../components/textarea';
import ChevronLeftIcon from '../../../icons/chevron-left-icon';
import WandIcon from '../../../icons/wand-icon';
import useImagePromptEnhancer from '../../../hooks/use-image-prompt-enhancer';
import { useEffect } from 'react';

const OutPaintingForm = ( {
	panelActive,
	editImage,
	prompt = '',
	setPrompt,
	generateNewPrompt,
	promptSettings,
	updatePromptSettings,
	submitPrompt,
	error,
	maskImage,
	backToTools,
} ) => {
	const aspectRatio = promptSettings[ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ];
	const zoom = promptSettings[ IMAGE_PROMPT_SETTINGS.ZOOM ];

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
		submitPrompt( PANELS.OUT_PAINTING, prompt, maskImage );
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
				{ __( 'Expand Image', 'elementor' ) }
			</Typography>
			<Typography variant="body1" sx={ { mb: 8 } }>
				{ __( 'Generate images by selecting the desired type and style, and entering a prompt.', 'elementor' ) }
			</Typography>

			{ error && <PromptErrorMessage error={ error } sx={ { mb: 6 } } actionPosition="bottom" onRetry={ handleSubmit } /> }

			<Stack gap={ 6 }>
				<PromptActionSelection
					wrapperStyle={ { width: '100%' } }
					label={ __( 'Aspect ratio', 'elementor' ) }
					options={ Object.entries( IMAGE_ASPECT_RATIOS ).map( ( [ value, label ] ) => ( { label, value } ) ) }
					onChange={ ( event ) => updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.ASPECT_RATIO ]: event.target.value } ) }
					value={ aspectRatio }
					disabled={ ! panelActive }
				/>

				<FormControl sx={ { width: '100%', mb: 6 } }>
					<Slider
						onChange={ ( _, value ) => updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.ZOOM ]: value } ) }
						id={ 'zoom' }
						name={ 'zoom' }
						aria-label={ __( 'Reference strength', 'elementor' ) }
						defaultValue={ 1 }
						valueLabelDisplay="auto"
						step={ 0.1 }
						marks
						min={ 0.1 }
						max={ 2 }
						color="secondary"
					/>
				</FormControl>

				<Textarea
					minRows={ 3 }
					maxRows={ 6 }
					disabled={ ! panelActive || imagePromptIsLoading }
					placeholder={ __( 'Describe what you want to generate in the expended area (English only)', 'elementor' ) }
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
			</Stack>

			<Stack gap={ 5 } sx={ { my: 6 } }>
				<GenerateButton size="medium" disabled={ ! panelActive || '' === prompt }>
					{ __( 'Apply', 'elementor' ) }
				</GenerateButton>
			</Stack>
		</Box>
	);
};

OutPaintingForm.propTypes = {
	panelActive: PropTypes.bool,
	prompt: PropTypes.string,
	setPrompt: PropTypes.func,
	generateNewPrompt: PropTypes.func,
	editImage: PropTypes.object,
	promptSettings: PropTypes.object,
	updatePromptSettings: PropTypes.func,
	submitPrompt: PropTypes.func,
	error: PropTypes.string,
	maskImage: PropTypes.string,
	backToTools: PropTypes.func,
};

export default OutPaintingForm;
