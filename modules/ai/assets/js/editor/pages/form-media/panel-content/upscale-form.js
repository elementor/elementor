import { Stack, Box, Button, Typography, Slider, FormControl, withDirection } from '@elementor/ui';
import PromptErrorMessage from '../../../components/prompt-error-message';
import { IMAGE_PROMPT_SETTINGS, PANELS } from '../consts/consts';
import ChevronLeftIcon from '../../../icons/chevron-left-icon';

const StyledChevronLeftIcon = withDirection( ChevronLeftIcon );

const UpscaleForm = ( {
	panelActive,
	updatePromptSettings,
	submitPrompt,
	error,
	backToTools,
} ) => {
	const handleSubmit = ( event ) => {
		event.preventDefault();
		submitPrompt( PANELS.UPSCALE );
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
				{ __( 'Resize', 'elementor' ) }
			</Typography>
			<Typography variant="body1" color="secondary" sx={ { mb: 8 } }>
				{ __( 'Make an image larger and improve it’s resolution.', 'elementor' ) }
			</Typography>

			{ error && <PromptErrorMessage error={ error } sx={ { mb: 6 } } actionPosition="bottom" onRetry={ handleSubmit } /> }

			<Stack gap={ 6 }>
				<FormControl sx={ { width: '100%' } }>
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

					<Button type="submit" variant="contained" disabled={ ! panelActive } sx={ { mt: 6 } }>
						{ __( 'Generate', 'elementor' ) }
					</Button>
				</FormControl>
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
