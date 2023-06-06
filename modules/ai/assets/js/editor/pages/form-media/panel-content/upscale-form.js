import { Stack, Box, Button, Typography, Slider, FormControl } from '@elementor/ui';
import GenerateButton from '../../../components/generate-button';
import PromptForm from './form-controls/prompt-form';
import PromptErrorMessage from '../../../components/prompt-error-message';
import RefreshIcon from '../../../icons/refresh-icon';
import { IMAGE_ASPECT_RATIOS, IMAGE_PROMPT_SETTINGS, PANELS } from '../consts/consts';
import PromptActionSelection from '../../../components/prompt-action-selection';
import Textarea from '../../../components/textarea';
import ChevronLeftIcon from '../../../icons/chevron-left-icon';

const UpscaleForm = ( {
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
	const upscale = promptSettings[ IMAGE_PROMPT_SETTINGS.UPSCALE_TO ];
	const handleSubmit = ( event ) => {
		event.preventDefault();
		submitPrompt( PANELS.UPSCALE );
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
				<ChevronLeftIcon />
			</Box>
			<Typography variant="h3" sx={ { mb: 3 } }>
				{ __( 'AI Enlarger', 'elementor' ) }
			</Typography>
			<Typography variant="body1" sx={ { mb: 8 } }>
				{ __( 'Enhance you Image with AI.', 'elementor' ) }
			</Typography>

			{ error && <PromptErrorMessage error={ error } sx={ { mb: 6 } } actionPosition="bottom" onRetry={ handleSubmit } /> }

			<Stack gap={ 6 }>
				<FormControl sx={ { width: '100%', mb: 6 } }>
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Typography variant="caption">512</Typography>

						<Typography variant="caption">1024</Typography>
					</Box>
					<Slider
						onChange={ ( _, value ) => updatePromptSettings( { [ IMAGE_PROMPT_SETTINGS.UPSCALE_TO ]: value } ) }
						id={ 'upscale_to' }
						name={ 'upscale_to' }
						aria-label={ __( 'Upscale to', 'elementor' ) }
						defaultValue={ 1 }
						valueLabelDisplay="auto"
						step={ 64 }
						marks
						min={ 512 }
						max={ 1024 }
						color="secondary"
					/>
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Typography variant="caption">{ __( 'Current', 'elementor' ) }</Typography>

						<Typography variant="caption">{ __( 'Output', 'elementor' ) }</Typography>
					</Box>
				</FormControl>
			</Stack>

			<Stack gap={ 5 } sx={ { my: 6 } }>
				<GenerateButton size="medium" disabled={ ! panelActive }>
					{ __( 'Apply', 'elementor' ) }
				</GenerateButton>
			</Stack>
		</Box>
	);
};

UpscaleForm.propTypes = {
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

export default UpscaleForm;
