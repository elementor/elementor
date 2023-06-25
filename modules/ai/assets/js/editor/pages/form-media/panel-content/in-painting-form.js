import { useEffect } from 'react';
import { Stack, Box, Button, Typography, InputAdornment, CircularProgress, Tooltip, IconButton, withDirection } from '@elementor/ui';
import PromptErrorMessage from '../../../components/prompt-error-message';
import { PANELS } from '../consts/consts';
import WandIcon from '../../../icons/wand-icon';
import Textarea from '../../../components/textarea';
import useImagePromptEnhancer from '../../../hooks/use-image-prompt-enhancer';
import ChevronLeftIcon from '../../../icons/chevron-left-icon';

const StyledChevronLeftIcon = withDirection( ChevronLeftIcon );

const InPaintingForm = ( {
	panelActive,
	prompt = '',
	setPrompt,
	submitPrompt,
	error,
	maskImage,
	backToTools,
} ) => {
	const {
		data: imagePromptData,
		isLoading: imagePromptIsLoading,
		send: imagePromptEnhancer,
	} = useImagePromptEnhancer( prompt );

	// Image Prompt Enhancer
	useEffect( () => {
		if ( ! imagePromptIsLoading && imagePromptData?.result ) {
			setPrompt( imagePromptData?.result );
		}
	}, [ imagePromptIsLoading ] );

	const handleSubmit = ( event ) => {
		// The fallback instruction should be hidden for the user.
		event.preventDefault();

		const finalPrompt = prompt || 'Remove object and fill based on the surroundings';

		submitPrompt( PANELS.IN_PAINTING, finalPrompt, maskImage );
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
				{ __( 'Generative Fill', 'elementor' ) }
			</Typography>
			<Typography variant="body1" color="secondary" sx={ { mb: 8 } }>
				{ __( 'Mark an area and edit it with a prompt.', 'elementor' ) }
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
							<InputAdornment
								position="end"
								sx={ {
									position: 'absolute',
									bottom: '24px',
									right: '8px',
								} }
							>
								{
									imagePromptIsLoading
										? <CircularProgress color="secondary" size={ 20 } sx={ { mr: 2 } } />
										: <Tooltip title={ __( 'Enhance prompt', 'elementor' ) }>
											<Box component="span" sx={ { cursor: 'pointer' } }>
												<IconButton
													size="small"
													color="secondary"
													onClick={ () => imagePromptEnhancer( prompt ) }
													disabled={ ! panelActive || imagePromptIsLoading || ! prompt }
												>
													<WandIcon />
												</IconButton>
											</Box>
										</Tooltip>
								}
							</InputAdornment>
						),
					} }
					sx={ {
						'& .MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline': {
							pb: 9,
							width: '89%',
						},
					} }
				/>

				<Button type="submit" variant="contained" disabled={ ! panelActive }>
					{ __( 'Generate', 'elementor' ) }
				</Button>
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
